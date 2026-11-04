# NAV-105 · Chapter Roll

The header always names the chapter you are reading; as you pass into the next one the name rolls over like a counter, a fine line fills through the chapter, and tapping the name drops a chapter list.

## Mount
```html
<link rel="stylesheet" href="library/NAV-105/module.css">
<script src="library/NAV-105/module.js"></script>
<script>const destroy = APX.NAV105.mount(rootElement /*, options */);</script>
```
Or add `data-apx-mount="NAV-105"` to the root element and it mounts itself on load. `mount()` is idempotent (a second call returns the same `destroy`), and `destroy()` restores the original markup.

Markup: header.apx-n105 > .apx-n105__bar (a.apx-n105__brand + button.apx-n105__now "Chapters") + ol.apx-n105__list > li > a[href="#section-id"]

Options: `{scroller:Element|null}`; button kicker text via data-kicker

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-line`, `--apx-motion`, `--apx-muted`, `--apx-radius`, `--apx-surface`. Every value has a fallback, so the module renders even without tokens. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0.

Brand mark: menus use the `<span class="apx-logo">` slot (inline SVG or img), never hardcoded text.

## Accessibility
Button aria-expanded/controls and an aria-label that names the current chapter ("Chapters: now reading X, chapter 2 of 5"); list items get aria-current; Up/Down arrows in the list, Esc closes, outside click closes. Choosing a chapter scrolls (smooth only when motion is on) and moves focus to that section.

Movement uses transform, opacity and clip-path only (small colour and border-colour state changes aside); pointer reads are cached and writes are batched into requestAnimationFrame. Dependencies: none.
