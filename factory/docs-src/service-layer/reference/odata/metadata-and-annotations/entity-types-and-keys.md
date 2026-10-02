---
title: Entity types and keys
source: external OData: oasis-csdl@v4.01-os 6; retrieved 2026-10-02
summary: How to read an EntityType in a metadata document - Name, BaseType, Abstract, OpenType, HasStream, and the Key with its PropertyRef (Name, Alias) - and the rules that apply to each.
---
# Entity types and keys

In Service Layer: reference/consuming-service-layer/metadata-document.md

- [Entity type](#entity-type)
- [Derived entity type](#derived-entity-type)
- [Abstract entity type](#abstract-entity-type)
- [Open entity type](#open-entity-type)
- [Media entity type](#media-entity-type)
- [Key](#key)

## Entity type

Entity types are nominal structured types with a key that consists of one or more references to structural properties. An entity type is the template for an entity: any uniquely identifiable record such as a customer or order.

The entity type's name is a simple identifier that MUST be unique within its schema.

An entity type can define two types of properties. A structural property is a named reference to a primitive, complex, or enumeration type, or a collection of primitive, complex, or enumeration types. A navigation property is a named reference to another entity type or collection of entity types.

All properties MUST have a unique name within an entity type. Properties MUST NOT have the same name as the declaring entity type. They MAY have the same name as one of the direct or indirect base types or derived types.

### Element EntityType

The `edm:EntityType` element:

- MUST contain the `Name` attribute, and MAY contain the `BaseType`, `Abstract`, `OpenType`, and `HasStream` attributes.
- MAY contain `edm:Property` and `edm:NavigationProperty` elements describing the properties of the entity type.
- MAY contain one `edm:Key` element.
- MAY contain `edm:Annotation` elements.

The value of `Name` is the entity type's name.

Example 8: a simple entity type

```xml
<EntityType Name="Employee">
   <Key>
     <PropertyRef Name="ID" />
   </Key>
   <Property Name="ID" Type="Edm.String" Nullable="false" />
   <Property Name="FirstName" Type="Edm.String" Nullable="false" />
   <Property Name="LastName" Type="Edm.String" Nullable="false" />
   <NavigationProperty Name="Manager" Type="self.Manager" />
 </EntityType>
```

## Derived entity type

An entity type can inherit from another entity type by specifying it as its base type. It inherits the key as well as structural and navigation properties of its base type. An entity type MUST NOT introduce an inheritance cycle via the base type attribute.

The value of the `BaseType` attribute is the qualified name of the base type.

Example 9: a derived entity type based on the previous example

```xml
<EntityType Name="Manager" BaseType="self.Employee">
   <Property Name="AnnualBudget" Type="Edm.Decimal" />
   <NavigationProperty Name="Employees" Type="Collection(self.Employee)" />
 </EntityType>
```

Note: the derived type has the same name as one of the properties of its base type.

## Abstract entity type

An entity type MAY indicate that it is abstract and cannot have instances.

- For OData 4.0 responses a non-abstract entity type MUST define a key or derive from a base type with a defined key.
- An abstract entity type MUST NOT inherit from a non-abstract entity type.

The value of the `Abstract` attribute is one of the Boolean literals `true` or `false`. Absence of the attribute means `false`.

## Open entity type

An entity type MAY indicate that it is open and allows clients to add properties dynamically to instances of the type by specifying uniquely named property values in the payload used to insert or update an instance of the type. An entity type derived from an open entity type MUST indicate that it is also open.

Note: structural and navigation properties MAY be returned by the service on instances of any structured type, whether or not the type is marked as open. Clients MUST always be prepared to deal with additional properties on instances of any structured type, see [OData-Protocol].

The value of the `OpenType` attribute is one of the Boolean literals `true` or `false`. Absence of the attribute means `false`.

## Media entity type

An entity type that does not specify a base type MAY specify that it is a media entity type. Media entities are entities that represent a media stream, such as a photo.

- Use a media entity if the out-of-band stream is the main topic of interest and the media entity is just additional structured information attached to the stream.
- Use a normal entity with one or more properties of type `Edm.Stream` if the structured data of the entity is the main topic of interest and the stream data is just additional information attached to the structured data.

For more information on media entities see [OData-Protocol].

An entity type derived from a media entity type MUST indicate that it is also a media entity type. Media entity types MAY specify a list of acceptable media types using an annotation with term `Core.AcceptableMediaTypes`, see [OData-VocCore].

The value of the `HasStream` attribute is one of the Boolean literals `true` or `false`. Absence of the attribute means `false`.

## Key

An entity is uniquely identified within an entity set by its key. A key MAY be specified if the entity type does not specify a base type that already has a key declared. An entity type (whether or not it is marked as abstract) MAY define a key only if it doesn't inherit one.

- In order to be specified as the type of an entity set or a collection-valued containment navigation property, the entity type MUST either specify a key or inherit its key from its base type.
- In OData 4.01 responses entity types used for singletons or single-valued navigation properties do not require a key. In OData 4.0 responses entity types used for singletons or single-valued navigation properties MUST have a key defined.
- An entity type's key refers to the set of properties that uniquely identify an instance of the entity type within an entity set. The key MUST consist of at least one property.

Key properties MUST NOT be nullable and MUST be typed with an enumeration type, one of the following primitive types, or a type definition based on one of these primitive types:

- `Edm.Boolean`
- `Edm.Byte`
- `Edm.Date`
- `Edm.DateTimeOffset`
- `Edm.Decimal`
- `Edm.Duration`
- `Edm.Guid`
- `Edm.Int16`
- `Edm.Int32`
- `Edm.Int64`
- `Edm.SByte`
- `Edm.String`
- `Edm.TimeOfDay`

Key property values MAY be language-dependent, but their values MUST be unique across all languages and the entity ids (defined in [OData-Protocol]) MUST be language independent.

A key property MUST be a non-nullable primitive property of the entity type itself, including non-nullable primitive properties of non-nullable single-valued complex properties, recursively.

In OData 4.01 the key properties of a directly related entity type MAY also be part of the key if the navigation property is single-valued and not nullable. This includes navigation properties of non-nullable single-valued complex properties (recursively) of the entity type. If a key property of a related entity type is part of the key, all key properties of the related entity type MUST also be part of the key.

### Key aliases

If the key property is a property of a complex property (recursively) or of a directly related entity type, the key MUST specify an alias for that property that MUST be a simple identifier and MUST be unique within the set of aliases, structural and navigation properties of the containing entity type and any of its base types.

An alias MUST NOT be defined if the key property is a primitive property of the entity type itself.

For key properties that are a property of a complex or navigation property, the alias MUST be used in the key predicate of URLs instead of the path to the property because the required percent-encoding of the forward slash separating segments of the path to the property would make URL construction and parsing rather complicated. The alias MUST NOT be used in the query part of URLs, where paths to properties don't require special encoding and are a standard constituent of expressions anyway.

### Elements Key and PropertyRef

- The `edm:Key` element MUST contain at least one `edm:PropertyRef` element.
- The `edm:PropertyRef` element MUST contain the `Name` attribute and MAY contain the `Alias` attribute.
- The value of `Name` is a path expression leading to a primitive property. The names of the properties in the path are joined together by forward slashes.
- The value of `Alias` is a simple identifier.

Example 10: entity type with a simple key

```xml
<EntityType Name="Category">
   <Key>
     <PropertyRef Name="ID" />
   </Key>
   <Property Name="ID" Type="Edm.Int32" Nullable="false" />
   <Property Name="Name" Type="Edm.String" />
 </EntityType>
```

Example 11: entity type with a simple key referencing a property of a complex type

```xml
<EntityType Name="Category">
   <Key>
     <PropertyRef Name="Info/ID" Alias="EntityInfoID" />
   </Key>
   <Property Name="Info" Type="Sales.EntityInfo" Nullable="false" />
   <Property Name="Name" Type="Edm.String" />
 </EntityType>

<ComplexType Name="EntityInfo">
  <Property Name="ID" Type="Edm.Int32" Nullable="false" />
   <Property Name="Created" Type="Edm.DateTimeOffset" />
 </ComplexType>
```

Example 12: entity type with a composite key

```xml
<EntityType Name="OrderLine">
   <Key>
     <PropertyRef Name="OrderID" />
     <PropertyRef Name="LineNumber" />
   </Key>
   <Property Name="OrderID" Type="Edm.Int32" Nullable="false" />
   <Property Name="LineNumber" Type="Edm.Int32" Nullable="false" />
 </EntityType>
```

Example 13 (based on example 11): requests to an entity set `Categories` of type `Category` must use the alias

```http
GET http://host/service/Categories(EntityInfoID=1)
```

Example 14 (based on example 11): in a query part the value assigned to the name attribute must be used

```http
GET http://example.org/OData.svc/Categories?$filter=Info/ID le 100
```
