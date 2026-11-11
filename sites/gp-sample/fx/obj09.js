// OBJ-09 REVOLVING ICON RING — standalone module.
// Source: apex_agents_bots/design/landing-options/apex-bp1.html (ring scene, lines ~604-835):
// iconGeometry/iconTile/plate, ring RR=4.6, drag/inertia/idle/snap, front scale 1.08, keyboard.
// Chrome colours come ONLY from `colors`.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const DEFAULT_COLORS = {
  gold: ['#332814', '#68513d', '#a4845d', '#f0e6c7', '#fef9e8'],
  platinum: ['#2a2d31', '#6b7077', '#b9bec5', '#e6e9ed', '#ffffff'],
  accent: '#8b6cff'
};

const mix = (a, b, t) => new THREE.Color(a).lerp(new THREE.Color(b), t);

// gold and platinum woven (never a toggle)
function palette(c) {
  const g = c.gold, p = c.platinum;
  return {
    onyx: mix(mix(p[0], g[0], 0.35), '#000000', 0.55),      // plate faces (original matteOnyx 0x111113)
    rim: mix(mix(p[3], g[2], 0.5), p[2], 0.25),              // plate bevel/sides (original platinum 0xdcdcd8)
    icon: mix(mix(p[3], g[3], 0.38), p[4], 0.12),            // icon metal (original satinPlat 0xe6e6e2)
    accent: new THREE.Color(c.accent)
  };
}

