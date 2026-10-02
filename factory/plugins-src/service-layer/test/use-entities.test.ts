import { before, test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { writeSetup } from '../src/setup/setup.ts'
import { contextPath, standardIndexPath, userIndexPath } from '../src/common/layout.ts'
import { readHeader } from '../src/use/metadata.ts'
import { renderEntityIndex } from '../src/use/entity-index.ts'
import { main } from '../src/use/command.ts'
import { CONTEXT_MAX_AGE_MS } from '../src/use/object-context.ts'
import { defaultTransport, type HttpRequest, type HttpResponse, type Transport } from '../src/common/sl.ts'
import { ensureUserObject, ensureUserTable, live, plantIndex, realCredentials, recordingOk as recording } from './sl-env.ts'

const good = realCredentials()
const DAY = 24 * 3_600_000

async function repo(versionOData: 'v1' | 'v2') {
  const root = await mkdtemp(join(tmpdir(), 'sbo-'))
  await writeSetup({ root, versionB1: 'FP 2608', versionOData, environments: { dev: good } })
  return root
}

const metadataCalls = (seen: HttpRequest[]) => seen.filter((r) => r.url.endsWith('/$metadata')).length

// A user table without an object and a user object with a child table, in the demo company (disposable; the other tests make them too).
before(async () => {
  await ensureUserTable('SBOCTXT', 'bott_NoObject', [{ Name: 'F1' }, { Name: 'F2', Mandatory: 'tYES' }])
  await ensureUserTable('SBOUDT', 'bott_MasterData', [{ Name: 'F1', Mandatory: 'tYES' }])
  await ensureUserTable('SBOUDTL', 'bott_MasterDataLines', [{ Name: 'L1' }])
  await ensureUserObject('SBOUDT', 'boud_MasterData', ['SBOUDTL'])
})

// --- no server: what the Índice de entidades says ------------------------------------------------------------------

const xml = (v: 'v1' | 'v2') => `<Schema>
  <EntityType Name="BusinessPartner"><Key><PropertyRef Name="CardCode"/></Key><Property Name="CardCode" Type="Edm.String"/></EntityType>
  <ComplexType Name="BPAddress"><Property Name="AddressName" Type="Edm.String"/></ComplexType>
  <EntityContainer Name="SAPB1">
    <EntitySet EntityType="SAPB1.Order" Name="Orders"/>
    <EntitySet EntityType="SAPB1.BusinessPartner" Name="BusinessPartners"/>
    <EntitySet EntityType="SAPB1.Item" Name="Items"/>
    <EntitySet EntityType="SAPB1.U_MYTABLE" Name="U_MYTABLE"/>
    <EntitySet EntityType="SAPB1.MYUDO" Name="MYUDO"/>
    ${v === 'v2' ? '<ActionImport Action="SAPB1.Cancel" Name="Cancel"/><FunctionImport Function="SAPB1.Ping" Name="Ping"/>' : '<FunctionImport Name="Cancel"/>'}
  </EntityContainer>
</Schema>`

const header = { odataVersion: 'v2' as const, versionB1: 'FP 2608', fetchedAt: new Date('2026-10-02T10:00:00Z') }
const tables = [
  { TableName: 'MYTABLE', TableDescription: 'My table', TableType: 'bott_NoObject' },
  { TableName: 'MYUDO', TableDescription: 'Table of the object', TableType: 'bott_MasterData' },
  { TableName: 'MYUDOL', TableDescription: 'Lines of the object', TableType: 'bott_MasterDataLines' },
]
const objects = [{ Code: 'MYUDO', Name: 'My object', TableName: 'MYUDO' }]

for (const v of ['v1', 'v2'] as const) {
  test(`${v}: the standard list has only entity set names, sorted, on one line; no actions, functions, user tables or objects`, () => {
    const { standard } = renderEntityIndex({ ...header, xml: xml(v), userTables: tables, userObjects: objects })
    assert.match(standard, /^# Standard SAP entities/)
    assert.deepEqual(readHeader(standard), { fetchedAt: header.fetchedAt, odataVersion: 'v2' })
    assert.equal(standard.trimEnd().split('\n').at(-1), 'BusinessPartners, Items, Orders')
    for (const gone of ['Cancel', 'Ping', 'U_MYTABLE', 'MYUDO']) assert.ok(!standard.includes(gone), `${gone} must not be in the standard list`)
  })
}

test('the user list marks tables and objects, one line each, with the description of the table', () => {
  const { user } = renderEntityIndex({ ...header, xml: xml('v2'), userTables: tables, userObjects: objects })
  assert.match(user, /^# User-defined entities/)
  assert.deepEqual(readHeader(user), { fetchedAt: header.fetchedAt, odataVersion: 'v2' })
  const entries = user.split('\n').filter((l) => l.startsWith('- U_') || l.startsWith('- MYUDO'))
  assert.deepEqual(entries, ['- MYUDO — user object — My object', '- U_MYTABLE — user table — My table'])
  assert.ok(!user.includes('MYUDOL'), 'the lines table of an object is not an entity')
})

test('when UserTablesMD or UserObjectsMD cannot be read, the user list gives names without a description', () => {
  const noTables = renderEntityIndex({ ...header, xml: xml('v2'), userTables: null, userObjects: objects }).user
  assert.match(noTables, /^- U_MYTABLE — user table$/m)
  assert.match(noTables, /^- MYUDO — user object — My object$/m)
  const noObjects = renderEntityIndex({ ...header, xml: xml('v2'), userTables: tables, userObjects: null })
  assert.match(noObjects.user, /^- U_MYTABLE — user table — My table$/m)
  assert.ok(!/^- MYUDO/m.test(noObjects.user))
  assert.match(noObjects.user, /UserObjectsMD could not be read/)
  // Without the objects an object cannot be told from a standard entity: it stays in the standard list.
  assert.ok(noObjects.standard.includes('MYUDO'))
})

// --- the real Service Layer ----------------------------------------------------------------------------------------

for (const version of ['v1', 'v2'] as const) {
  test(`${version}: entities writes the two files from the real $metadata and UserTablesMD / UserObjectsMD; a recent index is left alone`, async () => {
    const root = await repo(version)
    const seen: HttpRequest[] = []
    const transport = recording(seen)
    const first = await live(root, () => main(['entities'], root, { transport }))
    assert.equal(first.ok, true, JSON.stringify(first))
    assert.equal(first.resumen!.regenerado, true)
    assert.equal(first.resumen!.estandar, standardIndexPath(root, 'dev'))
    assert.equal(first.resumen!.usuario, userIndexPath(root, 'dev'))
    assert.equal(metadataCalls(seen), 1)

    const standard = await readFile(standardIndexPath(root, 'dev'), 'utf8')
    assert.deepEqual(readHeader(standard)?.odataVersion, version)
    const names = standard.trimEnd().split('\n').at(-1)!.split(', ')
    assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b, 'en')))
    for (const wanted of ['BusinessPartners', 'Orders', 'Items']) assert.ok(names.includes(wanted), wanted)
    for (const user of ['U_SBOCTXT', 'SBOUDT']) assert.ok(!names.includes(user), `${user} is not a standard entity`)
    assert.equal((first.resumen!.entidades as { estandar: number }).estandar, names.length)
    assert.ok(names.length > 300 && names.length < 700, `${names.length} standard entity sets`)
    assert.ok(standard.length < 25_000, `the standard index is ${standard.length} characters`)

    const user = await readFile(userIndexPath(root, 'dev'), 'utf8')
    assert.match(user, /^- U_SBOCTXT — user table — SBOCTXT test table$/m)
    assert.match(user, /^- SBOUDT — user object — SBOUDT$/m)
    assert.ok(!/^- U_SBOUDT/m.test(user) && !user.includes('SBOUDTL'), 'a table with an object, and its lines table, are not entities of their own')
    assert.equal((first.resumen!.entidades as { usuario: number }).usuario, user.split('\n').filter((l) => / — user (table|object)/.test(l)).length)
    assert.ok((first.resumen!.entidades as { usuario: number }).usuario >= 2)

    const second = await live(root, () => main(['entities'], root, { transport }))
    assert.equal(second.resumen!.regenerado, false)
    assert.equal(metadataCalls(seen), 1)
    const forced = await live(root, () => main(['entities', '--refresh'], root, { transport }))
    assert.equal(forced.resumen!.regenerado, true)
    assert.equal(metadataCalls(seen), 2)
  })
}

