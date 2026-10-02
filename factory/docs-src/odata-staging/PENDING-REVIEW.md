# Pending review: changes outside the odata staging folder

Items for the user. Nothing here has been done; each item says what, why and the proposed text. Append further items; do not renumber.

## 1. Move the staging folder into Service Layer

What: move `factory/docs-src/odata-staging/reference/odata/` to `factory/docs-src/service-layer/reference/odata/` and set `DOCS` to `factory/docs-src/service-layer` in `.claude/skills/build-docs-from-odata/profile.md`.
Why: the build wrote only to staging by decision.
Status: TODO(assembler): list the bloques built and the final hoja count.

## 2. Root `service-layer/SKILL.md`

What: add rows for odata (By intent, Confusable terms) and update the `description`.
Status: TODO(assembler): draft the exact rows and the new description text from the built bloque indexes.

## 3. ETag cross reference

What: in `service-layer/reference/etag/index.md` and `etag-guide.md`, add a pointer "OData generic ETag: reference/odata/headers-and-versioning/<hoja>".
Status: TODO(assembler): draft the exact text and the hoja name from bloque 6.

## 4. Ledger entry for `service-layer/PROGRESS.md`

What: record the odata section as external, built by `build-docs-from-odata`, with the pins.
Status: TODO(assembler): draft the entry.

## 5. `verify_section.py` generalization

What: only the external hojas of OData are checked by `factory/scripts/verify_odata_block.py`; decide whether to merge it into `verify_section.py` or keep it separate.
Why: `verify_odata_block.py` imports helpers from `verify_section.py` and does not modify it.

## 6. SL conflicts and doubtful `In Service Layer:` mappings

What: places where an OData fragment differs from an SL hoja, and mappings the transcribers were unsure of.
Status: TODO(assembler): collect from the progress parts (`SL conflicts`, unsure items).

## 7. Publishing into `sbo-skills/`

Not done. Publishing the new section to the installable product is a separate manual step, only when the user asks.
