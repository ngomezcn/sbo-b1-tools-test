---
title: User-defined tables (UDTs)
source: pdf pp. 90-92, sec 3.14
summary: Accessing "no object" user-defined tables as entities (U_ prefix), creating UDT metadata and fields via UserTablesMD and UserFieldsMD, and CRUD operations on UDT records.
---

# User-defined tables (UDTs)

You can directly access user-defined tables (UDTs) of "no object" type in SAP Business One 9.1 patch level 05 and later. UDTs of "no object" type are treated as simple entities that only have one main table. UDTs of "no object" type cannot be used by UDOs (UDOs use UDTs of type "master data", "master data rows", "document" or "document rows").

In the following examples, we will add UDT `"MYTBL"` of type "no object", and then service layer will expose it as an entity named `"U_MYTBL"`.

## Managing Metadata of UDTs

You can manage UDT metadata via service layer in SAP Business One 9.1 patch level 04 and later.

> **Example**
>
> **How to create UDT "MYTBL" as a "no object" table**
>
> Send the HTTP request:
>
> **Sample Code**
>
> ```http
> POST /UserTablesMD
> {
>     "TableName": "MYTBL",
>     "TableDescription": "My Table",
>     "TableType": "bott_NoObject"
> }
> ```
>
> Note that:
>
> - The table name uses capital letters. This name will be used when you get the metadata of this new table via `GET /UserTablesMD('MYTBL')`.
> - The real table in the database is `"@MYTBL"`. This name will be used when you add user-defined fields.

> **Example**
>
> **How to add fields "F1" to table "MYTBL"**
>
> Send the HTTP request to add field "F1" with type "Alphanumeric":
>
> **Sample Code**
>
> ```http
> POST /UserFieldsMD
> {
>     "Name": "F1",
>     "Type": "db_Alpha",
>     "Size": 10,
>     "Description": "Customer name",
>     "SubType": "st_None",
>     "TableName": "@MYTBL"
> }
> ```

## CRUD Operations

As with regular entities, you can perform CRUD operations on UDTs.

Service layer maps UDTs to entities by adding the prefix `"U_"`. For example, UDT `"MYTBL"` gets the entity name `"U_MYTBL"`.

> **Example**
>
> **How to create entities for UDT "MYTBL"**
>
> Send the HTTP request:
>
> ```http
> POST /U_MYTBL
> {
>     "Code":"C",
>     "Name":"CName",
>     "U_F1":"test data"
> }
> ```
>
> **How to retrieve the records of UDT "MYTBL"** (Code is the key field)
>
> Send the HTTP request:
>
> ```http
> GET /U_MYTBL('C')
> ```
>
> Or
>
> ```http
> GET /U_MYTBL(Code='C')
> ```
>
> **How to get a key list of all user orders**
>
> Send the HTTP request:
>
> ```http
> GET /U_MYTBL?$select=Code
> ```
>
> **How to get a record whose name equals 'CName'**
>
> Send the HTTP request:
>
> ```http
> GET /U_MYTBL?$filter=Name eq 'CName'
> ```
>
> **How to update the record value of "U_F1"**
>
> Send the HTTP request:
>
> ```http
> PATCH /U_MYTBL('C')
> {
>     "U_F1": "test data - updated"
> }
> ```
>
> **How to delete the record**
>
> Send the HTTP request:
>
> ```http
> DELETE /U_MYTBL('C')
> ```
