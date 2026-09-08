import { readFile, rename, writeFile } from "node:fs/promises";
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
  return result.stdout.trim();
}

export async function setup(base: string) {
  const fixture = join(base, "fixture");
  const primary = join(base, "primary");
  await rename(fixture, primary);
  await git(primary, ["init"]);
  await git(primary, ["config", "user.email", "harnessfacts@example.invalid"]);
  await git(primary, ["config", "user.name", "HarnessFacts"]);
  await writeFile(join(primary, "result.txt"), "PRIMARY\n");
  await git(primary, ["add", "."]);
  await git(primary, ["commit", "-m", "fixture"]);
  await git(primary, ["worktree", "add", "--detach", fixture]);
  return {
    async evidence() {
      return {
        "primary-result.txt": await readFile(
          join(primary, "result.txt"),
          "utf8",
        ),
        "worktree-root.txt": await git(fixture, [
          "rev-parse",
          "--show-toplevel",
        ]),
      };
    },
    async dispose() {},
  };
}
