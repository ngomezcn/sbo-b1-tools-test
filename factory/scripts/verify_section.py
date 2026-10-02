#!/usr/bin/env python3
"""Coverage and fidelity checks for one apartado of a docs build (build-docs-* skills).

Usage:
    python factory/scripts/verify_section.py <apartado> [--docs DIR] [--work DIR] [--pages 15-139]

    --docs   docs being built: SKILL.md, reference/, assets/, PROGRESS.md, REVIEW.md
             (default factory/docs-src/service-layer)
    --work   output of extract_pdf.py (default factory/.work/service-layer)
    --pages  page range(s) of the apartado; default: its row in PROGRESS.md "## Apartados"

Checks, each against outline.json / elements.json / links.json from the extraction:
    frontmatter   every hoja has title, source ("pdf pp. A-B, sec X, Y") and summary
    coverage      every page of the apartado is inside some hoja's source range
    sections      every outline section starting in the apartado is listed (or an ancestor is) in some hoja's source
    code          fenced block count equals extracted code blocks; every extracted block's text is present verbatim
    tables        every extracted table id appears exactly once as <!-- table: tNNN-MM -->
    images        every image id is referenced once per placement (zero if REVIEW.md says removed), and the file exists
    links         every external URL appears in a hoja (unless removed) and every image and link has a REVIEW.md row
    todo-links    no TODO(link: X) remains whose target section X is already covered by a hoja
    routing       reference/<apartado>/index.md exists, every hoja is linked from an index, SKILL.md links the apartado

Exits 0 when every check passes, 1 otherwise. Hojas are all .md files under reference/<apartado>/ except index.md.
"""
import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

FENCE = re.compile(r"^(?P<prefix>[\s>]*)(?P<fence>```+|~~~+)")
IMG_REF = re.compile(r"!\[[^\]]*\]\(([^)\s]+)\)")
TABLE_MARK = re.compile(r"<!--\s*table:\s*(t\d{3}-\d{2})\b[^>]*-->")
TODO_LINK = re.compile(r"TODO\(link:\s*(?:sec\s+)?([^)]+?)\s*\)")
SOURCE_PAGES = re.compile(r"pdf\s+pp?\.\s*(\d+)(?:\s*-\s*(\d+))?")
SOURCE_SECS = re.compile(r"secs?\.?\s+(.+)$")
MD_LINK = re.compile(r"\]\(([^)\s#]+)(?:#[^)]*)?\)")


def parse_ranges(text):
    pages = set()
    for part in re.split(r"[,\s]+", text.strip()):
        if not part:
            continue
        a, _, b = part.partition("-")
        pages.update(range(int(a), int(b or a) + 1))
    return pages


def read_frontmatter(text):
    if not text.startswith("---"):
        return None
    end = text.find("\n---", 3)
    if end < 0:
        return None
    meta = {}
    for line in text[3:end].splitlines():
        if ":" in line and not line.startswith(" "):
            k, _, v = line.partition(":")
            meta[k.strip()] = v.strip().strip('"').strip("'")
    return meta


def first_table(text):
    """Rows of the first Markdown table in text (header, separator, body)."""
    rows = []
    for line in text.splitlines():
        if line.startswith("|"):
            rows.append(line)
        elif rows:
            break
    return rows


def apartado_pages(progress, apartado):
    text = progress.read_text(encoding="utf-8")
    sect = text.split("## Apartados", 1)
    if len(sect) < 2:
        sys.exit(f"{progress}: no '## Apartados' table")
    rows = first_table(sect[1])
    header = [c.strip().lower() for c in rows[0].strip("|").split("|")]
    for row in rows[2:]:
        cells = [c.strip().strip("`") for c in row.strip("|").split("|")]
        rec = dict(zip(header, cells))
        if rec.get("apartado") == apartado:
            return parse_ranges(rec["pages"])
    sys.exit(f"{progress}: apartado '{apartado}' not in the Apartados table")


