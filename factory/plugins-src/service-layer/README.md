# service-layer plugin (source)

TypeScript source of the `service-layer` plugin (Setup, Uso and Documentation in one plugin, ADR 0010). The compiled output is what ships in `sbo-skills`; never edit it by hand.

## Tooling decisions

- **Package manager:** npm, with `package-lock.json`. Node >= 20 at runtime; development uses Node >= 22.
- **Bundler:** esbuild, one self-contained `.mjs` per CLI (`setup.mjs`, `use.mjs`), so the plugin needs no `node_modules`.
- **Types:** `tsc --noEmit` only (`npm run typecheck`); esbuild does the emit.
- **Tests:** `node:test`, run through `tsx`. No mocks of Service Layer: tests talk to the real one (see `TESTING.md`).
- **HTTP / TLS:** `undici` (v6, Node >= 18.17) with an `Agent` that does not validate the certificate (ADR 0009). Bundled into the output.

Everything runs from this folder: `npm test`, `npm run typecheck`, `npm run build` (writes `dist/`; `-- --out <dir>` to choose another).

## Layout

```
src/common/   shared code (plain folder): layout of .sbo-skills/service-layer/, versions, errors, HTTP
src/setup/    Setup logic and CLI
src/use/      Uso commands and CLI
test/
```

`src/common/layout.ts` is the only place that knows the format of `.sbo-skills/service-layer/` (paths, `config.md`, `credentials.json`).

## Plugin in `sbo-skills` after the build

```
plugins/service-layer/
  .claude-plugin/plugin.json
  skills/<skill>/SKILL.md      skills call the scripts below
  dist/setup.mjs
  dist/use.mjs
```

The skills reorganisation into this single plugin is done separately; until then the build only writes to `dist/` here.
