/* 06 · CREW: little glass-shape agents wander the stage. Catch one and drop it on the dock to answer. */
(function () {
  var live = GUI.frame(), el = GUI.el, flow = GBrain.createFlow(), SVGNS = 'http://www.w3.org/2000/svg';
  var stage = el('div', { class: 'cw-stage glass' }), qBox = el('div', { class: 'cw-q' }), dock = el('div', { class: 'cw-dock glass' }, [el('div', {}, ['Drop an agent here', el('b', { text: 'or click it' })])]), toks = el('div', { class: 'cw-toks', 'aria-hidden': 'true' });
  stage.append(qBox, dock, toks);
  var list = el('div', { class: 'cw-list', role: 'group', 'aria-label': 'Answers (same choices as the agents)' }), res = el('div', { class: 'cw-res' });
  live.appendChild(el('div', { class: 'cw' }, [stage, list, res])); GUI.watchGlass(live);
  var SHAPES = [[[0, 0], [78, 0], [100, 50], [78, 100], [0, 100], [14, 50]], [[14, 0], [86, 0], [100, 50], [86, 100], [14, 100], [0, 50]], [[12, 0], [100, 0], [88, 100], [0, 100]], [[0, 0], [88, 0], [100, 22], [100, 100], [12, 100], [0, 78]], [[50, 0], [100, 50], [50, 100], [0, 50]]];
  var agents = [], busy = false, W_ = 0, H_ = 0;
  function size() { W_ = stage.clientWidth; H_ = stage.clientHeight; } size(); addEventListener('resize', size);
  function mkAgent(op, i, n) {
    var sh = SHAPES[i % SHAPES.length], pts = sh.map(function (p) { return p[0] + '%,' + p[1] + '%'; }).join(',');
    var svg = document.createElementNS(SVGNS, 'svg'); svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('preserveAspectRatio', 'none'); var pg = document.createElementNS(SVGNS, 'polygon'); pg.setAttribute('points', sh.map(function (p) { return p.join(','); }).join(' ')); svg.appendChild(pg);
    var shp = el('div', { class: 'shp' }); shp.style.clipPath = 'polygon(' + sh.map(function (p) { return p[0] + '% ' + p[1] + '%'; }).join(',') + ')';
    var ey = el('div', { class: 'ey' }, [el('i'), el('i')]);
    var b = el('button', { class: 'cw-ag', type: 'button', 'aria-label': op.label }, [shp, svg, ey, el('span', { class: 'lb', text: op.label })]);
    var a = { op: op, b: b, ey: ey, x: W_ / 2 - 80, y: H_ - 120, vx: 0, vy: 0, ph: Math.random() * 9, drag: false, state: 'in', t: 0, gx: 0, gy: 0 };
    var sx = 0, sy = 0, moved = 0, ox = 0, oy = 0;
    b.addEventListener('pointerdown', function (e) { if (busy) return; a.drag = true; moved = 0; sx = e.clientX; sy = e.clientY; var r = stage.getBoundingClientRect(); ox = e.clientX - r.left - a.x; oy = e.clientY - r.top - a.y; b.classList.add('drag'); b.setPointerCapture(e.pointerId); e.preventDefault(); });
    b.addEventListener('pointermove', function (e) { if (!a.drag) return; moved = Math.max(moved, Math.hypot(e.clientX - sx, e.clientY - sy)); var r = stage.getBoundingClientRect(); a.x = e.clientX - r.left - ox; a.y = e.clientY - r.top - oy; a.vx = a.vy = 0; dock.classList.toggle('hot', overDock(a)); });
    var end = function () { if (!a.drag) return; a.drag = false; b.classList.remove('drag'); dock.classList.remove('hot'); if (overDock(a) || moved < 6) take(a); };
    b.addEventListener('pointerup', end); b.addEventListener('pointercancel', function () { a.drag = false; b.classList.remove('drag'); });
    b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); take(a); } });
    stage.appendChild(b); return a;
  }
  function overDock(a) { var d = { x: dock.offsetLeft - dock.offsetWidth / 2, y: dock.offsetTop }; var cx = a.x + 79, cy = a.y + 35; return cx > d.x && cx < d.x + dock.offsetWidth && cy > d.y - 20 && cy < d.y + dock.offsetHeight + 20; }
  function take(a) {
    if (busy || a.state === 'gone') return; busy = true; flow.answer(a.op.id); list.innerHTML = '';
    a.state = 'dock'; a.t = 0; agents.forEach(function (o) { if (o !== a) { o.state = 'away'; var ang = Math.atan2(o.y - H_ / 2, o.x - W_ / 2); o.gx = W_ / 2 + Math.cos(ang) * W_; o.gy = H_ / 2 + Math.sin(ang) * H_; } });
    toks.appendChild(el('span', { text: a.op.label }));
    setTimeout(function () { agents.forEach(function (o) { o.b.remove(); }); agents = []; busy = false; round(); }, GUI.reduced ? 20 : 1000);
  }
  function round() {
    var s = flow.current(); qBox.innerHTML = '';
    if (!s) return finish();
    qBox.append(el('small', {}, [el('b', { text: 'Question ' + (flow.idx + 1) + ' of ' + flow.total })]), el('h2', { text: s.q }));
    s.opts.forEach(function (op, i) {
      var a = mkAgent(op, i, s.opts.length); agents.push(a); a.x = W_ / 2 - 80; a.y = H_ - 110; a.state = 'in'; a.t = -i * 0.08;
      list.appendChild(el('button', { class: 'chip', type: 'button', 'data-opt': op.id, onclick: function () { take(a); } }, [op.label, op.sub ? el('small', { text: op.sub }) : null]));
    });
  }
  function finish() {
    qBox.append(el('small', {}, [el('b', { text: 'Crew assembled' })]), el('h2', { text: 'Your reading list' })); toks.style.display = 'none';
    var r = flow.result(); res.innerHTML = ''; var left = GUI.result(r), right = el('div'); res.append(left, right);
    GUI.capture(right, { getAnswers: function () { return flow.answers; }, onRestart: function () { flow.reset(); res.innerHTML = ''; toks.innerHTML = ''; toks.style.display = ''; round(); } });
    GUI.watchGlass(res); setTimeout(function () { res.scrollIntoView({ block: 'nearest', behavior: GUI.reduced ? 'auto' : 'smooth' }); }, 200);
  }
  GUI.onFrame(function (dt, t) {
    var r = stage.getBoundingClientRect(), p = GUI.pointer, px = p.x - r.left, py = p.y - r.top, n = agents.length;
    agents.forEach(function (a, i) {
      if (a.state === 'in') {
        a.t += dt; if (a.t > 0) { var k = Math.min(1, a.t / 0.9); if (k >= 1) a.state = 'roam'; var e = 1 - Math.pow(1 - k, 3), ang = (i / n) * Math.PI * 2 - Math.PI / 2, tx = W_ / 2 + Math.cos(ang) * W_ * 0.3 - 79, ty = H_ * 0.52 + Math.sin(ang) * H_ * 0.26 - 35; a.x = GUI.lerp(a.x, tx, e * 0.2); a.y = GUI.lerp(a.y, ty, e * 0.2); a.b.style.opacity = e; }
      } else if (a.state === 'roam' && !a.drag) {
        if (!GUI.reduced) {
          a.ph += dt; var cx = W_ / 2 + Math.cos(a.ph * 0.35 + i * 1.7) * W_ * 0.32, cy = H_ * 0.5 + Math.sin(a.ph * 0.5 + i * 2.3) * H_ * 0.2;
          cx = Math.max(10, Math.min(W_ - 170, cx - 79)); cy = Math.max(110, Math.min(H_ - 140, cy - 35));
          var dx = (a.x + 79) - px, dy = (a.y + 35) - py, d = Math.hypot(dx, dy); var rep = d < 130 && !GUI.touch ? (130 - d) / 130 : 0;
          a.vx += ((cx - a.x) * 1.2 + (dx / (d || 1)) * rep * 260) * dt; a.vy += ((cy - a.y) * 1.2 + (dy / (d || 1)) * rep * 260) * dt; a.vx *= 0.94; a.vy *= 0.94; a.x += a.vx * dt; a.y += a.vy * dt;
        } else { var ang2 = (i / n) * Math.PI * 2 - Math.PI / 2; a.x = W_ / 2 + Math.cos(ang2) * W_ * 0.3 - 79; a.y = H_ * 0.52 + Math.sin(ang2) * H_ * 0.26 - 35; }
        a.b.style.opacity = 1;
      } else if (a.state === 'dock') { a.t += dt; var tx2 = dock.offsetLeft - 79, ty2 = dock.offsetTop + 8; a.x = GUI.lerp(a.x, tx2, 1 - Math.exp(-9 * dt)); a.y = GUI.lerp(a.y, ty2, 1 - Math.exp(-9 * dt)); a.b.style.opacity = Math.max(0, 1 - Math.max(0, a.t - 0.5) * 2.2); }
      else if (a.state === 'away') { a.x = GUI.lerp(a.x, a.gx, 1 - Math.exp(-3 * dt)); a.y = GUI.lerp(a.y, a.gy, 1 - Math.exp(-3 * dt)); a.b.style.opacity = Math.max(0, parseFloat(a.b.style.opacity || 1) - dt * 1.8); }
      a.b.style.transform = 'translate(' + a.x.toFixed(1) + 'px,' + a.y.toFixed(1) + 'px) rotate(' + (GUI.reduced ? 0 : (a.vx * 0.012)).toFixed(2) + 'deg)';
      var ex = GUI.clamp((px - (a.x + 79)) / 90, -1, 1) * 3, ey = GUI.clamp((py - (a.y + 35)) / 90, -1, 1) * 2; a.ey.style.setProperty('--ex', ex.toFixed(1) + 'px'); a.ey.style.setProperty('--ey', ey.toFixed(1) + 'px');
    });
  });
  round();
})();
