// PEPTICITY BLACK 3D type engine (three.js r160). Inlined into the brand pages by build_pages.py.
// One renderer, many DOM slots (scissor). Glyph contours come from brand/font/glyphs.json.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';

const GLYPHS = JSON.parse(document.getElementById('glyph-data').textContent);
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOBILE = innerWidth < 900;
const damp = (c, t, l, dt) => c + (t - c) * (1 - Math.exp(-l * dt));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// ------------------------------------------------------------------ textures
function brushedTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const x = c.getContext('2d'); x.fillStyle = '#c4c4c4'; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2600; i++) {
    const y = Math.random() * 512, v = 150 + Math.random() * 105, a = 0.05 + Math.random() * 0.22;
    x.strokeStyle = `rgba(${v},${v},${v},${a})`; x.lineWidth = Math.random() < 0.85 ? 0.6 : 1.4;
    const x0 = Math.random() * 512, len = 80 + Math.random() * 420;
    x.beginPath(); x.moveTo(x0, y); x.lineTo(x0 + len, y + (Math.random() - 0.5) * 1.2); x.stroke();
    if (x0 + len > 512) { x.beginPath(); x.moveTo(x0 - 512, y); x.lineTo(x0 + len - 512, y); x.stroke(); }
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3.2, 3.2);
  t.anisotropy = 8; return t;
}
function wallTexture(light) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(640, 170, 40, 560, 260, 720);
  if (light) { g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#e9ebee'); }
  else { g.addColorStop(0, '#3d3d3c'); g.addColorStop(0.55, '#323232'); g.addColorStop(1, '#2a2a2a'); }
  x.fillStyle = g; x.fillRect(0, 0, 1024, 512);
  const id = x.getImageData(0, 0, 1024, 512), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - 0.5) * (light ? 5 : 9); d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  x.putImageData(id, 0, 0);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// ------------------------------------------------------------------ stage
export function createStage(canvas) {
  let renderer;
  try {
    const probe = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!probe) throw new Error('no webgl');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) { window.type3dFallback && window.type3dFallback('no-webgl'); return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, MOBILE ? 1.5 : 2));
  renderer.setClearColor(0, 0); renderer.autoClear = false;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.92;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;

  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment(renderer);
  const strip = new THREE.MeshBasicMaterial({ color: 0xffffff }); strip.color.setScalar(7);
  [[-6, 4, 0, .35, 9], [6.5, 2.5, 1, .3, 8], [0, 9.5, 3, 7, .3], [3, -2, 6, 5, .25]].forEach(([x, y, z, w, h]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, w > 1 ? .3 : w), strip); m.position.set(x, y, z); room.add(m);
  });
  const envRT = pmrem.fromScene(room, 0.03);
  room.traverse(o => { o.geometry?.dispose?.(); }); pmrem.dispose();

  const brushed = brushedTexture();
  const MAT = {
    gunmetal: new THREE.MeshPhysicalMaterial({ color: 0x8e8d86, metalness: 0.62, roughness: 0.5, roughnessMap: brushed, map: brushed,
      clearcoat: 0.04, clearcoatRoughness: 0.7, envMapIntensity: 0.5 }),
    platinum: new THREE.MeshPhysicalMaterial({ color: 0xe4e6ea, metalness: 1, roughness: 0.17, roughnessMap: brushed, envMapIntensity: 1.1 }),
    goldchrome: new THREE.MeshPhysicalMaterial({ color: 0xdcceaa, metalness: 1, roughness: 0.2, roughnessMap: brushed, envMapIntensity: 1.05 }),
    chevron: new THREE.MeshPhysicalMaterial({ color: 0x26252a, metalness: 0.85, roughness: 0.38, roughnessMap: brushed, envMapIntensity: 0.55 }),
    uv: new THREE.MeshPhysicalMaterial({ color: 0x0e0c14, metalness: 0.55, roughness: 0.32, sheen: 1, sheenColor: new THREE.Color(0x4b3b86),
      sheenRoughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: 0.7 }),
    edge: new THREE.LineBasicMaterial({ color: 0xdcd6ff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }),
  };
  for (const k of ['gunmetal', 'platinum', 'goldchrome', 'chevron', 'uv']) {
    MAT[k].polygonOffset = true; MAT[k].polygonOffsetFactor = 1; MAT[k].polygonOffsetUnits = 1;
  }

  const slots = [];
  const pointer = { x: 0, y: 0 };
  addEventListener('pointermove', e => { pointer.x = e.clientX / innerWidth * 2 - 1; pointer.y = e.clientY / innerHeight * 2 - 1; kick(); }, { passive: true });
  const io = new IntersectionObserver(es => { es.forEach(e => { const s = slots.find(q => q.el === e.target); if (s) s.visible = e.isIntersecting; }); kick(); }, { rootMargin: '120px' });

  let raf = 0, last = performance.now(), t = 0, frames = 0, rw = 0, rh = 0;
  function frame(now) {
    raf = 0; const dt = Math.min(Math.max((now - last) / 1000, 0), 1 / 15); last = Math.max(last, now); if (!REDUCED) t += dt;
    const W = canvas.clientWidth, H = canvas.clientHeight;
    if (W !== rw || H !== rh) { rw = W; rh = H; renderer.setSize(W, H, false); }
    renderer.setScissorTest(false); renderer.clear(); renderer.setScissorTest(true);
    for (const s of slots) {
      if (!s.visible) continue;
      const r = s.el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > H || r.right < 0 || r.left > W || r.width < 2) continue;
      const prog = clamp((H - r.top) / (H + r.height), 0, 1);
      s.update && s.update(REDUCED ? 0 : dt, t, prog, pointer, r);
      s.camera.aspect = r.width / r.height; s.fit && s.fit(s.camera.aspect); s.camera.updateProjectionMatrix();
      const y = H - r.bottom;
      renderer.setViewport(r.left, y, r.width, r.height); renderer.setScissor(r.left, y, r.width, r.height);
      renderer.render(s.scene, s.camera);
    }
    frames++;
    if (!REDUCED && !document.hidden && slots.some(s => s.visible)) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  addEventListener('scroll', kick, { passive: true }); addEventListener('resize', kick);
  document.addEventListener('visibilitychange', kick);

  function addSlot(el, slot) {
    slot.el = el; slot.visible = true; slot.scene.environment = envRT.texture;
    slots.push(slot); io.observe(el);
    renderer.compile(slot.scene, slot.camera);
    kick(); return slot;
  }

  window.__type3d = { get frames() { return frames; }, slots, renderer, running: () => !!raf, ready: true,
    snapshot() { cancelAnimationFrame(raf); raf = 0; frame(performance.now()); const c = document.createElement('canvas');
      c.width = canvas.width; c.height = canvas.height; c.getContext('2d').drawImage(canvas, 0, 0); return c.toDataURL(); } };
  return { renderer, MAT, addSlot, kick, envRT, wallTexture };
}

