# PEPTICITY SECURITY AND ROBUSTNESS AUDIT · 30 OCT 2026

What this covered:
- Sources: sites/main/v2, sites/dashboard, sites/dashboard-client, sites/dashboard-color (plus modules), sites/grace-review, sites/bot-demo, shared/bot, sites/grace-arsenal, sites/grace-research
- The live gh-pages branch, and the public repo on GitHub (branches main, claude/pepticity-v6-v8 and gh-pages, plus all 170 commits of history)
- Skipped as briefed: sites/selection-studio and sites/start-page

Ground rules I kept:
- No look changes. Every edit is invisible: headers, escaping, type checks on saved data and one hidden anti-spam field.
- Nothing deployed, committed or pushed by me.
- Heads-up: another agent's commit 3045c03 ("Ledger: R169 site v3 plan") swept these working-tree edits into the branch and pushed it. gh-pages does NOT carry them yet (checked de0d2a2).

---

## FIXED

### 1. Stored XSS through saved browser data

Why this matters:
- Every project under apex360marketing-ai.github.io shares one origin, so they all share one localStorage.
- Any other page on that origin (another repo's Pages site, or one bad script on it) could plant values that PEPTICITY pages turned into HTML.
- Proven before the fix: values I planted ran as script on Grace's dashboard (saved drops: quantity and tier names). They also crashed the review page (TypeError) and the website (member.name.toUpperCase).
- Proven after the fix: the same values do not run and cause no page errors.

**Dashboards.** Files: sites/dashboard/index.html, sites/dashboard-client/index.html, sites/dashboard-color/index.html, sites/dashboard-color/client/index.html. The same edit went into all four:
- Saved demo state is only accepted when each key has the same type as the built-in default. Auto-ship also needs its basket and skips lists.
- Saved drops are shape-checked before use: id must match `[\w-]{1,40}`, quantity, time and hours must be numbers, tiers must be a list.
- Tier names are escaped, both on the drop cards and in the owner's drop list.
- An unreadable saved restock date is escaped. Before, it was written into the page as raw HTML.

**Review and picks.** Files: sites/grace-review/index.src.html and picks.src.html, rebuilt into index.html and picks.html.
- Review: saved answers are cleaned on load. Picks, dots and follow-ups must be whole numbers inside each question's options. Email, note and seen must be the right type.
- Picks: saved notes are kept only when they are text on a known item. Email and "anything else" must be text.

**Concierge bot.** File: shared/bot/pep-bot.js. Inline copies in dashboard-color (both files) and grace-arsenal/index.html got the same edit.
- Saved cart quantities become whole numbers from 1 to 999. A cart or interests list of the wrong type resets to empty.
- The saved captures list must be a list.

### 2. Forms (FormSubmit)

**Honeypot.** FormSubmit's `_honey` field is now on both Grace forms (grace/ and grace/picks.html).
- It is a hidden input that cannot be focused and is skipped by screen readers.
- Its value is sent as `_honey`, and FormSubmit drops any post where it is filled.
- Tested with the request intercepted: the payload carries `"_honey":""` and the form still reaches the thank-you state.

**Email validation.** Already in place on every email field: the website forms, review, picks, the dashboard playlist sign-up and the bot capture.

**No other secrets.** The only endpoint is the public FormSubmit address, which is public by design.

**PII in URLs.** Only the intended `?email=` prefill on grace/.
- That value only goes into the input's value or into escaped text.
- Cross-site requests get the origin only, never the full URL with the email. That is the browser default, and the referrer meta now states it explicitly.

### 3. CDN scripts and links

**Versions.** three.js is pinned to three@0.160.0 everywhere. There are no other CDN scripts.

**Subresource integrity.** Added through import-map `"integrity"` (sha384) for every three.js file the pages load:
- three.module.js or three.module.min.js
- RoomEnvironment.js
- BufferGeometryUtils.js
- SVGLoader.js (arsenal)
- The hashes match jsDelivr's published package hashes.
- Where: dashboards (4), review, picks, arsenal, and the website (see section 6).

**New-tab links.** All 379 `target="_blank"` links already had `noopener`. The review's "open in a new tab" button was the only one missing `noreferrer`, which is now added.

### 4. Headers (meta tags, since GitHub Pages cannot set real headers)

**Content-Security-Policy meta** on:
- the 4 dashboards
- review and picks
- arsenal, research, concierge
- the website (section 6)

What every policy sets:
- `default-src 'self'`
- scripts only from the page itself, its inline code and cdn.jsdelivr.net
- styles from the page and Google Fonts
- fonts from the page, data: and fonts.gstatic.com
- images from the page, data: and blob:
- connect only to the page's own origin
- `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`

Per-page differences:
- Review and picks: `connect-src` also allows https://formsubmit.co, and `frame-src 'self'` lets the viewer frames load.
- Dashboards, website, arsenal, research and concierge: `frame-src 'none'`.
- Arsenal: `style-src` also allows `data:`, for the bot's empty placeholder stylesheet. Testing caught this.

**Referrer meta** (`strict-origin-when-cross-origin`) on every page listed above.

### 5. Robustness

- Storage calls: every localStorage and sessionStorage call in scope was already in try/catch.
- JSON.parse: every parse of saved data is guarded. The unguarded ones only read data embedded in the page itself.
- Fetch: every call has a failure path. That covers the catalogue, the bot loader, the review frame check and the FormSubmit post (15 s timeout, falls back to saving on the device).
- Website invite link: it no longer throws for an email with non-Latin characters.
- Website member card: it no longer crashes on a badly typed saved name.
- Animation loops:
  - The dashboards only animate while something moves.
  - The smoke and the 3D type engine pause when off-screen or the tab is hidden.
  - The member card stops rendering while the doors are hidden. It does keep a cheap 250 ms check running.

### 6. Website (sites/main/v2): edits made before the freeze, to carry into v3

The coordinator froze v2 mid-audit. These were already done, and nothing has been touched since:

**sites/main/v2/index.html**
- Added the CSP meta and the referrer meta right after the viewport meta. CSP:
  - `default-src 'self'`
  - `script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net`
  - `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`
  - `font-src 'self' data: https://fonts.gstatic.com`
  - `img-src 'self' data: blob:`
  - `media-src 'self' blob:`
  - `connect-src 'self'`
  - `worker-src 'self' blob:`
  - `frame-src 'none'`
  - `object-src 'none'`
  - `base-uri 'self'`
  - `form-action 'self'`
- Import map: added an `"integrity"` block (sha384) for three.module.js, RoomEnvironment.js and BufferGeometryUtils.js. Copy the hashes exactly from the v2 file.

**sites/main/v2/v2.js**
- Saved `pc-member` is type-checked: email and name must be text, name is cut to 22 characters, notches are held between 0 and 10.
- Saved `pc-cart` becomes `[{id: number, q: 1–999}]`. This closes the stored XSS through the quantity shown in the cart.
- The product card's READ MORE headings (`m[0]`) are escaped.
- Building the invite-link code (btoa) is wrapped in try/catch.

**sites/main/v2/publish/**
- Rebuilt with make-publish.sh, and shared/bot copied in. The changed files are index.html, v2.js, shared/bot/pep-bot.js and FILES.txt.

### 7. Checked and clean (no change needed)

- comms.js (chat, announcements, weekly note, check-ins, reminders, lab notes): every user string is escaped, and saved data is shape-checked.
- postMessage: there are no handlers in scope. The only ones are in selection-studio, which was skipped.
- The dashboard-color accent `?acc=` only accepts the 8 known colour names.
- Secrets: none on main, claude/pepticity-v6-v8 or gh-pages. None in any of the 170 commits either (I searched for AWS, GitHub, Slack, Google, Stripe, SendGrid, Hugging Face and JWT keys, private keys and `sk-` keys).
- Phone numbers: only fictional 555 numbers.
- Emails found:
  - apex360marketing@gmail.com (the FormSubmit endpoint)
  - Gracet@live.ca (see the recommendations)
  - example addresses
- Vendor names: none of GoHighLevel, DashClicks, commissions or price floors appear on gh-pages or in the repo. The "unit cost / margin" on the dashboards is labelled sample data.

### 8. Proof (local server, Playwright Chromium)

**Page loads.** 11 pages loaded after the fixes:
- Zero console errors and zero CSP violations.
- One expected exception: the review page's `../site/` frame returns 404 in the source folder layout, the same as before. That folder only exists on gh-pages.

**Staged gh-pages layout.** I built a folder in the gh-pages layout:
- grace/ with all four viewer tabs (WEBSITE, STUDIO, CLIENT, COLOURS): zero errors and zero CSP violations, and each framed page loads under its own CSP.
- A full review run to the thank-you state: the FormSubmit post is allowed and the status shows SENT. The post was intercepted, so nothing was sent.
- grace/picks.html: the same, with the post allowed.

**Integrity checking works.** A test page with a wrong three.js hash was blocked ("Failed to find a valid digest"). The real hash loads three r160. So the check is enforced, not ignored.

**Saved data still works.** Real saved state survives a reload:
- a dashboard reply and a published drop
- review answers, including colour dots and follow-ups
- website cart (3 items) and member name

**Screenshots.** BEFORE and AFTER at the same scroll positions (dashboards at 0, 1400 and 3000 px; picks and arsenal at 0 and 1400; the other pages at 0) show the same layout. The only differences are moving smoke, the spinning coin and text that animates in.

Where the screenshots are:
- /tmp/claude-0/-home-user/eecc84f9-3433-5e66-a3b7-3250d2f0d2ac/scratchpad/audit/out/before/
- /tmp/claude-0/-home-user/eecc84f9-3433-5e66-a3b7-3250d2f0d2ac/scratchpad/audit/out/after/
- Side by side: /tmp/claude-0/-home-user/eecc84f9-3433-5e66-a3b7-3250d2f0d2ac/scratchpad/audit/out/cmp-dash.png, cmp-pages.png and cmp-more.png in the same folder

### 9. Files to copy to gh-pages at the next deploy (not done by me)

- sites/dashboard/index.html → dashboard/ and graces-dashboard/
- sites/dashboard-client/index.html → client/
- sites/dashboard-color/index.html and client/index.html → dashboard-color/ and dashboard-color/client/
- sites/grace-review/index.html and picks.html → grace/
- sites/grace-arsenal/index.html → arsenal/
- sites/grace-research/index.html → research/
- sites/bot-demo/index.html → concierge/ (with the usual ../../shared → ../shared path change)
- shared/bot/pep-bot.js → shared/bot/
- The website (site/) waits for v3. Carry the section 6 edits into v3.

---

## RECOMMENDED (owner decision)

1. **The GitHub repo is PUBLIC.** The GitHub API confirms `visibility: public`. Anyone can read every branch and all history, including:
   - **docs/prompts/**: the APEX BRAIN prompts (full and short), BRAIN-AUDIT.md, and the city-scroll and chest prompts. They quote the owner verbatim, give his first name, and mention Konshus, Notion memory and Higgsfield history.
   - **docs/owner/**: REQUEST-LEDGER.md (every owner request verbatim, including Grace's email), SALES-PLAYBOOK.md, DASHBOARD-NEXT-LEVEL-PLAYBOOK.md, SELECTION-STUDIO-PLAYBOOK.md, BROWSER-DESKTOP-CUSTOMISATION.md and the checklists.
   - **Project instructions**: CLAUDE.md, BRIEF.md, PROJECT.md and HANDOFF-V6-V8.md, plus the 45 files under .claude/ (agents and skills).
   - **Hand-off packs**: HERMES-HANDOFF/ and HERMES-HANDOFF.zip, which include the APEX lead-magnet sites "apex-*.html" and the game plan. These are also on main.
   - **Research and briefs**: docs/brief/ and docs/research/.
   - **sites/main/v2/tools/**: the northernpeptides store pull, northernpeptides-store-2026-10-29.json.

   The options:
   - **A (recommended).** Make this repo private and host the public pages on Cloudflare Pages or Netlify (free). It is the only option that keeps the history private as well. Both hosts can also set real security headers (see item 6).
   - **B.** Keep GitHub Pages, move docs/, .claude/, HERMES-HANDOFF*, CLAUDE.md, BRIEF/PROJECT/HANDOFF and the tools/ pulls into a private repo, and publish only the built pages. Old commits stay readable unless history is rewritten, and anything already cloned or forked stays out there.
   - **C.** A paid GitHub plan (Team or Pro) lets Pages publish from a private repo. The site stays public and the source becomes private.

   I changed no settings and deleted nothing.
2. **Grace's personal email is hard-coded on public pages.** `DEFAULT_EMAIL = 'Gracet@live.ca'` is on grace/ and grace/picks.html, and the "To:" line is on grace/email/preview.html. It was set on purpose (ledger R164), so I left it. The options:
   - (a) blank it and rely on the `?email=` link. The field would be empty if she opens the page without the link.
   - (b) keep it.
3. **Hide the inbox address behind a FormSubmit alias.** FormSubmit's random alias endpoint (formsubmit.co/ajax/<random>) keeps apex360marketing@gmail.com out of page source and away from scrapers. It needs one click in FormSubmit's activation email.
4. **The public website names its source store.** site/index.html (a comment), site/data/products.json (the "source" and "note" fields) and the research page all say the catalogue and prices come from northernpeptides.st. Removing it is invisible to visitors; it is a business call.
5. **Internal notes in live page comments.** Comments on live pages mention ledger numbers (R129, R055 and so on), "APEX Arsenal", internal doc paths and build tool names. A step at deploy time that strips comments would clear them.
6. **Real HTTP headers need a different host.** Meta tags cannot do clickjacking protection (frame-ancestors / X-Frame-Options), nosniff or Permissions-Policy. Cloudflare Pages or Netlify can, through a `_headers` file.
7. **A PEPTICITY domain gives it its own storage.** Today PEPTICITY shares storage with every apex360marketing-ai.github.io site, and in preview mode the pages keep emails on the device (pc-member, pepbot:captures, review answers). A custom domain such as pepticity.ca or a subdomain gives PEPTICITY its own origin. That fixes the root cause behind section 1.
8. **Patch the older live dashboards too.** previous/, previous-client/ and dashboard-sample/ (sites/dashboard-previous and sites/dashboard-sample) are live and have the same unsafe pattern as section 1. They were outside the brief, so I did not touch them. The same 7 small edits would apply.
9. **Drop `'unsafe-inline'` scripts.** The CSP still allows inline scripts, because every page uses them. Moving inline scripts into files, or allowing them by hash, would let us drop it. That is a bigger change.
10. **Self-host the fonts.** Google Fonts CSS cannot carry integrity hashes. Self-hosting Hanken Grotesk and Instrument Sans (same files, same look) removes that third party.
11. **Review auto-retry.** On open, the review page re-posts a failed send from storage to the inbox. With the shared origin, another page could plant one. Low risk; item 7 closes it.
12. **For QA (a visible bug, not security).** The live concierge page loads its font from /brand/font/PepticityBlack.woff2, which returns 404, so the headings fall back to Arial Black.

---

## NOT VERIFIED

- **Live site.** Nothing was deployed. Every test ran on a local server and a staged gh-pages folder. After deploy, re-run the console check on the live URLs.
- **Real FormSubmit delivery with `_honey`.** The post was intercepted so nothing reached the inbox. Send one real test after deploy.
- **Other browsers.** Integrity checking was confirmed in Chromium only. Older Safari and Firefox ignore the `integrity` key: nothing breaks, but there is no protection. iOS, Safari and Firefox were not tested.
- **Real GPU and phone screens.** Headless Chromium used software WebGL, and phone widths were not re-shot. No CSS changed.
- **dashboard-color's load event.** It never fires in headless Chromium, the same before and after. That page was tested at page-ready plus 6 seconds.
