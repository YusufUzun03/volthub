-- ═══════════════════════════════════════════════════════════
--  VOLTHUB · SUPABASE KURULUM
--  Supabase panelinde:  SQL Editor → New query → bu dosyanın
--  TAMAMINI yapıştır → "Run".  Tek seferde çalışır.
-- ═══════════════════════════════════════════════════════════

-- ── 1) PROFİLLER (auth.users'ın eşi) ──────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text default '',
  year        text default '',
  is_admin    boolean default false,
  banned      boolean default false,
  downloads   int default 0,
  created_at  timestamptz default now()
);

-- ── 2) DOSYALAR (meta veri; gerçek dosya Storage'da) ──────
create table if not exists public.files (
  id            bigint generated always as identity primary key,
  title         text not null,
  description   text default '',
  type          text default 'diger',
  ders          text default '',
  uploader_id   uuid references public.profiles(id) on delete set null,
  uploader_name text default '',
  file_path     text,
  file_name     text,
  size          bigint default 0,
  downloads     int default 0,
  created_at    timestamptz default now()
);

-- ── 3) ETKİLEŞİM TABLOLARI ────────────────────────────────
create table if not exists public.likes (
  file_id bigint references public.files(id) on delete cascade,
  user_id uuid   references public.profiles(id) on delete cascade,
  primary key (file_id, user_id)
);
create table if not exists public.saves (
  file_id bigint references public.files(id) on delete cascade,
  user_id uuid   references public.profiles(id) on delete cascade,
  primary key (file_id, user_id)
);
create table if not exists public.ratings (
  file_id bigint references public.files(id) on delete cascade,
  user_id uuid   references public.profiles(id) on delete cascade,
  score   int check (score between 1 and 5),
  primary key (file_id, user_id)
);
create table if not exists public.comments (
  id         bigint generated always as identity primary key,
  file_id    bigint references public.files(id) on delete cascade,
  user_id    uuid   references public.profiles(id) on delete set null,
  user_name  text default '',
  body       text not null,
  created_at timestamptz default now()
);

-- ── 4) ADMIN YARDIMCI FONKSİYONU ──────────────────────────
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ── 5) YENİ KAYITTA OTOMATİK PROFİL OLUŞTUR ───────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, year)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'name',''),
          coalesce(new.raw_user_meta_data->>'year',''));
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 6) RLS'İ AÇ ───────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.files    enable row level security;
alter table public.likes    enable row level security;
alter table public.saves    enable row level security;
alter table public.ratings  enable row level security;
alter table public.comments enable row level security;

-- ── 7) POLİTİKALAR ────────────────────────────────────────
drop policy if exists p_profiles_sel on public.profiles;
create policy p_profiles_sel on public.profiles for select using (true);
drop policy if exists p_profiles_ins on public.profiles;
create policy p_profiles_ins on public.profiles for insert with check (id = auth.uid());
drop policy if exists p_profiles_upd on public.profiles;
create policy p_profiles_upd on public.profiles for update
  using (id = auth.uid() or public.is_admin());

drop policy if exists p_files_sel on public.files;
create policy p_files_sel on public.files for select using (true);
drop policy if exists p_files_ins on public.files;
create policy p_files_ins on public.files for insert with check (
  auth.uid() = uploader_id
  and coalesce((select banned from public.profiles where id = auth.uid()), false) = false
);
drop policy if exists p_files_upd on public.files;
create policy p_files_upd on public.files for update
  using (auth.uid() = uploader_id or public.is_admin());
drop policy if exists p_files_del on public.files;
create policy p_files_del on public.files for delete
  using (auth.uid() = uploader_id or public.is_admin());

drop policy if exists p_likes_sel on public.likes;
create policy p_likes_sel on public.likes for select using (true);
drop policy if exists p_likes_ins on public.likes;
create policy p_likes_ins on public.likes for insert with check (user_id = auth.uid());
drop policy if exists p_likes_del on public.likes;
create policy p_likes_del on public.likes for delete using (user_id = auth.uid() or public.is_admin());

drop policy if exists p_saves_sel on public.saves;
create policy p_saves_sel on public.saves for select using (true);
drop policy if exists p_saves_ins on public.saves;
create policy p_saves_ins on public.saves for insert with check (user_id = auth.uid());
drop policy if exists p_saves_del on public.saves;
create policy p_saves_del on public.saves for delete using (user_id = auth.uid() or public.is_admin());

