---
name: uv-material
description: The owner's UV look - UV-black surfaces with a faint violet sheen (the sides of the approved PEPTICITY STUDIO lettering), blacklight / ultraviolet glow, UV edge light and UV rim lights - for three.js, CSS and Higgsfield. Use whenever the owner says "UV", "UV black", "ultraviolet", "blacklight", "violet sheen", or wants letters, cards or objects to glow like they are under a blacklight. Keeps it classy: a sheen and a rim, never a purple background.
---

# UV (owner-approved values)

**Source of truth:** PEPTICITY STUDIO lettering (approved 29 Oct 2026), `Pepticity/brand/font/type3d-engine.js`:
"UV-black sides with a faint violet sheen, a hairline of light on every edge (edge opacity 0.68)".
**Brand guard:** PEPTICITY store rule: no violet outside the menu-58 picture and the lettering's sides. APEX:
big purple areas are banned ("kid's website"). UV is a SHEEN, a RIM and an EDGE, never a fill.

## 1. Three UV layers
1. **UV-black material** (sides, backs, deep parts): almost black with a violet sheen that appears only at
   grazing angles.
2. **UV rim light**: one small violet point light low and behind, so silhouettes pick up a thin violet edge.
3. **UV edge glow**: additive hairline on outer edges, pale lavender, opacity ~0.68.

## 2. three.js (copy exactly)
```js
uv: new THREE.MeshPhysicalMaterial({ color: 0x0e0c14, metalness: 0.55, roughness: 0.32,
  sheen: 1, sheenColor: new THREE.Color(0x4b3b86), sheenRoughness: 0.35,
  clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: 0.7 }),
edge: new THREE.LineBasicMaterial({ color: 0xdcd6ff, transparent: true, opacity: 0.68, blending: THREE.AdditiveBlending, depthWrite: false }),
const rim = new THREE.PointLight(0x7a5cff, 0.45, 6, 2); rim.position.set(-2.2, -0.8, 1.2);   // low, behind-left
// usage: new THREE.Mesh(extrudeGeo, [faceMaterial, MAT.uv])  -> faces in gunmetal/chrome, sides in UV black
```
**Blacklight glow (emissive UV ink)** for a word or line that should "fluoresce":
```js
new THREE.MeshStandardMaterial({ color: 0x0b0a10, emissive: 0x8f7bff, emissiveIntensity: 0.6-1.2, toneMapped: false })
// + UnrealBloomPass(strength 0.6, radius 0.4, threshold 0.85) so ONLY the ink blooms
```
Fresnel violet sheen in a custom shader: `col += vec3(.29,.23,.53) * pow(1. - abs(dot(N, V)), 3.) * .6;`

## 3. CSS
```css
.uv-edge{box-shadow:0 0 0 1px rgba(220,214,255,.18),0 0 18px -6px rgba(122,92,255,.45)}
.uv-text{color:#0e0c14;-webkit-text-stroke:1px rgba(220,214,255,.68);text-shadow:0 0 10px rgba(122,92,255,.35)}
```
On black ground only. Keep violet alpha <= .45 and areas thin.

## 4. Palette
UV black `#0e0c14` · sheen `#4b3b86` · rim `#7a5cff` · edge `#dcd6ff` · fluoresce `#8f7bff`.
Where a page has ONE BLUE (#2a78ff, PEPTICITY store), UV may appear only on the lettering's sides; all other
light stays on the blue's hue.

## 5. Higgsfield words
"ultraviolet blacklight studio, UV-black surfaces with a faint violet sheen at the edges, thin lavender rim
light, deep black background, no purple haze, no neon signs".

## 6. Check
- Violet pixels (hue 255-290, chroma > 20) under 2% of the frame unless the owner asked for more.
- The sheen must be visible ONLY on grazing surfaces; a face-on surface stays near black.
- Edges readable at 390 px.
