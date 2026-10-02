/** Setup, complete: the questions the script asks the developer, run against the real Service Layer. */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PassThrough } from 'node:stream'
import { configPath, contextDir, dumpRoot, envDir, readConfig, readCredentials, standardIndexPath, userIndexPath } from '../src/common/layout.ts'
import { createAsk, runWizard, type Ask } from '../src/setup/wizard.ts'
import { main } from '../src/setup/command.ts'
import { realCredentials } from './sl-env.ts'

const good = realCredentials()
const repo = () => mkdtemp(join(tmpdir(), 'sbo-'))

/** The developer, scripted: answers come in order; every prompt and every line said is kept. */
function developer(answers: string[]) {
  const prompts: string[] = []
  const said: string[] = []
  const queue = [...answers]
  const ask: Ask = async (prompt) => {
    prompts.push(prompt)
    const next = queue.shift()
    if (next === undefined) throw new Error(`The wizard asked something unexpected: ${prompt}`)
    return next
  }
  return { ask, say: (line: string) => said.push(line), prompts, said, left: () => queue.length }
}

/** "Configure this environment? yes", then url, company, user, password. */
const environment = (password = good.password) => ['y', good.url, good.companyDB, good.userName, password]

for (const odata of ['v1', 'v2'] as const) {
  test(`${odata}: asks the B1 version, the OData version (preselected from the B1 version) and the environments, and configures them`, async () => {
    const root = await repo()
    // FP 2608 preselects v2: an empty answer takes it; "v1" is also accepted.
    const dev = developer(['FP 2608', odata === 'v2' ? '' : 'v1', ...environment(), 'n', 'n'])
    const result = await runWizard({ root, ask: dev.ask, say: dev.say })

    assert.equal(result.ok, true, JSON.stringify(result))
    assert.deepEqual(result.environments, ['dev'])
    assert.deepEqual(await readConfig(root), { versionB1: 'FP 2608', versionOData: odata })
    assert.deepEqual(await readCredentials(root, 'dev'), good)
    assert.match(dev.prompts[1], /\[v2\]/, 'v2 preselected from FP 2608')
    assert.equal(dev.left(), 0)
    assert.ok(dev.said.join('\n').includes('dev: login OK'))
    assert.ok(!dev.said.join('\n').includes(good.password) && !dev.prompts.join('\n').includes(good.password), 'the password is never echoed')
  })
}

test('the OData preselection is v1 before FP 2405, and the developer may choose v2 anyway', async () => {
  const root = await repo()
  const dev = developer(['SP 2402', '', ...environment(), 'n', 'n'])
  await runWizard({ root, ask: dev.ask, say: dev.say })
  assert.match(dev.prompts[1], /\[v1\]/)
  assert.equal((await readConfig(root)).versionOData, 'v1')

  const other = developer(['y', 'SP 2402', 'v2', ...environment(), 'n', 'n'])
  await runWizard({ root, ask: other.ask, say: other.say })
  assert.equal((await readConfig(root)).versionOData, 'v2')
})

test('a B1 version outside the list is accepted with a warning; one that is not a version is asked again', async () => {
  const root = await repo()
  const dev = developer(['10.0', 'fp 2412', '', ...environment(), 'n', 'n'])
  const result = await runWizard({ root, ask: dev.ask, say: dev.say })
  assert.equal(result.ok, true)
  assert.equal((await readConfig(root)).versionB1, 'FP 2412')
  assert.ok(result.warnings.some((w) => /not tested/.test(w)))
  assert.ok(dev.said.some((l) => /not a B1 version/.test(l)))
  assert.ok(dev.said.some((l) => /not tested/.test(l)))
})

test('only the environments the developer names are configured, and at least one is needed', async () => {
  const root = await repo()
  // First round: none. The wizard says so and asks again; second round: prod only.
  const dev = developer(['FP 2608', '', 'n', 'n', 'n', 'n', 'n', ...environment()])
  const result = await runWizard({ root, ask: dev.ask, say: dev.say })
  assert.deepEqual(result.environments, ['prod'])
  assert.ok(dev.said.some((l) => /at least one/i.test(l)))
  assert.equal(existsSync(envDir(root, 'dev')), false)
  assert.equal(existsSync(envDir(root, 'uat')), false)
})

test('a login that fails is shown literally and offers a retry; the environment is not configured until it works', async () => {
  const root = await repo()
  const dev = developer(['FP 2608', '', ...environment('wrong'), 'r', ...environment().slice(1), 'n', 'n'])
  const result = await runWizard({ root, ask: dev.ask, say: dev.say })
  assert.equal(result.ok, true, JSON.stringify(result))
  assert.ok(dev.said.some((l) => l.includes('-304') && l.includes('Fail to NONE-SSO login from SLD.')), dev.said.join('\n'))
  assert.deepEqual(await readCredentials(root, 'dev'), good)
  assert.ok(!dev.said.join('\n').includes('wrong'))
})

