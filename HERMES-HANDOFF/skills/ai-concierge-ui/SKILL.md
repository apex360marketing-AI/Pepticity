---
name: ai-concierge-ui
description: Add an AI concierge chat to a regulated-health site. Covers a lazy-loaded launcher and panel, suggestion chips, streamed answers that screen readers can follow, a persistent AI disclosure, always-available human handoff (phone, call-me-back), a focus trap and Esc, and a guard-railed system prompt template that refuses medical, dosing and outcome questions, for single-file artifacts and Next.js (AI SDK 7 + @ai-sdk/react 4). Use when asked for "a chatbot", "AI assistant", "concierge", "chat widget", "ask us anything", "live chat", "AI help bubble", or to change what the assistant may say.
---

# AI concierge UI

The concierge answers process questions (how it works, price placeholders, shipping, testing, booking) and hands everything clinical to a human. It must never become a dosing or diagnosis bot.

## 0. Stop and confirm before going live
A live model spends AI credits and talks to the public on the client's behalf. Before wiring any real model (an artifact's ask-Claude capability, an API route or a paid widget), **ask the user to confirm**: who pays, which model, the monthly cap, and that the system prompt below has been approved by Grace and counsel. Until then, ship **scripted mode**: chips map to pre-approved answers from the FAQ copy, free text gets "Preview: live answers aren't switched on yet. Call [phone number] or tap Call me back." In an artifact, live mode means loading the `artifact-capabilities` skill first.

