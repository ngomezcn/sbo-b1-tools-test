---
title: HTTP status codes
source: external OData: oasis-p1@v4.01-os 9.1, 9.2, 9.3, 9; retrieved 2026-10-02
summary: What the common OData success, client error and server error HTTP status codes mean (200, 201, 202, 204, 3xx, 304, 404, 405, 406, 410, 412, 424, 501) and which headers, bodies and guarantees go with each.
---
# HTTP status codes

In Service Layer: reference/etag/etag-guide.md; reference/consuming-service-layer/crud-operations.md; reference/consuming-service-layer/batch-operations.md

An OData service MAY respond to any request using any valid HTTP status code appropriate for the request. A service SHOULD be as specific as possible in its choice of HTTP status codes.

The following represent the most common success response codes. In some cases, a service MAY respond with a more specific success code.

## Success Responses

The following response codes represent successful requests.

### Response Code 200 OK

A request that does not create a resource returns `200 OK` if it is completed successfully and the value of the resource is not `null`. In this case, the response body MUST contain the value of the resource specified in the request URL.

### Response Code 201 Created

A Create Entity, Create Media Entity, or Invoke Action request that successfully creates a resource returns `201 Created`. In this case, the response body MUST contain the resource created.

### Response Code 202 Accepted

`202 Accepted` indicates that the Data Service Request has been accepted and has not yet completed executing asynchronously. The asynchronous handling of requests is defined in the sections on Asynchronous Requests and Asynchronous Batch Requests..

### Response Code 204 No Content

A request returns `204 No Content` if the requested resource has the `null` value, or if the service applies a `return=minimal` preference. In this case, the response body MUST be empty.

As defined in [RFC7231], a Data Modification Request that responds with `204 No Content` MAY include an `ETag` header with a value reflecting the result of the data modification if and only if the client can reasonably "know" the new representation of the resource without actually receiving it. For a `PUT` request this means that the response body of a corresponding `200 OK` or `201 Created` response would have been identical to the request body, i.e. no server-side modification of values sent in the request body, no server-calculated values etc. For a `PATCH` request this means that the response body of a corresponding `200 OK` or `201 Created` response would have consisted of all values sent in the request body, plus (for values not sent in the request body) server-side values corresponding to the `ETag` value sent in the `If-Match` header of the `PATCH` request, i.e. the previous values "known" to the client.

### Response Code 3xx Redirection

As per [RFC7231], a `3xx Redirection` indicates that further action needs to be taken by the client in order to fulfill the request. In this case, the response SHOULD include a `Location` header, as appropriate, with the URL from which the result can be obtained; it MAY include a `Retry-After` header.

### Response Code 304 Not Modified

As per [RFC7232], a `304 Not Modified` is returned when the client performs a `GET` request containing an `If-None-Match` header and the content has not changed. In this case the response SHOULD NOT include other headers in order to prevent inconsistencies between cached entity-bodies and updated headers.

The service MUST ensure that no observable change has occurred to the state of the service as a result of any request that returns a `304 Not Modified`.

## Client Error Responses

Error codes in the `4xx` range indicate a client error, such as a malformed request.

The service MUST ensure that no observable change has occurred to the state of the service as a result of any request that returns an error status code.

In the case that a response body is defined for the error code, the body of the error is as defined for the appropriate format.

### Response Code 404 Not Found

`404 Not Found` indicates that the resource specified by the request URL does not exist. The response body MAY provide additional information.

### Response Code 405 Method Not Allowed

`405 Method Not Allowed` indicates that the resource specified by the request URL does not support the request method. In this case the response MUST include an `Allow` header containing a list of valid request methods for the requested resource as defined in [RFC7231].

### Response Code 406 Not Acceptable

`406 Not Acceptable` indicates that the resource specified by the request URL does not have a current representation that would be acceptable for the client according to the request headers `Accept`, `Accept-Charset`, and `Accept-Language`, and that the service is unwilling to supply a default representation.

### Response Code 410 Gone

`410 Gone` indicates that the requested resource is no longer available. This can happen if a client has waited too long to follow a delta link or a status-monitor-resource link, or a next link on a collection that was requested with snapshot isolation.

### Response Code 412 Precondition Failed

As defined in [RFC7232], `412 Precondition Failed` indicates that the client has performed a conditional request and the resource fails the condition. The service MUST ensure that no observable change occurs as a result of the request.

### Response Code 424 Failed Dependency

`424 Failed Dependency` indicates that a request was not performed due to a failed dependency; for example, a request within a batch that depended upon a request that failed.

## Server Error Responses

As defined in [RFC7231], error codes in the `5xx` range indicate service errors.

### Response Code 501 Not Implemented

If the client requests functionality not implemented by the OData Service, the service responds with `501 Not Implemented` and SHOULD include a response body describing the functionality not implemented.
