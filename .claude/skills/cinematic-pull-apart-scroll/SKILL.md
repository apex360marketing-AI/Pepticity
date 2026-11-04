---
name: cinematic-pull-apart-scroll
description: Use when a PEPTICITY or APEX section must HOLD while scrolling steps through it, or must PULL APART and PUT BACK TOGETHER on scroll - layers of a product (vial, label, cap, swirl) separating and reassembling, headline letters flying apart and locking back, stacked plates fanning out. Gives working GSAP ScrollTrigger and native CSS scroll-driven code, Lenis setup, reduced-motion fallback and the performance rules. Extends gsap-scroll-choreography, css-scroll-driven-motion and exploded-layers-3d (three.js) in apex_agents_bots; catalogue codes SCR-16 Exploded Layers, SCR-30 Sticky Steps, SCR-37 Teardown, TXT-104 Scatter Assemble.
---

# CINEMATIC PULL-APART SCROLL

## WHEN TO USE WHICH
- DOM layers (Higgsfield stills cut into layers, the owner's logo/font files): this skill.
- Real 3D product with tagged parts: `exploded-layers-3d` (apex_agents_bots) for the three.js part; reuse the pin + timeline from here.
- Just a light reveal, or phones: the CSS version below (off the main thread, no GSAP).
- Layer art comes ONLY from Higgsfield (or the owner's font/P-mark files). Code moves layers; it never draws them (CLAUDE.md).
- PEPTICITY vendored libs: `vendor/gsap.min.js` 3.15.0, `ScrollTrigger.min.js`, `SplitText.min.js`, `lenis.min.js` 1.3.27. Artifacts: pinned CDN versions per `gsap-scroll-choreography`.

## THE BEAT (every pull-apart section)
- 1 WHOLE (hold ~10% of the scroll) → 2 APART (layers leave one after another, staggered) → 3 HOLD + STEPS (read each layer; one label lights per step) → 4 TOGETHER (reverse order, slightly faster) → 5 RELEASE (soft glint on the last piece, pin ends).
- Scroll up plays it backwards exactly. Snap to the labels so the visitor lands on a readable state.
- 3-5 layers, or one word of at most ~12 letters. More reads as a parts catalogue.

## LENIS + GSAP (one loop only; settings from `smooth-scroll-audit`)
```js
gsap.registerPlugin(ScrollTrigger, SplitText);
const lenis = new Lenis({ duration: 1.4, wheelMultiplier: 0.7, touchMultiplier: 1 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
document.fonts.ready.then(() => ScrollTrigger.refresh());
```

## A. EXPLODED PRODUCT LAYERS (pinned hold-and-step)
```html
<section class="xp" data-fx="SCR-16" aria-labelledby="xp-h">
  <div class="xp-stage">
    <img class="xp-layer" src="assets/xp/cap.webp"   data-dy="-34" data-dz="140" alt="">
    <img class="xp-layer" src="assets/xp/label.webp" data-dy="-10" data-dz="60"  data-dx="14" alt="">
    <img class="xp-layer" src="assets/xp/glass.webp" data-dy="0"   data-dz="0"   alt="">
    <img class="xp-layer" src="assets/xp/swirl.webp" data-dy="26"  data-dz="-80" alt="">
  </div>
  <ol class="xp-steps"><li>SEAL</li><li>LABEL</li><li>VIAL</li><li>PEPTIDE</li></ol>
</section>
```
```css
.xp-stage { position: relative; height: 100vh; perspective: 1400px; }
.xp-layer { position: absolute; inset: 0; margin: auto; max-height: 70vh; transform-style: preserve-3d; }
.xp-steps li { opacity: .35; transition: opacity .4s; }
.xp-steps li.on { opacity: 1; }
```
```js
const mm = gsap.matchMedia();
mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
  const layers = gsap.utils.toArray('.xp-layer');
  const steps = gsap.utils.toArray('.xp-steps li');
  const at = (el, k) => +el.dataset[k] || 0;
  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, scrollTrigger: {
    trigger: '.xp', start: 'top top', end: '+=300%', pin: true, scrub: 1, anticipatePin: 1,
    snap: { snapTo: 'labels', duration: { min: .3, max: .8 }, ease: 'power2.inOut' },
    onToggle: s => layers.forEach(l => l.style.willChange = s.isActive ? 'transform' : 'auto') } });
  tl.addLabel('whole').to({}, { duration: .3 })
    .to(layers, { yPercent: i => at(layers[i], 'dy'), xPercent: i => at(layers[i], 'dx'),
                  z: i => at(layers[i], 'dz'), stagger: .12 }).addLabel('apart');
  steps.forEach((s, i) => tl.addLabel('step' + i).to({}, { duration: .4 }));   // hold per step
  tl.to(layers, { yPercent: 0, xPercent: 0, z: 0, stagger: { each: .1, from: 'end' } })
    .addLabel('together');
  tl.eventCallback('onUpdate', () => {               // works scrolling down AND up
    const l = tl.currentLabel();
    steps.forEach((x, j) => x.classList.toggle('on', l === 'step' + j));
  });
});
```

## B. LETTERS FLY APART AND LOCK BACK (TXT-104)
- Deterministic scatter (same positions every load, so BEFORE/AFTER screenshots match).
- If the heading is the 3D brand font (type3d-engine), animate per-glyph objects inside the engine with the same timeline values; never swap in a flat web font.
```js
mm.add('(prefers-reduced-motion: no-preference)', () => {
  const split = SplitText.create('.pa-word', { type: 'chars' });
  const seed = i => ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;   // 0..1, stable
  gsap.timeline({ scrollTrigger: { trigger: '.pa', start: 'top top', end: '+=220%', pin: true, scrub: 1 } })
    .to(split.chars, { x: i => (seed(i) - .5) * 70 + 'vw', y: i => (seed(i + 7) - .5) * 60 + 'vh',
        rotation: i => (seed(i + 3) - .5) * 120, opacity: .12,
        stagger: { each: .03, from: 'center' }, ease: 'power2.in' })
    .to({}, { duration: .4 })                                              // hold apart
    .to(split.chars, { x: 0, y: 0, rotation: 0, opacity: 1,
        stagger: { each: .03, from: 'edges' }, ease: 'power3.out' });
  return () => split.revert();
});
```

## C. NATIVE CSS VERSION (no JS; phones, light sections)
```css
.pa-css { height: 300vh; view-timeline: --pa block; }
.pa-css .stage { position: sticky; top: 0; height: 100vh; }
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .pa-css .layer { animation: apart linear both; animation-timeline: --pa;
                     animation-range: contain 0% contain 100%; }   /* timeline AFTER the shorthand */
  }
}
@keyframes apart {
  0%, 12%   { transform: none; }
  40%, 60%  { transform: translate3d(var(--dx, 0), var(--dy, 0), 0) rotate(var(--r, 0deg)); opacity: .9; }
  88%, 100% { transform: none; }
}
```
- Set `--dx/--dy/--r` per layer inline. Unsupported browsers (Firefox) simply see the assembled stack: that is the fallback.

## REDUCED MOTION AND PHONES
- `prefers-reduced-motion: reduce`: no pin, no scatter. Show the assembled object plus the steps as a normal list; optionally one static "apart" still (a Higgsfield frame) beside it.
- Under 900px: no GSAP pin (pins fight touch momentum). Use version C, or the assembled object with steps scrolling past.
- Keyboard and screen readers: steps are real text in an `<ol>`; layer images are `alt=""` decoration.

## PERFORMANCE RULES
- Animate `transform` and `opacity` only. No top/left/width/height, no animated `filter: blur` on more than 2 elements, no `backdrop-filter` on moving layers.
- will-change budget: on only while the pin is active (onToggle above), max ~12 elements at once; never set it in global CSS.
- One RAF loop (GSAP ticker). One ScrollTrigger per section, not per layer.
- Layer images: WebP/AVIF, sized to display size x DPR 2, decoded before the pin (`img.decode()`), lazy everywhere else.
- No ScrollTrigger.refresh() or DOM mounting while scrolling (`smooth-scroll-audit`).

## RULES
- Headings in CAPITALS. Restrained monochrome (wall #323232, metal #080807-#8E8D85); at most one sparing accent for the lit step/glint (`premium-restraint` ≤5% pixels). Never gold/amber. No cartoon. No rainbow glows.
- Tag the section with `data-fx` and register new effects in `design/effects.json` (`effect-catalog`).

## VERIFY (before showing; see `verify-before-done`)
- Playwright 1440 + 390: screenshots at whole / apart / each step / together, same scroll positions for BEFORE/AFTER.
- Pinned: `getBoundingClientRect().top` stays 0 while `tl.scrollTrigger.progress` rises; scroll back to 0 = fully assembled.
- `reducedMotion: 'reduce'`: no pins (`ScrollTrigger.getAll().filter(s => s.pin).length === 0`), all content visible.
- 390px: `document.documentElement.scrollWidth === 390`. No frame over 50 ms during a 10 s scripted scroll.
