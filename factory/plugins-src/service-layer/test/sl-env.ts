import type { Credentials } from '../src/common/layout.ts'

/** Credentials of the real demo Service Layer, from the repo-root .env (SL_URL, SL_COMPANY, SL_USER, SL_PASSWORD). */
export function realCredentials(): Credentials {
  const { SL_URL, SL_COMPANY, SL_USER, SL_PASSWORD } = process.env
  if (!SL_URL || !SL_COMPANY || !SL_USER || !SL_PASSWORD) {
    throw new Error('Set SL_URL, SL_COMPANY, SL_USER and SL_PASSWORD (the repo-root .env is loaded by `npm test`).')
  }
  return { url: SL_URL, companyDB: SL_COMPANY, userName: SL_USER, password: SL_PASSWORD }
}
