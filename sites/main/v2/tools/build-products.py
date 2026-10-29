#!/usr/bin/env python3
"""Build v2/data/products.json: EVERY listing on northernpeptides.st with its exact live price.

Source of names, prices, stock and the supplier's own categories:
  tools/northernpeptides-store-2026-10-29.json  (WooCommerce Store API, /wp-json/wc/store/v1/products, pulled 29 Oct 2026)
The NOTE and READ MORE copy below is PEPTICITY's own rewrite: what the compound IS, how it is classified,
research status and evidence quality, and format. No uses, no outcomes, no dosing. Nothing is copied from the supplier.
Grace removes a product by deleting its object from products.json (or setting "hidden": true).

Run: python3 sites/main/v2/tools/build-products.py
"""
import html, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = json.load(open(os.path.join(HERE, 'northernpeptides-store-2026-10-29.json')))

FMT = 'Supplied as a freeze-dried (lyophilised) powder in a sealed glass vial. [Storage wording to be confirmed with Grace\'s supplier.]'
NA = 'Not authorised as a medicine by Health Canada or the FDA.'
HC = 'Named in Health Canada\'s 2026 public advisory on peptides bought online.'

# key -> (display name, note, what, classification, research status + evidence)
C = {
 'tirzepatide': ('TIRZEPATIDE', 'GLP-1/GIP dual receptor agonist class peptide',
   'A synthetic 39-amino-acid peptide that binds two incretin hormone receptors, GLP-1 and GIP.',
   'The active ingredient of prescription medicines authorised in Canada and the US under brand names. A product sold outside those authorisations is not the authorised medicine.',
   'Large randomised human trials exist, but that evidence belongs to the authorised medicines, not to other versions.'),
 'retatrutide': ('RETATRUTIDE', 'GLP-1/GIP/glucagon triple agonist class peptide (investigational)',
   'A synthetic peptide designed to bind three hormone receptors: GLP-1, GIP and glucagon.',
   'Investigational. It is not authorised as a medicine anywhere. ' + HC,
   'Still in clinical trials. Published human data are from trials that are not finished; evidence is incomplete.'),
 'tesamorelin': ('TESAMORELIN', 'GHRH analogue class peptide',
   'A synthetic analogue of growth-hormone-releasing hormone (GHRH).',
   'The active ingredient of a prescription medicine authorised in the US for one specific diagnosis. Other versions are not that medicine.',
   'Human trials exist for the authorised medicine and its single indication only.'),
 'aod9604': ('AOD-9604', 'Modified growth hormone fragment (176-191)',
   'A lab-made peptide based on the 176-191 end section of human growth hormone, with one added amino acid.',
   NA,
   'A small number of early human studies; no authorisation followed. Evidence is limited.'),
 '5amino1mq': ('5-AMINO-1MQ', 'Small-molecule NNMT inhibitor (not a peptide)',
   'A small synthetic molecule (a methylquinolinium compound) that inhibits the enzyme NNMT. It is not a peptide.',
   NA,
   'Cell and animal studies only. No published human trials.'),
 'klow': ('KLOW BLEND', 'Multi-peptide blend',
   'A blend of several peptides in one vial. [Exact contents to be confirmed with Grace: her store page does not list them.]',
   NA,
   'Blends have no dedicated human trials. Evidence for each part is mostly preclinical.'),
 'bpc157': ('BPC-157', 'Synthetic 15-amino-acid peptide (gastric protein fragment)',
   'A lab-made peptide of 15 amino acids, based on a fragment of a protein found in gastric juice.',
   NA + ' ' + HC,
   'Mostly animal and cell studies. Very few human data have been published.'),
 'tb500': ('TB-500', 'Synthetic thymosin beta-4 fragment',
   'A lab-made peptide based on the active region of thymosin beta-4, a protein the body makes.',
   NA + ' ' + HC,
   'Animal and cell studies. No published controlled human trials of TB-500 itself.'),
 'wolverine': ('WOLVERINE BLEND', 'Peptide blend: BPC-157 + TB-500',
   'A blend of two lab-made peptides, BPC-157 and TB-500, in one vial.',
   NA + ' Both parts are named in Health Canada\'s 2026 advisory.',
   'No human trials of the blend. Evidence for each part is mostly preclinical.'),
 'glow': ('GLOW BLEND', 'Peptide blend: BPC-157 + TB-500 + GHK-Cu',
   'A blend of three peptides, BPC-157, TB-500 and the copper peptide GHK-Cu, in one vial.',
   NA,
   'No human trials of the blend. Evidence for each part is mostly preclinical.'),
 'kpv': ('KPV', 'Tripeptide (Lys-Pro-Val), alpha-MSH fragment',
   'A three-amino-acid peptide (lysine, proline, valine) taken from the end of the hormone alpha-MSH.',
   NA + ' ' + HC,
   'Cell and animal studies only.'),
 'thymosina1': ('THYMOSIN ALPHA-1', 'Thymic peptide (thymalfasin)',
   'A 28-amino-acid peptide first isolated from the thymus, also called thymalfasin.',
   'Authorised as a medicine in some countries outside North America. Not authorised in the US. [Canadian status to be confirmed.]',
   'Human trials exist for the indications approved abroad. Evidence quality varies by indication.'),
 'hgh': ('HGH', 'Recombinant human growth hormone (somatropin)',
   'Human growth hormone made by recombinant DNA technology, also called somatropin. A 191-amino-acid protein.',
   'A prescription-only medicine for specific diagnosed conditions, tightly controlled in Canada and the US.',
   'Extensive human evidence for its authorised medical uses only.'),
 'cjc_dac': ('CJC-1295 WITH DAC', 'GHRH analogue class peptide (with DAC)',
   'A lab-made analogue of growth-hormone-releasing hormone. "DAC" (drug affinity complex) is an add-on that makes it last longer in the body.',
   NA + ' ' + HC,
   'A few small early human studies; development did not continue. Evidence is limited.'),
 'cjc_nodac': ('CJC-1295 NO DAC', 'GHRH analogue class peptide (modified GRF 1-29)',
   'A lab-made analogue of the first 29 amino acids of growth-hormone-releasing hormone, without the DAC add-on.',
   NA + ' ' + HC,
   'Limited early human data. Evidence is limited.'),
 'ipamorelin': ('IPAMORELIN', 'Growth-hormone secretagogue class peptide',
   'A lab-made five-amino-acid peptide that binds the ghrelin receptor.',
   NA + ' ' + HC,
   'Early human studies only; it was not authorised. Evidence is limited.'),
 'igf1lr3': ('IGF-1 LR3', 'Long-acting IGF-1 analogue',
   'A lab-made, longer-lasting version of insulin-like growth factor 1, with an extended chain and one changed amino acid.',
   NA,
   'Used mainly in cell-culture laboratories. No human trials.'),
 'epitalon': ('EPITALON', 'Synthetic tetrapeptide (Ala-Glu-Asp-Gly)',
   'A lab-made peptide of four amino acids: alanine, glutamic acid, aspartic acid and glycine.',
   NA + ' ' + HC,
   'Mostly animal studies and small human studies from one research group. Evidence is limited.'),
 'motsc': ('MOTS-C', 'Mitochondrial-derived peptide (16 amino acids)',
   'A 16-amino-acid peptide encoded in mitochondrial DNA, the small genome inside the cell\'s mitochondria.',
   NA + ' ' + HC,
   'Mostly cell and animal studies; human research is at an early stage.'),
 'ss31': ('SS-31', 'Mitochondria-targeted tetrapeptide (elamipretide)',
   'A lab-made four-amino-acid peptide, also called elamipretide, that concentrates in mitochondria.',
   '[Regulatory status to be confirmed before launch.] ' + HC,
   'Has been through human clinical trials for specific conditions, with mixed results.'),
 'nad': ('NAD+', 'Coenzyme (nicotinamide adenine dinucleotide), not a peptide',
   'Nicotinamide adenine dinucleotide, a coenzyme found in every living cell. It is not a peptide.',
   NA + ' ' + HC,
   'Human research on NAD+ itself is early and mostly small. Evidence is limited.'),
 'glutathione': ('GLUTATHIONE', 'Tripeptide (glutamate-cysteine-glycine)',
   'A three-amino-acid peptide (glutamate, cysteine, glycine) that the body makes naturally.',
   'An injectable form is not authorised as a medicine in Canada or the US.',
   'Human studies are small and mixed. Evidence is limited.'),
 'semax': ('SEMAX', 'Synthetic ACTH(4-10) analogue peptide',
   'A lab-made seven-amino-acid peptide based on a fragment of the hormone ACTH.',
   'Registered as a medicine in Russia. Not authorised in Canada or the US.',
   'Human studies are mostly from Russia; few independent trials elsewhere.'),
 'selank': ('SELANK', 'Synthetic tuftsin analogue peptide',
   'A lab-made seven-amino-acid peptide based on tuftsin, a short peptide the body makes.',
   'Registered as a medicine in Russia. Not authorised in Canada or the US.',
   'Human studies are mostly from Russia; few independent trials elsewhere.'),
 'oxytocin': ('OXYTOCIN', 'Nonapeptide hormone',
   'A nine-amino-acid hormone the body makes. It is also a prescription medicine used in hospitals.',
   'A prescription-only medicine in Canada and the US.',
   'Extensive human evidence for its authorised hospital uses only.'),
 'ghkcu': ('GHK-CU', 'Copper peptide complex (Gly-His-Lys:Cu)',
   'A three-amino-acid peptide (glycine, histidine, lysine) bound to copper.',
   'Widely used in cosmetic skin products. An injectable form is not authorised as a medicine. ' + HC,
   'Cosmetic and laboratory studies exist; injectable human data are lacking.'),
 'pt141': ('PT-141', 'Melanocortin receptor agonist class peptide (bremelanotide)',
   'A lab-made seven-amino-acid peptide, also called bremelanotide.',
   'The active ingredient of a prescription medicine authorised in the US. Other versions are not that medicine.',
   'Human trials exist for the authorised medicine only.'),
 'melanotan2': ('MELANOTAN II', 'Synthetic melanocortin analogue peptide',
   'A lab-made analogue of alpha-MSH, a hormone involved in skin pigment.',
   'Not authorised as a medicine. Health regulators have warned the public about it. ' + HC + ' [Counsel: recommend delisting.]',
   'Small early studies only; safety concerns have been reported. Evidence is limited.'),
 'bacwater': ('BACTERIOSTATIC WATER', 'Sterile water with benzyl alcohol (ancillary)',
   'Sterile water containing 0.9% benzyl alcohol as a preservative.',
   '[Counsel: regulators treat diluent sold beside peptides as evidence of intended use. Hold or delist before launch.]',
   'Not applicable.'),
}

