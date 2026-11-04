---
name: threejs-real-3d
description: Build REAL 3D ("4D" = 3D that moves through time and reacts to scroll and pointer) for APEX pages with three.js. Covers extruded, bevelled industry icons made from 24x24 SVG path strings, chrome/onyx/platinum materials with real reflections from a PMREM RoomEnvironment, a hero object that turns with scroll and tilts toward the pointer, and many 3D objects drawn by ONE renderer into many DOM slots (scissor/viewport). Use it whenever icons, logos, monograms or hero objects must be genuinely three-dimensional (not CSS shadows or fake tilt), or when asked for three.js, WebGL 3D icons, metal/glass/ceramic materials, or a 3D ring/grid of industry icons.
---

# Real 3D for APEX (three.js r160)

A working prototype that uses all of this code is at
`/tmp/claude-0/-home-user-Apex-Agents-Bots/f5f77d16-71d5-5266-8292-e551fb9458e6/scratchpad/3d/proto.html` (scratch copy, which may be gone). Everything you need is reproduced below.

Brand rules from CLAUDE.md and `apex-cinematic-design` still apply. Use no gold, yellow, amber, lime, green or blue/purple-led palettes. Metals are neutral: chrome, platinum and steel. Faces are onyx black or matte black. Grounds are dark. Use a single dramatic object per hero, not a pile of floating shapes.

## 1. Import map

An Artifact may only load scripts from jsDelivr, unpkg or cdnjs, pinned to an exact version. Everything else (icons, shaders, environment) is inlined.

**Production (Artifact):**
```html
<script type="importmap">
{ "imports": {
  "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
  "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
} }
</script>
```
**Local testing (this container, where the CDNs return 403).** The repo ships three 0.160.1, which has the same API as 0.160.0:
```html
<script type="importmap">
{ "imports": {
  "three": "file:///home/user/Apex_Agents_Bots/node_modules/three/build/three.module.js",
  "three/addons/": "file:///home/user/Apex_Agents_Bots/node_modules/three/examples/jsm/"
} }
</script>
```
ES modules over `file://` need Chromium's `--allow-file-access-from-files` flag (see the checklist). Before publishing, swap back to the CDN map.

```js
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';
```

## 2. SVG path to solid shapes (works for strokes AND fills)

Line icons such as `"M2 12L12 3l10 9 M5 10v11h14V10 M10 21v-6h4v6"` are strokes, and they cannot be extruded directly. `SVGLoader.pointsToStroke` returns a *flat triangle mesh* per sub-path. It cannot be bevelled and it does not union overlapping segments. TubeGeometry gives round "wire" icons with no flat face.

The robust approach is to rasterise the path with `Path2D` (round caps and joins), which unions everything, then contour the alpha with marching squares and nest the loops into `Shape`s with holes:

