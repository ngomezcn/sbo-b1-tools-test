#!/usr/bin/env python3
"""Checks for one bloque of the sección externa reference/odata/ (build-docs-from-odata skill).

Usage:
    python factory/scripts/verify_odata_block.py <bloque> [--docs DIR] [--ledger DIR] [--work DIR] [--sl DIR] [--pins PATH]
    python factory/scripts/verify_odata_block.py --all [...]

    --docs    Service Layer docs tree: reference/odata/<bloque>/ (default factory/docs-src/service-layer)
    --ledger  odata build ledger: PROGRESS.md, progress-parts/ (default factory/docs-src/odata-staging)
    --work    output of extract_odata.py: outline.json, sections/<id>.md (default factory/.work/odata)
    --sl      Service Layer docs, read-only, target of "In Service Layer:" lines (default factory/docs-src/service-layer)
    --pins    pins.json (default .claude/skills/build-docs-from-odata/pins.json)
    --all     every bloque folder under DOCS/reference/odata, plus the root index with its attribution block

Checks:
    frontmatter       title, source, summary; source = "external OData: <origin>@<version> <loc>[, <loc>] [+ ...]; retrieved <date>"
                      with known origins, versions equal to the pins and the pinned retrieved date
    fragments         every locator resolves to a fragment id in outline.json
    coverage          every fragment the ledger plan marks include/merge is cited (or an ancestor is); no hoja cites a
                      fragment decided exclude or planned in another bloque
    in-service-layer  line "In Service Layer:" right after the title; each path exists under --sl, or "no equivalent hoja"
    no-links-no-images  no images, no Markdown links (except in-page #anchors), no URLs in prose, no source hosts in code
    code              every fenced block has a language tag and is found verbatim in the cited fragments
    routing           bloque index.md exists, every hoja is linked from an index, the root index mentions the bloque
    size (warning)    hoja over 600 lines without an anchor index

Ledger: LEDGER/PROGRESS.md, or LEDGER/progress-parts/*<bloque>.md when it is absent. Plan format:
    ## Plan: <bloque>  ->  ### Fragment decisions  ->  table | fragment | decision | where / reason |
Exits 0 when every check passes, 1 otherwise.
"""
import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from verify_section import FENCE, MD_LINK, Report, body, read_frontmatter, squash  # noqa: E402

ORIGINS = ("oasis-p1", "oasis-p2", "oasis-json", "oasis-csdl", "ms")
SOURCE = re.compile(r"^external OData:\s*(?P<segs>.+?);\s*retrieved\s+(?P<date>\d{4}-\d{2}-\d{2})$")
SEG = re.compile(r"^(?P<origin>[\w-]+)@(?P<ver>\S+)\s+(?P<locs>.+)$")
OASIS_LOC = re.compile(r"^\d+(\.\d+)*$")
MS_LOC = re.compile(r"^[a-z0-9][a-z0-9_.-]*$")
MD_LINK_FULL = re.compile(r"(!?)\[[^\]]*\]\(([^)]*)\)")
URL_ANY = re.compile(r"https?://([^/\s:\"'<>)\]`]+)", re.I)
INLINE_CODE = re.compile(r"`[^`\n]*`")
FORBIDDEN_HOSTS = ("docs.oasis-open.org", "learn.microsoft.com", "docs.microsoft.com", "github.com", "www.oasis-open.org")
DECISIONS = ("include", "merge", "exclude")
DEFAULT_PINS = ".claude/skills/build-docs-from-odata/pins.json"


# ---------------------------------------------------------------- helpers
def fenced_with_lang(text):
    """[(language, content)] for every fenced block; list/blockquote prefixes removed from content."""
    out, cur, lang, prefix, fence = [], None, "", "", ""
    for line in text.splitlines():
        m = FENCE.match(line)
        if cur is None:
            if m:
                cur, prefix, fence = [], re.sub(r"\s", "", m.group("prefix")), m.group("fence")
                lang = line[m.end("fence"):].strip()
            continue
        if m and m.group("fence").startswith(fence) and line[m.end("fence"):].strip() == "":
            out.append((lang, "\n".join(cur)))
            cur = None
            continue
        b = line.lstrip()
        for ch in prefix:
            b = b[1:].lstrip() if b.startswith(ch) else b
        cur.append(b)
    if cur is not None:
        out.append((lang, "\n".join(cur)))
    return out


