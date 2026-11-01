# NAV-103 · Ticker Nav

The section links run past in a slow, endless ticker across the header; it eases to a stop under the pointer, can be dragged and flung, glides to whichever link you tab to, and marks the section you are reading.

## Mount
```html
<link rel="stylesheet" href="library/NAV-103/module.css">
<script src="library/NAV-103/module.js"></script>
<script>const destroy = APX.NAV103.mount(rootElement /*, options */);</script>
```
Or add `data-apx-mount="NAV-103"` to the root element and it mounts itself on load. `mount()` is idempotent (a second call returns the same `destroy`), and `destroy()` restores the original markup.

Markup: header.apx-n103 > a.apx-n103__brand (span.apx-logo) + nav.apx-n103__track > ul.apx-n103__list > li > a[href="#section"] + a.apx-n103__cta

Options: `{speed:1, scroller:Element|null}` (scroller defaults to closest [data-apx-scroller] or the window)

## Tokens read
`--apx-accent`, `--apx-accent-ink`, `--apx-bg`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-line`, `--apx-motion`, `--apx-muted`, `--apx-surface`. Every value has a fallback, so the module renders even without tokens. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0.

Brand mark: menus use the `<span class="apx-logo">` slot (inline SVG or img), never hardcoded text.

## Accessibility
Only the first copy of the links is focusable; duplicates are aria-hidden + inert. Tabbing to a link stops the ticker and glides that link into view. Current section gets aria-current. Drag/fling with mouse or touch; clicks are suppressed after a drag. Reduced motion / `--apx-motion:0`: becomes a still, swipeable row.

Movement uses transform, opacity and clip-path only (small colour and border-colour state changes aside); pointer reads are cached and writes are batched into requestAnimationFrame. Dependencies: none.
