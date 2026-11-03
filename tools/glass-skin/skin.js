/* PEPTICITY · DESK GLASS SKIN · colour switcher (10 options). The choice is shared by every page on the site. */
(function(){
  var D=document,R=D.documentElement,KEY='pep-accent';
  var A=[
    ['blue','Blue','#0066FF','#7fa8ff'],['chartreuse','Chartreuse','#D4FF3A','#e6ff9a'],['cyan','Cyan','#0FFFFF','#9ffcff'],
    ['red','Red','#FF004F','#ff7fa3'],['violet','Violet','#6F00FF','#b38cff'],['orchid','Orchid','#8D029B','#d77ce2'],
    ['copper','Copper','#C46210','#eaa36a'],['salmon','Salmon','#FA8072','#ffc0b8'],
    ['gold','Chrome Gold','#d9c39a','#f0e6c7','linear-gradient(135deg,#f0e6c7 0%,#d9c39a 30%,#a4845d 55%,#f0e6c7 78%,#d9c39a 100%)'],
    ['platinum','Chrome Platinum','#e6e9ed','#ffffff','linear-gradient(135deg,#ffffff 0%,#e6e9ed 28%,#9aa3b0 52%,#f4f6f8 76%,#c3c9d2 100%)']
  ];
  function rgba(h,a){h=h.replace('#','');return 'rgba('+parseInt(h.slice(0,2),16)+','+parseInt(h.slice(2,4),16)+','+parseInt(h.slice(4,6),16)+','+a+')'}
  function grad(o){return o[4]||'linear-gradient(135deg,'+o[3]+' 0%,'+o[2]+' 45%,'+o[3]+' 100%)'}
  function find(id){for(var i=0;i<A.length;i++)if(A[i][0]===id)return A[i];return null}
  function apply(id,save){
    var o=find(id)||find('gold'),s=R.style;
    s.setProperty('--acc',o[2]);s.setProperty('--acc-hi',o[3]);s.setProperty('--acc-grad',grad(o));
    s.setProperty('--acc-glow',rgba(o[2],.30));s.setProperty('--acc-soft',rgba(o[2],.10));s.setProperty('--acc-line',rgba(o[3],.42));
    R.setAttribute('data-accent',o[0]);
    if(save){try{localStorage.setItem(KEY,o[0])}catch(e){}}
    var w=D.getElementById('dkSw');if(!w)return;
    w.querySelectorAll('.dk-sw__o').forEach(function(b){var on=b.dataset.a===o[0];b.setAttribute('aria-checked',String(on));b.tabIndex=on?0:-1});
    w.querySelector('.dk-sw__name').textContent=o[1];
  }
  var start='gold';
  try{start=new URLSearchParams(location.search).get('accent')||localStorage.getItem(KEY)||'gold'}catch(e){}
  apply(start,false);
  function build(){
    if(D.getElementById('dkSw'))return;
    var amb=D.createElement('div');amb.className='dk-amb';amb.setAttribute('aria-hidden','true');
    var bg=D.querySelector('.bg,#bg');if(bg&&bg.parentNode)bg.parentNode.insertBefore(amb,bg.nextSibling);else D.body.insertBefore(amb,D.body.firstChild);
    var w=D.createElement('div');w.className='dk-sw';w.id='dkSw';
    var h='<button class="dk-sw__btn" type="button" aria-expanded="false" aria-controls="dkSwPop"><i class="dk-sw__cur" aria-hidden="true"></i><span>Colour</span></button>'+
      '<div class="dk-sw__pop" id="dkSwPop"><p class="dk-sw__h">COLOUR</p><div class="dk-sw__grid" role="radiogroup" aria-label="Accent colour">';
    A.forEach(function(o){h+='<button class="dk-sw__o" type="button" role="radio" aria-checked="false" data-a="'+o[0]+'" aria-label="'+o[1]+'" title="'+o[1]+'" style="color:'+o[2]+'"><i style="background:'+grad(o)+'"></i></button>'});
    h+='</div><p class="dk-sw__name" aria-live="polite"></p></div>';
    w.innerHTML=h;D.body.appendChild(w);
    var btn=w.querySelector('.dk-sw__btn'),pop=w.querySelector('.dk-sw__pop');
    pop.inert=true;
    function open(v){w.classList.toggle('on',v);btn.setAttribute('aria-expanded',String(v));pop.inert=!v;if(v){var c=w.querySelector('[aria-checked="true"]');c&&c.focus({preventScroll:true})}}
    btn.addEventListener('click',function(){open(!w.classList.contains('on'))});
    w.querySelectorAll('.dk-sw__o').forEach(function(b){b.addEventListener('click',function(){apply(b.dataset.a,true)})});
    w.querySelector('.dk-sw__grid').addEventListener('keydown',function(e){
      var k=e.key,bs=[].slice.call(w.querySelectorAll('.dk-sw__o')),i=bs.indexOf(D.activeElement);if(i<0)return;
      var n={ArrowRight:1,ArrowDown:5,ArrowLeft:-1,ArrowUp:-5}[k];if(!n)return;e.preventDefault();
      var j=(i+n+bs.length)%bs.length;bs[j].focus();apply(bs[j].dataset.a,true)});
    D.addEventListener('keydown',function(e){if(e.key==='Escape'&&w.classList.contains('on')){open(false);btn.focus()}});
    D.addEventListener('pointerdown',function(e){if(w.classList.contains('on')&&!w.contains(e.target))open(false)});
    apply(R.getAttribute('data-accent'),false);
  }
  if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',build);else build();
  window.PepAccent={set:function(id){apply(id,true)},list:A.map(function(o){return o[0]})};
})();
