---
title: JavaScript Extension
source: pdf pp. 116-116, sec 3.19
summary: Overview of the Service Layer JavaScript extension, which lets users embed JavaScript on the server side to build extension applications.
---

# JavaScript Extension

As of SAP Business One 9.2 PL04, Service Layer allows users to develop their own extension application by embedding JavaScript in the server side.

## [Parsing engine, framework, entry function and URL mapping](framework.md)
Use when: understanding how a script is structured, its entry function per HTTP method, and its `/script` URL.
Terms: V8, entry function, `/script/<partner>/<script>`, partner, framework

## [SDK overview, Http request and response API](http-api.md)
Use when: reading the request or writing the response from a script.
Terms: `HttpModule.js`, request, response, `getJsonObj`

## [Entity CRUD API](entity-crud-api.md)
Use when: creating, getting, updating or removing entities from a script.
Terms: `EntitySet`, `ServiceLayerContext`, `create`, `get`, `update`, `remove`
Not here: CRUD over HTTP → [crud-operations](../crud-operations.md)

## [Entity query API](entity-query-api.md)
Use when: querying or counting entities from a script, including case-insensitive queries.
Terms: `query`, `count`, `B1S-CaseInsensitive`

## [Transaction API](transaction-api.md)
Use when: grouping script operations in a transaction.
Terms: `startTransaction`, `commitTransaction`, `rollbackTransaction`, `isInTransaction`
Not here: HTTP change sets → [batch-operations](../batch-operations.md)

## [Exception API](exception-api.md)
Use when: handling compile, runtime or user exceptions in scripts.
Terms: `ScriptException`, compile exception, runtime exception

## [Logging and SDK generator tool](logging-and-sdk-generator.md)
Use when: logging from a script or generating the SDK from metadata.
Terms: `console.log`, `Metadata2JavaScript`, `JAVA_HOME`

## [JavaScript deployment](deployment.md)
Use when: packaging, importing and assigning a script, then calling it.
Terms: `.ard`, extension manager, Extension Import Wizard, company assignment

## [Typical use cases and consuming a script service from .NET](use-cases.md)
Use when: looking for complex-transaction and UDO script examples, or calling a script service from .NET.
Terms: complex transaction, UDO script, Web Http, .NET
