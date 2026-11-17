#!/usr/bin/env python3
"""apply_works.py IN.html OUT.html

The works audit's edits to the PEPTICITY store page (audit5, Nov 14 2026). Every edit is anchored on an exact string that
must occur once; the script stops (exit 1) on an anchor that is missing or repeated, and skips an edit whose own marker is
already in the file, so a second run changes nothing. No edit touches the scroll control (wheel, section stops, the
lineup's pin and sequence logic, scroll-snap, scroll-behavior), so the scroll worker's patch applies after this one.

  W1  the header bar no longer covers an open description's name and X on the held stage (wide screens)     CSS + JS
  W2  the phone FOUNDER CIRCLE bar no longer covers the footer's last line                                    CSS
  O6  phone MENU / CART and the preview 3D / 4D keys answer a press over 44 px, drawn exactly as before        CSS
  L1  THE WHOLE LINEUP: 2 / 3 / 4 columns (under 700 / from 700 / from 1600), larger vials, a tidy last row     CSS
  L2  an opened item is the brief description: name, its one line, sizes and prices, ADD TO CART                JS
  L3  SEE MORE on an opened item opens the full card (a native dialog); closing it returns the keyboard          HTML + JS + CSS
  I6  red team: only the page's own stage words (TEAM / NEW) reach the dataLayer from the hero                 JS
  I2  red team: outside a preview the cart drops a [bracketed] placeholder product, as every other module does   JS
"""
import sys

EDITS = []


def edit(name, anchor, replacement, marker):
    EDITS.append((name, anchor, replacement, marker))


# ---------------------------------------------------------------- L1: columns, vial size, the band at the vial's foot
edit('L1 columns',
     '.pep-lineup-all-grid { grid-template-columns: repeat(auto-fill, minmax(min(100%, 168px), 1fr)); gap: 18px 14px; }\n',
     '''/* COLUMNS (owner, Nov 14 2026: "no more than 3 on a line, 4 if it's a full-size screen, and 2 on mobile"): 2 under
   700 px, 3 from 700 px, 4 from 1600 px, never more. Each vial takes two of twice as many tracks, so a short last row
   stands centred. --pep-lineup-vial-h: the height of one vial at that width (large and clean). */
.pep-lineup-all-grid { --pep-lineup-vial-h: clamp(240px, 24vw, 380px); grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 18px 14px; }
.pep-lineup-all-grid > .pep-lineup-item { grid-column: span 2; }
@media (min-width: 700px) and (max-width: 1599px) {
  .pep-lineup-item:nth-child(3n+1 of .pep-lineup-item):nth-last-child(1 of .pep-lineup-item) { grid-column: 3 / span 2; }
  .pep-lineup-item:nth-child(3n+1 of .pep-lineup-item):nth-last-child(2 of .pep-lineup-item) { grid-column: 2 / span 2; }
}
@media (min-width: 1600px) {
  .pep-lineup-all-grid { --pep-lineup-vial-h: clamp(300px, 19vw, 400px); grid-template-columns: repeat(8, minmax(0, 1fr)); }
  .pep-lineup-item:nth-child(4n+1 of .pep-lineup-item):nth-last-child(1 of .pep-lineup-item) { grid-column: 4 / span 2; }
  .pep-lineup-item:nth-child(4n+1 of .pep-lineup-item):nth-last-child(2 of .pep-lineup-item) { grid-column: 3 / span 2; }
  .pep-lineup-item:nth-child(4n+1 of .pep-lineup-item):nth-last-child(3 of .pep-lineup-item) { grid-column: 2 / span 2; }
}
@media (max-width: 699px) {
  .pep-lineup-all-grid { --pep-lineup-vial-h: clamp(180px, 56vw, 260px); grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px 10px; }
  .pep-lineup-item:nth-child(2n+1 of .pep-lineup-item):nth-last-child(1 of .pep-lineup-item) { grid-column: 2 / span 2; }
}
''',
     'grid-template-columns: repeat(6, minmax(0, 1fr))')

