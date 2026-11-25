import catalog from "./script-catalog.json";

export const PROMPT_VAULT_ORIGIN = "https://prompt-vault-tan.vercel.app";

export type ScriptMeta = {
  title: string;
  summary: string;
  href: string;
  courseId?: string;
  courseTitle?: string;
};

const SCRIPT_CATALOG = catalog as Record<string, ScriptMeta>;

export function getScriptMeta(scriptId: string): ScriptMeta | null {
  return SCRIPT_CATALOG[scriptId] ?? null;
}

/** Open Academy on Prompt Vault, pre-filtered to this script id. */
export function vaultAcademyUrl(scriptId: string): string {
  const q = encodeURIComponent(scriptId);
  return `${PROMPT_VAULT_ORIGIN}/websites?q=${q}&step=${q}`;
}

/** Direct Drive / Doc link for the script when known. */
export function scriptSourceUrl(scriptId: string): string | null {
  return getScriptMeta(scriptId)?.href ?? null;
}

export function isScriptId(text: string): boolean {
  const t = text.trim().replace(/^`|`$/g, "");
  return (
    /^(acd-|m79-|format-|make-|proj-|3d-|roas-|skill-)/i.test(t) ||
    Boolean(SCRIPT_CATALOG[t])
  );
}

export function normalizeScriptId(text: string): string {
  return text.trim().replace(/^`|`$/g, "");
}
