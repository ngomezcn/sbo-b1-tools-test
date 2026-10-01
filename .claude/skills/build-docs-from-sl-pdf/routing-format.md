# Routing format

How a consumer agent finds a hoja: at most three hops, root `DOCS/SKILL.md` → `reference/<apartado>/index.md` → hoja (or a subfolder `index.md` → hoja). Root and index files are loaded often, so every line in them routes; explanations belong in the hojas.

The examples below show shape only. Every term, path and phrase in the real files comes from the hojas.

## Root `DOCS/SKILL.md`

Written as a skeleton on the first run; each integrated apartado adds its rows.

```markdown
---
name: docs-service-layer
description: SAP Business One Service Layer reference (guide v1.29): login and sessions, OData CRUD, query options ($filter, $select, $expand, paging, aggregation, cross-joins), batch, UDF/UDT/UDO, attachments, semantic layer and SQL views, SQL Query, ETag, server configuration and logs, webhooks and formulas, limitations, DI API comparison. Use when writing or debugging code that calls Service Layer, or when asked how a Service Layer feature behaves.
---

# SAP Business One Service Layer

Pick the row matching the question, open that index, then the single hoja it points to.

## By intent

| Developer intent | Example questions | Go to |
|---|---|---|
| Paginate or filter a collection | "how do I paginate a GET", "$filter on a date" | [consuming-service-layer](reference/consuming-service-layer/index.md) |

## Confusable terms

| Term | Means | Go to |
|---|---|---|
| SQL View Exposure | exposing an HANA/SQL view as OData (sec 3.8) | [sql-view-exposure](reference/consuming-service-layer/sql-view-exposure.md) |
| SQL Query | the `SQLQueries` entity running stored SQL (ch. 4) | [sql-query](reference/sql-query/index.md) |
```

- `description` says what the docs cover and when to use them; it keeps the skeleton's coverage list in step with the apartados.
- **By intent**: one or more rows per apartado, phrased as what a developer is trying to do, with real example questions. A row may point to a hoja directly when that is the only sensible target.
- **Confusable terms**: the planner's candidates for the apartado, plus `profile.md`'s seeds once both sides exist.
- Version availability marks and the Setup check (ADR 0004) are added later by a satellite skill and are not part of this format.

## `reference/<apartado>/index.md` (and subfolder `index.md`)

```markdown
# Consuming Service Layer

## [Batch operations](batch-operations.md)
Use when: sending several requests in one call, change sets, atomic groups.
Terms: `$batch`, `multipart/mixed`, changeset, `Content-ID`, `Prefer: odata.continue-on-error`
Not here: running stored SQL in one call → [sql-query](../sql-query/index.md)

## [Query options/](query-options/index.md)
Use when: shaping a GET: filtering, selecting, ordering, paging, aggregating, joining.
Terms: `$filter`, `$select`, `$orderby`, `$top`, `$skip`, `$count`, `$apply`, `$crossjoin`, `$expand`
Sections: [Aggregation](query-options/aggregation.md#sum) · [Cross-joins](query-options/cross-joins.md)
```

One entry per hoja or subfolder, in PDF order:

- the heading links the hoja, or the subfolder's `index.md`;
- **Use when**: the developer situations it answers;
- **Terms**: the exact strings a question would contain: HTTP verbs, entities, query options, function names, properties, error codes;
- **Sections**: links to `#anchors`, only for large hojas with an anchor index;
- **Not here**: only when a neighbouring apartado is the likelier target for a similar question.

## Resolving `TODO(link: sec X)`

The target hoja is the one whose `source` lists `X` or an ancestor of `X`. Replace `text TODO(link: sec X)` with `[text](<relative path to that hoja>#<anchor>)`; the anchor is the heading for `X` when the hoja has one. `verify_section.py` fails on any TODO whose target hoja already exists.
