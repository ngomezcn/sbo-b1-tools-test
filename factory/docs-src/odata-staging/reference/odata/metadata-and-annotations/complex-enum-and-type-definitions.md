---
title: Complex types, enumeration types and type definitions
source: external OData: oasis-csdl@v4.01-os 9, 10, 11; retrieved 2026-10-02
summary: How to read ComplexType, EnumType, and TypeDefinition in CSDL, including required attributes, inheritance and flag behavior, and underlying type constraints.
---
# Complex types, enumeration types and type definitions

In Service Layer: reference/consuming-service-layer/metadata-document.md

- [Complex types](#complex-types)
- [Enumeration types](#enumeration-types)
- [Type definitions](#type-definitions)

## Complex types

Complex types are keyless nominal structured types. Because they have no key, their instances cannot be referenced, created, updated, or deleted independently of an entity type.

The complex type name MUST be a simple identifier unique within its schema.

A complex type can define:

- Structural properties (primitive, complex, or enumeration type, or collections of these)
- Navigation properties (entity type or collection of entity types)

Property names within a complex type:

- MUST be unique.
- MUST NOT match the declaring complex type name.
- MAY match names in direct or indirect base types or derived types.

### Element ComplexType

The `edm:ComplexType` element:

- MUST contain `Name`.
- MAY contain `BaseType`, `Abstract`, and `OpenType`.
- MAY contain `edm:Property`, `edm:NavigationProperty`, and `edm:Annotation`.

The value of `Name` is the complex type name.

Example 25: a complex type used by two entity types

```xml
<ComplexType Name="Dimensions">
   <Property Name="Height" Nullable="false" Type="Edm.Decimal" />
   <Property Name="Weight" Nullable="false" Type="Edm.Decimal" />
   <Property Name="Length" Nullable="false" Type="Edm.Decimal" />
 </ComplexType>

<EntityType Name="Product">
   … 
   <Property Name="ProductDimensions" Type="self.Dimensions" />
   <Property Name="ShippingDimensions" Type="self.Dimensions" />
 </EntityType>

<EntityType Name="ShipmentBox">
   …
   <Property Name="Dimensions" Type="self.Dimensions" />
 </EntityType>
```

### Derived complex type

A complex type can inherit from another complex type through `BaseType` and inherits its structural and navigation properties.

A complex type MUST NOT introduce an inheritance cycle by specifying a base type.

The value of `BaseType` is the qualified name of the base type.

### Abstract complex type

A complex type MAY be abstract, meaning it cannot have instances.

The value of `Abstract` is `true` or `false`; absence means `false`.

### Open complex type

A complex type MAY be open, allowing clients to dynamically add uniquely named properties on insert or update payloads.

A complex type derived from an open complex type MUST also indicate it is open.

> **Note**
> Structural and navigation properties MAY be returned by the service on instances of any structured type, whether or not the type is marked open. Clients MUST always be prepared to handle additional properties on instances of any structured type.

The value of `OpenType` is `true` or `false`; absence means `false`.

## Enumeration types

Enumeration types are nominal types that represent a non-empty series of related values as members.

The enumeration type name MUST be a simple identifier unique within its schema.

Although enumeration types have an underlying numeric value, the preferred representation is the member name.

Enumeration types marked as flags allow values composed of more than one member.

### Element EnumType

The `edm:EnumType` element:

- MUST contain `Name`.
- MAY contain `UnderlyingType` and `IsFlags`.
- MUST contain one or more `edm:Member`.
- MAY contain `edm:Annotation`.

The value of `Name` is the enumeration type name.

Example 26: a simple flags-enabled enumeration

```xml
<EnumType Name="FileAccess" UnderlyingType="Edm.Int32" IsFlags="true">
   <Member Name="Read"   Value="1" />
   <Member Name="Write"  Value="2" />
   <Member Name="Create" Value="4" />
   <Member Name="Delete" Value="8" />
 </EnumType>
```

### Underlying integer type

An enumeration type MAY specify one of:

- `Edm.Byte`
- `Edm.SByte`
- `Edm.Int16`
- `Edm.Int32`
- `Edm.Int64`

If omitted, the underlying type defaults to `Edm.Int32`.

The value of `UnderlyingType` is the qualified name of the underlying type.

### Flags enumeration type

An enumeration type MAY indicate that multiple members can be selected simultaneously.

If omitted, only one member MAY be selected simultaneously.

The value of `IsFlags` is `true` or `false`; absence means `false`.

Example 27: pattern values can be combined, and some combined values have explicit names

```xml
<EnumType Name="Pattern" UnderlyingType="Edm.Int32" IsFlags="true">
  <Member Name="Plain"             Value="0" />
  <Member Name="Red"               Value="1" />
  <Member Name="Blue"              Value="2" />
  <Member Name="Yellow"            Value="4" />
  <Member Name="Solid"             Value="8" />
  <Member Name="Striped"           Value="16" />
  <Member Name="SolidRed"          Value="9" />
  <Member Name="SolidBlue"         Value="10" />
  <Member Name="SolidYellow"       Value="12" />
  <Member Name="RedBlueStriped"    Value="19" />
  <Member Name="RedYellowStriped"  Value="21" />
  <Member Name="BlueYellowStriped" Value="22" />
</EnumType>
```

### Enumeration members

Enumeration values consist of discrete members.

Each member:

- MUST have a unique name within the enum type.
- Names are case-sensitive.
- Service authors SHOULD NOT choose names differing only by case.
- MUST specify a numeric value valid for the enum underlying type.

Enumeration types can define multiple members with the same numeric value. Those members compare as equal and can be used interchangeably.

Enumeration members are sorted by numeric value.

The `edm:Member` element:

- MUST contain `Name`.
- MAY contain `Value`.
- MAY contain `edm:Annotation`.

The value of `Name` is the enumeration member name.

For `Value`:

- If `IsFlags` is `false`, either all members MUST specify `Value`, or all members MUST NOT specify it.
- If no values are specified, values are assigned consecutively by document order, starting at zero.
- Client libraries MUST preserve element document order.
- If `IsFlags` is `true`, `Value` MUST be a non-negative integer.
- A combined value is equivalent to the bitwise OR of discrete values.

Example 28: `FirstClass` has a value of `0`, `TwoDay` a value of 1, and `Overnight` a value of 2.

```xml
<EnumType Name="ShippingMethod">
   <Member Name="FirstClass">
    <Annotation Term="Core.Description"
                String="Shipped with highest priority" />
  </Member>
   <Member Name="TwoDay">
    <Annotation Term="Core.Description"
                String="Shipped within two days" />
   </Member>
   <Member Name="Overnight">
    <Annotation Term="Core.Description"
                String="Shipped overnight" />
   </Member>
 </EnumType>
```

## Type definitions

A type definition specializes one primitive type or the built-in abstract type `Edm.PrimitiveType`.

The type definition name MUST be a simple identifier unique within its schema.

Type definitions can be used wherever a primitive type is used, except as the underlying type of another type definition. They are type-comparable with their underlying types and with other type definitions that use the same underlying type.

### Element TypeDefinition

The `edm:TypeDefinition` element:

- MUST contain `Name` and `UnderlyingType`.
- MAY contain `edm:Annotation`.

The value of `Name` is the type definition name.

Example 29:

```xml
<TypeDefinition Name="Length" UnderlyingType="Edm.Int32">
  <Annotation Term="Org.OData.Measures.V1.Unit"
              String="Centimeters" />
</TypeDefinition>

<TypeDefinition Name="Weight" UnderlyingType="Edm.Int32">
  <Annotation Term="Org.OData.Measures.V1.Unit"
              String="Kilograms" />
</TypeDefinition>

<ComplexType Name="Size">
  <Property Name="Height" Type="self.Length" />
  <Property Name="Weight" Type="self.Weight" />
</ComplexType>
```

### Underlying primitive type

The underlying type of a type definition MUST be a primitive type and MUST NOT be another type definition.

The value of `UnderlyingType` is the qualified name of the underlying type.

A type definition MAY specify facets applicable to the underlying type: `MaxLength`, `Unicode`, `Precision`, `Scale`, or `SRID`.

Additional facets MAY be specified where the type definition is used, but facets already specified in the type definition MUST NOT be re-specified.

For a type definition whose underlying type is `Edm.PrimitiveType`, no facets are applicable in the definition or in usage, and clients should ignore them.

Where type definitions are used, responses return the type definition in place of the primitive type wherever the type is specified.
