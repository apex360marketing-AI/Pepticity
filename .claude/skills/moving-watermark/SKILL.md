---
name: moving-watermark
description: Use when a PEPTICITY or APEX page needs a brand watermark that MOVES with the page - the large centre P that turns as you scroll (owner pick OBJ-08), parallax depth layers of the mark, letters that drift and lock into place one per section, a peptide chain that draws itself with scroll progress, or a mark revealed only through a moving mask under the content. Gives code for each, opacity caps (≤6% behind text), the never-behind-form-fields rule, reduced motion and checks. Never changes the dashboard watermark coin that lands as the footer (locked in CLAUDE.md).
---

# MOVING WATERMARK

## LOCKS (read first)
- Owner note on OBJ-08 (28 Oct): watermark in the background, chrome-silver branding mixed with a UV style, "remain in the centre large AND WILL ROTATE as they scroll but not being overwhelming, keeping it classy".
- The mark = the approved P (`brand/logo/p-mark.svg`, LOGO_P glyph). Never the font's cut-out P. Matte gunmetal, never white or platinum. Letters = the owner's font files exactly.
- Dashboard watermark coin (floats down, lands as the footer) stays EXACTLY as it is. Do not reuse this skill on dashboards without the owner asking.
- Peptide chain / swirl art must come from Higgsfield (traced to a path only with the owner's OK) - never a hand-drawn SVG illustration (CLAUDE.md imagery rule).
- Show ONE sample, wait for OK before it goes on a published page (`stage-gate`).

## CAPS (hard)
- Opacity ≤ 0.06 wherever text sits over it; ≤ 0.10 only in empty hero/footer bands.
- Body text still ≥4.5:1 measured over the mark's brightest pixel.
- NEVER behind form fields, consent text, prices or the cart: fade to 0 (code below).
- One moving watermark per page. Monochrome (gunmetal #55544f-#8E8D85 on wall #323232, faint UV-black violet sheen at grazing light). No accent on the watermark. Never gold/amber, no rainbow, no glow floods.
- `pointer-events: none; aria-hidden="true"`; z-index below content; never captures scroll.

## BASE MARKUP
```html
<div class="wm" aria-hidden="true"><img src="brand/logo/p-mark.svg" alt=""></div>
```
```css
.wm { position: fixed; left: 50%; top: 50%; width: min(70vmin, 720px); aspect-ratio: 1;
      translate: -50% -50%; opacity: var(--wm-op, .05); pointer-events: none; z-index: 0;
      transition: opacity .5s cubic-bezier(.16,1,.3,1); }
.wm img { width: 100%; height: 100%; display: block; }
.wm--hide { opacity: 0 !important; }
main { position: relative; z-index: 1; }
```

## OPTION 1: SCROLL-LINKED ROTATING SEAL (OBJ-08)
- The P turns once over the whole page; optional ring of PEPTICITY in the brand font turning the other way, slower.
```css
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: scroll()) {
    .wm { animation: wm-turn linear both; animation-timeline: scroll(root); }
  }
}
@keyframes wm-turn { from { rotate: 0deg; } to { rotate: 360deg; } }   /* `rotate`, so `translate` is untouched */
```
```js
// Fallback (Firefox) or when Lenis drives the page: one listener, no extra RAF
if (!CSS.supports('animation-timeline: scroll()') && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const wm = document.querySelector('.wm');
  lenis.on('scroll', ({ progress }) => { wm.style.rotate = (progress * 360).toFixed(2) + 'deg'; });
}
```
- For the real 3D version (turning coin/medallion), use `hex-medallion-3d` + `4d-direction`; same caps apply.

## OPTION 2: PARALLAX DEPTH LAYERS
- 2-3 copies of the mark at different sizes; the far one moves least. Reads as depth, not decoration.
```html
<div class="wm-depth" aria-hidden="true">
  <img src="brand/logo/p-mark.svg" data-depth=".08" style="--s:1.6;--o:.025" alt="">
  <img src="brand/logo/p-mark.svg" data-depth=".18" style="--s:1;--o:.045" alt="">
</div>
```
```css
.wm-depth { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.wm-depth img { position: absolute; left: 50%; top: 50%; width: 40vmin;
  transform: translate(-50%, -50%) scale(var(--s)); opacity: var(--o); }
```
```js
const imgs = [...document.querySelectorAll('.wm-depth img')];
lenis.on('scroll', ({ scroll }) => imgs.forEach(el => {
  el.style.translate = `0 ${(-scroll * el.dataset.depth).toFixed(1)}px`; }));   // separate from transform
```
- Wrap the y offset (modulo the viewport height) on long pages so the marks never leave the screen.

## OPTION 3: LETTERS DRIFT AND LOCK, ONE PER SECTION
- P-E-P-T-I-C-I-T-Y rendered from the owner's font (type3d-engine export as images) float loose at the edges; each section locks the next letter into a quiet line at the bottom. Finished word = page end.
```js
const letters = gsap.utils.toArray('.wm-letters .wm-letter');   // final line set by CSS
const sections = gsap.utils.toArray('main > section');
const seed = i => ((Math.sin(i * 78.233) * 43758.5453) % 1 + 1) % 1;
letters.forEach((el, i) => gsap.set(el, { x: (seed(i) - .5) * 60 + 'vw', y: (seed(i + 9) - .5) * -60 + 'vh',
                                         rotation: (seed(i + 4) - .5) * 40, opacity: .02 }));
letters.forEach((el, i) => {
  const s = sections[Math.min(i, sections.length - 1)];
  gsap.to(el, { x: 0, y: 0, rotation: 0, opacity: .06, ease: 'none',
    scrollTrigger: { trigger: s, start: 'top 80%', end: 'top 20%', scrub: 1 } });
});
```

## OPTION 4: PEPTIDE CHAIN DRAWS ITSELF WITH SCROLL
- Path traced from a Higgsfield chain image (potrace), owner-approved. One path, stroke only.
```html
<svg class="wm-chain" viewBox="0 0 400 2000" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
  <path d="…traced…" pathLength="1" fill="none" stroke="#8E8D85" stroke-width="1.2"/>
</svg>
```
```css
.wm-chain { position: fixed; inset: 0; width: 100%; height: 100%; opacity: .06; pointer-events: none; z-index: 0; }
.wm-chain path { stroke-dasharray: 1; stroke-dashoffset: 1; }
@media (prefers-reduced-motion: no-preference) { @supports (animation-timeline: scroll()) {
  .wm-chain path { animation: draw linear both; animation-timeline: scroll(root); } } }
@media (prefers-reduced-motion: reduce) { .wm-chain path { stroke-dashoffset: 0; } }
@keyframes draw { to { stroke-dashoffset: 0; } }
```
- JS fallback: `gsap.to(path, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .6 } })`.
- Dash offset repaints: one path, no filters on it, no glow.

## OPTION 5: MASK-REVEAL UNDER CONTENT
- The mark is only visible inside a soft window that slides down with scroll, so it appears to sit under the page.
```css
@property --wy { syntax: '<percentage>'; inherits: false; initial-value: 0%; }
.wm--mask { -webkit-mask-image: radial-gradient(60vmin 40vmin at 50% var(--wy), #000 0 35%, transparent 70%);
                    mask-image: radial-gradient(60vmin 40vmin at 50% var(--wy), #000 0 35%, transparent 70%); }
@media (prefers-reduced-motion: no-preference) { @supports (animation-timeline: scroll()) {
  .wm--mask { animation: wm-mask linear both; animation-timeline: scroll(root); } } }
@keyframes wm-mask { from { --wy: 10%; } to { --wy: 90%; } }
```
- Masks repaint each frame: keep the element ≤ viewport size and use only one.

## NEVER BEHIND FORMS (required with every option)
```js
const wmEls = document.querySelectorAll('.wm, .wm-depth, .wm-chain, .wm-letters');
const hits = new Set();
const io = new IntersectionObserver(es => {
  es.forEach(e => e.isIntersecting ? hits.add(e.target) : hits.delete(e.target));
  wmEls.forEach(w => w.classList.toggle('wm--hide', hits.size > 0));
}, { rootMargin: '-10% 0px -10% 0px' });
document.querySelectorAll('form, [data-no-watermark], .cart, .price').forEach(el => io.observe(el));
```

## REDUCED MOTION
- Static mark at its cap (no turn, no drift); chain fully drawn; letters already locked; mask fixed at centre.

## CHECKS (before the one sample goes to the owner)
- [ ] Screenshots at 0%, 25%, 50%, 75%, 100% scroll, 1440 + 390: the mark is felt, not seen; nothing competes with the hero.
- [ ] Sample pixels: opacity ≤ 0.06 under text; body contrast ≥4.5:1 over the brightest mark pixel.
- [ ] Scroll a form into view: watermark computed opacity is 0.
- [ ] Rotation tied to scroll (stops when scrolling stops; reverses on scroll-up), no autonomous spin.
- [ ] No frame over 50 ms during a scripted scroll (`smooth-scroll-audit`); `premium-restraint` passes.
- [ ] Catalogue it (`effect-catalog`: OBJ-08 for the turning P; new code for any new option) and tag `data-fx`.
