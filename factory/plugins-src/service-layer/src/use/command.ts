/**
 *   node use.mjs get <EntitySet> <key>
 *   node use.mjs page <EntitySet> [--top N] [--skip N] [query options]
 *   node use.mjs traverse <EntitySet> [--max-rows N] [query options]
 *   node use.mjs count <EntitySet> [--filter ...]
 *   query options: --filter --select --orderby --expand (passed to the Service Layer as given)
 *   node use.mjs context <EntitySet> [--refresh] [--show] [--tables OCRD,CRD1 | default]
 *   node use.mjs clean <id|folder|path>   deletes that Volcado only
 *   node use.mjs post <EntitySet> --body '<json>' | --body-file <path>
 *   node use.mjs patch <EntitySet> <key> --body '<json>' | --body-file <path>
 *   node use.mjs delete <EntitySet> <key>
 *   writes only print the request unless --execute; on prod --execute also needs --allow-prod
 *   every command takes [--entorno dev|uat|prod]; read commands also [--refresh-context]
 */
import { parseArgs } from 'node:util'
import { SboError } from '../common/errors.ts'
import type { Transport } from '../common/sl.ts'
import type { UseOptions } from './context.ts'
import { cleanDump } from './clean.ts'
import { getByKey } from './get.ts'
import { failure, type UseOutput } from './output.ts'
import { contextCommand } from './object-context.ts'
import { count, readOnePage, traverse } from './read.ts'
import { write } from './write.ts'

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
  context: 'Usage: context <EntitySet> [--refresh] [--show] [--tables TABLE,TABLE | default]',
  clean: 'Usage: clean <id | folder name | path of the Volcado>',
  post: "Usage: post <EntitySet> --body '<json>' | --body-file <path> [--execute]",
  patch: "Usage: patch <EntitySet> <key> --body '<json>' | --body-file <path> [--execute]",
  delete: 'Usage: delete <EntitySet> <key> [--execute]',
}

function toInt(name: string, value: string | undefined): number | undefined {
  if (value === undefined) return undefined
  if (!/^\d+$/.test(value)) throw new SboError('INVALID_ARGUMENTS', `${name} must be a whole number, got "${value}".`)
  return Number(value)
}

/** `--tables OCRD,CRD1` -> the list; `--tables default` -> an empty list (go back to the plugin's own resolution). */
function parseTables(value: string | undefined): string[] | undefined {
  if (value === undefined) return undefined
  if (value.trim().toLowerCase() === 'default') return []
  const tables = value.split(',').map((t) => t.trim()).filter(Boolean)
  if (tables.length === 0) throw new SboError('INVALID_ARGUMENTS', USAGE.context)
  return tables
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
        'refresh-context': { type: 'boolean' },
        refresh: { type: 'boolean' },
        show: { type: 'boolean' },
        tables: { type: 'string' },
        body: { type: 'string' },
        'body-file': { type: 'string' },
        execute: { type: 'boolean' },
        'allow-prod': { type: 'boolean' },
      },
    })
    const [command, ...rest] = positionals
    const base: UseOptions = { root, environment: values.entorno, refreshContext: values['refresh-context'], ...deps }
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
      case 'context':
        return await contextCommand({ ...base, entitySet: one(USAGE.context), refresh: values.refresh, show: values.show, tables: parseTables(values.tables) })
      case 'clean':
        return await cleanDump({ ...base, target: one(USAGE.clean) })
      case 'post':
      case 'patch':
      case 'delete': {
        const wanted = command === 'post' ? 1 : 2
        if (rest.length !== wanted) throw new SboError('INVALID_ARGUMENTS', USAGE[command])
        return await write({
          ...base,
          method: command.toUpperCase() as 'POST' | 'PATCH' | 'DELETE',
          entitySet: rest[0],
          key: rest[1],
          body: values.body,
          bodyFile: values['body-file'],
          execute: values.execute,
          allowProd: values['allow-prod'],
        })
      }
      default:
        throw new SboError('UNKNOWN_COMMAND', `Unknown command "${command ?? ''}". Available: get, page, traverse, count, context, clean, post, patch, delete.`)
    }
  } catch (e) {
    if ((e as { code?: string }).code?.startsWith('ERR_PARSE_ARGS')) return failure(new SboError('INVALID_ARGUMENTS', (e as Error).message))
    return failure(e)
  }
}
