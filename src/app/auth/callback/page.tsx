"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveEmail } from "@/lib/auth-local";
import { createBrowserClient, hasSupabaseEnv } from "@/lib/supabase";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const nextRaw = searchParams.get("next") || "/mcp";
      const next = nextRaw.startsWith("/") ? nextRaw : "/mcp";
      const code = searchParams.get("code");
      const err = searchParams.get("error_description") || searchParams.get("error");

      if (err) {
        if (!cancelled) setMessage(err);
        return;
      }

      if (!hasSupabaseEnv()) {
        if (!cancelled) setMessage("Supabase is not configured.");
        return;
      }

      const supabase = createBrowserClient();

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        const email = data.session?.user?.email;
        if (email) saveEmail(email);

        if (!cancelled) {
          setMessage("Signed in — redirecting…");
          router.replace(next);
        }
      } catch (e) {
        if (!cancelled) {
          setMessage(e instanceof Error ? e.message : "Sign-in failed.");
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-black px-4 text-white">
      <p className="text-[14px] text-white/60">{message}</p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh items-center justify-center bg-black px-4 text-white">
          <p className="text-[14px] text-white/60">Signing you in…</p>
        </main>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
