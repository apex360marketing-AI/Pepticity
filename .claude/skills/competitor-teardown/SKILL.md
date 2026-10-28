---
name: competitor-teardown
description: Reverse-engineer the top competitor websites in a market (lead capture, hooks, funnel, pricing, compliance risk, what works and what fails) and turn it into a point-form playbook. Use when the owner asks to research, reverse engineer or "pick the top N sites" for any client (PEPTICITY first), or for a quarterly re-run.
---

# Competitor teardown

## 1. Pick the sites (say why each made the list and which were rejected)
- Rank by evidence: search visibility for the market's money terms, review counts (Trustpilot, Google, BBB), press, ad volume, social following.
- WebSearch is US-based; for another country say plainly that live local rankings were not verified and rank on reviews and press instead.
- Prefer a mix: the closest model to the client, the biggest consumer seller, and one cautionary example.
- Drop sites that are offline, seized or under injunction, but name them: they are lessons.

## 2. For each site, capture with evidence (URL for every fact, screenshots in the scratchpad)
1. Model and prices.
2. Lead capture: every way they get a name, email or phone (popups with timing and offer, quiz gating, discounts for email, SMS, lead magnets, chat, accounts, waitlists, exit intent, footer, referral, abandoned-cart). Note exact wording and whether consent boxes are pre-ticked.
3. Hooks: headline, hero promise, proof, urgency, guarantees, subscription framing, trust badges.
4. Funnel: every step from landing to payment; where the email is asked relative to the quiz.
5. Compliance: what keeps them safe and what puts them at risk; search news for regulator action.
6. Working (evidence) and failing (complaints, reviews, shutdowns).
7. One thing to steal, one to avoid.
Use WebFetch first; if blocked, Playwright (`require('playwright')`, `chromium.launch()`), walking the quiz step by step with screenshots.

## 3. Turn it into the playbook (point form, plain English)
The goal; the comparison table; what works / what fails; how we stay out of trouble; every capture point; hooks; funnel and sequences; page-by-page plan; effects; skills/agents needed; build order; top recommendations; decisions for the owner. Publish as a page, then stop and wait for the owner's go.

Never present an unverified number as fact. Never name internal vendors or pricing on a page the client's customers could see.
