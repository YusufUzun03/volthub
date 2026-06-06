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
