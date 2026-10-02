/** `request` (ADR 0008, ADR 0012): writes in seco by default, sent only with `--execute`; headers, $batch, read-POST, actions. Against the real Service Layer. */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
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

    const post = await run(root, ['request', 'POST', 'BusinessPartners', '--body', JSON.stringify({ CardCode: cardCode, CardName: 'Dry run' })], seen)
    assert.equal(post.ok, true, JSON.stringify(post))
    assert.equal(post.status, null)
    assert.equal(post.resumen!.ejecutado, false)
    const postReq = post.resumen!.peticion as { metodo: string; url: string; cuerpo: unknown }
    assert.equal(postReq.metodo, 'POST')
    assert.ok(postReq.url.startsWith(realCredentials().url.replace(/\/+$/, '')) && postReq.url.endsWith(base), postReq.url)
    assert.deepEqual(postReq.cuerpo, { CardCode: cardCode, CardName: 'Dry run' })

    const patch = await run(root, ['request', 'PATCH', "BusinessPartners('C50000')", '--body', '{"CardName":"Changed"}'], seen)
    const patchReq = patch.resumen!.peticion as { metodo: string; url: string; cuerpo: unknown }
    assert.equal(patchReq.metodo, 'PATCH')
    assert.ok(patchReq.url.endsWith(`${base}('C50000')`), patchReq.url)
    assert.deepEqual(patchReq.cuerpo, { CardName: 'Changed' })

    const del = await run(root, ['request', 'DELETE', "BusinessPartners('C50000')"], seen)
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
  const ok = await run(root, ['request', 'PATCH', "BusinessPartners('C50000')", '--body-file', file])
  assert.deepEqual((ok.resumen!.peticion as { cuerpo: unknown }).cuerpo, { CardName: 'From file' })

  const bad = await run(root, ['request', 'POST', 'BusinessPartners', '--body', '{CardCode: nope}'])
  assert.equal(bad.ok, false)
  assert.equal(bad.error!.code, 'INVALID_BODY')
  const none = await run(root, ['request', 'POST', 'BusinessPartners'])
  assert.equal((none.resumen!.peticion as { cuerpo: unknown }).cuerpo, null, 'a POST may have no body (actions)')
  const both = await run(root, ['request', 'POST', 'BusinessPartners', '--body', '{}', '--body-file', file])
  assert.equal(both.error!.code, 'INVALID_ARGUMENTS')
})

