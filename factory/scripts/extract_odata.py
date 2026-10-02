#!/usr/bin/env python3
"""Deterministic pre-extraction of the public OData sources for the build-docs-from-odata skill.

Usage:
    python factory/scripts/extract_odata.py [--pins PATH] [--work factory/.work/odata]
                                            [--sl factory/docs-src/service-layer] [--no-network]

Sources (declared in the skill's pins.json):
    * four OASIS OData 4.01 documents (Word-exported "filtered HTML"): Part 1 Protocol,
      Part 2 URL Conventions, JSON Format, CSDL XML; downloaded once into WORK/_cache;
    * the Microsoft Learn OData docs (overview.md and concepts/*.md) at a pinned commit,
      fetched with a sparse git checkout into WORK/_cache/ms-repo.

Writes into WORK (everything except _cache/ is wiped and rebuilt, so re-runs are idempotent
and, for the same pins and cache, byte-identical):
    manifest.json   pins, source URLs, sha256 of every source file used, script version
    outline.json    {"nodes": [...]} one node per fragment (id, origin, title, level, parent,
                    children, anchor alias, line counts, code blocks, tables, file)
    sections/<id>.md  the fragment: own text plus all descendants, converted to Markdown
    skim.md         one row per node for planning (size, code, tables, SL coverage summary)
    sl-hits.md      per fragment, top terms and how Service Layer hojas cover them
    warnings.md     excluded parts, conversion quirks, anything unclassified

Only the Python standard library and git are used. Service Layer docs are read, never written.
"""
import argparse
import hashlib
import html.parser
import json
import re
import shutil
import subprocess
import sys
import urllib.request
from collections import Counter, OrderedDict
from pathlib import Path

SCRIPT_VERSION = "1"
ROOT = Path(__file__).resolve().parents[2]
DEFAULT_PINS = ROOT / ".claude" / "skills" / "build-docs-from-odata" / "pins.json"
DEFAULT_WORK = ROOT / "factory" / ".work" / "odata"
DEFAULT_SL = ROOT / "factory" / "docs-src" / "service-layer"
BIG_FRAGMENT = 400  # lines; the planner should list the children of bigger fragments
MAX_TERMS = 12
MAX_DEPTH = 3       # deepest OASIS heading that becomes a node (deeper ones stay inside the text)


