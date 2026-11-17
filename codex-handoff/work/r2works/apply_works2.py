#!/usr/bin/env python3
"""apply_works2.py IN.html OUT.html : round 2 works fixes on the PEPTICITY store page (combined build of round 1).

Anchored on exact strings (never line numbers). Idempotent: run on its own output it writes the same bytes. Stops (writes
nothing, exit 2) on any anchor that is missing or not unique. Nothing seen changes: no style, layout, wording or position.
Only where the keyboard goes when a layer closes, and which open layers the scroll control holds the page for.

  F1  THE ONE-AT-A-TIME CARD (16-lineup, closeDetail). A description that closes for any reason other than Esc or its X (a
      step on with the arrow keys, PageDown or Space, a queued step, the stage travelling on) hid its X while the keyboard
      was on it, and nothing took the keyboard: it fell to the page itself. Now the keyboard goes back to the case, as Esc
      and X already did. (This is also the race behind round 1's one-off "L4 Esc ... back on the card" failure: on a busy
      machine the description could be closed by a late step BEFORE the Esc, and the keyboard was then already lost.)
  F2  THE FOUNDER CIRCLE BAR (45-hooks, closeBar). Its JOIN sheet takes the keyboard when it opens; closing it (Esc, its X,
      CLOSE) only blurred, so the keyboard fell to the page. Now it goes back to JOIN.
  F3  THE SCROLL CONTROL (core/governor.js, LAYERS). Two open layers were not on its list: a case's list of sizes on the
      stage, and the bar's JOIN sheet. With either open a wheel over the page moved the page (or the stage) behind it.
  F4  THE LIST OF SIZES (16-lineup, closeMenu). Closed by anything but its own keys (a wheel, a step, a queued step, the
      travel), it hid the listbox with the keyboard in it. Now the keyboard goes back to the case's bar.
  F5  THE LIST OF SIZES (16-lineup, its keydown). PageUp / PageDown were not the list's keys: the browser scrolled the page
      behind the open list by a screen (eight cases on the stage), the list closed and the case it belonged to went off
      stage with the keyboard's way back. Now they move to the first / last size, as Home / End already did.

ORDER WITH THE SECURITY PATCH: run this BEFORE /home/user/work/r2sec/apply_sec.py. That patch writes a CSP whose
script-src pins a sha256 of every inline script, computed from its own OUT; F1-F4 edit three inline scripts
(16-lineup, 45-hooks, core/governor), so apply_sec.py must hash the page after this one (or be run again).
"""
import sys

FIXES = [
    ("F1 lineup closeDetail: the keyboard back to the case however the description closes",
     """        var back = function () {
          w.li.removeAttribute('data-open'); w.detail.hidden = true; w.li.style.minHeight = '';
          if (refocus) { try { w.more.focus({ preventScroll: true }); } catch (e) { w.more.focus(); } }
        };""",
     """        var back = function () {
          // R2 WORKS F1: the keyboard inside the description (on its X) goes back to its case however the description
          // closes (Esc and X as before; a step on, a queued step or the stage travelling on too), never to the page
          var kept = refocus || (!!document.activeElement && w.detail.contains(document.activeElement));
          w.li.removeAttribute('data-open'); w.detail.hidden = true; w.li.style.minHeight = '';
          if (kept) { try { w.more.focus({ preventScroll: true }); } catch (e) { w.more.focus(); } }
        };"""),
    ("F4 lineup closeMenu: the keyboard back to the bar however the list of sizes closes",
     """        menuW = null; menuAt = -1;
        menu.hidden = true;
        w.li.removeAttribute('data-menu-open');
        w.bar.setAttribute('aria-expanded', 'false');
        if (refocus) { try { w.bar.focus({ preventScroll: true }); } catch (e) { w.bar.focus(); } }""",
     """        // R2 WORKS F4: the keyboard in the list goes back to the case's bar however the list closes, never to the page
        var kept = refocus || (!!document.activeElement && menu.contains(document.activeElement));
        menuW = null; menuAt = -1;
        menu.hidden = true;
        w.li.removeAttribute('data-menu-open');
        w.bar.setAttribute('aria-expanded', 'false');
        if (kept) { try { w.bar.focus({ preventScroll: true }); } catch (e) { w.bar.focus(); } }"""),
    ("F2 hooks closeBar: the keyboard back to JOIN when the sheet closes",
     """      barOpen = false;
      if (bar.contains(doc.activeElement)) { doc.activeElement.blur(); }
      bar.removeAttribute('data-open'); sheet.hidden = true; barRow.hidden = false; openB.setAttribute('aria-expanded', 'false');
      update();""",
     """      barOpen = false;
      // R2 WORKS F2: the keyboard that was in the sheet goes back to JOIN (the key that opened it), not to the page itself
      var had = bar.contains(doc.activeElement);
      bar.removeAttribute('data-open'); sheet.hidden = true; barRow.hidden = false; openB.setAttribute('aria-expanded', 'false');
      update();
      if (had) { focusQuiet(openB); if (bar.contains(doc.activeElement) && doc.activeElement !== openB) { doc.activeElement.blur(); } }"""),
    ("F5 lineup list of sizes: PageUp and PageDown are the list's own keys (first and last size), never the page's",
     """          else if (k === 'Home') { setActive(0); }
          else if (k === 'End') { setActive(os.length - 1); }""",
     """          else if (k === 'Home' || k === 'PageUp') { setActive(0); }                  // R2 WORKS F5: PageUp and PageDown too:
          else if (k === 'End' || k === 'PageDown') { setActive(os.length - 1); }      // the page behind an open list never jumps"""),
    ("F3 governor LAYERS: a case's list of sizes and the bar's JOIN sheet hold the page too",
     """  var LAYERS = '[data-module="header"][data-drop-open], [data-module="header"][data-menu-open], body > [data-module][data-open], [data-module="lineup"] .vc[data-open], dialog[open]';""",
     """  var LAYERS = '[data-module="header"][data-drop-open], [data-module="header"][data-menu-open], body > [data-module][data-open], [data-module="lineup"] .vc[data-open], dialog[open]' +
    ', [data-module="lineup"] .vc[data-menu-open], [data-hooks-bar][data-open]';      // R2 WORKS F3: a case's list of sizes and the FOUNDER CIRCLE bar's JOIN sheet are open layers too"""),
]


def main():
    if len(sys.argv) != 3:
        print("usage: apply_works2.py IN.html OUT.html")
        sys.exit(2)
    src = open(sys.argv[1], encoding="utf-8").read()
    out = src
    done = []
    for name, old, new in FIXES:
        if out.count(new) == 1:
            done.append(name + ": already applied")
            continue
        n = out.count(old)
        if n != 1:
            print("STOP: the anchor for '%s' is found %d times (needs exactly 1). Nothing written." % (name, n))
            sys.exit(2)
        out = out.replace(old, new, 1)
        done.append(name + ": applied")
    with open(sys.argv[2], "w", encoding="utf-8") as f:
        f.write(out)
    for d in done:
        print(d)
    print("apply_works2: wrote %s (%d bytes, %+d characters)" % (sys.argv[2], len(out.encode("utf-8")), len(out) - len(src)))


if __name__ == "__main__":
    main()
