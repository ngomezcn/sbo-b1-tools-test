/** An invalid `$filter` on a page and on `/$count`: the SL error comes out literal and short, never as markup. */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { writeSetup } from '../src/setup/setup.ts'
import { main } from '../src/use/command.ts'
import { defaultTransport, type Transport } from '../src/common/sl.ts'
import { live, realCredentials } from './sl-env.ts'

async function repo(versionOData: 'v1' | 'v2') {
  const root = await mkdtemp(join(tmpdir(), 'sbo-'))
  await writeSetup({ root, versionB1: 'FP 2608', versionOData, environments: { dev: realCredentials() } })
  return root
}

for (const version of ['v1', 'v2'] as const) {
  test(`${version}: a $filter on a field that does not exist, or with a syntax error, gives the SL error as is (page and count)`, async () => {
    const root = await repo(version)
    // v1 gives the code as a number and v2 as a string: the plugin keeps it as received.
    const code = version === 'v1' ? 201 : '201'
    for (const command of [['page', 'Orders', '--top', '1'], ['count', 'Orders'], ['traverse', 'Orders']]) {
      const noField = await live(root, () => main([...command, '--filter', 'NoSuchField eq 1'], root))
      assert.deepEqual(noField, { ok: false, status: 400, resumen: null, error: { code, message: "Property 'NoSuchField' is invalid" } }, command[0])
      const syntax = await live(root, () => main([...command, '--filter', 'DocEntry eq'], root))
      assert.deepEqual(syntax, { ok: false, status: 400, resumen: null, error: { code, message: 'Query string error - Invalid filter condition' } }, command[0])
    }
  })
}

test('a proxy answering HTML (the 502 seen once on the demo, not reproducible later) comes out as one short line', async () => {
  const root = await repo('v2')
  // The real SL did not give that 502 again (TESTING.md), so only this test fakes the answer, and only for the data request.
  const proxy: Transport = async (request) =>
    /\/Orders\/\$count/.test(request.url)
      ? { status: 502, headers: new Headers(), text: '<!DOCTYPE HTML><html><head><title>502 Proxy Error</title></head><body><h1>Proxy Error</h1><p>The proxy server received an invalid response</p></body></html>' }
      : defaultTransport(request)
  const out = await live(root, () => main(['count', 'Orders', '--filter', 'NoSuchField eq 1'], root, { transport: proxy }))
  assert.deepEqual(out, { ok: false, status: 502, resumen: null, error: { code: undefined, message: 'HTTP 502: 502 Proxy Error' } })
})