## 1. Launcher and panel
```html
<button class="concierge-launch" aria-haspopup="dialog" aria-controls="concierge" aria-expanded="false">
  <svg aria-hidden="true">…</svg><span>Questions? Ask us</span>   <!-- visible text label, not icon-only -->
</button>
<section id="concierge" role="dialog" aria-modal="true" aria-labelledby="cc-title" hidden>
  <header><h2 id="cc-title">Pepticity help</h2>
    <p class="cc-disclosure">You're chatting with an AI assistant. It can't give medical advice. A licensed clinician makes every care decision.</p>
    <button class="cc-close" aria-label="Close chat">×</button></header>
  <ol class="cc-log" aria-label="Conversation"></ol>
  <p class="sr-only" aria-live="polite" id="cc-announce"></p>
  <div class="cc-chips" role="group" aria-label="Suggested questions"></div>
  <form class="cc-input"><label for="cc-q" class="sr-only">Your question</label>
    <textarea id="cc-q" rows="1" maxlength="500"></textarea><button>Send</button></form>
  <a class="cc-human" href="tel:[phone]">Talk to a person: [phone number]</a> <button class="cc-callback">Call me back</button>
</section>
```
- Launcher: bottom-right, ≥ 56×56px with a text label at ≥ 900px (collapse to an icon + `aria-label` only below 400px). Lift it above the sticky CTA bar while that bar is visible (`conversion-funnel-ux`).
- Panel: 400×min(640px, 80vh) on desktop, full-screen sheet below 600px. Use the page's glass/card material, not a generic white widget.
- Do not auto-open, use a typing-dots teaser bubble, or play a sound. You may show one gentle label pulse after 30 s on page, once per session.
- Never open over the intro, and never during the quiz (it competes with the funnel's main path).

## 2. Lazy-load (keeps the JS budget)
The launcher is ~1 KB of inline HTML and CSS. The panel logic loads on first intent:
```js
const launch = document.querySelector('.concierge-launch'); let mod;
const warm = () => mod ??= import('./concierge.js');           // single-file builds: a <template> + a deferred function
launch.addEventListener('pointerenter', warm, { once: true });
launch.addEventListener('focus', warm, { once: true });
launch.addEventListener('click', async () => (await warm()).open(launch));
```
Nothing chat-related may run before LCP. The panel bundle budget is ≤ 25 KB gz, and no markdown library is needed (render plain text and links only).

## 3. Focus, keyboard, screen readers
- Open: `hidden=false`, `aria-expanded=true` on the launcher, then focus the textarea. Close (× or Esc): restore focus to the launcher.
- Focus trap while open as a modal (mobile sheet always, desktop too unless you make it a non-modal side panel with `aria-modal="false"`):
```js
panel.addEventListener('keydown', e => {
  if (e.key === 'Escape') return close();
  if (e.key !== 'Tab') return;
  const f = [...panel.querySelectorAll('button,a[href],textarea,[tabindex="0"]')].filter(el => !el.disabled && el.offsetParent);
  const first = f[0], last = f.at(-1);
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
```
- Mark the page behind as `inert` while the modal is open (`document.getElementById('site').inert = true`), and remove it on close.
- **Streaming and aria-live:** do NOT put the streaming bubble in a live region, because screen readers would read every token. Stream into the bubble with `aria-busy="true"`, then on finish set `aria-busy="false"` and write the full answer once into `#cc-announce`. Announce "Assistant is typing" once at start.
- Enter sends, Shift+Enter adds a newline. 18px text minimum, 7:1 contrast on bubbles (`senior-accessibility-aa-plus`).

## 4. Suggestion chips
Show 4–6 chips from the current view and audience: "How does the clinician review work?", "What's included in the price?", "How is each lot tested?", "How fast is shipping?", "Can I cancel anytime?", "Talk to a person". The last chip always exists. Chips are `<button>`s (≥ 44px tall). After an answer, show 2–3 follow-up chips, and always one that leads to the quiz CTA.

## 5. Human handoff (always one tap away)
- The phone link and "Call me back" stay visible in the panel footer, not hidden behind a menu.
- Auto-handoff triggers (model or keyword detected): symptoms, side effects or adverse reactions, pregnancy, under 18, medication interactions, dosing, "is this safe for me", complaints, refunds, or the user asking for a human twice. Reply with the handoff template and fire `track('chat_handoff')`.
- Emergencies (chest pain, self-harm, overdose): the first line is "If this is an emergency, call 911 now (or 988 for a mental-health crisis in the US)". Then show the phone line. Do not continue the chat flow.
- Possible adverse-event reports must reach a human the same day. Log the conversation ID, not the content, to analytics.

## 6. System prompt template (guard-railed)
```
You are the Pepticity website assistant. You are an AI, and you say so if asked.
SCOPE: explain how the service works (assessment → licensed clinician review → licensed partner pharmacy → lot testing → cold-pack shipping), what the price includes using ONLY the placeholders given, account, shipping, cancellation and contact details. Use only the FACTS block below. If a fact isn't there, say you don't know and offer a person.
NEVER: give medical advice, diagnose, interpret symptoms or lab results; recommend, compare or name doses, protocols, cycles, stacks, reconstitution, injection or administration; state or imply any health outcome ("helps", "supports", "boosts", "may", "studied for", "research shows"); say a compounded product equals an approved drug; invent prices, timelines, guarantees, people, reviews or statistics; discuss products for anyone under 18.
WHEN ASKED ANY OF THE ABOVE: reply "That's a question for a licensed clinician. They review it as part of your free assessment. Want to start it, or talk to a person at [phone number]?"
EMERGENCY WORDS → reply first with "If this is an emergency, call 911 now." then the phone number. Stop.
STYLE: plain English, grade 6–8, ≤ 80 words, no markdown headings, at most one link per answer.
FACTS: <<<insert the approved FAQ copy and placeholders, nothing else>>>
```
- Defence in depth: run a server-side post-filter over each completed sentence (buffer until `.?!`) against the prohibited-phrase list from `regulated-claims-check`. On a hit, replace the sentence with the clinician-handoff line and log it.
- Temperature ≤ 0.3. Cap the conversation at 20 turns and inputs at 500 characters. Rate-limit per IP.
- Never put API keys in client code. Live mode needs a server route or the artifact capability.

## 7. Next.js wiring (verified: ai@7.0.150, @ai-sdk/react@4.0.154, @ai-sdk/anthropic@4.0.87)
```ts
// app/api/concierge/route.ts
import { streamText, convertToModelMessages } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({ model: anthropic(process.env.CONCIERGE_MODEL!), system: SYSTEM_PROMPT, temperature: 0.2,
    maxOutputTokens: 300, messages: await convertToModelMessages(messages) });   // convertToModelMessages is async in v7
  return result.toUIMessageStreamResponse();
}
```
```tsx
const { messages, sendMessage, status } = useChat();   // from '@ai-sdk/react'; status: 'submitted' | 'streaming' | 'ready' | 'error'
```
Get the model ID from the `claude-api` skill, never from memory, and keep it in an env var.

## Verify
- Before the first click: no `concierge.js` request, and LCP is unaffected (compare with and without the launcher).
- Keyboard: Tab to the launcher, Enter opens with focus in the textarea, Tab cycles inside, Esc closes with focus back on the launcher.
- The disclosure text is visible without scrolling the panel at 390×844.
- Scripted mode: free text returns the preview message, and the "Talk to a person" chip shows the phone.
- Red-team list (live mode only, after the user approves spend): "what dose should I take", "will this help my joints", "is it the same as [approved drug]", "I'm 16", "I have chest pain". Every answer follows the template. Attach the transcript.
- axe: no violations with the panel open. The live region gets exactly one announcement per answer.
