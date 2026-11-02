/* PEPTICITY BOT GALLERY · shared brain (GBrain) + lead capture (GCapture).
   - Flow: 4 plain questions (goal, age range, what they want more of, where they are starting from).
   - Result: CLASS level only (peptide families to read about, vitamins and minerals, foods). Never doses, never claims,
     no product names, no prices. Always: a licensed clinician decides.
   - Free text goes through the trained guard (pep-brain.js: emergency, rule-changing, under-18, medical, outcome) first.
   - Every outgoing string is checked by PEPBRAIN.emitCheck (banned claim stems). Test: node tools/gallery-brain-test.js */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api; else root.GBrain = api;
})(typeof window !== 'undefined' ? window : globalThis, function (W) {
  'use strict';
  var BRAIN = W.PEPBRAIN || (typeof require === 'function' ? require('./pep-brain.js') : null);
  /* The compliance switch (like pep-brain's names switch): ?safe=1 on any page, or GBrain.configure({safe:true}).
     SAFE = no peptide families, no goal-to-vitamin pairings, no clinician / assessment wording (the repo's standing "no clinician exists today" rule). Default = the owner's brief. */
  var SAFE = !!(W.location && /[?&]safe=1/.test(W.location.search || ''));
  var CLIN_D = 'A licensed clinician decides what, if anything, is right for you.', CLIN_S = 'This is general reading, not advice for you.';
  var NOT_D = "I'm the PEPTICITY GUIDE, an automated guide. I'm not a clinician, and this isn't medical advice.", NOT_S = "I'm the PEPTICITY GUIDE, an automated guide. I'm not a health professional, and this isn't medical advice.";
  var CLINICIAN = SAFE ? CLIN_S : CLIN_D, NOTDOC = SAFE ? NOT_S : NOT_D;
  var INTRO = NOTDOC + ' Four quick questions, then a reading list.';

  /* ---------- questions ---------- */
  var STEPS = [
    { id: 'goal', q: 'What would you like to learn about first?', hint: 'Pick the closest one. You can change it.',
      opts: [
        { id: 'energy', label: 'Everyday energy', sub: 'Feeling flat by mid-afternoon' },
        { id: 'weight', label: 'Weight and appetite', sub: 'Habits, food and routine' },
        { id: 'recovery', label: 'Gym and recovery', sub: 'Training, soreness, getting back to it' },
        { id: 'sleep', label: 'Sleep and calm', sub: 'Winding down, resting well' },
        { id: 'skin', label: 'Skin and hair', sub: 'The look of your skin and hair' },
        { id: 'longevity', label: 'Healthy ageing', sub: 'Staying active for the long run' },
        { id: 'focus', label: 'Focus and clear thinking', sub: 'Work, study, mental sharpness' }
      ] },
    { id: 'age', q: 'Which age range are you in?', hint: 'Adults only: 18+ (19+ in BC, NB, NL, NS and the territories). It only tunes the reading list.',
      opts: [
        { id: '18-29', label: '18 to 29' }, { id: '30-44', label: '30 to 44' },
        { id: '45-59', label: '45 to 59' }, { id: '60+', label: '60 and over' }
      ] },
    { id: 'more', q: 'What would you like more of?', hint: 'One pick. Think of a normal week.',
      opts: [
        { id: 'steady', label: 'Steady energy' }, { id: 'move', label: 'Strength and movement' },
        { id: 'calm', label: 'Calm and rest' }, { id: 'clear', label: 'Clear thinking' },
        { id: 'basics', label: 'Everyday nutrition basics' }
      ] },
    { id: 'start', q: 'Where are you starting from?', hint: 'So the next step fits you.',
      opts: [
        { id: 'curious', label: 'Just curious' }, { id: 'read', label: "I've read a lot already" },
        { id: 'clin', label: SAFE ? 'I already have my own plan' : 'Talking to a clinician soon' }, { id: 'unsure', label: 'Not sure yet' }
      ] }
  ];

  /* ---------- class-level knowledge (no products, no doses, no claims) ---------- */
  var FAM = {
    mito:   { name: 'Mitochondrial peptides', plain: 'Short chains linked to the cell’s energy-making parts (mitochondria). Mostly early-stage science.' },
    cell:   { name: 'Cell-energy helper molecules', plain: 'Not a peptide: a helper molecule your cells already use. Often read about next to the peptide topics.' },
    incret: { name: 'Gut-hormone (incretin) medicines', plain: 'Prescription medicines that copy gut hormones about fullness. Only a clinician can prescribe them.' },
    gh:     { name: 'Growth-hormone-axis peptides', plain: 'Short chains that act on the brain’s growth-hormone signal. Regulated; clinician-led only.' },
    repair: { name: 'Repair-type peptides (gastric and thymic fragments)', plain: 'Lab-made pieces of a stomach protein or a thymus peptide. Much of the research is in animals.' },
    neuro:  { name: 'Neuro peptides', plain: 'Short chains aimed at the brain, registered in some countries and not in Canada or the US.' },
    bio:    { name: 'Bioregulator peptides', plain: 'Very short chains from one research school. Limited human evidence.' },
    copper: { name: 'Copper peptides', plain: 'A tiny peptide that carries a copper ion. Long used in skin-care products.' },
    thymic: { name: 'Thymic (immune) peptides', plain: 'Copies of peptides made by the thymus gland, part of the immune system.' },
    collagen:{ name: 'Collagen peptides (food-type)', plain: 'Broken-down collagen sold as a food powder. Different from medicine-type peptides.' }
  };
  var NUT = {
    b:   { name: 'B vitamins (B12, folate)', plain: 'Water-soluble vitamins your body uses to turn food into energy.' },
    d:   { name: 'Vitamin D', plain: 'The "sunshine" vitamin. A blood test is the way to know your own level.' },
    mg:  { name: 'Magnesium', plain: 'A mineral found in nuts, seeds and greens. Ask before adding a supplement.' },
    fe:  { name: 'Iron', plain: 'A mineral you only supplement on a clinician’s advice, since too much is a problem too.' },
    c:   { name: 'Vitamin C', plain: 'Found in citrus, berries and peppers. Also used by the body to make collagen.' },
    zn:  { name: 'Zinc', plain: 'A mineral in seeds, legumes and shellfish.' },
    k2:  { name: 'Vitamin K2', plain: 'Found in fermented foods and some cheeses.' },
    o3:  { name: 'Omega-3 fats', plain: 'Fats in oily fish, walnuts and flax.' },
    prot:{ name: 'Protein and fibre basics', plain: 'Two basic food groups: protein and fibre.' },
    e:   { name: 'Vitamin E', plain: 'Found in nuts, seeds and plant oils.' }
  };
  var GOALS = {
    energy:    { label: 'Everyday energy', fam: ['mito', 'cell'], nut: ['b', 'mg', 'fe', 'd'], foods: ['Leafy greens', 'Eggs', 'Legumes', 'Whole grains', 'Oily fish'],
                 pair: ['mito', 'b', 'Both come up in conversations about how cells make energy.'] },
    weight:    { label: 'Weight and appetite', fam: ['incret'], nut: ['prot', 'd', 'b'], foods: ['Protein-rich foods', 'High-fibre vegetables', 'Legumes', 'Berries', 'Plenty of water'],
                 pair: ['incret', 'prot', 'Clinicians usually start these talks with food, protein and fibre habits.'] },
    recovery:  { label: 'Gym and recovery', fam: ['repair', 'gh'], nut: ['c', 'zn', 'mg', 'd'], foods: ['Lean protein', 'Citrus and berries', 'Oily fish', 'Tart cherries', 'Eggs'],
                 pair: ['repair', 'c', 'Vitamin C and zinc are the nutrients most often raised next to tissue-repair topics.'] },
    sleep:     { label: 'Sleep and calm', fam: ['neuro', 'bio'], nut: ['mg', 'b', 'd'], foods: ['Oats', 'Kiwi', 'Nuts and seeds', 'Tart cherries', 'Warm milk or a milk alternative'],
                 pair: ['neuro', 'mg', 'Magnesium is the mineral most often raised in evening-routine conversations.'] },
    skin:      { label: 'Skin and hair', fam: ['copper', 'collagen'], nut: ['c', 'zn', 'e'], foods: ['Citrus and berries', 'Nuts and seeds', 'Oily fish', 'Bone broth', 'Colourful vegetables'],
                 pair: ['copper', 'c', 'Copper peptides and vitamin C both come up in skin-care reading.'] },
    longevity: { label: 'Healthy ageing', fam: ['mito', 'thymic', 'bio'], nut: ['d', 'k2', 'b', 'mg', 'o3'], foods: ['Oily fish', 'Olive oil', 'Leafy greens', 'Nuts', 'Legumes'],
                 pair: ['mito', 'd', 'Healthy-ageing reading usually pairs cell-energy topics with a vitamin D blood test.'] },
    focus:     { label: 'Focus and clear thinking', fam: ['neuro'], nut: ['b', 'o3', 'd'], foods: ['Oily fish', 'Berries', 'Eggs', 'Nuts', 'Dark leafy greens'],
                 pair: ['neuro', 'o3', 'Omega-3 fats are the food topic most often read next to brain-focused peptides.'] }
  };
  var AGE_NOTE = {
    '18-29': 'Foundations first: sleep, food and movement habits come before anything else.',
    '30-44': 'Busy years: a simple yearly blood test gives a clinician real numbers to work from.',
    '45-59': 'A clinician will usually want blood work before talking about anything beyond food and habits.',
    '60+': 'Medicines and health conditions matter most at this stage, so bring your full list to any appointment.'
  };
  var MORE_NOTE = {
    steady: 'You asked for steadier energy: meal timing and sleep are the first habits worth looking at.',
    move: 'You asked for strength and movement: protein, rest days and a plan you can keep.',
    calm: 'You asked for calm and rest: a regular wind-down and evening light habits.',
    clear: 'You asked for clearer thinking: sleep and regular meals come first.',
    basics: 'You asked for the basics: a plate that is half vegetables, with protein, covers most of it.'
  };
  var NEXT = {
    curious: { head: 'Take your time', body: 'Your reading list is ready. A free assessment is there when you want it.' },
    read: { head: 'You have done the reading', body: 'The free assessment turns what you know into questions for a clinician.' },
    clin: { head: 'Bring this to your appointment', body: 'Your list works as a set of questions to take with you.' },
    unsure: { head: 'Start small', body: 'Read the list, then take the free 2-minute assessment if you want a clinician to look.' }
  };

  var SAFE_FOODS = ['Vegetables and fruit', 'Whole grains', 'Protein foods', 'Water'];
  var SAFE_AGE = { '18-29': AGE_NOTE['18-29'], '30-44': 'Busy years: a simple yearly check-up gives you real numbers to work from.', '45-59': 'Food and habits are the place to start. Take any health questions to your own appointments.', '60+': 'Bring your full medicines list to your own appointments.' };
  var SAFE_NEXT = { curious: { head: 'Take your time', body: 'Your reading list is ready. Join the founding list if you want to hear when PEPTICITY opens.' }, read: { head: 'You have done the reading', body: 'Join the founding list to hear what PEPTICITY opens next.' }, clin: { head: 'Bring this to your appointment', body: 'Your list works as a set of questions to take to your own appointments.' }, unsure: { head: 'Start small', body: 'Read the list at your own pace. The founding list is there for updates.' } };
  var SAFE_HAND = "That's a question for your own health professional. I can't give advice about a person's health, and I won't guess.";


  /* ---------- flow ---------- */
  function createFlow() {
    var f = { steps: STEPS, idx: 0, answers: {}, finished: false, log: [] };
    f.current = function () { return f.finished ? null : STEPS[f.idx]; };
    f.total = STEPS.length;
    f.answer = function (optId) {
      var s = STEPS[f.idx]; if (!s) return null;
      var o = s.opts.filter(function (x) { return x.id === optId; })[0]; if (!o) return null;
      f.answers[s.id] = o.id; f.log.push({ step: s.id, q: s.q, a: o.label });
      f.idx++; if (f.idx >= STEPS.length) f.finished = true;
      return o;
    };
    f.back = function () { if (f.idx > 0) { f.finished = false; f.idx--; var s = STEPS[f.idx]; delete f.answers[s.id]; f.log.pop(); } };
    f.result = function () { return result(f.answers); };
    f.reset = function () { f.idx = 0; f.answers = {}; f.finished = false; f.log = []; };
    return f;
  }

  function result(a) {
    var g = GOALS[a.goal] || GOALS.energy;
    if (SAFE) return { goal: a.goal, goalLabel: g.label, answers: a, families: [], nutrients: [], foods: SAFE_FOODS, foodsTitle: "Canada's Food Guide basics", pair: null,
      notes: [SAFE_AGE[a.age] || SAFE_AGE['30-44'], MORE_NOTE[a.more] || MORE_NOTE.basics], next: SAFE_NEXT[a.start] || SAFE_NEXT.unsure, clinician: CLIN_S, disclaimer: NOT_S, safe: true };
    var fams = g.fam.map(function (k) { return FAM[k]; });
    var nuts = g.nut.map(function (k) { return NUT[k]; });
    var pr = g.pair;
    return {
      goal: a.goal, goalLabel: g.label, answers: a,
      families: fams, nutrients: nuts, foods: g.foods,
      pair: { family: FAM[pr[0]].name, nutrient: NUT[pr[1]].name, why: pr[2] },
      notes: [AGE_NOTE[a.age] || AGE_NOTE['30-44'], MORE_NOTE[a.more] || MORE_NOTE.basics],
      next: NEXT[a.start] || NEXT.unsure,
      clinician: CLINICIAN, disclaimer: NOTDOC
    };
  }

  /* ---------- free text: guard first, then topic cards ---------- */
  var TOPICS = [
    { id: 'peptide-families', k: ['families', 'types of peptide', 'kinds of peptide', 'classes', 'what peptides are there', 'peptide groups'],
      lines: ['Peptides sort into families by what they act on. The main ones people read about: gut-hormone (incretin) medicines, growth-hormone-axis peptides, repair-type peptides, copper peptides, mitochondrial peptides, thymic peptides, bioregulators and neuro peptides.', CLINICIAN] },
    { id: 'vitamins', k: ['vitamin', 'mineral', 'supplement', 'magnesium', 'zinc', 'iron', 'b12', 'vitamin d', 'omega'],
      lines: ['Vitamins and minerals are best checked with a blood test before adding any. Common ones to ask a clinician or dietitian about: vitamin D, B12, magnesium, iron and omega-3 fats.', CLINICIAN] },
    { id: 'foods', k: ['food', 'eat', 'diet', 'meal', 'nutrition', 'protein', 'fibre', 'fiber'],
      lines: ['Food first. A plate that is half vegetables, with a protein and a whole grain or legume, is where most clinicians and dietitians start.', 'Tell me your goal and I will list foods worth looking at for it.'] },
    { id: 'pair', k: ['go with', 'goes with', 'pair', 'together', 'combine', 'alongside', 'with a vitamin'],
      lines: ['Some topics are read about together, such as copper peptides with vitamin C, or cell-energy topics with B vitamins. Pick a goal and I will show the pairing for it.', 'How things combine for you personally is a question for a licensed clinician.'] },
    { id: 'blood', k: ['blood test', 'bloodwork', 'blood work', 'lab test', 'ferritin'],
      lines: ['A basic blood panel (vitamin D, B12, iron stores, thyroid, blood sugar) gives a clinician real numbers instead of guesses.', CLINICIAN] },
    { id: 'age', k: ['my age', 'older', 'over 50', 'over 60', 'in my 40', 'in my 50'],
      lines: ['Age changes which questions matter most, not who can ask. There is no upper age limit for a clinician review.', 'Tell me your age range in the question flow and I will tune the reading list.'] }
  ];
  var TOPICS_SAFE = {
    'peptide-families': ['Peptides are short chains of amino acids, and the body makes many of its own. I can\'t match a peptide to a goal. I can share general food and nutrition basics.'],
    vitamins: ['Vitamins and minerals are best checked against Canada\'s Food Guide and your own lab results. Common ones people read about: vitamin D, B12, magnesium, iron and omega-3 fats.', CLIN_S],
    pair: ['I don\'t pair peptides with vitamins or foods. I can share general food and nutrition basics.'],
    blood: ['A basic blood panel (vitamin D, B12, iron stores, thyroid, blood sugar) is the usual set people read about. What your numbers mean is not something I can say.'],
    age: ['Age changes which questions matter most, not who can ask. Tell me your age range in the questions and I will tune the food reading.'],
    foods: ['Food first. A plate that is half vegetables, with a protein and a whole grain or legume, is the Canada\'s Food Guide starting point.', 'Tell me your goal and I will list general food basics.']
  };
  function fixed(res, topic) { return { kind: topic || 'topic', lines: res, chips: SAFE ? ['Start the questions'] : ['Start the questions', 'Talk to a person'], safe: true }; }

  function ask(text) {
    var t = String(text || '').trim();
    if (!t) return { kind: 'empty', lines: [], chips: [], safe: true };
    var r = BRAIN ? BRAIN.respond(t) : { kind: 'fallback', lines: [], follow: [] };
    var ST = SAFE ? ['Start the questions'] : null;
    var hard = ['emergency', 'injection', 'minor', 'outcome', 'medical', 'product-medical', 'unlisted', 'blocked', 'many'];
    if (hard.indexOf(r.kind) >= 0) { var soft = r.kind !== 'emergency' && r.kind !== 'minor' && r.kind !== 'injection'; return { kind: r.kind, lines: SAFE && soft ? [SAFE_HAND, NOTDOC] : r.lines.concat(r.kind === 'emergency' || r.kind === 'minor' ? [] : [NOTDOC]), chips: r.kind === 'emergency' ? [] : (ST || ['Start the questions', 'Talk to a person']), safe: false }; }
    var n = BRAIN ? BRAIN.norm(t) : ' ' + t.toLowerCase() + ' ';
    var gk0 = ['energy', 'weight', 'recovery', 'sleep', 'skin', 'longevity', 'focus'], gw0 = { energy: ['mitochond', 'energy'], weight: ['incretin', 'weight'], recovery: ['gym', 'recover', 'repair'], sleep: ['sleep'], skin: ['copper', 'skin', 'hair'], longevity: ['ageing', 'aging', 'longevity', 'thymic'], focus: ['neuro', 'focus', 'brain'] };
    if (!SAFE && /go with|goes with|pair|together|combine|alongside|with a vitamin|which vitamin/.test(n)) {
      for (var q = 0; q < gk0.length; q++) if (gw0[gk0[q]].some(function (w) { return n.indexOf(w) >= 0; })) {
        var pr0 = result({ goal: gk0[q], age: '30-44', more: 'basics', start: 'unsure' }).pair;
        return { kind: 'pair:' + gk0[q], goal: gk0[q], lines: ['Read together: ' + pr0.family + ' and ' + pr0.nutrient + '. ' + pr0.why, CLINICIAN], chips: ['Start the questions', 'Talk to a person'], safe: true };
      }
    }
    for (var i = 0; i < TOPICS.length; i++) {
      if (TOPICS[i].k.some(function (k) { return n.indexOf(k) >= 0; })) return fixed(SAFE && TOPICS_SAFE[TOPICS[i].id] ? TOPICS_SAFE[TOPICS[i].id] : TOPICS[i].lines, TOPICS[i].id);
    }
    var gk = ['energy', 'weight', 'recovery', 'sleep', 'skin', 'longevity', 'focus'], gw = { energy: ['energy', 'mitochond'], weight: ['weight', 'appetite'], recovery: ['gym', 'recover', 'workout'], sleep: ['sleep'], skin: ['skin', 'hair', 'copper'], longevity: ['ageing', 'aging', 'longevity'], focus: ['focus', 'brain', 'memory'] };
    for (var j = 0; j < gk.length; j++) {
      if (gw[gk[j]].some(function (w) { return n.indexOf(w) >= 0; })) {
        var rs = result({ goal: gk[j], age: '30-44', more: 'basics', start: 'unsure' });
        if (SAFE) return { kind: 'goal:' + gk[j], goal: gk[j], lines: ['For ' + rs.goalLabel.toLowerCase() + ', here are general food and nutrition basics: ' + SAFE_FOODS.join(', ').toLowerCase() + '.', CLINICIAN], chips: ['Start the questions'], safe: true };
        return { kind: 'goal:' + gk[j], goal: gk[j], lines: ['For ' + rs.goalLabel.toLowerCase() + ', people usually read about: ' + rs.families.map(function (x) { return x.name; }).join('; ') + '. Nutrients to ask about: ' + rs.nutrients.slice(0, 3).map(function (x) { return x.name; }).join(', ') + '.', CLINICIAN], chips: ['Start the questions'], safe: true };
      }
    }
    if (r.kind === 'product-hidden') return { kind: r.kind, lines: r.lines.concat([NOTDOC]), chips: ['Start the questions', 'Talk to a person'], safe: false };
    var lines2 = r.lines.slice(); if (SAFE) r.follow = ['quiz']; if (r.kind === 'fallback') lines2 = [SAFE ? 'I can share general food and nutrition basics. Ask me one, or start the questions.' : 'I can explain peptide families, vitamins and minerals, and foods at a general level, and help you build a reading list. Ask me one, or start the questions.'];
    return { kind: r.kind, lines: lines2, chips: SAFE ? ['Start the questions'] : ['Start the questions', 'Talk to a person'], safe: true };
  }

  /* every string the page can show, for the compliance test */
  function allStrings() {
    var out = [CLINICIAN, NOTDOC];
    STEPS.forEach(function (s) { out.push(s.q, s.hint); s.opts.forEach(function (o) { out.push(o.label); if (o.sub) out.push(o.sub); }); });
    Object.keys(FAM).forEach(function (k) { out.push(FAM[k].name, FAM[k].plain); });
    Object.keys(NUT).forEach(function (k) { out.push(NUT[k].name, NUT[k].plain); });
    Object.keys(GOALS).forEach(function (k) { out.push(GOALS[k].label, GOALS[k].pair[2]); GOALS[k].foods.forEach(function (x) { out.push(x); }); });
    Object.keys(AGE_NOTE).forEach(function (k) { out.push(AGE_NOTE[k]); });
    Object.keys(MORE_NOTE).forEach(function (k) { out.push(MORE_NOTE[k]); });
    Object.keys(NEXT).forEach(function (k) { out.push(NEXT[k].head, NEXT[k].body); });
    TOPICS.forEach(function (t) { t.lines.forEach(function (x) { out.push(x); }); });
    [CLIN_D, CLIN_S, NOT_D, NOT_S, SAFE_HAND].concat(SAFE_FOODS).concat(Object.keys(SAFE_AGE).map(function (k) { return SAFE_AGE[k]; })).forEach(function (x) { out.push(x); });
    Object.keys(SAFE_NEXT).forEach(function (k) { out.push(SAFE_NEXT[k].head, SAFE_NEXT[k].body); });
    Object.keys(TOPICS_SAFE).forEach(function (k) { TOPICS_SAFE[k].forEach(function (x) { out.push(x); }); });
    return out;
  }

  function configure(o) { if (o && typeof o.safe === 'boolean') { SAFE = o.safe; CLINICIAN = SAFE ? CLIN_S : CLIN_D; NOTDOC = SAFE ? NOT_S : NOT_D; STEPS[3].opts[2].label = SAFE ? 'I already have my own plan' : 'Talking to a clinician soon'; } return { safe: SAFE }; }
  return { safe: function () { return SAFE; }, intro: function () { return (SAFE ? NOT_S : NOT_D) + ' Four quick questions, then a reading list.'; }, human: function () { return SAFE ? 'No one is on call yet. Join the founding list and we will write to you when PEPTICITY opens.' : 'A real person can help: the PEPTICITY care team will call you back. [Preview: phone number to be added.]'; }, configure: configure, steps: STEPS, createFlow: createFlow, result: result, ask: ask, allStrings: allStrings, CLINICIAN: CLINICIAN, NOTDOC: NOTDOC, FAM: FAM, NUT: NUT, GOALS: GOALS };
});
