/* COPY of brand/ui/smoke-bg.js (BG-P01) with a marked play()/pause() handle. Rebuilt by _build/build_assets.py. */
/* PEPTICITY · BG-P01 · SILVER SMOKE
   Moving black-and-silver smoke ground in two modes: 'black' (matte + UV black, silver smoke)
   and 'white' (crisp cool white, soft platinum smoke). Adapted from the liquid-chrome ground in
   the APEX Arsenal artifact (raw WebGL at low resolution, pointer ripples it).
   Usage: const bg = PCSmoke(canvasEl, {mode:'black'}); bg.setMode('white');
   No chartreuse spark, no warm tones: every output colour is neutral or slightly cool. */
(function () {
  const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FS = `precision highp float;
  uniform vec2 r;uniform float t;uniform vec2 m;uniform float rip;uniform float mode;
  float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}
  float fbm(vec2 p){float v=0.,a=.5;mat2 R=mat2(.8,.6,-.6,.8);for(int i=0;i<4;i++){v+=a*n2(p);p=R*p*2.03;a*=.5;}return v;}
  float H(vec2 p){
    vec2 q=p*.9;
    vec2 w=vec2(fbm(q+vec2(0.,t*.040)),fbm(q+vec2(5.2,-t*.034)));
    float h=fbm(q*1.3+w*1.9+vec2(t*.022,0.));
    float d=length(p-m);
    h+=.05*sin(d*30.-t*3.)*exp(-d*3.4)*rip;
    h+=.18*exp(-d*d*7.)*rip;
    return h;
  }
  float env(vec3 R){
    float sky=.10*smoothstep(-.4,1.,R.y);
    float band=1.0*exp(-pow((R.y-.30)*7.,2.));
    float band2=.55*exp(-pow((R.y+.12)*10.,2.));
    float v1=.62*exp(-pow((R.x+.62)*10.,2.));
    float v2=.45*exp(-pow((R.x-.55)*13.,2.));
    return .012+sky+band+band2+v1+v2;
  }
  void main(){
    vec2 uv=gl_FragCoord.xy/r;vec2 p=(gl_FragCoord.xy-.5*r)/r.y;
    float e=1.6/r.y;float h=H(p);
    vec3 n=normalize(vec3(-(H(p+vec2(e,0.))-h)/e*.11,-(H(p+vec2(0.,e))-h)/e*.11,1.));
    vec3 R=reflect(vec3(0.,0.,-1.),n);
    float fres=pow(1.-max(n.z,0.),3.);
    float E=env(R);
    float L=E+fres*.35;
    float d=length(p-m);
    L+=.28*exp(-d*d*9.)*(.4+.6*smoothstep(.2,1.,E));
    float spec=pow(max(dot(n,normalize(vec3(.35,.55,1.))),0.),220.);
    vec2 sp=p*1.2+vec2(t*.016,-t*.011);
    float sm=fbm(sp+fbm(sp*1.7+vec2(t*.02))*1.4);
    float wisp=smoothstep(.42,.86,sm);
    float vig=mix(.40,.80,smoothstep(1.3,0.,length(uv-vec2(.5,.46))));
    if(mode<.5){
      vec3 tint=vec3(.86,.885,.92);
      vec3 col=L*tint+vec3(.9)*spec*.45+tint*wisp*.10;
      col*=vig;
      col=1.-exp(-col*1.2);col=pow(col,vec3(1.55))*.66;
      float lum=dot(col,vec3(.3333));
      vec3 base=vec3(.043,.043,.047);
      vec3 uvb=vec3(.070,.058,.100);
      float uvm=(1.-smoothstep(0.,.16,lum))*smoothstep(.25,.85,sm);
      col=max(col,mix(base,uvb,uvm*.85));
      gl_FragColor=vec4(col,1.);
    }else{
      float k=L*vig;k=1.-exp(-k*1.2);k=pow(k,1.55)*.70;
      float s=clamp(k*.78+wisp*.14,0.,1.);
      vec3 white=vec3(.974,.978,.986);
      vec3 smoke=vec3(.640,.668,.705);
      vec3 col=mix(white,smoke,s);
      col=mix(col,vec3(1.),clamp(spec*.7,0.,1.));
      gl_FragColor=vec4(col,1.);
    }
  }`;

  window.PCSmoke = function (cv, opt) {
    opt = opt || {};
    let mode = opt.mode === 'white' ? 1 : 0;
    const api = { setMode(m) { mode = m === 'white' ? 1 : 0; if (reduce || !running) draw(performance.now()); }, frames: 0 };
    const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
    if (!gl) { cv.classList.add('pc-nogl'); return api; }
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    function sh(type, src) { const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
    let pr;
    try { pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr); }
    catch (err) { console.warn(err); cv.classList.add('pc-nogl'); return api; }
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = n => gl.getUniformLocation(pr, n);
    const mobile = matchMedia('(max-width: 900px)').matches;
    const scale = Math.min(devicePixelRatio || 1, 1.5) * (mobile ? .45 : .6);
    function size() {
      const b = cv.getBoundingClientRect();
      cv.width = Math.max(2, b.width * scale | 0); cv.height = Math.max(2, b.height * scale | 0);
      gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U('r'), cv.width, cv.height);
    }
    let tx = .25, ty = .1, mx = .25, my = .1, rip = 0, lastMove = 0, raf = 0, running = false, visible = true;
    const t0 = performance.now() - (opt.offset || 0) * 1000;
    function draw(now) {
      mx += (tx - mx) * .07; my += (ty - my) * .07;
      const ripT = now - lastMove < 900 ? 1 : 0; rip += (ripT - rip) * .04; api.frames++;
      gl.uniform1f(U('t'), reduce ? 14. : (now - t0) / 1000); gl.uniform2f(U('m'), mx, my);
      gl.uniform1f(U('rip'), .3 + rip * .6); gl.uniform1f(U('mode'), mode);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    function loop(now) { draw(now); raf = requestAnimationFrame(loop); }
    let start = function () { if (running || reduce || !visible || document.hidden) return; running = true; raf = requestAnimationFrame(loop); };
    function stop() { running = false; cancelAnimationFrame(raf); }
    size(); draw(performance.now());
    addEventListener('resize', () => { size(); draw(performance.now()); });
    addEventListener('pointermove', e => {
      const b = cv.getBoundingClientRect(); const a = b.width / Math.max(1, b.height);
      tx = ((e.clientX - b.left) / b.width - .5) * a; ty = .5 - (e.clientY - b.top) / b.height; lastMove = performance.now();
    }, { passive: true });
    document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; visible ? start() : stop(); }).observe(cv);
    cv.addEventListener('webglcontextlost', e => { e.preventDefault(); stop(); cv.classList.add('pc-nogl'); });
    /* MODULE PATCH (selection-studio): the module runtime can hold or release the loop (play/pause from the shell) */
    let held = !!opt.held;
    api.pause = () => { held = true; stop(); };
    api.play = () => { held = false; start(); };
    const _start = start; start = function () { if (!held) _start(); };
    start();
    return api;
  };
})();
