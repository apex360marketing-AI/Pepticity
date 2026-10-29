/* PEPTICITY v2 · the MEMBER CARD in real 3D (three.js r160).
   A thick frosted-glass card (85.6 x 54 mm, 4.5 mm thick = twelve business cards), rounded corners, bevelled edges,
   MeshPhysicalMaterial transmission + RoomEnvironment reflections, a faint inner light that makes the edge glow,
   the approved P mark (brand/logo/p-mark.svg path, extruded, matte gunmetal) inlaid as the glowing chip with a slow breathing pulse,
   the peptide swirl (helix with beads, like the bottle) etched into the glass, and GUEST / JOIN / the member name in the PEPTICITY font.
   Motion: idle float + pointer tilt, a light sweep across the glass, tap = spring flip + chip flare, drag to turn.
   The scan (v2.js) drives lay() / sweep() / flare() through window.PCCard3D. If WebGL fails the flat DOM card stays. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const D = document.documentElement;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOBILE = innerWidth < 900;
const isBlack = () => D.getAttribute('data-version') === 'black';
const damp = (c, t, l, dt) => c + (t - c) * (1 - Math.exp(-l * dt));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* card in world units: 1 unit = 50 mm */
const CW = 85.6 / 50, CH = 54 / 50, CT = 4.5 / 50, CR = 3.4 / 50, BEV = 0.012;

