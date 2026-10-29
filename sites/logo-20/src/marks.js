// PEPTICITY · 20 animated 3D logo choices. One renderer (createStage from brand/font/type3d-engine.js), 21 scissor slots.
const stage = createStage(document.getElementById('gl'));
const PI = Math.PI, TAU = PI * 2;
const ease = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const sat = x => clamp(x, 0, 1);
const QP = new URLSearchParams(location.search), FORCE = QP.has('p') ? +QP.get('p') : QP.has('sheet') ? .5 : null;

// ------------------------------------------------------------------ materials: mirror chrome + brushed gunmetal only
const BR = stage.MAT.gunmetal.map;
const M = {
  chrome: new THREE.MeshPhysicalMaterial({ color: 0xf2f4f7, metalness: 1, roughness: 0.07, envMapIntensity: 1.35 }),
  satin: new THREE.MeshPhysicalMaterial({ color: 0xdde1e6, metalness: 1, roughness: 0.2, roughnessMap: BR, envMapIntensity: 1.15 }),
  gun: new THREE.MeshPhysicalMaterial({ color: 0x6a6d73, metalness: 0.9, roughness: 0.46, map: BR, roughnessMap: BR, envMapIntensity: 0.75, clearcoat: 0.1, clearcoatRoughness: 0.5 }),
  dark: new THREE.MeshPhysicalMaterial({ color: 0x2b2c30, metalness: 0.9, roughness: 0.36, map: BR, roughnessMap: BR, envMapIntensity: 0.6 }),
};
M.chromeFlat = M.chrome.clone(); M.chromeFlat.flatShading = true;
M.gunFlat = M.gun.clone(); M.gunFlat.flatShading = true;
for (const k in M) { M[k].polygonOffset = true; M[k].polygonOffsetFactor = 1; M[k].polygonOffsetUnits = 1; }
// the shared word builder uses MAT[face] for faces and MAT.uv for sides: keep it chrome + gunmetal
stage.MAT.chrome = M.chrome; stage.MAT.uv = M.dark;

// ------------------------------------------------------------------ geometry helpers
const V2 = p => new THREE.Vector2(p[0], p[1]);
function shp(pts, holes = []) { const s = new THREE.Shape(pts.map(V2)); holes.forEach(h => s.holes.push(new THREE.Path(h.map(V2)))); return s; }
function ext(s, depth = 0.2, bevel = 0.025, face = M.chrome, side = M.gun) {
  let g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel * 0.9, bevelOffset: -bevel * 0.9,
    bevelSegments: MOBILE ? 1 : 2, curveSegments: 4, steps: 1 });
  g = toCreasedNormals(g, 0.6); g = regroupBevel(g); g.translate(0, 0, -depth / 2);
  return new THREE.Mesh(g, [face, side]);
}
const crect = (w, h, c) => [[-w / 2 + c, -h / 2], [w / 2 - c, -h / 2], [w / 2, -h / 2 + c], [w / 2, h / 2 - c], [w / 2 - c, h / 2], [-w / 2 + c, h / 2], [-w / 2, h / 2 - c], [-w / 2, -h / 2 + c]];
const poly = (n, r, rot = 0) => Array.from({ length: n }, (_, i) => [Math.cos(rot + i * TAU / n) * r, Math.sin(rot + i * TAU / n) * r]);
const ring = (n, R, r, rot = 0) => shp(poly(n, R, rot), [poly(n, r, rot).reverse()]);
const shift = (pts, dx, dy = 0, s = 1) => pts.map(([x, y]) => [(x + dx) * s, (y + dy) * s]);
// the font's P (glyphs.json "regular"), centred, height 0.7*s
function glyphShapes(ch, s = 1, mirror = false) {
  const G = GLYPHS.regular[ch], cx = G.adv / 2, f = 0.001 * s;
  return G.p.map(p => shp(p.o.map(([x, y]) => [(mirror ? cx - x : x - cx) * f, (y - 350) * f]), p.h.map(h => h.map(([x, y]) => [(mirror ? cx - x : x - cx) * f, (y - 350) * f]))));
}
function glyph(ch, { s = 2.3, depth = 0.3, bevel = 0.03, face = M.chrome, side = M.gun, mirror = false } = {}) {
  const g = new THREE.Group(); glyphShapes(ch, s, mirror).forEach(sh => g.add(ext(sh, depth, bevel, face, side))); return g;
}
// angular P drawn in the font's rules: split stem + bowl, 45 degree cuts (height 2)
const AP_STEM = [[-.62, -.88], [-.5, -1], [-.24, -1], [-.24, .62], [-.62, 1]];
const AP_BOWL = [[-.45, 1], [.38, 1], [.74, .64], [.74, .16], [.38, -.2], [-.08, -.2], [-.08, .16], [.24, .16], [.34, .26], [.34, .54], [.24, .64], [-.09, .64]];
const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
const grp = (...c) => { const g = new THREE.Group(); c.forEach(o => g.add(o)); return g; };

