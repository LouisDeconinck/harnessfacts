import { join } from "node:path";
import { execute } from "../../packages/core/src/process.ts";
import type { AgentAdapter } from "../../packages/core/src/types.ts";
import { cliVersion, credentials, detect } from "../shared.ts";
export const adapter: AgentAdapter = {
  id: "aider",
  detect: () => detect("aider"),
  getVersion: () => cliVersion("aider"),
  async isAuthenticated() {
    return process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY
      ? true
      : "unknown";
  },
  supports(test) {
    return ["execution.headless", "instructions.root"].includes(test.id)
      ? undefined
      : "No verified adapter mapping for this interaction";
  },
  async prepare(ctx) {
    credentials(ctx, ["OPENAI_API_KEY", "ANTHROPIC_API_KEY"]);
    await Bun.write(
      join(ctx.cwd, ".aider.conf.yml"),
      ctx.test.id === "instructions.root" ? "read: [AGENTS.md]\n" : "{}",
    );
  },
  async run(ctx) {
    return execute(
      [
        "aider",
        "--message",
        ctx.test.prompt,
        "--yes-always",
        "--no-auto-commits",
        "--no-check-update",
        "--no-analytics",
        "--no-git",
        "--config",
        join(ctx.cwd, ".aider.conf.yml"),
        "result.txt",
      ],
      ctx.cwd,
      ctx.env,
      ctx.timeoutMs,
    );
  },
};
