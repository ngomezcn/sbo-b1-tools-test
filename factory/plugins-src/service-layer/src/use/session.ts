import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { envDir, sessionLockPath, sessionPath, type Credentials } from '../common/layout.ts'
import { withLock } from '../common/lock.ts'
import { login, logout, SlError, type Transport } from '../common/sl.ts'
import type { Environment, ODataVersion } from '../common/versions.ts'

const MAX_IDLE_MS = 30 * 60_000

export interface SessionContext {
  root: string
  environment: Environment
  credentials: Credentials
  version: ODataVersion
  transport: Transport
  now: () => Date
}

interface StoredSession {
  /** `Cookie` header value (B1SESSION, plus ROUTEID if any). The password is never stored here. */
  cookie: string
  lastUsedAt: string
}

async function load(ctx: SessionContext): Promise<StoredSession | null> {
  try {
    const s = JSON.parse(await readFile(sessionPath(ctx.root, ctx.environment), 'utf8')) as StoredSession
    if (typeof s.cookie === 'string' && !Number.isNaN(Date.parse(s.lastUsedAt))) return s
  } catch {
    /* no usable session */
  }
  return null
}

async function save(ctx: SessionContext, cookie: string): Promise<void> {
  await mkdir(envDir(ctx.root, ctx.environment), { recursive: true })
  const session: StoredSession = { cookie, lastUsedAt: ctx.now().toISOString() }
  // Written aside and renamed: a parallel execution never reads half a session.
  const file = sessionPath(ctx.root, ctx.environment)
  const temp = `${file}.${process.pid}.${Math.random().toString(36).slice(2, 8)}.tmp`
  try {
    await writeFile(temp, JSON.stringify(session, null, 2) + '\n')
    for (let attempt = 0; ; attempt++) {
      try {
        return await rename(temp, file)
      } catch (e) {
        // On Windows the target may be open for a moment in another process.
        if (attempt >= 5) throw e
        await new Promise((r) => setTimeout(r, 20 * (attempt + 1)))
      }
    }
  } finally {
    await rm(temp, { force: true })
  }
}

const isFresh = (ctx: SessionContext, s: StoredSession | null): s is StoredSession => s !== null && ctx.now().getTime() - Date.parse(s.lastUsedAt) <= MAX_IDLE_MS

/**
 * Runs `fn` with the stored session, logging in when there is none, it was last used more than
 * 30 minutes ago, or the Service Layer answers 401. A 401 is retried once with a new session.
 *
 * Several executions can start at once (also with no session): the login is done under a lock, and whoever
 * gets the lock after another one has logged in uses that session instead of opening one more. The demo
 * Service Layer fails parallel logins (`SAML Login Failed`, TESTING.md), so only one login runs at a time.
 */
export async function withSession<T>(ctx: SessionContext, fn: (cookie: string) => Promise<T>): Promise<T> {
  const stored = await load(ctx)
  if (isFresh(ctx, stored)) {
    try {
      const result = await fn(stored.cookie)
      await save(ctx, stored.cookie)
      return result
    } catch (e) {
      if (!(e instanceof SlError && e.status === 401)) throw e
    }
  }
  const cookie = await withLock(sessionLockPath(ctx.root, ctx.environment), async () => {
    // Someone may have logged in while this one waited for the lock.
    const current = await load(ctx)
    if (isFresh(ctx, current) && current.cookie !== stored?.cookie) return current.cookie
    // Best effort: do not leave the replaced session open on the server.
    if (stored) await logout(ctx.credentials, ctx.version, stored.cookie, ctx.transport).catch(() => {})
    const { cookie } = await login(ctx.credentials, ctx.version, ctx.transport)
    await save(ctx, cookie)
    return cookie
  })
  const result = await fn(cookie)
  await save(ctx, cookie)
  return result
}
