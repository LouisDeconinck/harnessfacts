import type { EvaluationContext } from "../../../packages/core/src/types.ts";

export async function evaluate(ctx: EvaluationContext) {
  const reached =
    (await ctx.read("result.txt"))?.trim() === "EXIT_FAILURE_REACHED";
  if (!reached)
    return {
      pass: false,
      error: true,
      summary: "The deterministic failing task was not reached.",
    };
  const pass = ctx.output.exitCode !== null && ctx.output.exitCode !== 0;
  return {
    pass,
    summary: pass
      ? "Reached task failure returned a non-zero exit code."
      : "Reached task failure returned exit code 0.",
  };
}
