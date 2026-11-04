---
name: visual-reference-lock
description: Look at the owner's reference images with your own eyes before designing, turn them into a locked visual DNA, and compare your rendered screenshots against them before showing anything. Use whenever the owner sends or mentions images, screenshots, "make it look like this", "see what I mean", mood boards, or when building anything for a project that has a design/references/<project>/ folder.
---

# Visual reference lock

The owner judges by eye. Text descriptions of his references lose the look. Always SEE them.

## 1. Save every reference the moment it arrives
- If an image only exists in the chat (no file under the session's images folder), say so in one line and ask for a re-upload so the real file can be saved.
- Copy each uploaded image into `design/references/<project>/NN-<what-it-shows>.<ext>` (keep the original format).
- Never paraphrase an image instead of saving it.

## 2. View them — with the Read tool, every time
- Before designing, Read every image in `design/references/<project>/` so you actually see it. Do this at the start of every session that touches the project, even if you saw them before; memory of an image is not the image.
- Do not rely on alt text, filenames or a previous summary.

## 3. Notes are only an index — never a substitute
The image file is the reference. Never save a written description or "pattern" in place of an image. Notes may sit beside the files; they never replace them. In `design/references/<project>/VISUAL-DNA.md`, per image, record what you SEE in concrete, buildable terms:
- Light: where it comes from, colour, how edges glow, glints/flares.
- Material: glass (clear? etched? edge-lit?), metal (polish level, colour temperature, bevel shape), surfaces.
- Shape & layout: pane shapes, layering/depth, perspective, framing hardware (clips, bezels, bolts).
- Colour: sampled hex values (sample them — `python3 -I` with Pillow on the file — never guess).
- What the owner said about it, verbatim, including what NOT to take from it.
Then a "LOCKED" section: the non-negotiables distilled across all references.

## 4. Build, then compare by eye
- Screenshot every option/section you build (Playwright, 1440 and 390).
- Read the screenshot AND the matching reference image in the same turn and compare them side by side: light, material, colour, depth. Write one line per option: what matches, what is off.
- Fix what is off before sending. If an option does not visibly echo its reference, it is not done.

## 4b. Prove it on request
When asked to show you see an image, rebuild it in code to match it as exactly as possible (composition, camera angle, materials, colours, lighting), then show your render beside the reference.

## 5. Keep it
- Add one-line lessons to `.clawness/memory.md` when the owner corrects a look ("that gold, not that gold").
- Brand rule changes the owner states go into CLAUDE.md "Brand colors" with the date.
