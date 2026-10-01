---
title: Supported SQL functions
source: pdf pp. 149-149, sec 4.7
summary: The aggregation and other SQL functions the Service Layer supports in SQL queries, with an example for each.
---

# Supported SQL functions

Currently, only the aggregation functions and a limited set of other functions are supported. More functions would be considered for support in future according to customers' requirements.

<!-- table: t149-02 -->
| SQL Functions |  |
|---|---|
| Sum, Avg | `select sum("DocTotal") as sumDocTotal, avg("DocTotal") as avgDocTotal from ordr` |
| Max, Min | `select min("DocTotal") as minDocTotal, max("DocTotal") as maxDocTotal from ordr` |
| Distinct, Count | `select count(distinct docEntry) as countDistinct, count(*)as cnt from ordr` |
| IfNull, IsNull | `select DocEntry, isnull(comments, 'null comments') as mssqlComments, ifnull(Comments, 'null comments') as hanaComments from ordr` |
| Lower, Upper | `SELECT ItemCode, lower(ItemCode) as lowerItemCode, upper(ItemCode) as upperItemCode FROM [OITM] where lower(ItemCode) = 'i001'` |
| Left, Right | `SELECT ItemCode, right(ItemCode, 1) as rightItemCode, LEFT(ItemCode, 1) as leftItemCode FROM oitm` |
