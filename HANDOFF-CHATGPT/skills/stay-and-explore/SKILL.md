---
name: stay-and-explore
description: Use when a PEPTICITY page or flow should keep visitors longer and pull them deeper (the owner's IKEA-style "guide them through, constantly tempting", R063): guided path, progress indicators, reveals that need one action, the quiz, curiosity gaps, saved state, and measuring dwell. Use when planning the store path, the city-to-store journey, the menu or the dashboard client side.
---

# Stay and explore

## Guided path (IKEA-style)
- One clear route through the site: ENTRANCE → HERO → CITY WEAVE → DOORS + SCANNER → LAB → STORE PATH → JOIN.
- Each stop ends with a visible "next" cue (a lit arrow, a door, a path line) so the visitor always knows where to go.
- Shortcuts exist (menu, "SKIP TO THE STORE") but the main path is the easy default.
- The store path shows products and offers along the way, one group per stop, like walking past displays.

## Progress indicators
- A thin chrome line or a small numbered map ("3 OF 6 · THE LAB") on the edge of the screen.
- The menu doubles as the map: visited stops lit, the next one glowing.
- Never fake progress. It reflects real position.

## Reveals that need one action
- Tap the scanner to open the doors (R066). Wipe the fog to reveal the gift (CRD-124). Hover a node to light it (HOV-17 nodes). Turn the Earth.
- One action only, obvious affordance, and a keyboard equivalent (Enter/Space).
- If the visitor does nothing for ~4 s, a gentle hint (a pulse of light), never a pop-up.

## Quiz
- "FIND YOUR STARTING POINT": 3 tap questions about preferences and product categories (never symptoms or conditions), then the result, then "where should we send it?" (H40, `capture-forms`).
- Result recommends store categories or bundles by name, price and quantity only. No health claims, no doses.
- Follow `guided-quiz-funnel` for structure; never label the guided tour "quiz" if the owner's tour rule applies (R049).

## Curiosity gaps
- Tease the next stop before it arrives ("BEHIND THESE DOORS: THE PEPTICITY LAB").
- Locked or blurred items that unlock with one action or with joining ("MEMBER PRICE · JOIN TO SEE").
- Every gap is paid off within one screen. No bait with nothing behind it.

## Saved state
- Remember: path progress, last stop, quiz answers (on the device only), cart, joined status, dismissed hooks.
- Returning visitor: "WELCOME BACK · CONTINUE TO THE STORE" resume tab.
- Storage in try/catch; the page works without it.
- No health details in storage or URLs.

## Measure dwell (privacy-safe)
- Events: `stop_view:{stop}`, `stop_time:{stop}` (seconds, bucketed), `reveal_done:{id}`, `path_complete`, `resume_click`.
- No field values or quiz answers to analytics.
- Report per stop: views, average time, drop-off. Fix the stop with the biggest drop first.

## Checks
- [ ] The full path is walkable start to end on desktop and phone.
- [ ] Every stop has a visible next cue and a progress indicator.
- [ ] Every reveal works with one action and by keyboard.
- [ ] Quiz has no health or dosing content.
- [ ] Reload restores progress; blocked storage does not break the page.
- [ ] Dwell events fire with no personal data.
