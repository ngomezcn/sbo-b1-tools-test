import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { writeSetup } from '../src/setup/setup.ts'
import { count, queryString, readOnePage, traverse } from '../src/use/read.ts'
import { main } from '../src/use/command.ts'
import type { HttpRequest } from '../src/common/sl.ts'
import { live, realCredentials, recording } from './sl-env.ts'

const good = realCredentials()

async function repo(versionOData: 'v1' | 'v2') {
  const root = await mkdtemp(join(tmpdir(), 'sbo-'))
  await writeSetup({ root, versionB1: 'FP 2608', versionOData, environments: { dev: good } })
  return root
}

const readIndex = async (dir: unknown) => JSON.parse(await readFile(join(dir as string, '_index.json'), 'utf8'))

test('query options are passed as given: only the characters that cannot go in a URL are encoded', () => {
  assert.equal(
    queryString({ filter: "CardType eq 'C' and CardName ne 'A&B'", select: 'CardCode,CardName', orderby: 'CardCode desc', expand: 'X($select=a;$top=1)' }),
    "$filter=CardType%20eq%20'C'%20and%20CardName%20ne%20'A%26B'&$select=CardCode,CardName&$orderby=CardCode%20desc&$expand=X($select=a;$top=1)",
  )
  assert.equal(queryString({ top: 5, skip: 10 }), '$top=5&$skip=10')
  assert.equal(queryString({}), '')
})

for (const version of ['v1', 'v2'] as const) {
  test(`${version}: page reads $top rows (20 by default), dumps them and returns only path and keys`, async () => {
    const root = await repo(version)
    const seen: HttpRequest[] = []
    const out = await live(root, () => readOnePage({ root, entitySet: 'Items', select: 'ItemCode', orderby: 'ItemCode', transport: recording(seen) }))
    assert.equal(out.ok, true, JSON.stringify(out))
    assert.equal(out.resumen!.filas, 20)
    assert.equal((out.resumen!.claves as string[]).length, 20)
    assert.ok(seen.some((r) => r.url.includes(`/b1s/${version}/Items?$select=ItemCode&$orderby=ItemCode&$top=20`)), seen.map((r) => r.url).join('\n'))
    assert.ok(!JSON.stringify(out).includes('ItemName'))
    const index = await readIndex(out.resumen!.ruta)
    assert.equal(index.count, 20)
    assert.equal((await readdir(join(out.resumen!.ruta as string, 'Items'))).length, 20)
  })

  test(`${version}: page with $top, $skip, $filter and $orderby`, async () => {
    const root = await repo(version)
    const out = await live(root, () => readOnePage({ root, entitySet: 'Orders', select: 'DocEntry', filter: 'DocEntry gt 300', orderby: 'DocEntry', top: 5, skip: 2 }))
    assert.equal(out.ok, true, JSON.stringify(out))
    assert.deepEqual(out.resumen!.claves, ['303', '304', '305', '306', '307'])
  })

  test(`${version}: count is a plain number, with and without $filter`, async () => {
    const root = await repo(version)
    const all = await live(root, () => count({ root, entitySet: 'Orders' }))
    assert.equal(all.ok, true, JSON.stringify(all))
    assert.equal(all.resumen!.total, 337)
    const some = await live(root, () => count({ root, entitySet: 'Orders', filter: 'DocEntry gt 300' }))
    assert.equal(some.resumen!.total, 37)
    assert.equal((await live(root, () => count({ root, entitySet: 'BusinessPartners' }))).resumen!.total, 25)
    assert.equal((await live(root, () => count({ root, entitySet: 'Items' }))).resumen!.total, 57)
  })

  test(`${version}: traverse follows nextLink over several pages and asks for 100 rows per page`, async () => {
    const root = await repo(version)
    const seen: HttpRequest[] = []
    const out = await live(root, () => traverse({ root, entitySet: 'Orders', select: 'DocEntry', orderby: 'DocEntry', transport: recording(seen) }))
    assert.equal(out.ok, true, JSON.stringify(out))
    assert.equal(out.resumen!.filas, 337)
    assert.equal(out.resumen!.paginas, 4)
    assert.equal(out.resumen!.truncado, false)
    // Hundreds of rows never go into the output: path and index only.
    assert.equal(out.resumen!.claves, undefined)
    assert.equal(out.resumen!.indice, join(out.resumen!.ruta as string, '_index.json'))
    const index = await readIndex(out.resumen!.ruta)
    assert.equal(index.count, 337)
    assert.equal(index.keys.length, 337)
    assert.equal((await readdir(join(out.resumen!.ruta as string, 'Orders'))).length, 337)
    const gets = seen.filter((r) => r.method === 'GET')
    assert.equal(gets.length, 4)
    assert.ok(gets.every((r) => r.headers.Prefer === 'odata.maxpagesize=100'))
    assert.ok(gets.slice(1).every((r, i) => r.url.endsWith(`$skip=${(i + 1) * 100}`)), gets.map((r) => r.url).join('\n'))
  })

  test(`${version}: traverse stops at the row cap, exactly, and says it truncated`, async () => {
    const root = await repo(version)
    const out = await live(root, () => traverse({ root, entitySet: 'Orders', select: 'DocEntry', orderby: 'DocEntry', maxRows: 150 }))
    assert.equal(out.ok, true, JSON.stringify(out))
    assert.equal(out.resumen!.filas, 150)
    assert.equal(out.resumen!.paginas, 2)
    assert.equal(out.resumen!.truncado, true)
    assert.equal(out.resumen!.tope, 150)
    const index = await readIndex(out.resumen!.ruta)
    assert.equal(index.keys[0], '1')
    assert.equal(index.keys[149], '150')
    assert.equal(index.truncated, true)
  })

  test(`${version}: a cap that lands exactly on the last row is not truncated; a small result lists its keys`, async () => {
    const root = await repo(version)
    const exact = await live(root, () => traverse({ root, entitySet: 'BusinessPartners', select: 'CardCode', maxRows: 25 }))
    assert.equal(exact.resumen!.filas, 25)
    assert.equal(exact.resumen!.truncado, false)
    assert.equal((exact.resumen!.claves as string[]).length, 25)
  })

  test(`${version}: traverse with $filter and $orderby keeps both across pages`, async () => {
    const root = await repo(version)
    const out = await live(root, () => traverse({ root, entitySet: 'Orders', select: 'DocEntry', filter: 'DocEntry gt 100', orderby: 'DocEntry desc' }))
    assert.equal(out.ok, true, JSON.stringify(out))
    assert.equal(out.resumen!.filas, 237)
    const keys = (await readIndex(out.resumen!.ruta)).keys as string[]
    assert.equal(keys[0], '337')
    assert.equal(keys[236], '101')
  })

  test(`${version}: $expand (with its own $select) reaches the SL untouched and the expanded part is dumped`, async () => {
    const root = await repo(version)
    const out = await live(root, () =>
      readOnePage({ root, entitySet: 'Orders', select: 'DocEntry,BusinessPartner', expand: 'BusinessPartner($select=CardName)', top: 2, orderby: 'DocEntry' }),
    )
    assert.equal(out.ok, true, JSON.stringify(out))
    const record = JSON.parse(await readFile(join(out.resumen!.ruta as string, 'Orders', '1.json'), 'utf8'))
    assert.deepEqual(Object.keys(record.BusinessPartner), ['CardName'])
  })

  test(`${version}: an entity whose key is not selected gets numbered rows`, async () => {
    const root = await repo(version)
    const out = await live(root, () => readOnePage({ root, entitySet: 'Orders', select: 'DocNum', top: 2, orderby: 'DocNum' }))
    assert.deepEqual(out.resumen!.claves, ['row-000001', 'row-000002'])
  })

  test(`${version}: an SL error comes back literally and nothing is dumped`, async () => {
    const root = await repo(version)
    const out = await live(root, () => readOnePage({ root, entitySet: 'NoSuchEntity' }))
    assert.equal(out.ok, false)
    assert.equal(typeof out.status, 'number')
    assert.ok(out.error!.message.length > 0)
    await assert.rejects(readdir(join(root, '.sbo-skills/service-layer/dev/data')))
  })
}

