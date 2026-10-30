#!/bin/sh
# Builds sites/main/v4/publish/ (the /site-v4/ preview): index.html + every file it needs, symlinks resolved (brand/, media/, vendor/, shared/ are links).
# Run: sh sites/main/v4/make-publish.sh   -> prints size, file count and writes publish/FILES.txt
set -e
cd "$(dirname "$0")"
rm -rf publish && mkdir -p publish/brand/font publish/brand/logo publish/brand/ui publish/brand/src/dash publish/media publish/vendor publish/data publish/assets publish/fx
cp index.html v4.css v4-tour.css v4.js gl3d.js card3d.js publish/
for c in fx/*/; do mkdir -p "publish/$c"; cp "$c"module.css "$c"module.js "publish/$c"; done
cp data/products.json publish/data/
cp assets/*.webp publish/assets/
cp -L brand/font/PepticityBlack.woff2 brand/font/glyphs.json brand/font/type3d-engine.js publish/brand/font/
cp -L brand/logo/p-mark.svg brand/logo/emblem.svg publish/brand/logo/
cp -L brand/ui/button.css brand/ui/button.js brand/ui/smoke-bg.js publish/brand/ui/
cp -L brand/src/dash/_blank.webp publish/brand/src/dash/
cp -L vendor/gsap.min.js vendor/ScrollTrigger.min.js vendor/lenis.min.js publish/vendor/
for f in media/chest-white.mp4 media/chest-black.mp4; do [ -f "$f" ] && cp -L "$f" publish/media/ || true; done
cp -L media/chest-white.webm media/chest-white-poster.jpg media/chest-black.webm media/chest-black-poster.jpg publish/media/
cp -L media/white-doors.jpg media/black-doors.jpg media/white-lab.jpg media/black-lab.jpg media/white-city.jpg media/black-city.jpg publish/media/
mkdir -p publish/shared/bot && [ -f shared/bot/pep-bot.js ] && cp -L shared/bot/pep-bot.js publish/shared/bot/ ; [ -f shared/bot/pep-bot.css ] && cp -L shared/bot/pep-bot.css publish/shared/bot/ ; true
mkdir -p publish/media/frames-hd && cp -L media/frames-hd/manifest.json media/frames-hd/*-weave-*.webp media/frames-hd/*-lab-*.webp publish/media/frames-hd/
( cd publish && find . -type f ! -name FILES.txt | sort | while read f; do printf '%s\t%s\n' "$(du -k "$f" | cut -f1)KB" "$f"; done > FILES.txt )
du -sh publish && find publish -type f | wc -l
