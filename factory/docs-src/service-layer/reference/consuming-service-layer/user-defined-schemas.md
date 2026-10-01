---
title: User-Defined Schemas
source: pdf pp. 84-86, sec 3.12
summary: Creating schema files that restrict the fields Service Layer returns, their prerequisites, the B1S-Schema header, and the demo.schema sample.
---

# User-Defined Schemas

> **Note**
>
> This feature is available in SAP Business One 9.1 patch level 03 and later.

A typical sales order returned by Service Layer:

> **Sample Code**
>
> ```json
> {
>     "DocEntry": 71,
>     "DocNum": 51,
>     "DocType": "dDocument_Items",
>     "HandWritten": "tNO",
>     "Printed": "psNo",
>     ...
>     "DocumentLines": [
>         {
>             "LineNum": 0,
>             "ItemCode": "i1",
>             "ItemDescription": "item 1",
>             "Quantity": 10,
>             "ShipDate": "2014-04-01",
>             "Price": 100,
>             ...
>         },
>         {
>             "LineNum": 1,
>             "ItemCode": "i2",
>             "ItemDescription": "item 2",
>             "Quantity": 8,
>             "ShipDate": "2014-04-01",
>             "Price": 120,
>             ...
>         }
>     ],
>     ...
> }
> ```

If the existing data structure does not satisfy your needs or you want to restrict the field amount, you can create your own schemas. Note that user-defined schemas are based on entities.

## Prerequisites

Before working with a user-defined schema, ensure the following:

- You have created a schema file under the `<Installation Directory>/ServiceLayer/conf` folder.

> **Note**
>
> If you want to send requests directly through a load balancer member which is installed on a different machine from the load balancer, you must ensure a copy of the schema file exists also on the member machine.

- You have defined the schema in the JSON format, according to your needs.

> **Note**
>
> Any change to the schema file takes effect immediately after you save the file. You do not have to restart the Service Layer service.

- If you want to use the default schema defined in the `b1s.conf` file instead of specifying the schema in requests, you have made the schema file name identical to the value of the schema configuration option. For more information, see [Managing Service Layer Settings](../configuring/service-layer-controller-settings.md#managing-service-layer-settings) [page 167].

## Filter Fields

A company database usually contains many more fields than needed. You can define your own schemas with "trimmed" data structures.

> **Example**
>
> **How to restrict data output to a limited number of fields**
>
> In the `conf` folder, create a file named `marketingDocument.schema` and edit the file as below:
>
> ```json
> {
>     "Document": [
>         "DocEntry",
>         "DocNum",
>         "DocumentLines",
>     ],
>     "DocumentLine": [
>         "LineNum",
>         "ItemCode",
>         "Quantity"
>     ]
> }
> ```
>
> This schema restricts output fields as follows:
>
> - For type (`EntityType` or `ComplexType` in the metadata) `Document` (including all marketing document entities): `DocEntry`, `DocNum`, and `DocumentLines`
> - For type `DocumentLine`: `LineNum`, `ItemCode`, and `Quantity`
>
> The service returns:
>
> ```http
> HTTP/1.1 200 OK
> B1S-Schema: schema1.schema
> ...(other HTTP headers)...
> {
>     "DocEntry": 71,
>     "DocNum": 51,
>     "DocumentLines": [
>         {
>             "LineNum": 0,
>             "ItemCode": "i1",
>             "Quantity": 10
>         },
>         {
>             "LineNum": 1,
>             "ItemCode": "i2",
>             "Quantity": 8
>         }
>     ]
> }
> ```

> **Note**
>
> The schema file is often named `{xxx}.schema` but that is not mandatory. You can use any name, for example, `myschema`.
>
> In SAP Business One 9.1 patch level 04 and later, a schema file named `demo.schema` is available after installation. You can directly use it as follows:
>
> ```http
> GET /Orders
>
> B1S-Schema: demo.schema
> ```
