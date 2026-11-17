/* PEPTICITY: PICK YOUR LOOK. Builds every option from the data below; no outside requests. */
(function () {
  'use strict';
  var D = window.PEP_DATA, BY = {};
  D.products.forEach(function (p) { BY[p.sku] = p; });
  var GROUPS = D.groups.map(function (g) { return { head: g.head, items: g.skus.map(function (s) { return BY[s]; }).filter(Boolean) }; });
  var ALL = D.products;
  var DEF = { button: '01', menu: '02', dropdown: '01' };
  var picks = { button: null, menu: null, dropdown: null, card: null, founders: null };
  try { var sv = JSON.parse(localStorage.getItem('pep-picks') || 'null'); if (sv && typeof sv === 'object') { Object.keys(picks).forEach(function (k) { if (typeof sv[k] === 'string' && /^\d\d$/.test(sv[k])) picks[k] = sv[k]; }); } } catch (e) {}
  function eff(k) { return picks[k] || DEF[k]; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------- buttons ---------------- */
  function btn(label, style, o) {
    o = o || {};
    var st = style === 'auto' ? eff('button') : style;
    var cls = 'btn b' + st + (style === 'auto' ? ' auto' : '') + (o.sm ? ' sm' : '') + (o.cls ? ' ' + o.cls : '');
    var tag = o.href ? 'a' : 'button';
    var at = o.href ? ' href="' + o.href + '"' : ' type="button"';
    return '<' + tag + ' class="' + cls + '"' + at + (o.attrs || '') + '><i class="fx" aria-hidden="true"></i><span class="t">' + esc(label) + '</span><i class="ub" aria-hidden="true"></i><i class="fb" aria-hidden="true"></i></' + tag + '>';
  }
  var BTN_NAMES = ['YOUR PICK', 'PLATINUM GLASS', 'BLACK CHROME GLASS', 'GLASS BLADE', 'CARD EDGE', 'OCTAGON', 'TWO CUTS', 'DOUBLE LINE', 'NOTCH FOOT', 'BRACKETS', 'RAILS', 'STEP', 'SLAB', 'BLACK CHROME', 'PLATINUM RIM',
    'RUNNING LIGHT', 'UNDER-GLOW', 'SHEEN', 'RISING LIGHT', 'CORNER SPARKS', 'SCAN LINE', 'FLOATING PLATE', 'TILT', 'SEATED', 'GOLD HAIRLINE'];

  /* the cut-corner outlines, measured on the real button size */
  function shape(kind, w, h, c) {
    if (kind === 'twocut') return [[c, 0], [w, 0], [w, h - c], [w - c, h], [0, h], [0, c]];
    if (kind === 'notch') { var nw = 30, nd = 5, m = w / 2; return [[c, 0], [w - c, 0], [w, c], [w, h - c], [w - c, h], [m + nw / 2 + nd, h], [m + nw / 2, h - nd], [m - nw / 2, h - nd], [m - nw / 2 - nd, h], [c, h], [0, h - c], [0, c]]; }
    if (kind === 'step') { var s = 7, tw = w * 0.36, q = w / 2; return [[c, s], [q - tw / 2 - s, s], [q - tw / 2, 0], [q + tw / 2, 0], [q + tw / 2 + s, s], [w - c, s], [w, s + c], [w, h - c], [w - c, h], [c, h], [0, h - c], [0, s + c]]; }
    return [[c, 0], [w - c, 0], [w, c], [w, h - c], [w - c, h], [c, h], [0, h - c], [0, c]];
  }
  function inset(P, t) {
    var n = P.length, out = [];
    for (var i = 0; i < n; i++) {
      var a = P[(i - 1 + n) % n], b = P[i], c = P[(i + 1) % n];
      var d1 = norm(b[0] - a[0], b[1] - a[1]), d2 = norm(c[0] - b[0], c[1] - b[1]);
      var n1 = [-d1[1], d1[0]], n2 = [-d2[1], d2[0]];
      var k = 1 + n1[0] * n2[0] + n1[1] * n2[1];
      out.push([b[0] + t * (n1[0] + n2[0]) / k, b[1] + t * (n1[1] + n2[1]) / k]);
    }
    return out;
  }
  function norm(x, y) { var l = Math.hypot(x, y) || 1; return [x / l, y / l]; }
  function pts(P) { return P.map(function (p) { return p[0].toFixed(2) + 'px ' + p[1].toFixed(2) + 'px'; }).join(', '); }
  function ring(P, t) { var I = inset(P, t); return 'polygon(evenodd, ' + pts(P) + ', ' + pts([P[0]]) + ', ' + pts(I) + ', ' + pts([I[0]]) + ')'; }
  function rings(el) {
    var w = el.offsetWidth, h = el.offsetHeight; if (!w || !h) return;
    var cs = getComputedStyle(el), num = function (k, d) { var v = parseFloat(cs.getPropertyValue(k)); return isNaN(v) ? d : v; };
    var kind = (cs.getPropertyValue('--shape') || 'oct').trim() || 'oct';
    var c = num('--c', 13), t1 = num('--t1', 1.25), i2 = num('--i2', 5), t2 = num('--t2', 1);
    var P = shape(kind, w, h, c);
    el.style.setProperty('--r1', ring(P, t1));
    el.style.setProperty('--r1w', ring(inset(P, -3), 9));
    el.style.setProperty('--r2', ring(inset(P, i2), t2));
    el.style.setProperty('--shi', 'polygon(' + pts(inset(P, t1)) + ')');
  }
  var RO = window.ResizeObserver ? new ResizeObserver(function (es) { es.forEach(function (e) { rings(e.target); }); }) : null;
  function watchButtons(root) { $$('.btn', root).forEach(function (b) { if (b._w) { rings(b); return; } b._w = 1; if (RO) RO.observe(b); rings(b); }); }

  /* ---------------- the small launchers (tab 2) ---------------- */
  var W = 1056, CX = 528, CART_N = 2;
  var DEST = ['SHOP', 'PEPTIDES', 'RESEARCH', 'ABOUT', 'FOUNDERS', 'CART'];
  var MENU_NAMES = ['MEDALLION', 'MEDALLION ON THE LINE', 'BRIDGE MINI', 'NOTCH MINI', 'DOUBLE DECK MINI', 'GLASS KEY', 'BLACK CHROME KEY', 'THE P', 'THREE LINES', 'PULSE', 'THE NAME', 'BLADE MINI', 'TWO RODS MINI', 'CORNER BRACKETS', 'EDGE TAB'];
  var OPEN = ' data-open aria-expanded="false" aria-haspopup="true"';
  function lkey(label, kind, o) {
    o = o || {};
    return '<button type="button" class="lk ' + (kind || 'plat') + '"' + (o.open ? OPEN : '') + (o.aria ? ' aria-label="' + o.aria + '"' : '') + ' style="' + (o.w ? 'width:' + o.w + 'px;' : '') + (o.st || '') + '"><span>' + label + '</span>' + (o.n ? '<b class="cnt">' + o.n + '</b>' : '') + '</button>';
  }
  function lword(label, o) { o = o || {}; return '<button type="button" class="lw"' + (o.open ? OPEN : '') + ' style="' + (o.st || '') + '"><span>' + label + '</span>' + (o.n ? '<b class="cnt">' + o.n + '</b>' : '') + '</button>'; }
  function badge() { return '<b class="badge" aria-label="' + CART_N + ' in cart">' + CART_N + '</b>'; }
  function med(w, inner, o) {
    o = o || {};
    var h = Math.round(w * 291 / 334);
    return '<button type="button" class="med' + (o.cls ? ' ' + o.cls : '') + '"' + (o.open ? OPEN : '') + ' aria-label="' + (o.aria || 'MENU') + '" style="width:' + w + 'px;height:' + h + 'px;' + (o.st || '') + '"><img class="mpl" src="assets/plates/medallion.webp" width="' + w + '" height="' + h + '" alt="">' + (inner || '') + (o.badge ? badge() : '') + '</button>';
  }
  function pimg(s, cls) { return '<img class="pm' + (cls ? ' ' + cls : '') + '" src="assets/p.svg" width="' + s + '" height="' + s + '" alt="" style="width:' + s + 'px;height:' + s + 'px">'; }
  function cx(l) { return 'calc(50% + ' + (l - CX) + 'px)'; }
  function abs(l, t, w, h, inner, extra) { return '<div class="ab" style="left:' + (typeof l === 'string' ? l : cx(l)) + ';top:' + t + 'px;width:' + w + 'px;height:' + h + 'px;' + (extra || '') + '">' + inner + '</div>'; }
  function plate(f, l, t, w, h) { return '<i class="pl" style="left:' + cx(l) + ';top:' + t + 'px;width:' + w + 'px;height:' + h + 'px;background-image:url(assets/plates/' + f + '.webp)"></i>'; }
  function launcher(n) {
    switch (n) {
      case '01': return '<div class="row" style="top:18px;gap:22px">' + lkey('MENU', 'plat', { open: 1, w: 118 }) + med(100, pimg(46), { open: 1, aria: 'MENU' }) + lkey('CART', 'plat', { w: 118, n: CART_N }) + '</div>';
      case '02': { var lw = 600, lh = Math.round(129 * lw / 1600), ly = 92;
        return plate('M11-lightline', CX - lw / 2, ly - 8, lw, lh) + '<div class="row" style="top:' + (ly - 74) + 'px">' + med(88, pimg(40), { open: 1 }) + '</div>' +
          abs(CX - 260 - 60, ly - 50, 120, 44, lword('MENU', { open: 1 }), 'display:flex;justify-content:center') + abs(CX + 260 - 60, ly - 50, 120, 44, lword('CART', { n: CART_N }), 'display:flex;justify-content:center'); }
      case '03': { var w3 = 440, h3 = Math.round(302 * w3 / 1600);
        return plate('M06-bridge', CX - w3 / 2, 20, w3, h3) + abs(CX - 26, 20 + Math.round(h3 * .14), 52, 44, '<button type="button" class="pbtn"' + OPEN + ' aria-label="MENU">' + pimg(30) + '</button>', 'display:flex;justify-content:center;align-items:center') +
          abs(CX - 150 - 60, 20 + Math.round(h3 * .52) - 22, 120, 44, lword('MENU', { open: 1 }), 'display:flex;justify-content:center') + abs(CX + 150 - 60, 20 + Math.round(h3 * .52) - 22, 120, 44, lword('CART', { n: CART_N }), 'display:flex;justify-content:center'); }
      case '04': { var w4 = 440, h4 = Math.round(265 * w4 / 1600), y4 = 22 + Math.round(h4 * .33);
        return plate('M12-notch', CX - w4 / 2, 22, w4, h4) + abs(CX - 26, y4 - 22, 52, 44, '<button type="button" class="pbtn"' + OPEN + ' aria-label="MENU">' + pimg(24) + '</button>', 'display:flex;justify-content:center;align-items:center') +
          abs(CX - 120 - 60, y4 - 22, 120, 44, lword('MENU', { open: 1 }), 'display:flex;justify-content:center') + abs(CX + 120 - 60, y4 - 22, 120, 44, lword('CART', { n: CART_N }), 'display:flex;justify-content:center'); }
      case '05': { var w5 = 400, h5 = Math.round(360 * w5 / 1600);
        return plate('M16-doubledeck', CX - w5 / 2, 14, w5, h5) + abs(CX - 70, 14 + Math.round(h5 * .14) - 11, 140, 22, '<img class="wmk" src="assets/wordmark.webp" width="96" height="17" alt="PEPTICITY" style="height:17px;width:96px">', 'display:flex;justify-content:center;align-items:center') +
          abs(CX - 80 - 60, 14 + Math.round(h5 * .53) - 22, 120, 44, lword('MENU', { open: 1 }), 'display:flex;justify-content:center') + abs(CX + 80 - 60, 14 + Math.round(h5 * .53) - 22, 120, 44, lword('CART', { n: CART_N }), 'display:flex;justify-content:center'); }
      case '06': return '<div class="row" style="top:30px">' + lkey('MENU', 'plat', { open: 1, w: 150, st: 'height:46px' }) + badge() + '</div>';
      case '07': return '<div class="row" style="top:30px">' + lkey('MENU', 'black', { open: 1, w: 150, st: 'height:46px' }) + badge() + '</div>';
      case '08': return '<div class="row" style="top:24px">' + med(68, pimg(34, 'spin'), { open: 1, badge: 1, cls: 'p8' }) + '</div>';
      case '09': return '<div class="row" style="top:24px"><button type="button" class="oct3"' + OPEN + ' aria-label="MENU"><i></i><i></i><i></i>' + badge() + '</button></div>';
      case '10': return '<div class="row" style="top:24px">' + med(68, '<i class="core"></i>', { open: 1, badge: 1, cls: 'pulse' }) + '</div>';
      case '11': { var p = SL.T01, s = 52 / (p.b[1] - p.b[0]), H = Math.round(p.h * s), cap = Math.round(p.s * s);
        return '<div class="row" style="top:22px"><button type="button" class="slk"' + OPEN + ' aria-label="PEPTICITY MENU" style="width:300px;height:' + H + 'px"><i class="pl9" style="border-image:url(assets/plates/T01-bar-clear.webp) 0 ' + p.s + ' 0 ' + p.s + ' fill / 0 ' + cap + 'px 0 ' + cap + 'px stretch"></i><img class="wmk" src="assets/wordmark.webp" width="146" height="26" alt="" style="height:26px;width:146px;margin-top:' + Math.round(-(H - (p.i[0] + p.i[1]) * s) / 2) + 'px">' + badge() + '</button></div>'; }
      case '12': { var q = SL.M03, s2 = 46 / (q.b[1] - q.b[0]), H2 = Math.round(q.h * s2), cap2 = Math.round(q.s * s2);
        return '<div class="row" style="top:22px"><button type="button" class="slk"' + OPEN + ' style="width:260px;height:' + H2 + 'px"><i class="pl9" style="border-image:url(assets/plates/M03-blade.webp) 0 ' + q.s + ' 0 ' + q.s + ' fill / 0 ' + cap2 + 'px 0 ' + cap2 + 'px stretch"></i><span class="lt" style="margin-top:' + Math.round(-(H2 - (q.i[0] + q.i[1]) * s2)) + 'px">MENU</span>' + badge() + '</button></div>'; }
      case '13': { var w13 = 260, h13 = Math.round(348 * w13 / 1600);
        return '<div class="row" style="top:20px"><button type="button" class="slk rods"' + OPEN + ' style="width:' + w13 + 'px;height:' + h13 + 'px"><i class="pl9" style="background:url(assets/plates/M05-rods.webp) center/100% 100% no-repeat"></i><span class="lt" style="margin-top:' + Math.round(-h13 * .12) + 'px">MENU</span>' + badge() + '</button></div>'; }
      case '14': return abs('max(16px, calc(50% - 488px))', 30, 160, 44, '<img class="wmk" src="assets/wordmark.webp" width="135" height="24" alt="PEPTICITY" style="height:24px;width:135px">', 'display:flex;align-items:center') +
        abs('min(calc(100% - 166px), calc(50% + 338px))', 22, 150, 60, '<button type="button" class="brk"' + OPEN + '><i class="bl"></i><span class="lt">MENU</span><i class="br"></i>' + badge() + '</button>');
      case '15': { var th = 150, tw = 48;
        return abs('0px', 24, tw + 4, th, '<button type="button" class="etab"' + OPEN + ' style="width:' + tw + 'px;height:' + th + 'px"><i class="pl9" style="border-image:url(assets/plates/M13-rail.webp) 90 80 90 80 / 12px 10px 12px 10px stretch"></i><span class="lt">MENU</span>' + badge() + '</button>'); }
    }
    return '';
  }
  var NEED = { '01': 420, '02': 660, '03': 470, '04': 470, '05': 430 };
  function menuStage(n) { return '<div class="lfit" data-need="' + (NEED[n] || 0) + '"><div class="lstage" data-launch="' + n + '">' + launcher(n) + '<p class="ddh" aria-hidden="true">PRESS IT</p></div></div>'; }
  var SL = { T01: { h: 247, b: [5, 170], i: [25, 149], s: 80 }, M03: { h: 195, b: [5, 138], i: [25, 118], s: 70 } };
  /* ---------------- the option block ---------------- */
  function opt(tab, n, name, sample, wide) {
    return '<article class="opt" data-tab="' + tab + '" data-n="' + n + '" aria-labelledby="h-' + tab + n + '">' +
      '<div class="no chr" aria-hidden="true">' + n + '</div><h3 class="nm face" id="h-' + tab + n + '"><span class="sr">' + tab.toUpperCase() + ' ' + n + ': </span>' + name + '</h3>' +
      '<div class="sample">' + (wide ? '<div class="fit">' + sample + '</div>' : sample) + '</div>' +
      '<button type="button" class="pk" data-pick="' + tab + '" data-n="' + n + '" aria-pressed="false"><span>PICK</span></button><i class="lens mark" aria-hidden="true"></i></article>';
  }

  /* ---------------- how it opens (tab 3) ---------------- */
  var DD_NAMES = ['THE SHEET', 'THE APERTURE', 'THE MORPH', 'THE ORBIT', 'THE SHELF', 'THE DECK', 'THE DIRECTORY', 'THE DEPTH'];
  function vimg(p, h, cls) { var w = Math.round(h * 300 / 568); return '<img class="vial' + (cls ? ' ' + cls : '') + '" src="assets/vials/' + p.sku + '.webp" width="' + w + '" height="' + h + '" alt="' + esc(p.name) + '" style="width:' + w + 'px;height:' + h + 'px">'; }
  function item(p, extra) { return '<button type="button" class="it" data-sku="' + p.sku + '"' + (extra || '') + '><span>' + esc(p.name) + '</span></button>'; }
  function closeKey() { return btn('CLOSE', 'auto', { sm: 1, attrs: ' data-close' }); }
  function words(list) { return list.map(function (w) { return '<p class="dw">' + w + '</p>'; }).join(''); }
  // what each destination holds (short, no claims)
  function destInside(d, big) {
    var vh = big ? 230 : 120;
    switch (d) {
      case 'SHOP': return '<div class="di">' + vimg(BY['bpc-157'], vh) + words(GROUPS.map(function (g) { return g.head; })) + '</div>';
      case 'PEPTIDES': return '<div class="di">' + GROUPS.map(function (g) { return '<p class="dw hd">' + g.head + '</p>' + (big ? g.items.slice(0, 3).map(function (p) { return '<p class="dw sm">' + esc(p.name) + '</p>'; }).join('') : ''); }).join('') + '</div>';
      case 'RESEARCH': return '<div class="di">' + pimg(big ? 120 : 64) + words(['CERTIFICATES', 'LAB NOTES']) + '</div>';
      case 'ABOUT': return '<div class="di"><img class="wmk" src="assets/wordmark.webp" width="' + (big ? 220 : 120) + '" height="' + (big ? 39 : 21) + '" alt="" style="width:' + (big ? 220 : 120) + 'px;height:' + (big ? 39 : 21) + 'px;margin:0 auto 14px">' + words(['OUR STORY', 'CONTACT']) + '</div>';
      case 'FOUNDERS': return '<div class="di"><img src="assets/card-on.webp" width="' + (big ? 300 : 124) + '" height="' + (big ? 155 : 64) + '" alt="" style="width:' + (big ? 300 : 124) + 'px;height:' + (big ? 155 : 64) + 'px;margin:0 auto 12px">' + words(['25 PLATINUM CARDS']) + '</div>';
      case 'CART': return '<div class="di"><div style="display:flex;justify-content:center;gap:8px">' + vimg(BY['bpc-157'], big ? 170 : 84) + vimg(BY['ghk-cu'], big ? 170 : 84) + '</div>' + words([CART_N + ' IN YOUR CART']) + '</div>';
    }
    return '';
  }
  var DEST_PIC = {};
  function ghost() {
    return '<div class="pg mo" aria-hidden="true"><i class="pgbg"></i><div class="ghost"><p class="ey chr">PEPTICITY</p><p class="big chr" style="font-size:54px;margin-top:14px">GRAND OPENING</p><i class="lens" style="width:360px;margin:16px auto 22px"></i><img src="assets/card-on.webp" width="330" height="170" alt="" style="width:330px;height:170px;margin:0 auto"></div></div>';
  }
  function ddStage(n, launchN, uid) {
    var inner = '';
    switch (n) {
      case '01': inner = '<div class="sheet in-menu mo"><i class="glass deep"></i><i class="p1" style="position:absolute;inset:0"></i>' +
        '<div class="drow">' + DEST.map(function (d) { return '<button type="button" class="dk' + (d === 'PEPTIDES' ? ' hot' : '') + '"><span>' + d + '</span></button>'; }).join('') + '</div><i class="lens" style="width:70%;margin:6px auto 16px"></i>' +
        '<div class="cols4">' + GROUPS.map(function (g) { return '<div><p class="gh">' + g.head + '</p><i class="lens"></i>' + g.items.map(function (p) { return item(p, ''); }).join('') + '</div>'; }).join('') + '</div>' +
        '<div style="display:flex;justify-content:center;margin-top:14px">' + closeKey() + '</div></div>'; break;
      case '02': inner = '<div class="apw in-menu"><i class="glass deep" style="clip-path:none"></i><i class="p1" style="position:absolute;inset:14px"></i>' +
        '<div class="apl">' + DEST.map(function (d, i) { return '<button type="button" class="aw mo" data-dest="' + d + '" style="--i:' + i + '"><span class="chr">' + d + '</span><i class="lens mo"></i></button>'; }).join('') + '</div>' +
        '<div class="apr" data-pic>' + destInside('SHOP', true) + '</div><div class="apc">' + closeKey() + '</div></div>'; break;
      case '03': inner = '<div class="mph" aria-hidden="true"><i class="mg"></i><i class="mp tl"></i><i class="mp tr"></i><i class="mp bl"></i><i class="mp br"></i><i class="mp te"></i><i class="mp be"></i><i class="mp le"></i><i class="mp re"></i></div>' +
        '<div class="mpc in-menu"><div class="drow big">' + DEST.map(function (d) { return '<button type="button" class="dk' + (d === 'PEPTIDES' ? ' hot' : '') + '" data-dest="' + d + '"><span>' + d + '</span></button>'; }).join('') + '</div><i class="lens" style="width:60%;margin:4px auto 18px"></i>' +
        '<div class="cols4">' + GROUPS.map(function (g) { return '<div><p class="gh">' + g.head + '</p><i class="lens"></i>' + g.items.slice(0, 4).map(function (p) { return item(p, ''); }).join('') + '</div>'; }).join('') + '</div>' +
        '<div style="display:flex;justify-content:center;margin-top:12px">' + closeKey() + '</div></div>'; break;
      case '04': {
        var vs = []; GROUPS.forEach(function (g) { g.items.slice(0, 3).forEach(function (p) { vs.push(p); }); });
        inner = '<div class="orb in-menu"><i class="glass deep" style="clip-path:none"></i><i class="ringfloor"></i><div class="ringwrap"><div class="ring">' +
          vs.map(function (p, i) { return '<div class="rv" data-t="' + (i * 360 / vs.length) + '" style="--t:' + (i * 360 / vs.length) + 'deg">' + vimg(p, 106) + '</div>'; }).join('') + '<div class="rc">' + pimg(150) + '</div></div></div>' +
          DEST.map(function (d, i) { var left = i < 3, row = i % 3; return '<div class="od mo" style="' + (left ? 'left:70px' : 'right:70px') + ';top:' + (180 + row * 112) + 'px;--i:' + i + '">' + lkey(d, 'plat', { w: 170, st: 'height:46px' }).replace('class="lk', 'data-dest="' + d + '" data-turn="' + i + '" class="lk') + '</div>'; }).join('') +
          '<p class="ocap" data-cap aria-live="polite"></p><div class="apc">' + closeKey() + '</div></div>'; break; }
      case '05': {
        var sv = []; GROUPS.forEach(function (g) { g.items.forEach(function (p) { sv.push(p); }); });
        var vh = 104, sw = 1000, sy = 380, sh = Math.round(224 * sw / 1600);
        inner = '<div class="shelf in-menu"><div class="srow mo">' + DEST.map(function (d) { return '<button type="button" class="dk' + (d === 'PEPTIDES' ? ' hot' : '') + '"><span>' + d + '</span></button>'; }).join('') + '</div><i class="lens mo" style="position:absolute;left:12%;right:12%;top:196px"></i>' +
          '<div class="sp mo" style="left:' + (W - sw) / 2 + 'px;top:' + sy + 'px;width:' + sw + 'px;height:' + sh + 'px"></div>' +
          '<div class="sv mo" style="top:' + (sy - vh + 22) + 'px">' + sv.map(function (p) { return '<button type="button" class="vbtn" data-sku="' + p.sku + '" aria-label="' + esc(p.name) + '">' + vimg(p, vh) + '<span class="nm2" aria-hidden="true">' + esc(p.name) + '</span></button>'; }).join('') + '</div>' +
          '<div class="apc" style="bottom:22px">' + closeKey() + '</div></div>'; break; }
      case '06': inner = '<div class="deck in-menu">' + DEST.map(function (d, i) {
          return '<div class="dc mo" style="left:' + (CX - 3 * 160 + i * 160 + 7) + 'px;--i:' + i + '"><button type="button" class="dcb" aria-pressed="false" data-dest="' + d + '"><span class="fr"><i class="glass"></i><i class="c1s"></i><b class="chr">' + pad(i + 1) + '</b><span class="dn">' + d + '</span><i class="lens"></i></span><span class="bk"><i class="glass deep"></i><i class="c1s"></i>' + destInside(d, false) + '</span></button></div>'; }).join('') +
        '<div class="apc" style="bottom:40px">' + closeKey() + '</div></div>'; break;
      case '07': inner = '<div class="dir in-menu mo"><i class="glass deep"></i><i class="p1" style="position:absolute;inset:0"></i><p class="face chr dtitle">PEPTI-CITY</p><i class="lens" style="position:absolute;left:32%;right:32%;top:62px"></i>' +
        '<div class="floors"><i class="lens v lift" data-lift></i>' + DEST.map(function (d, i) { return '<button type="button" class="floor' + (i === 0 ? ' on' : '') + '" data-floor="' + i + '"><b class="chr">' + pad(i + 1) + '</b><span>' + d + '</span></button>'; }).join('') + '</div>' +
        '<div class="fview" data-fview>' + destInside('SHOP', true) + '</div><div class="apc" style="bottom:22px">' + closeKey() + '</div></div>'; break;
      case '08': inner = '<div class="dep in-menu"><div class="depp mo"><i class="glass deep"></i><i class="p1" style="position:absolute;inset:0"></i><div class="dgrid">' +
        DEST.map(function (d, i) { return '<button type="button" class="aw" data-dest="' + d + '"><span class="chr">' + d + '</span><i class="lens"></i></button>'; }).join('') + '</div><div style="display:flex;justify-content:center;margin-top:8px">' + closeKey() + '</div></div></div>'; break;
    }
    return '<div class="stage ostage" data-op="' + n + '" data-l="' + launchN + '">' + ghost() + '<div class="ln mo">' + launcher(launchN) + '</div>' + inner + '<p class="ddh" aria-hidden="true">PRESS THE MENU</p></div>';
  }
  /* ---------------- cards (GRAND OPENING) ---------------- */
  var CARD_NAMES = ['CENTRE STACK', 'CARD CENTREPIECE', 'TRIPTYCH', 'MARQUEE', 'VIAL AXIS'];
  function frameCard(wd, ht, inner, extra) { return '<div class="card" data-symroot style="width:' + wd + 'px;height:' + ht + 'px;' + (extra || '') + '"><i class="glass"></i><i class="c1"></i>' + inner + '</div>'; }
  function cardStage(n) {
    var html = '';
    var claim = btn('CLAIM MY CARD', 'auto', { attrs: ' data-c' }), line = btn('SEE THE LINEUP', 'auto');
    switch (n) {
      case '01': html = frameCard(1000, 560, '<div style="position:absolute;inset:66px 40px 0;display:flex;flex-direction:column;align-items:center">' +
        '<p class="ey chr" data-c>PEPTICITY</p><p class="big chr" data-c style="margin-top:18px">GRAND OPENING</p><i class="lens" data-c style="width:440px;margin:20px 0"></i>' +
        '<p class="offer chr" data-c>25 PLATINUM CARDS · 10% OFF FOR LIFE</p><ul class="hooks" data-c style="margin-top:34px"><li data-pair="h:L">YOUR NAME ENGRAVED</li><li data-c>NUMBERED 01 TO 25</li><li data-pair="h:R">FIRST ACCESS TO EVERY LOT</li></ul>' +
        '<div class="keys2" data-c style="margin-top:40px"><div data-pair="k:L">' + btn('CLAIM MY CARD', 'auto') + '</div><div data-pair="k:R">' + line + '</div></div></div>'); break;
      case '02': html = frameCard(1000, 600, '<div style="position:absolute;inset:50px 40px 0;display:flex;flex-direction:column;align-items:center">' +
        '<p class="ey chr" data-c>PEPTICITY</p><p class="big chr" data-c style="font-size:52px;margin-top:12px">GRAND OPENING</p><i class="lens" data-c style="width:360px;margin:14px 0 22px"></i>' +
        '<img data-c src="assets/card-on.webp" width="430" height="221" alt="The PEPTICITY Platinum Founders Reserve member card" style="width:430px;height:221px;filter:drop-shadow(0 18px 20px rgba(0,0,0,.6)) drop-shadow(0 6px 18px rgba(42,120,255,.25))">' +
        '<div data-c style="margin-top:34px">' + claim + '</div></div>' +
        '<div class="pillar" data-pair="p:L" style="position:absolute;left:60px;top:250px;width:190px"><b class="chr">25</b><span>NUMBERED CARDS</span><i class="lens"></i></div>' +
        '<div class="pillar" data-pair="p:R" style="position:absolute;right:60px;top:250px;width:190px"><b class="chr">10%</b><span>OFF FOR LIFE</span><i class="lens"></i></div>'); break;
      case '03': html = '<div data-symroot style="position:relative;width:1000px;height:470px;margin:0 auto">' +
        '<div class="card" data-pair="t:L" style="position:absolute;left:0;top:70px;width:270px;height:330px"><i class="glass"></i><i class="c1s"></i><div class="pillar" style="position:absolute;left:0;right:0;top:84px"><b class="chr" style="font-size:70px">25</b><span>PLATINUM CARDS</span><i class="lens"></i></div></div>' +
        '<div class="card" data-c style="position:absolute;left:290px;top:0;width:420px;height:470px"><i class="glass"></i><i class="c1"></i><div style="position:absolute;inset:70px 30px 0;display:flex;flex-direction:column;align-items:center">' +
        '<p class="ey chr" data-c>PEPTICITY</p><p class="big chr" data-c style="font-size:54px;margin-top:22px;text-align:center">GRAND<br>OPENING</p><i class="lens" data-c style="width:250px;margin:22px 0 34px"></i><div data-c>' + claim + '</div></div></div>' +
        '<div class="card" data-pair="t:R" style="position:absolute;right:0;top:70px;width:270px;height:330px"><i class="glass"></i><i class="c1s"></i><div class="pillar" style="position:absolute;left:0;right:0;top:84px"><b class="chr" style="font-size:70px">10%</b><span>OFF FOR LIFE</span><i class="lens"></i></div></div></div>'; break;
      case '04': html = '<div data-symroot style="position:relative;width:1000px;margin:0 auto">' + frameCard(1000, 270, '<div style="position:absolute;inset:44px 40px 0;display:flex;flex-direction:column;align-items:center">' +
        '<p class="big chr" data-c style="font-size:58px;letter-spacing:.16em;padding-left:.16em">GRAND OPENING</p><i class="lens" data-c style="width:520px;margin:12px 0 20px"></i><div data-c>' + claim + '</div></div>') +
        '<div data-c style="display:grid;grid-template-columns:repeat(3,300px);justify-content:center;gap:0 26px;margin-top:40px"><div class="chip" data-pair="c:L">25 PLATINUM CARDS</div><div class="chip" data-c>10% OFF FOR LIFE</div><div class="chip" data-pair="c:R">YOUR NAME ENGRAVED</div></div></div>'; break;
      case '05': html = frameCard(1000, 600, '<i class="vglow" style="top:330px;width:420px;height:120px"></i><img data-c src="assets/vial-front-clear.webp" width="260" height="345" alt="A PEPTICITY vial" style="position:absolute;left:370px;top:34px;width:260px;height:345px;filter:drop-shadow(0 0 26px rgba(42,120,255,.45)) drop-shadow(0 16px 18px rgba(0,0,0,.55))">' +
        '<p class="big chr" data-pair="g:L" style="position:absolute;right:calc(50% + 118px);top:172px;width:330px;text-align:right;font-size:58px">GRAND</p><p class="big chr" data-pair="g:R" style="position:absolute;left:calc(50% + 118px);top:172px;width:330px;text-align:left;font-size:58px">OPENING</p>' +
        '<div style="position:absolute;left:0;right:0;top:392px;display:flex;flex-direction:column;align-items:center"><i class="lens" data-c style="width:420px;margin-bottom:18px"></i><p class="offer chr" data-c>25 PLATINUM CARDS · 10% OFF FOR LIFE</p><div data-c style="margin-top:28px">' + claim + '</div></div>'); break;
    }
    return '<div class="stage cstage" data-card="' + n + '" style="padding:24px 28px 40px">' + html + '</div>';
  }

  /* ---------------- founders page ---------------- */
  var FOUNDERS_NAMES = ['THE VAULT', 'THE PATH', 'THE STAGE'];
  var ACC = [['WHAT IT IS', ['25 numbered platinum cards.', 'Your name engraved.', 'One per person.']],
    ['WHAT YOU GET', ['10% off for life, once your card is active.', 'First access to every new lot.', 'Your number, 01 to 25, yours for good.']],
    ['HOW TO ACTIVATE', ['1. Get your card: tell us the name for it.', '2. Share PEPTICITY on one social platform.', '3. Refer 2 friends who sign up.']],
    ['THE RULES', ['Until steps 2 and 3 are done the card is not active and gives no discount.', 'One card per person. Adults only: 19+, 21+ in the United States.', 'Numbers go to the first 25 cards that go active.']]];
  var STEPS = ['GET YOUR CARD', 'SHARE ON 1 SOCIAL', 'REFER 2 FRIENDS'];
  function fCard(k, wd) {
    wd = wd || 520;
    return '<div class="mcard" data-c data-on="0" style="width:' + wd + 'px"><img src="assets/card-on.webp" width="' + wd + '" height="' + Math.round(wd * 515 / 1000) + '" alt="PEPTICITY Platinum Founders Reserve card, NO. 08 of 25"><img class="off" src="assets/card-off.webp" width="' + wd + '" height="' + Math.round(wd * 515 / 1000) + '" alt=""><i class="floorlight"></i></div>' +
      '<p class="tag" data-tag data-c aria-live="polite">NOT ACTIVE YET</p><div class="flip" data-c>' + btn('SEE IT ACTIVE', 'auto', { sm: 1, attrs: ' data-flip aria-pressed="false"' }) + '</div>';
  }
  function fSteps(path) {
    return '<ol class="steps' + (path ? ' pathsteps' : '') + '" data-c' + (path ? ' style="grid-template-columns:320px;gap:46px 0"' : '') + '>' + STEPS.map(function (s, i) {
      return '<li class="' + (i === 0 ? 'lit' : '') + '"' + (path ? '' : (i === 0 ? ' data-pair="s:L"' : i === 2 ? ' data-pair="s:R"' : ' data-c')) + '>' + (path ? '<i class="node"></i>' : '') + '<b class="chr">' + (i + 1) + '</b><span>' + s + '</span><i class="lens"></i></li>'; }).join('') + '</ol>';
  }
  function accKey(i, k) { return '<button type="button" class="ak" aria-expanded="false" aria-controls="' + k + '-ap' + i + '" data-acc="' + i + '"><span>' + ACC[i][0] + '</span></button>'; }
  function accPanel(i, k) { return '<div class="ap" id="' + k + '-ap' + i + '" role="region" aria-label="' + ACC[i][0] + '" hidden><ul>' + ACC[i][1].map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul></div>'; }
  function fForm(k, framed) {
    return '<div class="form" data-c>' + (framed ? '<i class="glass"></i><i class="p1" style="position:absolute;inset:0"></i>' : '') +
      '<p class="q chr" data-c>WHAT NAME WOULD YOU LIKE ON THE CARD?</p><div class="fld"><label class="sr" for="' + k + '-nm">Name for the card</label><input id="' + k + '-nm" name="card-name" autocomplete="name" maxlength="28"></div>' +
      '<div data-c style="display:flex;justify-content:center;margin-bottom:34px">' + btn('ENGRAVE MY CARD', 'auto', { sm: 1 }) + '</div>' +
      '<p class="q chr" data-c>WHERE DO WE SEND YOUR CARD?</p><div class="fld"><label for="' + k + '-em">EMAIL</label><input id="' + k + '-em" type="email" name="email" autocomplete="email"></div>' +
      '<div class="fld"><label for="' + k + '-ph">PHONE</label><input id="' + k + '-ph" type="tel" name="phone" autocomplete="tel"></div>' +
      '<label class="cons"><input type="checkbox" name="consent-email"><span>Yes, PEPTICITY may email me my FOUNDERS RESERVE card and PEPTICITY news. I can unsubscribe any time.</span></label>' +
      '<label class="cons"><input type="checkbox" name="consent-text"><span>Yes, PEPTICITY may text me about my card and restocks. I can stop any time.</span></label>' +
      '<div data-c style="display:flex;justify-content:center;margin-top:28px">' + btn('SEND MY CARD', 'auto', { attrs: ' data-send' }) + '</div><p class="tag" data-said data-c style="min-height:12px;margin-top:14px" role="status"></p></div>';
  }
  function fRefer() {
    var ks = ['EMAIL', 'TEXT', 'FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'COPY MY LINK'];
    return '<p class="fh chr" data-c>REFER A FRIEND</p><div class="refer" data-c>' + ks.map(function (s, i) { return '<div' + (i === 0 ? ' data-pair="r:L"' : i === 5 ? ' data-pair="r:R"' : '') + '>' + btn(s, 'auto', { sm: 1 }) + '</div>'; }).join('') + '</div>';
  }
  function foundersStage(n) {
    var k = 'f' + n, h = '';
    var title = '<img class="ftitle" data-c src="assets/title.webp" width="640" height="183" alt="PEPTICITY PLATINUM FOUNDERS RESERVE">';
    if (n === '01') {
      h = title + '<div class="blk" data-c style="margin-top:44px">' + fCard(k) + '</div><div class="blk">' + fSteps() + '</div>' +
        '<div class="blk" data-c style="width:720px;margin-left:auto;margin-right:auto"><div style="display:grid;grid-template-columns:350px 350px;gap:16px 20px;justify-content:center">' + [0, 1, 2, 3].map(function (i) { return '<div' + (i % 2 ? ' data-pair="a' + i + ':R"' : ' data-pair="a' + (i + 1) + ':L"') + '>' + accKey(i, k) + '</div>'; }).join('') + '</div>' +
        '<div style="width:640px;margin:0 auto">' + [0, 1, 2, 3].map(function (i) { return accPanel(i, k); }).join('') + '</div></div>' +
        '<div class="blk">' + fForm(k, true) + '</div><div class="blk">' + fRefer() + '</div>';
    } else if (n === '02') {
      h = title + '<div class="blk" data-c style="margin-top:44px">' + fCard(k, 480) + '</div>' +
        '<div style="position:relative;margin-top:30px"><i class="lens v vline" data-c style="top:0;bottom:0"></i><div style="padding:40px 0">' + fSteps(true) + '</div></div>' +
        '<div class="acc" data-c style="display:grid;gap:14px;margin-top:10px">' + [0, 1, 2, 3].map(function (i) { return '<div>' + accKey(i, k) + accPanel(i, k) + '</div>'; }).join('') + '</div>' +
        '<div style="position:relative;height:70px"><i class="lens v vline" data-c style="top:6px;bottom:0"></i></div>' +
        '<div>' + fForm(k, true) + '</div><div class="blk">' + fRefer() + '</div>';
    } else {
      h = title + '<div class="blk" data-c style="position:relative;margin-top:40px;width:860px;margin-left:auto;margin-right:auto">' +
        '<i class="vglow" style="top:270px;width:640px;height:110px"></i>' + fCard(k, 500).replace('<p class="tag"', '<div style="position:relative;width:860px;height:118px;margin:-30px auto 0;background:url(assets/plates/P2-shelf.webp) center top/860px auto no-repeat" data-c></div><p class="tag"') + '</div>' +
        '<div class="blk"><div class="steps" data-c style="grid-template-columns:repeat(3,270px);gap:0 22px">' + STEPS.map(function (s, i) {
          return '<div class="plaque' + (i === 0 ? ' lit' : '') + '"' + (i === 0 ? ' data-pair="pl:L"' : i === 2 ? ' data-pair="pl:R"' : ' data-c') + '><i class="glass" style="clip-path:polygon(14px 0,calc(100% - 14px) 0,100% 14px,100% calc(100% - 14px),calc(100% - 14px) 100%,14px 100%,0 calc(100% - 14px),0 14px)"></i><i class="p1" style="border-image-width:22px 22px 26px 22px"></i><b class="chr">' + (i + 1) + '</b><span>' + s + '</span><i class="lens"></i></div>'; }).join('') + '</div></div>' +
        '<div class="blk" data-c><div class="tabsrow">' + [0, 1, 2, 3].map(function (i) { return '<div' + (i === 0 ? ' data-pair="tb:L"' : i === 3 ? ' data-pair="tb:R"' : '') + '>' + accKey(i, k) + '</div>'; }).join('') + '</div>' +
        '<div style="width:700px;margin:12px auto 0;position:relative">' + [0, 1, 2, 3].map(function (i) { return accPanel(i, k); }).join('') + '</div></div>' +
        '<div class="blk">' + fForm(k, false) + '</div><div class="blk">' + fRefer() + '</div>';
    }
    return '<div class="stage fstage" data-founders="' + n + '" data-symroot>' + h + '</div>';
  }

  /* ---------------- build the tabs ---------------- */
  var TABS = [['buttons', 'button', 'BUTTONS', 25], ['menus', 'menu', 'MENUS', 15], ['drop-downs', 'dropdown', 'HOW IT OPENS', 8], ['cards', 'card', 'CARDS', 5], ['founders', 'founders', 'FOUNDERS PAGE', 3]];
  var READY = { buttons: false, cards: false, founders: false };
  function soon(id) { $(id).innerHTML = '<p class="soon face">COMING NEXT</p>'; }
  function build() {
    var h = '';
    if (READY.buttons) { for (var i = 1; i <= 25; i++) h += opt('button', pad(i), BTN_NAMES[i - 1], btn('CLAIM MY CARD', pad(i))); $('#g-buttons').innerHTML = h; } else soon('#g-buttons');
    h = ''; for (i = 1; i <= 15; i++) h += opt('menu', pad(i), MENU_NAMES[i - 1], menuStage(pad(i)), false);
    $('#g-menus').innerHTML = h;
    $$('.lstage [data-open]').forEach(function (t) { t.addEventListener('click', function () { openPop(t.closest('.lstage').getAttribute('data-launch'), t); }); });
    buildDD();
    if (READY.cards) { h = ''; for (i = 1; i <= 5; i++) h += opt('card', pad(i), CARD_NAMES[i - 1], cardStage(pad(i)), true); $('#g-cards').innerHTML = h; } else soon('#g-cards');
    if (READY.founders) { h = ''; for (i = 1; i <= 3; i++) h += opt('founders', pad(i), FOUNDERS_NAMES[i - 1], foundersStage(pad(i)), true); $('#g-founders').innerHTML = h; } else soon('#g-founders');
    $$('.fstage .plaque b').forEach(function (b) { b.style.cssText = 'display:block;font:400 40px/1 var(--face)'; });
    $$('.fstage .plaque span').forEach(function (s) { s.style.cssText = 'display:block;margin-top:10px;font:400 12px/1.4 var(--face);letter-spacing:.18em'; });
  }
  function buildDD() {
    var h = ''; for (var i = 1; i <= 8; i++) h += opt('dropdown', pad(i), DD_NAMES[i - 1], ddStage(pad(i), eff('menu'), 'dd' + pad(i)), true);
    $('#g-drop-downs').innerHTML = h;
    $$('#g-drop-downs .ostage').forEach(wireOp);
  }

  /* ---------------- opening behaviour ---------------- */
  var RM = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  function rel(st, el) {
    var sr = st.getBoundingClientRect(), r = el.getBoundingClientRect(), s = sr.width / W || 1;
    return { x: (r.left - sr.left) / s, y: (r.top - sr.top) / s, w: r.width / s, h: r.height / s };
  }
  function octo(cx, cy, r) {
    var k = r * 0.414;
    return 'polygon(' + [[cx - k, cy - r], [cx + k, cy - r], [cx + r, cy - k], [cx + r, cy + k], [cx + k, cy + r], [cx - k, cy + r], [cx - r, cy + k], [cx - r, cy - k]].map(function (p) { return p[0].toFixed(1) + 'px ' + p[1].toFixed(1) + 'px'; }).join(', ') + ')';
  }
  function instant(els, fn) { els.forEach(function (e) { e.style.transition = 'none'; }); fn(); void document.body.offsetWidth; els.forEach(function (e) { e.style.transition = ''; }); }
  var MP = { x: 88, y: 112, w: 880, h: 452 }, MK = 0.18;
  function morphPlace(st, k, on) {
    var cs = 100 * MK, cb = 110 * MK, bw = 1600 * MK, bh = 795 * MK, P = MP;
    var E = P.w - 2 * cs, V = P.h - cs - cb, bgW = E * 1600 / 1400, bgH = V * 795 / 585;
    var set = function (cls, l, t, w, h, bg, tf) { var e = $('.mp.' + cls, st); e.style.cssText = 'left:' + l + 'px;top:' + t + 'px;width:' + w + 'px;height:' + h + 'px;' + bg + 'transform:' + (on ? 'none' : tf) + (e.style.transition ? ';transition:' + e.style.transition : ''); };
    var kx = k.x, ky = k.y, kw = Math.max(k.w, 2 * cs + 2), kh = Math.max(k.h, cs + cb + 2);
    var sx = (kw - 2 * cs) / E, sy = (kh - cs - cb) / V;
    var tl = 'translate(' + (kx - P.x) + 'px,' + (ky - P.y) + 'px)';
    var tr = 'translate(' + (kx + kw - P.x - P.w) + 'px,' + (ky - P.y) + 'px)';
    var bl = 'translate(' + (kx - P.x) + 'px,' + (ky + kh - P.y - P.h) + 'px)';
    var br = 'translate(' + (kx + kw - P.x - P.w) + 'px,' + (ky + kh - P.y - P.h) + 'px)';
    var img = 'background-image:url(assets/plates/P1-panel.webp);background-repeat:no-repeat;';
    set('tl', P.x, P.y, cs, cs, img + 'background-size:' + bw + 'px ' + bh + 'px;background-position:0 0;', tl);
    set('tr', P.x + P.w - cs, P.y, cs, cs, img + 'background-size:' + bw + 'px ' + bh + 'px;background-position:100% 0;', tr);
    set('bl', P.x, P.y + P.h - cb, cs, cb, img + 'background-size:' + bw + 'px ' + bh + 'px;background-position:0 100%;', bl);
    set('br', P.x + P.w - cs, P.y + P.h - cb, cs, cb, img + 'background-size:' + bw + 'px ' + bh + 'px;background-position:100% 100%;', br);
    set('te', P.x + cs, P.y, E, cs, img + 'background-size:' + bgW + 'px ' + bh + 'px;background-position:' + (-100 / 1600 * bgW) + 'px 0;transform-origin:0 0;', tl + ' scaleX(' + sx + ')');
    set('be', P.x + cs, P.y + P.h - cb, E, cb, img + 'background-size:' + bgW + 'px ' + bh + 'px;background-position:' + (-100 / 1600 * bgW) + 'px 100%;transform-origin:0 0;', bl + ' scaleX(' + sx + ')');
    set('le', P.x, P.y + cs, cs, V, img + 'background-size:' + bw + 'px ' + bgH + 'px;background-position:0 ' + (-100 / 795 * bgH) + 'px;transform-origin:0 0;', tl + ' scaleY(' + sy + ')');
    set('re', P.x + P.w - cs, P.y + cs, cs, V, img + 'background-size:' + bw + 'px ' + bgH + 'px;background-position:100% ' + (-100 / 795 * bgH) + 'px;transform-origin:0 0;', tr + ' scaleY(' + sy + ')');
    var g = $('.mg', st), c = 14;
    var poly = function (x, y, w, h) { return 'polygon(' + [[x + c, y], [x + w - c, y], [x + w, y + c], [x + w, y + h - c], [x + w - c, y + h], [x + c, y + h], [x, y + h - c], [x, y + c]].map(function (p) { return p[0] + 'px ' + p[1] + 'px'; }).join(',') + ')'; };
    g.style.clipPath = on ? poly(P.x + 4, P.y + 4, P.w - 8, P.h - 8) : poly(kx + 2, ky + 2, kw - 4, kh - 4);
  }
  var orbits = [];
  function orbitLoop() {
    orbits = orbits.filter(function (o) { return o.st.classList.contains('open') && document.body.contains(o.st); });
    orbits.forEach(function (o) {
      if (o.target !== null) { var d = ((o.target - o.a + 540) % 360) - 180; o.a += d * 0.07; } else if (!RM.matches) o.a += 0.12;
      o.ring.style.setProperty('--a', o.a.toFixed(2) + 'deg');
      if (!o.vs) o.vs = $$('.rv', o.ring).map(function (v) { return [v, +v.getAttribute('data-t')]; });
      o.vs.forEach(function (x) { var z = Math.cos((x[1] + o.a) * Math.PI / 180); x[0].style.opacity = (.35 + .65 * (z + 1) / 2).toFixed(3); });
    });
    if (orbits.length) requestAnimationFrame(orbitLoop);
  }
  function openOp(st, on, trig) {
    if (on === st.classList.contains('open')) return;
    var n = st.getAttribute('data-op');
    var tr = trig || st._trig || $('[data-open]', st); st._trig = tr;
    var k = rel(st, tr);
    if (n === '02') {
      var aw = $('.apw', st), cx = k.x + k.w / 2, cy = k.y + k.h / 2;
      if (on) { instant([aw], function () { aw.style.clipPath = octo(cx, cy, 6); }); aw.style.clipPath = octo(cx, cy, 1500); }
      else aw.style.clipPath = octo(cx, cy, 6);
    }
    if (n === '03') {
      var ps = $$('.mp, .mg', st);
      if (on) { instant(ps, function () { morphPlace(st, k, false); }); morphPlace(st, k, true); } else morphPlace(st, k, false);
    }
    if (n === '06') {
      $$('.dc', st).forEach(function (c) { var l = parseFloat(c.style.left) + 70; c.style.setProperty('--dx', (k.x + k.w / 2 - l) + 'px'); c.style.setProperty('--dy', (k.y + k.h / 2 - 300) + 'px'); });
      if (!on) $$('.dcb', st).forEach(function (b) { b.classList.remove('flip'); b.setAttribute('aria-pressed', 'false'); });
    }
    st.classList.toggle('open', on);
    $$('[data-open]', st).forEach(function (t) { t.setAttribute('aria-expanded', on ? 'true' : 'false'); });
    if (on) {
      if (n === '04') { var ring = $('.ring', st); orbits.push({ st: st, ring: ring, a: parseFloat(ring.style.getPropertyValue('--a')) || 0, target: null }); st._orb = orbits[orbits.length - 1]; if (orbits.length === 1) requestAnimationFrame(orbitLoop); }
      if (n === '07') setFloor(st, 0);
      watchButtons(st);
      setTimeout(function () { var f = $('.in-menu button', st); if (f) f.focus({ preventScroll: true }); }, RM.matches ? 30 : 260);
    } else {
      var mn = $('.in-menu', st);
      if (mn && mn.contains(document.activeElement) || !document.activeElement || document.activeElement === document.body) tr.focus({ preventScroll: true });
      if (st._onclose) st._onclose();
    }
  }
  function setFloor(st, i) {
    $$('.floor', st).forEach(function (f, j) { f.classList.toggle('on', i === j); });
    var l = $('[data-lift]', st); if (l) l.style.transform = 'translateY(' + (i * 52) + 'px)';
    var v = $('[data-fview]', st); if (v) v.innerHTML = destInside(DEST[i], true);
  }
  function wireOp(st) {
    $$('[data-open]', st).forEach(function (t) { t.addEventListener('click', function (e) { e.stopPropagation(); openOp(st, !st.classList.contains('open'), t); }); });
    $$('[data-close]', st).forEach(function (c) { c.addEventListener('click', function (e) { e.stopPropagation(); openOp(st, false); }); });
    st.addEventListener('click', function (e) { if (st.classList.contains('open') && !e.target.closest('button, a, input, label, .ln, .sheet, .mpc, .dir, .depp, .di, .apr, .dc')) openOp(st, false); });
    $$('.aw[data-dest]', st).forEach(function (a) { var f = function () { $$('.aw', st).forEach(function (x) { x.classList.toggle('on', x === a); }); var p = $('[data-pic]', st); if (p) p.innerHTML = destInside(a.getAttribute('data-dest'), true); }; a.addEventListener('mouseenter', f); a.addEventListener('focus', f); });
    $$('[data-turn]', st).forEach(function (b) {
      var i = +b.getAttribute('data-turn');
      b.addEventListener('mouseenter', function () { if (st._orb) st._orb.target = -i * 60; });
      b.addEventListener('focus', function () { if (st._orb) st._orb.target = -i * 60; });
      b.addEventListener('mouseleave', function () { if (st._orb) st._orb.target = null; });
      b.addEventListener('click', function () { var c = $('[data-cap]', st); c.innerHTML = '<span class="chr">' + DEST[i] + '</span>'; });
    });
    $$('.dcb', st).forEach(function (b) { b.addEventListener('click', function () { var on = !b.classList.contains('flip'); b.classList.toggle('flip', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); }); });
    $$('.floor', st).forEach(function (f) { var g = function () { setFloor(st, +f.getAttribute('data-floor')); }; f.addEventListener('mouseenter', g); f.addEventListener('focus', g); f.addEventListener('click', g); });
    if (st.getAttribute('data-op') === '08') st.addEventListener('pointermove', function (e) {
      if (!st.classList.contains('open') || RM.matches) return;
      var r = st.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      var p = $('.depp', st); p.style.setProperty('--mx', (x * 18).toFixed(1) + 'px'); p.style.setProperty('--my', (y * 12).toFixed(1) + 'px'); p.style.setProperty('--ry', (x * 5).toFixed(2) + 'deg'); p.style.setProperty('--rx', (-y * 4).toFixed(2) + 'deg');
    });
  }
  /* tab 2: pressing a launcher plays the picked opening in a pop-up stage */
  function openPop(n, from) {
    var pop = document.createElement('div');
    pop.className = 'pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-modal', 'true'); pop.setAttribute('aria-label', 'MENU ' + n + ' with opening ' + eff('dropdown'));
    pop.innerHTML = '<div class="popfit">' + ddStage(eff('dropdown'), n, 'pop') + '</div>';
    document.body.appendChild(pop);
    var st = $('.ostage', pop), fit = $('.popfit', pop);
    var s = Math.min(1, (window.innerWidth - 16) / W, (window.innerHeight - 16) / 600);
    fit.style.width = (W * s) + 'px'; fit.style.height = (600 * s) + 'px'; st.style.transform = 'scale(' + s + ')';
    wireOp(st); watchButtons(pop);
    st._onclose = function () { setTimeout(function () { pop.remove(); from.focus({ preventScroll: true }); }, RM.matches ? 60 : 650); };
    pop.addEventListener('click', function (e) { if (e.target === pop) openOp(st, false); });
    requestAnimationFrame(function () { requestAnimationFrame(function () { openOp(st, true, $('[data-open]', st)); }); });
  }
  /* ---------------- founders behaviour ---------------- */
  function wireFounders(root) {
    $$('.fstage', root).forEach(function (st) {
      var flip = $('[data-flip]', st);
      flip.addEventListener('click', function () {
        var on = $('.mcard', st).getAttribute('data-on') !== '1';
        $('.mcard', st).setAttribute('data-on', on ? '1' : '0');
        var tag = $('[data-tag]', st); tag.textContent = on ? 'ACTIVE · 10% OFF FOR LIFE' : 'NOT ACTIVE YET'; tag.style.color = on ? '#cfe6ff' : ''; tag.style.textShadow = on ? '0 0 10px rgba(42,120,255,.8)' : '';
        $$('.steps > li, .steps > .plaque', st).forEach(function (li, i) { li.classList.toggle('lit', on || i === 0); });
        $('.t', flip).textContent = on ? 'SEE IT NOT ACTIVE' : 'SEE IT ACTIVE'; flip.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      $$('[data-acc]', st).forEach(function (k) {
        k.addEventListener('click', function () {
          var open = k.getAttribute('aria-expanded') === 'true';
          $$('[data-acc]', st).forEach(function (x) { x.setAttribute('aria-expanded', 'false'); var p = document.getElementById(x.getAttribute('aria-controls')); if (p) p.hidden = true; });
          if (!open) { k.setAttribute('aria-expanded', 'true'); document.getElementById(k.getAttribute('aria-controls')).hidden = false; }
          fitAll();
        });
      });
      var send = $('[data-send]', st); if (send) send.addEventListener('click', function () { $('[data-said]', st).textContent = 'SAMPLE ONLY: NOTHING WAS SENT'; });
    });
  }

  /* ---------------- fit 1056 px samples into their box ---------------- */
  function fitAll() {
    $$('.panel:not([hidden]) .lfit').forEach(function (f) {
      var need = +f.getAttribute('data-need'), w = f.clientWidth, st = f.firstElementChild;
      var s = need && w < need ? w / need : 1;
      st.style.transform = s < 1 ? 'scale(' + s + ')' : ''; st.style.width = s < 1 ? (w / s) + 'px' : ''; 
      f.style.height = Math.ceil(200 * s) + 'px';
    });
    $$('.panel:not([hidden]) .fit').forEach(function (f) {
      var st = f.firstElementChild, w = f.clientWidth; if (!st || !w) return;
      var s = Math.min(1, w / st.offsetWidth);
      st.style.transform = 'scale(' + s + ')';
      st.style.left = Math.max(0, (w - st.offsetWidth * s) / 2) + 'px';
      f.style.height = Math.ceil(st.offsetHeight * s) + 'px';
    });
  }

  /* ---------------- picks: show, carry across, save ---------------- */
  var ref = null, writing = Promise.resolve(), saidEl;
  function say(t) { if (saidEl) saidEl.textContent = t; }
  function paintPicks() {
    $$('.opt').forEach(function (o) {
      var on = picks[o.getAttribute('data-tab')] === o.getAttribute('data-n');
      o.classList.toggle('picked', on);
      var k = $('.pk', o); k.setAttribute('aria-pressed', on ? 'true' : 'false'); $('span', k).textContent = on ? 'PICKED' : 'PICK';
    });
    var L = [['BUTTON', 'button'], ['MENU', 'menu'], ['OPENING', 'dropdown'], ['CARD', 'card'], ['FOUNDERS', 'founders']];
    $('#picks-line').innerHTML = 'YOUR PICKS: ' + L.map(function (x) { return x[0] + ' <b>' + (picks[x[1]] || '—') + '</b>'; }).join(' · ');
  }
  function applyButton() {
    var st = eff('button');
    $$('.btn.auto').forEach(function (b) { b.className = b.className.replace(/\bb\d\d\b/, 'b' + st); b.style.removeProperty('--rx'); rings(b); });
    watchButtons(document);
  }
  function save() {
    try { localStorage.setItem('pep-picks', JSON.stringify(picks)); } catch (e) {}
    if (!ref) { say('PICKED. Tell Claude your five numbers.'); return; }
    var data = { button: picks.button, menu: picks.menu, dropdown: picks.dropdown, card: picks.card, founders: picks.founders, at: new Date().toISOString() };
    writing = writing.then(function () { return ref.set(data); }).then(function () { say('SAVED.'); }).catch(function () { say('PICKED. Tell Claude your five numbers.'); });
  }
  function pick(tab, n) {
    picks[tab] = n; paintPicks();
    if (tab === 'button') applyButton();
    if (tab === 'menu') { buildDD(); watchButtons($('#p-drop-downs')); fitAll(); }
    save();
  }
  function connect() {
    var timer = setTimeout(function () { if (!ref) say(''); }, 10000);
    if (!window.claude || typeof window.claude.use !== 'function') { clearTimeout(timer); return; }
    try {
      window.claude.use('db').then(function (db) {
        if (!db) { clearTimeout(timer); return; }
        ref = db.doc('picks/main');
        return ref.get().then(function (snap) {
          clearTimeout(timer);
          var d = snap && (typeof snap.data === 'function' ? snap.data() : (snap.data !== undefined ? snap.data : snap));
          if (d && typeof d === 'object') { var ch = false; Object.keys(picks).forEach(function (k) { if (typeof d[k] === 'string' && /^\d\d$/.test(d[k]) && !picks[k]) { picks[k] = d[k]; ch = true; } }); if (ch) { paintPicks(); applyButton(); buildDD(); fitAll(); } }
        });
      }).catch(function () { clearTimeout(timer); });
    } catch (e) { clearTimeout(timer); }
  }

  /* ---------------- routing ---------------- */
  function route() {
    var h = (location.hash || '#buttons').slice(1); if (!TABS.some(function (t) { return t[0] === h; })) h = 'buttons';
    TABS.forEach(function (t) { var p = document.getElementById('p-' + t[0]); p.hidden = t[0] !== h; var a = $('.tab[href="#' + t[0] + '"]'); if (t[0] === h) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    $$('.ostage.open').forEach(function (s) { openOp(s, false); });
    requestAnimationFrame(function () { fitAll(); watchButtons(document.getElementById('p-' + h)); });
  }

  /* ---------------- start ---------------- */
  document.addEventListener('DOMContentLoaded', function () {
    saidEl = $('#saved');
    build();
    wireFounders(document);
    paintPicks();
    document.addEventListener('click', function (e) { var k = e.target.closest('[data-pick]'); if (k) pick(k.getAttribute('data-pick'), k.getAttribute('data-n')); });
    document.addEventListener('click', function (e) { var a = e.target.closest('a.btn[href="#"]'); if (a) e.preventDefault(); });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      $$('.ostage.open').forEach(function (s) { openOp(s, false); });
      $$('[data-acc][aria-expanded="true"]').forEach(function (k) { k.click(); k.focus({ preventScroll: true }); });
    });
    document.addEventListener('pointermove', function (e) {
      var b = e.target.closest && e.target.closest('.b23'); if (!b) return;
      var r = b.getBoundingClientRect(); var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      b.style.setProperty('--ry', (x * 10).toFixed(2) + 'deg'); b.style.setProperty('--rx', (-y * 12).toFixed(2) + 'deg');
    });
    window.addEventListener('hashchange', route);
    window.addEventListener('resize', function () { fitAll(); });
    route();
    connect();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitAll(); $$('.btn').forEach(rings); });
    window.addEventListener('load', fitAll);
  });
})();
