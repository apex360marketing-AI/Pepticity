# MICROCOPY: QUIZ, RESULT, CHECKOUT, BOT, FOOTER, EMAIL, STATES

Exact draft lines for counsel. Placement style for every disclosure: one line, the page's own typeface, 15-16px, muted ink at AA contrast on its ground, sentence case, no icon (or a tiny hairline mark), no red, no box, no pop-up. Headings stay in CAPITALS. Lines marked S0 come from `pepticity/docs/research/quiz-and-guide-research.md`.

## 1. QUIZ
| Where | Line |
|---|---|
| Start screen heading | FIND YOUR FOCUS |
| Under Start (S0 #1) | About 2 minutes. This points you in the right direction. It isn't a medical assessment. |
| Stage rail | GOAL · ABOUT YOU · HEALTH · YOUR CARE |
| Head start (Q1 pre-filled) | GOAL ✓ You told us this already. |
| Bridge after GOAL | Training focus, noted. A few quick questions about you next. |
| Bridge after ABOUT YOU | Thanks. Three short health questions. Your answers go only to the clinician reviewing your consult. |
| HEALTH stage, under the question (S0 #2) | Your answers go only to the clinician reviewing your consult. Unwell right now? Call 911. |
| "Not sure" helper | Not sure is a fine answer. Your clinician will go through it with you. |
| Building moment | Matching your focus… Checking clinicians in [province]… Preparing your summary. |
| Back button | Back |
| Resume banner | Welcome back. Pick up where you left off? [Continue] [Start over] |

## 2. RESULT PAGE
| Where | Line |
|---|---|
| Heading | YOUR FOCUS: [CATEGORY] |
| Answer chips label | WHAT YOU TOLD US · Edit |
| Next steps heading | WHAT HAPPENS NEXT |
| Step 1 | A consult with a clinician licensed in [province], by [video / phone / message], as you chose. |
| Step 2 | If the clinician decides a plan is right for you, it's sent to our licensed partner pharmacy. |
| Step 3 | Discreet delivery, [timeline: confirm with Grace]. |
| Programs block (until counsel clears names) | Your clinician will go through options and pricing with you. |
| All-in price note | Consult $[xx] CAD. Programs from $[xx] CAD for [quantity], including [pharmacy fee, shipping]. Taxes extra. If the clinician decides it isn't right for you, you won't be charged for the program. [confirm with Grace] |
| Primary CTA | BOOK YOUR CONSULT |
| Under the CTA (S0 #3) | A licensed clinician decides if a plan is right for you. |
| Secondary actions | Ask the guide · Call me back · Email me this summary |
| Email summary box | ☐ Email me this summary. (separate) ☐ Send me PEPTICITY news. You can unsubscribe any time. |
| Clinician-first variant CTA | BOOK A CLINICIAN CALL FIRST |
| Clinician-first line | Because of something you shared, a clinician would like to talk with you before anything else. That's routine, and it's free. [confirm "free"] |
| Hard stop: under age | PEPTICITY is for adults [18/19]+ in [province]. Please talk with a parent or your family doctor. (No CTA; answers discarded.) |
| Hard stop: pregnancy | This one's not for you right now. Please talk with your own doctor or midwife first. |
| Waitlist (province not served) | We're not in [province] yet. Leave your email and we'll tell you when we are. ☐ Yes, email me when PEPTICITY opens in [province]. |

## 3. BOOKING AND CHECKOUT
| Where | Line |
|---|---|
| Heading | BOOK YOUR CONSULT |
| Price summary | Consult $[xx] CAD · [what's included] · Taxes $[x] · Total $[xx] CAD |
| Renewal (if membership) | Renews at $[xx] CAD every [period] until you cancel. Cancel in two clicks from your account. [confirm] |
| Required consent, unticked, beside pay (S0 #4) | ☐ I understand PEPTICITY's guide and quiz don't give medical advice, and a licensed clinician will decide whether any plan is right for me. [Terms] · [Privacy] |
| Health-data consent (separate, unticked) | ☐ I agree that my quiz answers can be shared with the clinician and the care team for my consult. [Privacy] [counsel to word under PIPEDA / Law 25] |
| Marketing (separate, unticked) | ☐ Send me PEPTICITY news. You can unsubscribe any time. |
| Pay button | CONFIRM AND PAY $[xx] CAD |
| Error: consent unticked | Please tick the box above so we know you've read it. |
| Error: card declined | Your card didn't go through. Nothing was charged. Try again or use another card. |
| Success heading | YOU'RE BOOKED |
| Success line | A clinician will contact you by [method] [timeline: confirm]. We've emailed your confirmation. |

## 4. PEPTICITY GUIDE (BOT) CHROME
| Where | Line |
|---|---|
| Header name | PEPTICITY GUIDE |
| Header subtitle (S0 #5) | Not medical advice |
| First message, once (LIB `intro`) | Hi, I'm the PEPTICITY GUIDE. I can explain how PEPTICITY works and help you find the right next step. I'm not a doctor, and this isn't medical advice: anything about your own health goes to a licensed clinician. |
| Input placeholder (S0 #7) | Ask about programs, pricing or how it works |
| Personal-question hand-off (S0 #8) | That's one for your clinician. Want me to find you a time? |
| Unknown (LIB `fallback`) | I don't have a vetted answer for that yet, and I won't guess. A person can help at [phone number], or browse the peptides and common questions. |
| Talk-to-a-person (LIB `human`) | A real person can help. Call [phone number], or leave your number and the care team will call you back. |
| Offline / error | I can't connect right now. A person is at [phone number]. |
| Avatar | A neutral PEPTICITY monogram. Never a face, white coat or stethoscope. |

## 5. FOOTER
- Legal line (S0 #9): "PEPTICITY provides access to independent licensed clinicians and a licensed partner pharmacy. Content on this site is general information, not medical advice. [Final legal copy to be approved by counsel.]"
- Emergency line: "In an emergency, call 911. In a mental-health crisis, call or text 9-8-8."
- Links: TERMS · PRIVACY · HOW IT WORKS · CONTACT · [Clinician licences]

## 6. EMAILS (transactional unless marked)
| Email | Subject | Opening line |
|---|---|---|
| Quiz summary (requested) | Your PEPTICITY summary | Here's what you told us and what happens next. A licensed clinician decides if a plan is right for you. |
| Booking confirmation | Your consult is booked | You're booked with a clinician licensed in [province] on [date]. |
| Clinician decision: yes | Your clinician's plan | Your clinician has decided a plan is right for you. Here's what's included and the full price before anything is charged. |
| Clinician decision: no | An update from your clinician | Your clinician has decided a plan isn't right for you right now. You haven't been charged for a program. Here's why, and what they suggest. |
| Shipping | Your order is on its way | It's packed cold and on its way. Storage instructions are inside from the pharmacy. |
| Newsletter (marketing, consent only) | [Topic], explained | Plain-English explainers about the service and how care works. No product promotion. Unsubscribe link in every email. |
Never in any email: product benefits, dosing, "your protocol", refill pressure, countdowns.

## 7. EMPTY, LOADING AND 404 STATES
- Loading the quiz: "One moment…"
- No results in browse (names off): "Programs are matched to you in your consult. Start with the 2-minute quiz, or ask me how the consult works." (LIB `browseHidden`)
- 404: "THIS PAGE ISN'T HERE." "Try the 2-minute quiz or head home." [START THE QUIZ] [HOME]
- Lot lookup not found: "We couldn't find that lot code. Check the label, or call the care team at [phone number]."
