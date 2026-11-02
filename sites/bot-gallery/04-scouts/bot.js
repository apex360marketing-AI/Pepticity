/* 04 · SCOUTS: three little lit 3D agents roam the page. The scout asks and points, the courier carries answers to the dock, the tidier sweeps finished steps. */
import { THREE, makeStage, mats, accent, damp } from '../shared/gthree.js';
(function () {
  var live = GUI.frame(), el = GUI.el, flow = GBrain.createFlow();
  var labels = ['Goal', 'Age range', 'Want more of', 'Starting point'];
  var dockToks = labels.map(function (l) { return el('div', { class: 'sc-tok glass' }, [l, el('b')]); });
  var dock = el('div', { class: 'sc-dock' }, dockToks);
  var sweep = el('div', { class: 'sc-sweep' }), h2 = el('h2', { 'aria-live': 'polite' }), hint = el('div', { class: 'hint' }), opts = el('div', { class: 'sc-opts', role: 'group' });
  var card = el('div', { class: 'sc-card glass' }, [sweep, h2, hint, opts]);
  var res = el('div', { class: 'sc-res' });
  var fx = el('div', { class: 'sc-fx', 'aria-hidden': 'true' });
  var wrap = el('div', { class: 'sc' }, [dock, card, res, fx]); live.appendChild(wrap); GUI.watchGlass(live);

  var st = makeStage(fx, { z: 10 }); st.camera = new THREE.OrthographicCamera(0, 1, 0, -1, -300, 300);
  st.onresize = function (w, h) { st.camera.right = w; st.camera.bottom = -h; st.camera.updateProjectionMatrix(); }; st.onresize(st.w, st.h);
  var key = new THREE.DirectionalLight(0xffffff, 2.6); key.position.set(60, -80, 220); st.scene.add(key);
  var rimL = new THREE.PointLight(accent(), 7000, 500); rimL.position.set(-80, 60, 140); st.scene.add(rimL);
  function mk(geo, mat) { var g = new THREE.Group(), m = new THREE.Mesh(geo, mat); g.add(m); st.scene.add(g); return { g: g, m: m, x: 120, y: 60, tx: 120, ty: 60, ph: Math.random() * 9, carry: null }; }
  var chrome = mats.chrome(0xd3d2cb, 0.1), dark = mats.gunmetal();
  var scout = mk(new THREE.OctahedronGeometry(17, 1), chrome), courier = mk(new THREE.IcosahedronGeometry(15, 2), chrome), tidy = mk(new THREE.TorusKnotGeometry(10, 3.6, 90, 12), chrome);
  var ringS = new THREE.Mesh(new THREE.TorusGeometry(25, 0.9, 8, 60), chrome); ringS.rotation.x = 1.2; scout.g.add(ringS);
  var eyeS = new THREE.Mesh(new THREE.SphereGeometry(4, 12, 10), new THREE.MeshBasicMaterial({ color: accent() })); eyeS.position.z = 14; scout.g.add(eyeS);
  var cardMesh = new THREE.Mesh(new THREE.BoxGeometry(34, 22, 3), chrome); cardMesh.position.set(0, -26, 0); cardMesh.visible = false; courier.g.add(cardMesh);
  var beam = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: accent(), transparent: true, opacity: 0 })); st.scene.add(beam);
  var chipHot = null, pointIdx = 0, pointT = 0, mode = 'ask', pulseS = 0;
  function rel(node, fx_, fy_) { var r = node.getBoundingClientRect(), f = fx.getBoundingClientRect(); return { x: r.left - f.left + r.width * (fx_ == null ? 0.5 : fx_), y: r.top - f.top + r.height * (fy_ == null ? 0.5 : fy_) }; }
  var busy = false;
  st.loop(function (dt, t) {
    var chips = GUI.$$('.chip', opts);
    if (!GUI.reduced) { pointT += dt; if (pointT > 2.4) { pointT = 0; pointIdx = (pointIdx + 1) % Math.max(1, chips.length); } }
    var tgtChip = chipHot || chips[pointIdx], P = null;
    if (mode === 'ask') { var hp = rel(h2, 0, 0.5); scout.tx = tgtChip ? rel(tgtChip, 0, 0.5).x - 30 : hp.x - 30; scout.ty = tgtChip ? rel(tgtChip, 0, 0.5).y : hp.y; P = tgtChip ? rel(tgtChip, 0.1, 0.5) : null; }
    else if (mode === 'end') { var em = GUI.$('[data-capture] input[type=email]', res); if (em) { var q = rel(em, 0, 0.5); scout.tx = q.x - 36; scout.ty = q.y; P = rel(em, 0.15, 0.5); } }
    var wander = function (a, i, cx, cy, rx, ry) { a.ph += dt * (0.5 + i * 0.13); if (!GUI.reduced) { a.tx = cx + Math.cos(a.ph) * rx; a.ty = cy + Math.sin(a.ph * 1.3) * ry; } else { a.tx = cx; a.ty = cy; } };
    var f = fx.getBoundingClientRect();
    if (!courier.carry) wander(courier, 1, f.width * 0.82, f.height * 0.5, f.width * 0.08, f.height * 0.18);
    if (mode !== 'tidy') wander(tidy, 2, f.width * 0.9, f.height * 0.18, f.width * 0.05, 30);
    if (mode === 'end') { courier.tx = scout.tx - 8; courier.ty = scout.ty + 60; tidy.tx = scout.tx - 8; tidy.ty = scout.ty - 60; }
    [scout, courier, tidy].forEach(function (a, i) { var k = 1 - Math.exp(-(i === 0 ? 5 : 3.6) * dt); a.x += (a.tx - a.x) * k; a.y += (a.ty - a.y) * k; a.g.position.set(a.x, -a.y + (GUI.reduced ? 0 : Math.sin(t * 2 + i) * 3), 0); a.m.rotation.y += dt * (0.7 + i * 0.3); a.m.rotation.x += dt * 0.3; });
    pulseS = damp(pulseS, 0, 3, dt); scout.g.scale.setScalar(1 + pulseS * 0.3); ringS.rotation.z = t * 1.4; rimL.intensity = 7000 + pulseS * 18000;
    var a = beam.geometry.attributes.position; if (P) { a.setXYZ(0, scout.x, -scout.y, 0); a.setXYZ(1, P.x, -P.y, 0); beam.material.opacity = damp(beam.material.opacity, 0.5, 6, dt); } else beam.material.opacity = damp(beam.material.opacity, 0, 6, dt); a.needsUpdate = true;
    if (courier.carry) { cardMesh.visible = true; courier.tx = courier.carry.x; courier.ty = courier.carry.y; } else cardMesh.visible = false;
  });
  scout.x = scout.tx = 60; courier.x = 400; tidy.x = 700;

  function draw() {
    opts.innerHTML = ''; var s = flow.current(); chipHot = null; pointIdx = 0; pointT = 0;
    dockToks.forEach(function (d, i) { d.classList.toggle('on', i === flow.idx); GUI.$('b', d).textContent = i < flow.idx ? flow.log[i].a : ''; });
    if (!s) return finish();
    mode = 'ask'; h2.textContent = s.q; hint.textContent = s.hint;
    s.opts.forEach(function (op) {
      var b = el('button', { class: 'chip', type: 'button', 'data-opt': op.id, onclick: function () { answer(op, b); } }, [op.label, op.sub ? el('small', { text: op.sub }) : null]);
      b.addEventListener('pointerenter', function () { chipHot = b; }); b.addEventListener('focus', function () { chipHot = b; }); b.addEventListener('pointerleave', function () { chipHot = null; }); b.addEventListener('blur', function () { chipHot = null; });
      opts.appendChild(b);
    });
  }
  function answer(op, b) {
    if (busy) return; busy = true; pulseS = 1; var from = rel(b, 0.5, 0.5);
    courier.x = from.x; courier.y = from.y; courier.carry = rel(dockToks[flow.idx], 0.5, 0.5);
    flow.answer(op.id); mode = 'tidy'; tidy.tx = rel(card, 0.5, 0.5).x; tidy.ty = rel(card, 0.5, 0.5).y; sweep.classList.remove('go'); void sweep.offsetWidth; sweep.classList.add('go');
    var wait = GUI.reduced ? 10 : 900;
    setTimeout(function () { courier.carry = null; busy = false; draw(); }, wait);
  }
  function finish() {
    mode = 'end'; h2.textContent = 'Reading list ready'; hint.textContent = 'The scouts will point you to the last step.'; opts.innerHTML = '';
    var r = flow.result(); res.innerHTML = ''; var rg = el('div', { class: 'rg' }), cm = el('div'); rg.append(GUI.result(r), cm); res.appendChild(rg);
    GUI.capture(cm, { getAnswers: function () { return flow.answers; }, onRestart: function () { flow.reset(); res.innerHTML = ''; mode = 'ask'; draw(); } }); GUI.watchGlass(res);
    setTimeout(function () { res.scrollIntoView({ block: 'nearest', behavior: GUI.reduced ? 'auto' : 'smooth' }); }, 150);
  }
  draw();
})();
