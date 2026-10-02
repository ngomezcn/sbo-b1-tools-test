/**
 * The multipart bodies of a `request`:
 *   - `$batch` (multipart/mixed): built from the developer's JSON, and the answer parsed back (docs: batch-operations.md);
 *   - file uploads (multipart/form-data, field `files`) for `Attachments2` and `ItemImages` (docs: attachments/upload.md).
 */
import { randomUUID } from 'node:crypto'
import { SboError } from '../common/errors.ts'
import { checkHeaderObject, hasHeader } from './headers.ts'
import { normalizePath, parseMethod, type Method } from './path.ts'

export interface SubRequest {
  method: Method
  /** Relative to the service root (`Orders`, `Items('i001')`) or a reference to an earlier Content-ID (`$1`, `$1/Cancel`). */
  path: string
  headers: Record<string, string>
  /** The body as it is sent (objects are serialised); absent when there is none. */
  body?: string
  /** Only inside a changeset (and optional outside one): names the sub-request and lets later ones refer to it as `$<id>`. */
  contentId?: string
}

export type BatchItem = { kind: 'request'; request: SubRequest } | { kind: 'changeset'; requests: SubRequest[] }

export interface Batch {
  items: BatchItem[]
}

const CONTENT_ID = /^[A-Za-z0-9_.-]{1,40}$/

function parseSubRequest(raw: unknown, where: string): SubRequest {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) throw new SboError('BATCH_INVALID', `${where} must be an object with "method" and "path".`)
  const r = raw as Record<string, unknown>
  const known = ['method', 'path', 'headers', 'body', 'contentId']
  const extra = Object.keys(r).filter((k) => !known.includes(k))
  if (extra.length > 0) throw new SboError('BATCH_INVALID', `${where} has unknown keys: ${extra.join(', ')}. Allowed: ${known.join(', ')}.`)
  if (typeof r.method !== 'string') throw new SboError('BATCH_INVALID', `${where}: "method" must be text (GET, POST, PATCH, PUT or DELETE).`)
  if (typeof r.path !== 'string') throw new SboError('BATCH_INVALID', `${where}: "path" must be text, for example "Orders(5)".`)
  const method = parseMethod(r.method, `${where}: "method"`)
  if (/^\$batch/i.test(r.path.replace(/^\/+/, ''))) throw new SboError('BATCH_INVALID', `${where}: a batch cannot contain another $batch.`)
  const path = normalizePath(r.path, `${where}: "path"`)
  const headers = checkHeaderObject(r.headers, where)
  let contentId: string | undefined
  if (r.contentId !== undefined) {
    if ((typeof r.contentId !== 'string' && typeof r.contentId !== 'number') || !CONTENT_ID.test(String(r.contentId))) {
      throw new SboError('BATCH_INVALID', `${where}: "contentId" must be letters, digits, "_", "." or "-" (up to 40), for example "1".`)
    }
    contentId = String(r.contentId)
  }
  let body: string | undefined
  if (r.body !== undefined) {
    if (method === 'GET') throw new SboError('BATCH_INVALID', `${where}: a GET has no body.`)
    body = typeof r.body === 'string' ? r.body : JSON.stringify(r.body)
  }
  return { method, path, headers, body, contentId }
}

/**
 * The developer's JSON:
 *   { "requests": [
 *       { "method": "GET", "path": "Items('i001')" },
 *       { "changeset": [ { "method": "POST", "path": "Orders", "contentId": "1", "body": {...} },
 *                        { "method": "PATCH", "path": "$1", "contentId": "2", "body": {...} } ] } ] }
 * A changeset is atomic and holds no GET. Sub-requests of a changeset without `contentId` get the next free number.
 */
