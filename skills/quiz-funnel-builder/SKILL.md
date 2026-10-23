---
name: quiz-funnel-builder
description: Build an assessment-style quiz funnel from a JSON schema with branching, one question per screen, resume state, keyboard and screen-reader support, email capture on the result screen, no diagnosis language, and privacy-safe analytics, in vanilla JS for single-file artifacts or with Motion's AnimatePresence in the Next.js app. Use when asked for "a quiz", "assessment", "find your plan", "product finder", "lead-gen quiz", "eligibility questions", "which program is right for me", "multi-step form", or to change the quiz's questions, branches or result paths.
---

# Quiz funnel builder

Quizzes are the highest-converting lead path for health DTC (about 7.9–11.3% lead capture; see `conversion-funnel-ux`). A quiz is also where compliance breaks most easily, because it asks health questions and is tempted to "diagnose". Build from data, never hand-code screens.

## 1. Schema (single source of truth)
```json
{
  "id": "pep-assess", "version": 3,
  "questions": [
    { "id": "goal", "type": "single", "title": "What brings you here today?",
      "help": "Pick the closest one. You can change it later.",
      "options": [
        { "value": "aging",    "label": "I want to stay active as I get older" },
        { "value": "energy",   "label": "I haven't felt like myself lately" },
        { "value": "training", "label": "I train hard and want to recover well" }
      ],
      "next": [ { "if": { "eq": "training" }, "go": "sport" }, { "go": "age" } ] },
    { "id": "sport", "type": "single", "title": "How often do you train?", "options": [/*…*/], "next": [{ "go": "age" }] },
    { "id": "age", "type": "single", "title": "Which age range are you in?", "options": [/* 18–34 … 65+ */],
      "next": [ { "if": { "eq": "under18" }, "go": "@stop-minor" }, { "go": "meds" } ] },
    { "id": "meds", "type": "single", "title": "Do you take any prescription medicines?",
      "help": "A clinician will review this. It doesn't rule you out.",
      "options": [{ "value": "yes", "label": "Yes" }, { "value": "no", "label": "No" }, { "value": "unsure", "label": "Not sure" }],
      "next": [{ "go": "@result" }] }
  ],
  "results": [
    { "id": "path-aging", "when": { "goal": "aging" }, "title": "Your path: Healthy-aging review",
      "body": "A licensed clinician reviews your goals with your current medicines in mind and decides if a plan is right for you." },
    { "id": "path-default", "when": {}, "title": "Your path: Clinician review", "body": "…" }
  ],
  "stops": { "@stop-minor": { "title": "This service is for adults 18 and over.", "body": "If you have questions, call [phone number]." } }
}
```
- `next` is an ordered rule list where the first match wins, and the last rule has no `if`. Operators: `eq`, `in`, `any` (for `multi`). Reserved targets: `@result` and `@stop-*`.
- Validate on load: every `go` resolves, there are no cycles (DFS), every path reaches `@result` or a stop in ≤ 7 steps, and `results` ends with a catch-all `when: {}`. Throw in dev and fall back to a static CTA in prod.
- Keep it to 4–7 questions. Each extra question costs about 5–10% of completions. The first question must be the easiest and most identity-affirming (goal or audience). Never open with age, weight or medicines.
- The audience switcher (`audience-personalization`) pre-answers `goal` and skips to the next question, and the progress text reflects that.

## 2. Compliance in the quiz
- **Results describe a service path, never a condition.** Forbidden: "you may have low testosterone", "your symptoms suggest", "you are a candidate for [compound]", "deficiency", "risk score", any named compound or dose.
- Allowed: "Your path: [service name]", "A licensed clinician decides if a plan is right for you", next steps and price placeholder.
- Hard stops: under 18, pregnant or breastfeeding, and emergency symptoms. Show a stop screen with neutral copy and the phone number. Chest pain or a crisis gets "Call 911 now" (US) as the first line.
- Run every question, help text and result through `regulated-claims-check`.

## 3. Screen rules
- One question per screen. Answer options are real `<input type="radio">` or `type="checkbox"` inside `<fieldset>` + `<legend>` (the question). Labels are the whole row, ≥ 56px tall, 18–20px text. Site 1's `aria-pressed` buttons inside a `<fieldset>` are an acceptable alternative for single-choice. Never use bare `<div>` tiles.
- Single-choice auto-advances 250 ms after selection (visible check first), with a Back button always present. Multi-choice uses a Continue button that stays disabled until valid, with the reason shown as text.
- Progress is text plus a bar: "Question 2 of 5". Recompute "of" from the current branch (shortest remaining path).
- Result screen order: (1) the personalised path title and body, shown BEFORE asking for anything; (2) the email field (+ optional phone) with the value stated ("Email me my path and book my free clinician review"); (3) an unticked consent checkbox for marketing, separate from submission; (4) "Prefer to talk? [phone number]" and "Call me back".
- Preview builds: `preventDefault` and show "Preview only: nothing was sent." (BRIEF.md). Never fake a success state.

