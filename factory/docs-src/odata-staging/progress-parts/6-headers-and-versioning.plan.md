## Plan: headers-and-versioning

Approved: 2026-10-02 (supervisor, delegated by the user)

All fragments are `oasis-p1` (OASIS base for headers; no `ms` page covers headers, so no `ms` fragment is a candidate). Parents 5, 8, 8.1, 8.2, 8.3 are decided through their children (8 is over 400 lines; the others only hold an intro sentence).

### Fragment decisions

| fragment | decision | where / reason |
|---|---|---|
| oasis-p1-5 | exclude | parent; decided on its children (5.1 in, 5.2 out); its own text is the two child intros |
| oasis-p1-5.1 | include | protocol-versioning.md (gate A: `OData-MaxVersion`/`OData-Version` appear in SL only as a one-line note, no SL hoja explains them) |
| oasis-p1-5.2 | exclude | model versioning (`Core.SchemaVersion`, `$schemaversion`, safe model changes) serves service authors; SL has one fixed model |
| oasis-p1-8 | exclude | parent over 400 lines; decided on its children |
| oasis-p1-8.1 | exclude | parent; only an intro sentence, children decided below |
| oasis-p1-8.1.1 | exclude | Content-Type: SL already defines it (`faq/common-issues.md`); format parameters belong to the JSON format fragments of other bloques |
| oasis-p1-8.1.2 | exclude | Content-Encoding: no consumer question; `Capabilities.AcceptableEncodings` is service side |
| oasis-p1-8.1.3 | exclude | Content-Language: generic HTTP, no SL hits, no concrete integration question |
| oasis-p1-8.1.4 | exclude | Content-Length: generic HTTP |
| oasis-p1-8.1.5 | merge | protocol-versioning.md (OData-Version: what the client sends and reads; absent-header rule) |
| oasis-p1-8.2 | exclude | parent; only an intro sentence, children decided below |
| oasis-p1-8.2.1 | exclude | Accept: the 13 lines are charset and batch inheritance rules; the useful Accept values (`odata.metadata=...`) live in the JSON-format fragments; in doubt exclude (question 3) |
| oasis-p1-8.2.2 | exclude | Accept-Charset: generic HTTP, one batch-inheritance rule |
| oasis-p1-8.2.3 | exclude | Accept-Language: generic HTTP, no SL hits |
| oasis-p1-8.2.4 | merge | etag-and-concurrency.md (If-Match semantics, 412, 428, `*`, upsert effect) |
| oasis-p1-8.2.5 | merge | etag-and-concurrency.md (If-None-Match semantics, 304 vs 412, `*` effect) |
| oasis-p1-8.2.6 | exclude | Isolation snapshot: not stated as supported by SL, and an unsupported value yields 412; in doubt exclude (question 4) |
| oasis-p1-8.2.7 | merge | protocol-versioning.md (OData-MaxVersion rules and default when absent) |
| oasis-p1-8.2.8 | include | prefer-header.md (gate A: SL explains only `odata.maxpagesize` and `return-no-content`; generic Prefer, `return=minimal/representation`, `include-annotations`, `continue-on-error`, `respond-async`, `wait` are unexplained. Question: "which Prefer values exist and what does the response `Preference-Applied` mean?") |
| oasis-p1-8.3 | exclude | parent; only an intro sentence, children decided below |
| oasis-p1-8.3.1 | exclude | AsyncResult: only on async status monitors (4.01), belongs to async handling; if bloque 9 keeps async it covers it |
| oasis-p1-8.3.2 | include | etag-and-concurrency.md (base: ETag header, weak vs strong, metadata ETag, batch rule) |
| oasis-p1-8.3.3 | include | response-headers.md (base; Question: "where is the URL of the created entity or of the async status resource?") |
| oasis-p1-8.3.4 | merge | response-headers.md (OData-EntityId on a 204 create/upsert; question: "how do I get the new key after `return=minimal`?") |
| oasis-p1-8.3.5 | exclude | OData-Error header: trailing error in streamed responses, no consumer question |
| oasis-p1-8.3.6 | merge | prefer-header.md (Preference-Applied is the response side of Prefer) |
| oasis-p1-8.3.7 | merge | response-headers.md (Retry-After on 202 and 3xx; question: "how long to wait before polling the status resource?") |
| oasis-p1-8.3.8 | exclude | Vary: caching of responses, no SL hits to explain, no integration question |

### Hojas

