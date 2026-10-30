/* =====================================================================
   PEPTICITY · CLIENT COMMS · CONTENT (notes.js)  · 30 Oct 2026
   Content only. comms.js reads window.PEP_COMMS_NOTES.

   DAILY LAB NOTE: one note per calendar day, alternating
     PEPTIDE OF THE DAY (27 notes, one per product family in shared/catalogue.json,
       bacteriostatic water left out on purpose: it is a supply, not a peptide)
     WELLNESS TIP (36 notes: sleep, water, sunlight, walking, stretching, routine)
   = 63 notes.

   RULES THIS FILE KEEPS (skill peptide-regulatory, wording-rules.md):
     - what a product IS (identity, class in plain words), how it is made, how it is kept,
       how a lot is checked. NEVER what it does to the body, NEVER dosing, mixing or use.
     - no health or medical claims in the wellness tips: habits only, no outcomes promised.
     - no invented facts about PEPTICITY: anything Grace must confirm is a [placeholder].
   ===================================================================== */
(function (W) {
  'use strict';

  /* how each kind of product is made (plain words) */
  var MADE = {
    spps: 'Made by chemical synthesis: the chain is built one amino acid at a time on tiny resin beads, washed, purified, then freeze-dried into a powder.',
    spps_ring: 'Made by chemical synthesis, one amino acid at a time on resin beads. The chain is then closed into its ring, purified and freeze-dried.',
    spps_short: 'Made by chemical synthesis: the few amino acids are joined in order, purified, then freeze-dried into a powder.',
    recomb: 'Too long to build one amino acid at a time, so it is made with recombinant methods: cells are given the genetic code and produce the protein, which is then purified and freeze-dried.',
    small: 'Made by ordinary organic chemistry (not a peptide chain), purified and dried into a powder.',
    nad: 'Produced by chemical or enzyme-based synthesis from nucleotide building blocks, purified and dried into a powder.',
    ferm: 'Produced by fermentation or chemical synthesis [confirm with supplier], purified and dried into a powder.',
    blend: 'Each peptide is synthesised and purified on its own first. Only then are they weighed out, combined in one vial and freeze-dried together.'
  };

  /* how it is kept (the same core rules for every freeze-dried vial, plus a product line where it matters) */
  var KEEP = 'Arrives freeze-dried in a sealed vial. Keep it cold (2 to 8 °C), dark and upright, with the seal untouched. Never leave it in a hot car or a sunny window. [Exact storage: per the supplier spec sheet for your lot]';

  /* how a lot is checked: one method explained per note, so every day teaches something new */
  var TEST = [
    'HPLC is the purity test. It separates everything in a sample and measures how much of it is the peptide named on the label.',
    'Mass spectrometry is the identity test. It weighs the molecule and checks the weight matches what the label says it is.',
    'Peptide content is measured separately from purity. A powder also holds a little water and salt, so a good report shows both numbers.',
    'Water content is measured too (often by a method called Karl Fischer), because a dry powder keeps best.',
    'The certificate of analysis must carry the same lot number as the vial. If the numbers do not match, the report does not count.',
    'Appearance is checked by eye against the spec: colour, texture and a clean, sealed vial with a printed lot number.'
  ];
  var TEST_TAIL = ' [Lab name and methods for each lot: Grace to confirm] The report for your lot sits in your LOT LIBRARY.';

  /* PEPTIDE OF THE DAY · one per family. slug = the dashboard bottle image key (window.PEP_VIALS) */
  var P = [
    { slug: 'bpc-157', name: 'BPC-157', sizes: '10 MG', cls: 'Synthetic peptide · 15 amino acids',
      what: 'A lab-made chain of 15 amino acids. Its sequence was first described from a protein found in human gastric juice.', made: 'spps' },
    { slug: 'tb-500', name: 'TB-500', sizes: '10 MG', cls: 'Synthetic peptide · thymosin beta-4 section',
      what: 'A lab-made peptide modelled on one short section of thymosin beta-4, a protein the body makes in most of its cells.', made: 'spps' },
    { slug: 'ghk-cu', name: 'GHK-Cu', sizes: '50 MG · 100 MG', cls: 'Copper peptide · 3 amino acids + copper',
      what: 'Three amino acids (glycine, histidine, lysine) holding one copper ion. The Cu in the name is the copper, and it is why the powder is a deep blue.', made: 'spps_short',
      keepX: 'Blue is its normal colour.' },
    { slug: 'nad', name: 'NAD+', sizes: '1000 MG', cls: 'Coenzyme · not a peptide',
      what: 'Not a peptide at all. NAD+ (nicotinamide adenine dinucleotide) is a coenzyme found in every living cell, built from two nucleotides joined together.', made: 'nad',
      keepX: 'It is sensitive to light and moisture, so the box matters.' },
    { slug: 'ipamorelin', name: 'IPAMORELIN', sizes: '10 MG', cls: 'Synthetic peptide · 5 amino acids',
      what: 'A lab-made chain of five amino acids. Chemists place it in a class called growth hormone secretagogues.', made: 'spps_short' },
    { slug: 'cjc-1295', name: 'CJC-1295', sizes: '5 MG WITH DAC · 10 MG WITHOUT', cls: 'Synthetic peptide · 30 amino acids',
      what: 'A lab-made 30-amino-acid analogue of GHRH, a signalling hormone the body makes. "With DAC" means a small chemical add-on is attached, so the two versions are different products with different lot numbers.', made: 'spps' },
    { slug: 'tesamorelin', name: 'TESAMORELIN', sizes: '10 MG', cls: 'Synthetic peptide · 44 amino acids',
      what: 'A lab-made 44-amino-acid analogue of GHRH, with a small chemical group added at one end of the chain.', made: 'spps' },
    { slug: 'epitalon', name: 'EPITALON', sizes: '10 MG · 50 MG', cls: 'Synthetic peptide · 4 amino acids',
      what: 'One of the smallest peptides on the shelf: four amino acids in a row (alanine, glutamic acid, aspartic acid, glycine).', made: 'spps_short' },
    { slug: 'mots-c', name: 'MOTS-C', sizes: '10 MG · 40 MG', cls: 'Mitochondrial-derived peptide · 16 amino acids',
      what: 'A 16-amino-acid peptide whose code sits in mitochondrial DNA, the small separate genome inside the cell’s mitochondria. This one is made in a lab.', made: 'spps' },
    { slug: 'ss-31', name: 'SS-31', sizes: '10 MG', cls: 'Synthetic peptide · 4 units',
      what: 'A small four-unit peptide. One of the four is a modified amino acid, which is why it is listed by its code name rather than a sequence.', made: 'spps_short' },
    { slug: 'kpv', name: 'KPV', sizes: '10 MG', cls: 'Synthetic peptide · 3 amino acids',
      what: 'Just three amino acids: lysine, proline and valine (K, P and V, hence the name). They match the last three of alpha-MSH, a hormone the body makes.', made: 'spps_short' },
    { slug: 'thymosin-alpha-1', name: 'THYMOSIN ALPHA-1', sizes: '10 MG', cls: 'Synthetic peptide · 28 amino acids',
      what: 'A lab-made chain of 28 amino acids, matching a peptide first isolated from the thymus gland.', made: 'spps' },
    { slug: 'semax', name: 'SEMAX', sizes: '10 MG', cls: 'Synthetic peptide · 7 amino acids',
      what: 'A lab-made seven-amino-acid peptide: a four-amino-acid piece of the hormone ACTH with three more (proline, glycine, proline) added to the end.', made: 'spps_short' },
    { slug: 'selank', name: 'SELANK', sizes: '10 MG', cls: 'Synthetic peptide · 7 amino acids',
      what: 'A lab-made seven-amino-acid peptide: tuftsin, a four-amino-acid peptide the body makes, with proline, glycine and proline added to the end.', made: 'spps_short' },
    { slug: 'oxytocin', name: 'OXYTOCIN', sizes: '2 MG', cls: 'Peptide hormone · 9 amino acids',
      what: 'A nine-amino-acid peptide hormone, made in a lab. Two of its amino acids are linked to each other, which folds part of the chain into a small ring.', made: 'spps_ring' },
    { slug: 'tirzepatide', name: 'TIRZEPATIDE', sizes: '15 MG · 30 MG', cls: 'Synthetic peptide · 39 amino acids',
      what: 'A lab-made 39-amino-acid peptide modelled on GIP, a gut hormone, and designed around two hormone receptors (GIP and GLP-1). A small fatty side chain is attached to it.', made: 'spps' },
    { slug: 'retatrutide', name: 'RETATRUTIDE', sizes: '10 MG · 15 MG · 20 MG', cls: 'Synthetic peptide · 39 amino acids',
      what: 'A lab-made 39-amino-acid peptide designed around three hormone receptors (GIP, GLP-1 and glucagon), with a small fatty side chain attached.', made: 'spps' },
    { slug: 'aod-9604', name: 'AOD-9604', sizes: '5 MG', cls: 'Synthetic peptide · 16 amino acids',
      what: 'A lab-made 16-amino-acid peptide modelled on the tail end of the growth hormone molecule, with one extra amino acid added.', made: 'spps' },
    { slug: '5-amino-1mq', name: '5-AMINO-1MQ', sizes: '10 MG', cls: 'Small molecule · not a peptide',
      what: 'Not a peptide. 5-Amino-1MQ is a small lab-made molecule from the quinolinium family, It is stored and handled like the peptides on the shelf.', made: 'small' },
    { slug: 'glutathione', name: 'GLUTATHIONE', sizes: '1500 MG', cls: 'Tripeptide · 3 amino acids',
      what: 'A three-amino-acid peptide (glutamate, cysteine, glycine). The body makes its own; the one in the vial is produced commercially.', made: 'ferm' },
    { slug: 'hgh-human-growth-hormone', name: 'HGH', sizes: '100 IU', cls: 'Protein · 191 amino acids',
      what: 'Human growth hormone (somatropin) is a protein of 191 amino acids. Its amount is given in IU (international units) rather than milligrams.', made: 'recomb' },
    { slug: 'igf-1-lr3', name: 'IGF-1 LR3', sizes: '[SIZE: GRACE TO CONFIRM]', cls: 'Protein analogue · 83 amino acids',
      what: 'A longer, lab-made version of IGF-1 (insulin-like growth factor 1): 83 amino acids, with one amino acid swapped near the start and 13 more added in front.', made: 'recomb' },
    { slug: 'pt-141', name: 'PT-141', sizes: '10 MG', cls: 'Synthetic peptide · 7 amino acids, ring-shaped',
      what: 'A lab-made seven-amino-acid peptide closed into a ring. Chemists class it as a melanocortin analogue.', made: 'spps_ring' },
    { slug: 'melanotan-ii', name: 'MELANOTAN II', sizes: '10 MG', cls: 'Synthetic peptide · 7 amino acids, ring-shaped',
      what: 'A lab-made seven-amino-acid peptide closed into a ring, modelled on alpha-MSH. Chemists class it as a melanocortin analogue.', made: 'spps_ring' },
    { slug: 'klow-blend', name: 'KLOW BLEND', sizes: '80 MG', cls: 'Blend · 4 peptides in one vial',
      what: 'Four peptides in one vial: GHK-Cu, BPC-157, TB-500 and KPV. [Exact blend and ratio: confirm with the lab report]', made: 'blend' },
    { slug: 'glow-blend', name: 'GLOW BLEND', sizes: '70 MG', cls: 'Blend · 3 peptides in one vial',
      what: 'Three peptides in one vial: BPC-157, TB-500 and GHK-Cu. [Exact ratio: confirm with the lab report]', made: 'blend' },
    { slug: 'wolverine-blend', name: 'WOLVERINE BLEND', sizes: '10 MG · 20 MG', cls: 'Blend · 2 peptides in one vial',
      what: 'Two peptides in one vial: BPC-157 and TB-500. [Exact ratio: confirm with the lab report]', made: 'blend',
      testX: 'For a blend, the report should confirm each peptide on its own, not just the total.' }
  ];

  var peptides = P.map(function (p, i) {
    return {
      kind: 'pep', key: 'pep:' + p.slug, slug: p.slug, title: p.name, sizes: p.sizes, cls: p.cls,
      rows: [
        ['WHAT IT IS', p.what],
        ['HOW IT IS MADE', MADE[p.made]],
        ['STORAGE + HANDLING', (p.keepX ? p.keepX + ' ' : '') + KEEP],
        ['HOW EACH LOT IS TESTED', (p.testX ? p.testX + ' ' : '') + TEST[i % TEST.length] + TEST_TAIL]
      ]
    };
  });

  /* WELLNESS TIP · habits only, never an outcome. [category, title, body, try today] */
  var T = [
    ['SLEEP', 'SAME TIME, EVERY MORNING', 'Pick one wake-up time and keep it, weekends included. A steady start makes the rest of the day easier to plan.', 'Set one alarm for the same time all seven days.'],
    ['SLEEP', 'A DIMMER LAST HOUR', 'In the last hour before bed, turn the big lights off and the lamps on. Let the evening slow down on purpose.', 'Swap the ceiling light for a lamp after 9 PM.'],
    ['SLEEP', 'PHONE ACROSS THE ROOM', 'Charge your phone across the room instead of beside the pillow. The last scroll of the night can wait for morning.', 'Find your phone a new charging spot tonight.'],
    ['SLEEP', 'COOL, DARK AND QUIET', 'Many people find a cool, dark, quiet room the easiest place to switch off. Small lights and noises add up.', 'Look for standby lights in the bedroom and cover them.'],
    ['SLEEP', 'ONE WIND-DOWN CUE', 'Choose one small thing that always means bedtime: a page of a book, a warm shower, a slow stretch.', 'Pick your cue and do it tonight.'],
    ['SLEEP', 'A COFFEE CUT-OFF', 'Give yourself a time for the last coffee of the day, and keep to it like an appointment.', 'Write your cut-off time on a note by the kettle.'],
    ['WATER', 'A GLASS BEFORE COFFEE', 'Start the day with a full glass of water before anything else. It is the easiest habit on this list.', 'Leave a clean glass by the kettle tonight.'],
    ['WATER', 'CARRY A BOTTLE', 'A bottle you like is a bottle you use. Keep it where you can see it: desk, car, bag.', 'Fill one bottle in the morning and bring it everywhere.'],
    ['WATER', 'WATER WITH EVERY MEAL', 'Put a glass of water on the table at every meal, the same way you set out a fork.', 'Pour the glass before you sit down to eat.'],
    ['WATER', 'MAKE IT TASTE GOOD', 'Plain water gets boring. A slice of lemon, cucumber or a sprig of mint keeps it interesting.', 'Make one jug of flavoured water for the fridge.'],
    ['WATER', 'A GLASS AFTER EVERY WALK', 'Tie a glass of water to the end of every walk, so one habit reminds you of the other.', 'Drink a glass the moment you are back through the door.'],
    ['WATER', 'LINK IT TO SOMETHING', 'If you forget to drink, link it to something you already do: every call you finish, take a few sips.', 'Keep water within reach of where you take calls.'],
    ['SUNLIGHT', 'MORNING LIGHT FIRST', 'Step outside for a few minutes soon after you wake, even when the sky is grey.', 'Take your first drink of the day on the step or balcony.'],
    ['SUNLIGHT', 'OPEN THE CURTAINS', 'Open the curtains the moment you are up. Let the room know the day has started.', 'Open every curtain on your way to the kitchen.'],
    ['SUNLIGHT', 'DESK BY THE WINDOW', 'If you work indoors, move your desk or chair closer to a window and look out of it now and then.', 'Spend ten minutes of work time by a window today.'],
    ['SUNLIGHT', 'LUNCH OUTSIDE', 'Take lunch outside when the weather allows, even if it is only a bench round the corner.', 'Eat one meal outdoors this week.'],
    ['SUNLIGHT', 'CATCH THE SHORT DAYS', 'Canadian winter days are short. Plan to be outside around midday, when the light is at its best.', 'Put a 15-minute midday walk in your calendar.'],
    ['SUNLIGHT', 'THE LONG WAY ROUND', 'When you can, choose the outdoor route: the street over the tunnel, the park over the parking lot.', 'Take the outdoor route on one trip today.'],
    ['WALKING', 'A TEN-MINUTE WALK', 'Ten minutes counts. A short walk you take beats a long one you keep putting off.', 'Walk for ten minutes before lunch.'],
    ['WALKING', 'WALK AND TALK', 'Take phone calls on foot. A call that would have been spent sitting becomes a walk.', 'Take your next call standing up and moving.'],
    ['WALKING', 'TAKE THE STAIRS', 'When there is a choice, take the stairs for a floor or two. Go at your own pace and hold the rail.', 'Choose the stairs once today.'],
    ['WALKING', 'A WALK AFTER DINNER', 'A slow walk after dinner is an old habit for a reason: it marks the end of the day.', 'Walk round the block after dinner tonight.'],
    ['WALKING', 'PARK FURTHER AWAY', 'Park at the far end of the lot, or get off the bus a stop early, and walk the rest.', 'Add one extra stop of walking to a trip today.'],
    ['WALKING', 'BRING SOMEONE', 'A walk with a friend is a walk you are less likely to skip. Make it a standing plan.', 'Ask one person to walk with you this week.'],
    ['STRETCHING', 'STAND UP EVERY HOUR', 'If you sit for work, stand up once an hour, even for a minute. Move gently and stop if anything hurts.', 'Set a quiet hourly reminder for this afternoon.'],
    ['STRETCHING', 'REACH FOR THE CEILING', 'Stand tall, reach both arms up slowly and breathe out as they come down. Gentle, never forced.', 'Do it five times when you next stand up.'],
    ['STRETCHING', 'SHOULDERS AT THE DESK', 'Roll your shoulders back slowly, then down. Small and slow is the whole idea.', 'Roll your shoulders five times before you open your email.'],
    ['STRETCHING', 'WHILE THE KETTLE BOILS', 'Waiting for the kettle is a free minute. Spend it on a slow, easy stretch instead of your phone.', 'Stretch every time you boil the kettle today.'],
    ['STRETCHING', 'A SLOW MORNING MINUTE', 'Before you get out of bed, take one slow minute to stretch your arms and legs and breathe.', 'Try one slow minute tomorrow morning.'],
    ['STRETCHING', 'LOOK AWAY FROM THE SCREEN', 'Every so often, look away from the screen at something far off and let your face relax.', 'Look out of a window for twenty seconds every hour.'],
    ['ROUTINE', 'LAY IT OUT TONIGHT', 'Set out tomorrow’s clothes, bag and bottle tonight. The morning starts with fewer decisions.', 'Lay out three things for tomorrow before bed.'],
    ['ROUTINE', 'ONE THING FIRST', 'Decide the night before which one thing matters most tomorrow, and do it first.', 'Write tomorrow’s one thing on a sticky note.'],
    ['ROUTINE', 'A SUNDAY RESET', 'Take twenty minutes on Sunday to look at the week ahead: meals, walks, early nights.', 'Book your Sunday reset in the calendar.'],
    ['ROUTINE', 'A SIMPLE CHECKLIST', 'A paper list with three boxes (water, walk, bed on time) is enough. Tick what you did; skip the guilt.', 'Draw three boxes on a card and keep it by the fridge.'],
    ['ROUTINE', 'PAIR IT UP', 'Attach a new habit to one you already have: a stretch after brushing your teeth, a glass of water after coffee.', 'Pick one pair and try it today.'],
    ['ROUTINE', 'TEN QUIET MINUTES', 'Give yourself ten quiet minutes before the screens come on: tea, a window, your own thoughts.', 'Leave your phone face down for the first ten minutes tomorrow.']
  ];
  var wellness = T.map(function (t, i) {
    return { kind: 'well', key: 'well:' + i, cat: t[0], title: t[1], body: t[2], tryToday: t[3] };
  });

  /* sample clients for GRACE'S ANNOUNCEMENTS "one client" (the dashboard's sample list; Jordan is the demo client) */
  var CLIENTS = [
    { k: 'jordan', name: 'Jordan M.', tier: 'RESERVE' },
    { k: 'priya', name: 'Priya S.' }, { k: 'marcus', name: 'Marcus T.' }, { k: 'elena', name: 'Elena R.' },
    { k: 'devon', name: 'Devon K.' }, { k: 'sofia', name: 'Sofia L.' }, { k: 'aaron', name: 'Aaron B.' }, { k: 'nadia', name: 'Nadia F.' }
  ];

  /* seeded SAMPLE content (shown with a SAMPLE tag until Grace writes her own) */
  var SEED = {
    note: {
      title: 'A NOTE FROM GRACE',
      body: 'Thank you for being part of PEPTICITY’s first season. I read every message myself, so if anything about an order isn’t right, tell me and I’ll fix it. [This week’s note: Grace writes her own in the studio dashboard.]',
      sig: 'GRACE'
    },
    announcement: {
      title: 'YOUR NEW DASHBOARD',
      body: 'Everything about your orders now lives here: tracking, reminders, lot reports and a direct line to me on every order. Grace'
    },
    checkins: [
      { order: '#PT-1032', client: 'Priya S.', rating: 5, note: '[Sample note: the client’s own words appear here]', daysAgo: 3 },
      { order: '#PT-1019', client: 'Aaron B.', rating: 4, note: '[Sample note: the client’s own words appear here]', daysAgo: 6 }
    ]
  };

  W.PEP_COMMS_NOTES = {
    version: '2026-10-30',
    peptides: peptides,
    wellness: wellness,
    clients: CLIENTS,
    seed: SEED,
    lines: {
      pepFoot: 'What it is, how it is made, kept and checked. Never how to use it. Not medical advice.',
      wellFoot: 'A general everyday habit, not medical advice. Go at your own pace.',
      phone: 'Phone reminders turn on once PEPTICITY is installed.',
      phoneAlerts: 'Phone alerts for replies turn on once PEPTICITY is installed.',
      noHealth: 'Please keep health details out of messages. Grace can answer questions about orders, delivery and products.'
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
