# Metadata and annotations

## [Service document and metadata document requests](metadata-requests.md)
Use when: requesting the service document or `$metadata`, and choosing XML vs JSON format.
Terms: `$metadata`, service document, `application/xml`, `$format`, `Accept`
Not here: structure of the CSDL document → [metadata-document-structure](metadata-document-structure.md)

## [Structure of a metadata document (Edmx, Reference, Schema)](metadata-document-structure.md)
Use when: reading `edmx:Edmx`, `edmx:Reference`, `edm:Schema`, namespaces and qualified names in `$metadata`.
Terms: `edmx:Edmx`, `edmx:Reference`, `edmx:Include`, `edm:Schema`, `Namespace`, `Alias`
Not here: EntityType/Property details → [entity-types-and-keys](entity-types-and-keys.md)

## [Edm primitive types](edm-primitive-types.md)
Use when: looking up what `Edm.String`, `Edm.Decimal`, `Edm.DateTimeOffset` and other Edm types mean.
Terms: `Edm.String`, `Edm.Decimal`, `Edm.DateTimeOffset`, `Edm.Guid`, `Edm.Boolean`
Not here: Property facets → [properties-and-facets](properties-and-facets.md)

## [Entity types and keys](entity-types-and-keys.md)
Use when: reading an `EntityType`, its `Key`/`PropertyRef`, `BaseType`, `Abstract`, `OpenType` or `HasStream`.
Terms: `EntityType`, `Key`, `PropertyRef`, `BaseType`, `Abstract`, `OpenType`, `HasStream`
Not here: structural Property facets → [properties-and-facets](properties-and-facets.md)

## [Structural properties and facets](properties-and-facets.md)
Use when: reading a `Property` and facets such as `Nullable`, `MaxLength`, `Precision`, `Scale`, `Unicode`, `DefaultValue`.
Terms: `Property`, `Nullable`, `MaxLength`, `Precision`, `Scale`, `Unicode`, `DefaultValue`
Not here: navigation properties → [navigation-properties](navigation-properties.md)

## [Navigation properties](navigation-properties.md)
Use when: reading a `NavigationProperty` (`Type`, `Partner`, `ContainsTarget`, `ReferentialConstraint`, `OnDelete`).
Terms: `NavigationProperty`, `Partner`, `ContainsTarget`, `ReferentialConstraint`, `OnDelete`
Not here: using `$expand` at runtime → [query-options](../query-options/index.md)

## [Complex types, enumeration types and type definitions](complex-enum-and-type-definitions.md)
Use when: reading a `ComplexType`, `EnumType` (`Member`, `IsFlags`) or `TypeDefinition` in `$metadata`.
Terms: `ComplexType`, `EnumType`, `Member`, `IsFlags`, `TypeDefinition`, `UnderlyingType`
Not here: entity types → [entity-types-and-keys](entity-types-and-keys.md)

## [Entity container, entity sets and singletons](entity-container.md)
Use when: finding entity sets and singletons in the container, or reading `NavigationPropertyBinding`.
Terms: `EntityContainer`, `EntitySet`, `Singleton`, `NavigationPropertyBinding`
Not here: addressing those sets in URLs → [urls-and-addressing](../urls-and-addressing/index.md)

## [Terms and vocabularies](terms-and-vocabularies.md)
Use when: reading a `Term` definition (`AppliesTo`, `Type`, `BaseTerm`) that an annotation refers to.
Terms: `Term`, `AppliesTo`, vocabulary, `BaseTerm`, `DefaultValue`
Not here: applying annotations → [annotations](annotations.md)

## [Annotations in metadata](annotations.md)
Use when: reading an `Annotation` (`Term`, `Qualifier`, `Target`) or how annotations are uniquely identified and inherited.
Terms: `Annotation`, `Term`, `Qualifier`, `Target`, vocabulary
Not here: OptimisticConcurrency / ETag in SL → see each hoja's In Service Layer line
