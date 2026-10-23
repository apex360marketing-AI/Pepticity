/* Pepticity helix engine — zero-dependency Canvas2D 3D renderer.
 * Nine residues spell P-E-P-T-I-C-I-T-Y. They can sit in three shapes:
 *   line  : a straight peptide chain
 *   helix : an alpha helix (100° per residue, the real 3.6 residues/turn)
 *   mark  : the Pepticity "P" — a cyclic peptide that closes into the logo
 * Shapes are blended with mix(a, b, t), so any timeline (intro, scroll, idle) can drive it. */
(function () {
  const LETTERS = "PEPTICITY".split("");
  const N = LETTERS.length;

  function shapeLine() {
    return LETTERS.map((_, i) => [(i - (N - 1) / 2) * 0.62, 0, 0]);
  }
  function shapeHelix() {
    const r = 0.78, rise = 0.36;
    return LETTERS.map((_, i) => {
      const a = (i * 100 * Math.PI) / 180;
      return [r * Math.cos(a), (i - (N - 1) / 2) * rise, r * Math.sin(a)];
    });
  }
  function shapeMark() {
    // stem bottom→top, then the bowl clockwise back to the stem; Y→E closes the ring
    const pts = [[0, 1.12], [0, 0.6], [0, 0.05],
      [0.24, 0.05], [0.5, 0.08], [0.68, 0.21], [0.68, 0.43], [0.5, 0.57], [0.24, 0.6]];
    const mx = 0.34, my = 0.58, s = 1.9;
    return pts.map(([x, y]) => [(x - mx) * s, (y - my) * s, 0]);
  }

  const SHAPES = { line: shapeLine(), helix: shapeHelix(), mark: shapeMark() };

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = {
    inOut: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    out: t => 1 - Math.pow(1 - t, 3),
    outBack: t => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
    inOutQuart: t => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
  };
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (A, B, t) => A.map((p, i) => [lerp(p[0], B[i][0], t), lerp(p[1], B[i][1], t), lerp(p[2], B[i][2], t)]);

  function glowSprite(rgb, size) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d");
    const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grd.addColorStop(0, `rgba(${rgb},1)`);
    grd.addColorStop(0.18, `rgba(${rgb},.55)`);
    grd.addColorStop(0.5, `rgba(${rgb},.12)`);
    grd.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = grd;
    g.fillRect(0, 0, size, size);
    return c;
  }

  class Helix {
    constructor(canvas, opts = {}) {
      this.c = canvas;
      this.g = canvas.getContext("2d");
      this.accent = opts.accent || "255,92,112";
      this.scaleK = opts.scale || 0.2; // node spacing as a fraction of min(w,h)
      this.dust = opts.dust ?? 160;
      this.glow = glowSprite(this.accent, 128);
      this.white = glowSprite("244,236,232", 64);
      this.state = {
        shape: SHAPES.line, yaw: 0, pitch: 0.18, spawn: 1, bonds: 1, pulse: -1,
        ring: 0, sidechains: 0, letters: 0, wave: 0, dustAlpha: 0.6, cx: 0.5, cy: 0.5, zoom: 1,
      };
      this.particles = Array.from({ length: this.dust }, () => ({
        x: (Math.random() - 0.5) * 9, y: (Math.random() - 0.5) * 6, z: (Math.random() - 0.5) * 6,
        s: Math.random() * 0.8 + 0.2, v: Math.random() * 0.15 + 0.04,
      }));
      this.resize = this.resize.bind(this);
      this.resize();
      addEventListener("resize", this.resize);
    }
    resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const r = this.c.getBoundingClientRect();
      this.w = r.width; this.h = r.height;
      this.c.width = Math.round(r.width * dpr);
      this.c.height = Math.round(r.height * dpr);
      this.g.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    project([x, y, z], unit) {
      const s = this.state;
      const cy = Math.cos(s.yaw), sy = Math.sin(s.yaw);
      let X = x * cy - z * sy, Z = x * sy + z * cy;
      const cp = Math.cos(s.pitch), sp = Math.sin(s.pitch);
      let Y = y * cp - Z * sp; Z = y * sp + Z * cp;
      const f = 5 / (5 + Z);
      return { x: this.w * s.cx + X * unit * f * s.zoom, y: this.h * s.cy + Y * unit * f * s.zoom, f, z: Z };
    }
    render(dt = 1 / 60) {
      const g = this.g, s = this.state;
      const unit = Math.min(this.w, this.h) * this.scaleK;
      g.clearRect(0, 0, this.w, this.h);
      g.globalCompositeOperation = "lighter";

      // ambient dust, drifting upward like particles in a solvent
      if (s.dustAlpha > 0.01) {
        for (const p of this.particles) {
          p.y -= p.v * dt; if (p.y < -3) p.y = 3;
          const q = this.project([p.x, p.y, p.z], unit);
          const r = 10 * p.s * q.f;
          g.globalAlpha = s.dustAlpha * 0.35 * p.s;
          g.drawImage(this.white, q.x - r, q.y - r, r * 2, r * 2);
        }
      }

      const P = s.shape.map(p => this.project(p, unit));

      // bonds — each one "forms" as s.bonds sweeps 0..N-1
      g.lineCap = "round";
      for (let i = 0; i < N - 1; i++) {
        const k = clamp(s.bonds - i);
        if (k <= 0) continue;
        const a = P[i], b = P[i + 1];
        const ex = lerp(a.x, b.x, k), ey = lerp(a.y, b.y, k);
        g.globalAlpha = 0.85;
        g.strokeStyle = `rgba(${this.accent},.9)`;
        g.lineWidth = 2.2 * (a.f + b.f) / 2;
        g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(ex, ey); g.stroke();
        g.globalAlpha = 0.25; g.lineWidth = 9 * (a.f + b.f) / 2;
        g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(ex, ey); g.stroke();
      }
      // ring closure bond (Y → E) that turns the chain into a cyclic peptide
      if (s.ring > 0) {
        const a = P[N - 1], b = P[1];
        g.globalAlpha = 0.9 * s.ring; g.lineWidth = 2.2;
        g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(lerp(a.x, b.x, s.ring), lerp(a.y, b.y, s.ring)); g.stroke();
      }
      // energy pulse travelling down the backbone
      if (s.pulse >= 0 && s.pulse <= N - 1) {
        const i = Math.floor(s.pulse), k = s.pulse - i;
        const a = P[i], b = P[Math.min(i + 1, N - 1)];
        const r = 34;
        g.globalAlpha = 1;
        g.drawImage(this.white, lerp(a.x, b.x, k) - r, lerp(a.y, b.y, k) - r, r * 2, r * 2);
      }

      // nodes, back to front
      const order = P.map((p, i) => i).sort((i, j) => P[j].z - P[i].z);
      for (const i of order) {
        const sp = clamp(s.spawn - i);
        if (sp <= 0) continue;
        const q = P[i];
        const pop = ease.outBack(sp);
        const r = 30 * q.f * pop;
        g.globalAlpha = 0.95;
        g.drawImage(this.glow, q.x - r * 2, q.y - r * 2, r * 4, r * 4);
        g.globalCompositeOperation = "source-over";
        g.globalAlpha = 1;
        g.fillStyle = "#12070a";
        g.beginPath(); g.arc(q.x, q.y, 7.5 * q.f * pop, 0, Math.PI * 2); g.fill();
        g.strokeStyle = `rgb(${this.accent})`; g.lineWidth = 2;
        g.stroke();
        g.globalCompositeOperation = "lighter";
        if (s.sidechains > 0) {
          const ang = i * 1.7 + s.yaw;
          const sx = q.x + Math.cos(ang) * 26 * q.f, sy = q.y + Math.sin(ang) * 26 * q.f;
          g.globalAlpha = 0.5 * s.sidechains;
          g.lineWidth = 1;
          g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(sx, sy); g.stroke();
          g.drawImage(this.white, sx - 8, sy - 8, 16, 16);
        }
        if (s.letters > 0) {
          g.globalCompositeOperation = "source-over";
          g.globalAlpha = s.letters * clamp(q.f * 1.2 - 0.2);
          g.fillStyle = "#f3ece6";
          g.font = `600 ${Math.round(13 * q.f)}px "Geist Mono", ui-monospace, monospace`;
          g.textAlign = "center";
          g.fillText(LETTERS[i], q.x, q.y - 22 * q.f);
          g.globalCompositeOperation = "lighter";
        }
      }
      // shockwave when the ring closes
      if (s.wave > 0 && s.wave < 1) {
        const c = this.project([0, 0, 0], unit);
        g.globalAlpha = (1 - s.wave) * 0.6;
        g.lineWidth = 1.5;
        g.beginPath(); g.arc(c.x, c.y, unit * (0.6 + s.wave * 4), 0, Math.PI * 2); g.stroke();
      }
      g.globalAlpha = 1;
      g.globalCompositeOperation = "source-over";
      return P;
    }
  }

  window.PepHelix = { Helix, SHAPES, mix, ease, clamp, lerp, LETTERS };
})();