| hoja | title | fragments | mode | unit | SL candidates |
|---|---|---|---|---|---|
| headers-and-versioning/etag-and-concurrency.md | ETag and concurrency | oasis-p1-8.3.2 (base), oasis-p1-8.2.4, oasis-p1-8.2.5 (same topic: request-side rules of the ETag header, so the hoja has one wording) | condense | u1 | reference/etag/etag-guide.md; reference/etag/etag-usage.md |
| headers-and-versioning/protocol-versioning.md | Protocol versioning: OData-Version and OData-MaxVersion | oasis-p1-5.1 (base), oasis-p1-8.1.5, oasis-p1-8.2.7 (the header rules incl. batch inheritance, which 5.1 only summarises) | condense | u1 | reference/consuming-service-layer/semantic-layer-views/deployment-and-scope.md; reference/consuming-service-layer/batch-operations.md |
| headers-and-versioning/prefer-header.md | Prefer header and Preference-Applied | oasis-p1-8.2.8 (base), oasis-p1-8.3.6 (response side of the same mechanism) | condense | u2 | reference/consuming-service-layer/crud-operations.md; reference/consuming-service-layer/query-options/pagination.md; reference/sql-query/list-with-paging.md |
| headers-and-versioning/response-headers.md | Location, OData-EntityId and Retry-After | oasis-p1-8.3.3 (base), oasis-p1-8.3.4, oasis-p1-8.3.7 (same shape: short response-header rules) | copy | u3 | reference/consuming-service-layer/crud-operations.md |

Notes for the transcriber of `prefer-header.md` (condense, 208 + 7 lines): keep `return=minimal`/`return=representation`, `include-annotations`, `maxpagesize`, `continue-on-error`, `respond-async` and `wait` with their MUST/SHOULD and examples; drop `allow-entityreferences`, `callback`, `track-changes` (delta, not consumer scope here) and `omit-values` (4.01, no SL evidence) and say nothing about them. Check `limitations.md` shows no contradiction; if SL says otherwise, it wins in the `In Service Layer:` line.

Notes for `etag-and-concurrency.md`: state the generic protocol rule only (MUST/SHOULD of 8.3.2, 8.2.4, 8.2.5: weak vs strong, `*`, 412, 428, 304, upsert effect, batch rule). Do not copy the verified SL facts (SHA1 `DataVersion`, header-vs-body placement, silent ignoring of malformed or strong `If-Match`, `If-None-Match` GET returning 200, `If-Match` ignored on inner batch requests). The `In Service Layer:` line may append `SL differs:` only for what the SL hojas state explicitly (weak validation `W/"..."`, GET `If-None-Match` not honoured, inner batch `If-Match` ignored); the transcriber verifies each against `etag-guide.md` before writing it.

### Unidades de trabajo

| unit | fragments | hojas | status | notes |
|---|---|---|---|---|
| u1 | oasis-p1-8.3.2, oasis-p1-8.2.4, oasis-p1-8.2.5, oasis-p1-5.1, oasis-p1-8.1.5, oasis-p1-8.2.7 | headers-and-versioning/etag-and-concurrency.md, headers-and-versioning/protocol-versioning.md | pending | about 70 lines of fragment text |
| u2 | oasis-p1-8.2.8, oasis-p1-8.3.6 | headers-and-versioning/prefer-header.md | pending | about 215 lines |
| u3 | oasis-p1-8.3.3, oasis-p1-8.3.4, oasis-p1-8.3.7 | headers-and-versioning/response-headers.md | pending | about 15 lines |

### Disambiguation candidates

- OData generic ETag (`etag-and-concurrency.md`) vs SL `reference/etag/etag-guide.md`, `etag-usage.md`, `etag-entities-and-metadata.md`: same header; SL hashing, placement and quirks live only in SL.
- OData `Prefer: return=minimal` (`prefer-header.md`) vs SL `Prefer: return-no-content` in `reference/consuming-service-layer/crud-operations.md`: similar effect, different token.
- OData `Prefer: odata.maxpagesize` vs SL `reference/consuming-service-layer/query-options/pagination.md` and `reference/sql-query/list-with-paging.md`.
- OData `OData-MaxVersion`/`OData-Version` (`protocol-versioning.md`) vs SL OData V3 note in `reference/consuming-service-layer/semantic-layer-views/deployment-and-scope.md` and `/b1s/v1` vs `/b1s/v2` service versions (SL versions are URL based, not these headers).
- OData `Location`/`OData-EntityId` (`response-headers.md`) vs SL create responses in `reference/consuming-service-layer/crud-operations.md`.

### Questions

1. Keep `respond-async` and `wait` in `prefer-header.md` although bloque 9 (batch-and-async) may cover async? Recommendation: keep, one short subsection, since the preference is defined by the header; bloque 9 covers the status monitor flow.
2. Include Retry-After and Location for 202 although SL may not support async requests? Recommendation: keep (two sentences each in a `copy` hoja); the `In Service Layer:` line says what SL does not support if limitations show it.
3. Add a small content-negotiation hoja for Accept/Content-Type/Accept-Charset? Recommendation: no; the OData-specific `Accept` format parameters belong to the JSON format fragments and SL already defines Content-Type.
4. Add `Isolation` (snapshot) as a hoja? Recommendation: no, in doubt exclude, unless SL support is confirmed.
5. 5.2 Model versioning and `$schemaversion`: exclude (service authors). Confirm.
