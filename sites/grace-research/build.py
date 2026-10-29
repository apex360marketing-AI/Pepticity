#!/usr/bin/env python3
"""THE RESEARCH: builds sites/grace-research/index.html from docs/research/*.md and docs/owner/*.md.
Presents the documents as written. Only internal working references are removed (see CLEAN below).
Excluded on purpose: REQUEST-LEDGER, effect-picks, docs/prompts/, anything APEX-internal.
Run: python3 sites/grace-research/build.py"""
import base64, html, json, pathlib, re, sys
import markdown

ROOT = pathlib.Path(__file__).resolve().parents[2]
SITE = ROOT / "sites/grace-research"
EXCLUDE = re.compile(r"(REQUEST-LEDGER|effect-picks|prompt|BRAIN)", re.I)

# order: playbooks first, then research, then anything new that lands in the folders
PREFERRED = ["SALES-PLAYBOOK.md", "DASHBOARD-NEXT-LEVEL-PLAYBOOK.md", "HOOKS-DEEP-DIVE.md", "lead-magnet-hooks.md", "quiz-and-guide-research.md"]
files = [p for d in ("docs/owner", "docs/research") for p in sorted((ROOT / d).glob("*.md")) if not EXCLUDE.search(p.name)]
files.sort(key=lambda p: (PREFERRED.index(p.name) if p.name in PREFERRED else 99, p.name))

# internal working references only (tool notes, file paths, ledger codes, skill names). The research itself is untouched.
CLEAN = [
    (r"\n[^\n]*scratchpad[^\n]*\n", "\n"),                                         # local clone paths
    (r"\n## \d+\. SKILLS ADDED WITH THIS RESEARCH\n[^\n]*\n?", "\n"),               # internal tooling list
    (r"GitHub search and API calls are blocked in this session, so repos", "Repos"),
    (r" \(WebFetch DNS failure; the proxy refuses CONNECT\)", ""),
    (r"Direct page fetches are blocked in this environment\. ", ""),
    (r"`docs/owner/REQUEST-LEDGER\.md`, ", ""),
    (r"`docs/research/HOOKS-DEEP-DIVE\.md`", "the Hooks Deep Dive"),
    (r"`shared/catalogue\.json`", "the catalogue"),
    (r"the hook, checkout and regulatory skills", "the hook, checkout and regulatory notes"),
    (r"\s*\((?:see )?`[a-z0-9-]+`\)", ""),                                           # (see `skill-name`)
    (r"owner rule R\d{3}(?:, R\d{3})*", "owner rule"),
    (r"\s*\(R\d{3}(?:,\s*R\d{3})*\)", ""),                                           # ledger codes
    (r"\bR\d{3}\b", ""),
    (r"Read from `shared/inventory\.js` / backend\.", "Read from the store inventory."),
    (r"`shared/inventory\.js`", "the store inventory"),
    (r"The peptide-expert skill notes that ", "Note: "),
]


def clean(md):
    for a, b in CLEAN:
        md = re.sub(a, b, md)
    return md


def b64(p, mime):
    return f"data:{mime};base64," + base64.b64encode((ROOT / p).read_bytes()).decode()


def written(md):
    m = re.search(r"(?:Prepared|Written|Researched|Drafted)\s+(\d{1,2} \w{3} \d{4}|\d{4}-\d{2}-\d{2})", md)
    return m.group(1) if m else ""


