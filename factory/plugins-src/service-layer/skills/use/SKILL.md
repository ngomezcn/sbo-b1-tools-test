---
name: use
description: Operate against a real SAP Business One Service Layer from this repo - read entities (by key, a page, a full traversal, a count), read the object context of an entity (fields, user fields, valid values), and create, update or delete records with the dry-run-first write flow. Use when the task needs live data from, or a change in, a configured B1 environment (dev, uat, prod). Needs the Setup done first.
---

# Service Layer: use

Run every command with `node "${CLAUDE_PLUGIN_ROOT}/dist/use.mjs" <command> ...` from the repo root. Every answer is short JSON: `ok`, `status` (HTTP status of the Service Layer, `null` when the failure is the tool's own), `resumen`, and on failure `error` with `code` and `message`.

- A Service Layer error (`status` is a number) is literal: report its code and message as received.
- A tool error (`status` is `null`) has a stable code and says what to do. `SETUP_MISSING`, `ENVIRONMENT_NOT_CONFIGURED`: run the **setup** skill; do not create files by hand.
- With several environments configured, pass `--entorno dev|uat|prod` on every call. With one, it is used.
- Never read `.sbo-skills/service-layer/*/credentials.json` or `session.json`, and never print them. The tool logs in by itself.
- The OData version (`v1` or `v2`) is the one the Setup saved. Do not change it.

## Reading

| Command | Does |
|---|---|
| `get <EntitySet> <key>` | One record. A string key made only of digits must be quoted: `'123'`. |
| `page <EntitySet> [--top N] [--skip N]` | One page (20 rows by default). |
| `traverse <EntitySet> [--max-rows N]` | Follows `nextLink` up to the cap (1000 by default); `truncado` says if it was cut. |
| `count <EntitySet>` | Only the number of rows. |
| `context <EntitySet> [--show]` | The object context of the entity (see below). |
| `clean <id or path>` | Deletes that Volcado. |

`page`, `traverse` and `get` accept `--filter`, `--select`, `--orderby`, `--expand`, passed to the Service Layer as written. Records never come back in the answer: they are written to a Volcado (`ruta`), with `_index.json` and one file per record. Read the files you need from that folder, and run `clean` when done.

## Object context

Before you build a body or a `$select` for an entity, read its ficha: the answer of any command on that entity gives its path as `contexto`. It lists standard and user fields (`U_*`), their type, whether they can be empty and the valid values. The tool regenerates it by itself when it is missing or more than a week old, and the developer can ask for a new one with `context <EntitySet> --refresh` (or `--refresh-context` on any command). You never regenerate it on your own.

## Writing: POST, PATCH, DELETE

```
post   <EntitySet> --body '<json>' | --body-file <path>
patch  <EntitySet> <key> --body '<json>' | --body-file <path>
delete <EntitySet> <key>
```

They are dry runs by default: without `--execute` nothing is written, and `resumen.peticion` shows the exact request (`metodo`, full `url` with the saved OData version, `cuerpo`). Follow this order:

1. Read the ficha of the entity, then run the command **without** `--execute`.
2. Show the developer `resumen.peticion` as is: method, URL and body, and the environment (`resumen.entorno`).
3. Wait for the developer to approve in words. Do not run `--execute` before that.
4. Repeat the same call, unchanged, adding `--execute`. Report `status` and, for a POST, the key in `claves` (the created record is in the Volcado, `ruta`).

Rules:

- If the developer asks to change the request after seeing it, start again at step 2 with a new dry run.
- **Authority total** (the developer lets you write without asking again, for one session) is granted only by the developer, in their own words. Never propose it, never assume it, and do not carry it into another session.
- `prod` needs `--allow-prod` in the call, besides `--execute`. Add it only when the developer has approved that production write explicitly; an earlier approval or Authority total does not cover it. Without it the tool answers `PROD_WRITE_NOT_ALLOWED` and sends nothing.
- The tool sends exactly what you give it. It adds no `If-Match` or ETag. Do not ask for them unless the developer wants optimistic concurrency, and then they say so.
- `--body` takes JSON in one string; on Windows or with quotes and accents, write the JSON to a UTF-8 file and use `--body-file`.
- Out of scope for this tool: `$batch`, actions (close, cancel), attachments, SQL queries and views, user-defined objects (UDO).

If the Service Layer answers an unknown field (`Property 'X' of 'Y' is invalid`) or a missing field, report its error literally. Check the field against the ficha, and tell the developer the date of the ficha (`Fetched` in its header) so they can decide whether it is out of date. Do **not** regenerate it yourself; if the developer wants it, they ask for `--refresh`.

## Documentation

For how a Service Layer feature behaves, use the **docs** skill, not this one.
