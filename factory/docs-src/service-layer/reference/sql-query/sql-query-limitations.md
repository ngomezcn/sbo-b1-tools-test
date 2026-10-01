---
title: SQL Query Limitations and By-Design Behaviour
source: pdf pp. 160-160, sec 4.13
summary: What SQL queries cannot access (LOG tables, SBOCOMMON, data ownership) and the UDO/UDT support change as of 10.0 FP 2102.
---

# SQL Query Limitations and By-Design Behaviour

- Previously, user-defined objects (UDO) and user-defined tables (UDT) were not supported to query. As of SAP Business One 10.0 FP 2102, UDO/UDT is supported.
- LOG table (for example, `AITM`, `ACRD`) is not supported to query.
- `SBOCOMMON` or `SBO-COMMON` is not supported to query.
- Data ownership is not supported.
