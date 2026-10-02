# Query options

## [Query options overview](query-options-overview.md)
Use when: listing system query options, custom options and parameter aliases, or checking evaluation order and which options a resource accepts.
Terms: `$filter`, `$select`, `$expand`, `$orderby`, `$top`, `$skip`, `$count`, `$search`, `$format`, custom query option
Sections: [System query options](query-options-overview.md#system-query-options) · [Evaluation order](query-options-overview.md#evaluation-order)
Not here: collection semantics of filter/order/page/count → [collection-query-semantics](collection-query-semantics.md)

## [Filtering, ordering, paging, counting and parameter aliases (collection semantics)](collection-query-semantics.md)
Use when: asking how `$filter` omits null/false, how `$orderby`/`$top`/`$skip`/`$count` behave, what a next link is, or how parameter aliases work.
Terms: `$filter`, `$orderby`, `$top`, `$skip`, `$count`, `$skiptoken`, `maxpagesize`, parameter alias `@p`
Sections: [$filter](collection-query-semantics.md#filter) · [Server-driven paging](collection-query-semantics.md#server-driven-paging) · [Parameter aliases](collection-query-semantics.md#parameter-aliases)
Not here: `$select`/`$expand` → [select-and-expand](select-and-expand.md); `/$count` path segment → [reading-data](../reading-data/index.md)

## [$select and $expand (including expand options)](select-and-expand.md)
Use when: choosing properties with `$select`, including related entities with `$expand`, or nesting expand options (`$filter`, `$orderby`, `$count`, nested `$expand`).
Terms: `$select`, `$expand`, `*`, expand options, nested expand
Sections: [Choosing properties with $select](select-and-expand.md#choosing-properties-with-select) · [Including related entities with $expand](select-and-expand.md#including-related-entities-with-expand)
Not here: filter/order/page on the root collection → [collection-query-semantics](collection-query-semantics.md)
