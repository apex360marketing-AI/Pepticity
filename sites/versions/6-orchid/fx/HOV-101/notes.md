# HOV-101 · Rising Tide

Pointing at the button fills it with colour from the bottom like rising liquid; the wavy surface sloshes toward the pointer and drains away when you leave.

## Mount
```html
<link rel="stylesheet" href="library/HOV-101/module.css">
<script src="library/HOV-101/module.js"></script>
<script>const destroy = APX.HOV101.mount(rootElement /*, options */);</script>
```
Or add `data-apx-mount="HOV-101"` to the root element and it mounts itself on load. `mount()` is idempotent (a second call returns the same `destroy`), and `destroy()` restores the original markup.

Markup: a.apx-h101 or button.apx-h101 (any inline content, e.g. text + svg). Mount on the element or a container.

Options: none

## Tokens read
`--apx-accent`, `--apx-accent-ink`, `--apx-font-text`, `--apx-ink`, `--apx-line`, `--apx-motion`, `--apx-radius`, `--apx-surface`. Every value has a fallback, so the module renders even without tokens. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0.

Brand mark: menus use the `<span class="apx-logo">` slot (inline SVG or img), never hardcoded text.

## Accessibility
The coloured copy of the label is aria-hidden, so the name is read once. Keyboard focus fills the button like hover; touch gets a quick fill-and-drain on tap. Reduced motion: fill is instant, no wave or slosh.

Movement uses transform, opacity and clip-path only (small colour and border-colour state changes aside); pointer reads are cached and writes are batched into requestAnimationFrame. Dependencies: none.
