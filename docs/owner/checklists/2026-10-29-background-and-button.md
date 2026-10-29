# 29 Oct: BACKGROUND (R133/R134/R093) + ONE BUTTON (R129). Review pieces only, not published.

1. "take that background [APEX Arsenal], that moving black and silver ... as a similar background" (R133) | TEST: liquid-chrome shader from Arsenal adapted, both modes render | DONE: sites/brand-background/shots/bg-black-desktop.png, bg-white-desktop.png
2. BLACK = matte + UV black, silver smoke | DONE: ground #0b0b0c, UV pixels #13121a/#1e1b23 (hue 295-306, C<=6.1)
3. WHITE = crisp white, platinum smoke, NO warm cast | DONE: 64-point grid + 35k-pixel scan, every ground pixel hue 256-290, chroma <=3.4, 0 warm pixels
4. 30-degree pattern watermark (R093) | DONE: chevron tile, rotate(-30deg), 5.5-6.5% opacity
5. Room for the centre emblem (OBJ-08) | DONE: reserved centre slot
6. 3 see-through glass cards (R134) | DONE: fill 1-5%, blur 10px, chrome hairline following chamfered corners; bg-*-card-sweep.png
7. "we're only going to use one [button]" (R129) | DONE: brand/ui/button.css (BTN-P01), sizes lg/regular/sm, states default/hover/pressed/focus/disabled, segmented toggle, both grounds; sites/brand-button/shots/
8. Slow sweep left to right, one pass ~1.5 s | DONE: --pc-dur-sweep 1500ms, mid-sweep frames btn-black-hover-midsweep.png, btn-white-sweep-sequence.png
(RULE) No pills, caps headings, PEPTICITY in caps, no peach/pink/yellow/green | DONE. Only chroma above 10 anywhere: the 20px pale chrome-gold tick on the toggle thumb (#8f7a62 to #f0e6c7, b* 16).
(RULE) 1440x900 + 390x844, zero console errors, no sideways scroll | DONE (scrollWidth = clientWidth on all 6 loads).
OPEN: headings use Syncopate until the owner's BLACK font ships (R128).
