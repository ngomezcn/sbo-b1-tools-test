/** The Contexto de objeto of an entity: `.sbo-skills/service-layer/<entorno>/context/<Entidad>.md`. */
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { SboError } from '../common/errors.ts'
import { contextPath } from '../common/layout.ts'
import { request } from '../common/sl.ts'
import { openUse, type UseContext, type UseOptions } from './context.ts'
import { failure, success, type UseOutput } from './output.ts'
import { assertEntitySet, collectRows, queryString, withQuery } from './rows.ts'
import { withSession } from './session.ts'
import { readHeader, renderContext, tablesFor, type TableMap, type UserField } from './metadata.ts'

/** A ficha older than this is regenerated before the next operation on its entity. */
export const CONTEXT_MAX_AGE_MS = 7 * 24 * 3_600_000
const MAX_USER_FIELDS = 5000

export interface EnsureOptions {
  /** The developer asked for a new one (command or flag). The AI never sets this by itself. */
  force?: boolean
  /** Tables to read user fields from, instead of the plugin's own map. */
  tables?: string[]
}

export interface ContextResult {
  path: string
  regenerated: boolean
}

async function isFresh(ctx: UseContext, file: string): Promise<boolean> {
  let text: string
  try {
    text = await readFile(file, 'utf8')
  } catch {
    return false
  }
  const header = readHeader(text)
  if (!header || header.odataVersion !== ctx.config.versionOData) return false
  const age = ctx.now().getTime() - header.fetchedAt.getTime()
  return age >= 0 && age <= CONTEXT_MAX_AGE_MS
}

async function fetchUserFields(ctx: UseContext, cookie: string, tables: TableMap): Promise<{ rows: UserField[]; truncated: boolean }> {
  const names = [...tables.main, ...Object.values(tables.collections)]
  const filter = names.map((t) => `TableName eq '${t.replace(/'/g, "''")}'`).join(' or ')
  const { rows, truncated } = await collectRows(ctx, cookie, withQuery('UserFieldsMD', queryString({ filter })), MAX_USER_FIELDS)
  return { rows: rows as unknown as UserField[], truncated }
}

/**
 * Makes sure the ficha of `entitySet` exists and is at most a week old, regenerating it if not (or if `force`).
 * Returns null when `$metadata` has no such entity set: the operation then goes ahead and the SL answers for itself.
 * The XML of `$metadata` is parsed and dropped; only the ficha is kept.
 */
export async function ensureContext(ctx: UseContext, entitySet: string, options: EnsureOptions = {}): Promise<ContextResult | null> {
  const file = contextPath(ctx.root, ctx.environment, entitySet)
  if (!options.force && !options.tables && (await isFresh(ctx, file))) return { path: file, regenerated: false }

  const tables: TableMap | null = options.tables ? { main: options.tables, collections: {} } : tablesFor(entitySet)
  const markdown = await withSession(ctx.session, async (cookie) => {
    const xml = (await request(ctx.transport, ctx.credentials, ctx.config.versionOData, 'GET', '$metadata', cookie)).text
    const fetched = tables ? await fetchUserFields(ctx, cookie, tables) : null
    return renderContext({
      entitySet,
      odataVersion: ctx.config.versionOData,
      versionB1: ctx.config.versionB1,
      fetchedAt: ctx.now(),
      xml,
      userFields: fetched?.rows ?? null,
      userFieldsTruncated: fetched?.truncated ?? false,
      tables,
    })
  })
  if (markdown === null) return null

  await mkdir(dirname(file), { recursive: true })
  // Written aside and renamed, so a parallel execution never reads half a ficha.
  const temp = `${file}.${ctx.newId()}.tmp`
  try {
    await writeFile(temp, markdown)
    await rename(temp, file)
  } finally {
    await rm(temp, { force: true })
  }
  return { path: file, regenerated: true }
}

/**
 * The context for an operation. A failure here (e.g. `UserFieldsMD` not readable) must not hide the data the developer asked for:
 * it becomes a warning in the output and the operation goes ahead; an older ficha, if there is one, is still pointed to.
 */
export async function contextForOperation(ctx: UseContext, entitySet: string, force: boolean | undefined): Promise<Record<string, unknown>> {
  try {
    return contextSummary(await ensureContext(ctx, entitySet, { force }))
  } catch (e) {
    const file = contextPath(ctx.root, ctx.environment, entitySet)
    const existing = await readFile(file, 'utf8').then(() => ({ contexto: file }), () => ({}))
    return { ...existing, contextoError: (e as Error).message }
  }
}

/** What an operation adds to its output so the AI knows where to read the ficha. */
export const contextSummary = (result: ContextResult | null) =>
  result ? { contexto: result.path, ...(result.regenerated ? { contextoRegenerado: true } : {}) } : {}

export interface ContextCommandOptions extends UseOptions {
  entitySet: string
  /** Regenerate even if the ficha is recent. */
  refresh?: boolean
  /** Return the text of the ficha in the output. */
  show?: boolean
  tables?: string[]
}

/** `context <EntitySet>`: the ficha path (regenerated if missing/old/asked), and its text with `show`. */
export async function contextCommand(options: ContextCommandOptions): Promise<UseOutput> {
  try {
    assertEntitySet(options.entitySet)
    const ctx = await openUse(options)
    const result = await ensureContext(ctx, options.entitySet, { force: options.refresh, tables: options.tables })
    if (!result) throw new SboError('ENTITY_NOT_FOUND', `${options.entitySet} is not an entity set of this Service Layer ($metadata does not list it). Check the name.`)
    const text = await readFile(result.path, 'utf8')
    const header = readHeader(text)
    return success(200, {
      entorno: ctx.environment,
      entitySet: options.entitySet,
      ruta: result.path,
      regenerado: result.regenerated,
      fecha: header?.fetchedAt.toISOString() ?? null,
      versionOData: ctx.config.versionOData,
      ...(options.show ? { contenido: text } : {}),
    })
  } catch (e) {
    return failure(e)
  }
}
