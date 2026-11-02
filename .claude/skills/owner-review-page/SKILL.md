---
name: owner-review-page
description: MANDATORY every time you show the PEPTICITY owner ANYTHING visual or any decision (pictures, samples, versions, logos, pages, options). Build one review page where he clicks a picture to approve, change or reject it, pins the exact spot, and comments by typing or talking; publish it as an Artifact and OPEN it for him. His answers save by themselves so he never repeats himself.
---
# OWNER REVIEW STANDARD (owner, 2 Nov 2026, locked)
Owner: "I want to be able to click on the image and tell you if I approve it or not or make a comment... every single time you show me anything... I hate repeating myself."

## Every time you show him anything
1. NEVER send only a file, a path or a localhost link. NEVER make him find or open something himself.
2. Build ONE review page with the tool: `tools/review_lib.py` (`render(spec, out_dir)`; example: `tools/build-confirm-page.py`). Spec = pictures (data URIs), choices, short point-form asks. It gives him: click a picture, APPROVE / CHANGE / REJECT, tap to drop numbered pins on the exact spot, comment by typing or TALK, COPY MY ANSWERS.
3. Publish `artifact.html` with the Artifact tool, `capabilities: {"db": {}}`, then `action: "open"` so it opens for him. Reply with the link in the first line.
4. His answers save into the artifact's database (`answers` collection, one document per card, with verdicts, pins and comments). Read them with `ArtifactData` (`action: "list"`, `collection: "answers"`) when he says he answered. NEVER ask him to repeat anything that is already there.
5. If the Artifact tool is not available in your session: build the same page, send it with SendUserFile (display render), and say plainly that his answers need COPY MY ANSWERS.
6. Pictures first, point form, short. QUESTIONS NEVER GO IN CHAT: every question is a step on the owner's board (CLAUDE.md rule 5, https://claude.ai/artifact/QJABMKttNFPFsRMcRkdJw5), with a last option "Fuck off, drop it". Never decide for him.
7. Re-publish the SAME file path to keep the same link when he asks for changes.

## Checks before you send
- Open it in Chromium at 1440x900 and 390x844: no console errors, no sideways scroll, click a picture, approve, pin, comment, and confirm the answer text.
- After the first publish, read `answers` once with ArtifactData and tell him in one line what you tested.
