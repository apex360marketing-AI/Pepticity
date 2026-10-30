/* APEX 360 START PAGE · SAMPLE (30 Oct)
   Everything is saved on this computer only (localStorage). No network calls, no tracking.
   Shortcuts: "/" search · "t" start / pause the timer · "1" "2" "3" tick the three things · Esc closes. */
(function () {
'use strict';
try { performance.mark('apx-js-start'); } catch (e) {}
var D = document, H = D.documentElement;
var RMQ = matchMedia('(prefers-reduced-motion: reduce)');
var RM = RMQ.matches;
var $ = function (s, r) { return (r || D).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
var store = {
  get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
var K = { acc: 'apx.start.acc', set: 'apx.start.settings', things: 'apx.start.things', tiles: 'apx.start.tiles', timer: 'apx.start.timer', chimed: 'apx.start.chimed' };
var pad = function (n) { return String(n).padStart(2, '0'); };
var SVGNS = 'http://www.w3.org/2000/svg';
/* tiny DOM builder: no innerHTML anywhere, user text is always set as plain text */
function el(tag, props, kids) {
  var n = props && props.svg ? D.createElementNS(SVGNS, tag) : D.createElement(tag);
  if (props) Object.keys(props).forEach(function (k) {
    var v = props[k]; if (k === 'svg' || v === null || v === undefined || v === false) return;
    if (k === 'text') n.textContent = v; else if (k === 'style') n.style.cssText = v; else n.setAttribute(k, v);
  });
  (kids || []).forEach(function (c) { if (c !== null && c !== undefined) n.appendChild(typeof c === 'string' ? D.createTextNode(c) : c); });
  return n;
}
function fill(parent, nodes) { parent.textContent = ''; nodes.forEach(function (c) { parent.appendChild(c); }); }

/* =====================================================================
   SETTINGS
   ===================================================================== */
var DEF = { name: 'MAVERICK', engine: 'google', h24: false, chime: false, haze: true, focus: 25, brk: 5 };
var S = Object.assign({}, DEF, store.get(K.set, {}));
function saveS() { store.set(K.set, S); }

/* =====================================================================
   ACCENT · the eight LEDs (same list, order and behaviour as dashboard-color)
   ===================================================================== */
var ACC = [
  { k: 'chartreuse', n: 'CHARTREUSE', hex: '#D4FF3A' }, { k: 'blue', n: 'ELECTRIC BLUE', hex: '#0066FF' },
  { k: 'cyan', n: 'ICE CYAN', hex: '#0FFFFF' }, { k: 'red', n: 'NEON RED', hex: '#FF004F' },
  { k: 'violet', n: 'ULTRAVIOLET', hex: '#6F00FF' }, { k: 'orchid', n: 'ORCHID', hex: '#8D029B' },
  { k: 'copper', n: 'COPPER', hex: '#C46210' }, { k: 'salmon', n: 'SALMON', hex: '#FA8072' }];
var accIdx = Math.max(0, ACC.findIndex(function (a) { return a.k === (store.get(K.acc, 'cyan') || 'cyan'); }));
if (accIdx < 0) accIdx = 2;
H.setAttribute('data-acc', ACC[accIdx].k);

/* =====================================================================
   CLOCK · greeting · date · TODAY'S WORD
   ===================================================================== */
var WORDS = [
 // consistency + showing up
 "Small and steady beats big and rare.",
 "You don’t need a perfect day. You need a next step.",
 "Show up today. Let tomorrow look after itself.",
 "Keep it simple, and keep it going.",
 "Some days you sprint. Some days you simply show up. Both count.",
 "Consistency is choosing the same small thing again.",
 "Do the easy version today. It still counts.",
 "A quiet routine, kept with care, is its own kind of luxury.",
 "Nobody sees the hundred small mornings. You will know they happened.",
 "Start from here, at a pace you can keep.",
 "One kept promise to yourself is worth ten big plans.",
 "The first five minutes are the hardest. Give yourself those five.",
 "Motivation comes and goes. A routine stays.",
 "Showing up tired is still showing up.",
 "Make it easy enough to say yes to. Then say yes again tomorrow.",
 "You are building something that doesn’t need an audience.",
 "Momentum is made of very ordinary days.",
 "Missed a day? Simply begin again. No penalty, no speech.",
 "The plan you follow beats the plan you admire.",
 "Repeat the basics with intention. There is no secret beyond that.",
 // movement
 "Take the stairs today and enjoy the climb.",
 "A short walk still counts as a walk.",
 "Stretch slowly, as if no one is watching.",
 "Move as much as feels right today, then call it a win.",
 "Stand up, roll your shoulders back, take one long breath.",
 "Your walk doesn’t need a destination today.",
 "Movement is a conversation with yourself. Keep it friendly.",
 "Ten minutes of moving is a perfectly good start.",
 "Dance in the kitchen. Joy counts as movement too.",
 "Take the long way home when you have the time.",
 "Find a pace you enjoy. Enjoyment is easier to repeat.",
 "Strong is a practice, not a finish line.",
 // sleep + rest
 "Dim the lights a little earlier tonight.",
 "Rest is part of the work, not a break from it.",
 "Put the phone down ten minutes sooner tonight.",
 "A calm evening is a kind gift to tomorrow morning.",
 "Same bedtime, most nights. Simple and steady.",
 "Let today end when it ends. The rest can wait until morning.",
 "Keep your bedroom for rest, not for worry.",
 "Sleep is not a prize for finishing everything. It belongs in the plan.",
 "Close the day kindly: name three things that went right.",
 "Tired is information, not a failure.",
 // water
 "Start the day with a glass of water and a slow breath.",
 "Keep a glass of water where you can see it.",
 "Refill your glass, and take a quiet moment while you do.",
 "Water first, then the world.",
 "A full bottle on the desk is a small promise to yourself.",
 "Sip, pause, carry on.",
 "Small rituals, like a glass of water, make a day feel cared for.",
 // sunlight + fresh air
 "Step outside this morning, even for a few minutes.",
 "Find the window seat today.",
 "Let some daylight in before the screens.",
 "Have your coffee by the window and look up now and then.",
 "Morning light, a slow breath, one plan for the day.",
 "Take your next call outside if you can.",
 "Notice the sky once today. Really notice it.",
 "Fresh air is a good place to think.",
 // patience
 "Good things often take longer than we’d like. Keep going anyway.",
 "Be patient with the process and gentle with yourself.",
 "Slow is still forward.",
 "Seasons change slowly. So do people.",
 "Today is one page, not the whole book.",
 "You’re not behind. You’re on your own timeline.",
 "Plant the seed, then stop digging it up to check.",
 "Patience is quiet confidence.",
 "Give it time. Give yourself time too.",
 "The waiting is part of the journey, not a gap in it.",
 "Steady is underrated.",
 "Be proud of how far you’ve come, and still be on your way.",
 // mindset
 "Speak to yourself the way you’d speak to a good friend.",
 "You can start your day over at any moment.",
 "Focus on the next right thing.",
 "Not every thought deserves your attention.",
 "Write it down, then let your mind put it down too.",
 "Choose one thing to do well today.",
 "Spend your attention on what matters to you.",
 "Curiosity is kinder than judgement. Try it on yourself.",
 "Do it with care, then let it go.",
 "Take one slow breath before you answer.",
 "Gratitude is a quiet way of saying: this is enough for now.",
 "Keep your eyes on your own lane today.",
 "You don’t have to feel ready. You only have to begin.",
 "Hard days are part of the story, not the end of it.",
 "Ask yourself what would make today feel good. Then do that.",
 "Simplify one thing today.",
 "Celebrate a small win out loud.",
 "Make room for joy on purpose.",
 "Start the morning gently. The day takes its tone from there.",
 "Let a good laugh into your day.",
 "Leave a little space in your calendar for nothing at all.",
 // kindness to yourself
 "Be as kind to yourself as you are to the people you love.",
 "You are allowed to rest without earning it.",
 "Forgive yesterday. You did what you could with what you had.",
 "Notice one thing you did well today.",
 "You’re doing better than you think.",
 "Gentleness is a strength.",
 "Say no to one thing so you can say yes to yourself.",
 "Treat yourself like someone worth looking after. You are.",
 "You don’t have to earn a slow morning.",
 "Your worth is not measured in productivity.",
 "Make a cup of something warm and sit down to drink it.",
 "You are allowed to change your mind and your pace.",
 // progress over perfection
 "Progress, not perfection. Every single time.",
 "Finished with care is better than perfect someday.",
 "Ninety percent, kept up, is better than one hundred percent, abandoned.",
 "A messy start is still a start.",
 "Look back a month, not a day. That’s where progress shows.",
 "Imperfect action, every day.",
 "Better is a direction, not a destination.",
 "Write down one small improvement from this week.",
 "Today is a fine day to begin.",
 "A good week is built from ordinary days done with care.",
 "Count the days you showed up, not the days you didn’t.",
 "Small steps, taken often, go a long way.",
 "Aim for steady, not spectacular.",
 "You are a work in progress, and that’s the best kind of work.",
 "Today’s version of you is enough to begin with.",
 "Keep going. Quietly, kindly, consistently.",
 "Nothing about today needs to be perfect to be good.",
 "Come back to the basics whenever you feel lost."
];
// same rule as the dashboard: local calendar day, stride 47 (coprime with 120) walks all 120 before repeating
function dayNum(d) { return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); }
function wordFor(d) { var n = dayNum(d), L = WORDS.length; return WORDS[((n * 47 + 11) % L + L) % L]; }

var clockH = $('#clockH'), hhEl = $('#hh'), mmEl = $('#mm'), apEl = $('#ap'), secBar = $('#secBar');
var shown = { hh: null, mm: null, day: null };
function setDg(el, v) { $$('span', el).forEach(function (s) { s.textContent = v; }); }
function greeting(h) {
  if (h >= 5 && h < 12) return 'GOOD MORNING';
  if (h >= 12 && h < 17) return 'GOOD AFTERNOON';
  if (h >= 17 && h < 23) return 'GOOD EVENING';
  return 'WORKING LATE';
}
function renderGreet(h) {
  var nm = (S.name || '').trim().toUpperCase();
  fill($('#greet'), nm ? [D.createTextNode(greeting(h) + ', '), el('span', { 'class': 'nm', text: nm })] : [D.createTextNode(greeting(h))]);
}
function glint() {
  if (RM) return;
  clockH.classList.remove('glint'); void clockH.offsetWidth; clockH.classList.add('glint');
  clearTimeout(glint._t); glint._t = setTimeout(function () { clockH.classList.remove('glint'); }, 2100);
}
function renderClock(first) {
  var now = new Date(), h = now.getHours(), m = now.getMinutes();
  var hh = S.h24 ? pad(h) : String(h % 12 || 12), mm = pad(m);
  var changed = false;
  if (hh !== shown.hh) { setDg(hhEl, hh); if (!first && !RM) roll(hhEl); shown.hh = hh; changed = true; }
  if (mm !== shown.mm) { setDg(mmEl, mm); if (!first && !RM) roll(mmEl); shown.mm = mm; changed = true; }
  apEl.textContent = S.h24 ? '' : (h < 12 ? 'AM' : 'PM');
  apEl.hidden = !!S.h24;
  clockH.setAttribute('aria-label', hh + ':' + mm + (S.h24 ? '' : ' ' + apEl.textContent));
  renderGreet(h);
  var dn = dayNum(now);
  if (dn !== shown.day) {
    shown.day = dn;
    var wd = now.toLocaleDateString('en-CA', { weekday: 'long' }), md = now.toLocaleDateString('en-CA', { month: 'long', day: 'numeric' });
    $('#date').textContent = (wd + ' · ' + md).toUpperCase();
    var w = wordFor(now);
    var parts = []; w.split(' ').forEach(function (x, i) { if (i) parts.push(D.createTextNode(' ')); parts.push(el('span', { 'class': 'w', style: '--i:' + i, text: x })); });
    fill($('#word'), parts);
  }
  // seconds hairline: one pass a minute, synced to the real clock
  secBar.style.animationDelay = (-(now.getSeconds() + now.getMilliseconds() / 1000)) + 's';
  if (changed && !first) glint();
}
function roll(el) { el.classList.remove('roll'); void el.offsetWidth; el.classList.add('roll'); setTimeout(function () { el.classList.remove('roll'); }, 900); }
var clockT = 0;
function scheduleClock() {
  clearTimeout(clockT);
  var now = new Date(), ms = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds()) + 30;
  clockT = setTimeout(function () { renderClock(false); scheduleClock(); }, ms);
}
renderClock(true); scheduleClock();
D.addEventListener('visibilitychange', function () { if (!D.hidden) { renderClock(false); scheduleClock(); syncTimerFromStore(); } });

/* =====================================================================
   SEARCH · Google by default, change it here or in SETTINGS
   ===================================================================== */
var ENG = [
  { k: 'google', n: 'GOOGLE', u: 'https://www.google.com/search?q=', d: 'google.com' },
  { k: 'duck', n: 'DUCKDUCKGO', u: 'https://duckduckgo.com/?q=', d: 'duckduckgo.com' },
  { k: 'bing', n: 'BING', u: 'https://www.bing.com/search?q=', d: 'bing.com' },
  { k: 'brave', n: 'BRAVE', u: 'https://search.brave.com/search?q=', d: 'search.brave.com' },
  { k: 'perplexity', n: 'PERPLEXITY', u: 'https://www.perplexity.ai/search?q=', d: 'perplexity.ai' },
  { k: 'kagi', n: 'KAGI', u: 'https://kagi.com/search?q=', d: 'kagi.com' }];
function eng() { return ENG.find(function (e) { return e.k === S.engine; }) || ENG[0]; }
var qIn = $('#q'), sWrap = $('#searchWrap');
function nice(n) { return n.charAt(0) + n.slice(1).toLowerCase(); }
function renderEngine() {
  var e = eng();
  $('#engName').textContent = e.n;
  $('#engBtn').setAttribute('aria-label', 'Search engine: ' + e.n + '. Change');
  qIn.placeholder = 'Search ' + (e.k === 'duck' ? 'DuckDuckGo' : nice(e.n)) + (innerWidth < 560 ? '' : ' or type a web address');
}
renderEngine();
function looksLikeUrl(v) {
  if (/\s/.test(v)) return false;
  if (/^https?:\/\//i.test(v)) return true;
  if (/^localhost(:\d+)?(\/|$)/i.test(v)) return true;
  return /^([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/\S*)?$/i.test(v);
}
$('#search').addEventListener('submit', function (e) {
  e.preventDefault();
  var v = qIn.value.trim(); if (!v) { qIn.focus(); return; }
  location.href = looksLikeUrl(v) ? (/^https?:\/\//i.test(v) ? v : (/^localhost/i.test(v) ? 'http://' : 'https://') + v) : eng().u + encodeURIComponent(v);
});
qIn.addEventListener('focus', function () { sWrap.classList.add('focus'); });
qIn.addEventListener('blur', function () { sWrap.classList.remove('focus'); });
qIn.addEventListener('input', function () { sWrap.classList.toggle('typed', !!qIn.value); });

/* =====================================================================
   TODAY'S 3 THINGS · ticked lines get a light-streak strike-through
   ===================================================================== */
var things = store.get(K.things, null);
if (!Array.isArray(things) || things.length !== 3) things = [{ t: '', d: false }, { t: '', d: false }, { t: '', d: false }];
var tasks = $$('.task'), thingsCard = $('#things');
var measureCtx = D.createElement('canvas').getContext('2d');
function textW(input) {
  var cs = getComputedStyle(input);
  measureCtx.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
  var w = measureCtx.measureText(input.value || '').width;
  return Math.min(w + 4, input.clientWidth);
}
function sizeStreak(i) { var li = tasks[i], inp = $('input', li); li.style.setProperty('--w', textW(inp).toFixed(1) + 'px'); }
function renderThings(init) {
  var n = 0;
  tasks.forEach(function (li, i) {
    var it = things[i], inp = $('input', li), chk = $('.chk', li);
    if (D.activeElement !== inp) inp.value = it.t;
    li.classList.toggle('done', !!it.d);
    chk.setAttribute('aria-checked', String(!!it.d));
    if (it.d) n++;
    if (!init) sizeStreak(i);
  });
  $('#tCount').textContent = n === 3 ? 'ALL 3 DONE' : n + ' / 3 DONE';
  var all = n === 3;
  thingsCard.classList.toggle('quiet', !!init);   // no celebration sweep when the page simply opens with all three done
  thingsCard.classList.toggle('all', all);
}
function saveThings() { store.set(K.things, things); }
function toggleThing(i, fromKey) {
  var li = tasks[i], inp = $('input', li);
  if (!things[i].t.trim() && !things[i].d) { inp.focus(); return; }   // an empty line: jump into it instead
  things[i].d = !things[i].d;
  saveThings();
  sizeStreak(i);
  li.classList.remove('streaking', 'flare', 'undoing');
  if (things[i].d) { void li.offsetWidth; li.classList.add('streaking', 'flare'); setTimeout(function () { li.classList.remove('streaking', 'flare'); }, 950); }
  else { li.classList.add('undoing'); setTimeout(function () { li.classList.remove('undoing'); }, 650); }
  renderThings(false);
  if (things[i].d) toast(things.every(function (x) { return x.d; }) ? 'ALL THREE DONE · NICE WORK' : 'TICKED · ' + (things.filter(function (x) { return x.d; }).length) + ' OF 3');
}
var saveT = 0;
tasks.forEach(function (li, i) {
  var inp = $('input', li);
  $('.chk', li).addEventListener('click', function () { toggleThing(i); });
  inp.addEventListener('input', function () {
    things[i].t = inp.value; sizeStreak(i);
    clearTimeout(saveT); saveT = setTimeout(saveThings, 250);
  });
  inp.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); saveThings(); var nx = tasks[i + 1]; if (nx) $('input', nx).focus(); else inp.blur(); }
  });
  inp.addEventListener('blur', function () { things[i].t = inp.value.trim(); inp.value = things[i].t; saveThings(); sizeStreak(i); });
});
$('#tClear').addEventListener('click', function () {
  var had = things.some(function (x) { return x.d; });
  things = things.map(function (x) { return x.d ? { t: '', d: false } : x; });
  saveThings(); renderThings(false);
  toast(had ? 'TICKED LINES CLEARED' : 'NOTHING TICKED YET');
});
function sizeAll() { tasks.forEach(function (_, i) { sizeStreak(i); }); }
requestAnimationFrame(function () { setTimeout(sizeAll, 0); });   // measured after the first frame, never before it
D.fonts && D.fonts.ready.then(sizeAll);
addEventListener('resize', function () { tasks.forEach(function (_, i) { sizeStreak(i); }); });
renderThings(true);

/* =====================================================================
   FOCUS TIMER · 25 / 5, glowing accent ring, optional soft chime (off by default)
   The state is shared by every new tab: start it here, it is still running in the next tab.
   ===================================================================== */
var tCard = $('#timer'), ring = $('#ring'), arc = $('#arc'), arcGlow = $('#arcGlow'), head = $('#head');
var T = store.get(K.timer, null);
function phaseLen(ph) { return (ph === 'break' ? S.brk : S.focus) * 60000; }
if (!T || !T.phase) T = { phase: 'focus', running: false, endAt: 0, left: phaseLen('focus'), round: 1 };
// bezel ticks
(function () {
  var g = $('#ticks'), lines = [];
  for (var i = 0; i < 60; i++) {
    var a = i * 6 * Math.PI / 180, maj = i % 5 === 0, r1 = maj ? 90 : 91.5, r2 = 95;
    lines.push(el('line', { svg: true, 'class': maj ? 'maj' : null, x1: (100 + r1 * Math.sin(a)).toFixed(2), y1: (100 - r1 * Math.cos(a)).toFixed(2), x2: (100 + r2 * Math.sin(a)).toFixed(2), y2: (100 - r2 * Math.cos(a)).toFixed(2) }));
  }
  fill(g, lines);
})();
function leftNow() { return T.running ? Math.max(0, T.endAt - Date.now()) : T.left; }
var lastSec = -1;
function renderTimer(snap) {
  var left = leftNow(), total = phaseLen(T.phase), sec = Math.ceil(left / 1000);
  var f = Math.min(1, Math.max(0, 1 - left / total));
  if (snap) { ring.classList.add('snap'); }
  var rem = (1 - f) * 1000;
  [arc, arcGlow].forEach(function (c) { c.style.strokeDasharray = rem.toFixed(2) + ' 1000'; c.style.strokeDashoffset = (-f * 1000).toFixed(2); });
  head.style.transform = 'rotate(' + (f * 360).toFixed(2) + 'deg)';
  if (snap) { void ring.offsetWidth; requestAnimationFrame(function () { ring.classList.remove('snap'); }); }
  $('#tMin').textContent = pad(Math.floor(sec / 60)); $('#tSec').textContent = pad(sec % 60);
  $('#tPhase').textContent = T.phase === 'break' ? 'BREAK' : 'FOCUS';
  $('#tRound').textContent = 'ROUND ' + T.round + ' · ' + S.focus + ' / ' + S.brk;
  tCard.dataset.phase = T.phase;
  tCard.classList.toggle('running', T.running);
  $('#tGoL').textContent = T.running ? 'PAUSE' : (left < total ? 'RESUME' : 'START');
  $('#mFocus').textContent = S.focus; $('#mBreak').textContent = S.brk;
  $('#mFocus').setAttribute('aria-checked', String(T.phase === 'focus')); $('#mBreak').setAttribute('aria-checked', String(T.phase === 'break'));
  D.title = T.running ? pad(Math.floor(sec / 60)) + ':' + pad(sec % 60) + ' · ' + (T.phase === 'break' ? 'BREAK' : 'FOCUS') : 'NEW TAB · APEX 360';
  lastSec = sec;
}
function saveT2() { store.set(K.timer, T); }
var tickI = 0, endT = 0;
function loop() {
  clearInterval(tickI); clearTimeout(endT);
  if (!T.running) return;
  tickI = setInterval(function () {
    var left = leftNow();
    if (left <= 0) { complete(); return; }
    if (Math.ceil(left / 1000) !== lastSec) renderTimer(false);
  }, 200);
  endT = setTimeout(function () { if (T.running && leftNow() <= 0) complete(); }, Math.max(0, T.endAt - Date.now()) + 20);
}
function complete() {
  var fresh = store.get(K.timer, null);
  if (fresh && (fresh.endAt !== T.endAt || fresh.phase !== T.phase)) { T = fresh; renderTimer(true); loop(); return; }   // another tab already moved on
  var endedAt = T.endAt;
  if (S.chime && String(store.get(K.chimed, '')) !== String(endedAt)) { store.set(K.chimed, String(endedAt)); chime(); }
  if (T.phase === 'focus') { T.phase = 'break'; T.left = phaseLen('break'); T.running = true; T.endAt = Date.now() + T.left; toast('FOCUS DONE · TAKE ' + S.brk + ' MINUTES'); }
  else { T.phase = 'focus'; T.round += 1; T.left = phaseLen('focus'); T.running = false; T.endAt = 0; toast('BREAK OVER · PRESS T WHEN READY'); }
  saveT2(); renderTimer(true); loop();
  if (!RM) { tCard.classList.remove('ended'); void tCard.offsetWidth; tCard.classList.add('ended'); setTimeout(function () { tCard.classList.remove('ended'); }, 1500); }
}
function startPause() {
  if (T.running) { T.left = leftNow(); T.running = false; T.endAt = 0; }
  else { if (T.left <= 0) T.left = phaseLen(T.phase); T.running = true; T.endAt = Date.now() + T.left; if (S.chime) audio(); }
  saveT2(); renderTimer(false); loop();
}
function resetTimer(ph) { T.phase = ph || 'focus'; T.running = false; T.endAt = 0; T.left = phaseLen(T.phase); if (!ph) T.round = 1; saveT2(); renderTimer(true); loop(); }
function syncTimerFromStore() { var f = store.get(K.timer, null); if (f && f.phase) { T = f; renderTimer(true); loop(); } }
$('#tGo').addEventListener('click', startPause);
$('#tReset').addEventListener('click', function () { resetTimer(); });
$$('.tmode button').forEach(function (b) { b.addEventListener('click', function () { if (T.phase !== b.dataset.ph || T.running) resetTimer(b.dataset.ph); }); });
renderTimer(true); loop();

/* the chime: generated, two soft bell notes; nothing is downloaded */
var ac = null;
function audio() {
  try {
    if (!ac) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ac = new C(); }
    if (ac.state === 'suspended') ac.resume();
  } catch (e) { return null; }
  return ac;
}
function chime() {
  var a = audio(); if (!a) return;
  var t0 = a.currentTime + .02, master = a.createGain(); master.gain.value = .5; master.connect(a.destination);
  [[1318.5, 0], [987.8, .42]].forEach(function (n) {
    [[1, .16], [2.01, .045], [3.02, .018]].forEach(function (p) {
      var o = a.createOscillator(), g = a.createGain(), t = t0 + n[1];
      o.type = 'sine'; o.frequency.value = n[0] * p[0];
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(p[1], t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + 2.2 / p[0] + .4);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 2.8);
    });
  });
}
function renderChime() {
  var b = $('#chimeBtn'); b.setAttribute('aria-pressed', String(!!S.chime)); b.textContent = S.chime ? 'CHIME ON' : 'CHIME OFF';
}
$('#chimeBtn').addEventListener('click', function () { S.chime = !S.chime; saveS(); renderChime(); renderSettings(); if (S.chime) chime(); });
renderChime();

