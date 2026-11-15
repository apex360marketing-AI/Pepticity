/* PEPTICITY LOGO · BLUE (preview for Tyson, 15 Nov 2026).
   G1 GOLD LIGHT CORE (Apex_Agents_Bots design/logo/pepticity-flarecut, core.src.html) rebuilt in blue:
   - the EXACT P from PEPTICITY BLACK with the FLARE CUT beam, and the PEPTICITY wordmark (marks.json from build.py, unchanged)
   - P faces: black chrome glass (smoked liquid black glass over chrome, clearcoat); a chrome-gold core layer and
     platinum edges show at rest
   - the beam: the ONE blue #2a78ff with a #cfe6ff core line, thin, small halo; it keeps its colour (never washed white)
   - tinted metals, tinted studio light, controlled exposure; rest pose turned 12 degrees
   - the P turns slowly (one full turn every 9 s, then rests); the word stays still while the light sweeps across it
   Use: <div data-pep-logo="lockup|mark|word"><img class="pep-logo-fallback" src="..." alt="PEPTICITY"></div>
   then load this file as a module. Each slot gets its own canvas; the fallback picture stays if WebGL is off. */
const MARKS = /*MARKS*/null;
const THREE_URL = new URL('./three/three.module.js', import.meta.url).href;

const slots = [...document.querySelectorAll('[data-pep-logo]')];
if (slots.length) boot().catch(e => { console.warn('[PEP] blue logo 3d off:', e && e.message); });

