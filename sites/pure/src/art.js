/* Pepticity Pure — procedural art. Product renders, the hero still life (lens texture) and
   designed fallbacks for every photograph, all painted on canvas in the house palette. */
(function () {
  const C = { esp: "#2A1D17", por: "#EEEAE4", milk: "#FAF8F5", cocoa: "#5B4033", cu: "#C2703D" };
  const SERIF = 'Gloock, "Bodoni 72", Didot, Georgia, serif';
  const SANS = '"Schibsted Grotesk", "Helvetica Neue", Arial, sans-serif';

  function cv(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
  function rr(x, y, w, h, r, ctx) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function cyl(ctx, x, w, stops) { // horizontal cylinder shading
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    stops.forEach(([o, c]) => g.addColorStop(o, c)); return g;
  }
  function shadow(ctx, x, y, rx, ry, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, rx);
    g.addColorStop(0, `rgba(42,29,23,${a})`); g.addColorStop(1, "rgba(42,29,23,0)");
    ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx); ctx.translate(-x, -y);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rx, 0, 7); ctx.fill(); ctx.restore();
  }
  function label(ctx, cx, y, code, name, dark) {
    ctx.textAlign = "center"; ctx.fillStyle = dark ? C.milk : C.esp;
    ctx.font = `22px ${SERIF}`; ctx.fillText("PEPTICITY", cx, y);
    ctx.fillStyle = C.cu; ctx.fillRect(cx - 26, y + 12, 52, 2);
    ctx.fillStyle = dark ? C.milk : C.esp; ctx.font = `46px ${SERIF}`; ctx.fillText(code, cx, y + 64);
    ctx.font = `600 13px ${SANS}`; ctx.fillStyle = dark ? "rgba(250,248,245,.8)" : C.cocoa;
    ctx.fillText(name, cx, y + 92);
  }

  // ---- individual objects, drawn around (cx, base) at scale 1 ≈ 640×800 frame ----
  function dropper(ctx, cx, base, o = {}) {
    const w = 210, h = 360, x = cx - w / 2, y = base - h;
    shadow(ctx, cx + 18, base + 4, 170, 22, 0.32);
    // glass body
    rr(x, y, w, h, 30, ctx);
    ctx.fillStyle = cyl(ctx, x, w, [[0, "rgba(214,206,198,.75)"], [0.18, "rgba(250,248,245,.55)"], [0.55, "rgba(230,224,217,.4)"], [0.9, "rgba(200,192,184,.7)"], [1, "rgba(160,150,142,.8)"]]);
    ctx.fill();
    // liquid
    ctx.save(); rr(x + 8, y + 70, w - 16, h - 78, 24, ctx); ctx.clip();
    const lg = ctx.createLinearGradient(0, y + 70, 0, base);
    lg.addColorStop(0, o.dark ? "rgba(42,29,23,.55)" : "rgba(194,112,61,.30)");
    lg.addColorStop(1, o.dark ? "rgba(42,29,23,.85)" : "rgba(150,90,60,.55)");
    ctx.fillStyle = lg; ctx.fillRect(x, y + 70, w, h);
    ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.beginPath(); ctx.ellipse(cx, y + 72, w / 2 - 10, 7, 0, 0, 7); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = "rgba(42,29,23,.28)"; ctx.lineWidth = 2; rr(x, y, w, h, 30, ctx); ctx.stroke();
    // highlights
    const hg = ctx.createLinearGradient(x + 16, 0, x + 40, 0); hg.addColorStop(0, "rgba(255,255,255,0)"); hg.addColorStop(0.5, "rgba(255,255,255,.85)"); hg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = hg; rr(x + 16, y + 24, 24, h - 50, 12, ctx); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.4)"; ctx.fillRect(x + w - 22, y + 30, 5, h - 70);
    // label
    ctx.fillStyle = o.dark ? C.esp : "rgba(250,248,245,.96)"; ctx.fillRect(x + 14, y + 140, w - 28, 150);
    label(ctx, cx, y + 182, o.code || "Cu.01", o.name || "COPPER PEPTIDE SERUM", o.dark);
    // shoulder + collar + bulb
    ctx.fillStyle = cyl(ctx, cx - 56, 112, [[0, "#1c130f"], [0.3, "#5b4033"], [0.5, "#3a2a22"], [1, "#140d0a"]]);
    rr(cx - 56, y - 58, 112, 64, 10, ctx); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.18)"; ctx.fillRect(cx - 40, y - 54, 8, 56);
    ctx.fillStyle = cyl(ctx, cx - 34, 68, [[0, "#1a110d"], [0.35, "#4a352b"], [1, "#120b08"]]);
    ctx.beginPath(); ctx.moveTo(cx - 30, y - 56); ctx.bezierCurveTo(cx - 40, y - 120, cx - 36, y - 178, cx, y - 182);
    ctx.bezierCurveTo(cx + 36, y - 178, cx + 40, y - 120, cx + 30, y - 56); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.14)"; ctx.beginPath(); ctx.ellipse(cx - 14, y - 128, 6, 32, 0, 0, 7); ctx.fill();
  }
  function jar(ctx, cx, base, o = {}) {
    const w = 300, h = 170, x = cx - w / 2, y = base - h;
    shadow(ctx, cx + 20, base + 6, 220, 26, 0.32);
    const body = o.dark ? [[0, "#140d0a"], [0.25, "#4a352b"], [0.45, "#2A1D17"], [1, "#100a07"]] : [[0, "#d6cfc6"], [0.22, "#ffffff"], [0.5, "#EEEAE4"], [0.85, "#d9d2c9"], [1, "#bdb4aa"]];
    ctx.fillStyle = cyl(ctx, x, w, body);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, base - 14); ctx.ellipse(cx, base - 14, w / 2, 16, 0, Math.PI, 0, true); ctx.lineTo(x + w, y); ctx.closePath(); ctx.fill();
    // lid
    const lid = o.dark ? [[0, "#7a4322"], [0.3, "#e0a27a"], [0.5, "#C2703D"], [1, "#5a3018"]] : [[0, "#140d0a"], [0.3, "#5b4033"], [0.55, "#2A1D17"], [1, "#0e0806"]];
    ctx.fillStyle = cyl(ctx, x - 6, w + 12, lid);
    ctx.fillRect(x - 6, y - 72, w + 12, 76);
    ctx.beginPath(); ctx.ellipse(cx, y + 4, w / 2 + 6, 16, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = o.dark ? "#d48a5a" : "#3c2b23"; ctx.beginPath(); ctx.ellipse(cx, y - 72, w / 2 + 6, 16, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.2)"; ctx.fillRect(x + 30, y - 66, 10, 66);
    // label (printed on ceramic)
    ctx.textAlign = "center"; ctx.fillStyle = o.dark ? C.milk : C.esp;
    ctx.font = `20px ${SERIF}`; ctx.fillText("PEPTICITY", cx, y + 50);
    ctx.font = `40px ${SERIF}`; ctx.fillText(o.code || "Cu.02", cx, y + 100);
    ctx.font = `600 12px ${SANS}`; ctx.fillStyle = o.dark ? "rgba(250,248,245,.8)" : C.cocoa; ctx.fillText(o.name || "CUSHION CREAM", cx, y + 128);
    ctx.fillStyle = "rgba(255,255,255,.45)"; ctx.fillRect(x + 40, y + 8, 12, h - 30);
  }
  function pump(ctx, cx, base, o = {}) {
    const w = 104, h = 330, x = cx - w / 2, y = base - h;
    shadow(ctx, cx + 14, base + 4, 110, 16, 0.32);
    ctx.fillStyle = cyl(ctx, x, w, [[0, "#cfc7be"], [0.25, "#ffffff"], [0.55, "#EEEAE4"], [1, "#b5aca2"]]);
    rr(x, y, w, h, 16, ctx); ctx.fill();
    ctx.fillStyle = cyl(ctx, x, w, [[0, "#140d0a"], [0.3, "#5b4033"], [0.55, "#2A1D17"], [1, "#0e0806"]]);
    rr(x - 2, y - 110, w + 4, 116, 14, ctx); ctx.fill();
    ctx.fillStyle = C.cu; ctx.fillRect(x - 2, y - 2, w + 4, 4);
    ctx.fillStyle = "rgba(255,255,255,.2)"; ctx.fillRect(x + 14, y - 100, 7, 100);
    ctx.fillStyle = "rgba(255,255,255,.6)"; ctx.fillRect(x + 14, y + 16, 8, h - 40);
    ctx.save(); ctx.translate(cx + 8, y + h / 2 + 10); ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center"; ctx.fillStyle = C.esp; ctx.font = `30px ${SERIF}`; ctx.fillText(o.code || "Cu.03", 0, -6);
    ctx.font = `600 11px ${SANS}`; ctx.fillStyle = C.cocoa; ctx.fillText(o.name || "EYE VEIL", 0, 18); ctx.restore();
  }

  const KINDS = {
    serum: (ctx) => dropper(ctx, 320, 690, {}),
    serumMini: (ctx) => { ctx.translate(320, 690); ctx.scale(0.74, 0.74); ctx.translate(-320, -690); dropper(ctx, 320, 690, { code: "Cu.01", name: "TRAVEL · 10 ML" }); },
    cream: (ctx) => jar(ctx, 320, 680, {}),
    night: (ctx) => jar(ctx, 320, 680, { dark: true, code: "Cu.04", name: "NIGHT BALM" }),
    eye: (ctx) => pump(ctx, 320, 690, {}),
    set: (ctx) => {
      ctx.save(); ctx.translate(140, 690); ctx.scale(0.6, 0.6); ctx.translate(-320, -690); pump(ctx, 320, 690, {}); ctx.restore();
      ctx.save(); ctx.translate(470, 700); ctx.scale(0.58, 0.58); ctx.translate(-320, -680); jar(ctx, 320, 680, {}); ctx.restore();
      ctx.save(); ctx.translate(310, 712); ctx.scale(0.72, 0.72); ctx.translate(-320, -690); dropper(ctx, 320, 690, {}); ctx.restore();
    },
  };
  const cache = {};
  function product(kind) {
    if (cache[kind]) return cache[kind];
    const c = cv(640, 800), ctx = c.getContext("2d");
    ctx.save(); KINDS[kind](ctx); ctx.restore();
    return (cache[kind] = c.toDataURL("image/png"));
  }

  // ---- hero still life: a pure drop on ivory stone with an audience word behind it ----
  const WORDS = { none: "Visible", longevity: "Onward", energy: "Myself", women: "Forty+", men: "Steady", athlete: "Recover" };
  const TINTS = { none: [194, 112, 61], longevity: [176, 120, 86], energy: [194, 112, 61], women: [150, 92, 76], men: [91, 64, 51], athlete: [120, 70, 46] };
  function hero(aud = "none", w = 1200, h = 1400) {
    const c = cv(w, h), ctx = c.getContext("2d"), t = TINTS[aud] || TINTS.none;
    // backdrop: porcelain wall, cool window light
    let g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#F7F5F1"); g.addColorStop(0.55, "#ECE8E2"); g.addColorStop(1, "#DCD6CE"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.save(); ctx.globalAlpha = 0.5; ctx.filter = "blur(40px)"; ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.moveTo(w * 0.1, 0); ctx.lineTo(w * 0.42, 0); ctx.lineTo(w * 0.95, h * 0.7); ctx.lineTo(w * 0.62, h * 0.72); ctx.closePath(); ctx.fill(); ctx.restore();
    // micro-type INCI lines (the lens magnifies these)
    ctx.save(); ctx.fillStyle = "rgba(91,64,51,.30)"; ctx.font = `600 ${Math.round(w * 0.0115)}px ${SANS}`;
    const line = "SEQUENCE · SYNTHESIS · IDENTITY · PURITY · CONTAMINANTS · PHARMACY · LOT · CERTIFICATE · YOUR DOOR · ";
    for (let i = 0; i < 26; i++) ctx.fillText(line + line, -((i * 37) % 300), h * 0.06 + i * w * 0.021);
    ctx.restore();
    // audience word, huge outline serif
    ctx.save(); ctx.font = `${Math.round(w * 0.3)}px ${SERIF}`; ctx.textAlign = "center";
    ctx.fillStyle = `rgba(${t[0]},${t[1]},${t[2]},.10)`; ctx.fillText(WORDS[aud] || WORDS.none, w * 0.5, h * 0.48);
    ctx.lineWidth = 2; ctx.strokeStyle = `rgba(${t[0]},${t[1]},${t[2]},.45)`; ctx.strokeText(WORDS[aud] || WORDS.none, w * 0.5, h * 0.48); ctx.restore();
    // stone slab
    const sy = h * 0.66;
    g = ctx.createLinearGradient(0, sy, 0, h); g.addColorStop(0, "#F3EFEA"); g.addColorStop(0.08, "#E6E0D8"); g.addColorStop(1, "#C9C1B7");
    ctx.fillStyle = g; ctx.fillRect(0, sy, w, h - sy);
    ctx.fillStyle = "rgba(255,255,255,.8)"; ctx.fillRect(0, sy, w, 3);
    ctx.save(); ctx.globalAlpha = 0.12; ctx.strokeStyle = C.cocoa; ctx.lineWidth = 1.2; // stone veins
    for (let i = 0; i < 9; i++) { ctx.beginPath(); let x = Math.random() * w, y = sy + 20 + Math.random() * (h - sy);
      ctx.moveTo(x, y); for (let k = 0; k < 6; k++) { x += 60 + Math.random() * 90; y += (Math.random() - 0.5) * 50; ctx.lineTo(x, y); } ctx.stroke(); }
    ctx.restore();
    // the drop: a sessile liquid bead on the stone
    const dx = w * 0.5, dy = sy + h * 0.1, R = w * 0.2;
    shadow(ctx, dx + R * 0.25, dy + R * 0.32, R * 1.25, R * 0.2, 0.28);
    ctx.save(); ctx.beginPath(); ctx.ellipse(dx, dy, R, R * 0.55, 0, Math.PI, 0); ctx.ellipse(dx, dy, R, R * 0.2, 0, 0, Math.PI); ctx.closePath(); ctx.clip();
    g = ctx.createRadialGradient(dx - R * 0.3, dy - R * 0.35, R * 0.05, dx, dy, R * 1.1);
    g.addColorStop(0, "rgba(255,255,255,.95)"); g.addColorStop(0.35, `rgba(${t[0]},${t[1]},${t[2]},.25)`); g.addColorStop(0.8, `rgba(${t[0]},${t[1]},${t[2]},.55)`); g.addColorStop(1, "rgba(42,29,23,.7)");
    ctx.fillStyle = g; ctx.fillRect(dx - R, dy - R, R * 2, R * 2);
    // inverted refraction of the stone edge inside the drop
    ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.fillRect(dx - R, dy + R * 0.05, R * 2, 3);
    ctx.restore();
    ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.beginPath(); ctx.ellipse(dx - R * 0.42, dy - R * 0.3, R * 0.16, R * 0.06, -0.35, 0, 7); ctx.fill();
    ctx.fillStyle = `rgba(${t[0]},${t[1]},${t[2]},.35)`; ctx.beginPath(); ctx.ellipse(dx + R * 0.3, dy + R * 0.34, R * 0.5, R * 0.05, 0, 0, 7); ctx.fill(); // caustic
    // a falling drop above it
    const fx = dx, fy = sy - h * 0.2, fr = w * 0.035;
    ctx.save(); ctx.beginPath(); ctx.moveTo(fx, fy - fr * 2.6); ctx.bezierCurveTo(fx + fr * 0.4, fy - fr * 1.4, fx + fr, fy - fr * 0.6, fx + fr, fy);
    ctx.arc(fx, fy, fr, 0, Math.PI); ctx.bezierCurveTo(fx - fr, fy - fr * 0.6, fx - fr * 0.4, fy - fr * 1.4, fx, fy - fr * 2.6); ctx.closePath();
    g = ctx.createRadialGradient(fx - fr * 0.3, fy - fr * 0.4, 1, fx, fy, fr * 1.6); g.addColorStop(0, "#fff"); g.addColorStop(0.6, `rgba(${t[0]},${t[1]},${t[2]},.5)`); g.addColorStop(1, "rgba(42,29,23,.7)");
    ctx.fillStyle = g; ctx.fill(); ctx.restore();
    return c;
  }

  // ---- fallbacks for photographs ----
  function swirl(w = 1200, h = 900) {
    const c = cv(w, h), ctx = c.getContext("2d");
    let g = ctx.createRadialGradient(w * 0.6, h * 0.5, 0, w * 0.6, h * 0.5, w * 0.8);
    g.addColorStop(0, "#3a2820"); g.addColorStop(1, "#140d0a"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 260; i++) {
      const a0 = i * 0.11, r0 = 8 + i * 1.6;
      ctx.strokeStyle = `rgba(194,112,61,${0.05 + 0.25 * Math.pow(Math.sin(i * 0.05), 2)})`; ctx.lineWidth = 0.8 + (i % 7 === 0 ? 1.6 : 0);
      ctx.beginPath();
      for (let k = 0; k < 90; k++) { const a = a0 + k * 0.06, r = r0 * Math.exp(k * 0.012); const x = w * 0.6 + Math.cos(a) * r * 1.3, y = h * 0.5 + Math.sin(a) * r * 0.8; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
    g = ctx.createRadialGradient(w * 0.6, h * 0.5, 0, w * 0.6, h * 0.5, 60); g.addColorStop(0, "rgba(250,248,245,.6)"); g.addColorStop(1, "rgba(250,248,245,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    return c.toDataURL("image/jpeg", 0.86);
  }
  function flatlay(w = 1000, h = 1000) {
    const c = cv(w, h), ctx = c.getContext("2d");
    let g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#F1EDE8"); g.addColorStop(1, "#DDD6CD"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const place = (kind, x, y, s, rot) => { const img = new Image(); return new Promise(res => { img.onload = () => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.drawImage(img, -320, -400); ctx.restore(); res(); }; img.src = product(kind); }); };
    return Promise.all([place("serum", w * 0.32, h * 0.42, 0.8, -0.5), place("cream", w * 0.7, h * 0.36, 0.7, 0.2), place("eye", w * 0.62, h * 0.78, 0.66, 1.1)]).then(() => c.toDataURL("image/jpeg", 0.88));
  }

  window.PepArt = { product, hero, swirl, flatlay, C };
})();
