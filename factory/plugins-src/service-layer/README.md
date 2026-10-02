# service-layer plugin (source)

TypeScript source of the `service-layer` plugin (Setup, Uso and Documentation in one plugin, ADR 0010). The compiled output is what ships in `sbo-skills`; never edit it by hand.

## Tooling decisions

- **Package manager:** npm, with `package-lock.json`. Node >= 20 at runtime; development uses Node >= 22.
- **Bundler:** esbuild, one self-contained `.mjs` per CLI (`setup.mjs`, `use.mjs`), so the plugin needs no `node_modules`.
- **Types:** `tsc --noEmit` only (`npm run typecheck`); esbuild does the emit.
- **Tests:** `node:test`, run through `tsx`. Tests talk to the real Service Layer (see `TESTING.md`); only `test/request-unit.test.ts` (multipart, headers, classification, binary and file bodies) uses an injected transport, plus the 502 case.
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
- `request` writes a Volcado for what it brings back (see Request below); a 204 writes none.

## Parallel executions

Several `use.mjs` processes can run at once on the same repo, also from nothing. The login runs under a lock (`session.lock`, a folder) because the demo Service Layer fails parallel logins; whoever waits then uses the session that the first one opened. Everything that downloads `$metadata` (each ficha, the Índice de entidades) takes the same lock (`metadata.lock`, a folder): whoever waits finds the file ready. An execution downloads `$metadata` once, however many of them need it. Every file that is shared (`session.json`, the ficha, the index) is written aside and renamed; each Volcado has its own folder.

## Setup: why the developer runs it in their own terminal

`setup.mjs` with no arguments is a wizard (`src/setup/wizard.ts`). The AI's tools have no interactive terminal, and anything it runs or asks passes through its context, so the credentials would travel by chat. Decision: the skill tells the developer to run the script in a terminal of their own, where they type everything (the password without echo); the AI only runs `setup.mjs --status` afterwards (no credentials in the answer). Run without a TTY it stops with `NEEDS_TERMINAL`. The flag form (`--b1`, `--dev-url`, `SBO_SL_PASSWORD_DEV`...) stays for scripts and tests, and the skill forbids the AI to use it. Be clear about what this guarantees: the wizard path keeps the credentials out of the AI context (the script refuses to run without a TTY); the flag form does not, and only the skill's instruction keeps the AI from using it.

Limits: one extra step for the developer; the password stays in plain text in `credentials.json`; the AI cannot see why a login failed (the developer sees it in the terminal); terminal behaviour of the hidden password is not covered by automatic tests (TESTING.md).

## Request: any call, writes in seco first

`request <METHOD> <path>` (`src/use/request.ts`, ADR 0012) replaces the old `post`, `patch` and `delete`. The path is relative to the service root and is sent as written (only characters a URL cannot carry are percent-encoded, once); the saved OData version is added. Everything that is not a GET is a write (ADR 0008): without `--execute` it prints the exact request (`resumen.peticion`: method, full URL, headers, body, the sub-requests of a batch or the name, size and type of each file) and sends nothing; `--read` declares a POST a read (SQLQueries List) and it runs directly (refused for PATCH/PUT/DELETE, for uploads and for a batch with a non-GET sub-request). `prod` needs `--allow-prod` in the same call as `--execute` for a call that writes (`PROD_WRITE_NOT_ALLOWED` otherwise); a batch of only GETs needs none; the dry run on `prod` needs no mark. Like any operation on an entity, a request first applies the Contexto de objeto rule (per distinct entity set for a batch), so even a dry run may read (`$metadata`, `UserFieldsMD`).

