---
name: "neon-glass-ui"
description: "Apply the Apex neon-glass treatment to any HTML page or artifact: transparent backdrop-blur panes, per-tile neon accents, a sequenced light sweep, a pointer-following torch, and pop-out illuminated hover."
---

# Neon glass UI

The house visual treatment for dashboards, trackers and tools. Dark-first, chartreuse-led, glass panes over a visible textured background, lit by a torch that follows the pointer.

## Non-negotiables

1. **Author with tokens, never literals.** Every colour is a custom property on `:root`, redefined under `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])`, and again under `:root[data-theme="dark"]`. A colour defined only inside a media or `[data-theme]` block never applies in the un-stamped default state.
2. **Never put a `var()` inside an `animation` shorthand.** It fails to parse in some engines and the animation silently never runs — the classic symptom is an effect that only appears when a hover rule forces it on. Use longhands: `animation-name`, `animation-duration`, `animation-timing-function`, `animation-delay`, `animation-iteration-count`, `animation-fill-mode: both`.
3. **Never let a hover rule fight a keyframe for the same property.** Animations outrank normal declarations, so `:hover { opacity: 1 }` against an opacity keyframe does nothing. Change a different property — `filter: brightness()` — instead.
4. **Check component class names against status class names.** A status word like `warn`, `ok` or `bad` used as a modifier will collide with a component named `.warn`, and whichever is declared later wins for every shared property. Name components `.notice`, `.alert`, `.panel` — never a bare status word.
5. **Any light that brightens the backdrop has a legibility ceiling.** The torch and the sweep both sit behind body text seen through glass. Tune them down until the text over them is comfortable, then stop — do not compensate by making panes more opaque.

## The palette

```css
:root{
  --brand:#E2FF1F;            /* chartreuse neon yellow */
  --brand-ink:#586B00;        /* the brand, legible on a pale ground */
  --neon-mix:35%;             /* how much raw neon a label may carry */
  --glass-1:rgba(255,255,255,.30);  --glass-2:rgba(255,255,255,.12);
  --tile-1:rgba(255,255,255,.13);   --tile-2:rgba(255,255,255,.04);
  --glass-rim:rgba(255,255,255,.72);
  --glass-edge:rgba(255,255,255,.90);
}
/* dark */
--brand-ink:#E2FF1F; --neon-mix:100%;
--glass-1:rgba(255,255,255,.045); --glass-2:rgba(255,255,255,.012);
--tile-1:rgba(255,255,255,.016);  --tile-2:rgba(255,255,255,.004);
--glass-rim:rgba(255,255,255,.15); --glass-edge:rgba(255,255,255,.17);
```

Two fill weights on purpose: `--glass-*` for chrome that must stay readable at a glance (masthead, modal), `--tile-*` for content panes where the background should read through.

Per-tile accents, assigned by `:nth-child` as `--neon`:
`#EAFF00` `#FF0A54` `#FFAE00` `#00FFC2` `#FF6A00` `#00E5FF`

**A neon at full strength is illegible on a pale ground.** Mix it toward the ink colour by `--neon-mix` for text; only the dark theme gets the raw value.

## Glass panes

```css
.pane{
  background:linear-gradient(145deg, var(--tile-1), var(--tile-2));
  backdrop-filter:blur(9px) saturate(195%);
  border:1px solid var(--glass-rim);
  box-shadow:0 10px 34px -16px var(--glass-drop),
             inset 0 1px 0 var(--glass-edge);
}
```

Keep the blur at **8–14px**. Blur is the lever that decides whether the background reads as a *pattern* or as fog — past ~20px the page stops looking like glass over something and looks like frosted plastic. If text needs more contrast, thin the *fill*; never raise the blur to get it.

Always ship the fallback — a transparent pane with no blur behind it is unreadable:

```css
@supports not (backdrop-filter: blur(4px)){
  .pane{background:var(--surface)}
}
@media print{ .pane{backdrop-filter:none; background:#fff} }
```

## The light sweep

