#!/usr/bin/env python3
"""Build PEPTICITY STORE v2 (sites/sales/store/) from the GOLD colourway + store.css.
Pages: index (home), shop, product, about (THE STANDARD), contact. Shared header, menu, footer, cart bar.
Run: python3 -I build_store.py"""
import os, re
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'store'); os.makedirs(OUT, exist_ok=True)
gold = open(os.path.join(HERE, 'gold', 'index.html')).read()

head_end = gold.index('</style>') + len('</style>')
HEAD = gold[:head_end] + '\n<link rel="stylesheet" href="core/store.css">'
HEAD = HEAD.replace('data-way="gold"', 'data-way="store"')
# store.css owns the metal tokens now (duo gold + platinum): drop the gold-only :root line from the page style
HEAD = re.sub(r":root\{--m0:#332814;[^}]*\}", ":root{--oct:polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%)}", HEAD, count=1)
HEAD = HEAD.replace("--key:polygon(12px 0,calc(100% - 12px) 0,100% 50%,calc(100% - 12px) 100%,12px 100%,0 50%)}", "}")

def head(title, desc):
    h = re.sub(r'<title>.*?</title>', '<title>%s</title>' % title, HEAD, count=1)
    h = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="%s">' % desc, h, count=1)
    return h

def header(cur):
    def a(href, label, key):
        return '<a href="%s"%s>%s</a>' % (href, ' aria-current="page"' if key == cur else '', label)
    return ('</head>\n<body class="has-announce">\n<a class="skip" href="#main">Skip to content</a>\n'
      '<div class="ground" aria-hidden="true"></div><div class="satin" aria-hidden="true"></div><div class="grain" aria-hidden="true"></div><div class="torch" aria-hidden="true"></div>\n'
      '<div class="announce">GRAND OPENING · 15% OFF YOUR FIRST ORDER WITH A FOUNDING TICKET · <a href="index.html#ticket">CLAIM IT</a> <span class="ph" style="color:inherit;border-color:rgba(0,0,0,.4)">[offer: counsel + Grace to confirm]</span></div>\n'
      '<header class="top" id="top">\n'
      '  <nav class="l nav" aria-label="Shop">' + a('shop.html', 'SHOP', 'shop') + a('index.html#finder', 'FIND YOURS', 'finder') + a('about.html', 'THE STANDARD', 'about') + '</nav>\n'
      '  <a class="brand" href="index.html" aria-label="PEPTICITY home"><span class="p" aria-hidden="true">P</span><span class="w">PEPTICITY</span></a>\n'
      '  <div class="r"><nav class="nav" aria-label="Help">' + a('index.html#paper', 'LOT LOOKUP', 'lot') + a('contact.html', 'CONTACT', 'contact') + '</nav>'
      '<button class="keybtn" data-open-cart aria-label="Open cart">CART <span class="n" data-count>0</span></button>'
      '<button class="keybtn menu-btn" id="mBtn" aria-expanded="false" aria-controls="mnav">MENU</button></div>\n'
      '</header>\n'
      '<div class="mnav" id="mnav" aria-hidden="true"><div class="scrim" data-mclose3></div><nav aria-label="Site">'
      '<a href="index.html">HOME</a><a href="shop.html">SHOP ALL</a><a href="index.html#finder">FIND YOURS</a><a href="index.html#set">THE SET OF THREE</a>'
      '<a href="about.html">THE STANDARD</a><a href="index.html#paper">LOT LOOKUP</a><a href="contact.html">CONTACT</a></nav></div>\n<main id="main">\n')

FOOTER = ('</main>\n<footer id="privacy">\n  <div class="rail-h" style="margin-bottom:60px"></div>\n  <div class="wordmark" id="wm" aria-hidden="true">PEPTICITY</div>\n'
  '  <div class="foot-links"><a href="shop.html">Shop all</a><a href="index.html#set">Set of three</a><a href="about.html">The standard</a><a href="index.html#paper">Lot lookup</a>'
  '<a href="index.html#letter">Grace\'s letter</a><a href="contact.html">Contact</a><a href="contact.html#faq">FAQ</a><a href="#privacy">Privacy <i class="ph">[page]</i></a><a href="#privacy">Terms <i class="ph">[page]</i></a></div>\n'
  '  <p class="legal">PEPTICITY · [legal name] · [mailing address] · [contact email]. Adults only. Prices in CAD. PEPTICITY does not give health, dosing or use advice. [Final legal copy to be approved by counsel.] Preview build: forms and checkout send nothing.</p>\n</footer>\n'
  '<div class="bar" aria-label="Cart bar"><div class="glass glass-in"><span class="p" aria-hidden="true">P</span><span class="count">FIRST ORDER 15% OFF</span><a class="btn" href="shop.html" data-cta="bar-shop">SHOP</a><button class="btn ghost" data-open-cart>CART · <span data-count>0</span></button></div></div>\n'
  '<script src="core/vendor/lenis.min.js"></script>\n<script src="core/core.js"></script>\n')

