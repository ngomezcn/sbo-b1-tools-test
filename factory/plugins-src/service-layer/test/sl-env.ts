import { rm } from 'node:fs/promises'
import { baseUrl, defaultTransport, login, logout, request, type HttpRequest, type Transport } from '../src/common/sl.ts'
import { ENVIRONMENTS } from '../src/common/versions.ts'
import { sessionPath, type Credentials } from '../src/common/layout.ts'
import { getByKey, type GetOptions } from '../src/use/get.ts'
import type { UseOutput } from '../src/use/output.ts'

/** Credentials of the real demo Service Layer, from the repo-root .env (SL_URL, SL_COMPANY, SL_USER, SL_PASSWORD). */
export function realCredentials(): Credentials {
  const { SL_URL, SL_COMPANY, SL_USER, SL_PASSWORD } = process.env
  if (!SL_URL || !SL_COMPANY || !SL_USER || !SL_PASSWORD) {
    throw new Error('Set SL_URL, SL_COMPANY, SL_USER and SL_PASSWORD (the repo-root .env is loaded by `npm test`).')
  }
  return { url: SL_URL, companyDB: SL_COMPANY, userName: SL_USER, password: SL_PASSWORD }
}

/** Real transport that also records every request. */
export function recording(record: HttpRequest[]): Transport {
  return (request) => (record.push(request), defaultTransport(request))
}

/** Like `recording`, but keeps only the requests the SL answered with 2xx (a retry on the broken demo node does not count). */
export function recordingOk(record: HttpRequest[]): Transport {
  return async (request) => {
    const response = await defaultTransport(request)
    if (response.status >= 200 && response.status < 300) record.push(request)
    return response
  }
}

const isBrokenSession = (out: UseOutput) => out.status === 500 && Number(out.error?.code) === 407

/**
 * The demo SL sometimes leaves a fresh session unusable: every read on it answers HTTP 500, code 407
 * ("Table definition not found for '@ZZVF_T'"), while the same read works on another session (TESTING.md).
 * Tests that need a successful read retry with a new session; `retried.count` says how many times.
 */
export const retried = { count: 0 }

export async function live(root: string, run: () => Promise<UseOutput>): Promise<UseOutput> {
  for (let attempt = 0; ; attempt++) {
    const out = await run()
    if (!isBrokenSession(out) || attempt >= 5) return out
    retried.count++
    for (const env of ENVIRONMENTS) await rm(sessionPath(root, env), { force: true })
  }
}

export interface UserFieldSpec {
  Name: string
  TableName: string
  Type: string
  Size?: number
  SubType?: string
  Description: string
  Mandatory?: 'tYES' | 'tNO'
  DefaultValue?: string
  ValidValuesMD?: { Value: string; Description: string }[]
}

/** Creates the user fields in the real demo company if they are not there yet (the demo is disposable, see 00-comun). */
export async function ensureUserFields(specs: UserFieldSpec[]): Promise<void> {
  const credentials = realCredentials()
  for (let attempt = 0; ; attempt++) {
    const { cookie } = await login(credentials, 'v2')
    try {
      for (const spec of specs) {
        const filter = encodeURIComponent(`Name eq '${spec.Name}' and TableName eq '${spec.TableName}'`)
        const found = await request(defaultTransport, credentials, 'v2', 'GET', `UserFieldsMD?$filter=${filter}&$select=Name`, cookie)
        if ((JSON.parse(found.text).value as unknown[]).length > 0) continue
        const created = await defaultTransport({
          method: 'POST',
          url: `${baseUrl(credentials.url, 'v2')}/UserFieldsMD`,
          headers: { Cookie: cookie, 'Content-Type': 'application/json' },
          body: JSON.stringify(spec),
        })
        if (created.status !== 201) throw new Error(`Could not create ${spec.TableName}.${spec.Name}: ${created.status} ${created.text.slice(0, 200)}`)
      }
      return
    } catch (e) {
      // A fresh session may land on the broken demo node (407, see TESTING.md): try again with another one.
      if (attempt >= 5 || Number((e as { code?: unknown }).code) !== 407) throw e
    } finally {
      await logout(credentials, 'v2', cookie).catch(() => {})
    }
  }
}

export const getLive = (options: GetOptions) => live(options.root, () => getByKey(options))
