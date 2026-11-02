# HOOK MAP · BOT GALLERY (skill lead-hook-proof)

Built 2 Nov 2026 on branch `claude/pepticity-bot-gallery`. NOT published. Preview-only capture: the lead is stored in this browser (`localStorage.pep_gallery_leads`, `window.__PEP_LEADS`) and announced on a `pep:lead` document event; nothing is sent anywhere.

## What every bot has (same hook, same proof)
- **Hook type:** bot, then email (required) + optional text. Reached after 4 plain questions and the reading list (screen 2 of 2).
- **Hook id:** `gal-<slug>` (see table). Payload: hook, page, ts, email, phone or null, answers (goal, age range, want-more, starting point), consent records (transactional list, marketing email, sms) with the exact wording shown and a timestamp.
- **Consent (CASL):** the email news box and the text box both start UNTICKED, are separate, and each states one purpose. The reading-list email itself is the thing the visitor asked for. A phone number without the text box ticked is refused with an inline message.
- **Keyboard:** every control is a real button or input with a visible focus ring; options also work with Enter/Space; honeypot field is off-screen and `tabindex=-1`.
- **Success state:** replaces the form in the same spot, focus moves to it, shows the next step (default: the free assessment link; `?safe=1`: reading list only) and a Start over button.
- **No product names or prices** anywhere (checked by `node tools/gallery-brain-test.js` against the inventory).

## Per bot

| # | Bot | Family | Hook id | Ask | Result | Screenshot (desktop, reading list + form) |
|---|---|---|---|---|---|---|
| 1 | MERCURY | Living Orbs | `gal-01-mercury` | 4 questions, then email (+ optional text) | success state + next step | `hook-map-bot-gallery/01-mercury-d-2-result.png` |
| 2 | ABSORB | Living Orbs | `gal-02-absorb` | 4 questions, then email (+ optional text) | success state + next step | `hook-map-bot-gallery/02-absorb-d-2-result.png` |
| 3 | FIELD | Living Orbs | `gal-03-field` | 4 questions, then email (+ optional text) | success state + next step | `hook-map-bot-gallery/03-field-d-2-result.png` |
| 4 | SCOUTS | Little Agents | `gal-04-scouts` | 4 questions, then email (+ optional text) | success state + next step | `hook-map-bot-gallery/04-scouts-d-2-result.png` |
| 5 | FOLLOW | Little Agents | `gal-05-follow` | 4 questions, then email (+ optional text) | success state + next step | `hook-map-bot-gallery/05-follow-d-2-result.png` |
| 6 | CREW | Little Agents | `gal-06-crew` | 4 questions, then email (+ optional text) | success state + next step | `hook-map-bot-gallery/06-crew-d-2-result.png` |
| 7 | DESK | Holo-Glass Panels | `gal-07-desk` | 4 questions, then email (+ optional text) | success state + next step | `hook-map-bot-gallery/07-desk-d-2-result.png` |
| 8 | DEPTH | Holo-Glass Panels | `gal-08-depth` | 4 questions, then email (+ optional text) | success state + next step | `hook-map-bot-gallery/08-depth-d-2-result.png` |
| 9 | PROJECTOR | Holo-Glass Panels | `gal-09-projector` | 4 questions, then email (+ optional text) | success state + next step | `hook-map-bot-gallery/09-projector-d-2-result.png` |
| 10 | COMMAND | Guide Strips | `gal-10-command` | 4 questions, then email (+ optional text) | success state + next step | `hook-map-bot-gallery/10-command-d-2-result.png` |
| 11 | TICKER | Guide Strips | `gal-11-ticker` | 4 questions, then email (+ optional text) | success state + next step | `hook-map-bot-gallery/11-ticker-d-2-result.png` |
| 12 | ONE LINE | Guide Strips | `gal-12-one-line` | 4 questions, then email (+ optional text) | success state + next step | `hook-map-bot-gallery/12-one-line-d-2-result.png` |
| 13 | P LOOKS | 3D Guides | `gal-13-p-looks` | 4 questions, then email (+ optional text) | success state + next step | `hook-map-bot-gallery/13-p-looks-d-2-result.png` |
| 14 | MEDALLION | 3D Guides | `gal-14-medallion` | 4 questions, then email (+ optional text) | success state + next step | `hook-map-bot-gallery/14-medallion-d-2-result.png` |
| 15 | LAB | 3D Guides | `gal-15-lab` | 4 questions, then email (+ optional text) | success state + next step | `hook-map-bot-gallery/15-lab-d-2-result.png` |

## Test record (Chromium, 1440x900 and 390x844)
- Every bot, both viewports: zero console errors, no sideways scroll, flow completes to the success state, a bad email shows the inline error first, consent boxes unticked, exactly one lead with the right hook id.
- Reduced motion (1440x900, all 15): see report.
- Safe version (`?safe=1`, sample of bots): see report.
- Accent coverage (tools/cheap-detector.py, #0066FF): worst screenshot 2.84% (limit 5%).
- Clear-glass pixel test (glass layer only): mean difference 2 to 9 of 255, red and blue shifts equal (no tint toward the accent).

## Open compliance points (counsel / owner)
See the compliance review in the session report: families beside goals, pairing lines, clinician / assessment wording versus the standing no-clinician rule, and whether answers may travel with the lead. The `?safe=1` version removes the first three; the fourth needs a consent line the owner picks.
