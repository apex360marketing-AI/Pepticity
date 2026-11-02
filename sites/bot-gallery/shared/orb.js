/* PEPTICITY BOT GALLERY · liquid-glass orb material: a lit PMREM-reflecting sphere whose surface is displaced by noise. 
   Used by bots 01 and 02. energy (0..1) = how agitated the surface is (typing / thinking). */
import { THREE, mats, accent } from './gthree.js';
var NOISE = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;} vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);} vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
`;
export function makeOrb(opts) {
  opts = opts || {};
  var mat = new THREE.MeshPhysicalMaterial({ color: opts.glass ? 0xffffff : 0xcfcec7, metalness: opts.glass ? 0 : 0.92, roughness: opts.glass ? 0.04 : 0.17, transmission: opts.glass ? 0.92 : 0, thickness: 0.9, ior: 1.4, envMapIntensity: 2.0, clearcoat: 1, clearcoatRoughness: 0.05 });
  var uni = { uT: { value: 0 }, uE: { value: 0.1 }, uF: { value: opts.freq || 1.3 } };
  mat.onBeforeCompile = function (sh) {
    sh.uniforms.uT = uni.uT; sh.uniforms.uE = uni.uE; sh.uniforms.uF = uni.uF;
    sh.vertexShader = 'uniform float uT;uniform float uE;uniform float uF;\n' + NOISE + sh.vertexShader
      .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
        vec3 pos0 = position; float eps=0.02;
        float d0 = snoise(pos0*uF + vec3(0.0,uT*0.35,uT*0.2))*uE*0.2 + snoise(pos0*uF*2.3 - vec3(uT*0.5))*uE*0.05;
        vec3 tg = normalize(cross(normal, vec3(0.0,1.0,0.0))+vec3(0.0001)); vec3 bt = normalize(cross(normal, tg));
        vec3 pa = pos0 + tg*eps, pb = pos0 + bt*eps;
        float da = snoise(pa*uF + vec3(0.0,uT*0.35,uT*0.2))*uE*0.2 + snoise(pa*uF*2.3 - vec3(uT*0.5))*uE*0.05;
        float db = snoise(pb*uF + vec3(0.0,uT*0.35,uT*0.2))*uE*0.2 + snoise(pb*uF*2.3 - vec3(uT*0.5))*uE*0.05;
        vec3 Pc = pos0 + normal*d0, Pa = pa + normal*da, Pb = pb + normal*db;
        objectNormal = normalize(cross(Pa-Pc, Pb-Pc)); if (dot(objectNormal, normal) < 0.0) objectNormal = -objectNormal;`)
      .replace('#include <begin_vertex>', 'vec3 transformed = position + normal * d0;');
  };
  mat.customProgramCacheKey = function () { return 'orb' + (opts.glass ? 'g' : 'c'); };
  var mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 48), mat);
  return { mesh: mesh, mat: mat, uni: uni };
}
