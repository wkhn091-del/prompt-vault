import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import backgrounds from "@/data/backgrounds.json";
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

/** Set per-request in guarded() — premium get_prompt checks this. */
let mcpRequestAuthorized = false;

function mcpAuthorized(req: Request): boolean {
  const key = process.env.MCP_API_KEY?.trim();
  if (!key) return true; // optional key — open when unset
  const header = req.headers.get("authorization") || "";
  const token = header.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  return Boolean(token && token === key);
}

function canReadPremium(): boolean {
  const key = process.env.MCP_API_KEY?.trim();
  // Premium body only when a key is configured AND this request presented it
  return Boolean(key) && mcpRequestAuthorized;
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
              text: JSON.stringify({ count: slice.length, prompts: slice }, null, 2),
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
              ? "[premium — authorized access required]"
              : p.promptText.slice(0, 180),
          }));
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ query, count: hits.length, prompts: hits }, null, 2),
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
                      "Premium prompt — provide Authorization: Bearer <MCP_API_KEY>",
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
              text: JSON.stringify({ count: slice.length, backgrounds: slice }, null, 2),
            },
          ],
        };
      },
    );
  },
  {
    serverInfo: {
      name: "prompt-vault",
      version: "0.1.0",
    },
  },
);

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

  const authorized = mcpAuthorized(req);
  if (!authorized) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized — set Authorization: Bearer <MCP_API_KEY>",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  mcpRequestAuthorized = authorized && Boolean(process.env.MCP_API_KEY?.trim());
  try {
    return await mcpHandler(req);
  } finally {
    mcpRequestAuthorized = false;
  }
}

export { guarded as GET, guarded as POST, guarded as DELETE };
