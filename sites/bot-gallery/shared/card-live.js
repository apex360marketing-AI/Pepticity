/* Gallery cards: build the 15 cards, each with its own small live motion (abstract, code-made; the real 3D lives on each bot page). */
(function () {
  var R = window.BOT_REGISTRY, fams = [['LIVING ORBS', 'Glass and liquid blobs that morph and glow as you type and as the guide thinks.'], ['LITTLE AGENTS', 'Small lit agents that roam the page, point at things, open cards and hand you to the chat.'], ['HOLO-GLASS PANELS', 'See-through panels with pointer-reactive light.'], ['GUIDE STRIPS', 'Slim command bar, ticker and one-question strip.'], ['3D GUIDES', 'The 3D P, a liquid-chrome medallion, a lab assistant.']];
  var el = GUI.el, root = document.getElementById('cards'), thumbs = [];
  fams.forEach(function (f) {
    root.appendChild(el('div', { class: 'fam' }, [el('h2', { text: f[0] }), el('span', { text: f[1] })]));
    var g = el('div', { class: 'grid' }); root.appendChild(g);
    R.filter(function (m) { return m.family === f[0]; }).forEach(function (m) {
      var th = el('div', { class: 'th', 'aria-hidden': 'true' });
      var a = el('a', { class: 'card glass', href: m.slug + '/', 'aria-label': 'Open bot ' + m.n + ': ' + m.name }, [th, el('div', { class: 'tx' }, [el('div', { class: 'no' }, [el('span', {}, ['BOT ', el('b', { text: ('0' + m.n).slice(-2) })]), el('span', { text: 'LIVE' })]), el('h3', { text: m.name }), el('p', { text: m.tag }), el('span', { class: 'go', text: 'Open the bot →' })])]);
      g.appendChild(a); thumb(m, th);
    });
  });
  GUI.watchGlass(root);
  function canvas(th) { var c = el('canvas'); th.appendChild(c); var x = c.getContext('2d'), s = { c: c, x: x, w: 1, h: 1, vis: true }; function rs() { var r = th.getBoundingClientRect(); s.w = c.width = Math.max(2, r.width * Math.min(devicePixelRatio || 1, 1.5)); s.h = c.height = Math.max(2, r.height * Math.min(devicePixelRatio || 1, 1.5)); } rs(); addEventListener('resize', rs); if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { s.vis = e[0].isIntersecting; }).observe(th); return s; }
  var acc = getComputedStyle(document.documentElement).getPropertyValue('--v-t').trim() || '#59A0FF';
  function thumb(m, th) {
    var n = m.n;
    if (n <= 3) { /* orbs: soft chrome blobs drawn as lit radial gradients */
      var s = canvas(th), cnt = [1, 4, 7][n - 1];
      GUI.onFrame(function (dt, t) { if (!s.vis) return; var x = s.x, w = s.w, h = s.h; x.clearRect(0, 0, w, h); var tt = GUI.reduced ? 1 : t / 1000;
        for (var i = 0; i < cnt; i++) { var cx = w / 2 + (cnt === 1 ? 0 : Math.cos(tt * 0.5 + i * 2.1) * w * (n === 2 ? 0.3 : 0.34)), cy = h / 2 + (cnt === 1 ? Math.sin(tt) * 4 : Math.sin(tt * 0.7 + i * 1.7) * h * 0.22), r = (cnt === 1 ? h * 0.34 : n === 2 ? h * 0.14 : h * (0.1 + (i % 3) * 0.04)) * (1 + Math.sin(tt * 1.6 + i) * 0.05);
          var g = x.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.05, cx, cy, r); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(.25, 'rgba(190,190,184,.55)'); g.addColorStop(.7, 'rgba(40,40,40,.4)'); g.addColorStop(1, 'rgba(255,255,255,.28)'); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, 6.283); x.fill(); x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 1; x.stroke(); }
        if (n === 2) { x.strokeStyle = 'rgba(255,255,255,.14)'; x.beginPath(); x.ellipse(w / 2, h / 2, w * 0.3, h * 0.22, 0, 0, 6.283); x.stroke(); x.fillStyle = 'rgba(210,210,205,.8)'; x.beginPath(); x.arc(w / 2, h / 2, h * 0.14, 0, 6.283); x.fill(); } });
    } else if (n <= 6) { /* agents: small lit diamonds roaming with a pointing line */
      var s2 = canvas(th), ag = [0, 1, 2].map(function (i) { return { i: i, x: 0, y: 0 }; });
      GUI.onFrame(function (dt, t) { if (!s2.vis) return; var x = s2.x, w = s2.w, h = s2.h; x.clearRect(0, 0, w, h); var tt = GUI.reduced ? 2 : t / 1000; var tgt = { x: w * 0.72, y: h * 0.5 };
        x.strokeStyle = 'rgba(255,255,255,.2)'; x.strokeRect(w * 0.62, h * 0.38, w * 0.28, h * 0.24);
        ag.forEach(function (a) { var cnt = n === 5 ? 1 : n === 6 ? 3 : 3; if (n === 5 && a.i > 0) return; var px = w * (0.3 + 0.16 * a.i) + Math.cos(tt * (0.6 + a.i * 0.2) + a.i * 2) * w * 0.14, py = h * 0.5 + Math.sin(tt * (0.9 + a.i * 0.15) + a.i) * h * 0.22; a.x += (px - a.x) * 0.1; a.y += (py - a.y) * 0.1; var s = h * (n === 5 ? 0.1 : 0.075);
          if (a.i === 0) { x.strokeStyle = acc; x.globalAlpha = .55; x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(tgt.x, tgt.y); x.stroke(); x.globalAlpha = 1; }
          x.save(); x.translate(a.x, a.y); x.rotate(tt * 0.8 + a.i); var g = x.createLinearGradient(-s, -s, s, s); g.addColorStop(0, '#f0efe9'); g.addColorStop(.5, '#6e6d68'); g.addColorStop(1, '#d9d8d1'); x.fillStyle = g; x.beginPath(); if (n === 6) { x.moveTo(-s * 1.4, -s * .6); x.lineTo(s * 1.4, -s * .6); x.lineTo(s * 1.0, s * .6); x.lineTo(-s * 1.0, s * .6); x.closePath(); } else { x.moveTo(0, -s); x.lineTo(s, 0); x.lineTo(0, s); x.lineTo(-s, 0); x.closePath(); } x.fill(); x.strokeStyle = 'rgba(255,255,255,.7)'; x.stroke(); x.restore(); x.fillStyle = acc; x.beginPath(); x.arc(a.x, a.y, 2, 0, 6.283); x.fill(); }); });
    } else if (n <= 9) { th.appendChild(el('div', { class: 'tilt' }, [el('i', { style: 'transform:translateZ(-30px) translateX(-34%)' }), el('i', { style: 'transform:translateZ(10px)' }), el('i', { style: 'transform:translateZ(-30px) translateX(34%)' })].slice(n === 8 ? 1 : 0, n === 8 ? 3 : 3)));
      var tl = GUI.$('.tilt', th); GUI.onFrame(function () { var r = th.getBoundingClientRect(), p = GUI.pointer; if (GUI.reduced || r.bottom < 0 || r.top > innerHeight) return; var nx = GUI.clamp((p.x - r.left) / r.width * 2 - 1, -1.5, 1.5), ny = GUI.clamp((p.y - r.top) / r.height * 2 - 1, -1.5, 1.5); tl.style.transform = 'rotateY(' + (nx * 14).toFixed(1) + 'deg) rotateX(' + (ny * -8).toFixed(1) + 'deg)'; });
    } else if (n === 10) th.appendChild(el('div', { class: 'strip' }, [el('span', { style: 'color:var(--v-t);margin-right:10px;font-family:var(--display)', text: '>' }), 'What would you like to learn about first?', el('u')]));
    else if (n === 11) th.appendChild(el('div', { class: 'tick' }, [0, 1].map(function () { return ['Build my reading list', 'What are the peptide families?', 'Which vitamin pairs with what?', 'Do I need a blood test first?'].map(function (t) { return el('span', { text: t }); }); }).reduce(function (a, b) { return a.concat(b); }, [])));
    else if (n === 12) { th.append(el('div', { class: 'big' }, ['Which age range', el('br'), el('em', { text: 'are you in?' })]), el('div', { class: 'hair' }, [el('b')])); }
    else if (n === 13) th.appendChild(el('div', { class: 'p3d' }, [el('div', {}, [0, 1, 2, 3, 4, 5, 6].map(function (i) { return el('i', { style: 'transform:translateZ(' + (i * 3 - 9) + 'px);opacity:' + (i === 3 ? 1 : 0.55) }); }))]));
    else if (n === 14) th.appendChild(el('div', { class: 'dial' }, [el('div')]));
    else th.appendChild(el('div', { class: 'tube' }, [el('em'), el('s')]));
  }
})();
