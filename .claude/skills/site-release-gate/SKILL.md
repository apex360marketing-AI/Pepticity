---
name: "site-release-gate"
description: "The last step before any site change reaches the owner or the public: apply every change in a fixed order with the security step last, prove each change is repeatable, run every check (works, scroll, regressions, security, no visual change), look at the pictures, publish to a NEW address and prove it is live. Use when about to publish, push to gh-pages, give the owner a new link, or finish an audit round."
---

# Release gate: nothing goes live that was not proved together

Each fix can pass its own checks and still break when combined with the others: a
security policy hashed before a later patch blocks that patch's script; a scroll
control can fight a dialog the works fix added. This gate builds the release in one
fixed order and proves the combination, not the pieces.

Publishing is outward-facing: publish only when the owner asked for a link or a release,
and never change the client's own address without the owner's own yes.

## 1. Build from the live file, in this order

1. Start from what is live right now (fetch the published branch; never from a stale copy).
2. Apply each change script (anchored on exact strings, never line numbers) in this order:
   content and works fixes, then the scroll control, then any later fixes, then the
   **security patch LAST** (it hashes the inline scripts, so anything after it breaks them).
3. Repeatable: run the whole chain a second time on its own output; the bytes must not
   change. A script that stops on a missing anchor means the page moved under it: fix the
   anchor, never force it.

## 2. Run every check on the combined build

Run each change's own check first, then the regressions the owner already complained
about (keep that list; every past complaint is a test). For each: seen failing on the
unchanged page at least once, passing on the release. Typical set:
- works and interactions at 390, 768, 1280, 1440 (every control opens, closes, returns focus)
- scroll (one gesture one stop, steady travel, nothing flies past, layers hold the page)
- security (`static-site-security`: repro, check, CSP walk with 0 violations)
- no visual change where none was asked: element boxes and section screenshots compared
- 0 page errors, 0 console errors, no sideways scroll at any width
A flaky check is re-run under CPU throttling until it is understood: never wave it through.

## 3. Look at it

Take the first screen and the changed sections at 390 and 1440 and open the pictures.
Several defects in past releases passed every check and were obvious in the first picture.

## 4. Publish to a new address, then prove it is live

1. Publish as a new folder (for example `/v2/`) next to the old one, so the owner can
   compare and nothing they already sent anyone changes.
2. Commit with the attribution lines the session gives; never force-push.
3. Wait until the live file's hash equals the built file's hash, then run the smoke
   checks against the live address, not the local copy.
4. Save the change scripts and check scripts (never attack scripts for weaknesses that are
   still open) where the next session will find them.

## 5. Tell the owner in plain words

One link. Then a short table: what was fixed, what was hardened, what stays open and
why (the owner's decisions named as decisions), and what could not be verified
(real phones, Safari, Firefox). No jargon without a five-word explanation.
