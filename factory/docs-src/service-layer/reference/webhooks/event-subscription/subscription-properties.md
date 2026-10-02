---
title: EventSubscription Properties
source: pdf pp. 186-192, sec 7.3.2
summary: The properties of an EventSubscription (WebhookID, WebhookURL, authentication, certificate and handshake options, state, work mode, event collection) with types, constraints, JSON schemas and examples.
---

# EventSubscription Properties

<!-- table: t186-01 -->
- **Property Name**: WebhookID
  - **Type**: String
  - **Description**: A unique identifier for the webhook.
  - **Constraints**:

    Required

    - Must be a non-empty string.
    - Must be unique within the company.

  - **Example**: MyWebhook
- **Property Name**: WebhookURL
  - **Type**: String
  - **Description**: The URL to which the webhook notifications are sent.
  - **Constraints**:

    Required

    - Must be a valid URL.
    - Must be unique within the company.
    - Must use HTTPS for secure communication.

  - **Example**: https://partner-webhook-service:3000/MyWebhook
- **Property Name**: AuthenticationType
  - **Type**: String
  - **Description**: The type of authentication to use.
  - **Constraints**:

    Optional

    If provided, it must be one of the supported authentication types: "None", "Basic", "HMAC", "OAuth".

    Default: "HMAC"

    > **Note**
    >
    > If the type is not "None", you must provide the `AuthenticationCred` property.

  - **Example**: Basic

<!-- table: t187-01 -->
- **Property Name**: AuthenticationCred
  - **Type**: String
  - **Description**: The credentials for authentication, if applicable.
  - **Constraints**:

    Optional

    - Required if `AuthenticationType` is not "None".
    - Must be a non-empty string if provided. It should follow a specific JSON-string format based on the authentication type.

    > **Note**
    >
    > - For "None" authentication, this property is ignored.
    > - For "Basic" authentication, when converting from a string to JSON, it should follow the specified JSON schema:
    >
    > ```json
    > {
    >     "type": "object",
    >     "properties": {
    >         "Username": {
    >             "type":
    > "string"
    >         },
    >         "Password": {
    >             "type":
    > "string"
    >         }
    >     },
    >     "required":
    > ["Username", "Password"]
    > }
    > ```
    >
    > - For "HMAC" authentication, it should follow the specified JSON schema:
    >
    > ```json
    >   {
    >       "type": "object",
    >       "properties": {
    >           "Key": {
    >               "type":
    > "string"
    >           },
    >           "Algorithm": {
    >               "type":
    > "string",
    >               "enum":
    > ["HMACSha256",
    > "HMACSha384",
    > "HMACSha512"]
    >           }
    >       },
    >       "required":
    > ["Key", "Algorithm"]
    >   }
    > ```
    >
    > - For "OAuth" authentication, it should follow the specified JSON schema:
    >
    > ```json
    >   {
    >       "type": "object",
    >       "properties": {
    >
    > "token_endpoint": {
    >               "type":
    > "string",
    >               "format":
    > "uri"
    >           },
    >           "client_id": {
    >               "type":
    > "string"
    >           },
    >
    > "client_secret": {
    >               "type":
    > "string"
    >           },
    >           "grant_type":
    > {
    >               "type":
    > "string",
    >               "enum":
    > ["client_credentials"]
    >           }
    >       },
    >       "required":
    > ["token_endpoint",
    > "client_id",
    > "client_secret",
    > "grant_type"]
    >   }
    > ```

  - **Example**:

    For "Basic" authentication: `{"Username": "partner1", "Password": "12345"}`

    For "HMAC" authentication: `{"Key": "my_secret_key", "Algorithm": "HMACSha256"}`

    For "OAuth" authentication: `{"token_endpoint": "https://auth.example.com/oauth2/token", "client_id": "myClientId", "client_secret": "mySecret", "grant_type": "client_credentials"}`

- **Property Name**: VerifyCertificate
  - **Type**: String
  - **Description**: Indicates whether to verify the SSL certificate of the webhook endpoint represented by WebhookURL.
  - **Constraints**:

    Optional

    Must be either "tYES" or "tNO".

    Default: "tYES"

    > **Note**
    >
    > If set to "tYES", the system validates the SSL certificate of the webhook endpoint to ensure secure communication. In test environments, you might set it to "tNO" to bypass certificate validation. However, in production environments, it is recommended to keep it as "tYES" to ensure security.

  - **Example**: tNO
- **Property Name**: State
  - **Type**: String
  - **Description**: The current state of the webhook subscription.
  - **Constraints**:

    Required

    The value must be one of the following:

    - "Active": The webhook is active and receives event notifications.
    - "Inactive": The webhook is inactive and does not receive event notifications.
    - "Exceptional": The webhook has encountered issues, such as repeated delivery failures. In this state, the system retries delivery. If the issues persist after the maximum number of retry attempts, it transitions to the "Inactive" state. If the issues are resolved within the maximum retry attempts, it returns to the "Active" state.

    Default: "Active".

  - **Example**: Active
