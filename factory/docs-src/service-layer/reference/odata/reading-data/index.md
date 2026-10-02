# Reading data

## [Read entities and properties](read-entities-and-properties.md)
Use when: GETting a collection, one entity by key, an individual property, or a raw `$value`.
Terms: `GET`, `$value`, `204 No Content`, `404`, property, collection
Sections: [Entity collections](read-entities-and-properties.md#entity-collections) · [Individual property](read-entities-and-properties.md#individual-property) · [Property raw value ($value)](read-entities-and-properties.md#property-raw-value-value)
Not here: navigation/`$ref` → [related-entities-and-references](related-entities-and-references.md); query options → [query-options](../query-options/index.md)

## [Related entities, references and entity-ids](related-entities-and-references.md)
Use when: reading a related entity via a navigation property, requesting `/$ref`, or resolving `$entity?$id=`.
Terms: navigation property, `/$ref`, `$entity`, `$id`, `@odata.id`
Not here: modifying relationships → [modifying-data](../modifying-data/index.md)

## [Collection count and next-link annotations](collection-count-and-paging.md)
Use when: requesting `/$count` only, or reading `@odata.count` / `@odata.nextLink` in a collection payload.
Terms: `/$count`, `@odata.count`, `@odata.nextLink`, `nextLink`, server-driven paging
Not here: `$top`/`$skip`/`$count=true` semantics → [query-options](../query-options/index.md)

## [Invoking functions and bound operations](invoking-functions.md)
Use when: calling a function with GET, binding an operation to a resource, or writing inline parameters.
Terms: function, bound operation, function import, inline parameters, parameter aliases
Not here: POST actions → see each hoja's In Service Layer line

## [Context URL](context-url.md)
Use when: interpreting `@odata.context` for a service document, entity, collection, singleton, reference or property value.
Terms: `@odata.context`, context URL, `$metadata`, `#Collection`, `/$entity`
Sections: [Service Document](context-url.md#service-document) · [Collection of Entities](context-url.md#collection-of-entities) · [Entity](context-url.md#entity)
Not here: which control information appears in JSON → [json-control-information](json-control-information.md)

## [JSON control information in responses](json-control-information.md)
Use when: asking what `@odata.context`, `@odata.type`, `@odata.id`, `editLink`, `readLink`, `etag`, `navigationLink` or `associationLink` mean, or how `odata.metadata` affects them.
Terms: `@odata.context`, `@odata.type`, `@odata.id`, `@odata.etag`, `editLink`, `readLink`, `odata.metadata`
Sections: [context](json-control-information.md#context) · [type](json-control-information.md#type) · [id](json-control-information.md#id)
Not here: ETag concurrency headers → [headers-and-versioning](../headers-and-versioning/index.md)
