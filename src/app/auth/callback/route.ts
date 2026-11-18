import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  if (raw.startsWith("/login") || raw.startsWith("/auth/")) return "/";
  return raw;
}

/**
 * Server-side OAuth / magic-link callback.
 * Exchanges the PKCE code using cookies (where @supabase/ssr stored the verifier).
 * A client page exchange fails when the verifier cookie isn't visible to JS yet.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const type = url.searchParams.get("type");
  const next = safeNext(url.searchParams.get("next"));
  const oauthError =
    url.searchParams.get("error_description") || url.searchParams.get("error");

  const origin = url.origin;

  if (oauthError) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(oauthError)}`, origin),
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=Missing%20auth%20code.%20Try%20again.", origin),
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";
  if (!supabaseUrl || !anon) {
    return NextResponse.redirect(
      new URL("/login?error=Supabase%20is%20not%20configured.", origin),
    );
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const msg = /code verifier/i.test(error.message)
      ? "Sign-in expired. Close other tabs, then try Continue with Google again from this same site."
      : error.message;
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(msg)}`, origin),
    );
  }

  const dest =
    type === "recovery"
      ? "/login?type=recovery"
      : next.startsWith("/")
        ? next
        : "/";

  return NextResponse.redirect(new URL(dest, origin));
}
