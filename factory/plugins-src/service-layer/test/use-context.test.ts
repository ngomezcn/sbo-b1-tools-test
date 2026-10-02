import { before, test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { writeSetup } from '../src/setup/setup.ts'
import { contextPath } from '../src/common/layout.ts'
import { renderContext, readHeader, tablesFor } from '../src/use/metadata.ts'
import { CONTEXT_MAX_AGE_MS } from '../src/use/object-context.ts'
import { main } from '../src/use/command.ts'
import { defaultTransport, type HttpRequest, type Transport } from '../src/common/sl.ts'
import { ensureUserFields, live, realCredentials, recordingOk as recording } from './sl-env.ts'

const good = realCredentials()
const DAY = 24 * 3_600_000

async function repo(versionOData: 'v1' | 'v2') {
  const root = await mkdtemp(join(tmpdir(), 'sbo-'))
  await writeSetup({ root, versionB1: 'FP 2608', versionOData, environments: { dev: good } })
  return root
}

const metadataCalls = (seen: HttpRequest[]) => seen.filter((r) => r.url.endsWith('/$metadata')).length
const fixture = () => readFile(new URL('./fixtures/context/BusinessPartners.v2.md', import.meta.url), 'utf8')

/** The fixture, with its header dated `fetchedAt`, planted where the Uso keeps it. */
async function plant(root: string, entitySet: string, fetchedAt: Date, odata = 'v2') {
  const text = (await fixture()).replace(/^- Fetched: \S+/m, `- Fetched: ${fetchedAt.toISOString()}`).replace(/^- OData version: v[12]/m, `- OData version: ${odata}`)
  const file = contextPath(root, 'dev', entitySet)
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, text)
  return file
}

// User fields of our own in the demo company (disposable): a mandatory one with valid values, one on the lines.
before(() =>
  ensureUserFields([
    {
      Name: 'SBOCTX',
      TableName: 'OCRD',
      Type: 'db_Alpha',
      Size: 10,
      Description: 'ctx test',
      Mandatory: 'tYES',
      DefaultValue: 'A',
      ValidValuesMD: [
        { Value: 'A', Description: 'Alpha' },
        { Value: 'B', Description: 'Beta' },
      ],
    },
    { Name: 'SBOCTXL', TableName: 'RDR1', Type: 'db_Alpha', Size: 20, Description: 'ctx line' },
    { Name: 'SBOCTXN', TableName: 'ORDR', Type: 'db_Float', SubType: 'st_Sum', Description: 'ctx num' },
  ]),
)

// --- no server: the rendering --------------------------------------------------------------------------------------

const sample = (v: 'v1' | 'v2') => `<Schema>
  ${v === 'v2' ? '<EnumType IsFlags="false" Name="BoCardTypes" UnderlyingType="Edm.Int32"><Member Name="cCustomer" Value="0"/><Member Name="cSupplier" Value="1"/></EnumType>' : '<EnumType Name="BoCardTypes"><Member Name="cCustomer"/><Member Name="cSupplier"/></EnumType>'}
  <ComplexType Name="BPAddress"><Property Name="AddressName" Nullable="false" Type="Edm.String"/><Property Name="U_STALE_ON_NODE" Type="Edm.String"/></ComplexType>
  <EntityType Name="BusinessPartner" OpenType="true">
    <Key><PropertyRef Name="CardCode"/></Key>
    <Property Name="CardCode" Nullable="false" Type="Edm.String"/>
    <Property Name="CardName" Type="Edm.String"/>
    <Property Name="CardType" Type="SAPB1.BoCardTypes"/>
    <Property Name="Properties1" Type="Edm.String"/><Property Name="Properties2" Type="Edm.String"/><Property Name="Properties3" Type="Edm.String"/><Property Name="Properties4" Type="Edm.String"/>
    <Property Name="U_STALE_ON_NODE" Type="Edm.String"/>
    <Property Name="BPAddresses" Type="Collection(SAPB1.BPAddress)"/>
    ${v === 'v2' ? '<NavigationProperty Name="Series" Partner="x" Type="SAPB1.Series"/>' : '<NavigationProperty FromRole="a" Name="Series" Relationship="r" ToRole="b"/>'}
  </EntityType>
  <EntitySet EntityType="SAPB1.BusinessPartner" Name="BusinessPartners"/>
</Schema>`

