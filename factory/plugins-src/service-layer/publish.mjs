// Writes the generated parts of the plugin into the product repo. Usage: npm run publish-plugin -- <plugin dir>
//   dist/                 compiled Setup and Uso (esbuild)
//   skills/setup, use     from skills/ here
//   skills/docs           the built documentation (factory/docs-src/service-layer), with the Setup precondition added
// Everything it writes is replaced on each run, so the result is the same however many times it runs.
// The rest of the plugin (.claude-plugin/plugin.json, README.md) is written by hand in the product repo.
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const here = dirname(fileURLToPath(import.meta.url))
const target = process.argv[2] ? resolve(process.argv[2]) : null
if (!target) {
  console.error('Usage: npm run publish-plugin -- <plugin dir>, for example ../../../sbo-skills/plugins/service-layer')
  process.exit(1)
}
const docsSrc = resolve(here, '../../docs-src/service-layer')

const entries = { setup: 'src/setup/cli.ts', use: 'src/use/cli.ts' }
await rm(join(target, 'dist'), { recursive: true, force: true })
for (const [name, entry] of Object.entries(entries)) {
  await build({
    absWorkingDir: here,
    entryPoints: [entry],
    outfile: join(target, 'dist', `${name}.mjs`),
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'esm',
    banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" },
    legalComments: 'none',
  })
}

for (const skill of ['setup', 'use', 'docs']) await rm(join(target, 'skills', skill), { recursive: true, force: true })
for (const skill of ['setup', 'use']) {
  await mkdir(join(target, 'skills', skill), { recursive: true })
  await writeFile(join(target, 'skills', skill, 'SKILL.md'), normalise(await readFile(join(here, 'skills', skill, 'SKILL.md'), 'utf8')))
}

// Documentation: SKILL.md (router), availability.md (version gate) and reference/. PROGRESS.md and REVIEW.md are the factory's ledgers and do not ship.
const docsDir = join(target, 'skills', 'docs')
await mkdir(docsDir, { recursive: true })
await cp(join(docsSrc, 'reference'), join(docsDir, 'reference'), { recursive: true })
await writeFile(join(docsDir, 'availability.md'), normalise(await readFile(join(docsSrc, 'availability.md'), 'utf8')))
await writeFile(join(docsDir, 'SKILL.md'), docsSkill(normalise(await readFile(join(docsSrc, 'SKILL.md'), 'utf8'))))

const count = async (dir) => (await readdir(dir, { recursive: true, withFileTypes: true })).filter((d) => d.isFile()).length
console.log(`plugin written to ${target}: dist (2 files), skills/setup, skills/use, skills/docs (${await count(docsDir)} files)`)

function normalise(text) {
  return text.replace(/\r\n/g, '\n')
}

/** The docs router, renamed for the single plugin and with the Setup precondition (config.md, Versión de B1). */
function docsSkill(text) {
  const name = 'name: docs-service-layer'
  const heading = '# SAP Business One Service Layer\n'
  if (!text.includes(name) || !text.includes(heading)) throw new Error('docs-src SKILL.md has changed shape: update publish.mjs')
  const before = `## Before answering

1. Read \`.sbo-skills/service-layer/config.md\`. If it does not exist, **stop**: tell the developer to run the **setup** skill first, and do not answer from this documentation without it.
2. Take \`versionB1\` (for example \`FP 2608\`) from its front matter. Apply the "Version gate" section below: it says when to open \`availability.md\`, which lists the whole sections that do not exist in older versions.
3. \`versionOData\` (\`v1\` is OData V3, \`v2\` is OData V4) is the version the **use** skill calls; keep examples in line with it.
`
  return text.replace(name, 'name: docs').replace('Use when writing or debugging code', 'Needs the Setup done (reads .sbo-skills/service-layer/config.md for the B1 version). Use when writing or debugging code').replace(heading, `${heading}\n${before}`)
}
