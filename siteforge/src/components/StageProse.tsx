import {
  isScriptId,
  normalizeScriptId,
  scriptSourceUrl,
  vaultAcademyUrl,
} from "../lib/vault-links";

/** Lightweight markdown-ish renderer for stage section bodies (Hebrew RTL). */
export function StageProse({ text }: { text: string }) {
  const blocks = text.split(/\n\n+/);
  return (
    <div className="stage-prose" dir="rtl">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith("|") && trimmed.includes("\n|")) {
          return <MdTable key={i} raw={trimmed} />;
        }

        if (/^[-*] /m.test(trimmed) || /^\d+\. /m.test(trimmed)) {
          const lines = trimmed.split("\n");
          const ordered = /^\d+\. /.test(lines[0] ?? "");
          const Tag = ordered ? "ol" : "ul";
          return (
            <Tag key={i} className={ordered ? "list-decimal" : "list-disc"}>
              {lines.map((line, j) => (
                <li key={j}>
                  <Inline
                    text={line.replace(/^[-*] /, "").replace(/^\d+\. /, "")}
                  />
                </li>
              ))}
            </Tag>
          );
        }

        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={i}>
              <Inline text={trimmed.slice(4)} />
            </h3>
          );
        }

        return (
          <p key={i}>
            <Inline text={trimmed} />
          </p>
        );
      })}
    </div>
  );
}

function ScriptLinks({ id }: { id: string }) {
  const source = scriptSourceUrl(id);
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
      <a
        href={vaultAcademyUrl(id)}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-[12px] font-semibold text-[#ffb35c] underline decoration-[#ff7a45]/40 underline-offset-2 hover:text-[#ffe0a8] [direction:ltr]"
        title="פתח ב־Prompt Vault"
      >
        {id}
      </a>
      {source && (
        <a
          href={source}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-[#ffb35c]/35 px-2 py-0.5 text-[10px] font-bold text-[#ffe0a8] hover:bg-white/[0.05]"
        >
          סקריפט
        </a>
      )}
    </span>
  );
}

function Inline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          const inner = part.slice(1, -1);
          if (isScriptId(inner)) {
            return <ScriptLinks key={i} id={normalizeScriptId(inner)} />;
          }
          return <code key={i}>{inner}</code>;
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function MdTable({ raw }: { raw: string }) {
  const rows = raw
    .split("\n")
    .map((r) => r.trim())
    .filter((r) => r.startsWith("|") && !/^\|[\s-|]+\|$/.test(r));
  if (rows.length < 2) return <p>{raw}</p>;
  const cells = (row: string) =>
    row
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
  const head = cells(rows[0]);
  const body = rows.slice(1);
  return (
    <div className="overflow-x-auto">
      <table>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i}>
                <Inline text={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri}>
              {cells(row).map((c, ci) => {
                const plain = normalizeScriptId(c);
                if (isScriptId(plain) || (c.startsWith("`") && isScriptId(c))) {
                  return (
                    <td key={ci}>
                      <ScriptLinks id={plain} />
                    </td>
                  );
                }
                return (
                  <td key={ci}>
                    <Inline text={c} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