edit('L1 vial height',
     '.pep-lineup-item-vial { display: block; width: 100%; height: clamp(150px, 17vw, 218px); }',
     '.pep-lineup-item-vial { display: block; width: 100%; height: var(--pep-lineup-vial-h, clamp(150px, 17vw, 218px)); }',
     'height: var(--pep-lineup-vial-h, clamp(150px, 17vw, 218px))')

edit('L1 band at the foot of the vial',
     '.pep-lineup-item-btn .pep-lineup-wm--item { position: absolute; left: 0; right: 0; top: clamp(118px, 13vw, 170px); bottom: auto; flex: none; height: 22px; margin: 0; }',
     '.pep-lineup-item-btn .pep-lineup-wm--item { position: absolute; left: 0; right: 0; top: calc(14px + var(--pep-lineup-vial-h, 218px) * .71); bottom: auto; flex: none; height: 22px; margin: 0; }',
     'top: calc(14px + var(--pep-lineup-vial-h, 218px) * .71)')

edit('L1 phone block',
     '''@media (max-width: 599px) {
  .pep-lineup-all-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 10px; }
  .pep-lineup-item-vial { height: 150px; }
  .pep-lineup-item-btn .pep-lineup-wm--item { top: 118px; }
  .pep-lineup-item-name { font-size: 13.5px; }
}''',
     '''@media (max-width: 599px) {
  /* the grid, the vial and its band follow --pep-lineup-vial-h (above) */
  .pep-lineup-item-name { font-size: 13.5px; }
}''',
     '/* the grid, the vial and its band follow --pep-lineup-vial-h (above) */')

