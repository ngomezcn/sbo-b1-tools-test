# Docs build ledger: odata (reference/odata)

Pins: .claude/skills/build-docs-from-odata/pins.json · Skill: /build-docs-from-odata · Extracted: 2026-10-02

## RESUME HERE

**Done last session:** PENDING-REVIEW items 6–7 decided and executed (2026-10-02, supervisor-delegated, rule: SL docs prevail over OData): all SL conflicts checked against `service-layer/reference/`; one `SL differs` line widened (etag-and-concurrency); no hoja discarded; reference/odata/ and SKILL.md published to `sbo-skills/plugins/service-layer/skills/docs/` via `npm run publish-plugin` (working tree, not committed). Earlier: items 1–5 executed.
**Next:** nothing pending. Only open point: whether SL `$metadata` can return JSON (not tested). Live tests of upsert and `$ref` / `@odata.bind` are done (2026-10-02, SL 10.0 version 1000340, v1 and v2; test Items `ZZ*` created and deleted): upsert not supported (404 -2028), `@odata.bind` silently ignored, `/$ref` and `$links` unsupported, `DELETE Entity/Nav/$ref` deletes the entity. PENDING-REVIEW item 6 resolved by evidence; `SL differs` added to update-entity, modify-relationships, create-entity and related-entities-and-references; republished to `sbo-skills` and committed.
**Waiting on the user:** nothing.
**Open decisions:** none.
**Update (2026-10-02):** `test_verify_odata_block.py` fixed (24/24 pass; fixtures now pass `--ledger`, the script was right); `verify_odata_block.py --all` 57 PASS. Six stat-only `webhooks/` entries in `sbo-skills` cleared with `git add` (content identical; CRLF worktree vs LF index, no pipeline bug). Only real pending change in `sbo-skills`: `etag-and-concurrency.md`. `.gitattributes` deliberately not added (optional; would create more uncommitted changes in both repos).
**Suggested skills:** none

## Bloques

| # | bloque | fragments | status |
|---|---|---|---|
| 1 | overview-and-data-model | ms-overview, ms-data-model, oasis-p1 2, 3, 4 | done |
| 2 | urls-and-addressing | ms-url-components, oasis-p2 2, 3, 4 | done |
| 3 | reading-data | ms-get-data, oasis-p1 11.2, 10, 11.5, oasis-json control information | done |
| 4 | modifying-data | ms-create-data, ms-update-data, ms-delete-data, oasis-p1 11.3, 11.4 | done |
| 5 | query-options | ms-queryoptions-overview, ms-queryoptions-usage, oasis-p2 5.1, 5.2, 5.3 | done |
| 6 | headers-and-versioning | oasis-p1 5.1, 8 | done |
| 7 | status-codes-and-errors | oasis-p1 9, oasis-json error response | done |
| 8 | metadata-and-annotations | oasis-p1 11.1, 3.1, oasis-csdl read side | done |
| 9 | batch-and-async | oasis-p1 11.6, 11.7 (dropped: SL covers batch) | dropped |

## Plan: overview-and-data-model

Approved: 2026-10-02 (supervisor, delegated by the user)

### Fragment decisions

| fragment | decision | where / reason |
|---|---|---|
| ms-overview | include | overview-and-data-model/what-is-odata.md. Question: "what is OData and what does it give me as a client?" (sl-hits: not in SL). Covers `ms-overview--protocol`. The dangling sentence "The following image shows..." and the duplicated "follows these design principles:" line are dropped (image removed). |
| oasis-p1-2 | merge | overview-and-data-model/what-is-odata.md. Adds the list of six facilities (metadata, data, querying, editing, operations, vocabularies); the design principles duplicate the Microsoft text. |
| ms-data-model | include | overview-and-data-model/entity-data-model.md. Question: "what is an entity type vs a complex type vs an entity set vs a singleton, and what does a navigation property mean when reading `$metadata`?" Gate A for singleton, open type, dynamic property, entity-id (SL hits: no definition). Covers all `ms-data-model--*` children. |
| oasis-p1-3 | merge | overview-and-data-model/entity-data-model.md. Own text only; the same content as ms-data-model plus the "resource" definition and the pointer to CSDL (the pointer is replaced per leaf-format cross reference rules). Child `oasis-p1-3.1` (Annotations) belongs to bloque #8 and is NOT covered by this entry. |
| oasis-p1-4 | include | overview-and-data-model/service-model.md. Own text only: service document vs metadata document (gate B: "which two fixed resources does an OData service expose and what is each for?"). Children are decided individually below. |
| oasis-p1-4.1 | include | overview-and-data-model/service-model.md. Gate A (`$entity`, `EntityId`, `Core.DereferenceableIDs`, `Core.ConventionalIDs` not defined in SL) and B: "can I use the entity-id to fetch the entity?" |
| oasis-p1-4.2 | include | overview-and-data-model/service-model.md. Gate A and B: "which URL do I PATCH or DELETE, and can I build it from the key?" (clients must use the links in the payload). |
| oasis-p1-4.3 | exclude | Transient entities: rare, serves implementers; in doubt exclude. |
| oasis-p1-4.4 | exclude | Default namespaces (`Core.DefaultNamespace`) is a service-side vocabulary and URL-resolution rule; no SL hoja uses it and the consequence for SL is unverified (see Question 1). |
| oasis-p1-3.1 | exclude | Not this bloque: owned by #8 metadata-and-annotations. |

Note for the verifier: `oasis-p1-3` and `oasis-p1-4` are listed with a restriction (own text only). Their `source` locators in the hojas should be written as `3` and `4, 4.1, 4.2`; a literal "covers descendants" reading would wrongly pull in 3.1, 4.3 and 4.4.

### Hojas

| hoja | title | fragments | mode | unit | SL candidates |
|---|---|---|---|---|---|
| overview-and-data-model/what-is-odata.md | What is OData | ms-overview (base), oasis-p1-2 (second: adds the six facilities list) | condense | u1 | reference/introduction-getting-started/introduction.md |
| overview-and-data-model/entity-data-model.md | Entity data model | ms-data-model (base), oasis-p1-3 (second: adds nothing normative beyond the "resource" definition; own text only) | copy | u1 | reference/consuming-service-layer/metadata-document.md |
| overview-and-data-model/service-model.md | Service model: service document, entity-ids and edit URLs | oasis-p1-4 (base, own text), oasis-p1-4.1, oasis-p1-4.2 | copy | u1 | reference/consuming-service-layer/metadata-document.md; reference/etag/etag-usage.md |

### Unidades de trabajo

| unit | fragments | hojas | status | notes |
|---|---|---|---|---|
| u1 | ms-overview, oasis-p1-2, ms-data-model, oasis-p1-3, oasis-p1-4, oasis-p1-4.1, oasis-p1-4.2 | overview-and-data-model/what-is-odata.md, overview-and-data-model/entity-data-model.md, overview-and-data-model/service-model.md | reviewed | about 200 lines of fragment text in total (well under 1500); one unit because the topics are small and share vocabulary. |

### Disambiguation candidates

- OData service document and metadata document (`service-model.md`) vs SL `reference/consuming-service-layer/metadata-document.md` (covers both; SL specifics such as `/b1s/v1` vs `/b1s/v2` live there and in `reference/introduction-getting-started/introduction.md`).
- OData entity-id, `EntityId` header and `$entity` (`service-model.md`) vs SL `reference/etag/etag-usage.md` (uses `$entity` with ETag).
- OData EDM "entities", "properties", "operations" (`entity-data-model.md`) vs SL DI API comparison names in `reference/appendix-di-api-comparison/metadata-naming-differences.md` and `crud-apis.md` (DI API objects and collections, not EDM concepts).
- OData "Protocol" (`what-is-odata.md`) vs SL `reference/limitations/limitations.md` section "OData Protocol Implementation Limitations" (what SL does not implement; the OData hoja must not imply full 4.01 support).
- OData "entity set" and "singleton" vs SL `reference/consuming-service-layer/overview-key-elements.md` ("resource path": a collection or a single entity).

### Questions

- Q1. `oasis-p1-4.4` Default Namespaces: recommend exclude (unverified whether SL declares `Core.DefaultNamespace`; it would explain calling bound actions without a namespace). Include only if someone verifies SL behavior against a live `$metadata`; then it would join `service-model.md`.
- Q2. `oasis-p1-4.3` Transient Entities: recommend exclude; include in `service-model.md` (3 lines) if the user wants completeness.
- Q3. Overview hoja `what-is-odata.md` is marginal against the relevance rule (no integration question beyond "what is OData"); recommend keep because it is tiny and sets vocabulary, drop if the user prefers a leaner set.
- Q4. Coverage convention: `oasis-p1-3` and `oasis-p1-4` are listed with "own text only" because their children go elsewhere or are excluded; recommend this explicit restriction over splitting them into pseudo-fragments. Confirm that `verify_odata_block.py` accepts it.

## Plan: urls-and-addressing

Approved: 2026-10-02 (supervisor, delegated by the user)

### Fragment decisions

| fragment | decision | where / reason |
|---|---|---|
| ms-url-components | include | urls-and-addressing/url-structure-and-syntax.md (second). Q: "what are the three parts of an OData URL and what is the service root?" SL key-elements table only shows the SL form; the ms page adds consumer wording and the case-insensitive `$` option note. |
| oasis-p2-2 (covers 2.1 URL Parsing, 2.2 URL Syntax) | include | urls-and-addressing/url-structure-and-syntax.md (base). Gate A/B: no SL hoja explains percent-decoding order or that a quote in a key string is doubled (Q: "how do I write a key containing `'` or `/`?"). Normative MUSTs. |
| oasis-p2-3 | merge | urls-and-addressing/url-structure-and-syntax.md. 7 lines: service root URL MUST end in `/`, GET returns the service document. |
| oasis-p2-4 | (parent, 579 lines) | not decided as a unit; children listed below. |
| oasis-p2-4.1 | exclude | `$metadata` URL: SL `reference/consuming-service-layer/metadata-document.md` explains it. |
| oasis-p2-4.2 | exclude | `$batch` URL: SL `reference/consuming-service-layer/batch-operations.md` explains it (bloque 9 owns batch). |
| oasis-p2-4.3 (own text, about 134 lines; children listed in own rows) | include | urls-and-addressing/addressing-entities.md (base). Q: "how do I address an entity set, one entity by key, a related entity or a related collection?" SL associations.md shows only the order/business-partner case. Own text only: children 4.3.1 and 4.3.3 go to the second hoja, the others are excluded below. Bound action/function examples inside the own text are condensed to the addressing pattern (defining operations is out of scope). |
| oasis-p2-4.3.1 | include | urls-and-addressing/key-predicates-and-canonical-urls.md (base). Q: "what is the canonical URL of an entity and what does a key predicate look like?" |
| oasis-p2-4.3.2 | exclude | contained entities rely on containment navigation properties (modelling); SL metadata is not containment based. |
| oasis-p2-4.3.3 | include | urls-and-addressing/key-predicates-and-canonical-urls.md (second: adds the shortened key predicate for related entities with referential constraints, e.g. `Orders(1)/Items(2)`). |
| oasis-p2-4.3.4 | exclude | `$entity` entity-id resolution: no SL hoja documents calling it (SL only shows `/$entity` inside `@odata.context`); in doubt, exclude. See Questions. |
| oasis-p2-4.3.5 | exclude | alternate keys need `Core.AlternateKeys`; nothing in SL shows support; in doubt, exclude. See Questions. |
| oasis-p2-4.3.6 | exclude | key-as-segment is a service MAY convention; nothing in SL shows support. See Questions. |
| oasis-p2-4.4 | exclude | `/$ref` addressing and unrelating entities: SL documents none of it (no `$ref` hit) and its limitations hoja says managing values/properties directly is unsupported. See Questions. |
| oasis-p2-4.5 (covers 4.5.1, 4.5.2) | exclude | only ABNF pointers to the grammar of calling operations; SL `reference/consuming-service-layer/actions.md` covers calling actions; defining operations is out of scope. |
| oasis-p2-4.6 | exclude | property addressing: SL `reference/consuming-service-layer/individual-properties.md` covers it and SL limitations say complex-type property access is not allowed (SL wins). |
| oasis-p2-4.7 | exclude | `/$value` of a primitive property: SL individual-properties.md covers it; the only extra (Edm.Stream) is media-stream territory. |
| oasis-p2-4.8 | exclude | `/$count` path segment and `$count` in `$filter`/`$orderby`: SL covers `$count`/`$inlinecount` in `reference/consuming-service-layer/query-options/options-reference.md`; SL support of the `/$count` path is unverified and SL `$filter` is limited. See Questions. |
| oasis-p2-4.9 | merge | urls-and-addressing/addressing-entities.md. Short (9 lines): members are addressed by appending the key; `Capabilities.IndexableByKey` note. |
| oasis-p2-4.10 | exclude | ordered collections need the `Core.Ordered` annotation; not in SL. |
| oasis-p2-4.11 | exclude | derived-type casts: SL entities are flat (no derived-type addressing documented); in doubt, exclude. |
| oasis-p2-4.12 | exclude | `/$filter` path segment: advanced and unverified in SL; SL `$filter` option is covered in basic-queries.md. |
| oasis-p2-4.13 | exclude | `/$each` bulk PATCH/DELETE: unverified in SL; SL documents CRUD per entity. |
| oasis-p2-4.14 | exclude | media streams are out of scope; SL attachments/images hojas cover `$value` downloads. |
| oasis-p2-4.15 | exclude | `$crossjoin`: SL `reference/consuming-service-layer/query-options/cross-joins.md` explains it. |
| oasis-p2-4.16 | exclude | `$all`: nothing in SL; in doubt, exclude. |
| oasis-p2-4.17 | exclude | `/$query` POST with options in body: not shown in SL; in doubt, exclude. |

