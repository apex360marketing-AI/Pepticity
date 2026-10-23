/* Pepticity site motion + funnel logic. Lenis drives one GSAP ticker; everything else hangs off it. */
(function () {
  const { Helix, SHAPES, mix, ease, clamp } = window.PepHelix;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
  };

  // ---------- larger-text toggle (seniors) — works before the intro ends ----------
  const a11y = document.querySelector(".a11y-toggle");
  function setLarge(on) {
    document.documentElement.dataset.text = on ? "large" : "";
    a11y.setAttribute("aria-pressed", on ? "true" : "false");
    store.set("pep-large", on ? "1" : "0");
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }
  setLarge(store.get("pep-large") === "1");
  a11y.addEventListener("click", () => setLarge(a11y.getAttribute("aria-pressed") !== "true"));

  function boot() {
    gsap.registerPlugin(ScrollTrigger, SplitText);

    // ---------- smooth scroll on the GSAP ticker ----------
    let lenis = null;
    if (!reduce) {
      lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis ? lenis.scrollTo(el, { offset: -70 }) : el.scrollIntoView();
    }));

    // ---------- hero helix: the intro's P mark keeps living here ----------
    const heroCanvas = document.querySelector(".hero-canvas");
    const hero = new Helix(heroCanvas, { scale: 0.16, dust: 90 });
    Object.assign(hero.state, { shape: SHAPES.mark, spawn: 9, bonds: 8, ring: 1, letters: 0, cx: 0.55, cy: 0.5 });
    let heroMorph = 0, px = 0, py = 0;
    if (!reduce) {
      ScrollTrigger.create({ trigger: ".hero", start: "top top", end: "bottom top", scrub: 1,
        onUpdate: s => { heroMorph = s.progress; } });
      if (fine) addEventListener("pointermove", e => { px = e.clientX / innerWidth - 0.5; py = e.clientY / innerHeight - 0.5; });
    }
    let heroVisible = true;
    new IntersectionObserver(([en]) => { heroVisible = en.isIntersecting; }).observe(heroCanvas);
    gsap.ticker.add((time, dt) => {
      if (!heroVisible) return;
      const S = hero.state;
      S.shape = mix(SHAPES.mark, SHAPES.helix, ease.inOut(clamp(heroMorph * 1.6)));
      S.ring = 1 - clamp(heroMorph * 4);
      // no endless spin: the mark breathes and leans toward the pointer like a receptor docking
      S.yaw = (reduce ? 0 : Math.sin(time * 0.4) * 0.22) + px * 0.7 + heroMorph * Math.PI * 2;
      S.pitch = 0.1 + py * 0.3;
      S.sidechains = clamp(heroMorph * 2);
      hero.render(dt / 1000);
    });

    // ---------- split-line headline reveals ----------
    document.fonts.ready.then(() => {
      document.querySelectorAll(".split").forEach(el => {
        if (reduce) return;
        const split = SplitText.create(el, { type: "lines,words", mask: "lines", linesClass: "line-mask" });
        gsap.from(split.words, {
          yPercent: 110, filter: "blur(8px)", duration: 1.1, ease: "expo.out", stagger: 0.05,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });
      ScrollTrigger.refresh();
    });

    const mm = gsap.matchMedia();

    // ---------- pinned how-it-works: four acts, canvas + chromatogram choreography ----------
    const pc = document.querySelector(".protocol-canvas");
    const ph = new Helix(pc, { scale: 0.17, dust: 60 });
    Object.assign(ph.state, { shape: SHAPES.line, spawn: 9, bonds: 8, letters: 1 });
    const steps = gsap.utils.toArray(".protocol-steps .step");
    const trace = document.querySelector(".chroma .trace");
    const len = trace.getTotalLength();
    gsap.set(trace, { strokeDasharray: len, strokeDashoffset: len });
    let act = 0;
    const renderProtocol = (p) => {
      const S = ph.state;
      // act 1 line → act 2 helix → act 3 helix fades for chromatogram → act 4 mark (the sealed vial)
      if (p < 0.33) S.shape = mix(SHAPES.line, SHAPES.helix, ease.inOut(clamp(p / 0.33)));
      else if (p < 0.75) S.shape = SHAPES.helix;
      else S.shape = mix(SHAPES.helix, SHAPES.mark, ease.inOut(clamp((p - 0.75) / 0.2)));
      S.letters = 1 - clamp(p * 4);
      S.ring = clamp((p - 0.92) / 0.08);
      S.sidechains = clamp((p - 0.2) * 4) * (1 - clamp((p - 0.7) * 5));
      S.yaw = p * Math.PI * 3;
      S.dustAlpha = 0.5;
      pc.style.opacity = p > 0.5 && p < 0.75 ? 0.25 : 1;
      ph.render(1 / 60);
    };
    renderProtocol(0);
    mm.add({ desktop: "(min-width: 901px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      const { desktop, reduce: rm } = ctx.conditions;
      if (!desktop || rm) { gsap.set(".chroma", { opacity: 1 }); gsap.set(trace, { strokeDashoffset: 0 }); return; }
      const tl = gsap.timeline({ scrollTrigger: { trigger: ".protocol", start: "top top", end: "+=300%", pin: ".pin-wrap", scrub: 1,
        onUpdate: s => renderProtocol(s.progress) } });
      steps.forEach((st, i) => {
        if (i === 0) return;
        tl.to(steps[i - 1], { opacity: 0, y: -30, duration: 0.4 }, i)
          .fromTo(st, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4 }, i + 0.2);
      });
      tl.to(".progress span", { scaleX: 1, ease: "none", duration: steps.length }, 0)
        .to(".chroma", { opacity: 1, duration: 0.3 }, 1.9)
        .to(trace, { strokeDashoffset: 0, ease: "none", duration: 0.8 }, 2.0)
        .to(".chroma", { opacity: 0, duration: 0.3 }, 2.9);
    });

    // ---------- reveals for cards / tiers / paths ----------
    if (!reduce) {
      ScrollTrigger.batch(".path, .tier, .table-wrap, .lib-card, details, .coa", {
        start: "top 88%",
        onEnter: b => gsap.from(b, { y: 40, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, overwrite: true }),
        once: true,
      });
    }

    // ---------- counters ----------
    document.querySelectorAll(".count").forEach(el => {
      const to = +el.dataset.to, suf = el.dataset.suffix || "";
      const o = { v: 0 };
      ScrollTrigger.create({ trigger: el, start: "top 90%", once: true,
        onEnter: () => gsap.to(o, { v: to, duration: 1.6, ease: "power2.out", onUpdate: () => { el.textContent = Math.round(o.v) + suf; } }) });
    });

    // ---------- 3D tilt + glare on audience paths ----------
    if (fine && !reduce) {
      document.querySelectorAll(".tilt").forEach(card => {
        const glare = document.createElement("span"); glare.className = "glare"; card.appendChild(glare);
        const rx = gsap.quickTo(card, "rotateX", { duration: 0.5, ease: "power3" });
        const ry = gsap.quickTo(card, "rotateY", { duration: 0.5, ease: "power3" });
        gsap.set(card, { transformPerspective: 900 });
        card.addEventListener("pointermove", e => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          rx((0.5 - y) * 12); ry((x - 0.5) * 14);
          card.style.setProperty("--gx", x * 100 + "%"); card.style.setProperty("--gy", y * 100 + "%");
        });
        card.addEventListener("pointerleave", () => { rx(0); ry(0); });
      });
    }
    ScrollTrigger.refresh();
  }

  // ---------- quiz funnel ----------
  const quiz = document.querySelector(".quiz-card");
  const qs = [...quiz.querySelectorAll(".q")];
  const answers = {};
  const PATHS = {
    longevity: ["Healthy-aging path", "A clinician will review your goals with your current medications in mind, so nothing in your plan works against what you already take."],
    energy: ["Energy & vitality path", "Your clinician starts with the basics, including labs where needed, before any plan is discussed."],
    recovery: ["Training & recovery path", "Your plan is reviewed by a clinician who works with active patients. It's prepared by a licensed pharmacy, not the grey market."],
    women: ["Women's health path", "You're matched with a clinician experienced in women's health at midlife. Bring every question; nothing is rushed."],
    men: ["Men's health path", "You start by knowing your numbers: your clinician reviews labs before anything is prescribed."],
    skin: ["Skin & hair path", "Start with our cosmetic peptide skincare. No consult is needed, and you can add a clinician plan later."],
  };
  const back = quiz.querySelector(".quiz-back");
  let cur = 0;
  function show(i, focus = true) {
    cur = i;
    qs.forEach((q, k) => q.classList.toggle("is-active", k === i));
    back.hidden = i === 0 || i === qs.length - 1;
    if (focus) { const h = qs[i].querySelector("legend, h3"); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
    if (qs[i].dataset.q === "result") renderNext();
    const total = qs.length - 1;
    quiz.querySelector(".quiz-count").textContent = i < total ? `${i + 1} / ${total}` : "Done";
    quiz.querySelector(".quiz-bar span").style.width = Math.min(100, ((i + 1) / total) * 100) + "%";
  }
  back.addEventListener("click", () => show(Math.max(0, cur - 1)));
  function renderNext() {
    const d = n => { const x = new Date(); x.setDate(x.getDate() + n); return x.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }); };
    const steps = [[0, "Your answers reach a licensed clinician"], [1, answers.contact === "phone" ? "A clinician calls you" : answers.contact === "chat" ? "Your clinician messages you" : "Your video consult"], [3, "If a plan fits, your pharmacy prepares it"], [5, "It ships to your door in a cold pack"]];
    quiz.querySelector(".next-steps").innerHTML = steps.map(([n, t]) => `<li><span>${n ? "By " + d(n) : "Today"}</span>${t}</li>`).join("") + '<li class="sample">Sample timeline. Confirm turnaround times with Grace.</li>';
  }
  const region = document.getElementById("region");
  qs.forEach((q, i) => q.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => {
    if (btn.dataset.v === "next") { if (!region.value) { region.focus(); return; } answers.region = region.value; show(i + 1); return; }
    q.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b === btn ? "true" : "false"));
    answers[q.dataset.q] = btn.dataset.v;
    if (q.dataset.q === "goal") {
      const [t, c] = PATHS[btn.dataset.v];
      quiz.querySelector(".result-title").textContent = t;
      quiz.querySelector(".result-copy").textContent = c + " Enter your email to get your path and your free clinician review.";
    }
    show(i + 1);
  })));
  // audience cards pre-answer the goal so the quiz feels personal
  const map = { longevity: "longevity", women: "women", energy: "energy", men: "men", athlete: "recovery" };
  document.querySelectorAll(".path").forEach(p => p.addEventListener("click", () => {
    const v = map[p.dataset.path];
    const b = qs[0].querySelector(`[data-v="${v}"]`);
    if (b) b.click();
  }));
  show(0, false);

  document.querySelectorAll("form.quiz-result, form.lead-form").forEach(f => f.addEventListener("submit", e => {
    e.preventDefault();
    const note = f.parentElement.querySelector(".fine, .lead-note");
    f.innerHTML = '<p class="mono" role="status">Thanks. (Preview only: nothing was sent. Connect a CRM to go live.)</p>';
    if (note) note.remove();
    store.sset("pep-lead", "1");
  }));

  // ---------- lot lookup (sample data) ----------
  const LOTS = {
    "P-0420": { name: "Sample peptide A", purity: "99.4%", mass: "390.4 / 390.3", date: "2026-09-18", peak: 0.56 },
    "P-0388": { name: "Sample peptide B", purity: "99.1%", mass: "1419.6 / 1419.5", date: "2026-08-30", peak: 0.48 },
    "P-0412": { name: "Sample peptide C", purity: "99.2%", mass: "340.4 / 340.4", date: "2026-09-02", peak: 0.4 },
  };
  const form = document.querySelector(".lot-form"), input = document.getElementById("lot");
  const coa = document.querySelector(".coa");
  function chroma(peak) {
    const W = 400, H = 140, base = 128, px = peak * W;
    let d = `M0 ${base}`;
    for (let x = 4; x <= W; x += 4) {
      const main = Math.exp(-Math.pow((x - px) / 7, 2)) * 112;
      const imp = Math.exp(-Math.pow((x - px - 60) / 5, 2)) * 6 + Math.exp(-Math.pow((x - 70) / 6, 2)) * 4;
      d += ` L${x} ${(base - main - imp - Math.sin(x * 0.7) * 0.6).toFixed(1)}`;
    }
    return d;
  }
  function lookup(code) {
    code = code.trim().toUpperCase();
    const lot = LOTS[code];
    coa.querySelector(".coa-empty").hidden = !!lot;
    coa.querySelector(".coa-body").hidden = !lot;
    if (!lot) { coa.querySelector(".coa-empty").textContent = `No sample lot "${code}". Try P-0420, P-0388 or P-0412.`; return; }
    coa.querySelector(".coa-id").textContent = `LOT ${code} · SAMPLE`;
    coa.querySelector(".coa-name").textContent = lot.name;
    coa.querySelector(".coa-purity").textContent = lot.purity;
    coa.querySelector(".coa-mass").textContent = lot.mass;
    coa.querySelector(".coa-date").textContent = lot.date;
    const path = coa.querySelector(".coa-trace");
    path.setAttribute("d", chroma(lot.peak));
    const L = path.getTotalLength();
    path.style.strokeDasharray = L; path.style.strokeDashoffset = reduce ? 0 : L;
    if (!reduce) requestAnimationFrame(() => { path.style.transition = "stroke-dashoffset 1.4s cubic-bezier(.65,0,.35,1)"; path.style.strokeDashoffset = 0; });
  }
  form.addEventListener("submit", e => { e.preventDefault(); lookup(input.value); });
  document.querySelectorAll(".chip[data-lot]").forEach(c => c.addEventListener("click", () => { input.value = c.dataset.lot; lookup(c.dataset.lot); }));

  // ---------- itemised receipt prints line by line ----------
  const receipt = document.querySelector(".receipt");
  if (receipt && !reduce) {
    receipt.querySelectorAll("li").forEach((li, i) => li.style.setProperty("--i", i));
    receipt.classList.add("printing");
    new IntersectionObserver(([en], ob) => { if (en.isIntersecting) { receipt.classList.add("printed"); ob.disconnect(); } }, { threshold: 0.4 }).observe(receipt);
  }

  // ---------- seller red-flag checker ----------
  const rf = document.querySelector(".rf");
  if (rf) rf.addEventListener("change", () => {
    const vals = [...new FormData(rf).values()].map(Number);
    const out = rf.querySelector(".rf-verdict");
    rf.querySelector(".rf-score").textContent = `${vals.length} / 6 answered`;
    if (vals.length < 6) return;
    const flags = vals.filter(v => v === 0).length;
    out.classList.toggle("bad", flags > 0);
    out.textContent = flags === 0 ? "No red flags. That's the standard every seller should meet."
      : `${flags} red flag${flags > 1 ? "s" : ""}. We'd ask more questions before buying, or take the 60-second assessment instead.`;
  });

  // ---------- concierge (scripted, guard-railed: no medical or dosing answers) ----------
  const cBtn = document.querySelector(".concierge-btn"), cPanel = document.getElementById("concierge"), log = cPanel.querySelector(".c-log");
  const REPLIES = {
    how: "Take the 60-second assessment, and a licensed clinician reviews it. If a plan fits, a licensed pharmacy prepares it and an independent lab tests every lot. It ships to your door in a cold pack.",
    cost: "The assessment and the clinician review are free. Membership is $[xx]/month, and you see the full price before you pay. There are no hidden fees, and you can cancel in two clicks.",
    lab: "Every lot is tested by an independent lab for identity (mass spec), purity (HPLC) and contaminants. Type a lot code into the Verify section to see a sample certificate.",
    human: "You can reach a person at [phone number], Monday to Saturday. Pick “phone call” in the assessment and we'll call you.",
  };
  function toggle(open) { cPanel.hidden = !open; cBtn.setAttribute("aria-expanded", open); }
  cBtn.addEventListener("click", () => toggle(cPanel.hidden));
  cPanel.querySelector(".c-close").addEventListener("click", () => toggle(false));
  cPanel.querySelectorAll("[data-a]").forEach(b => b.addEventListener("click", () => {
    const me = document.createElement("p"); me.className = "c-msg me"; me.textContent = b.textContent; log.appendChild(me);
    setTimeout(() => { const bot = document.createElement("p"); bot.className = "c-msg bot"; bot.textContent = REPLIES[b.dataset.a]; log.appendChild(bot); log.scrollTop = log.scrollHeight; }, 380);
  }));
  addEventListener("keydown", e => { if (e.key === "Escape" && !cPanel.hidden) toggle(false); });

  // ---------- exit intent: once per session, desktop, only if no lead yet ----------
  const exit = document.querySelector("dialog.exit");
  exit.querySelector(".x-close").addEventListener("click", () => exit.close());
  if (fine) document.addEventListener("mouseout", e => {
    if (e.relatedTarget || e.clientY > 8 || store.sget("pep-exit") || store.sget("pep-lead") || document.documentElement.classList.contains("intro-lock")) return;
    store.sset("pep-exit", "1");
    if (typeof exit.showModal === "function") exit.showModal();
  });

  if (window.gsap) {
    if (document.getElementById("intro")) addEventListener("pep:ready", boot, { once: true });
    else boot();
  }
})();
