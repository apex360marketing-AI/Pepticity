# CONCIERGE GRACE · PHASED BUILD PLAN (v0.1, 2 Nov 2026)

Rule: one stage at a time; each stage ends with proof (screenshots, a test run, the audit log) and the owner's OK before the next.

## WEEK 1 · "Watch and tell" (no AI sending anything, nothing touches money)
1. **Accounts + vault:** Bitwarden Secrets Manager; WooCommerce read-only key; Checkly + UptimeRobot; Twilio (2 numbers); a VPS.
2. **Hermes hardened install** (Docker, `approvals.mode: manual`, allowlists, localhost-only API) + the **kill switch tested** (STOP CONCIERGE, panel, vault revoke).
3. **J03 uptime + checkout journey live** (Checkly every 30 min, stops before Place Order; UptimeRobot every 5 min) → P1 alerts to the owner by push + SMS. Dead-man's heartbeat on Hermes.
4. **J12 email fix prepared:** exact SPF + DMARC records written for northernpeptides.st (Google Workspace). Owner adds them in Cloudflare DNS. Start DMARC at `p=none` with reports, tighten after 2 weeks.
5. **J02 stock watch (alerts only)** and **J13 unshipped orders** from the read-only key.
6. **J09 daily brief v1** to Grace (Telegram/WhatsApp) at 7:30, numbers from WooCommerce only.
7. **J11 + J14 checks:** pending updates, SSL/domain days, backup age.
- Proof at end of week 1: 7 days of uptime log, one forced test alert (P1 drill), one brief screenshot, kill-switch drill logged.

## WEEK 2 · "Draft, don't send"
8. Gmail Internal app + read/draft-only MCP server (send code removed) + Sent-Mail vs approval-id check.
9. **J01 inbox:** sort + label + draft from templates T01-T05, T08, T09 (compliance-reviewed); linter on every draft; approvals by phone tap.
10. **J05 e-Transfer matching:** suggest matches from bank deposit emails; Grace confirms; T04 reminders as drafts.
11. **J06 lychee crawl** nightly (GitHub Actions) → list in the brief.
- Proof: 50 real emails sorted with an accuracy check by Grace; zero sends without approval in the audit; 5 matches confirmed.

## WEEKS 3-4 · "Safe fixes"
12. Branch protection on `main` + `gh-pages`; child theme + Code Snippets moved into a git repo (D6); staging site.
13. **J04 fix loop:** Hermes → Claude Code routine API trigger → branch → PR → CI + Checkly journey on preview → human merge. Fire drill with a planted broken link.
14. Concierge tab wired into Grace's dashboard (Dashboards session merges it; feed format from this branch).
15. **J10 wording sentinel** weekly.

## MONTH 2+ · Only after the owner and counsel say yes
16. Opt-in auto-send per category (order received, e-Transfer reminder, tracking).
17. **J07 recovery flows and J08 restock** only for counsel-cleared items, with CASL consent records (T06/T07 are blocked today).
18. Card gateway features in J05 (declines, disputes, payouts) only if a card processor is ever added.
19. Weekly review, monthly restore test, quarterly key rotation.

## Missing skills (asked first, not created)
- The brief asked for `superpowers:brainstorming`, `backend-design:design` and `incident-thinker`.
  - `brainstorming`: not installed as a skill here; its bundled copy (HANDOFF-CHATGPT/EXTERNAL-SKILLS-SUPERPOWERS.md) was read and followed (approaches laid out as decisions below).
  - `backend-design:design` and `incident-thinker`: not available in this session. Their jobs were done by hand (SPEC autonomy model; ARCHITECTURE §6 runbook + fix-agent contract).
  - Proposal: create `incident-thinker` (runbook + blameless review + fix-loop guardrails) with skill-creator so future sessions reuse it. **Waiting for the owner's yes (D10).**

## Decisions the owner needs to make
| # | Decision | Options | Recommendation |
|---|---|---|---|
| D1 | Platform | A Hermes (hardened) + Claude Code routine for fixes · B Claude Managed Agents · C n8n | **A** |
| D2 | Where Hermes runs | A small cloud VPS · B owner's own machine (GX10) · C Grace's computer | **A** (always on, not on a laptop) |
| D3 | Grace's approval channel | A Telegram · B WhatsApp · C dashboard only | **A** (cleanest buttons; WhatsApp needs Business API) |
| D4 | What is gateway `betpg`? | Grace checks WooCommerce → Settings → Payments | Needed before J05 |
| D5 | Uptime tools | A Checkly $24 + UptimeRobot free · B Better Stack · C GitHub Actions only | **A** |
| D6 | Move child theme + snippets into git (so fixes are PRs) | Yes / Not now | **Yes** (otherwise the auto-fix loop can only fix PEPTICITY pages) |
| D7 | Who merges fixes at night | A owner only · B owner + one deputy | **B** |
| D8 | Counsel: can the store send any message (even transactional) about Health Canada-named products; does the store taint PEPTICITY? | Book counsel | **Book before week 2** |
| D9 | Counsel: CASL for saved-cart and restock alerts | Book counsel | Same session as D8 |
| D10 | Create an `incident-thinker` skill with skill-creator | Yes / No | **Yes** |
| D11 | Grace's quiet hours | 22:00-07:00 Pacific / other | 22:00-07:00 |
| D12 | Start week 1 now | Yes / change the spec first | **Yes** |

Review page: https://claude.ai/artifact/RVs6CFZnAnhKwpgdDZ16QZ · Panel preview: https://claude.ai/artifact/MwZfrWKNXkBWozzuqwdmsk
