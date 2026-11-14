#!/usr/bin/env python3
# HARDEN worker (security fix round). usage: python3 -I apply.py IN.html OUT.html
# Runs LAST in the chain (after top, cards, guide, hooks), before final_sweep.py and csp.py.
#
# What it changes, and nothing else:
#   head                 a new first script, core/frame.js: the store does not render inside any frame
#   core/pep.js          the ONE visitor state (pep_flow_v1) is cleaned on every read and write; PEP.flow.member();
#                        PEP.listed(product), the one listing rule; PEP.tab, this tab's own sealed notes
#   10-hero, 45-hooks,   ONE line each: their member check now asks PEP.flow.member()
#   40-guide             its member check asks PEP.flow.member(); its catalogue filter asks PEP.listed()
#   16-lineup, 20-shelf  their catalogue filter asks PEP.listed()
#   22-doors             a door opens on "request sent" only for a request this tab sent
#   30-cart              member check, listing rule, age pass kept in this tab's sealed note, founder wording from config,
#                        the checkout step is drawn at CHECKOUT and left when the cart changes underneath it
# Every place is found by an anchor (module marker, data-pep-src, a code string). A missing anchor stops the run with
# a message and exit code 1. Running it twice gives the same file.
import re
import sys


def die(msg):
    sys.stderr.write('HARDEN apply.py: STOPPED. ' + msg + '\n')
    sys.exit(1)


def block(h, name, tag):
    m = re.search(r'<%s\b[^>]*data-pep-src="%s"[^>]*>' % (tag, re.escape(name)), h)
    if not m:
        die('no <%s data-pep-src="%s"> block in the page' % (tag, name))
    end = h.find('</%s>' % tag, m.end())
    if end < 0:
        die('<%s data-pep-src="%s"> is never closed' % (tag, name))
    return m.end(), end


def edit(h, name, fn, tag='script'):
    a, b = block(h, name, tag)
    return h[:a] + fn(h[a:b], name) + h[b:]


def swap(body, old, new, where, what):
    """exact text swap, once. Already applied (new is there) = left as it is."""
    if new in body:
        return body
    n = body.count(old)
    if n != 1:
        die('%s: anchor for "%s" found %d times (need 1): %r' % (where, what, n, old[:90]))
    return body.replace(old, new)


def rswap(body, pattern, new, where, what, done):
    """regex swap, once. `done` is a string that is only there after the swap."""
    if done in body:
        return body
    out, n = re.subn(pattern, lambda m: new, body, flags=re.S)
    if n != 1:
        die('%s: anchor for "%s" found %d times (need 1): /%s/' % (where, what, n, pattern[:90]))
    if done not in out:
        die('%s: internal error, marker for "%s" missing after the swap' % (where, what))
    return out


def region(h, begin, end, text, before=None, after=None, where=''):
    """a marked region: replaced when it is there, else inserted before/after an anchor."""
    a = h.find(begin)
    if a >= 0:
        b = h.find(end, a)
        if b < 0:
            die('%s: %s without %s' % (where, begin, end))
        return h[:a] + text + h[b + len(end):]
    anchor = before or after
    n = h.count(anchor)
    if n != 1:
        die('%s: anchor found %d times (need 1): %r' % (where, n, anchor[:90]))
    at = h.find(anchor)
    if before:
        return h[:at] + text + '\n' + h[at:]
    at += len(anchor)
    return h[:at] + '\n' + text + h[at:]


# =====================================================================================================================
# 1. head: the store refuses to render inside a frame (I7-frame-foreign, P2-sibling-frames-store)
# =====================================================================================================================
FRAME = r'''<!-- HARDEN:BEGIN frame -->
<script data-pep-src="core/frame.js">
/* PEPTICITY never renders inside a frame. This is the first script of the page. When the page is not the top window it
   hides the document and turns everything after this script into inert text (so no style, no markup and no later
   script of the store is ever built or run), then empties the document. A page that frames the store, on this
   address or any other, gets an empty box: nothing to click through, nothing to read, no runtime to drive.
   (frame-ancestors cannot be set from a meta tag and the host sends no headers, so the page has to do this itself.) */
(function () {
  'use strict';
  var framed = true;
  try { framed = window.top !== window.self; } catch (err) { framed = true; }
  if (!framed) { return; }
  var root = document.documentElement, inert = false;
  function empty() { try { while (root.firstChild) { root.removeChild(root.firstChild); } } catch (err) { /* stays hidden */ } }
  try { root.style.setProperty('display', 'none', 'important'); } catch (err) { /* keep going */ }
  try { document.write('<plaintext hidden>'); inert = true; } catch (err) { inert = false; }
  if (!inert) { try { window.stop(); } catch (err) { /* keep going */ } empty(); return; }
  document.addEventListener('DOMContentLoaded', empty);
})();
</script>
<!-- HARDEN:END frame -->'''

