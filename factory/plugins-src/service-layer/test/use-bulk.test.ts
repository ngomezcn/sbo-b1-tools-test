/**
 * Thousands of rows, against the real Service Layer: a disposable user table with 2500 rows (created and filled by the test
 * the first time, then reused). Checks the cap, the pages, the index and the size of the output, and a collection that changes
 * while it is being traversed.
 */
import { before, test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { writeSetup } from '../src/setup/setup.ts'
import { main } from '../src/use/command.ts'
import { defaultTransport, type Transport } from '../src/common/sl.ts'
import { adminSeeing, dropUserTable, ensureUserTable, realCredentials, seedSession, type Admin } from './sl-env.ts'

const ROWS = 2500
const code = (i: number) => `R${String(i).padStart(5, '0')}`

async function repo(versionOData: 'v1' | 'v2') {
  const root = await mkdtemp(join(tmpdir(), 'sbo-'))
  await writeSetup({ root, versionB1: 'FP 2608', versionOData, environments: { dev: realCredentials() } })
  return root
}

let setup: Admin

const FIELDS = [{ Name: 'F1', Size: 50 }]

/**
 * A session that lists the table. A table created a moment ago is listed only by the node that served its creation, and a
 * session can no longer get back to that node later (TESTING.md): if no node lists it, the table is dropped and created again.
 */
async function sessionWithTable(): Promise<Admin> {
  const creator = await ensureUserTable('SBOBULK', 'bott_NoObject', FIELDS, true)
  if ((await creator.call('GET', 'U_SBOBULK?$top=1&$select=Code')).status === 200) return creator
  await creator.close()
  try {
    return await adminSeeing('U_SBOBULK', 12)
  } catch {
    await dropUserTable('SBOBULK')
    return ensureUserTable('SBOBULK', 'bott_NoObject', FIELDS, true)
  }
}

before(async () => {
  setup = await sessionWithTable()
  const have = Number((await setup.call('GET', 'U_SBOBULK/$count')).text)
  if (have === ROWS) return
  // Fill what is missing, eight at a time.
  const present = new Set<string>()
  for (let skip = 0; skip < have; skip += 100) {
    const page = await setup.call('GET', `U_SBOBULK?$select=Code&$orderby=Code&$skip=${skip}&$top=100`)
    for (const r of page.json.value) present.add(r.Code)
  }
  const todo = Array.from({ length: ROWS }, (_, i) => code(i + 1)).filter((c) => !present.has(c))
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      for (let c = todo.pop(); c !== undefined; c = todo.pop()) {
        const made = await setup.call('POST', 'U_SBOBULK', { Code: c, Name: `row ${c}`, U_F1: `data ${c}` })
        if (made.status !== 201) throw new Error(`could not insert ${c}: ${made.text.slice(0, 200)}`)
      }
    }),
  )
  assert.equal(Number((await setup.call('GET', 'U_SBOBULK/$count')).text), ROWS)
})

// The tool talks to the node that lists the table (the session of `setup`; a session is accepted by both service roots, v1 and v2).
async function run(version: 'v1' | 'v2', args: string[], transport?: Transport) {
  const root = await repo(version)
  await seedSession(root, setup.cookie)
  const started = Date.now()
  const out = await main(args, root, { transport })
  return { root, out, ms: Date.now() - started }
}

