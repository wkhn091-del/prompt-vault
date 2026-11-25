"use client";

import { useEffect, useState } from "react";
import { listCourseIds } from "../../lib/courses/load-client";
import { totalCoins, WALLET_EVENT } from "../../lib/courses/wallet";
import { GoldCoin } from "./GoldCoin";

/** Compact coins badge for the site header (medals live in the main nav). */
export function WalletBar() {
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    function refresh() {
      setCoins(totalCoins(listCourseIds()));
    }
    refresh();
    window.addEventListener(WALLET_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(WALLET_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <span
      className="inline-flex min-h-[36px] items-center gap-2 rounded-full border border-[#c4a574]/40 bg-[linear-gradient(145deg,#2a1c10_0%,#120e0a_100%)] px-2.5 pe-3.5 text-[13px] font-bold text-[#ffe0a8] shadow-[inset_0_1px_0_rgba(255,224,168,0.18),0_4px_14px_rgba(0,0,0,0.35)]"
      title="מטבעות שנאספו בשיעורים"
    >
      <GoldCoin size={22} />
      <span className="font-mono tabular-nums tracking-wide [direction:ltr]">
        {coins}
      </span>
    </span>
  );
}
