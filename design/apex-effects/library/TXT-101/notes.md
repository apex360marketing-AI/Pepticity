# TXT-101 · Orbit Caption

A line of text circles a round button like a seal; it turns faster when you scroll, reverses when you scroll back, and slows when you point at it.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/TXT-101/module.css">
<a class="apx-txt101" data-apx="TXT-101" href="#" data-text="Verified · Exclusive · Sent to your phone ·">Get leads</a>
<!-- or a non-link cue -->
<div class="apx-txt101" data-apx="TXT-101" data-variant="quiet" data-text="Scroll to explore ·"><span class="sr-only">Scroll to explore</span></div>
<script src="library/TXT-101/module.js"></script>
```
Auto-mounts every `[data-apx="TXT-101"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX['TXT-101'].mount(el)` (also `window.APX.TXT101`). Mounting twice returns the same `destroy`; `destroy()` restores the original markup/styles.

## Options
`data-text` (ring text; a separator is added if missing), `data-variant="quiet"` (muted ring), `--apx-txt101-size` (default 172px).

## Tokens
`--apx-surface`, `--apx-ink`, `--apx-muted`, `--apx-accent`, `--apx-accent-ink`, `--apx-line`, `--apx-font-text`, `--apx-motion` (all with fallbacks). `--apx-motion`: 0 = still, 1 = normal (scales durations/amplitudes). After changing tokens at runtime, dispatch `apx:tokens` on the element or window.

## Accessibility and performance
Ring text is decorative (aria-hidden); the label inside is the accessible name. Hover/focus slows the ring and fills the core; visible focus ring. Motion 0 / reduced motion: ring holds still.
Transform / opacity / clip-path only; one rAF loop per instance that sleeps when off screen or the tab is hidden; `prefers-reduced-motion` is treated as motion 0. Tested at 390px with no sideways scroll.
