/* PEPTICITY v2 · real 3D layer (three.js r160 via the brand type engine, brand/font/type3d-engine.js).
   BACK canvas  (#gl-back, behind content):  OBJ-08 spinning centre emblem (P in the owner's BLACK font, PEPTICITY raised round the ring), rotates with scroll.
   FRONT canvas (#gl-front, above content):  the hero PEPTICITY wordmark in extruded metal, the 7 interest icons (chrome, UV sides),
                                             HOV-17 earth (lit, turning) with a nodes-and-edges network that lights on hover.
   If WebGL or the CDN is unavailable the page keeps its flat fallbacks (emblem.svg, CSS 3D type). */
window.type3dFallback = window.type3dFallback || function () {};
const D = document.documentElement;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOBILE = innerWidth < 900;

async function main() {
  const glyphs = await fetch('brand/font/glyphs.json').then(r => r.json());
  const tag = document.createElement('script'); tag.type = 'application/json'; tag.id = 'glyph-data';
  tag.textContent = JSON.stringify(glyphs); document.head.appendChild(tag);
  const THREE = await import('three');
  const E = await import('./brand/font/type3d-engine.js');
  const { createStage, glyphGeometries, makeWord, fitCamera } = E;
  const damp = (c, t, l, dt) => c + (t - c) * (1 - Math.exp(-l * dt));
  const isBlack = () => D.getAttribute('data-version') === 'black';

  function litScene(strength = 1) {
    const scene = new THREE.Scene();
    const key = new THREE.DirectionalLight(0xffffff, 1.6 * strength); key.position.set(2.5, 3, 4); scene.add(key);
    const fill = new THREE.HemisphereLight(0xeef1f6, 0x0c0a12, 0.5 * strength); scene.add(fill);
    const rim = new THREE.PointLight(0x9a8cff, 0.35 * strength, 8, 2); rim.position.set(-2.4, -1, 1.5); scene.add(rim);
    const camera = new THREE.PerspectiveCamera(26, 2, 0.1, 80);
    return { scene, camera };
  }
  function pMesh(stage, face, height, depth, bevel) {
    const geo = glyphGeometries('regular', 'P', { depth, bevel });
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner);
    let minx = Infinity, maxx = -Infinity;
    geo.parts.forEach(p => { p.g.computeBoundingBox(); minx = Math.min(minx, p.g.boundingBox.min.x); maxx = Math.max(maxx, p.g.boundingBox.max.x);
      inner.add(new THREE.Mesh(p.g, [stage.MAT[face], stage.MAT.uv])); inner.add(new THREE.LineSegments(p.lg, stage.MAT.edge)); });
    inner.position.set(-(minx + maxx) / 2, -0.35, -depth / 2); g.scale.setScalar(height / 0.7); return g;
  }
  const scrollFrac = () => (window.scrollY || 0) / Math.max(1, D.scrollHeight - innerHeight);

  /* ---------------- BACK: OBJ-08 emblem ---------------- */
  if (!MOBILE) {
    const back = createStage(document.getElementById('gl-back'));
    if (back) {
      const slot = document.createElement('div'); slot.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:-1'; document.body.appendChild(slot);
      const M = back.MAT, { scene, camera } = litScene(1.1);
      const ringGeo = (r0, r1, depth, bevel) => { const s = new THREE.Shape(); s.absarc(0, 0, r1, 0, Math.PI * 2, false); const h = new THREE.Path(); h.absarc(0, 0, r0, 0, Math.PI * 2, true); s.holes.push(h);
        return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * .8, bevelOffset: -bevel * .8, bevelSegments: 2, curveSegments: 96 }); };
      const coin = new THREE.Group();
      const discS = new THREE.Shape(); discS.absarc(0, 0, 0.985, 0, Math.PI * 2, false);
      const disc = new THREE.Mesh(new THREE.ExtrudeGeometry(discS, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 96 }), [M.uv, M.platinum]);
      disc.position.z = -0.035; coin.add(disc);
      const word = 'PEPTICITY', RC = 0.8, arc = 1.05;   /* letters along the top and bottom of the ring */
      function face(z, flip) {
        const f = new THREE.Group();
        [[0.935, 1.0], [0.62, 0.655]].forEach(([a, b]) => f.add(new THREE.Mesh(ringGeo(a, b, 0.035, 0.008), [M.platinum, M.uv])));
        [0, 1].forEach(up => [...word].forEach((ch, i) => {
          const geo = glyphGeometries('regular', ch, { depth: 0.2, bevel: 0.03 }); if (!geo) return;
          const o = new THREE.Group(), inner = new THREE.Group(); o.add(inner);
          geo.parts.forEach(p => inner.add(new THREE.Mesh(p.g, [M.gunmetal, M.uv])));
          inner.position.set(-geo.adv / 2, -0.35, 0); o.scale.setScalar(0.2);
          const t = (i / (word.length - 1) - 0.5) * arc * 2, phi = up ? Math.PI / 2 - t : -Math.PI / 2 + t;
          o.position.set(RC * Math.cos(phi), RC * Math.sin(phi), 0); o.rotation.z = up ? phi - Math.PI / 2 : phi + Math.PI / 2; f.add(o);
        }));
        const P = pMesh(back, 'platinum', 0.72, 0.042, 0.006); P.position.z = 0.025; f.add(P);
        f.position.z = z; if (flip) f.rotation.y = Math.PI; coin.add(f);
      }
      face(0.047, false); face(-0.047, true);
      scene.add(coin);
      const st = { a: 0, v: 0 };
      back.addSlot(slot, { scene, camera, fit: a => fitCamera(camera, 2.15, 2.15, a, Math.min(0.78, 0.78 * Math.min(1, a))),
        update(dt, t) {
          const target = scrollFrac() * Math.PI * 6;           /* rotates as they scroll */
          st.a = damp(st.a, target, 2.2, dt); st.v += dt * 0.06;
          coin.rotation.set(0.12 + Math.sin(st.a * 0.5) * 0.06, st.a + st.v, 0);
        } });
      addEventListener('scroll', () => back.kick(), { passive: true });
      D.classList.add('gl-back-on');
    }
  }

  /* ---------------- FRONT ---------------- */
  const front = createStage(document.getElementById('gl-front'));
  if (!front) return;
  const M = front.MAT;
  let pointer = { x: 0, y: 0 };
  addEventListener('pointermove', e => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });

  /* live 3D word panels: the brand-font page's wordSlot (makeWord + wallScene), one renderer for every slot */
  const { wallScene } = E;
  const clampN = (v, a, b) => Math.min(b, Math.max(a, v));
  function wordPanel(el) {
    const raw = el.dataset.word3d, phone = innerWidth < 760, funky = el.dataset.funky != null ? +el.dataset.funky : 0.6, fill = +(el.dataset.fill || 0.82);
    let lines = raw.split('|');
    if (!phone && el.clientWidth > 560 && raw.replace('|', ' ').length <= 24) lines = [lines.join(' ')];
    const group = new THREE.Group(), letters = []; let width = 0;
    const LH = 0.7, GAP = 0.26, H = lines.length * LH + (lines.length - 1) * GAP;
    lines.forEach((ln, k) => { const w = makeWord(front, ln, {}); w.group.position.y = H / 2 - LH / 2 - k * (LH + GAP); group.add(w.group); letters.push(...w.letters); width = Math.max(width, w.width); });
    const ratio = width / H;
    const asp = el.dataset.aspect && !(phone && lines.length > 1) ? +el.dataset.aspect * (phone ? 0.62 : 1) : clampN(ratio * (lines.length > 1 ? 0.5 : 0.3), phone ? 1.6 : 2.2, 7);
    el.style.aspectRatio = String(asp);
    const make = light => { const ws = wallScene(front, { light }); ws.key.shadow.mapSize.set(1024, 1024); ws.scene.environment = front.envRT.texture; return ws; };
    const dark = make(false); let light = null;
    const camera = dark.camera;
    const slot = { scene: dark.scene, camera };
    const place = () => { const lt = !isBlack(); if (lt && !light) light = make(true); const ws = lt ? light : dark; ws.scene.add(group); slot.scene = ws.scene; ws.camera = camera; };
    place(); document.addEventListener('pc-version', () => { place(); front.kick(); });
    const st = { ry: 0, rx: 0, l: letters.map(() => ({ ry: funky ? 1.2 : 0, z: 0 })) };
    slot.fit = a => fitCamera(camera, width, H, a, fill, 0);
    slot.update = (dt, t, prog, p) => {
      st.ry = damp(st.ry, p.x * 0.16, 3, dt); st.rx = damp(st.rx, p.y * 0.1, 3, dt);
      group.rotation.set(st.rx, st.ry, 0);
      if (funky) {
        const local = clampN((prog - 0.62) * 2.6, -1, 0), n = letters.length;   /* letters turn into place as the panel rises, then stay facing you */
        letters.forEach((L, i) => { const s = st.l[i], phase = (i - (n - 1) / 2) / n;
          s.ry = damp(s.ry, -local * (1.15 + phase * 1.4) * funky + Math.sin(t * 0.7 + i * 0.6) * 0.035, 5, dt);
          s.z = damp(s.z, Math.abs(local) * 0.07 * Math.sin(i * 1.7 + 1), 5, dt); L.rotation.y = s.ry; L.position.z = s.z; });
      }
    };
    front.addSlot(el, slot);
  }
  /* the loader words mount first so the entrance shows them at once; the rest follow after the first frames */
  const loaderOn = D.classList.contains('intro-on');
  document.querySelectorAll('.loader [data-word3d]').forEach(wordPanel);
  const rest = () => document.querySelectorAll('[data-word3d]').forEach(el => { if (!el.closest('.loader')) wordPanel(el); });
  if (loaderOn) await new Promise(res => { const t0 = performance.now(); (function w() { if ((window.__type3d && window.__type3d.frames > 2) || performance.now() - t0 > 4000) res(); else setTimeout(w, 80); })(); });
  rest();

  /* interest icons */
  function shapeMesh(shapes, depth = 0.16, bevel = 0.02) {
    const g = new THREE.Group();
    shapes.forEach(s => { const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.8, bevelOffset: -bevel * 0.4, bevelSegments: 2, curveSegments: 24 });
      geo.translate(0, 0, -depth / 2); g.add(new THREE.Mesh(geo, [M.platinum, M.uv])); });
    return g;
  }
  const V = (x, y) => new THREE.Vector2(x, y);
  const rect = (x, y, w, h, c = 0.03) => new THREE.Shape([V(x + c, y), V(x + w, y), V(x + w, y + h - c), V(x + w - c, y + h), V(x, y + h), V(x, y + c)]);
  const ICONS = {
    dumbbell: () => shapeMesh([rect(-0.62, -0.06, 1.24, 0.12, 0), rect(-0.5, -0.36, 0.14, 0.72), rect(0.36, -0.36, 0.14, 0.72), rect(-0.7, -0.24, 0.1, 0.48), rect(0.6, -0.24, 0.1, 0.48)]),
    bolt: () => shapeMesh([new THREE.Shape([V(0.12, 0.8), V(-0.42, -0.06), V(-0.04, -0.06), V(-0.14, -0.8), V(0.42, 0.1), V(0.04, 0.1)])]),
    gauge: () => { const s = new THREE.Shape(); s.absarc(0, 0, 0.72, Math.PI * 1.1, -Math.PI * 0.1, true); s.absarc(0, 0, 0.56, -Math.PI * 0.1, Math.PI * 1.1, false);
      const n = new THREE.Shape([V(-0.05, -0.02), V(0.36, 0.46), V(0.44, 0.4), V(0.05, -0.08)]); const hub = new THREE.Shape(); hub.absarc(0, 0, 0.1, 0, Math.PI * 2, false);
      return shapeMesh([s, n, hub]); },
    ring: () => { const s = new THREE.Shape(); s.absarc(0, 0, 0.7, Math.PI * 0.62, Math.PI * 2.38, false); s.absarc(0, 0, 0.54, Math.PI * 2.38, Math.PI * 0.62, true);
      const a = Math.PI * 0.62, cx = Math.cos(a) * 0.62, cy = Math.sin(a) * 0.62;
      const head = new THREE.Shape([V(cx - 0.2, cy + 0.08), V(cx + 0.16, cy + 0.2), V(cx + 0.06, cy - 0.2)]); return shapeMesh([s, head]); },
    drop: () => { const s = new THREE.Shape(); s.moveTo(0, 0.82); s.bezierCurveTo(0.2, 0.5, 0.56, 0.12, 0.56, -0.2); s.absarc(0, -0.2, 0.56, 0, Math.PI, true); s.bezierCurveTo(-0.56, 0.12, -0.2, 0.5, 0, 0.82); return shapeMesh([s]); },
    moon: () => { const s = new THREE.Shape(); s.absarc(0, 0, 0.72, Math.PI * 0.32, Math.PI * 1.68, false); s.absarc(0.3, 0, 0.6, Math.PI * 1.42, Math.PI * 0.58, true); return shapeMesh([s]); },
    hourglass: () => shapeMesh([rect(-0.5, 0.64, 1.0, 0.14), rect(-0.5, -0.78, 1.0, 0.14), new THREE.Shape([V(-0.4, 0.6), V(0.4, 0.6), V(0.07, 0), V(0.4, -0.6), V(-0.4, -0.6), V(-0.07, 0)])]),
    '55': () => { const w = makeWord(front, '55', { face: 'platinum', depth: 0.12, bevel: 0.012, edge: false, shadows: false }); const g = new THREE.Group(); g.add(w.group); g.scale.setScalar(1.3 / Math.max(w.width, 0.7)); return g; }
  };
  const iconSlots = new Set();
  function mountIcons() {
    document.querySelectorAll('[data-slot3d^="icon-"]').forEach(el => {
      if (iconSlots.has(el)) return; iconSlots.add(el);
      const name = el.dataset.slot3d.slice(5), make = ICONS[name]; if (!make) return;
      const { scene, camera } = litScene(1.3);
      const obj = make(); scene.add(obj);
      const card = el.closest('.int-card'); const st = { ry: 0, rx: 0, spin: 0, target: 0, i: iconSlots.size };
      if (card) { card.addEventListener('pointerenter', () => { st.target += Math.PI * 2; front.kick(); }); card.addEventListener('focus', () => { st.target += Math.PI * 2; front.kick(); }); }
      front.addSlot(el, { scene, camera, fit: a => fitCamera(camera, 1.7, 1.7, a, 0.86),
        update(dt, t, prog, p) {
          st.spin = damp(st.spin, st.target, 2.6, dt);
          st.ry = damp(st.ry, p.x * 0.4 + Math.sin(t * 0.7 + st.i) * 0.25, 3, dt); st.rx = damp(st.rx, p.y * 0.25, 3, dt);
          obj.rotation.set(st.rx, st.ry + st.spin, 0);
        } });
    });
  }
  mountIcons(); document.addEventListener('pc-slots', mountIcons);

  /* HOV-17 earth + nodes-and-edges network */
  const earthEl = document.getElementById('earth');
  if (earthEl) {
    const tl = new THREE.TextureLoader();
    const land = tl.load('assets/earth-land.webp'), lights = tl.load('assets/earth-lights.webp'), bump = tl.load('assets/earth-bump.webp');
    land.colorSpace = THREE.SRGBColorSpace; lights.colorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
    const key = new THREE.DirectionalLight(0xffffff, 3.2); key.position.set(-3, 2, 4); scene.add(key);
    scene.add(new THREE.AmbientLight(0xdfe4ee, 0.6));
    const world = new THREE.Group(); world.rotation.z = 0.36; scene.add(world);
    const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), new THREE.MeshStandardMaterial({
      map: land, bumpMap: bump, bumpScale: 2.2, roughness: 0.78, metalness: 0.12, color: 0xd9dee6,
      emissiveMap: lights, emissive: new THREE.Color(0xe8eeff), emissiveIntensity: 1.35 }));
    world.add(earth);
    const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.16, 64, 48), new THREE.ShaderMaterial({
      transparent: true, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { c: { value: new THREE.Color(0xdfe5ff) }, s: { value: 1 } },
      vertexShader: 'varying vec3 vN;varying vec3 vP;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vP=mv.xyz;gl_Position=projectionMatrix*mv;}',
      fragmentShader: 'uniform vec3 c;uniform float s;varying vec3 vN;varying vec3 vP;void main(){float f=pow(clamp(.6-dot(vN,normalize(-vP)),0.,1.),3.4)*s*.5;gl_FragColor=vec4(c*f,f);}' }));
    scene.add(atmo);
    /* the network: nodes on an outer shell, each joined to its nearest neighbours */
    const net = new THREE.Group(); world.add(net);
    const N = MOBILE ? 34 : 54, pts = [];
    for (let i = 0; i < N; i++) { const y = 1 - (i + 0.5) / N * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963; const R = 1.32 + ((i * 37) % 11) / 11 * 0.22; pts.push(new THREE.Vector3(Math.cos(th) * r * R, y * R, Math.sin(th) * r * R)); }
    const edges = [], adj = pts.map(() => []);
    pts.forEach((a, i) => { pts.map((b, j) => [j, a.distanceTo(b)]).filter(([j]) => j !== i).sort((x, y) => x[1] - y[1]).slice(0, 3).forEach(([j]) => {
      if (!edges.some(e => (e[0] === i && e[1] === j) || (e[0] === j && e[1] === i))) { edges.push([i, j]); adj[i].push(j); adj[j].push(i); } }); });
    const ePos = new Float32Array(edges.length * 6), eCol = new Float32Array(edges.length * 6);
    edges.forEach(([i, j], k) => { ePos.set([pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z], k * 6); });
    const eGeo = new THREE.BufferGeometry(); eGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3)); eGeo.setAttribute('color', new THREE.BufferAttribute(eCol, 3));
    const lines = new THREE.LineSegments(eGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    net.add(lines);
    const nodeGeo = new THREE.IcosahedronGeometry(0.03, 2), nodes = pts.map(p => { const m = new THREE.Mesh(nodeGeo, new THREE.MeshBasicMaterial({ color: 0xc9d0da, transparent: true })); m.position.copy(p); net.add(m); return m; });
    const halo = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); net.add(halo);
    const glow = new Float32Array(N), ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    let hover = -1;
    const section = document.getElementById('network');
    front.addSlot(earthEl, { scene, camera, fit: a => fitCamera(camera, 3.4, 3.4, a, 0.98),
      update(dt, t) {
        const sr = section.getBoundingClientRect(), sp = Math.min(1, Math.max(0, -sr.top / Math.max(1, sr.height - innerHeight)));
        world.rotation.y = t * 0.06 + sp * Math.PI * 1.2;   /* turns smoothly, faster as you scroll the elongated section */
        /* hover pick in this slot's own viewport */
        const r = earthEl.getBoundingClientRect();
        hover = -1;
        if (pointer.x > r.left && pointer.x < r.right && pointer.y > r.top && pointer.y < r.bottom) {
          ndc.set((pointer.x - r.left) / r.width * 2 - 1, -((pointer.y - r.top) / r.height * 2 - 1));
          camera.updateMatrixWorld(); ray.setFromCamera(ndc, camera); ray.params.Mesh = {};
          let best = 1e9; const v = new THREE.Vector3();
          nodes.forEach((m, i) => { m.getWorldPosition(v); const d = ray.ray.distanceSqToPoint(v); if (d < 0.012 && d < best) { best = d; hover = i; } });
        }
        for (let i = 0; i < N; i++) { const tgt = i === hover ? 1 : (hover > -1 && adj[hover].includes(i)) ? 0.7 : 0.12 + 0.08 * Math.sin(t * 1.4 + i); glow[i] = damp(glow[i], tgt, 6, dt);
          nodes[i].material.color.setScalar(0.55 + glow[i] * 0.45); nodes[i].scale.setScalar(1 + glow[i] * 1.2); }
        edges.forEach(([i, j], k) => { const g = Math.max(glow[i], glow[j]) * ((hover === i || hover === j) ? 1 : 0.55) + 0.06; for (let q = 0; q < 6; q++) eCol[k * 6 + q] = g * (q % 3 === 2 ? 1 : 0.93); });
        eGeo.attributes.color.needsUpdate = true;
        if (hover > -1) { halo.position.copy(nodes[hover].position); halo.material.opacity = 0.35; } else halo.material.opacity = damp(halo.material.opacity, 0, 6, dt);
        atmo.material.uniforms.s.value = 0.9 + 0.1 * Math.sin(t * 0.8);
      } });
    addEventListener('pointermove', () => front.kick(), { passive: true });
  }
  D.classList.add('gl-front-on');
  window.__gl = { front, ok: true };
}
main().catch(e => { console.warn('[gl3d] 3D layer unavailable, flat fallbacks stay', e); window.__gl = { ok: false, err: String(e) }; });
