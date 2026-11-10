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
      '  <nav class="l nav" aria-label="Shop">' + a('shop.html', 'SHOP', 'shop') + a('index.html#finder', 'FIND YOURS', 'finder') + a('about.html', 'THE STANDARD', 'about') + a('journal.html', 'JOURNAL', 'journal') + '</nav>\n'
      '  <a class="brand" href="index.html" aria-label="PEPTICITY home"><span class="p" aria-hidden="true">P</span><span class="w">PEPTICITY</span></a>\n'
      '  <div class="r"><nav class="nav" aria-label="Help">' + a('index.html#paper', 'LOT LOOKUP', 'lot') + a('contact.html', 'CONTACT', 'contact') + '</nav>'
      '<button class="keybtn" data-open-cart aria-label="Open cart">CART <span class="n" data-count>0</span></button>'
      '<button class="keybtn menu-btn" id="mBtn" aria-expanded="false" aria-controls="mnav">MENU</button></div>\n'
      '</header>\n'
      '<div class="mnav" id="mnav" aria-hidden="true"><div class="scrim" data-mclose3></div><nav aria-label="Site">'
      '<a href="index.html">HOME</a><a href="shop.html">SHOP ALL</a><a href="index.html#finder">FIND YOURS</a><a href="index.html#set">THE SET OF THREE</a>'
      '<a href="about.html">THE STANDARD</a><a href="journal.html">JOURNAL</a><a href="cart.html">CART</a><a href="index.html#paper">LOT LOOKUP</a><a href="contact.html">CONTACT</a></nav></div>\n<main id="main">\n')

FOOTER = ('</main>\n<footer id="privacy">\n  <div class="rail-h" style="margin-bottom:60px"></div>\n  <div class="wordmark" id="wm" aria-hidden="true">PEPTICITY</div>\n'
  '  <div class="foot-links"><a href="shop.html">Shop all</a><a href="index.html#set">Set of three</a><a href="about.html">The standard</a><a href="index.html#paper">Lot lookup</a>'
  '<a href="journal.html">Journal</a><a href="cart.html">Cart</a><a href="index.html#letter">Grace\'s letter</a><a href="contact.html">Contact</a><a href="contact.html#faq">FAQ</a><a href="#privacy">Privacy <i class="ph">[page]</i></a><a href="#privacy">Terms <i class="ph">[page]</i></a></div>\n'
  '  <p class="legal">PEPTICITY · [legal name] · [mailing address] · [contact email]. Adults only. Prices in CAD. PEPTICITY does not give health, dosing or use advice. [Final legal copy to be approved by counsel.] Preview build: forms and checkout send nothing.</p>\n</footer>\n'
  '<div class="bar" aria-label="Cart bar"><div class="glass glass-in"><span class="p" aria-hidden="true">P</span><span class="count">FIRST ORDER 15% OFF</span><a class="btn" href="shop.html" data-cta="bar-shop">SHOP</a><button class="btn ghost" data-open-cart>CART · <span data-count>0</span></button></div></div>\n'
  '<script>window.PEP_CFG={CHECKOUT_URL:"checkout.html",CART_URL:"cart.html"};</script>\n<script src="core/vendor/lenis.min.js"></script>\n<script src="core/core.js"></script>\n')

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
g_js = g_js.replace("var items=P.products.filter(function(p){return p.shelf===s&&!p.soon;});", "var all=P.products.filter(function(p){return p.shelf===s&&!p.soon;}),items=all.slice(0,3);")
g_js = g_js.replace("'<p>'+S.note+'</p></div>", "'<p>'+S.note+' <a href=\"shop.html#s'+s+'\" style=\"color:var(--g3)\">SEE ALL '+all.length+' &#x2192;</a></p></div>")
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

# shop: preselect a shelf from shop.html#s2
import io
s = open(os.path.join(OUT, 'shop.html')).read()
s = s.replace("  draw(0);\n", "  var m0=/#s(\\d)/.exec(location.hash);var f0=m0?m0[1]:'0';$$('#filters button').forEach(function(x){x.setAttribute('aria-pressed',String(x.dataset.f===f0));});draw(f0);\n")
open(os.path.join(OUT, 'shop.html'), 'w').write(s)

