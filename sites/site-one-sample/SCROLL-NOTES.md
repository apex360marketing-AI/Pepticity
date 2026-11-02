# SMOOTH SCROLL · site-one-sample (2 Nov)
Only scrolling code changed: `v5.js` "smooth scroll" block + `glide()`. No layout, copy, visuals, tour logic touched. Not published.

## Scroll drivers found
- Lenis 1.3.27 (desktop, pointer:fine, not reduced motion) on the GSAP ticker; `lenis.on('scroll', ScrollTrigger.update)`.
- ScrollTrigger scrubs: #journey (1.4), #lab (1.2), #explode (1); no pins.
- `glide(y,dur)` programmatic: menu/tour goTo, age enter, intro hand-off, lab stage next, lab settle (260 ms after scroll).
- `jump()` immediate (gate/intro only). Phones/touch + reduced motion: native scroll (Lenis off).
- Menu/modal/cart: stopScroll()/startScroll().

## What changed
- Lenis: lerp .075 -> .05, wheelMultiplier .9 -> .65.
- `virtualScroll` hook (wheel only): one event capped at .8 screen; pending travel capped at 1.15 screens; delta x .42 inside a hook card (soft stop, never a lock).
- Soft stops: hero card, markets panel, FOUR QUESTIONS card, perks, text-alerts, tiers, refer, letter. A card that fits the screen slows while 78%+ is visible; tall blocks only the first beat. Zones read once per 120 ms.
- Keyboard: PageDown/Space/arrows/Home/End now eased Lenis glides (not native jumps). Inputs, selects, buttons (Space) untouched.
- `glide()`: eased cubic, duration never under 1.6 s per screen (cap 6 s).
- Reduced motion: unchanged (no Lenis, no soft stops).

## Numbers (Chromium 1440x900, heavy WebGL + smoke blocked; script: tools/measure-scroll.js)
| test | BEFORE | AFTER |
|---|---|---|
| one hard flick (wheel 3000) | 2401 px @1 s, 2700 px total (3 screens) | 1008 px @1 s, 1107 px total (1.2 screens, ~1.5 s) |
| 3 flicks in 180 ms | 8078 px @3 s | 1912 px @3 s |
| PageDown | 787 px, instant (<0.4 s) | 765 px, eased ~1.5 s |
| max px in any 250 ms (flick) | 2400+ | 567 |
| slow zone, 5 x 100 wheel | n/a | 136 px in cards vs 325 px open ground |
| goTo('tour') from top (3600 px) | 1.8 s | 5.7 s |
| scripted 10 s wheel | 66 long tasks, max 506 ms (smoke canvas on) | 5 long tasks, max 147 ms, max frame 217 ms (smoke blocked, so not like for like) |
| touch flick 390x844 | not measurable (headless gesture did not scroll); Lenis is off on touch | same |
| reduced motion | 3000 px instant | same (unchanged) |
Software rendering here is slow (backdrop blur, canvases), so absolute frame times are pessimistic. Jank sources seen: smoke canvas + backdrop-filter glass repaint during scroll (not changed: visuals are locked).

## Roll out to sites/versions/*
1. Copy the whole "smooth scroll" block (from `var lenis = null;` to the `glide` line) of sites/site-one-sample/v5.js into each version's v5.js (or shared script).
2. Re-run `node tools/measure-scroll.js <url> <label>` per version; expect flick ~1000-1200 px.
3. Tune only SC_MULT / SC_LEAD / SC_SLOW / SC_EVT if the owner wants it heavier or lighter.
Open question: touch devices still use native momentum (could add Lenis syncTouch).
