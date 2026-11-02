---
name: model-router
description: Use at the start of EVERY task and whenever the work changes size. Picks the cheapest model and effort that will do the job well, and sends sub-jobs to the scout (Haiku), builder (Sonnet) or architect (Opus) agents so tokens are not burned. Also tells the owner when to switch the main session model by hand.
---
# MODEL ROUTER (owner, 2 Nov 2026: "no reason to be on Opus extra high for something simple")

Honest limit: a skill or hook cannot change the model of the running chat. What it CAN do: route sub-jobs to agents that each run on their own model. So the main chat stays on Sonnet, and heavy or cheap jobs go out to the right agent.

## Routing table
| Job | Who | Effort |
|---|---|---|
| find / search / list / read-and-summarise, "does X exist" | `scout` (Haiku) | low |
| edit a page, fix a bug, copy tweak, run the browser check, write a test | main chat or `builder` (Sonnet) | medium |
| research with sources, summarising many files | `scout` first, Sonnet to write it up | low to medium |
| plan a big build, architecture, compliance review of a whole feature, stuck debugging | `architect` (Opus) | high |
| anything that spends money (Higgsfield) or publishes | main chat, owner OK first | n/a |

## Rules
1. Default = Sonnet, medium. Do not escalate unless: the same fix failed twice, the change touches more than ~5 files, or the owner asks for a plan or review.
2. Send reading and searching to `scout` BEFORE reading big files in the main chat.
3. Escalate to `architect` for the plan only; hand the build back to `builder`.
4. When a job clearly needs a bigger main session (long refactor, whole-site redesign), say so in one line: "Suggest /model opus for this, then back to sonnet after."
5. Never let a cheaper model make an owner decision. Options still go to the owner.