COMMON_JS = r"""
  /* shared: menu, header, torch, tide fill, footer wordmark */
  var mn=$('#mnav'),mb=$('#mBtn');
  function setM(on){mn.classList.toggle('open',on);mn.setAttribute('aria-hidden',String(!on));mb.setAttribute('aria-expanded',String(on));mb.textContent=on?'CLOSE':'MENU';if(on)$('a',mn).focus();}
  mb.addEventListener('click',function(){setM(!mn.classList.contains('open'));});
  $('[data-mclose3]',mn).addEventListener('click',function(){setM(false);mb.focus();});
  $$('a',mn).forEach(function(a){a.addEventListener('click',function(){setM(false);});});
  mn.addEventListener('keydown',function(e){if(e.key==='Escape'){setM(false);mb.focus();}});
  var top=$('#top');P.onFrame(function(){top.classList.toggle('solid',scrollY>30);});
  var torch=$('.torch');if(P.fine&&!P.reduce){var tx=-999,ty=-999,cx=-999,cy=-999;addEventListener('pointermove',function(e){tx=e.clientX;ty=e.clientY;if(cx<-900){cx=tx;cy=ty;}});P.onFrame(function(){cx+=(tx-cx)*.08;cy+=(ty-cy)*.08;torch.style.transform='translate3d('+cx+'px,'+cy+'px,0)';});}
  var tides=$$('.tide');P.onFrame(function(){var H=innerHeight;for(var i=0;i<tides.length;i++){var r=tides[i].getBoundingClientRect();if(r.bottom<-50||r.top>H+50)continue;var f=Math.min(1,Math.max(0,(H*.92-r.top)/(H*.5)));tides[i].style.setProperty('--fill',(f*106-6).toFixed(1)+'%');}});
  new IntersectionObserver(function(es){if(es[0].isIntersecting)$('#wm').classList.add('lit');},{threshold:.6}).observe($('#wm'));
  /* 360 spin: one full turn, 2 s hold facing front, then again */
  $$('video[data-spin]').forEach(function(v){if(P.reduce){v.removeAttribute('autoplay');v.pause();return;}
    v.muted=true;v.playsInline=true;var go=function(){var p=v.play();if(p&&p.catch)p.catch(function(){});};
    v.addEventListener('ended',function(){setTimeout(function(){v.currentTime=0;go();},2000);});
    new IntersectionObserver(function(es){if(es[0].isIntersecting){if(v.paused&&!v.ended)go();}else v.pause();}).observe(v);});
"""

def spin(cls='spinwrap', alt='The PEPTICITY vial turning a full circle'):
    return ('<div class="%s" role="img" aria-label="%s"><video data-spin muted playsinline autoplay preload="auto" poster="core/img/vial-spin-poster.jpg">'
            '<source src="core/img/vial-spin.webm" type="video/webm"><source src="core/img/vial-spin.mp4" type="video/mp4"></video></div>' % (cls, alt))

def page(name, title, desc, cur, body, js):
    html = head(title, desc) + header(cur) + body + FOOTER + '<script>\n(function(){\n  var P=window.PEP,$=P.$,$$=P.$$;\n' + COMMON_JS + js + '\n})();\n</script>\n</body>\n</html>\n'
    open(os.path.join(OUT, name), 'w').write(html)
    print('wrote', name, len(html))

# ---------------- HOME ----------------
g_main = gold[gold.index('<main>') + len('<main>'):gold.index('</main>')]
hero_start = g_main.index('<!-- ============ HERO + FOUNDING TICKET ============ -->')
hero_end = g_main.index('</section>', hero_start) + len('</section>')
old_hero = g_main[hero_start:hero_end]
ticket = old_hero[old_hero.index('<div class="pool"><div class="ticket glass"'):old_hero.index('<div class="trust"')]
rest = g_main[hero_end:]
# shop window links to the full shop
rest = rest.replace('<div class="wnav" id="wnav" role="group" aria-label="Choose a shelf"></div>',
    '<div class="wnav" id="wnav" role="group" aria-label="Choose a shelf"></div>')
