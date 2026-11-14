#!/usr/bin/env python3
# HARDEN: seal the finished page with a Content-Security-Policy. usage: python3 -I csp.py IN.html OUT.html
# Run as the VERY LAST step (after every apply.py and after final_sweep.py).
#
# It adds, right after <meta charset>, before the first script:
#   <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'sha256-..' ..;
#         style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' [the form endpoint's origin];
#         object-src 'none'; base-uri 'none'; form-action 'self'">
#   <meta name="referrer" content="strict-origin-when-cross-origin">
# One sha256 per inline script in the page, plus one for the import map the logo engine (02-logo3d) writes at run time
# for its own copy of three.js. Nothing third-party is allowed: with this policy the public-CDN fallback for three.js is
# refused even in a preview, so 3D runs from the store's own vendor/ files or turns itself off.
#
# IMPORTANT: the policy names every inline script by its hash. After ANY later change to the page (a config switch such
# as PREVIEW, the hidden list, the form endpoint, a line of code) run this file again, or the browser refuses the changed
# script and the store does not start. Running it twice gives the same file.
import base64
import hashlib
import json
import re
import sys
from urllib.parse import urlsplit

BEGIN = '<!-- HARDEN:BEGIN csp -->'
END = '<!-- HARDEN:END csp -->'
EXEC_TYPES = ('', 'text/javascript', 'application/javascript', 'module', 'importmap')


def die(msg):
    sys.stderr.write('HARDEN csp.py: STOPPED. ' + msg + '\n')
    sys.exit(1)


def sha(text):
    return "'sha256-" + base64.b64encode(hashlib.sha256(text.encode('utf-8')).digest()).decode('ascii') + "'"