# ---------------- CART ----------------
CART = ('<section class="phero"><div class="wrap"><div class="crumbs"><a href="index.html">HOME</a> · CART</div><span class="eyebrow">YOUR ORDER</span>'
  '<h1 class="h-l" style="margin-top:14px"><span class="x3d gold-t" data-t="YOUR CART">YOUR CART</span></h1></div></section>\n'
  '<section style="padding-top:10px"><div class="wrap"><div class="cartgrid">'
  '<div><div class="clines" id="clines"></div>'
  '<div class="upsell glass pool" id="setNudge" data-rv><div><span class="eyebrow">QUANTITY BREAK</span><h2 class="h-s" style="margin-top:10px" id="setMsg">ANY THREE VIALS, <span class="ph">[X]%</span> OFF</h2></div><a class="btn ghost" href="index.html#set">BUILD MY SET</a></div></div>'
  '<aside class="csum glass pool"><h2 class="h-s">ORDER SUMMARY</h2><div class="totals" id="ctot"></div>'
  '<div id="cjoin" style="margin-top:16px"></div>'
  '<a class="btn" id="goCheckout" href="checkout.html" style="width:100%;margin-top:16px">CHECKOUT <span class="arw">&#x2192;</span></a>'
  '<a class="btn ghost" href="shop.html" style="width:100%;margin-top:10px">KEEP SHOPPING</a>'
  '<div class="chips"><span class="chip">SECURE CHECKOUT <i class="ph">[provider]</i></span><span class="chip">ADULTS 19+</span><span class="chip">CAD</span></div>'
  '<details class="savecart"><summary>NOT READY? EMAIL ME THIS CART</summary><div id="csave"></div></details></aside>'
  '</div></div></section>\n'
  '<section style="padding-top:10px"><div class="wrap"><div class="head"><span class="eyebrow">ADD TO YOUR ORDER</span><h2 class="h-m" style="margin-top:12px"><span class="x3d plat-t" data-t="ALSO ON THE SHELF">ALSO ON THE SHELF</span></h2></div><div class="rail" id="crail"></div></div></section>\n')
