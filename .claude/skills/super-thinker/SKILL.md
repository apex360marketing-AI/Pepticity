---
name: super-thinker
description: Use when a PEPTICITY or APEX idea must be ORIGINAL rather than the first thing an LLM would suggest - a new effect, section concept, hook, watermark, entrance, name, campaign angle or "make it one of a kind / nothing like anyone else's". Runs a short forced-divergence loop (techniques, cluster, red-team against the brief and anti-slop rules, pick, prove uniqueness). Sits between brainstorming (what the owner wants) and spec-before-build (the approved checklist). Not for routine fixes or tweaks.
---

# SUPER-THINKER

## WHY THIS EXISTS
- LLMs collapse to the same "typical" answer: one model repeats itself, and different models give near-identical ideas (Artificial Hivemind, NeurIPS 2025). Raising temperature barely helps.
- Fix = force the model off the typical path with named techniques, make it state how typical each idea is, then judge hard.
- Run it AFTER the owner's want is understood (`brainstorming` / `spec-before-build`). Never let it change a LOCKED decision in CLAUDE.md.

## THE LOOP (one pass is about 10 minutes; write it out, do not do it "in your head")

### 0. FRAME (3 lines)
- Brief in one sentence, in the owner's words.
- Hard constraints: CLAUDE.md locks, brand-lock, regulatory, Higgsfield-only imagery, budget.
- THE OBVIOUS ANSWER: write the first idea that comes to mind and label it `BANNED-OBVIOUS`. Also list 3 things every competitor does (see `competitor-teardown`). These are now off limits as-is.

### 1. DIVERGE (forced, at least 12 ideas, at least 6 techniques, 2 ideas each max)
Use a different technique for each pair; name the technique beside each idea.
- **SCAMPER**: Substitute, Combine, Adapt, Modify/magnify, Put to other use, Eliminate, Reverse.
- **PO PROVOCATION (de Bono)**: write an absurd "PO" statement (e.g. "PO: the page scrolls the visitor"), then extract a workable idea from it. The provocation is a means, never the output.
- **RANDOM ENTRY**: take a random noun (pick by line number from a word list or the current timestamp), list 5 links to the brief, keep the strongest.
- **TRIZ PRINCIPLE**: name the contradiction (e.g. "rich motion vs. fast + calm"), then apply one of the 40 principles: Segmentation, Taking out, Nested doll, Prior action, Dynamics, Another dimension, Inversion, Self-service, Copying, Colour change.
- **CONSTRAINT INVERSION**: flip one assumption ("a watermark is behind content" → "content is cut out of the watermark"; "scroll moves down" → "the object moves up through the page").
- **ANALOGY TRANSFER**: steal a mechanism from another industry: watchmaking (complications, crown), pharma (blister, batch seal, lot code), aviation (altimeter, HUD), print (die-cut, emboss, foil), architecture (reveal joints, shadow gaps), film (focus pull, rack, iris). Name the source.
- **EXTREME USER (design thinking)**: design for a 70-year-old on a phone in sunlight, then for a jaded designer on a 5K screen. Keep what serves both.
- **VERBALIZED SAMPLING**: ask "give 5 ideas with the probability another AI would also suggest each"; keep only ideas you rate below 10%.

### 2. CLUSTER (2 minutes)
- Group the ideas into 3-5 families by mechanism (what the visitor sees/does), not by technique.
- Name each family in CAPITALS. Merge duplicates. Combine across families where two half-ideas make one whole one.

### 3. RED-TEAM (each surviving idea, scored 0-2 per line, kill anything with a 0)
- BRIEF FIT: does it serve the owner's actual ask (sales, leads, posh, classy)?
- LOCKS: breaks nothing in CLAUDE.md (font, P mark, bottle, dashboard look, Higgsfield-only imagery)?
- ANTI-SLOP: would it look the same if any other company made it? Generic dark UI kit? Cartoon? Multicolour glow? Gold/amber? If yes → 0.
- PALETTE: restrained monochrome (wall #323232, metal #080807-#8E8D85, UV-black sheen) with at most ONE sparing accent?
- BUILDABLE: can code build it with transform/opacity, existing Higgsfield assets, 60fps on a mid phone, reduced-motion fallback?
- COMPLIANT: no health claims, no fake urgency (`peptide-regulatory`, `honest-urgency-and-social-proof`).
- ATTACK: write the single strongest objection a sceptical art director would make, then either answer it or drop the idea.

### 4. PICK (one primary, one safer backup)
- Highest total; ties go to the one with the lower "another AI would suggest it" probability.
- Self-refine once: list 3 weaknesses of the pick and fix them in the description.

### 5. PROVE IT IS ONE OF A KIND (3 bullets, required)
- WHAT IT BORROWS FROM: the technique + source industry.
- WHAT NOBODY ELSE HAS: the specific twist, tied to PEPTICITY (peptide chain, lot seal, vial, the P mark, the city, the lab).
- NEAREST EXISTING THING: name the closest effect in `design/effects.json` (apex_agents_bots) or a known site, and say how this differs. If it is the same, it is not new: reuse that code instead (`effect-catalog`).

## OUTPUT TO THE OWNER (follow owner-delivery-format)
- Point form. Top 3 ideas as multiple choice (A/B/C), each with one line on what the visitor sees + why it is unique.
- One RECOMMENDATION with the reason.
- If a picture is needed to judge it: ONE sample only, and Higgsfield cost stated first (`credit-guard`).

## RULES
- Headings in CAPITALS. Restrained monochrome; one sparing accent at most; never gold/amber; no cartoon; no rainbow/multicolour glows.
- Never present the BANNED-OBVIOUS idea as a pick.
- Never skip the red-team to save time; it is the part that kills slop.
- Do not invent stats, reviews or results to make an idea sound better.

## SOURCES
- obra/superpowers `brainstorming` (MIT, Jesse Vincent): understand the want before generating - https://github.com/obra/superpowers
- Tree of Thoughts (Yao et al. 2023): generate several branches, evaluate, prune, backtrack - https://arxiv.org/abs/2305.10601
- Artificial Hivemind: open-ended homogeneity of LMs (Jiang et al., NeurIPS 2025) - https://arxiv.org/abs/2510.22954
- Verbalized Sampling: ask for a distribution to escape mode collapse (Zhang et al. 2025) - https://arxiv.org/abs/2510.01171
- CreativeDC: divergent-then-convergent phases for LLM creativity - https://arxiv.org/html/2512.23601v1
- Self-Refine: critique then revise (Madaan et al. 2023) - https://arxiv.org/abs/2303.17651
- Diverge/converge Claude skill (ideas → clusters → selections) - https://skills.sh/lyndonkl/claude/brainstorm-diverge-converge
- Lateral thinking skill with PO and random entry - https://skills.sh/andurilcode/skills/lateral-thinking
- TRIZ 40 inventive principles - https://kk.org/cooltools/?p=897 ; TRIZ and lateral thinking - https://metodolog.ru/triz-journal/archives/1998/03/c/index.htm
