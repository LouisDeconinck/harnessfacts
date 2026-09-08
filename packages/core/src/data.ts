import { readFile } from "node:fs/promises";
import { dirname, join, relative, sep } from "node:path";
import {
  CapabilityDefinition,
  DocumentationClaim,
  RunResult,
  TestDefinition,
} from "../../schema/src/index.ts";
import { agents, files, resultsRoot, root, tests } from "./catalog.ts";
import { readArtifact, sha256 } from "./index.ts";

async function resultFiles() {
  return (await files(resultsRoot, ".json")).filter(
    (path) => !relative(resultsRoot, path).split(sep).includes("artifacts"),
  );
}
export async function loadData() {
  const agentList = await agents(),
    testList = await tests();
  const catalog = JSON.parse(
    await readFile(join(root, "packages/data/capabilities.json"), "utf8"),
  );
  if (catalog.schema !== "harnessfacts.capabilities/v1")
    throw new Error("Invalid capability catalog version");
  const capabilities = (catalog.capabilities as unknown[]).map((value) =>
    CapabilityDefinition.parse(value),
  );
  const claims = await Promise.all(
    (await files(join(root, "claims"), ".yaml")).map(async (path) =>
      DocumentationClaim.parse(Bun.YAML.parse(await Bun.file(path).text())),
    ),
  );
  const results = await Promise.all(
    (await resultFiles()).map(async (path) =>
      RunResult.parse(await Bun.file(path).json()),
    ),
  );
  const testHistory = await Promise.all(
    (await files(join(root, "tests/history"), ".json")).map(async (path) =>
      TestDefinition.parse(await Bun.file(path).json()),
    ),
  );
  return {
    testHistory,
    schema: "harnessfacts.data/v1" as const,
    agents: agentList,
    tests: testList.map((test) => test.definition),
    capabilities,
    claims,
    results,
  };
}
export function validateReferences(data: Awaited<ReturnType<typeof loadData>>) {
  const errors: string[] = [];
  for (const [label, entries] of [
    ["agent", data.agents],
    ["test", data.tests],
    ["capability", data.capabilities],
  ] as const) {
    const ids = new Set<string>();
    for (const item of entries) {
      if (ids.has(item.id)) errors.push(`Duplicate ${label}: ${item.id}`);
      ids.add(item.id);
    }
  }
  const agents = new Set(data.agents.map((a) => a.id)),
    capabilities = new Set(data.capabilities.map((c) => c.id));
  const versions = new Map(data.tests.map((t) => [t.id, new Set([t.version])]));
  for (const old of data.testHistory) {
    if (!versions.has(old.id))
      errors.push(`Unknown historical test: ${old.id}`);
    else {
      const known = versions.get(old.id)!;
      if (known.has(old.version))
        errors.push(`Duplicate test version: ${old.id}@${old.version}`);
      known.add(old.version);
    }
  }
  const runs = new Set<string>();
  for (const test of data.tests)
    if (!capabilities.has(test.capability))
      errors.push(`Unknown capability: ${test.capability}`);
  for (const result of data.results) {
    if (runs.has(result.runId)) errors.push(`Duplicate run: ${result.runId}`);
    runs.add(result.runId);
    if (!agents.has(result.agent.id))
      errors.push(`Unknown agent: ${result.agent.id}`);
    if (!versions.has(result.test.id))
      errors.push(`Unknown test: ${result.test.id}`);
    else if (!versions.get(result.test.id)?.has(result.test.version))
      errors.push(
        `Unknown test version: ${result.test.id}@${result.test.version}`,
      );
  }
  const claimKeys = new Set<string>();
  for (const claim of data.claims) {
    if (!agents.has(claim.agent) || !capabilities.has(claim.capability))
      errors.push(
        `Invalid claim reference: ${claim.agent}/${claim.capability}`,
      );
    const key = `${claim.agent}/${claim.capability}/${claim.source.url}`;
    if (claimKeys.has(key)) errors.push(`Duplicate claim: ${key}`);
    claimKeys.add(key);
  }
  return errors;
}
export async function validate() {
  const data = await loadData();
  const errors = validateReferences(data);
  for (const path of await resultFiles()) {
    const result = RunResult.parse(await Bun.file(path).json());
    const evidence = join(dirname(path), result.runId);
    const expected = join(
      resultsRoot,
      result.agent.id,
      result.agent.version,
      `${result.environment.os}-${result.environment.arch}`,
      result.test.id,
      `${result.runId}.json`,
    );
    if (expected !== path) errors.push(`Unexpected result location: ${path}`);
    for (const [name, hash] of [
      ["stdout.txt", result.evidence.stdoutSha256],
      ["stderr.txt", result.evidence.stderrSha256],
      ...result.evidence.artifacts.map((a) => [
        `artifacts/${a.path}`,
        a.sha256,
      ]),
    ]) {
      try {
        const value = await readArtifact(evidence, name);
        if (value === null || sha256(value) !== hash)
          errors.push(`Evidence hash mismatch: ${result.runId}/${name}`);
      } catch {
        errors.push(`Invalid evidence: ${result.runId}/${name}`);
      }
    }
  }
  if (errors.length) throw new Error(errors.join("\n"));
  return data;
}
