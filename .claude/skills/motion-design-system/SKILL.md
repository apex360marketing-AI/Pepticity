---
name: motion-design-system
description: Give every APEX page and artifact one coherent motion language — duration, easing, distance and stagger tokens (`--apx-dur-*`, `--apx-ease-*`), spring curves via CSS linear(), matching GSAP eases, choreography rules (order, overlap, exits faster than entrances), a named "motion personality" per page, Lottie/Rive for 2D state animation, and WCAG 2.2 pause/motion controls. Use whenever you set timings or easings, choreograph a section, make motion feel "cheap" or "jittery" feel premium, or add a motion toggle.
---

# Motion design system

Award sites feel expensive because every movement obeys the same physics. Random `0.6s ease` values everywhere look like a template. Pick ONE personality per page, express it as tokens, and use only the tokens.

## 1. Tokens (add beside the `--apx-*` contract; scale by `--apx-motion`)
```css
:root{
  --apx-dur-1:120ms; --apx-dur-2:200ms; --apx-dur-3:320ms; --apx-dur-4:560ms; --apx-dur-5:900ms; --apx-dur-hero:1400ms;
  --apx-ease-out:cubic-bezier(.16,1,.3,1);      /* entrances: fast start, long silk settle */
  --apx-ease-in:cubic-bezier(.7,0,.84,0);       /* exits: gather, then leave */
  --apx-ease-inout:cubic-bezier(.65,0,.35,1);   /* things moving on screen */
  --apx-ease-spring:linear(0,0.079,0.241,0.435,0.624,0.787,0.914,1.002,1.056,1.082,1.088,1.081,1.066,1.049,1.033,1.018,1.007,1,0.995,0.993,0.992,0.993,0.994,0.996,0.997,0.998,0.999,1,1,1.001,1.001,1.001,1); /* spring({stiffness:220,damping:18}) → use with --apx-dur-spring */
  --apx-dur-spring:850ms;
  --apx-dist-1:8px; --apx-dist-2:24px; --apx-dist-3:64px;
  --apx-stagger:60ms;
}
.rise{transition-property:opacity,transform;
  transition-duration:calc(var(--apx-dur-4) * var(--apx-motion,1));
  transition-timing-function:var(--apx-ease-out)}
```
- Durations multiply by `--apx-motion` (0 = still), so the motion toggle and reduced motion work with no extra code.
- `linear()` (Baseline since Dec 2023: Chrome/Edge 113, Firefox 112, Safari 17.2) is how CSS gets real springs. Generate your own with the function below; never hand-type stops.
- Scrubbed scroll animations use `linear` timing (put the easing in the keyframes). See `css-scroll-driven-motion`.

## 2. Spring → `linear()` generator (tested)
```js
function spring({stiffness=180,damping=12,mass=1,samples=60}={}){
  let x=0,v=0,t=0;const dt=1/600,pts=[];let settle=0;
  while(t<4){const f=-stiffness*(x-1)-damping*v;v+=f/mass*dt;x+=v*dt;t+=dt;
    pts.push(x);if(Math.abs(x-1)<.001&&Math.abs(v)<.01){if(++settle>60)break;}else settle=0;}
  const out=[];for(let i=0;i<=samples;i++)out.push(+pts[Math.round(i/samples*(pts.length-1))].toFixed(3));
  out[0]=0;out[out.length-1]=1;return{easing:`linear(${out.join(',')})`,duration:Math.round(t*1000)};}
// spring({stiffness:220,damping:18}) → snappy, small overshoot · ({stiffness:90,damping:20}) → heavy, no overshoot
```

## 3. GSAP mirrors the CSS tokens (gsap@3.15.0, CustomEase is free)
```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/CustomEase.min.js"></script>
<script>gsap.registerPlugin(CustomEase);
CustomEase.create('apx-out','.16,1,.3,1'); CustomEase.create('apx-in','.7,0,.84,0'); CustomEase.create('apx-inout','.65,0,.35,1');
const D=k=>parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--apx-dur-'+k))/1000*(+getComputedStyle(document.documentElement).getPropertyValue('--apx-motion')||1);
gsap.defaults({ease:'apx-out',duration:D(4)});</script>
```
Never mix in GSAP's own named eases (`power2`, `back`) on a token-driven page.

