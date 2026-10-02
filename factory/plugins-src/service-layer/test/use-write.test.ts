/** POST, PATCH and DELETE (ADR 0008): in seco by default, sent only with `--execute`. Against the real Service Layer. */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { writeSetup } from '../src/setup/setup.ts'
import { main } from '../src/use/command.ts'
import type { HttpRequest } from '../src/common/sl.ts'
import { live, realCredentials, recording } from './sl-env.ts'

async function repo(versionOData: 'v1' | 'v2', envs: string[] = ['dev']) {
  const root = await mkdtemp(join(tmpdir(), 'sbo-'))
  await writeSetup({ root, versionB1: 'FP 2608', versionOData, environments: Object.fromEntries(envs.map((e) => [e, realCredentials()])) })
  return root
}

const run = (root: string, argv: string[], seen?: HttpRequest[]) => live(root, () => main(argv, root, seen ? { transport: recording(seen) } : {}))

/** What reached the Service Layer besides the session itself (Login/Logout are POSTs too). */
const writes = (seen: HttpRequest[]) => seen.filter((r) => r.method !== 'GET' && !/\/(Login|Logout)$/.test(r.url))

const unique = (prefix: string) => `${prefix}${Date.now().toString(36).slice(-6).toUpperCase()}${Math.floor(Math.random() * 36 ** 2).toString(36).toUpperCase()}`.slice(0, 15)

for (const version of ['v1', 'v2'] as const) {
  test(`${version}: without --execute, POST, PATCH and DELETE only print the request and change nothing on the server`, async () => {
    const root = await repo(version)
    const cardCode = unique('SBOW')
    const seen: HttpRequest[] = []
    const base = `/b1s/${version}/BusinessPartners`

    const before = await run(root, ['get', 'BusinessPartners', 'C50000', '--select', 'CardName'])
    assert.equal(before.ok, true, JSON.stringify(before))
    const countBefore = await run(root, ['count', 'BusinessPartners'])

    const post = await run(root, ['post', 'BusinessPartners', '--body', JSON.stringify({ CardCode: cardCode, CardName: 'Dry run' })], seen)
    assert.equal(post.ok, true, JSON.stringify(post))
    assert.equal(post.status, null)
    assert.equal(post.resumen!.ejecutado, false)
    const postReq = post.resumen!.peticion as { metodo: string; url: string; cuerpo: unknown }
    assert.equal(postReq.metodo, 'POST')
    assert.ok(postReq.url.startsWith(realCredentials().url.replace(/\/+$/, '')) && postReq.url.endsWith(base), postReq.url)
    assert.deepEqual(postReq.cuerpo, { CardCode: cardCode, CardName: 'Dry run' })

    const patch = await run(root, ['patch', 'BusinessPartners', 'C50000', '--body', '{"CardName":"Changed"}'], seen)
    const patchReq = patch.resumen!.peticion as { metodo: string; url: string; cuerpo: unknown }
    assert.equal(patchReq.metodo, 'PATCH')
    assert.ok(patchReq.url.endsWith(`${base}('C50000')`), patchReq.url)
    assert.deepEqual(patchReq.cuerpo, { CardName: 'Changed' })

    const del = await run(root, ['delete', 'BusinessPartners', 'C50000'], seen)
    const delReq = del.resumen!.peticion as { metodo: string; url: string; cuerpo: unknown }
    assert.equal(delReq.metodo, 'DELETE')
    assert.ok(delReq.url.endsWith(`${base}('C50000')`), delReq.url)
    assert.equal(delReq.cuerpo, null)

    // Not a single write request left the process, and the server is as it was.
    assert.deepEqual(writes(seen), [])
    const after = await run(root, ['get', 'BusinessPartners', 'C50000', '--select', 'CardName'])
    assert.equal(after.ok, true)
    assert.equal(JSON.stringify(after.resumen).includes('Changed'), false)
    const countAfter = await run(root, ['count', 'BusinessPartners'])
    assert.deepEqual(countAfter.resumen, countBefore.resumen)
    const missing = await run(root, ['get', 'BusinessPartners', cardCode])
    assert.equal(missing.status, 404)
  })
}

test('the body can come from a file, and it must be JSON', async () => {
  const root = await repo('v2')
  const file = join(root, 'body.json')
  await writeFile(file, '{ "CardName": "From file" }')
  const ok = await run(root, ['patch', 'BusinessPartners', 'C50000', '--body-file', file])
  assert.deepEqual((ok.resumen!.peticion as { cuerpo: unknown }).cuerpo, { CardName: 'From file' })

  const bad = await run(root, ['post', 'BusinessPartners', '--body', '{CardCode: nope}'])
  assert.equal(bad.ok, false)
  assert.equal(bad.error!.code, 'INVALID_BODY')
  const none = await run(root, ['post', 'BusinessPartners'])
  assert.equal(none.error!.code, 'INVALID_ARGUMENTS')
  const both = await run(root, ['post', 'BusinessPartners', '--body', '{}', '--body-file', file])
  assert.equal(both.error!.code, 'INVALID_ARGUMENTS')
})

