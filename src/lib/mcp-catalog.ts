import {
  clientActionsForServer,
  cursorInstallHttpsLink,
  promptVaultMcpUrl,
  type McpClientAction,
  type McpServerConfig,
} from "./mcp-install";

export type McpTool = {
  id: string;
  name: string;
  /** Key written into client mcp.json */
  serverName: string;
  blurb: string;
  href: string;
  tag: string;
  /** Static install config. If omitted, resolved at click time (e.g. vault origin). */
  installConfig?: McpServerConfig;
  /** Dynamic install (needs page origin). */
  installKind?: "prompt-vault";
};

/** Remote MCP connectors — Connect opens multi-client picker (Cursor / Claude / VS Code / …) */
export const MCP_TOOLS: McpTool[] = [
  {
    id: "cursor",
    name: "Prompt Vault MCP",
    serverName: "prompt-vault",
    blurb:
      "חבר את ה־Vault לכל סוכן — Cursor, Claude, VS Code, Gemini ועוד. פרומפטים ו־backgrounds בענן.",
    href: "https://modelcontextprotocol.io",
    tag: "Vault",
    installKind: "prompt-vault",
  },
  {
    id: "motionsites",
    name: "MotionSites MCP",
    serverName: "motionsites",
    blurb: "ספריית פרומפטים ועיצובים — חיפוש, remix ו־hero backgrounds.",
    href: "https://motionsites.ai/unlimited",
    tag: "Design",
    installConfig: {
      url: "https://xgdzyqfalbibzelpdpvr.supabase.co/functions/v1/mcp",
    },
  },
  {
    id: "drive",
    name: "Google Drive MCP",
    serverName: "google-drive",
    blurb: "ייבוא ארסנל הכלים מהדרייב — קריאה, חיפוש והעתקה לסוכן.",
    href: "/tools",
    tag: "Storage",
    installConfig: {
      url: "https://api.cursor.com/rest-mcp/google-drive/mcp",
    },
  },
  {
    id: "figma",
    name: "Figma MCP",
    serverName: "figma",
    blurb: "Design → code ו־code → Figma לצד הפרומפטים מה־Vault.",
    href: "https://www.figma.com/mcp-catalog/",
    tag: "Design",
    installConfig: {
      url: "https://mcp.figma.com/mcp",
    },
  },
  {
    id: "vercel",
    name: "Vercel MCP",
    serverName: "vercel",
    blurb: "דיפלוי, לוגים ופרויקטים — אחרי שבנית מהפרומפט.",
    href: "https://vercel.com/docs/mcp",
    tag: "Deploy",
    installConfig: {
      url: "https://mcp.vercel.com",
    },
  },
  {
    id: "supabase",
    name: "Supabase",
    serverName: "supabase",
    blurb: "ה־Vault כבר רץ על Supabase — שמירת פרומפטים, מדיה ו־HTML.",
    href: "https://supabase.com/docs/guides/getting-started/mcp",
    tag: "Backend",
    installConfig: {
      url: "https://mcp.supabase.com/mcp",
    },
  },
  {
    id: "runway",
    name: "Runway / video AI",
    serverName: "runway",
    blurb: "חיבור לכלי וידאו גנרטיביים לתצוגות מושן של האתרים.",
    href: "https://runwayml.com",
    tag: "Video",
    installConfig: {
      url: "https://mcp.runwayml.com/mcp",
    },
  },
  {
    id: "fal",
    name: "fal.ai",
    serverName: "fal",
    blurb: "מודלי תמונה ווידאו ל־hero / assets מתוך הפרומפט.",
    href: "https://fal.ai",
    tag: "Media",
    installConfig: {
      url: "https://mcp.fal.ai/mcp-relay",
    },
  },
];

export function resolveInstallConfig(
  tool: McpTool,
  origin?: string,
): McpServerConfig | null {
  if (tool.installKind === "prompt-vault") {
    return { url: promptVaultMcpUrl(origin) };
  }
  return tool.installConfig ?? null;
}

/** @deprecated Prefer clientActionsForTool — kept for simple Cursor-only links */
export function installLinkForTool(tool: McpTool, origin?: string): string | null {
  const config = resolveInstallConfig(tool, origin);
  if (!config) return null;
  return cursorInstallHttpsLink(tool.serverName, config);
}

export function clientActionsForTool(
  tool: McpTool,
  origin?: string,
): McpClientAction[] {
  const config = resolveInstallConfig(tool, origin);
  if (!config) return [];
  return clientActionsForServer(tool.serverName, tool.name, config);
}

export type { McpClientAction };
