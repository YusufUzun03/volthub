/* ═══════════════════════════════════════════════════════════
   VOLTHUB — DATA
   EEE curriculum courses (EE-prefixed area codes), weekly topics,
   curated links, seed archive content, badges & achievements.
═══════════════════════════════════════════════════════════ */

// EEE müfredatı — ders alan kodları (EE ön ekli)
const DERSLER = [
  { id:'ee102', code:'EE 102', name:'Elektrik ve Elektronik Mühendisliğine Giriş', icon:'⚡', tint:'250', desc:'Mesleğe giriş, temel kavramlar ve laboratuvar.', sem:1 },
  { id:'ee211', code:'EE 211', name:'Elektrik Devreleri', icon:'🔌', tint:'250', desc:'KVL, KCL, Thevenin, Norton, süperpozisyon.', sem:3 },
  { id:'ee241', code:'EE 241', name:'Sayısal Devreler', icon:'🔢', tint:'155', desc:'Boole cebri, mantık kapıları, flip-flop, FSM.', sem:3 },
  { id:'ee212', code:'EE 212', name:'Devreler ve Sistemler', icon:'📐', tint:'250', desc:'AC devreler, fazörler, Laplace uygulamaları.', sem:4 },
  { id:'ee226', code:'EE 226', name:'Elektromanyetik Alanların Temelleri', icon:'🧲', tint:'25', desc:'Elektrostatik, manyetostatik, Maxwell girişi.', sem:4 },
  { id:'ee232', code:'EE 232', name:'Elektroniğe Giriş', icon:'🔬', tint:'250', desc:'Diyotlar, BJT, MOSFET, temel yükselteçler.', sem:4 },
  { id:'ee242', code:'EE 242', name:'Mikroişlemci Sistemleri', icon:'🖥️', tint:'295', desc:'Assembly, bellek, I/O, kesme yapıları.', sem:4 },
  { id:'ee323', code:'EE 323', name:'Elektromanyetik Dalgalar ve İletim Hatları', icon:'📡', tint:'25', desc:'Dalga yayılımı, iletim hatları, empedans.', sem:5 },
  { id:'ee333', code:'EE 333', name:'Analog Elektronik Devreleri', icon:'💡', tint:'250', desc:'Op-amp, geri beslemeli yükselteçler, filtreler.', sem:5 },
  { id:'ee361', code:'EE 361', name:'Sayısal İşaret İşlemeye Giriş', icon:'🎚️', tint:'295', desc:'Z-dönüşümü, DFT, FIR/IIR filtre tasarımı.', sem:5 },
  { id:'ee371', code:'EE 371', name:'Elektromekanik Enerji Dönüşümü', icon:'⚙️', tint:'155', desc:'Transformatörler, DC/AC motorlar, jeneratörler.', sem:5 },
  { id:'ee334', code:'EE 334', name:'Sayısal Elektronik Devreleri', icon:'🔩', tint:'250', desc:'CMOS mantık, FPGA, VHDL/Verilog temelleri.', sem:6 },
  { id:'ee354', code:'EE 354', name:'Haberleşme Sistemleri', icon:'📶', tint:'250', desc:'AM/FM, dijital modülasyon, Shannon, gürültü.', sem:6 },
  { id:'ee372', code:'EE 372', name:'Güç Sistemlerinin Temelleri', icon:'🔋', tint:'155', desc:'Güç analizi, kısa devre, yük akışı, koruma.', sem:6 },
  { id:'ee384', code:'EE 384', name:'Kontrol Sistemlerine Giriş', icon:'🎛️', tint:'250', desc:'Transfer fonksiyonu, Bode, Nyquist, PID.', sem:6 },
  { id:'ee491', code:'EE 491', name:'Mühendislik Projesine Giriş', icon:'📋', tint:'250', desc:'Bitirme projesi planlama, metodoloji, ara rapor.', sem:7 },
  { id:'ee492', code:'EE 492', name:'Mühendislik Projesi', icon:'🏆', tint:'68', desc:'Proje uygulaması, prototip, final raporu ve sunum.', sem:8 },
];

const SEM_LABEL = { 1:'1. Yarıyıl', 3:'3. Yarıyıl', 4:'4. Yarıyıl', 5:'5. Yarıyıl', 6:'6. Yarıyıl', 7:'7. Yarıyıl', 8:'8. Yarıyıl' };

