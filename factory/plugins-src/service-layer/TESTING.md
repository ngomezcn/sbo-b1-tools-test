# Testing — service-layer plugin

Run everything from this folder: `npm test` (loads the repo-root `.env`: `SL_URL`, `SL_COMPANY`, `SL_USER`, `SL_PASSWORD`). Also `npm run typecheck` and `npm run build`.

## Executed

- Slice 1 (local files, version validation): no server needed.
- Slice 2 (Setup login/logout): executed against FP 2608 (`Version` 1000340), `v1` and `v2`, 2026-10-02.

- Slice 3 (`get` by key): executed against FP 2608, `v1` and `v2`, 2026-10-02.

- Slice 4 (session reuse, relogin): executed against FP 2608, `v1` and `v2`, 2026-10-02. Clock injected for the 30-minute rule (no real waiting).

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
- `Set-Cookie` on login: `B1SESSION` and also `ROUTEID` (even on this single-node demo). Both are sent back.

Session:

- 401 for a dead session: HTTP 401, `code: 301` (v1 number, v2 string `"301"`), `message: "Invalid session or session already timeout."`. A corrupted cookie (`B1SESSION=garbage`) gives the same answer.
- Verified: after `POST /Logout` from outside, or with a corrupted cookie, the next `get` logs in again by itself and succeeds (both versions). `session.json` holds `cookie` (B1SESSION and ROUTEID) and `lastUsedAt`; no password.
- Real session duration (v2, 2026-10-02): the timeout is by inactivity. A session left idle answered 401 at 31 min; another used every 10 min was still valid at 50 min (so each use extends it).
- The 30-minute rule is measured from the last use (`lastUsedAt`); the 401 recovery covers the case where the SL's real rule differs.

Demo-server quirk (not our code): a fresh session sometimes cannot read anything: HTTP 500, `code: 407` (v1 number, v2 string), `message: "Table definition not found for '@ZZVF_T'."`, on every request of that session; another session reads the same record fine. Seen in about 1 of 5 logins, on several entity sets. The plugin returns it literally and does not relogin on it. Tests that need a successful read (`getLive` in `test/sl-env.ts`) retry with a new session.

## Not verified against the real Service Layer (pending)

- Behaviour behind a real load balancer (several nodes with different `ROUTEID`): not tested.
- Composite keys (`Entity(A=1,B='x')`): not implemented. Pending.
- String keys made only of digits must be passed quoted (`'123'`); unquoted digits are sent as numbers. Not verified against an entity set with such keys.
