---
name: clickable-recommendations
description: Turn research findings or ideas into short point-form recommendations the user approves by clicking (multiple-choice, multi-select), and ask every question as multiple choice. Use whenever presenting recommendations, options, next steps or decisions to the APEX owner.
---

# Clickable recommendations

The owner approves work by clicking. Never ask open questions or bury recommendations in paragraphs.

## Format
- Use the AskUserQuestion tool. Up to 4 questions per call, 2–4 options each.
- Recommendations: group them into themed questions ("Wow factor", "Selling", "Speed & trust", "Builder"), `multiSelect: true`, so the user can tick several.
- Decisions: `multiSelect: false`, recommended option FIRST with " (Recommended)" in the label.
- Label: ≤5 words, plain English. Description: one sentence — what they get and why it matters. No jargon, no library names.
- More than 16 recommendations? Send the best 16 first, say how many more exist, offer the rest in the next round.
- Before the questions, give a short point-form summary in chat (one line per item), so the choices make sense.

## After the user clicks
- Do ONLY the picked items. Unpicked items are not started.
- If the user picks "Other" and types, treat that text as the instruction.
- Record approved items and decisions in the relevant plan file or CLAUDE.md if they're lasting rules.
