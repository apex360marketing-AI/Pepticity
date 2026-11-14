#!/usr/bin/env python3
"""GUIDE worker: module 40-guide only (its css, its markup, its js).

Usage: python3 -I apply.py IN.html OUT.html

- The bar is at least 1.5 times its old size (desktop 72 x 300, icon 42 wide; phone 46 x 270, icon 41 wide) and keeps that
  size when the window is out.
- The gap in the beacon's centrepiece is lit in the ONE logo blue with its hot core, breathing slowly (still with reduced motion).
- The window slides out to the LEFT only, exactly the bar's height, top aligned with the bar. 0% fill: clear glass with blur,
  a rim light and text shadow. Headings and labels in platinum chrome with the blue light and a slow sheen; no flat white.
- A sku listed in PEP_CONFIG.flagged gets a HIDE BEFORE LAUNCH tag next to its name in guide answers.

Places are found by anchors (data-pep-src blocks, the module comment, unique strings), never by line numbers. A missing
anchor stops the run with an error. Running it twice gives the same result.
"""
import re
import sys

CSS_OPEN = '<style data-pep-src="modules/40-guide/guide.css">'
JS_OPEN = '<script data-pep-src="modules/40-guide/guide.js">'
MODULE = '<!-- module:40-guide -->'
CSS_START = '/* ===== NOV13-GUIDE'
CSS_END = '/* ===== /NOV13-GUIDE ===== */'

