/**
 * `request`: the parts that do not need a server (headers, paths, the multipart builder and parser) and the flow with an injected
 * transport (read/write classification, dry run, binary download, attachment upload). What the real Service Layer does with them
 * is in use-request.test.ts.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { mkdtemp, readFile, readdir, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { writeSetup } from '../src/setup/setup.ts'
import { main } from '../src/use/command.ts'
import { assertHeader, parseHeaderFlags } from '../src/use/headers.ts'
import { entitySetOf, normalizePath } from '../src/use/path.ts'
import { buildBatchBody, buildFormData, parseBatchResponse, parseBatchSpec } from '../src/use/multipart.ts'
import { nameResponses } from '../src/use/request.ts'
import { credentialsPath } from '../src/common/layout.ts'
import { defaultTransport, MAX_RESPONSE_BYTES, type HttpRequest, type HttpResponse, type Transport } from '../src/common/sl.ts'

const code = (fn: () => unknown) => {
  try {
    fn()
  } catch (e) {
    return (e as { code?: string }).code
  }
  return undefined
}

// ---- headers ----

test('headers: Cookie, Host and Content-Length are refused with HEADER_RESERVED, any other header is allowed', () => {
  for (const name of ['Cookie', 'cookie', 'HOST', 'Content-Length']) assert.equal(code(() => assertHeader(name, 'x')), 'HEADER_RESERVED', name)
  for (const name of ['B1S-ReplaceCollectionsOnPatch', 'B1S-CaseInsensitive', 'Prefer', 'If-Match', 'Content-Type', 'Authorization', 'Slug', 'X-Anything']) {
    assert.equal(code(() => assertHeader(name, 'v')), undefined, name)
  }
  assert.deepEqual(parseHeaderFlags(['Prefer: return-no-content', 'If-Match: W/"abc"', 'B1S-ReplaceCollectionsOnPatch:true']), {
    Prefer: 'return-no-content',
    'If-Match': 'W/"abc"',
    'B1S-ReplaceCollectionsOnPatch': 'true',
  })
})

test('headers: malformed, line breaks and repeated headers are errors', () => {
  assert.equal(code(() => parseHeaderFlags(['NoColon'])), 'HEADER_INVALID')
  assert.equal(code(() => parseHeaderFlags(['Bad Name: x'])), 'HEADER_INVALID')
  assert.equal(code(() => parseHeaderFlags(['X: a\r\nCookie: b'])), 'HEADER_INVALID')
  assert.equal(code(() => parseHeaderFlags(['X: 1', 'x: 2'])), 'HEADER_INVALID')
})

// ---- paths ----

test('paths: relative to the service root, unsafe characters encoded once, Login/Logout and full URLs refused', () => {
  assert.equal(normalizePath('Orders(5)/Cancel'), 'Orders(5)/Cancel')
  assert.equal(normalizePath("Items?$filter=ItemCode eq 'A 1'"), "Items?$filter=ItemCode%20eq%20'A%201'")
  assert.equal(normalizePath("Items?$filter=ItemCode%20eq%20'A'"), "Items?$filter=ItemCode%20eq%20'A'", 'already encoded: not encoded twice')
  assert.equal(normalizePath("Items?$filter=Name eq 'ñ'"), "Items?$filter=Name%20eq%20'%C3%B1'")
  assert.equal(normalizePath('/$batch'), '$batch')
  assert.equal(code(() => normalizePath('https://x/b1s/v2/Orders')), 'INVALID_PATH')
  assert.equal(code(() => normalizePath('/b1s/v2/Orders')), 'INVALID_PATH')
  assert.equal(code(() => normalizePath('Orders/../Items')), 'INVALID_PATH')
  assert.equal(code(() => normalizePath('')), 'INVALID_PATH')
  assert.equal(code(() => normalizePath('Login')), 'PATH_RESERVED')
  assert.equal(code(() => normalizePath('logout')), 'PATH_RESERVED')
  assert.equal(entitySetOf('Orders(5)/Cancel'), 'Orders')
  assert.equal(entitySetOf('$batch'), null)
  assert.equal(entitySetOf('$1/Cancel'), null)
})

// ---- the batch builder ----

const ids = () => {
  let n = 0
  return () => ['b', 'c'][n++ % 2]
}

const SPEC = {
  requests: [
    { method: 'GET', path: "Items('i001')" },
    {
      changeset: [
        { method: 'POST', path: 'Items', contentId: '1', body: { ItemCode: 'i002' } },
        { method: 'PATCH', path: '$1', contentId: '2', body: { ItemName: 'x' }, headers: { 'B1S-ReplaceCollectionsOnPatch': 'true' } },
      ],
    },
  ],
}

test('batch builder: the multipart/mixed body of the docs sample (batch + changeset, Content-ID, $1 reference)', () => {
  const built = buildBatchBody(parseBatchSpec(SPEC), 'v2', ids())
  assert.equal(built.contentType, 'multipart/mixed;boundary=batch_b')
  const expected = [
    '--batch_b',
    'Content-Type: application/http',
    'Content-Transfer-Encoding: binary',
    '',
    "GET /b1s/v2/Items('i001')",
    '',
    '',
    '--batch_b',
    'Content-Type: multipart/mixed;boundary=changeset_c',
    '',
    '--changeset_c',
    'Content-Type: application/http',
    'Content-Transfer-Encoding: binary',
    'Content-ID: 1',
    '',
    'POST /b1s/v2/Items',
    'Content-Type: application/json',
    '',
    '{"ItemCode":"i002"}',
    '--changeset_c',
    'Content-Type: application/http',
    'Content-Transfer-Encoding: binary',
    'Content-ID: 2',
    '',
    'PATCH /b1s/v2/$1',
    'B1S-ReplaceCollectionsOnPatch: true',
    'Content-Type: application/json',
    '',
    '{"ItemName":"x"}',
    '--changeset_c--',
    '--batch_b--',
    '',
  ].join('\r\n')
  assert.equal(built.body, expected)
})

test('batch builder: Content-ID is assigned in a changeset when missing, and the file is validated', () => {
  const batch = parseBatchSpec({ requests: [{ method: 'GET', path: 'A', contentId: '1' }, { changeset: [{ method: 'POST', path: 'B' }, { method: 'POST', path: 'C', contentId: 'x' }, { method: 'PATCH', path: '$2' }] }] })
  const set = batch.items[1]
  assert.equal(set.kind, 'changeset')
  assert.deepEqual(set.kind === 'changeset' && set.requests.map((r) => r.contentId), ['2', 'x', '3'], '1 is taken: the next free numbers')
  const bad = (spec: unknown) => code(() => parseBatchSpec(spec))
  assert.equal(bad({}), 'BATCH_INVALID')
  assert.equal(bad({ requests: [] }), 'BATCH_INVALID')
  assert.equal(bad({ requests: [{ changeset: [{ method: 'GET', path: 'A' }] }] }), 'BATCH_INVALID', 'no GET in a changeset')
  assert.equal(bad({ requests: [{ method: 'FETCH', path: 'A' }] }), 'INVALID_METHOD')
  assert.equal(bad({ requests: [{ method: 'GET', path: '$batch' }] }), 'BATCH_INVALID')
  assert.equal(bad({ requests: [{ method: 'GET', path: 'A', body: {} }] }), 'BATCH_INVALID')
  assert.equal(bad({ requests: [{ method: 'GET', path: 'A', extra: 1 }] }), 'BATCH_INVALID')
  assert.equal(bad({ requests: [{ method: 'GET', path: 'A', contentId: '1' }, { method: 'GET', path: 'B', contentId: '1' }] }), 'BATCH_INVALID', 'duplicate Content-ID')
  assert.equal(bad({ requests: [{ changeset: [{ method: 'PATCH', path: '$9' }] }] }), 'BATCH_INVALID', 'reference to nothing')
  assert.equal(bad({ requests: [{ method: 'PATCH', path: '$1' }] }), 'BATCH_INVALID', 'reference outside a changeset')
  assert.equal(bad({ requests: [{ method: 'GET', path: 'A', headers: { Cookie: 'x' } }] }), 'HEADER_RESERVED', 'sub-requests follow the same header rules')
  assert.equal(bad({ requests: [{ method: 'GET', path: 'A', headers: { X: 'a\r\nB: c' } }] }), 'HEADER_INVALID')
})

// ---- the batch answer ----

const RESPONSE = [
  '--batchresponse_d8',
  'Content-Type:application/http',
  'Content-Transfer-Encoding:binary',
  '',
  'HTTP/1.1 200 OK',
  'Content-Type:application/json;odata=minimalmetadata;charset=utf-8',
  'Content-Length:14',
  '',
  '{"ItemCode":"i001"}',
  '--batchresponse_d8',
  'Content-Type:multipart/mixed;boundary=changesetresponse_8b',
  '',
  '--changesetresponse_8b',
  'Content-Type:application/http',
  'Content-Transfer-Encoding:binary',
  'Content-ID:1',
  '',
  'HTTP/1.1 201 Created',
  'Content-Type:application/json',
  "Location:https://h/b1s/v2/Items('i002')",
  '',
  '{"ItemCode":"i002"}',
  '--changesetresponse_8b',
  'Content-Type:application/http',
  'Content-Transfer-Encoding:binary',
  'Content-ID:2',
  '',
  'HTTP/1.1 204 No Content',
  '',
  '',
  '--changesetresponse_8b--',
  '--batchresponse_d8--',
  '',
]

for (const [label, eol] of [['CRLF', '\r\n'], ['LF', '\n']] as const) {
  test(`batch answer (${label}): parsed into top-level answers and the answers of the changeset, named by Content-ID`, () => {
    const parsed = parseBatchResponse(RESPONSE.join(eol), 'multipart/mixed;boundary=batchresponse_d8')
    assert.equal(parsed.length, 2)
    assert.equal(parsed[0].kind, 'response')
    assert.equal(parsed[1].kind, 'changeset')
    const set = parsed[1].kind === 'changeset' ? parsed[1].responses : []
    assert.deepEqual(set.map((r) => [r.contentId, r.status]), [['1', 201], ['2', 204]])
    assert.equal(set[0].headers['location'], "https://h/b1s/v2/Items('i002')")
    assert.equal(JSON.parse(set[0].body).ItemCode, 'i002')
    const named = nameResponses(parsed, parseBatchSpec(SPEC).items)
    assert.deepEqual(named.map((n) => [n.id, n.response.status]), [['part-1', 200], ['1', 201], ['2', 204]])
  })
}

test('batch answer: not multipart or cut short is SL_BAD_RESPONSE; a failed changeset answers once and is named changeset-N', () => {
  assert.equal(code(() => parseBatchResponse('{}', 'application/json')), 'SL_BAD_RESPONSE')
  assert.equal(code(() => parseBatchResponse('--b\r\n\r\nHTTP/1.1 200 OK\r\n\r\n', 'multipart/mixed;boundary=b')), 'SL_BAD_RESPONSE')
  const failed = ['--r', 'Content-Type:application/http', '', 'HTTP/1.1 400 Bad Request', 'Content-Type:application/json', '', '{"error":{"code":-10,"message":{"value":"dup"}}}', '--r--', ''].join('\r\n')
  const parsed = parseBatchResponse(failed, 'multipart/mixed;boundary=r')
  const named = nameResponses(parsed, parseBatchSpec({ requests: [{ changeset: [{ method: 'POST', path: 'A' }, { method: 'POST', path: 'B' }] }] }).items)
  assert.deepEqual(named.map((n) => [n.id, n.response.status]), [['changeset-1', 400]])
})

// ---- file upload body ----

test('form-data builder: one `files` field per file, bytes intact', () => {
  const bytes = Buffer.from([0, 255, 13, 10, 45, 45, 1])
  const { body, contentType } = buildFormData([{ name: 'a.txt', type: 'text/plain', bytes: Buffer.from('hi') }, { name: 'p.png', type: 'image/png', bytes }], 'B')
  assert.equal(contentType, 'multipart/form-data; boundary=B')
  const text = body.toString('latin1')
  assert.ok(text.startsWith('--B\r\nContent-Disposition: form-data; name="files"; filename="a.txt"\r\nContent-Type: text/plain\r\n\r\nhi\r\n--B\r\n'))
  assert.ok(text.endsWith('\r\n--B--\r\n'))
  assert.ok(body.includes(Buffer.concat([Buffer.from('Content-Type: image/png\r\n\r\n'), bytes, Buffer.from('\r\n--B--')])))
})

// ---- the flow, with an injected transport ----

interface Fake {
  transport: Transport
  /** Everything sent besides the session itself and what the Índice de entidades reads (`$metadata`, `UserTablesMD`, `UserObjectsMD`). */
  seen: HttpRequest[]
}

