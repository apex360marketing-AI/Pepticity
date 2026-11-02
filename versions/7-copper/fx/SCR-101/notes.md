# SCR-101 · Flipbook Scrub

A held frame plays a sequence of pictures like a flipbook as you scroll, forward and back, while short captions change beside it.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/SCR-101/module.css">
<section class="apx-scr101" data-apx="SCR-101" data-frames="img/seq_{i}.webp" data-count="72" data-pad="3" data-still="1">
  <div class="apx-scr101__stage">
    <div class="apx-scr101__glow" aria-hidden="true"></div>
    <canvas class="apx-scr101__canvas" role="img" aria-label="Describe the sequence"></canvas>
    <ol class="apx-scr101__beats">
      <li data-at="0-0.34"><span class="apx-scr101__kicker">Step 01</span><h3>…</h3><p>…</p></li> …
    </ol>
    <div class="apx-scr101__meter" aria-hidden="true"><span class="apx-scr101__count"></span><i><b class="apx-scr101__bar"></b></i></div>
  </div>
</section>
<script src="library/SCR-101/module.js"></script>
```
Auto-mounts every `[data-apx="SCR-101"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX['SCR-101'].mount(el)` (also `window.APX.SCR101`). Mounting twice returns the same `destroy`; `destroy()` restores the original markup/styles.

## Options
`data-frames` pattern with `{i}`, `data-count`, `data-start` (1), `data-pad`, `data-fit` (contain|cover), `data-still` (0..1 frame shown when motion is off). Or `mount(root, { frames: [urls | Image | canvas] })` with `data-apx-manual` to skip auto-mount. `--apx-scr101-length` (default 340vh).

## Tokens
`--apx-ink`, `--apx-muted`, `--apx-accent`, `--apx-surface`, `--apx-line`, `--apx-radius`, `--apx-font-display`, `--apx-font-text`, `--apx-motion` (all with fallbacks). `--apx-motion`: 0 = still, 1 = normal (scales durations/amplitudes). After changing tokens at runtime, dispatch `apx:tokens` on the element or window.

## Accessibility and performance
Canvas has role="img" + aria-label; captions are real list text. Frames load progressively (every 8th first). Phones (<900px): no pin, the sequence scrubs as it passes and captions read as a list. Motion 0 / reduced motion: no pin, one still frame, all captions visible.
Transform / opacity / clip-path only; one rAF loop per instance that sleeps when off screen or the tab is hidden; `prefers-reduced-motion` is treated as motion 0. Tested at 390px with no sideways scroll.
