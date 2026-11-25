# SiteForge

אתר לימוד נפרד מ־Prompt Vault — אותו DNA ויזואלי (coral / dark heat), תוכן מהספר ב־`../academy-import/siteforge-book`.

## הרצה מקומית

```bash
cd siteforge
npm run dev -- -p 3001
```

פתחו http://localhost:3001

## Deploy (חשוב)

רק על חשבון **Vercel 091** (`WKHN091-DEL` / wkhn091).  
**לא** על `wkhn092-5722` / Avishi-iski.

Root Directory בפרויקט Vercel: `siteforge`

## מבנה

| נתיב | תפקיד |
|------|--------|
| `/` | Hero + סטטיסטיקות + מסלולים |
| `/learn` | מפת 100 שלבים לפי tracks |
| `/learn/Sxxx` | שלב מלא מהספר |

תוכן נטען בזמן build/runtime מ־`academy-import/siteforge-book` (שלב אחד מעל תיקיית האפליקציה).
