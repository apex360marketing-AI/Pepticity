---
name: webgpu-tsl-shaders
description: Build GPU hero effects with three.js WebGPURenderer and TSL (Three Shading Language), which falls back automatically to WebGL2. Covers `await renderer.init()`, node materials, GPU compute particles with instancedArray, poster and canvas fallbacks, loading through an import map that passes the artifact CSP (three@0.186.1 from jsDelivr/unpkg/cdnjs), and the LCP-safe boot order. Use when asked for "WebGPU", "TSL", "compute shader particles", "a million particles", "node material", "GPU particles hero", "next-gen 3D", or when a raw-WebGL hero effect needs to scale past ~50k particles.
---

# WebGPU + TSL shaders (three r186)

Verified: `three@0.186.1` (npm, published 2026-09-24). It exposes `three/webgpu` → `build/three.webgpu.js` and `three/tsl` → `build/three.tsl.js`. The house skills `threejs-real-3d` (r160, WebGLRenderer, materials) and `webgl-shader-backgrounds` (raw GLSL full-screen) still own those cases. Use this skill only when you need compute or node materials.

**Project check first.** The Pepticity template brief says "don't add other libraries; write canvas/WebGL yourself". In those folders, use raw WebGL or the `helix.js` Canvas2D engine and do NOT add three. Use three/WebGPU only in the Next.js app or in a standalone artifact where libraries are allowed.

## 1. Loading under the artifact CSP
Artifact scripts may come only from `cdn.jsdelivr.net/npm/`, `unpkg.com` or `cdnjs.cloudflare.com`, pinned to an exact version at least two weeks old. `three.tsl.js` imports `three/webgpu` internally, so map all three specifiers:
```html
<script type="importmap">
{ "imports": {
  "three":         "https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.webgpu.js",
  "three/webgpu":  "https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.webgpu.js",
  "three/tsl":     "https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.tsl.js",
  "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.186.1/examples/jsm/"
} }
</script>
```
The container's CDNs may return 403 in local tests. Map to `node_modules/three/build/` over `file://`, launch Chromium with `--allow-file-access-from-files`, and swap back before publishing. In Next.js, use `npm i three@0.186.1` and `import * as THREE from 'three/webgpu'` inside a `'use client'` component that loads with `dynamic(() => import(...), { ssr: false })`.

Weight: r186 ships no `.min` WebGPU build. `three.webgpu.js` is 2.28 MB raw and **444 KB gzipped** (measured), which is 2.6× the whole 170 KB gz page budget. jsDelivr's auto-minified `…/build/three.webgpu.min.js` is smaller but still several times the budget. It must never be on the critical path (see section 4).

## 2. Renderer with fallback
```js
import * as THREE from 'three/webgpu';
import { Fn, uniform, instancedArray, instanceIndex, hash, vec3, vec4, float, time, sin, mix, color, uv, length, smoothstep } from 'three/tsl';

const canvas = document.querySelector('.hero-gpu');
const renderer = new THREE.WebGPURenderer({ canvas, antialias: false, alpha: true });  // add forceWebGL:true to test the fallback
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
const ok = await renderer.init().then(() => true, () => false);   // REQUIRED before compute() or the first render
if (!ok) showPoster();                                // no WebGPU and no WebGL2 → keep the poster, build nothing below
const isWebGPU = ok && renderer.backend.isWebGPUBackend === true;   // tier quality on this
```
- `WebGPURenderer` picks WebGPU when `navigator.gpu` is available and silently uses its WebGL2 backend otherwise. The same TSL compiles to WGSL or GLSL. Compute on the WebGL2 backend runs through transform feedback and is far slower, so drop the particle count 8–16× when `!isWebGPU`.
- Use `renderer.setAnimationLoop(loop)`, not your own rAF, and set it to `null` when the canvas is off screen (IntersectionObserver) or the tab is hidden.

