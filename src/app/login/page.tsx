import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginApp } from "@/components/LoginApp";

export const metadata: Metadata = {
  title: "Sign in — Prompt Vault",
  description:
    "Sign in with email, password, magic link, or Google / Apple / GitHub.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh items-center justify-center bg-black text-white">
          <p className="text-[14px] text-white/50">Loading…</p>
        </main>
      }
    >
      <LoginApp />
    </Suspense>
  );
}
