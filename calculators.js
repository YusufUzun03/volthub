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
    </div>`;
  RC_BANDS = 5;
  initRc();
  ganoReset();
}
