import type { EvaluationContext } from "../../../packages/core/src/types.ts";

export { setup } from "./setup.ts";

export async function evaluate(ctx: EvaluationContext) {
  let report: { parent: string; sibling: string } | null = null;
  try {
    report = JSON.parse((await ctx.read("scope-report.json")) || "null");
  } catch {
    /* Invalid harness evidence fails the observation. */
  }
  const pass =
    (await ctx.read("nested/result.txt"))?.trim() === ctx.test.expected.value &&
    report?.parent === "PARENT" &&
    report?.sibling === "SIBLING";
  return {
    pass,
    summary: pass
      ? "The bounded task changed the nested target and preserved sentinels."
      : "The bounded task or sentinel checks did not match.",
  };
}
