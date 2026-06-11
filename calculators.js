/* ═══════════════════════════════════════════════════════════
   VOLTHUB — CALCULATORS (all functional)
   Ohm/Power · Resistor colour code (4/5/6) · Series/Parallel ·
   Reactance & Resonance · GPA (GANO)
═══════════════════════════════════════════════════════════ */

const v = id => (document.getElementById(id) || {}).value;
const fmtNum = x => {
  if (!isFinite(x)) return '∞';
  return (Math.round(x * 1000) / 1000).toLocaleString('tr-TR');
};
const fmtOhm = x => {
  if (!isFinite(x)) return '∞ Ω';
  if (Math.abs(x) >= 1e9) return (x / 1e9).toFixed(2) + ' GΩ';
  if (Math.abs(x) >= 1e6) return (x / 1e6).toFixed(2) + ' MΩ';
  if (Math.abs(x) >= 1e3) return (x / 1e3).toFixed(2) + ' kΩ';
  if (Math.abs(x) < 1 && x !== 0) return (x * 1000).toFixed(1) + ' mΩ';
  return fmtNum(x) + ' Ω';
};

/* ── Ohm's law & Power ── */
function ohmCalc() {
  const V = parseFloat(v('ohmV')), I = parseFloat(v('ohmI')), R = parseFloat(v('ohmR'));
  const res = document.getElementById('ohmRes');
  const have = [!isNaN(V), !isNaN(I), !isNaN(R)].filter(Boolean).length;
  if (have < 2) { res.className = 'result empty'; res.textContent = 'En az iki değer gir, kalanını hesaplayayım.'; return; }
  let vv = V, ii = I, rr = R;
  if (isNaN(vv)) vv = ii * rr;
  else if (isNaN(ii)) ii = rr ? vv / rr : NaN;
  else if (isNaN(rr)) rr = ii ? vv / ii : NaN;
  const P = vv * ii;
  res.className = 'result';
  res.innerHTML =
    `Gerilim <b>${fmtNum(vv)} V</b> &nbsp;·&nbsp; Akım <b>${fmtNum(ii)} A</b><br>` +
    `Direnç <b>${fmtOhm(rr)}</b> &nbsp;·&nbsp; Güç <b>${fmtNum(P)} W</b>`;
}

/* ── Series / Parallel resistance ── */
function srCalc() {
  const raw = (v('srVals') || '').split(/[,\s]+/).map(parseFloat).filter(x => !isNaN(x) && x > 0);
  const res = document.getElementById('srRes');
  if (raw.length < 1) { res.className = 'result empty'; res.textContent = 'Direnç değerlerini virgülle ayırarak gir (Ω).'; return; }
  const series = raw.reduce((a, b) => a + b, 0);
  const parallel = 1 / raw.reduce((a, b) => a + 1 / b, 0);
  res.className = 'result';
  res.innerHTML =
    `<b>${raw.length}</b> direnç algılandı<br>` +
    `Seri eşdeğer <b>${fmtOhm(series)}</b><br>` +
    `Paralel eşdeğer <b>${fmtOhm(parallel)}</b>`;
}

/* ── Reactance & Resonance ── */
function rxCalc() {
  const f = parseFloat(v('rxF')), L = parseFloat(v('rxL')), C = parseFloat(v('rxC'));
  const res = document.getElementById('rxRes');
  const out = [];
  const Lh = L / 1000;       // mH → H
  const Cf = C / 1e6;        // µF → F
  if (!isNaN(f) && !isNaN(L)) out.push(`Endüktif reaktans X<sub>L</sub> = <b>${fmtOhm(2 * Math.PI * f * Lh)}</b>`);
  if (!isNaN(f) && !isNaN(C) && C > 0) out.push(`Kapasitif reaktans X<sub>C</sub> = <b>${fmtOhm(1 / (2 * Math.PI * f * Cf))}</b>`);
  if (!isNaN(L) && !isNaN(C) && L > 0 && C > 0) out.push(`Rezonans frekansı f₀ = <b>${fmtNum(1 / (2 * Math.PI * Math.sqrt(Lh * Cf)))} Hz</b>`);
  if (!out.length) { res.className = 'result empty'; res.textContent = 'Frekans (Hz), bobin (mH) ve/veya kondansatör (µF) gir.'; return; }
  res.className = 'result'; res.innerHTML = out.join('<br>');
}

