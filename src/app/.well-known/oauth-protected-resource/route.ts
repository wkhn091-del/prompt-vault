import {
  metadataCorsOptionsRequestHandler,
  protectedResourceHandler,
} from "mcp-handler";
import { mcpIssuer, mcpResourceUrl } from "@/lib/mcp-oauth";

export const runtime = "nodejs";

const cors = metadataCorsOptionsRequestHandler();

export async function GET(req: Request) {
  const issuer = mcpIssuer(req);
  const resource = mcpResourceUrl(req);
  const handler = protectedResourceHandler({
    authServerUrls: [issuer],
    resourceUrl: resource,
  });
  return handler(req);
}

export async function OPTIONS() {
  return cors();
}