rest = rest.replace('<section class="window" id="shop">', '<section class="window" id="shelves">')

motes = ''.join('<i style="left:%d%%;animation-delay:-%ss;animation-duration:%ss"></i>' % (5 + (i * 37) % 90, i * 1.3 % 14, 11 + i % 7) for i in range(18))
HERO = ('<section class="hero2" data-hero>\n'
  '  <div class="halo" aria-hidden="true"></div><div class="ring" aria-hidden="true"></div><div class="ring r2" aria-hidden="true"></div><div class="halo2" aria-hidden="true"></div><div class="motes" aria-hidden="true">' + motes + '</div>\n'
  '  <span class="eyebrow" data-rv>GRAND OPENING · CANADA</span>\n'
  '  <h1 class="h-xl" id="heroH" aria-label="PEPTICITY" style="margin-top:16px"><span class="word" aria-hidden="true" id="w1"></span></h1>\n'
  '  ' + spin() + '\n'
  '  <p class="h-s" style="color:var(--p3);margin:0" data-rv="2">PEPTIDES, LABELLED PLAINLY</p>\n'
  '  <div class="ctas" data-rv="3"><a class="btn" href="shop.html" data-cta="hero-shop">SHOP THE COLLECTION <span class="arw">&#x2192;</span></a><a class="btn ghost" href="#ticket" data-cta="hero-ticket">CLAIM 15% OFF</a></div>\n'
  '  <div class="trust" data-rv="4"><span class="chip">SHIPS FROM CANADA <i class="ph">[confirm]</i></span><span class="chip">LOT NUMBER ON EVERY VIAL</span><span class="chip">A REAL PERSON ANSWERS</span><span class="chip">ADULTS 19+ (18+ AB · MB · QC)</span></div>\n'
  '</section>\n')
items = ['ONE VIAL · ONE LOT NUMBER', 'PACKED IN CANADA [confirm]', 'TRACKED SHIPPING [confirm]', 'NAME, AMOUNT AND STORAGE ON EVERY LABEL', 'A REAL PERSON ANSWERS', 'ADULTS ONLY']
STRIP = '<div class="strip" aria-hidden="true"><div class="run">' + ''.join('<span>%s</span>' % s for s in items * 4) + '</div></div>\n'
PILLARS = ('<section id="standard"><div class="wrap"><div class="head"><span class="eyebrow" data-rv>THE PEPTICITY STANDARD</span>'
  '<h2 class="h-l" data-rv="2"><span class="x3d tide gold-t" data-t="THREE PROMISES ON PAPER">THREE PROMISES ON PAPER</span></h2>'
  '<p class="lede" data-rv="3">No hype, no claims. Just what you can check yourself.</p></div>\n'
  '<div class="pillars"><div class="pillar glass plate" data-rv><div class="n">01</div><h3>EVERY VIAL HAS A LOT</h3><p>The lot number is printed on the back. Look it up for that lot\'s paperwork. <i class="ph">[Grace to confirm]</i></p></div>'
  '<div class="pillar glass plate" data-rv="2"><div class="n">02</div><h3>PACKED IN CANADA</h3><p>Plain box, tracked from our door to yours. <i class="ph">[confirm]</i></p></div>'
  '<div class="pillar glass plate" data-rv="3"><div class="n">03</div><h3>A PERSON ANSWERS</h3><p>Questions go to Grace, not a bot. <i class="ph">[contact email]</i></p></div></div>\n'
  '<div class="ctas" style="display:flex;justify-content:center;margin-top:34px" data-rv><a class="btn ghost" href="about.html">READ THE STANDARD</a></div></div></section>\n')
RAIL = ('<section id="start" style="padding-top:20px"><div class="wrap"><div class="head"><span class="eyebrow" data-rv>THE COLLECTION</span>'
  '<h2 class="h-l" data-rv="2"><span class="x3d tide plat-t" data-t="START HERE">START HERE</span></h2>'
  '<p class="lede" data-rv="3">Every vial on the shelf. Swipe, pick a size, add it to your cart.</p></div>'
  '<div class="rail" id="rail" data-rv="3"></div><div class="ctas" style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:26px"><a class="btn" href="shop.html">SHOP ALL <span class="arw">&#x2192;</span></a><a class="btn ghost" href="#finder">HELP ME CHOOSE</a></div></div></section>\n')
