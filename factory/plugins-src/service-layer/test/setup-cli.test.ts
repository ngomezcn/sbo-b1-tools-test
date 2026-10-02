import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { main } from '../src/setup/command.ts'
import { readConfig, readCredentials } from '../src/common/layout.ts'
import { realCredentials } from './sl-env.ts'

const good = realCredentials()
const args = ['--b1', 'FP 2608', '--dev-url', good.url, '--dev-company', good.companyDB, '--dev-user', good.userName]

test('CLI: password from the environment, default OData version from the B1 version, no password in the output', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sbo-'))
  const { output, exitCode } = await main(args, { SBO_SL_PASSWORD_DEV: good.password }, root)
  assert.equal(exitCode, 0)
  assert.deepEqual(output, { ok: true, configured: ['dev'], failed: [], warnings: [] })
  assert.equal((await readConfig(root)).versionOData, 'v2')
  assert.equal((await readCredentials(root, 'dev')).password, good.password)
  assert.ok(!JSON.stringify(output).includes(good.password))
})

test('CLI: missing arguments give a stable code', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sbo-'))
  const { output, exitCode } = await main(['--dev-url', 'x'], {}, root)
  assert.equal(exitCode, 1)
  assert.equal((output as { error: { code: string } }).error.code, 'MISSING_ARGUMENT')
})