/* =====================================================================
   QUICK TILES · glass with chipped corners; EDIT adds and removes; saved locally
   ===================================================================== */
var DEF_TILES = [
  { n: "GRACE'S DASHBOARD", u: 'https://apex360marketing-ai.github.io/Pepticity/graces-dashboard/', m: 'GD' },
  { n: 'PEPTICITY SITE', u: 'https://apex360marketing-ai.github.io/Pepticity/site/', m: 'PS' },
  { n: 'GRACE REVIEW', u: 'https://apex360marketing-ai.github.io/Pepticity/grace/', m: 'GR' },
  { n: 'GMAIL', u: 'https://mail.google.com', m: 'GM' },
  { n: 'CALENDAR', u: 'https://calendar.google.com', m: 'CA' },
  { n: 'CLAUDE', u: 'https://claude.ai/code', m: 'CL' },
  { n: 'HIGGSFIELD', u: 'https://higgsfield.ai', m: 'HF' },
  { n: 'GITHUB', u: 'https://github.com/apex360marketing-AI/Pepticity', m: 'GH' }];
var tiles = store.get(K.tiles, null);
if (!Array.isArray(tiles)) tiles = DEF_TILES.slice();
var editing = false, tilesBox = $('#tiles'), tgrid = $('#tgrid');
function mono(n) {
  var w = String(n).toUpperCase().replace(/[^A-Z0-9 ]/g, '').split(/\s+/).filter(Boolean);
  if (!w.length) return '··';
  return w.length > 1 ? w[0][0] + w[1][0] : w[0].slice(0, 2);
}
function subOf(u) {
  try {
    var x = new URL(u), host = x.hostname.replace(/^www\./, '');
    if (/github\.io$/.test(host)) { var seg = x.pathname.split('/').filter(Boolean); return seg.length ? seg[seg.length - 1] : host; }
    if (host === 'github.com') { var p = x.pathname.split('/').filter(Boolean); return p.length > 1 ? 'github · ' + p[1] : host; }
    return host;
  } catch (e) { return u; }
}
function safeUrl(u) {
  u = String(u || '').trim(); if (!u) return '';
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  try { var x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href : ''; } catch (e) { return ''; }
}
function renderTiles() {
  var nodes = tiles.map(function (t, i) {
    var href = /^https?:\/\//i.test(String(t.u)) ? String(t.u) : '#';
    return el('a', { 'class': 'tile glass sweep', href: href, 'data-i': i }, [
      el('span', { 'class': 'mono', 'aria-hidden': 'true', text: t.m || mono(t.n) }),
      el('span', { 'class': 'tmeta' }, [el('span', { 'class': 'tname', text: t.n }), el('span', { 'class': 'tsub', text: subOf(t.u) })]),
      editing ? el('button', { 'class': 'x', type: 'button', 'data-x': i, 'aria-label': 'Remove ' + t.n, text: '×' }) : null]);
  });
  if (editing) nodes.push(el('form', { 'class': 'tile glass add', id: 'addTile', autocomplete: 'off' }, [
    el('label', { 'class': 'sr', 'for': 'aName', text: 'Tile name' }), el('input', { 'class': 'field', id: 'aName', placeholder: 'NAME', maxlength: '28', required: '' }),
    el('label', { 'class': 'sr', 'for': 'aUrl', text: 'Web address' }), el('input', { 'class': 'field', id: 'aUrl', placeholder: 'Web address', inputmode: 'url', required: '' }),
    el('button', { 'class': 'gbtn primary sweep', type: 'submit' }, [el('span', { 'class': 'gbtn-l', text: 'ADD' })])]));
  fill(tgrid, nodes);
  tilesBox.classList.toggle('editing', editing);
  var eb = $('#tEdit'); eb.textContent = editing ? 'DONE' : 'EDIT'; eb.setAttribute('aria-pressed', String(editing));
  chipTiles();
  var f = $('#addTile');
  if (f) f.addEventListener('submit', function (e) {
    e.preventDefault();
    var n = $('#aName').value.trim().toUpperCase(), u = safeUrl($('#aUrl').value);
    if (!n) { $('#aName').focus(); return; }
    if (!u) { $('#aUrl').focus(); toast('THAT WEB ADDRESS LOOKS WRONG'); return; }
    tiles.push({ n: n, u: u, m: mono(n) }); store.set(K.tiles, tiles); renderTiles(); toast('TILE ADDED · ' + n);
    var a = $('#aName'); if (a) a.focus();
  });
}
/* every tile gets its own cut: the big chip points to the outside of the grid, the small one sits opposite */
function chipTiles() {
  var items = $$('.tile', tgrid), n = items.length; if (!n) return;
  var cols = matchMedia('(max-width: 720px)').matches ? 2 : matchMedia('(max-width: 1140px)').matches ? 4 : 2;   // mirrors the CSS breakpoints, no forced layout
  var plain = items.filter(function (el) { return !el.classList.contains('add'); }), rows = Math.ceil(plain.length / cols);
  plain.forEach(function (el, i) {
    var r = Math.floor(i / cols), c = i % cols;
    var top = r < rows / 2, left = c < cols / 2;
    var edgeR = r === 0 || r === rows - 1, edgeC = c === 0 || c === cols - 1;
    var big = 8 + (edgeR ? 6 : 0) + (edgeC ? 6 : 0) + (cols <= 2 ? 0 : 0), small = 5;
    var v = { tl: 0, tr: 0, br: 0, bl: 0 };
    if (top && left) { v.tl = big; v.br = small; } else if (top) { v.tr = big; v.bl = small; } else if (left) { v.bl = big; v.tr = small; } else { v.br = big; v.tl = small; }
    ['tl', 'tr', 'br', 'bl'].forEach(function (k) { el.style.setProperty('--' + k, v[k] + 'px'); });
  });
  var add = $('.tile.add', tgrid); if (add) { add.style.setProperty('--tl', '10px'); add.style.setProperty('--br', '10px'); }
}
var removed = null;
tgrid.addEventListener('click', function (e) {
  var x = e.target.closest('[data-x]');
  if (x) {
    e.preventDefault(); e.stopPropagation();
    var i = +x.dataset.x; removed = { t: tiles[i], i: i };
    tiles.splice(i, 1); store.set(K.tiles, tiles); renderTiles();
    toast('REMOVED · ' + removed.t.n, function () { if (!removed) return; tiles.splice(Math.min(removed.i, tiles.length), 0, removed.t); store.set(K.tiles, tiles); removed = null; renderTiles(); });
    return;
  }
  if (editing && e.target.closest('a.tile')) e.preventDefault();
});
$('#tEdit').addEventListener('click', function () { editing = !editing; renderTiles(); if (editing) { var a = $('#aName'); if (a) a.focus(); } });
var chipT = 0; addEventListener('resize', function () { clearTimeout(chipT); chipT = setTimeout(chipTiles, 120); });
renderTiles();

