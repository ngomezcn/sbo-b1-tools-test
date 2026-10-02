---
title: Update an entity (PATCH, PUT, upsert)
source: external OData: oasis-p1@v4.01-os 11.4.3, 11.4.4 + ms@3ca8f5b update-data; retrieved 2026-10-02
summary: How to update an entity with PATCH or PUT, how deep updates and upserts work, which properties are ignored, and what the service returns (200 or 204).
---
# Update an entity (PATCH, PUT, upsert)

In Service Layer: reference/consuming-service-layer/crud-operations.md; reference/faq/faq.md; reference/etag/etag-guide.md ; SL differs: upsert is not supported (verified on a live SL 10.0, v1 and v2): `PATCH` or `PUT` to a key that does not exist returns `404` with error code `-2028` (`Entity with value('KEY') does not exist`) and creates nothing, with or without `If-None-Match: *`, so create with `POST`, `Prop@odata.bind` in a `PATCH` body is accepted with `204` but silently ignored (set the foreign-key property instead)

- [Update request](#update-request)
- [Deep update](#deep-update)
- [Upsert](#upsert)

## Update request

To update an individual entity, the client makes a `PATCH` or `PUT` request to a URL that identifies the entity. Services MAY restrict updates only to requests addressing the edit URL of the entity.

### PATCH and PUT

- Services SHOULD support `PATCH` as the preferred means of updating an entity. `PATCH` provides more resiliency between clients and services by directly modifying only the values specified by the client. Clients SHOULD use `PATCH` and specify only those properties intended to be changed.
- `PATCH` (as defined in [RFC5789]) merges the content of the request payload with the entity's current state, applying the update only to the components specified in the request body. Collection properties and primitive properties provided in the payload that correspond to updatable properties MUST replace the value of the corresponding property in the entity or complex type. Missing properties of the containing entity or complex property, including dynamic properties, MUST NOT be directly altered unless as a side effect of changes resulting from the provided properties.
- Services MAY additionally support `PUT` but should be aware of the potential for data loss in round-tripping properties that the client may not know about in advance, such as open or added properties, or properties not specified in metadata. Services that support `PUT` MUST replace all values of structural properties with those specified in the request body.
  - Missing non-key, updatable structural properties not defined as dependent properties within a referential constraint MUST be set to their default values.
  - Omitting a non-nullable property with no service-generated or default value from a `PUT` request results in a `400 Bad Request` error.
  - Missing dynamic structural properties MUST be removed or set to `null`.

### Properties that are ignored or rejected

- Key and other properties marked as read-only in metadata (including computed properties), as well as dependent properties that are not tied to key properties of the principal entity, can be omitted from the request. If the request contains a value for one of these properties, the service MUST ignore that value when applying the update.
- Services MUST return an error if an insert or update contains a new value for a property marked as updatable that cannot currently be changed by the user (given the state of the object or the permissions of the user). The service MAY return success in this case if the specified value matches the value of the property.
- Entity id and entity type cannot be changed when updating an entity. However, format-specific rules might in some cases require providing entity id and entity type values in the payload when applying the update.
- If the entity being updated is open, additional values for properties beyond those specified in the metadata or returned in a previous request MAY be sent in the request body. The service MUST treat these as dynamic properties.
- If the entity is not open, such additional values SHOULD NOT be sent. The service MUST fail if it is unable to persist all updatable property values specified in the request.
- For requests with an `OData-Version` header of `4.01` or greater, the media stream of a media entity can be updated by specifying the base64url-encoded representation of the media stream as a virtual property `$value`.

### Referential constraints and bindings

- Updating a dependent property that is tied to a key property of the principal entity through a referential constraint updates the relationship to point to the entity with the specified key value. If there is no such entity, the update fails.
- Updating a principal property that is tied to a dependent entity through a referential constraint on the dependent entity updates the dependent property.
- If an update specifies both a binding to a single-valued navigation property and a dependent property tied to a key property of the principal entity through the same navigation property, the dependent property is ignored and the relationship is updated according to the binding.

### ETag in the request body

- For requests with an `OData-Version` header of `4.01` or greater, if the entity representation in the request body includes an ETag value, the update MUST NOT be performed and SHOULD return `412 Precondition Failed` if the supplied ETag value is not `*` and does not match the current ETag value for the entity.
- ETag values in request bodies MUST be ignored for requests containing an `OData-Version` header of `4.0`.

### Response

Upon successful completion the service responds with either `200 OK` and a representation of the updated entity, or `204 No Content`. The client may request that the response SHOULD include a body by specifying a `Prefer` header with value `return=representation`, or by specifying the system query options `$select` or `$expand`. If the service uses ETags for optimistic concurrency control, the entities in the response MUST include ETags.

Example (Microsoft TripPin sample): the request below updates the `Emails` of a person using `PATCH`.

```json
    PATCH serviceRoot/People('russellwhyte')
    OData-Version: 4.0
    Content-Type: application/json;odata.metadata=minimal
    Accept: application/json

    {
    "@odata.type" : "Microsoft.OData.SampleService.Models.TripPin.Person",
    "Emails" :  ["Russell@example.com", "Russell@contoso.com", "newRussell@contoso.com"]
    }
```

Response Payload

```json
HTTP/1.1 204 No Content
```

## Deep update

### Version 4.0 requests

Update requests with an `OData-Version` header of `4.0` MUST NOT contain related entities as inline content. Such requests MAY contain binding information for navigation properties. For single-valued navigation properties this replaces the relationship. For collection-valued navigation properties this adds to the relationship.

### Version 4.01 requests

Payloads with an `OData-Version` header of `4.01` or greater MAY include nested entities and entity references that specify the full set of entities to be related, or a nested delta payload representing the related entities that have been added, removed, or changed. Such a request is a "deep update".

If the nested collection is represented identically to an expanded navigation property, the set of nested entities and entity references in a successful update request represents the full set of entities to be related according to that relationship, and MUST NOT include added links, deleted links, or deleted entities.

Example 78: using the JSON format, a 4.01 `PATCH` request can update a manager entity. Following the update, the manager has three direct reports; two existing employees and one new employee named `Suzanne Brown`. The `LastName` of employee `6` is updated to `Smith.`

```json
{
  "@type":"#Northwind.Manager",
  "FirstName" : "Patricia",
  "DirectReports": [
    {
      "@id": "Employees(5}"
    },
    {
      "@id": "Employees(6}",
      "LastName": "Smith"
    },
    {
      "FirstName": "Suzanne",
      "LastName": "Brown"
    }
  ]
}
```

If the nested collection is represented as a delta annotation on the navigation property, the collection contains members to be added or changed and MAY include deleted entities for entities that are no longer part of the collection, using the delta payload format.

- If a deleted entity specifies a `reason` of `deleted`, the entity is both removed from the collection and deleted; otherwise it is removed from the collection and only deleted if the relationship is contained. Non-key properties of the deleted entity are ignored.
- Nested collections MUST NOT contain added or deleted links.
- If the request contains nested delta collections, the `PATCH` verb must be specified.

Example 79: using the JSON format, a 4.01 `PATCH` request can specify a nested delta representation to:

- delete employee 3 and remove link to it
- remove the link to employee 4 and do not delete it
- add a link to employee 5
- change the last name of employee 6 and link to it if necessary
- add a new employee named "Suzanne Brown" and link to it

```json
{
  "@type": "#Northwind.Manager",
  "FirstName": "Patricia",
  "DirectReports@delta": [
    {
      "@removed": {
        "reason": "deleted"
      },
      "@id": "Employees(3)"
    },
    {
      "@removed": {
        "reason": "changed"
      },
      "@id": "Employees(4)"
    },
    {
      "@id": "Employees(5)"
    },
    {
      "@id": "Employees(6)",
      "LastName": "Smith"
    },
    {
      "FirstName": "Suzanne",
      "LastName": "Brown"
    }
  ]
}
```

### Nested entities

- If a nested entity has the same id or key fields as an existing entity, the existing entity is updated according to the semantics of the `PUT` or `PATCH` request.
- Nested entities that have no id or key fields, or whose id or key fields do not match existing entities, are treated as inserts.
- If the nested collection does not represent a containment relationship and has no navigation property binding, such entities MUST include a context URL specifying the entity set in which the new entity is to be created.
- If any nested entities contain both id and key fields, they MUST identify the same entity, or the request is invalid.
- Clients MAY associate an id with individual nested entities in the request by using the `Core.ContentID` term defined in [OData-VocCore]. Services that respond with `200 OK` SHOULD annotate the entities in the response with the same `Core.ContentID` value as in the request.
- Services SHOULD advertise support for deep updates, including support for returning the `Core.ContentID`, through the `Capabilities.DeepUpdateSupport` term, defined in [OData-VocCap].
- The `continue-on-error` preference is not supported for deep update operations.
- On failure, the service MUST NOT apply any of the changes specified in the request.

## Upsert

An upsert occurs when the client sends an update request to a valid URL that identifies a single entity that does not yet exist. In this case the service MUST handle the request as a create entity request or fail the request altogether.

- Upserts are not supported against media entities, single-valued non-containment navigation properties, or entities whose key values are generated by the service. Services MUST fail an update request to a URL that would identify such an entity when the entity does not yet exist.
- Singleton entities can be upserted if they are nullable. Services supporting this SHOULD advertise it by annotating the singleton with the term `Capabilities.UpdateRestrictions` (nested property `Upsertable` with value `true`) defined in [OData-VocCap].
- Key and other non-updatable properties, as well as dependent properties that are not tied to key properties of the principal entity, MUST be ignored by the service when processing the upsert request.
- To ensure that an update request is not treated as an insert, the client MAY specify an `If-Match` header in the update request. The service MUST NOT treat an update request containing an `If-Match` header as an insert.
- A `PUT` or `PATCH` request MUST NOT be treated as an update if an `If-None-Match` header is specified with a value of `*`.
