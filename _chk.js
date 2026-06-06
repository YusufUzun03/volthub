
// ═══════════════════════════════════════════════════
// DESIGN TOKENS (JS mirrors)
const TYPE_CONFIG = {
  kitap:  { cls:'tag-blue',   label:'📖 Kitap' },
  sinav:  { cls:'tag-red',    label:'📋 Sınav' },
  not:    { cls:'tag-green',  label:'📝 Not'   },
  formul: { cls:'tag-brand',  label:'🧮 Formül'},
  diger:  { cls:'tag-neutral',label:'📎 Diğer' },
};

// ═══════════════════════════════════════════════════
// DATA — EEE
const DERSLER = [
  {id:'ee102',    name:'Elektrik ve Elektronik Mühendisliğine Giriş', icon:'⚡', color:'rgba(99,102,241,.15)', desc:'Mesleğe giriş; temel kavramlar ve laboratuvar', donem:'1. Yarıyıl'},
  {id:'ee211',    name:'Elektrik Devreleri',                          icon:'🔌', color:'rgba(99,102,241,.18)', desc:'KVL, KCL, Thevenin, Norton, süperpozisyon',    donem:'3. Yarıyıl'},
  {id:'ee241',    name:'Sayısal Devreler',                            icon:'🖥️', color:'rgba(16,185,129,.15)', desc:'Boole cebri, mantık kapıları, flip-flop, FSM',  donem:'3. Yarıyıl'},
  {id:'ee212',    name:'Devreler ve Sistemler',                       icon:'📐', color:'rgba(99,102,241,.12)', desc:'AC devreler, fazörler, Laplace uygulamaları',   donem:'4. Yarıyıl'},
  {id:'ee226',    name:'Elektromanyetik Alanların Temelleri',         icon:'🌐', color:'rgba(239,68,68,.13)',  desc:'Elektrostatik, manyetostatik, Maxwell girişi',  donem:'4. Yarıyıl'},
  {id:'ee232',    name:'Elektroniğe Giriş',                          icon:'🔬', color:'rgba(59,130,246,.15)', desc:'Diyotlar, BJT, MOSFET, temel yükselteçler',    donem:'4. Yarıyıl'},
  {id:'ee242',    name:'Mikroişlemci Sistemleri',                    icon:'🔧', color:'rgba(139,92,246,.15)', desc:'Assembly, bellek, I/O, kesme yapıları',         donem:'4. Yarıyıl'},
  {id:'ee323',    name:'Elektromanyetik Dalgalar ve İletim Hatları',  icon:'📡', color:'rgba(239,68,68,.1)',   desc:'Dalga yayılımı, iletim hatları, empedans',      donem:'5. Yarıyıl'},
  {id:'ee333',    name:'Analog Elektronik Devreleri',                 icon:'💡', color:'rgba(59,130,246,.12)', desc:'Op-Amp, geri beslemeli yükselteçler, filtreler',donem:'5. Yarıyıl'},
  {id:'ee361',    name:'Sayısal İşaret İşlemeye Giriş',              icon:'🎵', color:'rgba(139,92,246,.12)', desc:'Z-dönüşümü, DFT, FIR/IIR filtre tasarımı',     donem:'5. Yarıyıl'},
  {id:'ee371',    name:'Elektromekanik Enerji Dönüşümü',             icon:'⚙️', color:'rgba(16,185,129,.12)', desc:'Transformatörler, DC/AC motorlar, jeneratörler',donem:'5. Yarıyıl'},
  {id:'ee334',    name:'Sayısal Elektronik Devreleri',                icon:'🔩', color:'rgba(59,130,246,.1)',  desc:'CMOS mantık, FPGA, VHDL/Verilog temelleri',    donem:'6. Yarıyıl'},
  {id:'ee354',    name:'Haberleşme Sistemleri',                      icon:'📶', color:'rgba(59,130,246,.08)', desc:'AM/FM, dijital modülasyon, Shannon, gürültü',   donem:'6. Yarıyıl'},
  {id:'ee372',    name:'Güç Sistemlerinin Temelleri',                icon:'🔋', color:'rgba(16,185,129,.1)',  desc:'Güç analizi, kısa devre, yük akışı, koruma',    donem:'6. Yarıyıl'},
  {id:'ee384',    name:'Kontrol Sistemlerine Giriş',                 icon:'🎛️', color:'rgba(99,102,241,.1)',  desc:'Transfer fonksiyonu, Bode, Nyquist, PID',       donem:'6. Yarıyıl'},
  {id:'ee491',    name:'Mühendislik Projesine Giriş',                icon:'📋', color:'rgba(99,102,241,.08)', desc:'Bitirme projesi planlama, metodoloji, ara rapor',donem:'7. Yarıyıl'},
  {id:'ee492',    name:'Mühendislik Projesi',                        icon:'🏆', color:'rgba(99,102,241,.06)', desc:'Proje uygulaması, prototip, final raporu ve sunum',donem:'8. Yarıyıl'},
];

// Ders bazlı haftalık konu başlıkları
const TOPICS = {
  ee102: ['Temel elektriksel büyüklükler','Ölçüm aletleri ve lab güvenliği','Devre elemanlarının tanıtımı','Mühendislik etiği','Mesleki alanlar','Dönem projesi & sunum'],
  ee211: ['Akım, gerilim, direnç','Kirchhoff yasaları (KVL/KCL)','Düğüm & çevre analizi','Thevenin & Norton','Süperpozisyon teoremi','RC/RL geçici durum analizi'],
  ee241: ['Sayı sistemleri & kodlar','Boole cebri','Mantık kapıları','Karnaugh haritaları','Flip-floplar','Sonlu durum makineleri (FSM)'],
  ee212: ['Sinüzoidal kaynaklar','Fazör analizi','AC güç (aktif/reaktif)','Rezonans devreleri','Laplace dönüşümü','Transfer fonksiyonu'],
  ee226: ['Vektör analizi','Coulomb & Gauss yasası','Elektrik potansiyeli','Kapasitans & dielektrik','Manyetostatik','Maxwell denklemlerine giriş'],
  ee232: ['Yarı iletken temelleri','Diyot ve uygulamaları','BJT yapısı & çalışması','MOSFET temelleri','Polarlama (biasing)','Temel yükselteç katları'],
  ee242: ['Mikroişlemci mimarisi','Assembly programlama','Bellek organizasyonu','I/O arabirimleri','Kesme (interrupt) yapıları','Zamanlayıcı & sayaçlar'],
  ee323: ['Düzlem dalga yayılımı','Yansıma & iletim','İletim hattı denklemleri','Smith abağı','Empedans uyumlama','Dalga kılavuzlarına giriş'],
  ee333: ['Op-amp temelleri','İdeal vs gerçek op-amp','Geri besleme teorisi','Aktif filtre tasarımı','Osilatörler','Güç yükselteçleri'],
  ee361: ['Ayrık zamanlı sinyaller','Z-dönüşümü','DTFT & DFT','FFT algoritması','FIR filtre tasarımı','IIR filtre tasarımı'],
  ee371: ['Manyetik devreler','Transformatörler','Enerji dönüşüm ilkeleri','DC makineler','Senkron makineler','Asenkron motorlar'],
  ee334: ['CMOS invertör','Mantık aileleri','Bellek devreleri','Programlanabilir mantık','FPGA mimarisi','VHDL/Verilog temelleri'],
  ee354: ['Sinyal & spektrum','Genlik modülasyonu (AM)','Açı modülasyonu (FM)','Örnekleme teoremi','Dijital modülasyon','Gürültü & kanal kapasitesi'],
  ee372: ['Üç fazlı sistemler','Güç akışı analizi','Per-unit sistemi','Kısa devre analizi','Koruma röleleri','Generatör & iletim'],
  ee384: ['Sistem modelleme','Transfer fonksiyonu','Zaman cevabı analizi','Kararlılık (Routh-Hurwitz)','Kök yer eğrisi','Bode, Nyquist & PID'],
  ee491: ['Problem tanımı','Literatür taraması','Proje planlama','Gereksinim analizi','Metodoloji seçimi','Ara rapor & sunum'],
  ee492: ['Tasarımın gerçeklenmesi','Prototipleme','Test & doğrulama','Maliyet analizi','Final raporu','Jüri sunumu'],
};

// ═══════════════════════════════════════════════════
// DATABASE — IndexedDB
let DB = null;
const DB_NAME = 'volthub_v2', DB_VER = 1;

