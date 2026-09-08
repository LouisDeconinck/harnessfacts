import { join } from "node:path";
import { execute } from "../../packages/core/src/process.ts";
import type { AgentAdapter } from "../../packages/core/src/types.ts";
import {
  authFile,
  cliVersion,
  credentials,
  detect,
  jsonFile,
  skill,
} from "../shared.ts";
export const adapter: AgentAdapter = {
  id: "opencode",
  detect: () => detect("opencode"),
  getVersion: () => cliVersion("opencode"),
  async isAuthenticated() {
    return "unknown";
  },
  supports() {
    return undefined;
  },
  async prepare(ctx) {
    credentials(ctx, ["ANTHROPIC_API_KEY", "OPENAI_API_KEY", "GEMINI_API_KEY"]);
    await authFile(ctx, ".local/share/opencode/auth.json");
    await skill(ctx, ".opencode/skills");
    ctx.env.OPENCODE_DISABLE_AUTOUPDATE = "true";
    await jsonFile(join(ctx.cwd, "opencode.json"), {
      $schema: "https://opencode.ai/config.json",
      share: "disabled",
      permission: { edit: "allow", bash: "allow", external_directory: "deny" },
      mcp: ctx.mcp
        ? {
            harnessfacts: ctx.mcp.url
              ? { type: "remote", url: ctx.mcp.url, enabled: true }
              : {
                  type: "local",
                  command: [ctx.mcp.command, ...ctx.mcp.args],
                  enabled: true,
                },
          }
        : {},
    });
  },
  async run(ctx) {
    const structured = ctx.test.id === "execution.structured-output";
    const out = await execute(
      [
        "opencode",
        "run",
        "--pure",
        "--format",
        "json",
        "--dir",
        ctx.cwd,
        ctx.test.prompt,
      ],
      ctx.cwd,
      ctx.env,
      ctx.timeoutMs,
    );
    if (structured && out.exitCode === 0) {
      try {
        const text = out.stdout
          .trim()
          .split("\n")
          .map((line) => JSON.parse(line))
          .filter((event) => event.type === "text")
          .map((event) => event.part.text)
          .join("");
        await jsonFile(join(ctx.cwd, ".response.json"), JSON.parse(text));
      } catch {
        /* Evaluator reports invalid structured output. */
      }
    }
    return out;
  },
};
