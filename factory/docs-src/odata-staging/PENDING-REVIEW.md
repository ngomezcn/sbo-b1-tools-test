# Pending review: changes outside the odata staging folder

Items for changes outside the odata staging folder. Append further items; do not renumber. Historical proposals below stay for audit; status of each item is in the Status block.

## Status (2026-10-02)

Items 1–5 decided and executed by supervisor (grill-with-docs, user-delegated). Item 5: keep `verify_odata_block.py` separate from `verify_section.py`. Items 6–7 decided and executed 2026-10-02 (user-delegated; rule: SL docs prevail over OData); decisions recorded under each item. Note: empty leftover dirs `odata-staging/reference/odata/` may remain if the OS denied removal after the move; they hold no files.

## 1. Move the staging folder into Service Layer

What: move `factory/docs-src/odata-staging/reference/odata/` to `factory/docs-src/service-layer/reference/odata/` and set `DOCS` to `factory/docs-src/service-layer` in `.claude/skills/build-docs-from-odata/profile.md`.
Why: the build wrote only to staging by decision.
Proposed: after review, move the built tree as-is. Bloques built (`done`): `overview-and-data-model`, `urls-and-addressing`, `reading-data`, `modifying-data`, `query-options`, `headers-and-versioning`, `status-codes-and-errors`, `metadata-and-annotations`. Bloque `batch-and-async` is `dropped` (no folder). Final hoja count: **37** (plus 9 `index.md` files: 8 bloque indexes + 1 root).

## 2. Root `service-layer/SKILL.md`

What: add rows for odata (By intent, Confusable terms) and update the `description`.
Why: consumers must route to the new external section.
Proposed `description` (append after the existing topics list, before the final period):

```text
..., OData protocol reference (headers, ETag, query options, metadata, status codes) under reference/odata/.
```

Proposed By intent row:

| Developer intent | Example questions | Go to |
|---|---|---|
| Look up generic OData protocol rules (ETag, Prefer, status codes, `$metadata` CSDL shape, context URL, nextLink) that Service Layer builds on | "what does 412 mean in OData", "what is @odata.nextLink", "how do I read EntityType in $metadata", "Prefer return=minimal" | [odata](reference/odata/index.md) |

Proposed Confusable terms rows:

| Term | Means | Go to |
|---|---|---|
| OData ETag (protocol) | Generic `ETag` / `If-Match` / `If-None-Match` rules from OData 4.01; SL-specific hashing, placement and quirks stay in the etag apartado | [etag-and-concurrency](reference/odata/headers-and-versioning/etag-and-concurrency.md), [etag](reference/etag/index.md) |
| OData query options (protocol) | Generic `$filter`/`$select`/`$expand`/`$count` semantics; SL-supported operators and examples stay under consuming-service-layer query-options | [query-options](reference/odata/query-options/index.md), [query-options](reference/consuming-service-layer/query-options/index.md) |
| OData `$metadata` / CSDL | How to read Edm types, EntityType, Annotation in the metadata document; SL Metadata Document scenarios stay in consuming-service-layer | [metadata-and-annotations](reference/odata/metadata-and-annotations/index.md), [metadata-document](reference/consuming-service-layer/metadata-document.md) |
| OData `$batch` / async | Generic batch/async preferences are not documented in `reference/odata/` (bloque dropped); SL multipart `$batch` stays in batch-operations | [batch-operations](reference/consuming-service-layer/batch-operations.md) |

## 3. ETag cross reference

What: in `service-layer/reference/etag/index.md` and `etag-guide.md`, add a pointer to the OData generic ETag hoja.
Why: ADR 0007 — OData generic ETag lives in `odata/`; SL verified facts stay in `etag/`.
Proposed addition for `reference/etag/index.md` (after the opening `# ETag` line, before the first hoja entry):

```markdown
OData generic ETag (protocol headers and 412/428/304): [reference/odata/headers-and-versioning/etag-and-concurrency.md](../odata/headers-and-versioning/etag-and-concurrency.md)
```

