/* =====================================================================
   PEPTICITY · CLIENT COMMS MODULE (comms.js) · 30 Oct 2026
   One IIFE. It mounts eight features into the EXISTING dashboard DOM (it never rewrites
   dashboard markup, it only adds cards and small hooks next to what is there):

   CLIENT VIEW
     1 DAILY LAB NOTE ............ card above PEPTICITY PULSE (#cmLab)
     2 REORDER REMINDERS ......... REMIND ME on BUY AGAIN cards, YOUR REMINDERS card, due nudge
     3 DELIVERY CHECK-IN ......... HOW WAS YOUR ORDER? on delivered order cards
     4 CONCIERGE ................. PEPComms.mountConcierge(): shows shared/bot/pep-bot.js on the
                                   client view only + ASK ABOUT MY ORDER (the bot is NOT inlined here)
   TWO-WAY
     5 GRACE'S ANNOUNCEMENTS ..... compose + sent list (Grace) · slim banner + inbox entry (client)
     6 CHAT PER ORDER ............ MESSAGE ABOUT THIS ORDER on every order card · ORDER MESSAGES (Grace)
     7 READ RECEIPTS + ALERTS .... SENT/READ ticks, typing, unread counts, NEW REPLY toast, CLIENT PULSE
     8 WEEKLY GRACE'S NOTE ....... pinned under TODAY'S WORD (client) · editor (Grace)

   PREVIEW MODE THROUGHOUT: nothing is sent anywhere. Demo state lives in localStorage
   (keys pep-comms-*), shared between tabs with the storage event. Every piece of text is escaped.
   Accent: var(--acc) / var(--acc-rgb) from the colour layer, falling back to #D4FF3A.
   Needs notes.js (window.PEP_COMMS_NOTES) loaded first. Safe to load before or after the dashboard
   scripts: it waits for DOMContentLoaded and re-attaches when the dashboard re-renders a list.

   HOW TO INLINE (coordinator)
     1 comms.css  → a <style> placed AFTER the dashboard's main <style> (so equal selectors resolve to it).
     2 notes.js, then comms.js → <script> blocks at the end of <body> (after the dashboard scripts).
     3 Concierge: inline shared/bot/pep-bot.css as a <style> and shared/bot/pep-bot.js as a <script>
       (an inlined bot has no src, so it cannot fetch its own CSS), then call PEPComms.mountConcierge().
       Or, unbundled: PEPComms.mountConcierge({ src: '<path>/pep-bot.js' }) loads it (CSS comes along).
       The bot only shows on the CLIENT view; its store greeting is kept quiet unless { greet: true }.
   API: PEPComms.mountConcierge(opts) · .askAboutOrder() · .refresh() · .labNoteFor(date) · .previewLab(days)
        · .reset() (clears the pep-comms-* demo state) · .keys
   ===================================================================== */
