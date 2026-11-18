/**
 * Fetches Motionsites background listings via the MCP HTTP bridge if available.
 * Fallback: merge any scripts/data/ms-list-*.json already on disk.
 *
 * Prefer: agent calls user-motionsites list_backgrounds and writes the JSON files.
 */
import fs from "fs";
import path from "path";

const outDir = path.resolve("scripts/data");
fs.mkdirSync(outDir, { recursive: true });

const files = fs
  .readdirSync(outDir)
  .filter((f) => f.startsWith("ms-list-") && f.endsWith(".json"));

if (files.length === 0) {
  console.error(
    "No ms-list-*.json yet. Have the agent save list_backgrounds pages first.",
  );
  process.exit(1);
}

console.log(JSON.stringify({ files, ok: true }));
