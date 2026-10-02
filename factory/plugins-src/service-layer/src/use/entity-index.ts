/**
 * The Índice de entidades of an environment: which entity sets it exposes, in two Markdown files so that the AI reads
 * only the part it needs: the standard SAP ones (names only) and the user-defined ones (tables and objects).
 * It lists entities only, never fields (that is the Contexto de objeto) and never actions or functions.
 */
import { readFile } from 'node:fs/promises'
import { standardIndexPath, userIndexPath } from '../common/layout.ts'
import { SlError } from '../common/sl.ts'
import type { ODataVersion } from '../common/versions.ts'
import type { UseContext } from './context.ts'
import { CONTEXT_HEADER, entitySetNames, readHeader } from './metadata.ts'
import type { UseOutput } from './output.ts'
import { CACHE_MAX_AGE_MS, downloadedMetadata, getMetadata, withMetadataLock, writeAside } from './metadata-source.ts'
import { collectRows, queryString, withQuery } from './rows.ts'
import { withSession } from './session.ts'

/** A row of `UserTablesMD` (only what the index uses). */
export interface UserTableRow {
  TableName: string
  TableDescription?: string | null
  TableType?: string
}

/** A row of `UserObjectsMD` (only what the index uses). */
export interface UserObjectRow {
  Code: string
  Name?: string | null
  TableName?: string
}

export interface IndexInput {
  xml: string
  odataVersion: ODataVersion
  versionB1: string
  fetchedAt: Date
  /** Null when `UserTablesMD` could not be read: the tables are then taken from `$metadata`, without description. */
  userTables: UserTableRow[] | null
  /** Null when `UserObjectsMD` could not be read: objects cannot be told from standard entities. */
  userObjects: UserObjectRow[] | null
}

const byName = (a: string, b: string) => a.localeCompare(b, 'en')

const heading = (title: string, input: IndexInput, ...more: string[]) =>
  [
    `# ${title}`,
    '',
    `- ${CONTEXT_HEADER.fetched}: ${input.fetchedAt.toISOString()}`,
    `- ${CONTEXT_HEADER.odata}: ${input.odataVersion} (B1 ${input.versionB1})`,
    ...more,
  ].join('\n')

/**
 * A user-defined table without a user object is exposed as `U_<TABLE>` (TableType `bott_NoObject`). One with a user object is
 * exposed under the object's code, and its lines tables are collections of that object: neither is an entity set of its own.
 */
export function renderEntityIndex(input: IndexInput): { standard: string; user: string } {
  const sets = entitySetNames(input.xml)
  const objects = input.userObjects
  const objectCodes = new Set((objects ?? []).map((o) => o.Code))

  const entries: { name: string; line: string }[] = []
  if (input.userTables) {
    for (const t of input.userTables.filter((t) => t.TableType === 'bott_NoObject')) {
      entries.push({ name: `U_${t.TableName}`, line: `- U_${t.TableName} — user table${t.TableDescription ? ` — ${t.TableDescription}` : ''}` })
    }
  } else {
    for (const name of sets.filter((s) => s.startsWith('U_'))) entries.push({ name, line: `- ${name} — user table` })
  }
  for (const o of objects ?? []) entries.push({ name: o.Code, line: `- ${o.Code} — user object${o.Name ? ` — ${o.Name}` : ''}` })
  entries.sort((a, b) => byName(a.name, b.name))

  const standardNames = sets.filter((s) => !s.startsWith('U_') && !objectCodes.has(s)).sort(byName)
  const standard = [
    heading(
      'Standard SAP entities',
      input,
      `- ${standardNames.length} entity sets, by name as they go in the URL. No fields: the Contexto de objeto of an entity has them. User tables and user objects are in entities-user.md.`,
    ),
    '',
    standardNames.join(', '),
    '',
  ].join('\n')

  const notes = [
    ...(input.userTables ? [] : ['- UserTablesMD could not be read: the tables come from $metadata, without description.']),
    ...(objects ? [] : ['- UserObjectsMD could not be read: user objects are not listed here (they may appear among the standard entities).']),
  ]
  const user = [
    heading('User-defined entities', input, '- One line per entity set, as it goes in the URL: a user table (`U_<TABLE>`) or a user object (its code).', ...notes),
    '',
    ...(entries.length > 0 ? entries.map((e) => e.line) : ['None.']),
    '',
  ].join('\n')
  return { standard, user }
}

const MAX_ROWS = 5000

export interface IndexResult {
  standard: string
  user: string
  regenerated: boolean
}

async function isFresh(ctx: UseContext): Promise<boolean> {
  const [standard, user] = await Promise.all([readFile(standardIndexPath(ctx.root, ctx.environment), 'utf8').catch(() => null), readFile(userIndexPath(ctx.root, ctx.environment), 'utf8').catch(() => null)])
  const header = standard === null || user === null ? null : readHeader(standard)
  if (!header || header.odataVersion !== ctx.config.versionOData) return false
  const age = ctx.now().getTime() - header.fetchedAt.getTime()
  return age >= 0 && age <= CACHE_MAX_AGE_MS
}

/**
 * Rows of a collection the index may do without: a refusal or a missing table gives null (the index then lists names without
 * description). A 401 is not that: it is the session, and `withSession` has to see it to log in again.
 */
