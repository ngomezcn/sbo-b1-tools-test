/** The Volcado: one folder per Uso execution under `.sbo-skills/service-layer/<entorno>/data/`. */
import { lstat, mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { isAbsolute, join, relative, resolve } from 'node:path'
import { SboError } from '../common/errors.ts'
import { dumpDir, dumpRoot } from '../common/layout.ts'
import type { Environment } from '../common/versions.ts'

export const DUMP_MAX_AGE_MS = 24 * 3_600_000

/** Folder name `YYYYMMDD-HHmmss-<id>` -> its date (UTC), or null if it is not a Volcado folder of ours. */
export function dumpDate(name: string): Date | null {
  const m = /^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})-[\w-]+$/.exec(name)
  if (!m) return null
  const [y, mo, d, h, mi, s] = m.slice(1).map(Number)
  const date = new Date(Date.UTC(y, mo - 1, d, h, mi, s))
  return Number.isNaN(date.getTime()) ? null : date
}

/** File name of a record in the Volcado: the key, made safe for a path (also on Windows: no `*`, no reserved device names, never empty). */
export function keyFileName(plain: string): string {
  let name = encodeURIComponent(plain).replace(/[*!'()]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase()).replace(/[.]+$/, (dots) => '%2E'.repeat(dots.length))
  if (name === '' || /^(con|prn|aux|nul|com\d|lpt\d)$/i.test(name)) name = '_' + name
  return name + '.json'
}

/** Fields that identify a record, in order of preference. Without one of them (e.g. a `$select` that drops it) rows are numbered. */
const KEY_FIELDS = ['DocEntry', 'CardCode', 'ItemCode', 'Code', 'AbsEntry', 'InternalCode', 'ID', 'Id', 'Number']

export function recordKey(record: Record<string, unknown>, index: number): string {
  for (const field of KEY_FIELDS) {
    const value = record[field]
    if (typeof value === 'string' || typeof value === 'number') return String(value)
  }
  return `row-${String(index + 1).padStart(6, '0')}`
}

/** Creates the folder of this execution; a name that already exists (same second, same id) is never reused. */
async function createDumpDir(root: string, environment: Environment, now: Date, newId: () => string): Promise<string> {
  await mkdir(dumpRoot(root, environment), { recursive: true })
  for (let attempt = 0; attempt < 10; attempt++) {
    const dir = dumpDir(root, environment, now, newId())
    try {
      await mkdir(dir)
      return dir
    } catch (e) {
      if ((e as { code?: string }).code !== 'EEXIST') throw e
    }
  }
  throw new SboError('INTERNAL_ERROR', 'Could not create a unique Volcado folder. Try again.')
}

export interface DumpInput {
  root: string
  environment: Environment
  now: Date
  newId: () => string
  entitySet: string
  query: { method: string; path: string }
  records: Record<string, unknown>[]
  /** Keys to use instead of deriving them from the records. */
  keys?: string[]
  /** Extra fields for `_index.json` (pages, truncated...). */
  extra?: Record<string, unknown>
}

export async function writeDump(input: DumpInput): Promise<{ dir: string; keys: string[] }> {
  const dir = await createDumpDir(input.root, input.environment, input.now, input.newId)
  const entityDir = join(dir, input.entitySet)
  await mkdir(entityDir, { recursive: true })
  // Case-insensitive: on Windows and macOS `abc` and `ABC` would be the same file.
  const taken = new Set<string>()
  const keys = input.records.map((record, i) => {
    const base = input.keys?.[i] ?? recordKey(record, i)
    let key = base
    for (let n = 2; taken.has(key.toLowerCase()); n++) key = `${base}~${n}`
    taken.add(key.toLowerCase())
    return key
  })
  await Promise.all(input.records.map((record, i) => writeFile(join(entityDir, keyFileName(keys[i])), JSON.stringify(record, null, 2))))
  await writeFile(
    join(dir, '_index.json'),
    JSON.stringify({ date: input.now.toISOString(), query: input.query, entitySet: input.entitySet, count: keys.length, ...input.extra, keys }, null, 2),
  )
  return { dir, keys }
}

async function dumpFolders(root: string, environment: Environment): Promise<string[]> {
  try {
    return (await readdir(dumpRoot(root, environment), { withFileTypes: true })).filter((e) => e.isDirectory() && dumpDate(e.name)).map((e) => e.name)
  } catch {
    return []
  }
}

/**
 * Deletes the Volcado of one execution, and only that one. `target` is its id (`a1b2c3`), its folder name
 * (`20261002-153846-a1b2c3`) or its path; whatever it is, it must resolve to a folder directly inside the
 * environment's `data/`. Nothing outside `data/` is ever touched.
 */
export async function removeDump(root: string, environment: Environment, target: string): Promise<string> {
  const base = resolve(dumpRoot(root, environment))
  let name: string | undefined
  if (/[\\/]/.test(target) || isAbsolute(target)) {
    const rel = relative(base, resolve(root, target))
    if (rel === '' || rel.startsWith('..') || isAbsolute(rel) || /[\\/]/.test(rel)) {
      throw new SboError('DUMP_OUTSIDE_DATA', `"${target}" is not a Volcado folder of "${environment}". Only folders directly inside .sbo-skills/service-layer/${environment}/data/ can be removed.`)
    }
    name = rel
  } else {
    const matches = (await dumpFolders(root, environment)).filter((n) => n === target || n.endsWith(`-${target}`))
    if (matches.length > 1) throw new SboError('DUMP_AMBIGUOUS', `"${target}" matches several Volcado folders (${matches.join(', ')}). Pass the full folder name.`)
    name = matches[0]
  }
  const dir = join(base, name ?? '')
  const stat = name && dumpDate(name) ? await lstat(dir).catch(() => null) : null
  if (!stat?.isDirectory()) throw new SboError('DUMP_NOT_FOUND', `No Volcado "${target}" in "${environment}". It may already have been removed.`)
  await rm(dir, { recursive: true, force: true })
  return dir
}

/** Safety net: deletes the Volcados of the environment older than 24 h (by the date in the folder name). Returns what it removed. */
export async function sweepOldDumps(root: string, environment: Environment, now: Date): Promise<string[]> {
  const removed: string[] = []
  for (const name of await dumpFolders(root, environment)) {
    if (now.getTime() - dumpDate(name)!.getTime() <= DUMP_MAX_AGE_MS) continue
    const dir = join(dumpRoot(root, environment), name)
    await rm(dir, { recursive: true, force: true }).then(() => removed.push(dir), () => {})
  }
  return removed
}
