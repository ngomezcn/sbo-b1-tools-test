---
title: Query options overview
source: external OData: ms@3ca8f5b queryoptions-overview + oasis-p1@v4.01-os 11.2.1 + oasis-p2@v4.01-os 5.2; retrieved 2026-10-02
summary: Which kinds of query options exist, what each system query option does, which resources accept which options, whether the $ prefix is optional, in what order the options are evaluated, and the rule for custom query options.
---
# Query options overview

In Service Layer: reference/consuming-service-layer/query-options/index.md; reference/consuming-service-layer/query-options/options-reference.md

A query option is a set of query string parameters applied to a resource. It controls the amount of data returned for the resource in the URL: the service filters, sorts or otherwise transforms its data before returning the results. A query option can be applied to every verb except `DELETE`.

The query options part of an OData URL specifies three types of information: system query options, custom query options and parameter aliases.

## System query options

System query options are query string parameters that control the amount and order of the data returned for the resource identified by the URL. They are prefixed with the dollar (`$`) character, which is optional in OData 4.01.

- 4.01 services MUST support case-insensitive system query option names, specified with or without the `$` prefix.
- Clients that want to work with 4.0 services MUST use lower case names and specify the `$` prefix.

The system query options are `$filter`, `$select`, `$orderby`, `$count`, `$top`, `$skip` and `$expand`. The sections below also mention `$search`, `$compute` and `$format`, which appear in the evaluation order and in the conventions.

### Filter

`$filter` filters the collection addressed by the request URL. The expression is evaluated for each resource in the collection and only items where it evaluates to true are included. Resources for which the expression evaluates to false or null, or which reference properties that are unavailable due to permissions, are omitted from the response.

Examples:

```text
http://host/service/Products?$filter=Name eq 'Milk'
```

```text
http://host/service/Products?$filter=Name ne 'Milk'
```

```text
http://host/service/Products?$filter=Name gt 'Milk'
```

```text
http://host/service/Products?$filter=Name ge 'Milk'
```

```text
http://host/service/Products?$filter=Name lt 'Milk'
```

```text
http://host/service/Products?$filter=Name le 'Milk'
```

```text
http://host/service/Products?$filter=Name eq 'Milk' and Price lt 2.55
```

```text
http://host/service/Products?$filter=Name eq 'Milk' or Price lt 2.55
```

```text
http://host/service/Products?$filter=not endswith(Name,'ilk')
```

```text
http://host/service/Products?$filter=style has Sales.Pattern'Yellow'
```

```text
http://host/service/Products?$filter=Name in ('Milk', 'Cheese')
```

In order: Name equal to 'Milk'; not equal; greater than; greater than or equal; less than; less than or equal; Name 'Milk' and Price less than 2.55; Name 'Milk' or Price less than 2.55; Name does not end with 'ilk'; style value includes Yellow; Name is 'Milk' or 'Cheese'.

### Expand

`$expand` specifies the related resources or media streams to be included in line with the retrieved resources. Each expand item is evaluated relative to the entity containing the navigation or stream property being expanded.

```text
http://host/service/Products?$expand=Category
```

```text
http://host/service/Customers?$expand=Addresses/Country
```

The first expands a navigation property of an entity type, the second a navigation property of a complex type.

Query options can be applied to an expanded navigation property by appending a semicolon-separated list of query options, enclosed in parentheses, to the navigation property name. Allowed system query options are `$filter`, `$select`, `$orderby`, `$skip`, `$top`, `$count`, `$search` and `$expand`.

All categories and, for each category, all related products with a discontinued date equal to null:

```text
http://host/service/Categories?$expand=Products($filter=DiscontinuedDate eq null)
```

### Select

`$select` requests a specific set of properties for each entity or complex type. It is often used together with `$expand`: `$expand` defines the extent of the resource graph to return and `$select` a subset of properties for each resource in the graph.

Rating and release date of all products:

```text
http://host/service/Products?$select=Rating,ReleaseDate
```

A star (`*`) requests all declared and dynamic structural properties. All structural properties of all products:

```text
http://host/service/Products?$select=*
```

### OrderBy

`$orderby` requests the resources in a particular order.

All products ordered by release date ascending, then by rating descending:

```http
GET http://host/service/Products?$orderby=ReleaseDate asc, Rating desc
```

Related entities are ordered by specifying `$orderby` within the `$expand` clause. All categories, and their products ordered by release date and then by descending rating:

```http
GET http://host/service/Categories?$expand=Products($orderby=ReleaseDate asc, Rating desc)
```

`$count` may be used within an `$orderby` expression to order the items by the exact count of related entities or items within a collection-valued property. All categories ordered by the number of products in each:

```http
GET http://host/service/Categories?$orderby=Products/$count
```

### Top and Skip

`$top` requests the number of items of the queried collection to include in the result. `$skip` requests the number of items to skip and leave out of the result. A client requests a particular page of items by combining `$top` and `$skip`.

```text
http://host/service/Products?$top=10
```

```text
http://host/service/Products?$skip=10
```

The first gets the top 10 items, the second skips the first 10 items.

### Count

`$count` requests a count of the matching resources, included with the resources in the response. It has a Boolean value, `true` or `false`.

Return, along with the results, the total number of products in the collection:

```text
http://host/service/Products?$count=true
```

The count of related entities is requested by specifying `$count` within the `$expand` clause:

```text
http://host/service/Categories?$expand=Products($count=true)
```

### Search

`$search` requests the items of a collection that match a free-text search expression. It can be applied to a URL representing a collection of entity, complex or primitive typed instances to return all matching items. Applied to the `$all` resource, it requests all matching entities in the service. If `$search` and `$filter` are both applied to the same request, the results include only the items that match both criteria.

All products that are blue or green; it is up to the service to decide what makes a product blue or green:

```text
http://host/service/Products?$search=blue OR green
```

## Custom query options

Custom query options are an extensible mechanism for service-specific information in the URL query string. A custom query option is any query option of the form of the rule `customQueryOption` in [OData-ABNF].

Custom query options MUST NOT begin with a `$` or `@` character.

Example 135: service-specific custom query option `debug-mode`

```text
http://host/service/Products?debug-mode=true
```

## Parameter aliases

The third type of information in the query options part of the URL is parameter aliases. They can be used in place of literal values in entity keys, function parameters, or within a `$filter` or `$orderby` expression.

## Evaluation order

The result of the request MUST be as if the system query options were evaluated in the following order.

- `$schemaversion` MUST be evaluated first, because it may influence any further processing.

Prior to applying any server-driven paging:

1. `$apply` (defined in [OData-Aggregation])
2. `$compute`
3. `$search`
4. `$filter`
5. `$count`
6. `$orderby`
7. `$skip`
8. `$top`

After applying any server-driven paging:

1. `$expand`
2. `$select`
3. `$format`

## Which options a resource accepts

A request to a resource using the HTTP verbs `GET`, `PATCH` or `PUT` follows these conventions:

- Resource paths identifying a single entity, a complex type instance, a collection of entities or a collection of complex type instances allow `$compute`, `$expand` and `$select`.
- Resource paths identifying a collection allow `$filter`, `$search`, `$count`, `$orderby`, `$skip` and `$top`.
- Resource paths ending in `/$count` allow `$filter` and `$search`.
- Resource paths not ending in `/$count` or `/$batch` allow `$format`.
- Query options for a `POST` operation may differ with the type of object returned in the response: whether the `POST` returns a single entity or a collection of entities affects which query options apply.