const TOPICS = {
  ee102: ['Temel elektriksel büyüklükler','Ölçüm aletleri ve lab güvenliği','Devre elemanları','Mühendislik etiği','Mesleki alanlar','Dönem projesi & sunum'],
  ee211: ['Akım, gerilim, direnç','Kirchhoff yasaları','Düğüm & çevre analizi','Thevenin & Norton','Süperpozisyon','RC/RL geçici durum'],
  ee241: ['Sayı sistemleri & kodlar','Boole cebri','Mantık kapıları','Karnaugh haritaları','Flip-floplar','Sonlu durum makineleri'],
  ee212: ['Sinüzoidal kaynaklar','Fazör analizi','AC güç','Rezonans devreleri','Laplace dönüşümü','Transfer fonksiyonu'],
  ee226: ['Vektör analizi','Coulomb & Gauss','Elektrik potansiyeli','Kapasitans & dielektrik','Manyetostatik','Maxwell denklemleri'],
  ee232: ['Yarı iletken temelleri','Diyot uygulamaları','BJT yapısı','MOSFET temelleri','Polarlama','Temel yükselteç katları'],
  ee242: ['Mikroişlemci mimarisi','Assembly programlama','Bellek organizasyonu','I/O arabirimleri','Kesme yapıları','Zamanlayıcı & sayaçlar'],
  ee323: ['Düzlem dalga yayılımı','Yansıma & iletim','İletim hattı denklemleri','Smith abağı','Empedans uyumlama','Dalga kılavuzları'],
  ee333: ['Op-amp temelleri','İdeal vs gerçek op-amp','Geri besleme teorisi','Aktif filtre tasarımı','Osilatörler','Güç yükselteçleri'],
  ee361: ['Ayrık zamanlı sinyaller','Z-dönüşümü','DTFT & DFT','FFT algoritması','FIR filtre tasarımı','IIR filtre tasarımı'],
  ee371: ['Manyetik devreler','Transformatörler','Enerji dönüşüm ilkeleri','DC makineler','Senkron makineler','Asenkron motorlar'],
  ee334: ['CMOS invertör','Mantık aileleri','Bellek devreleri','Programlanabilir mantık','FPGA mimarisi','VHDL/Verilog'],
  ee354: ['Sinyal & spektrum','Genlik modülasyonu','Açı modülasyonu','Örnekleme teoremi','Dijital modülasyon','Gürültü & kanal kapasitesi'],
  ee372: ['Üç fazlı sistemler','Güç akışı analizi','Per-unit sistemi','Kısa devre analizi','Koruma röleleri','Generatör & iletim'],
  ee384: ['Sistem modelleme','Transfer fonksiyonu','Zaman cevabı','Kararlılık (Routh-Hurwitz)','Kök yer eğrisi','Bode, Nyquist & PID'],
  ee491: ['Problem tanımı','Literatür taraması','Proje planlama','Gereksinim analizi','Metodoloji seçimi','Ara rapor & sunum'],
  ee492: ['Tasarımın gerçeklenmesi','Prototipleme','Test & doğrulama','Maliyet analizi','Final raporu','Jüri sunumu'],
};

const TYPE_CFG = {
  not:    { label:'Ders Notu', icon:'📝', cls:'tp-not' },
  sinav:  { label:'Sınav',     icon:'📋', cls:'tp-sinav' },
  kitap:  { label:'Kitap',     icon:'📖', cls:'tp-kitap' },
  formul: { label:'Formül',    icon:'🧮', cls:'tp-formul' },
  diger:  { label:'Diğer',     icon:'📎', cls:'tp-diger' },
};

// Avatar renk presetleri (hue)
const AV_COLORS = {
  a1:'oklch(0.55 0.15 250)', a2:'oklch(0.58 0.14 155)', a3:'oklch(0.6 0.16 25)',
  a4:'oklch(0.56 0.15 295)', a5:'oklch(0.62 0.14 68)', a6:'oklch(0.5 0.13 200)',
  a7:'oklch(0.55 0.14 330)', a8:'oklch(0.45 0.04 260)',
};

