#!/usr/bin/env python3
"""PEPTICITY BLACK type family builder.

Draws every glyph on one grid from the owner's reference
design/references/pepticity/3d-metal-type-BLACK.png and writes:
  pepticity-black.svg            one <symbol> per glyph (regular)
  pepticity-black-condensed.svg / pepticity-black-split.svg
  PepticityBlack*.otf + .woff2   real fonts (fonttools, CFF outlines)
  glyphs.json                    contours for three.js extrusion (all 3 cuts)

Grid (font units, y up): cap height 700, baseline 0, stroke 130.
Rules taken from the reference:
  - uniform thick strokes (~0.186 x cap height), very wide letters (1.1-1.45 x cap)
  - verticals end flat; bar terminals end in straight diagonal cuts
  - outer corners where a bar meets a stem are rounded (R 140), inner corners tight (r 40)
  - B has no stem: three bars, open counters, left ends cut on one 45 degree line
  - A is an open chevron (no crossbar) with a separate inner bar split off the right leg
  - K arm and leg meet the stem at about mid height
Run:  python3 brand/font/build_font.py
"""
import json, math, os
from shapely.geometry import Polygon, MultiPolygon, box as sbox
from shapely.ops import unary_union
from shapely import affinity
from shapely.geometry.polygon import orient

OUT = os.path.dirname(os.path.abspath(__file__))
CAP = 700


# ---------------------------------------------------------------- helpers
def RP(pts, radii=None, seg=22):
    """Polygon with per-vertex fillet radii (0 = sharp)."""
    n = len(pts)
    radii = radii or [0] * n
    out = []
    for i in range(n):
        v = pts[i]; r = radii[i]
        if not r:
            out.append(v); continue
        p, q = pts[i - 1], pts[(i + 1) % n]
        ux, uy = p[0] - v[0], p[1] - v[1]; lu = math.hypot(ux, uy); ux /= lu; uy /= lu
        wx, wy = q[0] - v[0], q[1] - v[1]; lw = math.hypot(wx, wy); wx /= lw; wy /= lw
        cosang = max(-1, min(1, ux * wx + uy * wy)); ang = math.acos(cosang)
        t = r / math.tan(ang / 2)
        t = min(t, lu * 0.5 if radii[i - 1] else lu * 0.98, lw * 0.5 if radii[(i + 1) % n] else lw * 0.98)
        r_eff = t * math.tan(ang / 2)
        p1 = (v[0] + ux * t, v[1] + uy * t); p2 = (v[0] + wx * t, v[1] + wy * t)
        bx, by = ux + wx, uy + wy; lb = math.hypot(bx, by); bx /= lb; by /= lb
        dc = r_eff / math.sin(ang / 2)
        c = (v[0] + bx * dc, v[1] + by * dc)
        a1 = math.atan2(p1[1] - c[1], p1[0] - c[0]); a2 = math.atan2(p2[1] - c[1], p2[0] - c[0])
        da = a2 - a1
        while da > math.pi: da -= 2 * math.pi
        while da < -math.pi: da += 2 * math.pi
        for j in range(seg + 1):
            a = a1 + da * j / seg
            out.append((c[0] + r_eff * math.cos(a), c[1] + r_eff * math.sin(a)))
    return Polygon(out).buffer(0)


def BOX(x0, y0, x1, y1, bl=0, br=0, tr=0, tl=0):
    return RP([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], [bl, br, tr, tl])


def QUAD(xb0, xb1, xt0, xt1, y0, y1):
    """Quad with horizontal bottom (xb0..xb1 at y0) and top (xt0..xt1 at y1)."""
    return Polygon([(xb0, y0), (xb1, y0), (xt1, y1), (xt0, y1)]).buffer(0)


def U(*g):
    return unary_union([x for x in g if x is not None and not x.is_empty])


def line_x(p, q, y):
    return p[0] + (q[0] - p[0]) * (y - p[1]) / (q[1] - p[1])


