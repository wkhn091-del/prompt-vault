"use client";

import { useEffect, useState } from "react";
import { isAdminEmail } from "@/lib/admin";
import { createBrowserClient, hasSupabaseEnv } from "@/lib/supabase";

/** True only when the signed-in user email is in NEXT_PUBLIC_ADMIN_EMAILS. */
export function useIsAdmin(): { isAdmin: boolean; ready: boolean; email: string | null } {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;

    async function run() {
      if (!hasSupabaseEnv()) {
        if (!cancelled) {
          setEmail(null);
          setReady(true);
        }
        return;
      }
      try {
        const supabase = createBrowserClient();
        const { data } = await supabase.auth.getSession();
        if (!cancelled) {
          setEmail(data.session?.user?.email ?? null);
          setReady(true);
        }
        const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
          setEmail(session?.user?.email ?? null);
          setReady(true);
        });
        unsub = () => sub.subscription.unsubscribe();
      } catch {
        if (!cancelled) {
          setEmail(null);
          setReady(true);
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  return {
    isAdmin: isAdminEmail(email),
    ready,
    email,
  };
}
