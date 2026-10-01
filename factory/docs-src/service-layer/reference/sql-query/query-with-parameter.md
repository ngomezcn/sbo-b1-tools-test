---
title: Query with parameters
source: pdf pp. 151-153, sec 4.9
summary: Creating an SQL query with named parameter placeholders (:name) and running it with POST or GET, including multiple parameters.
---

# Query with parameters

Like ODBC or JDBC, in the Service Layer, it is allowed to create a query with parameter placeholders, and then execute the query by specifying the parameter value. A colon mark (:) is used to define a named parameter, binding it to a specific column.

For example, send such a request to create a parametrized query:

> **Sample Code**
>
> ```http
> POST https://server:50000/b1s/v1/SQLQueries HTTP/1.1
> {
>     "SqlCode": "sql01",
>     "SqlName": "queryOnOrder",
>     "SqlText": "select DocEntry, DocTotal, DocDate, comments from ordr where
> DocTotal > :docTotal"
> }
> ```

On success, service returns:

> **Output Code**
>
> ```http
> HTTP/1.1 201 Created
> {
>     "odata.metadata" : "https://server:50000/b1s/v1/$metadata#SQLQueries/
> @Element",
>     "odata.etag" : "W/\"44486B13CDA82E54A31194A3588857803F9D1E57\"",
>     "SqlCode" : "sql01",
>     "SqlName" : "queryOnOrder",
>     "SqlText" : "select [DocEntry], [DocTotal], [DocDate], [Comments] from
> [ORDR] where [DocTotal] > :docTotal",
>     "ParamList" : "docTotal",
>     "CreateDate" : "2020-10-08",
>     "UpdateDate" : "2020-10-08"
> }
> ```

To run the query, there are two ways in the Service Layer: one is to set a payload using `POST` and the other is to specify a query parameter using `GET`.

- By POST

> **Sample Code**
>
> ```http
> POST https://server:50000/b1s/v1/SQLQueries('sql01')/List HTTP/1.1
> {
>     "ParamList": "docTotal=10.1"
> }
> ```

- By GET

> **Sample Code**
>
> ```http
> GET https://server:50000/b1s/v1/SQLQueries('sql07')/List?docTotal=10.1
> HTTP/1.1
> ```

The query result is:

> **Output Code**
>
> ```http
> HTTP/1.1 200 OK
> {
>     "odata.metadata" : "https://
> server:50000/b1s/v1/$metadata#SAPB1.SQLQueryResult",
>     "SqlText" : "select [DocEntry], [DocTotal], [DocDate], [Comments] from
> [ORDR] where [DocTotal] > :docTotal",
>     "value" : [
>         {
>             "Comments" : "",
>             "DocDate" : "20201007",
>             "DocEntry" : 1,
>             "DocTotal" : 2000.0
>         },
>         {
>             "Comments" : "",
>             "DocDate" : "20201007",
>             "DocEntry" : 2,
>             "DocTotal" : 2000.0
>         },
>         {
>             "Comments" : "",
>             "DocDate" : "20201007",
>             "DocEntry" : 3,
>             "DocTotal" : 2000.0
>         },
>         {
>             "Comments" : "",
>             "DocDate" : "20201007",
>             "DocEntry" : 4,
>             "DocTotal" : 2000.0
>         },
>         {
>             "Comments" : "",
>             "DocDate" : "20201007",
>             "DocEntry" : 5,
>             "DocTotal" : 2000.0
>         }
>     ],
>     "odata.nextLink" : "SQLQueries('sql01')/List?docTotal=10.1&$skip=5"
> }
> ```

If there is more than one parameter, the parameters should be separated by &, like below:

```text
stringParam1='val1'&integerParam2=val2
```
