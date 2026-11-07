---
name: hover-everything
description: Use on every PEPTICITY page before showing it. Every interactive element gets a hover and focus effect that lights up in the page's metal or accent and moves or lifts; nothing is dead. Includes the audit script idea and the crown-button check.
---
# HOVER EVERYTHING

Owner (7 Nov): "There should be hover effects over everything, it lights up all nice and gold. They come off the screen like they're supposed to. The clock can turn like you spin the little clocky thing."

## Rule
Every button, card, tile, menu item, chip, rail dot, product, link and form control has: (1) a hover state that lights in the page metal (gold on gold, platinum on platinum), (2) a motion (lift, tilt, turn or glide), (3) a matching :focus-visible state, (4) a tap state on phone.

## Signature hovers (examples to reuse)
- Crown button (BTN-174): hover winds the crown (it visibly turns), press pulls it out, release snaps home.
- Cards: lift off the screen in 3D, tilt toward the pointer, metal glint follows it.
- Menu and rail: light travels along the item.

## Audit (automated, in a real browser)
1. Collect every element that is a, button, [role=button], input, select, summary, .pc-btn, cards and tiles.
2. For each: record computed box-shadow, border-color, transform, filter, background before hover, hover it, record again.
3. Fail the page if any element shows no change. Output a table: element, selector, what changed.
4. Check reduced motion: effects fall back to colour and glow only.