TICKET = ('<section id="ticket" style="padding-top:40px"><div class="wrap" style="max-width:640px">' + ticket.replace('data-rv="3"', 'data-rv') + '</div></section>\n')
SPLIT = ('<section id="more" style="padding-top:20px"><div class="wrap"><div class="split">'
  '<div class="glass plate pool" data-rv><span class="eyebrow">NEW LOT ALERTS</span><h2 class="h-m" style="margin:14px 0 8px"><span class="x3d gold-t" data-t="FIRST WORD">FIRST WORD</span></h2>'
  '<p class="small" style="margin:0 0 14px">One email the day a new lot lands or a vial is back on the shelf.</p>'
  '<div id="alertForm"></div></div>'
  '<div class="glass plate pool" data-rv="2"><span class="eyebrow">BRING A FRIEND</span><h2 class="h-m" style="margin:14px 0 8px"><span class="x3d plat-t" data-t="SHARE THE SHELF">SHARE THE SHELF</span></h2>'
  '<p class="small" style="margin:0 0 14px">Get your own link to share. <i class="ph">[Referral reward: counsel + Grace to confirm]</i> We never email your friends; you share the link yourself.</p>'
  '<div id="referForm"></div></div></div></div></section>\n')
pos = rest.index('<!-- ============ THE PAPERWORK')
rest = rest[:pos] + SPLIT + rest[pos:]
fin = rest.index('<section class="final">')
rest = rest[:fin] + rest[fin:].replace('href="#shop"', 'href="shop.html"', 1)
home_body = HERO + STRIP + PILLARS + RAIL + TICKET + rest.replace('<!-- ============ HERO + FOUNDING TICKET ============ -->', '')

g_js = gold[gold.index('var P=window.PEP,$=P.$,$$=P.$$;') + len('var P=window.PEP,$=P.$,$$=P.$$;'):gold.rindex('})();')]
# remove gold-only header pieces now shared (keymenu, torch, tide, wordmark) and rewire the hero word
g_js = re.sub(r"  /\* NAV-125 gold key menu \*/.*?var top=\$\('#top'\);P\.onFrame\(function\(\)\{top\.classList\.toggle\('solid',scrollY>40\);\}\);\n", '', g_js, flags=re.S)
g_js = re.sub(r"  /\* HOV-04 torch \*/.*?\n", '', g_js)
g_js = re.sub(r"  /\* TXT-103 tide fill.*?\n  var tides=.*?\n", '', g_js)
g_js = re.sub(r"  new IntersectionObserver\(function\(es\)\{if\(es\[0\]\.isIntersecting\)\$\('#wm'\).*?\n", '', g_js)
g_js = g_js.replace("w1.classList.add('go');", "w1.classList.add('go');$('#heroH').classList.add('go');")
g_js = g_js.replace("var frame=$('#frame'),wnav=$('#wnav'),win=$('#shop');", "var frame=$('#frame'),wnav=$('#wnav'),win=$('#shelves');")
HOME_JS = g_js + r"""
  /* hero word: duo metal, alternating gold / platinum letters */
  $$('#w1 .x3d').forEach(function(s,i){s.classList.add(i%2?'gold-t':'plat-t');});
  /* rail of every vial */
  $('#rail').innerHTML=P.products.map(function(p){return P.cardHTML(p,{cls:'plate'});}).join('');
  $('#alertForm').innerHTML=P.captureForm('new-lot-alerts','TELL ME FIRST',{sms:true,doneTitle:'YOU WILL HEAR FIRST'});
  $('#referForm').innerHTML=P.captureForm('refer-link','GET MY LINK',{doneTitle:'YOUR LINK IS READY',done:'Preview build: on the live site your personal link appears here to copy. Nothing was sent.'});
  P.bindForms(document);
"""
page('index.html', 'PEPTICITY · PEPTIDES, LABELLED PLAINLY', 'PEPTICITY: a Canadian peptide house. Every vial labelled with its name, amount and lot number. Adults 19+ (18+ in AB, MB, QC).', 'home', home_body, HOME_JS)