function answer(status: number, body: string | Buffer, headers: Record<string, string> = {}): HttpResponse {
  const bytes = Buffer.from(body)
  return { status, headers: new Headers(headers), bytes, text: bytes.toString('utf8') }
}

function fake(handler: (r: HttpRequest) => HttpResponse): Fake {
  const seen: HttpRequest[] = []
  const transport: Transport = async (r) => {
    if (r.url.endsWith('/Login')) {
      const res = answer(200, JSON.stringify({ SessionId: 'sess', Version: '1' }))
      res.headers.append('set-cookie', 'ROUTEID=.node1; path=/')
      return res
    }
    if (r.url.endsWith('/$metadata')) return answer(200, '<edmx/>')
    if (/\/User(Tables|Objects)MD\?/.test(r.url)) return answer(200, '{"value":[]}', { 'content-type': 'application/json' })
    seen.push(r)
    return handler(r)
  }
  return { transport, seen }
}

async function repo(environments: string[] = ['dev']) {
  const root = await mkdtemp(join(tmpdir(), 'sbo-'))
  const creds = { url: 'https://sl.test:50000', companyDB: 'DB', userName: 'u', password: 'secret-pw' }
  await writeSetup({ root, versionB1: 'FP 2608', versionOData: 'v2', environments: Object.fromEntries(environments.map((e) => [e, creds])) })
  return root
}

