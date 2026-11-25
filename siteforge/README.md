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

## Auth / SSO עם Prompt Vault

אותו פרויקט Supabase כמו Vault (`NEXT_PUBLIC_SUPABASE_URL` + `ANON_KEY`).

| משתנה | תפקיד |
|--------|--------|
| `NEXT_PUBLIC_SUPABASE_*` | התחברות Google על האקדמיה |
| `NEXT_PUBLIC_VAULT_URL` | קישור ללוגין Vault (שם+טלפון) ואז חזרה |
| `NEXT_PUBLIC_ADMIN_EMAILS` | `wkhn091@gmail.com` — הכל פתוח בלי נעילה |

ב־Supabase → Redirect URLs הוסיפו גם  
`https://YOUR_ACADEMY/auth/callback` ו־`http://localhost:3001/auth/callback`.

## מבנה

| נתיב | תפקיד |
|------|--------|
| `/` | Hero + סטטיסטיקות + מסלולים |
| `/learn` | מפת 100 שלבים לפי tracks |
| `/learn/Sxxx` | שלב מלא מהספר |

תוכן נטען בזמן build/runtime מ־`academy-import/siteforge-book` (שלב אחד מעל תיקיית האפליקציה).
