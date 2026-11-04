---
name: apex-standard
description: THE APEX STANDARD — the owner's "go all the way" build mode. When the owner says "the APEX Standard" (or "Apex standard", "do it to the standard", "full send", "next level"), every page, site, artifact or effect is built with the whole APEX skill stack, the effect catalogue, client-capture hooks, and every quality gate, with no shortcuts and no "lighter version". Use whenever that phrase appears, and for any client site, showcase page or sales asset that will be shown to prospects.
---

# THE APEX STANDARD

The owner's words: "when I say the APEX Standard, that's when we hammer down and everything gets done. We grind it so it's so sweet. It has so many hooks for collecting clients. It has our skills built into it. We take our time and make it next level. No one else builds it like this."

So the APEX Standard is not a style. It is a **process with gates**. Nothing ships until every gate below has passed and been proven in a real browser. The repo's `CLAUDE.md` rules (brand colours, CAPITALS headings, no invented stats, sample first, show don't bury) always apply. They beat any synced skill that disagrees, for example a skill with a different palette or a "no pill buttons" rule written for another brand.

---

## 0. CONTRACT (before a single line)
| Step | Skill | Output |
|---|---|---|
| Lock what is being built and what it is not | `anthropic-skills:apex-build-contract` | A 5-line contract: audience, the page's one job, deliverable, out of scope, done-when |
| Read the owner's rules | `CLAUDE.md` | Brand bans checked (no gold/amber/mustard, no green except the one approved page, classy dark grounds) |
| Owner sent images? | `visual-reference-lock`, `reference-eyedropper`, `liquid-glass-studio` | Images saved to `design/references/<project>/` and opened with Read. Never a text description in their place |
| Studying a site they like? | `apex-design-capture` | Evidence pack. Study it, never copy it |
| Pick a skill for every part | Check `.claude/skills`, the synced skills and the plugins | A table of part → skill. If a part has no skill, **create the skill first** |

## 1. FOUNDATIONS (the system everything hangs on)
- **Tokens:** `design-tokens-theming`. Only the `--apx-*` contract, OKLCH palette, banned-hue check passed, contrast AA.
- **Type:** `modern-typography`. A distinctive pairing (never Inter or Space Grotesk as a safe default). Every heading in CAPITALS with letter-spacing. Brand names in capitals (APEX 360, PEPTICITY).
- **Layout:** `layout-composition`. A named grid that is not "centred hero + three cards". Container queries so modules fit any slot.
- **Motion language:** `motion-design-system`. Name the motion personality, set duration and easing tokens, exits faster than entrances, and an always-visible motion toggle.

## 2. SIGNATURE MOMENTS (where the awards come from)
Choose the effects from the catalogue first. Build new ones only when nothing fits, and give every new one a code.

**The site recipe: 6–7 effects make a good-sized site. 10 is the maximum.** More than 10 makes it noisy and slow. One effect per slot:

| Slot | Catalogue | Build skills |
|---|---|---|
| Entrance / loader | LDR, TRN | `anthropic-skills:apex-loader`, `page-transitions` |
| Menu | NAV | `premium-micro-interactions` |
| Hero object or background | OBJ, BGD | `threejs-real-3d`, `3d-asset-pipeline`, `photoreal-product-site`, `webgl-shader-backgrounds` |
| Scroll story (the signature) | SCR | `gsap-scroll-choreography`, `css-scroll-driven-motion`, `exploded-layers-3d`, `anthropic-skills:cinematic-scroll` |
| Moving type | TXT | `modern-typography` |
| Cards and layout | CRD, LAY | `apex-glassmorphism`, `chrome-lift-icons`, `layout-composition` |
| Buttons and hovers | BTN, HOV | `apex-glassmorphism`, `premium-micro-interactions` |
| Lead form | FRM | `conversion-ux` |

Rules:
- Industry icons and hero objects are **real 3D** (extruded, metal or glass, reflections), and they react to scroll and pointer. Never emoji or flat icons.
- Products are **photoreal** (Higgsfield stills or film, or a real GLB). Never a hand-drawn three.js bottle as the hero.
- Glass is **real**: low fill, 8–14px blur, a 1px rim, a lit ground behind it.
- Only ONE live WebGL context at a time where many demos share a page.
- Every effect has a reduced-motion version that still looks finished.

## 3. CLIENT-CAPTURE HOOKS (the money)
A page built to the APEX Standard carries **at least 4 of these**, with one primary action per screen. All of them must be honest (`conversion-ux` §4: no fake counters, no countdowns, no invented reviews).

