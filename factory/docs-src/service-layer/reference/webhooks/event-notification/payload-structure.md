---
title: Notification Payload Structure
source: pdf pp. 198-200, sec 7.4.2
summary: The JSON payload the Webhook Messenger POSTs to a webhook URL, as single or batched notifications, and how BizObjProps extends the data field.
---

# Notification Payload Structure

When a subscribed event occurs, the Webhook Messenger sends a notification to the specified Webhook URL. The notification payload is structured in JSON format and contains details about the event. It follows the SAP Events specification for event representation and includes the following essential fields:

<!-- table: t198-02 -->
| Field | Description |
|---|---|
| id | A unique identifier for the event notification. |
| specversion | The version of the SAP Events specification in use. |
| source | The source of the event, typically indicating the system and company where the event originated. |
| type | The type of event, formatted as `sap.b1.{BusinessObject}.{Operation}.v1`. |
| subject | The subject of the event, usually the primary key of the affected business object. |
| time | The UTC timestamp when the event occurred, in ISO 8601 format. |
| datacontenttype | The content type of the data payload, typically `application/json`. |
| data | An object that contains the details of the event, including key fields and the optional configured properties of the affected business object. |

The payload content matches the properties of the `EventNotifications` entity. Depending on the configuration, notifications can be sent as single events or grouped in batches. By default, the messenger sends notifications in batches to optimize performance. You can control the number of events in a batch by adjusting the `MessageBatchLimit` configuration setting.

<!-- supplement -->

The payload is always a JSON array, even when it carries a single event, so the endpoint must iterate over it. `id` is the `EventID` of the notification and is the key to deduplicate on. `source` identifies the system and the company database, which matters when one endpoint serves several companies. `subject` is the key of the affected record (`DocEntry` for Orders, `CardCode` for BusinessPartners).

<!-- /supplement -->

## Single Notification Payload

A single notification uses the following payload structure:

```json
[
 {
    "id": "5ac18923-cfce-40d3-a31e-7154ca4d5191",
    "specversion": "1.0",
    "source": "/default/sap.b1/DEMODB1",
    "type": "sap.b1.Orders.Created.v1",
    "subject": "91",
    "time": "2025-11-10T23:10:22.917Z",
    "datacontenttype": "application/json",
    "data": {
      "DocEntry": "91"
    }
  }
]
```

## Batch Notification Payload

When multiple events are batched together, the payload structure is an array of individual notification objects, as shown below:

```json
[
  {
    "id": "5ac18923-cfce-40d3-a31e-7154ca4d5191",
    "specversion": "1.0",
    "source": "/default/sap.b1/DEMODB1",
    "type": "sap.b1.Orders.Created.v1",
    "subject": "92",
    "time": "2025-11-10T23:10:23.917Z",
    "datacontenttype": "application/json",
    "data": {
      "DocEntry": "92"
    }
  },
  {
    "id": "5ac18923-cfce-40d3-a31e-7154ca4d5192",
    "specversion": "1.0",
    "source": "/default/sap.b1/DEMODB1",
    "type": "sap.b1.Orders.Created.v1",
    "subject": "93",
    "time": "2025-11-10T23:10:24.917Z",
    "datacontenttype": "application/json",
    "data": {
      "DocEntry": "93"
    }
  }
]
```

When the webhook is configured with `BizObjProps` (available as of SAP Business One 10.0 FP 2608), the data field includes the additional properties specified. For example, if `BizObjProps` includes DocEntry, CardCode, and DocTotal, the payload looks like this:

```json
[
  {
    "id": "5ac18923-cfce-40d3-a31e-7154ca4d5191",
    "specversion": "1.0",
    "source": "/default/sap.b1/DEMODB1",
    "type": "sap.b1.Orders.Created.v1",
    "subject": "91",
    "time": "2025-11-10T23:10:22.917Z",
    "datacontenttype": "application/json",
    "data": {
      "DocEntry": 91,
      "CardCode": "C20000",
      "DocTotal": 1500.00
    }
  }
]
```
