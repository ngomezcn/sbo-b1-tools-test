---
title: Expand query enhancements
source: pdf pp. 50-52, sec 3.6.11
summary: Using a $select clause inside $expand, for a single entity and for a collection, with the equivalent query variants.
---

# Expand query enhancements

As of SAP Business One 10.0 FP 2105, the OData `$expand` query capability is enhanced. You can specify a `$select` clause in the `$expand`.

## Single Entity

This enhancement allows a single entity to expand its navigation properties. For example, you send the following query to the Service Layer:

```http
GET https://hanaserver:50000/b1s/v2/ServiceCalls(1)?
$expand=BusinessPartner($select=ContactPerson, CardCode),Item($select=ItemCode,
ItemName)&$select=Subject HTTP/1.1
```

You get the following response:

```json
{
    "@odata.context": "https://hanaserver:50000/b1s/v2/$metadata#ServiceCalls/
$entity",
    "BusinessPartner": {
        "CardCode": "c1",
        "ContactPerson": "contact001"
    },
    "Item": {
        "ItemCode": "i001",
        "ItemName": "i001 name"
    },
    "Subject": "subject1"
}
```

This query has the two variants below, which means the following two queries would produce the same result.

- `GET https://hanaserver:50000/b1s/v2/ServiceCalls(1)?$expand=BusinessPartner($select=ContactPerson, CardCode),Item&$select=Item/ItemCode, Item/ItemName, Subject HTTP/1.1`
- `GET https://hanaserver:50000/b1s/v2/ServiceCalls(1)?$expand=BusinessPartner,Item&$select=BusinessPartner/ContactPerson, BusinessPartner/CardCode, Item/ItemCode, Item/ItemName, Subject HTTP/1.1`

## Collection Entity

This enhancement allows each entity in a collection to expand its navigation properties. For example, you send the following query to the Service Layer:

```http
GET https://hanaserver:50000/b1s/v2/ServiceCalls?
$expand=BusinessPartner($select=ContactPerson, CardCode),Item($select=ItemCode,
ItemName)&$select=Subject HTTP/1.1
```

You get the following response:

```json
{
    "@odata.context": "https://hanaserver:50000/b1s/v2/$metadata#ServiceCalls",
    "value": [
        {
            "BusinessPartner": {
                "CardCode": "c1",
                "ContactPerson": "contact001"
            },
            "Item": {
                "ItemCode": "i001",
                "ItemName": "i001 name"
            },
            "Subject": "subject1"
        },
        {
            "BusinessPartner": {
                "CardCode": "c1",
                "ContactPerson": "contact001"
            },
            "Item": {
                "ItemCode": "i001",
                "ItemName": "i001 name"
            },
            "Subject": "subject2"
        },
        {
            "BusinessPartner": {
                "CardCode": "c1",
                "ContactPerson": "contact001"
            },
            "Item": {
                "ItemCode": "i001",
                "ItemName": "i001 name"
            },
            "Subject": "subject3"
        }
    ]
}
```

This query has the two variants below, which means the following two queries would produce the same results.

- `GET https://hanaserver:50000/b1s/v2/ServiceCalls?$expand=BusinessPartner($select=ContactPerson, CardCode),Item&$select=Item/ItemCode, Item/ItemName, Subject HTTP/1.1`
- `GET https://hanaserver:50000/b1s/v2/ServiceCalls?$expand=BusinessPartner,Item&$select=BusinessPartner/ContactPerson, BusinessPartner/CardCode, Item/ItemCode, Item/ItemName, Subject HTTP/1.1`