# ---------------------------------------------------------------- glyphs
def make_glyphs(k=1.0, s=140, R=190, r=50, wf=0.8):
    d = round(130 * k)              # run of a 45 degree terminal cut (steeper when condensed)
    T0, M0, M1, B1 = CAP - s, CAP / 2 - s / 2, CAP / 2 + s / 2, s
    rc = (T0 - M1) / 2              # B / P counters: half-round ends
    Rb = rc + s
    W = lambda w: round(w * k * wf)
    th = round(150 * (0.85 + 0.15 * k))  # horizontal thickness of diagonal strokes
    G = {}

    # A ---------------------------------------------------------------
    w = W(980); ax = w / 2; top = CAP + 22
    yi = top * (ax - th) / ax
    chev = Polygon([(0, 0), (ax, top), (w, 0), (w - th, 0), (ax, yi), (th, 0)])
    gap, bw = 16, round(118 * (0.8 + 0.2 * k))
    # inner bar parallel to the right leg, inside it, split by a hairline
    rl = lambda y, off: (w - th - off) - y * ax / top
    yb = 358                         # reference: bar top runs from y=315 (left) to y=400 (right)
    bar = Polygon([(rl(0, gap + bw), 0), (rl(0, gap), 0), (rl(yb + 40, gap), yb + 40), (rl(yb - 40, gap + bw), yb - 40)])
    G['A'] = (U(chev, bar), w)

    # B ---------------------------------------------------------------
    wl, wu = W(990), W(950)
    up = BOX(-600, M0, wu, CAP, 0, Rb, Rb, 0).difference(BOX(-600, M1, wu - s, T0, 0, rc, rc, 0))
    lo = BOX(-600, 0, wl, M1, 0, Rb, Rb, 0).difference(BOX(-600, B1, wl - s, M0, 0, rc, rc, 0))
    c0 = 80 * k
    keep = Polygon([(0, CAP), (3000, CAP), (3000, 0), (c0, 0), (c0 + (T0 - 8) * k, T0 - 8), (d + 8 * k, T0 - 8)])
    G['B'] = (U(up, lo).intersection(keep), wl)

    # C ---------------------------------------------------------------
    w = W(920)
    G['C'] = (RP([(w, CAP), (0, CAP), (0, 0), (w, 0), (w - d, B1), (s, B1), (s, T0), (w - d, T0)],
                 [0, R, R, 0, 0, r, r, 0]), w)
    # D ---------------------------------------------------------------
    w = W(930); Rd = min(240, w / 2 - 10)
    G['D'] = (BOX(0, 0, w, CAP, 0, Rd, Rd, 0).difference(BOX(s, B1, w - s, T0, 0, Rd - s, Rd - s, 0)), w)
    # E ---------------------------------------------------------------
    w = W(830); wm = w - W(70)
    G['E'] = (RP([(w, CAP), (0, CAP), (0, 0), (w, 0), (w - d, B1), (s, B1), (s, M0), (wm - d, M0), (wm, M1), (s, M1), (s, T0), (w - d, T0)],
                 [0, R, R, 0, 0, r, r, 0, 0, r, r, 0]), w)
    # F ---------------------------------------------------------------
    w = W(800); wm = w - W(70)
    G['F'] = (RP([(w, CAP), (0, CAP), (0, 0), (s, 0), (s, M0), (wm - d, M0), (wm, M1), (s, M1), (s, T0), (w - d, T0)],
                 [0, R, 0, 0, r, 0, 0, r, r, 0]), w)
    # G ---------------------------------------------------------------
    w = W(930); wg = W(470)
    sp1, sp0 = 400, 400 - s
    G['G'] = (RP([(w, CAP), (0, CAP), (0, 0), (w, 0), (w, sp1), (wg, sp1), (wg + d, sp0), (w - s, sp0), (w - s, B1), (s, B1), (s, T0), (w - d, T0)],
                 [0, R, R, R, 0, 0, 0, r, r, r, r, 0]), w)
    # H ---------------------------------------------------------------
    w = W(870)
    G['H'] = (U(BOX(0, 0, s, CAP), BOX(w - s, 0, w, CAP), BOX(0, M0, w, M1)), w)
    # I ---------------------------------------------------------------
    G['I'] = (BOX(0, 0, s, CAP), s)
    # J ---------------------------------------------------------------
    w = W(780)
    G['J'] = (RP([(w - s, CAP), (w, CAP), (w, 0), (0, 0), (d, B1), (w - s, B1)], [0, 0, R, 0, 0, r]), w)
    # K ---------------------------------------------------------------
    w = W(780)
    ya, ta = 352, 120
    sl = (CAP - ya) / (w - s)                      # arm lower line slope
    wa = ta * math.hypot(1, sl) / sl               # horizontal width of arm
    arm = Polygon([(w, CAP), (w - wa, CAP), (s - 2, ya + wa * sl - 2 * sl), (s - 2, ya - 2 * sl)])
    yl = 448; tl = 128
    sl2 = yl / (w - s)
    wl2 = tl * math.hypot(1, sl2) / sl2
    leg = Polygon([(w, 0), (w - wl2, 0), (s - 2, yl - wl2 * sl2), (s - 2, yl)])
    G['K'] = (U(BOX(0, 0, s, CAP), arm.intersection(BOX(0, 0, w, CAP)), leg.intersection(BOX(0, 0, w, CAP))), w)
    # L ---------------------------------------------------------------
    w = W(900); dl = round(B1 * 0.66)  # L bar end runs parallel to the A leg, as in the reference
    G['L'] = (RP([(0, CAP), (s, CAP), (s, B1), (w, B1), (w - dl, 0), (0, 0)], [0, 0, r, 0, 0, R]), w)
    # M ---------------------------------------------------------------
    w = W(1120); tv = round(175 * (0.8 + 0.2 * k)); yv = 170
    d1 = Polygon([(0, CAP), (tv, CAP), (w / 2 + tv / 2, yv), (w / 2 - tv / 2, yv)])
    d2 = affinity.scale(d1, -1, 1, origin=(w / 2, 0))
    G['M'] = (U(BOX(0, 0, s, CAP), BOX(w - s, 0, w, CAP), d1, d2), w)
    # N ---------------------------------------------------------------
    w = W(890); tn = round(175 * (0.8 + 0.2 * k))
    G['N'] = (U(BOX(0, 0, s, CAP), BOX(w - s, 0, w, CAP), QUAD(w - tn, w, 0, tn, 0, CAP)), w)
    # O ---------------------------------------------------------------
    w = W(970)
    ring = lambda w_: BOX(0, 0, w_, CAP, R, R, R, R).difference(BOX(s, B1, w_ - s, T0, r, r, r, r))
    G['O'] = (ring(w), w)
    # P ---------------------------------------------------------------
    w = W(880)
    pout = RP([(0, 0), (0, CAP), (w, CAP), (w, M0), (s, M0), (s, 0)], [0, R, Rb, Rb, r, 0])
    G['P'] = (pout.difference(BOX(s, M1, w - s, T0, 0, rc, rc, 0)), w)
    # Q ---------------------------------------------------------------
    w = W(970)
    G['Q'] = (U(ring(w), QUAD(w - W(190), w + W(40), w - W(420), w - W(230), 0, 300)).intersection(BOX(0, 0, w, CAP)), w)
    # R ---------------------------------------------------------------
    w = W(890)
    rr = RP([(0, 0), (0, CAP), (w, CAP), (w, M0), (s, M0), (s, 0)], [0, R, Rb, Rb, r, 0]).difference(BOX(s, M1, w - s, T0, 0, rc, rc, 0))
    xl = W(380)
    G['R'] = (U(rr, QUAD(w - th, w, xl, xl + th, 0, M0 + 1)), w)
    # S ---------------------------------------------------------------
    w = W(900)
    G['S'] = (RP([(w, CAP), (0, CAP), (0, M0), (w - s, M0), (w - s, B1), (d, B1), (0, 0), (w, 0), (w, M1), (s, M1), (s, T0), (w - d, T0)],
                 [0, R, R, r, r, 0, 0, R, R, r, r, 0]), w)
    # T ---------------------------------------------------------------
    w = W(880)
    G['T'] = (U(Polygon([(0, CAP), (w, CAP), (w - d, T0), (d, T0)]), BOX((w - s) / 2, 0, (w + s) / 2, T0 + 1)), w)
    # U ---------------------------------------------------------------
    w = W(890)
    G['U'] = (RP([(0, CAP), (s, CAP), (s, B1), (w - s, B1), (w - s, CAP), (w, CAP), (w, 0), (0, 0)], [0, 0, r, r, 0, 0, R, R]), w)
    # V ---------------------------------------------------------------
    def vee(x0, x1):
        cx = (x0 + x1) / 2; half = (x1 - x0) / 2; bot = -22
        yin = CAP - (CAP - bot) * (half - th) / half
        return Polygon([(x0, CAP), (x0 + th, CAP), (cx, yin), (x1 - th, CAP), (x1, CAP), (cx, bot)])
    w = W(980); G['V'] = (vee(0, w), w)
    # W ---------------------------------------------------------------
    w = W(1380); G['W'] = (U(vee(0, w * 0.56), vee(w * 0.44, w)), w)
    # X ---------------------------------------------------------------
    w = W(920); tx = round(175 * (0.8 + 0.2 * k))
    G['X'] = (U(QUAD(0, tx, w - tx, w, 0, CAP), QUAD(w - tx, w, 0, tx, 0, CAP)), w)
    # Y ---------------------------------------------------------------
    w = W(940); yj = 330
    G['Y'] = (U(QUAD(w / 2 - tx / 2, w / 2 + tx / 2, 0, tx, yj, CAP), QUAD(w / 2 - tx / 2, w / 2 + tx / 2, w - tx, w, yj, CAP),
                BOX((w - s) / 2, 0, (w + s) / 2, yj + 2)), w)
    # Z ---------------------------------------------------------------
    w = W(880); tz = round(185 * (0.8 + 0.2 * k))
    G['Z'] = (U(Polygon([(0, CAP), (w, CAP), (w, T0), (d, T0)]), Polygon([(0, B1), (w - d, B1), (w, 0), (0, 0)]),
                QUAD(0, tz, w - tz, w, B1 - 1, T0 + 1)), w)

    # digits ----------------------------------------------------------
    w = W(790); G['0'] = (ring(w), w)
    w = W(470); G['1'] = (U(BOX(w - s, 0, w, CAP), Polygon([(w - s + 2, CAP), (w - s + 2, T0 - 10), (0, T0 - 150), (0, CAP - 140)])), w)
    w = W(810)
    G['2'] = (RP([(0, CAP), (w, CAP), (w, M0), (s, M0), (s, B1), (w - d, B1), (w, 0), (0, 0), (0, M1), (w - s, M1), (w - s, T0), (d, T0)],
                 [0, R, R, r, r, 0, 0, R, R, r, r, 0]), w)
    xm = W(250)
    G['3'] = (RP([(0, CAP), (w, CAP), (w, 0), (0, 0), (d, B1), (w - s, B1), (w - s, M0), (xm, M0), (xm + d, M1), (w - s, M1), (w - s, T0), (d, T0)],
                 [0, R, R, 0, 0, r, r, 0, 0, r, r, 0]), w)
    w = W(840); xs = w - s - W(120); b0, b1 = 200, 200 + s
    G['4'] = (RP([(0, CAP), (s, CAP), (s, b1), (xs, b1), (xs, CAP), (xs + s, CAP), (xs + s, b1), (w, b1), (w - d * 0.6, b0), (xs + s, b0), (xs + s, 0), (xs, 0), (xs, b0), (0, b0)],
                 [0, 0, r, r, 0, 0, r, 0, 0, r, 0, 0, r, R]), w)
    w = W(810)
    G['5'] = (RP([(0, CAP), (w, CAP), (w - d, T0), (s, T0), (s, M1), (w, M1), (w, 0), (0, 0), (d, B1), (w - s, B1), (w - s, M0), (0, M0)],
                 [0, 0, 0, r, r, R, R, 0, 0, r, r, 0]), w)
    six = RP([(w, CAP), (0, CAP), (0, 0), (w, 0), (w, M1), (s, M1), (s, T0), (w - d, T0)], [0, R, R, R, R, r, r, 0]).difference(
        BOX(s, B1, w - s, M0, r, r, r, r))
    G['6'] = (six, w)
    w7 = W(800); t7 = round(185 * (0.8 + 0.2 * k))
    G['7'] = (U(Polygon([(0, CAP), (w7, CAP), (w7, T0), (d, T0)]), QUAD(W(170), W(170) + t7, w7 - t7, w7, 0, T0 + 1)), w7)
    w = W(830); i8 = W(40); R8 = 170
    up8 = BOX(i8, M0, w - i8, CAP, R8, R8, R8, R8).difference(BOX(i8 + s, M1, w - i8 - s, T0, r, r, r, r))
    lo8 = BOX(0, 0, w, M1, R8, R8, R8, R8).difference(BOX(s, B1, w - s, M0, r, r, r, r))
    G['8'] = (U(up8, lo8), w)
    w = W(810)
    G['9'] = (affinity.rotate(six, 180, origin=(w / 2, CAP / 2)), w)

    v2_overrides(G, k, s, R, r, d, W, th)
    G['.'] = (BOX(0, 0, s, s), s)
    G['-'] = (BOX(0, M0, W(380), M1), W(380))
    return G



