---
name: clickable-preview
description: Use whenever the PEPTICITY owner must review a page or version. He wants a working link he can click through, never screenshots. Picks the hosting that really works, builds one small page per thing, and opens them one at a time.
---
# CLICKABLE PREVIEW

Owner (7 Nov): "I don't ever want screenshots. It's bullshit. Let me actually look through the site and try it." and "create the smaller artifacts individually first so I can see them."

## Rules
1. Deliver a LIVE, working page. A picture is only for your own checking.
2. SMALL FIRST: one artifact per sample or version, delivered one at a time, in order, each opened for him (and a step on the board).
3. Never send a link that has not been loaded and clicked through in a real browser first.

## Hosting that works
- Private artifact (owner only): fine for samples. The page runs under a strict CSP: remote images, media and fetch to other hosts are BLOCKED, scripts only from cdnjs, jsdelivr/npm, unpkg. So ship every asset inside the artifact (local files via publish_files, up to 255 files and 64 MB per publish, 256 MB per version), vendor three.js locally, inline small images.
- Big shared media (films, door, lab and city frames, 245 MB) does not fit comfortably: use the lean set of files the page actually requests, or host on GitHub Pages.
- GitHub Pages (public, no login) is where anything for Grace goes, and only after the owner's yes. gh-pages is near its 1 GB limit, so use the lean package (shared media once).

## Check before sending
Load the real URL, click the main path, no console errors, hover works, scroll works, 1440x900 and 390x844.
