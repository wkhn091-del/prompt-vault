import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PREFIXES = [
  "/login",
  "/auth/callback",
  "/api/mcp",
  "/api/oauth",
  "/.well-known",
  "/robots.txt",
];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/logo-m.svg" || pathname === "/logo-m.png") return true;
  if (pathname === "/mcp-icon.png") return true;
  if (
    pathname === "/favicon-32.png" ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.png" ||
    pathname === "/apple-icon.png"
  )
    return true;
  if (pathname === "/kits" || pathname.startsWith("/kits/")) return true;
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/**
 * Gate on cookie presence only — do NOT call supabase.auth.getSession() here.
 *
 * On iOS Safari, middleware getSession() + single-use refresh tokens races with
 * parallel RSC/data requests and clears the session → redirect /login → back →
 * full page reload every ~1s on Vault, Academy, Tools, everything.
 *
 * Token refresh stays on the browser client (autoRefreshToken).
 */
function hasSupabaseAuthCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some((c) => {
    const n = c.name;
    if (!n.includes("auth-token")) return false;
    return c.value.length > 10;
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";
  // No Supabase configured → don't lock the app
  if (!url || !anon) {
    return NextResponse.next();
  }

  if (!hasSupabaseAuthCookie(request)) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|kits/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|zip|html|md)$).*)",
  ],
};
