# NAV-04 · Elevator Floors

An elevator-style header. The floor readout counts down from the top floor to G as you scroll down (the digits roll, the arrow flips when you head back up, a tiny car moves down its shaft). Floors opens a brushed-metal panel: it unfolds from the centre, the two car doors slide apart (a hairline of accent light at the seam) and the round floor buttons rise in. Each button wears the floor number of its section and flies you there with an eased scroll you can interrupt.

Weight: Medium · Dependencies: none (vanilla JS, no CDN, no GSAP / Lenis) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/NAV-04/module.css">
<header class="apx-nav04" data-apx="NAV-04" data-floors-from="33">
  <div class="apx-nav04__bar">
    <a class="apx-nav04__brand" href="#roof">APEX</a>
    <div class="apx-nav04__floor" aria-hidden="true"></div>
    <button class="apx-nav04__btn" type="button">Floors</button>
  </div>
  <nav class="apx-nav04__panel" aria-label="Floors">
    <ol>
      <li><a href="#roof" data-sub="Start">Rooftop</a></li>
      <li><a href="#ask" data-sub="01 · Capture">They ask</a></li> …
    </ol>
  </nav>
</header>
…
<section id="roof">… <span class="apx-nav04-mark" aria-hidden="true"></span></section>
<script src="library/NAV-04/module.js"></script>
```
Auto-mounts every `[data-apx="NAV-04"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX['NAV-04'].mount(el, opts)` (also `window.APX.NAV04`). Mounting twice returns the same `destroy`; `destroy()` restores the original markup (plain list of links).
The buttons are built from the in-page links in the panel list. Floor numbers are spread from `data-floors-from` (first linked section) down to G (last); give a link `data-key` to set its label yourself. Any `.apx-nav04-mark` inside a linked section is filled with that floor number (big outlined numerals); the current section gets the class `apx-nav04-here`. Pressing a button fires `apx:navigate` with `{ index, id, floor }`. The header is `position: sticky` by default; add `apx-nav04--fixed` for a fixed bar. The URL hash is never changed.

## Options
`data-floors-from` (33), `data-ground` (`G`), `data-floor-label` (`Floor`), `data-panel-head` (`Select a floor`), `data-esc-hint` (`Esc to close`), `data-close-label` (`Close`). Keys: `floorsFrom, ground, floorLabel, panelHead, escHint, closeLabel`.

## Tokens
`--apx-bg` and `--apx-ink` (the brushed metal is mixed from both; a light ground gives pale steel), `--apx-muted`, `--apx-accent` (readout digits, button rings, door seam, beacon), `--apx-line`, `--apx-radius`, `--apx-font-display` (wordmark, floor marks), `--apx-font-text`, `--apx-motion`. All have fallbacks. After changing tokens at runtime, dispatch `apx:tokens`.

## Accessibility and performance
Real links in a labelled `<nav>`; the toggle has `aria-expanded` / `aria-controls`; focus moves into the panel, is trapped while open, arrow keys move between buttons, Escape closes and returns focus; the current floor link has `aria-current="location"`. No animation loop: one rAF-throttled passive scroll listener; positions are measured on resize only. Doors, panel and buttons use transform / opacity / clip-path only.
Phones: the panel becomes a bottom sheet. Reduced motion / `--apx-motion: 0`: no doors or rolling digits, the panel just fades, buttons jump straight to the floor. Tested at 390px with no sideways scroll.
