"""Tests for verify_odata_block.py. Run: python -m unittest (from factory/scripts)."""
import io
import json
import shutil
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path

import verify_odata_block as v

GOOD_HOJA = """---
title: ETag and concurrency
source: external OData: oasis-p1@v4.01-os 8.3.2, 8.3.3 + ms@3ca8f5b get-data; retrieved 2026-10-02
summary: How ETags protect updates.
---
# ETag and concurrency

In Service Layer: reference/etag/etag-guide.md; reference/etag/etag-usage.md

Send `If-Match` with the ETag. See the [Example](#example) below.

## Example

```http
PATCH /Products(1)
If-Match: W/"abc"
```

Services such as `https://services.odata.org/V4/Northwind` are fine in code.
"""

OUTLINE = {"nodes": [
    {"id": "oasis-p1-8.3", "origin": "oasis-p1", "number": "8.3", "parent": None, "children": ["oasis-p1-8.3.2", "oasis-p1-8.3.3"]},
    {"id": "oasis-p1-8.3.2", "origin": "oasis-p1", "number": "8.3.2", "parent": "oasis-p1-8.3", "children": []},
    {"id": "oasis-p1-8.3.3", "origin": "oasis-p1", "number": "8.3.3", "parent": "oasis-p1-8.3", "children": []},
    {"id": "oasis-p1-8.4", "origin": "oasis-p1", "number": "8.4", "parent": None, "children": []},
    {"id": "oasis-p1-9", "origin": "oasis-p1", "number": "9", "parent": None, "children": []},
    {"id": "oasis-p2-5.1", "origin": "oasis-p2", "number": "5.1", "parent": None, "children": []},
    {"id": "ms-get-data", "origin": "ms", "file": "get-data.md", "parent": None, "children": []},
]}

LEDGER = """# PROGRESS

## Plan: headers
Approved: 2026-10-02 (supervisor)

### Fragment decisions
| fragment | decision | where / reason |
|---|---|---|
| oasis-p1-8.3.2 | include | etag-and-concurrency |
| oasis-p1-8.3.3 | merge | etag-and-concurrency |
| ms-get-data | include | etag-and-concurrency |
| oasis-p1-9 | exclude | status codes elsewhere |

### Hojas
| hoja | title | fragments | mode | unit |
|---|---|---|---|---|

## Plan: other
### Fragment decisions
| fragment | decision | where / reason |
|---|---|---|
| oasis-p2-5.1 | include | x |

## Decisions
"""

PINS = {"retrieved": "2026-10-02",
        "ms": {"commit": "3ca8f5b9f602aaa561f5bbc2df67fc6f0911c7e6", "short": "3ca8f5b"},
        "oasis": {"version": "v4.01-os", "docs": {"oasis-p1": {}, "oasis-p2": {}, "oasis-json": {}, "oasis-csdl": {}}}}

SECTIONS = {
    "oasis-p1-8.3.2": "ETag text.\n\n```http\nPATCH /Products(1)\nIf-Match: W/\"abc\"\n```\n",
    "oasis-p1-8.3.3": "If-Match text.\n",
    "ms-get-data": "Get data.\n\n```http\nGET https://services.odata.org/V4/Northwind\n```\n",
    "oasis-p1-9": "Status.\n",
}


class Base(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.tmp, True)
        self.docs, self.work, self.sl = self.tmp / "docs", self.tmp / "work", self.tmp / "sl"
        self.ledger = self.tmp / "ledger"
        self.ledger.mkdir()
        self.pins = self.tmp / "pins.json"
        self.pins.write_text(json.dumps(PINS), encoding="utf-8")
        (self.work / "sections").mkdir(parents=True)
        (self.work / "outline.json").write_text(json.dumps(OUTLINE), encoding="utf-8")
        for k, t in SECTIONS.items():
            (self.work / "sections" / f"{k}.md").write_text(t, encoding="utf-8")
        for p in ("reference/etag/etag-guide.md", "reference/etag/etag-usage.md"):
            (self.sl / p).parent.mkdir(parents=True, exist_ok=True)
            (self.sl / p).write_text("# x\n", encoding="utf-8")
        self.base = self.docs / "reference" / "odata"
        self.bdir = self.base / "headers"
        self.bdir.mkdir(parents=True)
        (self.ledger / "PROGRESS.md").write_text(LEDGER, encoding="utf-8")
        self.hoja = self.bdir / "etag.md"
        self.hoja.write_text(GOOD_HOJA, encoding="utf-8")
        (self.bdir / "index.md").write_text("# Headers\n\n- [ETag](etag.md)\n", encoding="utf-8")
        (self.base / "index.md").write_text("# OData\n\n- headers\n", encoding="utf-8")

    def run_verify(self, *extra):
        out = io.StringIO()
        args = ["headers", "--docs", str(self.docs), "--ledger", str(self.ledger), "--work", str(self.work), "--sl", str(self.sl),
                "--pins", str(self.pins), *extra]
        with redirect_stdout(out):
            code = v.main(args)
        return code, out.getvalue()

    def mutate(self, old, new):
        t = self.hoja.read_text(encoding="utf-8")
        self.assertIn(old, t)
        self.hoja.write_text(t.replace(old, new, 1), encoding="utf-8")

    def assertFails(self, check, needle=None):
        code, out = self.run_verify()
        self.assertEqual(code, 1, out)
        self.assertIn(f"FAIL  headers: {check}", out)
        if needle:
            self.assertIn(needle, out)
        return out


