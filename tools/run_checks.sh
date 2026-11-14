#!/usr/bin/env bash
# Run every check against the assembled build. usage: bash /home/user/work/run_checks.sh  (server: port 8796 -> /home/user/work/out)
U=http://localhost:8796/new/
L=/home/user/work/checks-log; rm -rf $L; mkdir -p $L /home/user/work/works-out3
cd /home/user/work
timeout 600 node works.js $U /home/user/work/works-out3 > $L/works.txt 2>&1; echo "works exit=$?" >> $L/summary.txt
for w in top cards guide hooks; do
  [ -f $w/check.js ] || continue
  (cd $w && timeout 1500 node check.js $U > $L/$w.txt 2>&1); echo "$w exit=$?" >> $L/summary.txt
done
echo DONE >> $L/summary.txt