CART_JS = r"""
  var C=P.cfg;
  function draw(){var cart=P.cart(),L=$('#clines');
    if(!cart.length){L.innerHTML='<div class="glass" style="padding:40px;text-align:center"><h2 class="h-s">YOUR CART IS EMPTY</h2><p class="small">The whole shelf is one tap away.</p><a class="btn" href="shop.html">SHOP ALL</a></div>';}
    else L.innerHTML=cart.map(function(l,i){var p=P.byK[l.k];return '<div class="cline glass"><div class="cimg">'+(p.img?'<img src="'+p.img+'" alt="">':'<img src="'+P.img+'" alt="">')+'</div><div class="cinfo"><b>'+P.esc(p.name)+'</b><span class="small">'+P.esc(l.size)+(l.set?' · SET OF THREE':'')+'</span><span class="cprice">'+P.priceTxt(p,l.size)+' <span class="small">each</span></span></div>'+
      '<div class="qty"><button type="button" data-i="'+i+'" data-d="-1" aria-label="One less '+P.esc(p.name)+'">&minus;</button><b aria-live="polite">'+l.q+'</b><button type="button" data-i="'+i+'" data-d="1" aria-label="One more '+P.esc(p.name)+'">+</button></div>'+
      '<button type="button" class="rm" data-rm="'+i+'" aria-label="Remove '+P.esc(p.name)+'">REMOVE</button></div>';}).join('');
    var T=P.totals(cart),sets=cart.some(function(l){return l.set;});
    $('#ctot').innerHTML='<div><span>Subtotal ('+P.count()+')</span><span>'+T.t.sub+'</span></div>'+(sets?'<div><span>Set of three · '+C.SET_PCT+'% off</span><span>'+T.t.setOff+'</span></div>':'')+
      (C.COUNSEL.offer&&P.joined()?'<div><span>PEPTICITY TEAM · '+C.OFFER_PCT+'% OFF FIRST ORDER</span><span>'+T.t.member+'</span></div>':'')+
      '<div><span>Shipping</span><span>'+T.t.ship+'</span></div><div class="small">Free shipping over $'+C.FREE_SHIP+' CAD [Grace to confirm]. Taxes at checkout.</div><div class="big"><span>Total before tax</span><span>'+T.t.total+'</span></div>';
    var single=cart.filter(function(l){return !l.set;}).reduce(function(a,l){return a+l.q;},0);
    $('#setMsg').innerHTML=single>0&&single<3?'ADD '+(3-single)+' MORE FOR THE SET PRICE: <span class="ph">[X]%</span> OFF':'ANY THREE VIALS, <span class="ph">[X]%</span> OFF';
    $('#goCheckout').classList.toggle('off',!cart.length);
    if(!$('#cjoin').dataset.done){ $('#cjoin').style.display=(C.COUNSEL.offer&&!P.joined())?'':'none'; }
    var inCart={};cart.forEach(function(l){inCart[l.k]=1;});$('#crail').innerHTML=P.products.filter(function(p){return !inCart[p.k];}).slice(0,10).map(function(p){return P.cardHTML(p,{cls:'plate'});}).join('');}
  $('#clines').addEventListener('click',function(e){var b=e.target.closest('[data-i],[data-rm]');if(!b)return;var c=P.cart().slice();
    if(b.dataset.rm!=null){c.splice(+b.dataset.rm,1);P.track('cart_remove');}else{var l=c[+b.dataset.i];l.q+= +b.dataset.d;if(l.q<1)c.splice(+b.dataset.i,1);}P.saveCart(c);draw();});
  $('#goCheckout').addEventListener('click',function(e){if(!P.count()){e.preventDefault();P.toast('Your cart is empty');}else P.track('checkout_start');});
  $('#cjoin').innerHTML='<p class="small" style="margin:0 0 8px">JOIN THE PEPTICITY TEAM FOR '+C.OFFER_PCT+'% OFF THIS ORDER</p>'+P.captureForm('cart-page-join','JOIN AND SAVE',{doneTitle:'15% APPLIED'});
  $('#csave').innerHTML=P.captureForm('cart-page-save','EMAIL MY CART',{doneTitle:'CART SAVED'});
  P.bindForms(document);document.addEventListener('pep:lead',function(e){if(e.detail.hook==='cart-page-join'){$('#cjoin').dataset.done='1';}setTimeout(draw,950);});
  document.addEventListener('click',function(e){if(e.target.closest('[data-add]'))setTimeout(draw,60);});
  draw();
"""
page('cart.html', 'PEPTICITY · YOUR CART', 'Your PEPTICITY cart.', 'cart', CART, CART_JS)

