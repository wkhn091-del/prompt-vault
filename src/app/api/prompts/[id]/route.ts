import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { toPromptDTO } from "@/lib/prompts";
import {
  createServiceClient,
  hasSupabaseEnv,
  type PromptRow,
} from "@/lib/supabase";
import { createAdminWriteClient, requireAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z
  .object({
    previewHtml: z.string().min(20).max(2_000_000),
  })
  .strict();

/** Fetch a single prompt (prompt_text included for clipboard copy). Premium requires auth. */
export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    if (!hasSupabaseEnv()) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 },
      );
    }

    const { id } = await ctx.params;
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const row = data as PromptRow;
    if (row.is_premium) {
      const gate = await requireAdmin(req);
      if ("response" in gate) {
        return NextResponse.json(
          {
            error: "Premium prompt — sign in as admin to copy full text.",
            prompt: {
              ...toPromptDTO(row),
              promptText: "",
            },
          },
          { status: 401 },
        );
      }
    }

    return NextResponse.json({ prompt: toPromptDTO(row) });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load prompt" },
      { status: 500 },
    );
  }
}

/** Attach / replace companion HTML (keeps video/image preview as-is). Admin only. */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    if (!hasSupabaseEnv()) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 },
      );
    }

    const gate = await requireAdmin(req);
    if ("response" in gate) return gate.response;

    const { id } = await ctx.params;
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const { sanitizePreviewHtml } = await import("@/lib/sanitize-html");
    const cleanHtml = sanitizePreviewHtml(parsed.data.previewHtml.trim());

    const supabase = await createAdminWriteClient(req);

    const { data, error } = await supabase
      .from("prompts")
      .update({ preview_html: cleanHtml })
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json(
        {
          error:
            "Update blocked or not found. Add SUPABASE_SERVICE_ROLE_KEY on Vercel (Supabase → Settings → API), and ensure your email is in ADMIN_EMAILS.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ prompt: toPromptDTO(data as PromptRow) });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to save HTML" },
      { status: 500 },
    );
  }
}
