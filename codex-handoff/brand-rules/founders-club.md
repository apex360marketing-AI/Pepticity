---
name: "founders-club"
description: "Design and build a numbered, exclusive founding-member programme for a store (for PEPTICITY: FOUNDERS RESERVE, PLATINUM, 25 numbered members): how a member qualifies, the perks, the card, the members' page, the sign-up form, honest scarcity and the rules for referrals and consent. Use when building or changing a founders club, VIP tier, member card, referral reward, or the page and form that sell it."
---

# Founders club: exclusive because it is real

Exclusivity sells only while it is true. Every number, deadline and perk on the page must
be backed by real data; a fake counter is a brand risk and, in Canada, a deceptive
marketing practice. Build the programme so the scarcity is real and provable.

## 1. The programme (owner-approved shape; change only with the owner's yes)

- Name: **FOUNDERS RESERVE**; the card says **PLATINUM** across the top, in the same
  chrome-and-blue finish as the PEPTICITY word.
- Exactly 25 members, numbered `No. 01 of 25` to `No. 25 of 25`, in joining order. A number
  is never reused.
- Tiers (owner, Nov 15): the first 25 are the **PLATINUM RESERVE**. Only once all 25 are
  full does a **GOLD RESERVE** open for members 26 to 50. Never show or sell Gold before
  Platinum is full; the page always shows the tier that is open now.
- Qualifying (all three, in any order): signed up, placed a first order, referred a friend
  who placed an order. The card unlocks when the third is met; until then the page shows
  progress ("2 of 3 done").
- Perks (founders only): 10% off for life, first access to new lots, priority restock
  texts, founder bundles. "For life" and any discount wording need counsel's clearance
  before going public: keep them behind the counsel flag.

## 2. The members' page

- The whole Founders section on the store links to its own page that explains the perks
  (free to join; the card is earned).
- Greet by name when the name is known (from the store's own session only; never from the
  URL for anything sensitive).
- The sign-up form, matching the chosen card: name, email, phone, and experience level
  with exactly three choices: *New to peptides*, *Some experience*, *Experienced researcher*.
  Separate, unticked consent boxes for email and for text messages (CASL: one for each
  channel, never pre-ticked, never bundled with the terms).
- Show the live count of numbers left, read from the system that issues them.

## 3. Data and segmentation

- Store contacts in the CRM, never in the browser (no personal data in localStorage,
  sessionStorage, cookies or the URL).
- Tag each contact by experience level and send each group its own content track.
  Content is research and store information only: never dosing, use, health or body-goal
  advice (see `peptide-regulatory`).

## 4. Referrals (Canada)

- Each member gets a personal referral link. A referral email or text sent on the member's
  behalf must name the member, go out once, and carry the unsubscribe and identification
  CASL requires; otherwise the friend must opt in themselves.
- Reward only real, completed orders; never reward the sign-up alone.

## 5. Proof before showing

- The counter, the progress and the unlock are driven by real records; test the three
  qualifying paths, the 25th member, and the 26th person (sees "the Reserve is full",
  joins a waitlist).
- The card shows the member's real name and real number; sample data is labelled as sample.
