import type { EvaluationContext } from "../../../packages/core/src/types.ts";

export { setup } from "./setup.ts";

export async function evaluate(ctx: EvaluationContext) {
  const pass =
    (await ctx.read("result.txt"))?.trim() === ctx.test.expected.value &&
    (await ctx.read("primary-result.txt"))?.trim() === "PRIMARY" &&
    (await ctx.read("worktree-root.txt"))
      ?.trim()
      .replaceAll("\\", "/")
      .endsWith("/fixture");
  return {
    pass,
    summary: pass
      ? "The requested file was written in the linked worktree."
      : "The worktree and primary checkout did not show the expected separation.",
  };
}
