#!/bin/sh
# Copies the site into publish/ as a flat multi-file artifact (index.html + files). ~54 MB, 241 files.
cd "$(dirname "$0")" && rm -rf publish && mkdir -p publish/media &&
cp index.html site.css site.js publish/ && cp -r vendor publish/ &&
cp -r media/frames media/bottles publish/media/ && cp media/*.mp4 media/*.webm media/*.jpg publish/media/ &&
rm -f publish/media/frames/manifest.json && du -sh publish && find publish -type f | wc -l
