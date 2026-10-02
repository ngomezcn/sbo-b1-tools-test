import { SboError } from '../common/errors.ts'
import { request } from '../common/sl.ts'
import { openUse, type UseOptions } from './context.ts'
import { writeDump } from './dump.ts'
import { failure, success, type UseOutput } from './output.ts'
import { contextForOperation } from './object-context.ts'
import { assertEntitySet, parseJson } from './rows.ts'
import { withSession } from './session.ts'

export interface GetOptions extends UseOptions {
  entitySet: string
  key: string
}

/**
 * The key as the caller meant it. Digits are a number (`5`); anything else is a string, quoted or not
 * (`C1` and `'C1'` are the same; a composite key `A='x',B=1` goes as written; `'O''Brien'` is `O'Brien`). A string key made only of digits must be passed quoted: `'123'`.
 */
/** `Name=value,Name=value` with values quoted (`'x'`) or numeric. A single string key that contains `=` must be quoted. */
const COMPOSITE_KEY = /^[A-Za-z_]\w*=('(?:[^']|'')*'|-?\d+)(,[A-Za-z_]\w*=('(?:[^']|'')*'|-?\d+))+$/

export function parseKey(key: string): { literal: string; plain: string } {
  // Composite key, written as OData writes it: `TableName='OCRD',FieldID=0`. Sent as given (values percent-encoded), never quoted as a whole.
  if (COMPOSITE_KEY.test(key)) {
    const literal = key.replace(/'((?:[^']|'')*)'/g, (_, inner: string) => `'${encodeURIComponent(inner)}'`)
    return { literal, plain: key.replace(/[='",]+/g, '-').replace(/^-|-$/g, '') }
  }
  if (/^-?\d+$/.test(key)) return { literal: key, plain: key }
  const plain = /^'.*'$/s.test(key) ? key.slice(1, -1).replace(/''/g, "'") : key
  return { literal: `'${encodeURIComponent(plain.replace(/'/g, "''"))}'`, plain }
}

export async function getByKey(options: GetOptions): Promise<UseOutput> {
  try {
    assertEntitySet(options.entitySet)
    const ctx = await openUse(options)
    const parsed = parseKey(options.key)
    const context = await contextForOperation(ctx, options.entitySet, options.refreshContext)
    const path = `${options.entitySet}(${parsed.literal})`
    const response = await withSession(ctx.session, (cookie) => request(ctx.transport, ctx.credentials, ctx.config.versionOData, 'GET', path, cookie))
    const record = parseJson(response)
    if (Array.isArray(record)) throw new SboError('SL_BAD_RESPONSE', `The Service Layer answered a list for ${path}. Check the key.`)
    const { dir, keys } = await writeDump({
      root: ctx.root,
      environment: ctx.environment,
      now: ctx.now(),
      newId: ctx.newId,
      entitySet: options.entitySet,
      query: { method: 'GET', path },
      records: [record],
      keys: [parsed.plain],
    })
    return success(response.status, { entorno: ctx.environment, entitySet: options.entitySet, filas: 1, ruta: dir, claves: keys, ...context })
  } catch (e) {
    return failure(e)
  }
}