function initDB(){
  return new Promise((res,rej)=>{
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if(!db.objectStoreNames.contains('users')){
        const u = db.createObjectStore('users',{keyPath:'id',autoIncrement:true});
        u.createIndex('email','email',{unique:true});
      }
      if(!db.objectStoreNames.contains('files')){
        const f = db.createObjectStore('files',{keyPath:'id',autoIncrement:true});
        f.createIndex('ders','ders'); f.createIndex('type','type'); f.createIndex('uploaderId','uploaderId');
      }
    };
    req.onsuccess = e => { DB=e.target.result; res(DB); };
    req.onerror = () => rej(req.error);
  });
}
const tx  = (store,mode='readonly') => DB.transaction(store,mode).objectStore(store);
const dbGet    = (s,k)     => new Promise((r,j)=>{const q=tx(s).get(k);q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error)});
const dbIdx    = (s,i,v)   => new Promise((r,j)=>{const q=tx(s).index(i).getAll(v);q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error)});
const dbAll    = s          => new Promise((r,j)=>{const q=tx(s).getAll();q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error)});
const dbAdd    = (s,d)     => new Promise((r,j)=>{const q=tx(s,'readwrite').add(d);q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error)});
const dbPut    = (s,d)     => new Promise((r,j)=>{const q=tx(s,'readwrite').put(d);q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error)});
const dbDelete = (s,k)     => new Promise((r,j)=>{const q=tx(s,'readwrite').delete(k);q.onsuccess=()=>r();q.onerror=()=>j(q.error)});
const dbClear  = s          => new Promise((r,j)=>{const q=tx(s,'readwrite').clear();q.onsuccess=()=>r();q.onerror=()=>j(q.error)});

// ═══════════════════════════════════════════════════
// AUTH
let SESSION = null;

async function sha256(s){
  const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));
  return Array.from(new Uint8Array(b)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

function switchTab(t){
  document.getElementById('loginForm').style.display    = t==='login'    ? '' : 'none';
  document.getElementById('registerForm').style.display = t==='register' ? '' : 'none';
  document.getElementById('tabLogin').classList.toggle('active', t==='login');
  document.getElementById('tabReg').classList.toggle('active',   t==='register');
}

async function doLogin(){
  const email=v('lEmail'), pass=v('lPass'), err=document.getElementById('lErr');
  err.classList.remove('show');
  if(!email||!pass){showErr(err,'E-posta ve şifre gerekli.');return;}
  const users=await dbIdx('users','email',email);
  if(!users.length){showErr(err,'Bu e-posta kayıtlı değil.');return;}
  const user=users[0], h=await sha256(pass);
  if(user.password!==h){showErr(err,'Şifre yanlış.');return;}
  saveSession(user); enterApp();
}

async function doRegister(){
  const name=v('rName'),email=v('rEmail'),pass=v('rPass'),year=v('rYear'), err=document.getElementById('rErr');
  err.classList.remove('show');
  if(!name||!email||!pass){showErr(err,'Tüm alanları doldurun.');return;}
  if(pass.length<6){showErr(err,'Şifre en az 6 karakter.');return;}
  if(await dbIdx('users','email',email).then(r=>r.length)){showErr(err,'Bu e-posta zaten kayıtlı.');return;}
  const id=await dbAdd('users',{name,email,password:await sha256(pass),year,saves:[],downloads:0,createdAt:Date.now()});
  saveSession({id,name,email,year}); enterApp();
}

function doLogout(){
  SESSION=null; localStorage.removeItem('vh_sess');
  document.getElementById('appShell').classList.remove('visible');
  document.getElementById('authScreen').classList.remove('hidden');
}

function saveSession(u){
  SESSION={userId:u.id,name:u.name,email:u.email,year:u.year};
  localStorage.setItem('vh_sess',JSON.stringify(SESSION));
}
function loadSession(){
  const s=localStorage.getItem('vh_sess');
  if(s){SESSION=JSON.parse(s);return true;} return false;
}

function showErr(el,msg){el.textContent=msg;el.classList.add('show');}
const v = id => document.getElementById(id)?.value?.trim()||'';
const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ratingsOf = f => f.ratings||[];
const avgRating = f => { const r=ratingsOf(f); return r.length ? r.reduce((a,b)=>a+b.s,0)/r.length : 0; };

// ═══════════════════════════════════════════════════
// THEME
function syncThemeBtn(){
  const b=document.getElementById('themeBtn');
  if(b)b.textContent=document.documentElement.getAttribute('data-theme')==='light'?'☀️':'🌙';
}
function applyTheme(th){
  document.documentElement.setAttribute('data-theme',th);
  try{localStorage.setItem('vh-theme',th);}catch(e){}
  syncThemeBtn();
}
function toggleTheme(){
  applyTheme(document.documentElement.getAttribute('data-theme')==='light'?'dark':'light');
}

// ═══════════════════════════════════════════════════
// ENTER APP
function enterApp(){
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('appShell').classList.add('visible');
  const ini=SESSION.name.trim()[0].toUpperCase();
  document.getElementById('navAvatar').textContent=ini;
  document.getElementById('profileAvatar').textContent=ini;
  document.getElementById('profileName').textContent=SESSION.name;
  document.getElementById('profileSub').textContent=
    'Elektrik-Elektronik Mühendisliği · '+(SESSION.year==='mezun'?'Mezun':SESSION.year+'. Sınıf');
  document.getElementById('welcomeName').textContent=SESSION.name.split(' ')[0];
  buildSidebar(); buildDersPage(); fillDersSelect(); buildTools(); buildLinks(); refreshAll(); syncThemeBtn();
}

// ═══════════════════════════════════════════════════
// SIDEBAR & DERS PAGE
function buildSidebar(){
  const donemler=[...new Set(DERSLER.map(d=>d.donem))];
  document.getElementById('dersSidebar').innerHTML =
    `<div class="sb-label">Ders</div>` +
    donemler.map(don=>`
      <div class="sb-donem-label sb-donem-head" onclick="toggleGroup(this)">${don} <span class="sb-chev">▾</span></div>
      <div class="sb-group-body">
      ${DERSLER.filter(d=>d.donem===don).map(d=>{
        const nm=d.name.length>26?d.name.slice(0,24)+'…':d.name;
        return `<div class="sb-item" onclick="filterByDers('${d.id}',this)" title="${d.name}">
          <span class="sb-ico">${d.icon}</span>${nm}
        </div>`;
      }).join('')}
      </div>`).join('');
}

function buildDersPage(){
  const donemler=[...new Set(DERSLER.map(d=>d.donem))];
  document.getElementById('dersGrid').innerHTML=donemler.map(don=>`
    <div class="donem-group">
      <div class="donem-label">📅 ${don}</div>
      ${DERSLER.filter(d=>d.donem===don).map(d=>`
        <div class="dcard" onclick="filterByDers('${d.id}',null)">
          <div class="dcard-icon" style="background:${d.color}">${d.icon}</div>
          <div style="flex:1;min-width:0">
            <div class="dcard-name">${d.name}</div>
            <div class="dcard-desc">${d.desc}</div>
          </div>
          <div class="dcard-right">
            <div class="dcard-count" id="dc-${d.id}">0 kaynak</div>
          </div>
        </div>`).join('')}
    </div>`).join('');
}

function fillDersSelect(){
  document.getElementById('upDers').innerHTML=
    '<option value="">Ders seçin…</option>'+
    DERSLER.map(d=>`<option value="${d.id}">${d.name}</option>`).join('');
}

const getDersName = id=>(DERSLER.find(d=>d.id===id)||{}).name||id;

// ═══════════════════════════════════════════════════
// RENDER
function fileIcon(name=''){
  const ext=(name.split('.').pop()||'').toLowerCase();
  return ({pdf:'📕',doc:'📘',docx:'📘',ppt:'📙',pptx:'📙',png:'🖼️',jpg:'🖼️',jpeg:'🖼️'})[ext]||'📄';
}

async function renderCards(containerId,files){
  const el=document.getElementById(containerId); if(!el)return;
  if(!files||!files.length){
    el.innerHTML=`<div class="empty">
      <div class="empty-icon">📭</div>
      <div class="empty-title">Henüz içerik yok</div>
      <div class="empty-desc">İlk yükleyen sen ol — sağ üstteki <strong>Yükle</strong> butonuna tıkla.</div>
      <button class="btn btn-brand" onclick="openUpload()">⬆ Dosya Yükle</button>
    </div>`; return;
  }
  const u=await dbGet('users',SESSION.userId);
  const saves=(u&&u.saves)||[];
  el.innerHTML=files.map((f,i)=>cardHTML(f,saves,i)).join('');
}

function cardHTML(f,saves,i=0){
  const cfg=TYPE_CONFIG[f.type]||TYPE_CONFIG.diger;
  const saved=saves.includes(f.id), own=f.uploaderId===SESSION.userId;
  const liked=(f.likes||[]).includes(SESSION.userId);
  const d=new Date(f.createdAt), dateStr=`${d.getDate()}.${d.getMonth()+1}.${d.getFullYear()}`;
  return `<div class="rcard" style="animation-delay:${i*40}ms" data-id="${f.id}" onclick="openPreview(${f.id})">
    <div class="rcard-shine"></div>
    <div class="rcard-type"><span class="tag ${cfg.cls}">${cfg.label}</span></div>
    <div class="rcard-title">${esc(f.title)}</div>
    <div class="rcard-desc">${esc(f.desc)||'Açıklama eklenmemiş.'}</div>
    <div class="rcard-tags">
      <span class="tag tag-neutral">${esc(getDersName(f.ders))}</span>
      <span class="tag tag-neutral">${fileIcon(f.fileName)} ${(f.fileName||'').split('.').pop().toUpperCase()}</span>
    </div>
    <div class="rcard-meta">
      <span title="İndirme">⬇️ ${f.downloads||0}</span>
      <span title="Beğeni">👍 ${(f.likes||[]).length}</span>
      ${ratingsOf(f).length?`<span title="Puan">⭐ ${avgRating(f).toFixed(1)}</span>`:''}
      <span title="Boyut">📦 ${fmtSize(f.fileSize||0)}</span>
    </div>
    <div class="rcard-divider"></div>
    <div class="rcard-footer">
      <div class="rcard-author">
        <div class="avatar avatar-sm">${esc((f.uploaderName||'?')[0])}</div>
        <span>${esc(f.uploaderName)}</span>
        <span style="color:var(--tx-tertiary)">· ${dateStr}</span>
      </div>
      <div class="rcard-actions">
        <button class="btn btn-ghost btn-icon btn-sm ${liked?'active':''}" onclick="toggleLike(event,${f.id})" title="Beğen">👍</button>
        <button class="btn btn-ghost btn-icon btn-sm ${saved?'active':''}" onclick="toggleSave(event,${f.id})" title="Kaydet">🔖</button>
        <button class="btn btn-ghost btn-icon btn-sm" onclick="downloadFile(event,${f.id})" title="İndir">⬇️</button>
        ${own?`<button class="btn btn-danger btn-icon btn-sm" onclick="deleteFile(event,${f.id})" title="Sil">🗑️</button>`:''}
      </div>
    </div>
  </div>`;
}

// ═══════════════════════════════════════════════════
// REFRESH
let curFilter='hepsi', curDers=null, curSort='new';
const SORTERS={
  new:  (a,b)=>b.createdAt-a.createdAt,
  old:  (a,b)=>a.createdAt-b.createdAt,
  dl:   (a,b)=>(b.downloads||0)-(a.downloads||0),
  like: (a,b)=>((b.likes||[]).length)-((a.likes||[]).length),
};
const sortFn=(a,b)=>(SORTERS[curSort]||SORTERS.new)(a,b);
function setSort(s){ curSort=s; refreshAll(); }
function clearDersFilter(){ curDers=null; clearSbActive(); document.getElementById('sf-hepsi').classList.add('active'); refreshAll(); }

async function refreshAll(){
  const all=await dbAll('files'), users=await dbAll('users');
  document.getElementById('statFiles').textContent=all.length;
  document.getElementById('statUsers').textContent=users.length;
  await renderTrend(all);

  // Sidebar counts
  document.getElementById('cnt-hepsi').textContent=all.length;
  ['kitap','not','sinav','formul','diger'].forEach(t=>{
    const el=document.getElementById('cnt-'+t);
    if(el)el.textContent=all.filter(f=>f.type===t).length;
  });
  // Ders counts
  DERSLER.forEach(d=>{
    const el=document.getElementById('dc-'+d.id);
    if(el)el.textContent=all.filter(f=>f.ders===d.id).length+' kaynak';
  });

  // Ders detail header
  const dh=document.getElementById('dersHead');
  const dersObj=curDers?DERSLER.find(d=>d.id===curDers):null;
  if(dersObj){
    dh.innerHTML=`<div class="ders-head">
      <div class="ders-head-icon" style="background:${dersObj.color}">${dersObj.icon}</div>
      <div style="flex:1;min-width:0">
        <div class="ders-head-code">${dersObj.id.toUpperCase()} · ${dersObj.donem}</div>
        <div class="ders-head-name">${esc(dersObj.name)}</div>
        <div class="ders-head-desc">${esc(dersObj.desc)}</div>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="clearDersFilter()">✕ Filtreyi Kaldır</button>
    </div>
    <div class="card card-md" style="margin-bottom:var(--sp-5)">
      <div class="sec-title" style="margin-bottom:var(--sp-3)">📅 Haftalık Konular</div>
      <div class="topic-list">${(TOPICS[curDers]||[]).map((t,i)=>`<div class="topic"><span class="topic-no">${i+1}</span>${esc(t)}</div>`).join('')||'<span style="color:var(--tx-tertiary)">Konu listesi yakında eklenecek.</span>'}</div>
    </div>`;
    document.getElementById('gridTitle').textContent='Bu Dersin Kaynakları';
  } else {
    dh.innerHTML='';
    document.getElementById('gridTitle').textContent=curFilter==='hepsi'?'Son Yüklenenler':(TYPE_CONFIG[curFilter]?.label||'')+' Kaynakları';
  }

  // Main grid
  let filtered=all;
  if(curFilter!=='hepsi')filtered=filtered.filter(f=>f.type===curFilter);
  if(curDers)filtered=filtered.filter(f=>f.ders===curDers);
  filtered.sort(sortFn);
  document.getElementById('totalLabel').textContent=filtered.length?filtered.length+' dosya':'';
  await renderCards('mainGrid',filtered);

  // Profile
  const myFiles=all.filter(f=>f.uploaderId===SESSION.userId).sort((a,b)=>b.createdAt-a.createdAt);
  const u=await dbGet('users',SESSION.userId);
  const saves=(u&&u.saves)||[];
  const savedFiles=all.filter(f=>saves.includes(f.id));
  document.getElementById('myUploads').textContent=myFiles.length;
  document.getElementById('mySaved').textContent=savedFiles.length;
  document.getElementById('myDls').textContent=(u&&u.downloads)||0;
  await renderCards('myGrid',myFiles);
  await renderCards('savedGrid',savedFiles);
}

// ═══════════════════════════════════════════════════
// TREND
async function renderTrend(all){
  const w=document.getElementById('trendWrap'); if(!w)return;
  const scored=all.map(f=>({f,s:(f.downloads||0)+((f.likes||[]).length*2)}))
    .filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,4);
  if(scored.length<2){ w.innerHTML=''; return; }
  const u=await dbGet('users',SESSION.userId), saves=(u&&u.saves)||[];
  w.innerHTML=`<div class="sec-head" style="margin-bottom:var(--sp-4)"><div class="sec-title">🔥 Trend Kaynaklar</div><div class="sec-sub">En çok indirilen ve beğenilenler</div></div>
    <div class="rgrid" style="margin-bottom:var(--sp-8)">${scored.map((x,i)=>cardHTML(x.f,saves,i)).join('')}</div>`;
}

