#!/usr/bin/env python3
"""Round 3 security fixes for the PEPTICITY store page (one bundled file).

usage:  python3 -I apply_r3.py IN.html OUT.html

Runs BEFORE round 2's apply_sec.py, which re-hashes every inline script into the page's policy: never edit the page
after apply_sec.py. Anchored on exact strings. Idempotent: run on its own output it writes the same bytes. Stops
(writes nothing, exit 2) on a missing or repeated anchor. A visitor who is NOT framed gets nothing new: no element,
no attribute, no style, no wording, no change to any function.

  1. FRAME COVER (core/pep.js, right after the start of the module; once apply_sec.py has run it sits directly after
     round 2's frame guard). Framed by ANY parent:
       - a parent on this same origin also makes the page inert. Round 2 left same-origin frames alone; on the shared
         apex360marketing-ai.github.io origin any other repository's page could frame the store and press it.
       - the page's own dialogs stay shut. A modal dialog escapes inert: the footer sheet, opened from #privacy in the
         frame's address, showed and could be pressed inside another site's frame.
       - an opaque cover shows one link only, "Open PEPTICITY in its own tab" (target=_blank, rel="noopener
         noreferrer"), built with new URL from the page's own origin and path, never the frame's query or hash. The
         cover is a modal dialog, so it sits above everything and stays usable while the page under it is inert;
         if anything closes it (Escape), it opens again at once.
     A same-origin parent can still reach into the page and undo any guard: only the store's own domain closes that.
"""
import sys

MARK = "/* R3SEC:frame-cover */"
ANCHOR = "(function (win, doc) {\n  'use strict';\n  if (win.PEP) { return; }\n"
BLOCK = (
    "  " + MARK + "\n"
    "  // FRAMED BY ANY PAGE (round 3 security). Round 2's guard makes the page inert when another origin frames it. Two gaps\n"
    "  // were left: a page on this same shared origin (any other repository of the same github.io account) could frame the\n"
    "  // store and press it, and a framed store still showed in full (a modal dialog even escapes inert: the footer sheet,\n"
    "  // opened from #privacy in the frame's address, showed and could be pressed). So, framed by ANY parent: the page is\n"
    "  // inert, its own dialogs stay shut, and an opaque cover shows one thing only, a link that opens the store in its own\n"
    "  // tab. A visitor who is not framed gets nothing from this block.\n"
    "  try {\n"
    "    if (win.top !== win.self) {\n"
    "      var sameParent = false;\n"
    "      try { sameParent = win.top.location.origin === win.location.origin; } catch (err) { sameParent = false; }\n"
    "      if (sameParent) { doc.documentElement.setAttribute('inert', ''); }\n"
    "      var dialogs = win.HTMLDialogElement.prototype, openModal = dialogs.showModal;\n"
    "      var cover = doc.createElement('dialog'), out = doc.createElement('a');\n"
    "      dialogs.showModal = function () { if (this === cover) { openModal.call(this); } };\n"
    "      dialogs.show = function () {};\n"
    "      out.href = new URL(win.location.pathname, win.location.origin).href;\n"
    "      out.target = '_blank';\n"
    "      out.rel = 'noopener noreferrer';\n"
    "      out.textContent = 'Open PEPTICITY in its own tab';\n"
    "      out.style.cssText = 'display:inline-flex;align-items:center;min-height:44px;padding:10px 18px;color:#e6e9ed;'\n"
    "        + 'font-size:16px;font-weight:600;line-height:1.25;letter-spacing:.02em;text-decoration:underline;text-underline-offset:4px;'\n"
    "        + 'border-radius:2px;outline:none;outline-offset:3px';\n"
    "      out.addEventListener('focus', function () { out.style.outline = '2px solid #2a78ff'; });\n"
    "      out.addEventListener('blur', function () { out.style.outline = 'none'; });\n"
    "      cover.setAttribute('aria-label', 'PEPTICITY');\n"
    "      cover.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;max-width:none;max-height:none;margin:0;padding:0;border:0;'\n"
    "        + 'box-sizing:border-box;display:flex;align-items:center;justify-content:center;background:#0b0b0c;color:#e6e9ed;'\n"
    "        + 'opacity:1;visibility:visible;transform:none;animation:none;transition:none;z-index:2147483647;'\n"
    "        + 'font-family:system-ui,-apple-system,\"Segoe UI\",Roboto,Arial,sans-serif';   // the page's body type\n"
    "      cover.appendChild(out);\n"
    "      cover.addEventListener('close', function () { try { openModal.call(cover); } catch (err) { /* the page stays inert */ } });\n"
    "      doc.documentElement.appendChild(cover);\n"
    "      openModal.call(cover);\n"
    "    }\n"
    "  } catch (err) { /* no cover possible: the page stays inert */ }\n"
)


def stop(msg):
    sys.stderr.write("apply_r3: STOP, " + msg + "\n")
    sys.exit(2)


def main():
    if len(sys.argv) != 3:
        stop("usage: apply_r3.py IN.html OUT.html")
    src, dst = sys.argv[1], sys.argv[2]
    with open(src, "r", encoding="utf-8", newline="") as f:
        html = f.read()
    if MARK in html:
        if html.count(MARK) != 1 or html.count(BLOCK) != 1:
            stop("the round 3 frame cover is present but not in the expected shape")
    else:
        n = html.count(ANCHOR)
        if n != 1:
            stop("anchor for core/pep.js start found %d times (want 1)" % n)
        if "R2SEC:policy" in html:
            stop("the page already carries round 2's policy: run this BEFORE apply_sec.py (it re-hashes the inline scripts)")
        html = html.replace(ANCHOR, ANCHOR + BLOCK, 1)
    with open(dst, "w", encoding="utf-8", newline="") as f:
        f.write(html)
    print("apply_r3: wrote %s (%d bytes)" % (dst, len(html.encode("utf-8"))))


if __name__ == "__main__":
    main()
