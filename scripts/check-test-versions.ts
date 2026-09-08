import { execFileSync } from "node:child_process";
import { join, relative } from "node:path";
import { root, tests } from "../packages/core/src/catalog.ts";
import { TestDefinition } from "../packages/schema/src/index.ts";

export function changedSemantics(
  before: TestDefinition,
  after: TestDefinition,
  paths: string[],
  directory: string,
) {
  const category = directory.split("/").slice(0, 2).join("/");
  return (
    before.prompt !== after.prompt ||
    JSON.stringify(before.expected) !== JSON.stringify(after.expected) ||
    before.capability !== after.capability ||
    paths.some(
      (path) =>
        path.startsWith(`${directory}/fixture/`) ||
        path === `${directory}/evaluate.ts` ||
        (path.startsWith(`${category}/`) &&
          path.split("/").length === 3 &&
          path.endsWith(".ts")),
    )
  );
}
if (import.meta.main) {
  const base = process.argv[2];
  if (!base || !/^[a-f0-9]{40}$/.test(base))
    throw new Error("Provide a full base commit SHA");
  const git = (...args: string[]) =>
    execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  const paths = git("diff", "--name-only", "-z", base, "HEAD", "--", "tests")
    .split("\0")
    .filter(Boolean);
  for (const current of await tests()) {
    const directory = relative(root, current.directory).replaceAll("\\", "/");
    let previous: TestDefinition;
    try {
      previous = TestDefinition.parse(
        Bun.YAML.parse(git("show", `${base}:${directory}/test.yaml`)),
      );
    } catch {
      continue;
    } // New tests have no previous definition.
    if (!changedSemantics(previous, current.definition, paths, directory))
      continue;
    if (previous.version === current.definition.version)
      throw new Error(`Bump the version of ${previous.id}`);
    const archive = TestDefinition.parse(
      await Bun.file(
        join(root, "tests/history", `${previous.id}-${previous.version}.json`),
      ).json(),
    );
    if (JSON.stringify(archive) !== JSON.stringify(previous))
      throw new Error(
        `Archive the original definition of ${previous.id}@${previous.version}`,
      );
  }
  console.log("Changed test versions verified.");
}
