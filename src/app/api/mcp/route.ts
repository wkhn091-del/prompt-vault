import type { AuthInfo } from "@modelcontextprotocol/server";
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { z } from "zod";
import backgrounds from "@/data/backgrounds.json";
import { verifyMcpBearer } from "@/lib/mcp-oauth";
import { toPromptDTO } from "@/lib/prompts";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  createServiceClient,
  hasSupabaseEnv,
  type PromptRow,
} from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 60;

type BackgroundRow = {
  id: string;
  title: string;
  videoUrl: string;
  category: string;
  featured?: boolean;
  popular?: boolean;
  premium?: boolean;
  likes?: number;
};

/** Set per-request in verifyToken — premium get_prompt checks this. */
let mcpRequestScopes: string[] = [];

function canReadPremium(): boolean {
  return mcpRequestScopes.includes("mcp:premium");
}

async function loadPrompts() {
  if (!hasSupabaseEnv()) return [] as ReturnType<typeof toPromptDTO>[];
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as PromptRow[]).map(toPromptDTO);
}

const mcpHandler = createMcpHandler(
  (server) => {
    server.registerTool(
      "list_prompts",
      {
        title: "List prompts",
        description:
          "List Prompt Vault prompts (id, title, slug, category). Use get_prompt for full text.",
        inputSchema: z.object({
          category: z.string().optional().describe("Filter by category"),
          limit: z.number().int().min(1).max(30).optional().default(30),
        }),
      },
      async ({ category, limit }) => {
        let prompts = await loadPrompts();
        if (category && category !== "All") {
          const c = category.toLowerCase();
          prompts = prompts.filter((p) => p.category.toLowerCase() === c);
        }
        const slice = prompts.slice(0, limit).map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          category: p.category,
          isPremium: p.isPremium,
          mediaType: p.mediaType,
        }));
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { count: slice.length, prompts: slice },
                null,
                2,
              ),
            },
          ],
        };
      },
    );

    server.registerTool(
      "search_prompts",
      {
        title: "Search prompts",
        description:
          "Search Prompt Vault by title, category, or prompt body keywords.",
        inputSchema: z.object({
          query: z.string().min(1).describe("Search query"),
          limit: z.number().int().min(1).max(20).optional().default(20),
        }),
      },
      async ({ query, limit }) => {
        const q = query.trim().toLowerCase();
        const prompts = await loadPrompts();
        const hits = prompts
          .filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              p.category.toLowerCase().includes(q) ||
              p.slug.toLowerCase().includes(q) ||
              (!p.isPremium && p.promptText.toLowerCase().includes(q)),
          )
          .slice(0, limit)
          .map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            category: p.category,
            snippet: p.isPremium
              ? "[premium — mcp:premium scope or API key required]"
              : p.promptText.slice(0, 180),
          }));
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { query, count: hits.length, prompts: hits },
                null,
                2,
              ),
            },
          ],
        };
      },
    );

    server.registerTool(
      "get_prompt",
      {
        title: "Get prompt",
        description:
          "Fetch a full Prompt Vault prompt by id or slug (includes promptText for copy/use).",
        inputSchema: z.object({
          idOrSlug: z.string().min(1).describe("Prompt id (uuid) or slug"),
        }),
      },
      async ({ idOrSlug }) => {
        const prompts = await loadPrompts();
        const key = idOrSlug.trim().toLowerCase();
        const prompt = prompts.find(
          (p) => p.id.toLowerCase() === key || p.slug.toLowerCase() === key,
        );
        if (!prompt) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ error: "Prompt not found", idOrSlug }),
              },
            ],
            isError: true,
          };
        }

        if (prompt.isPremium && !canReadPremium()) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
                    id: prompt.id,
                    title: prompt.title,
                    slug: prompt.slug,
                    category: prompt.category,
                    isPremium: true,
                    promptText: null,
                    error:
                      "Premium prompt — sign in during OAuth (mcp:premium) or use Authorization: Bearer <MCP_API_KEY>",
                  },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(prompt, null, 2),
            },
          ],
        };
      },
    );

    server.registerTool(
      "list_backgrounds",
      {
        title: "List backgrounds",
        description:
          "List hero background videos from the Prompt Vault /backgrounds catalog.",
        inputSchema: z.object({
          category: z.string().optional(),
          limit: z.number().int().min(1).max(30).optional().default(24),
        }),
      },
      async ({ category, limit }) => {
        let rows = backgrounds as BackgroundRow[];
        if (category) {
          const c = category.toLowerCase();
          rows = rows.filter((b) => b.category.toLowerCase() === c);
        }
        const slice = rows.slice(0, limit).map((b) => ({
          id: b.id,
          title: b.title,
          category: b.category,
          videoUrl: b.videoUrl,
          premium: Boolean(b.premium),
        }));
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { count: slice.length, backgrounds: slice },
                null,
                2,
              ),
            },
          ],
        };
      },
    );
  },
  {
    serverInfo: {
      name: "prompt-vault",
      version: "0.2.0",
      ...({
        title: "Prompt Vault MCP",
        icons: [
          {
            src: "https://prompt-vault-tan.vercel.app/mcp-icon.png",
            mimeType: "image/png",
            sizes: ["180x180"],
          },
          {
            src: "https://prompt-vault-tan.vercel.app/favicon-32.png",
            mimeType: "image/png",
            sizes: ["32x32"],
          },
        ],
      } as object),
    } as { name: string; version: string },
  },
);

