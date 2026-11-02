/* pointer-reactive glass: sets --mx/--my (eased) on the glass under the pointer. Mouse only, off for reduced motion. */
(function(){
  if(matchMedia('(hover:none)').matches||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  var SEL='.glass,.hero-card',cur=null,tx=0,ty=0,x=0,y=0,raf=0;
  function loop(){raf=0;if(!cur)return;x+=(tx-x)*.16;y+=(ty-y)*.16;cur.style.setProperty('--mx',x.toFixed(1)+'px');cur.style.setProperty('--my',y.toFixed(1)+'px');
    if(Math.abs(tx-x)+Math.abs(ty-y)>.4)raf=requestAnimationFrame(loop)}
  addEventListener('pointermove',function(e){if(e.pointerType&&e.pointerType!=='mouse')return;
    var el=e.target.closest&&e.target.closest(SEL);
    if(el!==cur){if(cur)cur.removeAttribute('data-rg');cur=el;if(cur){var r=cur.getBoundingClientRect();x=e.clientX-r.left;y=e.clientY-r.top;cur.setAttribute('data-rg','1')}}
    if(cur){var r2=cur.getBoundingClientRect();tx=e.clientX-r2.left;ty=e.clientY-r2.top;if(!raf)raf=requestAnimationFrame(loop)}
  },{passive:true});
  addEventListener('pointerleave',function(){if(cur)cur.removeAttribute('data-rg');cur=null},true);
})();