/* =====================================================================
   TOAST
   ===================================================================== */
var toastEl = $('#toast'), toastUndo = $('#toastUndo'), toastT = 0, undoFn = null;
function toast(msg, undo) {
  $('#toastT').textContent = msg; undoFn = undo || null; toastUndo.hidden = !undo;
  toastEl.hidden = false; void toastEl.offsetWidth; toastEl.classList.add('on'); D.body.classList.add('toasting');
  clearTimeout(toastT); toastT = setTimeout(hideToast, undo ? 6000 : 2400);
}
function hideToast() { toastEl.classList.remove('on'); D.body.classList.remove('toasting'); setTimeout(function () { if (!toastEl.classList.contains('on')) toastEl.hidden = true; }, RM ? 0 : 350); }
toastUndo.addEventListener('click', function () { if (undoFn) undoFn(); undoFn = null; hideToast(); });

/* =====================================================================
   POPOVERS · YOUR COLOUR (click = next colour, hold or chevron = all eight) · SEARCH WITH
   ===================================================================== */
var sw = $('#accSwBtn'), lab = $('#accLab'), more = $('#accMore'), accPop = $('#accPop'), accList = $('#accList');
var knob = $('.accsw-knob', sw), led = $('.accsw-led', sw), tickBox = $('.accsw-ticks', sw);
var ang = accIdx * 45;
fill(tickBox, ACC.map(function (a, i) { return el('i', { style: '--n:' + i + ';--tc:' + a.hex }); }));
fill(accList, ACC.map(function (a, i) { return el('li', { role: 'none' }, [el('button', { type: 'button', role: 'option', 'data-i': i, style: '--c2:' + a.hex }, [el('span', { 'class': 'dot', 'aria-hidden': 'true' }), el('b', { text: a.n }), el('small', { text: a.hex })])]); }));
var accOpts = $$('[role="option"]', accList);
function paintAcc() {
  var a = ACC[accIdx];
  knob.style.setProperty('--ang', ang + 'deg');
  Array.prototype.forEach.call(tickBox.children, function (t, i) { t.classList.toggle('on', i === accIdx); });
  sw.setAttribute('aria-valuenow', String(accIdx + 1)); sw.setAttribute('aria-valuetext', a.n);
  sw.setAttribute('aria-label', 'YOUR COLOUR: ' + a.n); sw.title = a.n + ' · click for the next colour, hold for all eight';
  accOpts.forEach(function (o, i) { o.setAttribute('aria-selected', String(i === accIdx)); o.tabIndex = i === accIdx ? 0 : -1; });
}
function setAcc(i, how) {
  i = (i + ACC.length) % ACC.length; if (i === accIdx && how !== 'init') return;
  var step = ((i - accIdx) % 8 + 8) % 8; if (how === 'prev') step = -(((accIdx - i) % 8 + 8) % 8); else if (how === 'jump' && step > 4) step -= 8;
  ang += step * 45; accIdx = i;
  H.setAttribute('data-acc', ACC[i].k); store.set(K.acc, ACC[i].k);
  paintAcc();
  if (how !== 'init' && how !== 'sync') { led.classList.remove('flare'); void led.offsetWidth; led.classList.add('flare'); }
}
paintAcc();
var holdT = 0, held = false;
sw.addEventListener('pointerdown', function (e) { if (e.button) return; held = false; clearTimeout(holdT); holdT = setTimeout(function () { held = true; openPop(accPop, sw); }, 480); });
['pointerup', 'pointerleave', 'pointercancel'].forEach(function (t) { sw.addEventListener(t, function () { clearTimeout(holdT); }); });
sw.addEventListener('contextmenu', function (e) { e.preventDefault(); });
sw.addEventListener('click', function () { if (held) { held = false; return; } setAcc(accIdx + 1, 'next'); });
sw.addEventListener('keydown', function (e) {
  var k = e.key, m = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[k];
  if (m) { e.preventDefault(); setAcc(accIdx + m, m > 0 ? 'next' : 'prev'); }
  else if (k === 'Home') { e.preventDefault(); setAcc(0, 'jump'); } else if (k === 'End') { e.preventDefault(); setAcc(7, 'jump'); }
  else if (k === 'Enter' || k === ' ') { e.preventDefault(); setAcc(accIdx + 1, 'next'); }
});
var popFrom = null, openP = null;
function placePop(p) {
  var anchor = p === accPop ? $('.accsw-body') : $('#engBtn'), r = anchor.getBoundingClientRect(), w = p.offsetWidth || 236;
  var l = p === accPop ? r.right - w : r.left;
  p.style.left = Math.min(innerWidth - w - 8, Math.max(8, l)) + 'px'; p.style.top = (r.bottom + 10) + 'px';
}
function openPop(p, from) {
  closePop(false);
  popFrom = from; openP = p; p.hidden = false; placePop(p);
  (p === accPop ? [lab, more] : [$('#engBtn')]).forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
  requestAnimationFrame(function () { p.classList.add('on'); var sel = $('[aria-selected="true"]', p) || $('[role="option"]', p); if (sel) sel.focus({ preventScroll: true }); });
}
function closePop(refocus) {
  if (!openP) return; var p = openP; openP = null;
  p.classList.remove('on'); [lab, more, $('#engBtn')].forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
  setTimeout(function () { if (!p.classList.contains('on')) p.hidden = true; }, RM ? 0 : 300);
  if (refocus && popFrom) popFrom.focus({ preventScroll: true });
}
[lab, more].forEach(function (b) { b.addEventListener('click', function () { openP === accPop ? closePop(true) : openPop(accPop, b); }); });
accList.addEventListener('click', function (e) { var o = e.target.closest('[role="option"]'); if (!o) return; setAcc(+o.dataset.i, 'jump'); closePop(true); });
// search engine list
var engList = $('#engList');
fill(engList, ENG.map(function (e) { return el('li', { role: 'none' }, [el('button', { type: 'button', role: 'option', 'data-k': e.k }, [el('span', { 'class': 'tick', 'aria-hidden': 'true' }), el('b', { text: e.n }), el('small', { text: e.d })])]); }));
function paintEngList() { $$('[role="option"]', engList).forEach(function (o) { var on = o.dataset.k === S.engine; o.setAttribute('aria-selected', String(on)); o.tabIndex = on ? 0 : -1; }); }
paintEngList();
$('#engBtn').addEventListener('click', function () { openP === $('#engPop') ? closePop(true) : openPop($('#engPop'), $('#engBtn')); });
engList.addEventListener('click', function (e) {
  var o = e.target.closest('[role="option"]'); if (!o) return;
  S.engine = o.dataset.k; saveS(); renderEngine(); paintEngList(); renderSettings(); closePop(false); qIn.focus();
});
[accList, engList].forEach(function (list) {
  list.addEventListener('keydown', function (e) {
    var opts = $$('[role="option"]', list), i = opts.indexOf(D.activeElement), m = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (m) { e.preventDefault(); opts[(i + m + opts.length) % opts.length].focus(); }
    else if (e.key === 'Home') { e.preventDefault(); opts[0].focus(); } else if (e.key === 'End') { e.preventDefault(); opts[opts.length - 1].focus(); }
    else if (e.key === 'Tab') closePop(false);
  });
});
D.addEventListener('pointerdown', function (e) {
  if (openP && !openP.contains(e.target) && !e.target.closest('.accsw') && !e.target.closest('#engBtn')) closePop(false);
  if (setOpen && !setEl.contains(e.target) && !e.target.closest('#setBtn')) closeSettings(false);
}, true);
addEventListener('resize', function () { if (openP) placePop(openP); });

