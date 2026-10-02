/**
 * `request <METHOD> <path>`: any call the Service Layer allows (ADR 0012). The safety rules of ADR 0008 apply to it as a whole:
 * everything that is not a GET is a write, so it is a dry run until `--execute`, and `prod` also needs `--allow-prod`.
 * A POST that only reads (SQLQueries List, ...) is declared with `--read` and then runs directly.
 */
import { readFile, realpath, stat, writeFile } from 'node:fs/promises'
import { basename, join, resolve } from 'node:path'
import { SboError } from '../common/errors.ts'
import { credentialsPath, sessionPath } from '../common/layout.ts'
import { baseUrl, bodyBytes, parseSlError, request as sendRequest, type HttpResponse } from '../common/sl.ts'
import { ENVIRONMENTS } from '../common/versions.ts'
import { openUse, type UseContext, type UseOptions } from './context.ts'
import { keyFileName, objectKey, safeFileName, writeDump, writeFilesDump, type DumpInput } from './dump.ts'
import { hasHeader, parseHeaderFlags } from './headers.ts'
import {
  batchRequests,
  buildBatchBody,
  buildFormData,
  extensionFor,
  mimeFor,
  parseBatchResponse,
  parseBatchSpec,
  subRequestHeaders,
  subRequestTarget,
  type Batch,
  type ParsedItem,
  type SubResponse,
  type UploadFile,
} from './multipart.ts'
import { contextForOperation } from './object-context.ts'
import { failure, success, type UseOutput } from './output.ts'
import { entitySetOf, folderName, normalizePath, parseMethod, type Method } from './path.ts'
import { MAX_KEYS_IN_OUTPUT } from './rows.ts'
import { withSession } from './session.ts'

/** The Service Layer refuses an attachment of 50 MB or more (docs: attachments/download-and-update.md); the tool does not send what it knows will be refused. */
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024
export const PROD_FLAG = '--allow-prod'

export interface RequestOptions extends UseOptions {
  method: string
  path: string
  /** Each `--header "Name: value"`. */
  headers?: string[]
  /** JSON text of the body; for `$batch` the batch description. */
  body?: string
  bodyFile?: string
  /** `--file`: files sent as multipart/form-data (field `files`), for Attachments2 and ItemImages. */
  files?: string[]
  /** `--stream-file`: one file sent as the raw body, with its name in `Slug` (Attachments2, Pictures). */
  streamFile?: string
  /** The developer declares this POST a read: it runs directly and its answer goes to the Volcado. */
  read?: boolean
  execute?: boolean
  allowProd?: boolean
}

type Payload =
  | { kind: 'none' }
  | { kind: 'json'; text: string; value: unknown; contentType?: string }
  | { kind: 'batch'; batch: Batch }
  | { kind: 'form'; files: LoadedFile[] }
  | { kind: 'stream'; file: LoadedFile }

interface LoadedFile extends UploadFile {
  /** What the dry run shows instead of the bytes. */
  shown: { campo?: string; nombre: string; bytes: number; tipo: string }
}

const isBatchPath = (path: string) => /^\$batch(\?|$)/i.test(path)

/** The text of a body file; Windows PowerShell 5.1 writes UTF-16 with `Out-File`. */
async function readTextFile(path: string, what: string): Promise<string> {
  let bytes: Buffer
  try {
    bytes = await readFile(path)
  } catch {
    throw new SboError('INVALID_BODY', `Could not read the ${what} ${path}. Check the path.`)
  }
  return (bytes[0] === 0xff && bytes[1] === 0xfe ? bytes.toString('utf16le') : bytes.toString('utf8')).replace(/^﻿/, '')
}

