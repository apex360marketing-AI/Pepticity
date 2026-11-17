#!/bin/sh
export NODE_PATH=/opt/node-tools/node_modules
L=/home/user/work/r5/fix/test-run.log; : > $L
cd /home/user/work/r5/audit/e2e
for u in 8965 8966; do echo "### H5-1 SMS consent on $u" >> $L; ONLY=H63 node forms.js http://127.0.0.1:$u/new/ ok desktop 2>&1 | grep -E "BROKEN|safe|ERROR" >> $L; echo "### H5-2 phone menu on $u" >> $L; node probe_phone_menu.js http://127.0.0.1:$u/new/ 2>&1 | grep -E "BROKEN|safe|ERROR" >> $L; done
U=http://127.0.0.1:8966/new/
cd /home/user/work/r4/fix/test && echo "### founders.test rc6" >> $L && node founders.test.js $U 2>&1 | grep -cE "^PASS" >> $L && node founders.test.js $U 2>&1 | grep -E "FAIL|ERROR|EXIT" >> $L; echo "### menu.test rc6" >> $L; node menu.test.js $U 2>&1 | tail -6 >> $L
cd /home/user/work/r4/sec/repro && echo "### security repros rc6" >> $L && node r4_invariants.js $U 2>&1 | tail -1 >> $L && node r4_cover_link_path.js $U 2>&1 | tail -1 >> $L
cd /home/user/work && echo "### frame guard rc6" >> $L && node r3tools/check_r3.js $U 2>&1 | tail -1 >> $L
echo "### DONE" >> $L
