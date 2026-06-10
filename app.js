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
};

// DB requests loaded from Supabase (separate from localStorage reqs)
let DB_REQS = [];

function allFiles() {
  return [...STATE.myFiles, ...SEED_FILES];
}
function allReqs() {
  // DB_REQS already covers what STATE.reqs would have for logged-in users
  const localReqs = SB_USER ? [] : STATE.reqs;
  return [...localReqs, ...SEED_REQUESTS, ...DB_REQS];
}
function profileOf(uid) {
  if (uid === 'me') return STATE.me;
  const seed = SEED_PROFILES.find(p => p.id === uid);
  if (seed) return seed;
  // DB requests/files store the uploader name directly on the object
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

function avatarHTML(uid, size = 'md') {
  const p = profileOf(uid);
  const col = AV_COLORS[p.avatar] || AV_COLORS.a1;
  return `<div class="avatar ${size}" style="background:${col}">${esc((p.name || '?')[0])}</div>`;
}

/* ═══════════ NAVIGATION ═══════════ */
function goTo(page, scroll = true) {
  STATE.page = page;
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === 'page-' + page));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.page === page));
  document.querySelectorAll('.mn-item').forEach(l => l.classList.toggle('active', l.dataset.page === page));
  clearSearch();
  if (page === 'dersler') renderDersPage();
  if (page === 'topluluk') renderLeaderboard();
  if (page === 'istekler') { renderRequests(); loadDbReqs(); }
  if (page === 'profil') renderProfile();
  if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ═══════════ STATS / HERO ═══════════ */
function renderStats() {
  const files = allFiles();
  const users = SEED_PROFILES.length + 1;
  setText('statFiles', files.length);
  setText('statUsers', users);
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
}
function shortName(n) { return n.length > 22 ? n.slice(0, 20) + '…' : n; }

