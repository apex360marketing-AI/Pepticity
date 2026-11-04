/* TYP-101 · CHEVRON STEEL — real 3D wordmark (three.js r160).
   mountWordmark(container, { text, style, flex, onLost }) -> { destroy, frames, seek, snapshot }
   style: a key of STYLES below (default 'gunmetal', the owner's original pick).
   Needs window.TYP101 (glyphs.js) loaded first. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';

const damp = (c, t, l, dt) => c + (t - c) * (1 - Math.exp(-l * dt));
const easeOut = x => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 4);
const SPARK = 0xd4ff3a;

/* Each style = metal for the letter faces and edges, the wall (or none = dark void), the room the metal
   reflects, and the colour of the light that climbs the A and crosses the word. */
export const STYLES = {
  gunmetal:  { name: 'BRUSHED GUNMETAL', face: { color: 0x80848a, metalness: 1, roughness: 0.4, brushed: 0.22 }, side: { color: 0x5d6065, metalness: 1, roughness: 0.28 }, wall: 0x1d1e20, room: 'soft', light: 0xffffff },
  gunspark:  { name: 'GUNMETAL · CHARTREUSE LIGHT', face: { color: 0x7a7e84, metalness: 1, roughness: 0.4, brushed: 0.22 }, side: { color: 0x55585d, metalness: 1, roughness: 0.28 }, wall: 0x1a1b1d, room: 'soft', light: SPARK },
  onyx:      { name: 'ONYX · CHROME EDGE', face: { color: 0x050506, metalness: 0, roughness: 0.7, envMapIntensity: 0.25 }, side: { color: 0xeef0f2, metalness: 1, roughness: 0.06 }, wall: null, room: 'dark', light: SPARK, glow: 0.05 },
  obsidian:  { name: 'OBSIDIAN GLASS · STEEL EDGE', face: { color: 0x0a0b0d, metalness: 0, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.03 }, side: { color: 0x8a8e94, metalness: 1, roughness: 0.32, brushed: 0.2 }, wall: null, room: 'dark', light: SPARK },
  smoke:     { name: 'SMOKED GLASS · CHROME EDGE', face: { color: 0x30353c, metalness: 0, roughness: 0.18, transmission: 0.55, thickness: 18, ior: 1.45, attenuationColor: 0x15181c, attenuationDistance: 12 }, side: { color: 0xf0f2f4, metalness: 1, roughness: 0.05 }, wall: null, room: 'dark', light: SPARK, glowInside: true, glow: 0.5 },
  blackened: { name: 'BLACKENED STEEL · CONCRETE', face: { color: 0x44474b, metalness: 1, roughness: 0.42, brushed: 0.25 }, side: { color: 0x2f3134, metalness: 1, roughness: 0.3 }, wall: 0x3a3b3e, room: 'soft', light: 0xffffff },
  titanium:  { name: 'BRUSHED TITANIUM · ONYX WALL', face: { color: 0xb3b8bf, metalness: 1, roughness: 0.34, brushed: 0.2 }, side: { color: 0x8c9198, metalness: 1, roughness: 0.22 }, wall: 0x0e0f11, room: 'soft', light: SPARK },
  oxblood:   { name: 'STEEL · OXBLOOD WALL', face: { color: 0x8a8d92, metalness: 1, roughness: 0.38, brushed: 0.22 }, side: { color: 0x606368, metalness: 1, roughness: 0.26 }, wall: 0x2a1416, room: 'soft', light: 0xffffff },
  bone:      { name: 'BONE CERAMIC · ESPRESSO WALL', face: { color: 0xe6e0d6, metalness: 0, roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.2 }, side: { color: 0xcfc8bc, metalness: 0, roughness: 0.45 }, wall: 0x1e1714, room: 'soft', light: 0xfff6ea },
  inkbone:   { name: 'BONE FACE · BLACK CHROME · INK', face: { color: 0xece9e3, metalness: 0, roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.15 }, side: { color: 0x1a1b1e, metalness: 1, roughness: 0.1 }, wall: 0x0c0e13, room: 'soft', light: SPARK },
};

