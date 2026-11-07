# BTN-174 · Crown Set

A sapphire-glass button made like a watch: a polished chrome case, an engraved minute track, a small-seconds dial with a fine sweeping hand, and a knurled chrome crown at the right end. Hover winds the crown; pressing pulls it out one click; letting go snaps it home and fires the action.

Weight: Light · Dependencies: none (vanilla JS + SVG + CSS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/BTN-174/module.css">
<div data-apx="BTN-174">
  <button class="apx-b174" type="button">Get leads in [City]</button>
  <a class="apx-b174" href="/sample">See a sample lead</a>
</div>
<script src="library/BTN-174/module.js"></script>
```
Auto-mounts every `[data-apx="BTN-174"]` (on the button or a container; `data-apx-manual` or `window.APX_NO_AUTOMOUNT = true` to opt out).
Manual: `const destroy = window.APX.BTN174.mount(el)` (also `window.APX['BTN-174']`). Idempotent; `destroy()` restores the original markup and attributes.
The label is set in small capitals with wide tracking, like dial lettering.

## States
- Idle: the seconds hand sweeps at 8 beats a second, showing real seconds; a cool sapphire sheen crosses the glass every few seconds.
- Hover (mouse): the crown winds (knurling scrolls with true cylinder foreshortening) and the seconds hand runs ahead; the case reflection follows the pointer.
- Press (mouse, touch, Enter or Space): the crown pulls out one click (the button grows by 7px, the crown flashes, the 3 o'clock index brightens) and the seconds hand stops, as a real watch does when you pull the crown. Release snaps the crown home with a small overshoot, a glint crosses the glass and the action fires once. Keyboard: the action fires on key release (one click per press, Enter and Space alike).
- Keyboard focus: the crown winds one turn; accent ring around case and crown.
- Reduced motion / `--apx-motion:0`: a still dial (hand parked), no sheen; press still shows the pulled crown.
The seconds-hand tip is the only accent colour.

## Tokens read
`--apx-accent` (hand tip, focus ring), `--apx-bg`, `--apx-surface`, `--apx-ink` (label, engraving, hand), `--apx-line`, `--apx-font-text`, `--apx-motion`; optional `--apx-dur-*` / `--apx-ease-*`. All have fallbacks. Re-reads on `apx:tokens`.

## Accessibility and performance
Real button/link semantics, keyboard operable, visible focus ring, 64px tall, decorative SVG `aria-hidden`. All drawing is SVG; per-frame writes only happen when something changed, and the loop pauses off-screen and on hidden tabs. Tested at 390px with no sideways scroll.
