/* ═══════════════════════════════════════════════════════════
   VOLTHUB — SUPABASE
   Auth, storage, and all DB helpers.
   Fill in SUPABASE_URL and SUPABASE_ANON_KEY below.
═══════════════════════════════════════════════════════════ */

// ── CONFIG — replace with your project values ──────────────
const SUPABASE_URL      = 'https://bgqudrmtbgdrrtgaauvo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJncXVkcm10YmdkcnJ0Z2FhdXZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NzE3NjYsImV4cCI6MjA5NjM0Nzc2Nn0.auL0BYdgRgEuR6wUjWIdtJxIpfCCKetiztQfpqgsYMQ';
// ───────────────────────────────────────────────────────────

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ─── Auth state (readable from app.js) ─────────────────── */
let SB_USER    = null;   // Supabase User object or null
let SB_PROFILE = null;   // row from public.profiles or null

/* ─── Boot (called inside init()) ───────────────────────── */
async function sbInit() {
  const { data: { session } } = await sb.auth.getSession();
  if (session?.user) await _onSignIn(session.user, false);

  sb.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN')  await _onSignIn(session.user, true);
    if (event === 'SIGNED_OUT') _onSignOut();
  });
}

/* ─── Public auth actions ────────────────────────────────── */
async function sbSignIn(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function sbSignUp(email, password, name, year) {
  const { data, error } = await sb.auth.signUp({
    email, password,
    options: { data: { name, year } },
  });
  if (error) throw error;
  return data;
}

async function sbSignOut() {
  await sb.auth.signOut();
}

/* ─── Internal: session established ─────────────────────── */
async function _onSignIn(user, showToast) {
  SB_USER = user;

  // Fetch profile row (trigger creates it on first sign-up)
  const { data: prof } = await sb.from('profiles').select('*').eq('id', user.id).single();
  SB_PROFILE = prof;

  // If profile row missing (e.g. trigger disabled), create it
  if (!SB_PROFILE) {
    const { data: newP } = await sb.from('profiles').insert({
      id:   user.id,
      name: user.user_metadata?.name  || user.email.split('@')[0],
      year: user.user_metadata?.year  || '1',
    }).select().single();
    SB_PROFILE = newP;
  }

  STATE.me = {
    id:     'me',
    name:   SB_PROFILE?.name   || user.email.split('@')[0],
    year:   SB_PROFILE?.year   || '1',
    avatar: SB_PROFILE?.avatar || 'a1',
    bio:    SB_PROFILE?.bio    || '',
  };
  LS.set('me', STATE.me);

  await _loadUserData();

  if (typeof loadDbFiles === 'function') await loadDbFiles();
  if (typeof loadDbLeaderboard === 'function') loadDbLeaderboard();

  _updateAuthUI(true);
  renderAll();
  if (showToast) toast(`Hoş geldin, ${STATE.me.name.split(' ')[0]}! 👋`, '✅');
}

/* ─── Internal: signed out ───────────────────────────────── */
function _onSignOut() {
  SB_USER = null; SB_PROFILE = null;
  STATE.me      = LS.get('me', { id: 'me', name: 'Misafir Öğrenci', year: 3, avatar: 'a1' });
  STATE.myFiles = [];
  STATE.likes   = new Set(LS.get('likes', []));
  STATE.saves   = new Set(LS.get('saves', []));
  STATE.votes   = new Set(LS.get('votes', []));
  STATE.reqs    = LS.get('reqs', []);
  if (typeof DB_FILES !== 'undefined') DB_FILES = [];
  if (typeof DB_LEADERBOARD !== 'undefined') DB_LEADERBOARD = [];
  _updateAuthUI(false);
  if (typeof loadDbFiles === 'function') loadDbFiles();
  if (typeof loadDbLeaderboard === 'function') loadDbLeaderboard();
  renderAll();
  toast('Çıkış yapıldı', '👋');
}

/* ─── Internal: load all user data from DB ───────────────── */
async function _loadUserData() {
  const uid = SB_USER.id;
  const [files, likes, saves, votes] = await Promise.all([
    sbGetMyFiles(uid),
    sbGetMyLikes(uid),
    sbGetMySaves(uid),
    sbGetMyVotes(uid),
  ]);
  STATE.myFiles = files;
  STATE.likes   = new Set(likes);
  STATE.saves   = new Set(saves);
  STATE.votes   = new Set(votes);
  STATE.reqs    = []; // logged-in requests live in DB_REQS
}

/* ─── Auth UI helpers ────────────────────────────────────── */
function _updateAuthUI(loggedIn) {
  const loginBtn  = document.getElementById('navLoginBtn');
  const uploadBtn = document.getElementById('navUploadBtn');
  const avatar    = document.getElementById('navAvatar');
  const adminLink = document.getElementById('navAdminLink');
  if (loggedIn) {
    if (loginBtn)  loginBtn.style.display  = 'none';
    if (uploadBtn) uploadBtn.style.display = '';
    if (adminLink) adminLink.style.display = SB_PROFILE?.is_admin ? '' : 'none';
    renderTopbarAvatar();
  } else {
    if (loginBtn)  loginBtn.style.display  = '';
    if (uploadBtn) uploadBtn.style.display = 'none';
    if (adminLink) adminLink.style.display = 'none';
    if (avatar) avatar.innerHTML = '';
  }
}

/* ═══════════ FILES ═══════════════════════════════════════ */
async function sbGetMyFiles(uid) {
  const { data, error } = await sb.from('files')
    .select('*')
    .eq('uploader_id', uid)
    .order('created_at', { ascending: false });
  if (error) { console.error('sbGetMyFiles:', error); return []; }
  return (data || []).map(_dbFileToLocal);
}

async function sbInsertFile(meta, fileBlob) {
  let file_path = null, file_name = null, size = 0;

  if (fileBlob) {
    const ext  = fileBlob.name.split('.').pop();
    const path = `${SB_USER.id}/${Date.now()}.${ext}`;
    const { data: storData, error: storErr } = await sb.storage.from('files').upload(path, fileBlob);
    if (storErr) throw storErr;
    file_path = storData.path;
    file_name = fileBlob.name;
    size      = fileBlob.size;
  }

  const { data, error } = await sb.from('files').insert({
    title:         meta.title,
    description:   meta.desc,
    type:          meta.type,
    subtype:       meta.subtype || null,
    ders:          meta.ders,
    tags:          meta.tags || [],
    uploader_id:   SB_USER.id,
    uploader_name: STATE.me.name,
    file_path, file_name, size,
    url:           meta.url || null,
    kind:          meta.kind,
    visibility:    'public',
    content_text:  meta.contentText || '',
  }).select().single();
  if (error) throw error;
  return _dbFileToLocal(data);
}

/* ═══════════ COMMENTS ════════════════════════════════════ */
async function sbGetComments(fileId) {
  const numId = parseInt(fileId, 10);
  if (isNaN(numId)) return [];
  const { data, error } = await sb.from('comments')
    .select('*')
    .eq('file_id', numId)
    .order('created_at', { ascending: true });
  if (error) return [];
  return data || [];
}

async function sbAddComment(fileId, body) {
  const numId = parseInt(fileId, 10);
  if (isNaN(numId)) throw new Error('Geçersiz dosya');
  const { data, error } = await sb.from('comments').insert({
    file_id:   numId,
    user_id:   SB_USER.id,
    user_name: STATE.me.name,
    body:      body.trim(),
  }).select().single();
  if (error) throw error;
  return data;
}

async function sbDeleteComment(commentId) {
  const { error } = await sb.from('comments').delete().eq('id', commentId);
  if (error) throw error;
}

async function sbBumpDownload(fileId) {
  const numId = parseInt(fileId, 10);
  if (isNaN(numId)) return;
  await sb.rpc('bump_download', { fid: numId });
}

function sbGetPublicUrl(filePath) {
  if (!filePath) return null;
  const { data } = sb.storage.from('files').getPublicUrl(filePath);
  return data?.publicUrl || null;
}

async function sbGetDownloadUrl(filePath) {
  const { data } = await sb.storage.from('files').createSignedUrl(filePath, 3600);
  return data?.signedUrl || null;
}

async function sbGetAllPublicFiles() {
  const { data, error } = await sb.from('files')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('sbGetAllPublicFiles:', error); return []; }
  return (data || []).map(_dbFileToLocal);
}

