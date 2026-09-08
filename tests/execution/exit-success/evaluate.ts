import type { EvaluationContext } from "../../../packages/core/src/types.ts";

export async function evaluate(ctx: EvaluationContext) {
  const pass =
    ctx.output.exitCode === 0 &&
    (await ctx.read("result.txt"))?.trim() === "EXIT_SUCCESS";
  return {
    pass,
    summary: pass
      ? "Successful task returned exit code 0."
      : "Successful task did not produce the expected zero exit and file result.",
  };
}
