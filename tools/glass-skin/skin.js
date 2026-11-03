/* PEPTICITY · DESK GLASS SKIN v2 · colour switcher (10 colour pairs), pointer torch, card light, sequenced sweep.
   The colour choice is shared by every page on the site. */
(function(){
  var D=document,R=D.documentElement,KEY='pep-accent';
  var RM=matchMedia('(prefers-reduced-motion: reduce)').matches,HOVER=matchMedia('(hover:hover)').matches;
  /* id, name, accent, accent light, partner, metal gradient (gold/platinum only) */
  var A=[
    ['blue','Blue','#0066FF','#8fb4ff','#00C2FF'],
    ['chartreuse','Chartreuse','#D4FF3A','#e9ffa0','#2EF2A0'],
    ['cyan','Cyan','#0FFFFF','#a6fdff','#4F7DFF'],
    ['red','Red','#FF004F','#ff8fae','#FF2D95'],
    ['violet','Violet','#6F00FF','#b996ff','#C04BFF'],
    ['orchid','Orchid','#8D029B','#e08bea','#FF4FD8'],
    ['copper','Copper','#C46210','#f0b27a','#E8C39E'],
    ['salmon','Salmon','#FA8072','#ffc3ba','#FF6FA8'],
    ['gold','Chrome Gold','#d9c39a','#f0e6c7','#4f7dff','linear-gradient(135deg,#f0e6c7 0%,#d9c39a 30%,#a4845d 55%,#f0e6c7 78%,#d9c39a 100%)'],
    ['platinum','Chrome Platinum','#e6e9ed','#ffffff','#9db4ff','linear-gradient(135deg,#ffffff 0%,#e6e9ed 28%,#9aa3b0 52%,#f4f6f8 76%,#c3c9d2 100%)']
  ];
  function rgba(h,a){h=h.replace('#','');return 'rgba('+parseInt(h.slice(0,2),16)+','+parseInt(h.slice(2,4),16)+','+parseInt(h.slice(4,6),16)+','+a+')'}
  function grad(o){return o[5]||'linear-gradient(135deg,'+o[3]+' 0%,'+o[2]+' 48%,'+o[4]+' 100%)'}
  function swatch(o){return 'linear-gradient(135deg,'+o[3]+' 0%,'+o[2]+' 50%,'+o[4]+' 100%)'}
  function find(id){for(var i=0;i<A.length;i++)if(A[i][0]===id)return A[i];return null}
  function apply(id,save){
    var o=find(id)||find('gold'),s=R.style;
    s.setProperty('--acc',o[2]);s.setProperty('--acc-hi',o[3]);s.setProperty('--acc2',o[4]);s.setProperty('--acc-grad',grad(o));
    s.setProperty('--acc-glow',rgba(o[2],.30));s.setProperty('--acc-soft',rgba(o[2],.10));s.setProperty('--acc2-glow',rgba(o[4],.24));s.setProperty('--acc-line',rgba(o[3],.45));
    R.setAttribute('data-accent',o[0]);
    if(save){try{localStorage.setItem(KEY,o[0])}catch(e){}}
    var w=D.getElementById('dkSw');if(!w)return;
    w.querySelectorAll('.dk-sw__o').forEach(function(b){var on=b.dataset.a===o[0];b.setAttribute('aria-checked',String(on));b.tabIndex=on?0:-1});
    w.querySelector('.dk-sw__name').textContent=o[1];
  }
  var start='gold';
  try{start=new URLSearchParams(location.search).get('accent')||localStorage.getItem(KEY)||'gold'}catch(e){}
  apply(start,false);

  var PANES='.glass,.dk-pane,.does li,.line>div,.demo';
  var SWEEP='.card.glass,.stat.glass,.panel.glass,.order.glass,.prod.glass,.plat.glass,.does li,.line>div';

  function lightLayers(){
    var host=D.querySelector('.app,.page')||D.body.firstElementChild;
    ['dk-amb','dk-torch'].forEach(function(c){var el=D.createElement('div');el.className=c;el.setAttribute('aria-hidden','true');host.parentNode.insertBefore(el,host)});
  }

  /* torch behind the glass + the hot spot and rim light inside the card under the pointer */
  function pointer(){
    if(!HOVER||RM)return;
    var torch=D.querySelector('.dk-torch'),pend=null,last=null;
    function paint(){var e=pend;pend=null;if(!e)return;
      R.style.setProperty('--px',e.clientX+'px');R.style.setProperty('--py',e.clientY+'px');
      var p=e.target&&e.target.closest?e.target.closest(PANES):null;
      if(last&&last!==p){last.style.removeProperty('--mx');last.style.removeProperty('--my')}
      if(p){var r=p.getBoundingClientRect();p.style.setProperty('--mx',(e.clientX-r.left)+'px');p.style.setProperty('--my',(e.clientY-r.top)+'px')}
      last=p;torch.classList.add('lit');torch.classList.toggle('over',!!p)}
    D.addEventListener('pointermove',function(e){if(e.pointerType==='touch')return;var f=!pend;pend=e;if(f)requestAnimationFrame(paint)},{passive:true});
    D.documentElement.addEventListener('pointerleave',function(){torch.classList.remove('lit')});
    addEventListener('blur',function(){torch.classList.remove('lit')});
  }

  /* one light sweep at a time, scattered order, hover fires it at once */
  function sweeps(){
    var list=[];
    function arm(el){if(el.querySelector(':scope>.dk-sweep'))return;
      var cs=getComputedStyle(el);if(cs.position==='static')el.style.position='relative';
      var s=D.createElement('i');s.className='dk-sweep';s.setAttribute('aria-hidden','true');el.insertBefore(s,el.firstChild);
      s.addEventListener('animationend',function(){el.classList.remove('dk-sweeping')});
      el.addEventListener('pointerenter',function(){fire(el);held=true});
      el.addEventListener('pointerleave',function(){held=false});
      list.push(el)}
    function scan(){D.querySelectorAll(SWEEP).forEach(arm)}
    function fire(el){el.classList.remove('dk-sweeping');void el.offsetWidth;el.classList.add('dk-sweeping')}
    var held=false,k=0;
    function visible(el){if(!el.offsetParent&&getComputedStyle(el).position!=='fixed')return false;var r=el.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.width>0}
    function tick(){if(held||D.hidden||RM)return;var v=list.filter(visible);if(!v.length)return;
      /* scattered: step through the visible panes by a stride that is coprime with their count */
      var n=v.length,stride=n>2?(n%3?3:(n%2?2:1)):1;k=(k+stride)%n;fire(v[k])}
    scan();
    var q=0;new MutationObserver(function(){if(q)return;q=requestAnimationFrame(function(){q=0;scan()})}).observe(D.body,{childList:true,subtree:true});
    setInterval(tick,2600);
    setTimeout(tick,900);
  }

  function switcher(){
    var w=D.createElement('div');w.className='dk-sw';w.id='dkSw';
    var h='<button class="dk-sw__btn" type="button" aria-expanded="false" aria-controls="dkSwPop"><i class="dk-sw__cur" aria-hidden="true"></i><span>Colour</span></button>'+
      '<div class="dk-sw__pop" id="dkSwPop"><p class="dk-sw__h">COLOUR</p><div class="dk-sw__grid" role="radiogroup" aria-label="Accent colour">';
    A.forEach(function(o){h+='<button class="dk-sw__o" type="button" role="radio" aria-checked="false" data-a="'+o[0]+'" aria-label="'+o[1]+'" title="'+o[1]+'" style="color:'+o[2]+'"><i style="background:'+swatch(o)+'"></i></button>'});
    h+='</div><p class="dk-sw__name" aria-live="polite"></p></div>';
    w.innerHTML=h;D.body.appendChild(w);
    var btn=w.querySelector('.dk-sw__btn'),pop=w.querySelector('.dk-sw__pop');
    pop.inert=true;
    function open(v){w.classList.toggle('on',v);btn.setAttribute('aria-expanded',String(v));pop.inert=!v;if(v){var c=w.querySelector('[aria-checked="true"]');c&&c.focus({preventScroll:true})}}
    btn.addEventListener('click',function(){open(!w.classList.contains('on'))});
    w.querySelectorAll('.dk-sw__o').forEach(function(b){b.addEventListener('click',function(){apply(b.dataset.a,true)})});
    w.querySelector('.dk-sw__grid').addEventListener('keydown',function(e){
      var bs=[].slice.call(w.querySelectorAll('.dk-sw__o')),i=bs.indexOf(D.activeElement);if(i<0)return;
      var n={ArrowRight:1,ArrowDown:5,ArrowLeft:-1,ArrowUp:-5}[e.key];if(!n)return;e.preventDefault();
      var j=(i+n+bs.length)%bs.length;bs[j].focus();apply(bs[j].dataset.a,true)});
    D.addEventListener('keydown',function(e){if(e.key==='Escape'&&w.classList.contains('on')){open(false);btn.focus()}});
    D.addEventListener('pointerdown',function(e){if(w.classList.contains('on')&&!w.contains(e.target))open(false)});
    apply(R.getAttribute('data-accent'),false);
  }

  function build(){
    if(D.getElementById('dkSw'))return;
    lightLayers();switcher();pointer();sweeps();
  }
  if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',build);else build();
  window.PepAccent={set:function(id){apply(id,true)},list:A.map(function(o){return o[0]})};
})();
