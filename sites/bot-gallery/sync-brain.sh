#!/bin/sh
# Copies the trained brain + brand files into this folder so the gallery is self-contained when published.
cd "$(dirname "$0")" && cp ../../shared/inventory.js ../../shared/pep-brain.js shared/ && cp ../../brand/font/PepticityBlack.woff2 assets/
# NOTE: assets/p-mark.svg is the ONE LOGO SWAP SLOT. Drop the new P here (same file name) or change --logo-p in shared/gallery.css.
