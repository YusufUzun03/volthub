/* ═══════════════════════════════════════════════════════════
   VOLTHUB — HERO VISUAL
   A monochrome, animated and DETAILED CPU / processor die.
   Floorplan with functional blocks (logic cores + cache
   stripes), a breathing central core with bond-wire buses,
   contact-pad pin rows on four sides, traces with travelling
   signal pulses, and a radial vignette so the whole thing
   dissolves smoothly into the page (no frame). Single-hue.
═══════════════════════════════════════════════════════════ */

function initHeroVisual() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0; const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function css(v) { return getComputedStyle(document.body).getPropertyValue(v).trim(); }
  let COL = {};
  function readColors() {
    COL = { ink: css('--ink') || '#222', surf: css('--surface') || '#fff', paper: css('--paper') || '#fff' };
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    build();
  }

  let geo = null, cells = [], blocks = [], traces = [], pulses = [], coreCells = [];

  function rr(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function newCell(x, y, w, h) {
    return { x, y, w, h, lit: Math.random() * 0.3, target: 0, nextAt: Math.random() * 2600 };
  }

  function build() {
    const cx = W / 2, cy = H / 2;
    const chip = Math.min(W, H) * 0.44;
    const half = chip / 2;
    const x0 = cx - half, y0 = cy - half;
    const bz = chip * 0.115;
    const dieX = x0 + bz, dieY = y0 + bz, dieS = chip - bz * 2;
    geo = { cx, cy, chip, half, x0, y0, bz, dieX, dieY, dieS };

    cells = []; blocks = []; coreCells = [];
    const gap = dieS * 0.24;
    const bw = (dieS - gap) / 2;
    const coreS = dieS * 0.235;

    // four quadrant blocks
    const tl = { x: dieX, y: dieY, w: bw, h: bw, kind: 'grid' };
    const tr = { x: dieX + bw + gap, y: dieY, w: bw, h: bw, kind: 'stripe' };
    const bl = { x: dieX, y: dieY + bw + gap, w: bw, h: bw, kind: 'stripe' };
    const br = { x: dieX + bw + gap, y: dieY + bw + gap, w: bw, h: bw, kind: 'grid' };
    blocks = [tl, tr, bl, br];

    blocks.forEach(b => {
      const m = b.w * 0.13;
      if (b.kind === 'grid') {
        const n = 4, gx = (b.w - 2 * m) / n, gy = (b.h - 2 * m) / n;
        for (let r = 0; r < n; r++) for (let c = 0; c < n; c++)
          cells.push(newCell(b.x + m + c * gx + gx * 0.16, b.y + m + r * gy + gy * 0.16, gx * 0.68, gy * 0.68));
      } else {
        const n = 5, gy = (b.h - 2 * m) / n;
        for (let i = 0; i < n; i++)
          cells.push(newCell(b.x + m, b.y + m + i * gy + gy * 0.22, b.w - 2 * m, gy * 0.5));
      }
    });

    // core micro-cells (a tight grid that shimmers)
    geo.core = { x: cx - coreS / 2, y: cy - coreS / 2, s: coreS };
    const cn = 3, cm = coreS * 0.16, cg = (coreS - 2 * cm) / cn;
    for (let r = 0; r < cn; r++) for (let c = 0; c < cn; c++)
      coreCells.push(newCell(geo.core.x + cm + c * cg + cg * 0.16, geo.core.y + cm + r * cg + cg * 0.16, cg * 0.68, cg * 0.68));

    // pins + traces (contact pads on four sides)
    traces = []; pulses = [];
    const perSide = 9;
    ['top', 'right', 'bottom', 'left'].forEach(side => {
      for (let i = 0; i < perSide; i++) {
        const t = (i + 1) / (perSide + 1);
        let px, py, dx, dy;
        if (side === 'top')    { px = x0 + chip * t; py = y0;        dx = 0; dy = -1; }
        if (side === 'bottom') { px = x0 + chip * t; py = y0 + chip; dx = 0; dy = 1; }
        if (side === 'left')   { px = x0;            py = y0 + chip * t; dx = -1; dy = 0; }
        if (side === 'right')  { px = x0 + chip;     py = y0 + chip * t; dx = 1; dy = 0; }
        const pinLen = chip * 0.06;
        const fx = dx ? Math.min(Math.max(px + dx * 9999, 4), W - 4) : px;
        const fy = dy ? Math.min(Math.max(py + dy * 9999, 4), H - 4) : py;
        traces.push({ px, py, dx, dy, pinLen, fx, fy, padW: chip * 0.03 });
      }
    });

    const pCount = reduce ? 0 : 11;
    for (let i = 0; i < pCount; i++) spawnPulse();
  }

  function spawnPulse() {
    if (!traces.length) return;
    const tr = traces[(Math.random() * traces.length) | 0];
    pulses.push({ tr, t: Math.random(), speed: 0.0014 + Math.random() * 0.0026, dir: Math.random() < .5 ? 1 : -1 });
  }
  function reassign(p) { p.tr = traces[(Math.random() * traces.length) | 0]; p.dir = Math.random() < .5 ? 1 : -1; p.t = p.dir > 0 ? 0 : 1; }

  function tick(arr, dt) {
    arr.forEach(c => {
      c.nextAt -= dt;
      if (c.nextAt <= 0) { c.target = Math.random() < 0.5 ? 1 : 0; c.nextAt = 500 + Math.random() * 2600; }
      c.lit += (c.target - c.lit) * 0.07;
    });
  }

  let phase = 0, t0 = performance.now(), errCount = 0;
  function frame(now) {
    try { frameBody(now); errCount = 0; }
    catch (err) { if (errCount++ < 3) console.error('HERO frame error:', err); }
    requestAnimationFrame(frame);
  }

  function frameBody(now) {
    const dt = Math.min(now - t0, 50); t0 = now;
    phase += dt * 0.001;
    ctx.clearRect(0, 0, W, H);
    if (!geo) return;
    const { cx, cy, chip, x0, y0, bz, core } = geo;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (!reduce) { tick(cells, dt); tick(coreCells, dt); }

    // ── traces (pin → edge), fading out toward the edge so there is no hard cut ──
    traces.forEach(tr => {
      const sx = tr.px + tr.dx * tr.pinLen, sy = tr.py + tr.dy * tr.pinLen;
      const grad = ctx.createLinearGradient(sx, sy, tr.fx, tr.fy);
      grad.addColorStop(0, COL.ink); grad.addColorStop(1, 'transparent');
      ctx.strokeStyle = grad; ctx.globalAlpha = 0.16; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(tr.fx, tr.fy); ctx.stroke();
    });
    ctx.fillStyle = COL.ink;

    // ── pulses (fade as they near the edge) ──
    pulses.forEach(p => {
      if (!reduce) p.t += p.speed * p.dir;
      if (p.t > 1 || p.t < 0) reassign(p);
      const tr = p.tr;
      const sx = tr.px + tr.dx * tr.pinLen, sy = tr.py + tr.dy * tr.pinLen;
      const x = sx + (tr.fx - sx) * p.t, y = sy + (tr.fy - sy) * p.t;
      const ef = Math.max(0, 1 - p.t * 0.95); // edge fade
      const tt = Math.max(0, Math.min(1, p.t - 0.18 * p.dir));
      ctx.globalAlpha = 0.5 * ef; ctx.lineWidth = 1.6; ctx.strokeStyle = COL.ink;
      ctx.beginPath();
      ctx.moveTo(sx + (tr.fx - sx) * tt, sy + (tr.fy - sy) * tt);
      ctx.lineTo(x, y); ctx.stroke();
      const g = ctx.createRadialGradient(x, y, 0, x, y, 7);
      g.addColorStop(0, COL.ink); g.addColorStop(1, 'transparent');
      ctx.globalAlpha = 0.5 * ef; ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill();
      ctx.globalAlpha = ef; ctx.fillStyle = COL.ink;
      ctx.beginPath(); ctx.arc(x, y, 1.9, 0, 7); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // ── contact pads (pins) ──
    ctx.fillStyle = COL.ink;
    traces.forEach(tr => {
      const w = chip * 0.012, len = tr.pinLen;
      ctx.globalAlpha = 0.34;
      if (tr.dx) rr(tr.dx > 0 ? tr.px : tr.px - len, tr.py - w, len, w * 2, w);
      else rr(tr.px - w, tr.dy > 0 ? tr.py : tr.py - len, w * 2, len, w);
      ctx.fill();
      // solder pad on the chip edge
      ctx.globalAlpha = 0.5;
      rr(tr.px - tr.padW / 2, tr.py - tr.padW / 2, tr.padW, tr.padW, tr.padW * 0.28);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // ── chip body ──
    const cr = chip * 0.075;
    ctx.fillStyle = COL.surf; ctx.globalAlpha = 0.45;
    rr(x0, y0, chip, chip, cr); ctx.fill();
    ctx.globalAlpha = 0.5; ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.6;
    rr(x0, y0, chip, chip, cr); ctx.stroke();
    // inner bezel ring
    ctx.globalAlpha = 0.16; ctx.lineWidth = 1;
    rr(x0 + bz * 0.55, y0 + bz * 0.55, chip - bz * 1.1, chip - bz * 1.1, cr * 0.7); ctx.stroke();
    // corner orientation notch + 4 mounting dots
    ctx.globalAlpha = 0.5; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.arc(x0 + bz * 0.95, y0 + bz * 0.95, chip * 0.02, 0, 7); ctx.stroke();
    ctx.globalAlpha = 0.22;
    [[bz * 0.55, bz * 0.55], [chip - bz * 0.55, bz * 0.55], [bz * 0.55, chip - bz * 0.55], [chip - bz * 0.55, chip - bz * 0.55]].forEach(([dx, dy]) => {
      ctx.beginPath(); ctx.arc(x0 + dx, y0 + dy, chip * 0.008, 0, 7); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // ── functional blocks (outlines) ──
    blocks.forEach(b => {
      ctx.globalAlpha = 0.2; ctx.lineWidth = 1; ctx.strokeStyle = COL.ink;
      rr(b.x, b.y, b.w, b.h, b.w * 0.08); ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // ── bond-wire buses (core → block centres) ──
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.22;
    blocks.forEach(b => {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(b.x + b.w / 2, b.y + b.h / 2);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // ── block cells (logic + cache) ──
    ctx.fillStyle = COL.ink;
    cells.forEach(c => {
      ctx.globalAlpha = 0.07 + c.lit * 0.48;
      rr(c.x, c.y, c.w, c.h, Math.min(c.w, c.h) * 0.28); ctx.fill();
      ctx.globalAlpha = 0.1; ctx.lineWidth = 0.7; ctx.strokeStyle = COL.ink;
      rr(c.x, c.y, c.w, c.h, Math.min(c.w, c.h) * 0.28); ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // ── central core ──
    const breathe = 0.5 + 0.5 * Math.sin(phase * 1.7);
    // glow
    const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, core.s * 1.7);
    cg.addColorStop(0, COL.ink); cg.addColorStop(1, 'transparent');
    ctx.globalAlpha = 0.08 + breathe * 0.14; ctx.fillStyle = cg;
    ctx.beginPath(); ctx.arc(cx, cy, core.s * 1.7, 0, 7); ctx.fill();
    // core plate
    ctx.globalAlpha = 0.5; ctx.fillStyle = COL.surf;
    rr(core.x, core.y, core.s, core.s, core.s * 0.16); ctx.fill();
    // core micro-cells
    ctx.fillStyle = COL.ink;
    coreCells.forEach(c => {
      ctx.globalAlpha = 0.14 + c.lit * 0.6;
      rr(c.x, c.y, c.w, c.h, Math.min(c.w, c.h) * 0.3); ctx.fill();
    });
    // core frame + breathing inner ring
    ctx.globalAlpha = 0.85; ctx.strokeStyle = COL.ink; ctx.lineWidth = 2;
    rr(core.x, core.y, core.s, core.s, core.s * 0.16); ctx.stroke();
    ctx.globalAlpha = 0.35 + breathe * 0.25; ctx.lineWidth = 1.2;
    const inS = core.s * (0.62 + breathe * 0.06);
    rr(cx - inS / 2, cy - inS / 2, inS, inS, inS * 0.16); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  readColors();
  resize();
  if ('ResizeObserver' in window) {
    let lastW = 0, lastH = 0;
    const ro = new ResizeObserver(() => {
      const r = canvas.getBoundingClientRect();
      if (Math.abs(r.width - lastW) > 2 || Math.abs(r.height - lastH) > 2) { lastW = r.width; lastH = r.height; resize(); }
    });
    ro.observe(canvas);
  } else {
    window.addEventListener('resize', resize);
  }
  window.addEventListener('themechange', () => { readColors(); });
  try { frameBody(performance.now()); } catch (e) {}
  requestAnimationFrame(t => { t0 = t; frame(t); });
}
