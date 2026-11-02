/* 12 · ONE LINE: one question at a time, the reading list builds behind the strip. */
(function () {
  var live = GUI.frame(), el = GUI.el, flow = GBrain.createFlow();
  var prog = el('i'), stepL = el('div', { class: 'ol-step' }), qh = el('h2', { class: 'ol-q', 'aria-live': 'polite' }), opts = el('div', { class: 'ol-opts', role: 'group' });
  var back = el('button', { class: 'ol-back', type: 'button', text: '← Back', onclick: function () { flow.back(); draw(true); } });
  var strip = el('div', { class: 'ol-strip glass' }, [el('div', { class: 'ol-prog' }, [prog]), stepL, qh, opts, back]);
  var build = el('div', { class: 'ol-build', 'aria-live': 'polite' });
  var ol = el('div', { class: 'ol' }, [strip, build]); live.appendChild(ol); GUI.watchGlass(ol);
  var r = null;
  function sections() {
    build.innerHTML = '';
    var a = flow.answers; if (!a.goal) { build.appendChild(el('div', { class: 'ol-ph', text: 'Your reading list will build here as you answer' })); return; }
    var rs = GBrain.result({ goal: a.goal, age: a.age || '30-44', more: a.more || 'basics', start: a.start || 'unsure' });
    var li = function (x) { return el('li', {}, [el('b', { text: x.name }), ' — ' + x.plain]); };
    if (rs.families.length) build.appendChild(el('div', { class: 'blk glass rsb' }, [el('h4', { text: 'Peptide families to read about' }), el('ul', {}, rs.families.map(li))]));
    if (a.age) build.appendChild(el('div', { class: 'blk glass rsb' }, [el('h4', { text: 'For your age range' }), el('ul', {}, [el('li', { text: rs.notes[0] })])]));
    if (a.more) { if (rs.nutrients.length) build.appendChild(el('div', { class: 'blk glass rsb' }, [el('h4', { text: 'Vitamins and minerals to ask about' }), el('ul', {}, rs.nutrients.slice(0, 4).map(li))])); build.appendChild(el('div', { class: 'blk glass rsb' }, [el('h4', { text: rs.foodsTitle || 'Foods to look at' }), el('div', { class: 'foods' }, rs.foods.map(function (f) { return el('span', { text: f }); }))])); }
    if (flow.finished) { if (rs.pair) { var pair = el('div', { class: 'pair glass rsb' }, [el('h4', { text: 'Often read together' }), el('b', { text: rs.pair.family + '  +  ' + rs.pair.nutrient }), el('p', { text: rs.pair.why })]); build.appendChild(pair); } build.appendChild(el('p', { class: 'clin', style: 'grid-column:1/-1', text: rs.clinician + ' ' + rs.disclaimer })); }
    GUI.watchGlass(build);
  }
  var capDone = false;
  function draw(anim) {
    var s = flow.current(); prog.style.width = (flow.idx / flow.total * 100) + '%'; back.style.display = flow.idx > 0 ? '' : 'none';
    opts.innerHTML = ''; sections();
    if (!s) {
      stepL.textContent = 'Done'; qh.textContent = 'Your reading list is ready.'; if (anim) [qh, stepL].forEach(function (n) { n.classList.remove('in'); void n.offsetWidth; n.classList.add('in'); });
      if (!capDone) { capDone = true; var m = el('div', { style: 'grid-column:1/-1;max-width:640px' }); build.appendChild(m); GUI.capture(m, { getAnswers: function () { return flow.answers; }, onRestart: function () { flow.reset(); capDone = false; draw(true); } }); }
      else { var m2 = el('div', { style: 'grid-column:1/-1;max-width:640px' }); build.appendChild(m2); GUI.capture(m2, { getAnswers: function () { return flow.answers; }, onRestart: function () { flow.reset(); capDone = false; draw(true); } }); }
      return;
    }
    capDone = false;
    stepL.textContent = 'Question ' + (flow.idx + 1) + ' of ' + flow.total; qh.textContent = s.q;
    [qh, stepL].forEach(function (n) { n.classList.remove('in'); void n.offsetWidth; n.classList.add('in'); });
    s.opts.forEach(function (o, i) { opts.appendChild(el('button', { class: 'chip', type: 'button', 'data-opt': o.id, style: 'animation-delay:' + (80 + i * 50) + 'ms', onclick: function () { flow.answer(o.id); draw(true); } }, [o.label, o.sub ? el('small', { text: o.sub }) : null])); });
  }
  draw(false);
})();
