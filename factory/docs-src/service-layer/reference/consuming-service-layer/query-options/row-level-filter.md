---
title: Row-level filter
source: pdf pp. 47-50, sec 3.6.10
summary: The QueryService_PostQuery function import for row-level filtering (for example document lines), its metadata and examples built on $crossjoin.
---

# Row-level filter

As of SAP Business One 9.2 PL11, version for SAP HANA, Service Layer allows you to do row level filtering (for example, document line filtering).

To fully comply with OData, Service Layer exposes a new query service for the row level filter, which is implemented based on the `$crossjoin` capabilities by separating the `QueryPath` and `QueryOption` in the query URL.

## Metadata for Query Service

Query Service is exposed in the manner of `FunctionImport` in the following way:

```xml
<FunctionImport Name="QueryService_PostQuery" ReturnType="Edm.String"
m:HttpMethod="POST">
    <Parameter Name="QueryOption" Type="Edm.String"/>
    <Parameter Name="QueryPath" Type="Edm.String"/>
</FunctionImport>
```

## Examples for Query Service

**Filter on joining document header and document line**

A request such as the one below,

```http
POST /b1s/v1/QueryService_PostQuery
{
  "QueryPath": "$crossjoin(Orders,Orders/DocumentLines)",
  "QueryOption": "$expand=Orders($select=DocEntry, DocNum),Orders/
DocumentLines($select=ItemCode,LineNum)&$filter=Orders/DocEntry eq Orders/
DocumentLines/DocEntry and Orders/DocEntry ge 3 and Orders/DocumentLines/LineNum
eq 0"
}
```

results in:

```json
{
   "odata.metadata" : "$metadata#Collection(Edm.ComplexType)",
   "value" : [
      {
         "Orders" : {
            "DocEntry" : 9,
            "DocNum" : 5
         },
         "Orders/DocumentLines" : {
            "ItemCode" : "i1",
            "LineNum" : 0
         }
      },
      {
         "Orders" : {
            "DocEntry" : 12,
            "DocNum" : 6
         },
         "Orders/DocumentLines" : {
            "ItemCode" : "i1",
            "LineNum" : 0
         }
      },
      ...
      {
         "Orders" : {
            "DocEntry" : 20,
            "DocNum" : 12
         },
         "Orders/DocumentLines" : {
            "ItemCode" : "i1",
            "LineNum" : 0
         }
      },
      {
         "Orders" : {
            "DocEntry" : 44,
            "DocNum" : 22
         },
         "Orders/DocumentLines" : {
            "ItemCode" : "i1",
            "LineNum" : 0
         }
      }
   ]
}
```

**Filter on joining document header and document line with parenthesis**

A request such as the one below,

```http
POST /b1s/v1/QueryService_PostQuery
{
  "QueryPath": "$crossjoin(Orders,Orders/DocumentLines)",
  "QueryOption": "$expand=Orders($select=DocEntry, DocNum),Orders/
DocumentLines($select=ItemCode,LineNum)&$filter=Orders/DocEntry eq Orders/
DocumentLines/DocEntry and (Orders/DocumentLines/LineNum eq 0 or Orders/
DocumentLines/LineNum eq 1 or Orders/DocumentLines/LineNum eq 2)"
}
```

results in:

```json
{
   "odata.metadata" : "$metadata#Collection(Edm.ComplexType)",
   "value" : [
      {
         "Orders" : {
            "DocEntry" : 9,
            "DocNum" : 5
         },
         "Orders/DocumentLines" : {
            "ItemCode" : "i1",
            "LineNum" : 0
         }
      },
      {
         "Orders" : {
            "DocEntry" : 3,
            "DocNum" : 1
         },
         "Orders/DocumentLines" : {
            "ItemCode" : "i1",
            "LineNum" : 0
         }
      },
      ...
      {
         "Orders" : {
            "DocEntry" : 28,
            "DocNum" : 17
         },
         "Orders/DocumentLines" : {
            "ItemCode" : "i2",
            "LineNum" : 1
         }
      },
      {
         "Orders" : {
            "DocEntry" : 44,
            "DocNum" : 22
         },
         "Orders/DocumentLines" : {
            "ItemCode" : "i2",
            "LineNum" : 1
         }
      }
   ]
}
```

> **Note**
>
> The response is a raw string with the same structure as JSON and the *content-type* is `text/plain`. Some JSON utility libraries can be used to convert the response to a valid JSON structure to analyze.