- **Headers** (`src/use/headers.ts`): `--header "Name: value"`, repeatable, no allowlist. `Cookie`, `Host` and `Content-Length` are the tool's: `HEADER_RESERVED`. Line breaks and repeated headers are errors. With `--file` and `$batch` Content-Type is the tool's (`HEADER_CONFLICT`). The dry run shows the headers that will go, with `boundary=<generated>` for multipart, and never the cookie. No `If-Match` or `Prefer` of our own.
- **Body:** `--body` / `--body-file` (JSON, validated; UTF-16 files from PowerShell 5.1 are read), `--file` (multipart/form-data, field `files`), `--stream-file` (raw bytes, `Content-Type` by extension and `Slug` with the name). Files must be under 50 MB (the Service Layer's own limit), and the Setup's `credentials.json` and `session.json` are refused as body or file (`FILE_FORBIDDEN`).
- **`$batch`** (`src/use/multipart.ts`): `--body-file` holds `{"requests": [ request | {"changeset": [requests]} ]}`; the tool validates it (no GET in a changeset, unique Content-IDs, `$id` only to an earlier request of the same changeset), numbers changeset requests that have no `contentId`, builds the multipart/mixed body and parses the multipart answer (nested changeset, CRLF or LF). Answers are named by Content-ID (`part-N`, `part-N.M`, `changeset-N` when the SL answers once for a failed changeset); the batch stops at the first failure, which `resumen.aviso` says.
- **Answers** (`present` in `request.ts`): collection -> one file per record (+ `siguiente` for the nextLink, not followed); object -> one file; text or XML -> `response.<ext>`; binary -> `<Volcado>/<folder>/<name>` plus `_index.json` (name from Content-Disposition, `?filename=` or the path; made safe for any file system); batch -> one file per sub-response; 204 -> nothing. Answers over 100 MB are refused (`RESPONSE_TOO_LARGE`). `Login` and `Logout` cannot be requested (`PATH_RESERVED`).

## Where the tables of the user fields come from

The ficha takes the user fields only from `UserFieldsMD`, and needs the table of the entity: `$metadata` does not give it. In this order:

1. The plugin's own map (`tablesFor`, `src/use/metadata.ts`): marketing documents, stock transfers, `BusinessPartners`, `Items`, `Warehouses`, `JournalEntries`, `ProductionOrders`. Each entry is checked against the real Service Layer by `test/use-tables.test.ts`.
2. `U_<NAME>`: a user-defined table without a user object (table `@<NAME>`).
3. `UserObjectsMD('<entity set>')`: a user table registered as a user object is exposed under the object's code, and the Service Layer says its table and its child tables.
4. Otherwise "not resolved", and the developer can pass `context <Entity> --tables T1,T2`. Those tables are stored in the ficha (header line and `[--tables]` mark) and reused every time the ficha is regenerated; `--tables default` goes back to 1 to 3.

An entity that `$metadata` does not list gets no ficha and nothing is remembered about it: the operation goes ahead and the Service Layer answers for itself (see the index below).

## Entity index (Índice de entidades)

Two Markdown files per environment, next to `context/`: `entities-standard.md` (entity set names of SAP, sorted, one line; no types, no SQL tables) and `entities-user.md` (user tables from `UserTablesMD` with their description, user objects from `UserObjectsMD`, one line each; names only if either cannot be read). It is made from the `$metadata` of the saved OData version, entity sets only (no actions or functions), by `src/use/entity-index.ts`; it takes about 2400 tokens of names.

- **The Setup** makes the index of every configured environment after the login, with a login of its own that it closes (no session is left), and asks nothing. If it fails, a warning; the Setup does not fail.
- **The Uso** renews it from `openUse`, on any command, when it is missing, older than a week or made with another OData version, with no relation to the fichas (it shares the lock and the `$metadata` download with them: one download per execution). A failure never blocks the command: the answer carries `indiceError`. `entities [--refresh]` is the developer's way to ask for a new one; the AI never forces it.
- **`ENTITY_NOT_FOUND`**: the SL answers HTTP 400 with `Unrecognized resource path.` / `Invalid entityset 'X'.` (code 200) or `Service Not Found` (code -1002) for an entity set it does not know. `main` (`command.ts`) then looks at `$metadata` again, renews the index even if recent, and only if the entity really is not listed answers `ENTITY_NOT_FOUND`, with a message that sends to the two files. If `$metadata` does list it the SL's error stays as it was. There is no limit to those downloads. This replaces the old one-week `<Entity>.missing` file.

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
