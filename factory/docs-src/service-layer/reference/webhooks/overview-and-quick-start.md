---
title: Webhooks overview and quick start
source: pdf pp. 179-180, sec 7, 7.1
summary: What webhooks are in the Service Layer, the Webhook Messenger Service, and the six steps to enable webhooks and create a first event subscription.
---

# Webhooks overview and quick start

As of SAP Business One 10.0 FP 2602, the Service Layer supports webhooks.

Webhooks let you receive instant notifications about specific events that occur in your SAP Business One system. When you subscribe to events, you can use webhooks to trigger actions in your applications when certain events happen, such as creating or updating business objects.

```text
┌──────────────────────────┐                    ┌───────────────────────────────┐
│                          │                    │   SAP Business One Webhook    │
│                          │                    │                               │
│  ┌────────────────────┐  │       R ▶          │      ┌─────────────────┐      │
│  │                    ├──┼─────────○──────────┼──────┤  Service Layer  │      │
│  │                    │  │    OData Query     │      └─────────────────┘      │
│  │                    │  │                    │                               │
│  │     Partner's      │  │                    │                               │
│  │  Webhook Service   │  │                    │                               │
│  │                    │  │     ◀ R            │      ┌─────────────────┐      │
│  │                    ├──┼─────────○──────────┼──────┤     Webhook     │      │
│  │                    │  │ Push Notification  │      │    Messenger    │      │
│  │                    │  │                    │      └─────────────────┘      │
│  └────────────────────┘  │                    │                               │
│                          │                    │                               │
│                          │                    │              ...              │
└──────────────────────────┘                    └───────────────────────────────┘
```

Figure: Webhooks in the Service Layer. The Partner's Webhook Service sits outside the SAP Business One Webhook boundary. It reaches the Service Layer through an OData Query interface (request direction: partner to Service Layer). The Webhook Messenger delivers events back to the partner through a Push Notification interface (direction: Messenger to partner). The ellipsis indicates further components inside the SAP Business One Webhook boundary.

To support the webhook feature, a new component called Webhook Messenger Service is introduced to the SAP Business One landscape. It runs as a daemon service behind the Service Layer at the service unit level and handles the delivery of webhook notifications. The webhook mechanism with Service Layer is designed to be flexible and secure. It supports different authentication methods and ensures reliable delivery of notifications.

This section offers an overview of using webhooks in the Service Layer. It covers how to create, manage, and receive notifications for webhooks.

## Related Information

- [Quick Start](overview-and-quick-start.md#quick-start) [page 179]
- [Event Subscription](event-subscription/subscription-operations.md) [page 181]
- [Event Notification](event-notification/notifications-query.md#event-notification) [page 194]
- [Webhook Messenger](webhook-messenger.md) [page 202]

## Quick Start

To get started with webhooks in the Service Layer, follow these steps:

1. Enable webhooks.
   By default, webhooks are disabled for each company. To enable webhooks, call the Service Layer API `CompanyService_UpdateAdminInfo` as shown below.

   ```http
   POST CompanyService_UpdateAdminInfo
   {
       "AdminInfo": {
           "EnableWebhook": "tYES",
       }
   }
   ```

2. Set up webhook endpoint.
   Set up an endpoint in your application to receive and process webhook notifications sent by the SAP Business One system. For testing, you can use the sample webhook service code (https://help.sap.com/doc/c20c38825f674af8a1f72c9f596969a5/10.0/en-US; described in [webhook-endpoint-sample](webhook-endpoint-sample.md)) or services like `https://webhook.site/` to create a temporary webhook endpoint.
3. Create event subscription.
   Define a webhook by specifying the events (for example, Sale Order Creation) you want to subscribe to and the URL where notifications should be sent. To create a webhook, send a POST request to the `EventSubscriptions` endpoint with the necessary details. Here is an example of the minimum JSON payload required to create a simple webhook:

   ```http
   POST EventSubscriptions
   {
       "WebhookID": "MyWebhook",
       "WebhookURL": "https://partner-webhook-service:3000/MyWebhook",
       "AuthenticationType": "None",
       "Handshake": "tNO",
       "EventCollection": [
           {
               "BusinessObject": "Orders",
               "TransactionType": "Created"
           }
       ]
   }
   ```

   In this example, the webhook named `MyWebhook` is set to notify the specified URL when an order is created.
4. Start webhook messenger.
   Ensure the Webhook Messenger Service is installed and running in your SAP Business One environment.
5. Trigger events.
   Trigger the subscribed events in SAP Business One by creating a sales order, for example, through the Service Layer, DI API, SAP Business One desktop client, or Web Client.
6. Receive notifications.
   Verify that your webhook service can receive and process the notifications correctly.

<!-- supplement -->

## Before you start

- Webhooks need SAP Business One 10.0 FP 2602 or later; `BizObjProps` and `FilterExpr` need FP 2608 or later.
- The `WebhookURL` must be HTTPS and reachable from the SAP Business One server. For development, a temporary URL from `https://webhook.site/` or an HTTPS tunnel to a local port (for example ngrok) works.
- To check whether webhooks are enabled, call `CompanyService_GetAdminInfo` and look for `"EnableWebhook": "tYES"`.
- `AuthenticationType` defaults to "HMAC"; the minimal subscription above sets "None" explicitly for that reason.
- Notifications are raised however the record changed: SAP Business One client, Web Client, DI API or Service Layer.

## Webhooks or polling

Polling (repeated `$filter` queries on `UpdateDate`) still fits when you need historical data, on-demand reports, events that are not in the event catalog, or data that a notification payload cannot carry. For reacting to changes in business objects, webhooks avoid the load, the delay and the watermark bookkeeping of polling.

<!-- /supplement -->
