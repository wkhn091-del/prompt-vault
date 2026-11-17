/** Multi-client MCP install helpers — Cursor, Claude, VS Code, Gemini, ChatGPT, etc. */

export type McpServerConfig = {
  url?: string;
  type?: "http" | "sse";
  command?: string;
  args?: string[];
  headers?: Record<string, string>;
  env?: Record<string, string>;
};

export type McpClientId =
  | "cursor"
  | "claude"
  | "vscode"
  | "chatgpt"
  | "gemini"
  | "claude-code"
  | "json"
  | "url";

export type McpClientAction = {
  id: McpClientId;
  label: string;
  blurb: string;
  /** Open in new tab / deeplink */
  href?: string;
  /** Copy to clipboard instead of navigating */
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

/** Claude.ai custom connector (cloud — needs public HTTPS MCP URL). */
export function claudeConnectorLink(name: string, url: string): string {
  return `https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=${encodeURIComponent(name)}&connectorUrl=${encodeURIComponent(url)}`;
}

/** VS Code / Copilot HTTP MCP install (web handoff → app). */
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

export function geminiCliCommand(serverName: string, url: string): string {
  return `gemini mcp add --transport http -s user ${serverName} ${url}`;
}

export function claudeCodeCommand(serverName: string, url: string): string {
  return `claude mcp add --transport http ${serverName} ${url}`;
}

export function chatgptHelpUrl(): string {
  return "https://platform.openai.com/docs/guides/tools-connectors-mcp";
}

export function promptVaultMcpUrl(origin?: string): string {
  const base =
    origin?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://prompt-vault-tan.vercel.app";
  return `${base}/api/mcp`;
}

/** Build one-click / copy actions for every major AI client. */
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
        id: "cursor",
        label: "Cursor",
        blurb: "One-click install into Cursor Agent",
        kind: "link",
        href: cursorInstallHttpsLink(serverName, { url }),
      },
      {
        id: "claude",
        label: "Claude",
        blurb: "Add as custom connector on claude.ai (cloud)",
        kind: "link",
        href: claudeConnectorLink(displayName, url),
      },
      {
        id: "vscode",
        label: "VS Code / Copilot",
        blurb: "Install remote HTTP MCP in VS Code",
        kind: "link",
        href: vscodeInstallLink(serverName, url),
      },
      {
        id: "chatgpt",
        label: "ChatGPT",
        blurb: "Open docs — paste the MCP URL in custom connectors",
        kind: "link",
        href: chatgptHelpUrl(),
      },
      {
        id: "gemini",
        label: "Gemini CLI",
        blurb: "Copy CLI command to add remote MCP",
        kind: "copy",
        copyText: geminiCliCommand(serverName, url),
      },
      {
        id: "claude-code",
        label: "Claude Code",
        blurb: "Copy CLI command for Claude Code",
        kind: "copy",
        copyText: claudeCodeCommand(serverName, url),
      },
      {
        id: "url",
        label: "Copy URL",
        blurb: "Raw Streamable HTTP endpoint — any MCP client",
        kind: "copy",
        copyText: url,
      },
    );
  } else {
    // stdio / command-based — Cursor + JSON paste
    actions.push({
      id: "cursor",
      label: "Cursor",
      blurb: "One-click install into Cursor",
      kind: "link",
      href: cursorInstallHttpsLink(serverName, config),
    });
  }

  actions.push({
    id: "json",
    label: "Copy mcp.json",
    blurb: "Paste into Cursor, Windsurf, OpenCode, Antigravity…",
    kind: "copy",
    copyText: mcpJsonSnippet(serverName, config),
  });

  return actions;
}
