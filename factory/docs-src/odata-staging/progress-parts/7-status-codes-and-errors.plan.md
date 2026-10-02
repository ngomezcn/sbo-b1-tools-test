## Plan: status-codes-and-errors

Approved: pending (planner output, awaiting supervisor approval)

### Fragment decisions

| fragment | decision | where / reason |
|---|---|---|
| oasis-p1-9 | merge | status-codes-and-errors/status-codes.md (intro paragraphs only: "MAY use any valid HTTP status", "SHOULD be as specific as possible"; its children 9.4 and 9.5 are decided separately, and 9.1-9.3 are listed directly in the hoja) |
| oasis-p1-9.1 | include | status-codes.md. Gate A: 200/201/202/204/3xx/304 appear in SL (crud, batch, etag) but no SL hoja defines what each code means in OData (sl-hits: 6 of 12 terms not in SL). Question: "does a 204 mean success or empty?", "what is 304?" |
| oasis-p1-9.2 | include | status-codes.md. Gate A/B: "what does 404/405/406/410/412/424 mean?"; 410, 424, 405 `Allow`, 406 not in SL. Includes the rule that an error status leaves no observable change |
| oasis-p1-9.3 | include | status-codes.md. Gate B: "what does 501 mean?" (only 501 is defined; 5xx general rule) |
| oasis-p1-9.4 | merge | error-response.md. Gate A/B: "what fields does an error body have?"; same content as oasis-json-21.1 in format-neutral wording, merged to avoid two wordings |
| oasis-p1-9.5 | merge | in-stream-errors.md. Same content as oasis-json-21.2 plus the generic statement "clients MUST treat the entire response as being in error" |
| oasis-json-21 | exclude | parent of 21.1-21.3, only a one-sentence intro; children are decided one by one, so no coverage overlap |
| oasis-json-21.1 | include | error-response.md. Gate B: "what is in the `error` object, what do `code`, `target`, `details`, `innererror` mean?"; SL shows the error shape in examples but no hoja explains it, and SL's shape differs (numeric `code`, `message` as object) |
| oasis-json-21.2 | include | in-stream-errors.md. Gate B: "the response was 200 but the JSON is cut off: is that an error?" and "what is the `OData-Error` trailing header?"; nothing in SL |
| oasis-json-21.3 | exclude | Error information in a success payload depends on the `continue-on-error` preference (and Core vocabulary terms); SL docs and limitations never mention it, so SL support is unverified: in doubt, exclude (see Questions) |
| oasis-json-21.3.1 | exclude | child of 21.3 (`Core.ValueException`), same reason |
| oasis-json-21.3.2 | exclude | child of 21.3 (`Core.ResourceException`, `retryLink`), same reason |
| oasis-json-21.3.3 | exclude | child of 21.3 (partial collections with `nextLink`), same reason |
| oasis-p1-9.1.1 to 9.1.6, 9.2.1 to 9.2.6, 9.3.1 | merge | children covered by their parents 9.1, 9.2, 9.3 (listed in status-codes.md); not separate rows needed in the hoja |

### Hojas

| hoja | title | fragments | mode | unit | SL candidates |
|---|---|---|---|---|---|
| status-codes-and-errors/status-codes.md | HTTP status codes | oasis-p1-9.1 (base), oasis-p1-9.2 (base), oasis-p1-9.3 (base), oasis-p1-9 (intro only) | copy | u1 | reference/etag/etag-guide.md; reference/consuming-service-layer/crud-operations.md; reference/consuming-service-layer/batch-operations.md |
| status-codes-and-errors/error-response.md | Error response body | oasis-json-21.1 (base), oasis-p1-9.4 (second: adds the format-neutral field list and the `Content-Language` / information-disclosure wording only if the JSON text lacks it; otherwise merged away with no extra text) | condense | u2 | reference/sql-query/query-errors.md; reference/etag/etag-usage.md; reference/consuming-service-layer/batch-operations.md |
| status-codes-and-errors/in-stream-errors.md | In-stream errors | oasis-json-21.2 (base), oasis-p1-9.5 (second: adds that clients MUST treat the entire response as in error and the general `OData-Error` statement) | copy | u2 | none |

