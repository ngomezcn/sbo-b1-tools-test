# Testing — service-layer plugin

Run everything from this folder: `npm test` (loads the repo-root `.env`: `SL_URL`, `SL_COMPANY`, `SL_USER`, `SL_PASSWORD`). Also `npm run typecheck` and `npm run build`.

## Executed

- Slice 1 (local files, version validation): no server needed.
- Slice 2 (Setup login/logout): executed against FP 2608 (`Version` 1000340), `v1` and `v2`, 2026-10-02.

- Slice 3 (`get` by key): executed against FP 2608, `v1` and `v2`, 2026-10-02.

- Slice 4 (session reuse, relogin): executed against FP 2608, `v1` and `v2`, 2026-10-02. Clock injected for the 30-minute rule (no real waiting).

- Slice 5 (page, count, traverse): executed against FP 2608, `v1` and `v2`, 2026-10-02. Data of the demo as it is (Orders 337, Items 57, BusinessPartners 25): enough for several pages and the cap, nothing created.

- Slice 6 (Volcado cleanup, 24 h safety net, parallel executions): executed against FP 2608, `v2` (the logic does not depend on the OData version), 2026-10-02. Clock injected.

- Slice 7 (Contexto de objeto): executed against FP 2608, `v1` and `v2`, 2026-10-02. Own user fields created in the demo company by the tests themselves (`ensureUserFields` in `test/sl-env.ts`): `U_SBOCTX` (mandatory, with valid values, on `OCRD`), `U_SBOCTXN` (`ORDR`), `U_SBOCTXL` (lines, `RDR1`). The week rule uses an injected clock.

- Pending items of session 2 (map of tables, user tables and objects, `--tables`, unknown entities, thousands of rows, a collection that changes, 8 parallel executions, invalid `$filter`, POST without a mandatory user field): executed against FP 2608, `v1` and `v2`, 2026-10-02. Test files `use-tables`, `use-bulk`, `use-parallel`, `use-errors`, and new cases in `use-context`. Data they leave in the demo (disposable): user fields `U_SBOMAP*` on standard tables, user tables `@SBOCTXT`, `@SBOUDT` (user object `SBOUDT`), `@SBOUDTL`; `@SBOBULK` (2500 rows) was dropped at the end of the session (the next `use-bulk` run recreates and refills it).
- Slice 8 (writes: POST, PATCH, DELETE in seco and with `--execute`): executed against FP 2608, `v1` and `v2`, 2026-10-02 (`test/use-write.test.ts`). Business partners created by the tests are deleted by them.

- Slice 9 (complete Setup, the wizard): executed against FP 2608, `v1` and `v2`, 2026-10-02 (`test/setup-wizard.test.ts`, plus the earlier Setup tests). The questions are driven by a scripted developer (answers fed to the same code the terminal uses); the logins are real.

- Slice 10 (reorganisation into one plugin, end to end): 2026-10-02, FP 2608. Not a test file: done by hand with the real `claude` CLI and the real SL (below).

- Slice 11 (generic `request`, ADR 0012; replaces `post`/`patch`/`delete`): 2026-10-02, FP 2608, `v1` and `v2`. `test/use-request.test.ts` (live; the old write tests adapted to `request`, plus headers, `$batch`, read POST) and `test/request-unit.test.ts` (no server: headers, paths, multipart builder and parser, read/write classification, dry run, binary download, attachment upload; it uses an injected transport, like the 502 case of slice 5). Full run: 149 tests, 149 pass. The count/traverse tests of `use-read.test.ts` now filter `DocEntry le 337`: an order cannot be deleted, so every run of the write tests leaves orders in the demo and the unfiltered counts drifted (343 seen).

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
- Invalid `$filter` (checked 2026-10-02, `v1` and `v2`, 24 sessions on 6 nodes, page and `/$count` alike): HTTP 400, `code: 201` (v1 number, v2 string), `message: "Property 'NoSuchField' is invalid"` for an unknown field and `"Query string error - Invalid filter condition"` for a syntax error. The plugin returns exactly that (`{ok:false, status:400, resumen:null, error:{code, message}}`, no markup). The `502 Proxy Error` HTML page seen once on `/$count` with a bad field **did not repeat** (probably the broken node, see below); if it comes back the plugin shows it as `HTTP 502: 502 Proxy Error` (title only; that case is tested with an injected answer, the only fake in the suite).
- `$expand` works as sent (`Orders`, `$select=DocEntry,BusinessPartner&$expand=BusinessPartner($select=CardName)`). With `$select=DocEntry` alone the expanded part is not returned. An invalid navigation property gives the SL error `code: 201` (v1 number, v2 string) "Cannot expand invalid navigation property 'X' for entity type 'Y'" (`DocumentLines`, `ContactEmployees`, `ItemWarehouseInfoCollection` are not navigation properties).
- Records carry `odata.etag` / `@odata.etag`; the plugin keeps them in the dump and does not use them.
- Volcado file names: the key is the first of `DocEntry`, `CardCode`, `ItemCode`, `Code`, `AbsEntry`, `InternalCode`, `ID`, `Id`, `Number` found in the record; if the `$select` dropped it, rows are named `row-000001`… This is a heuristic, not the real key from `$metadata`.
- `count` writes no Volcado, by design: it answers one number and the Volcado exists so that big answers do not overflow the LLM's context.

