/* Pepticity Prime: router, text size, age & goal dial, quiz, call-back scheduler, calm scroll motion. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };
  const hasGsap = typeof gsap !== "undefined";
  if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  const refresh = () => { if (hasGsap && window.ScrollTrigger) ScrollTrigger.refresh(); };

  // ---------------- header height token ----------------
  const hdr = $(".hdr");
  const setHdr = () => root.style.setProperty("--hdr", Math.round(hdr.getBoundingClientRect().height) + "px");
  setHdr(); addEventListener("resize", setHdr);

  // ---------------- text size ----------------
  const sizeBtns = $$(".textsize button");
  function setSize(sz) {
    root.dataset.size = sz;
    sizeBtns.forEach(b => b.setAttribute("aria-pressed", b.dataset.size === sz ? "true" : "false"));
    store.set("prime-size", sz);
    setHdr(); requestAnimationFrame(() => { if (window.__primeRemotion) window.__primeRemotion(); else refresh(); });
  }
  setSize(store.get("prime-size") === "larger" ? "larger" : "large");
  sizeBtns.forEach(b => b.addEventListener("click", () => setSize(b.dataset.size)));

  // ---------------- smooth scroll ----------------
  let lenis = null;
  if (hasGsap && !reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollToEl = el => {
    const off = -(hdr.getBoundingClientRect().height + 16);
    if (lenis) lenis.scrollTo(el, { offset: off, duration: 1.4 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + scrollY + off, behavior: reduce ? "auto" : "smooth" });
  };
  const scrollTop = () => { if (lenis) lenis.scrollTo(0, { immediate: true }); window.scrollTo(0, 0); };

  // ---------------- router ----------------
  const VIEWS = ["home", "programs", "learn", "faq"];
  const veil = $(".veil"), veilLine = $(".veil span");
  let current = null;
  function show(name) {
    $$(".view").forEach(v => { v.hidden = v.dataset.view !== name; });
    $$("[data-link]").forEach(a => a.dataset.link === name ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));
    current = name;
    if (name === "home" && window.__primeRemotion) requestAnimationFrame(window.__primeRemotion);
    document.title = name === "home" ? "Pepticity Prime" : "Pepticity Prime: " + { programs: "Programs", learn: "Learn", faq: "Questions" }[name];
  }
  function go(name, opts = {}) {
    if (!VIEWS.includes(name)) name = "home";
    if (name === current && !opts.force) { scrollTop(); return; }
    const first = current === null;
    if (first || reduce || !hasGsap) { show(name); scrollTop(); refresh(); if (!first) $("#main").focus({ preventScroll: true }); return; }
    gsap.timeline()
      .set(veil, { pointerEvents: "auto" })
      .set(veilLine, { scaleX: 0 })
      .to(veil, { opacity: 1, duration: 0.45, ease: "power1.inOut" })
      .to(veilLine, { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, 0.1)
      .add(() => { show(name); scrollTop(); refresh(); $("#main").focus({ preventScroll: true }); })
      .to(veilLine, { opacity: 0, duration: 0.3 })
      .to(veil, { opacity: 0, duration: 0.55, ease: "power1.inOut" }, "<")
      .set([veil, veilLine], { pointerEvents: "none", opacity: (i) => i ? 1 : 0 });
  }
  function route() {
    const h = (location.hash || "").replace("#", "");
    if (h === "intro") {
      go("home");
      if (window.PrimeIntro) {
        window.PrimeIntro.play();
        document.addEventListener("prime:introdone", () => { try { history.replaceState(null, "", "#home"); } catch (e) {} }, { once: true });
      }
      return;
    }
    go(VIEWS.includes(h) ? h : "home");
  }
  addEventListener("hashchange", route);
  $(".skiplink").addEventListener("click", e => { e.preventDefault(); $("#main").focus(); });

  // ---------------- age & goal dial ----------------
  const GOALS = {
    aging: {
      label: "healthy aging", line: "Stay yourself, for the <em>decades ahead.</em>",
      sub: "Talk with a real person first. A licensed clinician reviews your health and your medicines, and decides if a plan is right for you. A licensed partner pharmacy fills it, and every lot is tested.",
      img: "media/aud-longevity.jpg", art: "dawn", alt: "A silver-haired man walking a coastal trail in early light",
      cta: "Call me back", order: ["clinician", "family", "lab", "recovery", "cosmetic"],
      q1: "What matters most to you right now?", q1o: ["Staying active", "Staying independent", "Looking at my medicines together", "Just learning for now"],
      result: "A Healthy Aging consult", rbody: "A longer first consult, with time to go through every medicine you take.",
    },
    energy: {
      label: "more energy", line: "Not feeling like yourself? <em>Start with a conversation.</em>",
      sub: "Tell a real person what your days feel like. A licensed clinician looks at the whole picture, sleep, work and medicines, and decides if a plan is right for you.",
      img: "media/aud-energy.jpg", art: "window", alt: "A woman stretching in bed in soft morning light",
      cta: "Talk about my energy", order: ["clinician", "recovery", "lab", "family", "cosmetic"],
      q1: "When do you notice it most?", q1o: ["Mornings", "Afternoons", "All day", "I'm not sure"],
      result: "An Energy consult", rbody: "A conversation about your routine, sleep and work, with a clinician who decides if a plan makes sense.",
    },
    women: {
      label: "women's health", line: "Care that listens to women, <em>in every decade.</em>",
      sub: "Talk with a licensed clinician who takes the time to hear the whole story. They decide if a plan is right for you, and explain it in plain words.",
      img: "media/aud-women.jpg", art: "rose", alt: "A woman in her fifties standing by a bright window",
      cta: "Call me back to talk", order: ["clinician", "lab", "family", "cosmetic", "recovery"],
      q1: "What would you like to talk about first?", q1o: ["Life-stage changes", "Energy and sleep", "A whole-picture check-in", "Just learning for now"],
      result: "A Women's Health consult", rbody: "Time with a licensed clinician to talk through life-stage changes and your goals.",
    },
    men: {
      label: "men's health", line: "Straight talk. A real clinician. <em>A clear yes or no.</em>",
      sub: "No runaround. A licensed clinician reviews your health and tells you plainly whether a plan is right for you. Every lot is tested, and you can see the paper.",
      img: "media/aud-men.jpg", art: "city", alt: "A man in his forties running up city stairs at dawn",
      cta: "Get a straight answer", order: ["lab", "clinician", "recovery", "family", "cosmetic"],
      q1: "What would you like to talk about first?", q1o: ["Energy and drive at work", "Training and fitness", "A full check-in", "Just learning for now"],
      result: "A Men's Health consult", rbody: "A direct conversation with a licensed clinician, and a clear answer at the end.",
    },
    training: {
      label: "training & recovery", line: "Train hard. <em>Talk recovery with a clinician.</em>",
      sub: "Start with the Recovery & Energy consult. Talk through training, sleep and goals with a licensed clinician, who decides if a plan makes sense for you.",
      img: "media/aud-athlete.jpg", art: "gym", alt: "An athlete resting between sets in a dark gym",
      cta: "Book a recovery consult", order: ["recovery", "lab", "clinician", "cosmetic", "family"],
      q1: "What does your training look like?", q1o: ["Lifting", "Running or cycling", "A team sport", "A mix of everything"],
      result: "The Recovery & Energy consult", rbody: "A focused consult about training load, sleep and recovery, with a licensed clinician.",
    },
  };
  const DECADES = ["30s", "40s", "50s", "60s", "70s", "80s+"];
  const state = { goal: "aging", decade: "60s", q1: null, meds: null, talk: null, region: "" };
  try { const saved = JSON.parse(store.get("prime-dial") || "null"); if (saved && GOALS[saved.goal] && DECADES.includes(saved.decade)) { state.goal = saved.goal; state.decade = saved.decade; } } catch (e) {}

  const heroLine = $("[data-hero-line]"), heroSub = $("[data-hero-sub]"), heroEb = $("[data-hero-eyebrow]");
  const heroPh = $("[data-hero-ph]");
  function setHeroImg(G) {
    let img = heroPh.querySelector("img");
    heroPh.dataset.art = G.art;
    if (!img) { img = document.createElement("img"); img.onerror = () => img.remove(); heroPh.appendChild(img); }
    img.alt = G.alt;
    if (img.getAttribute("src") !== G.img) img.src = G.img;
  }
  function applyDial(animate) {
    const G = GOALS[state.goal];
    const apply = () => {
      heroLine.innerHTML = G.line;
      heroSub.textContent = G.sub;
      heroEb.textContent = "In your " + state.decade + " · " + G.label;
      setHeroImg(G);
    };
    if (animate && hasGsap && !reduce) {
      gsap.to([heroLine, heroSub, heroEb, heroPh], { opacity: 0.15, duration: 0.35, ease: "power1.out", onComplete: () => {
        apply(); gsap.to([heroLine, heroSub, heroEb, heroPh], { opacity: 1, duration: 0.7, ease: "power1.out" });
      } });
    } else apply();
    $$("[data-cta-label]").forEach(b => { b.textContent = G.cta; });
    G.order.forEach((k, i) => { const el = $(`[data-proof="${k}"]`); if (el) el.style.order = i; });
    $$(".dec-panel").forEach(p => p.classList.toggle("is-mine", p.dataset.decade === state.decade));
    $(".dial-sun").style.setProperty("--sun", (DECADES.indexOf(state.decade) / 5 * 100) + "%");
    $("[data-dial-status]").textContent = "Showing the page for: " + state.decade + ", " + G.label + ".";
    $$('input[name="goal"]').forEach(i => { i.checked = i.value === state.goal; });
    $$('input[name="decade"]').forEach(i => { i.checked = i.value === state.decade; });
    store.set("prime-dial", JSON.stringify({ goal: state.goal, decade: state.decade }));
    buildQ1(); syncQuizDecade(); renderResult();
    if (animate) requestAnimationFrame(refresh);
  }
  $$('input[name="goal"]').forEach(i => i.addEventListener("change", () => { state.goal = i.value; state.q1 = null; applyDial(true); }));
  $$('input[name="decade"]').forEach(i => i.addEventListener("change", () => { state.decade = i.value; applyDial(true); }));

  // ---------------- quiz (stepped) ----------------
  const quiz = $("[data-quiz]");
  const steps = $$(".q", quiz);
  const back = $("[data-q-back]", quiz), next = $("[data-q-next]", quiz);
  const count = $("[data-q-count]"), bar = $("[data-q-bar]");
  let step = 0;
  function pressGroup(group, v) { $$(".opt", group).forEach(b => b.setAttribute("aria-pressed", b.dataset.v === v ? "true" : "false")); }
  function buildQ1() {
    const G = GOALS[state.goal];
    $("[data-q1-legend]").textContent = G.q1;
    const box = $("[data-q1-opts]");
    box.innerHTML = "";
    G.q1o.forEach(o => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "opt"; b.dataset.v = o; b.textContent = o;
      b.setAttribute("aria-pressed", state.q1 === o ? "true" : "false");
      box.appendChild(b);
    });
  }
  function syncQuizDecade() { pressGroup($('[data-opts="decade"]'), state.decade); }
  quiz.addEventListener("click", e => {
    const b = e.target.closest(".opt"); if (!b) return;
    const group = b.parentElement;
    pressGroup(group, b.dataset.v);
    const k = group.dataset.opts;
    if (group.hasAttribute("data-q1-opts")) state.q1 = b.dataset.v;
    else if (k === "decade") { state.decade = b.dataset.v; applyDial(false); }
    else if (k) state[k] = b.dataset.v;
    updateNav(); renderResult();
  });
  $("[data-region]").addEventListener("change", e => { state.region = e.target.value; updateNav(); });
  const answered = () => [state.q1, state.decade, state.region, state.meds, state.talk][step];
  function updateNav() {
    back.hidden = step === 0;
    next.hidden = step === 5;
    const ok = !!answered();
    next.disabled = !ok; next.setAttribute("aria-disabled", ok ? "false" : "true");
    next.style.opacity = ok ? "" : ".45";
    next.textContent = step === 4 ? "See my starting point" : "Next";
    count.textContent = step === 5 ? "Done: here is your starting point" : "Step " + (step + 1) + " of 5";
    bar.style.width = ((Math.min(step, 5) + 1) / 6 * 100) + "%";
  }
  function goStep(n, focus = true) {
    step = Math.max(0, Math.min(5, n));
    steps.forEach(s => { s.hidden = +s.dataset.step !== step; });
    if (step === 5) renderResult();
    updateNav();
    if (focus) { const h = $(".q-h", steps[step]); if (h) h.focus({ preventScroll: false }); }
  }
  next.addEventListener("click", () => { if (answered()) goStep(step + 1); });
  back.addEventListener("click", () => goStep(step - 1));
  const fmt = d => d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  function addWeekdays(d, n) { const r = new Date(d); while (n > 0) { r.setDate(r.getDate() + 1); if (r.getDay() % 6) n--; } return r; }
  function renderResult() {
    const G = GOALS[state.goal];
    const talk = { phone: "by phone", video: "by video", family: "with a family member on the call" }[state.talk] || "by phone";
    $("[data-qr-title]").textContent = G.result + ", " + talk;
    let body = G.rbody;
    if (state.meds === "yes" || state.meds === "unsure") body += " Have your medication list ready: the clinician reviews it as part of the consult.";
    if (state.region === "other") body += " We may not serve your area yet. A care guide will tell you on the call.";
    $("[data-qr-body]").textContent = body;
    const now = new Date();
    $("[data-timeline]").innerHTML = [
      ["Today", "You ask for a call back. No payment, no email needed."],
      [fmt(addWeekdays(now, 1)), "A care guide calls you at the time you picked."],
      [fmt(addWeekdays(now, 3)), "Your consult with a licensed clinician, " + talk + "."],
      [fmt(addWeekdays(now, 7)), "If the clinician decides a plan is right for you, the licensed partner pharmacy ships it from a tested lot."],
    ].map(([d, t]) => `<li><b>${d}</b>${t}</li>`).join("");
  }

  // ---------------- call-back scheduler ----------------
  const tpl = $("#cb-tpl");
  const days = (() => { const out = []; let d = new Date(); while (out.length < 5) { d = addWeekdays(d, 1); out.push(new Date(d)); } return out; })();
  let formN = 0;
  $$("[data-cb-slot]").forEach(slot => {
    const frag = tpl.content.cloneNode(true);
    const form = frag.querySelector("form");
    const n = ++formN;
    $$('input[type="radio"]', form).forEach(r => { r.name = r.name + n; });
    form.querySelector(".cb-day-opts").innerHTML = days.map((d, i) =>
      `<label><input type="radio" name="day${n}" value="${d.toDateString()}"${i === 0 ? " checked" : ""}><span><i>${d.toLocaleDateString("en-US", { weekday: "short" })}</i><b>${d.getDate()}</b><i>${d.toLocaleDateString("en-US", { month: "short" })}</i></span></label>`).join("");
    form.addEventListener("submit", e => {
      e.preventDefault();
      const msg = form.querySelector(".cb-msg");
      const name = form.elements.name.value.trim(), phone = form.elements.phone.value.trim();
      if (!name || !phone) { msg.textContent = "Please add your first name and phone number."; (name ? form.elements.phone : form.elements.name).focus(); return; }
      const day = new Date(form.querySelector(`input[name="day${n}"]:checked`).value);
      const time = form.querySelector(`input[name="time${n}"]:checked`).value;
      const topic = form.elements.topic.value;
      msg.textContent = `Preview only: nothing was sent. In the live site, a care guide would call ${name} on ${fmt(day)}, in the ${time}${topic ? ", about: " + topic : ""}${form.elements.family.checked && !/family/.test(topic) ? ", with a family member" : ""}.`;
    });
    slot.appendChild(frag);
  });

  // ---------------- dialogs ----------------
  const cbDlg = $("#cb-dialog"), guideDlg = $("#guide-dialog");
  let lastFocus = null;
  function openDlg(d) {
    lastFocus = document.activeElement;
    if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
    if (lenis) lenis.stop();
    const f = d.querySelector(".dlg-x"); if (f) f.focus();
  }
  function closeDlg(d) { if (d.open) { d.close ? d.close() : d.removeAttribute("open"); } }
  [cbDlg, guideDlg].forEach(d => {
    d.addEventListener("close", () => { if (lenis) lenis.start(); if (lastFocus) lastFocus.focus({ preventScroll: true }); });
    d.addEventListener("click", e => { if (e.target === d) closeDlg(d); });
    $$("[data-close]", d).forEach(b => b.addEventListener("click", () => closeDlg(d)));
  });
  document.addEventListener("click", e => {
    const cb = e.target.closest("[data-callback]");
    if (cb) {
      const form = $("form", cbDlg), topicEl = $("[data-dlg-topic]", cbDlg);
      let topic = cb.dataset.consult || "";
      if (cb.hasAttribute("data-from-quiz")) topic = $("[data-qr-title]").textContent;
      form.elements.topic.value = topic;
      form.elements.family.checked = cb.hasAttribute("data-family") || state.talk === "family" && cb.hasAttribute("data-from-quiz");
      form.elements.meds.checked = cb.hasAttribute("data-from-quiz") && state.meds === "yes";
      topicEl.hidden = !topic; topicEl.textContent = topic ? "About: " + topic : "";
      $(".cb-msg", form).textContent = "";
      openDlg(cbDlg); return;
    }
    if (e.target.closest("[data-guide]")) { openDlg(guideDlg); return; }
    const j = e.target.closest("[data-jump]");
    if (j) { const t = document.getElementById(j.dataset.jump); if (t) { scrollToEl(t); t.setAttribute("tabindex", "-1"); t.focus({ preventScroll: true }); } }
  });

  // ---------------- preview-only mini forms ----------------
  $$("form[data-preview]").forEach(f => f.addEventListener("submit", e => {
    e.preventDefault();
    const m = f.querySelector(".form-msg");
    if (!f.checkValidity()) { m.textContent = "Please fill in each box."; f.querySelector(":invalid").focus(); return; }
    m.textContent = "Preview only: nothing was sent.";
  }));

  // ---------------- calm scroll motion (home) ----------------
  function motion() {
    if (!hasGsap || reduce || !window.ScrollTrigger) return;
    let mm = gsap.matchMedia();
    window.__primeRemotion = () => { mm.revert(); mm = gsap.matchMedia(); addAll(); refresh(); };
    function addAll() {
    mm.add("(min-width: 901px) and (min-height: 640px)", () => {
      const track = $(".dec-track"), pin = $(".dec-pin"), sec = $(".decades");
      sec.classList.remove("dec-stack");
      if (pin.getBoundingClientRect().height > innerHeight - hdr.getBoundingClientRect().height + 2) { sec.classList.add("dec-stack"); return () => sec.classList.remove("dec-stack"); }
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      const labels = $$(".dec-scale li");
      gsap.set(".dec-scale-fill", { scaleX: 0 });
      const tw = gsap.to(track, { x: () => -dist(), ease: "none",
        scrollTrigger: { trigger: pin, start: () => "top " + hdr.getBoundingClientRect().height, end: () => "+=" + dist() * 1.1, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: s => {
            gsap.set(".dec-scale-fill", { scaleX: s.progress });
            const k = Math.round(s.progress * (labels.length - 1));
            labels.forEach((l, i) => { l.style.color = i === k ? "var(--ox)" : ""; });
          } } });
      return () => { tw.scrollTrigger && tw.scrollTrigger.kill(); tw.kill(); gsap.set(track, { x: 0 }); gsap.set(".dec-scale-fill", { scaleX: 1 }); };
    });
    mm.add("(min-width: 1px)", () => {
      // progress line through the four steps
      const steps = $(".steps");
      const line = document.createElement("span"); line.className = "prog-line"; steps.appendChild(line);
      gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: steps, start: "top 70%", end: "bottom 60%", scrub: 1 } });
      // slow parallax photo stacks
      [[".stk-a", -6], [".stk-b", 10], [".stk-c", -14]].forEach(([s, y]) =>
        gsap.fromTo(s, { yPercent: -y / 2 }, { yPercent: y, ease: "none", scrollTrigger: { trigger: ".stacks", start: "top bottom", end: "bottom top", scrub: 1 } }));
      // hero image eases down as you leave (the sky settling)
      gsap.to(".hero-photo .ph", { yPercent: 6, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 } });
      return () => line.remove();
    });
    }
    addAll();
  }

  // ---------------- boot ----------------
  applyDial(false);
  goStep(0, false);
  route();
  motion();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { setHdr(); refresh(); });
  addEventListener("load", refresh);
  document.addEventListener("prime:introdone", () => { setHdr(); refresh(); });
  if (window.PrimeIntro && location.hash !== "#intro" && window.PrimeIntro.shouldPlay()) window.PrimeIntro.play();
})();
