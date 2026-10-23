/* Scrub-able instrument traces: HPLC chromatogram ("lc") and mass spectrum ("ms"). SAMPLE data.
 * Pointer: hover or drag across. Keyboard: focus the canvas, then ← → (Shift for big steps), Home/End. */
(function () {
  const C = { slate: "#0F1A22", ink2: "#46545F", fog: "#8A97A1", ion: "#E5383B", grid: "rgba(138,151,161,.22)", gridB: "rgba(138,151,161,.5)" };
  const MONO = '500 11.5px "Martian Mono", ui-monospace, monospace';
  function rng(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }

  class Scope {
    constructor(canvas, opts) {
      this.c = canvas; this.g = canvas.getContext("2d"); this.o = Object.assign({ kind: "lc", xmin: 0, xmax: 20, progress: 1, compact: false }, opts);
      this.kind = this.o.kind; this.progress = this.o.progress; this.cursor = null; this.peak = null; this.dirty = true; this.visible = true;
      this.readout = opts.readout || null;
      canvas.tabIndex = 0; canvas.setAttribute("role", "slider");
      canvas.setAttribute("aria-label", this.kind === "lc" ? "HPLC chromatogram, SAMPLE data. Use arrow keys to move along retention time." : "Mass spectrum, SAMPLE data. Use arrow keys to move along m/z.");
      new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; if (this.visible) this.dirty = true; }).observe(canvas);
      new ResizeObserver(() => this.resize()).observe(canvas); this.resize();
      const toX = (e) => { const r = canvas.getBoundingClientRect(); return this.pxToX(e.clientX - r.left); };
      canvas.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse" || this.dragging) this.setCursor(toX(e)); });
      canvas.addEventListener("pointerdown", (e) => { this.dragging = true; this.setCursor(toX(e)); });
      addEventListener("pointerup", () => { this.dragging = false; });
      canvas.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") this.setCursor(null); });
      canvas.addEventListener("keydown", (e) => {
        const span = this.o.xmax - this.o.xmin, st = span * (e.shiftKey ? 0.05 : 0.005);
        let x = this.cursor == null ? (this.mainX() ?? this.o.xmin + span / 2) : this.cursor;
        if (e.key === "ArrowRight" || e.key === "ArrowUp") x += st; else if (e.key === "ArrowLeft" || e.key === "ArrowDown") x -= st;
        else if (e.key === "Home") x = this.o.xmin; else if (e.key === "End") x = this.o.xmax;
        else if (e.key === "PageDown" || e.key === "PageUp") { x = this.jumpPeak(x, e.key === "PageUp" ? 1 : -1); } else return;
        e.preventDefault(); this.setCursor(Math.max(this.o.xmin, Math.min(this.o.xmax, x)));
      });
      gsap.ticker.add(() => { if (this.dirty && this.visible) { this.dirty = false; this.draw(); } });
    }
    resize() {
      const d = Math.min(2, devicePixelRatio || 1), r = this.c.getBoundingClientRect();
      this.w = r.width; this.h = r.height; this.c.width = Math.max(1, r.width * d); this.c.height = Math.max(1, r.height * d);
      this.g.setTransform(d, 0, 0, d, 0, 0);
      const cp = this.o.compact || this.w < 420;
      this.m = { l: cp ? 38 : 52, r: 12, t: cp ? 26 : 34, b: cp ? 26 : 30 };
      this.dirty = true;
    }
    pxToX(px) { const { l, r } = this.m; return this.o.xmin + ((px - l) / (this.w - l - r)) * (this.o.xmax - this.o.xmin); }
    xToPx(x) { const { l, r } = this.m; return l + ((x - this.o.xmin) / (this.o.xmax - this.o.xmin)) * (this.w - l - r); }
    setLC(peaks, seed = 3) {
      this.kind = "lc"; this.o.xmin = 0; this.o.xmax = 20; this.peaks = peaks; this.sticks = null;
      const N = 800, rnd = rng(seed * 7919 + 13), pts = [];
      let drift = 0;
      for (let i = 0; i <= N; i++) {
        const x = (i / N) * 20; drift += (rnd() - 0.5) * 0.35; drift *= 0.97;
        let y = 1.2 + drift + Math.sin(x * 0.7) * 0.6 + (x < 1.2 ? Math.exp(-((x - 0.9) ** 2) / 0.02) * 22 : 0);
        peaks.forEach((p) => { y += p.h * Math.exp(-((x - p.x) ** 2) / (2 * p.w * p.w)); });
        pts.push([x, y]);
      }
      this.pts = pts; this.ymax = 1200; this.peak = null; this.cursor = null; this.dirty = true; this.updateReadout();
    }
    setMS(ions, seed = 5) {
      this.kind = "ms"; this.o.xmin = 100; this.o.xmax = 1000; this.peaks = null;
      const rnd = rng(seed * 104729 + 7), st = [];
      ions.forEach((ion) => { for (let k = 0; k < 4; k++) st.push({ mz: ion.mz + k / ion.z, i: ion.i * [1, 0.42, 0.12, 0.03][k], label: k ? "isotope +" + k : ion.label, main: !k, z: ion.z }); });
      for (let k = 0; k < 70; k++) st.push({ mz: 110 + rnd() * 880, i: rnd() * rnd() * 5.5, label: "noise", noise: true });
      st.sort((a, b) => a.mz - b.mz);
      this.sticks = st; this.ymax = 100; this.peak = null; this.cursor = null; this.dirty = true; this.updateReadout();
    }
    mainX() { if (this.peaks) return this.peaks[0].x; if (this.sticks) return this.sticks.find((s) => s.main && s.i >= 99)?.mz; return null; }
    jumpPeak(x, dir) {
      const list = this.peaks ? this.peaks.map((p) => p.x) : this.sticks.filter((s) => !s.noise && s.main).map((s) => s.mz);
      list.sort((a, b) => a - b);
      if (dir > 0) return list.find((v) => v > x + 0.001) ?? x; return [...list].reverse().find((v) => v < x - 0.001) ?? x;
    }
    setCursor(x) {
      this.cursor = x; let pk = null;
      if (x != null && this.peaks) {
        let best = 1e9; this.peaks.forEach((p) => { const d = Math.abs(x - p.x); if (d < Math.max(p.w * 4, 0.25) && d < best) { best = d; pk = p; } });
      } else if (x != null && this.sticks) {
        const tol = (this.o.xmax - this.o.xmin) * 0.012; let best = 1e9;
        this.sticks.forEach((s) => { const d = Math.abs(x - s.mz); const score = d - (s.noise ? 0 : tol * 0.6); if (d < tol && score < best) { best = score; pk = s; } });
      }
      const changed = pk !== this.peak; this.peak = pk; this.dirty = true;
      if (changed && this.o.onPeak) this.o.onPeak(pk);
      this.updateReadout();
    }
    updateReadout() {
      if (!this.readout) return;
      const p = this.peak; let t;
      if (this.kind === "lc") t = p ? `RT ${p.x.toFixed(2)} min · ${p.label} · area ${p.area.toFixed(1)}% · SAMPLE` : this.cursor != null ? `RT ${this.cursor.toFixed(2)} min · baseline` : "Drag across the trace to read each peak.";
      else t = p ? (p.noise ? `m/z ${p.mz.toFixed(2)} · background ion` : `m/z ${p.mz.toFixed(2)} · ${p.label} · ${p.i.toFixed(0)}% rel. · SAMPLE`) : this.cursor != null ? `m/z ${this.cursor.toFixed(1)}` : "Drag across the spectrum to read each ion.";
      if (this.readout.textContent !== t) this.readout.textContent = t;
    }
    draw() {
      const g = this.g, W = this.w, H = this.h, { l, r, t, b } = this.m, pw = W - l - r, ph = H - t - b;
      g.clearRect(0, 0, W, H);
      if (!this.pts && !this.sticks) return;
      const Y = (v) => t + ph - (v / this.ymax) * ph;
      g.font = MONO; g.textBaseline = "middle";
      // grid
      const lc = this.kind === "lc", step = lc ? 1 : 50, major = lc ? 5 : 100;
      for (let x = this.o.xmin; x <= this.o.xmax + 1e-6; x += step) {
        const X = this.xToPx(x), M = Math.abs(x / major - Math.round(x / major)) < 1e-6;
        g.strokeStyle = M ? C.gridB : C.grid; g.lineWidth = 1; g.beginPath(); g.moveTo(X + 0.5, t); g.lineTo(X + 0.5, t + ph); g.stroke();
        if (M) { g.fillStyle = C.ink2; g.textAlign = "center"; g.fillText(lc ? String(x) : String(x), X, t + ph + 14); }
      }
      const ys = lc ? [0, 300, 600, 900, 1200] : [0, 25, 50, 75, 100];
      ys.forEach((v) => { const yy = Y(v); g.strokeStyle = v ? C.grid : C.slate; g.lineWidth = v ? 1 : 1.25; g.beginPath(); g.moveTo(l, yy + 0.5); g.lineTo(l + pw, yy + 0.5); g.stroke(); g.fillStyle = C.ink2; g.textAlign = "right"; g.fillText(String(v), l - 6, yy); });
      g.textAlign = "left"; g.fillStyle = C.ink2;
      g.fillText(lc ? "mAU" : "rel. %", 4, t - 14);
      g.textAlign = "right"; g.fillText(lc ? "min" : "m/z", W - r, t - 14);
      const xEnd = this.o.xmin + (this.o.xmax - this.o.xmin) * this.progress;
      g.save(); g.beginPath(); g.rect(l, 0, this.xToPx(xEnd) - l, H); g.clip();
      if (lc) {
        if (this.peak) { // fill under hovered peak
          const p = this.peak, x0 = p.x - p.w * 3.2, x1 = p.x + p.w * 3.2;
          g.fillStyle = "rgba(229,56,59,.13)"; g.beginPath(); g.moveTo(this.xToPx(x0), Y(0));
          this.pts.forEach(([x, y]) => { if (x >= x0 && x <= x1) g.lineTo(this.xToPx(x), Y(Math.min(y, this.ymax))); });
          g.lineTo(this.xToPx(x1), Y(0)); g.closePath(); g.fill();
        }
        g.strokeStyle = C.slate; g.lineWidth = 1.5; g.lineJoin = "round"; g.beginPath();
        this.pts.forEach(([x, y], i) => { const X = this.xToPx(x), YY = Y(Math.min(y, this.ymax * 1.02)); i ? g.lineTo(X, YY) : g.moveTo(X, YY); });
        g.stroke();
        this.peaks.forEach((p) => { if (p.x > xEnd) return; const X = this.xToPx(p.x), yy = Y(p.h + 1.2); g.fillStyle = p === this.peak || (p.main && !this.peak) ? C.ion : C.slate; g.beginPath(); g.arc(X, yy, p.main ? 3.5 : 2.4, 0, 6.283); g.fill(); });
      } else {
        this.sticks.forEach((s) => {
          if (s.mz > xEnd) return; const X = Math.round(this.xToPx(s.mz)) + 0.5;
          g.strokeStyle = s === this.peak ? C.ion : s.noise ? "rgba(70,84,95,.55)" : C.slate; g.lineWidth = s === this.peak ? 2.4 : s.noise ? 1 : 1.6;
          g.beginPath(); g.moveTo(X, Y(0)); g.lineTo(X, Y(s.i)); g.stroke();
          if (!s.noise && s.main && s.i > 20 && pw > 300) { g.fillStyle = C.ink2; g.textAlign = "center"; g.fillText(s.mz.toFixed(1), X, Y(s.i) - 10); }
        });
      }
      g.restore();
      if (this.progress < 1) { // pen tip
        let yv = 0; if (lc) { const i = Math.round((xEnd / 20) * 800); yv = this.pts[Math.min(800, i)][1]; }
        g.fillStyle = C.ion; g.beginPath(); g.arc(this.xToPx(xEnd), Y(Math.min(yv, this.ymax)), 3.5, 0, 6.283); g.fill();
      }
      // cursor + label
      if (this.cursor != null) {
        const X = this.xToPx(this.cursor);
        g.strokeStyle = "rgba(15,26,34,.55)"; g.setLineDash([3, 3]); g.lineWidth = 1; g.beginPath(); g.moveTo(X + 0.5, t); g.lineTo(X + 0.5, t + ph); g.stroke(); g.setLineDash([]);
      }
      const p = this.peak || (this.cursor == null && this.progress >= 1 ? (lc ? this.peaks[0] : this.sticks.find((s) => s.main && s.i >= 99)) : null);
      if (p) {
        const X = this.xToPx(lc ? p.x : p.mz), yy = Y(lc ? p.h + 1.2 : p.i);
        const txt = lc ? `${p.area.toFixed(1)}% · RT ${p.x.toFixed(2)}` : p.noise ? `m/z ${p.mz.toFixed(2)}` : `m/z ${p.mz.toFixed(2)} ${p.label.startsWith("iso") ? "" : p.label}`;
        g.font = '600 12px "Martian Mono", ui-monospace, monospace';
        const tw = g.measureText(txt).width + 16, ly = Math.max(t + 4, yy - 34);
        let lx = Math.min(W - r - tw, Math.max(l, X + 10));
        g.strokeStyle = C.slate; g.lineWidth = 1; g.beginPath(); g.moveTo(X, yy - 5); g.lineTo(X, ly + 10); g.lineTo(lx, ly + 10); g.stroke();
        g.fillStyle = "#fff"; g.fillRect(lx, ly, tw, 20); g.strokeRect(lx + 0.5, ly + 0.5, tw - 1, 19);
        g.fillStyle = this.peak ? C.ion : C.slate; g.textAlign = "left"; g.fillText(txt, lx + 8, ly + 10.5);
      }
    }
  }
  window.OLScope = Scope;
})();
