#!/usr/bin/env python3
"""Build the Command Center + Setup Kit preview pages from one source.

  python3 tools/command-center/build.py

Outputs
  sites/grace-command-center/index.html   PEPTICITY-branded (Grace), sample data
  sites/command-center-template/index.html blank, client-agnostic template for resale

The PEPTICITY 3D header engine, font and glyphs are copied byte-for-byte out of the
approved dashboard (sites/dashboard/index.html) so the headers match it exactly.
Nothing in the approved dashboard is modified.
"""
import json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
HERE = ROOT / 'tools' / 'command-center'
DASH = (ROOT / 'sites' / 'dashboard' / 'index.html').read_text()
SRC = (HERE / 'src.html').read_text()


def between(s, start, end, include_end=True):
    a = s.index(start)
    b = s.index(end, a)
    return s[a:b + (len(end) if include_end else 0)]


def grace_parts():
    fontface = re.search(r'@font-face\{font-family:"PEPTICITY BLACK";[^}]*\}', DASH).group(0)
    importmap = between(DASH, '<script type="importmap">', '</script>')
    glyphs = between(DASH, '<script type="application/json" id="glyph-data">', '</script>')
    mod_start = DASH.index('<script type="module">', DASH.index('id="emblem-data"'))
    mod = DASH[mod_start:DASH.index('</script>', mod_start)]
    engine = between(mod, 'const ENGINE = (() =>', '})();')
    pmesh = between(mod, 'function pMesh(', '\n}\n')
    start_type = between(mod, 'function startType()', '\n}\n')
    pdata = re.search(r'\sd="([^"]+)"', (ROOT / 'brand' / 'logo' / 'p-mark.svg').read_text()).group(1)
    symbol = f'<symbol id="pmark" viewBox="-0.708 -0.58 1.416 1.16"><path fill="url(#gGun)" d="{pdata}"/></symbol>'
    script = glyphs + '\n<script type="module">\n' + '\n'.join([
        "/* PEPTICITY 3D headers: engine, pMesh and startType copied unchanged from sites/dashboard (approved look). */",
        "import * as THREE from 'three';",
        "import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';",
        "import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';",
        "const D = document, HTML = D.documentElement;",
        "const RM = matchMedia('(prefers-reduced-motion: reduce)').matches, NOGL = /[?&]nogl/.test(location.search);",
        "const damp = (c, t, l, dt) => c + (t - c) * (1 - Math.exp(-l * dt));",
        "const canWebGL = () => { try { const c = D.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } };",
        "window.type3dFallback = function (why) { HTML.classList.remove('t3d'); window.__type3dWhy = why; };",
        engine, pmesh, start_type,
        "try { startType(); } catch (e) { console.warn(e); HTML.classList.remove('t3d'); }",
    ]) + '\n</script>'
    return {
        'FONTFACE': fontface,
        'HEAD_FONT': '"PEPTICITY BLACK",\'Instrument Sans\',ui-sans-serif,system-ui,sans-serif',
        'IMPORTMAP': importmap,
        'PMARK_SYMBOL': symbol,
        'BG_MARK': '<svg class="wmk" viewBox="-0.708 -0.58 1.416 1.16"><use href="#pmark"/></svg>',
        'BRAND_LOGO': '<div class="lg" data-type3d="P" role="img" aria-label="PEPTICITY P mark"><svg class="pfb" viewBox="-0.708 -0.58 1.416 1.16" aria-hidden="true"><use href="#pmark"/></svg></div>',
        'T3D': 'data-type3d',
        'TYPE3D_SCRIPT': script,
    }


def blank_parts(cfg):
    letter = (cfg.get('brandWord') or '?').strip('[]')[:1].upper()
    return {
        'FONTFACE': '/* template: add the client\'s display font here */',
        'HEAD_FONT': "'Instrument Sans',ui-sans-serif,system-ui,sans-serif",
        'IMPORTMAP': '', 'PMARK_SYMBOL': '', 'BG_MARK': '', 'T3D': '', 'TYPE3D_SCRIPT': '',
        'BRAND_LOGO': f'<div class="mono" role="img" aria-label="Client logo goes here">{letter}</div>',
    }


def build(cfg_name, out_dir, parts_fn):
    cfg = json.loads((HERE / cfg_name).read_text())
    parts = parts_fn(cfg) if parts_fn is blank_parts else parts_fn()
    html = SRC
    meta = {'TITLE': cfg['title'], 'DESCRIPTION': cfg['description'], 'BRAND_WORD': cfg['brandWord'],
            'KIT_FILE': cfg['kitFile'], 'CONFIG_JSON': json.dumps(cfg['cc'], ensure_ascii=False, indent=1).replace('</', '<\\/')}
    for k, v in {**parts, **meta}.items():
        html = html.replace('{{' + k + '}}', v)
    left = re.findall(r'\{\{[A-Z_0-9]+\}\}', html)
    assert not left, left
    out = ROOT / 'sites' / out_dir / 'index.html'
    out.write_text(html)
    print(out.relative_to(ROOT), len(html), 'bytes')


build('grace.json', 'grace-command-center', grace_parts)
build('template.json', 'command-center-template', blank_parts)


# ---- ship folders: kit/grace and kit/template are GENERATED from kit/*.ps1 + the pages above ----
import shutil
KIT_APPS = [
    {"name": "Tailscale", "why": "private link for remote help (stays off)", "winget": "Tailscale.Tailscale"},
    {"name": "Claude", "why": "AI assistant", "winget": "Anthropic.Claude"},
    {"name": "Google Chrome", "why": "browser", "winget": "Google.Chrome"},
    {"name": "Bitwarden", "why": "password vault", "winget": "Bitwarden.Bitwarden"},
    {"name": "Ente Auth", "why": "two-step sign-in codes", "winget": "ente-io.auth-desktop"},
    {"name": "Telegram", "why": "Concierge alerts", "winget": "Telegram.TelegramDesktop"},
    {"name": "Hermes Agent", "why": "the Concierge (official download page)", "page": "https://hermes-agent.nousresearch.com/docs/getting-started/installation"},
]
for name, cfg, site, cmd in [
        ('grace', {"client": "Grace", "business": "PEPTICITY", "agency": "APEX 360"}, 'grace-command-center', 'PEPTICITY-Setup.cmd'),
        ('template', {"client": "[Client]", "business": "[Business]", "agency": "[Agency name]"}, 'command-center-template', '[Business]-Setup.cmd')]:
    d = ROOT / 'kit' / name
    d.mkdir(exist_ok=True)
    (d / 'kit.json').write_text(json.dumps({**cfg, "apps": KIT_APPS}, indent=1))
    for f in ['setup.ps1', 'remote-help.ps1']:
        shutil.copy(ROOT / 'kit' / f, d / f)
    shutil.copy(ROOT / 'kit' / 'Setup.cmd', d / cmd)
    shutil.copy(ROOT / 'sites' / site / 'index.html', d / 'command-center.html')
    print('kit/' + name, sorted(p.name for p in d.iterdir()))
