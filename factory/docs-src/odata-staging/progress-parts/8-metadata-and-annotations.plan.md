## Plan: metadata-and-annotations

Approved: pending (supervisor to record)

Scope note: the goal is "what a developer sees when reading Service Layer's `$metadata`", so only the read side of CSDL XML is in. Parent chapters `oasis-csdl-2`, `3`, `13`, `14`, `15` are not listed; their children are decided one by one (`14` is 1299 lines). The own text of those parents is intro only and is dropped. `oasis-csdl-4`, `5`, `6`, `7`, `8`, `9`, `10`, `11` are listed whole (a listed fragment covers its descendants).

### Fragment decisions

| fragment | decision | where / reason |
|---|---|---|
| oasis-p1-11.1 | include | metadata-and-annotations/metadata-requests.md. Gate A: SL's metadata-document hoja shows `GET /$metadata` but not the root-URL rule, the XML default when no format is given, or the JSON/XML media types. Question: "which format do I get from `$metadata` without Accept?" Covers 11.1.1 and 11.1.2. |
| oasis-csdl-2.1 | merge | metadata-requests.md. Gate B: "how do I ask for the XML metadata (`$format`, `Accept`) and what Content-Type comes back?" |
| oasis-csdl-2.2 | merge | metadata-document-structure.md. Gate B: "what are the `edmx` and default `edm` namespaces I see in `$metadata`?" (SL hoja shows them in examples without explanation). Covers 2.2.1, 2.2.2. |
| oasis-csdl-2.3 | exclude | XML schema files for validating a document; authoring and tooling. |
| oasis-csdl-2.4 | exclude | document order rules for authors. |
| oasis-csdl-3.1 | exclude | one-paragraph introduction to nominal types; no lookup value. |
| oasis-csdl-3.2 | exclude | one-paragraph introduction to structured types; covered by the type hojas. |
| oasis-csdl-3.3 | include | metadata-and-annotations/edm-primitive-types.md. Gate A (1 of 12 terms in SL, no SL hoja lists the primitive types). Question: "what does `Edm.Decimal` or `Edm.DateTimeOffset` in `$metadata` mean?" |
| oasis-csdl-3.4 | exclude | abstract types (`Edm.PrimitiveType`, `Edm.ComplexType`...) used in vocabulary terms and model rules, not seen in a service's entity model. |
| oasis-csdl-3.5 | exclude | built-in types for defining vocabulary terms; authoring. |
| oasis-csdl-3.6 | merge | annotations.md. Gate B: "can the same term be applied twice to one element?" (term plus qualifier uniqueness rule). |
| oasis-csdl-4 | include | metadata-and-annotations/metadata-document-structure.md (base). Gate A: `edmx:Edmx`, `DataServices`, `Reference` and `Include` appear in every `$metadata` and in SL's annotation example (`edmx:Reference`), and no SL hoja explains them. Covers 4.1, 4.2, 4.3. |
| oasis-csdl-5 | merge | metadata-document-structure.md. Gate B: "what are `Schema Namespace="SAPB1"` and `Alias`?" Covers 5.1 Alias and 5.2 external targeting (`Annotations Target=`), which readers of annotated metadata meet. |
| oasis-csdl-15.1 | merge | metadata-document-structure.md (namespace rules, 3 lines). |
| oasis-csdl-15.2 | exclude | identifier syntax for authors. |
| oasis-csdl-15.3 | merge | metadata-document-structure.md. Gate B: "how are `SAPB1.Document` / `Edm.String` qualified names built?" |
| oasis-csdl-15.4 | merge | annotations.md. Gate B: "what does the `Target` of an annotation point to?" |
| oasis-csdl-6 | include | metadata-and-annotations/entity-types-and-keys.md. Gate B: "how do I read an `EntityType`, its `Key`/`PropertyRef`, `BaseType`, `Abstract`, `OpenType`, `HasStream`?" SL shows `EntityType` with `Key` but explains none of the attributes. Covers 6.1-6.5. |
| oasis-csdl-7 | include | metadata-and-annotations/properties-and-facets.md. Gate B: "what do `Nullable`, `MaxLength`, `Precision`, `Scale`, `Unicode`, `SRID`, `DefaultValue` mean on a `Property`?" Covers 7.1, 7.2.x. |
| oasis-csdl-8 | include | metadata-and-annotations/navigation-properties.md. Gate B: "what do `NavigationProperty` `Type`, `Partner`, `ContainsTarget`, `ReferentialConstraint`, `OnDelete` mean?" (SL `associations` covers using `$expand`, not the metadata declaration). Covers 8.1-8.6. |
| oasis-csdl-9 | include | metadata-and-annotations/complex-enum-and-type-definitions.md (base). Gate B: "what is a `ComplexType` such as `DocumentLine` vs an `EntityType`?" Covers 9.1-9.3. |
| oasis-csdl-10 | merge | complex-enum-and-type-definitions.md. Gate B: "how do I read an `EnumType` (`Member Name/Value`, `IsFlags`, `UnderlyingType`)?" SL shows `BoCardTypes` without explaining it. Covers 10.1-10.3. |
| oasis-csdl-11 | merge | complex-enum-and-type-definitions.md. Gate B: "what is a `TypeDefinition` in `$metadata`?" Covers 11.1. |
| oasis-csdl-12 | exclude | defining actions and functions (authoring); SL explains actions in `consuming-service-layer/actions.md`. Covers 12.1-12.9. |
| oasis-csdl-13.1 | exclude | extending an entity container; authoring. |
| oasis-csdl-13.2 | include | metadata-and-annotations/entity-container.md (base). Gate B: "how do I find the entity sets in `$metadata` and what does `EntitySet EntityType=` mean?" (SL hoja shows `EntitySet` only in an example). |
| oasis-csdl-13.3 | merge | entity-container.md. Gate B: "what is a `Singleton` in `$metadata`?" |
| oasis-csdl-13.4 | merge | entity-container.md. Gate B: "what is `NavigationPropertyBinding`?" Covers 13.4.1, 13.4.2. |
| oasis-csdl-13.5 | exclude | action import; defining actions is out of scope and SL covers calling them. |
| oasis-csdl-13.6 | exclude | function import; same reason. |
| oasis-csdl-14.1 | include | metadata-and-annotations/terms-and-vocabularies.md. Gate B: "what is the `Term` definition (`SAPB1.TableName`, `AppliesTo`, `Type`) that an annotation refers to?" SL shows `Term ... AppliesTo=` without explanation. Covers 14.1.1 and 14.1.2. |
| oasis-csdl-14.2 | include | metadata-and-annotations/annotations.md (base). Gate A: `Annotation` is in SL metadata (ETag `OptimisticConcurrency`, `Common.Label`) but no SL hoja defines the element, `Qualifier` or `Target`. Covers 14.2.1, 14.2.2. |
| oasis-p1-3.1 | merge | annotations.md, role `second`: adds the protocol-level definition (term, target, value; vocabulary). |
| oasis-csdl-14.3 | exclude | constant expression syntax per primitive type (12 near-identical subsections); authoring. The `String=` shorthand is visible in the 14.2 examples. |
| oasis-csdl-14.4 | exclude | dynamic expressions (path, operators, `Apply`, `Cast`, `Record`...); authoring of annotation values, 764 lines. |
| oasis-csdl-16 | exclude | complete example documents; hojas take examples from the element fragments. The only `OptimisticConcurrency` mention in CSDL is inside 16.1; CSDL does not define the term and SL's etag hojas cover it. |
| oasis-csdl-17 | exclude | conformance levels. |

