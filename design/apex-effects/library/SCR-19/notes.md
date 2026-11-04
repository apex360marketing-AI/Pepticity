# SCR-19 · Skew Gallery

Scrolling down drives a row of 33 industry tiles sideways. Each tile carries a real 3D icon: a matte black slab with a gloss edge and a polished chrome line icon floating above it, casting a soft contact shadow. The faster you scroll, the more the row leans (the icons lean with it) and the icons twist; they spring back to face you when you stop. Each icon also sways a little on its own. On hover the icon lifts, turns toward the pointer and catches a small accent glint; a tap spins it once and fires an `apx:select` event.

Weight: Heavy · Dependencies: none (vanilla JS + WebGL 1, one renderer for all icons, no CDN, no three.js / GSAP / Lenis) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/SCR-19/module.css">
<section class="apx-scr19" data-apx="SCR-19" aria-label="Industries">
  <div class="apx-scr19__stage">
    <header class="apx-scr19__head">
      <div><span class="apx-scr19__kicker">Industries</span><h2>33 INDUSTRIES. FIND YOURS.</h2></div>
      <span class="apx-scr19__count" aria-hidden="true"><b>01</b> / 33</span>
    </header>
    <ul class="apx-scr19__track" aria-label="Industries we serve">
      <li><button class="apx-scr19__tile" type="button" data-icon="roofing" data-tag="Trade"><b>Roofing</b><small>$500 – $5k</small></button></li> …
    </ul>
    <div class="apx-scr19__bar" aria-hidden="true"><span>12 high-ticket · 21 trades</span><i class="apx-scr19__rail"></i><span>Just scroll</span></div>
  </div>
</section>
<script src="library/SCR-19/module.js"></script>
```
Auto-mounts every `[data-apx="SCR-19"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX['SCR-19'].mount(el, opts)` (also `window.APX.SCR19`). Mounting twice returns the same `destroy`; `destroy()` removes the canvas, frees the WebGL context and restores every tile's original markup.
Any number of tiles works. The section length is set from the row width, so the last tile ends 20px inside the screen.

## Tiles
- `data-icon`: one of the 33 built-in icons, or your own 24×24 SVG path (`data-icon="M4 4h16v16H4z"`). Built-in names: executive-recruitment, industrial-water-treatment, commercial-security, industrial-automation, commercial-kitchen, medical-staffing, commercial-hvac, contract-manufacturing, commercial-real-estate, specialty-medical, commercial-printing, cyber-insurance, roofing, landscaping, cleaning-interior, cleaning-exterior, plumbing, electrical, hvac, dental, legal, real-estate, fitness, auto-repair, pest-control, salon, insurance, healthcare, moving, personal-training, photography, wedding-venues, restaurants.
- `data-tag` (top-right label) and `data-hi` (shows the tag in the accent colour).
- Listen for taps: `el.addEventListener('apx:select', e => e.detail /* {code, index, name, icon} */)`.
- Lead values must be the client's real ranges or `[placeholders]`.

## Options
- `data-skew` / `skew` (`7`): the most the row leans, in degrees (0 to 14).
- CSS: `--apx-scr19-metal` (icon chrome, default `#c4c7cc`, keep it a neutral silver), `--apx-scr19-max` (1320px content width for the side margins).

## Tokens
`--apx-bg`, `--apx-surface` (tile glass), `--apx-ink`, `--apx-muted`, `--apx-accent` (tags, counter, rail, hover border and the small glint on the chrome), `--apx-line`, `--apx-font-display`, `--apx-font-text`, `--apx-motion`. All have fallbacks. A light `--apx-bg` gives pale glass tiles with the same black slabs and chrome icons. Dispatch `apx:tokens` after changing tokens at runtime.

## Accessibility and performance
Tiles are real buttons with real names and values; the canvas is `aria-hidden`; the counter and rail are decorative. Focus on a tile lifts its icon just like hover.
One WebGL context and one shader for every icon. Each visible tile gets its own square of the canvas (three draws: slab, soft shadow, chrome icon). Shapes are built once (about 44k vertices for all 33). The render loop runs only while the section is on screen and the tab is visible. Pixel ratio is capped (1.75 desktop, 1.5 phones). The pin is CSS sticky and is kept on phones because it is cheap and it is the effect.
Reduced motion / motion 0: no pin, no lean and no sway. The row becomes a normal sideways scroller (swipe or trackpad, with snap points) and the icons are redrawn only when you move it. No WebGL: each tile shows a flat line drawing of its icon.
DOM motion uses transform / opacity only. Tested at 390px with no sideways page scroll.

## Changed from the original (Frame by Frame, `#gallery`)
The original used three.js (RoomEnvironment, RoundedBox, SVGLoader, TubeGeometry) with a fixed full-window canvas and GSAP. This version rebuilds all of it in plain WebGL: an SVG path reader (with arcs and curves), a rounded slab, mitred chrome tubes with round joints, a studio-light reflection model in the shader, and a soft contact shadow under each icon. The icons now lean with the row (the original drew them upright inside leaning tiles). Hover now lifts the icon, turns it toward the pointer and adds a glint. Taps spin the icon once and fire an event instead of opening a fixed drawer. The canvas lives inside the section instead of over the whole page.
