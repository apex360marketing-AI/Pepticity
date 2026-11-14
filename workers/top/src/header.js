(function () {
  'use strict';
  /* 05-header: THE MENU (owner's pick, menu 58, Nov 13 2026; behaviour from his menu session) with the store's HEADER P.
     - The P: the live 3D mark (logo 07), drawn by 02-logo3d into .pep-header-mark with its edge light; it waits for the
       entrance (hold) and lifts and turns once on hover (interactive). The owner's pick "B · TUNED" (Nov 13 2026).
     - SHOP, RESEARCH and ABOUT are plain links to their sections. SHOP points at THE LINEUP while product names show, at the
       plate of THE SHELF otherwise. CART asks the cart to open (cart:open) and shows the count it sends (cart:changed).
     - PEPTIDES opens the drop-down: on hover with a mouse, on a click, or with Enter or Space. Esc, a click outside it, or
       the keyboard leaving it closes it. It is filled from assets/catalogue.json while names show: names only, products
       held back in config.js (hidden) left out, four columns (peptides in two halves, blends, everything else). A name asks
       THE LINEUP to stand on that product (lineup:go { sku }); if the lineup cannot, the page goes to the lineup.
     - Under 1200 px the MENU key opens the other keys in a panel; Esc or a click outside closes it.
     - The bar is sticky. It steps up out of the way while the visitor reads down the page (or after a key took them
       somewhere) and comes back when they scroll up, at the top of the page, or when the keyboard reaches it. Away from the
       top it is marked data-float (header.css then stands it over the 3D canvas).
     No wording here: it is all in header.html, except the product names and the count. */
  PEP.register('header', {
    init: function (root, ctx) {
      var cfg = ctx.config || {}, flags = cfg.flags || {}, cleared = flags.COUNSEL_CLEARED || {};
      var q = function (s, el) { return (el || root).querySelector(s); };
      var qa = function (s, el) { return Array.prototype.slice.call((el || root).querySelectorAll(s)); };
      var mq = function (s) { return window.matchMedia ? window.matchMedia(s) : { matches: false }; };

      // ---- the P: the live 3D mark with its edge light (02-logo3d). If the 3D engine is off, the name stands alone.
      var mark = q('.pep-header-mark');
      function announce() { if (mark) { ctx.emit('logo3d:slot', { el: mark, kind: 'mark', phase: 2.1, hold: true, edge: true, interactive: true }); } }
      ctx.on('logo3d:ready', announce);
      announce();
      ctx.on('logo3d:off', function () { root.setAttribute('data-3d', 'off'); });
      // The bar is solid chrome now and always stands over the 3D canvas (so its panels cover the page's 3D). The engine
      // lifts the P's own pixels onto its small edge canvas every frame; they are copied 1:1, frame by frame, onto a
      // canvas inside the bar, so the live P (same pixels, same turn) is drawn in front of the chrome.
      if (mark) {
        var mirror = document.createElement('canvas'), mcx = mirror.getContext('2d'), edge = null;
        mirror.className = 'pep-header-mirror'; mirror.setAttribute('aria-hidden', 'true');
        mark.appendChild(mirror);
        (function copy() {
          edge = edge && edge.isConnected ? edge : document.querySelector('.pep-logo3d-edge');
          if (edge && edge.width && edge.style.visibility === 'visible') {
            if (mirror.width !== edge.width || mirror.height !== edge.height) { mirror.width = edge.width; mirror.height = edge.height; }
            var er = edge.getBoundingClientRect(), mr = mark.getBoundingClientRect();
            mirror.style.width = er.width + 'px'; mirror.style.height = er.height + 'px';
            mirror.style.transform = 'translate(' + (er.left - mr.left).toFixed(2) + 'px,' + (er.top - mr.top).toFixed(2) + 'px)';
            mcx.clearRect(0, 0, mirror.width, mirror.height); mcx.drawImage(edge, 0, 0);
            mirror.style.visibility = 'visible';
          } else if (mirror.style.visibility !== 'hidden') { mirror.style.visibility = 'hidden'; }
          window.requestAnimationFrame(copy);
        })();
      }

      // ---- counsel switch: product names show in a preview, or once counsel clears them
      var namesOpen = !!(flags.PREVIEW || cleared.names);
      qa('[data-gate="names"]').forEach(function (el) { el.hidden = !namesOpen; });
      qa('[data-gate-off="names"]').forEach(function (el) { el.hidden = namesOpen; });
      var shopTo = namesOpen ? '#lineup' : '#shelf';
      qa('[data-to-shop]').forEach(function (a) { a.setAttribute('href', shopTo); });

      var narrow = mq('(max-width: 1199px)');
      var menuKey = q('[data-menu-key]'), pep = q('[data-key="peptides"]'), drop = q('[data-drop]'), row = q('.pep-header-row');
      var dropLi = pep ? pep.closest('li') : null, keys = q('#pep-header-keys');
      var dropOpen = function () { return root.hasAttribute('data-drop-open'); };
      var menuOpen = function () { return root.hasAttribute('data-menu-open'); };

      // ---- the bar steps out of the way, and back; away from the top it floats over the page
      var tucked = false, lastY = window.pageYOffset || 0, tuckNext = false, floating = null;
      function show() { if (tucked) { tucked = false; root.removeAttribute('data-tuck'); } }
      function tuck() {
        if (tucked || dropOpen() || menuOpen() || root.contains(document.activeElement)) { return; }
        tucked = true; root.setAttribute('data-tuck', '');
      }
      function float(y) {
        var f = y >= 140;
        if (f === floating) { return; }
        floating = f;
        if (f) { root.setAttribute('data-float', ''); } else { root.removeAttribute('data-float'); }
      }
      float(lastY);
      window.addEventListener('scroll', function () {
        var y = window.pageYOffset || 0, dy = y - lastY;
        lastY = y;
        float(y);
        if (y < 140) { tuckNext = false; show(); return; }
        if (tuckNext) { tuckNext = false; tuck(); return; }
        if (dy > 6) { tuck(); } else if (dy < -6) { show(); }
      }, { passive: true });
      // The keyboard reaching the tucked bar: the bar is off the top of the window, so the browser scrolls the page to
      // centre the focused key (about half a window), although the bar is sticky and comes back by itself. The page is put
      // back where the visitor was reading in the same step as the focus (before anything is drawn), and the bar comes
      // back at once, with no slide (data-snap), so the focused key is on the screen from then on.
      var tabY = null;
      function back(y) { try { window.scrollTo({ top: y, behavior: 'instant' }); } catch (err) { window.scrollTo(0, y); } }
      document.addEventListener('keydown', function (e) { if (e.key === 'Tab') { tabY = window.pageYOffset || 0; } }, true);
      root.addEventListener('focusin', function () {
        if (!tucked) { return; }
        var y = tabY === null ? (window.pageYOffset || 0) : tabY;
        root.setAttribute('data-snap', '');
        show();
        void root.offsetHeight;             // the bar is in its place now, not at the end of a slide
        if (Math.abs((window.pageYOffset || 0) - y) > 2) { lastY = y; back(y); }
        setTimeout(function () {             // and once more, should the browser scroll after the focus event
          if (Math.abs((window.pageYOffset || 0) - y) > 2) { lastY = y; back(y); }
          root.removeAttribute('data-snap');
        }, 60);
      });
      // once the entrance is over the bar is marked up (kept for anything that listens for it)
      var entrance = document.querySelector('[data-module="entrance"]');
      function up() { root.setAttribute('data-up', ''); }
      if (!entrance || entrance.hidden) { up(); } else { ctx.on('entrance:done', up); setTimeout(up, 5600); }

      // ---- the drop-down under PEPTIDES
      function place() {                    // centred under PEPTIDES, kept inside the window (wide windows only)
        if (!drop || !pep || !row || narrow.matches) { return; }
        var rr = row.getBoundingClientRect(), br = pep.getBoundingClientRect(), w = drop.offsetWidth || 880;
        var cx = br.left + br.width / 2, min = w / 2 + 12, max = window.innerWidth - w / 2 - 12;
        root.style.setProperty('--pep-header-dx', (Math.max(min, Math.min(max, cx)) - rr.left).toFixed(1) + 'px');
      }
      function setDrop(open) {
        if (!pep) { return; }
        if (open) { place(); root.setAttribute('data-drop-open', ''); show(); } else { root.removeAttribute('data-drop-open'); }
        pep.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
      function setMenu(open) {
        if (!menuKey) { return; }
        if (open) { root.setAttribute('data-menu-open', ''); show(); } else { root.removeAttribute('data-menu-open'); setDrop(false); }
        menuKey.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
      function closeAll() { setDrop(false); setMenu(false); }
      window.addEventListener('resize', function () { if (dropOpen()) { place(); } });
      if (narrow.addEventListener) { narrow.addEventListener('change', closeAll); } else if (narrow.addListener) { narrow.addListener(closeAll); }

      var hovAt = 0, leaveT = 0;
      if (pep && dropLi && drop) {
        // hover opens it only on a real move of the mouse: when the page moves or opens under a resting pointer, the
        // browser sends a move with no movement, and that must not open it again after Esc
        dropLi.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse' && !narrow.matches) { clearTimeout(leaveT); } });
        dropLi.addEventListener('pointermove', function (e) {
          if (e.pointerType !== 'mouse' || narrow.matches || dropOpen() || !(e.movementX || e.movementY)) { return; }
          clearTimeout(leaveT); hovAt = Date.now(); setDrop(true);
        });
        dropLi.addEventListener('pointerleave', function (e) {
          if (e.pointerType !== 'mouse' || narrow.matches) { return; }
          leaveT = setTimeout(function () { setDrop(false); }, 220);
        });
        // a click just after the hover opened it keeps it open; otherwise a click (or Enter, or Space) toggles it
        pep.addEventListener('click', function () { setDrop(Date.now() - hovAt < 500 ? true : !dropOpen()); hovAt = 0; });
        // the keyboard leaving the key and its drop-down closes it
        dropLi.addEventListener('focusout', function (e) { if (e.relatedTarget && !dropLi.contains(e.relatedTarget)) { setDrop(false); } });
      }
      if (menuKey && keys) {
        menuKey.addEventListener('click', function () { setMenu(!menuOpen()); });
        keys.addEventListener('focusout', function (e) { if (narrow.matches && e.relatedTarget && !keys.contains(e.relatedTarget) && e.relatedTarget !== menuKey) { setMenu(false); } });
      }
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape' || e.defaultPrevented) { return; }
        if (dropOpen()) { e.preventDefault(); setDrop(false); if (pep) { pep.focus(); } }
        else if (menuOpen()) { e.preventDefault(); setMenu(false); if (menuKey) { menuKey.focus(); } }
      });
      document.addEventListener('pointerdown', function (e) {
        if (!root.contains(e.target)) { closeAll(); return; }
        if (dropOpen() && dropLi && !dropLi.contains(e.target) && !narrow.matches) { setDrop(false); }
      });

      // ---- the keys that take the visitor somewhere: the menu closes, and the bar steps away once the page has moved
      function went(e) {
        closeAll();
        if (e && e.detail !== 0) {          // a mouse or a finger (the keyboard keeps its place in the menu)
          if (document.activeElement && root.contains(document.activeElement)) { document.activeElement.blur(); }
          tuckNext = true;
        }
      }
      qa('[data-key="shop"], [data-key="research"], [data-key="about"], [data-leave]').forEach(function (a) { a.addEventListener('click', went); });

      // ---- cart: the key asks the cart to open; the count arrives from the cart over the bus
      var cartKey = q('[data-cart-open]'), count = q('[data-cart-count]');
      if (cartKey) { cartKey.addEventListener('click', function () { closeAll(); ctx.emit('cart:open', { from: cartKey }); }); }
      ctx.on('cart:changed', function (c) { if (count && c) { count.textContent = String(c.count || 0); } });

      // ---- the catalogue, names only, while names show
      var cols = q('[data-cols]'), colTpl = q('[data-tpl="col"]'), countEl = q('[data-count]'), failLine = q('[data-drop-fail]');
      if (!namesOpen || !cols || !colTpl || !window.fetch) { return; }
      cols.addEventListener('click', function (e) {
        var a = e.target.closest ? e.target.closest('a[data-sku]') : null;
        if (!a) { return; }
        e.preventDefault();
        var ask = { sku: a.getAttribute('data-sku'), focus: e.detail === 0, done: false };
        went(e);
        ctx.emit('lineup:go', ask);
        if (!ask.done) { var to = document.querySelector(shopTo); if (to) { to.scrollIntoView(); } }      // the lineup could not stand on it: go to the lineup
        ctx.track('menu_product', { sku: ask.sku });
      });
      var hidden = Array.isArray(cfg.hidden) ? cfg.hidden : [];    // config.js: products held back for counsel review
      var flagged = Array.isArray(cfg.flagged) ? cfg.flagged.map(String) : [], flagTpl = q('[data-tpl="flag"]');   // config.js: on show, tagged
      fetch('assets/catalogue.json')
        .then(function (r) { if (!r.ok) { throw new Error('catalogue ' + r.status); } return r.json(); })
        .then(function (d) {
          var list = (d && Array.isArray(d.products) ? d.products : []).filter(function (p) {
            // the same rule as THE LINEUP: a bracketed placeholder name is preview only; a held-back product never shows
            return p && p.sku && p.name && (flags.PREVIEW || String(p.name).indexOf('[') < 0) && hidden.indexOf(String(p.sku)) < 0;
          });
          if (!list.length) { throw new Error('catalogue empty'); }
          var by = function (a, b) { return String(a.name).localeCompare(String(b.name), 'en', { sensitivity: 'base' }); };
          var fam = function (p) { return String(p.family || '').toUpperCase(); };
          var peps = list.filter(function (p) { return fam(p) === 'PEPTIDE'; }).sort(by);
          var blends = list.filter(function (p) { return fam(p) === 'BLEND'; }).sort(by);
          var other = list.filter(function (p) { return fam(p) !== 'PEPTIDE' && fam(p) !== 'BLEND'; }).sort(by);
          // four columns: the peptides in three even parts, then the blends with the other compounds under them (so the
          // whole list, every product, stays on one screen)
          var third = Math.ceil(peps.length / 3), first = function (p) { return String(p.name).charAt(0).toUpperCase(); };
          var span = function (g) { return g.length ? ' ' + first(g[0]) + '–' + first(g[g.length - 1]) : ''; };
          var pepHead = cols.getAttribute('data-head-peptide'), lastCol = null;
          var groups = [
            { head: pepHead + span(peps.slice(0, third)), items: peps.slice(0, third) },
            { head: pepHead + span(peps.slice(third, 2 * third)), items: peps.slice(third, 2 * third) },
            { head: pepHead + span(peps.slice(2 * third)), items: peps.slice(2 * third) },
            { head: cols.getAttribute('data-head-blend'), items: blends },
            { head: cols.getAttribute('data-head-other'), items: other, under: true }
          ];
          groups.forEach(function (g, i) {
            if (!g.items.length) { return; }
            var col = colTpl.content.firstElementChild.cloneNode(true), h = q('.pep-header-col-h', col), ul = q('ul', col);
            h.textContent = g.head; h.id = 'pep-header-col-' + i; ul.setAttribute('aria-labelledby', h.id);
            g.items.forEach(function (p) {
              var li = document.createElement('li'), a = document.createElement('a');
              a.className = 'pep-header-item'; a.href = shopTo; a.setAttribute('data-sku', String(p.sku)); a.textContent = String(p.name);
              li.appendChild(a);
              // a product still with counsel (config.js flagged) carries its tag beside its name, here as everywhere else
              if (flagTpl && flagged.indexOf(String(p.sku)) >= 0) {
                var tag = flagTpl.content.firstElementChild.cloneNode(true);
                tag.id = 'pep-header-flag-' + String(p.sku).replace(/[^a-z0-9-]/gi, '');
                a.setAttribute('aria-describedby', tag.id);
                li.setAttribute('data-flagged', ''); li.appendChild(tag);
              }
              ul.appendChild(li);
            });
            if (g.under && lastCol) { lastCol.appendChild(col); } else { cols.appendChild(col); lastCol = col; }
          });
          if (countEl) { countEl.textContent = list.length + ' ' + countEl.getAttribute(list.length === 1 ? 'data-one' : 'data-many'); }
        })
        .then(null, function () { if (failLine) { failLine.hidden = false; } });
    }
  });
})();
