import { mkdir, rm, writeFile } from 'node:fs/promises'
import { baseUrl, defaultTransport, login, logout, request, type HttpRequest, type Transport } from '../src/common/sl.ts'
import { ENVIRONMENTS } from '../src/common/versions.ts'
import { envDir, sessionPath, standardIndexPath, userIndexPath, type Credentials } from '../src/common/layout.ts'
import { getByKey, type GetOptions } from '../src/use/get.ts'
import type { UseOutput } from '../src/use/output.ts'

/** Credentials of the real demo Service Layer, from the repo-root .env (SL_URL, SL_COMPANY, SL_USER, SL_PASSWORD). */
export function realCredentials(): Credentials {
  const { SL_URL, SL_COMPANY, SL_USER, SL_PASSWORD } = process.env
  if (!SL_URL || !SL_COMPANY || !SL_USER || !SL_PASSWORD) {
    throw new Error('Set SL_URL, SL_COMPANY, SL_USER and SL_PASSWORD (the repo-root .env is loaded by `npm test`).')
  }
  return { url: SL_URL, companyDB: SL_COMPANY, userName: SL_USER, password: SL_PASSWORD }
}

/** Real transport that also records every request. */
export function recording(record: HttpRequest[]): Transport {
  return (request) => (record.push(request), defaultTransport(request))
}

/** Like `recording`, but keeps only the requests the SL answered with 2xx (a retry on the broken demo node does not count). */
export function recordingOk(record: HttpRequest[]): Transport {
  return async (request) => {
    const response = await defaultTransport(request)
    if (response.status >= 200 && response.status < 300) record.push(request)
    return response
  }
}

const isBrokenSession = (out: UseOutput) => out.status === 500 && Number(out.error?.code) === 407

/**
 * The demo SL sometimes leaves a fresh session unusable: every read on it answers HTTP 500, code 407
 * ("Table definition not found for '@ZZVF_T'"), while the same read works on another session (TESTING.md).
 * Tests that need a successful read retry with a new session; `retried.count` says how many times.
 */
export const retried = { count: 0 }

export async function live(root: string, run: () => Promise<UseOutput>): Promise<UseOutput> {
  for (let attempt = 0; ; attempt++) {
    const out = await run()
    if (!isBrokenSession(out) || attempt >= 5) return out
    retried.count++
    for (const env of ENVIRONMENTS) await rm(sessionPath(root, env), { force: true })
  }
}

export interface UserFieldSpec {
  Name: string
  TableName: string
  Type: string
  Size?: number
  SubType?: string
  Description: string
  Mandatory?: 'tYES' | 'tNO'
  DefaultValue?: string
  ValidValuesMD?: { Value: string; Description: string }[]
}

/** Creates the user fields in the real demo company if they are not there yet (the demo is disposable, see 00-comun). */
export async function ensureUserFields(specs: UserFieldSpec[]): Promise<void> {
  const credentials = realCredentials()
  for (let attempt = 0; ; attempt++) {
    const { cookie } = await login(credentials, 'v2')
    try {
      for (const spec of specs) {
        const filter = encodeURIComponent(`Name eq '${spec.Name}' and TableName eq '${spec.TableName}'`)
        const found = await request(defaultTransport, credentials, 'v2', 'GET', `UserFieldsMD?$filter=${filter}&$select=Name`, cookie)
        if ((JSON.parse(found.text).value as unknown[]).length > 0) continue
        const created = await defaultTransport({
          method: 'POST',
          url: `${baseUrl(credentials.url, 'v2')}/UserFieldsMD`,
          headers: { Cookie: cookie, 'Content-Type': 'application/json' },
          body: JSON.stringify(spec),
        })
        if (created.status !== 201) throw new Error(`Could not create ${spec.TableName}.${spec.Name}: ${created.status} ${created.text.slice(0, 200)}`)
      }
      return
    } catch (e) {
      // A fresh session may land on the broken demo node (407, see TESTING.md): try again with another one.
      if (attempt >= 5 || Number((e as { code?: unknown }).code) !== 407) throw e
    } finally {
      await logout(credentials, 'v2', cookie).catch(() => {})
    }
  }
}

export const getLive = (options: GetOptions) => live(options.root, () => getByKey(options))

export interface Admin {
  /** `Cookie` header of this session (B1SESSION and ROUTEID): the same node answers every request with it. */
  cookie: string
  call(method: string, path: string, body?: unknown): Promise<{ status: number; json: any; text: string }>
  close(): Promise<void>
}

/**
 * A v2 session of its own for setting up (and removing) data in the disposable demo company. A session that lands on a broken
 * node (407 on any read, see TESTING.md) is replaced.
 */
