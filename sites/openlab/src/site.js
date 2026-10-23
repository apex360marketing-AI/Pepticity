/* Pepticity Open Lab — router, audience "sample tray", instruments, lot explorer, report, forms. */
(function () {
  const { AUD, MOL, PRODUCTS, LOTS } = window.OL;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };
  const VIEWS = ["home", "shop", "lab", "faq"];
  const SEC = { home: "§ 01 Cover", shop: "§ 02 Shop", lab: "§ 03 Lab", faq: "§ 04 FAQ" };
  gsap.registerPlugin(ScrollTrigger);

  // ---------- text size ----------
  function setTS(v) {
    document.documentElement.style.setProperty("--ts", v);
    $$(".ts button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.ts === v)));
    store.set("ol-ts", v);
    setTimeout(() => ScrollTrigger.refresh(), 60);
  }
  $$(".ts button").forEach((b) => b.addEventListener("click", () => setTS(b.dataset.ts)));
  const ts0 = store.get("ol-ts"); if (ts0 && ["1", "1.14", "1.3"].includes(ts0)) setTS(ts0);

  // ---------- date strip ----------
  try { $("[data-today]").textContent = new Date().toLocaleDateString("en-CA", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); } catch (e) {}

  // ---------- smooth scroll ----------
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  function scrollToEl(el, immediate) {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -64, immediate: !!immediate, duration: 1.1 });
    else el.scrollIntoView({ block: "start" });
  }
  function scrollTop() { if (lenis) lenis.scrollTo(0, { immediate: true }); else scrollTo(0, 0); }

  // ---------- toast ----------
  const toastEl = $(".toast"); let toastT;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("on"), 2600); }

  // ---------- router: hash views with a "scan" reveal ----------
  let current = null, pending = null;
  function viewEl(v) { return $(`.view[data-view="${v}"]`); }
  function render(v, opts = {}) {
    if (!VIEWS.includes(v)) v = "home";
    const target = pending; pending = null;
    if (v === current) { if (target) afterTarget(target); return; }
    const prev = current; current = v;
    VIEWS.forEach((name) => { viewEl(name).hidden = name !== v; });
    $$("[data-nav]").forEach((a) => { if (a.dataset.nav === v) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    $("[data-slim-sec]").textContent = SEC[v];
    closeSheet();
    scrollTop();
    const el = viewEl(v);
    if (prev && !reduce && !opts.instant) {
      const line = document.createElement("div"); line.className = "scanline"; document.body.appendChild(line);
      const H = innerHeight;
      gsap.fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.8, ease: "power2.inOut", clearProps: "clipPath" });
      gsap.fromTo(line, { y: 0 }, { y: H, duration: 0.8, ease: "power2.inOut", onComplete: () => line.remove() });
    }
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      if (lenis) lenis.resize();
      if (target) setTimeout(() => afterTarget(target), prev ? 650 : 50);
    });
    window.dispatchEvent(new CustomEvent("ol:view", { detail: v }));
  }
  function afterTarget(t) {
    if (t.lot) selectLot(t.lot, true);
    if (t.id) {
      const el = document.getElementById(t.id);
      scrollToEl(el);
      if (t.id === "callback") setTimeout(() => $("#cb-n").focus({ preventScroll: true }), 900);
      if (t.id === "ask") setTimeout(() => $("#ak-n").focus({ preventScroll: true }), 900);
    }
  }
  function go(v, target) {
    pending = target || null;
    if (location.hash.slice(1) !== v) history.pushState(null, "", "#" + v);
    render(v);
  }
  window.OLgo = go;
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const tok = a.getAttribute("href").slice(1);
    if (tok === "intro") { e.preventDefault(); history.pushState(null, "", "#intro"); window.OLIntro && window.OLIntro.play(); return; }
    if (!VIEWS.includes(tok)) return;
    e.preventDefault();
    if (a.hasAttribute("data-skip")) { $("#main").focus(); return; }
    const t = a.dataset.target || a.dataset.lot ? { id: a.dataset.target, lot: a.dataset.lot } : null;
    if (!t && tok === current) { scrollTop(); return; }
    go(tok, t);
  });
  addEventListener("popstate", () => render(location.hash.slice(1)));
  addEventListener("hashchange", () => { const h = location.hash.slice(1); if (h === "intro") { window.OLIntro && window.OLIntro.play(); return; } render(h); });

  // ---------- contents sheet (mobile) ----------
  const sheet = $("#sheet");
  function openSheet() { sheet.hidden = false; $$(".contents-btn").forEach((b) => b.setAttribute("aria-expanded", "true")); $(".sheet a").focus(); }
  function closeSheet() { if (sheet.hidden) return; sheet.hidden = true; $$(".contents-btn").forEach((b) => b.setAttribute("aria-expanded", "false")); }
  $$(".contents-btn").forEach((b) => b.addEventListener("click", openSheet));
  $(".sheet-x").addEventListener("click", closeSheet);
  sheet.addEventListener("click", (e) => { if (e.target === sheet) closeSheet(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheet(); });

  // ---------- slim bar + mobile CTA ----------
  const slim = $(".slim"), mcta = $(".mcta"), mast = $(".mast");
  function onScroll() {
    const y = scrollY, on = y > mast.offsetHeight + 40;
    if (on !== slim.classList.contains("on")) {
      slim.classList.toggle("on", on);
      slim.setAttribute("aria-hidden", String(!on));
      on ? slim.removeAttribute("inert") : slim.setAttribute("inert", "");
    }
    mcta.classList.toggle("on", y > 420);
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // ---------- datalist ----------
  $("#lotlist").innerHTML = LOTS.map((l) => `<option value="${l.code}">${l.title}</option>`).join("");

  // ---------- chips ----------
  const chip = (s) => s === "pass" ? '<span class="chip chip-pass">PASS</span>' : s === "fail" ? '<span class="chip chip-fail">FAIL</span>' : '<span class="chip chip-pend">PENDING</span>';
  const statusChip = (l) => l.status === "released" ? '<span class="chip chip-pass">RELEASED</span>' : l.status === "held" ? '<span class="chip chip-fail">HELD</span>' : '<span class="chip chip-pend">IN TESTING</span>';

  // ---------- home ledger ----------
  const ledger = $("[data-ledger]");
  function renderLedger(aud) {
    ledger.innerHTML = LOTS.map((l) => `<tr class="${aud && l.aud.includes(aud) ? "rel" : ""}"><td><a href="#lab" data-target="explorer" data-lot="${l.code}">${l.code}</a></td><td>${l.title.replace(/ \(.*\)/, "")}</td><td class="mono">${l.purity.toFixed(1)}%</td><td>${statusChip(l)}</td></tr>`).join("");
  }

  // ---------- scopes ----------
  const S = window.OLScope;
  const heroLot = LOTS[0];
  const fig1 = new S($("#fig1"), { readout: $("#fig1r"), compact: true }); fig1.setLC(heroLot.lc, 1);
  const fig2b = new S($("#fig2b"), { readout: $("#fig2br") }); fig2b.setMS(heroLot.lc[0].ions, 2);
  const fig2a = new S($("#fig2a"), { readout: $("#fig2ar"), onPeak: (p) => { if (p) fig2b.setMS(p.ions, p.main ? 2 : 9); } }); fig2a.setLC(heroLot.lc, 1);
  const cLC = new S($("#c-lc"), { readout: $("#c-lcr"), compact: true });
  const cMS = new S($("#c-ms"), { readout: $("#c-msr"), compact: true });

  // pinned instrument (desktop) — scroll runs the sample; the page is complete at rest elsewhere
  const guide = $$(".guide li");
  function setGuide(i) { guide.forEach((li, k) => li.classList.toggle("on", k === i)); }
  setGuide(0);
  const mm = gsap.matchMedia();
  mm.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
    const st = ScrollTrigger.create({
      trigger: "#instrument", start: "top top", end: "+=1300", pin: ".ins-in", scrub: 1, anticipatePin: 1,
      onUpdate: (s) => {
        const p = s.progress;
        fig2a.progress = Math.min(1, p / 0.55); fig2a.dirty = true;
        fig2b.progress = Math.max(0, Math.min(1, (p - 0.5) / 0.4)); fig2b.dirty = true;
        setGuide(p < 0.3 ? 0 : p < 0.6 ? 1 : 2);
      },
    });
    fig2a.progress = 0; fig2b.progress = 0;
    return () => { st.kill(); fig2a.progress = 1; fig2b.progress = 1; fig2a.dirty = fig2b.dirty = true; };
  });
  // gentle reveals (from visible state; never hide content)
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    $$(".block .h2, .objection p, .protocol li, .receipt, .cl").forEach((el) => {
      gsap.from(el, { y: 28, opacity: 0.25, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });
  });

  // ---------- molecules ----------
  const M = window.OLMolecule;
  const mols = {};
  function molMeta(where, key) {
    const m = MOL[key];
    $(`[data-mol-meta="${where}"]`).innerHTML = `<span class="mn">${m.name}</span><span class="mf">${m.formula.replace(/(\d+)/g, "<sub>$1</sub>")} · MW ${m.mw}</span><span class="ms">${m.seq}</span>`;
  }
  function setMol(where, key) {
    if (!mols[where]) return;
    mols[where].set(MOL[key].spec, key); molMeta(where, key);
    $$(`[data-mol-for="${where}"]`).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mol === key)));
    $$(`.card[data-mol]`).forEach((c) => { if (where === "shop") c.classList.toggle("on", c.dataset.mol === key); });
  }
  mols.home = new M($("#mol-home")); mols.shop = new M($("#mol-shop"));
  // home spec list
  $("[data-specs=home]").innerHTML = PRODUCTS.map((p) => `<li><button type="button" data-mol-for="home" data-mol="${p.mol}" aria-pressed="false"><span class="sn1">${p.name}</span><span class="sn2">${MOL[p.mol].name}</span><span class="sn3">MW ${MOL[p.mol].mw}</span></button></li>`).join("");
  // shop cards
  $("[data-cards]").innerHTML = PRODUCTS.map((p, i) => `
    <article class="card" data-mol="${p.mol}" tabindex="-1">
      <figure class="plate plate-seq" data-plate="${["i", "ii", "iii", "iv"][i]}" data-seq="${MOL[p.mol].alias}"><img src="media/${p.plate}.jpg" alt="" loading="lazy" onerror="this.remove()"></figure>
      <div class="card-b">
        <h3>${p.name}</h3>
        <p class="inci">${MOL[p.mol].name} · ${MOL[p.mol].formula} · MW ${MOL[p.mol].mw}</p>
        <p>${p.note}</p>
        <a class="lotl" href="#lab" data-target="explorer" data-lot="${p.lot}">Lot ${p.lot} · read panel →</a>
        <div class="row"><span class="price">${p.size} · $[xx]</span><button class="btn btn-line" type="button" data-bag data-mol-btn="${p.mol}">Add to bag</button></div>
      </div>
    </article>`).join("");
  $$("[data-mol-for=home]").forEach((b) => { const f = () => setMol("home", b.dataset.mol); b.addEventListener("mouseenter", f); b.addEventListener("focus", f); b.addEventListener("click", f); });
  $$(".card[data-mol]").forEach((c) => { const f = () => setMol("shop", c.dataset.mol); c.addEventListener("mouseenter", f); c.addEventListener("focusin", f); c.addEventListener("click", f); });
  setMol("home", "ghkcu"); setMol("shop", "ghkcu");
  document.addEventListener("click", (e) => { if (e.target.closest("[data-bag]")) toast("Preview only: nothing was added to a bag."); });

  // ---------- lot explorer ----------
  let lxAud = null, curLot = null;
  const lxList = $("[data-lx-list]"), lxFilter = $("[data-lx-filter]");
  function renderList() {
    const list = lxAud ? LOTS.filter((l) => l.aud.includes(lxAud)) : LOTS;
    lxList.innerHTML = list.map((l) => `<li><button type="button" data-code="${l.code}" ${l.code === curLot ? 'aria-current="true"' : ""}><span class="lc">${l.code}</span><span class="lt">${l.title}</span>${statusChip(l)}</button></li>`).join("");
    lxFilter.innerHTML = lxAud ? `Tray filter: <b>${AUD[lxAud].label}</b> · ${list.length} of ${LOTS.length} lots <button type="button" data-lx-all>Show all</button>` : `Showing all ${LOTS.length} lots`;
  }
  lxList.addEventListener("click", (e) => { const b = e.target.closest("button[data-code]"); if (b) selectLot(b.dataset.code); });
  lxFilter.addEventListener("click", (e) => { if (e.target.closest("[data-lx-all]")) { lxAud = null; renderList(); } });
  function selectLot(code, fromNav) {
    const l = LOTS.find((x) => x.code === code); if (!l) return;
    if (lxAud && !l.aud.includes(lxAud)) lxAud = null;
    curLot = code; renderList();
    const c = (k) => $(`[data-c="${k}"]`);
    c("code").textContent = l.code; c("title").textContent = l.title; c("lane").textContent = l.lane; c("date").textContent = l.date;
    c("status").innerHTML = statusChip(l);
    const held = c("held"); held.hidden = !l.heldNote; held.textContent = l.heldNote || "";
    c("theo").textContent = l.theo.toFixed(3); c("obs").textContent = l.obs.toFixed(3);
    c("ppm").textContent = (((l.obs - l.theo) / l.theo) * 1e6).toFixed(1) + " ppm";
    c("purity").textContent = l.purity.toFixed(1) + " %"; c("spec").textContent = l.spec;
    c("endo").textContent = l.endo[0]; c("endoL").textContent = l.endo[1];
    c("metals").innerHTML = l.metals.map(([n, v, lim]) => `<tr><th scope="row">${n}</th><td>${v} ppm</td><td class="lim">${lim}</td></tr>`).join("");
    c("micro").innerHTML = l.micro.map(([n, v, lim]) => `<tr><th scope="row">${n}</th><td>${v}</td><td class="lim">${lim}</td></tr>`).join("");
    const pend = l.micro.some((m) => m[1] === "pending");
    $('[data-chip="id"]').innerHTML = chip("pass");
    $('[data-chip="pur"]').innerHTML = chip(l.purity >= 98 ? "pass" : "fail");
    $('[data-chip="endo"]').innerHTML = chip("pass");
    $('[data-chip="met"]').innerHTML = chip("pass");
    $('[data-chip="mic"]').innerHTML = chip(pend ? "pend" : "pass");
    const seed = LOTS.indexOf(l) + 3;
    cLC.setLC(l.lc, seed); cMS.setMS(l.msIons, seed);
    if (fromNav) { $("#lk2").value = code; $(".lx-msg").textContent = `Showing ${code}.`; }
  }
  $$("[data-lookup]").forEach((f) => f.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = f.querySelector("input").value.trim().toUpperCase().replace(/\s+/g, "");
    const hit = q && (LOTS.find((l) => l.code === q) || LOTS.find((l) => l.code.replace(/-/g, "").includes(q.replace(/-/g, ""))));
    const msg = $(".lx-msg");
    if (!hit) {
      msg.textContent = q ? `No lot matches “${q}”. The code is printed on the bottom of every box [placement: confirm].` : "Enter a lot code, e.g. OL-2610-A.";
      if (f.dataset.lookup !== "lab") go("lab", { id: "explorer" }); return;
    }
    msg.textContent = `Found ${hit.code}.`;
    if (f.dataset.lookup === "lab") selectLot(hit.code, true); else go("lab", { id: "explorer", lot: hit.code });
  }));

  // ---------- transparency report ----------
  const counts = { all: LOTS.length, rel: LOTS.filter((l) => l.status === "released").length, held: LOTS.filter((l) => l.status === "held").length, test: LOTS.filter((l) => l.status === "testing").length };
  $("[data-board]").innerHTML = `<div><b>${counts.all}</b><span>Lots published</span></div><div><b>${counts.rel}</b><span>Released</span></div><div><b>${counts.held}</b><span>Held, not shipped</span></div><div><b>${counts.test}</b><span>In testing</span></div>`;
  const log = $("[data-log]");
  log.innerHTML = [...LOTS].sort((a, b) => b.date.localeCompare(a.date)).map((l) => `<li><time>${l.date}</time><span>${l.code} · ${l.status === "held" ? "held: purity below spec, panel published" : l.status === "testing" ? "panels I–IV published · microbial pending" : "all five panels published · released"}</span></li>`).join("");
  const clock = $("[data-clock]");
  function tickClock() { const d = new Date(); clock.textContent = d.toISOString().slice(0, 10) + " " + d.toTimeString().slice(0, 8); clock.setAttribute("datetime", d.toISOString()); }
  tickClock(); setInterval(tickClock, 1000);
  setInterval(() => {
    if (current !== "lab" || document.hidden) return;
    const d = new Date(), li = document.createElement("li"); li.className = "new";
    li.innerHTML = `<time>${d.toTimeString().slice(0, 8)}</time><span>Ledger re-checked · ${counts.all} lots, no changes</span>`;
    log.prepend(li); while (log.children.length > 12) log.lastElementChild.remove();
  }, 15000);
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-fn]"); if (!b) return;
    const li = document.getElementById("fn" + b.dataset.fn); scrollToEl(li);
    li.classList.add("hl"); setTimeout(() => li.classList.remove("hl"), 2400);
  });

  // ---------- forms (never send) ----------
  $$(".pf").forEach((f) => f.addEventListener("submit", (e) => {
    e.preventDefault();
    const note = f.querySelector(".pf-note");
    const bad = $$("input[required], textarea[required]", f).find((i) => !i.value.trim() || (i.type === "email" && !/^\S+@\S+\.\S+$/.test(i.value)));
    if (bad) { note.textContent = "Please complete: " + (f.querySelector(`label[for="${bad.id}"]`)?.textContent || "this field") + "."; bad.focus(); return; }
    note.textContent = "Preview only: nothing was sent.";
  }));

  // ---------- intake quiz ----------
  const quiz = $("#quiz"), steps = $$(".qz-step", quiz), N = steps.length;
  const ans = {}; let step = 1;
  function showStep(n, focus = true) {
    step = n;
    steps.forEach((s) => { s.hidden = +s.dataset.step !== n; });
    $("[data-qz-count]").textContent = `Step ${n} of ${N}`;
    $(".qz-bar i", quiz).style.width = (n / N) * 100 + "%";
    $("[data-back]").disabled = n === 1;
    if (n === 5) $("[data-qz-loc]").textContent = ans.loc || "your state or province";
    if (focus) steps[n - 1].querySelector("h3").focus({ preventScroll: false });
  }
  $$(".qz-opts", quiz).forEach((g) => g.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    $$("button", g).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    ans[g.dataset.q] = b.dataset.v;
    if (g.dataset.q === "goal") applyAud(b.dataset.v, { fromQuiz: true });
    setTimeout(() => showStep(Math.min(N, step + 1)), reduce ? 0 : 240);
  }));
  $("[data-next]").addEventListener("click", () => {
    const s = $("#qz-loc"); if (!s.value) { s.focus(); toast("Choose a state or province to continue."); return; }
    ans.loc = s.value; showStep(4);
  });
  $("[data-back]").addEventListener("click", () => showStep(Math.max(1, step - 1)));
  showStep(1, false);

  // ---------- audience: the sample tray ----------
  const blocksWrap = $("[data-blocks]");
  function applyAud(key, o = {}) {
    const a = AUD[key]; if (!a) return;
    store.set("ol-aud", key);
    $$('input[name="aud"]').forEach((r) => { r.checked = r.value === key; });
    $("[data-tray-read]").innerHTML = `Sample <b>${a.well}</b> loaded · ${a.label} · page re-ordered for you`;
    $("[data-aud-line]").textContent = a.line;
    $("[data-aud-label]").textContent = a.label;
    // hero plate image swap
    const fig = $(".plate-hero");
    let img = fig.querySelector("img");
    if (!img) { img = document.createElement("img"); img.setAttribute("data-aud-img", ""); img.onerror = () => img.remove(); fig.prepend(img); }
    if (img.getAttribute("src") !== a.img) {
      const nimg = img.cloneNode(); nimg.onerror = () => nimg.remove(); nimg.src = a.img; nimg.alt = a.alt; img.replaceWith(nimg);
    } else img.alt = a.alt;
    // CTA wording
    $$("[data-cta]").forEach((b) => { b.textContent = a.cta; });
    $$("[data-cta-short]").forEach((b) => { b.textContent = "Start plan · " + a.short; });
    // re-order proof blocks (proof always precedes price)
    a.order.forEach((k) => blocksWrap.appendChild($(`[data-block="${k}"]`, blocksWrap)));
    // plans: selected first
    const rows = $("[data-plan-rows]");
    $$("li", rows).forEach((li) => li.classList.toggle("sel", li.dataset.aud === key));
    rows.prepend($(`li[data-aud="${key}"]`, rows));
    // lot explorer + ledger
    lxAud = key; renderList(); renderLedger(key);
    // quiz pre-fill (first question)
    if (!o.fromQuiz) { ans.goal = key; $$('[data-q="goal"] button').forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === key))); }
    ScrollTrigger.refresh();
  }
  $$('input[name="aud"]').forEach((r) => r.addEventListener("change", () => applyAud(r.value)));
  renderList(); renderLedger(null);
  const aud0 = store.get("ol-aud");
  if (AUD[aud0]) applyAud(aud0);
  selectLot(LOTS.find((l) => !lxAud || l.aud.includes(lxAud)).code);

  // ---------- boot route ----------
  const h0 = location.hash.slice(1);
  render(VIEWS.includes(h0) ? h0 : "home", { instant: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { ScrollTrigger.refresh(); [fig1, fig2a, fig2b, cLC, cMS].forEach((s) => { s.dirty = true; }); });
})();