# supplier id -> (key, strength)
MAP = {
 10256: ('klow', '80 MG'), 10216: ('bacwater', '30 ML'), 10165: ('retatrutide', '10 MG'), 10139: ('thymosina1', '10 MG'),
 10135: ('tb500', '10 MG'), 10010: ('bpc157', '10 MG'), 10013: ('epitalon', '10 MG'), 10009: ('5amino1mq', '10 MG'),
 10006: ('tirzepatide', '30 MG'), 10004: ('glutathione', '1500 MG'), 10002: ('retatrutide', '20 MG'), 9958: ('hgh', '100 IU'),
 9954: ('epitalon', '50 MG'), 9949: ('motsc', '40 MG'), 9945: ('motsc', '10 MG'), 9920: ('ghkcu', '100 MG'), 9919: ('ghkcu', '50 MG'),
 9917: ('ipamorelin', '10 MG'), 9914: ('cjc_nodac', '10 MG'), 9912: ('cjc_dac', '5 MG'), 9903: ('wolverine', '20 MG'),
 9870: ('wolverine', '10 MG'), 9868: ('ss31', '10 MG'), 9866: ('semax', '10 MG'), 9864: ('selank', '10 MG'), 9862: ('tesamorelin', '10 MG'),
 9856: ('oxytocin', '2 MG'), 9854: ('pt141', '10 MG'), 9848: ('nad', '1000 MG'), 9841: ('kpv', '10 MG'), 9837: ('glow', '70 MG'),
 9833: ('igf1lr3', '[SIZE TBC]'), 9821: ('aod9604', '5 MG'), 57: ('tirzepatide', '15 MG'), 54: ('melanotan2', '10 MG'), 39: ('retatrutide', '15 MG'),
}
# demo stock states for the client preview only (the live store shows every listing in stock on 29 Oct)
DEMO_SOLD_OUT = {9954, 9903, 9833}

