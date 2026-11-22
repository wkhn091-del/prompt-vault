export type SiteItem = {
  id: string;
  title: string;
  summary: string;
  href: string;
  kind?: "doc" | "pdf" | "zip" | "folder";
};

/** One Academy course = one Drive playbook, ordered as steps. */
export type AcademyCourse = {
  id: string;
  number: string;
  title: string;
  blurb: string;
  /** Original multi-tab Google Doc */
  sourceHref?: string;
  /** Drive folder with the stepped docs */
  folderHref?: string;
  /** Numbered steps only, in order (00 map → …) */
  steps: SiteItem[];
};

export const SITES_FOLDER_HREF =
  "https://drive.google.com/drive/folders/1EdLNFzkykni_Dw1WtztFKHF-KBe9Srq2";

/**
 * Academy curriculum — one course per playbook, steps in order.
 * Flat “everything mixed” lists are gone.
 */
export const ACADEMY_COURSES: AcademyCourse[] = [
  {
    id: "foundations",
    number: "01",
    title: "יסודות",
    blurb: "הפעלה, תיקיית בסיס ו-Agency Starter — לפני כל בנייה.",
    steps: [
      {
        id: "method",
        title: "השיטה שלי",
        summary: "פרומפט הפעלה — הדבק בריף והפעל מודול.",
        href: "https://docs.google.com/document/d/12fMJUB1G6zjRBaZgo3DxN9fUR0vyEv9dgfPaiARy07k/edit",
      },
      {
        id: "site-kit",
        title: "תקיה בסיסית לאתר",
        summary: "Boilerplate RTL · Sanity · env · שאלון.",
        href: "https://docs.google.com/document/d/1GVgC1ye4AX2lipx1gROdiT9qQAdzGWGnZaXDsHmEZFY/edit",
      },
      {
        id: "agency",
        title: "Agency Starter Kit",
        summary: "Next.js + Sanity + Tailwind + Framer Motion.",
        href: "https://docs.google.com/document/d/1gKG9LCdxJpDi7fybB-7W1VjrBd8znMi8ySKljjE5aW8/edit",
      },
    ],
  },
  {
    id: "prompt-how",
    number: "02",
    title: "איך כותבים פרומפט",
    blurb: "מסגרת 4 שלבים לכתיבת פרומפט מקצועי.",
    sourceHref:
      "https://docs.google.com/document/d/1yneGW08SGl6RSBTbkF3df8Wb78g2rr3MOocKaBO4n7I/edit",
    steps: [
      {
        id: "prompt-how-doc",
        title: "איך כותבים פרומפט",
        summary: "Role · Task · Context · Format — טאב במסמך פורמטים.",
        href: "https://docs.google.com/document/d/1yneGW08SGl6RSBTbkF3df8Wb78g2rr3MOocKaBO4n7I/edit",
      },
    ],
  },
  {
    id: "prompt-noam",
    number: "03",
    title: "פרומפט נועם",
    blurb: "פרומפט נועם מתוך מסמך הפורמטים.",
    sourceHref:
      "https://docs.google.com/document/d/1yneGW08SGl6RSBTbkF3df8Wb78g2rr3MOocKaBO4n7I/edit",
    steps: [
      {
        id: "prompt-noam-doc",
        title: "פרומפט נועם",
        summary: "טאב «פרומט נועם» במסמך פורמטים לאתר.",
        href: "https://docs.google.com/document/d/1yneGW08SGl6RSBTbkF3df8Wb78g2rr3MOocKaBO4n7I/edit",
      },
    ],
  },
  {
    id: "format-basic",
    number: "04",
    title: "פורמט בסיסי לאתר",
    blurb: "פורמט בסיסי לבניית אתר.",
    sourceHref:
      "https://docs.google.com/document/d/1yneGW08SGl6RSBTbkF3df8Wb78g2rr3MOocKaBO4n7I/edit",
    steps: [
      {
        id: "format-basic-doc",
        title: "פורמט בסיסי לאתר",
        summary: "טאב «פורמט בסיסי לאתר».",
        href: "https://docs.google.com/document/d/1yneGW08SGl6RSBTbkF3df8Wb78g2rr3MOocKaBO4n7I/edit",
      },
    ],
  },
  {
    id: "format-one-basic",
    number: "05",
    title: "פורמט אחד לאתר בסיסי",
    blurb: "פורמט אחד מרוכז לאתר בסיסי.",
    sourceHref:
      "https://docs.google.com/document/d/1yneGW08SGl6RSBTbkF3df8Wb78g2rr3MOocKaBO4n7I/edit",
    steps: [
      {
        id: "format-one-basic-doc",
        title: "פורמט אחד לאתר בסיסי",
        summary: "טאב «פורמט אחד לאתר בסיסי».",
        href: "https://docs.google.com/document/d/1yneGW08SGl6RSBTbkF3df8Wb78g2rr3MOocKaBO4n7I/edit",
      },
    ],
  },
  {
    id: "site-build-formats",
    number: "06",
    title: "פורמטים לבניית האתר",
    blurb: "סקריפטים 1 · 1.2 · 1.3 · 1.4 · 2 · 3 · 4 · 5 · 6 — מסלול הבנייה המלא.",
    sourceHref:
      "https://docs.google.com/document/d/1yneGW08SGl6RSBTbkF3df8Wb78g2rr3MOocKaBO4n7I/edit",
    folderHref:
      "https://drive.google.com/drive/folders/1m58uVg0CGUm_7AgqSc4WwxWc8KELuL84",
    steps: [
      {
        id: "build-1",
        title: "סקריפט 1 · בנייה, אזור אישי ואימות",
        summary: "ליבה, אזור אישי ומנוע אימות.",
        href: "https://docs.google.com/document/d/1yneGW08SGl6RSBTbkF3df8Wb78g2rr3MOocKaBO4n7I/edit",
      },
      {
        id: "build-1-2",
        title: "סקריפט 1.2 · ההירו",
        summary: "Hero — הודעה ראשונה ו-CTA.",
        href: "https://docs.google.com/document/d/1yneGW08SGl6RSBTbkF3df8Wb78g2rr3MOocKaBO4n7I/edit",
      },
      {
        id: "build-1-3",
        title: "סקריפט 1.3 · אלמנטים",
        summary: "אלמנטי ממשק ומבנה.",
        href: "https://docs.google.com/document/d/1yneGW08SGl6RSBTbkF3df8Wb78g2rr3MOocKaBO4n7I/edit",
      },
      {
        id: "build-1-4",
        title: "סקריפט 1.4",
        summary: "המשך סקריפט 1 — מנוע / שכבה הבאה.",
        href: "https://docs.google.com/document/d/1yneGW08SGl6RSBTbkF3df8Wb78g2rr3MOocKaBO4n7I/edit",
      },
      {
        id: "build-2",
        title: "סקריפט 2 · מנוע המרות וביצועים",
        summary: "המרות, ביצועים וסימולציית לקוח.",
        href: "https://docs.google.com/document/d/1yneGW08SGl6RSBTbkF3df8Wb78g2rr3MOocKaBO4n7I/edit",
      },
      {
        id: "build-3",
        title: "סקריפט 3 · חומת אבטחה והשקה",
        summary: "אבטחה והשקה לציבור.",
        href: "https://docs.google.com/document/d/1yneGW08SGl6RSBTbkF3df8Wb78g2rr3MOocKaBO4n7I/edit",
      },
      {
        id: "build-4",
        title: "סקריפט 4 · מסירה ללקוח",
        summary: "מסירה והכנה למכירות.",
        href: "https://docs.google.com/document/d/1yneGW08SGl6RSBTbkF3df8Wb78g2rr3MOocKaBO4n7I/edit",
      },
      {
        id: "build-5",
        title: "סקריפט 5 · ביקורת סופית",
        summary: "ביקורת סופית מקיפה.",
        href: "https://docs.google.com/document/d/1yneGW08SGl6RSBTbkF3df8Wb78g2rr3MOocKaBO4n7I/edit",
      },
      {
        id: "build-6",
        title: "סקריפט 6 · סינון אכזרי",
        summary: "לא חובה — סינון אכזרי.",
        href: "https://docs.google.com/document/d/1yneGW08SGl6RSBTbkF3df8Wb78g2rr3MOocKaBO4n7I/edit",
      },
    ],
  },
  {
    id: "format-personal",
    number: "07",
    title: "פורמט לאתר אישי",
    blurb: "פורמט ייעודי לאתר אישי.",
    sourceHref:
      "https://docs.google.com/document/d/1yneGW08SGl6RSBTbkF3df8Wb78g2rr3MOocKaBO4n7I/edit",
    steps: [
      {
        id: "format-personal-doc",
        title: "פורמט לאתר אישי",
        summary: "טאב «פורמט לאתר אישי».",
        href: "https://docs.google.com/document/d/1yneGW08SGl6RSBTbkF3df8Wb78g2rr3MOocKaBO4n7I/edit",
      },
    ],
  },
  {
    id: "format-app",
    number: "08",
    title: "פורמט לבניית אפליקציה",
    blurb: "פורמט לבניית אפליקציה.",
    sourceHref:
      "https://docs.google.com/document/d/1yneGW08SGl6RSBTbkF3df8Wb78g2rr3MOocKaBO4n7I/edit",
    steps: [
      {
        id: "format-app-doc",
        title: "פורמט לבניית אפליקציה",
        summary: "טאב «פורמט לבניית אפליקציה».",
        href: "https://docs.google.com/document/d/1yneGW08SGl6RSBTbkF3df8Wb78g2rr3MOocKaBO4n7I/edit",
      },
    ],
  },
  {
    id: "format-3d-sites",
    number: "09",
    title: "אתרי 3D",
    blurb: "פורמט לאתרי תלת־ממד.",
    sourceHref:
      "https://docs.google.com/document/d/1yneGW08SGl6RSBTbkF3df8Wb78g2rr3MOocKaBO4n7I/edit",
    steps: [
      {
        id: "format-3d-sites-doc",
        title: "אתרי 3D",
        summary: "טאב «אתרי 3D».",
        href: "https://docs.google.com/document/d/1yneGW08SGl6RSBTbkF3df8Wb78g2rr3MOocKaBO4n7I/edit",
      },
    ],
  },
  {
    id: "ui",
    number: "10",
    title: "UI",
    blurb: "מנוע UI ומיקרו־אסתטיקה — 7 שלבים מסטטיק עד סגירה.",
    sourceHref:
      "https://docs.google.com/document/d/1vCm7ML9ETKGwiTR9ydjmYLYRbI2LS_uROzn6_srQERc/edit",
    folderHref:
      "https://drive.google.com/drive/folders/1Zo0pMY3kTiTk_H9wqXcYG6JjJWfazi6J",
    steps: [
      {
        id: "ui-map",
        title: "00 · מפה",
        summary: "מפת 7 שלבי UI.",
        href: "https://docs.google.com/document/d/1GVsh83HaxQAdH1LMYRb-2IPJMDpHSSrrxJrIBHYK-q8/edit",
      },
      {
        id: "ui-01",
        title: "01 · יסוד סטטי",
        summary: "Static Gate + מיקרו־אסתטיקה.",
        href: "https://docs.google.com/document/d/18n1i0sCdWnSzPMC7BnKSJqBsE-0GH8WoI8Fi29wiw1U/edit",
      },
      {
        id: "ui-02",
        title: "02 · מעטפת",
        summary: "Header / Hero / Footer.",
        href: "https://docs.google.com/document/d/1xFH6BH7V617Dggn3vvOpkco72ue7kgwZS-usZUi93d8/edit",
      },
      {
        id: "ui-03",
        title: "03 · אלמנטים",
        summary: "Art Direction.",
        href: "https://docs.google.com/document/d/1ZKOOh8SkgPToA5XPEr7qXXP7PcJQonzHZDGobTxLxFk/edit",
      },
      {
        id: "ui-04",
        title: "04 · תלת־ממד",
        summary: "ציד נכסים + Poster SSR.",
        href: "https://docs.google.com/document/d/1rDCHzij7cDVfyCTkPcpuQDW5o2ziOKhT8JhseuQqBN8/edit",
      },
      {
        id: "ui-05",
        title: "05 · המרות ואמון",
        summary: "CRO סטטי.",
        href: "https://docs.google.com/document/d/1Cvh7toimPgagrktkVE5N0gso8K-H7pXfrs9MYgX4hII/edit",
      },
      {
        id: "ui-06",
        title: "06 · שוליים והשקה",
        summary: "404 · OTP · מיילים · OG.",
        href: "https://docs.google.com/document/d/1f1ovb5PsYALTSP2NrtwU3TMv-movsc18--Pslwyz4VA/edit",
      },
      {
        id: "ui-07",
        title: "07 · סגירה",
        summary: "אריזה + QA + גיליוטינת קופי.",
        href: "https://docs.google.com/document/d/1Z6G20L5GOFpOlxmDsjIEObHRT-k3m8Kuu2wboihBAxI/edit",
      },
    ],
  },
  {
    id: "ux",
    number: "11",
    title: "UX",
    blurb: "מליבה ואזור אישי עד ביקורת AppSec — 7 שלבים.",
    sourceHref:
      "https://docs.google.com/document/d/1t8zmEm2-QAqVy7jrg9l23y5fwjpXYJBOmtd7PkVkBvM/edit",
    folderHref:
      "https://drive.google.com/drive/folders/1t9C9yXIh32qqrvfOjJywVOOXptEBgG1s",
    steps: [
      {
        id: "ux-00",
        title: "00 · מפה",
        summary: "מפת 7 שלבי UX.",
        href: "https://docs.google.com/document/d/1XG3Q_eK4P_-3-4UF4Wj8gk8oBaOLN9oq5SKDDU6nWeg/edit",
      },
      {
        id: "ux-01",
        title: "01 · ליבה ואזור אישי",
        summary: "אימות וארכיטקטורה.",
        href: "https://docs.google.com/document/d/1n2ZOtMSrWBrRbSlHSu-HAK8UkbUJqsNmlb9YxYbBRKg/edit",
      },
      {
        id: "ux-02",
        title: "02 · הירו",
        summary: "5 שניות ראשונות.",
        href: "https://docs.google.com/document/d/1yhsj0NyEu9VUOyfYGAiaDaduS2go-_QmWpWi_szbM6U/edit",
      },
      {
        id: "ux-03",
        title: "03 · אלמנטים",
        summary: "טפסים, ניווט, מצבי ריק.",
        href: "https://docs.google.com/document/d/1F1JQItmq9wmR0k_HZ9txsYAJ110z1PlI_ZzuPEMeziw/edit",
      },
      {
        id: "ux-04",
        title: "04 · תלת־מימד",
        summary: "WebGL בתוך זרימת UX.",
        href: "https://docs.google.com/document/d/1wrW7EJiN1r5VMc4SMX0Qw3JXFHpK3D05mU6QTpuiJ18/edit",
      },
      {
        id: "ux-05",
        title: "05 · ביצועים ואבטחה",
        summary: "סימולציה + השקה.",
        href: "https://docs.google.com/document/d/1sIV447ojqmKB4FtWPckx6dzNpSoHtJtkMktuCklswzo/edit",
      },
      {
        id: "ux-06",
        title: "06 · מסירה ו-SLA",
        summary: "לוגיקת מסירה ועסקים.",
        href: "https://docs.google.com/document/d/1w-G8wSpQ6BBfJ7OKiLLAxbCzcTAERrjZHeJIWS-dkr4/edit",
      },
      {
        id: "ux-07",
        title: "07 · ביקורת ו-AppSec",
        summary: "קוד, סייבר, Compliance.",
        href: "https://docs.google.com/document/d/1kBXAldz-vQsZtprfCwv2yE-0h8MjPadf-CZAcYOVPOQ/edit",
      },
    ],
  },
  {
    id: "motion",
    number: "12",
    title: "אנימציה",
    blurb: "ספריית תנועה — מטקסט עד חבילות נישה — 7 שלבים.",
    sourceHref:
      "https://docs.google.com/document/d/1zUTIibWpSed5ST780VEHdF72c6uLgTLRFCnLg3T2M3w/edit",
    folderHref:
      "https://drive.google.com/drive/folders/1mnIQ8UAiOvcG1lNiBJ5q1t_m44Q0W51I",
    steps: [
      {
        id: "anim-00",
        title: "00 · מפה",
        summary: "מפת 7 שלבי אנימציה.",
        href: "https://docs.google.com/document/d/1KCW5754D59pU8xY7LQaCZCF26OsR0v28NQAmxwVwcLE/edit",
      },
      {
        id: "anim-01",
        title: "01 · חשיפת טקסט",
        summary: "Premium text reveal.",
        href: "https://docs.google.com/document/d/1ZGwh6fari-Bp0V8zeLMBhnd4YXIcq9aFuWRb2fEecEw/edit",
      },
      {
        id: "anim-02",
        title: "02 · גלילה ופרלקס",
        summary: "Scroll reveal + parallax.",
        href: "https://docs.google.com/document/d/1XNsL2RWuE5EtoAaNEDwdDr7jM7z-Itvah4kb3ciMgeA/edit",
      },
      {
        id: "anim-03",
        title: "03 · אינטראקציה",
        summary: "מגנט · כרטיס 3D · סמן.",
        href: "https://docs.google.com/document/d/1nDIhpWCk2jgW5rQAN7Vi3bv88Im2Phg4va9bVmbWTW8/edit",
      },
      {
        id: "anim-04",
        title: "04 · טעינה ומעברים",
        summary: "Loader 3D + וילון.",
        href: "https://docs.google.com/document/d/1omG9kPqnHkYbqBnYl1NAOlmGw3xHWJR9DuCUho7qZBM/edit",
      },
      {
        id: "anim-05",
        title: "05 · Marquee וגלריה",
        summary: "טקסט רץ + גלריה מדורגת.",
        href: "https://docs.google.com/document/d/1_-8nkFrOO_HZY7mU3YXxqqw5TWNuQZCxGQwF_u_SFOw/edit",
      },
      {
        id: "anim-06",
        title: "06 · חבילות נישה",
        summary: "מאפיות → הייטק.",
        href: "https://docs.google.com/document/d/1RXpNIg50XD1PvEzRlyFVHpfTwoJAJkQUEmbx-QMdDeg/edit",
      },
      {
        id: "anim-07",
        title: "07 · נועם ואבישי",
        summary: "חבילות אישיות.",
        href: "https://docs.google.com/document/d/1Wiyd_v8pppKuGHZK0dIWusGNaMRViRGtFy4J_m6n4Dw/edit",
      },
    ],
  },
  {
    id: "demo",
    number: "13",
    title: "אתר דימו",
    blurb: "POC לסגירת לקוח — 5 שלבים מליבה עד WOW.",
    sourceHref:
      "https://docs.google.com/document/d/1uY2f5v5--FL8jSnwQaGaq_nOfSheoVkO9-YQq0quJhQ/edit",
    folderHref:
      "https://drive.google.com/drive/folders/1pIwPzxjT3EXnvvicT6X__CChGuvD6V9_",
    steps: [
      {
        id: "demo-00",
        title: "00 · מפה",
        summary: "מפת 5 שלבי דימו.",
        href: "https://docs.google.com/document/d/1QEReSC59ihGh2jglgIiIjmScyeeX9_zB6vvQCYOJP2M/edit",
      },
      {
        id: "demo-01",
        title: "01 · ליבה",
        summary: "ארכיטקטורת WOW · בלי Backend.",
        href: "https://docs.google.com/document/d/1vZ78RvOUfNkmgMXQO1CnqA0sgJvliQSbS-8LlwRcgFM/edit",
      },
      {
        id: "demo-02",
        title: "02 · סימולציית המרות",
        summary: "מנוע המרות ו-UX.",
        href: "https://docs.google.com/document/d/1bn62rz0fdTKMCCgupoS42AlH55ytgnbLoabk_Mp_RU0/edit",
      },
      {
        id: "demo-03",
        title: "03 · פריסה וזכויות",
        summary: "פריסה פרטית והגנת IP.",
        href: "https://docs.google.com/document/d/1b6sWyVkOFOWL-40GSsX0a--urKbFSEplslXwbZAiG6k/edit",
      },
      {
        id: "demo-04",
        title: "04 · מכתץ הסגירה",
        summary: "סגירת מכירה על הדימו.",
        href: "https://docs.google.com/document/d/1CQW3cIuYls2k-fmzRzYH9PFLGMNgyWJyvmh-hZB1-nY/edit",
      },
      {
        id: "demo-05",
        title: "05 · מבחן WOW",
        summary: "שלמות ויזואלית.",
        href: "https://docs.google.com/document/d/1W9el8p19UKeo2dFTcfScoGJ-DqF67vhW4fmmcX1Siu8/edit",
      },
    ],
  },
  {
    id: "landing",
    number: "14",
    title: "דף נחיתה",
    blurb: "המרות מ-PPC — 5 שלבים מתחקיר עד מבקר לידים.",
    sourceHref:
      "https://docs.google.com/document/d/1owZTlhlDFC2WcCddb3iPKZKJa_iS8QwZVv6g33pwLsI/edit",
    folderHref:
      "https://drive.google.com/drive/folders/1vbHEUWp-rB8MLuTvJUJdK4gKzF4qD0YW",
    steps: [
      {
        id: "land-00",
        title: "00 · מפה",
        summary: "מפת 5 שלבי נחיתה.",
        href: "https://docs.google.com/document/d/1LqYNZNBWFmbYtquX32AWldo0s3YP6YgEBdWYawtBsqQ/edit",
      },
      {
        id: "land-01",
        title: "01 · ליבה",
        summary: "פורמט דף נחיתה.",
        href: "https://docs.google.com/document/d/1ObZCMLblvv_pW6DCob_4EkbhJHghMFU6a-EfeRbs6lo/edit",
      },
      {
        id: "land-02",
        title: "02 · מנוע המרות",
        summary: "פסיכולוגיה ו-UX.",
        href: "https://docs.google.com/document/d/1cVsUBd8Dj5ohzWNCBTwgDDfRgH7mUhFQ6DejAMfn328/edit",
      },
      {
        id: "land-03",
        title: "03 · טפסים ו-Go-Live",
        summary: "הגנה, מעקבים, השקה.",
        href: "https://docs.google.com/document/d/18xG68Ur5fCfPiLqXmyvU_Qe7dRQiMjPZIfjqM6BMPME/edit",
      },
      {
        id: "land-04",
        title: "04 · מסירה וקמפיינים",
        summary: "ריטיינר אופטימיזציה.",
        href: "https://docs.google.com/document/d/1QC0VWTFJKv_oa0YsyC8Sn8586ziJNzmJZ5_CGYD90UI/edit",
      },
      {
        id: "land-05",
        title: "05 · מבקר המרות",
        summary: "אבטחת לידים.",
        href: "https://docs.google.com/document/d/1_V6P5mE9ZkCoxybYM6Pj41GqP0malSN1WfuBhyZBibY/edit",
      },
    ],
  },
  {
    id: "ecom-classic",
    number: "15",
    title: "איקומרס Tier 1",
    blurb: "חנות High-Volume — 5 שלבים מליבה עד מבקר מערכות.",
    sourceHref:
      "https://docs.google.com/document/d/1WgGCrUKaGA5N1ohYiiY2oylFYovZ5ZF4K9PcnahCHaw/edit",
    folderHref:
      "https://drive.google.com/drive/folders/1MGVw19G4-pJU52NxUy5_LFw8zkPfGoD2",
    steps: [
      {
        id: "e1-00",
        title: "00 · מפה",
        summary: "מפת 5 שלבי Tier 1.",
        href: "https://docs.google.com/document/d/11BUJTWxuxvp9zR9TksJ21xCod8Uuk5t3l4Y7XIs7clk/edit",
      },
      {
        id: "e1-01",
        title: "01 · ליבה",
        summary: "ארכיטקטורה ואבטחת מחירים.",
        href: "https://docs.google.com/document/d/1-RK065qiehi_M870dcYdQ5iwHjCaCN8IfxT6HoMKq1M/edit",
      },
      {
        id: "e1-02",
        title: "02 · חיפוש ועגלות",
        summary: "Faceted search וביצועים.",
        href: "https://docs.google.com/document/d/1HnMGMgZGgk73hpMudp9OaKXmx0MkDTHpW8sQwkT9Ucw/edit",
      },
      {
        id: "e1-03",
        title: "03 · המבצר והשקה",
        summary: "אבטחה והשקת ענק.",
        href: "https://docs.google.com/document/d/1_GUH9r8_D2ut3RJs6Qil8qDgpLDm0d46xvfsE5aj-r0/edit",
      },
      {
        id: "e1-04",
        title: "04 · מסירה",
        summary: "מסירה למערכת גדולה.",
        href: "https://docs.google.com/document/d/1SFqymLNrdX6R2aKjvtf_s0pQ-scbcJ8UlGAVY2lD7mk/edit",
      },
      {
        id: "e1-05",
        title: "05 · מבקר מערכות",
        summary: "AppSec · Logic · QA.",
        href: "https://docs.google.com/document/d/1hu_y03NG9vk1zsF3zhN2FoJPHFFRGluTgL2ddAveh80/edit",
      },
    ],
  },
  {
    id: "ecom-3d",
    number: "16",
    title: "איקומרס 3D",
    blurb: "WebGL מעל איקומרס — 5 שלבים מליבה עד רישוי.",
    sourceHref:
      "https://docs.google.com/document/d/10j8LwSJz3wQB2KHLADjw4JNQ6sneMbplqbZbGkiTzJk/edit",
    folderHref:
      "https://drive.google.com/drive/folders/1ObjsAdkY7j_ffwNHfA62SDnyjn5pjTn5",
    steps: [
      {
        id: "e3-00",
        title: "00 · מפה",
        summary: "מפת 5 שלבי Tier 2/3.",
        href: "https://docs.google.com/document/d/1fag4XgwikG_-BuykuU2YX1CXHxq8tA6iT5u0niPGpHA/edit",
      },
      {
        id: "e3-01",
        title: "01 · ליבה",
        summary: "WebGL + R3F מעל איקומרס.",
        href: "https://docs.google.com/document/d/1PzR2s5Jqz-Jo-55OdBeWWAS5nm4fG0MEmuA4R9xCe3s/edit",
      },
      {
        id: "e3-02",
        title: "02 · ביצועי WebGL",
        summary: "ביצועים קיצוניים.",
        href: "https://docs.google.com/document/d/14tShymQ8TNIfmbS53G-ltZs0SQzoikgUXMQLTp-LsiY/edit",
      },
      {
        id: "e3-03",
        title: "03 · אבטחת רכוש",
        summary: "נכסים + השקת פרימיום.",
        href: "https://docs.google.com/document/d/14dLORNOekPN7iQf8tLXaLKAS2T16ieJvra2S4V-Ajp8/edit",
      },
      {
        id: "e3-04",
        title: "04 · מסירת שואורום",
        summary: "ריטיינר פרימיום.",
        href: "https://docs.google.com/document/d/1DLc4yUehWTeDRPDJ9vFEz1fun7i7p0XC8kKY32LhVV4/edit",
      },
      {
        id: "e3-05",
        title: "05 · ביקורת ורישוי",
        summary: "WebGL · נכסים · רישוי.",
        href: "https://docs.google.com/document/d/1Sr0zpQMaY56UFwJz1hHI-zVq9fZy1IB2gDe19hoBe84/edit",
      },
    ],
  },
  {
    id: "pre-sale",
    number: "17",
    title: "סינון לפני מכירה",
    blurb: "ארבע ביקורות אכזריות לפני סגירה.",
    sourceHref:
      "https://docs.google.com/document/d/1vVkP2tSlVUlLhaktcyl814gs4aO6TqeiXWg1iNcXtGo/edit",
    folderHref:
      "https://drive.google.com/drive/folders/1dtip5d86s60n-mUds2ItHwRwIeMh5TJI",
    steps: [
      {
        id: "ps-00",
        title: "00 · מפה",
        summary: "מפת 4 שלבי סינון.",
        href: "https://docs.google.com/document/d/12pzMhYn4C_diz-86CrGO6sZ5NbBuXPvhbxrknVv66Us/edit",
      },
      {
        id: "ps-01",
        title: "01 · ביקורת כלקוח",
        summary: "עיני לקוח high-ticket.",
        href: "https://docs.google.com/document/d/1bC-FO0umY245PzoicIpMgJEYt_3clyF7mjyWJifw8bU/edit",
      },
      {
        id: "ps-02",
        title: "02 · ביקורת אבטחה",
        summary: "בדיקת אבטחת האתר.",
        href: "https://docs.google.com/document/d/1MML3AzshKvfbqWNJjv89hr0GvfQOFx77D4hkZW5Uyac/edit",
      },
      {
        id: "ps-03",
        title: "03 · ביקורת משפטית",
        summary: "כשירות חוקית.",
        href: "https://docs.google.com/document/d/1zWNAAf7Twu-8Qeo5p0nf0wTTyFnee7P0ugw0mmrlt3M/edit",
      },
      {
        id: "ps-04",
        title: "04 · ביקורת לדף נחיתה",
        summary: "סינון ייעודי לנחיתה.",
        href: "https://docs.google.com/document/d/1Bk0OyySTKW4y3nNX4L9MCkJ072tHovIU270dT73la0w/edit",
      },
    ],
  },
  {
    id: "assets",
    number: "18",
    title: "קבצים",
    blurb: "PDF, ZIP ושורש הדרייב.",
    folderHref: SITES_FOLDER_HREF,
    steps: [
      {
        id: "million-sites-book",
        title: "Million Sites Book",
        summary: "ספר PDF.",
        href: "https://drive.google.com/file/d/1xUxBhaOVTnnGwBDJn6tplPYWY1odGHOl/view",
        kind: "pdf",
      },
      {
        id: "motion-kit",
        title: "Motion Kit",
        summary: "חבילת נכסי תנועה.",
        href: "https://drive.google.com/file/d/1rrKsAcMN57zGAvZ7B7hGup3BvwY3ZFRS/view",
        kind: "zip",
      },
      {
        id: "drive-all",
        title: "כל תיקיית האתרים",
        summary: "שורש הדרייב של האקדמיה.",
        href: SITES_FOLDER_HREF,
        kind: "folder",
      },
    ],
  },
  {
    id: "formats-38",
    number: "19",
    title: "38 פורמטים מעוצבים",
    blurb: "מדריכים מעוצבים מחדש — פרומפטים מוכנים להעתקה ב-Vault.",
    folderHref:
      "https://drive.google.com/drive/folders/1om64QKfD6-hwuVZKYAomCiX-lLMYjiM7",
    steps: [
      {
        id: "studio-sites-claude-21st",
        title: "אתר בסטנדרט של סטודיו: Claude + רכיבי 21st",
        summary: "בונים עמוד שלם מרכיבי React מוכנים, אחד-אחד, במקום לבקש 'תבנה לי אתר' ולקבל משהו גנרי.",
        href: "/#p=studio-sites-claude-21st",
        kind: "doc" as const,
      },
      {
        id: "code-only-promo-video",
        title: "פרסומת אנכית שנבנית כולה בקוד",
        summary: "Claude Code כותב מנוע רינדור 2.5D בפייתון ומפיק סרטון 1080×1920 – בלי מצלמה ובלי מודל וידאו.",
        href: "/#p=code-only-promo-video",
        kind: "doc" as const,
      },
      {
        id: "claude-meta-ads-12-agents",
        title: "Claude בונה קמפיין לידים במטא – במצב מושהה",
        summary: "מחבר רשמי למנהל המודעות, הרשאות נעולות, ופרומפט של 12 'סוכנים' שבונים קמפיין שלם שרק אתם מפעילים.",
        href: "/#p=claude-meta-ads-12-agents",
        kind: "doc" as const,
      },
      {
        id: "osiris-live-globe",
        title: "אוסיריס: גלובוס חי של מצלמות, טיסות ולוויינים",
        summary: "גלובוס תלת-ממדי בדפדפן, חינמי וקוד פתוח: שידורים חיים ממצלמות ציבוריות, תנועת מטוסים, מסלולי לוויינים ואירועי טבע – במסך אחד.",
        href: "/#p=osiris-live-globe",
        kind: "doc" as const,
      },
      {
        id: "3d-websites-claude",
        title: "דף נחיתה עם עומק ותלת-ממד: בריף מסודר ל-Claude",
        summary: "איך לתת ל-Claude כיוון עיצובי אמיתי – השראה, תנועה, פונטים ואייקונים – כדי לקבל דף עם תחושת תלת-ממד.",
        href: "/#p=3d-websites-claude",
        kind: "doc" as const,
      },
      {
        id: "chatgpt-gif-maker",
        title: "גיפים ממשפט אחד ב-ChatGPT",
        summary: "תבנית של שורה אחת שמחזירה גיף בלופ תוך פחות מדקה – לסטורי, למייל ולדף מוצר.",
        href: "/#p=chatgpt-gif-maker",
        kind: "doc" as const,
      },
      {
        id: "drone-shot-from-photo",
        title: "שוט רחפן מתמונה אחת",
        summary: "מסמנים מסלול טיסה, מעלים כ-Start frame, ומריצים פרומפט תנועה חלק ויציב.",
        href: "/#p=drone-shot-from-photo",
        kind: "doc" as const,
      },
      {
        id: "comment-to-dm-zernio",
        title: "תגובה שהופכת להודעה פרטית (Comment-to-DM) עם Zernio",
        summary: "מי שמגיב מילת קוד על הפוסט מקבל תשובה פומבית מתחלפת והודעה פרטית עם כפתור – באינסטגרם ובפייסבוק.",
        href: "/#p=comment-to-dm-zernio",
        kind: "doc" as const,
      },
      {
        id: "artcraft-free-adobe-alternative",
        title: "ArtCraft: עריכת תמונות ווידאו בקוד פתוח – ש-Claude Code מפעיל",
        summary: "חבילת אפליקציות חינמיות (PhotoCraft, LightCraft, FilmCraft ועוד) עם CLI ו-MCP, כך ש-Claude עורך בשבילך.",
        href: "/#p=artcraft-free-adobe-alternative",
        kind: "doc" as const,
      },
      {
        id: "claude-subscription-finder-agent",
        title: "סוכן שבועי שמאתר מנויים וחיובים במייל",
        summary: "משימה מתוזמנת ב-Claude שסורקת את Gmail פעם בשבוע ומחזירה רשימת מנויים, חידושים וניסיונות שהפכו לתשלום.",
        href: "/#p=claude-subscription-finder-agent",
        kind: "doc" as const,
      },
      {
        id: "ai-product-lifestyle-shoot",
        title: "מתמונת מוצר אחת לסדרת צילומי לייפסטייל",
        summary: "המוצר נשאר זהה בכל פריים – רק הלוקיישן, האור והזווית מתחלפים. כולל שיטה לסדרה עקבית.",
        href: "/#p=ai-product-lifestyle-shoot",
        kind: "doc" as const,
      },
      {
        id: "hebrew-voice-clone-elevenlabs",
        title: "שיבוט הקול שלך לקריינות בעברית",
        summary: "דגימה של 1–3 דקות, Instant Voice Clone, ומודל שתומך בעברית – קריינות שנשמעת כמוך.",
        href: "/#p=hebrew-voice-clone-elevenlabs",
        kind: "doc" as const,
      },
      {
        id: "chatgpt-business-profile",
        title: "דף עסק בתוך ChatGPT – הקמה ואימות",
        summary: "שם ותיאור, אימות דומיין ברשומת TXT, טלפון, מייל וזהות – כדי ש-ChatGPT יכיר את העסק.",
        href: "/#p=chatgpt-business-profile",
        kind: "doc" as const,
      },
      {
        id: "ai-agent-team-setup",
        title: "סוכן AI אישי מאפס: התקנה, חיבורים והיכרות",
        summary: "פותחים חשבון, מחברים מייל/דרייב/יומן, ומלמדים את הבוט על העסק – עם 'צ'יף' שמנהל בוטים לפי תפקיד.",
        href: "/#p=ai-agent-team-setup",
        kind: "doc" as const,
      },
      {
        id: "gemini-skills-saved-instructions",
        title: "סקילים ב-Gemini: הוראות קבועות שמופעלות בלוכסן",
        summary: "שומרים פעם אחת את 'הקול של העסק', תשובה לליד ודוח שבועי – ומשלבים כמה סקילים בבקשה אחת.",
        href: "/#p=gemini-skills-saved-instructions",
        kind: "doc" as const,
      },
      {
        id: "adobe-tools-in-chat",
        title: "עריכת תמונות ו-PDF של Adobe מתוך הצ'אט",
        summary: "הסרת רקע, אחידות צבע, גרסאות לרשתות ואיחוד PDF – בבקשה בעברית ל-Claude או ל-Gemini, בלי לפתוח פוטושופ.",
        href: "/#p=adobe-tools-in-chat",
        kind: "doc" as const,
      },
      {
        id: "elementor-mcp-claude",
        title: "Claude בונה עמודים באלמנטור דרך MCP",
        summary: "מפעילים חיבור MCP בוורדפרס, מדביקים ל-Claude, ומבקשים דף נחיתה במילים – שנשמר כטיוטה בעורך.",
        href: "/#p=elementor-mcp-claude",
        kind: "doc" as const,
      },
      {
        id: "search-console-image-search",
        title: "כמה מבקרים הגיעו מחיפוש בתמונה (Search Console)",
        summary: "המסנן multimodal מראה כניסות מ-Lens וחיפוש בתמונה – ואיך להכין את התמונות באתר כדי להופיע שם.",
        href: "/#p=search-console-image-search",
        kind: "doc" as const,
      },
      {
        id: "google-vids-free-ai-video",
        title: "סרטוני AI בחינם עם Google Vids",
        summary: "נוסחת פרומפט בשש חלקים, תמונת מוצר שהופכת לווידאו, ופרסומת של 20–30 שניות – בחשבון גוגל רגיל.",
        href: "/#p=google-vids-free-ai-video",
        kind: "doc" as const,
      },
      {
        id: "ai-tools-stack-10",
        title: "ערכת עשרה כלי AI לעסק – ומה כל אחד פותר",
        summary: "כתיבה, תמונות, אוטומציה, בנייה, מחקר, קול ווידאו: עשרה כלים במפה אחת, עם בקשת פתיחה לכל אחד.",
        href: "/#p=ai-tools-stack-10",
        kind: "doc" as const,
      },
      {
        id: "business-prompt-bank-50",
        title: "בנק פרומפטים לעסק: שיווק, מכירות, תוכן, שירות ואסטרטגיה",
        summary: "נוסחת פרומפט אחת + חמש קטגוריות עם בקשות קצרות ומדויקות שאפשר להפעיל כבר עכשיו.",
        href: "/#p=business-prompt-bank-50",
        kind: "doc" as const,
      },
      {
        id: "ai-tools-for-business-5",
        title: "חמישה כלי AI לעסק – עם תבניות מוכנות לעבודה",
        summary: "ChatGPT, Claude, NotebookLM, Gemini ו-Make: לכל כלי שימוש אחד ברור ותבנית שאפשר להפעיל עוד היום.",
        href: "/#p=ai-tools-for-business-5",
        kind: "doc" as const,
      },
      {
        id: "claude-code-skills-50",
        title: "מדריך סקילים ל-Claude Code: התקנה וסדר עדיפויות",
        summary: "סקיל = תיקיית הוראות ש-Claude טוען לבד כשהמשימה מתאימה. ככה מתקינים, ואלה המשפחות ששוות את הזמן.",
        href: "/#p=claude-code-skills-50",
        kind: "doc" as const,
      },
      {
        id: "claude-code-codex-image-mcp",
        title: "יצירת תמונות מתוך Claude Code דרך Codex MCP",
        summary: "מחברים את Codex כשרת MCP, מתחברים פעם אחת, וכל באנר/מוקאפ נוצר ונשמר לקובץ בלי לצאת מהטרמינל.",
        href: "/#p=claude-code-codex-image-mcp",
        kind: "doc" as const,
      },
      {
        id: "gpt-image-2-business-prompts",
        title: "עשרה פרומפטים לתמונות עסקיות ב-GPT Image 2",
        summary: "צילום מוצר, מוקאפ אתר, סדרת פוסטים, סטוריבורד, החלפת זווית, מוקאפ לוגו ועוד – בפורמט מוכן למילוי.",
        href: "/#p=gpt-image-2-business-prompts",
        kind: "doc" as const,
      },
      {
        id: "remotion-videos-with-claude",
        title: "סרטונים בקוד React עם Remotion ו-Claude",
        summary: "פקודה אחת מתקינה ל-Claude את הסקילים של Remotion – ואז מתארים סרטון במילים ומקבלים MP4.",
        href: "/#p=remotion-videos-with-claude",
        kind: "doc" as const,
      },
      {
        id: "bullet-time-ai-video",
        title: "סרטון 'זמן קפוא' (Bullet Time) בשני שלבים",
        summary: "הגדרות מדויקות + פרומפט מובנה עם מפת רפרנסים, ציר זמן ונעילת טקסט על מסך הטלפון.",
        href: "/#p=bullet-time-ai-video",
        kind: "doc" as const,
      },
      {
        id: "viral-content-radar-bot",
        title: "רדאר תוכן: פוסטים מצליחים → טלגרם → גרסה בעברית",
        summary: "סורק שבועי ב-Apify, בוט טלגרם שמביא את התוצאות, טבלת ניהול, ובנייה מחדש בעברית עם תמונה בסגנון המותג.",
        href: "/#p=viral-content-radar-bot",
        kind: "doc" as const,
      },
      {
        id: "meta-pixel-9-checks",
        title: "תשע בדיקות מדידה לפני שמגדילים תקציב במטא",
        summary: "המערכת לומדת ממה שמודדים. אם המדידה שבורה – גם קמפיין טוב שורף כסף.",
        href: "/#p=meta-pixel-9-checks",
        kind: "doc" as const,
      },
      {
        id: "lead-auto-reply-summary",
        title: "מענה אוטומטי ללידים – תקציר בלבד",
        summary: "עקרונות: תשובה ראשונה תוך שניות, הודעת פתיחה ששואלת שאלה, AI שמסכם את הליד, ומעקב אוטומטי.",
        href: "/#p=lead-auto-reply-summary",
        kind: "doc" as const,
      },
      {
        id: "meta-ads-playbook",
        title: "ספר הפעלה לקמפיין במטא",
        summary: "מבנה פשוט, קהל רחב עם הצעות, תקציב שנותן ללמידה לקרות, וקריאייטיב אנכי שהוא הטירגוט החדש.",
        href: "/#p=meta-ads-playbook",
        kind: "doc" as const,
      },
      {
        id: "roas-break-even-formula",
        title: "ROAS, ROI, MER ונקודת האיזון – בנוסחה אחת לכל עסק",
        summary: "לפני שמגדילים תקציב: מחשבים Break-Even ROAS לפי שולי הרווח, ויודעים מתי ROAS של 3 הוא בעצם הפסד.",
        href: "/#p=roas-break-even-formula",
        kind: "doc" as const,
      },
      {
        id: "landing-page-3-conversion-fixes",
        title: "שלושה שינויים בדף שמגדילים פניות",
        summary: "כפתור פנייה אחד בולט, ביקורת אמיתית אחת לפני הכפתור, וסרטון של 15 שניות – עם צ'קליסט של 10 שאלות.",
        href: "/#p=landing-page-3-conversion-fixes",
        kind: "doc" as const,
      },
      {
        id: "instagram-posting-times-israel",
        title: "מתי לפרסם באינסטגרם: לוח זמנים לקהל ישראלי",
        summary: "פוסטים, סטוריז ורילים מתנהגים אחרת – לוח שבועי מוכן ושיטה לבדוק את השעות שלכם בלי כלי בתשלום.",
        href: "/#p=instagram-posting-times-israel",
        kind: "doc" as const,
      },
      {
        id: "social-4-week-content-plan",
        title: "תוכנית תוכן ל-4 שבועות: פוסטים, ריל וסטוריז",
        summary: "חמישה עמודי תוכן שמתחלפים, לוח שבועי קבוע, וכמות מומלצת לפי גודל העסק.",
        href: "/#p=social-4-week-content-plan",
        kind: "doc" as const,
      },
      {
        id: "make-first-automation",
        title: "אוטומציה ראשונה ב-Make: טופס → CRM → מייל",
        summary: "Webhook מהטופס באתר, סינון ספאם, שמירה ב-Notion ומייל אישור ללקוח + התראה אליך – בלי קוד.",
        href: "/#p=make-first-automation",
        kind: "doc" as const,
      },
      {
        id: "snapbar-instant-screenshots-mac",
        title: "SnapBar למק: צילום מסך שנכנס ישר ללוח",
        summary: "אפליקציה חינמית בקוד פתוח: כל צילום נשמר ומועתק מיד, עם ספרייה וחיפוש לפי טקסט (כולל עברית).",
        href: "/#p=snapbar-instant-screenshots-mac",
        kind: "doc" as const,
      },
      {
        id: "brand-identity-questionnaire",
        title: "שאלון אפיון מותג – לפני שפותחים קובץ עיצוב",
        summary: "קהל, ערך, ייחודיות, טון ויעדים: שאלון בחמישה פרקים שמסתיים בבריף בעמוד אחד למעצב.",
        href: "/#p=brand-identity-questionnaire",
        kind: "doc",
      },
    ],
  },
];

/** @deprecated use ACADEMY_COURSES — kept for any stray imports */
export const SITE_CATEGORIES = ACADEMY_COURSES.map((c) => ({
  id: c.id,
  number: c.number,
  title: c.title,
  blurb: c.blurb,
  items: c.steps,
}));
