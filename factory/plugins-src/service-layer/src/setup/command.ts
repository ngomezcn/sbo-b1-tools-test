/**
 * Setup CLI.
 *
 *   node setup.mjs             the wizard: asks everything in the developer's own terminal (needs a TTY)
 *   node setup.mjs --status    what is configured (no credentials), as JSON
 *
 * Non-interactive form, for scripts and tests; never with the password on the command line:
 * it comes from SBO_SL_PASSWORD_<ENV> or is asked on the terminal.
 *
 *   node setup.mjs --b1 "FP 2608" [--odata v2] \
 *     --dev-url https://host:50000 --dev-company DB --dev-user manager [--uat-... --prod-...]
 */
import { parseArgs } from 'node:util'
import { createInterface } from 'node:readline'
import { Writable } from 'node:stream'
import { SboError } from '../common/errors.ts'
import type { Credentials } from '../common/layout.ts'
import { defaultODataVersion, ENVIRONMENTS } from '../common/versions.ts'
import { configuredEnvironments, readConfig } from '../common/layout.ts'
import { createAsk, runWizard } from './wizard.ts'
import { runSetup } from './setup.ts'

type Env = NodeJS.ProcessEnv

async function askPassword(environment: string): Promise<string> {
  const muted = new Writable({ write: (_chunk, _enc, done) => done() })
  process.stderr.write(`Password for ${environment}: `)
  const rl = createInterface({ input: process.stdin, output: muted, terminal: true })
  return new Promise((resolve) =>
    rl.question('', (answer) => {
      rl.close()
      process.stderr.write('\n')
      resolve(answer)
    }),
  )
}

async function wizard(root: string): Promise<{ output: unknown; exitCode: number }> {
  if (!process.stdin.isTTY) {
    throw new SboError('NEEDS_TERMINAL', "The Setup asks for credentials and must run in the developer's own terminal, not through the AI: open a terminal in the repo root and run this same command there.")
  }
  const ask = createAsk(process.stdin, process.stdout)
  try {
    const result = await runWizard({ root, ask, say: (line) => console.log(line) })
    return { output: undefined, exitCode: result.ok ? 0 : 1 }
  } finally {
    ask.close()
  }
}

async function status(root: string): Promise<{ output: unknown; exitCode: number }> {
  const environments = await configuredEnvironments(root)
  if (environments.length === 0) throw new SboError('SETUP_MISSING', 'No environment is configured. Run the service-layer Setup.')
  const config = await readConfig(root)
  return { output: { ok: true, versionB1: config.versionB1, versionOData: config.versionOData, environments }, exitCode: 0 }
}

export async function main(argv: string[], env: Env, root: string): Promise<{ output: unknown; exitCode: number }> {
  const options: Record<string, { type: 'string' | 'boolean' }> = { b1: { type: 'string' }, odata: { type: 'string' }, status: { type: 'boolean' } }
  for (const e of ENVIRONMENTS) for (const f of ['url', 'company', 'user']) options[`${e}-${f}`] = { type: 'string' }
  try {
    const { values } = parseArgs({ args: argv, options })
    if (values.status) return await status(root)
    if (argv.length === 0) return await wizard(root)
    const b1 = values.b1 as string | undefined
    if (!b1) throw new SboError('MISSING_ARGUMENT', 'Pass --b1 with the B1 version, for example --b1 "FP 2608".')

    const environments: Record<string, Credentials> = {}
    for (const e of ENVIRONMENTS) {
      if (!values[`${e}-url`] && !values[`${e}-company`] && !values[`${e}-user`]) continue
      const [url, companyDB, userName] = ['url', 'company', 'user'].map((f) => values[`${e}-${f}`] as string | undefined)
      if (!url || !companyDB || !userName) {
        throw new SboError('MISSING_ARGUMENT', `Environment ${e} needs --${e}-url, --${e}-company and --${e}-user.`)
      }
      const password = env[`SBO_SL_PASSWORD_${e.toUpperCase()}`] ?? (await askPassword(e))
      environments[e] = { url, companyDB, userName, password }
    }

    const result = await runSetup({
      root,
      versionB1: b1,
      versionOData: (values.odata as string | undefined) ?? defaultODataVersion(b1),
      environments,
    })
    return {
      output: { ok: result.ok, configured: result.environments, indexed: result.indexed, failed: result.failed, warnings: result.warnings },
      exitCode: result.ok ? 0 : 1,
    }
  } catch (e) {
    if (e instanceof SboError) return { output: { ok: false, error: { code: e.code, message: e.message } }, exitCode: 1 }
    if ((e as { code?: string }).code?.startsWith('ERR_PARSE_ARGS')) {
      return { output: { ok: false, error: { code: 'INVALID_ARGUMENTS', message: (e as Error).message } }, exitCode: 1 }
    }
    throw e
  }
}
