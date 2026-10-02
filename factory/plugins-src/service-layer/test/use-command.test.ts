import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { writeSetup } from '../src/setup/setup.ts'
import { main } from '../src/use/command.ts'
import { realCredentials } from './sl-env.ts'

test('CLI: get with --entorno, usage errors and unknown commands have stable codes', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sbo-'))
  await writeSetup({ root, versionB1: 'FP 2608', versionOData: 'v2', environments: { dev: realCredentials() } })
  const ok = await main(['get', 'BusinessPartners', 'C50000', '--entorno', 'dev'], root)
  assert.equal(ok.ok, true)
  assert.deepEqual(ok.resumen!.claves, ['C50000'])
  assert.equal((await main(['get', 'BusinessPartners'], root)).error!.code, 'INVALID_ARGUMENTS')
  assert.equal((await main(['frobnicate'], root)).error!.code, 'UNKNOWN_COMMAND')
  assert.equal((await main(['get', 'A', 'b', '--nope'], root)).error!.code, 'INVALID_ARGUMENTS')
})
