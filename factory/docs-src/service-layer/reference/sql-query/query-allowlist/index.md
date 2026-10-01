# Query allowlist

## [Table allowlist](table-allowlist.md)
Use when: finding out which tables a SQL query may read, or why a table is "not accessible".
Terms: `b1s_sqltable.conf`, table allowlist, allowed tables, `OQUT`, `ORDR`, `OITM`
Not here: per-user permission to run queries → [query-with-permission-control](../query-with-permission-control.md)

## [Column allowlist](column-allowlist.md)
Use when: hiding sensitive columns of an allowlisted table, or reading the "Column ... not accessible" error.
Terms: `ColumnExcludeList`, `ColumnIncludeList`, error `703`, column allowlist
