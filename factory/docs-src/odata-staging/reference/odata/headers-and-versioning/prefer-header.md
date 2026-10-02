---
title: Prefer header and Preference-Applied
source: external OData: oasis-p1@v4.01-os 8.2.8, 8.3.6; retrieved 2026-10-02
summary: Which Prefer values OData defines (return, include-annotations, maxpagesize, continue-on-error, respond-async, wait), what each requires of the service, and what the Preference-Applied response header reports.
---
# Prefer header and Preference-Applied

In Service Layer: reference/consuming-service-layer/crud-operations.md; reference/consuming-service-layer/query-options/pagination.md; reference/sql-query/list-with-paging.md ; SL differs: for a create with no content it uses `Prefer: return-no-content` (answered with `204` and `Preference-Applied: return-no-content`)

## How Prefer works

The `Prefer` header, as defined in [RFC7240], allows clients to request certain behavior from the service. The service MUST ignore preference values that are either not supported or not known by the service.

The value of the `Prefer` header is a comma-separated list of *preferences*. The sections below describe preferences whose meaning in OData is defined by this specification.

In response to a request containing a `Prefer` header, the service MAY return the `Preference-Applied` and `Vary` headers.

OData 4.0 named several of these preferences with an `odata.` prefix (`odata.maxpagesize`, `odata.include-annotations`, `odata.continue-on-error`). Services that support a preference SHOULD also support its `odata.` name for OData 4.0 clients, and clients SHOULD use the `odata.` name for compatibility with OData 4.0 services. If both names are specified in the same request, the value of the name without prefix SHOULD be used (stated for `maxpagesize` and `include-annotations`).

## Preference-Applied

In a response to a request that specifies a `Prefer` header, a service MAY include a `Preference-Applied` header, as defined in [RFC7240], specifying how individual preferences within the request were handled.

The value of the `Preference-Applied` header is a comma-separated list of preferences applied in the response.

If the `Preference-Applied` header is specified on an individual response within a batch, then it specifies the preferences applied to that individual response. If the `Preference-Applied` header is specified on a batch response, then it specifies the preferences applied to the overall batch.

## return=representation and return=minimal

The `return=representation` and `return=minimal` preferences are defined in [RFC7240].

In OData, `return=representation` or `return=minimal` is defined for use with a `POST`, `PUT`, or `PATCH` Data Modification Request, or with an Action Request. Specifying a preference of `return=representation` or `return=minimal` in a `GET` or `DELETE` request does not have any effect.

A preference of `return=minimal` requests that the service invoke the request but does not return content in the response. The service MAY apply this preference by returning `204 No Content` in which case it MAY include a `Preference-Applied` response header containing the `return=minimal` preference.

A preference of `return=representation` requests that the service invokes the request and returns the modified resource. The service MAY apply this preference by returning the representation of the successfully modified resource in the body of the response, formatted according to the rules specified for the requested format. In this case the service MAY include a `Preference-Applied` response header containing the `return=representation` preference.

In a batch, the preference is allowed on an individual Data Modification Request or Action Request, subject to the same restrictions, but SHOULD return a `4xx Client Error` if specified on the batch request itself. The `return` preference SHOULD NOT be applied to a batch request, but MAY be applied to individual requests within a batch.

## include-annotations

The `include-annotations` preference in a request for data or metadata is used to specify the set of annotations the client requests to be included, where applicable, in the response.

The value is a comma-separated list of namespace-qualified term names or term name patterns to include or exclude, with `*` as a wildcard for name segments. Term names and term name patterns can optionally be followed by a hash (`#`) character and an annotation qualifier. The full syntax is defined in [OData-ABNF].

The most specific identifier always takes precedence, with an explicit name taking precedence over a name pattern, and a longer pattern taking precedence over a shorter pattern. If the same identifier value is requested to both be excluded and included the behavior is undefined; the service MAY return or omit the specified vocabulary but MUST NOT raise an exception.

Example 3: a `Prefer` header requesting all annotations within a metadata document to be returned

```text
Prefer: include-annotations="*"
```

Example 4: a `Prefer` header requesting that no annotations are returned

```text
Prefer: include-annotations="-*"
```

Example 5: a `Prefer` header requesting that all annotations defined under the "display" namespace (recursively) be returned