// Küratörlü kaynaklar
const LINKS = [
  { title:'🧪 Simülatörler & Araçlar', items:[
    { n:'Falstad Circuit Sim', d:'Tarayıcıda interaktif analog/dijital devre simülasyonu.', u:'https://www.falstad.com/circuit/', ic:'🌀' },
    { n:'CircuitVerse', d:'Ücretsiz çevrimiçi dijital mantık devresi tasarımcısı.', u:'https://circuitverse.org/', ic:'🔧' },
    { n:'Desmos', d:'Sinyal ve fonksiyon grafiklerini çizmek için güçlü hesap makinesi.', u:'https://www.desmos.com/calculator', ic:'📈' },
    { n:'Wolfram Alpha', d:'Devre, integral ve diferansiyel denklem çözücü.', u:'https://www.wolframalpha.com/', ic:'🧠' },
  ]},
  { title:'🎓 Dersler & Videolar', items:[
    { n:'MIT OCW 6.002', d:'Circuits and Electronics — efsane MIT dersi, ücretsiz.', u:'https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/', ic:'🏛️' },
    { n:'Khan Academy', d:'Devreler, elektrostatik ve sinyaller — temelden anlatım.', u:'https://www.khanacademy.org/science/electrical-engineering', ic:'📚' },
    { n:'All About Circuits', d:'Kapsamlı ücretsiz ders kitapları ve makaleler.', u:'https://www.allaboutcircuits.com/textbook/', ic:'📖' },
    { n:'NPTEL', d:'Hint üniversitelerinden ileri seviye EEE video dersleri.', u:'https://nptel.ac.in/', ic:'🎥' },
  ]},
  { title:'📐 Referans & Hesap', items:[
    { n:'Octave Online', d:'Tarayıcıda MATLAB-uyumlu sayısal hesaplama.', u:'https://octave-online.net/', ic:'➗' },
    { n:'Smith Chart Tool', d:'İletim hattı ve empedans uyumlama için Smith abağı.', u:'https://www.will-kelsey.com/smith_chart/', ic:'🎯' },
    { n:'Digi-Key Calculators', d:'Direnç, kapasitör ve dönüştürme hesaplayıcıları.', u:'https://www.digikey.com/en/resources/conversion-calculators', ic:'🧮' },
  ]},
];

// ── Seed kullanıcılar ──
const SEED_PROFILES = [
  { id:'u_elif',   name:'Elif Demir',     year:3, avatar:'a1', uploads:14, likes:62, dls:340 },
  { id:'u_kaan',   name:'Kaan Yılmaz',    year:4, avatar:'a2', uploads:11, likes:48, dls:280 },
  { id:'u_zeynep', name:'Zeynep Aksoy',   year:2, avatar:'a4', uploads:9,  likes:51, dls:190 },
  { id:'u_mert',   name:'Mert Çelik',     year:4, avatar:'a3', uploads:7,  likes:33, dls:155 },
  { id:'u_irem',   name:'İrem Şahin',     year:3, avatar:'a5', uploads:6,  likes:40, dls:120 },
  { id:'u_burak',  name:'Burak Öztürk',   year:'mezun', avatar:'a6', uploads:5, likes:28, dls:210 },
  { id:'u_sena',   name:'Sena Korkmaz',   year:2, avatar:'a7', uploads:4,  likes:19, dls:88 },
];

