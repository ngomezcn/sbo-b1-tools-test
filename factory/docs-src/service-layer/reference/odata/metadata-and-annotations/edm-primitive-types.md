---
title: Edm primitive types
source: external OData: oasis-csdl@v4.01-os 3.3; retrieved 2026-10-02
summary: The list of Edm primitive types with their meaning, the date range and special numeric value rules, and the restrictions on Edm.Stream.
---
# Edm primitive types

In Service Layer: reference/consuming-service-layer/metadata-document.md

Structured types are composed of other structured types and primitive types. OData defines the following primitive types:

| Type | Meaning |
|---|---|
| `Edm.Binary` | Binary data |
| `Edm.Boolean` | Binary-valued logic |
| `Edm.Byte` | Unsigned 8-bit integer |
| `Edm.Date` | Date without a time-zone offset |
| `Edm.DateTimeOffset` | Date and time with a time-zone offset, no leap seconds |
| `Edm.Decimal` | Numeric values with decimal representation |
| `Edm.Double` | IEEE 754 binary64 floating-point number (15-17 decimal digits) |
| `Edm.Duration` | Signed duration in days, hours, minutes, and (sub)seconds |
| `Edm.Guid` | 16-byte (128-bit) unique identifier |
| `Edm.Int16` | Signed 16-bit integer |
| `Edm.Int32` | Signed 32-bit integer |
| `Edm.Int64` | Signed 64-bit integer |
| `Edm.SByte` | Signed 8-bit integer |
| `Edm.Single` | IEEE 754 binary32 floating-point number (6-9 decimal digits) |
| `Edm.Stream` | Binary data stream |
| `Edm.String` | Sequence of characters |
| `Edm.TimeOfDay` | Clock time 00:00-23:59:59.999999999999 |
| `Edm.Geography` | Abstract base type for all Geography types |
| `Edm.GeographyPoint` | A point in a round-earth coordinate system |
| `Edm.GeographyLineString` | Line string in a round-earth coordinate system |
| `Edm.GeographyPolygon` | Polygon in a round-earth coordinate system |
| `Edm.GeographyMultiPoint` | Collection of points in a round-earth coordinate system |
| `Edm.GeographyMultiLineString` | Collection of line strings in a round-earth coordinate system |
| `Edm.GeographyMultiPolygon` | Collection of polygons in a round-earth coordinate system |
| `Edm.GeographyCollection` | Collection of arbitrary Geography values |
| `Edm.Geometry` | Abstract base type for all Geometry types |
| `Edm.GeometryPoint` | Point in a flat-earth coordinate system |
| `Edm.GeometryLineString` | Line string in a flat-earth coordinate system |
| `Edm.GeometryPolygon` | Polygon in a flat-earth coordinate system |
| `Edm.GeometryMultiPoint` | Collection of points in a flat-earth coordinate system |
| `Edm.GeometryMultiLineString` | Collection of line strings in a flat-earth coordinate system |
| `Edm.GeometryMultiPolygon` | Collection of polygons in a flat-earth coordinate system |
| `Edm.GeometryCollection` | Collection of arbitrary Geometry values |

`Edm.Date` and `Edm.DateTimeOffset` follow [XML-Schema-2] and use the proleptic Gregorian calendar, allowing the year `0000` (equivalent to 1 BCE) and negative years (year `-0001` being equivalent to 2 BCE etc.). The supported date range is service-specific and typically depends on the underlying persistency layer, e.g. SQL only supports years `0001` to `9999`.

`Edm.Decimal with a Scale value of floating`, `Edm.Double`, and `Edm.Single` allow the special numeric values `-INF`, `INF`, and `NaN`.

`Edm.Stream` is a primitive type that can be used as a property of an entity type or complex type, the underlying type for a type definition, or the binding parameter or return type of an action or function. `Edm.Stream`, or a type definition whose underlying type is `Edm.Stream`, cannot be used in collections or for non-binding parameters to functions or actions.

Some of these types allow facets, defined in Type Facets.

See rule `primitiveLiteral` in [OData-ABNF] for the representation of primitive type values in URLs and [OData-JSON] for the representation in requests and responses.