def prose(text):
    """Body text without fenced blocks and inline code."""
    keep, in_fence, fence = [], False, ""
    for line in body(text).splitlines():
        m = FENCE.match(line)
        if not in_fence:
            if m:
                in_fence, fence = True, m.group("fence")
                continue
            keep.append(INLINE_CODE.sub("", line))
        elif m and m.group("fence").startswith(fence) and line[m.end("fence"):].strip() == "":
            in_fence = False
    return "\n".join(keep)


def code_text(text):
    """Fenced blocks and inline code of the body, joined."""
    parts = [c for _, c in fenced_with_lang(body(text))]
    parts += [c for line in prose_lines_with_code(text) for c in INLINE_CODE.findall(line)]
    return "\n".join(parts)


def prose_lines_with_code(text):
    out, in_fence, fence = [], False, ""
    for line in body(text).splitlines():
        m = FENCE.match(line)
        if not in_fence:
            if m:
                in_fence, fence = True, m.group("fence")
            else:
                out.append(line)
        elif m and m.group("fence").startswith(fence) and line[m.end("fence"):].strip() == "":
            in_fence = False
    return out


def load_pins(path):
    """Tolerant reader: (retrieved, {origin: [accepted versions]}) or raises ValueError."""
    try:
        data = json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, ValueError) as e:
        raise ValueError(f"cannot read pins {path}: {e}")
    retrieved = data.get("retrieved")
    versions = {}
    oasis = data.get("oasis") or {}
    ms = data.get("ms") or {}
    for origin in ORIGINS:
        cands = []
        # real layout of pins.json: oasis.version + oasis.docs.<origin>, ms.short / ms.commit
        if origin in (oasis.get("docs") or {}) and isinstance(oasis.get("version"), str):
            cands.append(oasis["version"])
        if origin == "ms":
            if isinstance(ms.get("short"), str):
                cands.append(ms["short"])
            if isinstance(ms.get("commit"), str):
                cands.append(ms["commit"][:7])
        v = (data.get("versions") or {}).get(origin)
        if isinstance(v, str):
            cands.append(v)
        src = (data.get("sources") or {}).get(origin)
        if isinstance(src, str):
            cands.append(src)
        elif isinstance(src, dict):
            for k in ("version", "short"):
                if isinstance(src.get(k), str):
                    cands.append(src[k])
            if isinstance(src.get("commit"), str):
                cands.append(src["commit"][:7])
        versions[origin] = cands
    return retrieved, versions


def parse_source(source):
    """(segments [(origin, version, [locators])], date) or (None, error)."""
    m = SOURCE.match(source.strip())
    if not m:
        return None, "source must look like 'external OData: oasis-p1@v4.01-os 8.3.2, 8.3.3 + ms@3ca8f5b get-data; retrieved 2026-10-02'"
    segs = []
    for raw in m.group("segs").split(" + "):
        sm = SEG.match(raw.strip())
        if not sm:
            return None, f"bad source segment {raw.strip()!r}: expected '<origin>@<version> <locator>[, <locator>]'"
        locs = [x.strip() for x in sm.group("locs").split(",") if x.strip()]
        segs.append((sm.group("origin"), sm.group("ver"), locs))
    return (segs, m.group("date")), None


def ledger_text(ledger, bloque):
    progress = ledger / "PROGRESS.md"
    if progress.exists():
        return progress.read_text(encoding="utf-8")
    parts = sorted((ledger / "progress-parts").glob(f"*{bloque}.md")) if (ledger / "progress-parts").is_dir() else []
    return "\n".join(p.read_text(encoding="utf-8") for p in parts)


