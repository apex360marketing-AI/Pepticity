---
name: cinematic-preloader-entrance
description: Build a 7–9 second branded cinematic entrance (intro / preloader) that plays once per session over real, already-rendered content, never delays LCP, skips on Esc or a Skip button, falls back for reduced motion, and hands off with a signature transition (cube turn, portal mask, letterbox split, venetian slats, liquid ripple). Use when someone asks for "an intro", "a preloader", "a loading animation", "an entrance", "an opening sequence", "intro film", "make the site open like a movie", or a new handoff transition for a Pepticity/APEX template.
---

# Cinematic preloader / entrance

The reference implementation is `/home/user/pepticity/src/intro.js` (three modes on one rAF clock) with `/home/user/pepticity/src/helix.js` as the canvas engine. Read both before writing a new intro, and do not copy Site 1's look into another template. The `BRIEF.md` intro rules still apply. This skill adds the engineering rules that keep an intro from hurting the site.

## Non-negotiables
1. **The real site is in the HTML and painted at first frame.** `#site` sits under `#intro`. Never `display:none`, `visibility:hidden` or `opacity:0` on `#site`, and never gate its markup on JS. The intro is an overlay (`position:fixed; inset:0; z-index:50`).
2. **LCP stays on the hero.** LCP does not check occlusion, so the hero H1 or hero image painted under the overlay counts at once. The danger is the reverse: any DOM text block or `<img>` in the intro that is *larger* than the hero and appears at 6 s becomes the new LCP, measured at 6 s. Keep every intro DOM text block smaller in rendered area than the hero H1, or draw large type on the canvas. Canvas pixels are never LCP candidates. An autoplaying `<video>`'s first frame IS a candidate, so set the plate's `src` from JS after first paint (`data-src` → `src`, as intro.js does).
3. **Once per session.** Wrap sessionStorage in try/catch (see `ss` in intro.js). Set the flag in `finish()`, not at start, so a reload mid-intro replays it. `#intro` in the hash forces a replay.
4. **Skip.** The Skip button is the first focusable element in the DOM, ≥44×44px and visible from t=0. Esc skips too. Skipping fades out over 300–400 ms (`intro.animate([{opacity:1},{opacity:0}],{duration:380})`) and never jump-cuts.
5. **Reduced motion and Save-Data skip it entirely.** Run `finish()` synchronously before the first frame. Optionally show a 600 ms static lockup cross-fade, with no movement.
6. **WCAG 2.2.2.** Motion longer than 5 s needs a stop mechanism. The Skip button is that mechanism, so never hide it during the intro.
7. **Budget.** Per-frame work ≤ 8 ms on a 4× throttled CPU. Cap canvas DPR at 2. Particles: ≤180 desktop, ≤90 at `max-width:600px`. Allow no long task >50 ms during the intro.
8. **Handoff event.** `finish()` dispatches `pep:ready`. Site motion (Lenis, ScrollTrigger, hero canvas) boots on that event, so pins measure the final layout.

## Timeline skeleton (one clock, pure functions of t)
A scene is a function `(t, dt) => void` that only *sets* styles from `t`. That makes it seekable for screenshots and impossible to drift.
```js
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));   // 0→1 inside [a,b]
// Beats for an 8.5 s intro (scale proportionally for 7–9 s):
// 0.0–0.8 establish (plate/scan fades in)   0.8–3.0 build (elements spawn and connect)
// 3.0–5.5 transform (the hero object folds into the mark)   5.5–7.0 lockup (wordmark + tagline)
// 7.0–8.5 handoff (the signature transition into #site)
let start = null, last = 0, raf, finished = false;
function frame(now) {
  if (finished) return;
  start ??= now; const t = (now - start) / 1000, dt = Math.min(.05, (now - (last || now)) / 1000); last = now;
  SCENES[mode](t, dt);
  if (t >= TOTAL) return finish();
  raf = requestAnimationFrame(frame);
}
window.__intro = { seek: t => SCENES[mode](t, 1 / 60) };   // tests screenshot exact beats
// Never start the clock before fonts, but never wait more than 900 ms either
Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))])
  .then(() => { plate.play()?.catch(() => {}); raf = requestAnimationFrame(frame); });
```
Video plate: `plate.addEventListener('canplay', () => plateOk = true, {once:true})`. Every scene must look finished with `plateOk === false`, because the canvas carries it (see the `film` and `vial` scenes in intro.js).

## Handoff transitions (k = eased 0→1 over the last 1.2–1.6 s)
Use `ease.inOutQuart` for all of them. Pick ONE per template. Each template's must differ, and you must register it in the effect catalogue (`TRN-NN`) and tag `data-fx`.

