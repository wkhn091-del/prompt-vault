"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Copy,
  Link2,
  Plug,
  X,
} from "lucide-react";
import { getSavedEmail } from "@/lib/auth-local";
import {
  clientActionsForTool,
  MCP_TOOLS,
  type McpClientAction,
  type McpTool,
} from "@/lib/mcp-catalog";
import { ModeSwitcher } from "./ModeSwitcher";
import { SiteHeader } from "./SiteHeader";

const CONNECTED_KEY = "pv_mcp_connected";

function ConnectModal({
  tool,
  actions,
  onClose,
  onConnected,
}: {
  tool: McpTool;
  actions: McpClientAction[];
  onClose: () => void;
  onConnected: () => void;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function run(action: McpClientAction) {
    if (action.kind === "copy" && action.copyText) {
      try {
        await navigator.clipboard.writeText(action.copyText);
        setCopiedId(action.id);
        onConnected();
        setTimeout(() => setCopiedId(null), 1600);
      } catch {
        /* ignore */
      }
      return;
    }
    if (action.href) {
      window.open(action.href, "_blank", "noopener,noreferrer");
      onConnected();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mcp-connect-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-white/[0.1] bg-[#0c0c0e] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/35">
              Connect anywhere
            </p>
            <h2
              id="mcp-connect-title"
              className="mt-1 text-[18px] font-semibold tracking-tight text-white"
            >
              {tool.name}
            </h2>
            <p className="mt-1 text-[13px] text-white/45">
              Pick your AI — Cursor, Claude, VS Code, Gemini, ChatGPT, or copy
              the cloud URL for any MCP client.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/[0.1] text-white/50 hover:text-white"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[min(60vh,420px)] space-y-2 overflow-y-auto p-4">
          {actions.map((action) => {
            const done = copiedId === action.id;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => void run(action)}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left transition hover:border-white/[0.16] hover:bg-white/[0.06]"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-white/70">
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
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-white">
                    {done ? "Copied" : action.label}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-white/40">
                    {action.blurb}
                  </span>
                </span>
                <ArrowUpRight className="size-3.5 shrink-0 text-white/25" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function McpApp() {
  const [email, setEmail] = useState<string | null>(null);
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [origin, setOrigin] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setEmail(getSavedEmail());
    setOrigin(window.location.origin);
    try {
      const raw = localStorage.getItem(CONNECTED_KEY);
      if (raw) setConnected(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      /* ignore */
    }
  }, []);

  const activeTool = useMemo(
    () => MCP_TOOLS.find((t) => t.id === activeId) ?? null,
    [activeId],
  );

  const activeActions = useMemo(() => {
    if (!activeTool) return [];
    return clientActionsForTool(activeTool, origin || undefined);
  }, [activeTool, origin]);

  function markConnected(id: string) {
    setConnected((prev) => {
      const next = { ...prev, [id]: true };
      localStorage.setItem(CONNECTED_KEY, JSON.stringify(next));
      return next;
    });
  }

  const connectedCount = Object.values(connected).filter(Boolean).length;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <div className="vault-grain" aria-hidden />
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,255,255,0.06),transparent_55%)]"
        aria-hidden
      />

      <SiteHeader active="mcp" />

      <div className="relative z-10 border-b border-white/[0.05] bg-black/50">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          <p className="text-[13px] text-white/40">
            MCP · Cursor · Claude · Gemini · Copilot · ChatGPT
          </p>
          <ModeSwitcher active="tools" />
        </div>
      </div>

      <main className="relative z-10 mx-auto max-w-[1100px] px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">
              Model Context Protocol
            </p>
            <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.04em] text-white sm:text-[40px]">
              Connect AI tools
            </h1>
            <p className="mt-3 text-[14px] leading-relaxed text-white/45">
              Remote MCP in the cloud — connect each server to Cursor, Claude,
              VS Code, Gemini, ChatGPT, or paste the URL into any MCP client.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[13px]">
            {email ? (
              <p className="text-white/70">
                Signed in ·{" "}
                <span className="text-white">{email}</span>
                <span className="mt-1 block text-white/35">
                  {connectedCount} connected
                </span>
              </p>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <p className="text-white/45">Sign in to save connectors</p>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-white px-3.5 py-2 text-[12px] font-semibold text-black hover:bg-zinc-200"
                >
                  Email login
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {MCP_TOOLS.map((tool) => {
            const isOn = Boolean(connected[tool.id]);
            return (
              <article
                key={tool.id}
                className="flex min-w-0 flex-col rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-5 transition hover:border-white/[0.14]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="inline-flex rounded-full border border-white/[0.08] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/40">
                      {tool.tag}
                    </span>
                    <h2 className="mt-2 text-[16px] font-semibold tracking-tight text-white">
                      {tool.name}
                    </h2>
                    <p
                      className="mt-2 text-[13px] leading-relaxed text-white/45 [font-family:var(--font-heebo),sans-serif]"
                      dir="rtl"
                    >
                      {tool.blurb}
                    </p>
                  </div>
                  <a
                    href={tool.href}
                    target={tool.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/[0.1] text-white/40 transition hover:border-white/25 hover:text-white"
                    aria-label={`Open ${tool.name}`}
                  >
                    <ArrowUpRight className="size-3.5" />
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveId(tool.id)}
                  className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[12px] font-semibold transition ${
                    isOn
                      ? "bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-400/30"
                      : "bg-white text-black hover:bg-zinc-200"
                  }`}
                >
                  {isOn ? (
                    <>
                      <Check className="size-3.5" />
                      Connected · Add again
                    </>
                  ) : (
                    <>
                      <Plug className="size-3.5" />
                      Connect
                    </>
                  )}
                </button>
              </article>
            );
          })}
        </div>

        <div className="mt-12 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
          <div className="flex items-start gap-3">
            <Link2 className="mt-0.5 size-4 shrink-0 text-white/40" />
            <div>
              <h3 className="text-[15px] font-semibold text-white">
                How multi-client MCP works
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-white/45">
                Each connector is a <span className="text-white/80">public HTTPS</span>{" "}
                MCP URL. Connect opens a picker: Cursor / Claude / VS Code install
                links, Gemini & Claude Code CLI commands, or copy URL /{" "}
                <code className="text-white/70">mcp.json</code> for Windsurf,
                OpenCode, Antigravity, ChatGPT, and more. Prompt Vault itself
                serves tools at{" "}
                <code className="text-white/70">/api/mcp</code>.
              </p>
            </div>
          </div>
        </div>
      </main>

      {activeTool && (
        <ConnectModal
          tool={activeTool}
          actions={activeActions}
          onClose={() => setActiveId(null)}
          onConnected={() => markConnected(activeTool.id)}
        />
      )}
    </div>
  );
}
