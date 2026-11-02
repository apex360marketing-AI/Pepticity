# CONCIERGE GRACE · always-on operations agent (design pack, 2 Nov 2026)

Status: design + clickable preview. Nothing is live. Sample data only.

1. [SPEC.md](SPEC.md): the 14 jobs (trigger, schedule, data, what it does alone vs needs approval, escalation, log)
2. [ARCHITECTURE.md](ARCHITECTURE.md): Hermes (hardened) + Claude Code routine for fixes, Checkly + UptimeRobot, WooCommerce read-only, Gmail read+draft, runbook
3. [SAFETY.md](SAFETY.md): secrets, least privilege, kill switch, rate limits, human-in-the-loop, regulated wording
4. [TEMPLATES.md](TEMPLATES.md): customer templates after compliance review (T06, T07 blocked pending counsel)
5. [BUILD-PLAN.md](BUILD-PLAN.md): week 1 / week 2 / weeks 3-4 / month 2+, and the owner's decisions D1-D11
6. [concierge.example.yaml](concierge.example.yaml): the job policy file Hermes would load (no secrets)
7. Preview: `sites/concierge-panel/` builds a copy of Grace's dashboard with ONE new owner tab, "11 CONCIERGE" (`python3 sites/concierge-panel/build.py`). The build proves nothing else in the dashboard changed.
8. [proof/](proof/): before/after screenshots (same scroll position) and the new tab at 1440 and 390 wide.
