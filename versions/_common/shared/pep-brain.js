/* PEPTICITY help bot brain (CON-01 \u00b7 vetted mode). Pure logic, no DOM, so it runs the same in the page
   and in the test suite (tools/brain-test.js).

   Rules, in order:
   1. Every reply comes from LIB (frozen) or from a product record in PEPINV. Nothing is generated.
   2. Text is normalised before any check: accents, look-alike digits (d0se), spacing and dots (b.p.c),
      repeated letters, zero-width characters.
   3. Safety is decided before anything commercial: emergency, then attempts to change the rules,
      then under-18, then medical questions. A product name never outranks a medical question.
   4. Every outgoing string passes emitCheck(): if it contains a banned claim stem, the reply is
      swapped for the clinician hand-off. That is the last line of defence, not the first.
   Works in the browser (window.PEPBRAIN) and in Node (module.exports). */
(function (root, factory) {
  var api = factory(root.PEPINV || (typeof require === 'function' ? require('./inventory.js') : null));
  if (typeof module === 'object' && module.exports) module.exports = api; else root.PEPBRAIN = api;
})(typeof window !== 'undefined' ? window : globalThis, function (INV) {
  'use strict';
  var PHONE = '[phone number]';
  function deepFreeze(o) { Object.getOwnPropertyNames(o).forEach(function (k) { var v = o[k]; if (v && typeof v === 'object') deepFreeze(v); }); return Object.freeze(o); }

  /* ---------- the reviewed reply library ---------- */
  var LIB = deepFreeze({
    intro: "Hi, I'm the PEPTICITY GUIDE. I can explain how PEPTICITY works and help you find the right next step. I'm not a doctor, and this isn't medical advice: anything about your own health goes to a licensed clinician.",
    greet: "Hi. Ask me how PEPTICITY works, what a consult involves, or what it costs. For anything about your own health, I'll connect you with a licensed clinician or a person.",
    thanks: "You're welcome. Anything else? A person is also at " + PHONE + '.',
    handoff: "That's a question for a licensed clinician. They go through it with you as part of your free assessment, with your health and medicines in mind.",
    handoffProduct: 'What it does, how it is used and whether it is right for you are questions for a licensed clinician, as part of your free assessment.',
    emergency: 'If this is an emergency, call 911 now. For a mental-health crisis in Canada or the US, call or text 9-8-8.',
    emergency2: 'For anything else, a person is at ' + PHONE + '.',
    minor: 'This service is for adults: 18 and over, or 19 and over in BC, NB, NL, NS and the territories. If you have questions, a parent or guardian can call ' + PHONE + '.',
    injection: "I can only answer from PEPTICITY's vetted list, and I can't change how I work. Ask about a peptide or the service, or talk to a person at " + PHONE + '.',
    notListed: "That isn't on PEPTICITY's current list. A licensed clinician can talk through options with you as part of your free assessment.",
    many: 'I found more than one. Which did you mean?',
    human: 'A real person can help. Call ' + PHONE + ', or leave your number and the care team will call you back.',
    fallback: "I don't have a vetted answer for that yet, and I won't guess. A person can help at " + PHONE + ', or browse the peptides and common questions.',
    browse: "Here is everything on PEPTICITY's current list. Pick one to see what it is.",
    outcome: "Nobody can promise a result, and we won't. A licensed clinician looks at your goals and health and tells you honestly what a plan can and can't do.",
    namesLater: 'Specific programs are something your clinician goes through with you in your consult, with your health and goals in mind. The 2-minute quiz is the quickest way to start.',
    browseHidden: 'Programs are matched to you in your consult. Start with the 2-minute quiz, or ask me how the consult works.',
    faq: {
      peptide: 'A peptide is a short chain of amino acids, the building blocks of proteins. Your body makes many of its own. Some peptides are also prescription medicines.',
      how: 'You take the free assessment. A licensed clinician reviews it and decides if a plan is right for you. If it is, a licensed partner pharmacy prepares it, every lot is tested, and it ships cold to your door.',
      rx: 'Yes. Every plan is prescribed by a licensed clinician after a review. Nothing is sold "for research use".',
      buy: "PEPTICITY doesn't sell peptides off a shelf. A licensed clinician decides if a plan is right for you, and a licensed partner pharmacy prepares it. [Which peptides PEPTICITY offers: confirm with Grace]",
      research: 'It means a product is sold as a lab chemical, not for people, so nobody checks who it is for. PEPTICITY works the other way: a licensed clinician reviews you, and a licensed partner pharmacy prepares your plan.',
      compound: 'No. A compounded medicine is prepared by a pharmacy for one patient. It is not FDA-approved, and we never say it is the same as an approved medicine.',
      lot: "Every vial has a lot code. Enter it in the lot lookup to see that lot's certificate of analysis.",
      cost: "The review is free. Membership is $[xx] a month, all-in, and you see the full price before you pay. If peptides aren't right for you, you pay nothing. [Confirm pricing with Grace]",
      ship: 'Plans ship cold in an insulated case. [States and provinces at launch: confirm with Grace] If you are outside them, you can join the waitlist.',
      cancel: 'Yes, in two clicks from your account. No phone call needed.',
      refund: "If a licensed clinician decides peptides aren't right for you, you pay nothing. For anything else about a payment, a person can help at " + PHONE + '. [Refund policy: confirm with Grace]',
      who: "[Clinician network: confirm with Grace]. Each clinician's licence can be checked with the board that issued it.",
      pharmacy: 'A licensed partner pharmacy: [pharmacy name: confirm with Grace].',
      labs: 'Only if your clinician asks for it. If they do, the care team helps you book it. [Lab partner and cost: confirm with Grace]',
      next: 'A licensed clinician reviews your answers and contacts you by phone, video or secure message, whichever you chose. You get a clear yes or no, with the reasons. [Review time: confirm with Grace]',
      visit: 'No. Reviews happen by phone, video or secure messages, whichever you prefer. Labs, if your clinician asks for them, are done at a nearby lab.',
      followup: 'Yes. Membership includes clinician follow-ups and a person to call at ' + PHONE + '. [Follow-up schedule: confirm with Grace]',
      privacy: 'Your answers go only to the care team and your clinician, and are never sold. [Privacy policy: confirm with counsel]',
      damaged: 'Keep it sealed and call the care team at ' + PHONE + '. They will arrange a replacement. [Replacement policy: confirm with Grace]',
      store: 'Storage instructions come with your plan from the pharmacy. If anything is unclear, call the care team.',
      insurance: '[Insurance, HSA and FSA: confirm with Grace] You always get an itemised receipt.',
      legal: 'PEPTICITY works only through licensed clinicians and a licensed partner pharmacy, and nothing is sold "for research use". [Jurisdiction wording: confirm with counsel]',
      about: '[About PEPTICITY and where it is based: confirm with Grace]',
      family: 'Each person takes their own assessment, because a clinician reviews everyone separately. [Family offer: confirm with Grace]',
      age: 'The service is for adults: 18 and over, or 19 and over in BC, NB, NL, NS and the territories. There is no upper age limit: a licensed clinician looks at your health and medicines, whatever your age.',
      fitness: "You don't need a workout routine to start. The free assessment asks how active you are, including not at all, and a licensed clinician takes it from there."
    }
  });

  /* ---------- normalisation ---------- */
  var LEET = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '$': 's', '!': 'i' };
  function norm(s) {
    s = String(s == null ? '' : s).slice(0, 500);
    try { s = s.normalize('NFKD').replace(/[\u0300-\u036f]/g, ''); } catch (e) {}
    s = s.replace(/[\u200b-\u200f\u2060\ufeff]/g, '').toLowerCase();
    s = s.replace(/[\u2019\u2018`]/g, "'");
    return ' ' + s.replace(/\s+/g, ' ').trim() + ' ';
  }
  // a second, harder view: look-alike characters swapped, single letters joined ("d o s e", "b.p.c"), runs squeezed ("dooose")
  function squash(s) {
    var t = s.replace(/[013457@$!]/g, function (c) { return /[a-z]/.test(s.charAt(s.indexOf(c) - 1) || '') || /[a-z]/.test(s.charAt(s.indexOf(c) + 1) || '') ? LEET[c] : c; });
    t = t.replace(/\b([a-z])[\s.\-_*]+(?=[a-z]\b)/g, '$1');
    t = t.replace(/([a-z])\1{2,}/g, '$1');
    return t;
  }

  /* ---------- patterns (tested in tools/brain-test.js) ---------- */
  var EMERG = /(chest pain|can'?t breathe|cannot breathe|trouble breathing|short of breath|suicid|kill (my ?self|me)|end (my life|it all)|want to die|wanna die|don'?t want to (live|be here)|no reason to live|self.?harm|harm(ing)? my ?self|hurt(ing)? my ?self|cut(ting)? my ?self|overdos|took too (many|much)|seizure|unconscious|passed out|emergency|anaphyla|throat (is )?(closing|swelling)|severe (allergic|reaction))/;
  var INJECT = /(ignore (all |your |the )?(previous|prior|above)|disregard (your|the) (rules|instructions)|system prompt|you are now|pretend (to be|you)|act as (a|an|my)|jailbreak|developer mode|dan mode|role.?play as|new instructions|override)/;
  var MINOR = /(\b(1[0-7]|[1-9]) ?(years? old|yrs? old|yo|y\/o)\b|\bi'?m (a )?(teen|teenager|minor|1[0-7])\b|\bi am (a )?(teen|teenager|minor|1[0-7])\b|\b(age|aged) 1[0-7]\b|\bi'?m only 1[0-7]\b|\bunder 18\b|\bhigh school(er)?\b|\bmy (son|daughter) is (1[0-7]|[1-9])\b)/;
  var MED = new RegExp([
    'dos(e|es|age|ing)', 'how much (should|do i|to|can i)', 'how much .{1,30}(take|use|inject|run)\\b', 'how many (mg|mcg|iu|units|times)', '\\b\\d+ ?(mg|mcg|iu|ml|units?)\\b',
    'inject', 'needle', 'syringe', 'pin(ning)?\\b', 'subq', 'sub-?q', 'intramuscular', '\\bim\\b shot', 'reconstitut', 'bac(teriostatic)? water ratio', '\\bmix(ing)?\\b',
    'side.?effect', 'reaction', 'safe (for|to)', 'is it safe', 'dangerous', 'risk', 'interact', 'with my (meds|medication|pills)', 'blood thinner', 'contraindicat',
    'pregnan', 'breast.?feed', 'nursing', 'trying to conceive',
    'cycle', 'stack', 'protocol', 'regimen', 'how long (should|do i|to) (take|use|run)', 'when (should|do) i take', 'before bed', 'empty stomach', 'fasted',
    'results', 'work for me', 'does it work', 'will it (help|work)', 'lose weight', 'weight loss', 'fat loss', 'burn fat', 'build muscle', 'muscle gain', 'anti.?aging', 'longevity benefit',
    'should i (take|use|try|start)', 'recommend', 'best peptide', 'which peptide (should|would|is (best|right)|for)', 'what (does|do) .{1,30} do\\b', 'what is .{1,30} (for|good for)', 'benefit', 'help (with|my|me)',
    'cure', 'treat', 'heal', 'symptom', 'diagnos', 'my doctor said', 'blood (sugar|pressure)', 'diabet', 'cancer', 'heart', 'thyroid', 'injur', 'tendon', 'joint pain', 'arthritis', 'libido', 'erect', 'anxiety', 'depress', 'insomnia', 'sleep better'
  ].join('|'));
  var OUTCOME = /(will i lose|lose \d+|\d+ ?(lb|lbs|pounds|kg|kilos)\b|how (much|fast|quickly) (will|can|do) i|how long (until|before|till) (i see|it works|results)|guarantee|before and after|results (in|after))/;
  var SAME = /((same|equivalent|identical) (as|to)|generic|just like|copy of|knock.?off) .{0,30}(ozempic|wegovy|mounjaro|zepbound|rybelsus|saxenda)|(ozempic|wegovy|mounjaro|zepbound|rybelsus|saxenda) .{0,30}(same|equivalent|generic|identical)/;
  var HUMAN = /(human|real person|a person|someone|call me|phone number|talk to|speak to|agent|representative|customer service)/;
  var GREET = /^ (hi|hey|hello|yo|good (morning|afternoon|evening)|hiya)[ !.]*$/;
  var THANKS = /^ (thanks|thank you|thx|ty|cheers|great|ok|okay|perfect)[ !.]*$/;
  var UNLISTED = /(semaglutide|ozempic|wegovy|sermorelin|kisspeptin|dsip|ghrp|hexarelin|ll-?37|follistatin|cagrilintide|slu-?pp|foxo4|humanin|mk-?677|ibutamoren|dihexa|cerebrolysin|liraglutide|saxenda|testosterone|trt|hcg|peg-?mgf)/;

  var FAQK = [
    ['peptide', ['what is a peptide', 'what are peptides', 'peptide mean', 'peptides are']],
    ['how', ['how does', 'how it works', 'process', 'steps', 'get started', 'sign up', 'how do i start']],
    ['rx', ['prescription', 'without a doctor', 'without a prescription', 'rx']],
    ['buy', ['can i buy', 'order', 'purchase', 'add to cart', 'do you sell', 'in stock', 'available', 'do you carry', 'do you have', 'cheap', 'wholesale', 'bulk']],
    ['research', ['research use', 'research only', 'research purposes', 'not for human', 'research chemical']],
    ['compound', ['compounded', 'compounding', 'same as', 'generic', 'fda approved', 'approved']],
    ['lot', ['lot', 'certificate', 'coa', 'tested', 'testing', 'purity', 'what is in my vial', 'fake', 'counterfeit', 'third party']],
    ['cost', ['cost', 'price', 'how much is', 'how much does', 'expensive', 'pay', 'fee', 'afford', 'discount', 'coupon', 'promo']],
    ['ship', ['ship', 'shipping', 'deliver', 'delivery', 'ship to canada', 'which provinces', 'my province', 'which states', 'usa', 'cold pack']],
    ['cancel', ['cancel', 'stop membership', 'quit', 'pause']],
    ['refund', ['refund', 'money back', 'charged', 'charge back', 'billing']],
    ['who', ['clinician', 'doctor', 'nurse', 'who reviews', 'licensed', 'licence', 'license']],
    ['pharmacy', ['pharmacy', 'who makes', 'made', 'prepared', 'manufactur']],
    ['labs', ['blood work', 'bloodwork', 'blood test', 'labs', 'lab work', 'lab test', 'requisition']],
    ['next', ['after the assessment', 'after i apply', 'what happens next', 'how long until', 'when will', 'hear back', 'wait time']],
    ['visit', ['in person', 'office', 'clinic visit', 'appointment', 'video', 'telehealth', 'virtual', 'online']],
    ['followup', ['follow up', 'follow-up', 'check in', 'ongoing', 'support', 'questions later']],
    ['privacy', ['private', 'privacy', 'my data', 'information safe', 'confidential', 'hipaa', 'phipa', 'share my']],
    ['damaged', ['damaged', 'broken', 'warm', 'leak', 'melted', 'arrived', 'seal broken', 'wrong item', 'missing']],
    ['store', ['store it', 'storage', 'fridge', 'refrigerat', 'freeze', 'room temperature', 'travel with']],
    ['insurance', ['insurance', 'hsa', 'fsa', 'benefits', 'covered', 'receipt for']],
    ['legal', ['is it legal', 'legal in', 'legal', 'allowed', 'regulated', 'the law', 'health canada', 'is this legit']],
    ['about', ['who are you', 'who owns', 'about you', 'company', 'real company', 'based', 'located', 'where are you']],
    ['family', ['partner', 'husband', 'wife', 'family', 'spouse', 'friend', 'both of us']],
    ['age', ['age limit', 'too old', 'senior', 'retired', 'over 70', 'over 80']],
    ['fitness', ["don't work out", 'dont work out', 'not active', 'no routine', 'never exercise', 'not a gym', 'out of shape']]
  ];
  var LIST = ['what peptides', 'which peptides do you', 'list of', 'catalog', 'catalogue', 'menu', 'products', 'what do you have', 'what do you carry', 'browse'];

  /* ---------- the last line of defence: banned claim stems in anything we say ---------- */
  var BANNED = /(\bdos(e|age|ing)\b|\bcycle length\b|\bburns?\b|\bboosts?\b|\bheals?\b|\bcures?\b|\bpromotes?\b|\benhances?\b|\breverses?\b|\banti-?aging\b|\bfat loss\b|\bmuscle growth\b|\bresearch purposes only\b|\bguarantee|\bproven to\b|\bclinically proven\b|\bmiracle\b|\b\d+ ?(mcg|iu) (daily|a day|weekly)\b)/i;
  function emitCheck(text) { return BANNED.test(text) ? null : text; }

  function findProducts(n, s) {
    var hits = [];
    (INV ? INV.products : []).forEach(function (p) {
      var names = [p.name].concat(p.aka || []);
      if (names.some(function (a) { var x = norm(a).trim(); if (x.length < 2) return false; return n.indexOf(' ' + x + ' ') >= 0 || s.indexOf(' ' + x + ' ') >= 0 || (x.length > 4 && (n.indexOf(x) >= 0 || s.indexOf(x) >= 0)); })) hits.push(p);
    });
    return hits;
  }
  function faqOf(n) {
    var best = null, score = 0;
    // whole words only: 'fee' must not match inside 'feel'
    FAQK.forEach(function (f) { var sc = 0; f[1].forEach(function (k) { var i = n.indexOf(k); while (i >= 0) { if (!/[a-z0-9]/.test(n.charAt(i - 1)) && !/[a-z0-9]/.test(n.charAt(i + k.length))) { sc += k.length; break; } i = n.indexOf(k, i + 1); } }); if (sc > score) { score = sc; best = f[0]; } });
    return best;
  }

  /* The lawyer switch. names:false = no product names or product cards in any reply (Canada C.01.044 and
     Health Canada's unauthorized-peptide advisories) until counsel clears the catalogue. Default: hidden. */
  var CFG = { names: false };
  function configure(o) { if (o && typeof o.names === 'boolean') CFG.names = o.names; return { names: CFG.names }; }

  /* respond(text) \u2192 { kind, lines: [string], products: [record], follow: [chip ids] } */
  function respond(text) {
    var n = norm(text), s = squash(n), both = n + '|' + s;
    var out = function (kind, lines, extra) {
      var safe = lines.map(emitCheck);
      if (safe.some(function (x) { return x === null; })) return { kind: 'blocked', lines: [LIB.handoff], products: [], follow: ['quiz', 'human'] };
      return Object.assign({ kind: kind, lines: lines, products: [], follow: ['quiz', 'browse', 'human'] }, extra || {});
    };
    if (!n.trim()) return out('empty', []);
    if (EMERG.test(both)) return out('emergency', [LIB.emergency, LIB.emergency2], { follow: ['human'] });
    if (INJECT.test(both)) return out('injection', [LIB.injection], { follow: ['browse', 'how', 'human'] });
    if (MINOR.test(both)) return out('minor', [LIB.minor], { follow: ['human'] });
    var prods = findProducts(n, s), med = MED.test(both);
    if (!CFG.names) prods = prods.length ? ['hidden'] : prods;
    if (!prods.length && /how (does|do) (it|this|pepticity|the service|the process|a consult|the consult|you|this service) work/.test(n)) return out('faq:how', [LIB.faq.how], { faq: 'how' });
    if (OUTCOME.test(both)) return out('outcome', [LIB.outcome], { follow: ['quiz', 'book', 'human'] });
    if (SAME.test(both)) return out('faq:compound', [LIB.faq.compound], { faq: 'compound', follow: ['quiz', 'how', 'human'] });
    if (med) {
      if (prods.length && !CFG.names) return out('product-medical', [LIB.handoff], { follow: ['quiz', 'book', 'human'] });
      if (prods.length) return out('product-medical', [LIB.handoff], { products: prods.slice(0, 4), follow: ['quiz', 'human'] });
      return out('medical', [LIB.handoff], { follow: ['quiz', 'human', 'browse'] });
    }
    if (prods.length && !CFG.names) return out('product-hidden', [LIB.namesLater], { follow: ['quiz', 'book', 'human'] });
    if (prods.length === 1) {
      var p = prods[0], lines = [p.what, p.status, LIB.handoffProduct];
      return out('product', lines, { products: [p], follow: ['quiz', 'buy', 'browse', 'human'] });
    }
    if (prods.length > 1) return out('many', [LIB.many], { products: prods.slice(0, 6), follow: ['quiz', 'human'] });
    if (UNLISTED.test(both)) return out('unlisted', [LIB.notListed], { follow: ['quiz', 'browse', 'human'] });
    if (LIST.some(function (k) { return n.indexOf(k) >= 0; })) return CFG.names ? out('browse', [LIB.browse], { follow: ['quiz', 'research', 'human'] }) : out('browse-hidden', [LIB.browseHidden], { follow: ['quiz', 'how', 'human'] });
    var f = faqOf(n);
    if (f) return out('faq:' + f, [LIB.faq[f]], { faq: f });
    if (HUMAN.test(n)) return out('human', [LIB.human], { follow: ['quiz', 'how'] });
    if (GREET.test(n)) return out('greet', [LIB.greet], { follow: ['browse', 'how', 'cost', 'human'] });
    if (THANKS.test(n)) return out('thanks', [LIB.thanks], { follow: ['quiz', 'browse', 'human'] });
    return out('fallback', [LIB.fallback], { follow: ['human', 'browse', 'how', 'cost'] });
  }

  // check the library itself once at load: a banned stem in a reviewed line is a release blocker
  var libBad = [];
  (function walk(o, path) { Object.keys(o).forEach(function (k) { var v = o[k]; if (typeof v === 'string') { if (!emitCheck(v)) libBad.push(path + k); } else walk(v, path + k + '.'); }); })(LIB, '');
  (INV ? INV.products : []).forEach(function (p) { [p.what, p.status].forEach(function (t) { if (!emitCheck(t)) libBad.push('product.' + p.k); }); });

  return { respond: respond, configure: configure, norm: norm, squash: squash, LIB: LIB, emitCheck: emitCheck, libBad: libBad, INV: INV };
});
