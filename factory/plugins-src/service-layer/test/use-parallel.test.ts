import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, readdir, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeSetup } from '../src/setup/setup.ts'
import { dumpRoot, contextDir, envDir } from '../src/common/layout.ts'
import { realCredentials } from './sl-env.ts'

const CLI = fileURLToPath(new URL('../src/use/cli.ts', import.meta.url))
const TSX = import.meta.resolve('tsx')

/** A real process, like the plugin's script: `node use.mjs ...` with the repo as working directory. */
function run(root: string, args: string[]): Promise<{ out: any; stdout: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['--import', TSX, CLI, ...args], { cwd: root, env: process.env })
    let stdout = ''
    child.stdout.on('data', (d) => (stdout += d))
    child.on('error', reject)
    child.on('close', () => {
      try {
        resolve({ out: JSON.parse(stdout), stdout })
      } catch {
        reject(new Error(`not JSON: ${stdout.slice(0, 200)}`))
      }
    })
  })
}

for (const version of ['v1', 'v2'] as const) {
  test(`${version}: 8 processes at once on an empty repo: one session, one ficha, one Volcado each`, async () => {
    const root = await mkdtemp(join(tmpdir(), 'sbo-par-'))
    await writeSetup({ root, versionB1: 'FP 2608', versionOData: version, environments: { dev: realCredentials() } })

    const results = await Promise.all(Array.from({ length: 8 }, () => run(root, ['traverse', 'Items', '--select', 'ItemCode', '--max-rows', '30'])))
    for (const { out } of results) {
      assert.equal(out.ok, true, JSON.stringify(out))
      assert.equal(out.resumen.contextoError, undefined, JSON.stringify(out))
      assert.equal(out.resumen.filas, 30)
    }
    // Each execution has its own Volcado, whole.
    const dirs = new Set(results.map((r) => r.out.resumen.ruta))
    assert.equal(dirs.size, 8)
    for (const dir of dirs) assert.equal((await readdir(join(dir, 'Items'))).length, 30)
    assert.equal((await readdir(dumpRoot(root, 'dev'))).length, 8)
    // One whole ficha, and no leftovers of the locks or of the temporary files.
    assert.deepEqual(await readdir(contextDir(root, 'dev')), ['Items.md'])
    assert.ok((await readFile(join(contextDir(root, 'dev'), 'Items.md'), 'utf8')).startsWith('# Items'))
    const files = await readdir(envDir(root, 'dev'))
    assert.deepEqual(files.sort(), ['context', 'credentials.json', 'data', 'session.json'])
    JSON.parse(await readFile(join(envDir(root, 'dev'), 'session.json'), 'utf8'))
    const config = await readFile(join(root, '.sbo-skills', 'service-layer', 'config.md'), 'utf8')
    assert.match(config, /versionOData/)
  })
}