def plans(text):
    """{bloque: {fragment: decision}} from every '## Plan: <bloque>' / '### Fragment decisions' table."""
    result = {}
    for sect in re.split(r"(?m)^## (?=Plan:)", text)[1:]:
        head, _, rest = sect.partition("\n")
        name = head[len("Plan:"):].strip().strip("`")
        rest = re.split(r"(?m)^## ", rest)[0]
        dm = re.search(r"(?m)^### Fragment decisions\s*$", rest)
        if not dm:
            result[name] = {}
            continue
        block = re.split(r"(?m)^### ", rest[dm.end():])[0]
        rows = [l for l in block.splitlines() if l.strip().startswith("|")]
        decisions = {}
        for row in rows[2:]:
            cells = [c.strip().strip("`") for c in row.strip().strip("|").split("|")]
            if len(cells) < 2 or not cells[0]:
                continue
            words = re.split(r"[\s:(,→-]+", cells[1].lower().strip("*`"))
            dec = next((w for w in words if w in DECISIONS), None)
            if not dec:
                continue
            # First token is the fragment id; trailing notes like "(covers 2.1...)" are ignored.
            fid = re.split(r"[\s(]", cells[0], 1)[0].strip()
            if not fid or " " in fid or fid.lower() in ("fragment",):
                continue
            decisions[fid] = dec
        result[name] = decisions
    return result


class Tree:
    def __init__(self, nodes):
        self.parent = {n["id"]: n.get("parent") for n in nodes}

    def __contains__(self, fid):
        return fid in self.parent

    def covers(self, listed, target):
        """listed fragment is target itself or one of its ancestors."""
        if listed == target:
            return True
        cur, seen = self.parent.get(target), set()
        while cur and cur not in seen:
            if cur == listed:
                return True
            seen.add(cur)
            cur = self.parent.get(cur)
        return False


