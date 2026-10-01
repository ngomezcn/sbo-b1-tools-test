# Docs build ledger: docs-service-layer

PDF: sources/service-layer/service-layer-docs-1.29.pdf · Skill: /build-docs-from-sl-pdf · Extracted: 2026-10-01

## RESUME HERE

**Done last session:** u1-u4 of `consuming-service-layer` transcribed and reviewed once; two extractor fixes in `extract_pdf.py` (brace fusion; undrawn leading spaces); fix jobs for u1-u4 dispatched to resync the hojas with the final markup.
**Next:** when the fix jobs return, dispatch fresh reviewers for u1-u4; then verify the unit statuses, then transcribe u5-u8.
**Waiting on the user:** REVIEW.md rows p013-01, p013-02, l012-01 are `pending`.
**Open decisions:** none.
**Suggested skills:** /build-docs-from-sl-pdf

## Apartados

| # | apartado | chapters | pages | status |
|---|---|---|---|---|
| 1 | introduction-getting-started | 1, 2 | 11-14 | done |
| 2 | consuming-service-layer | 3 | 15-139 | transcribing |
| 3 | sql-query | 4 | 140-160 | pending |
| 4 | etag | 5 | 161-166 | pending |
| 5 | configuring | 6 | 167-178 | pending |
| 6 | webhooks | 7 | 179-224 | pending |
| 7 | limitations | 8 | 225 | pending |
| 8 | high-availability-load-balancing | 9 | 226 | pending |
| 9 | faq | 10 | 227-228 | pending |
| 10 | appendix-di-api-comparison | 11, 12 | 229-248 | pending |

## Plan: introduction-getting-started

Approved: 2026-10-01

### Hojas

| hoja | title | sec | pages | unit |
|---|---|---|---|---|
| introduction-getting-started/introduction.md | Introduction | 1 | 11-11 | u1 |
| introduction-getting-started/system-requirements.md | System requirements | 2, 2.1 | 12-12 | u1 |
| introduction-getting-started/architecture-and-installation.md | Architecture and installation | 2.2, 2.3 | 12-14 | u1 |

### Unidades de trabajo

| unit | pages | sec | hojas | status | notes |
|---|---|---|---|---|---|
| u1 | 11-14 | 1, 2, 2.1, 2.2, 2.3 | introduction.md, system-requirements.md, architecture-and-installation.md | reviewed | 4 light pages, 2 block images, no code or tables; well under the 15-page ceiling. architecture-and-installation source line: `pdf pp. 12-14, sec 2.2, 2.3` (2.1 shares p12). |

### Disambiguation candidates

- Load balancer and session stickiness (2.2, 2.3) vs High Availability and Load Balancing (ch. 9) and Login and Logout / Session (3.1): here architecture and deployment; ch. 9 covers sticky-session configuration.
- Installation (2.3) vs Configuring (ch. 6) and Configuration by Request (6.3): 2.3 covers topologies and the firewall recommendation, not settings.
- OData version URIs (1.3 Note) vs Metadata Document (3.2): 1.3 only says which `$metadata` URI maps to OData v3 or v4.
- "CRUD operations" in the OData Parser bullet (2.2) vs CRUD Operations (3.4, 4.2) and CRUD APIs (11.1): passing mention only.

### Questions

1. Hoja split: 3 hojas as above, with 2.2 and 2.3 merged (recommended; the p13 load balancer figure leads into the 2.3 topology). Alternatives: 4 hojas (architecture-overview.md + installing.md) or 2 hojas (introduction.md + one getting-started.md).
2. Keep section 1 as its own hoja (recommended; "which OData versions and URIs" is a distinct lookup) or merge it with system-requirements into one overview.md.

## Plan: consuming-service-layer

Approved: 2026-10-01

### Hojas

