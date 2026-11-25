"use client";

import { useEffect, useState } from "react";
import { createBrowserClient, hasSupabaseEnv } from "../../../lib/supabase";

/**
 * Receives Vault SSO tokens from the URL hash and establishes a local session.
 */
export default function AuthHandoffPage() {
  const [status, setStatus] = useState("מתחברים…");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
      const params = new URLSearchParams(hash);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      // Clear tokens from the address bar ASAP
      if (hash) {
        window.history.replaceState(null, "", "/auth/handoff");
      }

      if (!access_token || !refresh_token) {
        window.location.replace("/");
        return;
      }

      if (!hasSupabaseEnv()) {
        setStatus("Supabase לא מוגדר באקדמיה");
        return;
      }

      try {
        const supabase = createBrowserClient();
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (cancelled) return;
        if (error) {
          setStatus(error.message);
          window.setTimeout(() => window.location.replace("/"), 1500);
          return;
        }
        setStatus("מחוברים — נכנסים…");
        window.location.replace("/");
      } catch (e) {
        if (cancelled) return;
        setStatus(e instanceof Error ? e.message : "שגיאת התחברות");
        window.setTimeout(() => window.location.replace("/"), 1500);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="flex min-h-svh items-center justify-center bg-[#070605] text-white"
      dir="rtl"
    >
      <p className="text-[14px] text-white/55">{status}</p>
    </div>
  );
}
