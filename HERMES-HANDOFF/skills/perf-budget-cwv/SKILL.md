---
name: perf-budget-cwv
description: Hold cinematic sites to a strict Core Web Vitals budget (LCP < 2.0 s, INP < 150 ms, CLS < 0.05, JS < 170 KB gzipped) while keeping intros, WebGL and video. Covers deferring WebGL until after LCP, video and image rules, field measurement with web-vitals 6, and lab measurement with Playwright plus PerformanceObserver under CPU and network throttling. Use when asked "is it fast", "performance budget", "Core Web Vitals", "LCP / INP / CLS", "Lighthouse score", "it feels janky", "page weight", "why is it slow on mobile", or before shipping any page with an intro, canvas, WebGL or video.
---

# Performance budget and Core Web Vitals

House `quality-gate` fails at LCP 2.5 s and CLS 0.1 (Google's "good" thresholds). Cinematic pages carry heavy extras, so we budget tighter to leave headroom on real phones.

## The budget (p75, mobile, every view)
| Metric | Budget | Fail at |
|---|---|---|
| LCP | < 2.0 s (lab: 4× CPU, 1.6 Mbps / 150 ms RTT) | ≥ 2.5 s |
| INP | < 150 ms (lab: every interaction < 100 ms of processing) | ≥ 200 ms |
| CLS | < 0.05 | ≥ 0.1 |
| JS on the critical path | < 170 KB gz total, own code < 110 KB gz | > 200 KB |
| Long tasks during idle | none > 50 ms after load; none > 200 ms ever | — |
| Hero image | ≤ 120 KB (AVIF/WebP) at 390px, ≤ 250 KB at 1440px | — |
| Fonts | ≤ 2 families, ≤ 4 files, ≤ 120 KB woff2 total | — |
| Intro video | < 3 MB mobile, < 6 MB desktop, never on the critical path (see `web-video-pipeline`) | — |

Measured house stack (gzip -9): gsap 28.3 KB + ScrollTrigger 18.0 KB + SplitText 3.7 KB + Lenis 5.4 KB = **55.4 KB**. That leaves ~110 KB for everything else. three's WebGPU build (444 KB gz) and Mol* (5.3 MB raw) can only ever load lazily.

## 1. LCP rules
- The LCP element (hero H1 or hero image) must be in the raw HTML and painted on first frame, not created or revealed by JS. An intro overlay is fine (see `cinematic-preloader-entrance`) as long as no intro DOM text or image is larger than the hero.
- Never start the hero H1 at `opacity:0`. Chrome ignores opacity-0 elements as LCP candidates until they become visible, so a 1.1 s SplitText reveal delays LCP by 1.1 s. Animate words from `yPercent`/`filter` with the line box visible, or reveal only below-the-fold headings.
- A hero image gets `fetchpriority="high"`, explicit `width`/`height`, no `loading="lazy"`, and a `<link rel="preload" as="image" imagesrcset=…>` when it is a CSS background.
- Fonts: `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`, `display=swap` for the body face, and `display=optional` for display faces used only in the hero (no late swap reflow). Match fallback metrics with `size-adjust` / `ascent-override` on a local fallback `@font-face`.
- Inline critical CSS. A single-file artifact already does, so keep the `<style>` block before any `<script>`.

## 2. Defer WebGL, canvas and heavy JS until after LCP
```js
function afterLCP(timeout = 3000) {
  return new Promise(res => {
    let done = false; const go = () => { if (done) return; done = true; (window.requestIdleCallback || setTimeout)(res, { timeout: 500 }); };
    try { new PerformanceObserver((l, o) => { if (l.getEntries().length) { o.disconnect(); setTimeout(go, 100); } })
            .observe({ type: 'largest-contentful-paint', buffered: true }); } catch { }
    addEventListener('pointerdown', go, { once: true }); addEventListener('keydown', go, { once: true });  // LCP stops at input
    setTimeout(go, timeout);
  });
}
afterLCP().then(() => import('./gpu-hero.js'));     // or start the canvas engine here
```
- Gate heavy work on visibility too: IntersectionObserver with `rootMargin: '200px'`, and pause rAF and canvas work when off screen or when `document.hidden`.
- Canvas DPR ≤ 2 (≤ 1.75 for WebGL). Resize on `ResizeObserver`, debounced 100 ms.

## 3. INP rules
- Event handlers do < 50 ms of work, then yield. Split anything longer:
```js
const yieldNow = () => globalThis.scheduler?.yield ? scheduler.yield() : new Promise(r => setTimeout(r, 0));
btn.addEventListener('click', async () => { showPressedState(); await yieldNow(); await doHeavyThing(); });
```
- Give visual feedback in the same frame (class toggle), and defer analytics `track()` with `requestIdleCallback`.
- No layout reads after writes in loops (`getBoundingClientRect` inside a write loop thrashes). Batch reads, then writes, or cache rects on resize.
- `ScrollTrigger.refresh()` costs 20–80 ms on long pages. Never call it in an input handler. Debounce it.
- View transitions and quiz steps should keep their callback work under 50 ms. The animation itself is off the main thread.

## 4. CLS rules
- Every `img`, `video`, `canvas` and embed has `width`/`height` or `aspect-ratio`.
- Sticky bars, cookie notices and the chat launcher are `position:fixed` and animate with `transform`. Never insert them into the flow.
- Removing the intro overlay must not shift layout (it is fixed and out of flow).
- The text-size toggle is a user-initiated shift (excluded within 500 ms of input), so do not delay its effect.
- Late font swaps: covered by `size-adjust` fallbacks and `display=optional`.

## 5. Video and image rules (summary; details in `web-video-pipeline`)
- One video only (the intro plate). `preload="none"` in the HTML, with `src` set by JS after first paint. No video under the fold. Never autoplay anything with sound.
- Images: AVIF first, WebP fallback, `srcset` with 390/780/1200/1600 widths, `sizes` set correctly, and `loading="lazy"` + `decoding="async"` below the fold.
- Placeholders are CSS gradients (0 bytes), not blurred base64 images bigger than 1 KB.

## 6. Field measurement (web-vitals 6.2.3)
```html
<script type="module">
  import { onLCP, onINP, onCLS } from 'https://cdn.jsdelivr.net/npm/web-vitals@6.2.3/dist/web-vitals.attribution.js';
  const send = m => navigator.sendBeacon?.('/vitals', JSON.stringify({ n: m.name, v: Math.round(m.value * 1000) / 1000, r: m.rating,
    el: m.attribution?.target || m.attribution?.interactionTarget, view: location.hash.slice(1) || 'home' }));
  onLCP(send); onINP(send); onCLS(send);
</script>
```
Load it after `afterLCP()` in production. It is analytics, so the beacon endpoint must exist. In a preview artifact, log to the console instead. Never send health data.

## 7. Lab measurement (Playwright + PerformanceObserver)
```js
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const page = await ctx.newPage(); const cdp = await ctx.newCDPSession(page);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
await page.addInitScript(() => {
  window.__cwv = { lcp: 0, lcpEl: '', cls: 0, inp: 0, long: [] };
  new PerformanceObserver(l => { for (const e of l.getEntries()) { __cwv.lcp = e.startTime; __cwv.lcpEl = e.element ? e.element.tagName + '.' + e.element.className : e.url; } })
    .observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) __cwv.cls += e.value; })
    .observe({ type: 'layout-shift', buffered: true });
  new PerformanceObserver(l => { for (const e of l.getEntries()) if (e.interactionId) __cwv.inp = Math.max(__cwv.inp, e.duration); })
    .observe({ type: 'event', durationThreshold: 16, buffered: true });
  new PerformanceObserver(l => { for (const e of l.getEntries()) __cwv.long.push(Math.round(e.duration)); })
    .observe({ type: 'longtask', buffered: true });
});
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(3000);                                    // LCP finalises at first input, so read it BEFORE interacting
const lcp = await page.evaluate(() => ({ ...__cwv }));
for (const sel of ['.a11y-toggle', '.quiz-card input', 'nav a[href="#shop"]']) { await page.click(sel); await page.waitForTimeout(300); }
await page.mouse.wheel(0, 3000); await page.waitForTimeout(1500);
const after = await page.evaluate(() => ({ ...__cwv }));
const js = await page.evaluate(() => performance.getEntriesByType('resource').filter(r => r.initiatorType === 'script').reduce((n, r) => n + r.encodedBodySize, 0));
```
- For single-file artifacts, inline JS does not appear as a resource. Measure it with `gzip -9c dist/index.html | wc -c` and the per-script sizes of the extracted `<script>` blocks.
- Run three times and report the median. Report the LCP element name, because a wrong LCP element (intro text, poster) is the most common bug.
- The container uses software GL, so WebGL frame times and LCP with canvas are indicative only. Say so in the report.

## Verify / report format
`LCP 1.62 s (h1.hero-title) · INP 88 ms (button.a11y-toggle) · CLS 0.012 · JS 131 KB gz (vendor 55 + own 76) · long tasks max 41 ms · intro video 2.4 MB (not requested before canplay gate)`. Any number over budget is a FAIL with the fix you will apply. Do not ship over budget.
