#!/bin/sh
# Builds sites/main/v3/publish/: index.html + every file it needs, symlinks resolved (brand/, media/, vendor/, shared/ are links in v3/).
# Run: sh sites/main/v3/make-publish.sh   -> prints size, file count and writes publish/FILES.txt
# Not published: tools/, shots/, HOOK-MAP.md (review material only).
set -e
cd "$(dirname "$0")"
rm -rf publish && mkdir -p publish/brand/font publish/brand/logo publish/brand/ui publish/brand/src/dash publish/media publish/vendor publish/data publish/assets publish/shared/bot
cp index.html v3.css v3.js gl3d.js card3d.js vibe.css publish/
cp data/products.json publish/data/
cp assets/*.webp publish/assets/
cp -L brand/font/PepticityBlack.woff2 brand/font/glyphs.json brand/font/type3d-engine.js publish/brand/font/
cp -L brand/logo/p-mark.svg brand/logo/emblem.svg publish/brand/logo/
cp -L brand/ui/button.css brand/ui/button.js brand/ui/smoke-bg.js publish/brand/ui/
cp -L brand/src/dash/_blank.webp publish/brand/src/dash/
cp -L vendor/gsap.min.js vendor/ScrollTrigger.min.js vendor/lenis.min.js publish/vendor/
cp -L media/chest-white.mp4 media/chest-white.webm media/chest-white-poster.jpg media/chest-black.mp4 media/chest-black.webm media/chest-black-poster.jpg publish/media/
cp -L media/white-doors.jpg media/black-doors.jpg media/white-lab.jpg media/black-lab.jpg publish/media/
# the concierge (mode switch: guide on the landing, sell past the 19+ gate)
cp -L shared/bot/pep-bot.js shared/bot/pep-bot.css publish/shared/bot/
# optional second-doors film (PC_CONFIG.secondDoorsFilm = 'media/doors2-'): copied only if it exists
for f in media/doors2-white.mp4 media/doors2-white.webm media/doors2-black.mp4 media/doors2-black.webm; do [ -f "$f" ] && cp -L "$f" publish/media/ || true; done
mkdir -p publish/media/frames-hd && cp -L media/frames-hd/manifest.json media/frames-hd/*-weave-*.webp media/frames-hd/*-lab-*.webp publish/media/frames-hd/
( cd publish && find . -type f ! -name FILES.txt | sort | while read f; do printf '%s\t%s\n' "$(du -k "$f" | cut -f1)KB" "$f"; done > FILES.txt )
du -sh publish && find publish -type f | wc -l
