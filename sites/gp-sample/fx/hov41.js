// HOV-41 CHROME BEZEL TILT — standalone module (tilt logic copied from the Effects Vault original).
// Original: dev.addEventListener('pointermove') -> --ry=(x-.5)*14deg, --rx=(.5-y)*10deg, --gx/--gy %, reset on pointerleave; skipped when prefers-reduced-motion.
const DEFAULT_COLORS = {
  gold: ['#332814', '#68513d', '#a4845d', '#f0e6c7', '#fef9e8'],
  platinum: ['#2a2d31', '#6b7077', '#b9bec5', '#e6e9ed', '#ffffff'],
  accent: '#8b6cff'
};
const hex = h => { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
const mix = (a, b, t) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };

// Same stop order/lightness rhythm as the original gradient (light, mid, light, dark, light, mid),
// each stop a platinum+gold blend so the two metals are woven through the whole bezel.
function bezelStops(c) {
  const g = c.gold, p = c.platinum;
  return [
    mix(p[4], g[4], 0.22), mix(p[2], g[2], 0.35), mix(p[3], g[3], 0.30),
    mix(p[1], g[1], 0.45), mix(p[3], g[3], 0.18), mix(p[2], g[2], 0.50)
  ];
}

export function mountHov41(el, { colors } = {}) {
  colors = { ...DEFAULT_COLORS, ...(colors || {}) };
  const motionOn = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const kids = [...el.childNodes];
  el.classList.add('hov41');
  const bezel = document.createElement('div'); bezel.className = 'hov41-bezel';
  const screen = document.createElement('div'); screen.className = 'hov41-screen';
  const glare = document.createElement('div'); glare.className = 'hov41-glare'; glare.setAttribute('aria-hidden', 'true');
  kids.forEach(k => screen.appendChild(k));
  bezel.appendChild(screen);
  el.append(bezel);
  // glare lives inside the bezel's tilt so it leans with it
  bezel.appendChild(glare);

  const apply = c => { colors = { ...colors, ...c }; bezelStops(colors).forEach((v, i) => el.style.setProperty('--hov41-m' + i, v)); };
  apply({});

  const onMove = e => {
    if (!motionOn) return;
    const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--ry', ((x - .5) * 14).toFixed(2) + 'deg');
    el.style.setProperty('--rx', ((.5 - y) * 10).toFixed(2) + 'deg');
    el.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
    el.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
  };
  const onLeave = () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); };
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerleave', onLeave);

  return {
    setColors: apply,
    destroy() {
      el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerleave', onLeave);
      kids.forEach(k => el.appendChild(k)); bezel.remove(); glare.remove();
      el.classList.remove('hov41');
      ['--rx', '--ry', '--gx', '--gy', '--hov41-m0', '--hov41-m1', '--hov41-m2', '--hov41-m3', '--hov41-m4', '--hov41-m5'].forEach(p => el.style.removeProperty(p));
    }
  };
}