export function parseBatchSpec(value: unknown): Batch {
  const spec = value as { requests?: unknown } | null
  if (spec === null || typeof spec !== 'object' || !Array.isArray(spec.requests) || spec.requests.length === 0) {
    throw new SboError('BATCH_INVALID', 'A batch file is {"requests": [ ... ]} with at least one entry; each entry is a request {method, path, headers?, body?, contentId?} or {"changeset": [requests]}.')
  }
  const extraTop = Object.keys(spec).filter((k) => k !== 'requests')
  if (extraTop.length > 0) throw new SboError('BATCH_INVALID', `The batch file has unknown keys: ${extraTop.join(', ')}. Only "requests" is allowed.`)
  const items: BatchItem[] = spec.requests.map((entry: unknown, i): BatchItem => {
    const where = `requests[${i}]`
    if (entry !== null && typeof entry === 'object' && 'changeset' in entry) {
      const set = (entry as { changeset: unknown }).changeset
      if (Object.keys(entry).length !== 1) throw new SboError('BATCH_INVALID', `${where}: a changeset entry has only the key "changeset".`)
      if (!Array.isArray(set) || set.length === 0) throw new SboError('BATCH_INVALID', `${where}.changeset must be a list with at least one request.`)
      const requests = set.map((r, j) => parseSubRequest(r, `${where}.changeset[${j}]`))
      requests.forEach((r, j) => {
        if (r.method === 'GET') throw new SboError('BATCH_INVALID', `${where}.changeset[${j}]: a changeset cannot contain a GET; put the read outside it.`)
      })
      return { kind: 'changeset', requests }
    }
    return { kind: 'request', request: parseSubRequest(entry, where) }
  })
  assignContentIds(items)
  return { items }
}

/** Content-IDs are unique in the batch; a changeset request without one gets the next free number; `$id` must name an earlier request of the same changeset. */
function assignContentIds(items: BatchItem[]): void {
  const used = new Set<string>()
  for (const item of items) for (const r of item.kind === 'request' ? [item.request] : item.requests) {
    if (r.contentId === undefined) continue
    if (used.has(r.contentId)) throw new SboError('BATCH_INVALID', `contentId "${r.contentId}" is used twice; each must be unique in the batch.`)
    used.add(r.contentId)
  }
  let next = 1
  for (const item of items) {
    if (item.kind !== 'changeset') continue
    const earlier = new Set<string>()
    for (const r of item.requests) {
      if (r.contentId === undefined) {
        while (used.has(String(next))) next++
        r.contentId = String(next)
        used.add(r.contentId)
      }
      const ref = /^\$([A-Za-z0-9_.-]+)(?:[/(?]|$)/.exec(r.path)?.[1]
      if (ref !== undefined && !earlier.has(ref)) {
        throw new SboError('BATCH_INVALID', `The path "${r.path}" refers to $${ref}, which is not an earlier request of the same changeset. A $<contentId> reference works only inside one changeset, after the request it names.`)
      }
      earlier.add(r.contentId)
    }
  }
  // A reference outside a changeset has nothing to point at.
  for (const item of items) {
    if (item.kind === 'request' && item.request.path.startsWith('$')) {
      throw new SboError('BATCH_INVALID', `The path "${item.request.path}" is a $<contentId> reference, which only works inside a changeset.`)
    }
  }
}

export const batchRequests = (batch: Batch): SubRequest[] => batch.items.flatMap((i) => (i.kind === 'request' ? [i.request] : i.requests))

/** The headers a sub-request goes with: its own, plus Content-Type for a body that has none. */
export function subRequestHeaders(r: SubRequest): Record<string, string> {
  return r.body !== undefined && !hasHeader(r.headers, 'Content-Type') ? { ...r.headers, 'Content-Type': 'application/json' } : r.headers
}

/** `/b1s/v2/<path>`, as the sub-request line carries it. */
export const subRequestTarget = (r: SubRequest, version: string) => `/b1s/${version}/${r.path}`

const CRLF = '\r\n'

function renderSubRequest(r: SubRequest, version: string): string {
  const headers = Object.entries(subRequestHeaders(r)).map(([k, v]) => `${k}: ${v}`)
  // After the request line and its headers a blank line ends the head; a GET has an empty body but the part still ends with a CRLF of its own.
  return [`${r.method} ${subRequestTarget(r, version)}`, ...headers].join(CRLF) + CRLF + CRLF + (r.body ?? '')
}

function part(headers: string[], content: string): string {
  return headers.join(CRLF) + CRLF + CRLF + content
}

/** The multipart/mixed body of a `$batch`, with its Content-Type. `ids` is injectable for tests. */
export function buildBatchBody(batch: Batch, version: string, ids: () => string = randomUUID): { body: string; contentType: string; boundary: string } {
  const boundary = `batch_${ids()}`
  const parts: string[] = []
  for (const item of batch.items) {
    if (item.kind === 'request') {
      const r = item.request
      const head = ['Content-Type: application/http', 'Content-Transfer-Encoding: binary', ...(r.contentId !== undefined ? [`Content-ID: ${r.contentId}`] : [])]
      parts.push(part(head, renderSubRequest(r, version)))
    } else {
      const inner = `changeset_${ids()}`
      const inside = item.requests.map((r) => part(['Content-Type: application/http', 'Content-Transfer-Encoding: binary', `Content-ID: ${r.contentId}`], renderSubRequest(r, version)))
      const changeset = inside.map((p) => `--${inner}${CRLF}${p}${CRLF}`).join('') + `--${inner}--`
      parts.push(part([`Content-Type: multipart/mixed;boundary=${inner}`], changeset))
    }
  }
  const body = parts.map((p) => `--${boundary}${CRLF}${p}${CRLF}`).join('') + `--${boundary}--${CRLF}`
  return { body, contentType: `multipart/mixed;boundary=${boundary}`, boundary }
}

// ---- the answer of a batch ----

export interface SubResponse {
  /** Content-ID of the part, when the Service Layer repeated it. */
  contentId?: string
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
}

export type ParsedItem = { kind: 'response'; response: SubResponse } | { kind: 'changeset'; responses: SubResponse[] }

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const boundaryOf = (contentType: string | null | undefined): string | undefined => /boundary="?([^";,\s]+)"?/i.exec(contentType ?? '')?.[1]

