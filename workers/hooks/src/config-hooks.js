  // HOOKS (module 45-hooks, HOOKS worker, Nov 13 2026). Numbers, switches and the gated reward wording: nothing gated is in the page.
  // exit: the one quiet slide-in. It arms after armAfterMs on the page, shows at most once per session and at most
  //       maxEver times in all (counted in this browser, no personal data). Members never see it.
  // referral: the share reward, numbers AND words, shown ONLY while flags.PREVIEW or flags.COUNSEL_CLEARED.referral is true.
  //       {give} and {get} are filled from the two numbers. A number that is null, or a missing headline, keeps the reward
  //       hidden (the safe wording shows instead).
  // finderSkip: skus the finder never offers as a pick, on top of hidden (and flagged). Jeff's skills: recommend delist.
  hooks: {
    exit: { armAfterMs: 8000, maxEver: 3 },
    referral: { givePercent: 15, getPercent: 15,
      headline: 'GIVE {give}% OFF. GET {get}% CREDIT.',
      line: 'Your friend gets {give}% off their first order, and you get {get}% credit when they order.' },
    finderSkip: ['melanotan-ii']
  },

