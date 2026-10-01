---
title: List with paging
source: pdf pp. 144-145, sec 4.4
summary: Server-side paging of the List function, changing the page size with the Prefer header, and the resulting response and underlying SQL.
---

# List with paging

The paging mechanism on the server side is a MUST for the `List` function of entity SQLQueries, as it can protect the server resource from exhausting in case there are millions of records returned in one roundtrip, or in the case of a careless user joining multiple big tables without applying filtering conditions.

However, for the purpose of flexibility, the Service Layer allows clients to change the default paging size by specifying the following request header:

```text
Prefer: odata.maxpagesize=<Your preferred page size>
```

For example, such a request with page size = 5,

```http
GET https://server:50000/b1s/v1/SQLQueries('sql0001')/List HTTP/1.1

Prefer: odata.maxpagesize=5

Content-Type: application/json; charset=UTF-8
```

would result in the following response, in which the next page link is indicated by the field `odata.nextLink`.

> **Output Code**
>
> ```http
> HTTP/1.1 200 OK
> Preference-Applied: odata.maxpagesize=5
> Content-Type: application/json;odata=minimalmetadata;charset=utf-8
> {
>     "odata.metadata" : "https://
> server:50000/b1s/v1/$metadata#SAPB1.SQLQueryResult",
>     "SqlText" : "SELECT [ItemCode], lower([ItemCode]) as [lowerItemCode],
> upper([ItemCode]) as [upperItemCode] FROM [OITM]",
>     "value" : [
>         {
>             "ItemCode" : "i001",
>             "lowerItemCode" : "i001",
>             "upperItemCode" : "I001"
>         },
>         {
>             "ItemCode" : "i002",
>             "lowerItemCode" : "i002",
>             "upperItemCode" : "I002"
>         },
>         {
>             "ItemCode" : "i003",
>             "lowerItemCode" : "i003",
>             "upperItemCode" : "I003"
>         },
>         {
>             "ItemCode" : "i004",
>             "lowerItemCode" : "i004",
>             "upperItemCode" : "I004"
>         },
>         {
>             "ItemCode" : "i005",
>             "lowerItemCode" : "i005",
>             "upperItemCode" : "I005"
>         }
>     ],
> "odata.nextLink" : "SQLQueries('sql0001')/List?&$skip=5"
> }
> ```

The underlying SQL on Microsoft SQL and SAP HANA is:

```sql
SELECT * FROM (SELECT [ItemCode], lower([ItemCode]) as [lowerItemCode],
upper([ItemCode]) as [upperItemCode] FROM [OITM])B1S_DUMMY_TABLE ORDER BY
CURRENT_TIMESTAMP OFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY --for Microsoft SQL

SELECT "ItemCode", lower("ItemCode") as "lowerItemCode", upper("ItemCode") as
"upperItemCode" FROM "OITM" LIMIT 5 OFFSET 0 --for SAP HANA
```
