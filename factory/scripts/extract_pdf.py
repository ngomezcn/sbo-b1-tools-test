#!/usr/bin/env python3
"""Deterministic pre-extraction of an SAP technical PDF for the build-docs-* skills.

Usage:
    python factory/scripts/extract_pdf.py <pdf> <out_dir> [--dpi 110] [--no-render]

Writes into <out_dir> (wiped and rebuilt on every run, so re-runs are idempotent):
    outline.json    bookmark tree: id, sec, level, title, start/end page, stats per node
    links.json      every link: id, kind (internal/external), page, anchor text, target
    elements.json   code blocks, tables and images with ids, pages and owning section
    warnings.md     everything the script could not classify, grouped by page
    skim.md         one line per page: headings, element counts, markup size (for planning)
    pages/pNNN.md   page text in reading order (headings, lists, code, tables, callouts)
    assets/pNNN-MM.png   every image, one file per (page, image)
    render/pNNN.png full-page renders for visual checks (skip with --no-render)

Layout constants below describe the SAP "Working with ..." PDF family (Antenna House
formatter). Adjust LAYOUT for a PDF with a different template.
"""
import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import unquote

import pymupdf

LAYOUT = {
    "code_font": "Courier",          # span font prefix that marks code
    "icon_font": "SAP-icons",        # glyph font used in callout labels
    "code_box_gray": 0.941,          # fill of code boxes
    "callout_box_gray": 0.922,       # fill of Note/Example/... boxes
    "footer_top": 775.0,             # spans below this y with small size are footer
    "footer_max_size": 6.5,
    "content_bottom": 757.0,         # last y of body content; boxes reaching it continue
    "content_top": 105.0,            # first y of body content
    "inline_image_max_h": 20.0,      # images this short sitting on a text line are inline
}
BULLETS = {"\u2022", "\u25aa", "\u2013", "\u25e6"}
ORDERED_MARK = re.compile(r"^(\d{1,2}|[a-z])\.$")
SEC_NUM = re.compile(r"^(\d+(?:\.\d+)*)\s")
DISCLAIMER = re.compile(r"https?://help\.sap\.com/disclaimer\?site=([^&]+)")


# ---------------------------------------------------------------- helpers

def norm(text):
    return text.replace("\xa0", " ")


def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def is_gray(color, value, tol=0.006):
    return color is not None and len(color) == 3 and all(abs(c - value) < tol for c in color)


def inside(point_rect, box, pad=1.0):
    x0, y0, x1, y1 = point_rect
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    return box[0] - pad <= cx <= box[2] + pad and box[1] - pad <= cy <= box[3] + pad


def is_code_span(span):
    return span["font"].startswith(LAYOUT["code_font"])


def is_bold_span(span):
    f = span["font"]
    return "Bold" in f or "Medium" in f


def is_italic_span(span):
    return "Italic" in span["font"] or "Oblique" in span["font"]


def guess_lang(text):
    t = text.lstrip()
    if re.match(r"(GET|POST|PATCH|PUT|DELETE|HTTP/|OPTIONS)\b", t):
        return "http"
    if t[:1] in "{[":
        return "json"
    if re.match(r"(?i)(select|insert|update|delete|with)\b", t):
        return "sql"
    if t[:1] == "<":
        return "xml"
    if re.search(r"\b(function|var|let|const|require|import)\b|=>", t):
        return "javascript"
    return ""


class Warnings:
    def __init__(self):
        self.by_page = defaultdict(list)

    def add(self, page, msg):
        self.by_page[page].append(msg)

    def write(self, path):
        lines = ["# Extraction warnings", "",
                 "Everything the extractor could not classify. Check each against the page render.", ""]
        for page in sorted(self.by_page):
            lines.append(f"## p{page:03d}")
            lines += [f"- {m}" for m in self.by_page[page]]
            lines.append("")
        if not self.by_page:
            lines.append("No warnings.")
        path.write_text("\n".join(lines), encoding="utf-8")

    def count(self):
        return sum(len(v) for v in self.by_page.values())


# ---------------------------------------------------------------- outline

def build_outline(doc):
    toc = doc.get_toc(simple=False)
    nodes = []
    stack = []
    for i, (level, title, page, dest) in enumerate(toc):
        title = re.sub(r"\s+", " ", norm(title)).strip()
        m = SEC_NUM.match(title)
        page_h = doc[page - 1].rect.height
        y = page_h - dest["to"].y if dest.get("to") is not None else 0.0
        node = {
            "id": i,
            "sec": m.group(1) if m else slug(title),
            "level": level,
            "title": title,
            "start_page": page,
            "start_y": round(y, 1),
            "nameddest": dest.get("nameddest", ""),
            "parent": None,
            "children": [],
        }
        while stack and nodes[stack[-1]]["level"] >= level:
            stack.pop()
        if stack:
            node["parent"] = stack[-1]
            nodes[stack[-1]]["children"].append(i)
        stack.append(i)
        nodes.append(node)
    # end of a node = start of the next node at the same or a higher level
    for n in nodes:
        nxt = next((m for m in nodes[n["id"] + 1:] if m["level"] <= n["level"]), None)
        if nxt is None:
            n["end_page"] = doc.page_count
        elif nxt["start_y"] <= LAYOUT["content_top"] + 5:
            n["end_page"] = max(n["start_page"], nxt["start_page"] - 1)
        else:
            n["end_page"] = nxt["start_page"]
    return nodes