for (const version of ['v1', 'v2'] as const) {
  test(`${version}: with --execute it creates, modifies and deletes a BusinessPartner, and the answer keeps the records out of the output`, async () => {
    const root = await repo(version)
    const cardCode = unique('SBOX')
    const seen: HttpRequest[] = []

    const created = await run(root, ['post', 'BusinessPartners', '--body', JSON.stringify({ CardCode: cardCode, CardName: 'Created by test' }), '--execute'], seen)
    assert.equal(created.ok, true, JSON.stringify(created))
    assert.equal(created.status, 201)
    assert.equal(created.resumen!.ejecutado, true)
    assert.deepEqual(created.resumen!.claves, [cardCode])
    assert.ok(!JSON.stringify(created).includes('Created by test'), 'the created record is in the Volcado, not in the output')
    assert.deepEqual(writes(seen).map((r) => r.method), ['POST'])
    assert.equal(writes(seen)[0].headers['If-Match'], undefined, 'no If-Match of our own')
    assert.equal(writes(seen)[0].headers['Prefer'], undefined)
    const stored = JSON.parse(await (await import('node:fs/promises')).readFile(join(created.resumen!.ruta as string, 'BusinessPartners', `${cardCode}.json`), 'utf8'))
    assert.equal(stored.CardName, 'Created by test')

    const patched = await run(root, ['patch', 'BusinessPartners', cardCode, '--body', '{"CardName":"Patched by test"}', '--execute'], seen)
    assert.equal(patched.ok, true, JSON.stringify(patched))
    assert.equal(patched.status, 204)
    assert.equal(patched.resumen!.ruta, undefined, 'nothing came back, nothing is dumped')
    assert.equal(writes(seen).at(-1)!.headers['If-Match'], undefined)
    const read = await run(root, ['get', 'BusinessPartners', cardCode, '--select', 'CardName'])
    const record = JSON.parse(await (await import('node:fs/promises')).readFile(join(read.resumen!.ruta as string, 'BusinessPartners', `${cardCode}.json`), 'utf8'))
    assert.equal(record.CardName, 'Patched by test')

    const deleted = await run(root, ['delete', 'BusinessPartners', cardCode, '--execute'], seen)
    assert.equal(deleted.ok, true, JSON.stringify(deleted))
    assert.equal(deleted.status, 204)
    assert.deepEqual(writes(seen).map((r) => r.method), ['POST', 'PATCH', 'DELETE'])
    assert.equal((await run(root, ['get', 'BusinessPartners', cardCode])).status, 404)
  })

  test(`${version}: the SL error comes out literal for an unknown field and for a missing mandatory field`, async () => {
    const root = await repo(version)
    const cardCode = unique('SBOE')
    const code = (n: number) => (version === 'v1' ? n : String(n))

    const unknown = await run(root, ['post', 'BusinessPartners', '--body', JSON.stringify({ CardCode: cardCode, CardName: 'x', NoSuchField: 1 }), '--execute'])
    assert.equal(unknown.ok, false)
    assert.equal(unknown.status, 400)
    assert.equal(unknown.resumen, null)
    assert.equal(unknown.error!.code, code(-1000), JSON.stringify(unknown))
    assert.match(unknown.error!.message, /NoSuchField/)

    const missing = await run(root, ['post', 'BusinessPartners', '--body', JSON.stringify({ CardName: 'No code' }), '--execute'])
    assert.equal(missing.ok, false)
    assert.equal(missing.status, 400)
    assert.ok(missing.error!.message.length > 0)
    console.log(`  [${version}] unknown field -> ${unknown.status} ${JSON.stringify(unknown.error)}`)
    console.log(`  [${version}] no CardCode  -> ${missing.status} ${JSON.stringify(missing.error)}`)
  })
}

test('prod is written only with --allow-prod in that call, and the dry run still works there', async () => {
  const root = await repo('v2', ['prod'])
  const seen: HttpRequest[] = []
  const body = JSON.stringify({ CardCode: unique('SBOP'), CardName: 'Prod' })

  const dry = await run(root, ['post', 'BusinessPartners', '--body', body], seen)
  assert.equal(dry.ok, true, JSON.stringify(dry))
  assert.match(dry.resumen!.paraEjecutar as string, /production/)

  const refused = await run(root, ['post', 'BusinessPartners', '--body', body, '--execute'], seen)
  assert.equal(refused.ok, false)
  assert.equal(refused.status, null)
  assert.equal(refused.error!.code, 'PROD_WRITE_NOT_ALLOWED')
  assert.match(refused.error!.message, /--allow-prod/)
  assert.deepEqual(writes(seen), [], 'nothing was sent')

  const done = await run(root, ['post', 'BusinessPartners', '--body', body, '--execute', '--allow-prod'], seen)
  assert.equal(done.ok, true, JSON.stringify(done))
  assert.equal(done.status, 201)
  const key = (done.resumen!.claves as string[])[0]
  assert.equal((await run(root, ['delete', 'BusinessPartners', key, '--execute', '--allow-prod'])).status, 204)
  // The flag changes nothing in other environments.
  const dev = await repo('v2')
  assert.equal((await run(dev, ['delete', 'BusinessPartners', key, '--allow-prod'])).ok, true)
})

test('the ficha rule applies to a write: it is generated when missing, and a stale one is regenerated', async () => {
  const root = await repo('v2')
  const first = await run(root, ['patch', 'BusinessPartners', 'C50000', '--body', '{"CardName":"x"}'])
  assert.equal(first.resumen!.contextoRegenerado, true, JSON.stringify(first))
  const second = await run(root, ['patch', 'BusinessPartners', 'C50000', '--body', '{"CardName":"x"}'])
  assert.equal(second.resumen!.contextoRegenerado, undefined)
  assert.ok(second.resumen!.contexto)
  const later = await live(root, () => main(['patch', 'BusinessPartners', 'C50000', '--body', '{"CardName":"x"}'], root, { now: () => new Date(Date.now() + 8 * 24 * 3_600_000) }))
  assert.equal(later.resumen!.contextoRegenerado, true)
})
