<script data-pep-src="core/pep.js">
/* PEP runtime. The only global this file makes is window.PEP.
   - PEP.register(name, { init(root, ctx) })  each module registers once
   - boot: every [data-module] root gets its init inside try/catch, so one
     failing module can never stop the others
   - PEP.on / PEP.emit     small event bus
   - PEP.state             get / set / remove, backed by localStorage in try/catch
   - PEP.motion.reduced    true when the visitor asked for less motion
   - PEP.track(event, data) pushes to window.dataLayer only: an allow-list of keys, ids and numbers only
   Never put personal or health answers in PEP.state or PEP.track. */
(function (win, doc) {
  'use strict';
  if (win.PEP) { return; }

  var defs = {};        // name -> { init }
  var status = {};      // name -> 'registered' | 'ready' | 'failed' | 'no-root'
  var listeners = {};   // event -> [fn]
  var booted = false;
  var NS = 'pep:';
  var memory = {};

  function warn() {
    if (win.console && win.console.warn) {
      win.console.warn.apply(win.console, arguments);
    }
  }

  function deepFreeze(o) {
    if (o && typeof o === 'object' && !Object.isFrozen(o)) {
      Object.freeze(o);
      Object.keys(o).forEach(function (k) { deepFreeze(o[k]); });
    }
    return o;
  }

  /* ---------- event bus ---------- */
  function on(event, fn) {
    if (typeof fn !== 'function') { return function () {}; }
    (listeners[event] = listeners[event] || []).push(fn);
    return function off() {
      var list = listeners[event] || [];
      var i = list.indexOf(fn);
      if (i > -1) { list.splice(i, 1); }
    };
  }

  function emit(event, data) {
    (listeners[event] || []).slice().forEach(function (fn) {
      try { fn(data); } catch (err) { warn('[PEP] listener for ' + event + ' failed', err); }
    });
  }

  /* ---------- state store ---------- */
  var state = {
    get: function (key, fallback) {
      try {
        var raw = win.localStorage.getItem(NS + key);
        if (raw !== null) { return JSON.parse(raw); }
      } catch (err) { /* storage blocked or bad JSON: fall through to memory */ }
      return Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : fallback;
    },
    set: function (key, value) {
      memory[key] = value;
      try { win.localStorage.setItem(NS + key, JSON.stringify(value)); } catch (err) { /* memory only */ }
      emit('state:' + key, value);
      return value;
    },
    remove: function (key) {
      delete memory[key];
      try { win.localStorage.removeItem(NS + key); } catch (err) { /* memory only */ }
      emit('state:' + key, undefined);
    }
  };

  /* ---------- motion ---------- */
  var mq = null;
  try { mq = win.matchMedia ? win.matchMedia('(prefers-reduced-motion: reduce)') : null; } catch (err) { mq = null; }
  var motion = {};
  Object.defineProperty(motion, 'reduced', {
    enumerable: true,
    get: function () { return !!(mq && mq.matches); }
  });

  /* ---------- tracking: dataLayer only, never the network ---------- */
  // An ALLOW-list. Only these keys pass, and only when the value is an id, a number or a flag. Anything a person
  // typed (free text, an address, a name, a date) cannot pass, whatever the key is called.
  var TRACK_KEYS = { hook: 1, slot: 1, state: 1, sizeId: 1, sku: 1, qty: 1, count: 1, from: 1, to: 1, step: 1, kind: 1 };
  var TRACK_ID = /^[A-Za-z0-9][A-Za-z0-9_.:\-]{0,63}$/;

  function scrub(value) {
    var out = {};
    if (!value || typeof value !== 'object' || Array.isArray(value)) { return out; }
    Object.keys(value).forEach(function (k) {
      var v = value[k];
      if (!Object.prototype.hasOwnProperty.call(TRACK_KEYS, k)) { return; }
      if (typeof v === 'boolean' || (typeof v === 'number' && isFinite(v)) || (typeof v === 'string' && TRACK_ID.test(v))) { out[k] = v; }
    });
    return out;
  }

  function track(event, data) {
    try {
      var payload = scrub(data && typeof data === 'object' && !Array.isArray(data) ? data : {}, 0);
      payload.event = String(event);
      (win.dataLayer = win.dataLayer || []).push(payload);
    } catch (err) {
      warn('[PEP] track ' + event + ' failed', err);
    }
  }

  /* ---------- modules ---------- */
  var PEP = {
    version: '1',
    config: deepFreeze(win.PEP_CONFIG || {}),
    on: on,
    emit: emit,
    state: state,
    motion: motion,
    track: track,
    status: status
  };

  function run(name, root) {
    var def = defs[name];
    if (!def) {
      status[name] = 'failed';
      root.setAttribute('data-pep-failed', '');
      warn('[PEP] module ' + name + ' failed', new Error('nothing registered under this name'));
      return;
    }
    function failed(err) {
      status[name] = 'failed';
      root.removeAttribute('data-pep-ready');
      root.setAttribute('data-pep-failed', '');
      warn('[PEP] module ' + name + ' failed', err);
    }
    try {
      var ctx = { name: name, config: PEP.config, on: on, emit: emit, state: state, motion: motion, track: track };
      var result = def.init(root, ctx);
      status[name] = 'ready';
      root.setAttribute('data-pep-ready', '');
      if (result && typeof result.then === 'function') { result.then(null, failed); }
    } catch (err) {
      failed(err);
    }
  }

  PEP.register = function (name, def) {
    if (typeof name !== 'string' || !def || typeof def.init !== 'function') {
      warn('[PEP] module ' + name + ' failed', new Error('register needs a name and { init(root, ctx) }'));
      return;
    }
    if (defs[name]) {
      warn('[PEP] module ' + name + ' registered twice; the first one is kept');
      return;
    }
    defs[name] = def;
    status[name] = 'registered';
    if (booted) {
      var late = doc.querySelectorAll('[data-module="' + name + '"]');
      if (!late.length) { status[name] = 'no-root'; }
      Array.prototype.forEach.call(late, function (root) { run(name, root); });
    }
  };

  PEP.boot = function () {
    if (booted) { return; }
    booted = true;
    var roots = doc.querySelectorAll('[data-module]');
    Array.prototype.forEach.call(roots, function (root) {
      run(root.getAttribute('data-module'), root);
    });
    Object.keys(defs).forEach(function (name) {
      if (status[name] === 'registered') { status[name] = 'no-root'; }
    });
    emit('pep:ready', status);
  };

  win.PEP = PEP;

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', PEP.boot);
  } else {
    win.setTimeout(PEP.boot, 0);
  }
})(window, document);
</script>