/** The Setup's own files are never sent anywhere: not as a body, not as an upload. */
async function assertNotSecret(root: string, file: string): Promise<void> {
  const real = await realpath(file).catch(() => resolve(file))
  for (const env of ENVIRONMENTS) {
    for (const secret of [credentialsPath(root, env), sessionPath(root, env)]) {
      if (real === (await realpath(secret).catch(() => resolve(secret)))) {
        throw new SboError('FILE_FORBIDDEN', `${basename(file)} holds the credentials or the session of the Service Layer; the tool never sends it. Nothing was sent.`)
      }
    }
  }
}

async function loadFile(root: string, path: string): Promise<LoadedFile> {
  const file = resolve(root, path)
  const info = await stat(file).catch(() => null)
  if (!info?.isFile()) throw new SboError('FILE_NOT_FOUND', `"${path}" is not a file. Check the path (it is relative to the folder where the command runs).`)
  await assertNotSecret(root, file)
  if (info.size >= MAX_UPLOAD_BYTES) {
    throw new SboError('FILE_TOO_LARGE', `${basename(file)} is ${info.size} bytes; the Service Layer refuses an attachment of ${MAX_UPLOAD_BYTES / 1024 / 1024} MB or more (413). Nothing was sent.`)
  }
  const bytes = await readFile(file)
  const name = basename(file)
  const type = mimeFor(name)
  return { name, type, bytes, shown: { nombre: name, bytes: bytes.byteLength, tipo: type } }
}

async function readPayload(options: RequestOptions, method: Method, path: string, headers: Record<string, string>): Promise<Payload> {
  const given = [options.body !== undefined, options.bodyFile !== undefined, (options.files?.length ?? 0) > 0, options.streamFile !== undefined].filter(Boolean).length
  if (given === 0) {
    if (isBatchPath(path)) throw new SboError('INVALID_ARGUMENTS', "A $batch needs its description: --body-file <batch.json> (or --body '<json>').")
    return { kind: 'none' }
  }
  if (given > 1 || (options.body !== undefined && options.bodyFile !== undefined)) {
    throw new SboError('INVALID_ARGUMENTS', 'Give one kind of body: --body, --body-file, --file (repeatable) or --stream-file.')
  }
  if (method === 'GET') throw new SboError('INVALID_ARGUMENTS', 'A GET takes no body. Remove --body / --body-file / --file / --stream-file.')
  const customType = Object.entries(headers).find(([k]) => k.toLowerCase() === 'content-type')?.[1]
  if (options.files?.length || options.streamFile !== undefined) {
    if (isBatchPath(path)) throw new SboError('INVALID_ARGUMENTS', 'A $batch takes its description (--body-file), not files.')
    if (options.files?.length) {
      if (customType !== undefined) throw new SboError('HEADER_CONFLICT', 'With --file the tool sets Content-Type (multipart/form-data with its boundary). Remove that --header.')
      return { kind: 'form', files: await Promise.all(options.files.map((f) => loadFile(options.root, f))) }
    }
    return { kind: 'stream', file: await loadFile(options.root, options.streamFile!) }
  }
  let text = options.body
  if (text === undefined) {
    const file = resolve(options.root, options.bodyFile!)
    await assertNotSecret(options.root, file)
    text = await readTextFile(file, 'body file')
  }
  const json = customType === undefined || /json/i.test(customType)
  if (isBatchPath(path)) {
    if (customType !== undefined) throw new SboError('HEADER_CONFLICT', 'For a $batch the tool sets Content-Type (multipart/mixed with its boundary). Remove that --header.')
    let value: unknown
    try {
      value = JSON.parse(text)
    } catch {
      throw new SboError('INVALID_BODY', 'The batch file is not valid JSON. Fix it; nothing was sent.')
    }
    return { kind: 'batch', batch: parseBatchSpec(value) }
  }
  if (!json) return { kind: 'json', text, value: text, contentType: customType }
  try {
    return { kind: 'json', text, value: JSON.parse(text) }
  } catch {
    throw new SboError('INVALID_BODY', 'The body is not valid JSON. Fix it; nothing was sent.')
  }
}

