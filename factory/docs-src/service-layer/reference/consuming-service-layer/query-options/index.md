# Query options

## [Supported query options](options-reference.md)
Use when: looking up which options exist and their functions, operators and examples.
Terms: `$filter`, `startswith`, `endswith`, `contains`, `substringof`, `$select`, `$orderby`, `$top`, `$skip`, `$count`, `$inlinecount`

## [Get entities, fields and typed properties](basic-queries.md)
Use when: getting all entities, selecting fields, filtering on enumeration, datetime or time properties.
Terms: `$select`, `$filter`, enum, datetime, time

## [Paginate the selected orders](pagination.md)
Use when: paging a large result and changing the page size.
Terms: `$top`, `$skip`, `odata.nextLink`, `Prefer: odata.maxpagesize`, `Preference-Applied`
Not here: paging a stored SQL query → [sql-query](../../sql-query/index.md)

## [Aggregation](aggregation.md)
Use when: computing sum, average, max, min, count or distinct count.
Terms: `$apply`, `aggregate`, `sum`, `average`, `max`, `min`, `countdistinct`, `$inlinecount`

## [Grouping](grouping.md)
Use when: grouping results, optionally with aggregates and a filter.
Terms: `$apply`, `groupby`, `aggregate`, `filter`

## [Cross-joins](cross-joins.md)
Use when: querying across entity sets with no association.
Terms: `$crossjoin`, `$expand`, `$filter`, calculation, aggregation

## [Row-level filter](row-level-filter.md)
Use when: filtering document lines (row level) of a query.
Terms: `QueryService_PostQuery`, function import, `$crossjoin`

## [Expand query enhancements](expand-enhancements.md)
Use when: selecting only some properties of expanded entities.
Terms: `$expand`, `$select` inside `$expand`