async function main() {
  const btn = document.getElementById('mcard'); if (!btn) return;
  const gate = document.getElementById('gate');
  const glyphs = await fetch('brand/font/glyphs.json').then(r => r.json());

  const canvas = document.createElement('canvas'); canvas.className = 'mc3d'; canvas.setAttribute('aria-hidden', 'true');
  btn.appendChild(canvas);
  let renderer;
  try {
    if (!(canvas.getContext('webgl2') || canvas.getContext('webgl'))) throw new Error('no webgl');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: true });
  } catch (e) { canvas.remove(); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;

  let raf = 0, lastT = performance.now(), rw = 0, rh = 0;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment(renderer);
  const strip = new THREE.MeshBasicMaterial({ color: 0xffffff }); strip.color.setScalar(6);
  [[-5, 3, 2, .3, 7], [5.5, 2, 1, .25, 6], [0, 8, 3, 6, .3]].forEach(([x, y, z, w, h]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, .3), strip); m.position.set(x, y, z); room.add(m); });
  scene.environment = pmrem.fromScene(room, 0.025).texture;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 40);
  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(-2, 3, 4); scene.add(key);

  /* ---------- shapes ---------- */
  function rounded(w, h, r) {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
  }
  function chamfer(w, h, c) {
    const x = w / 2, y = h / 2;
    return new THREE.Shape([[-x + c, -y], [x - c, -y], [x, -y + c], [x, y - c], [x - c, y], [-x + c, y], [-x, y - c], [-x, -y + c]].map(p => new THREE.Vector2(p[0], p[1])));
  }
  /* the approved P mark: the exact path of brand/logo/p-mark.svg (the #pmark symbol in the page) */
  function pMarkShapes() {
    const d = document.querySelector('#pmark path').getAttribute('d');
    const rings = d.split('Z').map(s => s.trim()).filter(Boolean).map(seg => (seg.match(/-?\d*\.?\d+/g) || []).map(Number))
      .map(n => { const pts = []; for (let i = 0; i + 1 < n.length; i += 2) pts.push(new THREE.Vector2(n[i], -n[i + 1])); return pts; });
    const outer = new THREE.Shape(rings[0]);
    rings.slice(1).forEach(h => outer.holes.push(new THREE.Path(h)));
    return outer;
  }

  /* ---------- textures ---------- */
  function helix(x, cx, cy, len, amp, turns, bead, alpha, vertical) {
    /* the peptide swirl: one bead strand twisting round its axis, beads larger at the front of the twist */
    const N = Math.round(turns * 15);
    for (let pass = 0; pass < 2; pass++) for (let i = 0; i <= N; i++) {
      const t = i / N, a = t * turns * Math.PI * 2, depth = Math.cos(a), front = depth > 0;
      if ((pass === 0) === front) continue;                 /* back beads first, front beads on top */
      const along = (t - 0.5) * len, side = Math.sin(a) * amp * (0.55 + 0.45 * Math.sin(t * Math.PI));
      const px = vertical ? cx + side : cx + along, py = vertical ? cy + along : cy + side;
      const r = bead * (0.55 + 0.45 * (depth + 1) / 2);
      x.globalAlpha = alpha * (front ? 1 : 0.45);
      x.beginPath(); x.arc(px, py, r, 0, Math.PI * 2); x.stroke();
      x.globalAlpha = alpha * (front ? 0.6 : 0.25); x.beginPath(); x.arc(px - r * 0.3, py - r * 0.3, r * 0.35, 0, Math.PI * 2); x.fill();
    }
    x.globalAlpha = 1;
  }
  function coreTexture(back, black) {
    const c = document.createElement('canvas'); c.width = 1024; c.height = Math.round(1024 * CH / CW);
    const x = c.getContext('2d'), W = c.width, H = c.height;
    x.fillStyle = black ? '#07070a' : '#c3c8d0'; x.fillRect(0, 0, W, H);
    /* frost grain */
    const id = x.getImageData(0, 0, W, H), dd = id.data;
    for (let i = 0; i < dd.length; i += 4) { const n = (Math.random() - 0.5) * (black ? 7 : 10); dd[i] += n; dd[i + 1] += n; dd[i + 2] += n; }
    x.putImageData(id, 0, 0);
    /* a nice light inside the glass, pooled round the chip */
    const g = x.createRadialGradient(W * 0.5, H * 0.5, 4, W * 0.5, H * 0.5, W * 0.62);
    if (black) { g.addColorStop(0, 'rgba(236,238,255,.62)'); g.addColorStop(0.18, 'rgba(160,156,210,.28)'); g.addColorStop(0.5, 'rgba(60,56,92,.12)'); g.addColorStop(1, 'rgba(0,0,0,0)'); }
    else { g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.22, 'rgba(248,249,252,.9)'); g.addColorStop(0.55, 'rgba(226,230,236,.55)'); g.addColorStop(1, 'rgba(190,196,205,0)'); }
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    /* edge light: brighter near the rim so the edge glows */
    const e = x.createLinearGradient(0, 0, W, 0);
    e.addColorStop(0, black ? 'rgba(210,214,255,.22)' : 'rgba(255,255,255,.7)'); e.addColorStop(0.08, 'rgba(0,0,0,0)'); e.addColorStop(0.92, 'rgba(0,0,0,0)'); e.addColorStop(1, black ? 'rgba(210,214,255,.22)' : 'rgba(255,255,255,.7)');
    x.fillStyle = e; x.fillRect(0, 0, W, H);
    /* the etched peptide swirl watermark */
    x.strokeStyle = black ? '#e6e8f4' : '#6b7077'; x.fillStyle = x.strokeStyle; x.lineWidth = 2;
    if (back) helix(x, W * 0.5, H * 0.5, W * 0.82, H * 0.2, 3.2, 12, black ? 0.34 : 0.4, false);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  /* the etch: the peptide swirl cut into the glass itself (seen from both faces, like a real etch) */
  function etchTexture(black) {
    const c = document.createElement('canvas'); c.width = 1024; c.height = Math.round(1024 * CH / CW);
    const x = c.getContext('2d'), W = c.width, H = c.height;
    x.fillStyle = black ? '#000' : '#fff'; x.fillRect(0, 0, W, H);
    x.strokeStyle = black ? '#fff' : '#3a3e44'; x.fillStyle = x.strokeStyle; x.lineWidth = 2.2;
    helix(x, W * 0.8, H * 0.5, H * 0.8, W * 0.055, 2.6, 9, 1, true);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    t.repeat.set(1 / CW, 1 / CH); t.offset.set(0.5, 0.5); return t;
  }
  function radialTex() {
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
    const g = x.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.32, 'rgba(240,242,255,.62)'); g.addColorStop(0.6, 'rgba(225,228,250,.2)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c);
  }

  /* ---------- the card ---------- */
  const card = new THREE.Group(), tiltG = new THREE.Group(), rig = new THREE.Group();
  rig.add(tiltG); tiltG.add(card); scene.add(rig);

  const bodyGeo = new THREE.ExtrudeGeometry(rounded(CW - BEV * 2, CH - BEV * 2, CR), { depth: CT - BEV * 2, bevelEnabled: true, bevelThickness: BEV, bevelSize: BEV, bevelSegments: 4, curveSegments: 14 });
  bodyGeo.translate(0, 0, -(CT - BEV * 2) / 2);
  const glass = new THREE.MeshPhysicalMaterial({ transmission: 0.86, roughness: 0.34, thickness: CT, ior: 1.5, metalness: 0,
    clearcoat: 1, clearcoatRoughness: 0.14, specularIntensity: 1, envMapIntensity: 1.25, transparent: true, side: THREE.FrontSide });
  const edgeMat = new THREE.MeshPhysicalMaterial({ transmission: 0.8, roughness: 0.22, thickness: CT, ior: 1.5, metalness: 0,
    clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 1.1, transparent: true, emissive: new THREE.Color(0xe8eaf6), emissiveIntensity: 0.3 });
  const body = new THREE.Mesh(bodyGeo, [glass, edgeMat]); body.renderOrder = 2; card.add(body);

  /* light core inside the glass: front face + back face, back to back */
  const coreGeo = new THREE.ShapeGeometry(rounded(CW * 0.93, CH * 0.895, CR * 0.8), 12);
  const uvFix = g => { const p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / (CW * 0.93) + 0.5, p.getY(i) / (CH * 0.895) + 0.5); uv.needsUpdate = true; return g; };
  uvFix(coreGeo);
  const coreF = new THREE.Mesh(coreGeo, new THREE.MeshBasicMaterial({ toneMapped: false }));
  const coreB = new THREE.Mesh(coreGeo, new THREE.MeshBasicMaterial({ toneMapped: false }));
  coreF.position.z = 0.002; coreB.position.z = -0.002; coreB.rotation.y = Math.PI;
  card.add(coreF, coreB);

  /* the chip: the approved P, inlaid and glowing */
  const chip = new THREE.Group(); card.add(chip);
  const plateGeo = new THREE.ExtrudeGeometry(chamfer(0.46, 0.38, 0.06), { depth: 0.012, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2 });
  const plateMat = new THREE.MeshPhysicalMaterial({ color: 0x0e0c14, metalness: 0.6, roughness: 0.3, sheen: 1, sheenColor: new THREE.Color(0x4b3b86), sheenRoughness: 0.35, clearcoat: 0.7, clearcoatRoughness: 0.2, envMapIntensity: 0.8 });
  const plate = new THREE.Mesh(plateGeo, plateMat); plate.position.z = CT / 2 - 0.012; chip.add(plate);
  const rimPts = chamfer(0.46, 0.38, 0.06).getPoints(); rimPts.push(rimPts[0].clone());
  const chipRim = new THREE.Line(new THREE.BufferGeometry().setFromPoints(rimPts.map(p => new THREE.Vector3(p.x, p.y, CT / 2 + 0.0045))),
    new THREE.LineBasicMaterial({ color: 0xe6e8ff, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
  chip.add(chipRim);
  const pShape = pMarkShapes();
  const pGeo = new THREE.ExtrudeGeometry(pShape, { depth: 0.035, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.01, bevelOffset: -0.01, bevelSegments: 3, curveSegments: 6 });
  pGeo.translate(0, 0, -0.0175);
  const gunmetal = new THREE.MeshPhysicalMaterial({ color: 0x6f6e68, metalness: 0.9, roughness: 0.5, clearcoat: 0.06, clearcoatRoughness: 0.6, envMapIntensity: 0.55 });   /* matte gunmetal, never white */
  const uvSide = new THREE.MeshPhysicalMaterial({ color: 0x0e0c14, metalness: 0.55, roughness: 0.32, sheen: 1, sheenColor: new THREE.Color(0x4b3b86), sheenRoughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: 0.7,
    emissive: new THREE.Color(0xd8dcff), emissiveIntensity: 0 });
  const pMesh = new THREE.Mesh(pGeo, [gunmetal, uvSide]);
  const PS = 0.21; pMesh.scale.set(PS, PS, 1); pMesh.position.z = CT / 2 - 0.0215; chip.add(pMesh);   /* inlaid: the face sits a hair proud of the plate, the body runs down into the glass */
  /* the P's hairline of light on every edge (brand font rule: edge opacity 0.68) */
  const pEdgePts = [];
  [pShape.getPoints(), ...pShape.holes.map(h => h.getPoints())].forEach(r => r.forEach((a, i) => { const b = r[(i + 1) % r.length]; pEdgePts.push(a.x * PS, a.y * PS, CT / 2 + 0.0082, b.x * PS, b.y * PS, CT / 2 + 0.0082); }));
  const pEdgeGeo = new THREE.BufferGeometry(); pEdgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(pEdgePts, 3));
  const pEdge = new THREE.LineSegments(pEdgeGeo, new THREE.LineBasicMaterial({ color: 0xdcd6ff, transparent: true, opacity: 0.68, blending: THREE.AdditiveBlending, depthWrite: false }));
  chip.add(pEdge);
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.15), new THREE.MeshBasicMaterial({ map: radialTex(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.4, toneMapped: false }));
  halo.position.z = CT / 2 + 0.003; halo.renderOrder = 5; chip.add(halo);
  /* the back carries a smaller P, no chip */
  const pBack = new THREE.Mesh(pGeo, [gunmetal, uvSide]); pBack.scale.set(0.085, 0.085, 0.4); pBack.rotation.y = Math.PI; pBack.position.set(-CW * 0.38, CH * 0.33, -CT / 2 - 0.004); card.add(pBack);

  /* light sweep + scan line: one additive shader on both faces, clipped to the card */
  const sweepMat = (dir) => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { u: { value: -1 }, k: { value: 0.0 }, s: { value: -1 }, ks: { value: 0 }, tint: { value: new THREE.Color(1, 1, 1) } },
    vertexShader: 'varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `uniform float u,k,s,ks;uniform vec3 tint;varying vec2 vP;
      void main(){vec2 q=vec2(vP.x/${CW.toFixed(4)}+.5,vP.y/${CH.toFixed(4)}+.5);
        float d=(q.x*${dir.toFixed(1)}+q.y*.45)-u;float band=exp(-d*d*90.)*.55+exp(-d*d*900.)*.5;
        float l=abs(q.x-s);float scan=exp(-l*l*9000.)*1.4+exp(-l*l*260.)*.25;
        float a=band*k+scan*ks;gl_FragColor=vec4(tint*a,a);}` });
  const faceGeo = new THREE.ShapeGeometry(rounded(CW, CH, CR), 14);
  const sweepF = new THREE.Mesh(faceGeo, sweepMat(1)); sweepF.position.z = CT / 2 + 0.0015; sweepF.renderOrder = 6;
  const sweepB = new THREE.Mesh(faceGeo, sweepMat(-1)); sweepB.position.z = -CT / 2 - 0.0015; sweepB.rotation.y = Math.PI; sweepB.renderOrder = 6;
  card.add(sweepF, sweepB);

  /* ---------- the words, in the PEPTICITY font ---------- */
  const textFace = new THREE.MeshPhysicalMaterial({ color: 0x9a9993, metalness: 0.86, roughness: 0.42, clearcoat: 0.1, envMapIntensity: 0.8 });
  const textSide = uvSide.clone(); textSide.emissiveIntensity = 0;
  const edgeLine = new THREE.LineBasicMaterial({ color: 0xdcd6ff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
  const gCache = new Map();
  function glyph(ch) {
    if (gCache.has(ch)) return gCache.get(ch);
    const G = glyphs.regular[ch]; if (!G) { gCache.set(ch, null); return null; }
    const S = 1 / 1000, parts = G.p.map(p => {
      const sh = new THREE.Shape(p.o.map(([x, y]) => new THREE.Vector2(x * S, y * S)));
      p.h.forEach(h => sh.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x * S, y * S)))));
      const g = new THREE.ExtrudeGeometry(sh, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.01, bevelOffset: -0.01, bevelSegments: 1, curveSegments: 2 });
      const pts = []; [p.o, ...p.h].forEach(r => r.forEach(([x0, y0], i) => { const [x1, y1] = r[(i + 1) % r.length]; pts.push(x0 * S, y0 * S, 0.0625, x1 * S, y1 * S, 0.0625); }));
      const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      return { g, lg };
    });
    const r = { parts, adv: G.adv * S }; gCache.set(ch, r); return r;
  }
  function words(str, cap, track = 0.06, maxW = 9) {
    const grp = new THREE.Group(); let x = 0; const kern = glyphs.kern || {};
    const chars = [...String(str).toUpperCase()];
    chars.forEach((ch, i) => {
      const G = glyph(ch); if (!G) { x += 0.32 + track; return; }
      const o = new THREE.Group(); o.position.x = x;
      G.parts.forEach(p => { o.add(new THREE.Mesh(p.g, [textFace, textSide])); o.add(new THREE.LineSegments(p.lg, edgeLine)); });
      grp.add(o); x += G.adv + track + (kern[ch + (chars[i + 1] || '')] || 0) / 1000;
    });
    const s = Math.min(cap / 0.7, maxW / Math.max(x, 0.001));
    grp.scale.set(s, s, 0.12); grp.userData.w = x * s; return grp;
  }
  const front = new THREE.Group(), back = new THREE.Group(); card.add(front, back);
  back.rotation.y = Math.PI;
  const Lx = -CW / 2 + 0.11, zF = CT / 2 + 0.0005;
  let nameG = null, tierG = null, backG = null, last = { name: '', tier: '', joined: null, notches: -1 };
  const mark = words('PEPTICITY', 0.062, 0.05); mark.position.set(Lx, CH / 2 - 0.15, zF); front.add(mark);
  const notchMat = [new THREE.MeshBasicMaterial({ color: 0x6b7077, transparent: true, opacity: 0.55 }), new THREE.MeshBasicMaterial({ color: 0xf4f6ff, toneMapped: false })];
  const notches = []; const nw = (CW - 0.22 - 9 * 0.018) / 10;
  for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(nw, 0.009), notchMat[0]); m.position.set(Lx + nw / 2 + i * (nw + 0.018), -CH / 2 + 0.085, zF + 0.001); notches.push(m); front.add(m); }

  const mcName = document.getElementById('mcName'), mcTier = document.getElementById('mcTier'), mcNotch = document.getElementById('mcNotch');
  function syncText() {
    const name = (mcName.textContent || 'GUEST').trim().toUpperCase().slice(0, 22), tier = (mcTier.textContent || '').trim().toUpperCase();
    const lit = mcNotch ? mcNotch.querySelectorAll('i.on').length : 0, joined = /FOUNDING/.test(tier);
    if (name !== last.name) { if (nameG) front.remove(nameG); nameG = words(name, 0.1, 0.07, CW * 0.62); nameG.position.set(Lx, -CH / 2 + 0.15, zF); front.add(nameG); }
    if (tier !== last.tier) { if (tierG) front.remove(tierG); tierG = words(tier, 0.04, 0.12, CW * 0.6); tierG.position.set(Lx, -CH / 2 + 0.3, zF); front.add(tierG); }
    if (joined !== last.joined) {
      if (backG) back.remove(backG);
      backG = new THREE.Group();
      const big = words(joined ? 'MEMBER' : 'JOIN', 0.15, 0.08), sub = words(joined ? 'PEPTICITY TEAM · FOUNDING' : 'THE PEPTICITY TEAM', 0.042, 0.12);
      big.position.set(-big.userData.w / 2, -0.06, 0); sub.position.set(-sub.userData.w / 2, -0.21, 0);
      backG.add(big, sub); backG.position.z = CT / 2 + 0.0005; back.add(backG);
    }
    if (lit !== last.notches) notches.forEach((m, i) => { m.material = notchMat[i < lit ? 1 : 0]; });
    last = { name, tier, joined, notches: lit }; kick();
  }
  syncText();
  new MutationObserver(syncText).observe(mcName.parentNode, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['class'] });

  /* ---------- versions ---------- */
  const tex = { white: [coreTexture(false, false), coreTexture(true, false), etchTexture(false)], black: [coreTexture(false, true), coreTexture(true, true), etchTexture(true)] };
  function setLook() {
    const b = isBlack(), v = b ? 'black' : 'white';
    coreF.material.map = tex[v][0]; coreB.material.map = tex[v][1]; coreF.material.needsUpdate = coreB.material.needsUpdate = true;
    glass.color.set(b ? 0x6a6a74 : 0xf2f4f8); glass.attenuationColor.set(b ? 0x4a4a58 : 0xffffff); glass.attenuationDistance = b ? 0.12 : 2;
    if (b) { glass.map = null; glass.emissiveMap = tex.black[2]; glass.emissive.set(0xe6e8f4); glass.emissiveIntensity = 0.26; }
    else { glass.emissiveMap = null; glass.emissive.set(0x000000); glass.map = tex.white[2]; }
    glass.needsUpdate = true;
    glass.transmission = b ? 0.9 : 0.78; glass.envMapIntensity = b ? 0.5 : 1.2; glass.clearcoat = b ? 0.7 : 1;
    edgeMat.color.set(b ? 0x34343a : 0xf6f7fa); edgeMat.emissive.set(b ? 0xe4e6f4 : 0xffffff);
    textFace.color.set(b ? 0xa3a29b : 0x3d3d3a); textFace.roughness = b ? 0.4 : 0.5;
    edgeLine.opacity = b ? 0.5 : 0.22;
    notchMat[0].color.set(b ? 0x6b7077 : 0x9aa1aa);
    sweepF.material.uniforms.tint.value.setScalar(b ? 1 : 0.85);
    kick();
  }
  setLook(); document.addEventListener('pc-version', setLook);

  /* ---------- motion ---------- */
  const st = { flip: 0, flipT: 0, flipV: 0, tx: 0, ty: 0, drag: null, dragX: 0, dragY: 0, lay: 0, layT: 0, flare: 0, scan: -1, scanK: 0,
    sweepAt: 1.2, t: 0, pointerIn: false, px: 0, py: 0 };
  const api = window.PCCard3D = {
    flip() { st.flipT += Math.PI; st.flare = Math.max(st.flare, 1); kick(); },
    flare() { st.flare = 1.4; kick(); },
    face() { st.flipT = Math.round(st.flipT / (Math.PI * 2)) * Math.PI * 2; kick(); },
    lay(v) { st.layT = v ? 1 : 0; kick(); },
    sweep(dur = 0.9) { st.scanStart = performance.now(); st.scanDur = dur * 1000; kick(); },
    spin(turns = 1) { st.flipT += Math.PI * 2 * turns; kick(); },
    get ok() { return true; }
  };

  /* drag to turn (v2.js ignores the click that ends a drag); tap is handled in v2.js -> PCCard3D.flip() or the scan */
  btn.addEventListener('pointerdown', e => {
    if (btn.dataset.lock === '1') return;
    st.drag = { x: e.clientX, y: e.clientY, f0: st.flip, moved: false, lx: e.clientX, lt: performance.now(), v: 0 };
  });
  addEventListener('pointermove', e => {
    const r = btn.getBoundingClientRect();
    st.px = clamp(((e.clientX - r.left) / r.width - 0.5) * 2, -1.6, 1.6); st.py = clamp(((e.clientY - r.top) / r.height - 0.5) * 2, -1.6, 1.6);
    st.pointerIn = e.clientX > r.left - 40 && e.clientX < r.right + 40 && e.clientY > r.top - 40 && e.clientY < r.bottom + 40;
    if (st.drag) {
      const dx = e.clientX - st.drag.x, dy = e.clientY - st.drag.y;
      if (!st.drag.moved && Math.hypot(dx, dy) > 7) { st.drag.moved = true; btn.dataset.dragged = '1'; try { btn.setPointerCapture(e.pointerId); } catch (_) {} }
      if (st.drag.moved) {
        const now = performance.now(), k = Math.PI / Math.max(180, r.width * 0.9);
        st.flip = st.flipT = st.drag.f0 + dx * k; st.dragY = clamp(-dy * 0.004, -0.5, 0.5);
        st.drag.v = (e.clientX - st.drag.lx) * k / Math.max(8, now - st.drag.lt) * 1000; st.drag.lx = e.clientX; st.drag.lt = now;
      }
    }
    kick();
  }, { passive: true });
  const endDrag = () => {
    if (!st.drag) return;
    if (st.drag.moved) {
      st.flipV = clamp(st.drag.v, -14, 14);
      st.flipT = Math.round((st.flip + st.flipV * 0.18) / Math.PI) * Math.PI;   /* a flick carries it on; it settles on a face */
      st.dragY = 0; setTimeout(() => { delete btn.dataset.dragged; }, 30);
    }
    st.drag = null; kick();
  };
  addEventListener('pointerup', endDrag); addEventListener('pointercancel', endDrag);

  /* ---------- render loop ---------- */
  function visible() { return gate && gate.style.visibility !== 'hidden' && getComputedStyle(gate).visibility !== 'hidden' && btn.offsetWidth > 0; }
  function fit() {
    const W = canvas.clientWidth, H = canvas.clientHeight; if (!W || !H) return false;
    if (W !== rw || H !== rh) { rw = W; rh = H; renderer.setSize(W, H, false); camera.aspect = W / H; }
    /* the card spans the button (the canvas overhangs it for tilt and flip room) */
    const bw = btn.clientWidth, cover = bw / W, vfov = camera.fov * Math.PI / 180;
    const dist = (CW / cover) / (2 * Math.tan(vfov / 2) * camera.aspect);
    camera.position.set(0, 0, dist); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();
    return true;
  }
  function frame(now) {
    raf = 0;
    const dt = Math.min(Math.max((now - lastT) / 1000, 0), 1 / 20); lastT = now;
    if (!visible() || !fit()) { setTimeout(kick, 250); return; }   /* parked while the gate is hidden */
    const m = REDUCED ? 0 : 1; st.t += dt * m;
    /* spring flip (stiff, slightly underdamped) */
    if (!st.drag) {
      if (REDUCED) { st.flip = st.flipT; st.flipV = 0; }
      else { const k = 60, c = 9.5; st.flipV += ((st.flipT - st.flip) * k - st.flipV * c) * dt; st.flip += st.flipV * dt; }
    }
    st.lay = REDUCED ? st.layT : damp(st.lay, st.layT, 4.2, dt);
    const tiltOn = st.pointerIn && !st.drag && st.lay < 0.05;
    st.tx = damp(st.tx, tiltOn ? st.px * 0.22 : 0, 5, dt); st.ty = damp(st.ty, tiltOn ? st.py * 0.18 : 0, 5, dt);
    st.dragX = damp(st.dragX, st.dragY, 8, dt);
    const fl = Math.sin(st.t * 1.05), fl2 = Math.sin(st.t * 0.7 + 1.3);
    rig.position.y = (fl * 0.018) * (1 - st.lay) * m;
    rig.rotation.set((fl2 * 0.035) * m * (1 - st.lay) - st.lay * 1.02, (Math.sin(st.t * 0.5) * 0.05) * m * (1 - st.lay), 0);
    tiltG.rotation.set(st.ty + st.dragX, st.tx, 0);
    card.rotation.y = st.flip;
    /* chip: slow breathing pulse + flare on tap / scan */
    st.flare = Math.max(0, st.flare - dt * 0.9);
    const breathe = REDUCED ? 0.6 : 0.5 + 0.5 * Math.sin(st.t * 1.5), f = Math.min(1.4, st.flare);
    const b = isBlack();
    halo.material.opacity = (b ? 0.34 : 0.55) + breathe * (b ? 0.3 : 0.3) + f * 0.9;
    halo.scale.setScalar(1 + breathe * 0.08 + f * 0.35);
    uvSide.emissiveIntensity = 0.12 + breathe * 0.25 + f * 1.4;
    chipRim.material.opacity = 0.35 + breathe * 0.35 + f * 0.6;
    edgeMat.emissiveIntensity = (b ? 0.16 : 0.12) + breathe * 0.08 + f * 0.45;
    coreF.material.color.setScalar(0.9 + breathe * 0.1 + f * 0.25); coreB.material.color.setScalar(0.92 + f * 0.25);
    /* the light sweep: every ~6.5 s, left to right */
    const per = 6.5, ph = ((st.t + 3) % per) / per, sw = REDUCED ? -1 : -0.4 + ph * 2.4;
    sweepF.material.uniforms.u.value = sw; sweepF.material.uniforms.k.value = REDUCED ? 0 : (b ? 0.55 : 0.7);
    sweepB.material.uniforms.u.value = sw; sweepB.material.uniforms.k.value = REDUCED ? 0 : (b ? 0.5 : 0.6);
    /* the scan line (driven by the scan) */
    if (st.scanStart) {
      const q = (now - st.scanStart) / st.scanDur;
      if (q >= 1) { st.scanStart = 0; sweepF.material.uniforms.ks.value = 0; }
      else { sweepF.material.uniforms.s.value = -0.05 + q * 1.1; sweepF.material.uniforms.ks.value = Math.sin(Math.min(1, q) * Math.PI) * 1.3 + 0.2; }
    }
    renderer.render(scene, camera);
    window.__card3d.frames++;
    const busy = Math.abs(st.flipT - st.flip) > 0.001 || Math.abs(st.flipV) > 0.001 || st.flare > 0 || st.scanStart || Math.abs(st.lay - st.layT) > 0.001 || st.drag;
    if (!REDUCED || busy) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  window.__card3d = { frames: 0, st, renderer, kick };
  addEventListener('resize', kick); addEventListener('scroll', kick, { passive: true });
  D.classList.add('card3d-on');
  kick();
}
main().catch(e => { console.warn('[card3d] 3D card unavailable, the flat card stays', e); });
