/* PEPTICITY v4 · OBJ-08 BLACK-CHROME MONOGRAM in the hero (owner, 31 Oct: "fix the hero big time").
   The approved logo P (brand/logo/p-mark.svg, the same path as the page's #pmark symbol, never the font's cut-out P) as real 3D:
   extruded and bevelled, matte gunmetal faces, UV-black sides with a faint violet sheen, a hairline of light on every edge.
   Cinematic entrance after the chest film: the P rises out of the dark, a light rakes across its bevel, then it settles behind the headline.
   Idle: turns slowly, reflects the studio, leans toward the pointer. Scroll: it turns away and lifts as the hero leaves.
   Own canvas (#gl-hero), own loop that sleeps when the hero is off screen. No WebGL: the flat P fallback stays. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const D = document.documentElement, canvas = document.getElementById('gl-hero'), hero = document.getElementById('top');
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOBILE = innerWidth < 900;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const damp = (c, t, l, dt) => c + (t - c) * (1 - Math.exp(-l * dt));
const ease = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

/* the approved P mark (viewBox -0.708 -0.58 1.416 1.16), outer contour + the bowl counter (evenodd) */
const P_PATH = document.querySelector('#pmark path').getAttribute('d');

function brushed() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const x = c.getContext('2d'); x.fillStyle = '#c4c4c4'; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2600; i++) {
    const y = Math.random() * 512, v = 150 + Math.random() * 105;
    x.strokeStyle = `rgba(${v},${v},${v},${0.05 + Math.random() * 0.22})`; x.lineWidth = Math.random() < 0.85 ? 0.6 : 1.4;
    const x0 = Math.random() * 512, len = 80 + Math.random() * 420;
    x.beginPath(); x.moveTo(x0, y); x.lineTo(x0 + len, y + (Math.random() - 0.5) * 1.2); x.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2.2, 2.2); t.anisotropy = 8; return t;
}
function pShape() {
  const loops = P_PATH.trim().split(/Z/i).map(s => s.trim()).filter(Boolean).map(seg =>
    seg.replace(/[ML]/g, ' ').trim().split(/\s+/).map(Number).reduce((a, v, i, arr) => (i % 2 ? a : a.concat([new THREE.Vector2(arr[i], -arr[i + 1])])), []));
  const area = pts => pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + p.x * q.y - q.x * p.y; }, 0) / 2;
  loops.sort((a, b) => Math.abs(area(b)) - Math.abs(area(a)));
  const outer = loops[0]; if (area(outer) < 0) outer.reverse();
  const shape = new THREE.Shape(outer);
  loops.slice(1).forEach(h => { if (area(h) > 0) h.reverse(); shape.holes.push(new THREE.Path(h)); });
  return shape;
}

