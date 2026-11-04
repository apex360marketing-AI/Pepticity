---
name: gsap-scroll-choreography
description: Choreograph cinematic scroll sequences with GSAP 3 + ScrollTrigger (pin, scrub, timelines), SplitText headline reveals, Flip layout transitions and Lenis smooth scroll. Use when a page needs Apple-style pinned story sections, scrubbed multi-element timelines, horizontal scroll sections, or text that splits and animates in.
---

# GSAP scroll choreography

GSAP is free for all uses, including every former Club plugin (SplitText, Flip, ScrollSmoother, MorphSVG), under the GSAP "Standard no-charge" license. Package `gsap@3.15.0` (Apr 2026) ships `dist/gsap.min.js`, `ScrollTrigger.min.js`, `SplitText.min.js`, `Flip.min.js`, `Observer.min.js` and `ScrollSmoother.min.js`.

## Loading in an Artifact page (UMD globals, before your inline script)
```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/SplitText.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/Flip.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.min.js"></script>
```
cdnjs mirrors the same versions under `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.15.0/`. In the Next.js app use `npm i gsap lenis` and `import { ScrollTrigger } from 'gsap/ScrollTrigger'`.

## The core pattern
```js
gsap.registerPlugin(ScrollTrigger, SplitText, Flip);
const mm = gsap.matchMedia();   // owns all responsive + reduced-motion branching

mm.add({ desktop: '(min-width: 900px)', reduce: '(prefers-reduced-motion: reduce)' }, ctx => {
  const { desktop, reduce } = ctx.conditions;
  if (reduce) { gsap.set('[data-reveal]', { opacity: 1, y: 0 }); return; }

  // 1. Smooth scroll: Lenis driven by the GSAP ticker (one loop only)
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = t => lenis.raf(t * 1000);          // ticker gives seconds, Lenis wants ms
  gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);

  // 2. SplitText headline: lines mask-reveal, words rise and unblur
  SplitText.create('.hero h1', { type: 'lines,words', mask: 'lines', autoSplit: true,
    onSplit: s => gsap.from(s.words, { yPercent: 110, opacity: 0, filter: 'blur(8px)',
      duration: 1.1, ease: 'expo.out', stagger: 0.06 }) });

  // 3. Pinned story: one timeline scrubbed across 3 viewports
  if (desktop) {
    gsap.timeline({ scrollTrigger: { trigger: '#journey', start: 'top top', end: '+=300%', pin: true, scrub: 1, snap: { snapTo: 'labels', duration: 0.4 } } })
      .addLabel('capture').to('.lead-card', { rotateY: -12, z: 80 })
      .addLabel('verify').to('.check', { scale: 1, opacity: 1, stagger: 0.2 })
      .addLabel('match').to('.pin-drop', { y: 0, opacity: 1, ease: 'back.out(2)' })
      .addLabel('deliver').to('.lead-card', { x: '35vw', rotateY: 0, scale: 0.8 });

    // 4. Horizontal section driven by vertical scroll
    const track = document.querySelector('.h-track');
    gsap.to(track, { x: () => -(track.scrollWidth - innerWidth), ease: 'none',
      scrollTrigger: { trigger: '.h-wrap', pin: true, scrub: 1, end: () => '+=' + track.scrollWidth, invalidateOnRefresh: true } });
  }

  // 5. Batched reveals for grids (one ScrollTrigger per batch, not per card)
  ScrollTrigger.batch('[data-reveal]', { start: 'top 85%',
    onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08 }) });

  return () => { gsap.ticker.remove(tick); lenis.destroy(); };  // cleanup on breakpoint change
});
```
Set initial hidden state in CSS (`[data-reveal]{opacity:0;transform:translateY(24px)}`) so nothing flashes before JS boots, and override it under `@media (prefers-reduced-motion: reduce)`.

## Flip: animate between layouts (filters, expanding cards)
```js
const state = Flip.getState('.card');
grid.classList.toggle('trades-only');           // change layout instantly
Flip.from(state, { duration: 0.7, ease: 'power2.inOut', absolute: true, scale: true,
  onEnter: el => gsap.fromTo(el, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1 }),
  onLeave: el => gsap.to(el, { opacity: 0, scale: 0.8 }) });
```

## Rules and pitfalls
- `scrub: 1` (smoothed), not `scrub: true` (stiff), for the cinematic feel.
- Never set a `scrollerProxy` with window-level Lenis. Pins break.
- Only one RAF loop. Don't run your own `requestAnimationFrame` for Lenis.
- Pins on mobile fight touch momentum. Gate pin/scrub inside the `desktop` condition and give mobile simple batched reveals.
- Call `ScrollTrigger.refresh()` after fonts and images load (`document.fonts.ready.then(() => ScrollTrigger.refresh())`).
- Animate transforms, opacity, filter and clip-path only; never top, left, width or height.
- Inside React: wrap in `useGSAP()` (from `@gsap/react`) or `gsap.context()` scoped to a ref, and revert on unmount.
- Anchor links under Lenis: `lenis.scrollTo('#id')` instead of default jumps.

## Verify (Playwright, /opt/pw-browsers/chromium-1194/chrome-linux/chrome)
- No `pageerror`; `typeof gsap !== 'undefined' && ScrollTrigger.getAll().length > 0`.
- Lenis fights headless `window.scrollTo`. In tests, call `lenis.scrollTo(y, { immediate: true })` or use `page.mouse.wheel` steps, then wait about 400ms.
- Pinned section: element `getBoundingClientRect().top` stays at 0 across several scroll steps, while the timeline `progress()` increases.
- SplitText headline words end at opacity 1 after about 2s.
- 390px viewport: `scrollWidth === 390`, no pins (`ScrollTrigger.getAll().filter(s => s.pin).length === 0`).
- `reducedMotion: 'reduce'` context: all `[data-reveal]` visible immediately, no Lenis instance.
