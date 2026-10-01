---
title: UDO APIs
source: pdf pp. 236-240, sec 11.5
summary: Creating a user-defined object (UDT, UDFs, UDO registration) with DI API versus Service Layer, and CRUD and query operations on a UDO entity.
---

# UDO APIs

- [Creating UDOs](#creating-udos)
- [CRUD and Query Operations](#crud-and-query-operations)

## Creating UDOs

You need to perform five steps to create an UDO. The creation process is very similar between DI API and Service Layer.

### DI API

#### Step 1: Create UDT "MyOrder" as the main table

> **Sample Code**
>
> ```csharp
> //Create UDT "MyOrder" as main table
> SAPbobsCOM.UserTablesMD udtMyOrder =
> (UserTablesMD)oCompany.GetBusinessObject(BoObjectTypes.oUserTables);
> udtMyOrder.TableName = "MyOrder";
> udtMyOrder.TableDescription = "MyOrderDesc";
> udtMyOrder.TableType = BoUTBTableType.bott_Document;
> udtMyOrder.Add();
> ```

#### Step 2: Add fields to table "MyOrder"

> **Sample Code**
>
> ```csharp
> //Add UDF CustomerName to table "MyOrder"
> SAPbobsCOM.UserFieldsMD udfCustomerName =
> (UserFieldsMD)oCompany.GetBusinessObject(BoObjectTypes.oUserFields);
> udfCustomerName.Name = "CustomerName";
> udfCustomerName.Type = BoFieldTypes.db_Alpha;
> udfCustomerName.Size = 10;
> udfCustomerName.Description = "Customer name";
> udfCustomerName.SubType = BoFldSubTypes.st_None;
> udfCustomerName.TableName = "@MYOrder";
> udfCustomerName.Add();
> //Add UDF DocTotal to table "MyOrder"
> SAPbobsCOM.UserFieldsMD udfDocTotal =
> (UserFieldsMD)oCompany.GetBusinessObject(BoObjectTypes.oUserFields);
> udfDocTotal.Name = "DocTotal";
> udfDocTotal.Type = BoFieldTypes.db_Float;
> udfDocTotal.Description = "Total amount";
> udfDocTotal.SubType = BoFldSubTypes.st_Sum;
> udfDocTotal.TableName = "@MYOrder";
> udfDocTotal.Add();
> ```

#### Step 3: Create UDT "MyOrderLines" as the child table

> **Sample Code**
>
> ```csharp
> //Create UDT "MyOrderLines" as child table
> SAPbobsCOM.UserTablesMD udtMyOrderLines =
> (UserTablesMD)oCompany.GetBusinessObject(BoObjectTypes.oUserTables);
> udtMyOrderLines.TableName = "MyOrderLines";
> udtMyOrderLines.TableDescription = "My Order lines";
> udtMyOrderLines.TableType = BoUTBTableType.bott_DocumentLines;
> udtMyOrderLines.Add();
> ```

#### Step 4: Add fields to table "MyOrderLines"

> **Sample Code**
>
> ```csharp
> //Add UDF ItemName to table "MyOrderLines"
> SAPbobsCOM.UserFieldsMD udfItemName =
> (UserFieldsMD)oCompany.GetBusinessObject(BoObjectTypes.oUserFields);
> udfItemName.Name = "ItemName";
> udfItemName.Type = BoFieldTypes.db_Alpha;
> udfItemName.Size = 10;
> udfItemName.Description = "Item name";
> udfItemName.SubType = BoFldSubTypes.st_None;
> udfItemName.TableName = "@MYOrderLINES";
> udfItemName.Add();
> //Add UDF Price to table "MyOrderLines"
> SAPbobsCOM.UserFieldsMD udfPrice =
> (UserFieldsMD)oCompany.GetBusinessObject(BoObjectTypes.oUserFields);
> udfPrice.Name = "Price";
> udfPrice.Type = BoFieldTypes.db_Float;
> udfPrice.Description = "Unit price";
> udfPrice.SubType = BoFldSubTypes.st_Price;
> udfPrice.TableName = "@MYOrderLINES";
> udfPrice.Add();
> //Add UDF Quantity to table "MyOrderLines"
> SAPbobsCOM.UserFieldsMD udfQuantity =
> (UserFieldsMD)oCompany.GetBusinessObject(BoObjectTypes.oUserFields);
> udfQuantity.Name = "Quantity";
> udfQuantity.Type = BoFieldTypes.db_Float;
> udfQuantity.Description = "Quantity";
> udfQuantity.SubType = BoFldSubTypes.st_Quantity;
> udfQuantity.TableName = "@MYOrderLINES";
> udfQuantity.Add();
> ```

#### Step 5: Register UDO "MyOrder"

> **Sample Code**
>
> ```csharp
> SAPbobsCOM.UserObjectsMD udoMyOrder =
> (UserObjectsMD)oCompany.GetBusinessObject(BoObjectTypes.oUserObjectsMD);
> udoMyOrder.Code = "MyOrders";
> udoMyOrder.Name = "MyOrder";
> udoMyOrder.TableName = "MyOrder";
> udoMyOrder.ObjectType= BoUDOObjType.boud_Document;
> udoMyOrder.ChildTables.TableName = "MyOrderLines";
> udoMyOrder.ChildTables.ObjectName = "MyOrderLines";
> udoMyOrder.ChildTables.Add();
> udoMyOrder.Add();
> ```

### Service Layer

#### Step 1: Create UDT "MyOrder" as the main table

> **Sample Code**
>
> ```http
> POST /UserTablesMD
> {
>     "TableName": "MyOrder",
>     "TableDescription": "My Orders",
>     "TableType": "bott_Document"
> }
> ```

#### Step 2: Add fields to table "MyOrder"

> **Sample Code**
>
> ```http
> POST /UserFieldsMD
> {
>     "Name": "CustomerName",
>     "Type": "db_Alpha",
>     "Size": 10,
>     "Description": "Customer name",
>     "SubType": "st_None",
>     "TableName": "@MYORDER"
> }
> POST /UserFieldsMD
> {
>     "Name": "DocTotal",
>     "Type": "db_Float",
>     "Description": "Total amount",
>     "SubType": "st_Sum",
>     "TableName": "@MYORDER"
> }
> ```

#### Step 3: Create UDT "MyOrderLines" as the child table

> **Sample Code**
>
> ```http
> POST /UserTablesMD
> {
>     "TableName": "MyOrderLines",
>     "TableDescription": "My Order lines",
>     "TableType": "bott_DocumentLines"
> }
> ```

#### Step 4: Add fields to table "MyOrderLines"

> **Sample Code**
>
> ```http
> POST /UserFieldsMD
> {
>     "Name": "ItemName",
>     "Type": "db_Alpha",
>     "Size": 10,
>     "Description": "Item name",
>     "SubType": "st_None",
>     "TableName": "@MYORDERLINES"
> }
> POST /UserFieldsMD
> {
>     "Name": "Price",
>     "Type": "db_Float",
>     "Description": "Unit price",
>     "SubType": "st_Price",
>     "TableName": "@MYORDERLINES"
> }
> POST /UserFieldsMD
> {
>     "Name": "Quantity",
>     "Type": "db_Float",
>     "Description": "Quantity",
>     "SubType": "st_Quantity",
>     "TableName": "@MYORDERLINES"
> }
> ```

#### Step 5: Register UDO "MyOrder"

> **Sample Code**
>
> ```http
> POST /UserObjectsMD
> {
>     "Code": "MyOrders",
>     "Name": "MyOrder",
>     "TableName": "MyOrder",
>     "ObjectType": "boud_Document",
>     "UserObjectMD_ChildTables": [
>         {
>             "TableName": "MyOrderLines",
>             "ObjectName": "MyOrderLines"
>         }
>     ]
> }
> ```

## CRUD and Query Operations

Once an UDO is created, you can treat it as an ordinary entity. The URL for UDO CRUD and Query operation are the same as the internal SAP Business One entities.

#### Creating UDO Entity

> **Sample Code**
>
> ```http
> POST /MyOrders
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

#### Retrieving UDO Entity

> **Sample Code**
>
> ```http
> GET /MyOrders(10)
> ```

#### Querying on UDO Entity

> **Sample Code**
>
> ```http
> GET /MyOrders?$select=U_CustomerName, U_DocTotal&$filter=U_CustomerName eq
> 'c1' and U_DocTotal gt 1000
> ```