function splitParts(text: string, boundary: string): string[] {
  const delimiter = new RegExp(`(?:^|\\r?\\n)--${escapeRegExp(boundary)}(--)?[ \\t]*(?:\\r?\\n|$)`, 'g')
  const parts: string[] = []
  let last: number | null = null
  for (let m = delimiter.exec(text); m !== null; m = delimiter.exec(text)) {
    if (last !== null) parts.push(text.slice(last, m.index))
    if (m[1] === '--') return parts
    last = m.index + m[0].length
  }
  // No closing delimiter: the Service Layer cut the answer short.
  throw new SboError('SL_BAD_RESPONSE', 'The batch answer is not a complete multipart message (no closing boundary).')
}

function splitHead(text: string): { head: string; rest: string } {
  const m = /\r?\n\r?\n/.exec(text)
  if (text.startsWith('\r\n') || text.startsWith('\n')) return { head: '', rest: text.replace(/^\r?\n/, '') }
  return m ? { head: text.slice(0, m.index), rest: text.slice(m.index + m[0].length) } : { head: text, rest: '' }
}

function parseHeaders(head: string): Record<string, string> {
  const headers: Record<string, string> = {}
  for (const line of head.split(/\r?\n/)) {
    const colon = line.indexOf(':')
    if (colon > 0) headers[line.slice(0, colon).trim().toLowerCase()] = line.slice(colon + 1).trim()
  }
  return headers
}

