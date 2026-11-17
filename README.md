# Prompt Vault

MotionSites-style prompt showcase with **hidden prompt text**, one-click copy, and **Supabase** cloud storage.

## Setup

1. Create a free [Supabase](https://supabase.com) project.
2. Open **SQL Editor** and run [`supabase/schema.sql`](./supabase/schema.sql) (creates `prompts` + public `previews` bucket).
3. Copy API keys into `.env.local`:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key
```

Keys live under **Project Settings → API**.

4. Install & run:

```bash
npm install
npm run seed   # mirrors Stride .mp4 into Supabase Storage
npm run dev
```

## Security / UX

- Raw `prompt_text` is **never rendered** in the UI (cards or modal).
- Copy buttons write it to the clipboard and toast **"Prompt copied!"**.
- No public edit/delete controls.

## Deploy (Vercel)

Add the same three env vars in the Vercel project settings, then deploy.
