---
name: docs-service-layer
description: SAP Business One Service Layer reference (guide v1.29): login and sessions, OData CRUD, query options, batch, UDF/UDT/UDO, attachments, semantic layer and SQL views, SQL Query, ETag, server configuration, webhooks, limitations, DI API comparison. Use when writing or debugging code that calls Service Layer, or when asked how a Service Layer feature behaves.
---

# SAP Business One Service Layer

Pick the row matching the question, open that index, then the single hoja it points to.

## By intent

| Developer intent | Example questions | Go to |
|---|---|---|
| Learn what Service Layer is, its requirements, architecture and installation | "which OData version does /b1s/v2 use", "which OS does Service Layer run on", "can I install the load balancer remotely" | [introduction-getting-started](reference/introduction-getting-started/index.md) |

## Confusable terms

| Term | Means | Go to |
|---|---|---|
| Load balancer (architecture) | Apache as transit point and session stickiness in the deployment layout (sec 2.2, 2.3); sticky-session configuration is ch. 9 | [architecture-and-installation](reference/introduction-getting-started/architecture-and-installation.md) |
| Installation | topologies and firewall recommendation (sec 2.3), not server settings (ch. 6) | [architecture-and-installation](reference/introduction-getting-started/architecture-and-installation.md) |
| OData version URIs | `/b1s/v1` vs `/b1s/v2` `$metadata` (sec 1), not the metadata document (sec 3.2) | [introduction](reference/introduction-getting-started/introduction.md) |