### Unidades de trabajo

| unit | fragments | hojas | status | notes |
|---|---|---|---|---|
| u1 | oasis-p1-9, oasis-p1-9.1, oasis-p1-9.2, oasis-p1-9.3 | status-codes-and-errors/status-codes.md | pending | about 95 lines. Source has no code blocks or tables; the hoja is a list of codes, so use `##` per class and `###` per code, or a pipe table code / meaning / MUST rules if no sentence is lost. Transcriber note for "In Service Layer:": SL observed codes are 412 with `-2039` (etag-guide), 400 for invalid batch (batch-operations), 202 vs 200 for batch (batch-operations: 202 in OData V3, 200 in V4); SL has no hoja on 405/406/410/424/501. |
| u2 | oasis-json-21.1, oasis-p1-9.4, oasis-json-21.2, oasis-p1-9.5 | status-codes-and-errors/error-response.md; status-codes-and-errors/in-stream-errors.md | pending | about 74 lines. Two hojas in one unit: the topics are one family and share the `OData-Error` header text. Transcriber note for the "In Service Layer:" line of error-response.md: the SL docs show an error body as `{"error": {"code": -2039 (numeric), "message": {"lang": "en-us", "value": "..."}, "innererror": {"context": null, "trace": null}}}` (see sql-query/query-errors.md, etag/etag-usage.md, batch-operations.md), whereas OData says `code` is a string and `message` a string; `Content-Language` is not shown in SL. Append ` ; SL differs: code is numeric and message is an object {lang, value}` (SL wins, explicit in the SL examples). Error codes seen in SL hojas: -2039 (stale ETag, 412), -5006 (cancel on closed order, 400), 702 (table not accessible, 400), -1000 (incomplete batch body, 400): the hoja must not list them, only point out the SL hojas. |

### Disambiguation candidates

- OData error `code` (string, service-defined sub-status) vs SL numeric error code in `error.code` (for example `-2039`, `702`, `-1000`): `status-codes-and-errors/error-response.md` vs `reference/sql-query/query-errors.md`, `reference/etag/etag-usage.md`.
- OData `412 Precondition Failed` (generic conditional request) vs SL ETag `412` with code `-2039`: `status-codes-and-errors/status-codes.md` vs `reference/etag/etag-guide.md` (and the ETag hoja of bloque headers-and-versioning).
- OData `424 Failed Dependency` and `202 Accepted` for batch and async vs SL batch behavior (outer 200 in V4, inner statuses per part, 400 for invalid batch body): `status-codes-and-errors/status-codes.md` vs `reference/consuming-service-layer/batch-operations.md`.
- OData `message` as string and `details` array vs SL `message` object `{lang, value}` and `innererror`: `error-response.md` vs `reference/consuming-service-layer/javascript-extension/exception-api.md` (the JS exception API also uses code and message).
- OData `target` (property in error) vs SL "target" elsewhere (view/webhook hojas): `error-response.md` vs `reference/consuming-service-layer/semantic-layer-views/service-root-and-metadata.md` (sl-hits: def in `reference/introduction-getting-started/introduction.md`).

### Questions

- Should `oasis-json-21.3` (error information in a success payload, `continue-on-error`, `Core.ValueException`, `Core.ResourceException`) stay excluded? Recommendation: exclude, since nothing in SL docs or limitations shows SL honouring `continue-on-error`; include it later only if verified on a live SL (a verification would also support an "In Service Layer:" line).
- Keep the three hojas, or fold `in-stream-errors.md` (about 20 lines of text) into `error-response.md`? Recommendation: keep separate: it answers a different question (200 but truncated body), and a copy hoja stays tiny.
- Is it acceptable that the `In Service Layer:` of `error-response.md` carries ` ; SL differs: code is numeric and message is an object {lang, value}`? Recommendation: yes, because three SL hojas show this explicitly; a live check against SL is not needed.
- `status-codes.md` is `copy` and has no SL-specific codes; should `In Service Layer:` list the three SL hojas (etag-guide, crud-operations, batch-operations) or only etag-guide? Recommendation: all three, since each shows real SL status codes.
