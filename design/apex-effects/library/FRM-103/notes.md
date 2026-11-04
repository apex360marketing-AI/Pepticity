# FRM-103 · Submit Morph

Pressing send shrinks the button into a spinning ring, which turns into a tick and then blooms open from that spot into the thank-you card.

## Mount
```html
<link rel="stylesheet" href="library/FRM-103/module.css">
<script src="library/FRM-103/module.js"></script>
<script>const destroy = APX.FRM103.mount(rootElement /*, options */);</script>
```
Or add `data-apx-mount="FRM-103"` to the root element and it mounts itself on load. `mount()` is idempotent (a second call returns the same `destroy`), and `destroy()` restores the original markup.

Markup: form.apx-f103[data-success-title][data-success] > input.apx-f103__in[data-error] + button.apx-f103__btn[type=submit]; optional .apx-f103__success, .apx-f103__msg, .apx-f103__title/.apx-f103__sub

Options: `{onSubmit:(FormData, form) => Promise}`; otherwise POSTs to form[action], or (no action) resolves after a short pause for demos

## Tokens read
`--apx-accent`, `--apx-accent-ink`, `--apx-bg`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-line`, `--apx-motion`, `--apx-muted`, `--apx-radius`, `--apx-surface`. Every value has a fallback, so the module renders even without tokens. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0.

Brand mark: menus use the `<span class="apx-logo">` slot (inline SVG or img), never hardcoded text.

## Accessibility
Button gets aria-busy/aria-disabled while sending; status messages in a polite live region; errors focus the field; the thank-you card is inert until shown, then focus moves to its heading; "Send another" resets and returns focus. Reduced motion: states change instantly.

Movement uses transform, opacity and clip-path only (small colour and border-colour state changes aside); pointer reads are cached and writes are batched into requestAnimationFrame. Dependencies: none.
