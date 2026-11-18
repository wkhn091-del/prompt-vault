"use client";

import { createBrowserClient, hasSupabaseEnv } from "@/lib/supabase";

/** Attach Bearer access token from the browser Supabase session. */
export async function authHeaders(
  extra?: HeadersInit,
): Promise<Record<string, string>> {
  const base: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (extra) {
    const h = new Headers(extra);
    h.forEach((v, k) => {
      base[k] = v;
    });
  }

  if (!hasSupabaseEnv()) return base;
  try {
    const supabase = createBrowserClient();
    let { data } = await supabase.auth.getSession();
    if (!data.session?.access_token) {
      const refreshed = await supabase.auth.refreshSession();
      data = refreshed.data;
    }
    const token = data.session?.access_token;
    if (token) base.Authorization = `Bearer ${token}`;
  } catch {
    /* ignore */
  }
  return base;
}

export async function authFetch(input: RequestInfo | URL, init?: RequestInit) {
  const headers = await authHeaders(init?.headers);
  return fetch(input, {
    ...init,
    headers,
    credentials: "same-origin",
  });
}
