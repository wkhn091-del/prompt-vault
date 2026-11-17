-- 1) Allow updates/deletes with the publishable key (personal vault)
drop policy if exists "Anon update prompts" on public.prompts;
create policy "Anon update prompts"
  on public.prompts
  for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Anon delete prompts" on public.prompts;
create policy "Anon delete prompts"
  on public.prompts
  for delete
  to anon, authenticated
  using (true);

-- 2) Fix Blendy preview (already mirrored to Supabase Storage)
update public.prompts
set
  media_url = 'https://nbaiesobfntxhitwgwjo.supabase.co/storage/v1/object/public/previews/b8b453273a12860a88c4.webp',
  media_type = 'image'
where title = 'Blendy';
