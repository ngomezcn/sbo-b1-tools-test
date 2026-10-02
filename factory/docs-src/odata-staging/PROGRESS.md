# Docs build ledger: odata (reference/odata)

Pins: .claude/skills/build-docs-from-odata/pins.json · Skill: /build-docs-from-odata · Extracted: 2026-10-02

## RESUME HERE

**Done last session:** skill, scripts and ledger set up and checked against the real extraction (424 nodes in `factory/.work/odata`); no bloque planned yet.
**Next:** run the autonomous full build: one block supervisor per bloque writes its plan and notes to `DOCS/progress-parts/<n>-<bloque>.md` (parallel mode, delegated approvals), then the final assembler merges the parts into this file in bloque order, writes the root `reference/odata/index.md`, runs `verify_odata_block.py --all`, completes `PENDING-REVIEW.md` (items marked `TODO(assembler)`) and deletes `progress-parts/`.
**Waiting on the user:** everything in `PENDING-REVIEW.md`, after the build.
**Open decisions:** none.
**Suggested skills:** /build-docs-from-odata

## Bloques

| # | bloque | fragments | status |
|---|---|---|---|
| 1 | overview-and-data-model | ms-overview, ms-data-model, oasis-p1 2, 3, 4 | pending |
| 2 | urls-and-addressing | ms-url-components, oasis-p2 2, 3, 4 | pending |
| 3 | reading-data | ms-get-data, oasis-p1 11.2, 10, 11.5, oasis-json control information | pending |
| 4 | modifying-data | ms-create-data, ms-update-data, ms-delete-data, oasis-p1 11.3, 11.4 | pending |
| 5 | query-options | ms-queryoptions-overview, ms-queryoptions-usage, oasis-p2 5.1, 5.2, 5.3 | pending |
| 6 | headers-and-versioning | oasis-p1 5.1, 8 | pending |
| 7 | status-codes-and-errors | oasis-p1 9, oasis-json error response | pending |
| 8 | metadata-and-annotations | oasis-p1 11.1, 3.1, oasis-csdl read side | pending |
| 9 | batch-and-async | oasis-p1 11.7, 11.6 (only what SL does not explain) | pending |

## Decisions

- 2026-10-02 user (delegated to the supervisor): bloque list and order as in the Bloques table (profile.md starting list).
- 2026-10-02 user (delegated): source precedence per hoja: Microsoft Learn is the base when it has a page on the topic, OASIS when the topic is normative; OASIS wins on conflict.
- 2026-10-02 user (delegated): relevance rule: a fragment is included only if SL has a gap on it (gate A) or it answers a concrete developer question (gate B); implementing-a-service topics, unsupported SL features and well-explained SL topics are excluded.
- 2026-10-02 user (delegated): hoja modes `copy` (tables, headers, status codes) and `condense` (long narrative), recorded only in the ledger.
- 2026-10-02 user: attribution only in `reference/odata/index.md`; hojas carry no copyright line.
- 2026-10-02 user (delegated): sources extended with OData JSON Format 4.01 and CSDL XML 4.01 (OASIS os) besides Part 1/2 and Microsoft Learn.
- 2026-10-02 user (delegated): DOCS is the staging folder `factory/docs-src/odata-staging` until the user reviews; nothing is written under `factory/docs-src/service-layer/`; every change that would touch it is an item in `PENDING-REVIEW.md`.
- 2026-10-02 supervisor: plans are approved by the supervisor as `Approved: 2026-10-02 (supervisor, delegated by the user)`.

## Notes

- Extraction counts and traps are in `.claude/skills/build-docs-from-odata/profile.md`.
