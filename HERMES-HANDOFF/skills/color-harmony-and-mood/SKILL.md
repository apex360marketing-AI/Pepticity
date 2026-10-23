---
name: color-harmony-and-mood
description: Choose hues with intent - harmony schemes computed in OKLCH (monochrome, analogous, complementary, split, triad) filtered through the owner's taste rules, industry and emotion associations, cultural meanings and signature luxury pairings (onyx and platinum, oxblood and stone, espresso and ivory, ink and bone, smoke and rosewood). Use when asked "what colours go with X", "complementary colour", "colour harmony", "what colour means trust / luxury / energy", "colours for a law firm / clinic / restaurant / gym", "does this colour feel right", "colour meaning in China / Middle East", or when picking an accent hue for a brief.
---

# Colour harmony and mood

Pick the hue story first, then build roles with `color-palette-architect`. Check every candidate with `node ../tonal-scales-and-tokens/palette.mjs info <hex...>`.

## 1. Owner taste filter (apply before presenting anything)
- **Never**: gold, amber, mustard, champagne, yellow (OKLCH H 65-105, C ≥ 0.04).
- **No green / mint / lime** (H 105-175, C ≥ 0.04), except the chartreuse spark `#d4ff3a` for tiny accents.
- **Not blue- or purple-led**: H 230-320 may appear as info or a minor note, never as the leading accent.
- **Loves** dark, tinted near-neutrals with one confident accent: onyx & platinum, oxblood & stone, espresso & ivory, ink & bone, smoke & rosewood. Warm neutrals at C < 0.04 (ivory, bone, stone, taupe) are allowed even though their hue sits in the gold range.
- The allowed accent territory is therefore roughly: H 0-60 (oxblood, rosewood, garnet, terracotta, pumpkin, coral), H 340-360 (raspberry, magenta-red), H 180-225 at modest chroma (teal/petrol, steel), plus the chartreuse spark.

Note: the synced `neon-glass-ui` skill's palette (#E2FF1F brand, #EAFF00, #FFAE00, #00FFC2) measures inside the banned zones; only #d4ff3a is exempt. Flag this to the owner rather than copying those values into new work.

## 2. Harmony in OKLCH, not on the HSL wheel
HSL wheels are perceptually uneven (yellow and cyan take up little perceived space, blue/purple a lot). Compute schemes by rotating **OKLCH hue at constant L and C**, then gamut-fit:
| Scheme | Hue offsets | Use |
|---|---|---|
| Monochrome | 0 (vary L, C) | luxury, editorial: the owner's default |
| Analogous | ±20-35° | warm, cohesive (oxblood → rosewood → terracotta) |
| Complementary | 180° | one dominant, the complement as a < 5% spark only |
| Split-complementary | 180 ± 30° | livelier, still controlled |
| Triad | 120° | playful; rarely right for premium clients |

After rotating, **every resulting hue must pass the taste filter**. Complements of oxblood (H ~15) land at H ~195 (petrol teal: allowed at modest C). Complements of terracotta (H ~40) land at H ~220 (steel blue: allowed as minor only). Triads from reds hit green and gold: almost always rejected, so say so and offer analogous.

Then **unequal proportions**: harmony comes from one hue dominating (60-30-10), not from the scheme.

## 3. Mood and industry starting points (associations, not science)
| Brief / mood | Hue and treatment that fits the owner's rules |
|---|---|
| Luxury, fashion, jewellery | onyx & platinum, or espresso & ivory; spark accent < 2% |
| Heritage, wine, legal, private banking | oxblood & stone; serif type; low chroma grounds |
| Wellness, skincare, clinics | bone/ivory grounds, rosewood or dusty clay accent (H 15-35, C 0.06-0.10); avoid clinical blue-white |
| Food, hospitality | espresso, terracotta, pumpkin (H 45-55); appetite reads from warm reds/oranges |
| Tech, SaaS, fintech | ink or onyx ground, chartreuse spark or garnet accent; avoids the category's default blue |
| Fitness, energy | onyx + hot coral/raspberry (H 10-20 or 350, C 0.18+) |
| Trust, healthcare, public sector | deep petrol (H ~210, C 0.06-0.09) as secondary, oxblood or ink lead; blue only if mandated |
| Children, playful | warm coral + pumpkin + teal at medium L; still no yellow |
| Calm, sleep, spa | smoke & rosewood, low chroma everything, generous L contrast only for text |

Emotion levers that matter more than hue: **lightness contrast** (high = bold, low = calm), **chroma** (high = energetic/cheap if overused, low = sophisticated), **temperature** (warm H 0-70 = approachable, cool H 180-260 = composed).

## 4. Cultural notes (flag when the client's audience is international)
- Red: luck and celebration in China and much of East Asia; danger/debt in Western finance UIs (don't use red for positive numbers).
- White: mourning in parts of East and South Asia; purity/weddings in the West.
- Black: mourning in the West, but also luxury everywhere online.
- Purple: royalty/luxury historically in Europe; mourning in parts of Latin America and Thailand.
- Green: sacred in Islam; also money in the US (owner bans it anyway; mention if a client asks).
- Orange: sacred in Hinduism and Buddhism; budget-brand connotations in Western retail at high chroma.
State these as "commonly associated" and suggest a local check for regulated or religious contexts.

## 5. Evaluating "does this colour feel right"
Answer with: measured OKLCH, which mood quadrant it falls in (temperature × chroma), category collision (is it the leader's colour?), taste-rule verdict, and one adjustment ("drop C from 0.19 to 0.12 to move it from sporty to premium").

## Don't
- Don't present a rainbow of "options". One recommendation, one contrasting alternative at most.
- Don't cite colour-psychology percentages as fact.
- Don't pick harmony on hue alone; check that the colours differ enough in lightness to be distinguishable in greyscale (ΔL ≥ 0.15 between roles that must be told apart).
