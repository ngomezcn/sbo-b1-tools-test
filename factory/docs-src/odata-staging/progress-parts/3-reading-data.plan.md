## Plan: reading-data

Approved: (pending)

Notes on scope. Bloque 5 owns the system query option children of 11.2 (11.2.1, 11.2.5, 11.2.6, 11.2.11, 11.2.12); they are not decided here, except one borrowed excerpt (see Questions 1). Children of the oversized fragments 10 (436 lines), 11.2 (714) and 11.5 (227) are decided instead of the parents; a parent row means its own intro text only. SL wins on conflicts: SL does not allow addressing properties of complex types, does not support `odata.metadata=full`, and uses OData v3 annotations (`odata.count`, `odata.nextLink`, `$inlinecount`) next to the v4 ones.

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
| oasis-json-4.5.5 | include | collection-count-and-paging.md (second). Q: what is `@odata.nextLink`? Gate A: sl-hits 0 in SL. |
| oasis-p1-11.2.6--server-driven-paging | merge | collection-count-and-paging.md. Heading `Server-Driven Paging` inside 11.2.6 (owned by #5); next link is opaque, `$skiptoken`, `maxpagesize`. See Questions 1. |
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
| reading-data/read-entities-and-properties.md | Read entities and properties | ms-get-data (base), oasis-p1-11.2.2 (second: 404 rule, unadvertised properties, permissions), oasis-p1-11.2.4 (second: 204/404 and `$value` rules), oasis-json-11 (second: JSON of a property response) | condense | u1 | consuming-service-layer/individual-properties.md; consuming-service-layer/crud-operations.md; consuming-service-layer/query-options/basic-queries.md |
| reading-data/related-entities-and-references.md | Related entities, references and entity-ids | oasis-p1-11.2.7 (base), oasis-p1-11.2.8, oasis-p1-11.2.9 | copy | u2 | consuming-service-layer/associations.md |
| reading-data/collection-count-and-paging.md | Collection count and server-driven paging | oasis-p1-11.2.10 (base), oasis-json-13 (second: collection payload shape), oasis-json-4.5.4, oasis-json-4.5.5, oasis-p1-11.2.6--server-driven-paging | condense | u2 | consuming-service-layer/query-options/pagination.md; consuming-service-layer/query-options/aggregation.md; consuming-service-layer/query-options/options-reference.md |
| reading-data/invoking-functions.md | Invoking functions and bound operations | oasis-p1-11.5.4 (base), oasis-p1-11.5.1 (second: binding to a resource) | condense | u2 | consuming-service-layer/actions.md |
| reading-data/context-url.md | Context URL | oasis-p1-10 (base, intro), oasis-p1-10.1, oasis-p1-10.2, oasis-p1-10.3, oasis-p1-10.4, oasis-p1-10.11, oasis-p1-10.12, oasis-p1-10.13, oasis-p1-10.14, oasis-p1-10.15, oasis-p1-10.16 | copy | u3 | consuming-service-layer/overview-key-elements.md; consuming-service-layer/metadata-document.md |
| reading-data/json-control-information.md | JSON control information in responses | oasis-json-4.5.1 (base), oasis-json-4.5 (intro), oasis-json-4.5.3, oasis-json-4.5.8, oasis-json-4.5.9, oasis-json-4.5.10, oasis-json-4.5.11, oasis-json-3.1 (second: amount of control information) | condense | u4 | consuming-service-layer/overview-key-elements.md; etag/etag-entities-and-metadata.md; limitations/limitations.md |

### Unidades de trabajo

| unit | fragments | hojas | status | notes |
|---|---|---|---|---|
| u1 | ms-get-data, oasis-p1-11.2.2, oasis-p1-11.2.4, oasis-json-11 | reading-data/read-entities-and-properties.md | pending | about 250 lines |
| u2 | oasis-p1-11.2.7, oasis-p1-11.2.8, oasis-p1-11.2.9, oasis-p1-11.2.10, oasis-json-13, oasis-json-4.5.4, oasis-json-4.5.5, oasis-p1-11.2.6--server-driven-paging, oasis-p1-11.5.4, oasis-p1-11.5.1 | reading-data/related-entities-and-references.md; reading-data/collection-count-and-paging.md; reading-data/invoking-functions.md | pending | about 270 lines, three small hojas |
| u3 | oasis-p1-10, oasis-p1-10.1, oasis-p1-10.2, oasis-p1-10.3, oasis-p1-10.4, oasis-p1-10.11, oasis-p1-10.12, oasis-p1-10.13, oasis-p1-10.14, oasis-p1-10.15, oasis-p1-10.16 | reading-data/context-url.md | pending | about 210 lines (parent 10 own text 20 lines; do not copy its other children) |
| u4 | oasis-json-4.5, oasis-json-4.5.1, oasis-json-4.5.3, oasis-json-4.5.8, oasis-json-4.5.9, oasis-json-4.5.10, oasis-json-4.5.11, oasis-json-3.1 | reading-data/json-control-information.md | pending | about 195 lines (parent 4.5 own text 9 lines only) |

### Disambiguation candidates

- OData v4 `@odata.count` and `$count` vs SL `$inlinecount` and `odata.count`: `reference/consuming-service-layer/query-options/aggregation.md` (section inlinecount) and `options-reference.md`.
- OData `@odata.nextLink` (opaque, `$skiptoken`) vs SL `odata.nextLink` built with `$skip` and `Prefer: odata.maxpagesize`: `reference/consuming-service-layer/query-options/pagination.md`.
- OData property read of complex-type members and `204 No Content` for null vs SL `reference/consuming-service-layer/individual-properties.md` (complex types not allowed; missing value returns `200` with `odata.null`). SL differs.
- OData context URL / `$metadata` fragments vs SL Metadata Document `reference/consuming-service-layer/metadata-document.md`.
- OData `odata.metadata=full` vs SL limitation (`reference/limitations/limitations.md`): not supported.
- OData functions (`GET`, inline parameters) vs SL "function" in `reference/sql-query/sql-functions.md` (SQL functions, different thing) and SL actions (`reference/consuming-service-layer/actions.md`).
- OData `@odata.etag` and `@odata.editLink` in payloads vs SL `reference/etag/etag-entities-and-metadata.md`.

### Questions

1. Server-Driven Paging text lives only under heading `Server-Driven Paging` inside oasis-p1-11.2.6, which bloque 5 owns. Recommendation: bloque 5 takes the rest of 11.2.6 and leaves this heading to `collection-count-and-paging.md` (listed with the locator `oasis-p1-11.2.6--server-driven-paging`; it is not an outline node, so the supervisor must confirm the verifier accepts that locator). Alternative: put the paging hoja in bloque 5 and drop this row; `oasis-json-4.5.5` stays here.
2. Parent rows (`oasis-p1-10`, `oasis-json-4.5`) cover only their own intro text, but the rule "a listed fragment covers its descendants" would pull in all children. Recommendation: the supervisor/verifier treats them as own-text-only; otherwise drop both rows (the intros are 20 and 9 lines).
3. Excluded with "in doubt": `oasis-json-6` (Entity), `oasis-json-7` (value encoding: dates, Int64, Decimal as string). Recommendation: keep excluded; add a `json-value-encoding` hoja if users report encoding questions.
4. Context URL for `$select`/`$expand` (10.7 to 10.10) is excluded here. Recommendation: let bloque 5 decide; they are about query options.
5. `oasis-p1-11.5.5` and `11.5.2` (actions) are excluded because SL `actions.md` explains them; `invoking-functions.md` still covers the bound-operation URL rules of 11.5.1. Recommendation: keep.
6. The Microsoft base in `read-entities-and-properties.md` contains a complex-type property example (`Location/Address`) that SL does not allow; the hoja must keep it and say in the `In Service Layer:` line `SL differs: properties of complex types cannot be requested`. Recommendation: keep as is.
