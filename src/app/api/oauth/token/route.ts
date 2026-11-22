import {
  exchangeAuthorizationCode,
  refreshAccessToken,
} from "@/lib/mcp-oauth";

export const runtime = "nodejs";

function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

async function readForm(req: Request): Promise<Record<string, string>> {
  const ctype = req.headers.get("content-type") || "";
  if (ctype.includes("application/json")) {
    const json = (await req.json()) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(json)) {
      if (typeof v === "string") out[k] = v;
    }
    return out;
  }
  const text = await req.text();
  const params = new URLSearchParams(text);
  const out: Record<string, string> = {};
  params.forEach((v, k) => {
    out[k] = v;
  });
  return out;
}

export async function POST(req: Request) {
  try {
    const form = await readForm(req);
    const grant = form.grant_type;
    const clientId = form.client_id;

    if (!clientId) {
      return Response.json(
        { error: "invalid_request", error_description: "client_id required" },
        { status: 400, headers: corsHeaders() },
      );
    }

    if (grant === "authorization_code") {
      const code = form.code;
      const redirectUri = form.redirect_uri;
      const codeVerifier = form.code_verifier;
      if (!code || !redirectUri || !codeVerifier) {
        return Response.json(
          {
            error: "invalid_request",
            error_description: "code, redirect_uri, code_verifier required",
          },
          { status: 400, headers: corsHeaders() },
        );
      }
      const tokens = exchangeAuthorizationCode({
        code,
        clientId,
        redirectUri,
        codeVerifier,
      });
      return Response.json(
        {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_type: "Bearer",
          expires_in: tokens.expires_in,
          scope: tokens.scope,
        },
        { headers: corsHeaders() },
      );
    }

    if (grant === "refresh_token") {
      const refreshToken = form.refresh_token;
      if (!refreshToken) {
        return Response.json(
          {
            error: "invalid_request",
            error_description: "refresh_token required",
          },
          { status: 400, headers: corsHeaders() },
        );
      }
      const tokens = refreshAccessToken({ refreshToken, clientId });
      return Response.json(
        {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_type: "Bearer",
          expires_in: tokens.expires_in,
          scope: tokens.scope,
        },
        { headers: corsHeaders() },
      );
    }

    return Response.json(
      {
        error: "unsupported_grant_type",
        error_description: "Use authorization_code or refresh_token",
      },
      { status: 400, headers: corsHeaders() },
    );
  } catch {
    return Response.json(
      { error: "invalid_grant", error_description: "Token exchange failed" },
      { status: 400, headers: corsHeaders() },
    );
  }
}