/** What goes on the wire: body, and the headers the tool adds to the developer's own. */
function wire(payload: Payload, headers: Record<string, string>, version: string, ids?: () => string): { headers: Record<string, string>; body?: string | Uint8Array } {
  switch (payload.kind) {
    case 'none':
      return { headers }
    case 'json':
      return { headers: hasHeader(headers, 'Content-Type') ? headers : { ...headers, 'Content-Type': 'application/json' }, body: payload.text }
    case 'batch': {
      const built = buildBatchBody(payload.batch, version, ids)
      return { headers: { ...headers, 'Content-Type': built.contentType }, body: built.body }
    }
    case 'form': {
      const built = buildFormData(payload.files)
      return { headers: { ...headers, 'Content-Type': built.contentType }, body: built.body }
    }
    case 'stream':
      return {
        headers: { ...(hasHeader(headers, 'Content-Type') ? {} : { 'Content-Type': payload.file.type }), ...(hasHeader(headers, 'Slug') ? {} : { Slug: payload.file.name }), ...headers },
        body: payload.file.bytes,
      }
  }
}

/** The body as the dry run shows it: the parsed JSON, the file list (never bytes), or the sub-requests of a batch. */
function shownBody(payload: Payload): Record<string, unknown> {
  switch (payload.kind) {
    case 'none':
      return { cuerpo: null }
    case 'json':
      return { cuerpo: payload.value }
    case 'form':
      return { cuerpo: { formato: 'multipart/form-data', archivos: payload.files.map((f) => ({ campo: 'files', ...f.shown })) } }
    case 'stream':
      return { cuerpo: { formato: 'binario (el cuerpo es el archivo; su nombre va en Slug)', archivo: payload.file.shown } }
    case 'batch':
      return { cuerpo: null }
  }
}

function shownBatch(batch: Batch, version: string): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = []
  let set = 0
  for (const item of batch.items) {
    const group = item.kind === 'changeset' ? `changeset ${++set}` : null
    for (const r of item.kind === 'changeset' ? item.requests : [item.request]) {
      out.push({
        grupo: group,
        ...(r.contentId !== undefined ? { contentId: r.contentId } : {}),
        metodo: r.method,
        url: subRequestTarget(r, version),
        cabeceras: subRequestHeaders(r),
        cuerpo: r.body === undefined ? null : tryParse(r.body),
      })
    }
  }
  return out
}

const tryParse = (text: string): unknown => {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/** Response headers worth telling: the ones that carry a result, never `Set-Cookie`. */
function interestingHeaders(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {}
  for (const name of ['etag', 'location', 'odata-entityid', 'preference-applied', 'content-type', 'content-disposition']) {
    const value = headers.get(name)
    if (value) out[name] = value
  }
  return out
}

const isJson = (contentType: string | null) => /json/i.test(contentType ?? '')
const isTextual = (contentType: string | null) => /^text\/|xml|html|javascript/i.test(contentType ?? '')

/** File name of a download: Content-Disposition, then `?filename='x.png'`, then what the path says. */
export function downloadName(response: HttpResponse, path: string): string {
  const disposition = response.headers.get('content-disposition') ?? ''
  const star = /filename\*\s*=\s*(?:UTF-8|utf-8)''([^;]+)/.exec(disposition)?.[1]
  const plain = /filename\s*=\s*"?([^";]+)"?/.exec(disposition)?.[1]
  let name = star ? decodeURIComponentSafe(star) : plain
  if (!name) {
    const query = /[?&]filename=('?)([^&]*?)\1(?:&|$)/i.exec(path)?.[2]
    if (query) name = decodeURIComponentSafe(query)
  }
  if (!name) {
    const resource = path.split('?', 1)[0].replace(/\/\$value$/i, '')
    const last = resource.split('/').pop() ?? ''
    name = `${last.replace(/[^A-Za-z0-9_.-]+/g, '-').replace(/^-+|-+$/g, '') || 'download'}.${extensionFor(response.headers.get('content-type'))}`
  }
  return safeFileName(name)
}

