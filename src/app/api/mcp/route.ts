import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import backgrounds from "@/data/backgrounds.json";
import { toPromptDTO } from "@/lib/prompts";
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

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "list_prompts",
      {
        title: "List prompts",
        description:
          "List Prompt Vault prompts (id, title, slug, category). Use get_prompt for full text.",
        inputSchema: z.object({
          category: z.string().optional().describe("Filter by category"),
          limit: z.number().int().min(1).max(100).optional().default(30),
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
          limit: z.number().int().min(1).max(50).optional().default(20),
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
              p.promptText.toLowerCase().includes(q),
          )
          .slice(0, limit)
          .map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            category: p.category,
            snippet: p.promptText.slice(0, 180),
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
          limit: z.number().int().min(1).max(100).optional().default(24),
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

export { handler as GET, handler as POST, handler as DELETE };
