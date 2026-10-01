# Prompt: create the `build-docs-from-sl-pdf` skill

You are creating a **build skill** (`.claude/skills/build-docs-from-sl-pdf/`) for the SAP B1 Tools *factory* repo. Use the `skill-creator` and `writing-for-agents` skills while doing so. Read `AGENTS.md`, `CONTEXT.md` and `docs/adr/` (especially 0004, 0005, 0006) first and use the terms of `CONTEXT.md`: **apartado**, **hoja**, **unidad de trabajo**, **cola de revisión**.

Repo rules that apply: build skills are factory-only (not in `skills-lock.json`, never published). Never edit `sbo-skills/plugins/*/dist/`. All documentation content that ships is **English**, whatever language the user speaks. Repo docs (CONTEXT.md, ADRs) are Spanish.

## 1. Goal

The skill converts one large technical PDF into a navigable documentation skill (a `SKILL.md` router plus a `reference/` tree) that a consumer LLM can query precisely without loading everything. It works **incrementally over many sessions**: each invocation completes one apartado, and any fresh LLM can resume from the repo state alone.

Target PDF (already in the repo): `sources/service-layer/service-layer-docs-1.29.pdf` — SAP Business One Service Layer, version 1.29, 250 pages, English, selectable text, 257 PDF bookmarks (reliable outline), ~290 links (263 internal, 27 external URLs), 73 images, code snippets (Courier font), tables, diagrams. It opens without a password (PyMuPDF). Write the skill specifically for this PDF; keep PDF-specific facts in a separate `profile.md` so two future satellite skills (Service Layer Administrator PDF; version-compatibility marks) can reuse scripts and flow. Do not build the satellites now.

Output location: work in `factory/docs-src/service-layer/` (`SKILL.md`, `reference/`, `assets/`, `PROGRESS.md`, `REVIEW.md`). Publishing to `sbo-skills/plugins/docs-service-layer/` is a separate, manual step the user must confirm. Do not touch the submodule otherwise.

## 2. Deliverables (what you create)

1. `.claude/skills/build-docs-from-sl-pdf/SKILL.md` — the orchestrator (the **supervisor** playbook). Short; steps with clear completion criteria; detail pushed to sibling files via sharp pointers.
2. Sibling reference files in that skill folder, each reached by a pointer from SKILL.md:
   - `profile.md` — facts about this PDF (above), apartado list, known traps.
   - `agents/planner.md`, `agents/transcriber.md`, `agents/reviewer.md` — the prompts for each subagent role.
   - `leaf-format.md` — format of a hoja (section 6).
   - `progress-format.md` — format of `PROGRESS.md` and `REVIEW.md`.
3. Scripts in `factory/scripts/` (Python 3, PyMuPDF; `import pymupdf`):
   - `extract_pdf.py` — deterministic pre-extraction (section 4).
   - `verify_section.py` — coverage and fidelity checks (section 8).
4. A short note in the skill's SKILL.md on how to run it (`/build-docs-from-sl-pdf` in a fresh session continues the work).

Test the scripts against the real PDF before finishing. Do not transcribe any apartado as part of this task.

## 3. Apartados (fixed starting list, confirmed with the user)

Derived from the PDF outline; "Content", "Document History" and legal pages (pp. 2-10, 249-250) are discarded.

| # | Apartado | PDF chapters | Pages |
|---|---|---|---|
| 1 | `introduction-getting-started` | 1, 2 | 11-14 |
| 2 | `consuming-service-layer` | 3 | 15-139 (3.1 … 3.21) |
| 3 | `sql-query` | 4 | 140-160 |
| 4 | `etag` | 5 | 161-166 |
| 5 | `configuring` | 6 | 167-178 |
| 6 | `webhooks` | 7 | 179-224 |
| 7 | `limitations` | 8 | 225 |
| 8 | `high-availability-load-balancing` | 9 | 226 |
| 9 | `faq` | 10 | 227-228 |
| 10 | `appendix-di-api-comparison` | Appendix I, II | 229-248 |

The skill must still present this list to the user at the first run and let them rename, merge or split before starting. Record the confirmed list in `PROGRESS.md`.

## 4. Extraction script (`extract_pdf.py`)

Run once; output goes to a git-ignored working directory (e.g. `factory/.work/service-layer/`). It must be re-runnable and idempotent. Per page it produces:
- structured text in reading order, keeping heading levels from the bookmarks;
- code blocks, detected by monospace font (`Courier`), preserving line breaks and indentation;
- tables as Markdown (fall back to row-wise lists if too wide or irregular);
- images saved as `assets/p<page, 3 digits>-<n, 2 digits>.png` (e.g. `p067-01.png`), all in one flat folder;
- `links.json`: every link with kind (internal / external), source page, anchor text, and target (page for internal, URL for external);
- `outline.json`: the bookmark tree with start page and computed end page for every node.

It must flag, never silently drop, anything it cannot classify (page-level warnings file). Use the bookmark outline as the structural truth; PDF page numbers are the ones PyMuPDF reports.

## 5. Workflow (supervisor playbook in SKILL.md)

**On every invocation, first read `PROGRESS.md`.** If it exists, resume at its `RESUME HERE` block and do not repeat the initial questions. If it does not, run the first-run steps.

First run:
1. Run `extract_pdf.py`. Done when `outline.json`, `links.json`, and per-page files exist and the warnings file has been read.
2. Present the apartado list (section 3) to the user, in the user's language, and settle renames/merges/splits. Done when the user has confirmed.
3. Create `PROGRESS.md` and `REVIEW.md` (formats in `progress-format.md`), with every apartado `pending`.

