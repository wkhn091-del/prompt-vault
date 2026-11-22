"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Copy,
  Plug,
  Radio,
  X,
} from "lucide-react";
import { getSavedEmail } from "@/lib/auth-local";
import {
  clientActionsForTool,
  MCP_TOOLS,
  type McpClientAction,
  type McpTool,
} from "@/lib/mcp-catalog";
import {
  MCP_GROUP_LABELS,
  type McpClientGroup,
  type McpClientId,
} from "@/lib/mcp-install";
import { ModeSwitcher } from "./ModeSwitcher";
import { SiteHeader } from "./SiteHeader";

const GROUP_ORDER: McpClientGroup[] = ["cloud", "ide", "cli", "copy"];
const CONNECTED_KEY = "pv_mcp_connected_v3";

function readConnectedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(CONNECTED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function writeConnectedIds(ids: Set<string>) {
  try {
    localStorage.setItem(CONNECTED_KEY, JSON.stringify([...ids]));
  } catch {
    /* ignore */
  }
}

const AI_CLIENTS: {
  id: McpClientId;
  label: string;
  tone: string;
}[] = [
  { id: "claude", label: "Claude", tone: "from-[#d4a574] to-[#c4894a]" },
  { id: "gemini", label: "Gemini", tone: "from-[#6ea8fe] to-[#4285f4]" },
  { id: "chatgpt", label: "ChatGPT", tone: "from-[#74e0a8] to-[#10a37f]" },
  { id: "grok", label: "Grok", tone: "from-[#e5e5e5] to-[#737373]" },
  { id: "cursor", label: "Cursor", tone: "from-[#a78bfa] to-[#7c3aed]" },
  { id: "vscode", label: "VS Code", tone: "from-[#6cb6ff] to-[#0078d4]" },
  { id: "claude-code", label: "Claude Code", tone: "from-[#e8b98a] to-[#b87333]" },
  { id: "codex", label: "Codex", tone: "from-[#9ae6b4] to-[#38a169]" },
  { id: "windsurf", label: "Windsurf", tone: "from-[#7dd3fc] to-[#0ea5e9]" },
  { id: "jetbrains", label: "JetBrains", tone: "from-[#f9a8d4] to-[#db2777]" },
  { id: "cline", label: "Cline", tone: "from-[#fcd34d] to-[#d97706]" },
  { id: "zed", label: "Zed", tone: "from-[#c4b5fd] to-[#8b5cf6]" },
  { id: "opencode", label: "OpenCode", tone: "from-[#94a3b8] to-[#64748b]" },
  { id: "continue", label: "Continue", tone: "from-[#86efac] to-[#22c55e]" },
  { id: "goose", label: "Goose", tone: "from-[#fdba74] to-[#ea580c]" },
  { id: "claude-desktop", label: "Claude Desktop", tone: "from-[#f0c9a0] to-[#a67c52]" },
  { id: "antigravity", label: "Antigravity", tone: "from-[#93c5fd] to-[#2563eb]" },
];

function ConnectModal({
  tool,
  actions,
  highlightId,
  alreadyConnected,
  onConfirmConnected,
  onClose,
}: {
  tool: McpTool;
  actions: McpClientAction[];
  highlightId?: McpClientId | null;
  alreadyConnected: boolean;
  onConfirmConnected: () => void;
  onClose: () => void;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [acted, setActed] = useState(false);

  async function run(action: McpClientAction) {
    if (action.kind === "copy" && action.copyText) {
      try {
        await navigator.clipboard.writeText(action.copyText);
        setCopiedId(action.id);
        setActed(true);
        setTimeout(() => setCopiedId(null), 1600);
      } catch {
        /* ignore */
      }
      return;
    }
    if (action.href) {
      window.open(action.href, "_blank", "noopener,noreferrer");
      setActed(true);
    }
  }

  useEffect(() => {
    if (!highlightId) return;
    const match = actions.find((a) => a.id === highlightId);
    if (!match) return;
    let cancelled = false;
    const t = window.setTimeout(() => {
      if (!cancelled) void run(match);
    }, 80);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightId, tool.id]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 px-3 pt-3 backdrop-blur-md sm:items-center sm:p-4"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mcp-connect-title"
      onClick={onClose}
    >
      <div
        className="relative max-h-[min(88dvh,720px)] w-full max-w-lg overflow-y-auto overflow-x-hidden rounded-[24px] border border-[#38e5ff]/25 bg-[#070b0e] shadow-[0_0_60px_rgba(56,229,255,0.15)]"
        style={{ WebkitOverflowScrolling: "touch" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#38e5ff] to-transparent" />
        <div className="flex items-start justify-between gap-3 border-b border-[#38e5ff]/12 px-5 py-3.5">
          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#38e5ff]/60">
              Route signal
            </p>
            <h2
              id="mcp-connect-title"
              className="mt-1 text-[17px] font-semibold tracking-tight text-white"
            >
              {tool.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#38e5ff]/20 text-white/50 hover:border-[#38e5ff]/40 hover:text-[#38e5ff]"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[min(62vh,480px)] space-y-4 overflow-y-auto p-4">
          {GROUP_ORDER.map((group) => {
            const items = actions.filter((a) => a.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group}>
                <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#38e5ff]/50">
                  {MCP_GROUP_LABELS[group]}
                </p>
                <div className="space-y-1.5">
                  {items.map((action) => {
                    const done = copiedId === action.id;
                    const hot = highlightId === action.id;
                    return (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => void run(action)}
                        className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition ${
                          hot
                            ? "border-[#38e5ff]/50 bg-[rgba(56,229,255,0.1)]"
                            : "border-white/[0.08] bg-white/[0.03] hover:border-[#38e5ff]/35 hover:bg-[rgba(56,229,255,0.06)]"
                        }`}
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#38e5ff]/10 text-[#38e5ff]/80">
                          {action.kind === "copy" ? (
                            done ? (
                              <Check className="size-3.5 text-emerald-300" />
                            ) : (
                              <Copy className="size-3.5" />
                            )
                          ) : (
                            <Plug className="size-3.5" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-white">
                          {done ? "Copied" : action.label}
                        </span>
                        {action.kind === "link" ? (
                          <ArrowUpRight className="size-3.5 shrink-0 text-[#38e5ff]/35" />
                        ) : (
                          <Copy className="size-3.5 shrink-0 text-[#38e5ff]/35" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-[#38e5ff]/12 p-4">
          {alreadyConnected ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-400/35 bg-emerald-400/10 px-4 py-3 text-[13px] font-bold text-emerald-300"
            >
              <Check className="size-4" />
              Connected
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onConfirmConnected();
                onClose();
              }}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-[13px] font-bold transition ${
                acted
                  ? "bg-[#38e5ff] text-black hover:bg-[#7af0ff]"
                  : "border border-[#38e5ff]/30 bg-[#38e5ff]/10 text-[#7af0ff] hover:bg-[#38e5ff]/18"
              }`}
            >
              <Check className="size-4" />
              {acted ? "I connected it — mark ✓" : "Mark as connected"}
            </button>
          )}
          <p className="mt-2.5 text-center text-[11px] text-white/35">
            After you finish install in the AI client, tap above to show ✓ on
            the card.
          </p>
          {tool.installKind === "prompt-vault" && (
            <a
              href="/mcp-icon.png"
              download="prompt-vault-mcp.png"
              className="mt-3 flex items-center justify-center gap-2 text-[11px] font-medium text-[#7af0ff]/80 hover:text-[#7af0ff]"
            >
              <img
                src="/mcp-icon.png"
                alt=""
                className="size-5 rounded-[5px] border border-white/15"
              />
              Download logo for ChatGPT Icon field (PNG ≤10KB)
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function McpApp() {
  const [email, setEmail] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [highlightClient, setHighlightClient] = useState<McpClientId | null>(
    null,
  );
  const [connectedIds, setConnectedIds] = useState<Set<string>>(() => new Set());
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setEmail(getSavedEmail());
    setOrigin(window.location.origin);
    setConnectedIds(readConnectedIds());
  }, []);

  function markConnected(id: string) {
    setConnectedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      writeConnectedIds(next);
      return next;
    });
  }

  function clearConnected(id: string) {
    setConnectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      writeConnectedIds(next);
      return next;
    });
  }

  const vaultTool = useMemo(
    () =>
      MCP_TOOLS.find((t) => t.installKind === "prompt-vault") ?? MCP_TOOLS[0],
    [],
  );

  const activeTool = useMemo(
    () => MCP_TOOLS.find((t) => t.id === activeId) ?? null,
    [activeId],
  );

  const activeActions = useMemo(() => {
    if (!activeTool) return [];
    return clientActionsForTool(activeTool, origin || undefined);
  }, [activeTool, origin]);

  const vaultActions = useMemo(
    () => clientActionsForTool(vaultTool, origin || undefined),
    [vaultTool, origin],
  );

  async function runClientAction(action: McpClientAction) {
    if (action.kind === "copy" && action.copyText) {
      try {
        await navigator.clipboard.writeText(action.copyText);
        setToast(`Copied for ${action.label}`);
      } catch {
        setToast("Could not copy");
        return;
      }
    } else if (action.href) {
      window.open(action.href, "_blank", "noopener,noreferrer");
      setToast(`Opened ${action.label}`);
    }
    window.setTimeout(() => setToast(null), 3200);
  }

  /** AI clients grid → install Prompt Vault into that app directly (no full list). */
  function openAiClient(clientId: McpClientId) {
    const action =
      vaultActions.find((a) => a.id === clientId) ??
      (clientId === "cursor"
        ? vaultActions.find((a) => a.id === "cursor-deeplink")
        : undefined);
    if (!action) {
      setHighlightClient(clientId);
      setActiveId(vaultTool.id);
      return;
    }
    void runClientAction(action);
  }

  function openServer(id: string) {
    setHighlightClient(null);
    setActiveId(id);
  }

  return (
    <div className="relative min-h-svh overflow-x-clip bg-[#040608] text-white">
      <div className="pointer-events-none fixed inset-0 z-0 dashboard-orb" aria-hidden />
      <div className="pointer-events-none fixed inset-0 z-0 lib-mesh opacity-60" aria-hidden />

      <SiteHeader active="mcp" />

      <div className="relative z-50 border-b border-[#38e5ff]/12 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <p className="hidden items-center gap-2 text-[12px] text-[#38e5ff]/65 sm:flex">
            <span className="dash-live-dot size-1.5 rounded-full bg-[#38e5ff]" />
            <Radio className="size-3.5" />
            {AI_CLIENTS.length} AI · {MCP_TOOLS.length} MCP
          </p>
          <div className="ml-auto">
            <ModeSwitcher active="stats" />
          </div>
        </div>
      </div>

      <main className="mobile-dock-clear mobile-pad-x relative z-10 mx-auto max-w-[1200px] pt-5 sm:px-6 sm:pt-10 lg:px-10 lg:pt-12">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[#38e5ff]/70 sm:text-[11px]">
              Model Context Protocol
            </p>
            <h1 className="lib-hero-title lib-hero-title-nowrap mt-1.5 font-extrabold text-white">
              <span className="bg-gradient-to-r from-[#38e5ff] via-[#7af0ff] to-[#b8fff0] bg-clip-text text-transparent">
                Dashboards
              </span>
            </h1>
          </div>

          <div className="w-full shrink-0 rounded-2xl border border-[#38e5ff]/20 bg-[rgba(56,229,255,0.04)] px-3.5 py-2.5 text-[12px] sm:w-auto">
            {email ? (
              <p className="min-w-0 text-white/70">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#38e5ff]/55">
                  Operator
                </span>
                <span className="mt-0.5 block truncate text-white">{email}</span>
              </p>
            ) : (
              <Link
                href="/login"
                className="inline-flex min-h-[40px] w-full items-center justify-center rounded-full bg-[#38e5ff] px-3.5 py-2 text-[13px] font-bold text-black hover:bg-[#7af0ff] sm:w-auto"
              >
                Email login
              </Link>
            )}
          </div>
        </div>

        <section className="mb-8 sm:mb-10">
          <div className="mb-3 border-b border-[#38e5ff]/15 pb-2.5">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-[17px] font-bold tracking-tight text-white sm:text-[20px]">
                AI clients
              </h2>
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-[#38e5ff]/45">
                {AI_CLIENTS.length}
              </span>
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-white/40 sm:text-[13px]">
              OAuth for every client. Tap to install Prompt Vault — opens the app
              or copies config.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {AI_CLIENTS.map((client) => (
              <button
                key={client.id}
                type="button"
                onClick={() => openAiClient(client.id)}
                className="group flex min-h-[44px] min-w-0 items-center gap-2.5 rounded-xl border border-white/[0.09] bg-[#0a1218] px-3 py-2.5 text-left transition hover:border-[#38e5ff]/40 hover:bg-[rgba(56,229,255,0.06)]"
              >
                <span
                  className={`size-2 shrink-0 rounded-full bg-gradient-to-br ${client.tone}`}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-white">
                  {client.label}
                </span>
                <Plug className="size-3 shrink-0 text-[#38e5ff]/40" />
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 border-b border-[#38e5ff]/15 pb-2.5">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-[17px] font-bold tracking-tight text-white sm:text-[20px]">
                MCP channels
              </h2>
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-[#38e5ff]/45">
                {MCP_TOOLS.length}
              </span>
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-white/40 sm:text-[13px]">
              Other MCP servers (Figma, Vercel…). Connect opens install docs.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {MCP_TOOLS.map((tool, index) => {
              const connected = connectedIds.has(tool.id);
              return (
                <article
                  key={tool.id}
                  className={`dashboard-card group relative flex min-w-0 flex-wrap items-center gap-2 overflow-hidden rounded-[16px] border bg-gradient-to-b from-[#0a1218] to-[#070b0e] px-3 py-3 sm:gap-3 sm:px-3.5 ${
                    connected
                      ? "border-emerald-400/30"
                      : "border-white/[0.09]"
                  }`}
                  style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
                >
                  <div className="min-w-0 flex-1 basis-[55%]">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex rounded-full border border-[#38e5ff]/25 bg-[#38e5ff]/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#7af0ff]">
                        {tool.tag}
                      </span>
                      {connected && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-300">
                          <Check className="size-2.5" />
                          On
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1 text-[13px] font-bold tracking-tight text-white break-words sm:text-[14px]">
                      {tool.name}
                    </h3>
                  </div>

                  <div className="ml-auto flex shrink-0 items-center gap-1.5">
                    <a
                      href={tool.href}
                      target={tool.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      className="flex size-9 items-center justify-center rounded-full border border-[#38e5ff]/25 text-[#38e5ff]/70"
                      aria-label={`Open ${tool.name}`}
                    >
                      <ArrowUpRight className="size-3.5" />
                    </a>

                    {connected ? (
                      <button
                        type="button"
                        onClick={() => openServer(tool.id)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          clearConnected(tool.id);
                        }}
                        title="Open again · right-click to clear"
                        className="inline-flex min-h-[36px] items-center justify-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-2.5 py-1.5 text-[11px] font-bold text-emerald-300"
                      >
                        <Check className="size-3" />
                        On
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openServer(tool.id)}
                        className="inline-flex min-h-[36px] items-center justify-center gap-1 rounded-full bg-[#38e5ff] px-2.5 py-1.5 text-[11px] font-bold text-black"
                      >
                        <Plug className="size-3" />
                        Connect
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      {activeTool && (
        <ConnectModal
          tool={activeTool}
          actions={activeActions}
          highlightId={highlightClient}
          alreadyConnected={connectedIds.has(activeTool.id)}
          onConfirmConnected={() => markConnected(activeTool.id)}
          onClose={() => {
            setActiveId(null);
            setHighlightClient(null);
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] flex max-w-[min(92vw,420px)] -translate-x-1/2 flex-col gap-2 rounded-2xl border border-[#38e5ff]/30 bg-[#070b0e] px-4 py-3 shadow-[0_20px_50px_-16px_rgba(0,0,0,0.9)]">
          <p className="text-center text-[13px] font-medium text-white">{toast}</p>
          {!connectedIds.has(vaultTool.id) && (
            <button
              type="button"
              onClick={() => {
                markConnected(vaultTool.id);
                setToast("Prompt Vault marked connected ✓");
                window.setTimeout(() => setToast(null), 1800);
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#38e5ff] px-3 py-2 text-[12px] font-bold text-black hover:bg-[#7af0ff]"
            >
              <Check className="size-3.5" />
              Mark Prompt Vault connected
            </button>
          )}
        </div>
      )}
    </div>
  );
}
