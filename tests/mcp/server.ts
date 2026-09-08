import { appendFile } from "node:fs/promises";
import { createInterface } from "node:readline";
export async function dispatch(
  message: unknown,
  token: string,
  receipt: string,
): Promise<unknown> {
  if (!message || typeof message !== "object" || Array.isArray(message))
    return {
      jsonrpc: "2.0",
      id: null,
      error: { code: -32600, message: "Invalid Request" },
    };
  const req = message as {
    jsonrpc?: string;
    id?: string | number;
    method?: string;
    params?: {
      protocolVersion?: string;
      name?: string;
      arguments?: Record<string, unknown>;
    };
  };
  if (req.jsonrpc !== "2.0" || typeof req.method !== "string")
    return {
      jsonrpc: "2.0",
      id: req.id ?? null,
      error: { code: -32600, message: "Invalid Request" },
    };
  if (req.id === undefined) return null;
  let result: unknown;
  switch (req.method) {
    case "initialize":
      result = {
        protocolVersion: ["2024-11-05", "2025-03-26", "2025-06-18"].includes(
          req.params?.protocolVersion || "",
        )
          ? req.params?.protocolVersion
          : "2025-03-26",
        capabilities: { tools: {} },
        serverInfo: { name: "harnessfacts-fixture", version: "1.0.0" },
      };
      break;
    case "ping":
      result = {};
      break;
    case "tools/list":
      result = {
        tools: [
          {
            name: "get_token",
            description: "Return the HarnessFacts fixture token.",
            inputSchema: {
              type: "object",
              properties: {},
              additionalProperties: false,
            },
          },
        ],
      };
      break;
    case "tools/call":
      if (
        req.params?.name !== "get_token" ||
        Object.keys(req.params.arguments || {}).length
      )
        return {
          jsonrpc: "2.0",
          id: req.id,
          error: { code: -32602, message: "Unknown tool or invalid arguments" },
        };
      await appendFile(
        receipt,
        `${JSON.stringify({ schema: "harnessfacts.mcp-receipt/v1", method: "tools/call", tool: "get_token", token })}\n`,
      );
      result = { content: [{ type: "text", text: token }] };
      break;
    default:
      return {
        jsonrpc: "2.0",
        id: req.id,
        error: { code: -32601, message: "Method not found" },
      };
  }
  return { jsonrpc: "2.0", id: req.id, result };
}
if (import.meta.main) {
  const [, , token, receipt] = process.argv;
  for await (const line of createInterface({
    input: process.stdin,
    crlfDelay: Infinity,
  })) {
    try {
      if (line.length > 65536) throw new Error("Too large");
      const reply = await dispatch(JSON.parse(line), token, receipt);
      if (reply) console.log(JSON.stringify(reply));
    } catch {
      console.log(
        JSON.stringify({
          jsonrpc: "2.0",
          id: null,
          error: { code: -32700, message: "Parse error" },
        }),
      );
    }
  }
}