// ── Seed kaynaklar ──
const now = Date.now();
const day = 86400000;
const SEED_FILES = [
  { id:'f1', title:'Elektrik Devreleri — Vize 1 Çözümlü Sorular', ders:'ee211', type:'sinav', subtype:'vize', desc:'2024 güz dönemi vize sorularının adım adım çözümü, Thevenin ağırlıklı.', tags:['vize','2024','thevenin'], uid:'u_elif', t: now-2*day, dls:142, likes:38, kind:'file', ext:'pdf' },
  { id:'f2', title:'Thevenin & Norton Özet Notu', ders:'ee211', type:'not', desc:'Tek sayfada eşdeğer devre çıkarma yöntemleri ve püf noktaları.', tags:['özet','thevenin','norton'], uid:'u_kaan', t: now-5*day, dls:98, likes:27, kind:'file', ext:'pdf' },
  { id:'f3', title:'Sayısal Devreler Formül Kağıdı', ders:'ee241', type:'formul', desc:'Boole özdeşlikleri, kapı tabloları ve K-map kuralları.', tags:['formül','boole','kmap'], uid:'u_zeynep', t: now-1*day, dls:76, likes:31, kind:'file', ext:'pdf' },
  { id:'f4', title:'Nilsson — Electric Circuits 11. Baskı (Özet)', ders:'ee211', type:'kitap', desc:'Bölüm bölüm kitap özeti ve önemli teoremler.', tags:['kitap','nilsson','özet'], uid:'u_mert', t: now-8*day, dls:210, likes:44, kind:'file', ext:'pdf' },
  { id:'f5', title:'Op-Amp Konfigürasyonları Şeması', ders:'ee333', type:'not', desc:'İnvertör, non-invertör, integratör, türev alıcı devre şemaları.', tags:['opamp','analog','şema'], uid:'u_irem', t: now-3*day, dls:64, likes:22, kind:'file', ext:'png' },
  { id:'f6', title:'EE 232 Final Örnek Soru Bankası', ders:'ee232', type:'sinav', subtype:'final', desc:'Geçmiş yıl finallerinden derlenmiş 40 soru.', tags:['final','soru bankası','bjt'], uid:'u_kaan', t: now-6*day, dls:188, likes:52, kind:'file', ext:'pdf' },
  { id:'f7', title:'Laplace Dönüşüm Tablosu', ders:'ee212', type:'formul', desc:'Sık kullanılan dönüşüm çiftleri ve özellikleri.', tags:['laplace','formül'], uid:'u_elif', t: now-4*day, dls:130, likes:35, kind:'file', ext:'pdf' },
  { id:'f8', title:'Maxwell Denklemleri — Diferansiyel & İntegral Form', ders:'ee226', type:'not', desc:'Dört denklemin fiziksel yorumu ve birimleri.', tags:['maxwell','em','özet'], uid:'u_burak', t: now-10*day, dls:54, likes:18, kind:'file', ext:'pdf' },
  { id:'f9', title:'Mikroişlemci Lab — 8051 Assembly Notları', ders:'ee242', type:'not', desc:'Komut seti, adresleme modları ve örnek programlar.', tags:['8051','assembly','lab'], uid:'u_zeynep', t: now-7*day, dls:81, likes:24, kind:'file', ext:'docx' },
  { id:'f10', title:'Kontrol Sistemleri — Bode & Nyquist Cheatsheet', ders:'ee384', type:'formul', desc:'Kararlılık kriterleri ve çizim adımları tek sayfada.', tags:['kontrol','bode','nyquist'], uid:'u_mert', t: now-1.5*day, dls:47, likes:20, kind:'file', ext:'pdf' },
  { id:'f11', title:'DSP — Z-Dönüşümü Çözümlü Örnekler', ders:'ee361', type:'sinav', subtype:'quiz', desc:'Quiz hazırlığı için 15 çözümlü Z-dönüşümü sorusu.', tags:['dsp','z-transform','quiz'], uid:'u_irem', t: now-9*day, dls:39, likes:15, kind:'file', ext:'pdf' },
  { id:'f12', title:'Güç Sistemleri — Per-Unit Hesap Rehberi', ders:'ee372', type:'not', desc:'Per-unit sistemine geçiş ve kısa devre örnekleri.', tags:['güç','per-unit'], uid:'u_burak', t: now-12*day, dls:33, likes:12, kind:'file', ext:'pdf' },
  { id:'f13', title:'Haberleşme Sistemleri Ders Videosu (AM/FM)', ders:'ee354', type:'diger', desc:'Modülasyon konusunu anlatan harici video bağlantısı.', tags:['video','modülasyon'], uid:'u_kaan', t: now-2.5*day, dls:58, likes:21, kind:'link', url:'https://www.youtube.com/' },
  { id:'f14', title:'Sayısal Devreler — Final Çözümleri 2023', ders:'ee241', type:'sinav', subtype:'final', desc:'2023 final tam çözüm, FSM tasarım sorusu dahil.', tags:['final','2023','fsm'], uid:'u_sena', t: now-5.5*day, dls:112, likes:29, kind:'file', ext:'pdf' },
];

