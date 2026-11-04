# SCR-16 · Exploded Layers

A layered glass and titanium device holds on screen. Scrolling pulls it apart into labelled slices; each step eases its slice forward in turn (a slice changing place slides out past the edge of the deck, never through the other slices), the active step is named in words above, and at the end the device closes back together and the intro copy returns. The camera orbits slowly with the scroll and the pointer, a floor ring with a travelling glint turns underneath, dust drifts in the light.

Weight: Heavy · Dependencies: none (vanilla JS + WebGL 1, no CDN, no three.js / GSAP / Lenis) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/SCR-16/module.css">
<section class="apx-scr16" data-apx="SCR-16" aria-label="What is inside every lead">
  <div class="apx-scr16__stage">
    <div class="apx-scr16__veil" aria-hidden="true"></div>
    <div class="apx-scr16__copy"><p class="apx-scr16__kicker">…</p><h2>EVERY LEAD, <em>BUILT TO CLOSE.</em></h2><p>…</p></div>
    <p class="apx-scr16__cue" aria-hidden="true">Scroll to take a lead apart</p>
    <div class="apx-scr16__note" aria-hidden="true"></div>
    <ol class="apx-scr16__layers" aria-label="The six checks inside every lead">
      <li data-label="REQUEST" data-sub="Full roof replacement · 2,400 sq ft"><b>Request</b><span>A homeowner in [City] asks for your exact service.</span></li> …
    </ol>
  </div>
</section>
<script src="library/SCR-16/module.js"></script>
```
Auto-mounts every `[data-apx="SCR-16"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX['SCR-16'].mount(el, opts)` (also `window.APX.SCR16`). Mounting twice returns the same `destroy`; `destroy()` removes the canvas, frees the WebGL context and restores the original markup.
One slice per `<li>` (2-8; 6 is the design). `data-label` / `data-sub` are printed on the slice (always marked SAMPLE); `<b>` is the step name and `<span>` the sentence shown above the device and in the list. The last slice is the glass top. Hovering or focusing a step pulls its slice forward; clicking it scrolls to it. Copy, cue and note are optional.

## Options
`data-still` (0..1, default .5): where along the scroll the motion-off still is taken (.5 = apart with the third slice forward). `data-sample-tag` (`SAMPLE`; the chip printed on every slice). Keys: `still, sampleTag`.
CSS: `--apx-scr16-length` (420vh) and `--apx-scr16-length-compact` (330vh, under 900px).

## Tokens
`--apx-bg` (studio light; a light ground gives a day studio with a soft floor shadow), `--apx-ink` (metal tints, key light, label text), `--apx-muted` (dust, list), `--apx-accent` (edge glint, floor ring and glint, last slice title, step numbers, list lines), `--apx-surface`, `--apx-line`, `--apx-radius` (motion-off cards), `--apx-font-display`, `--apx-font-text` (also printed on the slices), `--apx-motion`. All have fallbacks. After changing tokens at runtime, dispatch `apx:tokens` (labels and materials are rebuilt).

## Accessibility and performance
The steps are a real ordered list (step name + sentence); canvas, cue and note are `aria-hidden`. List items are focusable buttons (Enter / Space scrolls to the step).
One WebGL context; ~6 slab draws + 6 label quads + ring, glint and dust per frame; procedural studio reflections (no environment maps); labels are power-of-two canvas textures redrawn when fonts load. The loop runs only while the section is on screen and the tab is visible, and stops in still mode. Pixel ratio capped (1.75 desktop, 1.25 phones); phones get fewer dust motes, no antialiasing, a tighter deck and a lens shift that keeps the closed device above the copy.
Phones keep the native sticky hold (it is the effect); the step list becomes a step bar at the top. Reduced motion / `--apx-motion: 0`: no hold, one finished still and every step as a glass card. No WebGL: three stacked glass outlines with the same layout.
Transform / opacity / filter only for DOM motion. Tested at 390px with no sideways scroll.
