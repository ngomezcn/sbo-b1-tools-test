# Profile: OData sources for docs-service-layer

Everything specific to these sources lives here. The rest of the skill (flow, role files, formats) is source-agnostic.

## Paths

| Name | Path |
|---|---|
| `PINS` | `.claude/skills/build-docs-from-odata/pins.json` (sources, versions, `retrieved` date; the only place with source URLs and the commit) |
| `WORK` | `factory/.work/odata` (extraction output, git-ignored, rebuilt each run except `_cache/`) |
| `DOCS` | `factory/docs-src/odata-staging` (staging: hojas in `DOCS/reference/odata/<bloque>/`, ledger `DOCS/PROGRESS.md`, `DOCS/PENDING-REVIEW.md`) |
| `SL` | `factory/docs-src/service-layer` (read-only: target of "In Service Layer:" lines, source of sl-hits) |
| Final home | `SL/reference/odata/` (moving `DOCS/reference/odata/` there is a pending item for the user; until then `DOCS` is the staging folder) |

Scripts: `factory/scripts/extract_odata.py` and `factory/scripts/verify_odata_block.py`. Flags are in their `--help`; defaults match this table.

## Sources

| Origin | Source | Version tag | Used parts |
|---|---|---|---|
| `oasis-p1` | OData 4.01 Part 1: Protocol | `v4.01-os` | all numbered sections |
| `oasis-p2` | OData 4.01 Part 2: URL Conventions | `v4.01-os` | all numbered sections |
| `oasis-json` | OData JSON Format 4.01 | `v4.01-os` | all numbered sections |
| `oasis-csdl` | OData CSDL XML 4.01 | `v4.01-os` | all numbered sections |
| `ms` | MicrosoftDocs/OData-docs on GitHub, CC-BY-4.0 | 7-char commit (`3ca8f5b`) | `Odata-docs/overview.md` and `Odata-docs/concepts/*.md`; `derived-types-adv.md` is a stub: skip |

All OASIS documents are OASIS Standard `os`, 23 April 2020. `retrieved` is fixed in `PINS` (2026-10-02); hojas copy it from there, never the run date. Note the folder spelling `Odata-docs`.

Fragment ids: OASIS `<origin>-<number>` (`oasis-p1-8.3.2`); Microsoft `ms-<file-stem>` for a whole file and `ms-<file-stem>--<heading-slug>` for a `##` section. The `source` grammar of hojas is in `leaf-format.md`.

Expected `extract_odata.py` output (printed at the end of a run; any difference means a pin or the script changed). Code blocks and tables are counted per node's own text, so descendants are not counted twice. Warning groups: 0 (`WORK/warnings.md` has only the by-design exclusions and the conversion notes).

| Origin | nodes | fragments over 400 lines | code blocks | tables | warning groups |
|---|---|---|---|---|---|
| `oasis-p1` | 147 | 6 (`8`, `10`, `11`, `11.2`, `11.4`, `11.7`) | 125 | 2 | 0 |
| `oasis-p2` | 47 | 4 (`4`, `5`, `5.1`, `5.1.1`) | 175 | 1 | 0 |
| `oasis-json` | 79 | 0 | 61 | 0 | 0 |
| `oasis-csdl` | 116 | 2 (`14`, `14.4`) | 89 | 4 | 0 |
| `ms` | 35 | 1 (`queryoptions-usage`) | 26 | 0 | 0 |
| total | 424 | 13 | 476 | 7 | 0 |

The OASIS HTML holds 4 (P1), 2 (P2), 1 (JSON) and 5 (CSDL) tables; the rest sit in excluded chapters or appendices. `ms` has 35 nodes: 9 files (`overview` and 8 concept files) plus 26 `##` sections.

Manifest facts (`WORK/manifest.json`, script version 1). Microsoft commit `3ca8f5b9f602aaa561f5bbc2df67fc6f0911c7e6`. SHA-256 of the downloaded OASIS HTML (a different value on a later run triggers a warning):

| Origin | bytes | sha256 |
|---|---|---|
| `oasis-p1` | 765215 | `17dd1f991fd7a2b54e15e716a2225f8180aca6229a009f5965646004e841d8fe` |
| `oasis-p2` | 446007 | `30a24d21244a98eef890fc1e5fccaf06f1856782bdf50545050f720bd74ce153` |
| `oasis-json` | 479557 | `1e95a4f79e28273dc7dd2c5c79580a58f98c364f5e2ac3f5ea44f248fab9027c` |
| `oasis-csdl` | 695963 | `e0931a433579254a99a1f0b66ee87bab2dbbb2d19be969b8b0b85da0802d218f` |

The sha256 of each Microsoft file is in `WORK/manifest.json` under `ms.files`.

## Bloques

Starting list: candidate fragments only. The planner decides the real fragment list per bloque from `outline.json`, `skim.md` and `sl-hits.md`, under the relevance rule in `agents/planner.md`. A fragment belongs to one bloque only. First run re-confirms the list with the user, and from then on the ledger's Bloques table supersedes it.

