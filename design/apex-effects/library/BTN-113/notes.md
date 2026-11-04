# BTN-113 · Orbit Dot

A glass pill with one glowing dot circling its edge; pointing at it makes the dot race round with a short trail.

Weight: Light · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/BTN-113/module.css">
<div data-apx="BTN-113">
  <button class="apx-b113" type="button">Talk to us</button>
</div>
<script src="library/BTN-113/module.js"></script>
```
Auto-mounts every `[data-apx="BTN-113"]` on load (the attribute can sit on the button itself or on a container; add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true`).
Manual: `const destroy = window.APX.BTN113.mount(el)` (also `window.APX['BTN-113']`). Mounting twice returns the same `destroy`; `destroy()` restores the original markup and attributes.
Use a real `<button>` (or `<a href>` for navigation). The label can be text plus an inline SVG icon.

## States
Hover or focus: the dot speeds up and leaves a trail, and the edge tints. Press: the dot swells. Reduced motion: the dot sits still.

## Options
None beyond tokens.

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-text`, `--apx-ink`, `--apx-line`, `--apx-motion`, `--apx-muted`, `--apx-surface`. Every value has a fallback. Durations are the motion-system tokens multiplied by `--apx-motion` (0 = still); `prefers-reduced-motion: reduce` forces 0. Change tokens at runtime and the CSS follows immediately.
Demo accents: dark ground `#d4ff3a`, light ground `oklch(.38 .1 15)`.

## Accessibility and performance
Real button semantics, keyboard reachable, visible focus ring (accent, 2px+ outside the shape), Space/Enter show the press state, every target is at least 48px tall. Decorative layers are `aria-hidden`. Hover effects only run for a mouse; touch gets the hover look briefly on tap. Text sits on a thin scrim inside the glass so it stays readable over busy backgrounds; without backdrop-filter support the glass turns into a solid tinted surface.
Motion uses transform, opacity, filter and clip-path (plus SVG path shape changes); pointer reads happen once per event and writes are batched in one requestAnimationFrame loop that sleeps when idle. Tested at 390px with no sideways scroll.
