---
name: common-sense-build
description: Use before and after building ANY PEPTICITY page, card, form, review page or logo placement. The common-sense checks the owner keeps having to repeat - symmetry and one centre axis, no rectangles/squares/pills, one P only, readable light, every box earns its place. Fails the build on a plain rectangle.
---
# COMMON-SENSE BUILD

Owner (7 Nov): "Are you not building a site that should be a little bit symmetrical? Why the fuck would you have this rectangular square? Rectangles, squares and the pill are the ONLY things banned. You have two different Ps side by side and I asked 30 times for the new one with the cutout in the back."

## The checks (run all, every time, on the real rendered page)
1. SHAPES: no rectangles, no squares, no pills. This includes comment boxes, approve/change buttons, inputs, cards, panels, tags, toasts, tooltips and review pages. Allowed: chamfered/cut-corner (clip-path polygon), hexagon, notched ticket, circle (for round things like dots). A box with border-radius 0 or a small radius is a rectangle. Border-radius 999px or 50% on a wide element is a pill.
2. SYMMETRY: the logo, the headline and the main card sit on ONE vertical centre axis (measure the bounding-box centres in a real browser; they must agree within 2 px). Side items mirror each other. Nothing floats off to one side by accident.
3. ONE P: only the new P (the PEPTICITY font's P with the cut-off back, matte gunmetal, one hairline of light; commit 657e023, CLAUDE.md line "LOGO P"). Never two different Ps on one screen. Grep the page for the old mark (p-mark.svg, LOGO_P) and the glyph source.
4. LIGHT: nothing the owner must squint at. Ground is lifted, not black. Text reads at a glance.
5. EVERY BOX EARNS ITS PLACE: if a panel or rectangle sits behind text for no reason, delete it.
6. LOCKED means locked (docs/owner/LOCKED.md), CLAUDE.md rules at the top win over this skill and over any old note.

## Proof
Report a table: element, shape check, centre-axis delta in px, P check, brightness number. Any plain rectangle, pill, off-axis centre delta over 2 px or second P = FAIL: fix before showing.
