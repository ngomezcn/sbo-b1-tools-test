---
title: Read entities and properties
source: external OData: ms@3ca8f5b get-data + oasis-p1@v4.01-os 11.2.2, 11.2.4 + oasis-json@v4.01-os 11; retrieved 2026-10-02
summary: How to GET an entity collection, one entity by key, an individual property (including members of a complex type), and a property's raw value with $value, plus status codes and the JSON shape of a property response.
---
# Read entities and properties

In Service Layer: reference/consuming-service-layer/individual-properties.md; reference/consuming-service-layer/crud-operations.md; reference/consuming-service-layer/query-options/basic-queries.md ; SL differs: properties of complex types cannot be requested, a missing or null property value returns 200 with odata.null (or @odata.null in v4) instead of 204 No Content, and $value on null returns 404 Not Found instead of 204 No Content

- [Entity collections](#entity-collections)
- [Individual entity by ID](#individual-entity-by-id)
- [Individual property](#individual-property)
- [Property raw value ($value)](#property-raw-value-value)
- [JSON of a property response](#json-of-a-property-response)

OData services support requests for data via HTTP `GET` requests.

## Entity collections

The request below returns the the collection of Person ***People***.

```http
GET serviceRoot/People
```

Response Payload

```json
{
    "@odata.context": "serviceRoot/$metadata#People",
    "@odata.nextLink": "serviceRoot/People?%24skiptoken=8",
    "value": [
        {
            "@odata.id": "serviceRoot/People('russellwhyte')",
            "@odata.etag": "W/\"08D1694BD49A0F11\"",
            "@odata.editLink": "serviceRoot/People('russellwhyte')",
            "UserName": "russellwhyte",
            "FirstName": "Russell",
            "LastName": "Whyte",
            "Emails": [
                "Russell@example.com",
                "Russell@contoso.com"
            ],
            "AddressInfo": [
                {
                    "Address": "187 Suffolk Ln.",
                    "City": {
                        "CountryRegion": "United States",
                        "Name": "Boise",
                        "Region": "ID"
                    }
                }
            ],
            "Gender": "Male",
            "Concurrency": 635404796846280400
        },
        ......
        ,
        {
            "@odata.id": "serviceRoot/People('keithpinckney')",
            "@odata.etag": "W/\"08D1694BD49A0F11\"",
            "@odata.editLink": "serviceRoot/People('keithpinckney')",
            "UserName": "keithpinckney",
            "FirstName": "Keith",
            "LastName": "Pinckney",
            "Emails": [
                "Keith@example.com",
                "Keith@contoso.com"
            ],
            "AddressInfo": [],
            "Gender": "Male",
            "Concurrency": 635404796846280400
        }
    ]
}
```

## Individual entity by ID

To retrieve an individual entity, the client makes a `GET` request to a URL that identifies the entity, e.g. its read URL. The read URL can be obtained from a response payload containing that instance, for example as a `readLink` or `editLink` in an [OData-JSON] payload. In addition, services MAY support conventions for constructing a read URL using the entity's key value(s), as described in [OData-URL].

The set of structural or navigation properties to return may be specified through `$select` or `$expand` system query options.

Clients MUST be prepared to receive additional properties in an entity or complex type instance that are not advertised in metadata, even for types not marked as open.

Properties that are not available, for example due to permissions, are not returned. In this case, the `Core.Permissions` annotation, defined in [OData-VocCore] MUST be returned for the property with a value of `None.`

If no entity exists with the specified request URL, the service responds with `404 Not Found`.

The request below returns an individual entity of type ***Person*** by the given UserName "russellwhyte".

```http
GET serviceRoot/People('russellwhyte')
```

Response Payload

```json
{
    "@odata.context": "serviceRoot/$metadata#People/$entity",
    "@odata.id": "serviceRoot/People('russellwhyte')",
    "@odata.etag": "W/\"08D1694BF26D2BC9\"",
    "@odata.editLink": "serviceRoot/People('russellwhyte')",
    "UserName": "russellwhyte",
    "FirstName": "Russell",
    "LastName": "Whyte",
    "Emails": [
        "Russell@example.com",
        "Russell@contoso.com"
    ],
    "AddressInfo": [
        {
            "Address": "187 Suffolk Ln.",
            "City": {
                "CountryRegion": "United States",
                "Name": "Boise",
                "Region": "ID"
            }
        }
    ],
    "Gender": "Male",
    "Concurrency": 635404797346655200
}
```

## Individual property

To retrieve an individual property, the client issues a `GET` request to the property URL. The property URL is the entity read URL with "/" and the property name appended. If the property has a complex type, properties of that value can be addressed by further property name composition. See [OData-URL] for details.

If the property is single-valued and has the `null` value, the service responds with `204 No Content`.

If the property is not available, for example due to permissions, the service responds with `404 Not Found`.

Example 31:

```http
GET http://host/service/Products(1)/Name
```

The request below returns the ***Name*** property of an ***Airport***.

```http
GET serviceRoot/Airports('KSFO')/Name
```

Response Payload

```json
{
    "@odata.context": "serviceRoot/$metadata#Airports('KSFO')/Name",
    "value": "San Francisco International Airport"
}
```

The request below returns the ***Address*** of the complex type ***Location*** in an ***Airport***.

```http
GET serviceRoot/Airports('KSFO')/Location/Address
```

Response Payload

```json
{
"@odata.context": "serviceRoot/$metadata#Airports('KSFO')/Location/Address",
"value": "South McDonnell Road, San Francisco, CA 94128"
}
```

## Property raw value ($value)

To retrieve the raw value of a primitive type property, the client sends a `GET` request to the property value URL (the property URL with a `$value` segment appended). See [OData-URL] for details.

The `Content-Type` of the response is determined using the `Accept` header and the `$format` system query option.

- The default format for `Edm.Binary` is the format specified by the `Core.MediaType` annotation of this property (see [OData-VocCore]) if this annotation is present. If not annotated, the format cannot be predicted by the client.
- The default format for `Edm.Geo` types is `text/plain` using the WKT (well-known text) format, see rules `fullCollectionLiteral`, `fullLineStringLiteral`, `fullMultiPointLiteral`, `fullMultiLineStringLiteral`, `fullMultiPolygonLiteral`, `fullPointLiteral`, and `fullPolygonLiteral` in [OData-ABNF].
- The default format for single primitive values except `Edm.Binary` and the `Edm.Geo` types is `text/plain`. Responses for properties of type `Edm.String` can use the `charset` format parameter to specify the character set used for representing the string value. Responses for the other primitive types follow the rules `booleanValue`, `byteValue`, `dateValue`, `dateTimeOffsetValue`, `decimalValue`, `doubleValue`, `durationValue`, `enumValue`, `guidValue`, `int16Value`, `int32Value`, `int64Value`, `sbyteValue`, `singleValue`, and `timeOfDayValue` in [OData-ABNF].

A `$value` request for a property that is `null` results in a `204 No Content` response.

If the property is not available, for example due to permissions, the service responds with `404 Not Found`.

Example 32:

```http
GET http://host/service/Products(1)/Name/$value
```

The request below returns the raw value of property ***Name*** of an ***Airport***.

```http
GET serviceRoot/Airports('KSFO')/Name/$value
```

Response Payload

```json
San Francisco International Airport
```

## JSON of a property response

An individual property or operation response is represented as a JSON object.

A single-valued property or operation response that has the `null` value does not have a representation; see [OData-Protocol].

- A property or operation response that is of a primitive type is represented as an object with a single name/value pair, whose name is `value` and whose value is a primitive value.
- A property or operation response that is of complex type is represented as a complex value.
- A property or operation response that is of a collection type is represented as an object with a single name/value pair whose name is `value`. Its value is the JSON representation of a collection of complex type values or collection of primitive values.

Example 23: primitive value

```json
{
  "@context": "http://host/service/$metadata#Edm.String",
  "value": "Pilar Ackerman"
}
```

Example 24: collection of primitive values

```json
{
  "@context": "http://host/service/$metadata#Collection(Edm.String)",
  "value": ["small", "medium", "extra large"]
}
```

Example 25: empty collection of primitive values

```json
{
  "@context": "http://host/service/$metadata#Collection(Edm.String)",
  "value": []
}
```

Example 26: complex value

```json
{
  "@context": "http://host/service/$metadata#Model.Address",
  "Street": "12345 Grant Street",
  "City": "Taft",
  "Region": "Ohio",
  "PostalCode": "OH 98052",
  "Country@navigationLink": "Countries('US')"
}
```

Example 27: empty collection of complex values

```json
{
   "@context":"http://host/service/$metadata#Collection(Model.Address)",
   "value": []
}
```

> **Note**
>
> The context URL is optional in requests.