// ------------------------------------------------------------------ glyph geometry
const geoCache = new Map();
function regroupBevel(g) {
  // ExtrudeGeometry: group 0 = caps, group 1 = sides + bevel. Move bevel triangles to the face material.
  const pos = g.attributes.position, nor = g.attributes.normal, uv = g.attributes.uv;
  const capT = [], sideT = [];
  const side = g.groups.find(q => q.materialIndex === 1), cap = g.groups.find(q => q.materialIndex === 0);
  const tris = (grp, fn) => { for (let i = grp.start; i < grp.start + grp.count; i += 3) fn(i); };
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3();
  // caps stay perfectly flat (creased normals must not bleed in from the bevel)
  tris(cap, i => { capT.push(i); a.fromBufferAttribute(pos, i); b.fromBufferAttribute(pos, i + 1); c.fromBufferAttribute(pos, i + 2);
    n.subVectors(c, b).cross(a.clone().sub(b)).normalize(); for (let v = 0; v < 3; v++) nor.setXYZ(i + v, n.x, n.y, n.z); });
  tris(side, i => {
    a.fromBufferAttribute(pos, i); b.fromBufferAttribute(pos, i + 1); c.fromBufferAttribute(pos, i + 2);
    n.subVectors(c, b).cross(a.clone().sub(b)).normalize();
    (Math.abs(n.z) > 0.2 ? capT : sideT).push(i);
  });
  const out = new THREE.BufferGeometry();
  const build = (attr, size) => { const arr = new Float32Array((capT.length + sideT.length) * 3 * size); let o = 0;
    for (const i of [...capT, ...sideT]) for (let v = 0; v < 3; v++) for (let k = 0; k < size; k++) arr[o++] = attr.array[(i + v) * size + k];
    return new THREE.BufferAttribute(arr, size); };
  out.setAttribute('position', build(pos, 3)); out.setAttribute('normal', build(nor, 3)); if (uv) out.setAttribute('uv', build(uv, 2));
  out.addGroup(0, capT.length * 3, 0); out.addGroup(capT.length * 3, sideT.length * 3, 1);
  return out;
}

