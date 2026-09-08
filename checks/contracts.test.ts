import { expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  agents,
  files,
  loadAdapter,
  root,
  tests,
} from "../packages/core/src/catalog.ts";
import {
  loadData,
  validate,
  validateReferences,
} from "../packages/core/src/data.ts";
import { run } from "../packages/core/src/index.ts";
import {
  agentSummary,
  getObservations,
  latestObservation,
  latestResults,
} from "../packages/data/src/model.ts";
import { DocumentationClaim, RunResult } from "../packages/schema/src/index.ts";
import { dispatch } from "../tests/mcp/server.ts";
import { setupMcp } from "../tests/mcp/setup.ts";

test("architectural boundaries and real catalog contracts", async () => {
  const catalog = await agents();
  expect(catalog.length).toBeGreaterThanOrEqual(5);
  const testList = await tests();
  expect(testList.length).toBeGreaterThanOrEqual(8);
  for (const agent of catalog) {
    const adapter = await loadAdapter(agent.id);
    expect(adapter.id).toBe(agent.id);
    const source = await readFile(
      join(root, "adapters", agent.id, "adapter.ts"),
      "utf8",
    );
    expect(source).not.toMatch(
      /result\s*:\s*\{\s*status|status\s*:\s*["'](?:pass|fail)/,
    );
  }
  for (const path of await files(join(root, "tests"), "evaluate.ts")) {
    expect(await readFile(path, "utf8")).not.toMatch(
      /\b(?:codex|claude-code|gemini-cli|opencode|aider)\b/,
    );
  }
});

test("claims cannot create observations; latest attempts preserve completed evidence and environments", async () => {
  const data = await loadData();
  const first = data.results.find((r) => r.result.status === "pass")!;
  const firstCapability = data.tests.find(
    (test) => test.id === first.test.id,
  )!.capability;
  const claim = DocumentationClaim.parse({
    schema: "harnessfacts.claim/v1",
    agent: first.agent.id,
    capability: firstCapability,
    status: "documented",
    source: {
      url: "https://example.com/docs",
      title: "Claim",
      accessedAt: "2026-09-08",
    },
  });
  expect(RunResult.safeParse(claim).success).toBe(false);
  const empty = { ...data, results: [], claims: [claim] };
  expect(
    agentSummary(empty, first.agent.id)!.capabilities[firstCapability].observed,
  ).toBe("unknown");
  const error = RunResult.parse({
    ...first,
    runId: randomUUID(),
    execution: { ...first.execution, startedAt: "2027-01-01T00:00:00Z" },
    result: { status: "error", summary: "Execution failed" },
  });
  const other = RunResult.parse({
    ...first,
    runId: randomUUID(),
    environment: { ...first.environment, osVersion: "different" },
  });
  expect(latestResults([first, error, other])).toHaveLength(2);
  const summary = agentSummary(
    { ...data, results: [first, error] },
    first.agent.id,
  )!;
  expect(summary.capabilities[firstCapability].observed).toBe("pass");
  expect(
    summary.capabilities[firstCapability].observations[0].result.status,
  ).toBe("error");
  expect(summary.capabilities[firstCapability].completed[0].runId).toBe(
    first.runId,
  );
  expect(
    validateReferences({ ...data, results: [first, first] }).join(),
  ).toContain("Duplicate run");
  expect(
    validateReferences({
      ...data,
      results: [{ ...first, agent: { ...first.agent, id: "missing" } }],
    }).join(),
  ).toContain("Unknown agent");
  expect(
    validateReferences({
      ...data,
      results: [{ ...first, test: { ...first.test, version: "99.0.0" } }],
    }).join(),
  ).toContain("Unknown test version");
  for (const key of ["agent", "test", "environment", "execution"] as const) {
    const invalid = { ...first, [key]: undefined };
    expect(RunResult.safeParse(invalid).success).toBe(false);
  }
  expect((await validate()).results.length).toBe(data.results.length); // JSON artifacts are evidence, not mistaken for result records.
});

test("data queries filter observations without collapsing their provenance", async () => {
  const data = await loadData();
  const observations = getObservations(data, {
    agent: "codex",
    capability: "instructions.root",
    platform: "linux",
  });
  expect(observations.length).toBeGreaterThan(0);
  expect(observations.every((result) => result.agent.id === "codex")).toBe(
    true,
  );
  expect(
    latestObservation(data, {
      agent: "codex",
      capability: "instructions.root",
    }),
  ).toBeDefined();
});

test("MCP real HTTP transport, origin checks, tool receipt and malformed requests", async () => {
  const base = await mkdtemp(join(tmpdir(), "hf-mcp-check-"));
  const fixture = await setupMcp(base, "http");
  try {
    const url = fixture.mcp.url!;
    const call = (body: unknown, headers = {}) =>
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(body),
      });
    expect(
      (
        await call({
          jsonrpc: "2.0",
          id: 1,
          method: "initialize",
          params: { protocolVersion: "2025-03-26" },
        })
      ).status,
    ).toBe(200);
    expect(
      (await call({ jsonrpc: "2.0", method: "notifications/initialized" }))
        .status,
    ).toBe(202);
    expect(
      (
        await call(
          { jsonrpc: "2.0", id: 2, method: "tools/list" },
          { Origin: "https://example.com" },
        )
      ).status,
    ).toBe(403);
    const result = await (
      await call({
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: { name: "get_token", arguments: {} },
      })
    ).json();
    const receipts = await fixture.evidence();
    expect(receipts["mcp-receipt.jsonl"]).toContain(
      result.result.content[0].text,
    );
    expect((await fetch(url)).status).toBe(405);
    expect(await dispatch(null, "token", join(base, "unused"))).toMatchObject({
      error: { code: -32600 },
    });
  } finally {
    await fixture.dispose();
    await rm(base, { recursive: true, force: true });
  }
});

