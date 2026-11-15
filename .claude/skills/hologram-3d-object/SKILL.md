---
name: hologram-3d-object
description: Turn a 3D logo, letter or object (APEX FLARE CUT A, the PEPTICITY P, a vial, a globe) into a REAL-looking live hologram in three.js - projected light, fresnel-bright edges with a see-through body, fine scanlines, controlled flicker and glitch, a projector base with a light cone, dust in the beam, and bloom - that stays crisp and premium, never a cheap blue sci-fi filter. Use whenever the owner asks for a hologram of a logo or object, a "holographic" version, a projected mark, or a hologram on a desk, card or hero. For hologram UI panels and screens use holo-glass-ui; for the materials use chrome-material / uv-material.
---

# HOLOGRAM OF A 3D OBJECT

Pair with: `holo-glass-ui` (the five hologram signals and readability), `chrome-material` (when the
hologram sits beside or is projected from real chrome), `threejs-real-3d` (import map, extrusion, slots),
`anti-slop-gate` (no cheap sci-fi). Geometry for the APEX A: `Apex_Agents_Bots: design/logo/apex-studio/marks.json`
(build_logo.py: FLARE CUT); for the PEPTICITY P: `Apex_Agents_Bots: design/logo/pepticity-flarecut/marks.json`.

## 1. What makes it read as a hologram (all six)
1. **Light, not material**: every layer `AdditiveBlending`, `depthWrite: false`, `transparent: true`,
   `toneMapped: false`. Body nearly invisible face-on; edges bright.
2. **Fresnel**: alpha and brightness = `pow(1 - |dot(N, V)|, 2.2)`; faces facing you are 6-15% visible,
   grazing faces and silhouettes 100%.
3. **Scanlines in object space or screen space**: period 3-4 px on screen, contrast 10-20%, drifting upward
   0.3-0.6 lines/s. Plus one brighter "scan band" sweeping up the object every 4-6 s.
4. **Edges drawn as light**: `EdgesGeometry(geo, 25)` lines in the hologram colour at 0.9 opacity, plus a
   second copy scaled 1.004 at 0.25 for a soft double edge.
5. **Projection**: a projector disc/slit under the object (emissive ring), a light CONE (open cylinder,
   gradient alpha from 0.18 at the base to 0 at the top, additive), dust particles drifting in the cone, and a
   soft light pool on the surface below.
6. **Instability, controlled**: flicker = `1 - 0.04*(sin(t*31)*sin(t*7.3)>0.6 ? 1 : 0)`; a glitch every
   6-10 s for 120-200 ms: 2-3 horizontal slices offset 1-3% sideways + slight RGB split. Never strobing.

## 2. Hologram shader (copy and recolour)
```js
const holoMat = (color = new THREE.Color(0xcfe9ff)) => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false,
  uniforms: { uT: { value: 0 }, uColor: { value: color }, uGlitch: { value: 0 }, uBand: { value: 0 } },
  vertexShader: `
    uniform float uT, uGlitch; varying vec3 vN, vV, vW;
    void main(){
      vec3 p = position;
      float slice = step(.92, fract(sin(floor(p.y*1.7 + uT*20.)*91.7)*437.5));
      p.x += uGlitch * slice * .06 * sin(uT*90.);
      vec4 w = modelMatrix * vec4(p,1.); vW = w.xyz;
      vN = normalize(normalMatrix * normal); vV = normalize(-(viewMatrix*w).xyz);
      gl_Position = projectionMatrix * viewMatrix * w; }`,
  fragmentShader: `
    uniform float uT, uBand; uniform vec3 uColor; varying vec3 vN, vV, vW;
    void main(){
      float fr = pow(1. - abs(dot(normalize(vN), normalize(vV))), 2.2);
      float scan = .85 + .15 * sin(gl_FragCoord.y * 1.9 - uT * 3.);
      float band = smoothstep(.0, .08, .08 - abs(fract(vW.y*.12 - uT*.2) - .5));
      float flick = 1. - .04 * step(.6, sin(uT*31.)*sin(uT*7.3));
      float a = (.08 + fr * .92) * scan * flick + band * .35;
      gl_FragColor = vec4(uColor * a * 1.4, a); }` });
```
Draw the solid with `holoMat()`, then the edges with `LineBasicMaterial` (additive) on top. Animate `uT` with
clock time; set `uGlitch` to 1 for ~150 ms on a random 6-10 s timer.

## 3. Bloom (it is what sells "light")
```js
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(w, h), 0.9, 0.5, 0.0));   // strength, radius, threshold
composer.addPass(new OutputPass());
```
Keep the canvas background transparent only if no bloom; with bloom render on the page's ground colour.

## 4. Colour (per brand, ask if unsure)
- APEX default: platinum-white light with a faint ice tint `#cfe9ff`, edges `#eef6ff`, a tiny chartreuse
  glint `#d4ff3a` only on the scan band if the page uses chartreuse. Never saturated cyan floods.
- PEPTICITY: the ONE blue `#2a78ff` for the cone and band, core `#cfe6ff` for edges and body.
- Gold hologram (APEX DESK): `#f0e6c7` body, `#fef9e8` edges, bronze `#a4845d` cone.

## 5. Motion
Object turns slowly (one turn per 10-14 s) or rests at 12-15 degrees with a sway; bobs 0.5-1% of its height
on a 6-8 s sine; tilts toward the pointer (damped). Reduced motion: still pose, no flicker, no glitch,
static scanlines.

## 6. Anti-slop rules
- No full-screen blue tint, no grid floor, no "HUD" boxes, no lens-flare stickers.
- The logo shape must stay exact and readable at rest (edges carry it).
- One hologram colour + white. Dark, near-neutral ground.

## 7. Check before showing
Render at 1440 and 390, rest and mid-glitch; Read the shots. Silhouette edges bright and crisp, body
see-through (background visible through faces), scanlines visible on zoom but not over text, bloom soft
not blown (no white blobs larger than the edge width ×4). Fallback still image when WebGL is off.
