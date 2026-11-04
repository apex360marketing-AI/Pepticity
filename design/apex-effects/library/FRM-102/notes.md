# FRM-102 · Quote Stepper

A short quote form that asks one plain question at a time: answers slide past like cards, a thread of light joins the step dots as you go, and the last step plays back your answers.

## Mount
```html
<link rel="stylesheet" href="library/FRM-102/module.css">
<script src="library/FRM-102/module.js"></script>
<script>const destroy = APX.FRM102.mount(rootElement /*, options */);</script>
```
Or add `data-apx-mount="FRM-102"` to the root element and it mounts itself on load. `mount()` is idempotent (a second call returns the same `destroy`), and `destroy()` restores the original markup.

Markup: form.apx-f102[data-submit-label][data-done-title][data-success] > .apx-f102__steps > fieldset.apx-f102__step[data-name][data-error] (legend + .apx-f102__opts > label.apx-f102__opt > input[type=radio] + span, or .apx-f102__text > label > input) + .apx-f102__nav (button.apx-f102__back, button.apx-f102__next[type=submit])

Options: none; listen for `apx:submit` (cancelable, detail {form, data})

## Tokens read
`--apx-accent`, `--apx-accent-ink`, `--apx-bg`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-line`, `--apx-motion`, `--apx-muted`, `--apx-radius`, `--apx-surface`. Every value has a fallback, so the module renders even without tokens. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0.

Brand mark: menus use the `<span class="apx-logo">` slot (inline SVG or img), never hardcoded text.

## Accessibility
Fieldset/legend per question; inactive steps are inert; a polite live region reads "Step 2 of 4: question"; focus moves to the step's first field; Enter advances; pointer picks auto-advance but keyboard arrow choices never do; errors are wired with aria-describedby; finish moves focus to the thank-you heading. Height never jumps (steps share one grid cell).

Movement uses transform, opacity and clip-path only (small colour and border-colour state changes aside); pointer reads are cached and writes are batched into requestAnimationFrame. Dependencies: none.
