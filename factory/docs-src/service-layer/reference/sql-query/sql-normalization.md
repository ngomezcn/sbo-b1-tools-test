---
title: SQL normalization (table/column, alias, function)
source: pdf pp. 150-151, sec 4.8
summary: How the Service Layer normalizes table/column identifiers, aliases and function names so one SQL statement works on both Microsoft SQL Server and SAP HANA.
---

# SQL normalization (table/column, alias, function)

- [Table/Column Normalization](#tablecolumn-normalization)
- [Alias Normalization](#alias-normalization)
- [Function Normalization](#function-normalization)

Considering the gap of SQL grammar between SAP HANA and the Microsoft SQL Server, the SQL statements running on the Microsoft SQL Server cannot necessarily work on SAP HANA, and vice versa. Consequently, in most cases, the end users are expected to compose two sets of SQL, one for the Microsoft SQL Server and the other for SAP HANA. This is not developer friendly.

To overcome this problem, the Service Layer would internally parse and normalize the raw SQL identifiers based on the underlying database, so that end users would have a unified development experience.

## Table/Column Normalization

Due to database collation difference, in SAP Business One, SAP HANA is case-sensitive while the Microsoft SQL Server is not. This means that for an SQL statement on SAP HANA, any column needs to be double quoted to make a precise match to the predefined column. Otherwise, an invalid column name error will occur.

For example, the following SQL statements

```sql
select itemcode, itemName, itmsGrpCod from oitm where ItemCode > 'i01' -- raw SQL
```

would be converted to the below statements on the Microsoft SQL Server and SAP HANA respectively.

```sql
select [ItemCode], [ItemName], [ItmsGrpCod] from [OITM] where [ItemCode] > 'i01' --
normalized on Microsoft SQL Server

select "ItemCode", "ItemName", "ItmsGrpCod" from "OITM" where "ItemCode" > 'i01' --
normalized on SAP HANA
```

Even if the columns have already been enclosed with [] or "" in the raw SQL like below:

```sql
select [itemcode], [itemName], [itmsGrpCod] from [oitm] where [ItemCode] > 'i01' --
raw SQL

select "itemcode", "itemName", "itmsGrpCod" from "oitm" where "ItemCode" > 'i01' --
raw SQL
```

Service Layer is still able to do the corresponding normalization. This is mainly intended for the scenario where a SQL statement has already been normalized in the SAP HANA studio or the Microsoft SQL Server studio, and users just want to use exactly the same statement to create an SQL Query in the Service Layer.

## Alias Normalization

Both columns and tables are allowed to have an alias. While table alias normalization is not meaningful, the column alias normalization is a MUST in the SQL select clause, as it is the key name of the JSON object in the response body.

Therefore, column alias normalization is mainly to ensure that the Service Layer returns the consistent JSON content on both SAP HANA and the Microsoft SQL Server.

For example, the following SQL statements

```sql
select t1.DocEntry as Col1 , t1.DocNum as Col2 from ORDR t1 where t1.DocEntry > 0
-- raw SQL
```

would be converted to the following statements on the Microsoft SQL Server and SAP HANA respectively:

```sql
select t1.[DocEntry] as [Col1] , t1.[DocNum] as [Col2] from [ORDR] t1 where t1.
[DocEntry] > 0 -- normalized on Microsoft SQL Server

select t1."DocEntry" as "Col1" , t1."DocNum" as "Col2" from "ORDR" t1 where
t1."DocEntry" > 0 -- normalized on SAP HANA
```

Without alias normalization, on SAP HANA the column alias would be converted to uppercase by default. As a result, the actual generated SQL would be:

```sql
select t1."DocEntry" as COL1 , t1."DocNum" as COL1 from ORDR t1 where t1."DocEntry"
> 0 -- uppercase alias on SAP HANA
```

Accordingly, the key name in the response JSON object would be in uppercase and thus result in inconsistent behavior compared to the output on the Microsoft SQL Server.

## Function Normalization

Sometimes, functions with different names between SAP HANA and Microsoft SQL Server have the same functionality. One typical example is `IsNull` on Microsoft SQL Server and `IfNull` on SAP HANA. This means that the Microsoft SQL Server does not support `IfNull` and SAP HANA does not support `IsNull`. However, `IfNull` is the functional equivalent to `IsNull`.

For this case, in order to provide a uniform interface for developers, the Service Layer is designed to support both, by normalizing `IsNull` to `IfNull` on SAP HANA, and `IfNull` to `IsNull` on Microsoft SQL Server.

```sql
select DocEntry, ISNULL(comments, 'null comments') as mssqlComments,
IFNULL(Comments, 'null comments') as hanaComments from ordr -- raw SQL


select [DocEntry], ISNULL([Comments], 'null comments') as [mssqlComments],
ISNULL([Comments], 'null comments') as [hanaComments] from [ORDR] -- normalized on
Microsoft SQL Server

select "DocEntry", IFNULL("Comments", 'null comments') as "mssqlComments",
IFNULL("Comments", 'null comments') as "hanaComments" from "ORDR -- normalized on
SAP HANA
```
