// S2 hero scene: PEPTICITY (gunmetal) + GRAND OPENING (chrome gold) on the PEPTICITY STUDIO engine.
// Transparent canvas: the Obsidian ground shows through; a shadow catcher keeps the soft cast shadow.
const canvas3d = document.getElementById('gl');
const stage = createStage(canvas3d);
if (stage) {
  const clamp3 = (v, a, b) => Math.min(b, Math.max(a, v));
  function wordSlot(el, text, opt) {
    const scene = new THREE.Scene();
    const w = makeWord(stage, text, { face: opt.face, depth: opt.depth, bevel: opt.bevel, track: opt.track });
    scene.add(w.group);
    const catcher = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), new THREE.ShadowMaterial({ opacity: 0.5 }));
    catcher.position.z = -0.26; catcher.receiveShadow = true; scene.add(catcher);
    const key = new THREE.DirectionalLight(0xffffff, 1.9); key.position.set(2.6, 2.2, 2.6); key.castShadow = true;
    key.shadow.mapSize.set(MOBILE ? 1024 : 2048, MOBILE ? 1024 : 2048); key.shadow.radius = 7; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.01;
    const sc = key.shadow.camera, hw = w.width / 2 + 1.2; sc.left = -hw; sc.right = hw; sc.top = 3; sc.bottom = -3; sc.near = 0.5; sc.far = 20;
    scene.add(key); scene.add(key.target);
    scene.add(new THREE.HemisphereLight(0xe8eaf0, 0x0c0a12, 0.26));
    const violet = new THREE.PointLight(0x7a5cff, 0.45, 8, 2); violet.position.set(-2.4, -0.8, 1.3); scene.add(violet);
    const gold = new THREE.PointLight(0xf0e6c7, opt.goldRim, 9, 2); gold.position.set(2.6, -0.7, 1.5); scene.add(gold);
    const camera = new THREE.PerspectiveCamera(24, 2, 0.1, 60);
    const slot = {
      scene, camera,
      fit: a => fitCamera(camera, w.width, w.height * 1.18, a, opt.fill, 0),
      update(dt, t, prog, pointer) {
        w.letters.forEach((l, i) => {
          const k = REDUCED ? 1 : clamp3((t - 0.3 - i * 0.075) / 1.0, 0, 1), e = 1 - Math.pow(1 - k, 3);
          l.rotation.y = (1 - e) * Math.PI * 0.95; l.position.z = (1 - e) * -0.5;
        });
        const ty = REDUCED ? 0 : pointer.x * opt.sway + (prog - 0.5) * -0.1, tx = REDUCED ? 0 : pointer.y * 0.07 + (prog - 0.5) * 0.12;
        w.group.rotation.y += (ty - w.group.rotation.y) * 0.06; w.group.rotation.x += (tx - w.group.rotation.x) * 0.06;
        w.group.position.y = Math.sin(t * 0.6) * 0.012;
      }
    };
    return stage.addSlot(el, slot);
  }
  wordSlot(document.querySelector('[data-slot="word"]'), 'PEPTICITY', { face: 'gunmetal', depth: 0.13, bevel: 0.015, track: 0.035, goldRim: 0.55, fill: 0.94, sway: 0.2 });
  wordSlot(document.querySelector('[data-slot="tag"]'), 'GRAND OPENING', { face: 'goldchrome', depth: 0.1, bevel: 0.012, track: 0.07, goldRim: 0.2, fill: 0.96, sway: 0.1 });
}