def write_text(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8", newline="\n")


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


class Warnings:
    def __init__(self):
        self.sections = OrderedDict()

    def add(self, group, msg):
        d = self.sections.setdefault(group, OrderedDict())
        d[msg] = d.get(msg, 0) + 1

    def write(self, path, extra_header=()):
        lines = ["# Extraction warnings", "",
                 "Parts left out of the outline, conversion quirks and anything the converter could not classify.", ""]
        lines += list(extra_header)
        for group, msgs in self.sections.items():
            lines.append(f"## {group}")
            lines += [f"- {m}" + (f" (x{n})" if n > 1 else "") for m, n in msgs.items()]
            lines.append("")
        if not self.sections:
            lines.append("No warnings.")
        write_text(path, "\n".join(lines).rstrip() + "\n")


# ============================================================ text normalisation

PROSE_MAP = {
    "\xa0": " ", "‘": "'", "’": "'", "“": '"', "”": '"', "‑": "-",
    "­": "", "​": "", "﻿": "", " ": " ", " ": " ", " ": " ",
}
PROSE_TABLE = str.maketrans(PROSE_MAP)


def norm_text(s):
    return s.translate(PROSE_TABLE)


# ============================================================ HTML tree (stdlib)

VOID = {"br", "img", "meta", "link", "hr", "col", "input", "base", "area", "wbr"}
SKIP_CONTENT = {"style", "script", "head", "title"}


class Node:
    __slots__ = ("tag", "attrs", "kids")

    def __init__(self, tag, attrs):
        self.tag = tag
        self.attrs = attrs
        self.kids = []

    def get(self, name, default=""):
        return self.attrs.get(name) or default

    @property
    def cls(self):
        return (self.attrs.get("class") or "").strip()


class TreeBuilder(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("root", {})
        self.stack = [self.root]
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in SKIP_CONTENT:
            self.skip += 1
            return
        if self.skip:
            return
        a = {k: (v if v is not None else "") for k, v in attrs}
        # implied end tags (Word output omits some closing tags)
        names = [n.tag for n in self.stack]
        if tag == "li" and "li" in names:
            self._pop_to("li", before=("ul", "ol"))
        elif tag in ("td", "th") and ("td" in names or "th" in names):
            self._pop_to_any(("td", "th"), before=("tr", "table"))
        elif tag == "tr" and "tr" in names:
            self._pop_to("tr", before=("table",))
        elif tag == "p" and names[-1] == "p":
            self.stack.pop()
        n = Node(tag, a)
        self.stack[-1].kids.append(n)
        if tag not in VOID:
            self.stack.append(n)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID and tag not in SKIP_CONTENT and not self.skip:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if tag in SKIP_CONTENT:
            self.skip = max(0, self.skip - 1)
            return
        if self.skip or tag in VOID:
            return
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                return

    def handle_data(self, data):
        if self.skip:
            return
        self.stack[-1].kids.append(data)

    def _pop_to(self, tag, before):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag in before:
                return
            if self.stack[i].tag == tag:
                del self.stack[i:]
                return

    def _pop_to_any(self, tags, before):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag in before:
                return
            if self.stack[i].tag in tags:
                del self.stack[i:]
                return


def parse_html(text):
    tb = TreeBuilder()
    tb.feed(text)
    tb.close()
    return tb.root


def find(node, tag):
    for k in node.kids:
        if isinstance(k, Node):
            if k.tag == tag:
                return k
            r = find(k, tag)
            if r:
                return r
    return None


def iter_nodes(node):
    for k in node.kids:
        if isinstance(k, Node):
            yield k
            yield from iter_nodes(k)


def plain_text(node, pre=False):
    """All text under node, raw (no whitespace collapse beyond what pre asks for)."""
    out = []
    for k in node.kids:
        if isinstance(k, str):
            out.append(k)
        elif is_noise(k):
            continue
        elif k.tag == "br":
            out.append("\n")
        else:
            out.append(plain_text(k, pre))
    return "".join(out)


def is_noise(n):
    """Cloudflare-obfuscated e-mail addresses and images."""
    if n.tag == "img":
        return True
    c = n.cls
    if "__cf_email__" in c:
        return True
    return n.tag == "a" and "email-protection" in n.get("href")


# ============================================================ OASIS HTML -> Markdown

CODE_CLASSES = {"Datatype", "VerbatimChar", "CODEtemp", "Keyword", "string", "datatype0", "Code0"}
BULLET_RE = re.compile(r"^[\s\xa0]*([·•o§▪–\-])[\s\xa0]*$")
NUM_RE = re.compile(r"^[\s\xa0]*(\d{1,2}|[a-z])[.)][\s\xa0]*$")
HTTP_START = re.compile(r"^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|HTTP/\d)\b")
ABNF_RULE = re.compile(r"^[A-Za-z][A-Za-z0-9-]*\s*=/?\s*\S")
KNOWN_P = {"MsoNormal", "Code", "SourceCode", "MsoCaption", "MsoListParagraph", "MsoListBullet",
           "MsoToc", "Titlepageinfo", "Abstract", "Ref", "Member", "MemberHeading", "ObjectHeading",
           "AppendixHeading", "Notices", "RelatedWork", "MsoSubtitle", "MsoTitle", "Titlepageinfodescription",
           "MsoNormalTable", "MsoHeader", "MsoFooter", "TextBody", "MsoCommentText", "MsoTof"}


def guess_lang(text):
    t = text.lstrip()
    if HTTP_START.match(t):
        return "http"
    if t[:1] in "{[":
        return "json"
    if t[:1] == "<":
        return "xml"
    if ABNF_RULE.match(t):
        return "abnf"
    return "text"


def classify_p(cls):
    for k in KNOWN_P:
        if cls.startswith(k):
            return k
    return None


def style_of(n):
    st = n.get("style")
    if n.cls in CODE_CLASSES or re.search(r"Courier|Consolas|Lucida Console", st):
        return "code"
    return ""


class Runs:
    """Inline content as styled runs, then emitted as Markdown."""

    def __init__(self, plain=False, pre=False):
        self.runs = []
        self.plain = plain
        self.pre = pre

    def add(self, text, style):
        if text:
            self.runs.append((text, style))

    def walk(self, nodes, style=""):
        for k in nodes:
            if isinstance(k, str):
                t = k
                if self.pre:
                    t = re.sub(r"[ \t\r\n]+", " ", t)
                else:
                    t = re.sub(r"[ \t\r\n\xa0]+", " ", t)
                self.add(t, style)
                continue
            if is_noise(k):
                continue
            if k.tag == "br":
                self.add("\n", "")
                continue
            st = style
            own = style_of(k)
            if own == "code":
                st = "code"
            elif k.tag in ("b", "strong") and st != "code":
                st = "bi" if "i" in st else "b"
            elif k.tag in ("i", "em", "cite") and st != "code":
                st = "bi" if "b" in st else "i"
            self.walk(k.kids, st)

    def emit(self):
        groups = []
        for text, style in self.runs:
            if self.plain or not text.strip(" \n\xa0"):
                style = ""
            if groups and groups[-1][1] == style:
                groups[-1][0].append(text)
            else:
                groups.append(([text], style))
        out = []
        for parts, style in groups:
            text = "".join(parts)
            if not style:
                out.append(text)
                continue
            core = text.strip(" \n")
            lead = " " if text[:1] in " \n" else ""
            trail = " " if text[-1:] in " \n" else ""
            core = norm_text(core) if style != "code" else core
            if style in ("b", "i", "bi") and re.fullmatch(r"\[[\w.-]+\][)\].,;:]*", core):
                out.append(lead + core + trail)  # citation tag such as [RFC7232]: plain text
                continue
            if style == "code":
                core = core.replace("\xa0", " ")
                # a quote that only opens or closes inside the span belongs outside it
                pre = post = ""
                for q in ("'", '"'):
                    if core.count(q) == 1 and len(core) > 1:
                        if core.startswith(q):
                            pre, core = q, core[1:]
                        elif core.endswith(q):
                            post, core = q, core[:-1]
                kw = re.match(r"^(.*\S)\s+(MUST NOT|SHOULD NOT|MUST|MAY|SHOULD)$", core)
                if kw:
                    core = kw.group(1)
                    post = post + " " + kw.group(2)
                md = pre + (f"``{core}``" if "`" in core else f"`{core}`") + post
            elif style == "b":
                md = f"**{core}**"
            elif style == "i":
                md = f"*{core}*"
            else:
                md = f"***{core}***"
            out.append(lead + md + trail)
        s = "".join(out)
        s = re.sub(r"[ ]*\n[ ]*", "\n", s)
        s = re.sub(r"[ ]{2,}", " ", s)
        return norm_text(s).strip()


def inline_md(nodes, plain=False):
    r = Runs(plain=plain)
    r.walk(nodes)
    return r.emit()


def heading_text(node):
    return inline_md(node.kids, plain=True)


def code_text(p):
    r = plain_text(p)
    r = re.sub(r"[ \t\r\n]+", " ", r.replace("\n", "\x00")).replace("\x00", "\n") if False else r
    # raw HTML line breaks are whitespace; explicit <br> became "\n" in plain_text only when real
    # (we cannot tell them apart there), so rebuild from the tree
    out = []

    def rec(nodes):
        for k in nodes:
            if isinstance(k, str):
                out.append(re.sub(r"[ \t\r\n]+", " ", k))
            elif is_noise(k):
                continue
            elif k.tag == "br":
                out.append("\n")
            else:
                rec(k.kids)

    rec(p.kids)
    s = "".join(out).strip(" ")  # raw HTML whitespace at the edges is not content (indentation is nbsp)
    s = s.translate(PROSE_TABLE)  # nbsp -> space (indentation), curly quotes -> straight
    s = s.replace("—", "--").replace("–", "-")  # Word auto-correct inside examples
    return s.rstrip()


def margin_left_pt(style):
    m = re.search(r"margin-left:\s*(-?[\d.]+)(in|pt)", style or "")
    if not m:
        return 0.0
    v = float(m.group(1))
    return v * 72 if m.group(2) == "in" else v


def split_bullet(p):
    """Return (marker, level, rest_nodes) when paragraph p starts with a typed list marker."""
    kids = list(p.kids)
    while kids and isinstance(kids[0], str) and not kids[0].strip(" \t\r\n"):
        kids.pop(0)
    if not kids or not isinstance(kids[0], Node) or kids[0].tag != "span":
        return None
    first = kids[0]
    t = plain_text(first)
    styles = first.get("style") + " " + " ".join(n.get("style") for n in iter_nodes(first))
    m = BULLET_RE.match(t)
    if m and (m.group(1) != "o" or re.search(r"Courier", styles)):
        ch = m.group(1)
        level = {"o": 1, "§": 2, "": 2, "▪": 2}.get(ch, 0)
        ml = margin_left_pt(p.get("style"))
        if level == 0 and ml >= 70:
            level = 1
        return ("-", level, kids[1:])
    m = NUM_RE.match(t)
    if m and len(t) < 12:
        return (m.group(1) + ".", 0, kids[1:])
    return None


class OasisConverter:
    """Walks the Word-export tree and yields items:
        ("heading", depth, number, title, anchor, anchors)
        ("xheading", depth, title)            appendix / notices style headings
        ("block", md, n_code, n_tables)       one Markdown block (paragraph, list, code, table)
    """

    def __init__(self, warn, doc_id):
        self.warn = warn
        self.doc = doc_id
        self.items = []
        self.code_lines = None  # list when collecting a code group
        self.list_lines = None
        self.classes = Counter()
        self.span_classes = Counter()
        self.stray = Counter()

    # ---- grouping helpers
    def flush(self):
        self.flush_code()
        self.flush_list()

    def flush_code(self):
        if self.code_lines is not None:
            lines = self.code_lines
            self.code_lines = None
            while lines and not lines[0].strip():
                lines.pop(0)
            while lines and not lines[-1].strip():
                lines.pop()
            if lines:
                text = "\n".join(lines)
                self.items.append(("block", f"```{guess_lang(text)}\n{text}\n```", 1, 0))

    def flush_list(self):
        if self.list_lines is not None:
            lines = self.list_lines
            self.list_lines = None
            self.items.append(("block", "\n".join(lines), 0, 0))

    def emit_block(self, md, n_code=0, n_tables=0):
        self.flush()
        if md.strip():
            self.items.append(("block", md, n_code, n_tables))

    # ---- walk
    def walk(self, node, in_cell=False, out=None):
        for k in node.kids:
            if isinstance(k, str):
                if k.strip(" \t\r\n\xa0"):
                    self.stray[k.strip()[:60]] += 1
                    self.emit_block(norm_text(re.sub(r"\s+", " ", k)).strip())
                continue
            self.node(k, in_cell)

    def node(self, k, in_cell):
        t = k.tag
        if t in ("h1", "h2", "h3", "h4", "h5", "h6"):
            self.flush()
            self.heading(k)
        elif t in ("p", "pre"):
            self.paragraph(k, in_cell)
        elif t in ("ul", "ol"):
            self.flush()
            lines = self.render_list(k, 0)
            if lines:
                self.items.append(("block", "\n".join(lines), 0, 0))
        elif t == "table":
            self.flush()
            md, = (self.table(k),)
            if md:
                self.items.append(("block", md, 0, 1))
        elif t == "div":
            grey = "D9D9D9" in k.get("style").upper()
            if grey:
                self.flush_code()
            self.walk(k, in_cell)
            if grey:
                self.flush_code()
        elif t in ("span", "a", "b", "i", "em", "strong", "font", "sup", "sub", "u"):
            md = inline_md([k])
            if md:
                self.emit_block(md)
        elif t in ("body", "o:p", "center", "section", "article", "blockquote", "tbody", "thead", "tr", "td", "th"):
            self.walk(k, in_cell)
        else:
            self.warn.add(f"{self.doc}: unknown block tag", f"<{t}> treated as container")
            self.walk(k, in_cell)

    def heading(self, h):
        text = heading_text(h)
        anchors = [n.get("name") for n in iter_nodes(h) if n.tag == "a" and n.get("name")]
        anchor = next((a for a in anchors if a.startswith("sec_")), None)
        if anchor is None:
            anchor = next((a for a in anchors if not a.startswith(("_Toc", "_Ref"))), None)
        depth = int(h.tag[1])
        m = re.match(r"^(\d+(?:\.\d+)*)\.?\s+(.*)$", text)
        if m:
            self.items.append(("heading", depth, m.group(1), m.group(2).strip(), anchor, anchors))
        else:
            self.items.append(("xheading", depth, text))
            self.warn.add(f"{self.doc}: heading without number", f"h{depth} '{text}'")

    def paragraph(self, p, in_cell):
        cls = p.cls
        kind = classify_p(cls)
        self.classes[cls] += 1
        for n in iter_nodes(p):
            if n.tag == "span" and n.cls:
                self.span_classes[n.cls] += 1
        if kind is None and cls:
            self.warn.add(f"{self.doc}: unclassified paragraph class", f"class '{cls}' treated as plain paragraph")
        if kind in ("MsoToc", "MsoTof"):
            return
        if kind in ("Code", "SourceCode"):
            if in_cell:
                txt = code_text(p).strip()
                if txt:
                    self.emit_block(f"`{txt}`" if "`" not in txt else f"``{txt}``")
                return
            self.flush_list()
            if self.code_lines is None:
                self.code_lines = []
            self.code_lines.extend(code_text(p).split("\n") if p.kids else [""])
            return
        if kind == "AppendixHeading":
            self.flush()
            self.items.append(("xheading", 1, heading_text(p)))
            return
        if kind == "Notices":
            self.flush()
            self.items.append(("xheading", 1, heading_text(p)))
            return
        self.flush_code()
        sb = split_bullet(p)
        if sb:
            marker, level, rest = sb
            text = inline_md(rest)
            if not text:
                return
            if self.list_lines is None:
                self.list_lines = []
            self.list_lines.append("  " * level + f"{marker} {text}" if marker == "-" else "  " * level + f"{marker} {text}")
            return
        text = inline_md(p.kids)
        if not text:
            return
        self.flush_list()
        if kind in ("ObjectHeading", "MemberHeading"):
            text = f"**{text}**"
        self.emit_block(text)

    # ---- lists
    def render_list(self, lst, depth):
        lines = []
        ordered = lst.tag == "ol"
        n = 0
        for li in lst.kids:
            if not isinstance(li, Node) or li.tag != "li":
                continue
            n += 1
            inline_kids = [x for x in li.kids if not (isinstance(x, Node) and x.tag in ("ul", "ol"))]
            text = inline_md(inline_kids)
            marker = f"{n}." if ordered else "-"
            if text:
                lines.append("  " * depth + f"{marker} {text}")
            for x in li.kids:
                if isinstance(x, Node) and x.tag in ("ul", "ol"):
                    lines += self.render_list(x, depth + 1)
        return lines

    # ---- tables
    def table(self, t):
        rows = []  # list of (is_head, [cells])
        for tr in [n for n in iter_nodes(t) if n.tag == "tr"]:
            in_thead = False
            cells = []
            for td in tr.kids:
                if not isinstance(td, Node) or td.tag not in ("td", "th"):
                    continue
                cells.append(self.cell(td))
            head = any(a.tag == "thead" for a in self.ancestors(t, tr))
            if cells:
                rows.append((head, cells))
        if not rows:
            return ""
        ncols = max(sum(c[1] for c in cells) for _, cells in rows)
        grid = []
        for head, cells in rows:
            r = []
            for text, span, allbold in cells:
                r.append(text)
                r.extend([""] * (span - 1))
            r += [""] * (ncols - len(r))
            grid.append((head, r, [c[2] for c in cells]))
        header = None
        if grid[0][0] or (all(b for b in grid[0][2] if True) and any(grid[0][1])):
            header = grid[0][1]
            body = [g[1] for g in grid[1:]]
        else:
            body = [g[1] for g in grid]
        header_rows_extra = [g[1] for g in grid[1:] if g[0]]
        if header_rows_extra:
            body = [g[1] for g in grid[1:] if not g[0]]
            body = header_rows_extra + body
        simple = all("\n" not in c for r in ([header] if header else []) + body for c in r)
        out = []
        if simple:
            hdr = header or [""] * ncols
            esc = lambda c: c.replace("|", "\\|")
            out.append("| " + " | ".join(esc(h) for h in hdr) + " |")
            out.append("|" + "---|" * ncols)
            for r in body:
                out.append("| " + " | ".join(esc(c) for c in r) + " |")
        else:
            hdr = header or [f"Column {i + 1}" for i in range(ncols)]
            for r in body:
                first = True
                for h, c in zip(hdr, r):
                    if not c:
                        continue
                    if "\n" in c:
                        ind = "    " if first else "      "
                        parts = [x for x in c.split("\n") if x.strip()]
                        c2 = "\n".join(ind + (x if x.lstrip().startswith(("- ", "1. ")) else "- " + x) for x in parts)
                        out.append(f"{'- ' if first else '  - '}**{h}**:\n{c2}")
                    else:
                        out.append(f"{'- ' if first else '  - '}**{h}**: {c}")
                    first = False
        return "\n".join(out)

    def ancestors(self, root, target):
        path = []

        def rec(n):
            if n is target:
                return True
            for k in n.kids:
                if isinstance(k, Node):
                    path.append(k)
                    if rec(k):
                        return True
                    path.pop()
            return False

        rec(root)
        return path

    def cell(self, td):
        span = int(re.sub(r"\D", "", td.get("colspan") or "1") or 1)
        if td.get("rowspan") and td.get("rowspan") != "1":
            self.warn.add(f"{self.doc}: table rowspan", "a table cell uses rowspan; check the table")
        sub = OasisConverter(self.warn, self.doc)
        sub.walk(td, in_cell=True)
        sub.flush()
        blocks = [i[1] for i in sub.items if i[0] == "block"]
        text = "\n".join(blocks)
        # is the cell entirely bold (header-like)?
        runs = Runs()
        runs.walk(td.kids)
        txt_runs = [(t, s) for t, s in runs.runs if t.strip(" \n")]
        allbold = bool(txt_runs) and all(s in ("b", "bi") for _, s in txt_runs)
        if allbold:
            text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
        return (text.replace("|", "\\|") if False else text, span, allbold or not txt_runs)


def convert_oasis(raw_bytes, doc_id, warn):
    text = raw_bytes.decode("cp1252", errors="replace")
    bad = text.count("�")
    if bad:
        warn.add(f"{doc_id}: decoding", f"{bad} undecodable byte(s) replaced by U+FFFD")
    root = parse_html(text)
    body = find(root, "body") or root
    conv = OasisConverter(warn, doc_id)
    conv.walk(body)
    conv.flush()
    n_html = len([n for n in iter_nodes(body) if n.tag == "table"])
    n_conv = sum(i[3] for i in conv.items if i[0] == "block")
    conv.table_note = f"tables in the HTML: {n_html}; converted (incl. excluded parts): {n_conv}"
    if conv.stray:
        warn.add(f"{doc_id}: stray text at block level",
                 f"{sum(conv.stray.values())} stray text run(s), e.g. '{next(iter(conv.stray))}'")
    return conv


# ============================================================ outline (shared)

class Frag:
    """One outline node while building."""

    def __init__(self, fid, origin, title, depth, version):
        self.id = fid
        self.origin = origin
        self.title = title
        self.depth = depth
        self.version = version
        self.number = None
        self.src = None
        self.anchor = None
        self.ms_date = None
        self.parent = None
        self.children = []
        self.items = []     # own content items: ("block", md, nc, nt) or ("sub", depth, title)
        self.text_own = ""
        self.text_total = ""


EXCLUDED_TITLE = re.compile(r"^(IPR Policy|(Non-?)?Normative References|References|Acknowledg(e)?ments|"
                            r"Revision History|Notices|Table of Contents|Contents)$", re.I)


def build_oasis_nodes(conv, doc_id, version, warn):
    """Items -> Frag list (document order) plus an exclusion report."""
    frags = []
    stack = []
    excl_depth = None
    excl_label = None
    excluded = []  # (label, lines)
    front_lines = 0
    seen_heading = False
    cur = None
    cur_excl = None
    ids = set()

    def close_excl():
        nonlocal cur_excl
        cur_excl = None

    for it in conv.items:
        kind = it[0]
        if kind in ("heading", "xheading"):
            depth = it[1]
            seen_heading = True
            if excl_depth is not None and depth > excl_depth and kind == "heading":
                excluded[-1][1].append(f"{it[2]} {it[3]}")
                continue
            excl_depth = None
            cur_excl = None
            if kind == "xheading":
                excl_depth = 1
                excluded.append([f"{it[2]}", []])
                cur = None
                continue
            _, depth, number, title, anchor, anchors = it
            top = number.split(".")[0]
            if top == "1" or EXCLUDED_TITLE.match(title):
                excl_depth = depth
                excluded.append([f"{number} {title}", []])
                cur = None
                continue
            if depth > MAX_DEPTH:
                if cur is not None:
                    cur.items.append(("sub", depth, title))
                continue
            fid = f"{doc_id}-{number}"
            if fid in ids:
                warn.add(f"{doc_id}: duplicate section number", f"{number} '{title}' (kept as '{fid}-dup')")
                fid += "-dup"
            ids.add(fid)
            f = Frag(fid, doc_id, title, depth, version)
            f.number = number
            f.anchor = anchor
            while stack and stack[-1].depth >= depth:
                stack.pop()
            if stack:
                f.parent = stack[-1]
                stack[-1].children.append(f)
            stack.append(f)
            frags.append(f)
            cur = f
        else:
            if excl_depth is not None:
                continue
            if cur is None:
                if not seen_heading:
                    front_lines += it[1].count("\n") + 1
                continue
            cur.items.append(it)
    return frags, excluded, front_lines


def render_items(items, root_depth, own_depth):
    """Markdown of a list of items; headings relative to root_depth (root = '#')."""
    parts = []
    for it in items:
        if it[0] == "block":
            parts.append(it[1].rstrip("\n"))
        elif it[0] == "sub":
            parts.append("#" * min(6, it[1] - root_depth + 1) + " " + it[2])
        elif it[0] == "head":
            parts.append("#" * min(6, it[1] - root_depth + 1) + " " + it[2])
    return "\n\n".join(p for p in parts if p.strip())


def finalize_texts(frags):
    """Fill text_own/text_total, line counts and code/table counts."""
    by_id = {f.id: f for f in frags}
    index = {f.id: i for i, f in enumerate(frags)}

    def subtree(f):
        out = [f]
        for c in f.children:
            out += subtree(c)
        return out

    stats = {}
    for f in frags:
        head = ("head", f.depth, f.title)
        own_items = [head] + f.items
        f.text_own = render_items(own_items, f.depth, f.depth) + "\n"
        nc = sum(i[2] for i in f.items if i[0] == "block")
        nt = sum(i[3] for i in f.items if i[0] == "block")
        stats[f.id] = (nc, nt)
    for f in frags:
        nodes = sorted(subtree(f), key=lambda x: index[x.id])
        items = []
        for n in nodes:
            items.append(("head", n.depth, n.title))
            items += n.items
        f.text_total = render_items(items, f.depth, f.depth) + "\n"
        f.code_total = sum(stats[n.id][0] for n in nodes)
        f.tables_total = sum(stats[n.id][1] for n in nodes)
        f.code_own, f.tables_own = stats[f.id]


def nlines(text):
    return text.count("\n") if text.endswith("\n") else text.count("\n") + 1


# ============================================================ Microsoft Learn Markdown

FENCE_RE = re.compile(r"^(\s*)(```+|~~~+)\s*([^\s`]*)\s*(.*)$")
ALERT_RE = re.compile(r"^(\s*>\s*)\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*$", re.I)
INLINE_CODE = re.compile(r"(`+)(.+?)\1")
TABLE_SEP = re.compile(r"^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$")
ALERT_NAMES = {"NOTE": "Note", "TIP": "Tip", "IMPORTANT": "Important", "WARNING": "Warning", "CAUTION": "Caution"}


def strip_md_links(line, warn, where):
    """Images removed, links replaced by their text, outside inline code."""
    pieces = []
    last = 0
    for m in INLINE_CODE.finditer(line):
        pieces.append((False, line[last:m.start()]))
        pieces.append((True, m.group(0)))
        last = m.end()
    pieces.append((False, line[last:]))
    out = []
    for is_code, seg in pieces:
        out.append(seg if is_code else _strip_links(seg, warn, where))
    return "".join(out)


def _strip_links(s, warn, where):
    # images: ![alt](target) or ![alt][ref]
    i = 0
    res = []
    n = len(s)
    while i < n:
        c = s[i]
        if c == "!" and i + 1 < n and s[i + 1] == "[":
            j = _match_bracket(s, i + 1)
            if j > 0:
                end = _link_target_end(s, j + 1)
                if end > 0:
                    i = end
                    continue
        if c == "[":
            j = _match_bracket(s, i)
            if j > 0:
                end = _link_target_end(s, j + 1)
                if end > 0:
                    res.append(_strip_links(s[i + 1:j], warn, where))
                    i = end
                    continue
        res.append(c)
        i += 1
    out = "".join(res)
    auto = re.compile(r"<https?://[^>\s]+>")
    found = len(auto.findall(out))
    if found:
        warn.add("ms: autolinks dropped", f"{where}: {found} autolink(s) removed")
        out = auto.sub("", out)
    return out


def _match_bracket(s, i):
    depth = 0
    for j in range(i, len(s)):
        if s[j] == "\\":
            continue
        if s[j] == "[":
            depth += 1
        elif s[j] == "]":
            depth -= 1
            if depth == 0:
                return j
    return -1


def _link_target_end(s, j):
    if j >= len(s):
        return -1
    if s[j] == "(":
        depth = 0
        for k in range(j, len(s)):
            if s[k] == "(":
                depth += 1
            elif s[k] == ")":
                depth -= 1
                if depth == 0:
                    return k + 1
        return -1
    if s[j] == "[":
        k = s.find("]", j)
        return k + 1 if k > 0 else -1
    return -1


def convert_ms_file(raw, rel, warn):
    """Returns (meta, items) where items are ("head", depth, title) / ("block", md, nc, nt) in order."""
    text = raw.decode("utf-8-sig").replace("\r\n", "\n").replace("\r", "\n")
    meta = {}
    lines = text.split("\n")
    if lines and lines[0].strip() == "---":
        end = next((i for i in range(1, len(lines)) if lines[i].strip() == "---"), None)
        if end:
            for ln in lines[1:end]:
                m = re.match(r"^([\w.\-]+):\s*(.*)$", ln)
                if m:
                    meta[m.group(1)] = m.group(2).strip().strip("'\"")
            lines = lines[end + 1:]
    out = []        # list of ("line", text) | ("head", depth, title)
    fence = None
    for ln in lines:
        m = FENCE_RE.match(ln)
        if fence is not None:
            out.append(("line", ln))
            if m and m.group(2)[0] == fence[0] and len(m.group(2)) >= len(fence) and not m.group(3):
                fence = None
            continue
        if m:
            lang = m.group(3).lower()
            body_first = None
            fence = m.group(2)
            out.append(("fence_open", ln, m))
            continue
        # outside fences
        if re.match(r"^\s*<!--.*-->\s*$", ln):
            continue
        if re.match(r"^\s*\[!INCLUDE|^\s*\[!code-|^\s*:::", ln):
            warn.add("ms: DocFx directives dropped", f"{rel}: '{ln.strip()[:70]}'")
            continue
        if re.match(r"^\[[^\]]+\]:\s+\S+", ln):  # reference-style link definition
            continue
        a = ALERT_RE.match(ln)
        if a:
            out.append(("line", f"{a.group(1)}**{ALERT_NAMES[a.group(2).upper()]}**"))
            continue
        h = re.match(r"^(#{1,6})\s+(.*?)\s*#*\s*$", ln)
        if h:
            title = strip_md_links(h.group(2), warn, rel)
            title = re.sub(r"\s*\{#[^}]*\}\s*$", "", title)
            title = re.sub(r"\s+", " ", title.replace("**", "").replace("`", "")).strip()
            out.append(("head", len(h.group(1)), title))
            continue
        ln2 = strip_md_links(ln, warn, rel)
        ln2 = re.sub(r"(?<!`)`([^`]+)`(?!`)", lambda m: "`" + m.group(1).strip() + "`", ln2)
        ln2 = re.sub(r"<br\s*/?>", " ", ln2, flags=re.I)
        ln2 = re.sub(r"<a\s+name=\"[^\"]*\"\s*>\s*</a>", "", ln2)
        if re.search(r"</?[a-zA-Z][^>]*>", ln2) and not INLINE_CODE.search(ln2):
            warn.add("ms: raw HTML kept", f"{rel}: '{ln2.strip()[:70]}'")
        out.append(("line", (norm_text(ln2) if not ln2.startswith("    ") else ln2.translate(PROSE_TABLE)).rstrip()))
    # second pass: build blocks (a fenced block is one block; other lines are grouped by blank lines)
    items = []
    buf = []
    in_fence = None
    fence_lines = []
    quirks = Counter()

    def flush_buf():
        nonlocal buf
        blocks = []
        cur = []
        for l in buf:
            if l.strip() == "":
                if cur:
                    blocks.append(cur)
                    cur = []
            else:
                cur.append(l)
        if cur:
            blocks.append(cur)
        for b in blocks:
            md = "\n".join(b)
            nt = 1 if (len(b) >= 2 and any(TABLE_SEP.match(x) for x in b) and "|" in md) else 0
            items.append(("block", md, 0, nt))
        buf = []

    for e in out:
        if in_fence is not None:
            if e[0] == "line":
                m = FENCE_RE.match(e[1])
                if m and m.group(2)[0] == in_fence[0] and len(m.group(2)) >= len(in_fence) and not m.group(3):
                    body = fence_lines
                    indent = fence_indent
                    text = "\n".join(body)
                    lang = fence_lang
                    if not lang:
                        lang = guess_lang(text.strip())
                        quirks["fence without language"] += 1
                    flush_buf()
                    items.append(("block", f"{indent}```{lang}\n{text}\n{indent}```", 1, 0))
                    in_fence = None
                    continue
                fence_lines.append(e[1].translate(PROSE_TABLE) if False else e[1])
            continue
        if e[0] == "fence_open":
            m = e[2]
            in_fence = m.group(2)
            fence_indent = m.group(1)
            fence_lang = m.group(3).lower()
            if m.group(4):
                quirks["fence info string dropped"] += 1
            fence_lines = []
            continue
        if e[0] == "head":
            flush_buf()
            items.append(("head", e[1], e[2]))
            continue
        buf.append(e[1])
    flush_buf()
    if in_fence is not None:
        warn.add("ms: unterminated fence", rel)
    for q, n in quirks.items():
        warn.add(f"ms: {q}", f"{rel}: {n}")
    return meta, items


def build_ms_nodes(meta_items, version, warn):
    """meta_items: list of (rel, stem, meta, items) -> Frag list."""
    frags = []
    for rel, stem, meta, items in meta_items:
        ftitle = meta.get("title", stem)
        fid = f"ms-{stem}"
        f = Frag(fid, "ms", ftitle, 1, version)
        f.src = rel
        f.ms_date = meta.get("ms.date")
        frags.append(f)
        cur = f
        used = set()
        seen_h1 = False
        for it in items:
            if it[0] == "head":
                depth, title = it[1], it[2]
                if depth == 1 and not seen_h1 and cur is f and not f.items:
                    seen_h1 = True
                    f.title = title or ftitle
                    continue
                if depth == 2:
                    s = slug(title) or "section"
                    sid = f"{fid}--{s}"
                    k = 2
                    while sid in used:
                        sid = f"{fid}--{s}-{k}"
                        k += 1
                    used.add(sid)
                    c = Frag(sid, "ms", title, 2, version)
                    c.src = rel
                    c.parent = f
                    f.children.append(c)
                    frags.append(c)
                    cur = c
                    continue
                cur.items.append(("sub", depth, title))
            else:
                cur.items.append(it)
    return frags


# ============================================================ sources

def fetch_oasis(pins, cache, network, warn):
    cache.mkdir(parents=True, exist_ok=True)
    out = OrderedDict()
    for did, d in pins["oasis"]["docs"].items():
        path = cache / f"{did}.html"
        if not path.exists():
            if not network:
                sys.exit(f"--no-network: {path} is missing from the cache")
            req = urllib.request.Request(d["url"], headers={"User-Agent": "sbo-b1-tools-extract/1"})
            with urllib.request.urlopen(req, timeout=120) as r:
                path.write_bytes(r.read())
            print(f"downloaded {d['url']}")
        out[did] = path.read_bytes()
    return out


def run_git(args, cwd):
    return subprocess.run(["git", *args], cwd=cwd, check=True, capture_output=True, text=True,
                          encoding="utf-8").stdout.strip()


def ensure_ms(pins, cache, network):
    ms = pins["ms"]
    repo = cache / "ms-repo"
    sha = ms["commit"]
    folder = ms["folder"]
    ok = False
    if (repo / ".git").exists():
        try:
            ok = run_git(["rev-parse", "HEAD"], repo) == sha and (repo / folder / "overview.md").exists()
        except subprocess.CalledProcessError:
            ok = False
    if not ok:
        if not network:
            sys.exit(f"--no-network: {repo} is missing or not at {sha}")
        if repo.exists():
            shutil.rmtree(repo, ignore_errors=True)
        repo.mkdir(parents=True)
        run_git(["init", "-q"], repo)
        run_git(["remote", "add", "origin", ms["repo"]], repo)
        run_git(["sparse-checkout", "set", "--no-cone", f"/{folder}/overview.md", f"/{folder}/concepts/*.md"], repo)
        run_git(["fetch", "-q", "--depth", "1", "--filter=blob:none", "origin", sha], repo)
        run_git(["checkout", "-q", "FETCH_HEAD"], repo)
        got = run_git(["rev-parse", "HEAD"], repo)
        if got != sha:
            sys.exit(f"git checkout gave {got}, expected {sha}")
        print(f"fetched {ms['repo']} at {sha[:7]}")
    return repo


def ms_files(pins, repo):
    ms = pins["ms"]
    base = repo / ms["folder"]
    skip = set(ms.get("skip", []))
    files = []
    for pat in ms["files"]:
        for p in sorted(base.glob(pat)):
            rel = p.relative_to(base).as_posix()
            if rel not in skip:
                files.append((rel, p))
    seen = set()
    out = []
    for rel, p in files:
        if rel not in seen:
            seen.add(rel)
            out.append((rel, p))
    return out


# ============================================================ Service Layer hits

HEADER_NAMES = {"etag", "if-match", "if-none-match", "prefer", "preference-applied", "retry-after", "location",
                "allow", "accept", "accept-language", "accept-charset", "vary", "cache-control", "authorization",
                "content-type", "content-id", "content-language", "content-length", "content-encoding",
                "content-location", "access-control-allow-origin", "set-cookie", "cookie", "if-modified-since",
                "if-unmodified-since", "last-modified", "isolation"}
STATUS = {100, 101, 200, 201, 202, 203, 204, 205, 206, 300, 301, 302, 303, 304, 307, 308, 400, 401, 403, 404,
          405, 406, 409, 410, 411, 412, 413, 414, 415, 416, 417, 422, 423, 424, 426, 428, 429, 431, 500, 501,
          502, 503, 504, 505}
TOKEN_RE = re.compile(r"^[\w$@.\-/*:=]+$")
STOP_TOKENS = {"null", "true", "false", "nan", "inf", "-inf", "id", "name", "type", "value"}


def kind_of_token(t):
    tl = t.lower()
    if t.startswith("$"):
        return 1
    if t.startswith("@") or re.match(r"^odata\.[\w.]+$", tl):
        return 1
    if tl in HEADER_NAMES or tl.startswith("odata-"):
        return 1
    if re.fullmatch(r"\d{3}", t) and int(t) in STATUS:
        return 1
    return 2


def extract_terms(frag_text, title):
    """Deterministic term list: [(term, tier, freq)]; at most MAX_TERMS, title first."""
    prose_lines, code_lines = [], []
    infence = False
    for ln in frag_text.split("\n"):
        if ln.lstrip().startswith("```"):
            infence = not infence
            continue
        (code_lines if infence else prose_lines).append(ln)
    prose = "\n".join(prose_lines)
    code = "\n".join(code_lines)
    cnt = Counter()
    # backticked tokens in prose
    for m in INLINE_CODE.finditer(prose):
        tok = m.group(2).strip()
        if 1 < len(tok) <= 40 and TOKEN_RE.match(tok) and tok.lower() not in STOP_TOKENS and not tok.isdigit():
            tok = tok.rstrip(".,;:")
            # header with value ("If-Match: *" is not matched by TOKEN_RE), keep the bare token
            cnt[tok] += 1
    # $options and @odata.* anywhere
    for m in re.finditer(r"(?<![\w$])\$[A-Za-z][A-Za-z0-9]*", frag_text):
        cnt[m.group(0)] += 1
    for m in re.finditer(r"@odata\.[A-Za-z][\w.]*", frag_text):
        cnt[m.group(0)] += 1
    # headers: "Name:" at line start in code, or OData-* anywhere
    for m in re.finditer(r"^([A-Za-z][A-Za-z-]*):", code, re.M):
        if m.group(1).lower() in HEADER_NAMES or m.group(1).lower().startswith("odata-"):
            cnt[m.group(1)] += 1
    for m in re.finditer(r"\bOData-[A-Za-z]+\b", frag_text):
        cnt[m.group(0)] += 1
    # status codes: backticked, or "HTTP/1.1 412", or "412 Precondition Failed"
    for m in re.finditer(r"(?<![\w.$/-])([1-5]\d\d)(?=\s+[A-Z][a-z]|\b)", frag_text):
        n = int(m.group(1))
        if n in STATUS:
            after = frag_text[m.end():m.end() + 25]
            before = frag_text[max(0, m.start() - 12):m.start()]
            if re.match(r"\s+[A-Z][a-z]", after) or "`" in before[-1:] or "HTTP/" in before or "status" in before.lower():
                cnt[m.group(1)] += 1
    # merge case variants of header tokens: keep the first seen spelling per lowercase key
    merged = {}
    for t, c in cnt.items():
        key = t.lower()
        if key in merged:
            old_t, old_c = merged[key]
            keep = old_t if (old_c, old_t) >= (c, t) else t
            merged[key] = (keep, old_c + c)
        else:
            merged[key] = (t, c)
    ranked = sorted(((kind_of_token(t), -c, t) for t, c in merged.values()))
    terms = [(title, 0, 0)]
    for tier, negc, t in ranked:
        if len(terms) >= MAX_TERMS:
            break
        if t.lower() == title.lower():
            continue
        terms.append((t, tier, -negc))
    return terms


class SLIndex:
    def __init__(self, sl_dir, warn):
        self.hojas = []  # (rel, body_lower, headings_lower)
        ref = sl_dir / "reference"
        if not ref.exists():
            warn.add("sl-hits", f"{ref} not found: SL columns left empty")
            return
        for p in sorted(ref.rglob("*.md")):
            rel = p.relative_to(ref).as_posix()
            if rel.startswith("odata/"):
                continue
            txt = p.read_text(encoding="utf-8", errors="replace").replace("\r\n", "\n")
            heads = []
            for ln in txt.split("\n"):
                if re.match(r"^#{1,6}\s", ln) or ln.startswith("title:"):
                    heads.append(ln.lower())
            self.hojas.append((rel, txt.lower(), "\n".join(heads)))
        self.cache = {}

    def lookup(self, term):
        if term in self.cache:
            return self.cache[term]
        t = term.lower()
        rx = re.compile(r"(?<![\w$@.-])" + re.escape(t) + r"(?![\w-])")
        n = 0
        best = (0, "")
        defs = []
        for rel, body, heads in self.hojas:
            c = len(rx.findall(body))
            if c:
                n += 1
                if c > best[0]:
                    best = (c, rel)
                if rx.search(heads):
                    defs.append(rel)
        res = (n, best[1], defs)
        self.cache[term] = res
        return res


# ============================================================ main

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--pins", default=str(DEFAULT_PINS))
    ap.add_argument("--work", default=str(DEFAULT_WORK))
    ap.add_argument("--sl", default=str(DEFAULT_SL))
    ap.add_argument("--no-network", action="store_true", help="use only WORK/_cache")
    a = ap.parse_args()

    pins_path = Path(a.pins)
    pins = json.loads(pins_path.read_text(encoding="utf-8"))
    work = Path(a.work)
    sl = Path(a.sl)
    cache = work / "_cache"
    warn = Warnings()
    work.mkdir(parents=True, exist_ok=True)

    old_manifest = None
    mp = work / "manifest.json"
    if mp.exists():
        try:
            old_manifest = json.loads(mp.read_text(encoding="utf-8"))
        except ValueError:
            old_manifest = None

    # wipe everything but _cache
    for p in sorted(work.iterdir()):
        if p.name == "_cache":
            continue
        if p.is_dir():
            for f in p.iterdir():
                f.unlink()
        else:
            p.unlink()
    (work / "sections").mkdir(exist_ok=True)

    network = not a.no_network
    oasis_raw = fetch_oasis(pins, cache, network, warn)
    repo = ensure_ms(pins, cache, network)
    ms_list = ms_files(pins, repo)
    version_oasis = pins["oasis"]["version"]
    version_ms = pins["ms"]["short"]

    manifest = OrderedDict()
    manifest["script_version"] = SCRIPT_VERSION
    manifest["retrieved"] = pins["retrieved"]
    manifest["pins_sha256"] = sha256(pins_path.read_bytes())
    manifest["oasis"] = OrderedDict()
    for did, d in pins["oasis"]["docs"].items():
        manifest["oasis"][did] = {"title": d["title"], "url": d["url"], "version": version_oasis,
                                  "sha256": sha256(oasis_raw[did]), "bytes": len(oasis_raw[did])}
    manifest["ms"] = OrderedDict(repo=pins["ms"]["repo"], commit=pins["ms"]["commit"], license=pins["ms"]["license"],
                                 files=OrderedDict())
    for rel, p in ms_list:
        manifest["ms"]["files"][f"{pins['ms']['folder']}/{rel}"] = sha256(p.read_bytes())
    if old_manifest and old_manifest.get("script_version") == SCRIPT_VERSION:
        for did, d in manifest["oasis"].items():
            o = old_manifest.get("oasis", {}).get(did)
            if o and o.get("sha256") != d["sha256"]:
                warn.add("source changed", f"{did}: downloaded HTML sha256 differs from the previous run's manifest")
        for fk, h in manifest["ms"]["files"].items():
            o = old_manifest.get("ms", {}).get("files", {}).get(fk)
            if o and o != h:
                warn.add("source changed", f"{fk}: sha256 differs from the previous run's manifest")

    frags = []
    conv_classes = {}
    excl_report = []
    for did, d in pins["oasis"]["docs"].items():
        conv = convert_oasis(oasis_raw[did], did, warn)
        fr, excluded, front = build_oasis_nodes(conv, did, version_oasis, warn)
        frags += fr
        conv_classes[did] = (conv.classes, conv.span_classes, conv.table_note)
        excl_report.append((did, excluded, front))
    ms_items = []
    for rel, p in ms_list:
        stem = Path(rel).stem
        meta, items = convert_ms_file(p.read_bytes(), f"{pins['ms']['folder']}/{rel}", warn)
        ms_items.append((f"{pins['ms']['folder']}/{rel}", stem, meta, items))
    frags += build_ms_nodes(ms_items, version_ms, warn)
    finalize_texts(frags)

    # ---- write sections
    for f in frags:
        write_text(work / "sections" / f"{f.id}.md", f.text_total)

    # ---- outline
    nodes = []
    for f in frags:
        n = OrderedDict()
        n["id"] = f.id
        n["origin"] = f.origin
        n["version"] = f.version
        n["title"] = f.title
        if f.number is not None:
            n["number"] = f.number
        if f.src is not None:
            n["src"] = f.src
        if f.ms_date:
            n["ms_date"] = f.ms_date
        n["level"] = f.depth
        n["parent"] = f.parent.id if f.parent else None
        n["children"] = [c.id for c in f.children]
        if f.anchor:
            n["anchor"] = f.anchor
        n["lines_own"] = nlines(f.text_own)
        n["lines_total"] = nlines(f.text_total)
        n["code_blocks"] = f.code_total
        n["tables"] = f.tables_total
        n["code_blocks_own"] = f.code_own
        n["tables_own"] = f.tables_own
        n["file"] = f"sections/{f.id}.md"
        nodes.append(n)
    write_text(work / "outline.json", json.dumps({"nodes": nodes}, indent=1, ensure_ascii=False) + "\n")
    write_text(work / "manifest.json", json.dumps(manifest, indent=1, ensure_ascii=False) + "\n")

    # ---- sl-hits and skim
    sli = SLIndex(sl, warn)
    hit_lines = ["# Service Layer hits per fragment", "",
                 "Terms per fragment: title, `$options`, `@odata.*`, header names, HTTP status codes and backticked tokens "
                 f"(at most {MAX_TERMS}, most telling first). For each term: n = number of SL hojas under reference/ that "
                 "contain it, top = the SL hoja with most occurrences, def = SL hojas with the term in a heading "
                 "(the topic is explained there). Terms SL never mentions (n=0) are only counted in the header line. A gap is a term with n>0 and no def.",
                 f"SL hojas scanned: {len(sli.hojas)}", ""]
    summary = {}
    for f in frags:
        terms = extract_terms(f.text_total, f.title)
        n_in = n_def = n_gap = 0
        body = []
        for term, tier, freq in terms:
            n, top, defs = sli.lookup(term)
            if n:
                n_in += 1
                if defs:
                    n_def += 1
                else:
                    n_gap += 1
            if not n:
                continue
            line = f"- {term} n={n} top={top}"
            if defs:
                shown = ",".join(defs[:2]) + (f" +{len(defs) - 2}" if len(defs) > 2 else "")
                line += f" def={shown}"
            body.append(line)
        absent = len(terms) - n_in
        hit_lines.append(f"## {f.id} | {f.title} | {nlines(f.text_total)} lines | terms {len(terms)}, in SL {n_in}, not in SL {absent}")
        hit_lines += body
        hit_lines.append("")
        summary[f.id] = (len(terms), n_in, n_def, n_gap)
    write_text(work / "sl-hits.md", "\n".join(hit_lines).rstrip() + "\n")

    skim = ["# Fragment skim", "",
            "One row per fragment, in document order. lines/code/tables cover the fragment and its descendants. "
            f"BIG = over {BIG_FRAGMENT} lines: the planner should list its children instead. "
            "SL = terms checked / in SL / defined in an SL heading / gap (in SL, no heading).", "",
            "| id | title | lvl | lines | code | tables | flag | SL |", "|---|---|---|---|---|---|---|---|"]
    for f in frags:
        tot = nlines(f.text_total)
        flag = "BIG" if tot > BIG_FRAGMENT else ""
        tc, ni, nd, ng = summary[f.id]
        skim.append(f"| {f.id} | {f.title.replace('|', '/')} | {f.depth} | {tot} | {f.code_total} | {f.tables_total} | "
                    f"{flag} | {tc}/{ni}/{nd}/{ng} |")
    write_text(work / "skim.md", "\n".join(skim) + "\n")

    # ---- warnings
    header = ["## Excluded from the outline (by design)", ""]
    for did, excluded, front in excl_report:
        header.append(f"### {did}")
        header.append(f"- front matter before the first heading (title page, abstract, status, table of contents): "
                      f"{front} lines dropped")
        for label, kids in excluded:
            more = f" (children: {', '.join(kids)})" if kids else ""
            header.append(f"- {label}{more}")
        header.append("")
    for did, (classes, spans, tnote) in conv_classes.items():
        header.append(f"### {did}: paragraph classes seen ({tnote})")
        header.append("- " + ", ".join(f"{c or '(none)'}={n}" for c, n in sorted(classes.items())))
        header.append("")
    header += ["## Conversion notes", "",
               "- Chapter 1 (Introduction: IPR policy, terminology, references, typographical conventions) is excluded in every OASIS document.",
               "- Curly quotes and non-breaking spaces are normalised to ASCII; code indentation made of non-breaking spaces becomes spaces.",
               "- Cross references such as 'see Section 11.4.3' are kept as written; transcribers replace them.",
               "- Known quirks of the Word export: some Courier spans cover a whole phrase (a sentence in code formatting) or end next to a quote; "
               "Word auto-correct turned `--` into an en or em dash inside examples (restored in code blocks only); "
               "example blocks that start with a request line, headers and a body are tagged http; URL-only example blocks are tagged text.",
               "- Source defects seen in the Microsoft files: JSON examples with unescaped quotes (for instance an etag value written as W/ followed by a quoted string inside a quoted string) and `......` placeholders; copied verbatim.",
               "- Table cells with several paragraphs are rendered as '- **Header**: value' rows instead of a pipe table; tables without a bold header row get an empty header row.",
               "- Headings deeper than level 3 are not nodes; they appear as sub-headings inside their level 3 fragment.",
               "- Code language is guessed by a fixed rule (http, json, xml, abnf, else text); mixed blocks (a request line followed by a JSON body) are tagged http.",
               ""]
    warn.write(work / "warnings.md", header)

    print("origin      nodes  big(>%d)  code  tables" % BIG_FRAGMENT)
    for o in ("oasis-p1", "oasis-p2", "oasis-json", "oasis-csdl", "ms"):
        fs = [f for f in frags if f.origin == o]
        print("%-11s %5d  %8d  %4d  %6d" % (o, len(fs), sum(1 for f in fs if nlines(f.text_total) > BIG_FRAGMENT),
                                          sum(f.code_own for f in fs), sum(f.tables_own for f in fs)))
    print(f"total nodes: {len(frags)}  warning groups: {len(warn.sections)}  output: {work}")


if __name__ == "__main__":
    main()