test('skipping an environment whose login fails leaves it out; if none is left the Setup fails and says so', async () => {
  const root = await repo()
  const dev = developer(['FP 2608', '', ...environment(), ...environment('wrong'), 's', 'n'])
  const result = await runWizard({ root, ask: dev.ask, say: dev.say })
  assert.deepEqual(result.environments, ['dev'])
  assert.equal(existsSync(envDir(root, 'uat')), false)

  const none = developer(['FP 2608', '', ...environment('wrong'), 's', 'n', 'n'])
  const failed = await runWizard({ root: await repo(), ask: none.ask, say: none.say })
  assert.equal(failed.ok, false)
  assert.ok(none.said.some((l) => /not configured/i.test(l)))
})

test('each run starts from scratch: an earlier setup is erased with its data and contexts, after the developer confirms', async () => {
  const root = await repo()
  const first = developer(['FP 2608', '', ...environment(), ...environment(), 'n'])
  await runWizard({ root, ask: first.ask, say: first.say })
  await mkdir(contextDir(root, 'uat'), { recursive: true })
  await writeFile(join(contextDir(root, 'uat'), 'Orders.md'), 'old')
  await mkdir(dumpRoot(root, 'dev'), { recursive: true })
  await writeFile(join(dumpRoot(root, 'dev'), 'x.json'), '{}')

  // "n" at the confirmation: nothing changes.
  const no = developer(['n'])
  const aborted = await runWizard({ root, ask: no.ask, say: no.say })
  assert.equal(aborted.ok, false)
  assert.equal(aborted.aborted, true)
  assert.ok(existsSync(join(contextDir(root, 'uat'), 'Orders.md')))

  const second = developer(['y', 'FP 2608', '', ...environment(), 'n', 'n'])
  const result = await runWizard({ root, ask: second.ask, say: second.say })
  assert.equal(result.ok, true)
  assert.match(second.prompts[0], /erase/i)
  assert.equal(existsSync(envDir(root, 'uat')), false)
  assert.equal(existsSync(dumpRoot(root, 'dev')), false)
  assert.equal(existsSync(contextDir(root, 'uat')), false)
})

test('a clear warning when .sbo-skills/ cannot be added to .gitignore, and the setup still completes', async () => {
  const root = await repo()
  await mkdir(join(root, '.gitignore')) // a folder where the file should be: it cannot be written
  const dev = developer(['FP 2608', '', ...environment(), 'n', 'n'])
  const result = await runWizard({ root, ask: dev.ask, say: dev.say })
  assert.equal(result.ok, true)
  const warning = result.warnings.find((w) => /gitignore/.test(w))
  assert.ok(warning, JSON.stringify(result.warnings))
  assert.match(warning!, /passwords/i)
  assert.match(warning!, /\.sbo-skills\//)
  assert.ok(dev.said.some((l) => /gitignore/.test(l)))
  await readCredentials(root, 'dev')
})

test('--status says what is configured without touching the credentials', async () => {
  const root = await repo()
  const empty = await main(['--status'], {}, root)
  assert.equal((empty.output as { ok: boolean }).ok, false)
  assert.equal((empty.output as { error: { code: string } }).error.code, 'SETUP_MISSING')

  const dev = developer(['FP 2608', '', ...environment(), 'n', 'n'])
  await runWizard({ root, ask: dev.ask, say: dev.say })
  const status = await main(['--status'], {}, root)
  assert.deepEqual(status.output, { ok: true, versionB1: 'FP 2608', versionOData: 'v2', environments: ['dev'] })
  assert.ok(!JSON.stringify(status).includes(good.password))
})

test('the password is typed hidden: not echoed, and the other answers are', async () => {
  const input = new PassThrough()
  const output = new PassThrough()
  let shown = ''
  output.on('data', (chunk) => (shown += chunk))
  const ask = createAsk(input, output)
  const typed = ask('name: ')
  input.write('visible-text\n')
  assert.equal(await typed, 'visible-text')
  const secret = ask('password: ', { secret: true })
  input.write('s3cret-pass\n')
  assert.equal(await secret, 's3cret-pass')
  assert.ok(!shown.includes('s3cret-pass'), shown)
  assert.ok(shown.includes('name: ') && shown.includes('password: '))
  ask.close()
})

test('the wizard needs a terminal: with no TTY (an AI tool) it refuses and says where to run it', async () => {
  const root = await repo()
  const cli = join(process.cwd(), 'src/setup/cli.ts')
  const child = spawn(process.execPath, ['--import', import.meta.resolve('tsx'), cli], { cwd: root, stdio: ['pipe', 'pipe', 'pipe'] })
  let out = ''
  child.stdout.on('data', (c) => (out += c))
  child.stdin.end(`FP 2608\n${good.password}\n`)
  const code = await new Promise((resolve) => child.on('close', resolve))
  assert.equal(code, 1, out)
  const error = JSON.parse(out).error
  assert.equal(error.code, 'NEEDS_TERMINAL')
  assert.match(error.message, /own terminal/)
  assert.equal(existsSync(configPath(root)), false)
})
