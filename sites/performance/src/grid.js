/* Pepticity Performance: perspective "telemetry floor" renderer (2D canvas, no libs).
   Shared by the intro (sweep-in) and the hero (slow drift, scroll-velocity driven). */
(function () {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  class Grid {
    constructor(canvas, opts = {}) {
      this.c = canvas;
      this.x = canvas.getContext("2d");
      this.o = Object.assign({ cols: 14, lights: true }, opts);
      this.s = { reveal: 1, horizon: 0.6, speed: 0.6, alpha: 1, lane: 1, flash: 0, tilt: 0 };
      this.off = 0;
      this.resize = this.resize.bind(this);
      addEventListener("resize", this.resize);
      this.resize();
    }
    resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const r = this.c.getBoundingClientRect();
      this.w = Math.max(1, r.width); this.h = Math.max(1, r.height); this.dpr = dpr;
      this.c.width = Math.round(this.w * dpr); this.c.height = Math.round(this.h * dpr);
    }
    render(dt) {
      const { x, w, h, dpr, s, o } = this;
      this.off += (dt || 0.016) * s.speed;
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      x.clearRect(0, 0, w, h);
      const a = s.alpha;
      if (a <= 0.001) return;
      const hy = h * s.horizon, cx = w / 2 + s.tilt * w * 0.08;
      // stadium light bloom (steel/platinum only)
      if (o.lights) {
        for (const [lx, ly, rr] of [[0.18, 0.08, 0.42], [0.82, 0.06, 0.46], [0.5, 0.0, 0.3]]) {
          const g = x.createRadialGradient(w * lx, h * ly, 0, w * lx, h * ly, Math.max(w, h) * rr);
          g.addColorStop(0, `rgba(215,218,223,${0.16 * a * s.reveal})`);
          g.addColorStop(1, "rgba(215,218,223,0)");
          x.fillStyle = g; x.fillRect(0, 0, w, h);
        }
      }
      const f = (h - hy) * 0.55, zFar = 26;
      // horizontal rungs moving toward the viewer
      const step = 0.55, phase = this.off % step;
      for (let k = 0; k < 46; k++) {
        const z = 0.32 + k * step - phase;
        if (z <= 0.3) continue;
        const y = hy + f / z;
        if (y > h + 2) continue;
        const near = clamp(1.4 / z);
        const half = w * 0.75 * clamp(s.reveal * 1.25 - (k / 46) * 0.25);
        x.strokeStyle = `rgba(215,218,223,${(0.05 + 0.32 * near) * a * s.reveal})`;
        x.lineWidth = 1;
        x.beginPath(); x.moveTo(cx - half, y); x.lineTo(cx + half, y); x.stroke();
      }
      // converging lanes
      const N = o.cols, sp = 0.62;
      for (let i = -N; i <= N; i++) {
        const reveal = clamp(s.reveal * (N + 1) - Math.abs(i));
        if (reveal <= 0) continue;
        const xw = i * sp;
        const zN = 0.3, x0 = cx + (f * xw) / zN * 0.5, y0 = hy + f / zN;
        const x1 = cx + (f * xw) / zFar * 0.5, y1 = hy + f / zFar;
        const g = x.createLinearGradient(0, y0, 0, y1);
        g.addColorStop(0, `rgba(215,218,223,${0.34 * a * reveal})`);
        g.addColorStop(1, "rgba(215,218,223,0)");
        x.strokeStyle = g; x.lineWidth = 1;
        x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke();
      }
      // the one chartreuse lane
      if (s.lane > 0) {
        const xw = 0.31, zN = 0.3;
        const x0 = cx + (f * xw) / zN * 0.5, y0 = hy + f / zN;
        const x1 = cx + (f * xw) / zFar * 0.5, y1 = hy + f / zFar;
        const yl = y0 + (y1 - y0) * s.lane;
        const xl = x0 + (x1 - x0) * s.lane;
        const g = x.createLinearGradient(0, y0, 0, y1);
        g.addColorStop(0, `rgba(212,255,58,${0.85 * a})`);
        g.addColorStop(1, "rgba(212,255,58,0)");
        x.strokeStyle = g; x.lineWidth = 2;
        x.beginPath(); x.moveTo(x0, y0); x.lineTo(xl, yl); x.stroke();
      }
      // horizon
      const hg = x.createLinearGradient(0, 0, w, 0);
      hg.addColorStop(0, "rgba(215,218,223,0)");
      hg.addColorStop(0.5, `rgba(215,218,223,${(0.35 + s.flash * 0.6) * a * s.reveal})`);
      hg.addColorStop(1, "rgba(215,218,223,0)");
      x.fillStyle = hg; x.fillRect(0, hy - 0.5, w, 1);
      if (s.flash > 0) { x.fillStyle = `rgba(215,218,223,${s.flash * 0.12})`; x.fillRect(0, 0, w, h); }
      // fade floor into onyx at the top edge of the floor
      const fade = x.createLinearGradient(0, hy - h * 0.25, 0, hy + h * 0.05);
      fade.addColorStop(0, "rgba(11,11,12,0)");
      fade.addColorStop(1, "rgba(11,11,12,0)");
    }
  }
  window.PPGrid = Grid;
})();
