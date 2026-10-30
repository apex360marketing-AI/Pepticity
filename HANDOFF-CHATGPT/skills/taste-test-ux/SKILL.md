---
name: taste-test-ux
description: Build the APEX "Effect Taste Test" — the approved ~9-screen flow where prospects (kiosk/tablet demos, instant site) and existing clients react Love / Maybe / Not me to effect cards grouped by feeling, shown in their own name and colours, settle close calls with this-or-that tie-breakers, get a style-profile reveal with "picked because" lines, swap any piece, preview on their phone via QR and email their profile. Covers flow, scoring, data model, one-live-demo performance, kiosk reset and saving choices. Use whenever building or changing the effect picker, style quiz, taste test, onboarding quiz or upgrade chooser.
---

# Effect taste test

The research and approved plan are in `design/plans/effect-taste-test-research.md`. The owner approved all 8 parts (`design/plans/approved-roadmap.md`): feelings not names, their colours in demos, Love/Maybe/Not me, tie-breakers, style profile reveal, swap any piece, QR preview on phone, and email my style profile. **Build order:** after the showcase site and effect batches are done. There are two audiences: prospects (sales demo, instant site) and existing clients choosing upgrades.

## 1. Flow (target: under 5 minutes, about 20 reactions + 3 tie-breakers)
| # | Screen | Key rules |
|---|---|---|
| 1 | Welcome: "Let's find your website's personality." | Progress shows step 1 already ticked (head start). Max 8 step labels, 1–3 words each |
| 2 | Make it yours | Business name, plus an optional logo photo or a colour pick. Build tokens with `design-tokens-theming` §5 (banned-hue check included) |
| 3–7 | Five feeling rounds (Calm & premium · Bold & energetic · Cinematic · Playful · Clean & simple) | 4 cards per round, each showing the visitor's name and colours |
| 8 | Three this-or-that tie-breakers | Only between their closest pairs |
| 9 | Reveal: style profile + suggested mix | "Mostly cinematic, a little minimal"; a "Picked because you loved…" line under each piece |
| 10 | Swap any piece | 2–3 alternatives in the same feeling and slot |
| 11 | QR preview on their phone | A finished build (the IKEA effect only works if the build is completed) |
| 12 | "Email me my style profile" (email or phone; share with a partner) | Ask for contact details only AFTER the real preview |
| 13 | Thank-you: book a call / staff takes over | |

## 2. Effect card
- Feeling-led title, plus one plain line from the effect's `summary` in `design/effects.json` (`ux-writing-microcopy`). The effect code goes in small print for staff only.
- A poster loop by default: a muted, looping, `playsinline` webm + mp4 (≤ 600 KB), recorded in the visitor's colours where possible, otherwise neutral. "Try it live" mounts the real module.
- **Only ONE live demo at a time** across the whole flow (a single WebGL context; browsers kill the oldest beyond about 8–16). Mounting a new one calls `destroy()` on the last.
- Three big buttons, Love it / Maybe / Not for me, with keys 1/2/3 and swipe as an extra (never swipe-only). Respond within 100ms (a visual press plus moving on to the next card).

## 3. Scoring (deterministic; the same answers always give the same profile)
```js
const W = { love: 2, maybe: .5, not: -1.5 };              // dislikes are as informative as likes
function profile(answers, effects) {                     // answers: [{code, verdict}], tieBreaks: [{win, lose}]
  const feel = {}, byCat = {};
  for (const a of answers) { const fx = effects[a.code], w = W[a.verdict];
    for (const m of fx.mood) feel[m] = (feel[m] || 0) + w;
    (byCat[fx.category] ||= []).push({ code: a.code, s: w }); }
  return { feel, byCat };
}
function tieBreakPairs({ byCat }) {                      // the closest-scoring liked pairs, always within one category
  const pairs = [];
  for (const list of Object.values(byCat)) {
    const liked = list.filter(x => x.s > 0).sort((a, b) => b.s - a.s);
    for (let i = 1; i < liked.length && pairs.length < 3; i += 2) pairs.push([liked[i - 1].code, liked[i].code]);
  }
  return pairs;
}
```
- A tie-breaker win adds +1 to the winner. The **mix** fills each site slot (hero, nav, scroll scene, background, hover, cards) with the highest-scoring compatible effect. Compatibility rules come from the instant-site decisions ("Rules + Claude": the rules guarantee fit, and Claude picks among valid options).
- The profile sentence uses the top 2 feelings by normalised score: "Mostly {1st}, a little {2nd}".
- Never recommend an effect the visitor rated "Not for me".

## 4. Saving and data
- Artifact build: declare `capabilities: {db: {}}` (load the `artifact-capabilities` skill first). Collection `tasteTests`, one doc per session: `{answers, tieBreaks, profile, mix, swaps, brand:{name, tokens}, contact?, createdAt}`. Fall back to in-memory state if the db is unavailable; the flow must still finish.
- Contact details are stored only when the visitor submits them, with a consent checkbox (`conversion-ux`).
- The QR code encodes a preview URL with a session token (never personal details in the URL).

## 5. Kiosk / in-person mode (`?kiosk=1`)
- Full screen, no external links, and an idle reset after 90s with a 10s "Still there?" countdown. The reset wipes the state and contact fields.
- iPad: Guided Access. Android screen pinning is not a secure kiosk; use a kiosk app or device management for long-term use.
- Large touch targets (≥ 56px) and landscape 1024×768 as the primary layout.

## 6. Accessibility and motion
- Fully keyboard-operable; screen readers hear the card title, summary and verdict buttons.
- Reduced motion: posters show a still frame, "Try it live" runs the module with `--apx-motion:0`, and an on-screen Motion toggle is always visible (WCAG 2.2.2).
- Progress is announced ("Round 2 of 5").

## Do / don't
- DO keep rounds short (4 cards) and put the most important choices first (completion drops as questions grow).
- DO always show the picks in the result ("because you loved…"), so the result never drifts from what they chose.
- DON'T ask for an email before the preview, show effect jargon, or autoplay several live demos.

## Verify (Playwright, `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`)
- Run the full flow with a scripted answer set at 1024×768 (`hasTouch`) and 390×844. It completes with no `pageerror`, and the profile and mix are identical across 3 runs.
- During the flow, count live WebGL contexts (patch `getContext` to count active ones minus lost ones): never more than 1.
- "Not for me" effects never appear in the mix. Each swap offers 2–3 same-feeling alternatives.
- Kiosk: after 100s idle, the state resets and the contact fields are empty.
- The db doc is written once per completion (`ArtifactData list tasteTests` after publish).
- Screenshot every screen and LOOK at them: their name and colours are visible in the demos, nothing is cramped, and the result feels like a payoff.
