---
name: chrome-material
description: The owner's REAL CHROME, exactly as approved in APEX STUDIO (FLARE CUT, 01 PLATINUM CHROME, "chosen finish") - a true mirror metal in a dark studio with hard white softbox strips, so it shows deep blacks AND hot whites with crisp streaks. Use for EVERY chrome, platinum, silver, mirror, polished-metal, gunmetal-chrome or gold-chrome object, logo, letter or icon (three.js, CSS chrome type, SVG, Higgsfield prompts), and whenever the owner says "chrome", "the chrome", "mirror", "polished", "platinum", "that's not chrome". Read BEFORE touching any metal.
---

# CHROME (owner-approved; the one and only recipe)

**Source of truth (Read these images first, every time):**
- `Apex_Agents_Bots: design/references/pepticity-flarecut/01-flare-cut-three-finishes.jpg` (01 PLATINUM CHROME = the chosen finish)
- `Apex_Agents_Bots: design/references/pepticity-flarecut/02-flare-cut-platinum-3d.jpg`
- Code that made it: `Apex_Agents_Bots: design/logo/apex-studio/board/template.html` (studio room lines 504-546) and
  `Apex_Agents_Bots: design/logo/pepticity-flarecut/core.src.html` (same room, "unchanged").

**What went wrong on 15 Nov 2026 (never again):** the PEPTICITY BLUE logo was "chrome" with a dimmed
room, a tinted dark grey face (0x2a2f38..0x4a5262), coloured softboxes and a gunmetal room sphere. Result:
flat cream/grey gradients, no blacks, no streaks. The owner: "You completely got rid of the Chrome ... That is
not Chrome." Chrome is NOT a colour you paint on. Chrome is a MIRROR: all its look comes from what it reflects.

## 1. The five laws of chrome
1. **Mirror material, neutral colour.** `metalness: 1`, `roughness` 0.05-0.2 (face) and 0.06-0.08 (edges).
   Base colour near-white neutral (0xdcdfe3 .. 0xf4f5f7). NEVER a dark or tinted base colour: that is gunmetal
   or plastic, not chrome.
2. **Dark room, hard bright strips.** The environment is a near-black room (0x1b1c1f) with a FEW small, very
   bright (k 3-14, HDR) white softbox boxes. The black room gives the blacks; the strips give the white streaks.
   A bright or grey room = washed-out grey chrome. A coloured room = tinted plastic.
3. **Contrast is the test.** On screen a chrome face must contain BOTH near-black (luma < 25) and near-white
   (luma > 235) pixels, with hard-edged bands between them. No blacks or no whites = not chrome.
4. **Colour comes only from small accents,** never from the metal or the room: a beam, a gold core light, a
   thin coloured strip. Gold-chrome is a *material* swap (see 3), not a tinted room.
5. **Exposure 1.05, ACES filmic, sRGB output.** Do not "fix" chrome by dimming exposure or the room.

## 2. The studio room (copy exactly)
```js
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const pmrem = new THREE.PMREMGenerator(renderer);
const room = new THREE.Scene();
room.add(new THREE.Mesh(new THREE.SphereGeometry(30, 32, 16), new THREE.MeshBasicMaterial({ color: 0x1b1c1f, side: THREE.BackSide })));
const box = (x, y, z, w, h, d, k) => { const m = new THREE.MeshBasicMaterial({ color: 0xffffff }); m.color.setScalar(k);
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.lookAt(0, 0, 0); room.add(b); };
box(0, 14, 6, 14, 14, .4, 5);      // big overhead softbox
box(-12, 2, 6, .8, 16, .8, 14);    // left strip
box(12, 4, 2, .6, 14, .6, 10);     // right strip
box(0, 7, 20, 22, 5, .4, 3.2);     // front key band (what the faces see)
box(-4, -3, 21, 9, 1.2, .4, 6);    // front hairline strip: the sharp chrome streak
box(0, -9, 14, 22, 3, .4, 1.4);    // low front sweep
box(6, 2, -14, 8, 10, .4, 1.6);    // back fill
// broad flat faces (a P, a wordmark) also need: box(0, 2, 24, 34, 20, .4, 1.15) + box(-14,-6,16,10,12,.4,2.2) + box(14,-4,16,8,12,.4,1.8)
const envRT = pmrem.fromScene(room, 0.02); pmrem.dispose();
scene.environment = envRT.texture;   // on EVERY scene with metal
```
Light sweep on a still object: rotate `scene.environmentRotation.y` slowly (±0.9 rad). That moves the streaks
across the metal without moving the object. Never sweep by changing room colours.

