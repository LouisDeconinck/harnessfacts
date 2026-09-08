import { copyFile, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { cleanEnvironment, execute } from "../../packages/core/src/process.ts";
import type { AgentAdapter } from "../../packages/core/src/types.ts";
import { credentials, jsonFile, outputSchema, skill } from "../shared.ts";
export const adapter: AgentAdapter = {
  id: "codex",
  async detect() {
    try {
      return { available: true, version: await this.getVersion() };
    } catch {
      return { available: false, reason: "Codex executable unavailable" };
    }
  },
  async getVersion() {
    const out = await execute(
      ["codex", "--version"],
      process.cwd(),
      cleanEnvironment(),
      10_000,
    );
    const match = out.stdout.match(/^codex-cli (\S+)\s*$/);
    if (out.exitCode !== 0 || !match)
      throw new Error("Cannot determine exact Codex version");
    return match[1];
  },
  async isAuthenticated() {
    const env = cleanEnvironment();
    env.HOME = homedir();
    if (process.env.CODEX_HOME) env.CODEX_HOME = process.env.CODEX_HOME;
    const out = await execute(
      ["codex", "login", "status"],
      process.cwd(),
      env,
      10_000,
    );
    return out.exitCode === 0;
  },
  supports() {
    return undefined;
  },
  async prepare(ctx) {
    credentials(ctx, ["OPENAI_API_KEY"]);
    await skill(ctx, ".agents/skills");
    if (ctx.test.id === "execution.structured-output")
      await jsonFile(join(ctx.home, "output-schema.json"), outputSchema);
    ctx.env.CODEX_HOME = join(ctx.home, ".codex");
    await mkdir(ctx.env.CODEX_HOME, { recursive: true });
    try {
      await copyFile(
        join(process.env.CODEX_HOME || join(homedir(), ".codex"), "auth.json"),
        join(ctx.env.CODEX_HOME, "auth.json"),
      );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  },
  async run(ctx) {
    return execute(
      [
        "codex",
        "exec",
        "--ephemeral",
        "--ignore-user-config",
        "--ignore-rules",
        "--skip-git-repo-check",
        "--sandbox",
        "workspace-write",
        "--color",
        "never",
        "-C",
        ctx.cwd,
        ...(ctx.mcp
          ? [
              "-c",
              'mcp_servers.harnessfacts.tools.get_token.approval_mode="approve"',
            ]
          : []),
        ...(ctx.mcp
          ? ctx.mcp.url
            ? [
                "-c",
                `mcp_servers.harnessfacts.url=${JSON.stringify(ctx.mcp.url)}`,
              ]
            : [
                "-c",
                `mcp_servers.harnessfacts.command=${JSON.stringify(ctx.mcp.command)}`,
                "-c",
                `mcp_servers.harnessfacts.args=${JSON.stringify(ctx.mcp.args)}`,
              ]
          : []),
        ...(ctx.test.id === "execution.structured-output"
          ? [
              "--output-schema",
              join(ctx.home, "output-schema.json"),
              "--output-last-message",
              join(ctx.cwd, ".response.json"),
            ]
          : []),
        ctx.test.prompt,
      ],
      ctx.cwd,
      ctx.env,
      ctx.timeoutMs,
    );
  },
};
