import type { EvaluationContext } from "../../../packages/core/src/types.ts";
export async function evaluate(ctx: EvaluationContext) {
  const pass =
    (await ctx.read("src/result.txt"))?.trim() === ctx.test.expected.value;
  return {
    pass,
    summary: pass
      ? "Expected token was written."
      : "Expected token was not written.",
  };
}
