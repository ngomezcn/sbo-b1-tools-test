---
title: Semantic Layer View Query
source: pdf pp. 58-63, sec 3.7.7
summary: Querying exposed Semantic Layer views with OData - all records, query options, by key, views with placeholders, aggregation with $apply, and $count.
---

# Semantic Layer View Query

Semantic Layer service enables you to perform the basic OData queries on exposed views, which makes it possible for it to be used in some flexible scenarios.

Assume all queries are performd on schema `SBODEMOUS`.

## Getting All Records from View

```http
GET /b1s/v1/sml.svc/AveragePurchasingPriceQuery
```

is equivalent to

```sql
SELECT * , row_number() over() as "id__" FROM "_SYS_BIC"."sap.SBODEMOUS.ap.case/
AveragePurchasingPriceQuery" T0
```

On success, the response is as follows:

```http
HTTP/1.1 200 OK
{
    "@odata.context": "https://databaseserver:50000/b1s/v1/sml.svc/
$metadata#AveragePurchasingPriceQuery",
    "value": [
        {
        ...
            "PurchaseAmountLC": 5000,
            "PurchaseQuantityInInventoryUoM": 100,
            "AverageUnitPriceLC": 50,
            "id__": 1
        },
        {
        ...
            "PurchaseAmountLC": 2000,
            "PurchaseQuantityInInventoryUoM": 10,
            "AverageUnitPriceLC": 200,
            "id__": 2
        },
    ...
    ]
}
```

## Querying View with Query Options

Semantic Layer service allows you to retrieve data with query option combinations.

For example, send the following request to service:

```http
GET /b1s/v1/sml.svc/AveragePurchasingPriceQuery?
$select=PostingYear,BusinessPartnerCode&$skip=1&$filter=PostingYear eq
'2017' and startswith(BusinessPartnerCode, '1')&$orderby=PostingYear
```

On success, the response is as follows:

```http
HTTP/1.1 200 OK
{
    "@odata.context": "https://databaseserver:50000/b1s/v1/sml.svc/
$metadata#AveragePurchasingPriceQuery",
    "value": [
        {
            "PostingYear": "2017",
            "BusinessPartnerCode": "1071287676"
        },
        {
            "PostingYear": "2017",
            "BusinessPartnerCode": "1100270398"
        },
        {
            "PostingYear": "2017",
            "BusinessPartnerCode": "124052273"
        },
        {
            "PostingYear": "2017",
            "BusinessPartnerCode": "1785286082"
        }
    ]
}
```

## Querying View by Key

As mentioned above, the virtual property **id__** was created just to comply with OData spec. Despite the fact that it functions similarly to that of a key, it is only allowed to do some simple queries.

### Get one line by entity key

```http
GET /b1s/v1/sml.svc/AveragePurchasingPriceQuery(1)
```

is equivalent to

```sql
SELECT * , row_number() over() as "__RowNum__" FROM "_SYS_BIC"."sap.SBODEMOUS.adm/
Item" T0 LIMIT 1 OFFSET 1
```

On success, the response is as follows:

```http
HTTP/1.1 200 OK
{
    "@odata.context": "https://databaseserver:50000/b1s/v1/sml.svc/
$metadata#AveragePurchasingPriceQuery/$entity",
    "DueDateSQL": "2017-05-16",
    "DocumentDate": "2017-05-16",
    "DocumentYear": "2017",
    ...
    "DocumentQuarter": "Q2",
    "DocumentMonth": "05",
    "Manager": "-NULL-",
    "PurchaseAmountLC": 5000,
    "PurchaseQuantityInInventoryUoM": 100,
    "AverageUnitPriceLC": 50,
    "id__": 1
}
```

### Get properties by entity key

```http
GET /b1s/v1/sml.svc/AveragePurchasingPriceQuery(1)?
$select=PostingYear,BusinessPartnerCode
```

On success, the response is as follows:

```http
HTTP/1.1 200 OK
{
    "@odata.context": "https//databaseserver:50000/b1s/v1/sml.svc/
$metadata#AveragePurchasingPriceQuery/$entity",
    "PostingYear": "2017",
    "BusinessPartnerCode": "d3fb9f1c-72a0-4"
}
```

### Get parameter entity by entity key

An entity ending with **Parameter** is only allowed to be accessed by key. For example, send a request as below:

```text
/b1s/v1/sml.svc/
BalanceSheetQueryParameters(P_FinancialPeriod='2017',P_AddVoucher='N')
```

On success, the response is as follows:

```http
HTTP/1.1 200 OK
{
    "@odata.context": "https://databaseserver:50000/b1s/v1/sml.svc/
$metadata#BalanceSheetQueryParameters/$entity",
    "P_AddVoucher": "N",
    "P_FinancialPeriod": "2017"
}
```

Retrieving it without specifying an entity key results in the following failure message:

```http
HTTP/1.1 400 Bad Request
{
    "error": {
        "code": -1,
        "message": {
            "lang": "en-us",
            "value": "View parameters is not allowed to directly access."
        }
    }
}
```

