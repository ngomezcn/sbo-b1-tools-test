---
title: Collection count and next-link annotations
source: external OData: oasis-p1@v4.01-os 11.2.10 + oasis-json@v4.01-os 13, 4.5.4, 4.5.5; retrieved 2026-10-02
summary: How to request only the number of items with /$count, and how a collection JSON payload carries count and nextLink control information.
---
# Collection count and next-link annotations

In Service Layer: reference/consuming-service-layer/query-options/pagination.md; reference/consuming-service-layer/query-options/aggregation.md; reference/consuming-service-layer/query-options/options-reference.md ; SL differs: next-link is often `odata.nextLink` with `$skip`, and inline count uses `$inlinecount`/`odata.count` (v3) beside `/$count`

- [Requesting the number of items (/$count)](#requesting-the-number-of-items-count)
- [Collection JSON payload](#collection-json-payload)
- [Control information: count](#control-information-count)
- [Control information: nextLink](#control-information-nextlink)

## Requesting the number of items (/$count)

To request only the number of items of a collection of entities or items of a collection-valued property, the client issues a `GET` request with `/$count` appended to the resource path of the collection.

On success, the response body MUST contain the exact count of items matching the request after applying any `$filter` or `$search` system query options, formatted as a simple primitive integer value with media type `text/plain`. Clients SHOULD NOT combine the system query options `$top`, `$skip`, `$orderby`, `$expand`, and `$format` with the path suffix `/$count`. The result of such a request is undefined.

Example 69: return the number of product`s` in the Products entity set

```http
GET http://host/service/Products/$count
```

With 4.01 services the `/$count` segment MAY be used in combination with the `/$filter path` segment to count the items in the filtered collection.

Example 70: return the number of products whose `Price` is less than $10.00

```http
GET http://host/service/Products/$filter(@foo)/$count?@foo=Price lt 10.00
```

For backwards compatibility, the `/$count` suffix MAY be used in combination with the `$filter` system query option.

Example 71: return the number of products whose `Price` is less than $10.00

```http
GET http://host/service/Products/$count?$filter=Price lt 10.00
```

The `$filter` system query option MUST NOT be used in conjunction with a both a `/$count` path segment and a `/$filter` path segment.

The `/$count` suffix can also be used in path expressions within system query options, e.g. `$filter`.

Example 72: return all customers with more than five interests

```http
GET http://host/service/Customers?$filter=Interests/$count gt 5
```

Example 73: return all categories with more than one product over $5.00

```http
GET http://host/service/Categories?
                        $filter=Products/$filter(Price gt 5.0)/$count gt 1
```

## Collection JSON payload

A collection of entities is represented as a JSON object containing a name/value pair named `value`. It MAY contain `context`, `type`, `count`, `nextLink`, or `deltaLink` control information.

If present, the `context` control information MUST be the first name/value pair in the response.

The `count` name/value pair represents the number of entities in the collection. If present and the `streaming=true` content-type parameter is set, it MUST come before the `value` name/value pair. If the response represents a partial result, the `count` name/value pair MUST appear in the first partial response, and it MAY appear in subsequent partial responses (in which case it may vary from response to response).

The value of the `value` name/value pair is a JSON array where each element is representation of an entity or a representation of an entity reference. An empty collection is represented as an empty JSON array.

Functions or actions that are bound to this collection of entities are advertised in the "wrapper object" in the same way as functions or actions are advertised in the object representing a single entity.

The `nextLink` control information MUST be included in a response that represents a partial result.

Example 28:

```json
{
  "@context": "...",
  "@count": 37,
  "value": [
    { ... },
    { ... },
    { ... }
  ],
  "@nextLink": "...?$skiptoken=342r89"
}
```

## Control information: count

The `count` control information (`odata.count`) occurs only in responses and can annotate any collection, see System Query Option `$count`. Its value is an `Edm.Int64` value corresponding to the total count of members in the collection represented by the request.

## Control information: nextLink

The `nextLink` control information (`odata.nextLink`) indicates that a response is only a subset of the requested collection. It contains a URL that allows retrieving the next subset of the requested collection.

This control information can also be applied to expanded to-many navigation properties.
