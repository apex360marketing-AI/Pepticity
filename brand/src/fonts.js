/* PEPTICITY font lab: 20 candidate typefaces for the wordmark and the peptide names. */
(function (W) {
  'use strict';
  var F = [
    { id: 'F01', name: 'SYNCOPATE', fam: "'Syncopate'", w: 700, ls: '.12em', why: 'Wide, airy capitals. Reads like a luxury tech brand.' },
    { id: 'F02', name: 'HUBOT SANS EXPANDED', fam: "'Hubot Sans'", w: 900, st: 125, ls: '.04em', why: 'Expanded and heavy. Confident from across the room.' },
    { id: 'F03', name: 'MONA SANS CONDENSED', fam: "'Mona Sans'", w: 900, st: 75, ls: '.05em', why: 'Tall, tight and powerful. Fits a narrow vial perfectly.' },
    { id: 'F04', name: 'CLIMATE CRISIS', fam: "'Climate Crisis'", w: 400, ls: '.02em', why: 'Dramatic, ultra-black display face. Pure attitude.' },
    { id: 'F05', name: 'FUNNEL DISPLAY', fam: "'Funnel Display'", w: 800, ls: '.06em', why: 'New and modern, with sharp, unusual cuts in the letters.' },
    { id: 'F06', name: 'BRICOLAGE CONDENSED', fam: "'Bricolage Grotesque'", w: 800, st: 75, ls: '.04em', why: 'Characterful grotesk with ink-trap details up close.' },
    { id: 'F07', name: 'DELA GOTHIC', fam: "'Dela Gothic One'", w: 400, ls: '.06em', why: 'Heavy and geometric, with a Japanese poster feel.' },
    { id: 'F08', name: 'RUBIK MONO', fam: "'Rubik Mono One'", w: 400, ls: '.02em', why: 'Wide, blocky monospace capitals. Very graphic.' },
    { id: 'F09', name: 'TEKTUR', fam: "'Tektur'", w: 700, ls: '.08em', why: 'Angular, engineered corners. Precision instrument vibe.' },
    { id: 'F10', name: 'MARTIAN MONO', fam: "'Martian Mono'", w: 700, st: 112.5, ls: '.06em', why: 'Wide mono from a lab printout. Perfect for lot codes too.' },
    { id: 'F11', name: 'DOTO MATRIX', fam: "'Doto'", w: 900, ls: '.08em', why: 'Dot-matrix letters, like a lab instrument display.' },
    { id: 'F12', name: 'SHOULDERS STENCIL', fam: "'Big Shoulders Stencil Display'", w: 900, ls: '.08em', why: 'Tall stencil cut. Industrial, sporty, unmistakable.' },
    { id: 'F13', name: 'SAIRA STENCIL', fam: "'Saira Stencil One'", w: 400, ls: '.06em', why: 'Wide technical stencil, like a crate stamp.' },
    { id: 'F14', name: 'ANYBODY ULTRA-WIDE', fam: "'Anybody'", w: 900, st: 150, ls: '.02em', why: 'Ultra-expanded black. Impossible to miss.' },
    { id: 'F15', name: 'DARKER GROTESQUE', fam: "'Darker Grotesque'", w: 900, ls: '.04em', why: 'Very tall and narrow. Elegant but strong.' },
    { id: 'F16', name: 'GEIST', fam: "'Geist'", w: 800, ls: '.08em', why: 'Clean Swiss-tech sans. Modern without trying too hard.' },
    { id: 'F17', name: 'ZEN DOTS', fam: "'Zen Dots'", w: 400, ls: '.06em', why: 'Rounded, futuristic shapes. Friendly high-tech.' },
    { id: 'F18', name: 'AGDASIMA', fam: "'Agdasima'", w: 700, ls: '.1em', why: 'Condensed sci-tech capitals with sharp terminals.' },
    { id: 'F19', name: 'ITALIANA', fam: "'Italiana'", w: 400, ls: '.18em', why: 'Thin, high-fashion serif capitals. The quiet luxury option.' },
    { id: 'F20', name: 'FRAUNCES BLACK', fam: "'Fraunces'", w: 900, ls: '.04em', why: 'Soft, heavy editorial serif. Warm and premium.' }
  ];
  var URL = 'https://fonts.googleapis.com/css2?family=Syncopate:wght@700&family=Hubot+Sans:wdth,wght@125,900&family=Mona+Sans:wdth,wght@75,900&family=Climate+Crisis&family=Funnel+Display:wght@800&family=Bricolage+Grotesque:opsz,wdth,wght@96,75,800&family=Dela+Gothic+One&family=Rubik+Mono+One&family=Tektur:wght@700&family=Martian+Mono:wdth,wght@112.5,700&family=Doto:wght@900&family=Big+Shoulders+Stencil+Display:wght@900&family=Saira+Stencil+One&family=Anybody:wdth,wght@150,900&family=Darker+Grotesque:wght@900&family=Geist:wght@800&family=Zen+Dots&family=Agdasima:wght@700&family=Italiana&family=Fraunces:opsz,wght@144,900&family=IBM+Plex+Mono:wght@500&family=Hanken+Grotesk:wght@400;500;600&display=swap';
  function style(f) { return 'font-family:' + f.fam + ',sans-serif;font-weight:' + f.w + ';letter-spacing:' + f.ls + (f.st ? ';font-stretch:' + f.st + '%' : ''); }
  W.PEPFONTS = { F: F, URL: URL, style: style };
})(window);
