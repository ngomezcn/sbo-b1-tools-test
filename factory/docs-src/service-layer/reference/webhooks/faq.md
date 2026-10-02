---
title: Webhooks FAQ
source: pdf pp. 222-224, sec 7.8
summary: Answers to common webhook questions - retry triggers and policy, ordering, duplicates, URL validation errors, retry versus replay, endpoint reliability, slow endpoints, and error 10001237.
---

# Webhooks FAQ

### When does the Webhook Messenger need to retry?

Retry occurs when the webhook returns the following HTTP status codes:

- 5XX, such as 500 (Internal Server Error), 502 (Bad Gateway), 503 (Service Unavailable), 504 (Gateway Timeout)
- 408 (Request Timeout)
- 429 (Too Many Requests)

Retries also occur when other network exceptions are encountered, such as client connection timeouts, connection refused, or DNS resolution failures.

<!-- supplement -->

Other 4xx responses (bad request, authentication failure, not found) are not retried: the notification is marked failed at once. 3xx redirects are not followed.

<!-- /supplement -->

### What is the retry policy for webhook notifications?

The Webhook Messenger retries sending the notification up to five times using an exponential backoff strategy. The initial retry interval is two seconds and doubles with each subsequent retry (i.e., 2s, 4s, 8s, 16s, 32s). If all retries fail, the notification is marked as failed, and no further attempts are made.

### Are webhook notifications sent in the order of events?

At the single company level, the Webhook Messenger attempts to send notifications in the order events occur, under all conditions and retries. However, if the same webhook is created to receive events from other companies, the order cannot be ensured. It is recommended that the receiving systems be designed to handle potential out-of-order notifications.

### Are duplicate notifications sent for the same event?

The Webhook Messenger ensures that each event triggers a single notification. However, retries due to transient failures may result in duplicate notifications. The receiving system should be idempotent and use unique identifiers, such as event IDs in the payload, to handle duplicates gracefully.

<!-- supplement -->

A slow endpoint causes duplicates too: if it takes longer than `WebhookRequestTimeout` to answer, the Webhook Messenger sees a timeout and retries even though the endpoint processed the event. Answer with HTTP 200 as soon as the request is received and process the events afterwards.

<!-- /supplement -->

### What are typical errors when validating a Webhook URL?

Each webhook undergoes a validation check on the Webhook URL during system initialization or runtime. Common errors include:

- **Malformed URL format:** The URL must be correctly formatted and use HTTPS. For example, `https://example.com/webhook` is valid. A URL like `http://example.com/webhook` is invalid because it does not use HTTPS. A URL without a valid domain or IP address is also invalid, such as `https://webhook` or `https://256.256.256.256/webhook`.
- **Connection refused:** The webhook service must be running and accessible from the SAP Business One system. For example, if the webhook service is hosted on `https://partner-webhook-service:3000/MyWebhook`, ensure the service is up, listening on port 3000, and not blocked by firewall rules.
- **DNS/IP mismatch SSL certificate:** The SSL certificate must match the domain or IP address in the URL. For example, if the URL is `https://example.com/webhook`, the SSL certificate must be issued for `example.com`. If the URL uses an IP address, the SSL certificate must include that IP address in its Subject Alternative Name (SAN) field. This check is enforced regardless of the `VerifyCertificate` setting.
- **Request timeout:** The webhook service must respond within the configured timeout period (default is 10 seconds). Exceeding this time results in a timeout error.
- **SSL certificate untrusted:** If `VerifyCertificate` is set to "tYES", the SSL certificate must be valid and trusted. If not, consider setting `VerifyCertificate` to "tNO" in non-production environments, or import the certificate into the trusted store using the built-in tools in the installation directory.

When these errors occur, the Webhook Messenger logs the error details and deactivates the webhook. The webhook does not receive any event notifications until it is reactivated after resolving the issues. To reactivate the webhook, update it by calling the webhook subscription resume API.

### What is the difference between retry and replay?

Retry is an automatic mechanism performed by the Webhook Messenger to resend a notification when the initial delivery attempt fails due to transient issues, such as network errors or server unavailability. The messenger retries sending the notification based on the configured retry policy (for example, number of retries, retry intervals) until it either succeeds or exhausts all retry attempts.

Replay, on the other hand, is a manual operation triggered by calling the `Replay` API for a specific webhook subscription. It resends all missed event notifications that occurred during the downtime when the webhook was inactive or encountered issues. The replay operation is typically initiated after resolving the issues that caused the webhook to become inactive, allowing the webhook to catch up on any events it missed during that period.

### What are the common practices to ensure a webhook endpoint is reliable and available?

To ensure reliability and availability of a webhook endpoint, follow these best practices:

- Implement high availability and failover mechanisms for the webhook service.
- Use robust error handling and logging to monitor webhook activity.
- Ensure the webhook service can handle retries and duplicate notifications gracefully.
- Regularly test the webhook endpoint to ensure it is reachable and functioning correctly.
- Monitor performance metrics to identify and address potential bottlenecks.

### What happens when the partner’s endpoint responds slowly and many notifications accumulate? How is the queue managed in that case?

In this case, notifications are placed in the memory queue if there is available space. If the queue is full, the messenger waits until some notifications are removed and sent to the webhook endpoint. Meanwhile, batch operations are supported, allowing multiple notifications to be sent in a single request. This approach ensures acceptable performance when dealing with slow-responding webhook endpoints.

### How to solve the error 10001237 when enabling webhook functionality for a company?

A common error is "10001237 – Enter valid folder path". This error indicates that one or more folder paths configured in the company admin info (for example, ExcelFolderPath or XMLFileFolderPath) don't exist on the server where the Service Layer is running. Alternatively, the Service Layer service account doesn't have the necessary permissions to access them.

To resolve this issue, ensure that the specified directories exist and that the Service Layer has the appropriate access rights.

If you don't use these folders, you can set them to temporary or empty paths to bypass this error. For example:

```http
 POST CompanyService_UpdateAdminInfo

 {
     "AdminInfo": {
         "EnableWebhook": "tYES",
         "ExcelFolderPath": "",
         "XMLFileFolderPath": ""
     }
 }
```