# =====================================================================================================================
# 2. core/pep.js
# =====================================================================================================================
STATE_BEGIN = '  /* ---------- state store ---------- */'
STATE_END = '  /* ---------- motion ---------- */'
STATE = r'''  /* ---------- state store ---------- */
  /* HARDEN: ONE STATE, ONE RULE. The visitor's state lives in the one key pep_flow_v1:
       { stage, joinedAt, province, firstName, hooksSeen, hooksDone, rested }
     Whatever sits in storage under that key (written by this page, another tab, or any other page on the same address)
     is read through cleanFlow(): stage is one of the six names and nothing else (anything else = NEW), joinedAt is a
     timestamp, the hook lists hold hook ids. No module, and no dataLayer push, ever sees free text from that key.
     PEP.flow.member() (below) is the single answer to "is this visitor on the team". */
  var FLOW_KEY = 'pep_flow_v1';
  var STAGES = ['NEW', 'EXPLORING', 'TEAM', 'SHOPPER', 'BUYER', 'ADVOCATE'];
  var ISO_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;
  var HOOK_ID = /^H\d{1,3}$/;
  var PROVINCE = /^[A-Z]{2}$/;
  var FIRST_NAME = /^[A-Za-zÀ-ɏ][A-Za-zÀ-ɏ' \-]{0,19}$/;

  function hookIds(list) {
    var out = [];
    list.forEach(function (h) { if (typeof h === 'string' && HOOK_ID.test(h) && out.indexOf(h) < 0 && out.length < 60) { out.push(h); } });
    return out;
  }

  function cleanFlow(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) { return null; }
    var has = function (k) { return Object.prototype.hasOwnProperty.call(raw, k); };
    var out = { stage: 'NEW' };
    if (has('stage') && typeof raw.stage === 'string' && STAGES.indexOf(raw.stage) >= 0) { out.stage = raw.stage; }   /* GUARD:flow-stage-six */
    if (has('joinedAt') && typeof raw.joinedAt === 'string' && ISO_TIME.test(raw.joinedAt) && isFinite(Date.parse(raw.joinedAt))) { out.joinedAt = raw.joinedAt; }
    if (has('province') && typeof raw.province === 'string' && PROVINCE.test(raw.province)) { out.province = raw.province; }
    if (has('firstName') && typeof raw.firstName === 'string' && FIRST_NAME.test(raw.firstName)) { out.firstName = raw.firstName; }
    if (has('hooksSeen') && Array.isArray(raw.hooksSeen)) { out.hooksSeen = hookIds(raw.hooksSeen); }
    if (has('hooksDone') && Array.isArray(raw.hooksDone)) { out.hooksDone = hookIds(raw.hooksDone); }
    if (has('rested') && (typeof raw.rested === 'boolean' || (typeof raw.rested === 'string' && ISO_TIME.test(raw.rested)))) { out.rested = raw.rested; }
    // a join that was recorded puts the visitor on the team at least
    if (out.joinedAt && (out.stage === 'NEW' || out.stage === 'EXPLORING')) { out.stage = 'TEAM'; }
    return out;
  }

  var state = {
    get: function (key, fallback) {
      var value, found = false;
      try {
        var raw = win.localStorage.getItem(NS + key);
        if (raw !== null) { value = JSON.parse(raw); found = true; }
      } catch (err) { /* storage blocked or bad JSON: fall through to memory */ }
      if (!found && Object.prototype.hasOwnProperty.call(memory, key)) { value = memory[key]; found = true; }
      if (key === FLOW_KEY) { return (found && cleanFlow(value)) || fallback; }   /* GUARD:flow-read-clean */
      return found ? value : fallback;
    },
    set: function (key, value) {
      if (key === FLOW_KEY) { value = cleanFlow(value) || { stage: 'NEW' }; }
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

'''

