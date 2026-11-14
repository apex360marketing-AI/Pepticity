<script data-pep-src="modules/11-crest/crest.js">
(function () {
  'use strict';
  PEP.register('crest', {
    init: function (root, ctx) {
      var slot = root.querySelector('.pep-crest-slot');
      var hit = root.querySelector('.pep-crest-mark');
      if (!slot) { return; }

      // how the P is seen: the numbers live on the slot in crest.html (lens, size, pointer answer, light). The engine clamps them.
      var seen = function (key) { var n = parseFloat(slot.getAttribute('data-' + key)); return isFinite(n) ? n : undefined; };

      // the engine tells us where the beam is and how big the P is drawn; the page line and the floor light are laid from that.
      // No layout is read here: two numbers are written, and only when they change.
      var sized = 0;
      function place(info) {
        root.style.setProperty('--pep-crest-dy', info.dy.toFixed(1) + 'px');
        if (info.unit !== sized) {
          sized = info.unit;
          root.style.setProperty('--pep-crest-hh', (info.markH * info.unit / 2).toFixed(1) + 'px');
          root.style.setProperty('--pep-crest-hw', (info.markW * info.unit / 2).toFixed(1) + 'px');
        }
      }

      var view = { lens: seen('lens'), fill: seen('fill'), fillW: seen('fill-w'), level: seen('level') === 1, pointer: [seen('answer-x'), seen('answer-y')],
        light: seen('light'), hit: hit, track: place };
      // the same contract as every P on the page. hold: it waits for the entrance, so nothing below the first screen is the
      // entrance's starting point. phase 0.75 is the phase this P had when it stood in the hero.
      function announce() { ctx.emit('logo3d:slot', { el: slot, kind: 'mark', phase: 0.75, interactive: true, hold: true, view: view }); }

      root.setAttribute('data-3d', 'pending');          // script is running: the stage opens for the 3D P
      ctx.on('logo3d:ready', announce); announce();
      ctx.on('logo3d:on', function () { root.setAttribute('data-3d', 'on'); });
      ctx.on('logo3d:off', function () { root.setAttribute('data-3d', 'off'); });   // no 3D: fold down to the calm band

      // the stage lights once, the first time a good part of the crest is on screen
      if (ctx.motion.reduced || typeof IntersectionObserver !== 'function') { return; }
      root.setAttribute('data-crest', 'dark');
      var io = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) { root.setAttribute('data-crest', 'lit'); io.disconnect(); return; }
        }
      }, { threshold: 0.3 });
      io.observe(root);
    }
  });
})();
</script>