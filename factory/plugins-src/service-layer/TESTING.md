# Testing — service-layer plugin

Run everything from this folder: `npm test` (loads the repo-root `.env`: `SL_URL`, `SL_COMPANY`, `SL_USER`, `SL_PASSWORD`). Also `npm run typecheck` and `npm run build`.

## Executed

- Slice 1 (local files, version validation): no server needed.
- Slice 2 (Setup login/logout): executed against FP 2608 (`Version` 1000340), `v1` and `v2`, 2026-10-02.

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

## Not verified against the real Service Layer (pending)

- Setup against a Service Layer behind a load balancer (`ROUTEID` cookie): not tested; only `B1SESSION` is sent.
