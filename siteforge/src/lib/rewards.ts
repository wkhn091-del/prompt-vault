/**
 * In-course economy: medals + coins unlock animation packs.
 * No real money — progress earned in SiteForge is the currency.
 */

export type RewardItem = {
  id: string;
  title: string;
  blurb: string;
  /** Coin price in SiteForge currency */
  coinCost: number;
  /** Minimum medals earned (0–10) required before purchase */
  medalsRequired: number;
  /** Kit slug / vault key for later wiring to Prompt Vault animations */
  kitKey: string;
};

export const REWARD_CATALOG: RewardItem[] = [
  {
    id: "anim-facet",
    title: "Facet Glass Hero",
    blurb: "הירו זכוכית פרימיום",
    coinCost: 40,
    medalsRequired: 1,
    kitKey: "facet-glass-hero",
  },
  {
    id: "anim-novu",
    title: "Novu London",
    blurb: "דמות 3D + תנועה",
    coinCost: 55,
    medalsRequired: 2,
    kitKey: "novu-london",
  },
  {
    id: "anim-krung",
    title: "Krung Travel",
    blurb: "נחיתה תיירותית חיה",
    coinCost: 55,
    medalsRequired: 2,
    kitKey: "krung-travel",
  },
  {
    id: "anim-embers",
    title: "Embers Foundry",
    blurb: "עולם לוהט סינמטי",
    coinCost: 70,
    medalsRequired: 3,
    kitKey: "embers-foundry",
  },
  {
    id: "anim-jack",
    title: "Jack Portfolio",
    blurb: "פורטפוליו עם אווטאר",
    coinCost: 70,
    medalsRequired: 4,
    kitKey: "jack",
  },
  {
    id: "anim-haldoren",
    title: "Haldoren Fashion",
    blurb: "קטלוג אופנה מושנע",
    coinCost: 85,
    medalsRequired: 5,
    kitKey: "haldoren",
  },
  {
    id: "anim-kv",
    title: "KV Freight",
    blurb: "גלובוס טכני + מותג",
    coinCost: 85,
    medalsRequired: 5,
    kitKey: "kv-freight",
  },
  {
    id: "anim-flights",
    title: "לוח טיסות",
    blurb: "אנימציית split-flap",
    coinCost: 100,
    medalsRequired: 6,
    kitKey: "flight-board",
  },
  {
    id: "anim-depth-text",
    title: "טקסט בעומק",
    blurb: "טיפוגרפיה בתלת־ממד",
    coinCost: 100,
    medalsRequired: 7,
    kitKey: "depth-text",
  },
  {
    id: "anim-waterline",
    title: "קו המים",
    blurb: "אוקיינוס סינמטי",
    coinCost: 120,
    medalsRequired: 8,
    kitKey: "waterline",
  },
];

export function canAfford(
  coins: number,
  medalsEarned: number,
  item: RewardItem,
  alreadyOwned: boolean,
): { ok: boolean; reason?: string } {
  if (alreadyOwned) return { ok: false, reason: "כבר בבעלותך" };
  if (medalsEarned < item.medalsRequired) {
    return {
      ok: false,
      reason: `צריך ${item.medalsRequired} מדליות (יש ${medalsEarned})`,
    };
  }
  if (coins < item.coinCost) {
    return {
      ok: false,
      reason: `חסרות ${item.coinCost - coins} נקודות`,
    };
  }
  return { ok: true };
}
