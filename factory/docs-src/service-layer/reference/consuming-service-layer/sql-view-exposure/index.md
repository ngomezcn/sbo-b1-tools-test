---
title: SQL View Exposure
source: pdf pp. 67-67, sec 3.8
summary: Overview of exposing customized SQL views as OData entities on Microsoft SQL Server, with routing to the detailed topics.
---

# SQL View Exposure

As of SAP Business One 10.0 PL02, Service Layer on Microsoft SQL Server is able to automatically discover and expose the regular customized SQL views in OData V3/V4 protocol.

> **Note**
>
> SQL Views are applicable only for SAP Business One 10.0 with Microsoft SQL Server.

## [Create, expose and locate a SQL view](create-and-expose-view.md)
Use when: creating a view, exposing or unexposing it, finding its endpoint and metadata.
Terms: `SQLViews`, `view.svc`, expose, unexpose

## [Query a SQL view](query-view.md)
Use when: querying an exposed view by key, with paging, options or aggregation.
Terms: `view.svc`, `$apply`, paging, `odata.maxpagesize`

## [Authorize a SQL view](authorize-view.md)
Use when: a normal user cannot access an exposed view.
Terms: Authorizations window, superuser, view permission
Not here: Semantic Layer view permission → [view-authorization](../semantic-layer-views/view-authorization.md)