### Hojas

| hoja | title | fragments | mode | unit | SL candidates |
|---|---|---|---|---|---|
| urls-and-addressing/url-structure-and-syntax.md | OData URL structure and syntax | oasis-p2-2 (base; includes 2.1 and 2.2), ms-url-components (second: consumer description of the three parts, example URLs, `$`-prefixed case-insensitive options), oasis-p2-3 (merged: service root ends in `/`, service document) | condense | u1 | reference/consuming-service-layer/overview-key-elements.md |
| urls-and-addressing/addressing-entities.md | Addressing entities and collections | oasis-p2-4.3 (base, own text only), oasis-p2-4.9 (merged) | condense | u2 | reference/consuming-service-layer/associations.md; reference/consuming-service-layer/crud-operations.md |
| urls-and-addressing/key-predicates-and-canonical-urls.md | Key predicates and canonical URLs | oasis-p2-4.3.1 (base), oasis-p2-4.3.3 (second: shortened key predicate with referential constraints) | copy | u2 | reference/consuming-service-layer/crud-operations.md; reference/consuming-service-layer/associations.md |

### Unidades de trabajo

| unit | fragments | hojas | status | notes |
|---|---|---|---|---|
| u1 | oasis-p2-2, oasis-p2-3, ms-url-components | urls-and-addressing/url-structure-and-syntax.md | reviewed | about 95 lines of fragment text. Two wordings of the three-part split (Example 2 diagram and the ms diagram): keep one, OASIS wins. |
| u2 | oasis-p2-4.3, oasis-p2-4.3.1, oasis-p2-4.3.3, oasis-p2-4.9 | urls-and-addressing/addressing-entities.md; urls-and-addressing/key-predicates-and-canonical-urls.md | reviewed | about 190 lines of included text. oasis-p2-4.3 is listed for its own text only; its children 4.3.2, 4.3.4, 4.3.5, 4.3.6 are excluded (their text must not be copied) and 4.3.1, 4.3.3 go to the second hoja. If the user answers yes on alternate keys / key-as-segment / `$entity`, those subsections join `key-predicates-and-canonical-urls.md`. |

### Disambiguation candidates