/* ── GANO (GPA) ── */
const GRADES = [['AA', 4], ['BA', 3.5], ['BB', 3], ['CB', 2.5], ['CC', 2], ['DC', 1.5], ['DD', 1], ['FD', 0.5], ['FF', 0]];
function ganoRowHTML() {
  const opts = '<option value="">Not</option>' + GRADES.map(g => `<option value="${g[1]}">${g[0]}</option>`).join('');
  return `<div class="gano-row">
    <input class="input" placeholder="Ders adı (opsiyonel)">
    <input class="input gano-credit" type="number" min="0" step="0.5" placeholder="Kredi" oninput="ganoCalc()">
    <select class="input select gano-grade" onchange="ganoCalc()">${opts}</select>
    <button class="btn btn-ghost btn-icon btn-sm" onclick="ganoDelRow(this)" title="Sil">✕</button>
  </div>`;
}
function ganoAddRow() { const c = document.getElementById('ganoRows'); if (c) c.insertAdjacentHTML('beforeend', ganoRowHTML()); }
function ganoDelRow(btn) { const r = btn.closest('.gano-row'); if (r) r.remove(); ganoCalc(); }
function ganoReset() {
  const c = document.getElementById('ganoRows'); if (!c) return;
  c.innerHTML = ''; for (let i = 0; i < 3; i++) ganoAddRow();
  const res = document.getElementById('ganoRes'); if (res) { res.className = 'result empty'; res.textContent = 'Ders kredisi ve harf notunu gir.'; }
}
function ganoCalc() {
  let tc = 0, tp = 0;
  document.querySelectorAll('#ganoRows .gano-row').forEach(r => {
    const cr = parseFloat(r.querySelector('.gano-credit').value);
    const gp = parseFloat(r.querySelector('.gano-grade').value);
    if (cr > 0 && !isNaN(gp)) { tc += cr; tp += cr * gp; }
  });
  const res = document.getElementById('ganoRes'); if (!res) return;
  if (tc <= 0) { res.className = 'result empty'; res.textContent = 'Ders kredisi ve harf notunu gir.'; return; }
  const g = tp / tc;
  let standing = g >= 3.5 ? 'Yüksek Onur 🏅' : g >= 3.0 ? 'Onur 🎖️' : g >= 2.0 ? 'Başarılı' : 'Riskli';
  res.className = 'result';
  res.innerHTML = `<div class="gano-out"><span class="gano-big">${g.toFixed(2)}</span><span>GANO · Toplam kredi <b>${tc}</b> · ${standing}</span></div>`;
}

/* ═══════ RESISTOR COLOUR CODE ═══════ */
const RC_COLORS = [
  { n: 'Siyah',   hex: '#1a1a1a', d: 0, m: 1,     tc: 250 },
  { n: 'Kahve',   hex: '#7c4a23', d: 1, m: 10,    tol: 1,  tc: 100 },
  { n: 'Kırmızı', hex: '#c8362d', d: 2, m: 100,   tol: 2,  tc: 50 },
  { n: 'Turuncu', hex: '#e07b2c', d: 3, m: 1000,  tc: 15 },
  { n: 'Sarı',    hex: '#e8c33b', d: 4, m: 10000, tc: 25 },
  { n: 'Yeşil',   hex: '#3a9b5c', d: 5, m: 1e5,   tol: 0.5 },
  { n: 'Mavi',    hex: '#3160c8', d: 6, m: 1e6,   tol: 0.25, tc: 10 },
  { n: 'Mor',     hex: '#7c46c8', d: 7, m: 1e7,   tol: 0.1, tc: 5 },
  { n: 'Gri',     hex: '#8a8a8a', d: 8, m: 1e8,   tol: 0.05 },
  { n: 'Beyaz',   hex: '#f0f0f0', d: 9, m: 1e9 },
  { n: 'Altın',   hex: '#c9a227', m: 0.1,  tol: 5 },
  { n: 'Gümüş',   hex: '#bfc4c9', m: 0.01, tol: 10 },
];
let RC_BANDS = 4;
const rcState = { b0: 1, b1: 0, b2: 0, mult: 2, tol: 10, tc: 6 }; // indices into RC_COLORS

function rcOptions(filter) {
  return RC_COLORS.map((c, i) => {
    if (filter === 'digit' && c.d === undefined) return '';
    if (filter === 'tol' && c.tol === undefined) return '';
    if (filter === 'tc' && c.tc === undefined) return '';
    return `<option value="${i}">${c.n}</option>`;
  }).join('');
}

function initRc() {
  rcRenderControls();
  rcCalc();
}
function rcSetBands(n) {
  RC_BANDS = n;
  document.querySelectorAll('#rcBandSeg .seg-opt').forEach(o => o.classList.toggle('active', +o.dataset.n === n));
  rcRenderControls();
  rcCalc();
}
function rcRenderControls() {
  const wrap = document.getElementById('rcControls');
  if (!wrap) return;
  const row = (label, key, filter, val) =>
    `<div class="rc-band-pick"><label>${label}</label>
      <span class="rc-swatch" id="sw_${key}" style="background:${RC_COLORS[val].hex}"></span>
      <select class="input select" onchange="rcState['${key}']=+this.value;document.getElementById('sw_${key}').style.background=RC_COLORS[this.value].hex;rcCalc()">
        ${RC_COLORS.map((c, i) => {
          if (filter === 'digit' && c.d === undefined) return '';
          if (filter === 'tol' && c.tol === undefined) return '';
          if (filter === 'mult' && c.m === undefined) return '';
          if (filter === 'tc' && c.tc === undefined) return '';
          return `<option value="${i}" ${i === val ? 'selected' : ''}>${c.n}</option>`;
        }).join('')}
      </select></div>`;
  let html = row('1. Rakam', 'b0', 'digit', rcState.b0) + row('2. Rakam', 'b1', 'digit', rcState.b1);
  if (RC_BANDS >= 5) html += row('3. Rakam', 'b2', 'digit', rcState.b2);
  html += row('Çarpan', 'mult', 'mult', rcState.mult) + row('Tolerans', 'tol', 'tol', rcState.tol);
  if (RC_BANDS === 6) html += row('Sıcaklık', 'tc', 'tc', rcState.tc);
  wrap.innerHTML = html;
}

