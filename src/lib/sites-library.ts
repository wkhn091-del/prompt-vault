export type SiteItem = {
  id: string;
  title: string;
  summary: string;
  href: string;
  kind?: "doc" | "pdf" | "zip";
};

export type SiteCategory = {
  id: string;
  number: string;
  title: string;
  blurb: string;
  items: SiteItem[];
};

export const SITES_FOLDER_HREF =
  "https://drive.google.com/drive/folders/1EdLNFzkykni_Dw1WtztFKHF-KBe9Srq2";

/** Playbooks from Drive: תקיית האתרים שלי */
export const SITE_CATEGORIES: SiteCategory[] = [
  {
    id: "foundations",
    number: "01",
    title: "יסודות ובסיס",
    blurb: "השיטה, תיקיית בסיס, Agency Starter ופורמטים כלליים.",
    items: [
      {
        id: "method",
        title: "השיטה שלי",
        summary:
          "פרומפט הפעלה — הדבק בריף לקוח והפעל מודול 1 מתוך website-build-scripts.",
        href: "https://docs.google.com/document/d/12fMJUB1G6zjRBaZgo3DxN9fUR0vyEv9dgfPaiARy07k/edit",
      },
      {
        id: "site-kit",
        title: "תקיה בסיסית לאתר",
        summary:
          "Boilerplate RTL · סכמות Sanity · env template · שאלון קליטת לקוח.",
        href: "https://docs.google.com/document/d/1GVgC1ye4AX2lipx1gROdiT9qQAdzGWGnZaXDsHmEZFY/edit",
      },
      {
        id: "agency",
        title: "Agency Starter Kit",
        summary:
          "Next.js 14 + Sanity + Tailwind + Framer Motion — הקמת תיקיית בסיס מלאה.",
        href: "https://docs.google.com/document/d/1gKG9LCdxJpDi7fybB-7W1VjrBd8znMi8ySKljjE5aW8/edit",
      },
      {
        id: "formats",
        title: "פורמטים לאתר",
        summary: "ספריית פורמטים מלאה לבניית אתרים — מבנים, דפוסים וטמפלטים.",
        href: "https://docs.google.com/document/d/1yneGW08SGl6RSBTbkF3df8Wb78g2rr3MOocKaBO4n7I/edit",
      },
    ],
  },
  {
    id: "craft",
    number: "02",
    title: "UI · UX · אנימציה",
    blurb: "מדריכי עיצוב, חוויית משתמש ואנימציות לאתרים.",
    items: [
      {
        id: "ui",
        title: "UI",
        summary: "מדריך UI מלא — טיפוגרפיה, צבע, רכיבים והיררכיה ויזואלית.",
        href: "https://docs.google.com/document/d/1vCm7ML9ETKGwiTR9ydjmYLYRbI2LS_uROzn6_srQERc/edit",
      },
      {
        id: "ux",
        title: "UX",
        summary: "מדריך UX — זרימות, חיכוך, נגישות והחלטות מוצר באתר.",
        href: "https://docs.google.com/document/d/1t8zmEm2-QAqVy7jrg9l23y5fwjpXYJBOmtd7PkVkBvM/edit",
      },
      {
        id: "animations",
        title: "אנימציות לאתרים",
        summary: "מערכת תנועה, Framer/GSAP, מיקרו-אינטראקציות וביצועים.",
        href: "https://docs.google.com/document/d/1zUTIibWpSed5ST780VEHdF72c6uLgTLRFCnLg3T2M3w/edit",
      },
    ],
  },
  {
    id: "playbooks",
    number: "03",
    title: "סקריפטי בנייה",
    blurb: "Playbooks מודולריים — דימו, דף נחיתה, איקומרס וסינון לפני מכירה.",
    items: [
      {
        id: "demo",
        title: "סקריפט לאתר דימו",
        summary:
          "Proof of Concept ברמת Awwwards — WOW לסגירת לקוח, בלי בקאנד.",
        href: "https://docs.google.com/document/d/1uY2f5v5--FL8jSnwQaGaq_nOfSheoVkO9-YQq0quJhQ/edit",
      },
      {
        id: "landing",
        title: "פורמט דף נחיתה",
        summary: "ארכיטקטורת CRO, פסיכולוגיית המרות, טפסים, tracking והשקה.",
        href: "https://docs.google.com/document/d/1owZTlhlDFC2WcCddb3iPKZKJa_iS8QwZVv6g33pwLsI/edit",
      },
      {
        id: "ecom-classic",
        title: "איקומרס קלאסי Tier 1",
        summary:
          "חנות High-Volume — Sanity, עגלה, אבטחה, חיפוש, Upsell ומסירה.",
        href: "https://docs.google.com/document/d/1WgGCrUKaGA5N1ohYiiY2oylFYovZ5ZF4K9PcnahCHaw/edit",
      },
      {
        id: "ecom-3d",
        title: "איקומרס 3D / אימרסיבי Tier 2/3",
        summary:
          "WebGL + R3F מעל איקומרס — ביצועים, CSP, רישוי ומסירת שואורום.",
        href: "https://docs.google.com/document/d/10j8LwSJz3wQB2KHLADjw4JNQ6sneMbplqbZbGkiTzJk/edit",
      },
      {
        id: "pre-sale",
        title: "הפורמט שמאשר מכירה",
        summary:
          "ארבע ביקורות אכזריות לפני סגירה — לקוח, אבטחה, משפטי ו־CRO.",
        href: "https://docs.google.com/document/d/1vVkP2tSlVUlLhaktcyl814gs4aO6TqeiXWg1iNcXtGo/edit",
      },
    ],
  },
  {
    id: "assets",
    number: "04",
    title: "קבצים וחבילות",
    blurb: "PDF ו־ZIP מהתיקייה — לפתיחה בדרייב / הורדה.",
    items: [
      {
        id: "million-sites-book",
        title: "Million Sites Book",
        summary: "ספר PDF מהתיקייה — מדריך לבניית אתרים בקנה מידה.",
        href: "https://drive.google.com/file/d/1xUxBhaOVTnnGwBDJn6tplPYWY1odGHOl/view",
        kind: "pdf",
      },
      {
        id: "motion-kit",
        title: "Motion Kit",
        summary: "חבילת motion-kit.zip — נכסי תנועה לבניית אתרים.",
        href: "https://drive.google.com/file/d/1rrKsAcMN57zGAvZ7B7hGup3BvwY3ZFRS/view",
        kind: "zip",
      },
    ],
  },
];