// ------------------------------------------------------------------ the 20 marks. update(p, t): p = 0 entering, .5 centred, 1 leaving
const DEFS = [
  { n: 'FORGED P', d: 'The P from the font, cut deep in mirror chrome on a gunmetal plate that turns to a diamond.', build() {
    const plate = ext(shp(crect(2.0, 2.0, .42)), .14, .03, M.gun, M.dark); plate.position.z = -.36;
    const P = glyph('P', { s: 2.35, depth: .34, bevel: .035 });
    return { g: grp(plate, P), update(p, t) { const e = ease(sat(p * 1.2 - .1)); P.rotation.y = (e - .5) * TAU; plate.rotation.z = e * PI / 4; P.position.z = .06 + Math.sin(t * 1.3) * .04; } };
  } },
  { n: 'HEX CORE', d: 'A chrome hexagon cage around a gunmetal core with the P. Cage and core turn against each other.', build() {
    const cage = ext(ring(6, 1.12, .9, PI / 6), .16, .03, M.chrome, M.gun);
    const core = ext(shp(poly(6, .78, PI / 6)), .1, .025, M.gun, M.dark); core.position.z = -.12;
    const P = glyph('P', { s: 1.45, depth: .16, bevel: .02 }); P.position.z = .05;
    const inner = grp(core, P);
    return { g: grp(cage, inner), update(p, t) { cage.rotation.y = (p - .5) * PI * 1.4; cage.rotation.z = p * PI / 3; inner.rotation.y = -(p - .5) * PI * .8 + Math.sin(t * .8) * .08; } };
  } },
  { n: 'HELIX LADDER', d: 'The peptide swirl: two chrome strands of cut diamonds joined by gunmetal rungs. Scroll winds it tighter.', build() {
    const g = new THREE.Group(), N = 13, beads = [], rungs = [];
    const oct = new THREE.OctahedronGeometry(.11);
    for (let i = 0; i < N; i++) for (let k = 0; k < 2; k++) { const m = new THREE.Mesh(oct, k ? M.chromeFlat : M.chromeFlat); m.scale.set(1, 1.5, 1); beads.push(m); g.add(m); }
    for (let i = 0; i < N; i++) { const r = box(1, .035, .035, M.gun); rungs.push(r); g.add(r); }
    return { g, update(p, t) {
      const tw = 1.3 + sat(Math.abs(p - .5) * 2) * 1.6, rad = .62, ph = t * .5 + p * TAU;
      for (let i = 0; i < N; i++) { const y = (i / (N - 1) - .5) * 2.1, a = ph + (i / (N - 1)) * TAU * tw / 2;
        const A = beads[i * 2], B = beads[i * 2 + 1];
        A.position.set(Math.cos(a) * rad, y, Math.sin(a) * rad); B.position.set(-Math.cos(a) * rad, y, -Math.sin(a) * rad);
        A.rotation.y = B.rotation.y = -a; const r = rungs[i]; r.position.set(0, y, 0); r.rotation.y = -a; r.scale.x = rad * 2 - .2; }
    } };
  } },
  { n: 'SHARD P', d: 'The P split into two shards inside a chamfered frame. They fly apart and lock back as it reaches the centre.', build() {
    const stem = ext(shp(shift(AP_STEM, -.06)), .26, .03, M.chrome, M.gun);
    const bowl = ext(shp(shift(AP_BOWL, -.06)), .26, .03, M.satin, M.gun);
    const fr = ext(ring(4, 1.48, 1.32, PI / 4), .08, .02, M.gun, M.dark); fr.position.z = -.25;
    return { g: grp(fr, stem, bowl), update(p, t) { const s = ease(sat(Math.abs(p - .5) * 2.2)), w = Math.sin(t * 1.1) * .02;
      stem.position.set(-s * .7, -s * .35, s * .5 + w); stem.rotation.set(s * .5, -s * 1.1, s * .4);
      bowl.position.set(s * .6, s * .4, -s * .2 - w); bowl.rotation.set(-s * .4, s * 1.2, -s * .3); fr.rotation.z = PI / 4 * 0 + s * PI / 4; } };
  } },
  { n: 'RANK CHEVRONS', d: 'Three 45 degree chevrons stacked like a rank badge. Each flips over in turn as you scroll.', build() {
    const chev = (a, d) => shp([[-a, 0], [0, a], [a, 0], [a - d, 0], [0, a - d], [-a + d, 0]]);
    const g = new THREE.Group(), cs = [];
    [M.chrome, M.gun, M.chrome].forEach((m, i) => { const c = ext(chev(1.05, .32), .2, .03, m, i === 1 ? M.dark : M.gun);
      const piv = grp(c); c.position.y = -.52; piv.position.y = .62 - i * .58; g.add(piv); cs.push(piv); });
    return { g, update(p, t) { cs.forEach((c, i) => { c.rotation.x = ease(sat((p - .1 - i * .08) / .2)) * TAU; c.position.z = Math.sin(t * 1.2 + i) * .03; }); } };
  } },
  { n: 'GYRO RINGS', d: 'Three octagon rings in chrome and gunmetal spin on different axes around a cut chrome core.', build() {
    const r1 = ext(ring(8, 1.12, 1.0, PI / 8), .1, .02, M.chrome, M.gun);
    const r2 = ext(ring(8, .9, .79, PI / 8), .1, .02, M.gun, M.dark);
    const r3 = ext(ring(8, .68, .58, PI / 8), .09, .02, M.chrome, M.gun);
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(.34), M.chromeFlat);
    return { g: grp(r1, r2, r3, core), update(p, t) { const s = p * TAU; r1.rotation.set(s * .5 + .4, t * .25, 0); r2.rotation.set(0, s * .75 + t * .2, .5); r3.rotation.set(-s, 0, t * .3); core.rotation.set(t * .4, s, 0); } };
  } },
  { n: 'MOLECULE NODE', d: 'Hexagon atoms in chrome, linked by brushed gunmetal bonds. The chain turns and each atom spins.', build() {
    const g = new THREE.Group(), pts = poly(6, .6, PI / 6).map(([x, y]) => [x - .25, y + .1]);
    pts.push([pts[0][0] + .62, pts[0][1] + .36], [pts[0][0] + .62 + .5, pts[0][1] - .1], [pts[3][0] - .55, pts[3][1] - .45]);
    const links = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 6], [6, 7], [3, 8]], nodes = [];
    links.forEach(([a, b]) => { const A = pts[a], B = pts[b], L = Math.hypot(B[0] - A[0], B[1] - A[1]); const l = box(L, .05, .05, M.gun);
      l.position.set((A[0] + B[0]) / 2, (A[1] + B[1]) / 2, 0); l.rotation.z = Math.atan2(B[1] - A[1], B[0] - A[0]); g.add(l); });
    pts.forEach(([x, y], i) => { const n = ext(shp(poly(6, i > 5 ? .13 : .17)), .12, .025, i > 5 ? M.satin : M.chrome, M.gun); n.position.set(x, y, 0); g.add(n); nodes.push(n); });
    return { g, update(p, t) { g.rotation.y = (p - .5) * PI * 1.3; g.rotation.z = p * .6 - .3; nodes.forEach((n, i) => { n.rotation.z = t * .6 + i + p * PI; n.rotation.y = (p - .5) * 2; }); } };
  } },
  { n: 'MIRROR PP', d: 'Two Ps back to back, chrome and gunmetal, forming one emblem. They open like a book as you scroll.', build() {
    const a = glyph('P', { s: 2.1, depth: .22, bevel: .03 }), b = glyph('P', { s: 2.1, depth: .22, bevel: .03, mirror: true, face: M.gun, side: M.dark });
    const off = (730 / 2 - 45) * .0021; a.position.set(off, 0, .14); b.position.set(-off, 0, -.14);
    const pa = grp(a), pb = grp(b);
    return { g: grp(pa, pb), update(p, t) { const k = ease(sat(Math.abs(p - .5) * 2.2)); pa.rotation.y = -k * 1.1; pb.rotation.y = k * 1.1; pa.position.y = pb.position.y = Math.sin(t) * .03; } };
  } },
  { n: 'KEYSTONE VAULT', d: 'A gunmetal keystone with the P cut through it. The chrome P rises out of the cut as you scroll.', build() {
    const K = [[-1, .7], [-.7, 1], [.7, 1], [1, .7], [1, -.35], [0, -1.25], [-1, -.35]];
    const hole = glyphShapes('P', 1.75)[0].getPoints().map(v => [v.x, v.y + .08]).reverse();
    const plate = ext(shp(K, [hole]), .2, .03, M.gun, M.dark);
    const rimIn = K.map(([x, y]) => [x * .9, y * .9 - .03]).reverse();
    const rim = ext(shp(K.map(([x, y]) => [x * 1.06, y * 1.06]), [rimIn]), .12, .02, M.chrome, M.gun); rim.position.z = .1;
    const P = glyph('P', { s: 1.62, depth: .2, bevel: .025 }); P.position.y = .08;
    return { g: grp(plate, rim, P), update(p, t) { const k = ease(sat((p - .05) / .4)); P.position.z = -.05 + k * .3; P.rotation.y = (1 - k) * TAU; plate.rotation.y = rim.rotation.y = (p - .5) * .9; } };
  } },
  { n: 'TWIST STACK', d: 'Seven thin Ps stacked in depth. Scroll twists them into a peptide swirl and back.', build() {
    const g = new THREE.Group(), L = [];
    for (let i = 0; i < 7; i++) { const m = glyph('P', { s: 2.1, depth: .05, bevel: .012, face: i % 2 ? M.gun : M.chrome, side: M.dark }); m.position.z = (i - 3) * .11; g.add(m); L.push(m); }
    return { g, update(p, t) { const tw = .3 + Math.abs(p - .5) * 1.6 + Math.sin(t * .7) * .04; L.forEach((m, i) => { m.rotation.z = (i - 3) * tw * .3; m.position.z = (i - 3) * (.11 + tw * .06); }); g.rotation.y = (p - .5) * 1.4; } };
  } },
  { n: 'APERTURE BLADES', d: 'Six angled blades, like a camera iris. Scroll opens the iris to reveal a chrome hexagon.', build() {
    const g = new THREE.Group(), bl = [];
    const B = shp([[-.08, -.13], [1.0, -.13], [1.12, -.01], [.66, .45], [.04, .45]]);
    for (let i = 0; i < 6; i++) { const m = ext(B, .06, .015, i % 2 ? M.gun : M.satin, M.dark); const piv = grp(m); m.position.set(-.06, -.14, 0);
      const arm = grp(piv); piv.position.set(.62, 0, 0); arm.rotation.z = i * TAU / 6; arm.position.z = i * .025; g.add(arm); bl.push(piv); }
    const hex = ext(shp(poly(6, .42, PI / 6)), .2, .03, M.chrome, M.gun); hex.position.z = -.12; g.add(hex);
    return { g, update(p, t) { const o = ease(sat(Math.abs(p - .5) * 2.2)); bl.forEach(b => b.rotation.z = 1.85 - o * 1.25); g.rotation.z = p * PI / 3 + t * .05; hex.rotation.z = -p * PI; } };
  } },
  { n: 'DIAMOND GRID', d: 'The P drawn in cut chrome diamonds. A wave flips them one by one as you scroll.', build() {
    const map = ['XXX.', 'X..X', 'X..X', 'XXX.', 'X...', 'X...'], g = new THREE.Group(), D = [];
    const dia = shp(poly(4, .2, 0));
    map.forEach((row, r) => [...row].forEach((c, k) => { const on = c === 'X'; if (!on) return; const m = ext(dia, on ? .14 : .04, on ? .025 : .01, on ? M.chrome : M.dark, M.gun);
      if (!on) m.scale.setScalar(.55); m.position.set((k - 1.5) * .38, (2.5 - r) * .38, on ? 0 : -.1); m.userData.k = r + k; g.add(m); if (on) D.push(m); }));
    return { g, update(p, t) { D.forEach(m => { const k = ease(sat((p - .08) / .25 - m.userData.k * .08)); m.rotation.y = k * PI; m.rotation.x = Math.sin(t * .8 + m.userData.k) * .1; }); g.rotation.y = (p - .5) * .6; } };
  } },
  { n: 'VAULT CUBE', d: 'A chamfered gunmetal cube with a chrome P set into every side. It tumbles a quarter turn at a time.', build() {
    const c = ext(shp(crect(1.25, 1.25, .26)), 1.25, .05, M.gun, M.gun);
    const g = grp(c);
    for (let i = 0; i < 4; i++) { const P = glyph('P', { s: 1.2, depth: .06, bevel: .015 }); const f = grp(P); P.position.z = .68; f.rotation.y = i * PI / 2; g.add(f); }
    return { g, update(p, t) { const steps = p * 4, k = Math.floor(steps), f = ease(sat((steps - k) * 1.6)); g.rotation.y = (k + f) * PI / 2 - .5; g.rotation.x = .35 + Math.sin(t * .6) * .05; } };
  } },
  { n: 'TRI BLADE', d: 'A triangle of three split bars with 45 degree cuts. Each bar twists on its own axis as you scroll.', build() {
    const g = new THREE.Group(), R = 1.2, rin = R / 2, side = R * Math.sqrt(3), th = .28, gap = .07, bars = [];
    const L = side, cut = th * Math.sqrt(3);
    const S = shp([[-L / 2 + gap, -th / 2], [L / 2 - gap, -th / 2], [L / 2 - gap - cut, th / 2], [-L / 2 + gap + cut, th / 2]]);
    for (let i = 0; i < 3; i++) { const a = -PI / 2 + i * TAU / 3; const m = ext(S, .2, .025, i === 1 ? M.gun : M.chrome, i === 1 ? M.dark : M.gun);
      const piv = grp(m); piv.position.set(Math.cos(a) * (rin - th / 2), Math.sin(a) * (rin - th / 2), 0); piv.rotation.z = a + PI / 2; g.add(piv); bars.push(m); }
    g.position.y = .1;
    return { g, update(p, t) { bars.forEach((b, i) => { b.rotation.x = ease(sat((p - .05 - i * .08) / .22)) * TAU; }); g.rotation.z = (p - .5) * PI * 2 / 3 + Math.sin(t * .5) * .03; } };
  } },
  { n: 'SEGMENT RING', d: 'Eight chrome and gunmetal arcs with angled ends. They push out and rotate, then close into a ring.', build() {
    const g = new THREE.Group(), segs = [];
    for (let i = 0; i < 8; i++) { const a0 = i * TAU / 8 + .06, a1 = (i + 1) * TAU / 8 - .06, R = 1.1, r = .82, n = 6, pts = [];
      for (let k = 0; k <= n; k++) { const a = a0 + (a1 - a0) * k / n; pts.push([Math.cos(a) * R, Math.sin(a) * R]); }
      for (let k = n; k >= 0; k--) { const a = a0 + .05 + (a1 - a0) * k / n; pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
      const m = ext(shp(pts), .16, .02, i % 2 ? M.gun : M.chrome, i % 2 ? M.dark : M.gun); const piv = grp(m); g.add(piv); segs.push({ piv, a: (a0 + a1) / 2 }); }
    const d = new THREE.Mesh(new THREE.OctahedronGeometry(.28, 0), M.chromeFlat); d.scale.set(.8, 1.2, .8); g.add(d);
    return { g, update(p, t) { const o = ease(sat(Math.abs(p - .5) * 2.2)); segs.forEach(({ piv, a }, i) => { piv.position.set(Math.cos(a) * o * .25, Math.sin(a) * o * .25, (i % 2 ? 1 : -1) * o * .2); piv.rotation.z = o * .25 * (i % 2 ? 1 : -1); });
      g.rotation.z = p * PI / 2 + t * .08; d.rotation.y = t * .7 + p * TAU; } };
  } },
  { n: 'VORTEX COIL', d: 'An octagonal coil of split chrome bars that screws into depth like a tunnel as you scroll.', build() {
    const g = new THREE.Group(), N = 30, segs = [];
    for (let i = 0; i < N; i++) { const m = box(1, .09, .09, i % 2 ? M.gun : M.chrome); g.add(m); segs.push(m); }
    const a = new THREE.Vector3(), b = new THREE.Vector3(), X1 = new THREE.Vector3(1, 0, 0);
    return { g, update(p, t) { const pitch = .012 + sat(Math.abs(p - .5) * 2) * .06, spin = p * TAU + t * .15;
      const P = i => { const r = 1.08 - i * .022, ang = spin + i * TAU / 8; return [Math.cos(ang) * r, Math.sin(ang) * r, -i * pitch + N * pitch / 2]; };
      segs.forEach((m, i) => { a.set(...P(i)); b.set(...P(i + 1)); m.position.copy(a).lerp(b, .5); m.scale.x = a.distanceTo(b) * .86; m.quaternion.setFromUnitVectors(X1, b.clone().sub(a).normalize()); });
      g.rotation.x = -.35; g.rotation.y = (p - .5) * .5; } };
  } },
  { n: 'OCTA STAR', d: 'Two eight-point stars, chrome over gunmetal, turning against each other and parting in depth.', build() {
    const star = (R, r) => Array.from({ length: 16 }, (_, i) => { const a = i * PI / 8 + PI / 16, q = i % 2 ? r : R; return [Math.cos(a) * q, Math.sin(a) * q]; });
    const back = ext(shp(star(1.15, .88), [poly(8, .36, PI / 8).reverse()]), .14, .025, M.gun, M.dark);
    const front = ext(shp(star(.92, .7), [poly(8, .36, PI / 8).reverse()]), .14, .025, M.chrome, M.gun);
    const core = ext(shp(poly(4, .24, 0)), .3, .03, M.chrome, M.gun);
    return { g: grp(back, front, core), update(p, t) { const s = ease(sat(Math.abs(p - .5) * 2.2)); front.rotation.z = p * PI / 2; back.rotation.z = -p * PI / 2 + PI / 16; front.position.z = .1 + s * .35; back.position.z = -.1 - s * .2; core.rotation.y = p * TAU; core.rotation.z = t * .2; } };
  } },
  { n: 'LAYER PLATES', d: 'The split P in three layers, chrome, satin and gunmetal, that fan out at 45 degrees as you scroll.', build() {
    const L = [[M.chrome, M.gun], [M.satin, M.dark], [M.gun, M.dark]].map(([f, s]) => grp(ext(shp(shift(AP_STEM, -.06)), .12, .02, f, s), ext(shp(shift(AP_BOWL, -.06)), .12, .02, f, s)));
    return { g: grp(...L), update(p, t) { const s = .3 + sat(Math.abs(p - .5) * 2) * .9; L.forEach((l, i) => { l.position.set(i * s * .22, -i * s * .22, -i * (.16 + s * .3)); l.rotation.y = (p - .5) * .8; }); } };
  } },
  { n: 'AMINO CHAIN', d: 'A chain of chevron links like a peptide bond. A wave runs along it as you scroll.', build() {
    const g = new THREE.Group(), N = 7, ch = [];
    const C = shp([[-.18, .26], [0, .26], [.22, 0], [0, -.26], [-.18, -.26], [.04, 0]]);
    for (let i = 0; i < N; i++) { const m = ext(C, .16, .02, i % 2 ? M.gun : M.chrome, i % 2 ? M.dark : M.gun); g.add(m); ch.push(m); }
    return { g, update(p, t) { const amp = .25 + Math.sin(sat(p) * PI) * .3, ph = p * TAU + t * .6;
      ch.forEach((m, i) => { const x = (i - (N - 1) / 2) * .34, y = Math.sin(ph + i * .9) * amp, dy = Math.cos(ph + i * .9) * amp * .9 * 2.6;
        m.position.set(x, y, Math.cos(ph + i * .9) * .15); m.rotation.z = Math.atan2(dy, 1) * .5; m.rotation.x = Math.sin(ph + i) * .4; }); g.rotation.y = (p - .5) * .7; } };
  } },
  { n: 'SPLIT DISC', d: 'A chamfered disc split by a 45 degree cut. The halves slide apart along the cut to show the P inside.', build() {
    const g = .045;
    const Lp = [[-1, .5], [-.5, 1], [-.1 - g, 1], [-.1 - g, .1], [.1 - g, -.1], [.1 - g, -1], [-.5, -1], [-1, -.5]];
    const Rp = [[-.1 + g, 1], [.5, 1], [1, .5], [1, -.5], [.5, -1], [.1 + g, -1], [.1 + g, -.1], [-.1 + g, .1]];
    const l = ext(shp(Lp), .26, .03, M.chrome, M.gun), r = ext(shp(Rp), .26, .03, M.gun, M.dark);
    const P = glyph('P', { s: 1.25, depth: .14, bevel: .02 }); P.position.z = -.22;
    return { g: grp(P, l, r), update(p, t) { const o = .1 + ease(sat(Math.abs(p - .5) * 2.2)) * .9; l.position.set(-o * .55, o * .25, o * .1); r.position.set(o * .55, -o * .25, o * .1);
      l.rotation.y = -o * .5; r.rotation.y = o * .5; P.rotation.y = (p - .5) * TAU * .5 + Math.sin(t) * .1; P.position.z = -.22 + o * .3; } };
  } },
];

