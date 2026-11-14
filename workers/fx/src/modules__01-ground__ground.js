<script data-pep-src="modules/01-ground/ground.js">
(function () {
  'use strict';
  PEP.register('ground', {
    init: function (root, ctx) {
      // BG-21 PERFORATED QUILT (owner, Nov 12 2026): the quilt surface at 12% over the black, and the pointer lights the
      // holes near it in the logo blue. Variant A CALM (owner, Nov 13 2026): every hole breathes a faint blue, one breath
      // every 6 s, and a thin platinum rim lights every diamond. pep-quilt.js is a shared file (the dashboards mount the
      // same one). It handles touch screens, reduced motion and hidden tabs itself. If it cannot load or there is no
      // WebGL, nothing is added. It starts once the 3D logo is on screen (or has given up), so its first frame never
      // competes with the logo's start.
      var started = false;
      function mount() { if (window.PEPQuilt) { window.PEPQuilt.mount(root, { surface: 0.12, variant: 'A' }); } }
      function start() {
        if (started) { return; }
        started = true;
        if (window.PEPQuilt) { mount(); return; }
        var s = document.createElement('script');
        s.src = 'assets/ground/pep-quilt.js';
        s.async = true;
        s.onload = mount;
        document.head.appendChild(s);
      }
      ctx.on('logo3d:on', start);
      ctx.on('logo3d:off', start);
      setTimeout(start, 10000);                 // a page without the 3D logo starts anyway
    }
  });
})();
</script>