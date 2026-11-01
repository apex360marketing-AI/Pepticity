# NAV-104 · Thumb Arc

A glowing corner button fans the main actions (call, text, quote, check your area) out along a curved sweep; on a phone you can press, slide your thumb onto one and let go.

## Mount
```html
<link rel="stylesheet" href="library/NAV-104/module.css">
<script src="library/NAV-104/module.js"></script>
<script>const destroy = APX.NAV104.mount(rootElement /*, options */);</script>
```
Or add `data-apx-mount="NAV-104"` to the root element and it mounts itself on load. `mount()` is idempotent (a second call returns the same `destroy`), and `destroy()` restores the original markup.

Markup: div.apx-n104[data-corner="left"?] > button.apx-n104__trigger[aria-label] + ul.apx-n104__actions > li > a[data-icon="phone|message|quote|pin|calendar"]

Options: `{step:64, radius:430}` (spacing and curve of the sweep)

## Tokens read
`--apx-accent`, `--apx-accent-ink`, `--apx-bg`, `--apx-font-text`, `--apx-ink`, `--apx-line`, `--apx-motion`, `--apx-surface`. Every value has a fallback, so the module renders even without tokens. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0.

Brand mark: menus use the `<span class="apx-logo">` slot (inline SVG or img), never hardcoded text.

## Accessibility
Trigger aria-expanded/controls; action list inert when closed; Enter/Space opens and focuses the first action; arrow keys move along the arc; Esc closes to the trigger; focus leaving closes. Each action keeps its text as aria-label; the floating labels are visual. Press-and-slide works with mouse, pen and touch.

Movement uses transform, opacity and clip-path only (small colour and border-colour state changes aside); pointer reads are cached and writes are batched into requestAnimationFrame. Dependencies: none.
