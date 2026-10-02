import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runSetup } from '../src/setup/setup.ts'
import { configPath, envDir, readConfig, readCredentials } from '../src/common/layout.ts'
import { baseUrl, defaultTransport, type HttpRequest } from '../src/common/sl.ts'
import { realCredentials } from './sl-env.ts'
import { existsSync } from 'node:fs'

const good = realCredentials()
const repo = () => mkdtemp(join(tmpdir(), 'sbo-'))

for (const versionOData of ['v1', 'v2'] as const) {
  test(`${versionOData}: correct credentials configure the environment and the test session is discarded`, async () => {
    const root = await repo()
    const seen: HttpRequest[] = []
    const transport: typeof defaultTransport = (req) => (seen.push(req), defaultTransport(req))

    const result = await runSetup({ root, versionB1: 'FP 2608', versionOData, environments: { dev: good }, transport })

    assert.equal(result.ok, true)
    assert.deepEqual(result.environments, ['dev'])
    assert.deepEqual(await readCredentials(root, 'dev'), good)
    assert.equal((await readConfig(root)).versionOData, versionOData)
    assert.deepEqual(seen.map((r) => r.url.split('/').pop()), ['Login', 'Logout'])

    // The discarded session no longer works.
    const cookie = seen[1].headers.Cookie
    const after = await defaultTransport({ method: 'GET', url: `${baseUrl(good.url, versionOData)}/Items?$top=1`, headers: { Cookie: cookie } })
    assert.equal(after.status, 401)
  })

  test(`${versionOData}: wrong password fails with the literal SL error and leaves nothing configured`, async () => {
    const root = await repo()
    const result = await runSetup({ root, versionB1: 'FP 2608', versionOData, environments: { dev: { ...good, password: 'wrong' } } })
    assert.equal(result.ok, false)
    assert.deepEqual(result.environments, [])
    assert.equal(result.failed.length, 1)
    assert.deepEqual(result.failed[0], {
      environment: 'dev',
      status: 401,
      code: versionOData === 'v1' ? -304 : '-304',
      message: 'Fail to NONE-SSO login from SLD.',
    })
    assert.equal(existsSync(envDir(root, 'dev')), false)
    assert.equal(existsSync(configPath(root)), false)
  })

  test(`${versionOData}: unknown CompanyDB fails with the literal SL error`, async () => {
    const root = await repo()
    const result = await runSetup({ root, versionB1: 'FP 2608', versionOData, environments: { dev: { ...good, companyDB: 'NOPE' } } })
    assert.equal(result.failed[0].code, versionOData === 'v1' ? -306 : '-306')
    assert.equal(result.failed[0].message, 'Fail to NONE-SSO login from SLD.')
  })
}

test('unreachable URL fails with a stable code and what to do', async () => {
  const root = await repo()
  const result = await runSetup({ root, versionB1: 'FP 2608', versionOData: 'v2', environments: { dev: { ...good, url: 'https://localhost:59999' } } })
  assert.equal(result.ok, false)
  assert.equal(result.failed[0].code, 'SL_UNREACHABLE')
  assert.match(result.failed[0].message, /Check the URL/)
})

test('a failing environment is not left configured while the others are', async () => {
  const root = await repo()
  const result = await runSetup({
    root, versionB1: 'FP 2608', versionOData: 'v2',
    environments: { dev: good, uat: { ...good, password: 'wrong' } },
  })
  assert.equal(result.ok, false)
  assert.deepEqual(result.environments, ['dev'])
  assert.equal(existsSync(envDir(root, 'uat')), false)
  await readCredentials(root, 'dev')
})

test('every run starts from scratch', async () => {
  const root = await repo()
  const base = { root, versionB1: 'FP 2608', versionOData: 'v2' as const }
  await runSetup({ ...base, environments: { dev: good, uat: good } })
  await runSetup({ ...base, environments: { dev: good } })
  assert.equal(existsSync(envDir(root, 'uat')), false)
  assert.match(await readFile(join(root, '.gitignore'), 'utf8'), /\.sbo-skills\//)
})

test('invalid input is rejected before any network call', async () => {
  const root = await repo()
  const transport: typeof defaultTransport = () => { throw new Error('network used') }
  await assert.rejects(
    runSetup({ root, versionB1: 'bogus', versionOData: 'v2', environments: { dev: good }, transport }),
    { code: 'INVALID_VERSION_B1' },
  )
})

test('a URL that is not a Service Layer fails with an error, not a crash', async () => {
  const root = await repo()
  const result = await runSetup({ root, versionB1: 'FP 2608', versionOData: 'v2', environments: { dev: { ...good, url: `${good.url}/not-sl` } } })
  assert.equal(result.ok, false)
  assert.ok(result.failed[0].message.length > 0 && result.failed[0].message.length <= 300)
})
