/* 07 · DESK: three see-through panels on a desk of light. Answers log, the live question, and a reading list that fills in as you go. */
(function () {
  var live = GUI.frame(), el = GUI.el, flow = GBrain.createFlow();
  var names = ['Goal', 'Age range', 'Want more of', 'Starting point'];
  var ansBox = el('div', { class: 'dk-ans' }), now = el('div', { class: 'dk-now', 'aria-live': 'polite' }), prev = el('div', { class: 'dk-prev', 'aria-live': 'polite' });
  var P1 = el('section', { class: 'dk-p glass', 'aria-label': 'Your answers' }, [el('h3', { text: 'Your answers' }), ansBox]);
  var P2 = el('section', { class: 'dk-p glass', 'aria-label': 'Current question' }, [el('h3', { text: 'Now' }), now]);
  var P3 = el('section', { class: 'dk-p glass', 'aria-label': 'Reading list preview' }, [el('h3', { text: 'Reading list · live preview' }), prev]);
  var row = el('div', { class: 'dk-row' }, [P1, P2, P3]), light = el('div', { class: 'dk-light', 'aria-hidden': 'true' });
  var desk = el('div', { class: 'dk' }, [light, row, el('div', { class: 'dk-edge', 'aria-hidden': 'true' })]); live.appendChild(desk); GUI.watchGlass(live);
  GUI.onFrame(function () {
    if (GUI.reduced || GUI.touch || innerWidth < 900) return; var r = desk.getBoundingClientRect(), p = GUI.pointer;
    var nx = GUI.clamp(((p.x - r.left) / r.width) * 2 - 1, -1, 1), ny = GUI.clamp(((p.y - r.top) / r.height) * 2 - 1, -1, 1);
    [[P1, 8, -20], [P2, 4, 14], [P3, 8, -20]].forEach(function (a, i) { var dir = i === 0 ? 1 : i === 2 ? -1 : 0; a[0].style.transform = 'rotateY(' + (nx * -5 + dir * 4).toFixed(2) + 'deg) rotateX(' + (ny * 3).toFixed(2) + 'deg) translateZ(' + a[2] + 'px)'; });
    light.style.setProperty('--lx', ((nx * 0.5 + 0.5) * 100).toFixed(0) + '%');
  });
  function paintAns() { ansBox.innerHTML = ''; names.forEach(function (n, i) { ansBox.appendChild(el('div', { class: i === flow.idx && !flow.finished ? 'on' : '' }, [el('small', { text: 'Step ' + (i + 1) + ' · ' + n }), i < flow.idx ? flow.log[i].a : '—'])); }); }
  function paintPrev() {
    prev.innerHTML = ''; var a = flow.answers;
    if (!a.goal) { prev.appendChild(el('div', { class: 'ph', text: 'Fills in as you answer' })); return; }
    var rs = GBrain.result({ goal: a.goal, age: a.age || '30-44', more: a.more || 'basics', start: a.start || 'unsure' });
    var li = function (x) { return el('div', {}, [el('b', { text: x.name }), ' — ' + x.plain]); };
    if (!rs.families.length) prev.appendChild(el('div', { class: 'sec' }, [el('h3', { text: rs.foodsTitle, style: 'margin:0 0 6px;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--v-t)' }), el('div', { text: rs.foods.join(' · ') })]));
    else prev.appendChild(el('div', { class: 'sec' }, [el('h3', { text: 'Families to read about', style: 'margin:0 0 6px;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--v-t)' })].concat(rs.families.map(li))));
    if (a.age) prev.appendChild(el('div', { class: 'sec', text: rs.notes[0] }));
    if (a.more && rs.nutrients.length) prev.appendChild(el('div', { class: 'sec' }, [el('h3', { text: 'Vitamins and minerals to ask about', style: 'margin:0 0 6px;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--v-t)' })].concat(rs.nutrients.slice(0, 3).map(li))));
    if (flow.finished && rs.pair) prev.appendChild(el('div', { class: 'sec' }, [el('b', { text: 'Often read together: ' + rs.pair.family + ' + ' + rs.pair.nutrient }), el('div', { text: rs.pair.why })]));
  }
  function draw() {
    paintAns(); paintPrev(); now.innerHTML = ''; var s = flow.current();
    if (!s) {
      now.append(el('p', { class: 'dk-q', text: 'Send it to yourself' })); var m = el('div', { style: 'margin-top:14px' }); now.appendChild(m);
      GUI.capture(m, { getAnswers: function () { return flow.answers; }, onRestart: function () { flow.reset(); draw(); } }); return;
    }
    var o = el('div', { class: 'dk-opts', role: 'group', 'aria-label': s.q });
    now.append(el('div', { class: 'live-note', text: 'Question ' + (flow.idx + 1) + ' of ' + flow.total }), el('p', { class: 'dk-q', text: s.q }), el('div', { class: 'live-note', text: s.hint, style: 'margin:6px 0 12px' }), o);
    s.opts.forEach(function (op) { o.appendChild(el('button', { class: 'chip', type: 'button', 'data-opt': op.id, onclick: function () { flow.answer(op.id); draw(); } }, [op.label, op.sub ? el('small', { text: op.sub }) : null])); });
  }
  draw();
})();
