import { expect, test } from "bun:test";
import { mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { tests } from "../packages/core/src/catalog.ts";
import { readArtifact, run, sha256 } from "../packages/core/src/index.ts";
import { cleanEnvironment, execute } from "../packages/core/src/process.ts";
import type { AgentAdapter } from "../packages/core/src/types.ts";
import { RunResult } from "../packages/schema/src/index.ts";

test("isolated core flow records pass, fail, error, skipped and verifiable evidence", async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), "hf-check-"));
  const fixture = (await tests()).find(
    (t) => t.definition.id === "instructions.nested",
  )!;
  let cwd = "",
    mode: RunResult["result"]["status"] = "pass";
  const adapter: AgentAdapter = {
    id: "mock",
    async detect() {
      return { available: true, version: "1.0.0" };
    },
    async getVersion() {
      return "1.0.0";
    },
    async isAuthenticated() {
      return true;
    },
    supports() {
      return mode === "skipped" ? "Not mapped" : undefined;
    },
    async prepare(ctx) {
      cwd = ctx.cwd;
      expect(ctx.cwd).not.toBe(process.cwd());
      expect(ctx.env.HOME).not.toBe(process.env.HOME);
      expect(ctx.env.GITHUB_TOKEN).toBeUndefined();
    },
    async run(ctx) {
      await writeFile(
        join(ctx.cwd, "src/result.txt"),
        mode === "pass" ? "NESTED\n" : "WRONG",
      );
      return {
        exitCode: mode === "error" ? 1 : 0,
        stdout: "test only",
        stderr: "",
        durationMs: 1,
      };
    },
  };
  try {
    for (mode of ["pass", "fail", "error", "skipped"] as const) {
      const { result, path } = await run(adapter, fixture, { outputDirectory });
      expect(result.result.status).toBe(mode);
      expect(RunResult.parse(JSON.parse(await readFile(path, "utf8")))).toEqual(
        result,
      );
      expect(result.evidence.stdoutSha256).toBe(
        sha256(mode === "skipped" ? "" : "test only"),
      );
      expect(await Bun.file(join(cwd, "src/task.txt")).exists()).toBe(false);
      expect(
        RunResult.safeParse({ ...result, agent: { id: "mock" } }).success,
      ).toBe(false);
    }
    mode = "pass";
    const executeRun = adapter.run;
    adapter.run = async (ctx) => ({
      ...(await executeRun(ctx)),
      executionError: "Native execution envelope reported an error",
    });
    const { result } = await run(adapter, fixture, { outputDirectory });
    expect(result.execution.exitCode).toBe(0);
    expect(result.result.status).toBe("error");
  } finally {
    await rm(outputDirectory, { recursive: true, force: true });
  }
});

test("artifact boundary rejects symlinks and process execution times out", async () => {
  const dir = await mkdtemp(join(tmpdir(), "hf-boundary-"));
  try {
    await symlink("/etc/hosts", join(dir, "escape"));
    await expect(readArtifact(dir, "escape")).rejects.toThrow();
    const out = await execute(
      [process.execPath, "-e", "setInterval(()=>{},1000)"],
      dir,
      cleanEnvironment(),
      50,
    );
    expect(out.timedOut).toBe(true);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("exit, worktree, and scope tests evaluate through the generic core", async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), "hf-new-tests-"));
  const selected = (await tests()).filter((test) =>
    [
      "execution.exit-success",
      "execution.exit-failure",
      "git.worktree-awareness",
      "git.scope-boundary",
    ].includes(test.definition.id),
  );
  const adapter: AgentAdapter = {
    id: "mock-new-tests",
    async detect() {
      return { available: true, version: "1.0.0" };
    },
    async getVersion() {
      return "1.0.0";
    },
    async isAuthenticated() {
      return true;
    },
    supports() {
      return undefined;
    },
    async prepare() {},
    async run(ctx) {
      if (ctx.test.id === "execution.exit-success")
        await writeFile(join(ctx.cwd, "result.txt"), "EXIT_SUCCESS\n");
      if (ctx.test.id === "execution.exit-failure")
        await writeFile(join(ctx.cwd, "result.txt"), "EXIT_FAILURE_REACHED\n");
      if (ctx.test.id === "git.worktree-awareness")
        await writeFile(join(ctx.cwd, "result.txt"), "WORKTREE\n");
      if (ctx.test.id === "git.scope-boundary")
        await writeFile(join(ctx.cwd, "nested/result.txt"), "SCOPE\n");
      return {
        exitCode: ctx.test.id === "execution.exit-failure" ? 17 : 0,
        stdout: "mock",
        stderr: "",
        durationMs: 1,
      };
    },
  };
  try {
    for (const test of selected) {
      const result = await run(adapter, test, { outputDirectory });
      expect(result.result.result.status).toBe("pass");
    }
  } finally {
    await rm(outputDirectory, { recursive: true, force: true });
  }
});
