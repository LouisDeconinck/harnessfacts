import { copyFile, mkdir, rename } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { cleanEnvironment, execute } from "../packages/core/src/process.ts";
import type { AdapterPrepareContext } from "../packages/core/src/types.ts";
export async function cliVersion(command: string) {
  const out = await execute(
    [command, "--version"],
    process.cwd(),
    cleanEnvironment(),
    10_000,
  );
  const version = out.stdout.match(/\b\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?/);
  if (out.exitCode !== 0 || !version)
    throw new Error(`Cannot determine ${command} version`);
  return version[0];
}
export async function detect(command: string) {
  try {
    return { available: true, version: await cliVersion(command) };
  } catch {
    return { available: false, reason: `${command} executable unavailable` };
  }
}
export function credentials(ctx: AdapterPrepareContext, keys: string[]) {
  for (const key of keys)
    if (process.env[key]) ctx.env[key] = process.env[key] as string;
}
export async function authFile(
  ctx: AdapterPrepareContext,
  source: string,
  destination = source,
) {
  const target = join(ctx.home, destination);
  await mkdir(join(target, ".."), { recursive: true });
  try {
    await copyFile(join(homedir(), source), target);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}
export async function instructions(ctx: AdapterPrepareContext, name: string) {
  for (const dir of [ctx.cwd, join(ctx.cwd, "src")]) {
    try {
      await rename(join(dir, "AGENTS.md"), join(dir, name));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
}
export async function skill(ctx: AdapterPrepareContext, directory: string) {
  if (ctx.test.id !== "skills.discovery") return;
  await mkdir(join(ctx.cwd, directory, "hf-token"), { recursive: true });
  await rename(
    join(ctx.cwd, "skill-source.md"),
    join(ctx.cwd, directory, "hf-token/SKILL.md"),
  );
}
export async function jsonFile(path: string, value: unknown) {
  await mkdir(join(path, ".."), { recursive: true });
  await Bun.write(path, JSON.stringify(value));
}
export const outputSchema = {
  type: "object",
  properties: { token: { type: "string" } },
  required: ["token"],
  additionalProperties: false,
};
