---
name: css-scroll-driven-motion
description: Build scroll-linked animation with zero JavaScript using native CSS scroll-driven animations (animation-timeline scroll()/view(), animation-range) and the View Transitions API, with fallbacks. Use for lightweight reveals, progress bars, parallax and section transitions, especially on mobile or where adding GSAP is overkill.
---

# CSS scroll-driven motion and View Transitions

Native scroll timelines run off the main thread, so they're the smoothest option on phones. Support as of late 2026: Chrome/Edge 115+, Safari 26+; **Firefox stable still lacks it** (behind a flag). Always progressive-enhance.

## Rules
- Wrap every scroll timeline in `@supports (animation-timeline: view())`. Outside it, content must already be in its final visible state.
- Put it all under `@media (prefers-reduced-motion: no-preference)`.
- Use `animation-fill-mode: both` and `linear` timing for scrubbed effects; easing goes in the keyframes.
- Don't put `var()` inside the `animation` shorthand. Use longhands.
- Animate transform, opacity, filter or clip-path only.

## Recipes
```css
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {

    /* 1. Reveal as each element enters the viewport */
    .reveal { animation-name: rise; animation-timing-function: linear; animation-fill-mode: both;
      animation-timeline: view(); animation-range: entry 0% cover 30%; }
    @keyframes rise { from { opacity: 0; transform: translateY(48px) scale(.97); filter: blur(6px); } }

    /* 2. Page read-progress bar */
    .progress { position: fixed; inset: 0 0 auto; height: 3px; transform-origin: 0 50%;
      background: linear-gradient(90deg, #3b6bff, #22d3ee);
      animation-name: grow; animation-timing-function: linear; animation-timeline: scroll(root); }
    @keyframes grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }

    /* 3. Parallax layer tied to its section */
    .parallax { animation-name: drift; animation-timing-function: linear; animation-fill-mode: both;
      animation-timeline: view(); animation-range: cover; }
    @keyframes drift { from { transform: translateY(-12%); } to { transform: translateY(12%); } }

    /* 4. Curtain wipe: clip-path opens as the section scrolls in */
    .curtain { animation-name: open; animation-timing-function: linear; animation-fill-mode: both;
      animation-timeline: view(); animation-range: entry 10% cover 40%; }
    @keyframes open { from { clip-path: inset(0 50% 0 50% round 24px); } to { clip-path: inset(0 0 0 0 round 24px); } }

    /* 5. Header shrinks after the first 200px */
    .masthead { animation-name: shrink; animation-timing-function: linear; animation-fill-mode: both;
      animation-timeline: scroll(root); animation-range: 0 200px; }
    @keyframes shrink { to { padding-block: 8px; backdrop-filter: blur(14px); background: rgba(10,14,30,.7); } }
  }
}
```
**Named timelines** link one scroller to a distant element: set `view-timeline-name: --journey` on the section and `animation-timeline: --journey` on any descendant (for a non-descendant, add `timeline-scope: --journey` on a common ancestor).

**Horizontal pinned track with no JS:** a tall outer section (`height: 400vh`), a `position: sticky; top: 0; height: 100vh; overflow: hidden` inner, and a track animated with `transform: translateX(...)` on `animation-timeline: --outer` (outer has `view-timeline-name: --outer`; range `contain`).

## JS fallback for Firefox (tiny)
```js
if (!CSS.supports('animation-timeline: view()')) {
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add('in')), { threshold: .15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}
```
with `.reveal{opacity:0;transform:translateY(24px);transition:.7s cubic-bezier(.16,1,.3,1)} .reveal.in{opacity:1;transform:none}` in a `@supports not (animation-timeline: view())` block.

## View Transitions (state changes and page navigation)
Same-document: wrap any DOM change.
```js
function swap(update) { document.startViewTransition ? document.startViewTransition(update) : update(); }
swap(() => { panel.dataset.industry = 'roofing'; render(); });
```
```css
.detail-card { view-transition-name: detail; }       /* names must be unique on the page */
::view-transition-old(detail) { animation: .35s ease-in both fade-out; }
::view-transition-new(detail) { animation: .5s cubic-bezier(.16,1,.3,1) both pop-in; }
@keyframes pop-in { from { opacity: 0; transform: scale(.94); filter: blur(6px); } }
@media (prefers-reduced-motion: reduce) { ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; } }
```
Cross-document (multi-page Next.js or static site): add `@view-transition { navigation: auto; }` to both pages and give the shared hero element the same `view-transition-name` (Chromium and Safari 18.2+).

## Verify (Playwright, /opt/pw-browsers/chromium-1194/chrome-linux/chrome)
- `CSS.supports('animation-timeline: view()')` is true in this Chromium. Scroll a `.reveal` into view and read `getComputedStyle(el).opacity` rising to 1.
- Simulate Firefox by injecting `CSS.supports = () => false` with `addInitScript`: the IO fallback still reveals everything, and nothing is left at opacity 0.
- `reducedMotion: 'reduce'`: all content visible at load.
- Progress bar `transform` changes between scroll 0 and the bottom.
- View transition: call the swap, confirm no error and the new state rendered (screenshot).
