---
title: ETag and concurrency
source: external OData: oasis-p1@v4.01-os 8.3.2, 8.2.4, 8.2.5; retrieved 2026-10-02
summary: What the OData protocol says about the ETag response header and the If-Match and If-None-Match request headers, including weak versus strong ETags, 412, 428, 304, upsert and batch rules.
---
# ETag and concurrency

In Service Layer: reference/etag/etag-guide.md; reference/etag/etag-usage.md ; SL differs: ETags are weak validators `W/"..."`, a `GET` with `If-None-Match` returns 200 with the full body instead of 304, `If-Match` on an inner `$batch` request is ignored, only `If-Match` values starting with `W/` are validated (a strong, unquoted or malformed value is ignored and the write goes through, so the 412 rules below do not hold for them), an ETag from another entity with the same `DataVersion` is accepted, and `If-None-Match` on a `PATCH` is ignored instead of giving 412 (see reference/etag/etag-guide.md)

## ETag response header

- A response MAY include an `ETag` header. Services MUST include it if they require an ETag to be specified when modifying the resource.
- Services MUST support the value returned in `ETag` in an `If-None-Match` header of a subsequent Data Request for the resource.
- Clients MUST send the value returned in `ETag`, or star (`*`), in an `If-Match` header of a subsequent Data Modification Request or Action Request to apply optimistic concurrency control when updating, deleting, or invoking an action bound to the resource.

### Weak and strong ETags

- OData allows multiple formats for the same structured information, so services SHOULD use weak ETags that depend only on the representation-independent entity state.
- A strong ETag MUST change whenever the representation of an entity changes, so it has to depend on `Content-Type`, `Content-Encoding`, and potentially other characteristics of the response.

### Metadata and service documents

An `ETag` header MAY also be returned on a metadata document request or service document request, so the client can make a conditional request for it later. Clients can compare the `ETag` of a metadata document request with the metadata ETag returned in a response to verify the version of the metadata used to generate that response.

### Batch responses

The `ETag` header SHOULD NOT be included for the overall batch response, but MAY be included in individual responses within a batch.

## If-Match request header

- A client MAY include `If-Match` in a request to `GET`, `POST`, `PUT`, `PATCH` or `DELETE`.
- The value MUST be an ETag value previously retrieved for the resource, or `*` to match any value.
- If present, the request MUST only be processed if the specified ETag matches the current ETag of the target resource.
- Services sending weak ETags that depend only on the representation-independent entity state MUST use the weak comparison function, because it is sufficient to prevent accidental overwrites. This is a deviation from RFC 7232.

### 428 Precondition Required

If an operation on an existing resource requires an ETag (term `Core.OptimisticConcurrency`, and property `OptimisticConcurrencyControl` of type `Capabilities.NavigationPropertyRestriction`) and the client sends no `If-Match` header in a Data Modification Request or in an Action Request invoking an action bound to the resource, the service responds with `428 Precondition Required` and MUST ensure that no observable change occurs as a result of the request.

### 412 Precondition Failed

If the value does not match the current ETag of the resource for a Data Modification Request or Action Request, the service MUST respond with `412 Precondition Failed` and MUST ensure that no observable change occurs. In the case of an upsert, if the addressed entity does not exist the provided ETag value is considered not to match.

### Upsert with `*`

An `If-Match` header with a value of `*` in a `PUT` or `PATCH` request results in an upsert request being processed as an update and not an insert.

### Batch

`If-Match` MUST NOT be specified on a batch request, but MAY be specified on individual requests within the batch.

## If-None-Match request header

- A client MAY include `If-None-Match` in a request to `GET`, `POST`, `PUT`, `PATCH` or `DELETE`.
- The value MUST be an ETag value previously retrieved for the resource, or `*`.
- If present, the request MUST only be processed if the specified ETag does not match the current ETag of the resource, using the weak comparison function.
- If the value matches the current ETag: for a `GET` request, the service SHOULD respond with `304 Not Modified`; for a Data Modification Request or Action Request, the service MUST respond with `412 Precondition Failed` and MUST ensure that no observable change occurs.
- An `If-None-Match` header with a value of `*` in a `PUT` or `PATCH` request results in an upsert request being processed as an insert and not an update.
- `If-None-Match` MUST NOT be specified on a batch request, but MAY be specified on individual requests within the batch.
