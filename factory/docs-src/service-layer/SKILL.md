---
name: docs-service-layer
description: SAP Business One Service Layer reference (guide v1.29): login and sessions, OData CRUD, query options, batch, UDF/UDT/UDO, attachments, semantic layer and SQL views, SQL Query, ETag, server configuration, webhooks, limitations, DI API comparison. Use when writing or debugging code that calls Service Layer, or when asked how a Service Layer feature behaves.
---

# SAP Business One Service Layer

Pick the row matching the question, open that index, then the single hoja it points to.

## By intent

| Developer intent | Example questions | Go to |
|---|---|---|
| Learn what Service Layer is, its requirements, architecture and installation | "which OData version does /b1s/v2 use", "which OS does Service Layer run on", "can I install the load balancer remotely" | [introduction-getting-started](reference/introduction-getting-started/index.md) |
| Log in or out, keep a session, read `$metadata` or the service document, understand the request URL | "how do I log in to Service Layer", "what is B1SESSION", "how do I get the metadata of one entity" | [consuming-service-layer](reference/consuming-service-layer/index.md) |
| Create, read, update, delete entities, call actions, send a `$batch`, navigate associations, read one property | "how do I PATCH an order", "how do I close a document", "how do I send a change set" | [consuming-service-layer](reference/consuming-service-layer/index.md) |
| Filter, select, order, paginate, aggregate, group, cross-join or expand a GET | "how do I paginate a GET", "$filter on a date", "sum DocTotal per card code", "$crossjoin two entities" | [query-options](reference/consuming-service-layer/query-options/index.md) |
| Query SAP HANA analytics views or SQL Server views as OData | "how do I query a Semantic Layer view", "how do I expose a SQL view", "why do I get 401 on a view" | [consuming-service-layer](reference/consuming-service-layer/index.md) |
| Work with user-defined fields, tables, objects and schemas | "how do I create a UDF", "how do I register a UDO", "how do I cancel a UDO entity", "B1S-Schema header" | [consuming-service-layer](reference/consuming-service-layer/index.md) |
| Upload, download or update attachments, upload streams, handle item and employee images | "how do I upload an attachment", "attachment folder on Linux", "Slug header", "get an item picture" | [consuming-service-layer](reference/consuming-service-layer/index.md) |
| Write, deploy and call server-side JavaScript | "how do I deploy a script", "how do I use EntitySet.query", "ScriptException", "call a script from .NET" | [javascript-extension](reference/consuming-service-layer/javascript-extension/index.md) |
| Call Service Layer from a browser on another origin, or check that a node is alive | "how do I enable CORS", "what does /ping return" | [consuming-service-layer](reference/consuming-service-layer/index.md) |
| Store, run, page and troubleshoot SQL queries through `SQLQueries`; allowlists, keywords, parameters, permissions | "how do I create a stored SQL query", "which tables can SQL Query read", "can I use union in a query", "why 403 on SQLQueries", "SQL query with parameters" | [sql-query](reference/sql-query/index.md) |
| Prevent blind concurrent updates with ETag and `If-Match`, find ETag-enabled entities | "how do I use If-Match", "what is a 412 on PATCH", "which entities support ETag", "ETag in $metadata" | [etag](reference/etag/index.md) |
| Configure the server: Service Layer Controller, `b1s.conf` options, load balancer nodes, per-request headers, monitor request logs | "how do I change b1s.conf", "Service Layer Controller URL", "B1S-PageSize header", "where are the request logs", "add a node" | [configuring](reference/configuring/index.md) |

## Confusable terms

