import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type PromptRow = {
  id: string;
  title: string;
  slug: string;
  category: string;
  prompt_text: string;
  media_url: string | null;
  media_type: "video" | "image" | null;
  normalized_hash: string;
  is_premium: boolean;
  price: number | string;
  created_at: string;
};

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing ${name}. Add it to .env.local (see .env.example).`,
    );
  }
  return value;
}

/** Browser / public client (anon / publishable key). */
export function createBrowserClient(): SupabaseClient {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  );
}

/**
 * Server client for API routes.
 * Prefers service_role (bypasses RLS). Falls back to anon/publishable key
 * when service_role is not set — requires anon INSERT policies on prompts.
 */
export function createServiceClient(): SupabaseClient {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createClient(url, serviceKey || anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
}
