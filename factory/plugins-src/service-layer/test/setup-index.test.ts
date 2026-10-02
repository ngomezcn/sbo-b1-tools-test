/** The Setup makes the Índice de entidades of every configured environment when the login is done, without asking anything. */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runSetup } from '../src/setup/setup.ts'
import { envDir, standardIndexPath, userIndexPath } from '../src/common/layout.ts'
import { readHeader } from '../src/use/metadata.ts'
import { defaultTransport, type Transport } from '../src/common/sl.ts'
import { realCredentials } from './sl-env.ts'

const good = realCredentials()
const repo = () => mkdtemp(join(tmpdir(), 'sbo-'))

for (const version of ['v1', 'v2'] as const) {
  test(`${version}: after the login the Setup writes both index files of the environment`, async () => {
    const root = await repo()
    const result = await runSetup({ root, versionB1: 'FP 2608', versionOData: version, environments: { dev: good } })
    assert.equal(result.ok, true, JSON.stringify(result))
    assert.deepEqual(result.indexed, ['dev'])
    assert.deepEqual(result.warnings, [])
    const standard = await readFile(standardIndexPath(root, 'dev'), 'utf8')
    assert.equal(readHeader(standard)?.odataVersion, version)
    assert.ok(standard.includes('BusinessPartners') && standard.includes('Orders'))
    assert.match(await readFile(userIndexPath(root, 'dev'), 'utf8'), /^# User-defined entities/)
    // The Setup leaves no session behind (nor lock or temporary file): only the credentials and the index.
    assert.deepEqual((await readdir(envDir(root, 'dev'))).sort(), ['credentials.json', 'entities-standard.md', 'entities-user.md'])
  })
}

test('an index that cannot be made is a warning: the Setup still configures the environment and succeeds', async () => {
  const root = await repo()
  const refusing: Transport = async (request) =>
    /\$metadata$/.test(request.url) ? { status: 403, headers: new Headers(), text: '{"error":{"code":"-1","message":"no access"}}' } : defaultTransport(request)
  const result = await runSetup({ root, versionB1: 'FP 2608', versionOData: 'v2', environments: { dev: good }, transport: refusing })
  assert.equal(result.ok, true, JSON.stringify(result))
  assert.deepEqual(result.environments, ['dev'])
  assert.deepEqual(result.indexed, [])
  assert.equal(result.warnings.length, 1)
  assert.match(result.warnings[0], /entity index of "dev" could not be made.*no access/i)
  assert.equal(await readFile(standardIndexPath(root, 'dev'), 'utf8').catch(() => null), null)
})
