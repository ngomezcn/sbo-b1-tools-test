# Running notes for PENDING-REVIEW (collected by the supervisor during the build)

## SL conflicts / observations (reviewers; not stated as `SL differs` unless SL says it explicitly)
- bloque 6 response-headers.md: SL "Create Entity with No Content" (crud-operations.md) shows 204 with `Location` and `Preference-Applied` but no `OData-EntityId`, which OData 4.01 requires on a 204 create. Not written as a difference (SL does not say it).
- bloque 6 / 4: SL uses `Prefer: return-no-content` for a create without content; OData uses `return=minimal`. The `SL differs` clause states only what SL says.
- bloque 6 prefer-header.md: SL `odata.maxpagesize=0` disables paging (OData requires a positive integer); SL documents only the `odata.`-prefixed name. Not written as a difference.
- bloque 6 protocol-versioning.md: SL accepts OData v3 by `OData-MaxVersion: 3.0` or `MaxDataServiceVersion: 3.0` (deployment-and-scope.md, Semantic Layer views); not a stated contradiction.
- bloque 7 status-codes.md: SL batch-operations.md says a valid batch returns `202 Accept` in OData V3 and `200 OK` in V4; OData defines 202 only for asynchronous acceptance. Observation only.
- bloque 7 error-response.md: SL docs are inconsistent among themselves: etag-usage.md shows string `code` ("-2039") and string `message`; query-errors.md shows numeric `code` and object `message` {lang, value}. The `SL differs` clause was narrowed to SQL Query errors.
- bloque 4 modify-relationships.md: SL associations.md has no `$ref`/`odata.bind`/`$links` content; In Service Layer set to `no equivalent hoja`.
- bloque 4 update-entity.md folds upsert (OASIS 11.4.4); SL has no upsert coverage (unverified on live SL).
- bloque 8 plan: SL `$metadata` may or may not return JSON: not covered.

## Source defects (transcribed as printed)
- oasis-p1-9.1 (202): double period; "the Data Service Request".
- oasis-json-21.2 Example 55: `OData-error:` vs prose `OData-Error`.
- oasis-p1-8.3.4: `OData-EntityID` vs `OData-EntityId`; 8.3.7 first sentence lacks final period.
- oasis-p1-8.2.8 Example 9: bullets do not match header; misplaced backtick in "respond-`async`".
- oasis-p1-11.4.2 Example 76: empty-string JSON key where `DirectReports@odata.bind` is expected; 11.4.3 Example 78: `Employees(5}` typos; "principle property" typo.
- ms-create-data/ms-update-data: code blocks tagged json but contain HTTP; 4-space indentation kept; ms-overview dangling sentence and image reference dropped.
- oasis-p1-11.4.6: "or an other appropriate error".
