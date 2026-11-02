# GLS-103 · Molten Numerals

Numbers made of liquid chrome. When a value changes, the old digits melt from left to right into mercury droplets, the drops run along in a stream just under the number and climb back up into the new digits. Thin silver light arcs circle behind, with one tiny accent spark. At rest the number is crisp, rounded chrome that slowly catches the light as you move the pointer (or scroll, on touch).

Weight: Medium · Dependencies: none (vanilla JS + WebGL 1, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/GLS-103/module.css">
<div class="apx-gls103" data-apx="GLS-103" data-value="$249" style="font-size:clamp(64px,15vw,232px)"></div>
<script src="library/GLS-103/module.js"></script>
```
Auto-mounts every `[data-apx="GLS-103"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX['GLS-103'].mount(el, { value: '$249' })` (also `window.APX.GLS103`). Mounting twice returns the same `destroy`; `destroy()` frees the WebGL context and restores the original markup.
Size it with `font-size` on the element (it is `display:block`; use `text-align` to place the number). Values are short strings: digits, `$`, `,`, `.`, `%`, `+`, `/`, `[ ]` all work. Only show real figures or clearly marked placeholders (e.g. `[000]`, or a price labelled SAMPLE).

## Changing the value
Any of these melts the number into the new value (the screen-reader text updates at once, `aria-live="polite"`):
- `el.setAttribute('data-value', '06')`
- `el.dispatchEvent(new CustomEvent('apx:value', { detail: { value: '06' } }))` (or `detail: '06'`)
- `el.__apxGLS103.set('06')` · `el.__apxGLS103.get()` · `el.__apxGLS103.replay()` (re-run the reveal)
Changes made while a melt is running are queued; only the latest one plays next.
First reveal: when the number first scrolls into view, droplets condense from below into it. `data-reveal="none"` skips that (the number is just there).

## Options
- `data-value` / `{ value }` — the number (otherwise the element's text is used).
- `data-reveal="none"` / `{ reveal: 'none' }` — no condensing reveal.
- CSS: `--apx-gls103-weight` (700) and `--apx-gls103-tracking` (.01em). Heavy, wide display faces look best (the demo uses Syncopate and Unbounded).

## Tokens
`--apx-font-display` (the digits), `--apx-ink` (highlight colour of the chrome, arcs), `--apx-muted` (mid-tones in the reflections), `--apx-bg` (deep tones; a light `--apx-bg` switches to polished graphite chrome with a soft shadow underneath), `--apx-accent` (the one spark on the arcs), `--apx-motion` (0 = still). All have fallbacks. After changing tokens at runtime, dispatch `apx:tokens` on the element or window.

## Accessibility and performance
The real number is ordinary text in the element (selectable, read by screen readers, keeps the layout); the liquid is drawn over it on an `aria-hidden` canvas, and the arcs are an `aria-hidden` SVG.
One WebGL context per number, created only when it first comes near the screen; the loop runs only while it is on screen and the tab is visible. Each value is turned into a smooth distance field once (a few ms), droplets are 46–84 soft points merged in a half-size buffer, and the final pass is one full-canvas shader. Pixel ratio capped (2 desktop, 1.5 phones); phones use fewer droplets. The melt runs on the real clock, so slow devices still finish in about 1.75 s.
Reduced motion / `--apx-motion: 0`: a finished chrome still, value changes swap instantly, arcs hold still. No WebGL (or a lost context): the number shows as brushed chrome type and changes with a short soft blur.
