"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isAdminEmail } from "../../lib/admin";
import { setAcademyAdminUnlock } from "../../lib/courses/progress";
import { signInWithGoogle, signOut as oauthSignOut } from "../../lib/auth-oauth";
import { createBrowserClient, hasSupabaseEnv } from "../../lib/supabase";
import { vaultLoginUrl } from "../../lib/vault-url";

type AuthState = {
  ready: boolean;
  email: string | null;
  fullName: string | null;
  isAdmin: boolean;
  /** Admin 091 (or env unlock) — all stages/medals open, no coin gates. */
  unlockAll: boolean;
  signInGoogle: () => Promise<void>;
  signInViaVault: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const ENV_UNLOCK =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_ACADEMY_UNLOCK_ALL === "true";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!hasSupabaseEnv());
  const [email, setEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;

    async function run() {
      if (!hasSupabaseEnv()) {
        setAcademyAdminUnlock(false);
        if (!cancelled) setReady(true);
        return;
      }
      try {
        const supabase = createBrowserClient();
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user;
        if (!cancelled) {
          setEmail(user?.email ?? null);
          setFullName(
            (user?.user_metadata?.full_name as string | undefined) ?? null,
          );
          const admin = isAdminEmail(user?.email);
          setAcademyAdminUnlock(admin || ENV_UNLOCK);
          setReady(true);
        }
        const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
          const u = session?.user;
          setEmail(u?.email ?? null);
          setFullName(
            (u?.user_metadata?.full_name as string | undefined) ?? null,
          );
          setAcademyAdminUnlock(isAdminEmail(u?.email) || ENV_UNLOCK);
          setReady(true);
        });
        unsub = () => sub.subscription.unsubscribe();
      } catch {
        setAcademyAdminUnlock(ENV_UNLOCK);
        if (!cancelled) setReady(true);
      }
    }

    void run();
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  const isAdmin = isAdminEmail(email);
  const unlockAll = isAdmin || ENV_UNLOCK;

  const signInGoogle = useCallback(async () => {
    const path =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : "/";
    await signInWithGoogle(path);
  }, []);

  const signInViaVault = useCallback(() => {
    window.location.assign(vaultLoginUrl());
  }, []);

  const signOut = useCallback(async () => {
    await oauthSignOut();
    setEmail(null);
    setFullName(null);
    setAcademyAdminUnlock(ENV_UNLOCK);
  }, []);

  const value = useMemo(
    () => ({
      ready,
      email,
      fullName,
      isAdmin,
      unlockAll,
      signInGoogle,
      signInViaVault,
      signOut,
    }),
    [
      ready,
      email,
      fullName,
      isAdmin,
      unlockAll,
      signInGoogle,
      signInViaVault,
      signOut,
    ],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      ready: true,
      email: null,
      fullName: null,
      isAdmin: false,
      unlockAll: ENV_UNLOCK,
      signInGoogle: async () => undefined,
      signInViaVault: () => undefined,
      signOut: async () => undefined,
    };
  }
  return ctx;
}
