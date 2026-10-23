/* Pepticity Pure entrance (~8 s, once per session).
   0.2–1.45 a serum drop falls · 1.45 impact, crown + jet · rings spread and PEPTICITY crystallises from them,
   reflected in the surface · 5.2 a second drop falls through the wordmark, refracting it ·
   6.05 impact → the last ripple opens as a circular liquid reveal (wavy edge + feDisplacementMap) into the site. */
(function () {
  const intro = document.getElementById("intro");
  const html = document.documentElement;
  const ss = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const replay = location.hash === "#intro";
  let finished = false;
  function finish() {
    if (finished) return; finished = true;
    intro.remove(); html.classList.remove("intro-lock");
    ss.set("pp-intro", "1");
    if (location.hash === "#intro") history.replaceState(null, "", "#home");
    gsap.set("#main, .nav", { clearProps: "transform" });
    dispatchEvent(new Event("pp:ready"));
  }
  if (reduced || (!replay && ss.get("pp-intro") === "1")) { finish(); return; }
  html.classList.add("intro-lock");
  scrollTo(0, 0);

  const canvas = intro.querySelector(".intro-canvas"), ctx = canvas.getContext("2d");
  const video = intro.querySelector(".intro-plate");
  const chrome = intro.querySelector(".intro-chrome"), line = intro.querySelector(".intro-line"), skipBtn = intro.querySelector(".skip");
  let vReady = false;
  video.addEventListener("canplay", () => { vReady = true; video.play().catch(() => {}); });
  video.addEventListener("error", () => (vReady = false));

  let W, H, D, word, wordW, wordH, fs;
  const FONT = 'Gloock, "Bodoni 72", Didot, Georgia, serif';
  function size() {
    D = Math.min(devicePixelRatio || 1, 1.5);
    W = innerWidth; H = innerHeight;
    canvas.width = W * D; canvas.height = H * D; ctx.setTransform(D, 0, 0, D, 0, 0);
    // pre-render the wordmark once
    fs = Math.min(W * 0.125, 188);
    word = document.createElement("canvas"); const wc = word.getContext("2d");
    wc.font = `${fs}px ${FONT}`; if ("letterSpacing" in wc) wc.letterSpacing = `${fs * 0.04}px`;
    wordW = Math.ceil(wc.measureText("PEPTICITY").width + fs * 0.2); wordH = Math.ceil(fs * 1.25);
    word.width = wordW * D; word.height = wordH * D;
    wc.setTransform(D, 0, 0, D, 0, 0); wc.font = `${fs}px ${FONT}`; if ("letterSpacing" in wc) wc.letterSpacing = `${fs * 0.04}px`;
    wc.fillStyle = "#2A1D17"; wc.textBaseline = "alphabetic"; wc.fillText("PEPTICITY", fs * 0.1, fs * 0.98);
  }
  size(); addEventListener("resize", size);
  if (document.fonts) document.fonts.load(`80px Gloock`).then(size).catch(() => {});

  const IMPACT1 = 1.45, IMPACT2 = 6.05, END_REVEAL = 1.65;
  const RINGS = [[1.45, 1], [1.85, 0.8], [2.3, 0.62], [2.85, 0.46], [3.5, 0.32], [6.05, 1], [6.3, 0.7]];
  const crown = Array.from({ length: 30 }, (_, i) => { const a = Math.PI * (0.08 + 0.84 * (i / 29)) + (Math.random() - 0.5) * 0.1; const sp = 0.6 + Math.random() * 0.6; return { vx: Math.cos(a) * sp, vy: -Math.sin(a) * sp * 1.4, r: 1.2 + Math.random() * 2.6 }; });
  const ease = { inQuad: t => t * t, outCubic: t => 1 - Math.pow(1 - t, 3), inOut: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) };
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const geo = () => ({ horizon: H * 0.6, ix: W / 2, iy: H * 0.76, wy: H * 0.4, speed: Math.max(W * 0.17, 150) });

  function background(t, g) {
    if (vReady && video.videoWidth) {
      const s = Math.max(W / video.videoWidth, H / video.videoHeight);
      ctx.drawImage(video, (W - video.videoWidth * s) / 2, (H - video.videoHeight * s) / 2, video.videoWidth * s, video.videoHeight * s);
      ctx.fillStyle = "rgba(250,248,245,.42)"; ctx.fillRect(0, 0, W, H); return;
    }
    let gr = ctx.createLinearGradient(0, 0, 0, g.horizon);
    gr.addColorStop(0, "#FAF8F5"); gr.addColorStop(1, "#EEEAE4"); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, g.horizon);
    gr = ctx.createLinearGradient(0, g.horizon, 0, H);
    gr.addColorStop(0, "#E9E5DF"); gr.addColorStop(0.5, "#E1DCD5"); gr.addColorStop(1, "#D4CEC6"); ctx.fillStyle = gr; ctx.fillRect(0, g.horizon, W, H - g.horizon);
    // cool window sheen on the liquid
    gr = ctx.createRadialGradient(W * 0.5, g.horizon + 6, 0, W * 0.5, g.horizon + 6, W * 0.55);
    gr.addColorStop(0, "rgba(255,255,255,.75)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    ctx.save(); ctx.translate(0, g.horizon); ctx.scale(1, 0.12); ctx.translate(0, -g.horizon); ctx.fillStyle = gr; ctx.fillRect(0, g.horizon - W, W, W * 2); ctx.restore();
    ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.fillRect(0, g.horizon, W, 1);
  }
  function rings(t, g) {
    for (const [t0, amp] of RINGS) {
      const a = t - t0; if (a <= 0) continue;
      const rx = a * g.speed * (t0 >= IMPACT2 ? 1.8 : 1), ry = rx * 0.26;
      if (rx < 2) continue;
      const al = amp * Math.exp(-a * 0.55) * clamp(1 - rx / (W * 0.9));
      if (al < 0.01) continue;
      ctx.lineWidth = 2.2; ctx.strokeStyle = `rgba(255,255,255,${al * 0.95})`;
      ctx.beginPath(); ctx.ellipse(g.ix, g.iy, rx, ry, 0, 0, 7); ctx.stroke();
      ctx.lineWidth = 3; ctx.strokeStyle = `rgba(91,64,51,${al * 0.3})`;
      ctx.beginPath(); ctx.ellipse(g.ix, g.iy + 2.5, rx + 4, ry + 1.6, 0, 0, 7); ctx.stroke();
      ctx.lineWidth = 1; ctx.strokeStyle = `rgba(194,112,61,${al * 0.25})`;
      ctx.beginPath(); ctx.ellipse(g.ix, g.iy - 1.5, Math.max(0, rx - 5), Math.max(0, ry - 1.4), 0, 0, 7); ctx.stroke();
    }
  }
  // wordmark crystallises column-by-column as the ripple front passes; strips are displaced by the wave
  function wordmark(t, g, reflect) {
    const a = t - IMPACT1; if (a <= 0.05) return;
    const front = a * g.speed * 1.05, x0 = g.ix - wordW / 2, y0 = g.wy - wordH * 0.55;
    const env = Math.exp(-a * 0.95) * 30 + (t > IMPACT2 ? Math.exp(-(t - IMPACT2) * 1.5) * 10 : 0);
    const step = 3;
    ctx.save();
    if (reflect) { ctx.translate(0, g.horizon); ctx.scale(1, -0.5); ctx.translate(0, -g.horizon + (g.horizon - y0 - wordH) - 8); }
    for (let x = 0; x < wordW; x += step) {
      const dist = Math.abs(x0 + x - g.ix);
      const al = clamp((front - dist) / (W * 0.1)); if (al <= 0) continue;
      const dy = env * Math.sin(dist * 0.05 - a * 8.5) * (1 - al * 0.6) + (reflect ? Math.sin(x * 0.04 + t * 5) * 3 : 0);
      ctx.globalAlpha = (reflect ? 0.16 : 1) * al;
      ctx.drawImage(word, x * D, 0, step * D, wordH * D, x0 + x, y0 + dy, step + 0.4, wordH);
      if (!reflect && env > 3) { ctx.globalAlpha = al * clamp(env / 40) * 0.35; ctx.drawImage(word, x * D, 0, step * D, wordH * D, x0 + x + 2.5, y0 + dy * 1.25, step, wordH); }
    }
    ctx.restore();
  }
  function drop(x, y, r, stretch, lens) {
    const p = new Path2D();
    p.moveTo(x, y - r * (1.7 + stretch));
    p.bezierCurveTo(x + r * 0.5, y - r * 1.1, x + r, y - r * 0.5, x + r, y);
    p.arc(x, y, r, 0, Math.PI); p.bezierCurveTo(x - r, y - r * 0.5, x - r * 0.5, y - r * 1.1, x, y - r * (1.7 + stretch));
    if (lens) { // refract: the drop shows what's behind it, magnified and inverted
      ctx.save(); ctx.clip(p);
      const s = 2.2;
      ctx.translate(x, y); ctx.scale(1, -1);
      ctx.drawImage(canvas, (x - r * s / 2) * D, (y - r * s / 2) * D, r * s * D, r * s * D, -r * 1.05, -r * 1.05, r * 2.1, r * 2.1);
      ctx.restore();
    }
    const gr = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r * 1.5);
    gr.addColorStop(0, "rgba(255,255,255,.9)"); gr.addColorStop(0.45, "rgba(194,112,61,.12)"); gr.addColorStop(0.85, "rgba(91,64,51,.42)"); gr.addColorStop(1, "rgba(42,29,23,.7)");
    ctx.fillStyle = gr; ctx.fill(p);
    ctx.strokeStyle = "rgba(42,29,23,.35)"; ctx.lineWidth = 1; ctx.stroke(p);
    ctx.fillStyle = "rgba(255,255,255,.95)"; ctx.beginPath(); ctx.ellipse(x - r * 0.38, y - r * 0.35, r * 0.18, r * 0.1, -0.6, 0, 7); ctx.fill();
  }
  function fall(t, t0, t1, g, r, lens) {
    if (t < t0 || t > t1) return;
    const p = ease.inQuad(clamp((t - t0) / (t1 - t0)));
    const y = -r * 3 + (g.iy - r + r * 3) * p;
    const sh = clamp(p * 1.2); // contact shadow grows on the surface
    ctx.fillStyle = `rgba(42,29,23,${0.12 * sh})`; ctx.beginPath(); ctx.ellipse(g.ix, g.iy + 4, r * (2.2 - sh), r * 0.35, 0, 0, 7); ctx.fill();
    drop(g.ix, y, r, p * 0.9, lens);
  }
  function splash(t, g, t0, scale) {
    const a = t - t0; if (a < 0 || a > 1.2) return;
    // Worthington jet
    const h = Math.sin(Math.PI * clamp(a / 0.75)) * H * 0.075 * scale;
    if (h > 1) {
      const w = 7 * scale;
      const gr = ctx.createLinearGradient(g.ix - w, 0, g.ix + w, 0); gr.addColorStop(0, "rgba(91,64,51,.35)"); gr.addColorStop(0.4, "rgba(255,255,255,.9)"); gr.addColorStop(1, "rgba(91,64,51,.3)");
      ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(g.ix - w * 1.6, g.iy); ctx.quadraticCurveTo(g.ix - w * 0.6, g.iy - h * 0.4, g.ix - w * 0.5, g.iy - h);
      ctx.arc(g.ix, g.iy - h, w * 0.5, Math.PI, 0); ctx.quadraticCurveTo(g.ix + w * 0.6, g.iy - h * 0.4, g.ix + w * 1.6, g.iy); ctx.fill();
      if (a > 0.32 && a < 1) drop(g.ix, g.iy - h - 12 * scale - (a - 0.32) * 40 * scale, 4 * scale, 0.2, false);
    }
    // crown droplets
    for (const c of crown) {
      const x = g.ix + c.vx * a * 260 * scale, y = g.iy + (c.vy * a * 240 + 420 * a * a) * scale * 0.9;
      if (y > g.iy + 6) continue;
      ctx.fillStyle = `rgba(255,255,255,${0.95 * (1 - a / 1.2)})`; ctx.beginPath(); ctx.arc(x, y, c.r * scale, 0, 7); ctx.fill();
      ctx.fillStyle = `rgba(91,64,51,${0.35 * (1 - a / 1.2)})`; ctx.beginPath(); ctx.arc(x + c.r * 0.3, y + c.r * 0.4, c.r * 0.5 * scale, 0, 7); ctx.fill();
    }
  }
  function wavyHole(cx, cy, R, k, t) {
    const p = new Path2D(), N = 140;
    for (let i = 0; i <= N; i++) {
      const th = (i / N) * Math.PI * 2;
      const w = 1 + 0.028 * Math.sin(th * 6 + t * 3.2) + 0.016 * Math.sin(th * 11 - t * 5) + 0.01 * Math.sin(th * 19 + t * 2);
      const x = cx + Math.cos(th) * R * w, y = cy + Math.sin(th) * R * w * k;
      i ? p.lineTo(x, y) : p.moveTo(x, y);
    }
    p.closePath(); return p;
  }

  // ---- clock ----
  window.__introStart = performance.now();
  let start = performance.now(), offset = 0, revealDur = END_REVEAL, revealStarted = false;
  const site = [document.getElementById("main"), document.querySelector(".nav")];
  function beginReveal() {
    if (revealStarted) return; revealStarted = true;
    canvas.style.filter = "url(#liquid-edge)";
    gsap.to([chrome, line, skipBtn], { opacity: 0, duration: 0.35 });
    gsap.fromTo(site, { scale: 1.06 }, { scale: 1, duration: revealDur + 0.2, ease: "power3.out" });
    intro.style.pointerEvents = "none";
  }
  function skip() {
    const t = (performance.now() - start) / 1000 + offset;
    if (t < IMPACT2 - 0.1) { offset += IMPACT2 - 0.1 - t; revealDur = 1.0; }
  }
  skipBtn.addEventListener("click", skip);
  const onKey = e => { if (["Escape", "Enter", " "].includes(e.key) && !finished) { e.preventDefault(); skip(); } };
  addEventListener("keydown", onKey);
  setTimeout(() => skipBtn.focus({ preventScroll: true }), 300);

  function frame(now) {
    if (finished) return;
    const t = (now - start) / 1000 + offset, g = geo();
    ctx.globalCompositeOperation = "source-over";
    background(t, g);
    rings(t, g);
    wordmark(t, g, true);
    wordmark(t, g, false);
    fall(t, 0.2, IMPACT1, g, Math.max(14, W * 0.016), true);
    splash(t, g, IMPACT1, Math.max(0.6, Math.min(1.2, W / 1200)));
    fall(t, 5.25, IMPACT2, g, Math.max(10, W * 0.011), true);
    splash(t, g, IMPACT2, Math.max(0.45, Math.min(0.8, W / 1600)));
    if (t > 4.3) line.classList.add("on");
    if (t > 0.3) chrome.classList.add("on");
    if (t >= IMPACT2 + 0.05) {
      beginReveal();
      const p = ease.inOut(clamp((t - IMPACT2 - 0.05) / revealDur));
      const R = p * Math.hypot(W, H) * 1.15, k = 0.28 + 0.72 * Math.min(1, p * 1.6);
      const hole = wavyHole(g.ix, g.iy, R, k, t);
      ctx.globalCompositeOperation = "destination-out"; ctx.fill(hole);
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = 10; ctx.strokeStyle = "rgba(194,112,61,.28)"; ctx.stroke(hole);
      ctx.lineWidth = 2.5; ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.stroke(hole);
      if (p >= 1) { removeEventListener("keydown", onKey); finish(); return; }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
