/* 13 · P LOOKS: the 3D P turns to look at the visitor, tilts toward options, nods on answers. */
import { THREE, makeStage, mats, loadP, damp, accent } from '../shared/gthree.js';
(function () {
  var live = GUI.frame(), el = GUI.el, flow = GBrain.createFlow();
  var host = el('div', { class: 'pl-stage' }); host.appendChild(el('span', { class: 'pl-cap', text: 'The P follows you · move your cursor' }));
  var prog = el('i'), log = el('div', { class: 'pl-log', 'aria-live': 'polite' });
  var chat = el('div', { class: 'pl-chat glass' }, [el('div', { class: 'pl-prog' }, [prog]), log]);
  live.appendChild(el('div', { class: 'pl' }, [host, chat])); GUI.watchGlass(live);

  /* ---- 3D ---- */
  var st = makeStage(host, { z: 6.4 }); var pivot = new THREE.Group(); st.scene.add(pivot);
  var key = new THREE.DirectionalLight(0xffffff, 3.2); key.position.set(3, 4, 5); var fillL = new THREE.PointLight(0xffffff, 40, 16); fillL.position.set(-2, 1, 5); st.scene.add(fillL); st.scene.add(key);
  var rim = new THREE.PointLight(accent(), 18, 14); rim.position.set(-4, 1.5, -2.5); st.scene.add(rim);
  var pMesh = null; loadP(mats.chrome(0xaeada6, 0.13), { width: 2.7, depth: 0.26 }).then(function (g) { pMesh = g; pivot.add(g); });
  var look = { x: 0, y: 0, hold: null, idle: 0 }, nod = 0, spin = 0, spinV = 0, lastMove = 0;
  addEventListener('pointermove', function () { lastMove = performance.now(); }, { passive: true });
  st.loop(function (dt, t) {
    var r = host.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, p = GUI.pointer;
    var tx = look.hold ? look.hold.x : p.x, ty = look.hold ? look.hold.y : p.y;
    var idle = performance.now() - lastMove > 3500 || GUI.touch;
    var nx = GUI.clamp((tx - cx) / (innerWidth * 0.5), -1, 1), ny = GUI.clamp((ty - cy) / (innerHeight * 0.5), -1, 1);
    if (idle && !look.hold) { var cr = chat.getBoundingClientRect(); nx = GUI.clamp((cr.left + 60 - cx) / (innerWidth * 0.5), -1, 1) * 0.8 + Math.sin(t * 0.6) * 0.12; ny = Math.sin(t * 0.45) * 0.1; }
    if (GUI.reduced) { nx = 0.15; ny = 0; }
    look.x = damp(look.x, nx, 5, dt); look.y = damp(look.y, ny, 5, dt);
    nod = damp(nod, 0, 4, dt); spinV = damp(spinV, 0, 2.2, dt); spin += spinV * dt;
    pivot.rotation.y = look.x * 0.95 + spin; pivot.rotation.x = look.y * 0.5 + Math.sin(nod * 6) * nod * 0.5;
    pivot.position.y = GUI.reduced ? 0 : Math.sin(t * 0.9) * 0.06; pivot.position.x = look.x * 0.12;
    rim.position.x = -4 + look.x * 1.5; key.position.x = 3 + look.x * 2;
  });
  function react(big) { nod = 1; if (big && !GUI.reduced) spinV = 5.2; }

  /* ---- chat ---- */
  function bot(t, cb) { var b = el('div', { class: 'msg bot' }); log.appendChild(b); GUI.type(b, t, 14, cb); scroll(); return b; }
  function scroll() { setTimeout(function () { log.scrollTop = log.scrollHeight; }, 30); }
  function me(t) { log.appendChild(el('div', { class: 'msg me', text: t })); scroll(); }
  var qBox = null;
  function ask() {
    prog.style.width = (flow.idx / flow.total * 100) + '%';
    var s = flow.current(); if (!s) return done();
    qBox = el('div', {}, [el('p', { class: 'pl-q', text: s.q }), el('div', { class: 'live-note', text: s.hint, style: 'margin:6px 0 10px' })]);
    var opts = el('div', { class: 'pl-opts', role: 'group', 'aria-label': s.q });
    s.opts.forEach(function (o) {
      var b = el('button', { class: 'chip', type: 'button', 'data-opt': o.id, onclick: function () { look.hold = null; qBox.remove(); me(o.label); flow.answer(o.id); react(false); setTimeout(ask, GUI.reduced ? 0 : 450); } }, [o.label, o.sub ? el('small', { text: o.sub }) : null]);
      var hold = function () { var r = b.getBoundingClientRect(); look.hold = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
      b.addEventListener('pointerenter', hold); b.addEventListener('focus', hold); b.addEventListener('pointerleave', function () { look.hold = null; }); b.addEventListener('blur', function () { look.hold = null; });
      opts.appendChild(b);
    });
    qBox.appendChild(opts); log.appendChild(qBox); scroll();
  }
  var capMount = el('div');
  function done() {
    var r = flow.result(); react(true);
    bot('Here is your reading list. I can explain any of it; just ask.', function () {
      log.appendChild(GUI.result(r)); var ar = el('form', { class: 'askrow', onsubmit: function (e) { e.preventDefault(); var v = inp.value.trim(); if (!v) return; inp.value = ''; me(v); GBrain.ask(v).lines.forEach(function (l) { log.appendChild(el('div', { class: 'msg bot', text: l })); }); react(false); scroll(); } });
      var inp = el('input', { type: 'text', 'data-ask': '1', 'aria-label': 'Ask the guide a question', placeholder: 'Ask me anything…' }); ar.append(inp, el('button', { class: 'btn', type: 'submit', text: 'Ask' })); log.appendChild(ar);
      log.appendChild(capMount); GUI.capture(capMount, { getAnswers: function () { return flow.answers; }, onRestart: function () { flow.reset(); log.innerHTML = ''; capMount.innerHTML = ''; start(); } }); scroll();
    });
  }
  function start() { bot(GBrain.intro(), ask); }
  start();
})();
