---
title: Query a SQL View
source: pdf pp. 70-73, sec 3.8.4
summary: Querying exposed SQL views through view.svc by key, with paging, with query options and with aggregation.
---

# Query a SQL View

View service enables you to perform the basic OData queries on exposed views, which is useful in some flexible scenarios.

> **Note**
>
> The examples mentioned in the following sections are all using OData V3 to demonstrate how to do the view query. OData V4 can be applied as well.

## Query View by Key

As mentioned above, the virtual property **id__** is created just to comply with OData specification. Despite the fact that it functions similarly to a key, it is only allowed to perform some simple queries.

### [Get one line by entity key]

The request below

```http
GET /b1s/v1/view.svc/B1_ItemPriceB1SLQuery(1)
```

is equivalent to

```sql
SELECT T0.[ItemCode] , T0.[PriceList] , T0.[UomEntry] , T0.[Price] , T0.
[Currency] , T0.[PriceType] , row_number() OVER (order by getdate()) as
[id__] FROM [dbo].[B1_ItemPriceB1SLQuery] T0 ORDER BY CURRENT_TIMESTAMP
OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY FOR BROWSE
```

On success, the response is like:

```http
HTTP/1.1 200 OK
{
"odata.metadata":
"https://server:50000/b1s/v1/view.svc/$metadata#B1_ItemPriceB1SLQuery/@Element",
"ItemCode": "i001",
"PriceList": 1,
"UomEntry": -1,
"Price": 0,
"Currency": null,
"PriceType": "M",
"id__": 1
}
```

### [Get properties by entity key]

Request as below:

```http
GET /b1s/v1/view.svc/B1_ItemPriceB1SLQuery(1)?$select=ItemCode,PriceList
```

On success, the response is like:

```http
HTTP/1.1 200 OK
{
"odata.metadata":
"https://server:50000/b1s/v1/view.svc/$metadata#B1_ItemPriceB1SLQuery/@Element",
"ItemCode": "i001",
"PriceList": 1
}
```

> **Note**
>
> - There are some innate query limitations on the virtual property **id__**. Do not excessively depend on it to perform complicated queries.
> - Query by key is just to comply with the OData specification. It is not a typical user case in a production environment.

## Retrieve Records with Paging

Considering there might be hundreds of thousands of records one view would return in one roundtrip, the paging mechanism is enabled by default to avoid any potential resource racing issue on the service side.

For example, such a request as below

```http
GET /b1s/v1/view.svc/B1_ItemPriceB1SLQuery
```

results in the following response:

```http
HTTP/1.1 200 OK
{
"odata.metadata":
"https://server:50000/b1s/v1/view.svc/$metadata#B1_ItemPriceB1SLQuery",
"value": [
{
"ItemCode": "i001",
"PriceList": 1,
"UomEntry": -1,
"Price": 0,
"Currency": null,
"PriceType": "M",
"id__": 1
},
...
{
"ItemCode": "i001",
"PriceList": 2,
"UomEntry": -1,
"Price": 0,
"Currency": null,
"PriceType": "M",
"id__": 20
}
],
"odata.nextLink": "B1_ItemPriceB1SLQuery?$skip=20"
}
```

The default page size is 20. To change it (for example, to 40) from the client side, append a **Prefer** entry in the request header:

```http
GET /b1s/v1/view.svc/B1_ItemPriceB1SLQuery

Prefer:odata.maxpagesize=40
```

## Query Records with Query Options

View service allows you to retrieve data with query option combinations.

For example, send the below request to service:

```http
GET /b1s/v1/view.svc/B1_ItemPriceB1SLQuery?
$select=ItemCode,PriceType&$filter=PriceType eq 'M'
```

On success, the response is like:

```http
HTTP/1.1 200 OK
{
"odata.metadata":
"https://server:50000/b1s/v1/view.svc/$metadata#B1_ItemPriceB1SLQuery",
"value": [
{
"ItemCode": "i001",
"PriceType": "M"
},
{
"ItemCode": "i001",
"PriceType": "M"
},
{
"ItemCode": "i001",
"PriceType": "M"
},
{
"ItemCode": "i001",
"PriceType": "M"
},
...
{
"ItemCode": "i002",
"PriceType": "M"
}
]
}
```

## Query View with Aggregation

To get the total record number of **B1_ItemPriceB1SLQuery**, send such a request:

```http
GET /b1s/v1/view.svc/B1_ItemPriceB1SLQuery/$count
```

On success, the response is like:

```http
HTTP/1.1 200 OK
Content-Type: text/plain;charset=utf-8;
40
```

To get the maximum **ItemCode** of the **B1_ItemPriceB1SLQuery**, send a request like:

```http
GET /b1s/v1/view.svc/B1_ItemPriceB1SLQuery?$apply=aggregate(ItemCode with max as
MaxItemCode)
```

On success, the response is like:

```http
HTTP/1.1 200 OK
{
"odata.metadata": "$metadata#B1_ItemPriceB1SLQuery(MaxItemCode)",
"value": [
{
"MaxItemCode": "i002"
}
]
}
```

The equivalent SQL on Microsoft SQL Server is:

```sql
SELECT MAX(T0.[ItemCode]) AS 'MaxItemCode' FROM [dbo].[B1_ItemPriceB1SLQuery] T0
```

To perform a complex aggregation with group by, send a request like:

```http
GET /b1s/v1/view.svc/B1_ItemPriceB1SLQuery?$apply=groupby((ItemCode, PriceType),
aggregate($count as ItemCode_COUNT, Price with sum as SumPrice))&$orderby=ItemCode
asc,PriceType asc
```

On success, the response is like:

```http
HTTP/1.1 200 OK
{
"odata.metadata":
"$metadata#B1_ItemPriceB1SLQuery(ItemCode,PriceType,ItemCode_COUNT,SumPrice)",
"value": [
{
"ItemCode": "i001",
"PriceType": "M",
"ItemCode_COUNT": 10,
"SumPrice": 0
},
{
"ItemCode": "i002",
"PriceType": "M",
"ItemCode_COUNT": 10,
"SumPrice": 0
}
]
}
```

The equivalent SQL on Microsoft SQL Server is:

```sql
SELECT T0.[ItemCode], T0.[PriceType], COUNT(*) AS 'ItemCode_COUNT', SUM(T0.[Price])
AS 'SumPrice' FROM [dbo].[B1_ItemPriceB1SLQuery] T0 GROUP BY T0.[ItemCode], T0.
[PriceType] ORDER BY T0.[ItemCode],T0.[PriceType] OFFSET 0 ROWS FETCH NEXT 20 ROWS
ONLY FOR BROWSE
```
