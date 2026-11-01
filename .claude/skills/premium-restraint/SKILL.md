---
name: premium-restraint
description: Use on EVERY PEPTICITY visual change, before showing the owner anything. The $20-50k look rulebook plus a cheap-detector script. Colour is an accent only (edges, glints, key words, focus), never a fill. Fails any screenshot where accent covers too much of the screen.
---
# PREMIUM RESTRAINT (owner, 1 Nov 2026)
Owner: "The only color you're supposed to see is like accents... it's gonna look cheap as fuck... this is supposed to look like a $20,000 to $50,000 website."

## Rules
- Accent colour = thin lit edges, small glints, glow on the main button, key words in reading text, focus rings. Nothing else.
- NO colour fill inside glass. NO tinted glass. NO coloured light pools behind cards. NO big flat colour areas.
- Accent budget: at most 5% of the pixels on any screen (check with the script below). Target 2 to 4%.
- One hero moment per screen. Space is the luxury: generous margins, few elements.
- Max 2 type families plus the PEPTICITY BLACK display face. No pills. No emoji icons.
- Motion is slow and weighted. Nothing flashes. Exits faster than entrances.
- If in doubt, take colour OUT.

## Check (mandatory before showing)
1. Screenshot the page at 1440x900 and 390x844 in the version's accent.
2. Run: `python3 tools/cheap-detector.py <screenshot.png> <accent-hex>`
3. FAIL (over 5%) = reduce fills and glows, re-shoot. Show the number in the report.
4. Also look at the picture: would it pass for a luxury brand site? If it looks "colourful", it fails.
