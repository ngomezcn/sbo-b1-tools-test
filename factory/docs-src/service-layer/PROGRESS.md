# Docs build ledger: docs-service-layer

PDF: sources/service-layer/service-layer-docs-1.29.pdf · Skill: /build-docs-from-sl-pdf · Extracted: 2026-10-01

## RESUME HERE

**Done last session:** apartado `appendix-di-api-comparison` (#10) planned (decisions delegated to the supervisor via grill-with-docs), transcribed (3 units), reviewed (u2, u3 clean; u1 had 2 items: missing p234-01 asset copied at integration, bold sub-headings in company-service-apis.md made `###`) and integrated: index.md, intent row and 5 confusable-term rows in SKILL.md, p234-01 copied, 3 rows settled in REVIEW.md. `verify_section.py` exits 0 for all 10 apartados.
**Next:** the build is complete (all apartados `done`). Publishing to `sbo-skills/plugins/docs-service-layer/` is a separate manual step, only when the user asks and confirms.
**Waiting on the user:** nothing.
**Open decisions:** none.
**Suggested skills:** none

## Apartados

| # | apartado | chapters | pages | status |
|---|---|---|---|---|
| 1 | introduction-getting-started | 1, 2 | 11-14 | done |
| 2 | consuming-service-layer | 3 | 15-139 | done |
| 3 | sql-query | 4 | 140-160 | done |
| 4 | etag | 5 | 161-166 | done |
| 5 | configuring | 6 | 167-178 | done |
| 6 | webhooks | 7 | 179-224 | done |
| 7 | limitations | 8 | 225 | done |
| 8 | high-availability-load-balancing | 9 | 226 | done |
| 9 | faq | 10 | 227-228 | done |
| 10 | appendix-di-api-comparison | 11, 12 | 229-248 | done |

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
| consuming-service-layer/query-options/options-reference.md | Supported query options | 3.6 | 31-33 | u3 |
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
| u5 | 52-63 | 3.7, 3.7.1-3.7.7 | semantic-layer-views/index.md, deployment-and-scope.md, service-root-and-metadata.md, view-authorization.md, view-query.md | reviewed | 12 pages, images on pp. 53, 57, 62-63. p63 shared with u6 (u5 takes end of 3.7.7). |
| u6 | 63-74 | 3.7.8, 3.7.9, 3.7.10, 3.8 | semantic-layer-views/customized-views.md, basic-authentication.md, sql-view-exposure/* (4 hojas) | reviewed | 12 pages, images on pp. 63-66, 74. p74 shared with u7 (u6 takes end of 3.8.5). |
| u7 | 74-86 | 3.9, 3.10, 3.11, 3.12 | batch-operations.md, individual-properties.md, associations.md, user-defined-schemas.md | reviewed | 13 pages. p86 shared with u8 (u7 takes end of 3.12.1). |
| u8 | 86-92 | 3.13, 3.14 | user-defined-fields.md, user-defined-tables.md | reviewed | 7 pages. p92 shared with u9 (u8 takes end of 3.14.2). |
| u9 | 92-100 | 3.15 | user-defined-objects/index.md, udo-metadata.md, udo-entity-operations.md | reviewed | 9 pages. p100 shared with u10 (u9 takes end of 3.15.6). |
| u10 | 100-112 | 3.16, 3.17 | attachments/* (4 hojas), stream-entity-upload.md | reviewed | 13 pages, 13 images in 3.16, 1 in 3.17. p112 shared with u11 (u10 takes end of 3.17.2). |
| u11 | 112-121 | 3.18, 3.19, 3.19.1-3.19.5.2 | item-and-employee-images.md, javascript-extension/index.md, framework.md, http-api.md | reviewed | 10 pages. p116 holds end of 3.18.4 and start of 3.19. p121 shared with u12: u11 takes ONLY the end of 3.19.5.2 (up to the 3.19.5.3 heading); u12 takes 3.19.5.3 from that heading down. u11 owns the 3.19.5 intro and SDK overview. |
| u12 | 121-130 | 3.19.5.3, 3.19.5.4, 3.19.5.5, 3.19.5.6, 3.19.6, 3.19.7 | entity-crud-api.md, entity-query-api.md, transaction-api.md, exception-api.md, logging-and-sdk-generator.md | reviewed | 10 pages, 6 SDK tables, ~30 code blocks. p130 shared with u13: u12 takes 3.19.7 only; u13 takes 3.19.8 from its heading. u12 owns the six SDK API sections 3.19.5.3-3.19.5.6 (not u11). |
| u13 | 130-139 | 3.19.8, 3.19.9, 3.19.10, 3.20, 3.21 | deployment.md, use-cases.md, cors.md, ping-pong-api.md | reviewed | 10 pages. |

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

## Plan: sql-query

Approved: 2026-10-01

### Hojas

| hoja | title | sec | pages | unit |
|---|---|---|---|---|
| sql-query/overview-and-business-object-metadata.md | SQL Query overview and SQLQuery business object metadata | 4, 4.1 | 140-141 | u1 |
| sql-query/crud-operations.md | CRUD operations on SQLQuery entities | 4.2 | 141-143 | u1 |
| sql-query/list-operation.md | List operation (running a stored query) | 4.3 | 143-144 | u1 |
| sql-query/list-with-paging.md | List with paging | 4.4 | 144-145 | u1 |
| sql-query/query-allowlist/index.md | Query allowlist (overview, routing only) | none | 145-145 | u2 |
| sql-query/query-allowlist/table-allowlist.md | Table allowlist | 4.5, 4.5.1 | 145-147 | u2 |
| sql-query/query-allowlist/column-allowlist.md | Column allowlist | 4.5.2 | 147-148 | u2 |
| sql-query/sql-keywords.md | Supported SQL keywords | 4.6 | 148-149 | u2 |
| sql-query/sql-functions.md | Supported SQL functions | 4.7 | 149-150 | u2 |
| sql-query/sql-normalization.md | SQL normalization (table/column, alias, function) | 4.8 | 150-151 | u2 |
| sql-query/query-with-parameter.md | Query with parameters | 4.9 | 151-153 | u2 |
| sql-query/query-errors.md | Query errors and exceptions | 4.10 | 153-157 | u3 |
| sql-query/query-with-permission-control.md | Query with permission control | 4.11 | 157-159 | u3 |
| sql-query/security-considerations.md | Security considerations (SQL injection, logging, sensitive data) | 4.12 | 159-160 | u3 |
| sql-query/sql-query-limitations.md | SQL Query limitations and by-design behaviour | 4.13 | 160-160 | u3 |
| sql-query/index.md | SQL Query (routing only, not a hoja) | none | - | u3 |

### Unidades de trabajo

| unit | pages | sec | hojas | status | notes |
|---|---|---|---|---|---|
| u1 | 140-145 | 4, 4.1, 4.2, 4.3, 4.4 | overview-and-business-object-metadata.md, crud-operations.md, list-operation.md, list-with-paging.md | reviewed | 6 pages, ~19 code blocks (XML metadata, HTTP). p145 shared with u2: u1 takes end of 4.4, u2 takes 4.5 from y~598. |
| u2 | 145-153 | 4.5, 4.5.1, 4.5.2, 4.6, 4.7, 4.8, 4.9 | query-allowlist/index.md, table-allowlist.md, column-allowlist.md, sql-keywords.md, sql-functions.md, sql-normalization.md, query-with-parameter.md | reviewed | 9 pages. pp. 145-147 long bullet lists of table names. 4.6 and 4.7 one table each. p153 shared with u3: u2 takes end of 4.9, u3 takes 4.10 from y~540. |
| u3 | 153-160 | 4.10, 4.11, 4.12, 4.13 | query-errors.md, query-with-permission-control.md, security-considerations.md, sql-query-limitations.md, index.md | reviewed | 8 pages. 4.10 has 13 request/response code blocks. 4.11 has 5 images (4 on p158). c160-01 continues c159-02. u3 also writes sql-query/index.md (routing only). |

### Disambiguation candidates

- SQL Query (ch. 4, `SQLQuery` entity and `List`) vs Semantic Layer View Exposure (3.7) and SQL View Exposure (3.8): ch. 4 runs stored SQL text under an allowlist, no view deployment; 3.7/3.8 need views deployed manually.
- CRUD Operations (4.2, `SQLQueries`) vs CRUD Operations (3.4) vs CRUD APIs (11.1).
- Business Object Metadata (4.1) vs Metadata Document (3.2) vs Metadata Naming Difference (12) vs ETag Metadata (5.4).
- List with Paging (4.4) vs Query Options (3.6) vs Paginate the Selected Orders (3.6.6) vs Query APIs (11.4).
- Limitations or By Design (4.13) vs Limitations (ch. 8).
- Query Allowlist (4.5) vs Query with Permission Control (4.11, per-user authorization) vs Row-level filter (3.6.10).
- Query with Parameter (4.9, `ParamList`) vs Query Options (3.6).
- 4.10.4-4.10.6 (alias and `SELECT *` errors) overlap in wording with 4.8 SQL Normalization: cross-reference only.

### Questions

1. Keep list-operation.md (4.3) and list-with-paging.md (4.4) as two hojas (recommended) or merge into one (~3 pages).
2. Keep 4.13 as its own hoja (recommended) or merge into security-considerations.md.
3. Keep sql-keywords.md and sql-functions.md separate (recommended) or one supported-sql-syntax.md.
4. query-errors.md as one hoja with anchor index over 4.10.1-4.10.7 (recommended) or a query-errors/ subfolder.
5. Section 4 intro at the top of overview-and-business-object-metadata.md (recommended) or a separate overview.md.

## Plan: etag

Approved: 2026-10-01

### Hojas

| hoja | title | sec | pages | unit |
|---|---|---|---|---|
| etag/etag-usage.md | ETag usage: introduction and scenarios | 5, 5.1, 5.2 | 161-164 | u1 |
| etag/etag-entities-and-metadata.md | Entities with ETag and ETag metadata | 5.3, 5.4 | 164-166 | u1 |

### Unidades de trabajo

| unit | pages | sec | hojas | status | notes |
|---|---|---|---|---|---|
| u1 | 161-166 | 5, 5.1, 5.2, 5.3, 5.4 | etag-usage.md, etag-entities-and-metadata.md | reviewed | 6 pages, 20 code blocks, 1 block image (p161-01, in 5.1, needs a Figure line), no tables. etag-usage.md needs an anchor index after the title (one link per 5.2.x scenario). Code copied with the PDF's visual wraps (p164 "-2039" message). p164 is shared by 5.2.5 and 5.3, both in u1; p166 continues 5.4. |

### Disambiguation candidates

- ETag Metadata (5.4) vs Metadata Document (3.2) vs Business Object Metadata (4.1) vs Metadata Naming Difference (Appendix II, 12).
- ETag in Entity Action (5.2.5, `POST .../Cancel` with `If-Match`) vs entity actions in 3.4 and the UDO action in 3.15.
- ETag in Entity Update and Delete (5.2.3, 5.2.4: `If-Match`, 412) vs CRUD Operations (3.4, no ETag concurrency) and `$batch` change sets (3.9.4).
- Entities with ETag (5.3, ETag-enabled from 10.0 FP 2102) vs the general entity listings in 3.4.

### Questions

1. Hoja split: 2 hojas, with 5.3 and 5.4 merged into etag-entities-and-metadata.md (recommended; 5.3 is a bare list and 5.4 two short code blocks). Alternatives: one etag.md for all 6 pages, or 3 hojas with 5.3 and 5.4 separate.
2. Folder: `reference/etag/` with an index.md (recommended, matches the other apartados) or flat hojas under `reference/`.

## Plan: configuring

Approved: 2026-10-01

### Hojas

| hoja | title | sec | pages | unit |
|---|---|---|---|---|
| configuring/service-layer-controller-settings.md | Service Layer Controller and settings | 6, 6.1 | 167-173 | u1 |
| configuring/b1s-conf-options.md | Other configuration options (b1s.conf) | 6.2 | 174-174 | u2 |
| configuring/configuration-by-request.md | Configuration by request | 6.3 | 174-175 | u2 |
| configuring/monitoring-logs.md | Monitoring Service Layer logs | 6.4 | 175-178 | u2 |

### Unidades de trabajo

| unit | pages | sec | hojas | status | notes |
|---|---|---|---|---|---|
| u1 | 167-173 | 6, 6.1 | service-layer-controller-settings.md | reviewed | 7 table-heavy pages (5 tables, 8 images, 1 code block). Needs an anchor index after the title (Node Management, Service Layer Configuration). t169-01 continues t168-01: merge. Courier option names in cells stay inline. p174 belongs to u2 (outline gives 6.1 end 174, but p174 opens at 6.2; confirm no 6.1 tail). |
| u2 | 174-178 | 6.2, 6.3, 6.4 (6.4.1-6.4.5) | b1s-conf-options.md, configuration-by-request.md, monitoring-logs.md | reviewed | 5 pages, shares p174 with u1. u2 takes 6.2 (t174-01) and 6.3 (c174-01) on p174. 4 tables, 7 UI screenshots; monitoring-logs.md needs an anchor index for 6.4.1-6.4.5. |

### Disambiguation candidates

- Configuring (ch. 6) vs Webhook Configuration (7.5) vs Configuration by Request (6.3).
- Other Configuration Options (6.2, b1s.conf: CorsEnable, schema option) vs CORS (3.20, cors.md) vs User-Defined Schemas (3.12).
- Managing Service Layer Settings (6.1, controller UI) vs Other Configuration Options (6.2, same options via b1s.conf).
- Node Management (6.1) vs High Availability and Load Balancing (ch. 9).
- Monitoring Service Layer Logs (6.4) vs Log SQL Query Modification (4.12.2) vs Log Levels / Request & Response Logs options (6.1).

### Questions

1. Keep 6.2 and 6.3 as separate hojas (recommended: file-wide vs per-request HTTP headers), or merge into one other-configuration-options.md.
2. Chapter 6 intro merged into 6.1's hoja (recommended) or its own hoja.
3. 6.4 as one hoja with anchor index (recommended) or a monitoring-logs/ subfolder with five hojas.
4. 6.1 kept as one hoja (recommended; no bookmarked subsections) or split.

## Plan: webhooks

Approved: 2026-10-01

### Hojas

| hoja | title | sec | pages | unit |
|---|---|---|---|---|
| webhooks/overview-and-quick-start.md | Webhooks overview and quick start | 7, 7.1 | 179-180 | u1 |
| webhooks/event-catalog.md | Event catalog | 7.2 | 180-181 | u1 |
| webhooks/event-subscription/subscription-operations.md | EventSubscription operations | 7.3, 7.3.1 | 181-184 | u1 |
| webhooks/event-subscription/handshake-mechanism.md | Handshake mechanism | 7.3.1.1 | 184-186 | u1 |
| webhooks/event-subscription/subscription-properties.md | EventSubscription properties | 7.3.2 | 186-192 | u2 |
| webhooks/event-subscription/subscription-permission-control.md | EventSubscription permission control | 7.3.3 | 192-193 | u2 |
| webhooks/event-notification/notifications-query.md | EventNotifications query and properties | 7.4, 7.4.1, 7.4.1.1 | 194-198 | u3 |
| webhooks/event-notification/payload-structure.md | Notification payload structure | 7.4.2 | 198-200 | u3 |
| webhooks/webhook-configuration.md | Webhook configuration | 7.5 | 200-202 | u3 |
| webhooks/webhook-messenger.md | Webhook Messenger (health check, certificate import) | 7.6 | 202-203 | u3 |
| webhooks/webhook-formula/formula-basics.md | Literals, variables and operators | 7.7, 7.7.1, 7.7.2, 7.7.3, 7.7.4, 7.7.5, 7.7.6, 7.7.7 | 203-207 | u4 |
| webhooks/webhook-formula/string-functions.md | String functions | 7.7.8 | 207-211 | u4 |
| webhooks/webhook-formula/date-functions.md | Date functions | 7.7.9 | 211-213 | u5 |
| webhooks/webhook-formula/time-functions.md | Time functions | 7.7.10 | 214-216 | u5 |
| webhooks/webhook-formula/math-functions.md | Math functions | 7.7.11 | 216-219 | u5 |
| webhooks/webhook-formula/logical-functions.md | Logical functions | 7.7.12 | 219-220 | u5 |
| webhooks/webhook-formula/app-level-variables.md | App-level variables | 7.7.13 | 220-221 | u5 |
| webhooks/faq.md | Webhooks FAQ | 7.8 | 222-224 | u6 |

Routing-only `index.md` files (written at integration, not hojas): `webhooks/index.md`, `event-subscription/index.md`, `event-notification/index.md`, `webhook-formula/index.md` (repeats the short 7.7 intro).

### Unidades de trabajo

| unit | pages | sec | hojas | status | notes |
|---|---|---|---|---|---|
| u1 | 179-186 | 7, 7.1, 7.2, 7.3, 7.3.1, 7.3.1.1 | overview-and-quick-start.md, event-catalog.md, subscription-operations.md, handshake-mechanism.md | reviewed | 8 pages, 21 code blocks, 1 block image (p179-01). p180 holds end of 7.1 (c180-01 continues c179-01) and start of 7.2; p181 end of 7.2 and start of 7.3. p186 shared with u2: u1 takes the end of 7.3.1.1, u2 takes 7.3.2 from its heading. Anchor index likely for subscription-operations.md. |
| u2 | 186-193 | 7.3.2, 7.3.3 | subscription-properties.md, subscription-permission-control.md | reviewed | 7 pages, 5 wide tables, 6 code blocks, 1 block image (p193-01). Outline says 7.3.3 ends p194, but p194 starts at 7.4: it ends on p193. |
| u3 | 194-203 | 7.4, 7.4.1, 7.4.1.1, 7.4.2, 7.5, 7.6 | notifications-query.md, payload-structure.md, webhook-configuration.md, webhook-messenger.md | reviewed | 10 pages, 9 tables, 10 code blocks. c199-02 continues as c200-01 across the 7.4.2/7.5 border; p202 opens with c202-01 (tail of 7.5) then 7.6 starts. p203 shared with u4: u3 takes everything above the `7.7 Webhook Formula` heading. Check p200-p202 to place 7.5 vs 7.6 content. |
| u4 | 203-211 | 7.7, 7.7.1-7.7.8 | formula-basics.md, string-functions.md | reviewed | 9 pages, light but fragmentary (~18 tables, 9 code blocks). Function names are unbookmarked bold lines: `###` headings, with Usage/Parameters/Examples as `####`. p211 opens with the tail of SUBSTITUTE: u4 takes everything above `7.7.9 Date Functions`. string-functions.md needs an anchor index. |
| u5 | 211-221 | 7.7.9-7.7.13 | date-functions.md, time-functions.md, math-functions.md, logical-functions.md, app-level-variables.md | reviewed | 11 pages, ~37 small tables, 17 code blocks, uniform structure. p219 holds the end of MAX and start of IFNULL; p220 opens with the IFNULL Examples tail and starts 7.7.13. Anchor index per function hoja. |
| u6 | 222-224 | 7.8 | faq.md | reviewed | 3 pages, text only, 1 code block (c223-01 continues as c224-01). Questions as bold lines become `###` headings. |

### Disambiguation candidates

- Webhooks FAQ (7.8) vs FAQ (ch. 10): webhook-specific vs general Service Layer questions.
- Webhook Configuration (7.5, `AdminInfo`, `EnableWebhook`) vs Configuring (ch. 6) vs Configuration by Request (6.3) vs Quick Start step 1 (7.1).
- Webhook Messenger (7.6) vs High Availability and Load Balancing (ch. 9) vs Node Management / logs (6.1, 6.4).
- Event Subscription (7.3, `EventSubscriptions`) vs Event Notification (7.4, `EventNotifications`): what to listen to vs what was sent.
- Handshake Mechanism (7.3.1.1) vs Login and Logout / Session (3.1) vs Semantic Layer Basic Authentication (3.7.10).
- EventSubscription Permission Control (7.3.3) vs Semantic Layer View Authorization (3.7.6), Authorize View (3.8.5), Query with Permission Control (4.11).
- Webhook Formula (7.7, `FilterExpr`) vs OData `$filter` (3.6, 3.6.10) vs SQL Query functions (4.7) and keywords (4.6).
- Notification Payload Structure (7.4.2) and Event Catalog (7.2) vs metadata and service documents (3.2, 3.3).
- Replay (7.3.1) vs retry (7.8 FAQ): both in this apartado, keep the distinction explicit.
- Formula function names (7.7.8-7.7.12) vs `$filter` functions (3.6) and SQL Functions (4.7), e.g. `LEN`, `ROUND`, `TRIM`.

### Questions

1. Subfolders `event-subscription/` (7.3), `event-notification/` (7.4) and `webhook-formula/` (7.7) with routing-only indexes (recommended), or flat hojas under `webhooks/`, or only 7.7 as a subfolder.
2. 7.3.1.1 Handshake as its own hoja (recommended) or merged into subscription-operations.md.
3. 7.4.1 + 7.4.1.1 merged into notifications-query.md (recommended) or two hojas.
4. 7.5 Webhook Configuration separate from 7.6 Webhook Messenger (recommended) or merged.
5. 7.7.1-7.7.7 merged into formula-basics.md (recommended) or one hoja per section.
6. Function categories as 5 hojas plus app-level-variables (recommended) or one functions-reference.md (~15 pages).
7. 7.7.12 Logical Functions (only IFNULL) as its own hoja (recommended) or merged into math-functions.md.
8. 7.8 FAQ as one hoja with `###` questions (recommended).

## Plan: limitations

Approved: 2026-10-01

### Hojas

| hoja | title | sec | pages | unit |
|---|---|---|---|---|
| limitations/limitations.md | Service Layer limitations | 8, 8.1, 8.2 | 225-225 | u1 |

### Unidades de trabajo

| unit | pages | sec | hojas | status | notes |
|---|---|---|---|---|---|
| u1 | 225-225 | 8, 8.1, 8.2 | limitations.md | reviewed | 1 prose page, 2 bullet lists, 1 Note (JSONP). p225-01 is an inline external-link arrow (no Figure). Link "Retrieving Individual Properties [page 79]" becomes TODO(link: sec 3.10). Source wrap: `docs.oasis- open.org` in the URL text; write the bare URL. |

### Disambiguation candidates

- Limitations (ch. 8) vs SQL Query Limitations or By Design (4.13).
- 8.1 complex-type property access vs Retrieving Individual Properties (3.10).
- 8.1 batch rollback vs Batch Operations (3.9, change sets 3.9.4).
- 8.2 no user transactions vs Login and Logout / Session (3.1) and ch. 9 sticky sessions.

## Plan: high-availability-load-balancing

Approved: 2026-10-01

### Hojas

| hoja | title | sec | pages | unit |
|---|---|---|---|---|
| high-availability-load-balancing/high-availability-load-balancing.md | High availability and load balancing | 9 | 226-226 | u1 |

### Unidades de trabajo

| unit | pages | sec | hojas | status | notes |
|---|---|---|---|---|---|
| u1 | 226-226 | 9 | high-availability-load-balancing.md | reviewed | 3 paragraphs, 1 block image (p226-01, architecture diagram between paragraphs 2 and 3): needs a Figure line described from the render. |

### Disambiguation candidates

- Sticky sessions (ch. 9) vs Login and Logout / Session (3.1).
- Load balancer and nodes (ch. 9) vs Node Management (6.1, `configuring`) vs the b1s services in the FAQ (ch. 10).

## Plan: faq

Approved: 2026-10-01

### Hojas

| hoja | title | sec | pages | unit |
|---|---|---|---|---|
| faq/faq.md | Frequently asked questions | 10 | 227-228 | u1 |

### Unidades de trabajo

| unit | pages | sec | hojas | status | notes |
|---|---|---|---|---|---|
| u1 | 227-228 | 10 | faq.md | reviewed | 6 bold-question entries become `##` headings, with an anchor index after the title. 7 code blocks, all on p228; the autostart answer crosses the page break, keep it contiguous. c228-05 is a bare path tagged `javascript` by extraction: retag `text`. p227-01 is an inline link arrow. Source defects to transcribe as printed: "Service layer" (p228), "turn on it again", "symbol link". |

### Disambiguation candidates

- FAQ (ch. 10) vs webhooks FAQ (7.8).
- DI API / DI Server differences vs Appendix I and II (ch. 11, 12) and 8.2.
- PUT/PATCH and `X-HTTP-Method-Override` vs CRUD Operations (3.4) and ETag If-Match (5.2.3).
- b1s services / load balancer node vs ch. 9 and Node Management (6.1).

## Plan: appendix-di-api-comparison

Approved: 2026-10-01

### Hojas

| hoja | title | sec | pages | unit |
|---|---|---|---|---|
| appendix-di-api-comparison/crud-apis.md | CRUD APIs: Service Layer versus DI API | 11, 11.1 | 229-232 | u1 |
| appendix-di-api-comparison/company-service-apis.md | Company Service APIs | 11.2 | 232-233 | u1 |
| appendix-di-api-comparison/transaction-apis.md | Transaction APIs | 11.3 | 233-234 | u1 |
| appendix-di-api-comparison/query-apis.md | Query APIs | 11.4 | 234-236 | u1 |
| appendix-di-api-comparison/udo-apis.md | UDO APIs | 11.5 | 236-240 | u2 |
| appendix-di-api-comparison/udf-apis.md | UDF APIs | 11.6 | 240-244 | u2 |
| appendix-di-api-comparison/metadata-naming-differences.md | Metadata Naming Differences | 12 | 245-248 | u3 |

### Unidades de trabajo

| unit | pages | sec | hojas | status | notes |
|---|---|---|---|---|---|
| u1 | 229-236 | 11, 11.1, 11.2, 11.3, 11.4 | crud-apis.md, company-service-apis.md, transaction-apis.md, query-apis.md | reviewed | p236 shared with u2: u1 takes only the end of 11.4, u2 takes 11.5 (and 11.5.1) from its heading. 8 pages, ~18 code blocks, 1 image on p234. |
| u2 | 236-244 | 11.5, 11.6 | udo-apis.md, udf-apis.md | reviewed | p236 shared with u1. 9 pages, ~29 code blocks, densest. udo-apis.md anchor index: Creating UDOs (11.5.1), CRUD and Query Operations (11.5.2); udf-apis.md: CRUD Operations (11.6.1), Performing Operations on Entities with UDFs (11.6.2). |
| u3 | 245-248 | 12 | metadata-naming-differences.md | reviewed | 4 pages, 3 long tables, no code; 12.1 table spans pp. 245-247 (continues markers on p246, p248). Anchor index: 12.1, 12.2, 12.3. Chapter 12 intro goes in this hoja; chapter 11 intro in crud-apis.md. |

### Disambiguation candidates

- CRUD APIs (11.1) vs CRUD Operations (3.4, 4.2).
- Query APIs (11.4) vs Query Options (3.6), List with Paging (4.4), Paginate the Selected Orders (3.6.6).
- UDO APIs (11.5) vs UDO hojas (3.15); UDF APIs (11.6) vs UDFs (3.13).
- Transaction APIs (11.3) vs $batch change sets (3.9) and script Transaction API (3.19.5.5); limitations (8).
- Metadata Naming Differences (12) vs Metadata Document (3.2), Business Object Metadata (4.1), ETag Metadata (5.4).
- Appendix I vs FAQ DI API / DI Server question (10).

## Decisions

- 2026-10-01 user: apartado list confirmed as in profile.md.
- 2026-10-01 user: plan for introduction-getting-started approved as written (3 hojas, 2.2+2.3 merged, section 1 its own hoja).
- 2026-10-01 user: plan for consuming-service-layer approved as recommended (all 8 questions: 3.3 merged, own overview hoja, own pagination hoja, 3.7/3.8 subfolders, 3.7.10 separate, 3.19.10 merged, UDO/attachments subfolders, UDF/UDT flat). User also asked that u11/u12 carry an explicit who-takes-what note for 3.19.5 (added to unit notes).
- 2026-10-01 user (delegated to supervisor, "decidelo tu"): `POST / Orders(id)/Close` on p18 corrected to `POST /Orders(id)/Close` (the space is a line wrap; the formatter also breaks after `/` in p15 URLs). Applied by the supervisor as a one-character edit. User also delegated starting u5-u8 in this session.
- 2026-10-01 user (delegated to supervisor): review queue rows p013-01 and p013-02 settled `described` (English descriptions added to architecture-and-installation.md), l012-01 `keep`. verify_section.py introduction-getting-started passes. From now on the supervisor settles queue rows as the integration step adds them, unless the user says otherwise (standing delegation: "tu mismo revisa el REVIEW.md, las decisiones son tuyas").

- 2026-10-01 supervisor: integration of consuming-service-layer. The 3.6 table lives in the new hoja query-options/options-reference.md (index.md files are not counted as hojas by verify_section.py, so page 32 and table markers t032-01/t033-01 need a hoja); query-options/index.md is routing-only. Other subfolder indexes keep their short 3.7, 3.8, 3.15, 3.16, 3.19 intro text above the routing entries. Queue rows settled `keep` (inline icons, UI screenshots, source URLs) and p117-01 `described`.
- 2026-10-01 user (delegated: "como tu consideres y ejecutalo"): sql-query plan approved with all 5 planner recommendations (4.3/4.4 two hojas, 4.13 own hoja, 4.6/4.7 separate, 4.10 one hoja with anchor index, ch. 4 intro at top of overview-and-business-object-metadata.md). Supervisor runs u1-u3 in parallel through to integration.
- 2026-10-01 user: etag plan approved ("aprobado todo"): 2 hojas (5.3+5.4 merged), folder reference/etag/ with index.md.
- 2026-10-01 supervisor: etag review finding 2 (anchor index listed the ### scenarios, leaf-format says ## headings) fixed by editing the index to ETag Introduction / ETag Scenarios.

- 2026-10-01 user (delegated: "si lo ves bien apruebalo"): webhooks plan approved with all 8 planner recommendations; supervisor verified section page ranges against outline.json and the p221/p222 and p193/p194 boundaries.

- 2026-10-01 user (delegated: "usa la /grill-with-docs para decidir"): plans for limitations, high-availability-load-balancing and faq approved with all planner recommendations, decided by the supervisor via grill-with-docs (no new term or ADR needed): one hoja per apartado (8.1+8.2 together; FAQ as one hoja with `##` per question and anchor index), each in its own folder with index.md. All three run in one session.
- 2026-10-01 user (delegated: "usa la /grill-with-docs para decidir"): appendix-di-api-comparison plan approved with all 4 planner recommendations (11.2/11.3/11.4 three hojas, chapter 12 one hoja with anchor index, chapter intros in first hoja of each chapter, u2 unsplit). Decided by the supervisor via grill-with-docs; no new term or ADR needed.

## Notes

- etag u1 transcriber defects/notes: p162 "theSAP Business One client" missing space (PDF); p162-164 error message wrap `... modified data; to` / `continue, ...` (visual wrap, kept); "Etag"/"ETag" mixed in pp. 161, 165; p161-01 is the inline external-link arrow (no Figure line); msdn URL link-text space was a wrap (written as bare URL).

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
- u8 (consuming-service-layer): the transcriber dropped six empty ```json blocks from the markup (c089-04, c089-05, c089-08, c090-02, c090-04, c091-02) because the p89-p91 renders show nothing there; the reviewer must confirm against the renders, and verify_section.py may count them as missing. c089-07, c089-08 and c090-01 merged into one block across the p89-90 break; wrapped lines `added by` / `Chrome.` in p89-90 code blocks keep the visual wrap. Source defects, transcribed as printed: p88 PATCH sample trailing comma after `"Description": "Internal Id",`; p90 3.14.2 example heading says "key list of all user orders" for `GET /U_MYTBL?$select=Code`; p88 Note says "file type (`Type`)"; p90 UDT metadata from patch level 04 but direct access to "no object" UDTs from patch level 05.
- u5 (consuming-service-layer): service-root-and-metadata.md and view-query.md were generated from WORK/pages by a script (code copied as extracted), the rest by hand. Reviewer must check: p57-p58 grey box at the top of p58 placed inside the 3.7.6 Note (render shows a separate box); p053-01 placed at the end of 3.7.2; the `https://` space removed in the 3.7.1 URL (wrap); c060-04 (bare URL path) tagged `text`. Source defects, transcribed as printed: p58 "performd"; p55 XML `</Key` without `>` and odd comment `<!-->For the view ...<-->`; p60 `"@odata.context": "https//databaseserver..."` missing colon; p60 BusinessPartnerCode `d3fb9f1c-72a0-4` looks like a stray sample; p59 "equivalent" SQL uses `adm/Item` and `__RowNum__`, not matching AveragePurchasingPriceQuery; p61 SQL period '2016' vs request '2017'; p62 SQL `sap.us1017` vs `sap.SBODEMOUS` elsewhere.
- u6 (consuming-service-layer): transcriber re-read the markup but did not open renders beyond p74. Reviewer must check: the Note at the top of p67 (placed in basic-authentication.md, above the 3.8 heading); c067-01 tagged `sql` although the extraction had no language; inline icons p063-01 placed twice, p066-01, p074-01..03; "[Get one line by entity key]" and "[Get properties by entity key]" kept as ### headings with brackets. Source defects, transcribed as printed: p65 c065-02 `GET GET https://.../MyItem(2)`; p69 "the the endpoint and metadata"; p74 c074-02 JSON error ends `} }` on one line; p71 c071-04 `Prefer:odata.maxpagesize=40` without a space after the colon.
- u7 (consuming-service-layer): transcriber viewed no renders, markup only. Wrap space removed in `Content- Transfer-Encoding` (p75, inline code). Links: `TODO(link: sec 3.9.3)`, `TODO(link: sec 3.11.1)` (twice), `TODO(link: sec 6.1)`. Source defects, transcribed as printed: p77 changeset boundary wrapped over two lines, repeated Content-Type/--changeset lines split into separate blocks; p79 all-lowercase example (`post orders`, `cardcode`, `content-type`) with `boundary=batch_36522ad7-` wrapped; p80 "`DocEntry 1`does not exist" without a space; pp. 81 and 83 `GET Orders(1)/BusinessPartner` without a leading `/`; p83 text says navigation property `BusinessPartners` but the metadata shows `BusinessPartner`; p85 trailing comma after `"DocumentLines",`; p85 response `B1S-Schema: schema1.schema` vs `marketingDocument.schema` in the example; p86 empty line before the `B1S-Schema` header.
- u8 review 1: only 2 format points (hoja titles `User-defined fields (UDFs)` / `User-defined tables (UDTs)` vs PDF capitalisation `User-Defined`); not applied: the titles come from the approved plan. The six dropped empty json blocks were confirmed empty in the renders (nothing lost).
- u5 review 1: 3 format points + 1 line-ending point, no content discrepancy: missing blank lines before the c059-01 fence and before `## Querying View with Aggregation` in view-query.md; service-root-and-metadata.md had CRLF endings (script-generated; others LF). Decided: the p58 grey box stays inside the 3.7.6 Note. Fix job dispatched.
- u6 review 1: p74 c074-02 closing braces are three lines in the render (`}` x3) while the markup joined two as `} }`: the render wins; external links in customized-views.md were Markdown links, leaf-format wants the URL visible as plain text. The reviewer also noted assets are not yet in DOCS/assets (done at integration) and that sql-view-exposure/index.md has a Topics routing list not in the PDF: kept, the index files are rewritten at integration (routing-format). Fix job dispatched.
- u7 review 1: three internal links lost their printed `[page N]` suffix (batch-operations.md:34, associations.md:107 and 119); everything else matched. Cosmetic, not applied: p85 `marketingDocument.schema` is bold in the PDF. Fix job dispatched.
- u5 review 2: one missing blank line between two paragraphs in view-query.md (p60-61, "A view with placeholders..." / "For example, to query BalanceSheetQuery..."); fixed directly by the supervisor as a one-character edit and checked by grep; everything else matched. Source defect, as printed: p56 `BalanceSheetQueryParameter` entity type, set and navigation property named inconsistently.
- Extraction 2026-10-01: counts equal profile.md; the 13 warnings are the known ones on discarded pages 1 and 250.
- u9-u13 (consuming-service-layer), transcribed and reviewed 2026-10-01. u9 and u12: review 1 clean. u10: review 1 six items (wrap spaces in paths, lost line breaks in credentials/chown lines, external links as Markdown links), review 2 five bold pseudo-headings to `##`/`###`, review 3 clean. u11: review 1 two items (wrap space in a path, empty json block c114-02 removed), review 2 clean. u13: review 1 one item (Scenario 7 response wrap), review 2 clean. Dropped empty json blocks (confirmed empty in renders): u10 c108-04, c108-06, c109-04; u12 c122-03, c123-03, c123-04, c124-04, c125-02, c125-05, c126-03, c126-04, c127-04, c127-05, c127-06; u11 c114-02; u9 c098-01. Merged unmarked page-break tails (verify_section.py may count them as separate): u9 c095-01 into c094-06, c098-01 into c097-06; u12 c122-02+c123-01, c126-02+c127-01, c127-07+c128-01, c128-04+c129-01, c124-03+c125-01; u13 c134-02+c135-01 and c135-02+c136-01 (c132-01+c133-01, c130-03+c131-01 too). The .NET sample in use-cases.md is tagged `csharp`. u9 source defects, as printed: p95 `"KeyIndex": "0"` response vs `"1"` request, trailing comma in UserKeysMD output; p99 `"MyOrderLines"` vs `MyOrderLinesCollection`; p99 `PATCH UserObjectsMD('MyOrder')` without leading `/`; p96 "as the follows". u10: p110 "please see ." (link target missing in the PDF); p106 stray "o " bullet; p102 "for example.,", `/mnt/attachments` text vs `/mnt/attachment` command; p108 `filename="line3.png"` with image/jpeg; p110 sample `/b1s/v2`; "libaray", `attachemntFileUpload`. u11: p112 "Business Onee", "availabe"; p116 "Picure"; p114 Note says multipart/mixed but sample uses multipart/form-data; p119 "getContet()", `getJsonObject()` in table vs `getJsonObj()` in the sample on p120. u12: p123-124 "paramenter"; p124 duplicated "apply the following script:" and doubled header "API Name API Description"; p128 `res.isOK` without parentheses; p129 error text "the given order not found" vs thrown "the given order is not found"; p130 `-- company` with a space. u13: "Typical User Cases" (sic) title; p134-135 "userdefined"; the .NET sample ends without class closing braces; p130 XML attributes "SlientInstallation", "Partnernmsp". External URLs to register in REVIEW.md: http://enable-cors.org/ and http://www.html5rocks.com/en/tutorials/cors/#toc-withcredentials (cors.md), plus those in attachments, stream-entity-upload and javascript-extension.
- Script change 2026-10-01 (`factory/scripts/verify_section.py`, code check): (1) extracted code parts with no text (empty gray boxes, confirmed empty in the renders) are ignored; (2) parts that a hoja merged into one fenced block across a page break without a `continues` marker (c031-01, c044-01, u9, u12, u13 cases) no longer count as missing blocks; every part must still appear verbatim in some fenced block. consuming-service-layer and introduction-getting-started pass.
- p143 (sql-query 4.3): the PDF says "the List function can be invoked in the following way with the verb GET or POST:" and shows no sample after it; transcribed as printed.
- p144 (sql-query 4.4): example request `GET .../SQLQueries('sql0001')/List` differs from the `'sql04'` used in earlier examples, and the result shown is for another query; transcribed as printed.
- p155 (sql-query 4.10.4): "As JSON does no allow multiple fields" (source typo for "not"); transcribed as printed.
- p159 (4.12.1): "Such requests as below would results in error."; as printed.
- p160: c160-02 is labelled "Sample Code" where sibling response blocks say "Output Code"; as printed.
- p153: sample prints `length(...)as lenItemCode` without a space; as printed.
- p158-159 (4.11): Figure lines for p158-04 and p159-01 are the transcriber's wording from the render, not PDF captions.
- p147 (sql-query 4.5.2): heading printed "Column Allowist"; hoja titled "Column allowlist".
- p148 (4.6): stray "1" in `where 1 ItemCode > 'i01'` and `'string' 1 as c2`; as printed. The Parenthesis example prints "or or" doubled in the PDF (confirmed on the p148 render); reviewer caught the transcriber collapsing it, supervisor restored "or or" (one-token fix, sql-keywords.md:17).
- p151 (4.8): c151-03 `as COL1 ... as COL1` (second probably COL2); c151-04 unclosed quote in `from "ORDR -- normalized on SAP HANA`; as printed.
- p152 (4.9): GET example uses `sql07` while the query was created as `sql01`; as printed.
- u2 callouts (Note, Sample Code) contain fenced code inside blockquotes; check verify_section.py accepts it at integration.
- 2026-10-01 user (delegated: "tu mismo revisalo y apruebalo, no me preguntes nada"): supervisor reviewed the configuring plan against CONTEXT.md and ADRs (no conflicts, no new terms) and approved it with all 4 recommendations (6.2/6.3 separate, intro merged into 6.1, 6.4 one hoja, 6.1 one hoja). Supervisor runs u1-u2 through to integration without asking.
- 2026-10-01 supervisor: configuring integration. Source defects reported: p173 "Prior toSAP Business One" and "conf/ httpd-b1s-lb.conf" stray space, p178 "trouble shooting", p174 empty Type cell for EnableAudienceValidation, all transcribed as printed. Cross-apartado page refs like "[page 174]" are kept after the link text.
- webhooks u1-u6 source defects, transcribed as printed: p180 JSON has a trailing comma after `"EnableWebhook": "tYES",`; p181 `SAPB1.EventCatagory` misspelt; p185 "headers.If authentication fails" lacks a space; p202 (c201-01/c202-01) JSON has no comma after `"MaxNumberOfWebHooks": 20`; p206 `DocDueDate — DocDate` and `EndTime — StartTime` use a long dash where the neighbouring formulas use a minus; p217 FLOOR is described as rounding "toward zero" but `FLOOR(-4.5)` = -5, CEILING "away from zero" but `CEILING(-4.5)` = -4, and p218 `ROUND(-4.5)` = -4 beside `ROUND(4.5)` = 5.
- webhooks u2: the second EventCollection example is split by a page break into c191-02 and c192-01; the hoja keeps two fenced blocks with the `t192-01` marker between them, because `verify_section.py` requires both (a reviewer's request to merge them was reverted for that reason).
- `factory/scripts/verify_section.py` (code check): when a part's shortest containing block is an unrelated block elsewhere that repeats its text (webhook-configuration c201-01 + c202-01 merged into one block), the part now counts against the merged block that another part needs and that starts with it, if exactly one such block exists. Verified on all six done apartados.
- limitations u1 source defects, transcribed as printed: p225 "data functions" (probably "date functions") and lowercase "Service layer" in the Note.
- faq u1 source defects, transcribed as printed: p228 "Service layer" lowercase, "turn on it again", "symbol link"; `b1s<port>` plain text on p227. c228-05 retagged `text`.
- high-availability-load-balancing: the extraction renders p226 "loadbalancing"; the render shows a line-end hyphen of "load-balancing". Fixed in the hoja only.
- appendix-di-api-comparison: u1 review 1: 2 items (p234-01 asset not yet in DOCS/assets, done at integration; bold GetCompanyInfo/UpdateCompanyInfo made `###`). u2 and u3 review 1 clean. u1 source defects, as printed: p232 `Console.WriteLine` repeats "company name: {1}"/"{2}" with the literal wrapped; p234 batch boundaries wrapped mid-token and the changeset boundary is shorter than a GUID. u2: p236 DI API `"@MYOrder"` vs Service Layer `@MYORDER`; p240 `udf .Name`; p242 PATCH body trailing comma; p241 DI API samples with inconsistent leading spaces. u3: p246 "EmployeePreviousEmpoymentInfoLines" / "EmployeePrevEmpoymentInfo" (as printed). DI API samples tagged `csharp` (u2's `text` retagged by the supervisor); c239-01 merged into c238-04 (unmarked tail). query-apis.md source is pp. 234-235 (p236 starts 11.5).
- 2026-10-01 (user decision): the images the user listed (p001-01, p057-01..03, p101-02..05, p110-01, p113-01..02, p119-01, p136-01, p158-01..03, p161-01, p169-01, p171-01..03, p173-01..04, p175-01, p227-01, p234-01, p249-01..02) were removed: references in the hojas, PNGs in `DOCS/assets/` and in the tracked `WORK/assets/`, their entries in `WORK/elements.json`, and their REVIEW.md rows. All other images stay and are reviewed separately. `WORK` is tracked in git. Rerunning `extract_pdf.py` would regenerate the removed ones.
- 2026-10-01 (user decision, second batch): removed p225-01, p178-01..02, p177-01..02, p176-01, p175-02, p132-01, p131-01, p116-01, p115-01..02, p113-03..04, p109-01 the same way (hojas with their Figure lines, DOCS and WORK assets, WORK pages, elements.json, REVIEW rows).
- 2026-10-01 (user decision): p115-01 restored (image, Figure line, reference, REVIEW row `keep`, WORK asset and elements.json entry) after the second batch removed it; the other 14 of that batch stay removed.