A blurred, skewed band in the pane's own `--neon`, crossing left to right. **One pane at a time**, on a fixed interval, in a scattered order (for a 3×2 band, 1-3-5-2-4-6 reads better than left-to-right). Hovering a pane fires it immediately.

Drive it from JS, not from six overlapping infinite CSS loops — a sequencer is the only way to guarantee one-at-a-time and to let hover interrupt.

```css
.pane .sweep{
  position:absolute; top:-35%; bottom:-35%; left:-55%; width:36%;
  pointer-events:none; z-index:0; opacity:0;
  transform:skewX(-14deg); filter:blur(11px);
  background:linear-gradient(100deg, transparent 0%,
    color-mix(in srgb,var(--neon) 30%,transparent) 42%,
    color-mix(in srgb,var(--neon) 72%,transparent) 50%,
    color-mix(in srgb,var(--neon) 30%,transparent) 58%, transparent 100%);
}
.pane.sweeping .sweep{
  animation-name:sweep; animation-duration:1.9s;
  animation-timing-function:cubic-bezier(.4,.02,.3,1);
  animation-iteration-count:1; animation-fill-mode:both;
}
@keyframes sweep{
  0%{left:-55%; opacity:0} 9%{opacity:.95}
  82%{opacity:.95} 100%{left:120%; opacity:0}
}
.pane:hover .sweep{filter:blur(7px) brightness(1.45) saturate(1.2)}
```

```js
var ORDER=[0,2,4,1,3,5], STEP=5000, i=0, timer=null, held=false, last=null;
function fire(t){
  t.classList.remove("sweeping");
  void t.offsetWidth;            /* forces a reflow so the run restarts */
  t.classList.add("sweeping");
}
```

**The reflow is not optional.** Remove-then-add in the same frame gets coalesced and the animation never replays. Clear `.sweeping` on `animationend`, pause the interval while the pointer is inside the band (`held`) so a scheduled sweep never fires a half-second after a manual one, and stop it on `visibilitychange`.

Give pane content `position:relative; z-index:1` so it sits above the band. Halve the band's strength on a light ground — a bright sweep over a pale pane reads as a wash, not a highlight.

## The torch

An oblong of light that follows the pointer, igniting the background pattern where it falls and leaving the rest of the ground dark.

The layer is **a second copy of the background pattern in the brand colour, masked to an ellipse** — not a white glow. That is what makes the pattern light up rather than the page brighten.

It sits at `z-index:0`, **below every pane**. Because the panes are real glass, each one samples it through its own `backdrop-filter`, so the light carries under and through the cards instead of stopping at their edges. This only works if the panes are genuinely translucent.

```css
#torch{
  position:fixed; inset:0; z-index:0; pointer-events:none;
  opacity:0; transition:opacity .55s var(--ease);
  background-image:url("data:image/svg+xml;utf8,<svg …stroke='%23E2FF1F'…>");
  background-size:150px 450px; background-position:center top;
  filter:blur(2px);                       /* filament, not hard lines */
  -webkit-mask-image:radial-gradient(ellipse closest-side,#000 0%,rgba(0,0,0,.62) 44%,transparent 100%);
          mask-image:radial-gradient(ellipse closest-side,#000 0%,rgba(0,0,0,.62) 44%,transparent 100%);
  -webkit-mask-size:68vw 40vw;  mask-size:68vw 40vw;
  -webkit-mask-repeat:no-repeat; mask-repeat:no-repeat;
  -webkit-mask-position:calc(var(--px,50vw) - 34vw) calc(var(--py,40vh) - 20vw);
          mask-position:calc(var(--px,50vw) - 34vw) calc(var(--py,40vh) - 20vw);
}
#torch::before{ /* warm bloom under the lit pattern */
  content:""; position:absolute; inset:0;
  background-image:radial-gradient(ellipse closest-side,
    color-mix(in srgb,var(--brand) 9%,transparent) 0%,
    color-mix(in srgb,var(--brand) 3%,transparent) 48%, transparent 100%);
  background-size:76vw 46vw; background-repeat:no-repeat;
  background-position:calc(var(--px,50vw) - 38vw) calc(var(--py,40vh) - 23vw);
}
#torch.lit{opacity:.5}
#torch.over-card{opacity:.22}   /* let the pane's own sweep lead */
```

