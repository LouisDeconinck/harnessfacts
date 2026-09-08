import { expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { adapter } from "../adapters/antigravity-cli/adapter.ts";
import { tests } from "../packages/core/src/catalog.ts";

test("Antigravity prepares native skills and both MCP transports in an isolated home", async () => {
  const base = await mkdtemp(join(tmpdir(), "hf-agy-check-"));
  const cwd = join(base, "fixture");
  const home = join(base, "home");
  const definition = (await tests()).find(
    (t) => t.definition.id === "skills.discovery",
  )!.definition;
  try {
    await mkdir(cwd);
    for (const mcp of [
      { command: "bun", args: ["server.ts"] },
      { command: "bun", args: [], url: "http://127.0.0.1:1234/mcp" },
    ]) {
      await writeFile(join(cwd, "skill-source.md"), "test-only skill");
      await adapter.prepare({ cwd, home, env: {}, test: definition, mcp });
      expect(
        await Bun.file(join(cwd, ".agents/skills/hf-token/SKILL.md")).text(),
      ).toBe("test-only skill");
      const settings = await Bun.file(
        join(home, ".gemini/config/mcp_config.json"),
      ).json();
      expect(settings.mcpServers.harnessfacts).toEqual(
        mcp.url
          ? { serverUrl: mcp.url }
          : { command: mcp.command, args: mcp.args },
      );
    }
  } finally {
    await rm(base, { recursive: true, force: true });
  }
});
