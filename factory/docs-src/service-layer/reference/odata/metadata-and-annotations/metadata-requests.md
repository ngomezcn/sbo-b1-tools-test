---
title: Service document and metadata document requests
source: external OData: oasis-p1@v4.01-os 11.1 + oasis-csdl@v4.01-os 2.1; retrieved 2026-10-02
summary: How to request the service document and the metadata document of an OData service, which format is returned by default, and how to ask for the XML representation.
---
# Service document and metadata document requests

In Service Layer: reference/consuming-service-layer/metadata-document.md ; SL differs: `$metadata` is always returned as XML (verified on a live SL 10.0, v1 and v2) and a JSON representation cannot be requested: `Accept: application/json`, `$format=json` and `$format=application/json` are ignored and the response is `200` with `Content-Type: application/xml`, so parse the CSDL XML

An OData service is a self-describing service that exposes metadata defining the entity sets, singletons, relationships, entity types, and operations.

## Service Document Request

Service documents enable simple hypermedia-driven clients to enumerate and explore the resources offered by the data service.

OData services MUST support returning a service document from the root URL of the service (the *service root*).

The format of the service document is dependent upon the format selected.

## Metadata Document Request

An OData *metadata document* is a representation of the data model that describes the data and operations exposed by an OData service.

[OData-CSDLJSON] describes a JSON representation for OData metadata documents and provides a JSON schema to validate their contents. The media type of the JSON representation of an OData metadata document is `application/json`.

[OData-CSDLXML] describes an XML representation for OData metadata documents and provides an XML schema to validate their contents. The media type of the XML representation of an OData metadata document is `application/xml`.

OData services can expose a metadata document that describes the data model exposed by the service. The *metadata document URL* MUST be the root URL of the service with `$metadata` appended. To retrieve this document the client issues a `GET` request to the metadata document URL.

If a request for metadata does not specify a format preference (via `Accept` header or `$format`) then the XML representation MUST be returned.

## Requesting the XML Representation

The OData CSDL XML representation can be requested using the `$format` query option in the request URL with the media type `application/xml`, optionally followed by media type parameters, or the case-insensitive abbreviation `xml` which MUST NOT be followed by media type parameters.

Alternatively, this representation can be requested using the `Accept` header with the media type `application/xml`, optionally followed by media type parameters.

If specified, `$format` overrides any value specified in the `Accept` header.

The response MUST contain the `Content-Type` header with a value of `application/xml`, optionally followed by media type parameters.

This specification does not define additional parameters for the media type `application/xml`.
