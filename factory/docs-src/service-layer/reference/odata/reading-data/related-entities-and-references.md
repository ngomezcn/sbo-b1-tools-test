---
title: Related entities, references and entity-ids
source: external OData: oasis-p1@v4.01-os 11.2.7, 11.2.8, 11.2.9; retrieved 2026-10-02
summary: How to GET related entities via a navigation property, request entity references with /$ref, and resolve an entity-id with $entity and $id.
---
# Related entities, references and entity-ids

In Service Layer: reference/consuming-service-layer/associations.md ; SL differs: `GET` with `/$ref` appended is not supported (verified on a live SL 10.0, v1 and v2): it returns `400` with code `201` (`Invalid query option: $ref is an invalid property.`), to get the related key read the entity or `$expand` the navigation property

## Requesting Related Entities

To request related entities according to a particular relationship, the client issues a `GET` request to the source entity's request URL, followed by a forward slash and the name of the navigation property representing the relationship.

If the navigation property does not exist on the entity indicated by the request URL, the service returns `404 Not Found`.

If the relationship terminates on a collection, the response MUST be the format-specific representation of the collection of related entities. If no entities are related, the response is the format-specific representation of an empty collection.

If the relationship terminates on a single entity, the response MUST be the format-specific representation of the related single entity. If no entity is related, the service returns `204 No Content`.

Example 65: return the supplier of the product with `ID=1` in the Products entity set

```http
GET http://host/service/Products(1)/Supplier
```

## Requesting Entity References

To request entity references in place of the actual entities, the client issues a `GET` request with `/$ref` appended to the resource path.

If the resource path does not identify an entity or a collection of entities, the service returns `404 Not Found`.

If the resource path identifies a collection, the response MUST be the format-specific representation of a collection of entity references pointing to the related entities. If no entities are related, the response is the format-specific representation of an empty collection. The response MAY contain an ETag header for the collection whose value changes if the collection of references changes, i.e. a reference is added or removed.

If the resource path identifies a single existing entity, the response MUST be the format-specific representation of an entity reference. The response MAY contain an ETag header which represents the identity of the referenced entity. If the resource path terminates in a single-valued navigation path, the ETag value changes if the relationship is changed and points to a different OData entity. If the resource path is the canonical path for a single entity, the returned ETag can never change.

If the resource path terminates on a single entity and no such entity exists, the service returns either `204 No Content` or `404 Not Found`.

Example 66: collection with an entity reference for each Order related to the Product with `ID=0`

```http
GET http://host/service/Products(0)/Orders/$ref
```

## Resolving an Entity-Id

To resolve an entity-id, e.g. obtained in an entity reference, into a representation of the identified entity, the client issues a `GET` request to the `$entity` resource located at the URL `$entity` relative to the service root. The entity-id MUST be specified using the system query option `$id`.

Example 67: return the entity representation for a given entity-id

```http
GET http://host/service/$entity?$id=http://host/service/Products(0)
```

A type segment following the `$entity` resource casts the resource to the specified type. If the identified entity is not of the specified type, or a type derived from the specified type, the service returns `404 Not Found`.

After applying a type-cast segment to cast to a specific type, the system query options `$select` and `$expand` can be specified in `GET` requests to the `$entity` resource.

Example 68: return the entity representation for a given entity-id and specify properties to return

```http
GET http://host/service/$entity/Model.Customer
                            ?$id=http://host/service/Customers('ALFKI')
                           &$select=CompanyName,ContactName
                           &$expand=Orders
```
