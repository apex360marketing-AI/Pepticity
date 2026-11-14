#!/usr/bin/env bash
# Publish the assembled one build (/home/user/work/out/new/) to the PREVIEW address /new/ only. Grace's /store/ is never touched.
# usage: bash /home/user/work/publish_preview.sh "commit subject"
set -euo pipefail
MSG=${1:-"Preview at /new/: the one build"}
cd /home/user/pepticity
git fetch -q origin gh-pages:refs/remotes/origin/gh-pages
git merge-base --is-ancestor origin/gh-pages HEAD || git rebase -q origin/gh-pages
rm -rf new && cp -r /home/user/work/out/new new
git sparse-checkout add print
rm -rf print && cp -r /home/user/work/print/site/print print
git add -A new print
git diff --cached --quiet && { echo "nothing to publish"; exit 0; }
git commit -q -m "$MSG" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_01SMNC3XyoyTpKD3aaw38nPV"
git push -q origin HEAD:gh-pages
git push -q origin HEAD:claude/dashboards-brand-match
git log --oneline -1
H=$(sha256sum new/index.html | cut -c1-16)
timeout 300 bash -c "until [ \"\$(curl -s https://apex360marketing-ai.github.io/Pepticity/new/ | sha256sum | cut -c1-16)\" = $H ]; do sleep 10; done" && echo "LIVE: /new/ matches the build ($H)" || echo "NOT YET LIVE after 5 min"
