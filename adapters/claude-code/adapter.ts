import { join } from "node:path";
import { execute } from "../../packages/core/src/process.ts";
import type { AgentAdapter } from "../../packages/core/src/types.ts";
import {
  authFile,
  cliVersion,
  credentials,
  detect,
  instructions,
  jsonFile,
  outputSchema,
  skill,
} from "../shared.ts";
export const adapter: AgentAdapter = {
  id: "claude-code",
  detect: () => detect("claude"),
  getVersion: () => cliVersion("claude"),
  async isAuthenticated() {
    return process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_CODE_OAUTH_TOKEN
      ? true
      : "unknown";
  },
  supports() {
    return undefined;
  },
  async prepare(ctx) {
    credentials(ctx, ["ANTHROPIC_API_KEY", "CLAUDE_CODE_OAUTH_TOKEN"]);
    await authFile(ctx, ".claude/.credentials.json");
    await instructions(ctx, "CLAUDE.md");
    await skill(ctx, ".claude/skills");
    await jsonFile(join(ctx.home, "mcp.json"), {
      mcpServers: ctx.mcp
        ? {
            harnessfacts: ctx.mcp.url
              ? { type: "http", url: ctx.mcp.url }
              : { command: ctx.mcp.command, args: ctx.mcp.args },
          }
        : {},
    });
  },
  async run(ctx) {
    const structured = ctx.test.id === "execution.structured-output";
    const out = await execute(
      [
        "claude",
        "-p",
        ctx.test.prompt,
        "--permission-mode",
        "acceptEdits",
        "--allowedTools",
        "Read,Write,Edit,Bash,mcp__harnessfacts__get_token",
        "--no-session-persistence",
        "--setting-sources",
        "project",
        "--strict-mcp-config",
        "--mcp-config",
        join(ctx.home, "mcp.json"),
        ...(structured
          ? [
              "--output-format",
              "json",
              "--json-schema",
              JSON.stringify(outputSchema),
            ]
          : []),
      ],
      ctx.cwd,
      ctx.env,
      ctx.timeoutMs,
    );
    if (structured && out.exitCode === 0) {
      try {
        const envelope = JSON.parse(out.stdout);
        await jsonFile(
          join(ctx.cwd, ".response.json"),
          envelope.structured_output,
        );
      } catch {
        /* Evaluator reports missing structured output. */
      }
    }
    return out;
  },
};
