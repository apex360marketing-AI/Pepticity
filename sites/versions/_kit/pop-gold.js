/* POP-GOLD: ticket-silhouette card with a metal hairline whose glint follows the pointer, lit ticks, CHANGES toggle. Variant from html[data-pop]. */
(function(){
  var D=document.documentElement, V=D.dataset.pop||'9', RM=matchMedia('(prefers-reduced-motion:reduce)').matches, NS='http://www.w3.org/2000/svg';
  function poly(w,h){
    if(V==='11'){var d=Math.min(44,w*.05),m=h/2;return [[0,m],[d,0],[w-d,0],[w,m],[w-d,h],[d,h]];}      /* hexagon */
    var c=26,r=17,m=h/2,p=[[c,0],[w-c,0],[w,c],[w,m-r]],i,t;                                          /* notched ticket: cut corners + round bites out of both sides */
    for(i=1;i<8;i++){t=Math.PI*i/8;p.push([w-r*Math.sin(t),m-r*Math.cos(t)]);}
    p.push([w,m+r],[w,h-c],[w-c,h],[c,h],[0,h-c],[0,m+r]);
    for(i=1;i<8;i++){t=Math.PI*i/8;p.push([r*Math.sin(t),m+r*Math.cos(t)]);}
    p.push([0,m-r],[0,c]);return p;}
  function mk(el,withTicks){
    if(!el||el.querySelector(':scope>.pg-rim'))return;
    var s=document.createElementNS(NS,'svg');s.setAttribute('class','pg-rim');s.setAttribute('aria-hidden','true');
    s.innerHTML='<defs><radialGradient id="pgRimG'+(withTicks?'':'2')+'" gradientUnits="userSpaceOnUse" cx="50%" cy="0" r="55%"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".3" stop-color="#FEF9E8"/><stop offset=".6" stop-color="#A4845D"/><stop offset="1" stop-color="#9AA1AB"/></radialGradient></defs><path class="pg-in"/><path/>';
    el.appendChild(s);
    var paths=s.querySelectorAll('path'),g=s.querySelector('radialGradient');
    paths[1].style.stroke='url(#'+g.id+')';
    function fit(){var w=el.offsetWidth,h=el.offsetHeight,pts=poly(w,h),d='M'+pts.map(function(q){return q[0].toFixed(1)+' '+q[1].toFixed(1)}).join('L')+'Z';
      el.style.clipPath='polygon('+pts.map(function(q){return q[0].toFixed(1)+'px '+q[1].toFixed(1)+'px'}).join(',')+')';
      paths[0].setAttribute('d',d);paths[1].setAttribute('d',d);s.setAttribute('viewBox','0 0 '+w+' '+h);}
    fit();if(window.ResizeObserver)new ResizeObserver(fit).observe(el);
    if(!RM)el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect();g.setAttribute('cx',(e.clientX-r.left)+'');g.setAttribute('cy',(e.clientY-r.top)+'');g.setAttribute('r',Math.max(180,r.width*.32)+'');});
    else g.setAttribute('r','1200');
  }
  function tag(host,txt,pos){if(!host)return;var t=document.createElement('b');t.className='pg-tag';t.textContent=txt;for(var k in pos)t.style[k]=pos[k];host.appendChild(t);}
  function boot(){
    var hc=document.querySelector('.hero-card'),gate=document.getElementById('gate'),mono=document.querySelector('.hero-mono');
    if(hc){mk(hc,true);['l','r'].forEach(function(c){var t=document.createElement('span');t.className='pg-tick '+c;t.innerHTML='<i></i>';hc.appendChild(t);});
      tag(hc,'CHANGED: CORNER TICKS',{top:'4px',left:'50%',transform:'translateX(-50%)'});
      var h1=hc.querySelector('.h1');if(h1)tag(hc,'CHANGED: PLATINUM CHROME HEADLINE, CENTRED',{top:'82px',left:'50%',transform:'translateX(-50%)'});
      var cs=hc.querySelector('.crown-slot');if(cs){cs.style.position='relative';tag(cs,'CHANGED: CROWN BUTTON',{bottom:'-14px',left:'4px'});}
      tag(hc,'CHANGED: TICKET CARD, CENTRED',{bottom:'4px',left:'50%',transform:'translateX(-50%)'});}
    if(mono){mono.style.position='relative';tag(mono,'CHANGED: CHROME GOLD P',{top:'0',left:'50%',transform:'translateX(-50%)'});}
    if(gate){mk(gate,false);tag(gate,'CHANGED: MEMBERSHIP CARD, CENTRED, NEW SILHOUETTE',{top:'-14px',left:'50%',transform:'translateX(-50%)'});}
    var on=true;try{on=localStorage.getItem('pgChanges')!=='off';}catch(e){}
    var b=document.createElement('button');b.type='button';b.className='pg-toggle';b.setAttribute('aria-label','Show or hide the purple CHANGES marks');b.innerHTML='<b>CHANGES<br><em></em></b>';
    function set(v){on=v;D.classList.toggle('pg-show',v);b.setAttribute('aria-pressed',v);b.querySelector('em').textContent=v?'ON':'OFF';try{localStorage.setItem('pgChanges',v?'on':'off');}catch(e){}}
    b.addEventListener('click',function(){set(!on);});document.body.appendChild(b);set(on);
  }
  if(document.readyState!=='loading')boot();else document.addEventListener('DOMContentLoaded',boot);
})();
