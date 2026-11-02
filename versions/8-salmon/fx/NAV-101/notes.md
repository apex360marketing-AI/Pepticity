# NAV-101 · Curtain Letters

The menu drops like a theatre curtain led by a thin line of colour, and each link rises letter by letter in a wave; pointing at a link lifts it and writes its name huge in the background.

## Mount
```html
<link rel="stylesheet" href="library/NAV-101/module.css">
<script src="library/NAV-101/module.js"></script>
<script>const destroy = APX.NAV101.mount(rootElement /*, options */);</script>
```
Or add `data-apx-mount="NAV-101"` to the root element and it mounts itself on load. `mount()` is idempotent (a second call returns the same `destroy`), and `destroy()` restores the original markup.

Markup: header.apx-n101 > .apx-n101__bar (a.apx-n101__brand > span.apx-logo, button.apx-n101__toggle "Menu") + nav.apx-n101__panel > ul.apx-n101__list > li > a, optional .apx-n101__aside (contact text + a.apx-n101__cta)

Options: `{lockScroll:true}`; events: `apx:menu` (detail.open)

## Tokens read
`--apx-accent`, `--apx-accent-ink`, `--apx-bg`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-line`, `--apx-motion`, `--apx-muted`, `--apx-radius`, `--apx-surface`. Every value has a fallback, so the module renders even without tokens. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0.

Brand mark: menus use the `<span class="apx-logo">` slot (inline SVG or img), never hardcoded text.

## Accessibility
Toggle has aria-expanded/aria-controls and swaps its aria-label; closed panel is `inert`; focus moves to the first link on open, Tab is trapped, Esc closes and returns focus. Split letters are aria-hidden and each link keeps an aria-label with its plain text. Reduced motion / `--apx-motion:0`: curtain and letters appear instantly.

Movement uses transform, opacity and clip-path only (small colour and border-colour state changes aside); pointer reads are cached and writes are batched into requestAnimationFrame. Dependencies: none.
