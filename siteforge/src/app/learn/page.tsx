import { Shell } from "../../components/Shell";
import { PathMap } from "../../components/PathMap";
import { getToc } from "../../lib/book";

export default function LearnPage() {
  const toc = getToc();

  return (
    <Shell active="learn">
      <PathMap
        tracks={toc.tracks}
        stages={toc.stages}
        medals={toc.medals}
        projects={toc.projects}
      />
    </Shell>
  );
}
