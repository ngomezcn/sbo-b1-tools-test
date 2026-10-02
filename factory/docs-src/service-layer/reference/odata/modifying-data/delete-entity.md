---
title: Delete an entity
source: external OData: oasis-p1@v4.01-os 11.4.5 + ms@3ca8f5b delete-data; retrieved 2026-10-02
summary: How to delete an entity with DELETE, the 204 No Content response, and what happens to relations and related entities.
---
# Delete an entity

In Service Layer: reference/consuming-service-layer/crud-operations.md

To delete an individual entity, the client makes a `DELETE` request to a URL that identifies the entity. Services MAY restrict deletes only to requests addressing the edit URL of the entity.

The request body SHOULD be empty. Singleton entities can be deleted if they are nullable. Services supporting this SHOULD advertise it by annotating the singleton with the term `Capabilities.DeleteRestrictions` (nested property `Deletable` with value `true`) defined in [OData-VocCap].

On successful completion of the delete, the response MUST be `204 No Content` and contain an empty body.

Services MUST implicitly remove relations to and from an entity when deleting it; clients need not delete the relations explicitly.

Services MAY implicitly delete or modify related entities if required by integrity constraints. If integrity constraints are declared in `$metadata` using a `ReferentialConstraint` element, services MUST modify affected related entities according to the declared integrity constraints, e.g. by deleting dependent entities, or setting dependent properties to `null` or their default value.

One such integrity constraint results from using a navigation property in a key definition of an entity type. If the related "key" entity is deleted, the dependent entity is also deleted.

## Example

The request below deletes the ***Person*** with ***UserName*** 'vincentcalabrese'.

```http
DELETE serviceRoot/People('vincentcalabrese')
```

Response Payload

```http
HTTP/1.1 204 No Content
OData-Version: 4.0
```
