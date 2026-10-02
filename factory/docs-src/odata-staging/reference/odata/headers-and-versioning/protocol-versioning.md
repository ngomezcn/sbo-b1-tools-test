---
title: "Protocol versioning: OData-Version and OData-MaxVersion"
source: external OData: oasis-p1@v4.01-os 5.1, 8.1.5, 8.2.7; retrieved 2026-10-02
summary: How OData-Version and OData-MaxVersion negotiate the protocol version in requests and responses, defaults when they are absent, and batch inheritance.
---
# Protocol versioning: OData-Version and OData-MaxVersion

In Service Layer: reference/consuming-service-layer/semantic-layer-views/deployment-and-scope.md; reference/consuming-service-layer/batch-operations.md

## Overview

- OData requests and responses are versioned according to the `OData-Version` header.
- Clients include `OData-MaxVersion` in requests to specify the maximum acceptable response version. Services respond with the maximum supported version that is less than or equal to the requested `OData-MaxVersion`, using decimal comparison.
- The syntax of both headers is defined in OData-ABNF.
- Services SHOULD advertise supported versions through the `Core.ODataVersions` term.
- This version of the specification defines the OData version values `4.0` and `4.01`. Content that applies to only one of them is explicitly called out in the text.

## OData-Version header

- Clients SHOULD send `OData-Version` on a request to specify the protocol version used to generate the request payload.
- If present on a request, the service MUST interpret the payload according to the rules of that version or fail the request with a `4xx` response code.
- If not specified on a request, the service MUST assume the payload was generated using the minimum of `OData-MaxVersion` (if specified) and the maximum protocol version the service understands.
- Services MUST include `OData-Version` on a response to specify the protocol version used to generate the response payload. The client MUST interpret the response payload according to the rules of that version.
- Request and response payloads are independent and may have different `OData-Version` headers according to these rules.
- For more details, see Versioning.

## OData-MaxVersion header

- Clients SHOULD specify an `OData-MaxVersion` request header.
- If specified, the service MUST generate a response with the greatest supported `OData-Version` less than or equal to the specified `OData-MaxVersion`.
- If not specified, the service SHOULD return responses with the same OData version over time and interpret the request as having an `OData-MaxVersion` equal to the maximum OData version the service supported at its initial publication.
- For more details, see Versioning.

## Batch requests

- If `OData-Version` is specified on an individual request or response within a batch, it specifies the OData version for that individual request or response. Individual requests or responses without it inherit the version of the overall batch request or response. This version does not typically vary within a batch.
- If `OData-MaxVersion` is specified on an individual request within a batch, it specifies the maximum OData version for that individual request. Individual requests without it inherit the maximum version of the overall batch request or response. The maximum version does not typically vary within a batch.
