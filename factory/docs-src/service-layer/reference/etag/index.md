# ETag

OData generic ETag (protocol headers and 412/428/304): [reference/odata/headers-and-versioning/etag-and-concurrency.md](../odata/headers-and-versioning/etag-and-concurrency.md)

## [ETag guide: when to use it and how it behaves](etag-guide.md)
Use when: building an integration or sync where an external system (CRM, e-commerce, middleware) writes to entities that SAP users also edit, avoiding lost updates, deciding whether to use `If-Match`, handling a 412 and retrying, knowing how the ETag is built and where it is returned, `$select`/`$batch` pitfalls with ETag.
Terms: `ETag`, `@odata.etag`, `DataVersion`, `If-Match`, `If-None-Match`, `412`, `-2039`, lost update, read-modify-write, `$batch`, `$select`
Sections: [When to use ETag](etag-guide.md#when-to-use-etag) · [Sending If-Match correctly](etag-guide.md#sending-if-match-correctly) · [Batch requests](etag-guide.md#batch-requests)
Not here: the PDF's own scenarios (create, retrieve, update, delete, action) → [etag-usage](etag-usage.md)

## [ETag usage: introduction and scenarios](etag-usage.md)
Use when: avoiding blind concurrent updates, sending `If-Match`, handling a 412 on update, delete or action, reading the ETag of a created or retrieved entity.
Terms: `ETag`, `If-Match`, `If-None-Match`, `W/"hashed string"`, optimistic concurrency, `412`, `-2039`
Sections: [ETag Introduction](etag-usage.md#etag-introduction) · [ETag Scenarios](etag-usage.md#etag-scenarios)
Not here: plain entity update and delete without concurrency control → [consuming-service-layer](../consuming-service-layer/crud-operations.md)

## [Entities with ETag and ETag metadata](etag-entities-and-metadata.md)
Use when: checking which entities support ETag, or reading the ETag annotations in `$metadata`.
Terms: `$metadata`, `ETag`, `Org.OData.Core.V1.OptimisticConcurrency`, ETag-enabled entities
Not here: the metadata document itself → [consuming-service-layer](../consuming-service-layer/metadata-document.md); `SQLQuery` metadata → [sql-query](../sql-query/index.md)
