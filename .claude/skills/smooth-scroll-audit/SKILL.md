---
name: smooth-scroll-audit
description: Use on every PEPTICITY scroll change and whenever the owner says scrolling is fast, jerky, chunky or skips. Measures scroll speed and frame pacing in a real browser, sets the smooth-scroll and soft-stop settings, and proves nothing flies top to bottom.
---
# SMOOTH SCROLL AUDIT
Owner (1 Nov): "it literally sometimes goes so fast that it goes from the top to the bottom in like a quarter of a second... It has to have nice smooth scrolling the whole way through." Cards should "semi stop you there" so you slow down and read.

## Rules
- Lenis smooth scroll with a low wheel multiplier (about 0.6 to 0.8) and a duration of 1.2 to 1.6 s; touch multiplier 1.
- Cap the scroll delta per frame so a hard flick cannot cross more than about 1.5 screens.
- Soft stops: at each marketing card and hook, a gentle snap/slow zone (about 15% of a screen of extra resistance) so the visitor lingers, then continues. Never a hard lock; always escapable.
- Programmatic jumps (menu, tour) use eased glides, never instant jumps, and never faster than 1.6 s per screen.
- Pinned sections: scrub values linked to scroll, no timelines that run on their own speed.
- Heavy work (mounting, decoding, ScrollTrigger.refresh) never happens during a scroll or a dissolve.

## Measure (mandatory)
1. Playwright: simulate a hard wheel flick (mouse.wheel 3000) and record scrollY every frame. Pass: it takes at least 1.2 s to move 3000 px and never moves more than 1.5 screens in 250 ms.
2. Record frame times during a 10 s scripted scroll. Pass: no frame over 50 ms after load; report the long-task list.
3. Test with Lenis on, off, reduced motion, and touch emulation.
4. Report the numbers before and after.
