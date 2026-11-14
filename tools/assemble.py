# Build the one store from the merged base + each worker's apply.py, then the one-blue colour pass.
# usage: python3 -I assemble.py [worker ...]     (default order: top cards guide hooks; a worker without apply.py is skipped)
# Output: /home/user/work/out/new/index.html with /home/user/work/final/new/ assets (recoloured vials) + any NEW asset files
# a worker added (existing files are never overwritten by a worker's stale copy).
import os, shutil, subprocess, sys, filecmp

W = '/home/user/work/'
order = sys.argv[1:] or ['top', 'cards', 'guide', 'hooks']
src = W + 'base-merged.html'
tmp = W + 'assemble-tmp/'
shutil.rmtree(tmp, ignore_errors=True); os.makedirs(tmp)
step = 0
for w in order:
    ap = f'{W}{w}/apply.py'
    if not os.path.exists(ap):
        print(f'SKIP  {w}: no apply.py yet'); continue
    step += 1
    dst = f'{tmp}{step}-{w}.html'
    r = subprocess.run(['python3', '-I', ap, src, dst], capture_output=True, text=True)
    if r.returncode or not os.path.exists(dst):
        print(f'FAIL  {w}: apply.py exit {r.returncode}\n{(r.stdout + r.stderr)[-800:]}'); sys.exit(1)
    # idempotence: applying twice must give the same file
    again = dst + '.again'
    subprocess.run(['python3', '-I', ap, dst, again], capture_output=True, text=True)
    same = os.path.exists(again) and filecmp.cmp(dst, again, shallow=False)
    print(f'OK    {w}: {os.path.getsize(src)} -> {os.path.getsize(dst)} bytes{"" if same else "  (WARNING: not idempotent)"}')
    src = dst
r = subprocess.run(['python3', '-I', W + 'final_sweep.py', src, tmp + 'final.html'], capture_output=True, text=True)
print('SWEEP', r.stdout.strip().replace('\n', '; ') or r.stderr[-400:])
out = W + 'out/'
shutil.rmtree(out, ignore_errors=True)
shutil.copytree(W + 'final/', out)
shutil.copy(tmp + 'final.html', out + 'new/index.html')
added = []
for w in order:
    a = f'{W}{w}/site/new/assets/'
    if not os.path.isdir(a): continue
    for root, _, files in os.walk(a):
        for f in files:
            rel = os.path.relpath(os.path.join(root, f), a)
            target = out + 'new/assets/' + rel
            if not os.path.exists(target):
                os.makedirs(os.path.dirname(target), exist_ok=True)
                shutil.copy2(os.path.join(root, f), target); added.append(f'{w}:{rel}')
print('NEW ASSETS', ', '.join(added) or 'none')
print('BUILT', out + 'new/index.html', os.path.getsize(out + 'new/index.html'), 'bytes')
