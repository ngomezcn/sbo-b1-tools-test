# Profile: Working with SAP Business One Service Layer 1.29

Everything specific to this PDF lives here. The rest of the skill (flow, role files, formats, scripts) is PDF-agnostic, so a satellite skill reuses it and swaps this file.

## Paths

| Name | Path |
|---|---|
| `PDF` | `sources/service-layer/service-layer-docs-1.29.pdf` |
| `WORK` | `factory/.work/service-layer` (extraction output, git-ignored) |
| `DOCS` | `factory/docs-src/service-layer` (the docs being built, committed) |
| Publish target | `sbo-skills/plugins/docs-service-layer/skills/docs-service-layer/` (manual step, user-confirmed) |

## Facts

- SAP Business One Service Layer guide, document version 1.29 (2026-07-27), English, 250 pages, selectable text. Antenna House formatter.
- RC4-encrypted with an empty user password: PyMuPDF opens it directly.
- Reliable outline: 257 bookmarks; level 1 is the document title, level 2 the chapters. Page numbers are PyMuPDF's 1-based pages, which equal the printed footer numbers.
- Discarded: pp. 1-10 (cover, Content, Document History) and pp. 249-250 (disclaimers, legal notice).

Expected `extract_pdf.py` counts (any difference means the PDF or the script changed):

| pages | outline nodes | images | image placements | links | internal | external | code blocks (parts) | tables (parts) |
|---|---|---|---|---|---|---|---|---|
| 250 | 257 | 73 | 87 | 291 | 263 | 28 | 597 (650) | 94 (108) |

External links are the 27 URI links plus one GoToR link (`www.sap.com/contactsap`, p250). Known warnings (13): the cover (p1) and legal page (p250) carry xref-less logo images and vector art that are not extracted, and the p250 bookmark has no heading line. They are all on discarded pages.

## Apartados

Starting list, agreed when this skill was written. First run re-confirms it with the user, and from then on the ledger's Apartados table supersedes it.

| # | apartado | chapters | pages |
|---|---|---|---|
| 1 | `introduction-getting-started` | 1, 2 | 11-14 |
| 2 | `consuming-service-layer` | 3 (3.1-3.21) | 15-139 |
| 3 | `sql-query` | 4 | 140-160 |
| 4 | `etag` | 5 | 161-166 |
| 5 | `configuring` | 6 | 167-178 |
| 6 | `webhooks` | 7 | 179-224 |
| 7 | `limitations` | 8 | 225 |
| 8 | `high-availability-load-balancing` | 9 | 226 |
| 9 | `faq` | 10 | 227-228 |
| 10 | `appendix-di-api-comparison` | 11 (Appendix I), 12 (Appendix II) | 229-248 |

Every chapter starts on a new page, so apartados never share a page. Inside an apartado, sections often share a page; the section list (`sec`) of a hoja or unit is what decides the cut.

## Confusable terms

Seeds for the root disambiguation table:

- *Semantic Layer View Exposure* (3.7) vs *SQL View Exposure* (3.8), both in `consuming-service-layer`, vs *SQL Query* (chapter 4, `sql-query`).
- *CRUD Operations* (3.4, OData entities) vs *CRUD Operations* (4.2, SQLQuery entity) vs *CRUD APIs* (11.1, Service Layer vs DI API comparison).
- *Metadata Document* (3.2) vs *Business Object Metadata* (4.1) vs *Metadata Naming Difference* (Appendix II, 12) vs *ETag Metadata* (5.4).
- *FAQ* (chapter 10) vs webhooks *FAQ* (7.8).
- *Limitations* (chapter 8) vs *SQL Query Limitations or By Design* (4.13).
- *Query Options* (3.6, OData `$filter` etc.) vs *Query APIs* (11.4) vs *List with Paging* (4.4) vs *Paginate the Selected Orders* (3.6.6).
- *Configuring* (chapter 6, server settings) vs *Webhook Configuration* (7.5) vs *Configuration by Request* (6.3).
- *Login and Logout* / *Session* (3.1) vs *High Availability and Load Balancing* (9, sticky sessions).

## Traps

What the extraction cannot settle on its own; transcribers and reviewers check these against `WORK/render/pNNN.png`.

- **Code** is Courier. Boxed code (gray fill) and standalone Courier paragraphs are code blocks. Courier inside a table cell is an inline value (`$filter`, a sample URL), never a code block.
- **Visual wraps.** The PDF wraps long code lines (p57: `... for` / `the current user 'user1'"`). Code is copied as extracted, wraps included.
- **Cell wraps.** Courier in narrow table cells wraps mid-token, and extraction joins wrapped cell lines with a space (p187: `"token_endpoin t"`). Remove a space the render shows was a wrap.
- **Hyphenation.** Extraction rejoins `opera-` / `tors` into `operators`. A compound word broken at its own hyphen then loses it; check the render when a joined word looks odd.
- **Breadcrumb icons.** UI paths such as *Main Menu ▸ Administration ▸ System Initialization* use tiny images (7-16 px) between the words. They are real images with their own ids (one file per page and image, repeated placements counted), kept inline at their position.
- **External-link icon.** A small arrow image follows most external URLs; it is an inline image like the breadcrumb icons.
- **Disclaimer redirects.** The PDF wraps outbound URLs in `help.sap.com/disclaimer?site=…`. `links.json` gives the real `url` (the redirect stays in `raw_url`); the hoja shows the real URL.
- **Callouts** are labelled Note, Recommendation, Example, Sample Code or Output Code, and may contain code and lists.
- **Tables** are drawn with horizontal rules only. A table cut by a page break repeats its header on the next page; extraction marks that part `continues <id>`.
- **Unbookmarked sub-headings** (bold 10-12 pt: the function names in 7.7.8-7.7.13, *Usage*, *Parameters*, *Examples*, *Purpose*) come out as `**text**` lines.
- **Version statements** ("As of SAP Business One 10.0 FP 2305 …") are content: keep them verbatim. Version availability marks are a later satellite's job.
- **Source defects** exist: p19 reads "mainly provided for the . The response" with a word missing in the PDF itself. Transcribe as printed and report it.
