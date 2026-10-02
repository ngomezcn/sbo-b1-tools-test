---
title: "ETag guide: when to use it and how it behaves"
source: verified: SAP Business One Service Layer guide v1.29 sec 5 (documented behavior) plus tests against Service Layer 1000340 on 2026-10-02 (verified behavior)
summary: When to use ETag and If-Match to avoid lost updates in integrations, how the ETag is built and returned, and verified pitfalls with $select, $batch, If-Match values and entity types.
---

# ETag guide: when to use it and how it behaves

OData generic ETag: reference/odata/headers-and-versioning/etag-and-concurrency.md

- [When to use ETag](#when-to-use-etag)
- [How the ETag is built and when it changes](#how-the-etag-is-built-and-when-it-changes)
- [Where the ETag appears](#where-the-etag-appears)
- [Sending If-Match correctly](#sending-if-match-correctly)
- [Batch requests](#batch-requests)
- [Documents and actions](#documents-and-actions)
- [Which entities return an ETag](#which-entities-return-an-etag)
- [Not here](#not-here)

Blockquotes marked **Verified** are facts checked against a real Service Layer; they complete or contradict the documented behavior.

## When to use ETag

An ETag (entity tag) is an opaque identifier of a specific version of a resource; the Service Layer uses it for optimistic concurrency: the client sends it back in `If-Match` and the write is rejected if the entity changed in between.

Use ETag when an external system (CRM, e-commerce, middleware, iPaaS) writes to entities that SAP Business One users or other integrations also edit, and a **lost update** would be a problem: the external system reads an entity, changes it, and writes it back while someone else changed it in between.

Typical cases:

- Read-modify-write on Business Partners, Items, documents or activities that users also edit in the client (two-way sync).
- Delete, cancel or close that must only happen if the entity is still in the state that was read.

Without `If-Match`, a `PATCH` overwrites blindly: it changes the entity whether or not someone else changed it first.

Recommended pattern:

1. `GET` the entity and keep its `@odata.etag`.
2. `PATCH` (or `DELETE`, or `POST .../Cancel`, `.../Close`) with `If-Match: <that ETag>`.
3. On `412 Precondition Failed` with error code `-2039`: re-read the entity, reconcile your change with the new data, and retry with the new ETag.

Documented requests and responses for each scenario are in [ETag usage](etag-usage.md).

Where ETag does not help:

- Entities that do not return an ETag (see [Which entities return an ETag](#which-entities-return-an-etag)): there is nothing to send.
- Several entities in one `$batch` that would each need a different ETag (probably not possible, see [Batch requests](#batch-requests)).

> **Verified (SL 1000340, 2026-10-02):** Two-session scenario works as documented. Session A reads the ETag, session B patches (204), session A patches with the old ETag and gets 412 `-2039`; the data written by B stays. After A re-reads, its PATCH returns 204.

## How the ETag is built and when it changes

The Service Layer uses weak validation: `ETag: W/"hashed string"`.

> **Verified (SL 1000340, 2026-10-02):** The hashed string is the uppercase hex SHA1 of the entity's `DataVersion` as a decimal string. `DataVersion` 1 gives `W/"356A192B7913B04C54574D18C28D46E6395428AB"` (SHA1 of `"1"`), 2 gives `W/"DA4B9237..."`, 3 gives `W/"77DE68DA..."`. `DataVersion` is a readable property of the entity.

> **Verified (SL 1000340, 2026-10-02):** A new entity starts at `DataVersion` 1, and the ETag is stable across consecutive GETs and across different sessions.

When the ETag changes:

> **Verified (SL 1000340, 2026-10-02):** `DataVersion` increased on every tested successful write (`PATCH`, `Cancel`, `Close`). A `PATCH` that sends the same value as before also changed the ETag (tested on an Item only). Adding a row to a child collection of a Business Partner (`BPAddresses`, `ContactEmployees`) also increases it.

> **Verified (SL 1000340, 2026-10-02):** A rejected request (412) did not change `DataVersion` (observed on Items, Orders and Drafts, including Cancel and Close).

> **Verified (SL 1000340, 2026-10-02):** A BusinessPartner's `DataVersion` rose (from 2 to 7) when orders were created, patched, cancelled and closed for it (observed on one test partner, with Orders only). From this observation, an ETag read before documents are posted for that partner can be stale even though nobody edited the card.

## Where the ETag appears

Documented: the ETag is in the response header and the body (`@odata.etag`) of a single-entity `GET` and of a `POST` that creates an entity.

> **Verified (SL 1000340, 2026-10-02):** Where the ETag really shows up:
>
> | Request | `ETag` header | `@odata.etag` in body |
> |---|---|---|
> | `GET Items('X')` (single entity) | yes | yes |
> | `POST` creating an entity (Items, BusinessPartners, Orders, Drafts) | yes | yes |
> | Collection (`Items?$top=3`, or filters other than key equals, e.g. `ItemName eq`, `startswith`; tested on Items) | no | yes, on each element |
> | `$filter` on the key field with a literal (`Items?$filter=ItemCode eq 'X'`, one result; tested on Items) | yes | no |
> | Single entity with `$select` or `$expand` | no | yes (see below) |
> | Collection with `$select` or `$expand` | `$select`: no; `$expand`: not tested | yes, on each element (see below) |

Rule of thumb: read `@odata.etag` from the body, and fall back to the header only for a plain single-entity GET or a key-equals filter (tested on Items).

> **Verified (SL 1000340, 2026-10-02):** With `$select`, the body `@odata.etag` is correct only if `$select` includes `DataVersion` (for example `$select=CardName,DataVersion`). Without it, the body carries a constant wrong value, the ETag of `DataVersion` 1, whatever the real version (seen on single Items and Business Partners, on an Order, and on collections).

> **Verified (SL 1000340, 2026-10-02):** `$expand=Activities` on a BusinessPartner returned a correct inline ETag. `$expand=BPAddresses` returns 400 because `BPAddresses` is a complex collection that is always returned, not a navigation property.

## Sending If-Match correctly

Documented: send `If-Match` with the ETag value in the `PATCH`, `DELETE` or action request; a stale value returns `412` with code `-2039`.

> **Verified (SL 1000340, 2026-10-02):** Results of `PATCH` on an Item with different `If-Match` values (`DELETE` was tested on a Business Partner, with a stale value: 412 `-2039`, and with garbage text: 204, and on an Item, with a wrong-version ETag: 412, and with its own current ETag: 204):
>
> | `If-Match` value | Result |
> |---|---|
> | none | 204, overwrites |
> | current `W/"hash"` | 204 |
> | stale `W/"hash"` | 412 `-2039`, data unchanged |
> | `W/"zzz"` (a wrong weak value) | 412 `-2039` |
> | `*` | 204 |
> | strong form (`"HASH"`, no `W/`), even a bogus one | 204, ignored |
> | unquoted hash | 204, ignored |
> | garbage text | 204, ignored (a DELETE with it deleted the record) |

On the tested requests (`PATCH` on an Item, `DELETE` on a Business Partner and on an Item) only values that start with `W/` were validated, and a malformed `If-Match` did not fail the request: it silently turned it into a blind write. Actions (`Cancel`, `Close`) and other entities were not tested with these values. Send the ETag exactly as received, including `W/` and the quotes.

> **Verified (SL 1000340, 2026-10-02):** The ETag only encodes the `DataVersion` counter, not the entity or its type. An ETag from a different entity, or from a different entity type, that has the same `DataVersion` is accepted (an item accepted the ETag of an order at the same version). A wrong-entity `If-Match` is not detected, so keep each ETag with the entity it came from.

> **Verified (SL 1000340, 2026-10-02):** `GET` with `If-None-Match` returned 200 with the full body in every tested case (current ETag, `*`, strong form, and the current ETag with `$select`; tested on an Item only). `PATCH` with `If-None-Match` is ignored (204).

## Batch requests

> **Verified (SL 1000340, 2026-10-02):** In `$batch`, `If-Match` on an inner request is ignored, and the write goes through with a stale ETag. It is ignored inside a change set (also with a lowercase header name and as a MIME part header) and in a plain part with a normal-case header; tested with `PATCH` on an Item only. Only an `If-Match` header on the outer `$batch` HTTP request is honoured: a stale value gives 412 for the inner request (code `-2039` and `DataVersion` unchanged in a change set; a plain part also gave 412). The outer batch response status is 200 in all cases.

Consequences:

- The outer header value presumably applies to every inner request (tested with a single inner `PATCH` on an Item only), so one batch probably cannot carry a different ETag per entity.
- When each write needs its own precondition, send individual requests instead of a batch.

For batch syntax see [Batch operations](../consuming-service-layer/batch-operations.md).

## Documents and actions

Documented: `POST .../Cancel` (and other bindable actions) with `If-Match` is rejected with 412 `-2039` if the document was changed by someone else.

> **Verified (SL 1000340, 2026-10-02):** On Orders: `POST /Orders` returns the ETag (header and body). `PATCH` of `Comments` or of `DocumentLines` with the current ETag returns 204 and raises `DataVersion`; with a stale ETag it returns 412 `-2039` with `DataVersion` unchanged. `POST Orders(n)/Cancel` and `POST Orders(n)/Close` with a stale ETag return 412 with `DataVersion` unchanged; with the current ETag they return 204, raise `DataVersion`, and the order becomes cancelled or closed. Cancel on an already closed order fails with 400 `-5006`.

> **Verified (SL 1000340, 2026-10-02):** Drafts: `POST /Drafts` returns the ETag and a stale `PATCH` returns 412 (other requests not tested).

## Which entities return an ETag

The documented list of entities with ETag is in [Entities with ETag and ETag metadata](etag-entities-and-metadata.md).

> **Verified (SL 1000340, 2026-10-02):** `Orders`, `Quotations`, `Invoices`, `PurchaseOrders`, `Drafts`, `Activities`, `Items` and `BusinessPartners` return `@odata.etag` on collections. A single-entity `GET` on `Warehouses`, `ItemGroups`, `Currencies` and `Users` returned neither an `ETag` header nor `@odata.etag` (collections not tested); do not rely on ETag for them. Other entities were not tested.

## Not here

- Request and response examples per scenario (create, retrieve, update, delete, action): [ETag usage](etag-usage.md).
- Documented entity list and ETag in OData V4/V3 metadata: [Entities with ETag and ETag metadata](etag-entities-and-metadata.md).
- Basic create, read, update and delete requests: [CRUD operations](../consuming-service-layer/crud-operations.md).