## 3. Compute particles (the pattern)
```js
const COUNT = isWebGPU ? (innerWidth < 900 ? 60_000 : 250_000) : 15_000;
const pos = instancedArray(COUNT, 'vec3'), vel = instancedArray(COUNT, 'vec3');
const uPointer = uniform(new THREE.Vector3()), uDelta = uniform(0);

const init = Fn(() => {                               // runs once on the GPU
  const i = instanceIndex.toFloat();
  pos.element(instanceIndex).assign(vec3(hash(i).sub(.5), hash(i.add(1)).sub(.5), hash(i.add(2)).sub(.5)).mul(6));
})().compute(COUNT);

const update = Fn(() => {                             // runs every frame
  const p = pos.element(instanceIndex), v = vel.element(instanceIndex);
  const toPointer = uPointer.sub(p), d = length(toPointer).max(.2);
  v.addAssign(toPointer.div(d.mul(d).mul(40)));       // soft attraction
  v.addAssign(vec3(sin(time.add(p.y)).mul(.002), .0015, 0)); // drift up, like solvent dust
  v.mulAssign(.96);                                   // damping keeps it calm, never frantic
  p.addAssign(v.mul(uDelta.mul(60)));
})().compute(COUNT);

const mat = new THREE.SpriteNodeMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
mat.positionNode = pos.toAttribute();
mat.scaleNode = float(.025);
const r = length(uv().sub(.5));
mat.colorNode = vec4(color('#ff5c70'), smoothstep(.5, .0, r).mul(.6));   // use page tokens, never gold/amber
const sprites = new THREE.Sprite(mat); sprites.count = COUNT; scene.add(sprites);

await renderer.computeAsync(init);
renderer.setAnimationLoop(() => { uDelta.value = Math.min(clock.getDelta(), 1 / 30); renderer.compute(update); renderer.render(scene, camera); });
```
- Feed pointer and scroll in through `uniform()`s from the one shared rAF or GSAP ticker. Never write uniforms inside `pointermove` (lerp them in the loop, like `premium-micro-interactions`).
- Scroll-scrub: `ScrollTrigger.create({ scrub: 1, onUpdate: s => uProgress.value = s.progress })`, then `mix()` between two target shapes in the compute node. Shapes can come from SVG path samples or the `helix.js` SHAPES arrays scaled up.
- Full-screen TSL backgrounds: `const m = new THREE.MeshBasicNodeMaterial(); m.colorNode = Fn(() => …)()` on a `PlaneGeometry(2,2)` with an orthographic camera.

## 4. Boot order (protects LCP and INP)
1. The HTML paints a **poster** in the canvas slot: a CSS gradient or a ≤60 KB AVIF of the effect's resting frame, with `aspect-ratio` set so CLS = 0.
2. After LCP plus idle, run `import('./gpu-hero.js')`. Use the `afterLCP()` helper from `perf-budget-cwv`, with a 3 s timeout.
3. When the first frame renders, cross-fade the canvas over the poster in 600 ms, then remove the poster.
4. Skip GPU entirely, and keep the poster, when any of these is true: `prefers-reduced-motion`, `navigator.connection?.saveData`, `navigator.hardwareConcurrency <= 4 && innerWidth < 900`, or `renderer.init()` throws.
5. Device-lost: `renderer.onDeviceLost = () => showPoster()`.

## 5. Quality bar
- One dramatic GPU moment per site, in the hero or one pinned scene, not three. Everything else stays CSS or GSAP.
- Hold 60 fps on an M1 or a mid-range Android at the chosen count. If frame time is over 12 ms for 30 consecutive frames, halve `COUNT` once (re-create the buffers) and log it.
- Additive particles on dark grounds clip to white quickly. Keep per-sprite alpha ≤ 0.6 and scale ≤ 0.03 world units.
- The effect must read as the brand (molecule, light or mark), not a generic galaxy. If it could sit on any SaaS site, redesign it.
- Register the effect as `BGD-NN` or `OBJ-NN` (weight: Heavy, motionSafe: true when the poster fallback exists).

## Verify
- Run Playwright twice: default (headless Chromium usually has no WebGPU, so it exercises the WebGL2 path) and with `--enable-unsafe-webgpu --enable-features=Vulkan` (may still fall back, so log `isWebGPU`).
- Check that `forceWebGL:true` renders identically in shape, if not in count.
- Check for no `pageerror`. The canvas pixel at the centre changes between t=1 s and t=2 s (`toDataURL` diff or screenshot diff).
- `reducedMotion:'reduce'`: the poster is visible and `three.webgpu.js` was never requested (check `page.on('request')`).
- LCP element is not the canvas or poster unless the poster is the designed hero image, and LCP is < 2.0 s.
- Say in the report that container GPU numbers are software-rendered and only indicative.