async function verifyToken(
  _req: Request,
  bearerToken?: string,
): Promise<AuthInfo | undefined> {
  if (!bearerToken) {
    mcpRequestScopes = [];
    return undefined;
  }
  const verified = verifyMcpBearer(bearerToken);
  if (!verified) {
    mcpRequestScopes = [];
    return undefined;
  }
  mcpRequestScopes = verified.scopes;
  return {
    token: verified.token,
    clientId: verified.clientId,
    scopes: verified.scopes,
    extra: { via: verified.via, userId: verified.userId },
  };
}

function browserStatusPage(req: Request): Response {
  const origin = new URL(req.url).origin;
  const mcpUrl = `${origin}/api/mcp`;
  const accept = req.headers.get("accept") || "";
  const wantsHtml = accept.includes("text/html");

  const payload = {
    ok: true,
    name: "Prompt Vault MCP",
    transport: "streamable-http",
    url: mcpUrl,
    hint: "This URL is for MCP clients (Cursor, Claude, ChatGPT…). Opening it in a browser is not how you connect — paste the URL into the client's MCP settings, or install from /mcp.",
    hint_he:
      "הכתובת הזו מיועדת ללקוחות MCP (Cursor וכו'). פתיחה בדפדפן לא מחברת — הדביקו את ה-URL בהגדרות MCP או התקינו מ־/mcp.",
    install: `${origin}/mcp`,
    oauth: {
      authorization_server: `${origin}/.well-known/oauth-authorization-server`,
      protected_resource: `${origin}/.well-known/oauth-protected-resource`,
    },
  };

  if (!wantsHtml) {
    return Response.json(payload, {
      headers: { "Cache-Control": "public, max-age=60" },
    });
  }

  return new Response(
    `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Prompt Vault MCP</title>
<style>
:root{color-scheme:dark}body{margin:0;min-height:100dvh;display:grid;place-items:center;font-family:ui-sans-serif,system-ui,sans-serif;background:#070b0e;color:#e8f7ff;padding:24px}
.card{width:min(520px,100%);border:1px solid rgba(56,229,255,.28);border-radius:20px;background:linear-gradient(180deg,#0a1218,#070b0e);padding:28px;box-shadow:0 24px 60px rgba(0,0,0,.45)}
h1{margin:0 0 8px;font-size:22px}p{margin:0 0 12px;color:rgba(232,247,255,.7);line-height:1.55;font-size:14px}
code{display:block;margin:14px 0;padding:12px;border-radius:12px;background:rgba(56,229,255,.08);border:1px solid rgba(56,229,255,.18);font-size:12px;word-break:break-all;color:#7af0ff;direction:ltr;text-align:left}
a{color:#38e5ff}
</style></head><body><div class="card">
<h1>Prompt Vault MCP פעיל ✓</h1>
<p>פתיחת הכתובת בדפדפן לא מחברת את Cursor. צריך להדביק את ה־URL בהגדרות MCP של הלקוח.</p>
<code>${mcpUrl}</code>
<p><a href="/mcp">מסך התקנה לכל הלקוחות</a></p>
</div></body></html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=60",
      },
    },
  );
}

async function guarded(req: Request) {
  const ip = clientIp(req);
  const limited = rateLimit(`mcp:${ip}`, 60, 60_000);
  if (!limited.ok) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(
          Math.ceil((limited.resetAt - Date.now()) / 1000),
        ),
      },
    });
  }

  // Browser GET (no SSE) → friendly status. MCP streamable HTTP uses POST
  // (and SSE GET only with Accept: text/event-stream).
  if (req.method === "GET") {
    const accept = req.headers.get("accept") || "";
    if (!accept.includes("text/event-stream")) {
      return browserStatusPage(req);
    }
  }

  // Public vault: allow anonymous tool calls (list/search/free prompts).
  // OAuth still works when a client sends a Bearer token (premium scope).
  const handler = withMcpAuth(mcpHandler, verifyToken, {
    required: false,
    requiredScopes: ["mcp:read"],
    resourceMetadataPath: "/.well-known/oauth-protected-resource",
  });

  try {
    return await handler(req);
  } finally {
    mcpRequestScopes = [];
  }
}

export { guarded as GET, guarded as POST, guarded as DELETE };
