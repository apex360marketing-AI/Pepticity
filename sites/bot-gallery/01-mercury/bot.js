/* 01 · MERCURY: one liquid-chrome orb. Swells as you type, tightens and spins while thinking, speaks in cards. */
import { THREE, makeStage, mats, accent, damp } from '../shared/gthree.js';
import { makeOrb } from '../shared/orb.js';
(function () {
  var live = GUI.frame(), el = GUI.el, flow = GBrain.createFlow();
  var host = el('div', { class: 'mc-stage' }), state = el('div', { class: 'mc-state' }), cards = el('div', { class: 'mc-cards', 'aria-hidden': 'true' });
  host.append(state, cards);
  var log = el('div', { class: 'mc-log', 'aria-live': 'polite' }), box = el('div'), capMount = el('div');
  var ask = el('input', { type: 'text', 'data-ask': '1', 'aria-label': 'Ask Mercury a question', placeholder: 'Ask me anything, or pick below…', autocomplete: 'off' });
  var askRow = el('form', { class: 'askrow', onsubmit: function (e) { e.preventDefault(); var v = ask.value.trim(); if (!v) return; ask.value = ''; typed = 0; ask_(v); } }, [ask, el('button', { class: 'btn', type: 'submit', text: 'Ask' })]);
  var chat = el('div', { class: 'mc-chat glass' }, [log, box, askRow, capMount]);
  live.appendChild(el('div', { class: 'mc' }, [host, chat])); GUI.watchGlass(live);

  var st = makeStage(host, { z: 6.6, fov: 34, exposure: 1.05 });
  var key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(3, 4, 5); st.scene.add(key);
  var rim = new THREE.PointLight(accent(), 22, 14); rim.position.set(-3.5, 1, -2.5); st.scene.add(rim);
  var orb = makeOrb({ glass: false, freq: 1.25 }); st.scene.add(orb.mesh);
  var halo = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.006, 8, 160), new THREE.MeshBasicMaterial({ color: accent(), transparent: true, opacity: 0.55 })); st.scene.add(halo);
  var e = 0.2, eT = 0.12, typed = 0, think = 0, spin = 0, pulse = 0, scaleT = 1, sc = 1;
  ask.addEventListener('input', function () { typed = Math.min(1, ask.value.length / 18); });
  st.loop(function (dt, t) {
    eT = 0.2 + typed * 0.45 + think * 0.7 + pulse * 0.4; e = damp(e, eT, 5, dt); pulse = damp(pulse, 0, 3, dt);
    orb.uni.uT.value = GUI.reduced ? 3 : t * (1 + think * 2.2); orb.uni.uE.value = GUI.reduced ? 0.12 : e;
    spin += dt * (0.12 + think * 2.4); orb.mesh.rotation.y = spin; orb.mesh.rotation.x = GUI.pointer.ny * 0.25;
    sc = damp(sc, 1 + typed * 0.12 - think * 0.1 + pulse * 0.1, 6, dt); orb.mesh.scale.setScalar(sc); halo.scale.setScalar(1 + e * 0.12); halo.rotation.x = 1.25 + Math.sin(t * 0.5) * 0.12; halo.rotation.y = 0.35;
    orb.mesh.position.x = GUI.pointer.nx * 0.12; orb.mesh.position.y = GUI.reduced ? 0 : Math.sin(t * 0.8) * 0.05;
    rim.position.x = -3.5 + GUI.pointer.nx * 2; rim.intensity = 22 + pulse * 40;
    state.innerHTML = ''; state.append(think > 0.3 ? 'Thinking ' : typed > 0 ? 'Listening ' : 'Ready ', el('b', { text: '●' }));
  });

  function flyCard(text) {
    var r = host.getBoundingClientRect(), c = el('div', { class: 'mc-fly glass', text: text });
    var ang = Math.random() * Math.PI * 2, d = Math.min(r.width, r.height) * 0.32;
    c.style.left = (r.width / 2 - 100) + 'px'; c.style.top = (r.height / 2 - 20) + 'px'; c.style.setProperty('--dx', (Math.cos(ang) * d * 1.2).toFixed(0) + 'px'); c.style.setProperty('--dy', (Math.sin(ang) * d).toFixed(0) + 'px');
    cards.appendChild(c); GUI.watchGlass(cards); setTimeout(function () { c.remove(); }, 5600);
  }
  function think_(ms, cb) { think = 1; setTimeout(function () { think = 0; pulse = 1; cb(); }, GUI.reduced ? 0 : ms); }
  function say(t, fly) { var b = el('div', { class: 'msg bot' }); log.appendChild(b); GUI.type(b, t, 12); setTimeout(function () { log.scrollTop = log.scrollHeight; }, 40); if (fly && !GUI.reduced) flyCard(fly); }
  function me(t) { log.appendChild(el('div', { class: 'msg me', text: t })); setTimeout(function () { log.scrollTop = log.scrollHeight; }, 40); }
  function ask_(v) { me(v); think_(900, function () { var a = GBrain.ask(v); a.lines.forEach(function (l, i) { say(l, i === 0 ? l.slice(0, 70) + '…' : null); }); }); }
  function q() {
    box.innerHTML = ''; var s = flow.current(); if (!s) return done();
    var o = el('div', { class: 'mc-opts', role: 'group', 'aria-label': s.q });
    box.append(el('p', { class: 'mc-q', text: s.q }), el('div', { class: 'live-note', text: s.hint, style: 'margin:4px 0 10px' }), o);
    s.opts.forEach(function (op) { o.appendChild(el('button', { class: 'chip', type: 'button', 'data-opt': op.id, onclick: function () { me(op.label); flow.answer(op.id); box.innerHTML = ''; flyCard(op.label); think_(800, q); } }, [op.label, op.sub ? el('small', { text: op.sub }) : null])); });
  }
  function done() { var r = flow.result(); say('Your reading list is ready. ' + r.clinician, (r.families.length ? r.families[0].name : r.goalLabel)); setTimeout(function () { log.appendChild(GUI.result(r)); GUI.capture(capMount, { getAnswers: function () { return flow.answers; }, onRestart: function () { flow.reset(); log.innerHTML = ''; capMount.innerHTML = ''; start(); } }); setTimeout(function () { capMount.scrollIntoView({ block: 'nearest' }); }, 100); }, GUI.reduced ? 0 : 900); }
  function start() { say(GBrain.intro(), 'Hello'); setTimeout(q, GUI.reduced ? 0 : 400); }
  start();
})();
