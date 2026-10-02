---
title: Event catalog
source: pdf pp. 180-181, sec 7.2
summary: How to retrieve the list of business objects and transaction types you can subscribe to with webhooks, and the shape of the response.
---

# Event catalog

The event catalog is a list of supported events that users can subscribe to through webhooks. It is organized by business objects and transaction types. This catalog aligns with the business objects or entities available in the Service Layer. It includes not only system objects but also user-defined objects (UDOs) and user-defined tables (UDTs).

To retrieve the complete list of supported events, send a GET request to the `EventCatalog` endpoint:

```http
GET EventSubscriptionsService_GetEventCatalog
```

The response includes a list of business objects and their corresponding transaction types available for subscription via webhooks. For example, the response may look like this:

```json
{
    "@odata.context": "https://servicelayer:50000/b1s/v2/EventSubscriptions/
$metadata#SAPB1.EventCatagory",
    "Version": "1.0",
    "Description": "SAP Business One Event Catalog",
    "value": [
        {
            "BusinessObject": "BusinessPartners",
            "ObjectType": "2",
            "TransactionTypes": "Created,Updated,Deleted"
        },
        {
            "BusinessObject": "Orders",
            "ObjectType": "17",
            "TransactionTypes":
"Created,Updated,Deleted,Closed,Cancelled,Reopened"
        },
        {
            "BusinessObject": "Activities",
            "ObjectType": "1007",
            "TransactionTypes": "Created,Updated,Deleted"
        },
        ...
    ]
}
```

<!-- supplement -->

The `BusinessObject` names are the Service Layer entity names: `Orders` is the `Orders` entity, `Invoices` the A/R invoices. Not every object supports every transaction type; `BusinessPartners` has no `Cancelled`, for example, so read `TransactionTypes` in the catalog before subscribing.

| Transaction type | Meaning |
|---|---|
| Created | A new record was added. |
| Updated | An existing record was modified. |
| Deleted | A record was deleted. |
| Closed | A document was closed. |
| Cancelled | A document was cancelled. |
| Reopened | A closed document was reopened. |

<!-- /supplement -->
