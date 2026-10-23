/* Pepticity Pure — views, drop picker, serum lens, copper fill, visible process, plan builder. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const money = n => "$[" + (Math.round(n * 100) / 100).toFixed(Number.isInteger(Math.round(n * 100) / 100) ? 0 : 2) + "]";

  // ======================= DATA =======================
  const AUD = {
    none: { label: "Everyone", hero: "Peptide care you can see all the way through.", lede: "A licensed clinician decides if a plan is right for you. A licensed partner pharmacy prepares it. Every lot is tested, and you can look the results up yourself.",
      cta: "Start my free clinician review", cap: "Pure, on purpose", img: "media/pure-drop.jpg", img2: "media/pure-woman50.jpg", cap2: "Photograph · for illustration",
      order: ["care", "process", "plan", "range"], q1: { h: "What brings you here today?", opts: [["longevity", "Healthy aging, 55+"], ["energy", "Feeling like myself again"], ["women", "Care for women 40+"], ["men", "Care for men 35+"], ["athlete", "Training & recovery"]] } },
    longevity: { label: "Healthy aging 55+", hero: "“I want to keep doing what I love.” Start with a clinician.", lede: "Unhurried, clinician-led care for people 55 and up. A licensed clinician reviews your history and medications first, and decides if a plan is right for you.",
      cta: "Talk to a clinician, free", cap: "Onward", img: "media/aud-longevity.jpg", img2: "media/prime-couple.jpg", cap2: "Photograph · couple on a sea wall",
      order: ["care", "process", "plan", "range"], q1: { h: "What would you most like to keep doing?", opts: [["walk", "Walking and travelling"], ["family", "Time with family"], ["hobby", "Gardening and hobbies"], ["other", "Something else"]] }, program: "Onward" },
    energy: { label: "Feeling like myself", hero: "“I want to feel like myself again.” Start with a conversation.", lede: "Tell a licensed clinician what's changed, in your own words. They look at the whole picture before anything else, and they decide if a plan is right for you.",
      cta: "Start my free review", cap: "Myself", img: "media/aud-energy.jpg", img2: "media/prime-tea.jpg", cap2: "Photograph · a slow morning",
      order: ["care", "process", "range", "plan"], q1: { h: "When do you feel least like yourself?", opts: [["morning", "Mornings"], ["afternoon", "Afternoons"], ["evening", "Evenings"], ["varies", "It varies"]] }, program: "Myself" },
    women: { label: "Women 40+", hero: "“I want a clinician who listens to women my age.”", lede: "Clinician-guided care built around women in their forties, fifties and beyond, plus a cosmetic shelf for how skin looks and feels. A licensed clinician decides if a plan is right for you.",
      cta: "Book my free clinician review", cap: "Forty+", img: "media/aud-women.jpg", img2: "media/pure-woman50.jpg", cap2: "Photograph · woman by a window",
      order: ["range", "care", "process", "plan"], q1: { h: "What should your clinician understand first?", opts: [["stage", "My stage of life"], ["routine", "My routine and stress"], ["feel", "How I want to feel day to day"], ["other", "Something else"]] }, program: "Forty+" },
    men: { label: "Men 35+", hero: "“I want straight answers, and proof.” Here are both.", lede: "Clear, clinician-led care for men 35 and up. See how every lot is made and tested, then talk to a licensed clinician, who decides if a plan is right for you.",
      cta: "Get my free clinician review", cap: "Steady", img: "media/aud-men.jpg", img2: "media/pure-man60.jpg", cap2: "Photograph · city stairs at dawn",
      order: ["process", "care", "plan", "range"], q1: { h: "What do you want most from this?", opts: [["answers", "Clear answers"], ["plan", "A plan I can stick to"], ["checkins", "Regular check-ins"], ["proof", "Proof of what I'm getting"]] }, program: "Steady" },
    athlete: { label: "Training & recovery", hero: "“I train hard. I want to know exactly what I'm taking.”", lede: "For people who train: see the full chain from sequence to door, look up any lot, and talk to a licensed clinician, who decides if a plan is right for you.",
      cta: "Check my options, free", cap: "Recover", img: "media/aud-athlete.jpg", img2: "media/perf-mobility.jpg", cap2: "Photograph · training, dark gym",
      order: ["process", "plan", "care", "range"], q1: { h: "How do you train?", opts: [["strength", "Strength"], ["endurance", "Endurance"], ["mixed", "Mixed or team sport"], ["mobility", "Mostly mobility"]] }, program: "Recover" },
  };
  const PROGRAMS = [
    { aud: "longevity", name: "Onward", for: "Healthy aging, 55+", img: "media/prime-hiking.jpg", desc: "A slower first visit that covers your full medication list, with check-ins planned around your life and a named person to phone.", price: "$[xx]/mo" },
    { aud: "energy", name: "Myself", for: "Low energy, not feeling like yourself", img: "media/aud-energy.jpg", desc: "Start by describing what's changed. Your clinician looks at sleep, routine and history together before deciding on any plan.", price: "$[xx]/mo" },
    { aud: "women", name: "Forty+", for: "Women 40+", img: "media/aud-women.jpg", desc: "Clinicians experienced with women's midlife care, longer visits on request, and the cosmetic shelf at a member rate.", price: "$[xx]/mo" },
    { aud: "men", name: "Steady", for: "Men 35+", img: "media/aud-men.jpg", desc: "Straightforward visits, a written plan if one fits, and every lot's certificate one tap away.", price: "$[xx]/mo" },
    { aud: "athlete", name: "Recover", for: "Training & recovery", img: "media/aud-athlete.jpg", desc: "A clinician who asks about your training load and sport rules, and a plan only if it fits. Lot lookups for everything you receive.", price: "$[xx]/mo" },
  ];
  const BUILD = [
    { id: "review", kind: "svc", title: "Free clinician review", note: "Always included", price: 0, unit: "", locked: true, art: "review" },
    { id: "essential", kind: "mem", title: "Essential membership", note: "Clinician messaging, scheduled check-ins", price: 49, unit: "/mo", group: "mem", art: "mem" },
    { id: "concierge", kind: "mem", title: "Concierge membership", note: "Named care contact, same-day replies [confirm]", price: 99, unit: "/mo", group: "mem", art: "mem2" },
    { id: "visit", kind: "add", title: "Extra video visit", note: "A longer conversation with your clinician", price: 60, unit: " once", art: "visit" },
    { id: "cu01", kind: "cos", title: "Cu.01 Copper Peptide Serum", note: "No consult · 30 ml", price: 68, unit: "", art: "serum", sub: true },
    { id: "cu02", kind: "cos", title: "Cu.02 Cushion Cream", note: "No consult · 50 ml", price: 62, unit: "", art: "cream", sub: true },
  ];
  const SHELF = [
    { id: "cu01", cat: "serum", art: "serum", name: "Cu.01 Copper Peptide Serum", size: "30 ml", price: 68, lot: "SAMPLE-A", feel: "Silk-weight and quick to sink in. Leaves skin feeling soft, with a fresh, hydrated look.", key: "Copper Tripeptide-1, sodium hyaluronate, squalane" },
    { id: "cu01m", cat: "serum", art: "serumMini", name: "Cu.01 Travel Serum", size: "10 ml", price: 28, lot: "SAMPLE-A", feel: "The same serum in a carry-on size. A good way to try the texture.", key: "Copper Tripeptide-1, sodium hyaluronate, squalane" },
    { id: "cu02", cat: "cream", art: "cream", name: "Cu.02 Cushion Cream", size: "50 ml", price: 62, lot: "SAMPLE-B", feel: "A soft, cushiony cream with a comfortable, non-greasy finish. Skin looks smoother and feels supple.", key: "Copper Tripeptide-1, ceramide NP, glycerin" },
    { id: "cu04", cat: "cream", art: "night", name: "Cu.04 Night Balm", size: "50 ml", price: 72, lot: "SAMPLE-B", feel: "Richer and slower to melt. Skin feels cosy overnight and looks rested by morning.", key: "Copper Tripeptide-1, squalane, shea butter" },
    { id: "cu03", cat: "eye", art: "eye", name: "Cu.03 Eye Veil", size: "15 ml", price: 48, lot: "SAMPLE-C", feel: "A light gel-cream for around the eyes. Cool on contact, smooth under makeup.", key: "Copper Tripeptide-1, panthenol, glycerin" },
    { id: "set", cat: "set", art: "set", name: "The Shelf Set", size: "Serum, cream, eye", price: 158, lot: "SAMPLE-A/B/C", feel: "All three full sizes together, at a set price.", key: "See each product" },
  ];
  const LOTS = {
    "SAMPLE-A": ["Sample peptide A", "Identity: [result]", "Purity (HPLC): [x]%", "Microbial limits: [result]", "Heavy metals: [result]"],
    "SAMPLE-B": ["Sample peptide B", "Identity: [result]", "Purity (HPLC): [x]%", "Sterility: [result]", "Endotoxin: [result]"],
    "SAMPLE-C": ["Sample peptide C", "Identity: [result]", "Purity (HPLC): [x]%", "Preservative efficacy: [result]", "Stability: [result]"],
  };
  const FOUNDING = 0.2, SUBSAVE = 0.1, SHIP_FREE = 75;

  // ======================= TEXT SIZE =======================
  const sizeBtn = $(".size-btn");
  function setLarge(on) { html.dataset.text = on ? "large" : ""; sizeBtn.setAttribute("aria-pressed", on); store.set("pp-large", on ? "1" : "0"); ScrollTrigger.refresh(); }
  setLarge(store.get("pp-large") === "1");
  sizeBtn.addEventListener("click", () => setLarge(sizeBtn.getAttribute("aria-pressed") !== "true"));

  // ======================= RENDER CARDS =======================
  function artImg(kind, alt) { return `<img class="art-img" src="${PepArt.product(kind)}" alt="${alt || ""}">`; }
  const svcArt = { review: "Free<br>review", mem: "Ess.", mem2: "Con.", visit: "Visit" };
  function renderBuild() {
    $("[data-build]").innerHTML = BUILD.map(b => `
      <article class="b-card" data-id="${b.id}" data-kind="${b.kind}">
        <div class="b-art">${b.art in svcArt ? `<span class="b-glyph ${b.art}">${svcArt[b.art]}</span>` : artImg(b.art, "")}</div>
        <h3>${b.title}</h3><p>${b.note}</p>
        <p class="b-price">${b.price ? money(b.price) + b.unit : "Free"}</p>
        <button type="button" class="b-add" aria-pressed="false" ${b.locked ? "disabled" : ""}>${b.locked ? "Included" : "Add to plan"}</button>
      </article>`).join("");
  }
  function shelfCard(p) {
    return `<article class="s-card" data-id="${p.id}" data-cat="${p.cat}">
      <button type="button" class="s-art" data-qv="${p.id}" aria-label="Quick view: ${p.name}">${artImg(p.art, p.name + " product render")}</button>
      <div class="s-meta"><h3>${p.name}</h3><p class="s-size">${p.size}</p><p class="s-feel">${p.feel}</p>
      <p class="s-lot">Lot <b>${p.lot}</b> · <button type="button" class="link-cu sm" data-goto="lot">COA</button></p>
      <div class="s-row"><span class="s-price">${money(p.price)}</span><button type="button" class="b-add" data-shelf-add="${p.id}">Add to plan</button></div></div>
    </article>`;
  }
  function renderShelves() {
    $("[data-range]").innerHTML = SHELF.filter(p => ["cu01", "cu02", "cu03"].includes(p.id)).map(shelfCard).join("");
    $("[data-shelf]").innerHTML = SHELF.map(shelfCard).join("");
    $("[data-programs]").innerHTML = PROGRAMS.map((p, i) => `
      <article class="prog" data-aud="${p.aud}">
        <figure class="ph ph-prog" data-word="${p.name}"><img src="${p.img}" alt="" onerror="this.remove()" loading="lazy"></figure>
        <div class="prog-copy"><span class="prog-n">0${i + 1}</span><h2>${p.name}</h2><p class="prog-for">${p.for}</p><p>${p.desc}</p>
        <p class="prog-price">Membership from ${p.price} · first review free</p>
        <div class="prog-cta"><button type="button" class="btn" data-goto="assess" data-set-aud="${p.aud}">Start with ${p.name}</button></div></div>
      </article>`).join("");
  }
  renderBuild(); renderShelves();

  // ======================= PLAN STATE =======================
  let plan = { items: {}, founding: true };
  try { const s = JSON.parse(store.get("pp-plan") || "null"); if (s && s.items) plan = s; } catch (e) {}
  const allItems = () => Object.assign({}, ...BUILD.map(b => ({ [b.id]: { title: b.title, price: b.price, unit: b.unit, kind: b.kind, art: b.art, sub: !!b.sub } })),
    ...SHELF.map(p => ({ [p.id]: { title: p.name, price: p.price, unit: "", kind: "cos", art: p.art, sub: true } })));
  const CAT = allItems();
  function totals() {
    let monthly = 0, today = 0, cos = 0;
    for (const [id, it] of Object.entries(plan.items)) {
      const d = CAT[id]; if (!d) continue;
      if (d.kind === "mem") monthly += d.price * (plan.founding ? 1 - FOUNDING : 1);
      else if (d.kind === "cos") { const v = d.price * it.qty * (it.sub ? 1 - SUBSAVE : 1); cos += v; if (it.sub) monthly += v; else today += v; }
      else today += d.price * it.qty;
    }
    return { monthly, today, cos };
  }
  function save() { store.set("pp-plan", JSON.stringify(plan)); }
  function addItem(id, from) {
    const d = CAT[id]; if (!d) return;
    if (d.kind === "mem") for (const k of Object.keys(plan.items)) if (CAT[k] && CAT[k].kind === "mem") delete plan.items[k];
    if (plan.items[id] && d.kind === "cos") plan.items[id].qty++; else plan.items[id] = plan.items[id] || { qty: 1, sub: false };
    save(); syncPlan(true);
    if (from) flipToTray(from, d.art);
    toast(`${d.title} added to your plan.`);
  }
  function removeItem(id) { delete plan.items[id]; save(); syncPlan(); }
  function syncPlan(bump) {
    const ids = Object.keys(plan.items);
    const count = ids.reduce((a, k) => a + plan.items[k].qty, 0);
    $(".pb-count").textContent = count;
    $$(".b-card").forEach(c => { const on = !!plan.items[c.dataset.id]; const b = $(".b-add", c); if (!b.disabled) { b.setAttribute("aria-pressed", on); b.textContent = on ? "In your plan ✓" : "Add to plan"; } c.classList.toggle("on", on || c.dataset.id === "review"); });
    $("[data-founding]").checked = plan.founding;
    const t = totals();
    const totalTxt = !count ? "Free review" : [t.monthly ? money(t.monthly) + "/mo" : "", t.today ? money(t.today) + " today" : ""].filter(Boolean).join(" + ") || "Free review";
    $(".tray-total").textContent = totalTxt;
    html.classList.toggle("has-plan", count > 0);
    const slots = $$(".tray .slot");
    slots.forEach((s, i) => { const id = ids[i]; s.style.backgroundImage = id && CAT[id] && CAT[id].kind === "cos" ? `url(${PepArt.product(CAT[id].art)})` : ""; s.dataset.k = id ? CAT[id].kind : ""; s.classList.toggle("full", !!id); });
    $(".tray-go").textContent = count ? "Review plan" : "Build my plan";
    renderDrawer();
  }
  function renderDrawer() {
    const t = totals(), ids = Object.keys(plan.items);
    $("[data-lines]").innerHTML = `<div class="pd-line locked"><span class="pd-t">Free clinician review<small>Always included</small></span><b>Free</b></div>` +
      ids.map(id => { const d = CAT[id], it = plan.items[id]; return `<div class="pd-line" data-id="${id}">
        <span class="pd-t">${d.title}${d.kind === "cos" ? `<label class="pd-sub"><input type="checkbox" data-sub ${it.sub ? "checked" : ""}> Subscribe &amp; save [${SUBSAVE * 100}]%</label>` : ""}${d.kind === "mem" && plan.founding ? `<small>Founding-member rate applied [offer]</small>` : ""}</span>
        ${d.kind === "cos" ? `<span class="qty"><button type="button" data-q="-1" aria-label="Fewer">−</button><span>${it.qty}</span><button type="button" data-q="1" aria-label="More">+</button></span>` : ""}
        <b>${money(d.price * (d.kind === "mem" && plan.founding ? 1 - FOUNDING : 1) * it.qty)}${d.unit}</b>
        <button type="button" class="pd-x" data-rm aria-label="Remove ${d.title}">Remove</button></div>`; }).join("");
    const left = Math.max(0, SHIP_FREE - t.cos);
    $("[data-ship-msg]").textContent = t.cos === 0 ? `Cosmetic orders over ${money(SHIP_FREE)} ship free.` : left > 0 ? `${money(left)} more in cosmetics for free shipping.` : "Your cosmetics ship free.";
    $("[data-ship-bar]").style.transform = `scaleX(${Math.min(1, t.cos / SHIP_FREE)})`;
    $("[data-sum]").innerHTML = `<dt>Monthly</dt><dd>${t.monthly ? money(t.monthly) : "$[0]"}</dd><dt>Due today</dt><dd>${t.today ? money(t.today) : "$[0]"}</dd><dt>Prescriptions</dt><dd>Only if prescribed, priced by the pharmacy</dd>`;
  }
  $("[data-lines]").addEventListener("click", e => {
    const line = e.target.closest(".pd-line"); if (!line || !line.dataset.id) return;
    const id = line.dataset.id;
    if (e.target.closest("[data-rm]")) removeItem(id);
    const q = e.target.closest("[data-q]");
    if (q) { plan.items[id].qty = Math.max(1, plan.items[id].qty + +q.dataset.q); save(); syncPlan(); }
  });
  $("[data-lines]").addEventListener("change", e => { const line = e.target.closest(".pd-line"); if (e.target.matches("[data-sub]")) { plan.items[line.dataset.id].sub = e.target.checked; save(); syncPlan(); } });
  $("[data-founding]").addEventListener("change", e => { plan.founding = e.target.checked; save(); syncPlan(); });
  $("[data-build]").addEventListener("click", e => {
    const b = e.target.closest(".b-add"); if (!b || b.disabled) return;
    const card = b.closest(".b-card"), id = card.dataset.id;
    if (plan.items[id]) removeItem(id); else addItem(id, $(".b-art", card));
  });
  document.addEventListener("click", e => {
    const a = e.target.closest("[data-shelf-add]"); if (a) addItem(a.dataset.shelfAdd, $(".s-art", a.closest(".s-card")));
  });

  // ---- hand-written FLIP: card art → tray slot ----
  function flipToTray(fromEl, art) {
    const ids = Object.keys(plan.items);
    const slot = $$(".tray .slot")[Math.min(ids.length - 1, 3)];
    if (!slot || reduce) return;
    const a = fromEl.getBoundingClientRect(), b = slot.getBoundingClientRect();
    if (!b.width) return;
    const ghost = document.createElement("div");
    ghost.className = "flip-ghost";
    if (CAT[ids[ids.length - 1]]?.kind === "cos") ghost.style.backgroundImage = `url(${PepArt.product(art)})`; else ghost.classList.add("svc");
    Object.assign(ghost.style, { left: b.left + "px", top: b.top + "px", width: b.width + "px", height: b.height + "px" });
    document.body.appendChild(ghost);
    const sx = a.width / b.width, sy = a.height / b.height;
    slot.style.opacity = 0;
    const tl = gsap.timeline({ onComplete: () => { ghost.remove(); slot.style.opacity = ""; gsap.fromTo(slot, { scale: 1.35 }, { scale: 1, duration: 0.6, ease: "elastic.out(1,.5)" }); } });
    tl.fromTo(ghost, { x: a.left - b.left, scaleX: sx, borderRadius: "4%" }, { x: 0, scaleX: 1, borderRadius: "50%", duration: 0.9, ease: "power3.inOut" }, 0)
      .fromTo(ghost, { y: a.top - b.top, scaleY: sy }, { y: 0, scaleY: 1, duration: 0.9, ease: "back.in(1.1)" }, 0);
    gsap.fromTo(fromEl, { scale: 0.94 }, { scale: 1, duration: 0.8, ease: "elastic.out(1,.45)" });
  }

  // ======================= DRAWERS + MENU =======================
  let lenis = null, lastFocus = null;
  function openDrawer(el) {
    lastFocus = document.activeElement; el.hidden = false; html.classList.add("drawer-open"); lenis && lenis.stop();
    requestAnimationFrame(() => el.classList.add("open"));
    setTimeout(() => { const f = $("button, a, input", el); f && f.focus(); }, 60);
    if (el.id === "plan-drawer") $(".plan-btn").setAttribute("aria-expanded", "true");
  }
  function closeDrawer(el) {
    el.classList.remove("open"); html.classList.remove("drawer-open"); lenis && !html.classList.contains("intro-lock") && lenis.start();
    setTimeout(() => { el.hidden = true; }, 420);
    if (el.id === "plan-drawer") $(".plan-btn").setAttribute("aria-expanded", "false");
    lastFocus && lastFocus.focus && lastFocus.focus();
  }
  $$(".drawer").forEach(d => { d.addEventListener("click", e => { if (e.target === d || e.target.closest("[data-close]")) closeDrawer(d); }); });
  $(".plan-btn").addEventListener("click", () => openDrawer($("#plan-drawer")));
  $("[data-tray-go]").addEventListener("click", () => Object.keys(plan.items).length ? openDrawer($("#plan-drawer")) : goto("plan"));
  $("[data-checkout]").addEventListener("click", e => { closeDrawer($("#plan-drawer")); setTimeout(() => goto("assess"), 300); });
  const menu = $("#menu"), menuBtn = $(".menu-btn");
  function setMenu(open) {
    menuBtn.setAttribute("aria-expanded", open); html.classList.toggle("menu-open", open);
    if (open) { menu.hidden = false; requestAnimationFrame(() => menu.classList.add("open")); lenis && lenis.stop(); setTimeout(() => $("a", menu).focus(), 50); }
    else { menu.classList.remove("open"); setTimeout(() => (menu.hidden = true), 500); lenis && lenis.start(); }
  }
  menuBtn.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
  menu.addEventListener("click", e => { if (e.target.closest("a, button")) setMenu(false); });
  addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (html.classList.contains("menu-open")) setMenu(false);
    $$(".drawer.open").forEach(closeDrawer);
  });

  // quick view
  document.addEventListener("click", e => {
    const q = e.target.closest("[data-qv]"); if (!q || q.closest("#qv")) return;
    const p = SHELF.find(s => s.id === q.dataset.qv);
    $("#qv-h").textContent = p.name;
    $("[data-qv]", $("#qv")).innerHTML = `
      <div class="qv-gal"><div class="qv-main">${artImg(p.art, p.name + " product render")}</div>
        <figure class="ph ph-tex" data-word="Texture"><img src="media/pure-texture.jpg" alt="Close-up of the cream's texture" onerror="this.remove()"></figure></div>
      <p class="qv-price">${money(p.price)} <span>· ${p.size}</span></p>
      <p>${p.feel}</p>
      <p class="qv-key"><b>Key ingredients</b> ${p.key}</p>
      <fieldset class="qv-buy"><legend>How would you like it?</legend>
        <label><input type="radio" name="buy" value="once" checked> One-time · ${money(p.price)}</label>
        <label><input type="radio" name="buy" value="sub"> Subscribe &amp; save [${SUBSAVE * 100}]% · ${money(p.price * (1 - SUBSAVE))} every [6] weeks</label></fieldset>
      <button type="button" class="btn qv-add">Add to plan</button>
      <p class="qv-lot">Lot <b>${p.lot}</b> · <button type="button" class="link-cu sm" data-goto="lot">Open certificate of analysis</button></p>
      <p class="fine">Cosmetic. For how skin looks and feels; not intended to treat any condition. [x]-day returns on unopened items [confirm with Grace].</p>`;
    $(".qv-add", $("#qv")).addEventListener("click", () => {
      const sub = $("input[name=buy]:checked", $("#qv")).value === "sub";
      addItem(p.id, null); plan.items[p.id].sub = sub; save(); syncPlan(); closeDrawer($("#qv"));
    });
    openDrawer($("#qv"));
  });
  // shelf filters
  $$(".chip").forEach(c => c.addEventListener("click", () => {
    $$(".chip").forEach(x => x.setAttribute("aria-pressed", x === c)); const f = c.dataset.filter;
    $$("[data-shelf] .s-card").forEach(card => { card.hidden = !(f === "all" || card.dataset.cat === f); });
    ScrollTrigger.refresh();
  }));

  // ======================= FORMS =======================
  function status(form, msg) { const s = $(".form-status", form); if (s) { s.textContent = msg; s.classList.add("show"); } }
  $$(".callback, .notes-form, .contact-form").forEach(f => f.addEventListener("submit", e => {
    e.preventDefault();
    const req = $$("[required]", f).find(i => !i.value.trim() || (i.type === "email" && !/.+@.+\..+/.test(i.value)));
    if (req) { status(f, "Please fill in " + ($(`label[for=${req.id}]`)?.textContent || "this field").toLowerCase() + "."); req.focus(); return; }
    status(f, "Preview only: nothing was sent.");
  }));
  $(".lot-form").addEventListener("submit", e => {
    e.preventDefault();
    const v = $("#lot-in").value.trim().toUpperCase(), out = $(".lot-out"), r = LOTS[v];
    out.innerHTML = r ? `<div class="coa"><p class="coa-h"><span>SAMPLE certificate</span><b>${v}</b></p><p class="coa-name">${r[0]}</p><ul>${r.slice(1).map(x => `<li>${x}</li>`).join("")}</ul><p class="coa-f">Lab: [independent lab, confirm] · Issued: [date] · <a href="#science">PDF [link]</a></p></div>`
      : `<p class="coa-miss">No sample lot called “${v || "…"}”. Try SAMPLE-A, SAMPLE-B or SAMPLE-C. Real lots will be searchable at launch.</p>`;
    if (r && !reduce) gsap.from(".coa", { clipPath: "circle(0% at 10% 10%)", duration: 0.9, ease: "power3.out" });
  });
  function toast(msg) { const t = $(".toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2200); }

  // ======================= QUIZ =======================
  const quiz = $(".quiz"); let qStep = 1; const answers = {};
  function renderQ1() {
    const a = AUD[html.dataset.aud || "none"];
    $("[data-q1-h]").textContent = a.q1.h;
    $("[data-q1-opts]").innerHTML = a.q1.opts.map(([v, l]) => `<button type="button" class="q-opt" aria-pressed="${answers[1] === v}" data-v="${v}">${l}</button>`).join("");
  }
  function showStep(n) {
    qStep = n;
    $$(".q-step", quiz).forEach(s => (s.hidden = +s.dataset.q !== n));
    $("[data-step-n]").textContent = n;
    $(".assess-meter span").style.transform = `scaleX(${n / 5})`;
    $("[data-back]").hidden = n === 1;
    const aud = html.dataset.aud || "none";
    $("[data-q-result]").textContent = aud === "none" ? "the right program" : `the ${AUD[aud].program} program (${AUD[aud].label})`;
    const step = $(`.q-step[data-q="${n}"]`, quiz);
    if (!reduce) gsap.fromTo(step, { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" });
    $(".q-h", step).focus({ preventScroll: true });
  }
  quiz.addEventListener("click", e => {
    const o = e.target.closest(".q-opt");
    if (o) {
      const st = +o.closest(".q-step").dataset.q;
      $$(".q-opt", o.parentNode).forEach(x => x.setAttribute("aria-pressed", x === o));
      answers[st] = o.dataset.v;
      if (st === 1 && AUD[o.dataset.v]) setAud(o.dataset.v, o, true);
      setTimeout(() => showStep(st + 1), 260);
    }
    if (e.target.closest("[data-next]")) {
      const sel = $("#q-state");
      if (!sel.value) { sel.setAttribute("aria-invalid", "true"); sel.focus(); toast("Please choose your state or province."); return; }
      sel.removeAttribute("aria-invalid"); answers[3] = sel.value; showStep(4);
    }
    if (e.target.closest("[data-back]")) showStep(Math.max(1, qStep - 1));
  });
  quiz.addEventListener("submit", e => {
    e.preventDefault();
    const em = $("#q-email");
    if (!/.+@.+\..+/.test(em.value)) { status(quiz, "Please add an email so the clinician can reach you."); em.focus(); return; }
    status(quiz, "Preview only: nothing was sent.");
  });

  // ======================= AUDIENCE: the drop picker =======================
  let lensApi = null;
  function setImg(sel, src) {
    $$(sel).forEach(fig => { let img = $("img", fig); if (!img) { img = document.createElement("img"); img.alt = ""; img.onerror = () => img.remove(); fig.prepend(img); } img.src = src; });
  }
  function setAud(key, fromEl, quiet) {
    const a = AUD[key] || AUD.none;
    const prev = html.dataset.aud;
    html.dataset.aud = key; store.set("pp-aud", key);
    $$(".drop").forEach(d => d.setAttribute("aria-checked", d.dataset.aud === key));
    const swap = () => {
      $$('[data-aud-text="hero"]').forEach(el => (el.textContent = a.hero));
      $$('[data-aud-text="lede"]').forEach(el => (el.textContent = a.lede));
      $$('[data-aud-text="cta"]').forEach(el => (el.textContent = a.cta));
      $$('[data-aud-text="cap"]').forEach(el => (el.textContent = a.cap));
      $$('[data-aud-text="audcap"]').forEach(el => (el.textContent = a.cap2));
      setImg(".ph-aud", a.img2); $(".ph-aud").dataset.word = a.cap;
      // reorder proof sections; testing (process) always precedes plan
      a.order.forEach((k, i) => { const s = $(`[data-proof="${k}"]`); if (s) s.style.order = i; });
      $$(".prog").forEach(p => p.classList.toggle("mine", p.dataset.aud === key));
      renderQ1();
      lensApi && lensApi.setAudience(key);
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    if (!prev || prev === key || reduce || quiet) { swap(); if (fromEl && !reduce && prev !== key) ripple(fromEl); return; }
    ripple(fromEl);
    const t = $$(".hero-copy .hero-line, .hero-copy .lede, .ph-aud");
    gsap.timeline().to(t, { opacity: 0, y: -10, filter: "blur(6px)", duration: 0.28, ease: "power2.in" }).add(swap)
      .to(t, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power3.out", stagger: 0.06 });
  }
  function ripple(el, cx, cy) {
    if (reduce) return;
    let x = cx, y = cy;
    if (el) { const r = el.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height * 0.7; }
    const ring = $(".ripple-ring"), R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    gsap.fromTo(ring, { left: x, top: y, width: 10, height: 10, opacity: 0.9 }, { width: R * 2.1, height: R * 2.1, opacity: 0, duration: 1.3, ease: "power2.out" });
    if (el && el.classList.contains("drop")) gsap.fromTo($("svg", el), { y: -10, scaleY: 1.15 }, { y: 0, scaleY: 1, duration: 0.7, ease: "bounce.out" });
  }
  $$(".drop").forEach((d, i, all) => {
    d.addEventListener("click", () => setAud(d.dataset.aud, d));
    d.addEventListener("keydown", e => {
      const k = e.key; if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(k)) return;
      e.preventDefault(); const n = all[(i + (k === "ArrowRight" || k === "ArrowDown" ? 1 : all.length - 1)) % all.length]; n.focus(); setAud(n.dataset.aud, n);
    });
  });
  document.addEventListener("click", e => { const s = e.target.closest("[data-set-aud]"); if (s) setAud(s.dataset.setAud, null, true); });

  // ======================= SERUM LENS (raw WebGL) =======================
  function initLens() {
    const stage = $(".lens-stage"), canvas = $(".lens-canvas", stage);
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    const texSrc = { canvas: PepArt.hero("none") };
    let cur = null, pending = null, waveT = 9, waveC = [0.5, 0.5];
    if (!gl) { // 2D fallback: still image, no lens
      stage.classList.add("no-gl"); const c2 = canvas.getContext("2d");
      const draw = (src) => { canvas.width = stage.clientWidth; canvas.height = stage.clientHeight; const s = Math.max(canvas.width / src.width, canvas.height / src.height); c2.drawImage(src, (canvas.width - src.width * s) / 2, (canvas.height - src.height * s) / 2, src.width * s, src.height * s); };
      draw(texSrc.canvas); return { setAudience: a => draw(PepArt.hero(a)), tick() {} };
    }
    const vs = "attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
    const fs = `precision mediump float;varying vec2 v;uniform sampler2D T;uniform vec2 R,M,S,O,W;uniform float r,time,on,wt;uniform vec3 tint;
      vec3 tx(vec2 q){return texture2D(T,clamp(q,0.,1.)*S+O).rgb;}
      void main(){vec2 uv=vec2(v.x,1.-v.y);vec2 px=uv*R;vec2 m=M*R;
        float wd=length(px-W*R);float wf=wt*R.x*.9;float wa=exp(-wt*1.6)*smoothstep(90.,0.,abs(wd-wf));
        uv+=normalize(px-W*R+.001)*wa*.012;px=uv*R;
        vec2 d=px-m;float dist=length(d);float rr=r*on;float k=clamp(dist/max(rr,1.),0.,1.);vec3 col;
        if(dist<rr){float ang=atan(d.y,d.x);float wob=.03*sin(ang*5.+time*1.7)*k+.018*sin(ang*9.-time*2.4)*k;
          float mag=mix(.58,1.,k*k)+wob;vec2 q=(m+d*mag)/R;vec2 ca=d/R*.014*k;
          col=vec3(tx(q+ca).r,tx(q).g,tx(q-ca).b);
          col=mix(col,col*tint*1.25,.18*k);
          col=mix(col,vec3(1.),smoothstep(.8,1.,k)*.28);col*=1.-smoothstep(.95,1.,k)*.3;
          vec2 sp=d/max(rr,1.)-vec2(-.36,-.42);col+=smoothstep(.24,0.,length(sp*vec2(1.,1.7)))*.6;
        }else{col=tx(uv);float sh=smoothstep(rr*1.3,rr*.85,length(px-(m+vec2(rr*.1,rr*.22))));col*=1.-sh*.13*on;
          float cg=smoothstep(rr*1.45,rr,length(px-(m+vec2(rr*.18,rr*.4))));col=mix(col,tint,cg*.10*on);}
        gl_FragColor=vec4(col,1.);}`;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = n => gl.getUniformLocation(pr, n);
    const u = { R: U("R"), M: U("M"), S: U("S"), O: U("O"), W: U("W"), r: U("r"), time: U("time"), on: U("on"), wt: U("wt"), tint: U("tint") };
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(p => gl.texParameteri(gl.TEXTURE_2D, p, gl.CLAMP_TO_EDGE));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    function upload(src) { cur = src; gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, src); }
    upload(texSrc.canvas);
    const TINT = { none: [0.76, 0.44, 0.24], longevity: [0.69, 0.47, 0.34], energy: [0.76, 0.44, 0.24], women: [0.59, 0.36, 0.3], men: [0.36, 0.25, 0.2], athlete: [0.47, 0.27, 0.18] };
    let tint = TINT.none.slice(), tintTo = tint.slice();
    let W = 0, H = 0;
    function size() { const d = Math.min(devicePixelRatio || 1, 1.5); W = canvas.width = Math.round(stage.clientWidth * d); H = canvas.height = Math.round(stage.clientHeight * d); gl.viewport(0, 0, W, H); }
    size(); addEventListener("resize", size);
    const m = { x: 0.5, y: 0.45, tx: 0.5, ty: 0.45, inside: false, on: 0 };
    stage.addEventListener("pointermove", e => { const r = stage.getBoundingClientRect(); m.tx = (e.clientX - r.left) / r.width; m.ty = (e.clientY - r.top) / r.height; m.inside = true; });
    stage.addEventListener("pointerleave", () => (m.inside = false));
    let visible = true; new IntersectionObserver(([en]) => (visible = en.isIntersecting)).observe(stage);
    function load(key) {
      const want = key; const src = PepArt.hero(key);
      const img = new Image(); img.onload = () => { if (want === (html.dataset.aud || "none")) upload(img); }; img.onerror = () => {};
      img.src = (AUD[key] || AUD.none).img;
      return src;
    }
    let t0 = performance.now();
    return {
      setAudience(key) { pending = load(key); waveT = 0; waveC = [m.x, m.y]; tintTo = TINT[key] || TINT.none; },
      tick(dt) {
        if (!visible || current !== "home") return;
        const t = (performance.now() - t0) / 1000;
        if (!m.inside) { m.tx = 0.5 + 0.2 * Math.sin(t * 0.42); m.ty = 0.5 + 0.16 * Math.sin(t * 0.67 + 1); }
        m.x += (m.tx - m.x) * 0.09; m.y += (m.ty - m.y) * 0.09; m.on += (1 - m.on) * 0.05;
        if (pending && waveT > 0.25) { upload(pending); pending = null; }
        waveT += dt; tint = tint.map((c, i) => c + (tintTo[i] - c) * 0.06);
        const ca = W / H, ia = cur.width / cur.height;
        let S = [1, 1], O = [0, 0]; if (ca > ia) { S = [1, ia / ca]; O = [0, (1 - S[1]) / 2]; } else { S = [ca / ia, 1]; O = [(1 - S[0]) / 2, 0]; }
        gl.uniform2f(u.R, W, H); gl.uniform2f(u.M, m.x, m.y); gl.uniform2f(u.S, S[0], S[1]); gl.uniform2f(u.O, O[0], O[1]);
        gl.uniform2f(u.W, waveC[0], waveC[1]); gl.uniform1f(u.wt, Math.min(waveT, 5)); gl.uniform1f(u.r, Math.min(W, H) * (fine ? 0.2 : 0.24));
        gl.uniform1f(u.time, t); gl.uniform1f(u.on, reduce ? 1 : m.on); gl.uniform3f(u.tint, tint[0], tint[1], tint[2]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      },
    };
  }

  // ======================= COPPER FILL TEXT =======================
  const fills = $$("[data-fill]").map(el => ({ el, cu: $(".fill-cu", el), level: 0, vis: false }));
  fills.forEach(f => new IntersectionObserver(([en]) => (f.vis = en.isIntersecting)).observe(f.el));
  function drawFill(f, t) {
    if (!f.vis && f.drawn) return; f.drawn = true;
    const lv = reduce ? 1 : f.level, pts = [];
    const amp = lv > 0.02 && lv < 0.98 ? 1.6 : 0;
    for (let i = 0; i <= 20; i++) { const x = i * 5; const y = (1 - lv) * 104 - 2 + amp * Math.sin(i * 0.9 + t * 2.4) + amp * 0.6 * Math.sin(i * 0.37 - t * 1.3); pts.push(`${x}% ${y.toFixed(2)}%`); }
    f.cu.style.clipPath = `polygon(0% 110%, 100% 110%, ${pts.reverse().join(",")})`;
  }

  // ======================= ROUTER (liquid ripple between views) =======================
  const VIEWS = ["home", "programs", "science", "faq"];
  let current = null, ctx = null, lastPt = null, busy = false;
  addEventListener("pointerdown", e => (lastPt = [e.clientX, e.clientY]), true);
  function viewEl(n) { return $(`.view[data-view="${n}"]`); }
  function setupView(name) {
    ctx && ctx.revert();
    ctx = gsap.context(() => {
      const v = viewEl(name);
      fills.forEach(f => { if (!v.contains(f.el)) return; f.level = 0;
        gsap.to(f, { level: 1, ease: "none", scrollTrigger: { trigger: f.el, start: "top 88%", end: "bottom 40%", scrub: 1 } }); });
      if (!reduce) $$(".h2, .page-h, .rv, .objection, .prog, .s-card, .b-card, .test-list li, .care-steps li", v).forEach(el => {
        gsap.from(el, { y: 34, opacity: 0.6, duration: 1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 92%", once: true } });
      });
      if (name === "home") {
        const mm = gsap.matchMedia();
        mm.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
          const track = $(".vp-track"), dist = () => track.scrollWidth - innerWidth + 80;
          const tl = gsap.timeline({ scrollTrigger: { trigger: ".process .pin-wrap", start: "top top", end: () => "+=" + dist(), pin: true, scrub: 1, invalidateOnRefresh: true } });
          tl.to(track, { x: () => -dist(), ease: "none" }, 0).to(".vp-bar span", { scaleX: 1, ease: "none" }, 0);
          $$(".vp-panel").forEach(p => {
            gsap.fromTo($(".vp-drop i", p), { scaleY: 0.05 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: p, containerAnimation: tl, start: "left 85%", end: "left 30%", scrub: 1 } });
            gsap.fromTo($(".vp-n", p), { xPercent: 40 }, { xPercent: -30, ease: "none", scrollTrigger: { trigger: p, containerAnimation: tl, start: "left right", end: "right left", scrub: 1 } });
          });
        });
      }
    });
  }
  function scrollTop() { lenis ? lenis.scrollTo(0, { immediate: true, force: true }) : scrollTo(0, 0); }
  function route(name, instant) {
    if (!VIEWS.includes(name)) name = "home";
    $$("[data-nav]").forEach(a => a.toggleAttribute("aria-current", a.dataset.nav === name) || (a.dataset.nav === name && a.setAttribute("aria-current", "page")));
    if (name === current) { if (!instant) lenis ? lenis.scrollTo(0) : scrollTo(0, 0); return Promise.resolve(); }
    const prev = current ? viewEl(current) : null, next = viewEl(name);
    current = name;
    document.title = name === "home" ? "Pepticity Pure" : `${name[0].toUpperCase() + name.slice(1)} · Pepticity Pure`;
    if (instant || !prev || reduce) {
      VIEWS.forEach(v => (viewEl(v).hidden = v !== name)); scrollTop(); setupView(name); ScrollTrigger.refresh();
      return Promise.resolve();
    }
    busy = true;
    const [x, y] = lastPt || [innerWidth / 2, 90];
    next.hidden = false; next.classList.add("entering");
    const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 40;
    ripple(null, x, y);
    return new Promise(res => {
      gsap.fromTo(next, { clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${R}px at ${x}px ${y}px)`, duration: 0.95, ease: "power3.inOut",
        onComplete: () => {
          prev.hidden = true; next.classList.remove("entering"); gsap.set(next, { clearProps: "clipPath" });
          scrollTop(); setupView(name); ScrollTrigger.refresh(); busy = false; res();
        } });
      gsap.fromTo(prev, { scale: 1, opacity: 1 }, { scale: 0.97, opacity: 0.6, duration: 0.95, ease: "power2.in", clearProps: "transform,opacity" });
    });
  }
  function goto(id) {
    const el = document.getElementById(id); if (!el) return;
    const v = el.closest(".view"); const name = v ? v.dataset.view : current;
    const go = () => { lenis ? lenis.scrollTo(el, { offset: -84, duration: 1.4 }) : el.scrollIntoView(); setTimeout(() => { const f = $("input, select, .q-h, .drop", el); if (f && id !== "process") f.focus({ preventScroll: true }); }, 1200); };
    if (name !== current) { history.pushState(null, "", "#" + name); route(name).then(() => setTimeout(go, 80)); } else go();
  }
  document.addEventListener("click", e => {
    const g = e.target.closest("[data-goto]"); if (g) { e.preventDefault(); goto(g.dataset.goto); return; }
    const h = e.target.closest("[data-href]"); if (h) { location.hash = h.dataset.href; }
  });
  addEventListener("hashchange", () => {
    const h = location.hash.slice(1);
    if (h === "intro") { try { sessionStorage.removeItem("pp-intro"); } catch (e) {} location.reload(); return; }
    route(h);
  });

  // ======================= BOOT =======================
  const startHash = location.hash.slice(1);
  route(VIEWS.includes(startHash) ? startHash : "home", true);
  const savedAud = store.get("pp-aud");
  setAud(AUD[savedAud] ? savedAud : "none", null, true);
  syncPlan(); showStepInit();
  function showStepInit() { $$(".q-step", quiz).forEach(s => (s.hidden = +s.dataset.q !== 1)); $("[data-back]").hidden = true; }

  if (!reduce) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    if (html.classList.contains("intro-lock")) lenis.stop();
  }
  lensApi = initLens(); lensApi.setAudience(html.dataset.aud || "none");
  gsap.ticker.add((time, dt) => { lensApi.tick(dt / 1000); fills.forEach(f => drawFill(f, time)); });

  // photo fallbacks painted on canvas
  document.fonts.ready.then(() => {
    $$(".ph-swirl").forEach(f => (f.style.backgroundImage = `url(${PepArt.swirl()})`));
    PepArt.flatlay().then(u => $$(".ph-flat").forEach(f => (f.style.backgroundImage = `url(${u})`)));
    // repaint renders now that Gloock is in (labels use it)
    ScrollTrigger.refresh();
  });

  let introDone = false;
  function onReady() {
    if (introDone) return; introDone = true;
    lenis && lenis.start();
    if (!reduce && current === "home") {
      gsap.from(".hero-copy > *", { y: 30, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.08, delay: 0.1, clearProps: "all" });
      gsap.from(".drop svg", { y: -60, opacity: 0, duration: 0.9, ease: "bounce.out", stagger: 0.09, delay: 0.5, clearProps: "all" });
    }
    ScrollTrigger.refresh();
  }
  addEventListener("pp:ready", onReady);
  window.PepSite = { ready: onReady, route };
})();
