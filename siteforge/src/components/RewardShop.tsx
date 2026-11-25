"use client";

import { useEffect, useState } from "react";
import { Gift, Lock, Sparkles, Check } from "lucide-react";
import {
  loadProgress,
  saveProgress,
  medalsEarned,
  redeemReward,
  type ProgressState,
} from "../lib/progress";
import { REWARD_CATALOG } from "../lib/rewards";

export function RewardShop({
  open,
  onClose,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  onChange?: (p: ProgressState) => void;
}) {
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setProgress(loadProgress());
      setMsg(null);
    }
  }, [open]);

  if (!open || !progress) return null;

  const medals = medalsEarned(progress);

  function buy(id: string) {
    const item = REWARD_CATALOG.find((r) => r.id === id);
    if (!item || !progress) return;
    const result = redeemReward(progress, item);
    if (!result.ok) {
      setMsg(result.reason);
      return;
    }
    saveProgress(result.state);
    setProgress(result.state);
    onChange?.(result.state);
    setMsg(`נפתח: ${item.title}`);
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal
      aria-label="חנות אנימציות"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-hidden rounded-[24px] border border-[#ff7a45]/30 bg-[#0c0a09] shadow-[0_30px_80px_-20px_rgba(255,100,40,0.45)]"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="border-b border-white/[0.08] px-5 py-4">
          <div className="flex items-center gap-2">
            <Gift className="size-5 text-[#ffb35c]" />
            <h2 className="text-[17px] font-extrabold [font-family:var(--font-heebo),sans-serif]">
              חנות אנימציות
            </h2>
          </div>
          <p className="mt-1.5 text-[12px] leading-relaxed text-white/45 [font-family:var(--font-heebo),sans-serif]">
            קונים עם <strong className="text-[#ffb35c]">נקודות</strong> ו־
            <strong className="text-[#ffb08a]">מדליות</strong> מהקורס, לא בכסף
            אמיתי.
          </p>
          <p className="mt-2 font-mono text-[11px] text-white/40">
            נקודות: {progress.coins} · מדליות: {medals}/10
          </p>
        </header>

        <div className="max-h-[55vh] space-y-2 overflow-y-auto px-4 py-3">
          {REWARD_CATALOG.map((item) => {
            const owned = progress.unlockedRewards.includes(item.id);
            const lockedByMedal = medals < item.medalsRequired;
            const lockedByCoins = progress.coins < item.coinCost;
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3 py-3"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff7a45]/30 to-[#ffb35c]/15">
                  {owned ? (
                    <Check className="size-5 text-emerald-300" />
                  ) : lockedByMedal ? (
                    <Lock className="size-5 text-white/35" />
                  ) : (
                    <Sparkles className="size-5 text-[#ffb35c]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-bold text-white [font-family:var(--font-heebo),sans-serif]">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-white/40">{item.blurb}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-[#ffb08a]/70">
                    {item.coinCost} נק׳ · מדליה {item.medalsRequired}+
                  </p>
                </div>
                <button
                  type="button"
                  disabled={owned || lockedByMedal || lockedByCoins}
                  onClick={() => buy(item.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                    owned
                      ? "bg-emerald-400/15 text-emerald-300"
                      : lockedByMedal || lockedByCoins
                        ? "bg-white/5 text-white/30"
                        : "bg-gradient-to-r from-[#ff7a45] to-[#ffb35c] text-[#1a0e08]"
                  }`}
                >
                  {owned
                    ? "שלי"
                    : lockedByMedal
                      ? `מדליה ${item.medalsRequired}`
                      : lockedByCoins
                        ? "חסר נק׳"
                        : "פתיחה"}
                </button>
              </div>
            );
          })}
        </div>

        {msg && (
          <p className="border-t border-white/[0.06] px-5 py-2 text-center text-[12px] text-[#ffb08a]">
            {msg}
          </p>
        )}

        <div className="border-t border-white/[0.08] px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full border border-white/15 py-2.5 text-[13px] font-bold text-white/70 hover:bg-white/5"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}
