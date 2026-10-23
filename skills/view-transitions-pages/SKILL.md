---
name: view-transitions-pages
description: Animate between pages and views with the native View Transitions API. Covers same-document `startViewTransition` with transition types, cross-document `@view-transition {navigation:auto}` for multi-page sites, `view-transition-name` shared-element morphs, hash-routed views (home, shop, science, faq) in single-file artifacts that coexist with Lenis/GSAP, and React `<ViewTransition>` in Next.js. Use when asked for "page transitions", "animate between views", "morph the card into the page", "shared element transition", "route change animation", "make navigation feel cinematic", or when building the multi-view hash router for a template.
---

# View transitions for pages and views

The house skill `css-scroll-driven-motion` covers the 5-line basics. This skill covers what goes wrong in real multi-view builds: routing, types, focus, scroll, GSAP and React. The React part follows `vercel-labs/agent-skills` → `react-view-transitions`.

Support (Oct 2026): same-document VT in Chromium 111+, Safari 18+ and Firefox 144+. `types` needs Chromium 125+ or Safari 18.2+. Cross-document VT needs Chromium 126+ or Safari 18.2+. Always feature-detect, because the fallback is an instant swap and never a broken page.

## 1. Hash-routed views in one file (artifacts, Pepticity templates)
Rules from BRIEF.md: use bare letter tokens `#home #shop #science #faq` (never `#/path`), open `location.hash` on load, and keep the nav working from every view.
```js
const VIEWS = ['home', 'shop', 'science', 'faq'];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let current = null;
function show(name, { push = false } = {}) {
  if (!VIEWS.includes(name)) name = 'home';
  if (name === current) return;
  const dir = current && VIEWS.indexOf(name) < VIEWS.indexOf(current) ? 'back' : 'forward';
  const update = () => {
    document.querySelectorAll('[data-view]').forEach(v => { v.hidden = v.dataset.view !== name; });
    document.querySelectorAll('nav a[href^="#"]').forEach(a =>
      a.hash === '#' + name ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
    document.title = `${name[0].toUpperCase() + name.slice(1)} · Pepticity`;
    window.lenis ? lenis.scrollTo(0, { immediate: true }) : scrollTo(0, 0);
    current = name;
  };
  if (push) history.pushState(null, '', '#' + name);
  if (!document.startViewTransition || reduce || !current) { update(); afterSwap(name); return; }
  let vt;
  try { vt = document.startViewTransition({ update, types: [dir, 'to-' + name] }); }
  catch { vt = document.startViewTransition(update); }   // pre-types engines
  vt.finished.finally(() => afterSwap(name));
}
function afterSwap(name) {
  viewCtx[name]?.revert?.(); viewCtx[name] = gsap.context(() => bootView[name]?.());  // per-view triggers
  ScrollTrigger.refresh();
  const h = document.querySelector(`[data-view="${name}"] h1, [data-view="${name}"] h2`);
  h?.setAttribute('tabindex', '-1'); h?.focus({ preventScroll: true });
}
addEventListener('hashchange', () => show(location.hash.slice(1)));
show(location.hash.slice(1) || 'home');
```
- `#intro` (replay) is not a view, so route it to the intro and leave `current` alone.
- Kill the ScrollTriggers of the outgoing view (`gsap.context().revert()`). Hidden views with live pins produce ghost spacing.
- Intercept in-page anchors (`#pricing`) only when the target is inside the current view. Otherwise let the view router run.

## 2. Directional CSS with types
```css
::view-transition-group(root) { animation-duration: .55s; animation-timing-function: cubic-bezier(.7,0,.2,1); }
html:active-view-transition-type(forward) { &::view-transition-old(root) { animation-name: vt-out-left; }
                                            &::view-transition-new(root) { animation-name: vt-in-right; } }
html:active-view-transition-type(back)    { &::view-transition-old(root) { animation-name: vt-out-right; }
                                            &::view-transition-new(root) { animation-name: vt-in-left; } }
@keyframes vt-out-left { to { transform: translateX(-6%); opacity: 0; filter: blur(6px); } }
@keyframes vt-in-right { from { transform: translateX(6%); opacity: 0; } }
@keyframes vt-out-right { to { transform: translateX(6%); opacity: 0; filter: blur(6px); } }
@keyframes vt-in-left { from { transform: translateX(-6%); opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; } }
```
- Duration: 350–650 ms. Longer than 700 ms feels like waiting, and `INP` counts the blocked frame.
- Make the transition match the template's own signature (iris, slats, fold). Use `clip-path` keyframes on `::view-transition-new(root)` for masks: `from { clip-path: circle(0 at var(--x) var(--y)); } to { clip-path: circle(150% at var(--x) var(--y)); }`. Set `--x/--y` on `:root` from the click point before starting.