def owning_node(nodes, page, y):
    """Deepest outline node whose start (page, y) is at or before (page, y)."""
    best = None
    for n in nodes:
        if (n["start_page"], n["start_y"] - 3) <= (page, y):
            if best is None or (n["start_page"], n["start_y"]) >= (best["start_page"], best["start_y"]):
                best = n
    return best


# ---------------------------------------------------------------- page geometry

def page_boxes(page, warn, pno):
    """Code boxes, callout boxes and horizontal table rules drawn on the page."""
    code, callout, rules = [], [], []
    other = 0
    for dr in page.get_drawings():
        r = dr["rect"]
        fill, color = dr.get("fill"), dr.get("color")
        if dr["type"] == "f" and is_gray(fill, LAYOUT["code_box_gray"]):
            code.append(tuple(r))
        elif dr["type"] == "f" and is_gray(fill, LAYOUT["callout_box_gray"]):
            callout.append(tuple(r))
        elif dr["type"] == "s" and r.height < 1 and r.width > 5:
            rules.append({"y": round(r.y0, 1), "x0": r.x0, "x1": r.x1, "w": dr.get("width") or 0})
        elif dr["type"] == "s" and r.width < 1 and color and color[2] > 0.7:
            pass  # blue left rule of a callout box
        else:
            other += 1
    if other:
        warn.add(pno, f"{other} vector drawing(s) not classified (possible diagram or decoration); check render")
    return merge_boxes(code), merge_boxes(callout), rules


def merge_boxes(boxes):
    """Antenna House sometimes paints one box as stacked rectangles; merge touching ones."""
    boxes = sorted(boxes, key=lambda b: (b[1], b[0]))
    out = []
    for b in boxes:
        if out and abs(out[-1][0] - b[0]) < 1 and abs(out[-1][2] - b[2]) < 1 and b[1] - out[-1][3] < 1.5:
            out[-1] = (out[-1][0], out[-1][1], out[-1][2], max(out[-1][3], b[3]))
        else:
            out.append(b)
    return out


def detect_tables(rules, spans, warn, pno):
    """Tables are drawn as horizontal rules only: thick under the header, thin under rows.
    Each rule is split in one segment per column, which gives the column boundaries."""
    by_y = defaultdict(list)
    for r in rules:
        by_y[round(r["y"])].append(r)
    ys = sorted(by_y)
    rows = []
    for y in ys:
        segs = sorted(by_y[y], key=lambda r: r["x0"])
        rows.append({"y": segs[0]["y"], "x0": segs[0]["x0"], "x1": segs[-1]["x1"],
                     "thick": max(s["w"] for s in segs) >= 1.2,
                     "cuts": [s["x0"] for s in segs]})
    tables = []
    for r in rows:
        cur = tables[-1] if tables else None
        same_span = cur and abs(cur["x0"] - r["x0"]) < 3 and abs(cur["x1"] - r["x1"]) < 3
        foreign = cur and any(
            (not is_code_span(s)) and s["size"] >= 8.9 and not is_bold_span(s)
            and cur["rules"][-1]["y"] < s["bbox"][1] < r["y"] and s["bbox"][0] < cur["x0"] + 4
            for s in spans)
        if same_span and not r["thick"] and not foreign:
            cur["rules"].append(r)
        else:
            tables.append({"x0": r["x0"], "x1": r["x1"], "rules": [r]})
    out = []
    for t in tables:
        first = t["rules"][0]
        cuts = sorted({round(c) for r in t["rules"] for c in r["cuts"]})
        cols = []
        for c in cuts:
            if not cols or c - cols[-1] > 6:
                cols.append(c)
        # header band: bold/medium small text directly above a thick first rule
        header_top = first["y"]
        if first["thick"]:
            band = [s for s in spans if s["bbox"][3] <= first["y"] + 1 and s["bbox"][1] > first["y"] - 60
                    and t["x0"] - 2 <= s["bbox"][0] <= t["x1"] and is_bold_span(s) and s["size"] < 8.6]
            if band:
                header_top = min(s["bbox"][1] for s in band) - 2
            else:
                warn.add(pno, f"table at y={first['y']:.0f} has a thick top rule but no header text above it")
        if len(cols) == 1:
            hx = sorted({round(s["bbox"][0]) for s in spans
                         if header_top <= s["bbox"][1] < first["y"] and t["x0"] - 2 <= s["bbox"][0] <= t["x1"]})
            cols = [round(t["x0"])]
            for x in hx:
                if x - cols[-1] > 20:
                    cols.append(x - 3)
            if len(cols) == 1:
                warn.add(pno, f"table at y={first['y']:.0f}: single column (no column cuts); check render")
        bands = []
        prev = header_top
        if not first["thick"]:
            # continuation: rows start at the top of the content area
            prev = LAYOUT["content_top"] - 15
        for r in t["rules"]:
            bands.append((prev, r["y"]))
            prev = r["y"]
        out.append({"x0": t["x0"], "x1": t["x1"], "top": bands[0][0], "bottom": t["rules"][-1]["y"],
                    "cols": cols, "bands": bands, "has_header": first["thick"]})
    return out


