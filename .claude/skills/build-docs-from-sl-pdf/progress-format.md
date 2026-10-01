# Ledger formats: `PROGRESS.md` and `REVIEW.md`

Both live in `DOCS/`, in English, and are parsed by `verify_section.py`: keep the table headers exactly as shown.

## `PROGRESS.md`

```markdown
# Docs build ledger: docs-service-layer

PDF: sources/service-layer/service-layer-docs-1.29.pdf · Skill: /build-docs-from-sl-pdf · Extracted: 2026-10-01

## RESUME HERE

**Done last session:** apartado `etag` integrated and verified (4 hojas).
**Next:** plan apartado `configuring` (#5): dispatch the planner.
**Waiting on the user:** REVIEW.md rows p161-01, l161-01, l161-02 are `pending`.
**Open decisions:** none.
**Suggested skills:** /build-docs-from-sl-pdf

## Apartados

| # | apartado | chapters | pages | status |
|---|---|---|---|---|
| 1 | introduction-getting-started | 1, 2 | 11-14 | done |
| 2 | consuming-service-layer | 3 | 15-139 | approved |

## Plan: consuming-service-layer

Approved: 2026-10-02

### Hojas

| hoja | title | sec | pages | unit |
|---|---|---|---|---|
| consuming-service-layer/login-logout-session.md | Login, logout and sessions | 3, 3.1 | 15-17 | u1 |
| consuming-service-layer/query-options/aggregation.md | Aggregation | 3.6.7 | 35-40 | u3 |

### Unidades de trabajo

| unit | pages | sec | hojas | status | notes |
|---|---|---|---|---|---|
| u1 | 15-23 | 3, 3.1, 3.2, 3.3 | login-logout-session.md, metadata-document.md | reviewed | |

### Disambiguation candidates

- SQL View Exposure (3.8) vs SQL Query (ch. 4): both "run SQL through Service Layer".

## Decisions

- 2026-10-01 user: apartado list confirmed as in profile.md.
- 2026-10-02 user: 3.3 Service Document merged into the metadata-document hoja.

## Notes

- p19: the PDF itself is missing a word ("provided for the ."); transcribed as printed.
```

**Statuses.** Apartado: `pending` → `planned` (awaiting the user) → `approved` → `transcribing` → `reviewing` → `done`, or `needs-split`. Unit: `pending` → `transcribed` → `reviewed`, or `needs-fix` (reviewer found discrepancies) or `needs-split`.

**Apartados table.** `pages` is a range or a comma list of ranges (`15-51, 60-62`); it is what `verify_section.py` checks coverage against. Splitting an apartado means new rows with their own ranges.

**Plan sections** accumulate, one per apartado, newest last. Hoja paths are relative to `DOCS/reference/`. Every outline section of the apartado appears in exactly one hoja's `sec`; every hoja belongs to exactly one unit.

**RESUME HERE** is a handoff for an agent that has nothing but the repo. Rewrite it whole at the end of every session, and whenever you stop mid-step:

- **Done last session**: what changed, with apartado and unit names.
- **Next**: the exact next action, e.g. "dispatch reviewers for u3 and u4".
- **Waiting on the user**: plan approvals, open planner questions, `pending` review rows.
- **Open decisions**: anything undecided that blocks or shapes the next step.
- **Suggested skills**: the skills the next session should invoke.

Everything else stays in the sections above, without repetition.

**Decisions** is append-only: dated, with who decided. **Notes**: source defects, extraction quirks, script changes.

## `REVIEW.md` (cola de revisión)

```markdown
# Review queue

Status: `pending` (undecided) · `keep` · `described` (description added to the hoja) · `removed` (reference removed from the hoja). Only the user's decisions change a status.

| id | kind | page | hoja | target | status | note |
|---|---|---|---|---|---|---|
| p057-04 | image | 57 | consuming-service-layer/semantic-layer.md | 1024x768 | pending | |
| p057-01 | image | 57 | consuming-service-layer/semantic-layer.md | 16x10, inline | pending | |
| l101-01 | link | 101 | consuming-service-layer/attachments.md | https://technet.microsoft.com/en-us/library/cc939973.aspx | pending | |
```

One row per image (`id` from `WORK/elements.json`) and per external link (`id` from `WORK/links.json`). `target` is the image size from `elements.json`, plus `inline` when it is inline, or the link's `url`. `note` holds the user's instruction, e.g. "login flow diagram".
