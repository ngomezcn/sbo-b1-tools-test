import { SboError } from '../common/errors.ts'
import {
  assertCredentials, clearLocalState, ensureGitignore, writeConfig, writeCredentials, type Credentials,
} from '../common/layout.ts'
import { defaultTransport, login, logout, SlError, type Transport } from '../common/sl.ts'
import { openUse } from '../use/context.ts'
import { readEntityIndex, writeEntityIndex } from '../use/entity-index.ts'
import { checkB1Version, checkODataVersion, isEnvironment, type Environment, type ODataVersion } from '../common/versions.ts'

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
  /** Environments whose Índice de entidades was made at the end. A failure there is a warning, not a failed Setup. */
  indexed: Environment[]
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
  try {
    await ensureGitignore(options.root)
  } catch (e) {
    warnings.push(
      `Could not add .sbo-skills/ to .gitignore (${(e as Error).message}). Add the line ".sbo-skills/" yourself before committing: the folder holds passwords in plain text.`,
    )
  }
  return { environments: names as Environment[], warnings }
}

/** Logs in with the credentials and discards the test session. A failure is returned, not thrown. */
export async function testLogin(
  environment: Environment,
  credentials: Credentials,
  versionOData: ODataVersion,
  transport: Transport = defaultTransport,
): Promise<{ failure?: SetupFailure; warning?: string }> {
  try {
    const session = await login(credentials, versionOData, transport)
    try {
      await logout(credentials, versionOData, session.cookie, transport)
    } catch (e) {
      return { warning: `Test session of "${environment}" could not be discarded (${(e as Error).message}); it expires on its own.` }
    }
    return {}
  } catch (e) {
    if (e instanceof SlError) return { failure: { environment, status: e.status, code: e.code, message: e.message } }
    if (e instanceof SboError) return { failure: { environment, status: null, code: e.code, message: e.message } }
    throw e
  }
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
    const tested = await testLogin(name, credentials, versionOData, transport)
    if (tested.failure) failed.push(tested.failure)
    else good[name] = credentials
    if (tested.warning) warnings.push(tested.warning)
  }

  if (Object.keys(good).length === 0) return { ok: false, environments: [], warnings, failed, indexed: [] }
  const written = await writeSetup({ ...options, environments: good })
  // writeSetup repeats the version warning; what is new is what it found while writing (.gitignore).
  for (const w of written.warnings) if (!warnings.includes(w)) warnings.push(w)
  const indexed: Environment[] = []
  for (const name of written.environments) {
    const error = await makeIndex(options.root, name, transport)
    if (error === null) indexed.push(name)
    else warnings.push(`The entity index of "${name}" could not be made (${error}). The Uso makes it on its next command.`)
  }
  return { ok: failed.length === 0, environments: written.environments, warnings, failed, indexed }
}

/**
 * The Índice de entidades of one environment, from the files just written. Returns the reason when it cannot be made.
 * It logs in on its own and logs out when done, like the login test: the Setup leaves no session behind.
 */
async function makeIndex(root: string, environment: Environment, transport: Transport): Promise<string | null> {
  try {
    const ctx = await openUse({ root, environment, transport }, { sweep: false, index: false })
    const { cookie } = await login(ctx.credentials, ctx.config.versionOData, transport)
    try {
      await writeEntityIndex(ctx, await readEntityIndex(ctx, cookie))
    } finally {
      await logout(ctx.credentials, ctx.config.versionOData, cookie, transport).catch(() => {})
    }
    return null
  } catch (e) {
    return (e as Error).message
  }
}
