#!/usr/bin/env python3
"""Round 2 security fixes for the PEPTICITY store page (one bundled file).

usage:  python3 -I apply_sec.py IN.html OUT.html

Anchored on exact strings. Idempotent: run on its own output it writes the same bytes. Stops (writes nothing, exit 2)
on any missing anchor. Nothing visible changes: no wording, layout, style or behaviour a visitor would notice.

  1. FRAME GUARD (core/pep.js). Framed by ANOTHER origin, the page cannot be pressed or focused (inert on <html>), so a
     site that shows it invisibly over its own button cannot land the visitor's press on a consent box or a send key.
     A meta policy cannot carry frame-ancestors and GitHub Pages sends no header: this is the only guard available.
  2. CONTENT SECURITY POLICY (<meta http-equiv>, first thing after <meta charset>):
       default-src 'none'                     anything not named below is refused (frames, objects, media, workers)
       script-src 'self' <sha256 of every inline script and of both import maps logo3d can write>
                  https://cdn.jsdelivr.net/npm/three@0.185.1/   (the pinned preview fallback only)
       style-src 'self' 'unsafe-inline'       the page's own style blocks
       img-src 'self' data:                   the page's pictures and its css data: textures
       font-src 'self'                        the one font
       connect-src 'self'                     fetches only to this site. SET THE FORM ENDPOINT? ADD ITS https ORIGIN HERE.
       base-uri 'none'                        no <base> can retarget the page's relative addresses
       form-action 'none'                     no form is ever sent by the browser itself (the scripts send, when allowed)
     The script hashes are computed from OUT itself, last, so they always match the file they ship in. Edit any inline
     script later? Run this again on the edited page, or that script is refused.
  3. REFERRER POLICY (<meta name="referrer" content="strict-origin">): a request carries this site's origin only, never
     the page's path or query (a mailing link's ?email= stays on the page).
"""
import base64
import hashlib
import json
import re
import sys

MARK_GUARD = "/* R2SEC:frame-guard */"
MARK_HEAD = "<!-- R2SEC:policy -->"

GUARD_ANCHOR = "  'use strict';\n  if (win.PEP) { return; }\n"
GUARD_CODE = (
    "  " + MARK_GUARD + "\n"
    "  // FRAMED BY ANOTHER SITE (round 2 security): a page on another origin can show this store invisibly over its own\n"
    "  // button, so a press meant for that button lands on a consent box or a send key. A meta policy cannot carry\n"
    "  // frame-ancestors and GitHub Pages sends no header, so the page guards itself: framed by another origin, nothing in it\n"
    "  // can be pressed or focused. A frame from this same origin is left alone (it could undo any guard anyway).\n"
    "  try { if (win.top !== win.self) { var foreign = true; try { foreign = win.top.location.origin !== win.location.origin; } catch (err) { foreign = true; } if (foreign) { doc.documentElement.setAttribute('inert', ''); } } } catch (err) { /* no frame check possible */ }\n"
)

HEAD_ANCHOR = '<meta charset="utf-8">\n'
HEAD_NEXT = '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
REFERRER = '<meta name="referrer" content="strict-origin">\n'

# logo3d.js writes one of two import maps at run time; both must be allowed by hash. Read from the page, never retyped.
IM_CONST = "var LOCAL = 'vendor/three/', CDN = 'https://cdn.jsdelivr.net/npm/three@0.185.1/';"
IM_LOCAL = "map = { imports: { 'three': './' + LOCAL + 'three.module.js', 'three/addons/': './' + LOCAL + 'addons/' } };"
IM_CDN = "map = { imports: { 'three': CDN + 'build/three.module.js', 'three/addons/': CDN + 'examples/jsm/' }, integrity: {} };"
IM_INTEGRITY = re.compile(r"map\.integrity\[CDN \+ '([^']+)'\] = '(sha384-[A-Za-z0-9+/=]+)';")
CDN_SOURCE = "https://cdn.jsdelivr.net/npm/three@0.185.1/"


def stop(msg):
    sys.stderr.write("apply_sec: STOP, " + msg + "\n")
    sys.exit(2)


def sha256(text):
    return "'sha256-" + base64.b64encode(hashlib.sha256(text.encode("utf-8")).digest()).decode("ascii") + "'"


