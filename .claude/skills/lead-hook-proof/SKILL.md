---
name: lead-hook-proof
description: Use before showing or publishing any PEPTICITY page that has a form, quiz, call-back, bot capture or exit card. Tests every hook end to end in a real browser and outputs a hook map with a screenshot per screen. This site is a lead magnet; a hook that does not work loses leads.
---
# LEAD HOOK PROOF
Owner: "It's got to be a lead magnet. It's got to just do nothing but collect leads, and make sales." Pairs with hook-architecture, capture-forms, pepticity-lead-engine.

## For EVERY hook on the page
1. List it: hook id, type (email / phone / quiz / bot / exit / refer), where on the page (screen number), what the visitor gets.
2. Test in Chromium at 1440x900 and 390x844:
   - field is reachable by keyboard, label present, inline validation works
   - CASL consent box starts UNTICKED and is single-purpose (email and text separate)
   - submit shows the success state AND a next step
   - the payload carries the hook id (check the preview payload)
   - works with autoplay blocked, slow network, and reduced motion
3. One clear ask every 1 to 1.5 screens, never two competing asks on one screen, nothing covering the reading text.
4. Never any product names or prices on the public pre-gate pages.

## Output
`docs/owner/hook-map-<page>.md`: table of hooks (id, screen, ask, result) plus one screenshot per hook. Fail the page if any hook fails a check.