chapters, toc = [], []
for i, p in enumerate(files, 1):
    raw = p.read_text()
    md = clean(raw)
    h1 = re.search(r"^# (.+)$", md, re.M)
    title = (h1.group(1) if h1 else p.stem.replace("-", " ")).strip()
    md = re.sub(r"^# .+\n", "", md, count=1, flags=re.M)
    short = re.sub(r"^PEPTICITY\s*", "", title.upper()).replace(":", "").strip() or title.upper()
    slug = f"c{i:02d}"
    body = markdown.markdown(md, extensions=["tables", "sane_lists", "toc"], extension_configs={"toc": {"slugify": lambda v, s: re.sub(r"[^a-z0-9]+", "-", v.lower()).strip("-")}})
    body = re.sub(r'id="([^"]+)"', lambda m: f'id="{slug}-{m.group(1)}"', body)
    body = body.replace("<table>", '<div class="tbl"><table>').replace("</table>", "</table></div>")
    body = re.sub(r'<a href="(https?://[^"]+)"', r'<a href="\1" target="_blank" rel="noopener noreferrer"', body)
    subs = re.findall(r'<h2 id="([^"]+)">(.*?)</h2>', body)
    words = len(re.findall(r"\w+", md))
    date = written(raw)
    chapters.append(f'''
  <article class="chap gl" id="{slug}" aria-labelledby="{slug}-t">
    <header class="sh">
      <span class="no">{i:02d}</span><h2 id="{slug}-t" class="h2s">{html.escape(short)}</h2>
      <p>{"Written " + html.escape(date) + " · " if date else ""}about {max(1, round(words / 230))} min read</p>
    </header>
    <div class="prose">{body}</div>
    <p class="endmark"><a href="#top">BACK TO THE TOP</a></p>
  </article>''')
    toc.append((slug, i, short, subs))

n = len(chapters) + 1
chapters.append(f'''
  <article class="chap gl await" id="c{n:02d}" aria-labelledby="c{n:02d}-t">
    <header class="sh"><span class="no">{n:02d}</span><h2 id="c{n:02d}-t" class="h2s">FROM CHATGPT AND GENSPARK</h2>
      <p class="awaitline">&mdash; [awaiting files from owner]</p></header>
    <div class="slot"><span>[This section is empty on purpose. The branding, silver colour, logo font and research files from ChatGPT and GenSpark have not been received yet. They will be added here as they arrive.]</span></div>
  </article>''')
toc.append((f"c{n:02d}", n, "FROM CHATGPT AND GENSPARK", []))

toc_html = "\n".join(
    f'<li><a href="#{s}" data-c="{s}"><i>{i:02d}</i><span>{html.escape(t)}</span></a>'
    + ("<ol>" + "".join(f'<li><a href="#{sid}">{html.escape(re.sub("<[^>]+>", "", st))}</a></li>' for sid, st in subs) + "</ol>" if subs else "")
    + "</li>" for s, i, t, subs in toc)

src = (SITE / "index.src.html").read_text()
fonts = "\n".join([
    f'@font-face{{font-family:"PB";src:url({b64("brand/font/PepticityBlack.woff2", "font/woff2")}) format("woff2");font-display:block}}',
    f'@font-face{{font-family:"Geist";src:url({b64("sites/grace-arsenal/assets/geist.woff2", "font/woff2")}) format("woff2");font-weight:300 700;font-display:swap}}',
    f'@font-face{{font-family:"Geist Mono";src:url({b64("sites/grace-arsenal/assets/geistmono.woff2", "font/woff2")}) format("woff2");font-weight:500;font-display:swap}}'])
def _inl(m):
    path = m.group(1) or m.group(2)
    t = (ROOT / path).read_text().rstrip()
    return re.sub(r"/\*.*?\*/", "", t, flags=re.S) if path.endswith(".css") else t
src = re.sub(r"(?:/\*@INLINE:([^@]+)@\*/|//@INLINE:([^@]+)@)", _inl, src)
src = (src.replace("@FONTFACE@", fonts).replace("@TOC@", toc_html).replace("@CHAPTERS@", "\n".join(chapters))
          .replace("@COUNT@", str(len(files))).replace("@ICON@", b64("brand/logo/p-mark.svg", "image/svg+xml")))
(SITE / "index.html").write_text(src)
print("built", SITE / "index.html", len(src), "bytes;", len(files), "documents:", ", ".join(p.name for p in files))