## 3. Shared-element morphs
```css
.site-header { view-transition-name: header; }        /* the header stays put instead of cross-fading */
.sticky-cta  { view-transition-name: cta; }
::view-transition-group(header), ::view-transition-group(cta) { animation: none; }
```
Give the product card image a name on click, and the same name on the destination hero:
```js
card.addEventListener('click', e => { card.querySelector('img').style.viewTransitionName = 'hero-media'; });
// destination hero CSS: .detail-hero img { view-transition-name: hero-media; }
// after vt.finished: clear the inline name so the next card can use it
```
- A name must be unique among rendered elements at snapshot time, or the whole transition is skipped with an `InvalidStateError` in the console. Hidden (`hidden`/`display:none`) elements do not count.
- Group many items with `view-transition-class: card` (Chromium 125+, Safari 18.2+) and style `::view-transition-group(*.card)`.
- Morph aspect-ratio changes with `::view-transition-old(hero-media), ::view-transition-new(hero-media) { height: 100%; object-fit: cover; }`, or the snapshot stretches.

## 4. Cross-document (multi-page static or Next.js export)
On BOTH pages:
```css
@view-transition { navigation: auto; }
```
```html
<link rel="expect" href="#hero" blocking="render">  <!-- don't reveal until the hero is parsed -->
```
```js
addEventListener('pageswap', e => { if (e.viewTransition && e.activation?.entry) e.viewTransition.types.add('forward'); });
addEventListener('pagereveal', e => { if (!e.viewTransition) return;
  const from = navigation.activation?.from?.url, to = navigation.activation?.entry?.url;
  if (from && to && new URL(to).pathname.length < new URL(from).pathname.length) e.viewTransition.types.add('back'); });
```
It only works for same-origin navigations. It never applies inside a Claude artifact, which is one document, so use section 1 there.

## 5. React / Next.js (`<ViewTransition>`)
- Next.js App Router bundles React canary, so do NOT install `react@canary`. Outside Next, `ViewTransition` needs `react@canary react-dom@canary`.
- Never call `document.startViewTransition` yourself in React. Declare `<ViewTransition>` and trigger with `startTransition`, `useDeferredValue` or `Suspense`. A plain `setState` does not animate.
- Placement rule: `<ViewTransition>` must come before any DOM node in its subtree, or enter/exit are suppressed.
- Use `default="none"` on page-level and named VTs so Suspense reveals and revalidations do not cross-fade everything. Add `share="morph"` explicitly when `default="none"`, or the morph silently never fires.
- For direction, use `addTransitionType('nav-forward')` inside `startTransition`, or `transitionTypes` on `next/link`. The browser Back button carries no type, so typed animations fall to `default`.
- For shared elements, use `name={`product-${id}`}` and nest it inside the list item's keyed VT (list identity outside, shared element inside).
- Never use a fade-out exit on a page that has shared morphs. Use a directional slide.

## Pitfalls
- Snapshots are flat images. Video, canvas and WebGL freeze for the duration, so pause the hero canvas loop during `vt.updateCallbackDone → vt.finished`.
- A transformed `#site` (left over from an intro) breaks `position:fixed` inside snapshots. Clear intro transforms first.
- Lenis: call `lenis.stop()` before the swap and `lenis.start()` in `finished`, or wheel input during the 0.5 s pushes the new view.
- Do not start a VT during the intro, and never for in-view filter toggles. Use GSAP Flip there (see `gsap-scroll-choreography`).
- Tag the transition in the effect catalogue as `TRN-NN` and add `data-fx` to the view container.

## Verify
- For each view: `location.hash='#shop'`, then wait for `document.querySelector('[data-view=shop]').hidden===false`, then check that `document.activeElement` is the view heading, `aria-current="page"` is on the matching link, and `scrollWidth===innerWidth`.
- No console `InvalidStateError` (duplicate names) across a full nav cycle, back and forth.
- `reducedMotion:'reduce'`: swaps are instant, with no `::view-transition` pseudo-elements present after 50 ms.
- Load `preview.html#faq` directly: it opens on FAQ, with no flash of Home.
