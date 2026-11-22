import { metadataCorsOptionsRequestHandler } from "mcp-handler";
import {
  authorizationServerMetadata,
  mcpIssuer,
} from "@/lib/mcp-oauth";

export const runtime = "nodejs";

const cors = metadataCorsOptionsRequestHandler();

export async function GET(req: Request) {
  const issuer = mcpIssuer(req);
  return Response.json(authorizationServerMetadata(issuer), {
    headers: {
      "Cache-Control": "public, max-age=60",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function OPTIONS() {
  return cors();
}
