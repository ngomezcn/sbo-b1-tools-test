---
title: Webhook Configuration
source: pdf pp. 200-202, sec 7.5
summary: Company-level settings that control webhook behavior (enablement, limits, retries, timeouts, batching, retention) and how to read and change them through CompanyService admin info.
---

# Webhook Configuration

You can adjust several configuration settings to control the behavior of webhooks. These settings are managed at the company level. Here are the key configuration options:

<!-- table: t200-01 -->
- EnableWebhook
  - **Type**: String
  - **Description**: Indicates whether the webhook functionality is enabled.
  - **Constraints**:

    Optional

    Must be either "tYES" or "tNO".

  - **Default**: tNO
  - **Notes**: By default, webhooks are disabled for each company. To enable webhooks, call the Service Layer API `CompanyService_UpdateAdminInfo`.
- MaxNumberOfWebHooks
  - **Type**: Integer
  - **Description**: The maximum number of webhooks a company can create.
  - **Constraints**:

    Optional

    Must be a positive integer.

  - **Default**: 16
  - **Notes**: This setting helps manage the number of webhooks to prevent excessive load on the system.
- MessageTTL
  - **Type**: Integer
  - **Description**: The time-to-live (TTL) for webhook messages, measured in hours. Messages older than this value are discarded.
  - **Constraints**:

    Optional

    Must be a positive integer.

  - **Default**: 24
  - **Notes**: This setting helps manage the lifecycle of webhook messages and ensures that outdated messages aren't processed. It should be significantly less than the `MessageRetentionTime` because messages older than the `MessageRetentionTime` are automatically deleted from the system.
- WebhookRetryTimes
  - **Type**: Integer
  - **Description**: Specifies how many times the system retries sending a webhook notification if the initial attempt fails.
  - **Constraints**:

    Optional

    Must be a positive integer.

  - **Default**: 3
  - **Notes**: This setting helps ensure that transient failures don't result in lost notifications. A value of zero means no retries are attempted.
- WebhookRetryInterval
  - **Type**: Integer
  - **Description**: The interval in seconds between retry attempts for sending webhook notifications.
  - **Constraints**:

    Optional

    Must be a positive integer.

  - **Default**: 2
  - **Notes**: This setting helps manage the frequency of retry attempts to prevent overwhelming the webhook endpoint.
- WebhookRequestTimeout
  - **Type**: Integer
  - **Description**: The timeout in seconds for webhook notification requests.
  - **Constraints**:

    Optional

    Must be a positive integer.

  - **Default**: 10
  - **Notes**: This setting ensures the system doesn't wait indefinitely for a response from the webhook endpoint.
- MessageBatchLimit
  - **Type**: Integer
  - **Description**: The maximum number of messages to send in a single batch to the webhook endpoint.
  - **Constraints**:

    Optional

    Must be a positive integer.

  - **Default**: 1024
  - **Notes**: This setting controls the load on the webhook endpoint by limiting the number of messages sent in one request. Adjust this value based on the capabilities of the receiving system. Use this setting mainly for performance optimization.
- MessageRetentionTime
  - **Type**: Integer
  - **Description**: The retention time in days for webhook messages in the system.
  - **Constraints**:

    Optional

    Must be a positive integer.

  - **Default**: 30
  - **Notes**: This setting determines how long the system stores webhook messages before automatically deleting them. It helps manage storage and prevents old messages from accumulating indefinitely.

You can typically manipulate these options through the Service Layer using the Company Service Admin Info API: `CompanyService_UpdateAdminInfo` and `CompanyService_GetAdminInfo`. For example, to enable webhooks, set the maximum number of webhooks to 20, and set the messenger batch limit to 32, you can send a POST request like this:

```http
POST CompanyService_UpdateAdminInfo
{
    "AdminInfo": {
        "EnableWebhook": "tYES",
        "MaxNumberOfWebHooks": 20
        "MessageBatchLimit": 32
    }
}
```

To retrieve the current webhook configuration settings, send a GET request like this:

```http
GET CompanyService_GetAdminInfo
```

> **Note**
>
> - Use the OData V4 protocol for all Service Layer API calls related to webhooks. The relative path should be `/b1s/v2/`.
> - If the `CompanyService_UpdateAdminInfo` API returns an error such as "10001237 – Enter valid folder path", check that the relevant directories (for example, **ExcelFolderPath** and **XMLFileFolderPath**) exist on the server. For more information, see the [FAQ](faq.md) [page 222] section.