API_BEGIN = '  /* HARDEN:BEGIN core-api */'
API_END = '  /* HARDEN:END core-api */\n'
API_BEFORE = '  function run(name, root) {'
API = r'''  /* HARDEN:BEGIN core-api */
  /* ---------- PEP.flow: the one visitor state, read ---------- */
  var MEMBER_STAGES = { TEAM: 1, BUYER: 1, ADVOCATE: 1 };
  var flow = {
    key: FLOW_KEY,
    stages: STAGES.slice(),
    get: function () { return state.get(FLOW_KEY, null) || { stage: 'NEW' }; },
    stage: function () { return flow.get().stage; },
    // on the team: TEAM, BUYER, ADVOCATE, or a SHOPPER who joined (a join always records joinedAt). The hero, the hooks,
    // the guide and the cart all ask this one question. It is what this browser recorded: the store has no server, so
    // the founder price it leads to is shown as an estimate that is confirmed when the order is reviewed.
    member: function () {
      var f = flow.get();
      return Object.prototype.hasOwnProperty.call(MEMBER_STAGES, f.stage) || (f.stage === 'SHOPPER' && typeof f.joinedAt === 'string');
    }
  };
  Object.freeze(flow.stages);
  PEP.flow = Object.freeze(flow);

  /* ---------- PEP.listed: the ONE listing rule ---------- */
  // Every place a product can appear (the PEPTIDES list, THE LINEUP, the shelf, the guide, the cart, a #cart= link)
  // asks this one question. Not listed: a sku in config.hidden and, on a live page, a name that still holds a
  // [bracketed] placeholder.
  PEP.listed = function (p) {
    var cfg = PEP.config || {}, flags = cfg.flags || {};
    var held = Array.isArray(cfg.hidden) ? cfg.hidden.map(String) : [];
    if (!p || typeof p !== 'object' || !p.sku || typeof p.name !== 'string' || !p.name) { return false; }
    if (held.indexOf(String(p.sku)) >= 0) { return false; }
    if (!flags.PREVIEW && p.name.indexOf('[') >= 0) { return false; }   /* GUARD:listing-bracket-live */
    return true;
  };

  /* ---------- PEP.tab: this tab's own notes ---------- */
  // What another page must not be able to switch on (the age pass, a door's "your request is in") is kept in memory for
  // this page load, with a copy in sessionStorage that is only believed when it carries this tab's own random token.
  // The token is made once per tab with crypto.getRandomValues. A value written by another page under the old plain
  // keys (pep_gate_v1, pep_doors_v1) is never enough on its own.
  var TAB_KEY = 'pep_tab_v1', TAB_TOKEN = /^[a-hjkmnp-s]{32}$/, TAB_LETTERS = 'abcdefghjkmnpqrs';
  var tabToken = '', tabNotes = {};
  function newToken() {
    var bytes = new Uint8Array(16), s = '';
    win.crypto.getRandomValues(bytes);
    for (var i = 0; i < bytes.length; i++) { s += TAB_LETTERS.charAt(bytes[i] >> 4) + TAB_LETTERS.charAt(bytes[i] & 15); }
    return s;
  }
  function saveTab() {
    if (!tabToken) { return; }
    try { win.sessionStorage.setItem(TAB_KEY, JSON.stringify({ t: tabToken, n: tabNotes })); } catch (err) { /* memory only */ }
  }
  (function () {
    var kept = null;
    try { kept = JSON.parse(win.sessionStorage.getItem(TAB_KEY)); } catch (err) { kept = null; }
    if (kept && typeof kept === 'object' && typeof kept.t === 'string' && TAB_TOKEN.test(kept.t) && kept.n && typeof kept.n === 'object' && !Array.isArray(kept.n)) {
      tabToken = kept.t;
      Object.keys(kept.n).forEach(function (k) { tabNotes[k] = kept.n[k]; });
    } else {
      try { tabToken = newToken(); } catch (err) { tabToken = ''; }   // no crypto: the notes live in memory for this page load only
      saveTab();
    }
  })();
  PEP.tab = Object.freeze({
    get: function (name) { return Object.prototype.hasOwnProperty.call(tabNotes, name) ? tabNotes[name] : null; },
    set: function (name, value) { tabNotes[String(name)] = value; saveTab(); return value; },
    remove: function (name) { delete tabNotes[name]; saveTab(); }
  });
  /* HARDEN:END core-api */
'''


