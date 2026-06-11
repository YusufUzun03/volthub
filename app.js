/* ═══════════════════════════════════════════════════════════
   VOLTHUB — APP
   State, navigation, rendering, interactions. Vanilla JS,
   localStorage-backed (no external backend). Seed data is
   merged with the user's own uploads / likes / saves.
═══════════════════════════════════════════════════════════ */

const LS = {
  get(k, d) { try { return JSON.parse(localStorage.getItem('vh_' + k)) ?? d; } catch { return d; } },
  set(k, val) { try { localStorage.setItem('vh_' + k, JSON.stringify(val)); } catch {} },
};

const STATE = {
  me: LS.get('me', { id: 'me', name: 'Misafir Öğrenci', year: 3, avatar: 'a1' }),
  myFiles: LS.get('myFiles', []),
  likes: new Set(LS.get('likes', [])),
  saves: new Set(LS.get('saves', [])),
  votes: new Set(LS.get('votes', [])),
  reqs: LS.get('reqs', []),
  filter: 'hepsi',
  ders: null,
  sort: 'new',
  page: 'anasayfa',
  yearFilter: null,
  extFilter:  null,
};

let DB_REQS = [];
let DB_FILES = [];
let DB_LEADERBOARD = [];

function allFiles() { return DB_FILES; }
function allReqs() {
  const localReqs = SB_USER ? [] : STATE.reqs;
  return [...localReqs, ...DB_REQS];
}
function profileOf(uid) {
  if (uid === 'me') return STATE.me;
  const lb = DB_LEADERBOARD.find(p => p.id === uid);
  if (lb) return { id: uid, name: lb.name, avatar: lb.avatar };
  return { id: uid, name: 'Bilinmeyen', avatar: 'a8' };
}
function dersOf(id) { return DERSLER.find(d => d.id === id); }
function esc(s) { return (s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function timeAgo(t) {
  const s = (Date.now() - t) / 1000;
  if (s < 60) return 'az önce';
  if (s < 3600) return Math.floor(s / 60) + ' dk önce';
  if (s < 86400) return Math.floor(s / 3600) + ' saat önce';
  const d = Math.floor(s / 86400);
  if (d < 30) return d + ' gün önce';
  return Math.floor(d / 30) + ' ay önce';
}

/* ── ICONS (inline SVG) ── */
const ICON = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.5-1.5 3-3.4 3-5.5A4.5 4.5 0 0 0 12 5 4.5 4.5 0 0 0 2 8.5c0 2.1 1.5 4 3 5.5l7 7 7-7Z"/></svg>',
  heartFill: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 14c1.5-1.5 3-3.4 3-5.5A4.5 4.5 0 0 0 12 5 4.5 4.5 0 0 0 2 8.5c0 2.1 1.5 4 3 5.5l7 7 7-7Z"/></svg>',
  bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
  bookmarkFill: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
  ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10l9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/></svg>',
  tool: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.3L3 18v3h3l6.4-6.3a4 4 0 0 0 5.3-5.4l-2.9 2.9-2-2z"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0M17 6a3 3 0 0 1 0 6M22 20a6 6 0 0 0-4-5.6"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
};

const ADMIN_COLOR = '#111';

function avatarHTML(uid, size = 'md') {
  const p = profileOf(uid);
  const isAdmin = uid === 'me' && STATE.me.is_admin;
  const col = isAdmin ? ADMIN_COLOR : (AV_COLORS[p.avatar] || AV_COLORS.a1);
  const inner = isAdmin ? '⚡' : esc((p.name || '?')[0]);
  return `<div class="avatar ${size}" style="background:${col};font-style:normal">${inner}</div>`;
}

/* ═══════════ NAVIGATION ═══════════ */
function goTo(page, scroll = true) {
  STATE.page = page;
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === 'page-' + page));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.page === page));
  document.querySelectorAll('.mn-item').forEach(l => l.classList.toggle('active', l.dataset.page === page));
  clearSearch();
  if (page === 'dersler') renderDersPage();
  if (page === 'topluluk') { renderLeaderboard(); loadDbLeaderboard(); }
  if (page === 'istekler') { renderRequests(); loadDbReqs(); }
  if (page === 'profil') renderProfile();
  if (page === 'admin') renderAdmin();
  if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ═══════════ STATS / HERO ═══════════ */
function renderStats() {
  const files = allFiles();
  setText('statFiles', files.length || '—');
  setText('statUsers', DB_LEADERBOARD.length || '—');
}
function setText(id, t) { const el = document.getElementById(id); if (el) el.textContent = t; }

/* ═══════════ SIDEBAR ═══════════ */
function renderSidebar() {
  const files = allFiles();
  const count = t => t === 'hepsi' ? files.length : files.filter(f => f.type === t).length;
  const typeItems = [['hepsi', '📚', 'Tümü'], ...Object.entries(TYPE_CFG).map(([k, c]) => [k, c.icon, c.label])];
  document.getElementById('sbTypes').innerHTML = typeItems.map(([k, ic, label]) =>
    `<div class="sb-item ${STATE.filter === k && !STATE.ders ? 'active' : ''}" onclick="setFilter('${k}')">
      <span class="si-ico">${ic}</span><span class="si-name">${label}</span><span class="sb-count">${count(k)}</span>
    </div>`).join('');

  // courses grouped by semester
  const sems = [...new Set(DERSLER.map(d => d.sem))].sort((a, b) => a - b);
  document.getElementById('sbCourses').innerHTML = sems.map(s => `
    <div class="sb-sem">${SEM_LABEL[s]}</div>
    ${DERSLER.filter(d => d.sem === s).map(d => {
      const c = files.filter(f => f.ders === d.id).length;
      return `<div class="sb-item ${STATE.ders === d.id ? 'active' : ''}" onclick="setDers('${d.id}')" title="${esc(d.name)}">
        <span class="si-code">${d.code}</span><span class="si-name">${esc(shortName(d.name))}</span><span class="sb-count">${c}</span>
      </div>`;
    }).join('')}
  `).join('');

  // year filter
  const years = [...new Set(files.map(f => new Date(f.t).getFullYear()))].sort((a, b) => b - a);
  const sbYear = document.getElementById('sbYear');
  if (sbYear) {
    sbYear.innerHTML = [
      `<div class="sb-item ${!STATE.yearFilter ? 'active' : ''}" onclick="setYearFilter(null)"><span class="si-ico">📅</span><span class="si-name">Tüm Yıllar</span></div>`,
      ...years.map(y => `<div class="sb-item ${STATE.yearFilter === y ? 'active' : ''}" onclick="setYearFilter(${y})">
        <span class="si-ico">📅</span><span class="si-name">${y}</span>
        <span class="sb-count">${files.filter(f => new Date(f.t).getFullYear() === y).length}</span>
      </div>`),
    ].join('');
  }

  // extension filter
  const EXT_GROUPS = [
    { k: 'pdf', ic: '📄', label: 'PDF',    exts: ['pdf'] },
    { k: 'doc', ic: '📝', label: 'Word',   exts: ['doc','docx'] },
    { k: 'ppt', ic: '📊', label: 'Sunum',  exts: ['ppt','pptx'] },
    { k: 'img', ic: '🖼️', label: 'Resim', exts: ['png','jpg','jpeg','gif','webp','svg'] },
  ];
  const sbExt = document.getElementById('sbExt');
  if (sbExt) {
    sbExt.innerHTML = [
      `<div class="sb-item ${!STATE.extFilter ? 'active' : ''}" onclick="setExtFilter(null)"><span class="si-ico">📋</span><span class="si-name">Tüm Uzantılar</span></div>`,
      ...EXT_GROUPS.map(g => {
        const c = files.filter(f => g.exts.includes(f.ext)).length;
        if (!c) return '';
        return `<div class="sb-item ${STATE.extFilter === g.k ? 'active' : ''}" onclick="setExtFilter('${g.k}')">
          <span class="si-ico">${g.ic}</span><span class="si-name">${g.label}</span><span class="sb-count">${c}</span>
        </div>`;
      }),
    ].join('');
  }
}
function shortName(n) { return n.length > 22 ? n.slice(0, 20) + '…' : n; }

