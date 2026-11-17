import bodies from "@/data/tools-bodies.json";
import type { ToolItem } from "./tools-arsenal";

const BODIES = bodies as Record<string, string>;

const DRIVE_MCP_FALLBACK = `# עבודה עם Google Drive דרך MCP

> ארסנל סקילי Cursor · מיובא מהדרייב

השתמש ב־Google Drive MCP כדי לחפש, לקרוא, לייצא ולעדכן קבצים ותיקיות.

## פעולות עיקריות
- \`search\` — חיפוש קבצים
- \`list_folder\` — תוכן תיקייה
- \`read_file\` — קריאת Docs כטקסט/Markdown
- \`export_file\` — ייצוא ל־txt/md/pdf
- \`create_file\` / \`update_file_content\` — יצירה ועדכון

פתח את המסמך המלא בדרייב להעתקה מדויקת של הסקיל.
`;

export function getToolCopyText(tool: ToolItem): string {
  const body = BODIES[tool.id] || (tool.id === "drive-mcp" ? DRIVE_MCP_FALLBACK : "");
  if (body.trim()) {
    return `# ${tool.title}\n\n${tool.summary}\n\n---\n\n${body.trim()}`;
  }
  const links = [
    tool.href,
    ...(tool.parts?.map((p) => `${p.label}: ${p.href}`) ?? []),
  ].join("\n");
  return `# ${tool.title}\n\n${tool.summary}\n\nDrive:\n${links}`;
}

export function hasToolBody(toolId: string): boolean {
  return Boolean(BODIES[toolId]) || toolId === "drive-mcp";
}
