# FAQ and common issues

## [Common issues](common-issues.md)
Use when: a browser call to Service Layer from another origin fails with a CORS error, or CORS behavior must be tested; or some sessions fail intermittently (HTTP 500, code 407 `Table definition not found`) while the login works and other sessions read fine. The CORS part is a generic guide (not from the Service Layer guide): adapt it to the case. The broken-node part is a verified Service Layer case.
Terms: `Access-Control-Allow-Origin`, `Access-Control-Allow-Headers`, `Access-Control-Allow-Credentials`, `OPTIONS`, preflight, `Origin`, `curl`, DevTools, `ROUTEID`, load balancer, node, `407`, `Table definition not found`
Sections: [curl tests](common-issues.md#using-curl) · [DevTools](common-issues.md#using-browser-devtools) · [Common CORS errors](common-issues.md#common-cors-errors) · [Expected headers](common-issues.md#expected-response-headers) · [Checklist](common-issues.md#troubleshooting-checklist) · [Broken node behind a load balancer](common-issues.md#intermittent-errors-a-broken-node-behind-a-load-balancer)
Not here: enabling CORS in `b1s.conf` (`CorsEnable`, `CorsAllowedOrigins`, `CorsAllowedHeaders`) → [cors](../consuming-service-layer/cors.md)

## [Frequently asked questions](faq.md)
Use when: general questions about Service Layer: how it differs from DI API and DI Server, `PUT` vs `PATCH`, overriding `PATCH` with `POST` and `X-HTTP-Method-Override`, autostart of the `b1s` Linux services, SAP HANA client in a non-default location.
Terms: `PUT`, `PATCH`, `X-HTTP-Method-Override`, `chkconfig`, `b1s`, `b1s50000`, `ldconfig`, `hdbclient`, `installations.client`
Sections: [DI API and DI Server differences](faq.md#what-are-the-differences-between-service-layer-and-other-sap-business-one-extension-apis-such-as-di-api-and-di-server) · [PATCH override](faq.md#what-if-my-http-client-does-not-support-the-patch-method) · [Autostart](faq.md#does-the-service-auto-start-with-system) · [HANA client location](faq.md#does-it-work-if-sap-hana-client-is-not-installed-at-the-default-location)
Not here: webhooks questions (retry, replay, ordering) → [webhooks](../webhooks/faq.md); ETag `If-Match` updates → [etag](../etag/index.md)
