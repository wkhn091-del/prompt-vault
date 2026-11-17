-- Prompt Vault — full schema (run in Supabase SQL Editor)

create extension if not exists "pgcrypto";

create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null default 'Creative',
  prompt_text text not null,
  media_url text,
  media_type text check (media_type in ('video', 'image', 'live_preview') or media_type is null),
  preview_html text,
  backdrop_color text,
  normalized_hash text not null,
  is_premium boolean not null default false,
  price numeric not null default 0,
  created_at timestamptz not null default now()
);

-- Migrations for existing projects
alter table public.prompts drop constraint if exists prompts_media_type_check;
alter table public.prompts add constraint prompts_media_type_check
  check (media_type in ('video', 'image', 'live_preview') or media_type is null);
alter table public.prompts add column if not exists preview_html text;
alter table public.prompts add column if not exists backdrop_color text;

create index if not exists prompts_normalized_hash_idx on public.prompts (normalized_hash);
create index if not exists prompts_created_at_idx on public.prompts (created_at desc);
create index if not exists prompts_category_idx on public.prompts (category);

alter table public.prompts enable row level security;

drop policy if exists "Public read prompts" on public.prompts;
create policy "Public read prompts"
  on public.prompts for select to anon, authenticated using (true);

drop policy if exists "Anon insert prompts" on public.prompts;
create policy "Anon insert prompts"
  on public.prompts for insert to anon, authenticated with check (true);

drop policy if exists "Anon update prompts" on public.prompts;
create policy "Anon update prompts"
  on public.prompts for update to anon, authenticated using (true) with check (true);

drop policy if exists "Anon delete prompts" on public.prompts;
create policy "Anon delete prompts"
  on public.prompts for delete to anon, authenticated using (true);

drop policy if exists "Service inserts prompts" on public.prompts;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'previews', 'previews', true, 104857600,
  array['video/mp4','video/webm','video/quicktime','image/png','image/jpeg','image/webp','image/gif','image/avif']
)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read previews" on storage.objects;
create policy "Public read previews"
  on storage.objects for select to anon, authenticated using (bucket_id = 'previews');

drop policy if exists "Public insert previews" on storage.objects;
create policy "Public insert previews"
  on storage.objects for insert to anon, authenticated with check (bucket_id = 'previews');

drop policy if exists "Public update previews" on storage.objects;
create policy "Public update previews"
  on storage.objects for update to anon, authenticated using (bucket_id = 'previews') with check (bucket_id = 'previews');