# ---------------- CHECKOUT ----------------
PROV_OPTS = ''.join('<option value="%s">%s</option>' % (k, v) for k, v in [('AB','Alberta'),('BC','British Columbia'),('MB','Manitoba'),('NB','New Brunswick'),('NL','Newfoundland and Labrador'),('NS','Nova Scotia'),('NT','Northwest Territories'),('NU','Nunavut'),('ON','Ontario'),('PE','Prince Edward Island'),('QC','Quebec'),('SK','Saskatchewan'),('YT','Yukon')])
CHECKOUT = ('<section class="phero" style="padding-bottom:20px"><div class="wrap"><div class="crumbs"><a href="index.html">HOME</a> · <a href="cart.html">CART</a> · CHECKOUT</div>'
  '<h1 class="h-l"><span class="x3d gold-t" data-t="CHECKOUT">CHECKOUT</span></h1>'
  '<ol class="steps" id="steps" aria-label="Checkout steps"><li class="on">CONTACT</li><li>DELIVERY</li><li>AGE</li><li>PAYMENT</li></ol></div></section>\n'
  '<section style="padding-top:0"><div class="wrap"><div class="cartgrid">'
  '<form class="glass pool cobox" id="co" novalidate>'
  '<fieldset data-step="0"><legend class="h-s">1 · CONTACT</legend>'
  '<div class="field"><label for="co-e">Email (for your order receipt)</label><input class="input" id="co-e" name="email" type="email" inputmode="email" autocomplete="email" required data-hint="Add your email, e.g. name@example.com"><span class="msg" aria-live="polite"></span></div>'
  '<label class="consent"><input type="checkbox" name="consent_email"><span>Also send me PEPTICITY news and offers. I can unsubscribe at any time. (Optional, not needed to order.)</span></label>'
  '<button class="btn" type="button" data-next>CONTINUE TO DELIVERY <span class="arw">&#x2192;</span></button></fieldset>'
  '<fieldset data-step="1" hidden><legend class="h-s">2 · DELIVERY</legend>'
  '<div class="two"><div class="field"><label for="co-f">First name</label><input class="input" id="co-f" name="first" autocomplete="given-name" required data-hint="Add your first name"><span class="msg" aria-live="polite"></span></div>'
  '<div class="field"><label for="co-l">Last name</label><input class="input" id="co-l" name="last" autocomplete="family-name" required data-hint="Add your last name"><span class="msg" aria-live="polite"></span></div></div>'
  '<div class="field"><label for="co-a">Street address</label><input class="input" id="co-a" name="address" autocomplete="address-line1" required data-hint="Add your street address"><span class="msg" aria-live="polite"></span></div>'
  '<div class="two"><div class="field"><label for="co-c">City</label><input class="input" id="co-c" name="city" autocomplete="address-level2" required data-hint="Add your city"><span class="msg" aria-live="polite"></span></div>'
  '<div class="field"><label for="co-pv">Province or territory</label><select class="input select" id="co-pv" name="province" autocomplete="address-level1" required data-hint="Choose your province or territory"><option value="">Choose…</option>' + PROV_OPTS + '</select><span class="msg" aria-live="polite"></span></div></div>'
  '<div class="two"><div class="field"><label for="co-z">Postal code</label><input class="input" id="co-z" name="postal" autocomplete="postal-code" autocapitalize="characters" required pattern="[A-Za-z][0-9][A-Za-z] ?[0-9][A-Za-z][0-9]" data-hint="Use a Canadian postal code, e.g. V6B 1A1"><span class="msg" aria-live="polite"></span></div>'
  '<div class="field"><label for="co-t">Mobile (optional, for delivery texts)</label><input class="input" id="co-t" name="tel" type="tel" inputmode="tel" autocomplete="tel" pattern="[0-9 ()+.-]{10,}" data-hint="Add your area code, e.g. 604 555 0123"><span class="msg" aria-live="polite"></span></div></div>'
  '<p class="small">Shipping: <i class="ph">[carrier, price and timing: Grace to confirm]</i></p>'
  '<div class="navrow"><button class="btn ghost" type="button" data-back>BACK</button><button class="btn" type="button" data-next>CONTINUE <span class="arw">&#x2192;</span></button></div></fieldset>'
  '<fieldset data-step="2" hidden><legend class="h-s">3 · AGE</legend><p id="ageMsg">PEPTICITY sells to adults only.</p>'
  '<label class="consent"><input type="checkbox" name="age_ok" id="ageOk" required><span id="ageLbl">I confirm I am of the age of majority where I live.</span></label><span class="msg" id="ageErr" aria-live="polite" style="color:#ffb3c4;font-size:13px"></span>'
  '<div class="navrow"><button class="btn ghost" type="button" data-back>BACK</button><button class="btn" type="button" data-next>CONTINUE TO PAYMENT <span class="arw">&#x2192;</span></button></div></fieldset>'
  '<fieldset data-step="3" hidden><legend class="h-s">4 · PAYMENT</legend>'
  '<div class="paybox"><b>SECURE PAYMENT</b><p class="small">Card details are entered on the payment provider\'s own secure form, never on this page. <i class="ph">[Payment provider: Grace to choose]</i></p></div>'
  '<p class="small">By placing the order you agree to the <a href="#privacy">terms</a> <i class="ph">[page]</i>. PEPTICITY does not give health, dosing or use advice.</p>'
  '<input class="hp" tabindex="-1" autocomplete="off" name="company" aria-hidden="true">'
  '<div class="navrow"><button class="btn ghost" type="button" data-back>BACK</button><button class="btn" type="submit" id="place">PLACE ORDER <span class="arw">&#x2192;</span></button></div></fieldset>'
  '<div class="thanks" id="thanks" hidden tabindex="-1"><div class="tick">&#x2713;</div><h2 class="h-m"><span class="x3d gold-t" data-t="ORDER PREVIEW">ORDER PREVIEW</span></h2>'
  '<p>This is a preview: <b>no order was placed and nothing was charged.</b> On the live site you get an order number and a receipt by email here.</p>'
  '<div class="thook glass"><span class="eyebrow">WHILE YOU WAIT</span><h3 class="h-s" style="margin:10px 0">GET GRACE\'S LETTER</h3><div id="tLetter"></div></div>'
  '<div class="thook glass"><span class="eyebrow">BRING A FRIEND</span><h3 class="h-s" style="margin:10px 0">SHARE THE SHELF</h3><p class="small">Your own link to share. <i class="ph">[Referral reward: counsel + Grace to confirm]</i></p><a class="btn ghost" href="index.html#more">GET MY LINK</a></div>'
  '<a class="btn" href="shop.html" style="margin-top:16px">BACK TO THE SHOP</a></div>'
  '</form>'
  '<aside class="csum glass pool"><h2 class="h-s">YOUR ORDER</h2><div id="osum" class="osum"></div><div class="totals" id="otot"></div><a class="btn ghost" href="cart.html" style="width:100%;margin-top:14px">EDIT CART</a></aside>'
  '</div></div></section>\n')
