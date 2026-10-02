import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { writeSetup } from '../src/setup/setup.ts'
import { logout, type HttpRequest } from '../src/common/sl.ts'
import { sessionPath } from '../src/common/layout.ts'
import { getLive, realCredentials, recording, retried } from './sl-env.ts'

const good = realCredentials()

async function setup(versionOData: 'v1' | 'v2') {
  const root = await mkdtemp(join(tmpdir(), 'sbo-'))
  await writeSetup({ root, versionB1: 'FP 2608', versionOData, environments: { dev: good } })
  const seen: HttpRequest[] = []
  const transport = recording(seen)
  const before = retried.count
  // Logins the code needed, not counting the ones a test helper repeated on a broken demo session.
  const logins = () => seen.filter((r) => r.url.endsWith('/Login')).length - (retried.count - before)
  const get = (now: Date) =>
    getLive({ root, entitySet: 'BusinessPartners', key: 'C50000', transport, now: () => now })
  return { root, seen, logins, get }
}

const T0 = new Date('2026-10-02T10:00:00Z')
const minutes = (n: number) => new Date(T0.getTime() + n * 60_000)

for (const version of ['v1', 'v2'] as const) {
  test(`${version}: the session is stored, reused, and holds no password`, async () => {
    const { root, logins, get } = await setup(version)
    assert.equal((await get(T0)).ok, true)
    assert.equal((await get(minutes(1))).ok, true)
    assert.equal(logins(), 1)

    const file = await readFile(sessionPath(root, 'dev'), 'utf8')
    assert.match(file, /B1SESSION=/)
    assert.ok(!file.includes(good.password))
  })

  test(`${version}: a session older than 30 minutes is replaced (injected clock)`, async () => {
    const { logins, get } = await setup(version)
    await get(T0)
    await get(minutes(29))
    assert.equal(logins(), 1)
    await get(minutes(60)) // 31 minutes after the last use
    assert.equal(logins(), 2)
    await get(minutes(61))
    assert.equal(logins(), 2)
  })

  test(`${version}: a real 401 (session logged out elsewhere) recovers by itself`, async () => {
    const { root, logins, get } = await setup(version)
    await get(T0)
    const { cookie } = JSON.parse(await readFile(sessionPath(root, 'dev'), 'utf8'))
    await logout(good, version, cookie)

    const out = await get(minutes(1))
    assert.equal(out.ok, true)
    assert.equal(logins(), 2)
  })

  test(`${version}: a corrupted session cookie recovers by itself`, async () => {
    const { root, logins, get } = await setup(version)
    await get(T0)
    await writeFile(sessionPath(root, 'dev'), JSON.stringify({ cookie: 'B1SESSION=garbage', lastUsedAt: minutes(0).toISOString() }))
    const out = await get(minutes(1))
    assert.equal(out.ok, true, JSON.stringify(out))
    assert.equal(logins(), 2)
  })
}

test('a 404 is returned as is and does not trigger a relogin', async () => {
  const { root, logins, get, seen } = await setup('v2')
  await get(T0)
  const transport = recording(seen)
  const out = await getLive({ root, entitySet: 'BusinessPartners', key: 'NOPE', transport, now: () => minutes(1) })
  assert.equal(out.status, 404)
  assert.equal(logins(), 1)
})