```text
Prefer: include-annotations="display.*"
```

Example 6: a `Prefer` header requesting that the annotation with the term name `subject` within the `display` namespace be returned

```text
Prefer: include-annotations="display.subject"
```

Example 7: a `Prefer` header requesting that all annotations defined under the "display" namespace (recursively) with the qualifier "tablet" be returned

```text
Prefer: include-annotations="display.*#tablet"
```

The `include-annotations` preference is only a hint to the service. The service MAY ignore the preference and is free to decide whether or not to return annotations not specified in the `include-annotations` preference.

If the client has specified the preference, the service SHOULD include a `Preference-Applied` response header containing the `include-annotations` preference to specify the annotations actually included, where applicable, in the response. This value may differ from the annotations requested in the `Prefer` header of the request.

If specified on an individual request within a batch, it applies to that individual request. Individual requests within a batch that don't include it inherit the preference of the overall batch request.

## maxpagesize

The `maxpagesize` preference is used to request that each collection within the response contain no more than the number of items specified as the positive integer value of this preference. The syntax is defined in [OData-ABNF].

Example 8: a request for customers and their orders would result in a response containing one collection with customer entities and for every customer a separate collection with order entities. The client could specify `maxpagesize=50` in order to request that each page of results contain a maximum of 50 customers, each with a maximum of 50 orders.

If a collection within the result contains more than the specified `maxpagesize`, the collection SHOULD be a partial set of the results with a next link to the next page of results. The client MAY specify a different value for this preference with every request following a next link.

In the example given above, the result page should include a next link for the customer collection, if there are more than 50 customers, and additional next links for all returned orders collections with more than 50 entities.

If the client has specified the `maxpagesize` preference in the request, and the service limits the number of items in collections within the response through server-driven paging, the service MAY include a `Preference-Applied` response header containing the `maxpagesize` preference and the maximum page size applied. This value may differ from the value requested by the client.

The `maxpagesize` preference SHOULD NOT be applied to a batch request, but MAY be applied to individual requests within a batch.

## continue-on-error

The `continue-on-error` preference on a batch request is used to request whether, upon encountering a request within the batch that returns an error, the service return the error for that request and continue processing additional requests within the batch (if specified with an implicit or explicit value of `true`), or rather stop further processing (if specified with an explicit value of `false`). The syntax is defined in [OData-ABNF].

The preference can also be used on a delta update, set-based update, or set-based delete to request that the service continue attempting to process changes after receiving an error.

A service MAY specify support for the preference using an annotation with term `Capabilities.BatchContinueOnErrorSupported`, see [OData-VocCap].

The `continue-on-error` preference SHOULD NOT be applied to individual requests within a batch.

## respond-async

The `respond-async` preference, as defined in [RFC7240], allows clients to request that the service process the request asynchronously.

If the client has specified `respond-async` in the request, the service MAY process the request asynchronously and return a `202 Accepted` response.

The preference MAY be used for batch requests, in which case it applies to the batch request as a whole and not to individual requests within the batch request.

In the case that the service applies the preference it MUST include a `Preference-Applied` response header containing the `respond-async` preference.

A service MAY specify the support for the preference using an annotation with term `Capabilities.AsynchronousRequestsSupported`, see [OData-VocCap].

## wait

The `wait` preference, as defined in [RFC7240], is used to establish an upper bound on the length of time, in seconds, the client is prepared to wait for the service to process the request synchronously once it has been received.

If the `respond-async` preference is also specified, the client requests that the service respond asynchronously after the specified length of time.

If the `respond-async` preference has not been specified, the service MAY interpret the `wait` as a request to timeout after the specified period of time.

If the `wait` preference is specified on an individual request within a batch, then it specifies the maximum amount of time to wait for that individual request. If the `wait` preference is specified on a batch, then it specifies the maximum time to wait for the entire batch.

Example 9: a service receiving the following header might choose to respond

- asynchronously if the synchronous processing of the request will take longer than 10 seconds
- synchronously after 5 seconds
- asynchronously (ignoring the `wait` preference)
- synchronously after 15 seconds (ignoring `respond-`async preference and the `wait` preference)

```text
Prefer: respond-async, wait=10
```
