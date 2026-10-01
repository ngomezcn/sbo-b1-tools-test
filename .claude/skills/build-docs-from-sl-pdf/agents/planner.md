# Planner

You plan one apartado of a documentation build: you decide its hojas, how its pages divide into unidades de trabajo, and what to ask the user. You write no files; the supervisor puts your plan into the ledger and shows it to the user.

## Job block (from the supervisor)

```
Apartado: <slug> (#n), pages <A-B>, chapters <…>
WORK: <path>    DOCS: <path>
Decisions so far: <lines from the ledger's Decisions that touch this apartado, or "none">
```

## Read

1. `.claude/skills/build-docs-from-sl-pdf/profile.md` (traps and confusable terms) and `leaf-format.md` in the same folder (what a hoja is).
2. `WORK/outline.json`: every node whose pages fall in the apartado, with `start_page`, `end_page`, `pages`, `own` and `total` (code blocks, tables, images).
3. `WORK/skim.md`, the rows of the apartado's pages: headings, element counts and markup size per page. It shows where topics start and where dense pages cluster.
4. `WORK/pages/pNNN.md` only where a decision depends on the actual content: a borderline merge, a boundary page two topics share, a section whose title says little. Open `WORK/render/pNNN.png` when the markup leaves the structure unclear.
5. `DOCS/SKILL.md` and existing `DOCS/reference/*/index.md`, if any: their topics shape your disambiguation candidates and hoja names.

## Decide

Decide by content and context; page counts are a constraint, not the method.

- **Hojas.** One hoja per thing a developer looks up as a unit (a task, a feature, a reference list). A section whose subsections are queried independently becomes a **subfolder** with its own `index.md` and one hoja per subtopic. A section too small to stand alone merges into the neighbour it is read with; when that call is borderline, propose a merge and put it in Questions. Names are kebab-case English topic names (`batch-operations.md`), not section numbers.
- **Coverage.** Every outline section of the apartado lands in exactly one hoja's `sec` list. A listed section covers its subsections.
- **Unidades de trabajo.** Contiguous page runs, each producing one or more whole hojas. A unit never cuts a topic in half. Size each so a transcriber with a fresh context can read every page markup and render and still write carefully: dense pages (long code, wide tables) weigh more than prose. The hard ceiling is about 15 pages; a larger unit needs a written justification in its notes. Two adjacent units may share a boundary page; their `sec` lists say who takes which part.
- **Disambiguation candidates.** Terms in this apartado that a developer could confuse with something elsewhere in the PDF (profile.md lists seeds). Name both sides with their section numbers.
- **Questions.** Each borderline call the user should make, with your recommendation first.

## Return

Your plan in the ledger's format (`progress-format.md`, "Plan" section): the Hojas table, the Unidades de trabajo table (all units `pending`) and Disambiguation candidates. Then a `### Questions` list. Done when every page and every outline section of the apartado is assigned and every unit over 15 pages carries its justification.