const json = (v: unknown) => answer(200, JSON.stringify(v), { 'content-type': 'application/json;odata.metadata=minimal' })

test('read or write: a GET runs; any other method is a dry run until --execute; --read lets a POST run', async () => {
  const root = await repo()
  const f = fake(() => json({ value: [{ CardCode: 'A' }] }))
  const run = (argv: string[]) => main(['request', ...argv], root, { transport: f.transport })

  const get = await run(['GET', 'BusinessPartners'])
  assert.equal(get.ok, true, JSON.stringify(get))
  assert.equal(f.seen.length, 1)

  for (const method of ['POST', 'PATCH', 'PUT', 'DELETE']) {
    const out = await run([method, "BusinessPartners('A')/Something"])
    assert.equal(out.resumen!.ejecutado, false, method)
    assert.equal(out.status, null)
  }
  assert.equal(f.seen.length, 1, 'no write was sent')

  const post = await run(['POST', "SQLQueries('q')/List", '--read'])
  assert.equal(post.resumen!.ejecutado, true)
  assert.equal(post.resumen!.tipo, 'coleccion')
  assert.deepEqual(f.seen.map((r) => r.method), ['GET', 'POST'])

  for (const method of ['PATCH', 'PUT', 'DELETE']) assert.equal((await run([method, 'X(1)', '--read'])).error!.code, 'READ_NOT_ALLOWED', method)
  assert.equal((await run(['GET', 'X', '--body', '{}'])).error!.code, 'INVALID_ARGUMENTS', 'a GET takes no body')
  assert.equal((await run(['FETCH', 'X'])).error!.code, 'INVALID_METHOD')
  assert.equal((await run(['post', 'Orders(1)/Cancel', '--execute'])).resumen!.ejecutado, true, 'method is case-insensitive; --execute sends')
})

