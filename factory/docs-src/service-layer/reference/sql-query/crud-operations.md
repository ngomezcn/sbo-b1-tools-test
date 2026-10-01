---
title: CRUD operations on SQLQuery entities
source: pdf pp. 141-143, sec 4.2
summary: Create, retrieve by key, patch, delete and retrieve-all requests and responses for SQLQuery entities.
---

# CRUD operations on SQLQuery entities

`SQLQuery` is allowed to perform the basic CRUD operations. In the following sections, you can find some examples of how to do these operations on the Microsoft SQL Server, which are very similar as on SAP HANA.

## Create

**Request**

```http
POST https://server:50000/b1s/v1/SQLQueries HTTP/1.1
{
    "SqlCode": "sql04",
    "SqlName": "queryOnItem",
    "SqlText": "select ItemCode, ItemName, ItmsGrpCod from oitm"
}
```

**Response**

```http
HTTP/1.1 201 Created
{
    "odata.metadata" : "https://server:50000/b1s/v1/$metadata#SQLQueries/
@Element",
    "odata.etag" : "W/\"44486B13CDA82E54A31194A3588857803F9D1E57\"",
    "SqlCode" : "sql04",
    "SqlName" : "queryOnItem",
    "SqlText" : "select [ItemCode], [ItemName], [ItmsGrpCod] from [OITM]",
    "ParamList" : null,
    "CreateDate" : "2020-10-08",
    "UpdateDate" : "2020-10-08"
}
```

## Retrieve by Key

**Request**

```http
GET https://server:50000/b1s/v1/SQLQueries('sql04') HTTP/1.1
```

**Response**

```http
HTTP/1.1 200 OK
{
    "odata.metadata" : "https://server:50000/b1s/v1/$metadata#SQLQueries/
@Element",
    "odata.etag" : "W/\"44486B13CDA82E54A31194A3588857803F9D1E57\"",
    "SqlCode" : "sql04",
    "SqlName" : "queryOnItem",
    "SqlText" : "select [ItemCode], [ItemName], [ItmsGrpCod] from [OITM]",
    "ParamList" : null,
    "CreateDate" : "2020-10-08",
    "UpdateDate" : "2020-10-08"
}
```

## Patch

**Request**

```http
PATCH https://server:50000/b1s/v1/SQLQueries('sql04') HTTP/1.1
{
    "SqlName": "queryOnItem",
    "SqlText": "select ItemCode, ItemName from oitm"
}
```

**Response**

```http
HTTP/1.1 204 No Content
```

## Delete

**Request**

```http
DELETE https://server:50000/b1s/v1/SQLQueries('sql04') HTTP/1.1
```

**Response**

```http
HTTP/1.1 204 No Content
```

## Retrieve All

As with the other entities, the paging mechanism takes effect in this case to avoid potential resource issues on the server side.

**Request**

```http
GET https://server:50000/b1s/v1/SQLQueries HTTP/1.1
Prefer: odata.maxpagesize=5
Content-Type: application/json; charset=UTF-8
```

**Response**

```http
HTTP/1.1 200 OK
Preference-Applied: odata.maxpagesize=5
Content-Type: application/json;odata=minimalmetadata;charset=utf-8
{
    "odata.metadata": "https://server:50001/b1s/v1/$metadata#SQLQueries",
    "value": [
        {
            "SqlCode": "sql01",
            "SqlName": "queryOnOrder",
            "SqlText": "select [DocEntry], [DocTotal], [DocDate], [Comments]
from [ORDR] where [DocTotal] > :docTotal",
            "ParamList": "docTotal",
            "CreateDate": "2020-10-08",
            "UpdateDate": "2020-10-08"
        },
        {
            "SqlCode": "sql02",
            "SqlName": "queryOnOrder",
            "SqlText": "select [DocEntry], [DocType] from [ORDR] t1 where not
exists(select t2.[DocEntry] from [RDR1] t2 where t1.[DocEntry] = t2.[DocEntry])",
            "ParamList": null,
            "CreateDate": "2020-10-08",
            "UpdateDate": "2020-10-08"
        },
        {
            "SqlCode": "sql03",
            "SqlName": "queryOnOrder",
            "SqlText": "select [DocEntry] from [ORDR] t1 where [DocEntry] in
(select t2.[DocEntry] from [RDR1] t2) or [DocEntry] not in (select t2.[DocEntry]
from [INV1] t2)",
            "ParamList": null,
            "CreateDate": "2020-10-08",
            "UpdateDate": "2020-10-08"
        },
        {
            "SqlCode": "sql04",
            "SqlName": "queryOnOrder",
            "SqlText": "select [DocEntry], [DocType] from [ORDR] t1 where
[DocEntry] is not null and t1.[Comments] is null",
            "ParamList": null,
            "CreateDate": "2020-10-08",
            "UpdateDate": "2020-10-08"
        },
        {
            "SqlCode": "sql06",
            "SqlName": "queryOnItem",
            "SqlText": "select [DocEntry] from [ORDR] where [CreateDate] !=
'2020-10-03'",
            "ParamList": null,
            "CreateDate": "2020-10-08",
            "UpdateDate": "2020-10-08"
        }
    ],
    "odata.nextLink": "SQLQueries?$skip=5"
}
```
