---
title: Returning results and common modification semantics
source: external OData: oasis-p1@v4.01-os 11.4.1; retrieved 2026-10-02
summary: What create, update and upsert requests return (the return preference, query options on the response), plus the shared rules for ETags, DateTimeOffset values, properties not in metadata and integrity constraints.
---
# Returning results and common modification semantics

In Service Layer: reference/consuming-service-layer/crud-operations.md; reference/etag/etag-guide.md ; SL differs: to get no content on a create it uses `Prefer: return-no-content` (answered with `204`)

## Returning results

Clients can request whether created or modified resources are returned from create, update, and upsert operations using the `return` preference header. Without that header, services SHOULD return the created or modified content unless the resource is a stream property value.

- When returning content other than for an update to a media entity stream, services MUST return the same content as a subsequent request to retrieve the same resource.
- For updating media entity streams, the content of a non-empty response body MUST be the updated media entity.

### Query options on the response

- Requests that return a single instance of a structured type or a collection of structured type instances MAY specify `$expand` and `$select`.
- Requests that return a collection MAY specify `$filter`.
- If one or more of these query options are present and no `return` preference is specified, a `return=representation` preference is implied.
- If one or more are present with a `return=minimal` preference, the service SHOULD NOT return a representation, and MUST include a `Preference-Applied` header if it does not return a representation.
- If one or more are present and the service returns a representation, the service MUST apply the specified query options. If it cannot apply them appropriately, it MUST NOT fail the request solely because they are present and instead MUST return `204 No Content`.

## Use of ETags for avoiding update conflicts

- Each entity has its own ETag value that MUST change when structural properties or links of that entity have changed. Modifying, adding, or deleting a contained entity MAY change the ETag of the parent entity.
- Collections of entities (including collections of related entities) MAY have their own ETag value whose semantics is service-specific. It typically changes if entities are added to or removed from the collection, or if an entity in the collection is changed. The ETag of a collection of related entities reached via a navigation property MAY differ from the ETag of the entity containing the navigation property.
- A Data Modification Request on an existing resource, or an Action Request invoking an action bound to an existing resource, MAY require optimistic concurrency control. Services SHOULD announce this via annotations with the term `Core.OptimisticConcurrency` in [OData-VocCore] and `Capabilities.NavigationRestrictions` (nested property `OptimisticConcurrencyControl`) in [OData-VocCap].
- If optimistic concurrency control is required for a resource, the service MUST include an ETag header in a response to a `GET` request to the resource, and MAY include the ETag in a format-specific manner in responses containing that resource.
- An ETag header in a response does not by itself imply that the resource requires optimistic concurrency control; the ETag may just be used for caching and/or conditional `GET` requests.
- If an ETag value is specified in an `If-Match` or `If-None-Match` header of a Data Modification Request or Action Request, the operation MUST only be invoked if the `If-Match` or `If-None-Match` condition is satisfied.
- If the client does not specify an `If-Match` request header in a Data Modification Request or Action Request on a resource that requires optimistic concurrency control, the service responds with `428 Precondition Required` and MUST ensure that no observable change occurs as a result of the request. Clients can attempt to disable optimistic concurrency control by specifying `If-Match` with a value of `*`. Services MAY reject such requests.
- For requests including an `OData-Version` header value of `4.01`, any ETag values specified in the request body of an update request MUST be `*` or match the current value for the record being updated.

## DateTimeOffset values

Services SHOULD preserve the offset of `Edm.DateTimeOffset` values, if possible. Where the underlying storage does not support offset, services may be forced to normalize the value to some common time zone (that is, UTC), in which case the result is returned with that time zone offset. If the service normalizes values, it MUST fail evaluation of the query functions `year`, `month`, `day`, `hour`, and `time` for literal values that are not stated in the time zone of the normalized values.

## Properties not advertised in metadata

Clients MUST be prepared to receive additional properties in an entity or complex type instance that are not advertised in metadata, even for types not marked as open. By using `PATCH` when updating entities, clients can ensure that such property values are not lost if omitted from the update request.

## Integrity constraints

Services may impose cross-entity integrity constraints. Certain referential constraints, such as requiring an entity to be created with related entities, can be satisfied by creating or linking related entities when creating the entity. Other constraints might require multiple changes to be processed in an all-or-nothing fashion.
