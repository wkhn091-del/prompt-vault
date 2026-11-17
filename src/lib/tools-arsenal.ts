import aaaCategories from "@/data/aaa-skills-categories.json";

export type ToolPart = {
  label: string;
  href: string;
};

export type ToolItem = {
  id: string;
  title: string;
  summary: string;
  href: string;
  parts?: ToolPart[];
};

export type ToolCategory = {
  id: string;
  number: string;
  title: string;
  blurb: string;
  tools: ToolItem[];
};

/** Arsenal from Drive: עסק → כלים → ארסנל סקילי Cursor */
const DRIVE_CATEGORIES: ToolCategory[] = [
  {
    id: "vercel",
    number: "01",
    title: "פריסה וענן Vercel",
    blurb: "דיפלוי, חיבורים, חומת אש, פונקציות, ארגז חול, אחסון ו־Workflow.",
    tools: [
      {
        id: "deploy-vercel",
        title: "פריסה ל־Vercel בלחיצה",
        summary: "מדריך לפריסת הפרויקט ל־Vercel במהירות — חיבור ריפו, סביבות ו־URL חי.",
        href: "https://docs.google.com/document/d/1GFo_fDguudtTAHSdYak9BUXriMhvL6oYStYFU1QhbKo/edit",
      },
      {
        id: "secure-connect",
        title: "חיבור מאובטח לשירותי צד־שלישי",
        summary: "איך לחבר שירותים חיצוניים בצורה בטוחה (סודות, OAuth, scopes).",
        href: "https://docs.google.com/document/d/1HW87yhGIjtfKJX8fSAZ5-6HTCgqOS1C-TGrgRFsLDOc/edit",
      },
      {
        id: "multi-service",
        title: "מולטי־שירות בפרויקט אחד",
        summary: "ארגון כמה שירותים / מוצרים תחת אותו פרויקט Vercel.",
        href: "https://docs.google.com/document/d/18MHd_eTFPy0JUkFi4M-YRZmSe5gJ3QNeUKaG9pVvHvw/edit",
      },
      {
        id: "firewall",
        title: "חומת אש והגנה מפני התקפות",
        summary: "הגדרת Vercel Firewall — כללים, בוטים, rate limits והגנה על נתיבים.",
        href: "https://docs.google.com/document/d/1GqRfUeH1_Den3udX1ysnPOLH9ZdNFNGvF-WTBzV-18o/edit",
        parts: [
          {
            label: "חלק א",
            href: "https://docs.google.com/document/d/1GqRfUeH1_Den3udX1ysnPOLH9ZdNFNGvF-WTBzV-18o/edit",
          },
          {
            label: "חלק ב",
            href: "https://docs.google.com/document/d/1IwUpv8TIbJvO9sxbCALhFPK7nvyKQmJy2pivKgtPA8o/edit",
          },
          {
            label: "חלק ג",
            href: "https://docs.google.com/document/d/1V4VvivTPP_HHihZuAUBlTVv-rpcBka4PSly-mz441IU/edit",
          },
        ],
      },
      {
        id: "functions",
        title: "פונקציות שרת ו־Fluid Compute",
        summary: "Serverless / Fluid — timeouts, streaming, edge מול node, ודפוסי API.",
        href: "https://docs.google.com/document/d/1S9sP4dl0n6LtZ6B_KvcoBnyilGp-Z9IrGpXH55yUzrE/edit",
        parts: [
          {
            label: "חלק א",
            href: "https://docs.google.com/document/d/1S9sP4dl0n6LtZ6B_KvcoBnyilGp-Z9IrGpXH55yUzrE/edit",
          },
          {
            label: "חלק ב",
            href: "https://docs.google.com/document/d/1VhoMQ-wr-5VKKAG1KQfqbLzWZRwWcicgIInFikfbBM4/edit",
          },
          {
            label: "חלק ג",
            href: "https://docs.google.com/document/d/1WSeE90NM4e1dSIZP8QSNlZFYFehBA0kdloZdjQeysjc/edit",
          },
          {
            label: "חלק ד",
            href: "https://docs.google.com/document/d/1zf8XW2znpgnp7nY1_gs3zsSL2Kv80H4pqyGo2e1pSWg/edit",
          },
          {
            label: "חלק ה",
            href: "https://docs.google.com/document/d/1S1vXxVEClleqmKnE7hwvwxce0-RGKolXJ0lmoKRXSLA/edit",
          },
        ],
      },
      {
        id: "sandbox",
        title: "ארגז חול להרצת קוד לא מהימן",
        summary: "הרצת קוד מבודד ב־Sandbox — שימושי לסוכנים, evals ובדיקות מסוכנות.",
        href: "https://docs.google.com/document/d/1lVyNYzJy_852v6L6fUrEyZfpyrydkq_N-1RD4AOK5tQ/edit",
        parts: [
          {
            label: "חלק א",
            href: "https://docs.google.com/document/d/1lVyNYzJy_852v6L6fUrEyZfpyrydkq_N-1RD4AOK5tQ/edit",
          },
          {
            label: "חלק ב",
            href: "https://docs.google.com/document/d/1PXsLMktlQBjgnMcjbXpMsmJQWpkll-_k2vRp58a1New/edit",
          },
          {
            label: "חלק ג",
            href: "https://docs.google.com/document/d/14qmEHm6pFn__EZWh0HPTpfKxmZrjOOcRGenAOjlSSBY/edit",
          },
        ],
      },
      {
        id: "storage",
        title: "אחסון Blob · Redis · Postgres",
        summary: "Vercel Storage — קבצים ב־Blob, מטמון Redis ומסד Postgres.",
        href: "https://docs.google.com/document/d/162sOS7ltoUr0DI4jSPHLHLSl13o2KX8nUlTP93L22jY/edit",
        parts: [
          {
            label: "חלק א",
            href: "https://docs.google.com/document/d/162sOS7ltoUr0DI4jSPHLHLSl13o2KX8nUlTP93L22jY/edit",
          },
          {
            label: "חלק ב",
            href: "https://docs.google.com/document/d/1lCPYSLYmt2dH4sG0J4myH3jNAJ_i5IF1lZ725DGAFto/edit",
          },
          {
            label: "חלק ג",
            href: "https://docs.google.com/document/d/1nsMcrk62pYu-qZtVBHq_0XO-qfjBFW-fVN3TxVjMV3I/edit",
          },
        ],
      },
      {
        id: "workflow",
        title: "תהליכי עבודה עמידים · Workflow SDK",
        summary: "Workflows ארוכים עם retries, steps ו־durability על Vercel.",
        href: "https://docs.google.com/document/d/17KwKAPTvLdCawms_K9aOZnCLic59NuGXtmDLYxrWmvs/edit",
        parts: [
          {
            label: "חלק א",
            href: "https://docs.google.com/document/d/17KwKAPTvLdCawms_K9aOZnCLic59NuGXtmDLYxrWmvs/edit",
          },
          {
            label: "חלק ב",
            href: "https://docs.google.com/document/d/13j5IBh-h_QMtFHXlLHW2kwfmYRKKSrp5ffAyOLewZDU/edit",
          },
          {
            label: "חלק ג",
            href: "https://docs.google.com/document/d/1j0XiKVh-eXJFP3fNQoFXBiEICc0ERN_oKgxQKmnDyrY/edit",
          },
          {
            label: "חלק ד",
            href: "https://docs.google.com/document/d/15-H76yGMIAOVIQMXz2yQ-9ogk3RzGKzOcBOMlfDY_Es/edit",
          },
          {
            label: "חלק ה",
            href: "https://docs.google.com/document/d/15Ma1hE_AR0tZuPUxystRRDlibZTaiwY8t7PEMwiCR8k/edit",
          },
        ],
      },
      {
        id: "e2e-verify",
        title: "אימות מקצה־לקצה של האפליקציה",
        summary: "בדיקה שהזרימה המלאה עובדת אחרי דיפלוי — לא רק build ירוק.",
        href: "https://docs.google.com/document/d/1y19p6D-RxruaXIY3kDaT86uuNguRL7PYoT8_jx-zJTQ/edit",
      },
    ],
  },
  {
    id: "agents",
    number: "02",
    title: "סוכנים ואוטומציה",
    blurb: "Automations, Agent SDK, Cursor SDK, Autopilot, Loop ו־Goals.",
    tools: [
      {
        id: "automations",
        title: "בניית אוטומציות Cursor",
        summary: "יצירת Automations שמריצות סוכן על אירועים — PR, CI, לוח זמנים.",
        href: "https://docs.google.com/document/d/1a1KS5PjmjlXJgmc77UIv0BNUNEzP59HiT3TdZoUroqs/edit",
        parts: [
          {
            label: "חלק א",
            href: "https://docs.google.com/document/d/1a1KS5PjmjlXJgmc77UIv0BNUNEzP59HiT3TdZoUroqs/edit",
          },
          {
            label: "חלק ב",
            href: "https://docs.google.com/document/d/1R7OM93Oct6-XFVtghp5neni0uuwB5tHbn4LSmbNynus/edit",
          },
          {
            label: "חלק ג",
            href: "https://docs.google.com/document/d/1LreM0IZBadOnM_g5V_URscDpCuN-M1prW9mpmpxEogc/edit",
          },
          {
            label: "חלק ד",
            href: "https://docs.google.com/document/d/1rHWKkijjaVtN9fWOJ0q3NiBKkzCqM89aYmk6ri8M30w/edit",
          },
        ],
      },
      {
        id: "agent-sdk",
        title: "יצירת סוכן Agent SDK",
        summary: "Scaffold לסוכן מותאם עם Agent SDK — מבנה, כלים והרצה.",
        href: "https://docs.google.com/document/d/1Z_T1Py3zaxcWIhhqTQDD9aXGS3jeiSG6Etv-IcY0c-U/edit",
      },
      {
        id: "cursor-sdk",
        title: "מדריך Cursor SDK המלא",
        summary: "מדריך מקיף לבניית אפליקציות וממשקים מעל Cursor SDK.",
        href: "https://docs.google.com/document/d/1r9chWuQatJ_HMr4Ze0yilo6sAKAPgjjplXQdkhekf64/edit",
      },
      {
        id: "autopilot",
        title: "שמירת PR מוכן למיזוג",
        summary: "Autopilot — לשמור PR ירוק ומוכן למיזוג (קומנטים, CI, תיקונים).",
        href: "https://docs.google.com/document/d/1BgZEgwGfoB7yHqWYWZu1fjLb_drMRXJ0XSTVdfpvFkY/edit",
      },
      {
        id: "loop",
        title: "לולאת משימות חוזרת",
        summary: "הרצת פרומפט / סקיל במרווחים קבועים עד שהמטרה הושגה.",
        href: "https://docs.google.com/document/d/1tK9S2LzT6avxwwvCnkknYjOyKvsIFZAP60C47i0Gpj4/edit",
      },
      {
        id: "goals",
        title: "יעדים עד השלמה",
        summary: "ניהול Goals — יעד ברור, מעקב התקדמות והשלמה אוטומטית.",
        href: "https://docs.google.com/document/d/10qe9Ra2uB8IO85-9dlrg_Yrx0RYUBLuj9jj_M1iQ5Cg/edit",
      },
    ],
  },
  {
    id: "review",
    number: "03",
    title: "ביקורת קוד ואבטחה",
    blurb: "Bugbot ו־Security Review על שינויים מקומיים או ב־PR.",
    tools: [
      {
        id: "bugbot-or-security",
        title: "ביקורת קוד · Bugbot או אבטחה",
        summary: "מתי לבחור Bugbot ומתי Security Review — נקודת כניסה מהירה.",
        href: "https://docs.google.com/document/d/1FCpQ2IVHe342Gt21hleabEShQ8piMyhPaPGXQfn26hA/edit",
      },
      {
        id: "bugbot",
        title: "ציד באגים עם Bugbot",
        summary: "סקירת דיפים עם Bugbot — באגים, edge cases וריגרסיות.",
        href: "https://docs.google.com/document/d/18S90prWBj8OrXZHTEaNh5H5kwQiBsDexgecSOwOKmU8/edit",
      },
      {
        id: "security-review",
        title: "ביקורת אבטחה מקצועית",
        summary: "בדיקת אבטחה ממוקדת: auth, secrets, injection וחשיפות.",
        href: "https://docs.google.com/document/d/15GnV1XVVoqUSTNg2Jk8nm4Y-_7IClaiJs_g_wPdOjyc/edit",
      },
    ],
  },
  {
    id: "repo",
    number: "04",
    title: "ריפו ושיתוף",
    blurb: "ריפו חדש, Origin, Share ופיצול עבודה ל־PR-ים קטנים.",
    tools: [
      {
        id: "new-repo",
        title: "יצירת ריפו חדש ב־Cursor",
        summary: "פתיחת ריפו Cursor-hosted מהפרויקט הנוכחי.",
        href: "https://docs.google.com/document/d/1keagynmw9PTOJCHdm5-oDFKlgpxoOvNL-se8v9Bvl3o/edit",
      },
      {
        id: "origin-cli",
        title: "התקנה ותיקון Origin CLI",
        summary: "התקנה, התחברות ותיקון של Origin — ה־git host של Cursor.",
        href: "https://docs.google.com/document/d/1JXEgcJp8AXvc5939_6Ko2nYQLPJ9xS7ZEix1yLNEv4Q/edit",
      },
      {
        id: "share",
        title: "שמירה ושיתוף פרויקט",
        summary: "גיבוי ושיתוף של הפרויקט / הצ׳אט עם צוות או לינק.",
        href: "https://docs.google.com/document/d/1HyWFNJ4vhCpVPHY6XwpyA9xP1FFl8568r6Eyr5rf1ZY/edit",
      },
      {
        id: "split-prs",
        title: "פיצול עבודה ל־PR-ים קטנים",
        summary: "פיצול שינויים גדולים ל־PR-ים קטנים וקלים לריוויו.",
        href: "https://docs.google.com/document/d/1ahxg0-bskC-fbiuE1spOJ-iVNPUDyhp3JDQt90irGjs/edit",
      },
    ],
  },
  {
    id: "design",
    number: "05",
    title: "עיצוב וויזואליזציה",
    blurb: "Canvas ליד הצ׳אט ותרשימים בתוך השיחה.",
    tools: [
      {
        id: "canvas",
        title: "קנבס אינטראקטיבי ליד הצ׳אט",
        summary: "בניית Canvas React חי לצד השיחה — דשבורדים, טבלאות וחקירה.",
        href: "https://docs.google.com/document/d/1k0ZL6xF493USixl7pS27xgg4Uxmhnx70Cm9QDRDCkvw/edit",
      },
      {
        id: "visualize",
        title: "תרשימים וויזואליזציות בשיחה",
        summary: "הצגת נתונים כטבלאות, Mermaid ודיאגרמות בתוך התשובה.",
        href: "https://docs.google.com/document/d/1dWAPhaJaPkMrDHobqMFJdAv3llCwwH06YhobKOlh9wI/edit",
      },
    ],
  },
  {
    id: "capabilities",
    number: "06",
    title: "בניית יכולות Cursor",
    blurb: "Skills, Rules, Hooks, Subagents, Migrate ו־Onboard.",
    tools: [
      {
        id: "create-skills",
        title: "כתיבת סקילים חדשים",
        summary: "איך לכתוב SKILL.md שימושי שהסוכן באמת יפעיל.",
        href: "https://docs.google.com/document/d/1MHZ8qdowyBU_vSYcTT6hZCrslKmA-5jqd89JujtRy9s/edit",
      },
      {
        id: "project-rules",
        title: "כתיבת חוקי פרויקט",
        summary: "Rules קבועים לפרויקט — סגנון, אבטחה והעדפות צוות.",
        href: "https://docs.google.com/document/d/11mabapoqJHimx9Cx7WErrVQAY3yfTSLrgAaZJBUKITM/edit",
      },
      {
        id: "hooks",
        title: "יצירת Hooks לאירועי סוכן",
        summary: "Hooks על אירועי סוכן — לפני/אחרי כלים, אימותים אוטומטיים.",
        href: "https://docs.google.com/document/d/1q_Ar9Fp46sgTsOzeKSal5T2OnuJGrWgVYvA0KlFPNsc/edit",
      },
      {
        id: "subagents",
        title: "יצירת תת־סוכנים",
        summary: "Subagents ייעודיים למשימות (ריוויו, חקירה, ביצוע).",
        href: "https://docs.google.com/document/d/1UeZfUWOYdfhRBKicA075j7whooXzJN9SIZOtVwm-png/edit",
      },
      {
        id: "migrate",
        title: "המרה לכלים מודרניים",
        summary: "מיגרציה לכלים והסכמות החדשות של Cursor.",
        href: "https://docs.google.com/document/d/1bvRPiHs1chnkXH0Ghgl23TdJI240TTWPcJ0B17_jC44/edit",
      },
      {
        id: "onboard",
        title: "אונבורדינג לצוות ולפרויקט",
        summary: "הכנסת חברי צוות לפרויקט עם הקשר, כללים וסקילים.",
        href: "https://docs.google.com/document/d/1mCEjzgsrT0cytXiCYqglyfhEJS7N4ck352wAc4qeaY8/edit",
      },
    ],
  },
  {
    id: "settings",
    number: "07",
    title: "הגדרות וממשק",
    blurb: "Settings, CLI, Statusline, Shell ושינוי שם צ׳אט.",
    tools: [
      {
        id: "cursor-settings",
        title: "עדכון הגדרות Cursor",
        summary: "שינוי הגדרות IDE / סוכן דרך סקיל ייעודי.",
        href: "https://docs.google.com/document/d/1spcXQRJ0GA6cIye8hicoZIhFxyfBmWvqiy4wBJbBQqo/edit",
      },
      {
        id: "cli-config",
        title: "עדכון קונפיג CLI",
        summary: "הגדרת Cursor CLI — מודלים, הרשאות וסביבת טרמינל.",
        href: "https://docs.google.com/document/d/1O3eNNl1b9W8YR04tbRh_1XdcDRe1n2Tpqpibnc92ShY/edit",
      },
      {
        id: "statusline",
        title: "שורת סטטוס מותאמת",
        summary: "עיצוב status line מותאם אישית ב־CLI.",
        href: "https://docs.google.com/document/d/14UjgMNcR-_jDb60DOjgqAUmu9vwhRVk26LDzgoYIh8E/edit",
      },
      {
        id: "shell-guidance",
        title: "הנחיות Shell לסוכן",
        summary: "כללים לאיך הסוכן מריץ פקודות בטרמינל בצורה בטוחה.",
        href: "https://docs.google.com/document/d/1E6VMwA41WlKWqrdUCbg3vqHFBk65ooaIt-HeFvDGUBE/edit",
      },
      {
        id: "rename-chat",
        title: "שינוי שם צ׳אט",
        summary: "שינוי כותרת הצ׳אט הנוכחי לשם ברור ושמור.",
        href: "https://docs.google.com/document/d/1Klr2vHdWhmGwqodANSViadW_W_2q0DfCCTJ7qqyCL6s/edit",
      },
    ],
  },
  {
    id: "drive",
    number: "08",
    title: "גוגל דרייב",
    blurb: "עבודה עם Drive דרך MCP — קריאה, חיפוש ועדכון קבצים.",
    tools: [
      {
        id: "drive-mcp",
        title: "עבודה עם Google Drive דרך MCP",
        summary: "חיבור Drive לסוכן: חיפוש, קריאה, תיקיות ועדכון מסמכים.",
        href: "https://docs.google.com/document/d/1mLzPwsJ7P8XRFfY16VJ80JN8dGcsnpc5PmL7YKTOgAQ/edit",
      },
    ],
  },
];

/** AAA / aaas.solutions curated skills (full SKILL.md in tools-bodies) */
const AAA_CATEGORIES = aaaCategories as ToolCategory[];

export const TOOL_CATEGORIES: ToolCategory[] = [
  ...DRIVE_CATEGORIES,
  ...AAA_CATEGORIES,
];

export const TOOLS_MAP_HREF =
  "https://docs.google.com/document/d/1auH54W1UKYoZkvH9mj2osiA3x0bvHUGbMqvTE-w5HOg/edit";

export const TOOLS_FOLDER_HREF =
  "https://drive.google.com/drive/folders/1cm-mRcyq-X1KzyNgSeeHQbzyVl27ttJb";

export const AAA_SKILLS_HREF = "https://aaas.solutions/skills";
