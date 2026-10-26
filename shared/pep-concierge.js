/* PEPTICITY help bot (CON-01 · Vetted Concierge). Vetted mode: every answer comes from the approved
   lists below or from PEPINV. No AI runs, nothing is invented. Medical questions (dosing, effects, safety,
   "is it right for me") always go to a licensed clinician or a person. Live AI comes later, behind the
   same guard rules, once Grace and counsel approve the wording and a monthly cost cap.
   Needs: window.PEP (pep-core) and window.PEPINV (inventory.js). Markup is built on first open. */
(function (W, D) {
  'use strict';
  var P = W.PEP, INV = W.PEPINV, $ = P.$, $$ = P.$$, el = P.el, C = P.C;
  var HANDOFF = "That's a question for a licensed clinician. They go through it with you as part of your free assessment, with your health and medicines in mind.";
  var FAQ = [
    { id: 'peptide', q: 'What is a peptide?', k: ['what is a peptide', 'what are peptides', 'peptide mean', 'peptides are'],
      a: 'A peptide is a short chain of amino acids, the building blocks of proteins. Your body makes many of its own. Some peptides are also prescription medicines.' },
    { id: 'how', q: 'How does PEPTICITY work?', k: ['how does', 'how it works', 'process', 'steps', 'get started', 'start', 'sign up'],
      a: 'You take the free assessment. A licensed clinician reviews it and decides if a plan is right for you. If it is, a licensed partner pharmacy prepares it, every lot is tested, and it ships cold to your door.' },
    { id: 'rx', q: 'Do I need a prescription?', k: ['prescription', 'without a doctor', 'rx', 'buy without'],
      a: 'Yes. Every plan is prescribed by a licensed clinician after a review. Nothing is sold "for research use".' },
    { id: 'buy', q: 'Can I just buy a peptide?', k: ['can i buy', 'order', 'purchase', 'add to cart', 'sell', 'in stock', 'available', 'do you carry', 'do you have'],
      a: "PEPTICITY doesn't sell peptides off a shelf. A licensed clinician decides if a plan is right for you, and a licensed partner pharmacy prepares it. [Which peptides PEPTICITY offers: confirm with Grace]" },
    { id: 'research', q: 'What does "research use only" mean?', k: ['research use', 'research only', 'research purposes', 'not for human', 'research chemical'],
      a: 'It means a product is sold as a lab chemical, not for people, so nobody checks who it is for. PEPTICITY works the other way: a licensed clinician reviews you, and a licensed partner pharmacy prepares your plan.' },
    { id: 'compound', q: 'Is compounded the same as approved?', k: ['compounded', 'compounding', 'same as', 'generic', 'fda approved', 'approved'],
      a: 'No. A compounded medicine is prepared by a pharmacy for one patient. It is not FDA-approved, and we never say it is the same as an approved medicine.' },
    { id: 'lot', q: 'How do I check what is in my vial?', k: ['lot', 'certificate', 'coa', 'tested', 'testing', 'purity', 'lab', 'what is in my vial', 'fake'],
      a: 'Every vial has a lot code. Enter it in the lot lookup on The science page to see that lot\'s certificate of analysis.', go: ['#ledger', 'Open the lot lookup'] },
    { id: 'cost', q: 'What does it cost?', k: ['cost', 'price', 'how much is', 'how much does', 'expensive', 'pay', 'fee', 'afford'],
      a: 'The review is free. Membership is $[xx] a month, all-in, and you see the full price before you pay. If peptides aren\'t right for you, you pay nothing. [Confirm pricing with Grace]', go: ['#shop', 'See membership'] },
    { id: 'ship', q: 'Where do you ship?', k: ['ship', 'shipping', 'deliver', 'delivery', 'canada', 'province', 'state', 'usa', 'cold'],
      a: 'Plans ship cold in an insulated case. [States and provinces at launch: confirm with Grace] If you are outside them, you can join the waitlist.' },
    { id: 'cancel', q: 'Can I cancel?', k: ['cancel', 'stop membership', 'quit', 'pause'],
      a: 'Yes, in two clicks from your account. No phone call needed.' },
    { id: 'who', q: 'Who are the clinicians?', k: ['clinician', 'doctor', 'nurse', 'who reviews', 'licensed', 'licence', 'license'],
      a: '[Clinician network: confirm with Grace]. Each clinician\'s licence can be checked with the board that issued it.' },
    { id: 'pharmacy', q: 'Who prepares it?', k: ['pharmacy', 'who makes', 'made', 'prepared', 'manufactur'],
      a: 'A licensed partner pharmacy: [pharmacy name: confirm with Grace].' },
    { id: 'refund', q: 'Can I get a refund?', k: ['refund', 'money back', 'charged', 'charge back', 'billing'],
      a: 'If a licensed clinician decides peptides aren\'t right for you, you pay nothing. For anything else about a payment, a person can help at the number below. [Refund policy: confirm with Grace]' },
    { id: 'labs', q: 'Do I need blood work?', k: ['blood work', 'bloodwork', 'blood test', 'labs', 'lab work', 'lab test', 'requisition'],
      a: 'Only if your clinician asks for it. If they do, the care team helps you book it. [Lab partner and cost: confirm with Grace]' },
    { id: 'next', q: 'What happens after the assessment?', k: ['after the assessment', 'after i apply', 'what happens next', 'how long', 'when will', 'hear back', 'wait'],
      a: 'A licensed clinician reviews your answers and contacts you by phone, video or secure message, whichever you chose. You get a clear yes or no, with the reasons. [Review time: confirm with Grace]' },
    { id: 'visit', q: 'Do I have to see someone in person?', k: ['in person', 'office', 'clinic visit', 'appointment', 'video', 'telehealth', 'virtual', 'online'],
      a: 'No. Reviews happen by phone, video or secure messages, whichever you prefer. Labs, if your clinician asks for them, are done at a nearby lab.' },
    { id: 'followup', q: 'Do I get follow-ups?', k: ['follow up', 'follow-up', 'check in', 'ongoing', 'support', 'questions later'],
      a: 'Yes. Membership includes clinician follow-ups and a person to call at the number below. [Follow-up schedule: confirm with Grace]' },
    { id: 'privacy', q: 'Is my information private?', k: ['private', 'privacy', 'my data', 'information safe', 'confidential', 'hipaa', 'phipa', 'share my'],
      a: 'Your answers go only to the care team and your clinician, and are never sold. [Privacy policy: confirm with counsel]' },
    { id: 'damaged', q: 'What if my order arrives damaged or warm?', k: ['damaged', 'broken', 'warm', 'leak', 'melted', 'arrived', 'seal broken', 'wrong item', 'missing'],
      a: 'Keep it sealed and call the care team at the number below. They will arrange a replacement. [Replacement policy: confirm with Grace]' },
    { id: 'store', q: 'How do I store it?', k: ['store', 'storage', 'fridge', 'refrigerat', 'freeze', 'room temperature', 'travel with'],
      a: 'Storage instructions come with your plan from the pharmacy. If anything is unclear, call the care team.' },
    { id: 'insurance', q: 'Do you take insurance?', k: ['insurance', 'hsa', 'fsa', 'benefits', 'covered', 'receipt for'],
      a: '[Insurance, HSA and FSA: confirm with Grace] You always get an itemised receipt.' },
    { id: 'legal', q: 'Is this legal?', k: ['legal', 'allowed', 'regulated', 'law', 'health canada'],
      a: 'PEPTICITY works only through licensed clinicians and a licensed partner pharmacy, and nothing is sold "for research use". [Jurisdiction wording: confirm with counsel]' },
    { id: 'about', q: 'Who is behind PEPTICITY?', k: ['who are you', 'who owns', 'about you', 'company', 'real company', 'based', 'located', 'where are you'],
      a: '[About PEPTICITY and where it is based: confirm with Grace]' },
    { id: 'family', q: 'Can my partner or family join?', k: ['partner', 'husband', 'wife', 'family', 'spouse', 'friend', 'both of us'],
      a: 'Each person takes their own assessment, because a clinician reviews everyone separately. [Family offer: confirm with Grace]' },
    { id: 'list', q: 'What peptides do you have?', k: ['what peptides', 'which peptides do you', 'list of', 'catalog', 'catalogue', 'menu', 'products', 'what do you have', 'what do you carry'],
      a: '@browse' },
    { id: 'age', q: 'Is there an age limit?', k: ['age limit', 'old', 'senior', 'too old', 'young', 'teen'],
      a: 'The service is for adults 18 and over. There is no upper age limit: a licensed clinician looks at your health and medicines, whatever your age.' }
  ];
  var EMERG = /(chest pain|can'?t breathe|cannot breathe|trouble breathing|suicid|kill myself|end my life|self.?harm|overdos|seizure|unconscious|emergency|anaphyla|throat (is )?closing)/i;
  var MED = /(dose|dosage|dosing|how much (should i|do i (take|use)|to (take|use))|how many (mg|iu|units)|\bmg\b|\bmcg\b|\biu\b|inject|needle|syringe|side.?effect|reaction|pregnan|breast.?feed|safe (for|to)|is it safe|interact|with my (meds|medication)|cycle|stack|reconstitut|mix(ing)?|results|work for me|lose weight|weight loss|should i (take|use|try)|recommend|best peptide|which peptide (should|would|is (best|right)|for)|what does .* do|what is .* for|benefit|help (with|my)|cure|treat|symptom|diagnos|my doctor said|blood (sugar|pressure)|diabet|cancer|heart)/i;
  var HUMAN = /(human|real person|a person|someone|call me|phone|talk to|speak to|agent|representative)/i;
  var log, chips, inp, panel, launch, ann, opened = false, lastFocus = null;

  function norm(s) { return ' ' + String(s).toLowerCase().replace(/[^a-z0-9+\- ]/g, ' ').replace(/\s+/g, ' ') + ' '; }
  function findProducts(t) {
    var n = norm(t), hits = [];
    INV.products.forEach(function (p) {
      var names = [p.name].concat(p.aka || []);
      if (names.some(function (a) { var x = norm(a).trim(); return x.length > 1 && (n.indexOf(' ' + x + ' ') >= 0 || (x.length > 4 && n.indexOf(x) >= 0)); })) hits.push(p);
    });
    return hits;
  }
  function findFaq(t) {
    var n = norm(t), best = null, score = 0;
    FAQ.forEach(function (f) { var s = 0; f.k.forEach(function (k) { if (n.indexOf(k) >= 0) s += k.length; }); if (s > score) { score = s; best = f; } });
    return best;
  }

  /* ---------- rendering ---------- */
  function bubble(who, nodes) {
    var li = el('li', 'cc-msg cc-' + who);
    if (who === 'bot') li.appendChild(el('span', 'cc-who mono', 'PEPTICITY'));
    (Array.isArray(nodes) ? nodes : [nodes]).forEach(function (n) { li.appendChild(typeof n === 'string' ? el('p', '', n) : n); });
    log.appendChild(li);
    requestAnimationFrame(function () { log.scrollTop = log.scrollHeight; });
    return li;
  }
  function say(nodes, follow, plain) {
    var li = bubble('bot', nodes);
    ann.textContent = ''; setTimeout(function () { ann.textContent = plain || li.textContent.replace(/^PEPTICITY/, ''); }, 60);
    setChips(follow || ['quiz', 'browse', 'human']);
  }
  function product(p) {
    var card = el('div', 'cc-prod');
    card.appendChild(el('h3', 'cc-pn', p.name));
    var sz = el('p', 'cc-sz mono'); sz.textContent = 'Listed sizes: ' + p.sizes.join(' · '); card.appendChild(sz);
    card.appendChild(el('p', '', p.what));
    card.appendChild(el('p', 'cc-st', p.status));
    return card;
  }
  function answerProduct(p, med) {
    var nodes = [product(p)];
    nodes.push(el('p', 'cc-hand', med ? HANDOFF : 'What it does, how it is used and whether it is right for you are questions for a licensed clinician, as part of your free assessment.'));
    say(nodes, ['quiz', 'buy', 'browse', 'human']);
  }
  var CHIP = {
    quiz: ['Start my free assessment', function () { close(); setTimeout(function () { P.openQuiz(null); }, 260); }],
    browse: ['Browse the peptides', browse],
    human: ['Talk to a person', human],
    how: ['How does it work?', function () { ask('How does PEPTICITY work?'); }],
    cost: ['What does it cost?', function () { ask('What does it cost?'); }],
    lot: ['How is each lot tested?', function () { ask('How do I check what is in my vial?'); }],
    research: ['What does "research use only" mean?', function () { ask('What does "research use only" mean?'); }],
    buy: ['Can I just buy a peptide?', function () { ask('Can I just buy a peptide?'); }],
    compound: ['Is compounded the same as approved?', function () { ask('Is compounded the same as approved?'); }]
  };
  function setChips(keys) {
    chips.textContent = '';
    keys.forEach(function (k) {
      var c = CHIP[k]; if (!c) return;
      var b = el('button', 'cc-chip' + (k === 'quiz' ? ' is-cta' : ''), c[0]); b.type = 'button';
      b.addEventListener('click', function () { if (k !== 'quiz' && k !== 'browse' && k !== 'human') return c[1](); bubble('you', c[0]); c[1](); });
      chips.appendChild(b);
    });
  }
  function browse() {
    var wrap = el('div', 'cc-browse');
    wrap.appendChild(el('p', '', 'Here is everything on Grace\'s current list. Pick one to see what it is.'));
    INV.groups.forEach(function (g) {
      var ps = INV.products.filter(function (p) { return p.group === g[0]; }); if (!ps.length) return;
      wrap.appendChild(el('p', 'cc-gh mono', g[1]));
      var row = el('div', 'cc-plist');
      ps.forEach(function (p) { var b = el('button', 'cc-pbtn', p.name); b.type = 'button'; b.addEventListener('click', function () { bubble('you', p.name); answerProduct(p, false); }); row.appendChild(b); });
      wrap.appendChild(row);
    });
    say([wrap], ['quiz', 'research', 'human'], 'A list of peptides by group. Pick one to see what it is.');
  }
  function human() {
    var box = el('div', 'cc-human-box');
    box.appendChild(el('p', '', 'A real person can help. Call ' + C.phone + ', or leave your number and the care team will call you back.'));
    var a = el('a', 'cc-link', 'Ask for a call back'); a.href = '#contact'; a.addEventListener('click', function () { close(); });
    box.appendChild(a);
    say([box], ['quiz', 'how']);
  }
  function emergency() {
    say([el('p', 'cc-emerg', 'If this is an emergency, call 911 now. For a mental-health crisis in the US or Canada, call or text 988.'), el('p', '', 'For anything else, a person is at ' + C.phone + '.')], ['human']);
  }

  /* ---------- the answer rules (vetted mode) ---------- */
  function ask(text) {
    text = String(text || '').trim().slice(0, 500); if (!text) return;
    bubble('you', text);
    if (EMERG.test(text)) return emergency();
    if (/\b(1[0-7]|[1-9]) ?(years? old|yo|y\/o)\b|\bi'?m (a )?(teen|minor)\b|\bunder 18\b/i.test(text)) return say(['This service is for adults 18 and over. If you have questions, a parent or guardian can call ' + C.phone + '.'], ['human']);
    var prods = findProducts(text), med = MED.test(text);
    if (prods.length === 1) return answerProduct(prods[0], med);
    if (prods.length > 1) {
      var list = el('div', 'cc-plist'); prods.forEach(function (p) { var b = el('button', 'cc-pbtn', p.name); b.type = 'button'; b.addEventListener('click', function () { bubble('you', p.name); answerProduct(p, med); }); list.appendChild(b); });
      return say([el('p', '', 'I found more than one. Which did you mean?'), list, med ? el('p', 'cc-hand', HANDOFF) : el('span')], ['quiz', 'human']);
    }
    if (med) return say([el('p', 'cc-hand', HANDOFF)], ['quiz', 'human', 'browse']);
    var f = findFaq(text);
    if (f && f.a === '@browse') return browse();
    if (f) {
      var nodes = [el('p', '', f.a)];
      if (f.go) { var a = el('a', 'cc-link', f.go[1]); a.href = f.go[0]; a.addEventListener('click', function () { close(); }); nodes.push(a); }
      return say(nodes, ['quiz', 'browse', 'human']);
    }
    if (HUMAN.test(text)) return human();
    say(["I don't have a vetted answer for that yet, and I won't guess. A person can help at " + C.phone + ', or browse the peptides and common questions below.'], ['human', 'browse', 'how', 'cost']);
  }

  /* ---------- panel ---------- */
  function build() {
    launch = $('.cc-launch');
    panel = el('section', 'cc'); panel.id = 'concierge'; panel.hidden = true;
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-labelledby', 'cc-title');
    panel.innerHTML = '<header class="cc-top"><div><h2 id="cc-title" class="cc-title">Ask PEPTICITY</h2>' +
      '<p class="cc-disc">Answers come from a vetted list. This assistant can\'t give medical advice: a licensed clinician makes every care decision. <span class="cc-draft mono">Draft answers: Grace + counsel to approve</span></p></div>' +
      '<button class="cc-close" type="button" aria-label="Close the help panel">&#215;</button></header>' +
      '<ol class="cc-log" aria-label="Conversation"></ol><p class="sr" aria-live="polite" id="cc-ann"></p>' +
      '<div class="cc-chips" role="group" aria-label="Suggested questions"></div>' +
      '<form class="cc-form"><label for="cc-q" class="sr">Your question</label><input id="cc-q" class="cc-in" maxlength="500" autocomplete="off" placeholder="Ask about a peptide or how it works"><button class="cc-send" type="submit">Ask</button></form>' +
      '<p class="cc-foot">Talk to a person: <span class="mono">' + C.phone + '</span></p>';
    D.body.appendChild(panel);
    log = $('.cc-log', panel); chips = $('.cc-chips', panel); inp = $('#cc-q', panel); ann = $('#cc-ann', panel);
    $('.cc-close', panel).addEventListener('click', close);
    $('.cc-form', panel).addEventListener('submit', function (e) { e.preventDefault(); var v = inp.value; inp.value = ''; ask(v); });
    panel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); return close(); }
      if (e.key !== 'Tab') return;
      var f = $$('button, a[href], input', panel).filter(function (x) { return !x.disabled && x.offsetParent; }), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && D.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && D.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    say(['Hi. Ask me about any peptide on Grace\'s list, or how PEPTICITY works. For anything about your own health, I\'ll connect you with a licensed clinician or a person.'], ['browse', 'how', 'cost', 'research', 'human'], 'Hi. Ask about any peptide, or how PEPTICITY works.');
  }
  var outside = function () { return [$('main'), $('.top'), $('.foot'), $('.sticky-cta'), launch]; };
  function open() {
    if (D.documentElement.classList.contains('intro-on')) return;
    if (!panel) build();
    lastFocus = D.activeElement; opened = true;
    panel.hidden = false; requestAnimationFrame(function () { panel.classList.add('is-open'); });
    launch.setAttribute('aria-expanded', 'true');
    outside().forEach(function (n) { if (n) n.inert = true; });
    if (P.lenis) P.lenis.stop();
    setTimeout(function () { inp.focus(); }, 80);
  }
  function close() {
    if (!panel || panel.hidden) return;
    panel.classList.remove('is-open'); opened = false;
    launch.setAttribute('aria-expanded', 'false');
    outside().forEach(function (n) { if (n) n.inert = false; });
    if (P.lenis) P.lenis.start();
    setTimeout(function () { if (!opened) panel.hidden = true; }, 350);
    (lastFocus && lastFocus.focus ? lastFocus : launch).focus();
  }
  function concierge() {
    launch = $('.cc-launch'); if (!launch || !INV) return;
    launch.addEventListener('click', function () { if (panel && !panel.hidden) close(); else open(); });
    D.addEventListener('click', function (e) { var t = e.target.closest('[data-ask]'); if (t) { e.preventDefault(); open(); var q = t.getAttribute('data-ask'); if (q) ask(q); } });
  }
  P.concierge = concierge; P.ask = function (q) { open(); ask(q); };
})(window, document);
