---
name: pepticity-lead-engine
description: The PEPTICITY lead machine. Use whenever a PEPTICITY page needs a form, quiz email gate, booking, call-back, SMS opt-in, newsletter, waitlist, lot lookup, exit slide-in or any other way of collecting a name, email or phone; when tagging leads by hook; when writing CASL/TCPA consent text; or when drafting the email and text sequences. Pairs with guided-quiz-funnel, peptide-regulatory and peptide-copy-and-guide.
---

# PEPTICITY lead engine

The site is a selling machine: every visitor should leave a way to reach them, and the list sells afterwards. Everything here stays inside the rules in `peptide-regulatory`.

## 1. The capture points (hook ids)
H01 to H33 are defined in `docs/research/lead-magnet-hooks.md`. Added from the 2026-10-28 competitor research:
- H34 Live member card ("Join PEPTICITY": the name writes onto a member card, FRM-02).
- H35 Wipe-to-reveal welcome gift (CRD-124). The gift is content or service (the primer, a consult-prep call), never a price cut on a drug.
- H36 Sentence sign-up: "I want to feel ___ and I live in ___" (FRM-104). Captures goal and province.
- H37 Ask the GUIDE: "Email me this answer".
- H38 5-day email course "Peptides, explained".
- H39 Live Q&A evening sign-up.
- H40 Quiz email gate: 3 tap questions first, then "Where should we send your plan?"

## 2. Placement rules
- One clear ask every 1 to 1.5 screens. Never two pop-ups per visit. Nothing over the quiz or booking. Slim sticky bar on phones.
- Ask for one field where possible; ask for the phone only where it is the point (call-back, SMS, booking).
- The quiz asks 3 easy questions before the email (questions-before-email lifts completion).

## 3. Consent (CASL first, then TCPA for US)
- An unticked checkbox the visitor ticks. Never pre-ticked, never bundled into "Continue".
- Text beside it, exactly: "Yes, PEPTICITY may email me [the thing] and occasional news. I can unsubscribe any time." For SMS: "Yes, PEPTICITY may text me about [the thing] at this number. Message and data rates may apply. Reply STOP to stop."
- Record: consent text shown, timestamp, page, hook id, IP country. Keep the record for 3 years after the last message.
- Every message carries sender name, mailing address [placeholder], and a one-click unsubscribe.

## 4. Payload (one shape for every form)
```json
{ "hook": "H40", "page": "home", "name": "", "email": "", "phone": "",
  "province": "", "goal": "", "consent_email": {"given": true, "text": "...", "at": "ISO"},
  "consent_sms": {"given": false}, "utm": {}, "created_at": "ISO" }
```
- Health or quiz answers beyond goal and province stay out of the payload unless the visitor booked a consult; they then go only to the clinical intake, never to marketing tools.
- Never send any field value to analytics. Analytics events: `form_view`, `form_start`, `form_submit`, `cta_click:{hook}` only.

## 5. Where it goes
- Review builds (artifacts) cannot send data: show "Preview only: nothing was sent." and keep the payload behind `#debug`.
- Live builds: POST to one lead endpoint (a Canadian-region database function), validated on both sides, rate-limited, with a honeypot field. From there it syncs to Grace's email and text platform with the hook as a tag. Name the platform only in internal notes, never on a page Grace's customers see.

## 6. Sequences (drafts for Grace and counsel)
1. Welcome (5 emails over 10 days): the primer; how it works; meet the clinicians; what lot testing means; book a consult.
2. Quiz started, not finished: +2 h, +2 days.
3. Result seen, no booking: "Your plan is waiting" +1 day; the clinician checklist +3 days.
4. Consult booked: confirmation; what to prepare; reminders 24 h and 1 h before (SMS if consented).
5. After the consult: next steps; delivery tracking; how to reach the team.
6. Refill and check-in reminders timed to the plan.
7. Win-back after 60 quiet days: a new guide or live Q&A invite.
8. GRACE'S LETTER monthly to everyone.
Every email: one ask, Grace's voice (see `peptide-copy-and-guide`), no claims, no doses, no prices on drugs beyond name/price/quantity, CASL footer.

## 7. Done means
A test lead for every live hook is visible in the store with its hook tag and consent record, and each sequence has a DRAFT ready for approval.
