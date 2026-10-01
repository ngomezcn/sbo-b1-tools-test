---
title: Managing Metadata of UDOs
source: pdf pp. 92-96, sec 3.15.1
summary: Step-by-step creation of a UDO through Service Layer metadata entities (UserTablesMD, UserFieldsMD, UserObjectsMD, UserKeysMD), using the MyOrder example.
---

# Managing Metadata of UDOs

This feature is available in SAP Business One 9.1 patch level 04 and later.

Service Layer requires the same procedure to create a UDO as in the SAP Business One client application or via the DI API. The following procedure illustrates how to create a UDO `MyOrder` with the following definition:

<!-- table: t093-01 -->
| Main Table / Child Table | UDT | UDF | Type |
|---|---|---|---|
| Main Table | `MyOrder` |  | `Document` |
|  |  | `CustomerName` | `Alphanumeric` |
|  |  | `DocTotal` | `Units and Totals / Amount` |
| Child Table | `MyOrderLines` |  | `Document Rows` |
|  |  | `ItemName` | `Alphanumeric` |
|  |  | `Price` | `Units and Totals / Price` |
|  |  | `Quantity` | `Units and Totals / Quantity` |

**Procedure**

1. To create the main table `MyOrder`, send the following HTTP request:

```http
POST /UserTablesMD
{
    "TableName": "MyOrder",
    "TableDescription": "My Orders",
    "TableType": "bott_Document"
}
```

The service returns:

```http
HTTP/1.1 201 Created
{
    "TableName": "MYORDER",
    "TableDescription": "My Orders",
    "TableType": "bott_Document",
    "Archivable": "tNO",
    ...
}
```

> **Note**
>
> The name is the unique identifier for a UDT and undergoes the following automatic changes after its creation:
>
> - A prefix "@" is added to the name.
> - The name is converted to the upper case.
>
> For example, if you define a UDT name as `MyOrder`, the actual UDT name in the database is `@MYORDER`.
>
> To obtain the metadata of this table, send the HTTP request:
>
> ```http
> GET /UserTablesMD('MYORDER')
> ```

2. Add UDFs to table `MyOrder`.
    1. To create field `CustomerName`, send the following HTTP request:

```http
POST /UserFieldsMD
{
    "Name": "CustomerName",
    "Type": "db_Alpha",
    "Size": 10,
    "Description": "Customer Name",
    "SubType": "st_None",
    "TableName": "@MYORDER"
}
```

    2. To create field `DocTotal`, send the following HTTP request:

```http
POST /UserFieldsMD
{
    "Name": "DocTotal",
    "Type": "db_Float",
    "Description": "Total Amount",
    "SubType": "st_Sum",
    "TableName": "@MYORDER"
}
```

3. To create the child table `MyOrderLines`, send the following HTTP request:

```http
POST /UserTablesMD
{
    "TableName": "MyOrderLines",
    "TableDescription": "My Order Lines",
    "TableType": "bott_DocumentLines"
}
```

As with the main table, the actual name of this table is `@MYORDERLINES`.

4. Add UDFs to table `MyOrderLines`.
    1. To create field `ItemName`, send the following HTTP request:

```http
POST /UserFieldsMD
{
    "Name": "ItemName",
    "Type": "db_Alpha",
    "Size": 10,
    "Description": "Item name",
    "SubType": "st_None",
    "TableName": "@MYORDERLINES"
}
```

    2. To create field `Price`, send the following HTTP request:

```http
POST /UserFieldsMD
{
    "Name": "Price",
    "Type": "db_Float",
    "Description": "Unit Price",
    "SubType": "st_Price",
    "TableName": "@MYORDERLINES"
}
```

    3. To create field `Quantity`, send the following HTTP request:

```http
POST /UserFieldsMD
{
    "Name": "Quantity",
    "Type": "db_Float",
    "Description": "Quantity",
    "SubType": "st_Quantity",
    "TableName": "@MYORDERLINES"
}
```

5. To register UDO `MyOrder`, send the following HTTP request:

```http
POST /UserObjectsMD
{
    "Code": "MyOrder",
    "Name": "My Orders",
    "TableName": "MyOrder",
    "ObjectType": "boud_Document",
    "UserObjectMD_ChildTables": [
        {
            "TableName": "MyOrderLines",
            "ObjectName": "MyOrderLines"
        }
    ]
}
```

> **Note**
>
> The property name of a subobject collection is "<Subobject Code>Collection" and the UDT code is, by default, the same as the UDT name. Therefore, if you intend to use a UDT as a child table for a UDO and the UDT name (`TableName`) contains spaces, we recommend that you change the UDT code (`ObjectName`) during the registration. For example, if a UDT code is `My Order Lines`, the corresponding property name would be `My Order LineCollection`.

## Adding User Keys

You can add user keys to user-defined tables. For example, to create a unique key on column `CustomerName`, send the following HTTP request:

```http
POST /UserKeysMD
{
    "TableName": "@MYORDER",
    "KeyIndex": "1",
    "KeyName": "IX_0",
    "Unique": "tYES",
    "UserKeysMD_Elements": [
        {
            "ColumnAlias": "CustomerName"
        }
    ]
}
```

The service returns:

> **Output Code**
>
> ```json
> {
>     "TableName": "@MYORDER",
>     "KeyIndex": "0",
>     "KeyName": "IX_0",
>     "Unique": "tYES",
>     "UserKeysMD_Elements": [
>         {
>             "SubKeyIndex": "0",
>             "ColumnAlias": "CustomerName"
>         },
>     ]
> }
> ```

To get the metadata of this key, send the following HTTP request:

```http
GET /UserKeysMD(TableName='@MYORDER', KeyIndex=0)
```
