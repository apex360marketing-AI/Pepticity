/* Pepticity V6 · Garnet: the 3D vial. Reads window.PEPSTATE every frame. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const S = window.PEPSTATE || (window.PEPSTATE = { intro: 1, peel: 0, view: 'home', px: 0, py: 0, hero: 1 });
const canvas = document.getElementById('gl');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

try { start(); } catch (e) { console.warn('3D unavailable', e); }

function start() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  cam.position.set(0, 0.2, 9);

  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 4, 5); scene.add(key);
  const rim = new THREE.PointLight(0xc8344d, 40, 12, 2); rim.position.set(-2.2, 1.2, -1.6); scene.add(rim);
  const fill = new THREE.PointLight(0xffe9ee, 6, 10, 2); fill.position.set(2.4, -1, 3); scene.add(fill);
  scene.add(new THREE.AmbientLight(0x1a1012, 1));

  const vial = new THREE.Group(); scene.add(vial);
  const spin = new THREE.Group(); vial.add(spin);

  // ---- glass body (lathe) ----
  const R = 0.62, H = 2.15;
  const prof = [];
  prof.push(new THREE.Vector2(0.0, -H / 2));
  prof.push(new THREE.Vector2(R - 0.06, -H / 2));
  prof.push(new THREE.Vector2(R, -H / 2 + 0.07));
  prof.push(new THREE.Vector2(R, H / 2 - 0.42));
  for (let i = 0; i <= 8; i++) { const t = i / 8; prof.push(new THREE.Vector2(R - (R - 0.34) * Math.sin(t * Math.PI / 2), H / 2 - 0.42 + 0.3 * t)); }
  prof.push(new THREE.Vector2(0.34, H / 2 - 0.02));
  prof.push(new THREE.Vector2(0.4, H / 2 + 0.02));
  prof.push(new THREE.Vector2(0.4, H / 2 + 0.1));
  const glassGeo = new THREE.LatheGeometry(prof, 96);
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.04, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.02, transparent: true, opacity: 0.13, envMapIntensity: 2.4, side: THREE.DoubleSide, depthWrite: false });
  const glass = new THREE.Mesh(glassGeo, glassMat); glass.renderOrder = 3; spin.add(glass);

  // ---- liquid ----
  const LH = 1.18;
  const liqGeo = new THREE.CylinderGeometry(R - 0.05, R - 0.05, LH, 96, 1, false);
  liqGeo.translate(0, -H / 2 + 0.06 + LH / 2, 0);
  const liqMat = new THREE.MeshPhysicalMaterial({ color: 0x5e0c1c, roughness: 0.1, metalness: 0, clearcoat: 1, emissive: 0x3a0711, emissiveIntensity: 0.5, envMapIntensity: 1.2, transparent: true, opacity: 0.94 });
  const liquid = new THREE.Mesh(liqGeo, liqMat); liquid.renderOrder = 1; spin.add(liquid);
  const men = new THREE.Mesh(new THREE.CircleGeometry(R - 0.05, 96), new THREE.MeshPhysicalMaterial({ color: 0x8e1b30, roughness: 0.05, clearcoat: 1, emissive: 0x4a0a16, emissiveIntensity: 0.5, transparent: true, opacity: 0.9 }));
  men.rotation.x = -Math.PI / 2; men.position.y = -H / 2 + 0.06 + LH; spin.add(men);

  // ---- chrome crimp cap + stopper ----
  const chrome = new THREE.MeshStandardMaterial({ color: 0xe6e9ed, metalness: 1, roughness: 0.12, envMapIntensity: 2.6 });
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.42, 96, 1, false), chrome);
  cap.position.y = H / 2 + 0.26; spin.add(cap);
  const capTop = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.05, 24, 96), chrome); capTop.rotation.x = Math.PI / 2; capTop.position.y = H / 2 + 0.47; spin.add(capTop);
  const stop = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.06, 64), new THREE.MeshStandardMaterial({ color: 0x2a1015, roughness: 0.6, metalness: 0.1 }));
  stop.position.y = H / 2 + 0.48; spin.add(stop);
  for (let i = 0; i < 40; i++) { // crimp ridges
    const r = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.36, 0.03), chrome);
    const a = i / 40 * Math.PI * 2; r.position.set(Math.cos(a) * 0.475, H / 2 + 0.24, Math.sin(a) * 0.475); r.rotation.y = -a; spin.add(r);
  }

  // ---- labels (canvas textures) ----
  const LBL_H = 1.0, LBL_Y = -0.12;
  function labelCanvas(kind) {
    const c = document.createElement('canvas'); c.width = 2048; c.height = 640;
    const g = c.getContext('2d');
    if (kind === 'outer') {
      const grd = g.createLinearGradient(0, 0, 0, 640); grd.addColorStop(0, '#f3efea'); grd.addColorStop(1, '#e4ddd6');
      g.fillStyle = grd; g.fillRect(0, 0, 2048, 640);
      g.fillStyle = '#8e1b30'; g.fillRect(0, 0, 2048, 22); g.fillRect(0, 618, 2048, 22);
      g.fillStyle = '#151112'; g.font = '400 150px "Bodoni Moda", Didot, Georgia, serif'; g.textBaseline = 'middle';
      g.fillText('PEPTICITY', 120, 250);
      g.font = 'italic 400 64px "Bodoni Moda", Georgia, serif'; g.fillStyle = '#8e1b30'; g.fillText('Peptide care you can verify.', 126, 380);
      g.font = '500 34px "Spline Sans Mono", monospace'; g.fillStyle = '#4a3f41';
      g.fillText('Rx ONLY  ·  CONTENTS PER PRESCRIPTION', 128, 480);
      g.fillText('Prepared by a licensed partner pharmacy', 128, 530);
      g.strokeStyle = '#8e1b30'; g.lineWidth = 3; g.strokeRect(1500, 120, 420, 400);
      g.font = 'italic 400 54px "Bodoni Moda", Georgia, serif'; g.fillStyle = '#151112'; g.fillText('Peel', 1600, 290); g.fillText('to verify', 1560, 360);
    } else {
      g.fillStyle = '#efebe7'; g.fillRect(0, 0, 2048, 640);
      g.fillStyle = '#151112'; g.font = '500 40px "Spline Sans Mono", monospace'; g.textBaseline = 'middle';
      g.fillText('LOT', 120, 150); g.font = '500 120px "Spline Sans Mono", monospace'; g.fillStyle = '#8e1b30'; g.fillText('PX-2611-A', 120, 250);
      g.fillStyle = '#151112'; g.font = '500 36px "Spline Sans Mono", monospace';
      g.fillText('PHARMACY  [licensed partner]', 120, 380);
      g.fillText('LICENCE   [number]', 120, 430);
      g.fillText('COLD-CHAIN SEAL  INTACT', 120, 480);
      g.fillText('CERTIFICATE  pepticity / lot', 120, 530);
      for (let i = 0; i < 64; i++) { const w = (i * 37 % 7) + 3; g.fillRect(1260 + i * 11, 160, w, 300); }
      g.font = '500 34px "Spline Sans Mono", monospace'; g.fillText('SAMPLE', 1500, 520);
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  let outerTex = labelCanvas('outer'), innerTex = labelCanvas('inner');
  const innerMat = new THREE.MeshStandardMaterial({ map: innerTex, roughness: 0.55, metalness: 0, side: THREE.DoubleSide });
  const outerMat = new THREE.MeshStandardMaterial({ map: outerTex, roughness: 0.42, metalness: 0, side: THREE.DoubleSide });
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.004, R + 0.004, LBL_H, 128, 1, true, -Math.PI * 0.55, Math.PI * 1.1), innerMat);
  inner.position.y = LBL_Y; spin.add(inner);
  const outer = new THREE.Mesh(new THREE.BufferGeometry(), outerMat); outer.position.y = LBL_Y; spin.add(outer);
  const FULL = Math.PI * 1.86;
  let lastPeel = -1;
  function buildOuter(p) {
    // the label unwinds from one edge and lifts off the glass as it peels
    const theta = FULL * (1 - 0.86 * p);
    const segs = 128, rows = 2, pos = [], uv = [], idx = [];
    const start = -FULL / 2;
    for (let j = 0; j <= rows; j++) {
      const v = j / rows, y = (v - 0.5) * LBL_H;
      for (let i = 0; i <= segs; i++) {
        const u = i / segs, a = start + u * theta;
        const lift = p > 0 ? Math.pow(Math.max(0, u - 0.78) / 0.22, 2) * 0.35 * p : 0;
        const r = R + 0.012 + lift;
        pos.push(Math.sin(a) * r, y, Math.cos(a) * r);
        uv.push(u * (theta / FULL), v);
      }
    }
    for (let j = 0; j < rows; j++) for (let i = 0; i < segs; i++) { const a = j * (segs + 1) + i, b = a + segs + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    outer.geometry.dispose(); outer.geometry = g;
  }
  buildOuter(0);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => {
    outerTex.dispose(); innerTex.dispose();
    outerTex = labelCanvas('outer'); innerTex = labelCanvas('inner');
    outerMat.map = outerTex; innerMat.map = innerTex; outerMat.needsUpdate = innerMat.needsUpdate = true;
  });

  // ---- garnet halo + contact shadow ----
  function radial(stops) { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const r = g.createRadialGradient(128, 128, 0, 128, 128, 128); stops.forEach(s => r.addColorStop(s[0], s[1])); g.fillStyle = r; g.fillRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), new THREE.MeshBasicMaterial({ map: radial([[0, 'rgba(200,52,77,.55)'], [0.35, 'rgba(142,27,48,.22)'], [1, 'rgba(142,27,48,0)']]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  halo.position.z = -2; vial.add(halo);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.7), new THREE.MeshBasicMaterial({ map: radial([[0, 'rgba(0,0,0,.75)'], [1, 'rgba(0,0,0,0)']]), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -H / 2 - 0.02; vial.add(shadow);

  // ---- dust motes ----
  const N = 260, dp = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { dp[i * 3] = (Math.random() - 0.5) * 12; dp[i * 3 + 1] = (Math.random() - 0.5) * 8; dp[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1; }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xee8b9b, size: 0.025, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(dust);

  // ---- layout ----
  let mobile = false;
  function resize() {
    const w = innerWidth, h = innerHeight; mobile = w < 900;
    renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();

  // ---- loop ----
  let rx = 0, ry = 0, t0 = performance.now(), visible = true, peelS = 0;
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible) requestAnimationFrame(frame); });
  document.documentElement.classList.add('gl-on');
  const ease = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

  function frame(now) {
    if (!visible) return;
    requestAnimationFrame(frame);
    const t = (now - t0) / 1000;
    const onHome = S.view === 'home';
    const intro = Math.min(1, Math.max(0, S.intro == null ? 1 : S.intro)), ie = ease(intro);
    const hero = S.hero == null ? 1 : S.hero;
    if (!onHome && intro >= 1 && (Math.floor(t * 60) % 3)) return; // idle softly behind other views

    // placement: right of the copy on desktop, above it on phones
    const baseX = mobile ? 0 : 1.75, baseY = mobile ? 1.15 : 0.05, sc = mobile ? 0.78 : 1;
    const introX = mobile ? 0 : THREE.MathUtils.lerp(0, baseX, ie);
    vial.position.set(introX, THREE.MathUtils.lerp(-3.6, baseY, ie) + (reduce ? 0 : Math.sin(t * 0.8) * 0.04) + (1 - hero) * (mobile ? 0.9 : 0.4), 0);
    vial.scale.setScalar(sc * THREE.MathUtils.lerp(1.25, 1, ie));
    renderer.toneMappingExposure = THREE.MathUtils.lerp(0.15, 1.05, Math.min(1, intro * 1.4));
    key.position.x = THREE.MathUtils.lerp(-5, 3, ie);
    rim.intensity = 40 + Math.sin(t * 1.3) * 6;

    // rotation: slow idle, pointer tilt, scroll turn; the peel faces the viewer
    peelS += ((S.peel || 0) - peelS) * 0.08;
    const pk = Math.round(peelS * 200) / 200;
    if (pk !== lastPeel) { buildOuter(pk); lastPeel = pk; }
    rx += ((reduce ? 0 : S.py * 0.12) - rx) * 0.06;
    ry += ((reduce ? 0 : S.px * 0.35) - ry) * 0.06;
    const idle = reduce ? 0 : t * 0.18 * (1 - peelS);
    const base = idle + (1 - ie) * -2.4 + (1 - hero) * 1.3 + ry;
    const face = Math.round(base / (Math.PI * 2)) * Math.PI * 2 + ry * 0.3; // lot label square to the viewer
    spin.rotation.y = base + (face - base) * Math.min(1, peelS * 1.4);
    vial.rotation.x = rx + 0.04; vial.rotation.z = (1 - ie) * 0.08;
    halo.material.opacity = 0.35 + ie * 0.65;
    dust.rotation.y = t * 0.02; dust.position.y = Math.sin(t * 0.2) * 0.2;
    cam.position.z = THREE.MathUtils.lerp(7.2, 9, ie);
    renderer.render(scene, cam);
  }
  requestAnimationFrame(frame);
}
