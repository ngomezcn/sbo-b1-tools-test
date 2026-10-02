---
title: Structural properties and facets
source: external OData: oasis-csdl@v4.01-os 7; retrieved 2026-10-02
summary: How to read a Property in a metadata document - Name, Type, Collection types - and what the facets Nullable, MaxLength, Precision, Scale, Unicode, SRID and DefaultValue mean, with defaults.
---
# Structural properties and facets

In Service Layer: reference/consuming-service-layer/metadata-document.md; reference/consuming-service-layer/user-defined-fields.md

- [Structural property](#structural-property)
- [Type](#type)
- [Type facets](#type-facets)

## Structural property

A structural property is a property (of a structural type) that has one of the following types:

- Primitive type
- Complex type
- Enumeration type
- A collection of one of the above

A structural property MUST specify a unique name as well as a type.

The property's name MUST be a simple identifier used when referencing, serializing or deserializing the property.

- It MUST be unique within the set of structural and navigation properties of the declaring structured type, and MUST NOT match the name of any navigation property in any of its base types.
- If a structural property with the same name is defined in any of this type's base types, then the property's type MUST be a type derived from the type specified for the property of the base type and constrains this property to be of the specified subtype for instances of this structured type.
- The name MUST NOT match the name of any structural or navigation property of any of this type's base types for OData 4.0 responses.

Names are case-sensitive, but service authors SHOULD NOT choose names that differ only in case.

### Element Property

The `edm:Property` element MUST contain the `Name` and the `Type` attribute, and it MAY contain the facet attributes `Nullable`, `MaxLength`, `Unicode`, `Precision`, `Scale`, `SRID`, and `DefaultValue`. It MAY contain `edm:Annotation` elements.

The value of `Name` is the property's name.

Example 15: complex type with two properties

```xml
<ComplexType Name="Measurement">
   <Property Name="Dimension" Type="Edm.String" Nullable="false" MaxLength="50"
            DefaultValue="Unspecified" />
   <Property Name="Length" Type="Edm.Decimal" Nullable="false" Precision="18"
            Scale="2" />
 </ComplexType>
```

## Type

The property's type MUST be a primitive type, complex type, or enumeration type in scope, or a collection of one of these types.

A collection-valued property may be annotated with the `Core.Ordered` term, defined in [OData-CoreVoc], to specify that it supports a stable ordering. It may be annotated with the `Core.PositionalInsert` term, defined in [OData-CoreVoc], to specify that it supports inserting items into a specific ordinal position.

- For single-valued properties the value of `Type` is the qualified name of the property's type.
- For collection-valued properties the value of `Type` is the character sequence `Collection(` followed by the qualified name of the property's item type, followed by a closing parenthesis `)`.

Example 16: property `Units` that can have zero or more strings as its value

```xml
<Property Name="Units" Type="Collection(Edm.String)" />
```

## Type facets

Facets modify or constrain the acceptable values of a property. For single-valued properties facets apply to the type of the property. For collection-valued properties the facets apply to the type of the items in the collection.

### Nullable

A Boolean value specifying whether the property can have the value `null`. The value of `Nullable` is one of the Boolean literals `true` or `false`.

- For single-valued properties the value `true` means that the property allows the `null` value. If no value is specified, the attribute defaults to `true`.
- For collection-valued properties the property value will always be a collection that MAY be empty. In this case the `Nullable` attribute applies to items of the collection and specifies whether the collection MAY contain `null` values.
- In OData 4.01 responses a collection-valued property MUST specify a value for the `Nullable` attribute.
- If no value is specified for a collection-valued property, the client cannot assume any default value. Clients SHOULD be prepared for this situation even in OData 4.01 responses.

### MaxLength

A positive integer value specifying the maximum length of a binary, stream or string value. For binary or stream values this is the octet length of the binary data, for string values it is the character length (number of code points for Unicode).

If no maximum length is specified, clients SHOULD expect arbitrary length.

The value of `MaxLength` is a positive integer or the symbolic value `max` as a shorthand for the maximum length supported for the type by the service.

Note: the symbolic value `max` is only allowed in OData 4.0 responses; it is deprecated in OData 4.01. While clients MUST be prepared for this symbolic value, OData 4.01 and greater services MUST NOT return the symbolic value `max` and MAY instead specify the concrete maximum length supported for the type by the service or omit the attribute entirely.

### Precision

- For a decimal value: the maximum number of significant decimal digits of the property's value; it MUST be a positive integer.
- For a temporal value (datetime-with-timezone-offset, duration, or time-of-day): the number of decimal places allowed in the seconds portion of the value; it MUST be a non-negative integer between zero and twelve.

The value of `Precision` is a number.

- If not specified for a decimal property, the decimal property has arbitrary precision.
- If not specified for a temporal property, the temporal property has a precision of zero.

Note: service authors SHOULD be aware that some clients are unable to support a precision greater than 28 for decimal properties and 7 for temporal properties. Client developers MUST be aware of the potential for data loss when round-tripping values of greater precision. Updating via `PATCH` and exclusively specifying modified properties will reduce the risk for unintended data loss.

Note: duration properties supporting a granularity less than seconds (e.g. minutes, hours, days) can be annotated with term `Measures.DurationGranularity`, see [OData-VocMeasures].

Example 17: `Precision` facet applied to the `DateTimeOffset` type

```xml
<Property Name="SuggestedTimes" Type="Collection(Edm.DateTimeOffset)"
          Precision="6" />
```

### Scale

A non-negative integer value specifying the maximum number of digits allowed to the right of the decimal point, or one of the symbolic values `floating` or `variable`. The value of `Scale` is a number or one of the symbolic values `floating` or `variable`. If not specified, the `Scale` facet defaults to zero. The value of `Scale` MUST be less than or equal to the value of `Precision`.

- The value `floating` means that the decimal property represents a decimal floating-point number whose number of significant digits is the value of the `Precision` facet. OData 4.0 responses MUST NOT specify the value `floating`.
- The value `variable` means that the number of digits to the right of the decimal point may vary from zero to the value of the `Precision` facet.
- An integer value means that the number of digits to the right of the decimal point may vary from zero to the value of the `Scale` attribute, and the number of digits to the left of the decimal point may vary from one to the value of the `Precision` facet minus the value of the `Scale` facet. If `Precision` is equal to `Scale`, a single zero MUST precede the decimal point.

Services SHOULD use lower-case values; clients SHOULD accept values in a case-insensitive manner.

Note: if the underlying data store allows negative scale, services may use a `Precision` with the absolute value of the negative scale added to the actual number of significant decimal digits, and client-provided values may have to be rounded before being stored.

Example 18: `Precision=3` and `Scale=2`.
Allowed values: 1.23, 0.23, 3.14 and 0.7, not allowed values: 123, 12.3

```xml
<Property Name="Amount32" Type="Edm.Decimal" Precision="3" Scale="2" />
```

Example 19: `Precision=2` equals `Scale`.
Allowed values: 0.23, 0.7, not allowed values: 1.23, 1.2

```xml
<Property Name="Amount22" Type="Edm.Decimal" Precision="2" Scale="2" />
```

Example 20: `Precision=3` and a variable `Scale`.
Allowed values: 0.123, 1.23, 0.23, 0.7, 123 and 12.3, not allowed values: 12.34, 1234 and 123.4 due to the limited precision.

```xml
<Property Name="Amount3v" Type="Edm.Decimal" Precision="3" Scale="variable" />
```

Example 21: `Precision=7` and a floating `Scale`.
Allowed values: -1.234567e3, 1e-101, 9.999999e96, not allowed values: 1e-102 and 1e97 due to the limited precision.

```xml
<Property Name="Amount7f" Type="Edm.Decimal" Precision="7" Scale="floating" />
```

### Unicode

For a string property the `Unicode` facet indicates whether the property might contain and accept string values with Unicode characters (code points) beyond the ASCII character set. The value `false` indicates that the property will only contain and accept string values with characters limited to the ASCII character set.

The value of `Unicode` is one of the Boolean literals `true` or `false`. If no value is specified, the facet defaults to `true`.

### SRID

For a geometry or geography property the `SRID` facet identifies which spatial reference system is applied to values of the property on type instances.

The value of the `SRID` facet MUST be a non-negative integer or the special value `variable`. If no value is specified, the attribute defaults to `0` for `Geometry` types or `4326` for `Geography` types.

The valid values of the `SRID` facet and their meanings are as defined by the European Petroleum Survey Group [EPSG].

The value of `$SRID` is a number or the symbolic value `variable`.

### Default value

A primitive or enumeration property MAY define a default value that is used if the property is not explicitly represented in an annotation or the body of a `POST` or `PUT` request. If no value is specified, the client SHOULD NOT assume a default value.

Default values of type `Edm.String` MUST be represented according to the XML escaping rules for character data in attribute values. Values of other primitive types MUST be represented according to the appropriate alternative in the `primitiveValue` rule defined in [OData-ABNF], i.e. `Edm.Binary` as `binaryValue`, `Edm.Boolean` as `booleanValue` etc.
