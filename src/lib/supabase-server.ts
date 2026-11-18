import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase";

function publicUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
}

function publicAnon() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";
}

/** Cookie-based server client (SSR / Route Handlers via next/headers). */
export async function createServerSupabaseClient(): Promise<SupabaseClient> {
  const url = publicUrl();
  const anon = publicAnon();
  if (!url || !anon) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const cookieStore = await cookies();

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          /* Called from a Server Component — ignore */
        }
      },
    },
  });
}

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function unauthorized(message: string) {
  return {
    response: NextResponse.json({ error: message }, { status: 401 }),
  };
}

/**
 * Require an authenticated admin for write APIs.
 * Prefer Authorization Bearer (sent by authFetch), then request cookies.
 */
export async function requireAdmin(
  req: NextRequest,
): Promise<{ user: User } | { response: NextResponse }> {
  if (!hasSupabaseEnv()) {
    return {
      response: NextResponse.json(
        { error: "Supabase is not configured." },
        { status: 503 },
      ),
    };
  }

  const url = publicUrl();
  const anon = publicAnon();
  let user: User | null = null;
  let authPath = "none";

  // 1) Bearer from authFetch (most reliable for client writes)
  const header = req.headers.get("authorization") || "";
  const token = header.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  if (token) {
    try {
      const client = createClient(url, anon, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await client.auth.getUser(token);
      if (!error && data.user) {
        user = data.user;
        authPath = "bearer";
      }
    } catch {
      /* continue */
    }
  }

  // 2) Cookies attached to this request
  if (!user) {
    try {
      const supabase = createServerClient(url, anon, {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll() {
            /* no-op in auth check */
          },
        },
      });
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        user = data.user;
        authPath = "cookie";
      }
    } catch {
      /* continue */
    }
  }

  if (!user?.email) {
    return unauthorized(
      "Not signed in. Refresh, sign in with Google again, then retry Save.",
    );
  }

  const admins = adminEmails();
  if (admins.length === 0) {
    return unauthorized(
      "ADMIN_EMAILS is not configured on the server.",
    );
  }

  if (!admins.includes(user.email.toLowerCase())) {
    return unauthorized(
      `Signed in as ${user.email}, but this email is not in ADMIN_EMAILS.`,
    );
  }

  // authPath kept for future debug logs
  void authPath;
  return { user };
}

/**
 * Client for admin writes: service role if configured, else the caller's JWT.
 */
export async function createAdminWriteClient(req: NextRequest) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const url = publicUrl();
  const anon = publicAnon();

  if (serviceKey) {
    return createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  const header = req.headers.get("authorization") || "";
  const token = header.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  if (token) {
    return createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll() {},
    },
  });
}