async function sbGetLeaderboard() {
  const { data, error } = await sb.from('profile_stats')
    .select('id, name, year, avatar, upload_count, download_count, like_count')
    .order('upload_count', { ascending: false })
    .limit(50);
  if (error) return [];
  return (data || []).map(p => ({
    id: p.id, name: p.name, year: p.year, avatar: p.avatar || 'a1',
    uploads: p.upload_count, dls: p.download_count, likes: p.like_count,
  }));
}

function _dbFileToLocal(row) {
  const isMe = SB_USER && row.uploader_id === SB_USER.id;
  return {
    id:      String(row.id),
    title:   row.title,
    desc:    row.description || '',
    type:    row.type   || 'diger',
    subtype: row.subtype || undefined,
    ders:    row.ders   || '',
    uid:     isMe ? 'me' : (row.uploader_id || 'unknown'),
    uname:   row.uploader_name || '',
    t:       new Date(row.created_at).getTime(),
    dls:     row.downloads || 0,
    likes:   0,
    size:    row.size || 0,
    kind:    row.kind || 'file',
    url:     row.url  || undefined,
    ext:     row.file_name ? row.file_name.split('.').pop() : 'pdf',
    tags:    row.tags || [],
    fromDB:  true,
    file_path: row.file_path || null,
  };
}

