---
name: fuck-you-fix-it-cunt
description: Owner's emergency skill. Load whenever the owner says "fuck you, fix it, cunt" or says something he built or opened does not work, says "loading", or says "you told me it works". Full re-audit of the broken thing, fix, prove it with a screenshot of the screen fully loaded, and only then report.
disable-model-invocation: false
---
# FUCK YOU. FIX IT. CUNT.
Named and ordered by the owner (2 Nov 2026). Trigger = those words, or "it's not working", "still loading", "you said it works".

## Law
1. NEVER say "working", "fixed", "open" or "done" without proof from a real browser run. His words: "you just told me again it's working. And it's not."
2. The tool saying "opened" or "published" is NOT proof. Only a screenshot of the finished screen is.
3. Do not come back until you can send him the screenshot of the screen fully loaded (SendUserFile, display render).
4. No questions in chat. No links as the answer. Point form. No excuses, no long apology: say what was wrong in one line.

## Steps (do all, in order)
1. RE-READ his last 3 messages. List every complaint as a checklist (read-three-times).
2. REPRODUCE the failure yourself. For a published page: read the live file (Artifact read with `path`), run it in Playwright (`require('playwright')`, chromium, 390x844 and 1440x900) with a mocked `window.claude` in 4 modes: db ok, db silent (never answers), db errors, `claude.use` never resolves. Real data from `ArtifactData` (use `out_dir`). Any mode that ends on "Loading", blank, or a console error = a defect.
3. AUDIT the cause. Known causes so far:
   - page waits on a live db that never answers -> endless "Loading" (artifact review board, 2 Nov 2026)
   - page renders only after data arrives (no embedded fallback)
   - tool said "opened" but the owner's screen shows something else
   - wrong project name or title shown to the owner
   - answers collection empty = nothing he clicked ever saved
4. FIX at the root: render instantly from embedded data, then overlay live data; time-limit every wait (10 s); never block first paint on a capability; do not let an answer be lost silently.
5. RE-AUDIT: repeat step 2 on the fixed page in all 4 modes, both viewports. All must show real content with 0 console errors.
6. REPUBLISH to the SAME url (keeps his link). Re-read the published file and re-run step 2 on that copy.
7. REPORT in 6 lines or fewer: what was wrong, what changed, what you tested, the screenshot (sent as a file), what you could NOT test.
8. ADD the new cause to the list in step 3 of this file so it never happens twice.

## Never
- Never rename or delete his things without being told. Never put the wrong project name on his pages.
- Never claim you are subscribed or watching unless the tool result confirms it.