Masks are Baseline since Dec 2023 but **ship both the prefixed and unprefixed properties**, and gate the whole layer — without mask support an unmasked bright pattern covers the entire page:

```css
@supports not ((mask-image:radial-gradient(#000,transparent)) or (-webkit-mask-image:radial-gradient(#000,transparent))){
  #torch{display:none}
}
@media (hover:none){ #torch{display:none} }
```

Track the pointer with a `passive` listener, coalesce to one paint per frame with `requestAnimationFrame`, and clear `.lit` on `pointerleave` and window `blur`. Prefer `mask-position` longhands over rebuilding the gradient each frame. Skip the whole feature under `prefers-reduced-motion` and on touch — there is no pointer to follow.

## Pop-out hover

Lift toward the reader, scale slightly, deepen the shadow, add a coloured rim and wash the surface with light:

```css
.pane::before{ /* the illumination */
  content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none;
  background:radial-gradient(125% 95% at 50% -18%,
    color-mix(in srgb,var(--neon) 26%,transparent) 0%, transparent 64%);
  opacity:0; transition:opacity .36s var(--ease);
}
.pane:hover::before{opacity:1}
.pane:hover{
  transform:translateY(-8px) scale(1.02);
  box-shadow:0 32px 56px -26px var(--glass-drop),
             0 0 0 1px color-mix(in srgb,var(--neon) 40%,transparent),
             0 20px 52px -26px var(--neon),
             inset 0 1px 0 var(--glass-edge);
}
.pane:hover .title{text-shadow:0 0 20px color-mix(in srgb,var(--neon) 65%,transparent)}
.pane:hover .caption{color:color-mix(in srgb,var(--neon) 20%,var(--ink))}
```

Every caption and label inside the pane should light up with it — a hover that brightens the border but leaves the text grey looks half-finished. Keep the hovered state on the *same* glass tokens; a hover that turns a pane opaque breaks the material.

## Form fields

Fields glow on hover and **stay lit the whole time they are in use**, and their label lights with them:

```css
input:focus,textarea:focus,select:focus{
  outline:none; border-color:var(--brand);
  background:color-mix(in srgb,var(--brand) 7%,var(--surface));
  box-shadow:0 0 0 3px color-mix(in srgb,var(--brand) 32%,transparent),
             0 0 24px -4px var(--brand);
}
.field:focus-within > label{color:var(--brand-ink)}
```

## Grids

`1fr` carries an implicit min-content floor, so the widest chip in a column stretches that column and the grid goes uneven. Use `repeat(N, minmax(0,1fr))` and give grid items `min-width:0`. For a fixed band of tiles add `grid-auto-rows:1fr` so rows match even when one tile carries an extra element.

Chips inside small cells get `display:block; width:100%; text-align:center` so every one is the same width whatever the word. Below 640px a word will not fit a ~43px cell — collapse chips to solid colour bars (`font-size:0; height:5px`) and let a legend carry the meaning.

## Motion and touch

```css
@media (prefers-reduced-motion:reduce){
  *{transition:none!important}
  .pane:hover{transform:none}
  .pane .sweep,.pane.sweeping .sweep{animation:none; left:32%; opacity:.5; filter:blur(16px)}
  #torch{display:none}
}
@media (hover:none){ .pane:hover{transform:none; box-shadow:var(--sh)} }
```

Under reduced motion, hold the light still rather than removing it — the design should degrade, not disappear.

## Verify before shipping

Render the page in a headless browser at 1180px and 390px, in both colour schemes, and check:

- the sweep fires **with nothing hovered**, one pane at a time. Log class mutations with a `MutationObserver` and assert the order and the interval — do not eyeball it
- hovering a pane fires that pane within ~100ms
- the torch sets `--px`/`--py`, sits at `z-index:0`, and dims over a pane
- grid items report identical widths and heights
- no `pageerror` events
- scan the stylesheet for any colour declared only inside a media or `[data-theme]` block