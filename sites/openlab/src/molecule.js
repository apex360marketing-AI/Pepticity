/* One ball-and-stick molecule on canvas (3D coordinates projected to 2D). Atoms tween between structures, so it re-forms.
 * Structures are generated schematically from the residue sequence: heavy atoms only, not crystallographic coordinates. */
(function () {
  const SIDE = {
    G: {}, A: { chain: ["C"] }, S: { chain: ["C", "O"] }, T: { chain: ["C"], tip: ["O", "C"] },
    K: { chain: ["C", "C", "C", "C", "N"] }, E: { chain: ["C", "C", "C"], tip: ["O", "O"] },
    Q: { chain: ["C", "C", "C"], tip: ["O", "N"] }, M: { chain: ["C", "C", "S", "C"] },
    R: { chain: ["C", "C", "C", "N", "C"], tip: ["N", "N"] }, H: { chain: ["C"], ring: ["C", "N", "C", "N", "C"] },
  };
  const V = (x, y, z) => ({ x, y, z });
  const add = (a, b) => V(a.x + b.x, a.y + b.y, a.z + b.z);
  const mul = (a, k) => V(a.x * k, a.y * k, a.z * k);
  const norm = (a) => { const l = Math.hypot(a.x, a.y, a.z) || 1; return V(a.x / l, a.y / l, a.z / l); };
  function rng(seed) { let s = seed * 9301 + 49297; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }

  function build(spec) {
    const rnd = rng(spec.seed || 1);
    const atoms = [], bonds = [];
    const A = (el, p) => { atoms.push({ el, x: p.x, y: p.y, z: p.z }); return atoms.length - 1; };
    const B = (a, b, o = 1) => bonds.push([a, b, o]);
    const seq = spec.seq.split("");
    const bb = []; // [N, CA, C] per residue
    let k = 0, prevC = -1, hisND = -1;
    const P = (kk) => V(kk * 1.25, kk % 2 ? 0.72 : -0.72, Math.sin(kk * 0.42) * 1.5);
    seq.forEach((res, i) => {
      const n = A("N", P(k)); const ca = A("C", P(k + 1)); const c = A("C", P(k + 2));
      if (prevC >= 0) B(prevC, n);
      B(n, ca); B(ca, c);
      const cs = (k + 2) % 2 ? 1 : -1;
      const o = A("O", add(atoms[c], V(0.15, cs * 1.22, 0.2))); B(c, o, 2);
      // side chain from CA, outward on the CA side
      const sgn = (k + 1) % 2 ? 1 : -1;
      const d = norm(V(0, sgn, rnd() * 0.9 - 0.45));
      const px = norm(V(1, 0, 0.5 * (rnd() - 0.5)));
      const sd = SIDE[res] || {};
      let last = ca, pos = atoms[ca];
      (sd.chain || []).forEach((el, j) => {
        pos = add(add(pos, mul(d, 1.25)), mul(px, j % 2 ? -0.55 : 0.55));
        const id = A(el, pos); B(last, id); last = id;
      });
      if (sd.tip) {
        const t1 = A(sd.tip[0], add(add(pos, mul(d, 1.05)), mul(px, 0.95)));
        const t2 = A(sd.tip[1], add(add(pos, mul(d, 1.05)), mul(px, -0.95)));
        B(last, t1, res === "E" || res === "Q" ? 2 : 1); B(last, t2);
      }
      if (sd.ring) {
        const r = 1.18, ctr = add(pos, mul(d, 1.3 + r));
        const p2 = norm(V(1, 0, 0.7));
        const ids = sd.ring.map((el, j) => {
          const th = Math.PI + (j * 2 * Math.PI) / 5;
          return A(el, add(ctr, add(mul(d, Math.cos(th) * r), mul(p2, Math.sin(th) * r))));
        });
        B(last, ids[0]);
        ids.forEach((id, j) => B(id, ids[(j + 1) % 5], j % 2 ? 2 : 1));
        hisND = ids[1];
      }
      bb.push([n, ca, c]); prevC = c; k += 3;
    });
    // N-terminal caps
    const n0 = atoms[bb[0][0]];
    if (spec.nterm === "pal" || spec.nterm === "ac") {
      let p = add(n0, V(-1.25, n0.y > 0 ? -1.44 : 1.44, 0.1));
      const c1 = A("C", p); B(bb[0][0], c1);
      const oc = A("O", add(p, V(-0.2, p.y > 0 ? 1.2 : -1.2, 0.3))); B(c1, oc, 2);
      let last = c1;
      const len = spec.nterm === "pal" ? 15 : 1;
      for (let j = 0; j < len; j++) {
        const a = j * 0.16;
        p = add(p, V(-1.15 * Math.cos(a), (j % 2 ? 0.7 : -0.7) * (p.y > 0 ? 1 : -1) * 0.9 + Math.sin(a) * 0.5, Math.sin(j * 0.5) * 0.6 + 0.25));
        const id = A("C", p); B(last, id); last = id;
      }
    }
    // C-terminus: acid (O) or amide (N)
    const cl = atoms[prevC];
    const t = A(spec.cterm === "N" ? "N" : "O", add(cl, V(1.2, cl.y > 0 ? -0.75 : 0.75, -0.2))); B(prevC, t);
    if (spec.cu) {
      const pts = [atoms[bb[0][0]], atoms[bb[1][0]], atoms[hisND >= 0 ? hisND : bb[1][1]]];
      const c = V((pts[0].x + pts[1].x + pts[2].x) / 3, (pts[0].y + pts[1].y + pts[2].y) / 3, (pts[0].z + pts[1].z + pts[2].z) / 3 + 1.3);
      const cu = A("Cu", c);
      B(cu, bb[0][0], 0); B(cu, bb[1][0], 0); if (hisND >= 0) B(cu, hisND, 0);
    }
    // centre and normalise
    let cx = 0, cy = 0, cz = 0;
    atoms.forEach((a) => { cx += a.x; cy += a.y; cz += a.z; });
    cx /= atoms.length; cy /= atoms.length; cz /= atoms.length;
    let R = 0;
    atoms.forEach((a) => { a.x -= cx; a.y -= cy; a.z -= cz; R = Math.max(R, Math.hypot(a.x, a.y, a.z)); });
    return { atoms, bonds, R };
  }

  const EL = {
    C: { r: 0.36, base: "#0F1A22", hi: "#61707b" },
    N: { r: 0.35, base: "#6d7c87", hi: "#e8edf0" },
    O: { r: 0.35, base: "#E5383B", hi: "#ffc9c9" },
    S: { r: 0.44, base: "#b4bec5", hi: "#ffffff" },
    Cu: { r: 0.62, base: "#2b3a45", hi: "#c4ccd2" },
  };

  class Molecule {
    constructor(canvas, opts = {}) {
      this.c = canvas; this.x = canvas.getContext("2d");
      this.pool = opts.pool || 96;
      this.cur = Array.from({ length: this.pool }, () => ({ x: 0, y: 0, z: 0, r: 0, el: "C", k: 0.6 + Math.random() * 0.4 }));
      this.target = null; this.R = 10; this.Rc = 10;
      this.rotY = 0.6; this.rotX = -0.25; this.vy = 0.22; this.drag = null;
      this.visible = true; this.cache = {};
      this.reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; }).observe(canvas);
      const ro = new ResizeObserver(() => this.resize()); ro.observe(canvas); this.resize();
      canvas.addEventListener("pointerdown", (e) => { this.drag = { x: e.clientX, y: e.clientY, ry: this.rotY, rx: this.rotX }; canvas.setPointerCapture(e.pointerId); });
      canvas.addEventListener("pointermove", (e) => { if (!this.drag) return; this.rotY = this.drag.ry + (e.clientX - this.drag.x) * 0.01; this.rotX = Math.max(-1.2, Math.min(1.2, this.drag.rx + (e.clientY - this.drag.y) * 0.01)); });
      const up = () => { this.drag = null; };
      canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);
      gsap.ticker.add((t, dt) => this.tick(dt / 1000));
    }
    resize() {
      const d = Math.min(2, devicePixelRatio || 1), r = this.c.getBoundingClientRect();
      this.w = r.width; this.h = r.height; this.c.width = Math.max(1, r.width * d); this.c.height = Math.max(1, r.height * d);
      this.x.setTransform(d, 0, 0, d, 0, 0);
    }
    set(spec, key) {
      const m = this.cache[key] || (this.cache[key] = build(spec));
      const first = !this.target;
      this.target = m; this.R = m.R;
      const n = m.atoms.length;
      this.cur.forEach((c, i) => {
        const a = m.atoms[i % n];
        c.tx = a.x; c.ty = a.y; c.tz = a.z; c.el = i < n ? a.el : a.el; c.tr = i < n ? EL[a.el].r : 0;
        if (first || this.reduce) { c.x = a.x; c.y = a.y; c.z = a.z; c.r = c.tr; }
        else { c.x += (Math.random() - 0.5) * 3; c.y += (Math.random() - 0.5) * 3; c.z += (Math.random() - 0.5) * 3; }
      });
      if (first || this.reduce) this.Rc = this.R;
    }
    tick(dt) {
      if (!this.target || !this.visible || !this.w) return;
      dt = Math.min(dt, 0.05);
      if (!this.drag && !this.reduce) this.rotY += dt * this.vy;
      this.Rc += (this.R - this.Rc) * Math.min(1, dt * 4);
      this.cur.forEach((c) => {
        const f = Math.min(1, dt * 5 * c.k);
        c.x += (c.tx - c.x) * f; c.y += (c.ty - c.y) * f; c.z += (c.tz - c.z) * f; c.r += (c.tr - c.r) * f;
      });
      this.draw();
    }
    draw() {
      const g = this.x, W = this.w, H = this.h;
      g.clearRect(0, 0, W, H);
      const s = (Math.min(W, H) * 0.44) / this.Rc, D = this.Rc * 3.2;
      const cy = Math.cos(this.rotY), sy = Math.sin(this.rotY), cx = Math.cos(this.rotX), sx = Math.sin(this.rotX);
      const P = this.cur.map((c) => {
        const x1 = c.x * cy + c.z * sy, z1 = -c.x * sy + c.z * cy;
        const y2 = c.y * cx - z1 * sx, z2 = c.y * sx + z1 * cx;
        const k = D / (D - z2);
        return { X: W / 2 + x1 * s * k, Y: H / 2 + y2 * s * k, z: z2, k, c };
      });
      const items = [];
      const n = this.target.atoms.length;
      this.target.bonds.forEach(([a, b, o]) => items.push({ t: 0, a: P[a], b: P[b], o, z: (P[a].z + P[b].z) / 2 }));
      for (let i = 0; i < this.pool; i++) if (P[i].c.r > 0.02) items.push({ t: 1, p: P[i], z: P[i].z + (i < n ? 0.01 : -5) });
      items.sort((u, v) => u.z - v.z);
      const R = this.Rc;
      items.forEach((it) => {
        const depth = Math.max(0, Math.min(1, (it.z + R) / (2 * R)));
        if (it.t === 0) {
          const { a, b, o } = it;
          g.strokeStyle = o === 0 ? "rgba(138,151,161,.9)" : `rgba(15,26,34,${0.35 + depth * 0.55})`;
          g.lineWidth = Math.max(1, s * 0.11 * a.k);
          g.setLineDash(o === 0 ? [3, 4] : []);
          if (o === 2) {
            const dx = b.X - a.X, dy = b.Y - a.Y, l = Math.hypot(dx, dy) || 1, ox = (-dy / l) * s * 0.09, oy = (dx / l) * s * 0.09;
            g.beginPath(); g.moveTo(a.X + ox, a.Y + oy); g.lineTo(b.X + ox, b.Y + oy); g.moveTo(a.X - ox, a.Y - oy); g.lineTo(b.X - ox, b.Y - oy); g.stroke();
          } else { g.beginPath(); g.moveTo(a.X, a.Y); g.lineTo(b.X, b.Y); g.stroke(); }
          g.setLineDash([]);
        } else {
          const { p } = it, e = EL[p.c.el] || EL.C, r = Math.max(0.5, p.c.r * s * p.k);
          const gr = g.createRadialGradient(p.X - r * 0.35, p.Y - r * 0.4, r * 0.1, p.X, p.Y, r);
          gr.addColorStop(0, e.hi); gr.addColorStop(1, e.base);
          g.globalAlpha = 0.55 + depth * 0.45;
          g.fillStyle = gr; g.beginPath(); g.arc(p.X, p.Y, r, 0, 6.283); g.fill();
          if (p.c.el === "Cu") { g.strokeStyle = "#E5383B"; g.lineWidth = 1.2; g.beginPath(); g.arc(p.X, p.Y, r + 4, 0, 6.283); g.stroke(); }
          g.globalAlpha = 1;
        }
      });
    }
  }
  window.OLMolecule = Molecule;
})();