# ---------------------------------------------------------------- text flow rendering

class Line:
    def __init__(self, spans):
        self.spans = sorted(spans, key=lambda s: s["bbox"][0])
        self.x0 = min(s["bbox"][0] for s in spans)
        self.y0 = min(s["bbox"][1] for s in spans)
        self.y1 = max(s["bbox"][3] for s in spans)
        self.base = max(s["origin"][1] for s in spans)
        self.size = max(s["size"] for s in spans if s["text"].strip()) if any(s["text"].strip() for s in spans) else 9

    @property
    def text(self):
        return join_spans(self.spans, markup=False)

    def all_code(self):
        real = [s for s in self.spans if s["text"].strip() and not s.get("image")]
        return bool(real) and all(is_code_span(s) for s in real)


def join_spans(spans, markup=True):
    out = []
    prev = None
    groups = []  # consecutive spans with the same style and link
    for s in spans:
        style = ("img" if s.get("image") else "code" if is_code_span(s) else
                 "b" if is_bold_span(s) else "i" if is_italic_span(s) else "", s.get("link"))
        gap = (s["bbox"][0] - prev["bbox"][2]) if prev else 0
        sep = ""
        if "_join" in s:
            sep = s["_join"]
        elif prev is not None and gap > 0.2 * s["size"] and not prev["text"].endswith(" ") and not s["text"].startswith(" "):
            sep = " "
        if groups and groups[-1][0] == style and not s.get("image"):
            groups[-1][1].append(sep + s["text"])
        else:
            groups.append((style, [s["text"]], sep, s))
        prev = s
    for style, parts, sep, first in groups:
        text = norm("".join(parts))
        if not markup:
            out.append(sep + (f"[{first['image']}]" if style[0] == "img" else text))
            continue
        lead = " " if (sep or text.startswith(" ")) else ""
        core = text.strip()
        trail = " " if text.endswith(" ") and core else ""
        if style[0] == "img":
            md = f"![{first['image']}]({first['image']}.png)"
        elif not core:
            md = ""
        elif style[0] == "code":
            md = f"``{core}``" if "`" in core else f"`{core}`"
        elif style[0] == "b":
            md = f"**{core}**"
        elif style[0] == "i":
            md = f"*{core}*"
        else:
            md = core
        if style[1] and core:
            md = f"[{md}]({style[1]})"
        out.append(lead + md + trail)
    return re.sub(r"[ ]{2,}", " ", "".join(out)).strip()


def build_lines(spans):
    spans = sorted(spans, key=lambda s: (round(s["origin"][1], 0), s["bbox"][0]))
    lines = []
    for s in spans:
        for ln in lines[-3:]:
            if abs(ln[0]["origin"][1] - s["origin"][1]) < 3.0:
                ln.append(s)
                break
        else:
            lines.append([s])
    return sorted((Line(l) for l in lines), key=lambda l: (l.base, l.x0))


def render_code(lines):
    if not lines:
        return ""
    xs = Counter(round(l.x0) for l in lines)
    base_x = xs.most_common(1)[0][0]
    out = []
    prev = None
    for l in lines:
        if prev is not None:
            pitch = l.size * 1.1
            gap = l.base - prev.base
            if gap > pitch * 1.75:
                out.extend([""] * max(1, round(gap / max(pitch, 1)) - 1))
        extra = max(0, round((l.x0 - base_x) / (0.6 * l.size)))
        text = "".join(s["text"] for s in l.spans).replace("\xa0", " ").rstrip()
        out.append(" " * extra + text)
        prev = l
    return "\n".join(out).strip("\n")


