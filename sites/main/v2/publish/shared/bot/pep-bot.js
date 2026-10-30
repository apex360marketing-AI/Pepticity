/* =====================================================================
   PEPTICITY \u00b7 BOT-P01 \u00b7 SALES CONCIERGE  (v1.0 \u00b7 2026-10-29)
   One include, auto-mounts:   <script src="/shared/bot/pep-bot.js" defer></script>
   It loads pep-bot.css from the same folder by itself. The catalogue, the emblem and every answer
   are inlined, so it runs offline with no API (demo-safe, deterministic).

   STORE MODEL (ledger R055): PEPTICITY is an online store selling the catalogue in
   shared/catalogue.json at exact prices. No clinician, consult, pharmacy or prescription wording.
   Binding rules: docs/owner/SALES-PLAYBOOK.md "WHERE THE LINE IS".
     - never says what a product does, never gives dosing, never mentions sexual function,
       never gives medical advice; emergencies get the emergency line first
     - interest questions answer with "products researched in the context of ..." and the shelf
     - every email or text needs a box the visitor ticks themselves (CASL), never pre-ticked
     - every number shown is real (prices from the catalogue) or a [placeholder]

   Options (script tag data-* attributes, or window.PEPBOT_CONFIG before the script loads):
     data-dock="right|center"      where the slim bar docks (default right)
     data-greet-delay="6000"       ms before the proactive greeting (scroll can trigger it sooner)
     data-sold-out="slug,slug"     real stock from the store: these show SOLD OUT + restock queue
     data-offer="on|off"           COUNSEL_CLEARED.offer (15% offer, quantity breaks, restock alerts)
     data-weight-shelf="on|off"    WEIGHT GOALS shelf (default off until counsel rules, playbook s.3)
     data-catalogue="url"          optional fresh catalogue.json (same shape) to refresh prices
     data-css="url"                override the stylesheet location
     data-surface="light|dark"     force the glass tint (default: read from the host page background)
   Host events (window): pep:add-to-cart, pep:checkout, pep:capture (consent record included).
   If window.PEPCART.add(item) exists it is called too.
   API: PEPBOT.open() .close() .ask(text) .configure(obj) .setBackend(fn) .brain.respond(text)
   ===================================================================== */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PEPBOT = api;
})(typeof window !== 'undefined' ? window : globalThis, function (W) {
  'use strict';
  var D = W.document;
  var VERSION = '1.0.0';

  /* ------------------------------------------------------------------
     1. CATALOGUE (inlined from shared/catalogue.json, fetched 2026-10-29, 36 listings, CAD)
     [slug, family, variant, size shown, price CAD]
     ------------------------------------------------------------------ */
  var ROWS = [
    ['klow-80mg', 'klow', '', '80 MG', 170],
    ['pfizer-bacteriostatic-water-30ml', 'bacwater', '', '30 ML', 30],
    ['retatrutide-10mg', 'retatrutide', '', '10 MG', 135],
    ['thymosin-alpha-1-10mg', 'ta1', '', '10 MG', 90],
    ['tb-500-10mg', 'tb500', '', '10 MG', 90],
    ['bpc-157', 'bpc157', '', '10 MG', 80],
    ['epitalon-10mg', 'epitalon', '', '10 MG', 60],
    ['5-amino-1mq', 'amino1mq', '', '10 MG', 100],
    ['tirzepatide-30mg', 'tirzepatide', '', '30 MG', 275],
    ['glutathione', 'glutathione', '', '1500 MG', 85],
    ['retatrutide-20mg', 'retatrutide', '', '20 MG', 190],
    ['hgh-100iu', 'hgh', '', '100 IU', 200],
    ['epitalon-50', 'epitalon', '', '50 MG', 200],
    ['mots-c-40mg', 'motsc', '', '40 MG', 125],
    ['mots-c-10mg', 'motsc', '', '10 MG', 75],
    ['ghk-cu-100mg', 'ghkcu', '', '100 MG', 100],
    ['ghk-cu-50mg', 'ghkcu', '', '50 MG', 50],
    ['ipamorelin', 'ipamorelin', '', '10 MG', 110],
    ['cjc-1295-no-dac', 'cjc', 'NO DAC', '10 MG', 100],
    ['cjc-1295-with-dac', 'cjc', 'WITH DAC', '5 MG', 100],
    ['wolverine-20mg', 'wolverine', '', '20 MG', 195],
    ['wolverine', 'wolverine', '', '10 MG', 100],
    ['ss-31', 'ss31', '', '10 MG', 75],
    ['semax', 'semax', '', '10 MG', 75],
    ['selank', 'selank', '', '10 MG', 75],
    ['tesamorelin', 'tesamorelin', '', '10 MG', 160],
    ['oxytocin', 'oxytocin', '', '2 MG', 80],
    ['pt-141', 'pt141', '', '10 MG', 50],
    ['nad', 'nad', '', '1000 MG', 190],
    ['kpv', 'kpv', '', '10 MG', 90],
    ['bpc-tb-ghk-cu-glow', 'glow', 'BPC + TB + GHK-CU', '70 MG', 150],
    ['igf-1-lr3', 'igf', '', 'SIZE TBC', 110],
    ['aod-9604', 'aod', '', '5 MG', 65],
    ['tirzepatide', 'tirzepatide', '', '15 MG', 150],
    ['melanotan-2', 'melanotan', '', '10 MG', 50],
    ['retatrutide', 'retatrutide', '', '15 MG', 165]
  ];
  /* family: [name shown, search names (no brand-name medicines: naming one beside a product implies
     "same as"), what it IS (identity only, never what it does)] */
  var FAM = {
    klow: ['KLOW', ['klow'], 'A blend of peptides. [Exact contents: Grace to confirm]'],
    bacwater: ['BACTERIOSTATIC WATER', ['bac water', 'bacteriostatic', 'bacteriostatic water', 'bacwater'], 'Sterile water with a preservative.'],
    retatrutide: ['RETATRUTIDE', ['retatrutide', 'reta', 'retatrutid', 'retatrutides'], 'An investigational compound that is still in clinical trials. Not approved in Canada or the US.'],
    ta1: ['THYMOSIN ALPHA-1', ['thymosin alpha', 'thymosin alpha 1', 'ta1', 'ta 1', 'thymalfasin'], 'Also called thymalfasin. Approved as a medicine in some countries, not in the US. [Canadian status: confirm]'],
    tb500: ['TB-500', ['tb 500', 'tb500', 'tb', 'thymosin beta', 'thymosin beta 4'], 'A lab-made peptide based on part of thymosin beta-4, a protein the body makes.'],
    bpc157: ['BPC-157', ['bpc', 'bpc 157', 'bpc157'], 'A lab-made peptide based on a fragment of a protein found in the stomach.'],
    epitalon: ['EPITALON', ['epitalon', 'epithalon', 'epithalamin', 'epitalone'], 'A lab-made peptide made of four amino acids.'],
    amino1mq: ['5-AMINO-1MQ', ['5 amino 1mq', '5 amino', '5amino', '1mq', 'amino 1mq'], 'A small molecule, not a peptide.'],
    tirzepatide: ['TIRZEPATIDE', ['tirzepatide', 'tirz', 'tirzep', 'terzepatide'], 'A lab-made peptide. It is not a brand-name approved medicine, and PEPTICITY never says it is the same as one.'],
    glutathione: ['GLUTATHIONE', ['glutathione', 'gsh', 'glutathion'], 'A small peptide of three amino acids that the body makes naturally.'],
    hgh: ['HGH', ['hgh', 'growth hormone', 'human growth hormone', 'somatropin'], 'Human growth hormone.'],
    motsc: ['MOTS-C', ['mots c', 'motsc', 'mots'], 'A peptide first found in mitochondria, the parts of cells that make energy.'],
    ghkcu: ['GHK-CU', ['ghk cu', 'ghkcu', 'ghk', 'copper peptide', 'copper peptides'], 'A copper-bound peptide of three amino acids, widely used in cosmetic skin products.'],
    ipamorelin: ['IPAMORELIN', ['ipamorelin', 'ipamoreline', 'ipam'], 'A lab-made peptide in the growth-hormone secretagogue family.'],
    cjc: ['CJC-1295', ['cjc', 'cjc 1295', 'cjc1295', 'mod grf'], 'A lab-made version of growth-hormone-releasing hormone. "DAC" is an add-on that makes it last longer in the body.'],
    wolverine: ['WOLVERINE', ['wolverine', 'wolverine blend'], 'A blend of BPC-157 and TB-500.'],
    ss31: ['SS-31', ['ss 31', 'ss31', 'elamipretide'], 'Also called elamipretide.'],
    semax: ['SEMAX', ['semax'], 'A lab-made peptide developed in Russia, where it is registered as a medicine.'],
    selank: ['SELANK', ['selank'], 'A lab-made peptide developed in Russia, where it is registered as a medicine.'],
    tesamorelin: ['TESAMORELIN', ['tesamorelin'], 'A lab-made peptide in the growth-hormone-releasing hormone family. Not the same as any brand-name medicine.'],
    oxytocin: ['OXYTOCIN', ['oxytocin'], 'A hormone the body makes.'],
    pt141: ['PT-141', ['pt 141', 'pt141', 'bremelanotide'], 'Also called bremelanotide.'],
    nad: ['NAD+', ['nad', 'nad plus', 'nicotinamide adenine dinucleotide'], 'A coenzyme found in every living cell. It is not a peptide.'],
    kpv: ['KPV', ['kpv'], 'A three-amino-acid fragment of a hormone called alpha-MSH.'],
    glow: ['GLOW', ['glow', 'glow blend', 'bpc tb ghk', 'bpc plus tb plus ghk'], 'A blend of BPC-157, TB-500 and GHK-Cu.'],
    igf: ['IGF-1 LR3', ['igf', 'igf 1', 'igf1', 'igf 1 lr3', 'lr3'], 'A lab-made, longer-lasting version of insulin-like growth factor 1.'],
    aod: ['AOD-9604', ['aod', 'aod 9604', 'aod9604'], 'A lab-made fragment of human growth hormone.'],
    melanotan: ['MELANOTAN II', ['melanotan', 'melanotan 2', 'melanotan ii', 'mt2', 'mt 2', 'mt ii', 'tanning peptide'], 'A lab-made version of a hormone involved in skin colour.']
  };
  var WEAK = { glow: 1, tb: 1, mots: 1 }; // common words: an interest in the same sentence wins
  /* Held until counsel / Grace rule (playbook s.3): never on a card, never in a cart. */
  var HELD_DEFAULT = ['hgh', 'melanotan', 'bacwater'];

  /* Interest shelves, from SALES-PLAYBOOK.md section 3 (exact products, no others) */
  var INTEREST = {
    gym: { t: 'GYM AND PERFORMANCE', area: 'growth-hormone biology', tag: 'gym',
      slugs: ['cjc-1295-with-dac', 'cjc-1295-no-dac', 'ipamorelin', 'tesamorelin', 'igf-1-lr3', 'hgh-100iu'] },
    longevity: { t: '55+ AND LONGEVITY', area: 'ageing biology', tag: '55plus',
      slugs: ['epitalon-10mg', 'epitalon-50', 'mots-c-10mg', 'mots-c-40mg', 'ss-31', 'nad', 'glutathione', 'thymosin-alpha-1-10mg'] },
    energy: { t: 'ENERGY', area: 'cellular energy (mitochondria)', tag: 'energy',
      slugs: ['nad', 'mots-c-10mg', 'mots-c-40mg', 'ss-31', '5-amino-1mq'] },
    weight: { t: 'WEIGHT GOALS', area: 'metabolism', tag: 'weight', gated: 'weightShelf',
      slugs: ['tirzepatide', 'tirzepatide-30mg', 'retatrutide-10mg', 'retatrutide', 'retatrutide-20mg', 'aod-9604', '5-amino-1mq', 'klow-80mg'] },
    recovery: { t: 'RECOVERY', area: 'connective-tissue biology', tag: 'recovery',
      slugs: ['bpc-157', 'tb-500-10mg', 'wolverine', 'wolverine-20mg', 'kpv', 'klow-80mg'] },
    skin: { t: 'SKIN AND HAIR', area: 'skin and hair biology', tag: 'skin',
      slugs: ['ghk-cu-50mg', 'ghk-cu-100mg', 'bpc-tb-ghk-cu-glow', 'glutathione'] },
    sleep: { t: 'SLEEP', area: 'the body clock (circadian rhythm)', tag: 'sleep', thin: true,
      slugs: ['epitalon-10mg', 'epitalon-50'] }
  };
  var INTEREST_ORDER = ['gym', 'longevity', 'energy', 'weight', 'recovery', 'skin', 'sleep'];

  /* ------------------------------------------------------------------
     2. CONFIG + STATE
     ------------------------------------------------------------------ */
  var CFG = {
    dock: 'right', greetDelay: 6000, greetScroll: 0.3,
    soldOut: [], held: HELD_DEFAULT.slice(),
    offer: true,          // COUNSEL_CLEARED.offer. Set false (data-offer="off") until counsel clears the 15%.
    weightShelf: false,   // WEIGHT GOALS shelf held until counsel rules on Schedule A.1 [VERIFY]
    code: 'TEAM15',       // demo code: Grace sets the real one
    phone: '[phone number]', email: '[email address]',
    css: null, catalogue: null
  };
  var STATE = { cart: {}, joined: false, interests: [], greeted: false, open: false };
  var BY_SLUG = {};
  function index() { BY_SLUG = {}; ROWS.forEach(function (r) { BY_SLUG[r[0]] = r; }); }
  index();

  function configure(o) {
    if (!o) return CFG;
    Object.keys(o).forEach(function (k) {
      var v = o[k];
      if (k === 'soldOut' || k === 'held') v = Array.isArray(v) ? v : String(v || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
      if (k === 'offer' || k === 'weightShelf') v = !(v === false || v === 'off' || v === 'false' || v === 0);
      if (k === 'greetDelay') v = +v || 0;
      CFG[k] = v;
    });
    return CFG;
  }
  if (W.COUNSEL_CLEARED && typeof W.COUNSEL_CLEARED.offer === 'boolean') CFG.offer = W.COUNSEL_CLEARED.offer;

  function isHeldFam(f) { return CFG.held.indexOf(f) >= 0; }
  function isSoldOut(slug) { return CFG.soldOut.indexOf(slug) >= 0; }
  function visibleRow(r) { return r && !isHeldFam(r[1]); }
  function money(v) { return '$' + (Math.round(v) === v ? String(v) : v.toFixed(2)); }
  function rowName(r) { return FAM[r[1]][0] + (r[2] && r[1] !== 'glow' ? ' ' + r[2] : ''); }
  function cartLines() {
    return Object.keys(STATE.cart).filter(function (s) { return BY_SLUG[s] && STATE.cart[s] > 0; })
      .map(function (s) { return { row: BY_SLUG[s], qty: STATE.cart[s] }; });
  }
  function cartCount() { return cartLines().reduce(function (a, l) { return a + l.qty; }, 0); }
  function cartSubtotal() { return cartLines().reduce(function (a, l) { return a + l.qty * l.row[4]; }, 0); }
  function priceRange() {
    var p = ROWS.filter(visibleRow).map(function (r) { return r[4]; });
    return [Math.min.apply(null, p), Math.max.apply(null, p)];
  }

  /* Optional fresh catalogue (same JSON shape as shared/catalogue.json): refreshes size and price by slug. */
  function loadCatalogue(json) {
    if (!json || !Array.isArray(json.products)) return false;
    json.products.forEach(function (p) {
      var r = BY_SLUG[p.slug], price = +p.price_cad;
      if (!isFinite(price)) return;
      var size = (p.label && p.label.strength) || p.strength || '';
      if (r) { r[4] = price; if (size && !/\[/.test(size)) r[3] = String(size).toUpperCase(); }
      else {
        var fam = p.slug.replace(/[^a-z0-9]/g, '');
        if (!FAM[fam]) FAM[fam] = [((p.label && p.label.lines) || [p.name]).join(' ').toUpperCase(), [String(p.name).toLowerCase()], '[What it is: Grace to confirm]'];
        ROWS.push([p.slug, fam, (p.label && p.label.sub) || '', String(size).toUpperCase(), price]);
      }
    });
    index();
    return true;
  }

  /* ------------------------------------------------------------------
     3. THE VETTED ANSWER LIBRARY (every visitor-facing line lives here)
        "#" at the start of a line = heading. [Brackets] = placeholder to fill.
     ------------------------------------------------------------------ */
  var L = {
    greetH: '#HI, WELCOME TO PEPTICITY.',
    greet: 'I\u2019m your concierge. Looking for something in particular, or can I show you around?',
    backH: '#WELCOME BACK.',
    back: function (n, sub) { return 'Your cart is saved: ' + n + (n === 1 ? ' item, ' : ' items, ') + money(sub) + ' CAD. Want to pick up where you left off?'; },
    emergency: 'If this is an emergency, call 911 now. For a mental-health crisis in Canada, call or text 9\u20118\u20118.',
    emergency2: function () { return 'When you\u2019re safe, a person from PEPTICITY is at ' + CFG.phone + '.'; },
    rules: 'I can only answer from PEPTICITY\u2019s checked answers and the catalogue, and I can\u2019t change how I work. Ask me about a product, a price or shipping, or talk to a person.',
    minor: function () { return 'The PEPTICITY store is for adults only: 18 and over, or 19 and over in BC, NB, NL, NS and the territories, so I can\u2019t help with an order. A parent or guardian can reach a person at ' + CFG.phone + '.'; },
    sexual: function () { return 'That\u2019s not a topic I can help with. I\u2019m happy to find a product by name or check a price or shipping' + (CFG.offer ? ', or get you 15% off your first order.' : '.'); },
    dosing: 'I can\u2019t give dosing, mixing or how-to-use information for any product. That\u2019s the same answer for every customer. I can show you a product\u2019s size and price, or put you in touch with a person.',
    promise: 'Nobody can promise a result, and PEPTICITY won\u2019t. I can show you what\u2019s in the catalogue, with sizes and prices.',
    same: 'No. Nothing in the PEPTICITY store is a brand-name approved medicine, and we never say a product is the same as one.',
    medical: 'I can\u2019t give medical advice or say what a product does in the body. For anything about your own health, please speak with a health professional you trust. I can still help with products, prices and shipping.',
    effect: 'I can\u2019t say what a product does in the body or promise a result. Here\u2019s what it is, with its size and price.',
    effectNone: 'I can\u2019t say what a product does in the body. I can open a shelf by interest, with every size and price.',
    mood: 'I can\u2019t point you to products for mood, focus or the mind. You can browse the full catalogue, or shop by another interest.',
    recommend: 'I can\u2019t say which product is right for your body, but I can open a shelf by interest. What are you shopping for?',
    unlisted: function (x) { return x + ' isn\u2019t in the PEPTICITY catalogue right now. Want me to tell you if it\u2019s added?'; },
    brand: function (x) { return 'PEPTICITY doesn\u2019t sell brand-name medicines like ' + x + ', and nothing in the store is the same as one. Want to see the full catalogue?'; },
    held: function (x) { return x + ' isn\u2019t available in the PEPTICITY store right now. Want me to tell you if that changes?'; },
    soldOut: function (x) { return CFG.offer ? x + ' is sold out right now. Join the restock list and you\u2019ll hear when the next lot lands.' : x + ' is sold out right now. Leave your email for PEPTICITY news, including restocks.'; },
    found: 'Here\u2019s what I found.',
    identity: function (n, w) { return n + ': ' + w; },
    tailOffer: 'Join the PEPTICITY team and your first order is 15% off.',
    tailJoined: 'Your 15% team discount applies at checkout.',
    prices: function () { var r = priceRange(); return 'Every price is in Canadian dollars, exactly as listed in the store. The catalogue runs from ' + money(r[0]) + ' to ' + money(r[1]) + ' a vial. Tell me a product name, or browse the full list.'; },
    ship: 'Shipping details are being finalised: [ship-to provinces, delivery times, shipping cost and free-shipping threshold: Grace to confirm]. You\u2019ll always see the full price, shipping included, before you pay.',
    offerH: '#GRAND OPENING: 15% OFF YOUR FIRST ORDER.',
    offer: 'Join the PEPTICITY team with your email and the 15% applies to your first order. Tick the box if you\u2019d also like Grace\u2019s monthly letter and first word on restocks.',
    offerJoined: function () { return 'You\u2019re on the PEPTICITY team. Your 15% applies to your first order at checkout. Your code: ' + CFG.code + '.'; },
    joinOffH: '#JOIN THE PEPTICITY TEAM.',
    joinOff: 'Join for Grace\u2019s monthly letter and first word on new lots.',
    person: function () { return 'Happy to connect you with a person. Call ' + CFG.phone + ' or email ' + CFG.email + ', or leave your details below and someone from PEPTICITY will get back to you. [Hours: Grace to confirm]'; },
    who: 'I\u2019m the PEPTICITY concierge, an automated assistant. I\u2019m not a health professional and I can\u2019t give medical advice. I can help with products, prices, shipping and your 15%.',
    peptide: 'A peptide is a short chain of amino acids, the building blocks of proteins. The body makes many of its own.',
    legal: 'Products in the PEPTICITY store are not approved as medicines by Health Canada or the US FDA, and I can\u2019t give legal advice. [Final wording: confirm with counsel]',
    research: 'I can tell you what a product is, its size and its price. I can\u2019t say how anyone uses it.',
    testing: 'Lot certificates will appear on each product once they\u2019re available. [Certificates: Grace to confirm]',
    order: function () { return 'Order lookup arrives with the store. [Order tracking: connects at launch] For now, a person can help at ' + CFG.email + '.'; },
    payment: '[Payment methods: Grace to confirm]. You\u2019ll always see the full price before you pay.',
    returns: function () { return '[Returns and damaged-parcel policy: Grace to confirm]. A person can help at ' + CFG.email + '.'; },
    discreet: '[Packaging: Grace to confirm]. Your details are never sold. [Privacy policy: confirm with counsel]',
    age: 'The PEPTICITY store is for adults: 18 and over, or 19 and over in BC, NB, NL, NS and the territories. Age is confirmed at checkout.',
    thanks: 'You\u2019re welcome. Anything else I can find for you?',
    fallback: 'I don\u2019t have a checked answer for that yet, and I won\u2019t guess. I can help with products, prices, shipping or your 15%, or put you in touch with a person.',
    find: 'Type a product name or a nickname, like BPC, TB-500, NAD or MOTS-C, and I\u2019ll show you the size and price.',
    interestAsk: 'What are you shopping for? Pick an interest and I\u2019ll open that shelf.',
    catalogue: 'Here\u2019s the full PEPTICITY catalogue, A to Z, in Canadian dollars. Tap ADD to put one in your cart.',
    shelf1: function (I) { return 'Here\u2019s the ' + I.t + ' shelf: products researched in the context of ' + I.area + '.'; },
    shelf2: 'I can\u2019t say what any product does for you, but every size and price is below.',
    weightClosed: 'WEIGHT GOALS covers products researched in the context of metabolism. That shelf isn\u2019t open yet. Leave your email and you\u2019ll hear first when it is.',
    sleepThin: 'SLEEP covers products researched in the context of the body clock (circadian rhythm). Right now the catalogue has one: EPITALON. Leave your email for SLEEP news as the shelf grows.',
    cartEmpty: 'Your cart is empty. Want me to open a shelf for you?',
    checkout: 'Checkout opens in the PEPTICITY store: guest checkout, with the full price shown before you pay. [Demo: checkout connects at launch]',
    added: function (r, q) { var n = cartCount(); return 'Added ' + (q > 1 ? q + ' \u00d7 ' : '') + rowName(r) + ' ' + r[3] + '. Your cart: ' + n + (n === 1 ? ' item, ' : ' items, ') + money(cartSubtotal()) + ' CAD.'; },
    preview: 'Preview only: nothing was sent.'
  };

  /* consent wording (CASL: one box per purpose, never pre-ticked) */
  var CONSENT = {
    email: 'Yes, PEPTICITY may email me news, offers and Grace\u2019s monthly letter. I can unsubscribe any time.',
    sms: 'Yes, PEPTICITY may text me news and offers. Message and data rates may apply. Reply STOP to stop.',
    shelf: function (area) { return 'Yes, PEPTICITY may email me the ' + area + ' shelf and occasional news. I can unsubscribe any time.'; },
    restock: function (x) { return 'Yes, PEPTICITY may email me when ' + x + ' is back, plus occasional news. I can unsubscribe any time.'; },
    request: function (x) { return 'Yes, PEPTICITY may email me if ' + x + ' is added, plus occasional news. I can unsubscribe any time.'; },
    person: 'Yes, PEPTICITY may contact me about my question.'
  };

  /* ------------------------------------------------------------------
     4. THE BRAIN (pure: no DOM, same in the page and in Node tests)
     ------------------------------------------------------------------ */
  var LEET = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't' };
  function norm(t) {
    t = String(t == null ? '' : t).slice(0, 400);
    try { t = t.normalize('NFKD').replace(/[\u0300-\u036f]/g, ''); } catch (e) {}
    t = t.replace(/[\u200b-\u200f\u2060\ufeff]/g, '').toLowerCase().replace(/[\u2018\u2019`\u00b4]/g, "'");
    t = t.replace(/\+/g, ' plus ').replace(/%/g, ' percent ').replace(/\$/g, ' dollars ');
    t = t.replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
    return ' ' + t + ' ';
  }
  // a harder view for safety checks: d0se -> dose, d o s e -> dose, dooose -> dose
  function squash(n) {
    var t = n.replace(/([a-z])([013457])(?=[a-z])/g, function (m, a, d) { return a + LEET[d]; });
    t = t.replace(/\b([a-z]) (?=[a-z]\b)/g, '$1');
    return t.replace(/([a-z])\1{2,}/g, '$1');
  }

  var RX = {
    emerg: /(chest pain|heart attack|stroke|can'?t breathe|cannot breathe|not breathing|trouble breathing|short of breath|suicid|kill (my ?self|me)|end (my life|it all)|want to die|wanna die|don'?t want to (live|be here)|no reason to live|can'?t go on|self ?harm|harm(ing)? my ?self|hurt(ing)? my ?self|feel like (hurting|harming|killing|ending)|cut(ting)? my ?self|overdos|took too (many|much)|seizure|unconscious|passed out|fainted|emergency|anaphyla|allergic reaction|throat (is )?(closing|swelling)|severe (allergic|reaction|bleeding)|bleeding (badly|a lot|won'?t stop)|poison)/,
    inject: /(ignore (all |your |the |any )?(previous |prior |above )?(rules|instructions|prompt)|ignore (all |the )?(previous|prior|above)|disregard (your|the|all) (rules|instructions)|forget (your|the|all) (rules|instructions)|system prompt|you are now|pretend (to be|you)|act as (a|an|my)|jailbreak|developer mode|dan mode|role ?play|new instructions|override|bypass)/,
    minor: /(\b(1[0-7]|[1-9]) ?(years? old|yrs? old|yo|y o)\b|\bi'?m (a |only )?(1[0-7]|teen|teenager|minor)\b|\bi am (a |only )?(1[0-7]|teen|teenager|minor)\b|\b(age|aged) 1[0-7]\b|\bunder (18|19|age)\b|\bhigh school(er)?\b|\b(son|daughter|kid|child) (is|who is|he'?s|she'?s) (1[0-7]|[1-9])\b|\bin grade (\d|1[0-2])\b)/,
    sex: /(\bsex\b|\bsexual|\bsexually|libido|erect|erectile|\bed\b|impoten|arous|orgasm|horny|in bed\b|bedroom|intima|aphrodisiac|viagra|cialis|sex drive|\bporn)/,
    dose: /(\bdos(e|es|age|ages|ing)\b|\bhow much (should|do|would|can|to) (i |you |we )?(take|use|inject|run|start|put)|\bhow (many|much) (mg|mcg|iu|units?|ml|cc|clicks|vials?) (should|do|per|a|each|to|for)|\b(mg|mcg|iu|units?|ml) (a|per|each) (day|week|night)\b|\bper (day|week)\b|how often|\binject|needle|syringe|\bpin(ning)?\b|\bsub ?q\b|subcutaneous|intramuscular|reconstitut|\bmix(ing|ed)?\b|\bcycle|\bstack(ing|s)?\b|protocol|regimen|how long (should|do|to|can) (i )?(take|use|run|stay)|when (should|do) i (take|use)|microdos|titrat|loading phase|half ?life)/,
    promise: /(will i lose|lose \d+|\d+ ?(lb|lbs|pounds|kg|kilos)\b|how (fast|quickly|soon) (will|can|do|would) (i|it|you)|how much (weight|fat) (will|can|would)|how long (until|before|till|for) (i see|it works|it kicks|results|it to work)|guarantee|before and after|results (in|after|from))/,
    same: /((same|equivalent|identical) (as|to)|generic|just like|copy of|knock ?off|version of)/,
    med: /(hair loss|balding|alopecia|\bacne\b|eczema|psoriasis|is (it|this|that|they) safe|safe (for|to)|\bsafety\b|side ?effects?|\breaction|interact|my (meds|medication|medications|pills|prescription)|blood thinner|contraindicat|pregnan|breast ?feed|nursing|trying to conceive|my doctor|diagnos|symptom|disease|\bcure|\btreat(s|ment|ing)?\b|\bheal(s|ing)?\b|diabet|cancer|tumou?r|heart (condition|disease|problem)|blood (sugar|pressure)|thyroid|arthritis|injur(y|ies|ed)|\bpain\b|\baches?\b|tendon|ligament|\btorn\b|fracture|anxiety|depress|insomnia|\badhd\b|autoimmune|infection|inflammation|kidney|liver|should i (take|use|try|start)|right for me|ok for me|okay for me|can i take)/,
    effect: /(does (it|this|that|they) (really )?work|will (it|this|that|they) (work|help)|\beffective\b|benefit|what (does|do|will|can) [a-z0-9' ]{1,30} do\b|what('s| is| are) [a-z0-9' ]{1,30} (for|good for|used for)\b|good for\b|used for\b|best (peptide|product|one) for)/,
    identityQ: /(what('s| is| are)|tell me about|info on|information on|explain)/,
    unlisted: /(semaglutide|semiglutide|ozempic|wegovy|rybelsus|mounjaro|zepbound|saxenda|liraglutide|victoza|trulicity|egrifta|vyleesi|zadaxin|genotropin|humatrope|norditropin|omnitrope|sermorelin|kisspeptin|dsip|ghrp ?\d?|hexarelin|ll ?37|follistatin|cagrilintide|slu ?pp ?332|slu ?pp|foxo4|humanin|mk ?677|ibutamoren|dihexa|cerebrolysin|testosterone|\btrt\b|\bhcg\b|peg ?mgf|orforglipron|survodutide|mazdutide)/,
    brands: /^(ozempic|wegovy|rybelsus|mounjaro|zepbound|saxenda|victoza|trulicity|egrifta|vyleesi|zadaxin|genotropin|humatrope|norditropin|omnitrope)$/,
    mood: /\b(focus|memory|brain|mood|stress|calm|cognitive|nootropic|concentrat|anxious)/,
    recommend: /(recommend|suggest|what should i (buy|get|order)|best ?seller|most popular|\bpopular\b|which (one|product|peptide) (should|is best|do you))/,
    interestMenu: /(shop by interest|by interest|\binterests?\b|shelves|shelf)/,
    find: /(find a product|search|look up|looking for a product)/,
    catalogue: /(catalog|catalogue|everything|all (your |the )?products|full list|what do you (have|sell|carry|stock)|what('s| is) available|\bmenu\b|browse|full range|product list|list of)/,
    offer: /(15 percent|fifteen percent|percent off|discount|coupon|promo|\bcode\b|\bdeal\b|\boffer|\bsale\b|cheaper|\bjoin|sign ?up|\bmember|grand opening|save money)/,
    prices: /(\bprices?\b|\bcost|how much|expensive|\bcheap|afford|dollars)/,
    ship: /(\bship|deliver|arriv|how long (to|until|till|before) (i get|it gets|get it|it arrives)|courier|canada post|\bpost\b|tracking number|international|outside canada|\busa\b|united states|\bus\b|america)/,
    person: /(\bperson\b|human|someone|somebody|\bcall me\b|phone|talk to|speak (to|with)|\bagent\b|representative|customer service|\bsupport\b|\bgrace\b|\bowner\b|\bcontact\b)/,
    cart: /(\bcart\b|basket|\bbag\b)/,
    checkout: /(checkout|check out|place (an |my )?order|\bbuy now\b|ready to (buy|order|pay))/,
    order: /(my order|order status|where('s| is) my|track (my )?(order|parcel|package))/,
    payment: /(\bpay\b|payment|credit card|\bvisa\b|mastercard|e ?transfer|interac|crypto|bitcoin|paypal|apple pay)/,
    returns: /(\breturn|refund|exchange|money back|damaged|broken|wrong item|missing item)/,
    discreet: /(discreet|discrete|privacy|private|packaging|plain box|my data)/,
    age: /(age limit|how old|age of majority|id check|\badults?\b)/,
    legal: /(\blegal|allowed|health canada|regulat|approved|\bfda\b|lawful|\blegit)/,
    research: /(research use|research only|research purposes|for research|not for human)/,
    testing: /(\btest(ed|ing|s)?\b|purity|\bcoa\b|certificate|third party|lab report|\bpure\b|quality|\bfake\b|counterfeit)/,
    peptide: /what (is|are) (a )?peptides?\b/,
    who: /(who are you|what are you|are you (a |an )?(bot|robot|ai|human|real|person|doctor|nurse))/,
    greet: /^ (hi|hey|hello|yo|hiya|howdy|good (morning|afternoon|evening)|hi there|hello there)( there)?( pepticity)? $/,
    thanks: /^ (thanks|thank you|thx|ty|cheers|great|ok|okay|perfect|cool|awesome|nice)( so much| very much)?( thanks)? $/,
    help: /^ (help|menu|start|options|what can you do)( me)? $/
  };
  var INTEREST_RX = [
    ['recovery', /(\brecover|repair|rebuild|bounce back|post ?workout|sore after)/],
    ['gym', /(\bgym\b|workout|work out|\btraining\b|\btrain\b|performance|athlet|lifting|\blift\b|bodybuild|muscle|strength|fitness|\bsports?\b|weight ?(lift|train))/],
    ['longevity', /(\b(i'?m|i am|over|aged?|turning|turned) (5[5-9]|[6-9][0-9])\b|\b55 plus|\b5[5-9] plus|\b55\b|senior|older adult|elderly|ageing|aging|longevity|anti ?ag(e|ing)|age well|retire)/],
    ['energy', /(\benergy\b|energi[sz]|\btired\b|fatigue|stamina|mitochondri|vitality)/],
    ['weight', /(\bweight\b|\bfat\b|\bslim|metabolism|metabolic|\bglp ?1\b|appetite|\bbelly\b)/],
    ['skin', /(\bskin\b|\bhair\b|beauty|complexion|wrinkle|radiant|collagen|\bglow(ing)?\b)/],
    ['sleep', /(\bsleep|body clock|circadian|jet ?lag)/]
  ];

  function lev(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 9;
    var m = [], i, j;
    for (i = 0; i <= b.length; i++) m[i] = [i];
    for (j = 0; j <= a.length; j++) m[0][j] = j;
    for (i = 1; i <= b.length; i++) for (j = 1; j <= a.length; j++)
      m[i][j] = b[i - 1] === a[j - 1] ? m[i - 1][j - 1] : Math.min(m[i - 1][j - 1] + 1, m[i][j - 1] + 1, m[i - 1][j] + 1);
    return m[b.length][a.length];
  }
  var NORM_ALIAS = null;
  function aliasTable() {
    if (NORM_ALIAS) return NORM_ALIAS;
    NORM_ALIAS = [];
    Object.keys(FAM).forEach(function (k) {
      FAM[k][1].concat([FAM[k][0]]).forEach(function (a) { var x = norm(a); if (x.trim().length >= 2) NORM_ALIAS.push([k, x, !!WEAK[a]]); });
    });
    return NORM_ALIAS;
  }
  function findFamilies(n, s) {
    var hit = {};
    aliasTable().forEach(function (e) {
      if (n.indexOf(e[1]) >= 0 || s.indexOf(e[1]) >= 0) { if (!hit[e[0]] || !e[2]) hit[e[0]] = { k: e[0], weak: e[2] }; }
    });
    var out = Object.keys(hit).map(function (k) { return hit[k]; });
    if (!out.length) { // typo-tolerant pass on long words (epithalon, tirzapatide, glutathion)
      n.trim().split(' ').forEach(function (tok) {
        if (tok.length < 6) return;
        aliasTable().forEach(function (e) {
          var a = e[1].trim();
          if (a.indexOf(' ') >= 0 || a.length < 6) return;
          if (lev(tok, a) <= (a.length >= 9 ? 2 : 1) && !hit[e[0]]) { hit[e[0]] = { k: e[0], weak: false }; out.push(hit[e[0]]); }
        });
      });
    }
    return out;
  }
  function detectInterest(n) {
    for (var i = 0; i < INTEREST_RX.length; i++) if (INTEREST_RX[i][1].test(n)) {
      return INTEREST_RX[i][0];
    }
    return null;
  }
  function rowsFor(famKeys, n) {
    var rows = ROWS.filter(function (r) { return famKeys.indexOf(r[1]) >= 0 && visibleRow(r); });
    if (n) {
      if (/\b(no|without|w o) dac\b/.test(n)) rows = rows.filter(function (r) { return r[2] !== 'WITH DAC'; });
      else if (/\bwith dac\b/.test(n)) rows = rows.filter(function (r) { return r[2] !== 'NO DAC'; });
      var m = n.match(/\b(\d+) ?(mg|iu|ml)\b/);
      if (m) { var want = m[1] + ' ' + m[2].toUpperCase(), sized = rows.filter(function (r) { return r[3] === want; }); if (sized.length) rows = sized; }
    }
    return rows.sort(function (a, b) { return a[1] === b[1] ? a[4] - b[4] : 0; });
  }
  function words(k) { return ['zero', 'one', 'two', 'three', 'four', 'five'][k] || String(k); }
  function familyLine(f, rows) {
    var name = FAM[f][0];
    if (rows.length === 1) {
      var r = rows[0];
      if (isSoldOut(r[0])) return L.soldOut(rowName(r) + (r[3] === 'SIZE TBC' ? '' : ' ' + r[3]));
      if (r[3] === 'SIZE TBC') return rowName(r) + ' is ' + money(r[4]) + ' CAD. [Vial size: Grace to confirm]';
      return rowName(r) + ' ' + r[3] + ' is ' + money(r[4]) + ' CAD.';
    }
    var parts = rows.map(function (r) { return (r[2] && f === 'cjc' ? r[2] + ' ' : '') + r[3] + ' for ' + money(r[4]) + (isSoldOut(r[0]) ? ' (sold out)' : ''); });
    var last = parts.pop();
    return name + ' comes in ' + words(rows.length) + (f === 'cjc' ? ' versions: ' : ' sizes: ') + parts.join(', ') + ' and ' + last + ' CAD.';
  }
  function tail() { if (!CFG.offer) return null; return STATE.joined ? L.tailJoined : L.tailOffer; }
  function salesChips(extra) {
    var c = (extra || []).slice();
    if (CFG.offer && !STATE.joined) c.push('offer');
    if (cartCount()) c.push('cart');
    c.push('interest');
    return dedupe(c).slice(0, 4);
  }
  function dedupe(a) { var s = {}; return a.filter(function (x) { if (s[x]) return false; s[x] = 1; return true; }); }

  /* the last line of defence: claim words in anything we say swap the reply for the safe fallback */
  var BANNED = /(\btreats?\b|\bcures?\b|\bfix(es)?\b|\bboosts?\b|\bheals?\b|\bburns?\b|\bbuilds? muscle|\breverses?\b|\bhelps with\b|\bhelps? (you |your body )?(lose|burn|sleep better|heal|recover faster)|\bfor (pain|headaches|weight loss)\b|\bfat loss\b|\bmuscle growth\b|\banti-?aging\b|\bpromotes?\b|\benhances?\b|\bguarantee[sd]?\b|\bproven\b|\bmiracle\b|\bclinician|\bpharmac|\bprescri|\bconsult|\bleads?\b|\b\d+ ?(mcg|mg|iu|units?) (a|per|each) (day|week)|\bdaily dose|\blibido\b|\berect)/i;
  function emitCheck(t) { return typeof t === 'string' && !BANNED.test(t.replace(/^#/, '')); }

  function R(kind, lines, x) {
    var out = { kind: kind, lines: lines.filter(Boolean), cards: [], chips: [], form: null, shelf: null, list: null, cart: false, showWhat: false };
    if (x) Object.keys(x).forEach(function (k) { out[k] = x[k]; });
    if (!out.lines.every(emitCheck)) return { kind: 'blocked', lines: [L.fallback], cards: [], chips: ['find', 'person'], form: null, shelf: null, list: null, cart: false };
    return out;
  }
  function T(f) { return typeof f === 'function' ? f() : f; }

  function shelfReply(key) {
    var I = INTEREST[key];
    if (!I) return null;
    if (STATE.interests.indexOf(I.tag) < 0) STATE.interests.push(I.tag);
    if (I.gated && !CFG[I.gated]) return R('interest:' + key, [L.weightClosed], { form: { type: 'interest', interest: key }, chips: ['interest', 'catalogue'] });
    if (I.thin) return R('interest:' + key, [L.sleepThin], { form: { type: 'interest', interest: key }, chips: ['p:epitalon-10mg', 'interest'] });
    var slugs = I.slugs.filter(function (s) { return visibleRow(BY_SLUG[s]); });
    return R('interest:' + key, [L.shelf1(I), L.shelf2], { shelf: { title: I.t, area: I.area }, cards: slugs, chips: salesChips(['mail:' + key]) });
  }
  function productReply(famKeys, n, mode) {
    var lines = [], rows = [], soldOne = null;
    famKeys.forEach(function (f) {
      var fr = rowsFor([f], n);
      if (!fr.length) return;
      rows = rows.concat(fr);
      if (mode === 'identity' || mode === 'effect') lines.push(L.identity(FAM[f][0], FAM[f][2]));
      lines.push(familyLine(f, fr));
      fr.forEach(function (r) { if (isSoldOut(r[0])) soldOne = soldOne || r; });
    });
    if (famKeys.length > 2 && mode !== 'effect') lines = [L.found];
    if (mode === 'effect') lines.unshift(L.effect);
    if (!soldOne) lines.push(tail());
    var chips = soldOne ? ['catalogue', 'interest'] : salesChips();
    STATE.lastProduct = rows.length ? rows[0][0] : null;
    return R(mode === 'effect' ? 'effect' : 'product', lines, { cards: rows.map(function (r) { return r[0]; }), chips: chips, showWhat: mode === 'effect' || mode === 'identity' });
  }
  function catalogueReply() {
    var rows = ROWS.filter(visibleRow).slice().sort(function (a, b) { return rowName(a) < rowName(b) ? -1 : rowName(a) > rowName(b) ? 1 : a[4] - b[4]; });
    return R('catalogue', [L.catalogue], { list: rows.map(function (r) { return r[0]; }), chips: salesChips() });
  }
  function offerReply() {
    if (!CFG.offer) return R('join', [L.joinOffH, L.joinOff], { form: { type: 'join' }, chips: ['interest', 'find'] });
    if (STATE.joined) return R('offer:joined', [L.offerJoined()], { chips: cartCount() ? ['cart', 'checkout'] : ['interest', 'find'] });
    return R('offer', [L.offerH, L.offer], { form: { type: 'join' }, chips: ['interest', 'find'] });
  }
  function cartReply() {
    if (!cartCount()) return R('cart:empty', [L.cartEmpty], { chips: ['interest', 'find', 'catalogue'] });
    return R('cart', [], { cart: true, chips: CFG.offer && !STATE.joined ? ['offer', 'interest'] : ['interest'] });
  }
  function menuReply(first) {
    var back = cartCount() > 0;
    var lines = back ? [L.backH, L.back(cartCount(), cartSubtotal())] : [L.greetH, L.greet];
    var chips = back ? ['cart', 'checkout', 'offer', 'interest'] : ['interest', 'find', 'prices', 'ship', 'offer', 'person'];
    if (!CFG.offer) chips = chips.map(function (c) { return c === 'offer' ? 'join' : c; });
    return R(first ? 'greet' : 'menu', lines, { chips: chips });
  }

  function byIntent(id) {
    var p = id.split(':'), k = p[0], a = p.slice(1).join(':');
    switch (k) {
      case 'menu': return menuReply(false);
      case 'greet': return menuReply(true);
      case 'interest': return R('interest-menu', [L.interestAsk], { chips: INTEREST_ORDER.map(function (x) { return 'i:' + x; }) });
      case 'find': return R('find', [L.find], { chips: ['catalogue', 'interest'] });
      case 'catalogue': return catalogueReply();
      case 'prices': return R('prices', [L.prices()], { chips: salesChips(['catalogue']) });
      case 'ship': return R('ship', [L.ship], { chips: salesChips(['person']) });
      case 'offer': case 'join': return offerReply();
      case 'person': return R('person', [L.person()], { form: { type: 'person' }, chips: ['find', 'interest'] });
      case 'cart': return cartReply();
      case 'checkout': return cartCount() ? R('checkout', [L.checkout], { checkout: true, chips: CFG.offer && !STATE.joined ? ['offer', 'cart'] : ['cart'] }) : cartReply();
      case 'i': return shelfReply(a) || menuReply(false);
      case 'p': { var r = BY_SLUG[a]; if (!r || !visibleRow(r)) return menuReply(false); return productReply([r[1]], ' ' + r[3].toLowerCase().replace(' ', '') + ' ' + (r[2] ? r[2].toLowerCase() : '') + ' ', 'identity'); }
      case 'mail': { var I = INTEREST[a]; return I ? R('mail', ['Leave your email and I\u2019ll send you the ' + I.t + ' shelf.'], { form: { type: 'interest', interest: a }, chips: [] }) : menuReply(false); }
      case 'restock': { var rr = BY_SLUG[a]; return rr ? R('restock', [L.soldOut(rowName(rr))], { form: { type: 'restock', slug: a }, chips: ['catalogue'] }) : menuReply(false); }
      case 'notify': return R('notify', ['Leave your email and I\u2019ll tell you if ' + a + ' is added.'], { form: { type: 'request', name: a }, chips: ['catalogue'] });
    }
    return menuReply(false);
  }
  function cap(x) { return x.replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); }); }

  /* respond(text | {intent}) -> { kind, lines, cards, chips, form, shelf, list, cart, showWhat } */
  function respond(input) {
    if (input && typeof input === 'object' && input.intent) return byIntent(input.intent);
    var n = norm(input), s = squash(n), both = n + '|' + s;
    if (!n.trim()) return R('empty', []);
    // safety first, in a fixed order; nothing commercial outranks these
    if (RX.emerg.test(both)) return R('emergency', [L.emergency, L.emergency2()], { chips: ['person'], safety: true });
    if (RX.inject.test(both)) return R('rules', [L.rules], { chips: ['find', 'prices', 'person'] });
    if (RX.minor.test(both)) return R('minor', [L.minor()], { chips: ['person'] });
    if (RX.sex.test(both)) return R('sexual', [L.sexual()], { chips: ['find', 'interest', CFG.offer ? 'offer' : 'join'] });
    if (RX.dose.test(both)) return R('dosing', [L.dosing], { chips: ['find', 'prices', 'person'] });
    if (RX.promise.test(both)) return R('promise', [L.promise], { chips: ['interest', 'find', 'person'] });
    var fams = findFamilies(n, s), um = n.match(RX.unlisted);
    if (RX.same.test(both) && (um || fams.length || /(medicine|brand|approved)/.test(n))) return R('same', [L.same], { chips: ['catalogue', 'person'] });
    var held = fams.filter(function (f) { return isHeldFam(f.k); });
    fams = fams.filter(function (f) { return !isHeldFam(f.k); });
    if (RX.med.test(both)) return R('medical', [L.medical], { chips: fams.length ? ['p:' + rowsFor([fams[0].k])[0][0], 'person'] : ['interest', 'person'] });
    var interest = detectInterest(n);
    var allWeak = fams.length && fams.every(function (f) { return f.weak; });
    if (allWeak && interest) fams = [];
    var keys = fams.map(function (f) { return f.k; });
    if (RX.effect.test(both)) {
      if (keys.length) return productReply(keys, n, 'effect');
      if (interest) return shelfReply(interest);
      return R('effect', [L.effectNone], { chips: INTEREST_ORDER.slice(0, 4).map(function (x) { return 'i:' + x; }) });
    }
    if (um) {
      var nm = um[0].trim(), isBrand = RX.brands.test(nm.replace(/\s/g, ''));
      var disp = nm.toUpperCase();
      if (isBrand) return R('brand', [L.brand(cap(nm))], { chips: ['catalogue', 'interest'] });
      if (keys.length) { var pr = productReply(keys, n); pr.lines.unshift(L.unlisted(disp)); return pr; }
      return R('unlisted', [L.unlisted(disp)], { chips: ['notify:' + disp, 'catalogue', 'interest'] });
    }
    if (held.length && !keys.length) { var hn = FAM[held[0].k][0]; return R('held', [L.held(hn)], { chips: ['notify:' + hn, 'catalogue'] }); }
    if (keys.length) return productReply(keys, n, RX.identityQ.test(n) && !RX.prices.test(n) ? 'identity' : null);
    if (interest) return shelfReply(interest);
    if (RX.mood.test(n)) return R('mood', [L.mood], { chips: ['catalogue', 'interest'] });
    if (RX.peptide.test(n)) return R('peptide', [L.peptide], { chips: ['catalogue', 'interest'] });
    if (RX.who.test(n)) return R('who', [L.who], { chips: ['find', 'interest', 'person'] });
    if (RX.recommend.test(n)) return R('recommend', [L.recommend], { chips: INTEREST_ORDER.map(function (x) { return 'i:' + x; }) });
    if (RX.research.test(n)) return R('research', [L.research], { chips: ['catalogue', 'person'] });
    if (RX.legal.test(n)) return R('legal', [L.legal], { chips: ['catalogue', 'person'] });
    if (RX.testing.test(n)) return R('testing', [L.testing], { chips: ['catalogue', 'person'] });
    if (RX.checkout.test(n)) return byIntent('checkout');
    if (RX.cart.test(n)) return byIntent('cart');
    if (RX.order.test(n)) return R('order', [L.order()], { chips: ['person'] });
    if (RX.offer.test(n)) return offerReply();
    if (RX.ship.test(n)) return byIntent('ship');
    if (RX.returns.test(n)) return R('returns', [L.returns()], { chips: ['person'] });
    if (RX.payment.test(n)) return R('payment', [L.payment], { chips: salesChips() });
    if (RX.discreet.test(n)) return R('discreet', [L.discreet], { chips: salesChips() });
    if (RX.age.test(n)) return R('age', [L.age], { chips: salesChips() });
    if (RX.interestMenu.test(n)) return byIntent('interest');
    if (RX.catalogue.test(n)) return catalogueReply();
    if (RX.find.test(n)) return byIntent('find');
    if (RX.prices.test(n)) return byIntent('prices');
    if (RX.person.test(n)) return byIntent('person');
    if (RX.greet.test(n) || RX.help.test(n)) return menuReply(false);
    if (RX.thanks.test(n)) return R('thanks', [L.thanks], { chips: salesChips(['find']) });
    return R('fallback', [L.fallback], { chips: ['find', 'interest', 'offer', 'person'].map(function (c) { return c === 'offer' && !CFG.offer ? 'join' : c; }) });
  }

  // release check: every fixed line in the library must pass the claim scan
  var libBad = [];
  Object.keys(L).forEach(function (k) {
    var v = L[k];
    if (typeof v === 'string' && !emitCheck(v)) libBad.push(k);
  });
  Object.keys(FAM).forEach(function (k) { if (!emitCheck(FAM[k][2])) libBad.push('fam.' + k); });

  /* ------------------------------------------------------------------
     5. LIVE AI BACKEND HOOK  (OFF. Leave null for the offline vetted demo.)
     ------------------------------------------------------------------
     PEPBOT.setBackend(async function (text, context) {
        // context = { history:[{who,text}], cart:[{slug,qty}], interests:[...], catalogue:ROWS }
        // return { lines:['...'], cards:['slug'], chips:['find'] }   (or null to keep the vetted answer)
     });
     Rules this hook keeps no matter what the backend says:
       - it is ONLY asked when the vetted brain has no answer (kind 'fallback'); emergency, rules,
         minors, sexual, dosing, medical, effect, sameness and every product/price answer never reach it
       - every returned line passes emitCheck(); one bad line and the vetted fallback is shown instead
       - cards must be catalogue slugs that are not held; prices always come from the catalogue
       - 8 s timeout, then the vetted fallback
     ------------------------------------------------------------------ */
  var BACKEND = null;
  function setBackend(fn) { BACKEND = typeof fn === 'function' ? fn : null; }
  function viaBackend(text, reply, history) {
    if (!BACKEND || reply.kind !== 'fallback') return Promise.resolve(reply);
    var ctx = { history: history.slice(-12), cart: cartLines().map(function (l) { return { slug: l.row[0], qty: l.qty }; }), interests: STATE.interests.slice(), catalogue: ROWS.filter(visibleRow) };
    var timer = new Promise(function (res) { setTimeout(function () { res(null); }, 8000); });
    return Promise.race([Promise.resolve().then(function () { return BACKEND(text, ctx); }), timer]).then(function (b) {
      if (!b || !Array.isArray(b.lines) || !b.lines.length || !b.lines.every(emitCheck)) return reply;
      var cards = (b.cards || []).filter(function (s) { return visibleRow(BY_SLUG[s]); });
      return R('backend', b.lines.map(String), { cards: cards, chips: (b.chips || reply.chips).slice(0, 4) });
    }, function () { return reply; });
  }

  var API = {
    version: VERSION, configure: configure, setBackend: setBackend, loadCatalogue: loadCatalogue,
    brain: { respond: respond, norm: norm, squash: squash, emitCheck: emitCheck, libBad: libBad, rows: ROWS, fam: FAM, interests: INTEREST, state: STATE, cfg: CFG, L: L, consent: CONSENT },
    open: function () {}, close: function () {}, ask: function () {}
  };
  if (!D) return API;

  /* ------------------------------------------------------------------
     6. UI  (docked slim glass bar -> proactive peek -> tall glass panel on a matte black base)
     ------------------------------------------------------------------ */
  var SCRIPT = D.currentScript;
  var REDUCED = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LS = { get: function (k, d) { try { var v = W.localStorage.getItem('pepbot:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { W.localStorage.setItem('pepbot:' + k, JSON.stringify(v)); } catch (e) {} } };
  var SS = { get: function (k) { try { return W.sessionStorage.getItem('pepbot:' + k); } catch (e) { return null; } },
    set: function (k, v) { try { W.sessionStorage.setItem('pepbot:' + k, v); } catch (e) {} } };

  (function readConfig() {
    var pre = W.PEPBOT_CONFIG || {};
    var ds = SCRIPT ? SCRIPT.dataset : {};
    var map = { dock: ds.dock, greetDelay: ds.greetDelay, soldOut: ds.soldOut, offer: ds.offer, weightShelf: ds.weightShelf, catalogue: ds.catalogue, css: ds.css, phone: ds.phone, email: ds.email, code: ds.code, held: ds.held, surface: ds.surface };
    Object.keys(map).forEach(function (k) { if (map[k] == null) delete map[k]; });
    configure(pre); configure(map);
  })();
  STATE.cart = LS.get('cart', {}) || {};
  if (typeof STATE.cart !== 'object' || Array.isArray(STATE.cart)) STATE.cart = {};   /* stored data is untrusted: whole-number quantities only */
  Object.keys(STATE.cart).forEach(function (s) { var n = parseInt(STATE.cart[s], 10); if (n > 0 && n < 1000) STATE.cart[s] = n; else delete STATE.cart[s]; });
  STATE.joined = !!LS.get('joined', false);
  STATE.interests = LS.get('interests', []) || [];
  if (!Array.isArray(STATE.interests)) STATE.interests = [];

  var EMBLEM = '<svg class="pb-em" viewBox="-1.04 -1.04 2.08 2.08" focusable="false"><defs><linearGradient id="__ID__g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f6f8"/><stop offset=".46" stop-color="#b9bec5"/><stop offset=".54" stop-color="#6b7077"/><stop offset="1" stop-color="#e6e9ed"/></linearGradient><linearGradient id="__ID__s" gradientUnits="userSpaceOnUse" x1="-1" y1="-1" x2="1" y2="1"><stop offset=".38" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".95"/><stop offset=".62" stop-color="#fff" stop-opacity="0"/><animateTransform attributeName="gradientTransform" type="translate" values="-2 -2;2 2;2 2" keyTimes="0;.42;1" dur="6s" repeatCount="indefinite"/></linearGradient></defs><g class="pb-em__ring"><path fill-rule="evenodd" fill="url(#__ID__g)" d="M1.0 0 A1.0 1.0 0 1 0 -1.0 0 A1.0 1.0 0 1 0 1.0 0ZM0.935 0 A0.935 0.935 0 1 1 -0.935 0 A0.935 0.935 0 1 1 0.935 0ZM0.655 0 A0.655 0.655 0 1 0 -0.655 0 A0.655 0.655 0 1 0 0.655 0ZM0.62 0 A0.62 0.62 0 1 1 -0.62 0 A0.62 0.62 0 1 1 0.62 0Z"/><path fill="url(#__ID__g)" d="M-0.6564 -0.4873 L-0.5827 -0.4212 L-0.5606 -0.4458 L-0.6098 -0.4898 L-0.5619 -0.5434 L-0.5580 -0.5493 L-0.5563 -0.5525 L-0.5537 -0.5590 L-0.5521 -0.5659 L-0.5515 -0.5729 L-0.5519 -0.5800 L-0.5525 -0.5835 L-0.5543 -0.5903 L-0.5571 -0.5968 L-0.5609 -0.6028 L-0.5654 -0.6082 L-0.5706 -0.6129 L-0.5735 -0.6150 L-0.5797 -0.6185 L-0.5862 -0.6210 L-0.5931 -0.6226 L-0.6001 -0.6233 L-0.6072 -0.6229 L-0.6141 -0.6215 L-0.6208 -0.6191 L-0.6270 -0.6159 L-0.6328 -0.6117 L-0.6378 -0.6068 L-0.7055 -0.5314 L-0.6605 -0.5321 L-0.6133 -0.5848 L-0.6106 -0.5872 L-0.6086 -0.5884 L-0.6054 -0.5897 L-0.6031 -0.5901 L-0.6007 -0.5903 L-0.5984 -0.5901 L-0.5950 -0.5891 L-0.5928 -0.5881 L-0.5900 -0.5861 L-0.5876 -0.5834 L-0.5864 -0.5814 L-0.5851 -0.5782 L-0.5846 -0.5759 L-0.5846 -0.5723 L-0.5849 -0.5700 L-0.5861 -0.5667 L-0.5873 -0.5646 L-0.5887 -0.5628 L-0.6326 -0.5138 L-0.6342 -0.5117 L-0.6343 -0.5119ZM-0.3952 -0.6360 L-0.4535 -0.5959 L-0.4600 -0.5514 L-0.3513 -0.6263ZM-0.4514 -0.7176 L-0.4449 -0.7621 L-0.5536 -0.6872 L-0.5096 -0.6775ZM-0.4319 -0.6909 L-0.4917 -0.6497 L-0.4959 -0.6268 L-0.4730 -0.6226 L-0.4132 -0.6638 L-0.4089 -0.6867ZM-0.3622 -0.7328 L-0.3268 -0.6404 L-0.2959 -0.6523 L-0.3196 -0.7139 L-0.2525 -0.7398 L-0.2464 -0.7432 L-0.2435 -0.7453 L-0.2382 -0.7499 L-0.2336 -0.7553 L-0.2299 -0.7613 L-0.2270 -0.7677 L-0.2259 -0.7711 L-0.2245 -0.7780 L-0.2240 -0.7851 L-0.2246 -0.7921 L-0.2262 -0.7990 L-0.2287 -0.8056 L-0.2303 -0.8087 L-0.2342 -0.8146 L-0.2389 -0.8199 L-0.2443 -0.8245 L-0.2502 -0.8283 L-0.2567 -0.8311 L-0.2635 -0.8331 L-0.2705 -0.8340 L-0.2775 -0.8339 L-0.2845 -0.8329 L-0.2913 -0.8308 L-0.3859 -0.7945 L-0.3455 -0.7746 L-0.2795 -0.8000 L-0.2760 -0.8009 L-0.2737 -0.8011 L-0.2702 -0.8007 L-0.2679 -0.8001 L-0.2658 -0.7991 L-0.2638 -0.7979 L-0.2612 -0.7955 L-0.2598 -0.7936 L-0.2581 -0.7905 L-0.2572 -0.7871 L-0.2570 -0.7847 L-0.2574 -0.7812 L-0.2580 -0.7790 L-0.2596 -0.7758 L-0.2610 -0.7739 L-0.2635 -0.7715 L-0.2655 -0.7702 L-0.2676 -0.7692 L-0.3290 -0.7456 L-0.3314 -0.7445 L-0.3314 -0.7447ZM-0.0250 -0.8830 L-0.1786 -0.8651 L-0.1443 -0.8359 L-0.0516 -0.8467ZM-0.1138 -0.8343 L-0.0991 -0.7083 L-0.0663 -0.7121 L-0.0810 -0.8381ZM0.0270 -0.7147 L0.0600 -0.7127 L0.0700 -0.8774 L0.0371 -0.8794ZM0.2786 -0.8381 L0.1892 -0.8596 L0.1851 -0.8604 L0.1809 -0.8610 L0.1767 -0.8612 L0.1725 -0.8611 L0.1683 -0.8608 L0.1641 -0.8601 L0.1600 -0.8592 L0.1560 -0.8579 L0.1521 -0.8564 L0.1483 -0.8546 L0.1446 -0.8525 L0.1411 -0.8502 L0.1378 -0.8476 L0.1347 -0.8448 L0.1317 -0.8418 L0.1290 -0.8386 L0.1265 -0.8352 L0.1243 -0.8316 L0.1223 -0.8279 L0.1206 -0.8240 L0.1192 -0.8201 L0.1181 -0.8160 L0.1063 -0.7661 L0.1057 -0.7619 L0.1055 -0.7577 L0.1056 -0.7535 L0.1059 -0.7493 L0.1066 -0.7451 L0.1076 -0.7410 L0.1088 -0.7370 L0.1103 -0.7331 L0.1121 -0.7293 L0.1142 -0.7256 L0.1165 -0.7221 L0.1191 -0.7188 L0.1219 -0.7157 L0.1249 -0.7127 L0.1281 -0.7100 L0.1315 -0.7076 L0.1351 -0.7053 L0.1388 -0.7034 L0.1427 -0.7017 L0.1466 -0.7003 L0.1507 -0.6991 L0.2401 -0.6777 L0.2180 -0.7169 L0.1502 -0.7332 L0.1465 -0.7348 L0.1443 -0.7363 L0.1423 -0.7382 L0.1398 -0.7413 L0.1381 -0.7450 L0.1374 -0.7476 L0.1370 -0.7516 L0.1373 -0.7543 L0.1519 -0.8152 L0.1532 -0.8190 L0.1545 -0.8213 L0.1562 -0.8234 L0.1592 -0.8261 L0.1615 -0.8276 L0.1653 -0.8290 L0.1679 -0.8295 L0.1706 -0.8297 L0.1746 -0.8291 L0.2411 -0.8132ZM0.2698 -0.6624 L0.3000 -0.6492 L0.3658 -0.8005 L0.3355 -0.8137ZM0.5475 -0.6933 L0.4182 -0.7781 L0.4257 -0.7337 L0.5037 -0.6825ZM0.4481 -0.7128 L0.3785 -0.6068 L0.4061 -0.5887 L0.4757 -0.6947ZM0.5753 -0.5457 L0.5178 -0.4933 L0.5400 -0.4689 L0.5976 -0.5213 L0.5995 -0.5191 L0.7055 -0.5322 L0.6794 -0.5609 L0.5734 -0.5479ZM0.6080 -0.5574 L0.6226 -0.6234 L0.5964 -0.6521 L0.5746 -0.5532ZM-0.6318 0.4653 L-0.7055 0.5314 L-0.6835 0.5559 L-0.6343 0.5119 L-0.5863 0.5653 L-0.5808 0.5698 L-0.5779 0.5718 L-0.5716 0.5751 L-0.5650 0.5774 L-0.5581 0.5788 L-0.5510 0.5792 L-0.5475 0.5790 L-0.5405 0.5779 L-0.5338 0.5758 L-0.5274 0.5727 L-0.5215 0.5688 L-0.5162 0.5641 L-0.5139 0.5615 L-0.5098 0.5558 L-0.5065 0.5495 L-0.5041 0.5429 L-0.5027 0.5359 L-0.5024 0.5289 L-0.5030 0.5218 L-0.5046 0.5150 L-0.5072 0.5084 L-0.5107 0.5022 L-0.5150 0.4967 L-0.5827 0.4212 L-0.5868 0.4660 L-0.5396 0.5187 L-0.5375 0.5216 L-0.5365 0.5237 L-0.5356 0.5271 L-0.5354 0.5294 L-0.5355 0.5318 L-0.5359 0.5341 L-0.5372 0.5374 L-0.5385 0.5394 L-0.5408 0.5420 L-0.5437 0.5441 L-0.5458 0.5451 L-0.5492 0.5460 L-0.5516 0.5462 L-0.5551 0.5459 L-0.5574 0.5453 L-0.5605 0.5437 L-0.5624 0.5424 L-0.5641 0.5407 L-0.6080 0.4918 L-0.6099 0.4900 L-0.6098 0.4898ZM-0.4514 0.7176 L-0.5096 0.6775 L-0.5536 0.6872 L-0.4449 0.7621ZM-0.3952 0.6360 L-0.3513 0.6263 L-0.4600 0.5514 L-0.4535 0.5959ZM-0.4132 0.6638 L-0.4730 0.6226 L-0.4959 0.6268 L-0.4917 0.6497 L-0.4319 0.6909 L-0.4089 0.6867ZM-0.3504 0.7020 L-0.3859 0.7945 L-0.3551 0.8063 L-0.3314 0.7447 L-0.2643 0.7703 L-0.2574 0.7719 L-0.2539 0.7723 L-0.2468 0.7724 L-0.2398 0.7714 L-0.2330 0.7695 L-0.2266 0.7666 L-0.2235 0.7649 L-0.2178 0.7607 L-0.2128 0.7558 L-0.2085 0.7501 L-0.2051 0.7440 L-0.2025 0.7374 L-0.2016 0.7340 L-0.2005 0.7270 L-0.2005 0.7199 L-0.2014 0.7129 L-0.2033 0.7061 L-0.2062 0.6997 L-0.2100 0.6937 L-0.2146 0.6883 L-0.2198 0.6836 L-0.2257 0.6798 L-0.2321 0.6768 L-0.3268 0.6404 L-0.3100 0.6822 L-0.2440 0.7076 L-0.2408 0.7092 L-0.2389 0.7106 L-0.2366 0.7132 L-0.2353 0.7152 L-0.2344 0.7174 L-0.2337 0.7196 L-0.2334 0.7231 L-0.2336 0.7255 L-0.2345 0.7289 L-0.2361 0.7320 L-0.2375 0.7339 L-0.2401 0.7363 L-0.2421 0.7375 L-0.2454 0.7388 L-0.2477 0.7393 L-0.2512 0.7394 L-0.2535 0.7391 L-0.2558 0.7384 L-0.3172 0.7148 L-0.3197 0.7141 L-0.3196 0.7139ZM-0.0059 0.7191 L-0.1595 0.7013 L-0.1329 0.7376 L-0.0402 0.7484ZM-0.1035 0.7462 L-0.1182 0.8722 L-0.0854 0.8760 L-0.0707 0.7500ZM0.0371 0.8794 L0.0700 0.8774 L0.0600 0.7127 L0.0270 0.7147ZM0.2401 0.6777 L0.1507 0.6991 L0.1466 0.7003 L0.1427 0.7017 L0.1388 0.7034 L0.1351 0.7053 L0.1315 0.7076 L0.1281 0.7100 L0.1249 0.7127 L0.1219 0.7157 L0.1191 0.7188 L0.1165 0.7221 L0.1142 0.7256 L0.1121 0.7293 L0.1103 0.7331 L0.1088 0.7370 L0.1076 0.7410 L0.1066 0.7451 L0.1059 0.7493 L0.1056 0.7535 L0.1055 0.7577 L0.1057 0.7619 L0.1063 0.7661 L0.1071 0.7702 L0.1192 0.8201 L0.1206 0.8240 L0.1223 0.8279 L0.1243 0.8316 L0.1265 0.8352 L0.1290 0.8386 L0.1317 0.8418 L0.1347 0.8448 L0.1378 0.8476 L0.1411 0.8502 L0.1446 0.8525 L0.1483 0.8546 L0.1521 0.8564 L0.1560 0.8579 L0.1600 0.8592 L0.1641 0.8601 L0.1683 0.8608 L0.1725 0.8611 L0.1767 0.8612 L0.1809 0.8610 L0.1851 0.8604 L0.1892 0.8596 L0.2786 0.8381 L0.2411 0.8132 L0.1733 0.8294 L0.1693 0.8296 L0.1666 0.8293 L0.1640 0.8286 L0.1603 0.8269 L0.1571 0.8244 L0.1553 0.8224 L0.1532 0.8190 L0.1522 0.8165 L0.1376 0.7556 L0.1370 0.7516 L0.1372 0.7489 L0.1377 0.7463 L0.1392 0.7425 L0.1406 0.7402 L0.1433 0.7372 L0.1454 0.7356 L0.1477 0.7342 L0.1515 0.7329 L0.2180 0.7169ZM0.3355 0.8137 L0.3658 0.8005 L0.3000 0.6492 L0.2698 0.6624ZM0.4569 0.5554 L0.3277 0.6402 L0.3714 0.6510 L0.4494 0.5998ZM0.3994 0.6388 L0.4690 0.7448 L0.4966 0.7267 L0.4270 0.6206ZM0.5823 0.5520 L0.6399 0.6044 L0.6621 0.5799 L0.6045 0.5276 L0.6065 0.5254 L0.5835 0.4211 L0.5573 0.4499 L0.5803 0.5542ZM0.5676 0.5206 L0.5005 0.5123 L0.4743 0.5411 L0.5749 0.5535ZM0.8255 -0.0000 L0.7975 0.0280 L0.7695 0.0000 L0.7975 -0.0280ZM-0.8255 -0.0000 L-0.7975 -0.0280 L-0.7695 -0.0000 L-0.7975 0.0280Z"/></g><path class="pb-em__p" fill="url(#__ID__g)" d="M-0.3380 -0.0740 L-0.3380 0.3700 L-0.1900 0.3700 L-0.1900 0.0740 L0.1324 0.0735 L0.1637 0.0689 L0.1791 0.0650 L0.2087 0.0539 L0.2365 0.0388 L0.2619 0.0198 L0.2843 -0.0026 L0.2943 -0.0150 L0.3114 -0.0417 L0.3246 -0.0704 L0.3335 -0.1009 L0.3380 -0.1321 L0.3380 -0.1639 L0.3363 -0.1796 L0.3296 -0.2106 L0.3185 -0.2402 L0.3033 -0.2680 L0.2843 -0.2934 L0.2619 -0.3158 L0.2365 -0.3348 L0.2087 -0.3499 L0.1791 -0.3610 L0.1482 -0.3678 L0.1166 -0.3700 L-0.3380 -0.3700 L-0.2006 -0.2220 L0.1166 -0.2220 L0.1323 -0.2203 L0.1424 -0.2173 L0.1565 -0.2103 L0.1650 -0.2039 L0.1725 -0.1964 L0.1788 -0.1880 L0.1859 -0.1739 L0.1889 -0.1638 L0.1905 -0.1480 L0.1889 -0.1322 L0.1859 -0.1221 L0.1788 -0.1080 L0.1725 -0.0996 L0.1608 -0.0888 L0.1520 -0.0831 L0.1374 -0.0770 L0.1271 -0.0747 L0.1166 -0.0740 L-0.1784 -0.0740 L-0.1900 -0.0729 L-0.1900 -0.0740Z"/><path class="pb-em__sheen" fill="url(#__ID__s)" d="M-0.3380 -0.0740 L-0.3380 0.3700 L-0.1900 0.3700 L-0.1900 0.0740 L0.1324 0.0735 L0.1637 0.0689 L0.1791 0.0650 L0.2087 0.0539 L0.2365 0.0388 L0.2619 0.0198 L0.2843 -0.0026 L0.2943 -0.0150 L0.3114 -0.0417 L0.3246 -0.0704 L0.3335 -0.1009 L0.3380 -0.1321 L0.3380 -0.1639 L0.3363 -0.1796 L0.3296 -0.2106 L0.3185 -0.2402 L0.3033 -0.2680 L0.2843 -0.2934 L0.2619 -0.3158 L0.2365 -0.3348 L0.2087 -0.3499 L0.1791 -0.3610 L0.1482 -0.3678 L0.1166 -0.3700 L-0.3380 -0.3700 L-0.2006 -0.2220 L0.1166 -0.2220 L0.1323 -0.2203 L0.1424 -0.2173 L0.1565 -0.2103 L0.1650 -0.2039 L0.1725 -0.1964 L0.1788 -0.1880 L0.1859 -0.1739 L0.1889 -0.1638 L0.1905 -0.1480 L0.1889 -0.1322 L0.1859 -0.1221 L0.1788 -0.1080 L0.1725 -0.0996 L0.1608 -0.0888 L0.1520 -0.0831 L0.1374 -0.0770 L0.1271 -0.0747 L0.1166 -0.0740 L-0.1784 -0.0740 L-0.1900 -0.0729 L-0.1900 -0.0740Z"/></svg>';

  function el(tag, cls, text, attrs) {
    var e = D.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }
  function richText(node, line) { // [placeholders] get their own quiet style
    line.split(/(\[[^\]]+\])/).forEach(function (part) {
      if (!part) return;
      if (part.charAt(0) === '[') node.appendChild(el('span', 'pb-ph', part));
      else node.appendChild(D.createTextNode(part));
    });
    return node;
  }
  function btn(label, cls, attrs) {
    var b = el('button', 'pc-btn ' + (cls || ''), null, Object.assign({ type: 'button' }, attrs || {}));
    var f = el('span', 'pc-btn__face'); f.appendChild(el('span', 'pc-btn__label', label)); b.appendChild(f);
    return b;
  }
  function emblem(size) {
    var w = el('span', 'pb-emblem', null, { 'aria-hidden': 'true' });
    w.style.setProperty('--s', size + 'px');
    w.innerHTML = EMBLEM.replace(/__ID__/g, 'pbe' + Math.random().toString(36).slice(2, 7));
    if (REDUCED) w.querySelectorAll('animate,animateTransform').forEach(function (a) { a.remove(); });
    return w;
  }
  /* silver hairline that follows the chamfered cut, with a light that travels around it */
  function edge(host, c) {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('class', 'pb-edge'); svg.setAttribute('aria-hidden', 'true');
    var gid = 'pbs' + Math.random().toString(36).slice(2, 7);
    svg.innerHTML = '<defs><linearGradient id="' + gid + '" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".28" stop-color="#b9bec5" stop-opacity=".55"/>' +
      '<stop offset=".55" stop-color="#6b7077" stop-opacity=".45"/><stop offset=".8" stop-color="#e6e9ed" stop-opacity=".8"/><stop offset="1" stop-color="#8d939b" stop-opacity=".5"/></linearGradient></defs>' +
      '<polygon class="pb-edge__line" fill="none" stroke="url(#' + gid + ')" stroke-width="1"/><polygon class="pb-edge__glint" fill="none" stroke-width="1.6"/>';
    host.appendChild(svg);
    function draw() {
      var w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
      var pts = [[c, .5], [w - .5, .5], [w - .5, h - c], [w - c, h - .5], [.5, h - .5], [.5, c]].map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      svg.querySelectorAll('polygon').forEach(function (p) { p.setAttribute('points', pts); });
      var per = 2 * (w + h) - 4 * c + 2 * Math.SQRT2 * c;
      svg.style.setProperty('--per', per.toFixed(0));
    }
    if (W.ResizeObserver) new ResizeObserver(draw).observe(host); else W.addEventListener('resize', draw);
    draw();
    return svg;
  }

  function hostIsLight() {
    var els = [D.body, D.documentElement];
    for (var i = 0; i < els.length; i++) {
      var m = getComputedStyle(els[i]).backgroundColor.match(/[\d.]+/g);
      if (m && (m.length < 4 || +m[3] > 0.5)) return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) > 150;
    }
    return true; // transparent all the way down = the browser's white
  }
  function loadCss() {
    if (D.querySelector('link[data-pepbot]')) return;
    var href = CFG.css;
    if (!href && SCRIPT && SCRIPT.src) href = SCRIPT.src.replace(/pep-bot(\.min)?\.js(\?.*)?$/, 'pep-bot.css');
    if (!href) return;
    var l = el('link', null, null, { rel: 'stylesheet', href: href, 'data-pepbot': '1' });
    D.head.appendChild(l);
  }

  var UI = {}, HISTORY = [];

  function mount() {
    if (UI.root) return;
    loadCss();
    var root = el('div', 'pb-root pb-dock-' + (CFG.dock === 'center' ? 'center' : 'right'));
    root.setAttribute('data-state', 'docked');
    if (REDUCED) root.classList.add('pb-reduced');
    // light host pages (the white PEPTICITY version): deepen the smoke in the glass so white text keeps its contrast
    if (CFG.surface === 'light' || (CFG.surface !== 'dark' && hostIsLight())) root.classList.add('pb-on-light');

    /* -- peek (proactive greeting) -- */
    var peek = el('div', 'pb-peek', null, { role: 'region', 'aria-label': 'PEPTICITY concierge greeting', 'aria-hidden': 'true' });
    var peekIn = el('div', 'pb-peek__in');
    var peekX = el('button', 'pb-x pb-x--sm', null, { type: 'button', 'aria-label': 'Dismiss greeting' });
    peekIn.appendChild(peekX);
    UI.peekText = el('div', 'pb-peek__text');
    UI.peekChips = el('div', 'pb-chips pb-chips--wrap');
    peekIn.appendChild(UI.peekText); peekIn.appendChild(UI.peekChips);
    peek.appendChild(peekIn); edge(peek, 12);

    /* -- the slim docked bar -- */
    var bar = el('div', 'pb-bar', null, { role: 'button', tabindex: '0', 'aria-label': 'Open the PEPTICITY concierge', 'aria-expanded': 'false' });
    var barIn = el('div', 'pb-bar__in');
    barIn.appendChild(emblem(34));
    var bt = el('div', 'pb-bar__text');
    bt.appendChild(el('div', 'pb-bar__title', 'PEPTICITY CONCIERGE'));
    UI.hint = el('div', 'pb-bar__hint', 'HOW CAN I HELP?');
    bt.appendChild(UI.hint); barIn.appendChild(bt);
    UI.barCart = el('span', 'pb-bar__cart', '', { 'aria-live': 'polite' });
    barIn.appendChild(UI.barCart);
    var open = el('span', 'pb-bar__open', null, { 'aria-hidden': 'true' }); open.appendChild(el('i'));
    barIn.appendChild(open);
    bar.appendChild(barIn); edge(bar, 10);

    /* -- the tall panel -- */
    var panel = el('section', 'pb-panel', null, { role: 'dialog', 'aria-label': 'PEPTICITY concierge', 'aria-hidden': 'true' });
    var glass = el('div', 'pb-panel__glass');
    var head = el('header', 'pb-head');
    head.appendChild(emblem(46));
    var ht = el('div', 'pb-head__text');
    ht.appendChild(el('div', 'pb-head__word', 'PEPTICITY'));
    var st = el('div', 'pb-head__status'); st.appendChild(el('i', 'pb-dot')); st.appendChild(D.createTextNode('CONCIERGE \u00b7 HERE 24/7'));
    ht.appendChild(st); head.appendChild(ht);
    UI.cartBtn = el('button', 'pb-iconbtn pb-cartbtn', null, { type: 'button', 'aria-label': 'View cart' });
    UI.cartBtn.appendChild(el('span', 'pb-cartbtn__l', 'CART'));
    UI.cartN = el('span', 'pb-cartbtn__n', '0'); UI.cartBtn.appendChild(UI.cartN);
    head.appendChild(UI.cartBtn);
    var close = el('button', 'pb-x', null, { type: 'button', 'aria-label': 'Close the concierge' });
    head.appendChild(close);
    glass.appendChild(head);
    glass.appendChild(el('div', 'pb-rule', null, { 'aria-hidden': 'true' }));
    UI.log = el('div', 'pb-log', null, { role: 'log', 'aria-live': 'polite', 'aria-relevant': 'additions', tabindex: '0' });
    glass.appendChild(UI.log);
    panel.appendChild(glass);

    var base = el('div', 'pb-base');
    var form = el('form', 'pb-ask', null, { autocomplete: 'off' });
    var menu = el('button', 'pb-iconbtn pb-menu', null, { type: 'button', 'aria-label': 'Show the menu' });
    menu.appendChild(el('i')); menu.appendChild(el('i')); menu.appendChild(el('i'));
    form.appendChild(menu);
    UI.input = el('input', 'pb-input', null, { type: 'text', maxlength: '300', 'aria-label': 'Ask the PEPTICITY concierge', placeholder: 'Ask about a product, price or shipping', enterkeyhint: 'send' });
    form.appendChild(UI.input);
    var send = btn('SEND', 'pc-btn--sm pb-send', { type: 'submit' });
    form.appendChild(send);
    base.appendChild(form);
    base.appendChild(el('div', 'pb-fine', 'Automated \u00b7 Not medical advice \u00b7 Prices in CAD'));
    panel.appendChild(base);
    edge(panel, 16);

    root.appendChild(peek); root.appendChild(bar); root.appendChild(panel);
    D.body.appendChild(root);
    UI.root = root; UI.peek = peek; UI.bar = bar; UI.panel = panel;

    /* events */
    bar.addEventListener('click', function () { openPanel(); });
    bar.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPanel(); } });
    close.addEventListener('click', closePanel);
    peekX.addEventListener('click', function (e) { e.stopPropagation(); hidePeek(); });
    UI.cartBtn.addEventListener('click', function () { userSays('VIEW CART', { intent: 'cart' }); });
    menu.addEventListener('click', function () { userSays('MENU', { intent: 'menu' }); });
    form.addEventListener('submit', function (e) { e.preventDefault(); var v = UI.input.value.trim(); if (!v) return; UI.input.value = ''; userSays(v, v); });
    D.addEventListener('keydown', function (e) { if (e.key === 'Escape' && STATE.open) { closePanel(); } });
    root.addEventListener('click', onRootClick);

    updateCartUi();
    rotateHints();
    scheduleGreet();
    if (CFG.catalogue && W.fetch) W.fetch(CFG.catalogue).then(function (r) { return r.json(); }).then(loadCatalogue).catch(function () {});
  }

  /* bar hint rotation (ambient) */
  function rotateHints() {
    var hints = ['HOW CAN I HELP?', 'FIND A PRODUCT OR A PRICE', CFG.offer ? '15% OFF YOUR FIRST ORDER' : 'JOIN THE PEPTICITY TEAM', 'SHOP BY INTEREST'];
    var i = 0;
    if (REDUCED) return;
    setInterval(function () {
      if (STATE.open || D.hidden) return;
      i = (i + 1) % hints.length;
      UI.hint.classList.add('is-out');
      setTimeout(function () { UI.hint.textContent = cartCount() && i === 2 ? 'YOUR CART IS SAVED' : hints[i]; UI.hint.classList.remove('is-out'); }, 380);
    }, 3800);
  }

  /* proactive greeting: after a short delay or once the visitor scrolls, once per session */
  function scheduleGreet() {
    if (SS.get('greeted')) return;
    var fired = false;
    function fire() { if (fired) return; fired = true; W.removeEventListener('scroll', onScroll); showPeek(); }
    function onScroll() {
      var max = D.documentElement.scrollHeight - W.innerHeight;
      if (W.scrollY > 600 || (max > 0 && W.scrollY / max > CFG.greetScroll)) fire();
    }
    W.addEventListener('scroll', onScroll, { passive: true });
    setTimeout(fire, Math.max(800, CFG.greetDelay));
  }
  function showPeek() {
    if (STATE.open || SS.get('greeted')) return;
    SS.set('greeted', '1');
    var g = menuReply(true);
    UI.peekText.innerHTML = '';
    g.lines.forEach(function (l) { UI.peekText.appendChild(l.charAt(0) === '#' ? el('div', 'pb-h', l.slice(1)) : richText(el('p', 'pb-p'), l)); });
    UI.peekChips.innerHTML = '';
    g.chips.forEach(function (c) { UI.peekChips.appendChild(chip(c)); });
    UI.peek.setAttribute('aria-hidden', 'false');
    UI.root.setAttribute('data-state', 'peek');
  }
  function hidePeek() { UI.peek.setAttribute('aria-hidden', 'true'); if (!STATE.open) UI.root.setAttribute('data-state', 'docked'); }

  function openPanel() {
    if (!UI.root) mount();
    if (STATE.open) return;
    STATE.open = true; SS.set('greeted', '1');
    UI.peek.setAttribute('aria-hidden', 'true');
    UI.panel.setAttribute('aria-hidden', 'false');
    UI.bar.setAttribute('aria-expanded', 'true');
    UI.root.setAttribute('data-state', 'open');
    if (!UI.log.childNodes.length) botSays(menuReply(true), true);
    setTimeout(function () { if (W.matchMedia('(hover:hover)').matches) UI.input.focus({ preventScroll: true }); }, REDUCED ? 0 : 420);
  }
  function closePanel() {
    if (!STATE.open) return;
    STATE.open = false;
    UI.panel.setAttribute('aria-hidden', 'true');
    UI.bar.setAttribute('aria-expanded', 'false');
    UI.root.setAttribute('data-state', 'docked');
    UI.bar.focus({ preventScroll: true });
  }

  /* chips: chamfered glass quick replies (BTN-P01 small) */
  var CHIP = {
    interest: 'SHOP BY INTEREST', find: 'FIND A PRODUCT', prices: 'PRICES', ship: 'SHIPPING', offer: '15% OFF', join: 'JOIN THE TEAM',
    person: 'TALK TO A PERSON', catalogue: 'SEE THE FULL CATALOGUE', cart: 'VIEW CART', checkout: 'CHECKOUT', menu: 'MENU'
  };
  function chipLabel(id) {
    var p = id.split(':'), k = p[0], a = p.slice(1).join(':');
    if (CHIP[id]) return id === 'offer' && STATE.joined ? 'MY 15% CODE' : CHIP[id];
    if (k === 'i') return INTEREST[a] ? INTEREST[a].t : a;
    if (k === 'p') return BY_SLUG[a] ? 'SEE ' + FAM[BY_SLUG[a][1]][0] : a;
    if (k === 'mail') return 'EMAIL ME THIS SHELF';
    if (k === 'restock') return CFG.offer ? 'TELL ME WHEN IT\u2019S BACK' : 'SEND ME PEPTICITY NEWS';
    if (k === 'notify') return 'TELL ME IF IT\u2019S ADDED';
    return id.toUpperCase();
  }
  function chip(id) {
    var b = btn(chipLabel(id), 'pc-btn--sm pb-chip' + (/^p:/.test(id) ? ' pb-chip--p' : ''), { 'data-chip': id });
    return b;
  }

  function onRootClick(e) {
    var t = e.target.closest('[data-chip],[data-add],[data-what],[data-qty],[data-go]');
    if (!t || !UI.root.contains(t)) return;
    if (t.hasAttribute('data-chip')) {
      var id = t.getAttribute('data-chip');
      if (!STATE.open) openPanel();
      userSays(chipLabel(id), { intent: id });
    } else if (t.hasAttribute('data-add')) {
      addToCart(t.getAttribute('data-add'), +t.getAttribute('data-n') || 1, t);
    } else if (t.hasAttribute('data-what')) {
      var card = t.closest('.pb-card'); var open = card.classList.toggle('is-what');
      t.setAttribute('aria-expanded', open ? 'true' : 'false');
    } else if (t.hasAttribute('data-qty')) {
      var s = t.getAttribute('data-qty'), d = +t.getAttribute('data-d');
      STATE.cart[s] = Math.max(0, (STATE.cart[s] || 0) + d); if (!STATE.cart[s]) delete STATE.cart[s];
      LS.set('cart', STATE.cart); updateCartUi(); refreshCarts();
    } else if (t.hasAttribute('data-go')) {
      var go = t.getAttribute('data-go');
      if (go === 'checkout') doCheckout();
    }
  }

  function userSays(label, input) {
    if (!UI.root) mount();
    if (!STATE.open) openPanel();
    var m = el('div', 'pb-msg pb-msg--you');
    m.appendChild(el('p', 'pb-p', label));
    UI.log.appendChild(m); scrollLog();
    requestAnimationFrame(function () { m.classList.add('is-in'); });
    HISTORY.push({ who: 'visitor', text: label });
    var reply = respond(input);
    if (reply.kind === 'empty') return;
    typing(reply.lines.join(' ').length, function () {
      viaBackend(label, reply, HISTORY).then(function (r) { botSays(r); });
    });
  }
  var typingEl = null;
  function typing(len, done) {
    if (typingEl) typingEl.remove();
    typingEl = el('div', 'pb-typing', null, { 'aria-label': 'Concierge is typing' });
    typingEl.appendChild(el('i')); typingEl.appendChild(el('i')); typingEl.appendChild(el('i'));
    UI.log.appendChild(typingEl); scrollLog();
    setTimeout(function () { if (typingEl) { typingEl.remove(); typingEl = null; } done(); }, REDUCED ? 120 : Math.min(1100, 380 + len * 3));
  }
  function scrollLog() { UI.log.scrollTop = UI.log.scrollHeight; }

  function botSays(r, instant) {
    var m = el('div', 'pb-msg pb-msg--bot' + (r.kind === 'emergency' ? ' pb-msg--alert' : ''));
    m.setAttribute('data-kind', r.kind);
    r.lines.forEach(function (l) { m.appendChild(l.charAt(0) === '#' ? el('h3', 'pb-h', l.slice(1)) : richText(el('p', 'pb-p'), l)); });
    if (r.shelf) {
      var sh = el('div', 'pb-shelf');
      sh.appendChild(el('div', 'pb-shelf__t', r.shelf.title));
      sh.appendChild(el('div', 'pb-shelf__a', 'Researched in the context of ' + r.shelf.area));
      m.appendChild(sh);
    }
    if (r.cards && r.cards.length) {
      var wrap = el('div', r.cards.length > 2 ? 'pb-cards pb-cards--rail' : 'pb-cards');
      r.cards.forEach(function (s, i) { var c = card(s, r.showWhat && r.cards.length <= 2); if (c) { c.style.setProperty('--i', i); wrap.appendChild(c); } });
      m.appendChild(wrap);
      if (r.cards.length > 2) m.appendChild(el('div', 'pb-railhint', 'SWIPE FOR MORE \u2192'));
    }
    if (r.list) m.appendChild(list(r.list));
    if (r.cart) m.appendChild(cartView());
    if (r.form) m.appendChild(capture(r.form));
    if (r.checkout) doCheckout(true);
    if (r.chips && r.chips.length) {
      var cr = el('div', 'pb-chips');
      r.chips.forEach(function (c) { cr.appendChild(chip(c)); });
      m.appendChild(cr);
    }
    if (instant) m.classList.add('is-in');
    UI.log.appendChild(m);
    requestAnimationFrame(function () { m.classList.add('is-in'); });
    HISTORY.push({ who: 'concierge', text: r.lines.join(' '), kind: r.kind });
    scrollLog();
    setTimeout(scrollLog, 60);
  }

  function card(slug, whatOpen) {
    var r = BY_SLUG[slug]; if (!visibleRow(r)) return null;
    var f = FAM[r[1]], sold = isSoldOut(slug);
    var c = el('article', 'pb-card' + (sold ? ' is-sold' : '') + (whatOpen ? ' is-what' : ''), null, { 'data-slug': slug });
    var top = el('div', 'pb-card__top');
    top.appendChild(el('h4', 'pb-card__name', f[0]));
    if (sold) top.appendChild(el('span', 'pb-sold', 'SOLD OUT'));
    c.appendChild(top);
    c.appendChild(el('div', 'pb-card__size', (r[2] ? r[2] + ' \u00b7 ' : '') + r[3]));
    var pr = el('div', 'pb-card__price'); pr.appendChild(D.createTextNode(money(r[4]))); pr.appendChild(el('span', null, ' CAD'));
    c.appendChild(pr);
    var what = el('p', 'pb-card__what'); richText(what, f[2]); c.appendChild(what);
    var acts = el('div', 'pb-card__acts');
    if (sold) acts.appendChild(btn(CFG.offer ? 'TELL ME WHEN IT\u2019S BACK' : 'SEND ME NEWS', 'pc-btn--sm pc-btn--block', { 'data-chip': 'restock:' + slug }));
    else acts.appendChild(btn('ADD TO CART', 'pc-btn--sm pb-add', { 'data-add': slug, 'aria-label': 'Add ' + f[0] + ' ' + r[3] + ' to cart' }));
    acts.appendChild(el('button', 'pb-what', 'WHAT IT IS', { type: 'button', 'data-what': '1', 'aria-expanded': whatOpen ? 'true' : 'false' }));
    c.appendChild(acts);
    if (CFG.offer && !sold) {
      var qb = el('div', 'pb-card__qb');
      qb.appendChild(richText(el('span'), '3 VIALS \u00b7 SAVE [X%]'));
      var a3 = el('button', 'pb-add3', 'ADD 3', { type: 'button', 'data-add': slug, 'data-n': '3', 'aria-label': 'Add 3 of ' + f[0] + ' ' + r[3] });
      qb.appendChild(a3); c.appendChild(qb);
    }
    return c;
  }
  function list(slugs) {
    var ul = el('ul', 'pb-list');
    slugs.forEach(function (s) {
      var r = BY_SLUG[s], sold = isSoldOut(s), li = el('li', 'pb-list__row');
      var nm = el('button', 'pb-list__name', null, { type: 'button', 'data-chip': 'p:' + s });
      nm.appendChild(el('b', null, FAM[r[1]][0])); nm.appendChild(el('span', null, (r[2] && r[1] === 'cjc' ? r[2] + ' \u00b7 ' : '') + r[3]));
      li.appendChild(nm);
      li.appendChild(el('span', 'pb-list__price', money(r[4])));
      if (sold) li.appendChild(el('button', 'pb-list__add is-sold', 'SOLD OUT', { type: 'button', 'data-chip': 'restock:' + s }));
      else li.appendChild(el('button', 'pb-list__add', 'ADD', { type: 'button', 'data-add': s, 'aria-label': 'Add ' + FAM[r[1]][0] + ' ' + r[3] + ' to cart' }));
      ul.appendChild(li);
    });
    return ul;
  }

  function cartView() {
    var box = el('div', 'pb-cart');
    fillCart(box);
    return box;
  }
  function fillCart(box) {
    box.innerHTML = '';
    box.appendChild(el('h4', 'pb-cart__t', 'YOUR CART'));
    var lines = cartLines();
    if (!lines.length) { box.appendChild(el('p', 'pb-p', L.cartEmpty)); return; }
    lines.forEach(function (l) {
      var row = el('div', 'pb-cart__row');
      var nm = el('div', 'pb-cart__name'); nm.appendChild(el('b', null, rowName(l.row))); nm.appendChild(el('span', null, l.row[3] + ' \u00b7 ' + money(l.row[4])));
      row.appendChild(nm);
      var q = el('div', 'pb-qty');
      q.appendChild(el('button', null, '\u2212', { type: 'button', 'data-qty': l.row[0], 'data-d': '-1', 'aria-label': 'One fewer' }));
      q.appendChild(el('span', null, String(l.qty)));
      q.appendChild(el('button', null, '+', { type: 'button', 'data-qty': l.row[0], 'data-d': '1', 'aria-label': 'One more' }));
      row.appendChild(q);
      row.appendChild(el('div', 'pb-cart__sum', money(l.qty * l.row[4])));
      box.appendChild(row);
    });
    var sub = cartSubtotal();
    var tot = el('div', 'pb-cart__tot');
    function line(a, b, cls) { var d = el('div', 'pb-cart__line ' + (cls || '')); d.appendChild(el('span', null, a)); var v = el('span'); richText(v, b); d.appendChild(v); tot.appendChild(d); }
    line('SUBTOTAL', money(sub) + ' CAD');
    if (CFG.offer && STATE.joined) line('PEPTICITY TEAM \u00b7 15% OFF FIRST ORDER', '\u2212' + money(Math.round(sub * 15) / 100), 'is-disc');
    line('SHIPPING', '$[X]');
    line('TAX EST.', '$[X]');
    line('TOTAL', money(CFG.offer && STATE.joined ? Math.round(sub * 85) / 100 : sub) + ' + shipping and tax', 'is-total');
    box.appendChild(tot);
    box.appendChild(el('div', 'pb-cart__free', null)).appendChild(richText(el('span'), '$[X] TO FREE SHIPPING'));
    var go = btn('CHECKOUT', 'pc-btn--block pb-checkout', { 'data-go': 'checkout' });
    box.appendChild(go);
  }
  function refreshCarts() { UI.log.querySelectorAll('.pb-cart').forEach(fillCart); }

  function updateCartUi() {
    var n = cartCount();
    UI.cartN.textContent = String(n);
    UI.cartBtn.classList.toggle('has-items', n > 0);
    UI.barCart.textContent = n ? 'CART ' + n : '';
    UI.barCart.classList.toggle('is-on', n > 0);
  }
  var addTimer = null, addPending = null;
  function addToCart(slug, q, src) {
    var r = BY_SLUG[slug]; if (!visibleRow(r) || isSoldOut(slug)) return;
    STATE.cart[slug] = (STATE.cart[slug] || 0) + q;
    LS.set('cart', STATE.cart);
    updateCartUi(); refreshCarts();
    UI.cartBtn.classList.remove('is-pulse'); void UI.cartBtn.offsetWidth; UI.cartBtn.classList.add('is-pulse');
    if (src) {
      var lab = src.querySelector('.pc-btn__label') || src, old = lab.textContent;
      src.classList.add('is-added'); lab.textContent = 'ADDED';
      setTimeout(function () { src.classList.remove('is-added'); lab.textContent = old; }, 1500);
    }
    var item = { slug: slug, name: rowName(r), size: r[3], price: r[4], currency: 'CAD', qty: q, source: 'concierge' };
    try { W.dispatchEvent(new CustomEvent('pep:add-to-cart', { detail: item })); } catch (e) {}
    if (W.PEPCART && typeof W.PEPCART.add === 'function') { try { W.PEPCART.add(item); } catch (e) {} }
    // the salesman follow-up (one message even if several taps land together)
    addPending = { r: r, q: q };
    clearTimeout(addTimer);
    addTimer = setTimeout(function () {
      var p = addPending; addPending = null;
      var lines = [L.added(p.r, p.q)];
      if (CFG.offer && !STATE.joined) lines.push('Join the PEPTICITY team before you check out and this order is 15% off.');
      else if (CFG.offer) lines.push(L.tailJoined);
      lines.push('Anything else I can find for you?');
      botSays(R('added', lines, { chips: CFG.offer && !STATE.joined ? ['offer', 'checkout', 'cart'] : ['checkout', 'cart', 'interest'] }));
    }, 650);
  }
  function doCheckout(silent) {
    var detail = { items: cartLines().map(function (l) { return { slug: l.row[0], qty: l.qty, price: l.row[4] }; }), subtotal: cartSubtotal(), currency: 'CAD', teamDiscount: CFG.offer && STATE.joined };
    try { W.dispatchEvent(new CustomEvent('pep:checkout', { detail: detail })); } catch (e) {}
    if (!silent) userSays('CHECKOUT', { intent: 'checkout' });
  }

  /* capture forms: one email field first, optional phone, unticked boxes (CASL), preview-only */
  function capture(f) {
    var I = f.interest ? INTEREST[f.interest] : null, r = f.slug ? BY_SLUG[f.slug] : null;
    var cfg = {
      join: { t: CFG.offer ? 'JOIN THE PEPTICITY TEAM' : 'JOIN THE PEPTICITY TEAM', b: CFG.offer ? 'GET MY 15%' : 'JOIN THE TEAM', box: CONSENT.email, phone: true, need: false },
      interest: { t: I ? (I.gated || I.thin ? 'SEND ME ' + I.t + ' NEWS' : 'SEND ME THE ' + I.t + ' SHELF') : '', b: I && (I.gated || I.thin) ? 'SEND ME ' + I.t + ' NEWS' : 'SEND ME THE SHELF', box: I ? CONSENT.shelf(I.t.toLowerCase().replace('55+ and ', '55+ and ')) : '', need: true },
      restock: { t: CFG.offer ? 'TELL ME WHEN IT\u2019S BACK' : 'PEPTICITY NEWS', b: CFG.offer ? 'ADD ME TO THE LIST' : 'SEND ME NEWS', box: r ? (CFG.offer ? CONSENT.restock(rowName(r)) : CONSENT.email) : '', need: true },
      request: { t: 'TELL ME IF IT\u2019S ADDED', b: 'TELL ME', box: CONSENT.request(f.name || 'it'), need: true },
      person: { t: 'ASK A PERSON TO GET BACK TO ME', b: 'REQUEST A REPLY', box: CONSENT.person, phone: true, need: false, either: true }
    }[f.type];
    var form = el('form', 'pb-form', null, { novalidate: 'novalidate' });
    form.appendChild(el('div', 'pb-form__t', cfg.t));
    var id = 'pbf' + Math.random().toString(36).slice(2, 7);
    var em = el('input', 'pb-field', null, { type: 'email', autocomplete: 'email', inputmode: 'email', placeholder: 'Email address', 'aria-label': 'Email address', id: id + 'e' });
    form.appendChild(em);
    var ph = null, smsWrap = null, smsBox = null;
    if (cfg.phone) {
      ph = el('input', 'pb-field', null, { type: 'tel', autocomplete: 'tel', inputmode: 'tel', placeholder: f.type === 'person' ? 'Phone number' : 'Phone (optional)', 'aria-label': 'Phone number' });
      form.appendChild(ph);
    }
    function box(text, bid) {
      var lab = el('label', 'pb-check', null, { for: bid });
      var cb = el('input', null, null, { type: 'checkbox', id: bid });
      lab.appendChild(cb); lab.appendChild(el('span', 'pb-check__box', null, { 'aria-hidden': 'true' })); lab.appendChild(el('span', 'pb-check__t', text));
      return { lab: lab, cb: cb };
    }
    var b1 = box(cfg.box, id + 'c'); form.appendChild(b1.lab);
    if (cfg.phone && f.type === 'join') {
      var b2 = box(CONSENT.sms, id + 's'); smsWrap = b2.lab; smsBox = b2.cb; smsWrap.hidden = true; form.appendChild(smsWrap);
      ph.addEventListener('input', function () { smsWrap.hidden = !ph.value.trim(); });
    }
    var err = el('div', 'pb-form__err', '', { role: 'alert' });
    form.appendChild(err);
    var sub = btn(cfg.b, 'pc-btn--block pb-form__go', { type: 'submit' });
    form.appendChild(sub);
    form.appendChild(richText(el('div', 'pb-form__fine'), L.preview + ' [Sender name and mailing address: Grace to add]'));
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = em.value.trim(), phone = ph ? ph.value.trim() : '';
      var okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email), okPhone = /^[+()\d\s.-]{7,}$/.test(phone);
      if (cfg.either ? !(okEmail || okPhone) : !okEmail) { err.textContent = cfg.either ? 'Add an email or a phone number so we can reach you.' : 'That email doesn\u2019t look right. Check it and try again.'; (okEmail ? ph : em).focus(); return; }
      if (cfg.need && !b1.cb.checked) { err.textContent = 'Tick the box so PEPTICITY is allowed to email you.'; b1.cb.focus(); return; }
      if (phone && !okPhone) { err.textContent = 'That phone number doesn\u2019t look right.'; ph.focus(); return; }
      err.textContent = '';
      var now = new Date().toISOString();
      var payload = {
        hook: 'BOT-' + f.type.toUpperCase(), at: now, page: W.location ? W.location.pathname : '',
        email: okEmail ? email : null, phone: okPhone ? phone : null,
        tags: STATE.interests.slice().concat(I ? [I.tag] : []).filter(function (x, i, a) { return a.indexOf(x) === i; }),
        product: r ? r[0] : (f.name || null),
        consent: {
          email: { given: b1.cb.checked, text: cfg.box, at: now },
          sms: smsBox ? { given: smsBox.checked && !!phone, text: CONSENT.sms, at: now } : null
        },
        preview: true
      };
      var q = LS.get('captures', []); if (!Array.isArray(q)) q = []; q.push(payload); LS.set('captures', q.slice(-50));
      LS.set('interests', STATE.interests);
      try { W.dispatchEvent(new CustomEvent('pep:capture', { detail: payload })); } catch (e2) {}
      form.classList.add('is-done');
      var done = el('div', 'pb-form__done', null, { role: 'status' });
      if (f.type === 'join') {
        STATE.joined = true; LS.set('joined', true); refreshCarts();
        if (CFG.offer) {
          done.appendChild(el('div', 'pb-form__t', 'WELCOME TO THE PEPTICITY TEAM.'));
          var code = el('div', 'pb-code'); code.appendChild(el('span', null, 'YOUR 15% CODE')); code.appendChild(el('b', null, CFG.code)); done.appendChild(code);
          done.appendChild(richText(el('p', 'pb-p'), 'It applies to your first order at checkout. [Demo code: Grace sets the real one and its end date]'));
        } else done.appendChild(el('div', 'pb-form__t', 'WELCOME TO THE PEPTICITY TEAM.'));
        if (!b1.cb.checked) done.appendChild(el('p', 'pb-p pb-mute', 'You didn\u2019t tick the box, so we won\u2019t send you news.'));
      } else if (f.type === 'restock') {
        done.appendChild(el('div', 'pb-form__t', 'YOU\u2019RE ON THE LIST.'));
        done.appendChild(richText(el('p', 'pb-p'), 'We\u2019ll email you when ' + rowName(r) + ' is back. [Your real place in line shows here once the store is live]'));
      } else if (f.type === 'person') {
        done.appendChild(el('div', 'pb-form__t', 'THANK YOU.'));
        done.appendChild(richText(el('p', 'pb-p'), 'Someone from PEPTICITY will get back to you. [Reply time: Grace to confirm]'));
      } else {
        done.appendChild(el('div', 'pb-form__t', 'YOU\u2019RE ON THE LIST.'));
        done.appendChild(el('p', 'pb-p', 'Thank you. Watch your inbox.'));
      }
      done.appendChild(el('p', 'pb-form__fine', L.preview));
      form.parentNode.insertBefore(done, form.nextSibling);
      form.remove();
      setTimeout(function () {
        var next = f.type === 'join' ? (cartCount() ? ['cart', 'checkout'] : ['interest', 'find']) : salesChips();
        botSays(R('next', ['Anything else I can help you with?'], { chips: next }));
      }, 700);
    });
    return form;
  }

  API.open = function () { if (!UI.root) mount(); openPanel(); };
  API.close = function () { closePanel(); };
  API.ask = function (text) { if (!UI.root) mount(); userSays(String(text), String(text)); };
  API.chip = function (id) { if (!UI.root) mount(); userSays(chipLabel(id), { intent: id }); };
  API.reset = function () { STATE.cart = {}; STATE.joined = false; STATE.interests = []; LS.set('cart', {}); LS.set('joined', false); LS.set('interests', []); try { W.sessionStorage.removeItem('pepbot:greeted'); } catch (e) {} if (UI.log) UI.log.innerHTML = ''; if (UI.root) updateCartUi(); };
  API.cart = function () { return cartLines().map(function (l) { return { slug: l.row[0], qty: l.qty, price: l.row[4] }; }); };
  API.peek = function () { if (!UI.root) mount(); try { W.sessionStorage.removeItem('pepbot:greeted'); } catch (e) {} showPeek(); };

  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', mount); else mount();
  return API;
});
