/**
 * Pure functions that turn `$metadata` (EDMX XML, ~2 MB) and `UserFieldsMD` rows into one Contexto de objeto.
 * Only the requested entity is extracted from the XML: the whole document is never copied anywhere.
 */
import type { ODataVersion } from '../common/versions.ts'

const decode = (s: string) => s.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')

function attributes(tag: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const m of tag.matchAll(/([\w:.]+)="([^"]*)"/g)) out[m[1]] = decode(m[2])
  return out
}

/** Text of `<kind Name="name" ...>...</kind>` (or the self-closing tag), or null. */
function block(xml: string, kind: string, name: string): string | null {
  name = name.replace(/[^\w.]/g, '')
  const open = new RegExp(`<${kind}\\b[^>]*\\bName="${name}"[^>]*>`).exec(xml)
  if (!open) return null
  if (open[0].endsWith('/>')) return open[0]
  const end = xml.indexOf(`</${kind}>`, open.index)
  return end < 0 ? null : xml.slice(open.index, end + kind.length + 3)
}

const tags = (text: string, tag: string) => [...text.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'g'))].map((m) => attributes(m[0]))

export interface Field {
  name: string
  /** `Edm.` types without the prefix (`String`), enum or complex type names as declared. */
  type: string
  collection: boolean
  /** `Nullable="false"` in `$metadata`. Not the same as mandatory when writing. */
  notNullable: boolean
}

export interface EntityInfo {
  entityType: string
  keys: string[]
  fields: Field[]
  expand: string[]
}

const stripNamespace = (type: string) => type.replace(/^SAPB1\./, '').replace(/^Edm\./, '')