/** The ficha fixture of BusinessPartners, dated `fetchedAt`, planted where the Uso keeps it. */
async function plantFicha(root: string, fetchedAt: Date) {
  const fixture = await readFile(new URL('./fixtures/context/BusinessPartners.v2.md', import.meta.url), 'utf8')
  const file = contextPath(root, 'dev', 'BusinessPartners')
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, fixture.replace(/^- Fetched: \S+/m, `- Fetched: ${fetchedAt.toISOString()}`).replace(/^- OData version: v[12]/m, '- OData version: v2'))
}

const header2 = async (root: string) => readHeader(await readFile(standardIndexPath(root, 'dev'), 'utf8'))!

test('any operation makes the index when it is missing, and shares the $metadata download with the ficha', async () => {
  const root = await repo('v2')
  const seen: HttpRequest[] = []
  const out = await live(root, () => main(['count', 'BusinessPartners'], root, { transport: recording(seen) }))
  assert.equal(out.ok, true, JSON.stringify(out))
  assert.equal(out.resumen!.contextoRegenerado, true)
  assert.equal(out.resumen!.indiceError, undefined)
  assert.equal(metadataCalls(seen), 1, 'the index and the ficha come from one download')
  assert.ok((await readFile(standardIndexPath(root, 'dev'), 'utf8')).includes('BusinessPartners'))
  // Records and index are different things: the output carries no entity names beyond the one asked for.
  assert.ok(!JSON.stringify(out).includes('PurchaseOrders'))
})

