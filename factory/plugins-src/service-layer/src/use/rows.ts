/** Low level of reading rows: query string, pages, `nextLink`. Used by the read commands and the Contexto de objeto. */
import { SboError } from '../common/errors.ts'
import { baseUrl, request, type HttpResponse } from '../common/sl.ts'
import type { UseContext } from './context.ts'

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

export const withQuery = (path: string, query: string) => (query ? `${path}?${query}` : path)

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
export function readPage(ctx: UseContext, response: HttpResponse): Page {
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

export const maxPageSize = (size: number) => ({ Prefer: `odata.maxpagesize=${size}` })

export interface Collected {
  rows: Record<string, unknown>[]
  pages: number
  truncated: boolean
  status: number
}

/** Follows `nextLink` from `first` (100 rows per answer) until the end or `maxRows` rows. */
export async function collectRows(ctx: UseContext, cookie: string, first: string, maxRows: number): Promise<Collected> {
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
}