`$metadata` and `UserFieldsMD` (Contexto de objeto, FP 2608):

- Size and time of `GET $metadata`: v1 2 139 445 bytes (2.1 MB), v2 1 856 724 bytes (1.9 MB), about 0.15 s with curl on the local demo. `GET UserFieldsMD?$filter=TableName eq 'OCRD'` about 0.4 s. A whole context generation (login included) took 0.6 to 1.8 s. The XML is parsed for one entity and dropped; only the ficha is written (BusinessPartners about 14 KB, Orders about 26 KB in both versions).
- **`$metadata` is not the same on every node.** Each node serves its own cached copy: 10 sessions on different nodes gave 3 different sizes in each version (v2: 1 856 724, 1 857 268 on `.node10`, 1 857 816 on `.node5`). `.node10` lists an entity `U_ZZVF_T` (a user table that does not exist in the company) and `.node5` has two more `U_` properties than the others. A user field created through `UserFieldsMD` showed in `$metadata` only on the node that had served the creation (v2) and in none of the v1 copies tried; fresh sessions on 6 other nodes did not list it. So the plugin takes **user fields only from `UserFieldsMD`** (read from the database) and ignores every `U_` property of `$metadata`.
- Probable link with the 407 above (not proven): the broken node answered about `'@ZZVF_T'`, the same user table that only some nodes list in `$metadata`. A second table, `'@ZZVF_D1'`, gave the same 407 during the tests of this slice (on a node not identified), in both versions.
- `UserFieldsMD`: `Name` has no `U_` prefix (`SBOCTX` is `U_SBOCTX`); `TableName` is the **database table** (`OCRD`, `ORDR`, `RDR1`), not the entity; for a user-defined table it is `@NAME` (`@SBOCTXT`, with the `@`) and its entity set is `U_SBOCTXT` with the fields as `U_F1`. The entity-set-to-table link is not in `$metadata`: the plugin has its own map (`tablesFor`) for standard entities and asks `UserObjectsMD` for user objects (below). Key of one row: `UserFieldsMD(TableName='OCRD',FieldID=0)`.
- A user field created on a document-line table (`RDR1`) appeared as rows of every document's line table (`DLN1`, `INV1`, `CIN1`, …) and one on a header or item table also got archive copies (`ACRD`, `AITM`, …). The ficha reads only the table(s) of the entity, so it lists the field once.
- `UserFieldsMD` row, fields used: `Name`, `TableName`, `Type` (`db_Alpha`, `db_Memo`, `db_Float`…), `SubType`, `Size`, `EditSize`, `Mandatory` (`tYES`/`tNO`), `DefaultValue`, `Description`, `LinkedTable`, `ValidValuesMD` (`Value`, `Description`). A mandatory field showed `Nullable="false"` in the v2 `$metadata` of the node that had it.
- Creating `db_Numeric` with `Size: 8` on `ORDR` was refused (`-5002`, "Field size deviates from legal range [1..11]"; not investigated). A `db_Float` with `SubType: st_Sum` was created.
- v1 and v2 `$metadata` differ: v1 is EDMX 1.0 (OData V3), `EnumType` members have no `Value`; v2 is EDMX 4.0, `EnumType IsFlags="false" Name=… UnderlyingType="Edm.Int32"` (`Name` is not the first attribute) and members have `Value`. Types: `Edm.DateTime`/`Edm.Time` in v1, `Edm.DateTimeOffset`/`Edm.TimeOfDay` in v2. Navigation properties are `FromRole/Relationship/ToRole` in v1 and `Partner/Type` in v2. Entity types and property names are the same. Standard fields carry no size or `MaxLength`; only `Nullable`.
- `Orders`, `Quotations`, … share the entity type `Document`; user fields of each document type come from its own table (`ORDR` vs `OQUT`).

