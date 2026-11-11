# GLS-105 · Living Condensation

The section sits behind fogged, beaded glass. Fine mist plus water beads of many sizes cover it, and every bead is a tiny lens that shows a flipped picture of what is behind. A pointer or finger wipes the glass clear along its path; the pushed water gathers at the edges of the wipe, heavy drops let go and run down leaving clear channels and a trail of tiny beads, and the fog slowly breathes back over. On first view a short word (the business name) is written into the fog as if by a finger, with water collecting at the foot of the letters.

Weight: Heavy · Dependencies: none (vanilla JS, raw WebGL 1 + 2D canvas, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/GLS-105/module.css">
<section class="apx-g105" data-apx="GLS-105" data-word="APEX" aria-label="New jobs, straight to your phone">
  <div class="apx-g105__behind">
    <span class="apx-g105__kicker">Verified leads · [City]</span>
    <h2 class="apx-g105__title">NEW JOBS, STRAIGHT TO YOUR PHONE</h2>
    <p class="apx-g105__text">Exclusive, checked leads for your trade. [Your verification process]</p>
  </div>
  <div class="apx-g105__front">
    <a class="apx-g105__cta" href="#area">See my area</a>
    <span class="apx-g105__hint" aria-hidden="true"><span data-mouse>Wipe the glass</span><span data-touch>Wipe with your finger</span></span>
  </div>
</section>
<script src="library/GLS-105/module.js"></script>
```
Auto-mounts every `[data-apx="GLS-105"]` (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true`).
Manual: `const destroy = window.APX.GLS105.mount(el)` (also `window.APX['GLS-105']`). Mounting twice returns the same `destroy`; `destroy()` removes the canvas and shows the original markup again.

## How it is built
- `.apx-g105__behind` holds real text (headings, paragraphs, labels). It stays in the page for screen readers and layout; the module paints a word-by-word picture of it, fitted to the real line positions, and the glass shows that picture (sharp where wiped, soft through fog, flipped inside each bead).
- `.apx-g105__front` sits on the near side of the glass: buttons and links there stay crisp and clickable.
- The fog is a field of cells that the pointer clears and that slowly refills (each cell waits, then returns at its own pace, with a slow breathing rhythm). Drops are simulated particles drawn into a lens map: wipes push standing water to the edges of the path, drops merge, heavy ones run with stick-and-slip motion, clear a channel and shed tiny beads.

## Options
- `data-word="APEX"`: the short word written into the fog on first view (keep it to one word or a short name; leave empty to skip). It is placed automatically in the largest empty patch of glass, away from the text and buttons.

## Interaction
- Mouse / pen: moving over the glass wipes it (wider while a button is held).
- Touch: dragging a finger wipes it, and the page still scrolls normally (touch listeners are passive).
- Keyboard: when focus enters the section, the glass clears itself over the text in wide back-and-forth strokes, so keyboard users can read everything.

## Tokens read
`--apx-bg`, `--apx-ink`, `--apx-muted`, `--apx-accent`, `--apx-surface`, `--apx-line`, `--apx-font-display`, `--apx-font-text`, `--apx-motion`. Dark or light ground is detected from `--apx-bg`; the light behind the glass is always a cold silver (never warm). Change tokens and dispatch `apx:tokens` to rebuild (the picture of the text is re-taken too, and again on resize and when fonts finish loading).

## Accessibility and performance
`prefers-reduced-motion` or `--apx-motion:0`: a finished still with the middle of the pane wiped clear so all text reads, fog and beads round the edges, and a few frozen runs. The canvas is `aria-hidden`; the real text stays in the DOM. Forced-colours mode hides the canvas and shows the plain text.
One WebGL context per instance, one full-screen pass (device pixel ratio capped at 1.5 desktop / 1.6 phone); the fog field is about 4px per cell on desktop and 6px on phones; drops capped at 190 / 110. The loop sleeps off-screen and in hidden tabs. Without WebGL (or after a lost context) the section simply shows its text with no glass. Tested at 390px with no sideways scroll.