- OData service root URL, resource path and query options vs SL `reference/consuming-service-layer/overview-key-elements.md` (SL root is `/b1s/v1` for OData 3 and `/b1s/v2` for OData 4; OData's root only needs to end in `/`).
- OData `$metadata` addressing vs SL `reference/consuming-service-layer/metadata-document.md` (not covered by a hoja here).
- OData key predicate `Orders(1)` and navigation addressing vs SL `reference/consuming-service-layer/associations.md` and `crud-operations.md`.
- OData `/$value` and property addressing (excluded here) vs SL `reference/consuming-service-layer/individual-properties.md`: if a hoja mentions them, SL differs (complex-type properties not accessible).
- OData `$count` (path segment, excluded) vs SL `$count` option in `reference/consuming-service-layer/query-options/options-reference.md`.

### Questions

- Recommendation: keep `/$ref`, `/$count`, `/$value`, property addressing, `$each`, derived-type casts, `$all` and `/$query` excluded (SL documents none of them as supported, or covers them better, and SL limitations rule out direct property/value management). Confirm that the bloque stays at 3 hojas. Option: include 4.8 (`/$count`) and 4.4 (`$ref`) if you can confirm SL v2 supports them.
- Recommendation: exclude alternate keys (4.3.5), key-as-segment (4.3.6) and `$entity` (4.3.4): they need service-side annotations or are optional MAYs, and SL docs never show them. Include only if you can confirm Service Layer accepts them.
- Recommendation: `oasis-p2-4.3` is listed for its own text only (children are decided separately); the supervisor and verifier should read that row as an exception to "a listed fragment covers its descendants".

## Plan: reading-data

Approved: 2026-10-02 (supervisor, delegated by the user)

Notes on scope. Bloque 5 owns the system query option children of 11.2 (11.2.1, 11.2.5, 11.2.6, 11.2.11, 11.2.12); they are not decided here. Children of the oversized fragments 10 (436 lines), 11.2 (714) and 11.5 (227) are decided instead of the parents; a parent row means its own intro text only. SL wins on conflicts: SL does not allow addressing properties of complex types, does not support `odata.metadata=full`, and uses OData v3 annotations (`odata.count`, `odata.nextLink`, `$inlinecount`) next to the v4 ones. Decision on Question 1: do not borrow `oasis-p1-11.2.6` (invalid `--server-driven-paging` locator; normative paging stays in bloque 5 `collection-query-semantics.md`); keep `oasis-json-4.5.5` here for the `@odata.nextLink` shape.

### Fragment decisions

| fragment | decision | where / reason |
|---|---|---|
| ms-get-data | include | reading-data/read-entities-and-properties.md (base). Q: how do I GET a collection, one entity by key, a property, a raw value? |
| oasis-p1-11.2.2 | include | read-entities-and-properties.md (second: 404 rule, unadvertised properties, `Core.Permissions`). Q: what comes back for a missing entity? |
| oasis-p1-11.2.4 | include | read-entities-and-properties.md (second: 204 for null, 404, `$value` content type rules). Q: what does 204 on a property GET mean? |
| oasis-json-11 | include | read-entities-and-properties.md (second: JSON shape of an individual property response). Q: why is the property wrapped in `value`? |
| oasis-p1-11.2.7 | include | related-entities-and-references.md (base). Q: how do I read the supplier of a product; what if none is related? |
| oasis-p1-11.2.8 | include | related-entities-and-references.md. Q: what does `/$ref` return? |
| oasis-p1-11.2.9 | include | related-entities-and-references.md. Q: how do I resolve an `@odata.id` into an entity (`$entity?$id=`)? SL hits: `$entity` only in etag-usage. |
| oasis-p1-11.2.10 | include | collection-count-and-paging.md (base). Q: how do I get only the number of items (`/$count`)? |
| oasis-json-13 | include | collection-count-and-paging.md (second: shape of a collection payload, where `count` and `nextLink` sit). |
| oasis-json-4.5.4 | include | collection-count-and-paging.md (second). Q: what is `@odata.count`? SL has `$inlinecount`/`odata.count` (v3) only. |
| oasis-json-4.5.5 | include | collection-count-and-paging.md (second). Q: what is `@odata.nextLink`? Gate A: sl-hits 0 in SL. Normative server-driven paging (opaque next link, `$skiptoken`, `maxpagesize`) lives in bloque 5. |
| oasis-p1-10 | merge | context-url.md (own intro text only: what a context URL is, template terms; children listed below) |
| oasis-p1-10.1 | include | context-url.md (base). Q: what is the `@odata.context` of the service document? |
| oasis-p1-10.2 | include | context-url.md. Q: what does `@odata.context` look like for a collection? |
| oasis-p1-10.3 | include | context-url.md. Q: why `#People/$entity`? |
| oasis-p1-10.4 | include | context-url.md (singleton). |
| oasis-p1-10.11 | include | context-url.md (collection of entity references, goes with `/$ref`). |
| oasis-p1-10.12 | include | context-url.md (entity reference). |
| oasis-p1-10.13 | include | context-url.md (property value, as in `Airports('KSFO')/Name`). |
| oasis-p1-10.14 | include | context-url.md (collection of complex or primitive values). |
| oasis-p1-10.15 | include | context-url.md (complex or primitive value). |
| oasis-p1-10.16 | include | context-url.md (operation result, goes with function calls). |
| oasis-p1-10.5 | exclude | derived types are an authoring/model topic; gate B finds no plain consumer question. |
| oasis-p1-10.6 | exclude | same as 10.5. |
| oasis-p1-10.7 | exclude | context URL with `$select` is about the query option; left to #5 and not needed for the basics. |
| oasis-p1-10.8 | exclude | same as 10.7. |
| oasis-p1-10.9 | exclude | context URL with `$expand`; same reason as 10.7. |
| oasis-p1-10.10 | exclude | same as 10.9. |
| oasis-p1-10.17 | exclude | delta: out of scope for consuming (always-exclude list). |
| oasis-p1-10.18 | exclude | delta. |
| oasis-p1-10.19 | exclude | `$all` is not supported by SL and no SL error depends on it. |
| oasis-p1-10.20 | exclude | `$crossjoin` is explained by SL `consuming-service-layer/query-options/cross-joins.md`. |
| oasis-json-4.5 | merge | json-control-information.md (own intro text only; children listed individually) |
| oasis-json-4.5.1 | include | json-control-information.md (base). Q: what is `@odata.context` and where does it sit? |
| oasis-json-4.5.3 | include | json-control-information.md. Q: what is `@odata.type`? |
| oasis-json-4.5.8 | include | json-control-information.md. Q: what is `@odata.id`? |
| oasis-json-4.5.9 | include | json-control-information.md. Q: what are `@odata.editLink` and `@odata.readLink`? |
| oasis-json-4.5.10 | include | json-control-information.md. Q: what is `@odata.etag` in a payload? (ETag semantics live in #6.) |
| oasis-json-4.5.11 | include | json-control-information.md. Q: what are `navigationLink` and `associationLink`? |
| oasis-json-3.1 | include | json-control-information.md (second: `odata.metadata=minimal/full/none` decides which control information appears). Q: why is `@odata.id` missing from my response? Covers 3.1.1 to 3.1.3; `full` is unsupported in SL (limitations). |
| oasis-json-4.5.2 | exclude | `metadataEtag` is about metadata caching; belongs with `$metadata` (#8), not needed to read data. |
| oasis-json-4.5.6 | exclude | delta. |
| oasis-json-4.5.7 | exclude | delta. |
| oasis-json-4.5.12 | exclude | media streams (always-exclude; SL has its own stream hoja). |
| oasis-json-4.5.13 | exclude | delta. |
| oasis-json-4.5.14 | exclude | collection annotations: extension feature, no consumer question. |
| oasis-json-6 | exclude | entity shape is covered by the control information hoja and the ms examples; in doubt, exclude. |
| oasis-json-7 | exclude | primitive/complex value encoding: complex types are not addressable in SL and encodings are rarely asked; in doubt, exclude (Questions 3). |
| oasis-p1-11.5.1 | include | invoking-functions.md (second: binding, URL shape for bound operations, applies to actions too). |
| oasis-p1-11.5.4 | include | invoking-functions.md (base). Q: how do I call a function (GET, inline parameters, empty result)? |
| oasis-p1-11.5 | exclude | own text is 3 lines. |
| oasis-p1-11.5.2 | exclude | actions on collection members: actions are explained by SL `consuming-service-layer/actions.md`. |
| oasis-p1-11.5.3 | exclude | advertised operations rely on `metadata=full`, unsupported in SL. |
| oasis-p1-11.5.5 | exclude | actions (POST) are explained by SL `consuming-service-layer/actions.md`. |
| oasis-p1-11.2 | exclude | own text is 11 lines of intro; children decided individually or left to #5. |
| oasis-p1-11.2.3 | exclude | media streams (always-exclude; SL `consuming-service-layer/stream-entity-upload.md` and attachments). |

Counts: include 30, merge 3, exclude 26 (59 rows).

### Hojas

| hoja | title | fragments | mode | unit | SL candidates |
|---|---|---|---|---|---|
| reading-data/read-entities-and-properties.md | Read entities and properties | ms-get-data (base), oasis-p1-11.2.2 (second: 404 rule, unadvertised properties, permissions), oasis-p1-11.2.4 (second: 204/404 and `$value` rules), oasis-json-11 (second: JSON of a property response) | condense | u1 | reference/consuming-service-layer/individual-properties.md; reference/consuming-service-layer/crud-operations.md; reference/consuming-service-layer/query-options/basic-queries.md |
| reading-data/related-entities-and-references.md | Related entities, references and entity-ids | oasis-p1-11.2.7 (base), oasis-p1-11.2.8, oasis-p1-11.2.9 | copy | u2 | reference/consuming-service-layer/associations.md |
| reading-data/collection-count-and-paging.md | Collection count and next-link annotations | oasis-p1-11.2.10 (base), oasis-json-13 (second: collection payload shape), oasis-json-4.5.4, oasis-json-4.5.5 | condense | u2 | reference/consuming-service-layer/query-options/pagination.md; reference/consuming-service-layer/query-options/aggregation.md; reference/consuming-service-layer/query-options/options-reference.md |
| reading-data/invoking-functions.md | Invoking functions and bound operations | oasis-p1-11.5.4 (base), oasis-p1-11.5.1 (second: binding to a resource) | condense | u2 | reference/consuming-service-layer/actions.md |
| reading-data/context-url.md | Context URL | oasis-p1-10 (base, intro), oasis-p1-10.1, oasis-p1-10.2, oasis-p1-10.3, oasis-p1-10.4, oasis-p1-10.11, oasis-p1-10.12, oasis-p1-10.13, oasis-p1-10.14, oasis-p1-10.15, oasis-p1-10.16 | copy | u3 | reference/consuming-service-layer/overview-key-elements.md; reference/consuming-service-layer/metadata-document.md |
| reading-data/json-control-information.md | JSON control information in responses | oasis-json-4.5.1 (base), oasis-json-4.5 (intro), oasis-json-4.5.3, oasis-json-4.5.8, oasis-json-4.5.9, oasis-json-4.5.10, oasis-json-4.5.11, oasis-json-3.1 (second: amount of control information) | condense | u4 | reference/consuming-service-layer/overview-key-elements.md; reference/etag/etag-entities-and-metadata.md; reference/limitations/limitations.md |

### Unidades de trabajo

| unit | fragments | hojas | status | notes |
|---|---|---|---|---|
| u1 | ms-get-data, oasis-p1-11.2.2, oasis-p1-11.2.4, oasis-json-11 | reading-data/read-entities-and-properties.md | reviewed | about 250 lines |
| u2 | oasis-p1-11.2.7, oasis-p1-11.2.8, oasis-p1-11.2.9, oasis-p1-11.2.10, oasis-json-13, oasis-json-4.5.4, oasis-json-4.5.5, oasis-p1-11.5.4, oasis-p1-11.5.1 | reading-data/related-entities-and-references.md; reading-data/collection-count-and-paging.md; reading-data/invoking-functions.md | reviewed | about 250 lines, three small hojas |
| u3 | oasis-p1-10, oasis-p1-10.1, oasis-p1-10.2, oasis-p1-10.3, oasis-p1-10.4, oasis-p1-10.11, oasis-p1-10.12, oasis-p1-10.13, oasis-p1-10.14, oasis-p1-10.15, oasis-p1-10.16 | reading-data/context-url.md | reviewed | about 210 lines (parent 10 own text 20 lines; do not copy its other children) |
| u4 | oasis-json-4.5, oasis-json-4.5.1, oasis-json-4.5.3, oasis-json-4.5.8, oasis-json-4.5.9, oasis-json-4.5.10, oasis-json-4.5.11, oasis-json-3.1 | reading-data/json-control-information.md | reviewed | about 195 lines (parent 4.5 own text 9 lines only) |

### Disambiguation candidates

- OData v4 `@odata.count` and `$count` vs SL `$inlinecount` and `odata.count`: `reference/consuming-service-layer/query-options/aggregation.md` (section inlinecount) and `options-reference.md`.
- OData `@odata.nextLink` (opaque, `$skiptoken`) vs SL `odata.nextLink` built with `$skip` and `Prefer: odata.maxpagesize`: `reference/consuming-service-layer/query-options/pagination.md`.
- OData property read of complex-type members and `204 No Content` for null vs SL `reference/consuming-service-layer/individual-properties.md` (complex types not allowed; missing value returns `200` with `odata.null`). SL differs.
- OData context URL / `$metadata` fragments vs SL Metadata Document `reference/consuming-service-layer/metadata-document.md`.
- OData `odata.metadata=full` vs SL limitation (`reference/limitations/limitations.md`): not supported.
- OData functions (`GET`, inline parameters) vs SL "function" in `reference/sql-query/sql-functions.md` (SQL functions, different thing) and SL actions (`reference/consuming-service-layer/actions.md`).
- OData `@odata.etag` and `@odata.editLink` in payloads vs SL `reference/etag/etag-entities-and-metadata.md`.

### Questions

1. Server-Driven Paging under oasis-p1-11.2.6: decided — keep normative paging in bloque 5; drop the borrowed locator (not an outline node; verifier rejects it). `oasis-json-4.5.5` stays in this bloque.
2. Parent rows (`oasis-p1-10`, `oasis-json-4.5`) cover only their own intro text: decided — keep as own-text-only; source locators list the included children explicitly.
3. Excluded with "in doubt": `oasis-json-6`, `oasis-json-7`: decided — keep excluded.
4. Context URL for `$select`/`$expand` (10.7 to 10.10): decided — leave to bloque 5 / excluded here.
5. Actions (`oasis-p1-11.5.5`, `11.5.2`): decided — keep excluded; `invoking-functions.md` covers bound-operation URL rules of 11.5.1.
6. Microsoft complex-type property example: decided — keep and state `SL differs: properties of complex types cannot be requested` in the `In Service Layer:` line.

## Plan: modifying-data

Approved: 2026-10-02 (supervisor, delegated by the user)

### Fragment decisions

| fragment | decision | where / reason |
|---|---|---|
| oasis-p1-11.4.2 | include | modifying-data/create-entity.md. Q: "how do I create an entity linked to existing ones, or with related entities (deep insert), and what comes back (201/204, Location)?" SL explains only plain POST and sub-object lines, not `odata.bind`/`@id` links |
| ms-create-data | merge | modifying-data/create-entity.md (second: adds the 201 Created request/response example with Location) |
| oasis-p1-11.4.3 | include | modifying-data/update-entity.md. Gate A: PATCH vs PUT is in the SL FAQ, but deep update, ETag in body, 200/204 and `Prefer: return=representation` are not in SL |
| oasis-p1-11.4.4 | merge | modifying-data/update-entity.md (upsert and `If-Match` / `If-None-Match: *` to prevent or force insert; no SL hoja mentions upsert) |
| ms-update-data | merge | modifying-data/update-entity.md (second: adds the PATCH/204 example) |
| oasis-p1-11.4.5 | include | modifying-data/delete-entity.md. Q: "what does DELETE return and what happens to related entities?" (204, implicit relation removal, ReferentialConstraint) |
| ms-delete-data | merge | modifying-data/delete-entity.md (second: adds the DELETE/204 example) |
| oasis-p1-11.4.1 | include | modifying-data/modification-semantics.md. Gate A: `return` preference, `Preference-Applied`, `$select`/`$expand` on responses, additional properties, integrity constraints are not defined in SL (SL only has `return-no-content`) |
| oasis-p1-11.4.6 | include | modifying-data/modify-relationships.md. Q: "how do I add, remove or change a reference between two existing entities (`$ref`)?"; no SL hoja covers `$ref` |
| oasis-p1-11.4 | exclude | oversized parent (526 lines), replaced by its children; its 5-line intro repeats 11.4.1 |
| oasis-p1-11.3 | exclude | change tracking, delta links and delta payloads (children 11.3.1-11.3.3 covered): excluded by the relevance rule (delta) |
| oasis-p1-11.4.7 | exclude | media entities: SL covers attachments and streams in `consuming-service-layer/stream-entity-upload.md`; media streams are on the exclusion list |
| oasis-p1-11.4.8 | exclude | stream properties: media streams, exclusion list |
| oasis-p1-11.4.9 | exclude | limitations.md: "Managing values and properties directly is not supported"; SL `consuming-service-layer/individual-properties.md` covers what exists |
| oasis-p1-11.4.10 | exclude | ordered collections: no SL hits, not a consumer need (5 lines) |
| oasis-p1-11.4.11 | exclude | positional inserts into ordered collections: same reason |
| oasis-p1-11.4.12 | exclude | collection update by delta payload (PATCH/PUT on a collection): delta excluded |
| oasis-p1-11.4.13 | exclude | `/$each` bulk update: not evidenced in SL; in doubt, exclude |
| oasis-p1-11.4.14 | exclude | `/$each` bulk delete: same reason |

Counts: include 5, merge 4, exclude 10 (19 rows; 11.3 counts once and covers its 3 children).

### Hojas

| hoja | title | fragments | mode | unit | SL candidates |
|---|---|---|---|---|---|
| modifying-data/create-entity.md | Create an entity | oasis-p1-11.4.2 (base), ms-create-data (second: adds the 201 Created request/response example) | condense | u1 | reference/consuming-service-layer/crud-operations.md; reference/consuming-service-layer/associations.md |
| modifying-data/update-entity.md | Update an entity (PATCH, PUT, upsert) | oasis-p1-11.4.3 (base), oasis-p1-11.4.4 (second: upsert and If-Match/If-None-Match), ms-update-data (second: adds the PATCH/204 example) | condense | u1 | reference/consuming-service-layer/crud-operations.md; reference/faq/faq.md; reference/etag/etag-guide.md |
| modifying-data/delete-entity.md | Delete an entity | oasis-p1-11.4.5 (base), ms-delete-data (second: adds the DELETE/204 example) | copy | u1 | reference/consuming-service-layer/crud-operations.md |
| modifying-data/modification-semantics.md | Returning results and common modification semantics | oasis-p1-11.4.1 (base) | condense | u2 | reference/consuming-service-layer/crud-operations.md; reference/etag/etag-guide.md |
| modifying-data/modify-relationships.md | Modify relationships between entities | oasis-p1-11.4.6 (base) | copy | u2 | reference/consuming-service-layer/associations.md |

Notes for builders: source lines list the child locators (11.4.1, 11.4.2, ...), never the parent 11.4 or 11.3. In modification-semantics the ETag subsection (If-Match, 428, `Core.OptimisticConcurrency`) overlaps bloque #6 (oasis-p1-8): keep the data-modification MUST/SHOULD statements, do not add header-semantics copies, replace cross references by titles. SL agrees with OData on PATCH (differential) and PUT (replacement); SL uses `Prefer: return-no-content` (crud-operations.md) where OData uses `return=minimal`.

### Unidades de trabajo

| unit | fragments | hojas | status | notes |
|---|---|---|---|---|
| u1 | oasis-p1-11.4.2, oasis-p1-11.4.3, oasis-p1-11.4.4, oasis-p1-11.4.5, ms-create-data, ms-update-data, ms-delete-data | modifying-data/create-entity.md, modifying-data/update-entity.md, modifying-data/delete-entity.md | reviewed | about 298 lines |
| u2 | oasis-p1-11.4.1, oasis-p1-11.4.6 | modifying-data/modification-semantics.md, modifying-data/modify-relationships.md | reviewed | about 88 lines |

### Disambiguation candidates

- OData `Prefer: return=minimal` / `return=representation` (modification-semantics) vs SL `Prefer: return-no-content` in `reference/consuming-service-layer/crud-operations.md`.
- OData `PATCH` (differential) vs `PUT` (replacement) in update-entity vs SL `reference/faq/faq.md` (PUT vs PATCH, `X-HTTP-Method-Override`).
- OData upsert (PATCH/PUT to a nonexistent key) vs SL "Updating Entities" in `reference/consuming-service-layer/crud-operations.md`.
- OData deep insert and `odata.bind` (create-entity) vs SL sub-object creation (DocumentLines) in `reference/consuming-service-layer/crud-operations.md` and `reference/consuming-service-layer/associations.md`.
- OData `$ref` relationship operations (modify-relationships) vs SL associations (`reference/consuming-service-layer/associations.md`).
- OData ETag semantics (cited from bloque #6) vs `reference/etag/etag-guide.md`.

### Questions

- Merge upsert (11.4.4, 13 lines) into update-entity (recommended: same request shape) or give it its own hoja `upsert-entity.md`?
- Base for create/update/delete: OASIS base with ms as second (recommended: Learn pages are short TripPin examples, OASIS holds the normative rules, deep insert and binding) or ms base?
- Exclude 11.4.13/11.4.14 (`/$each` bulk update/delete) because nothing in SL evidences support (recommended), or include them flagged as untested in Service Layer?
- Keep 11.4.9 (values and properties directly) excluded even though PUT/DELETE on a property is a plausible developer question? Recommended: exclude, limitations.md says unsupported.
- Add "SL differs: uses `Prefer: return-no-content`" to the "In Service Layer:" line of modification-semantics? Recommended: yes there only (the SL hoja is explicit); create-entity points to the SL hoja without the clause.

## Plan: query-options

Approved: 2026-10-02 (supervisor, delegated by the user)

Scope note: SL already defines the supported `$filter` operators and functions (`consuming-service-layer/query-options/options-reference.md`), lists arithmetic operators and many functions as unsupported (`limitations/limitations.md`), and explains `$top`/`$skip`/`nextLink`/`maxpagesize` (`pagination.md`), `$apply`, groupby, `$crossjoin` and `$select` inside `$expand` (`expand-enhancements.md`). SL never mentions `$search`, `$compute`, parameter aliases, custom query options, `$levels`, `has`, `in`, lambda `any`/`all`. Rule applied: SL wins; in doubt, exclude. Where a hoja below describes a generic OData feature SL does not confirm, its `In Service Layer:` line says `no equivalent hoja` for that part or points to the nearest SL hoja without asserting support.

Fragment ids listed instead of an oversized or mixed parent: children listed individually take precedence over parent coverage (ms-queryoptions-overview is covered by hoja 1 except its two children `--custom-query-options` and `--parameter-aliases`, which are listed separately).

### Fragment decisions

| fragment | decision | where / reason |
|---|---|---|
| ms-queryoptions-overview | include | query-options/query-options-overview.md (base; covers its own text, `--system-query-options` and `--conventions`). Q: "which kinds of query options exist, which resources accept which options, and is the `$` prefix optional?" Gate A: SL documents individual options but nowhere which options apply to which resource kinds (collection, single entity, `/$count`) or the 4.01 case-insensitive/optional-`$` rule |
| oasis-p1-11.2.1 | include | query-options/query-options-overview.md (second: adds the normative evaluation order of system query options, `$schemaversion` first, `$apply` ... `$top` before server-driven paging, `$expand`/`$select`/`$format` after, and MUST on case-insensitive 4.01 names) |
| ms-queryoptions-overview--custom-query-options | merge | query-options/query-options-overview.md (custom query options MUST NOT start with `$` or `@`; ten lines; duplicates `oasis-p2-5.2`, use one wording) |
| oasis-p2-5.2 | merge | query-options/query-options-overview.md (second for custom query options: normative sentence and `debug-mode` example; SL has 0 hits) |
| oasis-p1-11.2.6 | include | query-options/collection-query-semantics.md (base). Q: "how are nulls and ties ordered by `$orderby`, does `$top`/`$skip` need a stable order, what does `$count=true` count (ignores `$top`/`$skip`, 400 for non-boolean), what is a next link and must I treat it as opaque, what is a parameter alias?" Gate A: SL gives the options and examples but none of these semantics, and SL only knows `/$count` and V3 `$inlinecount`, not `$count=true`. Scope of the hoja: `$filter` semantics (null/false results omitted, unavailable properties), `$orderby`, `$top`, `$skip`, `$count`, server-driven paging, parameter aliases. Left out of the hoja by scope (stated in the hoja notes): subsections Built-in Filter Operations and Built-in Query Functions (SL options-reference defines the supported set, limitations.md lists the rest as unsupported), `$search` and Requesting an Individual Member of an Ordered Collection (SL does not mention them) |
| oasis-p2-5.3 | include | query-options/collection-query-semantics.md (second: adds the three URL examples and the ABNF rule names; `@` start rule MUST) |
| ms-queryoptions-overview--parameter-aliases | merge | query-options/collection-query-semantics.md (twelve lines, duplicates `oasis-p2-5.3` and the alias subsection of 11.2.6; no new wording) |
| oasis-p1-11.2.5 | include | query-options/select-and-expand.md (base; the `$compute` subsection is out of scope). Q: "what can I put in `$select` (`*`, paths into navigation properties, key always returned?), how do I filter, sort or limit the related entities inside `$expand`, what do `$ref`, `$count` and `$levels` do?" Gate A: SL `expand-enhancements.md` and `associations.md` only show `$select` inside `$expand` and a basic expand; none define `$expand` options or `$levels` |
| oasis-p2-5.1.3 | include | query-options/select-and-expand.md (second: URL-level expand-item grammar, `*`, `/$ref`, `/$count($search=...)`, type-cast segments, "a property MUST NOT appear in more than one expand item") |
| oasis-p2-5.1.4 | merge | query-options/select-and-expand.md (select item grammar: paths, `*`, qualified names; adds only what 11.2.5 lacks, same wording rule) |
| oasis-p2-5 | exclude | oversized parent (1673 lines), replaced by its children; its text is only an index |
| oasis-p2-5.1 | exclude | oversized parent (1631 lines), replaced by its children; its text is only an index |
| oasis-p2-5.1.1 | exclude | 1294-line common expression syntax (operators, 60 functions, literals, `$it`/`$root`, precedence): SL options-reference defines the supported operators and functions, limitations.md says arithmetic and most functions are unsupported; documenting them would contradict SL. See Question 1 for `has`, `in`, `any`, `all` |
| oasis-p2-5.1.2 | exclude | 5-line pointer to the expression syntax; SL basic-queries/options-reference explain `$filter` |
| oasis-p2-5.1.5 | exclude | 7-line pointer; `$orderby` semantics are in `oasis-p1-11.2.6` |
| oasis-p2-5.1.6 | exclude | 5-line pointer; `$top`/`$skip` semantics are in `oasis-p1-11.2.6` |
| oasis-p2-5.1.7 | exclude | 5-line pointer; `$count` semantics are in `oasis-p1-11.2.6` |
| oasis-p2-5.1.8 | exclude | `$search`: SL never mentions it and limitations.md implies a restricted query surface; in doubt, exclude (Question 2) |
| oasis-p2-5.1.9 | exclude | `$format`: SL says XML is not supported for general entity CRUD and the Service Layer answers JSON; format extension, exclusion list |
| oasis-p2-5.1.10 | exclude | `$compute`: SL does not mention it; arithmetic operators are unsupported in SL, so computed properties would not work |
| oasis-p2-5.1.11 | exclude | `$index` (ordered collections): no SL hits, not a consumer need |
| oasis-p2-5.1.12 | exclude | `$schemaversion`: schema versioning extension, no SL hits |
| oasis-p1-11.2.11 | exclude | `$format` request option: same reason as `oasis-p2-5.1.9` (possibly claimed by bloque 3; excluded here either way) |
| oasis-p1-11.2.12 | exclude | `$schemaversion` request option: same reason as `oasis-p2-5.1.12` |
| ms-queryoptions-usage | exclude | oversized parent (677 lines), replaced by its children; Learn walk-through built on the TripPin sample, repeating the OASIS examples |
| ms-queryoptions-usage--filter | exclude | basic predicates and built-in functions are in SL options-reference/basic-queries; complex-type and enum filters: SL covers enums, complex-type access is a stated limitation; nested filter in expand is already in `oasis-p2-5.1.3` / `oasis-p1-11.2.5` |
| ms-queryoptions-usage--select | exclude | SL covers `$select` (`basic-queries.md`, `expand-enhancements.md`); semantics come from `oasis-p1-11.2.5` |
| ms-queryoptions-usage--count | exclude | one example (`$count=true` returning `20`), duplicated by `oasis-p1-11.2.6`; the example payload is also questionable (a bare number for `$count=true`) |
| ms-queryoptions-usage--top-skip | exclude | SL `pagination.md` and `options-reference.md` cover it; semantics in `oasis-p1-11.2.6` |
| ms-queryoptions-usage--orderby | exclude | one `$orderby=EndsAt desc` example with a TripPin payload; semantics in `oasis-p1-11.2.6` |
| ms-queryoptions-usage--search | exclude | `$search`: see `oasis-p2-5.1.8` (Question 2) |
| ms-queryoptions-usage--expand | exclude | TripPin `$expand=Friends` payload with invalid JSON etags; the same example idea is covered by `oasis-p1-11.2.5` examples |
| ms-queryoptions-usage--lambda-operators | exclude | `any`/`all`: not mentioned in SL, support unverified, in doubt exclude (Question 1) |

Counts: include 6, merge 4, exclude 23 (33 rows; `oasis-p1-11.2` and its other children belong to bloque 3 and are not decided here).

### Hojas

| hoja | title | fragments | mode | unit | SL candidates |
|---|---|---|---|---|---|
| query-options/query-options-overview.md | Query options overview | ms-queryoptions-overview (base), oasis-p1-11.2.1 (second: adds the normative evaluation order and case-insensitivity MUST), oasis-p2-5.2 (second: normative custom query option rule), ms-queryoptions-overview--custom-query-options (merged duplicate) | condense | u1 | reference/consuming-service-layer/query-options/index.md; reference/consuming-service-layer/query-options/options-reference.md |
| query-options/collection-query-semantics.md | Filtering, ordering, paging, counting and parameter aliases (collection semantics) | oasis-p1-11.2.6 (base), oasis-p2-5.3 (second: adds the alias URL examples and ABNF rule names), ms-queryoptions-overview--parameter-aliases (merged duplicate) | condense | u2 | reference/consuming-service-layer/query-options/options-reference.md; reference/consuming-service-layer/query-options/pagination.md; reference/consuming-service-layer/query-options/aggregation.md |
| query-options/select-and-expand.md | $select and $expand (including expand options) | oasis-p1-11.2.5 (base), oasis-p2-5.1.3 (second: adds expand-item grammar, `/$ref`, `/$count`), oasis-p2-5.1.4 (second: adds select-item grammar) | condense | u3 | reference/consuming-service-layer/query-options/expand-enhancements.md; reference/consuming-service-layer/associations.md; reference/consuming-service-layer/query-options/basic-queries.md |

Hoja names follow the existing bloque folder convention (`query-options/` is the bloque folder; no subfolder with its own `index.md` is needed for three hojas).

### Unidades de trabajo

| unit | fragments | hojas | status | notes |
|---|---|---|---|---|
| u1 | ms-queryoptions-overview, ms-queryoptions-overview--custom-query-options, oasis-p1-11.2.1, oasis-p2-5.2 | query-options/query-options-overview.md | reviewed | about 212 lines of fragment text (the custom child is inside the ms parent's 166) |
| u2 | oasis-p1-11.2.6, oasis-p2-5.3, ms-queryoptions-overview--parameter-aliases | query-options/collection-query-semantics.md | reviewed | about 348 lines (the alias child is inside the ms parent's 166 and is counted in u1; transcriber reads the child text from `WORK/sections/ms-queryoptions-overview--parameter-aliases.md`); the 11.2.6 subsections excluded by scope are listed in the decision row |
| u3 | oasis-p1-11.2.5, oasis-p2-5.1.3, oasis-p2-5.1.4 | query-options/select-and-expand.md | reviewed | about 344 lines; the `$compute` subsection of 11.2.5 is out of scope |

### Disambiguation candidates

- OData `$count=true` / `/$count` (`query-options/collection-query-semantics.md`) vs SL `$inlinecount` (OData V3 only) in `reference/consuming-service-layer/query-options/options-reference.md` and `aggregation.md#inlinecount`: same intent (count with results), different option and version.
- OData server-driven paging and `@odata.nextLink` / `maxpagesize` preference (`query-options/collection-query-semantics.md`) vs SL `reference/consuming-service-layer/query-options/pagination.md` (V3 `odata.nextLink`, `PageSize` in `b1s.conf`, `Prefer: odata.maxpagesize`, page size 20).
- OData `$expand` options (`$filter`, `$orderby`, `$top`, `$levels`, `$ref`) in `query-options/select-and-expand.md` vs SL `reference/consuming-service-layer/query-options/expand-enhancements.md` (only `$select` inside `$expand`, as of 10.0 FP 2105) and `reference/consuming-service-layer/associations.md`.
- OData evaluation order including `$apply` (`query-options/query-options-overview.md`) vs SL `reference/consuming-service-layer/query-options/aggregation.md` and `grouping.md` (`$apply`).
- OData "query options" overview vs SL `reference/consuming-service-layer/query-options/index.md`: SL lists only seven options; the OData overview lists more than SL supports.

### Questions

1. Lambda operators (`any`, `all`), `has` and `in` in `$filter` (ms-queryoptions-usage--lambda-operators, parts of oasis-p2-5.1.1): recommendation: keep excluded, because SL lists its supported `$filter` operators and does not name them and limitations.md says only some functions are unsupported; if the user knows Service Layer accepts them (for example `Orders?$filter=DocumentLines/any(l: l.ItemCode eq 'A')`), add a hoja `filter-lambda-and-collection-operators` from `ms-queryoptions-usage--lambda-operators` (base) and the `has`/`in`/`any`/`all` parts of `oasis-p2-5.1.1`, and split 5.1.1 into a unit.
2. `$search` (oasis-p2-5.1.8, ms-queryoptions-usage--search, `$search` part of 11.2.6): recommendation: keep excluded; SL never mentions it. Alternative: include a `search-option` hoja condensed from 5.1.8 if the user can confirm Service Layer supports it.
3. Expand options (`$filter`, `$orderby`, `$top`, `$levels`) in `select-and-expand.md`: SL explicitly documents only `$select` inside `$expand`; recommendation: include as planned and let the hoja describe OData generically, with `In Service Layer:` pointing to `expand-enhancements.md` without a `SL differs` clause unless a reviewer finds an explicit contradiction; alternative: reduce the hoja to `$select` plus `$expand` basics.
4. `$compute` (oasis-p2-5.1.10, last subsection of 11.2.5) and `$format` / `$schemaversion` (11.2.11, 11.2.12, 5.1.9, 5.1.12): recommendation: exclude; if bloque 3 decided to include 11.2.11 or 11.2.12 this plan must not repeat them.
5. Split of `ms-queryoptions-overview` into three hojas by child: I merged its alias and custom children into the OASIS-based hojas, and the ledger checker must accept the children-take-precedence rule stated at the top; if not, alternative: one hoja `query-options-overview` holding the whole ms overview and OASIS 5.2 and 5.3, and `collection-query-semantics` without the alias material.

## Plan: headers-and-versioning

Approved: 2026-10-02 (supervisor, delegated by the user)

All fragments are `oasis-p1` (OASIS base for headers; no `ms` page covers headers, so no `ms` fragment is a candidate). Parents 5, 8, 8.1, 8.2, 8.3 are decided through their children (8 is over 400 lines; the others only hold an intro sentence).

### Fragment decisions

| fragment | decision | where / reason |
|---|---|---|
| oasis-p1-5 | exclude | parent; decided on its children (5.1 in, 5.2 out); its own text is the two child intros |
| oasis-p1-5.1 | include | protocol-versioning.md (gate A: `OData-MaxVersion`/`OData-Version` appear in SL only as a one-line note, no SL hoja explains them) |
| oasis-p1-5.2 | exclude | model versioning (`Core.SchemaVersion`, `$schemaversion`, safe model changes) serves service authors; SL has one fixed model |
| oasis-p1-8 | exclude | parent over 400 lines; decided on its children |
| oasis-p1-8.1 | exclude | parent; only an intro sentence, children decided below |
| oasis-p1-8.1.1 | exclude | Content-Type: SL already defines it (`faq/common-issues.md`); format parameters belong to the JSON format fragments of other bloques |
| oasis-p1-8.1.2 | exclude | Content-Encoding: no consumer question; `Capabilities.AcceptableEncodings` is service side |
| oasis-p1-8.1.3 | exclude | Content-Language: generic HTTP, no SL hits, no concrete integration question |
| oasis-p1-8.1.4 | exclude | Content-Length: generic HTTP |
| oasis-p1-8.1.5 | merge | protocol-versioning.md (OData-Version: what the client sends and reads; absent-header rule) |
| oasis-p1-8.2 | exclude | parent; only an intro sentence, children decided below |
| oasis-p1-8.2.1 | exclude | Accept: the 13 lines are charset and batch inheritance rules; the useful Accept values (`odata.metadata=...`) live in the JSON-format fragments; in doubt exclude (question 3) |
| oasis-p1-8.2.2 | exclude | Accept-Charset: generic HTTP, one batch-inheritance rule |
| oasis-p1-8.2.3 | exclude | Accept-Language: generic HTTP, no SL hits |
| oasis-p1-8.2.4 | merge | etag-and-concurrency.md (If-Match semantics, 412, 428, `*`, upsert effect) |
| oasis-p1-8.2.5 | merge | etag-and-concurrency.md (If-None-Match semantics, 304 vs 412, `*` effect) |
| oasis-p1-8.2.6 | exclude | Isolation snapshot: not stated as supported by SL, and an unsupported value yields 412; in doubt exclude (question 4) |
| oasis-p1-8.2.7 | merge | protocol-versioning.md (OData-MaxVersion rules and default when absent) |
| oasis-p1-8.2.8 | include | prefer-header.md (gate A: SL explains only `odata.maxpagesize` and `return-no-content`; generic Prefer, `return=minimal/representation`, `include-annotations`, `continue-on-error`, `respond-async`, `wait` are unexplained. Question: "which Prefer values exist and what does the response `Preference-Applied` mean?") |
| oasis-p1-8.3 | exclude | parent; only an intro sentence, children decided below |
| oasis-p1-8.3.1 | exclude | AsyncResult: only on async status monitors (4.01), belongs to async handling; if bloque 9 keeps async it covers it |
| oasis-p1-8.3.2 | include | etag-and-concurrency.md (base: ETag header, weak vs strong, metadata ETag, batch rule) |
| oasis-p1-8.3.3 | include | response-headers.md (base; Question: "where is the URL of the created entity or of the async status resource?") |
| oasis-p1-8.3.4 | merge | response-headers.md (OData-EntityId on a 204 create/upsert; question: "how do I get the new key after `return=minimal`?") |
| oasis-p1-8.3.5 | exclude | OData-Error header: trailing error in streamed responses, no consumer question |
| oasis-p1-8.3.6 | merge | prefer-header.md (Preference-Applied is the response side of Prefer) |
| oasis-p1-8.3.7 | merge | response-headers.md (Retry-After on 202 and 3xx; question: "how long to wait before polling the status resource?") |
| oasis-p1-8.3.8 | exclude | Vary: caching of responses, no SL hits to explain, no integration question |

### Hojas

| hoja | title | fragments | mode | unit | SL candidates |
|---|---|---|---|---|---|
| headers-and-versioning/etag-and-concurrency.md | ETag and concurrency | oasis-p1-8.3.2 (base), oasis-p1-8.2.4, oasis-p1-8.2.5 (same topic: request-side rules of the ETag header, so the hoja has one wording) | condense | u1 | reference/etag/etag-guide.md; reference/etag/etag-usage.md |
| headers-and-versioning/protocol-versioning.md | Protocol versioning: OData-Version and OData-MaxVersion | oasis-p1-5.1 (base), oasis-p1-8.1.5, oasis-p1-8.2.7 (the header rules incl. batch inheritance, which 5.1 only summarises) | condense | u1 | reference/consuming-service-layer/semantic-layer-views/deployment-and-scope.md; reference/consuming-service-layer/batch-operations.md |
| headers-and-versioning/prefer-header.md | Prefer header and Preference-Applied | oasis-p1-8.2.8 (base), oasis-p1-8.3.6 (response side of the same mechanism) | condense | u2 | reference/consuming-service-layer/crud-operations.md; reference/consuming-service-layer/query-options/pagination.md; reference/sql-query/list-with-paging.md |
| headers-and-versioning/response-headers.md | Location, OData-EntityId and Retry-After | oasis-p1-8.3.3 (base), oasis-p1-8.3.4, oasis-p1-8.3.7 (same shape: short response-header rules) | copy | u3 | reference/consuming-service-layer/crud-operations.md |

Notes for the transcriber of `prefer-header.md` (condense, 208 + 7 lines): keep `return=minimal`/`return=representation`, `include-annotations`, `maxpagesize`, `continue-on-error`, `respond-async` and `wait` with their MUST/SHOULD and examples; drop `allow-entityreferences`, `callback`, `track-changes` (delta, not consumer scope here) and `omit-values` (4.01, no SL evidence) and say nothing about them. Check `limitations.md` shows no contradiction; if SL says otherwise, it wins in the `In Service Layer:` line.

Notes for `etag-and-concurrency.md`: state the generic protocol rule only (MUST/SHOULD of 8.3.2, 8.2.4, 8.2.5: weak vs strong, `*`, 412, 428, 304, upsert effect, batch rule). Do not copy the verified SL facts (SHA1 `DataVersion`, header-vs-body placement, silent ignoring of malformed or strong `If-Match`, `If-None-Match` GET returning 200, `If-Match` ignored on inner batch requests). The `In Service Layer:` line may append `SL differs:` only for what the SL hojas state explicitly (weak validation `W/"..."`, GET `If-None-Match` not honoured, inner batch `If-Match` ignored); the transcriber verifies each against `etag-guide.md` before writing it.

### Unidades de trabajo

| unit | fragments | hojas | status | notes |
|---|---|---|---|---|
| u1 | oasis-p1-8.3.2, oasis-p1-8.2.4, oasis-p1-8.2.5, oasis-p1-5.1, oasis-p1-8.1.5, oasis-p1-8.2.7 | headers-and-versioning/etag-and-concurrency.md, headers-and-versioning/protocol-versioning.md | reviewed | about 70 lines of fragment text |
| u2 | oasis-p1-8.2.8, oasis-p1-8.3.6 | headers-and-versioning/prefer-header.md | reviewed | about 215 lines |
| u3 | oasis-p1-8.3.3, oasis-p1-8.3.4, oasis-p1-8.3.7 | headers-and-versioning/response-headers.md | reviewed | about 15 lines |

### Disambiguation candidates

- OData generic ETag (`etag-and-concurrency.md`) vs SL `reference/etag/etag-guide.md`, `etag-usage.md`, `etag-entities-and-metadata.md`: same header; SL hashing, placement and quirks live only in SL.
- OData `Prefer: return=minimal` (`prefer-header.md`) vs SL `Prefer: return-no-content` in `reference/consuming-service-layer/crud-operations.md`: similar effect, different token.
- OData `Prefer: odata.maxpagesize` vs SL `reference/consuming-service-layer/query-options/pagination.md` and `reference/sql-query/list-with-paging.md`.
- OData `OData-MaxVersion`/`OData-Version` (`protocol-versioning.md`) vs SL OData V3 note in `reference/consuming-service-layer/semantic-layer-views/deployment-and-scope.md` and `/b1s/v1` vs `/b1s/v2` service versions (SL versions are URL based, not these headers).
- OData `Location`/`OData-EntityId` (`response-headers.md`) vs SL create responses in `reference/consuming-service-layer/crud-operations.md`.

### Questions

1. Keep `respond-async` and `wait` in `prefer-header.md` although bloque 9 (batch-and-async) may cover async? Recommendation: keep, one short subsection, since the preference is defined by the header; bloque 9 covers the status monitor flow.
2. Include Retry-After and Location for 202 although SL may not support async requests? Recommendation: keep (two sentences each in a `copy` hoja); the `In Service Layer:` line says what SL does not support if limitations show it.
3. Add a small content-negotiation hoja for Accept/Content-Type/Accept-Charset? Recommendation: no; the OData-specific `Accept` format parameters belong to the JSON format fragments and SL already defines Content-Type.
4. Add `Isolation` (snapshot) as a hoja? Recommendation: no, in doubt exclude, unless SL support is confirmed.
5. 5.2 Model versioning and `$schemaversion`: exclude (service authors). Confirm.

## Plan: status-codes-and-errors

Approved: 2026-10-02 (supervisor, delegated by the user)

### Fragment decisions

| fragment | decision | where / reason |
|---|---|---|
| oasis-p1-9 | merge | status-codes-and-errors/status-codes.md (intro paragraphs only: "MAY use any valid HTTP status", "SHOULD be as specific as possible"; its children 9.4 and 9.5 are decided separately, and 9.1-9.3 are listed directly in the hoja) |
| oasis-p1-9.1 | include | status-codes.md. Gate A: 200/201/202/204/3xx/304 appear in SL (crud, batch, etag) but no SL hoja defines what each code means in OData (sl-hits: 6 of 12 terms not in SL). Question: "does a 204 mean success or empty?", "what is 304?" |
| oasis-p1-9.2 | include | status-codes.md. Gate A/B: "what does 404/405/406/410/412/424 mean?"; 410, 424, 405 `Allow`, 406 not in SL. Includes the rule that an error status leaves no observable change |
| oasis-p1-9.3 | include | status-codes.md. Gate B: "what does 501 mean?" (only 501 is defined; 5xx general rule) |
| oasis-p1-9.4 | merge | error-response.md. Gate A/B: "what fields does an error body have?"; same content as oasis-json-21.1 in format-neutral wording, merged to avoid two wordings |
| oasis-p1-9.5 | merge | in-stream-errors.md. Same content as oasis-json-21.2 plus the generic statement "clients MUST treat the entire response as being in error" |
| oasis-json-21 | exclude | parent of 21.1-21.3, only a one-sentence intro; children are decided one by one, so no coverage overlap |
| oasis-json-21.1 | include | error-response.md. Gate B: "what is in the `error` object, what do `code`, `target`, `details`, `innererror` mean?"; SL shows the error shape in examples but no hoja explains it, and SL's shape differs (numeric `code`, `message` as object) |
| oasis-json-21.2 | include | in-stream-errors.md. Gate B: "the response was 200 but the JSON is cut off: is that an error?" and "what is the `OData-Error` trailing header?"; nothing in SL |
| oasis-json-21.3 | exclude | Error information in a success payload depends on the `continue-on-error` preference (and Core vocabulary terms); SL docs and limitations never mention it, so SL support is unverified: in doubt, exclude (see Questions) |
| oasis-json-21.3.1 | exclude | child of 21.3 (`Core.ValueException`), same reason |
| oasis-json-21.3.2 | exclude | child of 21.3 (`Core.ResourceException`, `retryLink`), same reason |
| oasis-json-21.3.3 | exclude | child of 21.3 (partial collections with `nextLink`), same reason |

### Hojas

| hoja | title | fragments | mode | unit | SL candidates |
|---|---|---|---|---|---|
| status-codes-and-errors/status-codes.md | HTTP status codes | oasis-p1-9.1 (base), oasis-p1-9.2 (base), oasis-p1-9.3 (base), oasis-p1-9 (intro only) | copy | u1 | reference/etag/etag-guide.md; reference/consuming-service-layer/crud-operations.md; reference/consuming-service-layer/batch-operations.md |
| status-codes-and-errors/error-response.md | Error response body | oasis-json-21.1 (base), oasis-p1-9.4 (second: adds the format-neutral field list and the `Content-Language` / information-disclosure wording only if the JSON text lacks it; otherwise merged away with no extra text) | condense | u2 | reference/sql-query/query-errors.md; reference/etag/etag-usage.md; reference/consuming-service-layer/batch-operations.md |
| status-codes-and-errors/in-stream-errors.md | In-stream errors | oasis-json-21.2 (base), oasis-p1-9.5 (second: adds that clients MUST treat the entire response as in error and the general `OData-Error` statement) | copy | u2 | none |

### Unidades de trabajo

| unit | fragments | hojas | status | notes |
|---|---|---|---|---|
| u1 | oasis-p1-9, oasis-p1-9.1, oasis-p1-9.2, oasis-p1-9.3 | status-codes-and-errors/status-codes.md | reviewed | about 95 lines. Source has no code blocks or tables; the hoja is a list of codes, so use `##` per class and `###` per code, or a pipe table code / meaning / MUST rules if no sentence is lost. Transcriber note for "In Service Layer:": SL observed codes are 412 with `-2039` (etag-guide), 400 for invalid batch (batch-operations), 202 vs 200 for batch (batch-operations: 202 in OData V3, 200 in V4); SL has no hoja on 405/406/410/424/501. |
| u2 | oasis-json-21.1, oasis-p1-9.4, oasis-json-21.2, oasis-p1-9.5 | status-codes-and-errors/error-response.md; status-codes-and-errors/in-stream-errors.md | reviewed | about 74 lines. Two hojas in one unit: the topics are one family and share the `OData-Error` header text. Transcriber note for the "In Service Layer:" line of error-response.md: the SL docs show an error body as `{"error": {"code": -2039 (numeric), "message": {"lang": "en-us", "value": "..."}, "innererror": {"context": null, "trace": null}}}` (see sql-query/query-errors.md, etag/etag-usage.md, batch-operations.md), whereas OData says `code` is a string and `message` a string; `Content-Language` is not shown in SL. Append ` ; SL differs: code is numeric and message is an object {lang, value}` (SL wins, explicit in the SL examples). Error codes seen in SL hojas: -2039 (stale ETag, 412), -5006 (cancel on closed order, 400), 702 (table not accessible, 400), -1000 (incomplete batch body, 400): the hoja must not list them, only point out the SL hojas. |

### Disambiguation candidates

- OData error `code` (string, service-defined sub-status) vs SL numeric error code in `error.code` (for example `-2039`, `702`, `-1000`): `status-codes-and-errors/error-response.md` vs `reference/sql-query/query-errors.md`, `reference/etag/etag-usage.md`.
- OData `412 Precondition Failed` (generic conditional request) vs SL ETag `412` with code `-2039`: `status-codes-and-errors/status-codes.md` vs `reference/etag/etag-guide.md` (and the ETag hoja of bloque headers-and-versioning).
- OData `424 Failed Dependency` and `202 Accepted` for batch and async vs SL batch behavior (outer 200 in V4, inner statuses per part, 400 for invalid batch body): `status-codes-and-errors/status-codes.md` vs `reference/consuming-service-layer/batch-operations.md`.
- OData `message` as string and `details` array vs SL `message` object `{lang, value}` and `innererror`: `error-response.md` vs `reference/consuming-service-layer/javascript-extension/exception-api.md` (the JS exception API also uses code and message).
- OData `target` (property in error) vs SL "target" elsewhere (view/webhook hojas): `error-response.md` vs `reference/consuming-service-layer/semantic-layer-views/service-root-and-metadata.md` (sl-hits: def in `reference/introduction-getting-started/introduction.md`).

### Questions

- Should `oasis-json-21.3` (error information in a success payload, `continue-on-error`, `Core.ValueException`, `Core.ResourceException`) stay excluded? Recommendation: exclude, since nothing in SL docs or limitations shows SL honouring `continue-on-error`; include it later only if verified on a live SL (a verification would also support an "In Service Layer:" line).
- Keep the three hojas, or fold `in-stream-errors.md` (about 20 lines of text) into `error-response.md`? Recommendation: keep separate: it answers a different question (200 but truncated body), and a copy hoja stays tiny.
- Is it acceptable that the `In Service Layer:` of `error-response.md` carries ` ; SL differs: code is numeric and message is an object {lang, value}`? Recommendation: yes, because three SL hojas show this explicitly; a live check against SL is not needed.
- `status-codes.md` is `copy` and has no SL-specific codes; should `In Service Layer:` list the three SL hojas (etag-guide, crud-operations, batch-operations) or only etag-guide? Recommendation: all three, since each shows real SL status codes.

## Plan: metadata-and-annotations

Approved: 2026-10-02 (supervisor, delegated by the user)

Scope note: the goal is "what a developer sees when reading Service Layer's `$metadata`", so only the read side of CSDL XML is in. Parent chapters `oasis-csdl-2`, `3`, `13`, `14`, `15` are not listed; their children are decided one by one (`14` is 1299 lines). The own text of those parents is intro only and is dropped. `oasis-csdl-4`, `5`, `6`, `7`, `8`, `9`, `10`, `11` are listed whole (a listed fragment covers its descendants).

### Fragment decisions

| fragment | decision | where / reason |
|---|---|---|
| oasis-p1-11.1 | include | metadata-and-annotations/metadata-requests.md. Gate A: SL's metadata-document hoja shows `GET /$metadata` but not the root-URL rule, the XML default when no format is given, or the JSON/XML media types. Question: "which format do I get from `$metadata` without Accept?" Covers 11.1.1 and 11.1.2. |
| oasis-csdl-2.1 | merge | metadata-requests.md. Gate B: "how do I ask for the XML metadata (`$format`, `Accept`) and what Content-Type comes back?" |
| oasis-csdl-2.2 | merge | metadata-document-structure.md. Gate B: "what are the `edmx` and default `edm` namespaces I see in `$metadata`?" (SL hoja shows them in examples without explanation). Covers 2.2.1, 2.2.2. |
| oasis-csdl-2.3 | exclude | XML schema files for validating a document; authoring and tooling. |
| oasis-csdl-2.4 | exclude | document order rules for authors. |
| oasis-csdl-3.1 | exclude | one-paragraph introduction to nominal types; no lookup value. |
| oasis-csdl-3.2 | exclude | one-paragraph introduction to structured types; covered by the type hojas. |
| oasis-csdl-3.3 | include | metadata-and-annotations/edm-primitive-types.md. Gate A (1 of 12 terms in SL, no SL hoja lists the primitive types). Question: "what does `Edm.Decimal` or `Edm.DateTimeOffset` in `$metadata` mean?" |
| oasis-csdl-3.4 | exclude | abstract types (`Edm.PrimitiveType`, `Edm.ComplexType`...) used in vocabulary terms and model rules, not seen in a service's entity model. |
| oasis-csdl-3.5 | exclude | built-in types for defining vocabulary terms; authoring. |
| oasis-csdl-3.6 | merge | annotations.md. Gate B: "can the same term be applied twice to one element?" (term plus qualifier uniqueness rule). |
| oasis-csdl-4 | include | metadata-and-annotations/metadata-document-structure.md (base). Gate A: `edmx:Edmx`, `DataServices`, `Reference` and `Include` appear in every `$metadata` and in SL's annotation example (`edmx:Reference`), and no SL hoja explains them. Covers 4.1, 4.2, 4.3. |
| oasis-csdl-5 | merge | metadata-document-structure.md. Gate B: "what are `Schema Namespace="SAPB1"` and `Alias`?" Covers 5.1 Alias and 5.2 external targeting (`Annotations Target=`), which readers of annotated metadata meet. |
| oasis-csdl-15.1 | merge | metadata-document-structure.md (namespace rules, 3 lines). |
| oasis-csdl-15.2 | exclude | identifier syntax for authors. |
| oasis-csdl-15.3 | merge | metadata-document-structure.md. Gate B: "how are `SAPB1.Document` / `Edm.String` qualified names built?" |
| oasis-csdl-15.4 | merge | annotations.md. Gate B: "what does the `Target` of an annotation point to?" |
| oasis-csdl-6 | include | metadata-and-annotations/entity-types-and-keys.md. Gate B: "how do I read an `EntityType`, its `Key`/`PropertyRef`, `BaseType`, `Abstract`, `OpenType`, `HasStream`?" SL shows `EntityType` with `Key` but explains none of the attributes. Covers 6.1-6.5. |
| oasis-csdl-7 | include | metadata-and-annotations/properties-and-facets.md. Gate B: "what do `Nullable`, `MaxLength`, `Precision`, `Scale`, `Unicode`, `SRID`, `DefaultValue` mean on a `Property`?" Covers 7.1, 7.2.x. |
| oasis-csdl-8 | include | metadata-and-annotations/navigation-properties.md. Gate B: "what do `NavigationProperty` `Type`, `Partner`, `ContainsTarget`, `ReferentialConstraint`, `OnDelete` mean?" (SL `associations` covers using `$expand`, not the metadata declaration). Covers 8.1-8.6. |
| oasis-csdl-9 | include | metadata-and-annotations/complex-enum-and-type-definitions.md (base). Gate B: "what is a `ComplexType` such as `DocumentLine` vs an `EntityType`?" Covers 9.1-9.3. |
| oasis-csdl-10 | merge | complex-enum-and-type-definitions.md. Gate B: "how do I read an `EnumType` (`Member Name/Value`, `IsFlags`, `UnderlyingType`)?" SL shows `BoCardTypes` without explaining it. Covers 10.1-10.3. |
| oasis-csdl-11 | merge | complex-enum-and-type-definitions.md. Gate B: "what is a `TypeDefinition` in `$metadata`?" Covers 11.1. |
| oasis-csdl-12 | exclude | defining actions and functions (authoring); SL explains actions in `consuming-service-layer/actions.md`. Covers 12.1-12.9. |
| oasis-csdl-13.1 | exclude | extending an entity container; authoring. |
| oasis-csdl-13.2 | include | metadata-and-annotations/entity-container.md (base). Gate B: "how do I find the entity sets in `$metadata` and what does `EntitySet EntityType=` mean?" (SL hoja shows `EntitySet` only in an example). |
| oasis-csdl-13.3 | merge | entity-container.md. Gate B: "what is a `Singleton` in `$metadata`?" |
| oasis-csdl-13.4 | merge | entity-container.md. Gate B: "what is `NavigationPropertyBinding`?" Covers 13.4.1, 13.4.2. |
| oasis-csdl-13.5 | exclude | action import; defining actions is out of scope and SL covers calling them. |
| oasis-csdl-13.6 | exclude | function import; same reason. |
| oasis-csdl-14.1 | include | metadata-and-annotations/terms-and-vocabularies.md. Gate B: "what is the `Term` definition (`SAPB1.TableName`, `AppliesTo`, `Type`) that an annotation refers to?" SL shows `Term ... AppliesTo=` without explanation. Covers 14.1.1 and 14.1.2. |
| oasis-csdl-14.2 | include | metadata-and-annotations/annotations.md (base). Gate A: `Annotation` is in SL metadata (ETag `OptimisticConcurrency`, `Common.Label`) but no SL hoja defines the element, `Qualifier` or `Target`. Covers 14.2.1, 14.2.2. |
| oasis-p1-3.1 | merge | annotations.md, role `second`: adds the protocol-level definition (term, target, value; vocabulary). |
| oasis-csdl-14.3 | exclude | constant expression syntax per primitive type (12 near-identical subsections); authoring. The `String=` shorthand is visible in the 14.2 examples. |
| oasis-csdl-14.4 | exclude | dynamic expressions (path, operators, `Apply`, `Cast`, `Record`...); authoring of annotation values, 764 lines. |
| oasis-csdl-16 | exclude | complete example documents; hojas take examples from the element fragments. The only `OptimisticConcurrency` mention in CSDL is inside 16.1; CSDL does not define the term and SL's etag hojas cover it. |
| oasis-csdl-17 | exclude | conformance levels. |

Fragments decided: 37 (10 include, 12 merge, 15 exclude).

### Hojas

| hoja | title | fragments | mode | unit | SL candidates |
|---|---|---|---|---|---|
| metadata-and-annotations/metadata-requests.md | Service document and metadata document requests | oasis-p1-11.1 (base), oasis-csdl-2.1 (second: adds `$format`/`Accept`/Content-Type for the XML representation) | copy | u1 | reference/consuming-service-layer/metadata-document.md |
| metadata-and-annotations/metadata-document-structure.md | Structure of a metadata document (Edmx, Reference, Schema) | oasis-csdl-4 (base), oasis-csdl-2.2 (second: namespaces `edmx`/`edm`), oasis-csdl-5 (merge), oasis-csdl-15.1 (merge), oasis-csdl-15.3 (merge) | condense | u1 | reference/consuming-service-layer/metadata-document.md; reference/consuming-service-layer/semantic-layer-views/service-root-and-metadata.md |
| metadata-and-annotations/edm-primitive-types.md | Edm primitive types | oasis-csdl-3.3 (base) | copy | u1 | reference/consuming-service-layer/metadata-document.md |
| metadata-and-annotations/entity-types-and-keys.md | Entity types and keys | oasis-csdl-6 (base) | condense | u2 | reference/consuming-service-layer/metadata-document.md |
| metadata-and-annotations/properties-and-facets.md | Structural properties and facets | oasis-csdl-7 (base) | condense | u2 | reference/consuming-service-layer/metadata-document.md; reference/consuming-service-layer/user-defined-fields.md |
| metadata-and-annotations/navigation-properties.md | Navigation properties | oasis-csdl-8 (base) | condense | u2 | reference/consuming-service-layer/associations.md |
| metadata-and-annotations/complex-enum-and-type-definitions.md | Complex types, enumeration types and type definitions | oasis-csdl-9 (base), oasis-csdl-10 (merge), oasis-csdl-11 (merge) | condense | u2 | reference/consuming-service-layer/metadata-document.md |
| metadata-and-annotations/entity-container.md | Entity container, entity sets and singletons | oasis-csdl-13.2 (base), oasis-csdl-13.3 (merge), oasis-csdl-13.4 (merge) | condense | u3 | reference/consuming-service-layer/metadata-document.md |
| metadata-and-annotations/terms-and-vocabularies.md | Terms and vocabularies | oasis-csdl-14.1 (base) | condense | u3 | reference/consuming-service-layer/metadata-document.md |
| metadata-and-annotations/annotations.md | Annotations in metadata | oasis-csdl-14.2 (base), oasis-p1-3.1 (second: protocol-level definition of term, target, value), oasis-csdl-3.6 (merge), oasis-csdl-15.4 (merge) | condense | u3 | reference/etag/etag-entities-and-metadata.md; reference/consuming-service-layer/metadata-document.md |

### Unidades de trabajo

| unit | fragments | hojas | status | notes |
|---|---|---|---|---|
| u1 | oasis-p1-11.1, oasis-csdl-2.1, oasis-csdl-2.2, oasis-csdl-4, oasis-csdl-5, oasis-csdl-15.1, oasis-csdl-15.3, oasis-csdl-3.3 | metadata-and-annotations/metadata-requests.md, metadata-and-annotations/metadata-document-structure.md, metadata-and-annotations/edm-primitive-types.md | reviewed | about 372 lines |
| u2 | oasis-csdl-6, oasis-csdl-7, oasis-csdl-8, oasis-csdl-9, oasis-csdl-10, oasis-csdl-11 | metadata-and-annotations/entity-types-and-keys.md, metadata-and-annotations/properties-and-facets.md, metadata-and-annotations/navigation-properties.md, metadata-and-annotations/complex-enum-and-type-definitions.md | reviewed | about 853 lines; condense drops authoring-only rules but keeps every attribute, value and MUST a reader of `$metadata` needs |
| u3 | oasis-csdl-13.2, oasis-csdl-13.3, oasis-csdl-13.4, oasis-csdl-14.1, oasis-csdl-14.2, oasis-p1-3.1, oasis-csdl-3.6, oasis-csdl-15.4 | metadata-and-annotations/entity-container.md, metadata-and-annotations/terms-and-vocabularies.md, metadata-and-annotations/annotations.md | reviewed | about 420 lines |

### Disambiguation candidates

- OData `$metadata` request (`$format`/`Accept` selects XML) vs SL `reference/consuming-service-layer/metadata-document.md`, which also has SL-specific `$metadata` query options `scope`, `entityset`, `dependency`, `annotation`. These are not OData; `annotation=label` is a query option, unlike an OData Annotation element.
- OData Annotation / Term (`annotations.md`, `terms-and-vocabularies.md`) vs SL `reference/etag/etag-entities-and-metadata.md` (the `Org.OData.Core.V1.OptimisticConcurrency` annotation on an entity set) and SL metadata-document's `Common.Label`, `SAPB1.TableName`, `SAPB1.ColumnName`, `SAPB1.ValidValue` terms.
- OData EntityType/ComplexType/EnumType vs SL Business Object Metadata (`reference/consuming-service-layer/user-defined-objects/udo-metadata.md`, `reference/appendix-di-api-comparison/metadata-naming-differences.md`): UDO or DI-API "metadata" is not the CSDL type metadata.
- OData navigation property vs SL associations (`reference/consuming-service-layer/associations.md`).
- OData service document (`metadata-requests.md`) vs SL `reference/consuming-service-layer/semantic-layer-views/service-root-and-metadata.md` ("service root" of a view).

### Questions

- Entity container (`oasis-csdl-13.2/13.3/13.4`) was not on the candidate list; recommended: include (it is what a developer reads to find entity sets). Alternative: drop the hoja, u3 shrinks by about 134 lines.
- `oasis-csdl-13.5/13.6` (action and function imports) are excluded; recommended: keep excluded (SL covers calling actions). Alternative: one short `copy` hoja to read `ActionImport` in `$metadata`.
- `oasis-csdl-14.3` constant expressions (241 lines) are excluded; recommended: keep excluded. Alternative: a `condense` hoja on annotation value attributes if SL metadata shows more than `String=`.
- `OptimisticConcurrency`: CSDL mentions it only in the 16.1 example, so no hoja covers it; recommended: leave it to bloque 6 and SL's `reference/etag/etag-entities-and-metadata.md`, with a pointer only in the `In Service Layer:` line of `annotations.md`.
- `oasis-csdl-4` is included whole (177 lines) including 4.3 Included Annotations; recommended: keep and let the transcriber condense 4.3 heavily. Alternative: exclude 4.3 by listing 4.1 and 4.2 only, losing the `edmx:Edmx` own text.
- Whether SL's metadata can return JSON: recommended: do not cover it; `metadata-requests.md` copies the p1 sentences as printed and a reviewer decides whether to add `SL differs:`.

## Plan: batch-and-async

Approved: 2026-10-02 (supervisor, delegated by the user)

Status: `dropped` (every fragment excluded; no hojas, no folder).

Reason: SL `reference/consuming-service-layer/batch-operations.md` (3.9) already defines the multipart `$batch` request: method and URI, headers, body, change sets (atomic unit, no GET), `Content-ID` and `$<Content-ID>` references, response formats and the stop-on-first-failure behaviour. `reference/etag/etag-guide.md` (Batch requests) covers ETag in `$batch` with verified behaviour (inner `If-Match` ignored). `reference/limitations/limitations.md` says OData batch rollback is unsupported. The remaining OData batch features (JSON batch format, atomicity groups, `424`, value references) and asynchronous requests (`Prefer: respond-async`, status monitor) are not mentioned anywhere in SL: documenting them would present as available features that SL does not document and that were never verified, so no hoja can state them safely. Neither `respond-async` nor `odata.continue-on-error` is touched by SL.

### Fragment decisions

| fragment | decision | where / reason |
|---|---|---|
| oasis-p1-11.6 | exclude | `Prefer: respond-async` and status monitor are not in SL and not documented as supported; documenting an unverified feature would mislead (in doubt, exclude). |
| oasis-p1-11.7 | exclude | Parent over 400 lines; children decided below; SL batch-operations.md covers the mechanics. |
| oasis-p1-11.7.1 | exclude | Batch request headers (Content-Type, boundary, OData-Version, 200 OK) are defined in SL batch-operations.md (all 9 terms hit, heading hit). |
| oasis-p1-11.7.2 | exclude | Atomicity groups and `424` are JSON-batch features; SL documents only multipart change sets (defined in SL). |
| oasis-p1-11.7.3 | exclude | Request identifiers: SL defines `Content-ID`; the OData rule adds no integration question. |
| oasis-p1-11.7.4 | exclude | `$<id>` references to created entities are defined by SL (Content-ID, change sets); the system-resource collision is a minor edge case. |
| oasis-p1-11.7.5 | exclude | ETag references in batch: SL etag-guide.md verified that inner `If-Match` is ignored; including it would contradict SL (SL wins). |
| oasis-p1-11.7.6 | exclude | Value references from response bodies: not documented as supported in SL; unverified. |
| oasis-p1-11.7.7 | exclude | Multipart batch format (347 lines): SL batch-operations.md explains it with samples and responses (11 of 12 terms in SL). |

### Hojas

None.

### Unidades de trabajo

None.

### Disambiguation candidates

None (no hojas). Seed noted: OData `$batch` generic rules vs SL `reference/consuming-service-layer/batch-operations.md` stay in SL only.

### Questions

- Confirm `dropped` for bloque #9? Recommendation: yes. Alternative: a single `condense` hoja on the JSON batch format and async requests, but only after verifying on a live SL that they work (SL docs and limitations do not mention them); until then it is unverifiable.
- Should the project verify on a live SL whether `Prefer: respond-async` and `Content-Type: application/json` batch are accepted, as was done for ETag? Recommendation: not now; revisit as a separate verified-facts item if an integration needs it.

## Decisions

- 2026-10-02 user (delegated to the supervisor): bloque list and order as in the Bloques table (profile.md starting list).
- 2026-10-02 user (delegated): source precedence per hoja: Microsoft Learn is the base when it has a page on the topic, OASIS when the topic is normative; OASIS wins on conflict.
- 2026-10-02 user (delegated): relevance rule: a fragment is included only if SL has a gap on it (gate A) or it answers a concrete developer question (gate B); implementing-a-service topics, unsupported SL features and well-explained SL topics are excluded.
- 2026-10-02 user (delegated): hoja modes `copy` (tables, headers, status codes) and `condense` (long narrative), recorded only in the ledger.
- 2026-10-02 user: attribution only in `reference/odata/index.md`; hojas carry no copyright line.
- 2026-10-02 user (delegated): sources extended with OData JSON Format 4.01 and CSDL XML 4.01 (OASIS os) besides Part 1/2 and Microsoft Learn.
- 2026-10-02 user (delegated): DOCS is the staging folder `factory/docs-src/odata-staging` until the user reviews; nothing is written under `factory/docs-src/service-layer/`; every change that would touch it is an item in `PENDING-REVIEW.md`.
- 2026-10-02 supervisor: plans are approved by the supervisor as `Approved: 2026-10-02 (supervisor, delegated by the user)`.
- 2026-10-02 supervisor (delegated): bloque `batch-and-async` dropped — SL already covers multipart `$batch`; async/JSON-batch unverified.
- 2026-10-02 supervisor (delegated): reading-data does not borrow `oasis-p1-11.2.6` (paging stays in query-options); `oasis-json-4.5.5` stays for nextLink shape.

## Notes

- Extraction counts match profile.md (424 nodes, 0 warning groups). SHA-256 of OASIS HTML matches profile.md. `WORK/warnings.md` lists only by-design exclusions and conversion notes.
- Code fences in `query-options-overview.md` and `url-structure-and-syntax.md` split so each fenced block is a contiguous substring of the cited fragments (MS/OASIS often put URLs in inline code).
- Metadata hojas `metadata-document-structure.md`, `navigation-properties.md` and `complex-enum-and-type-definitions.md` were missing from an earlier parallel pass and were transcribed in this session.
- `verify_odata_block.py`: fragment-decision parser takes the first token of the fragment cell (notes in parentheses ignored); an `exclude` parent no longer blocks citing a child that has its own `include`/`merge` row.

### Collected during the build


## SL conflicts / observations (reviewers; not stated as `SL differs` unless SL says it explicitly)
- bloque 6 response-headers.md: SL "Create Entity with No Content" (crud-operations.md) shows 204 with `Location` and `Preference-Applied` but no `OData-EntityId`, which OData 4.01 requires on a 204 create. Not written as a difference (SL does not say it).
- bloque 6 / 4: SL uses `Prefer: return-no-content` for a create without content; OData uses `return=minimal`. The `SL differs` clause states only what SL says.
- bloque 6 prefer-header.md: SL `odata.maxpagesize=0` disables paging (OData requires a positive integer); SL documents only the `odata.`-prefixed name. Not written as a difference.
- bloque 6 protocol-versioning.md: SL accepts OData v3 by `OData-MaxVersion: 3.0` or `MaxDataServiceVersion: 3.0` (deployment-and-scope.md, Semantic Layer views); not a stated contradiction.
- bloque 7 status-codes.md: SL batch-operations.md says a valid batch returns `202 Accept` in OData V3 and `200 OK` in V4; OData defines 202 only for asynchronous acceptance. Observation only.
- bloque 7 error-response.md: SL docs are inconsistent among themselves: etag-usage.md shows string `code` ("-2039") and string `message`; query-errors.md shows numeric `code` and object `message` {lang, value}. The `SL differs` clause was narrowed to SQL Query errors.
- bloque 4 modify-relationships.md: SL associations.md has no `$ref`/`odata.bind`/`$links` content. Verified on live SL (2026-10-02): `/$ref` and `$links` unsupported, `DELETE Entity/Nav/$ref` deletes the entity; written as `SL differs` (also in create-entity.md and related-entities-and-references.md).
- bloque 4 update-entity.md folds upsert (OASIS 11.4.4). Verified on live SL (2026-10-02): PATCH/PUT to a missing key returns 404 `-2028`, no upsert; written as `SL differs`. `Prop@odata.bind` is accepted and ignored.
- bloque 8 plan: SL `$metadata` may or may not return JSON: not covered.

## Source defects (transcribed as printed)
- oasis-p1-9.1 (202): double period; "the Data Service Request".
- oasis-json-21.2 Example 55: `OData-error:` vs prose `OData-Error`.
- oasis-p1-8.3.4: `OData-EntityID` vs `OData-EntityId`; 8.3.7 first sentence lacks final period.
- oasis-p1-8.2.8 Example 9: bullets do not match header; misplaced backtick in "respond-`async`".
- oasis-p1-11.4.2 Example 76: empty-string JSON key where `DirectReports@odata.bind` is expected; 11.4.3 Example 78: `Employees(5}` typos; "principle property" typo.
- ms-create-data/ms-update-data: code blocks tagged json but contain HTTP; 4-space indentation kept; ms-overview dangling sentence and image reference dropped.
- oasis-p1-11.4.6: "or an other appropriate error".