Fragments decided: 37 (10 include, 12 merge, 15 exclude).

### Hojas

| hoja | title | fragments | mode | unit | SL candidates |
|---|---|---|---|---|---|
| metadata-and-annotations/metadata-requests.md | Service document and metadata document requests | oasis-p1-11.1 (base), oasis-csdl-2.1 (second: adds `$format`/`Accept`/Content-Type for the XML representation) | copy | u1 | reference/consuming-service-layer/metadata-document.md |
| metadata-and-annotations/metadata-document-structure.md | Structure of a metadata document (Edmx, Reference, Schema) | oasis-csdl-4 (base), oasis-csdl-2.2 (second: namespaces `edmx`/`edm`), oasis-csdl-5 (merge), oasis-csdl-15.1 (merge), oasis-csdl-15.3 (merge) | condense | u1 | reference/consuming-service-layer/metadata-document.md; reference/consuming-service-layer/semantic-layer-views/service-root-and-metadata.md |
| metadata-and-annotations/edm-primitive-types.md | Edm primitive types | oasis-csdl-3.3 (base) | copy | u1 | reference/consuming-service-layer/metadata-document.md |
| metadata-and-annotations/entity-types-and-keys.md | Entity types and keys | oasis-csdl-6 (base) | condense | u2 | reference/consuming-service-layer/metadata-document.md |
| metadata-and-annotations/properties-and-facets.md | Structural properties and facets | oasis-csdl-7 (base) | condense | u2 | reference/consuming-service-layer/metadata-document.md; reference/consuming-service-layer/user-defined-fields.md |
| metadata-and-annotations/navigation-properties.md | Navigation properties | oasis-csdl-8 (base) | condense | u2 | reference/consuming-service-layer/associations.md |
| metadata-and-annotations/complex-enum-and-type-definitions.md | Complex types, enumeration types and type definitions | oasis-csdl-9 (base), oasis-csdl-10 (merge), oasis-csdl-11 (merge) | condense | u2 | reference/consuming-service-layer/metadata-document.md |
| metadata-and-annotations/entity-container.md | Entity container, entity sets and singletons | oasis-csdl-13.2 (base), oasis-csdl-13.3 (merge), oasis-csdl-13.4 (merge) | condense | u3 | reference/consuming-service-layer/metadata-document.md |
| metadata-and-annotations/terms-and-vocabularies.md | Terms and vocabularies | oasis-csdl-14.1 (base) | condense | u3 | reference/consuming-service-layer/metadata-document.md |
| metadata-and-annotations/annotations.md | Annotations in metadata | oasis-csdl-14.2 (base), oasis-p1-3.1 (second: protocol-level definition of term, target, value), oasis-csdl-3.6 (merge), oasis-csdl-15.4 (merge) | condense | u3 | reference/etag/etag-entities-and-metadata.md; reference/consuming-service-layer/metadata-document.md |

