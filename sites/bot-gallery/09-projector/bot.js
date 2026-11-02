/* 09 · PROJECTOR: a 3D chrome emitter projects a beam; every question prints onto a glass panel with a soft scan. */
import { THREE, makeStage, mats, accent, damp } from '../shared/gthree.js';
(function () {
  var live = GUI.frame(), el = GUI.el, flow = GBrain.createFlow();
  var panelMount = el('div', { style: 'width:100%;position:relative;z-index:1' }), base = el('div', { class: 'pj-base' }), beam = el('div', { class: 'pj-beam', 'aria-hidden': 'true' }), em = el('div', { class: 'pj-em', 'aria-hidden': 'true' });
  base.append(beam, em); live.appendChild(el('div', { class: 'pj' }, [panelMount, base]));
  var st = makeStage(em, { z: 9, fov: 28 });
  var key = new THREE.DirectionalLight(0xffffff, 2.6); key.position.set(2, 5, 6); st.scene.add(key);
  var rimL = new THREE.PointLight(accent(), 20, 14); rimL.position.set(-3, 2, 3); st.scene.add(rimL);
  var chrome = mats.chrome(0xd0cfc8, 0.1), dark = mats.gunmetal(), g = new THREE.Group(); g.position.y = -0.9; st.scene.add(g);
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.8, 0.5, 64), chrome));
  var mid = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.25, 0.34, 64), dark); mid.position.y = 0.4; g.add(mid);
  var lens = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.07, 20, 64), new THREE.MeshBasicMaterial({ color: accent() })); lens.rotation.x = Math.PI / 2; lens.position.y = 0.6; g.add(lens);
  var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 48), chrome); cap.position.y = 0.62; g.add(cap);
  var glow = 0; st.loop(function (dt, t) { glow = damp(glow, 0, 2.4, dt); lens.scale.setScalar(1 + glow * 0.12); lens.material.color.copy(accent()).multiplyScalar(0.55 + glow * 0.6); g.rotation.y = GUI.reduced ? 0 : t * 0.25 + GUI.pointer.nx * 0.3; g.rotation.x = 0.28 + GUI.pointer.ny * 0.05; rimL.intensity = 20 + glow * 40; });
  var cur = null;
  function printPanel(build, cb) {
    var go = function () {
      var p = el('section', { class: 'pj-panel glass' }, [el('div', { class: 'pj-scan', 'aria-hidden': 'true' }), el('div', { class: 'pj-sweep', 'aria-hidden': 'true' })]); build(p); panelMount.innerHTML = ''; panelMount.appendChild(p); GUI.watchGlass(p);
      requestAnimationFrame(function () { p.classList.add('in'); beam.classList.add('on'); glow = 1; }); cur = p; cb && cb(p);
    };
    if (cur && !GUI.reduced) { cur.classList.remove('in'); cur.classList.add('out'); beam.classList.remove('on'); setTimeout(go, 330); } else go();
  }
  function show() {
    var s = flow.current();
    if (!s) return printPanel(function (p) { p.classList.add('pj-res'); p.append(el('div', { class: 'n' }, [el('b', { text: 'Printed' }), ' · your reading list']), GUI.result(flow.result()), el('button', { class: 'btn main', type: 'button', 'data-opt': 'continue', text: 'Send me this list', onclick: function () { printPanel(function (q) { var m = el('div'); q.appendChild(m); GUI.capture(m, { getAnswers: function () { return flow.answers; }, onRestart: function () { flow.reset(); show(); } }); }); } })); });
    printPanel(function (p) {
      var o = el('div', { class: 'pj-opts', role: 'group', 'aria-label': s.q });
      p.append(el('div', { class: 'n' }, [el('b', { text: 'Print ' + (flow.idx + 1) + ' of ' + flow.total }), ' · ' + s.hint]), el('h2', { text: s.q }), o);
      s.opts.forEach(function (op) { o.appendChild(el('button', { class: 'chip', type: 'button', 'data-opt': op.id, onclick: function () { flow.answer(op.id); show(); } }, [op.label, op.sub ? el('small', { text: op.sub }) : null])); });
    });
  }
  show();
})();
