---
title: Column allowlist
source: pdf pp. 147-148, sec 4.5.2
summary: How to restrict queryable columns of allowlisted tables with ColumnExcludeList and ColumnIncludeList, with an example and the resulting error.
---

# Column allowlist

By default, all columns in the allowlist tables are accessible. To further control accessibility, you can define the column allowlist for the above tables. For more stringent security requirements, you may want to only allow queries on the defined columns, rather than on all the columns in the table.

For example, assume the list is:

> **Sample Code**
>
> ```json
> {
>     "TableList": [
>         "ADM1",
>         "ORDR",
>         "CINF"
>     ],
>     "ColumnExcludeList": {
>         "ORDR": [
>             "CreateDate",
>             "UpdateDate"
>         ],
>         "CINF": [
>             "Algo",
>             "AliasUpd",
>             "TrailDays"
>         ]
>     },
>     "ColumnIncludeList": {
>         "ADM1": [
>             "CurrPeriod",
>             "Street"
>         ]
>     }
> }
> ```

Attempting to access the columns defined in `ColumnExcludeList` in the following request,

> **Sample Code**
>
> ```http
> POST https://server:50000/b1s/v1/SQLQueries HTTP/1.1
> {
>     "SqlCode": "sql06",
>     "SqlName": "queryOnItem",
>     "SqlText": "select Version, Algo from CINF"
> }
> ```

would result in the following error:

> **Output Code**
>
> ```http
> HTTP/1.1 400 Bad Request
> {
>     "error" : {
>         "code" : 703,
>         "message" : {
>             "lang" : "en-us",
>             "value" : "Column 'Algo' from table 'CINF' not accessible"
>         }
>     }
> }
> ```

> **Note**
>
> Please ensure the table names or column names are in the same letter-case as they are defined in the database.