function setFilter(t) { STATE.filter = t; STATE.ders = null; goTo('anasayfa', false); renderSidebar(); renderArchive(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function setDers(id) { STATE.ders = id; STATE.filter = 'hepsi'; goTo('anasayfa', false); renderSidebar(); renderArchive(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
function setSort(s) { STATE.sort = s; renderArchive(); }

/* ═══════════ ARCHIVE (main feed) ═══════════ */
function renderArchive() {
  let files = allFiles();
  if (STATE.ders) files = files.filter(f => f.ders === STATE.ders);
  if (STATE.filter !== 'hepsi') files = files.filter(f => f.type === STATE.filter);
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
  else if (STATE.sort === 'dl') arr.sort((a, b) => (b.dls + (STATE.likes.has(b.id) ? 0 : 0)) - a.dls);
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
      <div class="rcard-author">${avatarHTML(f.uid, 'xs')}<span class="av-name">${esc(profileOf(f.uid).name.split(' ')[0])}</span></div>
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
  const me = { ...STATE.me, uploads: STATE.myFiles.length, likes: STATE.myFiles.reduce((a, f) => a + likeCount(f), 0), dls: STATE.myFiles.reduce((a, f) => a + f.dls, 0) };
  const rows = [...SEED_PROFILES, me].map(p => ({ ...p, score: p.uploads * 5 + p.likes * 2 + p.dls }))
    .sort((a, b) => b.score - a.score);
  document.getElementById('lbList').innerHTML = rows.map((p, i) => {
    const b = badgeFor(p.score);
    return `<div class="lb-row ${i === 0 ? 'top1' : ''} fade-up">
      <div class="lb-rank">${i + 1}</div>
      ${avatarHTML(p.id, 'md')}
      <div class="lb-info">
        <div class="lb-name">${esc(p.name)}${p.id === 'me' ? ' <span class="tag" style="font-size:9px;padding:2px 7px">sen</span>' : ''}</div>
        <div class="lb-sub"><span class="badge sm" style="color:${b.color};border-color:${b.color};background:${b.soft}"><span class="badge-ico">${b.icon}</span>${b.name}</span> · ${p.year === 'mezun' ? 'Mezun' : p.year + '. sınıf'}</div>
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
  const uploads = STATE.myFiles.length;
  const likesReceived = STATE.myFiles.reduce((a, f) => a + likeCount(f), 0);
  const dlsReceived = STATE.myFiles.reduce((a, f) => a + f.dls, 0);
  const score = uploads * 5 + likesReceived * 2 + dlsReceived;
  return {
    uploads, likesReceived, dlsReceived, score,
    saves: STATE.saves.size,
    likesGiven: STATE.likes.size,
    votes: STATE.votes.size,
    requests: STATE.reqs.length,
  };
}

function renderProfile() {
  if (!STATE.me.bio) STATE.me.bio = '';
  const s = myStats();
  setText('profileName', STATE.me.name);
  setText('profileSub', 'Elektrik-Elektronik Müh. · ' + (STATE.me.year === 'mezun' ? 'Mezun' : STATE.me.year + '. Sınıf'));

  // badge
  const b = badgeFor(s.score);
  document.getElementById('profileBadge').innerHTML =
    `<span class="badge" style="color:${b.color};border-color:${b.color};background:${b.soft}"><span class="badge-ico">${b.icon}</span>${b.name}</span>`;

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
  document.getElementById('avPick').innerHTML = Object.entries(AV_COLORS).map(([k, col]) =>
    `<div class="av-opt ${STATE.me.avatar === k ? 'active' : ''}" style="background:${col}" onclick="setAvatar('${k}')">${esc(STATE.me.name[0])}</div>`).join('');

  // stats
  setText('myUploads', s.uploads);
  setText('myLikesRec', s.likesReceived);
  setText('myDls', s.dlsReceived);
  setText('myScore', s.score);

  // achievements
  renderAchievements(s);

  // logout button (only for logged-in users)
  const logoutWrap = document.getElementById('logoutWrap');
  if (logoutWrap) {
    logoutWrap.innerHTML = SB_USER
      ? `<button class="btn btn-ghost btn-sm" style="color:var(--red)" onclick="sbSignOut()">Çıkış Yap</button>`
      : `<button class="btn btn-primary btn-sm" onclick="openAuth()">Giriş Yap</button>`;
  }

  const mine = STATE.myFiles;
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
function openDetail(id, silent) {
  const f = allFiles().find(x => x.id === id);
  if (!f) return;
  const d = dersOf(f.ders);
  const tc = TYPE_CFG[f.type];
  const liked = STATE.likes.has(f.id);
  const saved = STATE.saves.has(f.id);
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
      <div class="detail-row"><span class="dr-label">Paylaşan</span>${avatarHTML(f.uid, 'sm')}<span>${esc(profileOf(f.uid).name)}</span></div>
      <div class="detail-row"><span class="dr-label">Yüklenme</span><span>${timeAgo(f.t)}</span></div>
      <div class="detail-row"><span class="dr-label">İstatistik</span><span class="mono" style="font-size:13px">${likeCount(f)} beğeni · ${f.dls} indirme</span></div>
      ${f.kind === 'link' ? `<div class="detail-row"><span class="dr-label">Bağlantı</span><a href="${f.url}" target="_blank" rel="noopener" style="color:var(--acc)">${esc(f.url)} ↗</a></div>` : `<div class="detail-row"><span class="dr-label">Dosya</span><span class="mono" style="font-size:13px">.${f.ext || 'pdf'} · ${(2 + Math.random() * 6).toFixed(1)} MB</span></div>`}
    </div>
    <div class="detail-actions">
      <button class="btn btn-primary" onclick="downloadFile('${f.id}')">${ICON.down} ${f.kind === 'link' ? 'Bağlantıyı Aç' : 'İndir'}</button>
      <button class="btn btn-ghost" id="dLike" onclick="toggleLike('${f.id}')">${liked ? ICON.heartFill : ICON.heart} ${likeCount(f)}</button>
      <button class="btn btn-ghost" onclick="toggleSave('${f.id}');openDetail('${f.id}',true)">${saved ? ICON.bookmarkFill : ICON.bookmark} ${saved ? 'Kaydedildi' : 'Kaydet'}</button>
    </div>`;
  if (!silent) document.getElementById('detailOverlay').classList.add('open');
}
function closeDetail() { document.getElementById('detailOverlay').classList.remove('open'); }
async function downloadFile(id) {
  const f = allFiles().find(x => x.id === id);
  if (!f) return;
  if (f.kind === 'link') { window.open(f.url, '_blank'); return; }

  if (f.fromDB && f.file_path) {
    try {
      const signedUrl = await sbGetDownloadUrl(f.file_path);
      if (signedUrl) {
        window.open(signedUrl, '_blank');
        await sbBumpDownload(id);
        f.dls++;
        renderArchive();
        return;
      }
    } catch (e) {
      console.error('Download error:', e);
    }
  }

  toast('İndirme başladı (demo)', '⬇️');
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
function fileSelected(file) {
  if (!file) return;
  pendingFile = file;
  document.getElementById('dropZone').style.display = 'none';
  const fp = document.getElementById('filePreview');
  fp.style.display = 'flex';
  document.getElementById('fpName').textContent = file.name;
  document.getElementById('fpSize').textContent = (file.size / 1048576).toFixed(2) + ' MB';
  if (!document.getElementById('upTitle').value) document.getElementById('upTitle').value = file.name.replace(/\.[^.]+$/, '');
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

  const meta = {
    title, ders, type,
    subtype: document.getElementById('upSubtype').value || undefined,
    desc:    document.getElementById('upDesc').value.trim() || 'Açıklama eklenmedi.',
    tags:    document.getElementById('upTags').value.split(',').map(t => t.trim()).filter(Boolean),
    kind:    isLink ? 'link' : 'file',
    url:     isLink ? url : undefined,
  };

  try {
    const newFile = await sbInsertFile(meta, isLink ? null : pendingFile);
    STATE.myFiles.unshift(newFile);
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
  let html = `<div class="container" style="padding-top:30px"><div class="sec-head"><div><div class="eyebrow">Arama</div><h2 class="sec-title" style="margin-top:10px">"${esc(q)}" için sonuçlar</h2></div><button class="btn btn-ghost btn-sm" onclick="clearSearch()">✕ Temizle</button></div>`;
  if (courses.length) html += `<div class="sec-sub" style="margin-bottom:12px">Dersler (${courses.length})</div><div class="dgrid" style="margin-bottom:30px">${courses.map(d => `<div class="dcard" onclick="setDers('${d.id}');clearSearch()"><div class="dcard-head"><div class="dcard-ico" style="background:oklch(0.95 0.04 ${d.tint})">${d.icon}</div><div class="dcard-code">${d.code}</div></div><div class="dcard-name">${esc(d.name)}</div></div>`).join('')}</div>`;
  html += `<div class="sec-sub" style="margin-bottom:12px">Kaynaklar (${files.length})</div>`;
  html += files.length ? `<div class="rgrid">${files.map(cardHTML).join('')}</div>` : `<div class="empty"><div class="empty-ico">🔍</div><div class="empty-title">Sonuç bulunamadı</div><div class="empty-sub">Farklı bir anahtar kelime ya da ders kodu (örn. EE 211) dene.</div></div>`;
  html += `</div>`;
  box.innerHTML = html;
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
}
document.addEventListener('DOMContentLoaded', init);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeDetail(); closeUpload(); closeAuth();
    const p = document.getElementById('avPop'); if (p) p.classList.remove('open');
  }
});
document.addEventListener('click', e => {
  const pop = document.getElementById('avPop');
  if (pop && pop.classList.contains('open') && !e.target.closest('#avPop') && !e.target.closest('#profileAvatar')) {
    pop.classList.remove('open');
  }
});
