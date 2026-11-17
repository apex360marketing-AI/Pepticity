---
name: "site-e2e-journeys"
description: "End-to-end audit of a website the way a visitor uses it: every journey driven in a real browser on phone and desktop (land, menu, find a product, add to cart, checkout, join the founders list, consent boxes, every link), with console errors, failed requests, sideways scroll and frozen frames recorded and every step proved by a screenshot that was looked at. Use when asked for an E2E or end-to-end audit, to check that everything works, before every release, and after any fix round."
---

# Site E2E journeys: drive it like a visitor, prove every step

Static checks find what is written. Only a browser driven through the real journeys finds
what a visitor meets. Run this after `site-audit-harden` and before `site-release-gate`.

## Set up (once per run)
- Serve the build from its own folder on 127.0.0.1 (never test the live site with write actions).
- Chromium is pre-installed: `require('playwright')`, `chromium.launch()`. Do not install browsers.
- Two contexts every time: desktop 1440x900, and phone `devices['iPhone 13']` (390 wide).
- Also one phone run with the CPU slowed 4x (CDP `Emulation.setCPUThrottlingRate`) for freezes.
- Record for each context: `console` errors, `pageerror`, failed requests (`requestfailed`, status >= 400),
  CSP violations (`securitypolicyviolation` listener added with `addInitScript`).

## The journeys (write each as a numbered script step with a specific assertion)
1. LAND: first screen paints; time to first paint and to the offer being readable; no error.
2. MENU: open it, every item opens its target, the target is visible (bounding box on screen), menu closes.
3. FIND A PRODUCT: by menu and by scrolling; product name, size and price visible together.
4. CART: add, change quantity, remove; totals match the listed prices exactly.
5. CHECKOUT: every step reachable; required fields refuse empty and bad input with a message;
   nothing personal is written to localStorage/sessionStorage/cookies (read them back and assert).
6. JOIN / FOUNDERS: the form works with valid input, refuses bad input, consent boxes start UNTICKED
   and are separate; typed names render as plain text (try `<img src=x onerror=alert(1)>`).
7. EVERY LINK: collect all `a[href]`; internal ones land on a visible target; external ones have
   `rel="noopener"`; none 404.
8. KEYBOARD: Tab through the page; every interactive element gets a visible focus ring; Esc closes
   dialogs; focus returns to the opener.
9. MOTION: with `reducedMotion: 'reduce'`, animation loops stop (sample a canvas twice, 1 s apart).
10. LAYOUT: no sideways scroll (`scrollWidth <= innerWidth`) at 390 and 1440; nothing overlaps
    the fixed header; tap targets >= 44 px measured.

## Rules
- A step passes only on a specific value (`total === '$129.00'`), never on "element exists".
- Screenshot every journey's end state at deviceScaleFactor 1 and LOOK at each one.
- Before reporting a FAIL, reproduce it by hand once; most first FAILs are the script being wrong.
- Re-run the owner's past complaints as their own steps (the regression list); report each.
- Report a table: journey, phone, desktop, proof (screenshot path or value), and what was not tested.
