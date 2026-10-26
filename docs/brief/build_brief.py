"""Builds the PEPTICITY NEXT LEVEL review page (one HTML file) from:
   docs/PEPTICITY-MASTER-PROMPT.md, docs/brief/recs-plan.json, docs/brief/hooks.json, docs/brief/status.json
Usage: python3 -I build_brief.py <out.html>"""
import json, re, sys, html, pathlib
ROOT = pathlib.Path(__file__).resolve().parent
DOCS = ROOT.parent

def inline(s):
    s = html.escape(s, quote=False)
    s = re.sub(r'`([^`]+)`', r'<code>\1</code>', s)
    s = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', s)
    s = re.sub(r'(?<![\w*])\*([^*]+)\*(?!\w)', r'<i>\1</i>', s)
    return s

def md(text):
    out, lst = [], None
    def close():
        nonlocal lst
        if lst: out.append('</%s>' % lst); lst = None
    for raw in text.splitlines():
        line = raw.rstrip()
        if not line.strip(): close(); continue
        m = re.match(r'^(#{1,4}) (.*)', line)
        if m:
            close(); n = len(m.group(1)); out.append('<h%d>%s</h%d>' % (n + 1, inline(m.group(2)), n + 1)); continue
        if line.strip() == '---': close(); out.append('<hr>'); continue
        if line.startswith('> '): close(); out.append('<blockquote>%s</blockquote>' % inline(line[2:])); continue
        m = re.match(r'^\s*- \[ \] (.*)', line)
        if m:
            if lst != 'ul': close(); out.append('<ul class="chk">'); lst = 'ul'
            out.append('<li>%s</li>' % inline(m.group(1))); continue
        m = re.match(r'^\s*- (.*)', line)
        if m:
            if lst != 'ul': close(); out.append('<ul>'); lst = 'ul'
            out.append('<li>%s</li>' % inline(m.group(1))); continue
        m = re.match(r'^\s*\d+\. (.*)', line)
        if m:
            if lst != 'ol': close(); out.append('<ol>'); lst = 'ol'
            out.append('<li>%s</li>' % inline(m.group(1))); continue
        close(); out.append('<p>%s</p>' % inline(line))
    close()
    return '\n'.join(out)

prompt_md = (DOCS / 'PEPTICITY-MASTER-PROMPT.md').read_text()
data = json.loads((ROOT / 'recs-plan.json').read_text())
data['hooks'] = json.loads((ROOT / 'hooks.json').read_text())
data['status'] = json.loads((ROOT / 'status.json').read_text())
data['promptText'] = prompt_md
tpl = (ROOT / 'template.html').read_text()
page = tpl.replace('__PROMPT_HTML__', md(prompt_md)).replace('__DATA__', json.dumps(data, ensure_ascii=True).replace('</', '<\\/'))
page = ''.join(c if ord(c) < 128 else '&#%d;' % ord(c) for c in page)  # ASCII-safe (script text above is already \\u-escaped by json)
pathlib.Path(sys.argv[1]).write_text(page)
print('ok', len(page))
