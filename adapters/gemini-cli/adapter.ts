import { join } from "node:path";
import { execute } from "../../packages/core/src/process.ts";
import type { AgentAdapter } from "../../packages/core/src/types.ts";
import {
  cliVersion,
  credentials,
  detect,
  instructions,
  jsonFile,
  skill,
} from "../shared.ts";
export const adapter: AgentAdapter = {
  id: "gemini-cli",
  detect: () => detect("gemini"),
  getVersion: () => cliVersion("gemini"),
  async isAuthenticated() {
    return !!process.env.GEMINI_API_KEY;
  },
  supports() {
    return undefined;
  },
  async prepare(ctx) {
    credentials(ctx, ["GEMINI_API_KEY"]);
    await instructions(ctx, "GEMINI.md");
    await skill(ctx, ".gemini/skills");
    await jsonFile(join(ctx.home, ".gemini/settings.json"), {
      security: { auth: { selectedType: "gemini-api-key" } },
      telemetry: { enabled: false },
      mcpServers: ctx.mcp
        ? {
            harnessfacts: ctx.mcp.url
              ? { httpUrl: ctx.mcp.url, trust: true }
              : { command: ctx.mcp.command, args: ctx.mcp.args, trust: true },
          }
        : {},
    });
  },
  async run(ctx) {
    const structured = ctx.test.id === "execution.structured-output";
    const out = await execute(
      [
        "gemini",
        "--prompt",
        ctx.test.prompt,
        "--approval-mode",
        "yolo",
        ...(structured ? ["--output-format", "json"] : []),
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
          JSON.parse(envelope.response),
        );
      } catch {
        /* Evaluator reports invalid structured output. */
      }
    }
    return out;
  },
};