test('dry run: shows method, full URL, headers and body, never the session cookie or the password; sends nothing', async () => {
  const root = await repo()
  const f = fake(() => json({}))
  const out = await main(['request', 'PATCH', "BusinessPartners('A')", '--body', '{"CardName":"x"}', '--header', 'B1S-ReplaceCollectionsOnPatch: true', '--header', 'If-Match: W/"1"'], root, { transport: f.transport })
  assert.deepEqual(out.resumen!.peticion, {
    metodo: 'PATCH',
    url: "https://sl.test:50000/b1s/v2/BusinessPartners('A')",
    cabeceras: { 'B1S-ReplaceCollectionsOnPatch': 'true', 'If-Match': 'W/"1"', 'Content-Type': 'application/json' },
    cuerpo: { CardName: 'x' },
  })
  assert.equal(f.seen.length, 0)
  assert.ok(!/sess|ROUTEID|secret-pw/.test(JSON.stringify(out)))
  const sent = await main(['request', 'PATCH', "BusinessPartners('A')", '--body', '{"CardName":"x"}', '--header', 'If-Match: W/"1"', '--execute'], root, { transport: f.transport })
  assert.equal(sent.ok, true)
  assert.equal(f.seen[0].headers['If-Match'], 'W/"1"')
  assert.equal(f.seen[0].headers['Cookie'], 'B1SESSION=sess; ROUTEID=.node1')
  assert.ok(!JSON.stringify(sent).includes('sess'))
  assert.equal((await main(['request', 'GET', 'X', '--header', 'Cookie: a=b'], root, { transport: f.transport })).error!.code, 'HEADER_RESERVED')
  assert.equal(f.seen.length, 1)
})

