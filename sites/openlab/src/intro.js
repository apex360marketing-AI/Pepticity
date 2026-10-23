/* Pepticity Open Lab intro (~8 s, once per session; #intro replays).
 * Beats: instrument log types "Gly–His–Lys" → "G H K" → "PEPTICITY" · each glyph drops onto a baseline and breaks into
 * particles that pile into an HPLC peak while the pen draws the trace live · the peak is labelled "99.4% · SAMPLE" ·
 * the baseline lifts to the top of the viewport and becomes the site's top border, carrying the intro away above it. */
(function () {
  const intro = document.getElementById("intro");
  const ss = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
  };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const html = document.documentElement;
  const tmpl = intro.cloneNode(true); // for replays
  let running = false;

  function finishRoute() {
    if (location.hash === "#intro") { history.replaceState(null, "", "#home"); window.dispatchEvent(new HashChangeEvent("hashchange")); }
  }

  function play(el) {
    if (running) return;
    running = true;
    const root = el || intro;
    html.classList.add("intro-lock");
    const cv = root.querySelector("canvas"), g = cv.getContext("2d");
    const video = root.querySelector("video");
    const skipBtn = root.querySelector(".skip");
    let W, H, dpr;
    function size() { dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size();
    if (video) {
      video.addEventListener("canplay", () => { video.classList.add("ok"); video.play().catch(() => {}); }, { once: true });
      video.addEventListener("error", () => video.remove(), { once: true });
      try { video.load(); } catch (e) {}
    }
    const mobile = W < 700;
    const base = () => Math.round(H * (mobile ? 0.7 : 0.74));
    const X0 = () => W * (mobile ? 0.06 : 0.08), X1 = () => W * (mobile ? 0.94 : 0.92);
    const peakX = () => X0() + (X1() - X0()) * 0.421;
    const MONO = '"Martian Mono", ui-monospace, monospace';
    const bigFS = mobile ? Math.min(54, W / 7.6) : Math.min(96, W / 13);
    const T = { seq: 0.3, ghk: 1.0, word: 2.0, drop: 3.35, pen: 3.9, penEnd: 5.9, label: 5.85, lift: 6.45, end: 7.9 };

    // characters
    const chars = [];
    const lineA = "GHK".split(""), lineB = "PEPTICITY".split("");
    function layout() {
      g.font = `500 ${bigFS}px ${MONO}`;
      const cw = g.measureText("M").width;
      const gapA = cw * 0.9;
      const wA = lineA.length * cw + (lineA.length - 1) * gapA, wB = lineB.length * cw;
      const yA = H * (mobile ? 0.38 : 0.36), yB = yA + bigFS * 1.25;
      chars.length = 0;
      lineA.forEach((c, i) => chars.push({ c, x: W / 2 - wA / 2 + i * (cw + gapA), y: yA, t: T.ghk + i * 0.3 }));
      lineB.forEach((c, i) => chars.push({ c, x: W / 2 - wB / 2 + i * cw, y: yB, t: T.word + i * 0.135 }));
      chars.forEach((ch, i) => { ch.cw = cw; ch.dt = T.drop + i * 0.085; ch.fall = 0.42; });
    }
    layout();

    // sample glyph pixels → particles
    const parts = [];
    function buildParticles() {
      const oc = document.createElement("canvas"), og = oc.getContext("2d");
      const S = Math.ceil(bigFS * 1.3); oc.width = S; oc.height = S;
      const step = Math.max(2, Math.round(bigFS / 15));
      chars.forEach((ch, ci) => {
        og.clearRect(0, 0, S, S); og.fillStyle = "#000"; og.font = `500 ${bigFS}px ${MONO}`; og.textBaseline = "alphabetic"; og.fillText(ch.c, 0, bigFS);
        const d = og.getImageData(0, 0, S, S).data;
        for (let y = 0; y < S; y += step) for (let x = 0; x < S; x += step) if (d[(y * S + x) * 4 + 3] > 120) parts.push({ ci, ox: x, oy: y - bigFS, s: step * 0.78 });
      });
      // pile targets: gaussian columns at the peak
      const n = parts.length, colW = Math.max(3, step * 0.95), sigma = mobile ? W * 0.05 : Math.min(60, W * 0.032);
      const cols = []; let total = 0;
      for (let k = -Math.ceil(3.2 * sigma / colW); k <= Math.ceil(3.2 * sigma / colW); k++) { const w = Math.exp(-((k * colW) ** 2) / (2 * sigma * sigma)); cols.push({ k, w }); total += w; }
      let assigned = 0; cols.forEach((c) => { c.n = Math.round((c.w / total) * n); assigned += c.n; });
      cols[Math.floor(cols.length / 2)].n += n - assigned;
      const cmax = Math.max(...cols.map((c) => c.n));
      const pileH = H * (mobile ? 0.3 : 0.36), rowH = pileH / cmax;
      const slots = [];
      cols.forEach((c) => { for (let j = 0; j < c.n; j++) slots.push({ dx: c.k * colW, dy: -(j + 0.5) * rowH, j }); });
      // order: lower slots filled first, chars dropped first claim the lowest
      slots.sort((a, b) => a.j - b.j || Math.abs(a.dx) - Math.abs(b.dx));
      parts.sort((a, b) => a.ci - b.ci || b.oy - a.oy);
      parts.forEach((p, i) => { const s = slots[i] || slots[slots.length - 1]; p.tx = s.dx; p.ty = s.dy; p.delay = Math.random() * 0.4; p.arc = 40 + Math.random() * 90; });
      return { pileH, sigma };
    }
    let pile = buildParticles();
    const env = (x) => base() - (pile.pileH + 4) * Math.exp(-((x - peakX()) ** 2) / (2 * pile.sigma * pile.sigma))
      - 9 * Math.exp(-((x - (X0() + (X1() - X0()) * 0.3)) ** 2) / 50) - 6 * Math.exp(-((x - (X0() + (X1() - X0()) * 0.62)) ** 2) / 40);
    const noise = Array.from({ length: 400 }, () => (Math.random() - 0.5) * 1.6);

    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const logLines = [
      [0.15, "PEPTICITY OPEN LAB · INSTRUMENT LOG"],
      [0.35, "[00:00.3] seq.load    Gly–His–Lys"],
      [1.0, "[00:01.0] seq.code    G H K"],
      [2.0, "[00:02.0] id.label    PEPTICITY"],
      [3.35, "[00:03.4] inject      A1 · C18 · 220 nm"],
      [5.85, "[00:05.9] peak        RT 8.42 · 99.4%"],
      [6.4, "[00:06.4] report      public · SAMPLE"],
    ];

    let t0 = null, done = false, lastT = 0;
    function draw(t) {
      g.clearRect(0, 0, W, H);
      const lift = ease(clamp((t - T.lift) / (T.end - T.lift)));
      const b0 = base(), lineY = b0 + (2 - b0) * lift, dy = lineY - b0;
      // intro sheet sits above the moving line; the site shows below it
      root.style.clipPath = lift > 0 ? `inset(0 0 ${Math.max(0, H - lineY)}px 0)` : "";
      g.save(); g.translate(0, dy);
      const gridA = clamp(t / 0.6) * (1 - lift * 0.6);
      // grid paper
      g.globalAlpha = gridA;
      const x0 = X0(), x1 = X1(), top = H * (mobile ? 0.26 : 0.21);
      for (let i = 0; i <= 20; i++) { const x = x0 + (x1 - x0) * (i / 20); g.strokeStyle = i % 5 ? "rgba(138,151,161,.16)" : "rgba(138,151,161,.42)"; g.lineWidth = 1; g.beginPath(); g.moveTo(Math.round(x) + 0.5, top); g.lineTo(Math.round(x) + 0.5, b0); g.stroke(); }
      for (let y = b0 - 40; y > top; y -= 40) { g.strokeStyle = "rgba(138,151,161,.16)"; g.beginPath(); g.moveTo(x0, y + 0.5); g.lineTo(x1, y + 0.5); g.stroke(); }
      g.fillStyle = "#46545F"; g.font = `500 ${mobile ? 10.5 : 12}px ${MONO}`; g.textAlign = "center"; g.textBaseline = "top";
      for (let i = 0; i <= 20; i += 5) g.fillText(String(i), x0 + (x1 - x0) * (i / 20), b0 + 10);
      g.textAlign = "right"; g.fillText("min", x1, b0 + 28);
      g.textAlign = "left"; g.fillText("mAU", x0, top - 18);
      g.globalAlpha = 1;
      // log
      g.font = `500 ${mobile ? 11 : 12.5}px ${MONO}`; g.textAlign = "left"; g.textBaseline = "top";
      logLines.forEach(([lt, s], i) => {
        if (t < lt) return;
        const n = Math.floor(clamp((t - lt) / 0.5) * s.length);
        g.fillStyle = i === 0 ? "#0F1A22" : "#46545F";
        g.fillText(s.slice(0, n), x0, (mobile ? 80 : 22) + i * (mobile ? 17 : 20));
      });
      // small "Gly–His–Lys" over GHK
      const seqS = "Gly – His – Lys", sn = Math.floor(clamp((t - T.seq) / 0.7) * seqS.length);
      if (t < T.drop + 0.4) {
        g.globalAlpha = 1 - clamp((t - T.drop) / 0.4);
        g.fillStyle = "#46545F"; g.font = `400 italic ${mobile ? 18 : 24}px "Fraunces", Georgia, serif`; g.textAlign = "center";
        g.fillText(seqS.slice(0, sn), W / 2, chars[0].y - bigFS * 1.3);
        g.globalAlpha = 1;
      }
      // glyphs: type → fall
      g.font = `500 ${bigFS}px ${MONO}`; g.textAlign = "left"; g.textBaseline = "alphabetic";
      let cursorX = null, cursorY = null;
      chars.forEach((ch) => {
        if (t < ch.t) return;
        const ft = (t - ch.dt) / ch.fall;
        if (ft >= 1) return; // became particles
        let y = ch.y;
        if (ft > 0) y = ch.y + (b0 - 2 - ch.y) * ft * ft;
        g.fillStyle = "#0F1A22"; g.fillText(ch.c, ch.x, y);
        if (ft <= 0) { cursorX = ch.x + ch.cw * 1.1; cursorY = ch.y; }
      });
      if (cursorX !== null && t < T.drop && Math.floor(t * 3) % 2 === 0) { g.fillStyle = "#E5383B"; g.fillRect(cursorX, cursorY - bigFS * 0.75, bigFS * 0.08, bigFS * 0.82); }
      // particles
      const px = peakX();
      g.fillStyle = "#0F1A22";
      parts.forEach((p) => {
        const ch = chars[p.ci], hit = ch.dt + ch.fall;
        if (t < hit) return;
        const sx = ch.x + p.ox, sy = b0 - 2 + p.oy;
        const u = ease(clamp((t - hit - p.delay) / 0.95));
        const ex = px + p.tx, ey = b0 + p.ty;
        const x = sx + (ex - sx) * u, y = sy + (ey - sy) * u - Math.sin(u * Math.PI) * p.arc;
        g.fillRect(x - p.s / 2, y - p.s / 2, p.s, p.s);
      });
      // live pen trace
      const pu = clamp((t - T.pen) / (T.penEnd - T.pen));
      if (pu > 0) {
        const xe = x0 + (x1 - x0) * pu;
        g.strokeStyle = "#0F1A22"; g.lineWidth = 1.6; g.lineJoin = "round"; g.beginPath();
        for (let x = x0, i = 0; x <= xe; x += 2, i++) { const y = env(x) + noise[i % 400] * (1 - Math.exp(-((x - px) ** 2) / (2 * pile.sigma * pile.sigma))); i ? g.lineTo(x, y) : g.moveTo(x, y); }
        g.stroke();
        if (pu < 1) { g.fillStyle = "#E5383B"; g.beginPath(); g.arc(xe, env(xe), 4, 0, 6.283); g.fill(); }
      }
      // label
      const la = clamp((t - T.label) / 0.5);
      if (la > 0) {
        const ay = env(px);
        g.globalAlpha = la;
        g.fillStyle = "#E5383B"; g.beginPath(); g.arc(px, ay, 5, 0, 6.283); g.fill();
        const ly = ay - (mobile ? 44 : 60), lx = px + (mobile ? 16 : 28);
        g.strokeStyle = "#0F1A22"; g.lineWidth = 1; g.beginPath(); g.moveTo(px, ay - 8); g.lineTo(px, ly); g.lineTo(lx, ly); g.stroke();
        g.font = `600 ${mobile ? 17 : 24}px ${MONO}`; g.textBaseline = "middle"; g.textAlign = "left";
        const s1 = "99.4%", w1 = g.measureText(s1).width;
        g.fillStyle = "#0F1A22"; g.fillText(s1, lx + 8, ly);
        g.font = `500 ${mobile ? 12 : 14}px ${MONO}`; g.fillStyle = "#46545F";
        g.fillText(" · SAMPLE", lx + 8 + w1, ly + 1);
        g.fillText("RT 8.42 min", lx + 8, ly + (mobile ? 20 : 26));
        g.globalAlpha = 1;
      }
      g.restore();
      // the baseline itself (drawn last, at the moving line)
      g.fillStyle = "#0F1A22"; g.fillRect(0, lineY - 2, W, 2);
      return t >= T.end;
    }

    function tick() {
      if (done) return;
      const now = performance.now() / 1000;
      if (t0 === null) t0 = now;
      lastT = now - t0;
      if (draw(lastT)) finish();
    }
    gsap.ticker.add(tick);

    function finish() {
      if (done) return; done = true;
      gsap.ticker.remove(tick);
      root.remove();
      html.classList.remove("intro-lock");
      ss.set("ol-intro", "1");
      running = false;
      document.removeEventListener("keydown", onKey);
      finishRoute();
      window.dispatchEvent(new Event("ol:ready"));
    }
    function skip() {
      if (done) return;
      // jump straight to the lift so the handoff still reads
      if (lastT < T.lift) t0 = performance.now() / 1000 - T.lift - 0.35;
    }
    function onKey(e) { if (e.key === "Escape" || ((e.key === "Enter" || e.key === " ") && document.activeElement === skipBtn)) { e.preventDefault(); skip(); } else if (e.key === "Escape") skip(); }
    skipBtn.addEventListener("click", skip);
    document.addEventListener("keydown", onKey);
    addEventListener("resize", () => { if (done) return; size(); layout(); parts.length = 0; pile = buildParticles(); }, { passive: true });
    if (document.fonts && document.fonts.load) Promise.race([document.fonts.load(`500 40px "Martian Mono"`), new Promise((r) => setTimeout(r, 500))]).then(() => { if (!done && lastT < 1) { layout(); parts.length = 0; pile = buildParticles(); } });
    skipBtn.focus({ preventScroll: true });
  }

  window.OLIntro = {
    play() {
      if (running) return;
      if (reduce) { finishRoute(); return; }
      scrollTo(0, 0);
      const el = tmpl.cloneNode(true);
      document.body.prepend(el);
      play(el);
    },
  };

  const replay = location.hash === "#intro";
  if (reduce || (!replay && ss.get("ol-intro") === "1")) { intro.remove(); finishRoute(); window.dispatchEvent(new Event("ol:ready")); return; }
  play(intro);
})();