# ---------------------------------------------------------------- CSS: SEE MORE and the full card (L3), then W1, W2, O6
edit('CSS: SEE MORE, the full card, W1, W2, O6',
     '''  .pep-lineup-item-btn:hover .pep-lineup-item-vial img, .pep-lineup-item-btn:focus-visible .pep-lineup-item-vial img { transform: none; }
}
</style>
</head>''',
     '''  .pep-lineup-item-btn:hover .pep-lineup-item-vial img, .pep-lineup-item-btn:focus-visible .pep-lineup-item-vial img { transform: none; }
}
/* SEE MORE (owner, Nov 14 2026): on an opened item, after ADD TO CART, in the look of the lineup's own dark key (TELL ME
   WHEN IT'S BACK), as tall as ADD TO CART so the row stays level */
[data-module="lineup"] .pep-lineup-view .pep-lineup-restock[data-v-more] { flex: 0 0 auto; align-self: flex-end; height: var(--pep-lineup-add-h); margin-left: auto; }
/* the full card SEE MORE opens: a native dialog (the top layer: it holds the keyboard and Esc closes it). The card is the
   case's own clear glass at its size on the stage; around it the page goes to the cart's own dark under the footer sheet's
   own blur, so the glass reads as cleanly as it does on the stage. */
[data-module="lineup"] .pep-lineup-fullcard { max-width: none; max-height: none; margin: auto; padding: 0; border: 0; overflow: visible; color: inherit; background: none; }
[data-module="lineup"] .pep-lineup-fullcard::backdrop { background: rgba(4, 4, 5, .7); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); }
[data-module="lineup"] .pep-lineup-fullcard-case { position: relative; width: var(--pep-lineup-case); height: var(--pep-lineup-case-h); max-width: calc(100vw - 24px); max-height: calc(100vh - 24px); }
</style>
<style data-pep-src="audit5/works.css">
/* WORKS AUDIT (audit5, Nov 14 2026): only what did not work. Each rule names its finding (findings.json). */
/* W1: on a wide screen the bar stands over the top of the held stage. While a description is open there (the lineup marks
   the bar data-lineup-reading), the bar takes its own tucked place, so it never covers the description's name or its X;
   it comes back when the description closes, or as soon as the keyboard reaches it. */
@media (min-width: 1200px) {
  [data-module="header"][data-lineup-reading]:not(:focus-within):not([data-drop-open]):not([data-menu-open]) { transform: translateY(calc(-100% - 28px)); }
}
/* W2: on a phone the FOUNDER CIRCLE bar stands fixed at the foot of the window. While it shows, the footer keeps the bar's
   room under its last line, so the end of the page is never under it. */
@media (max-width: 767px) {
  body:has(.pep-hooks-bar[data-on]) [data-module="footer"] { padding-bottom: calc(clamp(20px, 3vh, 36px) + 112px); }
}
/* O6: the phone MENU and CART keys and the preview-only 3D / 4D keys answer a press over 44 px of height. The added height
   is a transparent border outside the box their picture, light and shape are laid in, taken back by an equal negative
   margin, so the layout and everything drawn stay exactly where they were. The 3D / 4D
   keys are cut on a slant (NOV12-FINAL: 15 px over their height): the slant is carried on into the border by exactly its
   own angle, so inside the drawn box the cut is where it was, and the border only widens where a press lands. */
@media (max-width: 1199px) {
  .pep-header-kwrap--menu .pep-header-key,
  .pep-header-kwrap--cart .pep-header-key {
    height: calc(max(calc(var(--pep-header-h) * .7), 40px) + 4px);
    border-block: 2px solid transparent;
    margin-block: -2px;
  }
}
.pep-lineup-depth-key { height: 44px; border-block: 2px solid transparent; margin-block: -2px; background-clip: padding-box; clip-path: polygon(15.75px 0, calc(100% + .75px) 0, calc(100% - 15.75px) 100%, -.75px 100%); }
@media (min-width: 360px) and (min-height: 480px) and (max-height: 640px) {
  .pep-lineup-depth-key { border-block-width: 6px; margin-block: -6px; clip-path: polygon(17.8125px 0, calc(100% + 2.8125px) 0, calc(100% - 17.8125px) 100%, -2.8125px 100%); }
}
@media (max-width: 599px) {
  [data-module="lineup"][data-held] .pep-lineup-depth-key { height: 44px; border-block-width: 7px; margin-block: -7px; clip-path: polygon(18.5px 0, calc(100% + 3.5px) 0, calc(100% - 18.5px) 100%, -3.5px 100%); }
}
</style>
</head>''',
     'data-pep-src="audit5/works.css"')

# ---------------------------------------------------------------- HTML: SEE MORE's words and the dialog it opens (L3)
edit('HTML: SEE MORE template',
     '''  <template data-tpl="view-add">
    <button class="pep-lineup-add" type="button" data-v-add><span class="pep-lineup-add-label">ADD <span data-v-size></span></span><span class="pep-lineup-add-done" aria-hidden="true">ADDED</span></button>
  </template>
''',
     '''  <template data-tpl="view-add">
    <button class="pep-lineup-add" type="button" data-v-add><span class="pep-lineup-add-label">ADD <span data-v-size></span></span><span class="pep-lineup-add-done" aria-hidden="true">ADDED</span></button>
  </template>
  <!-- SEE MORE on an opened item (owner, Nov 14 2026): it opens the case's full card. The look of the lineup's own dark key. -->
  <template data-tpl="view-more"><button class="pep-lineup-restock" type="button" data-v-more>SEE MORE</button></template>
''',
     'data-tpl="view-more"')

edit('HTML: the full card dialog',
     '''    <ol class="pep-lineup-all-grid" role="list" data-all-grid></ol>
  </section>''',
     '''    <ol class="pep-lineup-all-grid" role="list" data-all-grid></ol>
    <!-- SEE MORE opens here: the case's own glass and its whole description, at its size on the stage (filled by the script) -->
    <dialog class="pep-lineup-fullcard" data-fullcard aria-labelledby="pep-lineup-full-name"></dialog>
  </section>''',
     'data-fullcard aria-labelledby')

