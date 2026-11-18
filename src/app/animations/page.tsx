import type { Metadata } from "next";
import { AnimationsApp } from "@/components/AnimationsApp";

export const metadata: Metadata = {
  title: "Animations — Prompt Vault",
  description:
    "Live HTML animations — browse inside the preview, open full HTML, or copy the whole file.",
};

export default function AnimationsPage() {
  return <AnimationsApp />;
}
