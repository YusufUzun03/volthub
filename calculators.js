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
    </div>`;
  RC_BANDS = 5;
  initRc();
  ganoReset();
  drawVdiv(); drawLed(); drawTau(); drawDb(); drawOpamp(); drawTrafo(); drawPf(); drawKirch();
}