drop policy if exists p_ratings_sel on public.ratings;
create policy p_ratings_sel on public.ratings for select using (true);
drop policy if exists p_ratings_ins on public.ratings;
create policy p_ratings_ins on public.ratings for insert with check (user_id = auth.uid());
drop policy if exists p_ratings_upd on public.ratings;
create policy p_ratings_upd on public.ratings for update using (user_id = auth.uid());
drop policy if exists p_ratings_del on public.ratings;
create policy p_ratings_del on public.ratings for delete using (user_id = auth.uid() or public.is_admin());

drop policy if exists p_comments_sel on public.comments;
create policy p_comments_sel on public.comments for select using (true);
drop policy if exists p_comments_ins on public.comments;
create policy p_comments_ins on public.comments for insert with check (user_id = auth.uid());
drop policy if exists p_comments_del on public.comments;
create policy p_comments_del on public.comments for delete using (user_id = auth.uid() or public.is_admin());

-- ── 8) STORAGE POLİTİKALARI ───────────────────────────────
-- ÖNCE panelden: Storage → New bucket → adı "files" → Public = AÇIK
drop policy if exists p_obj_sel on storage.objects;
create policy p_obj_sel on storage.objects for select using (bucket_id = 'files');
drop policy if exists p_obj_ins on storage.objects;
create policy p_obj_ins on storage.objects for insert to authenticated
  with check (bucket_id = 'files');
drop policy if exists p_obj_del on storage.objects;
create policy p_obj_del on storage.objects for delete
  using (bucket_id = 'files' and (owner = auth.uid() or public.is_admin()));

-- ═══════════════════════════════════════════════════════════
--  BİTTİ. SON ADIM — KENDİNİ ADMIN YAP:
--  Siteden normal kayıt ol, sonra şunu çalıştır (e-postanı yaz):
--
--  update public.profiles set is_admin = true
--  where id = (select id from auth.users where email = 'SENIN_EPOSTAN@ornek.com');
-- ═══════════════════════════════════════════════════════════


-- İNDİRME SAYACI · SQL Editor'da çalıştır (tek seferlik)
-- Herkes indirebilsin ama sayaçlar RLS'i atlayarak güvenle artsın diye:
create or replace function public.bump_download(fid bigint)
returns void language sql security definer set search_path = public as $$
  update public.files    set downloads = downloads + 1 where id = fid;
  update public.profiles set downloads = downloads + 1 where id = auth.uid();
$$;
grant execute on function public.bump_download(bigint) to authenticated;



update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'yuzun2005@gmail.com');




-- ═══════════════════════════════════════════════════════════
--  VOLTHUB · GÖRÜNÜRLÜK / PAYLAŞIM
--  SQL Editor → New query → tamamını yapıştır → Run.
-- ═══════════════════════════════════════════════════════════

-- 1) Görünürlük sütunu: public | private | shared
alter table public.files add column if not exists visibility text default 'public';

-- 2) Paylaşım tablosu (shared modunda kimlerle paylaşıldığı)
create table if not exists public.file_shares (
  file_id bigint references public.files(id) on delete cascade,
  user_id uuid   references public.profiles(id) on delete cascade,
  primary key (file_id, user_id)
);
alter table public.file_shares enable row level security;

-- 3) Yardımcı fonksiyonlar (RLS sonsuz döngüsünü önlemek için SECURITY DEFINER)
create or replace function public.is_file_owner(fid bigint)
returns boolean language sql security definer set search_path=public as $$
  select exists(select 1 from public.files f where f.id=fid and f.uploader_id=auth.uid());
$$;
create or replace function public.is_shared_with_me(fid bigint)
returns boolean language sql security definer set search_path=public as $$
  select exists(select 1 from public.file_shares s where s.file_id=fid and s.user_id=auth.uid());
$$;

-- 4) DOSYA GÖRÜNÜRLÜK POLİTİKASI (eskisini değiştirir)
drop policy if exists p_files_sel on public.files;
create policy p_files_sel on public.files for select using (
  coalesce(visibility,'public') = 'public'
  or uploader_id = auth.uid()
  or public.is_admin()
  or ( visibility = 'shared' and public.is_shared_with_me(id) )
);

