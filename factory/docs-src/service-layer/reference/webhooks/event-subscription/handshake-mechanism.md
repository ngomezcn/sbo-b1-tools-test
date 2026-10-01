---
title: Handshake mechanism
source: pdf pp. 184-186, sec 7.3.1.1
summary: How the token-based handshake between SAP Business One and a webhook endpoint works, when it runs automatically, and what the handshake request looks like for each authentication type.
---

# Handshake mechanism

A handshake mechanism is recommended between the SAP Business One system and webhooks to establish an initial connection during the event subscription process. The handshake process includes the following steps:

1. **Generation:** SAP Business One generates a random token as part of the handshake initiation. This token is unique to each handshake session.
2. **Transmission:** The token is sent to the webhook endpoint as part of an HTTP request. It is included in the request headers as a custom header `X-B1-Webhook-Token`, like this:

   ```http
   GET https://partner-webhook-service:3000/MyWebhook
   X-B1-Webhook-Token: <token>
   ```

3. **Response:** The webhook endpoint must recognize the challenge request and respond appropriately by echoing back the token in the response body to match the expectations of SAP Business One. For example, it can return a JSON response body like this:

   ```json
   {
       "Challenge": "<token>"
   }
   ```

4. **Validation:** SAP Business One validates the response from the endpoint. If the echoed challenge token is as expected, the handshake is successful, and the webhook is confirmed as effective.

> **Note**
>
> To support the handshake, the webhook endpoint must support GET requests, process the custom header, and respond in the expected format.

## Handshake Scenarios

You can manually trigger the handshake process by calling the handshake API. Additionally, the system automatically triggers the handshake process in the following scenarios:

- **During webhook creation:** If the `Handshake` property is set to "tYES" when creating a new webhook subscription, the handshake process automatically initiates to verify the webhook endpoint. If the handshake fails, the system does not create the webhook and returns an error message.
- **During webhook activation:** If a webhook subscription is resumed from an inactive state by calling the `Resume` API and the `Handshake` property is "tYES", the handshake process automatically initiates to ensure the webhook endpoint is reachable and functioning correctly. If the handshake fails, the webhook remains inactive and an error message is logged.

## Handshake with Authentication

The handshake process supports authentication. If the webhook endpoints require authentication, ensure that the `AuthenticationType` and `AuthenticationCred` properties are correctly set before starting the handshake process. This ensures that the handshake request includes the necessary authentication or signature headers.If authentication fails, the handshake does not complete. The system returns an appropriate error message.

For example, if the webhook requires basic authentication, the following request is sent during the handshake process:

```http
GET https://partner-webhook-service:3000/MyWebhook
X-B1-Webhook-Token: <token>
Authorization: Basic base64(username:password)
```

If the webhook requires OAuth authentication, the following request is sent during the handshake process:

```http
GET https://partner-webhook-service:3000/MyWebhook
X-B1-Webhook-Token: <token>
Authorization: Bearer <access_token>
```

If the webhook requires HMAC authentication, the following request is sent during the handshake process:

```http
GET https://partner-webhook-service:3000/MyWebhook
X-B1-Webhook-Token: <token>
X-B1-Webhook-Signature: <signature>
```

Here, `<signature>` is generated using the HMAC algorithm specified in the `AuthenticationCred` property, with the `<token>` as the message and the secret key from `AuthenticationCred`.

If no authentication is required, the handshake request will simply include the `X-B1-Webhook-Token` header without any additional authentication headers, as shown below:

```http
GET https://partner-webhook-service:3000/MyWebhook
X-B1-Webhook-Token: <token>
```
