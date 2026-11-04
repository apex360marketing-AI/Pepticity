# LAY-102 · Panel Accordion

A row of tall slim panels where the one you point at, tap or tab to slides open wide to show its details while the others fold into labelled spines.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/LAY-102/module.css">
<div class="apx-lay102" data-apx="LAY-102" id="industries">
  <article class="apx-lay102__panel" data-open>
    <i class="apx-lay102__art" aria-hidden="true"></i>
    <button class="apx-lay102__tab" type="button"><span class="apx-lay102__num">01</span><span class="apx-lay102__name">Roofing</span><span class="apx-lay102__dot" aria-hidden="true"></span></button>
    <div class="apx-lay102__body"><h3>…</h3><p>…</p><a class="apx-lay102__cta" href="#">…</a></div>
  </article> … (3–7 panels)
</div>
<script src="library/LAY-102/module.js"></script>
```
Auto-mounts every `[data-apx="LAY-102"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX['LAY-102'].mount(el)` (also `window.APX.LAY102`). Mounting twice returns the same `destroy`; `destroy()` restores the original markup/styles.

## Options
`data-open` on the first-open panel. `--apx-lay102-h` (560px), `--apx-lay102-hv` (720px on phones), `--apx-lay102-spine` (88px), `--apx-lay102-spine-v` (64px). Autoplays every 6s until the visitor interacts.

## Tokens
`--apx-surface`, `--apx-ink`, `--apx-muted`, `--apx-accent`, `--apx-accent-ink`, `--apx-line`, `--apx-radius`, `--apx-font-display`, `--apx-font-text`, `--apx-motion` (all with fallbacks). `--apx-motion`: 0 = still, 1 = normal (scales durations/amplitudes). After changing tokens at runtime, dispatch `apx:tokens` on the element or window.

## Accessibility and performance
Spines are buttons with aria-expanded/aria-controls; arrow keys, Home and End move between them; closed bodies are `inert`. Hover opens after a short intent delay (mouse only). Layout uses transform + clip-path only. No JS: a plain stack. Phones: vertical spines.
Transform / opacity / clip-path only; one rAF loop per instance that sleeps when off screen or the tab is hidden; `prefers-reduced-motion` is treated as motion 0. Tested at 390px with no sideways scroll.
