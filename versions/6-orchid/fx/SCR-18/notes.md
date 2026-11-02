# SCR-18 · Card Stack

Big cut-corner glass cards, one per step. As you scroll, each card slides up over the one before it, and the card underneath sinks back, shrinks a little and dims, so the steps pile into a neat stack. The copy rises in as each card arrives, the line drawing wipes in, a sheen crosses the glass now and then, and on hover a soft light follows the pointer while the drawing leans toward it.

Weight: Medium · Dependencies: none (vanilla JS + CSS sticky, no CDN, no GSAP / Lenis) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/SCR-18/module.css">
<section class="apx-scr18" data-apx="SCR-18" aria-label="How it works">
  <header class="apx-scr18__head">
    <div><span class="apx-scr18__kicker">How it works</span><h2>SIX CHECKS BETWEEN THEIR REQUEST AND YOUR PHONE.</h2></div>
    <p>…</p>
  </header>
  <ol class="apx-scr18__stack">
    <li class="apx-scr18__card">
      <div class="apx-scr18__copy"><span class="apx-scr18__num">Step 01 · Request</span>
        <div class="apx-scr18__body"><h3>THEY ASK FOR A QUOTE</h3><p>…</p></div></div>
      <div class="apx-scr18__vis" aria-hidden="true"><svg viewBox="0 0 300 280">…</svg></div>
    </li> …
  </ol>
</section>
<script src="library/SCR-18/module.js"></script>
```
Auto-mounts every `[data-apx="SCR-18"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX['SCR-18'].mount(el, opts)` (also `window.APX.SCR18`). Mounting twice returns the same `destroy`; `destroy()` unwraps the cards back to the original markup and clears inline styles.
Works with any number of cards. The header and the picture panel are optional.

## Line drawings
The SVGs are plain markup coloured by class, so they follow the tokens: `s` structure stroke, `d` faint stroke, `a` accent stroke (with a small glow), `f` muted fill, `af` accent fill, `t` text. Add `spin` (slow turn) or `pulse` (breathing) to any shape. No colours are written in the SVG.

## Options
Attributes on the section, or the same keys in `mount(el, {...})`:
- `data-depth` / `depth` (`.1`): how much a covered card shrinks (0 to .3).
- `data-dim` / `dim` (`.55`): how dark a covered card goes (0 to .9).
- `data-index` / `index` (`on`): `off` hides the big outline step number in the picture panel.
- CSS: `--apx-scr18-top` (12vh, where cards stick), `--apx-scr18-card-height` (min(70vh, 560px)), and the `-compact` versions for under 900px.

## Tokens
`--apx-bg`, `--apx-surface` (glass), `--apx-ink`, `--apx-muted`, `--apx-accent` (step label, drawing highlights, cut-corner hairline), `--apx-line`, `--apx-font-display`, `--apx-font-text`, `--apx-motion`. All have fallbacks. A light `--apx-bg` switches the covered-card shade to a soft ink tint. Dispatch `apx:tokens` after changing tokens at runtime.

## Accessibility and performance
Cards stay a real ordered list with real headings. Sticking is plain CSS; the module only reads six card positions per frame while the section is on screen and writes a transform and an opacity when they change. Animations pause off screen and in hidden tabs.
Reduced motion / motion 0: no sticking or shrinking; the cards are a calm list, all copy and drawings shown.
Transform / opacity / clip-path only. Tested at 390px with no sideways scroll.

## Changed from the original (Frame by Frame, `#journey`)
The original used GSAP ScrollTrigger and Lenis with fixed colours. Now it is vanilla and token-driven, the cards are see-through glass with a hairline that follows the cut corner, the covered card's shade is clipped to the card shape, the drawings wipe in and use class colours, the dashed rings turn instead of animating dash offsets, a big outline step number was added, and hover adds a pointer light and a leaning drawing. The "92" score in the qualify drawing was replaced by a needle, so no number is implied.
