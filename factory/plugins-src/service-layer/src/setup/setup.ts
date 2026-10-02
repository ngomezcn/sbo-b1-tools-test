import { SboError } from '../common/errors.ts'
import {
  assertCredentials, clearLocalState, ensureGitignore, writeConfig, writeCredentials, type Credentials,
} from '../common/layout.ts'
import { defaultTransport, login, logout, SlError, type Transport } from '../common/sl.ts'
import { checkB1Version, checkODataVersion, isEnvironment, type Environment } from '../common/versions.ts'

export interface SetupOptions {
  root: string
  versionB1: string
  versionOData: string
  environments: Partial<Record<string, Credentials>>
}

export interface SetupResult {
  environments: Environment[]
  warnings: string[]
}

export interface SetupFailure {
  environment: Environment
  /** HTTP status of the Service Layer answer; null when the SL was not reached. */
  status: number | null
  code: string | number | undefined
  message: string
}

export interface LoginSetupResult extends SetupResult {
  ok: boolean
  failed: SetupFailure[]
}

function checkInput(options: SetupOptions, names: string[]): void {
  if (names.length === 0) throw new SboError('NO_ENVIRONMENTS', 'Configure at least one environment (dev, uat or prod).')
  for (const name of names) {
    if (!isEnvironment(name)) throw new SboError('INVALID_ENVIRONMENT', `"${name}" is not an environment. Use dev, uat or prod.`)
  }
  for (const name of names) assertCredentials(options.environments[name], name)
}

/** Writes the local files without testing the login. Internal: `runSetup` is the Setup. */
export async function writeSetup(options: SetupOptions): Promise<SetupResult> {
  const names = Object.keys(options.environments)
  checkInput(options, names)
  const { version, warnings } = checkB1Version(options.versionB1)
  const versionOData = checkODataVersion(options.versionOData)

  await clearLocalState(options.root)
  await writeConfig(options.root, { versionB1: version, versionOData })
  for (const name of names as Environment[]) await writeCredentials(options.root, name, options.environments[name]!)
  await ensureGitignore(options.root)
  return { environments: names as Environment[], warnings }
}

/**
 * Full Setup: starts from scratch, tests the login of every environment (mandatory) and
 * discards the test session. An environment whose login fails is not left configured.
 */
export async function runSetup(options: SetupOptions & { transport?: Transport }): Promise<LoginSetupResult> {
  const transport = options.transport ?? defaultTransport
  const names = Object.keys(options.environments)
  // Validate first, without touching disk or network.
  checkInput(options, names)
  const versionOData = checkODataVersion(options.versionOData)
  const { warnings } = checkB1Version(options.versionB1)

  await clearLocalState(options.root)
  const good: Partial<Record<string, Credentials>> = {}
  const failed: SetupFailure[] = []
  for (const name of names as Environment[]) {
    const credentials = options.environments[name]!
    try {
      const session = await login(credentials, versionOData, transport)
      good[name] = credentials
      try {
        await logout(credentials, versionOData, session.sessionId, transport)
      } catch (e) {
        warnings.push(`Test session of "${name}" could not be discarded (${(e as Error).message}); it expires on its own.`)
      }
    } catch (e) {
      if (e instanceof SlError) failed.push({ environment: name, status: e.status, code: e.code, message: e.message })
      else if (e instanceof SboError) failed.push({ environment: name, status: null, code: e.code, message: e.message })
      else throw e
    }
  }

  if (Object.keys(good).length === 0) return { ok: false, environments: [], warnings, failed }
  const written = await writeSetup({ ...options, environments: good })
  return { ok: failed.length === 0, environments: written.environments, warnings, failed }
}
