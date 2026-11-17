import type { Metadata } from "next";
import { BackgroundsApp } from "@/components/BackgroundsApp";

export const metadata: Metadata = {
  title: "Backgrounds — Prompt Vault",
  description: "Handcrafted animated backgrounds — Motionsites-style gallery with Copy URL.",
};

export default function BackgroundsPage() {
  return <BackgroundsApp />;
}
