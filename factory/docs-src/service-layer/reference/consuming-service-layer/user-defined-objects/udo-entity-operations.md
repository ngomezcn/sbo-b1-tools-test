---
title: Create, Retrieve, Update, Delete, Cancel and Close UDO Entities
source: pdf pp. 96-100, sec 3.15.2, 3.15.3, 3.15.4, 3.15.5, 3.15.6
summary: CRUD operations on UDO entities (MyOrder example), queries, user-defined schemas for UDOs, and enabling and calling Cancel/Close.
---

# Create, Retrieve, Update, Delete, Cancel and Close UDO Entities

- [Creating Entity for a UDO](#creating-entity-for-a-udo)
- [Retrieving Entity for UDO](#retrieving-entity-for-udo)
- [Updating Entity for UDO](#updating-entity-for-udo)
- [Deleting Entity for UDO](#deleting-entity-for-udo)
- [Canceling/Closing Entity for UDO](#cancelingclosing-entity-for-udo)

## Creating Entity for a UDO

As with regular entities, you can perform CRUD operations on UDOs, query UDOs, create user-defined schemas based on UDOs, and so on.

To create a UDO entity, send an HTTP request to add an order with 2 items, such as:

> **Sample Code**
>
> ```http
> POST /MyOrder
> {
>     "U_CustomerName": "c1",
>     "U_DocTotal": 620,
>     "MyOrderLinesCollection": [
>         {
>             "U_ItemName": "item1",
>             "U_Price": 100,
>             "U_Quantity": 3
>         },
>         {
>             "U_ItemName": "item2",
>             "U_Price": 80,
>             "U_Quantity": 4
>         }
>     ]
> }
> ```

> **Note**
>
> The property name of the sub object collection is "{sub-object-code}Collection", for example, the sub object code is `MyOrderLines` (by default the same as the UDT name if you do not change it), so the property name is `MyOrderLinesCollection`.

On success, the server replies as the follows:

> **Output Code**
>
> ```http
> HTTP/1.1 201 Created
> {
>     "DocEntry": 10,
>     "DocNum": 2,
>     ...
>     "U_CustomerName": "c1",
>     "U_DocTotal": 620,
>     "MyOrderLinesCollection": [
>         {
>             "LineNum": 1,
>             "U_ItemName": "item1",
>             "U_Price": 100,
>             "U_Quantity": 3
>         },
>         {
>             "LineNum": 2,
>             "U_ItemName": "item2",
>             "U_Price": 80,
>             "U_Quantity": 4
>         }
>     ]
> }
> ```

When defining a schema file based on a UDO, the object name is required instead of the ID (which is the unique identifier of a UDO). As the system does not prevent you from creating a UDO with a name identical to an existing UDO or a system object, you must pay special attention to maintain the uniqueness of the UDO name. Note that URL and request contents still require the UDO ID.

## Retrieving Entity for UDO

You can get the order via a key field. `DocEntry` is the key field of the order.

```http
GET /MyOrder(10)
```

Or

```http
GET /MyOrder(DocEntry=10)
```

On success, HTTP code 200 is returned with the content of the object that is the same as the one returned by add-entity.

> **Sample Code**
>
> ```http
> HTTP/1.1 200 OK
> {
>     "DocEntry": 10,
>     ...
> }
> ```

Query options are also supported. You can get a key list of all user orders.

```http
GET /MyOrder?$select=DocEntry
```

Service returns:

> **Output Code**
>
> ```http
> HTTP/1.1 200 OK
> {
>     "value": [
>         {"DocEntry": 1},
>         {"DocEntry": 2},
>         ...
>         {"DocEntry": 13}
>     ],
> }
> ```

To get user orders with specified customer name and total money greater than 1000:

```http
GET /MyOrder?$filter=U_CustomerName eq 'c1' and U_DocTotal gt 1000
```

**User-defined schema is also supported for UDO.**

For example, you created a file named `myobj.schema` in the `conf` folder:

> **Sample Code**
>
> ```json
> {
>     "MyOrder": ["DocEntry", "U_CustomerName"],
>     "MyOrderLines": ["U_ItemName", "U_Quantity"]
> }
> ```

> **Note**
>
> - Use UDO name (not UDO code) to define the schema if the name is not the same as the code.
> - By default, the object name is the same as the object code (i.e. the unique ID), and the sub-object name is the same as the sub-object code (i.e. the user table name). You can change the object name or sub-object name during registration. Code will be used in URL and request content, and name will be used in user-defined schema.
> - UDO name may contain a space, for example, "Order Lines".

Then send the request:

> **Sample Code**
>
> ```http
> GET /MyOrder(1)
> B1S-Schema: myobj.schema
> ```

You get:

> **Sample Code**
>
> ```http
> HTTP/1.1 200 OK
> B1S-Schema: myobj.schema
> {
>     "DocEntry": 10,
>     "U_CustomerName": "c1",
>     "MyOrderLinesCollection": [
>         {
>             "U_ItemName": "item1",
>             "U_Quantity": 3
>         },
>         {
>             "U_ItemName": "item2",
>             "U_Quantity": 4
>         }
>     ]
> }
> ```

## Updating Entity for UDO

You can update the order, for example, change the quantity of item2 from 4 to 5 for this sales order. Note: U_DocTotal also needs to change as the quantity changes.

> **Sample Code**
>
> ```http
> PATCH /MyOrder(10)
> {
>     "U_DocTotal": 700,
>     "MyOrderLines": [
>         {
>             "LineNum": 2,
>             "U_Quantity": 5
>         }
>     ]
> }
> ```

On success, HTTP code 204 is returned without content.

```http
HTTP/1.1 204 No Content
```

> **Note**
>
> `PUT/PATCH/MERGE` are all supported for updating. `PATCH` and `MERGE` are the same. Refer to chapter [Updating Entities](../crud-operations.md#updating-entities) [page 27] for differences between `PATCH` and `PUT`.

## Deleting Entity for UDO

Use HTTP verb DELETE and the key fields to delete the entity.

```http
DELETE /MyOrder(10)
```

On success, HTTP code 204 is returned without content.

```http
HTTP/1.1 204 No Content
```

## Canceling/Closing Entity for UDO

By default, you are not allowed to close or cancel the UDO. To enable this, first send a patch request to `UserObjectsMD` as below:

```http
PATCH UserObjectsMD('MyOrder')

{ "CanClose": "tYES", "CanCancel": "tYES" }
```

To cancel the order,

```http
POST /MyOrder(10)/Cancel
```

To close the order,

```http
POST /MyOrder(10)/Close
```

On success, HTTP code 204 is returned without content.

```http
HTTP/1.1 204 No Content
```

The related metadata is as follows:

> **Sample Code**
>
> ```xml
> <EntitySet EntityType="SAPB1.MYORDER" Name="MyOrder"/>
> <FunctionImport IsBindable="true" Name="Cancel">
>     <Parameter Name="MYORDERParams" Type="SAPB1.MYORDER"/>
> </FunctionImport>
> <FunctionImport IsBindable="true" Name="Close">
>     <Parameter Name="MYORDERParams" Type="SAPB1.MYORDER"/>
> </FunctionImport>
> ```
