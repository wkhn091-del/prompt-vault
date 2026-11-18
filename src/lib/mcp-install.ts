/** Multi-client MCP install — Claude, Cursor, ChatGPT, Gemini, Windsurf, JetBrains, … */

export type McpServerConfig = {
  url?: string;
  type?: "http" | "sse";
  command?: string;
  args?: string[];
  headers?: Record<string, string>;
  env?: Record<string, string>;
  /** Windsurf remote key */
  serverUrl?: string;
};

export type McpClientId =
  | "cursor"
  | "cursor-deeplink"
  | "claude"
  | "claude-desktop"
  | "claude-code"
  | "chatgpt"
  | "codex"
  | "vscode"
  | "copilot-studio"
  | "gemini"
  | "antigravity"
  | "windsurf"
  | "jetbrains"
  | "zed"
  | "opencode"
  | "cline"
  | "roo"
  | "continue"
  | "goose"
  | "json"
  | "json-windsurf"
  | "json-claude-desktop"
  | "url";

export type McpClientGroup = "cloud" | "ide" | "cli" | "copy";

export type McpClientAction = {
  id: McpClientId;
  label: string;
  blurb: string;
  group: McpClientGroup;
  href?: string;
  copyText?: string;
  kind: "link" | "copy";
};

export function encodeMcpConfig(config: McpServerConfig): string {
  const json = JSON.stringify(config);
  if (typeof btoa === "function") {
    return btoa(json);
  }
  return Buffer.from(json, "utf8").toString("base64");
}

export function cursorInstallHttpsLink(
  name: string,
  config: McpServerConfig,
): string {
  const encoded = encodeURIComponent(encodeMcpConfig(config));
  return `https://cursor.com/install-mcp?name=${encodeURIComponent(name)}&config=${encoded}`;
}

export function cursorInstallDeeplink(
  name: string,
  config: McpServerConfig,
): string {
  const encoded = encodeURIComponent(encodeMcpConfig(config));
  return `cursor://anysphere.cursor-deeplink/mcp/install?name=${encodeURIComponent(name)}&config=${encoded}`;
}

export function claudeConnectorLink(name: string, url: string): string {
  return `https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=${encodeURIComponent(name)}&connectorUrl=${encodeURIComponent(url)}`;
}

export function vscodeInstallLink(name: string, url: string): string {
  const config = JSON.stringify({ type: "http", url });
  return `https://vscode.dev/redirect/mcp/install?name=${encodeURIComponent(name)}&config=${encodeURIComponent(config)}`;
}

export function mcpJsonSnippet(
  serverName: string,
  config: McpServerConfig,
): string {
  return JSON.stringify({ mcpServers: { [serverName]: config } }, null, 2);
}

export function windsurfJsonSnippet(serverName: string, url: string): string {
  return JSON.stringify(
    { mcpServers: { [serverName]: { serverUrl: url } } },
    null,
    2,
  );
}

/** Claude Desktop remote HTTP via mcp-remote proxy */
export function claudeDesktopJsonSnippet(
  serverName: string,
  url: string,
): string {
  return JSON.stringify(
    {
      mcpServers: {
        [serverName]: {
          command: "npx",
          args: ["-y", "mcp-remote@latest", url],
        },
      },
    },
    null,
    2,
  );
}

export function geminiCliCommand(serverName: string, url: string): string {
  return `gemini mcp add --transport http -s user ${serverName} ${url}`;
}

export function claudeCodeCommand(serverName: string, url: string): string {
  return `claude mcp add --transport http ${serverName} ${url}`;
}

export function codexCliCommand(serverName: string, url: string): string {
  return `codex mcp add ${serverName} --url ${url}`;
}

export function chatgptHelpUrl(): string {
  return "https://chatgpt.com/#settings";
}

export function chatgptDocsUrl(): string {
  return "https://platform.openai.com/docs/guides/tools-connectors-mcp";
}

export function promptVaultMcpUrl(origin?: string): string {
  const base =
    origin?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://prompt-vault-tan.vercel.app";
  return `${base}/api/mcp`;
}

const GROUP_ORDER: McpClientGroup[] = ["cloud", "ide", "cli", "copy"];

export function sortActionsByGroup(
  actions: McpClientAction[],
): McpClientAction[] {
  return [...actions].sort(
    (a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group),
  );
}

export const MCP_GROUP_LABELS: Record<McpClientGroup, string> = {
  cloud: "Cloud AI",
  ide: "IDE / editors",
  cli: "CLI agents",
  copy: "Copy config",
};