function parseResponsePart(partHeaders: Record<string, string>, content: string): SubResponse {
  // The HTTP message may follow the part headers directly or after a blank line; skip leading blank lines.
  const message = content.replace(/^(?:\r?\n)+/, '')
  const { head, rest } = splitHead(message)
  const [statusLine, ...headerLines] = head.split(/\r?\n/)
  const m = /^HTTP\/\d(?:\.\d)?\s+(\d{3})\s*(.*)$/.exec(statusLine ?? '')
  if (!m) throw new SboError('SL_BAD_RESPONSE', `A part of the batch answer is not an HTTP response: "${(statusLine ?? '').slice(0, 80)}".`)
  const headers = parseHeaders(headerLines.join('\n'))
  return { contentId: partHeaders['content-id'] ?? headers['content-id'], status: Number(m[1]), statusText: m[2].trim(), headers, body: rest }
}

/** The multipart/mixed answer of a `$batch`: top-level responses in order, and the responses of each changeset. */
export function parseBatchResponse(text: string, contentType: string | null | undefined): ParsedItem[] {
  const boundary = boundaryOf(contentType)
  if (!/multipart\/mixed/i.test(contentType ?? '') || !boundary) {
    throw new SboError('SL_BAD_RESPONSE', `The batch answer is not multipart/mixed (Content-Type: ${contentType ?? 'none'}).`)
  }
  return splitParts(text, boundary).map((raw): ParsedItem => {
    const { head, rest } = splitHead(raw)
    const headers = parseHeaders(head)
    const inner = headers['content-type']
    if (inner && /multipart\/mixed/i.test(inner)) {
      const innerBoundary = boundaryOf(inner)
      if (!innerBoundary) throw new SboError('SL_BAD_RESPONSE', 'A changeset of the batch answer has no boundary.')
      const responses = splitParts(rest, innerBoundary).map((p) => {
        const h = splitHead(p)
        return parseResponsePart(parseHeaders(h.head), h.rest)
      })
      return { kind: 'changeset', responses }
    }
    return { kind: 'response', response: parseResponsePart(headers, rest) }
  })
}

// ---- file upload ----

const MIME: Record<string, string> = {
  txt: 'text/plain', csv: 'text/csv', json: 'application/json', xml: 'application/xml', html: 'text/html',
  pdf: 'application/pdf', zip: 'application/zip', doc: 'application/msword', xls: 'application/vnd.ms-excel',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', bmp: 'image/bmp', svg: 'image/svg+xml',
}

export const mimeFor = (fileName: string): string => MIME[/\.([A-Za-z0-9]+)$/.exec(fileName)?.[1]?.toLowerCase() ?? ''] ?? 'application/octet-stream'

export const extensionFor = (contentType: string | null | undefined): string => {
  const type = (contentType ?? '').split(';', 1)[0].trim().toLowerCase()
  if (type === 'image/jpeg') return 'jpg'
  if (type === 'text/plain') return 'txt'
  if (type === 'application/octet-stream' || type === '') return 'bin'
  return Object.entries(MIME).find(([, v]) => v === type)?.[0] ?? 'bin'
}

export interface UploadFile {
  name: string
  type: string
  bytes: Uint8Array
}

const quoted = (name: string) => name.replace(/[\r\n]/g, ' ').replace(/"/g, '%22')

/** multipart/form-data with one `files` field per file, as the Service Layer expects for Attachments2 and ItemImages. */
export function buildFormData(files: UploadFile[], boundary = `----sbo${randomUUID().replace(/-/g, '')}`): { body: Buffer; contentType: string } {
  const chunks: Buffer[] = []
  for (const f of files) {
    chunks.push(Buffer.from(`--${boundary}${CRLF}Content-Disposition: form-data; name="files"; filename="${quoted(f.name)}"${CRLF}Content-Type: ${f.type}${CRLF}${CRLF}`, 'utf8'), Buffer.from(f.bytes), Buffer.from(CRLF))
  }
  chunks.push(Buffer.from(`--${boundary}--${CRLF}`))
  return { body: Buffer.concat(chunks), contentType: `multipart/form-data; boundary=${boundary}` }
}
