# CONCIERGE GRACE · OPERATIONS SPEC (v0.1, 2 Nov 2026)

Status: DRAFT for owner review. Nothing here is live. Sample data only.
Branch: `claude/grace-concierge`.

## 0. What we are building, in one line
- Today Concierge Grace is a website chatbot. This turns it into an always-on operations agent that watches Grace's store, drafts the work, and asks before anything touches money or a customer.

## 1. Facts this spec is built on (checked 2 Nov 2026)
- **Grace's live store is northernpeptides.st**, not the PEPTICITY preview.
  - WordPress + WooCommerce + Elementor Pro, behind Cloudflare.
  - Plugins seen from the public site: Wordfence, WP Rocket, WP Mail SMTP, Jetpack, Rank Math, Code Snippets, Contact Form 7, Akismet.
  - REST namespaces include `wc/v3` (admin API), `wc/store/v1` (public), `wc-analytics`, `mcp` and `wp-abilities/v1` (a WordPress MCP adapter is installed).
- **Checkout has exactly one payment method: gateway id `betpg`** (from the public Store API cart). See ARCHITECTURE §4 for what it is. No card gateway, so card chargebacks do not exist today.
- **PEPTICITY (GitHub Pages) has no real checkout.** The cart lives in the browser; the button says "PLACE ORDER (PREVIEW)" (`site/v2.js:757-765` on gh-pages).
- **Business email is Google Workspace** (MX `smtp.google.com`).
  - DKIM is set (`google._domainkey`).
  - **SPF is missing and DMARC is missing.** Order and reply emails can land in spam. This is a week-1 fix (J12).
- Grace's personal address on file: Gracet@live.ca (Outlook). The agent never reads a personal inbox.
- Compliance background: Health Canada's 2026 advisory names 14 peptides as unauthorized; "research use only" labels give no exemption; Canlab Research got a permanent injunction (June 2026). So **every customer message is a regulated message** (see SAFETY §6 and TEMPLATES.md).

## 2. Autonomy levels (used by every job)
| Level | Name | What the agent may do | Example |
|---|---|---|---|
| L0 | Watch | Read and log only | Read stock levels |
| L1 | Tell | Send an alert to Grace or the owner | "BPC-157 10 MG has 3 left" |
| L2 | Draft | Prepare the action and wait for a tap to approve | Gmail draft reply; reorder email draft |
| L3 | Act (safe) | Do it alone, only if it is internal, reversible and costs nothing | Label an email; open a GitHub branch + pull request; pause a flow |
| L3+ | Auto-send (opt-in) | Send a **locked template** with no free text, only after Grace turns it on for that one category | "Your e-Transfer reminder" |

Hard rules, true at every level:
- **Money moves: never alone.** Refunds, price changes, discounts, payouts, order cancellations = L2 at most, forever.
- **Customer words: never free-written and sent alone.** Free-written replies are always L2. Only locked templates can ever be L3+.
- **Production: never touched by the agent.** Fixes go branch → pull request → checks → human merge.
- **Medical, dosing, "is it safe", "what does it do" questions: never answered.** Locked refusal template + hand to Grace.

## 3. The jobs
Format for each job: trigger · schedule · data source · on its own · needs approval · escalation · log.

### J01 · INBOX: read, sort, draft, notify
- **Trigger:** new email in the store inbox (Gmail push via Pub/Sub; fallback poll every 5 min).
- **Data:** Google Workspace mailbox for the store (read + drafts). Never Grace's personal inbox.
- **On its own (L0–L3):**
  - Sort each email into one category: ORDER STATUS · PAYMENT · SHIPPING · RETURN/DAMAGE · DOCUMENTATION (COA) · PRODUCT QUESTION · MEDICAL/DOSING · WHOLESALE · SUPPLIER · SPAM/PHISHING · OTHER.
  - Apply a Gmail label; look up the order in WooCommerce (read-only) when an order number or the sender's email matches.
  - Write a **draft** reply from the matching locked template plus looked-up facts (order status, tracking number). It sits in Gmail Drafts.
  - Run the compliance linter on the draft (SAFETY §6). A draft that fails is not shown as ready; it is flagged.
- **Needs approval:** sending any reply. Grace taps APPROVE / EDIT / SKIP in the panel or her phone.
- **Opt-in auto-send (L3+, off by default):** per category, only for: ORDER RECEIVED acknowledgment, E-TRANSFER REMINDER, TRACKING NUMBER. Never for MEDICAL, RETURN, DOCUMENTATION, WHOLESALE or anything the classifier is under 90% sure of.
- **Escalation:** angry/legal words ("lawyer", "chargeback", "Health Canada", "police", "report you") → L1 alert to Grace now + owner copy. Unanswered customer email over 24 h → reminder in the brief; over 48 h → alert.
- **Log:** message id, category, confidence, template id, linter result, approver, sent/skipped. Never the email body.