def render_flow(spans, images, code_boxes, callout_boxes, tables, ctx, depth=0, in_cell=False):
    """Render one region (page body, table cell or callout content) as Markdown."""
    # atomic elements first: tables, callouts, code boxes, block images
    elements = []  # (y, kind, payload)
    used = set()
    for t in tables:
        elements.append((t["top"], "table", t))
        for i, s in enumerate(spans):
            if t["x0"] - 2 <= s["bbox"][0] <= t["x1"] + 2 and t["top"] - 1 <= (s["bbox"][1] + s["bbox"][3]) / 2 <= t["bottom"] + 1:
                used.add(i)
    for cb in callout_boxes:
        if any(cb[0] >= t["x0"] - 2 and cb[2] <= t["x1"] + 2 and t["top"] <= cb[1] <= t["bottom"] for t in tables):
            continue
        idx = [i for i, s in enumerate(spans) if i not in used and inside(s["bbox"], cb)]
        used.update(idx)
        inner_code = [b for b in code_boxes if inside(b, cb)]
        elements.append((cb[1], "callout", (cb, [spans[i] for i in idx], inner_code)))
    for b in code_boxes:
        if any(inside(b, cb) for cb in callout_boxes):
            continue
        if any(b[0] >= t["x0"] - 2 and b[2] <= t["x1"] + 2 and t["top"] <= b[1] <= t["bottom"] for t in tables):
            continue
        idx = [i for i, s in enumerate(spans) if i not in used and inside(s["bbox"], b)]
        used.update(idx)
        elements.append((b[1], "codebox", (b, [spans[i] for i in idx])))
    for im in images:
        if im.get("inline") or im.get("taken"):
            continue
        if any(t["x0"] - 2 <= im["bbox"][0] <= t["x1"] and t["top"] <= im["bbox"][1] <= t["bottom"] for t in tables):
            continue
        if any(inside(im["bbox"], cb) for cb in callout_boxes):
            continue
        im["taken"] = True
        elements.append((im["bbox"][1], "image", im))
    free = [s for i, s in enumerate(spans) if i not in used]
    for l in build_lines(free):
        elements.append((l.y0, "line", l))
    elements.sort(key=lambda e: (e[0], 0 if e[1] != "line" else 1))

    out = []          # list of markdown blocks
    para = None       # current paragraph: dict(lines, kind, indent)
    list_stack = []   # x positions of open list levels
    code_run = []

    def flush_para():
        nonlocal para
        if para:
            md = render_para(para)
            # consecutive items of one list stay a tight list
            if para["marker"] and out and out[-1] is not None and ctx.last_item is out[-1]:
                out[-1] = out[-1] + "\n" + md
            else:
                out.append(md)
            ctx.last_item = out[-1] if para["marker"] else None
            para = None

    def flush_code():
        nonlocal code_run
        if code_run:
            out.append(ctx.code_block(render_code(code_run), code_run[0], code_run[-1], boxed=False))
            code_run = []

    prev_line = None
    for y, kind, item in elements:
        if kind != "line":
            flush_para()
            ctx.last_item = None
            flush_code()
            list_stack.clear()
            if kind == "table":
                out.append(ctx.table_block(item, spans, images, code_boxes, callout_boxes))
            elif kind == "callout":
                cb, cspans, inner_code = item
                inner_imgs = [im for im in images if inside(im["bbox"], cb) and not im.get("inline")]
                body = render_flow(cspans, inner_imgs, inner_code, [], [], ctx, depth + 1, in_cell)
                out.append("\n".join(("> " + l) if l else ">" for l in body.split("\n")))
            elif kind == "codebox":
                b, cspans = item
                lines = build_lines(cspans)
                out.append(ctx.code_block(render_code(lines), None, None, boxed=True, box=b))
            elif kind == "image":
                out.append(f"![{item['id']}]({item['id']}.png)")
            prev_line = None
            continue

        l = item
        text = l.text.strip()
        if not text:
            continue
        gap = (l.base - prev_line.base) if prev_line else 99
        tight = gap <= max(l.size, 9) * 1.9

        # callout label: icon glyph + "Note"/"Example"/...
        if any(s["font"].startswith(LAYOUT["icon_font"]) for s in l.spans):
            flush_para(); flush_code()
            label = "".join(s["text"] for s in l.spans if not s["font"].startswith(LAYOUT["icon_font"]))
            out.append(f"**{norm(label).strip()}**")
            prev_line = l
            continue
        # second line of a wrapped bookmarked heading: the outline title already holds it
        if (out and out[-1].startswith("#") and prev_line is not None and gap < l.size * 1.6
                and norm(text) in out[-1]):
            prev_line = l
            continue
        # headings
        heading = ctx.heading_for(l)
        if heading:
            flush_para(); flush_code(); list_stack.clear()
            if (out and out[-1].startswith("**") and heading.startswith("**") and prev_line is not None
                    and gap < l.size * 1.6 and not para):
                out[-1] = out[-1][:-2] + " " + heading[2:]  # wrapped bold pseudo-heading
            else:
                out.append(heading)
            prev_line = l
            continue
        # code lines outside boxes: Courier-only lines that start their own paragraph.
        # In table cells they are inline values (`$filter`, sample URLs), not code blocks.
        if not in_cell and l.all_code() and (code_run or not tight or (para is None)):
            flush_para()
            code_run.append(l)
            prev_line = l
            continue
        flush_code()
        first = l.spans[0]
        first_text = norm(first["text"]).strip()
        marker = None
        if first_text in BULLETS:
            marker = "-"
        elif ORDERED_MARK.match(first_text) and len(l.spans) > 1:
            marker = first_text
        if marker:
            flush_para()
            while list_stack and list_stack[-1] > l.x0 + 3:
                list_stack.pop()
            if not list_stack or l.x0 > list_stack[-1] + 3:
                list_stack.append(l.x0)
            body_spans = l.spans[1:]
            para = {"marker": marker, "depth": len(list_stack) - 1, "lines": [body_spans],
                    "x": body_spans[0]["bbox"][0] if body_spans else l.x0, "base": l.base}
            prev_line = l
            continue
        # continuation of the current paragraph / list item
        if para and tight and l.x0 >= para["x"] - 3:
            para["lines"].append(l.spans)
            prev_line = l
            continue
        flush_para()
        # paragraph inside a list item (indented to the item text)
        depth_here = -1
        for i, x in enumerate(list_stack):
            if l.x0 > x + 3:
                depth_here = i
        if depth_here < 0:
            list_stack.clear()
        para = {"marker": None, "depth": depth_here, "lines": [l.spans], "x": l.x0, "base": l.base}
        prev_line = l
    flush_para()
    flush_code()
    return "\n\n".join(b for b in out if b is not None and b != "")


