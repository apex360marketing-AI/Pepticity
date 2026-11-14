<script data-pep-src="config.js">
/* PEPTICITY flagship: the ONE config object. Pure data: no logic, no DOM, no network.
   build.mjs runs this file in a sandbox, checks the shape and prints the flags.
   Every string in here is published copy, so tools/scan.mjs scans it too. */
window.PEP_CONFIG = {
  brand: {
    name: 'PEPTICITY' // always capitals
  },

  offer: {
    // The owner's grand-opening offer (29 Oct 2026). Empty = no offer is shown anywhere.
    // It shows when flags.PREVIEW is true (so the owner can review it) OR when
    // flags.COUNSEL_CLEARED.offer is true. On the live site it stays hidden until a lawyer clears it.
    text: 'THE FIRST 25 MEMBERS GET 10% OFF FOR LIFE.'
  },

  // The one factual label line. It appears in the product view, the cart, checkout and the footer. A label, never a benefit sentence.
  // EMPTY (owner's decision 1A, Jeff, 13 Nov 2026): the research-use line is removed everywhere it showed (shelf, lineup,
  // cart, checkout, footer, TERMS, guide). Every module hides its label slot while this is empty. TERMS keeps
  // "PEPTICITY gives no advice on any product." (footer.html).
  label: {
    line: ''
  },

  // HIDDEN PRODUCTS: none right now (Jeff, 13 Nov 2026: "I don't want any products hidden right now. I want them all
  // active"). A sku listed here is left out wherever a product can show: the shelf, THE LINEUP, the PEPTIDES drop-down,
  // the guide's answers and its counts, the cart (a restored saved cart and a shared #cart= link included) and the links
  // that open a product. The products stay in assets/catalogue.json.
  hidden: [],

  // FLAGGED PRODUCTS: still awaiting counsel review (the owner's decisions 2A and 3A). They show and sell everywhere like
  // every other product, but carry an etched HIDE BEFORE LAUNCH band on their case and their description in THE LINEUP,
  // on their item in its list, on their shelf slat and on their cart line. Before launch, move each line back up into
  // hidden (or delete it once counsel clears that product).
  flagged: [
    'tirzepatide',
    'tesamorelin',
    'oxytocin',
    'retatrutide',
    'pt-141',
    'thymosin-alpha-1',
    'semax',
    'selank',
    'igf-1-lr3',
    'blend-contents-tbc'
  ],

  // Real numbers only. null = not set by Grace yet, and the page then shows nothing for it (never a made-up figure).
  shipping: {
    freeThresholdCAD: null,
    flatRateCAD: null
  },

  // First-order team offer, as a number for the cart. Used only when the offer switch (or preview) allows it.
  teamOffer: {
    percent: 10
  },

  // Age of majority by province or territory [counsel to confirm]. Used by the checkout gate.
  ageOfMajority: {
    AB: 18, MB: 18, ON: 18, PE: 18, QC: 18, SK: 18,
    BC: 19, NB: 19, NL: 19, NS: 19, NT: 19, NU: 19, YT: 19
  },

  form: {
    // Where forms post. EMPTY = NOTHING IS SENT (forms show their success state only).
    endpoint: ''
  },

  /* HOOKS:BEGIN config */
  // HOOKS (module 45-hooks, HOOKS worker, Nov 13 2026). Numbers and switches only: every word is in the page.
  // exit: the one quiet slide-in. It arms after armAfterMs on the page, shows at most once per session and at most
  //       maxEver times in all (counted in this browser, no personal data). Members never see it.
  // referral: the share reward, shown ONLY while flags.PREVIEW or flags.COUNSEL_CLEARED.referral is true.
  //       null = not set, and the reward line then stays hidden (the safe wording shows instead).
  // finderSkip: skus the finder never offers as a pick, on top of hidden (and flagged). Jeff's skills: recommend delist.
  hooks: {
    exit: { armAfterMs: 8000, maxEver: 3 },
    referral: { givePercent: 15, getPercent: 15 },
    finderSkip: ['melanotan-ii']
  },

  /* HOOKS:END config */

  flags: {
    // true  = preview build: no age gate, nothing leaves the browser.
    // false = live site. Set to false only at launch.
    PREVIEW: true,

    // Each switch stays false until a lawyer clears that item in writing.
    // A module must hide the feature (not just disable it) while its switch is false.
    COUNSEL_CLEARED: {
      offer: false,    // the sign-up offer wording and amount
      referral: false, // referral credit
      restock: false,  // tell-me-when-it's-back list
      names: false,    // product names shown in public
      areas: false     // the research-area line under each product name in THE LINEUP
    }
  }
};
</script>