## 3. The approved metals (face = flat caps, edge = sides + bevels)
| finish | face | edge | note |
|---|---|---|---|
| **PLATINUM CHROME (chosen)** | `0xdcdfe3` r 0.20 | `0xebedf0` r 0.08 | cool near-neutral |
| MIRROR CHROME | `0xf4f5f7` r 0.05-0.06 | same | brightest, most streaky |
| GOLD CHROME (owner's liquid gold) | `0xe9d4a6` r 0.20 | `0xf3e3bd` r 0.08 | low chroma, see `liquid-chrome-gold` |
| GUNMETAL CHROME | `0x50565e` r 0.30 envMapIntensity 0.8 | `0x737a83` r 0.17 envMapIntensity 0.88 | smoky steel, still a mirror |
All `MeshPhysicalMaterial({ metalness: 1, ... })`. Mixing chrome colours = use different finishes on
different PARTS (face platinum, edge gold, a gold core layer), never a blended tint.

**Black chrome / smoked glass over chrome:** keep the platinum mirror underneath, add a thin smoked
clearcoat layer on top (separate slightly larger shell, `MeshPhysicalMaterial({ color: 0x050506, metalness: 0,
roughness: 0.05, transmission: 0.6-0.8, thickness: 0.5, clearcoat: 1 })`) or lower face `envMapIntensity` to
0.55-0.7 with colour unchanged. The streaks must still go white-hot. If it reads grey, it is wrong.

**Colour shift by angle (the owner's "reflects a different colour"):** add `iridescence: 0.3-0.6,
iridescenceIOR: 1.3, iridescenceThicknessRange: [200, 600]` to the platinum face, OR place ONE small coloured
strip (blue #2a78ff at k 4-6, or warm gold #ffe9c4 at k 5) among the white strips. Keep the room black and the
other strips white so it stays chrome.

## 4. Geometry that makes chrome read
- Bevel every edge (bevelThickness ~1/7 of depth, bevelSize 0.7×, 4-6 segments) and use creased normals
  (`toCreasedNormals(g, Math.PI/4.5)`), so edges catch the strips as thin bright lines.
- Depth 7 for an 82-unit mark. Thin flat slabs look like paper.
- One solid piece. Layer seams draw unwanted lines.

## 5. CSS chrome type (when not WebGL)
```css
.chrome{background:linear-gradient(180deg,#fff 0%,#dfe3e8 38%,#8a9099 52%,#eef0f3 70%,#b8bec6 100%);
  -webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 2px 0 rgba(0,0,0,.85))}
```
The hard drop at 52% is the horizon line that makes it chrome. A smooth grey ramp is NOT chrome.

## 6. Higgsfield prompt words
"polished mirror chrome, black studio with hard white softbox strip reflections, deep black and hot white
bands, crisp specular streaks, product photography, no tint" + the reference image as image reference.

## 7. Check before showing (mandatory)
1. Render at rest and mid-turn; Read the screenshots beside `02-flare-cut-platinum-3d.jpg`.
2. Pixel test on the metal: `python3 -c` with Pillow: inside the mark's mask, % luma<25 must be >= 8% and
   % luma>235 must be >= 3%. Fail = not chrome. Mid-grey mush (most pixels 90-180) = fail.
3. No pixel cast: chroma of metal pixels stays low unless it is a declared gold-chrome or accent.
4. Side by side with the reference in the message to the owner.