```js
function svgPathToShapes(d, { fill = false, stroke = 2, res = 12, pad = 3 } = {}) {
  const N = Math.round((24 + pad * 2) * res);
  const cv = document.createElement('canvas'); cv.width = cv.height = N;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.translate(pad * res, pad * res); ctx.scale(res, res);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.fillStyle = ctx.strokeStyle = '#fff';
  const p = new Path2D(d);
  if (fill) { ctx.fill(p, 'evenodd'); ctx.lineWidth = 1.1; ctx.stroke(p); } else { ctx.lineWidth = stroke; ctx.stroke(p); }
  const px = ctx.getImageData(0, 0, N, N).data;
  const v = new Float32Array(N * N); for (let i = 0; i < N * N; i++) v[i] = px[i * 4 + 3];
  const T = 127.5, pts = new Map(), segs = [], at = (x, y) => v[y * N + x];
  const key = (e, x, y) => e === 0 ? (y * N + x) * 2 : e === 2 ? ((y + 1) * N + x) * 2
                         : e === 3 ? (y * N + x) * 2 + 1 : (y * N + x + 1) * 2 + 1; // 0 top 1 right 2 bottom 3 left
  const point = (e, x, y, a, b, c, dd) => {
    const k = key(e, x, y); if (pts.has(k)) return k;
    const f = (p, q) => (T - p) / (q - p);
    pts.set(k, e === 0 ? [x + f(a, b), y] : e === 1 ? [x + 1, y + f(b, c)] : e === 2 ? [x + f(dd, c), y + 1] : [x, y + f(a, dd)]);
    return k;
  };
  const TABLE = { 1: [[3, 2]], 2: [[2, 1]], 3: [[3, 1]], 4: [[0, 1]], 6: [[0, 2]], 7: [[3, 0]], 8: [[3, 0]], 9: [[0, 2]], 11: [[0, 1]], 12: [[3, 1]], 13: [[2, 1]], 14: [[3, 2]] };
  for (let y = 0; y < N - 1; y++) for (let x = 0; x < N - 1; x++) {
    const a = at(x, y), b = at(x + 1, y), c = at(x + 1, y + 1), dd = at(x, y + 1);
    const idx = (a > T ? 8 : 0) | (b > T ? 4 : 0) | (c > T ? 2 : 0) | (dd > T ? 1 : 0);
    if (idx === 0 || idx === 15) continue;
    let list = TABLE[idx];
    if (idx === 5 || idx === 10) { const mid = (a + b + c + dd) / 4 > T; list = (idx === 5) === mid ? [[3, 0], [2, 1]] : [[3, 2], [0, 1]]; }
    for (const [e1, e2] of list) segs.push([point(e1, x, y, a, b, c, dd), point(e2, x, y, a, b, c, dd)]);
  }
  const byKey = new Map();
  segs.forEach((s, i) => s.forEach(k => (byKey.get(k) || byKey.set(k, []).get(k)).push(i)));
  const used = new Uint8Array(segs.length), loops = [];
  for (let i = 0; i < segs.length; i++) {
    if (used[i]) continue; used[i] = 1;
    const start = segs[i][0]; let cur = segs[i][1]; const loop = [pts.get(start)];
    while (cur !== start) {
      loop.push(pts.get(cur));
      const nxt = byKey.get(cur).find(j => !used[j]); if (nxt === undefined) break;
      used[nxt] = 1; cur = segs[nxt][0] === cur ? segs[nxt][1] : segs[nxt][0];
    }
    if (loop.length > 8) loops.push(rdpClosed(loop, 0.35));
  }
  const toV = ([x, y]) => new THREE.Vector2(x / res - pad - 12, -(y / res - pad - 12)); // centred, y up
  const polys = loops.map(l => l.map(toV)).map(pl => ({ pl, area: Math.abs(THREE.ShapeUtils.area(pl)) })).sort((m, n) => n.area - m.area);
  const shapes = [];
  polys.forEach((P, i) => {               // even nesting depth = solid, odd = hole of smallest container
    let depth = 0, parent = null;
    for (let j = 0; j < i; j++) if (inside(P.pl[0], polys[j].pl)) { depth++; parent = polys[j]; }
    if (depth % 2 === 0) shapes.push(P.shape = new THREE.Shape(P.pl));
    else if (parent && parent.shape) parent.shape.holes.push(new THREE.Path(P.pl));
  });
  return shapes;
}
function inside(pt, poly) { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a.y > pt.y) !== (b.y > pt.y) && pt.x < (b.x - a.x) * (pt.y - a.y) / (b.y - a.y) + a.x) c = !c; } return c; }
function rdpClosed(loop, eps) {
  const pts = loop.concat([loop[0]]), keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  let far = 0, fd = -1; for (let i = 1; i < pts.length - 1; i++) { const q = (pts[i][0] - pts[0][0]) ** 2 + (pts[i][1] - pts[0][1]) ** 2; if (q > fd) { fd = q; far = i; } }
  keep[far] = 1; const st = [[0, far], [far, pts.length - 1]];
  while (st.length) { const [s, e] = st.pop(), [ax, ay] = pts[s], [bx, by] = pts[e], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1e-9; let md = 0, mi = -1;
    for (let i = s + 1; i < e; i++) { const q = Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / L; if (q > md) { md = q; mi = i; } }
    if (md > eps && mi > 0) { keep[mi] = 1; st.push([s, mi], [mi, e]); } }
  return pts.slice(0, -1).filter((_, i) => keep[i]);
}
```
- Use `fill: true` for closed silhouettes (bolt, sparkle, monogram). Keep the default stroke mode for line icons.
- `res = 12` (12 px per SVG unit) is enough. It costs about 1 ms per icon. Build geometry once and cache it per icon key.
- Icon space is 24 units centred on 0. Use `mesh.scale.setScalar(0.1)` for an object about 2.4 units across.