export function brushedTexture() {
  const W = 1024, H = 256, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d'); c.fillStyle = '#808080'; c.fillRect(0, 0, W, H);
  let s = 7; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 2600; i++) {
    const y = rnd() * H, v = 90 + rnd() * 80 | 0;
    c.strokeStyle = `rgba(${v},${v},${v},${0.05 + rnd() * 0.12})`; c.lineWidth = 0.5 + rnd() * 1.4;
    c.beginPath(); c.moveTo(-10, y); c.lineTo(W + 10, y + (rnd() - 0.5) * 1.5); c.stroke();
  }
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.NoColorSpace;
  t.anisotropy = 8; return t;
}

/* Corner flex: the word bends like a sheet. Top-left and bottom-right lean back while bottom-left and
   top-right come forward, then they swap; the bend runs through the middle. z = amp * x * y (a saddle),
   with normals bent to match so the light rolls across the faces as it flexes. */
/* Glow-through: wherever the moving light is, the letters also glow faintly from inside (emissive that
   follows the light), so the light reads as passing through the metal or glass, not only over it. */
export function addFlex(mat, U, glow) {
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, { uFlex: U.uFlex, uHalf: U.uHalf, uGlowPos: U.uGlowPos, uGlowCol: U.uGlowCol, uGlowAmt: { value: glow } });
    sh.fragmentShader = 'uniform vec3 uGlowPos;\nuniform vec3 uGlowCol;\nuniform float uGlowAmt;\nvarying vec3 vGlowW;\n' + sh.fragmentShader
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        { float d = distance(vGlowW, uGlowPos); totalEmissiveRadiance += uGlowCol * uGlowAmt * exp(-d * d * 6.0); }`);
    sh.vertexShader = 'uniform float uFlex;\nuniform vec2 uHalf;\nvarying vec3 vGlowW;\n' + sh.vertexShader
      .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
        { vec2 q = position.xy / uHalf; float fx = uFlex * q.y / uHalf.x, fy = uFlex * q.x / uHalf.y;
          objectNormal = vec3(objectNormal.x - fx * objectNormal.z, objectNormal.y - fy * objectNormal.z, objectNormal.z); }`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        { vec2 q = position.xy / uHalf; transformed.z += uFlex * q.x * q.y; }
        vGlowW = (modelMatrix * vec4(transformed, 1.0)).xyz;`);
  };
  mat.customProgramCacheKey = () => 'typ101flex';
}

/* Shared kit for other TYP-101 views (letter board): the studio reflections and the two materials. */
export function buildEnv(renderer, ST) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = ST.room === 'soft' ? new RoomEnvironment(renderer) : new THREE.Scene();
  if (ST.room === 'dark') {
    room.background = new THREE.Color(0x050608);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ color: 0x24272c }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -4; room.add(floor);
  }
  const strip = new THREE.MeshBasicMaterial({ color: 0xffffff }); strip.color.setScalar(ST.room === 'soft' ? 7 : 14);
  (ST.room === 'soft' ? [[-6, 5, 2, .4, 10], [6.5, 3, 1, .3, 8], [0, 9.5, 4, 9, .35]]
                      : [[-5, 2, 4, .5, 9], [5.5, 1, 3, .35, 8], [0, 7, 5, 12, .5], [0, -1.5, 6, 14, .18]])
    .forEach(([x, y, z, w, h]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, .3), strip); m.position.set(x, y, z); room.add(m); });
  const envRT = pmrem.fromScene(room, 0.04);
  room.traverse(o => { o.geometry?.dispose(); o.material?.dispose(); }); pmrem.dispose(); strip.dispose();
  return envRT;
}
export function makeMaterials(ST, brush, U) {
  const toMat = cfg => {
    const { brushed, ...p } = cfg;
    if (brushed) Object.assign(p, { roughnessMap: brush, bumpMap: brush, bumpScale: brushed });
    return new THREE.MeshPhysicalMaterial(p);
  };
  const face = toMat(ST.face), side = toMat(ST.side);
  addFlex(face, U, ST.glow ?? 0.12); addFlex(side, U, (ST.glow ?? 0.12) * 0.6);
  return { face, side };
}
export function glyphGeometry(g, segs = 5) {
  const shapes = g.outlines.map(ol => {
    const sh = new THREE.Shape(ol.pts.map(([x, y]) => new THREE.Vector2(x, y)));
    ol.holes.forEach(h => sh.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, y)))));
    return sh;
  });
  let geo = new THREE.ExtrudeGeometry(shapes, { depth: 20, bevelEnabled: true, bevelThickness: 2.4, bevelSize: 1.8, bevelOffset: -0.6, bevelSegments: segs, curveSegments: 4 });
  geo = toCreasedNormals(geo, Math.PI / 5);
  geo.translate(-g.w / 2, -50, -10);
  return geo;
}

export function mountWordmark(el, opts = {}) {
  const text = opts.text || 'APEX 360';
  const ST = STYLES[opts.style] || STYLES.gunmetal;
  const FLEX = opts.flex !== false;
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MOBILE = matchMedia('(max-width: 900px)').matches;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'display:block;width:100%;height:100%';
  el.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, MOBILE ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  // 'soft' = grey studio room (brushed metals); 'dark' = black studio with bright strips (chrome, glass).
  const room = ST.room === 'soft' ? new RoomEnvironment(renderer) : new THREE.Scene();
  if (ST.room === 'dark') {
    room.background = new THREE.Color(0x050608);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ color: 0x24272c }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -4; room.add(floor);
  }
  const strip = new THREE.MeshBasicMaterial({ color: 0xffffff }); strip.color.setScalar(ST.room === 'soft' ? 7 : 14);
  (ST.room === 'soft' ? [[-6, 5, 2, .4, 10], [6.5, 3, 1, .3, 8], [0, 9.5, 4, 9, .35]]
                      : [[-5, 2, 4, .5, 9], [5.5, 1, 3, .35, 8], [0, 7, 5, 12, .5], [0, -1.5, 6, 14, .18]])
    .forEach(([x, y, z, w, h]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, .3), strip); m.position.set(x, y, z); room.add(m); });
  const envRT = pmrem.fromScene(room, 0.04);
  room.traverse(o => { o.geometry?.dispose(); o.material?.dispose(); }); pmrem.dispose();
  scene.environment = envRT.texture;

  // The wall the letters stand off, catching their shadow (none for the dark-void styles).
  // Coloured (chartreuse) light must not tint the wall olive, so those walls only catch shadow and the
  // page behind the canvas supplies the wall colour.
  const tinted = ST.light !== 0xffffff && ST.light !== 0xfff6ea;
  const wallMat = tinted ? new THREE.ShadowMaterial({ opacity: 0.6 })
                         : new THREE.MeshStandardMaterial({ color: ST.wall ?? 0x000000, roughness: 0.95, metalness: 0, envMapIntensity: 0.12 });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), wallMat);
  wall.receiveShadow = true; if (ST.wall != null) scene.add(wall);

  const key = new THREE.DirectionalLight(0xffffff, 1.9);
  key.position.set(2.2, 5.5, 7.5); key.castShadow = true;
  key.shadow.mapSize.set(MOBILE ? 1024 : 2048, MOBILE ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 3, bottom: -3, near: 1, far: 20 });
  key.shadow.radius = 14; key.shadow.blurSamples = 20; key.shadow.bias = -0.0006;
  scene.add(key);
  // Low fill so the unlit side of the sweep falls into shadow.
  scene.add(new THREE.HemisphereLight(0xdfe2e6, 0x18191b, 0.2));
  const sheen = new THREE.PointLight(ST.light, 0, 3.2, 1.4); sheen.position.set(-6, 0.6, 1.1); scene.add(sheen);
  const SHEEN_MAX = tinted ? 13 : 8;   // coloured light reads weaker on grey metal, so push it
  // Glass styles also get a faint light inside the letters, so the glow reads "through" them.
  const inner = ST.glowInside ? new THREE.PointLight(ST.light, 0, 2.2, 1.6) : null;
  if (inner) { inner.position.set(0, 0, 0.42); scene.add(inner); }
  let aX = 0, aBot = -0.5, aTop = 0.5;   // where the A sits, so the sheen can climb it

  const brush = brushedTexture(); brush.repeat.set(1 / 260, 1 / 65);
  const toMat = cfg => {
    const { brushed, ...p } = cfg;
    if (brushed) Object.assign(p, { roughnessMap: brush, bumpMap: brush, bumpScale: brushed });
    return new THREE.MeshPhysicalMaterial(p);
  };
  const face = toMat(ST.face), side = toMat(ST.side);
  const U = { uFlex: { value: 0 }, uHalf: { value: new THREE.Vector2(400, 50) }, uGlowPos: { value: new THREE.Vector3(-99, 0, 0) }, uGlowCol: { value: new THREE.Color(ST.light) } };
  addFlex(face, U, ST.glow ?? 0.12); addFlex(side, U, (ST.glow ?? 0.12) * 0.6);

  const S = 0.01, LINE = 1.36;
  const group = new THREE.Group(); scene.add(group);
  let letters = [], geos = [], wordW = 1, wordH = 1, stacked = null;
  function build(lines) {
    geos.forEach(g => g.dispose()); geos = []; letters = [];
    while (group.children.length) group.remove(group.children[0]);
    const lays = lines.map(l => window.TYP101.layout(l));
    wordW = Math.max(...lays.map(l => l.width)) * S; wordH = (lines.length - 1) * LINE + 1;
    U.uHalf.value.set(wordW / 2 / S, wordH / 2 / S);
    let n = 0;
    lays.forEach((L, li) => {
      const yOff = ((lines.length - 1) / 2 - li) * LINE / S;
      L.glyphs.forEach(({ x, g }) => {
        const shapes = g.outlines.map(ol => {
          const sh = new THREE.Shape(ol.pts.map(([px, py]) => new THREE.Vector2(px + x, py)));
          ol.holes.forEach(h => sh.holes.push(new THREE.Path(h.map(([px, py]) => new THREE.Vector2(px + x, py)))));
          return sh;
        });
        let geo = new THREE.ExtrudeGeometry(shapes, { depth: 20, bevelEnabled: true, bevelThickness: 2.4, bevelSize: 1.8, bevelOffset: -0.6, bevelSegments: MOBILE ? 3 : 5, curveSegments: 4 });
        geo = toCreasedNormals(geo, Math.PI / 5);
        geo.translate(-L.width / 2, -50 + yOff, 0); geos.push(geo);
        const m = new THREE.Mesh(geo, [face, side]); m.scale.setScalar(S);
        m.castShadow = true; m.receiveShadow = true;
        const pivot = new THREE.Group(); pivot.add(m);
        if (n === 0) { aX = (x + g.w / 2 - L.width / 2) * S; aBot = (-50 + yOff) * S; aTop = (50 + yOff) * S; }
        group.add(pivot); letters.push({ pivot, i: n++ });
      });
    });
  }
  const words = String(text).split(' ');
  function fitLayout(aspect) {
    const want = aspect < (opts.stackBelow || 0.9) && words.length > 1;
    if (want !== stacked) { stacked = want; build(want ? words : [text]); }
  }
  fitLayout(el.clientWidth / Math.max(1, el.clientHeight));

  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
  const pointer = { x: 0, y: 0 };
  const clamp1 = v => Math.max(-1, Math.min(1, v));
  const onMove = e => { const r = el.getBoundingClientRect(); pointer.x = clamp1(((e.clientX - r.left) / r.width) * 2 - 1); pointer.y = clamp1(((e.clientY - r.top) / r.height) * 2 - 1); };
  if (!REDUCED) addEventListener('pointermove', onMove, { passive: true });

  let raf = 0, last = performance.now(), t = REDUCED ? 99 : 0, frames = 0, visible = true, rw = 0, rh = 0;
  const st = { rx: 0, ry: 0 };

  function frame(now) {
    raf = 0;
    const dt = Math.min(Math.max((now - last) / 1000, 0), 1 / 15); last = Math.max(last, now);
    if (!REDUCED) t += dt;
    const W = el.clientWidth, H = el.clientHeight;
    if (W !== rw || H !== rh) {
      rw = W; rh = H; renderer.setSize(W, H, false); camera.aspect = W / Math.max(1, H); fitLayout(camera.aspect);
      const tf = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const fit = Math.max((wordW * 1.25) / (tf * camera.aspect), (wordH * 1.9) / tf);
      camera.position.set(0, -0.15, Math.max(4.2, fit) + 0.3); camera.lookAt(0, 0, 0.3); camera.updateProjectionMatrix();
    }
    // Intro: each letter slides out of the wall, staggered left to right.
    letters.forEach(({ pivot, i }) => {
      const p = easeOut((t - 0.15 - i * 0.11) / 1.1);
      pivot.position.z = 0.32 - (1 - p) * 0.42;
      pivot.rotation.x = (1 - p) * -0.5;
    });
    st.ry = damp(st.ry, pointer.x * 0.2 + Math.sin(t * 0.45) * 0.06, 3.5, dt);
    st.rx = damp(st.rx, pointer.y * 0.1, 3.5, dt);
    group.rotation.set(st.rx, st.ry, 0);
    // Flex: ~16 glyph units (0.16) at the corners, easing in after the intro, a slow 7 s breath.
    U.uFlex.value = FLEX ? Math.sin(t * 0.9) * 16 * easeOut((t - 1.2) / 1.5) : 0;
    // Sheen: starts low under the A in shadow, climbs to the peak, then travels across the word near the top.
    if (t > 1.6) {
      const cyc = ((t - 1.6) % 5.5) / 5.5;
      const RISE = 0.34, sm = x => x * x * (3 - 2 * x);
      if (cyc < RISE) {
        const u = sm(cyc / RISE);
        sheen.position.set(aX, aBot - 0.45 + u * (aTop - aBot + 0.5), 1.0);
        sheen.intensity = sm(Math.min(1, cyc / 0.16)) * SHEEN_MAX;
      } else {
        const u = sm((cyc - RISE) / (1 - RISE));
        sheen.position.set(aX + u * (wordW / 2 + 0.6 - aX), aTop + 0.05 - u * 0.35, 1.0);
        sheen.intensity = SHEEN_MAX * Math.min(1, (1 - cyc) / 0.15);
      }
      if (inner) { inner.position.x = sheen.position.x; inner.intensity = sheen.intensity * 0.35; }
      U.uGlowPos.value.set(sheen.position.x, sheen.position.y, 0.45);  // world space, like the letters' vGlowW
      U.uGlowCol.value.set(ST.light).multiplyScalar(sheen.intensity / SHEEN_MAX);
    }
    renderer.render(scene, camera); frames++;
    if (!REDUCED && visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }, { rootMargin: '80px' });
  io.observe(el);
  const onVis = () => { if (!document.hidden) { last = performance.now(); kick(); } };
  document.addEventListener('visibilitychange', onVis);
  const ro = new ResizeObserver(kick); ro.observe(el);
  renderer.compile(scene, camera); kick();

  function destroy() {
    cancelAnimationFrame(raf); raf = 0; io.disconnect(); ro.disconnect();
    removeEventListener('pointermove', onMove); document.removeEventListener('visibilitychange', onVis);
    geos.forEach(g => g.dispose()); [face, side, wallMat, strip].forEach(m => m.dispose()); brush.dispose();
    wall.geometry.dispose(); envRT.dispose(); renderer.dispose(); renderer.forceContextLoss(); canvas.remove();
  }
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); destroy(); opts.onLost?.(); });
  return {
    destroy, get frames() { return frames; }, running: () => !!raf,
    seek(v) { t = v; },  // test hook: jump the animation clock
    snapshot() { cancelAnimationFrame(raf); raf = 0; frame(performance.now()); const c = document.createElement('canvas'); c.width = canvas.width; c.height = canvas.height; c.getContext('2d').drawImage(canvas, 0, 0); return c; },
  };
}
