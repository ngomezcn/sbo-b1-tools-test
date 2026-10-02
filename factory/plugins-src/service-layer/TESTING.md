# Testing — service-layer plugin

Run everything from this folder: `npm test` (loads the repo-root `.env`: `SL_URL`, `SL_COMPANY`, `SL_USER`, `SL_PASSWORD`). Also `npm run typecheck` and `npm run build`.

## Executed

- Slice 1 (local files, version validation): no server needed.
- Slice 2 (Setup login/logout): executed against FP 2608 (`Version` 1000340), `v1` and `v2`, 2026-10-02.

- Slice 3 (`get` by key): executed against FP 2608, `v1` and `v2`, 2026-10-02.

- Slice 4 (session reuse, relogin): executed against FP 2608, `v1` and `v2`, 2026-10-02. Clock injected for the 30-minute rule (no real waiting).

- Slice 5 (page, count, traverse): executed against FP 2608, `v1` and `v2`, 2026-10-02. Data of the demo as it is (Orders 337, Items 57, BusinessPartners 25): enough for several pages and the cap, nothing created.

- Slice 6 (Volcado cleanup, 24 h safety net, parallel executions): executed against FP 2608, `v2` (the logic does not depend on the OData version), 2026-10-02. Clock injected.

## Verified against the real Service Layer

Login errors, exactly as returned (HTTP 401 in all cases):

| Case | v1 (OData V3) | v2 (OData V4) |
|---|---|---|
| Wrong password | `code: -304` (number), `message: {lang: "en-us", value: "Fail to NONE-SSO login from SLD."}` | `code: "-304"` (string), `message: "Fail to NONE-SSO login from SLD."`, plus `details: [{code: "", message: ""}]` |
| Unknown `CompanyDB` | `code: -306`, same message | `code: "-306"`, same message |
| Unreachable URL | no SL answer; our error `SL_UNREACHABLE` | same |

- Wrong password and unknown `CompanyDB` give the same message; only the code tells them apart (-304 / -306).
- `v1` wraps `message` in `{lang, value}` and uses a numeric `code`; `v2` uses plain strings. The plugin normalises `message` to text and keeps `code` as received.
- `POST /Logout` with the test session returns success and the session is then rejected with 401 (checked in both versions).
- Login response: `SessionTimeout: 30` (minutes) in both versions.

- Concurrent logins: 8 parallel `Login` calls (v1) made 2 fail with HTTP 500, `code: 299`, `message: "SAML Login Failed"`. That is why `npm test` runs files serially (`--test-concurrency=1`); do not run the test files in parallel.

Read by key (`BusinessPartners('C50000')`, exists in the demo, `ADA Tecnologías, S.L.`; both versions return the record):

- Missing key: HTTP 404, `code: -2028` (v1, number) / `"-2028"` (v2, string), `message: "No matching records found (ODBC -2028)"`.
- Responses carry an etag (`odata.etag` in v1, `@odata.etag` in v2); the plugin does not use it.
- `Set-Cookie` on login: `B1SESSION` and also `ROUTEID` (the demo is behind a load balancer: `ROUTEID` is `.node1` … `.node10`). Both are sent back.

Reading many rows (FP 2608, same in `v1` and `v2` unless noted):

- `nextLink` is **relative** to the service root (`Orders?$select=DocEntry&$skip=100`), not absolute, and uses `$skip`, never `$skiptoken`. Key: `odata.nextLink` (v1) / `@odata.nextLink` (v2). The plugin also accepts an absolute link to the same service and refuses one to another address (neither case seen from the real SL).
- With `$orderby`, `$filter` and `$select` the `nextLink` repeats them as sent (`$filter` stays percent-encoded) and appends `$skip=N`. Pages are consistent with `$orderby` (checked: `DocEntry desc` over 3 pages gives 337…101 with no gaps or repeats). Without `$orderby` the order is the SL's own.
- Default page: 20 rows. `Prefer: odata.maxpagesize=100` gives 100 in both versions (the plugin always sends it; never 0).
- `$top` is honoured across pages: `$top=500` with `maxpagesize=100` answers 100 rows and a `nextLink` with `$top=400&$skip=100`. A `$top` that fits in one answer comes with no `nextLink`, so a page cannot tell whether there are more rows.
- Count: `GET <EntitySet>/$count` answers `text/plain` with the bare number, **identical in v1 and v2** (`Orders` 337, `Items` 57, `BusinessPartners` 25), and accepts `$filter`. What does differ is the inline count: `$count=true` (and `$inlinecount=allpages`) adds `odata.count` in v1 and `@odata.count` in v2 to the page. The plugin uses `/$count`.
- A `$filter` on a field that does not exist, sent to `/$count`, did not give an SL error: the proxy answered HTTP 502 with an HTML "Proxy Error" page (both versions). The plugin shows it as `HTTP 502: 502 Proxy Error` (the title, not the markup). The same filter on a normal page was not checked.
- `$expand` works as sent (`Orders`, `$select=DocEntry,BusinessPartner&$expand=BusinessPartner($select=CardName)`). With `$select=DocEntry` alone the expanded part is not returned. An invalid navigation property gives the SL error `code: 201` (v1 number, v2 string) "Cannot expand invalid navigation property 'X' for entity type 'Y'" (`DocumentLines`, `ContactEmployees`, `ItemWarehouseInfoCollection` are not navigation properties).
- Records carry `odata.etag` / `@odata.etag`; the plugin keeps them in the dump and does not use them.
- Volcado file names: the key is the first of `DocEntry`, `CardCode`, `ItemCode`, `Code`, `AbsEntry`, `InternalCode`, `ID`, `Id`, `Number` found in the record; if the `$select` dropped it, rows are named `row-000001`… This is a heuristic, not the real key from `$metadata`.
- `count` writes no Volcado (it has no records).

