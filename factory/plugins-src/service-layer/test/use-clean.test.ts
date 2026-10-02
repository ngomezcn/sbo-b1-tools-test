import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { writeSetup } from '../src/setup/setup.ts'
import { dumpDir, dumpRoot } from '../src/common/layout.ts'
import { writeDump } from '../src/use/dump.ts'
import { main } from '../src/use/command.ts'
import { count, traverse } from '../src/use/read.ts'
import { live, realCredentials } from './sl-env.ts'

const good = realCredentials()
const HOUR = 3_600_000

async function repo(versionOData: 'v1' | 'v2' = 'v2') {
  const root = await mkdtemp(join(tmpdir(), 'sbo-'))
  await writeSetup({ root, versionB1: 'FP 2608', versionOData, environments: { dev: good } })
  return root
}

/** A Volcado folder as the Uso would have left it, dated `ageMs` before `now`. */
async function fakeDump(root: string, now: Date, ageMs: number, id: string): Promise<string> {
  const dir = dumpDir(root, 'dev', new Date(now.getTime() - ageMs), id)
  await mkdir(join(dir, 'Orders'), { recursive: true })
  await writeFile(join(dir, 'Orders', '1.json'), '{}')
  return dir
}

const names = async (root: string) => (await readdir(dumpRoot(root, 'dev'))).sort()
const base = (p: string) => p.split(/[\\/]/).pop()!

test('clean deletes the Volcado of one execution, by id, by folder name or by path, and only that one', async () => {
  const root = await repo()
  const now = new Date()
  const [a, b, c, d] = await Promise.all(['aaa111', 'bbb222', 'ccc333', 'ddd444'].map((id) => fakeDump(root, now, 1000, id)))

  const byId = await main(['clean', 'aaa111'], root, { now: () => now })
  assert.equal(byId.ok, true, JSON.stringify(byId))
  assert.equal(byId.resumen!.eliminado, a)
  assert.deepEqual(await names(root), [base(b), base(c), base(d)].sort())

  assert.equal((await main(['clean', base(b)], root, { now: () => now })).ok, true)
  assert.equal((await main(['clean', c], root, { now: () => now })).ok, true) // absolute path
  assert.deepEqual(await names(root), [base(d)])

  const again = await main(['clean', 'aaa111'], root, { now: () => now })
  assert.equal(again.error!.code, 'DUMP_NOT_FOUND')
})

test('clean never deletes anything outside data/ of the environment', async () => {
  const root = await repo()
  const now = new Date()
  const keep = await fakeDump(root, now, 1000, 'keep01')
  await writeFile(join(root, 'precious.txt'), 'x')
  await mkdir(join(dumpRoot(root, 'dev'), 'notes'))
  const attempts = ['..', '../..', '.', dumpRoot(root, 'dev'), join(dumpRoot(root, 'dev'), '..'), root, join(keep, 'Orders'), join(keep, '..', '..', 'credentials.json'), 'notes', '../credentials.json', 'C:\\Windows']
  for (const target of attempts) {
    const out = await main(['clean', target], root, { now: () => now })
    assert.equal(out.ok, false, target)
    assert.match(out.error!.code as string, /^DUMP_/, `${target}: ${JSON.stringify(out)}`)
  }
  assert.deepEqual(await names(root), ['notes', base(keep)].sort())
  assert.ok((await readdir(root)).includes('precious.txt'))
  assert.ok((await readdir(join(root, '.sbo-skills/service-layer/dev'))).includes('credentials.json'))
})

test('safety net: any Uso run deletes the Volcados older than 24 h of its environment, and nothing else', async () => {
  const root = await repo()
  const now = new Date()
  const old = await fakeDump(root, now, 25 * HOUR, 'old001')
  const justUnder = await fakeDump(root, now, 24 * HOUR - 60_000, 'new001')
  const fresh = await fakeDump(root, now, HOUR, 'new002')
  await mkdir(join(dumpRoot(root, 'dev'), 'not-a-dump'))
  await mkdir(join(dumpRoot(root, 'dev'), '19990101-000000-'))

  const out = await live(root, () => count({ root, entitySet: 'BusinessPartners', now: () => now }))
  assert.equal(out.ok, true, JSON.stringify(out))
  assert.deepEqual(await names(root), ['19990101-000000-', 'not-a-dump', base(justUnder), base(fresh)].sort())
  assert.ok(!(await names(root)).includes(base(old)))

  // The clock is the injected one: a day later the "fresh" ones are old too.
  const later = new Date(now.getTime() + 25 * HOUR)
  await live(root, () => count({ root, entitySet: 'BusinessPartners', now: () => later }))
  assert.deepEqual(await names(root), ['19990101-000000-', 'not-a-dump'])
})

test('safety net also runs on failing commands once the environment is known, and on clean', async () => {
  const root = await repo()
  const now = new Date()
  await fakeDump(root, now, 30 * HOUR, 'old002')
  const out = await main(['page', 'No/Such'], root, { now: () => now })
  assert.equal(out.error!.code, 'INVALID_ENTITY_SET')
  const keep = await fakeDump(root, now, 1000, 'keep02')
  await fakeDump(root, now, 30 * HOUR, 'old003')
  assert.equal((await main(['clean', 'keep02'], root, { now: () => now })).resumen!.caducados, 2)
  assert.deepEqual(await names(root), [])
  assert.ok(keep)
})

test('two parallel executions write their own Volcado and do not step on each other', async () => {
  const root = await repo()
  // One session first: parallel first logins can fail on the demo (TESTING.md).
  assert.equal((await live(root, () => count({ root, entitySet: 'Items' }))).ok, true)
  const fixed = new Date()
  const [x, y] = await Promise.all([
    live(root, () => traverse({ root, entitySet: 'Orders', select: 'DocEntry', orderby: 'DocEntry', maxRows: 250, now: () => fixed })),
    live(root, () => traverse({ root, entitySet: 'Orders', select: 'DocEntry', orderby: 'DocEntry desc', maxRows: 120, now: () => fixed })),
  ])
  assert.equal(x.ok, true, JSON.stringify(x))
  assert.equal(y.ok, true, JSON.stringify(y))
  assert.notEqual(x.resumen!.ruta, y.resumen!.ruta)
  assert.equal((await readdir(join(x.resumen!.ruta as string, 'Orders'))).length, 250)
  assert.equal((await readdir(join(y.resumen!.ruta as string, 'Orders'))).length, 120)

  // Cleaning one leaves the other whole.
  await main(['clean', base(x.resumen!.ruta as string)], root)
  assert.equal((await readdir(join(y.resumen!.ruta as string, 'Orders'))).length, 120)
  assert.deepEqual(await names(root), [base(y.resumen!.ruta as string)])
})

test('a folder name that is already taken is never reused: a new id is drawn', async () => {
  const root = await repo()
  const now = new Date()
  const ids = ['dup', 'dup', 'dup', 'free']
  const common = { root, environment: 'dev' as const, now, newId: () => ids.shift()!, entitySet: 'E', query: { method: 'GET', path: 'E' } }
  const first = await writeDump({ ...common, records: [{ Code: '1' }] })
  const second = await writeDump({ ...common, records: [{ Code: '2' }] })
  assert.ok(first.dir.endsWith('-dup'))
  assert.ok(second.dir.endsWith('-free'))
  assert.equal((await readdir(join(first.dir, 'E')))[0], '1.json')
  assert.equal((await readdir(join(second.dir, 'E')))[0], '2.json')
})

test('clean needs an argument', async () => {
  const root = await repo()
  assert.equal((await main(['clean'], root)).error!.code, 'INVALID_ARGUMENTS')
})