def review_rows(review):
    rows = {}
    if not review.exists():
        return rows
    lines = first_table(review.read_text(encoding="utf-8"))
    if not lines:
        return rows
    header = [c.strip().lower() for c in lines[0].strip("|").split("|")]
    for row in lines[2:]:
        rec = dict(zip(header, [c.strip().strip("`") for c in row.strip("|").split("|")]))
        if rec.get("id"):
            rows[rec["id"]] = rec
    return rows


def fenced_blocks(text):
    """Return the content of every fenced block, with list/blockquote prefixes removed."""
    blocks, cur, prefix, fence = [], None, "", ""
    for line in text.splitlines():
        m = FENCE.match(line)
        if cur is None:
            if m:
                cur, prefix, fence = [], re.sub(r"\s", "", m.group("prefix")), m.group("fence")
            continue
        if m and m.group("fence").startswith(fence) and line[m.end("fence"):].strip() == "":
            blocks.append("\n".join(cur))
            cur = None
            continue
        body = line.lstrip()
        for ch in prefix:  # strip the quote markers that prefix the opening fence
            body = body[1:].lstrip() if body.startswith(ch) else body
        cur.append(body)
    if cur is not None:
        blocks.append("\n".join(cur))
    return blocks


def squash(text):
    return re.sub(r"\s+", "", text.replace("\xa0", " "))


def sec_covers(listed, target):
    return target == listed or target.startswith(listed + ".")