CSS_BLOCK = r'''/* ===== NOV13-GUIDE (owner, Nov 13, asked many times). 1. The bar at least 1.5 times its size, and it keeps that size when
   the window is out (it no longer stands up taller). 2. The gap in the centrepiece lit in the ONE logo blue with its hot core,
   breathing slowly. 3. The window slides out to the LEFT only, exactly the bar's height, top aligned with it. 4. The window is
   clear glass, 0% fill: blur, a rim light and text shadow keep the words readable, never a tint. Rules update (Nov 13):
   headings and labels in platinum chrome with the blue light shining through and a slow sheen (they never move), no flat
   white, no violet, one blue. Tokens only, no raw hex. ===== */
[data-module="guide"] {
  --pep-guide-bw: 72px;                                  /* the bar's tap width (was 46) */
  --pep-guide-iw: 42px;                                  /* the beacon picture's width (was 27) */
  --pep-guide-icx: 50%;                                  /* where the beacon's centre line sits in the bar */
  --pep-guide-rest: min(300px, calc(100% - 96px));      /* the bar's height (was 172), at rest AND with the window out */
  --pep-guide-tall: var(--pep-guide-rest);               /* the old "stand up" height now equals the rest height */
  --pep-guide-gapx: 6px;                                 /* air between the window and the bar */
  --pep-guide-c1: 40px;                                  /* the window's cuts: top left */
  --pep-guide-c2: 30px;                                  /* top right, beside the bar's tip */
  --pep-guide-c3: 30px;                                  /* bottom left */
  /* the module's old violet tokens point at the ONE blue and its hot core (no second blue anywhere in the guide) */
  --pep-uv-light-1: rgb(var(--pep-light-rgb));
  --pep-uv-light-2: rgba(var(--pep-light-rgb), .72);
  --pep-uv-light-3: rgba(var(--pep-light-rgb), .9);
  --pep-uv-light-4: var(--pep-beam);
  --pep-guide-blue: rgb(var(--pep-light-rgb));
  /* THE CHROME (the wordmark's look): platinum, with the logo's blue light shining through its waist */
  --pep-guide-chrome: linear-gradient(180deg, var(--pep-plat-4) 0%, var(--pep-plat-3) 26%, var(--pep-plat-2) 43%, var(--pep-guide-blue) 49%, var(--pep-beam) 53%, var(--pep-plat-3) 61%, var(--pep-plat-4) 79%, var(--pep-plat-3) 100%);
  --pep-guide-chrome-hot: linear-gradient(180deg, var(--pep-plat-5) 0%, var(--pep-plat-4) 30%, var(--pep-plat-3) 43%, var(--pep-guide-blue) 49%, var(--pep-beam) 53%, var(--pep-plat-4) 63%, var(--pep-plat-5) 82%, var(--pep-plat-4) 100%);
  /* THE SHEEN: one band of light gliding across the chrome face, left to right */
  --pep-guide-sheen: linear-gradient(100deg, transparent 38%, rgba(var(--pep-light-rgb), .55) 46%, var(--pep-beam) 50%, rgba(var(--pep-light-rgb), .55) 54%, transparent 62%);
  /* the same two for the words that run up the side of the bar (their letters lie on their side) */
  --pep-guide-chrome-v: linear-gradient(270deg, var(--pep-plat-4) 0%, var(--pep-plat-3) 26%, var(--pep-plat-2) 43%, var(--pep-guide-blue) 49%, var(--pep-beam) 53%, var(--pep-plat-3) 61%, var(--pep-plat-4) 79%, var(--pep-plat-3) 100%);
  --pep-guide-sheen-v: linear-gradient(190deg, transparent 38%, rgba(var(--pep-light-rgb), .55) 46%, var(--pep-beam) 50%, rgba(var(--pep-light-rgb), .55) 54%, transparent 62%);
  /* the shadow that keeps plain words readable on clear glass */
  --pep-guide-ink: 0 1px 2px color-mix(in srgb, var(--pep-black-0) 92%, transparent), 0 0 12px color-mix(in srgb, var(--pep-black-0) 74%, transparent);
  --pep-guide-lift: drop-shadow(0 1px 1px color-mix(in srgb, var(--pep-black-0) 92%, transparent)) drop-shadow(0 0 6px color-mix(in srgb, var(--pep-black-0) 70%, transparent));
}
/* behind the open window: still one tap outside closes it, but the page is not dimmed (nothing tints the view) */
.pep-guide-scrim { background: transparent; }

/* ---------- THE BAR: bigger, and the same size with the window out ---------- */
.pep-guide-launch,
[data-module="guide"][data-open] .pep-guide-launch { width: var(--pep-guide-bw); height: var(--pep-guide-rest); }
/* the words beside the bar fade with the window out, and never take a click meant for the window */
[data-module="guide"][data-open] .pep-guide-launch-label { pointer-events: none; }
/* with the window out the bar holds still, so the window stays exactly beside it */
[data-module="guide"][data-open] .pep-guide-launch,
[data-module="guide"][data-open] .pep-guide-launch:hover,
[data-module="guide"][data-open] .pep-guide-launch:focus-visible { transform: none; }
/* the beacon picture, 1.5 times wider; shown in platinum only (its own tips and foot carried warm and lilac casts) */
.pep-guide-icon {
  left: calc(var(--pep-guide-icx) - var(--pep-guide-iw) / 2);
  width: var(--pep-guide-iw);
  margin-left: 0;
  border-width: calc(var(--pep-guide-iw) * 80 / 108) 0 calc(var(--pep-guide-iw) * 94 / 108);
  filter: grayscale(1) contrast(1.06);
  animation-name: none;
}
/* THE GAP LIGHT: the slot where the two halves of the centrepiece meet, lit in the logo blue with its hot core down the middle.
   Measured on the picture (108 wide): the slot runs from x 31 to 76, the light tube from x 47 to 59, rows 58 to 643 of 728. */
.pep-guide-gap {
  position: absolute;
  top: calc(var(--pep-guide-iw) * 58 / 108);
  bottom: calc(var(--pep-guide-iw) * 85 / 108);
  left: calc(var(--pep-guide-icx) - var(--pep-guide-iw) * .22);
  width: calc(var(--pep-guide-iw) * .44);
  pointer-events: none;
  opacity: 1;
  filter: drop-shadow(0 0 3px rgba(var(--pep-light-rgb), .95)) drop-shadow(0 0 11px rgba(var(--pep-light-rgb), .65));
  animation-name: pep-guide-gap;
  animation-duration: 4.2s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}
/* the slot itself fills with the blue, strongest down the middle, tapering out at both ends */
.pep-guide-gap::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(var(--pep-light-rgb), .4) 0%, rgba(var(--pep-light-rgb), .88) 30%, rgb(var(--pep-light-rgb)) 50%, rgba(var(--pep-light-rgb), .88) 70%, rgba(var(--pep-light-rgb), .4) 100%);
  -webkit-mask-image: linear-gradient(180deg, transparent 0, var(--pep-black-0) 7%, var(--pep-black-0) 93%, transparent 100%);
          mask-image: linear-gradient(180deg, transparent 0, var(--pep-black-0) 7%, var(--pep-black-0) 93%, transparent 100%);
}
/* the hot core: a thin blade over the tube, pointed at both ends like the light through the P */
.pep-guide-gap::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: calc(var(--pep-guide-iw) * .15);
  margin-left: calc(var(--pep-guide-iw) * -.075);
  background: linear-gradient(90deg, rgb(var(--pep-light-rgb)) 0%, var(--pep-beam) 40%, var(--pep-beam) 60%, rgb(var(--pep-light-rgb)) 100%);
  clip-path: polygon(50% 0, 100% 9px, 100% calc(100% - 9px), 50% 100%, 0 calc(100% - 9px), 0 9px);
}
/* the light pools in the logo blue under the beacon's foot */
.pep-guide-launch::after {
  content: "";
  position: absolute;
  left: calc(var(--pep-guide-icx) - var(--pep-guide-iw) * .62);
  width: calc(var(--pep-guide-iw) * 1.24);
  bottom: calc(var(--pep-guide-iw) * -.1);
  height: calc(var(--pep-guide-iw) * .36);
  pointer-events: none;
  background: radial-gradient(50% 50% at 50% 50%, rgba(var(--pep-light-rgb), .8), rgba(var(--pep-light-rgb), .28) 55%, rgba(var(--pep-light-rgb), 0) 100%);
  animation-name: pep-guide-pool;
  animation-duration: 4.2s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}
/* breathing: slow, never a flash */
@keyframes pep-guide-gap {
  from { opacity: .72; filter: drop-shadow(0 0 2px rgba(var(--pep-light-rgb), .85)) drop-shadow(0 0 7px rgba(var(--pep-light-rgb), .45)); }
  to { opacity: 1; filter: drop-shadow(0 0 4px rgba(var(--pep-light-rgb), 1)) drop-shadow(0 0 16px rgba(var(--pep-light-rgb), .8)); }
}
@keyframes pep-guide-pool { from { opacity: .55; } to { opacity: 1; } }
/* ASK THE GUIDE: chrome with the blue light, running up beside the beacon, with the slow sheen (the words never move) */
.pep-guide-launch-label {
  right: calc(100% - var(--pep-guide-icx) + var(--pep-guide-iw) / 2 + 8px);
  bottom: calc(var(--pep-guide-iw) * .86);
  font-size: 16px;
  letter-spacing: .26em;
  color: var(--pep-plat-3);
  background-image: var(--pep-guide-sheen-v), var(--pep-guide-chrome-v);
  background-size: 100% 260%, 100% 100%;
  background-repeat: no-repeat;
  background-position: 0 100%, 0 0;
  -webkit-background-clip: text;
          background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: var(--pep-guide-lift);
  animation-name: pep-guide-shine-v;
  animation-duration: 7s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}
@keyframes pep-guide-shine-v { 0% { background-position: 0 100%, 0 0; } 40%, 100% { background-position: 0 0%, 0 0; } }

/* ---------- THE WINDOW: out of the bar to the LEFT only, the bar's own height, its top level with the bar's top ---------- */
.pep-guide-panel {
  right: calc(var(--pep-guide-edge) + var(--pep-guide-bw) + var(--pep-guide-gapx));
  bottom: var(--pep-guide-foot);
  width: min(560px, calc(100% - var(--pep-guide-edge) - var(--pep-guide-bw) - var(--pep-guide-gapx) - 16px));
  height: var(--pep-guide-rest);
  color: var(--pep-plat-4);
  /* 0% fill: clear glass. The blur keeps the words readable; nothing tints what is behind. */
  background: transparent;
  -webkit-backdrop-filter: blur(16px) saturate(150%);
          backdrop-filter: blur(16px) saturate(150%);
  box-shadow: none;
  text-shadow: var(--pep-guide-ink);
  /* closed: folded flat against the bar. Open: the same seven corners spread out to the left. Only x moves: no vertical opening. */
  clip-path: polygon(100% 0, 100% 0, 100% var(--pep-guide-c2), 100% 100%, 100% 100%, 100% calc(100% - var(--pep-guide-c3)), 100% var(--pep-guide-c1));
  transform: translateX(var(--pep-guide-gapx));
  transition: clip-path .6s var(--pep-ease), opacity .25s ease, transform .6s var(--pep-ease);
}
[data-module="guide"][data-open] .pep-guide-panel {
  clip-path: polygon(var(--pep-guide-c1) 0, calc(100% - var(--pep-guide-c2)) 0, 100% var(--pep-guide-c2), 100% 100%, var(--pep-guide-c3) 100%, 0 calc(100% - var(--pep-guide-c3)), 0 var(--pep-guide-c1));
  transform: translateX(0);
}
/* THE RIM LIGHT: a chrome hairline along every cut, running into the logo blue on the bar's side */
.pep-guide-panel::before {
  background: linear-gradient(165deg, var(--pep-plat-4) 0%, var(--pep-plat-2) 24%, var(--pep-plat-3) 48%, var(--pep-plat-2) 70%, var(--pep-guide-blue) 100%);
  clip-path: polygon(evenodd,
    var(--pep-guide-c1) 0, calc(100% - var(--pep-guide-c2)) 0, 100% var(--pep-guide-c2), 100% 100%, var(--pep-guide-c3) 100%, 0 calc(100% - var(--pep-guide-c3)), 0 var(--pep-guide-c1), var(--pep-guide-c1) 0,
    calc(var(--pep-guide-c1) + .62px) 1.5px, 1.5px calc(var(--pep-guide-c1) + .62px), 1.5px calc(100% - var(--pep-guide-c3) - .62px), calc(var(--pep-guide-c3) + .62px) calc(100% - 1.5px), calc(100% - 1.5px) calc(100% - 1.5px), calc(100% - 1.5px) calc(var(--pep-guide-c2) + .62px), calc(100% - var(--pep-guide-c2) - .62px) 1.5px, calc(var(--pep-guide-c1) + .62px) 1.5px);
}
/* where the window meets the bar, the edge catches the beacon's blue */
.pep-guide-panel::after {
  content: "";
  position: absolute;
  z-index: 2;
  top: var(--pep-guide-c2);
  bottom: 10%;
  right: 0;
  width: 2px;
  pointer-events: none;
  background: linear-gradient(180deg, transparent, var(--pep-guide-blue) 28%, var(--pep-beam) 55%, var(--pep-guide-blue) 80%, transparent);
  box-shadow: 0 0 10px 2px rgba(var(--pep-light-rgb), .45);
}
@supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  .pep-guide-panel { background: color-mix(in srgb, var(--pep-black-1) 96%, transparent); }   /* no glass support: a solid sheet, so the words stay readable */
}

/* ---------- inside the window: compact, so a window the bar's height still holds a real conversation ---------- */
.pep-guide-head { align-items: center; gap: 8px; padding: 13px 16px 9px 30px; }
.pep-guide-head::after { left: 30px; right: 16px; opacity: .9; background: linear-gradient(90deg, transparent, rgba(var(--pep-light-rgb), .85) 28%, rgb(var(--pep-light-rgb)) 50%, rgba(var(--pep-light-rgb), .85) 72%, transparent); }
/* PEPTICITY GUIDE: the house 3D chrome (depth behind, a chrome face in front) with the blue light and the slow sheen */
.pep-guide-title {
  position: relative;
  isolation: isolate;
  font-size: 18px;
  line-height: 1.15;
  letter-spacing: .1em;
  white-space: nowrap;
  color: var(--pep-plat-3);
  background: none;
  -webkit-text-fill-color: currentColor;
  text-shadow: none;
}
.pep-guide-title::before {
  content: attr(data-text);
  content: attr(data-text) / "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  color: var(--pep-black-0);
  -webkit-text-fill-color: currentColor;
  text-shadow:
    .03em .036em 0 var(--pep-plat-1),
    .06em .072em 0 var(--pep-plat-2),
    .09em .108em 0 color-mix(in srgb, var(--pep-plat-1) 55%, var(--pep-black-0)),
    .12em .144em 0 var(--pep-black-0),
    .14em .2em .18em color-mix(in srgb, var(--pep-black-0) 90%, transparent);
}
.pep-guide-face,
.pep-guide-h {
  color: var(--pep-plat-3);
  background-image: var(--pep-guide-sheen), var(--pep-guide-chrome);
  background-size: 260% 100%, 100% 1.3em;
  background-repeat: no-repeat, repeat-y;
  background-position: 100% 0, 0 0;
  -webkit-background-clip: text;
          background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: none;
  animation-name: pep-guide-shine;
  animation-duration: 7s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}
.pep-guide-face { display: inline-block; line-height: 1.15; background-size: 260% 100%, 100% 100%; }
@keyframes pep-guide-shine { 0% { background-position: 100% 0, 0 0; } 40%, 100% { background-position: 0% 0, 0 0; } }
.pep-guide-note { margin: 3px 0 0; font-family: var(--pep-font-ui); font-size: 12px; line-height: 1.3; letter-spacing: .05em; color: var(--pep-plat-3); }

/* the small chrome words: CLOSE, the chips, the speaker tags, the field label, sizes, links. Chrome text with the blue light,
   no fill behind (clear glass), a chrome hairline rim where they had one. */
.pep-guide-x,
.pep-guide-chip,
.pep-guide-who,
.pep-guide-label,
.pep-guide-link,
.pep-guide-size-label,
.pep-guide-size-price,
.pep-guide-tag,
.pep-guide-msg strong,
.pep-guide-msg q,
.pep-guide-steps > li::before {
  color: var(--pep-plat-3);
  background-color: transparent;
  background-image: var(--pep-guide-chrome);
  background-size: 100% 100%;
  background-repeat: no-repeat;
  -webkit-background-clip: text;
          background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: none;
}
.pep-guide-x,
.pep-guide-chip { box-shadow: none; filter: var(--pep-guide-lift); }
.pep-guide-x:hover, .pep-guide-x:focus-visible,
.pep-guide-chip:hover, .pep-guide-chip:focus-visible,
.pep-guide-link:hover, .pep-guide-link:focus-visible {
  background-color: transparent;
  background-image: var(--pep-guide-chrome-hot);
  -webkit-background-clip: text;
          background-clip: text;
}
.pep-guide-x:focus-visible,
.pep-guide-chip:focus-visible { box-shadow: inset 0 -3px 0 var(--pep-guide-blue); }
.pep-guide-x { --s: 12px; min-height: 44px; padding: 0 calc(var(--s) + 5px); font-size: 12px; letter-spacing: .2em; }
.pep-guide-chip { --s: 12px; min-height: 44px; padding: 0 calc(var(--s) + 6px); font-size: 12px; letter-spacing: .14em; }
.pep-guide-chips { gap: 6px; padding: 2px 0 6px; }

/* the conversation: clear bubbles with a chrome hairline round their cuts, words in readable platinum (never pure white) */
.pep-guide-scroll { padding: 8px 16px 4px 30px; }
.pep-guide-scroll:focus-visible { box-shadow: inset 0 -3px 0 var(--pep-guide-blue); }
.pep-guide-msg { position: relative; margin: 0 0 8px; padding: 8px 12px 9px; font-size: 15px; line-height: 1.5; }
.pep-guide-msg::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(160deg, var(--pep-plat-3), var(--pep-plat-1) 40%, var(--pep-plat-2) 70%, var(--pep-plat-3));
}
.pep-guide-msg--guide {
  margin-right: 3%;
  padding-left: 16px;
  color: var(--pep-plat-4);
  background: none;
  border-left: 0;
  clip-path: polygon(16px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 16px);
}
.pep-guide-msg--guide::before {
  clip-path: polygon(evenodd, 16px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 16px, 16px 0,
    16.4px 1px, 1px 16.4px, 1px calc(100% - 1px), calc(100% - 14.4px) calc(100% - 1px), calc(100% - 1px) calc(100% - 14.4px), calc(100% - 1px) 1px, 16.4px 1px);
}
.pep-guide-msg--you {
  margin-left: 12%;
  padding-right: 16px;
  color: var(--pep-plat-4);
  background: none;
  border-right: 0;
  clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
}
.pep-guide-msg--you::before {
  clip-path: polygon(evenodd, 0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 14px 100%, 0 calc(100% - 14px), 0 0,
    1px 1px, 1px calc(100% - 14.4px), 14.4px calc(100% - 1px), calc(100% - 1px) calc(100% - 1px), calc(100% - 1px) 16.4px, calc(100% - 16.4px) 1px, 1px 1px);
}
/* the emergency line: larger, a bar of the logo blue down its side, no fill */
.pep-guide-msg[data-topic="emergency"] { font-size: 17px; color: var(--pep-plat-4); background: none; border-left: 3px solid var(--pep-guide-blue); }
.pep-guide-who { margin: 0 0 3px; font-size: 12px; letter-spacing: .26em; }
.pep-guide-msg strong { font-weight: 600; }
.pep-guide-h { margin: 0 0 6px; font-size: 15px; line-height: 1.3; letter-spacing: .14em; filter: var(--pep-guide-lift); }
/* the step numbers: chrome figures */
.pep-guide-steps { padding: 0; list-style: none; counter-reset: pep-guide-step; }
.pep-guide-steps > li { position: relative; margin: 0 0 4px; padding-left: 26px; counter-increment: pep-guide-step; }
.pep-guide-steps > li::before { content: counter(pep-guide-step) "."; position: absolute; left: 0; top: 0; font-family: var(--pep-font-display); letter-spacing: .06em; }
.pep-guide-size { padding: 6px 0; }
.pep-guide-size-price { filter: drop-shadow(0 0 6px rgba(var(--pep-light-rgb), .55)); }
.pep-guide-link { font-size: 14px; }
/* a product that waits for counsel: a small slashed HIDE BEFORE LAUNCH tag beside its name */
.pep-guide-pname { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; margin: 0 0 6px; }
.pep-guide-pname > .pep-guide-h { margin: 0; }
.pep-guide-tag {
  --t: 8px;
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 calc(var(--t) + 6px);
  font-family: var(--pep-font-display);
  font-size: 12px;
  line-height: 1;
  letter-spacing: .16em;
  white-space: nowrap;
  clip-path: polygon(var(--t) 0, 100% 0, calc(100% - var(--t)) 100%, 0 100%);
}
.pep-guide-tag::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(90deg, var(--pep-plat-3), var(--pep-plat-2) 55%, var(--pep-guide-blue));
  clip-path: polygon(evenodd, var(--t) 0, 100% 0, calc(100% - var(--t)) 100%, 0 100%, var(--t) 0,
    calc(var(--t) + 1.2px) 1px, calc(100% - 1.7px) 1px, calc(100% - var(--t) - 1.2px) calc(100% - 1px), 1.7px calc(100% - 1px), calc(var(--t) + 1.2px) 1px);
}
/* ASK and JOIN THE TEAM: chrome blades with the blue light through their middle */
.pep-guide-join,
.pep-guide-send {
  background: linear-gradient(100deg, var(--pep-plat-3) 0%, var(--pep-plat-5) 16%, var(--pep-plat-4) 32%, var(--pep-plat-2) 46%, var(--pep-guide-blue) 50%, var(--pep-plat-2) 54%, var(--pep-plat-4) 68%, var(--pep-plat-5) 84%, var(--pep-plat-3) 100%);
  text-shadow: none;
}
.pep-guide-join { min-height: 46px; font-size: 14px; }

/* the question field: a cut rim and nothing behind it; the keyboard shows as a bar of the blue at its foot */
.pep-guide-form { padding: 9px 16px 11px 30px; }
/* the field names itself (YOUR QUESTION shows inside it until typing starts); the label stays for screen readers */
.pep-guide-label { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.pep-guide-input::placeholder { color: var(--pep-plat-3); opacity: 1; font-family: var(--pep-font-display); font-size: 13px; letter-spacing: .22em; }
.pep-guide-input { --k: 18px; height: 48px; padding-left: 18px; font-size: 16px; color: var(--pep-plat-4); background-color: transparent; box-shadow: none; }
.pep-guide-input:focus-visible { --rim: var(--pep-guide-blue); --rim-cut: var(--pep-beam); background-color: transparent; box-shadow: inset 0 -3px 0 var(--pep-guide-blue); }
.pep-guide-send { height: 48px; min-width: 84px; font-size: 15px; }
.pep-guide-fine { margin: 5px 0 0; font-size: 12px; line-height: 1.3; color: var(--pep-plat-3); }

/* ---------- phones: the same idea. The bar at the right edge, the window out to its left at the bar's height ---------- */
@media (max-width: 699px) {
  [data-module="guide"] {
    --pep-guide-edge: max(4px, env(safe-area-inset-right, 0px));
    --pep-guide-bw: 46px;
    --pep-guide-iw: 41px;
    --pep-guide-icx: calc(100% - var(--pep-guide-iw) / 2);   /* the beacon at the screen's edge side of its tap area */
    --pep-guide-rest: min(270px, calc(var(--pep-guide-vh, 100%) - 96px));   /* 270: clear of the hero's join form on a 390 x 844 screen (the bar steps aside over any form) */
    --pep-guide-gapx: 4px;
    --pep-guide-c1: 30px;
    --pep-guide-c2: 22px;
    --pep-guide-c3: 24px;
  }
  [data-module="guide"][data-open] .pep-guide-launch { bottom: calc(var(--pep-guide-foot) + var(--pep-guide-kb, 0px)); }
  .pep-guide-panel {
    right: calc(var(--pep-guide-edge) + var(--pep-guide-bw) + var(--pep-guide-gapx));
    bottom: calc(var(--pep-guide-foot) + var(--pep-guide-kb, 0px));
    width: calc(100% - var(--pep-guide-edge) - var(--pep-guide-bw) - var(--pep-guide-gapx) - 8px);
  }
  .pep-guide-head { gap: 8px; padding: 11px 10px 7px 26px; }
  .pep-guide-head::after { left: 26px; right: 10px; }
  .pep-guide-title { font-size: 15px; }
  .pep-guide-x { --s: 12px; padding: 0 calc(var(--s) + 5px); letter-spacing: .16em; }
  .pep-guide-scroll { padding: 6px 10px 4px 22px; }
  .pep-guide-msg { padding: 7px 10px 8px; font-size: 14px; line-height: 1.45; }
  .pep-guide-msg--guide { margin-right: 0; padding-left: 14px; }
  .pep-guide-msg--you { margin-left: 8%; padding-right: 14px; }
  .pep-guide-form { padding: 6px 10px 10px 22px; }
  .pep-guide-send { min-width: 70px; }
}

/* ---------- less motion: the gap light holds still at full strength, and nothing sweeps ---------- */
@media (prefers-reduced-motion: reduce) {
  [data-module="guide"] .pep-guide-gap,
  [data-module="guide"] .pep-guide-launch::after { animation-name: none !important; opacity: 1; }
  [data-module="guide"] .pep-guide-streak { display: none; }   /* a band resting on clear glass would be a tint */
  [data-module="guide"] .pep-guide-face,
  [data-module="guide"] .pep-guide-h,
  [data-module="guide"] .pep-guide-launch-label { animation-name: none !important; }
}
/* ===== /NOV13-GUIDE ===== */
'''