for (const version of ['v1', 'v2'] as const) {
  test(`${version}: with --execute it creates, modifies and deletes a BusinessPartner, and the answer keeps the records out of the output`, async () => {
    const root = await repo(version)
    const cardCode = unique('SBOX')
    const seen: HttpRequest[] = []

    const created = await run(root, ['request', 'POST', 'BusinessPartners', '--body', JSON.stringify({ CardCode: cardCode, CardName: 'Created by test' }), '--execute'], seen)
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

    const patched = await run(root, ['request', 'PATCH', `BusinessPartners('${cardCode}')`, '--body', '{"CardName":"Patched by test"}', '--execute'], seen)
    assert.equal(patched.ok, true, JSON.stringify(patched))
    assert.equal(patched.status, 204)
    assert.equal(patched.resumen!.ruta, undefined, 'nothing came back, nothing is dumped')
    assert.equal(writes(seen).at(-1)!.headers['If-Match'], undefined)
    const read = await run(root, ['get', 'BusinessPartners', cardCode, '--select', 'CardName'])
    const record = JSON.parse(await (await import('node:fs/promises')).readFile(join(read.resumen!.ruta as string, 'BusinessPartners', `${cardCode}.json`), 'utf8'))
    assert.equal(record.CardName, 'Patched by test')

    const deleted = await run(root, ['request', 'DELETE', `BusinessPartners('${cardCode}')`, '--execute'], seen)
    assert.equal(deleted.ok, true, JSON.stringify(deleted))
    assert.equal(deleted.status, 204)
    assert.deepEqual(writes(seen).map((r) => r.method), ['POST', 'PATCH', 'DELETE'])
    assert.equal((await run(root, ['get', 'BusinessPartners', cardCode])).status, 404)
  })

  test(`${version}: the SL error comes out literal for an unknown field and for a missing mandatory field`, async () => {
    const root = await repo(version)
    const cardCode = unique('SBOE')
    const code = (n: number) => (version === 'v1' ? n : String(n))

    const unknown = await run(root, ['request', 'POST', 'BusinessPartners', '--body', JSON.stringify({ CardCode: cardCode, CardName: 'x', NoSuchField: 1 }), '--execute'])
    assert.equal(unknown.ok, false)
    assert.equal(unknown.status, 400)
    assert.equal(unknown.resumen, null)
    assert.equal(unknown.error!.code, code(-1000), JSON.stringify(unknown))
    assert.match(unknown.error!.message, /NoSuchField/)

    const missing = await run(root, ['request', 'POST', 'BusinessPartners', '--body', JSON.stringify({ CardName: 'No code' }), '--execute'])
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

  const dry = await run(root, ['request', 'POST', 'BusinessPartners', '--body', body], seen)
  assert.equal(dry.ok, true, JSON.stringify(dry))
  assert.match(dry.resumen!.paraEjecutar as string, /production/)

  const refused = await run(root, ['request', 'POST', 'BusinessPartners', '--body', body, '--execute'], seen)
  assert.equal(refused.ok, false)
  assert.equal(refused.status, null)
  assert.equal(refused.error!.code, 'PROD_WRITE_NOT_ALLOWED')
  assert.match(refused.error!.message, /--allow-prod/)
  assert.deepEqual(writes(seen), [], 'nothing was sent')

  const done = await run(root, ['request', 'POST', 'BusinessPartners', '--body', body, '--execute', '--allow-prod'], seen)
  assert.equal(done.ok, true, JSON.stringify(done))
  assert.equal(done.status, 201)
  const key = (done.resumen!.claves as string[])[0]
  assert.equal((await run(root, ['request', 'DELETE', `BusinessPartners('${key}')`, '--execute', '--allow-prod'])).status, 204)
  // The flag changes nothing in other environments.
  const dev = await repo('v2')
  assert.equal((await run(dev, ['request', 'DELETE', `BusinessPartners('${key}')`, '--allow-prod'])).ok, true)
})

test('the ficha rule applies to a write: it is generated when missing, and a stale one is regenerated', async () => {
  const root = await repo('v2')
  const first = await run(root, ['request', 'PATCH', "BusinessPartners('C50000')", '--body', '{"CardName":"x"}'])
  assert.equal(first.resumen!.contextoRegenerado, true, JSON.stringify(first))
  const second = await run(root, ['request', 'PATCH', "BusinessPartners('C50000')", '--body', '{"CardName":"x"}'])
  assert.equal(second.resumen!.contextoRegenerado, undefined)
  assert.ok(second.resumen!.contexto)
  const later = await live(root, () => main(['request', 'PATCH', "BusinessPartners('C50000')", '--body', '{"CardName":"x"}'], root, { now: () => new Date(Date.now() + 8 * 24 * 3_600_000) }))
  assert.equal(later.resumen!.contextoRegenerado, true)
})

for (const version of ['v1', 'v2'] as const) {
  test(`${version}: a document with lines: POST, PATCH of one line inside the collection and DELETE (a draft); DELETE of an order is refused by the SL`, async () => {
    const { readFile } = await import('node:fs/promises')
    const root = await repo(version)
    const lines = async (key: string) => {
      const read = await run(root, ['get', 'Drafts', key])
      assert.equal(read.ok, true, JSON.stringify(read))
      const record = JSON.parse(await readFile(join(read.resumen!.ruta as string, 'Drafts', `${key}.json`), 'utf8'))
      return record.DocumentLines.map((l: { LineNum: number; Quantity: number }) => [l.LineNum, l.Quantity])
    }
    const body = { DocObjectCode: 'oOrders', CardCode: 'C50000', DocDueDate: '2026-12-31', DocumentLines: [{ ItemCode: 'A00001', Quantity: 2 }, { ItemCode: 'A00001', Quantity: 3 }] }
    const created = await run(root, ['request', 'POST', 'Drafts', '--body', JSON.stringify(body), '--execute'])
    assert.equal(created.status, 201, JSON.stringify(created))
    const key = (created.resumen!.claves as string[])[0]
    assert.deepEqual(await lines(key), [[0, 2], [1, 3]])

    const patched = await run(root, ['request', 'PATCH', `Drafts(${key})`, '--body', '{"DocumentLines":[{"LineNum":1,"Quantity":7}]}', '--execute'])
    assert.equal(patched.status, 204, JSON.stringify(patched))
    assert.deepEqual(await lines(key), [[0, 2], [1, 7]], 'only line 1 changed, line 0 is kept')

    assert.equal((await run(root, ['request', 'DELETE', `Drafts(${key})`, '--execute'])).status, 204)

    const order = await run(root, ['request', 'POST', 'Orders', '--body', JSON.stringify({ ...body, DocObjectCode: undefined }), '--execute'])
    assert.equal(order.status, 201, JSON.stringify(order))
    const refused = await run(root, ['request', 'DELETE', `Orders(${(order.resumen!.claves as string[])[0]})`, '--execute'])
    assert.equal(refused.ok, false)
    assert.equal(refused.status, 400)
    assert.equal(refused.error!.code, version === 'v1' ? -5006 : '-5006')
    console.log(`  [${version}] DELETE Orders -> ${refused.status} ${JSON.stringify(refused.error)}`)
    // An order cannot be deleted; it is cancelled with an action (a POST with no body), so the test leaves it cancelled.
    const cancelled = await run(root, ['request', 'POST', `Orders(${(order.resumen!.claves as string[])[0]})/Cancel`, '--execute'])
    assert.equal(cancelled.status, 204, JSON.stringify(cancelled))
  })
}


for (const version of ['v1', 'v2'] as const) {
  test(`${version}: any header goes through (B1S-ReplaceCollectionsOnPatch replaces a collection; Prefer changes the page size); Cookie is refused`, async () => {
    const root = await repo(version)
    const cardCode = unique('SBOH')
    const seen: HttpRequest[] = []
    const contacts = async (key: string) => {
      const read = await run(root, ['request', 'GET', `BusinessPartners('${key}')?$select=CardCode,ContactEmployees`])
      assert.equal(read.ok, true, JSON.stringify(read))
      const record = JSON.parse(await readFile(read.resumen!.archivo as string, 'utf8'))
      return (record.ContactEmployees as { Name: string }[]).map((c) => c.Name).sort()
    }
    const created = await run(root, ['request', 'POST', 'BusinessPartners', '--body', JSON.stringify({ CardCode: cardCode, CardName: 'Headers', ContactEmployees: [{ Name: 'A' }, { Name: 'B' }] }), '--execute'], seen)
    assert.equal(created.status, 201, JSON.stringify(created))
    try {
      assert.deepEqual(await contacts(cardCode), ['A', 'B'])
      const replaced = await run(root, ['request', 'PATCH', `BusinessPartners('${cardCode}')`, '--body', '{"ContactEmployees":[{"Name":"C"}]}', '--header', 'B1S-ReplaceCollectionsOnPatch: true', '--execute'], seen)
      assert.equal(replaced.status, 204, JSON.stringify(replaced))
      assert.equal(writes(seen).at(-1)!.headers['B1S-ReplaceCollectionsOnPatch'], 'true')
      assert.deepEqual(await contacts(cardCode), ['C'], 'the header made the collection a replacement, not an append')

      const page = await run(root, ['request', 'GET', 'BusinessPartners?$select=CardCode', '--header', 'Prefer: odata.maxpagesize=2'])
      assert.equal(page.resumen!.filas, 2)
      assert.ok(page.resumen!.siguiente, 'nextLink is reported, not followed')
      assert.equal((await run(root, ['request', 'GET', 'BusinessPartners', '--header', 'Cookie: B1SESSION=x'])).error!.code, 'HEADER_RESERVED')
    } finally {
      assert.equal((await run(root, ['request', 'DELETE', `BusinessPartners('${cardCode}')`, '--execute'])).status, 204)
    }
  })

  test(`${version}: $batch with a changeset (Content-ID and $1) runs, answers one file per sub-response, and a failing changeset is rolled back`, async () => {
    const root = await repo(version)
    const cardCode = unique('SBOB')
    const file = join(root, 'batch.json')
    await writeFile(
      file,
      JSON.stringify({
        requests: [
          { method: 'GET', path: "BusinessPartners('C50000')?$select=CardCode", contentId: 'read' },
          {
            changeset: [
              { method: 'POST', path: 'BusinessPartners', contentId: '1', body: { CardCode: cardCode, CardName: 'Batch' } },
              { method: 'PATCH', path: '$1', contentId: '2', body: { CardName: 'Batch patched' } },
            ],
          },
        ],
      }),
    )
    const seen: HttpRequest[] = []
    const dry = await run(root, ['request', 'POST', '$batch', '--body-file', file], seen)
    assert.equal(dry.resumen!.ejecutado, false)
    assert.deepEqual(writes(seen), [])
    try {
      const out = await run(root, ['request', 'POST', '$batch', '--body-file', file, '--execute'])
      assert.equal(out.ok, true, JSON.stringify(out))
      assert.deepEqual(out.resumen!.subrespuestas, [{ id: 'read', estado: 200 }, { id: '1', estado: 201 }, { id: '2', estado: 204 }])
      assert.equal(out.resumen!.errores, 0)
      const one = JSON.parse(await readFile(join(out.resumen!.ruta as string, 'batch', '1.json'), 'utf8'))
      assert.equal(one.status, 201)
      const after = await run(root, ['request', 'GET', `BusinessPartners('${cardCode}')?$select=CardName`])
      assert.equal(JSON.parse(await readFile(after.resumen!.archivo as string, 'utf8')).CardName, 'Batch patched')
    } finally {
      await run(root, ['request', 'DELETE', `BusinessPartners('${cardCode}')`, '--execute'])
    }

    // The second request of the changeset fails: the first one is rolled back, and the answer says so once.
    const rollback = unique('SBOR')
    await writeFile(
      file,
      JSON.stringify({
        requests: [
          {
            changeset: [
              { method: 'POST', path: 'BusinessPartners', body: { CardCode: rollback, CardName: 'Rolled back' } },
              { method: 'POST', path: 'BusinessPartners', body: { CardCode: rollback, CardName: 'Duplicate' } },
            ],
          },
        ],
      }),
    )
    const failed = await run(root, ['request', 'POST', '$batch', '--body-file', file, '--execute'])
    assert.equal(failed.ok, true)
    assert.equal(failed.resumen!.errores, 1)
    assert.equal((await run(root, ['request', 'GET', `BusinessPartners('${rollback}')`])).status, 404, 'rolled back')
  })

  test(`${version}: a POST that only reads (SQLQueries List) runs with --read and its rows go to the Volcado; without it, it is a dry run`, async () => {
    const root = await repo(version)
    const sqlCode = unique('zzq').toLowerCase()
    const seen: HttpRequest[] = []
    const made = await run(root, ['request', 'POST', 'SQLQueries', '--body', JSON.stringify({ SqlCode: sqlCode, SqlName: sqlCode, SqlText: 'select top 3 "CardCode" from OCRD' }), '--execute'])
    assert.equal(made.status, 201, JSON.stringify(made))
    try {
      const dry = await run(root, ['request', 'POST', `SQLQueries('${sqlCode}')/List`], seen)
      assert.equal(dry.resumen!.ejecutado, false)
      assert.deepEqual(writes(seen), [])
      const list = await run(root, ['request', 'POST', `SQLQueries('${sqlCode}')/List`, '--read'], seen)
      assert.equal(list.ok, true, JSON.stringify(list))
      assert.equal(list.resumen!.tipo, 'coleccion')
      assert.equal(list.resumen!.filas, 3)
      assert.equal(writes(seen).length, 1, 'the --read POST was sent without --execute')
    } finally {
      await run(root, ['request', 'DELETE', `SQLQueries('${sqlCode}')`, '--execute'])
    }
  })

  test(`${version}: a $batch of GETs gives the same records as the plain GETs (the answer is read as bytes, nothing is corrupted)`, async () => {
    const root = await repo(version)
    const file = join(root, 'reads.json')
    await writeFile(file, JSON.stringify({ requests: [{ method: 'GET', path: 'BusinessPartners?$select=CardCode,CardName&$top=20&$orderby=CardCode', contentId: 'bp' }] }))
    const batch = await run(root, ['request', 'POST', '$batch', '--body-file', file, '--read'])
    assert.equal(batch.ok, true, JSON.stringify(batch))
    const direct = await run(root, ['request', 'GET', 'BusinessPartners?$select=CardCode,CardName&$top=20&$orderby=CardCode'])
    const sub = JSON.parse(await readFile(join(batch.resumen!.ruta as string, 'batch', 'bp.json'), 'utf8')).body.value
    assert.ok(sub.length > 0)
    assert.equal(JSON.stringify(sub).includes('�'), false)
    assert.equal(sub.length, direct.resumen!.filas)
  })
}

test('attachments: the Service Layer answers literally when its attachment folder is not usable (the demo has none)', async () => {
  const root = await repo('v2')
  await writeFile(join(root, 'a.txt'), 'attachment test')
  const up = await run(root, ['request', 'POST', 'Attachments2', '--file', 'a.txt', '--execute'])
  // The multipart body was understood; what is missing is the server's folder (TESTING.md). With a folder configured this is a 201.
  if (up.ok) {
    const entry = (up.resumen!.claves as string[])[0]
    const down = await run(root, ['request', 'GET', `Attachments2(${entry})/$value`])
    assert.equal(down.resumen!.tipo, 'texto')
    assert.equal(await readFile(down.resumen!.archivo as string, 'utf8'), 'attachment test')
  } else {
    assert.equal(up.status, 400)
    assert.equal(String(up.error!.code), '-5002')
  }
})
