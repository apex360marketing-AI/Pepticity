/* PEPTICITY · COLOUR (one version). Blue by default; the COLOUR button cycles Grace's 8 colours through the whole site.
   ?colour=<name> (or ?vibe=<name>) opens the page in that colour; the last pick is remembered on this device. */
(function () {
  var NAMES = ['blue', 'chartreuse', 'cyan', 'red', 'violet', 'orchid', 'copper', 'salmon'];
  var D = document.documentElement, KEY = 'pc-colour';
  var get = function () { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  var put = function (v) { try { localStorage.setItem(KEY, v); } catch (e) {} };
  var m = /[?&](?:colour|vibe)=([a-z]+)/.exec(location.search), q = m && NAMES.indexOf(m[1]) > -1 ? m[1] : null;
  var cur = q || (NAMES.indexOf(get()) > -1 ? get() : 'blue');
  D.setAttribute('data-colour', cur);
  function wire() {
    var b = document.getElementById('colourBtn'); if (!b) return;
    var lab = b.querySelector('.cb-name');
    function show() { if (lab) lab.textContent = cur.toUpperCase(); b.setAttribute('aria-label', 'Colour: ' + cur + '. Press for the next colour'); }
    show();
    b.addEventListener('click', function () {
      cur = NAMES[(NAMES.indexOf(cur) + 1) % NAMES.length]; D.setAttribute('data-colour', cur); put(cur); show();
    });
  }
  if (document.readyState !== 'loading') wire(); else document.addEventListener('DOMContentLoaded', wire);
})();