| # | Hook | Skill | Note |
|---|---|---|---|
| H1 | One primary CTA above the fold (verb + outcome), repeated at the end of each major section | `conversion-ux` | It passes the 5-second test |
| H2 | Sticky phone bar: primary CTA + call button | `conversion-ux` | Hidden while the keyboard is open |
| H3 | Multi-step quote or "check my area" form, step 1 already ticked | `conversion-ux`, FRM-102 / FRM-104 | Ask only for what is needed to act |
| H4 | "Build your own" picker: visitors pick effects, plans or services into a tray and send it | `taste-test-ux`, `showcase-gallery`, `decision-board` | Shareable link, copy-ready summary |
| H5 | Guided quiz → result → booking | `guided-quiz-funnel` | Health sites: safety hand-off and disclosure |
| H6 | Sample-lead preview (a real example marked **Sample**) | CRD-101 / CRD-113 / CRD-114 | It shows the product, not a promise |
| H7 | Local data story: the value of a lead and peak months, sourced | `data-story-stats` | No invented numbers; placeholders are marked |
| H8 | Call-back request (one field) | FRM-103 | The success screen says what happens next |
| H9 | "Email me this" / save-for-later (contact asked AFTER the value is shown) | `taste-test-ux` | Unticked consent box with placeholder wording |
| H10 | Privacy-safe events on every hook (`cta_click`, `form_start`, `form_submit`) | `conversion-ux` §6 | Never send field values |

Inside a Claude Artifact a page cannot post to an outside server. Outside visitors cannot write to the artifact's database either. So in an artifact, hooks H4, H8 and H9 end in a **copy-ready message + a shareable link + the studio contact shown as text**, and they save to the `db` capability only for signed-in team members (an in-person demo on the owner's tablet). Say this plainly to the owner. A real form backend comes with the live domain.

## 4. WORDS
- `ux-writing-microcopy`: plain English a business owner gets in 5 seconds. Labels say exactly what happens.
- Regulated industries (health, peptides, finance, legal): `anthropic-skills:regulated-claims-check` (plus `peptide-regulatory` for PEPTICITY).
- No invented stats, testimonials, guarantees or client counts. Use `[placeholders]` and list every one to the owner.

## 5. GATES (all must pass, in this order)
1. **`quality-gate`**: phone and desktop screenshots, no page errors, no sideways scroll, axe has no serious issues, LCP ≤ 2.5s, CLS ≤ 0.1, reduced motion checked.
2. **`ui-ux-testing`**: every control operated by mouse, touch and keyboard; focus visible; targets ≥ 44px.
3. **`anthropic-skills:site-audit-harden`** (or `audit-and-harden` for code): audit → fix → audit again. It is not clean without the second pass.
4. **`award-jury-review`**: score Design 40 / Usability 30 / Creativity 20 / Content 10. The page needs a **signature moment** and no template smell. Below 8.0, fix and rescore.
5. **`anthropic-skills:build-report`**: verify by sabotage. Break the thing on purpose, confirm the check catches it, then restore.

## 6. CATALOGUE EVERY NEW PIECE
- `effect-catalog`: a code and name, added to `design/effects.json` AND the effects library (module + demo + recorded preview). Tag sections with `data-fx`.
- `showcase-gallery`: add the finished design to the showcase phones.

## 7. DELIVERY TO THE OWNER
- **Sample first:** apply any change to ONE item, show it, then roll it out.
- Show every visual as a rendered picture in the chat (SendUserFile, display render) plus the published link. Never end that message with a question dialog. Ask the follow-up later or in plain text.
- Questions are always multiple choice. Recommendations are click-to-approve lists.
- Commit and push to the working branch. Report what passed, with numbers, and what could not be verified.

---

## DEFINITION OF DONE (copy this into the reply)
```
APEX STANDARD — <page name>
[ ] Contract written                     [ ] Tokens + type + layout + motion set
[ ] 6–10 catalogue effects, 1 per slot   [ ] Signature moment named: ______
[ ] ≥4 client-capture hooks: H_ H_ H_ H_ [ ] Words plain, placeholders listed
[ ] quality-gate passed (LCP __s, CLS __, axe 0 serious)
[ ] ui-ux-testing passed                 [ ] audit → fix → re-audit clean
[ ] Jury score __/10 (≥ 8.0)             [ ] Sabotage check done
[ ] New effects catalogued (codes: ___)  [ ] Screenshots shown + link sent
```
