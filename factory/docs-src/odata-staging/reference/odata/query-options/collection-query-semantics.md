---
title: Filtering, ordering, paging, counting and parameter aliases (collection semantics)
source: external OData: oasis-p1@v4.01-os 11.2.6 + oasis-p2@v4.01-os 5.3 + ms@3ca8f5b queryoptions-overview--parameter-aliases; retrieved 2026-10-02
summary: How $filter, $orderby, $top, $skip and $count behave on a queried collection, how server-driven paging and next links work, and how parameter aliases pass values in the URL.
---
# Filtering, ordering, paging, counting and parameter aliases (collection semantics)

In Service Layer: reference/consuming-service-layer/query-options/options-reference.md; reference/consuming-service-layer/query-options/pagination.md; reference/consuming-service-layer/query-options/aggregation.md

- [Querying collections](#querying-collections)
- [$filter](#filter)
- [Parameter aliases](#parameter-aliases)
- [$orderby](#orderby)
- [$top and $skip](#top-and-skip)
- [$count](#count)
- [Server-driven paging](#server-driven-paging)
- [Scope of this page](#scope-of-this-page)

## Querying collections

OData services support querying collections of entities, complex type instances, and primitive values.

The target collection is specified through a URL, and query operations such as filter, sort, paging, and projection are specified as *system query options* optionally prefixed with a dollar (`$`) character.

- 4.01 services MUST support case-insensitive system query option names specified with or without the `$` prefix.
- Clients that want to work with 4.0 services MUST use lower case names and specify the `$` prefix.
- The same system query option MUST NOT be specified more than once for any resource.
- An OData service MAY support some or all of the system query options defined. If a data service does not support a system query option, it MUST fail any request that contains the unsupported option and SHOULD return `501 Not Implemented`.

## $filter

The `$filter` system query option restricts the set of items returned. Its value is a Boolean expression as defined in [OData-ABNF].

Example 46: return all Products whose `Price` is less than $10.00

```http
GET http://host/service/Products?$filter=Price lt 10.00
```

The `$count` segment may be used within a `$filter` expression to limit the items returned based on the exact count of related entities or items within a collection-valued property.

Example 47: return all Categories with less than 10 products

```http
GET http://host/service/Categories?$filter=Products/$count lt 10
```

Built-in filter operations and built-in query functions:

- 4.01 services MUST support case-insensitive operation names and case-insensitive built-in function names. Clients that want to work with 4.0 services MUST use lower case names.
- OData does not define an ISNULL or COALESCE operator. Instead, there is a `null` literal that can be used in comparisons.
- For a full description of the syntax used when building requests, see [OData-URL].

## Parameter aliases

Parameter aliases can be used in place of literal values in entity keys, function parameters, or within a `$compute,` `$filter` or `$orderby` expression. Parameter aliases are names beginning with an at sign (`@`); they MUST start with an `@` character, see rule `parameterAlias` in [OData-ABNF].

Actual parameter values are specified as query options in the query part of the request URL. The query option name is the name of the parameter alias, and the query option value is the value to be used for the specified parameter alias. The [OData-ABNF] rule `aliasAndValue` defines the formal grammar for passing parameter alias values as query options.

Example 48: returns all employees whose Region property matches the string parameter value "WA"

```http
GET http://host/service.svc/Employees?$filter=Region eq @p1&@p1='WA'
```

Parameter aliases allow the same value to be used multiple times in a request and may be used to reference primitive, structured, or collection values.

- If a parameter alias is not given a value in the query part of the request URL, the value MUST be assumed to be null.
- A parameter alias can be used in multiple places within a request URL, but its value MUST NOT be specified more than once.
- Parameter alias values used in `/$filter` path segments are always passed as expressions (because that is the expected type of the parameter).
- All other parameter alias values are evaluated in the context of the resource identified by the path segment in which they are assigned and passed as values into the expression.
- Parameter alias value assignments MAY be nested within `$expand` and `$select`, in which case they are evaluated relative to the resource context of the `$expand` or `$select`.

Example 49: returns all employees, expands their manager, and expands all direct reports with the same first name as the manager, using a parameter alias for `$this` to pass the manager into the filter on the expanded direct reports

```http
GET http://host/service.svc/Employees?$expand=Manager(@m=$this;$expand=DirectReports($filter=@m/FirstName eq FirstName))
```

Example 136:

```text
http://host/service/Movies?$filter=contains(@word,Title)&@word='Black'
```

Example 137:

```text
http://host/service/Movies?$filter=Title eq @title&@title='Wizard of Oz'
```

Example 138: JSON array of strings as parameter alias value - note that `[`, `]`, and `"` need to be percent-encoded in real URLs, the clear-text representation used here is just for readability

```text
http://host/service/Products/Model.WithIngredients(Ingredients=@i)?@i=["Carrots","Ginger","Oranges"]
```

## $orderby

The `$orderby` system query option specifies the order in which items are returned from the service.

- The value contains a comma-separated list of expressions whose primitive result values are used to sort the items. A special case of such an expression is a property path terminating on a primitive property.
- A type cast using the qualified entity type name is required to order by a property defined on a derived type. Only aliases defined in the metadata document of the service can be used in URLs.
- The expression can include the suffix `asc` for ascending or `desc` for descending, separated from the property name by one or more spaces. If `asc` or `desc` is not specified, the service MUST order by the specified property in ascending order.
- 4.01 services MUST support case-insensitive values for `asc` and `desc`. Clients that want to work with 4.0 services MUST use lower case values.
- Null values come before non-null values when sorting in ascending order and after non-null values when sorting in descending order.
- Items are sorted by the result values of the first expression, and then items with the same value for the first expression are sorted by the result value of the second expression, and so on.
- The Boolean value false comes before the value true in ascending order.
- Services SHOULD order language-dependent strings according to the content-language of the response, and SHOULD annotate string properties with language-dependent order with the term `Core.IsLanguageDependent`, see [OData-VocCore].
- Values of type `Edm.Stream` or any of the `Geo` types cannot be sorted.

Example 50: return all Products ordered by release date in ascending order, then by rating in descending order

```http
GET http://host/service/Products?$orderby=ReleaseDate asc, Rating desc
```

Related entities may be ordered by specifying `$orderby` within the `$expand` clause.

Example 51: return all Categories, and their Products ordered according to release date and in descending order of rating

```http
GET http://host/service/Categories?
    $expand=Products($orderby=ReleaseDate asc, Rating desc)
```

`$count` may be used within a `$orderby` expression to order the returned items according to the exact count of related entities or items within a collection-valued property.

Example 52: return all Categories ordered by the number of Products within each category

```http
GET http://host/service/Categories?$orderby=Products/$count
```

## $top and $skip

The `$top` system query option specifies a non-negative integer n that limits the number of items returned from a collection. The service returns the number of available items up to but not greater than the specified value n.

Example 53: return only the first five products of the Products entity set

```http
GET http://host/service/Products?$top=5
```

The `$skip` system query option specifies a non-negative integer n that excludes the first n items of the queried collection from the result. The service returns items starting at position n+1.

Example 54: return products starting with the 6th product of the `Products` entity set

```http
GET http://host/service/Products?$skip=5
```

Where `$top` and `$skip` are used together, `$skip` MUST be applied before `$top`, regardless of the order in which they appear in the request.

Example 55: return the third through seventh products of the `Products` entity set

```http
GET http://host/service/Products?$top=5&$skip=2
```

If no unique ordering is imposed through an `$orderby` query option, the service MUST impose a stable ordering across requests that include `$top` or `$skip`.

## $count

The `$count` system query option with a value of `true` specifies that the total count of items within a collection matching the request be returned along with the result.

Example 56: return, along with the results, the total number of products in the collection

```http
GET http://host/service/Products?$count=true
```

The count of related entities can be requested by specifying the `$count` query option within the `$expand` clause.

Example 57:

```http
GET http://host/service/Categories?$expand=Products($count=true)
```

- A `$count` query option with a value of `false` (or not specified) hints that the service SHOULD NOT return a count.
- The service returns an HTTP Status code of `400 Bad Request` if a value other than `true` or `false` is specified.
- The `$count` system query option ignores any `$top`, `$skip`, or `$expand` query options, and returns the total count of results across all pages including only those results matching any specified `$filter` and `$search`.
- Clients should be aware that the count returned inline may not exactly equal the actual number of items returned, due to latency between calculating the count and enumerating the last value or due to inexact calculations on the service.
- How the count is encoded in the response body is dependent upon the selected format.

## Server-driven paging

Responses that include only a partial set of the items identified by the request URL MUST contain a link that allows retrieving the next partial set of items. This link is called a *next link*; its representation is format-specific. The final partial set of items MUST NOT contain a next link.

- The client can request a maximum page size through the `maxpagesize` preference. The service may apply this requested page size or implement a page size different than, or in the absence of, this preference.
- OData clients MUST treat the URL of the next link as opaque, and MUST NOT append system query options to the URL of a next link.
- Services may not allow a change of format on requests for subsequent pages using the next link. Clients therefore SHOULD request the same format on subsequent page requests using a compatible `Accept` header.
- OData services may use the reserved system query option `$skiptoken` when building next links. Its content is opaque, service-specific, and must only follow the rules for URL query parts.
- OData clients MUST NOT use the system query option `$skiptoken` when constructing requests.

## Scope of this page

> **Note**: This page covers `$filter` semantics, `$orderby`, `$top`, `$skip`, `$count`, server-driven paging and parameter aliases. The built-in filter operator and function tables, `$search`, and addressing an individual member of an ordered collection by ordinal are not covered here.
