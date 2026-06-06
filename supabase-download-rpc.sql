-- İNDİRME SAYACI · SQL Editor'da çalıştır (tek seferlik)
-- Herkes indirebilsin ama sayaçlar RLS'i atlayarak güvenle artsın diye:
create or replace function public.bump_download(fid bigint)
returns void language sql security definer set search_path = public as $$
  update public.files    set downloads = downloads + 1 where id = fid;
  update public.profiles set downloads = downloads + 1 where id = auth.uid();
$$;
grant execute on function public.bump_download(bigint) to authenticated;