## 4. Motion personalities (one per page; a column in the uniqueness matrix)
| Personality | Feel | Signature tokens |
|---|---|---|
| Silk | calm luxury, editorial | ease-out, dur-5, dist-2, stagger 80ms, no overshoot |
| Snap | crisp, confident, tech | spring (k 220, c 18), dur-3, dist-1, stagger 40ms |
| Weight | heavy, architectural, 3D | ease-inout, dur-hero, dist-3, slow scrub (`scrub: 1.5`) |
| Mechanical | precise, instrument-like | `steps()` and ease-in-out, dur-2, ticks and counters |
| Drift | dreamy, ambient | long linear loops, ±2–6px float, lerp 0.06 |
Options in one set must not share a personality.

## 5. Choreography rules
- **Order:** container → headline → supporting copy → media → CTA. The eye should land on the most important thing first.
- **Overlap:** start each next element when the previous one is 30–40% done. Never run them strictly one after another.
- **Stagger budget:** the whole group finishes within about 600ms (or 900ms for a hero). With 20 items, cap the stagger (`each: min(60, 600/n)`) or reveal in batches.
- **Exits are about 70% the length of entrances** and use ease-in. Hovers come in over dur-2 and go out over dur-3 (slower release feels premium).
- **One focal motion per viewport.** If the 3D hero is turning, the copy beside it holds still.
- **Distance means importance:** small UI moves dist-1, cards dist-2, hero layers dist-3. Never more than 64px of travel for something being revealed.
- **Feedback under 100ms:** press and focus states respond within dur-1 (NN/g's limit for feeling instant).
- **Follow-through:** a small settle (a spring or a 2% overshoot) on the one hero moment, not on everything.

## 6. Lottie and Rive (2D state animation only)
Use them for illustrated UI states, such as a check that draws itself, a toggle, an empty state or an animated diagram. **Never use them in place of the real-3D icons and hero objects that CLAUDE.md requires.**
- Rive (interactive state machines, small files): `@rive-app/canvas@2.44.0`. Drive inputs from pointer and scroll, and recolour through view-model or state inputs bound to tokens.
- dotLottie (linear clips): `@lottiefiles/dotlottie-web@0.80.0`. Prefer `.lottie` files over raw JSON.
- Pause both when off-screen (IntersectionObserver) and when the tab is hidden. With `--apx-motion: 0`, show the final frame.

## 7. Motion controls and accessibility (WCAG 2.2)
- 2.2.2 Pause, Stop, Hide (Level A): anything that moves on its own for more than 5 seconds next to other content needs a visible pause control. APEX standard: a small "Motion on/off" toggle that sets `html[data-motion="off"]` and `--apx-motion:0`, saved in localStorage inside try/catch.
- 2.3.3 Animation from Interactions: honour `prefers-reduced-motion: reduce` by setting `--apx-motion:0` for parallax, scrub travel and follow-motion. Keep opacity fades and colour/state feedback.
- Never flash more than 3 times per second (2.3.1).

## Do / don't
- DO define tokens once and reference them. Grep the page for `[0-9.]+m?s` inside transition and animation declarations; only token references should remain.
- DO animate transform, opacity, filter and clip-path only.
- DON'T use `ease` or `linear` for UI transitions, bounce on body copy, or the same fade-up on every element (the most common template smell).
- DON'T put `var()` inside the `animation` shorthand; use longhands.

## Verify (Playwright, `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`)
- `getComputedStyle(el).transitionDuration` for sample elements matches the tokens; with `--apx-motion:0` it reads `0s`.
- Run `document.getAnimations()` mid-reveal and check that every timing function is one of the token curves.
- With `reducedMotion: 'reduce'`, nothing translates (compare transforms before and after scrolling), and all content is visible.
- The motion toggle stops every rAF loop: count `requestAnimationFrame` calls over 1s and expect none, or only an idle check.
- Record a 6s video (`recordVideo`) of the hero and LOOK at it: the motion should read as one personality.