/* =====================================================================
   SETTINGS
   ===================================================================== */
var setEl = $('#settings'), setBtn = $('#setBtn'), setOpen = false;
fill($('#sEng'), ENG.map(function (e) { return el('button', { type: 'button', role: 'radio', 'data-v': e.k, text: e.n }); }));
function segSet(id, v) { $$('#' + id + ' button').forEach(function (b) { b.setAttribute('aria-checked', String(b.dataset.v === String(v))); }); }
function renderSettings() {
  if (D.activeElement !== $('#sName')) $('#sName').value = S.name;
  segSet('sEng', S.engine); segSet('sClock', S.h24 ? '24' : '12'); segSet('sChime', S.chime ? '1' : '0'); segSet('sHaze', S.haze ? '1' : '0');
  $('#sFocus').value = S.focus; $('#sBreak').value = S.brk;
}
function openSettings() { renderSettings(); setEl.hidden = false; setOpen = true; setBtn.setAttribute('aria-expanded', 'true'); requestAnimationFrame(function () { setEl.classList.add('on'); $('#sName').focus({ preventScroll: true }); }); }
function closeSettings(refocus) {
  if (!setOpen) return; setOpen = false; setEl.classList.remove('on'); setBtn.setAttribute('aria-expanded', 'false');
  setTimeout(function () { if (!setOpen) setEl.hidden = true; }, RM ? 0 : 320); if (refocus) setBtn.focus({ preventScroll: true });
}
setBtn.addEventListener('click', function () { setOpen ? closeSettings(true) : openSettings(); });
$('#setClose').addEventListener('click', function () { closeSettings(true); });
$('#sName').addEventListener('input', function () { S.name = this.value.toUpperCase().slice(0, 24); saveS(); renderGreet(new Date().getHours()); });
$('#sEng').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; S.engine = b.dataset.v; saveS(); renderEngine(); paintEngList(); renderSettings(); });
$('#sClock').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; S.h24 = b.dataset.v === '24'; saveS(); shown.hh = null; renderClock(false); renderSettings(); });
$('#sChime').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; S.chime = b.dataset.v === '1'; saveS(); renderChime(); renderSettings(); if (S.chime) chime(); });
$('#sHaze').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; S.haze = b.dataset.v === '1'; saveS(); renderSettings(); hazeToggle(); });
function minutes(el, key, max) {
  el.addEventListener('change', function () {
    var v = Math.round(+el.value); if (!(v >= 1)) v = DEF[key]; v = Math.min(max, v); S[key] = v; el.value = v; saveS();
    if (!T.running) { T.left = phaseLen(T.phase); saveT2(); }
    renderTimer(true);
  });
}
minutes($('#sFocus'), 'focus', 120); minutes($('#sBreak'), 'brk', 60);
$('#sTilesReset').addEventListener('click', function () { tiles = DEF_TILES.slice(); store.set(K.tiles, tiles); renderTiles(); toast('TILES RESET'); });