out = []
for p in SRC:
    key, strength = MAP[p['id']]
    name, note, what, cls, ev = C[key]
    pr = p['prices']
    price = int(pr['price']) / 10 ** pr['currency_minor_unit']
    cats = [html.unescape(c['name']) for c in p['categories'] if c['name'] != 'Peptides']
    out.append({
        'id': p['id'], 'slug': p['slug'], 'key': key, 'name': name, 'strength': strength,
        'price': price, 'currency': pr['currency_code'],
        'supplierName': html.unescape(p['name']), 'supplierCategories': cats,
        'inStock': bool(p['is_in_stock']) and p['id'] not in DEMO_SOLD_OUT,
        'demoStock': p['id'] in DEMO_SOLD_OUT,
        'ancillary': key == 'bacwater',
        'note': note,
        'more': [['WHAT IT IS', what], ['HOW IT IS CLASSIFIED', cls], ['RESEARCH STATUS', ev],
                 ['FORMAT', FMT if key != 'bacwater' else '30 ml multi-use glass vial. [Storage wording to be confirmed.]']],
        'hidden': False,
    })
# shop order: peptides by name, then the ancillary lane last
out.sort(key=lambda r: (r['ancillary'], r['name'], float(''.join(ch for ch in r['strength'] if ch.isdigit()) or 0)))
meta = {'source': 'https://northernpeptides.st (WooCommerce Store API)', 'pulled': '2026-10-29', 'listings': len(out),
        'currency': 'CAD', 'note': 'Prices are the live northernpeptides.st prices on the pull date. Notes and READ MORE are PEPTICITY copy (identity and status only). demoStock marks preview-only sold-out states.'}
json.dump({'meta': meta, 'products': out}, open(os.path.join(HERE, '..', 'data', 'products.json'), 'w'), indent=1, ensure_ascii=False)
print(len(out), 'products;', sum(r['price'] for r in out), 'CAD total list')
