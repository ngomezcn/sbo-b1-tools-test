## Plan: query-options

Approved: pending (autonomous build delegated by the user, 2026-10-02)

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
| u1 | ms-queryoptions-overview, ms-queryoptions-overview--custom-query-options, oasis-p1-11.2.1, oasis-p2-5.2 | query-options/query-options-overview.md | pending | about 212 lines of fragment text (the custom child is inside the ms parent's 166) |
| u2 | oasis-p1-11.2.6, oasis-p2-5.3, ms-queryoptions-overview--parameter-aliases | query-options/collection-query-semantics.md | pending | about 348 lines (the alias child is inside the ms parent's 166 and is counted in u1; transcriber reads the child text from `WORK/sections/ms-queryoptions-overview--parameter-aliases.md`); the 11.2.6 subsections excluded by scope are listed in the decision row |
| u3 | oasis-p1-11.2.5, oasis-p2-5.1.3, oasis-p2-5.1.4 | query-options/select-and-expand.md | pending | about 344 lines; the `$compute` subsection of 11.2.5 is out of scope |

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
