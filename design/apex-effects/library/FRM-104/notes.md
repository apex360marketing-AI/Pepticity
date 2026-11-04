# FRM-104 · Sentence Check

The area checker is written as a sentence with blanks to fill in, "I run a ___ business and want leads in ___"; the blanks shimmer until filled, suggest business types as you type, and the answer unfolds underneath.

## Mount
```html
<link rel="stylesheet" href="library/FRM-104/module.css">
<script src="library/FRM-104/module.js"></script>
<script>const destroy = APX.FRM104.mount(rootElement /*, options */);</script>
```
Or add `data-apx-mount="FRM-104"` to the root element and it mounts itself on load. `mount()` is idempotent (a second call returns the same `destroy`), and `destroy()` restores the original markup.

Markup: form.apx-f104[data-result-title][data-result-text][data-result-link][data-result-link-text] > div.apx-f104__sentence > span text + span.apx-f104__blank > input.apx-f104__in[aria-label][data-options="A|B|C"?][data-error] + button.apx-f104__go

Options: `{check:({industry, area}) => Promise<{tag,title,text}>}`; without it a clearly labelled Sample answer is built from the data-result-* templates ({industry}, {area} or any input name)

## Tokens read
`--apx-accent`, `--apx-accent-ink`, `--apx-bg`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-line`, `--apx-motion`, `--apx-muted`, `--apx-radius`, `--apx-surface`. Every value has a fallback, so the module renders even without tokens. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0.

Brand mark: menus use the `<span class="apx-logo">` slot (inline SVG or img), never hardcoded text.

## Accessibility
Each blank has an aria-label; the business blank is an ARIA combobox (listbox, aria-activedescendant, Up/Down/Enter/Esc); errors announced politely and focus the blank; the answer is announced via a live region. Uses field-sizing so blanks grow with text (fixed width fallback). Reduced motion: no shimmer, answer shows instantly.

Movement uses transform, opacity and clip-path only (small colour and border-colour state changes aside); pointer reads are cached and writes are batched into requestAnimationFrame. Dependencies: none.
