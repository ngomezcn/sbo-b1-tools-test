# SQL Query

## [SQL Query overview and SQLQuery business object metadata](overview-and-business-object-metadata.md)
Use when: understanding what SQL Query is for, or reading the metadata of the `SQLQuery` entity and its `List` function.
Terms: `SQLQueries`, `SQLQuery`, `SqlCode`, `SqlText`, `ParamList`, `List`, `$metadata`
Not here: metadata of ordinary entities → [consuming-service-layer](../consuming-service-layer/metadata-document.md); SQL views as OData → [sql-view-exposure](../consuming-service-layer/sql-view-exposure/index.md)

## [CRUD operations on SQLQuery entities](crud-operations.md)
Use when: creating, retrieving, patching or deleting a stored SQL query.
Terms: `POST /SQLQueries`, `GET /SQLQueries('sql01')`, `PATCH`, `DELETE`, `SqlCode`, `SqlName`
Not here: CRUD on ordinary business objects → [consuming-service-layer](../consuming-service-layer/crud-operations.md)

## [List operation](list-operation.md)
Use when: running a stored query and reading its JSON result.
Terms: `SQLQueries('id')/List`, `GET`, `POST`, `value`

## [List with paging](list-with-paging.md)
Use when: paging a stored query's result, changing the page size.
Terms: `odata.nextLink`, `Prefer: odata.maxpagesize`, page size
Not here: paging entity collections with `$top`/`$skip` → [pagination](../consuming-service-layer/query-options/pagination.md)

## [Query allowlist/](query-allowlist/index.md)
Use when: knowing which tables and columns SQL queries may touch.
Terms: `b1s_sqltable.conf`, `ColumnExcludeList`, `ColumnIncludeList`, allowlist
Not here: who may create or run queries → [query-with-permission-control](query-with-permission-control.md)

## [Supported SQL keywords](sql-keywords.md)
Use when: checking whether a keyword (`union`, `top`, `between`, `like`, `group by`) is allowed in a query.
Terms: `select`, `where`, `order by`, `group by`, `having`, `union all`, `top`, `is null`

## [Supported SQL functions](sql-functions.md)
Use when: checking which SQL functions (sum, avg, min, max, count distinct, isnull, lower, upper, left, right) are supported.
Terms: `sum`, `avg`, `min`, `max`, `count(distinct …)`, `isnull`, `lower`, `upper`, `left`, `right`

## [SQL normalization](sql-normalization.md)
Use when: writing one statement that must run on both SQL Server and SAP HANA; identifier case, aliases, function names.
Terms: normalization, alias, `COL1`, quoted identifier, SQL Server, SAP HANA

## [Query with parameters](query-with-parameter.md)
Use when: defining a query with `:name` placeholders and running it with POST or GET.
Terms: `ParamList`, `:param`, `stringParam1='val1'`, bound parameter
Not here: OData `$filter` → [query-options](../consuming-service-layer/query-options/index.md)

## [Query errors and exceptions](query-errors.md)
Use when: debugging an error returned by a SQL query (allowlist, grammar, unsupported keyword, duplicate alias, computed column, `select *`, DML).
Terms: error codes, `703`, `select *`, duplicate alias, computed column, DML, grammar error

## [Query with permission control](query-with-permission-control.md)
Use when: a user gets 403 on SQL queries, or granting authorization to create, update, remove and read queries.
Terms: `403`, General Authorizations, superuser, Full Authorization, `Modify SQL Queries in Service Layer`
Not here: which tables are queryable → [query-allowlist](query-allowlist/index.md)

## [Security considerations](security-considerations.md)
Use when: SQL injection protection, where query changes are logged, protecting sensitive columns.
Terms: SQL injection, `ASQL`, bound parameters, sensitive data

## [SQL Query limitations](sql-query-limitations.md)
Use when: asking what SQL queries cannot access (LOG tables, `SBOCOMMON`, data ownership, UDO/UDT support as of 10.0 FP 2102).
Terms: LOG tables, `SBOCOMMON`, data ownership, UDO, UDT
Not here: general Service Layer limitations → [limitations](../limitations/index.md)
