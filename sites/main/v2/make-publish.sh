#!/bin/sh
# Builds sites/main/v2/publish/: index.html + every file it needs, symlinks resolved (brand/, media/, vendor/ are links in v2/).
# Run: sh sites/main/v2/make-publish.sh   -> prints size, file count and writes publish/FILES.txt
set -e
cd "$(dirname "$0")"
rm -rf publish && mkdir -p publish/brand/font publish/brand/logo publish/brand/ui publish/brand/src/dash publish/media publish/vendor publish/data publish/assets
cp index.html v2.css v2.js gl3d.js publish/
cp data/products.json publish/data/
cp assets/*.webp publish/assets/
cp -L brand/font/PepticityBlack.woff2 brand/font/glyphs.json brand/font/type3d-engine.js publish/brand/font/
cp -L brand/logo/p-mark.svg brand/logo/emblem.svg publish/brand/logo/
cp -L brand/ui/button.css brand/ui/button.js brand/ui/smoke-bg.js publish/brand/ui/
cp -L brand/src/dash/_blank.webp publish/brand/src/dash/
cp -L vendor/gsap.min.js vendor/ScrollTrigger.min.js vendor/lenis.min.js publish/vendor/
cp -L media/chest-white.mp4 media/chest-white.webm media/chest-white-poster.jpg media/chest-black.mp4 media/chest-black.webm media/chest-black-poster.jpg publish/media/
cp -L media/white-doors.jpg media/black-doors.jpg media/white-lab.jpg media/black-lab.jpg publish/media/
mkdir -p publish/shared/bot && [ -f shared/bot/pep-bot.js ] && cp -L shared/bot/pep-bot.js publish/shared/bot/ ; [ -f shared/bot/pep-bot.css ] && cp -L shared/bot/pep-bot.css publish/shared/bot/ ; true
mkdir -p publish/media/frames && cp -L media/frames/*-weave-*.webp media/frames/*-lab-*.webp publish/media/frames/
( cd publish && find . -type f ! -name FILES.txt | sort | while read f; do printf '%s\t%s\n' "$(du -k "$f" | cut -f1)KB" "$f"; done > FILES.txt )
du -sh publish && find publish -type f | wc -l
