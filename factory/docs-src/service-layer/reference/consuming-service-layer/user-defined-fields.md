---
title: User-defined fields (UDFs)
source: pdf pp. 86-90, sec 3.13
summary: Working with user-defined fields: managing UDF metadata through UserFieldsMD (create, retrieve, query, update, delete) and using UDFs in CRUD operations and queries on regular entities.
---

# User-defined fields (UDFs)

In SAP Business One 9.1 patch level 04 and earlier, user-defined fields (UDFs) are treated as dynamic properties of an OData entity. An entity that has a dynamic property is of "open type", that is, in the `EntityType` XML node in metadata, it has the attribute `OpenType=true`.

As of SAP Business One 9.1 patch level PL04, you can manage the metadata of UDFs and perform CRUD operations on UDFs as on regular entities.

As of SAP Business One 9.1 patch level PL05, UDFs appear in the entity definition in metadata.

> **Note**
>
> All UDFs in SAP Business One are prefixed with "U_".

## Managing Metadata of UDFs

This feature is available in SAP Business One 9.1 patch level 04 and later.

You can perform CRUD operations on UDFs as on regular entities. However, you must be aware that DDL operations on tables can be expensive in the database if the tables are referenced by many objects (for example, procedures, functions, and views). It may take longer than expected to create or delete UDFs, especially in marketing documents.

### Creating UDFs

Use the `POST` method to create a UDF. For example, to create a UDF named "u1" on table `OCRD` (business partner master data), send the following HTTP request:

```http
POST /UserFieldsMD
{
    "Name": "u1",
    "Type": "db_Alpha",
    "Size": 10,
    "Description": "udf 1",
    "SubType": "st_None",
    "TableName": "OCRD"
}
```

The service returns:

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

For data consistency, when you create a UDF on a particular table, the UDF is automatically created on other related tables. In the example above, in addition to `OCRD`, the UDF "u1" is also created on table `ACRD` (the archive table for the Business Partner object). If you create a UDF on a sales order row table `RDR1`, the UDF is automatically created on all marketing document line tables (for example, purchase order rows -`POR1`, delivery rows - `DLN1`, invoice rows - `INV1`) as well as the archive table for document rows `ADO1`.

For more information, see [Creating Entities](crud-operations.md#creating-entities) [page 24].

### Retrieving UDFs

To retrieve a UDF, send an HTTP request as the example below:

```http
GET /UserFieldsMD(TableName='OCRD', FieldID=0)
```

For more information, see [Retrieving Entities](crud-operations.md#retrieving-entities) [page 26].

### Querying UDFs

Standard OData query options are also supported for UDFs. For example, you've forgotten the table name and the UDF ID but still remember the UDF name; you can query the UDF as follows:

```http
GET /UserFieldsMD?$filter=Name eq 'u1'
```

The service returns:

> **Output Code**
>
> ```json
> {
>     "value": [
>         {
>             "Name": "u1",
>             "TableName": "ACRD",
>             "FieldID": 0,
>             ...
>             ...
>         },
>         {
>             "Name": "u1",
>             "TableName": "OCRD",
>             "FieldID": 0,
>             ...
>         }
>     ]
> }
> ```

From the response above, you can see that in addition to table `OCRD`, UDF "u1" has also been created on table `ACRD`.

For more information, see [Query Options](query-options/options-reference.md) [page 31].

### Updating UDFs

To change the description and size of a UDF, send an HTTP request as the example below:

> **Sample Code**
>
> ```http
> PATCH /UserFieldsMD(TableName='OCRD', FieldID=0)
> {
>     "EditSize": 20,
>     "Description": "Internal Id",
> }
> ```

> **Note**
>
> You cannot change such properties as the file type (`Type`).

For more information, see [Updating Entities](crud-operations.md#updating-entities) [page 27].

### Deleting UDFs

To delete a UDF, send an HTTP request as the example below:

```http
DELETE /UserFieldsMD(TableName='OCRD', FieldID=0)
```

## CRUD Operations

As with regular entities, you can perform CRUD operations on UDFs, query UDFs, and so on.

> **Example**
>
> **How to add Business Partners with a UDF "U_BPSpecRemarks"**
>
> Send the HTTP request:
>
> **Sample Code**
>
> ```http
> POST /BusinessPartners
> {
>     "CardCode": "bpudf_004",
>     ...
>     "U_BPSpecRemarks": "First Business Partners with UDF remarks added by
> Chrome."
> }
> ```
>
> The service returns:
>
> **Output Code**
>
> ```http
> HTTP/1.1 200 OK
> {
>     "CardCode": "bpudf_004",
>     ...
>     "U_BPSpecRemarks": "First Business Partners with UDF remarks added by
> Chrome.",
>     ...
> }
> ```

> **Example**
>
> **How to query entities using UDFs**
>
> Send the HTTP request:
>
> ```http
> GET /BusinessPartners?$filter=startswith(U_BPSpecRemarks, 'First')
> ```
>
> The service returns:
>
> **Output Code**
>
> ```http
> HTTP/1.1 200 OK
> {
>     "value": [
>         {
>             "CardCode": "bpudf_001",
>             ...
>             "U_BPSpecRemarks": "First Business Partners with UDF remarks.",
>         },
>         {
>             "CardCode": "bpudf_003",
>             ...
>             "U_BPSpecRemarks": "First Business Partners with UDF remarks
> added by Chrome.",
>         },
>         ...
>     ]
> }
> ```
