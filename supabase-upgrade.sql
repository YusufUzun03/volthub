-- ═══════════════════════════════════════════════════════════
--  VOLTHUB · EK ÖZELLİKLER (bildir + etiket + avatar)
--  SQL Editor → New query → tamamını yapıştır → Run.
-- ═══════════════════════════════════════════════════════════

-- 1) ŞİKAYET/BİLDİR tablosu
create table if not exists public.reports (
  id          bigint generated always as identity primary key,
  file_id     bigint references public.files(id) on delete cascade,
  reporter_id uuid   references public.profiles(id) on delete set null,
  reason      text default '',
  resolved    boolean default false,
  created_at  timestamptz default now()
);
alter table public.reports enable row level security;
drop policy if exists p_reports_ins on public.reports;
create policy p_reports_ins on public.reports for insert with check (reporter_id = auth.uid());
drop policy if exists p_reports_sel on public.reports;
create policy p_reports_sel on public.reports for select using (public.is_admin());
drop policy if exists p_reports_upd on public.reports;
create policy p_reports_upd on public.reports for update using (public.is_admin());
drop policy if exists p_reports_del on public.reports;
create policy p_reports_del on public.reports for delete using (public.is_admin());

-- 2) ETİKETLER (dosyalara)
alter table public.files add column if not exists tags text[] default '{}';

-- 3) AVATAR seçimi (profillere) — 'a1'..'a5'
alter table public.profiles add column if not exists avatar text default 'a1';

-- ═══════════════════════════════════════════════════════════
--  BİTTİ.
-- ═══════════════════════════════════════════════════════════
