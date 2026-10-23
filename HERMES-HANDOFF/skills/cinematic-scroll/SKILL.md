---
name: cinematic-scroll
description: Build modern, cinematic scroll-driven motion for any website — smooth inertial scrolling, pinned sections, parallax layers, scroll-scrubbed video/canvas, text reveals, and magnetic hover — on top of plain HTML/CSS/JS, React, or any framework. Use this whenever the user wants a site to feel "fancy", "modern", "premium", "cinematic", or asks for scroll animations, parallax, pinned sections, smooth scrolling, scroll-triggered reveals, or a site that "doesn't feel static" — even if they don't name a specific library. Applies across every site in the portfolio (Apex 360, Ascension, Command Board, client sites), not just one project.
---

# Cinematic Scroll

Modern "fancy" sites almost never use one trick — they layer 3-4 cheap, well-executed techniques
on top of each other. This skill is that layer set, plus a drop-in kit (`assets/scroll-kit.js` +
`assets/scroll-kit.css`) that works on a static HTML page, a Next.js app, or anything else with a
DOM, with zero build step required.

**Always use the kit as the starting point** — don't hand-roll scroll logic from scratch each
time. Copy `assets/scroll-kit.js` and `assets/scroll-kit.css` into the target project, link them,
and annotate markup with the data attributes below. Reach for GSAP/ScrollTrigger only when a
client project already depends on it or needs a complex orchestrated timeline the kit can't
express (see "When to escalate to GSAP").

## The five layers, cheapest first

Pick based on how "fancy" the page needs to feel — stack as many as the brand can carry. Don't
apply all five to every page; a page that does everything looks noisy, not premium.

1. **Smooth/inertial scroll** — the single highest-leverage change. A page with native scroll
   feels like every other site; a page with eased, lightly-lagged scroll feels expensive. The kit
   wraps this in `ScrollKit.smooth()`. Skip it only on pages with heavy native scroll-dependent
   widgets (e.g. embedded maps) where it can fight the browser.
2. **Reveal-on-scroll** — elements fade/rise/scale in as they enter the viewport. Built on
   `IntersectionObserver`, not scroll-position math — cheaper, and it still works if JS is slow to
   boot. This is the one technique that's basically always worth doing.
3. **Parallax layers** — background/foreground elements move at different rates than the
   scroll. Use sparingly (1-3 layers per section) and only on `transform: translate3d`, never on
   `top`/`margin` — those trigger layout on every frame and will visibly stutter.
4. **Pinned/sticky storytelling sections** — a section locks in place while its content changes
   underneath the scroll (image sequences, step-through explainers, stat counters). This is the
   "cinematic" move people mean when they say a site feels like an Apple product page.
5. **Scroll-scrubbed media** — video or canvas frame advances with scroll position instead of
   playing on a timer. Highest cost to build, highest payoff for a hero or case-study section —
   use once per site, not per page.

## Using the kit

Link the two files, then mark up elements with data attributes — no JS wiring required for the
common cases:

```html
<link rel="stylesheet" href="/assets/scroll-kit.css">
<script type="module" src="/assets/scroll-kit.js"></script>

<!-- smooth scroll: opt the whole page in once -->
<body data-scroll-smooth>

  <!-- reveal on scroll -->
  <h2 data-reveal>Headline that rises in</h2>
  <p data-reveal data-reveal-delay="120">Follows a beat later</p>
  <div data-reveal data-reveal-style="scale">Scales up instead of rising</div>

  <!-- parallax: higher factor = moves more than scroll -->
  <img data-parallax="0.3" src="/bg-layer.jpg" alt="">

  <!-- pin a section while its inner steps scroll through -->
  <section data-pin data-pin-steps=".step">
    <div class="step">Step 1</div>
    <div class="step">Step 2</div>
    <div class="step">Step 3</div>
  </section>
</body>
```

`ScrollKit` auto-initializes on `DOMContentLoaded` by scanning for these attributes — for a React/
Next.js/Vue project, call `ScrollKit.init(root)` inside a mount effect instead, scoped to the
component's root node, and call `ScrollKit.destroy(root)` on unmount to avoid leaking observers.

Read the top of `assets/scroll-kit.js` for the full attribute reference (`data-reveal-style`:
rise | scale | fade; `data-parallax-axis`; `data-pin-steps`) — it's commented inline rather than
duplicated here, so it can't drift out of sync with the code.

## Non-negotiables (these are what separate "cinematic" from "janky")

- **Animate `transform` and `opacity` only.** Anything that animates `top`, `left`, `width`,
  `height`, or `margin` forces layout recalculation on every scroll frame — this is the #1 cause
  of scroll animations that stutter on anything but a high-end laptop. The kit only ever touches
  `transform`/`opacity`.
- **Respect `prefers-reduced-motion`.** The kit checks this automatically and falls back to
  instant state changes (no smooth scroll, no parallax drift, reveals just appear) — don't
  override that check unless the user explicitly asks you to.
- **Scroll listeners must be passive and rAF-throttled.** Never run animation logic directly
  inside a raw `scroll` event — batch reads/writes through `requestAnimationFrame`, which is what
  the kit's internal loop does. A raw per-event handler is the second most common cause of jank.
- **Pinned sections need an explicit height budget.** A pinned section needs `min-height` set to
  roughly `steps × 100vh` (or whatever scroll distance the story needs) — without it the pin never
  releases and the rest of the page is unreachable. The kit computes this automatically for
  `data-pin-steps`, but if you hand-build a pin, budget the height yourself.
- **Mobile gets the cheap layers, not all of them.** Parallax and pinned sections are
  disproportionately expensive on mobile GPUs and often fight touch-scroll momentum. Default to
  reveal-on-scroll everywhere, and gate parallax/pin/scroll-scrub behind a `(min-width: 900px)`
  media check unless the brand specifically needs the mobile version too.

## When to escalate to GSAP + ScrollTrigger

The kit covers maybe 80% of what "cinematic scroll" means in practice. Reach for GSAP when a
section needs genuine timeline choreography the kit's single-purpose primitives can't express —
multiple elements animating in a precise, scrubbed sequence against one pinned section (e.g. a
car exploding into parts as you scroll, each part arriving on its own curve). Don't add the GSAP
dependency for a page that only needs reveals and parallax — that's the kit's job, and it's
zero-dependency.

If GSAP is already a dependency in the project, the pattern is:

```js
gsap.registerPlugin(ScrollTrigger);
gsap.timeline({
  scrollTrigger: { trigger: "#hero", start: "top top", end: "+=2000", pin: true, scrub: 1 }
})
  .to(".part-a", { x: -200, rotate: -30 })
  .to(".part-b", { x: 200, rotate: 30 }, "<"); // "<" = same start time as previous tween
```

`scrub: 1` ties the timeline directly to scroll position with a slight smoothing lag — that
smoothing (not `scrub: true`, which is instant/stiff) is usually what makes the result feel
cinematic rather than mechanical.

## Fast sanity check before calling it done

- Hard-refresh and scroll fast, both directions — reveals should not "pop" in already-visible on
  load, and nothing should flash unstyled before JS boots (the kit's CSS hides `[data-reveal]`
  elements by default so there's no flash either way).
- Throttle CPU 4x in devtools and scroll the pinned/parallax sections — if it stutters there, it
  will stutter on a real client's phone.
- Toggle `prefers-reduced-motion` in devtools (or OS accessibility settings) and confirm the page
  is still fully usable with motion off.