function fieldsOf(text: string): Field[] {
  return tags(text, 'Property').map((p) => {
    const collection = /^Collection\(/.test(p.Type)
    return { name: p.Name, type: stripNamespace(p.Type.replace(/^Collection\((.*)\)$/, '$1')), collection, notNullable: p.Nullable === 'false' }
  })
}

/** The entity type behind an entity set (`Orders` -> `Document`), or null when `$metadata` has no such set. */
export function entityTypeOf(xml: string, entitySet: string): string | null {
  const m = new RegExp(`<EntitySet\\b[^>]*\\bName="${entitySet}"[^>]*>`).exec(xml)
  const type = m ? attributes(m[0]).EntityType : undefined
  return type ? stripNamespace(type) : null
}

/** Every entity set `$metadata` lists. Actions and functions are not entity sets and never appear here. */
export const entitySetNames = (xml: string): string[] => [...xml.matchAll(/<EntitySet\b[^>]*\bName="([^"]+)"/g)].map((m) => m[1])

export function entityInfo(xml: string, entityType: string): EntityInfo | null {
  const text = block(xml, 'EntityType', entityType)
  if (!text) return null
  return {
    entityType,
    keys: tags(text, 'PropertyRef').map((k) => k.Name),
    fields: fieldsOf(text),
    expand: tags(text, 'NavigationProperty').map((n) => n.Name),
  }
}

export const complexFields = (xml: string, type: string): Field[] | null => {
  const text = block(xml, 'ComplexType', type)
  return text ? fieldsOf(text) : null
}

export const enumMembers = (xml: string, type: string): string[] | null => {
  const text = block(xml, 'EnumType', type.replace(/[]$/, ''))
  return text ? tags(text, 'Member').map((m) => m.Name) : null
}

/** A row of `UserFieldsMD` (only what the ficha uses). */
export interface UserField {
  Name: string
  TableName: string
  Type?: string
  SubType?: string | null
  Size?: number | null
  EditSize?: number | null
  Description?: string | null
  DefaultValue?: string | null
  Mandatory?: string | null
  LinkedTable?: string | null
  ValidValuesMD?: { Value: string; Description?: string | null }[]
}

function describeUserField(f: UserField): string {
  const kind = (f.Type ?? '').replace(/^db_/, '').toLowerCase()
  const size = f.Type === 'db_Alpha' || f.Type === 'db_Numeric' ? `(${f.EditSize || f.Size})` : ''
  const sub = f.SubType && f.SubType !== 'st_None' ? `:${f.SubType.replace(/^st_/, '').toLowerCase()}` : ''
  const parts = [`U_${f.Name}: ${kind}${size}${sub}${f.Mandatory === 'tYES' ? ' !' : ''}`]
  if (f.DefaultValue) parts.push(`default ${JSON.stringify(f.DefaultValue)}`)
  if (f.LinkedTable) parts.push(`linked table ${f.LinkedTable}`)
  if (f.Description) parts.push(f.Description)
  const values = f.ValidValuesMD ?? []
  if (values.length > 0) parts.push(`values: ${values.map((v) => (v.Description ? `${v.Value}=${v.Description}` : v.Value)).join(' | ')}`)
  return parts.join(' — ')
}

/**
 * Tables of user fields per entity set. `$metadata` does not say which table an entity set is stored in and
 * `UserFieldsMD.TableName` is the database table (`OCRD`), never the entity (TESTING.md), so it is listed here.
 * Marketing documents: header table plus their lines table (`ORDR` / `RDR1`). Every entry was checked against
 * the real Service Layer: the tables exist in `UserFieldsMD`, and the entity set and its collection are in `$metadata`.
 * Entity sets that are not here are resolved in the Service Layer itself (see `resolveTables` in object-context.ts).
 */
const DOCUMENTS: Record<string, [string, string]> = {
  Orders: ['ORDR', 'RDR1'],
  Quotations: ['OQUT', 'QUT1'],
  Invoices: ['OINV', 'INV1'],
  DeliveryNotes: ['ODLN', 'DLN1'],
  Returns: ['ORDN', 'RDN1'],
  CreditNotes: ['ORIN', 'RIN1'],
  DownPayments: ['ODPI', 'DPI1'],
  PurchaseOrders: ['OPOR', 'POR1'],
  PurchaseQuotations: ['OPQT', 'PQT1'],
  PurchaseRequests: ['OPRQ', 'PRQ1'],
  PurchaseInvoices: ['OPCH', 'PCH1'],
  PurchaseDeliveryNotes: ['OPDN', 'PDN1'],
  PurchaseReturns: ['ORPD', 'RPD1'],
  PurchaseCreditNotes: ['ORPC', 'RPC1'],
  PurchaseDownPayments: ['ODPO', 'DPO1'],
  Drafts: ['ODRF', 'DRF1'],
  InventoryGenEntries: ['OIGN', 'IGN1'],
  InventoryGenExits: ['OIGE', 'IGE1'],
}

/** Stock transfers do not use `DocumentLines`: their lines collection is `StockTransferLines`. */
const TRANSFERS: Record<string, [string, string]> = {
  StockTransfers: ['OWTR', 'WTR1'],
  InventoryTransferRequests: ['OWTQ', 'WTQ1'],
}

export interface TableMap {
  /** Table(s) of the entity itself. */
  main: string[]
  /** Table of each collection property (`DocumentLines` -> `RDR1`). */
  collections: Record<string, string>
}

const STATIC_TABLES: Record<string, TableMap> = {
  ...Object.fromEntries(Object.entries(DOCUMENTS).map(([name, [head, lines]]) => [name, { main: [head], collections: { DocumentLines: lines } }])),
  ...Object.fromEntries(Object.entries(TRANSFERS).map(([name, [head, lines]]) => [name, { main: [head], collections: { StockTransferLines: lines } }])),
  BusinessPartners: { main: ['OCRD'], collections: { BPAddresses: 'CRD1', ContactEmployees: 'OCPR' } },
  Items: { main: ['OITM'], collections: {} },
  Warehouses: { main: ['OWHS'], collections: {} },
  JournalEntries: { main: ['OJDT'], collections: { JournalEntryLines: 'JDT1' } },
  ProductionOrders: { main: ['OWOR'], collections: { ProductionOrderLines: 'WOR1' } },
}

export const knownEntitySets = () => Object.keys(STATIC_TABLES)

/**
 * Tables of the user fields of an entity set from this plugin's own map, or null when it has none.
 * A user-defined table without a user object is exposed as entity set `U_<NAME>` and its fields live in `@<NAME>`
 * (checked live). One with a user object is exposed under the object's code instead: that one comes from `UserObjectsMD`.
 */
export function tablesFor(entitySet: string): TableMap | null {
  const known = STATIC_TABLES[entitySet]
  if (known) return { main: [...known.main], collections: { ...known.collections } }
  const udt = /^U_(\w+)$/.exec(entitySet)
  if (udt) return { main: [`@${udt[1]}`], collections: {} }
  return null
}

export interface ContextInput {
  entitySet: string
  odataVersion: ODataVersion
  versionB1: string
  fetchedAt: Date
  xml: string
  /** `UserFieldsMD` rows of the tables of the entity, or null when its tables are not known. */
  userFields: UserField[] | null
  /** The `UserFieldsMD` read stopped at its cap: the list of user fields is incomplete. */
  userFieldsTruncated?: boolean
  tables: TableMap | null
  /** Tables the developer chose with `--tables`: marked in the ficha and kept when it is regenerated. */
  chosenTables?: string[]
}

export const CONTEXT_HEADER = { fetched: 'Fetched', odata: 'OData version' }
const CHOSEN_TABLES = 'Tables set with --tables'

function standard(fields: Field[]): Field[] {
  return fields.filter((f) => !f.name.startsWith('U_'))
}

/** Renders the compact Markdown of the ficha. Returns null if `$metadata` has no such entity set. */
export function renderContext(input: ContextInput): string | null {
  const type = entityTypeOf(input.xml, input.entitySet)
  const info = type ? entityInfo(input.xml, type) : null
  if (!info) return null

  /** `Properties1, Properties2, ... Properties64` -> `Properties1-64` (runs of 4 or more). */
function collapseRuns(names: string[]): string[] {
  const out: string[] = []
  for (let i = 0; i < names.length; ) {
    const m = /^(.*\D)(\d+)$/.exec(names[i])
    let j = i
    while (m && j + 1 < names.length && names[j + 1] === `${m[1]}${Number(m[2]) + (j + 1 - i)}`) j++
    if (m && j - i >= 3) out.push(`${names[i]}-${names[j].slice(m[1].length)}`)
    else out.push(...names.slice(i, j + 1))
    i = j + 1
  }
  return out
}

/** One line per type (and per enumeration, with its values): `String: CardCode!, CardName`. Much shorter than one line per field. */
  const grouped = (fields: Field[]): string[] => {
    const groups = new Map<string, string[]>()
    for (const f of fields) {
      const key = f.type + (f.collection ? '[]' : '')
      groups.set(key, [...(groups.get(key) ?? []), f.name + (f.notNullable ? '!' : '')])
    }
    const label = (key: string) => {
      const members = enumMembers(input.xml, key)
      return members ? `${key} (${members.join(' | ')})` : key
    }
    const basic = [...groups].filter(([k]) => !enumMembers(input.xml, k)).sort(([a], [b]) => a.localeCompare(b))
    const enums = [...groups].filter(([k]) => enumMembers(input.xml, k)).sort(([a], [b]) => a.localeCompare(b))
    return [...basic, ...enums].map(([k, names]) => `- ${label(k)}: ${collapseRuns(names).join(', ')}`)
  }

  const out: string[] = []
  out.push(`# ${input.entitySet}`)
  out.push('')
  out.push(`- ${CONTEXT_HEADER.fetched}: ${input.fetchedAt.toISOString()}`)
  out.push(`- ${CONTEXT_HEADER.odata}: ${input.odataVersion} (B1 ${input.versionB1})`)
  out.push(`- Entity type: ${info.entityType} · Key: ${info.keys.join(', ') || '-'}`)
  if (input.chosenTables) out.push(`- ${CHOSEN_TABLES}: ${input.chosenTables.join(', ')} (chosen by the developer; kept when this ficha is regenerated, "context ${input.entitySet} --tables default" undoes it)`)
  out.push('- Legend: fields are grouped by type; `!` after a name = Nullable=false in $metadata (not always the same as mandatory when writing), any other field may be left empty. A type followed by (a | b) is an enumeration and those are its valid values. `[]` = collection. $metadata gives no size for standard fields.')

  const own = standard(info.fields)
  const flat = own.filter((f) => complexFields(input.xml, f.type) === null)
  const nested = own.filter((f) => complexFields(input.xml, f.type) !== null)
  out.push('', '## Standard fields', ...grouped(flat))

  const userBlock = (rows: UserField[]) => rows.map(describeUserField)
  if (input.tables === null) {
    out.push('', '## User fields', `Not resolved: this plugin does not know which table stores ${input.entitySet}. Ask the developer to run \`context ${input.entitySet} --tables <TABLE,...>\`.`)
  } else {
    const main = (input.userFields ?? []).filter((u) => input.tables!.main.includes(u.TableName)).sort((a, b) => a.Name.localeCompare(b.Name))
    out.push('', `## User fields (${input.tables.main.join(', ')})${input.chosenTables ? ' [--tables]' : ''}`, ...(main.length > 0 ? userBlock(main) : ['None.']))
    if (input.userFieldsTruncated) out.push('WARNING: the list of user fields was cut off (too many); some may be missing.')
  }

  const complexSections: string[] = []
  for (const f of nested) {
    const inner = complexFields(input.xml, f.type)!
    const table = input.tables?.collections[f.name]
    const user = table ? (input.userFields ?? []).filter((u) => u.TableName === table).sort((a, b) => a.Name.localeCompare(b.Name)) : []
    complexSections.push(
      '',
      `## ${f.name}: ${f.type}${f.collection ? '[]' : ''}`,
      ...grouped(standard(inner)),
      ...(table ? [`User fields (${table}):`, ...(user.length > 0 ? userBlock(user) : ['None.'])] : []),
    )
  }
  out.push(...complexSections)
  if (info.expand.length > 0) out.push('', `## Expand (navigation properties)`, info.expand.join(', '))
  return out.join('\n') + '\n'
}

/** `Fetched` and `OData version` of an existing ficha, or null when they cannot be read. */
export function readHeader(markdown: string): { fetchedAt: Date; odataVersion: string } | null {
  const fetched = new RegExp(`^- ${CONTEXT_HEADER.fetched}: (\\S+)`, 'm').exec(markdown)?.[1]
  const odata = new RegExp(`^- ${CONTEXT_HEADER.odata}: (v[12])`, 'm').exec(markdown)?.[1]
  const date = fetched ? new Date(fetched) : null
  return date && !Number.isNaN(date.getTime()) && odata ? { fetchedAt: date, odataVersion: odata } : null
}

/** The tables chosen with `--tables` that an existing ficha records, or null when it has none. */
export function readChosenTables(markdown: string): string[] | null {
  const line = new RegExp(`^- ${CHOSEN_TABLES}: (.+?)(?: \\(chosen by|\\r?$)`, 'm').exec(markdown)?.[1]
  return line ? line.split(', ') : null
}
