/* TYP-101 letter board: one WebGL renderer draws every letter tile plus the big viewer into their DOM slots
   (scissor), so 37 live 3D letters cost one context. */
import * as THREE from 'three';
import { STYLES, brushedTexture, buildEnv, makeMaterials, glyphGeometry } from './wordmark3d.js';

const damp = (c, t, l, dt) => c + (t - c) * (1 - Math.exp(-l * dt));
const sm = x => x * x * (3 - 2 * x);

export function mountBoard({ canvas, viewer, tiles, glyphFor, getSelected }) {
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MOBILE = matchMedia('(max-width: 900px)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, MOBILE ? 1.5 : 2));
  renderer.setClearColor(0, 0); renderer.autoClear = false;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const key = new THREE.DirectionalLight(0xffffff, 1.9); key.position.set(2.2, 5.5, 7.5); scene.add(key);
  scene.add(new THREE.HemisphereLight(0xdfe2e6, 0x18191b, 0.2));
  const sheen = new THREE.PointLight(0xffffff, 0, 2.6, 1.4); scene.add(sheen);
  const holder = new THREE.Group(); scene.add(holder);
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
  const brush = brushedTexture(); brush.repeat.set(1 / 260, 1 / 65);
  const U = { uFlex: { value: 0 }, uHalf: { value: new THREE.Vector2(50, 50) }, uGlowPos: { value: new THREE.Vector3(-99, 0, 0) }, uGlowCol: { value: new THREE.Color() } };

  let ST, envRT, mats;
  const geoCache = new Map(), meshes = new Map();
  function setStyle(name) {
    ST = STYLES[name] || STYLES.gunmetal;
    envRT?.dispose(); envRT = buildEnv(renderer, ST); scene.environment = envRT.texture;
    if (mats) { mats.face.dispose(); mats.side.dispose(); }
    mats = makeMaterials(ST, brush, U);
    meshes.forEach(m => { m.material = [mats.face, mats.side]; });
    sheen.color.set(ST.light); kick();
  }
  function meshFor(k) {
    if (!meshes.has(k)) {
      const g = glyphFor(k);
      if (!geoCache.has(k)) geoCache.set(k, glyphGeometry(g, MOBILE ? 3 : 4));
      const m = new THREE.Mesh(geoCache.get(k), [mats.face, mats.side]); m.scale.setScalar(0.01); m.userData.w = g.w;
      meshes.set(k, m);
    }
    return meshes.get(k);
  }

  // Per-tile motion: a coin turn on hover, then rest.
  const spin = new Map();
  tiles.forEach(el => {
    spin.set(el, { cur: 0, tgt: 0, hover: 0 });
    el.addEventListener('pointerenter', () => { const s = spin.get(el); s.tgt += Math.PI * 2; s.hover = 1; kick(); });
    el.addEventListener('pointerleave', () => { spin.get(el).hover = 0; kick(); });
  });
  const pointer = { x: 0, y: 0 };
  const onMove = e => { const r = viewer.getBoundingClientRect(); pointer.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1)); pointer.y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1)); };
  if (!REDUCED) addEventListener('pointermove', onMove, { passive: true });

  let raf = 0, last = performance.now(), t = REDUCED ? 3 : 0, frames = 0, rw = 0, rh = 0, viewSel = null, selT = 0;
  const vst = { ry: 0, rx: 0 };

  function draw(el, k, dist, setup) {
    const r = el.getBoundingClientRect(), H = rh, W = rw;
    if (r.bottom < 0 || r.top > H || r.right < 0 || r.left > W || r.width < 2) return;
    const m = meshFor(k); holder.clear(); holder.add(m);
    setup(m, r);
    camera.aspect = r.width / r.height;
    const tf = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const fit = Math.max(1.0 * dist / tf, (m.userData.w * 0.01 * dist) / (tf * camera.aspect));
    camera.position.set(0, -0.04, fit + 0.1); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();
    const y = H - r.bottom;
    renderer.setViewport(r.left, y, r.width, r.height); renderer.setScissor(r.left, y, r.width, r.height);
    renderer.render(scene, camera);
  }

  function frame(now) {
    raf = 0;
    const dt = Math.min(Math.max((now - last) / 1000, 0), 1 / 15); last = Math.max(last, now);
    if (!REDUCED) t += dt;
    const W = canvas.clientWidth, H = canvas.clientHeight;
    if (W !== rw || H !== rh) { rw = W; rh = H; renderer.setSize(W, H, false); }
    renderer.setScissorTest(false); renderer.clear(); renderer.setScissorTest(true);
    let busy = false;

    // Tiles: still, lit evenly; hover turns the letter once and wakes a faint light.
    U.uFlex.value = 0; U.uGlowCol.value.set(0); sheen.intensity = 0;
    tiles.forEach(el => {
      const s = spin.get(el);
      s.cur = REDUCED ? s.tgt : damp(s.cur, s.tgt, 5, dt);
      if (Math.abs(s.tgt - s.cur) > 0.002) busy = true;
      draw(el, el.dataset.k, 1.85, m => { m.rotation.set(0, s.cur, 0); m.position.set(0, 0, 0); });
    });

    // Big viewer: sway, pointer tilt, corner flex, and the light that climbs the letter then crosses it.
    const k = getSelected();
    if (k !== viewSel) { viewSel = k; selT = t; }
    const m = meshFor(k), w = m.userData.w * 0.01;
    vst.ry = damp(vst.ry, pointer.x * 0.25 + Math.sin(t * 0.45) * 0.08, 3.5, dt);
    vst.rx = damp(vst.rx, pointer.y * 0.12, 3.5, dt);
    const cyc = ((t - selT) % 5) / 5, RISE = 0.4;
    let sx, sy, si;
    if (cyc < RISE) { const u = sm(cyc / RISE); sx = -w * 0.25; sy = -0.95 + u * 1.5; si = sm(Math.min(1, cyc / 0.15)) * 7; }
    else { const u = sm((cyc - RISE) / (1 - RISE)); sx = -w * 0.25 + u * (w * 0.75 + 0.5); sy = 0.55 - u * 0.3; si = 7 * Math.min(1, (1 - cyc) / 0.15); }
    sheen.position.set(sx, sy, 0.7); sheen.intensity = REDUCED ? 3 : si;
    U.uGlowPos.value.set(sx, sy, 0.1); U.uGlowCol.value.set(ST.light).multiplyScalar(sheen.intensity / 8);
    U.uHalf.value.set(m.userData.w / 2, 50); U.uFlex.value = REDUCED ? 0 : Math.sin(t * 0.9) * 9;
    draw(viewer, k, 1.9, mm => { mm.rotation.set(vst.rx, vst.ry, 0); mm.position.set(0, 0, 0); });
    frames++;
    if ((!REDUCED || busy) && !document.hidden) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', kick);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { last = performance.now(); kick(); } });
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); cancelAnimationFrame(raf); raf = 0; window.apexFallback?.(); });

  setStyle('gunmetal');
  return { setStyle, kick, get frames() { return frames; }, renderer };
}
