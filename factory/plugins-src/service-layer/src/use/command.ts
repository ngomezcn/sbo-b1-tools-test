/**
 *   node use.mjs get <EntitySet> <key>
 *   node use.mjs page <EntitySet> [--top N] [--skip N] [query options]
 *   node use.mjs traverse <EntitySet> [--max-rows N] [query options]
 *   node use.mjs count <EntitySet> [--filter ...]
 *   query options: --filter --select --orderby --expand (passed to the Service Layer as given)
 *   every command takes [--entorno dev|uat|prod]
 */
import { parseArgs } from 'node:util'
import { SboError } from '../common/errors.ts'
import type { Transport } from '../common/sl.ts'
import type { UseOptions } from './context.ts'
import { getByKey } from './get.ts'
import { failure, type UseOutput } from './output.ts'
import { count, readOnePage, traverse } from './read.ts'

export interface Deps {
  transport?: Transport
  now?: () => Date
  newId?: () => string
}

const USAGE = {
  get: "Usage: get <EntitySet> <key>. A string key made only of digits must be quoted: '123'.",
  page: 'Usage: page <EntitySet> [--top N] [--skip N] [--filter ...] [--select ...] [--orderby ...] [--expand ...]',
  traverse: 'Usage: traverse <EntitySet> [--max-rows N] [--filter ...] [--select ...] [--orderby ...] [--expand ...]',
  count: 'Usage: count <EntitySet> [--filter ...]',
}

function toInt(name: string, value: string | undefined): number | undefined {
  if (value === undefined) return undefined
  if (!/^\d+$/.test(value)) throw new SboError('INVALID_ARGUMENTS', `${name} must be a whole number, got "${value}".`)
  return Number(value)
}

export async function main(argv: string[], root: string, deps: Deps = {}): Promise<UseOutput> {
  try {
    const { values, positionals } = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        entorno: { type: 'string' },
        filter: { type: 'string' },
        select: { type: 'string' },
        orderby: { type: 'string' },
        expand: { type: 'string' },
        top: { type: 'string' },
        skip: { type: 'string' },
        'max-rows': { type: 'string' },
      },
    })
    const [command, ...rest] = positionals
    const base: UseOptions = { root, environment: values.entorno, ...deps }
    const query = { filter: values.filter, select: values.select, orderby: values.orderby, expand: values.expand }
    const one = (usage: string) => {
      if (rest.length !== 1) throw new SboError('INVALID_ARGUMENTS', usage)
      return rest[0]
    }
    switch (command) {
      case 'get':
        if (rest.length !== 2) throw new SboError('INVALID_ARGUMENTS', USAGE.get)
        return await getByKey({ ...base, entitySet: rest[0], key: rest[1] })
      case 'page':
        return await readOnePage({ ...base, ...query, entitySet: one(USAGE.page), top: toInt('--top', values.top), skip: toInt('--skip', values.skip) })
      case 'traverse':
        return await traverse({ ...base, ...query, entitySet: one(USAGE.traverse), maxRows: toInt('--max-rows', values['max-rows']) })
      case 'count':
        return await count({ ...base, entitySet: one(USAGE.count), filter: values.filter })
      default:
        throw new SboError('UNKNOWN_COMMAND', `Unknown command "${command ?? ''}". Available: get, page, traverse, count.`)
    }
  } catch (e) {
    if ((e as { code?: string }).code?.startsWith('ERR_PARSE_ARGS')) return failure(new SboError('INVALID_ARGUMENTS', (e as Error).message))
    return failure(e)
  }
}
