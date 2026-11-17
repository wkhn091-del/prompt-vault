import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, hasSupabaseEnv, type PromptRow } from "@/lib/supabase";
import { toPromptDTO } from "@/lib/prompts";

type Ctx = { params: Promise<{ id: string }> };

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
