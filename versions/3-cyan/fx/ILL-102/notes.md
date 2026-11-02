# ILL-102 · Caustic Glass

Smoked, cut-corner glass panes float at different heights above a dark floor. Light from a lamp above passes through their rippled surface and throws real caustics onto the floor below: shimmering, water-like nets of platinum light that drift as the glass slowly sways and swing across the floor as you move the light. Each pane casts a soft smoked shadow with the net of light inside it, offset from the pane by its height, so the glass reads as truly floating. The pane surfaces catch a small reflection of the lamp and a hairline platinum rim; the brightest peaks of the net carry a barely-there chartreuse glint. Built to sit behind content: the copy sits above it on a smoked glass card.

Weight: Heavy · Dependencies: none (vanilla JS + WebGL 1, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/ILL-102/module.css">
<section class="apx-ill102" data-apx="ILL-102" aria-label="See every lead clearly">
  <div class="apx-ill102__content">                  <!-- optional; any content works, it sits above the light -->
    <div class="apx-ill102__card">
      <span class="apx-ill102__kicker">In a clear light</span>
      <h2>SEE EVERY LEAD CLEARLY BEFORE YOU CALL.</h2>
      <p>… [Your lead card details]</p>
      <a class="apx-ill102__cta" href="#">See a sample lead <i aria-hidden="true"></i></a>
    </div>
  </div>
</section>
<script src="library/ILL-102/module.js"></script>
```
Auto-mounts every `[data-apx="ILL-102"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX['ILL-102'].mount(el, opts)` (also `window.APX.ILL102`). Mounting twice returns the same `destroy`; `destroy()` removes the canvas and frees the WebGL context. Every direct child of the section is lifted above the light automatically.

## Options
- `data-panes` / `panes` (2-4, default 3).
- CSS: `--apx-ill102-height` (100svh).
- The card, kicker and CTA classes are optional helpers in the house glass style (cut corners, drawn diagonal rims, a light sweep across the CTA on hover).

## Interaction
- Mouse: the lamp follows the pointer (eased), so the nets of light slide and re-form under each pane; the camera drifts a touch with it.
- Press / tap: sends a ripple ring through the glass above that point; the caustics ripple outward on the floor.
- Touch: tap or drag sideways moves the lamp (vertical swipes still scroll).
- Idle: the lamp wanders slowly by itself.
- Scroll: the panes turn and sink slightly as the section passes.

## Tokens
`--apx-bg` (floor; a light ground switches to the stone set), `--apx-ink` (the light colour is the ink pushed toward a cool platinum white; text), `--apx-muted` (kicker), `--apx-accent` (the faint glint at the brightest peaks, kicker and CTA dots), `--apx-line` (card and CTA rims), `--apx-font-display`, `--apx-font-text`, `--apx-motion`. All have fallbacks.
Light ground (luminance > .5): pale stone floor, cool soft shadows under the panes with darker cells and bright white highlights. `--apx-motion`: 0 = still, 1 = normal. After changing tokens at runtime, dispatch `apx:tokens` on the element or window.

## Accessibility and performance
Decorative canvas (`aria-hidden`, no pointer capture, content stays fully interactive). One WebGL context per instance; per frame: one caustic pass per pane into a 1024² floor texture (512² on phones) using a 210² vertex grid (120² on phones), one floor pass and one pass per pane. Needs `OES_standard_derivatives` (universal on WebGL 1 devices); without it or without WebGL a still, drawn caustic net is shown instead. The loop runs only while the section is on screen and the tab is visible; pixel ratio capped at 1.75 (1.5 on phones).
Reduced motion / motion 0: one finished still (lamp up and to the right of centre, panes at rest), no pointer-following.
Transform / opacity only for DOM motion. Tested at 390px with no sideways scroll.
