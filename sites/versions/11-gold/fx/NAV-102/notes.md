# NAV-102 · Split Preview

The menu opens as two halves sliding in from opposite edges: links on one side, and on the other a live miniature of the section you point at, which wipes in as you move down the list.

## Mount
```html
<link rel="stylesheet" href="library/NAV-102/module.css">
<script src="library/NAV-102/module.js"></script>
<script>const destroy = APX.NAV102.mount(rootElement /*, options */);</script>
```
Or add `data-apx-mount="NAV-102"` to the root element and it mounts itself on load. `mount()` is idempotent (a second call returns the same `destroy`), and `destroy()` restores the original markup.

Markup: header.apx-n102 > .apx-n102__bar (brand + button.apx-n102__toggle) + nav.apx-n102__panel > .apx-n102__left > ul.apx-n102__list > li > (a + optional div.apx-n102__pv preview), optional p.apx-n102__meta. Preview kit classes: __card, __k, __h, __t, __chips, __rows, __tag

Options: `{lockScroll:true}`

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-line`, `--apx-motion`, `--apx-muted`, `--apx-radius`, `--apx-surface`. Every value has a fallback, so the module renders even without tokens. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0.

Brand mark: menus use the `<span class="apx-logo">` slot (inline SVG or img), never hardcoded text.

## Accessibility
Toggle aria-expanded/controls; panel inert when closed; previews are aria-hidden (the links carry the meaning); links get aria-current for the previewed item; Up/Down arrows move between links, Tab is trapped, Esc closes. Under 600px container width the preview becomes a bottom strip.

Movement uses transform, opacity and clip-path only (small colour and border-colour state changes aside); pointer reads are cached and writes are batched into requestAnimationFrame. Dependencies: none.
