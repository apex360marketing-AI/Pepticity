"""Inline CSS/JS into one artifact-ready page: dist/index.html (no doctype/html/head/body — the Artifact skeleton adds them)."""
import re, pathlib, sys
root = pathlib.Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else pathlib.Path(__file__).parent
vendor = pathlib.Path(__file__).parent / "vendor"
src = (root / "src/index.html").read_text()

def script(m):
    n = m.group(1)
    p = vendor / n.split("/")[-1] if "vendor/" in n else (root / "src" / n)
    return "<script>\n" + p.read_text().replace("</script", "<\\/script") + "\n</script>"

src = re.sub(r'<link rel="stylesheet" href="site.css">', lambda m: "<style>\n" + (root / "src/site.css").read_text() + "\n</style>", src)
src = re.sub(r'<script src="([^"]+)"></script>', script, src)
for tag in [r"<!doctype html>\n?", r"<html[^>]*>\n?", r"</html>\n?", r"<head>\n?", r"</head>\n?", r"<body>\n?", r"</body>\n?", r'<meta charset="utf-8">\n?', r'<meta name="viewport"[^>]*>\n?']:
    src = re.sub(tag, "", src, flags=re.I)
(root / "dist").mkdir(exist_ok=True)
(root / "dist/index.html").write_text(src)
# local preview copy with a full skeleton
(root / "dist/preview.html").write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>' + src + "</body></html>")
print("built", len(src) // 1024, "KB")