def pep_js(body, name):
    a = body.find(STATE_BEGIN)
    b = body.find(STATE_END)
    if a < 0 or b < 0 or b < a:
        die(name + ': the state store section (between "state store" and "motion") was not found')
    body = body[:a] + STATE + body[b:]
    body = region(body, API_BEGIN, API_END, API, before=API_BEFORE, where=name)
    # the region() insert adds one newline before the anchor; keep the file the same on a second run
    return body.replace(API_END + '\n' + API_BEFORE, API_END + API_BEFORE)


# =====================================================================================================================
# 3. the single member-check call sites in other workers' modules
# =====================================================================================================================
def hero_js(body, name):
    return swap(body,
                "if (flow && flow.stage && flow.stage !== 'NEW') { show('done', true); }",
                "if (PEP.flow.member()) { show('done', true); }   /* GUARD:flow-member-hero */",
                name, 'hero member check')


def hooks_js(body, name):
    return rswap(body,
                 r'function isJoined\(\) \{[^\n]*\}',
                 "function isJoined() { return PEP.flow.member(); }   /* GUARD:flow-member-hooks */",
                 name, 'hooks member check', 'GUARD:flow-member-hooks')


def guide_js(body, name):
    body = rswap(body,
                 r"function isMember\(\) \{\s*var f = ctx\.state\.get\('pep_flow_v1', null\);\s*return [^\n]*\n\s*\}",
                 "function isMember() { return PEP.flow.member(); }   /* GUARD:flow-member-guide */",
                 name, 'guide member check', 'GUARD:flow-member-guide')
    body = rswap(body,
                 r"if \(hidden\.indexOf\(String\(p\.sku\)\) >= 0\) \{ return; \}[^\n]*\n(\s*var placeholder = p\.name\.indexOf\('\['\) >= 0;)\n\s*if \(placeholder && !PREVIEW\) \{ return; \}[^\n]*",
                 "if (!PEP.listed(p)) { return; }   /* GUARD:guide-listing-rule */   // the ONE listing rule (core/pep.js): held back, or a bracketed name on a live page\n          var placeholder = p.name.indexOf('[') >= 0;",
                 name, 'guide listing rule', 'GUARD:guide-listing-rule')
    return body


LIST_OLD = "return p && p.sku && p.name && (flags.PREVIEW || String(p.name).indexOf('[') < 0) && hidden.indexOf(String(p.sku)) < 0;"


def lineup_js(body, name):
    return swap(body, LIST_OLD, "return PEP.listed(p);   /* GUARD:lineup-listing-rule */", name, 'lineup listing rule')


def shelf_js(body, name):
    return swap(body, LIST_OLD, "return PEP.listed(p);   /* GUARD:shelf-listing-rule */", name, 'shelf listing rule')


