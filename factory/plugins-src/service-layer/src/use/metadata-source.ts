/**
 * What the Contexto de objeto and the Índice de entidades share when they need `$metadata`: the week they are kept for,
 * the lock, the download (once per execution) and the way a file is written.
 */
import { mkdir, rename, rm, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { metadataLockPath } from '../common/layout.ts'
import { withLock } from '../common/lock.ts'
import { request } from '../common/sl.ts'
import type { UseContext } from './context.ts'

/** A ficha or an index older than this is renewed by the next operation. */
export const CACHE_MAX_AGE_MS = 7 * 24 * 3_600_000

/**
 * One lock for every piece of work that downloads `$metadata` (any ficha, the index): parallel executions take turns,
 * and whoever gets the lock after another one finds what it needed already written.
 */
export const withMetadataLock = <T>(ctx: UseContext, work: () => Promise<T>): Promise<T> => withLock(metadataLockPath(ctx.root, ctx.environment), work)

/** `$metadata` already downloaded by this execution (the XML is ~2 MB; it is kept in memory only, never on disk). */
const downloaded = new WeakMap<UseContext, string>()

/** The `$metadata` this execution downloaded, if it did. */
export const downloadedMetadata = (ctx: UseContext): string | undefined => downloaded.get(ctx)

/** The XML of `$metadata`; downloaded once per execution, whoever asks first (a ficha or the index). */
export async function getMetadata(ctx: UseContext, cookie: string): Promise<string> {
  const known = downloaded.get(ctx)
  if (known !== undefined) return known
  const xml = (await request(ctx.transport, ctx.credentials, ctx.config.versionOData, 'GET', '$metadata', cookie)).text
  downloaded.set(ctx, xml)
  return xml
}

/** Written aside and renamed, so a parallel execution never reads half a file. */
export async function writeAside(ctx: UseContext, file: string, text: string): Promise<void> {
  await mkdir(dirname(file), { recursive: true })
  const temp = `${file}.${ctx.newId()}.tmp`
  try {
    await writeFile(temp, text)
    await rename(temp, file)
  } finally {
    await rm(temp, { force: true })
  }
}
