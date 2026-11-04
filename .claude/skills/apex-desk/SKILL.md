---
name: apex-desk
description: Build the APEX DESK - the owner's cinematic command room (night penthouse, the liquid chrome-gold marble desk, a throne chair facing the city, a floating rotating gold globe, see-through glass cards that are real working tools, APEX in the ARSENAL letters lit in the floor) and other sites built the same way. Covers the stages he wants (Higgsfield stills first, mix-and-match rounds, then the live build), the scene rules, the working-card system (open to 75% frosted, right-click to assign any app, card SETS you flip between), hover effects, colour rules and the quality gates. Use whenever the desk room, its cards, chair, globe, floor logo or a "site like the desk" is touched.
---

# APEX DESK

The owner, 1 Nov 2026: "I want to be able to put my whole entire workflow into this, each one of them being a different screen ... make it extraordinarily unique." This skill records HOW we build it so any session (and any future "site like the desk") follows the same path. It is a living file: update it at the end of every round with what the owner approved or rejected.

Pairs with: `holo-glass-ui`, `liquid-chrome-gold`, `apex-house-style`, `glyph-reference-match`, `threejs-real-3d`, `premium-micro-interactions`, `apex-command-center`, `quality-gate`, `award-jury-review`. For show-off builds also load `apex-grandioso`.

