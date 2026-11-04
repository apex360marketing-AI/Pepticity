---
name: 3d-asset-pipeline
description: Bring authored or generated 3D into APEX pages at production weight — Blender/Spline/Higgsfield GLB export rules, gltf-transform optimisation (Meshopt/Draco geometry, KTX2/WebP textures), three.js loaders with the right decoders, APEX chrome/onyx material overrides, per-device budgets and video/still fallbacks, Gaussian splats with Spark, and WebGPU (TSL) with automatic WebGL fallback. Use whenever a page needs a real model, product, scanned scene, splat, .glb/.gltf/.spz file, "photo-real 3D", WebGPU, or a 3D asset is too heavy or slow.
---

# 3D asset pipeline

`threejs-real-3d` builds 3D from code (extruded SVG icons, hero objects). This skill covers 3D that arrives as **files**: models, scans and splats. These are roadmap items 11 (next-gen 3D, WebGPU) and 12 (Gaussian splats). The owner's decision #8 applies: full 3D on capable devices, and a smooth video or still fallback on older phones.

## 1. Sources (licence first)
- **Blender:** File → Export → glTF 2.0 (.glb). Apply transforms, use +Y up and metres, Principled BSDF only, and bake AO and lighting detail into textures. Name meshes (you will target them in code).
- **Spline:** export glTF, not the Spline runtime (heavy, and it adds a dependency).
- **Generated:** the Higgsfield MCP `generate_3d` turns an image into a GLB. Always run it through this pipeline, and check the topology and UVs in a screenshot.
- **Scans/splats:** Polycam, Scaniverse, Luma, Postshot → export `.spz` (compressed) or `.ply`.
- Only use owned, CC0 or properly licensed assets. Record the source and licence in the module's `notes.md`. Never use ripped game or brand models.

## 2. Optimise (measure every step; sometimes output grows)
```bash
npx @gltf-transform/cli@4.5.1 inspect in.glb                       # triangles, textures, VRAM
npx @gltf-transform/cli@4.5.1 optimize in.glb out.glb \
  --compress meshopt --texture-compress webp --texture-size 2048    # default choice for the web
npx @gltf-transform/cli@4.5.1 optimize in.glb out-ktx2.glb \
  --compress meshopt --texture-compress ktx2 --texture-size 2048    # lower GPU memory; needs KTX-Software `toktx` on PATH
npx @gltf-transform/cli@4.5.1 optimize in.glb out-m.glb --texture-size 1024 --simplify-ratio .5   # mobile tier
```
- **Meshopt** is the default (it compresses animation too). Use Draco (`--compress draco`) only for static meshes when it measures smaller.
- **Textures:** WebP/AVIF for download size, KTX2 when phones stutter or run out of memory.
- Keep `--simplify` errors invisible. Compare before/after screenshots at hero size.

**Budgets per hero asset:**

| | Desktop | Phone |
|---|---|---|
| File (compressed) | ≤ 1.5 MB | ≤ 600 KB |
| Triangles | ≤ 150k | ≤ 50k |
| Textures | ≤ 2048² | ≤ 1024² |
| Draw calls | ≤ 50 | ≤ 25 |
| Splats | ≤ 2M | ≤ 500k (or the video fallback) |

## 3. Load (three@0.160.0, matching the existing import map)
```js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
const CDN = 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/';
const manager = new THREE.LoadingManager();                  // drives a REAL progress loader (page-transitions)
const loader = new GLTFLoader(manager)
  .setDRACOLoader(new DRACOLoader().setDecoderPath(CDN + 'draco/gltf/'))
  .setKTX2Loader(new KTX2Loader().setTranscoderPath(CDN + 'basis/').detectSupport(renderer))
  .setMeshoptDecoder(MeshoptDecoder);
const gltf = await loader.loadAsync(isPhone ? 'hero-m.glb' : 'hero.glb');
gltf.scene.traverse(o => { if (!o.isMesh) return;            // APEX look: override the exported materials
  if (/chrome|metal/i.test(o.name)) o.material = new THREE.MeshPhysicalMaterial({ color: 0xdfe3ea, metalness: 1, roughness: .16, clearcoat: 1 });
  if (/body|base/i.test(o.name))    o.material = new THREE.MeshStandardMaterial({ color: 0x0d0e10, metalness: .2, roughness: .55 });
});
```
- Environment reflections come from PMREM `RoomEnvironment` (see `threejs-real-3d`). Use no HDR files unless they're licensed and ≤ 1 MB.
- ONE renderer per page. Dispose geometry, materials and textures on `destroy()`.
- Device tier: `isPhone = matchMedia('(max-width: 900px)').matches || navigator.hardwareConcurrency <= 4`. For the old-phone tier, skip WebGL entirely and play a muted, looping `playsinline` video (≤ 1.5 MB, webm + mp4) rendered from the same scene, or a still.

## 4. Gaussian splats (premium add-on)
Spark (`@sparkjsdev/spark@2.3.0`, MIT) renders splats inside three.js, but **it needs three ≥ 0.180**. Splat pages therefore use their own import map with `three@0.185.1`; don't mix versions on one page.
```html
<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js",
 "@sparkjsdev/spark":"https://cdn.jsdelivr.net/npm/@sparkjsdev/spark@2.3.0/dist/spark.module.js"}}</script>
<script type="module">
import * as THREE from 'three'; import { SplatMesh } from '@sparkjsdev/spark';
const splat = new SplatMesh({ url: 'scene.spz' }); splat.quaternion.set(1, 0, 0, 0); scene.add(splat);   // most captures arrive upside-down
</script>
```
Move the camera along a scroll-scrubbed spline path (a "scan fly-through"). Keep the movement slow (the Weight personality); splats break up when viewed off their capture path. Check the current API at sparkjs.dev, since 2.x added streaming LoD.

## 5. WebGPU (only when WebGL can't do it)
Use it for compute-heavy work such as 100k+ GPU particles, fluid simulation or heavy post-processing. On `three@0.185.1`:
```js
import * as THREE from 'three/webgpu';  import { color, uniform, mix, uv } from 'three/tsl';
const renderer = new THREE.WebGPURenderer({ antialias: true });  await renderer.init();   // falls back to WebGL2 automatically
```
Write shaders in TSL (it compiles to WGSL or GLSL), not raw WGSL. Existing GLSL `ShaderMaterial` code must be ported to TSL. Test both paths: WebGPU in Chrome, and the fallback with `navigator.gpu` deleted.

## Do / don't
- DO keep one dramatic object per hero, with materials from the APEX palette (chrome, platinum, onyx, matte black). No gold metals, no green glass.
- DO lazy-load models when their section approaches (IntersectionObserver with `rootMargin:'50%'`), except the hero.
- DON'T ship a raw export. DON'T autoplay heavy splats on phones. DON'T create a second WebGL context for a model inside an icon grid.

## Verify (Playwright, `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` with swiftshader flags)
- `gltf-transform inspect out.glb` numbers are within budget; record them in `notes.md`.
- The page loads with no `pageerror`; `renderer.info.render.triangles` and `.calls` are within budget; `renderer.info.memory` doesn't grow over repeated mount/destroy.
- Canvas pixels change over 2s and with the pointer. With `getContext` forced to null, the video/still fallback shows.
- Mobile context (390×844, `isMobile`): the mobile asset loads (check the request URL).
- Screenshot the hero and LOOK at it: reflections read as metal, there are no faceted normals or black materials, and the model is not tiny or clipped.
- Software GL is slow here, so frame-time numbers are indicative only. Say so.
