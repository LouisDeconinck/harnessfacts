import { chmod, cp, mkdir, readFile, rm } from "node:fs/promises";
import { join, relative } from "node:path";
import { files, root, tests } from "../packages/core/src/catalog.ts";
import { validate } from "../packages/core/src/data.ts";

import { buildDataTypes } from "./data-types.ts";

const data = await validate();
await rm(join(root, "packages/data/dist"), { recursive: true, force: true });
await buildDataTypes();
await Bun.write(
  join(root, "packages/data/src/generated.json"),
  `${JSON.stringify(data, null, 2)}\n`,
);
await mkdir(join(root, "packages/data/dist"), { recursive: true });
const build = await Bun.build({
  entrypoints: [join(root, "packages/data/src/index.ts")],
  outdir: join(root, "packages/data/dist"),
  target: "browser",
  format: "esm",
  minify: false,
});
if (!build.success) throw new Error(build.logs.join("\n"));
await Bun.write(
  join(root, "packages/data/dist/data.json"),
  `${JSON.stringify(data, null, 2)}\n`,
);
const sources = await Promise.all(
  (await tests()).map(async (test) => ({
    id: test.definition.id,
    files: await Promise.all(
      (await files(join(test.directory, "fixture"), "")).map(async (path) => ({
        path: relative(join(test.directory, "fixture"), path),
        text: await readFile(path, "utf8"),
      })),
    ),
    evaluator: await readFile(join(test.directory, "evaluate.ts"), "utf8"),
  })),
);
await Bun.write(
  join(root, "apps/web/src/fixtures.json"),
  JSON.stringify(
    { schema: "harnessfacts.fixture-sources/v1", tests: sources },
    null,
    2,
  ),
);
const distribution = join(root, "packages/cli/dist");
await rm(distribution, { recursive: true, force: true });
for (const path of [
  "adapters",
  "tests",
  "claims",
  "packages/core/src",
  "packages/schema/src",
  "packages/data/src/model.ts",
  "packages/data/capabilities.json",
  "packages/cli/src",
]) {
  await mkdir(join(distribution, path, ".."), { recursive: true });
  await cp(join(root, path), join(distribution, path), { recursive: true });
}
await chmod(join(distribution, "packages/cli/src/index.ts"), 0o755);
for (const pkg of ["cli", "data"]) {
  await cp(join(root, "LICENSE"), join(root, `packages/${pkg}/LICENSE`));
  await cp(join(root, "README.md"), join(root, `packages/${pkg}/README.md`));
}
if (await Bun.file(join(root, "apps/web/package.json")).exists()) {
  await rm(join(root, "apps/web/public/results"), {
    recursive: true,
    force: true,
  });
  await cp(join(root, "results"), join(root, "apps/web/public/results"), {
    recursive: true,
  });
  const child = Bun.spawn(
    ["bun", "run", "--cwd", join(root, "apps/web"), "build"],
    { stdout: "inherit", stderr: "inherit" },
  );
  if ((await child.exited) !== 0) throw new Error("Website build failed");
}
console.log(
  `Built data: ${data.agents.length} agents, ${data.tests.length} tests, ${data.results.length} runs.`,
);
