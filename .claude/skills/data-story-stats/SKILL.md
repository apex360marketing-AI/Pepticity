---
name: data-story-stats
description: Build APEX's animated local-stats pages and industry detail views (roadmap item 5) — a short data story (hook number, context, seasonal curve, what it means, CTA), sourced data files, count-up numbers, self-drawing lines, growing bars, a pinned scrollytelling chart that redraws per step, accessible table fallbacks and zero invented numbers. Use whenever a page shows lead values, peak months, local demand, market size, "moving graphs", counters or stats for an industry or city. Pair with the `dataviz` skill for chart form and colour.
---

# Data story stats

The owner wants industry detail views (for example, clicking Plumbing) to show lead value and "fun, animated local stats with moving graphs": richer, but never overwhelming. `dataviz` decides chart form, marks and palette. This skill decides story, motion and data honesty.

## 1. Data honesty (hard rules)
- Every number comes from a data file, never typed into markup by hand: `design/data/<industry>[-<city>].json`.
```json
{ "industry": "Roofing", "city": "Vancouver, BC",
  "stats": [{ "id": "leadValue", "label": "Typical lead value", "min": 180, "max": 420, "unit": "USD", "kind": "range",
              "source": "[Source name]", "url": "[link]", "date": "2026-09", "estimate": true }],
  "seasonal": { "label": "Search interest by month", "values": [/* 12 numbers */], "source": "…", "date": "…" } }
```
- A stat without `source` and `date` does not render; the page shows `[Stat — source needed]` in its place and the build logs it.
- Estimates carry a visible "Estimate" tag. Ranges are better than false precision. Round sensibly.
- No invented comparisons ("3× more than average") unless both numbers are sourced.
- Every stat has a tap/hover "Source" disclosure with the source name, date and link.

## 2. Story structure (3–5 beats, never a dashboard dump)
1. **Hook:** the single most useful number for the owner (for example, the typical lead value range), large, counting up.
2. **Context:** what the number means locally (the city and the service area).
3. **Time:** the seasonal curve, with the peak months highlighted ("Busiest: [months]").
4. **So what:** one plain-English line on what this means for the owner's business.
5. **CTA:** "See leads in [City]" (`conversion-ux`).
One idea per beat, one chart per beat, and a caption that tells the reader where to look.

## 3. Motion patterns (use the `motion-design-system` tokens)
**Count-up** (final value is already in the HTML, so search engines, reduced motion and no-JS all show it):
```html
<span class="num" data-to="420" data-prefix="$" style="font-variant-numeric:tabular-nums">$420</span>
```
```js
const fmt = new Intl.NumberFormat(navigator.language, { maximumFractionDigits: 0 });
const io = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; io.unobserve(e.target);
  const el = e.target, to = +el.dataset.to, pre = el.dataset.prefix || '', t0 = performance.now(), d = 1400;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  el.setAttribute('aria-label', pre + fmt.format(to));
  (function f(now) { const p = Math.min(1, (now - t0) / d), k = 1 - Math.pow(1 - p, 4);
    el.textContent = pre + fmt.format(Math.round(to * k)); if (p < 1) requestAnimationFrame(f); })(t0); }), { threshold: .6 });
document.querySelectorAll('.num[data-to]').forEach(n => io.observe(n));
```
Reserve the width (`tabular-nums` + `min-width` in `ch`) so counting causes no layout shift.

**Self-drawing line** (SVG, scroll-linked, no JS):
```css
.trend path{stroke-dasharray:1;stroke-dashoffset:0}          /* path has pathLength="1" */
@media (prefers-reduced-motion:no-preference){@supports (animation-timeline:view()){
  .trend path{animation-name:draw;animation-timing-function:linear;animation-fill-mode:both;animation-timeline:view();animation-range:entry 20% cover 50%}}}
@keyframes draw{from{stroke-dashoffset:1}}
```
- **Bars grow** from their baseline: `transform-origin:bottom; scale: 1 0 → 1 1`, staggered by `--apx-stagger`.
- **Pinned scrollytelling** (the Pudding pattern, desktop only): the chart is sticky and the text steps scroll past. Each step sets `chart.dataset.step` and the chart morphs (highlight the peak months, then annotate, then zoom). Under 900px it becomes a static chart per step.
- **Glow accents:** neon chartreuse `#d4ff3a` is allowed for tracker lines, the current-month marker and dollar values (CLAUDE.md), sparingly, on charcoal. The rest stays neutral or uses the page accent.

## 4. Accessibility
- Every chart is an `<svg role="img">` with an `aria-label` summary ("Busiest months: May to August"), plus a visually hidden `<table>` holding the same data.
- Never colour alone: label the peak months directly on the chart.
- Text in charts ≥ 12px at 390px. Axis labels can be dropped on mobile if values are labelled directly.

## 5. Generator use
Stats sections are artifact modules (`LAY-`/`SCR-` codes) that take the data file and tokens. The same module must look different per site (palette, type and chart archetype rotate) while the data rules stay fixed.

## Do / don't
- DO show at most 3 headline numbers per view. More information goes behind "See all local stats".
- DO put the source within one tap of every number.
- DON'T loop animations on numbers, count up again on every scroll, or animate the axes.
- DON'T use 3D pie charts, dual axes or gauges that imply precision you don't have.

## Verify (Playwright, `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`)
- Fetch the raw HTML: every final number is present before scripts run.
- After scrolling through, each `.num` text equals its formatted `data-to`, and each rendered number matches the data file (script compare).
- No stat renders without a source; grep for `[Stat — source needed]` and list them to the owner.
- CLS ≤ 0.1 during the count-up (PerformanceObserver `layout-shift`).
- With `reducedMotion:'reduce'`, the final values and full lines show at load.
- Screenshot each beat at desktop and 390px and LOOK at them: readable, uncluttered, peak months obvious.