def v2_overrides(G, k, s, R, r, d, W, th):
    """29 Oct owner fix: bolder, narrower, smoother, with cut-outs like the BLACK picture."""
    T0, M0, M1, B1 = CAP - s, CAP / 2 - s / 2, CAP / 2 + s / 2, s
    rc = (T0 - M1) / 2; Rb = rc + s
    g = 22 * (0.8 + 0.2 * k)          # hairline gap of every cut-out
    cut = d                           # run of a 45 degree terminal cut
    # B: three bars, no stem; top end leans back, middle and bottom lean forward (as in the picture)
    w = W(860)
    up = BOX(-600, M0, w, CAP, 0, Rb, Rb, 0).difference(BOX(-600, M1, w - s, T0, 0, rc, rc, 0))
    lo = BOX(-600, 0, w, M1, 0, Rb, Rb, 0).difference(BOX(-600, B1, w - s, M0, 0, rc, rc, 0))
    keepT = Polygon([(0, CAP), (5000, CAP), (5000, M1), (cut + W(60), M1 - 1), (cut + W(60), T0), (cut, T0)])
    keepM = Polygon([(W(170), M0), (5000, M0), (5000, M1 + 1), (W(170) + cut, M1 + 1)])
    keepB = Polygon([(0, 0), (5000, 0), (5000, M0 + 1), (cut, M0 + 1), (cut, B1)])
    b = U(up, lo)
    G['B'] = (U(b.intersection(BOX(0, M1, 5000, CAP)).intersection(keepT),
                b.intersection(BOX(0, M0, 5000, M1)).intersection(keepM),
                b.intersection(BOX(0, 0, 5000, M0)).intersection(keepB)), w)
    # E: three bars, no left side, mirror-symmetric top to bottom. Left ends carry the C's smooth
    # outer curve so the missing spine is implied; right ends take the C's 45 degree terminals.
    w = W(680); wmid = w - W(90); Re = 120
    top = RP([(0, T0), (w - cut, T0), (w, CAP), (0, CAP)], [0, 0, 0, Re])
    bot = RP([(0, 0), (w, 0), (w - cut, B1), (0, B1)], [Re, 0, 0, 0])
    mid = Polygon([(0, M0), (wmid - cut / 2, M0), (wmid, CAP / 2), (wmid - cut / 2, M1), (0, M1)])
    G['E'] = (U(top, mid, bot), w)
    # P: the bowl of the B with no stem above the middle bar (the missing piece), stem below
    w = W(800)
    bowl = BOX(-600, M0, w, CAP, 0, Rb, Rb, 0).difference(BOX(-600, M1, w - s, T0, 0, rc, rc, 0))
    bowl = bowl.intersection(Polygon([(0, CAP), (5000, CAP), (5000, M0), (s, M0), (s, M1 - 1), (cut + s * 0.15, M1), (cut, T0)]))
    stem = RP([(0, 0), (s, 0), (s, M0 + 1), (s, M1), (0, M1)], [0, 0, 0, r, 0])
    G['P'] = (U(bowl, BOX(0, 0, s, M1)), w)
    # C: big smooth outer curve, tight inner curve, 45 degree terminals
    w = W(800); Rc = 250
    G['C'] = (RP([(w, CAP), (0, CAP), (0, 0), (w, 0), (w - cut, B1), (s, B1), (s, T0), (w - cut, T0)],
                 [0, Rc, Rc, 0, 0, r * 1.6, r * 1.6, 0]), w)
    # T: top bar with cut ends, stem floats under it on a hairline gap
    w = W(820)
    G['T'] = (U(Polygon([(0, CAP), (w, CAP), (w - cut, T0), (cut, T0)]), BOX((w - s) / 2, 0, (w + s) / 2, T0 - g)), w)
    # K: stem, a floating arm, and a leg that clicks onto the stem with a small ledge
    w = W(800)
    ya = 400                                   # arm bottom meets this height at the stem side
    arm = Polygon([(w, CAP), (w - th * 1.15, CAP), (s + g + 10, ya), (s + g + 10 + th * 1.15, ya)])
    ledge = 330                                # leg top edge leaves the stem here
    leg = Polygon([(s - 1, ledge + s * 0.9), (s + W(60), ledge + s * 0.9), (w, 0), (w - th * 1.15, 0), (s + W(60) - th * 0.2, ledge), (s - 1, ledge)])
    G['K'] = (U(BOX(0, 0, s, CAP), arm, leg.intersection(BOX(0, 0, w, CAP))), w)
    # L: shorter foot, smooth outer corner, end cut parallel to the A leg
    w = W(720); dl = round(B1 * 0.7)
    G['L'] = (RP([(0, CAP), (s, CAP), (s, B1), (w, B1), (w - dl, 0), (0, 0)], [0, 0, r * 1.6, 0, 0, Rc]), w)
    # Y: right arm runs into the stem, left arm floats on a hairline split
    w = W(860); yj = 330; tx = th * 1.1
    right = QUAD(w / 2 - tx / 2, w / 2 + tx / 2, w - tx, w, yj, CAP)
    left = QUAD(w / 2 - tx / 2, w / 2 + tx / 2, 0, tx, yj, CAP).difference(right.buffer(g))
    G['Y'] = (U(right, left, BOX((w - s) / 2, 0, (w + s) / 2, yj + 2)), w)

