import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { envDir, sessionPath, type Credentials } from '../common/layout.ts'
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
  await writeFile(sessionPath(ctx.root, ctx.environment), JSON.stringify(session, null, 2) + '\n')
}

/**
 * Runs `fn` with the stored session, logging in when there is none, it was last used more than
 * 30 minutes ago, or the Service Layer answers 401. A 401 is retried once with a new session.
 */
export async function withSession<T>(ctx: SessionContext, fn: (cookie: string) => Promise<T>): Promise<T> {
  const stored = await load(ctx)
  const fresh = stored !== null && ctx.now().getTime() - Date.parse(stored.lastUsedAt) <= MAX_IDLE_MS
  if (stored && fresh) {
    try {
      const result = await fn(stored.cookie)
      await save(ctx, stored.cookie)
      return result
    } catch (e) {
      if (!(e instanceof SlError && e.status === 401)) throw e
    }
  }
  // Best effort: do not leave the replaced session open on the server.
  if (stored) await logout(ctx.credentials, ctx.version, stored.cookie, ctx.transport).catch(() => {})
  const { cookie } = await login(ctx.credentials, ctx.version, ctx.transport)
  await save(ctx, cookie)
  const result = await fn(cookie)
  await save(ctx, cookie)
  return result
}