// ═══════════════════════════════════════════════════
// NAVIGATION
const PAGE_INDEX={anasayfa:0,dersler:1,araclar:2,kaynaklar:3,topluluk:4,profil:5};
function goTo(page,navEl){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-pill').forEach(l=>l.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  const pills=document.querySelectorAll('.nav-pill');
  if(navEl)navEl.classList.add('active');
  else if(PAGE_INDEX[page]!=null)pills[PAGE_INDEX[page]]?.classList.add('active');
  document.getElementById('searchResults').classList.remove('active');
  document.getElementById('searchResults').innerHTML='';
  document.getElementById('searchInput').value='';
  window.scrollTo({top:0,behavior:'smooth'});
  if(page==='profil')refreshAll();
  if(page==='topluluk')buildLeaderboard();
}

// ═══════════════════════════════════════════════════
// FILTERS
function topFilter(t,el){
  curFilter=t; curDers=null;
  document.querySelectorAll('.fchip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  clearSbActive(); document.getElementById('sf-'+t)?.classList.add('active');
  refreshAll();
}
function sideFilter(t,el){
  curFilter=t; curDers=null;
  document.querySelectorAll('.sb-item').forEach(i=>i.classList.remove('active'));
  el?.classList.add('active');
  goTo('anasayfa',document.querySelector('.nav-pill')); refreshAll();
}
function filterByDers(id,el){
  curDers=id; curFilter='hepsi';
  document.querySelectorAll('.sb-item').forEach(i=>i.classList.remove('active'));
  el?.classList.add('active');
  document.querySelectorAll('.fchip').forEach(c=>c.classList.remove('active'));
  document.querySelector('.fchip').classList.add('active');
  goTo('anasayfa',document.querySelector('.nav-pill')); refreshAll();
}
function clearSbActive(){ document.querySelectorAll('.sb-item').forEach(i=>i.classList.remove('active')) }
function toggleGroup(h){
  h.classList.toggle('collapsed');
  const b=h.nextElementSibling;
  if(b&&b.classList.contains('sb-group-body')) b.style.display=h.classList.contains('collapsed')?'none':'';
}
function clearSearch(){
  const inp=document.getElementById('searchInput'); if(inp)inp.value='';
  const sr=document.getElementById('searchResults'); sr.classList.remove('active'); sr.innerHTML='';
}

// ═══════════════════════════════════════════════════
// SEARCH
async function handleSearch(q){
  const sr=document.getElementById('searchResults');
  if(!q.trim()){sr.classList.remove('active');sr.innerHTML='';return;}
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  sr.classList.add('active');
  const ql=q.toLowerCase().trim();
  const all=await dbAll('files');
  const dersMatch=DERSLER.filter(d=>d.name.toLowerCase().includes(ql)||d.id.toLowerCase().includes(ql)||d.donem.toLowerCase().includes(ql)||(d.desc||'').toLowerCase().includes(ql));
  const typeMatch=Object.entries(TYPE_CONFIG).filter(([k,c])=>k.includes(ql)||c.label.toLowerCase().includes(ql));
  const res=all.filter(f=>{
    const ext=(f.fileName||'').split('.').pop().toLowerCase();
    const tl=(TYPE_CONFIG[f.type]?.label||'').toLowerCase();
    return f.title.toLowerCase().includes(ql)
      ||(f.desc||'').toLowerCase().includes(ql)
      ||getDersName(f.ders).toLowerCase().includes(ql)
      ||(f.ders||'').toLowerCase().includes(ql)
      ||(f.type||'').toLowerCase().includes(ql)||tl.includes(ql)
      ||(f.fileName||'').toLowerCase().includes(ql)||ext.includes(ql);
  });
  if(!dersMatch.length&&!typeMatch.length&&!res.length){
    sr.innerHTML=`<div class="empty"><div class="empty-icon">🔍</div><div class="empty-title">"${q}" için sonuç yok</div><div class="empty-desc">Ders adı, tür, dosya tipi veya anahtar kelime dene.</div></div>`;
    return;
  }
  const u=await dbGet('users',SESSION.userId), saves=(u&&u.saves)||[];
  let html=`<div class="sec-head" style="margin-bottom:var(--sp-4)"><div class="sec-title">"${q}" için sonuçlar</div></div>`;
  if(typeMatch.length){
    html+=`<div class="sb-label" style="padding-left:0">Türler</div><div class="filter-row" style="margin-bottom:var(--sp-6)">`+
      typeMatch.map(([k,c])=>`<div class="fchip" onclick="sideFilter('${k}',null);clearSearch()">${c.label}</div>`).join('')+`</div>`;
  }
  if(dersMatch.length){
    html+=`<div class="sb-label" style="padding-left:0">Dersler (${dersMatch.length})</div><div class="rgrid" style="margin-bottom:var(--sp-6)">`+
      dersMatch.map(d=>`<div class="dcard" onclick="filterByDers('${d.id}',null);clearSearch()"><div class="dcard-icon" style="background:${d.color}">${d.icon}</div><div style="flex:1;min-width:0"><div class="dcard-name">${d.name}</div><div class="dcard-desc">${d.id.toUpperCase()} · ${d.donem}</div></div></div>`).join('')+`</div>`;
  }
  if(res.length){
    html+=`<div class="sb-label" style="padding-left:0">Kaynaklar (${res.length})</div><div class="rgrid">`+
      res.map((f,i)=>cardHTML(f,saves,i)).join('')+`</div>`;
  }else{
    html+=`<div class="sec-sub" style="color:var(--tx-tertiary);margin-top:var(--sp-2)">Bu aramayla eşleşen yüklenmiş kaynak yok — yukarıdaki ders/türden gözat.</div>`;
  }
  sr.innerHTML=html;
}

// ═══════════════════════════════════════════════════
// SAVE / DOWNLOAD / DELETE
async function toggleSave(e,id){
  e.stopPropagation();
  const btn=e.currentTarget;
  const u=await dbGet('users',SESSION.userId);
  const saves=u.saves||[];
  const isSaved=saves.includes(id);
  u.saves=isSaved?saves.filter(s=>s!==id):[...saves,id];
  await dbPut('users',u);
  btn.classList.toggle('active',!isSaved);
  toast(isSaved?'🔖 Kaydedilenlerden kaldırıldı':'✅ Kaydedildi!');
  document.getElementById('mySaved').textContent=u.saves.length;
  refreshAll();
}

async function toggleLike(e,id){
  e.stopPropagation();
  const btn=e.currentTarget;
  const f=await dbGet('files',id);
  if(!f)return;
  const likes=f.likes||[];
  const isLiked=likes.includes(SESSION.userId);
  f.likes=isLiked?likes.filter(x=>x!==SESSION.userId):[...likes,SESSION.userId];
  await dbPut('files',f);
  btn.classList.toggle('active',!isLiked);
  toast(isLiked?'👍 Beğeni geri alındı':'👍 Beğenildin!');
  refreshAll();
}

async function downloadFile(e,id){
  if(e)e.stopPropagation();
  const f=await dbGet('files',id);
  if(!f?.fileData){toast('❌ Dosya bulunamadı.');return;}
  // Per-file download counter
  f.downloads=(f.downloads||0)+1;
  await dbPut('files',f);
  // Personal download counter
  const u=await dbGet('users',SESSION.userId);
  if(u){ u.downloads=(u.downloads||0)+1; await dbPut('users',u); }
  const blob=dataURLtoBlob(f.fileData);
  const url=URL.createObjectURL(blob), a=document.createElement('a');
  a.href=url; a.download=f.fileName; a.click(); URL.revokeObjectURL(url);
  toast('📥 İndirme başladı!');
  refreshAll();
}

// ═══════════════════════════════════════════════════
// PREVIEW MODAL
let pvUrl=null;
async function openPreview(id){
  const f=await dbGet('files',id);
  if(!f){toast('❌ Dosya bulunamadı.');return;}
  const cfg=TYPE_CONFIG[f.type]||TYPE_CONFIG.diger;
  const u=await dbGet('users',SESSION.userId), saves=(u&&u.saves)||[];
  const saved=saves.includes(f.id), own=f.uploaderId===SESSION.userId;
  const liked=(f.likes||[]).includes(SESSION.userId);
  const myRating=(ratingsOf(f).find(r=>r.u===SESSION.userId)||{}).s||0;
  const avg=avgRating(f), rc=ratingsOf(f).length;
  const comments=f.comments||[];
  const d=new Date(f.createdAt), dateStr=`${d.getDate()}.${d.getMonth()+1}.${d.getFullYear()}`;
  const ext=(f.fileName||'').split('.').pop().toLowerCase();

  // Build preview frame
  if(pvUrl){URL.revokeObjectURL(pvUrl);pvUrl=null;}
  let frame='';
  if(f.fileData){
    const blob=dataURLtoBlob(f.fileData); pvUrl=URL.createObjectURL(blob);
    if(['png','jpg','jpeg','gif','webp'].includes(ext))
      frame=`<div class="pv-frame"><img src="${pvUrl}" alt=""></div>`;
    else if(ext==='pdf')
      frame=`<div class="pv-frame"><iframe src="${pvUrl}"></iframe></div>`;
    else
      frame=`<div class="pv-frame"><div class="pv-noprev"><div class="pv-noprev-ico">${fileIcon(f.fileName)}</div>Bu dosya türü tarayıcıda önizlenemiyor.<br>İndirerek görüntüleyebilirsin.</div></div>`;
  }

  document.getElementById('previewBody').innerHTML=`
    <div class="pv-head">
      <div style="flex:1">
        <div class="pv-tags">
          <span class="tag ${cfg.cls}">${cfg.label}</span>
          <span class="tag tag-neutral">${esc(getDersName(f.ders))}</span>
          <span class="tag tag-neutral">${fileIcon(f.fileName)} ${ext.toUpperCase()}</span>
        </div>
        <div class="pv-title">${esc(f.title)}</div>
      </div>
    </div>
    ${frame}
    <div class="pv-meta-row">
      <span><div class="avatar avatar-sm" style="display:inline-flex;vertical-align:middle">${esc((f.uploaderName||'?')[0])}</div> <b>${esc(f.uploaderName)}</b></span>
      <span>📅 ${dateStr}</span>
      <span>⬇️ <b>${f.downloads||0}</b> indirme</span>
      <span>👍 <b>${(f.likes||[]).length}</b> beğeni</span>
      <span>📦 <b>${fmtSize(f.fileSize||0)}</b></span>
    </div>
    <div style="font-size:var(--text-sm);color:var(--tx-secondary);line-height:1.7;margin-bottom:var(--sp-5)">${esc(f.desc)||'Açıklama eklenmemiş.'}</div>
    <div class="rate-box">
      <span class="rate-label">Puanla</span>
      <div class="star-row">${[1,2,3,4,5].map(n=>`<span class="star ${myRating>=n?'on':''}" onclick="rateFile(${f.id},${n})" title="${n} yıldız">★</span>`).join('')}</div>
      <div class="rate-avg">${rc?`<b>${avg.toFixed(1)}</b> / 5 · ${rc} oy`:'Henüz oy yok'}</div>
    </div>
    <div class="cm-block">
      <div class="cm-title">💬 Yorumlar (${comments.length})</div>
      <div class="cm-list">
        ${comments.length?comments.slice().reverse().map(c=>{
          const cd=new Date(c.ts), cds=`${cd.getDate()}.${cd.getMonth()+1}.${cd.getFullYear()}`;
          return `<div class="cm">
            <div class="avatar avatar-sm">${esc((c.name||'?')[0])}</div>
            <div class="cm-body"><div class="cm-meta"><b>${esc(c.name)}</b> · ${cds}</div><div class="cm-text">${esc(c.text)}</div></div>
          </div>`;
        }).join(''):'<div class="cm-empty">İlk yorumu sen yaz.</div>'}
      </div>
      <div class="cm-add">
        <input class="input" id="cmInput" placeholder="Yorum yaz…" maxlength="280" onkeydown="if(event.key==='Enter')addComment(${f.id})">
        <button class="btn btn-brand" onclick="addComment(${f.id})">Gönder</button>
      </div>
    </div>
    <div class="pv-actions">
      <button class="btn btn-brand" onclick="downloadFile(event,${f.id})">⬇️ İndir</button>
      <button class="btn btn-ghost ${liked?'active':''}" onclick="toggleLike(event,${f.id});closePreview()">👍 Beğen</button>
      <button class="btn btn-ghost ${saved?'active':''}" onclick="toggleSave(event,${f.id});closePreview()">🔖 ${saved?'Kaydedildi':'Kaydet'}</button>
      ${own?`<button class="btn btn-danger" style="margin-left:auto" onclick="deleteFile(event,${f.id});closePreview()">🗑️ Sil</button>`:''}
    </div>`;
  document.getElementById('previewOverlay').classList.add('show');
}
function closePreview(){
  document.getElementById('previewOverlay').classList.remove('show');
  if(pvUrl){URL.revokeObjectURL(pvUrl);pvUrl=null;}
}

async function rateFile(id,stars){
  const f=await dbGet('files',id); if(!f)return;
  const r=f.ratings||[];
  const mine=r.find(x=>x.u===SESSION.userId);
  if(mine)mine.s=stars; else r.push({u:SESSION.userId,s:stars});
  f.ratings=r; await dbPut('files',f);
  toast(`⭐ ${stars} yıldız verdin!`);
  openPreview(id); refreshAll();
}

async function addComment(id){
  const txt=v('cmInput'); if(!txt){toast('❌ Yorum boş olamaz.');return;}
  const f=await dbGet('files',id); if(!f)return;
  f.comments=[...(f.comments||[]),{userId:SESSION.userId,name:SESSION.name,text:txt,ts:Date.now()}];
  await dbPut('files',f);
  toast('💬 Yorumun eklendi!');
  openPreview(id);
}

async function deleteFile(e,id){
  e.stopPropagation();
  if(!confirm('Bu dosyayı silmek istediğine emin misin?'))return;
  await dbDelete('files',id); toast('🗑️ Dosya silindi.'); refreshAll();
}

// ═══════════════════════════════════════════════════
// UPLOAD
let selFile=null;

function openUpload(){ document.getElementById('uploadOverlay').classList.add('show') }
function closeUpload(){
  document.getElementById('uploadOverlay').classList.remove('show');
  clearFile();
  ['upTitle','upDesc'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('upProg').classList.remove('show');
  document.getElementById('upBtn').disabled=false;
}

function dragOver(e){ e.preventDefault(); document.getElementById('dropZone').classList.add('drag') }
function dragLeave(){ document.getElementById('dropZone').classList.remove('drag') }
function dropFile(e){ e.preventDefault(); dragLeave(); if(e.dataTransfer.files[0])fileSelected(e.dataTransfer.files[0]) }

function fileSelected(f){
  if(!f)return;
  if(f.size>20*1024*1024){toast('❌ Dosya 20MB\'ı geçemez.');return;}
  selFile=f;
  document.getElementById('dropZone').style.display='none';
  document.getElementById('filePreview').style.display='flex';
  document.getElementById('fpIcon').textContent=fileIcon(f.name);
  document.getElementById('fpName').textContent=f.name;
  document.getElementById('fpSize').textContent=fmtSize(f.size);
}
function clearFile(){
  selFile=null;
  document.getElementById('dropZone').style.display='';
  document.getElementById('filePreview').style.display='none';
  document.getElementById('fileInput').value='';
}
const fmtSize=b=>b<1048576?(b/1024).toFixed(1)+'KB':(b/1048576).toFixed(1)+'MB';

async function doUpload(){
  const title=v('upTitle'), ders=v('upDers'), type=document.getElementById('upType').value, desc=v('upDesc');
  if(!selFile){toast('❌ Lütfen bir dosya seç.');return;}
  if(!title){toast('❌ Başlık gerekli.');return;}
  if(!ders){toast('❌ Ders seçmelisin.');return;}
  const btn=document.getElementById('upBtn');
  btn.disabled=true;
  document.getElementById('upProg').classList.add('show');
  animBar();
  const fileData=await toDataURL(selFile);
  await dbAdd('files',{title,ders,type,desc,fileName:selFile.name,fileSize:selFile.size,fileData,uploaderId:SESSION.userId,uploaderName:SESSION.name,createdAt:Date.now(),likes:[],downloads:0,ratings:[],comments:[]});
  closeUpload(); toast('🎉 Dosya başarıyla yüklendi!');
  goTo('anasayfa',document.querySelector('.nav-pill')); await refreshAll();
}

function animBar(){
  let w=0; const bar=document.getElementById('upBar');
  const iv=setInterval(()=>{w=Math.min(w+Math.random()*15,90);bar.style.width=w+'%';if(w>=90)clearInterval(iv);},180);
  setTimeout(()=>{bar.style.width='100%';},2000);
}
const toDataURL=f=>new Promise(r=>{const rd=new FileReader();rd.onload=e=>r(e.target.result);rd.readAsDataURL(f);});
function dataURLtoBlob(d){const p=d.split(','),m=p[0].match(/:(.*?);/)[1],b=atob(p[1]);let n=b.length;const u=new Uint8Array(n);while(n--)u[n]=b.charCodeAt(n);return new Blob([u],{type:m});}

// ═══════════════════════════════════════════════════
// TOAST
let _tt;
function toast(msg){
  const t=document.getElementById('toast');
  t.innerHTML=msg; t.classList.add('show');
  clearTimeout(_tt); _tt=setTimeout(()=>t.classList.remove('show'),3000);
}

// ═══════════════════════════════════════════════════
// OVERLAY CLOSE
document.getElementById('uploadOverlay').addEventListener('click',function(e){if(e.target===this)closeUpload();});
document.getElementById('previewOverlay').addEventListener('click',function(e){if(e.target===this)closePreview();});
document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ closeUpload(); closePreview(); } });

