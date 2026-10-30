/* SELECTION STUDIO · 3D helpers for the live modules (manifest-a). three.js r160 through the PEPTICITY STUDIO type engine.
   stage3d(canvas)      the engine's renderer + brand materials (gunmetal faces, UV-black sides, 0.68 edge hairline) + studio
                        reflections, drawn by the module's own FX.loop (one loop per module, sleeps with play/pause)
   pMesh(stage, ...)    the approved logo P (LOGO_P glyph from the dashboard table), matte gunmetal, never the font's cut-out P
   buildCoin(stage)     the OBJ-08 emblem coin exactly as the dashboards build it (UV-black disc, gunmetal rings,
                        PEPTICITY raised round both faces, the P in the middle) - sites/dashboard-color startMark()
   accentEdges(stage)   the 3D edge hairline takes ~35% of the chosen accent into its own light (dashboard ACC3D rule) */
import * as THREE from 'three';
import { createStage, glyphGeometries, makeWord, wallScene, fitCamera, EMBLEM } from './type3d.mjs';
export { THREE, glyphGeometries, makeWord, wallScene, fitCamera, EMBLEM };

export function stage3d(canvas, opt = {}) {
  const st = createStage(canvas);
  if (!st) return null;
  const R = st.renderer;
  if (opt.dpr) R.setPixelRatio(Math.min(devicePixelRatio || 1, opt.dpr));
  if (opt.shadows === false) R.shadowMap.enabled = false;
  let w = 0, h = 0;
  st.size = () => {
    const W = canvas.clientWidth || innerWidth, H = canvas.clientHeight || innerHeight;
    if (W !== w || H !== h) { w = W; h = H; R.setSize(W, H, false); return true; }
    return false;
  };
  st.aspect = () => (w || 1) / (h || 1);
  st.draw = (scene, camera) => { st.size(); R.setScissorTest(false); R.setViewport(0, 0, w, h); R.clear(); R.render(scene, camera); };
  st.size();
  return st;
}

const BASE_EDGE = [0xdc / 255, 0xd6 / 255, 0xff / 255];
export function accentEdges(mats, k = 0.35) {
  const list = Array.isArray(mats) ? mats : [mats];
  const apply = a => {
    const c = a.rgb.map(v => v / 255);
    list.forEach(m => m && m.color && m.color.setRGB(BASE_EDGE[0] + (c[0] - BASE_EDGE[0]) * k, BASE_EDGE[1] + (c[1] - BASE_EDGE[1]) * k, BASE_EDGE[2] + (c[2] - BASE_EDGE[2]) * k));
    window.FX && FX.wake();
  };
  window.FX ? FX.onAcc(apply) : null;
}
export function accentColor() { const c = (window.FX ? FX.acc.rgb : [212, 255, 58]).map(v => v / 255); return new THREE.Color(c[0], c[1], c[2]); }

/* the approved P: LOGO_P (dashboard glyph table), box-centred like the dashboards */
export function pMesh(stage, face = 'gunmetal', height = 1, depth = 0.1, bevel = 0.012, edgeMat) {
  const geo = glyphGeometries('regular', 'LOGO_P', { depth, bevel }), g = new THREE.Group(), inner = new THREE.Group(); g.add(inner);
  geo.parts.forEach(p => { const m = new THREE.Mesh(p.g, [stage.MAT[face], stage.MAT.uv]); m.castShadow = true; m.receiveShadow = true; inner.add(m); inner.add(new THREE.LineSegments(p.lg, edgeMat || stage.MAT.edge)); });
  inner.position.set(-(45 + 924.5) / 2000, -0.35, -depth / 2); g.scale.setScalar(height / 0.7);
  g.userData.width = (924.5 - 45) / 1000 * height / 0.7;
  return g;
}

/* OBJ-08 coin (dashboards): returns { coin, edge } where edge is the coin's own hairline material */
export function buildCoin(stage) {
  const M = stage.MAT;
  const edge = new THREE.LineBasicMaterial({ color: 0xdcd6ff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
  const ringGeo = (r0, r1, depth, bevel) => { const s = new THREE.Shape(); s.absarc(0, 0, r1, 0, Math.PI * 2, false);
    const h = new THREE.Path(); h.absarc(0, 0, r0, 0, Math.PI * 2, true); s.holes.push(h);
    return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * .8, bevelOffset: -bevel * .8, bevelSegments: 2, curveSegments: 96 }); };
  function face(group, zFront) {
    const f = new THREE.Group(), rd = 0.035;
    [[0.935, 1.0], [0.62, 0.655]].forEach(([a, b]) => f.add(new THREE.Mesh(ringGeo(a, b, rd, 0.008), [M.gunmetal, M.uv])));
    EMBLEM.layout.forEach(([ch, phi, up]) => {
      const X = EMBLEM.RC * Math.cos(phi), Y = EMBLEM.RC * Math.sin(phi); let obj;
      if (ch === '*') {
        const s = new THREE.Shape([[0, .028], [.028, 0], [0, -.028], [-.028, 0]].map(([x, y]) => new THREE.Vector2(x, y)));
        obj = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: rd, bevelEnabled: false }), [M.platinum, M.uv]);
      } else {
        const geo = glyphGeometries('regular', ch, { depth: 0.5, bevel: 0.04 }); obj = new THREE.Group(); const inner = new THREE.Group(); obj.add(inner);
        geo.parts.forEach(p => { inner.add(new THREE.Mesh(p.g, [M.gunmetal, M.uv])); inner.add(new THREE.LineSegments(p.lg, edge)); });
        inner.position.set(-geo.adv / 2, -0.35, 0); obj.scale.setScalar(EMBLEM.sc * 1000);
      }
      obj.position.set(X, Y, 0); obj.rotation.z = up ? phi + Math.PI / 2 : phi - Math.PI / 2; f.add(obj);
    });
    const P = pMesh(stage, 'gunmetal', 0.74, 0.09, 0.01, edge); P.position.z = 0.03; f.add(P);
    f.position.z = zFront; group.add(f); return f;
  }
  const coin = new THREE.Group(), discS = new THREE.Shape(); discS.absarc(0, 0, 0.985, 0, Math.PI * 2, false);
  const disc = new THREE.Mesh(new THREE.ExtrudeGeometry(discS, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 96 }), [M.uv, M.platinum]);
  disc.position.z = -0.035; coin.add(disc); face(coin, 0.047);
  const back = face(coin, 0); back.rotation.y = Math.PI; back.position.z = -0.047;
  return { coin, edge };
}

/* the dashboards' coin lighting (wallScene lights without the wall) */
export function coinLights(scene, keyPos = [1.6, 2.2, 3.6]) {
  const key = new THREE.DirectionalLight(0xffffff, 1.9); key.position.set(...keyPos); scene.add(key); scene.add(key.target);
  scene.add(new THREE.HemisphereLight(0xe8eaf0, 0x0c0a12, 0.22));
  const rim = new THREE.PointLight(0x7a5cff, 0.45, 6, 2); rim.position.set(-2.2, -0.8, 1.2); scene.add(rim);
  return { key, rim };
}

/* when WebGL is missing: show the flat fallback element and tell the page */
export function noGL(fallbackSel) {
  document.documentElement.classList.add('nogl');
  const el = fallbackSel && document.querySelector(fallbackSel); if (el) el.hidden = false;
}
