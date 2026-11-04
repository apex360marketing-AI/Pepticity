---
name: premium-micro-interactions
description: Add premium hover, cursor and pointer interactions — magnetic buttons, custom cursor followers, elastic/spring hover, 3D tilt, text scramble/glitch, sheen sweeps, coin flips, magnifying docks and optional (off-by-default) UI sound. Use whenever buttons, cards, icons or the cursor should feel tactile and expensive.
---

# Premium micro-interactions

Micro-interactions are what people screen-record and share. Pick 2–4 per page, each with a distinct personality, and keep them consistent within the page.

## Rules
- Pointer effects only on `(hover: hover) and (pointer: fine)`. Touch gets tap feedback (scale .97) instead.
- Use one shared rAF loop and lerped values (`v += (target - v) * 0.15`). Never write styles directly in `pointermove`.
- Transform and opacity only. Add `will-change: transform` on hover start and remove it on end.
- Respect `prefers-reduced-motion`: no follow-motion, keep instant colour/state feedback.
- Keyboard parity: every hover state also triggers on `:focus-visible`.
- Custom cursors never hide the native cursor over inputs or text you can select, and are skipped on touch.
- Colours from page tokens; never gold, yellow or lime.

## Snippets (vanilla, inline-safe)
**Shared loop + lerp**
```js
const fine = matchMedia('(hover:hover) and (pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
const jobs = new Set(); (function loop(){ jobs.forEach(f => f()); requestAnimationFrame(loop); })();
const lerp = (a, b, k) => a + (b - a) * k;
```
**Magnetic button** (pulls toward the pointer, springs back)
```js
document.querySelectorAll('[data-magnetic]').forEach(el => { if (!fine) return;
  let x = 0, y = 0, tx = 0, ty = 0; const inner = el.querySelector('span') || el;
  el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect();
    tx = (e.clientX - r.left - r.width / 2) * .35; ty = (e.clientY - r.top - r.height / 2) * .45; });
  el.addEventListener('pointerleave', () => { tx = ty = 0; });
  jobs.add(() => { x = lerp(x, tx, .18); y = lerp(y, ty, .18);
    el.style.transform = `translate(${x}px,${y}px)`; inner.style.transform = `translate(${x * .4}px,${y * .4}px)`; });
});
```
**Cursor follower** (dot + lagging ring; grows over `[data-cursor="view"]`)
```css
.cur-dot,.cur-ring{position:fixed;left:0;top:0;pointer-events:none;z-index:9999;border-radius:50%;translate:-50% -50%}
.cur-dot{width:6px;height:6px;background:#e9eefb}
.cur-ring{width:38px;height:38px;border:1px solid rgba(233,238,251,.5);transition:width .3s,height .3s,background .3s}
.cur-ring.big{width:88px;height:88px;background:rgba(59,107,255,.12);backdrop-filter:blur(4px)}
@media (hover:none){.cur-dot,.cur-ring{display:none}}
```
```js
if (fine) { const d = document.createElement('i'), r = document.createElement('i'); d.className = 'cur-dot'; r.className = 'cur-ring'; document.body.append(d, r);
  let mx = 0, my = 0, rx = 0, ry = 0; addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  jobs.add(() => { rx = lerp(rx, mx, .16); ry = lerp(ry, my, .16); d.style.transform = `translate(${mx}px,${my}px)`; r.style.transform = `translate(${rx}px,${ry}px)`; });
  document.addEventListener('pointerover', e => r.classList.toggle('big', !!e.target.closest('[data-cursor="view"],a,button'))); }
```
Variants: crosshair with live coordinates; `mix-blend-mode: difference` white circle; particle/star trail (pool of 20 dots, each lerping to the previous); torch (radial-gradient mask following the pointer behind glass).

**3D tilt with glare**
```js
document.querySelectorAll('[data-tilt]').forEach(el => { if (!fine) return; let rx = 0, ry = 0, tx = 0, ty = 0;
  el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    ty = (px - .5) * 14; tx = (.5 - py) * 12; el.style.setProperty('--gx', px * 100 + '%'); el.style.setProperty('--gy', py * 100 + '%'); });
  el.addEventListener('pointerleave', () => { tx = ty = 0; });
  jobs.add(() => { rx = lerp(rx, tx, .12); ry = lerp(ry, ty, .12); el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`; }); });
```
```css
[data-tilt]{transform-style:preserve-3d;position:relative}
[data-tilt]::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;
  background:radial-gradient(circle at var(--gx,50%) var(--gy,50%),rgba(255,255,255,.18),transparent 45%);opacity:0;transition:opacity .3s}
[data-tilt]:hover::after{opacity:1}
```
**Text scramble** (on hover or reveal)
```js
function scramble(el) { const final = el.dataset.text || (el.dataset.text = el.textContent), chars = '!<>-_\\/[]{}=+*^?#ABCDEFX01';
  let f = 0; const total = final.length * 3; cancelAnimationFrame(el._s);
  (function step(){ el.textContent = [...final].map((c, i) => i < f / 3 ? c : c === ' ' ? ' ' : chars[(Math.random() * chars.length) | 0]).join('');
    if (f++ < total) el._s = requestAnimationFrame(step); else el.textContent = final; })(); }
document.querySelectorAll('[data-scramble]').forEach(el => el.addEventListener('pointerenter', () => scramble(el)));
```
Set `aria-label` to the final text on the element so screen readers don't hear noise.

**Other signature hovers**
- **Border-trace:** a conic-gradient border animated with `@property --a` rotating 0→360deg on hover.
- **Sheen sweep:** a skewed gradient band, `translateX(-120% → 120%)` on hover.
- **Gooey button:** an SVG `feGaussianBlur` + `feColorMatrix` filter on a wrapper, with child blobs moving on hover.
- **Coin flip:** `transform-style: preserve-3d`, front/back with `backface-visibility: hidden`, `rotateY(180deg)` on hover or focus.
- **Magnify dock:** compute scale for each item from its distance to the pointer (`1 + .6 * max(0, 1 - d/120)`).
- **Elastic press:** `:active { transform: scale(.96) }` plus `transition: transform .5s cubic-bezier(.34,1.56,.64,1)` for the spring-back.

**Sound (opt-in only)**
Muted by default with a visible toggle (aria-pressed). Use the WebAudio API to synthesize a short tick (an 8ms oscillator at 1.8kHz, gain .03). Never autoplay; the first sound only plays after the user enables it.

## Verify (Playwright, /opt/pw-browsers/chromium-1194/chrome-linux/chrome)
- Hover a magnetic button off-centre, wait 300ms, and confirm `style.transform` is non-zero; leave, and it returns to roughly 0.
- The cursor ring's transform follows `mouse.move`.
- The tilt card's transform has rotateX/Y ≠ 0 while hovered.
- Scramble ends on the exact original text.
- `hasTouch:true, isMobile:true` context: no custom cursor elements visible, and buttons still work.
- `reducedMotion:'reduce'`: no follow transforms.
- Tab through the page: focus states are visible on every interactive element.