## 4. Engine (vanilla, single-file artifacts)
```js
const KEY = `quiz:${SCHEMA.id}:v${SCHEMA.version}`, TTL = 7 * 864e5;
const load = () => { try { const s = JSON.parse(localStorage.getItem(KEY)); return s && Date.now() - s.t < TTL ? s : null; } catch { return null; } };
const save = s => { try { localStorage.setItem(KEY, JSON.stringify({ ...s, t: Date.now() })); } catch {} };
let state = load() || { answers: {}, path: [SCHEMA.questions[0].id] };
const byId = Object.fromEntries(SCHEMA.questions.map(q => [q.id, q]));
const match = (rule, v) => !rule || ('eq' in rule ? v === rule.eq : 'in' in rule ? rule.in.includes(v) : 'any' in rule ? [].concat(v).some(x => rule.any.includes(x)) : true);
function nextId(q) { return q.next.find(r => match(r.if, state.answers[q.id])).go; }
function answer(qid, value) {
  state.answers[qid] = value;
  state.path = state.path.slice(0, state.path.indexOf(qid) + 1);   // changing an old answer prunes later branches
  const n = nextId(byId[qid]); if (!n.startsWith('@')) state.path.push(n);
  save(state); render(n.startsWith('@') ? n : null);
}
function back() { if (state.path.length > 1) { state.path.pop(); save(state); render(); } }
```
- Resume: if `load()` returns progress, offer "Pick up where you left off?" with **Resume** and **Start over** buttons. Never silently jump to question 4.
- Clear the stored answers after a successful submit, and on "Start over".
- Store health answers in `localStorage` only on this device. Never send them to analytics (track `quiz_step {step, of}` only).

## 5. Accessibility
- On every step change, move focus to the new `<legend>`'s wrapper heading (`tabindex="-1"`) and announce in a polite live region: `"Question 3 of 5"`. Do not use `aria-live` on the whole card, or it re-reads everything.
- Arrow keys move between radios natively. Enter on a focused radio advances. Esc is NOT bound (it is reserved for dialogs and the intro).
- Errors: `aria-invalid="true"` + `aria-describedby` to a text message. Never colour alone.
- The Back button is a `<button>` before the options in DOM order, with a visible label "Back".
- Reduced motion: no slide, swap instantly (keep the 250 ms selected-state confirmation, which is a state change and not motion).

## 6. Next.js version (Motion + AnimatePresence)
Verified: `motion@14.6.0` (published 2026-10-22). Pin an exact version, and use one at least two weeks old if it is ever loaded from a CDN.
```tsx
'use client';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
export function QuizStep({ q, dir, children }: { q: Question; dir: 1 | -1; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const v = { enter: (d: number) => ({ x: reduce ? 0 : d * 40, opacity: 0 }), center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: reduce ? 0 : d * -40, opacity: 0 }) };
  return (
    <AnimatePresence mode="wait" custom={dir} initial={false}>
      <motion.fieldset key={q.id} custom={dir} variants={v} initial="enter" animate="center" exit="exit"
        transition={{ duration: reduce ? 0 : .32, ease: [.2, .8, .2, 1] }}
        onAnimationComplete={() => document.getElementById(`q-${q.id}`)?.focus()}>
        <legend id={`q-${q.id}`} tabIndex={-1}>{q.title}</legend>{children}
      </motion.fieldset>
    </AnimatePresence>
  );
}
```
- `key={q.id}` drives enter/exit, and `mode="wait"` prevents two fieldsets (and two legends) existing at once for screen readers.
- Keep the engine (section 4) as a framework-free module and the React layer as rendering only, so the artifact and the app share the schema and logic.
- The state store is `useReducer` with the same `answer`/`back` semantics, persisted with the same KEY and TTL.

## Verify
- Schema validator passes, and a script walks EVERY branch combination to a result or stop (log the count).
- Keyboard-only run: Tab → arrows → Enter reaches the result with no mouse. Focus lands on each question heading (`document.activeElement.id`).
- Reload at question 3: the Resume prompt appears and restores question 3 with answers intact.
- The result screen shows the path BEFORE the email field (DOM order and visual order).
- Grep the result and question copy for: diagnos, deficien, symptom, suggests, candidate, dose, mg, risk score. Expect zero hits.
- `dataLayer` contains no answer values. axe has no violations on every step. 390px has no sideways scroll.