| Term | Means | Go to |
|---|---|---|
| Load balancer (architecture) | Apache as transit point and session stickiness in the deployment layout (sec 2.2, 2.3); sticky-session configuration is ch. 9 | [architecture-and-installation](reference/introduction-getting-started/architecture-and-installation.md) |
| Installation | topologies and firewall recommendation (sec 2.3), not server settings (ch. 6) | [architecture-and-installation](reference/introduction-getting-started/architecture-and-installation.md) |
| OData version URIs | `/b1s/v1` vs `/b1s/v2` `$metadata` (sec 1), not the metadata document (sec 3.2) | [introduction](reference/introduction-getting-started/introduction.md) |
| Semantic Layer View Exposure | exposing SAP HANA analytics views through `sml.svc` (sec 3.7, SAP HANA only) | [semantic-layer-views](reference/consuming-service-layer/semantic-layer-views/index.md) |
| SQL View Exposure | exposing customized SQL Server views through `view.svc` and the `SQLViews` entity (sec 3.8); not stored SQL queries (ch. 4) | [sql-view-exposure](reference/consuming-service-layer/sql-view-exposure/index.md) |
| CRUD operations | OData entity POST/GET/PATCH/DELETE (sec 3.4); UDF/UDT/UDO CRUD are in their own hojas, script CRUD is the Entity CRUD API (sec 3.19.5.3) | [crud-operations](reference/consuming-service-layer/crud-operations.md) |
| Metadata | `$metadata` and service document (sec 3.2, 3.3); Semantic Layer metadata is sec 3.7.5; UDO metadata is sec 3.15.1 | [metadata-document](reference/consuming-service-layer/metadata-document.md) |
| Query options | OData `$filter`, `$select`, `$apply` and the like on GET (sec 3.6); script queries are the Entity Query API (sec 3.19.5.4) | [query-options](reference/consuming-service-layer/query-options/index.md) |
| Pagination | `$top`/`$skip` and `odata.nextLink` on entity collections (sec 3.6.6) | [pagination](reference/consuming-service-layer/query-options/pagination.md) |
| Transactions | `$batch` change sets (sec 3.9.4) vs the script Transaction API (sec 3.19.5.5) | [batch-operations](reference/consuming-service-layer/batch-operations.md) |
| Attachments vs stream entities vs images | `Attachments2` folders and lines (sec 3.16), `Slug` stream upload (sec 3.17), item and employee pictures (sec 3.18) | [attachments](reference/consuming-service-layer/attachments/index.md) |
| User-defined schemas / fields / tables / objects | schema files (sec 3.12), UDFs (sec 3.13), UDTs (sec 3.14), UDOs (sec 3.15) | [consuming-service-layer](reference/consuming-service-layer/index.md) |
| CORS | browser cross-origin settings in `b1s.conf` (sec 3.20); other settings are ch. 6 | [cors](reference/consuming-service-layer/cors.md) |
| Ping Pong API | `/ping` health endpoints (sec 3.21); load balancing configuration is ch. 9 | [ping-pong-api](reference/consuming-service-layer/ping-pong-api.md) |
| SQL Query | the `SQLQueries` entity running stored SQL under an allowlist (ch. 4); views are SQL View Exposure (sec 3.8) / Semantic Layer (sec 3.7) | [sql-query](reference/sql-query/index.md) |
| CRUD on SQLQueries | CRUD of stored queries (sec 4.2), not entity CRUD (sec 3.4) or the DI API comparison (ch. 11) | [crud-operations](reference/sql-query/crud-operations.md) |
| List with paging | paging a stored query's `List` result (sec 4.4), not `$top`/`$skip` (sec 3.6.6) | [list-with-paging](reference/sql-query/list-with-paging.md) |
| Query allowlist vs permission control | which tables and columns are queryable (sec 4.5) vs which users may run queries (sec 4.11) | [query-allowlist](reference/sql-query/query-allowlist/index.md) |
| Business object metadata | the `SQLQuery` EntityType and `List` function (sec 4.1), not the metadata document (sec 3.2) | [overview-and-business-object-metadata](reference/sql-query/overview-and-business-object-metadata.md) |
| SQL Query limitations | what stored queries cannot access (sec 4.13), not general limitations (ch. 8) | [sql-query-limitations](reference/sql-query/sql-query-limitations.md) |
| ETag metadata | ETag annotations of entities in `$metadata` (sec 5.4), not the metadata document (sec 3.2), `SQLQuery` metadata (sec 4.1) or metadata naming differences (ch. 12) | [etag-entities-and-metadata](reference/etag/etag-entities-and-metadata.md) |
| ETag on update, delete and action | `If-Match` and 412 for concurrent changes (sec 5.2), not plain entity CRUD (sec 3.4), actions (sec 3.5) or `$batch` change sets (sec 3.9) | [etag-usage](reference/etag/etag-usage.md) |
| Configuration by request vs server configuration | per-request HTTP headers (sec 6.3) vs `b1s.conf` options (sec 6.2) and Controller settings (sec 6.1); webhook configuration is sec 7.5 | [configuration-by-request](reference/configuring/configuration-by-request.md) |
| Monitoring Service Layer logs | Controller request logs (sec 6.4), not SQL query log modification (sec 4.12.2) | [monitoring-logs](reference/configuring/monitoring-logs.md) |
