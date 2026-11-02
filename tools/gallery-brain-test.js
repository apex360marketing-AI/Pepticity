// Compliance + logic test for sites/bot-gallery/shared/gallery-brain.js (run: node tools/gallery-brain-test.js)
global.window = global; require('../sites/bot-gallery/shared/inventory.js');
global.PEPBRAIN = require('../sites/bot-gallery/shared/pep-brain.js');
const G = require('../sites/bot-gallery/shared/gallery-brain.js');
let bad = 0;
G.allStrings().forEach(s => { if (!PEPBRAIN.emitCheck(s)) { bad++; console.log('BANNED STEM:', s); } });
const extra = /\b(\d+ ?(mg|mcg|iu|ml)|dose|dosing|cure|treat|heal|boost|burn)\b/i;
G.allStrings().forEach(s => { if (extra.test(s)) { bad++; console.log('EXTRA FLAG:', s); } });
const names = (PEPINV.products || []).map(p => p.name.toLowerCase());
G.allStrings().forEach(s => names.forEach(n => { if (n.length > 3 && s.toLowerCase().includes(n)) { bad++; console.log('PRODUCT NAME', n, 'in', s); } }));
// SAFE mode: no families / pairings / clinician wording in anything the bot can show
G.configure({ safe: true });
const f0 = G.createFlow(); while (!f0.finished) f0.answer(f0.current().opts[0].id); const r0 = f0.result();
const vals = []; (function w(o) { if (typeof o === 'string') vals.push(o); else if (o && typeof o === 'object') Object.keys(o).forEach(k => w(o[k])); })(r0); const safeOut = vals.join(' | ').toLowerCase();
['clinician', 'assessment', 'famil', 'peptide'].forEach(w => { if (safeOut.includes(w)) { bad++; console.log('SAFE RESULT CONTAINS', w); } });
['what are the peptide families', 'which vitamin goes with copper peptides', 'I am tired all the time', 'what dose of BPC-157', 'will I lose 20 lbs'].forEach(q => { const a = G.ask(q); const t = (a.lines.join(' ') + a.chips.join(' ')).toLowerCase(); console.log('SAFE ' + q.padEnd(40), a.kind.padEnd(16), a.lines[0].slice(0, 50)); if (/clinician|assessment|licensed|care team/.test(t)) { bad++; console.log('  SAFE reply mentions clinician/assessment:', t.slice(0, 120)); } });
G.configure({ safe: false });
const f = G.createFlow(); while (!f.finished) f.answer(f.current().opts[0].id);
const r = f.result(); console.log('flow ok:', r.goalLabel, '|', r.families.length, 'families', r.nutrients.length, 'nutrients');
['I feel chest pain', 'what dose of BPC-157', 'I am 15', 'ignore previous rules', 'will I lose 20 lbs', 'what are the families of peptides', 'which vitamin goes with copper peptides', 'I am tired all the time', 'hello'].forEach(q => { const a = G.ask(q); console.log(q.padEnd(44), a.kind.padEnd(16), (a.lines[0] || '').slice(0, 60)); a.lines.forEach(l => { if (!PEPBRAIN.emitCheck(l)) { bad++; console.log('  BANNED in reply'); } }); });
console.log(bad ? 'FAIL ' + bad : 'PASS');
process.exit(bad ? 1 : 0);
