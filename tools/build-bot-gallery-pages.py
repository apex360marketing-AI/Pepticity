#!/usr/bin/env python3
"""Writes sites/bot-gallery/<nn-slug>/index.html for all 15 bots (the pages are thin: shared frame + one bot.js each)."""
import os, re
root = os.path.join(os.path.dirname(__file__), '..', 'sites', 'bot-gallery')
reg = open(os.path.join(root, 'shared', 'registry.js')).read()
slugs = re.findall(r"slug: '([^']+)'", reg)
THREE = {'04-scouts', '05-follow', '09-projector', '13-p-looks', '14-medallion', '15-lab', '01-mercury', '02-absorb', '03-field'}
for s in slugs:
    d = os.path.join(root, s); os.makedirs(d, exist_ok=True)
    three = s in THREE
    imap = '<script type="importmap">{"imports":{"three":"../vendor/three.module.js","three/addons/":"../vendor/addons/"}}</script>\n' if three else ''
    html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>PEPTICITY bot gallery</title>
<meta name="robots" content="noindex">
<link rel="stylesheet" href="../shared/gallery.css">
<link rel="stylesheet" href="bot.css">
{imap}</head>
<body data-slug="{s}">
<script src="../shared/registry.js"></script>
<script src="../shared/inventory.js"></script>
<script src="../shared/pep-brain.js"></script>
<script src="../shared/gallery-brain.js"></script>
<script src="../shared/common.js"></script>
<script {'type="module" ' if three else ''}src="bot.js"></script>
</body>
</html>
'''
    open(os.path.join(d, 'index.html'), 'w').write(html)
    for f in ('bot.css', 'bot.js'):
        p = os.path.join(d, f)
        if not os.path.exists(p): open(p, 'w').write('')
print(len(slugs), 'pages')
