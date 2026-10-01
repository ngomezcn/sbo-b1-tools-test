---
title: Aggregation
source: pdf pp. 35-40, sec 3.6.7
summary: Aggregation with the $apply query option (sum, average, max, min, countdistinct, count) and the $inlinecount option, with requests, responses and equivalent SQL.
---

# Aggregation

- [sum](#sum)
- [average](#average)
- [max](#max)
- [min](#min)
- [countdistinct](#countdistinct)
- [count](#count)
- [inlinecount](#inlinecount)

As of SAP Business One 9.1 patch level 12, version for SAP HANA, aggregation is partly supported by Service Layer.

Aggregation behavior is triggered using the query option `$apply`. Any aggregate expression that specifies an aggregation method MUST define an alias for the resulting aggregated value. Aggregate expressions define the alias using the "as" keyword, followed by a `SimpleIdentifier`. The alias will introduce a dynamic property in the aggregated result set. The introduced dynamic property is added to the type containing the original expression.

Currently, the supported aggregation methods include sum, avg, min, max, count and distinctcount.

## sum

The standard aggregation method sum can be applied to numeric values to return the sum of the non-null values, or null if there are no non-null values.

For example, to sum the DocRate of the Orders, send a request such as:

```http
GET /b1s/v1/Orders?$apply=aggregate(DocRate with sum as TotalDocRate)
```

On success, the response is as follows:

```json
{
   "odata.metadata" : "$metadata#Orders(TotalDocRate)",
   "value" : [
      {
         "odata.id" : null,
         "TotalDocRate" : 4.0
      }
   ]
}
```

The equivalent SQL on database is:

```sql
SELECT SUM(T0."DocRate") AS "TotalDocRate" FROM "ORDR" T0
```

## average

The standard aggregation method average can be applied to numeric values to return the sum of the non-null values divided by the count of the non-null values, or null if there are no non-null values.

For example, to calculate the average VatSum of the Orders, send a request such as:

```http
GET /b1s/v1/Orders?$apply=aggregate(VatSum with average as AvgVatSum )
```

On success, the response is as follows:

```json
{
   "odata.metadata" : "$metadata#Orders(AvgVatSum)",
   "value" : [
      {
         "odata.id" : null,
         "AvgVatSum" : 1.70
      }
   ]
}
```

The equivalent SQL on database is:

```sql
SELECT AVG(T0."VatSum") AS "AvgVatSum" FROM "ORDR" T0
```

## max

The standard aggregation method max can be applied to values with a totally ordered domain to return the largest of the non-null values, or null if there are no non-null values. The result property will have the same type as the input property.

For example, to get the maximum DocEntry of the Orders, send a request such as:

```http
GET /b1s/v1/Orders?$apply=aggregate(DocEntry with max as MaxDocEntry)
```

On success, the response is as follows:

```json
{
   "odata.metadata" : "$metadata#Orders(MaxDocEntry)",
   "value" : [
      {
         "odata.id" : null,
         "MaxDocEntry" : 6
      }
   ]
}
```

The equivalent SQL on database is:

```sql
SELECT MAX(T0."DocEntry") AS "MaxDocEntry" FROM "ORDR" T0
```

## min

The standard aggregation method min can be applied to values with a totally ordered domain to return the smallest of the non-null values, or null if there are no non-null values. The result property will have the same type as the input property.

For example, to get the minimum DocEntry of the Orders, send a request such as:

```http
GET/b1s/v1/Orders?$apply=aggregate(DocEntry with min as MinDocEntry)
```

On success, the response is as follows:

```json
{
   "odata.metadata" : "$metadata#Orders(MinDocEntry)",
   "value" : [
      {
         "odata.id" : null,
         "MinDocEntry" : 2
      }
   ]
}
```

The equivalent SQL on database is:

```sql
SELECT MIN(T0."DocEntry") AS "MinDocEntry" FROM "ORDR" T0
```

## countdistinct

The aggregation method countdistinct counts the distinct values, omitting any null values.

For example, to count the distinct CardCode of the Orders, send a request such as:

```http
GET /b1s/v1/Orders?$apply=aggregate(CardCode with countdistinct as
CountDistinctCardCode)
```

On success, the response is as follows:

```json
{
   "odata.metadata" : "$metadata#Orders(CountDistinctCardCode)",
   "value" : [
      {
         "odata.id" : null,
         "CountDistinctCardCode" : "2"
      }
   ]
}
```

The equivalent SQL on database is:

```sql
SELECT COUNT(DISTINCT T0."CardCode") AS "CountDistinctCardCode" FROM "ORDR" T0
```

## count

The value of the virtual property `$count` is the number of instances in the input set. It **must always** specify an alias and **must not** specify an aggregation method.

For example, to count the number of Orders, send a request such as:

```http
GET /b1s/v1/Orders?$apply=aggregate($count as OrdersCount)
```

On success, the response is as follows:

```json
{
   "odata.metadata" : "$metadata#Orders(OrdersCount)",
   "value" : [
      {
         "odata.id" : null,
         "OrdersCount" : 4
      }
   ]
}
```

The equivalent SQL on database is:

```sql
SELECT COUNT(T0."DocEntry") AS "OrdersCount" FROM "ORDR" T0
```

## inlinecount

The `$inlinecount` query option allows clients to request the number of matching resources in line with the resources in the response. This is most useful when a service implements server-side paging, as it allows clients to retrieve the number of matching resources even if the service decides to respond with only a single page of matching resources.

You must specify the `$inlinecount` query option with a value of `allpages` or `none` (or not specified); otherwise, the service returns an HTTP Status code of 400 Bad Request.

- The `$inlinecount` query option with a value of `allpages` specifies that the total count of entities matching the request must be returned along with the result. The following example returns the total number of banks in the result set along with the banks.

```http
GET /Banks?$inlinecount=allpages
                    {
                    "odata.count": "5",
                    "value": [
                    { "BankCode": "bank001", ... },
                    { "BankCode": "bank002", ... },
                    { "BankCode": "bank003", ... },
                    { "BankCode": "bank004", ... },
                    { "BankCode": "bank005", ... }
                    ]
                    }
```

- The `$inlinecount` query option with a value of `none` (or not specified) signifies that the service should not return a count. For example:

```http
GET /Banks?$inlinecount=none
                    {
                    "value": [
                    { "BankCode": "bank001", ... },
                    { "BankCode": "bank002", ... },
                    { "BankCode": "bank003", ... },
                    { "BankCode": "bank004", ... },
                    { "BankCode": "bank005", ... }
                    ]
                    }
```

The `$inlinecount` query option can also work with `$top` and `$filter`.

- The following example returns the first two banks and the count of all banks.

```http
GET /Banks?$inlinecount=allpages&$top=2
                    {
                    "odata.count": "5",
                    "value": [
                    { "BankCode": "bank001", ... },
                    { "BankCode": "bank002", ... }
                    ]
                    }
```

- The following example returns the count of all banks with `BankCode` greater than "bank003".

```http
GET /Banks?$inlinecount=allpages&$filter=BankCode gt 'bank003'
                    {
                    "odata.count": "2",
                    "value": [
                    { "BankCode": "bank004", ... },
                    { "BankCode": "bank005", ... }
                    ]
                    }
```
