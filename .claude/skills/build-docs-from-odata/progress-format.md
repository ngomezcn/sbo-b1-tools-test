# Ledger formats: `PROGRESS.md` and `PENDING-REVIEW.md`

Both live in `LEDGER/` (`factory/docs-src/odata-staging`), in English. Every path in this skill is relative to the repo root unless it starts with `DOCS/`, `LEDGER/`, `WORK/`, `SL/` or `PINS` (defined in `profile.md`). `verify_odata_block.py` parses the Plan tables of `PROGRESS.md`: keep the table headers exactly as shown.

## `PROGRESS.md`

```markdown
# Docs build ledger: odata (reference/odata)

Pins: .claude/skills/build-docs-from-odata/pins.json · Skill: /build-docs-from-odata · Extracted: 2026-10-02

## RESUME HERE

**Done last session:** bloque `headers-and-versioning` integrated and verified (3 hojas).
**Next:** plan bloque `status-codes-and-errors` (#7): dispatch the planner.
**Waiting on the user:** PENDING-REVIEW.md items 3 and 6.
**Open decisions:** none.
**Suggested skills:** /build-docs-from-odata

## Bloques

| # | bloque | fragments | status |
|---|---|---|---|
| 1 | overview-and-data-model | ms-overview, ms-data-model, oasis-p1 2-4 | done |
| 9 | batch-and-async | oasis-p1 11.6, 11.7 | pending |

## Plan: headers-and-versioning

Approved: 2026-10-02 (<who>)

### Fragment decisions

| fragment | decision | where / reason |
|---|---|---|
| oasis-p1-8.3.2 | include | etag-and-concurrency.md |
| oasis-p1-8.2.1 | merge | etag-and-concurrency.md |
| oasis-p1-8.4 | exclude | not needed to consume a service |

### Hojas

| hoja | title | fragments | mode | unit | SL candidates |
|---|---|---|---|---|---|
| headers-and-versioning/etag-and-concurrency.md | ETag and concurrency | oasis-p1-8.3.2 (base), ms-update-data--etag (second: adds the 412 example) | condense | u1 | reference/etag/etag-guide.md; reference/etag/etag-usage.md |

### Unidades de trabajo

| unit | fragments | hojas | status | notes |
|---|---|---|---|---|
| u1 | oasis-p1-8.3.2, ms-update-data--etag | headers-and-versioning/etag-and-concurrency.md | reviewed | |

### Disambiguation candidates

- OData ETag vs SL `reference/etag/etag-guide.md`.

### Questions

- (planner's questions, recommendation first)

## Decisions

- 2026-10-02 user: bloque list confirmed as in profile.md.

## Notes

- Source defects, unsure items, `Source conflicts`, `SL conflicts`, script changes.
```

**Statuses.** Bloque: `pending` → `planned` (awaiting approval) → `approved` → `transcribing` → `reviewing` → `done`, or `needs-split`, or `dropped` (every fragment excluded; no folder; reason in the plan). Unit: `pending` → `transcribed` → `reviewed`, or `needs-fix` or `needs-split`.

**Bloques table.** `fragments` is a short summary; the Fragment decisions table is the authority. Splitting a bloque means new rows.

**Plan sections** accumulate, one per bloque, newest last. Hoja paths are relative to `DOCS/reference/odata/`. Every fragment the planner considered has one row in Fragment decisions (`include`, `merge` into a named hoja, or `exclude` with a one-sentence reason); every included or merged fragment appears in some hoja's `fragments`, with its role (`base`, `second`, and why the second adds something); every hoja belongs to exactly one unit. Hoja mode is recorded only here. `SL candidates` are the SL hoja paths (from the SL root, `none` if no candidate) the transcriber starts from for the `In Service Layer:` line; the transcriber makes the final choice.

**RESUME HERE** is a handoff for an agent that has nothing but the repo. Rewrite it whole at the end of every session, and whenever you stop mid-step:

- **Done last session**: what changed, with bloque and unit names.
- **Next**: the exact next action.
- **Waiting on the user**: plan approvals, open planner questions, PENDING-REVIEW items.
- **Open decisions**: anything undecided that blocks or shapes the next step.
- **Suggested skills**: the skills the next session should invoke.

Everything else stays in the sections above, without repetition. **Decisions** is append-only: dated, with who decided. **Notes**: source defects, extraction quirks, script changes.

## Approval, autonomous and parallel mode

- Normal mode: the user approves each plan; `Approved: <date> (<user>)`.
- Autonomous run (the user delegated approvals): the supervisor approves, writing `Approved: 2026-10-02 (supervisor, delegated by the user)`, and records the delegation in Decisions.
- Parallel build (several bloque supervisors at once): block supervisors never touch `PROGRESS.md`. Each writes its ledger section (its `## Plan: <bloque>` block plus its Decisions and Notes lines) to `LEDGER/progress-parts/<n>-<bloque>.md`. A final assembler merges the parts into `PROGRESS.md` in bloque order and then deletes `progress-parts/`. While parts exist, `verify_odata_block.py` reads the plan from `progress-parts/*<bloque>.md`.

## `PENDING-REVIEW.md`

Items for the user; everything that would touch `SL` or `sbo-skills/` goes here instead of being done. Numbered, each with what, why and the exact proposed text or change:

1. ~~Move `DOCS/reference/odata/` to `SL/reference/odata/`~~ **Done (2026-10-02, supervisor-delegated):** hojas live at `DOCS/reference/odata/`; ledger stays in `LEDGER/`. Items 2–5 remain in the user's `PENDING-REVIEW.md` for follow-up.
2. Root `SL/SKILL.md`: draft rows (By intent, Confusable terms) and the `description` update.
3. `SL/reference/etag/index.md` and `etag-guide.md`: draft cross reference to the OData ETag hoja.
4. Draft ledger entry for `SL/PROGRESS.md`: odata as an external section built by `build-docs-from-odata`.
5. Whether to generalize `verify_section.py` or keep `verify_odata_block.py` separate.
6. `SL conflicts` found by reviewers and doubtful `In Service Layer:` mappings.
7. Publishing into `sbo-skills/` is not done.

Append further items as they arise; do not renumber.