// ═══════════════════════════════════════════════════
// TOOLS — INTERACTIVE CALCULATORS
function buildTools(){
  document.getElementById('toolGrid').innerHTML=`
    <!-- OHM -->
    <div class="tool-card">
      <div class="tool-head"><div class="tool-ico">⚡</div><div><div class="tool-title">Ohm Yasası & Güç</div><div class="tool-sub">V = I × R · P = V × I</div></div></div>
      <div class="tool-row">
        <div class="form-field"><label class="form-label">Gerilim (V)</label><input class="input" id="ohmV" type="number" placeholder="Volt" oninput="ohmCalc()"></div>
        <div class="form-field"><label class="form-label">Akım (I)</label><input class="input" id="ohmI" type="number" placeholder="Amper" oninput="ohmCalc()"></div>
      </div>
      <div class="form-field"><label class="form-label">Direnç (R)</label><input class="input" id="ohmR" type="number" placeholder="Ohm" oninput="ohmCalc()"></div>
      <div class="tool-result empty-res" id="ohmRes">İki değer gir, kalanları hesaplayayım.</div>
    </div>

    <!-- RESISTOR COLOR CODE -->
    <div class="tool-card wide">
      <div class="tool-head"><div class="tool-ico">🎨</div><div><div class="tool-title">Direnç Renk Kodu Çözücü</div><div class="tool-sub">Gerçek dirence renk bantlarını uygula · 4 / 5 / 6 bant</div></div></div>
      <div class="rc-layout">
        <div class="rc-stage"><div id="rcSvgWrap"></div></div>
        <div class="rc-controls">
          <div class="rc-bandcount" id="rcBandCount">
            <button class="rc-bc-btn" data-n="4" onclick="setRcBands(4)">4 Bant</button>
            <button class="rc-bc-btn" data-n="5" onclick="setRcBands(5)">5 Bant</button>
            <button class="rc-bc-btn" data-n="6" onclick="setRcBands(6)">6 Bant</button>
          </div>
          <div id="rcSelects"></div>
          <div class="rc-bigval" id="rcRes"></div>
          <div style="font-size:var(--text-xs);color:var(--tx-tertiary);text-align:center">İpucu: direncin üzerindeki bantlara tıklayarak da renk değiştirebilirsin.</div>
        </div>
      </div>
    </div>

    <!-- SERIES / PARALLEL -->
    <div class="tool-card">
      <div class="tool-head"><div class="tool-ico">🔗</div><div><div class="tool-title">Seri & Paralel Direnç</div><div class="tool-sub">Eşdeğer direnç hesabı</div></div></div>
      <div class="form-field"><label class="form-label">Direnç değerleri (Ω, virgülle ayır)</label><input class="input" id="spVals" placeholder="Ör: 100, 220, 470" oninput="spCalc()"></div>
      <div class="tool-result empty-res" id="spRes">Birden çok direnç değeri gir.</div>
    </div>

    <!-- REACTANCE -->
    <div class="tool-card">
      <div class="tool-head"><div class="tool-ico">〰️</div><div><div class="tool-title">Reaktans & Rezonans</div><div class="tool-sub">XL = 2πfL · XC = 1/(2πfC)</div></div></div>
      <div class="form-field"><label class="form-label">Frekans (Hz)</label><input class="input" id="rxF" type="number" placeholder="Ör: 50" oninput="rxCalc()"></div>
      <div class="tool-row">
        <div class="form-field"><label class="form-label">Endüktans (H)</label><input class="input" id="rxL" type="number" placeholder="Henry" oninput="rxCalc()"></div>
        <div class="form-field"><label class="form-label">Kapasitans (F)</label><input class="input" id="rxC" type="number" placeholder="Farad" oninput="rxCalc()"></div>
      </div>
      <div class="tool-result empty-res" id="rxRes">Frekans ve L/C gir.</div>
    </div>

    <!-- GANO -->
    <div class="tool-card wide">
      <div class="tool-head"><div class="tool-ico">🎓</div><div><div class="tool-title">GANO Hesaplayıcı</div><div class="tool-sub">Kredi + harf notu → ağırlıklı ortalama</div></div></div>
      <div id="ganoRows"></div>
      <div style="display:flex;gap:var(--sp-2);margin:var(--sp-3) 0">
        <button class="btn btn-ghost btn-sm" onclick="ganoAddRow()">+ Ders ekle</button>
        <button class="btn btn-ghost btn-sm" onclick="ganoReset()">Sıfırla</button>
      </div>
      <div class="tool-result empty-res" id="ganoRes">Ders kredisi ve notunu gir.</div>
    </div>`;
  initRc(); ganoReset();
}

