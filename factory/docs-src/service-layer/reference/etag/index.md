# ETag

## [ETag usage: introduction and scenarios](etag-usage.md)
Use when: avoiding blind concurrent updates, sending `If-Match`, handling a 412 on update, delete or action, reading the ETag of a created or retrieved entity.
Terms: `ETag`, `If-Match`, `If-None-Match`, `W/"hashed string"`, optimistic concurrency, `412`, `-2039`
Sections: [ETag Introduction](etag-usage.md#etag-introduction) · [ETag Scenarios](etag-usage.md#etag-scenarios)
Not here: plain entity update and delete without concurrency control → [consuming-service-layer](../consuming-service-layer/crud-operations.md)

## [Entities with ETag and ETag metadata](etag-entities-and-metadata.md)
Use when: checking which entities support ETag, or reading the ETag annotations in `$metadata`.
Terms: `$metadata`, `ETag`, `Org.OData.Core.V1.OptimisticConcurrency`, ETag-enabled entities
Not here: the metadata document itself → [consuming-service-layer](../consuming-service-layer/metadata-document.md); `SQLQuery` metadata → [sql-query](../sql-query/index.md)