for (const version of ['v1', 'v2'] as const) {
  test(`${version}: traverse of ${ROWS} rows: the default cap, then the whole table; the index lists every key; the output stays small`, async (t) => {
    const capped = await run(version, ['traverse', 'U_SBOBULK', '--orderby', 'Code'])
    assert.equal(capped.out.ok, true, JSON.stringify(capped.out))
    const r = capped.out.resumen!
    assert.equal(r.filas, 1000)
    assert.equal(r.truncado, true)
    assert.equal(r.tope, 1000)
    assert.equal(r.paginas, 10)
    assert.ok(r.indice && !r.claves, 'more than 50 keys: the output carries the index path, not the keys')
    assert.ok(JSON.stringify(capped.out).length < 1500, `output of ${JSON.stringify(capped.out).length} characters`)
    assert.equal((await readdir(join(r.ruta as string, 'U_SBOBULK'))).length, 1000)

    const all = await run(version, ['traverse', 'U_SBOBULK', '--orderby', 'Code', '--max-rows', '5000'])
    assert.equal(all.out.ok, true, JSON.stringify(all.out))
    const a = all.out.resumen!
    t.diagnostic(`${version}: ${ROWS} rows in ${a.paginas} pages, ${all.ms} ms; output ${JSON.stringify(all.out).length} characters`)
    assert.equal(a.filas, ROWS)
    assert.equal(a.truncado, false)
    // 25 full pages and a 26th, empty one: a full last page still carries a nextLink.
    assert.equal(a.paginas, 26)
    assert.ok(JSON.stringify(all.out).length < 1500)
    const index = JSON.parse(await readFile(a.indice as string, 'utf8'))
    assert.equal(index.count, ROWS)
    assert.equal(index.keys.length, ROWS)
    assert.equal(new Set(index.keys).size, ROWS)
    assert.deepEqual(index.keys.slice(0, 3), [code(1), code(2), code(3)])
    assert.equal(index.truncated, false)
    assert.equal((await readdir(join(a.ruta as string, 'U_SBOBULK'))).length, ROWS)
    assert.equal(JSON.parse(await readFile(join(a.ruta as string, 'U_SBOBULK', `${code(777)}.json`), 'utf8')).U_F1, `data ${code(777)}`)
  })
}

test('v2: rows inserted or deleted while the table is traversed repeat or skip a row (paging is by $skip); nothing fails', async (t) => {
  // Between page 10 and page 11 something changes in the table, through another session.
  const changing = (change: () => Promise<unknown>): Transport => {
    let done = false
    return async (request) => {
      if (!done && request.url.includes('$skip=1000')) {
        done = true
        await change()
      }
      return defaultTransport(request)
    }
  }
  const walk = async (change: () => Promise<unknown>) => {
    const { out } = await run('v2', ['traverse', 'U_SBOBULK', '--orderby', 'Code', '--max-rows', '5000'], changing(change))
    assert.equal(out.ok, true, JSON.stringify(out))
    const index = JSON.parse(await readFile(out.resumen!.indice as string, 'utf8'))
    const codes = (index.keys as string[]).map((k) => k.replace(/~\d+$/, ''))
    return { filas: out.resumen!.filas as number, repeated: codes.length - new Set(codes).size, missing: Array.from({ length: ROWS }, (_, i) => code(i + 1)).filter((c) => !codes.includes(c)) }
  }

  // A row inserted before the point where the traversal is: the next page starts one row early, so one row comes twice.
  const inserted = await walk(() => setup.call('POST', 'U_SBOBULK', { Code: 'A00000', Name: 'new', U_F1: 'x' }))
  await setup.call('DELETE', "U_SBOBULK('A00000')")
  t.diagnostic(`insert at the start: ${JSON.stringify(inserted)}`)
  assert.equal(inserted.filas, ROWS + 1)
  assert.equal(inserted.repeated, 1)
  assert.deepEqual(inserted.missing, [])

  // A row deleted before that point: the next page starts one row late, so one row is skipped.
  const deleted = await walk(() => setup.call('DELETE', `U_SBOBULK('${code(5)}')`))
  await setup.call('POST', 'U_SBOBULK', { Code: code(5), Name: `row ${code(5)}`, U_F1: `data ${code(5)}` })
  t.diagnostic(`delete at the start: ${JSON.stringify(deleted)}`)
  // The deleted row was already read; the first row of the next page moved up into the skipped slot.
  assert.equal(deleted.filas, ROWS - 1)
  assert.equal(deleted.repeated, 0)
  assert.deepEqual(deleted.missing, [code(1001)])
})
