---
title: EventNotifications Query and Properties
source: pdf pp. 194-198, sec 7.4, 7.4.1, 7.4.1.1
summary: How the Webhook Messenger records dispatched notifications and how to query the EventNotifications entity, with the full list of its properties.
---

# EventNotifications Query and Properties

- [Event Notification](#event-notification)
- [EventNotifications Query](#eventnotifications-query)
- [EventNotifications Properties](#eventnotifications-properties)

## Event Notification

When an event that you subscribe to occurs, the Webhook Messenger Service sends a POST request to the specified `WebhookURL`. The notification payload includes details about the event, such as the affected business object and the type of transaction. The system also saves each dispatched notification in the event table for tracking and monitoring. For each dispatched notification, you can retrieve its status and details by querying the `EventNotifications` entity in the Service Layer.

**Related Information**

[EventNotifications Query](notifications-query.md#eventnotifications-query) [page 194]

[Notification Payload Structure](payload-structure.md) [page 198]

## EventNotifications Query

The `EventNotifications` entity represents notifications sent to webhooks for subscribed events. You can retrieve these notifications using standard HTTP GET methods.

To retrieve event notifications with specific OData query filter conditions, send a GET request to the `EventNotifications` endpoint. For example:

```http
GET EventNotifications?$filter=BusinessObject eq 'Orders' and Operation eq
'Created'&$top=10&$orderby=CreateTime desc
```

To retrieve a specific event notification by its unique `EventID`, send a GET request to `EventNotifications('{EventID}')`:

```http
GET EventNotifications('3f03e9da-8dd6-4601-be18-5cad6790bfd3')
```

> **Note**
>
> Please note that other modifications, such as delete, update, or create, on the `EventNotifications` entity are not supported. This is by design, as the system generates and manages event notifications internally through the SAP Business One Core and Webhook Messenger Service.

**Related Information**

[EventNotifications Properties](notifications-query.md#eventnotifications-properties) [page 195]

## EventNotifications Properties

The `EventNotifications` entity includes these major properties:

<!-- table: t195-01 -->
- EventID
  - **Type**: String
  - **Description**: A unique GUID identifier for the event notification.
  - **Constraints**:

    Required

    - Must be a non-empty string
    - Must be unique within the company

  - **Example**: 3f03e9da-8dd6-4601-be18-5cad6790bfd3
- SourceDB
  - **Type**: String
  - **Description**: The database name of the source company where the event occurs.
  - **Constraints**:

    Required

    - Must be a non-empty string.

  - **Example**: SBODEMOUS
- BusinessObject
  - **Type**: String
  - **Description**: The business object affected by the event, such as Orders or Invoices.
  - **Constraints**:

    Required

    - Must be a non-empty string.
    - This corresponds to the `BusinessObject` property in the `EventSubscription` that triggers this notification. It is consistent with the business object names exposed in the Service Layer.

  - **Example**: Orders
- Operation
  - **Type**: String
  - **Description**: The type of transaction that triggered the event, such as created, updated, deleted, closed, or cancelled.
  - **Constraints**:

    Required

    - Must be a non-empty string.

  - **Example**: Created
- Status
  - **Type**: String
  - **Description**: The delivery status of the webhook notification.
  - **Constraints**:

    Required

    - Must be one of the following values: New, Delivered, Failed, PartiallyDelivered, Archived
    - Default: "New"

  - **Example**: New
- ReplayState
  - **Type**: String
  - **Description**: The replay status of webhook notifications.
  - **Constraints**:

    Required

    - Must be one of the following values:
      - "None": The notification is not part of a replay operation.
      - "Replaying": The notification is currently being replayed.
      - "Completed": The notification has been successfully replayed.
    - Default: "None"

  - **Example**: None

<!-- table: t196-01 -->
- FieldNames
  - **Type**: String
  - **Description**: A comma-separated list of field names included in the notification payload.
  - **Constraints**:

    Optional

    - Must be a non-empty string if provided.

  - **Example**:

    - For "Orders", it is "DocEntry".
    - For "BusinessPartners", it is "CardCode".
    - For "SpecialPrices", it is "CardCode ItemCode", separated by a tab.

- FieldValues
  - **Type**: String
  - **Description**: A comma-separated list of field values corresponding to the `FieldNames`.
  - **Constraints**:

    Optional

    - Must be a non-empty string if provided.

  - **Example**:

    - For "Orders", it is "91".
    - For "BusinessPartners", it is "C20000".
    - For "SpecialPrices", it is "C20000 I00001", separated by a tab.

- CreateDate
  - **Type**: Date
  - **Description**: The date when the event notification is created.
  - **Constraints**:

    Required

    - Must be a valid date.
    - The date is represented in the format `yyyy-MM-ddTHH:mm:ssZ`, with the time portion set to 00:00:00Z.

  - **Example**: 2025-11-19T00:00:00Z
- CreateTime
  - **Type**: String
  - **Description**: The time when the event notification is created.
  - **Constraints**:

    Required

    - Must be a valid time.
    - The time is represented in the format of `HH:mm:ss.fff`, which uses a 24-hour clock with milliseconds.

  - **Example**: 16:45:21.907
- KeyData
  - **Type**: String
  - **Description**:

    Key data related to the event notification in JSON format.

    Available as of SAP Business One 10.0 FP 2608.

  - **Constraints**:

    Required

    Must be a valid JSON string.

  - **Example**:

    For an order, the KeyData looks like `{"DocEntry": 91}`.

    For a business partner, it looks like `{"CardCode": "C20000"}`.

<!-- table: t197-01 -->
- DeliveryDetails
  - **Type**: Collection of complex type `DeliveryDetail`
  - **Description**:

    A list of delivery details for each webhook endpoint that receives the notification. Each `DeliveryDetail` object contains information about the delivery attempt for a specific webhook, including:

    - WebhookID
    - Delivery status
    - Number of attempts
    - Last attempt time
    - HTTP response code

    This lets you track the delivery history and status of the notification for each subscribed webhook.

    Available as of SAP Business One 10.0 FP 2608.

<!-- table: t198-01 -->
- ExtDataList
  - **Type**: Collection of complex type `ExtData`
  - **Description**:

    A list of additional data related to the event notification for each webhook endpoint. Each `ExtData` object contains information about the additional data for a specific webhook, including:

    - WebhookID
    - A JSON string of key-value pairs representing the additional data
    - The value of the filter expression if the event subscription is configured with a filter expression

    This provides more context and details about the event for each subscribed webhook.

    Available as of SAP Business One 10.0 FP 2608.