// ------------------------------------------------------------------ cards + slots
const grid = document.getElementById('grid');
const CARD = (i, d) => `<article class="card" style="--i:${i}"><div class="glass"><div class="slot"></div>
  <div class="wm" aria-hidden="true">PEPTICITY</div>
  <div class="meta"><span class="code">L${String(i + 1).padStart(2, '0')}</span><h3>${d.n}</h3></div><p>${d.d}</p></div></article>`;
grid.innerHTML = DEFS.map((d, i) => CARD(i, d)).join('');

function lights(scene) {
  const k = new THREE.DirectionalLight(0xffffff, 1.5); k.position.set(2.5, 3, 4); scene.add(k);
  const f = new THREE.DirectionalLight(0xe8ecf2, .45); f.position.set(-3, -1.5, 2.5); scene.add(f);
}
const hoverState = new WeakMap();
function addMark(el, def, card) {
  if (!stage) return;
  const scene = new THREE.Scene(); lights(scene);
  const camera = new THREE.PerspectiveCamera(28, 1, .1, 60);
  const spin = new THREE.Group(), tilt = new THREE.Group(); tilt.add(spin); scene.add(tilt);
  const m = def.build(); spin.add(m.g);
  const st = { sp: -1, tx: 0, ty: 0, boost: 0, target: 0 };
  card.addEventListener('pointerenter', () => { st.target += TAU; stage.kick(); });
  stage.addSlot(el, { scene, camera, fit: a => fitCamera(camera, 2.75, 2.75, a, .78),
    update(dt, t, prog, ptr, r) {
      if (FORCE !== null) st.sp = FORCE; else if (st.sp < 0 || REDUCED) st.sp = REDUCED ? .5 : prog; else st.sp = damp(st.sp, prog, 7, dt);
      const cx = (r.left + r.width / 2) / innerWidth * 2 - 1, cy = (r.top + r.height / 2) / innerHeight * 2 - 1;
      st.tx = damp(st.tx, clamp(ptr.x - cx, -1, 1) * .45, 5, dt); st.ty = damp(st.ty, clamp(ptr.y - cy, -1, 1) * .35, 5, dt);
      st.boost = REDUCED ? st.target : damp(st.boost, st.target, 2.6, dt);
      tilt.rotation.set(st.ty, st.tx, 0); spin.rotation.y = st.boost;
      m.update(st.sp, t);
    } });
}
document.querySelectorAll('.card').forEach((c, i) => addMark(c.querySelector('.slot'), DEFS[i], c));

