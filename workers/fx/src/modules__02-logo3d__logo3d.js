<script data-pep-src="modules/02-logo3d/logo3d.js">
(function () {
  'use strict';
  /* PEPTICITY logo engine: 07 = NUMBER 21 BACKLIT + CHROME LINES (LOGO-LOCK.md, locked Nov 12 2026, night).
     07 is number 21 (below, unchanged) plus three things from Jeff_builds/logo-21-pop/src.html entry 07
     { studio:'pop', exp:1.18, bg:'back', lines:true }: the rim-light room and exposure 1.18, chrome lines (a gunmetal band
     round the middle of the P's thick edge, thin chrome lines on every outline with a glint running along them), and a
     cool backlight behind each P and word (CSS, under the canvas, see logo3d.css). Labels get the lines, never the backlight.
     NUMBER 21, as it was: (LOGO-LOCK.md, locked Nov 12 2026).
     The build of the logo is copied value for value from the page the owner picked from, Jeff_builds/logo-15/src.html,
     entry 21 of window.__V:  { fam:'E', name:'SMOKED GLASS', light:'blue', p:{ face:'glass', edge:'glass' }, w:{ edge:'gunEdge' } }
     That covers: how deep the P and the word are cut, the two materials, the thin blue light through the P's waist and its
     glow, the studio room the glass and the metal reflect, how that room's light travels, tone mapping and exposure.
     Do not restyle. No gold anywhere. The outlines come from assets/marks.json, the same file that page uses.
     What this file adds is unchanged from before: slots arrive over the bus, label slots draw face-on and never tilt, slots
     marked hold wait for the entrance to finish, and the P turns as it did (the word stays still). */
  PEP.register('logo3d', {
    init: function (root, ctx) {
      var canvas = root.querySelector('canvas');
      var pending = [];
      var engine = null;
      var gateOpen = false;

      ctx.on('logo3d:slot', function (req) {
        if (!req || !req.el) { return; }
        if (engine) { engine.add(req); } else { pending.push(req); }
      });
      function openGate() { gateOpen = true; if (engine) { engine.kick(); } }
      ctx.on('entrance:done', openGate);
      setTimeout(openGate, 6000);            // never leave a held logo dark if the entrance fails

      var dead = false;
      function off(why) {
        if (dead) { return; }
        dead = true;
        root.setAttribute('data-pep3d-state', 'off');
        ctx.emit('logo3d:off');
        console.warn('[PEP] 3d off: ' + why);
      }
      var slow = setTimeout(function () { if (!engine) { off('engine did not start in 9 s'); } }, 9000);
      boot().then(function () {
        clearTimeout(slow);
        if (!dead) { ctx.emit('logo3d:ready'); }
      }).catch(function (e) {
        clearTimeout(slow);
        off(e && e.message ? e.message : String(e));
      });
      ctx.emit('logo3d:ready');              // sections announce their slots now; requests queue until the engine is up

      async function boot() {
        // three.js 0.185.1. A LIVE build ships a fixed import map for its own copy (written by build.mjs) and never
        // reaches for a third party: if its own files are missing, 3D simply turns off. Only a PREVIEW build may fall
        // back to the public copy, and then pinned by hash so a changed file is refused by the browser.
        var LOCAL = 'vendor/three/', CDN = 'https://cdn.jsdelivr.net/npm/three@0.185.1/';
        if (!document.querySelector('script[type="importmap"]')) {
          if (!(ctx.config.flags && ctx.config.flags.PREVIEW)) { throw new Error('no import map on a live build'); }
          var map;
          try {
            var probe = await fetch(LOCAL + 'three.module.js', { method: 'HEAD' });
            await probe.arrayBuffer();
            if (!probe.ok) { throw new Error('no local three'); }
            map = { imports: { 'three': './' + LOCAL + 'three.module.js', 'three/addons/': './' + LOCAL + 'addons/' } };
          } catch (e) {
            map = { imports: { 'three': CDN + 'build/three.module.js', 'three/addons/': CDN + 'examples/jsm/' }, integrity: {} };
            map.integrity[CDN + 'build/three.module.js'] = 'sha384-Ecdwhw2t8c3nTR0hkEDZbwj+5rkKqzJ376RCQN2x1uofujOCuW/EvGg3BQzE7TS6';
            map.integrity[CDN + 'build/three.core.js'] = 'sha384-tfsIoyn3ACQbjob5Sw0zEGbcRscYZPCUEypq6YYs/TKQlq7Yg9jILDm/oZnfpq3D';
            map.integrity[CDN + 'examples/jsm/utils/BufferGeometryUtils.js'] = 'sha384-05mkYituMJObxUkTK7xbW9SA45DEaxOge7FQUGrhW3dsFz0fckzykM6RMAPN26rD';
            map.integrity[CDN + 'examples/jsm/lines/LineSegments2.js'] = 'sha384-PodS3f4Ob57FETbMdk39akLP+W9/ScGjH/bBDerYOTsUt6dZc/i2Cbx7GW47tr5u';
            map.integrity[CDN + 'examples/jsm/lines/LineSegmentsGeometry.js'] = 'sha384-c1W/XWY1D45CznDDaXT87QmzD1YKNwYHvQegG8dXjCyf5ZaKzaWqEUwHZTYfBw64';
            map.integrity[CDN + 'examples/jsm/lines/LineMaterial.js'] = 'sha384-ijlzWpc1yHwTvvgLgdhkrcd5RQTKG/twLNwGumhKSFZHITTXMnzRdHIrw8fmvM3o';
          }
          var im = document.createElement('script');
          im.type = 'importmap';
          im.textContent = JSON.stringify(map);
          document.head.appendChild(im);
        }

        var res = await fetch('assets/marks.json');
        if (!res.ok) { throw new Error('marks.json ' + res.status); }
        var D = await res.json();
        var tick = function () { return new Promise(function (r) { setTimeout(r, 0); }); };   // lets the page paint between heavy steps
        var THREE = await import('three');
        var utils = await import('three/addons/utils/BufferGeometryUtils.js');
        var toCreasedNormals = utils.toCreasedNormals;
        var lineMods = await Promise.all([import('three/addons/lines/LineSegments2.js'), import('three/addons/lines/LineSegmentsGeometry.js'), import('three/addons/lines/LineMaterial.js')]);
        var LineSegments2 = lineMods[0].LineSegments2, LineSegmentsGeometry = lineMods[1].LineSegmentsGeometry, LineMaterial = lineMods[2].LineMaterial;

        var MOBILE = window.matchMedia('(max-width: 899px)').matches;
        var REDUCED = ctx.motion.reduced || location.hash === '#still';
        var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MOBILE ? 1.5 : 2));
        renderer.setClearColor(0, 0); renderer.autoClear = false;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.18;     // 07: ACES filmic, exposure 1.18 (number 21 was 1.0), sRGB out

        // the studio room of number 21, copied from src.html studio(BLUE). No big white wall in front: a dim wall with two
        // slanted blades of light, so a flat face shows dark glass with a highlight travelling over it instead of mirroring white.
        var BLUE = 0x2a78ff;                                     // the light's colour: three strips of it stand in the room (ONE BLUE: #2a78ff)
        var pmrem = new THREE.PMREMGenerator(renderer);
        var room = new THREE.Scene();
        room.add(new THREE.Mesh(new THREE.SphereGeometry(40, 32, 16), new THREE.MeshBasicMaterial({ color: 0x1c1f26, side: THREE.BackSide })));   // 07 (21: 0x16181d)
        var box = function (x, y, z, w, h, d, k, col, roll) {
          var m = new THREE.MeshBasicMaterial({ color: col === undefined ? 0xffffff : col }); m.color.multiplyScalar(k);
          var b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.lookAt(0, 0, 0); b.rotateZ(roll || 0); room.add(b);
        };
        // soft walls all round, so a face holds a dark grey at every angle instead of dropping to black
        box(0, 3, 30, 60, 34, .4, .42); box(0, 24, 0, 60, 60, .4, .6); box(0, -18, 0, 60, 60, .4, .5);    // 07: floor .5 (21: .22)
        // tall soft bands round the sides and back, with dark between them
        [40, 68, 96, 124, 152, 180, 208, 236, 264, 292, 320].forEach(function (deg, n) { var a = deg * Math.PI / 180; box(28 * Math.sin(a), 3, 28 * Math.cos(a), 6.5, 30, .4, n % 2 ? .95 : 1.9); });
        box(0, 16, 5, 16, 12, .4, 4.5);               // top key
        // thin, very bright strips: these are what show up as sharp lines in the glass and in the polished edge
        box(-14, 3, 7, .9, 18, .9, 15); box(14, 5, 3, .7, 16, .7, 12); box(-18, 2, -12, .8, 20, .4, 12); box(18, 3, -12, .8, 20, .4, 10);
        box(-4, 4, 24, 2.0, 34, .4, 7, 0xffffff, .55);    // slanted blade in front: the highlight that travels over a flat face
        box(8, -2, 24, .9, 34, .4, 5, 0xffffff, .55);
        box(0, -9, 22, 34, 4, .4, 2.2);                 // low front card: lifts the faces of the word
        box(-10, -3, -14, 1.3, 18, .4, 14, BLUE);     // coloured strips: the light's colour lands in the glass and the edges
        box(16, -6, 11, 1.5, 14, .4, 12, BLUE);
        box(-15, 9, 14, 1.2, 10, .4, 9, BLUE);
        // 07: a tall ring of light all the way round the camera, 70 degrees off its line of sight. Whichever way a bevel faces,
        // it finds part of the ring, so the whole outline of the P and the word carries a line of light. The flat faces still
        // see only the dim wall behind the camera, so the glass stays black.
        (function () {
          var th = 70 * Math.PI / 180, R = 25;
          for (var k = 0; k < 20; k++) { var ph = k / 20 * Math.PI * 2;
            box(R * Math.sin(th) * Math.cos(ph), R * Math.sin(th) * Math.sin(ph), R * Math.cos(th), 7.6, 15, .4, k % 2 ? 10 : 13, 0xffffff, ph + Math.PI / 2); }
        })();
        box(-21, 2, -19, 1.8, 28, .4, 26); box(21, 2, -19, 1.8, 28, .4, 26);   // behind: the thick edge lights up as it turns
        box(0, 2, -26, 2.2, 30, .4, 18);                                          // straight behind: the edge reads when side-on
        box(0, -14, 16, 28, 2.2, .4, 10, BLUE);                                  // the light's blue from below, into the lower bevels
        var envRT = pmrem.fromScene(room, 0.012); pmrem.dispose();
        // how the room's light travels over the logo (src.html: .2 + sin(T * .42) * 1.05 radians; held at .35 when nothing moves)
        var ENVBASE = -0.62, ENVSWING = 0.4, ENVRATE = 0.42, ENVSTILL = -0.5;   // 07 on the store (21: .2, 1.05, .42, .35): keeps the rim ring off the flat faces
        await tick();

        // the two materials of number 21 and its light, copied from src.html (M.glass, M.gunEdge, LIGHT.blue)
        var phys = function (o) { return new THREE.MeshPhysicalMaterial(Object.assign({ metalness: 1 }, o)); };
        // see-through black glass: the black mirror, let through a little, drawn from both sides so thick parts read darker
        var glass = new THREE.MeshPhysicalMaterial({ color: 0x020203, metalness: 0, roughness: .05, ior: 1.5, specularIntensity: .55, clearcoat: .5, clearcoatRoughness: .03, transparent: true, opacity: .76, side: THREE.DoubleSide });
        var gunEdge = phys({ color: 0x8a929d, roughness: .08 });            // polished gunmetal: the edge of the word
        var glow = function (c, k) { var m = new THREE.MeshBasicMaterial({ color: c, toneMapped: false }); m.color.multiplyScalar(k); return m; };
        // the blue light: the rod, its hot core, the soft glow in the cut behind it, and the colour of its halo
        // ONE BLUE (owner, Nov 13 2026): the cut's glow and the halo are the light's own #2a78ff (the core keeps its #cfe6ff)
        var LIGHT = { rod: glow(0x2a78ff, 1.35), core: glow(0xcfe6ff, 1.0), slot: glow(0x2a78ff, .13), rgb: '42,120,255' };

        var toShapes = function (list, ox, oy, fx) {
          return list.map(function (p) {
            var v = function (pt) { var q = fx ? fx(pt) : pt; return new THREE.Vector2(q[0] - ox, oy - q[1]); };
            var o = p.o.map(v); if (THREE.ShapeUtils.isClockWise(o)) { o = o.reverse(); }
            var s = new THREE.Shape(o);
            (p.h || []).forEach(function (h) { var hh = h.map(v); if (!THREE.ShapeUtils.isClockWise(hh)) { hh = hh.reverse(); } s.holes.push(new THREE.Path(hh)); });
            return s;
          });
        };
        var extrude = function (list, depth, bevel, z, ox, oy, fx) {
          if (z === undefined) { z = 0; } if (ox === undefined) { ox = 50; } if (oy === undefined) { oy = 50; }
          var g = new THREE.ExtrudeGeometry(toShapes(list, ox, oy, fx || null), { depth: depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.7,
            bevelOffset: -bevel * 0.35, bevelSegments: MOBILE ? 3 : 6, curveSegments: 10, steps: 1 });
          g = toCreasedNormals(g, Math.PI / 4.5); g.translate(0, 0, -depth / 2 + z); return g;
        };
        // every number from here to SIZE is src.html's own
        var YB = D.p.yb, yb = 50 - YB;                           // the light sits at y = 51
        var PL = 12.573, PR = 82.759;                            // where the light leaves the glass, left and right, at the waist
        var OV = 22, XL = PL - OV, XR = PR + OV;                 // the same overhang past the P on both sides
        // the light: the lens shape made thin and long, centred on the P's waist
        var rodFx = function (k) { return function (pt) { return [XL + pt[0] / 100 * (XR - XL), YB + (pt[1] - YB) * k]; }; };
        // the gap between the two halves of the P, as one shape, so the cut can glow softly behind the thin light
        var topRun = D.p.top[0].o.filter(function (p) { return p[1] >= 47.2 && p[1] <= 49.3; }).sort(function (a, b) { return a[0] - b[0]; });
        var botRun = D.p.bot[0].o.filter(function (p) { return p[1] >= 52.7 && p[1] <= 54.75 && p[0] <= 79.4; }).sort(function (a, b) { return b[0] - a[0]; });
        var SLOT = [{ o: topRun.concat(botRun), h: [] }];
        var PD = 9, PB = 1.0, PF = PD / 2 + PB;                  // P depth, bevel, and where the front face sits (5.5)
        var WD = 14, WB = 1.3;                                   // the word is cut deeper so it stands off the page
        var G = { face: extrude(D.p.face, PD, PB), slot: extrude(SLOT, .6, .05, 0),
          rod: extrude(D.p.beam, 1.5, .2, 0, 50, 50, rodFx(.45)), rodCore: extrude(D.p.beam, 1.9, .1, 0, 50, 50, rodFx(.16)) };
        await tick();
        G.word = extrude(D.word, WD, WB, 0, 0, 0);
        await tick();
        // 07: a gunmetal band between the letter's outline and the rim outline, set in the middle of the P's thick edge
        G.ring = extrude(D.p.face.map(function (f, i) { return { o: D.p.rim[i].o, h: [f.o].concat(f.h || []) }; }), 1.2, .1, 0);
        // 07: thin lines on every outline, front and back, a third of the way into the bevel (z = depth/2 + bevel * cos 30)
        var outlineSegs = function (list, ox, oy, zs) {
          var a = [];
          zs.forEach(function (z) { list.forEach(function (p) { [p.o].concat(p.h || []).forEach(function (ring) {
            for (var k = 0; k < ring.length; k++) { var p0 = ring[k], p1 = ring[(k + 1) % ring.length]; a.push(p0[0] - ox, oy - p0[1], z, p1[0] - ox, oy - p1[1], z); }
          }); }); });
          var g = new LineSegmentsGeometry(); g.setPositions(a); return g;
        };
        var zP = PD / 2 + PB * .866 + .06, zW = WD / 2 + WB * .866 + .06;
        var LG = { p: outlineSegs(D.p.face, 50, 50, [zP, -zP]), w: outlineSegs(D.word, 0, 0, [zW, -zW]) };
        var LM = {
          p: new LineMaterial({ color: 0xc3ccd9, linewidth: 1.6 }), w: new LineMaterial({ color: 0xc3ccd9, linewidth: 1.3 }),
          pG: new LineMaterial({ color: 0xffffff, linewidth: 2.4, dashed: true, dashSize: 34, gapSize: 300 }),
          wG: new LineMaterial({ color: 0xffffff, linewidth: 2.0, dashed: true, dashSize: 220, gapSize: 2400 })
        };
        var lineObj = function (geo, m) { var l = new LineSegments2(geo, m); l.computeLineDistances(); return l; };
        await tick();
        // read-only measurements (scene units) for slots that ask to be framed by size through the opt-in view below
        G.face.computeBoundingBox(); G.word.computeBoundingBox();
        var SIZE = { markW: (G.face.boundingBox.max.x - G.face.boundingBox.min.x) * 0.1, markH: (G.face.boundingBox.max.y - G.face.boundingBox.min.y) * 0.1,
          wordW: (G.word.boundingBox.max.x - G.word.boundingBox.min.x) * 0.0135, beamY: yb * 0.1 };

        // the soft glow along the light: a band, brightest on its centre line, fading out toward both ends (src.html halo)
        function halo(rgb, w, h, peak) {
          var c = document.createElement('canvas'); c.width = 256; c.height = 64; var x = c.getContext('2d');
          var g = x.createLinearGradient(0, 0, 0, 64), a = function (v) { return 'rgba(' + rgb + ',' + (v * peak) + ')'; };
          g.addColorStop(0, a(0)); g.addColorStop(.3, a(.04)); g.addColorStop(.43, a(.4)); g.addColorStop(.5, a(1)); g.addColorStop(.57, a(.4)); g.addColorStop(.7, a(.04)); g.addColorStop(1, a(0));
          x.fillStyle = g; x.fillRect(0, 0, 256, 64);
          x.globalCompositeOperation = 'destination-in'; var m = x.createLinearGradient(0, 0, 256, 0); m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(.14, 'rgba(0,0,0,1)'); m.addColorStop(.86, 'rgba(0,0,0,1)'); m.addColorStop(1, 'rgba(0,0,0,0)');
          x.fillStyle = m; x.fillRect(0, 0, 256, 64);
          var tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
          return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
        }
        // the P: one solid body of smoked glass, face and edge, with the thin blue light through its waist (src.html buildP, entry 21).
        // The room is its only light: number 21 has no lamps of its own.
        function buildMark() {
          var g = new THREE.Group();
          g.add(new THREE.Mesh(G.face, [glass, glass]));
          g.add(new THREE.Mesh(G.ring, [gunEdge, gunEdge]));                 // 07: the gunmetal band in the thick edge
          g.add(lineObj(LG.p, LM.p), lineObj(LG.p, LM.pG));                  // 07: chrome lines and their glint
          g.add(new THREE.Mesh(G.slot, LIGHT.slot));
          g.add(new THREE.Mesh(G.rod, LIGHT.rod)); g.add(new THREE.Mesh(G.rodCore, LIGHT.core));
          var cx = (XL + XR) / 2 - 50, cy = 50 - YB, len = (XR - XL) * 1.02;
          var h1 = halo(LIGHT.rgb, len, 10, .5); h1.position.set(cx, cy, PF + .5); g.add(h1);
          var h2 = halo(LIGHT.rgb, len, 10, .5); h2.position.set(cx, cy, -(PF + .5)); g.add(h2);
          return g;
        }
        // the word: smoked glass on the front and back, polished gunmetal on the thick edge (src.html buildWord, entry 21).
        // withLight (the hero word, kind 'word'; never the bottle labels): LOGO 21's own light set below the word, as in the logo
        // worker's final build (FIXES.md "Logo 21"): the P's light, centred, about 81% as wide as the word and 0.44 x the letter
        // height below the letters. It shows only where it clears what the slot's data-accent-clear names (accentRoom below).
        function buildWord(withLight) {
          var g = new THREE.Group();
          g.add(new THREE.Mesh(G.word, [glass, gunEdge]));
          if (withLight) {
            var accent = new THREE.Group(), inner = new THREE.Group();
            var cx = (XL + XR) / 2 - 50, cy = 50 - YB, len = (XR - XL) * 1.02;
            accent.scale.setScalar(6); accent.position.set(0, -(50 + 0.55 / 0.0125), 0);
            inner.position.set(-cx, -cy, 0);
            inner.add(new THREE.Mesh(G.rod, LIGHT.rod)); inner.add(new THREE.Mesh(G.rodCore, LIGHT.core));
            var h1 = halo(LIGHT.rgb, len, 10, .5); h1.position.set(cx, cy, 1.2); inner.add(h1);
            var h2 = halo(LIGHT.rgb, len, 10, .5); h2.position.set(cx, cy, -1.2); inner.add(h2);
            accent.add(inner); g.add(accent); g.userData.accent = inner;
          }
          g.add(lineObj(LG.w, LM.w), lineObj(LG.w, LM.wG));                  // 07: chrome lines and their glint
          return g;
        }
        // The light below the word is drawn only where the page leaves room for it. On a wide screen the hero's join card starts
        // closer than the light's place, so there it is left out rather than drawn across the card (the logo worker measured
        // 388 px against the card row's 333 px at 1440x900); on a phone it clears and is drawn.
        var A21 = null;
        function accentRoom(s, r) {
          var inner = s.group.userData.accent;
          if (!inner) { return; }
          var acc = inner.parent, sel = s.el.getAttribute('data-accent-clear'), below = sel ? document.querySelector(sel) : null;
          if (!below) { acc.visible = true; return; }
          if (!A21) { A21 = new THREE.Vector3(); }
          s.group.updateMatrixWorld(true); s.camera.updateMatrixWorld();
          A21.set((XL + XR) / 2 - 50, 50 - YB - 2.5, 0); inner.localToWorld(A21); A21.project(s.camera);   // the rod and its bright halo core
          acc.visible = r.top + (-A21.y * 0.5 + 0.5) * r.height <= below.getBoundingClientRect().top - 4;
        }

        var pointer = { x: 0, y: 0 };
        window.addEventListener('pointermove', function (e) {
          if (REDUCED) { return; }                        // reduced motion: nothing follows the pointer
          pointer.x = e.clientX / window.innerWidth * 2 - 1; pointer.y = e.clientY / window.innerHeight * 2 - 1; kick();
        }, { passive: true });
        canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); off('WebGL context lost'); });
        var damp = function (c, t, l, dt) { return c + (t - c) * (1 - Math.exp(-l * dt)); };
        var FLAT = 3 * Math.PI / 180;        // label words use a 6 degree lens so they sit flat on the label
        var WORD_REST = new THREE.Euler(-0.04, -0.12, 0);      // the word's resting pose, as set in the frame loop below (read by the opt-in view only)

        var slots = [];
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (e) { for (var i = 0; i < slots.length; i++) { if (slots[i].el === e.target) { slots[i].visible = e.isIntersecting; } } });
          kick();
        }, { rootMargin: '80px' });

        function add(req) {
          for (var i = 0; i < slots.length; i++) { if (slots[i].el === req.el) { return; } }
          var kind = req.kind === 'word' || req.kind === 'wordv' || req.kind === 'labelmark' ? req.kind : 'mark';
          var isWord = kind === 'word' || kind === 'wordv';
          var scene = new THREE.Scene(); scene.environment = envRT.texture;
          var group = isWord ? buildWord(kind === 'word') : buildMark();
          group.scale.setScalar(isWord ? 0.0135 : 0.1); scene.add(group);
          if (kind === 'wordv') { group.rotation.z = Math.PI / 2; }      // reads bottom to top, as on the approved label
          if (kind === 'mark' || kind === 'word') {
            req.el.classList.add('pep-logo3d-back', kind === 'mark' ? 'pep-logo3d-back-mark' : 'pep-logo3d-back-word');
            if (window.getComputedStyle(req.el).position === 'static') { req.el.classList.add('pep-logo3d-back-pos'); }
          }
          var camera = new THREE.PerspectiveCamera(kind === 'wordv' ? 6 : 30, 1, 0.1, 400);
          camera.position.set(0, 0, kind === 'word' ? 14 : 25);
          var s = { el: req.el, kind: kind, scene: scene, camera: camera, group: group, visible: false, hold: !!req.hold,
            ry: 0, rx: 0, spin: 0, spinT: 0, hover: false, phase: Number(req.phase || 0) };
          // OPT-IN VIEW (kinds 'mark' and 'word' only). A slot that sends no `view` is drawn exactly as before.
          // A view changes how the logo is SEEN, never the logo: the lens, where the camera stands, how far the logo answers
          // the pointer, and the light that moves across the metal. Geometry, materials, colours and the spin are untouched.
          //   mark: { lens, fill, fillW, level, pointer: [x, y], light, hit, track }    word: { dist, span, low, square, pointer: [x, y], look: [x, y], light }
          var view = (kind === 'mark' || kind === 'word') && req.view && typeof req.view === 'object' ? req.view : null;
          if (view) {
            var num = function (x, d, lo, hi) { x = Number(x); return isFinite(x) ? Math.min(hi, Math.max(lo, x)) : d; };
            var pg = Array.isArray(view.pointer) ? view.pointer : [view.pointer, view.pointer];
            var lk = Array.isArray(view.look) ? view.look : [0, 0];
            s.view = { lens: num(view.lens, 30, 20, 60), fill: num(view.fill, 0.61, 0.2, 0.9), fillW: num(view.fillW, 0.9, 0.2, 0.95),
              dist: num(view.dist, 9, 4, 30), span: num(view.span, 0.62, 0.3, 0.98), low: num(view.low, 0, 0, 0.9),
              px: num(pg[0], 1, 0, 3), py: num(pg[1], 1, 0, 3), lx: num(lk[0], 0, 0, 0.8), ly: num(lk[1], 0, 0, 0.4), light: num(view.light, kind === 'word' ? 1 : 0, 0, 2),
              square: !!view.square, level: !!view.level, track: typeof view.track === 'function' ? view.track : null, ty: 1e9, tu: -1, cx: 0, cy: 0 };
            if (kind === 'mark') { camera.fov = s.view.lens; }
          }
          // OPT-IN STILL (proof pictures and captures only). A slot that sends no `pose` moves exactly as before.
          //   pose: { yaw, pitch, env, lens, cam: [x, y, z], aim: [x, y, z] }    angles in radians, places in scene units
          // The logo stands still at that angle with the room's light held at `env`; `cam` and `aim` stand the camera by hand.
          // Like a view, a pose changes how the logo is SEEN, never the logo.
          if (req.pose && typeof req.pose === 'object') {
            var pn = function (x, d) { x = Number(x); return isFinite(x) ? x : d; }, p3 = function (a) { return Array.isArray(a) && a.length === 3 ? a.map(function (x) { return pn(x, 0); }) : null; };
            s.pose = { yaw: pn(req.pose.yaw, 0), pitch: pn(req.pose.pitch, 0), env: pn(req.pose.env, ENVSTILL), lens: pn(req.pose.lens, 30), cam: p3(req.pose.cam), aim: p3(req.pose.aim) || [0, 0, 0] };
          }
          // OPT-IN EDGE LIGHT (kind 'mark' only). A slot that sends no `edge` is drawn exactly as before. With `edge: true`
          // (the header P: the owner's pick of Nov 12 2026, sample 5, "ICE-BLUE EDGE LIGHT") the slot is drawn first in every
          // frame, its pixels are lifted onto a small canvas of its own (liftEdge, below) and logo3d.css outlines that canvas:
          // a thin ice-white line and a soft blue glow round the outside of the P. Like a view, it changes how the logo is
          // SEEN, never the logo: the pixels are the engine's own, copied 1:1, and nothing else on the big canvas is outlined.
          if (kind === 'mark' && req.edge) {
            s.edge = document.createElement('canvas'); s.edge.className = 'pep-logo3d-edge'; s.edge.setAttribute('aria-hidden', 'true');
            s.edgeCx = s.edge.getContext('2d'); s.edgeOn = false; s.edgeFrame = -1; root.appendChild(s.edge);
          }
          if (kind === 'mark' && req.interactive) {
            var stage = view && view.hit && view.hit.addEventListener ? view.hit : req.el;
            stage.addEventListener('pointerenter', function (e) { s.hover = true; if (e.pointerType !== 'touch') { s.spinT += Math.PI * 2; } kick(); });
            stage.addEventListener('pointerleave', function () { s.hover = false; kick(); });
            stage.addEventListener('click', function () { s.spinT += Math.PI * 2; kick(); });
            stage.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); s.spinT += Math.PI * 2; kick(); } });
          }
          // compile this slot's shaders without blocking the page (parallel compile where the browser has it)
          s.ready = false;
          var done = function () { s.ready = true; kick(); };
          if (renderer.compileAsync) { renderer.compileAsync(scene, camera).then(done, done); } else { done(); }
          // edge slots draw first in each frame, so what is lifted off the big canvas is their own P and nothing else
          if (s.edge) { slots.unshift(s); } else { slots.push(s); }
          io.observe(req.el); kick();
        }

        var raf = 0, last = performance.now(), t = 0, rw = 0, rh = 0, shown = false, lastDraw = 0, fno = 0, EDGEVP = new THREE.Vector4();
        function frame(now) {
          raf = 0;
          // phones: 30 frames a second is plenty for a slow turn and halves the work (motion is time-based, so the speed is unchanged)
          if (MOBILE && !REDUCED && shown && now - lastDraw < 30) { raf = requestAnimationFrame(frame); return; }
          lastDraw = now;
          var dt = Math.min(Math.max((now - last) / 1000, 0), 1 / 15); last = Math.max(last, now); if (!REDUCED) { t += dt; }
          if (dead) { return; }
          fno++;                                 // counts drawn frames (the edge light uses it to know what was drawn this time)
          // keep the canvas over the viewport; the slot rects below are measured in the same frame
          root.style.transform = 'translate3d(0,' + (window.scrollY || window.pageYOffset || 0) + 'px,0)';
          var W = canvas.clientWidth, H = canvas.clientHeight;
          if (W !== rw || H !== rh) {
            rw = W; rh = H;
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MOBILE ? 1.5 : 2));
            renderer.setSize(W, H, false);
          }
          renderer.setScissorTest(false); renderer.clear(); renderer.setScissorTest(true);
          LM.pG.dashOffset = -(t * 70) % 334; LM.wG.dashOffset = -(t * 520) % 2620;      // 07: the glint runs along the lines
          var drew = false;
          for (var i = 0; i < slots.length; i++) {
            var s = slots[i];
            if (!s.visible || !s.ready || (s.hold && !gateOpen)) { continue; }
            var r = s.el.getBoundingClientRect();
            if (r.bottom < 0 || r.top > H || r.right < 0 || r.left > W || r.width < 2 || r.height < 2) { continue; }
            s.camera.aspect = r.width / r.height;
            if (s.kind === 'mark') {
              var mv = s.view || null;                 // opt-in view, or null: then every number below is the locked one
              if (REDUCED) { s.group.rotation.set(-0.06, -0.36, 0); }
              else {
                s.spin = damp(s.spin, s.spinT, 2.6, dt);
                // faces front and sways, then makes one slow full turn every 8 s (a P read from behind is mirrored, so it never parks there)
                var cyc = (t + s.phase * 1.7) % 8, k = Math.min(1, Math.max(0, (cyc - 5.2) / 2.8));
                var turn = Math.floor((t + s.phase * 1.7) / 8) * Math.PI * 2 + (k * k * (3 - 2 * k)) * Math.PI * 2;
                var yaw = -0.32 + Math.sin(t * 0.42 + s.phase) * 0.28 + pointer.x * (mv ? 0.35 * mv.px : 0.35) + s.spin + turn;
                var pitch = Math.sin(t * 0.31 + s.phase) * 0.06 + pointer.y * (mv ? 0.18 * mv.py : 0.18) - 0.05;
                s.ry = damp(s.ry, yaw, 4, dt); s.rx = damp(s.rx, pitch, 4, dt);
                s.group.rotation.set(s.rx, s.ry, 0);
                s.group.position.y = Math.sin(t * 0.9 + s.phase) * 0.1 + (s.hover ? 0.15 : 0);
              }
              // the room's light keeps travelling over the glass even while the P rests (number 21's own travel). An opt-in
              // view may say how far it travels (`light`, radians); none, or 0, is the logo's own.
              s.scene.environmentRotation.set(0, REDUCED ? ENVSTILL : ENVBASE + Math.sin(t * ENVRATE + s.phase) * (mv && mv.light ? mv.light : ENVSWING), 0);
              if (mv) {
                // the camera stands level with the beam, so the beam lies on the lens's own horizon; it stands as near as the
                // asked size needs: the P fills `fill` of the slot's height, and never more than `fillW` of its width
                var mh = Math.tan(mv.lens * Math.PI / 360);
                var mz = Math.max(9, Math.max(SIZE.markH / mv.fill, SIZE.markW / mv.fillW / s.camera.aspect) / (2 * mh));
                // `level`: the P nods a few degrees as it sways (unchanged). The camera nods with it, about the beam, so on
                // screen the beam stays dead level and the P's uprights stay upright; the room's light still shows the nod.
                var mn = mv.level ? s.group.rotation.x : 0;
                s.camera.position.set(0, SIZE.beamY * Math.cos(mn) - Math.sin(mn) * mz, SIZE.beamY * Math.sin(mn) + Math.cos(mn) * mz);
                s.camera.rotation.set(mn, 0, 0);
                if (mv.track) {
                  // tells the slot's own module where the beam is on screen (px above or below the slot's middle line) and how
                  // big the P is drawn (px per scene unit), so that module can lay its own page lines on the beam and under the foot
                  var mu = r.height / (2 * mz * mh);
                  var my = -(mv.level ? s.group.position.y * Math.cos(mn) : s.group.position.y + SIZE.beamY * Math.cos(s.group.rotation.x) - SIZE.beamY) * mu;
                  if (Math.abs(my - mv.ty) > 0.2 || Math.abs(mu - mv.tu) > 0.01) {
                    mv.ty = my; mv.tu = mu;
                    try { mv.track({ dy: my, unit: mu, markW: SIZE.markW, markH: SIZE.markH }); } catch (err) {}
                  }
                }
              }
            } else if (s.kind === 'labelmark') {
              // printed on the label: dead straight, faces front; only the light moves across the metal
              s.group.rotation.set(0, 0, 0);
              s.scene.environmentRotation.set(0, REDUCED ? ENVSTILL : ENVBASE + Math.sin(t * ENVRATE + s.phase) * ENVSWING, 0);
            } else if (s.kind === 'word' && s.view) {
              // opt-in view of the word. It still stays still: only the light moves across it (and, if `pointer` is not 0, it
              // leans a breath to the pointer exactly as below, by that share of the locked amount)
              var wv = s.view;
              s.group.rotation.set(-0.04 + pointer.y * 0.04 * wv.py, -0.12 + pointer.x * 0.08 * wv.px, 0);
              s.scene.environmentRotation.set(0, REDUCED ? ENVSTILL : ENVBASE + Math.sin(t * ENVRATE + s.phase) * ENVSWING * wv.light, 0);
              // the camera stands `dist` away and the lens opens until the word spans `span` of the slot's width. `low` (radians)
              // puts the camera below the word WITHOUT tipping it back: the lens is shifted instead, as for a tall building, so
              // every letter face keeps its drawn shape and stays upright while its underside and depth come into view
              var wh = SIZE.wordW / wv.span / s.camera.aspect / 2;            // half the height the lens sees at the word
              s.camera.fov = Math.min(80, Math.max(8, Math.atan(wh / wv.dist) * 360 / Math.PI));
              // `look`: the camera (never the word) answers the pointer. It steps to the side and up or down by that many
              // radians, with the lens shifted to match, so the faces of the letters do not move, lean or change size at all:
              // only the depth behind them swings into view, as it does when you walk past a sign.
              wv.cx = damp(wv.cx, pointer.x, 5, dt); wv.cy = damp(wv.cy, pointer.y, 5, dt);       // the camera glides, it never jumps
              var wside = Math.tan(wv.cx * wv.lx) * wv.dist;
              var wdrop = Math.tan(wv.low + wv.cy * wv.ly) * wv.dist;
              s.camera.position.set(wside, -wdrop, wv.dist);
              // `square`: the camera stands on the word's own axis (the word rests a few degrees off the page's axis), so the
              // word is seen dead level and even from end to end
              if (wv.square) { s.camera.position.applyEuler(WORD_REST); s.camera.quaternion.setFromEuler(WORD_REST); }
              s.camera.setViewOffset(s.camera.aspect, 1, -wside / (2 * wh), -wdrop / (2 * wh), s.camera.aspect, 1);
            } else if (s.kind === 'word') {
              // the word stays still: only the light moves across it
              s.group.rotation.set(-0.04 + pointer.y * 0.04, -0.12 + pointer.x * 0.08, 0);
              s.scene.environmentRotation.set(0, REDUCED ? ENVSTILL : ENVBASE + Math.sin(t * ENVRATE + s.phase) * ENVSWING, 0);
              var fitW = 15.4 / s.camera.aspect;
              s.camera.position.z = Math.max(9, fitW / (2 * Math.tan(15 * Math.PI / 180)) * 1.05);
            } else {
              s.scene.environmentRotation.set(0, REDUCED ? ENVSTILL : ENVBASE + Math.sin(t * ENVRATE + s.phase) * ENVSWING, 0);
              s.camera.position.z = (12.0 / 2) / Math.tan(FLAT);
            }
            if (s.pose) {
              // opt-in still: the angle, the room's light and (if given) the camera are the ones asked for
              var ps = s.pose;
              s.group.rotation.set(ps.pitch, ps.yaw, s.kind === 'wordv' ? Math.PI / 2 : 0); s.group.position.y = 0;
              s.scene.environmentRotation.set(0, ps.env, 0);
              if (ps.cam) { s.camera.clearViewOffset(); s.camera.fov = ps.lens; s.camera.position.set(ps.cam[0], ps.cam[1], ps.cam[2]); s.camera.lookAt(ps.aim[0], ps.aim[1], ps.aim[2]); }
            }
            s.camera.updateProjectionMatrix();
            if (s.kind === 'word') { accentRoom(s, r); }
            // 07: line widths in screen pixels (P 1.6, word 1.3, glint 2.4 / 2.0) times the slot width / 420, held between .8 and 1.9
            var lk = Math.min(1.9, Math.max(.8, r.width / 420));
            LM.p.resolution.set(r.width, r.height); LM.w.resolution.set(r.width, r.height); LM.pG.resolution.set(r.width, r.height); LM.wG.resolution.set(r.width, r.height);
            LM.p.linewidth = 1.6 * lk; LM.w.linewidth = 1.3 * lk; LM.pG.linewidth = 2.4 * lk; LM.wG.linewidth = 2.0 * lk;
            var y = H - r.bottom;
            renderer.setViewport(r.left, y, r.width, r.height); renderer.setScissor(r.left, y, r.width, r.height);
            renderer.clearDepth();
            renderer.render(s.scene, s.camera);
            if (s.edge) { liftEdge(s); }
            drew = true;
          }
          // an edge slot that was not drawn this frame (scrolled away, waiting for the entrance, hidden) takes its copy away too
          for (var e = 0; e < slots.length; e++) { var se = slots[e]; if (se.edge && se.edgeOn && se.edgeFrame !== fno) { se.edgeOn = false; se.edge.style.visibility = 'hidden'; } }
          if (drew && !shown) { shown = true; root.setAttribute('data-pep3d-state', 'on'); ctx.emit('logo3d:on'); }
          var anyVisible = false;
          for (var j = 0; j < slots.length; j++) { if (slots[j].visible) { anyVisible = true; } }
          if (!REDUCED && !document.hidden && anyVisible) { raf = requestAnimationFrame(frame); }
        }
        // OPT-IN EDGE LIGHT (see add): the pixels just drawn for this slot, copied 1:1 in device pixels onto its own small
        // canvas (placed exactly where they were), then cleared from the big canvas, so the P shows once, on the small canvas,
        // where logo3d.css outlines it. The copy is made in the same frame as the drawing, before the browser shows it.
        function liftEdge(s) {
          renderer.getCurrentViewport(EDGEVP);
          var pr = renderer.getPixelRatio(), cw = canvas.width, ch = canvas.height;
          var w = EDGEVP.z, h = EDGEVP.w, x0 = EDGEVP.x, y0 = ch - EDGEVP.y - h;
          if (s.edge.width !== w || s.edge.height !== h) { s.edge.width = w; s.edge.height = h; s.edge.style.width = (w / pr) + 'px'; s.edge.style.height = (h / pr) + 'px'; }
          s.edge.style.transform = 'translate(' + (x0 / pr) + 'px,' + (y0 / pr) + 'px)';
          s.edgeCx.clearRect(0, 0, w, h);
          var sx = Math.max(0, x0), sy = Math.max(0, y0), ex = Math.min(cw, x0 + w), ey = Math.min(ch, y0 + h);
          if (ex > sx && ey > sy) { s.edgeCx.drawImage(canvas, sx, sy, ex - sx, ey - sy, sx - x0, sy - y0, ex - sx, ey - sy); }
          renderer.clear();                      // the scissor still holds this slot, so only its pixels leave the big canvas
          s.edgeFrame = fno;
          if (!s.edgeOn) { s.edgeOn = true; s.edge.style.visibility = 'visible'; }
        }
        function kick() { if (!raf) { raf = requestAnimationFrame(frame); } }
        window.addEventListener('scroll', kick, { passive: true });
        window.addEventListener('resize', kick);
        document.addEventListener('visibilitychange', kick);

        engine = { add: add, kick: kick };
        root.setAttribute('data-pep3d-slots', '0');
        pending.splice(0).forEach(add);
        root.setAttribute('data-pep3d-slots', String(slots.length));
        ctx.on('logo3d:slot', function () { root.setAttribute('data-pep3d-slots', String(slots.length)); });
        kick();
      }
    }
  });
})();
</script>