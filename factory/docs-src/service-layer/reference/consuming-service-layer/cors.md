---
title: Cross Origin Resource Sharing (CORS)
source: pdf pp. 136-137, sec 3.20
summary: Enabling CORS in b1s.conf, configuring allowed origins and headers, and how the preflight OPTIONS process appears in Service Layer.
---

# Cross Origin Resource Sharing (CORS)

- [Enabling CORS](#enabling-cors)
- [Enable to Configure Allowed Headers](#enable-to-configure-allowed-headers)
- [CORS Process](#cors-process)

As of SAP Business One 9.1 patch level 08, version for SAP HANA, CORS is supported to allow trusted origins to access the resource of Service Layer.

## Enabling CORS

By default, a cross domain request is rejected due to the security settings of the browser. To enable CORS, open `b1s.conf` and append two configuration items. For example:

```text
"CorsEnable": true,

"CorsAllowedOrigins": "http://host1:8080;https://host2:8443"
```

You can refer to [Other Configuration Options for Service Layer](../configuring/b1s-conf-options.md) [page 174] for more details about the CORS configurations.

## Enable to Configure Allowed Headers

As of SAP Business One 9.2, version for SAP HANA patch level 07, request headers are allowed to configure in `b1s.conf`.

By default, only `content-type` and `accept` are allowed in the CORS process. However, under some conditions, other headers are needed, e.g. `B1S-CaseInsensitive`. To satisfy this requirement, append the configuration option `CorsAllowedHeaders` in `b1s.conf`. For example:

```text
"CorsAllowedHeaders":"content-type, accept, B1S-CaseInsensitive"
```

> **Note**
>
> You can refer to [Other Configuration Options for Service Layer](../configuring/b1s-conf-options.md) [page 174] for more details about the CORS configurations.

## CORS Process

Once CORS is enabled, browsers first issue an `OPTIONS` request (a preflight request), which is like asking the server for permission to make the actual request. Once permissions have been granted, the browser makes the actual request. The browser handles the details of these two requests transparently. The preflight response can also be cached so that it is not issued on every request. Take the requests received by Service Layer as an example:

```text
[11936] 5- b1s_handler: OPTIONS /b1s/v1/Login from 10.58.81.2

[11936] 6- b1s_handler: POST /b1s/v1/Login from 10.58.81.2

[11936] 7- b1s_handler: OPTIONS /b1s/v1/Items from 10.58.81.2

[11936] 8- b1s_handler: POST /b1s/v1/Items from 10.58.81.2
```
