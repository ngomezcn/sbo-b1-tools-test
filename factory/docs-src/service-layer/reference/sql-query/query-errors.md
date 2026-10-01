---
title: Query Errors and Exceptions
source: pdf pp. 153-157, sec 4.10
summary: The error categories the Service Layer returns for SQL queries (allowlist, grammar, unsupported keywords, duplicate aliases, computed columns, select *, DML), with request and response samples.
---

# Query Errors and Exceptions

- [Table or Column not in Allowlist](#table-or-column-not-in-allowlist)
- [SQL Grammar Error](#sql-grammar-error)
- [SQL Keyword/Symbol Not Supported](#sql-keywordsymbol-not-supported)
- [Multiple Identical Aliases](#multiple-identical-aliases)
- [Computed Columns Without Alias](#computed-columns-without-alias)
- [Select All Columns from One Table](#select-all-columns-from-one-table)
- [SQL DML](#sql-dml)

To pursue the highest levels of flexibility and convenience, the Service Layer allows users to input the raw SQL, which is extremely error prone. As such, the Service Layer should be capable of handling various sorts of errors and exceptions.

The following sections provide a summary of the error categories.

## Table or Column not in Allowlist

**Request**

> **Sample Code**
>
> ```http
> POST https://server:50000/b1s/v1/SQLQueries HTTP/1.1
> {
>     "SqlCode": "sql06",
>     "SqlName": "queryOnItem",
>     "SqlText": "select CardCode from OCRD t1 where exists(select 1 from CRD2
> t2 where t1.CardCode = t2.CardCode)"
> }
> ```

**Response**

> **Output Code**
>
> ```http
> HTTP/1.1 400 Bad Request
> {
>     "error" : {
>         "code" : 702,
>         "message" : {
>             "lang" : "en-us",
>             "value" : "Table 'CRD2' not accessible"
>         }
>     }
> }
> ```

## SQL Grammar Error

**Request**

> **Sample Code**
>
> ```http
> POST https://server:50000/b1s/v1/SQLQueries HTTP/1.1
> {
>     "SqlCode": "sql01",
>     "SqlName": "queryOnOrder",
>     "SqlText": "select DocEntry from ordr t1 order by DocEntry dsc"
> }
> ```

**Response**

> **Output Code**
>
> ```http
> HTTP/1.1 400 Bad Request
> {
>     "error": {
>         "code": 701,
>         "message": {
>             "lang": "en-us",
>             "value": "Invalid SQL syntax:select DocEntry from ordr t1 order
> by DocEntry dsc, line 1, character position 47, Incorrect syntax near 'dsc'."
>         }
>     }
> }
> ```

## SQL Keyword/Symbol Not Supported

**Request**

> **Sample Code**
>
> ```http
> POST https://server:50000/b1s/v1/SQLQueries HTTP/1.1
> {
>     "SqlCode": "sql01",
>     "SqlName": "queryOnOrder",
>     "SqlText": "select \"ItemCode\", length(\"ItemCode\")as lenItemCode from
> oitm"
> }
> ```

**Response**

> **Output Code**
>
> ```http
> HTTP/1.1 400 Bad Request
> {
>     "error": {
>         "code": 701,
>         "message": {
>             "lang": "en-us",
>             "value": "Invalid SQL syntax:select \"ItemCode\",
> length(\"ItemCode\")as lenItemCode from oitm, line 1, character position 19,
> Cannot support this function or expression: 'length'"
>         }
>     }
> }
> ```

## Multiple Identical Aliases

As JSON does no allow multiple fields with the same name, two or more columns with the same alias in the select list are not supported.

**Request**

> **Sample Code**
>
> ```http
> POST https://server:50000/b1s/v1/SQLQueries HTTP/1.1
> {
>     "SqlCode": "sql0002",
>     "SqlName": "query002",
>     "SqlText": "select max(itemCode) as min_itemCode, min(itemCode) as
> min_itemCode from OITM"
> }
> ```

**Response**

> **Output Code**
>
> ```http
> HTTP/1.1 400 Bad Request
> {
>     "error" : {
>         "code" : 701,
>         "message" : {
>             "lang" : "en-us",
>             "value" : "Invalid SQL syntax:select max(itemCode) as
> min_itemCode, min(itemCode) as min_itemCode from OITM, line 1, character
> position 55, Multiple name for column or column alias 'min_itemCode', please
> specify it with a different alias."
>         }
>     }
> }
> ```

## Computed Columns Without Alias

For this case, the SQL query author needs to specify a unique alias for the computed columns, so that the Service Layer would know how to format the output payload.

## Select All Columns from One Table

In most cases, selecting all the columns from one table is not necessary, and in some situations, this could possibly compromise data sensitivity and result in performance issues. Therefore, by design, the Service Layer does not allow you to use select *.

**Request**

> **Sample Code**
>
> ```http
> POST https://server:50000/b1s/v1/SQLQueries HTTP/1.1
> {
>     "SqlCode": "sql01",
>     "SqlName": "queryOnOrder",
>     "SqlText": "select * from ORDR"
> }
> ```

**Response**

> **Output Code**
>
> ```http
> HTTP/1.1 400 Bad Request
> {
>     "error": {
>         "code": 701,
>         "message": {
>             "lang": "en-us",
>             "value": "Invalid SQL syntax: select * from ORDR, line 1,
> character position 7, Cannot support asterisk(*) in select list."
>         }
>     }
> }
> ```

However, if the select * is in the sub query, like the below example, it is allowed.

```sql
select DocEntry, DocType from ordr t1 where exists (select * from rdr1 t2 where
t1.DocEntry = t2.DocEntry)
```

## SQL DML

All the DML statements, for example, update, alter, insert, delete, etc, are not permitted to run.

**Request**

> **Sample Code**
>
> ```http
> POST https://server:50000/b1s/v1/SQLQueries HTTP/1.1
> {
>     "SqlCode": "sql01",
>     "SqlName": "queryOnOrder",
>     "SqlText": "update ORDR set Comments = '1234'"
> }
> ```

**Response**

> **Output Code**
>
> ```http
> HTTP/1.1 400 Bad Request
> {
>     "error": {
>         "code": 701,
>         "message": {
>             "lang": "en-us",
>             "value": "Invalid SQL syntax:, line 1, character position 0,
> mismatched input 'update' expecting {SELECT, '('}"
>         }
>     }
> }
> ```