const rows = [
  { Name: 'LOC', TableName: 'OCRD', Type: 'db_Alpha', Size: 10, EditSize: 10, Mandatory: 'tYES', DefaultValue: 'A', Description: 'Local', ValidValuesMD: [{ Value: 'A', Description: 'Alpha' }, { Value: 'B', Description: 'Beta' }] },
  { Name: 'NOTE', TableName: 'OCRD', Type: 'db_Memo', Size: 100, Mandatory: 'tNO', Description: 'A note' },
  { Name: 'ADDR', TableName: 'CRD1', Type: 'db_Alpha', Size: 5, EditSize: 5, Mandatory: 'tNO', Description: 'Address extra' },
  { Name: 'OTHER', TableName: 'OITM', Type: 'db_Alpha', Size: 5, Mandatory: 'tNO', Description: 'not ours' },
]

for (const v of ['v1', 'v2'] as const) {
  test(`${v}: renders standard fields grouped by type, enums with their values, user fields from UserFieldsMD only`, () => {
    const md = renderContext({
      entitySet: 'BusinessPartners', odataVersion: v, versionB1: 'FP 2608', fetchedAt: new Date('2026-10-02T10:00:00Z'),
      xml: sample(v), userFields: rows, tables: tablesFor('BusinessPartners'),
    })!
    assert.match(md, /^# BusinessPartners/)
    assert.deepEqual(readHeader(md), { fetchedAt: new Date('2026-10-02T10:00:00Z'), odataVersion: v })
    assert.match(md, /Entity type: BusinessPartner · Key: CardCode/)
    assert.match(md, /^- String: CardCode!, CardName, Properties1-4$/m)
    assert.match(md, /^- BoCardTypes \(cCustomer \| cSupplier\): CardType$/m)
    assert.match(md, /^## User fields \(OCRD\)\nU_LOC: alpha\(10\) ! — default "A" — Local — values: A=Alpha \| B=Beta\nU_NOTE: memo — A note$/m)
    assert.match(md, /^## BPAddresses: BPAddress\[\]\n- String: AddressName!\nUser fields \(CRD1\):\nU_ADDR: alpha\(5\) — Address extra$/m)
    assert.match(md, /^## Expand \(navigation properties\)\nSeries$/m)
    // `U_` properties of $metadata (a node's cache may be stale) and fields of other tables are never used.
    assert.ok(!md.includes('STALE_ON_NODE'))
    assert.ok(!md.includes('OTHER'))
    assert.equal(renderContext({ entitySet: 'Nope', odataVersion: v, versionB1: 'x', fetchedAt: new Date(), xml: sample(v), userFields: null, tables: null }), null)
  })
}

test('an entity whose table is unknown says so instead of guessing; user tables map to @NAME', () => {
  const md = renderContext({ entitySet: 'BusinessPartners', odataVersion: 'v2', versionB1: 'FP 2608', fetchedAt: new Date(), xml: sample('v2'), userFields: null, tables: null })!
  assert.match(md, /## User fields\nNot resolved: .*--tables/)
  assert.deepEqual(tablesFor('Orders'), { main: ['ORDR'], collections: { DocumentLines: 'RDR1' } })
  assert.deepEqual(tablesFor('U_MYTABLE'), { main: ['@MYTABLE'], collections: {} })
  assert.equal(tablesFor('Currencies'), null)
})

// --- the real Service Layer ----------------------------------------------------------------------------------------

for (const version of ['v1', 'v2'] as const) {
  test(`${version}: context for BusinessPartners and Orders (real $metadata + UserFieldsMD)`, async () => {
    const root = await repo(version)
    const bp = await live(root, () => main(['context', 'BusinessPartners', '--show'], root))
    assert.equal(bp.ok, true, JSON.stringify(bp))
    assert.equal(bp.resumen!.regenerado, true)
    assert.equal(bp.resumen!.ruta, contextPath(root, 'dev', 'BusinessPartners'))
    const text = bp.resumen!.contenido as string
    assert.equal(text, await readFile(contextPath(root, 'dev', 'BusinessPartners'), 'utf8'))
    assert.deepEqual(readHeader(text)?.odataVersion, version)
    assert.match(text, /Key: CardCode/)
    assert.match(text, /^- String: CardCode!,/m)
    assert.match(text, /BoCardTypes \(cCustomer \| cSupplier \| cLid\): CardType/)
    assert.match(text, /^U_SBOCTX: alpha\(10\) ! — default "A" — ctx test — values: A=Alpha \| B=Beta$/m)
    assert.ok(!text.includes('<EntityType'), 'the XML of $metadata is never copied')
    assert.ok(text.length < 25_000, `BusinessPartners ficha is ${text.length} characters`)

    const orders = await live(root, () => main(['context', 'Orders', '--show'], root))
    assert.equal(orders.ok, true, JSON.stringify(orders))
    const o = orders.resumen!.contenido as string
    assert.match(o, /Entity type: Document · Key: DocEntry/)
    assert.match(o, /^## User fields \(ORDR\)\n(.*\n)*?U_SBOCTXN: float:sum — ctx num$/m)
    assert.match(o, /^## DocumentLines: DocumentLine\[\]/m)
    assert.match(o, /^U_SBOCTXL: alpha\(20\) — ctx line$/m)
    assert.ok(o.length < 40_000, `Orders ficha is ${o.length} characters`)
  })
}

test('an unknown entity set is reported; one with unknown tables says user fields are not resolved; --tables fills them', async () => {
  const root = await repo('v2')
  const missing = await live(root, () => main(['context', 'NoSuchThings'], root))
  assert.equal(missing.error!.code, 'ENTITY_NOT_FOUND')
  const plain = await live(root, () => main(['context', 'Currencies', '--show'], root))
  assert.equal(plain.ok, true, JSON.stringify(plain))
  assert.match(plain.resumen!.contenido as string, /Not resolved/)
  const forced = await live(root, () => main(['context', 'Items', '--tables', 'OITM', '--show'], root))
  assert.match(forced.resumen!.contenido as string, /## User fields \(OITM\)/)
})

test('any operation on an entity creates its context when missing; a recent one is left alone', async () => {
  const root = await repo('v2')
  const seen: HttpRequest[] = []
  const transport = recording(seen)
  const first = await live(root, () => main(['count', 'BusinessPartners'], root, { transport }))
  assert.equal(first.ok, true, JSON.stringify(first))
  assert.equal(first.resumen!.contexto, contextPath(root, 'dev', 'BusinessPartners'))
  assert.equal(first.resumen!.contextoRegenerado, true)
  assert.equal(metadataCalls(seen), 1)

  const second = await live(root, () => main(['page', 'BusinessPartners', '--top', '2'], root, { transport }))
  assert.equal(second.resumen!.contexto, contextPath(root, 'dev', 'BusinessPartners'))
  assert.equal(second.resumen!.contextoRegenerado, undefined)
  assert.equal(metadataCalls(seen), 1, 'a ficha of today is not fetched again')
  // The records and the ficha are different things: the ficha is not a Volcado.
  assert.ok(!JSON.stringify(second).includes('CardName'))
})

test('a context older than a week, or made with another OData version, is regenerated before any operation; the clock is injected', async () => {
  const root = await repo('v2')
  const now = new Date()
  const seen: HttpRequest[] = []
  const transport = recording(seen)
  const file = await plant(root, 'BusinessPartners', new Date(now.getTime() - (CONTEXT_MAX_AGE_MS - 60_000)))
  assert.equal((await live(root, () => main(['count', 'BusinessPartners'], root, { transport, now: () => now }))).resumen!.contextoRegenerado, undefined)
  assert.equal(metadataCalls(seen), 0, 'just under a week: kept')

  await plant(root, 'BusinessPartners', new Date(now.getTime() - 8 * DAY))
  const old = await live(root, () => main(['count', 'BusinessPartners'], root, { transport, now: () => now }))
  assert.equal(old.resumen!.contextoRegenerado, true, JSON.stringify(old))
  assert.equal(metadataCalls(seen), 1)
  assert.equal(readHeader(await readFile(file, 'utf8'))!.fetchedAt.toISOString(), now.toISOString())

  await plant(root, 'BusinessPartners', now, 'v1')
  const other = await live(root, () => main(['count', 'BusinessPartners'], root, { transport, now: () => now }))
  assert.equal(other.resumen!.contextoRegenerado, true, 'config says v2, the ficha says v1')
})

test('the developer can ask for a new context with the command or with a flag on an operation; the AI path never forces it', async () => {
  const root = await repo('v2')
  const seen: HttpRequest[] = []
  const transport = recording(seen)
  await plant(root, 'BusinessPartners', new Date())
  assert.equal((await live(root, () => main(['context', 'BusinessPartners'], root, { transport }))).resumen!.regenerado, false)
  assert.equal(metadataCalls(seen), 0)
  assert.equal((await live(root, () => main(['context', 'BusinessPartners', '--refresh'], root, { transport }))).resumen!.regenerado, true)
  assert.equal(metadataCalls(seen), 1)
  const flagged = await live(root, () => main(['page', 'BusinessPartners', '--top', '1', '--refresh-context'], root, { transport }))
  assert.equal(flagged.resumen!.contextoRegenerado, true)
  assert.equal(metadataCalls(seen), 2)
  // A plain operation never refreshes a recent ficha.
  await live(root, () => main(['get', 'BusinessPartners', 'C50000'], root, { transport }))
  assert.equal(metadataCalls(seen), 2)
})

test('an entity that $metadata does not know does not block the operation: the SL answers for itself', async () => {
  const root = await repo('v2')
  const out = await live(root, () => main(['page', 'NoSuchThings'], root))
  assert.equal(out.ok, false)
  assert.equal(typeof out.status, 'number')
  await assert.rejects(readdir(join(root, '.sbo-skills/service-layer/dev/context/NoSuchThings.md')))
})

test('show returns the text of an existing ficha without touching the server', async () => {
  const root = await repo('v2')
  const seen: HttpRequest[] = []
  const file = await plant(root, 'BusinessPartners', new Date())
  const out = await main(['context', 'BusinessPartners', '--show'], root, { transport: recording(seen) })
  assert.equal(out.resumen!.contenido, await readFile(file, 'utf8'))
  assert.equal(seen.length, 0)
})

test('two executions generating the same context at once never leave a half-written ficha', async () => {
  const root = await repo('v2')
  assert.equal((await live(root, () => main(['count', 'Items'], root))).ok, true) // one session first (parallel first logins fail on the demo)
  const both = await Promise.all([live(root, () => main(['context', 'Orders', '--refresh'], root)), live(root, () => main(['context', 'Orders', '--refresh'], root))])
  assert.ok(both.every((o) => o.ok), JSON.stringify(both))
  const files = await readdir(join(root, '.sbo-skills/service-layer/dev/context'))
  assert.ok(files.includes('Orders.md') && files.every((f) => !f.endsWith('.tmp')), files.join(','))
  assert.ok(readHeader(await readFile(contextPath(root, 'dev', 'Orders'), 'utf8')))
})

test('a collection of an enumeration lists its values', () => {
  const xml = `<Schema><EnumType IsFlags="false" Name="Color" UnderlyingType="Edm.Int32"><Member Name="red" Value="0"/><Member Name="blue" Value="1"/></EnumType>
<EntityType Name="Thing"><Key><PropertyRef Name="Id"/></Key><Property Name="Id" Nullable="false" Type="Edm.Int32"/><Property Name="Colors" Type="Collection(SAPB1.Color)"/></EntityType>
<EntitySet EntityType="SAPB1.Thing" Name="Things"/></Schema>`
  const md = renderContext({ entitySet: 'Things', odataVersion: 'v2', versionB1: 'FP 2608', fetchedAt: new Date(), xml, userFields: [], tables: null })!
  assert.match(md, /^- Color\[\] \(red \| blue\): Colors$/m)
})

test('a context that cannot be built does not hide the data: the operation answers and carries a warning', async () => {
  const root = await repo('v2')
  const failing: Transport = async (request) =>
    /UserFieldsMD/.test(request.url) ? { status: 403, headers: new Headers(), text: '{"error":{"code":"-1","message":"no access"}}' } : defaultTransport(request)
  const out = await live(root, () => main(['count', 'BusinessPartners'], root, { transport: failing }))
  assert.equal(out.ok, true, JSON.stringify(out))
  assert.equal(out.resumen!.total, 25)
  assert.match(out.resumen!.contextoError as string, /no access/)
  assert.equal(out.resumen!.contexto, undefined)
  // The explicit command, in contrast, reports the failure.
  assert.equal((await main(['context', 'BusinessPartners'], root, { transport: failing })).ok, false)
})
