---
name: build-docs-from-sl-pdf
description: Factory build skill. Turns the Service Layer 1.29 PDF into the docs-service-layer documentation (router SKILL.md + reference/ hojas), one apartado per session. Run /build-docs-from-sl-pdf in a fresh session to start or continue.
disable-model-invocation: true
---

# Build docs from the Service Layer PDF

You are the **supervisor**: you plan, delegate, integrate and keep the ledger. Subagents transcribe and review; hoja content is always theirs.

The **ledger** is `DOCS/PROGRESS.md`. The repo is the only memory between sessions, so every plan, decision and status change goes into the ledger as it happens.

First read [profile.md](profile.md): it defines `PDF`, `WORK` and `DOCS`, the apartado list, the expected extraction counts and the PDF's traps. Terms (apartado, hoja, unidad de trabajo, cola de revisión) are those of `CONTEXT.md`. Talk to the user in their language; everything written under `DOCS` is English.

## Start

Read `DOCS/PROGRESS.md`.

- Missing: do **First run**.
- Present: read its `RESUME HERE` block and `## Decisions`, then continue the **Apartado loop** where it says. Questions answered there stay answered.

`WORK` is git-ignored. If `WORK/outline.json` is missing, rerun First run step 1 before anything else; extraction is deterministic, so every id stays the same.

## First run

1. **Extract.** Run `python factory/scripts/extract_pdf.py PDF WORK` and read `WORK/warnings.md` in full. Done when the printed counts equal profile.md's and every warning is either listed there as known or written to the ledger's Notes in step 3.
2. **Confirm apartados.** Show the user profile.md's apartado table and offer renames, merges and splits. Done when the user explicitly confirms a list.
3. **Open the ledger.** Write `DOCS/PROGRESS.md` and `DOCS/REVIEW.md` ([progress-format.md](progress-format.md)) with every confirmed apartado `pending`, and the `DOCS/SKILL.md` skeleton ([routing-format.md](routing-format.md)). Done when the three files exist and the Apartados table is exactly what the user confirmed.

Then ask whether to start the first apartado now or in a new session.

## Apartado loop

One apartado per invocation: the first one not `done`, unless the user names another. Record each step's result in the ledger before starting the next.

1. **Plan.** Dispatch a planner ([agents/planner.md](agents/planner.md)). Write its plan into the ledger, then show the user the hojas, the unidades de trabajo and the planner's questions; revise until approved. Done when the user has approved and the ledger says `approved` with the date. Transcription starts only after this.
2. **Transcribe.** Dispatch one transcriber per unidad de trabajo ([agents/transcriber.md](agents/transcriber.md)), at most 4 in parallel. Done when every unit is `transcribed` and each transcriber's reported source defects are in the ledger's Notes.
3. **Review.** Dispatch a reviewer per unit ([agents/reviewer.md](agents/reviewer.md)). On discrepancies, dispatch a new transcriber with the reviewer's list as a fix job, then a new review. Done when every unit's latest review reports zero discrepancies.
4. **Integrate.** Following [routing-format.md](routing-format.md):
   - write `reference/<apartado>/index.md` and any subfolder `index.md`;
   - add the apartado's intent and disambiguation rows to `DOCS/SKILL.md`;
   - resolve every `TODO(link: …)` in any apartado whose target now exists;
   - copy the apartado's images from `WORK/assets/` to `DOCS/assets/`;
   - append the apartado's images and external links to `REVIEW.md` as `pending`.

   Then run `python factory/scripts/verify_section.py <apartado>`. Done when it exits 0; then mark the apartado `done`.
5. **Close.** Rewrite `RESUME HERE` ([progress-format.md](progress-format.md)). Tell the user what was finished and that `/build-docs-from-sl-pdf` in a new session continues.

**Too big.** When a unit or hoja proves too large mid-step, mark it `needs-split` in the ledger, split it into smaller tracked items, and leave them for the next session.

The build is complete when every apartado is `done`: every non-discarded page then sits inside a verified hoja.

## Dispatching

Use the Agent tool (general-purpose). The prompt is one line naming the role file, `Read .claude/skills/build-docs-from-sl-pdf/agents/<role>.md and follow it.`, followed by the job block that file defines. That block is the agent's whole world: no chat history, no other units. A reviewer is always a fresh agent, never the one that transcribed the unit.

## Review queue

At any time the user may settle rows of the cola de revisión, e.g. "p052-01 is the login flow diagram, describe it so". Do it directly: edit the hoja (description in English, or remove the image reference and delete `DOCS/assets/<id>.png`), set the row's status (`keep`, `described`, `removed`), rerun `verify_section.py` for that apartado. Whether an image or link is useful is the user's call; rows stay `pending` until they decide.

## Boundaries

- Write under `DOCS` only. `WORK` is regenerated by the script, never edited by hand: when extraction is wrong, fix `extract_pdf.py`, rerun it and note the change in the ledger.
- Publishing to `sbo-skills/plugins/docs-service-layer/` is a separate manual step, done only when the user asks and confirms. Until then `sbo-skills/` stays untouched.