### J02 · INVENTORY: watch stock, warn, draft reorders
- **Trigger:** WooCommerce webhook `product.updated` + `order.created`; full sweep every hour.
- **Data:** WooCommerce REST v3 (read-only key): stock quantity per product/size; last 30 days of sales.
- **On its own:**
  - Work out **days of cover** = stock ÷ average daily sales (30-day window).
  - LOW when days of cover < supplier lead time + 7 days, or stock ≤ the product's low-stock threshold.
  - OUT when stock = 0 on a published product.
  - Spot anomalies: stock went up with no receiving note; negative stock; a size sold out while the product page still says "in stock".
  - Build a **reorder draft**: supplier, items, suggested quantity (cover 45 days), last price paid.
- **Needs approval:** sending the reorder to the supplier; changing a stock number; hiding a product.
- **Escalation:** LOW → brief. OUT on a top-10 seller → L1 alert now. Paid order for an OUT item → L1 alert now (J13).
- **Log:** product id, stock, cover, rule fired, draft id, approver.

### J03 · UPTIME + CHECKOUT CHECK (every 30 min)
- **Trigger:** schedule. Two layers:
  1. **External HTTP monitor every 1 min** (not on our own server, so it still works if the server is down): home, shop, one product, cart, checkout, `wc/store/v1/products` returns JSON with > 0 items, SSL valid > 14 days.
  2. **Browser journey every 30 min** (Playwright): open home → open a product → add to cart → open checkout → confirm the `betpg` payment option is shown and the Place Order button is enabled → **stop. Never places a real order.**
- **Payment path check:**
  - Every 30 min (from J05 data): an order arrived in the last N hours, where N comes from the normal pace (alert if silent for 3× the usual gap during open hours).
  - Once a day on **staging**: place a full test order with a test gateway and check the confirmation email arrives. Production is never used for test orders.
- **On its own:** retry once after 60 s to rule out a blip; capture screenshot, HTTP codes, console errors, Cloudflare ray id; open an incident (J04).
- **Escalation:** 2 failures in a row → incident P1 (site down, checkout broken) or P2 (slow > 5 s, one image broken).
- **Log:** every run: pass/fail per step, timings, screenshot link on failure.

### J04 · INCIDENT + SAFE AUTO-FIX LOOP
- **Trigger:** J03, J06, J11 failures, or a monitor webhook.
- **Steps (each step logged):**
  1. **Confirm** (retry from a second region). Not confirmed → close as blip, note in brief.
  2. **Classify** with the runbook (ARCHITECTURE §6): our code · WordPress/plugin · host/server · Cloudflare/DNS · payment gateway · third party.
  3. **Alert first, fix second:** P1 → owner push + SMS within 2 min, with what broke, since when, screenshot, first guess. Grace gets a short "we're on it".
  4. **If it is code we own** (PEPTICITY repo, WordPress child theme or snippets kept in git): start a fix agent in an isolated workspace with **no production credentials**. It reproduces the bug, writes the fix on branch `fix/<incident-id>`, runs the checks, opens a pull request with before/after proof.
  5. **Human merges.** The owner (or a named deputy) taps MERGE. Deploy runs; J03 re-checks; incident closes only after 2 clean runs.
  6. **If not code we own, or no fix in 30 min:** stop trying, send the owner the full findings (what was checked, what was ruled out, suspected cause, who to call: host, Cloudflare, gateway, plugin vendor).
- **Never:** push to `main`/production, edit live WordPress files, change DNS, update plugins on production, roll back a database, or retry anything that charges money.
- **Close-out:** a 5-line blameless review (what happened, impact, cause, fix, prevention) attached to the incident; prevention item goes to the weekly review.
- **Log:** incident timeline (every check, message, branch, PR, merge, approver).

### J05 · PAYMENTS: failed payments, unpaid orders, chargebacks, payouts
- **Today (e-Transfer only):**
  - Orders waiting for payment (status on-hold/pending) older than 24 h → draft E-TRANSFER REMINDER (TEMPLATES T04). Older than 72 h → ask Grace "cancel or keep?" (L2).
  - **Deposit matching:** read the bank's "you received an Interac e-Transfer" notices in the store inbox, match by amount + order number in the message + sender name, and **suggest** the match. Grace taps CONFIRM to mark the order paid. The agent never marks an order paid alone.
  - Amount mismatch, duplicate payment, or payment with no order → L1 alert.
  - Failed / cancelled orders today vs normal → brief; spike (3× usual) → alert (may mean checkout trouble).
- **If a card gateway is added later:** declines by reason code, spike in declines (fraud or gateway issue), new dispute/chargeback (alert now, with deadline to respond; evidence pack drafted at L2), payout arrived vs expected (alert on missing/short payout).
- **Needs approval:** marking paid, refunds, cancelling, responding to a dispute.
- **Log:** order id, amount, match confidence, approver. No bank account numbers, ever.

### J06 · LINKS, IMAGES, FORMS CRAWL
- **Trigger:** nightly 02:30 Pacific + after every deploy/merge.
- **Data:** crawl of northernpeptides.st and the PEPTICITY GitHub Pages site (internal links + images + external links checked weekly).
- **Checks:** 4xx/5xx links, broken images, mixed content, redirect loops, pages missing a title, forms: each Contact Form 7 / capture form renders and its endpoint answers (a **test submission only to a staging inbox or with a test flag**; never spams Grace).
- **On its own:** if the broken link is in a repo we own → fix agent opens a pull request (J04 path, P3). Otherwise → list in the brief with the page and the fix.
- **Log:** crawl summary, broken items, PR links.