test('the index is renewed on its own after a week, whatever the command and whatever the ficha says; the clock is injected', async () => {
  const root = await repo('v2')
  const now = new Date()
  const seen: HttpRequest[] = []
  const transport = recording(seen)
  await live(root, () => main(['entities'], root, { transport, now: () => now }))
  assert.equal(metadataCalls(seen), 1)

  // Just under a week: kept, no download.
  await plantFicha(root, now)
  const almost = new Date(now.getTime() + CONTEXT_MAX_AGE_MS - 60_000)
  const kept = await live(root, () => main(['count', 'BusinessPartners'], root, { transport, now: () => almost }))
  assert.equal(kept.ok, true, JSON.stringify(kept))
  assert.equal(metadataCalls(seen), 1)
  assert.equal((await header2(root)).fetchedAt.toISOString(), now.toISOString())

  // Over a week: renewed, with a ficha that is still recent (they do not depend on each other).
  const later = new Date(now.getTime() + 8 * DAY)
  await plantFicha(root, later)
  const renewed = await live(root, () => main(['count', 'BusinessPartners'], root, { transport, now: () => later }))
  assert.equal(renewed.resumen!.contextoRegenerado, undefined, 'the ficha is of today')
  assert.equal(metadataCalls(seen), 2)
  assert.equal((await header2(root)).fetchedAt.toISOString(), later.toISOString())

  // A command that does not touch an entity renews it too.
  const much = new Date(later.getTime() + 8 * DAY)
  await live(root, () => main(['clean', 'no-such-dump'], root, { transport, now: () => much }))
  assert.equal(metadataCalls(seen), 3)
  assert.equal((await header2(root)).fetchedAt.toISOString(), much.toISOString())
})

test('an index made with another OData version is renewed', async () => {
  const root = await repo('v2')
  await live(root, () => main(['entities'], root))
  const file = standardIndexPath(root, 'dev')
  await writeFile(file, (await readFile(file, 'utf8')).replace(/^- OData version: v2/m, '- OData version: v1'))
  const seen: HttpRequest[] = []
  await live(root, () => main(['count', 'Items'], root, { transport: recording(seen) }))
  assert.equal((await header2(root)).odataVersion, 'v2')
  assert.equal(metadataCalls(seen), 1, 'the index and the ficha of Items share it')
})

/** A transport that answers `refused` to what `matches`, and goes to the real Service Layer for the rest. */
const refusing = (matches: RegExp): Transport => async (request) =>
  matches.test(request.url) ? { status: 403, headers: new Headers(), text: '{"error":{"code":"-1","message":"no access"}}' } : defaultTransport(request)

test('an index that cannot be made does not block the operation: the answer carries a warning', async () => {
  const root = await repo('v2')
  const out = await live(root, () => main(['count', 'BusinessPartners'], root, { transport: refusing(/\$metadata$/) }))
  assert.equal(out.ok, true, JSON.stringify(out))
  assert.equal(out.resumen!.total, 25)
  assert.match(out.resumen!.indiceError as string, /no access/)
  assert.equal(await readFile(standardIndexPath(root, 'dev'), 'utf8').catch(() => null), null)
  // The explicit command, in contrast, reports the failure.
  assert.equal((await main(['entities'], root, { transport: refusing(/\$metadata$/) })).ok, false)
})

test('with UserTablesMD or UserObjectsMD unreadable the index is still made, with names and no description', async () => {
  const root = await repo('v2')
  const out = await live(root, () => main(['count', 'BusinessPartners'], root, { transport: refusing(/UserTablesMD|UserObjectsMD/) }))
  assert.equal(out.ok, true, JSON.stringify(out))
  assert.equal(out.resumen!.indiceError, undefined)
  const user = await readFile(userIndexPath(root, 'dev'), 'utf8')
  assert.match(user, /^- U_SBOCTXT — user table$/m)
  assert.match(user, /UserTablesMD could not be read/)
  assert.match(user, /UserObjectsMD could not be read/)
  assert.ok(!/^- SBOUDT /m.test(user))
  assert.deepEqual((await readdir(join(root, '.sbo-skills/service-layer/dev'))).filter((f) => f.endsWith('.tmp') || f.endsWith('.lock')), [])
})

