# PEPTICITY: Grace's install and sign-up list (researched 2 Nov 2026)

For: Grace Taylor, owner of PEPTICITY. She is not technical. Assumes a Windows 11 PC, with the Mac version given too.
Goal: an AI "Concierge" runs the business day to day, and the agency (APEX) can help remotely.
Prices are in USD unless marked CAD. Sales tax is extra. "Unverified" means I could not confirm it on an official page.

---

## 0. What the repo actually says (read before deciding anything)

- **Store platform:** nothing has been chosen for PEPTICITY. Grace's current live store is **northernpeptides.st on WooCommerce** (shared/inventory.js: "Grace's live store, northernpeptides.st (WooCommerce Store API)"). All the WooCommerce hits in the repo come from that read-only pull, and none of them are a PEPTICITY decision.
- **Payments:** none chosen. The build review says "Not deployed and Stripe not connected". Square only shows up as CSS words (for example "square corners"). No processor appears in any decision.
- **Hosting and the email/text platform:** **not chosen.** Request ledger R058 ("Where the site is hosted, and which email/text platform Grace uses") is still WAITING, and ledger item 30 says "CRM and email/text platform plus hosting, not chosen". The security audit (docs/owner/AUDIT-SECURITY-2026-10-30.md) recommends a custom domain such as pepticity.ca, hosted on Cloudflare Pages or Netlify.
- **Grace's email:** Gracet@live.ca (ledger R164). That is a free consumer Outlook.com/Live address, not a business mailbox.
- **"Concierge" in the repo** is the **website chat bot** in `shared/bot/pep-bot.js` (vetted answers, cart adds), which is live at the GitHub Pages concierge/ page. It is **not Hermes.** Ledger R162 adds "concierge in dashboard".
- **Hermes in the repo:** `HERMES-HANDOFF/` is a **website-design hand-off pack for the Hermes agent**: 5 site versions, 27 lead-magnet designs, logo lab, BRIEF.md and 44 Higgsfield media links. It holds **no Concierge, install or Tailscale setup.** Other mentions are the APEX Brain notes ("installing and registering the MCP in ... Hermes" on the owner's machine) and a "Hermes Apex Relay" session.
- **Conflict to flag:** HERMES-HANDOFF/README.md says "Research-use-only peptide store ... Grace has NO licensed clinician or pharmacy". PROJECT.md says clinician-guided (Decision 0, 26 Oct), "NOT a research-use-only store". Ledger R055 (28 Oct) says "No physician, clinician or pharmacy yet". R169 (30 Oct) says "research-first ... play in the gray". **Hermes must not be handed the README's research-use-only brief as current.**
- **Tailscale, uptime monitoring, backups, Hostinger:** zero mentions in the repo. Uptime appears in 2 files, both unrelated. The agency's own Claude account does have Hostinger hosting and email connectors attached, so Hostinger may be the agency's default host. That is not written down anywhere for PEPTICITY.

---

## Summary table

| # | Item | Cost / month | Current version | Can the kit install it silently? | Does Grace sign in or approve herself? |
|---|---|---|---|---|---|
| 1 | Tailscale | Personal $0 (non-commercial only); Standard $8 per user | 1.104.4 (28 Oct 2026) | Yes: `winget install -e --id Tailscale.Tailscale` / `brew install --cask tailscale-app` | Yes: one admin (UAC) prompt, then signs in with Google/Microsoft/Apple in the browser. Mac also approves the system extension or VPN. |
| 1b | NetBird (the alternative) | Free (5 users, 100 machines); Team €6, Business €12 per user (EUR) | 0.82.0 (29 Oct 2026) | Windows yes: `winget install -e --id Netbird.Netbird`. Mac: not in Homebrew core or casks (only NetBird's own tap or package, unverified) | Yes: browser sign-in |
| 2 | Hermes Agent (Nous Research) | Agent is free (MIT licence). Model: Nous Portal Plus $20 **or** a pay-as-you-go API key | v0.22.6 (2 Nov 2026) | **No winget package** (checked winget-pkgs). Windows: MSIX via `.appinstaller` from the website, or `iex (irm https://hermes-agent.nousresearch.com/install.ps1)`. Mac: DMG (Apple Silicon only), or `brew install hermes-agent` (homebrew/core 0.22.4; Nous lists Homebrew as "unsupported") | Yes: Nous Portal OAuth sign-in or an API key, a Telegram bot token, and an email app password |
| 3 | Claude desktop app | Pro $20 ($17 on annual billing); Max $100 (5x) or $200 (20x) | Windows 2.42304.2 (winget, 19 Oct); Mac cask 4.4212.0 | Yes: `winget install -e --id Anthropic.Claude` / `brew install --cask claude` | Yes: claude.ai sign-in and plan purchase |
| 4 | Google Chrome (recommended) | $0 | 156.0.8078.74 (winget) / 156.0.8078.80 (cask) | Yes: `winget install -e --id Google.Chrome` / `brew install --cask google-chrome` | Signs in to her Google profile (optional, recommended) |
| 5 | Bitwarden (recommended) | Free 2-person org $0; Teams $4 per user, billed annually | 2026.10.3 (2 Nov 2026) | Yes: `winget install -e --id Bitwarden.Bitwarden` / `brew install --cask bitwarden` | Yes: she creates the account and master password herself (the agency must never know it) |
| 5b | 1Password (the alternative) | Families $5.99 regular ($4.49 promo); Teams Starter $24.95 flat for 10 (third-party reports); Business $8.99 per user | 8.12.42 | Yes: `winget install -e --id AgileBits.1Password` / `brew install --cask 1password` | Yes: account, Secret Key and password |
| 6 | Business email | Google Workspace Starter about $7 to $8.40 USD per user (CAD unverified); M365 Business Basic CAD 8.10 per user (annual); Hostinger email CAD 0.59 to 2.79 promo (48-month prepay) | n/a | n/a (web) | Yes: domain owner verification and DNS changes |
| 7 | Store and payments admin | Not chosen (current store is WooCommerce) | n/a | n/a (web) | Yes: KYC and identity checks at the processor |
| 8a | Authenticator: Ente Auth | $0 | 4.4.26 | Yes: `winget install -e --id ente-io.auth-desktop` / `brew install --cask ente-auth`. Phone app from the store | Yes |
| 8b | Telegram (Concierge alerts) | $0 | Desktop 7.3.3 (winget) | Yes: `winget install -e --id Telegram.TelegramDesktop` / `brew install --cask telegram` | Yes: phone number login, then she creates a bot with @BotFather |
| 8c | UptimeRobot | Free: 50 monitors, 5-minute checks, commercial use OK | n/a (web) | n/a | Agency can own it; alerts go to Grace |
| 8d | Backblaze Personal Backup | $99 per computer per year (about $8.25 a month) | 10.0.4.1082 (cask) | Windows: **not in winget** (download from backblaze.com). Mac: `brew install --cask backblaze` | Yes: account, plus Mac Full Disk Access |
| 8e | Windows Update / macOS updates | $0 | n/a | Built in | She keeps "Get the latest updates" on |

---

## 1. Tailscale (the owner calls it "Tailspin")

- **What it is:** a private network that lets the agency reach Grace's PC (and the Concierge machine) securely from anywhere, with no open ports.
- **Why Grace needs it:** the agency can fix things remotely, and Hermes's dashboard or web app can stay private.
- **Plans (tailscale.com/pricing, checked 2 Nov 2026):**
  - Personal $0: up to 6 users, unlimited user devices, 50 tagged resources, 3 ACL groups, basic Tailscale SSH on 5 hosts, basic roles. The page labels it **"Non-commercial use only."**
  - Standard $8 per user per month. Premium $18 per user per month. Enterprise custom. Personal Plus is a legacy plan only.
  - PEPTICITY is a business, so the honest plan is **Standard: 2 users (Grace + 1 agency seat) = $16 a month.** If the agency uses its own tailnet and Grace's machine is shared into it, check the terms first (unverified).
- **Who owns the tailnet: Grace (recommended).** Her business, her devices, her billing. She invites the agency as **Admin**, and she can remove the agency at any time. If the agency owned it, Grace's PC would sit inside the agency's network and she would lose control if the relationship ended.
- **Tailscale SSH:** the server side runs on **Linux and macOS only, not Windows** (kb/1193). For a Windows PC use:
  - **RDP over Tailscale.** Windows 11 **Home cannot host Remote Desktop**, only Pro can (Microsoft Q&A and third-party guides; I did not find the official support article). Check Settings > System > About. If she has Home: upgrade to Pro (CAD price unverified) **or**
  - **Quick Assist** (built into Windows, free). Grace approves every session herself, so it does not work unattended.
- **Install:** `winget install -e --id Tailscale.Tailscale` (version 1.104.4, machine scope: one UAC "Yes" prompt). Mac: `brew install --cask tailscale-app` (1.104.4, needs its system/VPN extension approved in System Settings).
  - The unattended part: `tailscale login --auth-key=<key> --unattended` (Windows) joins the PC with no browser step and keeps it connected after logout (kb/1080). Grace (the owner) generates the key in her admin console, or the agency does as Admin.
- **What Grace will see:** Windows UAC "Do you want to allow this app to make changes"; a browser sign-in (Google/Microsoft/Apple/GitHub); "Connect device"; on Mac, "Allow VPN configuration" and the system extension prompt.
- **NetBird (the alternative):** open source WireGuard mesh. Free plan: 5 users, 100 machines. Team €6 per user per month, Business €12 (prices shown in EUR only). Whether commercial use is allowed on Free: unverified (not on the pricing page). winget `Netbird.Netbird` 0.82.0. **Not** in Homebrew core or casks.

## 2. Hermes: the AI agent that runs the Concierge

- **Confirmed:** "Hermes" is **Nous Research Hermes Agent** (github.com/NousResearch/hermes-agent, MIT licence). It is a self-improving agent with persistent memory and skills. The repo's HERMES-HANDOFF folder is a design brief given to this agent, which matches.
- **Why Grace needs it:** it is the Concierge's brain. It answers email, sends Telegram updates and runs scheduled jobs (daily sales or stock report, nightly backups).
- **Latest version:** **v0.22.6, released 2 Nov 2026** (GitHub releases; 0.22.5 was 22 Oct, 0.22.4 was 21 Oct).
- **Install on Windows: no WSL2 needed.** Windows 10/11 native is Tier 1.
  - Easiest: the **Hermes Desktop** installer from hermes-agent.nousresearch.com. It is a signed MSIX opened with Windows App Installer, and it **requires Windows 11 22H2 or later.** A Microsoft Store listing also exists (its ID is unverified).
  - Command line: `iex (irm https://hermes-agent.nousresearch.com/install.ps1)`. It installs to `%LOCALAPPDATA%\hermes\` (per-user, and it bootstraps its own Git and uv). Add `-NonInteractive` to skip the setup questions.
  - **winget: not available** (searched winget-pkgs on 2 Nov 2026: no NousResearch or Hermes package).
- **Install on Mac:** DMG, then drag Hermes.app to Applications (**Apple Silicon only**; Intel Macs get the CLI only). Or `curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash`. Homebrew core has a `hermes-agent` formula (0.22.4), but Nous's platform page lists Homebrew as **unsupported**, so use the official installer.
- **Model and cost: choose one.**
  - **Nous Portal** (the recommended path; one OAuth login, `hermes setup --portal`): Free $0 (free models only), **Plus $20 a month**, Super $100, Ultra $200 (portal.nousresearch.com). Paid plans include all models (Claude, GPT, Gemini and others), a Tool Gateway (web search, image generation, text-to-speech, browser), and a **Cloud agent** (Plus: 4 GB RAM, 25 GB disk). The cloud agent means the Concierge could run without Grace's PC staying on. Third-party sources (Hostinger) say Plus includes about $22 of monthly credit. That is unverified on the Nous site.
  - **Own API key, pay as you go** (via `hermes model`): Anthropic Claude Sonnet 5.5 costs $2 per million input tokens and $10 per million output tokens; Haiku 5.5 costs $0.10 / $0.50. Monthly usage cost depends on volume (not estimated). **A Claude Pro subscription is not an API key.** Hermes needs its own key or Nous Portal.
- **Dashboard or web UI:** Hermes Desktop (Windows/Mac app). The docs mention "the dashboard" with a gateway status badge. v0.22.6 release notes add a **web app served by the gateway (`hermes webapp`)** and a "Desktop Web Access" pane. Keep it reachable only over Tailscale.
- **Messaging gateways:** Telegram, WhatsApp (Baileys bridge) and WhatsApp Cloud API, Email (IMAP/SMTP), Signal, SMS, Slack, Discord, Google Chat, Microsoft Teams, iMessage (BlueBubbles) and more.
  - **Telegram:** @BotFather `/newbot` gives a token. Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_ALLOWED_USERS=<numeric ID>`. Without the allow-list it refuses everyone. The desktop app has "Create with QR".
  - **Email:** use a **dedicated mailbox** (for example concierge@pepticity.ca) with IMAP on and an **app password** (2FA required). Settings: `EMAIL_ADDRESS`, `EMAIL_PASSWORD`, `EMAIL_IMAP_HOST`, `EMAIL_SMTP_HOST`, `EMAIL_ALLOWED_USERS`, `EMAIL_AUTHSERV_ID`. For Gmail: `imap.gmail.com` / `smtp.gmail.com` / `mx.google.com`. For M365: `outlook.office365.com` / `smtp.office365.com`. Unknown senders are ignored unless pairing is turned on.
  - **WhatsApp:** the Baileys bridge is an unofficial client, so the number could be banned (my assessment; not stated in the docs). Prefer Telegram, or the official WhatsApp Cloud API.
- **Scheduled tasks:** built-in cron. The gateway checks every 60 seconds and delivers results to any platform. `failure_deliver` sets where failure notices go.
- **Always-on:** `hermes gateway install` creates the Windows Task Scheduler task `Hermes_Gateway`, which starts **at logon** and is **not restarted if it crashes.** On Mac it creates a launchd agent. So Grace's PC must stay on and logged in (set sleep to Never), **or** use the Nous cloud agent or a small always-on box.
- **What Grace will see:** App Installer's "Install Hermes" dialog; the Nous Portal OAuth consent page in the browser; Telegram BotFather chat; Google's "App passwords" page (after turning on 2-Step Verification).

## 3. Claude desktop app

- **What it is:** Anthropic's Claude app for Windows and Mac, for chat, files, connectors and Claude in Chrome.
- **Why Grace needs it:** for her own questions and drafts, and the agency can share projects with her. It does not run the Concierge (Hermes does).
- **Plans (claude.com/pricing, 2 Nov 2026, USD; no CAD shown):**
  - Free $0.
  - **Pro $20 a month, or $17 a month billed $200 a year.** Includes Claude Code, Projects, Claude in Chrome, scheduled tasks and Dashboards (beta).
  - **Max from $100 a month (5x Pro usage, includes $100 a month in API credits).** The $200 a month 20x tier is confirmed by third-party sources and the 7 Oct 2026 API-credit change. Only the $100 figure appeared in my fetch of the official page.
  - Team: Standard seat $20 (annual) or $25 (monthly); Premium seat $100 or $125.
- **Recommendation: Pro.** Max is only worth it if she becomes a heavy user.
- **Install:** `winget install -e --id Anthropic.Claude` (MSIX, 2.42304.2, released 19 Oct 2026; per-user, usually no admin prompt). Mac: `brew install --cask claude`.
- **What Grace will see:** a claude.ai sign-in (email code or Google), a payment page, and later the permission prompts for connectors, the Chrome extension and file access.

## 4. Browser: **Google Chrome (recommended)**

- **Why Chrome:** Claude in Chrome officially supports Chrome. Edge is listed in the Claude Code docs, and Brave is **not** officially supported. Her Google profile also keeps passwords off the browser (Bitwarden handles them) and syncs bookmarks.
- Versions: winget `Google.Chrome` 156.0.8078.74 (machine scope, elevates itself with a UAC prompt). Cask `google-chrome` 156.0.8078.80.
- Edge is already on Windows (winget `Microsoft.Edge` 156.0.4314.58) and makes a fine backup. Brave: `Brave.Brave` / `brave-browser` 1.98.63.
- Turn off Chrome's built-in password saving once Bitwarden is installed.

## 5. Password manager: **Bitwarden (recommended)**

- **Bitwarden** (bitwarden.com/pricing):
  - Free: 1 user, plus sharing with 1 other user through a **free 2-person organization** (2 collections).
  - Premium $19.80 a year. Families $47.88 a year (6 users).
  - **Teams $4 per user per month** and Enterprise $6, both billed annually.
  - Grace + agency in a 2-person org costs **$0.** Moving to Teams later (2 users = $8 a month) gives proper roles.
  - Version 2026.10.3 (2 Nov 2026). Open source.
- **1Password:**
  - Individual $3.99 a month ($2.99 promo). Families $5.99 ($4.49 promo), 5 users, unlimited shared vaults, guest accounts.
  - Teams Starter Pack and Business: official FAQ shows Teams Starter $19.95 rising to $24.95 a month for up to 10 people (annual). Third parties report Business at $8.99 per user (up from $7.99, July 2026). Effective date unverified.
  - Version 8.12.42.
- **Recommendation: Bitwarden.** It is cheaper ($0 to start), its two-person sharing fits "Grace + agency" exactly, and the agency can be removed in one click. Grace owns the organization. Shared collection "PEPTICITY: agency access" holds only the logins the agency needs. Her personal vault stays private.
- **What Grace will see:** create account; set a master password (she writes it on paper, and the agency never sees it); accept the organization invite; turn on two-step login.

## 6. Her email

- Today Grace uses **Gracet@live.ca** (consumer Outlook.com). A business needs **@pepticity.ca** (domain not yet bought or chosen; see the security audit).
- **Google Workspace Business Starter:** about **$7 USD per user per month on annual billing, or $8.40 on Flexible** (secondary sources). A Canadian figure of about **CAD 8 per month / CAD 80 a year** is unverified, because Google's Canadian pricing page loaded with blank prices. 30 GB, limited Gemini in Gmail.
- **Microsoft 365 Business Basic:** **CAD 8.10 per user per month, annual** (microsoft.com/en-ca, seen in a search result; the page returned 503 to a direct fetch). Web/mobile Office, Exchange 50 GB, Teams.
- **Hostinger Business Email:** Starter **CAD 0.59** / Standard 1.39 / Premium 2.79 per mailbox per month, **only on a 48-month prepay**. It renews at CAD 2.29 / 3.89 / 5.59.
- **Recommendation: Google Workspace Starter, 1 user (grace@) + free aliases** (orders@, hello@). Hermes's Gmail setup is documented step by step, and Grace already knows web mail.
  - **Option B (if the agency hosts on Hostinger):** Hostinger email is cheapest, but its IMAP and app-password details for Hermes are unverified.
  - The Concierge should get its **own** mailbox or alias with an app password, not Grace's main login. Note: on Workspace a second mailbox is a second paid user, so an alias plus a Gmail filter may be enough.
- **What Grace will see:** domain purchase; "Verify you own this domain" (a DNS TXT record, which the agency can add); admin console sign-in; 2-Step Verification setup.

## 7. Store and payments admin

- **What the repo says:** PEPTICITY has no store platform or processor yet. Grace's current store is WooCommerce (northernpeptides.st). Stripe is "not connected". The PEPTICITY site is static pages on GitHub Pages.
- **Processor restrictions (brief):**
  - **Stripe** restricted list (stripe.com/legal/restricted-businesses):
    - Prohibited: "Pseudo-pharmaceuticals or nutraceuticals that are not safe or make harmful claims" and "Incorrectly labeled research chemicals".
    - **Restricted (needs approval, which can be revoked):** "Online pharmacies", "Card-not-present prescription-only products and pharmaceuticals", "Telemedicine and telehealth services".
    - Peptides are not named.
  - **WooPayments** is "built in partnership with Stripe", so expect Stripe's rules (inferred).
  - **Shopify Payments** (help.shopify.com eligibility, general list): prohibits "prescription drugs" and "Pseudo pharmaceuticals: Pharmaceuticals and other products that make health claims that are not verified by a local or national regulatory body." The Canada-specific list was not readable (404). Peptides are not named in the text I could read, but secondary sources say peptide stores get shut down.
  - **Square Canada:** unverified (the terms page returned 429).
  - **Practical meaning:** a research-use-only peptide catalogue is high-risk on Stripe, Shopify Payments and Square. The clinician-guided model would fall under Stripe's *restricted* "prescription / telemedicine" lane, which needs approval. **Decision needed from the owner and counsel** before choosing a platform. A high-risk processor is likely, and a current list was not researched.
- **What Grace will see:** KYC with government ID, business number and bank account; the processor's underwriting questions; and 2FA on the store admin.

## 8. What the Concierge needs (the plumbing)

- **Email access:** a Gmail/Workspace or M365 mailbox with **IMAP on and an app password** (Hermes uses IMAP/SMTP, not the Gmail API). Grace turns on 2-Step Verification and creates the app password herself, or the agency does it during a screen-share.
- **Inventory:**
  - Start: a **Google Sheet** (IN STOCK / SOLD OUT / COMING BACK, matching SALES-PLAYBOOK §7) that Hermes reads, shared to the Concierge account.
  - Later: the store's API (WooCommerce REST keys, read-only) once the store exists.
  - The repo's `shared/inventory.js` is the vetted product list (a draft).
- **Uptime monitoring: UptimeRobot Free.** 50 monitors, 5-minute checks, "personal and commercial", email alerts. SMS is a paid add-on (10 credits for $3). Telegram on the Free plan: unverified. Solo is $12 a month (annual) or $13 monthly.
  - Alternative: **Better Stack** Free (10 monitors, 1 status page, Slack and email alerts). Its paid tier starts with a $29 to $34 Responder seat.
  - The agency can own the monitor and add Grace's email and Telegram for alerts.
- **Backups:**
  - **Backblaze Personal Backup, $99 a year per computer** (unlimited data). Windows: download from backblaze.com (not in winget). Mac: `brew install --cask backblaze`.
  - Also have Hermes run a nightly export (orders, inventory sheet, `~/.hermes` config and memory) to Google Drive (winget `Google.GoogleDrive` 133.0.2).
  - The store database needs its own host backups once a host is chosen.
- **2FA app: Ente Auth (recommended).** Free, open source, encrypted cloud backup, so codes survive a lost phone. Phone app plus desktop: winget `ente-io.auth-desktop` / cask `ente-auth` 4.4.26. Google Authenticator or Microsoft Authenticator also work. Turn 2FA on for: Google/M365, Tailscale login, Bitwarden, Claude, Nous Portal, the store, the processor, the domain registrar and Telegram (two-step password).
- **Alerts: Telegram** (free; the bot is made with @BotFather; Hermes supports it natively). WhatsApp only through the official Cloud API.
- **Windows auto-updates:** Settings > Windows Update: keep it on; turn **"Get the latest updates as soon as they're available"** on; set **active hours** so restarts don't kill the Concierge overnight. Power settings: **sleep = Never** while plugged in, because the Hermes gateway only runs while the PC is on and logged in.
  - winget keeps apps current: `winget upgrade --all --silent`. Hermes can run this weekly as a cron job. The Hermes MSIX updates itself.
- **Also essential (things the request missed):**
  1. **Domain** (pepticity.ca), registered **in Grace's name** with 2FA. It is needed for email, the store and its own storage origin (security audit item 7).
  2. **Windows edition check** (Home vs Pro): it decides RDP.
  3. **A UPS or "restart after power loss" BIOS setting** if her PC hosts the Concierge (my suggestion; unverified need).
  4. **A written "break-glass" sheet:** Bitwarden emergency kit plus Ente recovery phrase, kept on paper by Grace.
  5. **CASL-compliant email/text platform** (R058, still open) before any Concierge sends marketing email.

---

## Monthly cost estimate (USD unless noted)

| Item | Lean | Recommended |
|---|---|---|
| Tailscale | $0 (Personal, see the non-commercial caveat) | $16 (Standard x 2) |
| Hermes model | $20 (Nous Plus) | $20 (Nous Plus) + API overflow (variable) |
| Claude Pro | $20 | $20 ($17 on annual billing) |
| Chrome, Telegram, Ente Auth, UptimeRobot | $0 | $0 |
| Bitwarden | $0 (2-person org) | $8 (Teams x 2) |
| Email | about $7 (Workspace Starter, annual) | about $7 |
| Backblaze | — | about $8.25 |
| **Total** | **about $47 USD a month** | **about $79 USD a month**, plus model overflow |

Not included: domain (about CAD 15 to 25 a year; unverified), store platform, payment processing fees, a Windows Pro upgrade, and sales tax.

---

## Unverified items (and why)

- Google Workspace **CAD** price: Google's en_CA page showed blank prices, and only secondary sources quote figures.
- M365 Business Basic CAD 8.10: seen in a search result from microsoft.com/en-ca, but the direct fetch returned 503.
- Claude Max $200 (20x) tier: only third-party sources. The official page fetch showed $100 only.
- 1Password Teams Starter and Business current prices: an official FAQ plus third parties, with no confirmed effective date.
- Nous Portal included credit amounts ($22 / $110 / $220): Hostinger articles only.
- Hermes Microsoft Store ID; the exact `hermes webapp` behaviour (one line in the release notes).
- NetBird Free commercial use; NetBird Mac install path.
- Square Canada restrictions (429 error); Shopify Payments Canada-specific list (404).
- UptimeRobot Telegram on Free.
- Windows 11 Home cannot host RDP: Microsoft Q&A and third-party sources, no official support article retrieved.
- Windows 11 Pro upgrade price in CAD: not researched.

---

## Sources (all checked 2 Nov 2026)

- Repo: /home/user/pepticity/PROJECT.md, HERMES-HANDOFF/README.md, HERMES-HANDOFF/BRIEF.md, shared/inventory.js, docs/owner/REQUEST-LEDGER.md, docs/owner/SALES-PLAYBOOK.md, docs/owner/AUDIT-SECURITY-2026-10-30.md
- winget manifests: https://github.com/microsoft/winget-pkgs (shallow sparse clone, HEAD of 2 Nov 2026): Tailscale.Tailscale 1.104.4, Netbird.Netbird 0.82.0, Anthropic.Claude 2.42304.2, Google.Chrome 156.0.8078.74, Microsoft.Edge 156.0.4314.58, Brave.Brave 156.1.98.63, AgileBits.1Password 8.12.42.36, Bitwarden.Bitwarden 2026.10.3, ente-io.auth-desktop 4.4.26, Telegram.TelegramDesktop 7.3.3, Google.GoogleDrive 133.0.2.0. No NousResearch/Hermes or Backblaze package.
- Homebrew: https://formulae.brew.sh/api/cask/{tailscale-app,claude,google-chrome,brave-browser,1password,bitwarden,ente-auth,telegram,backblaze,microsoft-edge}.json ; https://formulae.brew.sh/api/formula/hermes-agent.json (0.22.4) ; netbird: not found
- https://tailscale.com/pricing ; https://tailscale.com/terms ; https://tailscale.com/kb/1193/tailscale-ssh ; https://tailscale.com/kb/1080/cli
- https://netbird.io/pricing
- https://github.com/NousResearch/hermes-agent ; https://github.com/NousResearch/hermes-agent/releases
- https://hermes-agent.nousresearch.com/docs ; /docs/getting-started/installation ; /docs/getting-started/platform-support ; /docs/integrations/nous-portal ; /docs/user-guide/messaging/ ; /docs/user-guide/messaging/email ; /docs/user-guide/messaging/telegram
- https://portal.nousresearch.com/ ; https://www.hostinger.com/tutorials/hermes-agent-cost (secondary)
- https://claude.com/pricing ; https://platform.claude.com/docs/en/about-claude/pricing ; Max 20x: https://www.heyuan110.com/posts/ai/2026-04-03-claude-pricing-complete-guide/ (secondary)
- Claude in Chrome browsers: https://code.claude.com/docs/en/chrome ; https://claudeissues.com/issue/90793-docs-edge-support-contradicts-between-claude-code-chrome-docs-and-help-center-ar
- https://bitwarden.com/pricing/ ; https://bitwarden.com/help/about-organizations/
- https://1password.com/pricing/password-manager ; https://support.1password.com/cs/business-pricing-faq/ ; https://pricingsaas.com/companies/1password/diffs/2026W28 (secondary)
- https://workspace.google.com/intl/en_ca/pricing.html ; https://www.emailvendorselection.com/google-workspace-pricing/ (secondary)
- https://www.microsoft.com/en-ca/microsoft-365/business/microsoft-365-plan-chooser (via search) ; https://www.swd.ca/services/office-365/ (reseller)
- https://www.hostinger.com/ca/business-email
- https://stripe.com/legal/restricted-businesses ; https://help.shopify.com/manual/payments/shopify-payments/eligibility ; https://www.shopify.com/legal/aup ; https://woocommerce.com/document/woopayments/our-policies/know-your-customer/ ; https://www.beautyindependent.com/shopify-dumps-beauty-e-commerce-websites-payment-processing-service/
- https://uptimerobot.com/pricing/ ; https://betterstack.com/pricing
- https://www.backblaze.com/cloud-backup/pricing
- RDP on Home: https://learn.microsoft.com/answers/a/12753520