const GANO_GRADES=[['AA',4],['BA',3.5],['BB',3],['CB',2.5],['CC',2],['DC',1.5],['DD',1],['FD',0.5],['FF',0]];
function ganoRowHTML(){
  const opts='<option value="">Not</option>'+GANO_GRADES.map(g=>`<option value="${g[1]}">${g[0]}</option>`).join('');
  return `<div class="gano-row" style="display:grid;grid-template-columns:1fr 84px 96px 34px;gap:var(--sp-2);margin-bottom:var(--sp-2);align-items:center">
    <input class="input" placeholder="Ders adı (ops.)">
    <input class="input gano-credit" type="number" min="0" step="0.5" placeholder="Kredi" oninput="ganoCalc()">
    <select class="input gano-grade" onchange="ganoCalc()">${opts}</select>
    <button class="btn btn-ghost btn-icon btn-sm" onclick="ganoDelRow(this)" title="Sil">✕</button>
  </div>`;
}
function ganoAddRow(){ const c=document.getElementById('ganoRows'); if(c)c.insertAdjacentHTML('beforeend',ganoRowHTML()); }
function ganoDelRow(btn){ const r=btn.closest('.gano-row'); if(r)r.remove(); ganoCalc(); }
function ganoReset(){
  const c=document.getElementById('ganoRows'); if(!c)return;
  c.innerHTML=''; for(let i=0;i<3;i++)ganoAddRow();
  const res=document.getElementById('ganoRes'); if(res){res.className='tool-result empty-res';res.textContent='Ders kredisi ve notunu gir.';}
}
function ganoCalc(){
  let tc=0,tp=0;
  document.querySelectorAll('#ganoRows .gano-row').forEach(r=>{
    const cr=parseFloat(r.querySelector('.gano-credit').value);
    const gp=parseFloat(r.querySelector('.gano-grade').value);
    if(cr>0&&!isNaN(gp)){ tc+=cr; tp+=cr*gp; }
  });
  const res=document.getElementById('ganoRes'); if(!res)return;
  if(tc<=0){ res.className='tool-result empty-res'; res.textContent='Ders kredisi ve notunu gir.'; return; }
  res.className='tool-result';
  res.innerHTML=`GANO: <span class="tr-val">${(tp/tc).toFixed(2)}</span> &nbsp;·&nbsp; Toplam kredi: <span class="tr-val">${tc}</span>`;
}

