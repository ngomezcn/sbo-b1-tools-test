---
title: Create an entity
source: external OData: oasis-p1@v4.01-os 11.4.2 + ms@3ca8f5b create-data; retrieved 2026-10-02
summary: How to create an entity with POST, link it to existing entities or create related entities in the same request (deep insert), and what the service returns (201 or 204, Location header).
---
# Create an entity

In Service Layer: reference/consuming-service-layer/crud-operations.md; reference/consuming-service-layer/associations.md ; SL differs: `Prop@odata.bind` is not applied (verified on a live SL 10.0, v1 and v2): a `POST` with `"BusinessPartner@odata.bind"` or `"ItemGroups@odata.bind"` returns `201` and the link is not set (the foreign-key property keeps its default or null), and an unknown or nonexistent target gives no error, set the foreign-key property (for example `Mainsupplier`, `ItemsGroupCode`) in the body instead

## Request rules

To create an entity in a collection, the client sends a `POST` request to that collection's URL. The `POST` body MUST contain a single valid entity representation.

- The entity representation MAY include references to existing entities as well as content for new related entities, but MUST NOT contain content for existing related entities. The result is the entity with relationships to all included references to existing entities and to all related entities created inline.
- If the key properties of an entity include key properties of a directly related entity, those related entities MUST be included either as references to existing entities or as content for new related entities.
- An entity may also be created as the result of an upsert operation.
- If the target URL for the collection is a navigation link, the new entity is automatically linked to the entity containing the navigation link.
- If the target URL ends in a type cast segment, the segment MUST specify the type of the collection or a type derived from it, and the entity MUST be created as that specified type.

### Properties in the body

- To create an open entity (an instance of an open type), additional property values beyond those in the metadata MAY be sent. The service MUST treat them as dynamic properties and add them to the created instance.
- If the entity is not open, additional property values beyond those in the metadata SHOULD NOT be sent. The service MUST fail if it is unable to persist all property values specified in the request.
- Properties computed by the service (annotated with the term `Core.Computed`, see [OData-VocCore]) and properties tied to properties of the principal entity by a referential constraint can be omitted, and MUST be ignored if included.
- Properties with a defined default value, nullable properties, and collection-valued properties omitted from the request are set to the default value, null, or an empty collection, respectively.

## Response

- The response MUST contain a `Location` header with the edit URL or read URL of the created entity.
- The service MUST respond with either `201 Created` and a representation of the created entity, or `204 No Content` if the request included a `Prefer` header with value `return=minimal` and did not include the system query options `$select` and `$expand`.

Example (Microsoft TripPin sample): creating a person that has a complex type and a collection property. The service answers `201 Created` with a `Location` header and the created entity.

```json
    POST serviceRoot/People
    OData-Version: 4.0
    Content-Type: application/json;odata.metadata=minimal
    Accept: application/json

    {
    "@odata.type" : "Microsoft.OData.SampleService.Models.TripPin.Person",
    "UserName": "teresa",
    "FirstName" : "Teresa",
    "LastName" : "Gilbert",
    "Gender" : "Female",
    "Emails" : ["teresa@example.com", "teresa@contoso.com"],
    "AddressInfo" : [
    {
    "Address" : "1 Suffolk Ln.",
    "City" :
    {
    "CountryRegion" : "United States",
    "Name" : "Boise",
    "Region" : "ID"
    }
    }]
    }
```

Response payload:

```json

HTTP/1.1 201 Created
Content-Length: 468
Content-Type: application/json;odata.metadata=minimal;odata.streaming=true;IEEE754Compatible=false;charset=utf-8
Location: serviceRoot/People('teresa')
OData-Version: 4.0
{
    "@odata.context":"serviceRoot/$metadata#People/$entity",
    "@odata.id":"serviceRoot/People('teresa')",
    "@odata.editLink":"serviceRoot/People('teresa')",
    "UserName":"teresa",
    "FirstName":"Teresa",
    "LastName":"Gilbert",
    "Emails":["teresa@example.com","teresa@contoso.com"],
    "AddressInfo":[{"Address":"1 Suffolk Ln.","City":{"CountryRegion":"United States","Name":"Boise","Region":"ID"}}],
    "Gender":"Female"
}
```

## Link to related entities when creating an entity

To create a new entity with links to existing entities in a single request, the client includes references to the related entities in the request body. The representation for referencing related entities is format-specific.

Example 76: using the JSON format, 4.0 clients can create a new manager entity with links to two existing employees by applying the `odata.bind` annotation to the `DirectReports` navigation property

```json
{
  "@odata.type":"#Northwind.Manager",
  "ID": 1,
  "FirstName": "Pat",
  "LastName": "Griswold",
  "": [
    "http://host/service/Employees(5)",
    "http://host/service/Employees(6)"
  ]
}
```

Example 77: using the JSON format, 4.01 clients can create a new manager entity with links to two existing employees by including the entity-ids within the `DirectReports` navigation property

```json
{
  "@type":"#Northwind.Manager",
  "ID": 1,
  "FirstName": "Pat",
  "LastName": "Griswold",
  "DirectReports": [
    {"@id": "Employees(5)"},
    {"@id": "Employees(6)"}
  ]
}
```

- On success, the service creates the requested entity and relates it to the requested existing entities.
- If the target URL of the collection and the binding information in the `POST` body contradict the implicit binding information of the request URL, the request MUST fail, and the service responds with `400 Bad Request`.
- On failure, the service MUST NOT create the new entity. In particular, the service MUST never create an entity in a partially valid state (with the navigation property unset).

## Create related entities when creating an entity (deep insert)

A request to create an entity that includes related entities, represented using the appropriate inline representation, is a "deep insert".

- Media entities MUST contain the base64url-encoded representation of their media stream as a virtual property `$value` when nested within a deep insert.
- Each included related entity is processed observing the rules for creating an entity, as if it was posted against the original target URL extended with the navigation path to this related entity.
- On success, the service MUST create all entities and relate them. If the service responds with `201 Created`, the response MUST be expanded to at least the level that was present in the deep-insert request.
- Clients MAY associate an id with individual nested entities in the request by using the `Core.ContentID` term defined in [OData-VocCore]. Services that respond with `201 Created` SHOULD annotate the entities in the response with the same `Core.ContentID` value as in the request.
- Services SHOULD advertise support for deep inserts, including support for returning the `Core.ContentID`, through the `Capabilities.DeepInsertSupport` term, defined in [OData-VocCap]; services that advertise support through `Capabilities.DeepInsertSupport` MUST return the `Core.ContentID` for the inserted or updated entities.
- The `continue-on-error` preference is not supported for deep insert operations.
- On failure, the service MUST NOT create any of the entities.