Entity to table of the user fields (checked live, 2026-10-02, `v1` and `v2`):

- Every table of the map has rows in `UserFieldsMD` and every entity set and collection of the map is in `$metadata`, with its user fields shown by the ficha in the right section. **Wrong entry found and fixed:** `StockTransfers` lines are `StockTransferLines`, not `DocumentLines`; `InventoryTransferRequests` (`OWTQ`/`WTQ1`) added.
- A user field created on one marketing-document header table (`ORDR`) is created by the SL on **all** of them (`ORDR`, `OQUT`, `OINV`, `ODLN`, `ORDN`, `ORIN`, `ODPI`, `OPOR`, `OPQT`, `OPRQ`, `OPCH`, `OPDN`, `ORPD`, `ORPC`, `ODPO`, `ODRF`, `OIGN`, `OIGE`, `OWTR`, `OWTQ`, plus others such as `OCIN`, `ADOC`) and likewise for lines (`RDR1` -> `QUT1`, `INV1`, ..., `WTR1`, `WTQ1`). So the fields cannot tell `Orders` from `Quotations`: what the test proves is that each table exists and that the ficha shows the field in the right section. That `Orders` is `ORDR` rests on SAP's own table names. `OITM` also gets `AITM`, `SITM`, `UITM`; `OJDT` gets `AJDT`, `OBTF`; `OWOR` gets `AWOR`, `UWOR`; `OCRD`, `CRD1`, `OCPR`, `OWHS` get only their archive copy. The ficha reads only the table(s) of the entity.
- There is no reliable way to derive the table from the SL for standard entities: `UserTablesMD` lists only user-defined tables, `UserObjectsMD` only user objects, and `$metadata` has no table names. The map stays; `--tables` covers what it does not know.
- A user-defined table **without** a user object (`bott_NoObject`, `SBOCTXT`) is exposed as entity set `U_SBOCTXT` (key `Code`, fields `U_F1`) and its table is `@SBOCTXT`: the `U_<NAME>` rule is right. The ficha was generated live for it.
- A user table **registered as a user object** (`SBOUDT`, `ObjectType: boud_MasterData`) is exposed under the object code (`SBOUDT`), **not** `U_SBOUDT` (`GET U_SBOUDT` gives 400 "Service Not Found"). `UserObjectsMD('SBOUDT')` gives `TableName` (`SBOUDT`, fields in `@SBOUDT`) and `UserObjectMD_ChildTables`; a child table `SBOUDTL` appears as collection `SBOUDTLCollection` (complex type `SBOUDTL`). The plugin now resolves it from `UserObjectsMD` and the ficha shows the fields of the table and of the child table. Child tables were added with a PATCH after the object was created. Not tried: objects of document type (`boud_Document`), whose collection names are not verified.
- `$metadata` visibility of a new table depends on the node: a table (or user object) created a moment ago is listed only by the node that served the creation; other nodes took more than 25 minutes (some, like `.node5` and `.node8`, still did not list `U_SBOCTXT`, older than an hour). In this demo a new session often could not get back to the creating node at all (the table `@SBOBULK` was listed by no reachable node after its creation). In the tests: the creating session is reused, or sessions are repeated until one lists the entity (`untilListed`, `adminSeeing`), and as a last resort the table is dropped and created again. The ficha command answers `ENTITY_NOT_FOUND` on a node that does not list it; with `--refresh` the developer can try again (new session, other node).
- `UserFieldsMD` and `UserObjectsMD` themselves are read from the database and agree across nodes.
- A session (`B1SESSION` + `ROUTEID`) is accepted by both `/b1s/v1` and `/b1s/v2`.

Plugin behaviour verified in `use-context.test.ts` (real SL):

- `--tables` is stored in the ficha (header line `Tables set with --tables: ...` and `[--tables]` on the section title) and reused when the ficha is regenerated by age, by `--refresh` or by the operation that finds it old; new `--tables` replace it, `--tables default` removes it.
- An entity that `$metadata` does not list: the first operation downloads `$metadata` once and writes `context/<Entity>.missing`; the following `page`, `count`, `traverse` and `context` on that entity make no `$metadata` request (the context command says to use `--refresh`). After a week (injected clock), with `context --refresh` or with `--refresh-context` it looks again. The AI path never forces it.

