# GLS-101 · Two-Piece Glass

A thick smoked-glass card with a button-shaped hole cut right through it. The button is its own slab of glass sitting flush in that hole: point at it (or tab to it) and it lifts out toward you, showing its bevelled edge, casting its own shadow on the card and exposing the hole's walls bending the moving light behind; press it and it drops back into the hole with a small spring and a flash of light round the seam.

Weight: Medium · Dependencies: none (vanilla JS, raw WebGL 1, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/GLS-101/module.css">
<section class="apx-g101" data-apx="GLS-101" data-shape="cut" data-word="APEX" aria-label="Get leads">
  <div class="apx-g101__card">
    <span class="apx-g101__kicker"><i aria-hidden="true"></i>Roofing · [City]</span>
    <h2 class="apx-g101__title">YOUR NEXT JOB IS ONE PRESS AWAY</h2>
    <p class="apx-g101__text">Verified, exclusive leads for your trade. [Your verification process]</p>
    <div class="apx-g101__row">
      <button class="apx-g101__key" type="button">Get my leads</button>
      <span class="apx-g101__note" aria-live="polite">Nobody else gets them</span>
    </div>
  </div>
</section>
<script src="library/GLS-101/module.js"></script>
```
Auto-mounts every `[data-apx="GLS-101"]` (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true`).
Manual: `const destroy = window.APX.GLS101.mount(el)` (also `window.APX['GLS-101']`). Mounting twice returns the same `destroy`; `destroy()` removes the canvas, unwraps the button and restores the markup.
The key must be a real `<button>` or `<a href>`; it keeps its own click, focus and keyboard behaviour. The module wraps it in a `.apx-g101__socket` span (the hole), which never moves.

## Options (attributes on the root)
- `data-shape="cut"` (default): a cut-corner slab in a cut-corner hole. `data-shape="round"`: a round glass slab (give the button an `aria-label` and an icon).
- `data-word="APEX"`: the word drifting through the moving light behind the glass (the business name or `[CITY]`). Default `APEX`.

## States
- Rest: the slab sits flush, separated from the card by a fine seam with chrome rims on both pieces.
- Hover / keyboard focus: the slab springs up and toward you (lift, slight scale, leans toward the pointer); its edge thickness shows, its shadow falls on the card, and the exposed hole walls refract the light behind. Keyboard focus also draws an accent hairline round the slab.
- Press (pointer, Space, Enter): the slab sinks slightly below flush and darkens; on release it seats with a small overshoot and a light flash runs round the seam with a tiny accent ring. The real click fires as normal.
- Touch: on first view the slab lifts and seats once by itself; every few seconds it rises a little and seats again, so the two pieces read without hover. Tap presses and seats it.

## Tokens read
`--apx-bg`, `--apx-ink`, `--apx-muted`, `--apx-accent`, `--apx-surface`, `--apx-line`, `--apx-font-display`, `--apx-font-text`, `--apx-motion`. Dark or light ground is detected from `--apx-bg` (dark: liquid chrome on near-black; light: soft light on pale ground). Change tokens and dispatch `apx:tokens` (on the root or window) to rebuild.

## Accessibility and performance
Real button semantics, visible focus (the glass draws an accent ring; without the live glass a CSS outline is used), target at least 60px tall. Canvas is `aria-hidden`. `prefers-reduced-motion` or `--apx-motion:0`: the ground freezes into a finished still, and the slab changes state instantly (no spring) so the two pieces can still be seen.
One WebGL context per instance: the moving light renders at half resolution into a texture, the glass is composited at full resolution (device pixel ratio capped at 1.75 desktop / 1.5 phone). The loop sleeps off-screen and in hidden tabs. If WebGL is missing or the context is lost, a layered CSS glass fallback (cut-corner card, sunken socket, raised slab) keeps the two-piece read. Tested at 390px with no sideways scroll. Forced-colours mode hides the canvas and borders the button.
