import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "crypto";
import { promptVaultMcpUrl } from "@/lib/mcp-install";

export const MCP_SCOPES = ["mcp:read", "mcp:premium"] as const;

type JwtPayload = Record<string, unknown>;

function b64url(buf: Buffer | string): string {
  const b = typeof buf === "string" ? Buffer.from(buf, "utf8") : buf;
  return b
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromB64url(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function oauthSecret(): string {
  return (
    process.env.MCP_OAUTH_SECRET?.trim() ||
    process.env.MCP_API_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "dev-only-mcp-oauth-secret-change-me"
  );
}

export function mcpPublicOrigin(req?: Request): string {
  const env = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (env) return env;
  if (req) {
    const proto =
      req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
    const host =
      req.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
      req.headers.get("host") ||
      "localhost:3000";
    return `${proto}://${host}`;
  }
  return "http://localhost:3000";
}

export function mcpResourceUrl(req?: Request): string {
  return promptVaultMcpUrl(mcpPublicOrigin(req));
}

export function mcpIssuer(req?: Request): string {
  return mcpPublicOrigin(req);
}

function signJwt(payload: JwtPayload, expiresInSec: number): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expiresInSec };
  const h = b64url(JSON.stringify(header));
  const p = b64url(JSON.stringify(body));
  const data = `${h}.${p}`;
  const sig = createHmac("sha256", oauthSecret()).update(data).digest();
  return `${data}.${b64url(sig)}`;
}