const fmtNum=x=>{
  if(!isFinite(x))return '∞';
  const a=Math.abs(x);
  if(a!==0&&a<1e-3)return x.toExponential(3);
  if(a>=1e6)return x.toExponential(3);
  return (Math.round(x*1000)/1000).toLocaleString('tr-TR');
};
// Format ohms with SI prefix
const fmtOhm=x=>{
  if(!isFinite(x))return '∞ Ω';
  if(x>=1e9)return (x/1e9).toFixed(2)+' GΩ';
  if(x>=1e6)return (x/1e6).toFixed(2)+' MΩ';
  if(x>=1e3)return (x/1e3).toFixed(2)+' kΩ';
  return (Math.round(x*100)/100)+' Ω';
};

// ── Ohm's law ──
function ohmCalc(){
  const V=parseFloat(v('ohmV')), I=parseFloat(v('ohmI')), R=parseFloat(v('ohmR'));
  const res=document.getElementById('ohmRes');
  const have=[!isNaN(V),!isNaN(I),!isNaN(R)].filter(Boolean).length;
  if(have<2){ res.className='tool-result empty-res'; res.textContent='İki değer gir, kalanları hesaplayayım.'; return; }
  let vv=V,ii=I,rr=R;
  if(!isNaN(V)&&!isNaN(I)){ rr=I!==0?V/I:Infinity; }
  else if(!isNaN(V)&&!isNaN(R)){ ii=R!==0?V/R:Infinity; }
  else if(!isNaN(I)&&!isNaN(R)){ vv=I*R; }
  const pp=vv*ii;
  res.className='tool-result';
  res.innerHTML=`Gerilim: <span class="tr-val">${fmtNum(vv)} V</span><br>
    Akım: <span class="tr-val">${fmtNum(ii)} A</span><br>
    Direnç: <span class="tr-val">${fmtNum(rr)} Ω</span><br>
    Güç: <span class="tr-val">${fmtNum(pp)} W</span>`;
}

