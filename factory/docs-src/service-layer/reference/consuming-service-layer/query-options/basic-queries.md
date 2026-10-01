---
title: Get Entities, Fields and Typed Properties
source: pdf pp. 33-34, sec 3.6.1, 3.6.2, 3.6.3, 3.6.4, 3.6.5
summary: How to get all entities, select entity fields, and filter on enumeration, datetime and time properties.
---

# Get Entities, Fields and Typed Properties

## Get All Entities

You can use the following ways to get all entity records:

```http
GET /Items
```

or

```http
GET /Items?$select=*
```

## Get Fields of an Entity

You can use the following ways to get item fields:

```http
GET /Items('i1')?$select=ItemCode,ItemName,ItemPrices
```

or

```http
GET /Items(ItemCode='i1')?$select=ItemCode,ItemName,ItemPrices
```

## Query Properties of the Enumeration Type

Enumeration value and enumeration name are both supported in a query option. You can use the following ways to get all customers:

```http
GET /BusinessPartners?$filter=CardType eq 'C'
```

or

```http
GET /BusinessPartners?$filter=CardType eq 'cCustomer'
```

Note that '`C`' is an enumeration value while '`cCustomer`' is an enumeration name.

## Query Properties of the Datetime Type

Multiple date formats are supported. For example:

```http
GET /Orders?$filter=DocDate eq '2014-04-23'

GET /Orders?$filter=DocDate eq '20140423'

GET /Orders?$filter=DocDate eq datetime'2014-04-23'

GET /Orders?$filter=DocDate eq datetime'20140423'

GET /Orders?$filter=DocDate eq '2014-04-23T12:21:21'

GET /Orders?$filter=DocDate eq '20140423000000'
```

Note that SAP Business One ignores the HOUR/MINUTE/SECOND parts. The `datetime` keyword prefix can also be added before the datetime value.

## Query Properties of the Time Type

Multiple time formats are supported. For example:

```http
GET /Orders?$filter=DocTime eq '18:38:00'

GET /Orders?$filter=DocTime eq '18:38'

GET /Orders?$filter=DocTime eq '183800'

GET /Orders?$filter=DocTime eq '1838'

GET /Orders?$filter=DocTime eq '2014-06-18T18:38:00Z'

GET /Orders?$filter=DocTime eq '2014-06-18T18:38'
```

Note that SAP Business One ignores the YEAR/MONTH/DAY parts; only the HOUR/MINUTE parts are effective.