export function glyphGeometries(cut, ch, opt) {
  const key = [cut, ch, opt.depth, opt.bevel].join('|');
  if (geoCache.has(key)) return geoCache.get(key);
  const G = GLYPHS[cut][ch]; if (!G) return null;
  const S = 1 / 1000;
  const parts = G.p.map(p => {
    const shape = new THREE.Shape(p.o.map(([x, y]) => new THREE.Vector2(x * S, y * S)));
    p.h.forEach(h => shape.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x * S, y * S)))));
    let g = new THREE.ExtrudeGeometry(shape, { depth: opt.depth, bevelEnabled: true, bevelThickness: opt.bevel, bevelSize: opt.bevel * 0.9,
      bevelOffset: -opt.bevel * 0.9, bevelSegments: MOBILE ? 1 : 2, curveSegments: 2, steps: 1 });
    g = toCreasedNormals(g, 0.6);
    g = regroupBevel(g);
    // luminescent edge line on the outer rim where the bevel meets the sides
    const pts = [];
    const ring = arr => { for (let i = 0; i < arr.length; i++) { const [x0, y0] = arr[i], [x1, y1] = arr[(i + 1) % arr.length];
      pts.push(x0 * S, y0 * S, opt.depth + 0.0005, x1 * S, y1 * S, opt.depth + 0.0005); } };
    ring(p.o); p.h.forEach(ring);
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    // area for picking the A chevron
    let area = 0; for (let i = 0; i < p.o.length; i++) { const [x0, y0] = p.o[i], [x1, y1] = p.o[(i + 1) % p.o.length]; area += x0 * y1 - x1 * y0; }
    return { g, lg, area: Math.abs(area) };
  });
  const res = { parts, adv: G.adv * S };
  geoCache.set(key, res); return res;
}

// a word as a group of letter pivots (each letter can spin about its own centre)
export function makeWord(stage, text, { cut = 'regular', face = 'gunmetal', depth = 0.1, bevel = 0.012, edge = false, darkA = false, track = 0, shadows = true } = {}) {
  const group = new THREE.Group(), letters = [];
  const kern = GLYPHS.kern || {};
  let x = 0; const cap = 0.7;
  const chars = [...text];
  chars.forEach((ch, i) => {
    const geo = glyphGeometries(cut, ch, { depth, bevel });
    if (!geo) { x += 0.32 + track; return; }
    const pivot = new THREE.Group();
    const inner = new THREE.Group(); pivot.add(inner);
    const maxArea = Math.max(...geo.parts.map(p => p.area));
    geo.parts.forEach(p => {
      const faceMat = (darkA && ch === 'A' && p.area === maxArea && geo.parts.length > 1) ? stage.MAT.chevron : stage.MAT[face];
      const m = new THREE.Mesh(p.g, [faceMat, stage.MAT.uv]); m.castShadow = shadows; m.receiveShadow = shadows; inner.add(m);
      if (edge) inner.add(new THREE.LineSegments(p.lg, stage.MAT.edge));
    });
    inner.position.set(-geo.adv / 2, -cap / 2, -depth / 2);
    pivot.position.x = x + geo.adv / 2; pivot.userData = { i, ch };
    group.add(pivot); letters.push(pivot);
    x += geo.adv + track + (kern[ch + (chars[i + 1] || '')] || 0) / 1000;
  });
  letters.forEach(l => l.position.x -= x / 2);
  return { group, letters, width: x, height: cap };
}

// a matte wall with soft cast shadow, the way the reference is lit
export function wallScene(stage, { light = false, wallZ = -0.24, keyPos = [3.0, 2.1, 2.3], shadowRadius = 7 } = {}) {
  const scene = new THREE.Scene();
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), new THREE.MeshStandardMaterial({ map: stage.wallTexture(light), color: 0xffffff, roughness: 0.97, metalness: 0, envMapIntensity: light ? 0.5 : 0.12 }));
  wall.position.z = wallZ; wall.receiveShadow = true; scene.add(wall);
  const key = new THREE.DirectionalLight(0xffffff, light ? 1.3 : 1.9); key.position.set(...keyPos); key.castShadow = true;
  key.shadow.mapSize.set(MOBILE ? 1024 : 2048, MOBILE ? 1024 : 2048); key.shadow.radius = shadowRadius; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.01;
  const sc = key.shadow.camera; sc.left = -5; sc.right = 5; sc.top = 3; sc.bottom = -3; sc.near = 0.5; sc.far = 20;
  scene.add(key); scene.add(key.target);
  const fill = new THREE.HemisphereLight(0xeeeeea, 0x0b0b0b, light ? 0.6 : 0.22); scene.add(fill);
  const rim = new THREE.PointLight(0xffffff, 0.0, 6, 2); rim.position.set(-2.2, -0.8, 1.2); scene.add(rim);
  const camera = new THREE.PerspectiveCamera(26, 2, 0.1, 60);
  return { scene, camera, wall, key };
}

// fit a camera so a w x h box fills `fill` of the slot
export function fitCamera(camera, w, h, aspect, fill = 0.9, lookY = 0) {
  const vfov = camera.fov * Math.PI / 180;
  const distH = (h / fill) / (2 * Math.tan(vfov / 2));
  const distW = (w / fill) / (2 * Math.tan(vfov / 2) * aspect);
  const d = Math.max(distH, distW);
  camera.position.set(0, lookY, d); camera.lookAt(0, lookY, 0);
  return d;
}
