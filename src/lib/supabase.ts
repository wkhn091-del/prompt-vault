import {
  createBrowserClient as createSupabaseBrowserClient,
} from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { MediaType } from "./types";

export type PromptRow = {
  id: string;
  title: string;
  slug: string;
  category: string;
  prompt_text: string;
  media_url: string | null;
  media_type: MediaType | null;
  preview_html?: string | null;
  backdrop_color?: string | null;
  normalized_hash: string;
  is_premium: boolean;
  price: number | string;
  created_at: string;
};

/** Must use static process.env.NEXT_PUBLIC_* access — Next only inlines those. */
function publicSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
}

function publicSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";
}

let browserClient: SupabaseClient | null = null;

/**
 * Cookie-backed browser client (singleton) so PKCE verifier + session
 * survive the Google redirect and middleware can see the user.
 */
export function createBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const url = publicSupabaseUrl();
  const anon = publicSupabaseAnonKey();
  if (!url || !anon) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  browserClient = createSupabaseBrowserClient(url, anon, {
    cookieOptions: {
      path: "/",
      sameSite: "lax",
      secure: typeof window !== "undefined" ? window.location.protocol === "https:" : true,
    },
  });
  return browserClient;
}

export function createServiceClient(): SupabaseClient {
  const url = publicSupabaseUrl();
  const anonKey = publicSupabaseAnonKey();
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  return createClient(url, serviceKey || anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function hasSupabaseEnv(): boolean {
  return Boolean(publicSupabaseUrl() && publicSupabaseAnonKey());
}