class Verify(Base):
    def test_passes(self):
        code, out = self.run_verify()
        self.assertEqual(code, 0, out)

    def test_ledger_from_progress_parts(self):
        (self.ledger / "PROGRESS.md").unlink()
        parts = self.ledger / "progress-parts"
        parts.mkdir()
        (parts / "6-headers.md").write_text(LEDGER, encoding="utf-8")
        self.assertEqual(self.run_verify()[0], 0)

    def test_alternative_pins_layout(self):
        self.pins.write_text(json.dumps({"retrieved": "2026-10-02", "sources": {
            "oasis-p1": {"version": "v4.01-os"}, "ms": {"commit": "3ca8f5b9f602aaa561f5bbc2df67fc6f0911c7e6"}}}),
            encoding="utf-8")
        self.assertEqual(self.run_verify()[0], 0)

    def test_bad_source_grammar(self):
        self.mutate("external OData: oasis-p1@v4.01-os 8.3.2, 8.3.3 + ms@3ca8f5b get-data; retrieved 2026-10-02",
                    "OData oasis-p1 8.3.2")
        self.assertFails("frontmatter", "source must look like")

    def test_wrong_version(self):
        self.mutate("oasis-p1@v4.01-os", "oasis-p1@v4.02")
        self.assertFails("frontmatter", "does not match the pin")

    def test_wrong_retrieved(self):
        self.mutate("retrieved 2026-10-02", "retrieved 2026-10-03")
        self.assertFails("frontmatter", "pins say")

    def test_unknown_fragment(self):
        self.mutate("8.3.2, 8.3.3", "8.3.2, 8.3.3, 8.9.9")
        self.assertFails("fragments", "oasis-p1-8.9.9")

    def test_uncovered_include_fragment(self):
        self.mutate("8.3.2, 8.3.3", "8.3.2")
        self.assertFails("coverage", "oasis-p1-8.3.3")

    def test_ancestor_covers_children(self):
        self.mutate("8.3.2, 8.3.3", "8.3")
        code, out = self.run_verify()
        self.assertNotIn("FAIL  headers: coverage", out)

    def test_hoja_cites_excluded_fragment(self):
        self.mutate("8.3.2, 8.3.3", "8.3.2, 8.3.3, 9")
        self.assertFails("coverage", "decided exclude")

    def test_hoja_cites_fragment_without_decision(self):
        self.mutate("8.3.2, 8.3.3", "8.3.2, 8.3.3, 8.4")
        self.assertFails("coverage", "no include/merge decision")

    def test_hoja_cites_other_bloque_fragment(self):
        self.mutate("get-data", "get-data + oasis-p2@v4.01-os 5.1")
        self.assertFails("coverage", "belongs to bloque other")

    def test_missing_in_service_layer_line(self):
        self.mutate("In Service Layer: reference/etag/etag-guide.md; reference/etag/etag-usage.md\n\n", "")
        self.assertFails("in-service-layer", "right after")

    def test_no_equivalent_hoja_is_valid(self):
        self.mutate("reference/etag/etag-guide.md; reference/etag/etag-usage.md", "no equivalent hoja")
        self.assertEqual(self.run_verify()[0], 0)

    def test_sl_path_missing(self):
        self.mutate("etag-usage.md", "nope.md")
        self.assertFails("in-service-layer", "nope.md")

    def test_link_present(self):
        self.mutate("Send", "Send [docs](other.md)")
        self.assertFails("no-links-no-images", "link to other.md")

    def test_image_present(self):
        self.mutate("Send", "Send ![alt](img.png)")
        self.assertFails("no-links-no-images", "image")

    def test_url_in_prose(self):
        self.mutate("Send", "Send https://example.com/x")
        self.assertFails("no-links-no-images", "in prose")

    def test_forbidden_host_in_code(self):
        self.mutate("W/\"abc\"\n```", "W/\"abc\"\n# https://docs.oasis-open.org/odata\n```")
        self.assertFails("no-links-no-images", "docs.oasis-open.org")

    def test_code_block_not_in_fragments(self):
        self.mutate("PATCH /Products(1)", "PATCH /Products(2)")
        self.assertFails("code", "not found verbatim")

    def test_missing_language_tag(self):
        self.mutate("```http", "```")
        self.assertFails("code", "no language tag")

    def test_missing_bloque_index_link(self):
        (self.bdir / "index.md").write_text("# Headers\n", encoding="utf-8")
        self.assertFails("routing", "not linked")

    def test_root_index_must_mention_bloque(self):
        (self.base / "index.md").write_text("# OData\n", encoding="utf-8")
        self.assertFails("routing", "does not mention")

    def test_all_requires_attribution(self):
        code, out = self.run_verify("--all")
        self.assertEqual(code, 1)
        self.assertIn("FAIL  root index: attribution", out)
        (self.base / "index.md").write_text(
            "# OData\n\n## Attribution\n\nCopyright (c) OASIS Open 2020.\n\n- headers\n", encoding="utf-8")
        self.assertEqual(self.run_verify("--all")[0], 0)


if __name__ == "__main__":
    unittest.main()
