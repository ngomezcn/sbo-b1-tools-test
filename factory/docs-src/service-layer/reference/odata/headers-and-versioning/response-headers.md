---
title: Location, OData-EntityId and Retry-After
source: external OData: oasis-p1@v4.01-os 8.3.3, 8.3.4, 8.3.7; retrieved 2026-10-02
summary: Which response headers carry the URL of a created entity or async status resource (Location), the entity-id after a 204 create or upsert (OData-EntityId), and how long to wait before retrying (Retry-After).
---
# Location, OData-EntityId and Retry-After

In Service Layer: reference/consuming-service-layer/crud-operations.md

## Location

The `Location` header MUST be returned in the response from a Create Entity or Create Media Entity request to specify the edit URL, or for read-only entities the read URL, of the created entity, and in responses returning `202 Accepted` to specify the URL that the client can use to request the status of an asynchronous request.

The `Location` header SHOULD NOT be included for the overall batch response, but MAY be included in individual responses within a batch.

## OData-EntityId

A response to a create or upsert operation that returns `204 No Content` MUST include an `OData-EntityId` response header. The value of the header is the entity-id of the entity that was acted on by the request. The syntax of the `OData-EntityId` header is defined in [OData-ABNF].

The `OData-EntityID` header SHOULD NOT be included for the overall batch response, but MAY be included in individual responses within a batch.

## Retry-After

A service MAY include a `Retry-After` header, as defined in [RFC7231], in `202 Accepted` and in `3xx Redirect` responses

The `Retry-After` header specifies the duration of time, in seconds, that the client is asked to wait before retrying the request or issuing a request to the resource returned as the value of the `Location` header.
