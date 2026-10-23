/* Pepticity Open Lab — content data. EVERY number here is SAMPLE data for the template, to be replaced with real lab results. */
window.OL = (function () {
  const AUD = {
    longevity: {
      well: "A1", short: "55+ aging", label: "Healthy aging 55+",
      line: "“I want to keep doing the things I love, for longer.”",
      cta: "Start my healthy-aging consult",
      img: "media/aud-longevity.jpg", alt: "Silver-haired man walking a coastal trail",
      order: ["process", "proof", "price", "range"],
    },
    energy: {
      well: "A2", short: "Low energy", label: "Low energy",
      line: "“I want to feel like myself again, and I want real answers.”",
      cta: "Start my energy consult",
      img: "media/aud-energy.jpg", alt: "Woman stretching in bed in morning light",
      order: ["process", "proof", "range", "price"],
    },
    women: {
      well: "A3", short: "Women 40+", label: "Women 40+",
      line: "“My body is changing, and I want a plan that keeps up.”",
      cta: "Start my women's health consult",
      img: "media/aud-women.jpg", alt: "Woman in her fifties by a window",
      order: ["range", "proof", "process", "price"],
    },
    men: {
      well: "A4", short: "Men 35+", label: "Men 35+",
      line: "“I want to perform at work, at home and in the gym.”",
      cta: "Start my men's health consult",
      img: "media/aud-men.jpg", alt: "Man in his forties running city stairs at dawn",
      order: ["proof", "price", "process", "range"],
    },
    athlete: {
      well: "A5", short: "Training", label: "Training & recovery",
      line: "“I train hard, and I take my recovery seriously.”",
      cta: "Start my training consult",
      img: "media/aud-athlete.jpg", alt: "Athlete training in a dark gym",
      order: ["proof", "process", "price", "range"],
    },
  };

  /* Cosmetic, no-consult topicals. Names/formulas/MW are the real INCI peptides; no effect claims. */
  const MOL = {
    ghkcu: { name: "Copper Tripeptide-1", alias: "GHK-Cu", formula: "C14H22CuN6O4", mw: "401.91", seq: "Gly-His-Lys · Cu²⁺", spec: { seq: "GHK", cterm: "O", cu: true, seed: 7 } },
    pp4: { name: "Palmitoyl Pentapeptide-4", alias: "Pal-KTTKS", formula: "C39H75N7O10", mw: "802.05", seq: "Pal-Lys-Thr-Thr-Lys-Ser", spec: { seq: "KTTKS", nterm: "pal", cterm: "O", seed: 11 } },
    ah8: { name: "Acetyl Hexapeptide-8", alias: "Ac-EEMQRR-NH₂", formula: "C34H60N14O12S", mw: "888.99", seq: "Ac-Glu-Glu-Met-Gln-Arg-Arg-NH₂", spec: { seq: "EEMQRR", nterm: "ac", cterm: "N", seed: 3 } },
    pt1: { name: "Palmitoyl Tripeptide-1", alias: "Pal-GHK", formula: "C30H54N6O5", mw: "578.79", seq: "Pal-Gly-His-Lys", spec: { seq: "GHK", nterm: "pal", cterm: "O", seed: 5 } },
  };

  const PRODUCTS = [
    { id: "ghkcu", name: "Copper Peptide Water Serum", size: "30 mL", mol: "ghkcu", lot: "OL-2610-A", plate: "lab-vialrow", note: "A thin, blue-tinted water serum. Absorbs fast and leaves skin feeling soft." },
    { id: "pp4", name: "Matrix Night Cream", size: "50 mL", mol: "pp4", lot: "OL-2609-B", plate: "lab-powder", note: "A cushioned night cream with a supple, non-greasy finish." },
    { id: "ah8", name: "Expression Line Gel", size: "15 mL", mol: "ah8", lot: "OL-2609-C", plate: "lab-crystals", note: "A clear gel with a silky finish that sits well under makeup." },
    { id: "pt1", name: "Eye Contour Balm", size: "15 mL", mol: "pt1", lot: "OL-2608-D", plate: "lab-glovedvial", note: "A light balm for the eye area. Smooth feel, hydrated look." },
  ];

  // LC peak lists: x = retention time (min), h = mAU, w = sigma (min). ms = ions for that peak.
  function lc(mainRt, purity, imp) {
    const peaks = [{ x: mainRt, h: 1040, w: 0.11, label: "Main peak", area: purity, main: true }];
    imp.forEach(([x, h, area, label]) => peaks.push({ x, h, w: 0.09, label, area }));
    return peaks;
  }
  const MS = {
    ghkcu: [{ mz: 402.11, i: 100, z: 1, label: "[M+H]⁺ (Cu complex)" }, { mz: 341.19, i: 46, z: 1, label: "[GHK+H]⁺" }, { mz: 201.6, i: 18, z: 2, label: "[M+2H]²⁺" }, { mz: 363.17, i: 9, z: 1, label: "[GHK+Na]⁺" }],
    pp4: [{ mz: 802.57, i: 100, z: 1, label: "[M+H]⁺" }, { mz: 401.79, i: 62, z: 2, label: "[M+2H]²⁺" }, { mz: 824.55, i: 12, z: 1, label: "[M+Na]⁺" }],
    ah8: [{ mz: 445.22, i: 100, z: 2, label: "[M+2H]²⁺" }, { mz: 889.43, i: 38, z: 1, label: "[M+H]⁺" }, { mz: 297.15, i: 21, z: 3, label: "[M+3H]³⁺" }],
    pt1: [{ mz: 579.42, i: 100, z: 1, label: "[M+H]⁺" }, { mz: 290.22, i: 28, z: 2, label: "[M+2H]²⁺" }, { mz: 601.40, i: 8, z: 1, label: "[M+Na]⁺" }],
    rx: [{ mz: 0, i: 0, z: 1, label: "" }],
  };
  const IMP_MS = [{ mz: 284.17, i: 100, z: 1, label: "[fragment+H]⁺ (SAMPLE)" }, { mz: 213.13, i: 40, z: 1, label: "[fragment+H]⁺ (SAMPLE)" }];

  const metals = (pb, as, cd, hg) => [["Lead (Pb)", pb, "≤ 1.0 ppm"], ["Arsenic (As)", as, "≤ 0.5 ppm"], ["Cadmium (Cd)", cd, "≤ 0.5 ppm"], ["Mercury (Hg)", hg, "≤ 0.1 ppm"]];
  const micro = (s) => [["Total aerobic count", s ? "pending" : "< 10 cfu/g", "≤ 100 cfu/g"], ["Yeast & mould", s ? "pending" : "< 10 cfu/g", "≤ 10 cfu/g"], ["E. coli", s ? "pending" : "absent", "absent / 1 g"], ["S. aureus", s ? "pending" : "absent", "absent / 1 g"], ["P. aeruginosa", s ? "pending" : "absent", "absent / 1 g"]];

  const LOTS = [
    { code: "OL-2610-A", title: "Sample peptide A (topical raw material)", lane: "No-consult topical", mol: "ghkcu", date: "2026-10-14", status: "released", aud: ["women", "longevity"],
      purity: 99.4, spec: "≥ 98.0 %", lc: lc(8.42, 99.4, [[6.1, 3.1, 0.3, "Impurity A"], [9.7, 2.4, 0.3, "Impurity B"]]), ms: "ghkcu", theo: 402.105, obs: 402.107,
      endo: ["< 0.5 EU/mg", "≤ 5 EU/mg"], metals: metals("< 0.05", "< 0.05", "< 0.02", "< 0.01"), micro: micro(false) },
    { code: "RX-2610-1", title: "Sample preparation 1 (licensed partner pharmacy)", lane: "Clinician plan", mol: null, date: "2026-10-09", status: "released", aud: ["men", "athlete", "energy"],
      purity: 99.1, spec: "≥ 98.0 %", lc: lc(11.3, 99.1, [[9.2, 4.1, 0.5, "Impurity A"], [12.6, 2.6, 0.4, "Impurity B"]]), ms: "rx", theo: null, obs: null,
      endo: ["< 0.2 EU/mg", "per USP limit"], metals: metals("< 0.05", "< 0.05", "< 0.02", "< 0.01"), micro: micro(false) },
    { code: "OL-2609-B", title: "Sample peptide B (topical raw material)", lane: "No-consult topical", mol: "pp4", date: "2026-09-30", status: "released", aud: ["women", "longevity"],
      purity: 98.7, spec: "≥ 98.0 %", lc: lc(13.8, 98.7, [[12.1, 6.2, 0.8, "Impurity A"], [15.0, 4.0, 0.5, "Impurity B"]]), ms: "pp4", theo: 802.569, obs: 802.572,
      endo: ["< 0.5 EU/mg", "≤ 5 EU/mg"], metals: metals("0.08", "< 0.05", "< 0.02", "< 0.01"), micro: micro(false) },
    { code: "RX-2609-2", title: "Sample preparation 2 (licensed partner pharmacy)", lane: "Clinician plan", mol: null, date: "2026-09-26", status: "released", aud: ["longevity", "women", "energy"],
      purity: 99.6, spec: "≥ 98.0 %", lc: lc(7.6, 99.6, [[5.9, 2.2, 0.2, "Impurity A"], [8.9, 2.1, 0.2, "Impurity B"]]), ms: "rx", theo: null, obs: null,
      endo: ["< 0.2 EU/mg", "per USP limit"], metals: metals("< 0.05", "< 0.05", "< 0.02", "< 0.01"), micro: micro(false) },
    { code: "OL-2609-C", title: "Sample peptide C (topical raw material)", lane: "No-consult topical", mol: "ah8", date: "2026-09-22", status: "released", aud: ["women", "men"],
      purity: 98.9, spec: "≥ 98.0 %", lc: lc(10.1, 98.9, [[8.4, 5.0, 0.6, "Impurity A"], [11.5, 3.6, 0.5, "Impurity B"]]), ms: "ah8", theo: 445.218, obs: 445.221,
      endo: ["< 0.5 EU/mg", "≤ 5 EU/mg"], metals: metals("< 0.05", "0.06", "< 0.02", "< 0.01"), micro: micro(false) },
    { code: "RX-2609-3", title: "Sample preparation 3 (licensed partner pharmacy)", lane: "Clinician plan", mol: null, date: "2026-09-12", status: "held", aud: ["athlete", "men"],
      purity: 96.2, spec: "≥ 98.0 %", lc: lc(9.4, 96.2, [[7.7, 18, 2.4, "Impurity A"], [10.6, 11, 1.4, "Impurity B"]]), ms: "rx", theo: null, obs: null,
      endo: ["< 0.2 EU/mg", "per USP limit"], metals: metals("< 0.05", "< 0.05", "< 0.02", "< 0.01"), micro: micro(false),
      heldNote: "Purity came in under specification. The lot was held and never shipped. We publish it anyway." },
    { code: "OL-2608-D", title: "Sample peptide D (topical raw material)", lane: "No-consult topical", mol: "pt1", date: "2026-08-29", status: "released", aud: ["longevity", "women"],
      purity: 99.1, spec: "≥ 98.0 %", lc: lc(15.2, 99.1, [[13.6, 4.4, 0.5, "Impurity A"], [16.4, 3.3, 0.4, "Impurity B"]]), ms: "pt1", theo: 579.422, obs: 579.420,
      endo: ["< 0.5 EU/mg", "≤ 5 EU/mg"], metals: metals("< 0.05", "< 0.05", "< 0.02", "< 0.01"), micro: micro(false) },
    { code: "RX-2611-4", title: "Sample preparation 4 (licensed partner pharmacy)", lane: "Clinician plan", mol: null, date: "2026-10-20", status: "testing", aud: ["energy", "athlete", "longevity"],
      purity: 99.3, spec: "≥ 98.0 %", lc: lc(12.2, 99.3, [[10.4, 3.0, 0.4, "Impurity A"], [13.5, 2.5, 0.3, "Impurity B"]]), ms: "rx", theo: null, obs: null,
      endo: ["< 0.2 EU/mg", "per USP limit"], metals: metals("< 0.05", "< 0.05", "< 0.02", "< 0.01"), micro: micro(true) },
  ];
  // pharmacy preparations: generic SAMPLE spectrum (name withheld until a clinician prescribes)
  LOTS.forEach((l) => {
    if (true) {
      l.msIons = [{ mz: 540.3 + l.lc[0].x * 7, i: 100, z: 1, label: "[M+H]⁺" }, { mz: (541.3 + l.lc[0].x * 7) / 2, i: 44, z: 2, label: "[M+2H]²⁺" }, { mz: 562.3 + l.lc[0].x * 7, i: 10, z: 1, label: "[M+Na]⁺" }];
      l.theo = +(l.msIons[0].mz).toFixed(3); l.obs = +(l.theo + 0.002).toFixed(3);
    } else l.msIons = MS[l.ms];
    l.lc.forEach((p) => { p.ions = p.main ? l.msIons : IMP_MS; });
  });

  return { AUD, MOL, PRODUCTS, LOTS };
})();