def once(html, needle, what):
    n = html.count(needle)
    if n != 1:
        stop("anchor for %s found %d times (want 1): %r" % (what, n, needle[:80]))


def import_maps(html):
    for a, what in ((IM_CONST, "logo3d LOCAL/CDN"), (IM_LOCAL, "logo3d local import map"), (IM_CDN, "logo3d CDN import map")):
        once(html, a, what)
    pins = IM_INTEGRITY.findall(html)
    if len(pins) != 6:
        stop("logo3d CDN integrity lines: found %d (want 6)" % len(pins))
    local = {"imports": {"three": "./vendor/three/three.module.js", "three/addons/": "./vendor/three/addons/"}}
    cdn = {"imports": {"three": CDN_SOURCE + "build/three.module.js", "three/addons/": CDN_SOURCE + "examples/jsm/"}, "integrity": {}}
    for path, pin in pins:
        cdn["integrity"][CDN_SOURCE + path] = pin
    # JSON.stringify(map): no spaces, keys in the order written
    return [json.dumps(local, separators=(",", ":")), json.dumps(cdn, separators=(",", ":"))]


INLINE_SCRIPT = re.compile(r"<script([^>]*)>(.*?)</script>", re.S)
HAS_SRC = re.compile(r"(?:^|\s)src\s*=")          # a real src attribute (not data-pep-src)


def policy(html):
    hashes = []
    for attrs, body in INLINE_SCRIPT.findall(html):
        if HAS_SRC.search(attrs):
            continue
        if 'type="importmap"' in attrs:
            stop("a static import map is in the page: check it is hashed like the others")
        hashes.append(sha256(body))
    if len(hashes) < 10:
        stop("only %d inline scripts found" % len(hashes))
    hashes += [sha256(m) for m in import_maps(html)]
    seen = []
    for h in hashes:
        if h not in seen:
            seen.append(h)
    return ("default-src 'none'; script-src 'self' " + " ".join(seen) + " " + CDN_SOURCE + "; "
            "style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; "
            "base-uri 'none'; form-action 'none'")


def main():
    if len(sys.argv) != 3:
        stop("usage: apply_sec.py IN.html OUT.html")
    src, dst = sys.argv[1], sys.argv[2]
    with open(src, "r", encoding="utf-8", newline="") as f:
        html = f.read()

    # 1 · the frame guard
    if MARK_GUARD in html:
        once(html, GUARD_ANCHOR + GUARD_CODE, "frame guard (already applied)")
    else:
        once(html, GUARD_ANCHOR, "core/pep.js start")
        html = html.replace(GUARD_ANCHOR, GUARD_ANCHOR + GUARD_CODE, 1)

    # 2 + 3 · the policy and the referrer meta, right after <meta charset>; the policy text is computed last
    block = re.compile(re.escape(HEAD_ANCHOR + MARK_HEAD + "\n") + r'<meta http-equiv="Content-Security-Policy" content="[^"]*">\n' + re.escape(REFERRER))
    if MARK_HEAD in html:
        if len(block.findall(html)) != 1:
            stop("policy block present but not in the expected shape")
        html = block.sub(lambda m: HEAD_ANCHOR + MARK_HEAD + "\n" + '<meta http-equiv="Content-Security-Policy" content="POLICY">\n' + REFERRER, html, count=1)
    else:
        once(html, HEAD_ANCHOR + HEAD_NEXT, "<meta charset> then <meta viewport>")
        if re.search(r"http-equiv=[\"']?content-security-policy|<meta[^>]+name=[\"']?referrer", html, re.I):
            stop("the page already has a policy or referrer meta of its own")
        html = html.replace(HEAD_ANCHOR, HEAD_ANCHOR + MARK_HEAD + "\n" + '<meta http-equiv="Content-Security-Policy" content="POLICY">\n' + REFERRER, 1)
    once(html, 'content="POLICY"', "policy placeholder")
    html = html.replace('content="POLICY"', 'content="' + policy(html) + '"', 1)

    with open(dst, "w", encoding="utf-8", newline="") as f:
        f.write(html)
    print("apply_sec: wrote %s (%d bytes)" % (dst, len(html.encode("utf-8"))))


if __name__ == "__main__":
    main()
