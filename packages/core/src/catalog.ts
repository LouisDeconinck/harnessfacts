import { readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { AgentDefinition, TestDefinition } from "../../schema/src/index.ts";
import type { AgentAdapter, ConformanceTest } from "./types.ts";
export const root = fileURLToPath(new URL("../../../", import.meta.url));
export const resultsRoot = resolve(
  process.env.HARNESSFACTS_RESULTS_DIR || join(process.cwd(), "results"),
);
export async function files(
  directory: string,
  suffix: string,
): Promise<string[]> {
  const out: string[] = [];
  let entries: import("node:fs").Dirent[];
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) out.push(...(await files(path, suffix)));
    else if (entry.isFile() && entry.name.endsWith(suffix)) out.push(path);
  }
  return out.sort();
}
export async function agents() {
  return Promise.all(
    (await files(join(root, "adapters"), "metadata.yaml")).map(async (path) =>
      AgentDefinition.parse(Bun.YAML.parse(await Bun.file(path).text())),
    ),
  );
}
export async function tests(): Promise<ConformanceTest[]> {
  return Promise.all(
    (await files(join(root, "tests"), "test.yaml")).map(async (path) => ({
      definition: TestDefinition.parse(
        Bun.YAML.parse(await Bun.file(path).text()),
      ),
      directory: dirname(path),
      setup: (
        await import(pathToFileURL(join(dirname(path), "evaluate.ts")).href)
      ).setup,
      evaluate: (
        await import(pathToFileURL(join(dirname(path), "evaluate.ts")).href)
      ).evaluate,
    })),
  );
}
export async function loadAdapter(id: string): Promise<AgentAdapter> {
  if (!(await agents()).some((agent) => agent.id === id))
    throw new Error(`Unknown agent: ${id}`);
  return (
    await import(pathToFileURL(join(root, "adapters", id, "adapter.ts")).href)
  ).adapter;
}
