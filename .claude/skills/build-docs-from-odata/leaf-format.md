# Hoja format

A hoja is one Markdown file under `DOCS/reference/odata/<bloque>/` that answers one kind of developer question about OData. A consumer agent opens it after routing and should not need anything else. Everything in it is English. Hojas contain no images and no links, except in-page anchor links.

## Shape

```markdown
---
title: Plain topic title
source: external OData: oasis-p1@v4.01-os 8.3.2, 8.3.3 + ms@3ca8f5b get-data; retrieved 2026-10-02
summary: one or two lines on what the hoja answers.
---
# Title

In Service Layer: reference/etag/etag-guide.md

Body...
```

- `title`: the topic in plain words, no section number.
- `source`, one line: `external OData: <seg> [+ <seg>...]; retrieved <YYYY-MM-DD>`. `<seg>` = `<origin>@<version> <locator>[, <locator>...]`. Origin is one of `oasis-p1`, `oasis-p2`, `oasis-json`, `oasis-csdl`, `ms`; version is the pin's (`v4.01-os`, or the 7-char commit for `ms`); locators are section numbers for OASIS (`8.3.2`) and a file stem or `file--heading-slug` for `ms`. Fragment id = `<origin>-<locator>`. A listed fragment covers its descendants. `retrieved` is the date in `PINS`.
- `summary`: one or two lines saying what the hoja answers.
- `In Service Layer:` is mandatory, on its own line right after the `#` title. Value: one or more paths of SL hojas separated by `;`, written from the SL root (`reference/etag/etag-guide.md`), or `no equivalent hoja`. Plain text, never a link; each file must exist under `SL`. To choose it, open the candidate SL hoja and the SL index of its apartado. When an SL hoja explicitly says something different from OData, append ` ; SL differs: <what, in one clause>` (SL wins). When you only suspect a difference, do not write it: report it as an unsure item.

## Body

- Headings `##`/`###` without section numbers; callouts as `> **Note**`.
- Code in fenced blocks with a language tag (`http`, `json`, `xml`, `abnf`, `text`), verbatim from the cited fragments. An `Example N:` caption stays as a line before its block.
- Tables as Markdown. A table with multi-line cells becomes a list per row: first column as the item, other columns as `**Header**: value` sub-items.
- A hoja over about 150 lines opens, right after the `In Service Layer:` line, with an anchor index: a list of `[Topic](#anchor)` links to its own `##` headings. In-page anchors are the only allowed links.
- No `http(s)://` URL in prose. URLs inside code are fine, except hosts `docs.oasis-open.org`, `www.oasis-open.org`, `learn.microsoft.com`, `docs.microsoft.com` and `github.com`; example hosts such as `services.odata.org` or `localhost` are fine.

## Modes

The mode of each hoja is set by the planner and recorded only in the ledger's Hojas table.

- `copy`: the fragment text as is. Allowed transformations only: remove images and links keeping the link text, `[!NOTE]` to `> **Note**`, drop section numbers, normalize whitespace, and replace a cross reference such as "see Section 11.4.3" by the target's title ("see Update an Entity"). Guidance: tables, headers and status codes are `copy`.
- `condense`: rewritten shorter. Every claim is traceable to the cited fragments. Nothing is dropped that is a value, header, status code, MUST/SHOULD or a code example the hoja needs. No SL knowledge is imported, except in the `In Service Layer:` line. Guidance: long spec narrative is `condense`.

A citation tag such as `[OData-URL]` stays as plain text. A cross reference is always replaced by the target's title as plain text (look the number up in `WORK/outline.json`; if the target is not a node, because it is in an excluded chapter or deeper than level 3, use the title of its heading in the fragment texts or drop the pointer and keep the sentence, and report it as an unsure item), whether the target is in this hoja, another bloque or excluded; no pointer or link is added.

## Source precedence

Each hoja has one base source plus an optional second. Base is Microsoft Learn when it has a page on the topic (consumer oriented); base is OASIS when the topic is normative (status codes, header semantics, URL rules, JSON control information, CSDL). The second source adds only what the base lacks, and the planner justifies it in the ledger. If they contradict, OASIS wins and the reviewer lists it under `Source conflicts`. Never two wordings of the same thing in one paragraph.
