/**
 * Entity -> table of the user fields, against the real Service Layer: every entry of the plugin's map, and the tables it
 * cannot know in advance (user-defined tables, user objects).
 */
import { before, test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { writeSetup } from '../src/setup/setup.ts'
import { sessionPath } from '../src/common/layout.ts'
import { knownEntitySets } from '../src/use/metadata.ts'
import { main } from '../src/use/command.ts'
import { ENVIRONMENTS } from '../src/common/versions.ts'
import { ensureUserFields, ensureUserObject, ensureUserTable, live, realCredentials } from './sl-env.ts'

async function repo(versionOData: 'v1' | 'v2') {
  const root = await mkdtemp(join(tmpdir(), 'sbo-'))
  await writeSetup({ root, versionB1: 'FP 2608', versionOData, environments: { dev: realCredentials() } })
  return root
}

const field = (Name: string, TableName: string) => ({ Name, TableName, Type: 'db_Alpha', Size: 10, Description: `map check ${TableName}` })

type Lines = readonly [collection: string, userField: string]
// What each entity set must show: its user fields of the header, and those of the collections of lines.
const DOC = { header: 'SBOMAPD', lines: [['DocumentLines', 'SBOMAPDL']] as Lines[] }
const TRANSFER = { header: 'SBOMAPD', lines: [['StockTransferLines', 'SBOMAPDL']] as Lines[] }
const EXPECTED: Record<string, { header: string; lines: Lines[] }> = {
  ...Object.fromEntries(
    [
      'Orders', 'Quotations', 'Invoices', 'DeliveryNotes', 'Returns', 'CreditNotes', 'DownPayments', 'PurchaseOrders', 'PurchaseQuotations',
      'PurchaseRequests', 'PurchaseInvoices', 'PurchaseDeliveryNotes', 'PurchaseReturns', 'PurchaseCreditNotes', 'PurchaseDownPayments',
      'Drafts', 'InventoryGenEntries', 'InventoryGenExits',
    ].map((name) => [name, DOC]),
  ),
  StockTransfers: TRANSFER,
  InventoryTransferRequests: TRANSFER,
  Items: { header: 'SBOMAPI', lines: [] },
  Warehouses: { header: 'SBOMAPW', lines: [] },
  JournalEntries: { header: 'SBOMAPJ', lines: [['JournalEntryLines', 'SBOMAPJL']] },
  ProductionOrders: { header: 'SBOMAPP', lines: [['ProductionOrderLines', 'SBOMAPPL']] },
  BusinessPartners: { header: 'SBOMAPB', lines: [['BPAddresses', 'SBOMAPA'], ['ContactEmployees', 'SBOMAPC']] },
}
const ALL_FIELDS = ['SBOMAPD', 'SBOMAPDL', 'SBOMAPI', 'SBOMAPW', 'SBOMAPJ', 'SBOMAPJL', 'SBOMAPP', 'SBOMAPPL', 'SBOMAPB', 'SBOMAPA', 'SBOMAPC']

before(async () => {
  await ensureUserFields([
    field('SBOMAPD', 'ORDR'), // the SL puts it on every marketing document header (ORDR, OQUT, OINV, ... all get it)
    field('SBOMAPDL', 'RDR1'),
    field('SBOMAPI', 'OITM'),
    field('SBOMAPW', 'OWHS'),
    field('SBOMAPJ', 'OJDT'),
    field('SBOMAPJL', 'JDT1'),
    field('SBOMAPP', 'OWOR'),
    field('SBOMAPPL', 'WOR1'),
    field('SBOMAPB', 'OCRD'),
    field('SBOMAPA', 'CRD1'),
    field('SBOMAPC', 'OCPR'),
  ])
})

/** The lines of one section of a ficha: `## <title>` up to the next `## `. */
function section(md: string, title: string): string {
  const all = md.split('\n')
  const start = all.findIndex((l) => l.startsWith(`## ${title}`))
  assert.notEqual(start, -1, `no section "${title}" in the ficha`)
  const lines = all.slice(start + 1)
  const end = lines.findIndex((l) => l.startsWith('## '))
  return lines.slice(0, end < 0 ? undefined : end).join('\n')
}

test('every entity of the map is checked here (a new entry needs its expectation)', () => {
  assert.deepEqual(knownEntitySets().sort(), Object.keys(EXPECTED).sort())
})

for (const version of ['v1', 'v2'] as const) {
  test(`${version}: the ficha of every entity of the map shows the user fields of its own tables, header and lines`, async () => {
    const root = await repo(version)
    for (const [entity, want] of Object.entries(EXPECTED)) {
      const out = await live(root, () => main(['context', entity, '--show'], root))
      assert.equal(out.ok, true, `${entity}: ${JSON.stringify(out)}`)
      const md = out.resumen!.contenido as string
      assert.match(section(md, 'User fields ('), new RegExp(`^U_${want.header}: `, 'm'), `${entity}: header field`)
      for (const [collection, name] of want.lines) {
        assert.match(section(md, `${collection}:`), new RegExp(`^U_${name}: `, 'm'), `${entity}: ${collection}`)
      }
      // And none of the fields of another group.
      const own = new Set([want.header, ...want.lines.map((l) => l[1])])
      for (const other of ALL_FIELDS) {
        if (!own.has(other)) assert.ok(!md.includes(`U_${other}:`), `${entity} must not show U_${other}`)
      }
    }
  })
}

// --- user-defined tables ---------------------------------------------------------------------------------------------

/**
 * `$metadata` is not the same on every node and a new table shows only on some (TESTING.md): the command is repeated with a new
 * session (so, maybe, another node) until the entity is listed (and, if given, the `mustShow` pattern is in the ficha: a node may know the object but
 * not yet its child table). `tries` says how many it took.
 */
async function untilListed(root: string, entity: string, mustShow?: RegExp, attempts = 15) {
  for (let i = 1; ; i++) {
    const out = await live(root, () => main(['context', entity, '--refresh', '--show'], root))
    const complete = out.ok && (!mustShow || mustShow.test(out.resumen!.contenido as string))
    if (complete || (out.error && out.error.code !== 'ENTITY_NOT_FOUND') || i >= attempts) return { out, tries: i }
    for (const env of ENVIRONMENTS) await rm(sessionPath(root, env), { force: true })
  }
}

test('a user-defined table without a user object (entity U_NAME, table @NAME) gets its ficha', async (t) => {
  await ensureUserTable('SBOCTXT', 'bott_NoObject', [{ Name: 'F1' }, { Name: 'F2', Mandatory: 'tYES' }])
  const root = await repo('v2')
  const { out, tries } = await untilListed(root, 'U_SBOCTXT')
  t.diagnostic(`U_SBOCTXT listed in $metadata after ${tries} attempt(s)`)
  assert.equal(out.ok, true, JSON.stringify(out))
  const md = out.resumen!.contenido as string
  assert.match(section(md, 'User fields (@SBOCTXT)'), /^U_F1: alpha/m)
  assert.match(section(md, 'User fields (@SBOCTXT)'), /^U_F2: alpha\(20\) !/m)
})

test('a user table registered as a user object is exposed under the object code; its tables come from UserObjectsMD', async (t) => {
  await ensureUserTable('SBOUDT', 'bott_MasterData', [{ Name: 'F1', Mandatory: 'tYES' }])
  await ensureUserTable('SBOUDTL', 'bott_MasterDataLines', [{ Name: 'L1' }])
  await ensureUserObject('SBOUDT', 'boud_MasterData', ['SBOUDTL'])
  const root = await repo('v2')
  const { out, tries } = await untilListed(root, 'SBOUDT', /^## SBOUDTLCollection:/m)
  t.diagnostic(`SBOUDT listed in $metadata after ${tries} attempt(s)`)
  assert.equal(out.ok, true, JSON.stringify(out))
  const md = out.resumen!.contenido as string
  assert.match(section(md, 'User fields (@SBOUDT)'), /^U_F1: alpha\(20\) !/m)
  assert.match(section(md, 'SBOUDTLCollection:'), /^U_L1: alpha/m)
  // The entity set U_SBOUDT does not exist for a table with an object: the entity is the object code.
  const wrong = await live(root, () => main(['context', 'U_SBOUDT'], root))
  assert.equal(wrong.error!.code, 'ENTITY_NOT_FOUND')
})
