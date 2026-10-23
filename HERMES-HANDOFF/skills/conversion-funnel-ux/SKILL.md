---
name: conversion-funnel-ux
description: Structure a cinematic site as a sales machine for regulated health DTC. Covers sales-page anatomy (objection → evidence → CTA every 1–1.5 screens), above-the-fold rules, a sticky mobile CTA that never covers focus, a compliant hook library (all-in pricing, free clinician review, real founding rates, real guarantees), privacy-safe event instrumentation, an A/B hypothesis template and 2026 benchmarks. Use when asked to "make it convert", "add CTAs", "sales page structure", "above the fold", "sticky buy button", "hooks", "offer stack", "funnel", "tracking events", "A/B test idea", "why isn't this converting", or when planning the section order of any Pepticity/APEX template.
---

# Conversion funnel UX (regulated health DTC)

A cinematic site that does not sell is a demo reel. Plan the funnel BEFORE choosing effects, then let the effects serve each beat. All compliance rules in `BRIEF.md` and `regulated-claims-check` apply to every hook here. Run the finished copy through `regulated-claims-check`.

## 1. Page anatomy (Home view)
Write it as a beat sheet first, one row per screen (1 screen = 1 viewport height at 390×844 and at 1440×900):
| Beat | Job | Must contain |
|---|---|---|
| Hero | What, for whom, next step | H1 ≤ 10 words (service + audience), sub ≤ 25 words, primary CTA, phone line, 3-item trust strip |
| Objection 1 | "Is this legit?" | Licensed clinician decides, licensed partner pharmacy, lot testing (evidence: sample CoA labelled SAMPLE) → CTA |
| How it works | Reduce effort fear | 3–4 steps, time per step ("60-second assessment"), what happens after → CTA |
| Objection 2 | "What does it cost?" | All-in price placeholder `$[xx]/mo`, what is included, how to cancel → CTA |
| Audience paths | "Is this for me?" | 5 audience entries (see `audience-personalization`), each opening the quiz pre-filled |
| Objection 3 | "Who are you?" | Real people placeholders, lab and cold-chain process, phone hours → CTA |
| FAQ excerpt | Remaining doubts | 4–6 questions, link to full FAQ view |
| Final CTA | Decide | Quiz + "Call me back" + phone, risk reversal only if real |

**Rule:** every 1–1.5 screens, run objection → evidence → CTA. No stretch longer than 1.5 screens may lack a visible CTA. Measure it (see Verify).

## 2. Above the fold
- At 390×844, the H1, sub-line, primary CTA and phone number are visible with no scrolling, *after* the intro hands off and even with the text-size control at 125%.
- Have one primary CTA (filled) and at most one secondary (ghost). CTA copy names the next step and its cost in time: "Start the 60-second assessment", not "Get started" or "Learn more".
- Trust strip: three short facts that are true and verifiable ("Licensed clinicians", "Licensed partner pharmacy", "Every lot third-party tested"), with `[confirm with Grace]` until each is confirmed.
- No carousel in the hero. No auto-advancing anything that holds the offer.
- LCP < 2.0 s still applies (see `perf-budget-cwv`). A slow hero kills conversion more than any copy does.

## 3. Sticky mobile CTA
```css
.sticky-cta { position: fixed; inset: auto 0 0 0; z-index: 40; display: flex; gap: 8px; padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
  transform: translateY(110%); transition: transform .35s cubic-bezier(.2,.8,.2,1); }
.sticky-cta.on { transform: none; }
.sticky-cta a { flex: 1; min-height: 52px; }      /* 48px minimum target; 52px for seniors */
@media (min-width: 901px) { .sticky-cta { display: none; } }
html { scroll-padding-bottom: 84px; }             /* WCAG 2.4.11: focused fields are never hidden behind it */
```
```js
const hero = document.querySelector('.hero .cta-primary'), stops = document.querySelectorAll('.lead-form, footer');
let heroGone = false, stopVisible = false;
const sync = () => cta.classList.toggle('on', heroGone && !stopVisible);
new IntersectionObserver(([e]) => { heroGone = !e.isIntersecting && e.boundingClientRect.top < 0; sync(); }).observe(hero);
const seen = new Map(), io = new IntersectionObserver(es => { es.forEach(e => seen.set(e.target, e.isIntersecting));
  stopVisible = [...seen.values()].some(Boolean); sync(); });
stops.forEach(s => io.observe(s));
```
- Show it after the hero CTA scrolls off. Hide it while the lead form or footer is visible, and hide it when the on-screen keyboard is open (`visualViewport.height < innerHeight * .75`).
- Use two buttons maximum: primary action plus a phone icon button with a visible "Call" label (not icon-only).
- It must not overlap the chat launcher. Lift the launcher by the bar height while the bar is on.

