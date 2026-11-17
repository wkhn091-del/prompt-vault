export const CATEGORIES = [
  "All",
  "Hero",
  "3D / WebGL",
  "Landing Page",
  "Ecommerce",
  "SaaS",
  "Portfolio",
  "Animations",
  "Creative",
  "AI",
] as const;

export type Category = (typeof CATEGORIES)[number];
export type FilterCategory = Exclude<Category, "All">;

const RULES: { category: FilterCategory; patterns: RegExp[] }[] = [
  {
    category: "3D / WebGL",
    patterns: [
      /\bthree\.?js\b/i,
      /\bwebgl\b/i,
      /\b3d\b/i,
      /\br3f\b/i,
      /\breact[- ]three[- ]fiber\b/i,
      /\bspline\b/i,
    ],
  },
  {
    category: "Hero",
    patterns: [/\bhero\b/i, /\bfull[- ]?bleed\b/i, /\blanding hero\b/i],
  },
  {
    category: "Ecommerce",
    patterns: [
      /\be-?commerce\b/i,
      /\bshop\b/i,
      /\bcart\b/i,
      /\bcheckout\b/i,
      /\bproduct\b/i,
      /\bstore\b/i,
    ],
  },
  {
    category: "SaaS",
    patterns: [/\bsaas\b/i, /\bdashboard\b/i, /\bpricing\b/i, /\bsubscription\b/i],
  },
  {
    category: "Portfolio",
    patterns: [/\bportfolio\b/i, /\bagency\b/i, /\bcase stud(y|ies)\b/i],
  },
  {
    category: "Landing Page",
    patterns: [/\blanding\b/i, /\bmarketing site\b/i, /\blanding page\b/i],
  },
  {
    category: "Animations",
    patterns: [
      /\banimation/i,
      /\bgsap\b/i,
      /\bframer[- ]motion\b/i,
      /\bmotion\b/i,
      /\bparallax\b/i,
      /\blenis\b/i,
    ],
  },
  {
    category: "Creative",
    patterns: [/\bcreative\b/i, /\bartistic\b/i, /\bexperimental\b/i, /\bluxurious\b/i],
  },
  {
    category: "AI",
    patterns: [/\bai\b/i, /\bgenerative\b/i, /\bllm\b/i, /\bprompt\b/i, /\bhiggs\b/i],
  },
];

export function detectCategories(promptText: string): FilterCategory[] {
  const found = new Set<FilterCategory>();
  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(promptText))) {
      found.add(rule.category);
    }
  }
  if (found.size === 0) found.add("Creative");
  return Array.from(found);
}
