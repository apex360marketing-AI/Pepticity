# OBJ-101 · Blacklight Relic

A matte-black, twelve-sided machined medallion turns slowly in a dark room. The pointer is a UV torch: a soft cone of cold light. Where it lands, the facet edges trace in a cold white-violet glow and hidden markings appear like invisible ink under black light (a woven guilloche rosette, an engine-turned sunburst, the brand plate, `[YOUR MARK]`, `N° [SERIAL]` and a ring of fine lettering), while an x-ray of the inner structure (honeycomb core, truss rings, a crystal heart) shows through. Outside the beam it is pure matte black with a soft gloss edge. The beam spills onto the wall behind as a soft pool with the relic's real shadow cut out of it, through a faint haze. One tiny chartreuse glint marks the core of the beam where it reflects off a facet.

Weight: Heavy · Dependencies: none (vanilla JS + WebGL 1, no CDN, no three.js) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/OBJ-101/module.css">
<section class="apx-obj101" data-apx="OBJ-101" aria-label="Shine a light on the proof behind every lead">
  <div class="apx-obj101__stage">
    <div class="apx-obj101__card">                     <!-- optional caption, smoked cut-corner glass -->
      <span class="apx-obj101__kicker">Under the light</span>
      <h2>PROOF YOU CAN SHINE A LIGHT ON.</h2>
      <p>Every lead carries its own record … [Your verification process]</p>
      <span class="apx-obj101__hint" data-hint-touch="Drag to move the light">Move the light across it</span>
    </div>
  </div>
</section>
<script src="library/OBJ-101/module.js"></script>
```
Auto-mounts every `[data-apx="OBJ-101"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX['OBJ-101'].mount(el, opts)` (also `window.APX.OBJ101`). Mounting twice returns the same `destroy`; `destroy()` removes the canvas and reticle, frees the WebGL context and restores the caption's inline styles and hint text.
Without a `.apx-obj101__card` the relic is centred.

## Options
Attributes on the section, or the same keys in `mount(el, {...})`:
- `data-mark` / `mark` (`APEX`): the brand plate on the face and the big mark on the back. Always shown in capitals.
- `data-sign` / `sign` (`[YOUR MARK]`): the client's mark cartouche.
- `data-serial` / `serial` (`N° [SERIAL]`): the serial on the back and in the ring.
- `data-ring` / `ring`: the ring of fine lettering.
- `data-hint` / `hint` and `data-hint-touch` / `hintTouch`: the hint line for mouse and touch.
- `data-still-turn` / `stillTurn` (`-35`, degrees): the angle the still frame is taken at (`200` shows the back with the serial).
- CSS: `--apx-obj101-height` (100svh).

## Interaction
- Mouse: the beam follows the pointer with a little hand-held lag; the relic leans toward it; press and hold to focus the beam tighter and brighter (the x-ray strengthens). The native cursor becomes a hairline ring with a tiny live dot.
- Touch: tap or drag sideways to move the light (vertical swipes still scroll the page).
- Idle (or no input for a few seconds): the torch sweeps slowly across the relic by itself.
- Scroll: the caption focuses in as the section enters; the relic tilts gently with the scroll position.
- The turntable dwells face-on and on the back, and moves faster through the edge-on angle.

## Tokens
`--apx-bg` (room and wall; a light ground switches to the stone set), `--apx-ink` (the UV colour is mixed from it with a cold violet, the caption), `--apx-muted` (kicker, hint), `--apx-accent` (the tiny core glint, the reticle dot, the kicker dot), `--apx-line` (caption rim), `--apx-font-display` (the brand lettering on the relic and the caption heading), `--apx-font-text`, `--apx-motion`. All have fallbacks.
Light ground (luminance > .5): pale stone wall with a soft contact shadow, the relic stays matte black, and the beam lays a cool ink tint on the stone instead of a glow. `--apx-motion`: 0 = still, 1 = normal. After changing tokens at runtime, dispatch `apx:tokens` on the element or window.

## Accessibility and performance
The canvas and reticle are `aria-hidden`; the caption is real text. One WebGL context per instance, 3 draw calls (wall, relic, x-ray lines); the ink is drawn once into a mipmapped texture (2048×1024, 1024×512 on phones) and redrawn when fonts arrive. The loop runs only while the section is on screen and the tab is visible. Pixel ratio is capped at 1.75 (1.5 on phones).
Reduced motion / motion 0: one finished still (the relic at a three-quarter angle with the beam on the brand plate); moving the pointer still repositions the light without any animation.
No WebGL: a quiet black dodecagon under a soft light, with the same caption.
Transform / opacity / filter only for DOM motion. Tested at 390px with no sideways scroll.