(function (W, D) {
  'use strict';
  if (!D || (W.PEPComms && W.PEPComms.__mounted)) return;

  var N = W.PEP_COMMS_NOTES || { peptides: [], wellness: [], clients: [], seed: {}, lines: {} };
  var LN = N.lines || {};
  var SEED = N.seed || {};
  var RM = !!(W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var DAY = 864e5;
  var VERSION = '1.0.0';

  /* ---------------- helpers ---------------- */
  function $(s, r) { return (r || D).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rich(s) { return esc(s).replace(/\[([^\]]{1,160})\]/g, '<span class="cm-ph">[$1]</span>'); } // [placeholders] get the quiet style
  function clip(s, n) { s = String(s == null ? '' : s); return s.length > n ? s.slice(0, n) : s; }
  function str(s, n) { return typeof s === 'string' ? clip(s, n) : ''; }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function midnight(ms) { var d = new Date(ms == null ? Date.now() : ms); d.setHours(0, 0, 0, 0); return d.getTime(); }
  function daysLeft(due) { return Math.round((midnight(due) - midnight()) / DAY); }
  function fTime(ms) { var d = new Date(ms); return d.toLocaleString('en-CA', { month: 'short', day: 'numeric' }) + ' · ' + d.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' }); }
  function fDay(ms) { return new Date(ms).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }); }
  function fLong(ms) { return new Date(ms).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' }); }
  function iso(ms) { var d = new Date(ms); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function weekStart(ms) { var d = new Date(midnight(ms)); var k = (d.getDay() + 6) % 7; d.setDate(d.getDate() - k); return d.getTime(); }
  function up(s) { return String(s || '').toUpperCase(); }
  function visible(el) { return !!(el && el.getClientRects().length); }
  function setHTML(el, h) { if (el && el._cmh !== h) { el.innerHTML = h; el._cmh = h; } } // write only when the markup changed, so entrance animations do not replay on every refresh

  /* storage: localStorage when allowed, memory otherwise */
  var MEM = {};
  var store = {
    get: function (k, d) { try { var v = W.localStorage.getItem(k); if (v == null) return k in MEM ? MEM[k] : d; return JSON.parse(v); } catch (e) { return k in MEM ? MEM[k] : d; } },
    set: function (k, v) { MEM[k] = v; try { W.localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var K = {
    th: 'pep-comms-threads-v1', ty: 'pep-comms-typing-v1', an: 'pep-comms-ann-v1', nt: 'pep-comms-note-v1',
    ci: 'pep-comms-checkins-v1', rm: 'pep-comms-reminders-v1', lab: 'pep-comms-lab-v1', seen: 'pep-comms-seen-v1', init: 'pep-comms-init-v1'
  };

  /* UI icons (interface marks only, no imagery) */
  var IC = {
    tick: '<svg class="cm-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg>',
    dbl: '<svg class="cm-ic cm-ic--dbl" viewBox="0 0 30 24" aria-hidden="true"><path d="M3 12.5l4.2 4.2L17 7"/><path d="M12.4 16.4l.3.3L23 7"/></svg>',
    bell: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 1112 0v5l1.5 2h-15L6 16zM10 20.5a2 2 0 004 0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l16-8-6 16-2.5-6.5L4 12z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9.5L4 20z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    heart: '<svg class="hrt" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.2s-7.6-4.5-9.3-9.3C1.5 7.6 3.6 4.5 7 4.5c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.4 0 5.5 3.1 4.3 6.4-1.7 4.8-9.3 9.3-9.3 9.3z"/></svg>',
    share: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14.5V3.5m0 0L7.8 7.7M12 3.5l4.2 4.2M5.5 11.5v7a2 2 0 002 2h9a2 2 0 002-2v-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  /* the dashboard's ONE button (BTN-P01), written with its full markup so labels can change safely */
  function B(label, o) {
    o = o || {};
    var cls = 'btn pc-btn' + (o.cls ? ' ' + o.cls : '') + (/\bsm\b/.test(o.cls || '') ? ' pc-btn--sm' : '');
    return '<button type="' + (o.type || 'button') + '" class="' + cls + '"' + (o.attrs || '') + '><span class="pc-btn__face"><span class="pc-btn__label">' + (o.icon || '') + '<span class="cm-bl">' + label + '</span></span></span></button>';
  }
  function X(label, attrs) { return '<button type="button" class="x pc-btn pc-btn--sm cm-x" aria-label="' + esc(label) + '"' + (attrs || '') + '><span class="pc-btn__face"><span class="pc-btn__label">×</span></span></button>'; }
  function H(text, tag, id, cls) { var t = up(text); return '<' + (tag || 'h2') + ' class="h3d h2' + (cls ? ' ' + cls : '') + '"' + (id ? ' id="' + id + '"' : '') + ' data-t="' + esc(t) + '">' + esc(t) + '</' + (tag || 'h2') + '>'; }
  function setLabel(btn, t) { var l = btn && $('.cm-bl', btn); if (l) l.textContent = t; }
  function toast(msg) { var t = $('#toast'); if (!t) return; var s = $('span', t); if (s) s.textContent = msg; t.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('on'); }, 2600); }

  /* ---------------- the demo client (the dashboard's sample client) ---------------- */
  var ME = { k: 'jordan', name: 'Jordan M.', first: 'Jordan', tier: 'RESERVE' };
  function readMe() {
    var h = $('#view-client .hero h1'), t = $('#tierMeta');
    var m = h && /HELLO,\s*([A-ZÀ-ſ'-]+)/i.exec(h.textContent || '');
    if (m) ME.first = m[1].charAt(0) + m[1].slice(1).toLowerCase();
    if (t) ME.tier = /RESERVE/i.test(t.textContent) ? 'RESERVE' : /PRIVATE/i.test(t.textContent) ? 'PRIVATE' : 'MEMBER';
  }

  /* ---------------- views ---------------- */
  var VC, VO;
  function curView() { var v = $('#vswitch'); if (v && (v.dataset.v === 'owner' || v.dataset.v === 'client')) return v.dataset.v; return VC && VC.classList.contains('on') ? 'client' : 'owner'; }
  function panelOn(id) { var p = D.getElementById('p-' + id); return !!(p && p.classList.contains('on') && visible(p)); }
  function goView(v) {
    if (curView() === v) return;
    var b = $('#vswitch [data-view="' + v + '"]'); if (b) b.click();
    if (curView() !== v) { try { location.hash = v; } catch (e) {} }
  }
  function goTab(group, tab) { var t = $('.tabs[data-group="' + group + '"] .tab[data-tab="' + tab + '"]'); if (t && t.getAttribute('aria-selected') !== 'true') t.click(); }
  function goClient(tab, then) { goView('client'); setTimeout(function () { goTab('client', tab); if (then) setTimeout(then, 60); }, 30); }
  function goOwner(tab, then) { goView('owner'); setTimeout(function () { goTab('owner', tab); if (then) setTimeout(then, 60); }, 30); }

  /* ================================================================
     STATE
     ================================================================ */
  function getThreads() { var t = store.get(K.th, {}); return t && typeof t === 'object' && !Array.isArray(t) ? t : {}; }
  function msgsOf(th) {
    if (!th || !Array.isArray(th.msgs)) return [];
    return th.msgs.filter(function (m) { return m && typeof m.t === 'string' && (m.f === 'c' || m.f === 'g') && isFinite(m.at); });
  }
  function threadOf(order) { var T = getThreads(), th = T[order]; if (!th || typeof th !== 'object') th = { order: order, client: ME.k, name: ME.name, msgs: [] }; th.msgs = msgsOf(th); return th; }
  function unreadIn(order, side) { var f = side === 'client' ? 'g' : 'c'; return msgsOf(getThreads()[order]).filter(function (m) { return m.f === f && !m.read; }).length; }
  function unreadAll(side) { var T = getThreads(); return Object.keys(T).reduce(function (s, o) { return s + unreadIn(o, side); }, 0); }
  function markRead(order, side) {
    var T = getThreads(), th = T[order]; if (!th) return false;
    var f = side === 'client' ? 'g' : 'c', ch = false, now = Date.now();
    msgsOf(th).forEach(function (m) { if (m.f === f && !m.read) { m.read = true; m.readAt = now; ch = true; } });
    if (ch) { T[order] = th; store.set(K.th, T); }
    return ch;
  }
  function sendMsg(order, side, text) {
    text = clip(String(text || '').trim(), 600); if (!text) return false;
    var T = getThreads(), th = threadOf(order);
    th.msgs.push({ id: uid(), f: side === 'client' ? 'c' : 'g', t: text, at: Date.now(), read: false });
    th.msgs = th.msgs.slice(-80); T[order] = th; store.set(K.th, T);
    setTyping(side, null);
    return true;
  }
  /* typing: a short-lived flag per side */
  var lastTypeWrite = 0;
  function getTyping() { var t = store.get(K.ty, {}); return t && typeof t === 'object' ? t : {}; }
  function setTyping(side, order) { var t = getTyping(), k = side === 'client' ? 'c' : 'g'; if (order) t[k] = { order: order, at: Date.now() }; else delete t[k]; store.set(K.ty, t); }
  function typingPing(side, order) { var n = Date.now(); if (n - lastTypeWrite < 1200) return; lastTypeWrite = n; setTyping(side, order); }
  function isTyping(side, order) { var t = getTyping()[side === 'client' ? 'c' : 'g']; return !!(t && t.order === order && Date.now() - t.at < 4000); }

  /* announcements */
  function getAnn() { var a = store.get(K.an, []); return Array.isArray(a) ? a.filter(function (x) { return x && typeof x.title === 'string' && typeof x.body === 'string'; }) : []; }
  function forMe(a) { return a.aud === 'all' || (a.aud === 'reserve' && ME.tier === 'RESERVE') || (a.aud === 'one' && a.to === ME.k); }
  function isRead(a) { return !!(a.readBy && a.readBy[ME.k]); }
  function unreadAnn() { return getAnn().filter(function (a) { return forMe(a) && !isRead(a); }); }
  function markAnnRead(id) {
    var A = getAnn(), ch = false;
    A.forEach(function (a) { if ((id == null || a.id === id) && forMe(a) && !isRead(a)) { a.readBy = a.readBy && typeof a.readBy === 'object' ? a.readBy : {}; a.readBy[ME.k] = Date.now(); ch = true; } });
    if (ch) store.set(K.an, A);
    return ch;
  }
  function audLabel(a) {
    if (a.aud === 'reserve') return 'RESERVE MEMBERS';
    if (a.aud === 'one') return up(a.toName || 'ONE CLIENT');
    return 'ALL CLIENTS';
  }
  /* weekly note */
  function getNote() {
    var n = store.get(K.nt, null);
    if (n && typeof n.body === 'string' && n.body.trim()) return { title: str(n.title, 60) || 'A NOTE FROM GRACE', body: str(n.body, 700), sig: str(n.sig, 30) || 'GRACE', at: +n.at || Date.now(), sample: false };
    var s = SEED.note || {};
    return { title: s.title || 'A NOTE FROM GRACE', body: s.body || '[Grace’s note for the week]', sig: s.sig || 'GRACE', at: weekStart(), sample: true };
  }
  /* check-ins */
  function getCI() { var a = store.get(K.ci, []); return Array.isArray(a) ? a.filter(function (x) { return x && x.rating >= 1 && x.rating <= 5 && typeof x.order === 'string'; }) : []; }
  function myCI(order) { return getCI().filter(function (x) { return x.order === order && x.clientK === ME.k; })[0] || null; }
  function saveCI(order, rating, note) {
    var A = getCI().filter(function (x) { return !(x.order === order && x.clientK === ME.k); });
    A.unshift({ id: uid(), order: order, client: ME.name, clientK: ME.k, rating: rating, note: clip(String(note || '').trim(), 400), at: Date.now() });
    store.set(K.ci, A.slice(0, 60));
  }
  /* reminders */
  function getRem() { var a = store.get(K.rm, []); return Array.isArray(a) ? a.filter(function (x) { return x && typeof x.p === 'string' && isFinite(x.due) && isFinite(x.start); }) : []; }
  function remFor(p) { return getRem().filter(function (x) { return x.p === p; })[0] || null; }
  function setRem(p, size, due) { var A = getRem().filter(function (x) { return x.p !== p; }); A.push({ id: uid(), p: clip(p, 60), size: clip(size || '', 30), start: midnight(), due: midnight(due) }); store.set(K.rm, A); }
  function dropRem(p) { store.set(K.rm, getRem().filter(function (x) { return x.p !== p; })); }
  function snoozeRem(p, d) { var A = getRem(); A.forEach(function (x) { if (x.p === p) { x.due = midnight(Date.now() + d * DAY); x.snoozed = true; } }); store.set(K.rm, A); }
  function dueRems() { return getRem().filter(function (r) { return daysLeft(r.due) <= 0; }).sort(function (a, b) { return a.due - b.due; }); }

  /* first run: a few clearly marked SAMPLE items so every feature has something to show */
  function seedOnce() {
    if (store.get(K.init, 0)) return;
    var now = Date.now(), today = midnight();
    if (!getAnn().length && SEED.announcement) store.set(K.an, [{ id: 'seed-ann', title: SEED.announcement.title, body: SEED.announcement.body, aud: 'all', at: now - 2 * 3600e3, readBy: {}, sample: true }]);
    if (!getRem().length) store.set(K.rm, [
      { id: 'seed-r1', p: 'GHK-Cu', size: '50 mg', start: today - 30 * DAY, due: today, sample: true },
      { id: 'seed-r2', p: 'NAD+', size: '1000 mg', start: today - 27 * DAY, due: today + 18 * DAY, sample: true }
    ]);
    if (!getCI().length && Array.isArray(SEED.checkins)) store.set(K.ci, SEED.checkins.map(function (c, i) {
      return { id: 'seed-ci' + i, order: c.order, client: c.client, clientK: 'sample' + i, rating: c.rating, note: c.note, at: now - (c.daysAgo || 1) * DAY, sample: true };
    }));
    store.set(K.init, 1);
  }

  /* ================================================================
     SHARED UI: rings, bubbles, ticks, sheet, toast, reveal
     ================================================================ */
  function ring(r, cls) {
    var tot = Math.max(1, Math.round((midnight(r.due) - midnight(r.start)) / DAY)), left = daysLeft(r.due), due = left <= 0;
    var p = due ? 1 : Math.max(0.04, Math.min(1, left / tot));
    return '<span class="cm-ring' + (due ? ' is-due' : '') + (cls ? ' ' + cls : '') + '" role="img" aria-label="' + (due ? 'Reminder due now' : left + (left === 1 ? ' day' : ' days') + ' left') + '">' +
      '<svg viewBox="0 0 44 44" aria-hidden="true"><circle class="cm-trk" cx="22" cy="22" r="19"/><circle class="cm-bar" cx="22" cy="22" r="19" pathLength="100" style="stroke-dashoffset:' + (100 - p * 100).toFixed(1) + '"/></svg>' +
      '<b>' + (due ? 'NOW' : left) + '</b>' + (due ? '' : '<i>' + (left === 1 ? 'DAY' : 'DAYS') + '</i>') + '</span>';
  }
  function receipt(m) {
    return m.read ? '<span class="cm-rc is-read" title="Read ' + esc(fTime(m.readAt || m.at)) + '">' + IC.dbl + 'READ</span>' : '<span class="cm-rc">' + IC.tick + 'SENT</span>';
  }
  function bubble(m, mineF, isNew, otherName) {
    var mine = m.f === mineF;
    return '<div class="m ' + (mine ? 'me' : 'them') + ' cm-m' + (isNew ? ' new' : '') + '">' +
      (mine ? '' : '<span class="cm-who">' + esc(otherName) + '</span>') +
      '<span class="cm-tx">' + esc(m.t) + '</span><span class="w">' + esc(fTime(m.at)) + (mine ? receipt(m) : '') + '</span></div>';
  }
  function typingRow(who) { return '<div class="cm-typing" hidden aria-live="polite"><span class="cm-dots" aria-hidden="true"><i></i><i></i><i></i></span><span>' + esc(who) + ' IS TYPING</span></div>'; }
  function renderMsgs(box, msgs, mineF, otherName, empty) {
    if (!box) return;
    var n = msgs.length, prev = +(box.dataset.n || 0), sig = msgs.map(function (m) { return m.id + (m.read ? 'r' : 's'); }).join('|');
    if (box.dataset.sig === sig && box.childElementCount) return;
    box.innerHTML = n ? msgs.map(function (m, i) { return bubble(m, mineF, prev > 0 && i >= prev, otherName); }).join('') : '<p class="cm-empty">' + esc(empty) + '</p>';
    box.dataset.sig = sig;
    if (n !== prev) box.scrollTop = box.scrollHeight;
    box.dataset.n = String(n);
  }

  /* reveal on scroll (opacity + the independent translate property, so card tilt keeps working) */
  var io = null;
  function reveal(el) {
    if (!el) return;
    el.classList.add('cm-rv');
    if (RM || !('IntersectionObserver' in W)) { el.classList.add('in'); return; }
    if (!io) io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.08 });
    io.observe(el);
  }

  /* own dialog, same classes as the dashboard sheet */
  var sheetRet = null;
  function sheet() {
    var s = $('#cmSheet'); if (s) return s;
    s = D.createElement('div'); s.className = 'sheet-wrap cm-sheetw'; s.id = 'cmSheet'; s.hidden = true;
    s.innerHTML = '<div class="sheet glass card cm-sheet" role="dialog" aria-modal="true" aria-labelledby="cmSheetT"><div class="card-h"><h2 class="h3d h2" id="cmSheetT" data-t=""></h2>' + X('Close', ' data-cm-close') + '</div><div id="cmSheetB"></div></div>';
    D.body.appendChild(s);
    s.addEventListener('click', function (e) { if (e.target === s || e.target.closest('[data-cm-close]')) closeSheet(); });
    D.addEventListener('keydown', function (e) {
      if (s.hidden) return;
      if (e.key === 'Escape') { closeSheet(); return; }
      if (e.key === 'Tab') {
        var f = $$('button,input,select,textarea', s).filter(function (x) { return !x.disabled && visible(x); }); if (!f.length) return;
        var a = f[0], z = f[f.length - 1];
        if (e.shiftKey && D.activeElement === a) { z.focus(); e.preventDefault(); } else if (!e.shiftKey && D.activeElement === z) { a.focus(); e.preventDefault(); }
      }
    });
    return s;
  }
  function openSheet(title, html, onOpen) {
    var s = sheet(); sheetRet = D.activeElement;
    var t = $('#cmSheetT'); t.textContent = up(title); t.setAttribute('data-t', up(title));
    $('#cmSheetB').innerHTML = html; s.hidden = false;
    var f = $('#cmSheetB button[aria-pressed="true"],#cmSheetB input,#cmSheetB button', s); if (f) setTimeout(function () { f.focus(); }, 40);
    if (onOpen) onOpen($('#cmSheetB'));
  }
  function closeSheet() { var s = $('#cmSheet'); if (!s || s.hidden) return; s.hidden = true; $('#cmSheetB').innerHTML = ''; if (sheetRet && sheetRet.focus && D.contains(sheetRet)) sheetRet.focus(); }

  /* NEW REPLY toast (its own element, so it never fights the dashboard toast) */
  var rtT = 0;
  function replyToast(title, text, onView) {
    var t = $('#cmToast');
    if (!t) {
      t = D.createElement('div'); t.id = 'cmToast'; t.className = 'cm-toast glass'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); t.hidden = true;
      t.innerHTML = '<span class="cm-toast__pd" aria-hidden="true"></span><div class="cm-toast__b"><b class="cm-toast__t"></b><span class="cm-toast__m"></span></div>' + B('VIEW', { cls: 'sm cm-toast__go' }) + X('Dismiss', ' data-cm-tx');
      D.body.appendChild(t);
      t.addEventListener('click', function (e) {
        if (e.target.closest('[data-cm-tx]')) { hideToast(); return; }
        if (e.target.closest('.cm-toast__go')) { var f = t._view; hideToast(); if (f) f(); }
      });
    }
    $('.cm-toast__t', t).innerHTML = String(title).split(' · ').map(function (x) { return '<span class="cm-nw">' + esc(x) + '</span>'; }).join(' · '); $('.cm-toast__m', t).textContent = text; t._view = onView;
    t.hidden = false; void t.offsetWidth; t.classList.add('on');
    clearTimeout(rtT); rtT = setTimeout(hideToast, 8000);
  }
  function hideToast() { var t = $('#cmToast'); if (!t) return; clearTimeout(rtT); t.classList.remove('on'); setTimeout(function () { if (!t.classList.contains('on')) t.hidden = true; }, RM ? 0 : 500); }

  /* ================================================================
     5 · GRACE'S ANNOUNCEMENTS
     ================================================================ */
  /* client: slim banner at the top of the client view */
  function mountBanner() {
    if ($('#cmBan') || !VC) return;
    var b = D.createElement('div'); b.id = 'cmBan'; b.className = 'cm-ban'; b.hidden = true; b.setAttribute('role', 'region'); b.setAttribute('aria-label', 'Announcement from Grace');
    VC.insertBefore(b, VC.firstChild);
    b.addEventListener('click', function (e) {
      var id = b.dataset.id;
      if (e.target.closest('[data-cm-banx]')) { markAnnRead(id); refresh(); toast('Marked as read · it stays in your inbox'); return; }
      if (e.target.closest('[data-cm-bango]')) { markAnnRead(id); openInboxEntry(id); refresh(); }
    });
  }
  function renderBanner() {
    var b = $('#cmBan'); if (!b) return;
    var U = unreadAnn();
    if (!U.length) { if (!b.hidden) { b.classList.remove('in'); b.hidden = true; } b.dataset.id = ''; return; }
    var a = U[0];
    if (b.dataset.id === a.id && !b.hidden) return;
    b.dataset.id = a.id;
    b.innerHTML = '<span class="cm-ban__pd" aria-hidden="true"></span>' +
      '<div class="cm-ban__txt"><span class="cm-ban__k">FROM GRACE' + (a.sample ? ' · <span class="cm-ban__s">SAMPLE</span>' : '') + (U.length > 1 ? ' · ' + U.length + ' NEW' : '') + '</span>' +
      '<p class="cm-ban__t"><b>' + esc(up(a.title)) + '</b><span>' + esc(a.body) + '</span></p></div>' +
      '<button type="button" class="cm-ban__go" data-cm-bango>READ</button>' + X('Dismiss announcement', ' data-cm-banx') +
      '<i class="cm-ban__sweep" aria-hidden="true"></i>';
    b.hidden = false; void b.offsetWidth; b.classList.add('in');
  }

  /* client: inbox entry inside MESSAGES WITH GRACE */
  var openAnn = {};
  function mountInbox() {
    var p = $('#p-cmsg'); if (!p || $('#cmInbox')) return;
    var s = D.createElement('section'); s.id = 'cmInbox'; s.className = 'glass card cm-inb'; s.setAttribute('aria-labelledby', 'cmInbT');
    s.innerHTML = '<div class="card-h"><div><p class="eyebrow" style="margin-bottom:8px">FROM GRACE</p>' + H('YOUR INBOX', 'h2', 'cmInbT') + '</div><span class="sub" id="cmInbSub"></span></div>' +
      '<div class="cm-inb__grid"><div><h3 class="h3">ANNOUNCEMENTS</h3><ul class="cm-annl" id="cmAnnL"></ul></div>' +
      '<div><h3 class="h3">ABOUT YOUR ORDERS</h3><ul class="cm-orl" id="cmOrdL"></ul></div></div>' +
      '<p class="note">' + esc(LN.phoneAlerts || 'Phone alerts for replies turn on once PEPTICITY is installed.') + ' Preview only, nothing is sent.</p>';
    p.insertBefore(s, p.firstChild);
    reveal(s);
    s.addEventListener('click', function (e) {
      var a = e.target.closest('[data-cm-ann]');
      if (a) { var id = a.dataset.cmAnn; openAnn[id] = !openAnn[id]; markAnnRead(id); refresh(); return; }
      var o = e.target.closest('[data-cm-goorder]');
      if (o) { var ord = o.dataset.cmGoorder; goClient('orders', function () { openClientThread(ord, true); }); }
    });
  }
  function openInboxEntry(id) {
    openAnn = {}; openAnn[id] = true;
    goClient('cmsg', function () { renderInbox(); var el = $('#cmInbox'); if (el) el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' }); });
  }
  function knownOrders() {
    var ids = orderEls().map(orderIdOf).filter(Boolean);
    Object.keys(getThreads()).forEach(function (o) { if (ids.indexOf(o) < 0 && msgsOf(getThreads()[o]).length) ids.push(o); });
    return ids;
  }
  function renderInbox() {
    var L = $('#cmAnnL'); if (!L) return;
    var A = getAnn().filter(forMe);
    setHTML(L, A.length ? A.map(function (a) {
      var on = !!openAnn[a.id], unread = !isRead(a);
      return '<li class="cm-annli' + (unread ? ' is-new' : '') + (on ? ' is-open' : '') + '"><button type="button" class="cm-annb" data-cm-ann="' + esc(a.id) + '" aria-expanded="' + on + '">' +
        '<span class="cm-dot" aria-hidden="true"></span><span class="cm-annb__t">' + esc(up(a.title)) + (a.sample ? ' <span class="tag-s">SAMPLE</span>' : '') + '</span><span class="cm-annb__d">' + esc(fDay(a.at)) + '</span></button>' +
        (on ? '<p class="cm-annli__body">' + esc(a.body) + '</p>' : '') + '</li>';
    }).join('') : '<li class="cm-empty">No announcements yet. When Grace posts one, it shows here and at the top of your dashboard.</li>');
    var T = getThreads(), O = knownOrders();
    var rows = O.map(function (o) {
      var ms = msgsOf(T[o]), last = ms[ms.length - 1], u = unreadIn(o, 'client');
      return '<li><button type="button" class="cm-orb' + (u ? ' is-new' : '') + '" data-cm-goorder="' + esc(o) + '"><span class="cm-orb__id">ORDER ' + esc(o) + '</span>' +
        '<span class="cm-orb__pv">' + (last ? (last.f === 'c' ? 'You: ' : 'Grace: ') + esc(clip(last.t, 70)) : 'No messages yet') + '</span>' +
        (u ? '<span class="unread on cm-ub" aria-label="' + u + ' unread">' + u + '</span>' : '<span class="cm-orb__go" aria-hidden="true">OPEN</span>') + '</button></li>';
    });
    setHTML($('#cmOrdL'), rows.length ? rows.join('') : '<li class="cm-empty">No orders yet.</li>');
    var nu = unreadAnn().length + unreadAll('client');
    $('#cmInbSub').textContent = nu ? nu + ' unread' : 'all caught up';
  }

  /* Grace: compose + sent list (MESSAGES tab) */
  var annAud = 'all';
  function mountAnnCompose(host) {
    var s = D.createElement('section'); s.id = 'cmAnn'; s.className = 'glass card cm-annc'; s.setAttribute('aria-labelledby', 'cmAnnT');
    var opts = (N.clients || []).map(function (c) { return '<option value="' + esc(c.k) + '">' + esc(c.name) + (c.k === ME.k ? ' (sample client)' : '') + '</option>'; }).join('');
    s.innerHTML = '<div class="card-h"><div><p class="eyebrow" style="margin-bottom:8px">TO YOUR CLIENTS</p>' + H('ANNOUNCEMENTS', 'h2', 'cmAnnT') + '</div><span class="sub">preview · nothing is sent</span></div>' +
      '<form class="fgrid cm-annf" id="cmAnF" novalidate>' +
      '<div class="field w3"><label for="cmAnTi">TITLE</label><input class="inp" id="cmAnTi" maxlength="70" autocomplete="off" placeholder="e.g. Restock lands this Friday"></div>' +
      '<div class="field w3"><label for="cmAnBo">MESSAGE</label><textarea class="inp cm-ta" id="cmAnBo" rows="3" maxlength="400" placeholder="Keep it short: one or two lines."></textarea></div>' +
      '<div class="field w3"><label id="cmAnAudL">WHO SEES IT</label><div class="pick pc-seg pc-seg--sm cm-pick" id="cmAnAud" role="group" aria-labelledby="cmAnAudL">' +
      '<button type="button" class="pc-seg__opt" data-aud="all" aria-pressed="true">ALL CLIENTS</button><button type="button" class="pc-seg__opt" data-aud="reserve" aria-pressed="false">RESERVE MEMBERS</button><button type="button" class="pc-seg__opt" data-aud="one" aria-pressed="false">ONE CLIENT</button></div></div>' +
      '<div class="field w3" id="cmAnOneW" hidden><label for="cmAnOne">CLIENT</label><select class="inp" id="cmAnOne">' + opts + '</select></div>' +
      '<div class="w3 rowline"><span class="muted cm-err" id="cmAnErr" role="alert"></span>' + B('SEND', { cls: 'chrome', type: 'submit', icon: IC.send, attrs: ' id="cmAnGo"' }) + '</div></form>' +
      '<div class="card-h cm-subh"><h3 class="h3">SENT</h3><span class="sub" id="cmSentN"></span></div><ul class="cm-sent" id="cmSentL"></ul>' +
      '<p class="note">Clients see a slim banner at the top of their dashboard and a copy in their inbox. Studio news only: no product claims.</p>';
    host.appendChild(s);
    $('#cmAnAud', s).addEventListener('click', function (e) {
      var o = e.target.closest('[data-aud]'); if (!o) return; annAud = o.dataset.aud;
      $$('[data-aud]', s).forEach(function (b) { b.setAttribute('aria-pressed', String(b === o)); });
      $('#cmAnOneW').hidden = annAud !== 'one';
    });
    $('#cmAnF', s).addEventListener('submit', function (e) {
      e.preventDefault();
      var ti = $('#cmAnTi').value.trim(), bo = $('#cmAnBo').value.trim(), err = $('#cmAnErr'), go = $('#cmAnGo');
      if (!ti) { err.textContent = 'Add a short title.'; $('#cmAnTi').focus(); return; }
      if (bo.length < 4) { err.textContent = 'Add a line or two for the message.'; $('#cmAnBo').focus(); return; }
      err.textContent = '';
      var a = { id: uid(), title: clip(ti, 70), body: clip(bo, 400), aud: annAud, at: Date.now(), readBy: {} };
      if (annAud === 'one') { var k = $('#cmAnOne').value, c = (N.clients || []).filter(function (x) { return x.k === k; })[0]; a.to = k; a.toName = c ? c.name : k; }
      var A = getAnn(); A.unshift(a); store.set(K.an, A.slice(0, 40));
      $('#cmAnTi').value = ''; $('#cmAnBo').value = '';
      setLabel(go, 'SENT'); go.classList.add('cm-done'); setTimeout(function () { setLabel(go, 'SEND'); go.classList.remove('cm-done'); }, 1800);
      refresh();
      toast(forMe(a) ? 'Sent · Jordan sees it at the top of the CLIENT view' : 'Sent to ' + audLabel(a).toLowerCase() + ' (preview)');
    });
    $('#cmSentL', s).addEventListener('click', function (e) {
      var x = e.target.closest('[data-cm-unsend]'); if (!x) return;
      store.set(K.an, getAnn().filter(function (a) { return a.id !== x.dataset.cmUnsend; })); refresh(); toast('Announcement withdrawn');
    });
    return s;
  }
  function renderSent() {
    var L = $('#cmSentL'); if (!L) return;
    var A = getAnn();
    $('#cmSentN').textContent = A.length ? A.length + (A.length === 1 ? ' announcement' : ' announcements') : '';
    setHTML(L, A.length ? A.map(function (a) {
      var st = forMe(a) ? (isRead(a) ? '<span class="cm-rc is-read">' + IC.dbl + 'READ · ' + esc(up(ME.name)) + '</span>' : '<span class="cm-rc">' + IC.tick + 'SENT</span>') : '<span class="cm-rc">' + IC.tick + 'SENT · PREVIEW</span>';
      return '<li><div class="cm-sent__b"><b>' + esc(up(a.title)) + (a.sample ? ' <span class="tag-s">SAMPLE</span>' : '') + '</b><p>' + esc(a.body) + '</p>' +
        '<span class="cm-sent__m">TO ' + esc(audLabel(a)) + ' · ' + esc(fTime(a.at)) + '</span></div><div class="cm-sent__s">' + st + X('Withdraw announcement', ' data-cm-unsend="' + esc(a.id) + '"') + '</div></li>';
    }).join('') : '<li class="cm-empty">Nothing sent yet.</li>');
  }

  /* ================================================================
     8 · WEEKLY GRACE'S NOTE
     ================================================================ */
  function mountNoteCard() {
    if ($('#cmNote') || !VC) return;
    var dw = $('#dw', VC), tabs = $('.tabs[data-group="client"]', VC);
    var s = D.createElement('section'); s.id = 'cmNote'; s.className = 'glass card cm-note'; s.setAttribute('data-sh', '3'); s.style.setProperty('--c', '18px'); s.setAttribute('aria-labelledby', 'cmNoteT');
    if (dw && dw.parentNode === VC) VC.insertBefore(s, dw.nextSibling); else if (tabs) VC.insertBefore(s, tabs); else VC.appendChild(s);
    reveal(s);
  }
  function renderNoteCard() {
    var s = $('#cmNote'); if (!s) return;
    var n = getNote(), sig = n.title + '|' + n.body + '|' + n.sig + '|' + n.sample;
    if (s.dataset.sig === sig) return; s.dataset.sig = sig;
    var paras = n.body.split(/\n{2,}/).map(function (p) { return '<p>' + rich(p).replace(/\n/g, '<br>') + '</p>'; }).join('');
    s.innerHTML = '<span class="cm-shine" aria-hidden="true"></span>' +
      '<div class="cm-note__top"><p class="eyebrow cm-pin">PINNED · WEEK OF ' + esc(up(fDay(weekStart()))) + '</p>' + (n.sample ? '<span class="tag-s">SAMPLE</span>' : '<span class="cm-note__upd">UPDATED ' + esc(up(fDay(n.at))) + '</span>') + '</div>' +
      '<div class="cm-note__grid"><figure class="cm-photo" aria-label="Photo of Grace (placeholder)"><span class="cm-photo__ring" aria-hidden="true"></span><span class="cm-photo__ph">[Grace photo]</span></figure>' +
      '<div class="cm-note__main">' + H(n.title, 'h2', 'cmNoteT') + '<div class="cm-note__body">' + paras + '</div>' +
      '<p class="cm-sig"><span class="cm-sig__dash" aria-hidden="true"></span><span class="cm-sig__n">' + esc(up(n.sig)) + '</span><small>OWNER · PEPTICITY</small></p></div></div>';
  }
  function mountNoteEditor(host) {
    var s = D.createElement('section'); s.id = 'cmNed'; s.className = 'glass card cm-ned'; s.setAttribute('aria-labelledby', 'cmNedT');
    var n = getNote();
    s.innerHTML = '<div class="card-h"><div><p class="eyebrow" style="margin-bottom:8px">PINNED FOR EVERY CLIENT</p>' + H('GRACE’S WEEKLY NOTE', 'h2', 'cmNedT') + '</div><span class="sub">week of ' + esc(fDay(weekStart())) + '</span></div>' +
      '<form class="fgrid" id="cmNedF" novalidate>' +
      '<div class="field w3"><label for="cmNedTi">TITLE</label><input class="inp" id="cmNedTi" maxlength="60" autocomplete="off" value="' + esc(n.title) + '"></div>' +
      '<div class="field w3"><label for="cmNedBo">NOTE</label><textarea class="inp cm-ta" id="cmNedBo" rows="5" maxlength="700">' + esc(n.sample ? '' : n.body) + '</textarea><span class="cm-count" id="cmNedC" aria-live="polite"></span></div>' +
      '<div class="field w3"><label for="cmNedSi">SIGN-OFF</label><input class="inp" id="cmNedSi" maxlength="30" autocomplete="off" value="' + esc(n.sig) + '"></div>' +
      '<div class="w3 rowline"><span class="muted cm-err" id="cmNedErr" role="alert"></span>' + B('PIN THIS WEEK’S NOTE', { cls: 'chrome', type: 'submit', attrs: ' id="cmNedGo"' }) + '</div></form>' +
      '<p class="note">Clients see it pinned under TODAY’S WORD, beside your photo [Grace photo] and your sign-off. Studio news and thank-yous: no product claims.</p>';
    host.appendChild(s);
    var bo = $('#cmNedBo', s), cnt = $('#cmNedC', s);
    if (n.sample) bo.placeholder = 'Write this week’s note. What’s new at the studio, what’s coming back, a thank-you.';
    function count() { cnt.textContent = bo.value.length + ' / 700'; }
    bo.addEventListener('input', count); count();
    $('#cmNedF', s).addEventListener('submit', function (e) {
      e.preventDefault();
      var body = bo.value.trim(), err = $('#cmNedErr'), go = $('#cmNedGo');
      if (body.length < 10) { err.textContent = 'Write at least a sentence.'; bo.focus(); return; }
      err.textContent = '';
      store.set(K.nt, { title: clip($('#cmNedTi').value.trim() || 'A NOTE FROM GRACE', 60), body: clip(body, 700), sig: clip($('#cmNedSi').value.trim() || 'GRACE', 30), at: Date.now() });
      setLabel(go, 'PINNED'); go.classList.add('cm-done'); setTimeout(function () { setLabel(go, 'PIN THIS WEEK’S NOTE'); go.classList.remove('cm-done'); }, 1800);
      refresh(); toast('Pinned · clients see it under TODAY’S WORD');
    });
    return s;
  }

  /* ================================================================
     6 + 7 · CHAT PER ORDER (client side, on each order card) + DELIVERY CHECK-IN (3)
     ================================================================ */
  function orderEls() { return $$('#orderList article.order'); }
  function orderIdOf(a) { var t = (($('.order-top .id', a) || a).textContent) || ''; var m = /#?PT-\d+/.exec(t); return m ? (m[0].charAt(0) === '#' ? m[0] : '#' + m[0]) : null; }
  function deliveredOf(a) {
    var st = $$('.steps .st', a);
    if (st.length && st.every(function (s) { return s.classList.contains('done'); })) return true;
    var d = $$('.order-top .d', a).pop(); return !!(d && /delivered/i.test(d.textContent || ''));
  }
  function domId(o) { return o.replace(/[^A-Za-z0-9-]/g, ''); }
  var openC = {};          // order -> thread open (client)
  var ciDraft = {};        // order -> {rating, note, editing}
  function injectOrders() {
    orderEls().forEach(function (a) {
      var o = orderIdOf(a); if (!o || $('.cm-oc', a)) return;
      var id = domId(o), del = deliveredOf(a);
      var w = D.createElement('div'); w.className = 'cm-oc'; w.setAttribute('data-cm-order', o);
      w.innerHTML = '<div class="cm-oc__bar">' + B('MESSAGE ABOUT THIS ORDER', { cls: 'sm cm-oc__open', icon: IC.chat, attrs: ' aria-expanded="false" aria-controls="cmTh-' + id + '"' }) +
        '<span class="cm-oc__st" id="cmSt-' + id + '"></span></div>' +
        '<div class="cm-oc__thread" id="cmTh-' + id + '" hidden>' +
        '<div class="cm-msgs" id="cmMs-' + id + '" aria-live="polite" aria-label="Messages about order ' + esc(o) + '"></div>' + typingRow('GRACE') +
        '<form class="compose cm-compose" data-cm-send="' + esc(o) + '"><label class="sr" for="cmIn-' + id + '">Message Grace about order ' + esc(o) + '</label>' +
        '<input class="inp" id="cmIn-' + id + '" maxlength="600" autocomplete="off" placeholder="Message Grace about this order…">' + B('SEND', { cls: 'chrome', type: 'submit', icon: IC.send }) + '</form>' +
        '<p class="note">Grace sees your order number with every message. ' + esc(LN.phoneAlerts || '') + ' ' + esc(LN.noHealth || '') + '</p></div>' +
        (del ? '<div class="cm-ci" data-cm-ci="' + esc(o) + '"></div>' : '');
      a.appendChild(w);
      if (openC[o]) setThreadOpen(a, o, true);
    });
    renderClientThreads(); renderCheckins();
  }
  function setThreadOpen(a, o, on) {
    var w = $('.cm-oc', a); if (!w) return;
    var th = $('.cm-oc__thread', w), b = $('.cm-oc__open', w);
    th.hidden = !on; b.setAttribute('aria-expanded', String(on)); a.classList.toggle('cm-open', on); openC[o] = on;
    if (on) { refresh(); var box = $('.cm-msgs', th); if (box) box.scrollTop = box.scrollHeight; }
  }
  function openClientThread(o, focus) {
    var a = orderEls().filter(function (x) { return orderIdOf(x) === o; })[0];
    if (!a) { openC[o] = true; return; }
    setThreadOpen(a, o, true);
    a.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'center' });
    if (focus) { var i = $('.cm-compose input', a); if (i) setTimeout(function () { try { i.focus({ preventScroll: true }); } catch (e) { i.focus(); } }, 350); }
  }
  function renderClientThreads() {
    var T = getThreads();
    orderEls().forEach(function (a) {
      var o = orderIdOf(a), w = a && $('.cm-oc', a); if (!o || !w) return;
      var id = domId(o), ms = msgsOf(T[o]), u = unreadIn(o, 'client'), last = ms[ms.length - 1];
      var b = $('.cm-oc__open .pc-btn__label', w), badge = $('.cm-ub', b);
      if (u) { if (!badge) { badge = D.createElement('span'); badge.className = 'unread on cm-ub'; b.appendChild(badge); } badge.textContent = String(u); badge.setAttribute('aria-label', u + ' unread'); }
      else if (badge) badge.remove();
      var st = $('#cmSt-' + id);
      setHTML(st, last ? (last.f === 'g' ? (u ? '<span class="cm-new">NEW REPLY</span> · ' : 'Grace replied · ') + esc(fDay(last.at)) : 'You · ' + esc(fDay(last.at)) + ' ' + receipt(last)) : 'Questions about this order go straight to Grace');
      renderMsgs($('#cmMs-' + id), ms, 'c', 'GRACE', 'Ask anything about this order: delivery, packaging, a change of address. Grace replies here.');
    });
    updateTyping();
  }
  /* delivery check-in */
  function marksHtml(v, interactive, o) {
    var h = '';
    for (var i = 1; i <= 5; i++) {
      h += interactive ? '<button type="button" class="cm-mark' + (i <= v ? ' on' : '') + '" role="radio" aria-checked="' + (i === v) + '" tabindex="' + ((v ? i === v : i === 1) ? 0 : -1) + '" data-v="' + i + '" aria-label="' + i + ' of 5"><i></i><span>' + i + '</span></button>'
        : '<i class="cm-mk' + (i <= v ? ' on' : '') + '"></i>';
    }
    return interactive ? '<div class="cm-marks" role="radiogroup" aria-label="Rate order ' + esc(o) + ', 1 to 5">' + h + '</div>' : '<span class="cm-mks" role="img" aria-label="' + v + ' of 5">' + h + '</span>';
  }
  function renderCheckins() {
    $$('.cm-ci[data-cm-ci]').forEach(function (box) {
      var o = box.getAttribute('data-cm-ci'), done = myCI(o), dr = ciDraft[o] || {};
      var mode = done && !dr.editing ? 'ok' : 'form', sig = mode + '|' + (done ? done.id : '') + '|' + (dr.rating || 0) + '|' + (dr.editing ? 1 : 0);
      if (box.dataset.sig === sig) return; box.dataset.sig = sig;
      if (mode === 'ok') {
        box.innerHTML = '<div class="cm-ci__ok"><span class="pl-tick" aria-hidden="true">' + IC.ok + '</span><div><b class="h3">THANK YOU, ' + esc(up(ME.first)) + '.</b><span>Grace reads every check-in. ' + marksHtml(done.rating, false) + '</span>' +
          (done.note ? '<p class="cm-ci__q">“' + esc(done.note) + '”</p>' : '') + '</div><button type="button" class="cm-link" data-cm-ciedit>EDIT</button></div>';
        return;
      }
      var r = dr.rating || (done ? done.rating : 0);
      box.innerHTML = '<div class="cm-ci__h"><h3 class="h3">HOW WAS YOUR ORDER?</h3><span class="sub">Delivered · optional</span></div>' + marksHtml(r, true, o) +
        '<div class="cm-marks__lab" aria-hidden="true"><span>NOT GREAT</span><span>LOVED IT</span></div>' +
        '<div class="cm-ci__more"' + (r ? '' : ' hidden') + '><div class="field"><label for="cmCi-' + domId(o) + '">ADD A NOTE (OPTIONAL)</label>' +
        '<textarea class="inp cm-ta" id="cmCi-' + domId(o) + '" rows="2" maxlength="400" placeholder="Delivery, packaging, anything we can do better">' + esc(dr.note != null ? dr.note : (done ? done.note : '')) + '</textarea></div>' +
        '<div class="rowline"><span class="cm-fine">Please keep health details out of this note.</span>' + B('SEND TO GRACE', { cls: 'sm chrome', attrs: ' data-cm-cisend' }) + '</div></div>';
    });
  }
  function bindOrderEvents() {
    var L = $('#orderList'); if (!L || L._cm) return; L._cm = 1;
    L.addEventListener('click', function (e) {
      var a = e.target.closest('article.order'); if (!a) return; var o = orderIdOf(a); if (!o) return;
      if (e.target.closest('.cm-oc__open')) { setThreadOpen(a, o, !openC[o]); if (openC[o]) { var i = $('.cm-compose input', a); if (i) try { i.focus({ preventScroll: true }); } catch (x) { i.focus(); } } return; }
      var mk = e.target.closest('.cm-mark');
      if (mk) { var d = ciDraft[o] = ciDraft[o] || {}; d.rating = +mk.dataset.v; var ta = $('.cm-ci textarea', a); if (ta) d.note = ta.value; if (myCI(o)) d.editing = true; renderCheckins(); var m2 = $('.cm-ci .cm-mark[data-v="' + d.rating + '"]', a); if (m2) m2.focus(); return; }
      if (e.target.closest('[data-cm-cisend]')) {
        var dd = ciDraft[o] || {}, t = $('.cm-ci textarea', a), rr = dd.rating || (myCI(o) || {}).rating;
        if (!rr) return;
        saveCI(o, rr, t ? t.value : ''); delete ciDraft[o]; refresh(); toast('Thank you · Grace sees it in her CLIENT PULSE'); return;
      }
      if (e.target.closest('[data-cm-ciedit]')) { var c = myCI(o); ciDraft[o] = { rating: c ? c.rating : 0, note: c ? c.note : '', editing: true }; renderCheckins(); }
    });
    L.addEventListener('keydown', function (e) {
      var mk = e.target.closest && e.target.closest('.cm-mark'); if (!mk) return;
      var k = e.key, v = +mk.dataset.v, n = k === 'ArrowRight' || k === 'ArrowUp' ? Math.min(5, v + 1) : k === 'ArrowLeft' || k === 'ArrowDown' ? Math.max(1, v - 1) : 0;
      if (!n) return; e.preventDefault(); var g = mk.parentNode, t = $('.cm-mark[data-v="' + n + '"]', g); if (t) t.click();
    });
    /* hover preview: marks up to the pointer light up */
    L.addEventListener('pointerover', function (e) { var mk = e.target.closest && e.target.closest('.cm-mark'); if (!mk) return; var v = +mk.dataset.v; $$('.cm-mark', mk.parentNode).forEach(function (m) { m.classList.toggle('pv', +m.dataset.v <= v); }); });
    L.addEventListener('pointerout', function (e) { var g = e.target.closest && e.target.closest('.cm-marks'); if (g && !g.contains(e.relatedTarget)) $$('.cm-mark', g).forEach(function (m) { m.classList.remove('pv'); }); });
    L.addEventListener('submit', function (e) {
      var f = e.target.closest('[data-cm-send]'); if (!f) return; e.preventDefault();
      var i = $('input', f); if (sendMsg(f.getAttribute('data-cm-send'), 'client', i.value)) { i.value = ''; refresh(); toast('Sent · Grace sees it under ORDER ' + f.getAttribute('data-cm-send')); }
    });
    L.addEventListener('input', function (e) {
      var f = e.target.closest && e.target.closest('[data-cm-send]'); if (f && e.target.value.trim()) typingPing('client', f.getAttribute('data-cm-send'));
      var ta = e.target.closest && e.target.closest('.cm-ci textarea'); if (ta) { var a = ta.closest('article.order'), o = a && orderIdOf(a); if (o) { ciDraft[o] = ciDraft[o] || {}; ciDraft[o].note = ta.value; } }
    });
  }

  /* ================================================================
     6 + 7 · ORDER MESSAGES + CLIENT PULSE (Grace's side)
     ================================================================ */
  var activeOT = null;
  function mountOwnerThreads(host) {
    var s = D.createElement('section'); s.id = 'cmOT'; s.className = 'glass card cm-ot'; s.setAttribute('aria-labelledby', 'cmOTT');
    s.innerHTML = '<div class="card-h"><div><p class="eyebrow" style="margin-bottom:8px">ONE THREAD PER ORDER</p>' + H('ORDER MESSAGES', 'h2', 'cmOTT') + '</div><span class="sub" id="cmOTSub"></span></div>' +
      '<div class="cm-ot__grid"><div class="cm-ot__list" id="cmOTL" role="tablist" aria-label="Order threads"></div>' +
      '<div class="cm-ot__conv"><div class="conv-h cm-ot__h" id="cmOTH"></div><div class="cm-msgs" id="cmOTM" aria-live="polite"></div>' + typingRow(up(ME.first)) +
      '<form class="compose cm-compose" id="cmOTF"><label class="sr" for="cmOTI">Reply about this order</label><input class="inp" id="cmOTI" maxlength="600" autocomplete="off" placeholder="Reply about this order…">' + B('SEND', { cls: 'chrome', type: 'submit', icon: IC.send }) + '</form></div></div>' +
      '<p class="note">When you open a thread, the client sees READ on their messages. Your replies reach them as a NEW REPLY alert. ' + esc(LN.phoneAlerts || '') + '</p>';
    host.appendChild(s);
    $('#cmOTL', s).addEventListener('click', function (e) { var b = e.target.closest('[data-cm-ot]'); if (!b) return; activeOT = b.dataset.cmOt; syncRead(); refresh(); });
    $('#cmOTF', s).addEventListener('submit', function (e) {
      e.preventDefault(); var i = $('#cmOTI'); if (!activeOT) return;
      if (sendMsg(activeOT, 'owner', i.value)) { i.value = ''; refresh(); toast('Sent · ' + ME.name + ' gets a NEW REPLY alert'); }
    });
    $('#cmOTI', s).addEventListener('input', function () { if (activeOT && this.value.trim()) typingPing('owner', activeOT); });
    return s;
  }
  function renderOwnerThreads() {
    var L = $('#cmOTL'); if (!L) return;
    var T = getThreads(), O = Object.keys(T).filter(function (o) { return msgsOf(T[o]).length; })
      .sort(function (a, b) { var x = msgsOf(T[a]), y = msgsOf(T[b]); return y[y.length - 1].at - x[x.length - 1].at; });
    var grid = $('#cmOT .cm-ot__grid'), sub = $('#cmOTSub'), tot = unreadAll('owner');
    sub.textContent = tot ? tot + ' unread' : (O.length ? 'all read' : 'no messages yet');
    if (!O.length) {
      grid.classList.add('is-empty'); activeOT = null;
      setHTML(L, '<p class="cm-empty">No order messages yet. When a client taps MESSAGE ABOUT THIS ORDER, the thread lands here under its order number.</p>');
      setHTML($('#cmOTH'), ''); renderMsgs($('#cmOTM'), [], 'g', '', 'Pick a thread on the left.'); $('#cmOTF').hidden = true; return;
    }
    grid.classList.remove('is-empty'); $('#cmOTF').hidden = false;
    if (!activeOT || O.indexOf(activeOT) < 0) activeOT = O[0];
    setHTML(L, O.map(function (o) {
      var th = T[o], ms = msgsOf(th), last = ms[ms.length - 1], u = unreadIn(o, 'owner'), nm = str(th.name, 40) || ME.name;
      var ini = nm.split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase();
      return '<button type="button" class="th cm-th" role="tab" aria-selected="' + (o === activeOT) + '" data-cm-ot="' + esc(o) + '"><span class="av">' + esc(ini) + '</span>' +
        '<span class="cm-th__b"><span class="nm">ORDER ' + esc(o) + '</span><span class="cm-th__pv">' + esc(nm) + ' · ' + (last.f === 'g' ? 'You: ' : '') + esc(clip(last.t, 60)) + '</span></span>' +
        '<span class="cm-th__r"><span class="cm-th__t">' + esc(fDay(last.at)) + '</span>' + (u ? '<span class="unread on cm-ub" aria-label="' + u + ' unread">' + u + '</span>' : '') + '</span></button>';
    }).join(''));
    var th = T[activeOT], nm = str(th.name, 40) || ME.name;
    setHTML($('#cmOTH'), '<span class="av">' + esc(nm.split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase()) + '</span><div><b>ORDER ' + esc(activeOT) + ' · ' + esc(up(nm)) + '</b><div class="s">' + (th.client === ME.k ? 'Sample client · also open the CLIENT view to see this thread from their side' : 'Client') + '</div></div>');
    renderMsgs($('#cmOTM'), msgsOf(th), 'g', up(nm), '');
    updateTyping();
  }
  function mountPulse(host) {
    var s = D.createElement('section'); s.id = 'cmPulse'; s.className = 'glass card cm-pulse'; s.setAttribute('aria-labelledby', 'cmPulseT');
    s.innerHTML = '<div class="card-h"><div><p class="eyebrow" style="margin-bottom:8px">DELIVERY CHECK-INS</p>' + H('CLIENT PULSE', 'h2', 'cmPulseT') + '</div><span class="sub">latest first</span></div>' +
      '<div class="cm-pulse__sum" id="cmPulseS"></div><ul class="cm-pulse__list" id="cmPulseL"></ul>' +
      '<p class="note">Clients rate delivered orders from 1 to 5 and can add a note about delivery or packaging. They are asked to keep health details out.</p>';
    host.appendChild(s);
    return s;
  }
  function renderPulse() {
    var L = $('#cmPulseL'); if (!L) return;
    var A = getCI().sort(function (a, b) { return b.at - a.at; });
    var avg = A.length ? A.reduce(function (s, x) { return s + x.rating; }, 0) / A.length : 0;
    setHTML($('#cmPulseS'), A.length ? '<b class="cm-pulse__avg">' + avg.toFixed(1) + '</b><div>' + marksHtml(Math.round(avg), false) + '<span>AVERAGE FROM ' + A.length + (A.length === 1 ? ' CHECK-IN' : ' CHECK-INS') + (A.some(function (x) { return x.sample; }) ? ' · INCLUDES SAMPLES' : '') + '</span></div>' : '<span class="muted">No check-ins yet.</span>');
    setHTML(L, A.slice(0, 6).map(function (x, i) {
      return '<li class="' + (i === 0 && !x.sample ? 'is-new' : '') + '"><div class="cm-pulse__top">' + marksHtml(x.rating, false) + '<span class="cm-pulse__who">' + esc(x.client) + ' · ORDER ' + esc(x.order) + '</span>' + (x.sample ? '<span class="tag-s">SAMPLE</span>' : '') + '<span class="cm-pulse__t">' + esc(fDay(x.at)) + '</span></div>' +
        (x.note ? '<p>' + rich(x.note) + '</p>' : '<p class="cm-dim">No note.</p>') + '</li>';
    }).join(''));
  }

  /* ================================================================
     2 · REORDER REMINDERS
     ================================================================ */
  function buyCards() { return $$('#buyAgain .prod'); }
  function prodOf(card) {
    var pn = $('.pn2', card); if (!pn) return null;
    var name = ''; for (var i = 0; i < pn.childNodes.length; i++) { if (pn.childNodes[i].nodeType === 3) name += pn.childNodes[i].nodeValue; }
    var sm = $('small', pn), size = sm ? (sm.textContent || '').split(' · ')[0] : '';
    name = name.trim(); return name ? { p: name, size: size.trim() } : null;
  }
  function injectRemind() {
    buyCards().forEach(function (c) {
      var pr = prodOf(c); if (!pr) return;
      var row = $('.cm-rmrow', c);
      /* no reorder prompts for bacteriostatic water: a supply sold beside peptides is the risk the
         peptide-regulatory skill flags first (adjacency = intended use), so it gets no extra nudges */
      if (/bacteriostatic|bac water/i.test(pr.p)) { if (row) row.remove(); return; }
      if (!row) { row = D.createElement('div'); row.className = 'cm-rmrow'; c.appendChild(row); }
      row.setAttribute('data-cm-p', pr.p); row.setAttribute('data-cm-size', pr.size);
      var r = remFor(pr.p), sig = r ? r.id + r.due + '|' + daysLeft(r.due) : 'none';
      if (row.dataset.sig === sig) return; row.dataset.sig = sig;
      row.innerHTML = r ? ring(r, 'cm-ring--sm') + '<span class="cm-rmrow__t">' + (daysLeft(r.due) <= 0 ? '<b class="cm-due-t">REORDER REMINDER IS DUE</b>' : 'Reminder on <b>' + esc(fLong(r.due)) + '</b>') + '</span><button type="button" class="cm-link" data-cm-remind>CHANGE</button>'
        : '<button type="button" class="cm-link cm-link--ic" data-cm-remind>' + IC.bell + 'REMIND ME</button><span class="cm-rmrow__t cm-dim">30, 45, 60 days or a date you pick</span>';
    });
  }
  function remindSheet(p, size) {
    var r = remFor(p), sel = r ? 'custom' : '30';
    if (r) { var tot = Math.round((midnight(r.due) - midnight(r.start)) / DAY); if ([30, 45, 60].indexOf(tot) > -1 && midnight(r.start) === midnight()) sel = String(tot); }
    var min = iso(Date.now() + DAY), max = iso(Date.now() + 365 * DAY);
    openSheet('REMIND ME · ' + p, '<form class="cm-rmf" id="cmRmF" novalidate>' +
      '<p class="muted cm-rmf__lead">We remind you once, on the day you pick. Nothing is ordered for you.</p>' +
      '<div class="field"><label id="cmRmL">REMIND ME IN</label><div class="pick pc-seg pc-seg--sm cm-pick" id="cmRmPick" role="group" aria-labelledby="cmRmL">' +
      ['30', '45', '60', 'custom'].map(function (v) { return '<button type="button" class="pc-seg__opt" data-d="' + v + '" aria-pressed="' + (v === sel) + '">' + (v === 'custom' ? 'PICK A DATE' : v + ' DAYS') + '</button>'; }).join('') + '</div></div>' +
      '<div class="field" id="cmRmCW"' + (sel === 'custom' ? '' : ' hidden') + '><label for="cmRmD">DATE</label><input class="inp" type="date" id="cmRmD" min="' + min + '" max="' + max + '" value="' + (r ? iso(r.due) : iso(Date.now() + 30 * DAY)) + '" style="color-scheme:dark"></div>' +
      '<div class="cm-rmprev" id="cmRmPrev" aria-live="polite"></div><p class="cm-err muted" id="cmRmErr" role="alert"></p>' +
      '<div class="acts">' + (r ? '<button type="button" class="cm-link" data-cm-rmdel>REMOVE REMINDER</button>' : '<span></span>') + B(r ? 'UPDATE REMINDER' : 'SET REMINDER', { cls: 'chrome', type: 'submit' }) + '</div>' +
      '<p class="note">' + esc(LN.phone || 'Phone reminders turn on once PEPTICITY is installed.') + ' Preview only, nothing is sent.</p></form>', function (b) {
      var cur = sel;
      function due() { if (cur === 'custom') { var v = $('#cmRmD', b).value; if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return NaN; var p2 = v.split('-'); return new Date(+p2[0], +p2[1] - 1, +p2[2]).getTime(); } return midnight() + (+cur) * DAY; }
      function prev() {
        var d = due(), ok = isFinite(d) && midnight(d) > midnight() && midnight(d) <= midnight() + 366 * DAY;
        $('#cmRmPrev', b).innerHTML = ok ? ring({ start: midnight(), due: d }, 'cm-ring--md') + '<span><b>' + esc(up(fLong(d))) + '</b><br>' + daysLeft(d) + ' days from today · ' + esc(p) + (size ? ' · ' + esc(size) : '') + '</span>' : '<span class="muted">Pick a date from tomorrow up to a year ahead.</span>';
        return ok;
      }
      $('#cmRmPick', b).addEventListener('click', function (e) {
        var o = e.target.closest('[data-d]'); if (!o) return; cur = o.dataset.d;
        $$('[data-d]', b).forEach(function (x) { x.setAttribute('aria-pressed', String(x === o)); });
        $('#cmRmCW', b).hidden = cur !== 'custom'; prev();
      });
      $('#cmRmD', b).addEventListener('input', prev);
      var del = $('[data-cm-rmdel]', b); if (del) del.addEventListener('click', function () { dropRem(p); closeSheet(); refresh(); toast('Reminder removed · ' + p); });
      $('#cmRmF', b).addEventListener('submit', function (e) {
        e.preventDefault(); if (!prev()) { $('#cmRmErr', b).textContent = 'That date doesn’t work. Pick one from tomorrow up to a year ahead.'; return; }
        var d = due(); setRem(p, size, d); closeSheet(); refresh(); toast('Reminder set · ' + p + ' · ' + fLong(d));
      });
      prev();
    });
  }
  function mountReminders() {
    var panel = $('#p-reorder'); if (!panel || $('#cmRem')) return;
    var s = D.createElement('section'); s.id = 'cmRem'; s.className = 'glass card cm-rem mt'; s.setAttribute('aria-labelledby', 'cmRemT');
    s.innerHTML = '<div class="card-h"><div><p class="eyebrow" style="margin-bottom:8px">NEVER RUN OUT</p>' + H('YOUR REMINDERS', 'h2', 'cmRemT') + '</div><span class="sub" id="cmRemSub"></span></div>' +
      '<ul class="cm-rem__list" id="cmRemL"></ul><p class="note">' + esc(LN.phone || '') + ' Preview only, nothing is sent.</p>';
    var first = $('.grid', panel);
    if (first && first.parentNode === panel) panel.insertBefore(s, first.nextSibling); else panel.appendChild(s);
    reveal(s);
    panel.addEventListener('click', function (e) {
      var rr = e.target.closest('[data-cm-remind]');
      if (rr) { var row = rr.closest('[data-cm-p]'); if (row) remindSheet(row.getAttribute('data-cm-p'), row.getAttribute('data-cm-size') || ''); return; }
      var rn = e.target.closest('[data-cm-reorder]'); if (rn && panel.contains(rn)) { reorderNow(rn.getAttribute('data-cm-reorder'), rn); return; }
      var rd = e.target.closest('[data-cm-remdel]'); if (rd) { dropRem(rd.getAttribute('data-cm-remdel')); refresh(); toast('Reminder removed'); }
    });
  }
  function renderReminders() {
    var L = $('#cmRemL'); if (!L) return;
    var A = getRem().sort(function (a, b) { return a.due - b.due; });
    $('#cmRemSub').textContent = A.length ? A.length + ' active' : 'none yet';
    setHTML(L, A.length ? A.map(function (r) {
      var left = daysLeft(r.due), due = left <= 0;
      return '<li class="cm-remi' + (due ? ' is-due' : '') + '">' + ring(r) + '<div class="cm-remi__b"><b>' + esc(up(r.p)) + (r.size ? ' <small>' + esc(r.size) + '</small>' : '') + (r.sample ? ' <span class="tag-s">SAMPLE</span>' : '') + '</b>' +
        '<span class="cm-remi__d">' + (due ? 'Due ' + (left === 0 ? 'today' : esc(fLong(r.due))) + ' · you asked us to remind you' : 'Reminds you on ' + esc(fLong(r.due))) + '</span></div>' +
        '<div class="cm-remi__a">' + (due ? B('REORDER NOW', { cls: 'sm chrome', attrs: ' data-cm-reorder="' + esc(r.p) + '"' }) : '') +
        '<button type="button" class="cm-link" data-cm-remind data-cm-p="' + esc(r.p) + '" data-cm-size="' + esc(r.size || '') + '">CHANGE</button>' + X('Remove reminder', ' data-cm-remdel="' + esc(r.p) + '"') + '</div></li>';
    }).join('') : '<li class="cm-empty">Tap REMIND ME on anything you’ve ordered before. We remind you once, on the day you pick.</li>');
  }
  function reorderNow(p, btn) {
    if (btn) { setLabel(btn, 'ADDED'); btn.classList.add('cm-done'); }
    setTimeout(function () { dropRem(p); refresh(); }, RM ? 0 : 650);
    toast(p + ' added to your cart (demo) · reminder cleared');
  }
  /* due nudge, just above the client tabs */
  function mountDue() {
    if ($('#cmDue') || !VC) return;
    var tabs = $('.tabs[data-group="client"]', VC);
    var s = D.createElement('div'); s.id = 'cmDue'; s.className = 'glass cm-due'; s.setAttribute('data-sh', '1'); s.style.setProperty('--c', '12px'); s.hidden = true;
    s.setAttribute('role', 'region'); s.setAttribute('aria-label', 'Reorder reminder due');
    if (tabs) VC.insertBefore(s, tabs); else VC.appendChild(s);
    s.addEventListener('click', function (e) {
      var r = e.target.closest('[data-cm-reorder]'); if (r) { reorderNow(r.getAttribute('data-cm-reorder'), r); return; }
      var l = e.target.closest('[data-cm-later]'); if (l) { var p = l.getAttribute('data-cm-later'); snoozeRem(p, 3); refresh(); toast('We’ll remind you again on ' + fLong(Date.now() + 3 * DAY)); return; }
      if (e.target.closest('[data-cm-seeall]')) goClient('reorder', function () { var el = $('#cmRem'); if (el) el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'center' }); });
    });
  }
  function renderDue() {
    var s = $('#cmDue'); if (!s) return;
    var A = dueRems();
    if (!A.length) { s.hidden = true; s.dataset.sig = ''; return; }
    var r = A[0], sig = r.id + r.due + A.length; if (s.dataset.sig === sig && !s.hidden) return; s.dataset.sig = sig;
    s.innerHTML = ring(r, 'cm-ring--md') + '<div class="cm-due__b"><p class="eyebrow"><span>REMINDER · DUE ' + (daysLeft(r.due) === 0 ? 'TODAY' : 'SINCE ' + esc(up(fDay(r.due)))) + (r.sample ? ' · <span class="cm-ban__s">SAMPLE</span>' : '') + '</span></p>' +
      '<b class="cm-due__t">TIME TO REORDER ' + esc(up(r.p)) + '?</b><span class="cm-due__s">You set this reminder on ' + esc(fDay(r.start)) + (A.length > 1 ? ' · <button type="button" class="cm-link" data-cm-seeall>' + (A.length - 1) + ' MORE DUE</button>' : '') + '</span></div>' +
      '<div class="cm-due__a">' + B('REORDER NOW', { cls: 'sm chrome', attrs: ' data-cm-reorder="' + esc(r.p) + '"' }) + '<button type="button" class="cm-link" data-cm-later="' + esc(r.p) + '">REMIND ME IN 3 DAYS</button></div>';
    s.hidden = false; reveal(s);
  }

  /* ================================================================
     1 · DAILY LAB NOTE
     ================================================================ */
  function dayNum(d) { return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY); }
  function noteFor(d) {
    var n = dayNum(d), h = Math.floor(n / 2), P = N.peptides || [], Wl = N.wellness || [];
    if ((n % 2 === 0 && P.length) || !Wl.length) return P.length ? P[((h * 10 + 5) % P.length + P.length) % P.length] : null;
    return Wl[((h * 7 + 2) % Wl.length + Wl.length) % Wl.length];
  }
  var labDate = null, labCur = null;
  function labSaved() { var a = (store.get(K.lab, {}) || {}).saved; return Array.isArray(a) ? a.filter(function (x) { return x && typeof x.t === 'string' && typeof x.k === 'string'; }) : []; }
  function mountLab() {
    if ($('#cmLab') || !VC) return;
    var pulse = $('#pulse', VC);
    var s = D.createElement('section'); s.id = 'cmLab'; s.className = 'glass card cm-lab'; s.setAttribute('data-sh', '0'); s.style.setProperty('--c', '22px'); s.setAttribute('aria-labelledby', 'cmLabT');
    if (pulse) VC.insertBefore(s, pulse); else VC.appendChild(s);
    reveal(s);
    s.addEventListener('click', function (e) {
      if (!labCur) return;
      if (e.target.closest('[data-cm-labsave]')) {
        var a = labSaved(), k = labCur.key + '@' + iso(labDate || Date.now()), i = -1;
        a.forEach(function (x, j) { if (x.k === k) i = j; });
        if (i >= 0) { a.splice(i, 1); toast('Removed from your saved notes'); } else { a.unshift({ k: k, t: labCur.title, kind: labCur.kind, d: iso(labDate || Date.now()) }); toast('Saved to your lab notes'); }
        store.set(K.lab, { saved: a.slice(0, 120) }); renderLabSaved(); return;
      }
      if (e.target.closest('[data-cm-labshare]')) { shareLab(); return; }
      if (e.target.closest('[data-cm-labopen]')) { var box = $('#cmLabSaved'), open = box.hidden; box.hidden = !open; e.target.closest('[data-cm-labopen]').setAttribute('aria-expanded', String(open)); return; }
      var rm = e.target.closest('[data-cm-labrm]'); if (rm) { var b2 = labSaved(); b2.splice(+rm.getAttribute('data-cm-labrm'), 1); store.set(K.lab, { saved: b2 }); renderLabSaved(); toast('Removed from your saved notes'); }
    });
  }
  function labText(n) {
    if (n.kind === 'pep') return n.title + ' · ' + n.cls + '\n\n' + n.rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n\n') + '\n\nDAILY LAB NOTE · PEPTICITY';
    return n.title + '\n\n' + n.body + '\nTry today: ' + n.tryToday + '\n\nDAILY LAB NOTE · PEPTICITY';
  }
  function shareLab() {
    var t = labText(labCur);
    if (navigator.share) { navigator.share({ title: 'DAILY LAB NOTE · PEPTICITY', text: t }).catch(function () {}); return; }
    var done = function () { toast('Copied. Paste it anywhere you like.'); }, fail = function () { toast('Copy is blocked in this browser'); };
    if (navigator.clipboard && W.isSecureContext) { navigator.clipboard.writeText(t).then(done, fail); return; }
    var ta = D.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0'; D.body.appendChild(ta); ta.select();
    var ok = false; try { ok = D.execCommand('copy'); } catch (e) {} ta.remove(); if (ok) done(); else fail();
  }
  function renderLab(date) {
    var s = $('#cmLab'); if (!s) return;
    labDate = date || Date.now();
    var d = new Date(labDate), n = noteFor(d); labCur = n;
    if (!n) { s.hidden = true; return; }
    var vials = W.PEP_VIALS || {}, img = n.kind === 'pep' && typeof vials[n.slug] === 'string' && /^data:image\/(webp|png|jpe?g);base64,/.test(vials[n.slug]) ? vials[n.slug] : '';
    var dateTxt = d.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' });
    var body;
    if (n.kind === 'pep') {
      body = '<div class="cm-lab__body' + (img ? '' : ' no-img') + '">' +
        (img ? '<figure class="btl cm-lab__btl" title="' + esc(n.title) + '"><div class="stage"><span class="pool"></span><div class="tiltb"><img src="' + img + '" alt="PEPTICITY ' + esc(n.title) + ' vial" decoding="async" draggable="false"></div></div><figcaption><span class="nm">' + esc(n.title) + '</span><small>' + esc(n.sizes) + '</small></figcaption></figure>' : '') +
        '<dl class="cm-lab__rows">' + n.rows.map(function (r, i) { return '<div style="--i:' + i + '"><dt>' + esc(r[0]) + '</dt><dd>' + rich(r[1]) + '</dd></div>'; }).join('') + '</dl></div>';
    } else {
      body = '<div class="cm-lab__body cm-lab__body--well"><p class="cm-well__body">' + esc(n.body) + '</p>' +
        '<div class="cm-try"><span class="cm-try__k">TRY TODAY</span><span class="cm-try__t">' + esc(n.tryToday) + '</span></div></div>';
    }
    s.innerHTML = '<span class="cm-shine" aria-hidden="true"></span>' +
      '<div class="cm-lab__head"><div><p class="eyebrow cm-lab__k"><span>DAILY LAB NOTE · <b>' + (n.kind === 'pep' ? 'PEPTIDE OF THE DAY' : 'WELLNESS TIP · ' + esc(n.cat)) + '</b></span></p>' + H(n.title, 'h2', 'cmLabT', 'cm-lab__h') +
      (n.kind === 'pep' ? '<p class="cm-lab__cls">' + esc(n.cls) + ' · ' + esc(n.sizes) + '</p>' : '') + '</div><time class="dw-date" datetime="' + iso(labDate) + '">' + esc(dateTxt) + '</time></div>' + body +
      '<div class="cm-lab__acts">' + B('SAVE', { cls: 'sm dw-save', icon: IC.heart, attrs: ' data-cm-labsave aria-pressed="false"' }) + B('SHARE', { cls: 'sm', icon: IC.share, attrs: ' data-cm-labshare' }) +
      '<button class="dw-sv-btn" type="button" data-cm-labopen aria-expanded="false" aria-controls="cmLabSaved">SAVED NOTES<b id="cmLabN">0</b></button></div>' +
      '<p class="cm-lab__foot">' + esc(n.kind === 'pep' ? LN.pepFoot : LN.wellFoot) + '</p>' +
      '<div class="dw-saved cm-lab__saved" id="cmLabSaved" hidden><h3 class="h3">SAVED NOTES</h3><ul class="dw-list" id="cmLabList"></ul></div>';
    s.classList.toggle('is-well', n.kind !== 'pep');
    renderLabSaved();
  }
  function renderLabSaved() {
    if (!labCur || !$('#cmLabList')) return;
    var a = labSaved(), k = labCur.key + '@' + iso(labDate || Date.now()), on = a.some(function (x) { return x.k === k; }), b = $('#cmLab [data-cm-labsave]');
    if (b) { b.setAttribute('aria-pressed', String(on)); setLabel(b, on ? 'SAVED' : 'SAVE'); }
    $('#cmLabN').textContent = String(a.length);
    $('#cmLabList').innerHTML = a.length ? a.map(function (x, i) { return '<li><div><p>' + esc(x.t) + '</p><span class="d">' + (x.kind === 'pep' ? 'PEPTIDE OF THE DAY' : 'WELLNESS TIP') + ' · SAVED ' + esc(up(x.d)) + '</span></div>' + X('Remove this saved note', ' data-cm-labrm="' + i + '"') + '</li>'; }).join('')
      : '<li class="dw-none"><p class="dw-empty">Tap SAVE on a note you like and it waits for you here.</p></li>';
  }
  function armMidnight() { var n = new Date(), m = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1, 0, 0, 3); clearTimeout(armMidnight._t); armMidnight._t = setTimeout(function () { renderLab(); refresh(); armMidnight(); }, m - n); }

  /* ================================================================
     4 · CONCIERGE (shared/bot/pep-bot.js, mounted by the coordinator)
     ================================================================ */
  function latestOrder() {
    var a = orderEls()[0];
    if (a) { var d = $$('.order-top .d', a).pop(); return { id: orderIdOf(a), status: d ? d.textContent.trim() : '' }; }
    return { id: '#PT-1088', status: 'Out for delivery' };
  }
  function orderAnswer() {
    var o = latestOrder();
    return 'Your latest order, ' + o.id + ', shows as ' + (o.status || 'in progress').toLowerCase() + ' (sample tracking). The full journey is under ORDERS + JOURNEY. To ask Grace directly, open the order and tap MESSAGE ABOUT THIS ORDER.';
  }
  function syncBotView() { D.documentElement.setAttribute('data-cm-view', curView()); }
  function addAskButton() {
    if ($('#cmAsk')) return;
    var live = $('#liveLine'), card = live && live.closest('.card'); if (!card) return;
    var w = D.createElement('div'); w.id = 'cmAsk'; w.className = 'cm-ask';
    w.innerHTML = B('ASK ABOUT MY ORDER', { cls: 'sm', icon: IC.chat, attrs: ' data-cm-ask' }) + '<span class="cm-ask__t">PEPTICITY CONCIERGE · an automated assistant, not a person</span>';
    var note = $('.note', card); if (note && note.parentNode === card) card.insertBefore(w, note); else card.appendChild(w);
    w.addEventListener('click', function (e) { if (e.target.closest('[data-cm-ask]')) askOrder(); });
  }
  function askOrder() {
    var Bt = W.PEPBOT; if (!Bt) { toast('The concierge is not on this page yet'); return; }
    try { Bt.open(); setTimeout(function () { Bt.ask('Where is my order?'); }, RM ? 0 : 280); } catch (e) {}
  }
  function mountConcierge(opts) {
    opts = opts || {};
    /* quiet by default inside the dashboard: the docked bar stays, the store's proactive sales greeting
       does not pop over a client's own dashboard (pass { greet: true } to keep it) */
    if (!opts.greet) { try { W.sessionStorage.setItem('pepbot:greeted', '1'); } catch (e) {} }
    function go() {
      var Bt = W.PEPBOT; if (!Bt) return false;
      try { if (Bt.brain && Bt.brain.L) Bt.brain.L.order = orderAnswer; } catch (e) {}
      D.documentElement.classList.add('cm-bot'); syncBotView(); addAskButton();
      return true;
    }
    if (W.PEPBOT) return go();
    if (opts.src && !$('script[data-cm-bot]')) {
      if (!W.PEPBOT_CONFIG) W.PEPBOT_CONFIG = { greetDelay: opts.greetDelay != null ? opts.greetDelay : 600000 };
      var sc = D.createElement('script'); sc.src = opts.src; sc.defer = true; sc.setAttribute('data-cm-bot', '1');
      sc.onload = function () { go(); if (opts.onReady) opts.onReady(); };
      D.body.appendChild(sc);
      return 'loading';
    }
    return false;
  }

  /* ================================================================
     BADGES, READ SYNC, NOTIFICATIONS, TYPING
     ================================================================ */
  function tabBadge(group, tab, n) {
    var t = $('.tabs[data-group="' + group + '"] .tab[data-tab="' + tab + '"]'); if (!t) return;
    var b = $('.cm-ub', t);
    if (n > 0) { if (!b) { b = D.createElement('span'); b.className = 'unread on cm-ub'; t.appendChild(b); } b.textContent = String(n); b.setAttribute('aria-label', n + ' unread'); }
    else if (b) b.remove();
  }
  function renderBadges() {
    var cOrd = unreadAll('client'), cAnn = unreadAnn().length, o = unreadAll('owner');
    tabBadge('client', 'orders', cOrd); tabBadge('client', 'cmsg', cOrd + cAnn); tabBadge('owner', 'omsg', o);
  }
  /* a thread only counts as READ when its messages are actually on screen in a visible tab */
  function inView(el) { if (!el || D.hidden || !visible(el)) return false; var r = el.getBoundingClientRect(); return r.bottom > 70 && r.top < (W.innerHeight || 800) - 40; }
  function clientBox(o) { return D.getElementById('cmMs-' + domId(o)); }
  function syncRead() {
    var ch = false, v = curView();
    if (v === 'client' && panelOn('orders')) Object.keys(openC).forEach(function (o) { if (openC[o] && inView(clientBox(o)) && markRead(o, 'client')) ch = true; });
    if (v === 'owner' && panelOn('omsg') && activeOT && inView($('#cmOTM'))) { if (markRead(activeOT, 'owner')) ch = true; }
    return ch;
  }
  function notify() {
    var v = curView(), seen = store.get(K.seen, {}), n = seen && typeof seen.n === 'object' && seen.n ? seen.n : {}, T = getThreads(), cand = null, ch = false;
    Object.keys(T).forEach(function (o) {
      msgsOf(T[o]).forEach(function (m) {
        var mineToSee = (v === 'client' && m.f === 'g') || (v === 'owner' && m.f === 'c');
        if (!mineToSee || m.read || n[m.id]) return;
        n[m.id] = 1; ch = true; if (!cand || m.at > cand.m.at) cand = { o: o, m: m };
      });
    });
    if (ch) { var ks = Object.keys(n); if (ks.length > 400) ks.slice(0, ks.length - 400).forEach(function (k) { delete n[k]; }); store.set(K.seen, { n: n }); }
    if (!cand) return;
    if (v === 'client') {
      if (openC[cand.o] && panelOn('orders') && inView(clientBox(cand.o))) return;
      replyToast('NEW REPLY · ORDER ' + cand.o, 'Grace: ' + clip(cand.m.t, 90), function () { goClient('orders', function () { openClientThread(cand.o, true); }); });
    } else {
      if (activeOT === cand.o && panelOn('omsg') && inView($('#cmOTM'))) return;
      var nm = str((T[cand.o] || {}).name, 40) || ME.name;
      replyToast('NEW MESSAGE · ORDER ' + cand.o, nm + ': ' + clip(cand.m.t, 90), function () { activeOT = cand.o; goOwner('omsg', function () { syncRead(); refresh(); var el = $('#cmOT'); if (el) el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'center' }); }); });
    }
  }
  function updateTyping() {
    orderEls().forEach(function (a) {
      var o = orderIdOf(a), row = a && $('.cm-oc__thread .cm-typing', a); if (!row) return;
      var on = isTyping('owner', o); if (row.hidden === on) row.hidden = !on;
    });
    var r2 = $('#cmOT .cm-typing'); if (r2) { var on2 = !!(activeOT && isTyping('client', activeOT)); if (r2.hidden === on2) r2.hidden = !on2; }
  }

  /* ================================================================
     REFRESH + MOUNT
     ================================================================ */
  var busy = false;
  function refresh() {
    if (busy) return; busy = true;
    try {
      if (syncRead()) { /* read state changed: everything below re-renders from the new state */ }
      renderBanner(); renderInbox(); renderNoteCard(); renderDue(); renderReminders(); injectRemind();
      renderClientThreads(); renderCheckins(); renderOwnerThreads(); renderPulse(); renderSent(); renderBadges();
      syncBotView();
    } finally { busy = false; }
    notify();
  }
  function mountOwner() {
    var p = $('#p-omsg'); if (!p || $('#cmOwnerA')) return;
    var g1 = D.createElement('div'); g1.id = 'cmOwnerA'; g1.className = 'grid g-2 mt cm-og';
    var g2 = D.createElement('div'); g2.id = 'cmOwnerB'; g2.className = 'grid g-2b mt cm-og';
    p.appendChild(g1); p.appendChild(g2);
    reveal(mountOwnerThreads(g1)); reveal(mountPulse(g1));
    reveal(mountAnnCompose(g2)); reveal(mountNoteEditor(g2));
  }
  function observe() {
    var ol = $('#orderList'); if (ol) new MutationObserver(function () { injectOrders(); }).observe(ol, { childList: true });
    var ba = $('#buyAgain'); if (ba) new MutationObserver(function () { injectRemind(); }).observe(ba, { childList: true });
    var onFlip = function () { syncBotView(); if (syncRead()) refresh(); else { renderBadges(); notify(); } };
    var vs = $('#vswitch'); if (vs) new MutationObserver(onFlip).observe(vs, { attributes: true, attributeFilter: ['data-v'] });
    $$('.view,.panel').forEach(function (el) { new MutationObserver(onFlip).observe(el, { attributes: true, attributeFilter: ['class'] }); });
    W.addEventListener('storage', function (e) {
      if (!e.key || e.key.indexOf('pep-comms-') !== 0) return;
      if (e.key === K.ty) { updateTyping(); return; }
      if (e.key === K.lab) { renderLabSaved(); return; }
      refresh();
    });
    setInterval(function () { if (!D.hidden) updateTyping(); }, 1000);
    var scT = 0; W.addEventListener('scroll', function () { if (scT) return; scT = setTimeout(function () { scT = 0; if (syncRead()) refresh(); }, 220); }, { passive: true });
    D.addEventListener('visibilitychange', function () { if (!D.hidden) { if (labDate && dayNum(new Date(labDate)) !== dayNum(new Date())) renderLab(); refresh(); } });
  }
  function mount() {
    VC = $('#view-client'); VO = $('#view-owner');
    if (!VC && !VO) return;
    readMe(); seedOnce();
    mountBanner(); mountNoteCard(); mountDue(); mountInbox(); mountReminders(); mountLab(); mountOwner();
    bindOrderEvents(); injectOrders(); injectRemind();
    renderLab(); armMidnight();
    observe(); refresh();
    W.PEPComms.__mounted = true;
  }

  W.PEPComms = {
    version: VERSION,
    mountConcierge: mountConcierge,
    askAboutOrder: askOrder,
    refresh: refresh,
    labNoteFor: function (date) { return noteFor(date ? new Date(date) : new Date()); },
    previewLab: function (offsetDays) { renderLab(Date.now() + (offsetDays || 0) * DAY); return labCur; },
    reset: function () { Object.keys(K).forEach(function (k) { try { W.localStorage.removeItem(K[k]); } catch (e) {} delete MEM[K[k]]; }); },
    keys: K
  };
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', mount); else mount();
})(typeof window !== 'undefined' ? window : undefined, typeof document !== 'undefined' ? document : undefined);
