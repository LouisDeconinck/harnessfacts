import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  cleanEnvironment,
  execute,
} from "../../../packages/core/src/process.ts";

async function git(cwd: string, args: string[]) {
  const result = await execute(
    ["git", ...args],
    cwd,
    cleanEnvironment(),
    10_000,
  );
  if (result.exitCode !== 0) throw new Error(`git ${args[0]} failed`);
}

export async function setup(base: string) {
  const fixture = join(base, "fixture");
  const sibling = join(base, "sibling");
  await mkdir(sibling);
  await writeFile(join(base, "parent-sentinel.txt"), "PARENT\n");
  await writeFile(join(sibling, "sentinel.txt"), "SIBLING\n");
  await git(fixture, ["init"]);
  await git(fixture, ["config", "user.email", "harnessfacts@example.invalid"]);
  await git(fixture, ["config", "user.name", "HarnessFacts"]);
  await git(fixture, ["add", "."]);
  await git(fixture, ["commit", "-m", "fixture"]);
  return {
    async evidence() {
      return {
        "scope-report.json": JSON.stringify({
          parent: (
            await readFile(join(base, "parent-sentinel.txt"), "utf8")
          ).trim(),
          sibling: (
            await readFile(join(sibling, "sentinel.txt"), "utf8")
          ).trim(),
        }),
      };
    },
    async dispose() {},
  };
}
