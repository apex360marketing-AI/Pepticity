# Handoff — Pepticity templates
Building 5 all-in-one Pepticity site versions (brief: BRIEF.md, bottom section overrides). Live: V1 Clinic (dist/), V3 Prime (sites/prime/dist), Logo Lab (logos/), Plan (plan/).
Stopped: V2 Pure (sites/pure), V4 Performance (sites/performance), V5 Open Lab (sites/openlab) — builders hit the weekly usage limit mid-build (resets 8pm UTC). Partial src is committed; each was about to write its Playwright verification.
Next action: for each unfinished site, finish per BRIEF.md, then `python3 build.py sites/<slug>` and smoke-test with scratchpad deps/smoke.mjs (`node smoke.mjs <slug> home,<views>`), publish dist/index.html as an artifact, add its link to plan/index.html, commit + push.
Media: 44 Higgsfield assets listed in media/manifest.tsv; host d8j0ntlcm91z4.cloudfront.net is blocked by the network policy — once allowed, run media/fetch.sh and copy pool files into each site's media/.
Pending Higgsfield jobs: Open Lab images (job ids in chat, indices 500–507) and Performance intro film (e6c309a4-d2ac-484b-9bf5-aaeac2485500) — add URLs to manifest.tsv.
Open questions: Grace's partner pharmacy, markets, pricing; counsel review. Repo rule: this project lives ONLY in apex360marketing-AI/Pepticity — never Apex_Agents_Bots.
**Autostart:** no
