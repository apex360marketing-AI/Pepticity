---
name: award-jury-review
description: Critique any APEX page, design option or artifact like an Awwwards/CSSDA/FWA jury BEFORE the owner sees it — weighted Design 40 / Usability 30 / Creativity 20 / Content 10 scoring with concrete anchors, a template-smell detector, the "signature moment" test, APEX brand pass/fail gate, developer checks, a fresh-eyes reviewer that sees only screenshots and video, and a fix-and-rescore loop. Use after quality-gate passes and before sending any link, screenshot or option set to the owner, or when asked "is this award level?", "critique this", "why does this look cheap?".
---

# Award-jury review

`quality-gate` proves a page **works**; this skill judges whether it is **exceptional**. Nothing reaches the owner below the bar. The scores are internal; never present them as real Awwwards scores.

## 1. Gather evidence (Playwright, `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`, swiftshader flags)
- Screenshots: desktop 1440×900 at the top, 3 mid-scroll stops and the bottom; phone 390×844 at the top and 2 stops; hover and focus states of the main CTA and a card; one mid-transition frame.
- Video: `recordVideo` of a 12s scroll from top to bottom at a human pace (wheel steps), plus 4s of pointer movement over the hero.
- Facts: the quality-gate summary (errors, LCP, CLS, axe), fonts in use, palette (computed colours), and the effect codes on the page.

## 2. Fresh eyes (avoid author bias)
Spawn a reviewer subagent that receives ONLY the screenshots, the video path and this rubric, not the code or the brief's excuses. Ask it to score, and to name the single strongest and the single weakest moment. Average its scores with yours, and if they differ by more than 1.0 in any category, look again.

## 3. Rubric (score 1–10 each; weighted total = .4D + .3U + .2Cr + .1Co)
| Category | 10 looks like | 6 looks like |
|---|---|---|
| **Design (40%)** | Distinct art direction; type with real scale contrast; composed grid with deliberate breaks; a disciplined palette (dark near-neutral + small glow); every detail aligned; materials (glass, chrome) convincing | Tidy but generic; equal-sized sections; safe type; a few near-misses in alignment |
| **Usability (30%)** | Clear in 5 seconds; obvious next step; smooth at 60fps; works at 390px; keyboard and reduced motion first-class; fast LCP | Pretty but confusing; motion delays reading; mobile is an afterthought |
| **Creativity (20%)** | A signature moment people would screen-record; motion with one personality; the concept ties to the business (e.g. diving into a city to a lit window = a lead arriving) | Known effects stacked; nothing to remember |
| **Content (10%)** | Plain, specific, sourced; copy and visuals tell one story; placeholders clearly marked | Vague, hypey or filler copy |

**Bar to show the owner:** a weighted total ≥ 8.0 with no category below 7.5, AND the brand gate passes, AND quality-gate has no FAIL.

## 4. Brand gate (any fail = not shown)
- No gold, amber, mustard, champagne or yellow; no green outside Field Guide (run `banned()` from `design-tokens-theming`). Chartreuse appears only as a sparing accent.
- Backgrounds dark and near-neutral (or the Field Guide light page); there are no big areas of saturated colour.
- Icons and hero objects are real 3D (WebGL), never emoji or flat icons.
- No invented stats, testimonials, guarantees or client counts. Placeholders are listed.
- It is not based on The Machine. In an option set, the options differ in palette, layout, fonts, menu, scroll and motion personality (check the uniqueness matrix against the screenshots).

## 5. Template-smell detector (each hit costs Design or Creativity at least 0.5)
- A centred hero, three equal feature cards and a logo strip.
- Inter, Roboto, Poppins or Montserrat as the display face.
- The same fade-up on every element; `ease` timings; everything animates at once.
- A purple/blue gradient blob background, or a generic stock-icon set.
- Every section the same height and structure; every image 16:9.
- A glass card with no visible background behind it (the glass reads as grey).
- Buttons that are plain rounded rectangles with no material or state design.
- Lorem ipsum, "Learn more", "Solutions", emoji.

## 6. The three questions (answer in one sentence each)
1. **Signature:** which single moment would someone screen-record? If you can't name one, Creativity is ≤ 6.
2. **First 5 seconds:** what does a business owner think this offers? If they would get it wrong, Usability is ≤ 6 and Content is ≤ 6.
3. **The weakest screenshot:** which frame looks cheapest, and why? Fix it first.

## 7. Report and loop
```
Page: <name>   Weighted: 8.3  (D 8.5 · U 8.0 · Cr 8.5 · Co 8.0)   Brand gate: PASS   Quality gate: PASS
Signature: <moment>   Weakest: <frame + reason>
Top 3 fixes: 1… 2… 3…
```
Fix the top 3, re-run quality-gate and this review, and repeat until it clears the bar (maximum 3 loops). If it still doesn't clear, scope down: remove the weakest section rather than shipping it less polished. Record the final scores in the page's notes and give the owner the plain-English summary (signature moment, what changed), not the numbers.

## Do / don't
- DO judge from screenshots and video at real size, not from the code.
- DO compare against the owner's favourites (The Descent, Frame by Frame). A new page should be at least as strong.
- DON'T inflate scores to ship. DON'T fix by adding more effects; restraint usually scores higher (one strong concept beats many tricks).
