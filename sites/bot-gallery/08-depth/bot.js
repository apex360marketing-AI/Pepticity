/* 08 · DEPTH: a stack of glass cards in depth. Answer and the top card sails back; the finished deck fans out. */
(function () {
  var live = GUI.frame(), el = GUI.el, flow = GBrain.createFlow();
  var prog = el('div', { class: 'dp-prog', 'aria-hidden': 'true' }, flow.steps.map(function () { return el('i'); }));
  var stack = el('div', { class: 'dp-stack' }), fan = el('div', { class: 'dp-fan' });
  var root = el('div', { class: 'dp' }, [prog, stack, fan]); live.appendChild(root);
  var cards = flow.steps.map(function (s, i) {
    var o = el('div', { class: 'dp-opts', role: 'group', 'aria-label': s.q });
    var c = el('section', { class: 'dp-card glass', 'aria-label': 'Question ' + (i + 1) }, [el('div', { class: 'n' }, [el('b', { text: 'Card ' + (i + 1) + ' of ' + flow.total }), ' · ' + s.hint]), el('h2', { text: s.q }), o]);
    s.opts.forEach(function (op) { o.appendChild(el('button', { class: 'chip', type: 'button', 'data-opt': op.id, onclick: function () { if (i !== flow.idx) return; flow.answer(op.id); place(); } }, [op.label, op.sub ? el('small', { text: op.sub }) : null])); });
    stack.appendChild(c); return c;
  });
  GUI.watchGlass(live);
  function place() {
    cards.forEach(function (c, i) {
      var d = i - flow.idx; c.classList.toggle('back', d !== 0); c.setAttribute('aria-hidden', d !== 0); GUI.$$('button', c).forEach(function (b) { b.tabIndex = d === 0 ? 0 : -1; });
      if (d < 0) { c.style.transform = 'translate3d(' + (-40 + d * 10) + 'px,-130px,-520px) rotateX(14deg)'; c.style.opacity = 0; c.style.visibility = 'hidden'; }
      else { c.style.visibility = ''; c.style.transform = 'translate3d(0,' + (-d * 26) + 'px,' + (-d * 110) + 'px) scale(' + (1 - d * 0.035).toFixed(3) + ')'; c.style.opacity = Math.max(0, 1 - d * 0.28); c.style.zIndex = 10 - d; }
    });
    GUI.$$('i', prog).forEach(function (n, i) { n.classList.toggle('on', i < flow.idx); });
    if (flow.finished) finish();
  }
  function finish() {
    fan.innerHTML = ''; var left = GUI.result(flow.result()), right = el('div'); fan.append(left, right);
    GUI.capture(right, { getAnswers: function () { return flow.answers; }, onRestart: function () { flow.reset(); root.classList.remove('done'); place(); } });
    GUI.watchGlass(fan); setTimeout(function () { root.classList.add('done'); fan.scrollIntoView({ block: 'nearest', behavior: GUI.reduced ? 'auto' : 'smooth' }); }, GUI.reduced ? 0 : 750);
  }
  GUI.onFrame(function () { if (GUI.reduced || GUI.touch || innerWidth < 900) return; var r = stack.getBoundingClientRect(), p = GUI.pointer; stack.style.transform = 'rotateY(' + (GUI.clamp(((p.x - r.left) / r.width) * 2 - 1, -1.5, 1.5) * 5).toFixed(2) + 'deg) rotateX(' + (GUI.clamp(((p.y - r.top) / r.height) * 2 - 1, -1.5, 1.5) * -3).toFixed(2) + 'deg)'; });
  place();
})();
