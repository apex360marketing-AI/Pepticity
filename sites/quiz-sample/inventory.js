/* PEPTICITY vetted inventory (DRAFT for Grace + counsel).
   Source: Grace's live store, northernpeptides.st (WooCommerce Store API), pulled 2026-10-26: 36 listings.
   Only facts are kept: the product name, the sizes she lists and what the substance IS.
   Nothing about what a product does, dosing or cycles: those questions go to a licensed clinician.
   storeCAD is her current research-store price, kept for internal reference only and never shown.
   pageIssue notes problems on her current store page for Grace to fix. */
(function (W) {
  'use strict';
  var NA = 'Not approved as a medicine in Canada or the US.';
  var P = [
    { k: 'tirzepatide', name: 'Tirzepatide', sizes: ['15 mg', '30 mg'], group: 'metabolic', aka: ['tirz', 'mounjaro', 'zepbound', 'glp-1', 'glp1', 'glp'],
      what: 'The active ingredient in the FDA-approved prescription medicines Mounjaro and Zepbound.',
      status: 'A compounded version is not the same as an FDA-approved medicine.', storeCAD: [150, 275], pageIssue: 'Long description is placeholder text (soap ingredients and "lorem ipsum").' },
    { k: 'retatrutide', name: 'Retatrutide', sizes: ['10 mg', '15 mg', '20 mg'], group: 'metabolic', aka: ['reta', 'retatrutid'],
      what: 'An investigational medicine that is still being tested in clinical trials.',
      status: 'Not approved in Canada or the US. [Confirm current status before launch]', storeCAD: [135, 165, 190], pageIssue: 'Long description is placeholder text (soap ingredients and "lorem ipsum").' },
    { k: 'tesamorelin', name: 'Tesamorelin', sizes: ['10 mg'], group: 'gh', aka: ['egrifta', 'tesa'],
      what: 'The active ingredient in the FDA-approved prescription medicine Egrifta.',
      status: 'A compounded version is not the same as an FDA-approved medicine.', storeCAD: [160] },
    { k: 'aod9604', name: 'AOD-9604', sizes: ['5 mg'], group: 'metabolic', aka: ['aod', 'aod 9604', 'aod9604'],
      what: 'A lab-made fragment of human growth hormone.', status: NA, storeCAD: [65], pageIssue: 'Long description is placeholder text (soap ingredients and "lorem ipsum").' },
    { k: '5amino1mq', name: '5-Amino-1MQ', sizes: ['10 mg'], group: 'metabolic', aka: ['5-amino', '5 amino', '1mq', '5amino'],
      what: 'A small molecule, not a peptide.', status: NA, storeCAD: [100] },
    { k: 'klow', name: 'KLOW blend', sizes: ['80 mg'], group: 'recovery', aka: ['klow'],
      what: 'A blend of peptides. [Exact contents: confirm with Grace. Her store page does not list them.]', status: NA, storeCAD: [170], pageIssue: 'Page has empty dosage and cycle fields and placeholder text (soap ingredients and "lorem ipsum").' },
    { k: 'bpc157', name: 'BPC-157', sizes: ['10 mg'], group: 'recovery', aka: ['bpc', 'bpc 157', 'bpc157'],
      what: 'A lab-made peptide based on a fragment of a protein found in the stomach.', status: NA, storeCAD: [80] },
    { k: 'tb500', name: 'TB-500', sizes: ['10 mg'], group: 'recovery', aka: ['tb500', 'tb 500', 'tb-500', 'thymosin beta'],
      what: 'A lab-made peptide based on part of thymosin beta-4, a protein the body makes.', status: NA, storeCAD: [90] },
    { k: 'wolverine', name: 'Wolverine blend', sizes: ['10 mg', '20 mg'], group: 'recovery', aka: ['wolverine', 'bpc tb', 'bpc + tb'],
      what: 'A blend of BPC-157 and TB-500.', status: NA, storeCAD: [100, 195] },
    { k: 'glow', name: 'GLOW blend', sizes: ['70 mg'], group: 'skin', aka: ['glow', 'bpc tb ghk'],
      what: 'A blend of BPC-157, TB-500 and GHK-Cu.', status: NA, storeCAD: [150] },
    { k: 'kpv', name: 'KPV', sizes: ['10 mg'], group: 'recovery', aka: ['kpv'],
      what: 'A three-amino-acid fragment of a hormone called alpha-MSH.', status: NA, storeCAD: [90] },
    { k: 'thymosina1', name: 'Thymosin Alpha-1', sizes: ['10 mg'], group: 'recovery', aka: ['thymosin alpha', 'ta1', 'ta-1', 'thymalfasin', 'zadaxin'],
      what: 'Also called thymalfasin. It is approved as a medicine in some countries.', status: 'Not approved in the US. [Confirm Canadian status]', storeCAD: [90], pageIssue: 'Page shows the TB-500 description by mistake.' },
    { k: 'hgh', name: 'HGH (human growth hormone)', sizes: ['100 iu [store page also says 1000 iu: confirm]'], group: 'gh', aka: ['hgh', 'growth hormone', 'somatropin'],
      what: 'Human growth hormone (somatropin). A prescription-only medicine for specific diagnosed conditions.', status: 'A licensed clinician decides if it is ever appropriate.', storeCAD: [200], pageIssue: 'Title says 100 iu, description says 1000 iu.' },
    { k: 'cjc', name: 'CJC-1295', sizes: ['with DAC 5 mg', 'without DAC 10 mg'], group: 'gh', aka: ['cjc', 'cjc-1295', 'cjc 1295', 'mod grf', 'dac'],
      what: 'Lab-made versions of growth-hormone-releasing hormone. "DAC" is an add-on that makes it last longer in the body.', status: NA, storeCAD: [100, 100] },
    { k: 'ipamorelin', name: 'Ipamorelin', sizes: ['10 mg'], group: 'gh', aka: ['ipa', 'ipamorelin', 'ipamoreline'],
      what: 'A lab-made peptide in the growth-hormone secretagogue family.', status: NA, storeCAD: [110] },
    { k: 'igf1lr3', name: 'IGF-1 LR3', sizes: ['[size not listed on store page]'], group: 'gh', aka: ['igf', 'igf-1', 'igf1', 'lr3'],
      what: 'A lab-made, longer-lasting version of insulin-like growth factor 1.', status: NA, storeCAD: [110], pageIssue: 'No vial size listed.' },
    { k: 'epitalon', name: 'Epitalon', sizes: ['10 mg', '50 mg'], group: 'longevity', aka: ['epitalon', 'epithalon', 'epithalamin'],
      what: 'A lab-made peptide made of four amino acids.', status: NA, storeCAD: [60, 200] },
    { k: 'motsc', name: 'MOTS-c', sizes: ['10 mg', '40 mg'], group: 'longevity', aka: ['mots', 'mots-c', 'motsc'],
      what: 'A peptide the body makes in its mitochondria, the parts of cells that make energy.', status: NA, storeCAD: [75, 125] },
    { k: 'ss31', name: 'SS-31', sizes: ['10 mg'], group: 'longevity', aka: ['ss31', 'ss-31', 'elamipretide'],
      what: 'Also called elamipretide.', status: '[Regulatory status: confirm before launch]', storeCAD: [75] },
    { k: 'nad', name: 'NAD+', sizes: ['1000 mg'], group: 'longevity', aka: ['nad', 'nad+', 'nicotinamide'],
      what: 'A coenzyme found in every living cell. It is not a peptide.', status: 'A licensed clinician decides if it is right for you.', storeCAD: [190] },
    { k: 'glutathione', name: 'Glutathione', sizes: ['1500 mg'], group: 'longevity', aka: ['glutathione', 'gsh'],
      what: 'A small peptide of three amino acids that the body makes naturally.', status: 'A licensed clinician decides if it is right for you.', storeCAD: [85] },
    { k: 'semax', name: 'Semax', sizes: ['10 mg'], group: 'mind', aka: ['semax'],
      what: 'A lab-made peptide developed in Russia, where it is registered as a medicine.', status: NA, storeCAD: [75] },
    { k: 'selank', name: 'Selank', sizes: ['10 mg'], group: 'mind', aka: ['selank'],
      what: 'A lab-made peptide developed in Russia, where it is registered as a medicine.', status: NA, storeCAD: [75] },
    { k: 'oxytocin', name: 'Oxytocin', sizes: ['2 mg'], group: 'mind', aka: ['oxytocin', 'pitocin'],
      what: 'A hormone the body makes. It is also a prescription medicine used in hospitals.', status: 'A licensed clinician decides if it is ever appropriate.', storeCAD: [80] },
    { k: 'ghkcu', name: 'GHK-Cu', sizes: ['50 mg', '100 mg'], group: 'skin', aka: ['ghk', 'ghk-cu', 'ghkcu', 'copper peptide'],
      what: 'A copper-bound peptide of three amino acids. It is widely used in cosmetic skin products.', status: 'A licensed clinician decides if an injectable plan is right for you.', storeCAD: [50, 100], pageIssue: 'The 50 mg page shows the Ipamorelin summary by mistake.' },
    { k: 'pt141', name: 'PT-141', sizes: ['10 mg'], group: 'intimacy', aka: ['pt141', 'pt-141', 'pt 141', 'bremelanotide', 'vyleesi'],
      what: 'Also called bremelanotide, the active ingredient in the FDA-approved prescription medicine Vyleesi.', status: 'A compounded version is not the same as an FDA-approved medicine.', storeCAD: [50] },
    { k: 'melanotan2', name: 'Melanotan II', sizes: ['10 mg'], group: 'skin', aka: ['melanotan', 'mt2', 'mt-2', 'mt ii', 'tanning'],
      what: 'A lab-made version of a hormone involved in skin colour.', status: 'Not approved as a medicine. Health regulators have warned the public about it. [Confirm before PEPTICITY lists it]', storeCAD: [50], pageIssue: 'Long description is placeholder text (soap ingredients and "lorem ipsum").' },
    { k: 'bacwater', name: 'Bacteriostatic water (Pfizer)', sizes: ['30 ml'], group: 'supplies', aka: ['bac water', 'bacteriostatic', 'water'],
      what: 'Sterile water with a preservative, used by pharmacies and clinicians.', status: 'How any product is prepared and used comes from your clinician and pharmacy.', storeCAD: [30] }
  ];
  var GROUPS = [
    ['metabolic', 'Metabolic and weight'], ['recovery', 'Recovery and repair'], ['gh', 'Growth hormone family'],
    ['longevity', 'Longevity and cellular health'], ['mind', 'Focus and mood'], ['skin', 'Skin'], ['intimacy', 'Intimacy'], ['supplies', 'Supplies']
  ];
  W.PEPINV = { products: P, groups: GROUPS, source: 'northernpeptides.st', pulled: '2026-10-26', listings: 36,
    // since the 29 Sept read: SLU-PP-332 (10 mg) is no longer listed on her store
    removed: ['SLU-PP-332'] };
  if (typeof module === 'object' && module.exports) module.exports = W.PEPINV;
})(typeof window !== 'undefined' ? window : globalThis);
