export type StageQuizChoice = { letter: string; text: string };
export type StageQuizQuestion = {
  id: string;
  prompt: string;
  choices: StageQuizChoice[];
};

/** Course material hosted off-site (Drive / Docs / Slides) — never send students there. */
export function isBlockedExternalUrl(href: string): boolean {
  try {
    const u = new URL(href);
    const host = u.hostname.toLowerCase();
    return (
      host === "drive.google.com" ||
      host === "docs.google.com" ||
      host.endsWith(".googleusercontent.com")
    );
  } catch {
    return true;
  }
}

/**
 * Remove Drive/Docs/Slides URLs and "open the deck on Drive" lines from lesson body.
 * Scripts live in ScriptCards on this site.
 */
export function stripOffsiteCourseMaterial(bodyMd: string): string {
  let t = bodyMd;
  // Markdown links → keep label only if useful, drop Google material targets
  t = t.replace(
    /\[([^\]]*)\]\((https?:\/\/(?:drive|docs)\.google\.com[^)]*)\)/gi,
    "$1",
  );
  // Bare Google material URLs
  t = t.replace(/https?:\/\/(?:drive|docs)\.google\.com[^\s)\]>"']+/gi, "");
  // "המצגת של Mx: …" lines (URL already gone)
  t = t.replace(/^[ \t]*🎞[ \t]*\*\*המצגת של[^*]*\*\*[ \t]*:?[ \t]*$/gm, "");
  // Old "copy from Drive" CTAs — ScriptCard on this page owns copy
  t = t.replace(/^[ \t]*⧉\s*SCRIPT\s*·[^\n]*העתק הכל[^\n]*$/gim, "");
  // Duplicate full-text blurbs (same info as ScriptCard note)
  t = t.replace(/^[ \t]*⧉\s*הטקסט המלא[^\n]*$/gim, "");
  // Source labels that pointed off-site
  t = t.replace(/מקור:\s*Drive של אבישי/gi, "מקור: באתר");
  t = t.replace(/מקור:\s*Drive[^·\n]*/gi, "מקור: באתר");
  t = t.replace(/מקור:\s*האקדמיה\s*\/\s*Prompt Vault/gi, "מקור: באתר");
  // Empty bullets left after URL removal
  t = t.replace(/^[ \t]*[-*]\s*$/gm, "");
  // Bullets that only had a folder emoji + title + optional colon
  t = t.replace(
    /^[ \t]*[-*]\s*(?:עם\s+)?(?:📁\s*)?\*\*[^*]+\*\*\s*:?\s*$/gm,
    "",
  );
  // Trailing "עם 📁 **title**:" leftovers mid-line cleanup
  t = t.replace(/\s*·?\s*עם\s+📁\s*\*\*[^*]+\*\*\s*:?\s*$/gm, "");
  t = t.replace(/[ \t]+·[ \t]*(?=\n|$)/g, "");
  t = t.replace(/\n{3,}/g, "\n\n");
  return t.trim();
}

/** Strip quiz section from body so it isn't rendered twice as static text. */
export function stripQuizFromBody(bodyMd: string): string {
  return stripOffsiteCourseMaterial(bodyMd)
    .replace(/###\s*◎\s*חידון[\s\S]*?(?=\n---\s*$|$)/, "")
    .replace(/\n---\s*$/, "")
    .trim();
}

export function sanitizeScriptNote(note?: string): string | undefined {
  if (!note) return undefined;
  return note
    .replace(/מקור:\s*Drive של אבישי/gi, "מקור: באתר")
    .replace(/מקור:\s*Drive[^·\n]*/gi, "מקור: באתר")
    .replace(/מקור:\s*האקדמיה\s*\/\s*Prompt Vault/gi, "מקור: באתר")
    .replace(/\s·\s*$/, "")
    .trim();
}