def split_variant(G, gap=40):
    seam = BOX(-2000, CAP / 2 - gap / 2, 5000, CAP / 2 + gap / 2)
    return {k: (g.difference(seam), w) for k, (g, w) in G.items()}


# ---------------------------------------------------------------- export
SB = 45  # side bearing
# pair kerning measured from the reference (L tucks under the A leg, C and K sit tight)
KERN = {('L', 'A'): -150, ('A', 'C'): -90, ('C', 'K'): -60, ('B', 'L'): -20, ('T', 'A'): -110, ('A', 'T'): -110,
        ('L', 'T'): -90, ('T', 'Y'): -40, ('A', 'V'): -120, ('V', 'A'): -120, ('P', 'A'): -80}


def polys(g):
    g = g.buffer(0)
    if isinstance(g, Polygon): g = [g]
    else: g = list(g.geoms)
    out = []
    for p in g:
        p = orient(p.simplify(0.6), 1.0)
        out.append(p)
    return out


def to_json(G):
    res = {}
    for ch, (g, w) in G.items():
        items = []
        for p in polys(g):
            items.append({'o': [[round(x + SB, 1), round(y, 1)] for x, y in list(p.exterior.coords)[:-1]],
                          'h': [[[round(x + SB, 1), round(y, 1)] for x, y in list(h.coords)[:-1]] for h in p.interiors]})
        res[ch] = {'adv': w + 2 * SB, 'p': items}
    return res