Per invocation (exactly one apartado, the first `pending`/`in-progress` unless the user picks another):
1. **Plan.** Dispatch the **planner** subagent on the apartado. The planning itself is the first task of the apartado. The planner decides, by *content and context* and not by page-count thresholds:
   - which subsections become hojas, which become subfolders (with their own `index.md`), which tiny ones should merge;
   - the **unidades de trabajo**: contiguous page runs that never cut a topic in half, sized so a transcriber can work with a small, fresh context. Hard ceiling of about 15 pages per unit; exceeding it requires a written justification;
   - candidate entries for the root disambiguation table (confusable terms, e.g. *SQL View Exposure* (3.8, in apartado 2) versus *SQL Query* (chapter 4, apartado 3));
   - questions for the user about borderline cases (a section too small to deserve its own hoja: propose what to merge it with, and ask).
   Done when the plan is written into `PROGRESS.md` and **the user has approved it**. Do not transcribe before approval.
2. **Transcribe.** Dispatch one **transcriber** subagent per unidad de trabajo, at most 3-4 in parallel. Each gets only: its page range, the extracted files for those pages, `leaf-format.md`, and the planned output path. No chat history, no other units.
3. **Review.** Dispatch a **reviewer** subagent (never the one that transcribed) per unit. It compares output against the extracted source and PDF pages. Done when it reports no discrepancies in code blocks, tables, values, or omitted paragraphs, or the transcriber has fixed the listed ones.
4. **Integrate.** The supervisor writes the apartado's `index.md` (section 7), resolves `TODO(link: …)` markers whose targets now exist, adds routing rows to the root `SKILL.md`, appends new images/external links to `REVIEW.md`, and runs `verify_section.py`. Mark the apartado `done` only when the script passes and the reviewer signed off.
5. **Close.** Rewrite the `RESUME HERE` block of `PROGRESS.md` in handoff style (see the repo's `handoff` skill for the idea, but the content lives in the repo file, not in the OS temp directory): what was done, what is next, open decisions awaiting the user, suggested skills. Tell the user how to continue: run `/build-docs-from-sl-pdf` in a new session.

If a section proves too big while working, mark it `needs-split` in `PROGRESS.md`, subdivide it into smaller tracked items and let the next session continue them. The work is complete only when every non-discarded page of the PDF is covered by a `done` hoja.

The supervisor is the main session. It plans, delegates and integrates; it does not transcribe.

## 6. Hoja format (`leaf-format.md`)

- Frontmatter: `title`, `source` (e.g. `pdf pp. 67-73, sec 3.8`), `summary` (1-2 lines). **Do not** add any B1-version availability field yet (a later satellite skill handles it).
- Body is English, faithful to the PDF. Reorganize only for readability; never invent content or "fix" the source.
- Code: fenced blocks with language (`http`, `json`, `sql`, `xml`, `javascript`), copied **verbatim**.
- Tables: Markdown; if too wide, a list per row.
- Images: `![p067-01](../assets/p067-01.png)` preceded by a one-line context ("Figure: …"). Image id = file name. Every image goes in `assets/`; no classification by the agent. A human reviews them via `REVIEW.md`.
- Internal links: relative link to the target hoja; if it does not exist yet, write `TODO(link: sec 3.9)` for the supervisor to resolve.
- External links: keep the URL visible as plain text; never fetch it; register it in `REVIEW.md`.
- A large hoja that cannot be split without losing context is acceptable if it opens with an anchor index (`#` anchors) of its subtopics.

## 7. Routing structure

Maximum three hops: root `SKILL.md` → `reference/<apartado>/index.md` → hoja (or a subfolder with its own `index.md` → hoja).

- Root `SKILL.md`: frontmatter `description` states what the docs cover and when to use them; body is a table *developer intent → apartado* with real example questions ("how do I paginate a GET", "how do I create a webhook"), plus a **disambiguation table** of confusable terms.
- Each `index.md`: one entry per hoja or subfolder, with a "Use when…" line, a short list of exact terms (HTTP verbs, entities, `$filter` options, function names), links to anchors for large hojas, and a "not here, see …" pointer where a neighbouring apartado is the likelier target.
- Example of the intended depth for apartado 2: `consuming-service-layer/` with `index.md`, hojas such as `login-logout-session.md`, `crud-operations.md`, `sql-view-exposure.md`, `batch-operations.md`, and subfolders where the planner decides (e.g. `query-options/`, `javascript-extension/`).

Keep root and index files short: they are always or often loaded.

## 8. `verify_section.py`

For a given apartado, check against `outline.json` and the extracted data and exit non-zero on failure:
- every page of the apartado range falls in the `source` range of some hoja (coverage map);
- number of Courier code blocks and tables per page range equals those in the hojas;
- each extracted image id is referenced exactly once, or marked `removed` in `REVIEW.md`;
- every hoja has frontmatter with `title`, `source`, `summary`;
- no `TODO(link:` left in a `done` apartado whose target exists.

## 9. Human review (`REVIEW.md`)

One table with a row per image and per external link: id, source page, hoja where it appears, status (`pending` / `keep` / `described` / `removed`). The user reviews it by hand. When the user says, for example, "image p052-01 is the login flow diagram, describe it so", the skill adds that description in the hoja (in English) or removes the reference, then updates the status. Never decide image or link usefulness itself.

## 10. Acceptance criteria

- The skill folder exists with the files in section 2 and passes the `writing-for-agents` guidance (short SKILL.md, sharp pointers, completion criteria on each step).
- `extract_pdf.py` runs on the real PDF and produces the outputs of section 4, including the 73 images and 290 links.
- `verify_section.py` runs and fails correctly on a deliberately incomplete sample.
- Invoking the skill in a fresh session with no `PROGRESS.md` runs the first-run steps; with one, it resumes without re-asking.
- No apartado is transcribed yet, and `sbo-skills/` is untouched.