# =====================================================================================================================
# 4. 22-doors: a done-state another page wrote does not open a door (I8-doors-planted-done)
# =====================================================================================================================
def doors_js(body, name):
    body = swap(body,
                "      function saved() { var s = ctx.state.get(STORE, null); return s && typeof s === 'object' ? s : {}; }\n",
                "      function saved() { var s = ctx.state.get(STORE, null); return s && typeof s === 'object' ? s : {}; }\n"
                "      // HARDEN (I8): a door opens on its success state only for a request THIS tab sent. The time kept in this browser\n"
                "      // (pep_doors_v1) is believed only when this tab's own sealed note (core/pep.js PEP.tab) holds the same time.\n"
                "      // A done-state written by any other page is not believed: the door shows its form.\n"
                "      function sealedNotes() { var n = PEP.tab.get('doors'); return n && typeof n === 'object' && !Array.isArray(n) ? n : {}; }\n"
                "      function sentHere(hook) {\n"
                "        var s = saved()[hook], n = sealedNotes();\n"
                "        return !!(s && typeof s === 'object' && typeof s.at === 'string' && Object.prototype.hasOwnProperty.call(n, hook) && n[hook] === s.at);\n"
                "      }\n"
                "      function sealNote(hook, at) {\n"
                "        var n = sealedNotes(), next = {};\n"
                "        Object.keys(n).forEach(function (k) { if (k !== hook) { next[k] = n[k]; } });\n"
                "        if (at) { next[hook] = at; }\n"
                "        PEP.tab.set('doors', next);\n"
                "      }\n",
                name, 'doors sealed note helpers')
    body = swap(body,
                "if (saved()[hook]) { show('done', true); }",
                "if (sentHere(hook)) { show('done', true); }   /* GUARD:doors-done-own-tab */",
                name, 'doors done on load')
    body = rswap(body,
                 r"(next\[hook\] = \{ at: now \};\s*ctx\.state\.set\(STORE, next\);)",
                 "next[hook] = { at: now };\n            ctx.state.set(STORE, next);\n            sealNote(hook, now);   // HARDEN: this tab's own record of the send",
                 name, 'doors note on send', 'sealNote(hook, now);')
    body = rswap(body,
                 r"(Object\.keys\(s\)\.forEach\(function \(k\) \{ if \(k !== hook\) \{ next\[k\] = s\[k\]; \} \}\);\s*ctx\.state\.set\(STORE, next\);)",
                 "Object.keys(s).forEach(function (k) { if (k !== hook) { next[k] = s[k]; } });\n            ctx.state.set(STORE, next);\n            sealNote(hook, null);   // HARDEN",
                 name, 'doors note on start again', 'sealNote(hook, null);')
    return body