CHECKOUT_JS = r"""
  var C=P.cfg,form=$('#co'),sets=$$('fieldset',form),cur=0,steps=$$('#steps li');
  function sum(){var cart=P.cart();$('#osum').innerHTML=cart.length?cart.map(function(l){var p=P.byK[l.k];return '<div class="oline"><span>'+l.q+' × '+P.esc(p.name)+' <span class="small">'+P.esc(l.size)+'</span></span><span>'+P.priceTxt(p,l.size)+'</span></div>';}).join(''):'<p class="small">Your cart is empty. <a href="shop.html">Shop all</a></p>';
    var T=P.totals(cart);$('#otot').innerHTML='<div><span>Subtotal</span><span>'+T.t.sub+'</span></div>'+(cart.some(function(l){return l.set;})?'<div><span>Set of three</span><span>'+T.t.setOff+'</span></div>':'')+(C.COUNSEL.offer&&P.joined()?'<div><span>PEPTICITY TEAM 15%</span><span>'+T.t.member+'</span></div>':'')+'<div><span>Shipping</span><span>'+T.t.ship+'</span></div><div><span>Tax</span><span>$[TAX]</span></div><div class="big"><span>Total</span><span>'+T.t.total+'</span></div>';}
  function validStep(n){var ok=true;$$('input:not([type=checkbox]):not(.hp),select',sets[n]).forEach(function(i){var f=i.closest('.field');var v=i.checkValidity()&&!(i.type==='email'&&i.value&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(i.value));if(f){f.classList.toggle('err',!v);f.classList.toggle('ok',v&&!!i.value);$('.msg',f).textContent=v?'':(i.dataset.hint||i.validationMessage);}i.setAttribute('aria-invalid',String(!v));if(!v)ok=false;});
    if(n===2){var a=$('#ageOk');$('#ageErr').textContent=a.checked?'':'Please confirm your age to continue.';if(!a.checked)ok=false;}
    if(!ok){var bad=$('.err input,.err select',sets[n])||(n===2?$('#ageOk'):null);if(bad)bad.focus();P.track('checkout_error',{step:n+1});}return ok;}
  function go(n){if(n===2){var pv=$('#co-pv').value,age=P.AGE[pv]||19;$('#ageMsg').textContent='Adults only. In '+(P.PROV[pv]||'your province')+' that means '+age+' or older.';$('#ageLbl').textContent='I confirm I am '+age+' or older.';}
    cur=n;sets.forEach(function(s,i){s.hidden=i!==n;});steps.forEach(function(s,i){s.classList.toggle('on',i<=n);});var f=$('input:not(.hp),select,button',sets[n]);if(f)f.focus({preventScroll:true});P.track('checkout_step',{step:n+1});
    if(P.lenis)P.lenis.scrollTo(form,{offset:-110,duration:1.2});}
  form.addEventListener('click',function(e){if(e.target.closest('[data-next]')){if(validStep(cur))go(cur+1);}if(e.target.closest('[data-back]'))go(cur-1);});
  $$('input,select',form).forEach(function(i){i.addEventListener('blur',function(){if(i.value&&i.closest('.field'))validStep(cur);});});
  var sent=false;
  form.addEventListener('submit',function(e){e.preventDefault();if(sent)return;if(!P.count()){P.toast('Your cart is empty');return;}if($('.hp',form).value){return;}
    for(var n=0;n<4;n++){if(!validStep(n)){go(n);return;}}
    sent=true;var b=$('#place');b.disabled=true;b.textContent='PLACING…';
    var lead={hook:'checkout-preview',at:new Date().toISOString(),email:$('#co-e').value,province:$('#co-pv').value,consent_email:form.consent_email.checked,items:P.count()};
    var leads=P.store.get('leads',[]);leads.push(lead);P.store.set('leads',leads);window.PEP.sent=(window.PEP.sent||0)+1;
    P.track('checkout_preview_placed',{items:P.count(),consent_email:lead.consent_email});
    setTimeout(function(){sets.forEach(function(s){s.hidden=true;});$('#steps').hidden=true;var t=$('#thanks');t.hidden=false;t.focus({preventScroll:true});
      $('#tLetter').innerHTML=P.captureForm('thanks-letter','SEND ME THE LETTER',{doneTitle:'YOU ARE ON THE LIST'});P.bindForms(t);
      if(P.lenis)P.lenis.scrollTo(form,{offset:-110,duration:1});},900);});
  if(!P.count()){$('#co').insertAdjacentHTML('afterbegin','<p class="small" style="color:#ffb3c4">Your cart is empty. <a href="shop.html">Add something first.</a></p>');}
  sum();
"""
page('checkout.html', 'PEPTICITY · CHECKOUT', 'PEPTICITY checkout.', 'cart', CHECKOUT, CHECKOUT_JS)

