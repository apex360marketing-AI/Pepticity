/* Pepticity cinematic entrance — three options on one rAF clock.
 *  A synthesis (8.6s): the residues P-E-P-T-I-C-I-T-Y spawn → bond → fold to a helix → collapse into
 *                      the P mark → letters fly into the wordmark → the page turns like a cube into the site
 *  B film      (8.4s): Higgsfield molecule film → P mark draws → wordmark rises → a portal opens
 *                      at the mark and the camera pushes through it into the site
 *  C vial      (8.0s): Higgsfield vial push-in → mark + wordmark → light scan → the frame splits
 *                      open like a letterbox onto the site
 * Choose with #synthesis / #film / #vial, or the review-build picker. Plays once per session. */
(function () {
  const { Helix, SHAPES, mix, ease, clamp, lerp, LETTERS } = window.PepHelix;
  const intro = document.getElementById("intro");
  const site = document.getElementById("site");
  const stage = document.getElementById("stage");
  const ss = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
  };
  const MODES = { synthesis: 8.6, film: 8.4, vial: 8.0 };
  const hashMode = location.hash.slice(1);
  const mode = MODES[hashMode] ? hashMode : (MODES[ss.get("pep-mode")] ? ss.get("pep-mode") : "synthesis");
  const TOTAL = MODES[mode];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const replay = ss.get("pep-replay") === "1" || !!MODES[hashMode];

  document.querySelectorAll(".intro-picker [data-mode]").forEach(b => {
    b.classList.toggle("on", b.dataset.mode === mode);
    b.addEventListener("click", () => { ss.set("pep-mode", b.dataset.mode); ss.set("pep-replay", "1"); scrollTo(0, 0); location.reload(); });
  });

  let finished = false;
  function finish() {
    if (finished) return; finished = true;
    intro.remove();
    stage.classList.add("done");
    stage.style.transform = "";
    site.style.transform = ""; site.style.filter = ""; site.style.transformOrigin = "";
    document.documentElement.classList.remove("intro-lock");
    ss.set("pep-intro", "1"); ss.set("pep-replay", "0");
    window.dispatchEvent(new Event("pep:ready"));
  }
  if (!replay && (ss.get("pep-intro") === "1" || reduced)) { finish(); return; }

  document.documentElement.classList.add("intro-lock");
  intro.dataset.mode = mode;
  intro.querySelector(".intro-name").textContent = { synthesis: "A · Synthesis", film: "B · Film", vial: "C · Vial" }[mode];
  const canvas = intro.querySelector("canvas");
  const hx = new Helix(canvas, { scale: 0.13, dust: 180 });
  const hud = intro.querySelector(".hud"), scan = intro.querySelector(".scan");
  const word = intro.querySelector(".wordmark"), tag = intro.querySelector(".tagline");
  const counter = intro.querySelector(".seq");
  const mark = intro.querySelector(".intro-mark path");
  const markLen = mark.getTotalLength();
  mark.style.strokeDasharray = markLen; mark.style.strokeDashoffset = markLen;
  const slots = [...word.querySelectorAll("span")];

  // Higgsfield plate per mode; if it can't load, the canvas carries the scene alone
  const plate = intro.querySelector(".intro-plate");
  let plateOk = false;
  plate.src = plate.dataset["src" + mode[0].toUpperCase() + mode.slice(1)];
  plate.addEventListener("canplay", () => { plateOk = true; }, { once: true });

  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const flyers = mode !== "synthesis" ? [] : LETTERS.map(ch => {
    const s = document.createElement("span"); s.className = "flyer"; s.textContent = ch; intro.appendChild(s); return s;
  });

  function rise(t, a) { // wordmark letters rise out of blur (film + vial)
    word.style.opacity = 1;
    slots.forEach((s, i) => {
      const k = ease.out(seg(t, a + i * 0.06, a + 0.7 + i * 0.06));
      s.style.opacity = k; s.style.transform = `translateY(${(1 - k) * 40}%)`; s.style.filter = `blur(${(1 - k) * 10}px)`;
    });
  }

  const SCENES = {
    synthesis(t, dt) {
      const S = hx.state;
      plate.style.opacity = plateOk ? 0.55 * Math.min(seg(t, 0.3, 1.6), 1 - seg(t, 5.0, 6.4)) : 0;
      scan.style.transform = `scaleX(${ease.out(seg(t, 0, 0.7))})`;
      scan.style.opacity = 1 - seg(t, 0.9, 1.5);
      hud.style.opacity = Math.min(seg(t, 0.15, 0.5), 1 - seg(t, 6.6, 7.1));
      counter.textContent = "SEQ " + String(Math.floor(lerp(0, 9, seg(t, 0.5, 2.3)))).padStart(3, "0") + " / 009";
      S.spawn = lerp(0, 9, seg(t, 0.5, 2.3));
      S.bonds = lerp(0, 8, seg(t, 0.75, 2.4));
      S.pulse = t > 1.9 && t < 2.8 ? lerp(0, 8, seg(t, 1.9, 2.8)) : -1;
      S.letters = Math.min(seg(t, 0.6, 1.2), 1 - seg(t, 2.5, 2.9));
      const fold = ease.inOut(seg(t, 2.4, 4.4)), close = ease.inOutQuart(seg(t, 4.4, 5.6));
      S.shape = close > 0 ? mix(SHAPES.helix, SHAPES.mark, close) : mix(SHAPES.line, SHAPES.helix, fold);
      S.yaw = ease.inOut(seg(t, 2.2, 5.6)) * Math.PI * 4; // two orbits, landing front-on
      S.pitch = lerp(0.18, 0, close) + Math.sin(t * 1.3) * 0.04 * (1 - close);
      S.sidechains = Math.min(seg(t, 2.6, 3.2), 1 - seg(t, 4.6, 5.2));
      S.ring = ease.out(seg(t, 5.3, 5.8));
      S.wave = seg(t, 5.6, 6.6);
      S.zoom = lerp(1, 1.18, ease.inOut(seg(t, 2.4, 4.0))) - 0.18 * close;
      S.cy = lerp(0.5, 0.42, close);
      S.dustAlpha = 0.6 + 0.4 * seg(t, 2.4, 3.5) - 0.5 * seg(t, 5.6, 7);
      const P = hx.render(dt);
      const fly = seg(t, 5.0, 6.3);
      word.style.opacity = seg(t, 6.15, 6.35);
      flyers.forEach((f, i) => {
        const k = ease.inOutQuart(clamp(fly * 1.6 - i * 0.07));
        if (fly <= 0 || k >= 1) { f.style.opacity = 0; return; }
        const r = slots[i].getBoundingClientRect();
        f.style.opacity = 1;
        f.style.transform = `translate(${lerp(P[i].x, r.left + r.width / 2, k)}px, ${lerp(P[i].y, r.top + r.height / 2, k)}px) translate(-50%,-50%)`;
        f.style.fontSize = lerp(13, r.height * 0.82, k) + "px";
      });
      word.style.setProperty("--sweep", lerp(-30, 130, ease.inOut(seg(t, 6.3, 7.1))) + "%");
      tag.style.opacity = seg(t, 6.5, 6.9);
      const turn = ease.inOutQuart(seg(t, 7.1, TOTAL)); // cube turn
      stage.style.transform = `scale(${1 - 0.16 * Math.sin(Math.PI * turn)})`;
      intro.style.transform = `rotateY(${-90 * turn}deg)`;
      site.style.transform = `rotateY(${90 - 90 * turn}deg)`;
      intro.style.filter = `brightness(${1 - 0.6 * turn})`;
      site.style.filter = `brightness(${0.4 + 0.6 * turn})`;
    },

    film(t, dt) {
      const S = hx.state;
      plate.style.opacity = Math.min(seg(t, 0, 0.8), 1 - 0.55 * seg(t, 3.0, 4.5));
      Object.assign(S, { shape: SHAPES.helix, spawn: 9, bonds: 8, letters: 0, sidechains: 1, zoom: 1.3, cy: 0.4,
        yaw: t * 0.6, pitch: 0.2, dustAlpha: 0.8 });
      canvas.style.opacity = plateOk ? 0 : Math.min(seg(t, 0, 1), 1 - seg(t, 3.0, 4.2)) * 0.9;
      hx.render(dt);
      hud.style.opacity = Math.min(seg(t, 0.4, 0.9), 1 - seg(t, 3.0, 3.4));
      counter.textContent = "FRAME " + String(Math.floor(t * 24)).padStart(3, "0");
      mark.parentNode.style.opacity = seg(t, 3.2, 3.5);
      mark.style.strokeDashoffset = markLen * (1 - ease.inOut(seg(t, 3.3, 4.8)));
      rise(t, 4.2);
      tag.style.opacity = seg(t, 5.2, 5.7);
      word.style.setProperty("--sweep", lerp(-30, 130, ease.inOut(seg(t, 5.3, 6.3))) + "%");
      const k = ease.inOutQuart(seg(t, 6.5, TOTAL)); // portal through the mark
      const R = k * Math.hypot(innerWidth, innerHeight);
      const m = k > 0 ? `radial-gradient(circle at 50% 36%, transparent ${R}px, #000 ${R + 2}px)` : "none";
      intro.style.webkitMaskImage = m; intro.style.maskImage = m;
      site.style.transform = `scale(${lerp(1.22, 1, k)})`;
      site.style.filter = `brightness(${lerp(0.5, 1, k)})`;
    },

    vial(t, dt) {
      plate.style.opacity = Math.min(seg(t, 0, 0.6), 1 - 0.6 * seg(t, 3.4, 4.6));
      Object.assign(hx.state, { shape: SHAPES.mark, spawn: 9, bonds: 8, ring: 1, letters: 0, zoom: 0.9, cy: 0.38, yaw: Math.sin(t) * 0.3, pitch: 0, dustAlpha: 0.5 });
      canvas.style.opacity = plateOk ? 0 : seg(t, 0.5, 1.5) * (1 - seg(t, 3.2, 3.8));
      hx.render(dt);
      hud.style.opacity = Math.min(seg(t, 0.3, 0.8), 1 - seg(t, 3.0, 3.4));
      counter.textContent = "LOT P-0420 · SEALED";
      mark.parentNode.style.opacity = seg(t, 3.4, 3.7);
      mark.style.strokeDashoffset = markLen * (1 - ease.inOut(seg(t, 3.5, 4.8)));
      rise(t, 4.0);
      tag.style.opacity = seg(t, 5.0, 5.5);
      scan.style.opacity = Math.sin(Math.PI * seg(t, 5.5, 6.3));
      scan.style.transform = `translateY(${lerp(-40, 40, seg(t, 5.5, 6.3))}vh)`;
      const k = ease.inOutQuart(seg(t, 6.4, TOTAL)); // letterbox split
      const g = k * 52;
      const m = k > 0 ? `linear-gradient(to bottom, #000 ${50 - g}%, transparent ${50 - g}%, transparent ${50 + g}%, #000 ${50 + g}%)` : "none";
      intro.style.webkitMaskImage = m; intro.style.maskImage = m;
      site.style.transform = `scale(${lerp(1.08, 1, k)})`;
      site.style.filter = `brightness(${lerp(0.45, 1, k)})`;
    },
  };

  if (mode !== "synthesis") { site.style.transformOrigin = "50% 36%"; site.style.transform = "scale(1.2)"; }

  let start = null, last = 0, raf;
  function frame(now) {
    if (finished) return;
    if (start === null) start = now;
    const t = (now - start) / 1000;
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    SCENES[mode](t, dt);
    if (t >= TOTAL) { finish(); return; }
    raf = requestAnimationFrame(frame);
  }

  function skip() {
    if (finished) return;
    cancelAnimationFrame(raf);
    site.style.transform = ""; stage.style.transform = ""; site.style.filter = "";
    intro.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 380, easing: "ease-out" }).onfinish = finish;
  }
  intro.querySelector(".skip").addEventListener("click", skip);
  addEventListener("keydown", e => { if (!finished && ["Escape", "Enter", " "].includes(e.key)) { e.preventDefault(); skip(); } });

  const fontsReady = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]) : Promise.resolve();
  fontsReady.then(() => {
    const p = plate.play(); if (p) p.catch(() => {});
    raf = requestAnimationFrame(frame);
  });
})();
