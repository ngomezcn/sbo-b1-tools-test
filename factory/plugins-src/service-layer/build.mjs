// Bundles each CLI into one dependency-free .mjs file. Usage: npm run build [-- --out <dir>]
import { build } from 'esbuild'
import { existsSync } from 'node:fs'

const out = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : 'dist'
const entries = { setup: 'src/setup/cli.ts', use: 'src/use/cli.ts' }

for (const [name, entry] of Object.entries(entries)) {
  if (!existsSync(entry)) continue
  await build({
    entryPoints: [entry],
    outfile: `${out}/${name}.mjs`,
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'esm',
    banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" },
  })
}