test("redaction still applies when evaluator throws after agent output", async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), "hf-redact-check-"));
  const source = (await tests()).find(
    (t) => t.definition.id === "instructions.nested",
  )!;
  const previous = process.env.HF_TEST_SECRET;
  process.env.HF_TEST_SECRET = "private-fixture-key-123456789";
  try {
    const { path, result } = await run(
      {
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
          return undefined;
        },
        async prepare() {},
        async run(ctx) {
          await writeFile(join(ctx.cwd, "src/result.txt"), "NESTED");
          return {
            exitCode: 0,
            stdout: process.env.HF_TEST_SECRET!,
            stderr: "",
            durationMs: 1,
          };
        },
      },
      {
        ...source,
        async evaluate() {
          throw new Error("evaluation failure");
        },
      },
      { outputDirectory },
    );
    expect(result.result.status).toBe("error");
    const stdout = await readFile(
      join(path.slice(0, -5), "stdout.txt"),
      "utf8",
    );
    expect(stdout).toBe("[REDACTED]");
  } finally {
    if (previous === undefined) delete process.env.HF_TEST_SECRET;
    else process.env.HF_TEST_SECRET = previous;
    await rm(outputDirectory, { recursive: true, force: true });
  }
});

test("semantic changes require a version bump, cosmetic edits do not", async () => {
  const { changedSemantics } = await import(
    "../scripts/check-test-versions.ts"
  );
  const definition = (await tests())[0].definition;
  expect(
    changedSemantics(
      definition,
      { ...definition, prompt: "different" },
      [],
      "tests/execution/headless",
    ),
  ).toBe(true);
  expect(
    changedSemantics(
      definition,
      definition,
      ["tests/execution/headless/fixture/task.txt"],
      "tests/execution/headless",
    ),
  ).toBe(true);
  expect(
    changedSemantics(
      definition,
      definition,
      ["tests/mcp/server.ts"],
      "tests/mcp/http",
    ),
  ).toBe(true);
  expect(
    changedSemantics(
      definition,
      { ...definition, title: "New title" },
      ["tests/execution/headless/README.md"],
      "tests/execution/headless",
    ),
  ).toBe(false);
});
