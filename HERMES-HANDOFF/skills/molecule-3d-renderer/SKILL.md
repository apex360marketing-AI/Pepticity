---
name: molecule-3d-renderer
description: Render peptides and molecules on the web, either accurately (3Dmol.js 2.5.x or Mol* 5.x from real PDB/mmCIF data) or stylised (instanced spheres in three.js, or the zero-dependency Canvas2D engine in Pepticity's helix.js). Includes residue-sequence layout, real alpha-helix geometry (100° per residue, 1.5 Å rise, 3.6 residues per turn), lazy-loading, accessible text alternatives and a mandatory regulated-claims pass on every caption. Use when asked for "a 3D molecule", "peptide model", "protein viewer", "helix animation", "show the structure", "amino-acid chain", "molecular hero", "PDB viewer", or "make the science section 3D".
---

# Molecule 3D renderer

## Decide first: accurate or stylised?
| Need | Choose | Weight | Notes |
|---|---|---|---|
| A real structure people can rotate in Science/About | **3Dmol.js 2.5.5** (`build/3Dmol-min.js`, 538 KB raw) | Heavy | Simple API, PDB/mmCIF/SDF, cartoon and stick styles |
| Research-grade viewer, big assemblies, measurements | **Mol\* 5.13.1** (`build/viewer/molstar.js` 5.3 MB + `molstar.css`) | Very heavy | Only for a dedicated "explore the structure" view, behind a click |
| Hero or intro motion, brand storytelling | **helix.js** Canvas2D (0 KB of libraries, already in `/home/user/pepticity/src/`) | Light | Blendable shapes `line`/`helix`/`mark`, glow sprites, letters on nodes |
| Hundreds of atoms with real lighting in a hero | three.js `InstancedMesh` spheres + cylinder bonds | Medium–heavy | See `threejs-real-3d` for materials. Not allowed inside Pepticity template folders (the brief bans extra libraries) |

Default to stylised for marketing pages. Use accurate rendering only when the page claims scientific fidelity ("this is the structure"). Never mix: a stylised helix must not be captioned as a real structure.

## Real geometry (use these numbers, even when stylised)
- **Alpha helix:** 100° rotation per residue, so 3.6 residues per turn. Rise is 1.5 Å per residue, so pitch is 5.4 Å. The Cα radius is about 2.3 Å. Right-handed.
- **Extended chain / β-strand:** about 3.3–3.5 Å rise per residue, with alternating side chains (zig-zag ±~1 Å).
- **Cα–Cα distance:** 3.8 Å (trans peptide bond).
- **Cyclic peptide:** close the ring with the same 3.8 Å spacing. Distribute residues on a circle of radius `r = 3.8 / (2·sin(π/N))`.
```js
// Cα positions in Å; scale by `unit` for the screen
const helix = (n) => Array.from({ length: n }, (_, i) => {
  const a = i * 100 * Math.PI / 180;
  return [2.3 * Math.cos(a), 2.3 * Math.sin(a), (i - (n - 1) / 2) * 1.5];   // z = helix axis
});
const strand = (n) => Array.from({ length: n }, (_, i) => [(i - (n - 1) / 2) * 3.4, (i % 2 ? 1 : -1) * 0.9, 0]);
const ring = (n) => { const r = 3.8 / (2 * Math.sin(Math.PI / n));
  return Array.from({ length: n }, (_, i) => [r * Math.cos(2 * Math.PI * i / n), r * Math.sin(2 * Math.PI * i / n), 0]); };
```
`helix.js` uses r = 0.78 and rise = 0.36 (ratio 0.46, against a true 1.5/2.3 = 0.65) as a deliberate stylisation for legibility. When the page says "an alpha helix", raise rise/r to 0.65 or label the visual "illustrative".

## Residue-sequence layout (the readable layer)
Show the sequence as text, not only as nodes. It is the accessible alternative and the SEO text.
```html
<figure class="molecule" aria-labelledby="mol-cap">
  <canvas class="mol-canvas" aria-hidden="true"></canvas>
  <ol class="seq" aria-label="Residue sequence, 9 residues">
    <li data-i="0"><abbr title="Proline">P</abbr></li> <!-- …one li per residue, monospace, 1 ch wide -->
  </ol>
  <figcaption id="mol-cap">Illustrative model of a nine-residue chain folding into an alpha helix. Not to scale.</figcaption>
</figure>
```
- Group the sequence in blocks of 10 (`.seq li:nth-child(10n){margin-inline-end:1ch}`) and number the start of each line, which is the convention in every sequence viewer.
- Hovering or focusing a residue highlights its node, and hovering a node highlights its letter. Make the `li` focusable (`tabindex="0"`) only if it does something.
- Only use one-letter codes from the standard 20 amino acids for real sequences. A brand-word chain like P-E-P-T-I-C-I-T-Y must be labelled as a brand illustration, never presented as a real compound.

## Accurate: 3Dmol.js
```html
<div id="viewer" style="width:100%;aspect-ratio:4/3;position:relative" role="img" aria-label="[structure name], cartoon view"></div>
<button class="load-3d">View the 3D structure</button>
<script>
document.querySelector('.load-3d').addEventListener('click', async () => {
  await loadScript('https://cdn.jsdelivr.net/npm/3dmol@2.5.5/build/3Dmol-min.js');
  const v = $3Dmol.createViewer('viewer', { backgroundAlpha: 0, antialias: true });
  v.addModel(PDB_TEXT, 'pdb');                      // inline the file: artifact CSP blocks fetches to rcsb.org
  v.setStyle({}, { cartoon: { color: '#ff5c70', thickness: 0.4 } });   // page token, never gold/amber/green
  v.setStyle({ hetflag: true }, { stick: { radius: 0.15 } });
  v.zoomTo(); v.render();
}, { once: true });
</script>
```
- Do not use `v.spin()` by default, because an endless spin is the banned cliché. Offer a Rotate toggle (`aria-pressed`) and stop on `prefers-reduced-motion`.
- Viewers capture wheel and touch-drag, which traps page scroll, and phone users get stuck. Cover the viewer with a transparent "Tap to interact" overlay that is removed on click and restored on `pointerleave` or blur. Add a visible "Reset view" button (`v.zoomTo(); v.render()`).
- Helpers used above: `const loadScript = src => new Promise((ok, no) => document.head.append(Object.assign(document.createElement('script'), { src, onload: ok, onerror: no })));` (`loadCSS` is the same pattern with a `<link rel=stylesheet>`).

## Accurate: Mol*
```js
await loadCSS('https://cdn.jsdelivr.net/npm/molstar@5.13.1/build/viewer/molstar.css');
await loadScript('https://cdn.jsdelivr.net/npm/molstar@5.13.1/build/viewer/molstar.js');
const viewer = await molstar.Viewer.create('molstar', { layoutIsExpanded: false, layoutShowControls: false,
  layoutShowSequence: true, viewportShowExpand: false, collapseLeftPanel: true });
await viewer.loadStructureFromData(MMCIF_TEXT, 'mmcif');
```
Put it in its own view (`#science`) behind a button. At 5.3 MB it must never load on Home.

## Stylised: helix.js
```js
const { Helix, SHAPES, mix, ease, clamp } = window.PepHelix;
const h = new Helix(canvas, { scale: .16, dust: 90, accent: '255,92,112' });
Object.assign(h.state, { shape: SHAPES.line, spawn: 9, bonds: 8, letters: 1 });
ScrollTrigger.create({ trigger: '.science', start: 'top 70%', end: 'bottom 30%', scrub: 1,
  onUpdate: s => { h.state.shape = mix(SHAPES.line, SHAPES.helix, ease.inOut(clamp(s.progress * 1.4)));
                   h.state.yaw = s.progress * Math.PI * 1.5; h.render(1 / 60); } });
```
- Render only when visible (IntersectionObserver gate, as in `site.js`), and on the shared GSAP ticker, never with a private rAF.
- Motion means something: fold, close, align. It lands still, front-on. Never use idle spin.
- Add new shapes as arrays of `[x,y,z]` with the same length N, so `mix()` keeps working.

## Accessibility
- The canvas is `aria-hidden="true"`, and the meaning lives in the `<ol>` sequence plus the `<figcaption>`.
- An interactive viewer gets a text alternative of 2–3 sentences: what it is, the source (PDB ID or "illustrative"), and what the colours mean. Never convey information by colour alone. Pair colour with labels or a legend.
- Keyboard: arrow keys rotate 15°, `+`/`-` zoom, `0` resets, and a visible hint lists them. Focus ring on the viewer container.
- `prefers-reduced-motion`: show the static resting pose, with no scroll-scrub rotation.

## Compliance (mandatory)
Run every caption, label and tooltip through the `regulated-claims-check` skill before it ships. Molecule visuals invite mechanism claims:
- Do not say "binds receptors to repair…", "signals your body to…", "studied for…", "supports…", or anything implying an effect. Hedged research framing is the evidence regulators use.
- Do not put a named compound next to any outcome or body-system imagery. No syringes, vials being drawn or injection imagery.
- Safe layer: what the model shows (structure, residue count, source, "illustrative"), how the product is tested (identity, purity method), and who decides (a licensed clinician).

## Verify
- Stylised: screenshot at scroll progress 0, 0.5 and 1. Shapes differ, and nothing spins when idle for 3 s (two screenshots 1 s apart are identical at rest).
- Accurate: the library loads only after the click (`page.on('request')`). Render is non-blank (centre-pixel alpha > 0). Keyboard rotate changes the screenshot.
- axe: no violations on the figure. `figcaption` and the sequence text exist in the raw HTML.
- Paste the caption copy into a `regulated-claims-check` pass and attach its result.
