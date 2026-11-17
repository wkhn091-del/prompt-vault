import type { Metadata } from "next";
import { McpApp } from "@/components/McpApp";

export const metadata: Metadata = {
  title: "MCP — Prompt Vault",
  description: "Connect Prompt Vault to AI tools via MCP.",
};

export default function McpPage() {
  return <McpApp />;
}
