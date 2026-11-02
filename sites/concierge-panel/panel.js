/* CONCIERGE tab (preview). Sample data only; no network calls. */
(function () {
  'use strict';
  var root = document.getElementById('p-concierge');
  if (!root) return;
  function $(s) { return root.querySelector(s); }
  function esc(v) { return String(v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function chip(cls, t) { return '<span class="chip ' + cls + '">' + esc(t) + '</span>'; }
  function btn(t, data, chrome) { return '<button class="btn sm' + (chrome ? ' chrome' : '') + '" type="button" ' + data + '>' + esc(t) + '</button>'; }

  var QUEUE = [
    { id: 'q1', what: 'Reply draft: "Where is my order #1048?"', kind: 'EMAIL', note: 'Template T01 · tracking found · wording check passed', ok: 'SEND REPLY' },
    { id: 'q2', what: 'Payment match: $245.00 e-Transfer from "M. Chen" → order #1051', kind: 'MONEY', note: 'Amount and order number match · bank sender verified', ok: 'CONFIRM PAID' },
    { id: 'q3', what: 'Reorder draft to supplier: 3 items, 45 days of cover', kind: 'STOCK', note: 'Lowest: 9 days of cover left', ok: 'SEND TO SUPPLIER' },
    { id: 'q4', what: 'Reply draft: question about how to use a product', kind: 'EMAIL', note: 'Locked refusal T02 · no advice given', ok: 'SEND REPLY' },
    { id: 'q5', what: 'Fix ready: broken image on the shipping page (pull request #212)', kind: 'OWNER', note: 'Checks passed · before/after attached', ok: 'MERGE FIX' }
  ];
  var JOBS = [
    ['J01', 'Inbox: sort + draft replies', 'every new email', '2 min ago'],
    ['J02', 'Stock watch + reorder drafts', 'hourly + on every sale', '14 min ago'],
    ['J03', 'Uptime + checkout check', 'every 30 min', '6 min ago'],
    ['J04', 'Incidents + safe fixes', 'when a check fails', 'yesterday'],
    ['J05', 'Payments + e-Transfer matching', 'every 15 min', '9 min ago'],
    ['J06', 'Broken links, images, forms', 'nightly 2:30', '2:30 am'],
    ['J07', 'Saved-cart reminders', 'off until approved', 'never'],
    ['J08', 'Back-in-stock alerts', 'when stock returns', '3 days ago'],
    ['J09', 'Daily brief + weekly review', '7:30 am · Mon 8:00', '7:30 am'],
    ['J10', 'Wording + regulation watch', 'weekly + on changes', 'Mon'],
    ['J11', 'Security + updates watch', 'daily', '6:00 am'],
    ['J12', 'Email delivery (SPF/DMARC)', 'daily', '6:05 am'],
    ['J13', 'Orders not shipped', 'hourly', '22 min ago'],
    ['J14', 'Backups check', 'daily', '4:00 am']
  ];
  var JOB_OFF = { J07: true };
  var AUTO = [
    ['ORDER RECEIVED NOTE', false],
    ['E-TRANSFER REMINDER (24 H)', false],
    ['TRACKING NUMBER', false],
    ['BACK-IN-STOCK (CLEARED ITEMS ONLY)', false]
  ];
  var LOG = [
    ['9:42', 'Checkout check passed in 4.1 s (home → product → cart → checkout)'],
    ['9:31', 'Sorted 6 new emails: 3 order status, 1 payment, 1 product question, 1 spam'],
    ['9:30', 'Drafted 2 replies; 1 refusal for a usage question'],
    ['9:12', 'Matched 1 e-Transfer to order #1051; waiting for your confirm'],
    ['8:58', 'Stock: 2 sizes under 14 days of cover; reorder draft ready'],
    ['7:30', 'Sent your morning brief'],
    ['2:30', 'Nightly crawl: 412 links, 1 broken image; fix opened as pull request #212']
  ];
  var BRIEF = [
    ['Orders yesterday', '11 · $1,940'],
    ['Waiting for payment', '3 orders · oldest 31 h'],
    ['Emails needing you', '2 drafts'],
    ['Low stock', '2 sizes · reorder ready'],
    ['Site', 'up all day · 0 incidents'],
    ['Updates pending', '2 plugins (1 security)'],
    ['Email setup', 'SPF + DMARC missing']
  ];
  var COMP = [
    ['Drafts checked today', '9'],
    ['Stopped by the check', '1'],
    ['Phrase found', 'an outcome word'],
    ['Replaced with', 'locked reply T02']
  ];

  var paused = false, done = {};
  function waiting() { return QUEUE.filter(function (q) { return !done[q.id]; }).length; }

  function renderQueue() {
    $('#cgQueue').innerHTML = '<div class="tr-row hd"><span>ITEM</span><span>TYPE</span><span></span></div>' + QUEUE.map(function (q) {
      var d = done[q.id];
      return '<div class="tr-row' + (d ? ' cg-done' : '') + '"><span class="pn">' + esc(q.what) + '<small>' + esc(d ? d : q.note) + '</small></span>' +
        '<span data-l="Type">' + chip(q.kind === 'MONEY' || q.kind === 'OWNER' ? 'low' : 'ok', q.kind) + '</span>' +
        '<span class="cg-acts">' + (d ? '' : btn(q.ok, 'data-ok="' + q.id + '"', true) + btn('SKIP', 'data-skip="' + q.id + '"')) + '</span></div>';
    }).join('');
    $('#cgWaiting').textContent = String(waiting());
  }
  function renderJobs() {
    var on = 0;
    $('#cgJobs').innerHTML = '<div class="tr-row hd"><span>JOB</span><span>WHEN</span><span>LAST RUN</span><span>ON</span></div>' + JOBS.map(function (j) {
      var isOn = !JOB_OFF[j[0]] && !paused; if (isOn) on++;
      return '<div class="tr-row"><span class="pn">' + esc(j[1]) + '<small>' + esc(j[0]) + '</small></span><span data-l="When">' + esc(j[2]) + '</span><span data-l="Last run">' + esc(j[3]) + '</span>' +
        '<span><label class="sw"><input type="checkbox" data-job="' + j[0] + '"' + (isOn ? ' checked' : '') + (paused ? ' disabled' : '') + '><span class="tg"></span><span class="sr">' + esc(j[1]) + '</span></label></span></div>';
    }).join('');
    $('#cgJobsOn').textContent = on + ' of ' + JOBS.length + ' jobs on';
  }
  function renderAuto() {
    $('#cgAuto').innerHTML = AUTO.map(function (a, i) {
      return '<div class="cg-step"><span style="color:var(--ink2)">' + esc(a[0]) + '</span><label class="sw"><input type="checkbox" data-auto="' + i + '"' + (a[1] ? ' checked' : '') + '><span class="tg"></span><span>' + (a[1] ? 'On' : 'Off') + '</span></label></div>';
    }).join('');
  }
  function rows(list) { return list.map(function (r) { return '<div class="cg-step">' + esc(r[0]) + '<span>' + esc(r[1]) + '</span></div>'; }).join(''); }
  function renderJourney() {
    var steps = [['Home page', '0.8 s'], ['Product page', '1.1 s'], ['Add to cart', '0.6 s'], ['Checkout page', '1.2 s'], ['Payment option shown', 'e-Transfer'], ['Place order', 'skipped on purpose']];
    $('#cgJourney').innerHTML = steps.map(function (s, i) { return '<div class="cg-step"><span' + (i < 5 ? ' class="ok"' : '') + '>' + esc(s[0]) + '</span><span>' + esc(s[1]) + '</span></div>'; }).join('');
  }

  root.addEventListener('click', function (e) {
    var ok = e.target.closest('[data-ok]'), sk = e.target.closest('[data-skip]');
    if (paused && (ok || sk)) return;
    if (ok) { done[ok.dataset.ok] = 'Approved just now by you (sample)'; renderQueue(); }
    if (sk) { done[sk.dataset.skip] = 'Skipped; kept in the log'; renderQueue(); }
  });
  root.addEventListener('change', function (e) {
    var j = e.target.dataset.job, a = e.target.dataset.auto;
    if (j) { JOB_OFF[j] = !e.target.checked; renderJobs(); }
    if (a != null) { AUTO[+a][1] = e.target.checked; renderAuto(); }
  });
  $('#cgPause').addEventListener('click', function () {
    paused = !paused;
    root.classList.toggle('cg-paused', paused);
    $('#cgState').textContent = paused ? 'PAUSED' : 'RUNNING';
    $('#cgPause .lbl').textContent = paused ? 'RESUME' : 'PAUSE ALL';
    renderJobs();
  });

  var left = 30 * 60;
  setInterval(function () { if (paused) return; left = left > 0 ? left - 1 : 30 * 60; var m = Math.floor(left / 60), s = left % 60; $('#cgNext').textContent = 'next run in ' + m + ':' + (s < 10 ? '0' : '') + s; }, 1000);

  renderQueue(); renderJobs(); renderAuto(); renderJourney();
  $('#cgLog').innerHTML = rows(LOG.map(function (l) { return [l[1], l[0]]; }));
  $('#cgBrief').innerHTML = rows(BRIEF);
  $('#cgComp').innerHTML = rows(COMP);
})();