> **Note**
>
> There are some innate query limitations on the virtual property **id__**. Do not depend on it excessively to perform complicated queries.

## Querying View with Placeholders

A view with placeholders is queried by navigating from its corresponding parameter entity.

For example, to query *BalanceSheetQuery*, you should navigate from *BalanceSheetQueryParameters* as follows:

```http
GET /b1s/v1/sml.svc/
BalanceSheetQueryParameters(P_FinancialPeriod='2017',P_AddVoucher='N')/
BalanceSheetQuery?$select=FiscalYear, AccountCode
```

which is equivalent to

```sql
SELECT FiscalYear, AccountCode
FROM "_SYS_BIC"."sap.SBODEMOUS.fin.fi/BalanceSheetQuery"('PLACEHOLDER'=('$
$P_AddVoucher$$','N'),'PLACEHOLDER'=('$$P_FinancialPeriod$$','2016'))
```

On success, the response is as follows:

```http
HTTP/1.1 200 OK
{
    "@odata.context": "https://databaseserver:50000/b1s/v1/sml.svc/
$metadata#BalanceSheetQuery",
    "value": [
        {
            "FiscalYear": 2017,
            "AccountCode": "_SYS00000000049"
        },
        {
            "FiscalYear": 2017,
            "AccountCode": "_SYS00000000009"
        },
       ...
        {
            "FiscalYear": 2017,
            "AccountCode": "_SYS00000000029"
        }
    ],
    "@odata.nextLink":
"BalanceSheetQueryParameters(P_FinancialPeriod='2017',P_AddVoucher='N')/
BalanceSheetQuery?$select=FiscalYear,%20AccountCode&$skip=20"
}
```

In addition, query by key is also supported for placeholder views.

```http
GET /b1s/v1/sml.svc/
BalanceSheetQueryParameters(P_FinancialPeriod='2017',P_AddVoucher='N')/
BalanceSheetQuery(1)

GET /b1s/v1/sml.svc/
BalanceSheetQueryParameters(P_FinancialPeriod='2017',P_AddVoucher='N')/
BalanceSheetQuery(1)?$select=FiscalYear, AccountCode
```

> **Note**
>
> `@odata.nextLink` is the paging annotation literal in OData version 4.

## Querying View with Aggregation

In SAP HANA Studio, you can preview the query view data from multiple dimensions, for example by year and month.

The produced grid is as follows:

<!-- table: t062-01 -->
| PostingYear | PostingMonth | ItemCode_COUNT | AverageUnitPriceLC_SUM |
|---|---|---|---|
| 2017 | 10 | 2 | 50 |

The equivalent SQL for this is:

```sql
SELECT "PostingYear", "PostingMonth", COUNT(*) AS "ItemCode_COUNT",
SUM("AverageUnitPriceLC") AS "AverageUnitPriceLC_SUM"
FROM "_SYS_BIC"."sap.us1017.ap.case/AveragePurchasingPriceQuery"
GROUP BY "PostingYear", "PostingMonth"
ORDER BY "PostingYear" ASC, "PostingMonth" ASC
```

To simulate this in Semantic Layer service, send a request as follows:

```http
GET /b1s/v1/sml.svc/AveragePurchasingPriceQuery?$apply=groupby((PostingYear,
PostingMonth), aggregate($count as ItemCode_COUNT, AverageUnitPriceLC with sum as
AverageUnitPriceLC_SUM))&$orderby=PostingYear asc,PostingMonth asc
```

On success, the response is as follows:

```http
HTTP/1.1 200 OK
{
    "@odata.context":
"$metadata#AveragePurchasingPriceQuery(PostingYear,PostingMonth,ItemCode_COUNT,Av
erageUnitPriceLC_SUM)",
    "value": [
        {
            "PostingYear": "2017",
            "PostingMonth": "10",
            "ItemCode_COUNT": 2,
            "AverageUnitPriceLC_SUM": 50
        }
    ]
}
```

From this perspective, for a simple aggregation scenario, Semantic Layer service is somewhat capable of producing the similar result as SAP HANA Studio does. However, this does not mean the service is completely functionally equivalent to SAP HANA Studio. The service aggregation abilities could be gradually enhanced in subsequent patches.

### Other Examples

To query the records number of one view (for example, *AveragePurchasingPriceQuery*), simply append the `$count` keyword as follows:

```http
GET /b1s/v1/sml.svc/AveragePurchasingPriceQuery/$count
```

On success, the response is as follows:

```http
HTTP/1.1 200 OK
14
```

The `$count` can also be applied to views with placeholders, seen from the following examples:

```http
GET /b1s/v1/sml.svc/ItemRecommendationQueryParameters(CurrentUserCode=1)/
ItemRecommendationQuery/$count

GET /b1s/v1/sml.svc/
BalanceSheetQueryParameters(P_FinancialPeriod='2017',P_AddVoucher='N')/
BalanceSheetQuery/$count
```