/* =====================================================================
   KEYBOARD
   ===================================================================== */
function typing(el) { return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable); }
D.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    if (openP) { e.preventDefault(); closePop(true); return; }
    if (setOpen) { e.preventDefault(); closeSettings(true); return; }
    if (editing) { editing = false; renderTiles(); return; }
    if (typing(D.activeElement)) { D.activeElement.blur(); return; }
    return;
  }
  if (e.metaKey || e.ctrlKey || e.altKey || e.isComposing) return;
  if (typing(e.target) || typing(D.activeElement)) return;
  if (openP || setOpen) return;
  if (e.key === '/') { e.preventDefault(); qIn.focus(); qIn.select(); return; }
  if (e.key === 't' || e.key === 'T') { e.preventDefault(); startPause(); pressFx($('#tGo')); return; }
  if (e.key === '1' || e.key === '2' || e.key === '3') { e.preventDefault(); toggleThing(+e.key - 1, true); }
});
function pressFx(el) { if (RM || !el) return; el.animate([{ transform: 'scale(1)' }, { transform: 'scale(.96)' }, { transform: 'scale(1)' }], { duration: 260, easing: 'cubic-bezier(.16,1,.3,1)' }); }

/* =====================================================================
   SYNC between open tabs (each new tab already reads the saved state)
   ===================================================================== */
