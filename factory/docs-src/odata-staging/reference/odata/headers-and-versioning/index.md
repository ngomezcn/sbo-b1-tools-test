# Headers and versioning

## [ETag and concurrency](etag-and-concurrency.md)
Use when: guarding an update against lost writes, reading a 412 or 428, or using `If-Match` / `If-None-Match`.
Terms: `ETag`, `If-Match`, `If-None-Match`, `412 Precondition Failed`, `428`, `304`, weak ETag
Not here: error bodies → [status-codes-and-errors](../status-codes-and-errors/index.md)

## [Protocol versioning: OData-Version and OData-MaxVersion](protocol-versioning.md)
Use when: sending or reading `OData-Version` / `OData-MaxVersion`, including defaults and batch inheritance.
Terms: `OData-Version`, `OData-MaxVersion`, 4.0, 4.01
Not here: Prefer header → [prefer-header](prefer-header.md)

## [Prefer header and Preference-Applied](prefer-header.md)
Use when: asking which Prefer values exist (`return=minimal`/`representation`, `maxpagesize`, `continue-on-error`, `respond-async`, `wait`, `include-annotations`) and what `Preference-Applied` means.
Terms: `Prefer`, `Preference-Applied`, `return=minimal`, `return=representation`, `maxpagesize`, `respond-async`
Sections: [return=representation and return=minimal](prefer-header.md#returnrepresentation-and-returnminimal) · [maxpagesize](prefer-header.md#maxpagesize)
Not here: create/update response shape → [modifying-data](../modifying-data/index.md)

## [Location, OData-EntityId and Retry-After](response-headers.md)
Use when: finding the URL of a created entity or async status resource, or reading `OData-EntityId` after a 204 create.
Terms: `Location`, `OData-EntityId`, `Retry-After`, `202 Accepted`
Not here: create request body → [modifying-data](../modifying-data/index.md)