# ---------------- SHOP ----------------
SHOP = ('<section class="phero"><div class="wrap"><div class="crumbs"><a href="index.html">HOME</a> · SHOP</div><span class="eyebrow">THE COLLECTION</span>'
  '<h1 class="h-l" style="margin-top:14px"><span class="x3d gold-t" data-t="SHOP ALL">SHOP ALL</span></h1>'
  '<p class="lede">Name, size and price. Pick a size, add it to your cart. Checkout asks your province first.</p></div></section>\n'
  '<section style="padding-top:10px"><div class="wrap"><div class="filters" id="filters" role="group" aria-label="Filter the shelf">'
  '<button aria-pressed="true" data-f="0">ALL</button><button aria-pressed="false" data-f="1">10 MG VIALS</button><button aria-pressed="false" data-f="2">TWO SIZES</button><button aria-pressed="false" data-f="3">LARGE FORMATS</button></div>'
  '<div class="shelf p3" id="grid"></div>'
  '<div class="upsell glass pool" data-rv><div><span class="eyebrow">QUANTITY BREAK</span><h2 class="h-s" style="margin-top:10px">ANY THREE VIALS, <span class="ph">[X]%</span> OFF</h2></div><a class="btn" href="index.html#set">BUILD MY SET <span class="arw">&#x2192;</span></a></div>'
  '<div class="upsell glass pool" data-rv><div><span class="eyebrow">NOT SURE?</span><h2 class="h-s" style="margin-top:10px">ONE SENTENCE, THREE PICKS</h2></div><a class="btn ghost" href="index.html#finder">FIND YOURS</a></div>'
  '</div></section>\n')
SHOP_JS = r"""
  var grid=$('#grid');
  function draw(f){grid.innerHTML=P.products.filter(function(p){return !+f||p.shelf===+f;}).map(function(p,i){return P.cardHTML(p,{cls:'plate',attrs:' data-rv="'+((i%3)+1)+'"'}).replace('<h3>'+P.esc(p.name)+'</h3>','<h3><a href="product.html#p'+(P.products.indexOf(p)+1)+'">'+P.esc(p.name)+'</a></h3>');}).join('');$$('[data-rv]',grid).forEach(function(e){e.classList.add('in');});}
  $('#filters').addEventListener('click',function(e){var b=e.target.closest('[data-f]');if(!b)return;$$('#filters button').forEach(function(x){x.setAttribute('aria-pressed',String(x===b));});draw(b.dataset.f);P.track('shop_filter',{f:b.dataset.f});});
  draw(0);
"""
page('shop.html', 'PEPTICITY · SHOP ALL', 'Every PEPTICITY vial: name, size and price in CAD.', 'shop', SHOP, SHOP_JS)

# ---------------- PRODUCT ----------------
PDP = ('<section class="phero" style="padding-bottom:10px"><div class="wrap"><div class="crumbs"><a href="index.html">HOME</a> · <a href="shop.html">SHOP</a> · <span id="crumb">VIAL</span></div></div></section>\n'
  '<section style="padding-top:10px"><div class="wrap"><div class="pdp">'
  '<div class="shot" id="shot"></div>'
  '<div class="info"><span class="eyebrow" id="pShelf">THE COLLECTION</span><h1 class="h-l" style="margin-top:12px"><span class="x3d gold-t" id="pName" data-t="VIAL">VIAL</span></h1>'
  '<div class="sizes" id="pSizes" role="group" aria-label="Vial size" style="justify-content:flex-start"></div>'
  '<div class="price">$[PRICE] <span class="small">CAD</span></div>'
  '<div class="qty"><button type="button" id="qm" aria-label="One less">&minus;</button><b id="qn" aria-live="polite">1</b><button type="button" id="qp" aria-label="One more">+</button></div>'
  '<div style="display:flex;gap:12px;flex-wrap:wrap" id="pActs"></div>'
  '<div class="facts"><div><span>On the label</span><b>NAME · AMOUNT · LOT</b></div><div><span>Storage line</span><b>COLD · DRY · DARK</b></div><div><span>Ships from</span><b>CANADA <i class="ph">[confirm]</i></b></div><div><span>Who can order</span><b>ADULTS 19+</b></div></div>'
  '<p class="small">PEPTICITY does not give health, dosing or use advice. For anything about your health, speak with a licensed health professional.</p></div></div>'
  '<div class="upsell glass pool" data-rv><div><span class="eyebrow">QUANTITY BREAK</span><h2 class="h-s" style="margin-top:10px">ADD TWO MORE, <span class="ph">[X]%</span> OFF THE THREE</h2></div><a class="btn" href="index.html#set">BUILD MY SET <span class="arw">&#x2192;</span></a></div>'
  '<div class="upsell glass pool" data-rv><div><span class="eyebrow">LOT LOOKUP</span><h2 class="h-s" style="margin-top:10px">GET THIS LOT\'S PAPERWORK BY EMAIL</h2></div><a class="btn ghost" href="index.html#paper">LOOK UP A LOT</a></div>'
  '</div></section>\n'
  '<section style="padding-top:20px"><div class="wrap"><div class="head"><span class="eyebrow">ALSO ON THE SHELF</span><h2 class="h-m" style="margin-top:12px"><span class="x3d plat-t" data-t="MORE VIALS">MORE VIALS</span></h2></div><div class="rail" id="more"></div></div></section>\n')
