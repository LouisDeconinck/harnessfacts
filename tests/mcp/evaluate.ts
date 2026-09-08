import type { EvaluationContext } from "../../packages/core/src/types.ts";
export async function evaluate(ctx: EvaluationContext) {
  const receipt = await ctx.read("mcp-receipt.jsonl");
  const value = (await ctx.read("result.txt"))?.trim();
  const calls = (receipt || "")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  const pass = calls.some(
    (call) =>
      call.schema === "harnessfacts.mcp-receipt/v1" &&
      call.tool === "get_token" &&
      call.token === value,
  );
  return {
    pass,
    summary: pass
      ? "MCP tool invocation and returned token verified."
      : "No matching tool receipt and output token.",
  };
}
