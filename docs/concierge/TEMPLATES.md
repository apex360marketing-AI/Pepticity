# CONCIERGE GRACE · CUSTOMER-FACING TEMPLATES (v0.1, 2 Nov 2026)

Rules for every template:
- Only `{{slots}}` change; slots are filled from WooCommerce data and validated (order number = digits, amount = `$0.00 CAD`, tracking = carrier format, URLs = the store's own domain).
- No product benefit, use, condition or outcome, ever. Product names appear only where the customer's own order or request needs them (see counsel question D8).
- Signed by a real person ("Grace, {{store_name}}"). Every email footer carries the store's legal name, mailing address, a contact method valid for 60 days and a working unsubscribe link (CASL sender-ID rules apply even to transactional mail).
- `{{store_name}}` is never PEPTICITY while the current catalogue is on sale (it would tie the new brand to it).
- `{{order_status_plain}}` comes from a fixed list of plain statuses, never free text.
- Status after compliance review is recorded in the table at the end.

## T01 · ORDER QUESTION (reply draft)
Subject: Re: {{original_subject}}
> Hi {{first_name}},
> Thanks for getting in touch about order #{{order_number}}.
> It is currently **{{order_status_plain}}**.{{#tracking}} It shipped with {{carrier}} on {{ship_date}}, tracking number {{tracking_number}}: {{tracking_url}}{{/tracking}}
> If anything looks wrong, just reply to this email and I'll look into it personally.
> Grace
> {{store_name}}

## T02 · HEALTH, DOSING OR "WHAT DOES IT DO" QUESTION (locked refusal)
Subject: Re: {{original_subject}}
> Hi {{first_name}},
> Thanks for your message. We can't answer questions about using any product or what it might do. That is the same answer for every customer.
> For anything about your health, please speak with a licensed health professional.
> I'm happy to help with your order, payment, shipping or stock questions.
> Grace
> {{store_name}}

## T03 · DOCUMENTATION / LOT REQUEST (hand-off)
Subject: Re: {{original_subject}}
> Hi {{first_name}},
> Thanks for asking. I handle these requests personally and will reply within {{reply_days}} business days.
- Any document sent later must pass the linter first (lab certificates often carry "research use only" or use wording).
> Grace
> {{store_name}}

## T04 · E-TRANSFER REMINDER (unpaid order, transactional)
Subject: Order #{{order_number}} is waiting for payment
> Hi {{first_name}},
> Your order #{{order_number}} for {{order_total}} is reserved and waiting for your e-Transfer.
> Send it to {{payment_email}} and put **{{order_number}}** in the message so we can match it quickly.
> We hold orders for {{hold_days}} days. If you've already sent it, thank you, and please ignore this note.
> Grace
> {{store_name}}

## T05 · PAYMENT RECEIVED (transactional, after Grace confirms the match)
Subject: Payment received for order #{{order_number}}
> Hi {{first_name}},
> We've received your payment of {{amount}} for order #{{order_number}}. We'll email your tracking number when it ships.
> Grace
> {{store_name}}

## T06 · SAVED CART REMINDER · **BLOCKED** until counsel answers D8/D9
- Commercial message, not transactional. Only with a separate unticked box ("Email me one link to my saved cart. From {{store_name}}, [address]. Privacy: [link]."), consent logged, sent once, and **only if every item in the cart is counsel-cleared**.
Subject: Your cart is saved
> Hi {{first_name}},
> You left {{item_count}} item(s) in your cart at {{store_name}}. It's saved here whenever you want it: {{cart_url}}
> Prices and stock can change, so the cart shows the current price before you pay.
> Grace
> {{store_name}}
> [footer: address · why you got this · unsubscribe]

## T07 · BACK IN STOCK · **BLOCKED** for Health Canada-named products
- Only for counsel-cleared items, with express consent recorded per item.
Subject: An item you asked about is back
> Hi {{first_name}},
> You asked us to tell you when {{item_name}} was back. It is in stock now: {{product_url}}
> You won't hear from us about it again unless you ask.
> Grace
> {{store_name}}
> [footer: {{store_legal_name}} · address · you asked to hear when this item returned · unsubscribe]

## T08 · SHIPPING DELAY (transactional; Grace approves each send)
Subject: An update on order #{{order_number}}
> Hi {{first_name}},
> Your order #{{order_number}} is taking longer than usual to ship. Our new estimate is {{new_ship_date}}.
> If you'd rather not wait, reply and I'll cancel and refund it in full.
> Sorry for the wait,
> Grace
> {{store_name}}

## T09 · ITEM UNAVAILABLE ON A PAID ORDER (Grace approves each send)
Subject: About your order #{{order_number}}
> Hi {{first_name}},
> I'm sorry: {{item_name}} in your order is out of stock. You can choose:
> 1. Wait for it (expected {{restock_date}}), or
> 2. A refund of {{item_amount}} for that item.
> Just reply with 1 or 2.
> Grace
> {{store_name}}

## Internal (not customer-facing, still linted)
- **I01 Reorder draft to supplier:** "Hi {{supplier_name}}, please quote/confirm: {{line_items: name · size · qty}}. Ship to {{address}}. Thanks, Grace." (No use or benefit words.)
- **I02 Daily brief** and **I03 Incident alert**: facts and numbers from the audit log; missing number = "not available".

## Banned in every template and draft (linter list)
- Use words: dose, dosage, dosing, mg per, mcg, IU per, protocol, cycle, stack, stacking, reconstitute, reconstitution, mix, inject, injection, pin, subQ, how to use, calculator, titrate.
- Outcome words (hedged or not): help(s) with, support(s), promote(s), boost(s), improve(s), enhance(s), restore(s), reduce(s), heal(s), repair(s), recovery, anti-aging, longevity, weight loss, fat loss, muscle, energy, sleep, skin (next to a product), studied for, researched for, investigated for, explored for.
- Shield phrases: research use only, not for human consumption, for research purposes, lab use only (as reassurance).
- Authority: Dr., doctor-recommended, clinically proven, clinical-grade, pharmaceutical-grade, medical-grade, safe, side-effect free, guaranteed.
- Pressure: only X left (unless live stock), hurry, last chance, act now, limited time (unless a real dated offer), selling fast, almost gone, back for a limited time.
- Added after compliance review (2 Nov): bacteriostatic water, bac water, syringe, needle, units, IU, mL, administer, administration, subcutaneous, intramuscular, per week, weekly (with a product), loading, maintenance, taper, results, works, effective, benefits, treat, treatment, cure, prevent, therapy, appetite, fat, lean, cut, bulk, tan, libido, focus, cognitive, anti-inflammatory, healing, joint, tendon, gut, immune, hair, wrinkle, collagen, glow, transform, unlock, optimize, biohack, Health Canada approved, FDA approved, GMP, human grade, pharmaceutical, legal in Canada, same as, generic, Ozempic, Wegovy, Mounjaro, lab-tested, third-party tested, lot tested, 99% pure, purity, patient, prescription, Rx, clinician, physician, pharmacy, compounded, free (except shipping facts), % off, discount code, gift, points.
- Match "pin" and "mix" as whole words only.

## Compliance review record
| Template | regulated-claims-check | Compliance officer | Status |
|---|---|---|---|
| T01 | pass | PASS | ready |
| T02 | fixed (use-acknowledging list removed) | FIX → applied | ready |
| T03 | fixed (no promise of lot papers; subject added) | FIX → applied | ready |
| T04 | pass | PASS | ready |
| T05 | pass | PASS | ready |
| T06 | commercial message | **BLOCK** | waits on counsel D8/D9 |
| T07 | drop alert for named product | **BLOCK** | waits on counsel; cleared items only |
| T08 | pass | PASS | ready |
| T09 | pass (item amount incl. tax) | PASS | ready |
| I01-I03 | pass | PASS (supply question to counsel) | ready |
| Footer rule | fixed | FIX → applied | ready |

Risk scan, not legal advice. Screenshot and date-stamp each template version when approved.