Writing without a mandatory user field (POST, only observed; writes are slice 8):

- `UserFieldsMD` itself **refuses to create a mandatory field on a standard table without a default value** (`-5002`, "A default value must be defined for a mandatory field"). So a mandatory standard-table field always has a default.
- `POST BusinessPartners` without `U_SBOCTX` (mandatory, default `"A"`, valid values A/B): **accepted, 201**, and the record is stored with `U_SBOCTX = "A"` (the default). Same in `v1` and `v2`. The SL does not reject a missing mandatory field; it applies the default.
- With a value outside the valid list, or with `""`: HTTP 400, `code: -1004` (v1 number, v2 string), `"'Z' is not a valid value for property 'U_SBOCTX'. The valid values are: 'A' - 'Alpha', 'B' - 'Beta'"`.
- A mandatory field of a **user-defined table** can be created without a default (it becomes a NOT NULL column). `POST` to `SBOUDT` without `U_F1` answers HTTP 400 with the raw SQL error: `[Microsoft][ODBC Driver 17 for SQL Server][SQL Server]Cannot insert the value NULL into column 'U_F1', table 'SBODemoES.dbo.@SBOUDT'; column does not allow nulls. INSERT fails.`
- Consequence for the ficha: `!` on a user field means "mandatory in UserFieldsMD"; on a standard table it never makes a write fail (the default is applied), on a user table it does. The business partners created by this check were deleted.

Traverse with thousands of rows (user table `@SBOBULK`, 2500 rows, both versions, 2026-10-02):

- Default cap (1000): 10 pages, `truncado: true`, 1000 files. All rows (`--max-rows 5000 --orderby Code`): 2500 rows in **26 requests** (25 full pages and an empty 26th: a full last page still carries a `nextLink`), 1.6 to 1.9 s on the same machine as the demo. The JSON output is 556 characters in both cases (path, counts, index path; no keys because there are more than 50). `_index.json` carries date, query, count, pages, `truncated`, `maxRows` and the 2500 keys (about 37 KB).
- Inserting 2500 rows with POST (8 in parallel on one session) took 70 s; one POST alone about 350 ms.
- A collection that changes during the traversal, with `$orderby=Code` and paging by `$skip` (a change made between page 10 and page 11): a row **inserted** before the current position gives 2501 rows with **one repeated** (the dump names the second copy `<key>~2`) and none missing; a row **deleted** before it gives 2499 rows with **one skipped** (the first row of the next page moved up) and none repeated. Nothing fails and the output does not say so: the SL gives no signal. A traversal is not a snapshot; for a consistent copy, run it when nobody writes, or compare `filas` with `count` afterwards.

Parallel executions (2026-10-02):

- Before the fix, 8 `use.mjs` processes at once on an empty repo failed: one login answered HTTP 500, `code: 299`, "SAML Login Failed" (the same failure as the 8 parallel `Login` calls above), others lost their ficha to the same error, the ficha was generated several times and 8 sessions were left open on the server. Now the login is under a lock and each ficha is generated once. 8 processes at once from nothing, in `v1` and `v2`: all succeed, one session, one whole ficha, 8 separate Volcados, no leftover lock or temporary files (`test/use-parallel.test.ts`, real processes). Repeated several times in a row without failures.

Session:

- 401 for a dead session: HTTP 401, `code: 301` (v1 number, v2 string `"301"`), `message: "Invalid session or session already timeout."`. A corrupted cookie (`B1SESSION=garbage`) gives the same answer.
- Verified: after `POST /Logout` from outside, or with a corrupted cookie, the next `get` logs in again by itself and succeeds (both versions). `session.json` holds `cookie` (B1SESSION and ROUTEID) and `lastUsedAt`; no password.
- Real session duration (v2, 2026-10-02): the timeout is by inactivity. A session left idle answered 401 at 31 min; another used every 10 min was still valid at 50 min (so each use extends it).
- The 30-minute rule is measured from the last use (`lastUsedAt`); the 401 recovery covers the case where the SL's real rule differs.

