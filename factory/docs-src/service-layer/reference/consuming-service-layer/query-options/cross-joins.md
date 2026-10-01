---
title: Cross-joins
source: pdf pp. 42-47, sec 3.6.9
summary: Querying across entity sets with no predefined association using $crossjoin, with expand, calculation and aggregation, plus the equivalent SQL.
---

# Cross-joins

- [Cross-Joins with Expand](#cross-joins-with-expand)
- [Cross-Joins with Calculation](#cross-joins-with-calculation)
- [Cross-Joins with Aggregation](#cross-joins-with-aggregation)

Cross-Joins is supported as of SAP Business One 9.2, version for SAP HANA patch level 07.

OData supports querying related entities through defining navigation properties in the data model. These navigation paths help guide regular consumers in understanding and navigating relationships. In some cases, however, requests need to span entity sets with no predefined associations. Such requests can be sent to the special resource `$crossjoin` instead of to an individual entity set.

## Cross-Joins with Expand

**Expand across two entities**

To expand across two entities according to given filter conditions, a request such as the one below,

```http
GET /b1s/v1/$crossjoin(Orders,BusinessPartners)?$expand=Orders($select=DocEntry,
DocNum),BusinessPartners($select=CardCode)&$filter=Orders/CardCode eq
BusinessPartners/CardCode and Orders/DocNum le 3 and startswith(BusinessPartners/
CardCode,'c00')
```

results in:

```json
{
   "odata.metadata" : "$metadata#Collection(Edm.ComplexType)",
   "value" : [
      {
         "BusinessPartners" : {
            "CardCode" : "c002"
         },
         "Orders" : {
            "DocEntry" : 3,
            "DocNum" : 2
         }
      },
      {
         "BusinessPartners" : {
            "CardCode" : "c001"
         },
         "Orders" : {
            "DocEntry" : 2,
            "DocNum" : 1
         }
      },
      {
         "BusinessPartners" : {
            "CardCode" : "c001"
         },
         "Orders" : {
            "DocEntry" : 5,
            "DocNum" : 3
         }
      }
   ]
}
```

The equivalent SQL on database is:

```text
"SELECT T0."DocEntry", T0."DocNum", T1."CardCode" FROM "ORDR" T0 ,"OCRD" T1 WHERE
T0."CardCode" = T1."CardCode" AND T0."DocNum" <= 3 AND T1."CardCode" Like 'c00%'
```

**Expand across more entities**

Service Layer supports expanding across more entities as well. A request such as the one below,

```http
GET /b1s/v1/$crossjoin(Orders,BusinessPartners,Activities)?
$expand=Orders($select=DocEntry,
DocNum),BusinessPartners($select=CardCode),Activities($select=ActivityCode)&$filter
=Orders/CardCode eq BusinessPartners/CardCode and BusinessPartners/CardCode eq
Activities/CardCode
```

results in:

```json
{
   "odata.metadata" : "$metadata#Collection(Edm.ComplexType)",
   "value" : [
      {
         "Activities" : {
            "ActivityCode" : 1
         },
         "BusinessPartners" : {
            "CardCode" : "c001"
         },
         "Orders" : {
            "DocEntry" : 2,
            "DocNum" : 1
         }
      },
      {
         "Activities" : {
            "ActivityCode" : 1
         },
         "BusinessPartners" : {
            "CardCode" : "c001"
         },
         "Orders" : {
            "DocEntry" : 5,
            "DocNum" : 3
         }
      },
      {
         "Activities" : {
            "ActivityCode" : 1
         },
         "BusinessPartners" : {
            "CardCode" : "c001"
         },
         "Orders" : {
            "DocEntry" : 6,
            "DocNum" : 4
         }
      }
   ]
}
```

The equivalent SQL on database is:

```sql
SELECT T0."DocEntry", T0."DocNum", T1."CardCode", T1."CardName", T2."ClgCode" FROM
"ORDR" T0 , "OCRD" T1, "OCLG" T2 WHERE T0."CardCode" = T1."CardCode" AND
T1."CardCode" = T2."CardCode"
```

**More Examples**

```http
GET /b1s/v1/$crossjoin(SalesOpportunities,BusinessPartners)?
$expand=SalesOpportunities($select=CardCode,CustomerName,StartDate),BusinessPartner
s($select=EmailAddress, CardName)&$filter=SalesOpportunities/StartDate le
'2017-09-20' and BusinessPartners/CardCode eq SalesOpportunities/CardCode
```

```json
{
    "odata.metadata": "$metadata#Collection(Edm.ComplexType)",
    "value": [
        {
            "SalesOpportunities": {
                "CardCode": "c2",
                "CustomerName": "customer c22",
                "StartDate": "2017-09-20"
            },
            "BusinessPartners": {
                "EmailAddress": null,
                "CardName": "customer c22"
            }
        },
        {
            "SalesOpportunities": {
                "CardCode": "c1",
                "CustomerName": "customer c11",
                "StartDate": "2017-09-20"
            },
            "BusinessPartners": {
                "EmailAddress": null,
                "CardName": "customer c11"
            }
        }
    ]
}
```

## Cross-Joins with Calculation

Service Layer allows you to perform simple arithmetic operations on the selected properties and filter conditions. The supported operations include:

- add
- sub
- mul
- div

For example, a request such as the one below,

```text
/b1s/v1/$crossjoin(Orders,BusinessPartners)?$expand=Orders($select=DocEntry mul
(DocNum sub 1) as DocSeq),BusinessPartners($select=CardCode,
CardName)&$filter=Orders/CardCode eq BusinessPartners/CardCode and Orders/DocEntry
ge Orders/DocNum sub 3
```

results in:

```json
{
   "odata.metadata" : "$metadata#Collection(Edm.ComplexType)",
   "value" : [
      {
         "BusinessPartners" : {
            "CardCode" : "c001",
            "CardName" : null
         },
         "Orders" : {
            "DocSeq" : 0
         }
      },
      {
         "BusinessPartners" : {
            "CardCode" : "c002",
            "CardName" : null
         },
         "Orders" : {
            "DocSeq" : 3
         }
      },
      {
         "BusinessPartners" : {
            "CardCode" : "c001",
            "CardName" : null
         },
         "Orders" : {
            "DocSeq" : 18
         }
      }
   ]
}
```

The equivalent SQL on database is:

```sql
SELECT T0."DocEntry" * (T0."DocNum" - 1) AS "DocSeq", T1."CardCode", T1."CardName"
FROM "ORDR" T0 , "OCRD" T1 WHERE T0."CardCode" = T1."CardCode" AND T0."DocEntry" >=
T0."DocNum" - 3
```

## Cross-Joins with Aggregation

To aggregate the properties of `Orders` and `BusinessPartners`, send the following request:

```text
/b1s/v1/$crossjoin(Orders,BusinessPartners)?$apply=filter(Orders/CardCode
eq BusinessPartners/CardCode)/groupby((BusinessPartners/CardCode, Orders/
DocEntry),aggregate(Orders(DocNum with countdistinct as DistinctDocNum)))
```

On success, the server replies this:

```json
{
   "odata.metadata" : "$metadata#Collection(Edm.ComplexType)",
   "value" : [
      {
         "BusinessPartners" : {
            "CardCode" : "c001"
         },
         "Orders" : {
            "DistinctDocNum" : 1,
            "DocEntry" : 2
         }
      },
      {
         "BusinessPartners" : {
            "CardCode" : "c002"
         },
         "Orders" : {
            "DistinctDocNum" : 1,
            "DocEntry" : 3
         }
      },
      {
         "BusinessPartners" : {
            "CardCode" : "c001"
         },
         "Orders" : {
            "DistinctDocNum" : 1,
            "DocEntry" : 5
         }
      }
   ]
}
```

The equivalent SQL on database is:

```sql
SELECT T1."CardCode", T0."DocEntry", COUNT(DISTINCT T0."DocNum") AS
"DistinctDocNum" FROM "ORDR" T0 , "OCRD" T1 WHERE T0."CardCode" = T1."CardCode"
GROUP BY T1."CardCode", T0."DocEntry"
```

**Examples of max**

```http
GET /b1s/v1/$crossjoin(Orders,BusinessPartners)?$apply=filter(Orders/CardCode
eq BusinessPartners/CardCode)/groupby((BusinessPartners/
CardCode),aggregate(Orders(DocNum with max as MaxDocNum)))
```

is equivalent to:

```sql
SELECT T1."CardCode", MAX(T0."DocNum") AS "MaxDocNum" FROM "ORDR" T0 , "OCRD" T1
WHERE T0."CardCode" = T1."CardCode" GROUP BY T1."CardCode"
```

**Examples of count**

```http
GET /b1s/v1/$crossjoin(Orders,BusinessPartners)?$apply=filter(Orders/CardCode
eq BusinessPartners/CardCode)/groupby((BusinessPartners/CardCode),aggregate(Orders/
$count as CountDocEntry))
```

is equivalent to:

```sql
SELECT T1."CardCode", COUNT(T0."DocEntry") AS "CountDocEntry" FROM "ORDR" T0 ,
"OCRD" T1 WHERE T0."CardCode" = T1."CardCode" GROUP BY T1."CardCode"
```

> **Note**
>
> Simply crossing join entities without any query options would not work, as this rarely has practical usage and would fetch large volumes of data under extreme conditions. For example, a request such as the one below,
>
> ```text
> /b1s/v1/$crossjoin(Orders,BusinessPartners)
> ```
>
> results in:
>
> ```json
> {
>     "error": {
>         "code": -1000,
>         "message": {
>             "lang": "en-us",
>             "value": "invalid $crossjoin query"
>         }
>     }
> }
> ```
