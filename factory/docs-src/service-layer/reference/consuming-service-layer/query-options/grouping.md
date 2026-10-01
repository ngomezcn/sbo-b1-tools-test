---
title: Grouping
source: pdf pp. 40-42, sec 3.6.8
summary: Grouping with $apply and groupby, optionally combined with aggregation methods and a filter, with requests, responses and equivalent SQL.
---

# Grouping

Grouping behavior is triggered using the query option `apply` and the `groupby` keyword. This keyword specifies the grouping properties, a comma-separated list of one or more single-valued property paths that is enclosed in parentheses. The same property path should not appear more than once; redundant property paths may be considered valid, but must not alter the meaning of the request.

> **Note**
>
> As of SAP Business One 9.2 PL03, version for SAP HANA, grouping is supported.

## Simple Group

Simply enclose the group properties within parentheses. For example, to group the orders by `CardCode`, `DocEntry`, send the following request:

```http
GET /b1s/v1/Orders?$apply=groupby((CardCode, DocEntry))
```

Or

```text
/b1s/v1/Orders?$apply=groupby((Orders/CardCode, Orders/DocEntry))
```

On success, the response is as follows:

```json
{
   "odata.metadata" : "$metadata#Orders(CardCode, DocEntry)",
   "value" : [
      {
         "odata.id" : null,
         "CardCode" : "c001",
         "DocEntry" : 2
      },
      {
         "odata.id" : null,
         "CardCode" : "c002",
         "DocEntry" : 3
      },
      {
         "odata.id" : null,
         "CardCode" : "c001",
         "DocEntry" : 5
      },
      {
         "odata.id" : null,
         "CardCode" : "c001",
         "DocEntry" : 6
      }
   ]
}
```

The equivalent SQL on SAP database is:

```sql
SELECT T0."CardCode", T0."DocEntry" FROM "ORDR" T0 GROUP BY T0."CardCode",
T0."DocEntry"
```

## Group with Aggregation Method

Service Layer also supports combining grouping with aggregation. For example, to aggregate the `DocNum` property on grouping `CardCode`, send the following request:

```http
GET /b1s/v1/Orders?$apply=groupby((CardCode), aggregate(DocNum with sum as
TotalDocNum))
```

On success, the response is as follows:

```json
{
   "odata.metadata" : "$metadata#Orders(CardCode,TotalDocNum)",
   "value" : [
      {
         "odata.id" : null,
         "CardCode" : "c001",
         "TotalDocNum" : 8
      },
      {
         "odata.id" : null,
         "CardCode" : "c002",
         "TotalDocNum" : 2
      }
   ]
}
```

The equivalent SQL on database is:

```sql
SELECT T0."CardCode", SUM(T0."DocNum") AS "TotalDocNum" FROM "ORDR" T0 GROUP BY
T0."CardCode"
```

## Group with Aggregation Method and Filter

SL allows you to filter before grouping. These two operations are separated by a forward slash (/) to express that they are consecutively applied. For example, to filter before grouping with the aggregation method, send the following request:

```http
GET /b1s/v1/Orders?$apply=filter(Orders/CardCode eq 'c001')/groupby((CardCode),
aggregate(DocNum with sum as TotalDocNum))
```

On success, the response is as follows:

```json
{
   "odata.metadata" : "$metadata#Orders(CardCode,TotalDocNum)",
   "value" : [
      {
         "odata.id" : null,
         "CardCode" : "c001",
         "TotalDocNum" : 8
      }
   ]
}
```

The equivalent SQL on database is:

```sql
SELECT T0."CardCode", SUM(T0."DocNum") AS "TotalDocNum" FROM "ORDR" T0 WHERE
T0."CardCode" = 'c001' GROUP BY T0."CardCode"
```

> **Note**
>
> The filter option can also be specified as below, which is functionally equivalent.
>
> ```http
> GET /b1s/v1/Orders?$apply=groupby((CardCode), aggregate(DocNum with sum as
> TotalDocNum))&$filter=(Orders/CardCode ne 'c001')
> ```
