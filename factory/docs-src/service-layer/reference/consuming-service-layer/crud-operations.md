---
title: CRUD operations on entities
source: pdf pp. 23-28, sec 3.4
summary: Creating, retrieving, updating and deleting OData entities with POST, GET, PATCH/PUT and DELETE, including entity keys and creating without response content.
---

# CRUD operations on entities

OData protocol defines a standard way to create/retrieve/update/delete (CRUD) an entity. The CRUD operations are all similar. You can refer to the API reference document for details.

## Creating Entities

Use the HTTP verb `POST` and the content of an entity to create the entity.

For most cases, the response on success is also the content of the entity.

> **Example**
>
> **How to create a customer (business partner) named "c1"**
>
> Send this HTTP request:
>
> ```http
> POST /BusinessPartners
> {
>     "CardCode": "c1",
>     "CardName": "customer c1",
>     "CardType": "cCustomer"
> }
> ```
>
> All valid fields are defined in its type - `SAPB1.BusinessPartner` in metadata section 1.2.
>
> Note that `CardType` is of type `Enumeration` (`BoCardTypes`, defined in metadata section 1.1). Both the enumeration name and value are accepted by Service Layer. So these two statements are equivalent:
>
> ```json
> {"CardType": "cCustomer",}
>
> {"CardType": "C",}
> ```
>
> On success, the server returns HTTP code `201` (Created) and the content of the entity is as follows:
>
> ```http
> HTTP/1.1 201 Created
> {
>     "CardCode": "c1",
>     "CardName": "customer c1",
>     "CardType": "cCustomer",
>     "GroupCode": 100,
>     ...
> }
> ```
>
> On error, the server returns HTTP code 4XX (for example, 400) and the error message as content is as follows (suppose customer "c1" exists):
>
> ```http
> HTTP/1.1 400 Bad Request
> {
>     "error": {
>         "code": -10,
>         "message": {
>             "lang": "en-us",
>             "value": "1320000140 - Business partner code 'c1' already
> assigned to a business partner; enter a unique business partner code"
>         }
>     }
> }
> ```

> **Example**
>
> **How to create a sales order with two document lines**
>
> The `POST` content - entity `Orders` - is of type `Document` and defined in metadata section 1.4. `DocumentLines`, known as the sub-object of sales order, is a collection of the complex type `DocumentLine`, which is defined in metadata section 1.5. In JSON format, it is an array in square brackets [].
>
> Send this HTTP request:
>
> ```http
> POST /Orders
> {
>     "CardCode": "c1",
>     "DocDate": "2014-04-01",
>     "DocDueDate": "2014-04-01",
>     "DocumentLines": [
>         {
>             "ItemCode": "i1",
>             "UnitPrice": 100,
>             "Quantity": 10,
>             "TaxCode": "T1",
>         },
>         {
>             "ItemCode": "i2",
>             "UnitPrice": 120,
>             "Quantity": 8,
>             "TaxCode": "T1",
>         },
>     ]
> }
> ```
>
> On success, the server returns `201` (Created) and the content of the entity is as follows:
>
> ```http
> HTTP/1.1 201 Created
> {
>     "DocEntry": 22,
>     "DocNum": 11,
>     "DocType": "dDocument_Items",
>     ...
>     "DocumentLines": [
>         {
>             "LineNum": 0,
>             "ItemCode": "i1",
>             ...
>         },
>         {
>             "LineNum": 1,
>             "ItemCode": "i2",
>             ...
>         }
>     ],
>     ...
> }
> ```

## Retrieving Entities

Use the HTTP verb `GET` and the key fields to retrieve the entity.

> **Example**
>
> **How to get the customer "c1" in the previous example**
>
> As defined in metadata section 1.2, `CardCode` is the key property (type is string). To retrieve the customer "c1", send the HTTP request:
>
> ```http
> GET /BusinessPartners('c1')
> ```
>
> or
>
> ```http
> GET /BusinessPartners(CardCode='c1')
> ```
>
> The service returns HTTP code `200` that indicates success with the content of the object in JSON format:
>
> ```http
> HTTP/1.1 200 OK
> {
>     "CardCode": "c1",
>     "CardName": "customer c1",
>     "CardType": "cCustomer",
>     "GroupCode": 100,
>     ...
> }
> ```

> **Example**
>
> **How to get the sales order in the previous example**
>
> As defined in metadata section 1.4, `DocEntry` is the key property (type is Int32). To retrieve the sales order, send the HTTP request:
>
> ```http
> GET /Orders(22)
> ```
>
> or
>
> ```http
> GET Orders(DocEntry=22)
> ```

> **Note**
>
> Single quotes are required for string values such as 'c1', and no single quotes around integer values such as 22.
>
> If the entity key contains multiple properties, send the HTTP request:
>
> ```http
> GET /SalesTaxAuthorities(Code='AK',Type=-3)
> ```

## Updating Entities

Use the HTTP verb `PATCH` or `PUT` to update the entity. Generally, `PATCH` is recommended.

The difference between `PATCH` and `PUT` is that `PATCH` ignores (keeps the value) those properties that are not given in the request, while `PUT` sets them to the default value or to null.

> **Example**
>
> **How to update the name of the customer "c1"**
>
> Send the HTTP request:
>
> ```http
> PATCH /BusinessPartners('c1')
> {
>     "CardName": "Updated customer name"
> }
> ```
>
> On success, HTTP code `204` is returned without content.
>
> ```http
> HTTP/1.1 204 No Content
> ```

> **Note**
>
> Read-only properties (for example, `CardCode`) cannot be updated. They are ignored silently if assigned in the request.

## Deleting Entities

Use the HTTP verb `DELETE` and the key fields to delete the entity.

> **Example**
>
> **How to delete the customer "c1"**
>
> Send the HTTP request:
>
> ```http
> DELETE /BusinessPartners('c1')
> ```
>
> On success, HTTP code `204` is returned without content.
>
> ```http
> HTTP/1.1 204 No Content
> ```

> **Note**
>
> You cannot delete the sales order in SAP Business One. If you try to delete the sales order No.22:
>
> ```http
> DELETE /Orders(22)
> ```
>
> An error is reported to deny the operation:
>
> ```http
> HTTP/1.1 400 Bad Request
> {
>     "error": {
>         "code": -5006,
>         "message": {
>             "lang": "en-us",
>             "value": "The requested action is not supported for this object."
>         }
>     }
> }
> ```

## Create Entity with No Content

Considering the fact that returning all the entity content on creating one entity may be not suitable for the high performance demanding scenario, Service Layer provides a way to respond no content by specifying a special header `Prefer` with the value `return-no-content`. For example:

```http
POST /b1s/v1/Items HTTP/1.1
Prefer: return-no-content
{
    "ItemCode": "i011"
}
```

On success, HTTP code `204` is returned without content, instead of having the usual `201` resource created.

```http
HTTP/1.1 204 No Content
Location: /b1s/v1/Items('i011')
Preference-Applied: return-no-content
```

> **Note**
>
> Response header includes `Preference-Applied` to confirm that the server accepts this preference option.
>
> The URI of the created resource is in the `Location` header.
