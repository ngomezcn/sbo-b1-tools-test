import { SboError } from '../common/errors.ts'
import { request } from '../common/sl.ts'
import { openUse, type UseOptions } from './context.ts'
import { writeDump } from './dump.ts'
import { failure, success, type UseOutput } from './output.ts'
import { assertEntitySet, parseJson } from './read.ts'
import { withSession } from './session.ts'

export interface GetOptions extends UseOptions {
  entitySet: string
  key: string
}

/**
 * The key as the caller meant it. Digits are a number (`5`); anything else is a string, quoted or not
 * (`C1` and `'C1'` are the same; `'O''Brien'` is `O'Brien`). A string key made only of digits must be passed quoted: `'123'`.
 */
export function parseKey(key: string): { literal: string; plain: string } {
  if (/^-?\d+$/.test(key)) return { literal: key, plain: key }
  const plain = /^'.*'$/s.test(key) ? key.slice(1, -1).replace(/''/g, "'") : key
  return { literal: `'${encodeURIComponent(plain.replace(/'/g, "''"))}'`, plain }
}

export async function getByKey(options: GetOptions): Promise<UseOutput> {
  try {
    assertEntitySet(options.entitySet)
    const ctx = await openUse(options)
    const parsed = parseKey(options.key)
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
    return success(response.status, { entorno: ctx.environment, entitySet: options.entitySet, filas: 1, ruta: dir, claves: keys })
  } catch (e) {
    return failure(e)
  }
}
