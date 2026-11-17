/**
 * Poll until preview_html exists, then re-run full Blendy live_preview ingest.
 *   npx tsx --env-file=.env.local scripts/wait-migrate-and-upgrade-blendy.ts
 */

import { createClient } from "@supabase/supabase-js";
import { spawn } from "child_process";

async function ready(): Promise<boolean> {
  const s = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { error } = await s
    .from("prompts")
    .select("preview_html, backdrop_color")
    .limit(1);
  return !error;
}

async function main() {
  for (let i = 0; i < 120; i++) {
    if (await ready()) {
      console.log("Columns ready — upgrading Blendy to live_preview…");
      const child = spawn(
        "npx",
        ["tsx", "--env-file=.env.local", "scripts/ingest-blendy.ts"],
        { stdio: "inherit", shell: true },
      );
      await new Promise<void>((resolve, reject) => {
        child.on("exit", (code) =>
          code === 0 ? resolve() : reject(new Error(`ingest exit ${code}`)),
        );
      });
      return;
    }
    if (i % 6 === 0) {
      console.log(
        `[${new Date().toISOString()}] waiting for migrate-live-preview.sql…`,
      );
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
  console.error("Timed out waiting for schema migration (10 min).");
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
