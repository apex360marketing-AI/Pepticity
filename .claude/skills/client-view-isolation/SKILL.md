---
name: client-view-isolation
description: Make sure a CLIENT (customer) page never carries the OWNER's data, screens or controls. Use whenever a dashboard, portal or app has an owner view and a client view (PEPTICITY Grace's dashboard, client portals, APEX customer dashboards), before any client link is shared, published or put on a domain, and whenever someone says "leak", "the client can see the owner side", "#owner", "split the dashboards".
---

# CLIENT VIEW ISOLATION

**Rule:** a client page is built as its OWN file with the owner side removed.
Hiding the owner view (CSS, a default tab, a `#client` hash, JS that flips the view on load) is NOT isolation.
Anything in the HTML or JS ships to the browser: view-source, DevTools or typing `#owner` shows it.

## 1. Inventory (before touching code)
List every owner-only item in the source page:
- **DOM:** the owner `<main>`/section, owner tabs, quick actions (add product, receive stock, add expense), the owner/client switch.
- **DATA:** unit cost, units sold, revenue, COGS, margins, expenses, tax, other customers' names, cities, spend, messages, referral ladders, email list size, marketing stats.
- **CODE:** owner renderers (`RENDER.sales`, `money`, `customers`…), owner listeners, CSV/export of owner data.
- **ROUTES:** `#owner` hash, `?view=owner`, `setView('owner')`, keyboard shortcuts.
- **STORAGE:** the localStorage key the owner side writes (expenses, receipts). The client build must use its OWN key, or it reads the owner's saved data on a shared device.

## 2. Build, don't hand-edit
- Generate the client page with a script (`tools/build_client_dashboard.py` in PEPTICITY) from the owner source. Every cut is anchored with an `assert` so a changed source fails loudly instead of leaking quietly.
- Re-run the script every time the owner dashboard changes. Never edit the client copy by hand.
- Data the client legitimately sees (prices, sizes, in/low/out status, their OWN orders and thread) is rebuilt from a client-safe list. Fields like `cost` and `units` are dropped, not zeroed.
- The view is hard-wired to client. The hash router ignores `owner`, and the switch is removed from the header.

## 3. Prove it (the leak scan)
Run `tools/leak_scan.py <client.html>`. It fails on any owner marker, for example:
- owner element ids `view-owner`, `p-money`, `kMonth`, `expForm`, `custTbl`
- data names `SEED_EXP`, `CUST`, `unitCost`, `COGS`
- owner copy `MONEY + TAXES`, `GRACE (OWNER)`, `NET PROFIT`
- other customers' names
Then in real Chromium:
- open `client/#owner` and `client/?view=owner` and confirm only the client view renders, with 0 console errors
- click every client tab
- check `window.S` / globals for owner data
- take before/after screenshots at the same scroll positions (dashboard rule)
- **Sabotage check:** put one owner marker back into the built file and confirm the scan FAILS. A scan that can't fail proves nothing.

## 4. Ship
Only after the scan passes and the screenshots are checked. The owner page keeps its switch (Grace uses it); the client link points only at the client build.