test('prod: --execute needs --allow-prod for a write; a read and a batch of GETs do not', async () => {
  const root = await repo(['prod'])
  const f = fake(() => json({ value: [] }))
  const run = (argv: string[]) => main(['request', ...argv], root, { transport: f.transport })
  const dir = await mkdtemp(join(tmpdir(), 'b-'))
  const reads = join(dir, 'reads.json')
  const writes = join(dir, 'writes.json')
  await writeFile(reads, JSON.stringify({ requests: [{ method: 'GET', path: 'Items' }] }))
  await writeFile(writes, JSON.stringify({ requests: [{ method: 'GET', path: 'Items' }, { changeset: [{ method: 'POST', path: 'Items', body: {} }] }] }))

  assert.equal((await run(['POST', 'Orders(1)/Close', '--execute'])).error!.code, 'PROD_WRITE_NOT_ALLOWED')
  assert.equal((await run(['POST', '$batch', '--body-file', writes, '--execute'])).error!.code, 'PROD_WRITE_NOT_ALLOWED')
  assert.equal(f.seen.length, 0)
  assert.match((await run(['POST', 'Orders(1)/Close'])).resumen!.paraEjecutar as string, /production/, 'the dry run on prod needs no mark')
  assert.equal((await run(['GET', 'Items'])).ok, true)
  assert.equal((await run(['POST', "SQLQueries('q')/List", '--read'])).ok, true)
  assert.equal((await run(['POST', '$batch', '--body-file', reads, '--read'])).resumen!.ejecutado, true)
  assert.equal((await run(['POST', 'Orders(1)/Close', '--execute', '--allow-prod'])).resumen!.ejecutado, true)
})

test('batch: --read only for a batch of GETs; without it a batch is a dry run listing every sub-request', async () => {
  const root = await repo()
  const dir = await mkdtemp(join(tmpdir(), 'b-'))
  const file = join(dir, 'b.json')
  await writeFile(file, JSON.stringify(SPEC))
  const f = fake(() => answer(200, ''))
  const run = (argv: string[]) => main(['request', ...argv], root, { transport: f.transport })

  assert.equal((await run(['POST', '$batch', '--body-file', file, '--read'])).error!.code, 'READ_NOT_ALLOWED')
  assert.equal((await run(['GET', '$batch', '--body-file', file])).error!.code, 'INVALID_ARGUMENTS')
  assert.equal((await run(['POST', '$batch'])).error!.code, 'INVALID_ARGUMENTS', 'needs its description')
  assert.equal((await run(['POST', '$batch', '--body-file', file, '--header', 'Content-Type: multipart/mixed'])).error!.code, 'HEADER_CONFLICT')

  const dry = await run(['POST', '$batch', '--body-file', file])
  assert.equal(dry.resumen!.ejecutado, false)
  const peticion = dry.resumen!.peticion as { lote: { grupo: string | null; contentId?: string; metodo: string; url: string; cabeceras: object; cuerpo: unknown }[]; cabeceras: Record<string, string> }
  assert.equal(peticion.cabeceras['Content-Type'], 'multipart/mixed;boundary=<generated>')
  assert.deepEqual(peticion.lote.map((r) => [r.grupo, r.contentId, r.metodo, r.url]), [
    [null, undefined, 'GET', "/b1s/v2/Items('i001')"],
    ['changeset 1', '1', 'POST', '/b1s/v2/Items'],
    ['changeset 1', '2', 'PATCH', '/b1s/v2/$1'],
  ])
  assert.deepEqual(peticion.lote[2].cabeceras, { 'B1S-ReplaceCollectionsOnPatch': 'true', 'Content-Type': 'application/json' })
  assert.equal(f.seen.length, 0)
})

