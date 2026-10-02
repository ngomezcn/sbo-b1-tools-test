/**
 * A lock between processes of the same repo, made of a folder (`mkdir` is atomic, also on Windows).
 * Parallel executions use it so that only one logs in, and only one downloads `$metadata` for the same ficha.
 */
import { mkdir, rm, stat } from 'node:fs/promises'
import { dirname } from 'node:path'

export interface LockOptions {
  /** A lock older than this is taken as left by a process that died, and is broken. */
  staleMs?: number
  /** After waiting this long the work goes ahead without the lock (never block the developer for good). */
  waitMs?: number
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function withLock<T>(path: string, work: () => Promise<T>, { staleMs = 30_000, waitMs = 60_000 }: LockOptions = {}): Promise<T> {
  await mkdir(dirname(path), { recursive: true })
  const deadline = Date.now() + waitMs
  let held = false
  while (!held) {
    try {
      await mkdir(path)
      held = true
    } catch (e) {
      if ((e as { code?: string }).code !== 'EEXIST') throw e
      const age = await stat(path).then((s) => Date.now() - s.mtimeMs, () => null)
      if (age !== null && age > staleMs) await rm(path, { recursive: true, force: true })
      else if (Date.now() > deadline) break
      else await sleep(50 + Math.random() * 100)
    }
  }
  try {
    return await work()
  } finally {
    if (held) await rm(path, { recursive: true, force: true })
  }
}