function rcCalc() {
  const c = RC_COLORS;
  let digits = '' + c[rcState.b0].d + c[rcState.b1].d;
  if (RC_BANDS >= 5) digits += c[rcState.b2].d;
  const val = parseInt(digits, 10) * c[rcState.mult].m;
  const tol = c[rcState.tol].tol ?? 20;
  const bandsForSvg = [c[rcState.b0], c[rcState.b1]];
  if (RC_BANDS >= 5) bandsForSvg.push(c[rcState.b2]);
  bandsForSvg.push(c[rcState.mult], c[rcState.tol]);
  if (RC_BANDS === 6) bandsForSvg.push(c[rcState.tc]);
  drawResistor(bandsForSvg);
  const out = document.getElementById('rcBigval');
  out.innerHTML =
    `<div class="rc-ohm">${fmtOhm(val)}</div>` +
    `<div class="rc-range">±${tol}% · ${fmtOhm(val * (1 - tol / 100))} – ${fmtOhm(val * (1 + tol / 100))}` +
    (RC_BANDS === 6 ? ` · ${c[rcState.tc].tc} ppm/K` : '') + `</div>`;
}

function drawResistor(bands) {
  const wrap = document.getElementById('rcSvg');
  if (!wrap) return;
  const W = 300, H = 120;
  const cy = 55;
  const bX = 46, bW = 208, bY = 24, bH = 58;
  const R = bH / 2;
  const cW = 24;
  const aX = bX + cW + 8, aW = bW - (cW + 8) * 2;
  const n = bands.length;
  const bSW = Math.min(13, (aW / (n + 1)) * 0.82);
  const spc = aW / (n + 1);
  const bandRects = bands.map((b, i) => {
    const x = (aX + spc * (i + 1) - bSW / 2).toFixed(1);
    return `<rect x="${x}" y="${bY}" width="${bSW.toFixed(1)}" height="${bH}" fill="${b.hex}" stroke="rgba(0,0,0,.14)" stroke-width=".4"/>`;
  }).join('');
  wrap.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:340px;display:block;margin:0 auto" aria-label="Direnç renk kodu görseli">
  <defs>
    <linearGradient id="rcgB" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#f5edd5"/>
      <stop offset="12%"  stop-color="#e6d098"/>
      <stop offset="48%"  stop-color="#c09848"/>
      <stop offset="82%"  stop-color="#8c6820"/>
      <stop offset="100%" stop-color="#664c10"/>
    </linearGradient>
    <linearGradient id="rcgC" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#f0f0f0"/>
      <stop offset="22%"  stop-color="#d0d0d0"/>
      <stop offset="60%"  stop-color="#9a9a9a"/>
      <stop offset="100%" stop-color="#666"/>
    </linearGradient>
    <linearGradient id="rcgH" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="rgba(255,255,255,.68)"/>
      <stop offset="42%"  stop-color="rgba(255,255,255,.06)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>
    <linearGradient id="rcgD" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="rgba(0,0,0,0)"/>
      <stop offset="58%"  stop-color="rgba(0,0,0,0)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,.3)"/>
    </linearGradient>
    <clipPath id="rcgClip">
      <rect x="${bX}" y="${bY}" width="${bW}" height="${bH}" rx="${R}"/>
    </clipPath>
  </defs>

  <!-- ground shadow -->
  <ellipse cx="${bX + bW / 2}" cy="${bY + bH + 11}" rx="${(bW * .40).toFixed(0)}" ry="6" fill="rgba(0,0,0,.12)"/>

  <!-- lead wires -->
  <line x1="2"           y1="${cy}" x2="${bX + 1}"     y2="${cy}" stroke="#a8b8c8" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="${bX + bW}" y1="${cy}" x2="${W - 2}"       y2="${cy}" stroke="#a8b8c8" stroke-width="3.5" stroke-linecap="round"/>

  <!-- body -->
  <rect x="${bX}" y="${bY}" width="${bW}" height="${bH}" rx="${R}" fill="url(#rcgB)"/>

  <!-- bands + caps, all clipped to pill shape -->
  <g clip-path="url(#rcgClip)">
    ${bandRects}
    <rect x="${bX}"               y="${bY}" width="${cW}"   height="${bH}" fill="url(#rcgC)"/>
    <rect x="${bX + cW - 1.5}"    y="${bY}" width="2"       height="${bH}" fill="rgba(0,0,0,.2)"/>
    <rect x="${bX + bW - cW}"     y="${bY}" width="${cW}"   height="${bH}" fill="url(#rcgC)"/>
    <rect x="${bX + bW - cW}"     y="${bY}" width="2"       height="${bH}" fill="rgba(0,0,0,.2)"/>
  </g>

  <!-- top gloss -->
  <rect x="${bX}" y="${bY}" width="${bW}" height="${bH}" rx="${R}" fill="url(#rcgH)"/>
  <!-- bottom rim shadow -->
  <rect x="${bX}" y="${bY}" width="${bW}" height="${bH}" rx="${R}" fill="url(#rcgD)"/>
  <!-- specular line -->
  <rect x="${bX + R}" y="${bY + 8}" width="${bW - R * 2}" height="3.5" rx="1.8" fill="rgba(255,255,255,.32)"/>
</svg>`;
}

/* ── Voltaj Bölücü ── */
function vdivCalc() {
  const Vin = parseFloat(v('vdVin')), R1 = parseFloat(v('vdR1')), R2 = parseFloat(v('vdR2'));
  const res = document.getElementById('vdRes');
  if (isNaN(Vin) || isNaN(R1) || isNaN(R2) || R1 + R2 === 0) {
    res.className = 'result empty'; res.textContent = 'Vin, R1 ve R2 değerlerini gir.'; return;
  }
  const Vout = Vin * R2 / (R1 + R2);
  res.className = 'result';
  res.innerHTML = `Çıkış <b>${fmtNum(Vout)} V</b> &nbsp;·&nbsp; Bölme oranı <b>${fmtNum(Vout / Vin * 100)}%</b><br>` +
    `Toplam direnç <b>${fmtOhm(R1 + R2)}</b> &nbsp;·&nbsp; Akım <b>${fmtNum(Vin / (R1 + R2) * 1000)} mA</b>`;
}

/* ── LED Direnç ── */
function ledCalc() {
  const Vs = parseFloat(v('ledVs')), Vf = parseFloat(v('ledVf')), If = parseFloat(v('ledIf'));
  const res = document.getElementById('ledRes');
  if (isNaN(Vs) || isNaN(Vf) || isNaN(If) || If <= 0) {
    res.className = 'result empty'; res.textContent = 'Kaynak gerilimi, Vf ve If değerlerini gir.'; return;
  }
  if (Vs <= Vf) { res.className = 'result'; res.innerHTML = '⚠️ Kaynak gerilimi LED Vf değerinden küçük veya eşit!'; return; }
  const R = (Vs - Vf) / (If / 1000);
  const P = (Vs - Vf) * (If / 1000);
  res.className = 'result';
  res.innerHTML = `Seri direnç <b>${fmtOhm(R)}</b> &nbsp;·&nbsp; Güç tüketimi <b>${fmtNum(P * 1000)} mW</b>`;
}

/* ── RC/RL Zaman Sabiti ── */
function tauCalc() {
  const R = parseFloat(v('tauR')), C = parseFloat(v('tauC')), L = parseFloat(v('tauL'));
  const res = document.getElementById('tauRes');
  const fmtT = t => t >= 1 ? fmtNum(t) + ' s' : t >= 0.001 ? fmtNum(t * 1000) + ' ms' : fmtNum(t * 1e6) + ' µs';
  const out = [];
  if (!isNaN(R) && !isNaN(C) && R > 0 && C > 0) {
    const tau = R * C / 1e6;
    out.push(`RC τ = <b>${fmtT(tau)}</b>`);
    out.push(`3τ ≈ %95 → <b>${fmtT(tau * 3)}</b> &nbsp;·&nbsp; 5τ ≈ %99 → <b>${fmtT(tau * 5)}</b>`);
  }
  if (!isNaN(R) && !isNaN(L) && R > 0 && L > 0) {
    const tau = (L / 1000) / R;
    out.push(`RL τ = <b>${fmtT(tau)}</b>`);
    out.push(`3τ ≈ %95 → <b>${fmtT(tau * 3)}</b> &nbsp;·&nbsp; 5τ ≈ %99 → <b>${fmtT(tau * 5)}</b>`);
  }
  if (!out.length) { res.className = 'result empty'; res.textContent = 'R+C veya R+L değerlerini gir.'; return; }
  res.className = 'result'; res.innerHTML = out.join('<br>');
}

/* ── dB Çevirici ── */
let DB_MODE = 'v';
function dbSetMode(m) {
  DB_MODE = m;
  document.querySelectorAll('#dbSeg .seg-opt').forEach(o => o.classList.toggle('active', o.dataset.m === m));
  dbCalc();
}
function dbCalc() {
  const ratio = parseFloat(v('dbRatio')), db = parseFloat(v('dbDb'));
  const res = document.getElementById('dbRes');
  const factor = DB_MODE === 'v' ? 20 : 10;
  if (!isNaN(ratio) && ratio > 0) {
    res.className = 'result';
    res.innerHTML = `<b>${fmtNum(ratio)}</b> → <b>${fmtNum(factor * Math.log10(ratio))} dB</b>`;
  } else if (!isNaN(db)) {
    res.className = 'result';
    res.innerHTML = `<b>${fmtNum(db)} dB</b> → oran <b>${fmtNum(Math.pow(10, db / factor))}</b>`;
  } else {
    res.className = 'result empty'; res.textContent = 'Oran veya dB değeri gir.';
  }
}

/* ── Op-Amp Kazanç ── */
let OP_MODE = 'inv';
function opSetMode(m) {
  OP_MODE = m;
  document.querySelectorAll('#opSeg .seg-opt').forEach(o => o.classList.toggle('active', o.dataset.m === m));
  opampCalc();
}
function opampCalc() {
  const Rf = parseFloat(v('opRf')), R1 = parseFloat(v('opR1'));
  const res = document.getElementById('opRes');
  if (isNaN(Rf) || isNaN(R1) || R1 === 0) {
    res.className = 'result empty'; res.textContent = 'Rf ve R1 değerlerini gir.'; return;
  }
  const Av = OP_MODE === 'inv' ? -(Rf / R1) : 1 + Rf / R1;
  const label = OP_MODE === 'inv' ? 'Çevirici' : 'Çevirmez';
  res.className = 'result';
  res.innerHTML = `${label} Av = <b>${fmtNum(Av)}</b> &nbsp;·&nbsp; <b>${fmtNum(20 * Math.log10(Math.abs(Av)))} dB</b>`;
}

/* ── Transformatör ── */
function trafoCalc() {
  const N1 = parseFloat(v('trN1')), N2 = parseFloat(v('trN2'));
  const V1 = parseFloat(v('trV1')), I1 = parseFloat(v('trI1'));
  const res = document.getElementById('trRes');
  if (isNaN(N1) || isNaN(N2) || N1 === 0 || N2 === 0) {
    res.className = 'result empty'; res.textContent = 'N1 ve N2 sarım sayısını gir.'; return;
  }
  const n = N2 / N1;
  const out = [`Sarım oranı <b>${fmtNum(N1)} : ${fmtNum(N2)}</b> &nbsp;·&nbsp; n = <b>${fmtNum(n)}</b>`];
  if (!isNaN(V1)) out.push(`V₂ = <b>${fmtNum(V1 * n)} V</b>`);
  if (!isNaN(I1)) out.push(`I₂ = <b>${fmtNum(I1 / n)} A</b>`);
  if (!isNaN(V1) && !isNaN(I1)) out.push(`Güç <b>${fmtNum(V1 * I1)} W</b> (ideal)`);
  res.className = 'result'; res.innerHTML = out.join('<br>');
}

/* ── Güç Faktörü ── */
function pfCalc() {
  const P = parseFloat(v('pfP')), Q = parseFloat(v('pfQ')), S = parseFloat(v('pfS')), pf = parseFloat(v('pfPF'));
  const res = document.getElementById('pfRes');
  let pp, qq, ss, cosphi;
  if (!isNaN(S) && !isNaN(pf))          { ss = S; cosphi = pf; pp = S * pf; qq = S * Math.sqrt(Math.max(0, 1 - pf * pf)); }
  else if (!isNaN(P) && !isNaN(pf) && pf > 0) { pp = P; cosphi = pf; ss = P / pf; qq = Math.sqrt(Math.max(0, ss * ss - pp * pp)); }
  else if (!isNaN(P) && !isNaN(Q))      { pp = P; qq = Q; ss = Math.sqrt(P * P + Q * Q); cosphi = ss > 0 ? P / ss : 1; }
  else if (!isNaN(P) && !isNaN(S) && S >= P) { pp = P; ss = S; qq = Math.sqrt(Math.max(0, S * S - P * P)); cosphi = P / S; }
  else if (!isNaN(Q) && !isNaN(S))      { qq = Q; ss = S; pp = Math.sqrt(Math.max(0, S * S - Q * Q)); cosphi = ss > 0 ? pp / ss : 0; }
  else { res.className = 'result empty'; res.textContent = 'En az iki değer gir.'; return; }
  const phi = Math.acos(Math.min(1, Math.max(-1, cosphi))) * 180 / Math.PI;
  res.className = 'result';
  res.innerHTML =
    `Aktif P = <b>${fmtNum(pp)} W</b> &nbsp;·&nbsp; Reaktif Q = <b>${fmtNum(qq)} VAR</b><br>` +
    `Görünür S = <b>${fmtNum(ss)} VA</b> &nbsp;·&nbsp; cos φ = <b>${fmtNum(cosphi)}</b> &nbsp;·&nbsp; φ = <b>${fmtNum(phi)}°</b>`;
}

/* ── Kirchhoff Düğüm Çözücü ── */
function kirchCalc() {
  const V1 = parseFloat(v('kcV1')), V2 = parseFloat(v('kcV2'));
  const R1 = parseFloat(v('kcR1')), R2 = parseFloat(v('kcR2')), R3 = parseFloat(v('kcR3'));
  const res = document.getElementById('kcRes');
  if (isNaN(V1) || isNaN(R1) || isNaN(R2) || isNaN(R3) || R1 <= 0 || R2 <= 0 || R3 <= 0) {
    res.className = 'result empty'; res.textContent = 'V1, R1, R2, R3 zorunlu; V2 opsiyonel (0 V varsayılır).'; return;
  }
  const vv2 = isNaN(V2) ? 0 : V2;
  const g1 = 1 / R1, g2 = 1 / R2, g3 = 1 / R3;
  const Va = (V1 * g1 + vv2 * g2) / (g1 + g2 + g3);
  const I1 = (V1 - Va) / R1, I2 = (vv2 - Va) / R2, I3 = Va / R3;
  res.className = 'result';
  res.innerHTML =
    `Düğüm A = <b>${fmtNum(Va)} V</b><br>` +
    `I₁ = <b>${fmtNum(I1 * 1000)} mA</b> &nbsp;·&nbsp; I₂ = <b>${fmtNum(I2 * 1000)} mA</b> &nbsp;·&nbsp; I₃ = <b>${fmtNum(I3 * 1000)} mA</b>`;
}

function buildTools() {
  document.getElementById('toolGrid').innerHTML = `
    <div class="tool">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--spark-soft);border-color:var(--spark)">⚡</div>
        <div><div class="tool-title">Ohm Yasası & Güç</div><div class="tool-formula">V = I·R &nbsp;·&nbsp; P = V·I</div></div>
      </div>
      <div class="field-row">
        <div class="field"><label class="label">Gerilim (V)</label><input class="input" id="ohmV" type="number" placeholder="Volt" oninput="ohmCalc()"></div>
        <div class="field"><label class="label">Akım (A)</label><input class="input" id="ohmI" type="number" placeholder="Amper" oninput="ohmCalc()"></div>
      </div>
      <div class="field"><label class="label">Direnç (Ω)</label><input class="input" id="ohmR" type="number" placeholder="Ohm" oninput="ohmCalc()"></div>
      <div class="result empty" id="ohmRes">En az iki değer gir, kalanını hesaplayayım.</div>
    </div>

    <div class="tool">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--acc-soft);border-color:var(--acc-line)">🔗</div>
        <div><div class="tool-title">Seri & Paralel Direnç</div><div class="tool-formula">Rs = ΣR &nbsp;·&nbsp; 1/Rp = Σ(1/R)</div></div>
      </div>
      <div class="field"><label class="label">Direnç değerleri (Ω, virgülle ayır)</label><input class="input" id="srVals" placeholder="Ör: 220, 330, 1000" oninput="srCalc()"></div>
      <div class="result empty" id="srRes">Direnç değerlerini virgülle ayırarak gir (Ω).</div>
    </div>

    <div class="tool">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--green-soft);border-color:var(--green)">〰️</div>
        <div><div class="tool-title">Reaktans & Rezonans</div><div class="tool-formula">X<sub>L</sub> = 2πfL &nbsp;·&nbsp; X<sub>C</sub> = 1/2πfC</div></div>
      </div>
      <div class="field"><label class="label">Frekans (Hz)</label><input class="input" id="rxF" type="number" placeholder="Ör: 50" oninput="rxCalc()"></div>
      <div class="field-row">
        <div class="field"><label class="label">Bobin L (mH)</label><input class="input" id="rxL" type="number" placeholder="mH" oninput="rxCalc()"></div>
        <div class="field"><label class="label">Kondansatör C (µF)</label><input class="input" id="rxC" type="number" placeholder="µF" oninput="rxCalc()"></div>
      </div>
      <div class="result empty" id="rxRes">Frekans (Hz), bobin (mH) ve/veya kondansatör (µF) gir.</div>
    </div>

    <div class="tool wide">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--violet-soft);border-color:var(--violet)">🎨</div>
        <div><div class="tool-title">Direnç Renk Kodu Çözücü</div><div class="tool-formula">4 / 5 / 6 bant &nbsp;·&nbsp; gerçek zamanlı</div></div>
      </div>
      <div class="rc-layout">
        <div>
          <div class="rc-stage"><div id="rcSvg"></div></div>
          <div class="rc-bigval" id="rcBigval" style="margin-top:14px"></div>
        </div>
        <div class="rc-controls">
          <div class="seg" id="rcBandSeg">
            <div class="seg-opt" data-n="4" onclick="rcSetBands(4)">4 Bant</div>
            <div class="seg-opt active" data-n="5" onclick="rcSetBands(5)">5 Bant</div>
            <div class="seg-opt" data-n="6" onclick="rcSetBands(6)">6 Bant</div>
          </div>
          <div class="rc-band-row" id="rcControls"></div>
        </div>
      </div>
    </div>

    <div class="tool wide">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--spark-soft);border-color:var(--spark)">🎓</div>
        <div><div class="tool-title">GANO Hesaplayıcı</div><div class="tool-formula">Σ(kredi·katsayı) / Σkredi</div></div>
      </div>
      <div id="ganoRows"></div>
      <div style="display:flex; gap:10px; margin:14px 0">
        <button class="btn btn-soft btn-sm" onclick="ganoAddRow()">+ Ders ekle</button>
        <button class="btn btn-ghost btn-sm" onclick="ganoReset()">Sıfırla</button>
      </div>
      <div class="result empty" id="ganoRes">Ders kredisi ve harf notunu gir.</div>
    </div>

    <div class="tool">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--acc-soft);border-color:var(--acc-line)">÷</div>
        <div><div class="tool-title">Voltaj Bölücü</div><div class="tool-formula">Vout = Vin · R2 / (R1+R2)</div></div>
      </div>
      <div class="field"><label class="label">Giriş gerilimi Vin (V)</label><input class="input" id="vdVin" type="number" placeholder="Volt" oninput="vdivCalc()"></div>
      <div class="field-row">
        <div class="field"><label class="label">R1 — üst (Ω)</label><input class="input" id="vdR1" type="number" placeholder="Ör: 10000" oninput="vdivCalc()"></div>
        <div class="field"><label class="label">R2 — alt (Ω)</label><input class="input" id="vdR2" type="number" placeholder="Ör: 4700" oninput="vdivCalc()"></div>
      </div>
      <div class="result empty" id="vdRes">Vin, R1 ve R2 değerlerini gir.</div>
    </div>

    <div class="tool">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--spark-soft);border-color:var(--spark)">💡</div>
        <div><div class="tool-title">LED Direnç Hesaplayıcı</div><div class="tool-formula">R = (Vs − Vf) / If</div></div>
      </div>
      <div class="field-row">
        <div class="field"><label class="label">Kaynak Vs (V)</label><input class="input" id="ledVs" type="number" placeholder="Ör: 5" oninput="ledCalc()"></div>
        <div class="field"><label class="label">LED Vf (V)</label><input class="input" id="ledVf" type="number" placeholder="Ör: 2.2" oninput="ledCalc()"></div>
      </div>
      <div class="field"><label class="label">LED akımı If (mA)</label><input class="input" id="ledIf" type="number" placeholder="Ör: 20" oninput="ledCalc()"></div>
      <div class="result empty" id="ledRes">Kaynak gerilimi, Vf ve If değerlerini gir.</div>
    </div>

    <div class="tool">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--green-soft);border-color:var(--green)">τ</div>
        <div><div class="tool-title">RC / RL Zaman Sabiti</div><div class="tool-formula">τ = R·C &nbsp;·&nbsp; τ = L/R</div></div>
      </div>
      <div class="field"><label class="label">Direnç R (Ω)</label><input class="input" id="tauR" type="number" placeholder="Ohm" oninput="tauCalc()"></div>
      <div class="field-row">
        <div class="field"><label class="label">Kondansatör C (µF)</label><input class="input" id="tauC" type="number" placeholder="µF" oninput="tauCalc()"></div>
        <div class="field"><label class="label">Bobin L (mH)</label><input class="input" id="tauL" type="number" placeholder="mH" oninput="tauCalc()"></div>
      </div>
      <div class="result empty" id="tauRes">R+C veya R+L değerlerini gir.</div>
    </div>

    <div class="tool">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--violet-soft);border-color:var(--violet)">dB</div>
        <div><div class="tool-title">dB Çevirici</div><div class="tool-formula">20·log(V₂/V₁) &nbsp;·&nbsp; 10·log(P₂/P₁)</div></div>
      </div>
      <div class="seg" id="dbSeg" style="margin-bottom:14px">
        <div class="seg-opt active" data-m="v" onclick="dbSetMode('v')">Gerilim ×20</div>
        <div class="seg-opt" data-m="p" onclick="dbSetMode('p')">Güç ×10</div>
      </div>
      <div class="field-row">
        <div class="field"><label class="label">Oran (lineer)</label><input class="input" id="dbRatio" type="number" step="any" placeholder="Ör: 2" oninput="document.getElementById('dbDb').value='';dbCalc()"></div>
        <div class="field"><label class="label">Değer (dB)</label><input class="input" id="dbDb" type="number" step="any" placeholder="Ör: 6" oninput="document.getElementById('dbRatio').value='';dbCalc()"></div>
      </div>
      <div class="result empty" id="dbRes">Oran veya dB değeri gir.</div>
    </div>

    <div class="tool">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--acc-soft);border-color:var(--acc-line)">▲</div>
        <div><div class="tool-title">Op-Amp Kazanç</div><div class="tool-formula">Av = −Rf/R1 &nbsp;·&nbsp; 1+Rf/R1</div></div>
      </div>
      <div class="seg" id="opSeg" style="margin-bottom:14px">
        <div class="seg-opt active" data-m="inv" onclick="opSetMode('inv')">Çevirici (−)</div>
        <div class="seg-opt" data-m="noninv" onclick="opSetMode('noninv')">Çevirmez (+)</div>
      </div>
      <div class="field-row">
        <div class="field"><label class="label">R1 — giriş (Ω)</label><input class="input" id="opR1" type="number" placeholder="Ör: 1000" oninput="opampCalc()"></div>
        <div class="field"><label class="label">Rf — geri besleme (Ω)</label><input class="input" id="opRf" type="number" placeholder="Ör: 10000" oninput="opampCalc()"></div>
      </div>
      <div class="result empty" id="opRes">Rf ve R1 değerlerini gir.</div>
    </div>

    <div class="tool">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--green-soft);border-color:var(--green)">🔌</div>
        <div><div class="tool-title">Transformatör Hesaplayıcı</div><div class="tool-formula">V₂/V₁ = N₂/N₁ &nbsp;·&nbsp; I₁·N₁ = I₂·N₂</div></div>
      </div>
      <div class="field-row">
        <div class="field"><label class="label">N1 — birincil sarım</label><input class="input" id="trN1" type="number" placeholder="Ör: 200" oninput="trafoCalc()"></div>
        <div class="field"><label class="label">N2 — ikincil sarım</label><input class="input" id="trN2" type="number" placeholder="Ör: 40" oninput="trafoCalc()"></div>
      </div>
      <div class="field-row">
        <div class="field"><label class="label">V1 (V) opsiyonel</label><input class="input" id="trV1" type="number" placeholder="Birincil gerilim" oninput="trafoCalc()"></div>
        <div class="field"><label class="label">I1 (A) opsiyonel</label><input class="input" id="trI1" type="number" placeholder="Birincil akım" oninput="trafoCalc()"></div>
      </div>
      <div class="result empty" id="trRes">N1 ve N2 sarım sayısını gir.</div>
    </div>

    <div class="tool wide">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--red-soft);border-color:var(--red)">φ</div>
        <div><div class="tool-title">Güç Faktörü & Güç Üçgeni</div><div class="tool-formula">S² = P² + Q² &nbsp;·&nbsp; cos φ = P/S</div></div>
      </div>
      <div class="field-row">
        <div class="field"><label class="label">Aktif güç P (W)</label><input class="input" id="pfP" type="number" placeholder="Watt" oninput="pfCalc()"></div>
        <div class="field"><label class="label">Reaktif güç Q (VAR)</label><input class="input" id="pfQ" type="number" placeholder="VAR" oninput="pfCalc()"></div>
        <div class="field"><label class="label">Görünür güç S (VA)</label><input class="input" id="pfS" type="number" placeholder="VA" oninput="pfCalc()"></div>
        <div class="field"><label class="label">Güç faktörü cos φ</label><input class="input" id="pfPF" type="number" step="0.01" min="0" max="1" placeholder="0 – 1" oninput="pfCalc()"></div>
      </div>
      <div class="result empty" id="pfRes">En az iki değer gir.</div>
    </div>

    <div class="tool wide">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--spark-soft);border-color:var(--spark)">KCL</div>
        <div><div class="tool-title">Kirchhoff Düğüm Çözücü</div><div class="tool-formula">V1─R1─A─R3─GND &nbsp;·&nbsp; V2─R2─A</div></div>
      </div>
      <div class="field-row">
        <div class="field"><label class="label">V1 (V)</label><input class="input" id="kcV1" type="number" placeholder="Kaynak 1" oninput="kirchCalc()"></div>
        <div class="field"><label class="label">V2 (V) opsiyonel</label><input class="input" id="kcV2" type="number" placeholder="Kaynak 2 (0 V)" oninput="kirchCalc()"></div>
      </div>
      <div class="field-row">
        <div class="field"><label class="label">R1 — V1 kolunda (Ω)</label><input class="input" id="kcR1" type="number" placeholder="Ör: 1000" oninput="kirchCalc()"></div>
        <div class="field"><label class="label">R2 — V2 kolunda (Ω)</label><input class="input" id="kcR2" type="number" placeholder="Ör: 2200" oninput="kirchCalc()"></div>
        <div class="field"><label class="label">R3 — GND'ye (Ω)</label><input class="input" id="kcR3" type="number" placeholder="Ör: 3300" oninput="kirchCalc()"></div>
      </div>
      <div class="result empty" id="kcRes">V1, R1, R2, R3 zorunlu; V2 opsiyonel.</div>
    </div>`;
  RC_BANDS = 5;
  initRc();
  ganoReset();
}
