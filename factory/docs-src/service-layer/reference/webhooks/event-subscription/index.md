# Event subscription

## [EventSubscription operations](subscription-operations.md)
Use when: creating, retrieving, updating, deleting, pausing, resuming, handshaking or replaying an event subscription.
Terms: `POST EventSubscriptions`, `PATCH EventSubscriptions`, `Pause`, `Resume`, `Handshake`, `Replay`
Sections: [Create](subscription-operations.md#create-event-subscription) · [Retrieve](subscription-operations.md#retrieve-event-subscriptions) · [Update](subscription-operations.md#update-event-subscription) · [Delete](subscription-operations.md#delete-event-subscription) · [Resume](subscription-operations.md#resume-event-subscription) · [Pause](subscription-operations.md#pause-event-subscription) · [Handshake](subscription-operations.md#handshake-event-subscription) · [Replay](subscription-operations.md#replay-event-subscription)

## [Handshake mechanism](handshake-mechanism.md)
Use when: a webhook URL fails validation, or you need to know what the handshake request looks like for each authentication type.
Terms: handshake, token, `WebhookURL`, authentication headers, signature
Sections: [Handshake Scenarios](handshake-mechanism.md#handshake-scenarios) · [Handshake with Authentication](handshake-mechanism.md#handshake-with-authentication)
Not here: Service Layer login → [login-logout-session](../../consuming-service-layer/login-logout-session.md)

## [EventSubscription properties](subscription-properties.md)
Use when: looking up a property of an event subscription: its type, constraints and an example.
Terms: `WebhookID`, `WebhookURL`, `AuthenticationType`, `AuthenticationCred`, `WorkMode`, `EventCollection`, `BizObjProps`, `FilterExpr`

## [EventSubscription permission control](subscription-permission-control.md)
Use when: granting a user the permission to manage event subscriptions.
Terms: Webhook Manipulation, General Authorizations, `SBOBobService_SetSystemPermission`
Not here: permissions on SQL queries → [query-allowlist](../../sql-query/query-allowlist/index.md)
