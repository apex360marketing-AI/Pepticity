# HOV-102 · Letter Roll

Pointing at a button or link makes every letter roll over to an italic twin in a quick wave that starts from the side you came in from, while the arrow slides through.

## Mount
```html
<link rel="stylesheet" href="library/HOV-102/module.css">
<script src="library/HOV-102/module.js"></script>
<script>const destroy = APX.HOV102.mount(rootElement /*, options */);</script>
```
Or add `data-apx-mount="HOV-102"` to the root element and it mounts itself on load. `mount()` is idempotent (a second call returns the same `destroy`), and `destroy()` restores the original markup.

Markup: a|button.apx-h102 (variants .apx-h102--solid, .apx-h102--link; data-icon="arrow" adds a sliding arrow). Plain text content.

Options: none

## Tokens read
`--apx-accent`, `--apx-accent-ink`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-line`, `--apx-motion`, `--apx-radius`, `--apx-surface`. Every value has a fallback, so the module renders even without tokens. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0.

Brand mark: menus use the `<span class="apx-logo">` slot (inline SVG or img), never hardcoded text.

## Accessibility
Letters are aria-hidden; the element gets aria-label with the clean text. Keyboard focus rolls the letters; touch rolls on tap. Reduced motion: swap is instant.

Movement uses transform, opacity and clip-path only (small colour and border-colour state changes aside); pointer reads are cached and writes are batched into requestAnimationFrame. Dependencies: none.