def svg_path(G, ch):
    g, w = G[ch]
    parts = []
    for p in polys(g):
        for ring in [p.exterior] + list(p.interiors):
            c = list(ring.coords)[:-1]
            parts.append('M' + ' L'.join(f'{x + SB:.1f} {CAP - y:.1f}' for x, y in c) + 'Z')
    return ''.join(parts)


GLYPH_NAMES = {'.': 'period', '-': 'hyphen'}
for i, n in enumerate('zero one two three four five six seven eight nine'.split()): GLYPH_NAMES[str(i)] = n


def gname(ch):
    return GLYPH_NAMES.get(ch, ch)


def write_svg(G, fname, title):
    syms = []
    for ch, (g, w) in G.items():
        syms.append(f'  <symbol id="pb-{gname(ch)}" viewBox="0 -30 {w + 2 * SB} 760"><path d="{svg_path(G, ch)}"/></symbol>')
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n  <title>{title}</title>\n'
           f'  <!-- cap height 700, baseline at y=700, stroke 130; use: <svg viewBox="0 -30 ADV 760"><use href="#pb-A"/></svg> -->\n'
           + '\n'.join(syms) + '\n</svg>\n')
    open(os.path.join(OUT, fname), 'w').write(svg)


def write_font(G, family, style, fname):
    from fontTools.fontBuilder import FontBuilder
    from fontTools.pens.t2CharStringPen import T2CharStringPen
    order = ['.notdef', 'space'] + [gname(c) for c in G]
    fb = FontBuilder(1000, isTTF=False)
    fb.setupGlyphOrder(order)
    cmap = {32: 'space'}
    for c in G:
        cmap[ord(c)] = gname(c)
        if c.isalpha(): cmap[ord(c.lower())] = gname(c)   # lower case maps to the capitals: the face is caps-only
    fb.setupCharacterMap(cmap)
    cs, metrics = {}, {}
    pen = T2CharStringPen(600, None); pen.moveTo((50, 0)); pen.lineTo((550, 0)); pen.lineTo((550, 700)); pen.lineTo((50, 700)); pen.closePath()
    cs['.notdef'] = pen.getCharString(); metrics['.notdef'] = (600, 50)
    pen = T2CharStringPen(320, None); cs['space'] = pen.getCharString(); metrics['space'] = (320, 0)
    for c, (g, w) in G.items():
        adv = int(round(w + 2 * SB)); pen = T2CharStringPen(adv, None)
        ps = polys(g)
        for p in ps:
            for ring, is_hole in [(p.exterior, False)] + [(h, True) for h in p.interiors]:
                pts = [(round(x + SB), round(y)) for x, y in list(ring.coords)[:-1]]
                ded = [pts[0]] + [q for i, q in enumerate(pts[1:], 1) if q != pts[i - 1]]
                if ded[-1] == ded[0]: ded.pop()
                if len(ded) < 3: continue
                pen.moveTo(ded[0])
                for q in ded[1:]: pen.lineTo(q)
                pen.closePath()
        cs[gname(c)] = pen.getCharString()
        xmin = min(p.bounds[0] for p in ps) + SB if ps else 0
        metrics[gname(c)] = (adv, int(round(xmin)))
    ps_name = (family + '-' + style).replace(' ', '')
    fb.setupCFF(ps_name, {'FullName': f'{family} {style}'}, cs, {})
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=800, descent=-200)
    fb.setupNameTable({'familyName': family, 'styleName': style, 'uniqueFontIdentifier': ps_name,
                       'fullName': f'{family} {style}', 'psName': ps_name, 'version': 'Version 1.000',
                       'copyright': 'PEPTICITY. Drawn for PEPTICITY from the owner reference, 2026.'})
    fb.setupOS2(sTypoAscender=800, sTypoDescender=-200, usWinAscent=820, usWinDescent=220, sCapHeight=700, sxHeight=700)
    fb.setupPost()
    fb.addOpenTypeFeatures('languagesystem DFLT dflt;\nfeature kern {\n' + ''.join(
        f'  pos {gname(a)} {gname(b)} {v};\n' for (a, b), v in KERN.items() if a in G and b in G) + '} kern;\n')
    path = os.path.join(OUT, fname)
    fb.save(path + '.otf')
    from fontTools.ttLib import TTFont
    f = TTFont(path + '.otf'); f.flavor = 'woff2'; f.save(path + '.woff2')


if __name__ == '__main__':
    REG = make_glyphs()
    CON = make_glyphs(k=0.64, s=128, R=150, r=40, wf=0.9)
    SPL = split_variant(REG)
    write_svg(REG, 'pepticity-black.svg', 'PEPTICITY BLACK glyph set')
    write_svg(CON, 'pepticity-black-condensed.svg', 'PEPTICITY BLACK CONDENSED glyph set')
    write_svg(SPL, 'pepticity-black-split.svg', 'PEPTICITY BLACK SPLIT glyph set')
    write_font(REG, 'Pepticity Black', 'Regular', 'PepticityBlack')
    write_font(CON, 'Pepticity Black Condensed', 'Regular', 'PepticityBlackCondensed')
    write_font(SPL, 'Pepticity Black Split', 'Regular', 'PepticityBlackSplit')
    json.dump({'cap': CAP, 'kern': {a + b: v for (a, b), v in KERN.items()}, 'regular': to_json(REG), 'condensed': to_json(CON), 'split': to_json(SPL)},
              open(os.path.join(OUT, 'glyphs.json'), 'w'), separators=(',', ':'))
    # quick preview sheet (PNG via the SVG paths, for eyeballing)
    print('glyphs:', len(REG), 'written to', OUT)
