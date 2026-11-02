/* 05 · FOLLOW: a small chrome agent trails the cursor, flies to topic tiles and opens them, and hands you over to the guide. */
import { THREE, makeStage, mats, accent, damp } from '../shared/gthree.js';
(function () {
  var live = GUI.frame(), el = GUI.el, flow = GBrain.createFlow();
  var goalStep = flow.steps[0], started = false;
  var wall = el('div', { class: 'fw-wall', role: 'group', 'aria-label': 'Topics. Choosing one answers the first question.' });
  var side = el('div', { class: 'fw-side' });
  var hand = el('div', { class: 'fw-hand glass' }, [el('h3', { text: 'Follow the agent' }), el('p', { text: 'Move over a topic and the agent flies to it and opens it. Click a topic to start your reading list, or hand over to the guide.' }), el('button', { class: 'btn main', type: 'button', 'data-handover': '1', text: 'Hand me over to the guide', onclick: function () { start(); } })]);
  side.appendChild(hand);
  var fx = el('div', { class: 'fw-fx', 'aria-hidden': 'true' });
  var wrap = el('div', { class: 'fw' }, [wall, side, fx]); live.appendChild(wrap);
  var tiles = goalStep.opts.map(function (op) {
    var r = GBrain.result({ goal: op.id, age: '30-44', more: 'basics', start: 'unsure' });
    var t = el('button', { class: 'fw-tile glass', type: 'button', 'data-opt': op.id, onclick: function () { start(op.id); } }, [el('h3', { text: op.label }), el('p', { text: op.sub }), el('div', { class: 'open' }, [el('div', {}, r.families.length ? [el('b', { text: 'Families to read about' }), r.families.map(function (f) { return f.name; }).join(' · '), el('b', { text: 'Nutrients to ask about' }), r.nutrients.slice(0, 3).map(function (f) { return f.name; }).join(' · ')] : [el('b', { text: r.foodsTitle }), r.foods.join(' · ')])])]);
    t.addEventListener('pointerenter', function () { hot(t); }); t.addEventListener('focus', function () { hot(t); }); t.addEventListener('pointerleave', function () { hot(null); }); t.addEventListener('blur', function () { hot(null); });
    wall.appendChild(t); return t;
  });
  GUI.watchGlass(live);
  var hotTile = null; function hot(t) { tiles.forEach(function (x) { x.classList.toggle('hot', x === t); }); hotTile = t; }

  /* ---- the agent ---- */
  var st = makeStage(fx, { z: 10, fov: 30 }); st.camera = new THREE.OrthographicCamera(0, 1, 0, -1, -200, 200);
  st.onresize = function (w, h) { st.camera.left = 0; st.camera.right = w; st.camera.top = 0; st.camera.bottom = -h; st.camera.updateProjectionMatrix(); }; st.onresize(st.w, st.h);
  var key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(80, -60, 200); st.scene.add(key);
  var rimL = new THREE.PointLight(accent(), 6000, 400); rimL.position.set(-60, 40, 120); st.scene.add(rimL);
  var agent = new THREE.Group(); st.scene.add(agent); var S = 22;
  var body = new THREE.Mesh(new THREE.IcosahedronGeometry(S, 3), mats.chrome(0xd4d3cc, 0.1)); agent.add(body);
  var ring = new THREE.Mesh(new THREE.TorusGeometry(S * 1.55, 1.1, 10, 80), mats.chrome(0xd4d3cc, 0.1)); ring.rotation.x = 1.2; agent.add(ring);
  var eye = new THREE.Mesh(new THREE.SphereGeometry(S * 0.2, 16, 12), new THREE.MeshBasicMaterial({ color: accent() })); eye.position.set(0, 0, S * 0.98); agent.add(eye);
  var beam = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: accent(), transparent: true, opacity: 0 })); st.scene.add(beam);
  var pos = { x: 200, y: 200 }, look = { x: 0, y: 0 }, hand_ = { on: false, tx: 0, ty: 0 }, pulse = 0, spin = 0;
  function target() {
    var r = fx.getBoundingClientRect(), p = GUI.pointer;
    if (hand_.on) return { x: hand_.tx, y: hand_.ty, pt: null };
    if (hotTile) { var b = hotTile.getBoundingClientRect(); return { x: b.right - r.left - 26, y: b.top - r.top + 22, pt: { x: b.left - r.left + b.width / 2, y: b.top - r.top + b.height / 2 } }; }
    if (GUI.touch || GUI.reduced) { var b0 = wall.getBoundingClientRect(); return { x: b0.right - r.left - 26, y: b0.top - r.top - 28, pt: null }; }
    return { x: p.x - r.left + 34, y: p.y - r.top + 30, pt: null };
  }
  st.loop(function (dt, t) {
    var T = target(), k = 1 - Math.exp(-(hotTile ? 7 : 4.2) * dt); pos.x += (T.x - pos.x) * k; pos.y += (T.y - pos.y) * k;
    var bob = GUI.reduced ? 0 : Math.sin(t * 2.2) * 3; agent.position.set(pos.x, -pos.y + bob, 0);
    look.x = damp(look.x, GUI.clamp((GUI.pointer.x - (fx.getBoundingClientRect().left + pos.x)) / 300, -1, 1), 6, dt); look.y = damp(look.y, GUI.clamp((GUI.pointer.y - (fx.getBoundingClientRect().top + pos.y)) / 300, -1, 1), 6, dt);
    spin = damp(spin, 0, 2, dt); pulse = damp(pulse, 0, 3, dt);
    body.rotation.y = look.x * 0.9 + t * 0.3; body.rotation.x = -look.y * 0.6; ring.rotation.z = t * 1.1 + spin * 6; ring.rotation.y = look.x * 0.3; eye.position.set(look.x * S * 0.5, -look.y * S * 0.45, S * 0.85);
    agent.scale.setScalar(1 + pulse * 0.25); rimL.intensity = 6000 + pulse * 15000;
    var a = beam.geometry.attributes.position; if (T.pt) { a.setXYZ(0, pos.x, -pos.y, 0); a.setXYZ(1, T.pt.x, -T.pt.y, 0); beam.material.opacity = damp(beam.material.opacity, 0.55, 8, dt); } else beam.material.opacity = damp(beam.material.opacity, 0, 8, dt); a.needsUpdate = true;
  });
  /* click the agent itself = hand over */
  addEventListener('pointerdown', function (e) { var r = fx.getBoundingClientRect(); if (Math.hypot(e.clientX - r.left - pos.x, e.clientY - r.top - pos.y) < 46 && !started) start(); });

  /* ---- hand-over to the guided chat ---- */
  var chat = null;
  function start(goalId) {
    if (started) return; started = true; hot(null); pulse = 1; spin = 1;
    chat = GUI.chatPanel(flow, { onThink: function (on) { pulse = on ? 0.6 : 1; }, onAnswer: function () { pulse = 1; }, onDone: function () { spin = 3; }, onRestart: function () { started = false; side.innerHTML = ''; side.appendChild(hand); hand_.on = false; } });
    side.innerHTML = ''; side.appendChild(chat.root); GUI.watchGlass(side);
    tiles.forEach(function (t) { t.removeAttribute('data-opt'); t.tabIndex = -1; t.style.opacity = '0.55'; });
    var openAgain = function () { var rr = fx.getBoundingClientRect(), sb = side.getBoundingClientRect(); hand_.on = true; hand_.tx = sb.left - rr.left - 22; hand_.ty = sb.top - rr.top + 40; };
    openAgain(); addEventListener('resize', openAgain);
    chat.start && 0; 
    if (goalId) { chat.say(GBrain.intro()); var op = goalStep.opts.filter(function (o) { return o.id === goalId; })[0]; chat.me(op.label); flow.answer(goalId); setTimeout(chat.q, GUI.reduced ? 0 : 450); }
    else chat.start();
  }
  wall.addEventListener('keydown', function () {});
  /* restore tile answers on restart */
  new MutationObserver(function () { if (!started) tiles.forEach(function (t, i) { t.setAttribute('data-opt', goalStep.opts[i].id); t.tabIndex = 0; t.style.opacity = ''; }); }).observe(side, { childList: true });
})();
