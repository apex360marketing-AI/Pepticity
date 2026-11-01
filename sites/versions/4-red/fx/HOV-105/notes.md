# HOV-105 · Plucked String

Text links sit on a fine line that behaves like a guitar string: it bends toward the pointer as you cross it, then snaps back and quivers before settling.

## Mount
```html
<link rel="stylesheet" href="library/HOV-105/module.css">
<script src="library/HOV-105/module.js"></script>
<script>const destroy = APX.HOV105.mount(rootElement /*, options */);</script>
```
Or add `data-apx-mount="HOV-105"` to the root element and it mounts itself on load. `mount()` is idempotent (a second call returns the same `destroy`), and `destroy()` restores the original markup.

Markup: a.apx-h105 (single line). Mount on the link or a container of links.

Options: `{segments:28}`

## Tokens read
`--apx-accent`, `--apx-ink`, `--apx-motion`. Every value has a fallback, so the module renders even without tokens. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0.

Brand mark: menus use the `<span class="apx-logo">` slot (inline SVG or img), never hardcoded text.

## Accessibility
String is aria-hidden; link text unchanged. Keyboard focus gives a small pluck plus a focus ring; touch plucks on tap. Reduced motion: the line stays still, colour feedback only.

Movement uses transform, opacity and clip-path only (small colour and border-colour state changes aside); pointer reads are cached and writes are batched into requestAnimationFrame. Dependencies: none.
