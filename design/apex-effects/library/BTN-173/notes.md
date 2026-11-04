# BTN-173 · Mercury Bead

A sealed smoked-glass button in a chrome bezel holding one bead of liquid chrome. The bead rolls toward your pointer and stretches like mercury on a tilted tray; pressing bursts it into droplets that race round the rim and pull back together under the words, with one tiny spark.

Weight: Medium · Dependencies: none (vanilla JS, one small WebGL1 canvas per button, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/BTN-173/module.css">
<div data-apx="BTN-173">
  <button class="apx-b173" type="button">Get leads in [City]</button>
  <a class="apx-b173" href="/sample">See a sample lead</a>
  <button class="apx-b173 apx-b173--sm" type="button">Check my area</button>
</div>
<script src="library/BTN-173/module.js"></script>
```
Auto-mounts every `[data-apx="BTN-173"]` on load (on the button itself or a container; add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true`).
Manual: `const destroy = window.APX.BTN173.mount(el)` (also `window.APX['BTN-173']`). Mounting twice returns the same `destroy`; `destroy()` restores the original markup and attributes and releases the WebGL context.
Use a real `<button>` (or `<a href>` for navigation). `apx-b173--sm` gives a 64px version.

## States
- Idle: the bead drifts slowly along the tray under the label (ambient), reflections turning gently.
- Hover (mouse): the bead rolls toward the pointer, the lead lobe bulges and a tail stretches behind it (metaball liquid), the studio reflections tilt with the pointer; the capsule lifts 2px.
- Press / tap / Enter / Space: the bead bursts into 8 droplets that run clockwise round the inner rim track, then are pulled back together under the label; one small accent spark when they rejoin, then a little squash bounce.
- Keyboard focus: the bead rolls to centre and pulses; accent ring 5px outside the cut-corner shape.
- Reduced motion / `--apx-motion:0`: a finished still - bead resting under the label, no drift, no burst.

## Tokens read
`--apx-accent` (spark + focus ring), `--apx-bg` (scrim and light/dark reflections), `--apx-surface`, `--apx-ink`, `--apx-line`, `--apx-radius` (corner cut, clamped 8-18px), `--apx-font-text`, `--apx-motion`; optional `--apx-dur-*` / `--apx-ease-*`. Every value has a fallback. Fires on `apx:tokens` (element or window) to re-read colours and motion.

## Accessibility and performance
Real button/link semantics; decorative layers are `aria-hidden`; visible focus ring; at least 64px tall. Text sits above a smoked scrim. The WebGL canvas is tiny (button size, DPR capped at 2), pauses off-screen and on hidden tabs, and falls back to a drawn chrome bead if WebGL is missing or the context is lost. Motion uses transform/opacity plus the canvas. Tested at 390px with no sideways scroll.
