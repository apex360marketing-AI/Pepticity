/* APEX BUILD TEMPLATE ENGINE
   Every slot on the page can be swapped live from the arsenal. Picks save to the artifact database
   (picks/<viewer>) plus this browser, and travel in the share link (#p=...).
   Pages set window.TEMPLATE = { style:'a'|'b', defaults:{slot:id,...} } before loading this file. */
(function () {
  'use strict';
  const H = document.documentElement, T = window.TEMPLATE || { style: 'a', defaults: {} };
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------------- THE SLOTS (live options first; "arsenal" = catalogue codes shown as build requests) */
  const PAL = (id, name, note, v) => ({ id, name, note, vars: v, sw: [v.bg, v.surface, v.ink, v.muted, v.accent] });
  const SLOTS = {
    palette: { label: 'Colour', group: 'LOOK', options: [
      PAL('gunmetal', 'Gunmetal', 'Matte near-black, gunmetal type, one electric-blue spark.', { bg: '#0c0c0d', surface: '#161617', ink: '#e9e8e4', muted: '#8e8d85', accent: '#0066FF', m1: '#f2f1ec', m2: '#8e8d85', m3: '#2a2a28', m4: '#c9c8c2', depth: '#060607' }),
      PAL('wall', 'Wall 323232', 'The owner\'s BLACK image: wall #323232, metal #080807 to #8E8D85.', { bg: '#323232', surface: '#3a3a39', ink: '#f1f0ec', muted: '#a3a29b', accent: '#8E8D85', m1: '#f2f1ec', m2: '#8e8d85', m3: '#080807', m4: '#c9c8c2', depth: '#121212' }),
      PAL('graphite', 'Graphite mono', 'No accent at all. Pure greys.', { bg: '#111112', surface: '#1a1a1b', ink: '#dcdcd8', muted: '#7d7d79', accent: '#dcdcd8', m1: '#ffffff', m2: '#9a9a96', m3: '#2b2b2b', m4: '#d4d4d0', depth: '#050505' }),
      PAL('uv', 'UV black', 'Deep black with a faint violet sheen on edges only.', { bg: '#07070a', surface: '#111116', ink: '#e6e6ec', muted: '#85849a', accent: '#6F00FF', m1: '#eceaf7', m2: '#8a88a0', m3: '#1b1a24', m4: '#c8c6da', depth: '#030305' }),
      PAL('chrome', 'Chrome night', 'Black with bright silver, accent is silver.', { bg: '#0a0a0a', surface: '#141414', ink: '#f5f5f5', muted: '#8f9196', accent: '#c9ccd1', m1: '#ffffff', m2: '#a6a9ae', m3: '#26272a', m4: '#e3e5e8', depth: '#000000' }),
      PAL('steel', 'Steel blue night', 'Cold blue-black, tiny cyan spark.', { bg: '#0a0d12', surface: '#121821', ink: '#e6ebf2', muted: '#7f8a99', accent: '#0FFFFF', m1: '#eef3f8', m2: '#8b97a6', m3: '#1d2530', m4: '#c9d2dd', depth: '#04060a' }),
      PAL('pearl', 'Pearl and ink', 'Light: pearl ground, ink type, cobalt spark.', { bg: '#e8e7e3', surface: '#f3f2ef', ink: '#111112', muted: '#5d5d5a', accent: '#1A3DFF', m1: '#3a3a38', m2: '#111112', m3: '#5d5d5a', m4: '#1d1d1c', depth: '#c9c8c2' }),
      PAL('bone', 'Bone and ink', 'Light: bone ground, black type, no accent.', { bg: '#f2f1ed', surface: '#ffffff', ink: '#0b0b0b', muted: '#6b6b67', accent: '#0b0b0b', m1: '#4a4a48', m2: '#0b0b0b', m3: '#6b6b67', m4: '#222', depth: '#d6d5d0' }),
    ], arsenal: [] },
    background: { label: 'Background', group: 'LOOK', options: [
      ['plain', 'Plain ground', 'Flat palette colour.'], ['wall', 'Lit wall', 'Soft top light on the ground.'], ['vignette', 'Vignette', 'Centre glow, dark edges.'],
      ['smoke', 'Smoke (Higgsfield)', 'Blurred still from the chest film.'], ['city', 'City glass (Higgsfield)', 'Blurred city still.'], ['lab', 'Lab (Higgsfield)', 'Blurred lab still.'],
      ['film', 'Chest film loop (Higgsfield)', 'The intro film playing very faintly.'], ['image', 'Your dropped image', 'Uses the image from IMAGE DROP.']
    ], arsenal: ['BGD'] },
    texture: { label: 'Texture', group: 'LOOK', options: [
      ['none', 'None', 'Clean.'], ['smoke', 'Smoke grain', 'Crop of the Higgsfield chest smoke.'], ['metal', 'Brushed steel', 'Crop of the Higgsfield doors.'],
      ['glass', 'City glass', 'Crop of the Higgsfield city.'], ['lab', 'Lab metal', 'Crop of the Higgsfield lab.'], ['image', 'Your dropped image', 'Seamless tile cut from your image.']
    ], arsenal: ['GLS'] },
    finish: { label: 'Heading finish', group: 'TYPE', options: [
      ['chrome', 'Chrome 3D', 'Metal face with real extrusion depth.'], ['matte', 'Matte gunmetal', 'Soft, no shine.'], ['edge', 'Light edge', 'Dark face, hairline of light.'],
      ['flat', 'Flat ink', 'Plain colour.'], ['outline', 'Outline', 'Hairline stroke only.']
    ], arsenal: [] },
    headfont: { label: 'Heading font', group: 'TYPE', options: [
      ['pb', 'PEPTICITY BLACK', 'The owner\'s typeface.', '"PEPTICITY BLACK",sans-serif'], ['pbc', 'PEPTICITY BLACK CONDENSED', 'Narrow cut.', '"PEPTICITY BLACK CONDENSED",sans-serif'],
      ['pbs', 'PEPTICITY BLACK SPLIT', 'Split-bar cut.', '"PEPTICITY BLACK SPLIT",sans-serif'], ['michroma', 'Michroma', 'Wide technical sans.', 'Michroma,sans-serif'],
      ['syncopate', 'Syncopate', 'Wide, airy.', 'Syncopate,sans-serif'], ['unbounded', 'Unbounded', 'Round geometric.', 'Unbounded,sans-serif']
    ], arsenal: ['TYP'] },
    bodyfont: { label: 'Body font', group: 'TYPE', options: [
      ['hanken', 'Hanken Grotesk', '', '"Hanken Grotesk",system-ui,sans-serif'], ['instrument', 'Instrument Sans', '', '"Instrument Sans",system-ui,sans-serif'],
      ['inter', 'Inter Tight', '', '"Inter Tight",system-ui,sans-serif'], ['plex', 'IBM Plex Sans', '', '"IBM Plex Sans",system-ui,sans-serif'], ['manrope', 'Manrope', '', 'Manrope,system-ui,sans-serif']
    ], arsenal: [] },
    menu: { label: 'Menu', group: 'PARTS', options: [
      ['bar', 'Top bar', 'Logo left, links right, fades over content.'], ['glassbar', 'Glass bar', 'Floating see-through bar.'], ['curtain', 'Curtain', 'One button; a full-screen curtain drops.'],
      ['rail', 'Side rail', 'Fixed vertical index on the left.'], ['dock', 'Bottom dock', 'Floating glass dock at the bottom.']
    ], arsenal: ['NAV'] },
    button: { label: 'Buttons', group: 'PARTS', options: [
      ['glass', 'Glass', 'See-through with a light top edge.'], ['solid', 'Solid ink', 'Filled, quiet.'], ['outline', 'Outline fill', 'Hairline, fills on hover.'], ['underline', 'Underline', 'Text with a line that draws in.'],
      ['metal', 'Gunmetal bevel', 'Machined metal button.'], ['sweep', 'Sweep fill', 'Fill rises from below.'], ['brackets', 'Corner brackets', 'Brackets grow to frame it.'],
      ['edge', 'Light edge run', 'A sliver of light runs the top edge.'], ['split', 'Split arrow', 'Label plus a separate arrow cell.'], ['inset', 'Pressed inset', 'Carved into the surface.']
    ], arsenal: ['BTN'] },
    card: { label: 'Cards', group: 'PARTS', options: [
      ['glass', 'Clear glass', 'Fully see-through, hairline, sheen.'], ['matte', 'Matte slab', 'Solid surface with depth shadow.'], ['hairline', 'Hairline', 'Just a fine border.'],
      ['frame', 'Metal frame', 'Gunmetal gradient border.'], ['bevel', 'Bevel', 'Soft machined edge.'], ['index', 'Index rule', 'Editorial: top rule, no box.'],
      ['holo', 'Hologram', 'Mono scanlines, faint accent edge.'], ['float', 'Floating', 'Long soft shadow.']
    ], arsenal: ['CRD'] },
    hover: { label: 'Hover', group: 'PARTS', options: [
      ['lift', 'Lift', 'Rises 6px.'], ['tilt', '3D tilt', 'Tilts toward the pointer.'], ['torch', 'Torch', 'A soft light follows the pointer.'], ['edge', 'Edge light', 'Accent hairline lights up.'],
      ['glint', 'Glint sweep', 'A shine passes across.'], ['dim', 'Dim the rest', 'Others fade back.'], ['invert', 'Invert', 'Flips to ink.'], ['zoom', 'Image zoom', 'Slow push-in.'], ['underline', 'Title underline', 'Title underlines.']
    ], arsenal: ['HOV'] },
    cursor: { label: 'Cursor', group: 'PARTS', options: [
      ['default', 'System', 'Normal pointer.'], ['ring', 'Ring follower', 'Ring trails and grows on links.'], ['dot', 'Dot halo', 'Small dot with halo.'], ['cross', 'Crosshair', 'Fine crosshair.'], ['lens', 'Lens', 'A brightening lens.']
    ], arsenal: [] },
    form: { label: 'Form fields', group: 'PARTS', options: [
      ['boxed', 'Boxed', 'Field + joined button.'], ['underline', 'Underline', 'Line only.'], ['glass', 'Glass capsule', 'Field inside a glass tray.'], ['stacked', 'Stacked', 'Field above button.']
    ], arsenal: ['FRM'] },
    loader: { label: 'Loader', group: 'PARTS', options: [
      ['bar', 'Wordmark + hairline', 'Name, a line fills.'], ['iris', 'Iris open', 'Black irises open onto the page.'], ['film', 'Chest still', 'The Higgsfield chest frame, then fade.'], ['none', 'None', 'Straight in.']
    ], arsenal: [] },
    footer: { label: 'Footer', group: 'PARTS', options: [
      ['rise', 'Rising wordmark', 'PEPTICITY rises out of the bottom.'], ['seal', 'Seal', 'The emblem sits centred.'], ['minimal', 'Minimal', 'Columns and legal only.']
    ], arsenal: [] },
    /* -------- the 12 effects -------- */
    'fx-scroll': { label: 'E1 · Scroll feel', group: 'EFFECTS', fx: 1, options: [['glide', 'Glide (Lenis)', 'Weighted, eases to a stop.'], ['heavy', 'Heavy glide', 'Slower, more cinematic.'], ['native', 'Native', 'Browser default.']], arsenal: ['SCR'] },
    'fx-wordmark': { label: 'E2 · Hero pull-apart', group: 'EFFECTS', fx: 1, options: [['scatter', 'Scatter and lock', 'Letters fly apart in depth, then lock back.'], ['split', 'Split rows', 'Letters split up/down, then rejoin.'], ['depth', 'Depth blur', 'Letters drift back and blur, then return.'], ['none', 'Still', 'No motion.']], arsenal: ['TXT', 'OBJ'] },
    'fx-highlight': { label: 'E3 · Text reveal', group: 'EFFECTS', fx: 1, options: [['words', 'Words light up', 'Each word lights as you scroll.'], ['lines', 'Lines rise', 'Lines rise from a mask.'], ['blur', 'Blur to sharp', 'Comes into focus.'], ['none', 'Plain', 'No effect.']], arsenal: ['TXT'] },
    'fx-vial': { label: 'E4 · Exploded vial', group: 'EFFECTS', fx: 1, options: [['explode', 'Explode vertical', 'Layers separate, hold on each, reassemble.'], ['fan', 'Fan', 'Layers fan out like plates.'], ['offset', 'Side offset', 'Layers slide left/right.'], ['none', 'Still', 'Vial stays whole.']], arsenal: ['SCR', 'OBJ', 'LAY'] },
    'fx-track': { label: 'E5 · Card story', group: 'EFFECTS', fx: 1, options: [['horizontal', 'Horizontal track', 'Pins; cards slide sideways.'], ['deck', 'Stacked deck', 'Cards stack on top of each other.'], ['grid', 'Stagger grid', 'Cards rise in a grid.']], arsenal: ['LAY', 'SCR'] },
    'fx-reveal': { label: 'E6 · Image reveal', group: 'EFFECTS', fx: 1, options: [['iris', 'Iris', 'Circle opens on the image.'], ['wipe', 'Wipe', 'Image wipes up.'], ['zoom', 'Zoom through', 'Push in from a frame.'], ['none', 'Still', 'No effect.']], arsenal: ['TRN', 'SCR'] },
    'fx-parallax': { label: 'E7 · Depth', group: 'EFFECTS', fx: 1, options: [['layers', 'Parallax layers', 'Layers move at different speeds.'], ['tilt', 'Pointer tilt', 'Scene tilts with the pointer.'], ['still', 'Still', 'No motion.']], arsenal: ['SCR'] },
    'fx-magnetic': { label: 'E8 · Magnetic CTAs', group: 'EFFECTS', fx: 1, options: [['magnetic', 'Magnetic', 'Buttons lean toward the pointer.'], ['none', 'Off', '']], arsenal: ['BTN', 'HOV'] },
    'fx-entrance': { label: 'E9 · Section entrance', group: 'EFFECTS', fx: 1, options: [['rise', 'Soft rise', 'Fades up a little.'], ['mask', 'Mask up', 'Slides out from a mask.'], ['blur', 'Blur in', 'Focus pull.'], ['none', 'None', '']], arsenal: ['TRN'] },
    'fx-marquee': { label: 'E10 · Band', group: 'EFFECTS', fx: 1, options: [['marquee', 'Moving band', 'Speeds up with scroll.'], ['skew', 'Velocity skew', 'Headings lean with scroll speed.'], ['static', 'Still rule', 'Static band.']], arsenal: ['SCR', 'TXT'] },
    progress: { label: 'E11 · Progress', group: 'EFFECTS', fx: 1, options: [['line', 'Bottom line + index', 'The little bottom thing.'], ['dots', 'Side dots', 'One dot per section.'], ['ring', 'Ring', 'Corner ring fills.'], ['none', 'None', '']], arsenal: [] },
    watermark: { label: 'E12 · Watermark', group: 'EFFECTS', fx: 1, options: [['seal', 'Turning seal', 'Emblem turns as you scroll.'], ['letters', 'Letters lock in', 'P-E-P-T-I-C-I-T-Y lock one per section.'], ['p', 'Centre P', 'Large P turns slowly with scroll.'], ['depth', 'Depth P', 'Three P marks at different depths.'], ['none', 'None', '']], arsenal: [] },
  };
  for (const k in SLOTS) SLOTS[k].options = SLOTS[k].options.map(o => Array.isArray(o) ? { id: o[0], name: o[1], note: o[2], val: o[3] } : o);
  const FX_KEYS = Object.keys(SLOTS).filter(k => SLOTS[k].fx);

  /* ---------------- STATE */
  const LS = 'apex-template-' + T.style;
  let picks = Object.assign({}, T.defaults), requests = {}, imageStyle = null;
  try { const s = JSON.parse(localStorage.getItem(LS) || 'null'); if (s) { Object.assign(picks, s.picks || {}); requests = s.requests || {}; } } catch (e) {}
  try { const m = location.hash.match(/p=([^&]+)/); if (m) Object.assign(picks, JSON.parse(decodeURIComponent(atob(m[1])))); } catch (e) {}

  function applyLook(slot) {
    const id = picks[slot], S = SLOTS[slot]; if (!S) return;
    const o = S.options.find(x => x.id === id) || S.options[0];
    if (slot === 'palette') { for (const k in o.vars) H.style.setProperty('--' + k, o.vars[k]); H.dataset.palette = o.id; if (imageStyle && picks.palette === 'image') applyImageTokens(); return; }
    if (slot === 'headfont') { H.style.setProperty('--head', o.val); return; }
    if (slot === 'bodyfont') { H.style.setProperty('--body', o.val); return; }
    H.setAttribute('data-' + slot, o.id);
  }
  function applyAll() { Object.keys(SLOTS).forEach(applyLook); }
  applyAll();

  /* ---------------- SAVE (db + this browser) */
  let db = null, me = null, saveT = 0;
  (async () => {
    try {
      if (!window.claude || !claude.use) return;
      const user = await claude.use('user'); db = await claude.use('db');
      if (user && user.id) me = await user.id();
      if (db && me) { const snap = await db.doc('picks/' + me).get(); if (snap.exists && !location.hash) { const d = snap.data(); Object.assign(picks, d.picks || {}); requests = Object.assign({}, d.requests || {}); applyAll(); rebuild(); } }
    } catch (e) { db = null; }
  })();
  function save(now) {
    try { localStorage.setItem(LS, JSON.stringify({ picks, requests })); } catch (e) {}
    clearTimeout(saveT);
    saveT = setTimeout(async () => {
      if (!db || !me) return;
      try { await db.doc('picks/' + me).set({ style: T.style, picks: Object.assign({}, picks), requests: Object.assign({}, requests), image: imageStyle ? { tokens: imageStyle.tokens, palette: imageStyle.palette.slice(0, 8) } : null, updatedAt: new Date().toISOString() }); toast('Picks saved'); }
      catch (e) { toast('Saved in this browser (database not available here)'); }
    }, now ? 0 : 1200);
  }
  function shareURL() { return location.href.split('#')[0] + '#p=' + btoa(encodeURIComponent(JSON.stringify(picks))); }

  /* ---------------- CUSTOMISE UI */
  const ui = document.createElement('div');
  ui.innerHTML = `<div class="cz-dock" role="toolbar" aria-label="Template controls">
    <button data-a="edit" aria-pressed="false">Customise</button><button data-a="all">All slots</button><button data-a="image">Image drop</button><button data-a="save">Save picks</button><button data-a="share">Share link</button></div>
    <aside class="cz-panel" aria-label="Picker" aria-hidden="true"><header><h2>PICK</h2><p></p><div class="cz-acts"><button data-a="all">All slots</button><button data-a="image">Image drop</button><button data-a="save">Save picks</button><button data-a="share">Share link</button></div><button class="cz-x" aria-label="Close">×</button></header><div class="cz-list"></div></aside>
    <div class="cz-toast" role="status"></div>`;
  document.body.appendChild(ui);
  const panel = $('.cz-panel'), list = $('.cz-list', panel), dock = $('.cz-dock');
  let arsenal = [];
  fetch('arsenal.json').then(r => r.json()).then(a => { arsenal = a; }).catch(() => {});
  const toast = (t) => { const el = $('.cz-toast'); el.textContent = t; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 2200); };

  // chips on every slotted element
  $$('[data-slotbox]').forEach(el => {
    const slots = el.dataset.slotbox.split(',');
    const b = document.createElement('button'); b.className = 'cz-chip'; b.type = 'button';
    b.textContent = '◇ ' + slots.map(s => (SLOTS[s] || {}).label || s).join(' · ');
    b.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); openPanel(slots, el.dataset.slotname || ''); });
    const cs = getComputedStyle(el); if (cs.position === 'static') el.style.position = 'relative';
    b.style.left = '10px'; b.style.top = (el.offsetHeight > 380 || el.matches('section') ? 84 : 10) + 'px'; el.appendChild(b);
  });

  function optHTML(slot, o) {
    const on = picks[slot] === o.id;
    const sw = o.sw ? `<span class="sw">${o.sw.map(c => `<i style="background:${c}"></i>`).join('')}</span>` : '';
    return `<button class="cz-opt" data-slot="${slot}" data-id="${o.id}" aria-pressed="${on}"><b>${o.name}<em>${on ? 'ON' : 'LIVE'}</em></b>${o.note ? `<small>${o.note}</small>` : ''}${sw}</button>`;
  }
  function openPanel(slots, title) {
    $('h2', panel).textContent = title || (slots.length === 1 ? SLOTS[slots[0]].label.toUpperCase() : 'ALL SLOTS');
    $('header p', panel).textContent = 'Tap a LIVE option to swap it now. Arsenal items are saved as build requests.';
    let html = '';
    let lastGroup = '';
    slots.forEach(slot => {
      const S = SLOTS[slot]; if (!S) return;
      if (slots.length > 3 && S.group !== lastGroup) { html += `<h3 style="color:#f2f1ec;margin-top:22px">${S.group}</h3>`; lastGroup = S.group; }
      html += `<h3>${S.label.toUpperCase()}</h3>` + S.options.map(o => optHTML(slot, o)).join('');
      if (slot === 'palette') html += `<button class="cz-opt" data-a="image"><b>From your image<em>DROP</em></b><small>Drop a picture: palette, background and texture re-spin from its pixels.</small></button>`;
      const cats = S.arsenal || [];
      if (cats.length && slots.length <= 3) {
        const items = arsenal.filter(a => cats.includes(a.k));
        if (items.length) {
          html += `<h3>ALSO IN THE ARSENAL · ${items.length}</h3><input class="cz-search" placeholder="Search ${items.length} ${S.label.toLowerCase()} options" data-slot="${slot}">`;
          html += `<div class="cz-ars" data-slot="${slot}">` + items.map(a => arsHTML(slot, a)).join('') + '</div>';
        }
      }
    });
    list.innerHTML = html; panel.classList.add('on'); panel.setAttribute('aria-hidden', 'false'); list.scrollTop = 0;
    if (lenis) lenis.stop();
  }
  function arsHTML(slot, a) {
    const on = (requests[slot] || []).includes(a.c);
    return `<button class="cz-opt req" data-req="${slot}" data-code="${a.c}" aria-pressed="${on}"><b>${a.c} · ${esc(a.n)}<em>${on ? 'REQUESTED' : 'REQUEST'}</em></b>${a.s ? `<small>${esc(a.s)}</small>` : ''}</button>`;
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function closePanel() { panel.classList.remove('on'); panel.setAttribute('aria-hidden', 'true'); if (lenis) lenis.start(); }
  $('.cz-x', panel).addEventListener('click', closePanel);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });
  list.addEventListener('input', e => {
    const inp = e.target.closest('.cz-search'); if (!inp) return;
    const q = inp.value.toLowerCase(); $$('.cz-opt', $(`.cz-ars[data-slot="${inp.dataset.slot}"]`, list)).forEach(b => b.style.display = b.textContent.toLowerCase().includes(q) ? '' : 'none');
  });
  list.addEventListener('click', e => {
    const b = e.target.closest('.cz-opt'); if (!b) return;
    if (b.dataset.a === 'image') return pickImage();
    if (b.dataset.req) {
      const s = b.dataset.req, c = b.dataset.code; requests[s] = requests[s] || [];
      const i = requests[s].indexOf(c); if (i < 0) requests[s].push(c); else requests[s].splice(i, 1);
      b.setAttribute('aria-pressed', i < 0); $('em', b).textContent = i < 0 ? 'REQUESTED' : 'REQUEST';
      toast(i < 0 ? c + ' requested for ' + SLOTS[s].label : 'Request removed'); save(); return;
    }
    const slot = b.dataset.slot, id = b.dataset.id; picks[slot] = id;
    $$(`.cz-opt[data-slot="${slot}"]`, list).forEach(x => { const on = x.dataset.id === id; x.setAttribute('aria-pressed', on); $('em', x).textContent = on ? 'ON' : 'LIVE'; });
    applyLook(slot); if (SLOTS[slot].fx || ['menu', 'card', 'hover', 'cursor', 'loader'].includes(slot)) rebuild(slot);
    toast(SLOTS[slot].label + ': ' + b.querySelector('b').firstChild.textContent); save();
  });
  const onAct = e => {
    const b = e.target.closest('button[data-a]'); if (!b) return; const a = b.dataset.a;
    if (a === 'edit') { const on = H.classList.toggle('cz-edit'); b.setAttribute('aria-pressed', on); toast(on ? 'Tap any ◇ chip to swap that part' : 'Customise off'); }
    if (a === 'all') openPanel(Object.keys(SLOTS), 'ALL SLOTS');
    if (a === 'image') pickImage();
    if (a === 'save') { save(true); showSummary(); }
    if (a === 'share') { const u = shareURL(); (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(() => toast('Share link copied'), () => { prompt('Copy this link', u); }); }
  };
  dock.addEventListener('click', onAct); $('.cz-acts', panel).addEventListener('click', onAct);
  function showSummary() {
    openPanel([], 'YOUR PICKS');
    const lines = Object.keys(SLOTS).map(k => { const o = SLOTS[k].options.find(x => x.id === picks[k]); return `${SLOTS[k].label}: ${o ? o.name : picks[k] || '-'}${(requests[k] || []).length ? '  + requested ' + requests[k].join(', ') : ''}`; });
    list.innerHTML = `<p style="font-size:13px;color:#c9c8c2">Saved ${db && me ? 'to the database (Claude can read it back) and ' : ''}to this browser.</p><div class="cz-sum">${esc(lines.join('\n'))}</div>`;
  }

  /* ---------------- IMAGE DROP → palette / background / texture from the pixels */
  const fileIn = Object.assign(document.createElement('input'), { type: 'file', accept: 'image/*' }); fileIn.hidden = true; document.body.appendChild(fileIn);
  function pickImage() {
    openPanel([], 'IMAGE DROP');
    list.innerHTML = `<div class="cz-drop" tabindex="0">Drop an image here, or tap to choose one.<br><br>Palette, background and texture re-spin from its measured pixels (OKLab k-means), not from a description.</div><div class="cz-img"></div>`;
    const dz = $('.cz-drop', list);
    dz.addEventListener('click', () => fileIn.click());
    dz.addEventListener('keydown', e => { if (e.key === 'Enter') fileIn.click(); });
    ['dragenter', 'dragover'].forEach(t => dz.addEventListener(t, e => { e.preventDefault(); dz.classList.add('over'); }));
    ['dragleave', 'drop'].forEach(t => dz.addEventListener(t, e => { e.preventDefault(); dz.classList.remove('over'); }));
    dz.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f) useImage(f); });
  }
  fileIn.addEventListener('change', () => fileIn.files[0] && useImage(fileIn.files[0]));
  document.addEventListener('dragover', e => { if (H.classList.contains('cz-edit')) e.preventDefault(); });
  document.addEventListener('drop', e => { if (H.classList.contains('cz-edit') && e.dataTransfer.files[0]) { e.preventDefault(); useImage(e.dataTransfer.files[0]); } });
  let imgURL = null;
  async function useImage(file) {
    if (!window.ImageToStyle) return toast('Image tool not loaded');
    toast('Measuring your image…');
    try {
      imageStyle = await ImageToStyle.extract(file, { k: 8, tile: 512 });
      if (imgURL) URL.revokeObjectURL(imgURL); imgURL = URL.createObjectURL(file);
      picks.palette = 'image'; picks.background = 'image'; picks.texture = 'image';
      applyImageTokens(); save();
      const box = $('.cz-img', list);
      if (box) box.innerHTML = `<h3>MEASURED PALETTE</h3><div class="cz-opt" style="cursor:default"><span class="sw">${imageStyle.palette.map(p => `<i title="${p.hex} ${Math.round(p.share * 100)}%" style="background:${p.hex};width:${Math.max(14, p.share * 300)}px"></i>`).join('')}</span><small>${imageStyle.palette.map(p => p.hex + ' ' + Math.round(p.share * 100) + '%').join(' · ')}</small><small>Accent: ${imageStyle.tokens.accent ? imageStyle.tokens.accent.hex : 'none measured (kept mono)'}</small></div>`;
      toast('Palette, background and texture now come from your image');
    } catch (e) { toast('Could not read that image'); }
  }
  function applyImageTokens() {
    if (!imageStyle) return; const t = imageStyle.tokens;
    const set = (k, v) => H.style.setProperty('--' + k, v);
    set('bg', t.bg.hex); set('surface', t.surface.hex); set('ink', t.ink.hex); set('muted', t.muted.hex);
    set('accent', t.accent ? t.accent.hex : t.ink.hex);
    set('m1', t.ink.hex); set('m2', t.muted.hex); set('m3', t.surface.hex); set('m4', t.ink.hex); set('depth', t.bg.hex);
    if (imgURL) H.style.setProperty('--bgimg', `url("${imgURL}")`);
    if (imageStyle.tileDataURL) H.style.setProperty('--tex', `url("${imageStyle.tileDataURL}")`);
    H.dataset.palette = 'image'; H.setAttribute('data-background', 'image'); H.setAttribute('data-texture', 'image');
  }
  SLOTS.palette.options.push({ id: 'image', name: 'From your image', note: 'Set by IMAGE DROP.', vars: {}, sw: [] });

  /* ---------------- MOTION ENGINE: 12 effects, rebuilt on every swap */
  const G = window.gsap, ST = window.ScrollTrigger; if (G && ST) G.registerPlugin(ST);
  let lenis = null, ctx = null, rafId = 0; const cleanups = [];
  function setupScroll() {
    if (lenis) { lenis.destroy(); lenis = null; }
    H.classList.remove('lenis', 'lenis-smooth');
    if (RM || !window.Lenis || picks['fx-scroll'] === 'native') return;
    const heavy = picks['fx-scroll'] === 'heavy';
    lenis = new Lenis({ lerp: heavy ? 0.055 : 0.09, wheelMultiplier: heavy ? 0.75 : 0.95, smoothWheel: true });
    if (ST) lenis.on('scroll', ST.update);
  }
  function loop(t) { if (lenis) lenis.raf(t); rafId = requestAnimationFrame(loop); }
  rafId = requestAnimationFrame(loop);

  // split helpers (once)
  $$('[data-fx="wordmark"] .h').forEach(h => { if (h.dataset.split) return; h.dataset.split = 1; const t = h.textContent; h.setAttribute('aria-label', t); h.innerHTML = t.split(' ').map(w => `<span style="display:inline-block;white-space:nowrap" aria-hidden="true">${[...w].map(c => `<span class="ch">${c}</span>`).join('')}</span>`).join(' '); });
  $$('[data-fx="highlight"]').forEach(p => { if (p.dataset.split) return; p.dataset.split = 1; p.innerHTML = p.innerHTML.split(/(\s+)/).map(w => /^\s+$/.test(w) ? w : `<span class="w">${w}</span>`).join(''); });
  const rand = (i, s) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

  function build() {
    if (!G || !ST) return;
    if (ctx) ctx.revert(); cleanups.splice(0).forEach(f => f());
    $$('.highlight .w').forEach(w => w.classList.remove('on'));
    ctx = G.context(() => {
      if (RM) { $$('.highlight .w').forEach(w => w.classList.add('on')); return; }
      const mobile = innerWidth < 760;
      /* E2 hero pull-apart */
      const wm = $('[data-fx="wordmark"]'), mode = picks['fx-wordmark'];
      if (wm && mode !== 'none') {
        const chs = $$('.ch', wm), tl = G.timeline({ scrollTrigger: { trigger: wm, start: 'top top', end: () => '+=' + innerHeight * (mobile ? 1.1 : 1.6), scrub: 0.6, pin: true, anticipatePin: 1 } });
        const apart = (el, i) => mode === 'scatter' ? { x: (rand(i, 1) - .5) * innerWidth * .7, y: (rand(i, 2) - .5) * innerHeight * .7, z: rand(i, 3) * 600, rotation: (rand(i, 4) - .5) * 70, opacity: .25 }
          : mode === 'split' ? { yPercent: i % 2 ? -160 : 160, opacity: .35 } : { z: -800, scale: .6, filter: 'blur(14px)', opacity: .2, y: (rand(i, 5) - .5) * 80 };
        G.set(wm, { perspective: 900 });
        chs.forEach((c, i) => tl.to(c, { ...apart(c, i), duration: 1, ease: 'power2.inOut' }, 0));
        $$('[data-hero-sub]', wm).forEach(s => tl.to(s, { opacity: 0, y: -30, duration: .6 }, 0));
        tl.to(chs, { x: 0, y: 0, z: 0, rotation: 0, yPercent: 0, scale: 1, filter: 'blur(0px)', opacity: 1, duration: 1, ease: 'power3.out', stagger: { each: .025, from: 'edges' } }, 1.2);
        $$('[data-hero-sub]', wm).forEach(s => tl.to(s, { opacity: 1, y: 0, duration: .6 }, 1.9));
        tl.to({}, { duration: .3 });
      }
      /* E3 text reveal */
      const hm = picks['fx-highlight'];
      $$('[data-fx="highlight"]').forEach(p => {
        const ws = $$('.w', p);
        if (hm === 'words') ST.create({ trigger: p, start: 'top 80%', end: 'bottom 45%', scrub: true, onUpdate: s => { const n = Math.round(s.progress * ws.length); ws.forEach((w, i) => w.classList.toggle('on', i < n)); } });
        else { ws.forEach(w => w.classList.add('on')); if (hm === 'lines') G.from(ws, { yPercent: 100, opacity: 0, stagger: .015, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: p, start: 'top 80%' } }); if (hm === 'blur') G.fromTo(p, { filter: 'blur(12px)', opacity: .2 }, { filter: 'blur(0px)', opacity: 1, scrollTrigger: { trigger: p, start: 'top 85%', end: 'top 35%', scrub: true } }); }
      });
      /* E4 exploded vial: whole → apart → hold on each layer → together */
      const vs = $('[data-fx="vial"]'), vm = picks['fx-vial'];
      if (vs) {
        const L = $$('.layer', vs), steps = $$('.vstep', vs);
        const tl = G.timeline({ scrollTrigger: { trigger: vs, start: 'top top', end: () => '+=' + innerHeight * 3, scrub: 0.7, pin: true, anticipatePin: 1 } });
        const k = mobile ? .6 : 1;
        const pose = i => vm === 'explode' ? { y: (i - 1.5) * 48 * k } : vm === 'fan' ? { rotation: (i - 1.5) * 14, x: (i - 1.5) * 40 * k, transformOrigin: '50% 100%' } : vm === 'offset' ? { x: (i % 2 ? 1 : -1) * 70 * k, y: (i - 1.5) * 30 } : {};
        if (vm !== 'none') L.forEach((l, i) => tl.to(l, { ...pose(i), duration: 1, ease: 'power2.inOut' }, 0));
        steps.forEach((s, i) => { tl.to(s, { opacity: 1, x: 0, duration: .4 }, 1 + i * 1); tl.to(s, { opacity: i === steps.length - 1 ? 1 : .25, duration: .4 }, 1.7 + i * 1); });
        if (vm !== 'none') tl.to(L, { x: 0, y: 0, rotation: 0, duration: 1, ease: 'power3.inOut' }, 1 + steps.length);
        tl.to(steps, { opacity: 0, duration: .5 }, 1 + steps.length);
        G.set(steps, { opacity: 0, x: (i) => steps[i].classList.contains('l') ? -20 : 20 });
      }
      /* E5 card story */
      const tw = $('[data-fx="track"]'), tm = picks['fx-track']; H.setAttribute('data-fx-track', tm);
      if (tw) {
        const tr = $('.track', tw);
        if (tm === 'horizontal') G.to(tr, { x: () => -(tr.scrollWidth - innerWidth + (H.dataset.menu === 'rail' && !mobile ? 88 : 0)), ease: 'none', scrollTrigger: { trigger: tw, start: 'top top', end: () => '+=' + Math.max(1, tr.scrollWidth - innerWidth), scrub: .6, pin: true, invalidateOnRefresh: true, anticipatePin: 1 } });
        if (tm === 'grid') G.from($$('.card', tr), { y: 60, opacity: 0, stagger: .08, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: tr, start: 'top 80%' } });
      }
      /* E6 image reveal + hologram panel */
      $$('[data-fx="reveal"]').forEach(r => {
        const img = $('.img', r), rm = picks['fx-reveal'], o = $('.over', r);
        const st = { trigger: r, start: 'top top', end: () => '+=' + innerHeight * 1.2, scrub: .6, pin: true, anticipatePin: 1 };
        const tl = G.timeline({ scrollTrigger: st });
        if (rm === 'iris') tl.fromTo(img, { clipPath: 'circle(8% at 50% 55%)' }, { clipPath: 'circle(75% at 50% 50%)', ease: 'none', duration: 1 });
        if (rm === 'wipe') tl.fromTo(img, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', ease: 'none', duration: 1 });
        if (rm === 'zoom') tl.fromTo(img, { scale: 1.6, clipPath: 'inset(22% 26% round 4px)' }, { scale: 1, clipPath: 'inset(0% 0% round 0px)', ease: 'none', duration: 1 });
        if (o) tl.fromTo(o, { opacity: 0, y: 40, scaleY: .6, transformOrigin: '50% 100%' }, { opacity: 1, y: 0, scaleY: 1, duration: .5 }, rm === 'none' ? 0 : .6);
      });
      /* E7 depth */
      const pm = picks['fx-parallax'];
      $$('[data-fx="parallax"]').forEach(p => {
        const lays = $$('.lay', p);
        if (pm === 'layers') lays.forEach((l, i) => G.fromTo(l, { yPercent: -8 * (i + 1) }, { yPercent: 8 * (i + 1), ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: true } }));
        if (pm === 'tilt' && !mobile) { const mv = e => { const r = p.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; lays.forEach((l, i) => G.to(l, { x: x * 20 * (i + 1), y: y * 14 * (i + 1), duration: .8 })); }; p.addEventListener('pointermove', mv); cleanups.push(() => p.removeEventListener('pointermove', mv)); }
      });
      /* E9 section entrance */
      const em = picks['fx-entrance'];
      if (em !== 'none') $$('[data-in]').forEach(el => {
        const from = em === 'rise' ? { y: 40, opacity: 0 } : em === 'mask' ? { clipPath: 'inset(0 0 100% 0)', y: 30 } : { filter: 'blur(10px)', opacity: 0 };
        const to = em === 'mask' ? { clipPath: 'inset(0 0 0% 0)', y: 0 } : em === 'rise' ? { y: 0, opacity: 1 } : { filter: 'blur(0px)', opacity: 1 };
        G.fromTo(el, from, { ...to, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' } });
      });
      /* E10 band */
      const mm = picks['fx-marquee'];
      $$('[data-fx="marquee"] .row').forEach(row => {
        if (mm === 'static') return;
        if (mm === 'marquee') { const tw2 = G.to(row, { xPercent: -50, ease: 'none', duration: 28, repeat: -1 }); ST.create({ trigger: row, start: 'top bottom', end: 'bottom top', onUpdate: s => tw2.timeScale(1 + Math.min(4, Math.abs(s.getVelocity()) / 600)) }); }
      });
      if (mm === 'skew') { const hs = $$('.h2'); ST.create({ onUpdate: s => { const v = G.utils.clamp(-4, 4, s.getVelocity() / -500); G.to(hs, { skewY: v, duration: .4, overwrite: true }); } }); }
      /* E11 progress */
      const bar = $('.prog.line .tr i'), ring = $('.prog.ring .fg'), dots = $$('.prog.dots i'), secs = $$('main > section, main > div[data-sec]'), idx = $('.prog.line .ix');
      ST.create({ start: 0, end: 'max', onUpdate: s => { if (bar) bar.style.transform = `scaleX(${s.progress})`; if (ring) ring.style.strokeDashoffset = 125.6 * (1 - s.progress); } });
      secs.forEach((sec, i) => ST.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onToggle: s => { if (!s.isActive) return; dots.forEach((d, j) => d.classList.toggle('on', j === i)); if (idx) idx.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(secs.length).padStart(2, '0'); } }));
      /* E12 watermark */
      const wmode = picks.watermark;
      if (wmode === 'seal') G.to('.wm.seal', { rotation: 360, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 1 } });
      if (wmode === 'p') G.fromTo('.wm.pbig', { rotationY: -25, scale: .9 }, { rotationY: 25, scale: 1.05, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 1 } });
      if (wmode === 'depth') $$('.wm.depth img').forEach((im, i) => G.to(im, { y: -(i + 1) * 260, rotation: (i - 1) * 12, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 1 } }));
      if (wmode === 'letters') { const ls = $$('.wm.letters span'); G.set(ls, { y: (i) => (rand(i, 7) - .5) * 300, x: (i) => (rand(i, 8) - .5) * 200, opacity: .2, rotation: (i) => (rand(i, 9) - .5) * 40 }); secs.forEach((sec, i) => { const l = ls[Math.min(ls.length - 1, Math.floor(i * ls.length / secs.length))]; ls.forEach((x, j) => { if (Math.floor(j * secs.length / ls.length) === i) G.to(x, { x: 0, y: 0, rotation: 0, opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: sec, start: 'top 70%', end: 'top 30%', scrub: true } }); }); }); }
      /* fade watermark to zero over forms (never behind form fields) */
      $$('form').forEach(f => ST.create({ trigger: f, start: 'top 70%', end: 'bottom 30%', onToggle: s => G.to('.wm', { opacity: s.isActive ? 0 : 1, duration: .4, overwrite: 'auto' }) }));
    });
    ST.refresh();
  }
  function rebuild() { setupScroll(); build(); bindPointer(); }

  /* E8 magnetic, hover tilt/torch, cursor (pointer-driven, cheap) */
  const cur = document.createElement('div'); cur.className = 'cur'; document.body.appendChild(cur);
  let ptrBound = false;
  function bindPointer() {
    if (ptrBound) return; ptrBound = true;
    let cx = 0, cy = 0, tx = 0, ty = 0;
    addEventListener('pointermove', e => {
      tx = e.clientX; ty = e.clientY; cur.classList.add('live');
      const t = e.target.closest && e.target.closest('.hv');
      if (t) { const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; t.style.setProperty('--mx', x * 100 + '%'); t.style.setProperty('--my', y * 100 + '%'); if (H.dataset.hover === 'tilt') { t.style.setProperty('--rx', (.5 - y) * 8 + 'deg'); t.style.setProperty('--ry', (x - .5) * 10 + 'deg'); } }
      const m = e.target.closest && e.target.closest('.btn');
      if (picks['fx-magnetic'] === 'magnetic' && m && G && !RM) { const r = m.getBoundingClientRect(); G.to(m, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .4 }); m._mag = 1; }
      cur.classList.toggle('on', !!(e.target.closest && e.target.closest('a,button,.hv')));
    }, { passive: true });
    document.addEventListener('pointerout', e => { const t = e.target.closest && e.target.closest('.hv'); if (t) { t.style.setProperty('--rx', '0deg'); t.style.setProperty('--ry', '0deg'); } const m = e.target.closest && e.target.closest('.btn'); if (m && m._mag && G) G.to(m, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' }); });
    (function cl() { cx += (tx - cx) * .2; cy += (ty - cy) * .2; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(cl); })();
  }

  /* ---------------- PAGE PIECES: loader, menu, forms, finder, sticky CTA, exit card */
  const loader = $('.loader');
  function runLoader() {
    if (!loader) return;
    if (picks.loader === 'none' || RM) { loader.classList.add('done'); return; }
    requestAnimationFrame(() => loader.classList.add('go'));
    setTimeout(() => loader.classList.add('done'), picks.loader === 'iris' ? 1400 : 1700);
  }
  const mbtn = $('.menu .mbtn'); if (mbtn) mbtn.addEventListener('click', () => { const m = $('.menu'), o = m.classList.toggle('open'); mbtn.setAttribute('aria-expanded', o); mbtn.textContent = o ? 'Close' : 'Menu'; });
  $$('.menu .links a').forEach(a => a.addEventListener('click', e => { const h = a.getAttribute('href'); if (h && h[0] === '#') { e.preventDefault(); $('.menu').classList.remove('open'); if (mbtn) mbtn.textContent = 'Menu'; const t = $(h); if (t) lenis ? lenis.scrollTo(t, { offset: -10 }) : t.scrollIntoView({ behavior: 'smooth' }); } }));
  // every capture form is preview-only: nothing leaves the page
  $$('form[data-hook]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault(); const out = $('.sent', f) || f.appendChild(Object.assign(document.createElement('p'), { className: 'sent' }));
    const inp = $('input[type=email],input[type=tel]', f);
    if (inp && !inp.checkValidity()) { out.textContent = inp.type === 'tel' ? 'Please enter a phone number.' : 'Please enter a valid email.'; inp.focus(); return; }
    out.textContent = 'Preview only: nothing was sent. (Hook: ' + f.dataset.hook + ')';
  }));
  // finder (3 taps, never asks about health)
  $$('.finder').forEach(fd => {
    const st = $$('.fstep', fd), bar = $('.bar i', fd); let n = 0;
    const go = i => { n = i; st.forEach((s, j) => s.classList.toggle('on', j === i)); if (bar) bar.style.width = ((i + 1) / st.length * 100) + '%'; ST && ST.refresh(); };
    fd.addEventListener('click', e => { const o = e.target.closest('.opt'); if (!o) return; $$('.opt', o.parentNode).forEach(x => x.setAttribute('aria-pressed', x === o)); setTimeout(() => go(Math.min(n + 1, st.length - 1)), 260); });
    $$('[data-back]', fd).forEach(b => b.addEventListener('click', () => go(Math.max(0, n - 1))));
  });
  // sticky CTA appears after the hero, hides near forms and the footer
  const sticky = $('.sticky');
  if (sticky) addEventListener('scroll', () => { const y = scrollY, h = innerHeight, max = document.documentElement.scrollHeight - h; sticky.classList.toggle('on', y > h * 1.2 && y < max - h * 1.2); }, { passive: true });
  // exit card: once per session, desktop pointer leaving the top edge
  const exit = $('.exit');
  if (exit) {
    let shown = false; try { shown = sessionStorage.getItem('apx-exit') === '1'; } catch (e) {}
    document.addEventListener('mouseout', e => { if (shown || e.relatedTarget || e.clientY > 8 || scrollY < innerHeight) return; shown = true; try { sessionStorage.setItem('apx-exit', '1'); } catch (e2) {} exit.classList.add('on'); });
    exit.addEventListener('click', e => { if (e.target === exit || e.target.closest('.x')) exit.classList.remove('on'); });
  }

  /* ---------------- GO */
  addEventListener('load', () => { runLoader(); rebuild(); });
  if (document.readyState === 'complete') { runLoader(); rebuild(); }
  let rw = 0; addEventListener('resize', () => { clearTimeout(rw); rw = setTimeout(() => ST && ST.refresh(), 200); });
  window.APEX_TEMPLATE = { picks, requests, SLOTS, rebuild, set: (s, id) => { picks[s] = id; applyLook(s); rebuild(); save(); } };
})();
