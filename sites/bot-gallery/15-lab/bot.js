/* 15 · LAB: a lab assistant (pipette) and a test tube that fills with liquid chrome as you answer. Step cards on the right. */
import { THREE, makeStage, mats, damp, accent } from '../shared/gthree.js';
(function () {
  var live = GUI.frame(), el = GUI.el, flow = GBrain.createFlow();
  var host = el('div', { class: 'lb-stage glass' }); host.appendChild(el('div', { class: 'lb-hint', text: 'Each answer is a drop in the tube' }));
  var steps = el('div', { class: 'lb-steps', 'aria-live': 'polite' });
  live.appendChild(el('div', { class: 'lb' }, [host, steps])); GUI.watchGlass(live);
  var st = makeStage(host, { z: 14, fov: 30 });
  var key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(3, 5, 6); st.scene.add(key);
  var rim = new THREE.PointLight(accent(), 14, 16); rim.position.set(-4, 2, -3); st.scene.add(rim);
  var chrome = mats.chrome(0xb8b7b0, 0.1), gl = mats.glass(0.4), dark = mats.gunmetal();
  var bench = new THREE.Mesh(new THREE.BoxGeometry(9, 0.3, 4), dark); bench.position.y = -2.65; st.scene.add(bench);
  /* test tube (lathe) */
  var prof = []; for (var i = 0; i <= 10; i++) prof.push(new THREE.Vector2(0.42, -1.9 + i * 0.4)); for (var j = 1; j <= 8; j++) { var a = j / 8 * Math.PI / 2; prof.unshift(new THREE.Vector2(Math.sin(a) * 0.42, -1.9 - (1 - Math.cos(a)) * 0.42 + 0)); }
  prof.sort(function (p, q) { return p.y - q.y; });
  var tube = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), gl); tube.position.set(-0.4, 0, 0); st.scene.add(tube);
  var liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 1, 40), chrome); liquid.position.set(-0.4, -1.9, 0); liquid.scale.y = 0.001; st.scene.add(liquid);
  var cap = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.04, 16, 48), chrome); cap.rotation.x = Math.PI / 2; cap.position.set(-0.4, 2.1, 0); st.scene.add(cap);
  /* flasks (decor, glass) */
  [[2.4, -1.9, 0.5], [3.3, -2.15, -0.6]].forEach(function (f, k) { var fp = [new THREE.Vector2(0.01, -0.5), new THREE.Vector2(0.55, -0.5), new THREE.Vector2(0.62, -0.1), new THREE.Vector2(0.2, 0.55), new THREE.Vector2(0.2, 0.95), new THREE.Vector2(0.28, 1.0)]; var m = new THREE.Mesh(new THREE.LatheGeometry(fp, 40), gl); m.position.set(f[0], f[1] + 0.5, f[2]); m.scale.setScalar(k ? 0.8 : 1); st.scene.add(m); });
  /* pipette (assistant) */
  var pip = new THREE.Group(); st.scene.add(pip);
  var body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.7, 32), chrome); body.position.y = 1.0; pip.add(body);
  var bulb = new THREE.Mesh(new THREE.SphereGeometry(0.32, 32, 24), dark); bulb.position.y = 2.05; bulb.scale.y = 1.25; pip.add(bulb);
  var tip = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.7, 32), chrome); tip.rotation.x = Math.PI; tip.position.y = 0.0; pip.add(tip);
  var eye = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.02, 12, 40), new THREE.MeshBasicMaterial({ color: accent() })); eye.position.set(0, 1.35, 0.0); eye.rotation.x = Math.PI / 2; pip.add(eye);
  var drop = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 16), chrome); drop.visible = false; st.scene.add(drop);
  var fill = 0, fillT = 0, pipX = 2.2, pipXT = 2.2, dropY = 0, dropOn = false, glint = 0;
  st.loop(function (dt, t) {
    fill = damp(fill, fillT, 3, dt); liquid.scale.y = Math.max(0.001, fill * 3.7); liquid.position.y = -1.9 + liquid.scale.y / 2;
    pipX = damp(pipX, pipXT, 4, dt); var sway = GUI.reduced ? 0 : Math.sin(t * 1.1) * 0.06;
    var tilt = (pipXT - pipX) * -0.08; pip.position.set(pipX, 0.3 + sway, 0.4); pip.rotation.z = GUI.clamp(tilt, -0.3, 0.3) + GUI.pointer.nx * 0.05;
    if (dropOn) { dropY -= dt * 6; drop.position.set(pipX, dropY, 0.4); if (dropY < -0.2) { dropOn = false; drop.visible = false; glint = 1; } }
    glint = damp(glint, 0, 3, dt); rim.intensity = 14 + glint * 35; cap.rotation.z = t * 0.2;
    st.scene.rotation.y = GUI.reduced ? 0 : GUI.pointer.nx * 0.12; st.scene.rotation.x = GUI.reduced ? 0 : GUI.pointer.ny * 0.05;
  });
  function dropIn() { pipXT = -0.4; setTimeout(function () { if (GUI.reduced) { glint = 1; return; } drop.visible = true; dropOn = true; dropY = -0.1; drop.position.set(-0.4, dropY, 0.4); }, 350); setTimeout(function () { pipXT = 2.2; }, 1300); }
  /* step cards */
  var cards = flow.steps.map(function (s, i) {
    var sum = el('div', { class: 'sum' }), body = el('div', { class: 'body' });
    var c = el('div', { class: 'lb-card glass wait' }, [el('div', { class: 'hd' }, [el('b', { text: 'Step ' + (i + 1) + ' of ' + flow.total }), s.id === 'goal' ? 'Goal' : s.id === 'age' ? 'Age range' : s.id === 'more' ? 'What you want more of' : 'Starting point']), sum, body]);
    steps.appendChild(c); return { c: c, sum: sum, body: body, s: s };
  });
  var resCard = el('div', { class: 'lb-res' }); steps.appendChild(resCard);
  function draw() {
    cards.forEach(function (k, i) {
      k.c.classList.remove('act', 'done', 'wait'); k.body.innerHTML = '';
      if (i < flow.idx) { k.c.classList.add('done'); k.sum.textContent = '✓ ' + flow.log[i].a; }
      else if (i === flow.idx) {
        k.c.classList.add('act'); k.sum.textContent = '';
        k.body.append(el('p', { class: 'lb-q', text: k.s.q }), el('div', { class: 'live-note', text: k.s.hint }));
        var o = el('div', { class: 'lb-opts', role: 'group', 'aria-label': k.s.q });
        k.s.opts.forEach(function (op) { o.appendChild(el('button', { class: 'chip', type: 'button', 'data-opt': op.id, onclick: function () { flow.answer(op.id); fillT = flow.idx / flow.total; dropIn(); setTimeout(draw, GUI.reduced ? 0 : 500); } }, [op.label, op.sub ? el('small', { text: op.sub }) : null])); });
        k.body.appendChild(o);
      } else { k.c.classList.add('wait'); k.sum.textContent = ''; }
    });
    resCard.innerHTML = '';
    if (flow.finished) { fillT = 1; resCard.append(GUI.result(flow.result())); var m = el('div'); resCard.appendChild(m); GUI.capture(m, { getAnswers: function () { return flow.answers; }, onRestart: function () { flow.reset(); fillT = 0; draw(); } }); }
  }
  draw();
})();