async function readOptional<T>(ctx: UseContext, cookie: string, path: string): Promise<T[] | null> {
  try {
    return (await collectRows(ctx, cookie, withQuery(path, queryString({})), MAX_ROWS)).rows as unknown as T[]
  } catch (e) {
    if (e instanceof SlError && e.status !== 401) return null
    throw e
  }
}

/** Reads what the index is made of (`$metadata`, once per execution, and the user tables and objects) with the session of `cookie`. */
export async function readEntityIndex(ctx: UseContext, cookie: string): Promise<{ standard: string; user: string }> {
  const xml = await getMetadata(ctx, cookie)
  const userTables = await readOptional<UserTableRow>(ctx, cookie, 'UserTablesMD?$select=TableName,TableDescription,TableType')
  const userObjects = await readOptional<UserObjectRow>(ctx, cookie, 'UserObjectsMD?$select=Code,Name,TableName')
  return renderEntityIndex({ xml, odataVersion: ctx.config.versionOData, versionB1: ctx.config.versionB1, fetchedAt: ctx.now(), userTables, userObjects })
}

/** The user list goes first: the standard one is what makes the pair count as fresh (see `isFresh`). */
export async function writeEntityIndex(ctx: UseContext, rendered: { standard: string; user: string }): Promise<void> {
  await writeAside(ctx, userIndexPath(ctx.root, ctx.environment), rendered.user)
  await writeAside(ctx, standardIndexPath(ctx.root, ctx.environment), rendered.standard)
}

/**
 * The index of this environment, renewed when it is missing, older than a week, made with another OData version, or `force`.
 * It shares the lock and the download of `$metadata` with the Contexto de objeto: an execution that already has `$metadata`
 * does not download it again. The XML is parsed and dropped; only the two files are kept.
 */
export async function ensureEntityIndex(ctx: UseContext, { force = false } = {}): Promise<IndexResult> {
  const files = { standard: standardIndexPath(ctx.root, ctx.environment), user: userIndexPath(ctx.root, ctx.environment) }
  if (!force && (await isFresh(ctx))) return { ...files, regenerated: false }
  return withMetadataLock(ctx, async () => {
    // Parallel executions: one downloads, the others wait and then find the index ready.
    if (!force && (await isFresh(ctx))) return { ...files, regenerated: false }
    await writeEntityIndex(ctx, await withSession(ctx.session, (cookie) => readEntityIndex(ctx, cookie)))
    return { ...files, regenerated: true }
  })
}

/** The renewal that rides along with every command: its failure is a message for the output, never an error. */
export async function renewIndexQuietly(ctx: UseContext): Promise<string | null> {
  try {
    await ensureEntityIndex(ctx)
    return null
  } catch (e) {
    return (e as Error).message
  }
}

/** How many entities each file lists, read back from the files so that a recent index can be summarised too. */
export async function countEntities(result: Pick<IndexResult, 'standard' | 'user'>): Promise<{ estandar: number; usuario: number }> {
  const [standard, user] = await Promise.all([readFile(result.standard, 'utf8'), readFile(result.user, 'utf8')])
  return {
    estandar: Number(/^- (\d+) entity sets/m.exec(standard)?.[1] ?? 0),
    usuario: (user.match(/^- .+ — user (?:table|object)/gm) ?? []).length,
  }
}

/** Where the AI is sent when an entity does not exist: the two files of the index (their paths are relative to the repo, as the AI runs from it). */
export function missingEntityMessage(ctx: UseContext, names: string[], answer?: string): string {
  const files = `${standardIndexPath(ctx.root, ctx.environment)} (standard SAP entities) and ${userIndexPath(ctx.root, ctx.environment)} (user tables and objects)`
  return (
    `${names.join(', ')} ${names.length > 1 ? 'are not entity sets' : 'is not an entity set'} of this Service Layer: it is not in $metadata, downloaded again just now. ` +
    `Read the Índice de entidades to find the right name: ${files}. ` +
    `If it was just created, a Service Layer node may not list it yet: ask the developer to run "entities --refresh".` +
    (answer ? ` The Service Layer answered: ${answer}` : '')
  )
}

/** What the SL says for an entity set it does not know (checked live: HTTP 400, code 200 or -1002, in v1 and v2). */
const NOT_AN_ENTITY = /Unrecognized resource path|Invalid entityset|Service Not Found/i

/**
 * The SL says an entity does not exist: before believing it, `$metadata` is looked at again (the one this execution already
 * downloaded, else a new download) and the index renewed even if it is recent. Only an entity that `$metadata` really lacks
 * is reported as `ENTITY_NOT_FOUND`; any other answer, or a renewal that fails, leaves the SL's own error as it was.
 */
export async function explainMissingEntity(ctx: UseContext, out: UseOutput): Promise<UseOutput> {
  if (out.ok || out.status !== 400 || !out.error || !NOT_AN_ENTITY.test(out.error.message) || ctx.entitySets.size === 0) return out
  try {
    await ensureEntityIndex(ctx, { force: true })
  } catch {
    return out
  }
  const listed = new Set(entitySetNames(downloadedMetadata(ctx) ?? ''))
  const absent = [...ctx.entitySets].filter((e) => !listed.has(e))
  if (absent.length === 0) return out
  return { ...out, error: { code: 'ENTITY_NOT_FOUND', message: missingEntityMessage(ctx, absent, out.error.message) } }
}
