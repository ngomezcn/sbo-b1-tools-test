---
title: Configuration by Request
source: pdf pp. 174-175, sec 6.3
summary: How to override b1s.conf options for a single request with a B1S-prefixed HTTP header.
---

# Configuration by Request

Except for the connection options, Service Layer supports limiting all configuration options to the request level. You can set the Service Layer-customized HTTP header to overwrite the settings in `b1s.conf` only for the current request.

To configure your settings for the current request, you should use the following format:

```text
B1S-<configuration-item-name>: <value>
```

For example:

- `B1S-WCFCompatible: True`
- `B1S-PageSize: 100`

> **Note**
>
> This feature is available in SAP Business One 9.1 patch level 01 and later.
