# HOV-104 · Lead Trail

Moving the pointer across the section leaves a trail of small sample-lead cards that pop up where you pass and drift away, so visitors literally see leads following them.

## Mount
```html
<link rel="stylesheet" href="library/HOV-104/module.css">
<script src="library/HOV-104/module.js"></script>
<script>const destroy = APX.HOV104.mount(rootElement /*, options */);</script>
```
Or add `data-apx-mount="HOV-104"` to the root element and it mounts itself on load. `mount()` is idempotent (a second call returns the same `destroy`), and `destroy()` restores the original markup.

Markup: section.apx-h104 > ul.apx-h104__items (hidden source: li with <span class="apx-h104__tag">Sample</span><b>title</b><span>meta</span> or an <img>) + any content

Options: `{gap:90, pool:10, life:1200}`

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-line`, `--apx-motion`, `--apx-muted`, `--apx-radius`, `--apx-surface`. Every value has a fallback, so the module renders even without tokens. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0.

Brand mark: menus use the `<span class="apx-logo">` slot (inline SVG or img), never hardcoded text.

## Accessibility
Trail is decorative and aria-hidden; native cursor is kept. Fine pointers get the trail; touch drops one card per tap. Reduced motion / `--apx-motion:0`: no trail at all. Cards must be labelled Sample.

Movement uses transform, opacity and clip-path only (small colour and border-colour state changes aside); pointer reads are cached and writes are batched into requestAnimationFrame. Dependencies: none.
