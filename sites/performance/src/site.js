/* Pepticity Performance: router, HUD, MODE SELECT personalisation, scroll choreography, funnel. */
(function () {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };
  gsap.registerPlugin(ScrollTrigger, SplitText);

  /* ------------------------------------------------------------ data */
  const MARKERS = {
    tt:  ["Total testosterone", "Total amount of testosterone in your blood", "18%", "46%", "52%"],
    ft:  ["Free testosterone", "The part not bound to proteins", "22%", "40%", "47%"],
    e2:  ["Estradiol", "The main form of estrogen", "14%", "50%", "38%"],
    igf: ["IGF-1", "A growth-factor hormone made mostly in the liver", "26%", "44%", "55%"],
    a1c: ["HbA1c", "Average blood sugar over about three months", "8%", "48%", "30%"],
    lip: ["Lipid panel", "Cholesterol and triglycerides", "12%", "52%", "41%"],
    vd:  ["Vitamin D (25-OH)", "The stored form of vitamin D", "30%", "45%", "36%"],
    fer: ["Ferritin", "Your body's iron stores", "16%", "56%", "44%"],
    tsh: ["TSH", "A hormone that signals your thyroid", "20%", "42%", "49%"],
    cbc: ["Complete blood count", "Red cells, white cells, platelets", "24%", "46%", "58%"],
    cmp: ["Metabolic panel", "Kidney, liver, electrolytes, glucose", "18%", "50%", "45%"],
  };
  const MODES = {
    all: { code: "M0", label: "ALL MODES", short: "All", hl: "perform at every age.", img: "media/perf-nightrun.jpg", cta: "Get my labs",
      note: "Choose a mode above to see the markers a clinician commonly looks at for you.", markers: [],
      order: ["plan", "compare", "clinician", "pricelock"], who: "who works with people like you.",
      q1: ["What brings you here?", [["aging", "Aging well", "Healthy aging, 55+"], ["energy", "Energy", "Not feeling like myself"], ["women", "Women 40+", "Midlife changes"], ["men", "Men 35+", "Know where I stand"], ["training", "Training", "Gym, sport, recovery"]]] },
    aging: { code: "M1", label: "AGING WELL", short: "Aging well", hl: "keep up with my life.", img: "media/aud-longevity.jpg", cta: "Book my blood test",
      note: "Markers a clinician commonly reviews for healthy aging, 55+.", markers: ["a1c", "lip", "vd", "cmp", "cbc", "tsh"],
      order: ["clinician", "plan", "compare", "pricelock"], who: "who takes time to explain.",
      q1: ["What would you most like help with?", [["blood", "Understanding my blood work"], ["family", "Keeping up with family and hobbies"], ["plain", "A clinician who explains things plainly"], ["phone", "Doing everything by phone"]]],
      path: ["Healthy-aging labs + review", "A broad panel and an unhurried clinician review. Every step can be done by phone."] },
    energy: { code: "M2", label: "ENERGY", short: "Energy", hl: "feel like myself again.", img: "media/aud-energy.jpg", cta: "Check my labs",
      note: "Markers a clinician commonly reviews when someone says they don't feel like themselves.", markers: ["fer", "tsh", "vd", "cbc", "a1c", "cmp"],
      order: ["plan", "clinician", "compare", "pricelock"], who: "who looks at the whole picture.",
      q1: ["Which sounds most like you?", [["tired", "I'm tired more often than I used to be"], ["sleep", "My sleep feels off"], ["notme", "I just don't feel like myself"], ["answers", "I want answers, not guesses"]]],
      path: ["Energy check: labs first", "Common markers such as iron stores, thyroid and vitamin D, reviewed by a clinician who listens first."] },
    women: { code: "M3", label: "WOMEN 40+", short: "Women 40+", hl: "understand what's changing.", img: "media/aud-women.jpg", cta: "Get my women's panel",
      note: "Markers a clinician commonly reviews for women in midlife.", markers: ["e2", "tsh", "fer", "vd", "lip", "a1c"],
      order: ["clinician", "plan", "compare", "pricelock"], who: "who focuses on midlife.",
      q1: ["What's on your mind?", [["cycle", "Changes in my cycle or midlife"], ["mood", "Sleep and mood feel different"], ["strong", "Staying strong and active"], ["hormones", "Understanding my hormones"]]],
      path: ["Women 40+ panel + consult", "A panel chosen for women in midlife, reviewed with a clinician who focuses on this stage of life."] },
    men: { code: "M4", label: "MEN 35+", short: "Men 35+", hl: "know my numbers.", img: "media/aud-men.jpg", cta: "Know my numbers",
      note: "Markers a clinician commonly reviews for men 35 and over.", markers: ["tt", "ft", "e2", "lip", "a1c", "cbc"],
      order: ["plan", "compare", "clinician", "pricelock"], who: "who talks straight.",
      q1: ["What do you want to know first?", [["hormones", "Where my hormones stand"], ["heart", "My heart and metabolic markers"], ["thirty", "Why I feel different than at 30"], ["right", "Whether a plan is even right for me"]]],
      path: ["Men 35+ panel + consult", "Testosterone, lipids, blood sugar and blood count, reviewed with a clinician before anything is discussed."] },
    training: { code: "M5", label: "TRAINING", short: "Training", hl: "train for the long game.", img: "media/aud-athlete.jpg", cta: "Get my labs",
      note: "Markers a clinician commonly reviews for people who train hard.", markers: ["tt", "ft", "igf", "fer", "vd", "cbc", "cmp"],
      order: ["compare", "plan", "clinician", "pricelock"], who: "who works with athletes.",
      q1: ["How do you train?", [["strength", "Strength and lifting"], ["endurance", "Endurance"], ["sport", "Combat or field sport"], ["mixed", "Mixed / general fitness"]]],
      path: ["Recovery program path", "Labs first, then a clinician who works with training adults reviews your results and recovery habits. Competing in a tested sport? Check your sport's rules."] },
  };
  const TILES = [
    ["perf-sprinter", "Sprint", "Sprinter on a track at night"], ["aud-longevity", "Trail", "Silver-haired man walking a coastal trail"],
    ["perf-boxer", "Box", "Boxer training in a dark gym"], ["aud-women", "Morning", "Woman in her fifties by a window"],
    ["perf-deadlift", "Lift", "Female athlete lifting a barbell"], ["prime-swim", "Swim", "Older swimmer in open water"],
    ["perf-plunge", "Cold", "Man in his forties in a cold plunge"], ["aud-energy", "Wake", "Woman stretching in bed in the morning"],
    ["perf-nightrun", "Night run", "Runner on a city street at night"], ["prime-hiking", "Hike", "Couple hiking on a ridge"],
    ["perf-rower", "Row", "Rower on still water"], ["perf-climber", "Climb", "Climber on a rock face"], ["perf-mobility", "Mobility", "Woman doing a mobility stretch"],
  ];

  /* ------------------------------------------------------------ text size */
  const ts = $(".textsize");
  const setText = (on) => {
    if (on) root.dataset.text = "large"; else delete root.dataset.text;
    ts.setAttribute("aria-pressed", on ? "true" : "false");
    $(".lbl", ts).textContent = on ? "Standard text" : "Larger text";
    store.set("pp-text", on ? "large" : "std");
    if (ready) requestAnimationFrame(() => ScrollTrigger.refresh());
  };
  let ready = false;
  setText(root.dataset.text === "large");
  ts.addEventListener("click", () => setText(root.dataset.text !== "large"));

  /* ------------------------------------------------------------ build lab rows + gallery */
  const rowsEl = $(".lp-rows");
  rowsEl.innerHTML = Object.entries(MARKERS).map(([k, [n, d, b0, bw, fv]]) =>
    `<li class="lp-row" data-m="${k}"><div class="lp-name"><b>${n}</b><span>${d}</span></div>` +
    `<div class="lp-track" aria-hidden="true"><i class="lp-band" style="--b0:${b0};--bw:${bw}"></i><i class="lp-fill" style="--fv:${fv}"></i></div>` +
    `<span class="lp-st mono">In panel</span></li>`).join("");

  const tileHTML = ([f, w, alt], i) =>
    `<figure class="tile" style="margin:0"><div class="ph" style="--lx:${15 + (i * 37) % 70}%;--ang:${100 + (i * 29) % 80}deg"><img src="media/${f}.jpg" alt="${alt} (sample photo)" loading="lazy" onerror="this.remove()"></div>` +
    `<span class="cam mono">CAM ${String(i + 1).padStart(2, "0")}</span><span class="ghost" aria-hidden="true">${w}</span>` +
    `<figcaption class="cap"><b>${w}</b><span class="mono">SAMPLE</span></figcaption></figure>`;
  $(".g-a").innerHTML = TILES.slice(0, 7).map(tileHTML).join("");
  $(".g-b").innerHTML = TILES.slice(7).concat(TILES.slice(0, 2)).map((t, i) => tileHTML(t, i + 7)).join("");

  // tables collapse to labelled rows on phones
  $$("table.cmp").forEach(t => {
    const heads = $$("thead th", t).map(th => th.textContent.trim());
    t.style.setProperty("--cols", heads.length - 1);
    $$("tbody tr", t).forEach(tr => $$("td", tr).forEach((td, i) => td.setAttribute("data-label", heads[i + 1])));
  });

  /* ------------------------------------------------------------ MODE SELECT */
  let mode = MODES[root.dataset.mode] ? root.dataset.mode : "all";
  const modeBtns = $$(".modes-row button");
  function scrambleTo(el, txt) {
    if (reduce) { el.textContent = txt; return; }
    const G = "0123456789/#+-", o = { p: 0 };
    gsap.to(o, { p: 1, duration: 0.5, ease: "none", onUpdate() {
      const n = Math.floor(o.p * txt.length); let s = txt.slice(0, n);
      for (let i = n; i < txt.length; i++) s += txt[i] === " " ? " " : G[(Math.random() * G.length) | 0];
      el.textContent = s; }, onComplete() { el.textContent = txt; } });
  }
  function setHeroImg(src) {
    const ph = $(".ph-hero");
    const old = $("img", ph);
    const img = new Image();
    img.className = "hero-img"; img.alt = ""; img.src = src;
    img.onerror = () => img.remove();
    if (old) old.remove();
    ph.appendChild(img);
  }
  function applyMode(m, user) {
    mode = MODES[m] ? m : "all";
    const M = MODES[mode];
    if (mode === "all") delete root.dataset.mode; else root.dataset.mode = mode;
    if (user) store.set("pp-mode", mode);
    modeBtns.forEach(b => { const on = b.dataset.mode === mode; b.setAttribute("aria-checked", on); b.tabIndex = on || (mode === "all" && b === modeBtns[0]) ? 0 : -1; });
    // HUD relabels
    $(".rm-code").textContent = M.code;
    user ? scrambleTo($(".rm-name"), M.label) : ($(".rm-name").textContent = M.label);
    $(".hb-mode").textContent = mode === "all" ? "ALL MODES" : "MODE " + M.code + " · " + M.label;
    // hero line swaps
    const hl2 = $(".hl2");
    if (user && !reduce) {
      gsap.timeline().to(hl2, { clipPath: "inset(0 0 100% 0)", y: -20, duration: 0.25, ease: "power2.in" })
        .call(() => { hl2.textContent = M.hl; })
        .fromTo(hl2, { clipPath: "inset(100% 0 0 0)", y: 30 }, { clipPath: "inset(0% 0 0 0)", y: 0, duration: 0.55, ease: "expo.out", clearProps: "clipPath" });
    } else hl2.textContent = M.hl;
    setHeroImg(M.img);
    $$(".cta-txt").forEach(el => { el.textContent = M.cta; });
    // lab panel focus
    $(".lp-mode-txt").textContent = M.note;
    $$(".lp-row").forEach(r => {
      const f = M.markers.includes(r.dataset.m);
      r.classList.toggle("focus", f);
      r.classList.toggle("dim", mode !== "all" && !f);
      $(".lp-st", r).textContent = f ? "Your focus" : "In panel";
    });
    // proof order
    M.order.forEach((id, i) => { const s = $(`[data-proof="${id}"]`); if (s) s.style.order = i; });
    $(".clin-who").textContent = M.who;
    $(".hp-mode").textContent = M.label;
    $(".hp-count").textContent = String(mode === "all" ? 11 : M.markers.length).padStart(2, "0");
    const keys = Object.keys(MARKERS);
    $$(".hp-bars i").forEach((b, i) => { const on = mode === "all" || M.markers.includes(keys[i]); b.classList.toggle("on", on); b.style.transform = `scaleY(${on ? 0.55 + ((i * 37) % 45) / 100 : 0.25})`; });
    buildQ1();
    requestAnimationFrame(() => { renumber(); if (ready) { ScrollTrigger.refresh(); buildRail(); } });
  }
  modeBtns.forEach((b, i) => {
    b.addEventListener("click", () => applyMode(b.dataset.mode, true));
    b.addEventListener("keydown", e => {
      const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      const n = modeBtns[(i + d + modeBtns.length) % modeBtns.length];
      n.focus(); applyMode(n.dataset.mode, true);
    });
  });
  function renumber() {
    const v = $('[data-view="home"]');
    const segs = $$(".segn", v).sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    segs.forEach((s, i) => { s.textContent = String(i + 1).padStart(2, "0"); });
  }

  /* ------------------------------------------------------------ QUIZ */
  const STEPS = ["goal", "age", "state", "meds", "labs", "start", "result"];
  const qEls = Object.fromEntries(STEPS.map(s => [s, $(`.q[data-q="${s}"]`)]));
  let qi = 0, answers = {}, clockStart = 0, clockOn = false;
  function buildQ1() {
    const [legend, opts] = MODES[mode].q1;
    $(".q1-legend").textContent = legend;
    $(".q1-opts").innerHTML = opts.map(([v, t, s]) => `<button type="button" data-v="${v}" aria-pressed="false">${t}${s ? `<small>${s}</small>` : ""}</button>`).join("");
    $$(".q1-opts button").forEach(bindOpt);
    answers = {}; $$(".q-opts button").forEach(b => b.setAttribute("aria-pressed", "false"));
    showQ(0, false);
  }
  function showQ(i, focus = true) {
    qi = i;
    STEPS.forEach((s, k) => qEls[s].classList.toggle("is-on", k === i));
    $(".q-count").textContent = i < 6 ? `Question ${i + 1} of 6` : "Your starting path";
    $$(".q-bar i").forEach((b, k) => b.classList.toggle("on", k <= i));
    $(".q-back").disabled = i === 0;
    if (focus) { const h = i < 6 ? $("legend", qEls[STEPS[i]]) : $(".r-title"); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
    if (i === 6) { clockOn = false; result(); }
  }
  function bindOpt(btn) {
    btn.addEventListener("click", () => {
      const step = btn.closest(".q").dataset.q;
      $$("button", btn.parentElement).forEach(b => b.setAttribute("aria-pressed", b === btn ? "true" : "false"));
      answers[step] = btn.dataset.v;
      if (!clockOn && qi === 0) { clockOn = true; clockStart = performance.now(); }
      setTimeout(() => showQ(qi + 1), reduce ? 0 : 160);
    });
  }
  $$('.q[data-q]:not([data-q="goal"]) .q-opts button').forEach(b => { b.setAttribute("aria-pressed", "false"); bindOpt(b); });
  $(".q-next").addEventListener("click", () => {
    const sel = $("#q-state");
    if (!sel.value) { sel.focus(); sel.setAttribute("aria-invalid", "true"); return; }
    sel.removeAttribute("aria-invalid"); answers.state = sel.value; showQ(qi + 1);
  });
  $(".q-back").addEventListener("click", () => { if (qi > 0) showQ(qi - 1); });
  $(".q-restart").addEventListener("click", () => { $("#q-state").value = ""; buildQ1(); showQ(0); });
  function result() {
    const key = mode === "all" ? (MODES[answers.goal] ? answers.goal : "aging") : mode;
    const [title, copy] = MODES[key].path;
    const startTxt = { labs: "We'll send your lab requisition details first.", call: "We'll set up a call with a clinician licensed where you live.", callback: "A person from our team will call you back at a time that suits you." }[answers.start] || "";
    const medTxt = answers.meds === "no" ? "" : " Bring a list of your current medications; the clinician will review them.";
    $(".r-title").textContent = title;
    $(".r-copy").textContent = `${copy} ${startTxt}${medTxt}`;
    $(".r-state").textContent = answers.state || "your state";
  }
  gsap.ticker.add(() => {
    if (!clockOn) return;
    const s = Math.floor((performance.now() - clockStart) / 1000);
    $(".q-clock").textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  });

  /* ------------------------------------------------------------ forms */
  $$("form[data-form]").forEach(f => f.addEventListener("submit", e => {
    e.preventDefault();
    if (f.dataset.form === "lot") {
      const out = $(".lot-out");
      const v = (f.lot.value || "").trim().slice(0, 24);
      out.hidden = false;
      out.innerHTML = "";
      const rows = [["hd", "SAMPLE RECORD · NOT A REAL LOT"], ["Lot", v], ["Product", "Sample peptide A"], ["Prepared by", "[licensed partner pharmacy]"], ["Tested by", "[testing lab]"],
        ["Identity", "[result from COA]"], ["Potency / purity", "[result from COA]"], ["Sterility", "[result from COA]"], ["Endotoxin", "[result from COA]"],
        ["nt", "Preview only: nothing was looked up. Real lookups go live when the certificate database is connected."]];
      rows.forEach(([k, val]) => {
        const d = document.createElement("div");
        if (k === "hd" || k === "nt") { d.className = k; d.textContent = val; }
        else { const a = document.createElement("span"); a.className = "k"; a.textContent = k; const b = document.createElement("span"); b.textContent = val; d.append(a, b); }
        out.appendChild(d);
      });
      out.setAttribute("role", "status");
      return;
    }
    const p = document.createElement("p");
    p.className = "status"; p.setAttribute("role", "status");
    p.textContent = "Preview only: nothing was sent. Connect a CRM to go live.";
    f.replaceChildren(p);
    if (ready) ScrollTrigger.refresh();
  }));

  /* ------------------------------------------------------------ smooth scroll */
  let lenis = null;
  if (!reduce) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollToEl = (el) => {
    if (!el) return;
    const y = el.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(root).getPropertyValue("--top")) || 64);
    lenis ? lenis.scrollTo(y, { duration: 1.2 }) : scrollTo(0, y);
  };

  /* ------------------------------------------------------------ HUD: rail index, % readout, lane line */
  const railIdx = $(".rail-idx"), pctEl = $(".rail-pct .pct"), laneEl = $(".lane span");
  const desktop = matchMedia("(min-width: 901px)");
  let secs = [];
  function buildRail() {
    const v = $(`.view[data-view="${current}"]`);
    if (!v) return;
    secs = $$("[data-sec]", v).sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    railIdx.innerHTML = secs.map((s, i) => `<li><button type="button" aria-label="${s.dataset.sec}"><span>${String(i + 1).padStart(2, "0")}</span><span class="tip" aria-hidden="true">${s.dataset.sec}</span></button></li>`).join("");
    $$("button", railIdx).forEach((b, i) => b.addEventListener("click", () => scrollToEl(secs[i])));
  }
  let lastY = -1, lastH = -1;
  function hud() {
    const y = scrollY, H = document.documentElement.scrollHeight - innerHeight;
    if (y === lastY && H === lastH) return;
    lastY = y; lastH = H;
    const p = H > 0 ? clamp(y / H, 0, 1) : 0;
    pctEl.textContent = String(Math.round(p * 100)).padStart(3, "0");
    laneEl.style.transform = desktop.matches ? `scaleY(${p})` : `scaleX(${p})`;
    let a = 0;
    secs.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * 0.4) a = i; });
    $$("button", railIdx).forEach((b, i) => b.classList.toggle("on", i === a));
  }
  gsap.ticker.add(hud);

  /* ------------------------------------------------------------ hero canvas + clock */
  const heroGrid = new PPGrid($(".hero-grid"), { cols: 12, lights: false });
  Object.assign(heroGrid.s, { horizon: 0.18, speed: 0.35, alpha: 0.8, lane: 1 });
  let heroVis = true;
  new IntersectionObserver(([en]) => { heroVis = en.isIntersecting; }).observe($(".hero-grid"));
  heroGrid.render(0.016);
  gsap.ticker.add((t, dt) => {
    if (!heroVis || current !== "home" || reduce) return;
    const v = lenis ? Math.abs(lenis.velocity || 0) : 0;
    heroGrid.s.speed += ((0.35 + v * 0.06) - heroGrid.s.speed) * 0.08;
    heroGrid.render(dt / 1000);
  });
  const hbtc = $(".hb-tc");
  setInterval(() => { const d = new Date(); hbtc.textContent = d.toTimeString().slice(0, 8); }, 1000);

  /* ------------------------------------------------------------ HOME choreography (built/reverted per view) */
  let homeMM = null;
  const skewTo = { v: 0 };
  function buildHome() {
    if (homeMM || reduce) return;
    homeMM = gsap.matchMedia();
    homeMM.add({ desk: "(min-width: 901px)", mob: "(max-width: 900px)" }, (ctx) => {
      const { desk } = ctx.conditions;
      // (2) pinned lab panel: bars fill, range bands appear
      const tl = gsap.timeline({ scrollTrigger: desk
        ? { trigger: ".lp-pin", start: "top top", end: "+=140%", pin: true, scrub: 1 }
        : { trigger: ".lp-board", start: "top 85%", end: "bottom 45%", scrub: 1 } });
      $$(".lp-row").forEach((r, i) => {
        tl.fromTo($(".lp-band", r), { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.5, ease: "power2.out" }, i * 0.18)
          .fromTo($(".lp-fill", r), { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.out" }, i * 0.18 + 0.1);
      });
      // (3) kinetic outlined type fills on scroll
      $$(".kt").forEach((k, i) => {
        gsap.fromTo($(".kt-f", k), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", ease: "none",
          scrollTrigger: { trigger: k, start: "top 88%", end: "top 40%", scrub: 1 } });
        gsap.fromTo(k, { x: i % 2 ? 60 : -60 }, { x: 0, ease: "none", scrollTrigger: { trigger: k, start: "top bottom", end: "top 40%", scrub: 1 } });
      });
      // (1) gallery tracks drift with scroll; skew from velocity is in the ticker below
      const travel = () => Math.max(0, $(".g-a").scrollWidth - innerWidth + 120);
      gsap.fromTo(".g-a", { x: 0 }, { x: () => -travel(), ease: "none", scrollTrigger: { trigger: ".gallery", start: "top bottom", end: "bottom top", scrub: 1, invalidateOnRefresh: true } });
      gsap.fromTo(".g-b", { x: () => -travel() * 0.6 }, { x: 0, ease: "none", scrollTrigger: { trigger: ".gallery", start: "top bottom", end: "bottom top", scrub: 1, invalidateOnRefresh: true } });
      // price lock: the word LOCKED slides home
      gsap.fromTo(".pl-type .fill", { xPercent: 18 }, { xPercent: 0, ease: "none", scrollTrigger: { trigger: ".pl-type", start: "top bottom", end: "top 40%", scrub: 1 } });
      // section reveals (content visible until its trigger fires)
      ScrollTrigger.batch(".seg-block h2, .ticket, .q-card, .g-head h2, .news-h", {
        start: "top 90%", once: true,
        onEnter: els => gsap.from(els, { y: 40, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, overwrite: true }),
      });
    });
  }
  function killHome() { if (homeMM) { homeMM.revert(); homeMM = null; } }
  const tracks = $$(".g-track");
  const skX = gsap.quickTo(tracks, "skewY", { duration: 0.4, ease: "power3" });
  const scX = gsap.quickTo(tracks, "scaleY", { duration: 0.4, ease: "power3" });
  gsap.ticker.add(() => {
    if (!lenis || current !== "home") return;
    const v = lenis.velocity || 0;
    skX(clamp(v * 0.18, -7, 7));
    scX(1 - Math.min(Math.abs(v) * 0.002, 0.05));
  });

  /* ------------------------------------------------------------ router (bare hash tokens) */
  const VIEWS = ["home", "programs", "science", "faq"];
  const TITLES = { home: "Pepticity Performance", programs: "Programs · Pepticity", science: "Science · Pepticity", faq: "FAQ & contact · Pepticity" };
  let current = null, switching = false;
  function markNav() {
    $$("[data-v]").forEach(a => a.dataset.v === current ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));
    document.title = TITLES[current];
  }
  function swap(name, jump, focus) {
    $$(".view").forEach(v => { v.hidden = v.dataset.view !== name; });
    current = name; markNav();
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    scrollTo(0, 0);
    if (name === "home") buildHome(); else killHome();
    requestAnimationFrame(() => {
      ScrollTrigger.refresh(); renumber(); buildRail(); lastY = -1;
      if (jump) setTimeout(() => scrollToEl(document.getElementById(jump)), 80);
      else if (focus) { const h = $(`.view[data-view="${name}"] h1`); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
    });
  }
  function show(name, jump, first) {
    if (!VIEWS.includes(name)) name = "home";
    if (name === current) { jump ? scrollToEl(document.getElementById(jump)) : (lenis ? lenis.scrollTo(0) : scrollTo(0, 0)); return; }
    if (first || reduce || switching) { killHome(); swap(name, jump, !first); return; }
    switching = true;
    const out = $(`.view[data-view="${current}"]`);
    const fx = $(".switchfx");
    // channel switch: the outgoing feed collapses to a scan line, the new feed opens from it
    gsap.timeline({ onComplete: () => { switching = false; } })
      .set(fx, { opacity: 1 }).fromTo($("span", fx), { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "power3.out" }, 0)
      .to(out, { clipPath: "inset(49% 0 49% 0)", opacity: 0.4, duration: 0.32, ease: "power3.in" }, 0)
      .call(() => { gsap.set(out, { clearProps: "clipPath,opacity" }); killHome(); swap(name, jump, true); })
      .fromTo(() => $(`.view[data-view="${name}"]`), { clipPath: "inset(49% 0 49% 0)" }, { clipPath: "inset(0% 0 0% 0)", duration: 0.55, ease: "expo.out", clearProps: "clipPath" })
      .to(fx, { opacity: 0, duration: 0.35 }, "<0.1");
  }
  function replayIntro() {
    if (reduce || !window.PPIntro) { history.replaceState(null, "", "#home"); show("home"); return; }
    scrollTo(0, 0);
    PPIntro.play(() => { history.replaceState(null, "", "#" + (current || "home")); });
  }
  document.addEventListener("click", e => {
    const t = e.target.closest("a[href^='#'], [data-jump]");
    if (!t || t.classList.contains("skiplink")) return;
    const href = t.getAttribute("href");
    const jump = t.dataset.jump || null;
    if (href === "#intro") { e.preventDefault(); history.pushState(null, "", "#intro"); replayIntro(); return; }
    const name = href ? href.slice(1) : "home";
    if (!VIEWS.includes(name)) return;
    e.preventDefault();
    if (location.hash !== "#" + name) history.pushState(null, "", "#" + name);
    show(name, jump);
  });
  addEventListener("popstate", () => route());
  addEventListener("hashchange", () => route());
  function route(first) {
    const h = location.hash.slice(1);
    if (h === "intro") { if (first) show("home", null, true); replayIntro(); return; }
    show(VIEWS.includes(h) ? h : "home", null, first);
  }

  /* ------------------------------------------------------------ boot */
  applyMode(mode, false);
  route(true);
  ready = true;
  if (root.classList.contains("intro-play") && location.hash !== "#intro") {
    window.PPIntro.play(() => { ScrollTrigger.refresh(); });
  }
  document.fonts.ready.then(() => { ScrollTrigger.refresh(); renumber(); buildRail(); });
  addEventListener("resize", () => { lastY = -1; });
})();
