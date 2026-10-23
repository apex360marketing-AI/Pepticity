/* Pepticity Performance intro (~8 s): telemetry boot → wordmark slam + stretch → venetian shutters.
   Grid floor on canvas carries the scene; media/intro.mp4 (stadium lights) is an optional plate. */
(function () {
  const root = document.documentElement;
  const intro = document.getElementById("intro");
  const ui = intro.querySelector(".i-ui");
  const video = intro.querySelector(".i-plate");
  const gridCanvas = intro.querySelector(".i-grid");
  const wm = intro.querySelector(".i-wm");
  const GLYPH = "0123456789ABCDEF/#:+-=";
  let grid = null, tl = null, running = false, done = null, t0 = 0;

  video.addEventListener("canplay", () => { video.classList.add("ok"); const p = video.play(); if (p) p.catch(() => {}); }, { once: false });
  video.addEventListener("error", () => video.classList.remove("ok"));

  function scramble(el, dur) {
    const final = el.dataset.t;
    const o = { p: 0 };
    return gsap.to(o, { p: 1, duration: dur, ease: "none", onUpdate() {
      const n = Math.floor(o.p * final.length);
      let s = final.slice(0, n);
      for (let i = n; i < final.length; i++) s += final[i] === " " ? " " : GLYPH[(Math.random() * GLYPH.length) | 0];
      el.textContent = s;
    }, onComplete() { el.textContent = final; } });
  }

  function tick(time, dt) {
    if (!running) return;
    grid.render(dt / 1000);
    const f = Math.floor((performance.now() - t0) / 40);
    const tc = intro.querySelector(".i-tc");
    const pad = v => String(v).padStart(2, "0");
    tc.textContent = `00:00:${pad(Math.floor(f / 25) % 60)}:${pad(f % 25)}`;
  }

  function onKey(e) {
    if (!running) return;
    if (e.key === "Escape" || e.key === "Enter" || e.key === " ") { e.preventDefault(); finish(true); }
  }

  function reset() {
    gsap.set([ui, wm, intro.querySelector(".i-sub"), intro.querySelector(".i-tag"), intro.querySelectorAll(".corner"), intro.querySelector(".i-top"), intro.querySelector(".i-read"), intro.querySelector(".i-right")], { clearProps: "all" });
    intro.querySelectorAll("[data-t]").forEach(el => { el.innerHTML = "&nbsp;"; });
  }

  function play(onDone) {
    done = onDone;
    reset();
    root.classList.add("intro-play", "intro-lock");
    running = true; t0 = performance.now();
    if (!grid) grid = new PPGrid(gridCanvas, { cols: 16 });
    grid.resize();
    Object.assign(grid.s, { reveal: 0, horizon: 0.95, speed: 1.6, alpha: 1, lane: 0, flash: 0 });
    if (video.getAttribute("src") && video.readyState >= 2) { video.currentTime = 0; video.play().catch(() => {}); }
    gsap.ticker.add(tick);
    addEventListener("keydown", onKey);

    const S = grid.s;
    const sub = intro.querySelector(".i-sub"), tag = intro.querySelector(".i-tag");
    const scan = intro.querySelector(".i-scan");
    tl = gsap.timeline();
    tl.from(intro.querySelectorAll(".corner"), { opacity: 0, scale: 1.6, duration: 0.6, stagger: 0.05, ease: "power3.out" }, 0)
      .from(intro.querySelector(".i-top"), { opacity: 0, y: -10, duration: 0.5 }, 0.2)
      .to(S, { reveal: 1, duration: 2.0, ease: "power2.out" }, 0.2)
      .to(S, { horizon: 0.6, duration: 2.2, ease: "power3.out" }, 0.2)
      .to(S, { speed: 0.5, duration: 2.6, ease: "power2.out" }, 0.4)
      .from([intro.querySelector(".i-read"), intro.querySelector(".i-right")], { opacity: 0, x: (i) => (i ? 20 : -20), duration: 0.5 }, 1.6)
      .fromTo(scan, { y: 0, opacity: 0 }, { y: () => innerHeight, opacity: 1, duration: 1.2, ease: "power1.inOut" }, 1.9)
      .to(scan, { opacity: 0, duration: 0.2 }, 3.0);
    intro.querySelectorAll(".i-read li").forEach((li, i) => {
      tl.add(scramble(li.querySelector(".rk"), 0.35), 2.15 + i * 0.2).add(scramble(li.querySelector(".rv"), 0.45), 2.3 + i * 0.2);
    });
    // slam (condensed), impact, then stretch via scaleX
    tl.fromTo(wm, { opacity: 0, scaleY: 2.8, scaleX: 0.42 * 2.8, filter: "blur(14px)" },
                  { opacity: 1, scaleY: 1, scaleX: 0.42, filter: "blur(0px)", duration: 0.34, ease: "power4.in" }, 3.3)
      .fromTo(S, { flash: 1 }, { flash: 0, duration: 0.6, ease: "power2.out" }, 3.64)
      .fromTo(ui, { y: 0 }, { keyframes: [{ y: 9, duration: 0.05 }, { y: -6, duration: 0.05 }, { y: 3, duration: 0.05 }, { y: 0, duration: 0.08 }] }, 3.64)
      .to(wm, { scaleX: 1, duration: 1.3, ease: "expo.inOut" }, 3.9)
      .fromTo(sub, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6 }, 4.9)
      .fromTo(tag, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 5.2)
      .to(S, { lane: 1, duration: 1.4, ease: "power2.inOut" }, 4.9)
      .call(() => finish(false), null, 6.85);
  }

  function snapshot(W, H) {
    const c = document.createElement("canvas"), dpr = Math.min(devicePixelRatio || 1, 2);
    c.width = W * dpr; c.height = H * dpr;
    const x = c.getContext("2d");
    x.fillStyle = "#0B0B0C"; x.fillRect(0, 0, c.width, c.height);
    if (video.classList.contains("ok") && video.readyState >= 2) {
      try {
        const vr = video.videoWidth / video.videoHeight, cr = W / H;
        let sw = video.videoWidth, sh = video.videoHeight, sx = 0, sy = 0;
        if (vr > cr) { sw = sh * cr; sx = (video.videoWidth - sw) / 2; } else { sh = sw / cr; sy = (video.videoHeight - sh) / 2; }
        x.globalAlpha = 0.55; x.filter = "grayscale(1) contrast(1.1) brightness(.55)";
        x.drawImage(video, sx, sy, sw, sh, 0, 0, c.width, c.height);
        x.globalAlpha = 1; x.filter = "none";
      } catch (e) {}
    }
    x.drawImage(gridCanvas, 0, 0, c.width, c.height);
    return { c, dpr };
  }

  function finish(skipped) {
    if (!running) return;
    running = false;
    if (tl) tl.kill();
    removeEventListener("keydown", onKey);
    try { sessionStorage.setItem("pp-intro", "1"); } catch (e) {}
    if (skipped) { intro.querySelectorAll("[data-t]").forEach(el => { el.textContent = el.dataset.t; }); gsap.set(wm, { opacity: 1, scaleY: 1, scaleX: 1, filter: "none" }); gsap.set([intro.querySelector(".i-sub"), intro.querySelector(".i-tag")], { opacity: 1, y: 0 }); }
    const W = innerWidth, H = innerHeight;
    const n = W < 700 ? 9 : 12, h = Math.ceil(H / n);
    const { c, dpr } = snapshot(W, H);
    const wrap = document.createElement("div");
    wrap.className = "shutters";
    const slats = [];
    for (let i = 0; i < n; i++) {
      const s = document.createElement("div");
      s.className = "slat";
      s.style.top = i * h + "px"; s.style.height = h + 1 + "px";
      const cv = document.createElement("canvas");
      cv.width = W * dpr; cv.height = (h + 1) * dpr;
      cv.getContext("2d").drawImage(c, 0, i * h * dpr, W * dpr, (h + 1) * dpr, 0, 0, W * dpr, (h + 1) * dpr);
      s.appendChild(cv);
      const clone = ui.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.style.top = -i * h + "px"; clone.style.bottom = "auto"; clone.style.height = H + "px";
      s.appendChild(clone);
      wrap.appendChild(s); slats.push(s);
    }
    document.body.appendChild(wrap);
    gsap.ticker.remove(tick);
    root.classList.remove("intro-play", "intro-lock");
    video.pause();
    if (done) done();
    gsap.timeline({ onComplete: () => wrap.remove() })
      .to(slats, { rotateX: (i) => (i % 2 ? 90 : -90), duration: skipped ? 0.55 : 0.9, ease: "power3.in", transformOrigin: "50% 50%",
        stagger: { each: skipped ? 0.025 : 0.05, from: "start" } }, 0)
      .to(slats, { filter: "brightness(1.8)", duration: 0.3, stagger: { each: skipped ? 0.025 : 0.05 } }, 0.25);
  }

  intro.querySelector(".i-skip").addEventListener("click", () => finish(true));
  window.PPIntro = { play, finish, get running() { return running; } };
})();
