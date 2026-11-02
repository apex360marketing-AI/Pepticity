/* 11 · TICKER: a thin ticker that opens a drawer with the guide. */
(function () {
  var live = GUI.frame(), el = GUI.el, flow = GBrain.createFlow();
  var items = [['Build my reading list', 'flow'], ['What are the peptide families?', 'what are the peptide families'], ['Which vitamin pairs with copper peptides?', 'which vitamin goes with copper peptides'], ['Which foods should I look at for energy?', 'food for energy'], ['Do I need a blood test first?', 'do i need a blood test'], ['Is this medical advice?', 'is this medical advice'], ['Talk to a person', 'human']];
  var tkIn = el('div', { class: 'tk-in' });
  [0, 1].forEach(function (rep) { items.forEach(function (it) { var bt = el('button', { type: 'button', tabindex: rep ? '-1' : '0', text: it[0], onclick: function () { open(it); } }); if (rep) bt.setAttribute('aria-hidden', 'true'); else if (it[1] === 'flow') bt.setAttribute('data-start', '1'); tkIn.appendChild(bt); }); });
  var tk = el('div', { class: 'tk glass tk-bar' }, [el('span', { class: 'tag', text: 'Ask the guide' }), el('div', { class: 'tk', style: 'flex:1;clip-path:none;box-shadow:none;background:none' }, [tkIn])]);
  var log = el('div', { class: 'log', 'aria-live': 'polite' });
  var steps = el('div', { class: 'steps', 'aria-hidden': 'true' }); for (var i = 0; i < 4; i++) steps.appendChild(el('i'));
  var qh = el('p', { class: 'q' }), opts = el('div', { class: 'opts' }), capMount = el('div');
  var askIn = el('input', { type: 'text', 'data-ask': '1', 'aria-label': 'Ask the PEPTICITY guide', placeholder: 'Or type your own question…' });
  var askRow = el('form', { class: 'askrow', onsubmit: function (e) { e.preventDefault(); var v = askIn.value.trim(); if (!v) return; askIn.value = ''; reply(v); } }, [askIn, el('button', { class: 'btn', type: 'submit', text: 'Ask' })]);
  var dw = el('div', { class: 'dw glass' }, [steps, qh, opts, log, capMount, askRow]);
  var drawer = el('div', { class: 'drawer' }, [el('div', {}, [dw])]);
  var mock = el('article', { class: 'page-mock' }, [el('h2', { text: 'Peptides, vitamins and everyday habits' }), el('p', { text: 'A plain-English primer. Peptides are short chains of amino acids, the building blocks of proteins. Your body makes many of its own, and some are also prescription medicines.' }), el('p', { text: 'Most people start with the basics: food, sleep, movement, and a blood test that gives a clinician real numbers. The ticker above keeps the guide one tap away on any page.' }), el('p', { text: 'A licensed clinician decides what, if anything, is right for you.' })]);
  var wrap = el('div', { class: 'tk-wrap' }, [tk, drawer, mock]); live.appendChild(wrap); GUI.watchGlass(wrap);
  function open(it) {
    drawer.classList.add('open'); tk.classList.add('open'); GUI.$('.tk', tk).classList.add('open');
    if (it[1] === 'flow') { if (flow.finished) { flow.reset(); capMount.innerHTML = ''; log.innerHTML = ''; } renderStep(); }
    else if (it[1] === 'human') say(GUI.human, 'bot'); else reply(it[1], it[0]);
    setTimeout(function () { dw.scrollIntoView({ block: 'nearest', behavior: GUI.reduced ? 'auto' : 'smooth' }); }, 80);
  }
  function say(t, c) { log.appendChild(el('div', { class: 'msg ' + (c || 'bot'), text: t })); log.scrollTop = log.scrollHeight; }
  function reply(text, shown) { say(shown || text, 'me'); var a = GBrain.ask(text); a.lines.forEach(function (l) { say(l); }); if (!flow.finished && !qh.textContent) renderStep(); }
  function renderStep() {
    var s = flow.current(); opts.innerHTML = '';
    GUI.$$('i', steps).forEach(function (n, k) { n.classList.toggle('on', k < flow.idx || (!s)); });
    if (!s) { qh.textContent = 'Your reading list'; finish(); return; }
    qh.textContent = s.q;
    s.opts.forEach(function (o) { opts.appendChild(el('button', { class: 'chip', type: 'button', 'data-opt': o.id, onclick: function () { say(o.label, 'me'); flow.answer(o.id); renderStep(); } }, [o.label, o.sub ? el('small', { text: o.sub }) : null])); });
  }
  var done = false;
  function finish() {
    if (done && capMount.firstChild) return; done = true;
    var r = flow.result(); log.appendChild(GUI.result(r)); log.scrollTop = 0;
    GUI.capture(capMount, { getAnswers: function () { return flow.answers; }, onRestart: function () { flow.reset(); capMount.innerHTML = ''; log.innerHTML = ''; done = false; renderStep(); } });
  }
})();
