import type { ReactNode } from "react";
import { deDash } from "../lib/courses/adapter";
import { isScriptId, normalizeScriptId } from "../lib/vault-links";
import { isBlockedExternalUrl } from "../lib/courses/stage-quiz";

/** Lightweight markdown-ish renderer for stage section bodies (Hebrew RTL). */
export function StageProse({ text }: { text: string }) {
  const blocks = deDash(text).split(/\n\n+/);
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
  // No Drive / external vault links — scripts live in-site via ScriptCard.
  return (
    <code className="font-mono text-[12px] font-semibold text-[#ffb35c] [direction:ltr]">
      {id}
    </code>
  );
}

function ExtLink({ href, children }: { href: string; children: string }) {
  // Course materials stay on this site — never surface Drive/Docs links.
  if (isBlockedExternalUrl(href)) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="break-all font-mono text-[13px] font-semibold text-[#ffb35c] underline decoration-[#ffb35c]/40 underline-offset-2 hover:text-[#ffe0a8] [direction:ltr]"
    >
      {children}
    </a>
  );
}

/** Linkify markdown links + bare https URLs inside plain text. */
function linkifyPlain(text: string, keyPrefix: string) {
  const nodes: ReactNode[] = [];
  // [label](url) OR bare https?://… (stop before Hebrew/whitespace/punctuation commonly trailing)
  const re =
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|(https?:\/\/[^\s<>"')\]}،·]+)/gi;
  let last = 0;
  let m: RegExpExecArray | null;
  let n = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      nodes.push(
        <span key={`${keyPrefix}-t${n++}`}>{text.slice(last, m.index)}</span>,
      );
    }
    if (m[1] && m[2]) {
      nodes.push(
        <ExtLink key={`${keyPrefix}-a${n++}`} href={m[2]}>
          {m[1]}
        </ExtLink>,
      );
    } else if (m[3]) {
      let url = m[3];
      // trim trailing punctuation that isn't part of the URL
      url = url.replace(/[.,;:!?)]+$/, "");
      nodes.push(
        <ExtLink key={`${keyPrefix}-u${n++}`} href={url}>
          {url}
        </ExtLink>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    nodes.push(<span key={`${keyPrefix}-e`}>{text.slice(last)}</span>);
  }
  return nodes.length ? nodes : text;
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
          // Still linkify URLs inside backticks (RESOURCES often wraps them)
          if (/^https?:\/\//i.test(inner)) {
            return <ExtLink key={i} href={inner}>{inner}</ExtLink>;
          }
          return <code key={i}>{inner}</code>;
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i}>
              {linkifyPlain(part.slice(2, -2), `b${i}`)}
            </strong>
          );
        }
        return <span key={i}>{linkifyPlain(part, `p${i}`)}</span>;
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
