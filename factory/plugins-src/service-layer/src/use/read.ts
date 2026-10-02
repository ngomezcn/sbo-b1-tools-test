/** Reading many records: one page, count, and traverse (follows `nextLink`). */
import { join } from 'node:path'
import { SboError } from '../common/errors.ts'
import { request } from '../common/sl.ts'
import { openUse, type UseContext, type UseOptions } from './context.ts'
import { writeDump } from './dump.ts'
import { contextForOperation } from './object-context.ts'
import { failure, success, type UseOutput } from './output.ts'
import { withSession } from './session.ts'
import { assertEntitySet, collectRows, DEFAULT_MAX_ROWS, DEFAULT_PAGE_TOP, MAX_KEYS_IN_OUTPUT, maxPageSize, PAGE_SIZE, parseJson, queryString, readPage, withQuery, type QueryOptions } from './rows.ts'

function summary(ctx: UseContext, entitySet: string, dir: string, keys: string[], extra: Record<string, unknown> = {}) {
  return {
    entorno: ctx.environment,
    entitySet,
    filas: keys.length,
    ...extra,
    ruta: dir,
    ...(keys.length <= MAX_KEYS_IN_OUTPUT ? { claves: keys } : { indice: join(dir, '_index.json') }),
  }
}

export interface PageOptions extends UseOptions, QueryOptions {
  entitySet: string
}

/** One page: `$top` rows (20 by default) from `$skip`. Does not follow `nextLink`. */
export async function readOnePage(options: PageOptions): Promise<UseOutput> {
  try {
    assertEntitySet(options.entitySet)
    const top = options.top ?? DEFAULT_PAGE_TOP
    if (!Number.isInteger(top) || top < 1 || top > PAGE_SIZE) {
      throw new SboError('INVALID_ARGUMENTS', `--top must be a whole number from 1 to ${PAGE_SIZE}. For more rows use traverse.`)
    }
    const ctx = await openUse(options)
    const context = await contextForOperation(ctx, options.entitySet, options.refreshContext)
    const path = withQuery(options.entitySet, queryString({ ...options, top }))
    // Ask for as many rows per answer as `$top` wants, so one request covers it (the SL default is 20).
    const response = await withSession(ctx.session, (cookie) =>
      request(ctx.transport, ctx.credentials, ctx.config.versionOData, 'GET', path, cookie, maxPageSize(top)),
    )
    const { rows } = readPage(ctx, response)
    const { dir, keys } = await writeDump({
      root: ctx.root,
      environment: ctx.environment,
      now: ctx.now(),
      newId: ctx.newId,
      entitySet: options.entitySet,
      query: { method: 'GET', path },
      records: rows,
    })
    return success(response.status, summary(ctx, options.entitySet, dir, keys, context))
  } catch (e) {
    return failure(e)
  }
}

export interface TraverseOptions extends UseOptions, Omit<QueryOptions, 'top' | 'skip'> {
  entitySet: string
  maxRows?: number
}

/** All pages: follows `nextLink` (100 rows per answer) until the end or `maxRows` rows. */
export async function traverse(options: TraverseOptions): Promise<UseOutput> {
  try {
    assertEntitySet(options.entitySet)
    const maxRows = options.maxRows ?? DEFAULT_MAX_ROWS
    if (!Number.isInteger(maxRows) || maxRows < 1) throw new SboError('INVALID_ARGUMENTS', '--max-rows must be a whole number of at least 1.')
    const ctx = await openUse(options)
    const context = await contextForOperation(ctx, options.entitySet, options.refreshContext)
    const first = withQuery(options.entitySet, queryString(options))

    // Everything the callback does is redone from scratch if the session has to be replaced (401).
    const { rows, pages, truncated, status } = await withSession(ctx.session, (cookie) => collectRows(ctx, cookie, first, maxRows))

    const { dir, keys } = await writeDump({
      root: ctx.root,
      environment: ctx.environment,
      now: ctx.now(),
      newId: ctx.newId,
      entitySet: options.entitySet,
      query: { method: 'GET', path: first },
      records: rows,
      extra: { pages, truncated, maxRows },
    })
    return success(status, summary(ctx, options.entitySet, dir, keys, { paginas: pages, truncado: truncated, tope: maxRows, ...context }))
  } catch (e) {
    return failure(e)
  }
}

export interface CountOptions extends UseOptions {
  entitySet: string
  filter?: string
}

/** `GET <EntitySet>/$count`: plain text with the number, the same in v1 and v2 (TESTING.md). No Volcado: there are no records. */
export async function count(options: CountOptions): Promise<UseOutput> {
  try {
    assertEntitySet(options.entitySet)
    const ctx = await openUse(options)
    const context = await contextForOperation(ctx, options.entitySet, options.refreshContext)
    const path = withQuery(`${options.entitySet}/$count`, queryString({ filter: options.filter }))
    const response = await withSession(ctx.session, (cookie) => request(ctx.transport, ctx.credentials, ctx.config.versionOData, 'GET', path, cookie))
    const text = response.text.trim()
    if (!/^\d+$/.test(text)) {
      throw new SboError('SL_BAD_RESPONSE', `The Service Layer answered ${response.status} to ${path} with something that is not a number.`)
    }
    return success(response.status, { entorno: ctx.environment, entitySet: options.entitySet, total: Number(text), ...context })
  } catch (e) {
    return failure(e)
  }
}