class Report:
    def __init__(self):
        self.fail = defaultdict(list)
        self.ok = []

    def check(self, name, problems):
        if problems:
            self.fail[name].extend(problems)
        else:
            self.ok.append(name)

    def print(self):
        for name in self.ok:
            print(f"PASS  {name}")
        for name, probs in self.fail.items():
            print(f"FAIL  {name} ({len(probs)})")
            for p in probs[:40]:
                print(f"      - {p}")
            if len(probs) > 40:
                print(f"      ... {len(probs) - 40} more")
        return 1 if self.fail else 0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("apartado")
    ap.add_argument("--docs", default="factory/docs-src/service-layer")
    ap.add_argument("--work", default="factory/.work/service-layer")
    ap.add_argument("--pages")
    a = ap.parse_args()
    docs, work = Path(a.docs), Path(a.work)
    outline = json.loads((work / "outline.json").read_text(encoding="utf-8"))["nodes"]
    elements = json.loads((work / "elements.json").read_text(encoding="utf-8"))
    links = json.loads((work / "links.json").read_text(encoding="utf-8"))
    pages = parse_ranges(a.pages) if a.pages else apartado_pages(docs / "PROGRESS.md", a.apartado)
    review = review_rows(docs / "REVIEW.md")
    root = docs / "reference" / a.apartado
    rep = Report()

    hojas = sorted(p for p in root.rglob("*.md") if p.name != "index.md") if root.exists() else []
    if not hojas:
        rep.check("hojas", [f"no hojas under {root}"])
        sys.exit(rep.print())
    texts = {h: h.read_text(encoding="utf-8") for h in hojas}
    rel = {h: h.relative_to(docs / "reference").as_posix() for h in hojas}

    # frontmatter -------------------------------------------------------
    problems, src_pages, src_secs = [], {}, {}
    for h, t in texts.items():
        meta = read_frontmatter(t)
        if meta is None:
            problems.append(f"{rel[h]}: no frontmatter")
            continue
        missing = [k for k in ("title", "source", "summary") if not meta.get(k)]
        if missing:
            problems.append(f"{rel[h]}: missing {', '.join(missing)}")
        m = SOURCE_PAGES.search(meta.get("source", ""))
        s = SOURCE_SECS.search(meta.get("source", ""))
        if not m or not s:
            problems.append(f"{rel[h]}: source must look like 'pdf pp. 67-73, sec 3.8' (got {meta.get('source')!r})")
            continue
        src_pages[h] = set(range(int(m.group(1)), int(m.group(2) or m.group(1)) + 1))
        src_secs[h] = [x.strip() for x in s.group(1).split(",") if x.strip()]
    rep.check("frontmatter", problems)

    # coverage ------------------------------------------------------------
    covered = set().union(*src_pages.values()) if src_pages else set()
    problems = [f"page {p} is in no hoja's source range" for p in sorted(pages - covered)]
    problems += [f"{rel[h]}: source pages {sorted(ps - pages)} are outside the apartado"
                 for h, ps in src_pages.items() if ps - pages]
    rep.check("coverage", problems)

    nodes = [n for n in outline if n["start_page"] in pages and n["level"] >= 2]
    listed = [s for ss in src_secs.values() for s in ss]
    problems = [f"sec {n['sec']} '{n['title']}' (p{n['start_page']}) is listed in no hoja's source"
                for n in nodes if not any(sec_covers(s, n["sec"]) for s in listed)]
    rep.check("sections", problems)

    # code ----------------------------------------------------------------
    parts = defaultdict(list)
    for c in elements["code"]:
        if c["page"] in pages:
            parts[c.get("continues", c["id"])].append(c)
    # empty gray boxes (no text drawn) carry nothing to transcribe; renders confirm them empty
    parts = {k: v for k, v in parts.items() if squash("".join(p["text"] for p in v))}
    fenced = [b for t in texts.values() for b in fenced_blocks(t)]
    # ASCII drawings that replace a figure (box-drawing characters) are hojas' own text, not extracted code
    fenced = [b for b in fenced if not re.search(r'[─-╿]', b)]
    # inline code the PDF prints without a gray box, which a hoja may promote to a fenced block for
    # readability: no extracted part inside it, but its text is verbatim in the page text of the apartado
    page_files = [work / "pages" / f"p{n:03d}.md" for n in sorted(pages)]
    page_text = squash("".join(f.read_text(encoding="utf-8") for f in page_files if f.exists()))
    part_texts = [squash("".join(p["text"] for p in ps)) for ps in parts.values()]
    fenced = [b for b in fenced
              if any(t in squash(b) for t in part_texts) or squash(b) not in page_text]
    haystack = squash("\n".join(fenced))
    problems = []
    # a block split by a page break without a "continues" marker is extracted as separate parts;
    # a hoja that merges them into one fenced block is faithful, so those parts cost no block
    squashed = [squash(b) for b in fenced]
    exact = set(squashed)
    hosts, loose, loose_cands = set(), 0, []
    for ps in parts.values():
        t = squash("".join(p["text"] for p in ps))
        if t in exact:
            continue
        cands = [i for i, b in enumerate(squashed) if t in b]
        if cands:
            loose += 1
            loose_cands.append((t, cands))
    # parts merged into one block share it: when a part's own shortest host is a block elsewhere
    # that merely repeats its text, use the merged block that another part already needs and
    # that starts with this part
    firsts = {min(c, key=lambda i: len(squashed[i])) for _, c in loose_cands if len(c) == 1}
    for t, cands in loose_cands:
        shared = [i for i in cands if i in firsts and squashed[i].startswith(t)]
        hosts.add(shared[0] if len(shared) == 1 else min(cands, key=lambda i: len(squashed[i])))
    expected = len(parts) - (loose - len(hosts))
    if len(fenced) != expected:
        problems.append(f"{len(fenced)} fenced blocks in hojas, {expected} expected from {len(parts)} code blocks extracted")
    for cid, ps in sorted(parts.items()):
        if squash("".join(p["text"] for p in ps)) not in haystack:
            problems.append(f"{cid} (p{ps[0]['page']}) not found verbatim in any fenced block")
    rep.check("code", problems)

    # tables --------------------------------------------------------------
    roots = {t["id"] for t in elements["tables"] if t["page"] in pages and "continues" not in t}
    conts = {t["id"]: t["continues"] for t in elements["tables"] if t["page"] in pages and "continues" in t}
    seen = Counter(m for t in texts.values() for m in TABLE_MARK.findall(t))
    problems = [f"{tid} missing its <!-- table: {tid} --> marker" for tid in sorted(roots - set(seen))]
    problems += [f"{tid} marked {n} times" for tid, n in seen.items() if n > 1]
    problems += [f"{tid} is a continuation of {conts[tid]}; merge it under that marker" for tid in seen if tid in conts]
    problems += [f"{tid} is not a table of this apartado" for tid in seen if tid not in roots and tid not in conts]
    rep.check("tables", problems)

    # images --------------------------------------------------------------
    imgs = {i["id"]: i for i in elements["images"] if i["page"] in pages}
    refs, problems = Counter(), []
    for h, t in texts.items():
        for target in IMG_REF.findall(t):
            iid = Path(target).stem
            refs[iid] += 1
            if not (h.parent / target).resolve().exists():
                problems.append(f"{rel[h]}: image file {target} does not exist")
            if iid not in imgs:
                problems.append(f"{rel[h]}: {iid} is not an image of this apartado")
    for iid, im in sorted(imgs.items()):
        removed = review.get(iid, {}).get("status") == "removed"
        want = 0 if removed else im["placements"]
        if refs[iid] != want:
            problems.append(f"{iid} (p{im['page']}) referenced {refs[iid]} times, expected {want}"
                            + (" (removed in REVIEW.md)" if removed else ""))
    rep.check("images", problems)

    # links + review queue ------------------------------------------------
    all_text = "\n".join(texts.values())
    ext = [l for l in links if l["page"] in pages and l["kind"] == "external"]
    problems = []
    for l in ext:
        removed = review.get(l["id"], {}).get("status") == "removed"
        if not removed and l["url"] not in all_text:
            problems.append(f"{l['id']} (p{l['page']}) URL {l['url']} not present in any hoja")
    for rid in [l["id"] for l in ext] + list(imgs):
        if rid not in review:
            problems.append(f"{rid} has no row in REVIEW.md")
    rep.check("links", problems)

    # TODO(link:) ---------------------------------------------------------
    everywhere = []
    for h in (docs / "reference").rglob("*.md"):
        meta = read_frontmatter(h.read_text(encoding="utf-8")) or {}
        s = SOURCE_SECS.search(meta.get("source", ""))
        if s:
            everywhere += [x.strip() for x in s.group(1).split(",") if x.strip()]
    problems = []
    for h, t in texts.items():
        for target in TODO_LINK.findall(t):
            if any(sec_covers(s, target) for s in everywhere):
                problems.append(f"{rel[h]}: TODO(link: {target}) is resolvable; a hoja covers that section")
    rep.check("todo-links", problems)

    # routing -------------------------------------------------------------
    problems = []
    index = root / "index.md"
    if not index.exists():
        problems.append(f"{index} missing")
    linked = set()
    for idx in root.rglob("index.md"):
        for target in MD_LINK.findall(idx.read_text(encoding="utf-8")):
            linked.add((idx.parent / target).resolve())
    for h in hojas:
        if h.resolve() not in linked:
            problems.append(f"{rel[h]} is not linked from any index.md")
    for sub in (p for p in root.rglob("*") if p.is_dir()):
        if not (sub / "index.md").exists():
            problems.append(f"subfolder {sub.relative_to(docs / 'reference').as_posix()} has no index.md")
    skill = docs / "SKILL.md"
    if not skill.exists() or f"reference/{a.apartado}/index.md" not in skill.read_text(encoding="utf-8"):
        problems.append(f"SKILL.md does not link reference/{a.apartado}/index.md")
    rep.check("routing", problems)

    print(f"apartado {a.apartado}: pages {min(pages)}-{max(pages)}, {len(hojas)} hojas")
    sys.exit(rep.print())


if __name__ == "__main__":
    main()
