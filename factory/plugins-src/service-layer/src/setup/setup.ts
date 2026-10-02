import { SboError } from '../common/errors.ts'
import {
  assertCredentials, clearLocalState, ensureGitignore, writeConfig, writeCredentials, type Credentials,
} from '../common/layout.ts'
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

/** Validates the input and writes the local files. Starts from scratch on every run. */
export async function writeSetup(options: SetupOptions): Promise<SetupResult> {
  const names = Object.keys(options.environments)
  if (names.length === 0) throw new SboError('NO_ENVIRONMENTS', 'Configure at least one environment (dev, uat or prod).')
  for (const name of names) {
    if (!isEnvironment(name)) throw new SboError('INVALID_ENVIRONMENT', `"${name}" is not an environment. Use dev, uat or prod.`)
  }
  for (const name of names) assertCredentials(options.environments[name], name)
  const { version, warnings } = checkB1Version(options.versionB1)
  const versionOData = checkODataVersion(options.versionOData)

  await clearLocalState(options.root)
  await writeConfig(options.root, { versionB1: version, versionOData })
  for (const name of names as Environment[]) await writeCredentials(options.root, name, options.environments[name]!)
  await ensureGitignore(options.root)
  return { environments: names as Environment[], warnings }
}
