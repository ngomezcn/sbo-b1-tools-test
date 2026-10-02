import { randomBytes } from 'node:crypto'
import { readConfig, readCredentials, type Config, type Credentials } from '../common/layout.ts'
import { defaultTransport, type Transport } from '../common/sl.ts'
import type { Environment } from '../common/versions.ts'
import { resolveEnvironment } from './environment.ts'
import { sweepOldDumps } from './dump.ts'
import { renewIndexQuietly } from './entity-index.ts'
import type { SessionContext } from './session.ts'

/** What every Uso command receives. `transport`, `now` and `newId` are injectable for tests. */
export interface UseOptions {
  root: string
  environment?: string
  transport?: Transport
  now?: () => Date
  newId?: () => string
  /** The developer asked for a new Contexto de objeto of the entity before this operation. */
  refreshContext?: boolean
  /** What `main` reads back after the command: the context it opened and the warnings that must reach the output. */
  run?: RunState
}

export interface RunState {
  ctx?: UseContext
  /** Added to the `resumen` of the output, e.g. `indiceError` when the Índice de entidades could not be renewed. */
  notes: Record<string, unknown>
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
  /** Entity sets this execution operates on (set by the Contexto de objeto step), to check them if the SL says one does not exist. */
  entitySets: Set<string>
}

/** Reads the setup and resolves the environment; the start of every Uso command. `index: false` for the command that renews the index itself. */
export async function openUse(options: UseOptions, { sweep = true, index = true } = {}): Promise<UseContext> {
  const config = await readConfig(options.root)
  const environment = await resolveEnvironment(options.root, options.environment)
  const credentials = await readCredentials(options.root, environment)
  const transport = options.transport ?? defaultTransport
  const now = options.now ?? (() => new Date())
  const newId = options.newId ?? (() => randomBytes(3).toString('hex'))
  // Safety net of the Volcado: every Uso execution removes the ones older than 24 h. Best effort.
  if (sweep) await sweepOldDumps(options.root, environment, now()).catch(() => {})
  const ctx: UseContext = {
    root: options.root,
    config,
    environment,
    credentials,
    transport,
    now,
    newId,
    entitySets: new Set(),
    session: { root: options.root, environment, credentials, version: config.versionOData, transport, now },
  }
  if (options.run) options.run.ctx = ctx
  // The Índice de entidades is kept up to date by every command; a failure must not block the one the developer asked for.
  if (index) {
    const error = await renewIndexQuietly(ctx)
    if (error !== null && options.run) options.run.notes.indiceError = error
  }
  return ctx
}
