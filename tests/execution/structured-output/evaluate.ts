import type { EvaluationContext } from "../../../packages/core/src/types.ts";
export async function evaluate(ctx: EvaluationContext) {
  let pass = false;
  try {
    const value = JSON.parse((await ctx.read(".response.json")) || "null");
    pass =
      value?.token === ctx.test.expected.value &&
      Object.keys(value).length === 1;
  } catch {
    /* Invalid JSON fails the capability test. */
  }
  return {
    pass,
    summary: pass
      ? "Structured response matched the expected object."
      : "No valid structured final response.",
  };
}
