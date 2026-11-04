# SCR-07 · Skyline Dive

The camera falls from above a night city, down past lit towers to one glowing window, into a room where a phone on the desk receives the lead. The six steps appear on a glass card along the way, and the lens gently breathes with your scroll speed.

Weight: Heavy · Dependencies: none (vanilla JS + WebGL 1, no CDN, no three.js / GSAP) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/SCR-07/module.css">
<section class="apx-scr07" data-apx="SCR-07" aria-label="How a lead reaches you"
  data-lead-title="New lead · Roofing" data-lead-detail="Full tear-off, 2,400 sq ft" data-lead-value="$500 – $5k">
  <div class="apx-scr07__stage">
    <div class="apx-scr07__veil" aria-hidden="true"></div>
    <ol class="apx-scr07__steps">
      <li data-label="Capture"><span class="apx-scr07__kicker"><b>01</b> / 06 · Capture</span><h3>THEY ASK FOR A QUOTE.</h3><p>…</p></li> …
    </ol>
    <div class="apx-scr07__rail" aria-hidden="true"></div>
    <div class="apx-scr07__depth" aria-hidden="true">Altitude<b></b></div>
  </div>
</section>
<script src="library/SCR-07/module.js"></script>
```
Auto-mounts every `[data-apx="SCR-07"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX['SCR-07'].mount(el, opts)` (also `window.APX.SCR07`). Mounting twice returns the same `destroy`; `destroy()` removes the canvas, frees the WebGL context and restores the original markup (headings, rail, inline styles).
The card works with any number of steps (6 is the design). The rail and the word-by-word heading reveal are built from the markup; `.apx-scr07__rail` and `.apx-scr07__depth` are optional.

## Options
Attributes on the section, or the same keys in `mount(el, {...})`:
- Phone notification (always a sample): `data-lead-tag` (`SAMPLE`), `data-lead-title`, `data-lead-detail`, `data-lead-note` (`Consent recorded`), `data-lead-value`, `data-lead-chip` (`VERIFIED`), `data-lead-foot`, `data-time` (`9:41`), `data-day` (`Tuesday`). Keys: `leadTag, leadTitle, leadDetail, leadNote, leadValue, leadChip, leadFoot, time, day`. Use real figures only (e.g. the industry's lead-value range) or `[placeholders]`.
- `data-depth-from` (280) and `data-depth-unit` (`M`) for the altitude readout.
- `data-still` (0..1, default 1): where along the dive the motion-off still is taken (1 = the lead on the phone, ~.4 = the lit window in the skyline).
- CSS: `--apx-scr07-length` (760vh, desktop scroll length) and `--apx-scr07-length-compact` (620vh, under 900px).

## Tokens
`--apx-bg` (sky, fog, ground, page blend — fog fades exactly into it), `--apx-ink` (lit windows, lamps, text), `--apx-muted` (dim windows, labels), `--apx-accent` (the one lit window, the travelling lead, rail, phone glow), `--apx-accent-ink` (chip text when the accent is deep), `--apx-surface`, `--apx-line`, `--apx-radius`, `--apx-font-display`, `--apx-font-text` (also used on the phone screen), `--apx-motion`. All have fallbacks.
A light `--apx-bg` (luminance > .5) switches the city to day: graphite towers with pale glass, a white room, a bead-style lead. `--apx-motion`: 0 = still, 1 = normal. After changing tokens at runtime, dispatch `apx:tokens` on the element or window (the scene is rebuilt with the new colours).

## Accessibility and performance
Steps are real list text (headings keep an `aria-label` with the full sentence while the words animate); canvas, rail and readout are `aria-hidden`.
One WebGL context per instance; ~3 draw calls for the city and room plus sprites; the render loop runs only while the section is on screen and the tab is visible, and stops entirely in still mode. Pixel ratio is capped (1.75 desktop, 1.25 phones), phones get a sparser city, a smaller window texture and no antialiasing. The pinned dive is kept on phones (it is the effect) with the card docked at the bottom; the final framing measures the card and rail and places the phone in the free space at any size.
Reduced motion / motion 0: no pin, one finished still (the lead on the phone) and all steps shown as a grid of glass cards. No WebGL: a quiet skyline silhouette with the same card layout.
Transform / opacity / filter only for DOM motion. Tested at 390px with no sideways scroll.