# =====================================================================================================================
# 5. 30-cart
# =====================================================================================================================
def cart_js(body, name):
    # --- one member rule (I1-flow-member-rules)
    body = swap(body,
                "function isMember() { var f = ctx.state.get(FLOW, null); return !!(f && typeof f === 'object' && f.stage === 'TEAM'); }",
                "function isMember() { return PEP.flow.member(); }   /* GUARD:flow-member-cart */",
                name, 'cart member check')
    # --- the offer sentence comes from config.js only (I3-offer-wording)
    body = swap(body,
                "      qa('[data-pct]').forEach(function (el) { if (typeof pct === 'number') { el.textContent = String(pct); } });\n",
                "      qa('[data-pct]').forEach(function (el) { if (typeof pct === 'number') { el.textContent = String(pct); } });\n"
                "      qa('[data-offer-text]').forEach(function (el) { el.textContent = (cfg.offer && cfg.offer.text) || ''; });   // HARDEN: the offer sentence is config.js's, never a copy in the page\n",
                name, 'cart offer text')
    # --- totals are set in one view at a time (P1)
    body = swap(body,
                "      function setTotals(t) {\n"
                "        var set = function (sel, text) { qa(sel).forEach(function (el) { el.textContent = text; }); };\n"
                "        var vis = function (sel, on) { qa(sel).forEach(function (el) { el.hidden = !on; }); };\n",
                "      function setTotals(t, scope) {                       // HARDEN: scope = the cart view or the checkout view\n"
                "        var set = function (sel, text) { qa(sel, scope).forEach(function (el) { el.textContent = text; }); };\n"
                "        var vis = function (sel, on) { qa(sel, scope).forEach(function (el) { el.hidden = !on; }); };\n",
                name, 'cart setTotals scope')
    body = swap(body,
                "qa('[data-threshold-fill]').forEach(function (el) {",
                "qa('[data-threshold-fill]', scope).forEach(function (el) {",
                name, 'cart threshold fill scope')
    body = swap(body,
                "        drawLines();\n        drawSummary();\n        setTotals(totals());\n        emptyBox.hidden = has;\n",
                "        drawLines();\n"
                "        var t = totals();\n"
                "        memberShown = t.member;\n"
                "        setTotals(t, cartView);                            // HARDEN: the checkout step is drawn by drawEnd(), at CHECKOUT\n"
                "        emptyBox.hidden = has;\n",
                name, 'cart draw')
    body = swap(body,
                "      function say(key) {\n",
                "      // HARDEN (P1, I3): the amount to pay is worked out at the moment the visitor presses CHECKOUT, from the cart they\n"
                "      // have just read. If the saved cart or the membership changes under an open checkout step (another tab, any other\n"
                "      // page on this address), the step is left for the cart, with a line that says why. The amount is worked out again\n"
                "      // at the next CHECKOUT: an amount to pay never changes in front of the shopper.\n"
                "      var cartView = q('[data-view=\"cart\"]'), endView = q('[data-view=\"end\"]'), changedBox = q('[data-changed]');\n"
                "      var memberShown = false;\n"
                "      function drawEnd() { drawSummary(); setTotals(totals(), endView); }\n"
                "      function leaveCheckout() {\n"
                "        if (view !== 'end' && view !== 'age') { return; }\n"
                "        resetAge();\n"
                "        show('cart', !isOpen);\n"
                "        if (changedBox && isOpen) { changedBox.hidden = false; }\n"
                "      }\n"
                "      function recheck() {\n"
                "        var t = totals();\n"
                "        if (t.member !== memberShown) { leaveCheckout(); }\n"
                "        memberShown = t.member;\n"
                "        setTotals(t, cartView);\n"
                "      }\n"
                "      function say(key) {\n",
                name, 'cart checkout helpers')
    body = swap(body,
                "      function show(name, quiet) {\n        view = name;\n",
                "      function show(name, quiet) {\n"
                "        if (name === 'end') { drawEnd(); }                  // HARDEN: the amount to pay is worked out here, and only here\n"
                "        if (name !== 'cart' && changedBox) { changedBox.hidden = true; }\n"
                "        view = name;\n",
                name, 'cart show')
    body = swap(body,
                "        resetAge();                                    // a date that was chosen but not sent does not wait in the form\n",
                "        resetAge();                                    // a date that was chosen but not sent does not wait in the form\n"
                "        if (changedBox) { changedBox.hidden = true; }\n",
                name, 'cart close')
    body = swap(body,
                "      ctx.on('flow:state', function () { if (sizes) { setTotals(totals()); } });\n",
                "      ctx.on('flow:state', function () { if (sizes) { recheck(); } });\n",
                name, 'cart flow:state')
    body = rswap(body,
                 r"      // another tab changed the cart: take its version, so two tabs never overwrite each other's items\n"
                 r"      window\.addEventListener\('storage', function \(e\) \{.*?\n      \}\);\n",
                 "      // another tab (or another page on this address) changed the saved cart or the membership: take its version, so two\n"
                 "      // tabs never overwrite each other's items. An open checkout step is left first (see leaveCheckout).\n"
                 "      window.addEventListener('storage', function (e) {\n"
                 "        if (!sizes || !Object.keys(sizes).length) { return; }\n"
                 "        var k = e.key;\n"
                 "        var cartKey = k === null || k.slice(-KEY.length) === KEY, flowKey = k === null || k.slice(-FLOW.length) === FLOW;\n"
                 "        if (!cartKey && !flowKey) { return; }\n"
                 "        var next = clean(ctx.state.get(KEY, []));\n"
                 "        var moved = JSON.stringify(next) !== JSON.stringify(plain());\n"
                 "        if (!moved && isMember() === memberShown) { return; }\n"
                 "        leaveCheckout();   /* GUARD:checkout-leaves-on-change */\n"
                 "        lines = next;\n"
                 "        draw();\n"
                 "        if (moved) {\n"
                 "          var t = totals();\n"
                 "          ctx.emit('cart:changed', { count: t.count, lines: plain(), subtotalCAD: t.sub / 100 });\n"
                 "        }\n"
                 "      });\n",
                 name, 'cart storage listener', 'GUARD:checkout-leaves-on-change')
    # --- the one listing rule (I2-hash-live-unlisted)
    body = swap(body,
                "if (hidden.indexOf(String(p.sku)) >= 0) { return; }",
                "if (!PEP.listed(p)) { return; }   /* GUARD:cart-listing-rule */",
                name, 'cart listing rule')
    # --- the age pass and the stop are this tab's own (I4-gate-storage)
    body = swap(body,
                "      try { stopped = sessionStorage.getItem(STOP_KEY) === '1'; } catch (e) {}   /* GUARD:age-stop-kept */",
                "      try { stopped = sessionStorage.getItem(STOP_KEY) === '1'; } catch (e) {}   /* GUARD:age-stop-kept */\n"
                "      if (PEP.tab.get('stop') === true) { stopped = true; }                      // HARDEN: this tab's own note says the same, even if the plain key was removed",
                name, 'cart stop note read')
    body = rswap(body,
                 r"function hasPassed\(\) \{.*?return !!passed;\n      \}",
                 "function hasPassed() {\n"
                 "        if (passed) { return true; }\n"
                 "        // HARDEN (I4): the pass lives in memory for this page load. The copy that survives a reload is this tab's own\n"
                 "        // sealed note (core/pep.js PEP.tab). A plain pep_gate_v1 value in storage, which any other page on this address\n"
                 "        // could write, is never read.\n"
                 "        var g = PEP.tab.get('gate');   /* GUARD:age-pass-own-tab */\n"
                 "        if (g && typeof g === 'object' && g.ok === true && typeof g.province === 'string' && typeof ages[g.province] === 'number') { passed = { ok: true, province: g.province }; }\n"
                 "        return !!passed;\n"
                 "      }",
                 name, 'cart hasPassed', 'GUARD:age-pass-own-tab')
    body = swap(body,
                "try { sessionStorage.setItem(AGE_KEY, JSON.stringify(passed)); } catch (err) {}",
                "PEP.tab.set('gate', { ok: true, province: code });   // HARDEN: kept in this tab's sealed note, not under the plain key",
                name, 'cart pass kept')
    body = swap(body,
                "            try { sessionStorage.setItem(STOP_KEY, '1'); } catch (err) {}   // only this one word is kept, never the date\n",
                "            try { sessionStorage.setItem(STOP_KEY, '1'); } catch (err) {}   // only this one word is kept, never the date\n"
                "            PEP.tab.set('stop', true);                                        // HARDEN\n",
                name, 'cart stop kept')
    return body