/* ═══════════ LIKES ════════════════════════════════════════ */
async function sbGetMyLikes(uid) {
  const { data, error } = await sb.from('likes').select('file_id').eq('user_id', uid);
  if (error) return [];
  return (data || []).map(r => String(r.file_id));
}

async function sbToggleLike(fileId) {
  const numId = parseInt(fileId, 10);
  if (isNaN(numId)) return null;   // seed file — skip DB

  if (STATE.likes.has(fileId)) {
    await sb.from('likes').delete().eq('file_id', numId).eq('user_id', SB_USER.id);
    return false;
  } else {
    await sb.from('likes').insert({ file_id: numId, user_id: SB_USER.id });
    return true;
  }
}

/* ═══════════ SAVES ════════════════════════════════════════ */
async function sbGetMySaves(uid) {
  const { data, error } = await sb.from('saves').select('file_id').eq('user_id', uid);
  if (error) return [];
  return (data || []).map(r => String(r.file_id));
}

async function sbToggleSave(fileId) {
  const numId = parseInt(fileId, 10);
  if (isNaN(numId)) return null;   // seed file — skip DB

  if (STATE.saves.has(fileId)) {
    await sb.from('saves').delete().eq('file_id', numId).eq('user_id', SB_USER.id);
  } else {
    await sb.from('saves').insert({ file_id: numId, user_id: SB_USER.id });
  }
}

/* ═══════════ REQUESTS ═════════════════════════════════════ */
async function sbGetAllRequests() {
  const { data, error } = await sb.from('requests_with_votes')
    .select('*')
    .eq('resolved', false)
    .order('created_at', { ascending: false });
  if (error) { console.error('sbGetAllRequests:', error); return []; }
  return (data || []).map(r => ({
    id:       String(r.id),
    text:     r.body,
    ders:     r.ders   || '',
    uid:      r.user_id,
    uname:    r.user_name || '',
    t:        new Date(r.created_at).getTime(),
    votes:    r.vote_count || 0,
    resolved: r.resolved,
    fromDB:   true,
  }));
}

async function sbCreateRequest(text, ders) {
  if (!SB_USER) throw new Error('Giriş yapman gerekiyor');
  const { data, error } = await sb.from('requests').insert({
    user_id:   SB_USER.id,
    user_name: STATE.me.name,
    ders:      ders || '',
    body:      text,
  }).select().single();
  if (error) throw error;
  return {
    id: String(data.id), text, ders: ders || '',
    uid: 'me', uname: STATE.me.name,
    t: Date.now(), votes: 0, resolved: false, fromDB: true,
  };
}

async function sbGetMyVotes(uid) {
  const { data, error } = await sb.from('request_votes').select('request_id').eq('user_id', uid);
  if (error) return [];
  return (data || []).map(r => String(r.request_id));
}

