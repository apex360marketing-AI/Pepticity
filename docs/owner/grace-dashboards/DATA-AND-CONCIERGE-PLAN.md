# Grace's dashboards: real-data plan (plan only, nothing wired)

Date: 2 Nov 2026 · Branch: claude/grace-dashboards · Status: PLAN, needs the owner's OK before any build.

## What is true today
- Both links run one file: sites/dashboard/index.html (owner) and sites/dashboard-client/index.html (same code, opens on the client view).
- Every number, name, order and message is hard-coded sample data in the page (`CUST`, `ORDERS_C`, `BUY`, `SEED_MSGS`, `SEED_EXP`, `SEED_DROPS`, `LOTS`, `REFS`, `TIERS` and friends, around lines 2258–2995).
- Changes a visitor makes are kept only in their own browser (`localStorage`, key `pepticity-studio-demo-v1`).
- There is no login. Anyone with the client link can switch to the owner view. That's fine for a demo, but a live version must never allow it.
- The compliance audit of 30 Oct (docs/owner/AUDIT-COMPLIANCE-2026-10-30.md, section C) still has open BLOCKERS on the client side: orders with product names, auto-ship, reminders, countdowns, tiers, referral rewards and the lot library. **Connect no real data until counsel clears what may be shown.**

## Rule for the wiring: the look does not change
- Swap each hard-coded list for one loader, `PEPDATA.get('<name>')`, that returns **the same shape** the page already uses. Layout, cards, fonts, 3D type and the coin footer stay exactly as they are (locked 30 Oct).
- Sample mode stays as a switch (`?demo=1`) so the owner can always show the demo.

## Sources (recommended picks; each one is an owner decision)
| Data | Feeds these views | Source of truth (recommended) | Notes |
|---|---|---|---|
| Orders + order journey | owner SALES, ORDERS; client ORDERS | Shopify (already in the sample expenses) | Webhooks for order created and fulfilled; Canada Post tracking from the fulfillment |
| Stock + restock dates | owner STOCK, DROPS; client restock alerts | Shopify inventory, plus a `restock_eta` field Grace sets | Countdowns only from a stored real end date (Competition Act) |
| Payments, fees, tax | owner MONEY | Shopify Payments or Stripe payouts, plus the expenses table | GST/PST from the processor's reports; receipts uploaded to storage |
| Customers + consent | owner CUSTOMERS; client membership card | Shopify customers, plus a `consent` table (CASL: what, when, wording version) | Letter switch starts OFF until consent is recorded |
| Email + letter | owner MARKETING; client letter | An email service (Klaviyo or Postmark) | Unsubscribe and sender details in every email (CASL) |
| Messages | owner inbox; client messages | A `messages` table | Banner: "Please keep health details out of messages" |
| Lab reports | owner LAB; client lot library | Storage bucket + a `lots` table (lot, lab, date, PDF) | Shown only for the buyer's own lot, after counsel OKs it |

## Who sees what (the most important part)
- One small backend: recommended Supabase (Postgres, sign-in and file storage), already connected to this account. Nothing has been created.
- Two roles: `owner` (Grace) sees everything; `member` sees **only their own rows**. Row-level security enforces this in the database, not in the page.
- The client link has no owner switch at all. The owner view needs Grace's sign-in (magic link plus a second factor).
- No health data is stored. The page is set to noindex, and the existing CSP stays.

## The Concierge (built in another session)
- The Concierge reads through the same `PEPDATA` layer with the member's own sign-in, so it can only see that member's orders, shipping status and messages.
- It can answer: where is my order, when is X back, how do I update my card or address, and how do I reach Grace.
- It hands off to Grace by writing a row to `messages`, flagged `from_concierge`. The thread shows in her owner inbox with an unread count.
- It never sees money, other customers or any owner view, and it never answers health or dosing questions (vetted mode, as in shared/pep-concierge.js).
- Every Concierge reply is logged (`concierge_log`) so Grace can review it.

## Order of work (each step needs the owner's OK first)
1. Counsel clears what the client side may show (the C1–C18 list in the audit).
2. The owner picks the sources in the table above.
3. Build the `PEPDATA` loader in demo mode (same sample data, new plumbing). Prove with BEFORE/AFTER screenshots that nothing moved.
4. Set up the backend, roles and row-level security. Test with two fake members, proving that A cannot see B.
5. Connect read-only: orders, stock, then money.
6. Connect writes: messages, consent, restock ETAs, drops.
7. Connect the Concierge to `PEPDATA` with member-scoped access.
8. Run a pilot with Grace's own test orders, then go live.
