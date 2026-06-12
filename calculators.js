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

/* ═══════════ SVG SCHEMATIC HELPERS ═══════════ */
const SC = {
  DEFS:`<defs>
    <filter id="scSh" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-color="rgba(0,0,0,0.16)"/>
    </filter>
    <marker id="scArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,1.5 L8.5,5 L0,8.5 Z" fill="var(--acc)"/>
    </marker>
    <marker id="scArrG" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,1.5 L8.5,5 L0,8.5 Z" fill="var(--green)"/>
    </marker>
  </defs>`,
  w:  (x1,y1,x2,y2,c='var(--ink)')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>`,
  wa: (x1,y1,x2,y2,c='var(--acc)')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="1.8" stroke-linecap="round" marker-end="url(#scArr)"/>`,
  wg: (x1,y1,x2,y2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--green)" stroke-width="1.8" stroke-linecap="round" marker-end="url(#scArrG)"/>`,
  res:(cx,cy,lbl='',sub='',w=44,h=22)=>{const[rx,ry]=[cx-w/2,cy-h/2];return`<rect x="${rx}" y="${ry}" width="${w}" height="${h}" rx="4" fill="var(--surface)" stroke="var(--acc)" stroke-width="1.8" filter="url(#scSh)"/><rect x="${rx+3}" y="${ry+2}" width="${w-6}" height="5" rx="2" fill="rgba(255,255,255,.26)"/><text x="${cx}" y="${sub?cy-1:cy+4.5}" text-anchor="middle" font-size="9.5" font-weight="700" fill="var(--ink-2)" font-family="var(--sans)">${lbl}</text>${sub?`<text x="${cx}" y="${cy+10}" text-anchor="middle" font-size="8.5" fill="var(--acc)" font-family="var(--mono)">${sub}</text>`:''}`},
  cap:(cx,cy,lbl='',sub='')=>`<line x1="${cx}" y1="${cy-18}" x2="${cx}" y2="${cy-7}" stroke="var(--ink)" stroke-width="1.8"/><rect x="${cx-14}" y="${cy-7}" width="28" height="4" rx="2" fill="var(--acc)"/><rect x="${cx-14}" y="${cy+3}" width="28" height="4" rx="2" fill="var(--acc)"/><line x1="${cx}" y1="${cy+7}" x2="${cx}" y2="${cy+18}" stroke="var(--ink)" stroke-width="1.8"/>${lbl?`<text x="${cx+20}" y="${cy+1}" text-anchor="start" font-size="9.5" font-weight="700" fill="var(--ink-2)" font-family="var(--sans)">${lbl}</text>`:''} ${sub?`<text x="${cx+20}" y="${cy+13}" text-anchor="start" font-size="8.5" fill="var(--acc)" font-family="var(--mono)">${sub}</text>`:''}`,
  ind:(cx,cy,lbl='',sub='')=>{let a='';for(let i=0;i<4;i++)a+=`<path d="M${cx-18+i*9},${cy} a4.5,5.5 0 0,1 9,0" fill="none" stroke="var(--acc)" stroke-width="2.2" stroke-linecap="round"/>`;return`<line x1="${cx-22}" y1="${cy}" x2="${cx-18}" y2="${cy}" stroke="var(--ink)" stroke-width="1.8"/>${a}<line x1="${cx+18}" y1="${cy}" x2="${cx+22}" y2="${cy}" stroke="var(--ink)" stroke-width="1.8"/>${lbl?`<text x="${cx}" y="${cy-18}" text-anchor="middle" font-size="9.5" font-weight="700" fill="var(--ink-2)" font-family="var(--sans)">${lbl}</text>`:''} ${sub?`<text x="${cx}" y="${cy+20}" text-anchor="middle" font-size="8.5" fill="var(--acc)" font-family="var(--mono)">${sub}</text>`:''}`;},
  vs: (cx,cy,lbl='')=>`<circle cx="${cx}" cy="${cy}" r="18" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.8" filter="url(#scSh)"/><circle cx="${cx}" cy="${cy}" r="13" fill="none" stroke="var(--line-2)" stroke-width="0.8"/><text x="${cx}" y="${cy-2}" text-anchor="middle" font-size="13" fill="var(--green)" font-weight="700">+</text><text x="${cx}" y="${cy+11}" text-anchor="middle" font-size="13" fill="var(--red)" font-weight="700">−</text>${lbl?`<text x="${cx}" y="${cy-26}" text-anchor="middle" font-size="10.5" font-weight="700" fill="var(--acc)" font-family="var(--sans)">${lbl}</text>`:''}`,
  gnd:(x,y)=>`<line x1="${x-15}" y1="${y}" x2="${x+15}" y2="${y}" stroke="var(--ink)" stroke-width="2.2"/><line x1="${x-9}" y1="${y+5}" x2="${x+9}" y2="${y+5}" stroke="var(--ink)" stroke-width="1.8"/><line x1="${x-4}" y1="${y+10}" x2="${x+4}" y2="${y+10}" stroke="var(--ink)" stroke-width="1.4"/>`,
  dot:(x,y,c='var(--acc)')=>`<circle cx="${x}" cy="${y}" r="4.5" fill="${c}"/><circle cx="${x}" cy="${y}" r="1.8" fill="rgba(255,255,255,.45)"/>`,
  txt:(x,y,t,c='var(--ink)',a='middle',s=11)=>`<text x="${x}" y="${y}" text-anchor="${a}" font-size="${s}" fill="${c}" font-family="var(--sans)">${t}</text>`,
  mono:(x,y,t,c='var(--ink-3)',a='middle',s=10)=>`<text x="${x}" y="${y}" text-anchor="${a}" font-size="${s}" fill="${c}" font-family="var(--mono)">${t}</text>`,
  badge:(x,y,t,c='var(--acc)',bg='var(--acc-soft)',a='middle')=>{const pw=t.length*6.2+14;const bx=a==='start'?x:a==='end'?x-pw:x-pw/2;return`<rect x="${bx}" y="${y-13}" width="${pw}" height="17" rx="8.5" fill="${bg}"/><text x="${bx+pw/2}" y="${y}" text-anchor="middle" font-size="9.5" font-weight="700" fill="${c}" font-family="var(--mono)">${t}</text>`},
};
function scRender(id,W,H,body){const el=document.getElementById(id);if(el)el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px;display:block;margin:0 auto">${SC.DEFS}${body}</svg>`;}

/* ── Draw: Voltaj Bölücü ── */
function drawVdiv(){
  const Vin=parseFloat(v('vdVin')),R1=parseFloat(v('vdR1')),R2=parseFloat(v('vdR2'));
  const Vo=(!isNaN(Vin)&&!isNaN(R1)&&!isNaN(R2)&&R1+R2>0)?Vin*R2/(R1+R2):null;
  const live=Vo!==null;
  const cx=80,W=210,H=198;
  scRender('vdSvg',W,H,`
    ${live?SC.badge(cx,10,fmtNum(Vin)+' V','var(--acc)','var(--acc-soft)'):SC.txt(cx,12,'Vin','var(--ink-3)')}
    ${SC.wa(cx,15,cx,42)}
    ${SC.res(cx,55,'R1',!isNaN(R1)?fmtOhm(R1):'')}
    ${SC.wa(cx,67,cx,88)}
    ${SC.dot(cx,90)}
    ${live?SC.wg(cx,90,cx+55,90):SC.w(cx,90,cx+55,90,'var(--line-2)')}
    ${live?SC.badge(cx+60,94,fmtNum(Vo)+' V','var(--green)','var(--green-soft)','start'):SC.txt(cx+60,94,'Vout','var(--ink-3)','start')}
    ${SC.wa(cx,91,cx,110)}
    ${SC.res(cx,122,'R2',!isNaN(R2)?fmtOhm(R2):'')}
    ${SC.w(cx,134,cx,160)}
    ${SC.gnd(cx,162)}
  `);
}

/* ── Draw: LED ── */
function drawLed(){
  const Vs=parseFloat(v('ledVs')),Vf=parseFloat(v('ledVf')),If=parseFloat(v('ledIf'));
  const R=(!isNaN(Vs)&&!isNaN(Vf)&&!isNaN(If)&&If>0&&Vs>Vf)?(Vs-Vf)/(If/1000):null;
  const live=R!==null;
  const cx=84,lY=170,W=215,H=258;
  scRender('ledSvg',W,H,`
    ${live?SC.badge(cx,8,fmtNum(Vs)+' V','var(--acc)','var(--acc-soft)'):SC.txt(cx,10,'Vs','var(--ink-3)')}
    ${SC.vs(cx,34,'')}
    ${SC.wa(cx,52,cx,68)}
    ${SC.res(cx,80,'R',live?fmtOhm(R):'?')}
    ${!isNaN(If)?SC.badge(cx+28,78,fmtNum(If)+' mA','var(--green)','var(--green-soft)','start'):''}
    ${SC.wa(cx,92,cx,lY-16,'var(--spark)')}
    <polygon points="${cx-14},${lY-16} ${cx+14},${lY-16} ${cx},${lY+10}" fill="var(--spark-soft)" stroke="var(--spark)" stroke-width="2"/>
    <line x1="${cx-16}" y1="${lY+10}" x2="${cx+16}" y2="${lY+10}" stroke="var(--spark)" stroke-width="3"/>
    <line x1="${cx+18}" y1="${lY-6}" x2="${cx+30}" y2="${lY-22}" stroke="var(--spark)" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="${cx+24}" y1="${lY+1}" x2="${cx+36}" y2="${lY-15}" stroke="var(--spark)" stroke-width="1.5" stroke-linecap="round"/>
    ${!isNaN(Vf)?SC.badge(cx-28,lY,'Vf='+fmtNum(Vf)+'V','var(--spark-deep)','var(--spark-soft)','end'):''}
    ${SC.w(cx,lY+10,cx,222)}
    ${SC.gnd(cx,224)}
  `);
}

/* ── Draw: RC/RL ── */
function drawTau(){
  const R=parseFloat(v('tauR')),C=parseFloat(v('tauC')),L=parseFloat(v('tauL'));
  const hasC=!isNaN(C)&&C>0,hasL=!isNaN(L)&&L>0,showL=hasL&&!hasC;
  const fmtT=t=>t>=1?fmtNum(t)+' s':t>=0.001?fmtNum(t*1000)+' ms':fmtNum(t*1e6)+' µs';
  const tau=showL&&!isNaN(R)&&R>0?(L/1000)/R:(!isNaN(R)&&R>0&&hasC?R*C/1e6:null);
  const W=268,H=118,cy=68;
  const comp=showL?SC.ind(180,cy,'L',hasL?fmtNum(L)+' mH':''):SC.cap(180,cy,'C',hasC?fmtNum(C)+' µF':'');
  scRender('tauSvg',W,H,`
    ${tau?SC.badge(W/2,14,'τ = '+fmtT(tau),'var(--acc)','var(--acc-soft)'):SC.txt(W/2,14,'τ = R·'+(showL?'L/R':'C'),'var(--ink-3)')}
    ${SC.vs(24,cy)}
    ${SC.w(24,cy-18,24,24)}${SC.w(24,24,242,24)}${SC.w(242,24,242,cy)}
    ${SC.w(242,cy,202,cy)}
    ${comp}
    ${SC.w(158,cy,116,cy)}
    ${SC.res(94,cy,'R',!isNaN(R)?fmtOhm(R):'')}
    ${SC.w(72,cy,42,cy)}
    ${SC.w(24,cy+18,24,H-8)}${SC.w(24,H-8,242,H-8)}
    ${SC.gnd(133,H-6)}
  `);
}

/* ── Draw: dB ── */
function drawDb(){
  const ratio=parseFloat(v('dbRatio')),db=parseFloat(v('dbDb'));
  const factor=DB_MODE==='v'?20:10;
  const hasRatio=!isNaN(ratio)&&ratio>0,hasDb=!isNaN(db);
  const inVal=hasRatio?fmtNum(ratio):hasDb?fmtNum(Math.pow(10,db/factor)):'A';
  const outVal=hasRatio?fmtNum(factor*Math.log10(ratio))+' dB':hasDb?fmtNum(db)+' dB':'B dB';
  const live=hasRatio||hasDb;
  const W=234,H=108,bX=82,bY=30,bW=70,bH=48;
  scRender('dbSvg',W,H,`
    ${live?SC.badge(34,H/2+4,inVal,'var(--ink-2)','var(--surface)'):SC.txt(34,H/2+4,'A','var(--ink-3)')}
    ${SC.wa(58,H/2,bX,H/2)}
    <rect x="${bX}" y="${bY}" width="${bW}" height="${bH}" rx="8" fill="var(--acc-soft)" stroke="var(--acc)" stroke-width="1.8" filter="url(#scSh)"/>
    <rect x="${bX+4}" y="${bY+3}" width="${bW-8}" height="8" rx="4" fill="rgba(255,255,255,.20)"/>
    ${SC.txt(bX+bW/2,bY+bH/2-3,DB_MODE==='v'?'20·log':'10·log','var(--acc)','middle',9.5)}
    ${SC.txt(bX+bW/2,bY+bH/2+10,'dB Blok','var(--ink-3)','middle',8)}
    ${SC.wa(bX+bW,H/2,W-58,H/2)}
    ${live?SC.badge(W-32,H/2+4,outVal,'var(--green)','var(--green-soft)'):SC.txt(W-32,H/2+4,'B dB','var(--ink-3)')}
  `);
}

/* ── Draw: Op-Amp ── */
function drawOpamp(){
  const Rf=parseFloat(v('opRf')),R1=parseFloat(v('opR1'));
  const Av=(!isNaN(Rf)&&!isNaN(R1)&&R1>0)?(OP_MODE==='inv'?-(Rf/R1):1+Rf/R1):null;
  const W=292,H=190,ox=148,oy=95;
  const inv=OP_MODE==='inv';
  const outX=ox+52,rfTopY=28,jX=116;
  scRender('opSvg',W,H,`
    <!-- Op-amp body -->
    <polygon points="${ox},${oy-36} ${ox},${oy+36} ${ox+52},${oy}" fill="var(--acc-soft)" stroke="var(--acc)" stroke-width="2.2" filter="url(#scSh)"/>
    <rect x="${ox+2}" y="${oy-36}" width="18" height="72" rx="3" fill="rgba(255,255,255,.10)"/>
    <text x="${ox+12}" y="${oy-10}" font-size="12" fill="var(--acc-ink)" font-weight="700">−</text>
    <text x="${ox+12}" y="${oy+19}" font-size="12" fill="var(--acc-ink)" font-weight="700">+</text>
    ${Av!==null?SC.badge(ox+26,oy+5,'Av='+fmtNum(Av),'var(--acc)','var(--acc-soft-2)'):SC.txt(ox+26,oy+4,'Av','var(--ink-3)')}

    ${inv?`
    <!-- Inverting: Vin─R1─junction─(-)pin; Rf feedback from junction over top to output -->
    ${SC.txt(14,oy-14,'Vin','var(--ink-2)','start',10)}
    ${SC.w(36,oy-18,58,oy-18)}
    ${SC.res(80,oy-18,'R1',!isNaN(R1)?fmtOhm(R1):'')}
    ${SC.w(102,oy-18,jX,oy-18)}
    ${SC.dot(jX,oy-18)}
    ${SC.w(jX,oy-18,ox,oy-18)}
    ${SC.w(jX,oy-18,jX,rfTopY)}
    ${SC.res(178,rfTopY,'Rf',!isNaN(Rf)?fmtOhm(Rf):'')}
    ${SC.w(jX,rfTopY,156,rfTopY)}
    ${SC.w(200,rfTopY,outX+22,rfTopY)}
    ${SC.w(outX+22,rfTopY,outX+22,oy)}
    ${SC.dot(outX+22,oy)}
    ${SC.w(ox,oy+18,ox-20,oy+18)}${SC.gnd(ox-24,oy+20)}
    `:`
    <!-- Non-inverting: Vin─(+)pin; R1 from (-)─GND top; Rf from output back to (-) -->
    ${SC.txt(14,oy+22,'Vin','var(--ink-2)','start',10)}
    ${SC.w(36,oy+18,ox,oy+18)}
    ${SC.w(ox,oy-18,ox-22,oy-18)}
    ${SC.w(ox-22,oy-18,ox-22,rfTopY+11)}
    ${SC.res(ox-22,rfTopY,'R1',!isNaN(R1)?fmtOhm(R1):'',42,22)}
    ${SC.w(ox-22,rfTopY-11,ox-22,16)}${SC.gnd(ox-22,18)}
    ${SC.dot(ox-22,oy-18)}
    ${SC.w(ox-22,oy-18,ox-22,rfTopY-11)}
    ${SC.w(outX+22,oy,outX+22,rfTopY-11)}
    ${SC.res(ox+30,rfTopY-11,'Rf',!isNaN(Rf)?fmtOhm(Rf):'',42,22)}
    ${SC.w(ox+8,rfTopY-11,ox-22,rfTopY-11)}
    ${SC.dot(ox-22,rfTopY-11)}
    `}
    <!-- Output -->
    ${SC.wa(outX,oy,outX+22,oy,'var(--green)')}
    ${SC.dot(outX+22,oy)}
    ${SC.w(outX+22,oy,W-10,oy,'var(--green)')}
    ${SC.txt(W-8,oy+4,'Vout','var(--green)','end',10)}
  `);
}

/* ── Draw: Transformatör ── */
function drawTrafo(){
  const N1=parseFloat(v('trN1')),N2=parseFloat(v('trN2'));
  const V1=parseFloat(v('trV1')),I1=parseFloat(v('trI1'));
  const n=(!isNaN(N1)&&!isNaN(N2)&&N1>0)?N2/N1:null;
  const V2=n!==null&&!isNaN(V1)?V1*n:null;
  const W=268,H=155,cy=72,cX=120,cW=28;
  function coil(cx,sY,nA,dir){
    let s=`<line x1="${cx}" y1="${sY-4}" x2="${cx}" y2="${sY}" stroke="var(--ink)" stroke-width="1.8"/>`;
    for(let i=0;i<nA;i++){const y=sY+i*13;s+=`<path d="M${cx},${y} a6.5,6.5 0 0,${dir===1?0:1} 0,13" fill="none" stroke="var(--acc)" stroke-width="2.2" stroke-linecap="round"/>`;}
    s+=`<line x1="${cx}" y1="${sY+nA*13}" x2="${cx}" y2="${sY+nA*13+4}" stroke="var(--ink)" stroke-width="1.8"/>`;
    return s;
  }
  const nA=4,sY=cy-26,eY=sY+nA*13;
  scRender('trSvg',W,H,`
    <line x1="${cX}" y1="${sY-8}" x2="${cX}" y2="${eY+8}" stroke="var(--ink)" stroke-width="3.2"/>
    <line x1="${cX+cW}" y1="${sY-8}" x2="${cX+cW}" y2="${eY+8}" stroke="var(--ink)" stroke-width="3.2"/>
    ${coil(cX-2,sY,nA,-1)}
    ${coil(cX+cW+2,sY,nA,1)}
    ${SC.w(cX-2,sY-4,22,sY-4)}
    ${SC.w(cX-2,eY+4,22,eY+4)}
    ${SC.w(cX+cW+2,sY-4,W-22,sY-4)}
    ${SC.w(cX+cW+2,eY+4,W-22,eY+4)}
    ${SC.txt(22,sY-14,!isNaN(N1)?'N1='+fmtNum(N1):'N1','var(--ink)','start',10)}
    ${!isNaN(V1)?SC.badge(22,eY+18,fmtNum(V1)+' V','var(--acc)','var(--acc-soft)','start'):SC.txt(22,eY+18,'V1','var(--ink-3)','start',10)}
    ${SC.txt(W-22,sY-14,!isNaN(N2)?'N2='+fmtNum(N2):'N2','var(--ink)','end',10)}
    ${V2!==null?SC.badge(W-22,eY+18,fmtNum(V2)+' V','var(--green)','var(--green-soft)','end'):SC.txt(W-22,eY+18,'V2','var(--ink-3)','end',10)}
    ${n!==null?SC.badge(W/2,H-8,'n = '+fmtNum(n),'var(--ink-3)','var(--surface)'):SC.txt(W/2,H-8,'n = N2/N1','var(--ink-3)')}
  `);
}

/* ── Draw: Güç Faktörü ── */
function drawPf(){
  const P=parseFloat(v('pfP')),Q=parseFloat(v('pfQ')),S=parseFloat(v('pfS')),pf=parseFloat(v('pfPF'));
  let pp,qq,ss,cosphi;
  if(!isNaN(S)&&!isNaN(pf)){ss=S;cosphi=pf;pp=S*pf;qq=S*Math.sqrt(Math.max(0,1-pf*pf));}
  else if(!isNaN(P)&&!isNaN(pf)&&pf>0){pp=P;cosphi=pf;ss=P/pf;qq=Math.sqrt(Math.max(0,ss*ss-pp*pp));}
  else if(!isNaN(P)&&!isNaN(Q)){pp=P;qq=Q;ss=Math.sqrt(P*P+Q*Q);cosphi=ss>0?P/ss:1;}
  else if(!isNaN(P)&&!isNaN(S)&&S>=P){pp=P;ss=S;qq=Math.sqrt(Math.max(0,S*S-P*P));cosphi=P/S;}
  else if(!isNaN(Q)&&!isNaN(S)){qq=Q;ss=S;pp=Math.sqrt(Math.max(0,S*S-Q*Q));cosphi=ss>0?pp/ss:0;}
  const W=232,H=168,ox=34,oy=134;
  const scale=pp&&ss?Math.min(130/ss,95/Math.max(qq,1)):60;
  const px=Math.min((pp||60)*scale,155),qy=Math.min((qq||40)*scale,108);
  const phi=cosphi?Math.acos(Math.min(1,Math.max(-1,cosphi)))*180/Math.PI:null;
  const ex=ox+px,ey=oy-qy;
  scRender('pfSvg',W,H,`
    ${pp&&qq?`<polygon points="${ox},${oy} ${ex},${oy} ${ex},${ey}" fill="var(--acc-soft)" opacity="0.65"/>`:''}
    <!-- P axis -->
    ${SC.w(ox,oy,ex,oy,'var(--acc)')}
    <polygon points="${ex+2},${oy-4} ${ex+10},${oy} ${ex+2},${oy+4}" fill="var(--acc)"/>
    ${SC.txt(ox+px/2,oy+15,'P (W)','var(--acc)','middle',10)}
    ${pp?SC.badge(ox+px/2,oy+28,fmtNum(pp)+' W','var(--acc)','var(--acc-soft)'):SC.txt(ox+px/2,oy+28,'P','var(--ink-3)')}
    <!-- Q axis -->
    ${SC.w(ox,oy,ox,ey,'var(--red)')}
    <polygon points="${ox-4},${ey-2} ${ox},${ey-10} ${ox+4},${ey-2}" fill="var(--red)"/>
    ${SC.txt(ox-14,oy-qy/2,'Q','var(--red)','middle',10)}
    ${qq?SC.badge(ox-14,oy-qy/2+14,fmtNum(qq),'var(--red)','var(--red-soft)'):SC.txt(ox-14,oy-qy/2+14,'Q','var(--ink-3)')}
    <!-- S hypotenuse -->
    ${SC.w(ox,oy,ex,ey,'var(--green)')}
    ${SC.txt(ox+px/2+14,oy-qy/2-8,'S','var(--green)','middle',10)}
    ${ss?SC.badge(ox+px/2+14,oy-qy/2+6,fmtNum(ss)+' VA','var(--green)','var(--green-soft)'):SC.txt(ox+px/2+14,oy-qy/2+6,'S','var(--ink-3)')}
    <!-- phi arc -->
    ${phi!==null?`<path d="M${ox+30},${oy} A30,30 0 0,0 ${ox+30*Math.cos(phi*Math.PI/180)},${oy-30*Math.sin(phi*Math.PI/180)}" fill="none" stroke="var(--spark)" stroke-width="1.5" stroke-dasharray="4,2"/>
    ${SC.txt(ox+44,oy-14,'φ='+fmtNum(phi)+'°','var(--spark)','start',9)}`:''}
    <!-- right angle -->
    <polyline points="${ox+12},${oy} ${ox+12},${oy-12} ${ox},${oy-12}" fill="none" stroke="var(--line-2)" stroke-width="1.2"/>
  `);
}

/* ── Draw: Kirchhoff ── */
function drawKirch(){
  const V1=parseFloat(v('kcV1')),V2=parseFloat(v('kcV2'));
  const R1=parseFloat(v('kcR1')),R2=parseFloat(v('kcR2')),R3=parseFloat(v('kcR3'));
  const vv2=isNaN(V2)?0:V2;
  const g1=R1>0?1/R1:0,g2=R2>0?1/R2:0,g3=R3>0?1/R3:0;
  const Va=(g1+g2+g3>0)?(V1*g1+vv2*g2)/(g1+g2+g3):null;
  // Symmetric layout: V1─R1─NodeA─R2─V2  (horizontal); R3 down to GND rail
  const W=288,H=158,naX=144,naY=54,gndY=134;
  const v1X=28,vr=17,v2X=260,r1cX=84,r2cX=204;
  scRender('kcSvg',W,H,`
    <!-- V1 source: horizontal circle, + on right side -->
    <circle cx="${v1X}" cy="${naY}" r="${vr}" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.8" filter="url(#scSh)"/>
    <circle cx="${v1X}" cy="${naY}" r="12" fill="none" stroke="var(--line-2)" stroke-width="0.8"/>
    <text x="${v1X+4}" y="${naY+4}" text-anchor="start" font-size="11" fill="var(--green)" font-weight="700">+</text>
    <text x="${v1X-4}" y="${naY+4}" text-anchor="end" font-size="11" fill="var(--red)" font-weight="700">−</text>
    ${!isNaN(V1)?SC.badge(v1X,naY-vr-10,fmtNum(V1)+' V','var(--acc)','var(--acc-soft)'):SC.txt(v1X,naY-vr-8,'V1','var(--ink-3)')}
    ${SC.txt(v1X,naY+vr+12,'V1','var(--ink-3)')}
    <!-- V1(+) → R1 → Node A -->
    ${SC.w(v1X+vr,naY,r1cX-22,naY)}
    ${SC.res(r1cX,naY,'R1',!isNaN(R1)?fmtOhm(R1):'')}
    ${SC.w(r1cX+22,naY,naX,naY)}
    <!-- V1(−) → left GND bus -->
    ${SC.w(v1X-vr,naY,10,naY)}${SC.w(10,naY,10,gndY)}${SC.w(10,gndY,naX,gndY)}

    <!-- Node A -->
    ${SC.dot(naX,naY,'var(--acc)')}
    ${Va!==null?SC.badge(naX,naY-14,fmtNum(Va)+' V','var(--green)','var(--green-soft)'):SC.txt(naX,naY-14,'Va','var(--ink-3)')}
    ${SC.txt(naX+6,naY+12,'A','var(--ink-3)','start',9)}

    <!-- R3 → GND -->
    ${SC.wa(naX,naY+5,naX,naY+30,'var(--acc)')}
    ${SC.res(naX,naY+44,'R3',!isNaN(R3)?fmtOhm(R3):'')}
    ${SC.w(naX,naY+55,naX,gndY)}
    ${SC.dot(naX,gndY)}
    ${SC.gnd(naX,gndY+2)}

    <!-- V2 source: horizontal circle, + on left side -->
    <circle cx="${v2X}" cy="${naY}" r="${vr}" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.8" filter="url(#scSh)"/>
    <circle cx="${v2X}" cy="${naY}" r="12" fill="none" stroke="var(--line-2)" stroke-width="0.8"/>
    <text x="${v2X-4}" y="${naY+4}" text-anchor="end" font-size="11" fill="var(--green)" font-weight="700">+</text>
    <text x="${v2X+4}" y="${naY+4}" text-anchor="start" font-size="11" fill="var(--red)" font-weight="700">−</text>
    ${SC.badge(v2X,naY-vr-10,fmtNum(vv2)+' V','var(--acc)','var(--acc-soft)')}
    ${SC.txt(v2X,naY+vr+12,'V2','var(--ink-3)')}
    <!-- V2(+) ← R2 ← Node A -->
    ${SC.w(v2X-vr,naY,r2cX+22,naY)}
    ${SC.res(r2cX,naY,'R2',!isNaN(R2)?fmtOhm(R2):'')}
    ${SC.w(r2cX-22,naY,naX,naY)}
    <!-- V2(−) → right GND bus -->
    ${SC.w(v2X+vr,naY,W-10,naY)}${SC.w(W-10,naY,W-10,gndY)}${SC.w(W-10,gndY,naX,gndY)}
  `);
}

/* ── Voltaj Bölücü ── */
function vdivCalc() {
  drawVdiv();
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
  drawLed();
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
  drawTau();
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
  drawDb();
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
  drawOpamp();
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
  drawTrafo();
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
  drawPf();
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
  drawKirch();
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

/* ═══════════ THEVENİN / NORTON ═══════════ */
let TH_MODE = 'th2no';
function thSetMode(m) {
  TH_MODE = m;
  document.querySelectorAll('#thSeg .seg-opt').forEach(o => o.classList.toggle('active', o.dataset.m === m));
  document.getElementById('thFieldsTh').style.display = m === 'th2no' ? '' : 'none';
  document.getElementById('thFieldsNo').style.display = m === 'no2th' ? '' : 'none';
  thCalc();
}
function drawTh(vth, rth, isc) {
  const W = 310, H = 138, cy = 68;
  scRender('thSvg', W, H, `
    ${SC.txt(68, 10, 'Thevenin', 'var(--acc)', 'middle', 9)}
    ${SC.vs(22, cy, '')}
    ${vth !== null ? SC.badge(22, cy - 30, fmtNum(vth) + ' V', 'var(--acc)', 'var(--acc-soft)') : ''}
    ${SC.w(22, cy - 18, 22, 22)} ${SC.w(22, 22, 46, 22)}
    ${SC.res(68, 22, 'Rth', rth !== null ? fmtOhm(rth) : '', 44, 20)}
    ${SC.w(90, 22, 118, 22)} ${SC.dot(118, 22, 'var(--green)')}
    ${SC.txt(122, 26, '+', 'var(--green)', 'start', 10)}
    ${SC.w(22, cy + 18, 22, 114)} ${SC.w(22, 114, 118, 114)}
    ${SC.dot(118, 114, 'var(--ink-3)')} ${SC.txt(122, 118, '−', 'var(--red)', 'start', 10)}
    <line x1="156" y1="18" x2="156" y2="122" stroke="var(--line-2)" stroke-width="1" stroke-dasharray="4,3"/>
    ${SC.txt(156, cy + 5, '⇌', 'var(--ink-3)', 'middle', 13)}
    ${SC.txt(242, 10, 'Norton', 'var(--green)', 'middle', 9)}
    <circle cx="288" cy="${cy}" r="18" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.8"/>
    <line x1="288" y1="${cy - 9}" x2="288" y2="${cy + 9}" stroke="var(--green)" stroke-width="1.5"/>
    <polygon points="288,${cy - 16} 283,${cy - 7} 293,${cy - 7}" fill="var(--green)"/>
    ${isc !== null ? SC.badge(288, cy - 30, fmtNum(isc) + ' A', 'var(--green)', 'var(--green-soft)') : ''}
    ${SC.w(288, cy - 18, 288, 22)} ${SC.w(288, 22, 192, 22)}
    ${SC.dot(192, 22, 'var(--green)')} ${SC.txt(188, 26, '+', 'var(--green)', 'end', 10)}
    <line x1="248" y1="22" x2="248" y2="114" stroke="var(--acc)" stroke-width="1.8"/>
    ${rth !== null ? SC.badge(262, cy, fmtOhm(rth), 'var(--acc)', 'var(--acc-soft)', 'start') : SC.txt(262, cy + 4, 'Rn', 'var(--ink-3)', 'start', 9)}
    ${SC.w(288, cy + 18, 288, 114)} ${SC.w(288, 114, 192, 114)}
    ${SC.dot(192, 114, 'var(--ink-3)')} ${SC.txt(188, 118, '−', 'var(--red)', 'end', 10)}
  `);
}
function thCalc() {
  const res = document.getElementById('thRes');
  if (!res) return;
  if (TH_MODE === 'th2no') {
    const Vth = parseFloat(v('thVth')), Rth = parseFloat(v('thRth'));
    if (isNaN(Vth) || isNaN(Rth)) { drawTh(isNaN(Vth) ? null : Vth, isNaN(Rth) ? null : Rth, null); res.className = 'result empty'; res.textContent = 'Vth ve Rth değerlerini gir.'; return; }
    const Isc = Rth > 0 ? Vth / Rth : NaN;
    drawTh(Vth, Rth, Isc);
    res.className = 'result';
    res.innerHTML = `Norton: I<sub>sc</sub> = <b>${fmtNum(Isc)} A</b> &nbsp;·&nbsp; R<sub>N</sub> = <b>${fmtOhm(Rth)}</b>`;
  } else {
    const Isc = parseFloat(v('thIsc')), Rn = parseFloat(v('thRn'));
    if (isNaN(Isc) || isNaN(Rn)) { drawTh(null, isNaN(Rn) ? null : Rn, isNaN(Isc) ? null : Isc); res.className = 'result empty'; res.textContent = 'Isc ve Rn değerlerini gir.'; return; }
    const Vth = Isc * Rn;
    drawTh(Vth, Rn, Isc);
    res.className = 'result';
    res.innerHTML = `Thevenin: V<sub>th</sub> = <b>${fmtNum(Vth)} V</b> &nbsp;·&nbsp; R<sub>th</sub> = <b>${fmtOhm(Rn)}</b>`;
  }
}

/* ═══════════ WHEATSTONE KÖPRÜSÜ ═══════════ */
function drawWs(r1, r2, r3, rxVal, vs, vg) {
  const W = 240, H = 202, lx = 58, brx = 182, cx = 120;
  const topY = 28, r1y = 60, midY = 96, r3y = 130, botY = 170;
  scRender('wsSvg', W, H, `
    ${vs !== null ? SC.badge(cx, topY - 4, fmtNum(vs) + ' V', 'var(--acc)', 'var(--acc-soft)') : SC.txt(cx, topY + 2, 'Vs', 'var(--ink-3)')}
    ${SC.w(cx, topY + 8, lx, topY + 8)} ${SC.w(lx, topY + 8, lx, r1y - 11)}
    ${SC.w(cx, topY + 8, brx, topY + 8)} ${SC.w(brx, topY + 8, brx, r1y - 11)}
    ${SC.res(lx, r1y, 'R1', r1 !== null ? fmtOhm(r1) : '', 42, 20)}
    ${SC.res(brx, r1y, 'R2', r2 !== null ? fmtOhm(r2) : '', 42, 20)}
    ${SC.w(lx, r1y + 10, lx, midY)} ${SC.dot(lx, midY)}
    ${SC.w(brx, r1y + 10, brx, midY)} ${SC.dot(brx, midY)}
    ${SC.w(lx, midY, brx, midY, 'var(--spark)')}
    ${vg !== null ? SC.badge(cx, midY - 14, fmtNum(vg) + ' V', 'var(--spark)', 'var(--spark-soft)') : SC.txt(cx, midY - 13, 'Vg', 'var(--ink-3)', 'middle', 9)}
    ${SC.res(lx, r3y, 'R3', r3 !== null ? fmtOhm(r3) : '', 42, 20)}
    ${SC.res(brx, r3y, 'Rx', rxVal !== null ? fmtOhm(rxVal) : '?', 42, 20)}
    ${SC.w(lx, r3y + 10, lx, botY)} ${SC.w(brx, r3y + 10, brx, botY)}
    ${SC.w(lx, botY, brx, botY)} ${SC.gnd(cx, botY + 2)}
  `);
}
function wsCalc() {
  const R1 = parseFloat(v('wsR1')), R2 = parseFloat(v('wsR2')), R3 = parseFloat(v('wsR3'));
  const Vs = parseFloat(v('wsVs')), RxIn = parseFloat(v('wsRx'));
  const res = document.getElementById('wsRes');
  if (!res) return;
  if (isNaN(R1) || isNaN(R2) || isNaN(R3) || R1 <= 0 || R2 <= 0 || R3 <= 0) {
    drawWs(null, null, null, null, null, null);
    res.className = 'result empty'; res.textContent = 'R1, R2 ve R3 değerlerini gir.'; return;
  }
  const RxBal = R2 * R3 / R1;
  const vsV = isNaN(Vs) ? null : Vs;
  const rxShow = !isNaN(RxIn) ? RxIn : RxBal;
  const vg = (vsV !== null && !isNaN(RxIn) && RxIn > 0)
    ? vsV * (R3 / (R1 + R3) - RxIn / (R2 + RxIn))
    : null;
  drawWs(R1, R2, R3, rxShow, vsV, vg);
  res.className = 'result';
  let html = `Denge için Rx = R2·R3/R1 = <b>${fmtOhm(RxBal)}</b>`;
  if (!isNaN(RxIn)) {
    const ok = Math.abs(R1 * RxIn - R2 * R3) < 0.01 * R2 * R3;
    html += `<br>Girilen Rx = ${fmtOhm(RxIn)} → ${ok ? '✅ Köprü dengede' : '⚠️ Köprü dengede değil'}`;
  }
  if (vg !== null) html += `<br>Galvanometre V<sub>g</sub> = <b>${fmtNum(vg)} V</b>`;
  res.innerHTML = html;
}

/* ═══════════ SÜPERPOZISYON ═══════════ */
function drawSup(v1val, v2val, va, live) {
  const W = 288, H = 158, naX = 144, naY = 54, gndY = 134;
  const v1X = 28, vr = 17, v2X = 260, r1cX = 84, r2cX = 204;
  scRender('supSvg', W, H, `
    <circle cx="${v1X}" cy="${naY}" r="${vr}" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.8"/>
    <text x="${v1X+4}" y="${naY+4}" text-anchor="start" font-size="11" fill="var(--green)" font-weight="700">+</text>
    <text x="${v1X-4}" y="${naY+4}" text-anchor="end" font-size="11" fill="var(--red)" font-weight="700">−</text>
    ${live ? SC.badge(v1X, naY - vr - 10, fmtNum(v1val) + ' V', 'var(--acc)', 'var(--acc-soft)') : SC.txt(v1X, naY - vr - 8, 'V1', 'var(--ink-3)')}
    ${SC.w(v1X + vr, naY, r1cX - 22, naY)}
    ${SC.res(r1cX, naY, 'R1', '', 44, 20)}
    ${SC.w(r1cX + 22, naY, naX, naY)}
    ${SC.w(v1X - vr, naY, 10, naY)} ${SC.w(10, naY, 10, gndY)} ${SC.w(10, gndY, naX, gndY)}
    ${SC.dot(naX, naY, 'var(--acc)')}
    ${live ? SC.badge(naX, naY - 14, fmtNum(va) + ' V', 'var(--green)', 'var(--green-soft)') : SC.txt(naX, naY - 14, 'Va', 'var(--ink-3)')}
    ${SC.txt(naX + 6, naY + 12, 'A', 'var(--ink-3)', 'start', 9)}
    ${SC.wa(naX, naY + 5, naX, naY + 30, 'var(--acc)')}
    ${SC.res(naX, naY + 44, 'R3', '', 40, 20)}
    ${SC.w(naX, naY + 55, naX, gndY)} ${SC.dot(naX, gndY)} ${SC.gnd(naX, gndY + 2)}
    <circle cx="${v2X}" cy="${naY}" r="${vr}" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.8"/>
    <text x="${v2X-4}" y="${naY+4}" text-anchor="end" font-size="11" fill="var(--green)" font-weight="700">+</text>
    <text x="${v2X+4}" y="${naY+4}" text-anchor="start" font-size="11" fill="var(--red)" font-weight="700">−</text>
    ${live ? SC.badge(v2X, naY - vr - 10, fmtNum(v2val) + ' V', 'var(--acc)', 'var(--acc-soft)') : SC.txt(v2X, naY - vr - 8, 'V2', 'var(--ink-3)')}
    ${SC.w(v2X - vr, naY, r2cX + 22, naY)}
    ${SC.res(r2cX, naY, 'R2', '', 44, 20)}
    ${SC.w(r2cX - 22, naY, naX, naY)}
    ${SC.w(v2X + vr, naY, W - 10, naY)} ${SC.w(W - 10, naY, W - 10, gndY)} ${SC.w(W - 10, gndY, naX, gndY)}
  `);
}
function supCalc() {
  const res = document.getElementById('supRes');
  if (!res) return;
  const V1 = parseFloat(v('supV1')), V2 = parseFloat(v('supV2'));
  const R1 = parseFloat(v('supR1')), R2 = parseFloat(v('supR2')), R3 = parseFloat(v('supR3'));
  if (isNaN(V1) || isNaN(R1) || isNaN(R2) || isNaN(R3) || R1 <= 0 || R2 <= 0 || R3 <= 0) {
    drawSup(null, null, null, false);
    res.className = 'result empty'; res.textContent = 'V1, R1, R2, R3 zorunlu; V2 opsiyonel (0 V varsayılır).'; return;
  }
  const vv2 = isNaN(V2) ? 0 : V2;
  const R23 = R2 * R3 / (R2 + R3);
  const Va1 = V1 * R23 / (R1 + R23);
  const R13 = R1 * R3 / (R1 + R3);
  const Va2 = vv2 * R13 / (R2 + R13);
  const Va = Va1 + Va2;
  const I1 = (V1 - Va) / R1, I2 = (vv2 - Va) / R2, I3 = Va / R3;
  drawSup(V1, vv2, Va, true);
  res.className = 'result';
  res.innerHTML =
    `<b>Adım 1</b> (V2 kısa): V<sub>A1</sub> = V1·(R₂‖R₃)/(R₁+R₂‖R₃) = <b>${fmtNum(Va1)} V</b><br>` +
    `<b>Adım 2</b> (V1 kısa): V<sub>A2</sub> = V2·(R₁‖R₃)/(R₂+R₁‖R₃) = <b>${fmtNum(Va2)} V</b><br>` +
    `<b>Toplam</b> V<sub>A</sub> = V<sub>A1</sub>+V<sub>A2</sub> = <b>${fmtNum(Va)} V</b><br>` +
    `I₁ = <b>${fmtNum(I1 * 1000)} mA</b> &nbsp;·&nbsp; I₂ = <b>${fmtNum(I2 * 1000)} mA</b> &nbsp;·&nbsp; I₃ = <b>${fmtNum(I3 * 1000)} mA</b>`;
}

/* ═══════════ ÖRNEKLEME (NYQUIST) ═══════════ */
let NYQ_MODE = 'sig2samp';
function nyqSetMode(m) {
  NYQ_MODE = m;
  document.querySelectorAll('#nyqSeg .seg-opt').forEach(o => o.classList.toggle('active', o.dataset.m === m));
  document.getElementById('nyqFieldsSig').style.display  = m === 'sig2samp'  ? '' : 'none';
  document.getElementById('nyqFieldsSamp').style.display = m === 'samp2sig' ? '' : 'none';
  nyqCalc();
}
function nyqCalc() {
  const res = document.getElementById('nyqRes');
  if (!res) return;
  const fmtHz = f => f >= 1e9 ? fmtNum(f/1e9)+' GHz' : f >= 1e6 ? fmtNum(f/1e6)+' MHz' : f >= 1e3 ? fmtNum(f/1e3)+' kHz' : fmtNum(f)+' Hz';
  if (NYQ_MODE === 'sig2samp') {
    const fs = parseFloat(v('nyqSig'));
    if (isNaN(fs) || fs <= 0) { res.className = 'result empty'; res.textContent = 'Sinyal frekansını gir.'; return; }
    res.className = 'result';
    res.innerHTML =
      `Nyquist hızı = 2·f = <b>${fmtHz(fs * 2)}</b><br>` +
      `Önerilen (×10 kural): <b>${fmtHz(fs * 10)}</b><br>` +
      `<b>${fmtHz(fs)}</b> altında örnekleme → aliasing`;
  } else {
    const fs = parseFloat(v('nyqSamp'));
    if (isNaN(fs) || fs <= 0) { res.className = 'result empty'; res.textContent = 'Örnekleme frekansını gir.'; return; }
    const fMax = fs / 2;
    res.className = 'result';
    res.innerHTML =
      `Max sinyal frekansı = fs/2 = <b>${fmtHz(fMax)}</b><br>` +
      `Bu sınırın üstündeki bileşenler aliasing'e uğrar`;
  }
}

/* ═══════════ SNR HESABI ═══════════ */
let SNR_MODE = 'ratio2db', SNR_TYPE = 'power';
function snrSetMode(m) {
  SNR_MODE = m;
  document.querySelectorAll('#snrSeg .seg-opt').forEach(o => o.classList.toggle('active', o.dataset.m === m));
  document.getElementById('snrFieldsRatio').style.display = m === 'ratio2db' ? '' : 'none';
  document.getElementById('snrFieldsDb').style.display    = m === 'db2ratio' ? '' : 'none';
  snrCalc();
}
function snrSetType(t) {
  SNR_TYPE = t;
  document.querySelectorAll('#snrTypeSeg .seg-opt').forEach(o => o.classList.toggle('active', o.dataset.t === t));
  snrCalc();
}
function snrCalc() {
  const res = document.getElementById('snrRes');
  if (!res) return;
  const k = SNR_TYPE === 'power' ? 10 : 20;
  if (SNR_MODE === 'ratio2db') {
    const ratio = parseFloat(v('snrRatio'));
    if (isNaN(ratio) || ratio <= 0) { res.className = 'result empty'; res.textContent = 'Sinyal/gürültü oranını gir.'; return; }
    const db = k * Math.log10(ratio);
    const enob = (db - 1.76) / 6.02;
    res.className = 'result';
    res.innerHTML = `SNR = <b>${fmtNum(db)} dB</b>` +
      (SNR_TYPE === 'power' ? `<br>ENOB ≈ <b>${fmtNum(enob)} bit</b> &nbsp;<span style="color:var(--ink-3);font-size:.9em">(ADC için)</span>` : '');
  } else {
    const db = parseFloat(v('snrDb'));
    if (isNaN(db)) { res.className = 'result empty'; res.textContent = 'SNR değerini dB cinsinden gir.'; return; }
    const ratio = Math.pow(10, db / k);
    const enob  = (db - 1.76) / 6.02;
    res.className = 'result';
    res.innerHTML = `Oran = <b>${fmtNum(ratio)}</b>` +
      (SNR_TYPE === 'power' ? `<br>ENOB ≈ <b>${fmtNum(enob)} bit</b>` : '');
  }
}

/* ═══════════ SAYI SİSTEMİ ÇEVİRİCİ ═══════════ */
function numConvCalc() {
  const res = document.getElementById('numRes');
  if (!res) return;
  const input = (v('numInput') || '').trim().toUpperCase();
  const base  = parseInt(v('numBase') || '10');
  if (!input) { res.className = 'result empty'; res.textContent = 'Değeri gir.'; return; }
  const valid = { 2: /^[01]+$/, 8: /^[0-7]+$/, 10: /^-?\d+$/, 16: /^[0-9A-F]+$/ };
  if (!valid[base].test(input)) { res.className = 'result'; res.innerHTML = '⚠️ Geçersiz karakter bu tabanda.'; return; }
  const num = parseInt(input, base);
  if (isNaN(num)) { res.className = 'result empty'; res.textContent = 'Geçersiz değer.'; return; }
  const u = num >>> 0;
  res.className = 'result';
  res.innerHTML =
    `<span style="color:var(--ink-3);font-size:.85em">DEC</span> &nbsp;<b>${num}</b><br>` +
    `<span style="color:var(--ink-3);font-size:.85em">BIN</span> &nbsp;<code style="font-family:var(--mono)">${u.toString(2)}</code><br>` +
    `<span style="color:var(--ink-3);font-size:.85em">OCT</span> &nbsp;<code style="font-family:var(--mono)">${u.toString(8)}</code><br>` +
    `<span style="color:var(--ink-3);font-size:.85em">HEX</span> &nbsp;<code style="font-family:var(--mono)">${u.toString(16).toUpperCase()}</code>`;
}

/* ═══════════ MANTIK KAPISI TABLOSU ═══════════ */
const LOGIC_GATES = {
  AND:  { sym: 'A · B',  fn: (a,b) => a & b,        n: 2 },
  OR:   { sym: 'A + B',  fn: (a,b) => a | b,        n: 2 },
  NAND: { sym: '¬(A·B)', fn: (a,b) => (a & b) ^ 1,  n: 2 },
  NOR:  { sym: '¬(A+B)', fn: (a,b) => (a | b) ^ 1,  n: 2 },
  XOR:  { sym: 'A ⊕ B',  fn: (a,b) => a ^ b,        n: 2 },
  XNOR: { sym: '¬(A⊕B)', fn: (a,b) => (a ^ b) ^ 1, n: 2 },
  NOT:  { sym: '¬A',     fn: (a)   => a ^ 1,         n: 1 },
};
let GATE_SEL = 'AND';
function gateSetSel(g) {
  GATE_SEL = g;
  document.querySelectorAll('#gateSeg .seg-opt').forEach(o => o.classList.toggle('active', o.dataset.g === g));
  buildGateTable();
}
function buildGateTable() {
  const res = document.getElementById('gateRes');
  if (!res) return;
  const gate = LOGIC_GATES[GATE_SEL];
  const cell = (t, bold, color) =>
    `<td style="padding:5px 14px;text-align:center;${bold?'font-weight:700;':''}${color?'color:'+color+';':''}">${t}</td>`;
  let rows = '';
  if (gate.n === 2) {
    rows += `<tr>${cell('A')+''+cell('B')+''+cell('Y')}</tr>`;
    [[0,0],[0,1],[1,0],[1,1]].forEach(([a,b]) => {
      const y = gate.fn(a, b);
      rows += `<tr>${cell(a)}${cell(b)}${cell(y, true, y ? 'var(--green)' : 'var(--red)')}</tr>`;
    });
  } else {
    rows += `<tr>${cell('A')+''+cell('Y')}</tr>`;
    [0,1].forEach(a => {
      const y = gate.fn(a);
      rows += `<tr>${cell(a)}${cell(y, true, y ? 'var(--green)' : 'var(--red)')}</tr>`;
    });
  }
  res.className = 'result';
  res.innerHTML =
    `<div style="font-weight:700;color:var(--acc);margin-bottom:10px;font-family:var(--mono)">${GATE_SEL} &nbsp;·&nbsp; Y = ${gate.sym}</div>` +
    `<table style="border-collapse:collapse;font-family:var(--mono);font-size:13px">${rows}</table>`;
}

/* ═══════════ 555 ZAMANLAYICI ═══════════ */
let TIMER555_MODE = 'astable';
function timer555SetMode(m) {
  TIMER555_MODE = m;
  document.querySelectorAll('#t555Seg .seg-opt').forEach(o => o.classList.toggle('active', o.dataset.m === m));
  const monoFields = document.getElementById('t555MonoFields');
  const astableFields = document.getElementById('t555AstableFields');
  if (monoFields) monoFields.style.display = m === 'mono' ? '' : 'none';
  if (astableFields) astableFields.style.display = m === 'astable' ? '' : 'none';
  timer555Calc();
}
function timer555Calc() {
  const res = document.getElementById('t555Res');
  if (!res) return;
  if (TIMER555_MODE === 'astable') {
    const Ra = parseFloat(v('t555Ra')), Rb = parseFloat(v('t555Rb')), C = parseFloat(v('t555C'));
    if (isNaN(Ra) || isNaN(Rb) || isNaN(C) || Ra <= 0 || Rb <= 0 || C <= 0) {
      res.className = 'result empty'; res.textContent = 'Ra, Rb ve C değerlerini gir.'; return;
    }
    const Cv = C / 1e6;
    const tH = 0.693 * (Ra + Rb) * Cv;
    const tL = 0.693 * Rb * Cv;
    const T = tH + tL;
    const f = 1 / T;
    const duty = (tH / T) * 100;
    const fmtT = t => t >= 1 ? fmtNum(t) + ' s' : t >= 0.001 ? fmtNum(t * 1000) + ' ms' : fmtNum(t * 1e6) + ' µs';
    res.className = 'result';
    res.innerHTML =
      `Frekans <b>${fmtNum(f >= 1000 ? f / 1000 : f)} ${f >= 1000 ? 'kHz' : 'Hz'}</b> &nbsp;·&nbsp; Periyot <b>${fmtT(T)}</b><br>` +
      `t<sub>H</sub> = <b>${fmtT(tH)}</b> &nbsp;·&nbsp; t<sub>L</sub> = <b>${fmtT(tL)}</b> &nbsp;·&nbsp; Duty Cycle <b>${fmtNum(duty)}%</b>`;
  } else {
    const R = parseFloat(v('t555Rm')), C = parseFloat(v('t555Cm'));
    if (isNaN(R) || isNaN(C) || R <= 0 || C <= 0) {
      res.className = 'result empty'; res.textContent = 'R ve C değerlerini gir.'; return;
    }
    const t = 1.1 * R * (C / 1e6);
    const fmtT = tt => tt >= 1 ? fmtNum(tt) + ' s' : tt >= 0.001 ? fmtNum(tt * 1000) + ' ms' : fmtNum(tt * 1e6) + ' µs';
    res.className = 'result';
    res.innerHTML = `Çıkış süresi t = 1.1·R·C = <b>${fmtT(t)}</b>`;
  }
}

/* ═══════════ RC FİLTRE ═══════════ */
let RC_FILT_MODE = 'lp';
function rcFiltSetMode(m) {
  RC_FILT_MODE = m;
  document.querySelectorAll('#rcfSeg .seg-opt').forEach(o => o.classList.toggle('active', o.dataset.m === m));
  rcFiltCalc();
}
function rcFiltCalc() {
  const res = document.getElementById('rcfRes');
  if (!res) return;
  const R = parseFloat(v('rcfR')), C = parseFloat(v('rcfC'));
  if (isNaN(R) || isNaN(C) || R <= 0 || C <= 0) {
    res.className = 'result empty'; res.textContent = 'R ve C değerlerini gir.'; return;
  }
  const fc = 1 / (2 * Math.PI * R * (C / 1e6));
  const omega = 2 * Math.PI * fc;
  const modeLabel = { lp: 'Alçak Geçiren (LP)', hp: 'Yüksek Geçiren (HP)', bp: 'Bant Geçiren (BP)' }[RC_FILT_MODE];
  const phaseLP = -45;
  const phaseHP = 45;
  res.className = 'result';
  res.innerHTML =
    `<b>${modeLabel}</b><br>` +
    `-3 dB kesim frekansı <b>${fmtNum(fc >= 1000 ? fc / 1000 : fc)} ${fc >= 1000 ? 'kHz' : 'Hz'}</b><br>` +
    `ω₀ = <b>${fmtNum(omega >= 1000 ? omega / 1000 : omega)} ${omega >= 1000 ? 'krad/s' : 'rad/s'}</b>` +
    (RC_FILT_MODE === 'lp' ? ` &nbsp;·&nbsp; f = fc'de faz <b>${phaseLP}°</b>` : '') +
    (RC_FILT_MODE === 'hp' ? ` &nbsp;·&nbsp; f = fc'de faz <b>+${phaseHP}°</b>` : '') +
    (RC_FILT_MODE === 'bp' ? `<br>Merkez frekans = kesim frekansı, BW = <b>${fmtNum(fc)} Hz</b>` : '');
}

/* ═══════════ BİRİM ÇEVİRİCİ ═══════════ */
const UNIT_CATS = {
  gerilim: {
    label: 'Gerilim', units: [
      { k: 'V',  n: 'Volt',       f: 1 },
      { k: 'mV', n: 'Milivolt',   f: 1e-3 },
      { k: 'µV', n: 'Mikrovolt',  f: 1e-6 },
      { k: 'kV', n: 'Kilovolt',   f: 1e3 },
    ]
  },
  akim: {
    label: 'Akım', units: [
      { k: 'A',  n: 'Amper',      f: 1 },
      { k: 'mA', n: 'Miliamper',  f: 1e-3 },
      { k: 'µA', n: 'Mikroamper', f: 1e-6 },
      { k: 'kA', n: 'Kiloamper',  f: 1e3 },
    ]
  },
  direnc: {
    label: 'Direnç', units: [
      { k: 'Ω',  n: 'Ohm',        f: 1 },
      { k: 'mΩ', n: 'Miliohm',    f: 1e-3 },
      { k: 'kΩ', n: 'Kilohm',     f: 1e3 },
      { k: 'MΩ', n: 'Megaohm',    f: 1e6 },
    ]
  },
  guc: {
    label: 'Güç', units: [
      { k: 'W',  n: 'Watt',       f: 1 },
      { k: 'mW', n: 'Miliwatt',   f: 1e-3 },
      { k: 'kW', n: 'Kilowatt',   f: 1e3 },
      { k: 'MW', n: 'Megawatt',   f: 1e6 },
    ]
  },
  frekans: {
    label: 'Frekans', units: [
      { k: 'Hz',  n: 'Hertz',      f: 1 },
      { k: 'kHz', n: 'Kilohertz',  f: 1e3 },
      { k: 'MHz', n: 'Megahertz',  f: 1e6 },
      { k: 'GHz', n: 'Gigahertz',  f: 1e9 },
    ]
  },
  kapasite: {
    label: 'Kapasite', units: [
      { k: 'F',  n: 'Farad',      f: 1 },
      { k: 'mF', n: 'Milifarad',  f: 1e-3 },
      { k: 'µF', n: 'Mikrofarad', f: 1e-6 },
      { k: 'nF', n: 'Nanofarad',  f: 1e-9 },
      { k: 'pF', n: 'Pikofarad',  f: 1e-12 },
    ]
  },
  induktans: {
    label: 'Endüktans', units: [
      { k: 'H',  n: 'Henri',      f: 1 },
      { k: 'mH', n: 'Milihenri',  f: 1e-3 },
      { k: 'µH', n: 'Mikrohenri', f: 1e-6 },
      { k: 'nH', n: 'Nanohenri',  f: 1e-9 },
    ]
  },
};
let UNIT_CAT = 'gerilim';
function unitSetCat(c) {
  UNIT_CAT = c;
  document.querySelectorAll('#unitCatSeg .seg-opt').forEach(o => o.classList.toggle('active', o.dataset.c === c));
  buildUnitSelects();
  unitConvert();
}
function buildUnitSelects() {
  const cat = UNIT_CATS[UNIT_CAT];
  const opts = cat.units.map((u, i) => `<option value="${i}">${u.k} — ${u.n}</option>`).join('');
  const from = document.getElementById('unitFrom');
  const to = document.getElementById('unitTo');
  if (from) { from.innerHTML = opts; from.value = '0'; }
  if (to)   { to.innerHTML = opts;   to.value = '1'; }
}
function unitConvert() {
  const res = document.getElementById('unitRes');
  if (!res) return;
  const val = parseFloat(v('unitVal'));
  const fromIdx = parseInt((document.getElementById('unitFrom') || {}).value || 0);
  const toIdx   = parseInt((document.getElementById('unitTo')   || {}).value || 1);
  const cat = UNIT_CATS[UNIT_CAT];
  if (isNaN(val)) { res.className = 'result empty'; res.textContent = 'Çevirmek istediğin değeri gir.'; return; }
  const base = val * cat.units[fromIdx].f;
  const out  = base / cat.units[toIdx].f;
  const fmt  = x => {
    if (Math.abs(x) >= 1e9 || (Math.abs(x) < 1e-4 && x !== 0)) return x.toExponential(4);
    return (Math.round(x * 1e6) / 1e6).toLocaleString('tr-TR');
  };
  res.className = 'result';
  res.innerHTML = `<b>${fmtNum(val)} ${cat.units[fromIdx].k}</b> = <span style="font-size:1.15em;font-weight:700;color:var(--acc)">${fmt(out)} ${cat.units[toIdx].k}</span>`;
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

    <div class="tool wide">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--acc-soft);border-color:var(--acc-line)">÷</div>
        <div><div class="tool-title">Voltaj Bölücü</div><div class="tool-formula">Vout = Vin · R2 / (R1+R2)</div></div>
      </div>
      <div class="scm-layout">
        <div class="scm-stage"><div id="vdSvg"></div></div>
        <div>
          <div class="field"><label class="label">Giriş gerilimi Vin (V)</label><input class="input" id="vdVin" type="number" placeholder="Volt" oninput="vdivCalc()"></div>
          <div class="field"><label class="label">R1 — üst (Ω)</label><input class="input" id="vdR1" type="number" placeholder="Ör: 10000" oninput="vdivCalc()"></div>
          <div class="field"><label class="label">R2 — alt (Ω)</label><input class="input" id="vdR2" type="number" placeholder="Ör: 4700" oninput="vdivCalc()"></div>
          <div class="result empty" id="vdRes">Vin, R1 ve R2 değerlerini gir.</div>
        </div>
      </div>
    </div>

    <div class="tool wide">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--spark-soft);border-color:var(--spark)">💡</div>
        <div><div class="tool-title">LED Direnç Hesaplayıcı</div><div class="tool-formula">R = (Vs − Vf) / If</div></div>
      </div>
      <div class="scm-layout">
        <div class="scm-stage"><div id="ledSvg"></div></div>
        <div>
          <div class="field"><label class="label">Kaynak Vs (V)</label><input class="input" id="ledVs" type="number" placeholder="Ör: 5" oninput="ledCalc()"></div>
          <div class="field"><label class="label">LED Vf (V)</label><input class="input" id="ledVf" type="number" placeholder="Ör: 2.2" oninput="ledCalc()"></div>
          <div class="field"><label class="label">LED akımı If (mA)</label><input class="input" id="ledIf" type="number" placeholder="Ör: 20" oninput="ledCalc()"></div>
          <div class="result empty" id="ledRes">Kaynak gerilimi, Vf ve If değerlerini gir.</div>
        </div>
      </div>
    </div>

    <div class="tool wide">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--green-soft);border-color:var(--green)">τ</div>
        <div><div class="tool-title">RC / RL Zaman Sabiti</div><div class="tool-formula">τ = R·C &nbsp;·&nbsp; τ = L/R</div></div>
      </div>
      <div class="scm-layout">
        <div class="scm-stage"><div id="tauSvg"></div></div>
        <div>
          <div class="field"><label class="label">Direnç R (Ω)</label><input class="input" id="tauR" type="number" placeholder="Ohm" oninput="tauCalc()"></div>
          <div class="field"><label class="label">Kondansatör C (µF)</label><input class="input" id="tauC" type="number" placeholder="µF" oninput="tauCalc()"></div>
          <div class="field"><label class="label">Bobin L (mH)</label><input class="input" id="tauL" type="number" placeholder="mH" oninput="tauCalc()"></div>
          <div class="result empty" id="tauRes">R+C veya R+L değerlerini gir.</div>
        </div>
      </div>
    </div>

    <div class="tool wide">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--violet-soft);border-color:var(--violet)">dB</div>
        <div><div class="tool-title">dB Çevirici</div><div class="tool-formula">20·log(V₂/V₁) &nbsp;·&nbsp; 10·log(P₂/P₁)</div></div>
      </div>
      <div class="scm-layout">
        <div class="scm-stage"><div id="dbSvg"></div></div>
        <div>
          <div class="seg" id="dbSeg" style="margin-bottom:14px">
            <div class="seg-opt active" data-m="v" onclick="dbSetMode('v')">Gerilim ×20</div>
            <div class="seg-opt" data-m="p" onclick="dbSetMode('p')">Güç ×10</div>
          </div>
          <div class="field"><label class="label">Oran (lineer)</label><input class="input" id="dbRatio" type="number" step="any" placeholder="Ör: 2" oninput="document.getElementById('dbDb').value='';dbCalc()"></div>
          <div class="field"><label class="label">Değer (dB)</label><input class="input" id="dbDb" type="number" step="any" placeholder="Ör: 6" oninput="document.getElementById('dbRatio').value='';dbCalc()"></div>
          <div class="result empty" id="dbRes">Oran veya dB değeri gir.</div>
        </div>
      </div>
    </div>

    <div class="tool wide">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--acc-soft);border-color:var(--acc-line)">▲</div>
        <div><div class="tool-title">Op-Amp Kazanç</div><div class="tool-formula">Av = −Rf/R1 &nbsp;·&nbsp; 1+Rf/R1</div></div>
      </div>
      <div class="scm-layout">
        <div class="scm-stage"><div id="opSvg"></div></div>
        <div>
          <div class="seg" id="opSeg" style="margin-bottom:14px">
            <div class="seg-opt active" data-m="inv" onclick="opSetMode('inv')">Çevirici (−)</div>
            <div class="seg-opt" data-m="noninv" onclick="opSetMode('noninv')">Çevirmez (+)</div>
          </div>
          <div class="field"><label class="label">R1 — giriş (Ω)</label><input class="input" id="opR1" type="number" placeholder="Ör: 1000" oninput="opampCalc()"></div>
          <div class="field"><label class="label">Rf — geri besleme (Ω)</label><input class="input" id="opRf" type="number" placeholder="Ör: 10000" oninput="opampCalc()"></div>
          <div class="result empty" id="opRes">Rf ve R1 değerlerini gir.</div>
        </div>
      </div>
    </div>

    <div class="tool wide">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--green-soft);border-color:var(--green)">🔌</div>
        <div><div class="tool-title">Transformatör Hesaplayıcı</div><div class="tool-formula">V₂/V₁ = N₂/N₁ &nbsp;·&nbsp; I₁·N₁ = I₂·N₂</div></div>
      </div>
      <div class="scm-layout">
        <div class="scm-stage"><div id="trSvg"></div></div>
        <div>
          <div class="field"><label class="label">N1 — birincil sarım</label><input class="input" id="trN1" type="number" placeholder="Ör: 200" oninput="trafoCalc()"></div>
          <div class="field"><label class="label">N2 — ikincil sarım</label><input class="input" id="trN2" type="number" placeholder="Ör: 40" oninput="trafoCalc()"></div>
          <div class="field"><label class="label">V1 (V) opsiyonel</label><input class="input" id="trV1" type="number" placeholder="Birincil gerilim" oninput="trafoCalc()"></div>
          <div class="field"><label class="label">I1 (A) opsiyonel</label><input class="input" id="trI1" type="number" placeholder="Birincil akım" oninput="trafoCalc()"></div>
          <div class="result empty" id="trRes">N1 ve N2 sarım sayısını gir.</div>
        </div>
      </div>
    </div>

    <div class="tool wide">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--red-soft);border-color:var(--red)">φ</div>
        <div><div class="tool-title">Güç Faktörü & Güç Üçgeni</div><div class="tool-formula">S² = P² + Q² &nbsp;·&nbsp; cos φ = P/S</div></div>
      </div>
      <div class="scm-layout">
        <div class="scm-stage"><div id="pfSvg"></div></div>
        <div>
          <div class="field"><label class="label">Aktif güç P (W)</label><input class="input" id="pfP" type="number" placeholder="Watt" oninput="pfCalc()"></div>
          <div class="field"><label class="label">Reaktif güç Q (VAR)</label><input class="input" id="pfQ" type="number" placeholder="VAR" oninput="pfCalc()"></div>
          <div class="field"><label class="label">Görünür güç S (VA)</label><input class="input" id="pfS" type="number" placeholder="VA" oninput="pfCalc()"></div>
          <div class="field"><label class="label">Güç faktörü cos φ</label><input class="input" id="pfPF" type="number" step="0.01" min="0" max="1" placeholder="0 – 1" oninput="pfCalc()"></div>
          <div class="result empty" id="pfRes">En az iki değer gir.</div>
        </div>
      </div>
    </div>

    <div class="tool wide">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--spark-soft);border-color:var(--spark)">KCL</div>
        <div><div class="tool-title">Kirchhoff Düğüm Çözücü</div><div class="tool-formula">V1─R1─A─R3─GND &nbsp;·&nbsp; V2─R2─A</div></div>
      </div>
      <div class="scm-layout">
        <div class="scm-stage"><div id="kcSvg"></div></div>
        <div>
          <div class="field"><label class="label">V1 (V)</label><input class="input" id="kcV1" type="number" placeholder="Kaynak 1" oninput="kirchCalc()"></div>
          <div class="field"><label class="label">V2 (V) opsiyonel</label><input class="input" id="kcV2" type="number" placeholder="Kaynak 2 (0 V)" oninput="kirchCalc()"></div>
          <div class="field"><label class="label">R1 — V1 kolunda (Ω)</label><input class="input" id="kcR1" type="number" placeholder="Ör: 1000" oninput="kirchCalc()"></div>
          <div class="field"><label class="label">R2 — V2 kolunda (Ω)</label><input class="input" id="kcR2" type="number" placeholder="Ör: 2200" oninput="kirchCalc()"></div>
          <div class="field"><label class="label">R3 — GND'ye (Ω)</label><input class="input" id="kcR3" type="number" placeholder="Ör: 3300" oninput="kirchCalc()"></div>
          <div class="result empty" id="kcRes">V1, R1, R2, R3 zorunlu; V2 opsiyonel.</div>
        </div>
      </div>
    </div>

    <div class="tool wide">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--acc-soft);border-color:var(--acc-line)">Th</div>
        <div><div class="tool-title">Thevenin / Norton Dönüşümü</div><div class="tool-formula">V<sub>th</sub> = I<sub>sc</sub>·R<sub>th</sub> &nbsp;·&nbsp; iki eşdeğer devre</div></div>
      </div>
      <div class="scm-layout">
        <div class="scm-stage"><div id="thSvg"></div></div>
        <div>
          <div class="seg" id="thSeg" style="margin-bottom:14px">
            <div class="seg-opt active" data-m="th2no" onclick="thSetMode('th2no')">Thevenin → Norton</div>
            <div class="seg-opt" data-m="no2th" onclick="thSetMode('no2th')">Norton → Thevenin</div>
          </div>
          <div id="thFieldsTh">
            <div class="field"><label class="label">V<sub>th</sub> — açık devre gerilimi (V)</label><input class="input" id="thVth" type="number" placeholder="Ör: 12" oninput="thCalc()"></div>
            <div class="field"><label class="label">R<sub>th</sub> — Thevenin direnci (Ω)</label><input class="input" id="thRth" type="number" placeholder="Ör: 100" oninput="thCalc()"></div>
          </div>
          <div id="thFieldsNo" style="display:none">
            <div class="field"><label class="label">I<sub>sc</sub> — kısa devre akımı (A)</label><input class="input" id="thIsc" type="number" placeholder="Ör: 0.12" oninput="thCalc()"></div>
            <div class="field"><label class="label">R<sub>n</sub> — Norton direnci (Ω)</label><input class="input" id="thRn" type="number" placeholder="Ör: 100" oninput="thCalc()"></div>
          </div>
          <div class="result empty" id="thRes">Vth ve Rth değerlerini gir.</div>
        </div>
      </div>
    </div>

    <div class="tool wide">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--spark-soft);border-color:var(--spark)">⬡</div>
        <div><div class="tool-title">Wheatstone Köprüsü</div><div class="tool-formula">R₁·Rx = R₂·R₃ &nbsp;·&nbsp; Rx = R₂·R₃/R₁</div></div>
      </div>
      <div class="scm-layout">
        <div class="scm-stage"><div id="wsSvg"></div></div>
        <div>
          <div class="field-row">
            <div class="field"><label class="label">R1 (Ω)</label><input class="input" id="wsR1" type="number" placeholder="Ör: 1000" oninput="wsCalc()"></div>
            <div class="field"><label class="label">R2 (Ω)</label><input class="input" id="wsR2" type="number" placeholder="Ör: 1000" oninput="wsCalc()"></div>
          </div>
          <div class="field-row">
            <div class="field"><label class="label">R3 (Ω)</label><input class="input" id="wsR3" type="number" placeholder="Ör: 2200" oninput="wsCalc()"></div>
            <div class="field"><label class="label">Rx opsiyonel (Ω)</label><input class="input" id="wsRx" type="number" placeholder="Bilinmeyen / kontrol" oninput="wsCalc()"></div>
          </div>
          <div class="field"><label class="label">Vs (V) opsiyonel</label><input class="input" id="wsVs" type="number" placeholder="Ör: 5" oninput="wsCalc()"></div>
          <div class="result empty" id="wsRes">R1, R2 ve R3 değerlerini gir.</div>
        </div>
      </div>
    </div>

    <div class="tool wide">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--green-soft);border-color:var(--green)">Σ</div>
        <div><div class="tool-title">Süperpozisyon Hesabı</div><div class="tool-formula">V<sub>A</sub> = V<sub>A1</sub>(V₂=0) + V<sub>A2</sub>(V₁=0)</div></div>
      </div>
      <div class="scm-layout">
        <div class="scm-stage"><div id="supSvg"></div></div>
        <div>
          <div class="field-row">
            <div class="field"><label class="label">V1 (V)</label><input class="input" id="supV1" type="number" placeholder="Kaynak 1" oninput="supCalc()"></div>
            <div class="field"><label class="label">V2 (V) opsiyonel</label><input class="input" id="supV2" type="number" placeholder="Kaynak 2 (0 V)" oninput="supCalc()"></div>
          </div>
          <div class="field-row">
            <div class="field"><label class="label">R1 (Ω)</label><input class="input" id="supR1" type="number" placeholder="Ör: 1000" oninput="supCalc()"></div>
            <div class="field"><label class="label">R2 (Ω)</label><input class="input" id="supR2" type="number" placeholder="Ör: 2200" oninput="supCalc()"></div>
            <div class="field"><label class="label">R3 (Ω)</label><input class="input" id="supR3" type="number" placeholder="Ör: 3300" oninput="supCalc()"></div>
          </div>
          <div class="result empty" id="supRes">V1, R1, R2, R3 zorunlu; V2 opsiyonel (0 V varsayılır).</div>
        </div>
      </div>
    </div>

    <div class="tool wide">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--spark-soft);border-color:var(--spark)">555</div>
        <div><div class="tool-title">555 Zamanlayıcı</div><div class="tool-formula">Astable / Monostable · frekans & duty cycle</div></div>
      </div>
      <div class="seg" id="t555Seg" style="margin-bottom:14px">
        <div class="seg-opt active" data-m="astable" onclick="timer555SetMode('astable')">Astable (salınım)</div>
        <div class="seg-opt" data-m="mono" onclick="timer555SetMode('mono')">Monostable (tek darbe)</div>
      </div>
      <div id="t555AstableFields">
        <div class="field-row">
          <div class="field"><label class="label">Ra (Ω)</label><input class="input" id="t555Ra" type="number" placeholder="Ör: 10000" oninput="timer555Calc()"></div>
          <div class="field"><label class="label">Rb (Ω)</label><input class="input" id="t555Rb" type="number" placeholder="Ör: 4700" oninput="timer555Calc()"></div>
          <div class="field"><label class="label">C (µF)</label><input class="input" id="t555C" type="number" placeholder="Ör: 0.1" oninput="timer555Calc()"></div>
        </div>
      </div>
      <div id="t555MonoFields" style="display:none">
        <div class="field-row">
          <div class="field"><label class="label">R (Ω)</label><input class="input" id="t555Rm" type="number" placeholder="Ör: 10000" oninput="timer555Calc()"></div>
          <div class="field"><label class="label">C (µF)</label><input class="input" id="t555Cm" type="number" placeholder="Ör: 1" oninput="timer555Calc()"></div>
        </div>
      </div>
      <div class="result empty" id="t555Res">Ra, Rb ve C değerlerini gir.</div>
    </div>

    <div class="tool wide">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--green-soft);border-color:var(--green)">RC</div>
        <div><div class="tool-title">RC Filtre</div><div class="tool-formula">f<sub>c</sub> = 1/(2πRC) &nbsp;·&nbsp; LP / HP / BP</div></div>
      </div>
      <div class="seg" id="rcfSeg" style="margin-bottom:14px">
        <div class="seg-opt active" data-m="lp" onclick="rcFiltSetMode('lp')">Alçak Geçiren (LP)</div>
        <div class="seg-opt" data-m="hp" onclick="rcFiltSetMode('hp')">Yüksek Geçiren (HP)</div>
        <div class="seg-opt" data-m="bp" onclick="rcFiltSetMode('bp')">Bant Geçiren (BP)</div>
      </div>
      <div class="field-row">
        <div class="field"><label class="label">R (Ω)</label><input class="input" id="rcfR" type="number" placeholder="Ör: 1000" oninput="rcFiltCalc()"></div>
        <div class="field"><label class="label">C (µF)</label><input class="input" id="rcfC" type="number" placeholder="Ör: 0.1" oninput="rcFiltCalc()"></div>
      </div>
      <div class="result empty" id="rcfRes">R ve C değerlerini gir.</div>
    </div>

    <div class="tool wide">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--violet-soft);border-color:var(--violet)">⇄</div>
        <div><div class="tool-title">Birim Çevirici</div><div class="tool-formula">Gerilim · Akım · Direnç · Güç · Frekans · Kapasite · Endüktans</div></div>
      </div>
      <div class="seg" id="unitCatSeg" style="margin-bottom:14px;flex-wrap:wrap">
        <div class="seg-opt active" data-c="gerilim" onclick="unitSetCat('gerilim')">Gerilim</div>
        <div class="seg-opt" data-c="akim" onclick="unitSetCat('akim')">Akım</div>
        <div class="seg-opt" data-c="direnc" onclick="unitSetCat('direnc')">Direnç</div>
        <div class="seg-opt" data-c="guc" onclick="unitSetCat('guc')">Güç</div>
        <div class="seg-opt" data-c="frekans" onclick="unitSetCat('frekans')">Frekans</div>
        <div class="seg-opt" data-c="kapasite" onclick="unitSetCat('kapasite')">Kapasite</div>
        <div class="seg-opt" data-c="induktans" onclick="unitSetCat('induktans')">Endüktans</div>
      </div>
      <div class="field-row">
        <div class="field"><label class="label">Değer</label><input class="input" id="unitVal" type="number" step="any" placeholder="Ör: 1000" oninput="unitConvert()"></div>
        <div class="field"><label class="label">Birimden</label><select class="input select" id="unitFrom" onchange="unitConvert()"></select></div>
        <div class="field"><label class="label">Birime</label><select class="input select" id="unitTo" onchange="unitConvert()"></select></div>
      </div>
      <div class="result empty" id="unitRes">Çevirmek istediğin değeri gir.</div>
    </div>

    <div class="tool wide">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--violet-soft);border-color:var(--violet)">Ny</div>
        <div><div class="tool-title">Örnekleme (Nyquist)</div><div class="tool-formula">f<sub>s</sub> ≥ 2·f<sub>max</sub> &nbsp;·&nbsp; aliasing sınırı</div></div>
      </div>
      <div class="seg" id="nyqSeg" style="margin-bottom:14px">
        <div class="seg-opt active" data-m="sig2samp" onclick="nyqSetMode('sig2samp')">Sinyal → Örnekleme hızı</div>
        <div class="seg-opt" data-m="samp2sig" onclick="nyqSetMode('samp2sig')">Örnekleme → Max sinyal</div>
      </div>
      <div id="nyqFieldsSig">
        <div class="field"><label class="label">Sinyal frekansı (Hz)</label><input class="input" id="nyqSig" type="number" placeholder="Ör: 1000" oninput="nyqCalc()"></div>
      </div>
      <div id="nyqFieldsSamp" style="display:none">
        <div class="field"><label class="label">Örnekleme frekansı fs (Hz)</label><input class="input" id="nyqSamp" type="number" placeholder="Ör: 44100" oninput="nyqCalc()"></div>
      </div>
      <div class="result empty" id="nyqRes">Frekans değerini gir.</div>
    </div>

    <div class="tool wide">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--acc-soft);border-color:var(--acc-line)">SNR</div>
        <div><div class="tool-title">SNR Hesabı</div><div class="tool-formula">10·log(P₂/P₁) &nbsp;·&nbsp; 20·log(V₂/V₁) &nbsp;·&nbsp; ENOB</div></div>
      </div>
      <div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap">
        <div class="seg" id="snrTypeSeg">
          <div class="seg-opt active" data-t="power" onclick="snrSetType('power')">Güç (×10)</div>
          <div class="seg-opt" data-t="voltage" onclick="snrSetType('voltage')">Gerilim (×20)</div>
        </div>
        <div class="seg" id="snrSeg">
          <div class="seg-opt active" data-m="ratio2db" onclick="snrSetMode('ratio2db')">Oran → dB</div>
          <div class="seg-opt" data-m="db2ratio" onclick="snrSetMode('db2ratio')">dB → Oran</div>
        </div>
      </div>
      <div id="snrFieldsRatio">
        <div class="field"><label class="label">Sinyal / Gürültü oranı</label><input class="input" id="snrRatio" type="number" step="any" placeholder="Ör: 100" oninput="snrCalc()"></div>
      </div>
      <div id="snrFieldsDb" style="display:none">
        <div class="field"><label class="label">SNR (dB)</label><input class="input" id="snrDb" type="number" step="any" placeholder="Ör: 40" oninput="snrCalc()"></div>
      </div>
      <div class="result empty" id="snrRes">Oran veya dB değerini gir.</div>
    </div>

    <div class="tool wide">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--spark-soft);border-color:var(--spark)">01</div>
        <div><div class="tool-title">Sayı Sistemi Çevirici</div><div class="tool-formula">DEC · BIN · OCT · HEX arası</div></div>
      </div>
      <div class="field-row">
        <div class="field"><label class="label">Değer</label><input class="input" id="numInput" placeholder="Ör: 255" oninput="numConvCalc()"></div>
        <div class="field"><label class="label">Giriş tabanı</label>
          <select class="input select" id="numBase" onchange="numConvCalc()">
            <option value="10">10 — Decimal</option>
            <option value="2">2 — Binary</option>
            <option value="8">8 — Octal</option>
            <option value="16">16 — Hexadecimal</option>
          </select>
        </div>
      </div>
      <div class="result empty" id="numRes">Değeri gir.</div>
    </div>

    <div class="tool wide">
      <div class="tool-head">
        <div class="tool-ico" style="background:var(--green-soft);border-color:var(--green)">⊕</div>
        <div><div class="tool-title">Mantık Kapısı Tablosu</div><div class="tool-formula">AND · OR · NAND · NOR · XOR · XNOR · NOT</div></div>
      </div>
      <div class="seg" id="gateSeg" style="margin-bottom:14px;flex-wrap:wrap">
        <div class="seg-opt active" data-g="AND"  onclick="gateSetSel('AND')">AND</div>
        <div class="seg-opt"        data-g="OR"   onclick="gateSetSel('OR')">OR</div>
        <div class="seg-opt"        data-g="NAND" onclick="gateSetSel('NAND')">NAND</div>
        <div class="seg-opt"        data-g="NOR"  onclick="gateSetSel('NOR')">NOR</div>
        <div class="seg-opt"        data-g="XOR"  onclick="gateSetSel('XOR')">XOR</div>
        <div class="seg-opt"        data-g="XNOR" onclick="gateSetSel('XNOR')">XNOR</div>
        <div class="seg-opt"        data-g="NOT"  onclick="gateSetSel('NOT')">NOT</div>
      </div>
      <div id="gateRes" class="result empty">Kapı seçiliyor…</div>
    </div>`;

  RC_BANDS = 5;
  initRc();
  ganoReset();
  drawVdiv(); drawLed(); drawTau(); drawDb(); drawOpamp(); drawTrafo(); drawPf(); drawKirch();
  thCalc(); wsCalc(); drawSup(null, null, null, false);
  nyqCalc(); snrCalc(); numConvCalc(); buildGateTable();
  timer555Calc();
  rcFiltCalc();
  buildUnitSelects();
  unitConvert();
}