// ------------------------------------------------------------------ hero: the extruded wordmark from the shared engine
const heroEl = document.getElementById('hero-slot');
if (stage && heroEl) {
  const scene = new THREE.Scene(); lights(scene);
  const camera = new THREE.PerspectiveCamera(24, 3, .1, 60);
  const word = makeWord(stage, 'PEPTICITY', { face: 'chrome', depth: .12, bevel: .014, edge: false, darkA: false, shadows: false, track: .04 });
  const tilt = grp(word.group); scene.add(tilt);
  let tx = 0, ty = 0;
  stage.addSlot(heroEl, { scene, camera, fit: a => fitCamera(camera, word.width, word.height * 1.6, a, .92),
    update(dt, t, prog, ptr) {
      const s = REDUCED ? 0 : sat(scrollY / (innerHeight * .9));
      word.letters.forEach((l, i) => { const k = ease(sat(s * 1.6 - i * .06)); l.rotation.y = k * TAU; l.rotation.x = Math.sin(t * .9 + i * .5) * .05; l.position.z = k * (1 - k) * .6; });
      tx = damp(tx, ptr.x * .22, 4, dt); ty = damp(ty, ptr.y * .16, 4, dt); tilt.rotation.set(ty, tx, 0);
    } });
}

// reveal + state for tests
const io2 = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io2.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.card,.rv').forEach(c => io2.observe(c));
window.__logo20 = { count: DEFS.length, names: DEFS.map(d => d.n) };
