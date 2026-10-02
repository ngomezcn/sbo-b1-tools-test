## Plan: batch-and-async

Proposed status: `dropped` (every fragment excluded; no hojas, no folder).

Reason: SL `reference/consuming-service-layer/batch-operations.md` (3.9) already defines the multipart `$batch` request: method and URI, headers, body, change sets (atomic unit, no GET), `Content-ID` and `$<Content-ID>` references, response formats and the stop-on-first-failure behaviour. `reference/etag/etag-guide.md` (Batch requests) covers ETag in `$batch` with verified behaviour (inner `If-Match` ignored). `reference/limitations/limitations.md` says OData batch rollback is unsupported. The remaining OData batch features (JSON batch format, atomicity groups, `424`, value references) and asynchronous requests (`Prefer: respond-async`, status monitor) are not mentioned anywhere in SL: documenting them would present as available features that SL does not document and that were never verified, so no hoja can state them safely. Neither `respond-async` nor `odata.continue-on-error` is touched by SL.

### Fragment decisions

| fragment | decision | where / reason |
|---|---|---|
| oasis-p1-11.6 | exclude | `Prefer: respond-async` and status monitor are not in SL and not documented as supported; documenting an unverified feature would mislead (in doubt, exclude). |
| oasis-p1-11.7 | exclude | Parent over 400 lines; children decided below; SL batch-operations.md covers the mechanics. |
| oasis-p1-11.7.1 | exclude | Batch request headers (Content-Type, boundary, OData-Version, 200 OK) are defined in SL batch-operations.md (all 9 terms hit, heading hit). |
| oasis-p1-11.7.2 | exclude | Atomicity groups and `424` are JSON-batch features; SL documents only multipart change sets (defined in SL). |
| oasis-p1-11.7.3 | exclude | Request identifiers: SL defines `Content-ID`; the OData rule adds no integration question. |
| oasis-p1-11.7.4 | exclude | `$<id>` references to created entities are defined by SL (Content-ID, change sets); the system-resource collision is a minor edge case. |
| oasis-p1-11.7.5 | exclude | ETag references in batch: SL etag-guide.md verified that inner `If-Match` is ignored; including it would contradict SL (SL wins). |
| oasis-p1-11.7.6 | exclude | Value references from response bodies: not documented as supported in SL; unverified. |
| oasis-p1-11.7.7 | exclude | Multipart batch format (347 lines): SL batch-operations.md explains it with samples and responses (11 of 12 terms in SL). |

### Hojas

None.

### Unidades de trabajo

None.

### Disambiguation candidates

None (no hojas). Seed noted: OData `$batch` generic rules vs SL `reference/consuming-service-layer/batch-operations.md` stay in SL only.

### Questions

- Confirm `dropped` for bloque #9? Recommendation: yes. Alternative: a single `condense` hoja on the JSON batch format and async requests, but only after verifying on a live SL that they work (SL docs and limitations do not mention them); until then it is unverifiable.
- Should the project verify on a live SL whether `Prefer: respond-async` and `Content-Type: application/json` batch are accepted, as was done for ETag? Recommendation: not now; revisit as a separate verified-facts item if an integration needs it.
