---
name: use
description: Operate against a real SAP Business One Service Layer from this repo - read entities (by key, a page, a full traversal, a count), read the object context of an entity (fields, user fields, valid values), find which entities an environment exposes, and make any other call the Service Layer allows (create, update, delete, actions, $batch, SQL queries, custom headers, file upload and download) with the generic request command and its dry-run-first write flow. Use when the task needs live data from, or a change in, a configured B1 environment (dev, uat, prod). Needs the Setup done first.
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
| `get <EntitySet> <key>` | One record. A string key made only of digits must be quoted: `'123'`. A composite key is written as OData does: `"TableName='OCRD',FieldID=0"`. |
| `page <EntitySet> [--top N] [--skip N]` | One page (20 rows by default). |
| `traverse <EntitySet> [--max-rows N]` | Follows `nextLink` up to the cap (1000 by default); `truncado` says if it was cut. |
| `count <EntitySet>` | Only the number of rows. |
| `context <EntitySet> [--show]` | The object context of the entity (see below). |
| `entities` | Where the entity index is (see below). Not needed to read it: the files are always at `.sbo-skills/service-layer/<environment>/`. |
| `clean <id or path>` | Deletes that Volcado. |

`page`, `traverse` and `get` accept `--filter`, `--select`, `--orderby`, `--expand`, passed to the Service Layer as written. Records never come back in the answer: they are written to a Volcado (`ruta`), with `_index.json` and one file per record. Read the files you need from that folder, and run `clean` when done.

## Object context

Before you build a body or a `$select` for an entity, read its ficha: the answer of any command on that entity gives its path as `contexto`. It lists standard and user fields (`U_*`), their type, whether they can be empty and the valid values. The tool regenerates it by itself when it is missing or more than a week old, and the developer can ask for a new one with `context <EntitySet> --refresh` (or `--refresh-context` on any command). You never regenerate it on your own.

## Entity index

Two Markdown files per environment, in `.sbo-skills/service-layer/<environment>/`, that say which entities exist there. They hold names only, no fields (the ficha has those):

- `entities-standard.md`: the standard SAP entity sets (`BusinessPartners`, `Orders`, ...), sorted, in one comma-separated line. Read it to find the right name of a standard entity.
- `entities-user.md`: the user-defined ones, one line each, marked `user table` (entity set `U_<TABLE>`, with its description) or `user object` (entity set is the object code). Read it to find a custom table or object of this company.

**Try on your own first.** You usually know the entity (`BusinessPartners`, `Items`, `Orders`): use it. Read an index file only when you are not sure which entity to use, or after `ENTITY_NOT_FOUND`. Read only the file that fits (standard or user), not both by default.

`ENTITY_NOT_FOUND` means the Service Layer said the entity does not exist and the tool checked `$metadata` again just now: the name is wrong, or the entity is not exposed. Read the index (the error names both files), pick the right name and retry. Do not guess names, and do not repeat the same name.

The tool makes the index in the Setup and renews it by itself, on any command, when it is more than a week old. If it could not (`resumen.indiceError`) the operation still ran: mention it to the developer. You never ask for a new index on your own; the developer can run `entities --refresh` (for example for a table created a moment ago that a Service Layer node does not list yet).

## Any call: `request`

```
request <GET|POST|PATCH|PUT|DELETE> <path> [--header "Name: value"]... [--body '<json>' | --body-file <path> | --file <path>... | --stream-file <path>] [--read] [--execute] [--allow-prod]
```

`<path>` is what follows the service root, as the Service Layer documents it: `BusinessPartners('C1')`, `Orders(5)/Cancel`, `SQLQueries('q')/List`, `Items?$filter=ItemCode eq 'A1'`, `$batch`. Do not write `/b1s/v2` (the tool adds the saved OData version) and quote the path in the shell (`$` and `'`). The tool logs in by itself: `Login` and `Logout` are refused. For how a call behaves (which verb, which body, which header), use the **docs** skill.

**Read or write.** A GET runs directly. Everything else is a write, a read-only POST included: it is a dry run until `--execute`. If the developer or the docs say a POST only reads (`SQLQueries('q')/List`), add `--read` and it runs directly (not for PATCH, PUT or DELETE, and not with a file). Never use `--read` to skip the approval of something that changes data.

**Writing flow** (the same for every non-GET call):

1. Read the ficha of the entity, then run the call **without** `--execute`.
2. Show the developer `resumen.peticion` as is (method, full URL, headers, and the body, the sub-requests or the files) and the environment (`resumen.entorno`).
3. Wait for the developer to approve in words. Do not run `--execute` before that.
4. Repeat the same call, unchanged, adding `--execute`. Report `status`.

Rules:

