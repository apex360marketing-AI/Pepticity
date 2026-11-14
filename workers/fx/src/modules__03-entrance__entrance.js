<script data-pep-src="modules/03-entrance/entrance.js">
(function () {
  'use strict';
  PEP.register('entrance', {
    init: function (root, ctx) {
      var KEY = 'pep_entrance_seen';
      var replay = /[?&]intro\b/.test(location.search);
      var seen = false;
      try { seen = sessionStorage.getItem(KEY) === '1'; } catch (e) {}

      var finished = false, started = false;
      function finish() {
        if (finished) { return; }
        finished = true;
        try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
        root.hidden = true;                      // stays in the page (the build checks every section is present), just not shown
        ctx.emit('entrance:done');
      }

      // no entrance: reduced motion, or already seen this visit
      if (ctx.motion.reduced || (seen && !replay)) { finish(); return; }

      var ring = root.querySelector('.pep-entrance-ring');
      var beam = root.querySelector('.pep-entrance-beam');
      var origin = null;                          // the first 3D P on the page: the iris opens from its beam
      ctx.on('logo3d:slot', function (req) {
        if (!origin && req && req.el && req.kind === 'mark' && !req.hold) { origin = req.el; place(); }
      });
      function place() {
        if (!origin) { return; }
        var r = origin.getBoundingClientRect();
        if (r.width < 2) { return; }
        root.style.setProperty('--pep-entrance-x', (r.left + r.width / 2).toFixed(1) + 'px');
        root.style.setProperty('--pep-entrance-y', (r.top + r.height * 0.5).toFixed(1) + 'px');
      }

      function drawBeam() {
        if (finished) { return; }
        // hand over from the ignition animation to the full draw without a jump
        beam.style.transform = getComputedStyle(beam).transform;
        beam.style.opacity = getComputedStyle(beam).opacity;
        beam.style.animationName = 'none';
        void beam.offsetWidth;
        beam.classList.add('pep-entrance-draw');
        beam.style.transform = ''; beam.style.opacity = '';
      }
      function openIris() {
        if (finished) { return; }
        beam.classList.add('pep-entrance-fade');
        ring.classList.add('pep-entrance-open');
        var max = Math.hypot(window.innerWidth, window.innerHeight) + 40;
        var t0 = null, DUR = 1050;
        function step(now) {
          if (finished) { return; }
          if (t0 === null) { t0 = now; }        // the clock starts on the first frame actually drawn
          var k = Math.min(1, (now - t0) / DUR);
          var e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;      // ease in-out cubic
          root.style.setProperty('--pep-entrance-r', (e * max).toFixed(1) + 'px');
          if (k < 1) { requestAnimationFrame(step); } else { clearTimeout(hard); finish(); }
        }
        requestAnimationFrame(step);
      }

      // Beat 1 (CSS, runs by itself): a hairline of light ignites on the dark while the 3D logo loads.
      // Beat 2: the logo is standing on the dark; its beam draws across the screen.
      // Beat 3: the iris opens from the P.
      function begin() {
        if (started || finished) { return; }
        started = true;
        place();
        setTimeout(drawBeam, 320);
        setTimeout(openIris, 320 + 760);
      }
      ctx.emit('entrance:start');
      ctx.on('logo3d:on', begin);                 // the logo's first frame is on screen
      ctx.on('logo3d:off', begin);                // no 3D here: go straight on
      setTimeout(begin, 1600);                    // slow device: do not wait longer than this (the logo then arrives on the open page)
      var hard = setTimeout(finish, 5000);        // never a frame longer than 5 s
    }
  });
})();
</script>