test('Volcado file names are safe on Windows; keys that differ only in case do not overwrite each other', async () => {
  const { keyFileName, writeDump } = await import('../src/use/dump.ts')
  assert.equal(keyFileName('A*B'), 'A%2AB.json')
  assert.equal(keyFileName('CON'), '_CON.json')
  assert.equal(keyFileName(''), '_.json')
  assert.equal(keyFileName('x.'), 'x%2E.json')
  const root = await mkdtemp(join(tmpdir(), 'sbo-'))
  const { dir, keys } = await writeDump({
    root, environment: 'dev', now: new Date(), newId: () => 'x', entitySet: 'E', query: { method: 'GET', path: 'E' },
    records: [{ Code: 'abc' }, { Code: 'ABC' }],
  })
  assert.deepEqual(keys, ['abc', 'ABC~2'])
  assert.equal((await readdir(join(dir, 'E'))).length, 2)
})

test('page refuses a $top beyond one answer and points to traverse', async () => {
  const root = await repo('v2')
  const out = await readOnePage({ root, entitySet: 'Orders', top: 500 })
  assert.equal(out.error!.code, 'INVALID_ARGUMENTS')
  assert.match(out.error!.message, /traverse/)
})

test('CLI: page, traverse and count with query options; bad numbers are rejected', async () => {
  const root = await repo('v2')
  const run = (args: string[]) => live(root, () => main(args, root))
  const page = await run(['page', 'Orders', '--top', '3', '--select', 'DocEntry', '--orderby', 'DocEntry desc'])
  assert.deepEqual(page.resumen!.claves, ['337', '336', '335'])
  assert.equal((await run(['traverse', 'Orders', '--max-rows', '120', '--select', 'DocEntry'])).resumen!.filas, 120)
  assert.equal((await run(['count', 'Orders', '--filter', 'DocEntry gt 300'])).resumen!.total, 37)
  assert.equal((await main(['page', 'Orders', '--top', 'abc'], root)).error!.code, 'INVALID_ARGUMENTS')
  assert.equal((await main(['page', 'Orders', '--top', '0'], root)).error!.code, 'INVALID_ARGUMENTS')
  assert.equal((await main(['traverse', 'Orders', '--max-rows', '0'], root)).error!.code, 'INVALID_ARGUMENTS')
  assert.equal((await main(['count'], root)).error!.code, 'INVALID_ARGUMENTS')
})
