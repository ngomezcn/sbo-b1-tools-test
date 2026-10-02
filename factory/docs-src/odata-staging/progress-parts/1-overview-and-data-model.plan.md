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
| u1 | ms-overview, oasis-p1-2, ms-data-model, oasis-p1-3, oasis-p1-4, oasis-p1-4.1, oasis-p1-4.2 | overview-and-data-model/what-is-odata.md, overview-and-data-model/entity-data-model.md, overview-and-data-model/service-model.md | pending | about 200 lines of fragment text in total (well under 1500); one unit because the topics are small and share vocabulary. |

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
