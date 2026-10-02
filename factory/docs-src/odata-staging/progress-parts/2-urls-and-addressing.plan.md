## Plan: urls-and-addressing

Approved: pending (autonomous build delegated by the user, 2026-10-02)

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
| u1 | oasis-p2-2, oasis-p2-3, ms-url-components | urls-and-addressing/url-structure-and-syntax.md | pending | about 95 lines of fragment text. Two wordings of the three-part split (Example 2 diagram and the ms diagram): keep one, OASIS wins. |
| u2 | oasis-p2-4.3, oasis-p2-4.3.1, oasis-p2-4.3.3, oasis-p2-4.9 | urls-and-addressing/addressing-entities.md; urls-and-addressing/key-predicates-and-canonical-urls.md | pending | about 190 lines of included text. oasis-p2-4.3 is listed for its own text only; its children 4.3.2, 4.3.4, 4.3.5, 4.3.6 are excluded (their text must not be copied) and 4.3.1, 4.3.3 go to the second hoja. If the user answers yes on alternate keys / key-as-segment / `$entity`, those subsections join `key-predicates-and-canonical-urls.md`. |

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
