-- Run this if you are using only the publishable/anon key (no service_role yet)

drop policy if exists "Anon insert prompts" on public.prompts;
create policy "Anon insert prompts"
  on public.prompts
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Anon update prompts" on public.prompts;
create policy "Anon update prompts"
  on public.prompts
  for update
  to anon, authenticated
  using (true)
  with check (true);