export function mountObj09(el, { items, colors, onFront, tileScale } = {}) {
  colors = { ...DEFAULT_COLORS, ...(colors || {}) };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { el.classList.add('no-gl'); return { destroy() {}, setFront() {}, setColors() {}, get front() { return 0; } }; }
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const dom = renderer.domElement;
  dom.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y';
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
  el.appendChild(dom);
  el.tabIndex = 0;
  el.setAttribute('role', 'group');
  if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', 'Drag to turn the ring. Arrow keys step through items.');
  const prevCursor = el.style.cursor; el.style.cursor = 'grab';

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.035);
  scene.environment = envRT.texture;
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 9);
  const key = new THREE.PointLight(0xffffff, 40, 30); key.position.set(3, 3, 5); scene.add(key);
  const rimL = new THREE.DirectionalLight(0xffffff, 1.4); rimL.position.set(-4, 2, -3); scene.add(rimL);

  // materials (same physical params as original)
  const P = palette(colors);
  const matOnyx = new THREE.MeshStandardMaterial({ color: P.onyx, metalness: 0.55, roughness: 0.5 });
  const matRim = new THREE.MeshStandardMaterial({ color: P.rim, metalness: 1, roughness: 0.16 });
  const matIcon = new THREE.MeshStandardMaterial({ color: P.icon, metalness: 1, roughness: 0.12 });
  const matFront = matIcon.clone(); // front item picks up a faint accent glint
  const iconMats = [matIcon];

  // chamfered plate (top-left and bottom-right cut) — original plateShape
  function plateShape(w, h, c) {
    const s = new THREE.Shape(), x = w / 2, y = h / 2;
    s.moveTo(-x + c, y); s.lineTo(x, y); s.lineTo(x, -y + c); s.lineTo(x - c, -y); s.lineTo(-x, -y); s.lineTo(-x, y - c); s.closePath();
    return s;
  }
  const plateGeo = new THREE.ExtrudeGeometry(plateShape(1, 1, 0.2), { depth: 0.12, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.025, bevelSegments: 2 });
  plateGeo.translate(0, 0, -0.06);

  // SVG stroke icon -> solid tube geometry (original iconGeometry)
  const svgLoader = new SVGLoader();
  function iconGeometry(d) {
    const data = svgLoader.parse(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${d}"/></svg>`);
    const parts = [], R = 0.95;
    for (const p of data.paths) for (const sp of p.subPaths) {
      const pts = sp.getPoints(10).map(q => new THREE.Vector3(q.x - 12, -(q.y - 12), 0));
      const clean = [pts[0]];
      for (let i = 1; i < pts.length; i++) if (pts[i].distanceTo(clean[clean.length - 1]) > 0.04) clean.push(pts[i]);
      if (clean.length < 2) { parts.push(new THREE.SphereGeometry(R * 1.05, 12, 8).translate(clean[0].x, clean[0].y, 0)); continue; }
      const closed = clean.length > 2 && clean[0].distanceTo(clean[clean.length - 1]) < 0.12;
      const ringPts = closed ? clean.slice(0, -1) : clean;
      if (ringPts.length < 2) continue;
      const curve = new THREE.CatmullRomCurve3(ringPts, closed, 'centripetal', 0.15);
      parts.push(new THREE.TubeGeometry(curve, Math.min(110, Math.max(12, ringPts.length * 5)), R, 7, closed));
      if (!closed) { const a = ringPts[0], b = ringPts[ringPts.length - 1]; parts.push(new THREE.SphereGeometry(R, 9, 6).translate(a.x, a.y, 0)); parts.push(new THREE.SphereGeometry(R, 9, 6).translate(b.x, b.y, 0)); }
    }
    const g = mergeGeometries(parts);
    g.scale(1 / 24 * 0.66, 1 / 24 * 0.66, 1 / 24 * 0.66 * 1.4);
    g.translate(0, 0, 0.12);
    parts.forEach(p => p.dispose());
    return g;
  }

  const geos = [plateGeo];
  const root = new THREE.Group(); scene.add(root);
  const ring = new THREE.Group(); root.add(ring);
  const list = (items || []).slice();
  const N = Math.max(1, list.length), RR = 4.6, STEP = Math.PI * 2 / N;
  // original ring has 33 tiles; with fewer items tiles grow so the band keeps its density
  const TK = tileScale || Math.min(2.2, Math.sqrt(33 / N));
  const tiles = list.map((it, i) => {
    const g = new THREE.Group();
    const ig = iconGeometry(it.d); geos.push(ig);
    const icon = new THREE.Mesh(ig, matIcon);
    g.add(new THREE.Mesh(plateGeo, [matOnyx, matRim]), icon);
    g.userData.icon = icon;
    g.scale.setScalar(0.78 * TK);
    const a = i * STEP;
    g.position.set(Math.sin(a) * RR, 0, Math.cos(a) * RR);
    g.rotation.y = a; ring.add(g); return g;
  });
  ring.position.z = -4.2; ring.rotation.x = 0.16;

  // state
  let ringAngle = 0, ringVel = 0, dragging = false, lastX = 0, idle = 0, ringTarget = null, front = 0, shown = -1;
  let px = 0, py = 0, sx = 0, sy = 0, onScreen = true, raf = 0, dead = false, last = performance.now();
  let accent = 0;

  const setFrontNotify = i => {
    if (i === shown) return; shown = i; front = i;
    if (onFront) onFront(i, list[i]);
  };
  const go = d => { ringTarget = (front + d + N) % N; setFrontNotify(ringTarget); };

  const onDown = e => { dragging = true; lastX = e.clientX; ringVel = 0; ringTarget = null; try { el.setPointerCapture(e.pointerId); } catch (_) {} el.style.cursor = 'grabbing'; };
  const onMove = e => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; ringAngle -= dx * 0.006; ringVel = -dx * 0.006; idle = 0; };
  const endDrag = () => { dragging = false; el.style.cursor = 'grab'; };
  const onKey = e => { if (e.key === 'ArrowLeft') { go(-1); e.preventDefault(); } if (e.key === 'ArrowRight') { go(1); e.preventDefault(); } };
  const onWinMove = e => { const r = el.getBoundingClientRect(); px = (e.clientX - r.left) / Math.max(1, r.width) - 0.5; py = (e.clientY - r.top) / Math.max(1, r.height) - 0.5; px = Math.max(-1, Math.min(1, px)); py = Math.max(-1, Math.min(1, py)); };
  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', endDrag);
  el.addEventListener('pointercancel', endDrag);
  el.addEventListener('keydown', onKey);
  addEventListener('pointermove', onWinMove, { passive: true });

  const io = new IntersectionObserver(es => { onScreen = es[0].isIntersecting; if (onScreen) { last = performance.now(); kick(); } }, { rootMargin: '80px' });
  io.observe(el);
  const onVis = () => { if (!document.hidden) { last = performance.now(); kick(); } };
  document.addEventListener('visibilitychange', onVis);

  function resize() {
    const w = Math.max(2, el.clientWidth), h = Math.max(2, el.clientHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, w < 900 ? 1.5 : 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    // original canvas is full-viewport; here the stage is shorter, so zoom (no perspective change) to fill it
    camera.zoom = Math.min(1.7, camera.aspect * 0.7); camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize); ro.observe(el); resize();

  const f = (r, dt) => 1 - Math.pow(1 - r, dt * 60);
  const tmp = new THREE.Vector3();
  function frame(now) {
    raf = 0; if (dead) return;
    if (!onScreen || document.hidden) return;
    const rawDt = (now - last) / 1000; last = now;
    const dt = Math.min(0.05, Math.max(0, rawDt)) || 1 / 60;
    sx += (px - sx) * f(0.06, dt); sy += (py - sy) * f(0.06, dt);
    root.rotation.y = sx * 0.35; root.rotation.x = sy * 0.22;
    if (ringTarget != null && !dragging) {
      let diff = -ringTarget * STEP - ringAngle;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      ringAngle += diff * f(0.1, dt); if (Math.abs(diff) < 0.002) ringTarget = null;
    } else if (!dragging) {
      ringAngle += ringVel * dt * 60; ringVel *= Math.pow(0.93, dt * 60); idle += dt;
      if (idle > 2.5 && !reduce) ringAngle -= dt * 0.12;
      else if (Math.abs(ringVel) < 0.0005) { const snap = Math.round(ringAngle / STEP) * STEP; ringAngle += (snap - ringAngle) * f(0.08, dt); }
    }
    ring.rotation.y = ringAngle;
    const fr = ((Math.round(-ringAngle / STEP) % N) + N) % N;
    if (ringTarget == null) setFrontNotify(fr);
    const k = reduce ? 1 : f(0.1, dt);
    tiles.forEach((tile, i) => {
      const s = (i === fr ? 1.08 : 0.78) * TK; tmp.set(s, s, s); tile.scale.lerp(tmp, k);
    });
    // faint accent glint on the front icon only
    const front = tiles[fr]; if (front) {
      tiles.forEach(t => { if (t.userData.icon.material === matFront && t !== front) t.userData.icon.material = matIcon; });
      front.userData.icon.material = matFront;
    }
    matFront.emissive.copy(P.accent); matFront.emissiveIntensity = 0.04;
    if (!reduce) { const tt = now / 1000; key.position.x = Math.sin(tt * 0.5) * 5; key.position.y = 2 + Math.cos(tt * 0.4) * 1.5; }
    renderer.render(scene, camera);
    window.__obj09Frames = (window.__obj09Frames || 0) + 1;
    kick();
  }
  function kick() { if (!raf && !dead) raf = requestAnimationFrame(frame); }
  kick();

  function setColors(c) {
    c = { ...colors, ...c }; colors = c; const n = palette(c);
    matOnyx.color.copy(n.onyx); matRim.color.copy(n.rim); matIcon.color.copy(n.icon); matFront.color.copy(n.icon); P.accent.copy(n.accent);
  }

  return {
    get front() { return front; },
    setFront(i) { ringTarget = ((i % N) + N) % N; setFrontNotify(ringTarget); },
    setColors,
    destroy() {
      dead = true; cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      el.removeEventListener('pointerdown', onDown); el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', endDrag); el.removeEventListener('pointercancel', endDrag);
      el.removeEventListener('keydown', onKey); removeEventListener('pointermove', onWinMove);
      document.removeEventListener('visibilitychange', onVis);
      geos.forEach(g => g.dispose());
      [matOnyx, matRim, matIcon, matFront].forEach(m => m.dispose());
      envRT.dispose(); pmrem.dispose(); renderer.dispose();
      dom.remove(); el.style.cursor = prevCursor;
    }
  };
}
