-- Live preview support + fix RLS for publishable key writes
-- Run once in Supabase SQL Editor, then re-run: npx tsx --env-file=.env.local scripts/ingest-blendy.ts

alter table public.prompts
  drop constraint if exists prompts_media_type_check;

alter table public.prompts
  add constraint prompts_media_type_check
  check (media_type in ('video', 'image', 'live_preview') or media_type is null);

alter table public.prompts
  add column if not exists preview_html text;

alter table public.prompts
  add column if not exists backdrop_color text;

-- Allow self-contained HTML previews in Storage (optional)
update storage.buckets
set allowed_mime_types = array[
  'video/mp4','video/webm','video/quicktime',
  'image/png','image/jpeg','image/webp','image/gif','image/avif',
  'text/html','text/plain','application/octet-stream'
]
where id = 'previews';

drop policy if exists "Anon insert prompts" on public.prompts;
create policy "Anon insert prompts"
  on public.prompts for insert to anon, authenticated
  with check (true);

drop policy if exists "Anon update prompts" on public.prompts;
create policy "Anon update prompts"
  on public.prompts for update to anon, authenticated
  using (true) with check (true);

drop policy if exists "Anon delete prompts" on public.prompts;
create policy "Anon delete prompts"
  on public.prompts for delete to anon, authenticated
  using (true);
