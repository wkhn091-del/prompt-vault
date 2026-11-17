import type { Metadata } from "next";
import { LoginApp } from "@/components/LoginApp";

export const metadata: Metadata = {
  title: "Sign in — Prompt Vault",
  description: "Sign in with email to connect MCP AI tools to your vault.",
};

export default function LoginPage() {
  return <LoginApp />;
}