function setFilter(t) { STATE.filter = t; STATE.ders = null; goTo('anasayfa', false); renderSidebar(); renderArchive(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function setDers(id) { STATE.ders = id; STATE.filter = 'hepsi'; goTo('anasayfa', false); renderSidebar(); renderArchive(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function setSort(s) { STATE.sort = s; renderArchive(); }
function setYearFilter(y) { STATE.yearFilter = y; renderSidebar(); renderArchive(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function setExtFilter(e) { STATE.extFilter = e; renderSidebar(); renderArchive(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

/* ═══════════ ARCHIVE (main feed) ═══════════ */
const EXT_MAP = { pdf:['pdf'], doc:['doc','docx'], ppt:['ppt','pptx'], img:['png','jpg','jpeg','gif','webp','svg'] };

function renderArchive() {
  let files = allFiles();
  if (STATE.ders)       files = files.filter(f => f.ders === STATE.ders);
  if (STATE.filter !== 'hepsi') files = files.filter(f => f.type === STATE.filter);
  if (STATE.yearFilter) files = files.filter(f => new Date(f.t).getFullYear() === STATE.yearFilter);
  if (STATE.extFilter)  files = files.filter(f => (EXT_MAP[STATE.extFilter] || []).includes(f.ext));
  files = sortFiles(files);

  // ders detail header
  const dh = document.getElementById('dersHead');
  if (STATE.ders) {
    const d = dersOf(STATE.ders);
    dh.innerHTML = `<div class="ders-detail fade-up">
      <div class="ders-detail-top">
        <div class="ders-detail-ico" style="background:oklch(0.95 0.04 ${d.tint});border:1px solid oklch(0.85 0.07 ${d.tint})">${d.icon}</div>
        <div>
          <div class="ders-detail-code">${d.code} · ${SEM_LABEL[d.sem]}</div>
          <h2>${esc(d.name)}</h2>
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-left:auto" onclick="setDers2null()">← Tüm dersler</button>
      </div>
      <div class="topics">
        ${(TOPICS[d.id] || []).map((t, i) => `<span class="topic"><span class="topic-n">${String(i + 1).padStart(2, '0')}</span>${esc(t)}</span>`).join('')}
      </div>
    </div>`;
  } else dh.innerHTML = '';

  // chips
  document.querySelectorAll('#chips .chip').forEach(c => c.classList.toggle('active', c.dataset.t === STATE.filter));

  setText('gridTitle', STATE.ders ? dersOf(STATE.ders).code + ' Kaynakları' : (STATE.filter === 'hepsi' ? 'Son Yüklenenler' : TYPE_CFG[STATE.filter].label));
  setText('gridCount', files.length + ' kaynak');

  const grid = document.getElementById('mainGrid');
  if (!files.length) {
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="empty-ico">📭</div>
      <div class="empty-title">Henüz kaynak yok</div>
      <div class="empty-sub">Bu filtre için ilk yükleyen sen ol — notunu, sınavını veya formül kağıdını paylaş.</div></div>`;
    return;
  }
  grid.innerHTML = files.map(cardHTML).join('');
}

function sortFiles(files) {
  const arr = [...files];
  if (STATE.sort === 'new') arr.sort((a, b) => b.t - a.t);
  else if (STATE.sort === 'old') arr.sort((a, b) => a.t - b.t);
  else if (STATE.sort === 'dl') arr.sort((a, b) => b.dls - a.dls);
  else if (STATE.sort === 'like') arr.sort((a, b) => likeCount(b) - likeCount(a));
  return arr;
}
function likeCount(f) { return f.likes + (STATE.likes.has(f.id) ? 1 : 0); }

function cardHTML(f) {
  const d = dersOf(f.ders);
  const tc = TYPE_CFG[f.type];
  const liked = STATE.likes.has(f.id);
  const saved = STATE.saves.has(f.id);
  return `<div class="rcard fade-up" onclick="openDetail('${f.id}')">
    <span class="type-pill ${tc.cls}">${tc.label}</span>
    <div class="rcard-top">
      <div class="rcard-ico">${tc.icon}</div>
      <div style="min-width:0;flex:1">
        <div class="rcard-code">${d ? d.code : 'GENEL'}</div>
        <div class="rcard-title">${esc(f.title)}</div>
      </div>
    </div>
    <div class="rcard-desc">${esc(f.desc)}</div>
    ${f.tags && f.tags.length ? `<div class="rcard-tags">${f.tags.slice(0, 4).map(t => `<span class="rtag">#${esc(t)}</span>`).join('')}</div>` : ''}
    <div class="rcard-foot" onclick="event.stopPropagation()">
      <div class="rcard-meta act ${liked ? 'liked' : ''}" onclick="toggleLike('${f.id}',this)">${liked ? ICON.heartFill : ICON.heart}<span>${likeCount(f)}</span></div>
      <div class="rcard-meta">${ICON.down}<span>${f.dls}</span></div>
      <div class="rcard-meta act" onclick="toggleSave('${f.id}',this)" style="${saved ? 'color:var(--acc)' : ''}">${saved ? ICON.bookmarkFill : ICON.bookmark}</div>
      <div class="rcard-author">${avatarHTML(f.uid, 'xs')}<span class="av-name">${esc((f.uname || profileOf(f.uid).name).split(' ')[0])}</span></div>
    </div>
  </div>`;
}
function setDers2null() { STATE.ders = null; renderSidebar(); renderArchive(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

/* ── Trend strip ── */
function renderTrend() {
  const files = allFiles();
  const topDl = [...files].sort((a, b) => b.dls - a.dls)[0];
  const newest = [...files].sort((a, b) => b.t - a.t)[0];
  const topLiked = [...files].sort((a, b) => likeCount(b) - likeCount(a))[0];
  const items = [
    ['📈', files.reduce((a, f) => a + f.dls, 0).toLocaleString('tr-TR'), 'Toplam indirme', '250'],
    ['🔥', topDl ? topDl.dls : 0, 'En çok indirilen kaynak', '25'],
    ['🆕', newest ? timeAgo(newest.t) : '—', 'Son yükleme', '155'],
    ['⭐', topLiked ? likeCount(topLiked) : 0, 'En beğenilen kaynak', '68'],
  ];
  document.getElementById('trend').innerHTML = items.map(([ic, v, l, tint]) =>
    `<div class="trend-card fade-up">
      <div class="trend-ico" style="background:oklch(0.95 0.04 ${tint});border:1px solid oklch(0.87 0.06 ${tint})">${ic}</div>
      <div><div class="trend-v">${v}</div><div class="trend-l">${l}</div></div>
    </div>`).join('');
}

/* ═══════════ DERSLER PAGE ═══════════ */
function renderDersPage() {
  const files = allFiles();
  const sems = [...new Set(DERSLER.map(d => d.sem))].sort((a, b) => a - b);
  document.getElementById('dersGrid').innerHTML = sems.map(s => `
    <div class="ders-sem">
      <div class="ders-sem-label">${SEM_LABEL[s]}</div>
      <div class="dgrid">
        ${DERSLER.filter(d => d.sem === s).map(d => {
          const c = files.filter(f => f.ders === d.id).length;
          return `<div class="dcard fade-up" onclick="setDers('${d.id}')">
            <div class="dcard-head">
              <div class="dcard-ico" style="background:oklch(0.95 0.04 ${d.tint});border:1px solid oklch(0.86 0.07 ${d.tint})">${d.icon}</div>
              <div class="dcard-code">${d.code}</div>
            </div>
            <div class="dcard-name">${esc(d.name)}</div>
            <div class="dcard-desc">${esc(d.desc)}</div>
            <div class="dcard-foot"><span>${(TOPICS[d.id] || []).length} konu başlığı</span><span class="dcard-count">${c} kaynak →</span></div>
          </div>`;
        }).join('')}
      </div>
    </div>`).join('');
}

/* ═══════════ LEADERBOARD ═══════════ */
function renderLeaderboard() {
  if (!DB_LEADERBOARD.length) {
    document.getElementById('lbList').innerHTML = `<div class="empty"><div class="empty-ico">⏳</div><div class="empty-title">Yükleniyor…</div></div>`;
    return;
  }
  const rows = DB_LEADERBOARD.map(p => ({
    ...p,
    score: p.uploads * 5 + p.likes * 2 + p.dls,
    isMe: SB_USER && p.id === SB_USER.id,
  })).sort((a, b) => b.score - a.score);
  document.getElementById('lbList').innerHTML = rows.map((p, i) => {
    const b = badgeFor(p.score);
    const isAdmin = p.isMe ? STATE.me.is_admin : p.is_admin;
    const col = isAdmin ? ADMIN_COLOR : (AV_COLORS[p.isMe ? STATE.me.avatar : (p.avatar || 'a1')] || AV_COLORS.a1);
    const av = `<div class="avatar md" style="background:${col};font-style:normal">${isAdmin ? '⚡' : esc(((p.isMe ? STATE.me.name : p.name) || '?')[0])}</div>`;
    const adminBadge = isAdmin ? `<span class="badge sm" style="color:oklch(0.48 0.18 75);border-color:oklch(0.70 0.22 82);background:oklch(0.96 0.07 85)"><span class="badge-ico">👑</span>Kurucu</span> ` : '';
    return `<div class="lb-row ${i === 0 ? 'top1' : ''} fade-up">
      <div class="lb-rank">${i + 1}</div>
      ${av}
      <div class="lb-info">
        <div class="lb-name">${esc(p.isMe ? STATE.me.name : p.name)}${p.isMe ? ' <span class="tag" style="font-size:9px;padding:2px 7px">sen</span>' : ''}</div>
        <div class="lb-sub">${adminBadge}<span class="badge sm" style="color:${b.color};border-color:${b.color};background:${b.soft}"><span class="badge-ico">${b.icon}</span>${b.name}</span> · ${p.year === 'mezun' ? 'Mezun' : p.year + '. sınıf'}</div>
      </div>
      <div class="lb-bars">
        <div class="lb-bar"><div class="lb-bar-v">${p.uploads}</div><div class="lb-bar-l">yükleme</div></div>
        <div class="lb-bar"><div class="lb-bar-v">${p.likes}</div><div class="lb-bar-l">beğeni</div></div>
        <div class="lb-bar"><div class="lb-bar-v">${p.dls}</div><div class="lb-bar-l">indirme</div></div>
      </div>
      <div class="lb-score">${p.score}<span>puan</span></div>
    </div>`;
  }).join('');
}

async function loadDbLeaderboard() {
  try { DB_LEADERBOARD = await sbGetLeaderboard(); } catch { DB_LEADERBOARD = []; }
  if (STATE.page === 'topluluk') renderLeaderboard();
  renderStats();
}

async function loadDbFiles() {
  try { DB_FILES = await sbGetAllPublicFiles(); } catch { DB_FILES = []; }
}

/* ═══════════ LINKS (kaynaklar) ═══════════ */
function renderLinks() {
  document.getElementById('linkSections').innerHTML = LINKS.map(sec => `
    <div class="link-sec">
      <div class="link-sec-title">${sec.title}</div>
      <div class="link-grid">
        ${sec.items.map(l => `<a class="lcard fade-up" href="${l.u}" target="_blank" rel="noopener">
          <div class="lcard-ico">${l.ic}</div>
          <div style="min-width:0"><div class="lcard-name">${esc(l.n)} ${ICON.ext}</div><div class="lcard-desc">${esc(l.d)}</div></div>
        </a>`).join('')}
      </div>
    </div>`).join('');
}

/* ═══════════ REQUESTS ═══════════ */
function renderRequests() {
  // fill ders select
  const sel = document.getElementById('reqDers');
  if (sel && sel.options.length <= 1)
    sel.innerHTML = '<option value="">Genel</option>' + DERSLER.map(d => `<option value="${d.id}">${d.code} — ${esc(shortName(d.name))}</option>`).join('');
  const reqs = allReqs().sort((a, b) => (b.votes + (STATE.votes.has(b.id) ? 1 : 0)) - (a.votes + (STATE.votes.has(a.id) ? 1 : 0)));
  const list = document.getElementById('reqList');
  if (!reqs.length) { list.innerHTML = `<div class="empty"><div class="empty-ico">✅</div><div class="empty-title">Açık istek yok</div></div>`; return; }
  list.innerHTML = reqs.map(r => {
    const d = dersOf(r.ders);
    const voted = STATE.votes.has(r.id);
    const votes = r.votes + (voted ? 1 : 0);
    return `<div class="req fade-up">
      <div class="req-ico">📥</div>
      <div class="req-body">
        <div class="req-text">${esc(r.text)}</div>
        <div class="req-meta">${d ? `<span class="tag" style="font-size:10px;padding:2px 8px">${d.code}</span>` : ''}<span>${esc(r.uname || profileOf(r.uid).name)}</span><span>·</span><span>${timeAgo(r.t)}</span></div>
      </div>
      <div class="req-vote ${voted ? 'voted' : ''}" onclick="voteReq('${r.id}')">
        <div class="req-vote-n">${votes}</div><div class="req-vote-l">destek</div>
      </div>
    </div>`;
  }).join('');
}
async function voteReq(id) {
  const isDbReq = /^\d+$/.test(id);
  if (isDbReq && SB_USER) {
    const wasVoted = STATE.votes.has(id);
    if (wasVoted) STATE.votes.delete(id); else STATE.votes.add(id);
    // Optimistic update on the cached object
    const req = DB_REQS.find(r => r.id === id);
    if (req) req.votes += wasVoted ? -1 : 1;
    renderRequests();
    try {
      await sbToggleVote(id);
    } catch {
      // Rollback
      if (wasVoted) STATE.votes.add(id); else STATE.votes.delete(id);
      if (req) req.votes += wasVoted ? 1 : -1;
      renderRequests();
      toast('Hata oluştu, tekrar dene', '❌');
    }
  } else {
    if (STATE.votes.has(id)) STATE.votes.delete(id); else STATE.votes.add(id);
    LS.set('votes', [...STATE.votes]);
    renderRequests();
  }
}

async function createRequest() {
  const text = document.getElementById('reqText').value.trim();
  if (!text) { toast('Lütfen ne aradığını yaz', '✏️'); return; }
  const ders = document.getElementById('reqDers').value;

  if (SB_USER) {
    try {
      const newReq = await sbCreateRequest(text, ders);
      DB_REQS.unshift(newReq);
      document.getElementById('reqText').value = '';
      renderRequests();
      toast('İsteğin panoya eklendi', '📥');
    } catch (e) {
      toast(e.message || 'Hata oluştu', '❌');
    }
  } else {
    toast('İstek oluşturmak için giriş yapman gerekiyor 🔐', '⚠️');
    openAuth();
  }
}

async function loadDbReqs() {
  try { DB_REQS = await sbGetAllRequests(); } catch { DB_REQS = []; }
  renderRequests();
}

/* ═══════════ PROFILE ═══════════ */
function myStats() {
  const myF = DB_FILES.filter(f => f.uid === 'me');
  const uploads = myF.length;
  const likesReceived = myF.reduce((a, f) => a + likeCount(f), 0);
  const dlsReceived = myF.reduce((a, f) => a + f.dls, 0);
  const score = uploads * 5 + likesReceived * 2 + dlsReceived;
  return {
    uploads, likesReceived, dlsReceived, score,
    saves: STATE.saves.size,
    likesGiven: STATE.likes.size,
    votes: STATE.votes.size,
    requests: DB_REQS.filter(r => r.uid === 'me').length + STATE.reqs.length,
  };
}

function renderProfile() {
  if (!STATE.me.bio) STATE.me.bio = '';
  const loggedIn = !!SB_USER;
  const displayName = loggedIn ? STATE.me.name : 'Misafir Öğrenci';
  const displayYear = loggedIn ? STATE.me.year : '?';
  const s = myStats();
  setText('profileName', displayName);
  setText('profileSub', 'Elektrik-Elektronik Müh. · ' + (displayYear === 'mezun' ? 'Mezun' : displayYear + '. Sınıf'));

  // badge
  const b = badgeFor(s.score);
  const adminBadgeHtml = STATE.me.is_admin
    ? `<span class="badge" style="color:oklch(0.48 0.18 75);border-color:oklch(0.70 0.22 82);background:oklch(0.96 0.07 85);font-weight:700"><span class="badge-ico">👑</span>Kurucu</span> `
    : '';
  document.getElementById('profileBadge').innerHTML =
    adminBadgeHtml + `<span class="badge" style="color:${b.color};border-color:${b.color};background:${b.soft}"><span class="badge-ico">${b.icon}</span>${b.name}</span>`;

  // avatar (editable)
  document.getElementById('profileAvatar').innerHTML = avatarHTML('me', 'xl') + `<div class="av-cam">✎</div>`;

  // bio
  renderBio();

  // tier progress
  const tp = document.getElementById('tierProg');
  if (b.next) {
    const span = b.next.min - b.min;
    const got = Math.min(s.score - b.min, span);
    const pct = Math.round((got / span) * 100);
    tp.innerHTML = `<div class="tier-prog-head"><span>Sonraki rozet: <b>${b.next.icon} ${b.next.name}</b></span><span class="mono">${s.score} / ${b.next.min} puan</span></div>
      <div class="tier-bar"><i style="width:${pct}%"></i></div>`;
  } else {
    tp.innerHTML = `<div class="tier-prog-head"><span>En yüksek rozete ulaştın 🎉</span><span class="mono">${s.score} puan</span></div>
      <div class="tier-bar"><i style="width:100%"></i></div>`;
  }

  // avatar picker (inside popover)
  document.getElementById('avPick').innerHTML = Object.entries(AV_COLORS)
    .filter(([k]) => k !== 'admin')
    .map(([k, col]) =>
      `<div class="av-opt ${STATE.me.avatar === k ? 'active' : ''}" style="background:${col}" onclick="setAvatar('${k}')">${esc(displayName[0])}</div>`).join('');

  // stats
  if (loggedIn) {
    setText('myUploads', s.uploads);
    setText('myLikesRec', s.likesReceived);
    setText('myDls', s.dlsReceived);
    setText('myScore', s.score);
  } else {
    ['myUploads', 'myLikesRec', 'myDls', 'myScore'].forEach(id => setText(id, '—'));
  }

  // achievements
  renderAchievements(s);

  // logout button (only for logged-in users)
  const logoutWrap = document.getElementById('logoutWrap');
  if (logoutWrap) {
    logoutWrap.innerHTML = SB_USER
      ? `<button class="btn btn-ghost btn-sm" style="color:var(--red)" onclick="sbSignOut()">Çıkış Yap</button>`
      : `<button class="btn btn-primary btn-sm" onclick="openAuth()">Giriş Yap</button>`;
  }

  const mine = DB_FILES.filter(f => f.uid === 'me');
  document.getElementById('myGrid').innerHTML = mine.length
    ? mine.map(cardHTML).join('')
    : `<div class="empty" style="grid-column:1/-1"><div class="empty-ico">📤</div><div class="empty-title">Henüz yükleme yok</div><div class="empty-sub">İlk kaynağını paylaş, topluluğa katkıda bulun.</div></div>`;

  const saved = allFiles().filter(f => STATE.saves.has(f.id));
  document.getElementById('savedGrid').innerHTML = saved.length
    ? saved.map(cardHTML).join('')
    : `<div class="empty" style="grid-column:1/-1"><div class="empty-ico">🔖</div><div class="empty-title">Kaydedilen kaynak yok</div><div class="empty-sub">Beğendiğin kaynakları kaydet, sonra buradan ulaş.</div></div>`;
}

function renderAchievements(s) {
  const earned = ACHIEVEMENTS.filter(a => s[a.metric] >= a.goal).length;
  setText('achSummary', '');
  document.getElementById('achSummary').innerHTML = `<b>${earned}</b> / ${ACHIEVEMENTS.length} açıldı`;
  document.getElementById('achGrid').innerHTML = ACHIEVEMENTS.map(a => {
    const cur = s[a.metric] || 0;
    const done = cur >= a.goal;
    const pct = Math.min(100, Math.round((cur / a.goal) * 100));
    return `<div class="ach ${done ? 'earned' : 'locked'}">
      ${done ? '<div class="ach-check">✓</div>' : ''}
      <div class="ach-ico">${a.icon}</div>
      <div style="min-width:0;flex:1">
        <div class="ach-name">${esc(a.name)}</div>
        <div class="ach-desc">${esc(a.desc)}</div>
        ${done ? '' : `<div class="ach-prog"><div class="tier-bar"><i style="width:${pct}%"></i></div><div class="ach-prog-lbl">${cur} / ${a.goal}</div></div>`}
      </div>
    </div>`;
  }).join('');
}

function renderBio() {
  const wrap = document.getElementById('bioWrap');
  const bio = STATE.me.bio;
  wrap.innerHTML = `<div class="profile-bio">${bio ? esc(bio) : '<span class="bio-empty">Henüz bir biyografi eklemedin.</span>'}
    <button class="edit-btn" onclick="editBio()" title="Biyografiyi düzenle" style="vertical-align:middle">✎</button></div>`;
}
function editBio() {
  const wrap = document.getElementById('bioWrap');
  wrap.innerHTML = `<div class="bio-edit">
    <textarea id="bioInput" maxlength="220" placeholder="Kendinden bahset — ilgi alanların, sınıfın, projelerin…">${esc(STATE.me.bio || '')}</textarea>
    <div class="bio-edit-actions">
      <button class="btn btn-primary btn-sm" onclick="saveBio()">Kaydet</button>
      <button class="btn btn-ghost btn-sm" onclick="renderBio()">Vazgeç</button>
    </div>
  </div>`;
  document.getElementById('bioInput').focus();
}
async function saveBio() {
  STATE.me.bio = document.getElementById('bioInput').value.trim();
  LS.set('me', STATE.me);
  if (SB_USER) {
    try { await sbUpdateProfile({ bio: STATE.me.bio }); } catch {}
  }
  renderBio();
  toast('Biyografi güncellendi', '📝');
}
async function editName() {
  const cur = STATE.me.name;
  const name = prompt('İsmini gir:', cur);
  if (name && name.trim()) {
    STATE.me.name = name.trim();
    LS.set('me', STATE.me);
    if (SB_USER) {
      try { await sbUpdateProfile({ name: STATE.me.name }); } catch {}
    }
    renderProfile(); renderTopbarAvatar();
    toast('İsmin güncellendi', '✏️');
  }
}
function toggleAvPop(e) {
  if (e) e.stopPropagation();
  document.getElementById('avPop').classList.toggle('open');
}
async function setAvatar(k) {
  STATE.me.avatar = k; LS.set('me', STATE.me);
  document.getElementById('avPop').classList.remove('open');
  if (SB_USER) {
    try { await sbUpdateProfile({ avatar: k }); } catch {}
  }
  renderProfile(); renderTopbarAvatar();
  toast('Avatar güncellendi', '🎨');
}
function renderTopbarAvatar() {
  const el = document.getElementById('navAvatar');
  if (!el) return;
  el.innerHTML = avatarHTML('me', 'md');
  el.style.cursor = 'pointer';
  el.onclick = () => goTo('profil');
}

/* ═══════════ LIKE / SAVE ═══════════ */
async function toggleLike(id, el) {
  const wasLiked = STATE.likes.has(id);
  if (wasLiked) STATE.likes.delete(id); else { STATE.likes.add(id); burst(el); }
  if (!SB_USER) LS.set('likes', [...STATE.likes]);
  renderArchive();
  if (document.getElementById('detailOverlay').classList.contains('open')) openDetail(id, true);
  if (SB_USER) {
    try { await sbToggleLike(id); }
    catch {
      // Rollback
      if (wasLiked) STATE.likes.add(id); else STATE.likes.delete(id);
      renderArchive();
    }
  }
}

async function toggleSave(id) {
  const wasSaved = STATE.saves.has(id);
  if (wasSaved) { STATE.saves.delete(id); toast('Kayıt kaldırıldı', '🔖'); }
  else { STATE.saves.add(id); toast('Kaydedildi', '🔖'); }
  if (!SB_USER) LS.set('saves', [...STATE.saves]);
  renderArchive();
  if (STATE.page === 'profil') renderProfile();
  if (SB_USER) {
    try { await sbToggleSave(id); }
    catch {
      // Rollback
      if (wasSaved) STATE.saves.add(id); else STATE.saves.delete(id);
      renderArchive();
    }
  }
}
function burst(el) { if (el) { el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'cubic-bezier(.34,1.56,.64,1)' }); } }

/* ═══════════ DETAIL MODAL ═══════════ */
async function openDetail(id, silent) {
  if (!SB_USER) { toast('Belgeyi görüntülemek için giriş yapman gerekiyor', '🔒'); openAuth(); return; }
  const f = allFiles().find(x => x.id === id);
  if (!f) return;
  const d = dersOf(f.ders);
  const tc = TYPE_CFG[f.type];
  const liked = STATE.likes.has(f.id);
  const saved = STATE.saves.has(f.id);

  // Build inline preview for stored files
  let previewHtml = '';
  if (f.fromDB && f.file_path) {
    const url = await sbGetDownloadUrl(f.file_path);
    if (url) {
      if (f.ext === 'pdf') {
        previewHtml = `<div class="preview-wrap">
          <iframe src="${url}" class="pdf-frame" title="${esc(f.title)}"></iframe>
          <div class="preview-hint">Kaydırmak için PDF içine tıkla · <a href="${url}" target="_blank" rel="noopener" style="color:var(--acc)">Yeni sekmede aç ↗</a></div>
        </div>`;
      } else if (['png','jpg','jpeg','gif','webp','svg'].includes(f.ext)) {
        previewHtml = `<div class="preview-wrap"><img src="${url}" class="preview-img" alt="${esc(f.title)}"></div>`;
      }
    }
  }

  document.getElementById('detailBody').innerHTML = `
    <div class="detail-head">
      <div class="detail-ico">${tc.icon}</div>
      <div style="min-width:0">
        <div class="rcard-code" style="margin-bottom:4px">${d ? d.code + ' · ' + esc(d.name) : 'Genel'}</div>
        <div class="detail-title">${esc(f.title)}</div>
      </div>
    </div>
    <p style="color:var(--ink-2);font-size:14px;line-height:1.6;margin-bottom:18px">${esc(f.desc)}</p>
    ${f.tags && f.tags.length ? `<div class="rcard-tags" style="margin-bottom:18px">${f.tags.map(t => `<span class="rtag">#${esc(t)}</span>`).join('')}</div>` : ''}
    <div>
      <div class="detail-row"><span class="dr-label">Tür</span><span class="type-pill ${tc.cls}" style="position:static">${tc.label}</span>${f.subtype ? `<span class="rtag">${esc(f.subtype)}</span>` : ''}</div>
      <div class="detail-row"><span class="dr-label">Paylaşan</span>${avatarHTML(f.uid, 'sm')}<span>${esc(f.uname || profileOf(f.uid).name)}</span></div>
      <div class="detail-row"><span class="dr-label">Yüklenme</span><span>${timeAgo(f.t)}</span></div>
      <div class="detail-row"><span class="dr-label">İstatistik</span><span class="mono" style="font-size:13px">${likeCount(f)} beğeni · ${f.dls} indirme</span></div>
      ${f.kind === 'link' ? `<div class="detail-row"><span class="dr-label">Bağlantı</span><a href="${f.url}" target="_blank" rel="noopener" style="color:var(--acc)">${esc(f.url)} ↗</a></div>` : `<div class="detail-row"><span class="dr-label">Dosya</span><span class="mono" style="font-size:13px">.${f.ext || 'pdf'}${f.size > 0 ? ' · ' + (f.size / 1048576).toFixed(2) + ' MB' : ''}</span></div>`}
    </div>
    ${previewHtml}
    <div class="detail-actions">
      <button class="btn btn-primary" onclick="downloadFile('${f.id}')">${ICON.down} ${f.kind === 'link' ? 'Bağlantıyı Aç' : 'İndir'}</button>
      <button class="btn btn-ghost" id="dLike" onclick="toggleLike('${f.id}',this)">${liked ? ICON.heartFill : ICON.heart} ${likeCount(f)}</button>
      <button class="btn btn-ghost" onclick="toggleSave('${f.id}');openDetail('${f.id}',true)">${saved ? ICON.bookmarkFill : ICON.bookmark} ${saved ? 'Kaydedildi' : 'Kaydet'}</button>
    </div>
    <div class="comments-section" id="commentsSec">
      <div class="comments-head">💬 Yorumlar</div>
      <div id="commentsList"><div class="loading" style="padding:20px 0">Yorumlar yükleniyor…</div></div>
      ${SB_USER ? `
        <div class="comment-form">
          <div class="comment-input-row">
            ${avatarHTML('me', 'sm')}
            <textarea class="input comment-textarea" id="commentInput" placeholder="Yorum ekle…" maxlength="500" rows="2"
              onkeydown="if(event.key==='Enter'&&(event.ctrlKey||event.metaKey))submitComment('${f.id}')"></textarea>
          </div>
          <div style="text-align:right;margin-top:8px">
            <button class="btn btn-primary btn-sm" onclick="submitComment('${f.id}')">Gönder</button>
          </div>
        </div>` :
        `<div class="comment-login">Yorum yazmak için <a href="#" onclick="closeDetail();openAuth();return false" style="color:var(--acc)">giriş yap</a></div>`
      }
    </div>`;

  if (!silent) document.getElementById('detailOverlay').classList.add('open');

  // Load comments async
  if (f.fromDB) {
    try {
      const comments = await sbGetComments(f.id);
      renderCommentsList(comments, f.id);
    } catch {
      const el = document.getElementById('commentsList');
      if (el) el.innerHTML = '';
    }
  } else {
    const el = document.getElementById('commentsList');
    if (el) el.innerHTML = '';
  }
}

/* ─── Comments ─── */
function nameColor(name) {
  const keys = Object.keys(AV_COLORS);
  const idx = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % keys.length;
  return AV_COLORS[keys[idx]];
}

function renderCommentsList(comments, fileId) {
  const el = document.getElementById('commentsList');
  if (!el) return;
  if (!comments.length) {
    el.innerHTML = '<div class="comment-empty">Henüz yorum yok. İlk yorumu sen yaz!</div>';
    return;
  }
  el.innerHTML = comments.map(c => {
    const col = nameColor(c.user_name);
    const canDel = SB_USER && (c.user_id === SB_USER.id || SB_PROFILE?.is_admin);
    return `<div class="comment" id="cmt-${c.id}">
      <div class="avatar sm" style="background:${col};flex-shrink:0">${esc((c.user_name || '?')[0])}</div>
      <div class="comment-body">
        <div class="comment-meta">
          <span class="comment-name">${esc(toTitleCase(c.user_name) || 'Anonim')}</span>
          <span class="comment-time">${timeAgo(new Date(c.created_at).getTime())}</span>
          ${canDel ? `<button class="comment-del" onclick="deleteComment(${c.id},'${fileId}')">✕</button>` : ''}
        </div>
        <div class="comment-text">${esc(c.body)}</div>
      </div>
    </div>`;
  }).join('');
}

async function submitComment(fileId) {
  if (!SB_USER) { openAuth(); return; }
  const input = document.getElementById('commentInput');
  const body  = input?.value.trim();
  if (!body) { toast('Yorum boş olamaz', '⚠️'); return; }
  const btn = document.querySelector('#commentsSec .btn-primary');
  if (btn) { btn.disabled = true; btn.textContent = '…'; }
  try {
    await sbAddComment(fileId, body);
    if (input) input.value = '';
    const comments = await sbGetComments(fileId);
    renderCommentsList(comments, fileId);
  } catch (e) {
    toast('Hata: ' + (e.message || 'Bilinmeyen'), '❌');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Gönder'; }
  }
}

async function deleteComment(commentId, fileId) {
  try {
    await sbDeleteComment(commentId);
    document.getElementById('cmt-' + commentId)?.remove();
    const el = document.getElementById('commentsList');
    if (el && !el.querySelector('.comment')) {
      el.innerHTML = '<div class="comment-empty">Henüz yorum yok. İlk yorumu sen yaz!</div>';
    }
  } catch { toast('Hata', '❌'); }
}
function closeDetail() { document.getElementById('detailOverlay').classList.remove('open'); }
function openTerms()   { document.getElementById('termsOverlay')?.classList.add('open'); }
function closeTerms()  { document.getElementById('termsOverlay')?.classList.remove('open'); }
function openPrivacy() { document.getElementById('privacyOverlay')?.classList.add('open'); }
function closePrivacy(){ document.getElementById('privacyOverlay')?.classList.remove('open'); }
async function downloadFile(id) {
  if (!SB_USER) { toast('İndirmek için giriş yapman gerekiyor', '🔒'); openAuth(); return; }
  const f = allFiles().find(x => x.id === id);
  if (!f) return;
  if (f.kind === 'link') { window.open(f.url, '_blank'); return; }
  if (f.fromDB && f.file_path) {
    const url = await sbGetDownloadUrl(f.file_path);
    if (url) {
      window.open(url, '_blank');
      sbBumpDownload(id).catch(() => {});
      f.dls++;
      renderArchive();
      return;
    }
  }
  toast('İndirme bağlantısı bulunamadı', '❌');
}

/* ═══════════ PDF TEXT EXTRACTION ═══════════ */
async function extractPdfText(file) {
  if (!window.pdfjsLib) return '';
  try {
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    const maxPages = Math.min(pdf.numPages, 15);
    let text = '';
    for (let i = 1; i <= maxPages; i++) {
      const page    = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(' ') + '\n';
    }
    return text.slice(0, 60000).trim();
  } catch (e) {
    console.warn('PDF text extraction:', e);
    return '';
  }
}

/* ═══════════ IMAGE COMPRESSION ═══════════ */
async function compressImageFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (!['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return file;
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1920;
      let w = img.width, h = img.height;
      if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        blob => resolve(blob ? new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }) : file),
        'image/jpeg', 0.82
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

/* ═══════════ UPLOAD MODAL ═══════════ */
let pendingFile = null;
function openUpload() {
  if (!SB_USER) { toast('Yüklemek için giriş yapman gerekiyor 🔐', '⚠️'); openAuth(); return; }
  document.getElementById('upDers').innerHTML = '<option value="">Ders seçin…</option>' + DERSLER.map(d => `<option value="${d.id}">${d.code} — ${esc(shortName(d.name))}</option>`).join('');
  document.getElementById('uploadOverlay').classList.add('open');
}
function closeUpload() { document.getElementById('uploadOverlay').classList.remove('open'); resetUpload(); }
function resetUpload() {
  pendingFile = null;
  ['upTitle', 'upDesc', 'upTags', 'upUrl'].forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
  document.getElementById('filePreview').style.display = 'none';
  document.getElementById('dropZone').style.display = '';
}
function setUpKind(k) {
  document.querySelectorAll('#upKindSeg .seg-opt').forEach(o => o.classList.toggle('active', o.dataset.k === k));
  document.getElementById('dropZone').style.display = k === 'file' ? '' : 'none';
  document.getElementById('filePreview').style.display = 'none';
  document.getElementById('linkWrap').style.display = k === 'link' ? '' : 'none';
}
async function fileSelected(file) {
  if (!file) return;
  const MAX_MB = 20;
  if (file.size > MAX_MB * 1024 * 1024) { toast(`Dosya ${MAX_MB} MB'dan küçük olmalı`, '⚠️'); return; }

  // Show chip immediately
  pendingFile = file;
  document.getElementById('dropZone').style.display = 'none';
  const fp = document.getElementById('filePreview');
  fp.style.display = 'flex';
  document.getElementById('fpName').textContent = file.name;
  document.getElementById('fpSize').textContent = (file.size / 1048576).toFixed(2) + ' MB';
  if (!document.getElementById('upTitle').value) document.getElementById('upTitle').value = file.name.replace(/\.[^.]+$/, '');

  // Compress images in background
  const ext = file.name.split('.').pop().toLowerCase();
  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
    document.getElementById('fpSize').textContent = 'Sıkıştırılıyor…';
    const compressed = await compressImageFile(file);
    pendingFile = compressed;
    const origMB = (file.size / 1048576).toFixed(2);
    const compMB = (compressed.size / 1048576).toFixed(2);
    const saved  = Math.round((1 - compressed.size / file.size) * 100);
    document.getElementById('fpSize').textContent = saved > 5
      ? `${compMB} MB  ·  ${origMB} MB'dan ${saved}% küçültüldü ✓`
      : `${compMB} MB`;
  }
}
function clearFile() { pendingFile = null; document.getElementById('filePreview').style.display = 'none'; document.getElementById('dropZone').style.display = ''; }
function dragOver(e) { e.preventDefault(); document.getElementById('dropZone').classList.add('drag'); }
function dragLeave(e) { document.getElementById('dropZone').classList.remove('drag'); }
function dropFile(e) { e.preventDefault(); document.getElementById('dropZone').classList.remove('drag'); if (e.dataTransfer.files[0]) fileSelected(e.dataTransfer.files[0]); }

async function submitUpload() {
  if (!SB_USER) { toast('Yüklemek için giriş yapman gerekiyor 🔐', '⚠️'); openAuth(); return; }

  const isLink = document.querySelector('#upKindSeg .seg-opt.active').dataset.k === 'link';
  const title  = document.getElementById('upTitle').value.trim();
  const ders   = document.getElementById('upDers').value;
  const type   = document.getElementById('upType').value;
  const url    = document.getElementById('upUrl').value.trim();
  if (!title) { toast('Başlık gerekli', '✏️'); return; }
  if (!ders)  { toast('Lütfen ders seç', '📚'); return; }
  if (isLink && !url)       { toast('Bağlantı (URL) gerekli', '🔗'); return; }
  if (!isLink && !pendingFile) { toast('Lütfen dosya seç', '📂'); return; }

  const submitBtn = document.querySelector('#uploadOverlay .btn-primary');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Yükleniyor…'; }

  // Extract PDF text for full-text search
  let contentText = '';
  if (!isLink && pendingFile?.name?.toLowerCase().endsWith('.pdf')) {
    submitBtn && (submitBtn.textContent = 'Metin çıkarılıyor…');
    contentText = await extractPdfText(pendingFile);
    submitBtn && (submitBtn.textContent = 'Yükleniyor…');
  }

  const meta = {
    title, ders, type,
    subtype: document.getElementById('upSubtype').value || undefined,
    desc:    document.getElementById('upDesc').value.trim() || 'Açıklama eklenmedi.',
    tags:    document.getElementById('upTags').value.split(',').map(t => t.trim()).filter(Boolean),
    kind:    isLink ? 'link' : 'file',
    url:     isLink ? url : undefined,
    contentText,
  };

  try {
    const newFile = await sbInsertFile(meta, isLink ? null : pendingFile);
    DB_FILES.unshift(newFile);
    closeUpload();
    renderSidebar(); renderArchive(); renderTrend(); renderStats();
    goTo('anasayfa');
    toast('Kaynağın yayınlandı! 🎉', '✅');
  } catch (e) {
    toast('Yükleme hatası: ' + (e.message || 'Bilinmeyen'), '❌');
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Yayınla'; }
  }
}
function onTypeChange() {
  document.getElementById('subtypeWrap').style.display = document.getElementById('upType').value === 'sinav' ? '' : 'none';
}

/* ═══════════ SEARCH ═══════════ */
let _contentSearchTimer = null;

function handleSearch(q) {
  q = q.trim().toLowerCase();
  const box = document.getElementById('searchResults');
  if (!q) { box.innerHTML = ''; box.style.display = 'none'; document.getElementById('mainPages').style.display = ''; return; }
  document.getElementById('mainPages').style.display = 'none';
  box.style.display = 'block';

  const files = allFiles().filter(f =>
    f.title.toLowerCase().includes(q) || (f.desc || '').toLowerCase().includes(q) ||
    (f.tags || []).some(t => t.toLowerCase().includes(q)) ||
    (dersOf(f.ders) && (dersOf(f.ders).name.toLowerCase().includes(q) || dersOf(f.ders).code.toLowerCase().replace(/\s/g, '').includes(q.replace(/\s/g, '')))));
  const courses = DERSLER.filter(d => d.name.toLowerCase().includes(q) || d.code.toLowerCase().replace(/\s/g, '').includes(q.replace(/\s/g, '')));
  const foundIds = new Set(files.map(f => f.id));

  let html = `<div class="container" style="padding-top:30px"><div class="sec-head"><div><div class="eyebrow">Arama</div><h2 class="sec-title" style="margin-top:10px">"${esc(q)}" için sonuçlar</h2></div><button class="btn btn-ghost btn-sm" onclick="clearSearch()">✕ Temizle</button></div>`;
  if (courses.length) html += `<div class="sec-sub" style="margin-bottom:12px">Dersler (${courses.length})</div><div class="dgrid" style="margin-bottom:30px">${courses.map(d => `<div class="dcard" onclick="setDers('${d.id}');clearSearch()"><div class="dcard-head"><div class="dcard-ico" style="background:oklch(0.95 0.04 ${d.tint})">${d.icon}</div><div class="dcard-code">${d.code}</div></div><div class="dcard-name">${esc(d.name)}</div></div>`).join('')}</div>`;
  html += `<div class="sec-sub" style="margin-bottom:12px">Kaynaklar (${files.length})</div>`;
  html += files.length ? `<div class="rgrid">${files.map(cardHTML).join('')}</div>` : `<div class="empty"><div class="empty-ico">🔍</div><div class="empty-title">Sonuç bulunamadı</div><div class="empty-sub">Farklı bir anahtar kelime ya da ders kodu (örn. EE 211) dene.</div></div>`;
  html += `<div id="contentMatchResults"></div></div>`;
  box.innerHTML = html;

  // Async PDF content search (debounced, min 3 chars)
  if (_contentSearchTimer) clearTimeout(_contentSearchTimer);
  if (q.length >= 3) {
    _contentSearchTimer = setTimeout(() => searchPdfContent(q, foundIds), 500);
  }
}

async function searchPdfContent(q, alreadyFoundIds) {
  const el = document.getElementById('contentMatchResults');
  if (!el) return;
  try {
    const { data } = await sb.from('files')
      .select('id')
      .ilike('content_text', `%${q}%`)
      .limit(20);
    if (!data?.length) return;
    if (!document.getElementById('contentMatchResults')) return;
    const extras = DB_FILES.filter(f => data.some(r => String(r.id) === f.id) && !alreadyFoundIds.has(f.id));
    if (extras.length) {
      el.innerHTML = `<div class="sec-sub" style="margin:24px 0 12px">📄 PDF içinde bulundu (${extras.length})</div>
        <div class="rgrid">${extras.map(cardHTML).join('')}</div>`;
    }
  } catch {}
}
function clearSearch() {
  ['searchInput', 'searchInput2'].forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
  const box = document.getElementById('searchResults');
  box.innerHTML = ''; box.style.display = 'none';
  document.getElementById('mainPages').style.display = '';
}

/* ═══════════ THEME ═══════════ */
function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  document.body.setAttribute('data-theme', next);
  LS.set('theme', next);
  document.getElementById('themeIco').textContent = next === 'dark' ? '☀️' : '🌙';
  window.dispatchEvent(new Event('themechange'));
}

/* ═══════════ TOAST ═══════════ */
function toast(msg, ico = '✅') {
  const wrap = document.getElementById('toastWrap');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span class="toast-ico">${ico}</span><span>${esc(msg)}</span>`;
  wrap.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, 2600);
}

/* ═══════════ SIDEBAR COLLAPSE ═══════════ */
function toggleSb(head) { head.classList.toggle('collapsed'); }

/* ═══════════ ADMIN PANEL ═══════════ */
let ADMIN_TAB = 'files';

function renderAdmin() {
  if (!SB_PROFILE?.is_admin) { goTo('anasayfa'); return; }
  document.querySelectorAll('#adminTabs .seg-opt').forEach(o =>
    o.classList.toggle('active', o.dataset.tab === ADMIN_TAB));
  if (ADMIN_TAB === 'files') renderAdminFiles();
  else if (ADMIN_TAB === 'users') renderAdminUsers();
  else if (ADMIN_TAB === 'reqs') renderAdminRequests();
}

function setAdminTab(tab) {
  ADMIN_TAB = tab;
  renderAdmin();
}

async function renderAdminFiles() {
  const el = document.getElementById('adminContent');
  el.innerHTML = '<div class="loading">Yükleniyor…</div>';
  let files;
  try { files = await sbAdminGetFiles(); } catch { el.innerHTML = '<div class="loading">Hata oluştu</div>'; return; }
  if (!files.length) { el.innerHTML = '<div class="empty"><div class="empty-ico">📭</div><div class="empty-title">Henüz dosya yok</div></div>'; return; }
  el.innerHTML = `<div class="admin-table">
    <div class="at-head"><span>Dosya</span><span>Ders</span><span>Yükleyen</span><span>Tarih</span><span></span></div>
    ${files.map(f => `<div class="at-row">
      <span class="at-title" title="${esc(f.title)}">${esc(f.title)}</span>
      <span>${esc((f.ders || '—').toUpperCase())}</span>
      <span>${esc(f.uname || 'Bilinmeyen')}</span>
      <span>${timeAgo(f.t)}</span>
      <span><button class="btn btn-ghost btn-sm" style="color:var(--red);font-size:12px" onclick="adminDeleteFile('${f.id}',this)">Sil</button></span>
    </div>`).join('')}
  </div>`;
}

async function adminDeleteFile(id, btn) {
  if (!confirm('Bu dosyayı silmek istediğinden emin misin?')) return;
  if (btn) { btn.disabled = true; btn.textContent = '…'; }
  try {
    await sbAdminDeleteFile(id);
    DB_FILES = DB_FILES.filter(f => f.id !== id);
    renderArchive(); renderSidebar(); renderStats();
    renderAdminFiles();
    toast('Dosya silindi', '🗑️');
  } catch (e) {
    toast('Hata: ' + (e.message || 'Bilinmeyen'), '❌');
    if (btn) { btn.disabled = false; btn.textContent = 'Sil'; }
  }
}

async function renderAdminUsers() {
  const el = document.getElementById('adminContent');
  el.innerHTML = '<div class="loading">Yükleniyor…</div>';
  let users;
  try { users = await sbAdminGetUsers(); } catch { el.innerHTML = '<div class="loading">Hata oluştu</div>'; return; }
  if (!users.length) { el.innerHTML = '<div class="empty"><div class="empty-ico">👥</div><div class="empty-title">Henüz kullanıcı yok</div></div>'; return; }
  el.innerHTML = `<div class="admin-table">
    <div class="at-head"><span>Kullanıcı</span><span>Sınıf</span><span>Rol</span><span>Katılım</span><span></span></div>
    ${users.map(u => `<div class="at-row${u.banned ? ' banned' : ''}">
      <span>${esc(u.name || 'Adsız')}</span>
      <span>${u.year === 'mezun' ? 'Mezun' : (u.year ? u.year + '. Sınıf' : '—')}</span>
      <span>${u.is_admin ? '⭐ Admin' : 'Üye'}</span>
      <span>${timeAgo(new Date(u.created_at).getTime())}</span>
      <span>${u.is_admin ? '' : `<button class="btn btn-ghost btn-sm" style="color:${u.banned ? 'var(--acc)' : 'var(--red)'};font-size:12px" onclick="adminToggleBan('${u.id}',${!u.banned},this)">${u.banned ? 'Engeli Kaldır' : 'Engelle'}</button>`}</span>
    </div>`).join('')}
  </div>`;
}

async function adminToggleBan(userId, ban, btn) {
  if (btn) { btn.disabled = true; btn.textContent = '…'; }
  try {
    await sbAdminSetBan(userId, ban);
    renderAdminUsers();
    toast(ban ? 'Kullanıcı engellendi' : 'Engel kaldırıldı', ban ? '🚫' : '✅');
  } catch (e) {
    toast('Hata: ' + (e.message || 'Bilinmeyen'), '❌');
    if (btn) { btn.disabled = false; }
  }
}

async function renderAdminRequests() {
  const el = document.getElementById('adminContent');
  el.innerHTML = '<div class="loading">Yükleniyor…</div>';
  let reqs;
  try { reqs = await sbAdminGetRequests(); } catch { el.innerHTML = '<div class="loading">Hata oluştu</div>'; return; }
  if (!reqs.length) { el.innerHTML = '<div class="empty"><div class="empty-ico">📥</div><div class="empty-title">Henüz istek yok</div></div>'; return; }
  el.innerHTML = `<div class="admin-table">
    <div class="at-head"><span>İstek</span><span>Ders</span><span>Oy</span><span>Durum</span><span></span></div>
    ${reqs.map(r => `<div class="at-row${r.resolved ? ' resolved' : ''}">
      <span class="at-title" title="${esc(r.text)}">${esc(r.text)}</span>
      <span>${esc(r.ders || 'Genel')}</span>
      <span>${r.votes}</span>
      <span>${r.resolved ? '✓ Çözüldü' : 'Açık'}</span>
      <span style="display:flex;gap:6px">
        ${!r.resolved ? `<button class="btn btn-ghost btn-sm" style="font-size:12px" onclick="adminResolveReq('${r.id}',this)">Çözüldü</button>` : ''}
        <button class="btn btn-ghost btn-sm" style="color:var(--red);font-size:12px" onclick="adminDeleteReq('${r.id}',this)">Sil</button>
      </span>
    </div>`).join('')}
  </div>`;
}

async function adminResolveReq(id, btn) {
  if (btn) btn.disabled = true;
  try {
    await sbAdminResolveRequest(id);
    DB_REQS = DB_REQS.filter(r => r.id !== id);
    renderRequests();
    renderAdminRequests();
    toast('İstek çözüldü olarak işaretlendi', '✅');
  } catch (e) {
    toast('Hata', '❌');
    if (btn) btn.disabled = false;
  }
}

async function adminDeleteReq(id, btn) {
  if (!confirm('Bu isteği silmek istediğinden emin misin?')) return;
  if (btn) { btn.disabled = true; btn.textContent = '…'; }
  try {
    await sbAdminDeleteRequest(id);
    DB_REQS = DB_REQS.filter(r => r.id !== id);
    renderRequests();
    renderAdminRequests();
    toast('İstek silindi', '🗑️');
  } catch (e) {
    toast('Hata', '❌');
    if (btn) { btn.disabled = false; btn.textContent = 'Sil'; }
  }
}

/* ─── Render everything visible ─── */
function renderAll() {
  renderStats();
  renderSidebar();
  renderTrend();
  renderArchive();
  renderTopbarAvatar();
  if (STATE.page === 'dersler')  renderDersPage();
  if (STATE.page === 'topluluk') renderLeaderboard();
  if (STATE.page === 'istekler') renderRequests();
  if (STATE.page === 'profil')   renderProfile();
  if (STATE.page === 'admin')    renderAdmin();
}

/* ═══════════ INIT ═══════════ */
async function init() {
  const theme = LS.get('theme', 'light');
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);
  document.getElementById('themeIco').textContent = theme === 'dark' ? '☀️' : '🌙';

  renderStats();
  renderSidebar();
  renderTrend();
  renderArchive();
  renderLinks();
  buildTools();
  renderTopbarAvatar();
  initHeroVisual();

  // Boot Supabase (checks for existing session, sets up auth listener)
  await sbInit();
  // Load all public files and leaderboard (SB_USER is set if session exists)
  await loadDbFiles();
  loadDbLeaderboard();
  renderSidebar(); renderArchive(); renderTrend(); renderStats();
}
document.addEventListener('DOMContentLoaded', init);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeDetail(); closeUpload(); closeAuth(); closeTerms(); closePrivacy();
    const p = document.getElementById('avPop'); if (p) p.classList.remove('open');
  }
});
document.addEventListener('click', e => {
  const pop = document.getElementById('avPop');
  if (pop && pop.classList.contains('open') && !e.target.closest('#avPop') && !e.target.closest('#profileAvatar')) {
    pop.classList.remove('open');
  }
});
