import { registerClient } from "@/lib/mcp-oauth";

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

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      redirect_uris?: string[];
      client_name?: string;
      token_endpoint_auth_method?: string;
      grant_types?: string[];
      response_types?: string[];
      client_uri?: string;
    };

    const client = registerClient({
      redirect_uris: body.redirect_uris,
      client_name: body.client_name,
      token_endpoint_auth_method: body.token_endpoint_auth_method || "none",
    });

    return Response.json(
      {
        client_id: client.client_id,
        client_name: client.client_name,
        redirect_uris: client.redirect_uris,
        token_endpoint_auth_method: client.token_endpoint_auth_method,
        grant_types: body.grant_types || [
          "authorization_code",
          "refresh_token",
        ],
        response_types: body.response_types || ["code"],
        client_id_issued_at: Math.floor(Date.now() / 1000),
      },
      { status: 201, headers: corsHeaders() },
    );
  } catch (e) {
    return Response.json(
      {
        error: "invalid_client_metadata",
        error_description: e instanceof Error ? e.message : "Invalid request",
      },
      { status: 400, headers: corsHeaders() },
    );
  }
}