const decodeURIComponentSafe = (text: string) => {
  try {
    return decodeURIComponent(text)
  } catch {
    return text
  }
}

function listKeys(dir: string, keys: string[]) {
  return keys.length <= MAX_KEYS_IN_OUTPUT ? { claves: keys } : { indice: join(dir, '_index.json') }
}

/** A collection or a batch becomes many files; one object, a text or a binary becomes one. Records never enter the output. */
async function present(ctx: UseContext, response: HttpResponse, path: string, query: { method: string; path: string }, batch?: Batch): Promise<Record<string, unknown>> {
  const folder = folderName(path)
  const common = { root: ctx.root, environment: ctx.environment, now: ctx.now(), newId: ctx.newId, entitySet: folder, query }
  const contentType = response.headers.get('content-type')
  const bytes = bodyBytes(response)
  const answered = { cabecerasRespuesta: interestingHeaders(response.headers) }

  if (bytes.byteLength === 0) return { tipo: 'vacio', ...answered }

  if (batch && /multipart\/mixed/i.test(contentType ?? '')) return { ...(await presentBatch(response, common, batch)), ...answered }

  if (isJson(contentType)) {
    let body: any
    try {
      body = JSON.parse(response.text)
    } catch {
      body = undefined
    }
    const rows: unknown[] | undefined = Array.isArray(body?.value) ? body.value : Array.isArray(body) ? body : undefined
    if (rows) {
      const records = rows.map((r) => (r !== null && typeof r === 'object' && !Array.isArray(r) ? (r as Record<string, unknown>) : { value: r }))
      const next: unknown = body['@odata.nextLink'] ?? body['odata.nextLink']
      const total: unknown = body['@odata.count'] ?? body['odata.count']
      const { dir, keys } = await writeDump({ ...common, records, extra: { ...(typeof next === 'string' ? { nextLink: next } : {}) } })
      return {
        tipo: 'coleccion',
        filas: keys.length,
        ruta: dir,
        ...listKeys(dir, keys),
        ...(typeof next === 'string' ? { siguiente: next } : {}),
        ...(total !== undefined ? { totalSL: total } : {}),
        ...answered,
      }
    }
    if (body !== null && typeof body === 'object' && !Array.isArray(body)) {
      const { dir, keys } = await writeDump({ ...common, records: [body], keys: [objectKey(body)] })
      return { tipo: 'objeto', filas: 1, ruta: dir, archivo: join(dir, folder, keyFileName(keys[0])), claves: keys, ...answered }
    }
  }

  const textual = isJson(contentType) || isTextual(contentType)
  const name = textual ? `response.${isJson(contentType) ? 'json' : /xml/i.test(contentType ?? '') ? 'xml' : /html/i.test(contentType ?? '') ? 'html' : 'txt'}` : downloadName(response, path)
  const { dir, paths, names } = await writeFilesDump({ ...common, files: [{ name, bytes, contentType: contentType ?? undefined }] })
  return { tipo: textual ? 'texto' : 'binario', bytes: bytes.byteLength, contentType: contentType ?? null, ruta: dir, archivo: paths[0], nombre: names[0], ...answered }
}

