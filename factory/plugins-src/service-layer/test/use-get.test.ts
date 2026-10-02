import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { writeSetup } from '../src/setup/setup.ts'
import { getByKey } from '../src/use/get.ts'
import { defaultTransport, type HttpRequest } from '../src/common/sl.ts'
import { realCredentials } from './sl-env.ts'

const good = realCredentials()

async function repo(versionOData: 'v1' | 'v2', envs: string[] = ['dev']) {
  const root = await mkdtemp(join(tmpdir(), 'sbo-'))
  await writeSetup({ root, versionB1: 'FP 2608', versionOData, environments: Object.fromEntries(envs.map((e) => [e, good])) })
  return root
}

for (const version of ['v1', 'v2'] as const) {
  test(`${version}: reads a BusinessPartner by key, dumps it to disk and returns only path and keys`, async () => {
    const root = await repo(version)
    const seen: HttpRequest[] = []
    const transport: typeof defaultTransport = (req) => (seen.push(req), defaultTransport(req))

    const out = await getByKey({ root, entitySet: 'BusinessPartners', key: 'C50000', transport })

    assert.equal(out.ok, true)
    assert.equal(out.status, 200)
    assert.ok(seen.some((r) => r.url.includes(`/b1s/${version}/BusinessPartners('C50000')`)), 'uses the configured OData version')
    const summary = out.resumen!
    assert.equal(summary.entorno, 'dev')
    assert.equal(summary.filas, 1)
    assert.deepEqual(summary.claves, ['C50000'])
    // The output never carries the record.
    assert.ok(!JSON.stringify(out).includes('CardName'))
    // The record is on disk, in the Volcado structure.
    const dir = summary.ruta as string
    assert.match(dir, /dev[\\/]data[\\/][^\\/]+$/)
    const record = JSON.parse(await readFile(join(dir, 'BusinessPartners', 'C50000.json'), 'utf8'))
    assert.equal(record.CardCode, 'C50000')
    const index = JSON.parse(await readFile(join(dir, '_index.json'), 'utf8'))
    assert.equal(index.entitySet, 'BusinessPartners')
    assert.equal(index.count, 1)
    assert.deepEqual(index.keys, ['C50000'])
    assert.deepEqual(await readdir(join(dir, 'BusinessPartners')), ['C50000.json'])
  })

  test(`${version}: a key that does not exist returns the literal SL error and dumps nothing`, async () => {
    const root = await repo(version)
    const out = await getByKey({ root, entitySet: 'BusinessPartners', key: 'NOPE', transport: defaultTransport })
    assert.equal(out.ok, false)
    assert.equal(out.status, 404)
    assert.equal(out.error!.code, version === 'v1' ? -2028 : '-2028')
    assert.equal(out.error!.message, 'No matching records found (ODBC -2028)')
    await assert.rejects(readdir(join(root, '.sbo-skills/service-layer/dev/data')))
  })
}

test('numeric keys are sent unquoted', async () => {
  const root = await repo('v2')
  const seen: HttpRequest[] = []
  const out = await getByKey({ root, entitySet: 'Orders', key: '1', transport: (req) => (seen.push(req), defaultTransport(req)) })
  assert.ok(seen.some((r) => r.url.endsWith("/Orders(1)")))
  assert.equal(typeof out.status, 'number')
})

test('missing Setup fails with a clear, actionable error', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sbo-'))
  const out = await getByKey({ root, entitySet: 'BusinessPartners', key: 'C50000' })
  assert.equal(out.ok, false)
  assert.equal(out.status, null)
  assert.equal(out.error!.code, 'SETUP_MISSING')
  assert.match(out.error!.message, /Setup/)
})

test('environment: the only configured one is used; with several, --entorno is required; unknown ones fail', async () => {
  const root = await repo('v2', ['dev', 'uat'])
  const base = { root, entitySet: 'BusinessPartners', key: 'C50000' }
  assert.equal((await getByKey(base)).error!.code, 'ENVIRONMENT_REQUIRED')
  assert.equal((await getByKey({ ...base, environment: 'uat' })).resumen!.entorno, 'uat')
  assert.equal((await getByKey({ ...base, environment: 'prod' })).error!.code, 'ENVIRONMENT_NOT_CONFIGURED')
  assert.equal((await getByKey({ ...base, environment: 'staging' })).error!.code, 'INVALID_ENVIRONMENT')
})

test('entity set names are validated', async () => {
  const root = await repo('v2')
  const out = await getByKey({ root, entitySet: 'BusinessPartners/../Login', key: 'x' })
  assert.equal(out.error!.code, 'INVALID_ENTITY_SET')
})

test('keys: quoting, escaping and URL encoding', async () => {
  const { parseKey } = await import('../src/use/get.ts')
  assert.deepEqual(parseKey('C1'), { literal: "'C1'", plain: 'C1' })
  assert.deepEqual(parseKey("'123'"), { literal: "'123'", plain: '123' })
  assert.deepEqual(parseKey('123'), { literal: '123', plain: '123' })
  assert.deepEqual(parseKey("'O''Brien'"), { literal: "'O''Brien'", plain: "O'Brien" })
  assert.equal(parseKey('A#B/C d').literal, "'A%23B%2FC%20d'")
})
