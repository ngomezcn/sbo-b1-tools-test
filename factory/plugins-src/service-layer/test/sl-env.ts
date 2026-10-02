import { rm } from 'node:fs/promises'
import { defaultTransport, type HttpRequest, type Transport } from '../src/common/sl.ts'
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

export const getLive = (options: GetOptions) => live(options.root, () => getByKey(options))
