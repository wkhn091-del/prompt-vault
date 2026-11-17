"use client";

import { useEffect } from "react";
import { Check, X } from "lucide-react";

type ToastProps = {
  message: string;
  visible: boolean;
  onClose: () => void;
  variant?: "success" | "error" | "info";
};

export function Toast({
  message,
  visible,
  onClose,
  variant = "success",
}: ToastProps) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onClose, 2200);
    return () => clearTimeout(t);
  }, [visible, onClose, message]);

  if (!visible) return null;

  const accent =
    variant === "error"
      ? "border-red-500/40 text-red-200"
      : variant === "info"
        ? "border-sky-500/40 text-sky-100"
        : "border-white/10 text-white";

  return (
    <div
      role="status"
      className={`fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2.5 rounded-full border bg-[#141416]/95 px-4 py-2.5 text-sm shadow-2xl backdrop-blur ${accent} animate-toast-in`}
    >
      {variant === "success" ? (
        <Check className="size-4 shrink-0 text-emerald-400" />
      ) : (
        <X className="size-4 shrink-0 opacity-70" />
      )}
      <span>{message}</span>
    </div>
  );
}