def main():
    if len(sys.argv) != 3:
        die('usage: python3 -I csp.py IN.html OUT.html')
    h = open(sys.argv[1], encoding='utf-8', newline='').read()
    if '\r' in h:
        die('the page has CR line ends: a browser hashes scripts after turning them into LF, so the hashes would not match. Save it with LF line ends.')

    # an earlier run's block is taken out first, so the result is the same when run twice
    a = h.find(BEGIN)
    if a >= 0:
        b = h.find(END, a)
        if b < 0:
            die(BEGIN + ' without ' + END)
        h = h[:a] + h[b + len(END):].lstrip('\n')
    if re.search(r'http-equiv\s*=\s*["\']?content-security-policy', h, re.I):
        die('the page already has a Content-Security-Policy that this file did not write')

    # ---- what the policy would silently break: refuse to seal such a page
    code = re.sub(r'<(script|style)\b[^>]*>.*?</\1>', '', h, flags=re.S)       # markup only
    handlers = re.findall(r'<[a-zA-Z][^<>]*\s(on[a-z]+)\s*=', code)
    if handlers:
        die('inline event handlers in the markup (%s): a policy without unsafe-inline refuses them' % ', '.join(sorted(set(handlers))[:6]))
    if re.search(r'(href|src|action)\s*=\s*["\']?\s*javascript:', code, re.I):
        die('a javascript: link in the markup: the policy refuses it')
    if re.search(r'<base\b', code, re.I):
        die('a <base> element in the markup: the policy sets base-uri none')

    # ---- every inline script, by hash
    hashes, n_inline, n_src = [], 0, 0
    for m in re.finditer(r'<script\b([^>]*)>(.*?)</script>', h, flags=re.S):
        attrs, body = m.group(1), m.group(2)
        src = re.search(r'(?:^|\s)src\s*=\s*["\']?([^"\'\s>]+)', attrs)       # not data-pep-src
        if src:
            n_src += 1
            if re.match(r'(?:[a-z][a-z0-9+.-]*:)?//', src.group(1), re.I):
                die('a script is loaded from another address (%s): the policy allows this store\'s own files only' % src.group(1))
            continue
        t = re.search(r'(?:^|\s)type\s*=\s*["\']?([^"\'\s>]+)', attrs)
        if (t.group(1).lower() if t else '') not in EXEC_TYPES:
            continue                                                    # a data block: never run, needs no hash
        n_inline += 1
        s = sha(body)
        if s not in hashes:
            hashes.append(s)
    if not n_inline:
        die('no inline script found: is this the store page?')

    # ---- the import map the logo engine writes at run time (JSON.stringify of the same object)
    logo = re.search(r'<script\b[^>]*data-pep-src="modules/02-logo3d/logo3d\.js"[^>]*>(.*?)</script>', h, flags=re.S)
    runtime_map = None
    if logo and "im.type = 'importmap'" in logo.group(1):
        src = logo.group(1)
        local = re.search(r"var LOCAL = '([^']+)'", src)
        expr = "map = { imports: { 'three': './' + LOCAL + 'three.module.js', 'three/addons/': './' + LOCAL + 'addons/' } };"
        if not local or expr not in src or 'im.textContent = JSON.stringify(map);' not in src:
            die('the logo engine builds its import map in a way this file does not know. Update csp.py (runtime import map hash).')
        runtime_map = json.dumps({'imports': {'three': './' + local.group(1) + 'three.module.js', 'three/addons/': './' + local.group(1) + 'addons/'}},
                                 separators=(',', ':'), ensure_ascii=False)
        s = sha(runtime_map)
        if s not in hashes:
            hashes.append(s)
    elif not re.search(r'<script\b[^>]*type\s*=\s*["\']?importmap', h):
        die('no logo engine import map code and no fixed import map found: nothing to allow for three.js. Check the page.')

    # ---- config: where forms post
    cfg = re.search(r'<script\b[^>]*data-pep-src="config\.js"[^>]*>(.*?)</script>', h, flags=re.S)
    if not cfg:
        die('no <script data-pep-src="config.js"> block')
    form = re.search(r"\bform\s*:\s*\{[^{}]*?\bendpoint\s*:\s*(['\"])(.*?)\1", cfg.group(1), flags=re.S)
    preview = re.search(r'\bPREVIEW\s*:\s*(true|false)\b', cfg.group(1))
    if not form or not preview:
        die('config.js: form.endpoint or flags.PREVIEW was not found')
    endpoint = form.group(2).strip()
    connect = ["'self'"]
    if endpoint:
        u = urlsplit(endpoint)
        if u.scheme in ('http', 'https') and u.netloc:
            if not re.match(r'^[A-Za-z0-9.-]+(:\d+)?$', u.netloc):
                die('config.js form.endpoint has a host this file will not put in a policy: ' + u.netloc)
            connect.append(u.scheme + '://' + u.netloc.lower())
        elif u.scheme or u.netloc:
            die('config.js form.endpoint is not an http(s) address: ' + endpoint)
        # a path on this address is covered by 'self'

    policy = '; '.join([
        "default-src 'self'",
        "script-src 'self' " + ' '.join(hashes),
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        'connect-src ' + ' '.join(connect),
        "object-src 'none'",
        "base-uri 'none'",
        "form-action 'self'",
    ])
    if '"' in policy or '<' in policy or '>' in policy:
        die('internal error: the policy text cannot sit in an attribute')
    tags = (BEGIN + '\n'
            '<meta http-equiv="Content-Security-Policy" content="' + policy + '">\n'
            '<meta name="referrer" content="strict-origin-when-cross-origin">\n'
            + END + '\n')

    charset = '<meta charset="utf-8">'
    head_end = h.find('</head>')
    at = h.find(charset)
    if head_end < 0 or at < 0 or at > head_end or h.count(charset) != 1:
        die('anchor <meta charset="utf-8"> not found once in the head')
    at += len(charset)
    if h[at:at + 1] == '\n':
        at += 1
    out = h[:at] + tags + h[at:]
    first_script = re.search(r'<script\b', out)
    if first_script.start() < out.find(END):
        die('a script comes before the policy: the policy would not cover it')
    if re.search(r'<meta[^>]+name\s*=\s*["\']?referrer', h, re.I):
        die('the page already has a referrer meta that this file did not write')
    open(sys.argv[2], 'w', encoding='utf-8', newline='').write(out)
    print('HARDEN csp.py: ok. %d inline scripts hashed (%d hashes)%s, %d own script files, connect-src %s, PREVIEW=%s'
          % (n_inline, len(hashes), ' + the logo engine\'s run-time import map' if runtime_map else '', n_src, ' '.join(connect), preview.group(1)))


main()
