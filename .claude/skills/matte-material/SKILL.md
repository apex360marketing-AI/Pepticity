---
name: matte-material
description: The owner's MATTE finishes - matte gunmetal, matte black, matte grey (the PEPTICITY STUDIO lettering faces, the dark grey chevron, the owner's BLACK image wall) - for three.js, CSS and Higgsfield. Soft, velvety, brushed, low shine, lit by wide soft light and real shadows, never glossy and never flat dead grey. Use whenever the owner says "matte", "matte black", "gunmetal", "satin", "brushed", "not shiny", or when a face, card, background or letter must sit quietly next to chrome.
---

# MATTE (owner-approved values)

**Source of truth:**
- PEPTICITY STUDIO lettering (approved 29 Oct): `Pepticity/brand/font/type3d-engine.js` lines 40-75 (stage + materials),
  "matte gunmetal faces ... a hairline of light on every edge (edge opacity 0.68)".
- The owner's BLACK image (Pepticity CLAUDE.md): wall `#323232`, metal runs `#080807` to `#8E8D85`.
- A = dark matte grey chevron `0x55544f`.

## 1. What matte is (and is not)
- Matte = light is SCATTERED: wide soft highlights, gentle falloff, the form reads from shading and shadow,
  not from reflections. Roughness 0.45-0.8.
- It is NOT chrome turned dark (that is gunmetal chrome, see `chrome-material`), and NOT flat CSS grey
  (no form, looks cheap). A matte object still needs light direction, a soft highlight and a contact shadow.
- Matte next to chrome is the luxury pairing: matte face + chrome or lit edge, matte card + chrome type.

## 2. three.js materials (copy exactly)
```js
// brushed texture: a canvas of fine horizontal noise streaks (see brushedTexture() in type3d-engine.js), repeat ~ (4,1)
gunmetal: new THREE.MeshPhysicalMaterial({ color: 0x7a7b80, metalness: 0.86, roughness: 0.52, roughnessMap: brushed, map: brushed }),
chevron:  new THREE.MeshPhysicalMaterial({ color: 0x55544f, metalness: 0.6,  roughness: 0.48, roughnessMap: brushed, map: brushed, envMapIntensity: 0.5 }),
matteBlack: new THREE.MeshPhysicalMaterial({ color: 0x0b0b0c, metalness: 0.15, roughness: 0.55, clearcoat: 0.5, clearcoatRoughness: 0.35 }),
softTouch:  new THREE.MeshPhysicalMaterial({ color: 0x1a1a1c, metalness: 0, roughness: 0.78, sheen: 0.4, sheenColor: 0x3a3a40, sheenRoughness: 0.8 }),
edge: new THREE.LineBasicMaterial({ color: 0xdcd6ff, transparent: true, opacity: 0.68, blending: THREE.AdditiveBlending, depthWrite: false }),
```
Hairline edge light: `new THREE.EdgesGeometry(geo, 30)` drawn with `edge` on the outer rim. It is what makes
matte letters read on a black page.

## 3. Light for matte (different from chrome)
```js
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.92;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer) + 3-4 white strips at k 7, 0.03).texture;
const key = new THREE.DirectionalLight(0xffffff, 1.9); key.position.set(-3, 4, 5); key.castShadow = true;
const fill = new THREE.HemisphereLight(0xe8eaf0, 0x0c0a12, 0.22);
// optional UV rim: new THREE.PointLight(0x7a5cff, 0.45, 6, 2) low and behind (see uv-material)
```
- Matte needs a KEY LIGHT and SHADOWS (wall `#323232`, roughness 0.97). Without a shadow it floats and goes flat.
- Brushed maps give the fine grain; without them large matte faces look like plastic.

## 4. CSS matte surfaces
```css
.matte{background:#141416;background-image:
  radial-gradient(120% 80% at 30% 0%,rgba(255,255,255,.06),transparent 60%),
  url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 .05 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 20px 40px -24px #000}
```
Grain (3-6% noise) + one soft top light + an inner top hairline. No glossy diagonal gradients.

## 5. Ramp (owner's BLACK image)
`#080807` deepest · `#1a1a19` shade · `#323232` wall · `#5e5d58` body · `#8E8D85` lit edge. Warm-neutral,
never blue-grey, never pure #000 on large areas.

## 6. Higgsfield words
"matte gunmetal, soft brushed metal, velvety low sheen, soft wide studio light, gentle contact shadow,
charcoal wall #323232, no gloss, no mirror reflections".

## 7. Check
- Render; the face must show a smooth light-to-shade gradient (not a single flat value) and a visible soft shadow.
- Pixel test: matte face luma spread 30-170, fewer than 1% pixels > 235 (no chrome streaks on the matte part).
- Edges: the 0.68 hairline is visible at 390 px wide.
