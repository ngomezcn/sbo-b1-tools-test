/** Reading many records: one page, count, and traverse (follows `nextLink`). */
import { join } from 'node:path'
import { SboError } from '../common/errors.ts'
import { baseUrl, request, type HttpResponse } from '../common/sl.ts'
import { openUse, type UseContext, type UseOptions } from './context.ts'
import { writeDump } from './dump.ts'
import { failure, success, type UseOutput } from './output.ts'
import { withSession } from './session.ts'

/** Page size asked of the SL when traversing. Never 0: that means "no limit" and one answer could be enormous. */
export const PAGE_SIZE = 100
export const DEFAULT_PAGE_TOP = 20
export const DEFAULT_MAX_ROWS = 1000
/** More keys than this and the output carries the index path instead of the list. */
export const MAX_KEYS_IN_OUTPUT = 50

/** The options of the query, passed to the SL as given (not reinterpreted). */
export interface QueryOptions {
  filter?: string
  select?: string
  orderby?: string
  expand?: string
  top?: number
  skip?: number
}

export function assertEntitySet(name: string): void {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    throw new SboError('INVALID_ENTITY_SET', `"${name}" is not an entity set name, for example BusinessPartners.`)
  }
}

/** Percent-encodes a value but keeps the characters OData uses in expressions (`'()*,/:;=$@`). */
const encodeValue = (value: string) =>
  encodeURIComponent(value).replace(/%(27|28|29|2A|2C|2F|3A|3B|3D|24|40)/g, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)))

export function queryString(q: QueryOptions): string {
  const parts: string[] = []
  if (q.filter !== undefined) parts.push(`$filter=${encodeValue(q.filter)}`)
  if (q.select !== undefined) parts.push(`$select=${encodeValue(q.select)}`)
  if (q.orderby !== undefined) parts.push(`$orderby=${encodeValue(q.orderby)}`)
  if (q.expand !== undefined) parts.push(`$expand=${encodeValue(q.expand)}`)
  if (q.top !== undefined) parts.push(`$top=${q.top}`)
  if (q.skip !== undefined) parts.push(`$skip=${q.skip}`)
  return parts.join('&')
}

const withQuery = (path: string, query: string) => (query ? `${path}?${query}` : path)

export function parseJson(response: HttpResponse): any {
  try {
    return JSON.parse(response.text)
  } catch {
    throw new SboError('SL_BAD_RESPONSE', `The Service Layer answered ${response.status} with a body that is not JSON. Check the URL and the Service Layer.`)
  }
}

interface Page {
  rows: Record<string, unknown>[]
  /** Path of the next page relative to the service root, if the SL says there is one. */
  next?: string
}

/** v1 calls it `odata.nextLink`, v2 `@odata.nextLink`; both come relative to the service root (`Orders?$skip=100`). */
function readPage(ctx: UseContext, response: HttpResponse): Page {
  const body = parseJson(response)
  if (!Array.isArray(body?.value)) throw new SboError('SL_BAD_RESPONSE', 'The Service Layer answer has no "value" list. Is that an entity set?')
  const link: unknown = body['@odata.nextLink'] ?? body['odata.nextLink']
  if (link === undefined) return { rows: body.value }
  if (typeof link !== 'string') throw new SboError('SL_BAD_RESPONSE', 'The Service Layer sent a nextLink that is not text.')
  const root = baseUrl(ctx.credentials.url, ctx.config.versionOData) + '/'
  if (/^https?:/i.test(link)) {
    if (!link.startsWith(root)) throw new SboError('SL_BAD_RESPONSE', 'The Service Layer sent a nextLink to another address; it was not followed.')
    return { rows: body.value, next: link.slice(root.length) }
  }
  return { rows: body.value, next: link.replace(/^\/+/, '') }
}

const maxPageSize = (size: number) => ({ Prefer: `odata.maxpagesize=${size}` })

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
    return success(response.status, summary(ctx, options.entitySet, dir, keys))
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
    const first = withQuery(options.entitySet, queryString(options))

    // Everything the callback does is redone from scratch if the session has to be replaced (401).
    const { rows, pages, truncated, status } = await withSession(ctx.session, async (cookie) => {
      const rows: Record<string, unknown>[] = []
      let path: string | undefined = first
      let pages = 0
      let status = 200
      let truncated = false
      while (path !== undefined) {
        const response = await request(ctx.transport, ctx.credentials, ctx.config.versionOData, 'GET', path, cookie, maxPageSize(PAGE_SIZE))
        status = response.status
        pages++
        const page = readPage(ctx, response)
        rows.push(...page.rows)
        path = page.next
        if (rows.length >= maxRows) {
          // The rest is cut off if it was there (more rows in hand, or another page announced).
          truncated = rows.length > maxRows || path !== undefined
          rows.length = Math.min(rows.length, maxRows)
          break
        }
      }
      return { rows, pages, truncated, status }
    })

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
    return success(status, summary(ctx, options.entitySet, dir, keys, { paginas: pages, truncado: truncated, tope: maxRows }))
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
    const path = withQuery(`${options.entitySet}/$count`, queryString({ filter: options.filter }))
    const response = await withSession(ctx.session, (cookie) => request(ctx.transport, ctx.credentials, ctx.config.versionOData, 'GET', path, cookie))
    const text = response.text.trim()
    if (!/^\d+$/.test(text)) {
      throw new SboError('SL_BAD_RESPONSE', `The Service Layer answered ${response.status} to ${path} with something that is not a number.`)
    }
    return success(response.status, { entorno: ctx.environment, entitySet: options.entitySet, total: Number(text) })
  } catch (e) {
    return failure(e)
  }
}
