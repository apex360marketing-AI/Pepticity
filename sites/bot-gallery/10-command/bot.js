/* 10 · COMMAND: a command bar that asks, suggests and answers. */
(function () {
  var live = GUI.frame(), el = GUI.el, flow = GBrain.createFlow();
  var stage = el('div', { class: 'cmd-stage' }); live.appendChild(stage);
  var q = el('p', { class: 'cmd-q', 'aria-live': 'polite' });
  var toks = el('div', { class: 'toks' });
  var input = el('input', { type: 'text', 'aria-label': 'Answer or ask the PEPTICITY guide', autocomplete: 'off', 'data-ask': '1', placeholder: 'Type to filter, or ask a question…' });
  var bar = el('div', { class: 'cmd glass' }, [el('span', { class: 'gl', 'aria-hidden': 'true', text: '>' }), toks, input, el('kbd', { text: 'ENTER' })]);
  var list = el('div', { class: 'cmd-list', role: 'group', 'aria-label': 'Quick answers' });
  var out = el('div', { class: 'cmd-out', 'aria-live': 'polite' });
  stage.append(q, bar, list, out);

  function say(lines, cls) { lines.forEach(function (l) { out.appendChild(el('div', { class: 'msg ' + (cls || 'bot'), text: l })); }); }
  function tokens() {
    toks.innerHTML = '';
    flow.log.forEach(function (l, i) { toks.appendChild(el('button', { class: 'tok', type: 'button', title: 'Change this answer', 'aria-label': 'Change answer: ' + l.a, text: l.a + ' ×', onclick: function () { while (flow.log.length > i) flow.back(); out.innerHTML = ''; render(); input.focus(); } })); });
  }
  function hl(label, v) { if (!v) return label; var i = label.toLowerCase().indexOf(v.toLowerCase()); if (i < 0) return label; var f = document.createDocumentFragment(); f.append(label.slice(0, i), el('mark', { text: label.slice(i, i + v.length) }), label.slice(i + v.length)); return f; }
  function render() {
    tokens(); list.innerHTML = '';
    var s = flow.current(), v = input.value.trim();
    if (!s) { q.innerHTML = ''; q.append(el('b', { text: 'Done' }), ' · your reading list is ready. Ask me anything about it.'); input.placeholder = 'Ask a follow-up question…'; showResult(); return; }
    q.innerHTML = ''; q.append(el('b', { text: 'Question ' + (flow.idx + 1) + ' of ' + flow.total }), ' · ' + s.q + '  ' + s.hint);
    input.placeholder = s.q;
    s.opts.filter(function (o) { return !v || o.label.toLowerCase().indexOf(v.toLowerCase()) >= 0; }).forEach(function (o, i) {
      var b = el('button', { class: 'chip', type: 'button', 'data-opt': o.id, style: 'animation-delay:' + i * 40 + 'ms', onclick: function () { pick(o.id); } }); b.append(hl(o.label, v)); if (o.sub) b.append(el('small', { text: o.sub })); list.appendChild(b);
    });
  }
  function pick(id) { flow.answer(id); input.value = ''; out.innerHTML = ''; render(); }
  var shown = false;
  function showResult() {
    if (shown) return; shown = true; out.appendChild(GUI.result(flow.result()));
    GUI.capture(out, { getAnswers: function () { return flow.answers; }, onRestart: function () { flow.reset(); shown = false; out.innerHTML = ''; input.value = ''; render(); } });
  }
  input.addEventListener('input', function () { if (flow.current()) render(); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { input.value = ''; render(); return; }
    if (e.key !== 'Enter') return; e.preventDefault();
    var v = input.value.trim(), s = flow.current(); if (!v) return;
    if (s) { var m = s.opts.filter(function (o) { return o.label.toLowerCase().indexOf(v.toLowerCase()) >= 0; }); if (m.length) { pick(m[0].id); return; } }
    var a = GBrain.ask(v); say([v], 'me'); say(a.lines); input.value = '';
    var row = el('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' });
    a.chips.forEach(function (c) { row.appendChild(el('button', { class: 'chip', type: 'button', text: c, onclick: function () { if (/person/i.test(c)) say([GUI.human]); else { out.innerHTML = ''; if (flow.finished) { flow.reset(); shown = false; } render(); } input.focus(); } })); });
    out.appendChild(row); if (flow.current()) render();
  });
  document.addEventListener('keydown', function (e) { if (e.key === '/' && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); input.focus(); } });
  render();
})();