async function presentBatch(response: HttpResponse, common: Omit<DumpInput, 'records'>, batch: Batch): Promise<Record<string, unknown>> {
  // Read as latin1 (one char per byte) so a sub-response that is a file keeps its bytes; the text of the others is decoded back as UTF-8.
  const parsed = parseBatchResponse(Buffer.from(bodyBytes(response)).toString('latin1'), response.headers.get('content-type'), true)
  const flat = nameResponses(parsed, batch.items)
  // Unique ids (the Volcado names files by them, case-insensitively), so a file can be named after its sub-response.
  const taken = new Set<string>()
  const ids = flat.map((f) => {
    let id = f.id
    for (let n = 2; taken.has(id.toLowerCase()); n++) id = `${f.id}~${n}`
    taken.add(id.toLowerCase())
    return id
  })
  const files: { name: string; bytes: Buffer }[] = []
  const records = flat.map((f, i) => {
    const r = f.response
    const type = r.headers['content-type']
    const isFile = r.status < 400 && r.bytes !== undefined && r.bytes.length > 0 && !isJson(type ?? null) && !isTextual(type ?? null)
    if (!isFile) return { status: r.status, statusText: r.statusText, headers: r.headers, body: tryParse(r.body) }
    const name = safeFileName(`${ids[i]}.${extensionFor(type)}`)
    files.push({ name, bytes: r.bytes! })
    return { status: r.status, statusText: r.statusText, headers: r.headers, body: { binario: true, archivo: name, bytes: r.bytes!.length, contentType: type ?? null } }
  })
  const { dir, keys } = await writeDump({ ...common, records, keys: ids, extra: { statuses: flat.map((f) => f.response.status) } })
  await Promise.all(files.map((f) => writeFile(join(dir, common.entitySet, f.name), f.bytes)))
  const failed = flat.filter((f) => f.response.status >= 400).length
  const sent = batchRequests(batch).length
  return {
    tipo: 'lote',
    filas: keys.length,
    ruta: dir,
    claves: keys,
    subrespuestas: flat.slice(0, 200).map((f) => ({
      id: f.id,
      estado: f.response.status,
      ...(f.response.status >= 400 ? { error: literalError(f.response) } : {}),
    })),
    errores: failed,
    ...(failed > 0 || sent > flat.length ? { aviso: `${failed} sub-request(s) failed${sent > flat.length ? `; the batch stops at the first failure, so only ${flat.length} of ${sent} sub-requests have an answer (a failed changeset answers once for all of it)` : ''}. A failed changeset is rolled back as a whole.` } : {}),
  }
}

function literalError(r: SubResponse): { code: string | number | undefined; message: string } {
  const e = parseSlError(r.status, r.body)
  return { code: e.code, message: e.message }
}

/**
 * Names each answer by its Content-ID (its own, or the one of the request it answers) and, when there is none, by its place:
 * `part-<n>`, `part-<n>.<m>` inside a changeset, `changeset-<n>` for the single answer of a changeset that failed.
 */
export function nameResponses(parsed: ParsedItem[], requested: Batch['items']): { id: string; response: SubResponse }[] {
  const out: { id: string; response: SubResponse }[] = []
  parsed.forEach((item, i) => {
    const asked = requested[i]
    if (item.kind === 'response') {
      const own = item.response.contentId ?? (asked?.kind === 'request' ? asked.request.contentId : undefined)
      out.push({ id: own ?? (asked?.kind === 'changeset' ? `changeset-${i + 1}` : `part-${i + 1}`), response: item.response })
    } else {
      item.responses.forEach((response, j) => {
        const own = response.contentId ?? (asked?.kind === 'changeset' && asked.requests.length === item.responses.length ? asked.requests[j].contentId : undefined)
        out.push({ id: own ?? `part-${i + 1}.${j + 1}`, response })
      })
    }
  })
  return out
}

/** The entity sets a request touches, to apply the Contexto de objeto rule to each. */
function entitySetsOf(path: string, batch?: Batch): string[] {
  const paths = batch ? batchRequests(batch).map((r) => r.path) : [path]
  return [...new Set(paths.map(entitySetOf).filter((e): e is string => e !== null))]
}

