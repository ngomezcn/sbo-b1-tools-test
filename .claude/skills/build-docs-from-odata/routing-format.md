# Routing format

How a consumer agent finds an OData hoja: root `reference/odata/index.md` → `reference/odata/<bloque>/index.md` → hoja. Index files are loaded often, so every line in them routes; explanations belong in the hojas. Index files are the only place besides in-page anchors where links are allowed.

The examples below show shape only. Every term, path and phrase in the real files comes from the hojas.

## Bloque index: `DOCS/reference/odata/<bloque>/index.md`

Written by the supervisor at Integrate.

```markdown
# Headers and versioning

## [ETag and concurrency](etag-and-concurrency.md)
Use when: guarding an update against lost writes, reading a 412 or 428.
Terms: `ETag`, `If-Match`, `If-None-Match`, `412 Precondition Failed`
Sections: [Weak ETags](etag-and-concurrency.md#weak-etags)
Not here: error bodies and status semantics → [status-codes-and-errors](../status-codes-and-errors/index.md)
```

One entry per hoja, in the planner's order:

- the heading links the hoja;
- **Use when**: the developer situations it answers;
- **Terms**: the exact strings a question would contain: HTTP verbs, headers, query options, annotations, status codes, property names;
- **Sections**: links to `#anchors`, only for hojas with an anchor index;
- **Not here**: only when a neighbouring bloque or an SL hoja is the likelier target for a similar question. Links go only to other bloques of `odata/` (relative paths to their index or hoja); pointers to SL hojas are the hojas' `In Service Layer:` lines, not index links.

A subfolder inside a bloque (for example one per query family) gets its own `index.md` in the same shape, linked from the bloque index.

## Root index: `DOCS/reference/odata/index.md`

Written by the final integrator after the last bloque. It carries the attribution block and one entry per `done` bloque in the same entry shape (heading links the bloque's `index.md`; Use when / Terms / Not here).

```markdown
# OData reference

## Attribution
Copyright © OASIS Open 2020. All Rights Reserved.
Derived from <the four OASIS document titles>, OASIS Standard, 23 April 2020. This explanatory work is made under the OASIS Document Notices.
Also derived from the Microsoft Learn OData documentation (MicrosoftDocs/OData-docs, CC-BY-4.0, commit <short commit>), <author and ms.date note>.

## [Reading data](reading-data/index.md)
Use when: ...
Terms: ...
```

- The attribution block appears only here; hojas carry no copyright line.
- Titles, edition, commit and the author/ms.date note come from `PINS` and `WORK/manifest.json`.
- Dropped bloques have no entry.
