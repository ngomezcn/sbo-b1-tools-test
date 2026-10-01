---
title: Webhook Messenger
source: pdf pp. 202-203, sec 7.6
summary: What the Webhook Messenger service does (delivery, retries, batching, replay), how to check it is reachable, and how to import certificates for non-trusted webhook endpoints.
---

# Webhook Messenger

The Webhook Messenger is a background service that delivers webhook notifications to partners' webhooks when subscribed events occur. The messenger manages retries, timeouts, and message batching to ensure reliable delivery. It offers the following key features:

- **Asynchronous processing:** The messenger processes webhook notifications asynchronously to avoid blocking the core business application within the SAP Business One core.
- **Retry mechanism:** If a notification fails to deliver, the messenger retries sending it according to the configured retry policy.
- **Batching:** The messenger can batch multiple notifications into a single request to optimize performance.
- **Configuration:** You can configure the messenger's behavior through various settings by calling the Service Layer API. These settings include retry times, retry intervals, request timeouts, and batch limits.
- **Security:** The messenger supports secure communication with webhook endpoints, including SSL certificate verification and various authentication methods, such as HMAC and OAuth.
- **Order guarantee:** The messenger attempts to send notifications in the order events occur within a single company level. However, if the same webhook is created to receive events from other companies, the order cannot be ensured across companies.
- **Deactivation and reactivation:** The messenger can deactivate webhooks that consistently fail to deliver notifications. You can reactivate these webhooks through the resume API once the issues are resolved.
- **Handshake support:** The messenger supports a handshake mechanism to verify the availability and readiness of webhook endpoints before sending notifications.
- **Performance optimization:** The messenger is optimized for performance, ensuring that notifications are delivered promptly and efficiently.
- **Replay support:** The messenger supports replaying missed notifications for webhooks that were inactive or encountered issues during downtime. Note that the replay operation can only be triggered manually for a specific webhook by calling the `Replay` API. During the replay operation, the messenger stops sending new event notifications to all other normal webhooks until all missed notifications are successfully delivered. It is recommended to use the replay operation judiciously to avoid impacting the delivery of new notifications. If possible, consider implementing high availability and failover mechanisms for the webhook endpoint to minimize downtime and the need for replaying missed notifications.

## Health Check

To test whether the Webhook Messenger is reachable from your network, use tools like `telnet` or `nc`. Check connectivity on the default port 40008. For example, run the following command in your terminal:

```text
telnet {Your WebhookMessenger Host} 40008
```

If the connection is successful, you should see a message from SAP Business One Webhook Messenger indicating that the connection is established. If the connection fails, check your network settings, firewall rules, or ensure that the webhook service is running and accessible.

## Certificate Import Tool

For security reasons, the messenger supports secure communication with webhook endpoints. If the webhook endpoint uses a self-signed certificate or a certificate issued by a non-trusted Certificate Authority (CA), you may need to import the certificate into the trusted store used by Webhook Messenger. Use the certificate import tool, which is a PowerShell or shell script provided in the tools folder in the installation directory of SAP Business One Webhook Messenger. For example, on Windows, the tool is by default located under `C:\Program Files\SAP\SAP Business One Webhook Messenger\tools`. For detailed usage instructions, run the tool with the `--help` option as a system administrator.
