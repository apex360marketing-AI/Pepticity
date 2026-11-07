#!/bin/sh
# UserPromptSubmit hook (owner, 7 Nov): re-read the owner's rules on EVERY prompt, whatever it costs.
# Whatever this prints is added to Claude's context for that prompt.
R="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
echo "=== OWNER RULES, RE-READ ON EVERY PROMPT (do not skip) ==="
awk '/^# PEPTICITY: LOCKED DECISIONS/{p=1} /^## OWNER RULES|^# THE OWNER|^# PEPTICITY/{p=1} p' "$R/CLAUDE.md" | head -140
echo "=== LATEST ASKS (last 12 lines of the request ledger) ==="
tail -12 "$R/docs/owner/REQUEST-LEDGER.md" 2>/dev/null | cut -c1-300
cat <<'T'
=== BEFORE YOU REPLY: DO ALL OF THESE ===
1. Re-read the owner's message 3 times; list EVERY ask in point form; do all of them; tick each with evidence.
2. Questions go on the board as steps, never in chat. Open the board and any changed page after every change.
3. Shapes: no rectangles, squares or pills; symmetric; ONE P (the new font P with the cut-off back).
4. Colour: never black-and-white or dark; run tools/colour-check.py on the rendered page.
5. Hover effects on everything. Working clickable pages, never screenshots only.
6. Locked means locked; Claude makes no decisions; never revert an owner order.
7. Skills to load: read-three-times, owner-accountability, common-sense-build, colour-sense, chrome-metal-pop, hover-everything, clickable-preview, verify-before-done.
T
