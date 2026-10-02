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

## Reading: what writes a Volcado and what does not

- `page` and `traverse` write a Volcado (one file per record plus `_index.json`) and answer only the path, the row count and the keys (or the index path when there are more than 50). The records never enter the AI's context.
- `count` writes **no** Volcado, by design: it has no records, it answers one number. The Volcado exists so that a big answer does not overflow the context of the LLM; a number cannot.
- `get` writes a Volcado of one record.

## Parallel executions

Several `use.mjs` processes can run at once on the same repo, also from nothing. The login runs under a lock (`session.lock`, a folder) because the demo Service Layer fails parallel logins; whoever waits then uses the session that the first one opened. Each ficha is generated under its own lock (`context/<Entity>.md.lock`). Every file that is shared (`session.json`, the ficha) is written aside and renamed; each Volcado has its own folder.

## Where the tables of the user fields come from

The ficha takes the user fields only from `UserFieldsMD`, and needs the table of the entity: `$metadata` does not give it. In this order:

1. The plugin's own map (`tablesFor`, `src/use/metadata.ts`): marketing documents, stock transfers, `BusinessPartners`, `Items`, `Warehouses`, `JournalEntries`, `ProductionOrders`. Each entry is checked against the real Service Layer by `test/use-tables.test.ts`.
2. `U_<NAME>`: a user-defined table without a user object (table `@<NAME>`).
3. `UserObjectsMD('<entity set>')`: a user table registered as a user object is exposed under the object's code, and the Service Layer says its table and its child tables.
4. Otherwise "not resolved", and the developer can pass `context <Entity> --tables T1,T2`. Those tables are stored in the ficha (header line and `[--tables]` mark) and reused every time the ficha is regenerated; `--tables default` goes back to 1 to 3.

An entity that `$metadata` does not list is remembered for a week (`context/<Entity>.missing`) so that no operation downloads 2 MB again; only the developer's `--refresh` looks again.

## Plugin in `sbo-skills` after the build

```
plugins/service-layer/
  .claude-plugin/plugin.json
  skills/<skill>/SKILL.md      skills call the scripts below
  dist/setup.mjs
  dist/use.mjs
```

The skills reorganisation into this single plugin is done separately; until then the build only writes to `dist/` here.
