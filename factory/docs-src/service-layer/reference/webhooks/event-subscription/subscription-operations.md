---
title: EventSubscription operations
source: pdf pp. 181-184, sec 7.3, 7.3.1
summary: Creating, retrieving, updating, deleting, resuming, pausing, handshaking and replaying webhook event subscriptions through the EventSubscriptions entity.
---

# EventSubscription operations

- [Create Event Subscription](#create-event-subscription)
- [Retrieve Event Subscriptions](#retrieve-event-subscriptions)
- [Update Event Subscription](#update-event-subscription)
- [Delete Event Subscription](#delete-event-subscription)
- [Resume Event Subscription](#resume-event-subscription)
- [Pause Event Subscription](#pause-event-subscription)
- [Handshake Event Subscription](#handshake-event-subscription)
- [Replay Event Subscription](#replay-event-subscription)

Event subscriptions are managed through the `EventSubscriptions` entity in the Service Layer. Use standard HTTP methods to create, retrieve, update, and delete event subscriptions: POST, GET, PATCH, and DELETE.

## Related Information

- [EventSubscription Operations](subscription-operations.md) [page 182]
- [EventSubscription Properties](subscription-properties.md) [page 186]
- [EventSubscription Permission Control](subscription-permission-control.md) [page 192]

## Create Event Subscription

To create an event subscription, send a POST request to the `EventSubscriptions` endpoint with the required details. The following example shows a typical JSON payload for creating a webhook that listens for sales order creation and activities update events:

```http
POST EventSubscriptions
{
    "WebhookID": "MyWebhook",
    "WebhookURL": "https://partner-webhook-service:3000/MyWebhook",
    "AuthenticationType": "HMAC",
    "AuthenticationCred": "{\"Key\":
\"i1mGRbx8DaYZQ6p7RJywYD1IauI+HyTj4TjyKSYv8sI=\", \"Algorithm\":
\"hmacsha256\"}",
    "Handshake": "tYES",
    "VerifyCertificate": "tYES",
    "EventCollection": [
        {
            "BusinessObject": "Activities",
            "TransactionType": "Updated"
        },
        {
            "BusinessObject": "Orders",
            "TransactionType": "Created"
        }
    ]
}
```

For more information about the properties of the `EventSubscription` entity, see [EventSubscription Properties](subscription-properties.md) [page 186].

## Retrieve Event Subscriptions

To retrieve all event subscriptions, send a GET request to the `EventSubscriptions` endpoint.

```http
GET EventSubscriptions
```

To retrieve a specific event subscription by its `WebhookID`, send a GET request to `EventSubscriptions('{WebhookID}')`.

```http
GET EventSubscriptions('MyWebhook')
```

To retrieve event subscriptions with filtering, use OData query options. For example, to filter by `AuthenticationType`:

```http
GET EventSubscriptions?$filter=AuthenticationType eq 'HMAC'
```

<!-- supplement -->

Other OData query options work the same way, for example to list only the active subscriptions or to return selected fields:

```http
GET EventSubscriptions?$filter=State eq 'Active'
GET EventSubscriptions?$select=WebhookID,WebhookURL,State,WorkMode
```

<!-- /supplement -->

## Update Event Subscription

To update an existing event subscription, send a PATCH request to the `EventSubscriptions('{WebhookID}')` endpoint with the updated details. For example, to add a new event (such as `Invoices.Updated`) to the existing subscription:

```http
PATCH EventSubscriptions('MyWebhook')
{
    "EventCollection": [
        {
            "BusinessObject": "Invoices",
            "TransactionType": "Updated"
        }
    ]
}
```

To remove an event (such as `Invoices.Updated`) from the subscription, send a PATCH request with the updated `EventCollection` that excludes the event you want to remove. Include the special header `B1S-ReplaceCollectionsOnPatch` to indicate a full replacement of the collection.

```http
PATCH EventSubscriptions('MyWebhook')
B1S-ReplaceCollectionsOnPatch: true
{
    "EventCollection": [
        {
            "BusinessObject": "Activities",
            "TransactionType": "Updated"
        },
        {
            "BusinessObject": "Orders",
            "TransactionType": "Created"
        }
    ]
}
```

<!-- supplement -->

A PATCH is partial: only the properties you send change, and an `EventCollection` you send is appended to the existing one unless `B1S-ReplaceCollectionsOnPatch: true` is set. `WebhookID` and `WebhookURL` cannot be changed after the subscription is created; to move a subscription to another URL, delete it and create a new one.

<!-- /supplement -->

## Delete Event Subscription

To delete an event subscription, send a DELETE request to the `EventSubscriptions('{WebhookID}')` endpoint.

```http
DELETE EventSubscriptions('MyWebhook')
```

<!-- supplement -->

Only a subscription in the "Inactive" state can be deleted; pause an active one first. Success returns status code 204. Notifications already dispatched stay in `EventNotifications`.

<!-- /supplement -->

## Resume Event Subscription

If a webhook subscription is deactivated due to errors, such as repeated delivery failures, you can resume it by sending a POST request to the `EventSubscriptions('{WebhookID}')/Resume` endpoint.

```http
POST EventSubscriptions('MyWebhook')/Resume
```

Upon success, the Service Layer returns status code 204. This indicates that the request succeeded and there is no content to return. The webhook subscription is reactivated and starts receiving event notifications again.

## Pause Event Subscription

To pause an active event subscription, send a POST request to the `EventSubscriptions('{WebhookID}')/Pause` endpoint.

```http
POST EventSubscriptions('MyWebhook')/Pause
```

Upon success, the Service Layer returns status code 204. The webhook subscription is paused and does not receive event notifications until it is resumed.

<!-- supplement -->

A paused subscription is in the "Inactive" state. Events that occur while it is paused are still recorded in `EventNotifications` but are not delivered, and `Resume` does not send them afterwards. To receive them, use `Replay`.

<!-- /supplement -->

## Handshake Event Subscription

If a webhook subscription requires handshake verification, you can manually initiate the handshake process by sending a POST request to the `EventSubscriptions('{WebhookID}')/Handshake` endpoint.

```http
POST EventSubscriptions('MyWebhook')/Handshake
```

On a successful handshake, the Service Layer returns status code 204. The Webhook service is ready to receive event notifications. If the handshake fails, the Service Layer returns an error message that describes the reason for the failure.

For more information, see [Handshake Mechanism](handshake-mechanism.md) [page 184].

## Replay Event Subscription

To replay missed event notifications for a specific webhook subscription, send a POST request to the `EventSubscriptions('{WebhookID}')/Replay` endpoint:

```http
POST EventSubscriptions('MyWebhook')/Replay
```

Upon success, the Service Layer returns status code 204. This indicates that the request was successful and there is no content to return. The webhook subscription is then reactivated.

The replay operation resends all missed event notifications that occurred during downtime since the last successful delivery. You can only trigger the replay operation manually for a specific webhook by calling this API.

Before starting the replay operation, make sure the webhook subscription is in the "Inactive" state and supports handshake. If these conditions are not met, the replay operation fails and an error message is returned.

When the replay operation starts, the webhook subscription transitions to the "Replay" work mode. The messenger then begins sending the missed event notifications. After all missed notifications are sent, the webhook subscription automatically returns to the "Standard" work mode to process new incoming events.

While a webhook is in replay mode, the messenger stops sending new event notifications to all other normal webhooks until all missed notifications are delivered. During the replay operation, the messenger continues to follow the retry and timeout settings configured for the webhook subscription. If there are no missed notifications to send, the webhook immediately returns to the "Standard" work mode and starts processing new incoming events.