# ---------------- JOURNAL ----------------
POSTS = [
  ('HOW TO READ A PEPTICITY LABEL', 'THE LABEL', 'Five lines, front and back, and what each one is for.',
   '<p>The front carries PEPTICITY down the side and the logo P, so you always know whose vial it is.</p><p>The back carries five printed lines: the product name, the amount in milligrams, ONE VIAL, the lot number, and the storage line (cold, dry and dark).</p><p>Nothing is handwritten. If a line is missing or hard to read, write to us before you open the vial. <i class="ph">[contact email]</i></p>'),
  ('WHAT A LOT NUMBER TELLS YOU', 'LOTS', 'Why every vial has one, and how to get its paperwork.',
   '<p>A lot is a batch. Every vial from the same batch shares one lot number, printed on the back label.</p><p>Send us the lot number with the lot lookup and we email that lot\'s paperwork to you. <i class="ph">[Paperwork process and what it includes: Grace to confirm]</i></p><p>Keep the number until you have finished with the vial; it is the quickest way for us to help with any question about your order.</p>'),
  ('HOW WE PACK AND SHIP', 'SHIPPING', 'From our shelf to your door, step by step.',
   '<p><i class="ph">[Grace to write: where orders are packed, packaging, cold-pack if any, carrier, tracking and typical timing.]</i></p><p>Every order ships in a plain box with the lot numbers on the packing slip.</p>'),
  ('MEET GRACE', 'THE PERSON', 'Who answers when you write to PEPTICITY.',
   '<p><i class="ph">[Grace to write a short, true introduction in her own words.]</i></p>'),
  ('NEW ON THE SHELF', 'NEW LOTS', 'What landed this month. Updated when new lots arrive.',
   '<p><i class="ph">[Updated by Grace each time a new lot or product lands. Names, sizes and lot numbers only.]</i></p><p>Want this the day it happens? Join new-lot alerts below.</p>')
]
cards = ''.join(
  '<article class="post glass plate" data-rv="%d"><span class="eyebrow">%s</span><h2 class="h-s" style="margin:12px 0 8px">%s</h2><p class="small">%s</p>'
  '<details><summary>READ</summary><div class="body">%s</div></details></article>' % ((i % 3) + 1, tag, t, sub, body)
  for i, (t, tag, sub, body) in enumerate(POSTS))
