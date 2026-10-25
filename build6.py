"""Build a V6+ site into one artifact-ready page.

Like build.py, plus: inlines <script type="module" src="..."> files and resolves
paths relative to the site's src/ folder (so ../../../shared/pep-core.js works).
three.js is loaded from cdn.jsdelivr.net through an import map (allowed by the
artifact CSP). Usage: python3 build6.py sites/<slug>
"""
import re, pathlib, sys

root = pathlib.Path(sys.argv[1]).resolve()
vendor = pathlib.Path(__file__).resolve().parent / "vendor"
srcdir = root / "src"
src = (srcdir / "index.html").read_text()


def read(n):
    p = vendor / n.split("/")[-1] if "vendor/" in n else (srcdir / n).resolve()
    return p.read_text().replace("</script", "<\\/script")


src = re.sub(r'<link rel="stylesheet" href="([^"]+\.css)">', lambda m: "<style>\n" + (srcdir / m.group(1)).read_text() + "\n</style>", src)
src = re.sub(r'<script type="module" src="([^"]+)"></script>', lambda m: '<script type="module">\n' + read(m.group(1)) + "\n</script>", src)
src = re.sub(r'<script src="([^"]+)"></script>', lambda m: "<script>\n" + read(m.group(1)) + "\n</script>", src)
for tag in [r"<!doctype html>\n?", r"<html[^>]*>\n?", r"</html>\n?", r"<head>\n?", r"</head>\n?", r"<body>\n?", r"</body>\n?", r'<meta charset="utf-8">\n?', r'<meta name="viewport"[^>]*>\n?']:
    src = re.sub(tag, "", src, flags=re.I)
# keep the published page pure ASCII so it never shows garbled characters
def esc(text, kind):
    def one(c):
        if ord(c) < 128:
            return c
        if kind == "js":
            return "".join("\\u%04x" % u for u in (c.encode("utf-16-be") and [int.from_bytes(c.encode("utf-16-be")[i:i + 2], "big") for i in range(0, len(c.encode("utf-16-be")), 2)]))
        if kind == "css":
            return "\\%x " % ord(c)
        return "&#%d;" % ord(c)
    return "".join(one(c) for c in text)


parts, pos = [], 0
for m in re.finditer(r"(?is)(<script[^>]*>)(.*?)(</script>)|(<style[^>]*>)(.*?)(</style>)", src):
    parts.append(esc(src[pos:m.start()], "html"))
    if m.group(1):
        parts.append(m.group(1) + esc(m.group(2), "js") + m.group(3))
    else:
        parts.append(m.group(4) + esc(m.group(5), "css") + m.group(6))
    pos = m.end()
parts.append(esc(src[pos:], "html"))
src = "".join(parts)
out = root / "dist"
out.mkdir(exist_ok=True)
(out / "index.html").write_text(src)
(out / "preview.html").write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>' + src + "</body></html>")
print("built", root.name, len(src) // 1024, "KB")