// ── Resistor color code (realistic, 4/5/6 band) ──
const RC_DIGIT=[
  {n:'Siyah',c:'#1a1a1a',d:0},{n:'Kahve',c:'#7b3f00',d:1},{n:'Kırmızı',c:'#e0241b',d:2},
  {n:'Turuncu',c:'#f08000',d:3},{n:'Sarı',c:'#f5d000',d:4},{n:'Yeşil',c:'#1aa01a',d:5},
  {n:'Mavi',c:'#2060e0',d:6},{n:'Mor',c:'#8a2be2',d:7},{n:'Gri',c:'#8a8a8a',d:8},{n:'Beyaz',c:'#f0f0f0',d:9}
];
const RC_MUL=[
  {n:'Siyah ×1',c:'#1a1a1a',e:0},{n:'Kahve ×10',c:'#7b3f00',e:1},{n:'Kırmızı ×100',c:'#e0241b',e:2},
  {n:'Turuncu ×1k',c:'#f08000',e:3},{n:'Sarı ×10k',c:'#f5d000',e:4},{n:'Yeşil ×100k',c:'#1aa01a',e:5},
  {n:'Mavi ×1M',c:'#2060e0',e:6},{n:'Mor ×10M',c:'#8a2be2',e:7},{n:'Gri ×100M',c:'#8a8a8a',e:8},{n:'Beyaz ×1G',c:'#f0f0f0',e:9},
  {n:'Altın ×0.1',c:'#c9a227',e:-1},{n:'Gümüş ×0.01',c:'#cfcfcf',e:-2}
];
const RC_TOL=[
  {n:'Kahve ±1%',c:'#7b3f00',t:1},{n:'Kırmızı ±2%',c:'#e0241b',t:2},{n:'Yeşil ±0.5%',c:'#1aa01a',t:.5},
  {n:'Mavi ±0.25%',c:'#2060e0',t:.25},{n:'Mor ±0.1%',c:'#8a2be2',t:.1},{n:'Gri ±0.05%',c:'#8a8a8a',t:.05},
  {n:'Altın ±5%',c:'#c9a227',t:5},{n:'Gümüş ±10%',c:'#cfcfcf',t:10}
];
const RC_TC=[
  {n:'Kahve 100ppm',c:'#7b3f00',tc:100},{n:'Kırmızı 50ppm',c:'#e0241b',tc:50},{n:'Turuncu 15ppm',c:'#f08000',tc:15},
  {n:'Sarı 25ppm',c:'#f5d000',tc:25},{n:'Mavi 10ppm',c:'#2060e0',tc:10},{n:'Mor 5ppm',c:'#8a2be2',tc:5}
];
let RC_BANDS=4;
let rcState={d:[1,0,0],mul:2,tol:6,tc:0};

const rcOpts=(arr,sel)=>arr.map((o,i)=>`<option value="${i}" ${i===sel?'selected':''}>${o.n}</option>`).join('');

function renderRcControls(){
  document.querySelectorAll('#rcBandCount .rc-bc-btn').forEach(b=>b.classList.toggle('active', +b.dataset.n===RC_BANDS));
  const nd = RC_BANDS>=5?3:2;
  let html='<div class="tool-row">';
  for(let i=0;i<nd;i++) html+=`<div class="form-field"><label class="form-label">${i+1}. Rakam</label><select class="input" id="rcD${i}" onchange="rcCalc()">${rcOpts(RC_DIGIT,rcState.d[i])}</select></div>`;
  html+='</div><div class="tool-row">';
  html+=`<div class="form-field"><label class="form-label">Çarpan</label><select class="input" id="rcMul" onchange="rcCalc()">${rcOpts(RC_MUL,rcState.mul)}</select></div>`;
  html+=`<div class="form-field"><label class="form-label">Tolerans</label><select class="input" id="rcTol" onchange="rcCalc()">${rcOpts(RC_TOL,rcState.tol)}</select></div>`;
  html+='</div>';
  if(RC_BANDS===6) html+=`<div class="tool-row"><div class="form-field"><label class="form-label">Sıcaklık Katsayısı</label><select class="input" id="rcTc" onchange="rcCalc()">${rcOpts(RC_TC,rcState.tc)}</select></div></div>`;
  document.getElementById('rcSelects').innerHTML=html;
}
function syncRcState(){
  const nd = RC_BANDS>=5?3:2;
  for(let i=0;i<nd;i++){ const el=document.getElementById('rcD'+i); if(el) rcState.d[i]=+el.value; }
  const m=document.getElementById('rcMul'); if(m) rcState.mul=+m.value;
  const t=document.getElementById('rcTol'); if(t) rcState.tol=+t.value;
  const tc=document.getElementById('rcTc'); if(tc) rcState.tc=+tc.value;
}
function setRcBands(n){ syncRcState(); RC_BANDS=n; renderRcControls(); rcCalc(); }
function initRc(){ RC_BANDS=4; rcState={d:[1,0,0],mul:2,tol:6,tc:0}; renderRcControls(); rcCalc(); }
function rcCycle(id){ const el=document.getElementById(id); if(!el)return; el.selectedIndex=(el.selectedIndex+1)%el.options.length; rcCalc(); }

function drawResistor(bands){
  const leftCount = bands.length - (RC_BANDS===6?2:1);
  const W=15, y0=44, y1=136;
  let bandSvg='';
  bands.forEach((b,i)=>{
    let cx;
    if(i<leftCount) cx=148+i*24;
    else if(i===leftCount) cx=296;
    else cx=320;
    const x=cx-W/2;
    bandSvg+=`<g style="cursor:pointer" onclick="rcCycle('${b.sel}')">
      <rect class="rc-band" x="${x}" y="${y0}" width="${W}" height="${y1-y0}" fill="${b.color}" clip-path="url(#bodyClip)"/>
      <rect x="${x}" y="${y0}" width="${W}" height="10" fill="rgba(255,255,255,.22)" clip-path="url(#bodyClip)"/>
      <rect x="${x}" y="${y1-12}" width="${W}" height="12" fill="rgba(0,0,0,.18)" clip-path="url(#bodyClip)"/>
    </g>`;
  });
  const bodyPath="M150,44 H310 C330,44 342,62 342,90 C342,118 330,136 310,136 H150 C130,136 118,118 118,90 C118,62 130,44 150,44 Z";
  document.getElementById('rcSvgWrap').innerHTML=`<svg viewBox="0 0 460 180" class="rc-svg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="rcBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ece0c2"/><stop offset=".5" stop-color="#dcc89c"/><stop offset="1" stop-color="#b89a64"/></linearGradient>
      <linearGradient id="rcLead" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef0f3"/><stop offset=".5" stop-color="#9fa3ad"/><stop offset="1" stop-color="#646874"/></linearGradient>
      <clipPath id="bodyClip"><path d="${bodyPath}"/></clipPath>
    </defs>
    <rect x="6" y="85.5" width="124" height="9" rx="4.5" fill="url(#rcLead)"/>
    <rect x="330" y="85.5" width="124" height="9" rx="4.5" fill="url(#rcLead)"/>
    <path d="${bodyPath}" fill="url(#rcBody)" stroke="#a98c5a" stroke-width="1.2"/>
    <rect x="124" y="54" width="212" height="13" rx="6.5" fill="rgba(255,255,255,.30)" clip-path="url(#bodyClip)"/>
    <rect x="124" y="120" width="212" height="11" fill="rgba(0,0,0,.16)" clip-path="url(#bodyClip)"/>
    ${bandSvg}
  </svg>`;
}

function rcCalc(){
  syncRcState();
  const nd = RC_BANDS>=5?3:2;
  const digs = rcState.d.slice(0,nd);
  let digits=0; digs.forEach(di=>{ digits = digits*10 + RC_DIGIT[di].d; });
  const mul=RC_MUL[rcState.mul], tol=RC_TOL[rcState.tol];
  const val=digits*Math.pow(10,mul.e);
  let bands=[];
  for(let i=0;i<nd;i++) bands.push({color:RC_DIGIT[digs[i]].c, sel:'rcD'+i});
  bands.push({color:mul.c, sel:'rcMul'});
  bands.push({color:tol.c, sel:'rcTol'});
  let tc=null;
  if(RC_BANDS===6){ tc=RC_TC[rcState.tc]; bands.push({color:tc.c, sel:'rcTc'}); }
  drawResistor(bands);
  document.getElementById('rcRes').innerHTML=`<div class="rc-ohm">${fmtOhm(val)}</div>
    <div class="rc-range">±${tol.t}% · ${fmtOhm(val*(1-tol.t/100))} – ${fmtOhm(val*(1+tol.t/100))}</div>
    ${tc?`<div class="rc-tc">Sıcaklık katsayısı: ${tc.tc} ppm/K</div>`:''}`;
}

// ── Series / Parallel ──
function spCalc(){
  const res=document.getElementById('spRes');
  const vals=v('spVals').split(',').map(x=>parseFloat(x.trim())).filter(x=>!isNaN(x)&&x>0);
  if(vals.length<1){ res.className='tool-result empty-res'; res.textContent='Birden çok direnç değeri gir.'; return; }
  const series=vals.reduce((a,b)=>a+b,0);
  const parallel=1/vals.reduce((a,b)=>a+1/b,0);
  res.className='tool-result';
  res.innerHTML=`${vals.length} direnç<br>
    Seri toplam: <span class="tr-val">${fmtOhm(series)}</span><br>
    Paralel eşdeğer: <span class="tr-val">${fmtOhm(parallel)}</span>`;
}