# ---------------------------------------------------------------- checks
def verify_bloque(bloque, docs, ledger, work, sl, pins_path, rep, root_index_required=False):
    root = docs / "reference" / "odata" / bloque
    warns = []
    hojas = sorted(p for p in root.rglob("*.md") if p.name != "index.md") if root.exists() else []
    if not hojas:
        rep.check(f"{bloque}: hojas", [f"no hojas under {root}"])
        return warns
    texts = {h: h.read_text(encoding="utf-8") for h in hojas}
    rel = {h: h.relative_to(docs / "reference" / "odata").as_posix() for h in hojas}

    try:
        retrieved, versions = load_pins(pins_path)
        pin_err = None
    except ValueError as e:
        retrieved, versions, pin_err = None, {}, str(e)
    try:
        nodes = json.loads((work / "outline.json").read_text(encoding="utf-8"))["nodes"]
        tree, outline_err = Tree(nodes), None
    except (OSError, ValueError, KeyError) as e:
        tree, outline_err = Tree([]), f"cannot read outline.json in {work}: {e}"

    # frontmatter -------------------------------------------------------
    problems = [pin_err] if pin_err else []
    cited = {}  # hoja -> [fragment ids]
    locs_by_hoja = {}
    for h, t in texts.items():
        meta = read_frontmatter(t)
        if meta is None:
            problems.append(f"{rel[h]}: no frontmatter")
            continue
        missing = [k for k in ("title", "source", "summary") if not meta.get(k)]
        if missing:
            problems.append(f"{rel[h]}: missing {', '.join(missing)}")
        if not meta.get("source"):
            continue
        parsed, err = parse_source(meta["source"])
        if err:
            problems.append(f"{rel[h]}: {err} (got {meta['source']!r})")
            continue
        segs, date = parsed
        if retrieved and date != retrieved:
            problems.append(f"{rel[h]}: retrieved {date}, pins say {retrieved}")
        ids = []
        for origin, ver, locs in segs:
            if origin not in ORIGINS:
                problems.append(f"{rel[h]}: unknown origin {origin!r} (known: {', '.join(ORIGINS)})")
                continue
            if versions:
                ok = [v for v in versions.get(origin, []) if v == ver or (origin == "ms" and len(ver) == 7 and v.startswith(ver))]
                if not ok:
                    problems.append(f"{rel[h]}: {origin}@{ver} does not match the pin {versions.get(origin) or 'none'}")
            for loc in locs:
                good = OASIS_LOC.match(loc) if origin.startswith("oasis") else MS_LOC.match(loc)
                if not good:
                    problems.append(f"{rel[h]}: bad locator {loc!r} for origin {origin}")
                    continue
                ids.append(f"{origin}-{loc}")
        cited[h] = ids
    rep.check(f"{bloque}: frontmatter", problems)

    # fragments ---------------------------------------------------------
    problems = [outline_err] if outline_err else []
    if not outline_err:
        for h, ids in cited.items():
            problems += [f"{rel[h]}: fragment {i} is not in outline.json" for i in ids if i not in tree]
    rep.check(f"{bloque}: fragments", problems)

    # coverage ----------------------------------------------------------
    problems = []
    plan_by_bloque = plans(ledger_text(ledger, bloque))
    if bloque not in plan_by_bloque:
        problems.append(f"no '## Plan: {bloque}' in ledger PROGRESS.md (or progress-parts/*{bloque}.md)")
    else:
        mine = plan_by_bloque[bloque]
        all_cited = [i for ids in cited.values() for i in ids]
        for frag, dec in mine.items():
            if dec in ("include", "merge") and not any(tree.covers(c, frag) or c == frag for c in all_cited):
                problems.append(f"{frag} is decided {dec} but no hoja cites it (or an ancestor)")
        for h, ids in cited.items():
            for c in ids:
                for frag, dec in mine.items():
                    if dec == "exclude" and tree.covers(frag, c):
                        # Parent may be exclude while children are decided individually.
                        if any(v in ("include", "merge") and (f == c or tree.covers(f, c))
                               for f, v in mine.items()):
                            continue
                        problems.append(f"{rel[h]}: cites {c}, decided exclude ({frag})")
                other = [b for b, d in plan_by_bloque.items() if b != bloque
                         and any(v in ("include", "merge") and tree.covers(f, c) for f, v in d.items())]
                in_mine = any(v in ("include", "merge") and (tree.covers(f, c) or tree.covers(c, f)) for f, v in mine.items())
                if other and not in_mine:
                    problems.append(f"{rel[h]}: cites {c}, which belongs to bloque {other[0]}")
                elif not in_mine and c in tree and not any(tree.covers(f, c) for f, v in mine.items() if v == "exclude"):
                    problems.append(f"{rel[h]}: cites {c}, which has no include/merge decision in the plan of {bloque}")
    rep.check(f"{bloque}: coverage", problems)

    # in-service-layer --------------------------------------------------
    problems = []
    for h, t in texts.items():
        lines = body(t).strip("\n").splitlines()
        i = next((k for k, l in enumerate(lines) if l.startswith("# ")), None)
        nxt = None
        if i is not None:
            nxt = next((l for l in lines[i + 1:] if l.strip()), None)
        if nxt is None or not nxt.startswith("In Service Layer:"):
            problems.append(f"{rel[h]}: the line 'In Service Layer:' must come right after the # title")
            continue
        value = nxt[len("In Service Layer:"):].strip()
        if value.startswith("no equivalent hoja"):
            continue
        for part in value.split(";"):
            part = part.strip().strip("`")
            if not part or part.lower().startswith("sl differs"):
                continue
            if "](" in part or not part.endswith(".md"):
                problems.append(f"{rel[h]}: In Service Layer value {part!r} must be a plain relative path or 'no equivalent hoja'")
            elif not (sl / part).is_file():
                problems.append(f"{rel[h]}: In Service Layer path {part} does not exist under {sl}")
    rep.check(f"{bloque}: in-service-layer", problems)

    # links, images, URLs -----------------------------------------------
    problems = []
    for h, t in texts.items():
        pr = prose(t)
        for bang, target in MD_LINK_FULL.findall(pr):
            if bang:
                problems.append(f"{rel[h]}: image ![...]({target}) not allowed")
            elif not target.startswith("#"):
                problems.append(f"{rel[h]}: link to {target} not allowed (only in-page #anchors)")
        for m in URL_ANY.finditer(pr):
            problems.append(f"{rel[h]}: URL {m.group(0)} in prose (put it in code or drop it)")
        for m in URL_ANY.finditer(code_text(t)):
            host = m.group(1).lower()
            if host in FORBIDDEN_HOSTS or host.endswith(".github.com"):
                problems.append(f"{rel[h]}: URL to source host {host} in code")
    rep.check(f"{bloque}: no-links-no-images", problems)

    # code --------------------------------------------------------------
    problems = []
    for h, t in texts.items():
        blocks = fenced_with_lang(body(t))
        hay = ""
        for fid in cited.get(h, []):
            f = work / "sections" / f"{fid}.md"
            if f.exists():
                hay += squash(f.read_text(encoding="utf-8"))
            elif fid in tree:
                problems.append(f"{rel[h]}: sections/{fid}.md missing in {work}")
        for n, (lang, content) in enumerate(blocks, 1):
            if not lang:
                problems.append(f"{rel[h]}: fenced block {n} has no language tag")
            if squash(content) not in hay:
                first = content.strip().splitlines()[0][:60] if content.strip() else ""
                problems.append(f"{rel[h]}: fenced block {n} ({first!r}) not found verbatim in the cited fragments")
    rep.check(f"{bloque}: code", problems)

    # routing -----------------------------------------------------------
    problems = []
    index = root / "index.md"
    if not index.exists():
        problems.append(f"{index} missing")
    linked = set()
    for idx in root.rglob("index.md"):
        for target in MD_LINK.findall(idx.read_text(encoding="utf-8")):
            linked.add((idx.parent / target).resolve())
    problems += [f"{rel[h]} is not linked from any index.md" for h in hojas if h.resolve() not in linked]
    problems += [f"subfolder {sub.relative_to(docs / 'reference' / 'odata').as_posix()} has no index.md"
                 for sub in root.rglob("*") if sub.is_dir() and not (sub / "index.md").exists()]
    root_index = docs / "reference" / "odata" / "index.md"
    if root_index.exists():
        if bloque not in root_index.read_text(encoding="utf-8"):
            problems.append(f"root reference/odata/index.md does not mention {bloque}")
    elif root_index_required:
        problems.append("root reference/odata/index.md missing")
    rep.check(f"{bloque}: routing", problems)

    # size (warning) ----------------------------------------------------
    for h, t in texts.items():
        if len(t.splitlines()) > 600 and "](#" not in t:
            warns.append(f"{rel[h]}: over 600 lines without an anchor index")
    return warns