PDP_JS = r"""
  function load(){var m=/#p(\d+)/.exec(location.hash),i=m?Math.min(P.products.length,Math.max(1,+m[1]))-1:0;var p=P.products[i];
    document.title='PEPTICITY · '+p.name;$('#crumb').textContent=p.name;var n=$('#pName');n.textContent=p.name;n.dataset.t=p.name;$('#pShelf').textContent=P.shelves[p.shelf].title;
    $('#shot').innerHTML=p.img?'<img src="'+p.img+'" alt="PEPTICITY vial, '+P.esc(p.name)+'">':'<video data-spin muted playsinline autoplay preload="auto" poster="core/img/vial-spin-poster.jpg"><source src="core/img/vial-spin.webm" type="video/webm"><source src="core/img/vial-spin.mp4" type="video/mp4"></video>';
    var v=$('#shot video');if(v&&!P.reduce){v.muted=true;v.play().catch(function(){});v.addEventListener('ended',function(){setTimeout(function(){v.currentTime=0;v.play().catch(function(){});},2000);});}
    $('#pSizes').innerHTML=p.sizes.map(function(s,k){return '<button type="button" class="size" data-size="'+P.esc(s)+'" aria-pressed="'+(k===0)+'">'+P.esc(s)+'</button>';}).join('');
    $('#pActs').innerHTML=p.soon?'<button class="btn" data-notify="'+p.k+'">TELL ME WHEN IT LANDS</button>':'<button class="btn" id="pAdd">ADD TO CART <span class="arw">&#x2192;</span></button><button class="btn ghost" data-open-cart>VIEW CART</button>';
    var a=$('#pAdd');if(a)a.addEventListener('click',function(){var s=$('#pSizes .size[aria-pressed="true"]');P.add(p.k,s?s.dataset.size:null,+$('#qn').textContent);P.openCart();});
    $('#more').innerHTML=P.products.filter(function(x){return x!==p;}).map(function(x){return P.cardHTML(x,{cls:'plate'});}).join('');P.track('product_view',{i:i+1});}
  $('#qm').addEventListener('click',function(){var q=$('#qn');q.textContent=Math.max(1,+q.textContent-1);});
  $('#qp').addEventListener('click',function(){var q=$('#qn');q.textContent=Math.min(20,+q.textContent+1);});
  addEventListener('hashchange',load);load();
"""
page('product.html', 'PEPTICITY · VIAL', 'A PEPTICITY vial: name, size, price and lot number.', 'shop', PDP, PDP_JS)

# ---------------- ABOUT (THE STANDARD) ----------------
ABOUT = ('<section class="phero"><div class="wrap"><div class="crumbs"><a href="index.html">HOME</a> · THE STANDARD</div><span class="eyebrow">ABOUT PEPTICITY</span>'
  '<h1 class="h-l" style="margin-top:14px"><span class="x3d gold-t" data-t="THE STANDARD">THE STANDARD</span></h1>'
  '<p class="lede">A Canadian house for peptides, run by a real person. Here is exactly what we do, and what we never do.</p>' + spin('spinwrap', 'The PEPTICITY vial turning') + '</div></section>\n'
  '<section style="padding-top:10px"><div class="wrap"><div class="story">'
  '<div class="glass plate" data-rv><h3>THE LABEL SAYS IT ALL</h3><p>Every vial carries the product name, the amount in milligrams, a lot number and the storage line. Printed, never handwritten.</p></div>'
  '<div class="glass plate" data-rv><h3>EVERY LOT ON PAPER</h3><p>Each lot has its own paperwork. Send us the lot number and we email it to you. <i class="ph">[Paperwork process: Grace to confirm]</i></p></div>'
  '<div class="glass plate" data-rv><h3>PACKED AND SHIPPED FROM CANADA</h3><p>Plain box, tracked. <i class="ph">[Carrier, timing and cold-pack: Grace to confirm]</i></p></div>'
  '<div class="glass plate" data-rv><h3>A REAL PERSON</h3><p>PEPTICITY is Grace. Questions go to her, not a bot. <i class="ph">[contact email]</i></p></div>'
  '<div class="glass plate" data-rv><h3>WHAT WE NEVER DO</h3><p>No health claims. No dosing or use advice. No fake reviews, countdowns or "only 2 left". Adults only, and checkout asks your province.</p></div>'
  '</div><div class="ctas" style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:40px"><a class="btn" href="shop.html">SHOP THE COLLECTION <span class="arw">&#x2192;</span></a><a class="btn ghost" href="index.html#letter">GET GRACE\'S LETTER</a></div></div></section>\n')
