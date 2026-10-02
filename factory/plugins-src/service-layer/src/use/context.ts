import { randomBytes } from 'node:crypto'
import { readConfig, readCredentials, type Config, type Credentials } from '../common/layout.ts'
import { defaultTransport, type Transport } from '../common/sl.ts'
import type { Environment } from '../common/versions.ts'
import { resolveEnvironment } from './environment.ts'
import type { SessionContext } from './session.ts'

/** What every Uso command receives. `transport`, `now` and `newId` are injectable for tests. */
export interface UseOptions {
  root: string
  environment?: string
  transport?: Transport
  now?: () => Date
  newId?: () => string
}

export interface UseContext {
  root: string
  config: Config
  environment: Environment
  credentials: Credentials
  transport: Transport
  now: () => Date
  newId: () => string
  session: SessionContext
}

/** Reads the setup and resolves the environment; the start of every Uso command. */
export async function openUse(options: UseOptions): Promise<UseContext> {
  const config = await readConfig(options.root)
  const environment = await resolveEnvironment(options.root, options.environment)
  const credentials = await readCredentials(options.root, environment)
  const transport = options.transport ?? defaultTransport
  const now = options.now ?? (() => new Date())
  const newId = options.newId ?? (() => randomBytes(3).toString('hex'))
  return {
    root: options.root,
    config,
    environment,
    credentials,
    transport,
    now,
    newId,
    session: { root: options.root, environment, credentials, version: config.versionOData, transport, now },
  }
}