def verify_root(docs, rep):
    idx = docs / "reference" / "odata" / "index.md"
    problems = []
    if not idx.exists():
        problems.append(f"{idx} missing")
    else:
        t = idx.read_text(encoding="utf-8")
        if "Attribution" not in t:
            problems.append("root index has no 'Attribution' block")
        if "OASIS" not in t or "Copyright" not in t:
            problems.append("root index attribution lacks the OASIS copyright notice")
    rep.check("root index: attribution", problems)


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("bloque", nargs="?")
    ap.add_argument("--docs", default="factory/docs-src/service-layer")
    ap.add_argument("--ledger", default="factory/docs-src/odata-staging")
    ap.add_argument("--work", default="factory/.work/odata")
    ap.add_argument("--sl", default="factory/docs-src/service-layer")
    ap.add_argument("--pins", default=DEFAULT_PINS)
    ap.add_argument("--all", action="store_true")
    a = ap.parse_args(argv)
    if not a.bloque and not a.all:
        ap.error("give a bloque or --all")
    docs, ledger, work, sl = Path(a.docs), Path(a.ledger), Path(a.work), Path(a.sl)
    rep, warns = Report(), []
    if a.all:
        base = docs / "reference" / "odata"
        bloques = sorted(p.name for p in base.iterdir() if p.is_dir()) if base.is_dir() else []
        if not bloques:
            rep.check("bloques", [f"no bloque folders under {base}"])
        for b in bloques:
            warns += verify_bloque(b, docs, ledger, work, sl, a.pins, rep, root_index_required=True)
        verify_root(docs, rep)
        print(f"odata: {len(bloques)} bloques")
    else:
        warns = verify_bloque(a.bloque, docs, ledger, work, sl, a.pins, rep)
        print(f"bloque {a.bloque}")
    for w in warns:
        print(f"WARN  size: {w}")
    return rep.print()


if __name__ == "__main__":
    sys.exit(main())