async function sbToggleVote(requestId) {
  const numId = parseInt(requestId, 10);
  if (isNaN(numId)) return null;   // seed request — skip DB

  if (STATE.votes.has(requestId)) {
    await sb.from('request_votes').delete().eq('request_id', numId).eq('user_id', SB_USER.id);
  } else {
    await sb.from('request_votes').insert({ request_id: numId, user_id: SB_USER.id });
  }
}

/* ═══════════ PROFILE ══════════════════════════════════════ */
async function sbUpdateProfile(updates) {
  if (!SB_USER) return;
  const { error } = await sb.from('profiles').update(updates).eq('id', SB_USER.id);
  if (error) throw error;
  SB_PROFILE = { ...SB_PROFILE, ...updates };
}

/* ═══════════ AUTH MODAL ═══════════════════════════════════ */
function openAuth(tab) {
  setAuthTab(tab || 'login');
  document.getElementById('authOverlay').classList.add('open');
}
function closeAuth() {
  document.getElementById('authOverlay')?.classList.remove('open');
}
function setAuthTab(tab) {
  document.querySelectorAll('#authSeg .seg-opt').forEach(o =>
    o.classList.toggle('active', o.dataset.tab === tab));
  document.getElementById('loginForm').style.display    = tab === 'login'    ? '' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? '' : 'none';
}

async function doLogin() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) { toast('E-posta ve şifre gerekli', '⚠️'); return; }
  const btn = document.querySelector('#loginForm .btn-primary');
  btn.disabled = true; btn.textContent = 'Giriş yapılıyor…';
  try {
    await sbSignIn(email, password);
    closeAuth();
  } catch (e) {
    toast(e.message || 'Giriş başarısız', '❌');
  } finally {
    btn.disabled = false; btn.textContent = 'Giriş Yap';
  }
}

async function doRegister() {
  const name     = document.getElementById('regName').value.trim();
  const year     = document.getElementById('regYear').value;
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  if (!name || !email || !password) { toast('Tüm alanları doldur', '⚠️'); return; }
  if (password.length < 6) { toast('Şifre en az 6 karakter olmalı', '⚠️'); return; }
  const btn = document.querySelector('#registerForm .btn-primary');
  btn.disabled = true; btn.textContent = 'Kayıt yapılıyor…';
  try {
    await sbSignUp(email, password, name, year);
    closeAuth();
    toast('Kaydın tamamlandı! E-postanı doğrula 📧', '✅');
  } catch (e) {
    toast(e.message || 'Kayıt başarısız', '❌');
  } finally {
    btn.disabled = false; btn.textContent = 'Kayıt Ol';
  }
}

/* ═══════════ ADMIN ════════════════════════════════════════ */
async function sbAdminGetFiles() {
  const { data, error } = await sb.from('files').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(_dbFileToLocal);
}

async function sbAdminDeleteFile(fileId) {
  const numId = parseInt(fileId, 10);
  if (isNaN(numId)) return;
  const { data: f } = await sb.from('files').select('file_path').eq('id', numId).single();
  if (f?.file_path) await sb.storage.from('files').remove([f.file_path]);
  const { error } = await sb.from('files').delete().eq('id', numId);
  if (error) throw error;
}

async function sbAdminGetUsers() {
  const { data, error } = await sb.from('profiles')
    .select('id, name, year, avatar, is_admin, banned, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function sbAdminSetBan(userId, banned) {
  const { error } = await sb.from('profiles').update({ banned }).eq('id', userId);
  if (error) throw error;
}

async function sbAdminGetRequests() {
  const { data, error } = await sb.from('requests_with_votes')
    .select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(r => ({
    id: String(r.id), text: r.body, ders: r.ders || '',
    uid: r.user_id, uname: r.user_name || '',
    t: new Date(r.created_at).getTime(),
    votes: r.vote_count || 0, resolved: r.resolved,
  }));
}

async function sbAdminResolveRequest(reqId) {
  const { error } = await sb.from('requests').update({ resolved: true }).eq('id', parseInt(reqId, 10));
  if (error) throw error;
}

async function sbAdminDeleteRequest(reqId) {
  const { error } = await sb.from('requests').delete().eq('id', parseInt(reqId, 10));
  if (error) throw error;
}
