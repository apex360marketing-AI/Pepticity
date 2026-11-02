/* 02 · ABSORB: answers are small orbs orbiting a core. Pull one in and the core grows. */
import { THREE, makeStage, mats, accent, damp } from '../shared/gthree.js';
import { makeOrb } from '../shared/orb.js';
(function () {
  var live = GUI.frame(), el = GUI.el, flow = GBrain.createFlow();
  var host = el('div', { class: 'ab-stage glass' }), qBox = el('div', { class: 'ab-q', 'aria-hidden': 'true' }), lab = el('div', { class: 'ab-lab', 'aria-hidden': 'true' });
  host.append(qBox, lab, el('div', { class: 'ab-hint', text: 'Click an orb · or use the buttons below' }));
  var opts = el('div', { class: 'ab-opts', role: 'group', 'aria-label': 'Answers' }), res = el('div', { class: 'ab-res' });
  live.appendChild(el('div', { class: 'ab' }, [host, opts, res])); GUI.watchGlass(live);
  var st = makeStage(host, { z: 8.4, fov: 34 });
  var key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 4, 5); st.scene.add(key);
  var rim = new THREE.PointLight(accent(), 26, 16); rim.position.set(-4, 2, -2); st.scene.add(rim);
  var core = makeOrb({ freq: 1.1 }); core.mesh.scale.setScalar(0.95); st.scene.add(core.mesh);
  var orbMat = mats.chrome(0xd2d1ca, 0.12), orbs = [], pulse = 0, grow = 0.95, growT = 0.95, hover = -1, spinV = 0, rot = 0, done = false;
  var geo = new THREE.SphereGeometry(0.3, 40, 28), ray = new THREE.Raycaster(), V = new THREE.Vector3();
  function populate() {
    orbs.forEach(function (o) { st.scene.remove(o.mesh); }); orbs = []; lab.innerHTML = ''; opts.innerHTML = '';
    var s = flow.current(); qBox.innerHTML = '';
    if (!s) return finish();
    qBox.append(el('small', {}, [el('b', { text: 'Question ' + (flow.idx + 1) + ' of ' + flow.total })]), el('h2', { text: s.q }));
    s.opts.forEach(function (op, i) {
      var m = new THREE.Mesh(geo, orbMat); m.position.set(0, 0, 0); m.scale.setScalar(0.01); st.scene.add(m);
      var l = el('span', { text: op.label }); lab.appendChild(l);
      orbs.push({ op: op, mesh: m, a: i / s.opts.length * Math.PI * 2, state: 'in', t: 0, s: 0, l: l });
      opts.appendChild(el('button', { class: 'chip', type: 'button', 'data-opt': op.id, onclick: function () { take(i); }, onpointerenter: function () { hover = i; }, onpointerleave: function () { hover = -1; }, onfocus: function () { hover = i; }, onblur: function () { hover = -1; } }, [op.label, op.sub ? el('small', { text: op.sub }) : null]));
    });
  }
  function take(i) { var o = orbs[i]; if (!o || o.state !== 'in' && o.state !== 'orbit') return; orbs.forEach(function (x, k) { if (k !== i) x.state = 'out'; }); o.state = 'absorb'; o.t = 0; flow.answer(o.op.id); opts.innerHTML = ''; setTimeout(populate, GUI.reduced ? 0 : 1100); growT = 0.95 + flow.idx / flow.total * 0.4; }
  st.canvas.addEventListener('pointermove', function (e) { var r = st.canvas.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), st.camera); var hit = ray.intersectObjects(orbs.map(function (o) { return o.mesh; })); hover = hit.length ? orbs.findIndex(function (o) { return o.mesh === hit[0].object; }) : -1; st.canvas.style.cursor = hover >= 0 ? 'pointer' : 'default'; });
  st.canvas.addEventListener('click', function () { if (hover >= 0) take(hover); });
  st.loop(function (dt, t) {
    rot += dt * (0.22 + spinV); spinV = damp(spinV, 0, 2, dt); pulse = damp(pulse, 0, 3.5, dt); grow = damp(grow, growT, 4, dt);
    core.uni.uT.value = GUI.reduced ? 2 : t; core.uni.uE.value = 0.12 + pulse * 0.5 + (done ? 0.08 : 0); core.mesh.scale.setScalar(grow * (1 + pulse * 0.12)); core.mesh.rotation.y += dt * 0.2;
    core.mesh.position.x = GUI.pointer.nx * 0.1; rim.intensity = 26 + pulse * 40;
    var rw = host.clientWidth, rh = host.clientHeight, R = 3.1, small = rw < 700;
    orbs.forEach(function (o, i) {
      var tgt = new THREE.Vector3(Math.cos(o.a + rot) * R, Math.sin(o.a + rot) * R * 0.5 - (small ? 0 : -0.2), Math.sin(o.a + rot) * 0.9);
      if (o.state === 'in') { o.t += dt; o.s = Math.min(1, o.t / 0.7); o.mesh.position.lerpVectors(new THREE.Vector3(), tgt, 1 - Math.pow(1 - o.s, 3)); if (o.s >= 1) o.state = 'orbit'; }
      else if (o.state === 'orbit') o.mesh.position.copy(tgt);
      else if (o.state === 'absorb') { o.t += dt; var k = Math.min(1, o.t / 0.7); o.mesh.position.lerp(new THREE.Vector3(), Math.min(1, dt * 7)); o.mesh.scale.setScalar(Math.max(0.01, 1 - k) * 1.2); if (k >= 1 && o.state === 'absorb') { o.state = 'gone'; o.mesh.visible = false; pulse = 1; spinV = 1.2; } }
      else if (o.state === 'out') { o.mesh.position.lerp(tgt.multiplyScalar(1.6), Math.min(1, dt * 3)); o.mesh.scale.setScalar(Math.max(0.01, o.mesh.scale.x - dt * 1.6)); }
      if (o.state === 'in' || o.state === 'orbit') o.mesh.scale.setScalar(damp(o.mesh.scale.x, (hover === i ? 1.45 : 1) * (o.state === 'in' ? o.s : 1), 10, dt));
      V.copy(o.mesh.position).project(st.camera); o.l.style.left = ((V.x * 0.5 + 0.5) * rw) + 'px'; o.l.style.top = ((-V.y * 0.5 + 0.5) * rh + 22) + 'px'; o.l.style.opacity = o.state === 'orbit' ? 1 : 0; o.l.classList.toggle('hot', hover === i);
    });
  });
  function finish() {
    done = true; growT = 1.6; pulse = 1; spinV = 4; qBox.append(el('small', {}, [el('b', { text: 'Done' })]), el('h2', { text: 'Your reading list' }));
    var r = flow.result(); res.innerHTML = ''; var left = GUI.result(r), right = el('div'); res.append(left, right);
    GUI.capture(right, { getAnswers: function () { return flow.answers; }, onRestart: function () { flow.reset(); done = false; growT = 0.95; res.innerHTML = ''; populate(); } });
    GUI.watchGlass(res); setTimeout(function () { res.scrollIntoView({ block: 'nearest', behavior: GUI.reduced ? 'auto' : 'smooth' }); }, 200);
  }
  populate();
})();