# ---- markup (inside the module's own region) ----
GAP_ANCHOR = '<span class="pep-guide-icon" data-guide-icon aria-hidden="true"></span>'
GAP_SPAN = '<span class="pep-guide-gap" data-guide-gap aria-hidden="true"></span>'
PNAME_OLD = '<h3 class="pep-guide-h" data-fill="p-name"></h3>'
PNAME_NEW = ('<div class="pep-guide-pname"><h3 class="pep-guide-h" data-fill="p-name"></h3>'
             '<span class="pep-guide-tag" data-if="p-flag">HIDE BEFORE LAUNCH</span></div>')
INPUT_OLD = '<input class="pep-guide-input" id="pep-guide-q" type="text"'
INPUT_NEW = '<input class="pep-guide-input" id="pep-guide-q" type="text" placeholder="YOUR QUESTION"'
FINE_OLD = 'What you type stays in this browser. It is not sent or saved.'
FINE_NEW = 'Nothing you type here is sent or saved.'
TITLE_RX = re.compile(r'<h2(?P<a>[^>]*\bid="pep-guide-title"[^>]*)>(?P<inner>.*?)</h2>', re.S)

# ---- js (inside the module's own script block) ----
JS_EDITS = [
    # where the flagged list is read (beside the hidden list)
    ('function readCatalogue(d) {\n',
     'function readCatalogue(d) {\n'
     '        var flagged = Array.isArray(cfg.flagged) ? cfg.flagged.map(String) : [];   // waiting for counsel: tagged in the answers\n',
     'var flagged = Array.isArray(cfg.flagged)'),
    ('list.push({ name: p.name.toUpperCase(),',
     'list.push({ flag: flagged.indexOf(String(p.sku)) >= 0, name: p.name.toUpperCase(),',
     'list.push({ flag: flagged.indexOf(String(p.sku)) >= 0,'),
    ("'p-out': p.soldOut",
     "'p-out': p.soldOut, 'p-flag': p.flag === true",
     "'p-flag': p.flag === true"),
    # if the smooth glide never starts (a busy or throttled page) the answer still comes into view; a visitor's own scroll
    # moves the conversation, which cancels this
    ("        var top = Math.max(0, li.offsetTop - 10);\n"
     "        try { scroller.scrollTo({ top: top, behavior: ctx.motion.reduced ? 'auto' : 'smooth' }); } catch (e) { scroller.scrollTop = top; }\n",
     "        var top = Math.max(0, li.offsetTop - 10), from = scroller.scrollTop;\n"
     "        try { scroller.scrollTo({ top: top, behavior: ctx.motion.reduced ? 'auto' : 'smooth' }); } catch (e) { scroller.scrollTop = top; }\n"
     "        clearTimeout(reveal.t);                          // the glide never started (a busy page): go straight there\n"
     "        reveal.t = setTimeout(function () { if (scroller.scrollTop === from && from !== top) { scroller.scrollTop = top; } }, 700);\n",
     'reveal.t = setTimeout'),
    # the window is only the bar's height: bring the answer itself into view (the question sits just above it)
    ('reveal(you && you.parentNode ? you : li);',
     'reveal(li);                                      // a window the bar\'s height: the answer itself comes into view',
     "reveal(li);                                      // a window the bar's height"),
]


