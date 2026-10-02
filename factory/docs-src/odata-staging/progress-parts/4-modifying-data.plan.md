## Plan: modifying-data

Approved: pending (autonomous build delegated by the user, 2026-10-02)

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
| u1 | oasis-p1-11.4.2, oasis-p1-11.4.3, oasis-p1-11.4.4, oasis-p1-11.4.5, ms-create-data, ms-update-data, ms-delete-data | modifying-data/create-entity.md, modifying-data/update-entity.md, modifying-data/delete-entity.md | pending | about 298 lines |
| u2 | oasis-p1-11.4.1, oasis-p1-11.4.6 | modifying-data/modification-semantics.md, modifying-data/modify-relationships.md | pending | about 88 lines |

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
