import { createHash, randomUUID } from "node:crypto";
import {
  cp,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { arch, release, tmpdir } from "node:os";
import { isAbsolute, join, relative, sep } from "node:path";
import { RunResult } from "../../schema/src/index.ts";
import { resultsRoot } from "./catalog.ts";
import { cleanEnvironment } from "./process.ts";
import type {
  AgentAdapter,
  AgentRunOutput,
  ConformanceTest,
  TestSetup,
} from "./types.ts";
export const sha256 = (text: string | Buffer) =>
  createHash("sha256").update(text).digest("hex");
export async function readArtifact(
  cwd: string,
  path: string,
): Promise<string | null> {
  if (
    !path ||
    path.includes("\0") ||
    path.includes(":") ||
    path.includes("\\") ||
    isAbsolute(path) ||
    path.split("/").includes("..")
  )
    throw new Error("Invalid artifact path");
  const candidate = join(cwd, path);
  try {
    const actual = await realpath(candidate);
    const rel = relative(await realpath(cwd), actual);
    if (isAbsolute(rel) || rel === ".." || rel.startsWith(`..${sep}`))
      throw new Error("Artifact escapes fixture");
    const stat = await lstat(candidate);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 1_000_000)
      throw new Error("Invalid artifact");
    return await readFile(candidate, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
export async function run(
  adapter: AgentAdapter,
  test: ConformanceTest,
  options: {
    outputDirectory?: string;
    timeoutMs?: number;
    provenance?: "official" | "community";
  } = {},
): Promise<{ result: RunResult; path: string }> {
  const detection = await adapter.detect();
  if (!detection.available || !detection.version)
    throw new Error(
      `${adapter.id}: ${detection.reason || "version unavailable"}`,
    );
  const version = detection.version;
  // Validate untrusted version before it becomes a filesystem component.
  if (!/^[a-zA-Z0-9][a-zA-Z0-9.+_-]{0,99}$/.test(version))
    throw new Error("Invalid agent version");
  const base = await mkdtemp(join(tmpdir(), "harnessfacts-"));
  const cwd = join(base, "fixture"),
    home = join(base, "home");
  const startedAt = new Date().toISOString();
  const started = performance.now();
  let output: AgentRunOutput = {
    stdout: "",
    stderr: "",
    durationMs: 0,
    exitCode: null,
  };
  let status: RunResult["result"]["status"] = "error",
    summary = "Run did not complete";
  const artifacts: { path: string; sha256: string }[] = [];
  const contents = new Map<string, string>();
  let setup: TestSetup | undefined;
  try {
    await cp(join(test.directory, "fixture"), cwd, {
      recursive: true,
      filter: async (source) => {
        if ((await lstat(source)).isSymbolicLink())
          throw new Error("Fixture symlinks are not allowed");
        return true;
      },
    });
    await mkdir(home);
    await mkdir(join(base, "tmp"));
    const env = {
      ...cleanEnvironment(),
      HOME: home,
      USERPROFILE: home,
      XDG_CONFIG_HOME: join(home, ".config"),
      XDG_DATA_HOME: join(home, ".local/share"),
      XDG_CACHE_HOME: join(home, ".cache"),
      TMPDIR: join(base, "tmp"),
      TMP: join(base, "tmp"),
      TEMP: join(base, "tmp"),
    };
    const context = {
      cwd,
      home,
      env,
      test: test.definition,
      timeoutMs: options.timeoutMs ?? 120_000,
    };
    const reason = adapter.supports(test.definition);
    if (reason) {
      status = "skipped";
      summary = reason;
    } else {
      setup = await test.setup?.(base);
      Object.assign(context, { mcp: setup?.mcp });
      await adapter.prepare(context);
      output = await adapter.run(context);
      const evaluatesExitCode = test.definition.expected.type === "exit-code";
      if (
        output.executionError ||
        output.timedOut ||
        (output.exitCode !== 0 && !evaluatesExitCode)
      ) {
        status = "error";
        summary =
          output.executionError ||
          (output.timedOut
            ? "Agent timed out or exceeded output limit"
            : `Agent exited with ${output.exitCode}`);
      } else {
        for (const [name, content] of Object.entries(
          (await setup?.evidence?.()) || {},
        ))
          contents.set(name, content);
        const evaluation = await test.evaluate({
          cwd,
          output,
          test: test.definition,
          read: async (path) => {
            const value = contents.get(path) ?? (await readArtifact(cwd, path));
            if (value !== null) contents.set(path, value);
            return value;
          },
        });
        status = evaluation.error ? "error" : evaluation.pass ? "pass" : "fail";
        summary = evaluation.summary;
      }
    }
  } catch (error) {
    status = "error";
    summary = `Harness error: ${error instanceof Error ? error.name : "unknown"}`;
  } finally {
    try {
      await setup?.dispose();
    } catch {
      status = "error";
      summary = "Fixture cleanup failed";
    } finally {
      await rm(base, { recursive: true, force: true });
    }
  }
  const secrets = Object.entries(process.env)
    .filter(
      ([key, value]) =>
        /KEY|TOKEN|SECRET|PASSWORD/.test(key) && value && value.length >= 8,
    )
    .map(([, value]) => value as string);
  const redact = (value: string) => {
    for (const secret of secrets)
      value = value.split(secret).join("[REDACTED]");
    return value.replace(
      /(?:sk-[A-Za-z0-9_-]{12,}|Bearer\s+[^\s"']+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/g,
      "[REDACTED]",
    );
  };
  summary = redact(summary);
  output.stdout = redact(output.stdout);
  output.stderr = redact(output.stderr);
  for (const [path, content] of contents) {
    const safe = redact(content);
    contents.set(path, safe);
    artifacts.push({ path, sha256: sha256(safe) });
  }
  const result = RunResult.parse({
    schema: "harnessfacts.run/v1",
    runId: randomUUID(),
    agent: { id: adapter.id, version },
    test: { id: test.definition.id, version: test.definition.version },
    environment: {
      schema: "harnessfacts.environment/v1",
      os:
        process.platform === "darwin"
          ? "macos"
          : process.platform === "win32"
            ? "windows"
            : "linux",
      osVersion: release(),
      arch: arch(),
      runtime: { bun: Bun.version },
    },
    execution: {
      startedAt,
      durationMs: performance.now() - started,
      exitCode: output.exitCode,
    },
    result: { status, summary },
    evidence: {
      stdoutSha256: sha256(output.stdout),
      stderrSha256: sha256(output.stderr),
      artifacts,
    },
    provenance: { kind: options.provenance ?? "community" },
  });
  const directory = join(
    options.outputDirectory ?? resultsRoot,
    adapter.id,
    version,
    `${result.environment.os}-${result.environment.arch}`,
    test.definition.id,
  );
  await mkdir(directory, { recursive: true });
  const path = join(directory, `${result.runId}.json`);
  const evidenceDir = join(directory, result.runId);
  await mkdir(evidenceDir);
  await writeFile(join(evidenceDir, "stdout.txt"), output.stdout);
  await writeFile(join(evidenceDir, "stderr.txt"), output.stderr);
  for (const [name, value] of contents) {
    const target = join(evidenceDir, "artifacts", name);
    await mkdir(join(target, ".."), { recursive: true });
    await writeFile(target, value);
  }
  await writeFile(path, `${JSON.stringify(result, null, 2)}\n`, { flag: "wx" });
  return { result, path };
}
export * from "./types.ts";
