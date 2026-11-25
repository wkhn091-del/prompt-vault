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
  phone: string | null;
  isAdmin: boolean;
  /** Admin 091 (or env unlock) — all stages/medals open, no coin gates. */
  unlockAll: boolean;
  signInGoogle: () => Promise<void>;
  signInViaVault: () => void;
  signOut: () => Promise<void>;
  updateProfile: (input: {
    fullName: string;
    phone: string;
  }) => Promise<{ error?: string }>;
};

const AuthContext = createContext<AuthState | null>(null);

const ENV_UNLOCK =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_ACADEMY_UNLOCK_ALL === "true";

function metaFromUser(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
} | null) {
  const meta = user?.user_metadata ?? {};
  return {
    email: user?.email ?? null,
    fullName:
      (typeof meta.full_name === "string" && meta.full_name) ||
      (typeof meta.name === "string" && meta.name) ||
      null,
    phone: typeof meta.phone === "string" ? meta.phone : null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!hasSupabaseEnv());
  const [email, setEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);

  const applyUser = useCallback(
    (user: Parameters<typeof metaFromUser>[0]) => {
      const next = metaFromUser(user);
      setEmail(next.email);
      setFullName(next.fullName);
      setPhone(next.phone);
      setAcademyAdminUnlock(isAdminEmail(next.email) || ENV_UNLOCK);
    },
    [],
  );

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
        if (!cancelled) {
          applyUser(data.session?.user ?? null);
          setReady(true);
        }
        const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
          applyUser(session?.user ?? null);
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
  }, [applyUser]);

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
    setPhone(null);
    setAcademyAdminUnlock(ENV_UNLOCK);
  }, []);

  const updateProfile = useCallback(
    async (input: { fullName: string; phone: string }) => {
      if (!hasSupabaseEnv()) {
        return { error: "Supabase לא מוגדר" };
      }
      try {
        const supabase = createBrowserClient();
        const { error } = await supabase.auth.updateUser({
          data: {
            full_name: input.fullName,
            phone: input.phone,
          },
        });
        if (error) return { error: error.message };
        setFullName(input.fullName || null);
        setPhone(input.phone || null);
        return {};
      } catch (e) {
        return {
          error: e instanceof Error ? e.message : "שמירה נכשלה",
        };
      }
    },
    [],
  );

  const value = useMemo(
    () => ({
      ready,
      email,
      fullName,
      phone,
      isAdmin,
      unlockAll,
      signInGoogle,
      signInViaVault,
      signOut,
      updateProfile,
    }),
    [
      ready,
      email,
      fullName,
      phone,
      isAdmin,
      unlockAll,
      signInGoogle,
      signInViaVault,
      signOut,
      updateProfile,
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
      phone: null,
      isAdmin: false,
      unlockAll: ENV_UNLOCK,
      signInGoogle: async () => undefined,
      signInViaVault: () => undefined,
      signOut: async () => undefined,
      updateProfile: async () => ({ error: "אין AuthProvider" }),
    };
  }
  return ctx;
}