export async function runRequest(options: RequestOptions): Promise<UseOutput> {
  try {
    const method = parseMethod(options.method)
    const path = normalizePath(options.path)
    const headers = parseHeaderFlags(options.headers)
    const payload = await readPayload(options, method, path, headers)
    const batch = payload.kind === 'batch' ? payload.batch : undefined
    if (isBatchPath(path) && method !== 'POST') throw new SboError('INVALID_METHOD', '$batch is always a POST.')

    // Read or write: everything that is not a GET is a write (ADR 0012), unless the developer declares it a read.
    const allGet = batch ? batchRequests(batch).every((r) => r.method === 'GET') : false
    if (options.read) {
      if (method !== 'GET' && method !== 'POST') throw new SboError('READ_NOT_ALLOWED', `--read declares a POST a read; ${method} always writes. Remove --read.`)
      if (payload.kind === 'form' || payload.kind === 'stream') throw new SboError('READ_NOT_ALLOWED', '--read cannot go with an upload: sending a file writes. Remove --read.')
      if (batch && !allGet) throw new SboError('READ_NOT_ALLOWED', '--read is only for a batch whose sub-requests are all GET; this one has writes. Remove --read: it is then a dry run until --execute.')
    }
    const reads = method === 'GET' || options.read === true
    // On prod only a call that really writes needs the mark: a batch of GETs sent without --read is a dry run but writes nothing.
    const writesData = !reads && (batch ? !allGet : true)

    const ctx = await openUse(options)
    const prod = ctx.environment === 'prod'
    if (options.execute && writesData && prod && !options.allowProd) {
      throw new SboError('PROD_WRITE_NOT_ALLOWED', `${ctx.environment} is production: a write needs ${PROD_FLAG} in this call, besides --execute. Ask the developer; it is not implied by any earlier approval. Nothing was sent.`)
    }

    const version = ctx.config.versionOData
    const url = `${baseUrl(ctx.credentials.url, version)}/${path}`
    const sets = entitySetsOf(path, batch)
    const contexts = await Promise.all(sets.map(async (s) => [s, await contextForOperation(ctx, s, options.refreshContext)] as const))
    const context: Record<string, unknown> =
      sets.length === 0 ? {} : batch ? { contextos: Object.fromEntries(contexts.map(([s, c]) => [s, c])) } : contexts[0][1]

    const toSend = wire(payload, headers, version)
    // The boundary is generated at send time; the dry run shows a placeholder so that what is approved reads the same as what is sent.
    const shownHeaders = Object.fromEntries(Object.entries(toSend.headers).map(([k, v]) => [k, /^content-type$/i.test(k) && /boundary=/i.test(v) ? v.replace(/boundary=.*$/i, 'boundary=<generated>') : v]))
    const peticion = {
      metodo: method,
      url,
      cabeceras: shownHeaders,
      ...(batch ? { lote: shownBatch(batch, version) } : shownBody(payload)),
    }

    if (!reads && !options.execute) {
      const paraEjecutar = `Nothing was sent. After the developer approves, repeat the same call with --execute.${prod && writesData ? ` This is production: ${PROD_FLAG} is added only if the developer approves this production write explicitly.` : ''}`
      return success(null, { entorno: ctx.environment, ejecutado: false, tipo: batch ? 'lote' : 'peticion', peticion, paraEjecutar, ...context })
    }

    const response = await withSession(ctx.session, (cookie) => sendRequest(ctx.transport, ctx.credentials, version, method, path, cookie, toSend.headers, toSend.body))
    const summary: Record<string, unknown> = { entorno: ctx.environment, ejecutado: true, peticion: { metodo: method, url, cabeceras: shownHeaders }, ...context }
    try {
      Object.assign(summary, await present(ctx, response, path, { method, path }, batch))
    } catch (e) {
      // A write that went through must not look like a failed one because its answer could not be saved or read.
      if (reads) throw e
      summary.volcadoError = `The request WAS sent (HTTP ${response.status}) but its answer could not be saved: ${(e as Error).message}. Do not repeat a write; check with get.`
    }
    return success(response.status, summary)
  } catch (e) {
    return failure(e)
  }
}
