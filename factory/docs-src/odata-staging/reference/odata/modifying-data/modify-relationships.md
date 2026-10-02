---
title: Modify relationships between entities
source: external OData: oasis-p1@v4.01-os 11.4.6; retrieved 2026-10-02
summary: How to add, remove, change or replace references between existing entities with POST, DELETE and PUT on navigation property reference resources, and the responses to expect.
---
# Modifying Relationships between Entities

In Service Layer: no equivalent hoja

Relationships between entities are represented by navigation properties as described in Data Model. URL conventions for navigation properties are described in [OData-URL].

## Add a Reference to a Collection-Valued Navigation Property

A successful `POST` request to a navigation property's references collection adds a relationship to an existing entity. The request body MUST contain a single entity reference that identifies the entity to be added. See the appropriate format document for details.

On successful completion, the response MUST be `204 No Content` and contain an empty body.

Note that if the two entities are already related prior to the request, the request is completed successfully.

## Remove a Reference to an Entity

A successful `DELETE` request to the URL that represents a reference to a related entity removes the relationship to that entity.

In OData 4.0, the entity reference to be removed within a collection-valued navigation property is the URL that represents the collection of related references, with the reference to be removed identified by the `$id` query option. OData 4.01 services additionally support using the URL that represents the reference of the collection member to be removed, identified by key, as described in [OData-URL].

For single-valued navigation properties, the `$id` query option MUST NOT be specified.

The `DELETE` request MUST NOT violate any integrity constraints in the data model.

On successful completion, the response MUST be `204 No Content` and contain an empty body.

## Change the Reference in a Single-Valued Navigation Property

A successful `PUT` request to a single-valued navigation property's reference resource changes the related entity. The request body MUST contain a single entity reference that identifies the existing entity to be related. See the appropriate format document for details.

On successful completion, the response MUST be `204 No Content` and contain an empty body.

Alternatively, a relationship MAY be updated as part of an update to the source entity by including the required binding information for the new target entity. This binding information is format-specific, see [OData-JSON] for details.

If the single-valued navigation property is used in the key definition of an entity type, it cannot be changed and the request MUST fail with `405 Method Not Allowed` or an other appropriate error.

## Replace all References in a Collection-valued Navigation Property

A successful `PUT` request to a collection-valued navigation property's reference resource replaces the set of related entities. The request body MUST contain a collection of entity references in the same format as returned by a `GET` request to the navigation property's reference resource.

A successful `DELETE` request to a collection-valued navigation property's reference resource removes all related references from the collection.
