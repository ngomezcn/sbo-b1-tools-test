/**
 * The complete Setup: the script asks the developer, in the developer's own terminal. Nothing typed here
 * (URL, company, user, password) goes through the AI; the password is read without echo.
 */
import { existsSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { Writable } from 'node:stream'
import { SboError } from '../common/errors.ts'
import { clearLocalState, LOCAL_DIR, SYSTEM, systemDir, type Credentials } from '../common/layout.ts'
import type { Transport } from '../common/sl.ts'
import { checkB1Version, checkODataVersion, defaultODataVersion, ENVIRONMENTS, SUPPORTED_B1_VERSIONS, type Environment, type ODataVersion } from '../common/versions.ts'
import { runSetup, testLogin, type SetupFailure } from './setup.ts'

export type Ask = (prompt: string, options?: { secret?: boolean }) => Promise<string>

export interface WizardOptions {
  root: string
  ask: Ask
  say: (line: string) => void
  transport?: Transport
}

export interface WizardResult {
  ok: boolean
  /** The developer answered no to erasing the earlier setup. */
  aborted?: boolean
  environments: Environment[]
  failed: SetupFailure[]
  warnings: string[]
}

const INPUT_CLOSED = 'The input ended before the Setup was complete. Run the Setup again.'

/** Questions on a stream. Lines that arrive before they are asked for are kept; `secret` answers are not echoed. */
export function createAsk(input: NodeJS.ReadableStream & { isTTY?: boolean }, output: NodeJS.WritableStream): Ask & { close(): void } {
  let muted = false
  const quiet = new Writable({ write: (chunk, _enc, done) => (muted || output.write(chunk), done()) })
  const rl = createInterface({ input, output: quiet, terminal: Boolean(input.isTTY) })
  const lines: string[] = []
  let waiter: { resolve: (line: string) => void; reject: (e: Error) => void } | null = null
  let closed = false
  rl.on('line', (line) => {
    if (waiter) {
      const w = waiter
      waiter = null
      w.resolve(line)
    } else lines.push(line)
  })
  rl.on('close', () => {
    closed = true
    waiter?.reject(new SboError('INPUT_CLOSED', INPUT_CLOSED))
  })
  const ask: Ask & { close(): void } = (prompt, options) => {
    // The prompt belongs to readline, so that editing keys redraw it; the answer is hidden after it is shown.
    rl.setPrompt(prompt)
    rl.prompt()
    muted = Boolean(options?.secret)
    return new Promise<string>((resolve, reject) => {
      const done = (line: string) => {
        muted = false
        if (options?.secret) output.write('\n')
        // A password is kept as typed, spaces included.
        resolve(options?.secret ? line : line.trim())
      }
      const queued = lines.shift()
      if (queued !== undefined) return done(queued)
      if (closed) return reject(new SboError('INPUT_CLOSED', INPUT_CLOSED))
      waiter = { resolve: done, reject }
    })
  }
  ask.close = () => rl.close()
  return ask
}

const yes = (answer: string) => /^y(es)?$/i.test(answer.trim())

export async function runWizard({ root, ask, say, transport }: WizardOptions): Promise<WizardResult> {
  const warnings: string[] = []
  if (existsSync(systemDir(root))) {
    const answer = await ask(`A setup already exists in ${LOCAL_DIR}/${SYSTEM}/. This run erases it, with the data and the object contexts of every environment, and starts from scratch. Continue? [y/N]: `)
    if (!yes(answer)) {
      say('Nothing was changed.')
      return { ok: false, aborted: true, environments: [], failed: [], warnings }
    }
  }

  let versionB1: string
  for (;;) {
    const answer = await ask(`B1 version (${SUPPORTED_B1_VERSIONS.join(', ')}): `)
    try {
      const checked = checkB1Version(answer)
      versionB1 = checked.version
      for (const w of checked.warnings) {
        say(`Warning: ${w}`)
        warnings.push(w)
      }
      break
    } catch (e) {
      if (!(e instanceof SboError)) throw e
      say(e.message)
    }
  }

  const preselected = defaultODataVersion(versionB1)
  let versionOData: ODataVersion
  for (;;) {
    const answer = (await ask(`OData version: v1 (OData V3) or v2 (OData V4) [${preselected}]: `)) || preselected
    try {
      versionOData = checkODataVersion(answer.toLowerCase())
      break
    } catch (e) {
      say((e as Error).message)
    }
  }

  const good: Partial<Record<Environment, Credentials>> = {}
  const failed: SetupFailure[] = []
  const failures = new Map<Environment, SetupFailure | undefined>()
  const skipped: Environment[] = []
  let chosen = 0
  while (chosen === 0) {
    for (const env of ENVIRONMENTS) {
      if (!yes(await ask(`Configure ${env}? [y/N]: `))) continue
      chosen++
      for (;;) {
        const url = await ask(`${env} - Service Layer URL (for example https://host:50000): `)
        const companyDB = await ask(`${env} - company database: `)
        const userName = await ask(`${env} - user: `)
        const password = await ask(`${env} - password (not shown): `, { secret: true })
        const credentials: Credentials = { url, companyDB, userName, password }
        const missing = (['url', 'companyDB', 'userName', 'password'] as const).filter((f) => credentials[f] === '')
        const tested = missing.length > 0 ? null : await testLogin(env, credentials, versionOData, transport)
        if (tested && !tested.failure) {
          good[env] = credentials
          say(`${env}: login OK`)
          break
        }
        say(`${env}: login failed: ${tested?.failure ? `${tested.failure.code ?? ''} ${tested.failure.message}`.trim() : `${missing.join(', ')} cannot be empty`}`)
        if (tested?.failure) failed.push(tested.failure)
        failures.set(env, tested?.failure)
        const next = await ask(`Answer ${env} again (r) or skip ${env} (s)? [r/s]: `)
        if (!/^r/i.test(next)) {
          say(`${env}: not configured`)
          skipped.push(env)
          break
        }
      }
    }
    if (chosen === 0) say('Configure at least one environment.')
  }

  if (Object.keys(good).length === 0) {
    await clearLocalState(root)
    say('Setup failed: no environment could log in, so nothing is configured.')
    return { ok: false, environments: [], failed: [...failures.values()].filter((f): f is SetupFailure => f !== undefined), warnings }
  }
  // The Setup proper: starts from scratch and tests every login again before leaving anything configured.
  const result = await runSetup({ root, versionB1, versionOData, environments: good, transport })
  for (const w of result.warnings) if (!warnings.includes(w)) warnings.push(w)
  for (const w of warnings) if (/gitignore/.test(w)) say(`Warning: ${w}`)
  for (const f of result.failed) say(`${f.environment}: not configured (${f.code ?? ''} ${f.message})`)
  // Only what is left failing: an environment that failed and then worked on a retry is not a failure.
  const left = [...[...failures].filter(([env]) => !good[env]).map(([, f]) => f), ...result.failed].filter((f): f is SetupFailure => f !== undefined)
  if (result.environments.length === 0) {
    say('Setup failed: the logins that worked a moment ago failed on the final check, so nothing is configured. Run the Setup again.')
  } else {
    say(`Setup done: ${result.environments.join(', ')} configured (B1 ${versionB1}, OData ${versionOData}).`)
  }
  return { ok: result.ok && skipped.length === 0, environments: result.environments, failed: left, warnings }
}