// --- an entity the Service Layer says does not exist ---------------------------------------------------------------

test('when the SL says an entity does not exist, $metadata is downloaded again and the index renewed even if recent; the error sends to the index', async () => {
  const root = await repo('v2')
  const now = new Date()
  await plantIndex(root, new Date(now.getTime() - 3_600_000))
  const seen: HttpRequest[] = []
  const out = await live(root, () => main(['page', 'NoSuchThings'], root, { transport: recording(seen), now: () => now }))
  assert.equal(out.ok, false)
  assert.equal(out.error!.code, 'ENTITY_NOT_FOUND')
  assert.equal(out.status, 400)
  assert.match(out.error!.message, /NoSuchThings/)
  assert.match(out.error!.message, /entities-standard\.md/)
  assert.match(out.error!.message, /entities-user\.md/)
  assert.equal(metadataCalls(seen), 1, 'one download serves the ficha attempt and the renewal')
  assert.equal((await header2(root)).fetchedAt.toISOString(), now.toISOString(), 'the index of an hour ago was renewed')
  assert.ok((await readFile(standardIndexPath(root, 'dev'), 'utf8')).includes('BusinessPartners'), 'with the real list')
  assert.deepEqual(await readdir(join(root, '.sbo-skills/service-layer/dev/context')).catch(() => []), [], 'no .missing file: nothing is remembered')
})

test('there is no limit to those downloads, and the context command answers the same way', async () => {
  const root = await repo('v2')
  const seen: HttpRequest[] = []
  const transport = recording(seen)
  await plantIndex(root)
  for (const argv of [['count', 'NoSuchThings'], ['traverse', 'NoSuchThings'], ['get', 'NoSuchThings', '1']]) {
    const out = await live(root, () => main(argv, root, { transport }))
    assert.equal(out.error!.code, 'ENTITY_NOT_FOUND', argv.join(' '))
  }
  assert.equal(metadataCalls(seen), 3)
  const command = await live(root, () => main(['context', 'NoSuchThings'], root, { transport }))
  assert.equal(command.error!.code, 'ENTITY_NOT_FOUND')
  assert.match(command.error!.message, /entities-standard\.md/)
  assert.equal(metadataCalls(seen), 4)
})

test('an error that is not about the entity does not download $metadata again', async () => {
  const root = await repo('v2')
  await plantIndex(root)
  await plantFicha(root, new Date())
  const seen: HttpRequest[] = []
  const out = await live(root, () => main(['page', 'BusinessPartners', '--filter', 'NoSuchField eq 1'], root, { transport: recording(seen) }))
  assert.equal(out.ok, false)
  assert.notEqual(out.error!.code, 'ENTITY_NOT_FOUND')
  assert.equal(out.status, 400)
  assert.equal(metadataCalls(seen), 0)
})

/** A Service Layer of its own for the cases the demo cannot give: `Foo` is in $metadata but the entity set answers "not found". */
function lyingServiceLayer(listed: string[]): { transport: Transport; seen: HttpRequest[] } {
  const seen: HttpRequest[] = []
  const reply = (status: number, body: string, headers: Record<string, string> = {}): HttpResponse => ({ status, headers: new Headers(headers), text: body })
  const transport: Transport = async (r) => {
    seen.push(r)
    if (r.url.endsWith('/Login')) return reply(200, '{"SessionId":"s","Version":"1"}')
    if (r.url.endsWith('/$metadata')) return reply(200, `<Schema>${listed.map((n) => `<EntitySet EntityType="SAPB1.T" Name="${n}"/>`).join('')}</Schema>`)
    if (/\/User(Tables|Objects)MD\?/.test(r.url)) return reply(200, '{"value":[]}')
    return reply(400, '{"error":{"code":"200","message":{"value":"Unrecognized resource path."}}}')
  }
  return { transport, seen }
}

test('an entity that the renewed $metadata does list is not declared missing: the SL answer stays as it was', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sbo-'))
  await writeSetup({ root, versionB1: 'FP 2608', versionOData: 'v2', environments: { dev: { url: 'https://sl.test:50000', companyDB: 'DB', userName: 'u', password: 'pw' } } })
  const { transport, seen } = lyingServiceLayer(['Foo', 'Orders'])
  const out = await main(['count', 'Foo'], root, { transport })
  assert.equal(out.ok, false)
  assert.equal(out.error!.code, '200')
  assert.equal(out.error!.message, 'Unrecognized resource path.')
  assert.equal(seen.filter((r) => r.url.endsWith('/$metadata')).length, 1)
  assert.ok((await readFile(standardIndexPath(root, 'dev'), 'utf8')).trimEnd().endsWith('Foo, Orders'))
})