Proposed addition for `reference/etag/etag-guide.md` (own line right after the `#` title, or a short note under the introduction):

```markdown
OData generic ETag: reference/odata/headers-and-versioning/etag-and-concurrency.md
```

## 4. Ledger entry for `service-layer/PROGRESS.md`

What: record the odata section as external, built by `build-docs-from-odata`, with the pins.
Why: the SL ledger should know about the external section.
Proposed entry (append under a new `## External sections` heading, or under Notes):

```markdown
## External sections

| section | skill | pins | status |
|---|---|---|---|
| reference/odata/ | /build-docs-from-odata | .claude/skills/build-docs-from-odata/pins.json (retrieved 2026-10-02; OASIS v4.01-os; MS commit 3ca8f5b) | built in staging `factory/docs-src/odata-staging`; move into this tree pending user review (PENDING-REVIEW item 1). Bloque `batch-and-async` dropped. |
```

## 5. `verify_section.py` generalization

What: only the external hojas of OData are checked by `factory/scripts/verify_odata_block.py`; decide whether to merge it into `verify_section.py` or keep it separate.
Why: `verify_odata_block.py` imports helpers from `verify_section.py` and does not modify it.
Proposed: keep `verify_odata_block.py` separate for now (external-section checks: source pins, fragment coverage, attribution). Revisit if a second external section appears.

## 6. SL conflicts and doubtful `In Service Layer:` mappings

What: places where an OData fragment differs from an SL hoja, and mappings the transcribers were unsure of.
Collected from the build:

### Stated in hojas as `SL differs`
- `headers-and-versioning/etag-and-concurrency.md`: weak validators `W/"..."`; GET with `If-None-Match` returns 200 (not 304); `If-Match` on an inner `$batch` request is ignored.
- `headers-and-versioning/prefer-header.md` / modifying-data: SL uses `Prefer: return-no-content` where OData uses `return=minimal` (only what SL states).
- `reading-data/read-entities-and-properties.md`: properties of complex types cannot be requested; missing/null property returns 200 with `odata.null` / `@odata.null` instead of 204; `$value` on null returns 404 instead of 204.
- `reading-data/collection-count-and-paging.md`: next-link often `odata.nextLink` with `$skip`; inline count `$inlinecount` / `odata.count` (v3) beside `/$count`.
- `reading-data/invoking-functions.md`: SL documents bound/global operations as Actions with POST; OData functions are GET with no side effects.
- `reading-data/json-control-information.md`: `odata.metadata=full` not supported.
- `status-codes-and-errors/error-response.md`: narrowed `SL differs` for SQL Query error shape (numeric `code`, object `message`).

### Observations (not written as `SL differs` unless SL says so explicitly)
- bloque 6 `response-headers.md`: SL create-with-no-content shows 204 with `Location` and `Preference-Applied` but no `OData-EntityId` (OData 4.01 requires it on a 204 create).
- bloque 6 `prefer-header.md`: SL `odata.maxpagesize=0` disables paging (OData wants a positive integer); SL documents only the `odata.`-prefixed name.
- bloque 6 `protocol-versioning.md`: SL accepts OData v3 via `OData-MaxVersion: 3.0` or `MaxDataServiceVersion: 3.0` (Semantic Layer views).
- bloque 7 `status-codes.md`: SL batch returns `202 Accept` in OData V3 and `200 OK` in V4; OData defines 202 for asynchronous acceptance.
- bloque 7: SL docs inconsistent among themselves on error `code`/`message` shape (etag-usage vs query-errors).
- bloque 4 `modify-relationships.md`: `In Service Layer: no equivalent hoja` (`associations.md` has no `$ref` / `odata.bind` content).
- bloque 4 `update-entity.md`: upsert folded from OASIS 11.4.4; SL has no upsert coverage (unverified on live SL).
- bloque 8: whether SL `$metadata` returns JSON is not covered.
- bloque 8 `navigation-properties.md`: SL `associations.md` still shows legacy Association/AssociationSet Role syntax vs CSDL 4.01 `NavigationProperty` attributes.