### Unidades de trabajo

| unit | fragments | hojas | status | notes |
|---|---|---|---|---|
| u1 | oasis-p1-11.1, oasis-csdl-2.1, oasis-csdl-2.2, oasis-csdl-4, oasis-csdl-5, oasis-csdl-15.1, oasis-csdl-15.3, oasis-csdl-3.3 | metadata-and-annotations/metadata-requests.md, metadata-and-annotations/metadata-document-structure.md, metadata-and-annotations/edm-primitive-types.md | pending | about 372 lines |
| u2 | oasis-csdl-6, oasis-csdl-7, oasis-csdl-8, oasis-csdl-9, oasis-csdl-10, oasis-csdl-11 | metadata-and-annotations/entity-types-and-keys.md, metadata-and-annotations/properties-and-facets.md, metadata-and-annotations/navigation-properties.md, metadata-and-annotations/complex-enum-and-type-definitions.md | pending | about 853 lines; condense drops authoring-only rules but keeps every attribute, value and MUST a reader of `$metadata` needs |
| u3 | oasis-csdl-13.2, oasis-csdl-13.3, oasis-csdl-13.4, oasis-csdl-14.1, oasis-csdl-14.2, oasis-p1-3.1, oasis-csdl-3.6, oasis-csdl-15.4 | metadata-and-annotations/entity-container.md, metadata-and-annotations/terms-and-vocabularies.md, metadata-and-annotations/annotations.md | pending | about 420 lines |

### Disambiguation candidates

- OData `$metadata` request (`$format`/`Accept` selects XML) vs SL `reference/consuming-service-layer/metadata-document.md`, which also has SL-specific `$metadata` query options `scope`, `entityset`, `dependency`, `annotation`. These are not OData; `annotation=label` is a query option, unlike an OData Annotation element.
- OData Annotation / Term (`annotations.md`, `terms-and-vocabularies.md`) vs SL `reference/etag/etag-entities-and-metadata.md` (the `Org.OData.Core.V1.OptimisticConcurrency` annotation on an entity set) and SL metadata-document's `Common.Label`, `SAPB1.TableName`, `SAPB1.ColumnName`, `SAPB1.ValidValue` terms.
- OData EntityType/ComplexType/EnumType vs SL Business Object Metadata (`reference/consuming-service-layer/user-defined-objects/udo-metadata.md`, `reference/appendix-di-api-comparison/metadata-naming-differences.md`): UDO or DI-API "metadata" is not the CSDL type metadata.
- OData navigation property vs SL associations (`reference/consuming-service-layer/associations.md`).
- OData service document (`metadata-requests.md`) vs SL `reference/consuming-service-layer/semantic-layer-views/service-root-and-metadata.md` ("service root" of a view).

### Questions

- Entity container (`oasis-csdl-13.2/13.3/13.4`) was not on the candidate list; recommended: include (it is what a developer reads to find entity sets). Alternative: drop the hoja, u3 shrinks by about 134 lines.
- `oasis-csdl-13.5/13.6` (action and function imports) are excluded; recommended: keep excluded (SL covers calling actions). Alternative: one short `copy` hoja to read `ActionImport` in `$metadata`.
- `oasis-csdl-14.3` constant expressions (241 lines) are excluded; recommended: keep excluded. Alternative: a `condense` hoja on annotation value attributes if SL metadata shows more than `String=`.
- `OptimisticConcurrency`: CSDL mentions it only in the 16.1 example, so no hoja covers it; recommended: leave it to bloque 6 and SL's `reference/etag/etag-entities-and-metadata.md`, with a pointer only in the `In Service Layer:` line of `annotations.md`.
- `oasis-csdl-4` is included whole (177 lines) including 4.3 Included Annotations; recommended: keep and let the transcriber condense 4.3 heavily. Alternative: exclude 4.3 by listing 4.1 and 4.2 only, losing the `edmx:Edmx` own text.
- Whether SL's metadata can return JSON: recommended: do not cover it; `metadata-requests.md` copies the p1 sentences as printed and a reviewer decides whether to add `SL differs:`.