## 4. Hook library (regulated health, safe forms)
Use ≥ 6 distinct hooks per template, each one at most twice. Every hook must be TRUE for this business, and anything unconfirmed stays a bracketed placeholder.
| Hook | Safe phrasing pattern | Only if |
|---|---|---|
| All-in pricing | "$[xx]/month covers your clinician review, your plan and cold-pack shipping. You see the full price before you pay." | The price really includes those |
| Free review | "The assessment and clinician review are free. If a plan isn't right for you, you pay nothing." | No hidden consult fee |
| Founding rate | "Founding members keep $[xx]/month for as long as they stay. [N] places, closes [date]." | The cap and date are real. **Fake scarcity or countdown timers are deceptive (FTC). Never.** |
| Guarantee | "[Guarantee terms: confirm with Grace and counsel]" | Written terms exist. Never guarantee results or outcomes |
| Easy cancel | "Cancel online in two clicks, no phone call needed." | The flow really is two clicks |
| Testing transparency | "Every lot is tested by an independent lab. Ask for the report for your lot." | The CoA exists per lot |
| Real humans | "Real people answer at [phone number], [hours]." | It is staffed |
| Process speed | "Most reviews finish within [x] business days." | Measured, not hoped |
| Cold chain | "Shipped in a cold pack, tracked to your door." | True |
| Customer intent | "I want to keep up with my grandkids" in the CUSTOMER's voice, as a goal they bring, never as a promise | Labelled as an example goal |

Never use: outcome claims, before/after images, star ratings, testimonials, doctor names, "studied for", "supports", "clinically proven", invented counts ("10,000 members"), or a price comparison with an approved drug.

## 5. Event instrumentation
Use one `track()` that pushes to `dataLayer` (or the CRM) and **never sends health answers**. Consumer-health-data laws (e.g. Washington's My Health My Data Act) can treat quiz answers as health data. Send step numbers and audience IDs only, and only after consent.
```js
window.dataLayer = window.dataLayer || [];
const track = (event, props = {}) => { if (!window.__consent?.analytics) return; dataLayer.push({ event, ...props, view: location.hash.slice(1) || 'home', ts: Date.now() }); };
document.addEventListener('click', e => { const el = e.target.closest('[data-track]'); if (el) track(el.dataset.track, { loc: el.dataset.loc }); });
```
| Event | Props | Fires on |
|---|---|---|
| `intro_skip` / `intro_complete` | `t` (seconds) | Skip or finish |
| `audience_select` | `aud` | Switcher change |
| `cta_click` | `loc` (hero, obj1, sticky…) | Any CTA |
| `quiz_start`, `quiz_step`, `quiz_complete` | `step`, `of` (never answers) | Quiz |
| `lead_submit` | `source` | Form submit (preview build: still fires, shows "Preview only") |
| `call_click`, `callback_request` | `loc` | `tel:` link, callback form |
| `chat_open`, `chat_handoff` | — | Concierge |
| `scroll_depth` | `pct` 25/50/75/100 | Once each per view |

## 6. A/B hypothesis template
```
ID: AB-[NN]   Page/beat: [hero / obj2 / sticky]   Metric: [quiz_start rate per session]   Guardrail: [lead_submit, INP]
Because we saw [evidence: event data, session replays, user quote],
we believe changing [one element] for [audience] will move [metric] from [baseline] to [target].
Sample: [N per arm] from a 2-proportion power calc (α .05, power .8); minimum run 14 days, full weeks only.
Stop rule: no peeking before N. Ship if p < .05 and the guardrail does not drop by more than 5% relative.
Compliance check: both variants passed regulated-claims-check on [date].
```
Test one variable at a time. Do not run tests below about 1,000 sessions per arm per month. Put that traffic into qualitative testing instead.

## 7. Benchmarks (for sanity, not targets)
- Quiz-funnel lead capture: about **7.9–11.3%** of quiz starters (ConvertFlow, Sep 2026).
- Popups: about **2.1%** average conversion (Omnisend). A quiz CTA in-flow usually beats an exit popup, so do not add a popup to a cinematic page without a test.
- Below 3% quiz completion means the first question or the load time is the problem, not the copy at the end.

## Verify
- CTA spacing: in Playwright, collect `top` of every visible `[data-track=cta_click]` per view, sort, and assert each gap ≤ 1.5 × `innerHeight` at both 390×844 and 1440×900.
- Above the fold at 390×844 after intro: H1, primary CTA and phone each have `getBoundingClientRect().bottom <= innerHeight`. Repeat with `html[data-text=large]`.
- Sticky bar: hidden at top, shown after the hero, hidden over the form. Tab into the last form field and check it is not covered (its rect bottom < bar top).
- `dataLayer` never contains quiz answer text (grep pushed objects for answer labels).
- Count distinct hooks used (≥ 6) and list them in the report.