CART_CSS_BEGIN = '/* ==== HARDEN: founder rows and the changed line ==== */'
CART_CSS_END = '/* ==== /HARDEN ==== */\n'
CART_CSS = r'''/* ==== HARDEN: founder rows and the changed line ==== */
/* the founder row: name and amount on one line, the saving on the next, then the line that says it is confirmed on review */
.pep-cart-k-c { grid-column: 1 / -1; grid-row: 3; font-size: 13px; line-height: 1.45; letter-spacing: .14em; color: var(--pep-plat-3); }
.pep-cart-join-a, .pep-cart-join-b { display: block; }
.pep-cart-join-b { margin-top: 4px; font-size: 15px; line-height: 1.45; }
.pep-cart-join-b:empty { display: none; }
.pep-cart-changed { margin: 0 0 14px; padding: 12px 14px; font-family: var(--pep-font-display); font-size: 15px; line-height: 1.4; letter-spacing: .1em; color: var(--pep-plat-4); box-shadow: inset 0 0 0 1px rgba(185, 190, 197, .4), inset 3px 0 0 rgba(42, 120, 255, .9); }
/* ==== /HARDEN ==== */
'''


def cart_css(body, name):
    a = body.find(CART_CSS_BEGIN)
    if a >= 0:
        b = body.find(CART_CSS_END, a)
        if b < 0:
            die(name + ': HARDEN css block is not closed')
        return body[:a] + CART_CSS + body[b + len(CART_CSS_END):]
    return body.rstrip('\n') + '\n' + CART_CSS


TEAM_ROW = ('<li class="pep-cart-row pep-cart-row--team" data-gate="offer" data-row="team" hidden><span class="pep-cart-k">'
            '<span class="pep-cart-k-a">FOUNDER PRICE</span><span class="pep-cart-k-dot"> · </span>'
            '<span class="pep-cart-k-b"><span data-pct></span>% OFF</span><span class="pep-cart-k-dot"> · </span>'
            '<span class="pep-cart-k-c" data-team-note>CONFIRMED WHEN YOUR ORDER IS REVIEWED</span></span>'
            '<span class="pep-cart-v" data-t="team"></span></li>')
