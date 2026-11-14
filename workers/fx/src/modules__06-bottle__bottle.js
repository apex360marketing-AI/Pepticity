<script data-pep-src="modules/06-bottle/bottle.js">
(function () {
  'use strict';
  PEP.register('bottle', {
    init: function (root, ctx) {
      var tpl = root.querySelector('.pep-bottle-tpl');
      var mounted = [];
      var phase = 0.2;

      function slots(host) {
        var word = host.querySelector('.pep-bottle-slot--word');
        var mark = host.querySelector('.pep-bottle-slot--mark');
        // label logos wait for the entrance: nothing printed floats on the dark
        if (word) { ctx.emit('logo3d:slot', { el: word, kind: 'wordv', phase: phase, hold: true }); }
        if (mark) { ctx.emit('logo3d:slot', { el: mark, kind: 'labelmark', phase: phase + 0.2, hold: true }); }
      }
      function rise(host) {
        host.classList.remove('pep-bottle-lit');
        void host.offsetWidth;                    // restart the sweep
        host.classList.add('pep-bottle-lit');
      }
      function mount(req) {
        var host = req && req.el;
        if (!host || !tpl || host.getAttribute('data-pep-bottle') === 'on') { return; }
        host.setAttribute('data-pep-bottle', 'on');
        host.appendChild(tpl.content.cloneNode(true));
        var img = host.querySelector('.pep-bottle-img');
        var line = host.querySelector('.pep-bottle-line');
        // plain = the vial alone, with nothing printed on it. For hosts that are pinned or moved: the label logos are drawn
        // by the shared 3D canvas from the host's place on screen, and cannot follow a pinned or transformed element.
        var plain = host.hasAttribute('data-bottle-plain');
        if (img) { img.alt = host.getAttribute('data-bottle-alt') || ''; }
        if (line) { line.textContent = plain ? '' : (host.getAttribute('data-bottle-line') || ''); }
        if (!plain) {
          phase += 0.7;
          mounted.push(host);
          slots(host);
        }

        if (ctx.motion.reduced) { host.classList.add('pep-bottle-lit'); return; }
        host.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { rise(host); } });
        host.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse' && !host.hasAttribute('data-bottle-keep')) { host.classList.remove('pep-bottle-lit'); } });
        host.addEventListener('focus', function () { rise(host); });
        host.addEventListener('click', function () { rise(host); });
        host.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); rise(host); } });
        if (req.lit !== false) { setTimeout(function () { rise(host); }, 700); }
      }

      ctx.on('bottle:mount', mount);
      ctx.on('bottle:rise', function (req) { if (req && req.el && !ctx.motion.reduced) { rise(req.el); } });
      ctx.on('logo3d:ready', function () { mounted.forEach(slots); });
      ctx.emit('bottle:ready');
    }
  });
})();
</script>