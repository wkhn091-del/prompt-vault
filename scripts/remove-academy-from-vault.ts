/**
 * Remove the 38 format-guide prompts from Vault (Sites /).
 * They stay in Academy only (Drive-linked course + /public/academy covers).
 *
 *   npx tsx --env-file=.env.local scripts/remove-academy-from-vault.ts
 */
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const ROOT = path.resolve(__dirname, "..");
const entriesPath = path.join(ROOT, ".tmp-academy-import", "entries.json");

function env(name: string): string {
  const v = process.env[name]?.trim() ?? "";
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

async function main() {
  const data = JSON.parse(fs.readFileSync(entriesPath, "utf8")) as {
    entries: { slug: string }[];
  };
  const slugs = data.entries.map((e) => e.slug);
  if (slugs.length !== 38) {
    throw new Error(`Expected 38 slugs, got ${slugs.length}`);
  }

  const supabase = createClient(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
      env("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { data: existing, error: selErr } = await supabase
    .from("prompts")
    .select("id, slug")
    .in("slug", slugs);

  if (selErr) throw selErr;
  console.log(`Found ${existing?.length ?? 0} vault rows to remove`);

  const { error: delErr, count } = await supabase
    .from("prompts")
    .delete({ count: "exact" })
    .in("slug", slugs);

  if (delErr) throw delErr;
  console.log(`Deleted ${count ?? existing?.length ?? 0} prompts from Vault`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
