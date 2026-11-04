---
name: pepticity-brand-auditor
description: Audit any PEPTICITY or APEX page (dashboard, command center, desk, site, deck) against the owner's brand BEFORE it is shown, published or linked. Use for anything built for Grace / PEPTICITY, whenever the owner says "branding", "doesn't match", "too plain", "wrong P", "audit it", and before handing the owner ANY link. A failing page is fixed, not shown.
---

# PEPTICITY brand auditor

The owner has lost a client's trust when plain, off-brand pages and unchecked links reached him. This skill is the floor every PEPTICITY build must pass. Run it after building and before any link goes to the owner.

## Rule 0: never hand over a link you have not opened
Before listing ANY artifact link, read it (Artifact `read`) and confirm its title and contents match what you say it is. A link list that sent him "Jeff's setup works today" when he asked for Grace's work is the failure this rule exists for. If you have not opened it, do not list it.

## Rule 1: load the house stack first
Attach the `apex-effects-library` repo first (its .claude/skills holds the house style, the Standard and 76 design skills). Load `pepticity-brand-lock`, `apex-house-style`, `apex-standard`, `effect-catalog`, `apex-glassmorphism` before writing CSS. Lesson of 3 Nov 2026: a session without that repo built off-brand work. Run `apex-visual-gate` (a PASS is required) before showing anything.

## Brand spec (source pages, verified 3 Nov 2026)
- **Logo P:** the P glyph traced from the PEPTICITY BLACK font. The SVG path is at viewBox `-0.708 -0.58 1.416 1.16`. Copy it from the `pep-pmark` symbol in CONCIERGE PANEL (https://claude.ai/artifact/MwZfrWKNXkBWozzuqwdmsk) or the P MARK page (https://claude.ai/artifact/QWqvjTfZNE7cGC2QyEHnhp). Never draw a new P, and never use the old chamfered-plate P from the Brand Book or the Orbitron placeholder.
- **Wordmark:** "PEPTICITY" set in the PEPTICITY BLACK font (an embedded woff2 in the same pages). Its P must be the same shape as the logo P. Never Michroma, Orbitron or Syne for the wordmark.
- **P finish:** MATTE GUNMETAL (CLAUDE.md, locked 29 Oct): never white or platinum. Metal runs #080807 to #8E8D85 (gradient e.g. #8e8d85 -> #55544f -> #24231f -> #6f6e68); wall #323232. The approved P is brand/logo/p-mark.svg (ca61e2b) = the LOGO_P glyph in brand/font + sites/dashboard-sample; in 3D, render it with brand/font/type3d-engine.js.
- **Colours:** follow `pepticity-brand-lock` (Pepticity repo) exactly. BLACK version = matte black #0b0b0c-#141416 (or the APEX void #040507 under the liquid-chrome ground) with platinum chrome; UV black only as faint texture, never a purple area. NO violet, NO mint/green, NO chartreuse on PEPTICITY pages (its colour check rejects any hue 90-160), NO rose/pink/peach, NO yellow/amber. Status chips are monochrome: OUT = solid platinum chip, LOW = platinum outline, OK = dim outline. Set the library accent `--apx-accent` to platinum (#e9edf2) so module fallbacks never show chartreuse.
- **House style:** `apex-house-style` + `apex-standard` from the apex-effects-library repo: Arsenal liquid-chrome ground, smoked chamfer glass, 6-10 catalogue effects with codes (use the real modules in design/library/<CODE>/), slow left-to-right hover sweep.
- **Type:** every header is the PEPTICITY STUDIO 3D type (brand/font/type3d-engine.js + glyphs.json, as in sites/dashboard-sample); PEPTICITY BLACK for flat fallbacks and the wordmark; Instrument Sans for body; JetBrains Mono for labels and numbers.

## Material rules (from APEX DESK, neon-glass-ui and the visual gate)
- Every card is see-through glass: fill alpha ≤ .35, blur 8-14px, 1px rim, an inset top highlight and a deep drop shadow. No opaque boxes, no plain rectangles.
- Cut-corner (chamfer) silhouettes, no two cards alike. Radius ≤ 3px. No pills.
- A living ground behind the glass: moving smoke plus light pools. No grid, dot or hex lattice. Check that the body background is transparent so the ground is not painted over (the 3 Nov bug).
- Luminescence: a glow/halo behind the main title, chrome-gradient title text, a pointer torch under the glass, and a one-at-a-time light sweep across cards.
- Watermark: the FULL logo (P plus wordmark), faint, behind everything.
- Liquid-glass motion inside cards (slow conic sheen). Hover lifts the card and lights its edge and labels.
- A 1.5-2.5s entrance loader (`apex-loader`).
- Ship `@supports not (backdrop-filter)` and reduced-motion fallbacks.

## Copy rules
- Title says **COMMAND CENTER** (or the name the owner gives). Never "YOUR command center". No "Good evening, Grace" greetings; a small "GRACE" tag is enough.
- Mark sample data as SAMPLE DATA.
- Never invent product or brand names. Products come from shared/inventory.js (as in the PEPTICITY Studio data).

## Required sections for Grace's Command Center
Desk overview (the opening view; cards open to ~75% frosted), Inbox (email list, reading pane and Concierge drafts), Inventory (all products, low/out status, waitlist, search and filter), Orders, Customers, Concierge (approvals, jobs, log, kill switch), Calendar, Money.

## Audit procedure (every time)
1. Rule 0 for every link.
2. Run apex-visual-gate at 1440 and 390. Fix every FAIL. Never loosen a threshold.
3. Run the pepticity-brand-lock pixel colour check (0 fails) on desktop, phone and every open view. Screenshot desktop and phone, look at them yourself, and check: logo P whole and matching the wordmark P? Ground visible through the glass? Text readable over the brightest smoke? Title glowing? Watermark present?
4. Click every nav item and card. Each view must open and close (Esc) with zero page errors.
5. Report in plain words: what passed, what you fixed, and any open question (e.g. platinum vs gunmetal).
