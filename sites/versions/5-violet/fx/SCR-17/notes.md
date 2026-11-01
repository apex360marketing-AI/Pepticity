# SCR-17 · Word Portal

One huge word fills the screen, drawn as a smoked-glass cut-out with a fine chrome rim and one small accent glint travelling along its letters. As you scroll, the camera flies into the word and straight through the thickest part of one letter, and the scene behind it (a slowly turning accent ring and your message) opens up.

Weight: Medium · Dependencies: none (vanilla JS + one 2D canvas, no CDN, no GSAP / Lenis) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/SCR-17/module.css">
<section class="apx-scr17" data-apx="SCR-17" data-word="EXCLUSIVE" aria-label="Exclusive leads">
  <div class="apx-scr17__stage">
    <div class="apx-scr17__scene">
      <div class="apx-scr17__ring" aria-hidden="true"></div>
      <div class="apx-scr17__inner">
        <span class="apx-scr17__kicker">The APEX rule</span>
        <h2>ONE LEAD.<br>ONE BUSINESS.<br><span>YOURS.</span></h2>
        <p>…</p>
      </div>
    </div>
    <p class="apx-scr17__cue" aria-hidden="true">Keep scrolling</p>
  </div>
</section>
<script src="library/SCR-17/module.js"></script>
```
Auto-mounts every `[data-apx="SCR-17"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX['SCR-17'].mount(el, opts)` (also `window.APX.SCR17`). Mounting twice returns the same `destroy`; `destroy()` removes the canvas and the screen-reader copy and clears every inline style.
The scene is ordinary markup: put anything in `.apx-scr17__inner`. The ring and cue are optional.

## Options
Attributes on the section, or the same keys in `mount(el, {...})`:
- `data-word` / `word` (`EXCLUSIVE`): the word you fly through. Short single words (5-10 letters) read best.
- `data-through` / `through`: index of the letter to pass through (0-based). Default: the letter nearest the middle with a closed or heavy shape. The module finds that letter's thickest point itself, so any font works.
- `data-weight` / `weight` (`800`): font weight of the word.
- CSS: `--apx-scr17-length` (280vh desktop scroll length) and `--apx-scr17-length-compact` (240vh under 900px).

## Tokens
`--apx-bg` (the mask colour around the word and the scene ground), `--apx-ink` (rim, glass sheen, scene text), `--apx-muted` (kicker, cue), `--apx-accent` (the rim glint, ring and dot), `--apx-line`, `--apx-font-display` (the word and heading), `--apx-font-text`, `--apx-motion`. All have fallbacks.
A light `--apx-bg` (luminance > .5) switches to a pale mask with darker smoked letters so the word still reads. `--apx-motion`: 0 = still, 1 = normal. After changing tokens at runtime dispatch `apx:tokens` on the element or window.

## Accessibility and performance
The word is also real text (visually hidden) for screen readers; the canvas is `aria-hidden`. The scene copy is ordinary HTML.
One 2D canvas, redrawn only while the section is on screen and the tab is visible. Once the word is much larger than the screen only the letters still on screen are drawn. Pixel ratio capped at 2 (1.5 on phones). The pin uses CSS `position: sticky` (no scroll hijack) and is kept on phones because it is cheap.
Reduced motion / motion 0: no pin and no zoom; the finished scene is shown as a normal full-height section.
DOM motion uses transform / opacity only. Tested at 390px with no sideways scroll.
Software-rendered browsers (no GPU) draw the giant glyphs slowly near the end of the zoom; on normal devices it holds 60fps.

## Changed from the original (Frame by Frame, `#zoom`)
The original was a black layer with a white word in multiply blend, scaled with GSAP. Here the mask is drawn on a canvas each frame, so the letters stay sharp at any zoom. The camera now lands on the thickest point of the letter and that point drifts to the centre of the screen. The word reads better before the zoom (smoked glass, chrome rim, small travelling glint), there is pointer parallax, and the ring only spins while you can see it.