def render_para(para):
    spans = []
    for line in para["lines"]:
        line = [s for s in line if s["text"]]
        if not line:
            continue
        if spans:
            prev_text = spans[-1]["text"].rstrip()
            first = dict(line[0])
            if re.search(r"[A-Za-z]-$", prev_text) and re.match(r"[a-z]", first["text"])                     and not is_code_span(spans[-1]) and not spans[-1].get("link"):
                spans[-1] = dict(spans[-1], text=prev_text[:-1])  # undo hyphenation
                first["_join"] = ""
            else:
                first["_join"] = " "
            line = [first] + line[1:]
        spans.extend(line)
    text = join_spans(spans)
    indent = "  " * max(0, para["depth"]) if para["marker"] else "  " * (para["depth"] + 1) if para["depth"] >= 0 else ""
    if para["marker"]:
        lead = "- " if para["marker"] == "-" else para["marker"] + " "
        return indent + lead + text
    return indent + text


# ---------------------------------------------------------------- page context

class PageCtx:
    """Per-page state: ids, headings, element registry."""

    def __init__(self, extractor, pno, page_nodes):
        self.ex = extractor
        self.pno = pno
        self.page_nodes = page_nodes
        self.code_n = 0
        self.table_n = 0
        self.matched = set()
        self.last_item = None

    def heading_for(self, line):
        if not all(is_bold_span(s) for s in line.spans if s["text"].strip()):
            return None
        if line.size < 9.5:
            return None
        text = re.sub(r"\s+", " ", norm(line.text)).strip()
        for n in self.page_nodes:
            if n["id"] in self.matched:
                continue
            title = n["title"]
            if text == title or title.startswith(text) or text.startswith(title):
                self.matched.add(n["id"])
                return "#" * min(6, max(1, n["level"] - 1)) + " " + title
        return f"**{text}**"

    def code_block(self, text, first_line, last_line, boxed, box=None):
        self.code_n += 1
        cid = f"c{self.pno:03d}-{self.code_n:02d}"
        y0 = box[1] if box else first_line.y0
        y1 = box[3] if box else last_line.y1
        el = {"id": cid, "page": self.pno, "y0": round(y0, 1), "y1": round(y1, 1), "boxed": boxed, "text": text}
        self.ex.code.append(el)
        lang = guess_lang(text)
        marker = f"<!-- code: {cid} -->"
        return f"{marker}\n```{lang}\n{text}\n```"

    def table_block(self, t, spans, images, code_boxes, callout_boxes):
        self.table_n += 1
        tid = f"t{self.pno:03d}-{self.table_n:02d}"
        cols = t["cols"] + [t["x1"] + 1]
        grid = []
        for top, bottom in t["bands"]:
            row = []
            for c in range(len(cols) - 1):
                cx0, cx1 = cols[c] - 2, cols[c + 1] - 2
                cell = (cx0, top, cx1, bottom)
                cspans = [s for s in spans if inside(s["bbox"], cell, pad=0)]
                cimgs = [im for im in images if inside(im["bbox"], cell, pad=0) and not im.get("inline")]
                for im in cimgs:
                    im["taken"] = True
                ccode = [b for b in code_boxes if inside(b, cell, pad=0)]
                ccall = [b for b in callout_boxes if inside(b, cell, pad=0)]
                if top == t["top"] and t["has_header"]:
                    row.append(" ".join(l.text for l in build_lines(cspans)).strip())
                else:
                    row.append(render_flow(cspans, cimgs, ccode, ccall, [], self, 1, True).strip())
            grid.append(row)
        el = {"id": tid, "page": self.pno, "y0": round(t["top"], 1), "y1": round(t["bottom"], 1),
              "cols": len(cols) - 1, "rows": len(grid), "has_header": t["has_header"],
              "first_row": [re.sub(r"\*\*", "", c) for c in grid[0]] if grid else []}
        self.ex.tables.append(el)
        header = grid[0] if t["has_header"] and grid else None
        body = grid[1:] if header else grid
        simple = all("\n" not in c and len(c) <= 120 for r in grid for c in r) and len(cols) - 1 <= 6
        lines = [f"<!-- table: {tid} -->"]
        if simple:
            hdr = header or [f"col{i + 1}" for i in range(len(cols) - 1)]
            lines.append("| " + " | ".join(h.replace("|", "\\|") for h in hdr) + " |")
            lines.append("|" + "---|" * len(hdr))
            for r in body:
                lines.append("| " + " | ".join(c.replace("|", "\\|").replace("\n", " ") for c in r) + " |")
        else:
            hdr = header or [f"Column {i + 1}" for i in range(len(cols) - 1)]
            for r in body:
                first = True
                for h, c in zip(hdr, r):
                    if not c:
                        continue
                    if "\n" in c:
                        body_c = "\n".join(("    " + x) if x else "" for x in c.split("\n"))
                        lines.append(f"{'- ' if first else '  - '}**{h}**:\n\n{body_c}\n")
                    else:
                        lines.append(f"{'- ' if first else '  - '}**{h}**: {c}")
                    first = False
        el["format"] = "markdown" if simple else "rows"
        return "\n".join(lines)


