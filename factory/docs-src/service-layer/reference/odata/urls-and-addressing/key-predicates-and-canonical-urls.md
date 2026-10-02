---
title: Key predicates and canonical URLs
source: external OData: oasis-p2@v4.01-os 4.3.1, 4.3.3; retrieved 2026-10-02
summary: What the canonical URL of an entity and its key predicate look like, and how the key predicate of a related entity can be shortened when a referential constraint exists.
---
# Key predicates and canonical URLs

In Service Layer: reference/consuming-service-layer/crud-operations.md; reference/consuming-service-layer/associations.md

## Canonical URL

For OData services conformant with the addressing conventions in this section, the canonical form of an absolute URL identifying a non-contained entity is formed by adding a single path segment to the service root URL. The path segment is made up of the name of the entity set associated with the entity followed by the key predicate identifying the entity within the collection. No type-cast segment is added to the canonical URL, even if the entity is an instance of a type derived from the declared entity type of its entity set.

The canonical key predicate for single-part keys consists only of the key property value without the key property name. For multi-part keys the key properties appear in the same order they appear in the key definition in the service metadata.

Example 19: Non-canonical URL

```text
http://host/service/Categories(ID=1)/Products(ID=1)
```

Example 20: Canonical URL for previous example:

```text
http://host/service/Products(1)
```

## URLs for Related Entities with Referential Constraints

If a navigation property leading to a related entity type has a partner navigation property that specifies a referential constraint, then those key properties of the related entity that take part in the referential constraint MAY be omitted from URLs.

Example 21: full key predicate of related entity

```text
https://host/service/Orders(1)/Items(OrderID=1,ItemNo=2)
```

Example 22: shortened key predicate of related entity

```text
https://host/service/Orders(1)/Items(2)
```

The two above examples are equivalent if the navigation property `Items` from `Order` to `OrderItem` has a partner navigation property from `OrderItem` to `Order` with a referential constraint tying the value of the `OrderID` key property of the `OrderItem` to the value of the `ID` key property of the `Order`.

The shorter form that does not specify the constrained key parts redundantly is preferred. If the value of the constrained key is redundantly specified, then it MUST match the principal key value.
