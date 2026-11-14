      // ---- THE BAY (Tyson, Nov 14 2026): four matching vials under PEPTIDES, one per heading. No lists.
      //      The small arrow under a vial stands the next product of that heading in its place (vial and name change).
      //      The vial itself opens that product's screen in front of all four: its heading, its research area (behind
      //      the counsel switch "areas") and what the product IS, only as assets/lineup/details.json and kinds.json hold
      //      it. X or Esc closes the screen. Names, sizes and prices come from assets/catalogue.json, as everywhere.
      var cols = q('[data-cols]'), colTpl = q('[data-tpl="col"]'), countEl = q('[data-count]'), failLine = q('[data-drop-fail]');
      var view = q('[data-view]'), viewX = q('[data-view-x]'), viewGo = q('[data-view-go]');
      if (!namesOpen || !cols || !colTpl || !window.fetch) { return; }
      var areasOpen = !!(flags.PREVIEW || cleared.areas);
      var calm = mq('(prefers-reduced-motion: reduce)');
      var DETAILS = {}, KINDS = {}, AREAS = {}, bays = [], viewBay = null, viewT = 0, warmed = false;
      var nextWord = cols.getAttribute('data-next-word') || '', openWord = cols.getAttribute('data-open-word') || '';
      var pic = function (p) { return 'assets/vials/' + encodeURIComponent(String(p.sku)) + '.webp'; };
      var money = function (n) { return '$' + (Math.round(n) === n ? String(n) : n.toFixed(2)); };
      var json = function (u) { return fetch(u).then(function (r) { return r.ok ? r.json() : {}; }).then(null, function () { return {}; }); };
      var put = function (el, t) { if (el) { el.textContent = t; } };
      var warm = function (bay) { if (bay.items.length > 1) { var im = new Image(); im.src = pic(bay.items[(bay.at + 1) % bay.items.length]); } };

      function paint(bay) {
        var p = bay.items[bay.at], name = String(p.name).toUpperCase();
        bay.img.src = pic(p);
        put(bay.name, name);
        bay.vial.setAttribute('aria-label', name + (openWord ? ': ' + openWord : ''));
      }
      function next(bay) {
        if (bay.items.length < 2 || bay.busy) { return; }
        bay.at = (bay.at + 1) % bay.items.length;
        ctx.track('menu_next', { head: bay.head, sku: String(bay.items[bay.at].sku) });
        if (calm.matches) { paint(bay); warm(bay); return; }
        bay.busy = true;
        bay.el.setAttribute('data-swap', 'out');                   // the vial sinks away...
        setTimeout(function () {
          var done = false;
          var arrive = function () {
            if (done) { return; }
            done = true;
            bay.el.setAttribute('data-swap', 'in');                // ...the next one waits just above...
            void bay.img.offsetWidth;
            bay.el.removeAttribute('data-swap');                   // ...and settles into its place
            bay.busy = false;
            warm(bay);
          };
          bay.img.addEventListener('load', arrive, { once: true });
          bay.img.addEventListener('error', arrive, { once: true });
          paint(bay);
          setTimeout(arrive, 700);
        }, 200);
      }
      function putRow(sel, value) {
        var r = q(sel, view);
        if (!r || !value) { return 0; }
        put(q('dd', r), String(value)); r.hidden = false;
        return 1;
      }
      function openView(bay) {
        if (!view) { return; }
        var p = bay.items[bay.at], sku = String(p.sku), det = DETAILS[sku] || {}, kind = KINDS[sku] || {}, shown = 0;
        var key = function (k) { return String(k).replace(/[^a-z]/g, ''); };
        viewBay = bay;
        var img = q('[data-view-img]', view);
        if (img) { img.src = pic(p); }
        put(q('[data-view-for]', view), bay.head);
        var area = q('[data-view-area]', view), a = areasOpen && AREAS[sku] ? String(AREAS[sku]) : '';
        if (area) { put(area, a); area.hidden = !a; }
        put(q('[data-view-name]', view), String(p.name).toUpperCase());
        var line = q('[data-view-line]', view), rows = q('[data-view-rows]', view), coming = q('[data-view-coming]', view);
        if (line) { put(line, det.line ? String(det.line) : ''); line.hidden = !det.line; if (det.line) { shown++; } }
        qa('[data-row], [data-pv]', view).forEach(function (r) { r.hidden = true; });
        (Array.isArray(det.rows) ? det.rows : []).forEach(function (r) { if (r && r.key) { shown += putRow('[data-row="' + key(r.key) + '"]', r.value); } });
        // what it is, from kinds.json, when the description does not say: a value still to be confirmed is preview only
        var kindRow = q('[data-row="kind"]', view);
        if (kind.kind && kindRow && kindRow.hidden) {
          var k = String(kind.kind);
          k = k.charAt(0) + k.slice(1).toLowerCase();              // written as the descriptions write it: "Synthetic peptide"
          if (!kind.tbc) { shown += putRow('[data-row="kind"]', k); } else if (flags.PREVIEW) { shown += putRow('[data-pv="kind"]', k); }
        }
        // PREVIEW ONLY: values still to be matched to the lot documents (a live build cuts these rows out)
        if (flags.PREVIEW && det.pv && typeof det.pv === 'object') {
          Object.keys(det.pv).forEach(function (k) { if (k !== 'kind') { shown += putRow('[data-pv="' + key(k) + '"]', det.pv[k]); } });
        }
        if (rows) { rows.hidden = !qa('[data-row], [data-pv]', view).some(function (r) { return !r.hidden; }); }
        if (coming) { coming.hidden = !!shown; }
        var sizes = q('[data-view-sizes]', view), open = !p.soldOut && !p.comingSoon;
        if (sizes) {
          sizes.textContent = '';
          (Array.isArray(p.sizes) ? p.sizes : []).forEach(function (s) {
            if (!s || !s.label) { return; }
            var li = document.createElement('li'), l = document.createElement('span');
            l.textContent = String(s.label); li.appendChild(l);
            if (open && !s.soldOut && !s.comingSoon && typeof s.priceCAD === 'number' && s.priceCAD > 0) { var b = document.createElement('b'); b.textContent = money(s.priceCAD); li.appendChild(b); }
            sizes.appendChild(li);
          });
        }
        if (viewGo) { viewGo.setAttribute('data-sku', sku); }
        clearTimeout(viewT);
        view.hidden = false; cols.inert = true; root.setAttribute('data-view-open', '');
        void view.offsetWidth;
        view.setAttribute('data-on', '');
        var txt = q('.pep-header-view-txt', view);
        if (txt) { txt.scrollTop = 0; }
        if (viewX) { viewX.focus(); }
        ctx.track('menu_view', { sku: sku });
      }
      function closeView(back) {
        if (!view || view.hidden) { return; }
        var bay = viewBay;
        viewBay = null;
        view.removeAttribute('data-on'); root.removeAttribute('data-view-open'); cols.inert = false;
        clearTimeout(viewT);
        viewT = setTimeout(function () { view.hidden = true; }, calm.matches ? 0 : 250);
        if (back && bay) { bay.vial.focus(); }
      }
      onDropClose = function () { closeView(false); };
      onDropOpen = function () { if (!warmed) { warmed = true; bays.forEach(warm); } };      // the next vials are ready before they are asked for

      cols.addEventListener('click', function (e) {
        var t = e.target.closest ? e.target.closest('[data-next], [data-vial]') : null, col = t ? t.closest('[data-col]') : null;
        var bay = col ? bays[+col.getAttribute('data-i')] : null;
        if (!bay) { return; }
        if (t.hasAttribute('data-next')) { next(bay); } else { openView(bay); }
      });
      if (viewX) { viewX.addEventListener('click', function () { closeView(true); }); }
      document.addEventListener('keydown', function (e) {             // Esc closes the screen first, the menu after
        if (e.key === 'Escape' && view && view.hasAttribute('data-on')) { e.preventDefault(); closeView(true); }
      }, true);
      if (viewGo) {
        viewGo.setAttribute('href', shopTo);
        viewGo.addEventListener('click', function (e) {
          e.preventDefault();
          var ask = { sku: viewGo.getAttribute('data-sku'), focus: e.detail === 0, done: false };
          went(e);
          ctx.emit('lineup:go', ask);
          if (!ask.done) { var to = document.querySelector(shopTo); if (to) { to.scrollIntoView(); } }      // the lineup could not stand on it: go to the lineup
          ctx.track('menu_product', { sku: ask.sku });
        });
      }
      var hidden = Array.isArray(cfg.hidden) ? cfg.hidden : [];    // config.js: products held back for counsel review
      Promise.all([
        fetch('assets/catalogue.json').then(function (r) { if (!r.ok) { throw new Error('catalogue ' + r.status); } return r.json(); }),
        json('assets/lineup/details.json'), json('assets/lineup/kinds.json'), areasOpen ? json('assets/lineup/areas.json') : {}
      ])
        .then(function (got) {
          var d = got[0];
          DETAILS = got[1] || {}; KINDS = got[2] || {}; AREAS = got[3] || {};
          var list = (d && Array.isArray(d.products) ? d.products : []).filter(function (p) {
            // the same rule as THE LINEUP: a bracketed placeholder name is preview only; a held-back product never shows
            return p && p.sku && p.name && (flags.PREVIEW || String(p.name).indexOf('[') < 0) && hidden.indexOf(String(p.sku)) < 0;
          });
          if (!list.length) { throw new Error('catalogue empty'); }
          // the four headings and which products stand under each are in header.html (data-groups)
          var bySku = {};
          list.forEach(function (p) { bySku[String(p.sku)] = p; });
          var groups = [];
          try { groups = JSON.parse(cols.getAttribute('data-groups') || '[]'); } catch (e) { groups = []; }
          groups = groups.map(function (g) {
            return { head: String(g.head || ''), items: (g.skus || []).map(function (k) { return bySku[k]; }).filter(Boolean) };
          });
          if (!groups.some(function (g) { return g.items.length; })) { throw new Error('catalogue groups empty'); }
          groups.forEach(function (g) {
            if (!g.items.length) { return; }
            var col = colTpl.content.firstElementChild.cloneNode(true), h = q('.pep-header-col-h', col), i = bays.length;
            var bay = { el: col, head: g.head, items: g.items, at: 0, busy: false, img: q('[data-vial-img]', col), name: q('[data-name]', col), vial: q('[data-vial]', col), next: q('[data-next]', col) };
            col.setAttribute('data-i', String(i)); col.setAttribute('role', 'group');
            h.textContent = g.head; h.id = 'pep-header-col-' + i; col.setAttribute('aria-labelledby', h.id);
            bay.next.setAttribute('aria-label', (nextWord ? nextWord + ' ' : '') + g.head);
            if (g.items.length < 2) { bay.next.style.visibility = 'hidden'; }      // one product: no arrow, the same space
            paint(bay);
            bays.push(bay); cols.appendChild(col);
          });
          if (countEl) { countEl.textContent = list.length + ' ' + countEl.getAttribute(list.length === 1 ? 'data-one' : 'data-many'); }
        })
        .then(null, function () { if (failLine) { failLine.hidden = false; } });
    }
  });
})();
</script>