/** One-click / copy actions for every major AI client. */
export function clientActionsForServer(
  serverName: string,
  displayName: string,
  config: McpServerConfig,
): McpClientAction[] {
  const url = config.url?.trim();
  const actions: McpClientAction[] = [];

  if (url) {
    actions.push(
      {
        id: "claude",
        label: "Claude.ai",
        blurb: "Custom connector on claude.ai (Pro / Max / Team)",
        group: "cloud",
        kind: "link",
        href: claudeConnectorLink(displayName, url),
      },
      {
        id: "chatgpt",
        label: "ChatGPT",
        blurb: "Settings → Apps & Connectors → Developer mode → paste URL",
        group: "cloud",
        kind: "link",
        href: chatgptHelpUrl(),
      },
      {
        id: "cursor",
        label: "Cursor (web)",
        blurb: "One-click install into Cursor Agent",
        group: "ide",
        kind: "link",
        href: cursorInstallHttpsLink(serverName, { url }),
      },
      {
        id: "cursor-deeplink",
        label: "Cursor (app)",
        blurb: "Open Cursor desktop install prompt",
        group: "ide",
        kind: "link",
        href: cursorInstallDeeplink(serverName, { url }),
      },
      {
        id: "vscode",
        label: "VS Code / Copilot",
        blurb: "Install remote HTTP MCP (Agent mode)",
        group: "ide",
        kind: "link",
        href: vscodeInstallLink(serverName, url),
      },
      {
        id: "windsurf",
        label: "Windsurf",
        blurb: "Copy Cascade mcp_config.json (serverUrl)",
        group: "ide",
        kind: "copy",
        copyText: windsurfJsonSnippet(serverName, url),
      },
      {
        id: "jetbrains",
        label: "JetBrains AI",
        blurb: "Copy for Settings → AI Assistant → MCP",
        group: "ide",
        kind: "copy",
        copyText: mcpJsonSnippet(serverName, { url }),
      },
      {
        id: "zed",
        label: "Zed",
        blurb: "Copy for Zed Assistant MCP settings",
        group: "ide",
        kind: "copy",
        copyText: mcpJsonSnippet(serverName, { url }),
      },
      {
        id: "antigravity",
        label: "Antigravity",
        blurb: "Copy mcp.json for Google Antigravity IDE / CLI",
        group: "ide",
        kind: "copy",
        copyText: mcpJsonSnippet(serverName, { url }),
      },
      {
        id: "cline",
        label: "Cline",
        blurb: "Paste into Cline MCP settings (VS Code)",
        group: "ide",
        kind: "copy",
        copyText: mcpJsonSnippet(serverName, { url }),
      },
      {
        id: "roo",
        label: "Roo Code",
        blurb: "Paste into Roo Code MCP panel",
        group: "ide",
        kind: "copy",
        copyText: mcpJsonSnippet(serverName, { url }),
      },
      {
        id: "continue",
        label: "Continue.dev",
        blurb: "Paste into Continue MCP / config.yaml servers",
        group: "ide",
        kind: "copy",
        copyText: mcpJsonSnippet(serverName, { url }),
      },
      {
        id: "claude-code",
        label: "Claude Code",
        blurb: "CLI: add remote HTTP MCP",
        group: "cli",
        kind: "copy",
        copyText: claudeCodeCommand(serverName, url),
      },
      {
        id: "codex",
        label: "Codex CLI",
        blurb: "OpenAI Codex terminal agent",
        group: "cli",
        kind: "copy",
        copyText: codexCliCommand(serverName, url),
      },
      {
        id: "gemini",
        label: "Gemini CLI",
        blurb: "Google Gemini CLI remote MCP",
        group: "cli",
        kind: "copy",
        copyText: geminiCliCommand(serverName, url),
      },
      {
        id: "opencode",
        label: "OpenCode",
        blurb: "Copy mcp.json for OpenCode agent",
        group: "cli",
        kind: "copy",
        copyText: mcpJsonSnippet(serverName, { url }),
      },
      {
        id: "goose",
        label: "Goose",
        blurb: "Block Goose — paste URL / mcpServers JSON",
        group: "cli",
        kind: "copy",
        copyText: mcpJsonSnippet(serverName, { url }),
      },
      {
        id: "claude-desktop",
        label: "Claude Desktop",
        blurb: "Copy claude_desktop_config.json (mcp-remote)",
        group: "copy",
        kind: "copy",
        copyText: claudeDesktopJsonSnippet(serverName, url),
      },
      {
        id: "json-windsurf",
        label: "Windsurf JSON",
        blurb: "~/.codeium/windsurf/mcp_config.json",
        group: "copy",
        kind: "copy",
        copyText: windsurfJsonSnippet(serverName, url),
      },
      {
        id: "url",
        label: "Copy MCP URL",
        blurb: "Raw Streamable HTTP — any client",
        group: "copy",
        kind: "copy",
        copyText: url,
      },
      {
        id: "copilot-studio",
        label: "ChatGPT docs",
        blurb: "Official MCP connectors guide",
        group: "cloud",
        kind: "link",
        href: chatgptDocsUrl(),
      },
    );
  } else {
    actions.push({
      id: "cursor",
      label: "Cursor",
      blurb: "One-click install into Cursor",
      group: "ide",
      kind: "link",
      href: cursorInstallHttpsLink(serverName, config),
    });
  }

  actions.push({
    id: "json",
    label: "Copy mcp.json",
    blurb: "Universal paste — Cursor, Windsurf, Cline, OpenCode…",
    group: "copy",
    kind: "copy",
    copyText: mcpJsonSnippet(serverName, config),
  });

  return sortActionsByGroup(actions);
}