| # | bloque | candidate fragments |
|---|---|---|
| 1 | `overview-and-data-model` | ms-overview, ms-data-model; oasis-p1 2, 3, 4 |
| 2 | `urls-and-addressing` | ms-url-components; oasis-p2 2, 3, 4 (4.1-4.9, `$count`, `$value`, `$ref` parts) |
| 3 | `reading-data` | ms-get-data; oasis-p1 11.2, 10 (basic context URL), 11.5; oasis-json control information (`@odata.context`, `nextLink`, `count`) |
| 4 | `modifying-data` | ms-create-data, ms-update-data, ms-delete-data; oasis-p1 11.3, 11.4 (create, PATCH/PUT, delete, upsert, `Prefer: return=...`) |
| 5 | `query-options` | ms-queryoptions-overview, ms-queryoptions-usage; oasis-p2 5.1, 5.2, 5.3; possibly a subfolder per family |
| 6 | `headers-and-versioning` | oasis-p1 5.1, 8 (ETag 8.3.2, `If-Match`, `If-None-Match`, `Prefer`, `OData-MaxVersion`, `OData-Version`, `Location`, `OData-EntityId`, `Preference-Applied`, `Retry-After`); includes an "ETag and concurrency" hoja whose `In Service Layer:` is `reference/etag/etag-guide.md; reference/etag/etag-usage.md` |
| 7 | `status-codes-and-errors` | oasis-p1 9; oasis-json error response |
| 8 | `metadata-and-annotations` | oasis-p1 11.1, 3.1; oasis-csdl read side only (EntityType, Key, NavigationProperty, ComplexType, EnumType, Annotation, OptimisticConcurrency if present) |
| 9 | `batch-and-async` | oasis-p1 11.7, 11.6, only what SL does not explain; if the relevance rule excludes everything, the bloque is `dropped` with the reason and gets no folder |

## Traps

What the extraction cannot settle on its own; transcribers and reviewers check them against `WORK/sections/<id>.md`.

- **OASIS HTML is a Word export.** Heading numbers are typed text; the script keeps them in `outline.json` and removes them from headings. A hoja heading never carries a number.
- **Cross references** ("see Section 11.4.3", "[OData-URL]") are not rewritten by the script. Handling is in `leaf-format.md`.
- **Examples.** The `Example N:` caption stays as a line before its block. Code language is chosen by a fixed rule in the script (HTTP verb, `{`/`[`, `<`, ABNF, else `text`): fix a wrong tag only when the fragment text proves it.
- **Normative text** (MUST, SHOULD, MAY) is kept exactly; condensing never softens or hardens it.
- **Obfuscated emails** are dropped by the script; if one still shows up, report it as a source defect.
- **Microsoft pages** are consumer oriented and sometimes loose; OASIS wins on conflict (`leaf-format.md`). Hard wraps from the markdown source are kept.
- **Source defects** exist (typos, broken examples, wrong cross references). Transcribe as printed and report them.
- Fragments over about 400 lines are flagged in `skim.md`; the planner lists their children instead of the parent.
- **Excluded from the outline** (listed in `WORK/warnings.md`): front matter, Notices, Table of Contents, chapter 1 (Introduction: IPR, terminology, references, typographical conventions) and the appendices (acknowledgments, revision history, and the CSDL table of XML elements) in every OASIS document. Their text is in no fragment. Headings deeper than level 3 are not nodes: they appear as sub-headings inside their level 3 fragment.
- **Courier-span sentences.** Word sometimes formats a whole phrase as code, or ends a span next to a quote, so a sentence may show up inside backticks (for example in `oasis-csdl-13.4.2`: a phrase starting with `Categories`, an en dash and prose). Keep the words; do not copy the odd backticks into a hoja. A `MUST`/`MAY` keyword is moved out of a code span by the script.
- **Placeholders.** Examples contain `...` as an ellipsis (about 35 blocks, mostly JSON) and the Microsoft files contain a `......` line; both are in the source. Copy them as printed inside code, and never invent the elided content.
- **Straightened quotes.** The script turns curly quotes into ASCII quotes and non-breaking spaces into spaces everywhere, and restores `--` for the dashes Word auto-corrected in code blocks. A code block in a fragment is therefore the text to copy, not what the printed spec shows.
- **URL-only example blocks.** `oasis-p2` has 167 blocks tagged `text`, about 120 of them a single URL (`http://host/service/...`). They are examples of URLs, not requests: keep them as `text` (or `http` when the hoja needs a request), and keep the host `host` or `services.odata.org` exactly. `oasis-p1` has 28 `text` blocks, mostly headers or URLs.
- **Mixed blocks.** A block that starts with a request line, headers and a JSON body is tagged `http` as a whole; the language rule cannot split it. Keep it as one block.
- **Multi-paragraph table cells.** A table where a cell has several paragraphs is rendered by the script as a list per row (`- first column`, `  - **Header**: value`) instead of a pipe table; tables without a bold header row get an empty header row. A `copy` hoja keeps that list form; a `condense` hoja may use a pipe table only if no cell loses a paragraph. A table can also be a plain pipe table; in both cases every row and cell must survive.
- **Microsoft JSON examples** have unescaped quotes (an etag written as `"W/"08D1..""`) and are not valid JSON. Copy as printed and report as a source defect; do not repair them in `copy` mode.
- **Microsoft code fences** carry their own language (25 `json`, 1 `html`); the script keeps it and only guesses one when the fence has none.

## Confusable terms (OData vs Service Layer)

Seeds for the planner's disambiguation candidates; name both sides with paths.

- OData generic ETag (`headers-and-versioning`) vs SL `reference/etag/` hojas: same header, SL-specific behavior lives in SL.
- OData `$batch` or `$filter` generic rules vs SL's `consuming-service-layer` hojas for the same options.
- OData error format and status codes vs SL error codes and messages in SL hojas.
- OData `$metadata` / CSDL vs SL Metadata Document and Business Object Metadata.
- OData Learn "query options" overview vs SL query options, and OData "Prefer" vs SL limitations.