const SEED_REQUESTS = [
  { id:'r1', text:'EE 211 2023 bütünleme soruları arıyorum', ders:'ee211', uid:'u_sena', t: now-1*day, votes:7, resolved:false },
  { id:'r2', text:'Analog elektronik (EE 333) lab föyleri var mı?', ders:'ee333', uid:'u_mert', t: now-3*day, votes:4, resolved:false },
  { id:'r3', text:'Sinyaller ve sistemler için iyi bir Türkçe kaynak önerisi', ders:'ee212', uid:'u_zeynep', t: now-6*day, votes:11, resolved:false },
  { id:'r4', text:'EE 242 vize çıkmış sorular (çözümlü olursa süper)', ders:'ee242', uid:'u_irem', t: now-2*day, votes:5, resolved:false },
];

// ── Rozet kademeleri (topluluk puanına göre) ──
// puan = yükleme×5 + alınan beğeni×2 + alınan indirme
const BADGE_TIERS = [
  { min: 0,    key:'acemi',  name:'Yeni Üye', icon:'🔌', color:'oklch(0.62 0.010 70)',  soft:'oklch(0.94 0.005 80)' },
  { min: 50,   key:'bronz',  name:'Bronz',    icon:'🥉', color:'oklch(0.55 0.09 55)',   soft:'oklch(0.93 0.04 60)' },
  { min: 150,  key:'gumus',  name:'Gümüş',    icon:'🥈', color:'oklch(0.55 0.015 250)', soft:'oklch(0.93 0.012 250)' },
  { min: 350,  key:'altin',  name:'Altın',    icon:'🥇', color:'oklch(0.62 0.13 85)',   soft:'oklch(0.94 0.06 90)' },
  { min: 700,  key:'platin', name:'Platin',   icon:'💎', color:'oklch(0.55 0.10 200)',  soft:'oklch(0.93 0.05 200)' },
  { min: 1200, key:'efsane', name:'Efsane',   icon:'👑', color:'oklch(0.52 0.16 300)',  soft:'oklch(0.93 0.06 300)' },
];
function badgeFor(score) {
  let b = BADGE_TIERS[0];
  for (const t of BADGE_TIERS) if (score >= t.min) b = t;
  const idx = BADGE_TIERS.indexOf(b);
  const next = BADGE_TIERS[idx + 1] || null;
  return { ...b, next };
}

// ── Başarımlar (kullanıcı istatistiklerinden hesaplanır) ──
// metric anahtarları app.js'te myStats() içinde üretilir
const ACHIEVEMENTS = [
  { id:'ilk_adim',   icon:'🌱', name:'İlk Adım',      desc:'İlk kaynağını yükle',                metric:'uploads',       goal:1 },
  { id:'arsivci',    icon:'📚', name:'Arşivci',        desc:'5 kaynak paylaş',                    metric:'uploads',       goal:5 },
  { id:'kutuphaneci',icon:'🏛️', name:'Kütüphaneci',   desc:'15 kaynak paylaş',                   metric:'uploads',       goal:15 },
  { id:'begenilen',  icon:'⭐', name:'Beğenilen',      desc:'Yüklediklerin 25 beğeni toplasın',   metric:'likesReceived', goal:25 },
  { id:'fenomen',    icon:'🔥', name:'Fenomen',        desc:'100 beğeni topla',                   metric:'likesReceived', goal:100 },
  { id:'dagitici',   icon:'⬇️', name:'Dağıtıcı',       desc:'Yüklediklerin 250 kez indirilsin',   metric:'dlsReceived',   goal:250 },
  { id:'koleksiyon', icon:'🔖', name:'Koleksiyoner',   desc:'10 kaynak kaydet',                   metric:'saves',         goal:10 },
  { id:'comert',     icon:'❤️', name:'Cömert',         desc:'15 kaynağı beğen',                   metric:'likesGiven',    goal:15 },
  { id:'destekci',   icon:'🤝', name:'Destekçi',       desc:'5 isteğe destek ver',                metric:'votes',         goal:5 },
  { id:'talepkar',   icon:'📥', name:'Talepkâr',       desc:'İlk kaynak isteğini oluştur',        metric:'requests',      goal:1 },
];