# ---------------------------------------------------------------- JS: the brief description and SEE MORE (L2, L3)
edit('JS: the opened item is brief',
     "        q('[data-v-case]', box).appendChild(copy);\n",
     "        q('[data-v-case]', box).appendChild(copy);\n"
     "        brief(w, det);                                          // WORKS AUDIT L2 and L3: the brief description, and SEE MORE\n",
     'brief(w, det);')

edit('JS: brief, the full card',
     '      // the picture of a case is asked for only when the case is near the centre\n',
     '''      /* ---------------- WORKS AUDIT (Nov 14 2026): THE BRIEF DESCRIPTION and SEE MORE ----------------
         The owner: the little arrow "should drop down and give them a brief description"; "the ones down below, they have
         to hit see more, and then it'll take them to a full-size version of it". An opened item keeps the name, its one
         line, the sizes and prices and ADD TO CART; its rows, its notes and MORE DETAIL COMING wait on the full card.
         SEE MORE opens the full card: the case's own glass and its whole description, at the size the case stands on the
         stage, over the page in a native dialog. X, Esc or a press beside the card closes it, and the keyboard goes back
         to SEE MORE. Every word is in lineup.html. */
      var fullFrom = null;
      function brief(w, det) {
        qa('[data-d-rows], [data-d-coming], [data-d-notes]', det).forEach(function (el) { el.parentNode.removeChild(el); });
        var full = q('[data-fullcard]'), more = full && typeof full.showModal === 'function' ? tpl('view-more') : null;
        if (!more) { return; }
        more.setAttribute('aria-haspopup', 'dialog');
        more.setAttribute('aria-describedby', 'pep-lineup-view-name');
        more.addEventListener('click', function () { openFull(w, more); });
        (q('[data-v-buy]', det) || det).appendChild(more);
      }
      function openFull(w, from) {
        var full = q('[data-fullcard]'), pane = q('.vc-pane', w.li);
        if (!full || !pane || full.open || typeof full.showModal !== 'function') { return; }
        var copy = pane.cloneNode(true), card = document.createElement('div');
        // the glass and the whole back of the case: its front, the button over it, its light and its shade stay on the stage
        qa('.pep-lineup-more, .pep-lineup-front, .vc-sweep, .pep-lineup-shade', copy).forEach(function (el) { el.parentNode.removeChild(el); });
        qa('[id]', copy).forEach(function (el) { el.removeAttribute('id'); });
        var det = q('[data-detail]', copy), x = det && q('[data-x]', det), nm = det && q('[data-d-name]', det);
        if (!det) { return; }
        det.hidden = false;
        if (nm) { nm.id = 'pep-lineup-full-name'; }
        if (x) { x.addEventListener('click', function (e) { e.stopPropagation(); full.close(); }); }
        // the corner cuts this case has on the stage (its size comes from the stage's own measures, in the css)
        var cs = window.getComputedStyle(w.li);
        ['--a', '--b', '--c', '--d'].forEach(function (p) { var v = cs.getPropertyValue(p).trim(); if (v) { card.style.setProperty(p, v); } });
        card.className = 'pep-lineup-fullcard-case';
        card.setAttribute('data-sku', w.sku);
        if (w.flag) { card.setAttribute('data-flagged', ''); }
        card.appendChild(copy);
        while (full.firstChild) { full.removeChild(full.firstChild); }
        full.appendChild(card);
        fullFrom = from || null;
        full.showModal();
        if (x) { try { x.focus({ preventScroll: true }); } catch (e) { x.focus(); } }
        ctx.track('lineup_detail', { sku: w.sku, state: 'full' });
      }
      function wireFull() {
        var full = q('[data-fullcard]');
        if (!full || typeof full.showModal !== 'function') { return; }
        full.addEventListener('close', function () {
          if (full.open) { return; }                    // a late close event, after the card was opened again: nothing to undo
          while (full.firstChild) { full.removeChild(full.firstChild); }
          var to = fullFrom; fullFrom = null;
          // after the browser's own return of focus (which goes wherever the keyboard was: on a phone a tap does not move it)
          if (to && document.documentElement.contains(to)) { setTimeout(function () { if (full.open) { return; } try { to.focus({ preventScroll: true }); } catch (e) { to.focus(); } }, 0); }
        });
        full.addEventListener('click', function (e) { if (e.target === full) { full.close(); } });     // a press beside the card
        // the page behind waits while the card is open: no key pressed in it reaches the stage (Esc closes the card itself)
        full.addEventListener('keydown', function (e) { e.stopPropagation(); });
      }
      // W1 (works audit): the bar is told while a description is open on the held stage, so its css can step it away
      function watchReading() {
        var bar = document.querySelector('[data-module="header"]');
        if (!bar || !window.MutationObserver) { return; }
        new MutationObserver(function () {
          if (root.hasAttribute('data-held') && root.hasAttribute('data-reading')) { bar.setAttribute('data-lineup-reading', ''); } else { bar.removeAttribute('data-lineup-reading'); }
        }).observe(root, { attributes: true, attributeFilter: ['data-reading', 'data-held'] });
      }

      // the picture of a case is asked for only when the case is near the centre
''',
     'function openFull(w, from) {')

