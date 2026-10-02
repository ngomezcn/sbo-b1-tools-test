/**
 *   node use.mjs get <EntitySet> <key> [--entorno dev|uat|prod]
 */
import { parseArgs } from 'node:util'
import { SboError } from '../common/errors.ts'
import type { Transport } from '../common/sl.ts'
import { getByKey } from './get.ts'
import { failure, type UseOutput } from './output.ts'

export async function main(argv: string[], root: string, transport?: Transport): Promise<UseOutput> {
  try {
    const { values, positionals } = parseArgs({ args: argv, allowPositionals: true, options: { entorno: { type: 'string' } } })
    const [command, ...rest] = positionals
    if (command === 'get') {
      if (rest.length !== 2) throw new SboError('INVALID_ARGUMENTS', "Usage: get <EntitySet> <key> [--entorno dev|uat|prod]. A string key made only of digits must be quoted: '123'.")
      return await getByKey({ root, entitySet: rest[0], key: rest[1], environment: values.entorno, transport })
    }
    throw new SboError('UNKNOWN_COMMAND', `Unknown command "${command ?? ''}". Available: get.`)
  } catch (e) {
    if ((e as { code?: string }).code?.startsWith('ERR_PARSE_ARGS')) return failure(new SboError('INVALID_ARGUMENTS', (e as Error).message))
    return failure(e)
  }
}
