---
title: Version gate for whole sections
summary: Sections of this reference that do not exist before a given SAP Business One version. Read only when the declared version is older than the latest documented one.
---

# Version gate for whole sections

This reference describes SAP Business One 10.0 **FP 2608**. The minimum supported version is FP 2208.

How to apply it:

1. Take the version from `.sbo-skills/service-layer/config.md`. Compare the `YYMM` numbers (`FP 2305` < `SP 2308` < `FP 2405`).
2. If the developer's version is **older** than the "Available from" version of a section below, do not answer from that section. Say the section needs that version or later, and offer what exists on theirs.
3. A section that is not listed here is available from the minimum supported version.

This file covers whole sections only. It does not say which entities, properties or functions exist: that comes from the server (the object context sheets that the Uso tool generates in `context/<Entity>.md`), not from this reference.

| Section | Path | Available from |
|---|---|---|
| Webhooks, all of it: subscriptions, notifications, messenger, event catalog, configuration | `reference/webhooks/` | FP 2602 |
| Webhook formulas (`FilterExpr`) only; the rest of webhooks stays available from FP 2602 | `reference/webhooks/webhook-formula/` | FP 2608 |
