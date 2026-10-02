---
title: Common issues - CORS troubleshooting and intermittent errors from a broken node
source: external (not in the Service Layer guide) - generic CORS testing and troubleshooting guide, plus one verified Service Layer case (broken node behind a load balancer)
summary: Generic, browser-side CORS troubleshooting guide - curl tests, DevTools inspection, common CORS errors with cause and solution, expected headers and a checklist - and a Service Layer case verified on FP 2608 - intermittent HTTP 500 / code 407 on some sessions because one node behind a load balancer is broken.
---

# Common issues

- [How to use this guide](#how-to-use-this-guide)
- [Browser support: testing your CORS configuration](#browser-support-testing-your-cors-configuration)
- [Using curl](#using-curl)
- [Using browser DevTools](#using-browser-devtools)
- [Common CORS errors](#common-cors-errors)
- [Expected response headers](#expected-response-headers)
- [Troubleshooting checklist](#troubleshooting-checklist)
- [Intermittent errors: a broken node behind a load balancer](#intermittent-errors-a-broken-node-behind-a-load-balancer)

## How to use this guide

This guide has two parts.

- CORS (everything up to the troubleshooting checklist): the general guide for testing and troubleshooting CORS. It is **not part of the Service Layer guide** and does not describe Service Layer behavior: the URLs and header values are placeholders. When the user has a CORS problem, go through the tests, errors and checklist here and adapt them to the actual case (their origin, endpoint, headers and credentials).
- [Intermittent errors: a broken node behind a load balancer](#intermittent-errors-a-broken-node-behind-a-load-balancer): a Service Layer case seen in practice and verified on FP 2608. Use it when some sessions fail with the same error on every request while others work.

For how Service Layer enables CORS (`CorsEnable`, `CorsAllowedOrigins`, `CorsAllowedHeaders` in `b1s.conf`) and how its preflight requests look in the logs, see [Cross Origin Resource Sharing (CORS)](../consuming-service-layer/cors.md).

## Browser support: testing your CORS configuration

After configuring CORS on the server, verify that the configuration works. The approaches below cover `curl`, browser DevTools and the browser console.

## Using curl

`curl` is the quickest way to test CORS headers.

### Test a simple request

Test a basic GET request with an `Origin` header:

```bash
# Test with allowed origin
curl -H "Origin: https://example.com" \
     -I https://your-api.com/endpoint

# Expected response headers:
# Access-Control-Allow-Origin: https://example.com
# Vary: Origin
```

### Test a preflight request

For requests with custom headers or methods like PUT/DELETE, browsers send a preflight `OPTIONS` request:

```bash
# Test preflight
curl -H "Origin: https://example.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type, Authorization" \
     -X OPTIONS \
     -I https://your-api.com/endpoint

# Expected response headers:
# Access-Control-Allow-Origin: https://example.com
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
# Access-Control-Allow-Headers: Content-Type, Authorization
# Access-Control-Max-Age: 86400
```

### Test an actual request with custom headers

After the preflight succeeds, test the actual request:

```bash
# POST request with custom headers
curl -H "Origin: https://example.com" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer token123" \
     -X POST \
     -d '{"test":"data"}' \
     https://your-api.com/endpoint
```

### Test a disallowed origin

Verify that unauthorized origins are rejected:

```bash
# Test with disallowed origin
curl -H "Origin: https://evil.com" \
     -I https://your-api.com/endpoint

# Should NOT return Access-Control-Allow-Origin header
```

### Test with credentials

If the API supports credentials (cookies, auth):

```bash
# Test with credentials
curl -H "Origin: https://example.com" \
     --cookie "session=abc123" \
     -I https://your-api.com/endpoint

# Expected response headers:
# Access-Control-Allow-Origin: https://example.com
# Access-Control-Allow-Credentials: true
# Vary: Origin
```

## Using browser DevTools

Browser developer tools provide detailed CORS debugging information.

### Network tab inspection

1. Open DevTools (F12 or right-click, Inspect).
2. Go to the Network tab.
3. Make a cross-origin request from your application.
4. Look for the `OPTIONS` request (preflight) if using custom headers or methods.
5. Click on the request to view headers.
6. Check the response headers for CORS headers:
   - `Access-Control-Allow-Origin`
   - `Access-Control-Allow-Methods`
   - `Access-Control-Allow-Headers`
   - `Access-Control-Allow-Credentials`
   - `Vary: Origin`

### Console error messages

The browser console displays helpful CORS error messages. Common patterns:

- No CORS headers: "No 'Access-Control-Allow-Origin' header is present"
- Origin mismatch: "The 'Access-Control-Allow-Origin' header has a value that is not equal to the supplied origin"
- Credentials issue: "Credential is not supported if the CORS header 'Access-Control-Allow-Origin' is '*'"
- Method not allowed: "Method POST is not allowed by Access-Control-Allow-Methods"
- Header not allowed: "Request header field Authorization is not allowed by Access-Control-Allow-Headers"

### Test in the browser console

Quickly test CORS from the browser console:

```javascript
// Simple GET request
fetch('https://your-api.com/endpoint', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('CORS Error:', error));

// POST with credentials
fetch('https://your-api.com/endpoint', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123'
  },
  body: JSON.stringify({test: 'data'})
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('CORS Error:', error));
```

## Common CORS errors

### No 'Access-Control-Allow-Origin' header is present

- Cause: the server is not sending CORS headers.
- Solution: configure the server to send the `Access-Control-Allow-Origin` header.

### The 'Access-Control-Allow-Origin' header contains multiple values

- Cause: CORS headers are being set in multiple places (for example, both application code and web server configuration).
- Solution: choose one configuration method and remove the duplicate. Check both the application code and the web server configuration.

### Credential is not supported if CORS header is '*'

- Cause: using `Access-Control-Allow-Origin: *` with `Access-Control-Allow-Credentials: true`.
- Solution: specify the exact origin instead of the wildcard when using credentials:

```text
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Credentials: true
```

### Method [METHOD] is not allowed by Access-Control-Allow-Methods

- Cause: the HTTP method in use is not listed in `Access-Control-Allow-Methods`.
- Solution: add the method to the CORS configuration:

```text
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

### Request header field [HEADER] is not allowed

- Cause: a custom header is not listed in `Access-Control-Allow-Headers`.
- Solution: add the header to the CORS configuration:

```text
Access-Control-Allow-Headers: Content-Type, Authorization, X-Custom-Header
```

### Redirect is not allowed for a preflight request

- Cause: the server is redirecting the `OPTIONS` preflight request.
- Solution: ensure preflight `OPTIONS` requests return `204 No Content` without redirects. Check for trailing slash redirects or authentication redirects on `OPTIONS` requests.

## Expected response headers

A properly configured CORS server should return these headers.

For all CORS requests:

```text
Access-Control-Allow-Origin: https://example.com
Vary: Origin
```

For preflight `OPTIONS` requests:

```text
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
Vary: Origin
```

With credentials:

```text
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Credentials: true
Vary: Origin
```

With exposed headers, if the API returns custom headers that the client needs to access:

```text
Access-Control-Expose-Headers: X-Custom-Header, X-Total-Count
```

## Troubleshooting checklist

If CORS is not working, check these common issues:

- Headers sent before output: in PHP, CGI and similar environments, headers must be set before any output.
- Server config vs application code: make sure CORS headers are not set in both places (can cause duplicates).
- `OPTIONS` method handled: ensure the server responds to `OPTIONS` requests with `204 No Content`.
- `Vary` header included: always include `Vary: Origin` when the origin is set dynamically.
- No trailing slashes: URL mismatches (with or without trailing slash) can cause issues.
- Authentication on `OPTIONS`: preflight `OPTIONS` should NOT require authentication.
- Wildcard with credentials: `*` cannot be used with `Access-Control-Allow-Credentials: true`.
- HTTPS requirements: some browsers require HTTPS for certain CORS scenarios.
- Port numbers: different ports are different origins (`https://example.com:3000` is not `https://example.com:8080`).
- Cache issues: clear the browser cache or use incognito/private mode for testing.

## Intermittent errors: a broken node behind a load balancer

Sometimes Service Layer fails only for some sessions. The cause can be a single broken node in a load-balanced deployment. It has been detected on occasion, so it is worth checking when errors are intermittent and the login works.

### Symptom

- Intermittent errors. The login works, but every data request of the affected session fails (seen on `BusinessPartners`, `Items` and `UserTablesMD`).
- HTTP 500 with code 407 and the message `Table definition not found for '@ZZVF_T'.` In OData V3 (`v1`) `code` is a number (`407`); in OData V4 (`v2`) it is a string (`"407"`).
- The same request with another session works.

### Cause

Service Layer can sit behind a load balancer with several nodes. The login assigns a node and the `ROUTEID` cookie keeps the session on that node for its whole life. If one node is broken, every session that lands on it fails and the sessions on the other nodes do not.

> **Verified (FP 2608, 2026-10-02):** The environment tested was behind a load balancer with several nodes (different `ROUTEID` values). In 50 logins, the 6 sessions that landed on one node (`.node4`) failed on every data request and the sessions on the other nodes never failed. After that node was stopped, 50 more logins and reads all succeeded. The table `@ZZVF_T` does not exist in the database (`UserTablesMD('ZZVF_T')` returns 404, `-2028`). Why only that node asks for it is not determined. Not verified on a customer's Service Layer: do not assume it behaves the same there.

### How to recognize it

- The session always fails with the same error, on every request.
- Repeating with a new login works, because it usually lands on another node.
- The `ROUTEID` value of the session helps to identify the node. Compare it between failing and working sessions. Do not copy the `B1SESSION` value anywhere.

### What to do

- Delete the stored session or force a new login, then repeat the request.
- If it always fails, tell the Service Layer administrator, with the affected node.
- Recommended: identify exactly which nodes produce the intermittent errors (log in several times and note the `ROUTEID` of the failing sessions), have the administrator take those nodes out of the balancer, and check whether everything works without them. Stopping the broken node made the errors disappear.
- It cannot be fixed from the client: Service Layer returns the error as is and does not retry.

A 407 can also be legitimate: a user table that really does not exist. The criterion is whether the result changes with another session. If it does, suspect a node; if it fails the same way on every session, the table (or the request) is the problem.