function verifyJwt(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  const data = `${h}.${p}`;
  const expected = createHmac("sha256", oauthSecret()).update(data).digest();
  let actual: Buffer;
  try {
    actual = fromB64url(s);
  } catch {
    return null;
  }
  if (
    expected.length !== actual.length ||
    !timingSafeEqual(expected, actual)
  ) {
    return null;
  }
  try {
    const payload = JSON.parse(fromB64url(p).toString("utf8")) as JwtPayload;
    const exp = Number(payload.exp);
    if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function isLoopbackRedirect(uri: string): boolean {
  try {
    const u = new URL(uri);
    if (u.protocol !== "http:") return false;
    return u.hostname === "localhost" || u.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

export function redirectUrisMatch(
  registered: string,
  requested: string,
): boolean {
  if (registered === requested) return true;
  try {
    const a = new URL(registered);
    const b = new URL(requested);
    if (a.protocol !== b.protocol) return false;
    if (a.pathname !== b.pathname) return false;
    if (a.search !== b.search) return false;
    const loopA =
      a.hostname === "localhost" || a.hostname === "127.0.0.1";
    const loopB =
      b.hostname === "localhost" || b.hostname === "127.0.0.1";
    // Cursor / VS Code may register 127.0.0.1 but open localhost (or vice versa);
    // ports also change per auth attempt — treat any loopback+/callback as OK.
    if (loopA && loopB) return true;
    return a.host === b.host;
  } catch {
    return false;
  }
}

export type RegisteredClient = {
  client_id: string;
  client_name?: string;
  redirect_uris: string[];
  token_endpoint_auth_method: string;
};

export function registerClient(input: {
  redirect_uris?: string[];
  client_name?: string;
  token_endpoint_auth_method?: string;
}): RegisteredClient {
  const redirect_uris = (input.redirect_uris || []).filter(Boolean);
  if (redirect_uris.length === 0) {
    throw new Error("redirect_uris required");
  }
  for (const uri of redirect_uris) {
    try {
      const u = new URL(uri);
      const ok =
        u.protocol === "https:" ||
        isLoopbackRedirect(uri) ||
        u.protocol === "cursor:" ||
        u.protocol === "vscode:";
      if (!ok) throw new Error(`unsupported redirect_uri: ${uri}`);
    } catch (e) {
      throw e instanceof Error ? e : new Error("invalid redirect_uri");
    }
  }
  const token_endpoint_auth_method =
    input.token_endpoint_auth_method || "none";
  const client_id = signJwt(
    {
      typ: "mcp_client",
      redirect_uris,
      client_name: input.client_name || "MCP Client",
      token_endpoint_auth_method,
    },
    60 * 60 * 24 * 365 * 2,
  );
  return {
    client_id,
    client_name: input.client_name || "MCP Client",
    redirect_uris,
    token_endpoint_auth_method,
  };
}

export function readClient(clientId: string): RegisteredClient | null {
  const payload = verifyJwt(clientId);
  if (!payload || payload.typ !== "mcp_client") return null;
  const redirect_uris = Array.isArray(payload.redirect_uris)
    ? (payload.redirect_uris as string[])
    : [];
  if (redirect_uris.length === 0) return null;
  return {
    client_id: clientId,
    client_name:
      typeof payload.client_name === "string"
        ? payload.client_name
        : "MCP Client",
    redirect_uris,
    token_endpoint_auth_method:
      typeof payload.token_endpoint_auth_method === "string"
        ? payload.token_endpoint_auth_method
        : "none",
  };
}

/** CIMD: client_id is an https URL pointing at client metadata. */
export async function resolveClient(
  clientId: string,
): Promise<RegisteredClient | null> {
  const local = readClient(clientId);
  if (local) return local;
  if (!/^https:\/\//i.test(clientId)) return null;
  try {
    const res = await fetch(clientId, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      client_id?: string;
      client_name?: string;
      redirect_uris?: string[];
      token_endpoint_auth_method?: string;
    };
    const redirect_uris = json.redirect_uris || [];
    if (redirect_uris.length === 0) return null;
    return {
      client_id: clientId,
      client_name: json.client_name || "MCP Client",
      redirect_uris,
      token_endpoint_auth_method: json.token_endpoint_auth_method || "none",
    };
  } catch {
    return null;
  }
}

function pkceChallenge(verifier: string): string {
  return b64url(createHash("sha256").update(verifier).digest());
}

export function mintAuthorizationCode(input: {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  scopes: string[];
  userId?: string | null;
  resource?: string | null;
}): string {
  return signJwt(
    {
      typ: "mcp_code",
      client_id: input.clientId,
      redirect_uri: input.redirectUri,
      code_challenge: input.codeChallenge,
      code_challenge_method: input.codeChallengeMethod,
      scope: input.scopes.join(" "),
      sub: input.userId || "anonymous",
      resource: input.resource || undefined,
      jti: randomBytes(16).toString("hex"),
    },
    60 * 10,
  );
}

export function exchangeAuthorizationCode(input: {
  code: string;
  clientId: string;
  redirectUri: string;
  codeVerifier: string;
}): {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
} {
  const payload = verifyJwt(input.code);
  if (!payload || payload.typ !== "mcp_code") {
    throw new Error("invalid_grant");
  }
  if (payload.client_id !== input.clientId) throw new Error("invalid_grant");
  if (payload.redirect_uri !== input.redirectUri) {
    throw new Error("invalid_grant");
  }
  const method = String(payload.code_challenge_method || "S256");
  if (method !== "S256") throw new Error("invalid_grant");
  const expected = String(payload.code_challenge || "");
  if (pkceChallenge(input.codeVerifier) !== expected) {
    throw new Error("invalid_grant");
  }
  const scope =
    typeof payload.scope === "string" && payload.scope.trim()
      ? payload.scope
      : "mcp:read";
  const sub = typeof payload.sub === "string" ? payload.sub : "anonymous";
  const resource =
    typeof payload.resource === "string" && payload.resource.trim()
      ? payload.resource
      : "mcp";
  const expires_in = 60 * 60;
  const access_token = signJwt(
    {
      typ: "mcp_access",
      client_id: input.clientId,
      scope,
      sub,
      aud: resource,
      resource,
    },
    expires_in,
  );
  const refresh_token = signJwt(
    {
      typ: "mcp_refresh",
      client_id: input.clientId,
      scope,
      sub,
      resource,
      jti: randomBytes(12).toString("hex"),
    },
    60 * 60 * 24 * 30,
  );
  return { access_token, refresh_token, expires_in, scope };
}

export function refreshAccessToken(input: {
  refreshToken: string;
  clientId: string;
}): {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
} {
  const payload = verifyJwt(input.refreshToken);
  if (!payload || payload.typ !== "mcp_refresh") {
    throw new Error("invalid_grant");
  }
  if (payload.client_id !== input.clientId) throw new Error("invalid_grant");
  const scope =
    typeof payload.scope === "string" && payload.scope.trim()
      ? payload.scope
      : "mcp:read";
  const sub = typeof payload.sub === "string" ? payload.sub : "anonymous";
  const resource =
    typeof payload.resource === "string" && payload.resource.trim()
      ? payload.resource
      : "mcp";
  const expires_in = 60 * 60;
  const access_token = signJwt(
    {
      typ: "mcp_access",
      client_id: input.clientId,
      scope,
      sub,
      aud: resource,
      resource,
    },
    expires_in,
  );
  const refresh_token = signJwt(
    {
      typ: "mcp_refresh",
      client_id: input.clientId,
      scope,
      sub,
      resource,
      jti: randomBytes(12).toString("hex"),
    },
    60 * 60 * 24 * 30,
  );
  return { access_token, refresh_token, expires_in, scope };
}

export type VerifiedMcpAuth = {
  token: string;
  clientId: string;
  scopes: string[];
  userId?: string;
  via: "oauth" | "api_key";
};

export function verifyMcpBearer(token: string): VerifiedMcpAuth | null {
  const apiKey = process.env.MCP_API_KEY?.trim();
  if (apiKey && token === apiKey) {
    return {
      token,
      clientId: "api_key",
      scopes: [...MCP_SCOPES],
      via: "api_key",
    };
  }
  const payload = verifyJwt(token);
  if (!payload || payload.typ !== "mcp_access") return null;
  const scopeStr = typeof payload.scope === "string" ? payload.scope : "";
  const scopes = scopeStr.split(/\s+/).filter(Boolean);
  return {
    token,
    clientId:
      typeof payload.client_id === "string" ? payload.client_id : "unknown",
    scopes,
    userId: typeof payload.sub === "string" ? payload.sub : undefined,
    via: "oauth",
  };
}

export function authorizationServerMetadata(issuer: string) {
  return {
    issuer,
    authorization_endpoint: `${issuer}/api/oauth/authorize`,
    token_endpoint: `${issuer}/api/oauth/token`,
    registration_endpoint: `${issuer}/api/oauth/register`,
    revocation_endpoint: `${issuer}/api/oauth/revoke`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"],
    scopes_supported: [...MCP_SCOPES],
    client_id_metadata_document_supported: true,
  };
}

export function parseScopeParam(raw: string | null): string[] {
  if (!raw?.trim()) return ["mcp:read", "mcp:premium"];
  const asked = raw.split(/\s+/).filter(Boolean);
  const allowed = new Set<string>(MCP_SCOPES);
  const out = asked.filter((s) => allowed.has(s));
  return out.length > 0 ? out : ["mcp:read"];
}