test('batch executed: one Volcado file per sub-response named with its Content-ID, each status and the literal SL error in resumen', async () => {
  const root = await repo()
  const dir = await mkdtemp(join(tmpdir(), 'b-'))
  const file = join(dir, 'b.json')
  await writeFile(file, JSON.stringify(SPEC))
  const f = fake((r) => {
    assert.ok(Buffer.from(r.body as string).toString().includes('PATCH /b1s/v2/$1'))
    return answer(200, RESPONSE.join('\r\n'), { 'content-type': 'multipart/mixed;boundary=batchresponse_d8' })
  })
  const out = await main(['request', 'POST', '$batch', '--body-file', file, '--execute'], root, { transport: f.transport })
  assert.equal(out.ok, true, JSON.stringify(out))
  assert.equal(out.status, 200)
  assert.equal(out.resumen!.tipo, 'lote')
  assert.deepEqual(out.resumen!.claves, ['part-1', '1', '2'])
  assert.deepEqual(out.resumen!.subrespuestas, [{ id: 'part-1', estado: 200 }, { id: '1', estado: 201 }, { id: '2', estado: 204 }])
  const created = JSON.parse(await readFile(join(out.resumen!.ruta as string, 'batch', '1.json'), 'utf8'))
  assert.equal(created.status, 201)
  assert.equal(created.body.ItemCode, 'i002')

  const failing = fake(() => answer(200, ['--r', 'Content-Type:application/http', '', 'HTTP/1.1 400 Bad Request', 'Content-Type:application/json', '', '{"error":{"code":-10,"message":{"lang":"en-us","value":"dup"}}}', '--r--', ''].join('\r\n'), { 'content-type': 'multipart/mixed;boundary=r' }))
  const bad = await main(['request', 'POST', '$batch', '--body-file', file, '--execute'], root, { transport: failing.transport })
  assert.equal(bad.resumen!.errores, 1)
  assert.deepEqual((bad.resumen!.subrespuestas as { error?: unknown }[])[0].error, { code: -10, message: 'dup' })
  assert.match(bad.resumen!.aviso as string, /stops at the first failure/)
})

test('responses: an object goes to one file, an empty answer to none, a collection to one file per record with nextLink', async () => {
  const root = await repo()
  let reply: HttpResponse = answer(204, '')
  const f = fake(() => reply)
  const run = (argv: string[]) => main(['request', ...argv], root, { transport: f.transport })

  reply = answer(201, JSON.stringify({ CardCode: 'Z1', CardName: 'x' }), { 'content-type': 'application/json', etag: 'W/"9"', location: "x/BusinessPartners('Z1')", 'set-cookie': 'B1SESSION=leak' })
  const created = await run(['POST', 'BusinessPartners', '--body', '{}', '--execute'])
  assert.equal(created.status, 201)
  assert.equal(created.resumen!.tipo, 'objeto')
  assert.deepEqual(created.resumen!.claves, ['Z1'])
  assert.equal(JSON.parse(await readFile(created.resumen!.archivo as string, 'utf8')).CardName, 'x')
  assert.deepEqual(created.resumen!.cabecerasRespuesta, { etag: 'W/"9"', location: "x/BusinessPartners('Z1')", 'content-type': 'application/json' }, 'no Set-Cookie')
  assert.ok(!JSON.stringify(created).includes('CardName'), 'the record is not in the output')

  reply = answer(204, '')
  const empty = await run(['PATCH', "BusinessPartners('Z1')", '--body', '{}', '--execute'])
  assert.equal(empty.status, 204)
  assert.equal(empty.resumen!.tipo, 'vacio')
  assert.equal(empty.resumen!.ruta, undefined)

  reply = answer(200, JSON.stringify({ '@odata.nextLink': 'Items?$skip=2', value: [{ ItemCode: 'a' }, { ItemCode: 'b' }] }), { 'content-type': 'application/json' })
  const many = await run(['GET', 'Items'])
  assert.equal(many.resumen!.filas, 2)
  assert.deepEqual(many.resumen!.claves, ['a', 'b'])
  assert.equal(many.resumen!.siguiente, 'Items?$skip=2')

  reply = answer(200, '337', { 'content-type': 'text/plain' })
  const text = await run(['GET', 'Items/$count'])
  assert.equal(text.resumen!.tipo, 'texto')
  assert.equal(await readFile(text.resumen!.archivo as string, 'utf8'), '337')
})