JOURNAL = ('<section class="phero"><div class="wrap"><div class="crumbs"><a href="index.html">HOME</a> · JOURNAL</div><span class="eyebrow">NOTES FROM PEPTICITY</span>'
  '<h1 class="h-l" style="margin-top:14px"><span class="x3d gold-t" data-t="THE JOURNAL">THE JOURNAL</span></h1>'
  '<p class="lede">Labels, lots, shipping and new arrivals. Plain notes, no hype and no health advice.</p></div></section>\n'
  '<section style="padding-top:10px"><div class="wrap"><div class="posts">' + cards + '</div>'
  '<div class="split" style="margin-top:40px"><div class="glass plate pool" data-rv><span class="eyebrow">NEW LOT ALERTS</span><h2 class="h-m" style="margin:14px 0 8px"><span class="x3d gold-t" data-t="FIRST WORD">FIRST WORD</span></h2><div id="jAlert"></div></div>'
  '<div class="glass plate pool" data-rv="2"><span class="eyebrow">EVERY MONTH</span><h2 class="h-m" style="margin:14px 0 8px"><span class="x3d plat-t" data-t="GRACE\'S LETTER">GRACE\'S LETTER</span></h2><div id="jLetter"></div></div></div>'
  '<div class="ctas" style="display:flex;justify-content:center;margin-top:40px"><a class="btn" href="shop.html">SHOP THE COLLECTION <span class="arw">&#x2192;</span></a></div></div></section>\n')
JOURNAL_JS = r"""
  $('#jAlert').innerHTML=P.captureForm('journal-alerts','TELL ME FIRST',{sms:true,doneTitle:'YOU WILL HEAR FIRST'});
  $('#jLetter').innerHTML=P.captureForm('journal-letter','SEND ME THE LETTER',{name:true,doneTitle:'YOU ARE ON THE LIST'});
  P.bindForms(document);
  $$('.post details').forEach(function(d){d.addEventListener('toggle',function(){if(d.open)P.track('journal_read',{i:$$('.post details').indexOf(d)});});});
"""
page('journal.html', 'PEPTICITY · JOURNAL', 'Notes from PEPTICITY: labels, lots, shipping and new arrivals.', 'journal', JOURNAL, JOURNAL_JS)

# shelf window: SEE ALL link under each shelf title
h = open(os.path.join(OUT, 'index.html')).read()
h = h.replace("<p>'+S.note+'</p></div>", "<p>'+S.note+' <a href=\"shop.html#s'+s+'\" style=\"color:var(--g3)\">SEE ALL '+all.length+' &#x2192;</a></p></div>")
open(os.path.join(OUT, 'index.html'), 'w').write(h)