Demo-server quirk (not our code), cause found 2026-10-02: the demo has a load balancer with several nodes (`ROUTEID` `.node1` … `.node10`; `.node6` and `.node9` never appeared). One node, `.node4`, answered every data read (`BusinessPartners`, `Items`, `UserTablesMD`) with HTTP 500, `code: 407` (v1 number, v2 string), `message: "Table definition not found for '@ZZVF_T'."`; its login worked. The session sticks to the node through the `ROUTEID` cookie, so a session that landed on `.node4` failed on every request, and one that landed elsewhere was fine (about 1 of 5 logins). 50 logins: `.node4` 6 of 6 broken, the other seven nodes 0 broken. The table `@ZZVF_T` does not exist in the demo company (`UserTablesMD('ZZVF_T')` gives 404, no `ZZ*` user tables or fields). After the developer stopped `.node4`, 50 logins and reads all succeeded. The plugin returns the error literally and does not relogin on it (a relogin would land on another node, but 407 alone cannot tell a broken node from a missing user table). Tests that need a successful read (`getLive` in `test/sl-env.ts`) retry with a new session.

Writes (slice 8, then the commands `post`/`patch`/`delete`, now `request`; FP 2608, `BusinessPartners`, `v1` and `v2`, 2026-10-02):

- POST: **201**, body is the created record (about 9.8 KB for a business partner, same size in both versions) with `odata.metadata` and `odata.etag` (v1) or `@odata.context` and `@odata.etag` (v2); also a `Location` header (`.../BusinessPartners('<key>')`) and an `ETag` header. Without `Prefer: return-no-content` the record always comes back; the plugin does not send that header. The record goes to a Volcado, not to the output.
- PATCH: **204**, empty body, no `ETag` header; also 204 for an empty `{}` body. DELETE: **204**, empty body.
- Neither PATCH nor DELETE needed `If-Match` on `BusinessPartners`: both worked without it (the plugin never sends one).
- Errors, literal (`v1` code is a number and `message` is `{lang, value}`; `v2` code is a string, `message` a string, plus `details: [{code: "", message: ""}]`):
  - unknown field in POST: HTTP 400, `-1000`, `Property 'NoSuchField' of 'BusinessPartner' is invalid`;
  - POST without `CardCode`: HTTP 400, `-5002`, `Code undefined  [OCRD.CardCode]`;
  - POST with an existing `CardCode`: HTTP 400, `-10`, `1320000140 - Business partner code '<code>' already assigned...`;
  - PATCH or DELETE on a key that does not exist (also DELETE twice): HTTP 404, `-2028`, `Entity with value('<key>') does not exist` (a read of a missing key says `No matching records found (ODBC -2028)`, a different text).
- No difference between `v1` and `v2` in status codes or in what is written; they differ only in the shape of the error (above) and in the annotations of the POST answer.
- The dry run sends no POST, PATCH or DELETE (the test counts every request of the real transport; `Login` and `Logout` are POSTs of the session and are filtered out) and afterwards the record is unchanged, the count of `BusinessPartners` is the same and the new key does not exist. A dry run may still read: if the Contexto de objeto of the entity is missing or old, the tool generates it first (`$metadata`, `UserFieldsMD`), as for any operation on that entity.
- `prod`: `--execute` without `--allow-prod` sends nothing (`PROD_WRITE_NOT_ALLOWED`); the dry run on `prod` works without it. The test uses the demo company as `prod` (the name of the environment is only a folder).

`request` (slice 11, FP 2608, `v1` and `v2` unless noted, 2026-10-02):