test('binary download: the bytes go to a file in the Volcado, the output has its path, name and size and no bytes', async () => {
  const root = await repo()
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 255, 254, 253])
  let headers: Record<string, string> = { 'content-type': 'image/png' }
  const f = fake(() => answer(200, png, headers))
  const run = (path: string) => main(['request', 'GET', path], root, { transport: f.transport })

  const byPath = await run("ItemImages('A1')/$value")
  assert.equal(byPath.ok, true, JSON.stringify(byPath))
  assert.equal(byPath.resumen!.tipo, 'binario')
  assert.equal(byPath.resumen!.bytes, png.length)
  assert.deepEqual(await readFile(byPath.resumen!.archivo as string), png)
  assert.ok((byPath.resumen!.archivo as string).startsWith(byPath.resumen!.ruta as string))
  const index = JSON.parse(await readFile(join(byPath.resumen!.ruta as string, '_index.json'), 'utf8'))
  assert.equal(index.files[0].bytes, png.length)
  assert.equal(index.files[0].contentType, 'image/png')
  assert.match(index.files[0].name, /^ItemImages.*A1.*\.png$/)

  const byQuery = await run("Attachments2(3)/$value?filename='line2.png'")
  assert.equal(byQuery.resumen!.nombre, 'line2.png')

  headers = { 'content-type': 'application/pdf', 'content-disposition': 'attachment; filename="..\\..\\evil:name.pdf"' }
  const disposed = await run('Attachments2(3)/$value')
  assert.equal(disposed.resumen!.nombre, 'evil_name.pdf', 'no path, no characters Windows refuses')
  assert.ok((disposed.resumen!.archivo as string).includes('Attachments2'))
  assert.ok(!JSON.stringify(disposed).includes('PNG'))
})

test('a response over the size limit is refused before it is read (RESPONSE_TOO_LARGE)', async () => {
  const server = createServer((_, res) => {
    res.writeHead(200, { 'content-type': 'application/octet-stream', 'content-length': String(MAX_RESPONSE_BYTES + 1) })
    res.flushHeaders()
    setTimeout(() => res.destroy(), 200)
  })
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r))
  try {
    const { port } = server.address() as { port: number }
    await assert.rejects(defaultTransport({ method: 'GET', url: `http://127.0.0.1:${port}/x`, headers: {} }), (e: { code?: string }) => e.code === 'RESPONSE_TOO_LARGE')
  } finally {
    server.close()
  }
})

test('attachment upload: the dry run shows name, size and type but not the bytes; --execute sends multipart/form-data with the bytes intact', async () => {
  const root = await repo()
  const bytes = Buffer.from([0, 1, 2, 255, 254, 13, 10])
  await writeFile(join(root, 'a.txt'), 'hello')
  await writeFile(join(root, 'p.png'), bytes)
  const f = fake(() => answer(201, JSON.stringify({ AbsoluteEntry: 7 }), { 'content-type': 'application/json' }))
  const run = (argv: string[]) => main(['request', 'POST', 'Attachments2', ...argv], root, { transport: f.transport })

  const dry = await run(['--file', 'a.txt', '--file', 'p.png'])
  assert.equal(dry.resumen!.ejecutado, false)
  const peticion = dry.resumen!.peticion as { cabeceras: Record<string, string>; cuerpo: { archivos: object[] } }
  assert.deepEqual(peticion.cuerpo.archivos, [
    { campo: 'files', nombre: 'a.txt', bytes: 5, tipo: 'text/plain' },
    { campo: 'files', nombre: 'p.png', bytes: 7, tipo: 'image/png' },
  ])
  assert.equal(peticion.cabeceras['Content-Type'], 'multipart/form-data; boundary=<generated>')
  assert.equal(f.seen.length, 0)

  const sent = await run(['--file', 'a.txt', '--file', 'p.png', '--execute'])
  assert.equal(sent.status, 201)
  assert.deepEqual(sent.resumen!.claves, ['7'])
  const req = f.seen[0]
  assert.match(req.headers['Content-Type'], /^multipart\/form-data; boundary=/)
  const body = Buffer.from(req.body as Uint8Array)
  assert.ok(body.includes(Buffer.from('name="files"; filename="a.txt"')))
  assert.ok(body.includes(Buffer.concat([Buffer.from('Content-Type: image/png\r\n\r\n'), bytes, Buffer.from('\r\n--')])))
})

