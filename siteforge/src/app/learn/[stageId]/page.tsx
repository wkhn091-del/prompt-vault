import { notFound } from "next/navigation";
import { Shell } from "../../../components/Shell";
import { StageRoom } from "../../../components/StageRoom";
import { getStage, getToc, listStageIds, trackTitle } from "../../../lib/book";

type Props = { params: Promise<{ stageId: string }> };

export function generateStaticParams() {
  return listStageIds().map((stageId) => ({ stageId }));
}

export default async function StagePage({ params }: Props) {
  const { stageId } = await params;
  const toc = getToc();
  const doc = getStage(stageId);
  if (!doc) notFound();

  const meta = doc.meta;
  const title = String(meta.title ?? stageId);
  const track = String(meta.track ?? "");
  const duration = meta.duration_min ? Number(meta.duration_min) : null;
  const pass = meta.pass_score ? Number(meta.pass_score) : 80;
  const scripts = Array.isArray(meta.script_ids)
    ? (meta.script_ids as string[])
    : [];

  const ids = listStageIds();
  const idx = ids.indexOf(stageId);
  const prev = idx > 0 ? ids[idx - 1] : null;
  const next = idx >= 0 && idx < ids.length - 1 ? ids[idx + 1] : null;

  return (
    <Shell active="learn">
      <StageRoom
        stageId={stageId}
        title={title}
        trackTitle={track ? trackTitle(toc, track) : ""}
        duration={duration}
        passScore={pass}
        scriptIds={scripts}
        sections={doc.sections}
        prevId={prev}
        nextId={next}
        totalStages={toc.stage_count}
      />
    </Shell>
  );
}