- **Headers:** `B1S-ReplaceCollectionsOnPatch: true` on `PATCH BusinessPartners('<key>')` with `ContactEmployees` replaced the collection (`A`,`B` became `C`; without the header the SL appended or kept others, not asserted). `Prefer: odata.maxpagesize=2` gave 2 rows and a `siguiente` nextLink. `Cookie` is refused by the tool before anything is sent. `EventSubscriptions` (webhooks) could not be created in this demo (HTTP 400, `-21100`, "Webhook manipulation error."), so the documented use of the header on `EventSubscriptions` was not run; the header itself was verified on `BusinessPartners`.
- **`$batch` (v2 by hand, v1 and v2 in the test):** GET + changeset (POST with `Content-ID` 1, PATCH `$1` with `Content-ID` 2) + GET: the SL answered HTTP 200 with a multipart/mixed answer; sub-answers 200, 201, 204, 200. Standalone GET answers carry no Content-ID (the tool names them `part-N` or by the request's `contentId`); changeset answers repeat it. A changeset whose second request is a duplicate key: the outer status is 200, one answer (400, `-10`) for the changeset, the first POST rolled back (a read of its key is 404), the following sub-request not executed. The sub-request line is `METHOD /b1s/<v>/<path>` without `HTTP/1.1`, as in the docs; the SL accepted it.
- **Read POST:** `POST SQLQueries('<code>')/List` with `--read` ran directly and returned the rows (3); `GET .../List` returned the same. Without `--read` it is a dry run. `SQLQueries` created and deleted by the test.
- **Actions:** `POST Orders(<key>)/Cancel` with no body: 204. `POST CompanyService_GetPathAdmin --read`: 200 with an object, dumped to one file.
- **Attachments and item images: NOT verified end to end.** The demo's folders are not usable: `POST Attachments2` (multipart `--file`, and `--stream-file` with `Slug`) answered HTTP 400 `-5002` "The attachments folder is not defined, or it has been changed or removed."; `ItemImages`, `Pictures` answered 404 "The folder specified in 'PicturesFolderPath' could not be found". `CompanyService_GetPathAdmin` shows `AttachmentsFolderPath` and `PicturesFolderPath` as UNC paths on another host; `CompanyService_UpdatePathAdmin` to a local path was refused (`10001237 - Enter valid folder path`) and nothing was changed. So the multipart/form-data and Slug bodies, binary download, file naming and the 50 MB limit are covered by unit tests only; the one live fact is that the SL reached its folder logic after parsing the request. To close this, point those folders at a share the SL can write and run `Attachments2` upload, `Attachments2(<n>)/$value` and `ItemImages` PATCH/GET/DELETE.

Setup, complete (slice 9):

- The wizard asks: B1 version (closed list; an unlisted one is accepted with the warning, a malformed one is asked again), OData version with preselection (`v2` from FP 2405, `v1` before; the developer may choose the other), then `Configure dev/uat/prod? [y/N]` (at least one) and URL, company, user and password for each. Each environment's login is tested as soon as it is entered; if it fails the literal SL error is shown (`-304 Fail to NONE-SSO login from SLD.` for a wrong password) and the developer retries or skips it. The Setup proper then runs from scratch and tests every login again, so nothing is left configured without a successful login.
- If a setup exists, the wizard asks before erasing it (data and contexts included). A "no" changes nothing.
- `.sbo-skills/` that cannot be added to `.gitignore` (tested with a folder named `.gitignore`) gives a warning that names the folder and says it holds passwords; the Setup still completes.
- `--status` prints `versionB1`, `versionOData` and the configured environments, never credentials; `SETUP_MISSING` if there is none.
- The password is read with no echo (`createAsk`: output muted while the secret is typed). With no TTY (how an AI tool runs commands) the wizard refuses with `NEEDS_TERMINAL` and says to run it in the developer's own terminal; checked with a real child process.
- A login right after another one on the demo failed once in a full run (`setup-login`, "a failing environment is not left configured", 1 of about 6 runs; the same test passed on the next runs). Probably the demo's parallel-login failure (SAML) or a bad node; not investigated.

Plugin installed end to end (slice 10, `v2`, `claude` 2.1.286, isolated with `CLAUDE_CONFIG_DIR`, empty git repo in a temp folder):

- `claude plugin validate` passes for the marketplace and the plugin. `claude plugin marketplace add <sbo-skills folder>` and `claude plugin install service-layer@sbo-skills` install one plugin (`service-layer` 0.1.0) with `dist/`, `skills/setup`, `skills/use`, `skills/docs` and the README.
- From the installed copy: `setup.mjs` (flag form, password in the environment variable) configured `dev` against the real SL and wrote `.gitignore`; `--status` listed `dev`; `setup.mjs` with no TTY answered `NEEDS_TERMINAL`; `use.mjs count` and `get` read `BusinessPartners` (ficha generated on the first call); `post` in seco printed the request and sent nothing; `post --execute` created a business partner (201) and `delete --execute` removed it (204).
- Reproducible output: `publish-plugin` run twice into two empty folders gives identical trees (`diff -r`), and run again over the committed plugin leaves `git status` of `sbo-skills` clean.

Full run of the end of session 3 (`npm test`, 120 tests, FP 2608, 2026-10-02): 118 pass. The 2 that failed are in `test/use-tables.test.ts` (user table `@SBOCTXT` and user object `SBOUDT`): `ENTITY_NOT_FOUND`, because the node that served the session does not list the entity in `$metadata` (the node visibility of new user tables described above). They passed in an earlier run of the same session and failed again alone on a re-run; the code they exercise was not touched by slices 8 to 10. The demo needs those tables listed by the node the tests land on; recreating them (dropping `@SBOCTXT` and `@SBOUDT`) is the known workaround and was not done here.

Checks done after the first closing of session 3 (2026-10-02, FP 2608):

- Real terminal (Windows ConPTY, via `pywinpty`, `node setup.mjs` from the plugin): the password is not shown on the screen, a typo corrected with backspace in the user prompt redraws the prompt correctly, the login passes and `config.md` is written.
- Claude Code (`claude -p --plugin-dir`, 2.1.286) with the real skills: `${CLAUDE_PLUGIN_ROOT}` **is** replaced in the skill text (the model ran `node "C:/.../service-layer/dist/use.mjs"`). Asked to create a business partner it read the ficha, ran the dry run, showed method, URL and body and asked for approval without executing. Told in the prompt to execute directly after the dry run (developer's own words), it executed, got `-1000 Property 'NoSuchField' of 'BusinessPartner' is invalid` and reported it literally, without regenerating the ficha (it did not read the ficha date; the skill was tightened to ask for it). Asked to configure the Service Layer with the password in the prompt, it refused to use it, told the developer to run `setup.mjs` in their own terminal and said it would check with `--status`.
- Documents (`v1` and `v2`): POST of a draft order (`Drafts`, `DocObjectCode: oOrders`) with two lines is 201; PATCH of one line with `{"DocumentLines":[{"LineNum":1,"Quantity":7}]}` is 204 and changes only that line (line 0 kept); DELETE of the draft is 204. `POST Orders` is 201 but `DELETE Orders` is refused: HTTP 400, `-5006`, `The requested action is not supported for this object.` (an order is cancelled with an action, out of scope).
- Composite keys: `get UserFieldsMD "TableName='OCRD',FieldID=0"` works in `v1` and `v2` (the key goes as written, values encoded). A single string that only contains `=` is still one quoted string key.
- The two `use-tables` tests that failed in the full run passed after dropping and recreating the user tables `@SBOCTXT` and `@SBOUDT` in the demo (the entity took 11 attempts to be listed by a node).

## Not verified against the real Service Layer (pending)

- Attachment and item image upload and download, `Slug` streaming (above).
- A `$batch` whose answer contains a binary sub-response (the parser decodes the answer as UTF-8 text).
- `B1S-ReplaceCollectionsOnPatch` on `EventSubscriptions` (webhooks are not available in the demo).

- The hidden password on macOS and Linux terminals: only Windows (ConPTY) was run (below). Same readline code, not run there.
- The model's behaviour with `use` and `setup` was observed in 3 runs only (below), not evaluated at scale.



- Writes with `If-Match` and an ETag that does not match (412): the plugin sends none by design; not tried through the plugin.
- A POST that the SL accepts but whose answer is lost (network cut after sending): the plugin does not retry a write; not simulated.

- Behaviour behind a load balancer: partly verified (the cookie keeps the session on one node). Not tested: a node going down in the middle of a session.
- Re-check `.node4` once the developer re-enables it. To reproduce: log in about 50 times (`POST /b1s/v2/Login`), note `ROUTEID` from `Set-Cookie`, read `BusinessPartners('C50000')?$select=CardCode` with that session, then logout, and tally ok/500-407 per node. If `.node4` still fails every time, it is still broken; if every node is ok, the cause is fixed. Remove the retry in `getLive` only if the demo is stable for good.
- Invalid `$filter` on `/$count` giving the `502 Proxy Error` HTML page: seen once, not reproducible later (24 sessions, 6 nodes, both versions). The plugin's handling of that page is tested only with an injected answer.
- Contexto de objeto for a user object of document type (`boud_Document`): the `<ObjectName>Collection` naming was checked only with a master-data object. Entities with composite keys: not tried.
- A negative answer ("`$metadata` does not list this entity", cached a week) is also given by a node that merely has not refreshed its `$metadata` yet (see above), so a freshly created user table can be reported missing for a week on some nodes. Mitigation: `context <Entity> --refresh` (the developer). Not done: dropping the cached negative when an operation on that entity succeeds.
- String keys made only of digits must be passed quoted (`'123'`); unquoted digits are sent as numbers. Not verified against an entity set with such keys.
