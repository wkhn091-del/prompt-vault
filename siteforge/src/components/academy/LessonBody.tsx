"use client";

import type { ReactNode } from "react";
import { StageProse } from "../StageProse";
import { ScriptCard } from "./ScriptCard";
import type { ScriptCard as ScriptT } from "../../lib/courses/types";

/** Render body_md with {{script:id}} placeholders replaced by ScriptCards. */
export function LessonBody({
  bodyMd,
  scripts,
  showScripts,
}: {
  bodyMd: string;
  scripts: ScriptT[];
  showScripts: boolean;
}) {
  const byId = Object.fromEntries(scripts.map((s) => [s.id, s]));
  const parts = bodyMd.split(/\{\{script:([^}]+)\}\}/g);

  const hasPlaceholders = parts.length > 1;

  if (!hasPlaceholders) {
    return (
      <div>
        <StageProse text={bodyMd} />
        {showScripts &&
          scripts.map((s) => (
            <ScriptCard key={s.id} id={s.id} text={s.text} note={s.note} />
          ))}
        {!showScripts && scripts.length > 0 && (
          <p className="mt-4 rounded-xl border border-[#ffe0a8]/25 bg-[#241a0e] px-3 py-2 text-[13px] text-[#ffe0a8]">
            הסקריפטים נפתחים אחרי שער ההדבקה (שלב 3). כאן עובדים ידנית.
          </p>
        )}
      </div>
    );
  }

  const nodes: ReactNode[] = [];
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      if (parts[i].trim()) nodes.push(<StageProse key={`p${i}`} text={parts[i]} />);
    } else {
      const sid = parts[i].trim();
      const s = byId[sid];
      if (showScripts && s) {
        nodes.push(
          <ScriptCard key={`s${sid}`} id={s.id} text={s.text} note={s.note} />,
        );
      } else {
        nodes.push(
          <p
            key={`g${sid}`}
            className="my-3 rounded-xl border border-[#ffe0a8]/25 bg-[#241a0e] px-3 py-2 font-mono text-[12px] text-[#ffe0a8]"
          >
            [{sid}] — נעול עד שער הסקריפטים
          </p>,
        );
      }
    }
  }
  return <div className="space-y-2">{nodes}</div>;
}