| hoja | title | sec | pages | unit |
|---|---|---|---|---|
| consuming-service-layer/overview-key-elements.md | Key elements and terms | 3 | 15-15 | u1 |
| consuming-service-layer/login-logout-session.md | Login, logout and sessions | 3.1 | 16-17 | u1 |
| consuming-service-layer/metadata-document.md | Metadata document and service document | 3.2, 3.3 | 17-23 | u1 |
| consuming-service-layer/crud-operations.md | CRUD operations on entities | 3.4 | 23-28 | u2 |
| consuming-service-layer/actions.md | Actions | 3.5 | 28-31 | u2 |
| consuming-service-layer/query-options/index.md | Query options (overview) | 3.6 | 31-33 | u3 |
| consuming-service-layer/query-options/basic-queries.md | Get entities, fields and typed properties | 3.6.1, 3.6.2, 3.6.3, 3.6.4, 3.6.5 | 33-34 | u3 |
| consuming-service-layer/query-options/pagination.md | Paginate the selected orders | 3.6.6 | 34-35 | u3 |
| consuming-service-layer/query-options/aggregation.md | Aggregation | 3.6.7 | 35-40 | u3 |
| consuming-service-layer/query-options/grouping.md | Grouping | 3.6.8 | 40-42 | u3 |
| consuming-service-layer/query-options/cross-joins.md | Cross-joins | 3.6.9 | 42-47 | u4 |
| consuming-service-layer/query-options/row-level-filter.md | Row-level filter | 3.6.10 | 47-50 | u4 |
| consuming-service-layer/query-options/expand-enhancements.md | Expand query enhancements | 3.6.11 | 50-52 | u4 |
| consuming-service-layer/semantic-layer-views/index.md | Semantic Layer view exposure (overview) | 3.7 | 52-52 | u5 |
| consuming-service-layer/semantic-layer-views/deployment-and-scope.md | Views deployment, exposure scope and OData version | 3.7.1, 3.7.2, 3.7.3 | 52-53 | u5 |
| consuming-service-layer/semantic-layer-views/service-root-and-metadata.md | Semantic Layer service root and metadata | 3.7.4, 3.7.5 | 53-56 | u5 |
| consuming-service-layer/semantic-layer-views/view-authorization.md | Semantic Layer view authorization | 3.7.6 | 57-58 | u5 |
| consuming-service-layer/semantic-layer-views/view-query.md | Semantic Layer view query | 3.7.7 | 58-63 | u5 |
| consuming-service-layer/semantic-layer-views/customized-views.md | Customized views exposure and query | 3.7.8, 3.7.9 | 63-66 | u6 |
| consuming-service-layer/semantic-layer-views/basic-authentication.md | Semantic Layer basic authentication | 3.7.10 | 66-67 | u6 |
| consuming-service-layer/sql-view-exposure/index.md | SQL view exposure (overview) | 3.8 | 67-67 | u6 |
| consuming-service-layer/sql-view-exposure/create-and-expose-view.md | Create, expose and locate a SQL view | 3.8.1, 3.8.2, 3.8.3 | 67-69 | u6 |
| consuming-service-layer/sql-view-exposure/query-view.md | Query a SQL view | 3.8.4 | 70-73 | u6 |
| consuming-service-layer/sql-view-exposure/authorize-view.md | Authorize a SQL view | 3.8.5 | 73-74 | u6 |
| consuming-service-layer/batch-operations.md | Batch operations | 3.9 | 74-79 | u7 |
| consuming-service-layer/individual-properties.md | Retrieving individual properties | 3.10 | 79-81 | u7 |
| consuming-service-layer/associations.md | Associations and navigation properties | 3.11 | 81-84 | u7 |
| consuming-service-layer/user-defined-schemas.md | User-defined schemas | 3.12 | 84-86 | u7 |
| consuming-service-layer/user-defined-fields.md | User-defined fields (UDFs) | 3.13 | 86-90 | u8 |
| consuming-service-layer/user-defined-tables.md | User-defined tables (UDTs) | 3.14 | 90-92 | u8 |
| consuming-service-layer/user-defined-objects/index.md | User-defined objects (overview) | 3.15 | 92-92 | u9 |
| consuming-service-layer/user-defined-objects/udo-metadata.md | Managing metadata of UDOs | 3.15.1 | 92-96 | u9 |
| consuming-service-layer/user-defined-objects/udo-entity-operations.md | Create, retrieve, update, delete, cancel and close UDO entities | 3.15.2, 3.15.3, 3.15.4, 3.15.5, 3.15.6 | 96-100 | u9 |
| consuming-service-layer/attachments/index.md | Attachments (overview) | 3.16 | 100-100 | u10 |
| consuming-service-layer/attachments/setup-folder.md | Setting up an attachment folder | 3.16.1 | 100-103 | u10 |
| consuming-service-layer/attachments/upload.md | Uploading an attachment | 3.16.2 | 104-106 | u10 |
| consuming-service-layer/attachments/download-and-update.md | Downloading and updating attachments | 3.16.3, 3.16.4 | 107-110 | u10 |
| consuming-service-layer/stream-entity-upload.md | Stream entity upload | 3.17 | 110-112 | u10 |
| consuming-service-layer/item-and-employee-images.md | Item image and employee image | 3.18 | 112-116 | u11 |
| consuming-service-layer/javascript-extension/index.md | JavaScript extension (overview) | 3.19 | 116-116 | u11 |
| consuming-service-layer/javascript-extension/framework.md | Parsing engine, framework, entry function and URL mapping | 3.19.1, 3.19.2, 3.19.3, 3.19.4 | 116-118 | u11 |
| consuming-service-layer/javascript-extension/http-api.md | SDK overview, Http request and response API | 3.19.5, 3.19.5.1, 3.19.5.2 | 119-121 | u11 |
| consuming-service-layer/javascript-extension/entity-crud-api.md | Entity CRUD API | 3.19.5.3 | 121-123 | u12 |
| consuming-service-layer/javascript-extension/entity-query-api.md | Entity query API | 3.19.5.4 | 123-125 | u12 |
| consuming-service-layer/javascript-extension/transaction-api.md | Transaction API | 3.19.5.5 | 125-127 | u12 |
| consuming-service-layer/javascript-extension/exception-api.md | Exception API | 3.19.5.6 | 127-129 | u12 |
| consuming-service-layer/javascript-extension/logging-and-sdk-generator.md | Logging and SDK generator tool | 3.19.6, 3.19.7 | 129-130 | u12 |
| consuming-service-layer/javascript-extension/deployment.md | JavaScript deployment | 3.19.8 | 130-132 | u13 |
| consuming-service-layer/javascript-extension/use-cases.md | Typical use cases and consuming a script service from .NET | 3.19.9, 3.19.10 | 132-136 | u13 |
| consuming-service-layer/cors.md | Cross Origin Resource Sharing (CORS) | 3.20 | 136-137 | u13 |
| consuming-service-layer/ping-pong-api.md | Ping Pong API | 3.21 | 137-139 | u13 |