**Cube turn** (intro.js `synthesis`). The parent needs `perspective:1600px`, and both faces need `transform-origin` on the shared edge and `backface-visibility:hidden`.
```js
stage.style.transform = `scale(${1 - .16 * Math.sin(Math.PI * k)})`;       // dip mid-turn sells the mass
intro.style.transform = `rotateY(${-90 * k}deg)`; site.style.transform = `rotateY(${90 - 90 * k}deg)`;
intro.style.filter = `brightness(${1 - .6 * k})`;  site.style.filter = `brightness(${.4 + .6 * k})`;
```
**Portal mask** (`film`). The hole opens at the brand mark, and the site pushes from 1.22 to 1.
```js
const R = k * Math.hypot(innerWidth, innerHeight);
intro.style.maskImage = `radial-gradient(circle at 50% 36%, transparent ${R}px, #000 ${R + 2}px)`;
site.style.transformOrigin = '50% 36%'; site.style.transform = `scale(${1.22 - .22 * k})`;
```
**Letterbox split** (`vial`).
```js
const g = k * 52;
intro.style.maskImage = `linear-gradient(#000 ${50 - g}%, transparent ${50 - g}% ${50 + g}%, #000 ${50 + g}%)`;
```
**Venetian slats.** Use 10–14 slats, each closing with a 40 ms stagger. One gradient cannot stagger, so draw the slats into the mask with an SVG data URL rebuilt per frame (keep it under 1 KB).
```js
const N = 12, h = 100 / N, rects = Array.from({ length: N }, (_, i) => {
  const ki = Math.min(1, Math.max(0, k * 1.5 - i * .04)); return `<rect y='${i * h}' width='100' height='${h * (1 - ki)}'/>`; }).join('');
intro.style.maskImage = `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'>${rects}</svg>")`;
intro.style.maskSize = '100% 100%';
```
**Liquid ripple reveal.** Put the site ON TOP at handoff and grow a wobbly polygon. A 72-point `clip-path: polygon()` works in every engine, while an SVG `<mask>` referenced from CSS does not.
```js
site.style.zIndex = 60;
const R = k * Math.hypot(innerWidth, innerHeight) * .6, cx = innerWidth / 2, cy = innerHeight * .4, T = performance.now() / 1000;
const pts = Array.from({ length: 72 }, (_, i) => { const a = i / 72 * Math.PI * 2;
  const r = R * (1 + .05 * Math.sin(6 * a + 8 * T) * (1 - k) + .025 * Math.sin(11 * a - 5 * T));
  return `${cx + r * Math.cos(a)}px ${cy + r * Math.sin(a)}px`; });
site.style.clipPath = k >= 1 ? '' : `polygon(${pts.join(',')})`;
```
Always set `-webkit-mask-image` as well as `mask-image`. In `finish()` clear every inline transform, filter, mask, clip-path and z-index on `#site` and `#stage`, or later `position:sticky` and pins will break because a transformed ancestor creates a containing block.

## Clichés to refuse (offer an alternative instead)
- 0→100% counter or a progress bar pretending to load. Use a meaningful readout instead (`SEQ 004 / 009`, `LOT P-0420 · SEALED`).
- Solid-colour wipe or curtain. Use a mask that reveals the real site.
- An endlessly spinning DNA or helix. The object must *do* something (fold, close, dock) and land still, front-on.
- A logo that just fades in at centre, a typewriter "Loading…", an RGB-split glitch on everything, a lagging ring cursor.
- Audio. No sound ever plays in an intro.

## Accessibility
- `#intro` gets `role="dialog" aria-label="Intro animation" aria-modal="false"`, and the canvas gets `aria-hidden="true"`. Do not make `#site` `inert`, so screen-reader users can read the content immediately.
- If focus is inside the intro at `finish()`, move it to `#main` (`tabindex="-1"`).
- The text-size control and phone line work during the intro (Site 1 binds them before boot).

## Verify (Playwright; see BRIEF.md for the launcher)
- Fresh context: `__intro.seek(t)` screenshots at 1.5 / 4 / 6.5 / 8 s, and LOOK at each one.
- LCP: the observer from `perf-budget-cwv` reports the hero H1 or hero image as the element, at < 2.0 s, even with the intro running.
- With `media/intro.mp4` missing, the scene still looks designed, with no broken-video icon.
- Esc at 2 s: `#intro` is gone within 500 ms, and `sessionStorage['pep-intro']==='1'`.
- Reload: no intro. Navigate to `#intro`: it replays.
- `reducedMotion:'reduce'`: `#intro` never paints (check `document.getElementById('intro') === null` on load).
- After finish: `getComputedStyle(site).transform === 'none'`, and a pinned section still pins.