edit('JS: wire the full card once the list is built',
     '        all.hidden = false;\n',
     '        all.hidden = false;\n'
     '        wireFull(); watchReading();                             // WORKS AUDIT L3, W1\n',
     'wireFull(); watchReading();')


# ---------------------------------------------------------------- Part 3: red-team findings that can be fixed in the page
edit('I6 only the page\'s own stage words reach the dataLayer',
     "      ctx.track('ask_view', { hook: 'H01', slot: 'hero', state: (flow && flow.stage) || 'NEW' });\n",
     "      ctx.track('ask_view', { hook: 'H01', slot: 'hero', state: flow && flow.stage === 'TEAM' ? 'TEAM' : 'NEW' });   // WORKS AUDIT I6: only the page's own stage words reach the dataLayer\n",
     "state: flow && flow.stage === 'TEAM' ? 'TEAM' : 'NEW' });   // WORKS AUDIT I6")

edit('I2 the cart drops a [bracketed] placeholder product outside a preview, as every other module does',
     "          if (hidden.indexOf(String(p.sku)) >= 0) { return; }   // held back for counsel review (config.js): no button, saved cart or shared link can add it\n",
     "          if (hidden.indexOf(String(p.sku)) >= 0) { return; }   // held back for counsel review (config.js): no button, saved cart or shared link can add it\n"
     "          if (!flags.PREVIEW && p.name.indexOf('[') >= 0) { return; }   // WORKS AUDIT I2: a [bracketed] placeholder name is preview only, here as everywhere else\n",
     "// WORKS AUDIT I2:")


def main():
    if len(sys.argv) != 3:
        sys.exit('usage: apply_works.py IN.html OUT.html')
    src = open(sys.argv[1], encoding='utf-8').read()
    done = 0
    for name, anchor, replacement, marker in EDITS:
        if marker in src:
            print('already in: ' + name)
            continue
        n = src.count(anchor)
        if n != 1:
            print('STOP: the anchor for "%s" occurs %d times (needs exactly 1)' % (name, n))
            sys.exit(1)
        src = src.replace(anchor, replacement, 1)
        if marker not in src:
            print('STOP: "%s" applied but its marker is missing' % name)
            sys.exit(1)
        done += 1
        print('applied: ' + name)
    open(sys.argv[2], 'w', encoding='utf-8').write(src)
    print('%d of %d edits applied, %d were already in' % (done, len(EDITS), len(EDITS) - done))


if __name__ == '__main__':
    main()
