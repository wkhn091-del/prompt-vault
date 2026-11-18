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
    id: "prompt-vault",
    name: "Prompt Vault MCP",
    serverName: "prompt-vault",
    blurb: "Your vault — prompts, media, HTML.",
    href: "https://modelcontextprotocol.io",
    tag: "Vault",
    installKind: "prompt-vault",
  },
  {
    id: "motionsites",
    name: "MotionSites MCP",
    serverName: "motionsites",
    blurb: "Design prompts + animated backgrounds.",
    href: "https://motionsites.ai/unlimited",
    tag: "Design",
    installConfig: {
      url: "https://xgdzyqfalbibzelpdpvr.supabase.co/functions/v1/mcp",
    },
  },
  {
    id: "figma",
    name: "Figma MCP",
    serverName: "figma",
    blurb: "Design → code.",
    href: "https://www.figma.com/mcp-catalog/",
    tag: "Design",
    installConfig: { url: "https://mcp.figma.com/mcp" },
  },
  {
    id: "canva",
    name: "Canva MCP",
    serverName: "canva",
    blurb: "Designs & brand kits.",
    href: "https://www.canva.com",
    tag: "Design",
    installConfig: { url: "https://mcp.canva.com/mcp" },
  },
  {
    id: "vercel",
    name: "Vercel MCP",
    serverName: "vercel",
    blurb: "Deploy, logs, projects.",
    href: "https://vercel.com/docs/mcp",
    tag: "Deploy",
    installConfig: { url: "https://mcp.vercel.com" },
  },
  {
    id: "cloudflare",
    name: "Cloudflare MCP",
    serverName: "cloudflare",
    blurb: "Workers, DNS, R2, docs.",
    href: "https://developers.cloudflare.com/agents/model-context-protocol/cloudflare/servers-for-cloudflare/",
    tag: "Deploy",
    installConfig: { url: "https://mcp.cloudflare.com/mcp" },
  },
  {
    id: "supabase",
    name: "Supabase MCP",
    serverName: "supabase",
    blurb: "Database, auth, storage.",
    href: "https://supabase.com/docs/guides/getting-started/mcp",
    tag: "Backend",
    installConfig: { url: "https://mcp.supabase.com/mcp" },
  },
  {
    id: "github",
    name: "GitHub MCP",
    serverName: "github",
    blurb: "Repos, PRs, issues.",
    href: "https://github.com/github/github-mcp-server",
    tag: "Code",
    installConfig: { url: "https://api.githubcopilot.com/mcp/" },
  },
  {
    id: "gitlab",
    name: "GitLab MCP",
    serverName: "gitlab",
    blurb: "Repos & pipelines.",
    href: "https://docs.gitlab.com",
    tag: "Code",
    installConfig: { url: "https://gitlab.com/api/v4/mcp" },
  },
  {
    id: "linear",
    name: "Linear MCP",
    serverName: "linear",
    blurb: "Issues & projects.",
    href: "https://linear.app/docs/mcp",
    tag: "PM",
    installConfig: { url: "https://mcp.linear.app/mcp" },
  },
  {
    id: "notion",
    name: "Notion MCP",
    serverName: "notion",
    blurb: "Pages & databases.",
    href: "https://developers.notion.com/guides/mcp/get-started-with-mcp",
    tag: "Docs",
    installConfig: { url: "https://mcp.notion.com/mcp" },
  },
  {
    id: "atlassian",
    name: "Atlassian MCP",
    serverName: "atlassian",
    blurb: "Jira + Confluence.",
    href: "https://www.atlassian.com",
    tag: "PM",
    installConfig: { url: "https://mcp.atlassian.com/v2/mcp" },
  },
  {
    id: "asana",
    name: "Asana MCP",
    serverName: "asana",
    blurb: "Tasks & projects.",
    href: "https://asana.com",
    tag: "PM",
    installConfig: { url: "https://mcp.asana.com/v2/mcp" },
  },
  {
    id: "clickup",
    name: "ClickUp MCP",
    serverName: "clickup",
    blurb: "Tasks & docs.",
    href: "https://clickup.com",
    tag: "PM",
    installConfig: { url: "https://mcp.clickup.com/mcp" },
  },
  {
    id: "stripe",
    name: "Stripe MCP",
    serverName: "stripe",
    blurb: "Payments & docs.",
    href: "https://docs.stripe.com/mcp",
    tag: "Payments",
    installConfig: { url: "https://mcp.stripe.com" },
  },
  {
    id: "hubspot",
    name: "HubSpot MCP",
    serverName: "hubspot",
    blurb: "CRM & marketing.",
    href: "https://www.hubspot.com",
    tag: "CRM",
    installConfig: { url: "https://mcp.hubspot.com" },
  },
  {
    id: "intercom",
    name: "Intercom MCP",
    serverName: "intercom",
    blurb: "Support inbox.",
    href: "https://www.intercom.com",
    tag: "Support",
    installConfig: { url: "https://mcp.intercom.com/mcp" },
  },
  {
    id: "sentry",
    name: "Sentry MCP",
    serverName: "sentry",
    blurb: "Errors & performance.",
    href: "https://docs.sentry.io",
    tag: "Observability",
    installConfig: { url: "https://mcp.sentry.dev/mcp" },
  },
  {
    id: "drive",
    name: "Google Drive MCP",
    serverName: "google-drive",
    blurb: "Files from Drive.",
    href: "/tools",
    tag: "Storage",
    installConfig: {
      url: "https://api.cursor.com/rest-mcp/google-drive/mcp",
    },
  },
  {
    id: "gmail",
    name: "Gmail MCP",
    serverName: "gmail",
    blurb: "Read & send mail.",
    href: "https://developers.google.com",
    tag: "Google",
    installConfig: { url: "https://gmailmcp.googleapis.com/mcp/v1" },
  },
  {
    id: "gcal",
    name: "Google Calendar MCP",
    serverName: "google-calendar",
    blurb: "Events & schedule.",
    href: "https://developers.google.com",
    tag: "Google",
    installConfig: { url: "https://calendarmcp.googleapis.com/mcp/v1" },
  },
  {
    id: "gsheets",
    name: "Google Sheets MCP",
    serverName: "google-sheets",
    blurb: "Spreadsheets.",
    href: "https://developers.google.com",
    tag: "Google",
    installConfig: { url: "https://sheetsmcp.googleapis.com/mcp/v1" },
  },
  {
    id: "gdocs",
    name: "Google Docs MCP",
    serverName: "google-docs",
    blurb: "Documents.",
    href: "https://developers.google.com",
    tag: "Google",
    installConfig: { url: "https://docsmcp.googleapis.com/mcp/v1" },
  },
  {
    id: "box",
    name: "Box MCP",
    serverName: "box",
    blurb: "Enterprise files.",
    href: "https://www.box.com",
    tag: "Storage",
    installConfig: { url: "https://mcp.box.com" },
  },
  {
    id: "airtable",
    name: "Airtable MCP",
    serverName: "airtable",
    blurb: "Bases & records.",
    href: "https://www.airtable.com",
    tag: "Data",
    installConfig: { url: "https://mcp.airtable.com/mcp" },
  },
  {
    id: "huggingface",
    name: "Hugging Face MCP",
    serverName: "huggingface",
    blurb: "Models & spaces.",
    href: "https://huggingface.co",
    tag: "AI",
    installConfig: { url: "https://huggingface.co/mcp" },
  },
  {
    id: "fal",
    name: "fal.ai MCP",
    serverName: "fal",
    blurb: "Image & video models.",
    href: "https://fal.ai",
    tag: "Media",
    installConfig: { url: "https://mcp.fal.ai/mcp-relay" },
  },
  {
    id: "runway",
    name: "Runway MCP",
    serverName: "runway",
    blurb: "Generative video.",
    href: "https://runwayml.com",
    tag: "Video",
    installConfig: { url: "https://mcp.runwayml.com/mcp" },
  },
  {
    id: "exa",
    name: "Exa MCP",
    serverName: "exa",
    blurb: "Web search for agents.",
    href: "https://exa.ai",
    tag: "Search",
    installConfig: { url: "https://mcp.exa.ai/mcp" },
  },
  {
    id: "deepwiki",
    name: "DeepWiki MCP",
    serverName: "deepwiki",
    blurb: "Repo wikis.",
    href: "https://deepwiki.com",
    tag: "Docs",
    installConfig: { url: "https://mcp.deepwiki.com/mcp" },
  },
  {
    id: "cf-browser",
    name: "Cloudflare Browser",
    serverName: "cloudflare-browser",
    blurb: "Fetch pages & screenshots.",
    href: "https://developers.cloudflare.com/agents/model-context-protocol/cloudflare/servers-for-cloudflare/",
    tag: "Browser",
    installConfig: { url: "https://browser.mcp.cloudflare.com/mcp" },
  },
  {
    id: "cf-docs",
    name: "Cloudflare Docs",
    serverName: "cloudflare-docs",
    blurb: "CF documentation search.",
    href: "https://developers.cloudflare.com",
    tag: "Docs",
    installConfig: { url: "https://docs.mcp.cloudflare.com/mcp" },
  },
  {
    id: "hostinger",
    name: "Hostinger MCP",
    serverName: "hostinger",
    blurb: "Hosting control.",
    href: "https://www.hostinger.com",
    tag: "Hosting",
    installConfig: { url: "https://mcp.hostinger.com" },
  },
  {
    id: "buffer",
    name: "Buffer MCP",
    serverName: "buffer",
    blurb: "Social scheduling.",
    href: "https://buffer.com",
    tag: "Social",
    installConfig: { url: "https://mcp.buffer.com/mcp" },
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
