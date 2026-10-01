---
title: Retrieving Individual Properties
source: pdf pp. 79-81, sec 3.10
summary: Requesting a single property value or its raw value of an entity, and the responses for existing, null and missing values.
---

# Retrieving Individual Properties

> **Note**
>
> This feature is available in SAP Business One 9.1 patch level 04 and later.

> **Note**
>
> Retrieving the properties of a complex type is not supported. For example, the following request is not possible:
>
> ```http
> GET /Orders(1)/TaxExtension/TaxId0
> ```

## Retrieving Property Values

To retrieve the values of individual properties, send HTTP requests as follows:

```http
GET /Orders(1)/DocEntry
```

The service returns either of the following:

- If `DocEntry 1` exists:

```http
HTTP/1.1 200 OK
{
    "value": 1
}
```

- If `DocEntry 1`does not exist:

```http
HTTP/1.1 200 OK
{
    "odata.null": true
}
```

For OData version 4, an additional "@" is added before `"odata.null"` in the response.

## Retrieving Property Raw Values

To retrieve the raw values of individual properties, send HTTP requests as follows:

```http
GET /Orders(1)/DocEntry/$value
```

The service returns:

```http
HTTP/1.1 200 OK
1
```

For null values, the service returns a `404 Not Found` error, as below:

```http
HTTP/1.1 404 Not Found
{
    "error": {
        "code": -2028,
        "innererror": {
            "context": null,
            "trace": null
        },
        "message": {
            "lang": "en-us",
            "value": "Resource not found for the property: DocEntry"
        }
    }
}
```
