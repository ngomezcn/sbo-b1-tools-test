---
title: Structure of a metadata document (Edmx, Reference, Schema)
source: external OData: oasis-csdl@v4.01-os 4, 2.2, 5, 15.1, 15.3; retrieved 2026-10-02
summary: How a CSDL XML metadata document is structured at the top level, including Edmx, references to external schemas, schema declarations, and naming rules.
---
# Structure of a metadata document (Edmx, Reference, Schema)

In Service Layer: reference/consuming-service-layer/metadata-document.md; reference/consuming-service-layer/semantic-layer-views/service-root-and-metadata.md

## XML namespaces used by CSDL XML

The top-level wrapper and the entity model use different XML namespaces:

- `edmx` prefix conventionally represents the Entity Data Model for Data Services Packaging namespace.
- `edm` prefix conventionally represents the Entity Data Model namespace.
- Prefix names are not prescriptive.

Prior EDMX and EDM namespace URIs from earlier OData/CSDL versions are non-normative for this specification.

## Top-level wrapper: `edmx:Edmx`

The root element of a CSDL XML document is `edmx:Edmx`.

- It MUST contain the `Version` attribute.
- It MUST contain exactly one `edmx:DataServices` element.
- It MAY contain `edmx:Reference` elements.

For the `Version` attribute:

- OData 4.0 responses MUST use `4.0`.
- OData 4.01 responses MUST use `4.01`.
- Services MUST return an OData 4.0 response if the request includes `OData-MaxVersion: 4.0`.

Element `edmx:DataServices` MUST contain one or more `edm:Schema` elements.

## Referencing external CSDL documents

A reference brings part of an external CSDL document into scope.

- A reference MUST specify a URI that uniquely identifies the referenced document.
- Two references MUST NOT specify the same URI.
- The URI SHOULD be a URL that locates the referenced document.
- If the URI is not dereferenceable, it SHOULD identify a well-known schema.
- The URI MAY be absolute or relative.

Element `edmx:Reference`:

- MUST contain attribute `Uri`.
- MUST contain at least one child `edmx:Include` or `edmx:IncludeAnnotations`.
- MAY contain `edm:Annotation` elements.

### Including schemas with `edmx:Include`

Included schemas are selected by namespace.

- The same namespace MUST NOT be included more than once, even if declared in multiple referenced documents.
- `edmx:Include` MUST provide `Namespace`.
- `edmx:Include` MAY provide `Alias`.
- `edmx:Include` MAY contain `edm:Annotation` elements.

Alias rules:

- An alias MAY be used instead of the namespace in qualified names.
- Aliases are document-global.
- All aliases in the document MUST be different.
- Aliases MUST differ from every schema namespace in the document.
- Alias values MUST NOT be `Edm`, `odata`, `System`, or `Transient`.

### Including annotations with `edmx:IncludeAnnotations`

Annotations can be included selectively by term namespace, and optionally by qualifier and target namespace.

- `edmx:IncludeAnnotations` MUST provide `TermNamespace`.
- It MAY provide `Qualifier`.
- It MAY provide `TargetNamespace`.
- If no `edmx:IncludeAnnotations` is specified, a client MAY ignore annotations in the referenced document that are not explicitly used in an `edm:Path` expression of the referencing document.

## Defining schemas with `edm:Schema`

One or more schemas define the entity model exposed by the service.

- Schema namespaces MUST be unique within a document.
- Schema namespaces SHOULD be globally unique.
- A schema cannot span more than one document.
- Type names MUST be unique within a namespace.
- Names are case-sensitive, but authors SHOULD NOT choose names that differ only in case.
- `Namespace` MUST NOT be `Edm`, `odata`, `System`, or `Transient`.

Element `edm:Schema`:

- MUST contain attribute `Namespace`.
- MAY contain attribute `Alias`.
- MAY contain model elements such as `edm:EntityType`, `edm:ComplexType`, `edm:EnumType`, `edm:EntityContainer`, `edm:Action`, `edm:Function`, `edm:Term`, `edm:TypeDefinition`, `edm:Annotations`, and `edm:Annotation`.

Schema alias rules match document alias constraints:

- Alias value MUST be a simple identifier.
- Alias values MUST be unique document-wide and distinct from all namespaces in scope.
- Alias values MUST NOT be `Edm`, `odata`, `System`, or `Transient`.

## Name forms used in metadata

### Namespace

A namespace is a dot-separated sequence of simple identifiers with a maximum length of 511 Unicode code points.

### Qualified name

For direct schema children, a qualified name is:

- schema namespace or alias,
- followed by `.`,
- followed by the model element name.

For built-in primitive types, the qualified name is:

- `Edm.`,
- followed by the primitive type name.
