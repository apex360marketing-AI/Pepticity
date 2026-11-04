# FRM-101 · Morph Field

Form fields rest as quiet underlines; when you click one, the line grows out from where you clicked and swells into a softly glowing frame, the label lifts away, and a tick draws in once the answer looks right.

## Mount
```html
<link rel="stylesheet" href="library/FRM-101/module.css">
<script src="library/FRM-101/module.js"></script>
<script>const destroy = APX.FRM101.mount(rootElement /*, options */);</script>
```
Or add `data-apx-mount="FRM-101"` to the root element and it mounts itself on load. `mount()` is idempotent (a second call returns the same `destroy`), and `destroy()` restores the original markup.

Markup: form.apx-f101 > .apx-f101__field > input|textarea.apx-f101__in[placeholder=" "] + label + p.apx-f101__hint[data-error]; optional .apx-f101__row for side-by-side; button.apx-f101__submit; data-success / data-invalid on the form

Options: none; listen for `apx:submit` (cancelable, detail {form, data})

## Tokens read
`--apx-accent`, `--apx-accent-ink`, `--apx-font-text`, `--apx-ink`, `--apx-line`, `--apx-motion`, `--apx-muted`, `--apx-radius`, `--apx-surface`. Every value has a fallback, so the module renders even without tokens. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0.

Brand mark: menus use the `<span class="apx-logo">` slot (inline SVG or img), never hardcoded text.

## Accessibility
Real <label>s; hints wired with aria-describedby; aria-invalid and the error text swap in when a field is wrong (hint and error are toggled with aria-hidden so only one is read); submit focuses the first bad field and announces in a polite status region. Reduced motion: frame appears instantly, no shake.

Movement uses transform, opacity and clip-path only (small colour and border-colour state changes aside); pointer reads are cached and writes are batched into requestAnimationFrame. Dependencies: none.
