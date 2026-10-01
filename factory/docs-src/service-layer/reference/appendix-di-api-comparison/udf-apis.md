---
title: UDF APIs
source: pdf pp. 240-244, sec 11.6
summary: Creating, retrieving, updating and deleting UDFs, and working with entities that have UDFs, in DI API versus Service Layer.
---

# UDF APIs

- [CRUD Operations](#crud-operations)
- [Performing Operations on Entities with UDFs](#performing-operations-on-entities-with-udfs)

This section demonstrates how to create, retrieve, update, and delete UDFs of an existing entity (for example, `BusinessPartners`), and perform relevant operations on entities with the added UDFs.

## CRUD Operations

### DI API

#### Creating UDFs

> **Sample Code**
>
> ```csharp
> SAPbobsCOM.UserFieldsMD udf =
> (UserFieldsMD)oCompany.GetBusinessObject(BoObjectTypes.oUserFields);
> udf .Name = "u1";
> udf .Type = BoFieldTypes.db_Alpha;
> udf .Size = 10;
> udf .Description = "udf 1";
> udf .SubType = BoFldSubTypes.st_None;
> udf .TableName = "OCRD";
> int retCode = udf .Add();
> ```

> **Note**
>
> `OCRD` is the main table of `BusinessPartners`.

#### Retrieving UDFs

> **Sample Code**
>
> ```csharp
> SAPbobsCOM.UserFieldsMD udf =
> (UserFieldsMD)oCompany.GetBusinessObject(BoObjectTypes.oUserFields);
> string tableName = "OCRD";
> int fieldID = 0;//Assume the FieldID of the entity to retrieve is 0
> if (udf.GetByKey(tableName, fieldID))
> {
>  Console.WriteLine("Name = {0}, Description = {1}", udf.Name,
> udf.Description);
> }
> ```

> **Note**
>
> You can get the value of `fieldID` from the response of creating an UDF.
>
> The entity `UserFieldsMD` has to be retrieved with a multiple-field-composed key.

#### Updating UDFs

> **Sample Code**
>
> ```csharp
> SAPbobsCOM.UserFieldsMD udf =
> (UserFieldsMD)oCompany.GetBusinessObject(BoObjectTypes.oUserFields);
> string tableName = "OCRD";
>  int fieldID = 0;//Assume the FieldID of the entity to retrieve is 0
>  if (udf.GetByKey(tableName, fieldID))
>  {
>  udf.Description = "New Description";
>  udf.Update();
>  }
> ```

#### Deleting UDFs

> **Sample Code**
>
> ```csharp
> SAPbobsCOM.UserFieldsMD udf =
> (UserFieldsMD)oCompany.GetBusinessObject(BoObjectTypes.oUserFields);
> string tableName = "OCRD";
>  int fieldID = 0;//Assume the FieldID of the entity to retrieve is 0.
>  if (udf.GetByKey(tableName, fieldID))
>  {
>  udf.Remove();
>  }
> ```

### Service Layer

#### Creating UDFs

> **Sample Code**
>
> ```http
> POST /UserFieldsMD
> {
>     "Name": "u1",
>     "Type": "db_Alpha",
>     "Size": 10,
>     "Description": "udf 1",
>     "SubType": "st_None",
>     "TableName": "OCRD"
> }
> ```

The response is:

> **Output Code**
>
> ```http
> HTTP/1.1 201 Created
> {
>     "Name": "u1",
>     "Type": "db_Alpha",
>     "Size": 10,
>     "Description": "udf 1",
>     "SubType": "st_None",
>     "LinkedTable": null,
>     "DefaultValue": null,
>     "TableName": "OCRD",
>     "FieldID": 0,
>     "EditSize": 10,
>     "Mandatory": "tNO",
>     "LinkedUDO": null,
>     "ValidValuesMD": []
> }
> ```

#### Retrieving UDFs

> **Sample Code**
>
> ```http
> GET /UserFieldsMD(TableName='OCRD', FieldID=0)
> ```

> **Note**
>
> You can get the value of `FieldID` from the response of creating UDF.
>
> The entity `UserFieldsMD` has to be retrieved with multiple-field-composed key.

#### Updating UDFs

> **Sample Code**
>
> ```http
> PATCH /UserFieldsMD(TableName='OCRD', FieldID=0)
> {
>     "Description": "New Description",
> }
> ```

#### Deleting UDFs

> **Sample Code**
>
> ```http
> DELETE /UserFieldsMD(TableName='OCRD', FieldID=0)
> ```

## Performing Operations on Entities with UDFs

This section shows how to perform operations on entities (`BusinessPartners`) with an added UDF (`U_u1`).

### DI API

#### Creating entity with UDF

> **Sample Code**
>
> ```csharp
> SAPbobsCOM.BusinessPartners bp =
> (BusinessPartners)oCompany.GetBusinessObject(BoObjectTypes.oBusinessPartners);
> bp.CardCode = "bp_001";
> bp.CardName = "bp_001_name";
> bp.UserFields.Fields.Item(0).Value = "udf value";
> bp.Add();
> ```

> **Note**
>
> `bp.UserFields.Fields.Item(0)` refers to the UDF.

#### Retrieving entity with UDF

> **Sample Code**
>
> ```csharp
> SAPbobsCOM.BusinessPartners bp =
> (BusinessPartners)oCompany.GetBusinessObject(BoObjectTypes.oBusinessPartners);
> bool bRet = bp.GetByKey("bp_001");
> if (bRet)
> {
>  Console.WriteLine("CardCode = {0}, CardName = {1}", bp.CardCode,
> bp.CardName);
>  string udfName = bp.UserFields.Fields.Item(0).Name;
>  string udfValue = bp.UserFields.Fields.Item(0).Value;
>  Console.WriteLine("udfName = {0}, udfValue = {1}", udfName, udfValue);
> }
> ```

#### Updating entity with UDF

> **Sample Code**
>
> ```csharp
> SAPbobsCOM.BusinessPartners bp =
> (BusinessPartners)oCompany.GetBusinessObject(BoObjectTypes.oBusinessPartners);
> bool bRet = bp.GetByKey("bp_001");
> if (bRet)
> {
>  bp.UserFields.Fields.Item(0).Value = "new UDF value";
>  bp.Update();
> }
> ```

### Service Layer

Once an UDF is created, you can treat it as an ordinary property of an entity.

#### Creating entity with UDF

> **Sample Code**
>
> ```http
> POST /BusinessPartners
> {
>  "CardCode": "bp_001",
>  "CardName": "bp_001_name",
>  "U_u1": "udf value"
> }
> ```

#### Querying entity with UDF

> **Sample Code**
>
> ```http
> GET /BusinessPartners?$filter=startswith(U_u1, 'udf ')
> ```

#### Updating entity with UDF

> **Sample Code**
>
> ```http
> PATCH /BusinessPartners('bp_001')
> {
>  "CardCode": "bp_001",
>  "CardName": "bp_001_name",
>  "U_u1": "udf value"
> }
> ```