### J07 · CART RECOVERY + OTHER RECOVERY FLOWS
- **Coordinates with:** the Selling Machine session (conversion features). Its review page did not exist on 2 Nov; the Selling Machine owns which flows ship and their design. This job owns sending rules and safety.
- **Flows (all OFF until owner + counsel OK):**
  - Saved cart reminder: one email 1-4 h after a cart is left, only if the shopper ticked the email consent box, or has an open inquiry relationship CASL allows (counsel question). No second or third nag without express consent.
  - Unpaid order (e-Transfer) reminder: J05, transactional.
  - Back-in-stock: J08.
  - Win-back after 60 days: express consent only.
- **On its own:** queue messages from locked templates, stop rules (bought, unsubscribed, complained, bounced, under-19 flag) applied automatically.
- **Needs approval:** turning any flow on; changing any template; any discount in a message.
- **Log:** cart id (hashed email), consent record id, template id, sent/suppressed reason.

### J08 · RESTOCK ALERTS (waitlist)
- **Trigger:** J02 sees a product go from 0 to > 0.
- **On its own:** builds the send list from people who asked to be told about **that** item (express request on record).
- **Needs approval:** the send (Grace taps SEND, or turns on L3+ for this category).
- **Log:** product id, count notified, consent ids.

### J09 · DAILY BRIEF + WEEKLY REVIEW
- **Daily 07:30 Pacific** to Grace (and owner copy), one screen:
  - Yesterday: orders, revenue, unpaid orders, average order.
  - Needs you: drafts waiting, approvals waiting, oldest unanswered email.
  - Stock: LOW / OUT list with days of cover; reorder drafts ready.
  - Health: uptime %, incidents, broken links count, pending WordPress updates, SSL/domain days left.
  - Compliance: any flagged draft or site text this week.
- **Weekly Monday 08:00:** trends (week vs last), top products, email response time, incident review items, cart recovery results, what the agent did on its own (count by type).
- **Data rule:** numbers come from WooCommerce Analytics / the audit log only. If a number is missing, the brief says "not available", never a guess.

### J10 · COMPLIANCE SENTINEL (what a regulated store's ops team adds)
- **Weekly + on every site change:** re-scan live product pages, emails templates, bot answers for banned phrases (dosing, protocol, cycle, cure, treat, "research use only" as a shield, calculators). Report each hit with page, phrase and a replacement line (regulated-claims-check format).
- **Weekly:** check Health Canada recalls/advisories and FDA warning letters for peptide news; summarise changes for the owner.
- **Never** edits site copy on its own; opens a PR for repos we own, a task for WordPress.

### J11 · SECURITY + UPKEEP WATCH
- Daily: WordPress core/plugin/theme updates pending (and which are security releases), Wordfence alerts, admin users added, SSL expiry, domain expiry, Cloudflare security events spike.
- **Never** installs updates on production. Updates are tested on staging first, then a human applies them.

### J12 · EMAIL DELIVERABILITY
- Daily: SPF, DKIM, DMARC records present and passing; bounce and spam-complaint rate of store emails; WooCommerce emails actually sending (WP Mail SMTP log).
- **Found on 2 Nov:** SPF missing, DMARC missing → fix in week 1 (DNS change = owner applies, agent prepares the exact records).

### J13 · ORDER FLOW + FULFILMENT WATCH
- Paid orders not shipped within 2 business days; shipped orders with no tracking number; orders to provinces/countries the store does not serve; orders that need an age check; unusual orders (many units, new customer, mismatched names) → flag for Grace.

### J14 · BACKUPS
- Daily: a backup of the site + database exists and is under 26 h old (host or plugin report). Monthly: a restore test on staging, logged. A missed backup = L1 alert.

## 4. Escalation ladder
| Level | Examples | Who | How fast | Channel |
|---|---|---|---|---|
| INFO | low stock, 1 broken link | Grace | next brief | brief |
| NOTICE | draft waiting > 4 h, OUT on a top seller | Grace | within 15 min (07:00-22:00) | phone push |
| P2 | slow site, checkout warning, payment mismatch | Grace + owner | within 5 min | push + panel |
| P1 | site down, checkout broken, no orders for 3× normal gap, security alert | **Owner first**, Grace told | within 2 min, any hour | push + SMS; phone call if not acknowledged in 15 min |

- Quiet hours 22:00-07:00 Pacific hold everything below P1.
- Every alert has: what, since when, impact, what the agent already checked, the one action needed, and a link.

## 5. Logging (one audit trail for everything)
- Append-only JSON Lines, one line per action: `ts, job, run_id, event, level, refs (ids only), decision, confidence, approver, outcome, cost`.
- No email bodies, no card or bank numbers, no passwords, no health details. Customer emails are stored hashed in logs.
- Kept 13 months; daily copy to off-server storage; weekly summary feeds the dashboard panel.
- Every approval records who tapped it and when; every L3 action records the rule that allowed it.
