# Consuming Service Layer

## [Key elements and terms](overview-key-elements.md)
Use when: understanding the parts of a request URL (service root, resource path, query options, HTTP verb, JSON).
Terms: service root URL, `/b1s/v1`, resource path, query options, HTTP verb, JSON representation

## [Login, logout and sessions](login-logout-session.md)
Use when: logging in or out, handling the session cookie, reusing a session.
Terms: `POST /Login`, `POST /Logout`, `B1SESSION`, `ROUTEID`, `CompanyDB`, session timeout
Not here: sticky sessions behind a load balancer → [high-availability-load-balancing](../high-availability-load-balancing/index.md)

## [Metadata document and service document](metadata-document.md)
Use when: reading `$metadata` or the service document, filtering metadata by scope, entity set, dependency or annotation.
Terms: `$metadata`, service document, `scope`, `entityset`, `dependency`, `annotation`, edmx, OData V4 metadata
Not here: a Semantic Layer service's metadata → [semantic-layer-views](semantic-layer-views/index.md); business object metadata → [sql-query](../sql-query/index.md)

## [CRUD operations on entities](crud-operations.md)
Use when: creating, reading, updating or deleting an entity, addressing it by key, suppressing response content.
Terms: `POST`, `GET`, `PATCH`, `PUT`, `DELETE`, entity key, `Prefer: return-no-content`
Not here: CRUD on the SQLQueries entity → [sql-query](../sql-query/index.md); CRUD from scripts → [javascript-extension](javascript-extension/index.md)

## [Actions](actions.md)
Use when: calling a bound or global action such as Close, or previewing a document.
Terms: `POST Orders(id)/Close`, bound action, global action, `Activities`, preview

## [Query options/](query-options/index.md)
Use when: shaping a GET: filtering, selecting, ordering, paging, aggregating, grouping, joining, expanding.
Terms: `$filter`, `$select`, `$orderby`, `$top`, `$skip`, `$count`, `$inlinecount`, `$apply`, `$crossjoin`, `$expand`, `odata.nextLink`
Sections: [Aggregation](query-options/aggregation.md) · [Grouping](query-options/grouping.md) · [Cross-joins](query-options/cross-joins.md) · [Row-level filter](query-options/row-level-filter.md)
Not here: paging a stored SQL query → [sql-query](../sql-query/index.md)

## [Semantic Layer view exposure/](semantic-layer-views/index.md)
Use when: querying SAP HANA analytics views exposed by the Semantic Layer (`sml.svc`), SAP HANA only.
Terms: `sml.svc`, Semantic Layer, `id__`, placeholders, view authorization, `$apply`, basic authentication
Not here: SQL Server views → [sql-view-exposure](sql-view-exposure/index.md); stored SQL → [sql-query](../sql-query/index.md)

## [SQL view exposure/](sql-view-exposure/index.md)
Use when: exposing a customized SQL Server view as an OData entity and querying it (`view.svc`).
Terms: `SQLViews`, `view.svc`, expose, unexpose, SQL Server, view authorization
Not here: SAP HANA views → [semantic-layer-views](semantic-layer-views/index.md); stored SQL → [sql-query](../sql-query/index.md)

## [Batch operations](batch-operations.md)
Use when: sending several requests in one call, change sets, atomic groups.
Terms: `$batch`, `multipart/mixed`, change set, `Content-ID`, batch response

## [Retrieving individual properties](individual-properties.md)
Use when: reading one property or its raw value of an entity.
Terms: `/Orders(1)/CardCode`, `$value`, null property

## [Associations and navigation properties](associations.md)
Use when: navigating from one entity to a related one, or expanding related entities.
Terms: association, navigation property, `$expand`
Not here: `$select` inside `$expand` → [expand-enhancements](query-options/expand-enhancements.md)

## [User-defined schemas](user-defined-schemas.md)
Use when: restricting the fields a response returns with a schema file.
Terms: `B1S-Schema`, schema file, `demo.schema`

## [User-defined fields (UDFs)](user-defined-fields.md)
Use when: creating UDFs through the API or using UDFs in CRUD and queries.
Terms: `UserFieldsMD`, `U_` prefix, UDF

## [User-defined tables (UDTs)](user-defined-tables.md)
Use when: creating "no object" user-defined tables or reading and writing their records.
Terms: `UserTablesMD`, `U_` prefix, UDT, `UserFieldsMD`

## [User-defined objects/](user-defined-objects/index.md)
Use when: registering a UDO or doing CRUD, cancel and close on UDO entities.
Terms: `UserObjectsMD`, `UserKeysMD`, UDO, `Cancel`, `Close`

## [Attachments/](attachments/index.md)
Use when: configuring the attachment folder, uploading, downloading or updating attachments.
Terms: `Attachments2`, attachment folder, `$value`, multipart/form-data, CIFS

## [Stream entity upload](stream-entity-upload.md)
Use when: uploading a stream entity (Attachments2, Pictures) with the Slug header.
Terms: stream entity, `Slug`, `Pictures`, `Attachments2`, SAP UI5

## [Item image and employee image](item-and-employee-images.md)
Use when: setting up the item image folder or getting, updating and deleting item and employee images.
Terms: `Items`, `Picture`, `EmployeesInfo`, image folder, `$value`

## [JavaScript extension/](javascript-extension/index.md)
Use when: writing, deploying or calling server-side JavaScript in Service Layer.
Terms: `/script`, `.ard`, `Metadata2JavaScript`, `HttpModule`, `EntitySet`, `ScriptException`, V8

## [Cross Origin Resource Sharing (CORS)](cors.md)
Use when: calling Service Layer from a browser on another origin.
Terms: CORS, `b1s.conf`, `OPTIONS`, preflight, allowed origins
Not here: other server settings → [configuring](../configuring/index.md)

## [Ping Pong API](ping-pong-api.md)
Use when: checking whether the load balancer or a node is alive.
Terms: `/ping`, load balancer, node
Not here: load balancing configuration → [high-availability-load-balancing](../high-availability-load-balancing/index.md)
