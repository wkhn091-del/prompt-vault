import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath, isExternalNext } from "@/lib/safe-next";

/**
 * Server-side OAuth / magic-link callback.
 * Exchanges the PKCE code using cookies (where @supabase/ssr stored the verifier).
 * Syncs name/phone from cookies into user_metadata when present.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const type = url.searchParams.get("type");
  const next = safeNextPath(url.searchParams.get("next"));
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

  const fullNameRaw = cookieStore.get("pv_full_name")?.value;
  const phoneRaw = cookieStore.get("pv_phone")?.value;
  const fullName = fullNameRaw ? decodeURIComponent(fullNameRaw).trim() : "";
  const phone = phoneRaw ? decodeURIComponent(phoneRaw).trim() : "";

  if (fullName || phone) {
    const data: Record<string, string> = {};
    if (fullName) data.full_name = fullName;
    if (phone) data.phone = phone;
    await supabase.auth.updateUser({ data }).catch(() => undefined);
  }

  if (type === "recovery") {
    return NextResponse.redirect(new URL("/login?type=recovery", origin));
  }

  if (isExternalNext(next)) {
    return NextResponse.redirect(next);
  }

  return NextResponse.redirect(new URL(next.startsWith("/") ? next : "/", origin));
}
