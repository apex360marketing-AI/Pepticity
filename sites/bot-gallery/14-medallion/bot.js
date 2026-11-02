/* 14 · MEDALLION: liquid-chrome medallion concierge. Turn the ring (drag, wheel, arrow keys) and choose. */
import { THREE, makeStage, mats, loadP, damp, accent } from '../shared/gthree.js';
(function () {
  var live = GUI.frame(), el = GUI.el, flow = GBrain.createFlow();
  var host = el('div', { class: 'md-stage glass' }); var labs = el('div', { class: 'md-lab' }); host.append(labs, el('i', { class: 'md-sel', 'aria-hidden': 'true' }), el('div', { class: 'md-hint', text: 'Drag the ring · or use ← → · then choose' }));
  var panel = el('div', { class: 'md-panel glass', 'aria-live': 'polite' });
  live.appendChild(el('div', { class: 'md' }, [host, panel])); GUI.watchGlass(live);
  var st = makeStage(host, { z: 7.2, fov: 32 });
  var key = new THREE.DirectionalLight(0xffffff, 1.3); key.position.set(3, 4, 6); st.scene.add(key);
  var rimL = new THREE.PointLight(accent(), 14, 14); rimL.position.set(-4, 2, -2); st.scene.add(rimL);
  var med = new THREE.Group(); st.scene.add(med);
  var chrome = mats.chrome(0xb4b3ac, 0.1), dark = mats.gunmetal();
  var disc = new THREE.Mesh(new THREE.CylinderGeometry(1.62, 1.62, 0.3, 120), chrome); disc.rotation.x = Math.PI / 2; med.add(disc);
  var face = new THREE.Mesh(new THREE.CylinderGeometry(1.28, 1.28, 0.06, 96), dark); face.rotation.x = Math.PI / 2; face.position.z = 0.16; med.add(face);
  var lip = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.035, 20, 120), chrome); lip.position.z = 0.19; med.add(lip);
  var ring = new THREE.Group(); med.add(ring);
  var outer = new THREE.Mesh(new THREE.TorusGeometry(2.12, 0.1, 28, 160), chrome); ring.add(outer);
  var ticks = new THREE.Group(); ring.add(ticks); var tickGeo = new THREE.BoxGeometry(0.05, 0.22, 0.12);
  for (var i = 0; i < 48; i++) { var tk = new THREE.Mesh(tickGeo, i % 6 === 0 ? chrome : dark); var a = i / 48 * Math.PI * 2; tk.position.set(Math.cos(a) * 1.82, Math.sin(a) * 1.82, 0); tk.rotation.z = a - Math.PI / 2; ticks.add(tk); }
  var pm = null; loadP(mats.chrome(0xcfcec7, 0.12), { width: 1.5, depth: 0.14 }).then(function (g) { g.position.z = 0.3; pm = g; med.add(g); });
  var th = 0, thT = 0, glint = 0, flip = 0, spinV = 0, N = 7, selIdx = 0, dragging = false, lastA = 0, labBtns = [];
  var step = function () { return flow.current(); };
  function ang(e) { var r = host.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)); }
  host.addEventListener('pointerdown', function (e) { dragging = true; lastA = ang(e); host.classList.add('drag'); host.setPointerCapture(e.pointerId); });
  host.addEventListener('pointermove', function (e) { if (!dragging) return; var a = ang(e), d = a - lastA; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; thT += d; th = thT; lastA = a; });
  var up = function () { dragging = false; host.classList.remove('drag'); snap(); };
  host.addEventListener('pointerup', up); host.addEventListener('pointercancel', up);
  host.addEventListener('wheel', function (e) { if (!e.shiftKey && Math.abs(e.deltaY) < 4) return; }, { passive: true });
  host.tabIndex = 0; host.setAttribute('role', 'group'); host.setAttribute('aria-label', 'Answer dial. Arrow keys turn, Enter chooses.');
  host.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { rot(1); e.preventDefault(); } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { rot(-1); e.preventDefault(); } else if (e.key === 'Enter' || e.key === ' ') { choose(); e.preventDefault(); } });
  function snap() { var u = Math.PI * 2 / N; thT = Math.round(thT / u) * u; }
  function rot(d) { thT += d * Math.PI * 2 / N; }
  function curIdx() { var u = Math.PI * 2 / N, k = Math.round(-thT / u); return ((k % N) + N) % N; }
  var lastPx = 0;
  st.loop(function (dt, t) {
    th = damp(th, thT, dragging ? 30 : 8, dt); ring.rotation.z = th; glint = damp(glint, 0, 3, dt); spinV = damp(spinV, 0, 2.5, dt); flip += spinV * dt;
    var p = GUI.pointer; med.rotation.y = GUI.reduced ? 0 : GUI.clamp(p.nx, -1, 1) * 0.22 + flip; med.rotation.x = GUI.reduced ? 0 : -GUI.clamp(p.ny, -1, 1) * 0.14 + Math.sin(t * 0.7) * 0.02;
    rimL.intensity = 14 + glint * 40; face.material.emissive = face.material.emissive || new THREE.Color(0); face.material.emissive.setScalar(glint * 0.06);
    var idx = curIdx(); if (idx !== selIdx) { selIdx = idx; paintLabs(); }
    var r = host.getBoundingClientRect(), pxPerUnit = r.height / (2 * Math.tan(THREE.MathUtils.degToRad(16)) * 7.2), R = 2.12 * pxPerUnit + 38;
    labBtns.forEach(function (b, k) { var a = k / N * Math.PI * 2 + th - Math.PI / 2; b.style.left = (Math.cos(a) * R).toFixed(1) + 'px'; b.style.top = (Math.sin(a) * R * 0.97).toFixed(1) + 'px'; });
  });
  function paintLabs() { labBtns.forEach(function (b, k) { b.classList.toggle('on', k === selIdx); }); var s = step(); if (s) { cur.innerHTML = ''; cur.append('Selected: ', el('b', { text: s.opts[selIdx].label })); } }
  var cur = el('div', { class: 'md-cur' }), qh = el('p', { class: 'md-q' }), opts = el('div', { class: 'md-opts', role: 'group' }), chooseBtn = el('button', { class: 'btn main', type: 'button', 'data-select': '1', text: 'Choose this', onclick: function () { choose(); } });
  var resBox = el('div', { class: 'md-res' }), log = el('div', { class: 'live-note' });
  panel.append(log, cur, qh, opts, chooseBtn, resBox);
  function choose() { var s = step(); if (!s) return; take(s.opts[selIdx].id); }
  function take(id) { glint = 1; spinV = GUI.reduced ? 0 : 3.2; flow.answer(id); N = step() ? step().opts.length : N; thT = th = 0; selIdx = 0; draw(); }
  function draw() {
    var s = step(); opts.innerHTML = ''; labs.innerHTML = ''; labBtns = []; log.textContent = flow.log.map(function (l) { return l.a; }).join(' · ');
    if (!s) { cur.textContent = ''; qh.textContent = 'Your reading list'; chooseBtn.style.display = 'none'; opts.style.display = 'none'; host.querySelector('.md-hint').textContent = 'Done · the medallion is yours'; spinV = 6; resBox.innerHTML = ''; resBox.appendChild(GUI.result(flow.result())); var cm = el('div'); resBox.appendChild(cm); GUI.capture(cm, { getAnswers: function () { return flow.answers; }, onRestart: function () { flow.reset(); chooseBtn.style.display = ''; opts.style.display = ''; resBox.innerHTML = ''; N = step().opts.length; thT = th = 0; draw(); } }); return; }
    N = s.opts.length; qh.textContent = s.q; chooseBtn.style.display = ''; opts.style.display = '';
    s.opts.forEach(function (o, k) {
      opts.appendChild(el('button', { class: 'chip', type: 'button', 'data-opt': o.id, onclick: function () { take(o.id); } }, [o.label, o.sub ? el('small', { text: o.sub }) : null]));
      var lb = el('button', { type: 'button', tabindex: '-1', 'aria-hidden': 'true', text: o.label, onclick: function () { thT = -k * Math.PI * 2 / N; } }); labs.appendChild(lb); labBtns.push(lb);
    });
    paintLabs();
  }
  draw();
})();
