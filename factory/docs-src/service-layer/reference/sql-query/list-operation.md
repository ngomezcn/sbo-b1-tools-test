---
title: List operation (running a stored query)
source: pdf pp. 143-144, sec 4.3
summary: How the bound List function runs the query stored in a SQLQuery entity, and the shape of the JSON result.
---

# List operation (running a stored query)

The `List` function is a bounded function to run the query represented by a specific `SQLQuery`. Once an `SQLQuery` entity is created, the `List` function can be invoked in the following way with the verb `GET` or `POST`:

Upon success, the service returns a JSON payload, containing the exact columns in the SQL select clause.

> **Output Code**
>
> ```http
> HTTP/1.1 200 OK
> {
>     "odata.metadata" : "https://
> server:50000/b1s/v1/$metadata#SAPB1.SQLQueryResult",
>     "SqlText" : "select [ItemCode], [ItemName], [ItmsGrpCod] from [OITM]",
>     "value" : [
>         {
>             "ItemCode" : "i001",
>             "ItemName" : "i001",
>             "ItmsGrpCod" : 100
>         },
>         {
>             "ItemCode" : "i002",
>             "ItemName" : "i002",
>             "ItmsGrpCod" : 100
>         },
>         {
>             "ItemCode" : "i003",
>             "ItemName" : "i003",
>             "ItmsGrpCod" : 100
>         },
>         {
>             "ItemCode" : "i004",
>             "ItemName" : "i004",
>             "ItmsGrpCod" : 100
>         },
>         {
>             "ItemCode" : "i005",
>             "ItemName" : "i005",
>             "ItmsGrpCod" : 100
>         },
>         ...
>     ]
> }
> ```
