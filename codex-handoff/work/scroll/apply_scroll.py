#!/usr/bin/env python3
"""apply_scroll.py IN.html OUT.html

Adds THE SCROLL GOVERNOR to the PEPTICITY store page.

What it does, and nothing else:
  1. one <style> block  (src/governor.css)  just before </head>
  2. one <script> block (src/governor.js)   just before </body>
  3. six one-line edits inside code that already handles scrolling or the P's turn:
     a. 16-lineup: the rest on each case, 180 ms -> 500 ms
     b. 16-lineup: the page being carried past the stage by the governor is followed, not caught at the door
     c. 16-lineup: once another hand has moved the page, the stage forgets its own last write (so a finger's snap that
        lands back on that very pixel is still seen, and the stage holds)
     d. 16-lineup: the stage's settle timer does not pull the page onto a case while the governor travels through the
        stage (End, Home or a long jump on a slow device: without it the page stopped at the stage, checks 14 Nov)
     e. 16-lineup: the stage tells the governor where it holds and takes its one-step ask (bus: lineup:stage)
     f. 02-logo3d: a P answers "one full turn, and how much is left" (bus: logo3d:turn)

Every edit is anchored on a string, never a line number. Every anchor is checked before anything is changed: if one is
missing, or is there more than once, nothing is written and the script stops with exit code 2. Running it on its own
output gives the same bytes again.
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))


def die(msg):
    sys.stderr.write('apply_scroll: STOP: ' + msg + '\n')
    sys.exit(2)


def read(path):
    with open(path, encoding='utf-8', newline='') as f:
        return f.read()


# ---- the one-line edits. Each: name, anchor (must be in the page exactly once), what the anchor becomes, and the mark
#      that proves the edit is in (must be in the finished page exactly once).
DOOR = 'if (door > -1 && Math.abs(y - prev) > Math.max(420, SH * 1.25)) { door = -1; }'
DOOR_ADD = ' if (door > -1 && window.PEPScroll && window.PEPScroll.moving()) { door = -1; }'

OWN = 'if (entering || leaving || Math.abs(y - ownY) < 1.5) { return; }'
OWN_ADD = ' ownY = -1e9;'

SETTLE = "if (mode !== 'held' || entering || leaving) { return; }"
SETTLE_NEW = "if (mode !== 'held' || entering || leaving || (window.PEPScroll && window.PEPScroll.moving())) { return; }"

STAGE = "        window.addEventListener('wheel', onWheel, { passive: false, capture: true });"
STAGE_ADD = (
    "        // THE SCROLL GOVERNOR (core/governor.js) holds the wheel for the whole page: it is told here where the stage holds,\n"
    "        // and asks for one step at a time (push). While it owns the wheel, onWheel below is never reached.\n"
    "        ctx.emit('lineup:stage', { held: function () { return mode === 'held' && n > 0; }, zone: zone, yOf: yOf, at: function () { return { step: step, first: first, n: n, queued: queued }; }, busy: function () { return busy(clock()); }, moving: function () { return entering || leaving; }, push: push });\n"
)

TURN = "            stage.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); s.spinT += Math.PI * 2; kick(); } });\n"
TURN_ADD = (
    "            // THE SCROLL GOVERNOR asks this P for one full turn when its section arrives (the same turn as the click above;\n"
    "            // not a second one if a turn is already under way), and how much of that turn is left. Bus: logo3d:turn { el, go }.\n"
    "            ctx.on('logo3d:turn', function (a) {\n"
    "              if (!a || a.el !== req.el) { return; }\n"
    "              a.ok = !REDUCED && !dead && !!s.visible && !!s.ready && !(s.hold && !gateOpen);\n"
    "              if (a.go && a.ok) { if (s.spinT - s.spin < Math.PI) { s.spinT += Math.PI * 2; } s.turnTo = s.spinT; kick(); }\n"
    "              a.left = Math.max(0, (s.turnTo || 0) - s.spin); a.ry = s.ry;\n"
    "            });\n"
)

EDITS = [
    ('16-lineup rest', 'REST = 180, GAP = 160, DOOR_GAP = 240', 'REST = 500, GAP = 160, DOOR_GAP = 240', 'REST = 500, GAP = 160, DOOR_GAP = 240'),
    ('16-lineup door', DOOR, DOOR + DOOR_ADD, DOOR_ADD),
    ('16-lineup own hand', OWN, OWN + OWN_ADD, OWN + OWN_ADD),
    ('16-lineup settle', SETTLE, SETTLE_NEW, 'window.PEPScroll.moving())) { return; }'),
    ('16-lineup stage', STAGE, STAGE_ADD + STAGE, "ctx.emit('lineup:stage', {"),
    ('02-logo3d turn', TURN, TURN + TURN_ADD, "ctx.on('logo3d:turn', function (a) {"),
]
BLOCKS = [
    ('style', 'core/governor.css', os.path.join('src', 'governor.css'), '</head>'),
    ('script', 'core/governor.js', os.path.join('src', 'governor.js'), '</body>'),
]


def block(src, tag, name, body, before):
    """Put (or put again) one marked block just before `before`."""
    opening = '<%s data-pep-src="%s">' % (tag, name)
    closing = '</%s>' % tag
    whole = opening + '\n' + body.rstrip('\n') + '\n' + closing + '\n'
    if opening in src:
        a = src.index(opening)
        b = src.index(closing, a) + len(closing)
        if src[b:b + 1] == '\n':
            b += 1
        return src[:a] + whole + src[b:]
    i = src.index(before)
    return src[:i] + whole + src[i:]


def main():
    if len(sys.argv) != 3:
        die('usage: apply_scroll.py IN.html OUT.html')
    src = read(sys.argv[1])
    bodies = {}
    for tag, name, path, before in BLOCKS:
        bodies[name] = read(os.path.join(HERE, path))
        if '</' + tag in bodies[name].lower():
            die('%s holds its own closing tag' % path)

    # ---- check every anchor first: a page that has moved on is never half-patched
    for what, anchor, new, mark in EDITS:
        done = src.count(mark) == 1 and (new in src)
        if not done and src.count(anchor) != 1:
            die('%s: the anchor is in the page %d times (need exactly 1): %r' % (what, src.count(anchor), anchor.strip()[:100]))
    for tag, name, path, before in BLOCKS:
        opening = '<%s data-pep-src="%s">' % (tag, name)
        if src.count(opening) > 1:
            die('%s: the block is in the page %d times' % (name, src.count(opening)))
        if src.count(opening) == 0 and src.count(before) != 1:
            die('%s: "%s" is in the page %d times (need exactly 1)' % (name, before, src.count(before)))

    # ---- apply
    out = src
    for what, anchor, new, mark in EDITS:
        if new not in out:
            out = out.replace(anchor, new)
    for tag, name, path, before in BLOCKS:
        out = block(out, tag, name, bodies[name], before)

    # ---- prove
    for what, anchor, new, mark in EDITS:
        if out.count(mark) != 1:
            die('after the edits the mark of "%s" is in the page %d times' % (what, out.count(mark)))
    for tag, name, path, before in BLOCKS:
        if out.count('data-pep-src="%s"' % name) != 1:
            die('after the edits the block %s is in the page %d times' % (name, out.count('data-pep-src="%s"' % name)))

    with open(sys.argv[2], 'w', encoding='utf-8', newline='') as f:
        f.write(out)
    print('apply_scroll: wrote %s (%d bytes, %+d characters)' % (sys.argv[2], len(out.encode('utf-8')), len(out) - len(src)))


if __name__ == '__main__':
    main()
