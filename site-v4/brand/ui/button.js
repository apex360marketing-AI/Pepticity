/* PEPTICITY · BTN-P01 · segmented toggle behaviour (click + arrow keys, roving tabindex).
   Fires a 'pc-change' event on the .pc-seg with detail {index, value}. */
(function () {
  function init(seg) {
    if (seg.__pc) return; seg.__pc = true;
    const opts = [...seg.querySelectorAll('.pc-seg__opt')];
    seg.style.setProperty('--n', opts.length);
    function select(i, focus) {
      opts.forEach((o, k) => { o.setAttribute('aria-checked', k === i ? 'true' : 'false'); o.tabIndex = k === i ? 0 : -1; });
      seg.style.setProperty('--i', i);
      if (focus) opts[i].focus();
      seg.dispatchEvent(new CustomEvent('pc-change', { detail: { index: i, value: opts[i].dataset.value || opts[i].textContent.trim() } }));
    }
    let cur = Math.max(0, opts.findIndex(o => o.getAttribute('aria-checked') === 'true'));
    opts.forEach((o, k) => { o.tabIndex = k === cur ? 0 : -1; o.addEventListener('click', () => { cur = k; select(k); }); });
    seg.style.setProperty('--i', cur);
    seg.addEventListener('keydown', e => {
      const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!d) return; e.preventDefault(); cur = (cur + d + opts.length) % opts.length; select(cur, true);
    });
    seg.pcSelect = i => { cur = i; select(i); };
  }
  window.PCButtons = { init: root => (root || document).querySelectorAll('.pc-seg').forEach(init) };
  if (document.readyState !== 'loading') window.PCButtons.init(); else document.addEventListener('DOMContentLoaded', () => window.PCButtons.init());
})();