- **Property Name**: WorkMode
  - **Type**: String
  - **Description**: The working mode of the webhook subscription.
  - **Constraints**:

    Required

    Must be one of the following values:

    - "Standard": Represents that the webhook operates in normal mode, sending event notifications. If any notifications are missed during downtime, the messenger ignores them and does not resend.
    - "Replay": The webhook operates in replay mode, sending missed event notifications that occurred during downtime from the last successful delivery time. This mode can only be triggered manually for a specific webhook by calling the `Replay` API.

    Default: "Standard".

  - **Example**: Standard

<!-- table: t190-01 -->
- **Property Name**: Handshake
  - **Type**: String
  - **Description**: Indicates whether a handshake verification is required for the webhook endpoint represented by WebhookURL.
  - **Constraints**:

    Optional

    Must be either "tYES" or "tNO".

    Default: "tYES".

    > **Note**
    >
    > If set to "tYES", the Service Layer sends a handshake request to the webhook endpoint to verify its availability and readiness. In test environments, set this value to "tNO" to bypass handshake verification. In production environments, keep this value as "tYES" to ensure the webhook endpoint is reachable and functioning correctly.

  - **Example**: tNO

<!-- table: t191-01 -->
- **Property Name**: EventCollection
  - **Type**: Array of Event objects
  - **Description**: A collection of events to which the webhook subscribes.
  - **Constraints**:

    Required

    The array must contain at least one event object.

    Each event object includes:

    - `BusinessObject`
      - **Type**: String
      - **Description**: The business object to monitor (for example, Orders or Invoices).
      - **Constraints**:
        - Required
        - Must be consistent with the business object names exposed in Service Layer
    - `TransactionType`
      - **Type**: String
      - **Description**: The type of transaction (for example, Created, Updated, Deleted, or Canceled).
      - **Constraints**:
        - Required
        - Must be consistent with the transaction types defined in the event catalog for the corresponding business object
    - `BizObjProps`

      Available as of SAP Business One 10.0 FP 2608

      - **Type**: String
      - **Description**: A comma-separated list of additional simple properties to include in the webhook notification payload for the specific event. If you don't specify this parameter, only the key fields of the business object are included by default. This parameter allows you to customize the notification payload to include more relevant information about the event.
      - **Constraints**:
        - Optional
        - If provided, must be a non-empty string with property names separated by commas
        - Complex properties (for example, document lines of a sales order or item prices of an item) aren't allowed in the notification payload to avoid potential performance impact and oversize issues
      - **Example**: "DocEntry, CardCode, DocTotal"
    - `FilterExpr`

      Available as of SAP Business One 10.0 FP 2608

      - **Type**: String
      - **Description**: A boolean formula used to filter events for subscription. The formula is evaluated against the business object fields, and only events that satisfy the condition trigger notifications. For formula details, refer to the [Webhook Formula](../webhook-formula/formula-basics.md) [page 203] section.
      - **Constraints**:
        - Optional
        - If provided, must be a valid boolean expression using the supported syntax and operators

  - **Example**:

    - Subscribe to the creation of orders and updates of invoices:

      ```json
      [
          {

      "BusinessO
      bject":
      "Orders",

      "Transacti
      onType":
      "Created"
          },
          {

      "BusinessO
      bject":
      "Invoices"
      ,

      "Transacti
      onType":
      "Updated"
          }
      ]
      ```

    - Available as of SAP Business One 10.0 FP 2608

      Subscribe to the creation of orders and updates of invoices with additional properties and filters:

      ```json
      [
          {

      "BusinessO
      bject":
      "Orders",

      "Transacti
      onType":
      "Created",

      "BizObjPro
      ps":
      "DocEntry,

      CardCode,
      DocTotal",
      ```

      <!-- table: t192-01 -->
      ```json
      "FilterExp
      r":
      "DocTotal
      > 1000"
          },
          {

      "BusinessO
      bject":
      "Invoices"
      ,

      "Transacti
      onType":
      "Updated",

      "BizObjPro
      ps":
      "DocNum,
      DocTime,
      CreateDate
      ",

      "FilterExp
      r":
      "DocDueDat
      e -
      DocDate <
      7"
          }
      ]
      ```

<!-- supplement -->

## Notes

- `WebhookID` and `WebhookURL` cannot be changed after the subscription is created.
- `AuthenticationType` defaults to "HMAC", so a subscription created without it needs `AuthenticationCred`. For a subscription with no authentication, send `"AuthenticationType": "None"` explicitly.
- A subscription is "Inactive" when it was paused with the `Pause` API or when the system deactivated it after repeated delivery failures. Fix the cause, then call `Resume`.

<!-- /supplement -->