test('attachment upload: --stream-file sends the raw bytes with Content-Type and Slug; limits and conflicts are errors', async () => {
  const root = await repo()
  const bytes = Buffer.from([1, 2, 3, 250])
  await writeFile(join(root, 'SAP.jpg'), bytes)
  const f = fake(() => answer(201, JSON.stringify({ AbsoluteEntry: 8 }), { 'content-type': 'application/json' }))
  const run = (argv: string[]) => main(['request', 'POST', 'Attachments2', ...argv], root, { transport: f.transport })

  const dry = await run(['--stream-file', 'SAP.jpg'])
  assert.deepEqual((dry.resumen!.peticion as { cabeceras: object }).cabeceras, { 'Content-Type': 'image/jpeg', Slug: 'SAP.jpg' })
  await run(['--stream-file', 'SAP.jpg', '--execute'])
  assert.deepEqual(Buffer.from(f.seen[0].body as Uint8Array), bytes)
  assert.equal(f.seen[0].headers['Slug'], 'SAP.jpg')

  await writeFile(join(root, 'big.bin'), Buffer.alloc(50 * 1024 * 1024))
  assert.equal((await run(['--file', 'big.bin', '--execute'])).error!.code, 'FILE_TOO_LARGE')
  assert.equal((await run(['--file', 'missing.txt'])).error!.code, 'FILE_NOT_FOUND')
  assert.equal((await run(['--file', 'SAP.jpg', '--header', 'Content-Type: image/jpeg'])).error!.code, 'HEADER_CONFLICT')
  assert.equal((await run(['--file', 'SAP.jpg', '--read'])).error!.code, 'READ_NOT_ALLOWED')
  assert.equal((await run(['--file', 'SAP.jpg', '--body', '{}'])).error!.code, 'INVALID_ARGUMENTS')
  assert.equal((await run(['--stream-file', credentialsPath(root, 'dev')])).error!.code, 'FILE_FORBIDDEN', 'the Setup files are never sent')
  assert.equal((await run(['--body-file', credentialsPath(root, 'dev')])).error!.code, 'FILE_FORBIDDEN')
  assert.equal(f.seen.length, 1, 'only the one execute above reached the transport')
  await mkdir(join(root, 'dir'))
  assert.equal((await run(['--file', 'dir'])).error!.code, 'FILE_NOT_FOUND')
})

test('batch answer: a binary sub-response keeps its bytes in a file, a JSON one keeps its accents', async () => {
  const root = await repo()
  const dir = await mkdtemp(join(tmpdir(), 'b-'))
  const file = join(dir, 'b.json')
  await writeFile(file, JSON.stringify({ requests: [{ method: 'GET', path: "ItemImages('A1')/$value", contentId: 'img' }, { method: 'GET', path: "Items('A1')", contentId: 'item' }] }))
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0xff, 0xfe, 0xc3, 0x28, 0x2d, 0x2d])
  const part = (id: string, type: string, body: Buffer) =>
    Buffer.concat([Buffer.from(`--r\r\nContent-Type: application/http\r\nContent-ID: ${id}\r\n\r\nHTTP/1.1 200 OK\r\nContent-Type: ${type}\r\n\r\n`), body, Buffer.from('\r\n')])
  const reply = Buffer.concat([part('img', 'image/png', png), part('item', 'application/json', Buffer.from('{"ItemName":"Niño ñandú €"}')), Buffer.from('--r--\r\n')])
  const f = fake(() => answer(200, reply, { 'content-type': 'multipart/mixed;boundary=r' }))
  const out = await main(['request', 'POST', '$batch', '--body-file', file, '--read'], root, { transport: f.transport })
  assert.equal(out.ok, true, JSON.stringify(out))
  assert.equal(out.resumen!.tipo, 'lote')
  const sub = (await readdir(out.resumen!.ruta as string)).find((n) => !n.startsWith('_'))!
  const folder = join(out.resumen!.ruta as string, sub)
  const names = await readdir(folder)
  const saved = names.find((n) => n.startsWith('img.') && !n.endsWith('.json'))
  assert.ok(saved, names.join(','))
  assert.ok((await readFile(join(folder, saved!))).equals(png), 'the bytes are intact')
  const img = JSON.parse(await readFile(join(folder, 'img.json'), 'utf8'))
  assert.equal(img.body.archivo, saved)
  assert.equal(JSON.parse(await readFile(join(folder, 'item.json'), 'utf8')).body.ItemName, 'Niño ñandú €')
})