page('about.html', 'PEPTICITY · THE STANDARD', 'What PEPTICITY does and never does: labels, lot paperwork, Canada, a real person.', 'about', ABOUT, '')

# ---------------- CONTACT + FAQ ----------------
faq = gold[gold.index('<div class="faq"'):gold.index('</div>', gold.index('</details>\n    </div>') if '</details>\n    </div>' in gold else gold.index('<div class="faq"')) + 6]
m = re.search(r'<div class="faq"[^>]*>.*?</details>\s*</div>', gold, re.S)
faq = m.group(0) if m else ''
CONTACT = ('<section class="phero"><div class="wrap"><div class="crumbs"><a href="index.html">HOME</a> · CONTACT</div><span class="eyebrow">A REAL PERSON ANSWERS</span>'
  '<h1 class="h-l" style="margin-top:14px"><span class="x3d gold-t" data-t="ASK GRACE">ASK GRACE</span></h1>'
  '<p class="lede">Orders, shipping, lot paperwork, anything about the shop. <i class="ph">[reply time: Grace to confirm]</i> We cannot answer health, dosing or use questions.</p></div></section>\n'
  '<section style="padding-top:10px"><div class="wrap" style="max-width:640px"><div class="glass pool" style="padding:36px clamp(18px,4vw,44px)" data-rv>'
  '<form data-capture="contact" novalidate><div class="todo stack" style="display:grid;gap:12px">'
  '<div class="field"><label for="ct-n">First name</label><input class="input" id="ct-n" name="name" autocomplete="given-name" required data-hint="Add your first name"><span class="msg" aria-live="polite"></span></div>'
  '<div class="field"><label for="ct-e">Email</label><input class="input" id="ct-e" name="email" type="email" inputmode="email" autocomplete="email" required data-hint="Add your email, e.g. name@example.com"><span class="msg" aria-live="polite"></span></div>'
  '<div class="field"><label for="ct-o">Order or lot number (optional)</label><input class="input" id="ct-o" name="order" autocomplete="off"></div>'
  '<div class="field"><label for="ct-m">Your question</label><input class="input" id="ct-m" name="message" required minlength="5" data-hint="Tell us a little more"><span class="msg" aria-live="polite"></span></div>'
  '<label class="consent"><input type="checkbox" name="consent_email"><span>Also send me PEPTICITY news and offers. I can unsubscribe at any time.</span></label>'
  '<input class="hp" tabindex="-1" autocomplete="off" name="company" aria-hidden="true">'
  '<button class="btn">SEND TO GRACE <span class="arw">&#x2192;</span></button></div>'
  '<div class="done"><div class="tick">&#x2713;</div><h3 class="h-s">SENT</h3><p class="small">Preview build: nothing was sent. Live: Grace replies by email. <i class="ph">[reply time]</i></p></div></form>'
  '<p class="small" style="margin:18px 0 0;text-align:center">Or email <i class="ph">[contact email]</i> · [mailing address]</p></div></div></section>\n'
  '<section id="faq" style="padding-top:20px"><div class="wrap"><div class="head"><span class="eyebrow">STRAIGHT ANSWERS</span><h2 class="h-m" style="margin-top:12px"><span class="x3d plat-t" data-t="FAQ">FAQ</span></h2></div>' + faq + '</div></section>\n')
page('contact.html', 'PEPTICITY · CONTACT', 'Ask Grace about orders, shipping and lot paperwork.', 'contact', CONTACT, '')