// ── Reactance / Resonance ──
function rxCalc(){
  const f=parseFloat(v('rxF')), L=parseFloat(v('rxL')), C=parseFloat(v('rxC'));
  const res=document.getElementById('rxRes');
  let out=[];
  if(!isNaN(f)&&!isNaN(L)) out.push(`Endüktif reaktans X<sub>L</sub>: <span class="tr-val">${fmtOhm(2*Math.PI*f*L)}</span>`);
  if(!isNaN(f)&&!isNaN(C)&&C>0) out.push(`Kapasitif reaktans X<sub>C</sub>: <span class="tr-val">${fmtOhm(1/(2*Math.PI*f*C))}</span>`);
  if(!isNaN(L)&&!isNaN(C)&&L>0&&C>0) out.push(`Rezonans frekansı f₀: <span class="tr-val">${fmtNum(1/(2*Math.PI*Math.sqrt(L*C)))} Hz</span>`);
  if(!out.length){ res.className='tool-result empty-res'; res.textContent='Frekans ve L/C gir.'; return; }
  res.className='tool-result'; res.innerHTML=out.join('<br>');
}

// ═══════════════════════════════════════════════════
// USEFUL LINKS
const LINK_SECTIONS=[
  {title:'🧪 Simülatörler & Tasarım', links:[
    {n:'Falstad Circuit Sim', d:'Tarayıcıda interaktif analog/dijital devre simülatörü.', u:'https://www.falstad.com/circuit/', ic:'⚡'},
    {n:'Tinkercad Circuits', d:'Breadboard + Arduino simülasyonu, başlangıç için ideal.', u:'https://www.tinkercad.com/circuits', ic:'🔌'},
    {n:'LTspice', d:'Analog Devices’in ücretsiz SPICE simülatörü (indirilir).', u:'https://www.analog.com/en/resources/design-tools-and-calculators/ltspice-simulator.html', ic:'📉'},
    {n:'CircuitVerse', d:'Çevrimiçi dijital mantık devresi tasarımı.', u:'https://circuitverse.org/', ic:'🖥️'},
    {n:'EveryCircuit', d:'Gerçek zamanlı dalga formlarıyla devre animasyonu.', u:'https://everycircuit.com/', ic:'🌀'},
  ]},
  {title:'🎓 Dersler & Videolar', links:[
    {n:'MIT OCW 6.002', d:'Circuits and Electronics — efsane MIT dersi, ücretsiz.', u:'https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/', ic:'🏛️'},
    {n:'Khan Academy', d:'Devreler, elektrostatik ve sinyaller — temelden anlatım.', u:'https://www.khanacademy.org/science/electrical-engineering', ic:'📚'},
    {n:'All About Circuits', d:'Kapsamlı ücretsiz ders kitapları ve makaleler.', u:'https://www.allaboutcircuits.com/textbook/', ic:'📖'},
    {n:'Electronics Tutorials', d:'Konu konu elektronik anlatımları + örnekler.', u:'https://www.electronics-tutorials.ws/', ic:'💡'},
    {n:'3Blue1Brown', d:'Lineer cebir, kalkülüs, Fourier — görsel matematik.', u:'https://www.3blue1brown.com/', ic:'🎬'},
    {n:'NPTEL EE', d:'Hindistan IIT mühendislik ders arşivi (video).', u:'https://nptel.ac.in/course.html', ic:'🎥'},
  ]},
  {title:'🧰 Referans & Araçlar', links:[
    {n:'Wolfram Alpha', d:'Denklem çözücü, integral, dönüşümler — hesap motoru.', u:'https://www.wolframalpha.com/', ic:'🧠'},
    {n:'Desmos Grafik', d:'Çevrimiçi grafik çizici, fonksiyon görselleştirme.', u:'https://www.desmos.com/calculator', ic:'📈'},
    {n:'AllDataSheet', d:'Komponent datasheet arama motoru.', u:'https://www.alldatasheet.com/', ic:'📄'},
    {n:'Octopart', d:'Elektronik parça arama & fiyat karşılaştırma.', u:'https://octopart.com/', ic:'🔍'},
    {n:'Overleaf', d:'Çevrimiçi LaTeX — rapor ve ödevler için.', u:'https://www.overleaf.com/', ic:'✍️'},
    {n:'GNU Octave', d:'MATLAB uyumlu ücretsiz sayısal hesaplama ortamı.', u:'https://octave.org/', ic:'🧮'},
  ]},
];
function buildLinks(){
  document.getElementById('linkSections').innerHTML=LINK_SECTIONS.map(sec=>`
    <div class="sec-head"><div class="sec-title">${sec.title}</div></div>
    <div class="link-grid">
      ${sec.links.map(l=>`<a class="link-card" href="${l.u}" target="_blank" rel="noopener noreferrer">
        <div class="link-ico">${l.ic}</div>
        <div style="min-width:0">
          <div class="link-name">${esc(l.n)} <span class="ext">↗</span></div>
          <div class="link-desc">${esc(l.d)}</div>
        </div>
      </a>`).join('')}
    </div>`).join('');
}

// ═══════════════════════════════════════════════════
// LEADERBOARD
async function buildLeaderboard(){
  const files=await dbAll('files'), users=await dbAll('users');
  const stat={};
  users.forEach(u=>stat[u.id]={id:u.id,name:u.name,year:u.year,up:0,dl:0,lk:0});
  files.forEach(f=>{
    const s=stat[f.uploaderId]; if(!s)return;
    s.up++; s.dl+=(f.downloads||0); s.lk+=(f.likes||[]).length;
  });
  let rows=Object.values(stat).filter(s=>s.up>0)
    .map(s=>({...s,score:s.up*5+s.lk*2+s.dl}))
    .sort((a,b)=>b.score-a.score);
  const el=document.getElementById('lbList');
  if(!rows.length){
    el.innerHTML=`<div class="empty"><div class="empty-icon">🏆</div><div class="empty-title">Henüz katkı yok</div><div class="empty-desc">İlk kaynağı yükle ve liderlik tablosunu sen başlat!</div><button class="btn btn-brand" onclick="openUpload()">⬆ Dosya Yükle</button></div>`;
    return;
  }
  const medal=i=>['🥇','🥈','🥉'][i]||(i+1);
  el.innerHTML=rows.map((r,i)=>`
    <div class="lb-row ${i===0?'top1':''}">
      <div class="lb-rank">${medal(i)}</div>
      <div class="avatar avatar-md">${esc((r.name||'?')[0])}</div>
      <div style="min-width:0">
        <div class="lb-name">${esc(r.name)} ${r.id===SESSION.userId?'<span class="tag tag-brand" style="margin-left:6px">Sen</span>':''}</div>
        <div class="lb-sub">${r.year==='mezun'?'Mezun':r.year+'. Sınıf'} · ${r.score} puan</div>
      </div>
      <div class="lb-stats">
        <div><div class="lb-stat-val">${r.up}</div><div class="lb-stat-lbl">Yükleme</div></div>
        <div><div class="lb-stat-val">${r.lk}</div><div class="lb-stat-lbl">Beğeni</div></div>
        <div><div class="lb-stat-val">${r.dl}</div><div class="lb-stat-lbl">İndirme</div></div>
      </div>
    </div>`).join('');
}

// ═══════════════════════════════════════════════════
// DATA EXPORT / IMPORT
async function exportData(){
  const users=await dbAll('users'), files=await dbAll('files');
  const payload={app:'VoltHub',v:1,exportedAt:Date.now(),users,files};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob), a=document.createElement('a');
  a.href=url; a.download='volthub-yedek-'+new Date().toISOString().slice(0,10)+'.json';
  a.click(); URL.revokeObjectURL(url);
  toast('💾 Yedek indirildi!');
}

async function importData(file){
  if(!file)return;
  if(!confirm('Mevcut tüm kaynaklar ve hesaplar silinip yedekteki verilerle değiştirilecek. Devam edilsin mi?')){
    document.getElementById('importInput').value=''; return;
  }
  try{
    const data=JSON.parse(await file.text());
    if(!Array.isArray(data.users)||!Array.isArray(data.files))throw new Error('format');
    await dbClear('users'); await dbClear('files');
    for(const u of data.users)await dbPut('users',u);
    for(const f of data.files)await dbPut('files',f);
    toast('✅ Yedek geri yüklendi, yenileniyor…');
    setTimeout(()=>location.reload(),900);
  }catch(err){
    toast('❌ Geçersiz yedek dosyası.');
    document.getElementById('importInput').value='';
  }
}

// ═══════════════════════════════════════════════════
// BOOT
(async()=>{ await initDB(); if(loadSession())enterApp(); })();