addEventListener('storage', function (e) {
  if (e.key === K.timer) syncTimerFromStore();
  else if (e.key === K.things) { var v = store.get(K.things, null); if (Array.isArray(v) && v.length === 3) { things = v; renderThings(true); } }
  else if (e.key === K.tiles) { var t = store.get(K.tiles, null); if (Array.isArray(t)) { tiles = t; renderTiles(); } }
  else if (e.key === K.acc) { var i = ACC.findIndex(function (a) { return a.k === store.get(K.acc, ''); }); if (i >= 0) setAcc(i, 'sync'); }
  else if (e.key === K.set) { S = Object.assign({}, DEF, store.get(K.set, {})); renderEngine(); paintEngList(); renderChime(); shown.hh = null; renderClock(false); renderTimer(true); }
});

/* =====================================================================
   GROUND · the Higgsfield city fades in and drifts; pointer parallax; BG-P01 smoke haze (desktop only)
   ===================================================================== */
var city = $('#city'), img = $('.city img');
function cityOn() { city.classList.add('on'); }
if (img.complete && img.naturalWidth) cityOn(); else { img.addEventListener('load', cityOn); img.addEventListener('error', cityOn); }
var DESK = matchMedia('(min-width: 900px) and (hover: hover)').matches;
if (DESK && !RM) {
  var tx = 0, ty = 0, px = 0, py = 0, praf = 0;
  addEventListener('pointermove', function (e) { tx = (e.clientX / innerWidth - .5); ty = (e.clientY / innerHeight - .5); if (!praf) praf = requestAnimationFrame(par); }, { passive: true });
  var par = function () {
    px += (tx - px) * .06; py += (ty - py) * .06;
    city.style.transform = 'translate3d(' + (-px * 18).toFixed(2) + 'px,' + (-py * 12).toFixed(2) + 'px,0)';
    praf = (Math.abs(tx - px) > .001 || Math.abs(ty - py) > .001) ? requestAnimationFrame(par) : 0;
  };
}