# ---------------------------------------------------------------- extractor

class Extractor:
    def __init__(self, pdf, out, dpi, render):
        self.doc = pymupdf.open(pdf)
        if self.doc.needs_pass:
            sys.exit("PDF needs a password")
        self.pdf = pdf
        self.out = Path(out)
        self.dpi = dpi
        self.render = render
        self.warn = Warnings()
        self.code, self.tables, self.images, self.links = [], [], [], []

    def prepare_out(self):
        self.out.mkdir(parents=True, exist_ok=True)
        for sub in ("pages", "assets") + (("render",) if self.render else ()):
            d = self.out / sub
            d.mkdir(exist_ok=True)
            for f in d.iterdir():  # empty in place: Windows may hold the folder itself open
                f.unlink()

    def run(self):
        self.prepare_out()
        self.nodes = build_outline(self.doc)
        pages_md = {}
        for page in self.doc:
            pages_md[page.number + 1] = self.extract_page(page)
        self.link_continuations(pages_md)
        for pno, md in pages_md.items():
            (self.out / "pages" / f"p{pno:03d}.md").write_text(md, encoding="utf-8")
        self.assign_sections()
        self.write_json()
        self.write_skim(pages_md)
        self.warn.write(self.out / "warnings.md")

    def write_skim(self, pages_md):
        """One line per page: headings and element counts, for planning without reading every page."""
        count = defaultdict(Counter)
        for kind, items in (("code", self.code), ("tables", self.tables), ("images", self.images)):
            for el in items:
                count[el["page"]][kind] += 1
        lines = ["# Page skim", "",
                 "Per page: headings and pseudo-headings, code blocks / tables / images (parts), size of the page markup.", "",
                 "| page | headings | code | tables | images | chars |", "|---|---|---|---|---|---|"]
        for pno, md in pages_md.items():
            heads = [l.lstrip("#* ").rstrip("*") for l in md.splitlines()
                     if l.startswith("#") or (l.startswith("**") and l.endswith("**") and len(l) < 90)]
            c = count[pno]
            lines.append(f"| {pno} | {'; '.join(heads).replace('|', '/')} | {c['code']} | {c['tables']} | {c['images']} | {len(md)} |")
        (self.out / "skim.md").write_text("\n".join(lines) + "\n", encoding="utf-8")

    # -------------------------------------------------- per page
    def extract_page(self, page):
        pno = page.number + 1
        warn = self.warn
        page_links = self.extract_links(page, pno)
        images = self.extract_images(page, pno)
        code_boxes, callout_boxes, rules = page_boxes(page, warn, pno)

        flags = pymupdf.TEXTFLAGS_DICT & ~pymupdf.TEXT_PRESERVE_IMAGES
        spans = []
        for b in page.get_text("dict", flags=flags)["blocks"]:
            for ln in b.get("lines", []):
                for s in ln["spans"]:
                    if s["bbox"][1] >= LAYOUT["footer_top"] and s["size"] <= LAYOUT["footer_max_size"]:
                        continue
                    if not s["text"]:
                        continue
                    s = dict(s)
                    s["bbox"] = tuple(s["bbox"])
                    for lk in page_links:
                        if inside(s["bbox"], lk["rect"], pad=0.5):
                            s["link"] = lk["md_target"]
                            break
                    spans.append(s)
                    if s["font"].startswith(LAYOUT["icon_font"]) and norm(s["text"]).strip() not in ICONS:
                        warn.add(pno, f"unknown icon glyph {s['text']!r} at y={s['bbox'][1]:.0f}")
        known = LAYOUT["code_font"], LAYOUT["icon_font"], "BentonSans"
        for f in {s["font"] for s in spans}:
            if not f.startswith(known):
                warn.add(pno, f"unknown font {f!r}; spans kept as plain text")

        # inline images become pseudo-spans on their text line
        for im in images:
            h = im["bbox"][3] - im["bbox"][1]
            if h <= LAYOUT["inline_image_max_h"]:
                on_line = [s for s in spans if s["bbox"][1] - 3 <= (im["bbox"][1] + im["bbox"][3]) / 2 <= s["bbox"][3] + 3]
                if on_line:
                    im["inline"] = True
                    ref = on_line[0]
                    spans.append({"text": " ", "font": "image", "size": ref["size"], "flags": 0,
                                  "bbox": im["bbox"], "origin": (im["bbox"][0], ref["origin"][1]),
                                  "image": im["id"]})

        block_ids = {im["id"] for im in images if not im.get("inline")}
        for el in self.images:
            if el["page"] == pno:
                el["inline"] = el["id"] not in block_ids

        tables = detect_tables(rules, spans, warn, pno)
        page_nodes = [n for n in self.nodes if n["start_page"] == pno]
        ctx = PageCtx(self, pno, page_nodes)
        body = render_flow(spans, images, code_boxes, callout_boxes, tables, ctx)
        for n in page_nodes:
            if n["id"] not in ctx.matched and n["start_page"] > 1:
                warn.add(pno, f"bookmark '{n['title']}' has no matching heading line on the page")
        for im in images:
            if not im.get("inline") and not im.get("taken"):
                warn.add(pno, f"image {im['id']} not placed in reading order; appended at page end")
                body += f"\n\n![{im['id']}]({im['id']}.png)"
        self.page_flags = getattr(self, "page_flags", {})
        self.page_flags[pno] = {
            "code_top": any(b[1] <= LAYOUT["content_top"] for b in code_boxes),
            "code_bottom": any(b[3] >= LAYOUT["content_bottom"] - 1 for b in code_boxes),
        }
        secs = ", ".join(n["sec"] for n in page_nodes)
        head = f"<!-- page {pno} | starts: {secs or '-'} -->"
        return f"{head}\n\n{body}\n"

    def extract_links(self, page, pno):
        out = []
        n = 0
        for lk in page.get_links():
            n += 1
            lid = f"l{pno:03d}-{n:02d}"
            rect = lk["from"]
            anchor = re.sub(r"\s+", " ", norm(page.get_textbox(rect + (-1, -1, 1, 1)))).strip()
            rec = {"id": lid, "page": pno, "anchor": anchor}
            if lk["kind"] == pymupdf.LINK_URI:
                url = lk["uri"]
                m = DISCLAIMER.match(url)
                if m:  # SAP wraps outbound links in a disclaimer redirect
                    rec["raw_url"] = url
                    url = unquote(m.group(1))
                rec.update(kind="external", url=url)
                md_target = url
            elif lk["kind"] in (pymupdf.LINK_GOTO, pymupdf.LINK_NAMED) and "page" in lk and lk["page"] >= 0:
                tpage = lk["page"] + 1
                ty = self.doc[lk["page"]].rect.height - lk["to"].y if lk.get("to") is not None else 0
                node = next((x for x in self.nodes if lk.get("nameddest") and x["nameddest"] == lk["nameddest"]), None)
                node = node or owning_node(self.nodes, tpage, ty)
                rec.update(kind="internal", target_page=tpage, target_sec=node["sec"] if node else None,
                           target_title=node["title"] if node else None)
                md_target = f"sec:{node['sec']}" if node else f"page:{tpage}"
                if node is None:
                    self.warn.add(pno, f"internal link {lid} '{anchor}' resolves to no outline node")
            elif lk["kind"] == pymupdf.LINK_GOTOR:
                url = lk.get("file", "")
                rec.update(kind="external", url=url if "://" in url else "https://" + url, note="GoToR link in PDF")
                md_target = rec["url"]
            else:
                rec.update(kind="unknown", raw=str({k: v for k, v in lk.items() if k != "from"}))
                md_target = ""
                self.warn.add(pno, f"link {lid} of unhandled kind {lk['kind']}")
            if not anchor:
                self.warn.add(pno, f"link {lid} has no anchor text")
            self.links.append(rec)
            out.append({"rect": tuple(rect), "md_target": md_target})
        return out

    def extract_images(self, page, pno):
        placements = [i for i in page.get_image_info(xrefs=True)]
        for i in placements:
            if i["xref"] == 0:
                self.warn.add(pno, f"inline image without xref at {tuple(round(v) for v in i['bbox'])}; not extracted")
        placements = [i for i in placements if i["xref"]]
        placements.sort(key=lambda i: (round(i["bbox"][1]), i["bbox"][0]))
        order = []
        for i in placements:
            if i["xref"] not in order:
                order.append(i["xref"])
        listed = {im[0]: im for im in page.get_images(full=True)}
        for x in listed:
            if x not in order:
                self.warn.add(pno, f"image xref {x} is in page resources but never drawn; not extracted")
        ids = {}
        for n, xref in enumerate(order, 1):
            iid = f"p{pno:03d}-{n:02d}"
            ids[xref] = iid
            pix = pymupdf.Pixmap(self.doc, xref)
            smask = listed.get(xref, [0, 0])[1]
            if smask:
                try:
                    pix = pymupdf.Pixmap(pix, pymupdf.Pixmap(self.doc, smask))
                except Exception as e:  # keep the image without its mask
                    self.warn.add(pno, f"{iid}: soft mask not applied ({e})")
            if pix.colorspace and pix.colorspace.n not in (1, 3):
                pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
            pix.save(self.out / "assets" / f"{iid}.png")
            boxes = [i["bbox"] for i in placements if i["xref"] == xref]
            self.images.append({"id": iid, "page": pno, "xref": xref, "width": pix.width, "height": pix.height,
                                "placements": len(boxes), "bboxes": [[round(v, 1) for v in b] for b in boxes],
                                "y0": round(boxes[0][1], 1)})
        out = []
        for i in placements:
            out.append({"id": ids[i["xref"]], "bbox": tuple(i["bbox"])})
        if self.render:
            page.get_pixmap(dpi=self.dpi).save(self.out / "render" / f"p{pno:03d}.png")
        return out

    # -------------------------------------------------- cross-page
    def link_continuations(self, pages_md):
        """A code block or table cut by a page break keeps the id of its first part."""
        by_page = defaultdict(list)
        for c in self.code:
            by_page[c["page"]].append(c)
        for pno in sorted(by_page):
            first = by_page[pno][0]
            prev = by_page.get(pno - 1)
            if not prev or not first["boxed"] or first["y0"] > LAYOUT["content_top"]:
                continue
            last = prev[-1]
            if last["boxed"] and last["y1"] >= LAYOUT["content_bottom"] - 1:
                root = last.get("continues", last["id"])
                first["continues"] = root
                pages_md[pno] = pages_md[pno].replace(
                    f"<!-- code: {first['id']} -->", f"<!-- code: {first['id']} continues {root} -->")
        tby = defaultdict(list)
        for t in self.tables:
            tby[t["page"]].append(t)
        for pno in sorted(tby):
            first = tby[pno][0]
            prev = tby.get(pno - 1)
            if not prev or first["y0"] > LAYOUT["content_top"] + 10:
                continue
            last = prev[-1]
            if last["cols"] == first["cols"] and last["y1"] >= LAYOUT["content_bottom"] - 60:
                root = last.get("continues", last["id"])
                first["continues"] = root
                pages_md[pno] = pages_md[pno].replace(
                    f"<!-- table: {first['id']} -->", f"<!-- table: {first['id']} continues {root} -->")

    def assign_sections(self):
        for el in self.code + self.tables + self.images:
            n = owning_node(self.nodes, el["page"], el["y0"])
            el["sec"] = n["sec"] if n else None
        # own-content stats per node, for the planner
        stats = {n["id"]: Counter() for n in self.nodes}
        by_sec = {n["sec"]: n["id"] for n in self.nodes}
        for c in self.code:
            if c["sec"] in by_sec and "continues" not in c:
                stats[by_sec[c["sec"]]]["code"] += 1
        for t in self.tables:
            if t["sec"] in by_sec and "continues" not in t:
                stats[by_sec[t["sec"]]]["tables"] += 1
        for im in self.images:
            if im["sec"] in by_sec:
                stats[by_sec[im["sec"]]]["images"] += 1
        for n in self.nodes:
            n["pages"] = n["end_page"] - n["start_page"] + 1
            n["own"] = dict(stats[n["id"]])
        for n in reversed(self.nodes):  # children come after parents
            total = Counter(stats[n["id"]])
            for c in n["children"]:
                total.update(self.nodes[c]["total"])
            n["total"] = dict(total)

    def write_json(self):
        def dump(name, data):
            (self.out / name).write_text(json.dumps(data, indent=1, ensure_ascii=False), encoding="utf-8")
        dump("outline.json", {"pdf": str(self.pdf), "page_count": self.doc.page_count, "nodes": self.nodes})
        dump("links.json", self.links)
        logical_code = [c for c in self.code if "continues" not in c]
        dump("elements.json", {
            "counts": {"code_blocks": len(logical_code), "code_parts": len(self.code),
                       "tables": len([t for t in self.tables if "continues" not in t]), "table_parts": len(self.tables),
                       "images": len(self.images), "image_placements": sum(i["placements"] for i in self.images),
                       "links": len(self.links),
                       "links_internal": sum(1 for l in self.links if l["kind"] == "internal"),
                       "links_external": sum(1 for l in self.links if l["kind"] == "external")},
            "code": self.code, "tables": self.tables, "images": self.images})


ICONS = {"\ue05c", "\ue04c", "\ue16d", "\ue139"}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("pdf")
    ap.add_argument("out_dir")
    ap.add_argument("--dpi", type=int, default=110)
    ap.add_argument("--no-render", action="store_true")
    a = ap.parse_args()
    ex = Extractor(a.pdf, a.out_dir, a.dpi, not a.no_render)
    ex.run()
    counts = json.loads((Path(a.out_dir) / "elements.json").read_text(encoding="utf-8"))["counts"]
    print(f"pages: {ex.doc.page_count}  outline nodes: {len(ex.nodes)}  warnings: {ex.warn.count()}")
    print("  ".join(f"{k}: {v}" for k, v in counts.items()))


if __name__ == "__main__":
    main()
