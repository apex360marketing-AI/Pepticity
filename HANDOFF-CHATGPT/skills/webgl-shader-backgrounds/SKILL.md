---
name: webgl-shader-backgrounds
description: Add a full-screen animated WebGL shader background (noise gradients, liquid/fluid flow, particle fields, pointer-reactive glow or displacement) to an APEX page. Use when a hero or whole page needs an "alive" background that glass cards sit on top of, or when asked for WebGL, shaders, three.js, OGL, fluid, particles or distortion effects.
---

# WebGL shader backgrounds

A shader background is the single biggest "how did they do that" upgrade for a dark glass site: the glass panes blur and refract something genuinely moving. Use one per page, never stacked.

## Rules
- Palette comes from the page tokens. Never gold, yellow, amber or lime. Pass colours as `vec3` uniforms, not hard-coded literals.
- Prefer the **zero-dependency raw WebGL** plane below (about 60 lines). Reach for three.js only when you need 3D geometry, instanced particles or post-processing.
- Cap device-pixel-ratio at 1.5–2 and render at 0.5–0.75 resolution on mobile; the blur behind glass hides it.
- Pause when the tab is hidden (`visibilitychange`) and when the canvas is off-screen (IntersectionObserver).
- `prefers-reduced-motion`: render one still frame, no loop.
- No WebGL (or context lost): fall back to a CSS gradient already painted on the canvas's parent. The page must look finished without the shader.
- Canvas: `position:fixed; inset:0; z-index:0; pointer-events:none`. Content sits above at `z-index:1`.

## Zero-dependency template (inline in an Artifact page)
```html
<div class="bg-fallback" aria-hidden="true"><canvas id="fx"></canvas></div>
<style>
.bg-fallback{position:fixed;inset:0;z-index:0;pointer-events:none;
  background:radial-gradient(60% 50% at 70% 20%,#1e3a8a 0%,transparent 70%),radial-gradient(50% 50% at 20% 80%,#4c1d95 0%,transparent 70%),#050816}
#fx{width:100%;height:100%;display:block}
</style>
<script>
(() => {
  const cv = document.getElementById('fx');
  const gl = cv.getContext('webgl', { antialias: false, alpha: true, powerPreference: 'low-power' });
  if (!gl) return;                                  // CSS fallback stays visible
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const fs = `precision mediump float;
  uniform vec2 r; uniform float t; uniform vec2 m;
  uniform vec3 c1; uniform vec3 c2; uniform vec3 c3;
  float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
    return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
  float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.;a*=.5;}return v;}
  void main(){
    vec2 uv=gl_FragCoord.xy/r; vec2 q=uv; q.x*=r.x/r.y;
    float d=distance(uv,m);
    vec2 w=vec2(fbm(q*1.6+t*.05),fbm(q*1.6-t*.04+3.1));
    float f=fbm(q*2.+w*1.8+vec2(t*.03,0.));
    vec3 col=mix(c1,c2,smoothstep(.25,.75,f));
    col=mix(col,c3,smoothstep(.55,.95,w.x)*.6);
    col+=c2*.35*exp(-d*6.);                          // pointer glow
    col*=.55+.45*(1.-uv.y*.6);                       // vignette toward top
    col=mix(c1,col,.55)*.8;                          // keep it dark enough for text over glass
    gl_FragColor=vec4(col,1.);
  }`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(pr, n);
  const hex = h => [1,3,5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  gl.uniform3fv(U('c1'), hex('#050816')); gl.uniform3fv(U('c2'), hex('#3b6bff')); gl.uniform3fv(U('c3'), hex('#22d3ee'));
  const mobile = matchMedia('(max-width: 900px)').matches;
  const scale = Math.min(devicePixelRatio, 1.5) * (mobile ? .5 : .75);
  function size() { cv.width = innerWidth * scale; cv.height = innerHeight * scale; gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U('r'), cv.width, cv.height); }
  size(); addEventListener('resize', size);
  let mx = .5, my = .5, tx = .5, ty = .5;
  addEventListener('pointermove', e => { tx = e.clientX / innerWidth; ty = 1 - e.clientY / innerHeight; }, { passive: true });
  let raf = 0, t0 = performance.now();
  function frame(now) {
    mx += (tx - mx) * .06; my += (ty - my) * .06;
    gl.uniform1f(U('t'), (now - t0) / 1000); gl.uniform2f(U('m'), mx, my);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (!reduce) raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', () => { cancelAnimationFrame(raf); if (!document.hidden && !reduce) raf = requestAnimationFrame(frame); });
  cv.addEventListener('webglcontextlost', e => { e.preventDefault(); cancelAnimationFrame(raf); cv.style.display = 'none'; });
})();
</script>
```
Variations by swapping the fragment body: **liquid** (domain-warped fbm, as above), **aurora** (stretch q.y, add sin bands), **grid floor** (perspective `1./uv.y` lines that scroll with `t`), **starfield** (hash-placed points, speed uniform tied to scroll velocity), **scroll reaction** (add `uniform float s;` = scroll progress, use it to shift palette or zoom).

## three.js (when you need geometry or particles)
three ≥ r160 ships ES modules only; load as a module:
```html
<script type="module">
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.min.js';
// Particles: one BufferGeometry with N positions + PointsMaterial (size attenuation),
// or InstancedMesh for 3D shapes. Keep N ≤ 4k desktop, ≤ 1.5k mobile.
</script>
```
OGL (`ogl@1.0.11`, ~25 kB) is a lighter alternative for 2D shader planes and simple particle systems.

## Pitfalls
- Full-res fbm on a 4K screen melts laptops. Always scale the canvas.
- `alpha:true` plus `mix-blend-mode` on the canvas can turn text muddy. Keep the canvas opaque and put the glow in the shader.
- A bright shader under glass destroys text contrast. Keep luminance low near text, and tune it down rather than thickening the glass.
- iOS Safari: throttle to ~30fps if you see battery heat; check `navigator.hardwareConcurrency <= 4` to drop octaves.

## Verify (Playwright, /opt/pw-browsers/chromium-1194/chrome-linux/chrome)
- Launch with `args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']` so headless has WebGL.
- No `pageerror` and no shader compile errors in the console.
- Canvas pixels change over 2s: sample `canvas.toDataURL()` twice (or read 1 px via `gl.readPixels` with `preserveDrawingBuffer:true` in test builds) and compare.
- Pointer moves shift the glow (screenshot before/after `mouse.move`).
- With `reducedMotion:'reduce'` in the context options, the canvas renders once and stays still.
- Force the fallback (`HTMLCanvasElement.prototype.getContext = () => null` via `addInitScript`): the page still looks complete.
- Text over the background meets 4.5:1 contrast in screenshots.
