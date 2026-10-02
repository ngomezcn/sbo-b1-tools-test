/** The Contexto de objeto of an entity: `.sbo-skills/service-layer/<entorno>/context/<Entidad>.md`. */
import { readFile } from 'node:fs/promises'
import { SboError } from '../common/errors.ts'
import { contextPath } from '../common/layout.ts'
import { request, SlError } from '../common/sl.ts'
import { openUse, type UseContext, type UseOptions } from './context.ts'
import { ensureEntityIndex, missingEntityMessage } from './entity-index.ts'
import { failure, success, type UseOutput } from './output.ts'
import { assertEntitySet, collectRows, parseJson, queryString, withQuery } from './rows.ts'
import { withSession } from './session.ts'
import { CACHE_MAX_AGE_MS, getMetadata, withMetadataLock, writeAside } from './metadata-source.ts'
import { entityTypeOf, readChosenTables, readHeader, renderContext, tablesFor, type TableMap, type UserField } from './metadata.ts'

/** A ficha older than this is regenerated before the next operation on its entity. */
export const CONTEXT_MAX_AGE_MS = CACHE_MAX_AGE_MS
const MAX_USER_FIELDS = 5000

export interface EnsureOptions {
  /** The developer asked for a new one (command or flag). The AI never sets this by itself. */
  force?: boolean
  /**
   * Tables to read user fields from, chosen by the developer with `--tables`, instead of the plugin's own resolution.
   * They are kept in the ficha and reused when it is regenerated. An empty list goes back to the plugin's resolution.
   */
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
 * The tables of an entity's user fields. First the plugin's own map (user tables without an object included), then the
 * Service Layer itself: an entity set that is not in the map may be a user object, and `UserObjectsMD('<code>')` says its
 * table and its child tables (the collection of a child table is `<ObjectName>Collection`, checked live). Null when it is neither.
 */
async function resolveTables(ctx: UseContext, cookie: string, entitySet: string): Promise<TableMap | null> {
  const own = tablesFor(entitySet)
  if (own) return own
  let object: { TableName?: string; UserObjectMD_ChildTables?: { TableName: string; ObjectName: string }[] }
  try {
    const path = `UserObjectsMD('${entitySet}')?$select=Code,TableName,UserObjectMD_ChildTables`
    object = parseJson(await request(ctx.transport, ctx.credentials, ctx.config.versionOData, 'GET', path, cookie))
  } catch (e) {
    if (e instanceof SlError && e.status === 404) return null
    throw e
  }
  if (!object.TableName) return null
  const collections = Object.fromEntries((object.UserObjectMD_ChildTables ?? []).map((c) => [`${c.ObjectName}Collection`, `@${c.TableName}`]))
  return { main: [`@${object.TableName}`], collections }
}

/**
 * Makes sure the ficha of `entitySet` exists and is at most a week old, regenerating it if not (or if `force`).
 * Returns null when `$metadata` has no such entity set: the operation then goes ahead and the SL answers for itself.
 * The XML of `$metadata` is parsed and dropped; only the ficha is kept.
 */
export async function ensureContext(ctx: UseContext, entitySet: string, options: EnsureOptions = {}): Promise<ContextResult | null> {
  const file = contextPath(ctx.root, ctx.environment, entitySet)
  const mayReuse = !options.force && options.tables === undefined
  const reuse = async (): Promise<ContextResult | null | undefined> => {
    if (!mayReuse) return undefined
    return (await isFresh(ctx, file)) ? { path: file, regenerated: false } : undefined
  }
  const early = await reuse()
  if (early !== undefined) return early
  // Parallel executions: one downloads `$metadata`, the others wait and then find the ficha ready. The lock is the index's too.
  return withMetadataLock(ctx, async () => {
    const again = await reuse()
    return again !== undefined ? again : generate(ctx, entitySet, file, options)
  })
}

async function generate(ctx: UseContext, entitySet: string, file: string, options: EnsureOptions): Promise<ContextResult | null> {
  // `--tables` is kept in the ficha: an automatic regeneration reuses what the developer chose.
  const chosen = options.tables === undefined ? await savedTables(file) : options.tables.length > 0 ? options.tables : null
  const markdown = await withSession(ctx.session, async (cookie) => {
    const xml = await getMetadata(ctx, cookie)
    if (entityTypeOf(xml, entitySet) === null) return null
    const tables: TableMap | null = chosen ? { main: chosen, collections: {} } : await resolveTables(ctx, cookie, entitySet)
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
      chosenTables: chosen ?? undefined,
    })
  })
  // Nothing is written for an entity set `$metadata` does not list: the next operation looks again (and so renews the Índice de entidades).
  if (markdown === null) return null
  await writeAside(ctx, file, markdown)
  return { path: file, regenerated: true }
}

async function savedTables(file: string): Promise<string[] | null> {
  const text = await readFile(file, 'utf8').catch(() => null)
  return text === null ? null : readChosenTables(text)
}

/**
 * The context for an operation. A failure here (e.g. `UserFieldsMD` not readable) must not hide the data the developer asked for:
 * it becomes a warning in the output and the operation goes ahead; an older ficha, if there is one, is still pointed to.
 */
export async function contextForOperation(ctx: UseContext, entitySet: string, force: boolean | undefined): Promise<Record<string, unknown>> {
  ctx.entitySets.add(entitySet)
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
  /** `--tables`; an empty list (`--tables default`) goes back to the plugin's own resolution. */
  tables?: string[]
}

/** `context <EntitySet>`: the ficha path (regenerated if missing/old/asked), and its text with `show`. */
export async function contextCommand(options: ContextCommandOptions): Promise<UseOutput> {
  try {
    assertEntitySet(options.entitySet)
    const ctx = await openUse(options)
    const result = await ensureContext(ctx, options.entitySet, { force: options.refresh, tables: options.tables })
    if (!result) {
      // `$metadata` was just downloaded and does not list it: the index is renewed with that same download, and read by the AI next.
      await ensureEntityIndex(ctx, { force: true }).catch(() => {})
      throw new SboError('ENTITY_NOT_FOUND', missingEntityMessage(ctx, [options.entitySet]))
    }
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
