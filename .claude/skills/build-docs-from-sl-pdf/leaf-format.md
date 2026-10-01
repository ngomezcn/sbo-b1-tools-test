# Hoja format

A hoja is one Markdown file under `DOCS/reference/<apartado>/` (or a subfolder of it) that answers one kind of developer question. A consumer agent opens it after two routing hops and should not need anything else. Everything in it is English.

## Shape

```markdown
---
title: Batch Operations
source: pdf pp. 74-79, sec 3.9
summary: Sending several requests in one $batch call, change sets, and the response format.
---

# Batch Operations

Body…
```

- `title`: the topic in plain words. Usually the PDF section title.
- `source`: exactly `pdf pp. <first>-<last>, sec <n>[, <n>…]`, e.g. `pdf pp. 31-33, sec 3.6.1, 3.6.2` or `pdf pp. 225-225, sec 8.1`. List every outline section the hoja covers. A listed section covers its subsections. The pages are those of the listed sections.
- `summary`: one or two lines saying what the hoja answers.
- No version-availability field; a later satellite adds those marks.

## Body

- **Faithful.** Every sentence, value, code block, table row and figure of the covered sections appears, in the PDF's order unless a reorder clearly reads better. Content is never invented, summarised away or corrected. A sentence that looks wrong in the PDF stays as printed.
- **Headings.** `#` is the hoja title. PDF sections and the `**bold**` pseudo-headings of the extraction become `##`/`###`, titled as in the PDF without the section number.
- **Large hoja.** A hoja that cannot be split without losing context is fine; it opens, right after the `#` title, with an anchor index: a list of `[Subtopic](#anchor)` links to its `##` headings.
- **Callouts** stay blockquotes with their bold label: `> **Note**`, `> **Example**`, `> **Sample Code**`.

## Converting the extraction markup

`WORK/pages/pNNN.md` uses this markup. Convert it as follows:

| Extraction | In the hoja |
|---|---|
| `<!-- page N \| starts: … -->` | drop |
| `<!-- code: cNNN-MM -->` + fenced block | the fenced block alone, with a language tag |
| `<!-- code: X continues Y -->` + block | append its lines to block Y: one fenced block, no break |
| `<!-- table: tNNN-MM -->` + table | keep the marker line exactly, directly above the table |
| `<!-- table: X continues Y -->` + table | drop the marker and the repeated header; append the rows to table Y |
| `[text](sec:3.9)` | `text TODO(link: sec 3.9)` |
| `[text](https://…)` | `text (https://…)`, or the bare URL when the text is the URL |
| `![pNNN-MM](pNNN-MM.png)` | `![pNNN-MM](<up>/assets/pNNN-MM.png)` |

Table markers exist because tables get reshaped; code needs none because `verify_section.py` matches its text.

## Code

- One fenced block per extracted block, with a language: `http`, `json`, `sql`, `xml`, `javascript`, or `text` when none fits (formulas, bare URLs, paths).
- Copied **verbatim**: characters, line breaks, indentation and the PDF's visual wraps. Fix only extraction artefacts that the page render proves wrong.
- The extraction's Courier values inside table cells stay inline code in the table.

## Tables

- A Markdown table when every cell is a single short line.
- Otherwise a list per row: the first column as the item, the other columns as `**Header**: value` sub-items, with lists, notes and code nested under them. The extraction already chose one of these forms; keep it unless the render shows a better fit.
- Every row and every cell of the PDF table is present.

## Images

- Image id = file name: `p067-01` is `assets/p067-01.png`. Every reference is a relative path to `DOCS/assets/`: `../../assets/` from a hoja in an apartado folder, `../../../assets/` from a subfolder.
- A block image is preceded by one context line taken from the surrounding text, e.g. `Figure: The General Authorizations window.` Its content is described only when the user asks, via the cola de revisión.
- An inline image (breadcrumb or external-link icon) stays inline at its position, with no Figure line.
- Keep every image marker of the page: the extraction emits one per placement, and `verify_section.py` counts them.

## Links

- **Internal**: always `TODO(link: sec <n>)` after the link text. The supervisor replaces it with a relative link once the target hoja exists.
- **External**: the URL stays visible as plain text. It is never fetched. The supervisor registers it in `REVIEW.md`.
