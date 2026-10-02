/** The Volcado: one folder per Uso execution under `.sbo-skills/service-layer/<entorno>/data/`. */
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
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
