# HOV-103 · Edge Light

One soft light follows the pointer across a group of glass cards, catching the edges of every card it passes near, not just the one underneath.

## Mount
```html
<link rel="stylesheet" href="library/HOV-103/module.css">
<script src="library/HOV-103/module.js"></script>
<script>const destroy = APX.HOV103.mount(rootElement /*, options */);</script>
```
Or add `data-apx-mount="HOV-103"` to the root element and it mounts itself on load. `mount()` is idempotent (a second call returns the same `destroy`), and `destroy()` restores the original markup.

Markup: div.apx-h103 > article.apx-h103__card (a link inside stretches over the card)

Options: `{reach:200}` (px distance at which neighbouring cards still catch the light)

## Tokens read
`--apx-accent`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-line`, `--apx-motion`, `--apx-muted`, `--apx-radius`, `--apx-surface`. Every value has a fallback, so the module renders even without tokens. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0.

Brand mark: menus use the `<span class="apx-logo">` slot (inline SVG or img), never hardcoded text.

## Accessibility
Light layers are aria-hidden. Keyboard focus inside a card lights its full edge and shows a focus ring; touch lights the edge briefly on tap. Pointer light only on fine pointers. Reduced motion: no moving light, focus/tap edge still works.

Movement uses transform, opacity and clip-path only (small colour and border-colour state changes aside); pointer reads are cached and writes are batched into requestAnimationFrame. Dependencies: none.
