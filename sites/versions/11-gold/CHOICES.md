# 9-GOLD · CHROME GOLD · choices the builder made (owner can approve or change each one)

## Slots (all 7 wired, nothing dropped)
- NAV-102 Split Preview: already the base's menu (THE TOUR). Kept as is; the two halves are now clear glass (blur, no fill) with gold hairlines.
- BTN-174 Crown Set: the hero CTA CLAIM YOUR FOUNDING TICKET (replaces BTN-101). Case, crown and hand are re-cast in the chrome-gold ramp (a small `data-colour="gold"` switch inside fx/BTN-174/module.js).
- BTN-173 Mercury Bead: SEND MY SHORTLIST (the secondary sign-up button, replaces BTN-101 there). The chrome bead is gold-tinted the same way. GET GRACE'S LETTER and TEXT ME stay the site's own glass button (BTN-P01), with gold hairlines.
- CRD-122 Bevel Diamond: the text-alerts card. Copy is the same words, split front and back: the front has the title and the "One short text..." line; the back has the SAMPLE text. The only new words are the two button labels (SEE THE SAMPLE TEXT, BACK) and the removed "(Sample text shown above.)" line, which no longer applies. The diamond is larger than the module default (470px) so the words fit.
- SCR-16 Exploded Layers: HOW WE CHOOSE. Six steps = six slices, copy unchanged (step name, sentence, placeholders). Each slice also prints a short caption (new, 3-6 words, e.g. "Who makes it, and how") because the module needs one; all are marked SAMPLE by the module. The ASK GRACE button (it lived on the sixth card) moved under the heading so it stays reachable. The device is chrome/titanium (neutral) with gold only on the edge glints, ring and step names, so there is no big tan area.
- TXT-04 Scroll Highlight: both reading statements. Lit words white; key phrases take the chrome-gold gradient with a moving sheen and a gold underline.
- HOV-103 Edge Light: top menu buttons and every card group (markets, bento, tiers, collection, text-alert form, sign-up cards). Edge light is pale gold. The module's own "wash" is a faint white sheen (not a colour) so it doubles as the pointer-reactive glass sheen on those cards. Module CSS patched so its stand-alone card skin and stretched-link rule apply only inside its own .apx-h103 grid (otherwise it would overwrite the site's glass and cover the links in cards).

## Removed from the base
- BGD-102 plexus (behind the four questions), SCR-102 Fan Deck, BTN-101 Torn Stub, CRD-118 Squircle Stack: links, scripts, markup and mount-list entries.

## Look decisions
- Ground: the neutral smoke is lifted with brightness(1.4) on the smoke canvas plus a lighter graphite --bg (#212226). No colour added.
- Glass: transparent (at most rgba(255,255,255,.022)), blur 12-16px with saturate, hairlines in the chrome-gold. Glass on photos (city, lab) keeps a very light neutral scrim (.2/.07) so words stay readable; say if you want it fully clear.
- Cart drawer, modals and the concierge window were not restyled (they sit over a scrim and hold a lot of text).
- BTN-173 / BTN-174 labels use the PEPTICITY display face instead of the module default.
- shoot-versions.js times out here (it waits on Google Fonts, which this box cannot reach); the same checks were run with an equivalent harness that blocks the font request.
