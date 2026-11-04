# Fingerprints: how to recognise a library or technique

What `tools/design-capture/capture.mjs` looks for, and how to confirm it by hand in DevTools. A bundled library often has no global: trust DOM/CSS side effects and script URLs too.

## Libraries

| Library | Globals (console) | DOM / CSS side effects | Script / network | Notes |
|---|---|---|---|---|
| GSAP | `gsap.version` | inline `style="transform: translate(...)"` that changes on scroll | `gsap@3.x`, `gsap.min.js` | Plugins via `gsap.core.globals()` |
| ScrollTrigger | `ScrollTrigger.getAll().length` | `.pin-spacer` wrappers; pinned element switches to `position:fixed` | `ScrollTrigger.min.js` | Each trigger: `trigger, start, end, pin, vars.scrub` |
| SplitText | `SplitText` | many `div`/`span` per word or char inside headings, `aria-label` on parent | `SplitText.min.js` | Splitting.js uses `data-splitting`, `--char-index` |
| ScrollSmoother | `ScrollSmoother` | `#smooth-wrapper > #smooth-content`, content moved by transform | | Body height set inline |
| Lenis | `lenis`, `Lenis` | `html.lenis`, `.lenis-smooth`, `.lenis-scrolling` | `lenis` | Native scroll still works |
| Locomotive Scroll | `LocomotiveScroll` | `html.has-scroll-smooth`, `[data-scroll-container]`, `[data-scroll]` | `locomotive-scroll` | v4 moves content by transform (no native scroll) |
| three.js | `THREE.REVISION` or `__THREE__` | `<canvas>` with a WebGL context | `three.module.js`, `three@0.x` | `__THREE__` is set even when bundled |
| WebGL / WebGL2 / WebGPU | | `<canvas>` (context type logged by a `getContext` hook) | | Full-viewport + fixed = background layer |
| Lottie | `lottie`, `bodymovin` | `<lottie-player>`, `<dotlottie-player>`, SVG with many `<g>` | `.json` / `.lottie` files | |
| Rive | `rive` | `<canvas>` | `@rive-app`, `.riv` files | |
| Spline | | `<spline-viewer>` | `prod.spline.design`, `@splinetool` | |
| Unicorn Studio | `UnicornStudio` | `[data-us-project]` | `unicornstudio` | Shader scenes |
| Barba.js | `barba` | `[data-barba="wrapper"]`, `[data-barba="container"]` | | Page transitions |
| Swup | `swup` | `#swup`, `.transition-*` classes | | Page transitions |
| Swiper | `Swiper` | `.swiper`, `.swiper-wrapper`, `.swiper-slide` | | Carousel |
| Tailwind | | `--tw-*` custom properties; utility class names (`px-4`, `md:flex`) | | Signal only |
| Framer Motion / Motion | | `data-projection-id`, inline transforms on mount | | Signal only |

## Platforms

| Platform | Signal |
|---|---|
| Framer | `meta[name=generator]` Framer, `#__framer-badge-container`, `data-framer-name`, `framerusercontent.com` |
| Webflow | `html[data-wf-page]`, `html[data-wf-site]`, `Webflow` global, `data-w-id` (IX2 interactions) |
| Next.js | `__NEXT_DATA__` (pages router), `self.__next_f` (app router), `/_next/` URLs, `#__next` |
| Nuxt | `__NUXT__`, `#__nuxt`, `/_nuxt/` |
| Astro | `<astro-island>`, `data-astro-cid-*` attributes |
| SvelteKit | `data-sveltekit-*`, `/_app/immutable/` |
| Shopify | `Shopify` global, `cdn.shopify.com` |
| WordPress | generator meta, `/wp-content/`, `/wp-includes/` |
| Wix | generator meta, `static.wixstatic.com`, `parastorage.com` |
| Squarespace | `Static.SQUARESPACE_CONTEXT`, `squarespace-cdn.com` |

## CSS techniques

| Technique | In CSS | Live evidence |
|---|---|---|
| Scroll-driven animation | `animation-timeline: scroll()` / `view()`, `animation-range`, `scroll-timeline`, `view-timeline` | `document.getAnimations()` entries whose timeline is `ScrollTimeline` / `ViewTimeline` |
| View transitions | `@view-transition { navigation: auto }`, `view-transition-name`, `::view-transition-*` | `document.startViewTransition` calls |
| Sticky pin | `position: sticky` | element's viewport top stays constant while scrolling (pin range) |
| JS pin | none | element turns `position: fixed` (ScrollTrigger) or is counter-transformed |
| Glass | `backdrop-filter` | live elements with `backdrop-filter != none` |
| Blend cursor / nav | `mix-blend-mode: difference` | |
| Reveal masks | `clip-path: inset()/polygon()/circle()` changing | clip-path states change with scroll |
| Animated custom props | `@property --x { syntax: ... }` | gradients/angles animating |
| Custom cursor | `cursor: none` + a fixed follower element | element class contains `cursor` |
| Smooth scroll | `scroll-behavior: smooth`, or Lenis / Locomotive | |
| Snap | `scroll-snap-type` | |

## Motion evidence in capture.json

| Field | Means |
|---|---|
| `motion.pinned[]` | Viewport top constant (±2 px) for ≥0.4 viewport of scroll while in view. `mechanism` = sticky / fixed (JS pin) / transform-compensated |
| `motion.fixed[]` | Constant over the whole scroll: fixed header, cursor, background layer |
| `motion.scrollDriven[]` kind `scrub` | Value follows scroll (≥5 states, rank correlation ≥0.7): parallax, scrubbed timelines |
| `motion.scrollDriven[]` kind `trigger` | Changes once when reached: reveal-on-enter tweens / IntersectionObserver classes |
| `motion.timeDriven[]` | Keeps moving at rest: CSS infinite loops or JS/rAF loops (not scroll) |
| `motion.runningAnimations[]` | `document.getAnimations()` at rest: CSS animations, transitions, WAAPI, scroll timelines |
| `tech.gsap.triggers[]` | Live ScrollTrigger instances (start/end px, pin, scrub) when GSAP is global |