async function boot() {
  const THREE = await import(THREE_URL);
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches || location.hash === '#still';
  const t0 = document.createElement('canvas');
  if (!(t0.getContext('webgl2') || t0.getContext('webgl'))) throw new Error('no webgl');

  // ---- shapes from marks.json (y down) -> three (y up), centred on ox, oy
  const toShapes = (list, ox, oy) => list.map(p => {
    const v = ([x, y]) => new THREE.Vector2(x - ox, oy - y);
    let o = p.o.map(v); if (THREE.ShapeUtils.isClockWise(o)) o = o.reverse();
    const s = new THREE.Shape(o);
    p.h.forEach(h => { let hh = h.map(v); if (!THREE.ShapeUtils.isClockWise(hh)) hh = hh.reverse(); s.holes.push(new THREE.Path(hh)); });
    return s;
  });
  const extrude = (list, depth, bevel, z = 0, ox = 50, oy = 50) => {
    const g = new THREE.ExtrudeGeometry(toShapes(list, ox, oy), { depth, bevelEnabled: true, bevelThickness: bevel,
      bevelSize: bevel * 0.7, bevelOffset: -bevel * 0.35, bevelSegments: 4, curveSegments: 10, steps: 1 });
    g.translate(0, 0, -depth / 2 + z); return g;
  };
  const D = MARKS, yb = 50 - D.p.yb;
  const G = {
    shF: extrude(D.p.face, 2.7, 1.5, 2.15), shB: extrude(D.p.face, 2.7, 0.8, -2.15), mid: extrude(D.p.rim, 1.9, 0.12, 0),
    beam: extrude(D.p.beam, 2.0, 0.4, 2.6),
    wF: extrude(D.word, 3.6, 2.2, 2.7, 0, 0), wB: extrude(D.word, 3.6, 1.0, -2.7, 0, 0), wM: extrude(D.wordRim, 2.2, 0.15, 0, 0, 0)
  };

  // ---- materials: tinted metals and a clearcoat black glass face
  const phys = o => new THREE.MeshPhysicalMaterial(Object.assign({ metalness: 1 }, o));
  const M = {
    glass: new THREE.MeshPhysicalMaterial({ color: 0x4a5262, metalness: 1, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.03,
      envMapIntensity: 1.5 }),                 // smoked liquid black glass over chrome
    plat: phys({ color: 0xd6dbe2, roughness: 0.1, envMapIntensity: 1.3 }),   // platinum edges
    gold: phys({ color: 0xcfb07a, roughness: 0.12, envMapIntensity: 1.4 }), // chrome gold core (her pale chrome gold, never orange)
    goldHi: phys({ color: 0xe6d2a6, roughness: 0.08, envMapIntensity: 1.4 })
  };
  const BLUE = 0x2a78ff, CORE = 0xcfe6ff;
  const beamMat = new THREE.MeshBasicMaterial({ color: BLUE, toneMapped: false });
  const coreMat = new THREE.MeshBasicMaterial({ color: CORE, toneMapped: false });

  function halo(w) {
    const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d');
    const g = x.createRadialGradient(128, 32, 0, 128, 32, 128);
    g.addColorStop(0, 'rgba(207,230,255,.9)'); g.addColorStop(.12, 'rgba(42,120,255,.55)'); g.addColorStop(.42, 'rgba(42,120,255,.10)'); g.addColorStop(1, 'rgba(42,120,255,0)');
    x.setTransform(1, 0, 0, .2, 0, 25.6); x.fillStyle = g; x.fillRect(0, -200, 256, 600);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const sp = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.16), new THREE.MeshBasicMaterial({ map: tex, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    sp.position.set(0, yb, 4.3); return sp;
  }
  function buildMark() {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(G.shF, [M.glass, M.gold]), new THREE.Mesh(G.shB, [M.glass, M.plat]), new THREE.Mesh(G.mid, [M.gold, M.goldHi]));
    g.add(new THREE.Mesh(G.beam, beamMat));
    const core = new THREE.Mesh(G.beam, coreMat); core.scale.set(0.97, 0.28, 1.05); core.position.y = yb * (1 - 0.28); g.add(core);
    g.add(halo(104));
    const l = new THREE.PointLight(BLUE, 520, 40, 2); l.position.set(0, yb, 7); g.add(l);
    g.scale.setScalar(0.1);
    return g;
  }
  function buildWord() {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(G.wF, [M.glass, M.gold]), new THREE.Mesh(G.wB, [M.glass, M.plat]), new THREE.Mesh(G.wM, [M.gold, M.goldHi]));
    g.scale.setScalar(0.0345);
    return g;
  }

  const damp = (c, t, l, dt) => c + (t - c) * (1 - Math.exp(-l * dt));
  const live = [];
  for (const el of slots) {
    const kind = el.dataset.pepLogo || 'lockup';
    const canvas = document.createElement('canvas');
    canvas.className = 'pep-logo-canvas'; canvas.setAttribute('aria-hidden', 'true');
    el.appendChild(canvas);
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' }); }
    catch (e) { canvas.remove(); continue; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12;   // controlled: colour holds when still

    // the studio room, tinted: cool-blue key boxes, one warm-platinum strip for the gold, a dark room so black glass stays black
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new THREE.Scene();
    room.add(new THREE.Mesh(new THREE.SphereGeometry(30, 32, 16), new THREE.MeshBasicMaterial({ color: 0x101217, side: THREE.BackSide })));
    const box = (x, y, z, w, h, d, hex, k, rz = 0) => { const m = new THREE.MeshBasicMaterial({ color: hex }); m.color.multiplyScalar(k);
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.lookAt(0, 0, 0); b.rotateZ(rz); room.add(b); };
    box(0, 14, 6, 14, 14, .4, 0xdfe9ff, 4.2);      // top key, cool
    box(-12, 2, 6, .8, 16, .8, 0xcfe0ff, 11);      // left strip, cool
    box(12, 4, 2, .6, 14, .6, 0xfff3dc, 8);        // right strip, warm platinum (lights the gold)
    box(0, 7, 20, 22, 5, .4, 0xe6eeff, 2.6);
    box(-4, -3, 21, 9, 1.2, .4, 0x9fc2ff, 5);      // low blue strip across the front
    box(0, -9, 14, 22, 3, .4, 0x2a78ff, 1.6);      // blue floor bounce
    box(0, 2, 24, 34, 20, .4, 0x7884a0, 2.4);      // dim front fill: the black glass face mirrors a dark wall, not white
    box(3, 3, 23, 4, 30, .4, 0xdfe9ff, 9, 0.55);  // the liquid streak: one bright diagonal softbox across the front and centre
    box(-7, -2, 23, 1.2, 26, .4, 0xbcd4ff, 5, 0.55);
    box(0, 16, 14, 30, 2, .4, 0xffe9c4, 9);          // warm top strip: the gold chamfers catch it at rest
    box(-9, 10, 18, 2, 10, .4, 0xffefd6, 7, 0.9);
    box(-22, 0, 4, 3, 22, .4, 0xd6e4ff, 6); box(22, 0, 4, 3, 22, .4, 0xffeed4, 5);   // side strips: a turning P never goes dead black
    box(-14, -6, 16, 10, 12, .4, 0xc9d6ee, 1.6); box(14, -4, 16, 8, 12, .4, 0xf2e6cf, 1.4);
    const env = pmrem.fromScene(room, 0.02); pmrem.dispose();

    const scene = new THREE.Scene(); scene.environment = env.texture;
    const camera = new THREE.PerspectiveCamera(22, 1, 0.1, 200);
    let mark = null, word = null;
    if (kind !== 'word') { mark = buildMark(); scene.add(mark); }
    if (kind !== 'mark') { word = buildWord(); scene.add(word); }
    // lockup layout: P on the left, the word to its right, the whole centred; P 8.2 tall, word cap 3.45
    let spanW = 10, spanH = 10;
    if (mark && word) { mark.position.x = -15.2; word.position.set(5.6, -0.15, 0); spanW = 42; spanH = 9.6; }
    else if (word) { spanW = 30.5; spanH = 4.6; }
    else { spanW = 11; spanH = 9.8; }
    const s = { el, kind, canvas, renderer, scene, camera, mark, word, spanW, spanH, ry: -0.21, rx: -0.04, visible: true, phase: Math.random() * 3, w: 0, h: 0 };
    live.push(s);
  }
  if (!live.length) return;

  const io = new IntersectionObserver(es => { es.forEach(e => { const s = live.find(q => q.el === e.target); if (s) s.visible = e.isIntersecting; }); kick(); }, { rootMargin: '60px' });
  live.forEach(s => io.observe(s.el));

  let raf = 0, last = performance.now(), t = 0;
  const REST = -0.21;   // 12 degrees, never flat
  function frame(now) {
    raf = 0; const dt = Math.min(Math.max((now - last) / 1000, 0), 1 / 15); last = now; if (!REDUCED) t += dt;
    for (const s of live) {
      if (!s.visible) continue;
      const r = s.el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4 || getComputedStyle(s.el).visibility === 'hidden') continue;
      if (r.width !== s.w || r.height !== s.h) { s.w = r.width; s.h = r.height; s.renderer.setSize(r.width, r.height, false); }
      const aspect = r.width / r.height; s.camera.aspect = aspect; s.camera.updateProjectionMatrix();
      const tan = Math.tan(s.camera.fov * Math.PI / 360);
      s.camera.position.set(0, 0, Math.max(s.spanH / 2 / tan, s.spanW / 2 / (tan * aspect)) * 1.08);
      if (s.mark) {
        // rests at 12 degrees with a slight sway, then makes one slow full turn every 9 s (it never parks mirrored)
        const c = (t + s.phase) % 9, k = Math.min(1, Math.max(0, (c - 5.4) / 3.6));
        const turn = REDUCED ? 0 : Math.floor((t + s.phase) / 9) * Math.PI * 2 + (k * k * (3 - 2 * k)) * Math.PI * 2;
        const yaw = REST + (REDUCED ? 0 : Math.sin(t * 0.45 + s.phase) * 0.06) + turn;
        s.ry = REDUCED ? REST : damp(s.ry, yaw, 5, dt);
        s.mark.rotation.set(-0.05, s.ry, 0);
      }
      if (s.word) {
        s.word.rotation.set(-0.03, s.mark ? -0.16 : -0.2, 0);                    // still, turned a little toward the P
        s.scene.environmentRotation.set(0, REDUCED ? 0.35 : Math.sin(t * 0.5 + s.phase) * 0.6, 0);   // the light sweeps
      }
      s.renderer.render(s.scene, s.camera);
      if (!s.ready) { s.ready = true; s.el.setAttribute('data-pep-logo-live', ''); }
    }
    if (!REDUCED && !document.hidden && live.some(s => s.visible)) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  addEventListener('scroll', kick, { passive: true }); addEventListener('resize', kick);
  document.addEventListener('visibilitychange', kick);
  window.__pepLogoBlue = { get slots() { return live.length; } };
  kick();
}
