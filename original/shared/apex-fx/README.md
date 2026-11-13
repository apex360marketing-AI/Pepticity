# PEPTICITY FX KIT

One CSS + one JS file that give every PEPTICITY page the APEX ARSENAL look: octagons only, liquid glass, chrome, colour in light.

| Code | Effect | Class |
|---|---|---|
| BTN-176 + HOV-13 | Liquid octagon button, chrome sheen on hover | `.ob` + `.a-uv/.a-ice/.a-cobalt/.a-gold/.a-plat` |
| GLS-LG | Liquid glass octagon pane | `.lg.oct` |
| CRD-132 + HOV-41 + HOV-103 | Specimen card, chrome bezel tilt, edge light | `.tile > .bez > .frame > .plate` |
| OBJ-09 | Revolving icon ring | `.ring > .track > .ico` |
| GLS-105 | Living condensation (copied unchanged from APEX ARSENAL) | `data-apx="GLS-105"` |
| TRN-04 | Octagon iris reveal on scroll | `.reveal` |
| NAV-26 | Mercury scroll gauge | `.gauge` |

## Simple changes
- Colours, fonts, corner size: the first `:root` block in `pepticity-fx.css`.
- Swap an effect: press **T** on any page, click the part's code (copies it, opens APEX ARSENAL), pick the replacement there, then swap the class/code in the page.
- Brand lock still applies: no green, pink, peach, orange or yellow; colour only in glows, edges and LEDs.
