---
title: SAP Business One Semantic Layer View Exposure
source: pdf pp. 52-52, sec 3.7
summary: Overview of the Semantic Layer, the OData web service that exposes SAP HANA analytics views through Service Layer (SAP HANA only), with pointers to its subtopics.
---

# SAP Business One Semantic Layer View Exposure

Semantic Layer View is for SAP Business One, version for SAP HANA only.

As of SAP Business One 9.3 PL02, version for SAP HANA, Service Layer supports to automatically discover and expose the Semantic Layer views, which are available upon deploying the SAP HANA models in SAP Business One analytics powered by SAP HANA. In this way, Semantic Layer works as an OData web service which is possible to be consumed by clients using OData protocol.

## [Views deployment, exposure scope and OData version](deployment-and-scope.md)
Use when: deploying Semantic Layer views, checking which views are exposed, or which OData version applies.
Terms: Semantic Layer, deploy, exposed views, OData version

## [Semantic Layer service root and metadata](service-root-and-metadata.md)
Use when: finding the service root, reading `$metadata`, or handling views with placeholders.
Terms: `/b1s/v1/sml.svc`, `$metadata`, `id__`, parameter entity, placeholder

## [Semantic Layer view authorization](view-authorization.md)
Use when: a normal user gets 401 on a view.
Terms: 401, General Authorizations, view permission
Not here: authorizing a SQL view → [authorize-view](../sql-view-exposure/authorize-view.md)

## [Semantic Layer view query](view-query.md)
Use when: querying views: all records, options, by key, placeholders, aggregation, `$count`.
Terms: `$apply`, `$count`, `$filter`, by key, placeholders

## [Customized views exposure and query](customized-views.md)
Use when: exposing your own SAP HANA view through the Semantic Layer.
Terms: customized view, model packaging, deployment

## [Semantic Layer basic authentication](basic-authentication.md)
Use when: opening a view in a browser with basic authentication.
Terms: basic authentication, user name with company database, CompanyDB
Not here: normal session login → [login-logout-session](../login-logout-session.md)
