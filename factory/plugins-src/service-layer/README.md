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

## Setup: why the developer runs it in their own terminal

`setup.mjs` with no arguments is a wizard (`src/setup/wizard.ts`). The AI's tools have no interactive terminal, and anything it runs or asks passes through its context, so the credentials would travel by chat. Decision: the skill tells the developer to run the script in a terminal of their own, where they type everything (the password without echo); the AI only runs `setup.mjs --status` afterwards (no credentials in the answer). Run without a TTY it stops with `NEEDS_TERMINAL`. The flag form (`--b1`, `--dev-url`, `SBO_SL_PASSWORD_DEV`...) stays for scripts and tests, and the skill forbids the AI to use it. Be clear about what this guarantees: the wizard path keeps the credentials out of the AI context (the script refuses to run without a TTY); the flag form does not, and only the skill's instruction keeps the AI from using it.

Limits: one extra step for the developer; the password stays in plain text in `credentials.json`; the AI cannot see why a login failed (the developer sees it in the terminal); terminal behaviour of the hidden password is not covered by automatic tests (TESTING.md).

## Writes

`post`, `patch` and `delete` (`src/use/write.ts`, ADR 0008) are dry runs: without `--execute` they print the exact request (`resumen.peticion`: method, full URL with the saved OData version, body) and send no write. With `--execute` they send it and answer the SL status; a POST dumps the created record to a Volcado like a read. Bodies come from `--body` or `--body-file` and are sent as written (the dry run prints what they parse to). No `If-Match`, no `Prefer`: exactly what was asked.

`prod` needs `--allow-prod` in the same call as `--execute` (error `PROD_WRITE_NOT_ALLOWED` otherwise); the dry run on `prod` needs no mark. Like any operation on an entity, a write first applies the Contexto de objeto rule, so even a dry run may read (`$metadata`, `UserFieldsMD`) when the ficha is missing or old.

## Where the tables of the user fields come from

The ficha takes the user fields only from `UserFieldsMD`, and needs the table of the entity: `$metadata` does not give it. In this order:

1. The plugin's own map (`tablesFor`, `src/use/metadata.ts`): marketing documents, stock transfers, `BusinessPartners`, `Items`, `Warehouses`, `JournalEntries`, `ProductionOrders`. Each entry is checked against the real Service Layer by `test/use-tables.test.ts`.
2. `U_<NAME>`: a user-defined table without a user object (table `@<NAME>`).
3. `UserObjectsMD('<entity set>')`: a user table registered as a user object is exposed under the object's code, and the Service Layer says its table and its child tables.
4. Otherwise "not resolved", and the developer can pass `context <Entity> --tables T1,T2`. Those tables are stored in the ficha (header line and `[--tables]` mark) and reused every time the ficha is regenerated; `--tables default` goes back to 1 to 3.

An entity that `$metadata` does not list is remembered for a week (`context/<Entity>.missing`) so that no operation downloads 2 MB again; only the developer's `--refresh` looks again.

## Plugin in `sbo-skills`: generated, never edited there

`npm run publish-plugin -- ../../../sbo-skills/plugins/service-layer` (`publish.mjs`) writes the generated parts of the single plugin and replaces them on every run (same input, same output):

```
plugins/service-layer/
  .claude-plugin/plugin.json   by hand, in sbo-skills
  README.md                    by hand, in sbo-skills
  skills/setup/SKILL.md        from skills/setup/ here
  skills/use/SKILL.md          from skills/use/ here
  skills/docs/                 SKILL.md router + availability.md + reference/ from factory/docs-src/service-layer (PROGRESS.md and REVIEW.md do not ship)
  dist/setup.mjs, dist/use.mjs compiled from src/ (esbuild)
```

The docs router gets two changes at publish time: its name is `docs`, and a "Before answering" section that makes it read `.sbo-skills/service-layer/config.md` (stop and ask for the Setup if it is missing) and take `versionB1` from it. Skills call the scripts as `node "${CLAUDE_PLUGIN_ROOT}/dist/use.mjs"`.

`npm run build` still writes only `dist/` (to check the bundle); the product is written with `publish-plugin`. Then commit in `sbo-skills` and update the submodule pointer here.
