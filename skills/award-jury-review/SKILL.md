---
name: award-jury-review
description: Self-critique a finished site the way an Awwwards / CSSDA / FWA jury would. Score Design, Usability, Creativity and Content (plus Developer and Mobile) on the 1–10 scale from real screenshots and measurements, find the three changes that raise the score most, fix them, and re-score. Includes calibration anchors, an anti-template checklist and evidence rules so scores aren't flattering. Use when asked to "review this like a jury", "would this win an award", "Awwwards score", "SOTD quality?", "critique the design", "what would make this world-class", "polish pass", or as the final step before reporting a template as done.
---

# Award-jury self-review

House `quality-gate` answers "is it broken?". This skill answers "is it remarkable?". Run it after the gate passes and before reporting. Be the harshest juror in the room. Inflated scores are the failure mode.

## 1. Gather evidence first (no scoring from memory or code)
- Screenshots at 1440×900 and 390×844: intro at 4 beats, every view at 0 / 33 / 66 / 100% scroll, the audience switcher in two states, the quiz at Q1 and result, and hover or focus states of the primary CTA and one card. Save them to `sites/<slug>/shots/jury/`.
- A short screen recording or a frame strip (10 frames over 3 s) of the hero scroll and the view transition, because motion can't be judged from a still.
- Numbers from `perf-budget-cwv` (LCP, INP, CLS, JS KB) and `senior-accessibility-aa-plus` (axe counts, target and font checks).
- LOOK at every image before writing a word. Note the first thing your eye lands on in each, which is the real hierarchy.

## 2. Score (1–10 each, Awwwards weighting)
| Criterion | Weight | What a 9 looks like | What drags it to 6 |
|---|---|---|---|
| Design | 40% | One unmistakable visual idea carried through type, grid, colour, imagery and motion. Considered spacing at every breakpoint | Nice parts that don't share a system. Template-looking cards. Default easing |
| Usability | 30% | Instantly clear what it is and what to do. Fast. Keyboard and screen reader complete. Senior-friendly | Clever nav that hides things. Scroll-jacking. Tiny text. Slow intro without skip |
| Creativity | 20% | A signature moment people would screen-record, which belongs to THIS brand (molecule folds into the mark) | Effects from a tutorial: generic particles, spinning helix, counter preloader |
| Content | 10% | Copy is specific, credible, compliant and sells. Imagery is real-feeling. Nothing is lorem or obvious placeholder in the hero | Vague benefit-speak, claim risk, stock-photo energy |
Overall = 0.4·D + 0.3·U + 0.2·C + 0.1·Ct. Score Developer (code quality, performance, a11y) and Mobile separately, out of 10.

**Calibration anchors.** 5 = competent agency site. 6.5 = Honorable Mention territory. 7.5+ on most jurors = Site of the Day range. 8.5+ = Site of the Month calibre. A first build that has not had a fix loop almost never deserves > 7. If you score > 8, quote the specific evidence that justifies each point above 7.

## 3. Anti-template checklist (each "yes" costs at least 0.5 Design)
- Warm cream + terracotta serif, everything centred, `rounded-lg` cards in a 3-up grid (BRIEF calls these out).
- Hero = big headline left, image right, two buttons, with nothing unexpected.
- The same reveal (fade-up 24px) on every element.
- Icons from a generic set, emoji, or flat clip-art.
- Gradient blob background with no relation to the brand.
- Banned clichés present: 0–100 counter, endless DNA spin, solid wipes, lagging ring cursor, magnetic buttons everywhere.
- Two templates in the set share any element of the uniqueness matrix (palette, fonts, nav, hero device, intro, scroll signature, buttons, cards, transitions).

## 4. Craft checks jurors notice in seconds
- Type: ≤ 2 families, real hierarchy (display ≥ 3.5× body on desktop), tracking tightened on large display sizes (−1 to −3%), no widows in the H1 (`text-wrap: balance`) and `text-wrap: pretty` on paragraphs.
- Grid: a visible underlying rhythm (8px spacing scale), alignment to edges that repeat across sections, intentional asymmetry rather than accidental.
- Motion: custom easings (`expo.out`, `cubic-bezier(.7,0,.2,1)`), staggers 40–80 ms, durations 0.6–1.2 s for reveals and ≤ 0.3 s for UI feedback. Every motion has a cause (scroll, hover, state). Nothing moves for no reason.
- Details: focus states designed (not browser default), selection colour set, custom scrollbar only if subtle, favicon, `<title>` per view, 404 and empty states considered, loading states for the quiz and forms.
- Transitions: the intro handoff and view transitions feel like one film, not three different directors.
- Mobile: a designed mobile experience, not a squashed desktop. Thumb-reach CTAs, no hover-dependent meaning.

## 5. Output format (write it, then act on it)
```
JURY REVIEW: <template> · <date>
Design 7.2 · Usability 7.8 · Creativity 6.9 · Content 7.0 → Overall 7.3   (Developer 7.5 · Mobile 6.8)
Signature moment: "<one sentence, what people would share>"   (missing? → that's fix #1)
Evidence: shots/jury/home-1440-33.png (hierarchy lands on X), LCP 1.7 s, axe 0 serious, …
Top 3 fixes by score gain per hour:
 1. <specific change> → +0.6 Creativity (why, which screenshot)
 2. …
 3. …
Anti-template hits: <list or none>
Would a juror remember it tomorrow? <yes/no + why>
```
Then **implement the top 3 fixes**, re-run `quality-gate`, re-shoot, and re-score with a one-line delta per criterion. Report both scorecards. Stop after two loops unless the user asks for more.

## 6. Boundaries
- This is self-critique. Do not submit anything to Awwwards, CSSDA or FWA, or publish anywhere, without the user's explicit go-ahead. Submissions cost money and are public.
- Never "fix" a score by adding compliance risk (testimonials, star ratings, outcome claims) or by breaking the house rules (banned colours, emoji icons).
- If you spawn reviewer sub-agents for independent scoring, stop and confirm with the user first, because it costs tokens. A single honest pass is the default.
- Do not reveal effect internals in client-facing notes (see `effect-catalog`). Use effect codes and names.