/* BG-P01 · SILVER SMOKE (brand/ui/smoke-bg.js, shader unchanged): lower resolution, 30 fps, paused when the tab is hidden */
var haze = null;
function hazeToggle() {
  var want = S.haze && DESK;
  if (want && !haze) haze = PCSmokeLite($('#haze'));
  if (haze) haze.enable(want);
}
function PCSmokeLite(cv) {
  var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FS = 'precision highp float;\n' +
  'uniform vec2 r;uniform float t;uniform vec2 m;uniform float rip;uniform float mode;\n' +
  'float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\n' +
  'float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}\n' +
  'float fbm(vec2 p){float v=0.,a=.5;mat2 R=mat2(.8,.6,-.6,.8);for(int i=0;i<4;i++){v+=a*n2(p);p=R*p*2.03;a*=.5;}return v;}\n' +
  'float H(vec2 p){vec2 q=p*.9;vec2 w=vec2(fbm(q+vec2(0.,t*.040)),fbm(q+vec2(5.2,-t*.034)));float h=fbm(q*1.3+w*1.9+vec2(t*.022,0.));float d=length(p-m);h+=.05*sin(d*30.-t*3.)*exp(-d*3.4)*rip;h+=.18*exp(-d*d*7.)*rip;return h;}\n' +
  'float env(vec3 R){float sky=.10*smoothstep(-.4,1.,R.y);float band=1.0*exp(-pow((R.y-.30)*7.,2.));float band2=.55*exp(-pow((R.y+.12)*10.,2.));float v1=.62*exp(-pow((R.x+.62)*10.,2.));float v2=.45*exp(-pow((R.x-.55)*13.,2.));return .012+sky+band+band2+v1+v2;}\n' +
  'void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=(gl_FragCoord.xy-.5*r)/r.y;float e=1.6/r.y;float h=H(p);\n' +
  'vec3 n=normalize(vec3(-(H(p+vec2(e,0.))-h)/e*.11,-(H(p+vec2(0.,e))-h)/e*.11,1.));vec3 R=reflect(vec3(0.,0.,-1.),n);float fres=pow(1.-max(n.z,0.),3.);float E=env(R);float L=E+fres*.35;float d=length(p-m);\n' +
  'L+=.28*exp(-d*d*9.)*(.4+.6*smoothstep(.2,1.,E));float spec=pow(max(dot(n,normalize(vec3(.35,.55,1.))),0.),220.);vec2 sp=p*1.2+vec2(t*.016,-t*.011);float sm=fbm(sp+fbm(sp*1.7+vec2(t*.02))*1.4);float wisp=smoothstep(.42,.86,sm);\n' +
  'float vig=mix(.40,.80,smoothstep(1.3,0.,length(uv-vec2(.5,.46))));\n' +
  'vec3 tint=vec3(.86,.885,.92);vec3 col=L*tint+vec3(.9)*spec*.45+tint*wisp*.10;col*=vig;col=1.-exp(-col*1.2);col=pow(col,vec3(1.55))*.66;float lum=dot(col,vec3(.3333));\n' +
  'vec3 base=vec3(.043,.043,.047);vec3 uvb=vec3(.070,.058,.100);float uvm=(1.-smoothstep(0.,.16,lum))*smoothstep(.25,.85,sm);col=max(col,mix(base,uvb,uvm*.85));gl_FragColor=vec4(col,1.);}';
  var api = { enable: function () {} };
  var gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
  if (!gl) return api;
  function sh(type, src) { var o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
  var pr;
  try { pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr); }
  catch (err) { return api; }
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var U = { r: gl.getUniformLocation(pr, 'r'), t: gl.getUniformLocation(pr, 't'), m: gl.getUniformLocation(pr, 'm'), rip: gl.getUniformLocation(pr, 'rip'), mode: gl.getUniformLocation(pr, 'mode') };
  var scale = Math.min(devicePixelRatio || 1, 1.5) * .34;
  function size() { var b = cv.getBoundingClientRect(); cv.width = Math.max(2, b.width * scale | 0); cv.height = Math.max(2, b.height * scale | 0); gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U.r, cv.width, cv.height); }
  var mx = .25, my = .1, tx2 = .25, ty2 = .1, rip = 0, lastMove = 0, raf = 0, on = false, last = 0, t0 = performance.now() - 8000;
  api.frames = 0;
  function draw(now) {
    mx += (tx2 - mx) * .07; my += (ty2 - my) * .07;
    rip += ((now - lastMove < 900 ? 1 : 0) - rip) * .04;
    gl.uniform1f(U.t, RM ? 14 : (now - t0) / 1000); gl.uniform2f(U.m, mx, my); gl.uniform1f(U.rip, .3 + rip * .6); gl.uniform1f(U.mode, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); api.frames++;
  }
  function loopG(now) { raf = requestAnimationFrame(loopG); if (now - last < 32) return; last = now; draw(now); }
  function start() { if (raf || !on || D.hidden) return; if (RM) { draw(performance.now()); return; } raf = requestAnimationFrame(loopG); }
  function stop() { cancelAnimationFrame(raf); raf = 0; }
  size(); draw(performance.now());
  addEventListener('resize', function () { size(); draw(performance.now()); });
  addEventListener('pointermove', function (e) { var a = innerWidth / Math.max(1, innerHeight); tx2 = (e.clientX / innerWidth - .5) * a; ty2 = .5 - e.clientY / innerHeight; lastMove = performance.now(); }, { passive: true });
  D.addEventListener('visibilitychange', function () { D.hidden ? stop() : start(); });
  cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); stop(); cv.classList.remove('on'); });
  api.enable = function (v) { on = !!v; cv.classList.toggle('on', on); on ? start() : stop(); };
  return api;
}
// start the smoke well after the first paint so it never delays the page
function afterPaint() { requestAnimationFrame(function () { requestAnimationFrame(function () { setTimeout(hazeToggle, 350); }); }); }
if (D.readyState === 'complete') afterPaint(); else addEventListener('load', afterPaint);

try { performance.mark('apx-js-done'); } catch (e) {}
window.__apxStart = { S: S, T: function () { return T; }, things: function () { return things; }, tiles: function () { return tiles; }, haze: function () { return haze; }, setAcc: function (k) { var i = ACC.findIndex(function (a) { return a.k === k; }); if (i >= 0) setAcc(i, 'jump'); } };
})();
