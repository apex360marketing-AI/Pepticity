/* PEPTICITY brand lab: 20 vector logo concepts (D01\u2013D20).
   Each concept = a mark (SVG, currentColor) + a wordmark (Google font, capitals).
   lockup(def, mode) returns HTML for 'flat' (horizontal/primary) or 'print' (vertical, for the bottle). */
(function (W) {
  'use strict';
  var S = function (inner, vb) { return '<svg class="mk" viewBox="' + (vb || '0 0 100 100') + '" aria-hidden="true" fill="none" stroke="currentColor">' + inner + '</svg>'; };
  var P_BOWL = function (sw) { return '<path d="M26 94V10h26a25 25 0 0 1 0 50H26" stroke-width="' + sw + '" stroke-linejoin="miter"/>'; };

  var D = [
    { id: 'D01', name: 'NODE', base: 'b0', ink: '#f4f1ec', font: "'Syne'", w: 800, ls: '.16em', lock: 'stack',
      note: 'A single heavy line draws the P and ends in a bond node.',
      mark: S('<path d="M26 94V8h28a26 26 0 0 1 0 52h-2" stroke-width="13"/><path d="M26 60h6" stroke-width="13"/><circle cx="41" cy="60" r="8.5" fill="currentColor" stroke="none"/>') },
    { id: 'D02', name: 'LINK', base: 'b1', ink: '#ffffff', font: "'Unbounded'", w: 700, ls: '.08em', lock: 'stack',
      note: 'Three linked rings: amino acids joined into one chain.',
      mark: S('<circle cx="24" cy="50" r="17" stroke-width="7"/><circle cx="50" cy="50" r="17" stroke-width="7"/><circle cx="76" cy="50" r="17" stroke-width="7"/>') },
    { id: 'D03', name: 'COUTURE', base: 'b2', ink: '#ffffff', accent: '#c8344d', font: "'Bodoni Moda'", w: 500, ls: '.22em', lock: 'stack',
      note: 'Fashion-house didone capitals with a garnet hairline.',
      mark: S('<path d="M4 50H40M60 50H96" stroke-width="2.2"/><path d="M50 40l10 10-10 10-10-10z" fill="currentColor" stroke="none"/>', '0 0 100 100') },
    { id: 'D04', name: 'COLUMN', base: 'b3', ink: '#ffffff', font: "'Big Shoulders Display'", w: 900, ls: '.12em', lock: 'vertical',
      note: 'Tall condensed capitals that climb the vial, signed with a framed P.',
      mark: S('<rect x="5" y="5" width="90" height="90" stroke-width="7"/><path d="M36 76V26h16a13 13 0 0 1 0 26H36" stroke-width="9"/>') },
    { id: 'D05', name: 'SEAL', base: 'b4', ink: '#7d1628', font: "'Cormorant Garamond'", w: 600, ls: '.2em', lock: 'stack',
      note: 'An apothecary seal that names the promise around its rim.',
      mark: '<svg class="mk" viewBox="0 0 100 100" aria-hidden="true"><defs><path id="sealp" d="M50 50m-37 0a37 37 0 1 1 74 0a37 37 0 1 1-74 0"/></defs><circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="50" r="29" fill="none" stroke="currentColor" stroke-width="1"/><text fill="currentColor" font-family="Cormorant Garamond, serif" font-weight="600" font-size="8.6" letter-spacing="2.2"><textPath href="#sealp">CLINICIAN-LED \u00b7 LAB-PROVEN \u00b7 VERIFIED LOTS \u00b7</textPath></text><text x="50" y="62" text-anchor="middle" fill="currentColor" font-family="Cormorant Garamond, serif" font-weight="600" font-size="34">P</text></svg>' },
    { id: 'D06', name: 'STACK', base: 'b0', ink: '#f4f1ec', accent: '#c8344d', font: "'Anton'", w: 400, ls: '.06em', lock: 'split-stack',
      note: 'The name split in two and stacked like a pharmacy stamp.', mark: '' },
    { id: 'D07', name: 'BEAD', base: 'b1', ink: '#ffffff', font: "'Space Grotesk'", w: 700, ls: '.14em', lock: 'inline',
      note: 'The P is drawn as a chain of residues, one bead at a time.',
      mark: S('<path d="M28 90V10H55L72 30L55 50H28" stroke-width="3"/>' + [[28, 90], [28, 70], [28, 50], [28, 30], [28, 10], [55, 10], [72, 30], [55, 50]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="7.5" fill="currentColor" stroke="none"/>'; }).join('')) },
    { id: 'D08', name: 'HEX', base: 'b2', ink: '#ffffff', font: "'Michroma'", w: 400, ls: '.18em', lock: 'stack',
      note: 'A benzene-ring hexagon holding a precise, engineered P.',
      mark: S('<path d="M50 4L90 27V73L50 96L10 73V27Z" stroke-width="6" stroke-linejoin="round"/><path d="M39 74V28h13a12 12 0 0 1 0 24H39" stroke-width="8"/>') },
    { id: 'D09', name: 'ORBIT', base: 'b3', ink: '#ffffff', accent: '#e05a70', font: "'Sora'", w: 700, ls: '.16em', lock: 'stack',
      note: 'A P held in orbit, with one bright point tracing its path.',
      mark: S('<ellipse cx="50" cy="50" rx="47" ry="17" transform="rotate(-24 50 50)" stroke-width="3"/><path d="M38 80V20h14a17 17 0 0 1 0 34H38" stroke-width="10"/><circle cx="90" cy="33" r="5.5" fill="currentColor" stroke="none"/>') },
    { id: 'D10', name: 'BOND', base: 'b4', ink: '#7d1628', font: "'Red Hat Display'", w: 900, ls: '.1em', lock: 'stack',
      note: 'Two circles overlap into one: the peptide bond, made simple.',
      mark: S('<circle cx="37" cy="50" r="28" stroke-width="8"/><circle cx="63" cy="50" r="28" stroke-width="8"/>') },
    { id: 'D11', name: 'HORIZON', base: 'b0', ink: '#f4f1ec', accent: '#c8344d', font: "'Lexend Zetta'", w: 600, ls: '.02em', lock: 'word-dot',
      note: 'Ultra-wide capitals and one garnet point. Nothing else.', mark: '' },
    { id: 'D12', name: 'ARCH', base: 'b1', ink: '#ffffff', font: "'Gloock'", w: 400, ls: '.14em', lock: 'stack',
      note: 'The shoulder of a vial, drawn as a doorway, with a drop of light.',
      mark: S('<path d="M18 94V46a32 32 0 0 1 64 0V94" stroke-width="6"/><circle cx="50" cy="56" r="7" fill="currentColor" stroke="none"/>') },
    { id: 'D13', name: 'SPLIT', base: 'b2', ink: '#ffffff', accent: '#c8344d', font: "'Archivo'", w: 800, ls: '.06em', lock: 'split-bar', stretch: 125,
      note: 'Expanded grotesk cut by a garnet bar: PEPTI | CITY.', mark: '' },
    { id: 'D14', name: 'APEX P', base: 'b3', ink: '#ffffff', font: "'Krona One'", w: 400, ls: '.12em', lock: 'inline',
      note: 'A P whose bowl is a forward chevron: progress, built in.',
      mark: S('<path d="M26 94V8M26 8L70 34L26 60" stroke-width="13" stroke-linejoin="miter" stroke-miterlimit="10"/>') },
    { id: 'D15', name: 'CAPSULE', base: 'b4', ink: '#1b1416', accent: '#8e1b30', font: "'DM Serif Display'", w: 400, ls: '.14em', lock: 'stack',
      note: 'A serif P set inside a tall capsule frame, like a prescription stamp.',
      mark: '<svg class="mk" viewBox="0 0 100 100" aria-hidden="true"><rect x="22" y="3" width="56" height="94" rx="28" fill="none" stroke="currentColor" stroke-width="3.5"/><text x="50" y="67" text-anchor="middle" fill="currentColor" font-family="DM Serif Display, serif" font-size="48">P</text></svg>' },
    { id: 'D16', name: 'PLATINUM', base: 'b0', ink: 'silver', font: "'Tenor Sans'", w: 400, ls: '.42em', lock: 'ruled',
      note: 'Wide-set capitals between two hairlines, printed in platinum.', mark: '' },
    { id: 'D17', name: 'HELIX', base: 'b1', ink: '#ffffff', font: "'Outfit'", w: 800, ls: '.14em', lock: 'inline',
      note: 'Two strands crossing inside a circle: structure and balance.',
      mark: S('<circle cx="50" cy="50" r="46" stroke-width="4"/><path d="M8 50C22 24 36 24 50 50S78 76 92 50" stroke-width="5"/><path d="M8 50C22 76 36 76 50 50S78 24 92 50" stroke-width="5"/>') },
    { id: 'D18', name: 'LATTICE', base: 'b2', ink: '#ffffff', font: "'IBM Plex Mono'", w: 600, ls: '.18em', lock: 'stack',
      note: 'A lab grid where one path lights up into a P.',
      mark: S([15, 50, 85].map(function (x) { return [15, 50, 85].map(function (y) { return '<circle cx="' + x + '" cy="' + y + '" r="4.5" fill="currentColor" stroke="none" opacity=".45"/>'; }).join(''); }).join('') + '<path d="M15 85V15H62L85 32L62 50H15" stroke-width="7" stroke-linejoin="round"/><circle cx="15" cy="85" r="7" fill="currentColor" stroke="none"/>') },
    { id: 'D19', name: 'BLOCK', base: 'b3', ink: '#ffffff', font: "'Familjen Grotesk'", w: 700, ls: '.14em', lock: 'inline',
      note: 'A solid block with the P cut out of it: bold at any size.',
      mark: '<svg class="mk" viewBox="0 0 100 100" aria-hidden="true"><defs><mask id="blkm"><rect width="100" height="100" fill="#fff"/><path d="M32 82V18h22a18 18 0 0 1 0 36H32" fill="none" stroke="#000" stroke-width="13"/></mask></defs><rect x="2" y="2" width="96" height="96" rx="10" fill="currentColor" mask="url(#blkm)"/></svg>' },
    { id: 'D20', name: 'MOLECULE', base: 'b4', ink: '#7d1628', font: "'Instrument Serif'", w: 400, ls: '.16em', lock: 'stack',
      note: 'Five atoms in a cross: care and chemistry in one symbol.',
      mark: S('<path d="M50 20V80M20 50H80" stroke-width="5"/>' + [[50, 16], [50, 84], [16, 50], [84, 50]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="11" stroke-width="5"/>'; }).join('') + '<circle cx="50" cy="50" r="13" fill="currentColor" stroke="none"/>') }
  ];

  var FONTS = 'https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wdth,wght@125,800&family=Barlow+Semi+Condensed:wght@600&family=Big+Shoulders+Display:wght@900&family=Bodoni+Moda:wght@500&family=Cormorant+Garamond:wght@600&family=DM+Serif+Display&family=Familjen+Grotesk:wght@700&family=Gloock&family=IBM+Plex+Mono:wght@500;600&family=Instrument+Serif&family=Krona+One&family=Lexend+Zetta:wght@600&family=Michroma&family=Outfit:wght@800&family=Red+Hat+Display:wght@900&family=Sora:wght@700&family=Space+Grotesk:wght@700&family=Syne:wght@800&family=Tenor+Sans&family=Unbounded:wght@700&display=swap';

  function word(d, cls, text) {
    var st = 'font-family:' + d.font + ';font-weight:' + d.w + ';letter-spacing:' + d.ls + (d.stretch ? ';font-stretch:' + d.stretch + '%' : '');
    return '<span class="wm ' + (cls || '') + '" style="' + st + '">' + (text || 'PEPTICITY') + '</span>';
  }
  function ink(d) { return d.ink === 'silver' ? 'var(--silver,#d9dde2)' : d.ink; }

  // mode: 'flat' = primary horizontal-ish lockup; 'print' = what goes on the bottle
  function lockup(d, mode) {
    var acc = d.accent || ink(d), m = d.mark;
    var lot = mode === 'print' ? '<span class="lot">LOT PX-2611-A</span>' : '';
    switch (d.lock) {
      case 'stack':
        return '<div class="lk lk-stack">' + (m ? '<span class="mkw">' + m + '</span>' : '') + word(d) + (d.accent && d.id === 'D03' ? '<i class="hair" style="background:' + acc + '"></i>' : '') + lot + '</div>';
      case 'inline':
        return mode === 'print'
          ? '<div class="lk lk-stack">' + '<span class="mkw">' + m + '</span>' + word(d) + lot + '</div>'
          : '<div class="lk lk-inline"><span class="mkw">' + m + '</span>' + word(d) + '</div>';
      case 'vertical':
        return mode === 'print'
          ? '<div class="lk lk-vert">' + word(d, 'rot') + '<span class="mkw">' + m + '</span></div>'
          : '<div class="lk lk-inline"><span class="mkw">' + m + '</span>' + word(d) + '</div>';
      case 'split-stack':
        return '<div class="lk lk-split">' + word(d, 'big', 'PEPTI') + '<i class="bar" style="background:' + acc + '"></i>' + word(d, 'big', 'CITY') + lot + '</div>';
      case 'split-bar':
        return '<div class="lk lk-splitbar">' + word(d, '', 'PEPTI') + '<i class="vbar" style="background:' + acc + '"></i>' + word(d, '', 'CITY') + '</div>' + (mode === 'print' ? '<div class="lk-under">' + lot + '</div>' : '');
      case 'word-dot':
        return '<div class="lk lk-stack">' + '<span class="wdot">' + word(d) + '<b style="background:' + acc + '"></b></span>' + lot + '</div>';
      case 'ruled':
        return '<div class="lk lk-ruled"><i class="rule"></i>' + word(d) + '<i class="rule"></i>' + lot + '</div>';
    }
    return word(d);
  }

  var CSS = [
    '.lk{display:flex;align-items:center;justify-content:center;color:inherit;line-height:1}',
    '.lk .wm{display:block;white-space:nowrap;text-transform:uppercase}',
    '.lk-stack{flex-direction:column;gap:.55em}',
    '.lk-stack .mkw{width:2.6em;height:2.6em}',
    '.lk-inline{gap:.6em}',
    '.lk-inline .mkw{width:1.55em;height:1.55em}',
    '.mkw{display:block;flex:none}.mkw .mk,.mkw svg{width:100%;height:100%;display:block;overflow:visible}',
    '.lk-vert{flex-direction:column;gap:.7em}.lk-vert .rot{writing-mode:vertical-rl;transform:rotate(180deg);font-size:2.3em}.lk-vert .mkw{width:1.3em;height:1.3em}',
    '.lk-split{flex-direction:column;gap:.18em}.lk-split .big{font-size:1.9em;letter-spacing:.06em}.lk-split .bar{display:block;width:100%;height:.12em}',
    '.lk-splitbar{gap:.32em}.lk-splitbar .vbar{display:block;width:.14em;height:1.05em}',
    '.lk-under{display:flex;justify-content:center;margin-top:.9em}',
    '.wdot{display:flex;align-items:flex-end;gap:.18em}.wdot b{display:block;width:.26em;height:.26em;border-radius:50%;margin-bottom:.08em}',
    '.lk-ruled{flex-direction:column;gap:.6em}.lk-ruled .rule{display:block;width:100%;height:1px;background:currentColor;opacity:.85}',
    '.lk .hair{display:block;width:3.2em;height:2px}',
    '.lk-under .lot,.lk .lot{display:block;font:500 .34em "IBM Plex Mono",monospace;letter-spacing:.22em;opacity:.8;margin-top:.9em}'
  ].join('\n');


  // extras for round 2 (her current bottle): V1 = H3 ASCENT rebuilt as vector
  var X = [
    { id: 'V1', name: 'ASCENT', base: 'b2', ink: '#ffffff', font: "'Barlow Semi Condensed'", w: 600, ls: '.14em', lock: 'vertical',
      note: 'Higgsfield H3 rebuilt as a print-ready vector: clean vertical capitals and a framed P.',
      mark: S('<rect x="6" y="6" width="88" height="88" stroke-width="6"/><path d="M38 76V26h15a12.5 12.5 0 0 1 0 25H38" stroke-width="8"/>') }
  ];
  W.PEPLOGOS = { D: D, X: X, lockup: lockup, ink: ink, FONTS: FONTS, CSS: CSS };
})(window);
