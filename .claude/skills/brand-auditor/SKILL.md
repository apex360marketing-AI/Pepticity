---
name: brand-auditor
description: Holds the PEPTICITY brand together. Use BEFORE showing or publishing ANY PEPTICITY store change (page, section, card, menu, background, colour, lettering) and whenever the owner says the brand, the blue, the cards, the background or the PEPTICITY lettering "changed", "doesn't match" or "isn't the same". Runs tools/brand-audit.js on the built page in a real browser and blocks the work until it says HELD. Also use when adding any new card, colour or heading so it joins the one rule instead of inventing its own.
---

# Brand auditor (Tyson, 14 Nov 2026)

His words: "I need something that holds the brand together... the same blue throughout the site... the same colours... not changing PEPTICITY and how it looks throughout the site. I want it all to be the same."

## The rule
- The brand is decided ONCE. Nobody restyles it section by section.
- A page that fails the audit is not shown, not linked, not published. Fix first.
- The brand changes only when Tyson says so in so many words. Then change it in ONE place (below) and re-run.

## Run it (every time, before showing)
- `node tools/brand-audit.js <url>`
  - no url = the public store preview, https://apex360marketing-ai.github.io/Pepticity/new/
  - local copy: serve the gh-pages checkout, then `node tools/brand-audit.js http://127.0.0.1:8766/new/`
- Last line must read `RESULT: HELD`. `BROKEN` = fix every FAIL line, run again.
- A NOTE line is told to Tyson in one line. Never hidden, never "fixed" by guessing.
- Paste the result lines into the report to Tyson (short).

## What it holds (store, black version)
| Part | The one answer |
|---|---|
| BLUE | `#2a78ff` (42, 120, 255). Hot core `#cfe6ff`. Every coloured light sits on this hue. No second blue, no violet, no green, no warm colour. |
| METAL | Chrome / gunmetal (`--pep-plat-1..5`). Pale chrome gold is reported as a second metal. |
| CARDS | CLEAR. 0% fill, no blur. The background shows through every card. A card is its chrome edge and its lettering. One thin light on the bottom edge, the same on every card. |
| GROUND | Matte black quilt, a watermark (surface 0.10). No blue at rest, no breathing. The holes light ONLY in a small circle at the pointer (reach 75 px). No blue pools behind sections or cards. |
| MENU | His pick, menu 58, EXACT: the real picture (`new/assets/menu58/`), never a CSS look-alike. Labels are live text in the PEPTICITY lettering. |
| DROP-DOWN | RECOVERY / PERFORMANCE / LONGEVITY / SKIN in the PEPTICITY lettering, lit, each with a thin light under it that tapers to nothing at both ends and is narrower than the word. |
| TYPE | PEPTICITY lettering (`--pep-font-display`) for every heading, key and label. One plain face for small text (`--pep-font-ui`). Nothing else. |
| NAME | PEPTICITY, capitals, the same lettering everywhere. |
| SHAPES | Chamfered corners. Radius 3 px at most. No pills. |

## Where the one answer lives
- Colours and faces: the `:root` tokens in the built page (`--pep-light`, `--pep-light-rgb`, `--pep-plat-*`, `--pep-font-display`, `--pep-font-ui`). Use the token. Never type a new colour.
- Cards: the block `brand/brand-lock.css` (source: `brand/menu58/brand-lock.css`, loaded LAST in the page). `--pep-card-fill: transparent; --pep-card-blur: none;`
- Menu 58: `brand/menu58/` (the pick `menu58-pick.png`, the cutter `slice58.py`, the styles `header.css`).
- The audit's own copy of the rules: `BRAND` at the top of `tools/brand-audit.js`.

## Adding something new
- New card: give it NO fill of its own. Add its selector to `brand/menu58/brand-lock.css` AND to `BRAND.cards` in the tool. Run the audit.
- New light or accent: `rgba(var(--pep-light-rgb), a)` only.
- New heading or label: `font-family: var(--pep-font-display)`, capitals.
- A sheet that opens OVER the page (drop-down, phone menu, cart, guide, pop-up): may keep smoked glass so its words stay readable. Add its selector to `BRAND.notCards`.

## Not allowed
- "Close enough" blue, a tint "just for this card", a glow pool behind one section, a different face for one heading.
- Rebuilding the menu in CSS. It is the picture.
- Turning a FAIL into a pass by loosening `BRAND` without Tyson's say.

## Checks
- [ ] Audit run on the page Tyson will open (public link after publishing, not only local).
- [ ] `RESULT: HELD` on desktop and phone.
- [ ] Any NOTE told to Tyson in one line.
- [ ] Screenshots looked at with my own eyes (the audit does not replace `verify-before-done`).