## 1. Stages (always in this order, one thing at a time)
The owner: "We'll do one thing at a time here. I want to get this dialed in." Never jump ahead.
1. **Look first, in Higgsfield stills** (cheap, fast). 8-10 versions per round, `gpt_image_2_5`, 16:9, high, 2k, real reference images passed as `image_references` (never a text description of his images). Every version genuinely different in the thing being explored; keep everything he already approved.
2. **Mix-and-match rounds.** He picks parts by number ("chair from 5, background from 8"). Next round uses the chosen images as references (pass the Higgsfield job id as the media value). Number every image, show a labelled contact sheet AND each image full size AND the direct links, then ask numbered multiple-choice questions in plain text.
3. **Interaction samples.** Before building any hover/motion into the room, show 4-5 short samples of that one effect (e.g. desk liquid ripple) on its own.
4. **Live build** into the room artifact (`design/desk/hall/`, room https://claude.ai/artifact/XzGHEMaVmdnhi4mHhmAG6R). Sample one card or one effect first, then roll out.
5. **Wire the cards to real tools** (section 5), audit 3-4 rounds, then show.

When he says "don't touch X right now", X is frozen (1 Nov: the desk is frozen; only the chair, globe, cards, logo and floor change).

## 2. The scene (approved so far, 1 Nov 2026)
- **Room:** night penthouse, floor-to-ceiling windows, city skyline behind (background from v10 #8, `design/desk/v10-concepts/v08.jpg`), polished black marble floor.
- **Desk:** the black-marble liquid chrome-gold desk from `design/references/liquid-glass/03-apex-desk-room-plate.png`. NEVER redesign it. Close to camera, grand, "in your face".
- **Chair:** tall throne-like chair, top of the back just under the globe, smoked marble-glass, a teeny bit transparent. FACING THE CITY: we always see the BACK of it. On a unique rolling base in liquid glass (looks like it rolls, never an office-chair star base). Favourite: v10 #5; also liked v10 #6 (crystal) and #7 (egg).
- **Globe:** liquid chrome-gold hologram (pale gold of the loved reference `design/references/liquid-glass/01-gold-chrome-liquid-glass-panels.png`), bigger and more expansive, floats ALONE (no card behind it). Rotates very slowly. Its orbit ring spins on a different tilt so it never lines up with the globe. The ring very slowly shifts colour: lemon-chartreuse, then blue, then purple, then back (one of the only colour spots on screen).
- **Cards:** separate see-through glass cards, cut corners (keep the corners), never one big wall. Symmetric: three per side, none in the centre. On each side the tops follow ONE straight, even, steady slope, no card phasing into another; outer cards turned slightly outward. Every card flat and undistorted (v10 #8 had a warped left card: check for this every render).
- **Floor logo:** APEX in the real ARSENAL letters (`design/references/desk/apex-arsenal-wordmark.png`, from `design/archive/font/`). Flat, read straight on, inlaid in the floor in front of the desk, lit from UNDERNEATH, classy. Never a made-up font. Light colour is open for exploration (platinum, gold, violet, sapphire edge, prism, chartreuse hairline).

## 3. Colour
- Black, graphite, platinum and pale chrome-gold do the work. Blue only as thin, tight lines ("too much blue" on 1 Nov). Neon chartreuse #d4ff3a only as teeny accents.
- A little colour is welcome in charts and the globe ring (soft blue, violet, chartreuse), never big fields of colour.
- Never orange, mustard or champagne gold (only the pale chrome-gold), never green fields.

## 4. Hover and motion (to sample, then build)
- **Chair hover:** a very thin, tight, classy blue line hugging the chair's exact silhouette (an outline that follows the shape, not a box or a glow cloud). Fades in on hover only.
- **Desk hover:** the liquid glass moves like THICK water: slow, heavy, viscous ripples that follow the pointer and settle (think honey/mercury, never splashy water). Sample 4-5 versions first.
- **Globe:** slow rotation always; ring on its own axis; slow colour drift (minutes, not seconds).
- **Cards:** charts and numbers are animated and live, never static pictures.
- Reduced motion: hold still, keep everything readable.

## 5. Cards are real tools (the system)
- **Open:** click a card and it grows to ~75% of the screen, turns frosted (still a little see-through), un-angles, and becomes the work area. Close with X or Esc; it can be resized.
- **Assign anything:** right-click (or long-press) a card to set what it shows: Claude session (type prompts and run work), Gmail, calendar, trading charts, sports, a site, a repo, files, notes. Whatever he wants.
- **Card SETS:** several full sets of cards (e.g. BUILD, CLIENTS, MARKETING, TRADING). A button at the top, in the house style, flips all cards to the next set with a flip animation. As many sets as he wants.
- **Swap across sets:** right-click a card in a back set and "swap with" a card in the front set.
- **Projects:** each set can be tied to a repo or a project with no repo yet (see the PROJECT DECK plan: one Claude session and one worktree per live project, tabs glow when an agent needs him).
- Everything saves (artifact `db`), so his layout is there next time.

## 6. Quality gates (every round)
- Look at every render before sending: chair facing the city? globe free of cards? cards flat, symmetric, even slope? real ARSENAL APEX? blue kept thin? desk unchanged?
- Be honest about misses in the reply (e.g. "the layouts came out too alike").
- Live builds: Playwright screenshots desktop + phone, 3-4 audit rounds (function, visual, accessibility, performance), no localhost links.

## 7. Delivery format
- Contact sheet (numbered) + each image full size via SendUserFile, plus a table of direct links.
- Short point-form summary of what changed and what missed.
- Questions go on the owner's review page as steps (see CLAUDE.md), never in chat.

## 8. Round log (append each round)
- v9 (31 Oct): 10 layouts. Owner liked #9 (full wall) most; wanted separate cards, chair facing the screens, gold globe, real logo, less blue.
- v10 (1 Nov): 8 versions from #9. Liked #6, #7, #8; chair #5 favourite; background #8; fix warped card, even slope, no centre card, bigger rotating globe.
- v11 (1 Nov): 8 versions mixing the background from #8 and the chair from #5 with liquid-glass rolling bases, logo light and floor variations.
- v11 verdict (1 Nov): owner picked #1 (throne, warm-white APEX) with the cards from #7. Ring: purple + blue + a touch of teal, never yellow. Chair a little right of centre, turned slightly toward the desk, opening the skyline. Add mirrored chrome-platinum statues either side of the desk. Globe must spin and be interactive (nodes, classy, not busy).
- v12 (2 Nov): 4 rooms (wave columns, lions, eagles, APEX monoliths) + 20 statue designs in design/desk/v12-concepts/. Screens plan + 10 ideas on the tracker.
