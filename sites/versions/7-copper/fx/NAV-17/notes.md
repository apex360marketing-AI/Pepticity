# NAV-17 · Timeline Scrubber

A film-editor timeline fixed along the bottom of the screen. Each chapter of the page has a mark, the played part glows faintly with a slow light running along it, and a playhead with a small breathing glow shows where you are. A running timecode treats the page like a two-minute film. Hover the track to see a preview frame (number, chapter name, line icon, timecode) of where you would land; drag the playhead to scrub, click to jump, or use the arrow keys and the two keys either side.

Weight: Medium · Dependencies: none (vanilla JS, no CDN, no GSAP / Lenis) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/NAV-17/module.css">
<section data-chapter="Intro">…</section>
<section data-chapter="Exclusive" data-chapter-icon="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z">…</section>
…
<nav class="apx-nav17" data-apx="NAV-17" aria-label="Page timeline"></nav>
<script src="library/NAV-17/module.js"></script>
```
The module builds everything inside the empty `<nav>`. Chapters are any elements with `data-chapter` (the name shown in the frame and the label). `data-chapter-icon` is an optional 24×24 SVG path; otherwise a built-in line icon is used.
Auto-mounts every `[data-apx="NAV-17"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX['NAV-17'].mount(el, opts)` (also `window.APX.NAV17`). Mounting twice returns the same `destroy`; `destroy()` restores the nav's original contents.

## Options
Attributes on the nav, or the same keys in `mount(el, {...})`:
- `data-scope` / `scope`: a selector (or element) to limit the timeline to one part of the page. Chapters are read inside it, the timeline spans only it, and the bar slides away when you scroll out of it. Default: the whole page.
- `data-duration` / `duration` (`120`): how many seconds the page "runs" for the timecode.
- CSS: `--apx-nav17-max` (1320px bar width).

## Tokens
`--apx-bg` (bar fade), `--apx-ink`, `--apx-muted`, `--apx-accent` (playhead, played part, active mark, frame border, timecode label), `--apx-line`, `--apx-font-text`, `--apx-motion`. All have fallbacks. Dispatch `apx:tokens` after changing tokens at runtime.

## Accessibility and performance
The track is a real slider (`role="slider"`, focusable, `aria-valuenow` and a spoken chapter name). Left/Right or Up/Down jump between chapters, Page Up/Down move 5%, Home/End go to the ends. The chapter label is a polite live region. Prev/next keys are real buttons with labels.
No animation loop: the bar repaints on scroll (one frame at a time). Smooth seeking is a small eased scroll that hands control back the moment you use the wheel or touch. Positions are re-measured when the page changes size.
Phones (under 900px): the chapter name moves above the track so the track gets the full width, the timecode and mark numbers hide, and the preview frame shows while you drag.
Reduced motion / motion 0: everything still works; seeking jumps instantly and nothing moves on its own.
Transform / opacity only. The preview frame is kept inside the screen at the edges. Tested at 390px with no sideways scroll.

## Changed from the original (Frame by Frame, `nav#tl`)
The original was wired to that one page's sections, Lenis and ScrollTrigger, with fixed colours. Now chapters come from `data-chapter` on any page, it can be scoped to one part of a page, seeking uses its own eased scroll, and it is token-driven. The bar grows with `scaleY` instead of animating height. Also new: a light running along the played part, a breathing playhead glow, a recording dot by the timecode, marks that swell as the pointer nears, a chapter label that rolls on change, the frame kept inside the screen, and the preview while dragging on phones. The chapter now changes when its top passes 40% of the screen (the original changed only when the top reached the very top).