JOIN_ROW = ('<li class="pep-cart-row pep-cart-row--join" data-gate="offer" data-row="join" hidden><a class="pep-cart-join" href="#join" data-leave>'
            '<span class="pep-cart-join-a">JOIN THE FOUNDER CIRCLE</span><span class="pep-cart-k-dot"> · </span>'
            '<span class="pep-cart-join-b" data-offer-text></span></a></li>')
CHANGED = ('          <!-- HARDEN: the saved cart or the membership changed while the checkout step was open: back to the cart, with the reason -->\n'
           '          <p class="pep-cart-changed" role="status" data-changed hidden>YOUR CART CHANGED IN ANOTHER TAB. CHECK IT, THEN PRESS CHECKOUT AGAIN.</p>\n')


def cart_html(h):
    a = h.find('<!-- module:30-cart -->')
    if a < 0:
        die('no <!-- module:30-cart --> marker')
    b = h.find('<!-- module:', a + 10)
    if b < 0:
        b = h.find('<script', a)
    if b < 0:
        die('the end of module 30-cart was not found')
    part = h[a:b]
    part = rswap(part, r'<li class="pep-cart-row pep-cart-row--team"[^\n]*?</li>', TEAM_ROW, '30-cart html', 'founder row', 'data-team-note')
    part = rswap(part, r'<li class="pep-cart-row pep-cart-row--join"[^\n]*?</li>', JOIN_ROW, '30-cart html', 'join row', 'pep-cart-join-a')
    if 'data-changed' not in part:
        anchor = '          <div class="pep-cart-empty" data-empty>'
        if part.count(anchor) != 1:
            die('30-cart html: anchor for the changed line found %d times (need 1)' % part.count(anchor))
        part = part.replace(anchor, CHANGED + anchor)
    return h[:a] + part + h[b:]


# =====================================================================================================================
def main():
    if len(sys.argv) != 3:
        die('usage: python3 -I apply.py IN.html OUT.html')
    h = open(sys.argv[1], encoding='utf-8').read()

    # 1. head
    head_end = h.find('</head>')
    if head_end < 0:
        die('no </head>')
    charset = '<meta charset="utf-8">'
    if h.count(charset) != 1 or h.find(charset) > head_end:
        die('anchor <meta charset="utf-8"> not found once in the head')
    h = region(h, '<!-- HARDEN:BEGIN frame -->', '<!-- HARDEN:END frame -->', FRAME, after=charset, where='head')
    first = re.search(r'<script\b[^>]*>', h)
    if not first or 'core/frame.js' not in first.group(0):
        die('core/frame.js is not the first script of the page')

    # 2-5. scripts and styles
    h = edit(h, 'core/pep.js', pep_js)
    h = edit(h, 'modules/10-hero/hero.js', hero_js)
    h = edit(h, 'modules/45-hooks/hooks.js', hooks_js)
    h = edit(h, 'modules/40-guide/guide.js', guide_js)
    h = edit(h, 'modules/16-lineup/lineup.js', lineup_js)
    h = edit(h, 'modules/20-shelf/shelf.js', shelf_js)
    h = edit(h, 'modules/22-doors/doors.js', doors_js)
    h = edit(h, 'modules/30-cart/cart.js', cart_js)
    h = edit(h, 'modules/30-cart/cart.css', cart_css, tag='style')
    h = cart_html(h)

    # the page must still hold every guard this file adds
    guards = ['GUARD:flow-stage-six', 'GUARD:flow-read-clean', 'GUARD:listing-bracket-live', 'GUARD:flow-member-hero',
              'GUARD:flow-member-hooks', 'GUARD:flow-member-guide', 'GUARD:flow-member-cart', 'GUARD:guide-listing-rule',
              'GUARD:lineup-listing-rule', 'GUARD:shelf-listing-rule', 'GUARD:cart-listing-rule', 'GUARD:doors-done-own-tab',
              'GUARD:age-pass-own-tab', 'GUARD:checkout-leaves-on-change', 'window.top !== window.self']
    missing = [g for g in guards if h.count(g) != 1]
    if missing:
        die('after the run these guards are not in the page exactly once: ' + ', '.join(missing))
    open(sys.argv[2], 'w', encoding='utf-8').write(h)
    print('HARDEN apply.py: ok, %d guards in place' % len(guards))


main()
