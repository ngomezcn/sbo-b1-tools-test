---
title: Supported SQL keywords
source: pdf pp. 148-149, sec 4.6
summary: The subset of SQL keywords the Service Layer supports in SQL queries, with an example statement for each.
---

# Supported SQL keywords

Considering the gap between the set of query keywords on SAP HANA and the Microsoft SQL Server, not all keywords are supported in the Service Layer. From the practical usage perspective, the Service Layer is designed to support the following subset of SQL keywords, which are most commonly used by partners.

<!-- table: t148-01 -->
| SQL Keywords | Example |
|---|---|
| Select ... From ... Where | `select ItemCode, ItemName, ItmsGrpCod from oitm where 1 ItemCode > 'i01'` |
| Alias | `select t1.DocEntry as Col1 , t1.DocNum as Col2 from ORDR t1 where t1.DocEntry > 0` |
| And, Or, Not | `select t1.DocEntry, t1.DocNum from ORDR t1 where not t1.DocEntry = 1 and t1.DocNum = 1 or t1.Comments <> '1234'` |
| Parenthesis | `select t1.DocEntry, t1.DocNum from ORDR t1 where not (t1.DocEntry = 1 or or t1.Comments <> '1234') and t1.DocNum = 1` |
| Between ... And ... | `select "DocEntry" from ordr where "DocEntry" BETWEEN 1 AND 10` |
| Order By | `select t1.DocEntry, t1.DocNum, t1.DocTotal from ORDR t1 order by t1.DocEntry` |
| Group By | `select DocStatus, DocType, count(*) as GroupCount from ordr group by DocStatus, DocType having count(*) > 0` |
| Is (Not) Null | `select DocEntry, DocType from ordr t1 where DocEntry is not null and t1.Comments is null` |
| Constants | `SELECT 1 as c1, 'string' 1 as c2 FROM OITM` |
| Like | `select CardCode from ordr where CardCode like 'c%'` |
| Top | `select top 2 DocStatus, DocType from ordr` |
| Union (All) | `select t1.LineNum from rdr1 t1 union all select t1.LineNum from inv1 t1` |
| In | `select DocEntry from ordr t1 where DocEntry in (select t2.DocEntry from rdr1 t2) or DocEntry not in (select t2.DocEntry from inv1 t2)` |
| Exists | `select DocEntry, DocType from ordr t1 where exists(select 1 from rdr1 t2 where t1.DocEntry = t2.DocEntry)` |
| Inner Join | `select t1.DocEntry, t2.LineNum from ordr t1 inner join rdr1 t2 on t1.DocEntry = t2.DocEntry` |
| Left (Outer) Join | `select t1.DocEntry, t2.LineNum from ordr t1 left join rdr1 t2 on t1.DocEntry = t2.DocEntry` |
| Right (Outer) Join | `select t1.DocEntry, t2.LineNum from ordr t1 right join rdr1 t2 on t1.DocEntry = t2.DocEntry` |
| Full (Outer) Join | `select t1.DocEntry, t2.LineNum from ordr t1 FULL OUTER JOIN rdr1 t2 on t1.DocEntry = t2.DocEntry` |
| Mixed Join | `select t1.DocEntry, t2.LineNum, t3.CardCode from ordr t1 inner join rdr1 t2 on t1.DocEntry = t2.DocEntry left join ocrd t3 on t1.CardCode = t3.CardCode` |
