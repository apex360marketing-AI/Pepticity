---
name: ux-writing-microcopy
description: Write and check every word on APEX pages and generated client sites — plain-English headlines a business owner gets in 5 seconds, CTA/button labels, form labels and error messages, empty/loading/success/404 states, effect names and one-line summaries, alt text and aria labels — with a banned-jargon list, reading-level check, claim and placeholder rules. Use whenever writing or editing copy, labels, microcopy, error text, effect catalogue summaries, or when copy sounds like hype, jargon or "AI wrote this".
---

# UX writing and microcopy

The owner's rule is plain English that a business owner understands in 5 seconds. The words are part of the polish: classy brands sound calm, specific and sure, never hyped.

**Tweak rule:** when asked to change a design, NEVER rewrite existing copy unless copy was the request (CLAUDE.md). This skill is for new copy, or copy the owner asked to change.

## 1. Voice
- **Calm, specific, confident.** Short sentences. Talk to the owner as "you".
- Concrete nouns over abstractions: "a homeowner in Burnaby who needs a roof repair" beats "high-intent prospects".
- Reading level grade 6–8 (the check is in section 5). Headlines ≤ 8 words, subheads ≤ 20 words.
- No exclamation marks (except a single one on a success screen, if any), no emoji, no ALL-CAPS sentences. Sentence case for headings and buttons.

## 2. Banned words (replace with what you actually mean)
`leverage, synergy, unlock, supercharge, revolutionary, game-changer, cutting-edge, next-level, seamless(ly), robust, solutions, empower, elevate, best-in-class, world-class, AI-powered (as a selling point), harness, delve, skyrocket, 10x, guaranteed, #1, effortless, journey (for a sales funnel), state-of-the-art`
Internal words never shown to visitors: `GSAP, three.js, WebGL, shader, ScrollTrigger, artifact, module, token, SCR-07` (effect codes only in small print for staff, per `effect-catalog`).

## 3. Patterns
| Element | Formula | APEX example |
|---|---|---|
| Hero headline | Outcome for the owner | "Real local jobs, sent to your phone." |
| Subhead | How, in one line | "Homeowners near you ask for your service. We check each one and send it only to you." |
| Primary CTA | Verb + outcome | "See leads in [City]" |
| Secondary CTA | Low-commitment verb | "How it works" |
| Nav (fixed) | `Industries · How it works · Pricing · Get leads` | (do not rename) |
| Form label | Plain noun | "Mobile number", not "Phone # (required)*" |
| Field hint | Example format | "e.g. V5H 2E9" |
| Error | What happened + how to fix, no blame | "That number looks short. Add your area code." |
| Empty state | What will be here + first step | "No leads yet. Pick your service area to start." |
| Loading | What's happening | "Finding leads near [City]…" |
| Success | Done + what happens next + when | "Got it. [We'll text you within X minutes.]" |
| 404 | Calm + a way back | "This page moved. Here's the home page." |
| Effect summary | What the visitor SEES, ≤ 18 words | "The page dives through a night skyline to one lit window." |

## 4. Claims, numbers and placeholders
- No invented stats, testimonials, client counts, prices, guarantees or time promises. Write a marked placeholder instead: `[Stat — source needed]`, `[Your verification process]`, `[Price]`, `[Response time]`.
- Real numbers carry their source on the page (a footnote or tap-to-see) and come from the industry research data. Ranges beat false precision ("$180–$420 per lead", not "$287.43").
- "Verified" and "exclusive" are only used where the page explains what they mean.
- Health, finance, legal or supplement clients: run the `regulated-claims-check` skill before publishing.
- Every delivery to the owner ends with a list of all placeholders still on the page.

## 5. Automatic checks (paste into a Playwright `page.evaluate`)
```js
const BANNED = /\b(leverage|synergy|unlock|supercharge|revolutionary|game.?changer|cutting.?edge|next.?level|seamless(ly)?|robust|solutions?|empower|elevate|best.?in.?class|world.?class|harness|delve|skyrocket|10x|guarantee[ds]?|effortless|state.?of.?the.?art)\b/gi;
const text = document.body.innerText;
const syll = w => (w.toLowerCase().replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '').match(/[aeiouy]{1,2}/g) || [1]).length;
const sentences = text.split(/[.!?]+\s/).filter(s => s.split(/\s+/).length > 3);
const words = sentences.join(' ').split(/\s+/).filter(Boolean);
const grade = 0.39 * (words.length / sentences.length) + 11.8 * (words.reduce((a, w) => a + syll(w), 0) / words.length) - 15.59;
({ banned: [...new Set(text.match(BANNED) || [])], grade: +grade.toFixed(1),
   placeholders: [...new Set(text.match(/\[[^\]]{2,60}\]/g) || [])],
   exclaims: (text.match(/!/g) || []).length,
   vagueLinks: [...document.querySelectorAll('a,button')].map(e => e.textContent.trim()).filter(t => /^(click here|learn more|read more|submit|here)$/i.test(t)) })
```
Pass = no banned words, grade ≤ 9, no vague links, and placeholders listed in the report.

## 6. Accessibility copy
- Icon-only buttons get an `aria-label` that names the action ("Open menu", "Play sample video").
- Alt text describes the meaning, not the pixels ("Roofer checking a lead on his phone"). Decorative 3D, shaders and backgrounds get `aria-hidden="true"` / `alt=""`.
- Split or scrambled text keeps the real sentence in `aria-label` on the parent.
- Link text makes sense out of context.

## Do / don't
- DO read every headline aloud: if it sounds like an ad, rewrite it as a fact.
- DO write the button label after naming the next page. They must match.
- DON'T promise speed, results or exclusivity terms that aren't defined and true.
- DON'T use cute errors ("Oopsie!"); calm beats clever on a premium brand.

## Verify
Run the section 5 script on desktop and on the 390px view (mobile copy can differ). Screenshot the hero and LOOK at it: is the headline understood in 5 seconds without the subhead? Report the banned words (should be none), the grade, and the full placeholder list.
