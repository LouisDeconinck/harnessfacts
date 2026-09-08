import { join } from "node:path";
import { execute } from "../../packages/core/src/process.ts";
import type { AgentAdapter } from "../../packages/core/src/types.ts";
import {
  cliVersion,
  credentials,
  detect,
  jsonFile,
  outputSchema,
  skill,
} from "../shared.ts";

export const adapter: AgentAdapter = {
  id: "antigravity-cli",
  detect: () => detect("agy"),
  getVersion: () => cliVersion("agy"),
  async isAuthenticated() {
    return "unknown";
  },
  supports() {
    return undefined;
  },
  async prepare(ctx) {
    // Allow native Linux Secret Service authentication without copying user configuration.
    credentials(ctx, ["DBUS_SESSION_BUS_ADDRESS"]);
    await skill(ctx, ".agents/skills");
    await jsonFile(join(ctx.home, ".gemini/config/mcp_config.json"), {
      mcpServers: ctx.mcp
        ? {
            harnessfacts: ctx.mcp.url
              ? { serverUrl: ctx.mcp.url }
              : { command: ctx.mcp.command, args: ctx.mcp.args },
          }
        : {},
    });
  },
  async run(ctx) {
    const structured = ctx.test.id === "execution.structured-output";
    const out = await execute(
      [
        "agy",
        "--print",
        ctx.test.prompt,
        "--output-format",
        "json",
        "--dangerously-skip-permissions",
        "--print-timeout",
        `${ctx.timeoutMs}ms`,
        ...(structured ? ["--json-schema", JSON.stringify(outputSchema)] : []),
      ],
      ctx.cwd,
      ctx.env,
      ctx.timeoutMs,
    );
    if (out.exitCode === 0 && !out.timedOut) {
      try {
        const envelope = JSON.parse(out.stdout);
        if (envelope.status !== "SUCCESS" || envelope.error)
          out.executionError =
            "Antigravity did not report a successful terminal status; inspect stdout.";
        else if (structured && envelope.structured_output)
          await jsonFile(
            join(ctx.cwd, ".response.json"),
            envelope.structured_output,
          );
      } catch {
        out.executionError =
          "Antigravity returned an invalid JSON execution envelope.";
      }
    }
    return out;
  },
};
