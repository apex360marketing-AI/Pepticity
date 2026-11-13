/* PEPTICITY PRINT ROOM: the 25 business cards, standard 3.5 x 2 in, each with a front and a back.
   ONE idea per card. Light stock: pearl, light grey, platinum (never bright white). Dark stock: matte black,
   UV black, smoked glass. Lettering is chrome with the logo's blue light; a few cards carry one chrome-gold accent.
   The logo is always the real logo-07 render (the front P, the nine letters), never redrawn. */
(function () {
  'use strict';
  var P = window.PEPPRINT, E = P.engine, C = E.C;
  var W = 3.5, H = 2;

  /* ---------------- the stocks ---------------- */
  var STOCK = {
    matte: function (g) {
      E.ground(g, E.lin(g, 0, -0.125, 0, 2.125, [[0, C.black1], [0.6, C.black0], [1, C.black0]]));
      E.tex(g, 'matte', 0.9);
    },
    uv: function (g) {
      E.ground(g, E.lin(g, 0, 0, W, H, [[0, C.uv], [0.75, C.black0], [1, C.black0]]));
      E.tex(g, 'matte', 0.55);
    },
    smoked: function (g) {
      E.ground(g, E.lin(g, 0, 0, W, H, [[0, C.plat1], [0.5, C.smoke], [1, C.black1]]));
      E.tex(g, 'smoked', 0.9, 'overlay');
    },
    // light stock: a soft white and light greys, never bright white (all well above 80% lightness)
    pearl: function (g) {
      E.ground(g, E.lin(g, 0, 0, W, H, [[0, '#e4e7eb'], [1, '#dadde2']]));
      E.tex(g, 'pearl', 0.9);
    },
    grey: function (g) {
      E.ground(g, E.lin(g, 0, 0, 0, H, [[0, '#d6dadf'], [1, '#ced3d9']]));
      E.tex(g, 'pearl', 0.75);
    },
    platinum: function (g) {
      E.ground(g, E.lin(g, 0, 0, 0, H, [[0, '#dfe2e7'], [0.5, '#d9dde2'], [1, '#d2d6dc']]));
      E.tex(g, 'brushed', 0.8);
    },
    ice: function (g) {
      E.ground(g, E.lin(g, 0, 0, W, H, [[0, '#e1e5ea'], [1, '#d4d9df']]));
      E.tex(g, 'pearl', 0.8);
    }
  };

  /* ---------------- shared pieces ---------------- */
  function nameTitle(g, f, x, y, o) {
    var n = E.text(g, f.name, x, y, { id: 'name', pt: o.pt || 15, track: o.track == null ? 0.06 : o.track, fill: o.face, depth: o.depth == null ? 3 : o.depth, glow: o.glow || 0, align: o.align, maxW: o.maxW, v: o.v });
    var t = E.text(g, f.title, x, y + (o.gap || 0.25), { id: 'title', pt: o.tpt || 6.4, track: o.ttrack == null ? 0.34 : o.ttrack, fill: o.tfill || o.face, align: o.align, maxW: o.maxW, v: o.v });
    return [n, t];
  }
  // phone, email, web, one under another (empty ones are left out); anchor 'top' = y is the first line, 'bottom' = the last
  function contact(g, f, x, y, o) {
    var keys = ['phone', 'email', 'web'].filter(function (k) { return E.clean(f[k], false) !== ''; });
    var lh = o.lh || 0.155, y0 = o.anchor === 'bottom' ? y - (keys.length - 1) * lh : y;
    return keys.map(function (k, i) {
      return E.text(g, f[k], x, y0 + i * lh, { id: k, font: 'ui', pt: o.pt || 7, track: 0.02, upper: k !== 'email', fill: o.fill, align: o.align, maxW: o.maxW });
    });
  }
  // PEPTICITY in the owner's lettering
  function word(g, x, y, o) {
    return E.text(g, 'PEPTICITY', x, y, { id: 'wordmark', pt: o.pt || 9, track: o.track == null ? 0.2 : o.track, fill: o.fill || 'chrome', depth: o.depth || 0, glow: o.glow || 0, align: o.align || 'center', maxW: o.maxW, rot: o.rot });
  }
  function rim(g, pts, x0, y0, x1, y1, lw) {
    E.stroke(g, pts, E.lin(g, x0, y0, x1, y1, [[0, C.plat4], [0.45, C.plat2], [0.7, C.plat3], [1, C.plat2]]), lw || 0.006);
  }
  // the store's fluted glass: vertical ribs, light edge then shadow
  function flutes(g, period, a) {
    if (!g.want('flutes', 'deco')) { return; }
    var c = g.ctx;
    for (var x = -g.b; x < g.w + g.b; x += period) {
      c.fillStyle = E.lin(g, x, 0, x + period, 0, [[0, E.plat(0)], [0.15, E.plat(0.07 * a)], [0.32, E.plat(0.025 * a)], [0.5, E.ink(0)], [0.8, E.ink(0.35 * a)], [0.91, E.ink(0.09 * a)], [1, E.plat(0)]]);
      c.fillRect(g.X(x), g.Y(-g.b), g.L(period) + 0.5, g.L(g.h + 2 * g.b));
    }
  }
  // a light along any line (the slash's edge)
  function lightLine(g, x0, y0, x1, y1, th) {
    if (!g.want('beam', 'deco')) { return; }
    var c = g.ctx;
    c.save();
    c.shadowColor = E.blue(0.9);
    c.shadowBlur = Math.max(2, g.L(th * 5));
    c.strokeStyle = E.lin(g, x0, y0, x1, y1, [[0, E.blue(0)], [0.2, E.blue(0.9)], [0.5, C.core], [0.8, E.blue(0.9)], [1, E.blue(0)]]);
    c.lineWidth = Math.max(1, g.L(th));
    c.beginPath(); c.moveTo(g.X(x0), g.Y(y0)); c.lineTo(g.X(x1), g.Y(y1)); c.stroke();
    c.restore();
  }
  function clip(g, pts, fn) { var c = g.ctx; c.save(); E.path(g, pts); c.clip(); fn(); c.restore(); }
  function chip(g, pts, x0, y0, x1, y1) {
    E.fill(g, pts, E.lin(g, x0, y0, x1, y1, [[0, C.plat1], [0.55, C.black1], [1, C.black0]]));
    clip(g, pts, function () { E.tex(g, 'smoked', 0.8, 'overlay'); });
    rim(g, pts, x0, y0, x1, y1, 0.006);
  }

  var LIGHT = { face: 'gunmetal', tfill: 'ink', small: C.plat1 };
  var DARK = { face: 'chrome', tfill: 'platinum', small: C.plat3 };

  /* ---------------- the 25 ---------------- */
  var D = [];
  function add(o) { D.push(o); }

  add({ name: 'THE LIGHT', tone: 'dark', stock: 'MATTE BLACK',
    say: ['The P with its blue light running edge to edge', 'name, title and contact, with a short blue light'],
    front: function (g) {
      STOCK.matte(g);
      E.glow(g, 1.75, 0.9, 1.45, 0.7, 0.09);
      var r = E.placeP(1.09, 0.4, 1.32, 0.92);
      E.beam(g, -0.125, 3.625, r.beamY, 0.014, { spread: 6, alpha: 0.95 });
      E.drawP(g, 1.09, 0.4, 1.32, 0.92);
      word(g, 1.75, 1.7, { pt: 5.6, track: 0.7, fill: 'platinum' });
    },
    back: function (g, f) {
      STOCK.matte(g);
      nameTitle(g, f, 0.3, 0.6, { face: 'chrome', pt: 15, depth: 4, glow: 0.2, maxW: 2.9, tfill: 'platinum' });
      E.beam(g, 0.3, 1.6, 1.02, 0.012, { spread: 5 });
      contact(g, f, 0.3, 1.66, { anchor: 'bottom', fill: C.plat3, maxW: 2.1 });
      E.drawP(g, 2.62, 1.24, 0.62, 0.45);
    } });

  add({ name: 'PEARL', tone: 'light', stock: 'PEARL',
    say: ['The P over the PEPTICITY letters, on pearl', 'name and title in gunmetal chrome, contact below'],
    front: function (g) {
      STOCK.pearl(g);
      E.drawP(g, 1.75 - 0.6, 0.26, 1.2, 0.86);
      E.drawWord(g, 1.75, 1.3, 0.16, { align: 'center' });
    },
    back: function (g, f) {
      STOCK.pearl(g);
      nameTitle(g, f, 0.3, 0.62, { face: 'gunmetal', pt: 14, depth: 3, maxW: 2.9, tfill: 'ink' });
      E.rule(g, 0.3, 1.5, 1.0, 0.006, 'ink');
      contact(g, f, 0.3, 1.66, { anchor: 'bottom', fill: C.plat1, maxW: 2.2 });
      E.drawWord(g, 3.2, 1.6, 0.075, { align: 'right' });
    } });

  add({ name: 'WORDMARK', tone: 'dark', stock: 'MATTE BLACK',
    say: ['The PEPTICITY letters with the logo light under them', 'the P, name and contact set to the right'],
    front: function (g) {
      STOCK.matte(g);
      E.glow(g, 1.75, 1.0, 1.7, 0.6, 0.08);
      var wb = E.drawWord(g, 1.75, 0.7, 0.27, { align: 'center' });
      E.beam(g, 1.75 - wb.box.w * 0.405, 1.75 + wb.box.w * 0.405, 1.22, 0.022, { spread: 6 });
    },
    back: function (g, f) {
      STOCK.matte(g);
      E.drawP(g, 0.24, 0.24, 0.66, 0.48);
      nameTitle(g, f, 3.2, 0.5, { align: 'right', face: 'chrome', pt: 13, depth: 3, glow: 0.15, maxW: 2.1, tfill: 'platinum' });
      E.beam(g, 2.0, 3.2, 0.98, 0.01);
      contact(g, f, 3.2, 1.66, { anchor: 'bottom', align: 'right', fill: C.plat3, maxW: 2.6 });
    } });

  add({ name: 'BRUSHED PLATINUM', tone: 'light', stock: 'PLATINUM',
    say: ['The P beside the PEPTICITY letters, on brushed platinum', 'name, title and contact centred'],
    front: function (g) {
      STOCK.platinum(g);
      var r = E.drawP(g, 0.3, 0.62, 0.95, 0.72);
      E.drawWord(g, 1.42, r.beamY - 0.1, 0.2);
    },
    back: function (g, f) {
      STOCK.platinum(g);
      nameTitle(g, f, 1.75, 0.66, { align: 'center', face: 'gunmetal', pt: 14, depth: 3, maxW: 3.0, tfill: 'ink' });
      E.rule(g, 1.2, 2.3, 1.08, 0.006, 'ink');
      contact(g, f, 1.75, 1.66, { anchor: 'bottom', align: 'center', fill: C.plat1, maxW: 3.0 });
    } });

  add({ name: 'FLOOR LIGHT', tone: 'dark', stock: 'UV BLACK',
    say: ['The P standing on a floor of blue light', 'name, title and contact centred over the floor light'],
    front: function (g) {
      STOCK.uv(g);
      E.glow(g, 1.75, 1.6, 1.9, 0.42, 0.34);
      E.beam(g, 0.45, 3.05, 1.6, 0.014, { spread: 4, alpha: 0.85 });
      E.drawP(g, 1.75 - 0.67, 0.6, 1.34, 0.98);
      word(g, 1.75, 1.8, { pt: 5.4, track: 0.7, fill: 'platinum' });
    },
    back: function (g, f) {
      STOCK.uv(g);
      E.glow(g, 1.75, 1.95, 1.9, 0.35, 0.22);
      nameTitle(g, f, 1.75, 0.58, { align: 'center', face: 'chrome', pt: 15, depth: 4, glow: 0.2, maxW: 3.0, tfill: 'platinum' });
      contact(g, f, 1.75, 1.62, { anchor: 'bottom', align: 'center', fill: C.plat3, maxW: 3.0 });
    } });

  add({ name: 'SMOKED GLASS', tone: 'dark', stock: 'SMOKED GLASS',
    say: ['PEPTICITY in 3D chrome lettering on smoked glass', 'name and contact on smoked glass, a small chrome word'],
    front: function (g) {
      STOCK.smoked(g);
      word(g, 1.75, 1.0, { pt: 17, track: 0.16, fill: 'chrome', depth: 5, glow: 0.3, maxW: 3.0 });
    },
    back: function (g, f) {
      STOCK.smoked(g);
      nameTitle(g, f, 0.3, 0.6, { face: 'chrome', pt: 14, depth: 4, glow: 0.18, maxW: 2.9, tfill: 'platinum' });
      contact(g, f, 0.3, 1.66, { anchor: 'bottom', fill: C.plat4, maxW: 1.9 });
      word(g, 3.2, 1.66, { align: 'right', pt: 6, track: 0.3, fill: 'chrome', maxW: 0.95 });
    } });

  add({ name: 'MIST', tone: 'light', stock: 'LIGHT GREY',
    say: ['A small P in the corner and the name, lots of quiet grey', 'PEPTICITY and the contact lines, centred'],
    front: function (g, f) {
      STOCK.grey(g);
      E.drawP(g, 0.24, 0.22, 0.62, 0.45);
      nameTitle(g, f, 0.3, 1.42, { face: 'gunmetal', pt: 13, depth: 2, maxW: 2.9, tfill: 'ink' });
    },
    back: function (g, f) {
      STOCK.grey(g);
      word(g, 1.75, 0.92, { pt: 9, track: 0.42, fill: 'gunmetal', depth: 2, maxW: 3.0 });
      contact(g, f, 1.75, 1.3, { anchor: 'top', align: 'center', fill: C.plat1, maxW: 3.0, pt: 6.6 });
    } });

  add({ name: 'ON THE BEAM', tone: 'dark', stock: 'MATTE BLACK',
    say: ['The PEPTICITY letters standing on a beam of light', 'the name standing on the same beam, contact below it'],
    front: function (g) {
      STOCK.matte(g);
      E.beam(g, -0.125, 3.625, 1.16, 0.018, { spread: 6 });
      E.drawWord(g, 1.75, 1.16 - 0.06 - 0.26, 0.26, { align: 'center' });
    },
    back: function (g, f) {
      STOCK.matte(g);
      E.beam(g, -0.125, 3.625, 1.16, 0.014, { spread: 5, alpha: 0.85 });
      E.text(g, f.name, 0.3, 0.84, { id: 'name', v: 'base', pt: 15, track: 0.06, fill: 'chrome', depth: 4, glow: 0.2, maxW: 2.9 });
      E.text(g, f.title, 0.3, 1.07, { id: 'title', v: 'base', pt: 6.4, track: 0.34, fill: 'platinum', maxW: 2.9 });
      contact(g, f, 0.3, 1.38, { anchor: 'top', fill: C.plat3, maxW: 2.9 });
    } });

  add({ name: 'PEARL AND GOLD', tone: 'light', stock: 'PEARL', gold: true,
    say: ['PEPTICITY in gunmetal chrome over one chrome-gold line', 'name in gunmetal, title in chrome gold, contact below'],
    front: function (g) {
      STOCK.pearl(g);
      word(g, 1.75, 0.94, { pt: 15, track: 0.18, fill: 'gunmetal', depth: 3, maxW: 3.0 });
      E.rule(g, 1.1, 2.4, 1.22, 0.012, 'darkgold');
    },
    back: function (g, f) {
      STOCK.pearl(g);
      nameTitle(g, f, 0.3, 0.6, { face: 'gunmetal', pt: 14, depth: 3, maxW: 2.9, tfill: 'darkgold' });
      E.rule(g, 0.3, 1.25, 1.0, 0.006, 'ink');
      contact(g, f, 0.3, 1.66, { anchor: 'bottom', fill: C.plat1, maxW: 2.2 });
      E.drawP(g, 2.66, 1.26, 0.56, 0.41);
    } });

  add({ name: 'CUT PANEL', tone: 'dark', stock: 'MATTE BLACK',
    say: ['A cut-corner glass panel holding the P and the letters', 'the same panel holding the name and contact'],
    front: function (g) {
      STOCK.matte(g);
      var pts = E.cut(0.2, 0.22, 3.1, 1.56, [0.34, 0, 0.34, 0]);
      E.fill(g, pts, E.lin(g, 0.2, 0.22, 3.3, 1.78, [[0, E.plat(0.1)], [0.5, E.plat(0.03)], [1, E.plat(0.07)]]));
      rim(g, pts, 0.2, 0.22, 3.3, 1.78, 0.006);
      var r = E.drawP(g, 0.45, 0.62, 0.9, 0.76);
      E.drawWord(g, 1.5, r.beamY - 0.085, 0.17);
    },
    back: function (g, f) {
      STOCK.matte(g);
      var pts = E.cut(0.2, 0.22, 3.1, 1.56, [0.34, 0, 0.34, 0]);
      E.fill(g, pts, E.lin(g, 0.2, 0.22, 3.3, 1.78, [[0, E.plat(0.1)], [0.5, E.plat(0.03)], [1, E.plat(0.07)]]));
      rim(g, pts, 0.2, 0.22, 3.3, 1.78, 0.006);
      nameTitle(g, f, 0.55, 0.66, { face: 'chrome', pt: 14, depth: 4, glow: 0.15, maxW: 2.55, tfill: 'platinum' });
      contact(g, f, 0.55, 1.56, { anchor: 'bottom', fill: C.plat3, maxW: 2.5 });
    } });

  add({ name: 'MONOGRAM', tone: 'dark', stock: 'MATTE BLACK',
    say: ['A big P on the right, the name on the left', 'the PEPTICITY letters, the logo light and the contact'],
    front: function (g, f) {
      STOCK.matte(g);
      E.glow(g, 2.45, 0.95, 1.1, 0.8, 0.12);
      E.drawP(g, 1.72, 0.3, 1.5, 1.2);
      nameTitle(g, f, 0.3, 1.36, { face: 'chrome', pt: 13, depth: 3, glow: 0.15, maxW: 1.3, tfill: 'platinum' });
    },
    back: function (g, f) {
      STOCK.matte(g);
      var wb = E.drawWord(g, 1.75, 0.6, 0.17, { align: 'center' });
      E.beam(g, 1.75 - wb.box.w * 0.405, 1.75 + wb.box.w * 0.405, 0.98, 0.012);
      contact(g, f, 1.75, 1.3, { anchor: 'top', align: 'center', fill: C.plat3, maxW: 3.0 });
    } });

  add({ name: 'ICE LIGHT', tone: 'light', stock: 'PLATINUM',
    say: ['The logo light washing in over pale platinum, the name and a small P', 'the letters and the contact lines'],
    front: function (g, f) {
      STOCK.ice(g);
      E.glow(g, -0.1, -0.1, 2.2, 1.6, 0.17);
      nameTitle(g, f, 0.3, 0.62, { face: 'gunmetal', pt: 15, depth: 3, maxW: 2.3, tfill: 'ink' });
      E.drawP(g, 2.55, 1.2, 0.68, 0.5);
    },
    back: function (g, f) {
      STOCK.ice(g);
      E.glow(g, 3.6, 2.1, 2.0, 1.4, 0.15);
      E.drawWord(g, 0.3, 0.3, 0.12);
      contact(g, f, 0.3, 1.66, { anchor: 'bottom', fill: C.plat1, maxW: 2.6 });
    } });

  add({ name: 'CHROME NAME', tone: 'dark', stock: 'MATTE BLACK',
    say: ['The name, big, in 3D chrome with the blue light', 'the P, the letters and the contact, centred'],
    front: function (g, f) {
      STOCK.matte(g);
      E.glow(g, 1.75, 0.92, 1.6, 0.6, 0.14);
      E.text(g, f.name, 1.75, 0.9, { id: 'name', align: 'center', pt: 30, track: 0.06, fill: 'chrome', depth: 5, glow: 0.3, maxW: 3.0, maxH: 0.6 });
      E.text(g, f.title, 1.75, 1.38, { id: 'title', align: 'center', pt: 7, track: 0.4, fill: 'platinum', maxW: 3.0 });
    },
    back: function (g, f) {
      STOCK.matte(g);
      E.drawP(g, 1.75 - 0.42, 0.3, 0.84, 0.62);
      E.drawWord(g, 1.75, 1.0, 0.1, { align: 'center' });
      contact(g, f, 1.75, 1.36, { anchor: 'top', align: 'center', fill: C.plat3, maxW: 3.0, pt: 6.6, lh: 0.145 });
    } });

  add({ name: 'CUT FRAME', tone: 'light', stock: 'PLATINUM',
    say: ['The P inside a cut-corner frame', 'the same frame round the name and contact'],
    front: function (g) {
      STOCK.platinum(g);
      var pts = E.cut(0.16, 0.16, 3.18, 1.68, [0.22, 0.22, 0.22, 0.22]);
      E.stroke(g, pts, E.lin(g, 0.16, 0.16, 3.34, 1.84, [[0, C.plat1], [0.5, C.plat2], [1, C.plat1]]), 0.007);
      E.drawP(g, 1.75 - 0.62, 0.55, 1.24, 0.9);
    },
    back: function (g, f) {
      STOCK.platinum(g);
      var pts = E.cut(0.16, 0.16, 3.18, 1.68, [0.22, 0.22, 0.22, 0.22]);
      E.stroke(g, pts, E.lin(g, 0.16, 0.16, 3.34, 1.84, [[0, C.plat1], [0.5, C.plat2], [1, C.plat1]]), 0.007);
      nameTitle(g, f, 1.75, 0.66, { align: 'center', face: 'gunmetal', pt: 13, depth: 3, maxW: 2.8, tfill: 'ink' });
      contact(g, f, 1.75, 1.6, { anchor: 'bottom', align: 'center', fill: C.plat1, maxW: 2.8 });
    } });

  add({ name: 'GOLD LINE', tone: 'dark', stock: 'MATTE BLACK', gold: true,
    say: ['The name over one chrome-gold line, the title in chrome gold', 'contact lines and PEPTICITY in chrome'],
    front: function (g, f) {
      STOCK.matte(g);
      E.drawP(g, 0.26, 0.24, 0.62, 0.45);
      E.text(g, f.name, 0.3, 1.18, { id: 'name', v: 'base', pt: 16, track: 0.06, fill: 'chrome', depth: 4, glow: 0.15, maxW: 2.9 });
      E.rule(g, 0.3, 2.2, 1.31, 0.012, 'gold');
      E.text(g, f.title, 0.3, 1.5, { id: 'title', pt: 6.6, track: 0.36, fill: 'gold', maxW: 2.9 });
    },
    back: function (g, f) {
      STOCK.matte(g);
      contact(g, f, 0.3, 0.7, { anchor: 'top', fill: C.plat3, maxW: 2.9 });
      E.rule(g, 0.3, 1.2, 1.32, 0.006, 'plat');
      word(g, 0.3, 1.6, { align: 'left', pt: 7, track: 0.42, fill: 'chrome', maxW: 2.9 });
    } });

  add({ name: 'FLUTED GLASS', tone: 'dark', stock: 'MATTE BLACK',
    say: ['The P and the name over the store’s fluted glass', 'PEPTICITY in chrome and the contact over fluted glass'],
    front: function (g, f) {
      STOCK.matte(g);
      flutes(g, 0.11, 1);
      E.drawP(g, 0.25, 0.5, 1.2, 1.0);
      nameTitle(g, f, 1.75, 0.92, { face: 'chrome', pt: 14, depth: 4, glow: 0.2, maxW: 1.5, tfill: 'platinum' });
    },
    back: function (g, f) {
      STOCK.matte(g);
      flutes(g, 0.11, 0.7);
      word(g, 1.75, 0.8, { pt: 10, track: 0.3, fill: 'chrome', depth: 3, maxW: 3.0 });
      contact(g, f, 1.75, 1.18, { anchor: 'top', align: 'center', fill: C.plat3, maxW: 3.0 });
    } });

  add({ name: 'EMBOSS', tone: 'light', stock: 'LIGHT GREY',
    say: ['A big P pressed faintly into grey stock, the name over it', 'a small P, PEPTICITY and the contact'],
    front: function (g, f) {
      STOCK.grey(g);
      E.drawP(g, 1.75 - 0.82, 0.2, 1.64, 1.6, { alpha: 0.1 });
      nameTitle(g, f, 1.75, 0.9, { align: 'center', face: 'gunmetal', pt: 16, depth: 3, maxW: 3.0, tfill: 'ink' });
    },
    back: function (g, f) {
      STOCK.grey(g);
      E.drawP(g, 0.24, 0.22, 0.6, 0.44);
      word(g, 3.2, 0.44, { align: 'right', pt: 7, track: 0.4, fill: 'gunmetal', maxW: 2.0 });
      contact(g, f, 0.3, 1.66, { anchor: 'bottom', fill: C.plat1, maxW: 2.9 });
    } });

  add({ name: 'BACKLIGHT', tone: 'dark', stock: 'MATTE BLACK',
    say: ['The P lit from behind, as in the store’s header', 'name, title and contact with a soft light behind the name'],
    front: function (g) {
      STOCK.matte(g);
      E.glow(g, 1.75, 0.98, 1.0, 0.95, 0.42);
      if (g.want('glow', 'deco')) {
        var c = g.ctx, R = g.L(0.45);
        c.save();
        c.fillStyle = E.rad(g, 1.75, 0.98, 0.45, [[0, E.core(0.16)], [1, E.core(0)]]);
        c.fillRect(g.X(1.75) - R, g.Y(0.98) - R, 2 * R, 2 * R);
        c.restore();
      }
      E.drawP(g, 1.75 - 0.62, 0.52, 1.24, 0.92);
    },
    back: function (g, f) {
      STOCK.matte(g);
      E.glow(g, 0.7, 0.62, 0.8, 0.5, 0.16);
      nameTitle(g, f, 0.3, 0.6, { face: 'chrome', pt: 15, depth: 4, glow: 0.25, maxW: 2.9, tfill: 'platinum' });
      contact(g, f, 0.3, 1.66, { anchor: 'bottom', fill: C.plat3, maxW: 2.9 });
    } });

  add({ name: 'THE CHIP', tone: 'light', stock: 'PEARL',
    say: ['A smoked glass chip holding the P, on pearl', 'a small chip, the name and the contact'],
    front: function (g) {
      STOCK.pearl(g);
      chip(g, E.cut(1.75 - 0.78, 0.38, 1.56, 1.24, [0.26, 0, 0.26, 0]), 0.97, 0.38, 2.53, 1.62);
      E.drawP(g, 1.75 - 0.58, 0.56, 1.16, 0.88);
    },
    back: function (g, f) {
      STOCK.pearl(g);
      chip(g, E.cut(0.22, 0.22, 0.74, 0.58, [0.13, 0, 0.13, 0]), 0.22, 0.22, 0.96, 0.8);
      E.drawP(g, 0.28, 0.3, 0.62, 0.42);
      nameTitle(g, f, 1.14, 0.42, { face: 'gunmetal', pt: 13, depth: 3, maxW: 2.1, tfill: 'ink' });
      contact(g, f, 0.3, 1.66, { anchor: 'bottom', fill: C.plat1, maxW: 2.9 });
    } });

  add({ name: 'THE BAR', tone: 'dark', stock: 'MATTE BLACK',
    say: ['PEPTICITY on a platinum chrome bar, like the store’s header', 'a small bar, the name and the contact'],
    front: function (g) {
      STOCK.matte(g);
      var pts = E.cut(0.22, 0.78, 3.06, 0.44, [0.16, 0.16, 0.16, 0.16]);
      E.fill(g, pts, E.lin(g, 0, 0.78, 0, 1.22, [[0, C.plat4], [0.42, C.plat3], [0.5, C.plat2], [0.58, C.plat3], [1, C.plat4]]));
      clip(g, pts, function () { E.tex(g, 'brushed', 0.7); });
      E.beam(g, 0.5, 3.0, 1.25, 0.008, { alpha: 0.8, spread: 4 });
      word(g, 1.75, 1.0, { pt: 13, track: 0.2, fill: 'ink', maxW: 2.6, maxH: 0.26 });
    },
    back: function (g, f) {
      STOCK.matte(g);
      var pts = E.cut(0.22, 0.24, 1.5, 0.26, [0.09, 0.09, 0.09, 0.09]);
      E.fill(g, pts, E.lin(g, 0, 0.24, 0, 0.5, [[0, C.plat4], [0.42, C.plat3], [0.5, C.plat2], [0.58, C.plat3], [1, C.plat4]]));
      word(g, 0.97, 0.37, { pt: 7, track: 0.2, fill: 'ink', maxW: 1.2, maxH: 0.15 });
      nameTitle(g, f, 0.3, 0.8, { face: 'chrome', pt: 14, depth: 4, glow: 0.15, maxW: 2.9, tfill: 'platinum' });
      contact(g, f, 0.3, 1.68, { anchor: 'bottom', fill: C.plat3, maxW: 2.9 });
    } });

  add({ name: 'FOUNDER BADGE', tone: 'dark', stock: 'UV BLACK', gold: true,
    say: ['The name in chrome over a chrome-gold badge holding the title', 'the P, PEPTICITY and the contact, centred'],
    front: function (g, f) {
      STOCK.uv(g);
      E.glow(g, 1.75, 1.0, 1.6, 0.7, 0.12);
      E.text(g, f.name, 1.75, 0.72, { id: 'name', align: 'center', pt: 18, track: 0.06, fill: 'chrome', depth: 4, glow: 0.22, maxW: 3.0 });
      var t = E.clean(f.title);
      if (t) {
        var m = E.measure(t, { px: 100, track: 0.4 });
        var bw = Math.min(2.7, (m.l + m.r) / 100 * 7 / 72 + 0.56);
        var pts = E.cut(1.75 - bw / 2, 1.08, bw, 0.36, [0.11, 0.11, 0.11, 0.11]);
        E.fill(g, pts, E.lin(g, 0, 1.08, 0, 1.44, [[0, 'rgba(164, 132, 93, 0.16)'], [1, 'rgba(51, 40, 20, 0.2)']]));
        E.stroke(g, pts, E.lin(g, 1.75 - bw / 2, 1.08, 1.75 + bw / 2, 1.44, [[0, C.gold3], [0.35, C.gold5], [0.6, C.gold2], [1, C.gold4]]), 0.008);
        E.text(g, t, 1.75, 1.26, { id: 'title', align: 'center', pt: 7, track: 0.4, fill: 'gold', maxW: bw - 0.3 });
      }
    },
    back: function (g, f) {
      STOCK.uv(g);
      E.drawP(g, 1.75 - 0.4, 0.28, 0.8, 0.6);
      word(g, 1.75, 1.04, { pt: 7.5, track: 0.5, fill: 'chrome', maxW: 3.0 });
      contact(g, f, 1.75, 1.34, { anchor: 'top', align: 'center', fill: C.plat3, maxW: 3.0, pt: 6.6, lh: 0.145 });
    } });

  add({ name: 'NAME FIRST', tone: 'light', stock: 'LIGHT GREY',
    say: ['The name, big, in gunmetal chrome', 'a small P and the contact lines'],
    front: function (g, f) {
      STOCK.grey(g);
      E.text(g, f.name, 0.3, 0.98, { id: 'name', v: 'base', pt: 26, track: 0.04, fill: 'gunmetal', depth: 4, maxW: 2.9, maxH: 0.5 });
      E.text(g, f.title, 0.3, 1.24, { id: 'title', pt: 7, track: 0.4, fill: 'ink', maxW: 2.9 });
      word(g, 3.2, 1.68, { align: 'right', pt: 6, track: 0.45, fill: 'gunmetal', maxW: 1.5 });
    },
    back: function (g, f) {
      STOCK.grey(g);
      E.drawP(g, 0.24, 0.22, 0.6, 0.44);
      contact(g, f, 3.2, 1.66, { anchor: 'bottom', align: 'right', fill: C.plat1, maxW: 2.6 });
    } });

  add({ name: 'VIAL COLUMN', tone: 'dark', stock: 'MATTE BLACK',
    say: ['PEPTICITY running up the side beside the P, like the vial', 'the word up the side, the name and the contact'],
    front: function (g) {
      STOCK.matte(g);
      word(g, 0.46, 1.0, { rot: -90, pt: 13, track: 0.14, fill: 'chrome', depth: 3, maxW: 1.5 });
      E.glow(g, 1.55, 1.0, 1.0, 0.6, 0.1);
      E.drawP(g, 0.85, 0.5, 1.4, 1.0);
    },
    back: function (g, f) {
      STOCK.matte(g);
      word(g, 0.36, 1.0, { rot: -90, pt: 7, track: 0.4, fill: 'platinum', maxW: 1.5 });
      nameTitle(g, f, 0.7, 0.62, { face: 'chrome', pt: 14, depth: 4, glow: 0.18, maxW: 2.5, tfill: 'platinum' });
      contact(g, f, 0.7, 1.66, { anchor: 'bottom', fill: C.plat3, maxW: 2.5 });
    } });

  add({ name: 'PLATINUM BEAM', tone: 'light', stock: 'PLATINUM',
    say: ['The PEPTICITY letters standing on a beam of light, on platinum', 'the name standing on the beam, contact below'],
    front: function (g) {
      STOCK.platinum(g);
      E.beam(g, -0.125, 3.625, 1.18, 0.018, { spread: 5, alpha: 0.9 });
      E.drawWord(g, 1.75, 1.18 - 0.06 - 0.24, 0.24, { align: 'center' });
    },
    back: function (g, f) {
      STOCK.platinum(g);
      E.beam(g, -0.125, 3.625, 1.18, 0.014, { spread: 5, alpha: 0.85 });
      E.text(g, f.name, 0.3, 0.86, { id: 'name', v: 'base', pt: 15, track: 0.06, fill: 'gunmetal', depth: 3, maxW: 2.9 });
      E.text(g, f.title, 0.3, 1.08, { id: 'title', v: 'base', pt: 6.4, track: 0.34, fill: 'ink', maxW: 2.9 });
      contact(g, f, 0.3, 1.4, { anchor: 'top', fill: C.plat1, maxW: 2.9 });
    } });

  add({ name: 'THE SLASH', tone: 'dark', stock: 'SMOKED GLASS',
    say: ['Smoked glass and matte black split by a slash of light', 'the same slash, the name and contact on the black'],
    front: function (g) {
      STOCK.matte(g);
      var pts = [[-0.125, -0.125], [1.55, -0.125], [1.15, 2.125], [-0.125, 2.125]];
      E.fill(g, pts, E.lin(g, 0, 0, 1.55, 2, [[0, C.plat1], [0.6, C.smoke], [1, C.black1]]));
      clip(g, pts, function () { E.tex(g, 'smoked', 0.9, 'overlay'); });
      lightLine(g, 1.55, -0.125, 1.15, 2.125, 0.01);
      E.drawP(g, 0.18, 0.62, 0.95, 0.76);
      word(g, 2.4, 1.0, { pt: 11, track: 0.18, fill: 'chrome', depth: 3, glow: 0.2, maxW: 1.6 });
    },
    back: function (g, f) {
      STOCK.matte(g);
      var pts = [[-0.125, -0.125], [1.25, -0.125], [0.85, 2.125], [-0.125, 2.125]];
      E.fill(g, pts, E.lin(g, 0, 0, 1.25, 2, [[0, C.plat1], [0.6, C.smoke], [1, C.black1]]));
      clip(g, pts, function () { E.tex(g, 'smoked', 0.9, 'overlay'); });
      lightLine(g, 1.25, -0.125, 0.85, 2.125, 0.01);
      E.drawP(g, 0.14, 0.24, 0.62, 0.45);
      nameTitle(g, f, 1.5, 0.62, { face: 'chrome', pt: 13, depth: 3, glow: 0.15, maxW: 1.75, tfill: 'platinum' });
      contact(g, f, 1.5, 1.66, { anchor: 'bottom', fill: C.plat3, maxW: 1.75 });
    } });

  D.forEach(function (d, i) { d.no = i + 1; d.code = (i < 9 ? '0' : '') + (i + 1); });

  /* draw one side of one card into a canvas.
     opt.dpi: 300 for the print file (bleed included); opt.marks: crop marks in a slug outside the bleed;
     otherwise the canvas is a screen preview of the trimmed card. opt.textOnly: proof mode. */
  function render(canvas, i, side, f, opt) {
    opt = opt || {};
    var d = D[i], c = canvas.getContext('2d'), K = E.CARD, g;
    if (opt.dpi) {
      var s = opt.dpi, off = K.bleed + (opt.marks ? K.slug : 0);
      canvas.width = Math.round((K.w + 2 * off) * s);
      canvas.height = Math.round((K.h + 2 * off) * s);
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, canvas.width, canvas.height);
      if (opt.marks) { c.fillStyle = '#ffffff'; c.fillRect(0, 0, canvas.width, canvas.height); }
      g = new E.G(c, s, off * s, off * s, K.w, K.h, K.bleed, opt);
    } else {
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, canvas.width, canvas.height);
      g = new E.G(c, canvas.width / K.w, 0, 0, K.w, K.h, K.bleed, opt);
    }
    d[side](g, f);
    if (opt.dpi && opt.marks) { E.cropMarks(g); }
    return g;
  }

  P.cards = { list: D, render: render, W: W, H: H };
})();
