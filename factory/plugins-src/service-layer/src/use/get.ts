import { randomBytes } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { SboError } from '../common/errors.ts'
import { dumpDir, readConfig, readCredentials } from '../common/layout.ts'
import { defaultTransport, request, type Transport } from '../common/sl.ts'
import { resolveEnvironment } from './environment.ts'
import { failure, success, type UseOutput } from './output.ts'
import { withSession } from './session.ts'

export interface GetOptions {
  root: string
  entitySet: string
  key: string
  environment?: string
  transport?: Transport
  now?: () => Date
  newId?: () => string
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

/** File name of a record in the Volcado: the key, made safe for a path. */
export const keyFileName = (plain: string) => encodeURIComponent(plain) + '.json'

export async function getByKey(options: GetOptions): Promise<UseOutput> {
  try {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(options.entitySet)) {
      throw new SboError('INVALID_ENTITY_SET', `"${options.entitySet}" is not an entity set name, for example BusinessPartners.`)
    }
    const config = await readConfig(options.root)
    const environment = await resolveEnvironment(options.root, options.environment)
    const credentials = await readCredentials(options.root, environment)
    const transport = options.transport ?? defaultTransport

    const parsed = parseKey(options.key)
    const path = `${options.entitySet}(${parsed.literal})`
    const response = await withSession(credentials, config.versionOData, transport, (cookie) =>
      request(transport, credentials, config.versionOData, 'GET', path, cookie),
    )
    let record: Record<string, unknown>
    try {
      record = JSON.parse(response.text)
    } catch {
      throw new SboError('SL_BAD_RESPONSE', `The Service Layer answered ${response.status} with a body that is not JSON. Check the URL and the Service Layer.`)
    }

    const date = (options.now ?? (() => new Date()))()
    const dir = dumpDir(options.root, environment, date, (options.newId ?? (() => randomBytes(3).toString('hex')))())
    const key = parsed.plain
    await mkdir(join(dir, options.entitySet), { recursive: true })
    await writeFile(join(dir, options.entitySet, keyFileName(key)), JSON.stringify(record, null, 2))
    await writeFile(
      join(dir, '_index.json'),
      JSON.stringify({ date: date.toISOString(), query: { method: 'GET', path }, entitySet: options.entitySet, count: 1, keys: [key] }, null, 2),
    )
    return success(response.status, { entorno: environment, entitySet: options.entitySet, filas: 1, ruta: dir, claves: [key] })
  } catch (e) {
    return failure(e)
  }
}