Session:

- 401 for a dead session: HTTP 401, `code: 301` (v1 number, v2 string `"301"`), `message: "Invalid session or session already timeout."`. A corrupted cookie (`B1SESSION=garbage`) gives the same answer.
- Verified: after `POST /Logout` from outside, or with a corrupted cookie, the next `get` logs in again by itself and succeeds (both versions). `session.json` holds `cookie` (B1SESSION and ROUTEID) and `lastUsedAt`; no password.
- Real session duration (v2, 2026-10-02): the timeout is by inactivity. A session left idle answered 401 at 31 min; another used every 10 min was still valid at 50 min (so each use extends it).
- The 30-minute rule is measured from the last use (`lastUsedAt`); the 401 recovery covers the case where the SL's real rule differs.

Demo-server quirk (not our code), cause found 2026-10-02: the demo has a load balancer with several nodes (`ROUTEID` `.node1` … `.node10`; `.node6` and `.node9` never appeared). One node, `.node4`, answered every data read (`BusinessPartners`, `Items`, `UserTablesMD`) with HTTP 500, `code: 407` (v1 number, v2 string), `message: "Table definition not found for '@ZZVF_T'."`; its login worked. The session sticks to the node through the `ROUTEID` cookie, so a session that landed on `.node4` failed on every request, and one that landed elsewhere was fine (about 1 of 5 logins). 50 logins: `.node4` 6 of 6 broken, the other seven nodes 0 broken. The table `@ZZVF_T` does not exist in the demo company (`UserTablesMD('ZZVF_T')` gives 404, no `ZZ*` user tables or fields). After the developer stopped `.node4`, 50 logins and reads all succeeded. The plugin returns the error literally and does not relogin on it (a relogin would land on another node, but 407 alone cannot tell a broken node from a missing user table). Tests that need a successful read (`getLive` in `test/sl-env.ts`) retry with a new session.

## Not verified against the real Service Layer (pending)

- Behaviour behind a load balancer: partly verified (the cookie keeps the session on one node). Not tested: a node going down in the middle of a session.
- Re-check `.node4` once the developer re-enables it. To reproduce: log in about 50 times (`POST /b1s/v2/Login`), note `ROUTEID` from `Set-Cookie`, read `BusinessPartners('C50000')?$select=CardCode` with that session, then logout, and tally ok/500-407 per node. If `.node4` still fails every time, it is still broken; if every node is ok, the cause is fixed. Remove the retry in `getLive` only if the demo is stable for good.
- Row cap and page size were verified on up to 337 rows. Not tried: thousands of rows, or a collection that changes while it is being traversed (rows added or deleted between pages can repeat or skip rows with `$skip`).
- A bad `$filter` on a normal page (not `/$count`): behaviour not checked.
- Volcado cleanup (slice 6): the 24 h rule is checked with an injected clock and fake old folders (no real waiting), and the parallel-executions test used 2 simultaneous traversals of the real SL on one existing session. Not tried: more than 2 in parallel; many parallel executions that all start without a session (parallel first logins failed on the demo, see above).
- Row cap and paging were verified on up to 337 rows. Not tried: thousands of rows, or a collection that changes while it is traversed (rows added or deleted between pages can repeat or skip rows with `$skip`).
- A bad `$filter` on a normal page (not `/$count`): behaviour not checked.
- Composite keys (`Entity(A=1,B='x')`): not implemented. Pending.
- String keys made only of digits must be passed quoted (`'123'`); unquoted digits are sent as numbers. Not verified against an entity set with such keys.
