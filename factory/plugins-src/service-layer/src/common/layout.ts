/**
 * The only place that knows the format of `.sbo-skills/service-layer/`:
 * paths, `config.md` and `credentials.json`. Setup and Uso both go through here.
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { SboError } from './errors.ts'
import { checkODataVersion, ENVIRONMENTS, type Environment, type ODataVersion } from './versions.ts'

export const SYSTEM = 'service-layer'
export const LOCAL_DIR = '.sbo-skills'

export interface Config {
  versionB1: string
  versionOData: ODataVersion
}

export interface Credentials {
  url: string
  companyDB: string
  userName: string
  password: string
}

export const systemDir = (root: string) => join(root, LOCAL_DIR, SYSTEM)
export const configPath = (root: string) => join(systemDir(root), 'config.md')
export const envDir = (root: string, env: Environment) => join(systemDir(root), env)
export const credentialsPath = (root: string, env: Environment) => join(envDir(root, env), 'credentials.json')

const SETUP_HINT = 'Run the service-layer Setup first.'

export async function writeConfig(root: string, config: Config): Promise<void> {
  await mkdir(systemDir(root), { recursive: true })
  await writeFile(configPath(root), `---\nversionB1: ${config.versionB1}\nversionOData: ${config.versionOData}\n---\n`)
}

export async function readConfig(root: string): Promise<Config> {
  let text: string
  try {
    text = await readFile(configPath(root), 'utf8')
  } catch {
    throw new SboError('SETUP_MISSING', `${LOCAL_DIR}/${SYSTEM}/config.md not found. ${SETUP_HINT}`)
  }
  const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1] ?? ''
  const values: Record<string, string> = {}
  for (const line of front.split(/\r?\n/)) {
    const m = /^(\w+):\s*(.*?)\s*$/.exec(line)
    if (m) values[m[1]] = m[2]
  }
  if (!values.versionB1 || !values.versionOData) {
    throw new SboError('CONFIG_INVALID', `config.md lacks versionB1 or versionOData. ${SETUP_HINT}`)
  }
  return { versionB1: values.versionB1, versionOData: checkODataVersion(values.versionOData) }
}

export async function writeCredentials(root: string, env: Environment, credentials: Credentials): Promise<void> {
  await mkdir(envDir(root, env), { recursive: true })
  await writeFile(credentialsPath(root, env), JSON.stringify(credentials, null, 2) + '\n')
}

export async function readCredentials(root: string, env: Environment): Promise<Credentials> {
  let text: string
  try {
    text = await readFile(credentialsPath(root, env), 'utf8')
  } catch {
    throw new SboError('ENVIRONMENT_NOT_CONFIGURED', `Environment "${env}" is not configured. Run the service-layer Setup for it.`)
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new SboError('CREDENTIALS_INVALID', `Credentials of "${env}" are not valid JSON. Run the service-layer Setup again.`)
  }
  assertCredentials(parsed, env)
  return parsed
}

const CREDENTIAL_FIELDS = ['url', 'companyDB', 'userName', 'password'] as const

export function assertCredentials(value: unknown, env: string): asserts value is Credentials {
  const record = (value ?? {}) as Record<string, unknown>
  const missing = CREDENTIAL_FIELDS.filter((f) => typeof record[f] !== 'string' || record[f] === '')
  if (missing.length > 0) {
    throw new SboError('CREDENTIALS_INVALID', `Credentials of "${env}" lack: ${missing.join(', ')}. Run the service-layer Setup again.`)
  }
}

/** Environments that have credentials, in dev, uat, prod order. */
export async function configuredEnvironments(root: string): Promise<Environment[]> {
  const found: Environment[] = []
  for (const env of ENVIRONMENTS) {
    try {
      await readFile(credentialsPath(root, env))
      found.push(env)
    } catch {
      /* not configured */
    }
  }
  return found
}

/** Removes everything the Setup created, so each run starts from scratch. */
export async function clearLocalState(root: string): Promise<void> {
  await rm(systemDir(root), { recursive: true, force: true })
}

/** Adds `.sbo-skills/` to .gitignore (creating it if needed) without duplicating it. */
export async function ensureGitignore(root: string): Promise<void> {
  const file = join(root, '.gitignore')
  const entry = `${LOCAL_DIR}/`
  let current = ''
  try {
    current = await readFile(file, 'utf8')
  } catch {
    /* no .gitignore yet */
  }
  const lines = current.split(/\r?\n/).map((l) => l.trim())
  const covered = [entry, LOCAL_DIR, `/${entry}`, `/${LOCAL_DIR}`, `${entry}*`, `/${entry}*`]
  if (lines.some((l) => covered.includes(l))) return
  const eol = current.includes('\r\n') ? '\r\n' : '\n'
  const sep = current === '' || current.endsWith('\n') ? '' : eol
  await writeFile(file, `${current}${sep}${entry}${eol}`)
}
