-- Secure prompts table: RLS + public view (safe columns only)
-- Apply in Supabase SQL Editor or via CLI. Service role bypasses RLS.

-- 1) Enable RLS
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- Drop overly-permissive policies if they exist (safe no-op when missing)
DROP POLICY IF EXISTS "Public read prompts" ON public.prompts;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.prompts;
DROP POLICY IF EXISTS "anon select prompts" ON public.prompts;
DROP POLICY IF EXISTS "Authenticated users can read prompts" ON public.prompts;

-- 2) No direct anon/authenticated access to the full table by default.
--    Admins (authenticated + email in JWT) can read/write full rows.
--    Adjust the email list to match ADMIN_EMAILS / your accounts.

CREATE OR REPLACE FUNCTION public.is_prompt_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    lower(auth.jwt() ->> 'email') = ANY (
      ARRAY[
        -- Keep in sync with server ADMIN_EMAILS (examples):
        'wkhn091@gmail.com'
      ]
    ),
    false
  );
$$;

DROP POLICY IF EXISTS "Admins select prompts" ON public.prompts;
CREATE POLICY "Admins select prompts"
  ON public.prompts
  FOR SELECT
  TO authenticated
  USING (public.is_prompt_admin());

DROP POLICY IF EXISTS "Admins insert prompts" ON public.prompts;
CREATE POLICY "Admins insert prompts"
  ON public.prompts
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_prompt_admin());

DROP POLICY IF EXISTS "Admins update prompts" ON public.prompts;
CREATE POLICY "Admins update prompts"
  ON public.prompts
  FOR UPDATE
  TO authenticated
  USING (public.is_prompt_admin())
  WITH CHECK (public.is_prompt_admin());

DROP POLICY IF EXISTS "Admins delete prompts" ON public.prompts;
CREATE POLICY "Admins delete prompts"
  ON public.prompts
  FOR DELETE
  TO authenticated
  USING (public.is_prompt_admin());

-- 3) Public view with safe columns only (no prompt_text / hash / price)
CREATE OR REPLACE VIEW public.public_prompts
WITH (security_invoker = false)
AS
SELECT
  id,
  title,
  slug,
  category,
  media_url,
  media_type,
  preview_html,
  backdrop_color,
  is_premium,
  created_at
FROM public.prompts;

GRANT SELECT ON public.public_prompts TO anon, authenticated;

COMMENT ON VIEW public.public_prompts IS
  'Safe prompt catalog for clients. Full prompt_text only via server API (service role).';
