/* THIS VERSION chip: lists the 7 effects of this version (window.PC_VERSION). Esc or the X closes it. */
(function(){
  var V=window.PC_VERSION; if(!V) return;
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function mount(){
    var w=document.createElement('div'); w.className='vchip';
    w.innerHTML='<button class="vchip__btn" type="button" aria-expanded="false" aria-controls="vchipPanel"><i class="vchip__dot" aria-hidden="true"></i>THIS VERSION</button>'+
      '<div class="vchip__panel" id="vchipPanel" role="dialog" aria-label="Effects in this version">'+
      '<button class="vchip__close" type="button" aria-label="Close">&#10005;</button>'+
      '<p class="vchip__t">'+esc(V.n)+' · '+esc(V.name)+'</p><p class="vchip__s">Colour <b>'+esc(V.hex)+'</b> · '+V.effects.length+' effects</p><ol>'+
      V.effects.map(function(e){return '<li><span class="c">'+esc(e.code)+'</span><span class="n">'+esc(e.name)+'</span><span class="w">'+esc(e.where)+'</span></li>'}).join('')+
      '</ol></div>';
    document.body.appendChild(w);
    var b=w.querySelector('.vchip__btn'), x=w.querySelector('.vchip__close');
    function set(o){w.classList.toggle('open',o);b.setAttribute('aria-expanded',o);if(o)x.focus();}
    b.addEventListener('click',function(){set(!w.classList.contains('open'))});
    x.addEventListener('click',function(){set(false);b.focus()});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&w.classList.contains('open')){set(false);b.focus()}});
  }
  if(document.readyState!=='loading')mount();else document.addEventListener('DOMContentLoaded',mount);
})();