### Doubtful mappings (for human review)
- `invoking-functions.md` → `actions.md` (closest SL hoja; documents POST actions, not GET functions).
- `related-entities-and-references.md` → `associations.md` (covers navigation GET/`$expand`, not `/$ref` or `$entity?$id=`).
- `modify-relationships.md` → `no equivalent hoja`.

### Decisions (2026-10-02, rule: SL docs prevail; checked against `service-layer/reference/`)

| Conflict / mapping | Decision | Reason |
|---|---|---|
| ETag weak validators, GET `If-None-Match` 200, inner-batch `If-Match` ignored | Keep as `SL differs` | Matches etag-guide.md (verified SL 1000340) and etag-usage.md |
| Strong, unquoted or malformed `If-Match` ignored; wrong-entity ETag accepted; `PATCH` + `If-None-Match` ignored (OData says 412) | Adjust: `SL differs` of etag-and-concurrency.md widened | The hoja stated 412 as MUST with no caveat; etag-guide.md verified the opposite |
| `Prefer: return-no-content` vs `return=minimal` | Keep (flagged in prefer-header.md and modification-semantics.md) | crud-operations.md documents only `return-no-content`; the OData text complements and is flagged |
| Complex-type properties, `odata.null` 200, `$value` null 404 | Keep as `SL differs` | individual-properties.md / limitations |
| `odata.nextLink` + `$skip`, `$inlinecount` (v3) | Keep as `SL differs` | pagination.md, options-reference.md, aggregation.md |
| Functions GET vs Actions POST | Keep as `SL differs` | actions.md (FunctionImport in V3) |
| `odata.metadata=full` unsupported | Keep as `SL differs` | limitations.md |
| SQL Query error shape | Keep as narrowed `SL differs` | query-errors.md has numeric code and object message; etag-usage.md has string code and string message (SL docs inconsistent; both cited) |
| `odata.maxpagesize=0`, `OData-MaxVersion`/`MaxDataServiceVersion`, batch 202/200, 204 without `OData-EntityId` | Keep as observations, no `SL differs` | SL states them without contradicting the OData text; they are routing hints already in the hojas' In Service Layer lines |
| Upsert (update-entity.md), `$ref`/`odata.bind` (modify-relationships.md), SL `$metadata` JSON | Keep, undecided by evidence | SL docs neither confirm nor deny; needs a live SL test. Hojas keep generic OData wording and `no equivalent hoja` |
| Mapping invoking-functions.md -> actions.md | Keep | Closest SL hoja; difference already declared |
| Mapping related-entities-and-references.md -> associations.md | Keep | Covers navigation GET/`$expand`; `$ref` gap noted above |
| Mapping modify-relationships.md -> no equivalent hoja | Keep | No SL content on `$ref`/`odata.bind` |
| Precedence rule itself | Recorded as addendum to ADR 0007 | No new glossary term needed (uses Hecho verificado, Sección externa) |

Verifiers after the change: `verify_odata_block.py --all` all PASS. `python -m unittest` on `test_verify_odata_block.py`: 10 of 24 fail with the staging tree untouched by those scripts (fixtures: missing `sections/*` in a temp work dir, ledger plan); not caused by this change, not investigated further.

## 7. Publishing into `sbo-skills/`

Done 2026-10-02 (user-delegated). `npm run publish-plugin -- ../../../sbo-skills/plugins/service-layer` from `factory/plugins-src/service-layer` rewrote `dist/` and `skills/` of `sbo-skills/plugins/service-layer/`: `skills/docs/reference/odata/` (46 files, English) and the router `SKILL.md`. Result in the submodule working tree: only `etag-and-concurrency.md` differs for odata (the rest was already identical to HEAD) ; six `webhooks/` hojas also show as modified in `git status` but `git diff` shows no content change (line endings or stat only). Nothing committed or pushed in any repo.
