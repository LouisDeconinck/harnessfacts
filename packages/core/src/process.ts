import { spawn } from "node:child_process";
import type { AgentRunOutput } from "./types.ts";
export function cleanEnvironment(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const key of [
    "PATH",
    "SystemRoot",
    "WINDIR",
    "PATHEXT",
    "LANG",
    "LC_ALL",
    "TERM",
  ])
    if (process.env[key]) env[key] = process.env[key] as string;
  env.NO_COLOR = "1";
  return env;
}
export function execute(
  command: string[],
  cwd: string,
  env: Record<string, string>,
  timeoutMs = 120_000,
): Promise<AgentRunOutput> {
  return new Promise((resolve, reject) => {
    const started = performance.now();
    let stdout = "",
      stderr = "",
      timedOut = false,
      overflow = false;
    const child = spawn(command[0], command.slice(1), {
      cwd,
      env,
      stdio: ["ignore", "pipe", "pipe"],
      detached: process.platform !== "win32",
    });
    const kill = () => {
      if (child.pid && process.platform !== "win32") {
        try {
          process.kill(-child.pid, "SIGKILL");
        } catch {
          child.kill("SIGKILL");
        }
      } else child.kill("SIGKILL");
    };
    const timer = setTimeout(() => {
      timedOut = true;
      kill();
    }, timeoutMs);
    const capture = (chunk: Buffer, stream: "stdout" | "stderr") => {
      if (stdout.length + stderr.length + chunk.length > 4_000_000) {
        overflow = true;
        kill();
        return;
      }
      if (stream === "stdout") stdout += chunk.toString();
      else stderr += chunk.toString();
    };
    child.stdout.on("data", (chunk) => capture(chunk, "stdout"));
    child.stderr.on("data", (chunk) => capture(chunk, "stderr"));
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (overflow) stderr += "\nHarness output limit exceeded.";
      resolve({
        stdout,
        stderr,
        exitCode: code,
        durationMs: performance.now() - started,
        timedOut: timedOut || overflow,
      });
    });
  });
}
