---
name: "member-card-wallet"
description: "Give a member their card on their phone: an Apple Wallet and Google Wallet pass that glows with the brand, shows their name and number, links to one-tap re-order and can carry offers and tips, plus an installable store app with push messages. Use when the owner asks for a downloadable card, a widget, an app for members, re-order shortcuts, or messages to members' phones."
---

# Member card on the phone

A real home-screen widget needs a native app per platform. The premium, practical
equivalent is a **wallet pass** (it lives in Apple Wallet or Google Wallet, can appear on
the lock screen, updates itself and can show a message) plus an **installable web app**
(home-screen icon, one-tap re-order, push messages). Build both; ask before spending money
on accounts.

## 1. What the owner must set up (his accounts, his money)

- Apple Developer Program membership (paid yearly) and a Pass Type ID certificate.
- A Google Wallet issuer account (free) and a service account.
- The signing keys never enter the page, the repository or chat: they live in the host's
  secret store (for example Cloudflare Workers secrets).

## 2. The pass

- Design: the chosen Founders card artwork as the strip image, the brand P as the logo and
  icon, the member's name, `No. 07 of 25`, `PLATINUM`, and a QR code that opens their
  members' page. Colours exactly the brand's (black ground, chrome lettering, the one blue).
- Issue it only from a signed request created after the member qualified (server side);
  a pass is never generated in the browser.
- Updates: the pass web service changes a field (for example "New lot: first access until
  Friday") and the phone shows it. Space messages out; every message type must be covered
  by the member's consent.

## 3. The installable app

- Web app manifest with the brand icon and the member's card as the start screen,
  standalone display, offline page; the re-order screen opens with their last order filled in.
- Web push only after the member taps to allow it, on their own action; offers and tips
  only (research and store information, never dosing, use or health advice).
- Works on iOS (installed to the Home Screen) and Android.

## 4. Proof before showing

- The pass installs on a real iPhone and a real Android phone; name, number and QR are right.
- An update reaches the phone; an unsubscribed member gets nothing.
- The app installs, opens to the card, re-orders, and shows a push only after consent.
- Screenshots of the pass and the app at real phone sizes, looked at before showing.
