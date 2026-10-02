/** POST, PATCH and DELETE (ADR 0008): in seco by default; only `--execute` sends them. */
import { readFile } from 'node:fs/promises'
import { SboError } from '../common/errors.ts'
import { baseUrl, request } from '../common/sl.ts'
import { openUse, type UseOptions } from './context.ts'
import { writeDump } from './dump.ts'
import { parseKey } from './get.ts'
import { failure, success, type UseOutput } from './output.ts'
import { contextForOperation } from './object-context.ts'
import { assertEntitySet, parseJson } from './rows.ts'
import { withSession } from './session.ts'

export type WriteMethod = 'POST' | 'PATCH' | 'DELETE'

export interface WriteOptions extends UseOptions {
  method: WriteMethod
  entitySet: string
  /** PATCH and DELETE: the key of the entity, as in `get`. */
  key?: string
  /** The JSON text of the body (POST, PATCH). */
  body?: string
  /** Path of a file holding the JSON body, instead of `body`. */
  bodyFile?: string
  /** Send the request. Without it, only the request is printed. */
  execute?: boolean
  /** The explicit mark that writing to `prod` needs, in that call. Different from `execute` on purpose. */
  allowProd?: boolean
}

export const PROD_FLAG = '--allow-prod'

/** The body as the developer wrote it (BOM removed) and what it parses to. The text is what is sent. */
async function readBody(options: WriteOptions): Promise<{ text: string; value: unknown } | undefined> {
  if (options.method === 'DELETE') {
    if (options.body !== undefined || options.bodyFile !== undefined) throw new SboError('INVALID_ARGUMENTS', 'DELETE takes no body. Remove --body / --body-file.')
    return undefined
  }
  if ((options.body === undefined) === (options.bodyFile === undefined)) {
    throw new SboError('INVALID_ARGUMENTS', `${options.method} needs the body: pass --body '<json>' or --body-file <path>, one of them.`)
  }
  let text = options.body
  if (text === undefined) {
    let bytes: Buffer
    try {
      bytes = await readFile(options.bodyFile!)
    } catch {
      throw new SboError('INVALID_BODY', `Could not read the body file ${options.bodyFile}. Check the path.`)
    }
    // Windows PowerShell 5.1 writes UTF-16 with `Out-File`.
    text = bytes[0] === 0xff && bytes[1] === 0xfe ? bytes.toString('utf16le') : bytes.toString('utf8')
  }
  text = text.replace(/^﻿/, '')
  try {
    return { text, value: JSON.parse(text) }
  } catch {
    throw new SboError('INVALID_BODY', 'The body is not valid JSON. Fix it; nothing was sent.')
  }
}

/** What would be sent, and what the SL answers if it is. */
export async function write(options: WriteOptions): Promise<UseOutput> {
  try {
    assertEntitySet(options.entitySet)
    if (options.method === 'POST' && options.key !== undefined) throw new SboError('INVALID_ARGUMENTS', 'POST takes no key. Usage: post <EntitySet> --body <json>')
    if (options.method !== 'POST' && options.key === undefined) throw new SboError('INVALID_ARGUMENTS', `Usage: ${options.method.toLowerCase()} <EntitySet> <key>${options.method === 'PATCH' ? " --body '<json>'" : ''}`)
    const body = await readBody(options)
    const ctx = await openUse(options)
    const parsedKey = options.key === undefined ? undefined : parseKey(options.key)
    const path = parsedKey ? `${options.entitySet}(${parsedKey.literal})` : options.entitySet
    const url = `${baseUrl(ctx.credentials.url, ctx.config.versionOData)}/${path}`
    const text = body?.text
    const peticion = { metodo: options.method, url, cuerpo: body?.value ?? null }
    const prod = ctx.environment === 'prod'

    if (options.execute && prod && !options.allowProd) {
      throw new SboError('PROD_WRITE_NOT_ALLOWED', `${ctx.environment} is production: a write needs ${PROD_FLAG} in this call, besides --execute. Ask the developer; it is not implied by any earlier approval. Nothing was sent.`)
    }
    // The ficha rule applies before any operation on the entity, the dry run included (it only reads).
    const context = await contextForOperation(ctx, options.entitySet, options.refreshContext)

    if (!options.execute) {
      const paraEjecutar = `Nothing was sent. After the developer approves, repeat the same call with --execute.${prod ? ` This is production: ${PROD_FLAG} is added only if the developer approves this production write explicitly.` : ''}`
      return success(null, { entorno: ctx.environment, ejecutado: false, peticion, paraEjecutar, ...context })
    }

    const headers: Record<string, string> = text === undefined ? {} : { 'Content-Type': 'application/json' }
    const response = await withSession(ctx.session, (cookie) => request(ctx.transport, ctx.credentials, ctx.config.versionOData, options.method, path, cookie, headers, text))
    const summary: Record<string, unknown> = { entorno: ctx.environment, ejecutado: true, peticion: { metodo: options.method, url }, ...context }
    if (response.text.trim() !== '') {
      // The SL answers a POST with the created record: it goes to a Volcado, not into the output.
      // The write is already done: a failure here must not look like a failed write.
      try {
        const record = parseJson(response)
        const { dir, keys } = await writeDump({
          root: ctx.root,
          environment: ctx.environment,
          now: ctx.now(),
          newId: ctx.newId,
          entitySet: options.entitySet,
          query: { method: options.method, path },
          records: [record],
          keys: parsedKey ? [parsedKey.plain] : undefined,
        })
        Object.assign(summary, { filas: 1, ruta: dir, claves: keys })
      } catch (e) {
        summary.volcadoError = `The write WAS done (HTTP ${response.status}) but its answer could not be saved: ${(e as Error).message}. Do not repeat the write; check with get.`
      }
    }
    return success(response.status, summary)
  } catch (e) {
    return failure(e)
  }
}
