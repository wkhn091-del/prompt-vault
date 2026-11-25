"use client";

import { useEffect, useState } from "react";
import { ACADEMY_URL } from "@/lib/academy-url";
import { createBrowserClient, hasSupabaseEnv } from "@/lib/supabase";

/**
 * SSO bridge: if Vault already has a Supabase session, pass tokens to Academy
 * (different domain) so the user does not sign in again.
 */
export default function GoAcademyPage() {
  const [status, setStatus] = useState("פותחים את האקדמיה…");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const next = `${ACADEMY_URL}/auth/handoff`;

      if (!hasSupabaseEnv()) {
        window.location.replace(ACADEMY_URL);
        return;
      }

      try {
        const supabase = createBrowserClient();
        const { data } = await supabase.auth.getSession();
        const session = data.session;

        if (!session?.access_token || !session.refresh_token) {
          const login = `/login?next=${encodeURIComponent(ACADEMY_URL)}`;
          window.location.replace(login);
          return;
        }

        if (cancelled) return;
        setStatus("מעבירים את החשבון לאקדמיה…");

        const hash = new URLSearchParams({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          type: "sso",
        }).toString();

        window.location.replace(`${next}#${hash}`);
      } catch {
        window.location.replace(ACADEMY_URL);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-svh items-center justify-center bg-black text-white">
      <p className="text-[14px] text-white/60">{status}</p>
    </div>
  );
}