### Unidades de trabajo

| unit | pages | sec | hojas | status | notes |
|---|---|---|---|---|---|
| u1 | 15-23 | 3, 3.1, 3.2, 3.3 | overview-key-elements.md, login-logout-session.md, metadata-document.md | reviewed | p23 shared with u2 (u2 takes 3.4). 3.2.1 has 20 code blocks (pp. 19-23). |
| u2 | 23-31 | 3.4, 3.5 | crud-operations.md, actions.md | reviewed | p31 shared with u3 (u2 takes end of 3.5, u3 takes 3.6). |
| u3 | 31-42 | 3.6, 3.6.1-3.6.8 | query-options/index.md, basic-queries.md, pagination.md, aggregation.md, grouping.md | reviewed | 12 pages, code-heavy. p42 shared with u4 (u3 takes end of 3.6.8). |
| u4 | 42-52 | 3.6.9, 3.6.10, 3.6.11 | query-options/cross-joins.md, row-level-filter.md, expand-enhancements.md | reviewed | 11 pages. p52 shared with u5 (u4 takes end of 3.6.11). |
| u5 | 52-63 | 3.7, 3.7.1-3.7.7 | semantic-layer-views/index.md, deployment-and-scope.md, service-root-and-metadata.md, view-authorization.md, view-query.md | pending | 12 pages, images on pp. 53, 57, 62-63. p63 shared with u6 (u5 takes end of 3.7.7). |
| u6 | 63-74 | 3.7.8, 3.7.9, 3.7.10, 3.8 | semantic-layer-views/customized-views.md, basic-authentication.md, sql-view-exposure/* (5 hojas) | pending | 12 pages, images on pp. 63-66, 74. p74 shared with u7 (u6 takes end of 3.8.5). |
| u7 | 74-86 | 3.9, 3.10, 3.11, 3.12 | batch-operations.md, individual-properties.md, associations.md, user-defined-schemas.md | pending | 13 pages. p86 shared with u8 (u7 takes end of 3.12.1). |
| u8 | 86-92 | 3.13, 3.14 | user-defined-fields.md, user-defined-tables.md | pending | 7 pages. p92 shared with u9 (u8 takes end of 3.14.2). |
| u9 | 92-100 | 3.15 | user-defined-objects/index.md, udo-metadata.md, udo-entity-operations.md | pending | 9 pages. p100 shared with u10 (u9 takes end of 3.15.6). |
| u10 | 100-112 | 3.16, 3.17 | attachments/* (4 hojas), stream-entity-upload.md | pending | 13 pages, 13 images in 3.16, 1 in 3.17. p112 shared with u11 (u10 takes end of 3.17.2). |
| u11 | 112-121 | 3.18, 3.19, 3.19.1-3.19.5.2 | item-and-employee-images.md, javascript-extension/index.md, framework.md, http-api.md | pending | 10 pages. p116 holds end of 3.18.4 and start of 3.19. p121 shared with u12: u11 takes ONLY the end of 3.19.5.2 (up to the 3.19.5.3 heading); u12 takes 3.19.5.3 from that heading down. u11 owns the 3.19.5 intro and SDK overview. |
| u12 | 121-130 | 3.19.5.3, 3.19.5.4, 3.19.5.5, 3.19.5.6, 3.19.6, 3.19.7 | entity-crud-api.md, entity-query-api.md, transaction-api.md, exception-api.md, logging-and-sdk-generator.md | pending | 10 pages, 6 SDK tables, ~30 code blocks. p130 shared with u13: u12 takes 3.19.7 only; u13 takes 3.19.8 from its heading. u12 owns the six SDK API sections 3.19.5.3-3.19.5.6 (not u11). |
| u13 | 130-139 | 3.19.8, 3.19.9, 3.19.10, 3.20, 3.21 | deployment.md, use-cases.md, cors.md, ping-pong-api.md | pending | 10 pages. |

No unit exceeds 15 pages. 3.19.5 is split between u11 (own text, Http request/response) and u12 (the table-dense APIs). Supervisor change to the planner's output: added user-defined-objects/index.md (3.15) so every subfolder has an index.

### Disambiguation candidates

- Semantic Layer View Exposure (3.7) vs SQL View Exposure (3.8) vs SQL Query (ch. 4): all run SQL-backed queries through Service Layer, with different mechanisms.
- Metadata Document (3.2) and Semantic Layer Service Metadata (3.7.5) vs Metadata for Query Service (3.6.10.1) vs UDF/UDT/UDO metadata (3.13.1, 3.14.1, 3.15.1) vs Business Object Metadata (4.1), Metadata Naming Difference (ch. 12), ETag Metadata (5.4).
- CRUD Operations (3.4) vs UDF/UDT CRUD (3.13.2, 3.14.2) vs UDO entity operations (3.15.2-3.15.6) vs CRUD Operations (4.2) vs CRUD APIs (11.1) vs Entity CRUD API (3.19.5.3).
- Query Options (3.6) vs Entity Query API (3.19.5.4) vs Query APIs (11.4). Pagination (3.6.6) vs List with Paging (4.4) vs Retrieve Records with Paging (3.8.4.2).
- Semantic Layer View Authorization (3.7.6) vs Authorize View (3.8.5); Semantic Layer Basic Authentication (3.7.10) vs Login and Logout (3.1).
- Attachments (3.16) vs Stream Entity Upload (3.17) vs Item Image and Employee Image (3.18).
- Transaction API (3.19.5.5) and Change Sets (3.9.4) vs Batch Operations (3.9) vs JavaScript Complex Transactions (3.19.9.1).
- Exception API (3.19.5.6) vs error responses in the CRUD and batch sections.
- Expand Query Enhancements (3.6.11) vs $expand navigation (3.11.3) vs Cross-Joins with Expand (3.6.9.1).
- User-Defined Schemas (3.12) vs UDFs (3.13) vs UDTs (3.14) vs UDOs (3.15).
- Ping Pong API (3.21) vs High Availability and Load Balancing (ch. 9). CORS (3.20) vs Configuring (ch. 6).
- Service Document (3.3) vs Semantic Layer Service Root (3.7.4) vs the Service Root URL row on p15.

### Questions

1. Merge 3.3 Service Document (1 page) into metadata-document.md (recommended) or a separate service-document.md.
2. Chapter-3 intro table (p15) as its own overview-key-elements.md (recommended) or merged into login-logout-session.md.
3. 3.6.6 pagination as its own hoja (recommended) or part of basic-queries.md.
4. 3.7 and 3.8 as subfolders with routing-only index.md (recommended) or one flat hoja each (16 and 8 pages).
5. 3.7.10 Basic Authentication kept separate (recommended) or merged into view-authorization.md.
6. 3.19.10 (.NET consumption) merged into use-cases.md (recommended) or separate.
7. 3.15 UDO as user-defined-objects/ (index + 2 hojas) and 3.16 as attachments/ (index + 3 hojas), recommended; or one hoja each.
8. 3.13 UDFs and 3.14 UDTs flat, one hoja each (recommended) or a combined subfolder.

## Decisions

- 2026-10-01 user: apartado list confirmed as in profile.md.
- 2026-10-01 user: plan for introduction-getting-started approved as written (3 hojas, 2.2+2.3 merged, section 1 its own hoja).
- 2026-10-01 user: plan for consuming-service-layer approved as recommended (all 8 questions: 3.3 merged, own overview hoja, own pagination hoja, 3.7/3.8 subfolders, 3.7.10 separate, 3.19.10 merged, UDO/attachments subfolders, UDF/UDT flat). User also asked that u11/u12 carry an explicit who-takes-what note for 3.19.5 (added to unit notes).
- 2026-10-01 user (delegated to supervisor, "decidelo tu"): `POST / Orders(id)/Close` on p18 corrected to `POST /Orders(id)/Close` (the space is a line wrap; the formatter also breaks after `/` in p15 URLs). Applied by the supervisor as a one-character edit. User also delegated starting u5-u8 in this session.

## Notes

- p14: PDF reads "charpter" (should be "chapter"); transcribed as printed.
- p12: PDF reads "create/ retrieve/update/delete" with a stray space after the slash; transcribed as printed.

- u2 (consuming-service-layer): extraction defect: p31 `c031-01` is the tail of `c030-05` but is not marked as a continuation; the transcriber merged it into one `http` block in actions.md (a strict block count will show one fewer than the extraction). Source defects, transcribed as printed: p24-25 JSON samples with trailing commas; p25 `c025-02` error message wraps across two lines; `......` placeholders on pp. 25-26 and 31; p29 `c029-05` ComplexType opens on p29 and closes on p30; p26 example `GET Orders(DocEntry=22)` has no leading slash.
- u3 (consuming-service-layer): did not open renders, so the reviewer must check t033-01 (the `$inlinecount` row on p33 is visually the end of the options table t032-01 on p32 but has its own id; kept as a second table marker right after the first) and the p39 bank-sample indentation. Link `inlinecount [page 39]` became `TODO(link: sec 3.6.7.7)`. Source defects, transcribed as printed: p37 `GET/b1s/v1/Orders?...` (no space after GET); p38 count-distinct response `"CountDistinctCardCode" : "2"` is a string; p32 `/Items/$count?&filter=ItemCode eq 'test'` uses `&filter` without `$`; 3.6.7's method list says "distinctcount" but the subsection and example use `countdistinct`.
- u4 (consuming-service-layer): extraction defect: p44 `c044-01` is the tail of `c043-04` but has no continues marker; merged into one block (second case after u2's c031-01: verify_section.py must accept merged unmarked tails, else fix extract_pdf.py). Reviewer should check against renders the blocks opening with `{    "odata.metadata"` / `{     "error": {` plus blank line (kept as extracted, unchecked). Placement: the p50 text/plain Note sits in row-level-filter.md. Source defects, transcribed as printed: token-splitting wraps in code on pp. 42-47; p43 c043-02 SQL starts with a stray quote; pp. 43-44 "more entities" example selects DocEntry, DocNum, CardCode, ActivityCode but the SQL shows T1."CardName", T2."ClgCode"; pp. 50-51 queries with spaces such as `? $expand=` and `Item/ ItemCode`.
- u1 (consuming-service-layer): transcriber normalised stray leading spaces in code (extraction put an extra space on line 2 of several blocks; p16 and p21 renders show them flush), mostly without render checks for the metadata XML; Schema/edmx:Reference blocks on pp. 19-20 left as extracted. Reviewer must check renders for pp. 17-20, 22-23 (code indentation) and whether the bold pseudo-headings on p19 (Purpose, Annotation Terms and Vocabulary References, Query Options, Examples, made `###`) are headings. Source defects, transcribed as printed: p19 "mainly provided for the . The response" (missing word); p15 `<version>/ <resource_path>` and `/b1s/v1/ Items` with a space after the slash; pp. 16 and 18 wraps at `B1Sessions/` `@Element` and `POST / Orders(id)/Close`; p22 `BusinessPartne` / `rs`.
- u4 review 1: 13 discrepancies, systematic: the extraction joins an opening `{` with the next line (`{    "odata.metadata"`, `{     "error": {`) and inserts a spurious blank line, and some `{` after POST get a leading space (renders show `{` alone on its line, next line indented 3-4 spaces, no blank line); also wrap spaces in the p50/p51 variant GET lines (`ServiceCalls(1)? $expand`, `Item/ ItemCode`) that the render does not show. Probably an extract_pdf.py defect affecting other units; decide after the u1 and u3 reviews whether to fix the script or only the hojas.
- Script change 2026-10-01 (`factory/scripts/extract_pdf.py`, `render_code`): the PDF text layer fuses an opening brace with the next visual line (`{    "odata.metadata"...`, one space standing for the line break) and leaves a double line gap; it also carries a stray leading space on the line after an HTTP request or status line (` {` after `POST`, ` Prefer:` after `GET`). Both are now corrected at extraction (brace split back, phantom blank line dropped, single leading space stripped after a GET/POST/PATCH/PUT/DELETE/HEAD/OPTIONS/HTTP line). Rerun: counts equal profile.md, ids unchanged, 239 lines changed over 114 pages (only braces, blank lines, leading spaces). Found by the u3 and u4 reviewers (see u4 review 1 note). Units transcribed before this change (u1, u2) must be checked for the same artefact; u3 and u4 go through fix jobs.
- u3 review 1: 4 discrepancies, all the artefact above (aggregation.md and grouping.md response blocks, pagination.md ` {` and `Prefer`/`Preference-Applied` leading spaces). The t033-01 second marker was judged faithful by the reviewer (kept unless verify_section.py expects a single id); the p39 indentation is in the render.
- Script change 2026-10-01 (second, supersedes the HTTP-line heuristic of the first): `render_code` now reads `rawdict` and measures code indentation from the drawn x of the first non-space glyph (`lead_x`), because the PDF text layer carries leading spaces that are never drawn (XML closing tags with 1 space, 5-space lines that are 4, `{` after `POST`...). The brace-fusion split stays. Rerun: counts equal profile.md, ids unchanged; 152 further lines changed over the pages, every one exactly one leading space less, no content change. Render p39 confirms (the `{` aligns with `"odata.count"`; the u3 reviewer had accepted the extra space as printed). u1-u4 hojas are therefore re-synced to the final markup by fix jobs, then re-reviewed by fresh reviewers.
- u1 review 1: 8 code-indentation items (same artefact), 3 cell-wrap spaces in overview-key-elements.md (sample URLs); not applied by decision: bold "Example 1-4" lines kept bold and `## Session` / `## Metadata Query with Annotation` heading levels kept (leaf-format only allows ##/###).
- u2 review 1: no discrepancies against the old markup; fix job queued because actions.md p29 carries the undrawn space.
- u4 review 2: no discrepancies. Extra source defect, as printed: p45 SQL under Cross-Joins with Calculation ends `T0."DocNum" - 3` with no closing quote (same kind as the p43 SQL).
- u1 review 2: 2 low-confidence points, no change. (1) metadata-document.md:81 `POST / Orders(id)/Close` (p18): the render wraps right after `POST /`; the PDF formatter also breaks after `/` without a space in URLs (p15 cells), so the space may be only a wrap. Kept as printed, ambiguous: the user may decide to remove it. (2) `## Session` heading level: already decided (kept).
- Extraction 2026-10-01: counts equal profile.md; the 13 warnings are the known ones on discarded pages 1 and 250.
