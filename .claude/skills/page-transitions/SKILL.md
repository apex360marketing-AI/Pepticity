---
name: page-transitions
description: Build cinematic page-to-page and first-load moments for APEX — cross-document View Transitions (`@view-transition`, pageswap/pagereveal, transition types, shared-element morphs), a tiny fetch-and-swap router for static multi-page sites that need a persistent WebGL canvas, Next.js 16 `<ViewTransition>` with Link `transitionTypes`, and preloader/intro rules that never hurt LCP. Use for route transitions, "page morphs", loaders, intro curtains, logo hand-offs, or any TRN-category effect.
---

# Page transitions and first load

This is roadmap item 10 ("page-to-page cinematic morphs"). A transition is a cut in a film: it should say what stayed the same (shared element) and which way you went (direction). Same-document recipes live in `css-scroll-driven-motion`; this skill covers navigation and loading.

## 1. Pick the mechanism
| Site type | Mechanism | Support |
|---|---|---|
| Static multi-page (Artifact files, generated sites) | Cross-document VT: `@view-transition{navigation:auto}` | Chrome/Edge 126+, Safari 18.2+. Firefox navigates normally, which is fine |
| Needs a persistent canvas or audio across pages | Fetch-and-swap router (section 3) + `document.startViewTransition` | All browsers. Animates where VT exists, instant elsewhere |
| Next.js 16 app (this repo) | React `<ViewTransition>` + `<Link transitionTypes>` | Needs React 19.3+. **This repo is on React 18.3.1, so upgrade first** (read `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`) |

## 2. Cross-document recipe (both pages)
```html
<link rel="expect" href="#main" blocking="render">  <!-- don't reveal until the hero exists -->
<style>
@view-transition{navigation:auto}
.hero-media{view-transition-name:hero}             /* same name on both pages = morph */
::view-transition-group(hero){animation-duration:var(--apx-dur-5,900ms);animation-timing-function:cubic-bezier(.16,1,.3,1)}
html:active-view-transition-type(forward)::view-transition-old(root){animation:.32s cubic-bezier(.7,0,.84,0) both apx-out-left}
html:active-view-transition-type(forward)::view-transition-new(root){animation:.56s cubic-bezier(.16,1,.3,1) .1s both apx-in-right}
@keyframes apx-out-left{to{opacity:0;transform:translateX(-4%);filter:blur(6px)}}
@keyframes apx-in-right{from{opacity:0;transform:translateX(6%)}}
@media (prefers-reduced-motion:reduce){::view-transition-group(*),::view-transition-old(*),::view-transition-new(*){animation:none!important}}
</style>
<script>
const depth = u => new URL(u, location.href).pathname.split('/').filter(Boolean).length;
addEventListener('pageswap', e => { if (!e.viewTransition || !e.activation) return;
  e.viewTransition.types.add(depth(e.activation.entry.url) >= depth(location.href) ? 'forward' : 'back'); });
addEventListener('pagereveal', e => { if (!e.viewTransition) return;
  const from = navigation?.activation?.from?.url; if (from) e.viewTransition.types.add(depth(location.href) >= depth(from) ? 'forward' : 'back'); });
</script>
```
- `view-transition-name` values must be unique per page. For lists, set the name only on the clicked item (in `pageswap`, or inline on click) and on the destination hero.
- Keep the whole transition under 1s: leave about 300ms, enter 500–800ms. Never block input.

## 3. Fetch-and-swap router (persistent WebGL between pages)
```js
async function go(url, type = 'forward', push = true) {
  const res = await fetch(url); if (!res.ok) return location.assign(url);
  const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
  const swap = () => { document.querySelector('main').replaceWith(doc.querySelector('main'));
    document.title = doc.title; if (push) history.pushState({ type }, '', url); scrollTo(0, 0);
    document.querySelector('main h1')?.focus({ preventScroll: true });      // h1 carries tabindex="-1"
    dispatchEvent(new CustomEvent('apx:page', { detail: { url } })); };     // modules re-mount on this
  if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return swap();
  const vt = document.startViewTransition({ update: swap, types: [type] }); await vt.finished; }
document.addEventListener('click', e => { const a = e.target.closest('a[href]');
  if (!a || a.origin !== location.origin || a.target || e.metaKey || e.ctrlKey || a.hasAttribute('download')) return;
  e.preventDefault(); go(a.href, a.dataset.dir || 'forward'); });
addEventListener('popstate', () => go(location.href, 'back', false));
```
- The canvas lives outside `<main>`, so it survives the swap and can animate the cut itself (a shader dissolve or camera move) in step with the VT.
- Re-mount artifact modules on `apx:page` (`window.APX.<Code>.mount(root)` is idempotent) and call `destroy()` on the old ones first. Run `ScrollTrigger.refresh()` after the swap.
- Move focus to the new `<h1>` (`tabindex="-1"`) and announce the title in a polite live region.
- Older browsers without `types` in `startViewTransition({…})` take a callback only; feature-test and fall back to `startViewTransition(swap)`.

## 4. Preloaders and intros (the strict rules)
Default: **no full-screen loader.** A loader that covers the page for 1.5s adds 1.5s to every visit.
- A loader is only allowed when a heavy WebGL hero needs more than about 1s to be ready. Then it must:
  1. paint within 100ms (inline CSS, no web font needed), and show REAL progress (a THREE `LoadingManager` or count of fetched assets), never a fake timer;
  2. never hold the page back artificially; leave as soon as it's ready, and time out at 2.5s and reveal the fallback hero;
  3. keep the H1 and hero copy in the server HTML and visible (opacity 1, not covered by an opaque layer), so search engines see them and LCP isn't blocked. Prefer a partial curtain or a mark animating over the hero to a full overlay;
  4. hand off to the page: the loader's mark morphs into the nav logo (VT name or FLIP) and the curtain becomes the first section transition;
  5. play only once per session (`sessionStorage` in try/catch). Reduced motion gets a 200ms fade.
- Skeletons over spinners for in-page loading. Spinners only for actions under about 3s.
- Catalogue every transition and loader as `TRN-xx` (see `effect-catalog`).

## Do / don't
- DO design the transition with the destination: what morphs, which way it moves, and what the eye follows.
- DON'T stack a VT root crossfade on top of a GSAP page-exit animation (double fade); pick one owner of each cut.
- DON'T animate the whole page with a blur on mobile (it's expensive); use opacity plus a small translate.

## Verify (Playwright, `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`)
- Click through 3 links and back: no `pageerror`, the URL and title update, and the focus lands on the new H1.
- During the transition, `document.getAnimations().length > 0`; afterwards, no leftover `::view-transition` (query `document.activeViewTransition` where supported).
- Simulate no support with `addInitScript(() => { delete Document.prototype.startViewTransition })`: navigation still works.
- `reducedMotion:'reduce'`: the swap is instant.
- Loader: measure LCP with a PerformanceObserver and compare it with the loader on and off; the difference must be ≤ 200ms. The H1 must exist in the raw HTML.
- Screenshot mid-transition (`page.clock` or a 150ms delay) and LOOK at it: the morph must read as a single object moving.
