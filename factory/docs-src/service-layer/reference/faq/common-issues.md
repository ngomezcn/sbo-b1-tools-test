---
title: Common issues - CORS troubleshooting
source: external (not in the Service Layer guide) - generic CORS testing and troubleshooting guide
summary: Generic, browser-side CORS troubleshooting guide - curl tests, DevTools inspection, common CORS errors with cause and solution, expected headers and a checklist. Not specific to Service Layer; adapt it to the problem at hand.
---

# Common issues - CORS troubleshooting

- [How to use this guide](#how-to-use-this-guide)
- [Browser support: testing your CORS configuration](#browser-support-testing-your-cors-configuration)
- [Using curl](#using-curl)
- [Using browser DevTools](#using-browser-devtools)
- [Common CORS errors](#common-cors-errors)
- [Expected response headers](#expected-response-headers)
- [Troubleshooting checklist](#troubleshooting-checklist)

## How to use this guide

This is the general guide for testing and troubleshooting CORS. It is **not part of the Service Layer guide** and does not describe Service Layer behavior: the URLs and header values below are placeholders. When the user has a CORS problem, go through the tests, errors and checklist here and adapt them to the actual case (their origin, endpoint, headers and credentials).

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
