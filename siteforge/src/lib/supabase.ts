import {
  createBrowserClient as createSupabaseBrowserClient,
} from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

function publicSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
}

function publicSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";
}

let browserClient: SupabaseClient | null = null;

export function hasSupabaseEnv(): boolean {
  return Boolean(publicSupabaseUrl() && publicSupabaseAnonKey());
}

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
      secure:
        typeof window !== "undefined"
          ? window.location.protocol === "https:"
          : true,
    },
  });
  return browserClient;
}