function start() {
  if (!canvas || !hero) return;
  let renderer;
  try {
    if (!(canvas.getContext('webgl2') || canvas.getContext('webgl'))) throw new Error('no webgl');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, MOBILE ? 1.5 : 2));
  renderer.setClearColor(0, 0); renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0;

  const scene = new THREE.Scene(), pmrem = new THREE.PMREMGenerator(renderer), room = new RoomEnvironment(renderer);
  const strip = new THREE.MeshBasicMaterial({ color: 0xffffff }); strip.color.setScalar(7);
  [[-6, 4, 0, .35, 9], [6.5, 2.5, 1, .3, 8], [0, 9.5, 3, 7, .3], [3, -2, 6, 5, .25]].forEach(([x, y, z, w, h]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, w > 1 ? .3 : w), strip); m.position.set(x, y, z); room.add(m); });
  scene.environment = pmrem.fromScene(room, 0.03).texture; pmrem.dispose();

  const tex = brushed();
  const gunmetal = new THREE.MeshPhysicalMaterial({ color: 0x7a7b80, metalness: 0.86, roughness: 0.5, roughnessMap: tex, map: tex,
    clearcoat: 0.1, clearcoatRoughness: 0.55, envMapIntensity: 0.68 });
  const uv = new THREE.MeshPhysicalMaterial({ color: 0x0e0c14, metalness: 0.55, roughness: 0.32, sheen: 1, sheenColor: new THREE.Color(0x4b3b86),
    sheenRoughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: 0.7 });
  const edge = new THREE.LineBasicMaterial({ color: 0xdcd6ff, transparent: true, opacity: 0.68, blending: THREE.AdditiveBlending, depthWrite: false });
  [gunmetal, uv].forEach(m => { m.polygonOffset = true; m.polygonOffsetFactor = 1; m.polygonOffsetUnits = 1; });

  const depth = 0.26, bevel = 0.045;
  const geo = new THREE.ExtrudeGeometry(pShape(), { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.7, bevelOffset: -bevel * 0.35, bevelSegments: 4, curveSegments: 12 });
  geo.translate(0, 0, -depth / 2);
  const P = new THREE.Group(), body = new THREE.Mesh(geo, [gunmetal, uv]);
  P.add(body);
  /* the hairline of light: the P's own outline on the front and back faces (no triangulation seams) */
  const shp = pShape(), loopsPts = [shp.getPoints(), ...shp.holes.map(h => h.getPoints())];
  [depth / 2 + bevel, -depth / 2 - bevel].forEach(z => loopsPts.forEach(pts => {
    const g = new THREE.BufferGeometry().setFromPoints(pts.map(q => new THREE.Vector3(q.x, q.y, z)));
    P.add(new THREE.LineLoop(g, edge)); }));
  scene.add(P);

  const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(2.5, 3, 4); scene.add(key);
  scene.add(new THREE.HemisphereLight(0xeef1f6, 0x0c0a12, 0.45));
  const violet = new THREE.PointLight(0x9a8cff, 0.6, 8, 2); violet.position.set(-2.2, -1, 1.6); scene.add(violet);
  const rake = new THREE.SpotLight(0xffffff, 0, 12, 0.32, 0.6, 1.2); rake.position.set(-3.4, 1.6, 2.6); scene.add(rake); scene.add(rake.target);

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  let W = 0, H = 0;
  function size() {
    W = canvas.clientWidth; H = canvas.clientHeight; if (!W || !H) return;
    renderer.setSize(W, H, false); camera.aspect = W / H;
    /* the whole P always fits its own frame beside (desktop) or above (phone) the card, with room to turn and lean */
    const tanH = Math.tan(camera.fov * Math.PI / 360);
    const distH = (1.16 * 1.42 / 2) / tanH, distW = (1.416 * (MOBILE ? 1.32 : 1.1) / 2) / (tanH * camera.aspect);
    camera.position.set(0, 0, Math.max(distH, distW));
    camera.updateProjectionMatrix();
  }
  size(); addEventListener('resize', () => { size(); kick(); });

  const ptr = { x: 0, y: 0 }, st = { ry: 0, rx: 0 };
  addEventListener('pointermove', e => { ptr.x = e.clientX / innerWidth * 2 - 1; ptr.y = e.clientY / innerHeight * 2 - 1; kick(); }, { passive: true });

  /* the entrance waits for the chest film to hand over (pc-hero-in); without an intro it plays at once */
  let t0 = 0, began = false, clock = 0;
  const go = () => { if (!began) { began = true; t0 = clock; D.classList.add('hero-p-in'); kick(); } };
  document.addEventListener('pc-hero-in', go);
  if (!D.classList.contains('intro-on')) setTimeout(go, 200);

  let visible = true, raf = 0, last = performance.now();
  new IntersectionObserver(es => { visible = es[0].isIntersecting; kick(); }).observe(hero);
  document.addEventListener('visibilitychange', kick);
  addEventListener('scroll', kick, { passive: true });

  function frame(now) {
    raf = 0; const dt = clamp((now - last) / 1000, 0, 1 / 15); last = Math.max(last, now); clock += dt;
    if (!W) size();
    const e = !began ? 0 : (REDUCED ? 99 : clock - t0);
    /* 1 · rises out of the dark (0–1.8 s)   2 · light rakes across the bevel (0.9–2.6 s)   3 · settles behind the headline */
    const rise = ease(e / 1.8);
    renderer.toneMappingExposure = 0.94 * ss(0, 1.4, e);
    const r = hero.getBoundingClientRect(), leave = clamp(-r.top / Math.max(1, r.height), 0, 1);   /* creative scroll: it turns away and lifts as the hero leaves */
    st.ry = damp(st.ry, ptr.x * 0.28, 2.4, dt); st.rx = damp(st.rx, ptr.y * 0.16, 2.4, dt);
    const idle = REDUCED ? 0 : Math.sin(clock * 0.32) * 0.32;
    P.rotation.set(0.06 + st.rx + leave * 0.25, (1 - rise) * -1.1 + idle + st.ry + leave * 1.4, (1 - rise) * 0.12);
    P.position.set(0, (1 - rise) * -1.15 + leave * 0.12 + (REDUCED ? 0 : Math.sin(clock * 0.8) * 0.012), (1 - rise) * -0.8);
    P.scale.setScalar(0.86 + rise * 0.14);
    const rk = ss(0.9, 1.5, e) * (1 - ss(1.9, 2.7, e));
    rake.intensity = rk * 26; rake.position.x = -3.4 + ss(0.9, 2.6, e) * 6.8; rake.target.position.set(rake.position.x * 0.2, 0, 0);
    edge.opacity = 0.68 + rk * 0.3;
    renderer.render(scene, camera);
    if (!REDUCED && visible && !document.hidden && began) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  kick();
  D.classList.add('gl-hero-on');
  window.__heroP = { go, get started() { return began; } };
}
try { start(); } catch (e) { console.warn('[hero-p] 3D monogram unavailable, flat P stays', e); }
