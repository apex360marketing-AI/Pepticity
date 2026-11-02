/* PEPTICITY BOT GALLERY · three.js helpers: lit stage with PMREM reflections, chrome / glass / gunmetal materials, and the logo P extruded from the ONE swap slot (--logo-p). */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/RoomEnvironment.js';
import { SVGLoader } from 'three/addons/SVGLoader.js';
export { THREE };

export function makeStage(host, o) {
  o = o || {};
  var canvas = document.createElement('canvas'); canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:' + (o.touch || 'pan-y');
  canvas.setAttribute('aria-hidden', 'true'); host.appendChild(canvas);
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = o.exposure || 1.0; renderer.outputColorSpace = THREE.SRGBColorSpace;
  var scene = new THREE.Scene();
  var pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
  var camera = new THREE.PerspectiveCamera(o.fov || 35, 1, 0.1, 100); camera.position.set(0, 0, o.z || 6);
  var st = { renderer: renderer, scene: scene, camera: camera, canvas: canvas, host: host, w: 1, h: 1, visible: true, tick: [] };
  st.resize = function () {
    var r = host.getBoundingClientRect(); var w = Math.max(2, Math.round(r.width)), h = Math.max(2, Math.round(r.height));
    st.w = w; st.h = h; renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, o.maxDpr || 1.75)); renderer.setSize(w, h, false); if (st.camera.isPerspectiveCamera) { st.camera.aspect = w / h; st.camera.updateProjectionMatrix(); } st.onresize && st.onresize(w, h);
  };
  new ResizeObserver(st.resize).observe(host); st.resize();
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { st.visible = e[0].isIntersecting; }).observe(host);
  var clock = new THREE.Clock();
  st.loop = function (fn) { st.tick.push(fn); };
  function frame() {
    requestAnimationFrame(frame);
    if (!st.visible || document.hidden) return;
    var dt = Math.min(0.1, clock.getDelta()), t = clock.elapsedTime;
    for (var i = 0; i < st.tick.length; i++) st.tick[i](dt, t);
    renderer.render(scene, st.camera);
  }
  frame();
  return st;
}

export var mats = {
  chrome: function (c, r) { return new THREE.MeshStandardMaterial({ color: c || 0xb9b8b1, metalness: 0.92, roughness: Math.max(0.2, r == null ? 0.24 : r + 0.1), envMapIntensity: 2.1 }); },
  gunmetal: function () { return new THREE.MeshStandardMaterial({ color: 0x2b2b2d, metalness: 1, roughness: 0.34, envMapIntensity: 0.9 }); },
  uv: function () { return new THREE.MeshStandardMaterial({ color: 0x0b0b0c, metalness: 0.6, roughness: 0.28, envMapIntensity: 0.8 }); },
  glass: function (t) { return new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.03, transmission: 1, thickness: t || 0.5, ior: 1.45, envMapIntensity: 1.3, transparent: true, specularIntensity: 1 }); },
  /* rim light the accent only on thin edges: a small emissive line material */
  edge: function () { var c = new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--v-t').trim() || '#59A0FF'); return new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: 0.85 }); }
};
export function accent() { return new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--v-t').trim() || '#59A0FF'); }

/* the logo P, extruded from the swap slot. Resolves to a THREE.Group centred at the origin, ~width 2.4 units. */
export function loadP(material, o) {
  o = o || {}; var probe = document.createElement('i'); probe.style.cssText = 'position:absolute;width:0;height:0;background-image:var(--logo-p)'; document.body.appendChild(probe);
  var m = /url\(["']?([^"')]+)["']?\)/.exec(getComputedStyle(probe).backgroundImage); probe.remove();
  var url = m ? m[1] : '../assets/p-mark.svg';
  return fetch(url).then(function (r) { return r.text(); }).then(function (txt) {
    var data = new SVGLoader().parse(txt), g = new THREE.Group(), shapes = [];
    data.paths.forEach(function (p) { SVGLoader.createShapes(p).forEach(function (s) { shapes.push(s); }); });
    var geo = new THREE.ExtrudeGeometry(shapes, { depth: o.depth || 0.16, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.014, bevelSegments: 4, curveSegments: 20 });
    geo.scale(1, -1, 1); geo.computeBoundingBox(); var b = geo.boundingBox, cx = (b.max.x + b.min.x) / 2, cy = (b.max.y + b.min.y) / 2, cz = (b.max.z + b.min.z) / 2;
    geo.translate(-cx, -cy, -cz); geo.computeVertexNormals();
    var k = (o.width || 2.4) / (b.max.x - b.min.x); var mesh = new THREE.Mesh(geo, material); mesh.scale.setScalar(k); g.add(mesh); g.userData.mesh = mesh;
    return g;
  });
}
export var damp = function (c, t, l, dt) { return c + (t - c) * (1 - Math.exp(-l * dt)); };
