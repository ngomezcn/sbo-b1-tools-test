---
title: JSON control information in responses
source: external OData: oasis-json@v4.01-os 4.5.1, 4.5, 4.5.3, 4.5.8, 4.5.9, 4.5.10, 4.5.11 + oasis-json@v4.01-os 3.1; retrieved 2026-10-02
summary: Which `@` name/value pairs (context, type, id, editLink, readLink, etag, navigationLink, associationLink) appear in JSON payloads, and how the `metadata` Accept parameter chooses minimal, full, or none.
---
# JSON control information in responses

In Service Layer: reference/consuming-service-layer/overview-key-elements.md; reference/etag/etag-entities-and-metadata.md; reference/limitations/limitations.md ; SL differs: metadata option `odata.metadata=full` for OData version 4 is not supported

- [Control information names](#control-information-names)
- [context](#context)
- [type](#type)
- [id](#id)
- [editLink and readLink](#editlink-and-readlink)
- [etag](#etag)
- [navigationLink and associationLink](#navigationlink-and-associationlink)
- [Amount of control information](#amount-of-control-information)

## Control information names

In addition to the pure data, a message body MAY contain annotations and control information as name/value pairs whose names start with `@`.

In requests and responses with an `OData-Version` header of `4.0`, control information names are prefixed with `@odata.`, for example `@odata.context`. Without such a header the `odata.` infix SHOULD be omitted, for example `@context`.

In some cases control information is required in request payloads; the subsections below call that out.

Receivers that encounter unknown annotations in any namespace or unknown control information MUST NOT stop processing and MUST NOT signal an error.

## context

The `context` control information returns the context URL (see [OData-Protocol]) for the payload. The URL can be absolute or relative.

The `context` control information is not returned if `metadata=none` is requested. Otherwise it MUST be the first property of any JSON response.

The `context` control information MUST also be included in requests and responses for entities whose entity set cannot be determined from the context URL of the collection.

For more information on the format of the context URL, see [OData-Protocol].

Request payloads MAY include a context URL as a base URL for relative URLs in the request payload.

Example 4:

```json
{
  "@context": "http://host/service/$metadata#Customers/$entity",
  "@metadataEtag": "W/\"A1FF3E230954908F\"",
  ...
}
```

## type

The `type` control information specifies the type of a JSON object or name/value pair. Its value is a URI that identifies the type of the property or object.

- For built-in primitive types the value is the unqualified name of the primitive type. For payloads described by an `OData-Version` header of `4.0`, this name MUST be prefixed with `#`; for non-OData 4.0 payloads, built-in primitive type values SHOULD be represented without `#`, but consumers of 4.01 or greater payloads MUST support values with or without `#`.
- For all other types, the URI may be absolute or relative to the `type` of the containing object. The root `type` may be absolute or relative to the root context URL.
- If the URI references a metadata document (not just a fragment), it MAY refer to a specific version of that metadata document using the `$schemaversion` system query option defined in [OData-Protocol].
- For non-built in primitive types, the URI contains the namespace-qualified or alias-qualified type as a URI fragment. For collection-valued properties, the fragment is the namespace-qualified or alias-qualified element type enclosed in parentheses and prefixed with `Collection`. The namespace or alias MUST be defined or the namespace referenced in the metadata document of the service, see [OData-CSDLJSON] or [OData-CSDLXML].

The `type` control information MUST appear in requests and in responses with minimal or full metadata, if the type cannot be heuristically determined, as described below, and one of the following is true:

- The type is derived from the type specified for the (collection of) entities or (collection of) complex type instances, or
- The type is for a property whose type is not declared in `$metadata`.

Heuristics for the primitive type of a dynamic property when `type` is absent:

- Boolean values have a first-class representation in JSON and do not need additional control information.
- Numeric values have a first-class representation in JSON but are not further distinguished, so they include a `type` control information unless their type is `Double`.
- The special floating-point values `-INF`, `INF`, and `NaN` are serialized as strings and MUST have a `type` control information to specify the numeric type of the property.
- String values have a first-class representation in JSON, but OData also encodes other primitive types as strings (for example `DateTimeOffset`, or `Int64` with the `IEEE754Compatible` format parameter). A property in JSON string format should be treated as a string value unless the metadata document says otherwise.

For more information on namespace- and alias-qualified names, see [OData-CSDLJSON] or [OData-CSDLXML].

Example 5: entity of type `Model.VipCustomer` defined in the metadata document of the same service with a dynamic property of type `Edm.Date`

```json
{
  "@context": "http://host/service/$metadata#Customers/$entity",
  "@type": "#Model.VipCustomer",
  "ID": 2,
  "DynamicValue@type": "Date",
  "DynamicValue": "2016-09-22",
  ...
}
```

Example 6: entity of type `Model.VipCustomer` defined in the metadata document of a different service

```json
{
  "@context": "http://host/service/$metadata#Customers/$entity",
  "@type": "http://host/alternate/$metadata#Model.VipCustomer",
  "ID": 2,
  ...
}
```

## id

The `id` control information contains the entity-id, see [OData-Protocol]. By convention the entity-id is identical to the canonical URL of the entity, as defined in [OData-URL].

The `id` control information MUST appear in responses if `metadata=full` is requested, or if `metadata=minimal` is requested and any of a non-transient entity's key fields are omitted from the response *or* the entity-id is not identical to the canonical URL of the entity after

- IRI-to-URI conversion as defined in [RFC3987],
- relative resolution as defined in section 5.2 of [RFC3986], and
- percent-encoding normalization as defined in section 6 of [RFC3986].

The entity-id MUST be invariant across languages, so if key values are language dependent then the `id` MUST be included if it does not match convention for the localized key values. If the `id` is represented, it MAY be a relative URL.

If the entity is transient (cannot be read or updated), the `id` control information MUST appear in OData 4.0 payloads and have the `null` value. In 4.01 payloads transient entities need not have the `id` control information, and 4.01 clients MUST treat entities with neither `id` control information nor a full set of key properties as transient entities.

The `id` control information MUST NOT appear for a collection. Its meaning in this context is reserved for future versions of this specification.

Entities with `id` equal to `null` cannot be compared to other entities, reread, or updated. If `metadata=minimal` is specified and the `id` is not present in the entity, then the canonical URL MUST be used as the entity-id.

## editLink and readLink

The `editLink` control information contains the edit URL of the entity; see [OData-Protocol].

The `readLink` control information contains the read URL of the entity or collection; see [OData-Protocol].

The `editLink` and `readLink` control information is ignored in request payloads and not written in responses if `metadata=none` is requested.

The default value of both the edit URL and read URL is the entity's entity-id appended with a cast segment to the type of the entity if its type is derived from the declared type of the entity set. If neither the `editLink` nor the `readLink` control information is present in an entity, the client uses this default value for the edit URL.

For updatable entities:

- The `editLink` control information is written if `metadata=full` is requested or if `metadata=minimal` is requested and the edit URL differs from the default value of the edit URL.
- The `readLink` control information is written if the read URL is different from the edit URL. If no `readLink` control information is present, the read URL is identical to the edit URL.

For read-only entities:

- The `readLink` control information is written if `metadata=full` is requested or if `metadata=minimal` is requested and its value differs from the default value of the read URL.
- The `readLink` control information may also be written if `metadata=minimal` is specified in order to signal that an individual entity is read-only.

For collections:

- The `readLink` control information, if written, MUST be the request URL that produced the collection.
- The `editLink` control information MUST NOT be written as its meaning in this context is reserved for future versions of this specification.

## etag

The `etag` control information MAY be applied to an entity or collection in a response. Its value is an entity tag (ETag), an opaque string that can be used in a subsequent request to determine if the value of the entity or collection has changed.

For details on how ETags are used, see [OData-Protocol].

The `etag` control information is ignored in request payloads for single entities and not written in responses if `metadata=none` is requested.

## navigationLink and associationLink

The `navigationLink` control information in a response contains a navigation URL that can be used to retrieve an entity or collection of entities related to the current entity via a navigation property.

The default computed value of a navigation URL is the value of the read URL appended with a segment containing the name of the navigation property. The service MAY omit the `navigationLink` control information if `metadata=minimal` has been specified on the request and the navigation link matches this computed value.

The `associationLink` control information in a response contains an association URL that can be used to retrieve a reference to an entity or a collection of references to entities related to the current entity via a navigation property.

The default computed value of an association URL is the value of the navigation URL appended with `/$ref`. The service MAY omit the `associationLink` control information if the association link matches this computed value.

The `navigationLink` and `associationLink` control information is ignored in request payloads and not written in responses if `metadata=none` is requested.

## Amount of control information

The amount of control information in the payload depends on the client. The `metadata` parameter can be applied to the `Accept` header of an OData request to influence how much control information is included in the response.

Other `Accept` header parameters (for example `streaming`) are orthogonal to `metadata` and are not covered here.

- If a client prefers a very small wire size and can compute data using metadata expressions, the `Accept` header should include `metadata=minimal`.
- If computation is more critical than wire size or the client cannot compute control information, `metadata=full` directs the service to inline the control information that would normally be computed from metadata.
- `metadata=none` is an option for clients that have out-of-band knowledge or do not require control information.

In addition, the client may use the `include-annotations` preference in the `Prefer` header to request additional control information. Services supporting this MUST NOT omit control information required by the chosen `metadata` parameter, and services MUST NOT exclude the `nextLink`, `deltaLink`, and `count` if they are required by the response type.

If the client includes the `OData-MaxVersion` header in a request and does not specify the `metadata` format parameter in either the `Accept` header or `$format` query option, the service MUST return at least the minimal control information.

In OData 4.0 the `metadata` format parameter was prefixed with `odata.`. Payloads with an `OData-Version` header equal to `4.0` MUST include the `odata.` prefix. Payloads with an `OData-Version` header equal to `4.01` or greater SHOULD NOT include the `odata.` prefix.

### metadata=minimal

The `metadata=minimal` format parameter indicates that the service SHOULD remove computable control information from the payload wherever possible. The response payload MUST contain at least the following control information:

- `context`: the root context URL of the payload and the context URL for any deleted entries or added or deleted links in a delta response, or for entities or entity collections whose set cannot be determined from the root context URL
- `etag`: the ETag of the entity or collection, as appropriate
- `count`: the total count of a collection of entities or collection of entity references, if requested
- `nextLink`: the next link of a collection with partial results
- `deltaLink`: the delta link for obtaining changes to the result, if requested

In addition, control information MUST appear in the payload for cases where actual values are not the same as the computed values and MAY appear otherwise. When control information appears in the payload, it is treated as exceptions to the computed values.

### metadata=full

The `metadata=full` format parameter indicates that the service MUST include all control information explicitly in the payload.

The full list of control information that may appear in a `metadata=full` response is as follows:

- `context`: the context URL for a collection, entity, primitive value, or service document
- `count`: the total count of a collection of entities or collection of entity references, if requested
- `nextLink`: the next link of a collection with partial results
- `deltaLink`: the delta link for obtaining changes to the result, if requested
- `id`: the ID of the entity
- `etag`: the ETag of the entity or collection, as appropriate
- `readLink`: the link used to read the entity, if the edit link cannot be used to read the entity
- `editLink`: the link used to edit/update the entity, if the entity is updatable and the `id` does not represent a URL that can be used to edit the entity
- `navigationLink`: the link used to retrieve the values of a navigation property
- `associationLink`: the link used to describe the relationship between this entity and related entities
- `type`: the type of the containing object or targeted property if the type of the object or targeted property cannot be heuristically determined from the data value, see Control Information: type (odata.type)

### metadata=none

The `metadata=none` format parameter indicates that the service SHOULD omit control information other than `nextLink` and `count`. This control information MUST continue to be included, as applicable, even in the `metadata=none` case.

It is not valid to specify `metadata=none` on a delta request.
