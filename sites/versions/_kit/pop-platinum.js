/* pop-platinum.js: light pools, ticket-cut hero card with metal hairline + pointer glint, corner ticks, CHANGES toggle. data-pop a|b on <html>. */
(function(){
  var V=document.documentElement.getAttribute('data-pop')||'a', NS='http://www.w3.org/2000/svg';
  function ready(f){document.readyState!=='loading'?f():document.addEventListener('DOMContentLoaded',f)}
  ready(function(){
    var vig=document.querySelector('.vig'); if(vig&&vig.parentNode){var p=document.createElement('div');p.className='pp-pools';vig.parentNode.insertBefore(p,vig)}
    var hero=document.getElementById('top'), card=document.querySelector('.hero-card');
    if(hero){['l','r'].forEach(function(s){var t=document.createElement('i');t.className='pp-tick '+s;t.setAttribute('aria-hidden','true');hero.appendChild(t)})}
    if(card){
      card.classList.add('pp-card');
      var svg=document.createElementNS(NS,'svg');svg.setAttribute('class','pp-edge');svg.setAttribute('aria-hidden','true');
      svg.innerHTML='<defs><linearGradient id="ppMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".3" stop-color="#7fe3ff"/><stop offset=".5" stop-color="#9aa0a8"/><stop offset=".72" stop-color="#a99bff"/><stop offset=".88" stop-color="#fef9e8"/><stop offset="1" stop-color="#fff"/></linearGradient></defs><path class="o"/><path class="pp-in"/>';
      var g=document.createElement('span');g.className='pp-glint';g.setAttribute('aria-hidden','true');
      card.appendChild(g);card.appendChild(svg);
      function arc(cx,cy,r,a0,a1,n){var o=[];for(var i=0;i<=n;i++){var a=(a0+(a1-a0)*i/n)*Math.PI/180;o.push([cx+r*Math.cos(a),cy+r*Math.sin(a)])}return o}
      function poly(w,h){var a=[];
        if(V==='a'){ /* ticket: chamfered corners, round bites mid-left and mid-right */
          var c=34,r=15,m=h*.5;
          a=[[c,0],[w-c,0],[w,c]].concat([[w,m-r]],arc(w,m,r,-90,-270,10).slice(0),[[w,h-c],[w-c,h],[c,h],[0,h-c],[0,m+r]],arc(0,m,r,90,-90,10),[[0,c]]);
        }else{ /* banner: big cuts on TL and BR, small on TR and BL, a V notch at top and bottom centre */
          var B=58,s=16,n=20;
          a=[[B,0],[w/2-n,0],[w/2,n*.7],[w/2+n,0],[w-s,0],[w,s],[w,h-B],[w-B,h],[w/2+n,h],[w/2,h-n*.7],[w/2-n,h],[s,h],[0,h-s],[0,B]];
        } return a}
      var o=svg.querySelector('.o'),inn=svg.querySelector('.pp-in');
      function fit(){var w=card.offsetWidth,h=card.offsetHeight;if(!w)return;var pts=poly(w,h);
        var d='M'+pts.map(function(q){return q[0].toFixed(1)+' '+q[1].toFixed(1)}).join('L')+'Z';
        o.setAttribute('d',d);
        var k=7,ip=poly(w-2*k,h-2*k).map(function(q){return [q[0]+k,q[1]+k]});
        inn.setAttribute('d','M'+ip.map(function(q){return q[0].toFixed(1)+' '+q[1].toFixed(1)}).join('L')+'Z');
        svg.setAttribute('viewBox','0 0 '+w+' '+h);
        card.style.clipPath='polygon('+pts.map(function(q){return q[0].toFixed(1)+'px '+q[1].toFixed(1)+'px'}).join(',')+')'}
      fit();if(window.ResizeObserver)new ResizeObserver(fit).observe(card);addEventListener('resize',fit);
      card.addEventListener('pointermove',function(e){var b=card.getBoundingClientRect();card.style.setProperty('--mx',(e.clientX-b.left)+'px');card.style.setProperty('--my',(e.clientY-b.top)+'px')},{passive:true});
    }
    var on=true;try{on=localStorage.getItem('ppChg')!=='0'}catch(e){}
    var b=document.createElement('button');b.type='button';b.className='pp-chg';b.innerHTML='<span>CHANGES</span>';b.setAttribute('aria-label','Show changed text in purple');
    function ap(){document.documentElement.classList.toggle('pp-show-chg',on);b.setAttribute('aria-pressed',on)}
    b.addEventListener('click',function(){on=!on;try{localStorage.setItem('ppChg',on?'1':'0')}catch(e){}ap()});
    document.body.appendChild(b);ap();
  });
})();
