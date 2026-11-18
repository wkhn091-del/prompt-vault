import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PREFIXES = ["/login", "/auth/callback", "/api/mcp", "/robots.txt"];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/logo-m.svg" || pathname === "/logo-m.png") return true;
  if (pathname === "/favicon-32.png" || pathname === "/favicon.ico") return true;
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";
  if (!url || !anon) {
    return NextResponse.next();
  }

  if (isPublicPath(pathname)) {
    // Already signed in → skip login screen
    if (pathname === "/login") {
      const supabase = createMiddlewareClient(request, url, anon);
      const {
        data: { user },
      } = await supabase.client.auth.getUser();
      if (user) {
        const next = request.nextUrl.searchParams.get("next");
        const dest =
          next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
        return NextResponse.redirect(new URL(dest, request.url));
      }
      return supabase.response;
    }
    return NextResponse.next();
  }

  // API routes (except MCP) still need their own auth; page routes require session
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const { client, response } = createMiddlewareClient(request, url, anon);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return response;
}

function createMiddlewareClient(
  request: NextRequest,
  url: string,
  anon: string,
) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const client = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  return { client, response };
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
