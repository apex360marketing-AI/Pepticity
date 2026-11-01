# TXT-04 · Scroll Highlight

A statement starts dim and lights up word by word in step with your scrolling. A soft reading light travels along the line with the lit edge, key phrases light in the accent and draw their own underline once fully lit, and the small notes underneath slide in at the end.

Weight: Medium · Dependencies: none (vanilla JS, no CDN, no GSAP / SplitText / Lenis) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/TXT-04/module.css">
<section class="apx-txt04" data-apx="TXT-04" aria-label="Why it's different">
  <div class="apx-txt04__stage">
    <div class="apx-txt04__inner">
      <h2 class="apx-txt04__kicker">Why it's different</h2>
      <p class="apx-txt04__text">Most lead companies sell the same request to <mark>several businesses</mark> … <mark>get the credit</mark>.</p>
      <span class="apx-txt04__meter" aria-hidden="true"></span>
      <div class="apx-txt04__notes"><p>…</p><p>…</p></div>
    </div>
  </div>
</section>
<script src="library/TXT-04/module.js"></script>
```
Auto-mounts every `[data-apx="TXT-04"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX['TXT-04'].mount(el, opts)` (also `window.APX.TXT04`). Mounting twice returns the same `destroy`; `destroy()` restores the original markup (words are un-split, inline styles removed).
Any number of `.apx-txt04__text` blocks light in sequence (e.g. a heading then a paragraph). Inner markup is kept; words inside `<mark>`, `[data-hl]` or `.apx-txt04__hl` are the highlighted phrases. Meter and notes are optional.

## Options
- `data-pin` (`true` when there is a `.apx-txt04__stage`): hold the statement on screen while it lights. `data-pin="false"` lights the words as the text passes through the viewport instead (use for text in the middle of a page section).
- `data-still` (0..1, default 1): how much is lit in the motion-off still.
- CSS: `--apx-txt04-length` (240vh, hold length), `--apx-txt04-length-compact` (210vh, under 900px), `--apx-txt04-dim` (.16, unlit word opacity), `--apx-txt04-font` / `--apx-txt04-weight` (defaults to the display font at 400).

## Tokens
`--apx-ink` (lit words), `--apx-muted` (kicker, notes), `--apx-accent` (highlight phrases, underline, reading light, meter), `--apx-line` (meter track), `--apx-bg` (a light ground switches the reading light to a soft multiply tint), `--apx-font-display`, `--apx-font-text`, `--apx-motion`. All have fallbacks. After changing tokens at runtime, dispatch `apx:tokens` on the element or window.

## Accessibility and performance
The text stays real text (words are inline spans in reading order). Only opacity and transform change on words; the reading light is one transformed element; underlines are scaleX transforms. Word positions are measured on layout only (ResizeObserver, fonts ready), never in the scroll loop. One rAF loop that runs only while the section is on screen and the tab is visible.
Phones keep a shorter native sticky hold (no JS pinning). Reduced motion / `--apx-motion: 0`: no hold, everything lit, notes shown. Tested at 390px with no sideways scroll.