def fail(msg):
    sys.stderr.write('apply.py (guide): FAILED: ' + msg + '\n')
    sys.exit(1)


def unique_index(html, anchor):
    i = html.find(anchor)
    if i < 0:
        fail('anchor missing: ' + anchor)
    if html.find(anchor, i + len(anchor)) >= 0:
        fail('anchor not unique: ' + anchor)
    return i


def edit_once(region, old, new, done, label):
    """Replace old with new exactly once, unless the done marker shows it was already applied."""
    if done in region:
        return region, label + ': already applied'
    n = region.count(old)
    if n != 1:
        fail('%s: expected the anchor once in the guide region, found %d: %r' % (label, n, old[:80]))
    return region.replace(old, new, 1), label + ': applied'


def main():
    if len(sys.argv) != 3:
        fail('usage: python3 -I apply.py IN.html OUT.html')
    src, dst = sys.argv[1], sys.argv[2]
    with open(src, encoding='utf-8') as fh:
        html = fh.read()
    log = []

    # 1. CSS: the marked NOV13-GUIDE section at the foot of guide.css (replaced in place if it is there already)
    i = unique_index(html, CSS_OPEN)
    j = html.find('</style>', i)
    if j < 0:
        fail('end of guide.css block missing')
    css = html[i:j]
    if CSS_START in css:
        a = css.index(CSS_START)
        b = css.find(CSS_END, a)
        if b < 0:
            fail('NOV13-GUIDE start marker without its end marker')
        b += len(CSS_END)
        while b < len(css) and css[b] == '\n':
            b += 1
        css = css[:a] + CSS_BLOCK + css[b:]
        log.append('css: replaced')
    else:
        css = css + CSS_BLOCK
        log.append('css: appended')
    html = html[:i] + css + html[j:]

    # 2. markup: from the module comment to the next module comment or script block
    m0 = unique_index(html, MODULE)
    ends = [k for k in (html.find('<!-- module:', m0 + len(MODULE)), html.find('<script', m0)) if k >= 0]
    if not ends:
        fail('end of the guide markup region not found')
    m1 = min(ends)
    region = html[m0:m1]
    if 'data-module="guide"' not in region:
        fail('the guide root is not inside its module region')
    region, msg = edit_once(region, GAP_ANCHOR, GAP_ANCHOR + '\n    ' + GAP_SPAN, 'data-guide-gap', 'gap light')
    log.append(msg)
    region, msg = edit_once(region, PNAME_OLD, PNAME_NEW, 'data-if="p-flag"', 'flag tag')
    log.append(msg)
    region, msg = edit_once(region, FINE_OLD, FINE_NEW, FINE_NEW, 'fine print')
    log.append(msg)
    region, msg = edit_once(region, INPUT_OLD, INPUT_NEW, 'placeholder="YOUR QUESTION"', 'field placeholder')
    log.append(msg)
    tm = list(TITLE_RX.finditer(region))
    if len(tm) != 1:
        fail('title heading (h2 id="pep-guide-title"): expected once, found %d' % len(tm))
    t = tm[0]
    attrs, inner = t.group('a'), t.group('inner')
    if 'pep-guide-face' in inner:
        log.append('title: already applied')
    elif inner.strip() == 'PEPTICITY GUIDE':
        if 'data-text=' not in attrs:
            attrs = attrs + ' data-text="PEPTICITY GUIDE"'
        region = region[:t.start()] + '<h2' + attrs + '><span class="pep-guide-face">PEPTICITY GUIDE</span></h2>' + region[t.end():]
        log.append('title: applied')
    else:
        sys.stderr.write('apply.py (guide): note: the title heading was already restructured by someone else; left as it is\n')
        log.append('title: left as found')
    html = html[:m0] + region + html[m1:]

    # 3. JS: the flagged list and the tag switch
    s0 = unique_index(html, JS_OPEN)
    s1 = html.find('</script>', s0)
    if s1 < 0:
        fail('end of guide.js block missing')
    js = html[s0:s1]
    for old, new, done in JS_EDITS:
        js, msg = edit_once(js, old, new, done, 'js ' + done[:24])
        log.append(msg)
    html = html[:s0] + js + html[s1:]

    with open(dst, 'w', encoding='utf-8') as fh:
        fh.write(html)
    print('apply.py (guide): ' + '; '.join(log))


if __name__ == '__main__':
    main()
