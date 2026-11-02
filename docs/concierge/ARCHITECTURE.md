# CONCIERGE GRACE · ARCHITECTURE (v0.1, 2 Nov 2026)

Research checked 2 Nov 2026. Prices come from vendor pages or third parties, as marked; re-check before buying.

## 1. Recommendation in one screen
- **Brain + scheduler + phone approvals: Hermes Agent** (Nous Research, MIT, v0.22.6 released 2 Nov 2026). The owner already runs it.
  - Run it in **Docker** on a small VPS (2 vCPU / 4 GB, roughly US$5-10/mo, estimate).
  - Model: Claude through an Anthropic API key (Sonnet for triage and drafts, Opus only for incident analysis).
  - `approvals.mode: manual` (the default `smart` lets a second AI decide what is safe; we don't want that).
  - Grace approves from **Telegram or WhatsApp** (user allowlist on). The owner gets P1 by push + SMS (Twilio).
- **Code fixes: a Claude Code routine** started by Hermes through the routine's API trigger. It works in the cloud on a branch and opens a pull request. `main` and `gh-pages` are branch-protected; nothing pushes there without a human merge.
- **Uptime: Checkly** Starter (US$24/mo, vendor page) for the 30-min browser journey + **UptimeRobot** free 5-min HTTP checks as a second opinion. Both call a Hermes webhook on failure.
- **Store data: WooCommerce REST v3 key with Read only** + signed webhooks (order.created, order.updated, product.updated). The agent never gets a WordPress admin login and never gets the site's MCP endpoint (it can write to production).
- **Email: Gmail API on an "Internal" Google Workspace app**, scopes `gmail.readonly` + `gmail.compose`, through a Gmail MCP server whose code has **no send function** (removed, not switched off).
- **Links: lychee** in GitHub Actions, nightly.
- **Secrets: Bitwarden Secrets Manager** (free tier: 2 users, 3 projects, 3 machine accounts; third-party pricing).
- **Do not use:** the Hermes built-in Email gateway (it replies over SMTP with no draft step), OpenClaw (CVE-2026-25253 and the ClawHavoc malicious-skills campaign), any admin password in the agent.

## 2. Diagram
```
                 ┌──────────── OUTSIDE MONITORS ────────────┐
                 │ UptimeRobot (HTTP, 5 min)  Checkly (30 min │
                 │ browser: home→product→cart→checkout STOP) │
                 └──────────────┬────────────────────────────┘
                                │ webhook on fail
 WooCommerce ──signed webhooks──▼─────────────────────────────┐
 (read-only key)        HERMES AGENT (Docker, VPS)            │
 Gmail (read+draft) ──► • cron jobs J01-J14 (scripts first,   │
 Bank deposit emails      AI only to sort, draft, explain)    │
 lychee results ──────► • approval queue  • audit log (JSONL) │
                        • kill switch     • rate limits       │
                        └──┬──────────────┬──────────────┬────┘
                           │              │              │
             Telegram/WhatsApp      API trigger      status feed (JSON)
             to Grace (approve)     ▼                ▼
             SMS/push to owner   CLAUDE CODE ROUTINE   GRACE'S DASHBOARD
                                 branch fix/<id> → PR   tab "11 CONCIERGE"
                                 → CI checks → HUMAN MERGE
```

## 3. Why Hermes (and what we compared)
| Option | Good | Not good | Verdict |
|---|---|---|---|
| **Hermes Agent** | Already in use; cron built in; 20+ chat channels incl. Telegram/WhatsApp/SMS; sub-agents; MCP; chat approvals ("yes/no", auto-deny after 300 s); runs Claude | Young project (v0.1 Feb 2026), several 2026 CVEs in older versions (all fixed in current); security policy says the OS is the only real boundary | **Pick, hardened** |
| Claude Managed Agents | Hosted by Anthropic, sandboxed, good audit trail | We'd build the chat channels and scheduler ourselves; tokens + ~US$0.08 per running hour (third party) | Plan B |
| Claude Code routines | Native GitHub branch/PR flow | Research preview; schedules no faster than hourly, so not for the 30-min check | **Use for fixes only** |
| n8n self-hosted | Every run visible step by step | Agents clunkier; per-tool approval in free edition unconfirmed | Not now |
| OpenClaw | — | CVE-2026-25253 (CVSS 8.8), 341-800+ malicious skills in its store | **Avoid** |

Hermes hardening checklist (all required before go-live):
- Docker backend; container runs as non-root, read-only filesystem except its data folder.
- `approvals.mode: manual`; `approvals.deny` patterns for `git push`, `wp `, `mysql`, `curl -X (POST|PUT|DELETE)` to store hosts, `rm -rf`.
- Chat user allowlists set (Grace, owner only).
- HTTP API bound to localhost; webhooks enter through a small verifier (HMAC check) behind Cloudflare Tunnel; nothing else exposed.
- Always on the latest release; weekly update check (J11).
- `~/.hermes/.env` holds only the Bitwarden machine token (chmod 600); everything else is pulled at start.

## 4. The store, as it really is
- Platform: **WordPress + WooCommerce + Elementor Pro on northernpeptides.st**, Cloudflare in front.
- **Payment: one gateway, id `betpg`.** It is not on WordPress.org and has no public docs; most likely a private or theme-bundled offline gateway (e-Transfer / bank transfer is the usual setup for this kind of store in Canada). **Grace must confirm in WooCommerce → Settings → Payments** (decision D4).
  - If it is offline (e-Transfer): new orders sit **On hold** until someone marks them Processing. So "payment went through" = the bank's deposit email (sender `notify@payments.interac.ca`) matched to the order number and amount. The agent suggests the match; Grace confirms.
  - Optional plugin to make matching exact: Advanced EMT Payment Gateway (unique cents per order, IMAP matching). Not audited.
- **Cards:** Stripe's restricted list (updated 22 Sep 2026) excludes mislabelled research chemicals; Square/Shopify Payments similar (not re-checked). Only high-risk acquirers are realistic, and the Health Canada advisory makes underwriting harder. So J05's card features (declines, chargebacks, payouts) are built as **dormant**: they switch on only if a card gateway is ever added.
- **PEPTICITY site:** static on GitHub Pages, no backend; the cart is in the browser. When it gets a real checkout, it should hand off to the WooCommerce store (one source of orders) so the concierge watches one system.
- **Abandoned carts:** WooCommerce has none built in. **CartFlows Cart Abandonment Recovery** (free, runs inside WordPress, sends through WP Mail SMTP, has a consent option) fits; hosted email platforms may refuse peptide sellers (unverified). Selling Machine owns the choice.
- **Staging:** host one-click staging or WP Staging plugin. The child theme and Code Snippets are kept in a git repo so fixes are pull requests, not live edits (decision D6).

## 5. Data access, least privilege
| System | Access the agent gets | Access it never gets |
|---|---|---|
| WooCommerce | REST v3 key, **Read** (orders, products, stock); webhooks in | Write key, admin login, `/wp-json/mcp`, Code Snippets API |
| Gmail (store inbox) | `gmail.readonly` + `gmail.compose`, via an MCP server with no send code; Internal app (no Google verification needed) | Send; Grace's personal Outlook; any other mailbox; domain-wide delegation |
| Bank | Reads deposit notification **emails** only | Bank login, account numbers |
| GitHub | Fine-grained token on the PEPTICITY repo (+ theme repo): contents + pull requests on non-protected branches | Admin, bypass branch protection, secrets, Pages settings |
| Cloudflare | Read-only analytics token (optional) | DNS edit, WAF edit, purge |
| Checkly/UptimeRobot | Sends webhooks in | Account changes |
| Twilio | Send SMS to two numbers only (owner, Grace) | Any other number |

How "never send email" is enforced, since Google has no draft-only scope:
1. The Gmail tool exposes only `search`, `get`, `label`, `create_draft`. No `send`, no `drafts.send` in the code.
2. Sending is a separate tiny service with its own token that only accepts an approval id signed by the approval queue (Grace's tap).
3. Daily check: every message in Sent Mail must match an approval id in the audit log; any mismatch = P1 + kill switch.

## 6. Incident runbook (what J04 checks, in order)
| Symptom | First checks | Fixable by PR? | Who to call |
|---|---|---|---|
| Site down (5xx/timeout) all pages | Cloudflare status, origin direct, host status page | No | Host; Cloudflare |
| Cloudflare 52x error | Origin reachable? SSL mode? | No | Host |
| One page broken after a change | Last merged PR, console errors, diff | **Yes** (revert PR or fix PR) | Owner merges |
| Checkout page loads but no payment option | Gateway enabled? recent plugin update? | No (plugin/gateway) | Grace (settings), plugin vendor |
| Add to cart fails | JS errors, WP Rocket cache, Store API response | Sometimes (theme/snippet) | Owner |
| Orders stopped (3× gap) | J03 journey result, email sending, gateway | Depends | Owner |
| Emails not arriving | WP Mail SMTP log, SPF/DKIM/DMARC | DNS = no | Owner applies DNS |
| Broken link/image | lychee report | **Yes** if in our repo | Owner merges |
| SSL < 14 days | Cloudflare edge cert, origin cert | No | Host/Cloudflare |
| Wordfence alert / new admin user | Wordfence log | No: **P1 security** | Owner now |

Fix agent contract (Claude Code routine):
- Input: incident id, failing check output, screenshot link, last 3 merged PRs. No secrets, no production credentials.
- Must: reproduce first; smallest change; run the repo's checks + the Checkly journey against a preview; attach before/after screenshots; open PR titled `fix(<incident-id>): ...`.
- Must not: push to protected branches, touch more than the files the bug needs, disable a test, change dependencies without saying so.
- Time box 30 min; then it reports "no fix" with what it learned (J04 step 6).
- Why so strict: Replit (Jul 2025) deleted a production database during a code freeze; PocketOS (Apr 2026) had a coding agent delete a production database and its backups in 9 seconds during a staging task.

## 7. Plugging into Grace's dashboard
- Hermes writes a status feed (`concierge-status.json`: jobs, last run, alerts, approval queue, counts) every 5 min to a private store the dashboard reads.
- The dashboard gets one new owner tab, **11 · CONCIERGE**, using the dashboard's own card markup (preview built in `sites/concierge-panel/`). No change to existing tabs.
- Approvals in the panel call the same approval queue as the phone buttons, so a tap in either place counts once.
- Dashboards belong to the Dashboards session (branch `claude/grace-dashboards`); this branch only ships the preview and the feed format.

## 8. Monthly running cost (estimate)
| Item | US$/mo |
|---|---|
| VPS for Hermes | 5-10 |
| Checkly Starter (30-min browser) | 24 |
| UptimeRobot free | 0 |
| Claude API (triage + drafts + briefs; ~40 emails/day) | 20-60 (estimate; depends on volume) |
| Claude Code routine runs (fixes) | inside the owner's Claude plan |
| Twilio SMS | 1-5 |
| Bitwarden Secrets Manager free | 0 |
| **Total** | **~50-100** |
