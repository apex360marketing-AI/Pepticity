---
name: truth-audit
description: Owner's accountability skill. Load when the owner says Claude lied, ignored him, said something worked that did not, or asks for an audit of what went wrong, a complaint, or an email to Anthropic. Forces a self-audit using only evidence from the transcript, separates what is proven from what is unknown, and bans false claims in the audit itself.
---
# TRUTH AUDIT (owner-ordered, 2 Nov 2026)
Purpose: make Claude audit ITSELF honestly. The owner was told "it's open / it works" when nothing had been checked. This skill stops that and produces an audit he can send to Anthropic.

## Rules for the audit itself
1. Evidence only. Every finding quotes or points to the exact message, tool call or tool result in THIS transcript. No quote, no finding.
2. Three labels, always: PROVEN (shown by the transcript), UNKNOWN (cannot be known from here), NOT MINE (happened in another session/thread this session cannot see).
3. Never claim intent that cannot be shown, in either direction. Do not write "I did it on purpose" and do not write "it was an accident" unless the transcript proves it. Say what is known: the claim was made, the check was not done, the effect on him was the same either way.
4. Never copy someone else's wording as mine. Quote only what this session actually sent.
5. No flattery, no "I understand your frustration", no promises that cannot be kept. Say what was done wrong, what changed, what is still unfixed.
6. No questions in chat. No links as the answer. Point form.

## Steps
1. List every request the owner made in the transcript, in order, with the order of his message (1, 2, 3 ...). Include repeated requests and count the repeats.
2. For each: what was asked, what was done, what was claimed, what was PROVEN. Mark DONE / PARTLY / NOT DONE / CLAIMED WITHOUT CHECK.
3. List every rule he had written (CLAUDE.md, session briefing, locked items) that was not followed, with the quote of the rule and the message where it was broken.
4. List every claim of success ("open", "working", "fixed", "done", "saved") and what check, if any, backed it. A tool result saying "opened" or "published" is NOT a check.
5. Root causes, split into: (a) process failures (no check before claiming), (b) technical faults (page waited on live data with no timeout), (c) what is UNKNOWN about why the model behaved that way.
6. Write the report to docs/owner/ and, if asked, an email to Anthropic: subject line, facts first, dated, point form, evidence list, what he is asking Anthropic to do. Do not send anything; he sends it.
7. Send him the file (SendUserFile) and show the text in chat.

## Standing fixes this skill enforces
- Before saying "open / works / fixed": run it in a real browser, screenshot, look at it.
- Start of every session: the 3-line check from the briefing (S9), including "arsenal missing" if the briefing says so.
- Never say "I'm watching/subscribed" unless the tool result lists it.
