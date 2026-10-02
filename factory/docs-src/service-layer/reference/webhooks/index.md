# Webhooks

## [Webhooks overview and quick start](overview-and-quick-start.md)
Use when: understanding what webhooks are in the Service Layer, or enabling them and creating a first event subscription step by step.
Terms: webhooks, Webhook Messenger Service, `EnableWebhook`, `EventSubscriptions`, quick start
Sections: [Quick Start](overview-and-quick-start.md#quick-start)

## [Event catalog](event-catalog.md)
Use when: finding which business objects and transaction types can be subscribed to.
Terms: `EventSubscriptionsService_GetEventCatalog`, event catalog, `BusinessObject`, `TransactionType`
Not here: subscribing to an event → [event-subscription/](event-subscription/index.md)

## [Event subscription/](event-subscription/index.md)
Use when: creating, reading, changing, pausing, resuming, deleting, handshaking or replaying a subscription; looking up subscription properties; granting the permission to manage subscriptions.
Terms: `EventSubscriptions`, `WebhookURL`, `AuthenticationType`, handshake, `Replay`, `Pause`, `Resume`, `EventCollection`, `FilterExpr`, `SBOBobService_SetSystemPermission`
Not here: stored notifications → [event-notification/](event-notification/index.md); the formula in `FilterExpr` → [webhook-formula/](webhook-formula/index.md)

## [Event notification/](event-notification/index.md)
Use when: querying the notifications the Webhook Messenger has sent, or reading the payload your webhook endpoint receives.
Terms: `EventNotifications`, notification payload, batch notification, CloudEvents, `BizObjProps`
Not here: defining what to listen to → [event-subscription/](event-subscription/index.md)

## [Webhook configuration](webhook-configuration.md)
Use when: changing company-level webhook settings (enablement, limits, retries, timeouts, batching, retention) through admin info.
Terms: `AdminInfo`, `CompanyService_UpdateAdminInfo`, `EnableWebhook`, `MaxNumberOfWebHooks`, `MessageRetentionTime`, `ExcelFolderPath`, error 10001237
Not here: server-wide settings → [configuring](../configuring/index.md); per-request headers → [configuration-by-request](../configuring/configuration-by-request.md)

## [Webhook Messenger](webhook-messenger.md)
Use when: checking that the Webhook Messenger service is reachable, or importing certificates for non-trusted webhook endpoints.
Terms: Webhook Messenger, health check, certificate import tool, SSL certificate
Not here: load balancing and sticky sessions → [high-availability-load-balancing](../high-availability-load-balancing/index.md)

## [Webhook endpoint sample (Node.js)](webhook-endpoint-sample.md)
Use when: implementing or testing the endpoint that receives webhook notifications (Node.js and Express code), answering the handshake, validating Basic, HMAC or OAuth authentication, or fetching event details from Service Layer with a technical user.
Terms: `webhook-service-sample-nodejs`, `/webhook/hmac`, `X-B1-Webhook-Token`, `X-B1-Webhook-Signature`, `Challenge`, `createHmac`, `GetOpenIDConnectProvider`, `X-B1-COMPANYID`, `.env`
Sections: [Run the sample](webhook-endpoint-sample.md#run-the-sample) · [Endpoints](webhook-endpoint-sample.md#endpoints) · [Receiving notifications](webhook-endpoint-sample.md#receiving-notifications) · [Handshake](webhook-endpoint-sample.md#handshake) · [Authentication](webhook-endpoint-sample.md#authentication) · [Calling Service Layer for more details](webhook-endpoint-sample.md#calling-service-layer-for-more-details)
Not here: the handshake and authentication contract sent by SAP Business One → [handshake-mechanism](event-subscription/handshake-mechanism.md); payload fields → [event-notification/](event-notification/index.md)

## [Webhook formula/](webhook-formula/index.md)
Use when: writing a boolean formula to filter events, or looking up a formula operator, function or app variable.
Terms: `FilterExpr`, webhook formula, `UPPER`, `LEN`, `DATE`, `IFNULL`, `ROUND`, `app.CurrentUser`
Not here: OData `$filter` → [query-options](../consuming-service-layer/query-options/index.md)

## [Webhooks FAQ](faq.md)
Use when: troubleshooting retries, ordering, duplicate notifications, URL validation errors, retry versus replay, or slow endpoints.
Terms: retry policy, replay, duplicate notifications, URL validation, error 10001237
Not here: general Service Layer questions → [faq](../faq/index.md)
