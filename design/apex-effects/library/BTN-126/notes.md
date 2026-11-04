# BTN-126 · Focus Frame

Glass framed by camera-style corner marks that hunt at rest, lock on when you point, and flash when you click.

Weight: Light · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/BTN-126/module.css">
<div data-apx="BTN-126">
  <button class="apx-b126" type="button" data-apx-tag="Sample">See a sample lead</button>
</div>
<script src="library/BTN-126/module.js"></script>
```
Auto-mounts every `[data-apx="BTN-126"]` on load (the attribute can sit on the button itself or on a container; add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true`).
Manual: `const destroy = window.APX.BTN126.mount(el)` (also `window.APX['BTN-126']`). Mounting twice returns the same `destroy`; `destroy()` restores the original markup and attributes.
Use a real `<button>` (or `<a href>` for navigation). The label can be text plus an inline SVG icon.

## States
Rest: the corner marks breathe in and out. Hover or focus: they lock tight onto the glass (thicker for keyboard focus). Click: a shutter flash.

## Options
`data-apx-tag` adds a small tag on the top edge (e.g. "Sample").

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-text`, `--apx-ink`, `--apx-line`, `--apx-motion`, `--apx-muted`, `--apx-surface`. Every value has a fallback. Durations are the motion-system tokens multiplied by `--apx-motion` (0 = still); `prefers-reduced-motion: reduce` forces 0. Change tokens at runtime and the CSS follows immediately.
Demo accents: dark ground `oklch(.72 .13 20)`, light ground `oklch(.44 .14 22)`.

## Accessibility and performance
Real button semantics, keyboard reachable, visible focus ring (accent, 2px+ outside the shape), Space/Enter show the press state, every target is at least 48px tall. Decorative layers are `aria-hidden`. Hover effects only run for a mouse; touch gets the hover look briefly on tap. Text sits on a thin scrim inside the glass so it stays readable over busy backgrounds; without backdrop-filter support the glass turns into a solid tinted surface.
Motion uses transform, opacity, filter and clip-path (plus SVG path shape changes); pointer reads happen once per event and writes are batched in one requestAnimationFrame loop that sleeps when idle. Tested at 390px with no sideways scroll.