- If the developer asks to change the request after seeing it, start again at step 2 with a new dry run.
- **Authority total** (the developer lets you write without asking again, for one session) is granted only by the developer, in their own words. Never propose it, never assume it, and do not carry it into another session.
- `prod` needs `--allow-prod` in the call, besides `--execute`, for any call that writes (a batch of only GETs does not). Add it only when the developer has approved that production write explicitly; an earlier approval or Authority total does not cover it. Without it the tool answers `PROD_WRITE_NOT_ALLOWED` and sends nothing.
- The tool sends exactly what you give it. It adds no `If-Match`, ETag or `Prefer`. Do not ask for them unless the developer wants them.
- `--body` takes JSON in one string; on Windows or with quotes and accents, write the JSON to a UTF-8 file and use `--body-file`. A POST may have no body (actions such as `Orders(5)/Close`).

**Headers.** `--header "Name: value"`, as many times as needed: `B1S-ReplaceCollectionsOnPatch: true`, `Prefer: return-no-content`, `If-Match: W/"..."`, `B1S-CaseInsensitive: true`. Any header goes through. Only `Cookie`, `Host` and `Content-Length` belong to the tool: they answer `HEADER_RESERVED`. `Content-Type` is set for you (JSON body, `$batch`, files); with a JSON body you may give your own.

**What comes back.** As in the reads, records never enter the answer: they are written to a Volcado (`ruta`) and `resumen.tipo` says what it holds.

| `tipo` | Volcado | Also in `resumen` |
|---|---|---|
| `coleccion` (a `value` list) | one file per record, `_index.json` | `filas`, `claves` or `indice`, `siguiente` (the nextLink, not followed: use `page` or `traverse` to read many) |
| `objeto` | one file (`archivo`) | `claves` |
| `texto`, `binario` | one file (`archivo`, `nombre`, `bytes`) | `contentType` |
| `lote` | one file per sub-response, named with its Content-ID (a binary sub-response is also saved as a file; its `.json` has `body.archivo`) | `subrespuestas` (`id`, `estado`, the literal `error`), `errores`, `aviso` |
| `vacio` (204) | none | `status` |

`cabecerasRespuesta` carries ETag, Location, OData-EntityId and Preference-Applied when the Service Layer sends them. Run `clean` when you are done with the Volcado.

**`$batch`.** `request POST '$batch' --body-file batch.json`. The file lists the sub-requests; the tool builds the multipart body and parses the answer:

```json
{ "requests": [
  { "method": "GET", "path": "Items('i001')", "contentId": "read" },
  { "changeset": [
    { "method": "POST", "path": "Orders", "contentId": "1", "body": { "CardCode": "C1", "DocumentLines": [] } },
    { "method": "PATCH", "path": "$1", "contentId": "2", "headers": { "B1S-ReplaceCollectionsOnPatch": "true" }, "body": { "Comments": "x" } }
  ] }
] }
```

A `changeset` is atomic (all or nothing) and holds no GET; `$1` refers to the request with `contentId` 1 of the same changeset; a changeset request with no `contentId` gets the next free number. The dry run lists every sub-request. The batch stops at the first failure and the answer says so (`aviso`); the outer status is 200 even then, so read `errores` and `subrespuestas`. `--read` is only for a batch of GETs.

**Files.** `request POST Attachments2 --file report.pdf [--file other.png]` uploads as multipart/form-data (one attachment, several lines); `request PATCH "Attachments2(3)" --file x.txt` replaces or adds a line; `request PATCH "ItemImages('A1')" --file photo.jpg` sets an item image; `--stream-file x.jpg` sends the raw bytes with the name in `Slug` (`Attachments2`, `Pictures`; FP 2202 and later). The dry run shows name, size and type, never the bytes. A file is read relative to where the command runs, must be under 50 MB (`FILE_TOO_LARGE`), and the Setup's own files are refused (`FILE_FORBIDDEN`). Download with a GET: `request GET "Attachments2(3)/$value?filename='line2.png'"` or `request GET "ItemImages('A1')/$value"`. The file is saved in the Volcado and `resumen.archivo` is its full path (answers over 100 MB are refused). Tell the developer where the file is; do not open binaries.

**What has been run against a real Service Layer.** Headers (including `B1S-ReplaceCollectionsOnPatch`), `$batch` with a changeset and `$1`, a rolled-back changeset, a read POST (`SQLQueries('q')/List`), actions (`Orders(5)/Cancel`) and plain CRUD are verified live (TESTING.md). **Attachments and images are unit-tested only:** the test Service Layer has no usable attachment or picture folder, so the upload and download were not completed end to end; the Service Layer's own answer (`-5002`, `PicturesFolderPath could not be found`) is its server configuration, not the request.

If the Service Layer answers an unknown field (`Property 'X' of 'Y' is invalid`) or a missing field, report its error literally. Read the first lines of the ficha and tell the developer its date (the `Fetched` line) so they can decide whether it is out of date. Do **not** regenerate it yourself; if the developer wants it, they ask for `--refresh`.

## Documentation

For how a Service Layer feature behaves, use the **docs** skill, not this one.
