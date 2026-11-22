import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  isLoopbackRedirect,
  mcpIssuer,
  mintAuthorizationCode,
  parseScopeParam,
  redirectUrisMatch,
  resolveClient,
} from "@/lib/mcp-oauth";

export const runtime = "nodejs";

type AuthParams = {
  client_id: string;
  redirect_uri: string;
  response_type: string;
  code_challenge: string;
  code_challenge_method: string;
  scope: string;
  state: string;
  resource: string;
};

function readParamsFromUrl(url: URL): AuthParams {
  return {
    client_id: url.searchParams.get("client_id") || "",
    redirect_uri: url.searchParams.get("redirect_uri") || "",
    response_type: url.searchParams.get("response_type") || "code",
    code_challenge: url.searchParams.get("code_challenge") || "",
    code_challenge_method:
      url.searchParams.get("code_challenge_method") || "S256",
    scope: url.searchParams.get("scope") || "",
    state: url.searchParams.get("state") || "",
    resource: url.searchParams.get("resource") || "",
  };
}

function readParamsFromForm(
  form: FormData,
  fallback: AuthParams,
): AuthParams {
  const pick = (key: keyof AuthParams) => {
    const v = form.get(key);
    return typeof v === "string" && v.length > 0 ? v : fallback[key];
  };
  return {
    client_id: pick("client_id"),
    redirect_uri: pick("redirect_uri"),
    response_type: pick("response_type") || "code",
    code_challenge: pick("code_challenge"),
    code_challenge_method: pick("code_challenge_method") || "S256",
    scope: pick("scope"),
    state: pick("state"),
    resource: pick("resource"),
  };
}

