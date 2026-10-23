/* Pepticity Prime intro (~8s): a horizon draws, dawn rises behind it, the wordmark settles,
   then the horizon lifts like a curtain and the sky becomes the page. Canvas carries the scene;
   media/intro.mp4 is an optional soft-light plate. */
(function () {
  const KEY = "prime-intro-seen";
  const ss = {
    get() { try { return sessionStorage.getItem(KEY); } catch (e) { return null; } },
    set() { try { sessionStorage.setItem(KEY, "1"); } catch (e) {} },
  };
  const root = document.documentElement;
  const intro = document.getElementById("intro");
  const line = document.querySelector(".horizon-line");
  const canvas = intro.querySelector(".intro-canvas");
  const ctx = canvas.getContext("2d");
  const video = intro.querySelector(".intro-plate");
  const word = intro.querySelectorAll(".intro-word span, .intro-word em");
  const tag = intro.querySelector(".intro-tag");
  const mark = intro.querySelector(".intro-mark");
  const skipBtn = intro.querySelector(".intro-skip");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 0, H = 0, dpr = 1, running = false, tl = null, finishing = false;
  const S = { p: 0, sea: 1, lineY: 0.62, plate: 0, t: 0 };

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = innerWidth; H = innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const smooth = t => { t = clamp(t); return t * t * (3 - 2 * t); };
  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mixc = (a, b, t) => { const A = hex(a), B = hex(b); return `rgb(${Math.round(lerp(A[0], B[0], t))},${Math.round(lerp(A[1], B[1], t))},${Math.round(lerp(A[2], B[2], t))})`; };

  function draw() {
    const p = S.p, hy = S.lineY * H;
    ctx.clearRect(0, 0, W, H);
    // sky: night-warm to chalk
    const sky = ctx.createLinearGradient(0, 0, 0, hy);
    sky.addColorStop(0, mixc("#241F22", "#F2F1EE", smooth(p)));
    sky.addColorStop(0.55, mixc("#33282C", "#EFE9E5", smooth(p * 1.05)));
    sky.addColorStop(1, mixc("#4A2C33", "#EBD3D4", smooth(p * 1.1)));
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, hy + 1);
    // dawn glow: oxblood -> rose -> stone, swelling then easing to a soft blush
    const sunY = hy + H * 0.06 - smooth(p) * H * 0.14;
    const gA = smooth(p * 1.4) * (1 - 0.72 * smooth((p - 0.5) / 0.5));
    const R = Math.max(W, H) * (0.22 + 0.55 * smooth(p));
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, hy); ctx.clip();
    const g = ctx.createRadialGradient(W * 0.5, sunY, 0, W * 0.5, sunY, R);
    g.addColorStop(0, `rgba(255,244,240,${0.95 * gA})`);
    g.addColorStop(0.08, `rgba(232,180,186,${0.9 * gA})`);
    g.addColorStop(0.25, `rgba(164,73,90,${0.65 * gA})`);
    g.addColorStop(0.5, `rgba(110,20,35,${0.28 * gA * (1 - p * 0.6)})`);
    g.addColorStop(0.75, `rgba(217,214,208,${0.25 * gA})`);
    g.addColorStop(1, "rgba(217,214,208,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, hy);
    // sun disc, half risen
    const sr = Math.min(W, H) * 0.045;
    const sg = ctx.createRadialGradient(W * 0.5, sunY, 0, W * 0.5, sunY, sr * 1.6);
    const sa = smooth(p * 1.6) * (1 - 0.5 * smooth((p - 0.6) / 0.4));
    sg.addColorStop(0, `rgba(255,250,248,${0.95 * sa})`); sg.addColorStop(0.55, `rgba(255,240,238,${0.85 * sa})`); sg.addColorStop(1, "rgba(255,240,238,0)");
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(W * 0.5, sunY, sr * 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // sea + reflection, fades away for the lift
    if (S.sea > 0.001) {
      ctx.globalAlpha = S.sea;
      const sea = ctx.createLinearGradient(0, hy, 0, H);
      sea.addColorStop(0, mixc("#2A2124", "#6B5357", smooth(p)));
      sea.addColorStop(1, mixc("#161315", "#3E3336", smooth(p)));
      ctx.fillStyle = sea; ctx.fillRect(0, hy, W, H - hy);
      const rows = 44, t = S.t;
      for (let i = 0; i < rows; i++) {
        const k = i / rows, y = hy + 3 + Math.pow(k, 1.6) * (H - hy);
        const half = (0.04 + 0.22 * k) * W * (0.4 + 0.6 * smooth(p));
        const off = Math.sin(t * 0.6 + i * 1.7) * W * 0.012 * (0.3 + k);
        const a = (1 - k) * 0.55 * smooth(p * 1.5);
        ctx.fillStyle = `rgba(236,190,196,${a})`;
        ctx.fillRect(W * 0.5 - half + off, y, half * 2 * (0.55 + 0.45 * Math.sin(i * 2.3 + t * 0.4) ** 2), 1.2 + k * 2);
      }
      ctx.globalAlpha = 1;
    }
  }
  function tick() { if (!running) return; S.t += gsap.ticker.deltaRatio() / 60; draw(); }

  function hdrH() { const h = document.querySelector(".hdr"); return h ? h.getBoundingClientRect().height : 120; }

  function cleanup() {
    running = false; gsap.ticker.remove(tick);
    root.classList.remove("intro-on", "intro-lifting");
    intro.style.clipPath = ""; line.style.opacity = "";
    try { video.pause(); } catch (e) {}
    ss.set();
    document.dispatchEvent(new CustomEvent("prime:introdone"));
  }
  function skip() {
    if (!running || finishing) return;
    finishing = true; if (tl) tl.kill();
    gsap.to([intro, line], { opacity: 0, duration: 0.6, ease: "power1.out", onComplete: () => { intro.style.opacity = ""; line.style.opacity = ""; cleanup(); } });
  }

  function play() {
    if (running) return;
    finishing = false; running = true;
    root.classList.add("intro-on");
    window.scrollTo(0, 0);
    size();
    Object.assign(S, { p: 0, sea: 1, lineY: W < 700 ? 0.6 : 0.62, plate: 0, t: 0 });
    gsap.set(intro, { opacity: 1, clipPath: "inset(0px 0px 0px 0px)" });
    gsap.set(word, { opacity: 0, filter: "blur(14px)", y: 18 });
    gsap.set(tag, { opacity: 0, y: 8 });
    gsap.set(mark, { y: 0, opacity: 1 });
    gsap.set(line, { top: S.lineY * H, scaleX: 0, opacity: 1, backgroundColor: "#E9DCD8" });
    // optional film plate
    if (!video.getAttribute("src") && video.dataset.src) {
      video.addEventListener("canplay", () => { video.classList.add("on"); video.play().catch(() => {}); }, { once: true });
      video.addEventListener("error", () => video.remove(), { once: true });
      video.src = video.dataset.src;
    } else if (video.classList.contains("on")) { video.currentTime = 0; video.play().catch(() => {}); }
    gsap.ticker.add(tick);
    skipBtn.focus({ preventScroll: true });

    const tgtTop = () => hdrH() - 1;
    tl = gsap.timeline({ onComplete: cleanup });
    tl.to(line, { scaleX: 1, duration: 1.7, ease: "power2.inOut" }, 0.3)
      .to(S, { p: 1, duration: 4.4, ease: "sine.inOut" }, 1.0)
      .to(line, { backgroundColor: "#232224", duration: 2.4, ease: "none" }, 2.6)
      .to(word, { opacity: 1, filter: "blur(0px)", y: 0, duration: 1.8, ease: "power2.out", stagger: 0.35 }, 2.7)
      .to(tag, { opacity: 1, y: 0, duration: 1.2, ease: "power1.out" }, 4.3)
      // curtain: sea dissolves, then the horizon lifts to become the header's lower edge
      .add(() => root.classList.add("intro-lifting"), 5.6)
      .to(S, { sea: 0, duration: 0.9, ease: "power1.inOut" }, 5.6)
      .to(video, { opacity: 0, duration: 0.9 }, 5.6)
      .add(() => {
        const startY = S.lineY * H, endY = tgtTop();
        const o = { y: startY };
        intro.style.clipPath = `inset(0px 0px ${H - startY}px 0px)`;
        gsap.to(o, { y: endY, duration: 1.8, ease: "power2.inOut", onUpdate: () => {
          intro.style.clipPath = `inset(0px 0px ${Math.max(0, H - o.y)}px 0px)`;
          line.style.top = o.y + "px";
        } });
        root.classList.remove("intro-on");          // header + page live beneath the curtain
        document.documentElement.style.overflow = "hidden";
      }, 6.5)
      .to(mark, { y: () => -H * 0.18, opacity: 0, duration: 1.4, ease: "power2.in" }, 6.6)
      .to(line, { opacity: 0, duration: 0.5 }, 8.3)
      .add(() => { document.documentElement.style.overflow = ""; }, 8.4);
  }

  skipBtn.addEventListener("click", skip);
  addEventListener("keydown", e => {
    if (!running) return;
    if (e.key === "Escape" || e.key === "Enter" || e.key === " ") { e.preventDefault(); skip(); }
  });
  addEventListener("resize", () => { if (running) size(); });

  window.PrimeIntro = {
    play() { if (reduced) { document.dispatchEvent(new CustomEvent("prime:introdone")); return; } play(); },
    get running() { return running; },
    shouldPlay() { return !reduced && !ss.get(); },
  };
})();
