# LAY-15 · Lit Window Facade

Every industry is one window in a single building. The windows light up one by one in a scattered order as the facade comes into view (a small "LIT 07 / 33" counter on the cornice keeps count), then flicker now and then. Hover, focus or tap a window and it answers in the accent while a glass card shows its details (category, lead value, busiest months). A filter switch dims the windows outside the chosen group. Behind each lit pane sits a silhouette of the trade.

Weight: Medium · Dependencies: none (vanilla JS, no CDN, no GSAP) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/LAY-15/module.css">
<section class="apx-lay15" data-apx="LAY-15" aria-label="Industries">
  <div class="apx-lay15__inner">
    <div class="apx-lay15__head">
      <div><p class="apx-lay15__kicker">Every window is a market</p><h2>33 INDUSTRIES. ONE LIT WINDOW EACH.</h2><p class="apx-lay15__lede">…</p></div>
      <div class="apx-lay15__filters" role="group" aria-label="Filter industries">
        <button type="button" data-f="all" aria-pressed="true">All 33</button><button type="button" data-f="high" aria-pressed="false">High-ticket</button><button type="button" data-f="std" aria-pressed="false">Trades</button>
      </div>
    </div>
    <div class="apx-lay15__building">
      <ol class="apx-lay15__windows">
        <li data-cat="std" data-value="$500 – $5k" data-peak="3,4,5,9,10,11" data-icon="M2 12L12 3l10 9 M5 10v11h14V10 M10 21v-6h4v6">Roofing</li> …
      </ol>
    </div>
  </div>
</section>
<script src="library/LAY-15/module.js"></script>
```
Auto-mounts every `[data-apx="LAY-15"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX['LAY-15'].mount(el, opts)` (also `window.APX.LAY15`). Mounting twice returns the same `destroy`; `destroy()` restores the original list and filter states.
Each `<li>` becomes one window. Attributes: `data-cat` (group key; `high` windows get tall two-lite glazing with blinds, others four-lite), `data-value` (lead value text; only real, sourced figures or a `[placeholder]`), `data-peak` (busiest months, 1-12), `data-icon` (a 24x24 SVG path for the silhouette). All optional. Works with any number of windows; 11 / 6 / 3 columns by container width (container queries).
Selecting a window fires `apx:select` on the section with `{ index, name, cat }` (e.g. to pre-fill a form).

## Options
`data-cat-labels` (`high:High-ticket,std:Local trade`), `data-value-suffix` (`per lead`), `data-count-label` (`Lit`), `data-months` (`J,F,M,…`). Same keys in `mount(el, {...})`: `catLabels, valueSuffix, countLabel, months`.

## Tokens
`--apx-bg` (night facade; a light ground turns the building graphite with pale glass), `--apx-ink` (lit glass), `--apx-muted` (labels), `--apx-accent` (selected window, beacon, peak months, value), `--apx-accent-ink` (silhouette on a deep accent), `--apx-surface`, `--apx-line`, `--apx-radius`, `--apx-font-display`, `--apx-font-text`, `--apx-motion`. All have fallbacks. After changing tokens at runtime, dispatch `apx:tokens`.

## Accessibility and performance
Every window is a real `<button>` with a full label (name, category, value); the details card is a polite live region; arrow keys move between windows, Escape closes the card; dimmed windows leave the tab order. Light changes are opacity layers only (no background animation); the glass reflection is a transform; the light-up sequence and flicker run in one rAF loop that sleeps off screen and in hidden tabs.
Reduced motion / `--apx-motion: 0`: all windows lit at once, no flicker, no reflection, instant card. Tested at 390px with no sideways scroll.