export async function admin(): Promise<Admin> {
  const credentials = realCredentials()
  for (let attempt = 0; ; attempt++) {
    const { cookie } = await login(credentials, 'v2')
    const call: Admin['call'] = async (method, path, body) => {
      const r = await defaultTransport({
        method,
        url: `${baseUrl(credentials.url, 'v2')}/${path}`,
        headers: { Cookie: cookie, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
        body: body === undefined ? undefined : JSON.stringify(body),
      })
      let json: any
      try {
        json = JSON.parse(r.text)
      } catch {
        /* no body, or not JSON */
      }
      return { status: r.status, json, text: r.text }
    }
    const close = () => logout(credentials, 'v2', cookie).catch(() => {})
    const probe = await call('GET', "BusinessPartners('C50000')?$select=CardCode")
    if (probe.status === 200) return { cookie, call, close }
    await close()
    if (attempt >= 8) throw new Error(`no usable session: ${probe.status}`)
  }
}

/**
 * Creates a user-defined table (and its fields) in the demo company if it is not there. `kind`: `bott_NoObject`, `bott_MasterData`...
 * With `keepOpen` the session used stays open and is returned: it is on the node that served the creation, the only one that lists
 * the new table for a while.
 */
export async function ensureUserTable(name: string, kind: string, fields: { Name: string; Size?: number; Mandatory?: 'tYES' | 'tNO'; Description?: string }[], keepOpen = false): Promise<Admin> {
  const a = await admin()
  try {
    if ((await a.call('GET', `UserTablesMD('${name}')`)).status !== 200) {
      const made = await a.call('POST', 'UserTablesMD', { TableName: name, TableDescription: `${name} test table`, TableType: kind })
      if (made.status !== 201) throw new Error(`Could not create table ${name}: ${made.text.slice(0, 200)}`)
    }
    for (const f of fields) {
      const found = await a.call('GET', `UserFieldsMD?$filter=${encodeURIComponent(`Name eq '${f.Name}' and TableName eq '@${name}'`)}&$select=Name`)
      if (found.json.value.length > 0) continue
      const made = await a.call('POST', 'UserFieldsMD', { Type: 'db_Alpha', Size: 20, Description: f.Name, ...f, TableName: `@${name}` })
      if (made.status !== 201) throw new Error(`Could not create @${name}.${f.Name}: ${made.text.slice(0, 200)}`)
    }
    return a
  } finally {
    if (!keepOpen) await a.close()
  }
}

/** Registers a user object over a user table, with child tables, if it is not registered yet. */
export async function ensureUserObject(code: string, kind: string, children: string[] = []): Promise<void> {
  const a = await admin()
  try {
    if ((await a.call('GET', `UserObjectsMD('${code}')?$select=Code`)).status === 200) return
    const made = await a.call('POST', 'UserObjectsMD', {
      Code: code,
      Name: code,
      TableName: code,
      ObjectType: kind,
      CanCreateDefaultForm: 'tNO',
      CanFind: 'tYES',
      CanLog: 'tNO',
    })
    if (made.status !== 201) throw new Error(`Could not register user object ${code}: ${made.text.slice(0, 200)}`)
    if (children.length > 0) {
      // Child tables go in a second step: that is how it was checked live.
      const patched = await a.call('PATCH', `UserObjectsMD('${code}')`, { UserObjectMD_ChildTables: children.map((TableName, i) => ({ TableName, ObjectName: TableName, SonNumber: i + 1 })) })
      if (patched.status !== 204) throw new Error(`Could not add child tables to ${code}: ${patched.text.slice(0, 200)}`)
    }
  } finally {
    await a.close()
  }
}

/**
 * An admin session on a node whose Service Layer lists `entitySet` (a table created a moment ago is listed only on the node
 * that served its creation, for a while; see TESTING.md). Sessions are tried until one lists it.
 */
export async function adminSeeing(entitySet: string, attempts = 30): Promise<Admin> {
  for (let i = 0; ; i++) {
    const a = await admin()
    if ((await a.call('GET', `${entitySet}?$top=1&$select=Code`)).status === 200) return a
    await a.close()
    if (i >= attempts) throw new Error(`No node lists ${entitySet} after ${attempts} sessions`)
  }
}

/** Puts `cookie` where the Uso keeps its session, so the next execution talks to the same node as the one that created the data. */
export async function seedSession(root: string, cookie: string): Promise<void> {
  await mkdir(envDir(root, 'dev'), { recursive: true })
  await writeFile(sessionPath(root, 'dev'), JSON.stringify({ cookie, lastUsedAt: new Date().toISOString() }))
}

/** Removes a user-defined table (and its rows and fields). */
export async function dropUserTable(name: string): Promise<void> {
  const a = await admin()
  try {
    const gone = await a.call('DELETE', `UserTablesMD('${name}')`)
    if (gone.status !== 204 && gone.status !== 404) throw new Error(`Could not drop ${name}: ${gone.status} ${gone.text.slice(0, 200)}`)
  } finally {
    await a.close()
  }
}

/** A recent Índice de entidades in `root`, so that a test about something else does not download `$metadata` for it. */
export async function plantIndex(root: string, fetchedAt = new Date(), odata = 'v2'): Promise<void> {
  const header = (title: string) => `# ${title}

- Fetched: ${fetchedAt.toISOString()}
- OData version: ${odata} (B1 FP 2608)

`
  await mkdir(envDir(root, 'dev'), { recursive: true })
  await writeFile(standardIndexPath(root, 'dev'), `${header('Standard SAP entities')}BusinessPartners, Items, Orders
`)
  await writeFile(userIndexPath(root, 'dev'), `${header('User-defined entities')}None.
`)
}
