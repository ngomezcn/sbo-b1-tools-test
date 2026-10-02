---
title: Webhook Endpoint Sample (Node.js)
source: external SAP sample webhook-service-sample-nodejs (MIT license); https://help.sap.com/doc/c20c38825f674af8a1f72c9f596969a5/10.0/en-US
summary: Reference implementation of a webhook receiving endpoint in Node.js and Express - routes per authentication mode, handshake response, Basic, HMAC and OAuth validation, notification handling, and how to run it.
---

# Webhook Endpoint Sample (Node.js)

- [What the sample does](#what-the-sample-does)
- [Run the sample](#run-the-sample)
- [Endpoints](#endpoints)
- [Receiving notifications](#receiving-notifications)
- [Handshake](#handshake)
- [Authentication](#authentication)
- [Calling Service Layer for more details](#calling-service-layer-for-more-details)

SAP provides this sample as the download [webhook-service-sample-nodejs.zip](https://help.sap.com/doc/c20c38825f674af8a1f72c9f596969a5/10.0/en-US) (MIT license). It is a basic example for demonstration only: it is not production-ready and must be reviewed, tested and hardened before real use. Use it as a model for your own webhook endpoint, or as a test endpoint when you create an event subscription.

The excerpts below are the parts that matter for implementing an endpoint. The SAPUI5 web UI, the certificates, `package-lock.json` and the other files in the zip are omitted.

## What the sample does

- Receives webhook events from SAP Business One and validates their authentication.
- Answers the handshake request (`GET`) that SAP Business One sends to validate the URL.
- Pushes received events to connected browser clients through a WebSocket, shown in a SAPUI5 web page.
- Retrieves event details from Service Layer through a technical user (OAuth client credentials).
- Keeps notifications in memory only.

Dependencies (`package.json`): `express` ^5, `axios`, `ws`, `jsonwebtoken`, `dotenv`, `morgan`, `http-status-codes`, `body-parser`; Node.js v18 or higher.

## Run the sample

Prerequisites:

- SAP Business One system configured for webhooks, with the Webhook Messenger service running (see [webhook-messenger](webhook-messenger.md)).
- An SSL certificate for HTTPS. The sample ships a self-signed certificate with `localhost` as subject name in `cert/server.key` and `cert/server.crt`. To use your own, replace those files.
- The sample registered as a daemon app in the SAP Business One Extension SSO Manager. The generated client credentials go in the `.env` file.

Steps:

1. Unzip the sample and open the extracted folder.
2. Run `npm install`.
3. With a self-signed certificate, import it into your trusted certificate store to avoid browser warnings. Also import it into the Webhook Messenger key store with the certificate tool in the Webhook Messenger installation folder (Windows: `C:\Program Files\SAP\SAP Business One Webhook Messenger\tools`; Linux: usually `/usr/sap/SAPBusinessOne/WebhookMessenger/tools`).
4. Create the `.env` file (see below).
5. Run `npm start`, then open `https://localhost:3000`.
6. Create an event subscription whose `WebhookURL` is `https://localhost:3000/webhook` (see [subscription-operations](event-subscription/subscription-operations.md)). Received events appear in the web page.

The host name in `WebhookURL` must match the subject name (Common Name or, preferably, a Subject Alternative Name) of the SSL certificate, otherwise the Webhook Messenger cannot establish the connection. For `https://localhost:3000` the certificate must contain `localhost`.

Environment variables read from `.env`:

| Variable | Used for |
|---|---|
| `http_port` | HTTPS port of the server; default `3000`. The WebSocket server listens on `http_port` + 1. |
| `service_layer_root_url` | Root URL of Service Layer, used by the details proxy. |
| `sld_root_url` | Root URL of the System Landscape Directory, used to find the OpenID Connect provider and the company ID. |
| `ignore_ssl_errors` | `true` to accept untrusted certificates when the sample calls SLD or Service Layer. |
| `client_id`, `client_secret` | Client credentials of the daemon app, for the OAuth token request. |
| `hmac_secret_key` | Secret used to verify HMAC signatures. |
| `basic_auth_user`, `basic_auth_pass` | Credentials expected for Basic authentication. |

## Endpoints

The server is an HTTPS Express app. Every route below handles `GET` (handshake) and `POST` (notifications); a `HEAD` request returns 200 so that clients can check that the server is reachable.

| Endpoint | Authentication |
|---|---|
| `/webhook` | Detected from the request: `Bearer` header is OAuth, `Basic` header is Basic, `X-B1-Webhook-Signature` header is HMAC, otherwise none |
| `/webhook/none` | None |
| `/webhook/basic` | Basic |
| `/webhook/hmac` | HMAC |
| `/webhook/oauth` | OAuth |

```javascript
// Handle HEAD requests globally, because clients may use HEAD request to check if the webhook server is reachable
app.use((req, res, next) => {
        if (req.method === 'HEAD') {
            res.sendStatus(StatusCodes.OK);
        } else {
            next();
        }
});

// Webhook endpoints with OAuth authentication mode
app.use('/webhook/oauth', async (req, res) => {
    processNotificationRequests(req, res, authMode ='OAuth');
});

// General webhook endpoint that supports all authentication modes
app.use('/webhook', async (req, res) => {
    processNotificationRequests(req, res);
});
```

The `/webhook/hmac`, `/webhook/basic` and `/webhook/none` routes are the same as the OAuth one with `'HMAC'`, `'Basic'` and `'None'`.

## Receiving notifications

`processNotificationRequests` authenticates the request first, answers a `GET` with the handshake, and handles a `POST` as a list of notifications.

```javascript
// Process notification requests for webhook endpoints
function processNotificationRequests(req, res, authMode) {
    const result = authenticateRequest(req, authMode);
    if (!result.valid) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: result.error });
    }

    // The client may initiates a handshake request by sending a GET request to the webhook endpoint.
    if (req.method === 'GET') {
        return performHandshake(req, res);
    }

    // Process notifications
    if (req.method === 'POST') {
        const newNotifications = handleNotifications(req, res);
        broadcastNotifications(newNotifications);
    }
}
```

The body of a `POST` is a JSON array of notifications (see [payload-structure](event-notification/payload-structure.md)). The endpoint rejects anything else with 400 and answers 200 with a JSON body on success:

```javascript
// Returns the handled notifications
function handleNotifications(req, res) {
    const newNotifications = req.body;
    if(!newNotifications || !Array.isArray(newNotifications) || newNotifications.length === 0) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid webhook payload' });
        return [];
    } else {
         for(const notification of newNotifications) {
            notification.notificationNo = allNotifications.length + 1,
            allNotifications.push(notification);
        }
        res.status(StatusCodes.OK).json({ status: 'success', no: allNotifications.length });
        return newNotifications;
    }
}
```

## Handshake

SAP Business One validates a webhook URL with a `GET` request that carries the `X-B1-Webhook-Token` header (see [handshake-mechanism](event-subscription/handshake-mechanism.md)). The endpoint must answer 200 with the token echoed in the `Challenge` field. The sample also checks that the token is a UUID v4.

```javascript
// Validate if string is UUID v4
function validateUUID(str) {
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89abAB][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidV4Regex.test(str);
}

// Perform handshake for webhook endpoint
function performHandshake(req, res) {
    /// Get the X-B1-Webhook-Token and check if the token is a valid UUID v4 string
    const b1WebhookToken = req.get('X-B1-Webhook-Token');
    if (!b1WebhookToken || !validateUUID(b1WebhookToken)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid or missing X-B1-Webhook-Token' });
    }
    /// Echo back the token in the Challenge field to indicate a successful handshake.
    return res.status(StatusCodes.OK).json({ Challenge: b1WebhookToken });
}
```

## Authentication

`authenticateRequest` picks the validator by the explicit mode of the route, or by the request headers on `/webhook`:

```javascript
// Determine the authentication mode from the request
function getAuthenticationMode(req) {
    const authHeader = req.get('Authorization');
    if (authHeader) {
        if (authHeader.startsWith('Bearer ')) {
            return 'OAuth';
        } else if (authHeader.startsWith('Basic ')) {
            return 'Basic';
        }
    }
    const signature = req.get('X-B1-Webhook-Signature');
    if (signature) {
        return 'HMAC';
    }
    return 'None';
}

// Authenticate the request based on the determined authentication mode
function authenticateRequest(req, auth = null) {
    const authMode = auth ? auth: getAuthenticationMode(req);
    switch (authMode) {
        case 'OAuth':
            return validateOAuth(req);
        case 'Basic':
            return validateBasicAuth(req);
        case 'HMAC':
            return validateHMACSignature(req);
        case 'None':
            console.warn('No authentication provided');
            break;
    }
    return {valid: true, error: null};
}
```

### HMAC

The signature is the Base64 HMAC-SHA256 of the message, computed with the shared secret, and sent in `X-B1-Webhook-Signature`. For a `POST` the message is the JSON serialization of the notification array. For the handshake `GET` it is the value of `X-B1-Webhook-Token`.

```javascript
// Validate HMAC signature
function validateHMACSignature(req) {
    const signature = req.get('X-B1-Webhook-Signature');
    if (!signature){
        return { valid: false, error: 'No signature provided' };
    }

    let message = '';
    if (req.method === 'POST') {
        if (!req.body || !Array.isArray(req.body) || req.body.length === 0) {
            return { valid: false, error: 'Invalid webhook payload' };
        }
        message = JSON.stringify(req.body);
    } else if(req.method === 'GET') {
        message = req.get('X-B1-Webhook-Token');
    }
    const hmac = crypto.createHmac('sha256', HMAC_SECRET_KEY);
    hmac.update(message);
    const expectedSignature = hmac.digest('base64');
    if(signature !== expectedSignature) {
        return { valid: false, error: 'Invalid HMAC signature' };
    }
    return { valid: true,  signature};
}
```

`JSON.stringify(req.body)` re-serializes the parsed body. It matches the signature only if the serialization is byte-identical to what SAP Business One signed; a more robust implementation signs the raw request body.

### Basic

```javascript
function validateBasicAuth(req) {
    const authHeader = req.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return { valid: false, error: 'Invalid Authorization header' };
    }
    const base64Credentials = authHeader.substring(6);
    if (!base64Credentials) {
        return { valid: false, error: 'No credentials provided' };
    }
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    if (!username || !password) {
        return { valid: false, error: 'Invalid Basic Authorization credentials' };
    }
    // Optionally, check against expected values:
    if (username !== BASIC_AUTH_USER || password !== BASIC_AUTH_PASS) {
        return { valid: false, error: 'Incorrect username or password' };
    }
    return { valid: true, username };
}
```

### OAuth

The sample only decodes the JWT from the `Authorization: Bearer` header and checks that it is not expired. It does not verify the token signature, issuer or audience; a real endpoint must do so.

```javascript
function validateOAuth(req) {
    const authHeader = req.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { valid: false, error: 'Invalid Authorization header' };
    }
    const token = authHeader.substring(7);
    if (!token) {
        return { valid: false, expired: false, error: 'No token provided' };
    }
    try {
        const decoded = jwt.decode(token, { complete: true });
        if (!decoded) {
            return { valid: false, expired: false, error: 'Invalid token' };
        }
        const exp = decoded.payload.exp;
        if (exp && Date.now() >= exp * 1000) {
            return { valid: false, expired: true, payload: decoded.payload, error: 'Token expired' };
        }
        return { valid: true, expired: false, payload: decoded.payload };
    } catch (err) {
        return { valid: false, expired: false, error: err.message };
    }
}
```

With `None`, the sample accepts every request and only logs a warning.

## Calling Service Layer for more details

A notification carries limited data, so the sample exposes `GET /api/b1s/*` as a proxy that reads the full object from Service Layer. The request must include the header `companySchemaName`. For example, `GET /api/b1s/v2/BusinessPartners('C20000')` is forwarded to `<service_layer_root_url>/b1s/v2/BusinessPartners('C20000')`.

For each call the sample authenticates as a technical user with the OAuth client credentials flow:

1. `GET <sld_root_url>/sld/sld0100.svc/GetOpenIDConnectProvider` (with `Accept: application/json`) returns the `DiscoveryUri` of the OpenID Connect provider.
2. `GET` that discovery URL and read `token_endpoint`.
3. `POST` to `token_endpoint` with `Authorization: Basic base64(client_id:client_secret)`, content type `application/x-www-form-urlencoded` and the body `grant_type=client_credentials&scope=openid`. The access token is cached and reused until it is within 60 seconds of expiry.
4. `GET <sld_root_url>/sld/sld0100.svc/CurrentUserInfo?IncludeB1UserBinding=true` with `Authorization: Bearer <token>` returns the user's company bindings; the `CompanyID` whose `CompanySchemaName` matches the header is the company ID.
5. `GET` the Service Layer URL with `Authorization: Bearer <token>` and `X-B1-COMPANYID: <CompanyID>`.
