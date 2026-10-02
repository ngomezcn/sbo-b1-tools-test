import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { writeSetup } from '../src/setup/setup.ts'
import { configPath, readConfig, readCredentials } from '../src/common/layout.ts'

const creds = { url: 'https://sl:50000', companyDB: 'DB', userName: 'manager', password: 'pw' }

async function repo() {
  return mkdtemp(join(tmpdir(), 'sbo-'))
}

test('writes config.md and credentials.json and creates .gitignore', async () => {
  const root = await repo()
  const res = await writeSetup({ root, versionB1: 'FP 2608', versionOData: 'v2', environments: { dev: creds } })
  assert.deepEqual(res.warnings, [])
  assert.deepEqual(await readConfig(root), { versionB1: 'FP 2608', versionOData: 'v2' })
  assert.deepEqual(await readCredentials(root, 'dev'), creds)
  assert.equal(await readFile(join(root, '.gitignore'), 'utf8'), '.sbo-skills/\n')
  const md = await readFile(configPath(root), 'utf8')
  assert.match(md, /^---\nversionB1: FP 2608\nversionOData: v2\n---/)
})

test('appends to an existing .gitignore once, without duplicating', async () => {
  const root = await repo()
  await writeFile(join(root, '.gitignore'), 'node_modules/')
  const opts = { root, versionB1: 'FP 2608', versionOData: 'v2' as const, environments: { dev: creds } }
  await writeSetup(opts)
  await writeSetup(opts)
  assert.equal(await readFile(join(root, '.gitignore'), 'utf8'), 'node_modules/\n.sbo-skills/\n')
})

test('rejects unknown environments and an empty environment list', async () => {
  const root = await repo()
  const base = { root, versionB1: 'FP 2608', versionOData: 'v2' as const }
  await assert.rejects(writeSetup({ ...base, environments: { staging: creds } as never }), { code: 'INVALID_ENVIRONMENT' })
  await assert.rejects(writeSetup({ ...base, environments: {} }), { code: 'NO_ENVIRONMENTS' })
})

test('Versión de B1: listed version has no warning, unlisted gets a warning, malformed is rejected', async () => {
  const root = await repo()
  const base = { root, versionOData: 'v2' as const, environments: { dev: creds } }
  const unlisted = await writeSetup({ ...base, versionB1: 'FP 2412' })
  assert.equal(unlisted.warnings.length, 1)
  assert.match(unlisted.warnings[0], /not tested/)
  await assert.rejects(writeSetup({ ...base, versionB1: '10.0' }), { code: 'INVALID_VERSION_B1' })
})

test('Versión de OData: only v1 or v2; default is v2 from FP 2405', async () => {
  const { defaultODataVersion } = await import('../src/common/versions.ts')
  assert.equal(defaultODataVersion('SP 2402'), 'v1')
  assert.equal(defaultODataVersion('FP 2405'), 'v2')
  assert.equal(defaultODataVersion('FP 2208'), 'v1')
  assert.equal(defaultODataVersion('FP 2608'), 'v2')
  const root = await repo()
  await assert.rejects(
    writeSetup({ root, versionB1: 'FP 2608', versionOData: 'v3' as never, environments: { dev: creds } }),
    { code: 'INVALID_ODATA_VERSION' },
  )
})

test('invalid credentials are rejected before anything on disk is touched', async () => {
  const root = await repo()
  const base = { root, versionB1: 'FP 2608', versionOData: 'v2' as const }
  await writeSetup({ ...base, environments: { dev: creds } })
  await assert.rejects(writeSetup({ ...base, environments: { uat: { ...creds, url: '' } } }), { code: 'CREDENTIALS_INVALID' })
  assert.deepEqual(await readCredentials(root, 'dev'), creds)
})

test('.gitignore: recognises existing variants and keeps CRLF', async () => {
  const root = await repo()
  const gitignore = join(root, '.gitignore')
  const opts = { root, versionB1: 'FP 2608', versionOData: 'v2' as const, environments: { dev: creds } }
  await writeFile(gitignore, '/.sbo-skills\r\n')
  await writeSetup(opts)
  assert.equal(await readFile(gitignore, 'utf8'), '/.sbo-skills\r\n')
  await writeFile(gitignore, 'a\r\nb')
  await writeSetup(opts)
  assert.equal(await readFile(gitignore, 'utf8'), 'a\r\nb\r\n.sbo-skills/\r\n')
})
