---
name: build-docs-from-odata
description: Factory build skill. Builds the external section reference/odata/ of docs-service-layer from public OData sources (OASIS OData 4.01 and Microsoft Learn), one bloque per session. Run /build-docs-from-odata in a fresh session to start or continue.
disable-model-invocation: true
---

# Build docs from OData sources

You are the **supervisor**: you plan, delegate, integrate and keep the ledger. Subagents transcribe and review; hoja content is always theirs.

The **ledger** is `DOCS/PROGRESS.md`. The repo is the only memory between sessions, so every plan, decision and status change goes into the ledger as it happens.

First read [profile.md](profile.md): it defines `PINS`, `WORK`, `DOCS`, `SL`, the sources, the bloque list, the expected extraction counts and the traps of the sources. Terms (sección externa, bloque, fragmento, hoja, unidad de trabajo) are those of `CONTEXT.md`. Talk to the user in their language; everything written under `DOCS` is English.

## Start

Read `DOCS/PROGRESS.md`.

- Missing: do **First run**.
- Present: read its `RESUME HERE` block and `## Decisions`, then continue the **Bloque loop** where it says. Questions answered there stay answered.

`WORK` is git-ignored. If `WORK/outline.json` is missing, rerun First run step 1 before anything else; extraction is deterministic for the same pins and cache, so every id stays the same.

## First run

1. **Extract.** Run `python factory/scripts/extract_odata.py` (defaults match profile.md) and read `WORK/warnings.md` in full. Done when the printed counts equal profile.md's expected counts (on the very first extraction, you fill that table) and every warning is either known or written to the ledger's Notes in step 3.
2. **Confirm bloques.** Show the user profile.md's bloque table and offer renames, merges and splits. Done when the user explicitly confirms a list.
3. **Open the ledger.** Write `DOCS/PROGRESS.md` and `DOCS/PENDING-REVIEW.md` ([progress-format.md](progress-format.md)) with every confirmed bloque `pending`. Done when both exist and the Bloques table is exactly what the user confirmed.

Then ask whether to start the first bloque now or in a new session.

## Bloque loop

One bloque per invocation: the first one not `done` or `dropped`, unless the user names another. Record each step's result in the ledger before starting the next.

1. **Plan.** Dispatch a planner ([agents/planner.md](agents/planner.md)). Write its plan into the ledger, then show the user the fragment decisions, hojas, unidades de trabajo and questions; revise until approved. Done when the ledger says `approved` with the date and who approved (bloque status `planned` while waiting, then `approved`). Transcription starts only after this. If every fragment is `exclude`, mark the bloque `dropped` with the reason and stop here.
2. **Transcribe.** Set the bloque to `transcribing`. Dispatch one transcriber per unidad de trabajo ([agents/transcriber.md](agents/transcriber.md)), at most 4 in parallel. Done when every unit is `transcribed` and each transcriber's source defects and unsure items are in the ledger's Notes.
3. **Review.** Set the bloque to `reviewing`. Dispatch a reviewer per unit ([agents/reviewer.md](agents/reviewer.md)). On discrepancies, dispatch a new transcriber with the reviewer's list as a fix job, then a new review. Done when every unit's latest review reports zero discrepancies. Record `Source conflicts` and `SL conflicts` in the ledger's Notes and in `DOCS/PENDING-REVIEW.md`.
4. **Integrate.** Write `DOCS/reference/odata/<bloque>/index.md` following [routing-format.md](routing-format.md), then run `python factory/scripts/verify_odata_block.py <bloque>`. Done when it exits 0; then mark the bloque `done`.
5. **Close.** Rewrite `RESUME HERE` ([progress-format.md](progress-format.md)). Tell the user what was finished and that `/build-docs-from-odata` in a new session continues. After the last bloque, write the root `DOCS/reference/odata/index.md` (attribution block, [routing-format.md](routing-format.md)) and run `verify_odata_block.py --all`.

**Too big.** When a unit or hoja proves too large mid-step, mark it `needs-split` in the ledger, split it into smaller tracked items, and leave them for the next session.

The build is complete when every bloque is `done` or `dropped` and the root index exists.

## Autonomous / parallel mode

For a full build the user may delegate approvals. The rules are in [progress-format.md](progress-format.md) (approval wording, `progress-parts`). Everything else in this skill applies unchanged.

## Dispatching

Use the Agent tool (general-purpose). The prompt is one line naming the role file, `Read .claude/skills/build-docs-from-odata/agents/<role>.md and follow it.`, followed by the job block that file defines. Paths in the block are repo-root relative (`WORK`, `DOCS`, `SL` resolved from profile.md). That block is the agent's whole world: no chat history, no other units. A reviewer is always a fresh agent, never the one that transcribed the unit.

## Boundaries

- Write under `DOCS` only (and `profile.md`'s counts table). `SL` is read-only. `WORK` is regenerated by the script, never edited by hand: when extraction is wrong, fix `extract_odata.py`, rerun it and note the change in the ledger.
- Everything this build would change under `SL` (moving `DOCS/reference/odata/` into `SL/reference/odata/`, root `SKILL.md` rows and description, etag cross references, the service-layer ledger entry) is written as an item in `DOCS/PENDING-REVIEW.md` and done only when the user confirms.
- Publishing to `sbo-skills/` is a separate manual step, done only when the user asks and confirms. Never edit `sbo-skills/plugins/*/dist/`.
