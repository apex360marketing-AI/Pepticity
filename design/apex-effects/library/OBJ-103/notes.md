# OBJ-103 · Link Swarm

A one-of-a-kind menu. Thousands of fine specks of platinum light hold a shape in a smoked glass frame. Point at, focus or tap a link and the swarm streams across in a swirl and rebuilds itself as that link's picture — a house, a map pin, a shield, a price tag, a phone. Specks glow brighter the faster they move, and only the very fastest flash the accent colour. At rest the shape breathes and turns slowly, and the specks part around the pointer.

Weight: Medium · Dependencies: none (vanilla JS + WebGL 1 points, canvas fallback, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/OBJ-103/module.css">
<nav class="apx-obj103" data-apx="OBJ-103" aria-label="Main menu" data-idle="apex" data-idle-label="APEX" data-idle-hint="Choose a page">
  <ul>
    <li><a href="/industries" data-shape="house" data-hint="Homes and trades">INDUSTRIES</a></li>
    <li><a href="/areas" data-shape="pin" data-hint="Your service area">AREAS</a></li>
    <li><a href="/how-it-works" data-shape="shield">HOW IT WORKS</a></li>
    <li><a href="/pricing" data-shape="tag">PRICING</a></li>
    <li><a href="/get-leads" data-shape="phone" aria-current="page">GET LEADS</a></li>
  </ul>
</nav>
<script src="library/OBJ-103/module.js"></script>
```
Auto-mounts every `[data-apx="OBJ-103"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true`).
Manual: `const destroy = window.APX['OBJ-103'].mount(nav, { idle: 'apex' })` (also `window.APX.OBJ103`). Mounting twice returns the same `destroy`; `destroy()` frees the WebGL context and restores the original markup.
`nav.__apxOBJ103.select(2)` morphs to a link from code (`select(null)` returns to the resting shape).

## Shapes
Built in: `apex` (the APEX "A"), `house`, `phone`, `shield`, `pin`, `tag`, `chat`, `star`, `mail`, `bolt`. Or give any link `data-path="M… Z"` — a filled SVG path in a 24×24 box (even-odd holes work). The resting shape is the `aria-current` link's shape, else `data-idle` (default `apex`).

## Behaviour
- Mouse: hover a link to morph; leave the list and it returns to the resting shape after a moment.
- Keyboard: focusing a link morphs exactly like hover; Enter follows it.
- Touch: the first tap chooses the link and morphs (a small "TAP AGAIN TO OPEN" appears); a second tap follows it. Change that text with `--apx-obj103-armed: "…"`.
- Pointer (or a finger dragged across the frame) pushes the specks aside.

## Options
`data-idle`, `data-idle-label` (caption at rest, default `APEX`), `data-idle-hint`, and per link `data-shape` / `data-path` / `data-hint` (caption while chosen).

## Tokens
`--apx-ink` (the dust, link text), `--apx-accent` (fastest specks, active index, spark dot, focus ring), `--apx-muted` (indexes, captions), `--apx-line` (rules, frame rim), `--apx-bg` (frame tint; a light `--apx-bg` switches to graphite dust on pale glass), `--apx-font-display` (links), `--apx-font-text`, `--apx-motion`. All have fallbacks. After changing tokens at runtime, dispatch `apx:tokens`.

## Accessibility and performance
Links stay real `<a>` elements in a list inside `<nav>`; the frame, canvas, indexes and captions are `aria-hidden`. Visible focus ring; every link is at least 48px tall.
9,000 specks on desktop and 4,200 on phones, simulated on the CPU (springs, swirl, flutter, pointer push) and drawn as WebGL 1 points in two passes (crisp specks plus a faint halo); one WebGL context per menu. Without WebGL it draws 2,000 / 1,200 specks on a 2D canvas. The loop runs only while the menu is on screen and the tab is visible; pixel ratio capped (2 desktop, 1.5 phones).
Reduced motion / `--apx-motion: 0`: a finished still of the shape, and choosing a link swaps the picture instantly with no flow.