## 3. Bevelled extrusion with face and edge material groups

```js
function extrudeIcon(shapes, { depth = 2.2, bevel = 0.5, segs = 5 } = {}) {
  let g = new THREE.ExtrudeGeometry(shapes, { depth, bevelEnabled: true, bevelThickness: bevel,
    bevelSize: bevel * 0.7, bevelOffset: -bevel * 0.35, bevelSegments: segs, curveSegments: 8, steps: 1 });
  g = toCreasedNormals(g, Math.PI / 4.5);   // smooth round strokes, crisp face/bevel crease
  g.computeBoundingBox(); const c = new THREE.Vector3(); g.boundingBox.getCenter(c); g.translate(-c.x, -c.y, -c.z);
  return g;
}
// ExtrudeGeometry groups: 0 = front/back faces, 1 = sides + bevel
const mesh = new THREE.Mesh(extrudeIcon(svgPathToShapes(d)), [MAT.blackFace, MAT.chromeEdge]);
```
The negative `bevelOffset` stops the bevel from swallowing thin strokes or closing small holes. For thin strokes (width 2) keep `bevel` at 0.6 or less. For a hero monogram use `depth 4.2, bevel 0.9, segs 8`.

## 4. Environment and materials (no HDR files)

```js
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
const pmrem = new THREE.PMREMGenerator(renderer);
const room = new RoomEnvironment(renderer);
// add HDR-bright "softbox" strips so chrome gets crisp product-shot highlights
const strip = new THREE.MeshBasicMaterial({ color: 0xffffff }); strip.color.setScalar(9);
[[-6, 4, 0, .35, 9], [6.5, 2, -2, .25, 8], [0, 9.5, 3, 7, .3]].forEach(([x, y, z, w, h]) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, w > 1 ? .3 : w), strip); m.position.set(x, y, z); room.add(m); });
const envRT = pmrem.fromScene(room, 0.035);
room.traverse(o => { o.geometry?.dispose(); o.material?.dispose(); }); pmrem.dispose();
scene.environment = envRT.texture;          // set on EVERY scene that draws metal

const MAT = {
  chromeEdge: new THREE.MeshPhysicalMaterial({ color: 0xf4f4f5, metalness: 1, roughness: 0.08 }),
  blackFace:  new THREE.MeshPhysicalMaterial({ color: 0x0b0b0c, metalness: 0.15, roughness: 0.55, clearcoat: 0.5, clearcoatRoughness: 0.35 }),
  onyxFace:   new THREE.MeshPhysicalMaterial({ color: 0x060607, metalness: 0, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.04 }),
  platFace:   new THREE.MeshPhysicalMaterial({ color: 0xd4d5d7, metalness: 1, roughness: 0.34 }),
  platEdge:   new THREE.MeshPhysicalMaterial({ color: 0xe9eaec, metalness: 1, roughness: 0.14 }),
  // ceramic: color 0xe9e6e1, metalness 0, roughness 0.35, clearcoat 1 | smoked glass: MeshPhysical transmission 1, thickness 1.5, roughness 0.08, color 0x2a2a2c
};
```
- Metal with no `scene.environment` renders black. Lights barely help metal, because reflections come from the environment.
- Keep metal colours neutral grey. A warm tint (#e6d9c0 and similar) reads as champagne or gold, which is off-brand.
- Transmission (glass) costs an extra render pass for each scene. Avoid it on mobile and in many-slot grids.

## 5. "4D" motion: time, scroll and pointer with damping

```js
const damp = (cur, tgt, lambda, dt) => cur + (tgt - cur) * (1 - Math.exp(-lambda * dt)); // frame-rate independent
const pointer = { x: 0, y: 0 };
addEventListener('pointermove', e => { pointer.x = e.clientX / innerWidth * 2 - 1; pointer.y = e.clientY / innerHeight * 2 - 1; }, { passive: true });
// hero: progress 0 at page top -> 1 when the slot has scrolled out
const prog = Math.min(1, Math.max(0, scrollY / Math.max(1, r.height + r.top + scrollY)));
const yaw = -0.38 + Math.sin(t * 0.35) * 0.14 + prog * Math.PI * 1.25 + pointer.x * 0.45;
st.ry = damp(st.ry, yaw, 4, dt); st.rx = damp(st.rx, pointer.y * 0.28, 4, dt);
mono.rotation.set(st.rx, st.ry, 0);
// generic section progress (0 entering bottom .. 1 leaving top)
const sectionProg = Math.min(1, Math.max(0, (H - r.top) / (H + r.height)));
```
- Clamp `dt` to between 0 and 1/15 s. rAF timestamps can be earlier than `performance.now()`, and a negative `dt` in `damp` blows rotations up to around 1e18.
- Hover on a DOM card: on `pointerenter` add `2π` to a spin target and damp toward it, so the icon does a coin turn. While hovering, tilt toward the local pointer and scale to 1.12.
- Ring band: put N icon holders at `(sin a·R, 0, cos a·R)` with `rotation.y = a` so they face outward. Rotate the ring by `-(t·0.12 + prog·2.2π)`. The icon facing the camera is `round(yaw/2π·N) mod N`, which can drive a DOM caption ("Facing you: Roofing"). Add `scene.fog` in the page background colour so the back of the ring recedes.
- Fit the ring to the slot's aspect: `dist = max(22, ringWidth / (2·tan(fov/2)·aspect) + R)`. Without this, a portrait (phone) slot crops the ring.

## 6. One renderer, many DOM slots (scissor)

Never create one WebGL context per icon. Browsers cap contexts at roughly 16 and drop the oldest. Use one fixed transparent canvas over the page, and give each DOM slot its own small scene and camera:

```html
<canvas id="gl" style="position:fixed;inset:0;width:100%;height:100%;z-index:2;pointer-events:none"></canvas>
<div class="slot" data-scene="icon" data-icon="roofing" data-mat="chrome" style="height:170px"></div>
```
```js
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, MOBILE ? 1.5 : 2)); renderer.setClearColor(0, 0); renderer.autoClear = false;
function frame(now) {
  raf = 0; const dt = Math.min(Math.max((now - last) / 1000, 0), 1 / 15); last = Math.max(last, now); if (!REDUCED) t += dt;
  const W = canvas.clientWidth, H = canvas.clientHeight; if (W !== rw || H !== rh) { rw = W; rh = H; renderer.setSize(W, H, false); }
  renderer.setScissorTest(false); renderer.clear(); renderer.setScissorTest(true);
  for (const s of slots) {
    if (!s.visible) continue;                                    // IntersectionObserver flag
    const r = s.el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > H || r.right < 0 || r.left > W) continue;
    s.update(dt, t, r);
    s.camera.aspect = r.width / r.height; s.camera.updateProjectionMatrix();
    const y = H - r.bottom;                                      // GL origin is bottom-left
    renderer.setViewport(r.left, y, r.width, r.height); renderer.setScissor(r.left, y, r.width, r.height);
    renderer.render(s.scene, s.camera);
  }
  if (!REDUCED && !document.hidden && slots.some(s => s.visible)) raf = requestAnimationFrame(frame);
}
```
- Share geometry and materials across slots through a cache. Call `renderer.compile(scene, camera)` for each slot at boot so the first scroll into a section doesn't hitch.
- The canvas sits above the cards but has `pointer-events:none`, so DOM hover still works. Nav stays above it (z-index 5).
- Leave room in the slot for motion. Anything that rotates past the slot's rect is cut hard by the scissor. Size the object to about 70% of the slot, and pull the camera back for orbits and rings.
- Alternative for a single hero: a canvas inside the hero only. Still use one renderer for the page if there is more than one 3D area.

## 7. Performance and lifecycle

- DPR is capped at 2, or 1.5 under 900px. Under 900px also use `bevelSegments` 3 (hero 4), avoid transmission, and keep at most about 15 visible meshes. The extruded icons are 2k to 8k triangles each.
- Pause: an IntersectionObserver per slot (rootMargin 80px) flips `visible`. The loop only re-arms while a slot is visible and `!document.hidden`. `visibilitychange` calls `kick()`.
- Reduced motion (`prefers-reduced-motion: reduce`): set a fixed pose, keep `t` frozen and ignore the pointer. Render **on demand** on scroll and resize, because the fixed canvas must still track its DOM slots.
- Teardown: `cancelAnimationFrame`, `io.disconnect()`, remove listeners, dispose every unique geometry and material, `envRT.dispose()`, `renderer.dispose()`, `renderer.forceContextLoss()`. Hook it to `pagehide` and to SPA unmount.
- `webglcontextlost`: call `preventDefault()`, tear down, then show the SVG fallback.

## 8. Fallbacks

Run a classic (non-module) script before the module:
```js
window.apexFallback = reason => { /* hide #gl; put <svg viewBox="0 0 24 24"><path d=...></svg> with a neutral
  linearGradient stroke into every [data-scene] slot */ };
setTimeout(() => { if (!window.__apex3dReady) apexFallback('timeout'); }, 6000); // CDN blocked / module failed
```
In the module, probe `canvas.getContext('webgl2') || getContext('webgl')`, wrap `new WebGLRenderer` in try/catch, call `apexFallback('no-webgl')` on failure, and set `window.__apex3dReady = true` on success. Keep the icon path strings in a shared plain `<script>` so the 3D builder and the SVG fallback use the same data. Support `?nogl` to force the fallback for testing.

## 9. Pitfalls

- `SVGLoader.createShapes` only works for *filled* paths. Line icons come out as nonsense slivers. Use the raster contour above.
- A closed fill such as the "A" plus its counter must be filled with `'evenodd'`, or the counter fills in.
- ExtrudeGeometry is non-indexed, so plain `computeVertexNormals` gives faceted strokes that show as stripes in chrome. Use `toCreasedNormals`.
- Bevel size larger than half the stroke width self-intersects and causes black speckles. Small holes (a door, a keyhole) disappear first.
- `scene.environmentRotation` doesn't exist in r160 (it was added in r162). To change where the reflections fall, rotate the object or move the strips.
- Each scene needs its own `environment`. Fog uses the page background colour, never transparent.
- Scroll lag: a fixed canvas redrawn in rAF can trail native scroll by one frame on slow devices. Keep objects inside generous slots and avoid hard-edged boxes around them.
- Don't use `preserveDrawingBuffer: true` for tests (it costs performance). Read back by drawing a frame and calling `drawImage(canvas)` in the same task (see the snapshot hook below).

## 10. Verification checklist (mandatory)

Launch Chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` with
`--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist --allow-file-access-from-files`.
Headless WebGL works with these flags. The renderer reports `ANGLE (… SwiftShader driver)`. SwiftShader is slow (1 to 8 fps on a busy box), so **wait for frames, not milliseconds**:
```js
const waitFrames = async (p, n) => { const f0 = await p.evaluate(() => __apex3d.frames); while ((await p.evaluate(() => __apex3d.frames)) < f0 + n) await p.waitForTimeout(250); };
// test hook inside the module:
window.__apex3d = { get frames() { return frames; }, slots, destroy, renderer, running: () => !!raf,
  snapshot() { cancelAnimationFrame(raf); raf = 0; frame(performance.now()); const c = document.createElement('canvas');
    c.width = canvas.width; c.height = canvas.height; c.getContext('2d').drawImage(canvas, 0, 0); return c; } };
```
- [ ] No `pageerror` or console errors at 1440x900 or at 390x844 (touch, DPR 3).
- [ ] `document.documentElement.scrollWidth === 390` at 390px.
- [ ] Non-blank: sample snapshot pixels inside each slot. The hero should have more than 20% lit pixels, and a few % near-white for the specular highlights on chrome.
- [ ] The pixel hash changes over time. Rotation changes after `scrollTo` (`waitFrames` 14) and after pointer moves to opposite corners.
- [ ] Hover over a card sets its spin target to +2π, and the icon turns.
- [ ] Ring yaw advances on scroll, and the "Facing you" caption changes.
- [ ] Paused: no slot visible means `running() === false`. Faking `document.hidden = true` plus `visibilitychange` stops the frame count, and un-hiding resumes it.
- [ ] Reduced motion (`reducedMotion: 'reduce'`): frames stay flat while idle, two snapshot hashes are equal, and a scroll triggers exactly one on-demand frame.
- [ ] `?nogl` (and the 6 s timeout) shows the SVG fallback in every slot.
- [ ] `destroy()` stops the loop.
- [ ] Screenshot desktop top, ring, cards and mobile, then **look**. Faces should read as solid black or onyx, edges as polished chrome with sharp strip highlights, and nothing should be clipped by a slot edge. Platinum must not drift warm (gold).
- [ ] Before publishing, swap the import map to the jsDelivr `three@0.160.0` URLs. The CDN can't be fetched in this container, so say so in the report.
