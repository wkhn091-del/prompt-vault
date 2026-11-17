import type { Metadata } from "next";
import { ToolsApp } from "@/components/ToolsApp";

export const metadata: Metadata = {
  title: "Tools — Prompt Vault",
  description:
    "ארסנל סקילי Cursor מחולק לקטגוריות — מה כל כלי עושה, עם לינקים לדרייב.",
};

export default function ToolsPage() {
  return <ToolsApp />;
}
