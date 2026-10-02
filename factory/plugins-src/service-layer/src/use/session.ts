import type { Credentials } from '../common/layout.ts'
import { login, logout, type Transport } from '../common/sl.ts'
import type { ODataVersion } from '../common/versions.ts'

/** Runs `fn` with a fresh session and discards it afterwards. */
export async function withSession<T>(
  credentials: Credentials,
  version: ODataVersion,
  transport: Transport,
  fn: (cookie: string) => Promise<T>,
): Promise<T> {
  const session = await login(credentials, version, transport)
  try {
    return await fn(session.cookie)
  } finally {
    await logout(credentials, version, session.cookie, transport).catch(() => {})
  }
}
