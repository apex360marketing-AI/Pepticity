---
name: owner-precision-mode
description: Use for EVERY owner tweak, note or feedback on something already built or approved (a page, hero, card, film, colour, font, logo, dashboard), and whenever the owner says "just", "only", "a teeny bit", "picky", "exact" or "small change". Makes one exact change at a time, sweeps the small details a picky eye sees, and proves nothing else moved. Builds on surgical-refinement, read-three-times and verify-before-done.
---

# Owner precision mode

The owner is extremely picky and wants a partner who is too. He has been burned by "improvements" he didn't ask for. In this mode, every unasked change is a defect, and every small flaw he can see is a defect.

## 1. Before touching anything
1. **Snapshot** the files (copy them) and take BEFORE screenshots at fixed scroll positions, desktop 1440x900 and phone 390x844.
2. **Write the change list** as numbered items, using his exact words in quotes.
   - Split vague notes into the smallest items you can act on.
   - "A teeny bit" means 10–20%, not 50%.
3. **Mark inferred items.** Anything you inferred and weren't told gets asked about (numbered plain-text options at the end of the message), never quietly done.
4. **One change, one proof.** Make the changes one at a time and check each one before the next. Never batch untested edits.

## 2. While changing
- Use the narrowest selector, value or element that does the job.
- Add new tokens; don't edit shared ones.
- Never move, remove, restyle or reword anything outside the list. Never rebuild a piece to tweak it.
- When a big change is truly needed, STOP and ask first. Say what it is, why, and the smaller alternative.

## 3. The picky sweep (run on every changed area, then on the whole screen)

| Area | What to check |
|---|---|
| Spacing | 4/8 px rhythm; equal gaps; nothing touching an edge; safe areas on phones |
| Alignment | Edges line up; optical centring of icons and 3D type; baselines match |
| Type | Nothing clipped or cut off at 360/390/430 px; no widows; caps tracking even; 3D type not blurred or jagged |
| Colour | Exact hex; glow strength matches the ask ("a hint" stays a hint); no warm, yellow or green cast (brand check) |
| Light | Edge hairlines even; shadows fall one way; no banding in gradients |
| Motion | Easing smooth (no linear pops); durations consistent; no jank or flicker; scroll-scrub frame-accurate; reduced-motion fallback |
| Hover/focus | Every interactive item has an animated hover AND a visible focus; tap targets at least 44 px |
| Glass | Truly see-through; blur consistent; text readable at AA contrast |
| Phone | No sideways scroll; sticky bars never cover forms or buttons |
| Errors | Zero console errors; no 404s |

Fix only the sweep items that fall inside the asked change. List the rest under "NITS I SAW (not touched)" for him to approve.

## 4. Prove it
- **AFTER screenshots** at the same scroll positions. Show before and after side by side (SendUserFile, display render).
- **Diff the snapshot.** Every changed line maps to a numbered item. A line that maps to nothing is undone or declared.

## 5. Report (very little talking)
1. The numbered list, each item marked DONE, with the picture.
2. NITS I SAW (not touched), as numbered options.
3. NOT VERIFIED (plainly).
4. Close with the forward-partner skill's three recommendations.

## Never
- Swap his named tool, font, colour or asset.
- Change more than asked because it "looked better".
- Report done without the side-by-side.
