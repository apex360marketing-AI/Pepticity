# BTN-105 · Convex Lens

A lens-shaped glass button; a bright spot follows your pointer like light through a lens, and the label swells as if magnified.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/BTN-105/module.css">
<div data-apx="BTN-105">
  <button class="apx-b105" type="button">See how it works</button>
</div>
<script src="library/BTN-105/module.js"></script>
```
Auto-mounts every `[data-apx="BTN-105"]` on load (the attribute can sit on the button itself or on a container; add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true`).
Manual: `const destroy = window.APX.BTN105.mount(el)` (also `window.APX['BTN-105']`). Mounting twice returns the same `destroy`; `destroy()` restores the original markup and attributes.
Use a real `<button>` (or `<a href>` for navigation). The label can be text plus an inline SVG icon.

## States
Hover: the highlight tracks the pointer and a soft coloured ring sits opposite it; the label magnifies. Focus: the same, centred. Press: the lens flattens.

## Options
None beyond tokens.

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-text`, `--apx-ink`, `--apx-line`, `--apx-motion`, `--apx-muted`, `--apx-surface`. Every value has a fallback. Durations are the motion-system tokens multiplied by `--apx-motion` (0 = still); `prefers-reduced-motion: reduce` forces 0. Change tokens at runtime and the CSS follows immediately.
Demo accents: dark ground `oklch(.8 .06 340)`, light ground `oklch(.4 .09 345)`.

## Accessibility and performance
Real button semantics, keyboard reachable, visible focus ring (accent, 2px+ outside the shape), Space/Enter show the press state, every target is at least 48px tall. Decorative layers are `aria-hidden`. Hover effects only run for a mouse; touch gets the hover look briefly on tap. Text sits on a thin scrim inside the glass so it stays readable over busy backgrounds; without backdrop-filter support the glass turns into a solid tinted surface.
Motion uses transform, opacity, filter and clip-path (plus SVG path shape changes); pointer reads happen once per event and writes are batched in one requestAnimationFrame loop that sleeps when idle. Tested at 390px with no sideways scroll.