-- 5) PAYLAŞIM TABLOSU POLİTİKALARI
drop policy if exists p_fs_sel on public.file_shares;
create policy p_fs_sel on public.file_shares for select using (
  user_id = auth.uid() or public.is_admin() or public.is_file_owner(file_id)
);
drop policy if exists p_fs_ins on public.file_shares;
create policy p_fs_ins on public.file_shares for insert with check ( public.is_file_owner(file_id) );
drop policy if exists p_fs_del on public.file_shares;
create policy p_fs_del on public.file_shares for delete using ( public.is_admin() or public.is_file_owner(file_id) );

-- ═══════════════════════════════════════════════════════════
--  BİTTİ. (Mevcut tüm dosyalar otomatik 'public' olur.)
-- ═══════════════════════════════════════════════════════════







-- ═══════════════════════════════════════════════════════════
--  VOLTHUB · SINAV ALT TÜRÜ + KAYNAK İSTEK PANOSU
--  SQL Editor → New query → yapıştır → Run.
-- ═══════════════════════════════════════════════════════════

-- 1) Sınav alt türü (vize/final/quiz)
alter table public.files add column if not exists subtype text;

-- 2) Kaynak istek panosu
create table if not exists public.requests (
  id         bigint generated always as identity primary key,
  user_id    uuid references public.profiles(id) on delete set null,
  user_name  text default '',
  ders       text default '',
  body       text not null,
  resolved   boolean default false,
  created_at timestamptz default now()
);
alter table public.requests enable row level security;
drop policy if exists p_req_sel on public.requests;
create policy p_req_sel on public.requests for select using (true);
drop policy if exists p_req_ins on public.requests;
create policy p_req_ins on public.requests for insert with check (user_id = auth.uid());
drop policy if exists p_req_upd on public.requests;
create policy p_req_upd on public.requests for update using (user_id = auth.uid() or public.is_admin());
drop policy if exists p_req_del on public.requests;
create policy p_req_del on public.requests for delete using (user_id = auth.uid() or public.is_admin());
-- ═══════════════════════════════════════════════════════════





-- ═══════════════════════════════════════════════════════════
--  VOLTHUB · ONLINE BAĞLANTI (URL) PAYLAŞIMI
--  SQL Editor → New query → yapıştır → Run.
-- ═══════════════════════════════════════════════════════════
alter table public.files add column if not exists url  text;
alter table public.files add column if not exists kind text default 'file';   -- 'file' | 'link'
-- ═══════════════════════════════════════════════════════════




-- ═══════════════════════════════════════════════════════════
--  VOLTHUB · YENİ SÜTUNLAR & TABLOLAR (supabase.js uyumu)
--  SQL Editor → New query → yapıştır → Run.
-- ═══════════════════════════════════════════════════════════

-- 1) Profil ek alanları (avatar + biyografi)
alter table public.profiles add column if not exists avatar text default 'a1';
alter table public.profiles add column if not exists bio    text default '';

-- 2) Dosya etiketleri
alter table public.files add column if not exists tags text[] default '{}';

-- 3) İstek oy tablosu (her kullanıcı bir isteğe bir kez oy verebilir)
create table if not exists public.request_votes (
  request_id bigint references public.requests(id) on delete cascade,
  user_id    uuid   references public.profiles(id) on delete cascade,
  primary key (request_id, user_id)
);
alter table public.request_votes enable row level security;

drop policy if exists p_rv_sel on public.request_votes;
create policy p_rv_sel on public.request_votes for select using (true);
drop policy if exists p_rv_ins on public.request_votes;
create policy p_rv_ins on public.request_votes for insert with check (user_id = auth.uid());
drop policy if exists p_rv_del on public.request_votes;
create policy p_rv_del on public.request_votes for delete using (user_id = auth.uid());

-- 4) requests_with_votes görünümü (oy sayısını hesaplar)
create or replace view public.requests_with_votes as
  select
    r.*,
    count(rv.user_id)::int as vote_count
  from public.requests r
  left join public.request_votes rv on rv.request_id = r.id
  group by r.id;

-- 5) Profil istatistikleri görünümü (liderlik tablosu için)
create or replace view public.profile_stats as
  select
    p.id, p.name, p.year, p.avatar, p.bio, p.is_admin, p.banned, p.created_at,
    count(distinct f.id)::int                      as upload_count,
    coalesce(sum(f.downloads), 0)::int             as download_count,
    count(distinct l.file_id)::int                 as like_count
  from public.profiles p
  left join public.files f  on f.uploader_id = p.id
  left join public.likes l  on l.file_id = f.id
  group by p.id;

-- ═══════════════════════════════════════════════════════════