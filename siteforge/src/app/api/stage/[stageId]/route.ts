import { NextResponse } from "next/server";
import { getStage } from "../../../../lib/book";

type Params = { params: Promise<{ stageId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { stageId } = await params;
  const doc = getStage(stageId);
  if (!doc) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const meta = doc.meta;
  return NextResponse.json({
    stageId,
    title: String(meta.title ?? stageId),
    track: String(meta.track ?? ""),
    duration: meta.duration_min ? Number(meta.duration_min) : null,
    passScore: meta.pass_score ? Number(meta.pass_score) : 80,
    scriptIds: Array.isArray(meta.script_ids) ? meta.script_ids : [],
    sections: doc.sections,
  });
}
