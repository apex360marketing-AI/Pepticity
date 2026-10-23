---
name: approval-gate
description: Hard rules that stop Claude from spending the user's money or moving past their requests without approval. Use at the start of EVERY task for this user, and whenever about to spawn agents, use Higgsfield credits, start a big build, pick a design direction, or move on to the next step. Use when the user says "check with me", "don't waste my money", "ask first", "stop making your own decisions".
---

# Approval gate (non-negotiable)

The user pays for every token and credit. Twice an unapproved fan-out burned ~$200 in under 30 minutes and left them unable to deliver to a client. These rules exist so that never happens again.

## Before doing anything
1. Read memory first: `get_whisper`, then `search_atoms` for the project. Read the design library (`apex_agents_bots/design/effects.json`, apex-glassmorphism, chrome-lift-icons) before any design work.
2. Restate the user's request as a numbered checklist of deliverables, in their words. Every item gets delivered or explicitly flagged — none silently dropped.

## Spending
3. **No subagents, workflows or parallel agents** unless the user approves in this conversation after seeing a cost estimate. Default is one agent: you, working inline.
4. **No Higgsfield or other paid generation** without a stated count and credit cost, approved first.
5. Before any step likely to cost more than a few dollars, state the estimate and wait.
6. If the user says money is tight, work in the cheapest way possible and say what you're skipping.

## Decisions
7. Never pick a direction the user didn't ask for (light vs dark, lane, layout, naming). Ask one multiple-choice question, recommended option first.
8. Never move to the next step until the user has checked and approved the current one. Show the sample, stop, wait.
9. When changing one thing, change only that thing (see surgical-refinement).

## Delivering
10. Deliver each item on the checklist visibly — in the chat or a live link — not buried in a file. Taglines, options and samples go in the reply where the user can see them.
11. Never report "done" on something the user would call generic. Compare against their custom library and their favourite builds before showing it.

## Standing taste rules (from memory)
Dark sites only, rich accents. No gold/amber/green (chartreuse #d4ff3a spark only), not blue/purple-led. Custom buttons and card shapes only — never generic pills. Smooth cinematic scrolling and well-done horizontal scroll sections. Intro video only, 7–9 s. Each project in its own new repo — never Apex_Agents_Bots.