async function currentUserId(): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) return null;
  try {
    const jar = await cookies();
    const client = createServerClient(url, anon, {
      cookies: {
        getAll() {
          return jar.getAll();
        },
        setAll() {
          /* read-only in this route */
        },
      },
    });
    const { data } = await client.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

function htmlPage(body: string, status = 200): Response {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Connect Prompt Vault MCP</title><style>
      :root{color-scheme:dark}body{margin:0;min-height:100dvh;display:grid;place-items:center;font-family:ui-sans-serif,system-ui,sans-serif;background:#070b0e;color:#e8f7ff;padding:24px}
      .card{width:min(440px,100%);border:1px solid rgba(56,229,255,.28);border-radius:20px;background:linear-gradient(180deg,#0a1218,#070b0e);padding:28px;box-shadow:0 24px 60px rgba(0,0,0,.45)}
      h1{margin:0 0 8px;font-size:22px;letter-spacing:-.02em}p{margin:0 0 14px;color:rgba(232,247,255,.65);line-height:1.5;font-size:14px}
      .meta{font-family:ui-monospace,monospace;font-size:11px;color:#7af0ff;word-break:break-all;margin:12px 0 18px;padding:10px 12px;border-radius:12px;background:rgba(56,229,255,.06);border:1px solid rgba(56,229,255,.15)}
      .row{display:flex;gap:10px;flex-wrap:wrap}button,.btn{appearance:none;border:0;border-radius:999px;padding:11px 18px;font-weight:700;font-size:13px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}
      .ok{background:#38e5ff;color:#041016}.no{background:transparent;color:rgba(232,247,255,.7);border:1px solid rgba(255,255,255,.14)}
      .err{color:#ff8f8f}.warn{margin:0 0 16px;padding:12px 14px;border-radius:14px;background:rgba(255,176,60,.1);border:1px solid rgba(255,176,60,.35);color:#ffd59a;font-size:13px;line-height:1.45}
      .ok:disabled{opacity:.45;cursor:not-allowed}
    </style></head><body>${body}</body></html>`,
    {
      status,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  );
}

function errorPage(message: string): Response {
  return htmlPage(
    `<div class="card"><h1>Can't connect</h1><p class="err">${escapeHtml(message)}</p></div>`,
    400,
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function hiddenFields(params: AuthParams): string {
  const keys: (keyof AuthParams)[] = [
    "client_id",
    "redirect_uri",
    "response_type",
    "code_challenge",
    "code_challenge_method",
    "scope",
    "state",
    "resource",
  ];
  return keys
    .map(
      (k) =>
        `<input type="hidden" name="${k}" value="${escapeHtml(params[k] || "")}"/>`,
    )
    .join("");
}

function friendlyClientName(name: string): string {
  const n = name.trim();
  if (!n) return "MCP client";
  // Common typo / truncation from some clients
  if (/^curser$/i.test(n)) return "Cursor";
  return n;
}

async function validate(params: AuthParams) {
  if (!params.client_id) return { error: "client_id required" };
  if (!params.redirect_uri) return { error: "redirect_uri required" };
  if (params.response_type !== "code") {
    return { error: "response_type must be code" };
  }
  if (!params.code_challenge) return { error: "code_challenge required (PKCE)" };
  if (params.code_challenge_method !== "S256") {
    return { error: "code_challenge_method must be S256" };
  }
  const client = await resolveClient(params.client_id);
  if (!client) return { error: "Unknown client_id — register first (DCR)" };
  const ok = client.redirect_uris.some((u) =>
    redirectUrisMatch(u, params.redirect_uri),
  );
  if (!ok) return { error: "redirect_uri not registered for this client" };
  return { client };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = readParamsFromUrl(url);
  const checked = await validate(params);
  if ("error" in checked && checked.error) return errorPage(checked.error);

  const userId = await currentUserId();
  const scopes = parseScopeParam(params.scope);
  const granted = userId
    ? scopes
    : scopes.filter((s) => s !== "mcp:premium");
  if (granted.length === 0) granted.push("mcp:read");

  const clientName = friendlyClientName(
    "client" in checked && checked.client
      ? checked.client.client_name || "MCP client"
      : "MCP client",
  );

  const loopback = isLoopbackRedirect(params.redirect_uri);
  const ua = req.headers.get("user-agent") || "";
  const likelyMobile = /Mobile|Android|iPhone|iPad/i.test(ua);

  const warn =
    loopback && likelyMobile
      ? `<div class="warn"><strong>Open this on your computer</strong> — Cursor / Claude / VS Code listen on <code>127.0.0.1</code>. Approving on a phone cannot finish the connection.<br/><br/><strong>פתח במחשב שבו רץ Cursor</strong> — אישור מהטלפון לא יעבוד.</div>`
      : loopback
        ? `<div class="warn">After Approve, this browser returns to the app on this computer. Keep Cursor / the IDE open.</div>`
        : "";

  return htmlPage(`
    <div class="card">
      <h1>Connect Prompt Vault</h1>
      <p><strong>${escapeHtml(clientName)}</strong> wants access to your Prompt Vault MCP tools (list / search / get prompts &amp; backgrounds).</p>
      ${warn}
      <div class="meta">scopes: ${escapeHtml(granted.join(" "))}${userId ? "" : "<br/>optional: sign in for premium prompt bodies"}</div>
      <form method="post" action="/api/oauth/authorize" class="row">
        ${hiddenFields(params)}
        <button class="ok" type="submit" name="decision" value="approve"${loopback && likelyMobile ? " disabled" : ""}>Approve</button>
        <button class="no" type="submit" name="decision" value="deny">Deny</button>
      </form>
      ${
        loopback && likelyMobile
          ? `<p style="margin-top:16px;font-size:13px;color:rgba(232,247,255,.55)">In Cursor: Settings → MCP → Prompt Vault → Connect again so the link opens on your PC.</p>`
          : ""
      }
      ${
        userId
          ? ""
          : `<p style="margin-top:16px"><a class="btn no" href="/login?next=${encodeURIComponent(`/api/oauth/authorize?${url.searchParams.toString()}`)}">Sign in first</a></p>`
      }
    </div>
  `);
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const fromQuery = readParamsFromUrl(url);
  const form = await req.formData();
  const params = readParamsFromForm(form, fromQuery);
  const checked = await validate(params);
  if ("error" in checked && checked.error) return errorPage(checked.error);

  const decision = String(form.get("decision") || "approve");
  const redirect = new URL(params.redirect_uri);
  const issuer = mcpIssuer(req);

  if (decision === "deny") {
    redirect.searchParams.set("error", "access_denied");
    if (params.state) redirect.searchParams.set("state", params.state);
    redirect.searchParams.set("iss", issuer);
    return Response.redirect(redirect.toString(), 302);
  }

  const userId = await currentUserId();
  const scopes = parseScopeParam(params.scope);
  const granted = userId
    ? scopes
    : scopes.filter((s) => s !== "mcp:premium");
  if (granted.length === 0) granted.push("mcp:read");

  const resource =
    params.resource.trim() || `${issuer.replace(/\/$/, "")}/api/mcp`;

  const code = mintAuthorizationCode({
    clientId: params.client_id,
    redirectUri: params.redirect_uri,
    codeChallenge: params.code_challenge,
    codeChallengeMethod: params.code_challenge_method,
    scopes: granted,
    userId,
    resource,
  });

  redirect.searchParams.set("code", code);
  if (params.state) redirect.searchParams.set("state", params.state);
  // RFC 9207 — some MCP clients require iss on the callback
  redirect.searchParams.set("iss", issuer);
  return Response.redirect(redirect.toString(), 302);
}
