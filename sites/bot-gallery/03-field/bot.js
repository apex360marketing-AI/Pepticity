/* 03 · FIELD: a liquid field of glass metaballs that follow the cursor, scatter when the guide thinks, gather when the list is ready. */
import { THREE, makeStage, accent, damp } from '../shared/gthree.js';
(function () {
  var live = GUI.frame(), el = GUI.el, flow = GBrain.createFlow();
  var stageHost = el('div', { class: 'fd-stage glass' }), tag = el('div', { class: 'fd-tag' });
  stageHost.appendChild(tag);
  var mood = { think: 0, typed: 0, gather: 0, pulse: 0 };
  var chat = GUI.chatPanel(flow, { onThink: function (on) { mood.think = on ? 1 : 0; if (!on) mood.pulse = 1; }, onTyping: function (v) { mood.typed = v; }, onDone: function () { mood.gather = 1; }, onRestart: function () { mood.gather = 0; } });
  var ui = el('div', { class: 'fd-ui' }, [chat.root]);
  var wrap = el('div', { class: 'fd' }, [stageHost, ui]); live.appendChild(wrap); GUI.watchGlass(live);
  var st = makeStage(stageHost, { z: 1, maxDpr: innerWidth < 700 ? 0.45 : 0.55, touch: 'pan-y' });
  st.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  var N = 7, pts = []; for (var i = 0; i < N; i++) pts.push(new THREE.Vector3(0, 0, 0));
  var acc = accent();
  var mat = new THREE.ShaderMaterial({ transparent: true, depthTest: false, uniforms: { uB: { value: pts.map(function (p) { return new THREE.Vector4(); }) }, uR: { value: new THREE.Vector2(1, 1) }, uT: { value: 0 }, uAcc: { value: new THREE.Vector3(acc.r, acc.g, acc.b) }, uMouse: { value: new THREE.Vector2(0.5, 0.5) } },
    vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader: `precision highp float; varying vec2 vUv; uniform vec4 uB[${N}]; uniform vec2 uR; uniform float uT; uniform vec3 uAcc; uniform vec2 uMouse;
      float smin(float a,float b,float k){float h=max(k-abs(a-b),0.)/k;return min(a,b)-h*h*k*.25;}
      float map(vec3 p){float d=1e5;for(int i=0;i<${N};i++){vec4 b=uB[i];d=smin(d,length(p-b.xyz)-b.w,.4);}return d;}
      vec3 nrm(vec3 p){vec2 e=vec2(.004,0.);return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));}
      vec3 env(vec3 r){float u=r.y*.5+.5;vec3 c=mix(vec3(.06),vec3(.78),pow(u,1.6));c+=vec3(.9)*pow(max(dot(r,normalize(vec3(.5,.8,.6))),0.),24.);c+=vec3(.5)*pow(max(dot(r,normalize(vec3(-.7,.2,.4))),0.),40.);return c;}
      void main(){vec2 uv=(vUv-.5)*vec2(uR.x/uR.y,1.)*4.;vec3 ro=vec3(uv,-4.),rd=vec3(0.,0.,1.);float t=0.;bool hit=false;for(int i=0;i<44;i++){float d=map(ro+rd*t);if(d<.003){hit=true;break;}t+=d;if(t>8.)break;}
        if(!hit){gl_FragColor=vec4(0.);return;}
        vec3 p=ro+rd*t,n=nrm(p);vec3 r=reflect(rd,n);float f=pow(1.-max(dot(-rd,n),0.),3.);
        vec3 col=env(r)*(.55+.45*f);col+=uAcc*pow(f,7.)*.35;float a=clamp(.30+f*.9+pow(max(dot(r,normalize(vec3(.5,.8,.6))),0.),24.),0.,1.);
        gl_FragColor=vec4(col,a);}`
  });
  var quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat); quad.frustumCulled = false; st.scene.add(quad);
  st.onresize = function (w, h) { mat.uniforms.uR.value.set(w, h); };
  mat.uniforms.uR.value.set(st.w, st.h);
  var seed = pts.map(function (_, i) { return { a: Math.random() * 6.28, s: 0.25 + Math.random() * 0.4, r: 0.9 + Math.random() * 1.2, ph: Math.random() * 6.28, rad: 0.28 + Math.random() * 0.26 }; });
  var cur = pts.map(function () { return new THREE.Vector3(); });
  st.loop(function (dt, t) {
    mood.pulse = damp(mood.pulse, 0, 3, dt);
    var r = stageHost.getBoundingClientRect(), p = GUI.pointer, ar = r.width / r.height;
    var mx = GUI.clamp(((p.x - r.left) / r.width - 0.5) * 4 * ar, -2 * ar, 2 * ar), my = GUI.clamp(-((p.y - r.top) / r.height - 0.5) * 4, -2, 2);
    var cx = ar > 1.4 ? -ar * 0.9 : 0;   // keep the cluster left of the chat on wide screens
    mood.typed = mood.typed * 0.985;
    for (var i = 0; i < N; i++) {
      var s = seed[i], k = GUI.reduced ? 0 : t;
      var orbit = new THREE.Vector3(cx + Math.cos(k * s.s + s.a) * (s.r + mood.think * 1.4 + mood.typed * 0.4) * 1.3, Math.sin(k * s.s * 1.3 + s.ph) * (s.r + mood.think * 0.9), 0);
      var follow = new THREE.Vector3(mx, my, 0).add(new THREE.Vector3(Math.cos(k * 0.8 + s.a), Math.sin(k * 0.8 + s.ph), 0).multiplyScalar(0.32 + i * 0.07));
      var gather = new THREE.Vector3(cx + Math.cos(s.a) * 0.28 * (i / N), Math.sin(s.ph) * 0.28 * (i / N), 0);
      var tgt = orbit.lerp(follow, GUI.touch || GUI.reduced ? 0 : 0.45 * (1 - mood.think) * (1 - mood.gather)).lerp(gather, mood.gather);
      cur[i].lerp(tgt, 1 - Math.exp(-(1.4 + i * 0.12) * dt));
      mat.uniforms.uB.value[i].set(cur[i].x, cur[i].y, 0, s.rad * (1 + mood.pulse * 0.25 + mood.gather * 0.12));
    }
    tag.innerHTML = ''; tag.append(mood.think ? 'Thinking ' : mood.typed > 0.05 ? 'Listening ' : mood.gather ? 'Ready ' : 'Move your cursor ', el('b', { text: '●' }));
  });
  chat.start();
})();
