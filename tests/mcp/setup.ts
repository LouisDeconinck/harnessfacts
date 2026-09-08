import { randomUUID } from "node:crypto";
import { copyFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dispatch } from "./server.ts";
export async function setupMcp(base: string, transport: "stdio" | "http") {
  const token = randomUUID(),
    receipt = join(base, "mcp-receipt.jsonl"),
    script = join(base, "mcp-server.ts");
  await copyFile(fileURLToPath(new URL("server.ts", import.meta.url)), script);
  const mcp = {
    command: process.execPath,
    args: [script, token, receipt],
    url: undefined as string | undefined,
  };
  const endpoint = `/mcp/${randomUUID()}`;
  // ponytail: stateless JSON transport; add SSE only for a test requiring server notifications.
  const server =
    transport === "http"
      ? Bun.serve({
          hostname: "127.0.0.1",
          port: 0,
          maxRequestBodySize: 65536,
          async fetch(request) {
            if (new URL(request.url).pathname !== endpoint)
              return new Response(null, { status: 404 });
            if (
              request.headers.has("origin") &&
              request.headers.get("origin") !== new URL(request.url).origin
            )
              return new Response(null, { status: 403 });
            if (request.method !== "POST")
              return new Response(null, {
                status: 405,
                headers: { Allow: "POST" },
              });
            if (
              !request.headers.get("content-type")?.includes("application/json")
            )
              return new Response(null, { status: 415 });
            try {
              const result = await dispatch(
                await request.json(),
                token,
                receipt,
              );
              return result
                ? Response.json(result)
                : new Response(null, { status: 202 });
            } catch {
              return new Response(null, { status: 400 });
            }
          },
        })
      : undefined;
  if (server) mcp.url = `http://127.0.0.1:${server.port}${endpoint}`;
  return {
    mcp,
    async evidence() {
      return {
        "mcp-receipt.jsonl": (await Bun.file(receipt).exists())
          ? await Bun.file(receipt).text()
          : "",
      };
    },
    async dispose() {
      await server?.stop(true);
    },
  };
}
