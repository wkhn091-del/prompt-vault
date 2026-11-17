import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient, hasSupabaseEnv, type PromptRow } from "@/lib/supabase";
import { toPromptDTO } from "@/lib/prompts";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  previewHtml: z.string().min(20).max(2_000_000),
});

/** Fetch a single prompt (prompt_text included for clipboard copy only). */
export async function GET(_req: NextRequest, ctx: Ctx) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
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

  return NextResponse.json({ prompt: toPromptDTO(data as PromptRow) });
}

/** Attach / replace companion HTML (keeps video/image preview as-is). */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

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

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("prompts")
    .update({ preview_html: parsed.data.previewHtml.trim() })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ prompt: toPromptDTO(data as PromptRow) });
}
